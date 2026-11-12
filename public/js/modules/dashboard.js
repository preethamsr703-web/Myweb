/**
 * DASHBOARD MODULE: Student Dashboard (Synaptix Aesthetic)
 * Replicates the reference image's visual design, charts, and metrics!
 */

class DashboardModule {
  constructor() {
    this.performanceChart = null;
    this.gaugeChart = null;
    this.init();
  }

  init() {
    this.loadUserData();
    this.renderSparklines();
  }

  async loadUserData() {
    try {
      const res = await ApiService.getUserDashboard();
      if (res.success && res.data) {
        this.renderMetrics(res.data.metrics);
        this.renderCharts(res.data.chartData);
        this.renderReadingHistory(res.data.readingHistory);
        this.renderBookmarks(res.data.bookmarks);
      }
    } catch (err) {
      console.log('[Dashboard fallback] Loading default demo student profile (Alex)...');
      this.renderDefaultDemo();
    }
  }

  renderDefaultDemo() {
    const defaultMetrics = {
      studyUsage: '24.5K',
      studyUsageChange: '+12.5% this month',
      outputsCount: '1,847',
      outputsChange: '+8.2% this month',
      precisionRate: '98.5%',
      precisionChange: '+2.1% this month',
      activeCourses: '12',
      performanceIndexTotal: '$64,345',
      performanceIndexChange: '+14.3%'
    };
    this.renderMetrics(defaultMetrics);
    this.renderCharts({
      months: ['Jan', 'Apr', 'July', 'Oct', 'Dec'],
      scores: [60, 48, 85, 45, 62]
    });
  }

  renderMetrics(metrics) {
    const usageEl = document.getElementById('metric-ai-usage');
    const outputsEl = document.getElementById('metric-outputs');
    const precisionEl = document.getElementById('metric-precision');
    const coursesEl = document.getElementById('metric-courses');

    if (usageEl) usageEl.textContent = metrics.studyUsage || '24.5K';
    if (outputsEl) outputsEl.textContent = metrics.outputsCount || '1,847';
    if (precisionEl) precisionEl.textContent = metrics.precisionRate || '98.5%';
    if (coursesEl) coursesEl.textContent = metrics.activeCourses || '12';
  }

  renderSparklines() {
    // 1. Sparkline Usage (Orange wave)
    this.drawSparkline('sparkline-usage', [10, 15, 12, 22, 18, 25, 20, 28, 22], '#f59e0b');
    // 2. Sparkline Outputs (Violet pulse)
    this.drawSparkline('sparkline-outputs', [8, 14, 22, 12, 26, 18, 28, 15, 30], '#a855f7');
    // 3. Sparkline Precision (Cyan wave)
    this.drawSparkline('sparkline-precision', [14, 18, 16, 22, 20, 24, 26, 22, 25], '#06b6d4');
    // 4. Sparkline Courses (Rose wave)
    this.drawSparkline('sparkline-courses', [12, 14, 13, 16, 18, 17, 20, 22, 21], '#f43f5e');
  }

  drawSparkline(canvasId, data, strokeColor) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);

    ctx.beginPath();
    data.forEach((val, i) => {
      const x = i * step;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  renderCharts(chartData) {
    if (typeof Chart === 'undefined') return;

    // 1. AI Performance Index Line Chart
    const lineCanvas = document.getElementById('synaptix-performance-chart');
    if (lineCanvas) {
      if (this.performanceChart) this.performanceChart.destroy();

      const ctx = lineCanvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0.0)');

      this.performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Apr', 'July', 'Oct', 'Dec'],
          datasets: [
            {
              label: 'Index',
              data: [60, 48, 85, 45, 62],
              borderColor: '#c084fc',
              borderWidth: 2.5,
              pointBackgroundColor: '#ffffff',
              pointBorderColor: '#a855f7',
              pointRadius: 4,
              pointHoverRadius: 7,
              backgroundColor: gradient,
              fill: true,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#160b2e',
              borderColor: '#a855f7',
              borderWidth: 1,
              titleColor: '#fff',
              bodyColor: '#c084fc'
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: { color: '#94a3b8', font: { size: 11 } }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: {
                color: '#94a3b8',
                callback: (val) => `$${val}K`,
                font: { size: 11 }
              }
            }
          }
        }
      });
    }

    // 2. Radial Speedometer Gauge Canvas
    this.drawSpeedometerGauge('synaptix-gauge-canvas', 85);
  }

  drawSpeedometerGauge(canvasId, score = 85) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h - 15;
    const radius = 70;

    ctx.clearRect(0, 0, w, h);

    // Background Arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 0, false);
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Cyan to Yellow Segmented Ticks (like reference image)
    const totalTicks = 28;
    for (let i = 0; i <= totalTicks; i++) {
      const angle = Math.PI + (i / totalTicks) * Math.PI;
      const innerR = radius - 8;
      const outerR = radius + 8;
      const x1 = cx + Math.cos(angle) * innerR;
      const y1 = cy + Math.sin(angle) * innerR;
      const x2 = cx + Math.cos(angle) * outerR;
      const y2 = cy + Math.sin(angle) * outerR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 3;

      if (i < 18) {
        ctx.strokeStyle = '#06b6d4'; // Cyan tick
      } else if (i < 24) {
        ctx.strokeStyle = '#eab308'; // Yellow tick
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'; // Inactive tick
      }
      ctx.stroke();
    }
  }

  renderReadingHistory(history = []) {
    const listEl = document.getElementById('synaptix-history-list');
    if (!listEl) return;

    if (history.length === 0) {
      listEl.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 18px; color: var(--text-dim); font-size: 0.85rem;">
          No reading sessions recorded yet. Start reading any book to track progress automatically!
        </div>
      `;
      return;
    }

    listEl.innerHTML = history.slice(0, 4).map(item => `
      <div class="synaptix-mini-book-item" onclick="window.LibraryApp.openReader('${item.bookId}')">
        <img src="${item.coverImage}" class="mini-book-thumb" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'" />
        <div class="mini-book-info">
          <h4 class="mini-book-title">${item.title}</h4>
          <span style="font-size: 0.72rem; color: var(--text-muted);">${item.progress}% completed • p. ${item.lastReadPage}</span>
          <div class="mini-book-prog-bar">
            <div class="mini-book-prog-fill" style="width: ${item.progress}%;"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderBookmarks(bookmarks = []) {
    const bmEl = document.getElementById('synaptix-bookmarks-list');
    if (!bmEl) return;

    if (bookmarks.length === 0) {
      bmEl.innerHTML = `
        <div style="padding: 12px; color: var(--text-dim); font-size: 0.85rem;">
          No bookmarks saved. Click the bookmark icon in the e-reader to save key pages!
        </div>
      `;
      return;
    }

    bmEl.innerHTML = bookmarks.map((b, idx) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); margin-bottom: 6px; font-size: 0.82rem;">
        <div>
          <strong style="color: #fff;">${b.title}</strong>
          <span style="color: var(--accent-purple); margin-left: 6px;">Page ${b.page}</span>
          <p style="color: var(--text-muted); font-size: 0.74rem;">${b.note || 'Reference Note'}</p>
        </div>
        <button onclick="window.LibraryApp.dashboardModule.deleteBookmark(${idx})" style="background: transparent; color: var(--accent-rose); cursor: pointer; padding: 4px;">
          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
        </button>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  async deleteBookmark(idx) {
    try {
      await ApiService.deleteBookmark(idx);
      this.loadUserData();
      window.LibraryApp.showToast('Bookmark removed.');
    } catch (err) {
      window.LibraryApp.showToast(err.message, 'error');
    }
  }
}

window.DashboardModule = DashboardModule;
