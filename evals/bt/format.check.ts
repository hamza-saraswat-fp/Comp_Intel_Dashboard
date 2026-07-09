// Unit checks for the deterministic dash normalizer. Run: npx tsx bt/format.check.ts
import { stripDashes, deformatTransform } from '../../dashboard/api/_format.ts';

let fails = 0;
function eq(got: string, want: string, label: string) {
  const ok = got === want;
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n   got:  ${JSON.stringify(got)}\n   want: ${JSON.stringify(want)}`}`);
}

// --- stripDashes ---
eq(stripDashes('revenue — not just drive time'), 'revenue, not just drive time', 'em-dash spaced');
eq(stripDashes('a—b'), 'a, b', 'em-dash unspaced');
eq(stripDashes('billed at 10–20 dollars'), 'billed at 10–20 dollars', 'numeric en-dash range kept');
eq(stripDashes('the plan – a good one – ships'), 'the plan, a good one, ships', 'spaced en-dash -> comma');
eq(stripDashes('see [AI — Voice](https://x.com/a—b) now'), 'see [AI, Voice](https://x.com/a—b) now', 'URL preserved, link text normalized');
eq(stripDashes('run `x — y` inline'), 'run `x — y` inline', 'inline code preserved');
eq(stripDashes('no dashes here'), 'no dashes here', 'no-op when clean');

// --- deformatTransform (chunk-boundary safety) ---
async function runTransform(chunks: string[]): Promise<string> {
  const t = deformatTransform()();
  const writer = t.writable.getWriter();
  const reader = t.readable.getReader();
  let out = '';
  const pump = (async () => {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if ((value as { type: string }).type === 'text-delta') out += (value as { text: string }).text;
    }
  })();
  for (const c of chunks) await writer.write({ type: 'text-delta', id: '1', text: c } as never);
  await writer.close();
  await pump;
  return out;
}

eq(await runTransform(['revenue —', ' not']), 'revenue, not', 'transform boundary: "revenue —" | " not"');
eq(await runTransform(['re', 'venue — not']), 'revenue, not', 'transform boundary: "re" | "venue — not"');
eq(await runTransform(['a — b — c']), 'a, b, c', 'transform single chunk, multiple');
eq(await runTransform(['price ', '10–20 range']), 'price 10–20 range', 'transform leaves numeric range');
// En-dash straddling a chunk boundary (regression: the word before the dash flushes first,
// so the rule must not require a left-neighbor). Mirrors real leaks in q02/q26.
eq(await runTransform(['**Jobber** –', ' 6 field types']), '**Jobber**, 6 field types', 'transform boundary: en-dash after flushed word');
eq(await runTransform(['Receptionist –', ' powered by AI']), 'Receptionist, powered by AI', 'transform boundary: en-dash in link label');
eq(await runTransform(['a –', ' b']), 'a, b', 'transform boundary: "a –" | " b"');
eq(await runTransform(['a ', '– b']), 'a, b', 'transform boundary: "a " | "– b"');

console.log(fails ? `\n❌ ${fails} FAILURE(S)` : '\n✅ ALL PASS');
if (fails) process.exit(1);
