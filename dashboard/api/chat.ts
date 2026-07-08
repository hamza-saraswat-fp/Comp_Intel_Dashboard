// Ask Intel chat endpoint (IAI-266 + IAI-267).
//
// Full-context retrieval: the whole OKF markdown knowledge base rides in a cached system
// prompt, the model streams the answer, and the finished transcript is persisted to Supabase
// for the recent-chats list. This route is gated by dashboard/middleware.ts (the ci_gate
// cookie), so an unauthenticated POST hits the sign-in page and never reaches the model — no
// auth logic belongs here.
//
// Models run through OpenRouter so we can swap them with the CHAT_MODEL env var alone (any
// OpenRouter slug, e.g. anthropic/claude-sonnet-4.5, openai/gpt-4o, google/gemini-2.5-pro),
// no code change. Prompt caching (the cost lever behind full-context) is enabled via
// OpenRouter's cache_control; it applies to Anthropic models and is ignored by others.
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { INTEL_PACK } from './_intel-pack';
import { SYSTEM_RULES, PREAMBLE } from './_prompt';
import { saveChat } from './_supabase';

export const config = { maxDuration: 60 };

const SYSTEM = SYSTEM_RULES + PREAMBLE + INTEL_PACK;
const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

function firstUserText(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === 'user');
  const text = (first?.parts ?? [])
    .map((p) => (p.type === 'text' ? p.text : ''))
    .join(' ')
    .trim();
  return text.slice(0, 80) || 'New chat';
}

export async function POST(req: Request): Promise<Response> {
  const { id, messages } = (await req.json()) as { id: string; messages: UIMessage[] };
  const modelMessages = await convertToModelMessages(messages);

  // Swap models via CHAT_MODEL (any OpenRouter slug). For Anthropic models we enable prompt
  // caching AND pin the upstream to Anthropic, so the cached ~108K-token system prefix is
  // actually reused across a session (verified: cold ~$0.28, warm ~$0.03). Without the pin,
  // OpenRouter load-balances across upstreams and the cache never hits. Other providers fall
  // through to their own default caching.
  const model = process.env.CHAT_MODEL ?? 'anthropic/claude-sonnet-5';
  const anthropicCaching = model.startsWith('anthropic/');

  const result = streamText({
    model: openrouter(model),
    system: SYSTEM,
    messages: modelMessages,
    ...(anthropicCaching
      ? {
          providerOptions: {
            openrouter: { cache_control: { type: 'ephemeral' }, provider: { order: ['anthropic'] } },
          },
        }
      : {}),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: ({ messages }) => {
      // Fire-and-forget; a DB hiccup must not fail the stream.
      void saveChat({ id, title: firstUserText(messages), messages });
    },
  });
}
