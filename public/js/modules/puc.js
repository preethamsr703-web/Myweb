/**
 * PUC & SCHOOL MODULE: Karnataka PUC & SSLC 10th Standard Library
 */

class PucSchoolModule {
  constructor() {
    this.currentLevel = 'puc';
    this.currentStream = 'all';
    this.container = document.getElementById('puc-books-container');
    this.levelTabs = document.querySelectorAll('.puc-tab-btn');
    this.streamPills = document.querySelectorAll('.stream-pill');
    this.init();
  }

  init() {
    this.setupListeners();
    this.loadBooks();
  }

  setupListeners() {
    this.levelTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.levelTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentLevel = tab.dataset.level;
        this.updateStreamPills();
        this.loadBooks();
      });
    });

    this.streamPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.streamPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentStream = pill.dataset.stream;
        this.loadBooks();
      });
    });
  }

  updateStreamPills() {
    const streamContainer = document.getElementById('puc-stream-selector-container');
    if (!streamContainer) return;

    if (this.currentLevel === 'sslc') {
      streamContainer.innerHTML = `
        <button class="stream-pill active" data-stream="all">All SSLC Subjects</button>
        <button class="stream-pill" data-stream="Mathematics">Mathematics</button>
        <button class="stream-pill" data-stream="Science">Science (Phy/Chem/Bio)</button>
        <button class="stream-pill" data-stream="Social Science">Social Science</button>
        <button class="stream-pill" data-stream="Papers">Solved Board Papers</button>
      `;
    } else {
      streamContainer.innerHTML = `
        <button class="stream-pill active" data-stream="all">All PUC Streams</button>
        <button class="stream-pill" data-stream="PCMB">PCMB Science</button>
        <button class="stream-pill" data-stream="PCMC">PCMC Science</button>
        <button class="stream-pill" data-stream="Commerce">Commerce</button>
        <button class="stream-pill" data-stream="Arts">Arts</button>
      `;
    }

    // Re-attach listeners to new pills
    streamContainer.querySelectorAll('.stream-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        streamContainer.querySelectorAll('.stream-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentStream = pill.dataset.stream;
        this.loadBooks();
      });
    });
  }

  async loadBooks() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <i data-lucide="loader" style="animation: spin 1s linear infinite; margin-bottom: 10px;"></i>
        <p>Loading Karnataka Board ${this.currentLevel.toUpperCase()} Collection...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const params = {
        academicLevel: this.currentLevel,
        limit: 24
      };

      if (this.currentStream && this.currentStream !== 'all') {
        params.branch = this.currentStream;
      }

      const res = await ApiService.getBooks(params);
      const books = res.books || [];
      this.renderBooks(books);
    } catch (err) {
      this.container.innerHTML = `<div style="grid-column: 1 / -1; color: var(--accent-rose); text-align: center; padding: 30px;">Error: ${err.message}</div>`;
    }
  }

  renderBooks(books) {
    if (books.length === 0) {
      this.container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <p>No books found for this selection.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = books.map(book => {
      const isFav = window.LibraryApp.authModule?.currentUser?.favorites?.includes(book._id || book.id);
      return `
        <div class="book-card" data-id="${book._id || book.id}">
          <div class="book-cover-container">
            <img src="${book.coverImage}" alt="${book.title}" class="book-cover-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'" />
            <span class="book-badge-open-access"><i data-lucide="check" style="width: 12px; height: 12px;"></i> Free State Open Access</span>
            <button class="book-fav-btn ${isFav ? 'active' : ''}" onclick="window.LibraryApp.toggleFavorite('${book._id || book.id}', this)">
              <i data-lucide="bookmark" style="width: 15px; height: 15px;"></i>
            </button>
          </div>
          <span class="book-subject-code-tag" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9;">
            ${book.subjectCode || 'NCERT / KSEEB'}
          </span>
          <h3 class="book-card-title" title="${book.title}">${book.title}</h3>
          <p class="book-card-author">${book.author}</p>
          <div class="book-card-meta">
            <span class="rating-badge"><i data-lucide="star" style="width: 13px; height: 13px; fill: #fbbf24;"></i> ${book.rating || '4.9'}</span>
            <span>${book.readsCount || 2400} readers</span>
          </div>
          <div class="book-actions-group">
            <button class="btn-read-online" onclick="window.LibraryApp.openReader('${book._id || book.id}')">
              <i data-lucide="book-open" style="width: 14px; height: 14px;"></i> Read Online
            </button>
            <button class="btn-view-details" onclick="window.LibraryApp.openBookModal('${book._id || book.id}')">
              <i data-lucide="info" style="width: 14px; height: 14px;"></i> Details
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }
}

window.PucSchoolModule = PucSchoolModule;
