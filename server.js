/**
 * Node.js / Express Backend REST API Router for Mind Masters KSA
 * Includes Role-Based Access Control (RBAC) middleware and Data Masking rules.
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Simulated Database / Seed Data
let users = [
  { id: 'u1', name: 'Tariq Al-Mansoor', email: 'tariq@mindmasters.sa', role: 'EXECUTIVE', department: 'Executive', title: 'Managing Director', salarySAR: 95000 },
  { id: 'u2', name: 'Sarah Al-Ghamdi', email: 'sarah@mindmasters.sa', role: 'LEAD', department: 'Operations', title: 'Head of PMO', salarySAR: 45000 },
  { id: 'u3', name: 'Fahad K. Al-Zahrani', email: 'fahad@mindmasters.sa', role: 'STANDARD', department: 'Engineering', title: 'Senior Full Stack Dev', salarySAR: 28000 }
];

let clients = [
  { id: 'c1', companyName: 'Aramco Innovation Labs', contactPerson: 'Eng. Khalid Al-Otaibi', email: 'khalid@aramco.com', stage: 'CLOSED_WON', contractValueSAR: 1450000 },
  { id: 'c2', companyName: 'NEOM Tech Digital', contactPerson: 'Dr. Reem Al-Saud', email: 'reem@neom.sa', stage: 'PROPOSAL', contractValueSAR: 890000 }
];

let documents = [
  { id: 'd1', title: 'Mind Masters KSA Q3 Strategic Plan.pdf', category: 'Executive Strategy', fileUrl: '/files/q3_plan.pdf', clearance: 'RESTRICTED', uploadedById: 'u1' },
  { id: 'd2', title: 'Employee Onboarding Guide 2026.pdf', category: 'Human Resources', fileUrl: '/files/onboarding.pdf', clearance: 'PUBLIC', uploadedById: 'u2' }
];

let leaveRequests = [
  { id: 'l1', employeeId: 'u3', leaveType: 'VACATION', startDate: '2026-08-20', endDate: '2026-08-27', reason: 'Personal family trip to Makkah', status: 'PENDING' }
];

// RBAC Middleware Generator
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'] || 'STANDARD';
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Access Denied: Insufficient Clearance Level', role: userRole });
    }
    req.userRole = userRole;
    next();
  };
};

// 1. CLIENTS ENDPOINTS (CRM)
app.get('/api/clients', (req, res) => {
  const role = req.headers['x-user-role'] || 'STANDARD';
  
  // Data masking for Standard role
  const responseData = clients.map(client => {
    if (role === 'STANDARD') {
      return {
        ...client,
        contractValueSAR: null,
        financialsMasked: true
      };
    }
    return client;
  });

  res.json({ success: true, data: responseData, requesterRole: role });
});

// 2. RESTRICTED DOCUMENT VAULT ENDPOINTS
app.get('/api/documents', (req, res) => {
  const role = req.headers['x-user-role'] || 'STANDARD';

  // Filter restricted documents or obscure metadata for Standard users
  const filteredDocs = documents.map(doc => {
    if (role === 'STANDARD' && doc.clearance === 'RESTRICTED') {
      return {
        ...doc,
        fileUrl: null,
        restrictedAccess: true,
        message: 'Download Restricted to Executive & Lead Roles'
      };
    }
    return doc;
  });

  res.json({ success: true, data: filteredDocs });
});

// 3. HR LEAVE APPROVAL QUEUE (RESTRICTED TO EXECUTIVE & LEAD)
app.get('/api/hr/approval-queue', requireRole(['EXECUTIVE', 'LEAD']), (req, res) => {
  res.json({ success: true, pendingRequests: leaveRequests });
});

app.post('/api/hr/leave-requests/:id/approve', requireRole(['EXECUTIVE', 'LEAD']), (req, res) => {
  const { id } = req.params;
  const leave = leaveRequests.find(l => l.id === id);
  if (leave) {
    leave.status = 'APPROVED';
    leave.reviewedAt = new Date().toISOString();
    return res.json({ success: true, message: 'Leave approved successfully', leave });
  }
  res.status(404).json({ error: 'Leave request not found' });
});

// 4. SANITIZED TEAM CALENDAR (PUBLIC TO ALL EMPLOYEES)
app.get('/api/hr/team-calendar', (req, res) => {
  // Obscure reasons and salary info for calendar
  const sanitizedCalendar = leaveRequests
    .filter(l => l.status === 'APPROVED')
    .map(l => ({
      id: l.id,
      employeeId: l.employeeId,
      startDate: l.startDate,
      endDate: l.endDate,
      status: 'OUT_OF_OFFICE'
    }));

  res.json({ success: true, calendar: sanitizedCalendar });
});

// Server Initialization
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Mind Masters KSA API Server running on port ${PORT}`);
  });
}

export default app;
