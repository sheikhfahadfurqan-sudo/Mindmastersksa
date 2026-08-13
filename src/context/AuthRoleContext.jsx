import React, { createContext, useContext, useState } from 'react';
import { MOCK_USERS } from '../data/mockData';

const AuthRoleContext = createContext();

export const AuthRoleProvider = ({ children }) => {
  // Active role toggle: 'EXECUTIVE' | 'ADMIN' | 'EMPLOYEE'
  const [activeRole, setActiveRole] = useState('EXECUTIVE');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Map active user object based on active role toggle
  const currentUser = MOCK_USERS.find(u => u.role === activeRole) || MOCK_USERS[0];

  // Auth actions
  const logout = () => setIsLoggedIn(false);
  const login = (role = 'EXECUTIVE') => {
    if (role && (role === 'EXECUTIVE' || role === 'ADMIN' || role === 'EMPLOYEE')) {
      setActiveRole(role);
    }
    setIsLoggedIn(true);
  };

  // RBAC Permission Helpers
  const isExecutive = activeRole === 'EXECUTIVE';
  const isAdmin = activeRole === 'ADMIN';
  const isEmployee = activeRole === 'EMPLOYEE';
  const isLeadOrHigher = activeRole === 'EXECUTIVE' || activeRole === 'ADMIN';

  const canViewFinancials = isLeadOrHigher;
  const canDownloadRestrictedDocs = isLeadOrHigher;
  const canApproveLeave = isLeadOrHigher;
  const canManageProjects = isLeadOrHigher;

  return (
    <AuthRoleContext.Provider
      value={{
        activeRole,
        setActiveRole,
        isLoggedIn,
        login,
        logout,
        currentUser,
        isExecutive,
        isAdmin,
        isEmployee,
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
