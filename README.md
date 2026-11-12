# Synaptix Matrix • 3D Digital Public Library & Management System

> **A Universe of Knowledge, One Click Away.**  
> An award-winning grade 3D scrolling Digital Public Library and Educational Management System designed for VTU Engineering, PUC, SSLC 10th standard, Pure Sciences, and General Literature.

---

## 🌟 Visual Design & 3D Scrolling Experience

This platform was meticulously engineered following:
1. **Reference Video (`Book_floating_and_opening.mp4`)**:
   - The hero section integrates the high-definition floating & opening book video as a seamless background element overlaid with a real-time **Three.js** 3D WebGL scene.
   - Interactive procedural 3D books hover and rotate with cursor movement, open on interaction, and fly dynamically through 3D space.
   - **GSAP ScrollTrigger** and **Lenis Smooth Inertia Scrolling** create a cinematic transition as the camera moves into the virtual library matrix.

2. **Reference Image (Synaptix Futuristic Glassmorphism Aesthetic)**:
   - Deep cosmic purple / violet color palette (`#07040D`, `#0D071C`, `#160C2E`).
   - Frosted glass cards (`backdrop-filter: blur(24px)`) with specular 1px borders and violet ambient glows.
   - Glowing neon pill badges (`AI Active`, `+12.5% this month`, status indicators).
   - "Go Pro" glowing cosmic sphere / orb widget in navigation.
   - Custom **Chart.js** visualizations matching the reference design:
     - **AI Performance Index** line chart ($64,345 `+14.3%`) with milestone markers.
     - **AI Confidence Speedometer Gauge** (85 score with cyan & yellow arc ticks).
     - Live canvas sparklines for AI usage, outputs, precision, and active courses.

---

## 📚 Academic & Scholarly Scope

### 1. VTU Visvesvaraya Technological University Portal
- Complete semester coverage from **Semester 1 to Semester 8** (including First Year P-Cycle & C-Cycle).
- Branches supported:
  - Computer Science & Engineering (CSE)
  - Information Science & Engineering (ISE)
  - Artificial Intelligence & Machine Learning (AIML)
  - Electronics & Communication Engineering (ECE)
  - Electrical & Electronics Engineering (EEE)
  - Mechanical Engineering (ME)
  - Civil Engineering (CV)
- Prescribed CBCS subject codes (e.g., `21CS32`, `21CS44`, `21CS51`, `21CS52`, `21AI54`, `21EC52`, `21ME33`, `21CV51`, `21MAT11`).
- Direct links to official VTU syllabus repositories.

### 2. Pre-University (PUC) & School (SSLC 10th)
- **Karnataka 1st & 2nd PUC**:
  - PCMB (Physics, Chemistry, Mathematics, Biology)
  - PCMC (Physics, Chemistry, Mathematics, Computer Science)
  - Commerce (Accountancy, Business Studies, Economics, Statistics)
  - Arts (History, Political Science, Sociology)
  - Solved model question papers & official blueprints (2025–2026).
- **Karnataka SSLC 10th Standard**:
  - Mathematics, Science (Physics/Chemistry/Biology), Social Science, English, Kannada.
  - 10-Year solved Karnataka Board examination question papers.

### 3. Science & Knowledge Universe
- Space & Astronomy (Carl Sagan's *Cosmos*, Stephen Hawking's *A Brief History of Time*).
- Quantum Physics & Theoretical Mechanics (Albert Einstein's *Relativity*, Richard Feynman).
- Artificial Intelligence & Deep Learning (*Russell & Norvig*, *Goodfellow, Bengio & Courville*).
- World Literature, Philosophy, History, and Project Gutenberg Public Domain Classics.

---

## 💻 Technical Architecture

```
digital-public-library/
├── package.json               # Backend dependencies & npm scripts
├── .env                       # Environment configuration
├── .env.example               # Environment template
├── server/
│   ├── server.js              # Express app, compression, static files, routes
│   ├── config/
│   │   └── db.js              # Dual-mode database (MongoDB + embedded engine)
│   ├── data/
│   │   ├── embedded-db.js     # High-speed file-backed JSON store (zero-setup)
│   │   ├── seedData.js        # Seed catalog with 24 categories, books, accounts
│   │   └── store.json         # Persistent JSON database
│   ├── models/
│   │   ├── User.js            # User model & reading history
│   │   ├── Book.js            # Academic book schema & full-text search
│   │   ├── Category.js        # Category schema
│   │   ├── Suggestion.js      # Student book request queue
│   │   └── AuditLog.js        # Administrator activity logs
│   ├── controllers/
│   │   ├── authController.js  # JWT Auth, Register, Login, Demo switches
│   │   ├── bookController.js  # Book search, filter, CRUD, reads, favorites
│   │   ├── externalApiController.js # Open Library API & Google Books integration
│   │   ├── userDashboardController.js  # Personal student dashboard data
│   │   └── adminDashboardController.js # Admin metrics & user controls
│   └── routes/                # Modular Express routers
├── public/
│   ├── index.html             # Single Page Application
│   ├── css/
│   │   └── style.css          # Synaptix glassmorphic design system
│   ├── js/
│   │   ├── app.js             # Main orchestrator & Lenis smooth scroll
│   │   ├── 3d/
│   │   │   └── library-scene.js # Three.js 3D floating books & particle nebulae
│   │   └── modules/
│   │       ├── api.js         # REST API client
│   │       ├── auth.js        # Authentication & session manager
│   │       ├── catalog.js     # Category explorer & featured shelves
│   │       ├── vtu.js         # VTU engineering branch/semester portal
│   │       ├── puc.js         # PUC & SSLC 10th portal
│   │       ├── search.js      # Smart instant search & Open Library proxy
│   │       ├── reader.js      # Interactive reader with themes, bookmarks, TOC
│   │       ├── dashboard.js   # Synaptix student dashboard & Chart.js graphs
│   │       └── admin.js       # Administrative catalog & user console
│   └── assets/
│       ├── videos/hero-book-floating.mp4 # User reference video
│       └── images/synaptix-reference.png  # User reference image
└── uploads/                   # Upload storage for authorized PDFs and covers
```

---

## ⚡ Zero-Friction Dual-Mode Database

The backend features an **Intelligent Dual-Mode Database**:
- **Mode 1 (MongoDB)**: If a MongoDB daemon or MongoDB Atlas URI is present in `MONGODB_URI`, Mongoose automatically connects.
- **Mode 2 (Embedded Engine)**: If MongoDB is not installed locally, the server immediately and safely engages the built-in embedded persistence engine (`server/data/embedded-db.js`).  
**Result**: The application runs 100% out-of-the-box on any computer without requiring manual database installation or external configuration!

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0 or higher recommended; tested on Node.js v26)
- **npm** (v9+ or higher)

### 1. Installation
In the project directory:
```bash
npm install
```

### 2. Start the Application
```bash
npm start
```
The server will boot, verify the database, seed all academic categories and books, and start listening on:
👉 **`http://localhost:5000`**

---

## 🔑 Pre-Seeded Demo Accounts

You can test any role instantly using the 1-click demo buttons in the Sign In modal:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Student** | `alex@student.edu` | `Student@123` | Personal reading matrix, study stats, saved bookmarks, progress |
| **Librarian** | `librarian@library.gov.in` | `Librarian@123` | Catalog editing, student book request review, repository curation |
| **Administrator** | `admin@library.gov.in` | `Admin@123` | Full system control, user role management, catalog deletion, audit logs |

---

## 📖 Key Features & Interactions

1. **3D Hero Interaction**:
   - Move cursor to rotate and tilt the floating 3D books in real time.
   - Click on any 3D book in the hero scene to open its detailed academic overview.
   - Smoothly scroll down to watch the camera fly inside the virtual library shelves.

2. **Smart Book Search (Ctrl + K)**:
   - Instant search across title, author, subject code (e.g. `21CS32`), and tags.
   - Switch between **Verified Library Catalog** and **Worldwide Open Library API** with live cover fetching and external links.

3. **Interactive E-Reader**:
   - Fullscreen reading mode with page turns (Arrow keys, buttons, or direct page jump).
   - Theme switchers: **Dark Cyberpunk**, **Light Paper**, and **Sepia Vintage**.
   - Font sizing controls (`A-` and `A+`).
   - Chapter Table of Contents drawer.
   - Bookmark save feature and live reading progress percentage.

4. **Synaptix Student Matrix**:
   - Direct replication of the reference dashboard with custom Chart.js charts, active course tracking, and reading history.

5. **Librarian Management**:
   - Add new books via modal with automatic category classification.
   - Review submitted student suggestions with approve/reject workflows.
   - Manage user roles with live dropdowns.

---

## 🛡️ License & Open Access
Distributed under the Open Educational Resources guidelines. All textbooks, syllabus references, and public domain materials adhere strictly to legitimate open-access repositories (Project Gutenberg, DOAB, and official VTU guidelines).
