// Mock Dataset for Mind Masters KSA Prototype (25 Employees, CRM, Projects, Tasks, Documents, HR)

export const MOCK_USERS = [
  { id: 'u1', name: 'Tariq Al-Mansoor', email: 'tariq.mansoor@mindmasters.sa', role: 'EXECUTIVE', title: 'Chief Executive Officer', department: 'Executive', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', salarySAR: 120000 },
  { id: 'u2', name: 'Dr. Reem Al-Saud', email: 'reem.alsaud@mindmasters.sa', role: 'EXECUTIVE', title: 'VP of Digital Transformation', department: 'Executive', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', salarySAR: 95000 },
  { id: 'u3', name: 'Sarah Al-Ghamdi', email: 'sarah.ghamdi@mindmasters.sa', role: 'ADMIN', title: 'Head of PMO & Enterprise Delivery', department: 'Operations', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80', salarySAR: 48000 },
  { id: 'u4', name: 'Eng. Omar Al-Zahrani', email: 'omar.zahrani@mindmasters.sa', role: 'ADMIN', title: 'Lead Systems Architect', department: 'Engineering', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', salarySAR: 42000 },
  { id: 'u5', name: 'Fahad K. Al-Otaibi', email: 'fahad.otaibi@mindmasters.sa', role: 'EMPLOYEE', title: 'Senior Full Stack Developer', department: 'Engineering', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', salarySAR: 28000 },
  { id: 'u6', name: 'Noura Al-Dosari', email: 'noura.dosari@mindmasters.sa', role: 'EMPLOYEE', title: 'Lead UI/UX Product Designer', department: 'Design', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', salarySAR: 26000 },
  { id: 'u7', name: 'Youssef Al-Harbi', email: 'youssef.harbi@mindmasters.sa', role: 'EMPLOYEE', title: 'DevOps & Cloud Engineer', department: 'Infrastructure', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80', salarySAR: 25000 },
  { id: 'u8', name: 'Mona Al-Mutairi', email: 'mona.mutairi@mindmasters.sa', role: 'EMPLOYEE', title: 'Business Analyst', department: 'Operations', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80', salarySAR: 22000 }
];

export const MOCK_CLIENTS = [
  {
    id: 'c1',
    companyName: 'Saudi Aramco Digital',
    contactPerson: 'Eng. Majed Al-Ruwaili',
    email: 'majed.ruwaili@aramco.com',
    phone: '+966 13 872 0000',
    stage: 'CLOSED_WON',
    contractValueSAR: 3850000,
    ownerName: 'Sarah Al-Ghamdi',
    region: 'Dhahran / Eastern Province',
    documentsCount: 4
  },
  {
    id: 'c2',
    companyName: 'NEOM Technology Hub',
    contactPerson: 'Dr. Faisal Al-Shehri',
    email: 'faisal.shehri@neom.sa',
    phone: '+966 14 400 1111',
    stage: 'PROPOSAL',
    contractValueSAR: 2400000,
    ownerName: 'Dr. Reem Al-Saud',
    region: 'Tabuk / NEOM Zone',
    documentsCount: 3
  },
  {
    id: 'c3',
    companyName: 'Red Sea Global (RSG)',
    contactPerson: 'Layla Al-Khatib',
    email: 'layla.khatib@redseaglobal.com',
    phone: '+966 11 299 8888',
    stage: 'LEAD',
    contractValueSAR: 1750000,
    ownerName: 'Tariq Al-Mansoor',
    region: 'Riyadh HQ',
    documentsCount: 2
  },
  {
    id: 'c4',
    companyName: 'Diriyah Gate Development Authority (DGDA)',
    contactPerson: 'Hassan Al-Husseini',
    email: 'hassan@dgda.gov.sa',
    phone: '+966 11 482 9999',
    stage: 'CLOSED_WON',
    contractValueSAR: 4200000,
    ownerName: 'Sarah Al-Ghamdi',
    region: 'Diriyah / Riyadh',
    documentsCount: 5
  }
];

export const MOCK_PROJECTS = [
  {
    id: 'p1',
    name: 'Aramco Cloud Intelligence Platform',
    clientId: 'c1',
    clientName: 'Saudi Aramco Digital',
    managerId: 'u3',
    managerName: 'Sarah Al-Ghamdi',
    startDate: '2026-06-01',
    targetDate: '2026-11-30',
    status: 'ACTIVE',
    budgetSAR: 3850000,
    progressPercent: 65,
    tasksCount: 12
  },
  {
    id: 'p2',
    name: 'NEOM Smart City Operations Core',
    clientId: 'c2',
    clientName: 'NEOM Technology Hub',
    managerId: 'u4',
    managerName: 'Eng. Omar Al-Zahrani',
    startDate: '2026-07-15',
    targetDate: '2026-12-20',
    status: 'PLANNING',
    budgetSAR: 2400000,
    progressPercent: 25,
    tasksCount: 8
  },
  {
    id: 'p3',
    name: 'DGDA Heritage Portal & AI Analytics',
    clientId: 'c4',
    clientName: 'Diriyah Gate Development Authority',
    managerId: 'u3',
    managerName: 'Sarah Al-Ghamdi',
    startDate: '2026-04-10',
    targetDate: '2026-09-30',
    status: 'ACTIVE',
    budgetSAR: 4200000,
    progressPercent: 82,
    tasksCount: 15
  }
];

export const MOCK_TASKS = [
  {
    id: 't1',
    projectId: 'p1',
    projectName: 'Aramco Cloud Intelligence',
    name: 'Implement OAuth2 / SAML SSO Integration with Aramco Directory',
    assigneeId: 'u5',
    assigneeName: 'Fahad K. Al-Otaibi',
    assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    priority: 'URGENT',
    dueDate: '2026-08-15',
    status: 'IN_PROGRESS',
    startDate: '2026-08-01'
  },
  {
    id: 't2',
    projectId: 'p1',
    projectName: 'Aramco Cloud Intelligence',
    name: 'Security Audit & Vulnerability Assessment Report',
    assigneeId: 'u7',
    assigneeName: 'Youssef Al-Harbi',
    assigneeAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    priority: 'HIGH',
    dueDate: '2026-08-18',
    status: 'REVIEW',
    startDate: '2026-08-05'
  },
  {
    id: 't3',
    projectId: 'p2',
    projectName: 'NEOM Smart City Operations Core',
    name: 'Draft Microservices Architecture & Data Flow Diagram',
    assigneeId: 'u4',
    assigneeName: 'Eng. Omar Al-Zahrani',
    assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    priority: 'HIGH',
    dueDate: '2026-08-25',
    status: 'IN_PROGRESS',
    startDate: '2026-08-10'
  },
  {
    id: 't4',
    projectId: 'p3',
    projectName: 'DGDA Heritage Portal',
    name: 'Finalize 3D Interactive Map Assets & UI Components',
    assigneeId: 'u6',
    assigneeName: 'Noura Al-Dosari',
    assigneeAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    priority: 'MEDIUM',
    dueDate: '2026-08-22',
    status: 'COMPLETE',
    startDate: '2026-08-02'
  },
  {
    id: 't5',
    projectId: 'p3',
    projectName: 'DGDA Heritage Portal',
    name: 'Load Testing & Arabic Localization Verification',
    assigneeId: 'u8',
    assigneeName: 'Mona Al-Mutairi',
    assigneeAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80',
    priority: 'MEDIUM',
    dueDate: '2026-08-28',
    status: 'TODO',
    startDate: '2026-08-20'
  }
];

export const MOCK_DOCUMENTS = [
  {
    id: 'd1',
    title: 'Mind Masters KSA Q3 Financial Audit & Revenue Projections.pdf',
    category: 'Finance & Strategy',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '4.2 MB',
    clearance: 'RESTRICTED', // Restricted to Executive & Lead
    uploadedByName: 'Tariq Al-Mansoor',
    createdAt: '2026-08-01'
  },
  {
    id: 'd2',
    title: 'Saudi Aramco Master Service Agreement (MSA)_Signed.pdf',
    category: 'Legal Contracts',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '8.7 MB',
    clearance: 'RESTRICTED',
    uploadedByName: 'Sarah Al-Ghamdi',
    createdAt: '2026-07-28'
  },
  {
    id: 'd3',
    title: 'NEOM Smart City Tech Proposal v2.4.docx',
    category: 'Client Proposals',
    fileUrl: '#',
    fileSize: '2.1 MB',
    clearance: 'INTERNAL',
    uploadedByName: 'Dr. Reem Al-Saud',
    createdAt: '2026-08-05'
  },
  {
    id: 'd4',
    title: 'Corporate Employee Handbook & Conduct Policy 2026.pdf',
    category: 'Human Resources',
    fileUrl: '#',
    fileSize: '1.4 MB',
    clearance: 'PUBLIC',
    uploadedByName: 'Mona Al-Mutairi',
    createdAt: '2026-01-10'
  },
  {
    id: 'd5',
    title: 'Cybersecurity Compliance & Data Sovereignty Standards (KSA NCA).pdf',
    category: 'Infrastructure & Security',
    fileUrl: '#',
    fileSize: '3.8 MB',
    clearance: 'INTERNAL',
    uploadedByName: 'Eng. Omar Al-Zahrani',
    createdAt: '2026-06-15'
  }
];

export const MOCK_LEAVE_REQUESTS = [
  {
    id: 'l1',
    employeeId: 'u5',
    employeeName: 'Fahad K. Al-Otaibi',
    employeeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    title: 'Senior Full Stack Dev',
    department: 'Engineering',
    leaveType: 'VACATION',
    startDate: '2026-08-20',
    endDate: '2026-08-27',
    reason: 'Annual family leave for Umrah and staying with relatives in Makkah.',
    status: 'PENDING',
    createdAt: '2026-08-08'
  },
  {
    id: 'l2',
    employeeId: 'u6',
    employeeName: 'Noura Al-Dosari',
    employeeAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    title: 'Lead UI/UX Designer',
    department: 'Design',
    leaveType: 'PERSONAL',
    startDate: '2026-08-14',
    endDate: '2026-08-16',
    reason: 'Attending KSA Tech & Design Summit as guest speaker.',
    status: 'APPROVED',
    approvedByName: 'Sarah Al-Ghamdi',
    createdAt: '2026-08-02'
  },
  {
    id: 'l3',
    employeeId: 'u7',
    employeeName: 'Youssef Al-Harbi',
    employeeAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    leaveType: 'SICK',
    startDate: '2026-08-11',
    endDate: '2026-08-12',
    reason: 'Medical checkup and recovery at King Faisal Specialist Hospital.',
    status: 'APPROVED',
    approvedByName: 'Tariq Al-Mansoor',
    createdAt: '2026-08-10'
  }
];
