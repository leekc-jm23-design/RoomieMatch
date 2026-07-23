const test = require('node:test');
const assert = require('node:assert/strict');
const { createEmptyStateMessage } = require('../public/search-utils.js');

test('returns the campus-specific empty message when a campus filter yields no listings', () => {
  const message = createEmptyStateMessage({
    listings: [],
    campus: 'Penang Branch Campus',
    query: '',
  });

  assert.equal(message, 'No room listings found for this campus. Please try another location.');
});

test('falls back to the generic empty message for a blank campus selection', () => {
  const message = createEmptyStateMessage({
    listings: [],
    campus: '',
    query: '',
  });

  assert.equal(message, 'No rooms matched your search yet. Try another campus or keyword.');
});
