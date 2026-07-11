const campusFilter = document.getElementById('campus-filter');
const queryInput = document.getElementById('query-input');
const resultsList = document.getElementById('results-list');
const resultsSummary = document.getElementById('results-summary');
const searchForm = document.getElementById('search-form');

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

searchForm.addEventListener('submit', searchListings);

window.addEventListener('DOMContentLoaded', async () => {
  await loadCampuses();
  await searchListings();
});
