/**
 * AUTH MODULE: Handles authentication status, modals, and user sessions
 */

class AuthModule {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async init() {
    const token = ApiService.getToken();
    if (token) {
      try {
        const res = await ApiService.getMe();
        if (res.success && res.user) {
          this.currentUser = res.user;
        }
      } catch (e) {
        ApiService.setToken('');
        this.currentUser = null;
      }
    }
    this.updateUI();
  }

  updateUI() {
    const profileBadge = document.getElementById('nav-user-badge');
    const authBtn = document.getElementById('nav-auth-btn');
    const userNameEl = document.getElementById('nav-user-name');
    const userRoleEl = document.getElementById('nav-user-role');
    const userAvatarEl = document.getElementById('nav-user-avatar');
    const adminNavLink = document.getElementById('nav-admin-link');
    const dashboardNavLink = document.getElementById('nav-dashboard-link');

    if (this.currentUser) {
      if (profileBadge) profileBadge.style.display = 'flex';
      if (authBtn) authBtn.style.display = 'none';

      if (userNameEl) userNameEl.textContent = this.currentUser.name.split(' ')[0];
      if (userRoleEl) userRoleEl.textContent = this.currentUser.role;
      if (userAvatarEl && this.currentUser.avatar) userAvatarEl.src = this.currentUser.avatar;

      if (adminNavLink) {
        adminNavLink.style.display = (this.currentUser.role === 'admin' || this.currentUser.role === 'librarian') ? 'flex' : 'none';
      }
      if (dashboardNavLink) {
        dashboardNavLink.style.display = 'flex';
      }
    } else {
      if (profileBadge) profileBadge.style.display = 'none';
      if (authBtn) authBtn.style.display = 'block';
      if (adminNavLink) adminNavLink.style.display = 'none';
    }
  }

  async login(email, password) {
    try {
      const res = await ApiService.login(email, password);
      if (res.success && res.token) {
        ApiService.setToken(res.token);
        this.currentUser = res.user;
        this.updateUI();
        window.LibraryApp.showToast(`Welcome back, ${res.user.name}!`);
        this.closeAuthModal();
        if (window.LibraryApp.dashboardModule) {
          window.LibraryApp.dashboardModule.loadUserData();
        }
        return true;
      }
    } catch (err) {
      window.LibraryApp.showToast(err.message, 'error');
      return false;
    }
  }

  async quickDemo(role) {
    try {
      const res = await ApiService.quickDemoLogin(role);
      if (res.success && res.token) {
        ApiService.setToken(res.token);
        this.currentUser = res.user;
        this.updateUI();
        window.LibraryApp.showToast(`Logged in as demo ${role.toUpperCase()}: ${res.user.name}`);
        this.closeAuthModal();
        if (window.LibraryApp.dashboardModule) {
          window.LibraryApp.dashboardModule.loadUserData();
        }
        if (role === 'admin' && window.LibraryApp.adminModule) {
          window.LibraryApp.adminModule.loadAdminData();
        }
        return true;
      }
    } catch (err) {
      window.LibraryApp.showToast(err.message, 'error');
      return false;
    }
  }

  async register(data) {
    try {
      const res = await ApiService.register(data);
      if (res.success && res.token) {
        ApiService.setToken(res.token);
        this.currentUser = res.user;
        this.updateUI();
        window.LibraryApp.showToast('Account registered successfully!');
        this.closeAuthModal();
        return true;
      }
    } catch (err) {
      window.LibraryApp.showToast(err.message, 'error');
      return false;
    }
  }

  logout() {
    ApiService.setToken('');
    this.currentUser = null;
    this.updateUI();
    window.LibraryApp.showToast('You have been signed out.');
  }

  openAuthModal(defaultTab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('active');
  }

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
  }
}

window.AuthModule = AuthModule;
