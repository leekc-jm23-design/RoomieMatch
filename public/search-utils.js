function createEmptyStateMessage({ listings, campus }) {
  if (!listings.length && campus) {
    return 'No room listings found for this campus. Please try another location.';
  }

  return 'No rooms matched your search yet. Try another campus or keyword.';
}

(function (root, factory) {
  const api = factory();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.createEmptyStateMessage = api.createEmptyStateMessage;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  return {
    createEmptyStateMessage,
  };
});
