// Deterministic output normalization for the Ask Intel chat.
//
// Claude ignores the prompt's "no em-dashes" rule ~90% of the time (em-dashes are
// entrenched by markdown-heavy pretraining + RLHF), so we enforce the FieldPulse style
// downstream instead of leaning on the prompt: em-dashes and spaced en-dashes become
// commas. Applied at the SOURCE via streamText's `experimental_transform`, so the
// streaming prod chat (chat.ts) and the eval (evals/bt/task.ts) emit identical clean text.
// Punctuation only, zero effect on the answer's facts. Code spans, URLs, and numeric
// ranges (10-20) are left untouched.
import type { TextStreamPart, ToolSet } from 'ai';

const CODE_FENCE = /```[\s\S]*?```/g;
const INLINE_CODE = /`[^`]*`/g;
const URL = /https?:\/\/[^\s)]+/g;
const SENTINEL = /\x1f(\d+)\x1f/g;

/** Normalize dashes to FieldPulse-sanctioned commas, leaving code, URLs, and ranges alone. */
export function stripDashes(text: string): string {
  if (!text.includes('—') && !text.includes('–')) return text;

  // Protect code + URLs (swap for \x1fN\x1f sentinels that can't occur in real text).
  const saved: string[] = [];
  const stash = (m: string) => `\x1f${saved.push(m) - 1}\x1f`;
  let out = text.replace(CODE_FENCE, stash).replace(INLINE_CODE, stash).replace(URL, stash);

  out = out
    .replace(/[ \t]*—[ \t]*/g, ', ') // em-dash (spaced or not) -> comma
    .replace(/[ \t]+–[ \t]+/g, ', ') // spaced en-dash -> comma; leaves 10-20 ranges (no spaces).
    // NB: no non-space neighbor is required, so a spaced en-dash still normalizes when the
    // streaming transform has already flushed the word before it in an earlier chunk.
    .replace(/,\s*,/g, ','); // collapse any accidental double comma

  return out.replace(SENTINEL, (_m, i) => saved[Number(i)]);
}

type Part = TextStreamPart<ToolSet>;

/**
 * A `streamText` `experimental_transform` that applies `stripDashes` to the streamed text.
 * It holds back any trailing whitespace/dash run so a dash region that straddles a chunk
 * boundary is never emitted half-normalized (e.g. "revenue —" | " not" -> "revenue, not").
 */
export function deformatTransform() {
  return () => {
    let carry = '';
    let lastId = '';
    const flushCarry = (controller: TransformStreamDefaultController<Part>) => {
      if (!carry) return;
      controller.enqueue({ type: 'text-delta', id: lastId, text: stripDashes(carry) } as Part);
      carry = '';
    };
    return new TransformStream<Part, Part>({
      transform(part, controller) {
        if (part.type === 'text-delta') {
          lastId = part.id;
          const buf = carry + part.text;
          const held = buf.match(/[\s—–]+$/); // trailing ws/dashes may extend into the next chunk
          const cut = held ? buf.length - held[0].length : buf.length;
          const settled = buf.slice(0, cut);
          carry = buf.slice(cut);
          if (settled) controller.enqueue({ ...part, text: stripDashes(settled) });
        } else {
          flushCarry(controller);
          controller.enqueue(part);
        }
      },
      flush(controller) {
        flushCarry(controller);
      },
    });
  };
}
