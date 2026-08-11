import React, { createContext, useContext, useState } from 'react';
import { MOCK_USERS } from '../data/mockData';

const AuthRoleContext = createContext();

export const AuthRoleProvider = ({ children }) => {
  // Active role toggle: 'EXECUTIVE' | 'LEAD' | 'STANDARD'
  const [activeRole, setActiveRole] = useState('EXECUTIVE');

  // Map active user object based on active role toggle
  const currentUser = MOCK_USERS.find(u => u.role === activeRole) || MOCK_USERS[0];

  // RBAC Permission Helpers
  const isExecutive = activeRole === 'EXECUTIVE';
  const isLeadOrHigher = activeRole === 'EXECUTIVE' || activeRole === 'LEAD';

  const canViewFinancials = isLeadOrHigher;
  const canDownloadRestrictedDocs = isLeadOrHigher;
  const canApproveLeave = isLeadOrHigher;
  const canManageProjects = isLeadOrHigher;

  return (
    <AuthRoleContext.Provider
      value={{
        activeRole,
        setActiveRole,
        currentUser,
        isExecutive,
        isLeadOrHigher,
        canViewFinancials,
        canDownloadRestrictedDocs,
        canApproveLeave,
        canManageProjects
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = () => {
  const context = useContext(AuthRoleContext);
  if (!context) {
    throw new Error('useAuthRole must be used within an AuthRoleProvider');
  }
  return context;
};
