-- ==============================================================================
-- MIND MASTERS KSA - SUPABASE DATABASE DDL SCHEMA & RLS MIGRATIONS
-- Universal 3-Tier Access Schema (EXECUTIVE, ADMIN, EMPLOYEE)
-- ==============================================================================

-- 0. DROP ALL EXISTING RLS POLICIES FIRST TO PREVENT POSTGRESQL 0A000 ALTER TYPE ERRORS
DROP POLICY IF EXISTS "Employees view own payroll" ON public.payroll;
DROP POLICY IF EXISTS "Management full access to payroll" ON public.payroll;
DROP POLICY IF EXISTS "Anon client sync payroll" ON public.payroll;
DROP POLICY IF EXISTS "Anon sync payroll" ON public.payroll;
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anon sync notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anon sync users" ON public.users;
DROP POLICY IF EXISTS "Anon sync clients" ON public.clients;
DROP POLICY IF EXISTS "Anon sync projects" ON public.projects;
DROP POLICY IF EXISTS "Anon sync tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anon sync documents" ON public.documents;
DROP POLICY IF EXISTS "Anon sync leave_requests" ON public.leave_requests;

-- 1. SAFELY CONVERT USERS.ROLE & ID TO TEXT
ALTER TABLE IF EXISTS public.users ALTER COLUMN role DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN role TYPE TEXT USING role::text;
ALTER TABLE IF EXISTS public.users ALTER COLUMN role SET DEFAULT 'EMPLOYEE';

DO $$ 
BEGIN
    ALTER TABLE public.users ALTER COLUMN id TYPE TEXT USING id::text;
EXCEPTION WHEN OTHERS THEN END;
$$;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'EMPLOYEE',
    title TEXT,
    department TEXT,
    basic_salary_sar NUMERIC(12, 2) DEFAULT 20000.00,
    iban TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all missing user columns are added if users table pre-existed
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'EMPLOYEE';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS basic_salary_sar NUMERIC(12, 2) DEFAULT 20000.00;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. PAYROLL TABLE
CREATE TABLE IF NOT EXISTS public.payroll (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT NOT NULL,
    pay_period TEXT NOT NULL DEFAULT 'August 2026',
    basic_salary_sar NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    housing_allowance_sar NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    transport_allowance_sar NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    gosi_deduction_sar NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_salary_sar NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_status TEXT NOT NULL DEFAULT 'PAID',
    iban TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT,
    title TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CLIENTS TABLE (CRM)
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    region TEXT,
    stage TEXT DEFAULT 'LEAD',
    contract_value_sar NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS contract_value_sar NUMERIC(14, 2) DEFAULT 0.00;

-- 5. PROJECTS TABLE (WITH DEDICATED FOLDERS & TEAM ASSIGNEES)
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    client_name TEXT,
    manager_name TEXT,
    status TEXT DEFAULT 'ACTIVE',
    budget_sar NUMERIC(14, 2) DEFAULT 0.00,
    progress_percent INT DEFAULT 0,
    assigned_user_ids TEXT[] DEFAULT '{}'::text[],
    files JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS budget_sar NUMERIC(14, 2) DEFAULT 0.00;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS progress_percent INT DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS assigned_user_ids TEXT[] DEFAULT '{}'::text[];
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;

-- 6. TASKS TABLE (KANBAN)
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    project_name TEXT,
    assignee_name TEXT,
    due_date DATE,
    priority TEXT DEFAULT 'MEDIUM',
    status TEXT DEFAULT 'TODO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. DOCUMENTS TABLE (VAULT)
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    clearance TEXT DEFAULT 'PUBLIC',
    file_size TEXT,
    data_url TEXT,
    uploaded_by_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. LEAVE REQUESTS TABLE (HR)
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id TEXT PRIMARY KEY,
    employee_name TEXT NOT NULL,
    title TEXT,
    department TEXT,
    leave_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR ALL TABLES (ALLOWS AUTH & CLIENT SYNC)
DROP POLICY IF EXISTS "Anon sync users" ON public.users;
CREATE POLICY "Anon sync users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon sync payroll" ON public.payroll;
CREATE POLICY "Anon sync payroll" ON public.payroll FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon sync notifications" ON public.notifications;
CREATE POLICY "Anon sync notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon sync clients" ON public.clients;
CREATE POLICY "Anon sync clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon sync projects" ON public.projects;
CREATE POLICY "Anon sync projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon sync tasks" ON public.tasks;
CREATE POLICY "Anon sync tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon sync documents" ON public.documents;
CREATE POLICY "Anon sync documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon sync leave_requests" ON public.leave_requests;
CREATE POLICY "Anon sync leave_requests" ON public.leave_requests FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA (3 GENERAL ACCESS LEVELS: EXECUTIVE, ADMIN, EMPLOYEE)
-- ==============================================================================

INSERT INTO public.users (id, email, name, role, title, department, basic_salary_sar, iban, avatar_url)
VALUES 
    ('a0000000-0000-0000-0000-000000000000', 'naem@mindmastersksa.com', 'Naem Bou Assy', 'EXECUTIVE', 'Managing Director', 'Executive Management', 25000.00, 'SA82 1000 0001 2345 6789 0000', 'logo.jpg'),
    ('a1111111-1111-1111-1111-111111111111', 'fahad@mindmastersksa.com', 'Fahad', 'EMPLOYEE', 'Software Systems Developer', 'Engineering', 0.00, 'Confidential', 'logo.jpg'),
    ('a2222222-2222-2222-2222-222222222222', 'accounts@mindmastersksa.com', 'Accounts Manager', 'ADMIN', 'Finance & Accounts Manager', 'Finance & Accounts', 18000.00, 'SA14 2000 0002 9876 5432 0202', 'logo.jpg'),
    ('a3333333-3333-3333-3333-333333333333', 'hr@mindmastersksa.com', 'HR Administrator', 'ADMIN', 'HR & Operations Manager', 'Human Resources', 18000.00, 'SA45 3000 0003 4567 8901 0303', 'logo.jpg'),
    ('a4444444-4444-4444-4444-444444444444', 'engineer@mindmastersksa.com', 'Systems Engineer', 'EMPLOYEE', 'Senior AI Systems Engineer', 'Engineering', 15000.00, 'SA90 4000 0004 1122 3344 0404', 'logo.jpg')
ON CONFLICT (email) DO UPDATE SET 
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    basic_salary_sar = EXCLUDED.basic_salary_sar;

INSERT INTO public.payroll (id, user_id, user_email, pay_period, basic_salary_sar, housing_allowance_sar, transport_allowance_sar, gosi_deduction_sar, net_salary_sar, payment_status, iban)
VALUES
    ('b0000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000000', 'naem@mindmastersksa.com', 'August 2026', 25000.00, 6250.00, 2500.00, 2437.50, 31312.50, 'PAID', 'SA82 1000 0001 2345 6789 0000'),
    ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'fahad@mindmastersksa.com', 'August 2026', 0.00, 0.00, 0.00, 0.00, 0.00, 'CONFIDENTIAL', 'Confidential'),
    ('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'accounts@mindmastersksa.com', 'August 2026', 18000.00, 4500.00, 1800.00, 1755.00, 22545.00, 'UNPROCESSED', 'SA14 2000 0002 9876 5432 0202'),
    ('b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'hr@mindmastersksa.com', 'August 2026', 18000.00, 4500.00, 1800.00, 1755.00, 22545.00, 'UNPROCESSED', 'SA45 3000 0003 4567 8901 0303'),
    ('b4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'engineer@mindmastersksa.com', 'August 2026', 15000.00, 3750.00, 1500.00, 1462.50, 18787.50, 'UNPROCESSED', 'SA90 4000 0004 1122 3344 0404')
ON CONFLICT (id) DO NOTHING;
