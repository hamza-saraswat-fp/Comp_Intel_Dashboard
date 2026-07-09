// Version the 30 gold questions as a Braintrust dataset (IAI-274). The experiment runner
// uses the same local `cases()` (byte-identical), so this is for platform lineage /
// future dataset-backed runs and human review of the golden set.
// Run: npx tsx bt/push-dataset.ts   (needs BRAINTRUST_API_KEY in .env)
import 'dotenv/config';
import { initDataset } from 'braintrust';
import { cases } from './data.ts';

const ds = initDataset('Ask Intel', { dataset: 'ask-intel-golden' });
const rows = cases();
for (const c of rows) {
  ds.insert({
    id: c.metadata.id,
    input: c.input,
    expected: c.expected,
    metadata: c.metadata as unknown as Record<string, unknown>,
  });
}
await ds.flush();
console.log(`pushed ${rows.length} cases to dataset "ask-intel-golden" (project "Ask Intel")`);
