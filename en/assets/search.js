(() => {
  const boxes = document.querySelectorAll('[data-search-index]');
  boxes.forEach(async box => {
    const input = box.querySelector('input');
    const results = box.querySelector('.search-results');
    if (!input || !results) return;
    let rows = [];
    try {
      const response = await fetch(box.dataset.searchIndex);
      rows = await response.json();
    } catch (_) {
      input.disabled = true;
      input.placeholder = 'Search unavailable when opened without a local server';
      return;
    }
    const prefix = box.dataset.routePrefix || '';
    const render = () => {
      const query = input.value.trim().toLocaleLowerCase();
      if (!query) { results.classList.remove('open'); results.innerHTML = ''; return; }
      const matches = rows.filter(row => row.label.toLocaleLowerCase().includes(query)).slice(0, 12);
      results.innerHTML = matches.map(row =>
        `<a class="search-result" href="${prefix}${row.route}"><span>${escapeHtml(row.label)}</span><small>${escapeHtml(row.status)}</small></a>`
      ).join('') || '<div class="search-result"><span>No matching concepts</span></div>';
      results.classList.add('open');
    };
    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    document.addEventListener('click', event => { if (!box.contains(event.target)) results.classList.remove('open'); });
  });
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }
})();