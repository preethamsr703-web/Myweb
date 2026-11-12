const bcrypt = require('bcryptjs');
const { getDB } = require('../config/db');

const seedCategories = [
  { slug: 'vtu-engineering', name: 'VTU Engineering', group: 'vtu', icon: 'cpu', gradient: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', description: 'Curated semester & branch-wise syllabus for VTU Visvesvaraya Technological University.' },
  { slug: 'puc-science', name: 'PUC Science (PCMB / PCMC)', group: 'puc', icon: 'atom', gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', description: '1st & 2nd PUC Physics, Chemistry, Mathematics, Biology, and Computer Science.' },
  { slug: 'puc-commerce', name: 'PUC Commerce', group: 'puc', icon: 'chart-bar', gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', description: 'Accountancy, Business Studies, Statistics, and Economics.' },
  { slug: 'puc-arts', name: 'PUC Arts', group: 'puc', icon: 'feather', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', description: 'History, Political Science, Sociology, and Literature.' },
  { slug: 'sslc-10th', name: 'SSLC / 10th Standard', group: 'school', icon: 'book-open', gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', description: 'Karnataka Secondary Education Examination Board (KSEEB) curriculum and papers.' },
  { slug: 'diploma', name: 'Polytechnic Diploma', group: 'vtu', icon: 'tool', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', description: 'Board of Technical Examinations (DTE Karnataka) engineering diploma texts.' },
  { slug: 'computer-science', name: 'Computer Science', group: 'science', icon: 'terminal', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', description: 'Algorithms, Architecture, Operating Systems, Compilers, and Networking.' },
  { slug: 'mathematics', name: 'Mathematics', group: 'science', icon: 'hash', gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', description: 'Calculus, Linear Algebra, Discrete Math, Differential Equations, and Statistics.' },
  { slug: 'physics', name: 'Physics & Relativity', group: 'science', icon: 'zap', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', description: 'Classical Mechanics, Electrodynamics, Thermodynamics, and Relativity.' },
  { slug: 'chemistry', name: 'Chemistry', group: 'science', icon: 'beaker', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', description: 'Organic, Inorganic, Physical, and Analytical Chemistry.' },
  { slug: 'biology', name: 'Biology & Life Sciences', group: 'science', icon: 'dna', gradient: 'linear-gradient(135deg, #84cc16 0%, #10b981 100%)', description: 'Cell Biology, Genetics, Biotechnology, and Human Physiology.' },
  { slug: 'artificial-intelligence', name: 'Artificial Intelligence', group: 'science', icon: 'cpu', gradient: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)', description: 'Modern heuristic search, knowledge representation, reinforcement learning, and LLMs.' },
  { slug: 'machine-learning', name: 'Machine Learning', group: 'science', icon: 'activity', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', description: 'Supervised, unsupervised models, neural networks, and deep learning architectures.' },
  { slug: 'data-science', name: 'Data Science & Big Data', group: 'science', icon: 'database', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)', description: 'Data wrangling, statistical inference, distributed computation, and visualization.' },
  { slug: 'electronics', name: 'Electronics & Communication', group: 'vtu', icon: 'radio', gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', description: 'VLSI, Digital Signal Processing, Embedded Systems, and Antennas.' },
  { slug: 'mechanical-engineering', name: 'Mechanical Engineering', group: 'vtu', icon: 'settings', gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', description: 'Fluid mechanics, heat transfer, kinematics, CAD/CAM, and thermodynamics.' },
  { slug: 'civil-engineering', name: 'Civil Engineering', group: 'vtu', icon: 'home', gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', description: 'Structural analysis, geotechnical engineering, RCC design, and surveying.' },
  { slug: 'competitive-exams', name: 'Competitive Examinations', group: 'exams', icon: 'award', gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', description: 'GATE, KCET, JEE Main/Advanced, NEET, UPSC, and KPSC KAS prep.' },
  { slug: 'space-astronomy', name: 'Space & Astronomy', group: 'science', icon: 'globe', gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', description: 'Astrophysics, cosmology, black holes, exoplanets, and space missions.' },
  { slug: 'quantum-physics', name: 'Quantum Physics', group: 'science', icon: 'disc', gradient: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)', description: 'Quantum electrodynamics, quantum computing, wave mechanics, and entanglement.' },
  { slug: 'history-philosophy', name: 'History & Philosophy', group: 'general', icon: 'compass', gradient: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)', description: 'Ancient civilizations, world history, epistemic philosophy, and ethics.' },
  { slug: 'classic-literature', name: 'Fiction & World Classics', group: 'general', icon: 'book', gradient: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', description: 'Literary masterpieces, science fiction, historical drama, and timeless narratives.' },
  { slug: 'self-development', name: 'Self Development & Mindset', group: 'general', icon: 'smile', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', description: 'Psychology, productivity, leadership, focus, and critical thinking.' },
  { slug: 'comics-graphics', name: 'Comics & Visual Knowledge', group: 'general', icon: 'image', gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', description: 'Illustrated science guides, graphic novels, visual biographies, and art.' }
];

const seedBooks = [
  // VTU CSE / ISE / AIML
  {
    title: 'Data Structures and Applications',
    author: 'Ellis Horowitz, Sartaj Sahni, Susan Anderson-Freed',
    category: 'VTU Engineering',
    subCategory: 'Computer Science and Engineering',
    academicLevel: 'vtu',
    branch: 'Computer Science and Engineering',
    semester: 3,
    subjectCode: '21CS32',
    isbn: '978-8173716058',
    coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
    description: 'Core VTU 3rd Semester CSE textbook covering Stacks, Queues, Linked Lists, Binary Trees, Threaded Trees, Graphs, and Hash Tables with C implementations.',
    publicationYear: 2023,
    publisher: 'Universities Press (VTU Prescribed)',
    edition: '2nd Edition (CBCS Scheme)',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 340,
    readsCount: 5820,
    totalPages: 560,
    syllabusLink: 'https://vtu.ac.in/en/syllabus/',
    tableOfContents: [
      { chapter: 'Module 1: Introduction to Data Structures & Arrays', page: 1 },
      { chapter: 'Module 2: Stacks and Recursion Implementation', page: 65 },
      { chapter: 'Module 3: Queues and Linked Lists (Singly & Doubly)', page: 140 },
      { chapter: 'Module 4: Trees, Traversals, and Binary Search Trees', page: 280 },
      { chapter: 'Module 5: Graphs, Minimum Spanning Trees, and Hashing', page: 410 }
    ],
    sampleContent: `# Data Structures & Applications (21CS32)
## Module 1: Introduction to Data Structures
Data structures represent systematic ways of organizing, managing, and storing data in computer memory so that operations such as searching, insertion, and deletion can be performed efficiently.

### Abstract Data Types (ADT)
An ADT specifies what operations can be performed on data, hiding the internal implementation details. Key primitives include:
- Value Definition
- Operator Definition

### Linear vs Non-Linear Structures
- **Linear**: Arrays, Stacks, Queues, Linked Lists (Sequential memory representation)
- **Non-Linear**: Trees, Graphs, Heaps (Hierarchical & Network representations)`
  },
  {
    title: 'Operating Systems: Three Easy Pieces (VTU Edition)',
    author: 'Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau',
    category: 'VTU Engineering',
    subCategory: 'Computer Science and Engineering',
    academicLevel: 'vtu',
    branch: 'Computer Science and Engineering',
    semester: 4,
    subjectCode: '21CS44',
    isbn: '978-1985086593',
    coverImage: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80',
    description: 'Renowned open-access textbook covering Virtualization (CPU & Memory), Concurrency (Threads, Locks, Condition Variables, Semaphores), and Persistence (I/O, Disks, File Systems).',
    publicationYear: 2024,
    publisher: 'Arpaci-Dusseau Books & Open Educational Repository',
    edition: 'Version 1.10 (VTU CBCS Aligned)',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.95,
    reviewsCount: 520,
    readsCount: 9400,
    totalPages: 714,
    syllabusLink: 'https://vtu.ac.in/en/syllabus/',
    tableOfContents: [
      { chapter: 'Part I: Virtualization of the CPU & Memory', page: 1 },
      { chapter: 'Part II: Concurrency, Locks & Deadlocks', page: 250 },
      { chapter: 'Part III: Persistence, Fast File Systems & RAID', page: 470 }
    ],
    sampleContent: `# Operating Systems: Three Easy Pieces
## Virtualization: The CPU
How does the operating system create the illusion that the program has multiple CPUs all to itself? Through Time Sharing and Context Switching!
### System Calls and Trap Tables
When a user process executes, it runs in user mode. To invoke hardware services, it issues a \`trap\` instruction entering kernel mode.`
  },
  {
    title: 'Automata Theory and Computability',
    author: 'John E. Hopcroft, Rajeev Motwani, Jeffrey D. Ullman',
    category: 'VTU Engineering',
    subCategory: 'Computer Science and Engineering',
    academicLevel: 'vtu',
    branch: 'Computer Science and Engineering',
    semester: 5,
    subjectCode: '21CS51',
    isbn: '978-0321455369',
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    description: 'Prescribed standard for VTU 5th semester covering Deterministic & Non-Deterministic Finite Automata, Regular Expressions, Context-Free Grammars, Pushdown Automata, and Turing Machines.',
    publicationYear: 2023,
    publisher: 'Pearson Education',
    edition: '3rd Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: false,
    rating: 4.7,
    reviewsCount: 210,
    readsCount: 4200,
    totalPages: 535,
    syllabusLink: 'https://vtu.ac.in/en/syllabus/'
  },
  {
    title: 'Computer Networks: A Systems Approach',
    author: 'Larry L. Peterson, Bruce S. Davie',
    category: 'VTU Engineering',
    subCategory: 'Computer Science & Information Science',
    academicLevel: 'vtu',
    branch: 'Computer Science and Engineering',
    semester: 5,
    subjectCode: '21CS52',
    isbn: '978-0123850591',
    coverImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
    description: 'Complete exploration of Internet architecture, TCP/IP, link-layer switching, sliding window protocols, routing algorithms (OSPF, BGP), and application-layer protocols (HTTP, DNS).',
    publicationYear: 2024,
    publisher: 'Morgan Kaufmann / Open Access Edition',
    edition: '6th Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.88,
    reviewsCount: 412,
    readsCount: 7600,
    totalPages: 680,
    syllabusLink: 'https://vtu.ac.in/en/syllabus/'
  },
  {
    title: 'Database Management Systems',
    author: 'Raghu Ramakrishnan, Johannes Gehrke',
    category: 'VTU Engineering',
    subCategory: 'Computer Science and Engineering',
    academicLevel: 'vtu',
    branch: 'Information Science and Engineering',
    semester: 5,
    subjectCode: '21CS53',
    isbn: '978-0072465631',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80',
    description: 'Relational model, Relational Algebra, SQL queries, Normalization (1NF through BCNF), Transaction Processing, ACID properties, Concurrency Control, and B+ Tree indexing.',
    publicationYear: 2022,
    publisher: 'McGraw-Hill Education',
    edition: '3rd Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: false,
    rating: 4.75,
    reviewsCount: 290,
    readsCount: 6100,
    totalPages: 1065,
    syllabusLink: 'https://vtu.ac.in/en/syllabus/'
  },
  {
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    category: 'Artificial Intelligence',
    subCategory: 'AI & Data Science',
    academicLevel: 'vtu',
    branch: 'Artificial Intelligence and Machine Learning',
    semester: 5,
    subjectCode: '21AI54',
    isbn: '978-0134610993',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80',
    description: 'The definitive textbook for AI worldwide. Covers rational agents, uninformed & informed search (A*), adversarial games, constraint satisfaction, probabilistic reasoning, and reinforcement learning.',
    publicationYear: 2023,
    publisher: 'Pearson Series in Artificial Intelligence',
    edition: '4th Global Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.96,
    reviewsCount: 890,
    readsCount: 14200,
    totalPages: 1152,
    syllabusLink: 'https://vtu.ac.in/en/syllabus/'
  },
  {
    title: 'Machine Learning',
    author: 'Tom M. Mitchell',
    category: 'Machine Learning',
    subCategory: 'AIML',
    academicLevel: 'vtu',
    branch: 'Artificial Intelligence and Machine Learning',
    semester: 7,
    subjectCode: '21CS71',
    isbn: '978-0070428072',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    description: 'Classical foundational text on Concept Learning, Decision Tree Learning, Bayesian Networks, Support Vector Machines, Instance-Based Learning, and Genetic Algorithms.',
    publicationYear: 2021,
    publisher: 'McGraw Hill',
    edition: 'International Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: false,
    rating: 4.82,
    reviewsCount: 310,
    readsCount: 5200,
    totalPages: 432
  },
  // VTU ECE & EEE
  {
    title: 'Digital Signal Processing: Principles, Algorithms & Applications',
    author: 'John G. Proakis, Dimitris G. Manolakis',
    category: 'VTU Engineering',
    subCategory: 'Electronics & Communication',
    academicLevel: 'vtu',
    branch: 'Electronics and Communication Engineering',
    semester: 5,
    subjectCode: '21EC52',
    isbn: '978-0131873742',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    description: 'Discrete-Time Signals and Systems, Z-Transforms, DFT and FFT algorithms, FIR and IIR filter design, and spectral analysis for VTU ECE 5th Semester.',
    publicationYear: 2022,
    publisher: 'Pearson Education',
    edition: '4th Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: false,
    rating: 4.72,
    reviewsCount: 180,
    readsCount: 3900,
    totalPages: 1088
  },
  {
    title: 'Microcontroller and Embedded Systems (ARM Cortex / 8051)',
    author: 'Muhammad Ali Mazidi, Janice Gillispie Mazidi, Rolin D. McKinlay',
    category: 'VTU Engineering',
    subCategory: 'Electronics & Communication',
    academicLevel: 'vtu',
    branch: 'Electronics and Communication Engineering',
    semester: 4,
    subjectCode: '21EC42',
    isbn: '978-0131194021',
    coverImage: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80',
    description: 'Assembly and C programming, hardware interfacing with LCD, Stepper Motors, ADC/DAC, Timers, Interrupts, and Serial Communication.',
    publicationYear: 2023,
    publisher: 'Pearson',
    edition: '2nd Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: false,
    rating: 4.65,
    reviewsCount: 165,
    readsCount: 3400,
    totalPages: 640
  },
  // VTU Mechanical & Civil
  {
    title: 'Thermodynamics: An Engineering Approach',
    author: 'Yunus A. Cengel, Michael A. Boles, Mehmet Kanoglu',
    category: 'Mechanical Engineering',
    subCategory: 'Thermal Engineering',
    academicLevel: 'vtu',
    branch: 'Mechanical Engineering',
    semester: 3,
    subjectCode: '21ME33',
    isbn: '978-1260048667',
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'Fundamental thermodynamics laws, energy balance, properties of pure substances, Carnot cycles, Otto, Diesel, Rankine and Brayton power cycles.',
    publicationYear: 2023,
    publisher: 'McGraw-Hill Education',
    edition: '9th Edition (SI Units)',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 390,
    readsCount: 5100,
    totalPages: 1024
  },
  {
    title: 'Design of Reinforced Concrete Structural Elements',
    author: 'N. Krishna Raju, R.N. Pranesh',
    category: 'Civil Engineering',
    subCategory: 'Structural Engineering',
    academicLevel: 'vtu',
    branch: 'Civil Engineering',
    semester: 5,
    subjectCode: '21CV51',
    isbn: '978-8123916966',
    coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
    description: 'Limit State Method according to IS 456-2000. Analysis and design of beams (singly, doubly reinforced, flanged), one-way and two-way slabs, columns, and isolated footings.',
    publicationYear: 2022,
    publisher: 'CBS Publishers & Distributors',
    edition: '5th Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: false,
    rating: 4.8,
    reviewsCount: 195,
    readsCount: 3800,
    totalPages: 612
  },
  {
    title: 'Higher Engineering Mathematics',
    author: 'Dr. B.S. Grewal',
    category: 'Mathematics',
    subCategory: 'VTU Common Cycles',
    academicLevel: 'vtu',
    branch: 'First Year (P-Cycle & C-Cycle)',
    semester: 1,
    subjectCode: '21MAT11',
    isbn: '978-8193328491',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    description: 'The golden reference for VTU 1st and 2nd Year Engineering Mathematics across all branches. Differential calculus, partial differentiation, vector calculus, double and triple integrals, Laplace transforms, Fourier series, and Z-transforms.',
    publicationYear: 2023,
    publisher: 'Khanna Publishers',
    edition: '44th Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.95,
    reviewsCount: 980,
    readsCount: 18400,
    totalPages: 1320
  },

  // PUC (1st & 2nd PUC)
  {
    title: 'NCERT Physics for Class 12 / 2nd PUC (Part I & II)',
    author: 'National Council of Educational Research and Training (NCERT)',
    category: 'PUC Science (PCMB / PCMC)',
    subCategory: 'Physics',
    academicLevel: 'puc',
    branch: 'PCMB / PCMC',
    semester: 2,
    subjectCode: 'PHY-PU2',
    isbn: '978-8174506313',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    description: 'Complete Karnataka 2nd PUC Physics curriculum: Electrostatics, Current Electricity, Moving Charges and Magnetism, Electromagnetic Induction, Wave Optics, Dual Nature of Radiation, Atoms, Nuclei, and Semiconductor Electronics.',
    publicationYear: 2024,
    publisher: 'NCERT & Karnataka Department of Pre-University Education',
    edition: 'Revised Edition 2024-2025',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.88,
    reviewsCount: 650,
    readsCount: 12100,
    totalPages: 512,
    tableOfContents: [
      { chapter: 'Chapter 1: Electric Charges and Fields', page: 1 },
      { chapter: 'Chapter 2: Electrostatic Potential and Capacitance', page: 51 },
      { chapter: 'Chapter 3: Current Electricity & Kirchhoff Rules', page: 93 },
      { chapter: 'Chapter 9: Ray Optics and Optical Instruments', page: 309 },
      { chapter: 'Chapter 14: Semiconductor Electronics & Logic Gates', page: 467 }
    ]
  },
  {
    title: 'NCERT Chemistry for Class 12 / 2nd PUC',
    author: 'NCERT Chemistry Editorial Board',
    category: 'PUC Science (PCMB / PCMC)',
    subCategory: 'Chemistry',
    academicLevel: 'puc',
    branch: 'PCMB / PCMC',
    semester: 2,
    subjectCode: 'CHEM-PU2',
    isbn: '978-8174506481',
    coverImage: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=600&q=80',
    description: 'Solutions, Electrochemistry, Chemical Kinetics, d and f Block Elements, Coordination Compounds, Haloalkanes, Alcohols, Phenols, Aldehydes, Ketones, Amines, and Biomolecules.',
    publicationYear: 2024,
    publisher: 'NCERT & Karnataka PUE Board',
    edition: 'Latest Rationalised Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: false,
    rating: 4.8,
    reviewsCount: 430,
    readsCount: 8900,
    totalPages: 480
  },
  {
    title: 'NCERT Mathematics for Class 12 / 2nd PUC',
    author: 'NCERT Mathematics Team',
    category: 'PUC Science (PCMB / PCMC)',
    subCategory: 'Mathematics',
    academicLevel: 'puc',
    branch: 'PCMB / PCMC',
    semester: 2,
    subjectCode: 'MATH-PU2',
    isbn: '978-8174506290',
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    description: 'Relations and Functions, Inverse Trigonometric Functions, Matrices, Determinants, Continuity and Differentiability, Application of Derivatives, Integrals, Differential Equations, Vector Algebra, and Probability.',
    publicationYear: 2024,
    publisher: 'NCERT & Karnataka PUE Board',
    edition: 'Latest Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.92,
    reviewsCount: 780,
    readsCount: 15400,
    totalPages: 620
  },
  {
    title: 'NCERT Biology for Class 12 / 2nd PUC',
    author: 'NCERT Biology Division',
    category: 'PUC Science (PCMB / PCMC)',
    subCategory: 'Biology',
    academicLevel: 'puc',
    branch: 'PCMB',
    semester: 2,
    subjectCode: 'BIO-PU2',
    isbn: '978-8174506399',
    coverImage: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=600&q=80',
    description: 'Sexual Reproduction in Flowering Plants, Human Reproduction, Principles of Inheritance & Variation, Molecular Basis of Inheritance, Biotechnology: Principles & Processes, and Ecology.',
    publicationYear: 2024,
    publisher: 'NCERT Publications',
    edition: '2024-2025 Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: false,
    rating: 4.85,
    reviewsCount: 390,
    readsCount: 7800,
    totalPages: 340
  },
  {
    title: '2nd PUC Accountancy: Company Accounts and Analysis of Financial Statements',
    author: 'Department of Pre-University Education Karnataka',
    category: 'PUC Commerce',
    subCategory: 'Commerce & Accounting',
    academicLevel: 'puc',
    branch: 'Commerce',
    semester: 2,
    subjectCode: 'ACC-PU2',
    isbn: '978-9387654321',
    coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    description: 'Accounting for Share Capital, Debentures, Financial Statements of a Company, Ratio Analysis, and Cash Flow Statements according to Karnataka State Syllabus.',
    publicationYear: 2023,
    publisher: 'Karnataka Textbook Society',
    edition: 'Revised Curriculum',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: false,
    rating: 4.74,
    reviewsCount: 220,
    readsCount: 4500,
    totalPages: 310
  },
  {
    title: 'Karnataka 2nd PUC Model Question Papers & Blueprints (2025-2026)',
    author: 'Karnataka School Examination and Assessment Board (KSEAB)',
    category: 'PUC Science (PCMB / PCMC)',
    subCategory: 'Examination & Solved Papers',
    academicLevel: 'puc',
    branch: 'PCMB / PCMC / Commerce',
    semester: 2,
    subjectCode: 'QP-PU2-ALL',
    isbn: 'KSEAB-PUC-2025',
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    description: 'Official KSEAB model question papers with blueprints, chapter-wise marks weightage, 1-mark multiple choice questions, 2-mark, 3-mark, and 5-mark long answer keys for Physics, Chemistry, Maths, Biology, and Accountancy.',
    publicationYear: 2025,
    publisher: 'KSEAB Government of Karnataka',
    edition: '2025-2026 Official Release',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.97,
    reviewsCount: 1120,
    readsCount: 21500,
    totalPages: 240
  },

  // SSLC / 10th Standard
  {
    title: 'Karnataka SSLC Class 10 Mathematics (English & Kannada Medium)',
    author: 'Karnataka Textbook Society (KTBS)',
    category: 'SSLC / 10th Standard',
    subCategory: 'Mathematics',
    academicLevel: 'sslc',
    branch: '10th Standard',
    semester: 1,
    subjectCode: '81-E / 81-K',
    isbn: '978-8194451201',
    coverImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
    description: 'Arithmetic Progressions, Triangles, Pair of Linear Equations in Two Variables, Circles, Constructions, Coordinate Geometry, Quadratic Equations, Introduction to Trigonometry, Surface Areas and Volumes, and Statistics.',
    publicationYear: 2024,
    publisher: 'KTBS Bengaluru',
    edition: 'State Syllabus Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.89,
    reviewsCount: 840,
    readsCount: 16800,
    totalPages: 280
  },
  {
    title: 'Karnataka SSLC Class 10 Science (Physics, Chemistry & Biology)',
    author: 'KTBS Science Editorial Board',
    category: 'SSLC / 10th Standard',
    subCategory: 'Science',
    academicLevel: 'sslc',
    branch: '10th Standard',
    semester: 1,
    subjectCode: '83-E / 83-K',
    isbn: '978-8194451218',
    coverImage: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
    description: 'Chemical Reactions and Equations, Acids, Bases and Salts, Metals and Non-metals, Carbon and its Compounds, Life Processes, Control and Coordination, Light - Reflection and Refraction, Electricity, and Magnetic Effects of Electric Current.',
    publicationYear: 2024,
    publisher: 'KTBS Bengaluru',
    edition: 'Official State Textbook',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: false,
    rating: 4.86,
    reviewsCount: 670,
    readsCount: 13900,
    totalPages: 320
  },
  {
    title: 'Karnataka SSLC 10-Year Solved Question Papers & Model Question Bank',
    author: 'KSEAB State Academic Cell',
    category: 'SSLC / 10th Standard',
    subCategory: 'Previous Year Papers',
    academicLevel: 'sslc',
    branch: '10th Standard',
    semester: 1,
    subjectCode: 'SSLC-SOLVED-10Y',
    isbn: 'KSEAB-SSLC-BANK',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    description: 'Previous 10 years of solved SSLC board examination question papers with step-by-step marking scheme, Kannada and English versions, key tips to score 625/625.',
    publicationYear: 2025,
    publisher: 'Karnataka School Examination and Assessment Board',
    edition: '2025 Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.96,
    reviewsCount: 1450,
    readsCount: 28400,
    totalPages: 360
  },

  // Science & Knowledge Universe
  {
    title: 'Cosmos: A Personal Voyage',
    author: 'Carl Sagan',
    category: 'Space & Astronomy',
    subCategory: 'Cosmology',
    academicLevel: 'science',
    branch: 'Astrophysics',
    isbn: '978-0345539434',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    description: 'Fifteen billion years of cosmic evolution exploring galaxies, stars, planets, origin of life on Earth, and humanity’s future in the interstellar universe.',
    publicationYear: 2013,
    publisher: 'Ballantine Books',
    edition: 'Illustrated Collector Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.98,
    reviewsCount: 2100,
    readsCount: 32000,
    totalPages: 384,
    tableOfContents: [
      { chapter: 'Chapter 1: The Shores of the Cosmic Ocean', page: 1 },
      { chapter: 'Chapter 2: One Voice in the Cosmic Fugue', page: 24 },
      { chapter: 'Chapter 3: The Harmony of Worlds (Kepler & Newton)', page: 48 },
      { chapter: 'Chapter 8: Journeys in Space and Time (Einstein)', page: 180 },
      { chapter: 'Chapter 13: Who Speaks for Earth?', page: 310 }
    ],
    sampleContent: `# Cosmos: The Shores of the Cosmic Ocean
The Cosmos is all that is or ever was or ever will be. Our feeblest contemplations of the Cosmos stir us—there is a tingling in the spine, a catch in the voice, a faint sensation, as if a distant memory, of falling from a height. We know we are approaching the greatest of mysteries.

The size and age of the Cosmos are beyond ordinary human understanding. Lost somewhere between immensity and eternity is our tiny planetary home.`
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    category: 'Space & Astronomy',
    subCategory: 'Theoretical Physics',
    academicLevel: 'science',
    branch: 'Astrophysics & Cosmology',
    isbn: '978-0553380163',
    coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
    description: 'Stephen Hawking guides readers through black holes, the Big Bang, expanding universes, the arrow of time, and the quest for a Unified Theory of Everything.',
    publicationYear: 2017,
    publisher: 'Bantam Books',
    edition: 'Updated Illustrated Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.93,
    reviewsCount: 1890,
    readsCount: 27500,
    totalPages: 256
  },
  {
    title: 'Deep Learning',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    category: 'Artificial Intelligence',
    subCategory: 'Neural Networks & Deep Learning',
    academicLevel: 'science',
    branch: 'Computer Science & AI',
    isbn: '978-0262035613',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    description: 'The definitive textbook for Deep Learning praised by Elon Musk and Yann LeCun. Applied math, deep feedforward networks, regularization, optimization, convolutional networks, sequence modeling, and generative models.',
    publicationYear: 2016,
    publisher: 'MIT Press (Authorized Open Text)',
    edition: 'Open Access Web & PDF Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.94,
    reviewsCount: 1420,
    readsCount: 22100,
    totalPages: 800,
    externalSourceUrl: 'https://www.deeplearningbook.org/'
  },
  {
    title: 'Relativity: The Special and General Theory',
    author: 'Albert Einstein',
    category: 'Quantum Physics',
    subCategory: 'Theoretical Physics',
    academicLevel: 'science',
    branch: 'Physics',
    isbn: '978-0517029619',
    coverImage: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=600&q=80',
    description: 'Albert Einstein’s own clear explanation of the special theory of relativity, the Lorentz transformation, space-time continuum, and general relativity curved spacetime for general readers.',
    publicationYear: 1920,
    publisher: 'Project Gutenberg Public Domain Archive',
    edition: 'Classic Authorized Translation by Robert W. Lawson',
    format: 'OpenAccess',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.95,
    reviewsCount: 940,
    readsCount: 19200,
    totalPages: 168,
    externalSourceUrl: 'https://www.gutenberg.org/ebooks/5001'
  },
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin ("Uncle Bob")',
    category: 'Computer Science',
    subCategory: 'Software Engineering',
    academicLevel: 'general',
    branch: 'Software Engineering',
    isbn: '978-0132350884',
    coverImage: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=600&q=80',
    description: 'Essential software craftsmanship guide covering meaningful names, small functions, formatting, error handling, unit testing, classes, concurrency, and refactoring.',
    publicationYear: 2008,
    publisher: 'Prentice Hall',
    edition: '1st Edition',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.87,
    reviewsCount: 1650,
    readsCount: 25400,
    totalPages: 464
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    category: 'History & Philosophy',
    subCategory: 'Anthropology & World History',
    academicLevel: 'general',
    branch: 'World History',
    isbn: '978-0062316097',
    coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80',
    description: 'How an insignificant ape became the ruler of planet Earth, covering the Cognitive Revolution, Agricultural Revolution, and Scientific Revolution.',
    publicationYear: 2015,
    publisher: 'Harper',
    edition: 'International Bestseller',
    format: 'PDF',
    isOpenAccess: true,
    isFeatured: true,
    rating: 4.89,
    reviewsCount: 2400,
    readsCount: 38900,
    totalPages: 464
  }
];

const seedUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  const librarianPassword = await bcrypt.hash('Librarian@123', salt);
  const studentPassword = await bcrypt.hash('Student@123', salt);

  return [
    {
      _id: '65a000000000000000000001',
      name: 'Dr. Ramesh Narayan',
      email: 'admin@library.gov.in',
      password: adminPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      academicLevel: 'Administrator',
      branch: 'Central Library Directorate',
      semester: 8,
      savedBooks: [],
      favorites: [],
      bookmarks: [],
      readingHistory: [],
      studyStats: {
        hoursSpent: 120.0,
        booksCompleted: 45,
        comprehensionRate: 99.2,
        activeCourses: 18
      }
    },
    {
      _id: '65a000000000000000000002',
      name: 'Smt. Kavitha Deshmukh',
      email: 'librarian@library.gov.in',
      password: librarianPassword,
      role: 'librarian',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      academicLevel: 'Chief Academic Librarian',
      branch: 'Digital Collections & VTU Repositories',
      semester: 8,
      savedBooks: [],
      favorites: [],
      bookmarks: [],
      readingHistory: [],
      studyStats: {
        hoursSpent: 85.0,
        booksCompleted: 32,
        comprehensionRate: 98.8,
        activeCourses: 14
      }
    },
    {
      _id: '65a000000000000000000003',
      name: 'Alex Vance',
      email: 'alex@student.edu',
      password: studentPassword,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      academicLevel: 'VTU Engineering',
      branch: 'Computer Science and Engineering',
      semester: 5,
      savedBooks: [],
      favorites: [],
      bookmarks: [
        {
          bookId: 'doc_seed_1',
          title: 'Data Structures and Applications',
          page: 142,
          note: 'Review Binary Search Tree balancing (AVL & Red-Black rotations)',
          createdAt: new Date().toISOString()
        },
        {
          bookId: 'doc_seed_2',
          title: 'Operating Systems: Three Easy Pieces',
          page: 65,
          note: 'Deadlock avoidance & Banker’s algorithm proof',
          createdAt: new Date().toISOString()
        }
      ],
      readingHistory: [
        {
          bookId: 'doc_seed_1',
          title: 'Data Structures and Applications',
          author: 'Ellis Horowitz, Sartaj Sahni',
          coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
          category: 'VTU Engineering',
          progress: 68,
          lastReadPage: 142,
          totalPages: 560,
          lastReadAt: new Date().toISOString()
        },
        {
          bookId: 'doc_seed_2',
          title: 'Operating Systems: Three Easy Pieces',
          author: 'Remzi H. Arpaci-Dusseau',
          coverImage: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80',
          category: 'VTU Engineering',
          progress: 45,
          lastReadPage: 65,
          totalPages: 714,
          lastReadAt: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          bookId: 'doc_seed_cosmos',
          title: 'Cosmos: A Personal Voyage',
          author: 'Carl Sagan',
          coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
          category: 'Space & Astronomy',
          progress: 88,
          lastReadPage: 310,
          totalPages: 384,
          lastReadAt: new Date(Date.now() - 3600000 * 48).toISOString()
        }
      ],
      studyStats: {
        hoursSpent: 24.5,
        booksCompleted: 18,
        comprehensionRate: 98.5,
        activeCourses: 12
      }
    }
  ];
};

const runSeed = async () => {
  const { User, Book, Category, Suggestion, AuditLog } = getDB();

  console.log('[Seed] Seeding Categories...');
  for (const cat of seedCategories) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (!existing) {
      await Category.create(cat);
    }
  }

  console.log('[Seed] Seeding Books...');
  for (const b of seedBooks) {
    const existing = await Book.findOne({ title: b.title });
    if (!existing) {
      await Book.create(b);
    }
  }

  console.log('[Seed] Seeding Accounts (Admin, Librarian, Alex)...');
  const users = await seedUsers();
  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (!existing) {
      await User.create(u);
    }
  }

  console.log('[Seed] Seeding Suggestions & Audit Logs...');
  const existingSug = await Suggestion.countDocuments();
  if (existingSug === 0) {
    await Suggestion.create({
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      category: 'Computer Science',
      reason: 'Essential reference for distributed systems, replication, and consensus for VTU 7th semester students.',
      suggestedBy: { name: 'Alex Vance', email: 'alex@student.edu' },
      status: 'pending'
    });
  }

  const existingAudit = await AuditLog.countDocuments();
  if (existingAudit === 0) {
    await AuditLog.create({
      action: 'SYSTEM_INITIALIZED',
      performedBy: { name: 'Dr. Ramesh Narayan', email: 'admin@library.gov.in', role: 'admin' },
      details: 'Digital Public Library 3D Matrix initialized with complete VTU, PUC, and Science catalogs.'
    });
  }

  console.log('[Seed] Database initialization complete!');
};

module.exports = {
  runSeed,
  seedCategories,
  seedBooks,
  seedUsers
};

if (require.main === module) {
  const { connectDB } = require('../config/db');
  connectDB().then(() => runSeed());
}
