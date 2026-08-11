-- PostgreSQL SQL Schema DDL Script for Mind Masters KSA
-- Complete schema with ENUMs, Tables, Constraints, Indexes & Row-Level Security (RLS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM DEFINITIONS
CREATE TYPE role_enum AS ENUM ('EXECUTIVE', 'LEAD', 'STANDARD');
CREATE TYPE clearance_enum AS ENUM ('PUBLIC', 'INTERNAL', 'RESTRICTED');
CREATE TYPE deal_stage_enum AS ENUM ('LEAD', 'PROPOSAL', 'CLOSED_WON', 'CLOSED_LOST');
CREATE TYPE project_status_enum AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED');
CREATE TYPE task_status_enum AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETE');
CREATE TYPE task_priority_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE leave_type_enum AS ENUM ('VACATION', 'SICK', 'PERSONAL', 'MATERNITY_PATERNITY');
CREATE TYPE leave_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- 1. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    role role_enum DEFAULT 'STANDARD' NOT NULL,
    department VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    salary_sar NUMERIC(12, 2), -- Private: Hidden for STANDARD role
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CLIENTS TABLE
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    stage deal_stage_enum DEFAULT 'LEAD' NOT NULL,
    contract_value NUMERIC(12, 2) NOT NULL, -- Hidden column for STANDARD role
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CLIENT DOCUMENTS VAULT TABLE
CREATE TABLE client_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    clearance clearance_enum DEFAULT 'RESTRICTED' NOT NULL,
    uploaded_by_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PROJECTS MASTER TABLE
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    manager_id UUID REFERENCES users(id) NOT NULL,
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    status project_status_enum DEFAULT 'PLANNING' NOT NULL,
    budget_sar NUMERIC(12, 2) NOT NULL, -- Hidden column for STANDARD role
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TASKS BREAKDOWN TABLE
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    assignee_id UUID REFERENCES users(id) NOT NULL,
    priority task_priority_enum DEFAULT 'MEDIUM' NOT NULL,
    due_date DATE NOT NULL,
    status task_status_enum DEFAULT 'TODO' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. RESTRICTED DOCUMENT VAULT TABLE
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    clearance clearance_enum DEFAULT 'INTERNAL' NOT NULL,
    uploaded_by_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. LEAVE REQUESTS & HR ABSENCE TABLE
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    leave_type leave_type_enum NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL, -- Private reason hidden from team calendar
    status leave_status_enum DEFAULT 'PENDING' NOT NULL,
    reviewed_by_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_clients_stage ON clients(stage);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_documents_clearance ON documents(clearance);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);

-- EXAMPLE ROW-LEVEL SECURITY (RLS) POLICIES FOR POSTGRESQL
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Executive & Lead can view all documents
CREATE POLICY exec_lead_doc_policy ON documents 
    FOR SELECT 
    USING (
        current_setting('app.current_user_role') IN ('EXECUTIVE', 'LEAD')
        OR clearance IN ('PUBLIC', 'INTERNAL')
    );

-- Standard employees cannot select RESTRICTED clearance documents
CREATE POLICY standard_doc_policy ON documents 
    FOR SELECT 
    USING (
        current_setting('app.current_user_role') = 'STANDARD' 
        AND clearance IN ('PUBLIC', 'INTERNAL')
    );
