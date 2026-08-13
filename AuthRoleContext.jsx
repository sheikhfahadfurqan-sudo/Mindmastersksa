import React, { createContext, useContext, useState } from 'react';
import { MOCK_USERS } from '../data/mockData';

const AuthRoleContext = createContext();

export const AuthRoleProvider = ({ children }) => {
  // Active role toggle: 'EXECUTIVE' | 'ADMIN' | 'EMPLOYEE'
  const [activeRole, setActiveRole] = useState('EXECUTIVE');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const [users, setUsers] = useState(MOCK_USERS);

  // Map active user object based on active role toggle
  const currentUser = users.find(u => u.role === activeRole) || users[0];

  // Auth actions
  const logout = () => setIsLoggedIn(false);
  const login = (emailOrRole = 'EXECUTIVE', passwordInput = null) => {
    if (passwordInput !== null) {
      const found = users.find(u => u.email.toLowerCase() === emailOrRole.toLowerCase());
      if (!found) {
        throw new Error('⚠️ No corporate account found with this email.');
      }
      if (found.password && found.password !== passwordInput) {
        throw new Error('⚠️ Access Denied: Incorrect password.');
      }
      setActiveRole(found.role);
    } else if (emailOrRole && (emailOrRole === 'EXECUTIVE' || emailOrRole === 'ADMIN' || emailOrRole === 'EMPLOYEE')) {
      setActiveRole(emailOrRole);
    }
    setIsLoggedIn(true);
  };

  const removeEmployee = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
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
        users,
        removeEmployee,
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
