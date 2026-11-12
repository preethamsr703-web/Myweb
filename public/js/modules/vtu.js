/**
 * VTU MODULE: Dedicated VTU Engineering Academic Library
 */

class VtuModule {
  constructor() {
    this.currentBranch = 'Computer Science and Engineering';
    this.currentSemester = 'all';
    this.container = document.getElementById('vtu-books-container');
    this.branchTabs = document.querySelectorAll('.vtu-branch-tab');
    this.semChips = document.querySelectorAll('.sem-chip');
    this.init();
  }

  init() {
    this.setupListeners();
    this.loadBooks();
  }

  setupListeners() {
    this.branchTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.branchTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentBranch = tab.dataset.branch;
        this.loadBooks();
      });
    });

    this.semChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.semChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentSemester = chip.dataset.sem;
        this.loadBooks();
      });
    });
  }

  async loadBooks() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <i data-lucide="loader" style="animation: spin 1s linear infinite; margin-bottom: 10px;"></i>
        <p>Loading VTU Curated Engineering Repository...</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    try {
      const params = {
        academicLevel: 'vtu',
        limit: 30
      };

      if (this.currentBranch && this.currentBranch !== 'all') {
        params.branch = this.currentBranch;
      }
      if (this.currentSemester && this.currentSemester !== 'all') {
        params.semester = this.currentSemester;
      }

      const res = await ApiService.getBooks(params);
      const books = res.books || [];

      if (books.length === 0) {
        this.container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: rgba(255,255,255,0.02); border-radius: var(--radius-lg); border: 1px dashed var(--border-glass);">
            <i data-lucide="book-x" style="font-size: 36px; color: var(--text-dim); margin-bottom: 12px;"></i>
            <h4 style="color: #fff; margin-bottom: 6px;">No books matched this semester filter</h4>
            <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 400px; margin: 0 auto 16px;">
              Would you like to request this textbook for the VTU curriculum?
            </p>
            <button class="btn-primary-glow" onclick="window.LibraryApp.openSuggestionModal('${this.currentBranch}')" style="padding: 8px 20px; font-size: 0.85rem;">
              Request VTU Subject Book
            </button>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      this.renderBooks(books);
    } catch (err) {
      this.container.innerHTML = `<div style="grid-column: 1 / -1; color: var(--accent-rose); text-align: center; padding: 30px;">Error loading VTU library: ${err.message}</div>`;
    }
  }

  renderBooks(books) {
    this.container.innerHTML = books.map(book => {
      const isFav = window.LibraryApp.authModule?.currentUser?.favorites?.includes(book._id || book.id);
      return `
        <div class="book-card" data-id="${book._id || book.id}">
          <div class="book-cover-container">
            <img src="${book.coverImage}" alt="${book.title}" class="book-cover-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'" />
            ${book.isOpenAccess ? `<span class="book-badge-open-access"><i data-lucide="check-circle" style="width: 12px; height: 12px;"></i> Open Access</span>` : ''}
            <button class="book-fav-btn ${isFav ? 'active' : ''}" onclick="window.LibraryApp.toggleFavorite('${book._id || book.id}', this)" title="Add to Favorites">
              <i data-lucide="bookmark" style="width: 15px; height: 15px;"></i>
            </button>
          </div>
          ${book.subjectCode ? `<span class="book-subject-code-tag">${book.subjectCode} • Sem ${book.semester || 'VTU'}</span>` : ''}
          <h3 class="book-card-title" title="${book.title}">${book.title}</h3>
          <p class="book-card-author">${book.author}</p>
          <div class="book-card-meta">
            <span class="rating-badge"><i data-lucide="star" style="width: 13px; height: 13px; fill: #fbbf24;"></i> ${book.rating || '4.8'}</span>
            <span><i data-lucide="eye" style="width: 13px; height: 13px; display: inline;"></i> ${book.readsCount || 1200} reads</span>
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

window.VtuModule = VtuModule;
