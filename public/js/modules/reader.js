/**
 * READER MODULE: Interactive E-Reader with Theme, Zoom, Bookmarks & Progress
 */

class ReaderModule {
  constructor() {
    this.modal = document.getElementById('reader-modal');
    this.currentBook = null;
    this.currentPage = 1;
    this.totalPages = 100;
    this.fontSize = 17;
    this.zoomLevel = 1;
    this.currentTheme = 'dark'; // 'dark', 'light', 'sepia'

    this.init();
  }

  init() {
    this.setupListeners();
  }

  setupListeners() {
    // Close button
    const closeBtn = document.getElementById('reader-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    // Navigation buttons
    const prevBtn = document.getElementById('reader-prev-btn');
    const nextBtn = document.getElementById('reader-next-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevPage());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextPage());

    // Page input
    const pageInput = document.getElementById('reader-page-input');
    if (pageInput) {
      pageInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) this.goToPage(val);
      });
    }

    // Font controls
    const fontPlus = document.getElementById('reader-font-plus');
    const fontMinus = document.getElementById('reader-font-minus');
    if (fontPlus) fontPlus.addEventListener('click', () => this.changeFontSize(1));
    if (fontMinus) fontMinus.addEventListener('click', () => this.changeFontSize(-1));

    // Fullscreen toggle
    const fsBtn = document.getElementById('reader-fullscreen-btn');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          this.modal.requestFullscreen().catch(err => console.log(err));
        } else {
          document.exitFullscreen().catch(err => console.log(err));
        }
      });
    }

    // Themes
    const themeDark = document.getElementById('theme-dark-btn');
    const themeLight = document.getElementById('theme-light-btn');
    const themeSepia = document.getElementById('theme-sepia-btn');

    if (themeDark) themeDark.addEventListener('click', () => this.setTheme('dark'));
    if (themeLight) themeLight.addEventListener('click', () => this.setTheme('light'));
    if (themeSepia) themeSepia.addEventListener('click', () => this.setTheme('sepia'));

    // Bookmark button
    const bmBtn = document.getElementById('reader-bookmark-btn');
    if (bmBtn) bmBtn.addEventListener('click', () => this.saveBookmark());

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!this.modal || !this.modal.classList.contains('active')) return;
      if (e.key === 'ArrowRight') this.nextPage();
      else if (e.key === 'ArrowLeft') this.prevPage();
      else if (e.key === 'Escape') this.close();
    });
  }

  async open(bookId) {
    if (!this.modal) return;
    this.modal.classList.add('active');

    try {
      const res = await ApiService.getBookById(bookId);
      this.currentBook = res.book;
      this.totalPages = this.currentBook.totalPages || 320;
      this.currentPage = 1;

      // Update Header
      const titleEl = document.getElementById('reader-title-display');
      const authorEl = document.getElementById('reader-author-display');
      const totalPagesEl = document.getElementById('reader-total-pages');
      if (titleEl) titleEl.textContent = this.currentBook.title;
      if (authorEl) authorEl.textContent = this.currentBook.author;
      if (totalPagesEl) totalPagesEl.textContent = this.totalPages;

      // Populate Table of Contents
      this.populateToc();

      // Render First Page
      this.renderCurrentPage();

      // Record read in backend
      ApiService.recordRead(this.currentBook._id || this.currentBook.id, this.currentPage, this.totalPages);
    } catch (err) {
      window.LibraryApp.showToast(`Error opening reader: ${err.message}`, 'error');
      this.close();
    }
  }

  close() {
    if (this.modal) this.modal.classList.remove('active');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  populateToc() {
    const tocList = document.getElementById('reader-toc-list');
    if (!tocList) return;

    const chapters = this.currentBook?.tableOfContents || [
      { chapter: '1. Introduction & Theoretical Foundations', page: 1 },
      { chapter: '2. Core Principles & Architecture', page: 45 },
      { chapter: '3. Detailed Methods & Formulations', page: 110 },
      { chapter: '4. Applied Case Studies & Solved Problems', page: 220 },
      { chapter: '5. Comprehensive Question Bank & Review', page: 290 }
    ];

    tocList.innerHTML = `
      <h4 style="color: #fff; font-size: 0.95rem; margin-bottom: 12px; font-weight: 700;">Table of Contents</h4>
      ${chapters.map((ch, idx) => `
        <div class="toc-item ${this.currentPage >= ch.page ? 'active' : ''}" onclick="window.LibraryApp.readerModule.goToPage(${ch.page})">
          <span>${ch.chapter}</span>
          <span style="font-size: 0.74rem; color: var(--accent-purple); font-weight: 700;">p. ${ch.page}</span>
        </div>
      `).join('')}
    `;
  }

  renderCurrentPage() {
    const pageContentEl = document.getElementById('reader-content-body');
    const pageInput = document.getElementById('reader-page-input');
    const progressFill = document.getElementById('reader-progress-bar-fill');
    const progressPercent = document.getElementById('reader-progress-percent');

    if (pageInput) pageInput.value = this.currentPage;

    const pct = Math.round((this.currentPage / this.totalPages) * 100);
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressPercent) progressPercent.textContent = `${pct}%`;

    // Dynamic reader content
    const sample = this.currentBook.sampleContent;
    let contentHtml = '';

    if (sample && this.currentPage <= 5) {
      contentHtml = `
        <div style="font-family: inherit;">
          <h2 style="color: var(--accent-purple); margin-bottom: 16px; font-size: 1.6rem;">${this.currentBook.title}</h2>
          <div style="padding: 10px 16px; background: rgba(168,85,247,0.1); border-left: 3px solid var(--accent-purple); margin-bottom: 24px; font-size: 0.9rem;">
            Authorized Open-Access Academic Repository • Subject Code: ${this.currentBook.subjectCode || 'VTU / STATE REPOSITORY'}
          </div>
          <div style="white-space: pre-line; line-height: 1.85;">
            ${sample}
          </div>
        </div>
      `;
    } else {
      contentHtml = `
        <div>
          <span style="font-size: 0.78rem; text-transform: uppercase; color: var(--accent-cyan); font-weight: 700;">Chapter ${(Math.floor(this.currentPage / 25) + 1)} • Page ${this.currentPage}</span>
          <h3 style="color: #ffffff; margin: 12px 0 20px; font-size: 1.4rem;">${this.currentBook.title} - Academic Synthesis</h3>
          <p style="margin-bottom: 18px;">
            ${this.currentBook.description}
          </p>
          <p style="margin-bottom: 18px;">
            In this section, we analyze the rigorous conceptual frameworks governing ${this.currentBook.category}. Students and researchers should systematically verify theorems, derivations, and algorithmic complexities.
          </p>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 20px; margin: 24px 0;">
            <h4 style="color: var(--accent-purple); margin-bottom: 8px;">Key Takeaway & Formula</h4>
            <p style="font-family: monospace; font-size: 0.95rem; color: #67e8f9;">
              T(n) = 2T(n/2) + O(n) &rarr; O(n log n) [Master Theorem Case 2]
            </p>
          </div>
          <p style="margin-bottom: 18px;">
            Visvesvaraya Technological University (VTU) guidelines mandate structured documentation and unit testing for all laboratory and semester evaluations.
          </p>
        </div>
      `;
    }

    if (pageContentEl) {
      pageContentEl.innerHTML = contentHtml;
      pageContentEl.style.fontSize = `${this.fontSize}px`;
    }

    // Sync with backend every few page turns
    if (this.currentPage % 3 === 0) {
      ApiService.recordRead(this.currentBook._id || this.currentBook.id, this.currentPage, this.totalPages);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.renderCurrentPage();
      this.populateToc();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderCurrentPage();
      this.populateToc();
    }
  }

  goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.renderCurrentPage();
      this.populateToc();
    }
  }

  changeFontSize(delta) {
    this.fontSize = Math.min(28, Math.max(13, this.fontSize + delta));
    const pageContentEl = document.getElementById('reader-content-body');
    if (pageContentEl) pageContentEl.style.fontSize = `${this.fontSize}px`;
  }

  setTheme(theme) {
    const viewport = document.getElementById('reader-viewport');
    if (!viewport) return;
    viewport.classList.remove('reader-theme-light', 'reader-theme-sepia');
    if (theme === 'light') viewport.classList.add('reader-theme-light');
    if (theme === 'sepia') viewport.classList.add('reader-theme-sepia');
    this.currentTheme = theme;
  }

  async saveBookmark() {
    if (!this.currentBook) return;
    try {
      await ApiService.addBookmark({
        bookId: this.currentBook._id || this.currentBook.id,
        title: this.currentBook.title,
        page: this.currentPage,
        note: `Saved bookmark on Page ${this.currentPage}`
      });
      window.LibraryApp.showToast(`Bookmark saved for Page ${this.currentPage}!`);
    } catch (err) {
      window.LibraryApp.showToast('Please login to save bookmarks.', 'info');
    }
  }
}

window.ReaderModule = ReaderModule;
