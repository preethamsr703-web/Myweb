/**
 * MAIN CLIENT APPLICATION CONTROLLER
 * Initializes Lenis smooth scroll, Three.js 3D Library, and module coordinators
 */

class DigitalLibraryApplication {
  constructor() {
    this.lenis = null;
    this.scene3D = null;
    this.authModule = null;
    this.catalogModule = null;
    this.vtuModule = null;
    this.pucModule = null;
    this.searchModule = null;
    this.readerModule = null;
    this.dashboardModule = null;
    this.adminModule = null;

    this.init();
  }

  init() {
    // 1. Initialize 3D Library Scene
    try {
      if (window.Library3DScene) {
        this.scene3D = new window.Library3DScene();
      }
    } catch (e) { console.warn('[3D Scene Notice]', e); }

    // 2. Initialize Domain Modules safely
    try { this.authModule = new window.AuthModule(); } catch (e) { console.warn('[Auth Notice]', e); }
    try { this.catalogModule = new window.CatalogModule(); } catch (e) { console.warn('[Catalog Notice]', e); }
    try { this.vtuModule = new window.VtuModule(); } catch (e) { console.warn('[VTU Notice]', e); }
    try { this.pucModule = new window.PucSchoolModule(); } catch (e) { console.warn('[PUC Notice]', e); }
    try { this.searchModule = new window.SearchModule(); } catch (e) { console.warn('[Search Notice]', e); }
    try { this.readerModule = new window.ReaderModule(); } catch (e) { console.warn('[Reader Notice]', e); }
    try { this.dashboardModule = new window.DashboardModule(); } catch (e) { console.warn('[Dashboard Notice]', e); }
    try { this.adminModule = new window.AdminModule(); } catch (e) { console.warn('[Admin Notice]', e); }

    // 3. Setup Global UI Listeners & Modals
    try { this.setupGlobalEvents(); } catch (e) { console.warn('[Events Notice]', e); }

    // 4. Lucide icons pass
    if (window.lucide) {
      try { window.lucide.createIcons(); } catch (e) {}
    }

    console.log('[Digital Library 3D] System operational.');
  }

  setupGlobalEvents() {
    // Lazy-play hero video only when visible (saves bandwidth & CPU on load)
    const heroVideo = document.getElementById('hero-bg-video');
    if (heroVideo) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            heroVideo.play().catch(() => {});
          } else {
            heroVideo.pause();
          }
        });
      }, { threshold: 0.1 });
      videoObserver.observe(heroVideo);
    }

    // Navbar scroll effect — lightweight passive listener with class toggle
    let scrollTicking = false;
    const nav = document.querySelector('.nav-container');
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        const isShown = navLinks.style.display === 'flex';
        navLinks.style.display = isShown ? 'none' : 'flex';
      });
    }

    // Modal close clicks for generic modals
    document.querySelectorAll('.modal-backdrop-custom').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Suggestion form submit
    const sugForm = document.getElementById('book-suggestion-form');
    if (sugForm) {
      sugForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('sug-title').value;
        const author = document.getElementById('sug-author').value;
        const category = document.getElementById('sug-category').value;
        const reason = document.getElementById('sug-reason').value;

        try {
          await ApiService.submitSuggestion({ title, author, category, reason });
          this.showToast('Book request submitted to the librarian review queue!');
          this.closeModal('book-suggestion-modal');
          sugForm.reset();
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    }
  }

  // Book Details Modal
  async openBookModal(bookId) {
    const modal = document.getElementById('book-detail-modal');
    if (!modal) return;

    try {
      const res = await ApiService.getBookById(bookId);
      const book = res.book;
      if (!book) return;

      document.getElementById('modal-book-title').textContent = book.title;
      document.getElementById('modal-book-author').textContent = `By ${book.author} • ${book.publisher || 'VTU Press'} (${book.publicationYear || 2024})`;
      document.getElementById('modal-book-cover').src = book.coverImage;
      document.getElementById('modal-book-desc').textContent = book.description;
      document.getElementById('modal-book-subject-code').textContent = book.subjectCode || 'VTU / STATE REPOSITORY';
      document.getElementById('modal-book-category').textContent = book.category;
      document.getElementById('modal-book-branch').textContent = book.branch || 'Universal Academic Stream';
      document.getElementById('modal-book-isbn').textContent = book.isbn || 'Open Academic Standard';
      document.getElementById('modal-book-pages').textContent = `${book.totalPages || 320} Pages`;

      const readBtn = document.getElementById('modal-btn-read');
      if (readBtn) {
        readBtn.onclick = () => {
          this.closeModal('book-detail-modal');
          this.openReader(book._id || book.id);
        };
      }

      modal.classList.add('active');
      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      this.showToast(`Failed to load details: ${err.message}`, 'error');
    }
  }

  openReader(bookId) {
    if (this.readerModule) {
      this.readerModule.open(bookId);
    }
  }

  async toggleFavorite(bookId, btnEl) {
    try {
      const res = await ApiService.toggleFavorite(bookId);
      if (btnEl) {
        if (res.isFavorite) btnEl.classList.add('active');
        else btnEl.classList.remove('active');
      }
      this.showToast(res.message);
      if (this.dashboardModule) this.dashboardModule.loadUserData();
    } catch (err) {
      this.showToast('Please sign in to save books to your personal library.', 'info');
      if (this.authModule) this.authModule.openAuthModal('login');
    }
  }

  openSuggestionModal(defaultCategory = 'VTU Engineering') {
    const modal = document.getElementById('book-suggestion-modal');
    const catInput = document.getElementById('sug-category');
    if (catInput) catInput.value = defaultCategory;
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';

    let icon = 'check-circle';
    let iconColor = '#10b981';
    if (type === 'error') {
      icon = 'alert-triangle';
      iconColor = '#f43f5e';
    } else if (type === 'info') {
      icon = 'info';
      iconColor = '#06b6d4';
    }

    toast.innerHTML = `
      <i data-lucide="${icon}" style="color: ${iconColor}; width: 18px; height: 18px;"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s, transform 0.4s';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  }
}

// Global bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.LibraryApp = new DigitalLibraryApplication();
});
