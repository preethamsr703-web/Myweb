/**
 * SEARCH MODULE: Instant Smart Search & Global Open Library Discovery
 */

class SearchModule {
  constructor() {
    this.modal = document.getElementById('search-modal');
    this.input = document.getElementById('main-search-input');
    this.resultsContainer = document.getElementById('search-results-list');
    this.sourceTabs = document.querySelectorAll('.search-source-tab');
    this.currentSource = 'internal'; // 'internal' or 'openlibrary'
    this.debounceTimer = null;

    this.init();
  }

  init() {
    this.setupListeners();
  }

  setupListeners() {
    // Trigger buttons
    document.querySelectorAll('.trigger-search-modal').forEach(btn => {
      btn.addEventListener('click', () => this.openSearch());
    });

    // Close buttons
    const closeBtn = document.getElementById('search-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeSearch());

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeSearch();
      });
    }

    // Keyboard shortcut: Cmd/Ctrl + K
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearch();
      } else if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.closeSearch();
      }
    });

    // Search input debounced
    if (this.input) {
      this.input.addEventListener('input', () => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.executeSearch(this.input.value.trim());
        }, 280);
      });
    }

    // Source tabs (Internal vs Open Library)
    this.sourceTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.sourceTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentSource = tab.dataset.source;
        if (this.input) this.executeSearch(this.input.value.trim());
      });
    });
  }

  openSearch(initialQuery = '') {
    if (!this.modal) return;
    this.modal.classList.add('active');
    if (this.input) {
      this.input.value = initialQuery;
      this.input.focus();
      this.executeSearch(initialQuery);
    }
  }

  closeSearch() {
    if (this.modal) this.modal.classList.remove('active');
  }

  async executeSearch(query) {
    if (!this.resultsContainer) return;

    if (!query) {
      this.resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-dim);">
          <i data-lucide="search" style="font-size: 32px; margin-bottom: 8px;"></i>
          <p>Type keywords to search VTU subject codes (e.g. 21CS32), authors, topics, or worldwide open-access books...</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    this.resultsContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        <i data-lucide="loader" style="animation: spin 1s linear infinite; margin-bottom: 8px;"></i>
        <p>Scanning ${this.currentSource === 'internal' ? 'Digital Public Library repository' : 'Global Open Library database'}...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      if (this.currentSource === 'internal') {
        const res = await ApiService.getBooks({ q: query, limit: 15 });
        this.renderInternalResults(res.books || []);
      } else {
        const res = await ApiService.searchOpenLibrary(query);
        this.renderExternalResults(res.results || []);
      }
    } catch (err) {
      this.resultsContainer.innerHTML = `
        <div style="color: var(--accent-rose); text-align: center; padding: 20px;">
          Search query error: ${err.message}
        </div>
      `;
    }
  }

  renderInternalResults(books) {
    if (books.length === 0) {
      this.resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          <p>No titles matched "${this.input.value}".</p>
          <button class="btn-secondary-glass" onclick="document.querySelector('[data-source=openlibrary]').click()" style="margin-top: 12px; font-size: 0.82rem;">
            Search Worldwide Open Library Instead
          </button>
        </div>
      `;
      return;
    }

    this.resultsContainer.innerHTML = books.map(book => `
      <div class="search-result-row" onclick="window.LibraryApp.openBookModal('${book._id || book.id}'); window.LibraryApp.searchModule.closeSearch();">
        <img src="${book.coverImage}" class="search-row-thumb" alt="${book.title}" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'" />
        <div class="search-row-info">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${book.subjectCode ? `<span style="font-size: 0.72rem; padding: 1px 6px; background: rgba(168,85,247,0.25); color: #c084fc; border-radius: 4px; font-weight: 700;">${book.subjectCode}</span>` : ''}
            <span style="font-size: 0.72rem; color: var(--accent-cyan);">${book.category || 'Academic'}</span>
          </div>
          <h4 class="search-row-title">${book.title}</h4>
          <p class="search-row-author">${book.author} • ${book.publicationYear || 2024}</p>
        </div>
        <button class="btn-read-online" style="padding: 6px 14px; font-size: 0.78rem;" onclick="event.stopPropagation(); window.LibraryApp.openReader('${book._id || book.id}'); window.LibraryApp.searchModule.closeSearch();">
          Read
        </button>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  renderExternalResults(results) {
    if (results.length === 0) {
      this.resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          <p>No results found in Open Library.</p>
        </div>
      `;
      return;
    }

    this.resultsContainer.innerHTML = results.map(item => `
      <div class="search-result-row" onclick="window.open('${item.externalSourceUrl}', '_blank')">
        <img src="${item.coverImage}" class="search-row-thumb" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'" />
        <div class="search-row-info">
          <span style="font-size: 0.72rem; color: #10b981; font-weight: 700;">GLOBAL OPEN LIBRARY</span>
          <h4 class="search-row-title">${item.title}</h4>
          <p class="search-row-author">${item.author} (${item.publicationYear})</p>
        </div>
        <a href="${item.externalSourceUrl}" target="_blank" rel="noopener noreferrer" class="btn-secondary-glass" style="padding: 6px 14px; font-size: 0.78rem;">
          External Link <i data-lucide="external-link" style="width: 12px; height: 12px; margin-left: 4px;"></i>
        </a>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }
}

window.SearchModule = SearchModule;
