import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from './translations';

function flattenStrings(obj: unknown, prefix = ''): Array<[string, string]> {
  if (typeof obj === 'string') {
    return [[prefix, obj]];
  }
  if (obj && typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
      flattenStrings(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [];
}

const EMOJI_PATTERN = /\p{Extended_Pictographic}/u;

test('all 3 languages (en, ru, az) have complete key parity and non-empty strings', () => {
  const enEntries = flattenStrings(TRANSLATIONS.en);
  const enKeys = enEntries.map(([k]) => k).sort();

  for (const lang of SUPPORTED_LANGUAGES) {
    const entries = flattenStrings(TRANSLATIONS[lang]);
    const keys = entries.map(([k]) => k).sort();
    assert.deepEqual(keys, enKeys, `Key mismatch for language ${lang}`);

    for (const [key, value] of entries) {
      assert.ok(value.trim().length > 0, `Empty translation for ${lang}.${key}`);
      assert.equal(
        EMOJI_PATTERN.test(value),
        false,
        `Forbidden Unicode emoji detected in ${lang}.${key}: ${value}`,
      );
    }
  }
});
