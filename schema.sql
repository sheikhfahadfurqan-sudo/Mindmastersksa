-- ==============================================================================
-- MIND MASTERS KSA - SUPABASE DB SCHEMA MIGRATION & REPAIR
-- Fixes type mismatches (text vs uuid) and provisions 3 core test accounts
-- ==============================================================================

-- 0. CLEAN DROP PRE-EXISTING CONSTRAINTS AND TABLES TO PREVENT TYPE MISMATCHES
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.payroll CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.leave_requests CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. USERS & PROFILES TABLE (Domain Restricted to @mindmastersksa.com)
CREATE TABLE public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL CHECK (email LIKE '%@mindmastersksa.com'),
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'EMPLOYEE' CHECK (role IN ('EXECUTIVE', 'PROJECT_MANAGER', 'ACCOUNTS', 'EMPLOYEE')),
    title TEXT,
    department TEXT,
    basic_salary_sar NUMERIC(12, 2) DEFAULT 0.00,
    housing_allowance_sar NUMERIC(12, 2) DEFAULT 0.00,
    transport_allowance_sar NUMERIC(12, 2) DEFAULT 0.00,
    gosi_deduction_sar NUMERIC(12, 2) DEFAULT 0.00,
    iban TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CREATE VIEW FOR USERS TABLE ALIAS (Supports both profiles and users queries)
CREATE OR REPLACE VIEW public.users AS SELECT * FROM public.profiles;

-- 2. EXPENSES REIMBURSEMENT TABLE
CREATE TABLE public.expenses (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    employee_name TEXT NOT NULL,
    employee_email TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Hardware & Cloud',
    vendor TEXT,
    amount_sar NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    receipt_url TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'VERIFIED_BY_ACCOUNTS', 'APPROVED_BY_EXEC', 'REJECTED')),
    verified_by TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. WORKDAY HR & PAYROLL TABLE
CREATE TABLE public.payroll (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    pay_period TEXT NOT NULL DEFAULT 'August 2026',
    basic_salary_sar NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    housing_allowance_sar NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    transport_allowance_sar NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    gosi_deduction_sar NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_salary_sar NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_status TEXT NOT NULL DEFAULT 'UNPROCESSED' CHECK (payment_status IN ('UNPROCESSED', 'PAID')),
    payment_date TIMESTAMP WITH TIME ZONE,
    wps_ref TEXT,
    iban TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. REAL-TIME NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT DEFAULT 'SYSTEM' CHECK (category IN ('SYSTEM', 'TASK', 'EXPENSE', 'LEAVE', 'PAYROLL')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LEAVE REQUESTS TABLE (HR)
CREATE TABLE public.leave_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    employee_name TEXT NOT NULL,
    title TEXT,
    department TEXT,
    leave_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CLIENTS TABLE (CRM)
CREATE TABLE public.clients (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    region TEXT,
    stage TEXT DEFAULT 'LEAD',
    contract_value_sar NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PROJECTS TABLE
CREATE TABLE public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    client_name TEXT,
    manager_name TEXT,
    manager_id TEXT,
    status TEXT DEFAULT 'ACTIVE',
    budget_sar NUMERIC(14, 2) DEFAULT 0.00,
    progress_percent INT DEFAULT 0,
    assigned_user_ids TEXT[] DEFAULT '{}'::text[],
    files JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TASKS TABLE (PMO)
CREATE TABLE public.tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    project_name TEXT,
    assignee_id TEXT,
    assignee_name TEXT,
    due_date DATE,
    priority TEXT DEFAULT 'MEDIUM',
    status TEXT DEFAULT 'TODO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. DOCUMENTS TABLE (VAULT)
CREATE TABLE public.documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    clearance TEXT DEFAULT 'PUBLIC',
    file_size TEXT,
    data_url TEXT,
    uploaded_by_name TEXT,
    target_assignee TEXT DEFAULT 'ALL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- PERMISSIVE RLS POLICIES FOR SUPABASE REALTIME SYNC
CREATE POLICY "Anon sync profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon sync expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon sync payroll" ON public.payroll FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon sync notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon sync leave_requests" ON public.leave_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon sync clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon sync projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon sync tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon sync documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);

-- SEED 3 CORE TESTING ACCOUNTS STRICTLY
INSERT INTO public.profiles (id, email, name, role, title, department, basic_salary_sar, housing_allowance_sar, transport_allowance_sar, gosi_deduction_sar, iban, avatar_url)
VALUES 
    ('u-exec-1', 'md@mindmastersksa.com', 'Naem Bou Assy', 'EXECUTIVE', 'Managing Director & CEO', 'Executive Management', 0.00, 0.00, 0.00, 0.00, 'SA82 1000 0001 2345 6789 0000', '/logo.jpg'),
    ('u-acc-1', 'accounts@mindmastersksa.com', 'Ahmad', 'ACCOUNTS', 'Lead Financial Accounts Manager', 'Finance & Accounts', 0.00, 0.00, 0.00, 0.00, 'SA14 2000 0002 9876 5432 0202', '/logo.jpg'),
    ('u-emp-1', 'employee@mindmastersksa.com', 'Fahad Furqan', 'EMPLOYEE', 'Electrical Engineer & Developer', 'Engineering', 0.00, 0.00, 0.00, 0.00, 'SA33 6000 0006 9988 7766 0606', '/logo.jpg'),
    ('u-emp-2', 'fahad@mindmastersksa.com', 'Fahad Furqan', 'EMPLOYEE', 'Electrical Engineer & Developer', 'Engineering', 0.00, 0.00, 0.00, 0.00, 'SA33 6000 0006 9988 7766 0606', '/logo.jpg')
ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    title = EXCLUDED.title,
    department = EXCLUDED.department,
    basic_salary_sar = EXCLUDED.basic_salary_sar;
