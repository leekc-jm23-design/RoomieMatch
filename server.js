const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const dataFile = path.join(rootDir, 'data', 'listings.txt');

function parseListings() {
  const raw = fs.readFileSync(dataFile, 'utf8');
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, title, campus, distanceKm, price, roomType, description] = line.split('|');
      return {
        id,
        title,
        campus,
        distanceKm: Number(distanceKm),
        price: Number(price),
        roomType,
        description,
      };
    });
}

function getCampuses(listings) {
  return Array.from(new Set([...listings.map((listing) => listing.campus), 'Penang Branch Campus'])).sort();
}

function filterListings(listings, campus, query) {
  const normalizedCampus = campus ? campus.toLowerCase() : '';
  const normalizedQuery = query ? query.toLowerCase() : '';

  return listings.filter((listing) => {
    const campusMatch = !normalizedCampus || listing.campus.toLowerCase() === normalizedCampus;
    const queryMatch =
      !normalizedQuery ||
      [listing.title, listing.description, listing.campus, listing.roomType]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);

    return campusMatch && queryMatch;
  });
}

function serveFile(filePath, contentType, res) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Server error');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = requestUrl.pathname;

  if (pathname === '/api/listings') {
    const listings = parseListings();
    const campus = requestUrl.searchParams.get('campus') || '';
    const query = requestUrl.searchParams.get('query') || '';
    const filtered = filterListings(listings, campus, query);

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ listings: filtered, campuses: getCampuses(listings) }));
    return;
  }

  if (pathname === '/api/campuses') {
    const listings = parseListings();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ campuses: getCampuses(listings) }));
    return;
  }

  if (pathname === '/') {
    serveFile(path.join(rootDir, 'public', 'index.html'), 'text/html; charset=utf-8', res);
    return;
  }

  if (pathname === '/styles.css') {
    serveFile(path.join(rootDir, 'public', 'styles.css'), 'text/css; charset=utf-8', res);
    return;
  }

  if (pathname === '/app.js') {
    serveFile(path.join(rootDir, 'public', 'app.js'), 'application/javascript; charset=utf-8', res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`RoomieMatch server is running on http://localhost:${PORT}`);
});
