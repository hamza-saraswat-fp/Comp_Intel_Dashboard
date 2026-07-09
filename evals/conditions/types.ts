import type { AnswerResult } from '../lib/anthropic.ts';
import type { GoldQuestion, ManifestDoc, Scale } from '../lib/types.ts';

export interface ConditionRun {
  answer: AnswerResult;
  tokensProvidedToModel: number; // static prefix + retrieved content put in front of the model
}

export interface Condition {
  id: 'A' | 'B' | 'C';
  /** Called once per (scale) cell before questions run. */
  prepare(docs: ManifestDoc[]): Promise<void>;
  /** Answer one question. `coldNonce` busts the prompt cache for designated cold samples. */
  ask(q: GoldQuestion, scale: Scale, coldNonce?: string): Promise<ConditionRun>;
}
