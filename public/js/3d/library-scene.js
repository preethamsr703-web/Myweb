/**
 * ULTRA-SMOOTH CSS 3D BOOK SCENE
 * Hardware-accelerated 3D transforms with zero filters, zero canvas overhead.
 * 120 FPS capable on all hardware.
 */

class Library3DScene {
  constructor() {
    this.container = document.getElementById('webgl-canvas-container');
    if (!this.container) return;
    this.init();
  }

  init() {
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
      overflow: hidden;
      perspective: 1000px;
    `;

    const bookData = [
      { title:'DATA STRUCTURES\n& ALGORITHMS', cat:'VTU CSE', color1:'#3b0764', color2:'#9333ea', x:-36, y:10,  rx:8,  ry:18,  dur:4.2, delay:0   },
      { title:'OPERATING\nSYSTEMS',           cat:'VTU CSE', color1:'#0c2b4d', color2:'#2563eb', x:36,  y:4,   rx:-6, ry:-20, dur:4.6, delay:0.4 },
      { title:'COSMOS:\nA PERSONAL VOYAGE',   cat:'SPACE',   color1:'#111827', color2:'#7c3aed', x:-24, y:-16, rx:10, ry:14,  dur:5.0, delay:0.8 },
      { title:'2ND PUC\nMATHEMATICS',         cat:'PUC',     color1:'#064e3b', color2:'#059669', x:24,  y:-14, rx:6,  ry:-16, dur:4.8, delay:1.2 },
      { title:'ARTIFICIAL\nINTELLIGENCE',     cat:'AIML',    color1:'#581c87', color2:'#c026d3', x:0,   y:20,  rx:12, ry:4,   dur:4.4, delay:0.6 }
    ];

    let styleSheet = '';

    bookData.forEach((b, i) => {
      const book = document.createElement('div');
      book.className = 'smooth-3d-book';
      book.style.cssText = `
        position: absolute;
        width: 88px;
        height: 126px;
        left: calc(50% + ${b.x}%);
        top: calc(50% + ${b.y / 3}%);
        transform-style: preserve-3d;
        transform: translate3d(-50%, -50%, 0) rotateX(${b.rx}deg) rotateY(${b.ry}deg);
        animation: bookFloat${i} ${b.dur}s ease-in-out infinite alternate;
        animation-delay: ${b.delay}s;
        will-change: transform;
        pointer-events: none;
      `;

      // Front cover with native box-shadow (hardware accelerated, no drop-shadow filter)
      const front = document.createElement('div');
      front.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, ${b.color1}, ${b.color2});
        border-radius: 3px 6px 6px 3px;
        padding: 9px 8px;
        box-shadow: 0 16px 32px rgba(0, 0, 0, 0.7), 0 0 16px rgba(168, 85, 247, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.16);
        box-sizing: border-box;
      `;
      front.innerHTML = `
        <div style="font-size:7px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:1px;margin-bottom:3px;">${b.cat}</div>
        <div style="font-size:9px;font-weight:800;color:#fff;line-height:1.25;white-space:pre-line;">${b.title}</div>
        <div style="position:absolute;bottom:7px;left:8px;right:8px;height:2px;background:rgba(255,255,255,0.3);border-radius:1px;"></div>
      `;

      // Spine
      const spine = document.createElement('div');
      spine.style.cssText = `
        position: absolute;
        width: 12px;
        height: 100%;
        left: -12px;
        top: 0;
        background: linear-gradient(to bottom, ${b.color2}, ${b.color1});
        transform: rotateY(-90deg);
        transform-origin: right center;
        border-radius: 3px 0 0 3px;
      `;

      book.appendChild(spine);
      book.appendChild(front);
      this.container.appendChild(book);

      styleSheet += `
        @keyframes bookFloat${i} {
          0%   { transform: translate3d(-50%, -50%, 0px) rotateX(${b.rx}deg) rotateY(${b.ry}deg); }
          100% { transform: translate3d(-50%, calc(-50% - 10px), 12px) rotateX(${b.rx + 2}deg) rotateY(${b.ry + 3}deg); }
        }
      `;
    });

    const styleEl = document.createElement('style');
    styleEl.textContent = styleSheet;
    document.head.appendChild(styleEl);
  }
}

window.Library3DScene = Library3DScene;
