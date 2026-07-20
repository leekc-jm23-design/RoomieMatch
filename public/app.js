const campusFilter = document.getElementById('campus-filter');
const queryInput = document.getElementById('query-input');
const autocompleteList = document.getElementById('autocomplete');
const resultsList = document.getElementById('results-list');
const resultsSummary = document.getElementById('results-summary');
const searchForm = document.getElementById('search-form');
let searchTimeout;
let suggestions = [];

async function loadCampuses() {
  const response = await fetch('/api/campuses');
  const data = await response.json();

  campusFilter.innerHTML = '<option value="">All campuses</option>';
  data.campuses.forEach((campus) => {
    const option = document.createElement('option');
    option.value = campus;
    option.textContent = campus;
    campusFilter.appendChild(option);
  });
}

async function loadSuggestions() {
  const response = await fetch('/api/listings');
  const data = await response.json();

  const uniqueItems = new Set();
  data.listings.forEach((listing) => {
    uniqueItems.add(listing.title);
    uniqueItems.add(listing.roomType);
    listing.description
      .split(/[.,]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => uniqueItems.add(part));
  });

  suggestions = Array.from(uniqueItems).sort((a, b) => a.localeCompare(b));
}

async function searchListings(event) {
  event?.preventDefault();

  const campus = campusFilter.value;
  const query = queryInput.value.trim();

  const response = await fetch(`/api/listings?campus=${encodeURIComponent(campus)}&query=${encodeURIComponent(query)}`);
  const data = await response.json();

  renderResults(data.listings);
  resultsSummary.textContent = `${data.listings.length} listing${data.listings.length === 1 ? '' : 's'} found`;
}

function renderResults(listings) {
  if (!listings.length) {
    resultsList.innerHTML = '<div class="empty">No rooms matched your search yet. Try another campus or keyword.</div>';
    return;
  }

  resultsList.innerHTML = listings
    .map(
      (listing) => `
        <article class="card">
          <h3>${listing.title}</h3>
          <p class="meta">${listing.campus} · ${listing.distanceKm} km away · ${listing.roomType}</p>
          <p>${listing.description}</p>
          <p class="meta">Price: $${listing.price}/month</p>
        </article>
      `
    )
    .join('');
}

function updateAutocomplete(query) {
  const normalizedQuery = query.toLowerCase();

  if (!normalizedQuery) {
    hideAutocomplete();
    return;
  }

  const matched = suggestions
    .filter((item) => item.toLowerCase().includes(normalizedQuery))
    .slice(0, 6);

  if (!matched.length) {
    hideAutocomplete();
    return;
  }

  autocompleteList.innerHTML = matched
    .map((item) => `<div class="autocomplete-item" data-value="${item}">${item}</div>`)
    .join('');
  autocompleteList.hidden = false;
}

function hideAutocomplete() {
  autocompleteList.hidden = true;
  autocompleteList.innerHTML = '';
}

function selectAutocompleteValue(value) {
  queryInput.value = value;
  hideAutocomplete();
  searchListings();
}

searchForm.addEventListener('submit', searchListings);
queryInput.addEventListener('input', () => {
  const query = queryInput.value.trim();
  updateAutocomplete(query);
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => searchListings(), 250);
});

autocompleteList.addEventListener('click', (event) => {
  const target = event.target.closest('.autocomplete-item');
  if (target) {
    selectAutocompleteValue(target.dataset.value);
  }
});

queryInput.addEventListener('blur', () => {
  setTimeout(hideAutocomplete, 150);
});

window.addEventListener('DOMContentLoaded', async () => {
  await loadCampuses();
  await loadSuggestions();
  await searchListings();
});
