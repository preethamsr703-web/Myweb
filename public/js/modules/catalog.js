/**
 * CATALOG MODULE: Handles Category Explorer, Featured Books, and Science Universe
 */

class CatalogModule {
  constructor() {
    this.categoriesContainer = document.getElementById('categories-grid-container');
    this.featuredContainer = document.getElementById('featured-books-grid');
    this.scienceContainer = document.getElementById('science-universe-grid');
    this.activeFilter = 'all';
    this.init();
  }

  init() {
    this.loadCategories();
    this.loadFeaturedBooks();
    this.loadScienceUniverse();
    this.setupCategoryFilterBtns();
  }

  setupCategoryFilterBtns() {
    const filterBtns = document.querySelectorAll('.category-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.group;
        this.filterCategories();
      });
    });
  }

  async loadCategories() {
    if (!this.categoriesContainer) return;
    try {
      const res = await ApiService.getCategories();
      this.categories = res.categories || [];
      this.renderCategories(this.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  filterCategories() {
    if (!this.categories) return;
    if (this.activeFilter === 'all') {
      this.renderCategories(this.categories);
    } else {
      const filtered = this.categories.filter(c => c.group === this.activeFilter);
      this.renderCategories(filtered);
    }
  }

  renderCategories(cats) {
    if (!this.categoriesContainer) return;
    this.categoriesContainer.innerHTML = cats.map(c => `
      <div class="category-card" style="--card-gradient: ${c.gradient};" onclick="window.LibraryApp.searchModule.openSearch('${c.name}')">
        <div>
          <div class="cat-icon-box">
            <i data-lucide="${c.icon || 'book-open'}"></i>
          </div>
          <h3 class="cat-title">${c.name}</h3>
          <p class="cat-desc">${c.description}</p>
        </div>
        <div class="cat-footer">
          <span>Active Repository</span>
          <span class="cat-explore-link">Explore Shelf <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i></span>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  async loadFeaturedBooks() {
    if (!this.featuredContainer) return;
    try {
      const res = await ApiService.getBooks({ featured: true, limit: 6 });
      const books = res.books || [];
      this.renderBooksGrid(this.featuredContainer, books);
    } catch (err) {
      console.error('Failed to load featured books:', err);
    }
  }

  async loadScienceUniverse() {
    if (!this.scienceContainer) return;
    try {
      const res = await ApiService.getBooks({ academicLevel: 'science', limit: 8 });
      const books = res.books || [];
      this.renderBooksGrid(this.scienceContainer, books);
    } catch (err) {
      console.error('Failed to load science universe:', err);
    }
  }

  renderBooksGrid(container, books) {
    container.innerHTML = books.map(book => {
      const isFav = window.LibraryApp.authModule?.currentUser?.favorites?.includes(book._id || book.id);
      return `
        <div class="book-card" data-id="${book._id || book.id}">
          <div class="book-cover-container">
            <img src="${book.coverImage}" alt="${book.title}" class="book-cover-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'" />
            <span class="book-badge-open-access"><i data-lucide="globe" style="width: 12px; height: 12px;"></i> Open Knowledge</span>
            <button class="book-fav-btn ${isFav ? 'active' : ''}" onclick="window.LibraryApp.toggleFavorite('${book._id || book.id}', this)">
              <i data-lucide="bookmark" style="width: 15px; height: 15px;"></i>
            </button>
          </div>
          <span class="book-subject-code-tag">${book.category}</span>
          <h3 class="book-card-title" title="${book.title}">${book.title}</h3>
          <p class="book-card-author">${book.author}</p>
          <div class="book-card-meta">
            <span class="rating-badge"><i data-lucide="star" style="width: 13px; height: 13px; fill: #fbbf24;"></i> ${book.rating || '4.9'}</span>
            <span>${book.readsCount || 1800} reads</span>
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

window.CatalogModule = CatalogModule;
