import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS, MOCK_NOTIFICATIONS, MOCK_EXPENSES } from '../data/mockData';
import { supabase } from '../lib/supabaseClient';

const AuthRoleContext = createContext();

export const TRANSLATIONS = {
  en: {
    brand: 'MIND MASTERS KSA',
    subtitle: 'Enterprise Workspace & CRM Architecture',
    region: 'KSA REGION',
    role: 'Role:',
    exec: 'Executive',
    pm: 'PM / Director',
    accounts: 'Accounts',
    employee: 'Employee',
    dashboard: 'Executive Overview',
    expenses: 'Accounts & Expenses',
    crm: 'CRM & Clients',
    projects: 'Projects & Tasks',
    vault: 'Document Vault',
    hr: 'HR & Absence Queue',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    ms365Sso: 'Sign in with Microsoft 365 (Azure Entra ID)',
    domainNotice: 'Restricted Access: @mindmastersksa.com corporate email domain only',
    uploadBill: '+ Upload Expense Bill (SAR)',
    step1Submitted: 'Step 1: Submitted (Accounts Queue)',
    step2Verified: 'Step 2: Verified (Executive Queue)',
    step3Approved: 'Step 3: Approved for Payout',
    verifyRoute: 'Verify & Route to Exec',
    finalApprove: 'Final Approve & Disburse',
    reject: 'Reject',
    disbursed: 'Disbursed',
    basicSalary: 'Basic Salary',
    housing: 'Housing Allowance (25%)',
    transport: 'Transportation Allowance (10%)',
    gosi: 'GOSI Pension Deduction (9.75%)',
    netSalary: 'Net In-Hand Salary',
    executePayout: 'Execute Monthly Payout Run',
    wpsStatus: 'SAMA Wage Protection System (WPS) Status',
    viewPayslip: 'View & Download Payslip'
  },
  ar: {
    brand: 'مايند ماسترز السعودية',
    subtitle: 'منظومة إدارة المؤسسات والعملاء والمشاريع',
    region: 'المملكة العربية السعودية',
    role: 'مستوى الصلاحية:',
    exec: 'الإدارة التنفيذية',
    pm: 'مدير المشاريع',
    accounts: 'فريق الحسابات',
    employee: 'موظف',
    dashboard: 'اللوحة الرئيسية',
    expenses: 'الحسابات والمصروفات',
    crm: 'إدارة العملاء والعقود',
    projects: 'المشاريع والمهام',
    vault: 'خزينة المستندات',
    hr: 'الموارد البشرية والرواتب',
    signOut: 'تسجيل الخروج',
    signIn: 'تسجيل الدخول',
    ms365Sso: 'تسجيل الدخول عبر Microsoft 365 (Azure Entra ID)',
    domainNotice: 'دخول محصور رسميًا بنطاق البريد الإلكتروني @mindmastersksa.com',
    uploadBill: '+ رفع فاتورة مصروفات (ر.س)',
    step1Submitted: 'المرحلة 1: المرفوعة (قائمة تدقيق الحسابات)',
    step2Verified: 'المرحلة 2: المدققة (قائمة اعتماد الإدارة)',
    step3Approved: 'المرحلة 3: المعتمدة للصرف',
    verifyRoute: 'تدقيق وتمرير للإدارة',
    finalApprove: 'اعتماد نهائي وصرف',
    reject: 'رفض الفاتورة',
    disbursed: 'تم الصرف بنجاح',
    basicSalary: 'الراتب الأساسي',
    housing: 'بدل السكن (25%)',
    transport: 'بدل المواصلات (10%)',
    gosi: 'خصم التأمينات الاجتماعية GOSI (9.75%)',
    netSalary: 'صافي الراتب المحول',
    executePayout: 'تنفيذ صرف الرواتب الشهري (SAMA WPS)',
    wpsStatus: 'حالة نظام حماية الأجور السعودي (SAMA WPS)',
    viewPayslip: 'عرض وتحميل مسير الراتب'
  }
};

export const AuthRoleProvider = ({ children }) => {
  // Global Language State: 'en' | 'ar'
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('mm_language') || 'en';
  });

  // Active role toggle: 'EXECUTIVE' | 'PROJECT_MANAGER' | 'ACCOUNTS' | 'EMPLOYEE'
  const [activeRole, setActiveRole] = useState('EXECUTIVE');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [users, setUsers] = useState(MOCK_USERS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);

  // Check Supabase session on mount & listen to Microsoft OAuth return
  useEffect(() => {
    if (supabase && supabase.auth) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const userEmail = session.user.email || '';
          if (userEmail.toLowerCase().endsWith('@mindmastersksa.com') || userEmail.toLowerCase().endsWith('@mindmasters.com')) {
            setIsLoggedIn(true);
          }
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const userEmail = session.user.email || '';
          if (userEmail.toLowerCase().endsWith('@mindmastersksa.com') || userEmail.toLowerCase().endsWith('@mindmasters.com')) {
            setIsLoggedIn(true);
          }
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Sync document direction (dir="rtl" or "ltr") on language change
  useEffect(() => {
    const html = document.documentElement;
    if (language === 'ar') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
    }
    localStorage.setItem('mm_language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'en' ? 'ar' : 'en');
  };

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'ar') {
      setLanguageState(lang);
    }
  };

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  // Active current user mapped to selected role
  const currentUser = users.find(u => u.role === activeRole) || users[0];

  // Domain security validator
  const validateCorporateDomain = (email) => {
    if (!email || !email.toLowerCase().endsWith('@mindmastersksa.com')) {
      throw new Error(language === 'ar' 
        ? '⚠️ تم رفض الدخول: محصور بشركات @mindmastersksa.com فقط.' 
        : '⚠️ Access Denied: Only @mindmastersksa.com corporate email addresses are authorized.');
    }
  };

  // Microsoft 365 (Azure Entra ID) SSO Auth Trigger
  const loginWithMicrosoft365 = async () => {
    try {
      if (supabase && supabase.auth) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'azure',
          options: {
            scopes: 'email profile User.Read',
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      } else {
        // Fallback simulation for dev environment
        setActiveRole('EXECUTIVE');
        setIsLoggedIn(true);
      }
    } catch (err) {
      throw new Error(`Microsoft 365 Auth Error: ${err.message}`);
    }
  };

  // Standard Email Authentication
  const login = (emailOrRole = 'EXECUTIVE', passwordInput = null) => {
    if (passwordInput !== null) {
      // Validate corporate domain security rule
      validateCorporateDomain(emailOrRole);

      const found = users.find(u => u.email.toLowerCase() === emailOrRole.toLowerCase());
      if (!found) {
        throw new Error(language === 'ar' 
          ? '⚠️ تم رفض الدخول: لا يوجد حساب شركة مسجل بهذا البريد.' 
          : '⚠️ Access Denied: No corporate account found matching this email.');
      }
      if (found.password && found.password !== passwordInput) {
        throw new Error(language === 'ar' 
          ? '⚠️ تم رفض الدخول: كلمة المرور غير صحيحة.' 
          : '⚠️ Access Denied: Incorrect corporate password.');
      }
      setActiveRole(found.role);
    } else if (['EXECUTIVE', 'PROJECT_MANAGER', 'ACCOUNTS', 'EMPLOYEE'].includes(emailOrRole)) {
      setActiveRole(emailOrRole);
    }
    setIsLoggedIn(true);
  };

  const logout = async () => {
    if (supabase && supabase.auth) {
      try { await supabase.auth.signOut(); } catch (e) {}
    }
    setIsLoggedIn(false);
  };

  const removeEmployee = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Notifications API
  const addNotification = (notif) => {
    const newNotif = {
      id: `n-${Date.now()}`,
      userEmail: notif.userEmail || currentUser.email,
      title: notif.title,
      message: notif.message,
      category: notif.category || 'SYSTEM',
      isRead: false,
      createdAt: language === 'ar' ? 'الآن' : 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // 4-Tier RBAC Permission Helpers
  const isExecutive = activeRole === 'EXECUTIVE';
  const isAccounts = activeRole === 'ACCOUNTS';
  const isProjectManager = activeRole === 'PROJECT_MANAGER';
  const isEmployee = activeRole === 'EMPLOYEE';

  const canViewFinancials = isExecutive || isAccounts;
  const canManageProjects = isExecutive || isProjectManager;
  const canVerifyExpenses = isExecutive || isAccounts;
  const canApproveExpenses = isExecutive;
  const canExecutePayroll = isExecutive;
  const canApproveLeave = isExecutive || isProjectManager;
  const canDownloadRestrictedDocs = isExecutive;

  return (
    <AuthRoleContext.Provider
      value={{
        language,
        toggleLanguage,
        setLanguage,
        t,
        activeRole,
        setActiveRole,
        isLoggedIn,
        login,
        loginWithMicrosoft365,
        logout,
        currentUser,
        users,
        expenses,
        setExpenses,
        notifications,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        removeEmployee,
        isExecutive,
        isAccounts,
        isProjectManager,
        isEmployee,
        canViewFinancials,
        canManageProjects,
        canVerifyExpenses,
        canApproveExpenses,
        canExecutePayroll,
        canApproveLeave,
        canDownloadRestrictedDocs
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
