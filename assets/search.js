
// Ireon Search JS

const SEARCH_CONFIG = {
  lang: "en",
  indexUrl: "/en/search-index.json",
  resultLimit: 20,
  fields: ["title", "intro", "section_titles", "keywords"]
};

let SEARCH_INDEX = [];

async function loadSearchIndex() {
  try {
    const res = await fetch(SEARCH_CONFIG.indexUrl);
    SEARCH_INDEX = await res.json();
    console.log("[Search] index loaded:", SEARCH_INDEX.length);
  } catch (e) {
    console.error("[Search] load failed", e);
  }
}

function normalize(text) {
  return (text || "").toLowerCase();
}

function scoreItem(item, query) {
  let score = 0;

  const q = normalize(query);

  if (normalize(item.title).includes(q)) score += 50;
  if (normalize(item.intro).includes(q)) score += 20;

  for (const t of item.section_titles || []) {
    if (normalize(t).includes(q)) score += 10;
  }

  for (const k of item.keywords || []) {
    if (normalize(k).includes(q)) score += 5;
  }

  return score;
}

function search(query) {
  if (!query || query.length < 2) return [];

  const results = [];

  for (const item of SEARCH_INDEX) {
    const s = scoreItem(item, query);
    if (s > 0) {
      results.push({ ...item, _score: s });
    }
  }

  results.sort((a, b) => b._score - a._score);

  return results.slice(0, SEARCH_CONFIG.resultLimit);
}

function renderResults(results) {
  const container = document.getElementById("search-results");
  if (!container) return;

  container.innerHTML = "";

  for (const r of results) {
    const el = document.createElement("div");
    el.className = "search-item";

    el.innerHTML = `
      <a href="${r.url}" class="search-title">${r.title}</a>
      <div class="search-intro">${r.intro || ""}</div>
    `;

    container.appendChild(el);
  }
}

function attachSearch() {
  const input = document.getElementById("search-input");

  if (!input) return;

  input.addEventListener("input", (e) => {
    const q = e.target.value;
    const results = search(q);
    renderResults(results);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadSearchIndex();
  attachSearch();
});
