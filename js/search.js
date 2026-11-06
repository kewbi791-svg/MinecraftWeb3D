// Integração com APIs de busca

export class SearchSystem {
  constructor() {
    this.resultsEl = document.getElementById('search-results');
    document.getElementById('do-search').addEventListener('click', () => this.search());
    document.getElementById('search-query').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.search();
    });
  }

  async search() {
    const query = document.getElementById('search-query').value.trim();
    if (!query) return;

    this.resultsEl.innerHTML = '<p>Buscando...</p>';

    const sources = [];
    document.querySelectorAll('.search-sources input:checked').forEach(cb => sources.push(cb.value));

    const results = [];

    try {
      if (sources.includes('wikipedia')) {
        const wiki = await this.searchWikipedia(query);
        results.push(...wiki);
      }
      if (sources.includes('tvmaze')) {
        const tv = await this.searchTVMaze(query);
        results.push(...tv);
      }
      if (sources.includes('sportsdb')) {
        const sports = await this.searchSportsDB(query);
        results.push(...sports);
      }
      if (sources.includes('duckduckgo')) {
        const ddg = await this.searchDuckDuckGo(query);
        results.push(...ddg);
      }
    } catch (err) {
      console.error(err);
    }

    this.renderResults(results);
  }

  async searchWikipedia(q) {
    const url = `https://pt.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=5&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    // data = [query, titles[], descriptions[], urls[]]
    const out = [];
    for (let i = 0; i < data[1].length; i++) {
      out.push({
        source: 'Wikipedia',
        title: data[1][i],
        desc: data[2][i] || '',
        url: data[3][i]
      });
    }
    return out;
  }

  async searchTVMaze(q) {
    const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.slice(0, 5).map(item => ({
      source: 'TVMaze',
      title: item.show.name,
      desc: (item.show.summary || '').replace(/<[^>]+>/g, '').slice(0, 120),
      url: item.show.url
    }));
  }

  async searchSportsDB(q) {
    // TheSportsDB free tier (sem API key para buscas básicas)
    try {
      const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.teams) return [];
      return data.teams.slice(0, 5).map(t => ({
        source: 'TheSportsDB',
        title: t.strTeam,
        desc: `${t.strLeague || ''} • ${t.strCountry || ''}`,
        url: t.strWebsite ? (t.strWebsite.startsWith('http') ? t.strWebsite : 'https://' + t.strWebsite) : '#'
      }));
    } catch {
      return [];
    }
  }

  async searchDuckDuckGo(q) {
    // Instant Answer API
    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_redirect=1`;
      const res = await fetch(url);
      const data = await res.json();
      const out = [];
      if (data.AbstractText) {
        out.push({
          source: 'DuckDuckGo',
          title: data.Heading || q,
          desc: data.AbstractText.slice(0, 150),
          url: data.AbstractURL || '#'
        });
      }
      (data.RelatedTopics || []).slice(0, 3).forEach(t => {
        if (t.Text) {
          out.push({
            source: 'DuckDuckGo',
            title: t.Text.split(' - ')[0],
            desc: t.Text,
            url: t.FirstURL || '#'
          });
        }
      });
      return out;
    } catch {
      return [];
    }
  }

  renderResults(results) {
    if (results.length === 0) {
      this.resultsEl.innerHTML = '<p>Nenhum resultado encontrado.</p>';
      return;
    }

    this.resultsEl.innerHTML = results.map(r => `
      <div class="search-item" data-url="${r.url}">
        <h4>${r.title} <small style="color:#888">(${r.source})</small></h4>
        <p>${r.desc}</p>
      </div>
    `).join('');

    this.resultsEl.querySelectorAll('.search-item').forEach(el => {
      el.addEventListener('click', () => {
        const url = el.dataset.url;
        if (url && url !== '#') {
          document.getElementById('screen-url').value = url;
          document.getElementById('browser-url').value = url;
          // muda para a aba URL
          document.querySelector('.tab[data-tab="url"]').click();
        }
      });
    });
  }
}
