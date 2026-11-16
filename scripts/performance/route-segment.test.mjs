import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeRouteSegment } from '../../src/lib/locales.ts';

test('Arabic links yield the same API segment in page and metadata renders', () => {
  const slug = 'الإطارات';
  for (const param of [slug, encodeURIComponent(slug)]) {
    assert.equal(encodeURIComponent(decodeRouteSegment(param)), encodeURIComponent(slug));
  }
});
test('English and malformed percent sequences remain usable', () => {
  assert.equal(decodeRouteSegment('choosing-the-right-tires'), 'choosing-the-right-tires');
  assert.equal(decodeRouteSegment('100%'), '100%');
});
test('Decode only once; encoding the result keeps it in one URL segment', () => {
  assert.equal(decodeRouteSegment('%252F'), '%2F');
  assert.equal(encodeURIComponent(decodeRouteSegment('a%2Fb')), 'a%2Fb');
});
