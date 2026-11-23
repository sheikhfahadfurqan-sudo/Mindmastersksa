# Product Requirements Document (PRD): Mind Masters Internal CRM & Expense Portal

## 1. System Overview & Tech Stack
* **Application Name:** Mind Masters
* **Production URL:** `https://mindmastersksa.onrender.com`
* **Tech Stack:** React / Next.js Frontend, Supabase (Auth, PostgreSQL Database, Storage Buckets), GitHub CI/CD, Render Hosting.
* **Authentication Policy:** Login restricted strictly to `@mindmastersksa.com` email addresses.

---

## 2. User Roles & Access Control (RBAC)

| Role | Designated User(s) | Core Permissions & Visibility |
| :--- | :--- | :--- |
| **Executive / Boss** | **Naem Bou Assy** (`naem@mindmastersksa.com`) & **Executive Admin** (`info@mindmastersksa.com`) | • Full visibility across all employees, projects, and expenses.<br>• Final Executive Approval authority on all reimbursement claims (after Accounts review).<br>• Create, edit, and close Projects.<br>• Assign Employees to specific Projects.<br>• View Executive Financial Dashboard: Total Expenses, Project-wise Expense breakdown, and General Expense totals. |
| **Accounts Department** | Designated Accounts Staff (`@mindmastersksa.com`) | • View all submitted employee reimbursement claims and uploaded bill receipts.<br>• First-tier approval/rejection authority (`Pending Accounts` → `Approved by Accounts` / `Rejected`).<br>• Cannot grant final executive approval (must route approved claims to Naem). |
| **Employee** | All Company Staff (`@mindmastersksa.com`) | • View own basic employee profile/information (read-only unless admin-editable).<br>• View assigned projects.<br>• Submit new reimbursement claims with bill/receipt file upload.<br>• Categorize each claim as either **General Expense** or tied to a **Specific Project**.<br>• View own personal expense history, itemized details, and real-time approval status. |

---

## 3. Core Functional Modules

### Module A: Employee Profile & Self-Service
* **Requirement:** Authenticated employees land on their personal dashboard showing their basic HR/employee information (Name, Email, Role/Title, Department, Employee ID).
* **Data Isolation:** Employees can ONLY read their own profile and their own submitted expense records (enforced via Supabase Row-Level Security).

### Module B: Project Management (Executive Only)
* **Requirement:** Only the Executive (`naem@mindmastersksa.com` or `info@mindmastersksa.com`) can create new projects (Project Name, Code/ID, Client, Description, Status) and assign one or more employees to each project.
* **Employee Dropdown:** When an employee submits a reimbursement, the "Project" dropdown populates with active projects (plus a mandatory **"General Expense"** option).

### Module C: Bill Upload & Reimbursement Submission
* **Fields Required:**
  * Expense Title / Description
  * Amount (SAR) & Expense Date
  * Expense Category: **General** vs. **Project-Specific** (if Project-Specific, user must select a valid Project)
  * Bill / Receipt Attachment (PDF, JPG, PNG uploaded to Supabase Storage)
* **Initial State:** Every new submission enters the pipeline with status `Pending Accounts Approval`.

### Module D: Multi-Stage Approval Workflow
1. **Stage 1 — Submission:** Employee submits claim → Status: `Pending Accounts`.
2. **Stage 2 — Accounts Review:** Accounts department verifies receipt and amount:
   * If **Rejected**: Status becomes `Rejected by Accounts` with mandatory rejection reason visible to the employee.
   * If **Approved**: Status becomes `Pending Executive Approval` and appears in Naem's approval queue.
3. **Stage 3 — Executive Approval (`naem@mindmastersksa.com` / `info@mindmastersksa.com`):** Executive reviews Accounts-verified claims:
   * If **Rejected**: Status becomes `Rejected by Executive` with notes.
   * If **Approved**: Status becomes `Approved` (and updates total approved expense metrics).

### Module E: Expense Analytics & Dashboards
* **Employee View:**
  * Summary cards: Total Submitted, Total Approved, Total Pending, Total Rejected (personal only).
  * Detailed table of own claims with receipt preview and stage-by-stage approval status.
* **Executive View (`naem@mindmastersksa.com` / `info@mindmastersksa.com`):**
  * **Grand Total Expenses** (Approved vs. Pending).
  * **Project-Wise Expense Breakdown** (total spend grouped by each individual project).
  * **General Expenses Total** (total non-project operational spend).
  * Drill-down filtering by employee, project, date range, and approval status.

---

## 4. STRICT AI CODING GUARDRAILS ("DO NOT TOUCH" RULES)

> **CRITICAL INSTRUCTION FOR AI AGENTS (Antigravity / Gemini / Cline):**
> Do NOT refactor, restyle, rename, or reorganize existing working code unless explicitly requested in the current prompt.

1. **Scope Isolation:** Only modify the exact component, route, or SQL migration requested by the user. Never touch unrelated pages, layouts, or navigation bars.
2. **Database Schema Freeze:** Do not rename existing Supabase tables, columns, storage bucket names, or enum status values without explicit permission and a backward-compatible migration.
3. **Authentication & RBAC Lock:** Never remove `@mindmastersksa.com` domain email restrictions or weaken Supabase Row-Level Security (RLS) policies. Executive privileges must remain strictly bound to `naem@mindmastersksa.com` and `info@mindmastersksa.com` (and the `executive` role flag).
4. **Approval State Machine Lock:** Preserve the strict 2-tier approval order (`Employee` → `Accounts` → `Executive / Naem`). Never allow claims to bypass Accounts directly to Approved.
5. **UI & Styling Consistency:** Keep existing Tailwind/CSS classes, color palettes, sidebar structure, and component patterns intact. Do not replace existing UI libraries or rewrite working forms from scratch.
6. **Before Making Any Edit:** Output a 3-line plan listing **only** the exact file(s) you will modify and confirm that no locked modules are affected.