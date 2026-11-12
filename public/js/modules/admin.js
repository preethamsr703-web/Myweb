/**
 * ADMIN MODULE: Library Management Console
 * Controls book catalog, user roles, suggestions, and system analytics
 */

class AdminModule {
  constructor() {
    this.tableContainer = document.getElementById('admin-books-table-body');
    this.userTableContainer = document.getElementById('admin-users-table-body');
    this.suggestionsContainer = document.getElementById('admin-suggestions-body');
    this.addBookModal = document.getElementById('admin-add-book-modal');
    this.init();
  }

  init() {
    this.setupListeners();
    this.loadAdminData();
  }

  setupListeners() {
    const addBtn = document.getElementById('btn-open-add-book');
    if (addBtn) addBtn.addEventListener('click', () => this.openAddBookModal());

    const closeAddModalBtn = document.getElementById('close-add-book-modal');
    if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', () => this.closeAddBookModal());

    const addBookForm = document.getElementById('admin-add-book-form');
    if (addBookForm) {
      addBookForm.addEventListener('submit', (e) => this.handleBookSubmit(e));
    }
  }

  async loadAdminData() {
    try {
      const statsRes = await ApiService.getAdminStats();
      if (statsRes.success && statsRes.stats) {
        this.renderStatsOverview(statsRes.stats.overview);
      }

      this.loadBooksTable();
      this.loadUsersTable();
      this.loadSuggestionsTable();
    } catch (err) {
      console.log('[Admin data error]', err.message);
    }
  }

  renderStatsOverview(overview) {
    const totalBooksEl = document.getElementById('admin-stat-total-books');
    const totalUsersEl = document.getElementById('admin-stat-total-users');
    const totalReadsEl = document.getElementById('admin-stat-total-reads');
    const totalOpenEl = document.getElementById('admin-stat-open-access');

    if (totalBooksEl) totalBooksEl.textContent = overview.totalBooks || 27;
    if (totalUsersEl) totalUsersEl.textContent = overview.totalUsers || 3;
    if (totalReadsEl) totalReadsEl.textContent = (overview.totalReads || 142000).toLocaleString();
    if (totalOpenEl) totalOpenEl.textContent = overview.openAccessCount || 25;
  }

  async loadBooksTable() {
    if (!this.tableContainer) return;
    try {
      const res = await ApiService.getBooks({ limit: 50 });
      const books = res.books || [];

      this.tableContainer.innerHTML = books.map(b => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${b.coverImage}" style="width: 30px; height: 42px; border-radius: 4px; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'" />
              <div>
                <strong style="color: #fff; font-size: 0.88rem;">${b.title}</strong>
                <div style="font-size: 0.74rem; color: var(--text-dim);">${b.author}</div>
              </div>
            </div>
          </td>
          <td><span style="font-size: 0.78rem; padding: 2px 8px; background: rgba(168,85,247,0.15); color: #c084fc; border-radius: 4px;">${b.category}</span></td>
          <td>${b.subjectCode || '—'}</td>
          <td>${b.branch ? b.branch.split(' ')[0] : 'General'}</td>
          <td>${b.readsCount || 0}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="admin-action-btn-sm btn-edit-sm" onclick="window.LibraryApp.openReader('${b._id || b.id}')">
                Preview
              </button>
              <button class="admin-action-btn-sm btn-delete-sm" onclick="window.LibraryApp.adminModule.deleteBook('${b._id || b.id}')">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      this.tableContainer.innerHTML = `<tr><td colspan="6" style="color: var(--accent-rose);">Error loading catalog: ${err.message}</td></tr>`;
    }
  }

  async loadUsersTable() {
    if (!this.userTableContainer) return;
    try {
      const res = await ApiService.getAllUsers();
      const users = res.users || [];

      this.userTableContainer.innerHTML = users.map(u => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="${u.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.name}" style="width: 28px; height: 28px; border-radius: 50%;" />
              <div>
                <strong style="color: #fff;">${u.name}</strong>
                <div style="font-size: 0.74rem; color: var(--text-dim);">${u.email}</div>
              </div>
            </div>
          </td>
          <td>
            <select onchange="window.LibraryApp.adminModule.changeRole('${u._id || u.id}', this.value)" style="background: rgba(255,255,255,0.06); color: #fff; border: 1px solid var(--border-glass); border-radius: 4px; padding: 3px 8px; font-size: 0.8rem;">
              <option value="student" ${u.role === 'student' ? 'selected' : ''}>Student</option>
              <option value="librarian" ${u.role === 'librarian' ? 'selected' : ''}>Librarian</option>
              <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrator</option>
            </select>
          </td>
          <td>${u.academicLevel || 'VTU'}</td>
          <td>${new Date(u.createdAt).toLocaleDateString()}</td>
        </tr>
      `).join('');
    } catch (err) {
      this.userTableContainer.innerHTML = `<tr><td colspan="4" style="color: var(--text-muted);">User access controls restricted to Administrator.</td></tr>`;
    }
  }

  async loadSuggestionsTable() {
    if (!this.suggestionsContainer) return;
    try {
      const res = await ApiService.getSuggestions();
      const suggestions = res.suggestions || [];

      if (suggestions.length === 0) {
        this.suggestionsContainer.innerHTML = `<tr><td colspan="5" style="color: var(--text-dim); text-align: center;">No pending student book suggestions.</td></tr>`;
        return;
      }

      this.suggestionsContainer.innerHTML = suggestions.map(s => `
        <tr>
          <td><strong>${s.title}</strong></td>
          <td>${s.author}</td>
          <td>${s.category}</td>
          <td><span style="font-size: 0.75rem; color: ${s.status === 'approved' ? '#10b981' : s.status === 'rejected' ? '#f43f5e' : '#fbbf24'}; font-weight: 700; text-transform: uppercase;">${s.status}</span></td>
          <td>
            ${s.status === 'pending' ? `
              <div style="display: flex; gap: 6px;">
                <button class="admin-action-btn-sm btn-edit-sm" onclick="window.LibraryApp.adminModule.reviewSuggestion('${s._id || s.id}', 'approved')">Approve</button>
                <button class="admin-action-btn-sm btn-delete-sm" onclick="window.LibraryApp.adminModule.reviewSuggestion('${s._id || s.id}', 'rejected')">Reject</button>
              </div>
            ` : 'Reviewed'}
          </td>
        </tr>
      `).join('');
    } catch (err) {
      this.suggestionsContainer.innerHTML = `<tr><td colspan="5" style="color: var(--text-dim);">Suggestions queue accessible to librarians and admins.</td></tr>`;
    }
  }

  openAddBookModal() {
    if (this.addBookModal) this.addBookModal.classList.add('active');
  }

  closeAddBookModal() {
    if (this.addBookModal) this.addBookModal.classList.remove('active');
  }

  async handleBookSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
      const res = await ApiService.createBook(formData);
      if (res.success) {
        window.LibraryApp.showToast(`Book "${res.book.title}" added to catalog!`);
        this.closeAddBookModal();
        form.reset();
        this.loadAdminData();
        // Refresh catalog and VTU list
        if (window.LibraryApp.vtuModule) window.LibraryApp.vtuModule.loadBooks();
      }
    } catch (err) {
      window.LibraryApp.showToast(err.message, 'error');
    }
  }

  async deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book from the public catalog?')) return;
    try {
      await ApiService.deleteBook(id);
      window.LibraryApp.showToast('Book removed from library.');
      this.loadBooksTable();
      if (window.LibraryApp.vtuModule) window.LibraryApp.vtuModule.loadBooks();
    } catch (err) {
      window.LibraryApp.showToast(err.message, 'error');
    }
  }

  async changeRole(userId, newRole) {
    try {
      await ApiService.updateUserRole(userId, newRole);
      window.LibraryApp.showToast(`User role updated to ${newRole}`);
      this.loadUsersTable();
    } catch (err) {
      window.LibraryApp.showToast(err.message, 'error');
    }
  }

  async reviewSuggestion(id, status) {
    try {
      await ApiService.reviewSuggestion(id, status);
      window.LibraryApp.showToast(`Suggestion ${status}`);
      this.loadSuggestionsTable();
    } catch (err) {
      window.LibraryApp.showToast(err.message, 'error');
    }
  }
}

window.AdminModule = AdminModule;
