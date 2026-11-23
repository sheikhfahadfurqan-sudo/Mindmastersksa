# Mind Masters — Launch checklist

App address: https://mindmastersksa.onrender.com

## How approvals work (updated 23 Nov)
| Expense type | Who approves | Final? |
|---|---|---|
| **Project expense** | The **project manager** of that project | Yes — the PM's approval is final |
| **General expense** (food, groceries, misc.) | The **accounts team** (Suhail for now; you can list several people) | Yes — accounts' approval is final |

- Naim and info@ see **every** expense, project and budget on the Dashboard, and can approve or reject anything at any stage.
- If a project has no manager, or the manager submits their own expense, it goes to the executive.
- Want Naim to sign last again? **Team → Approval routing → untick "approval is final" → Save.**
- Accounts team: **Team → Approval routing →** type the emails separated by commas → **Save**.
- naim@ (also naem@) and info@ are Executives automatically. They can switch between **Executive** and **Employee** views. Employees never see that switch, the Dashboard or the Team page.
- New projects need a **name, description and project manager**. Add dates, budget, client, location and scope so the team knows what to do.

## ★ Update of 23 Nov — do this once (keeps all data)
1. Supabase → **SQL Editor → New query** → paste all of `db/update-2026-11-23.sql` → **Run**. (Run this **before** pushing the app.)
2. Push the new app to GitHub (see step 3 below). Render redeploys automatically.
3. Naim opens **Projects**, clicks the project created yesterday → **Edit** → fills in description, dates, budget and client.


## Project workspace (added 23 Nov)
Open any project to get tabs:
- **Overview** – budget, details, upcoming milestones, latest site update.
- **Tasks** – Naim / the PM add tasks with owner, due date and milestone flag. The assigned person ticks them off (tap the circle: to do → in progress → done). Progress % shows on the project and on Naim's dashboard. Each person sees **My tasks** on their home screen.
- **Updates** – anyone on the project posts progress notes with site photos.
- **Files** – drawings, contracts, quotations, BOQ, photos, reports (up to 25 MB each). Everyone on the project can upload and open; uploader, PM or Naim can delete.
- **Expenses** – that project's claims.
- **Finance** (Naim + PM only) – contract value, payment terms, client invoices (mark paid), invoiced / received / outstanding, expected margin.

Storage: Supabase Free includes 1 GB for files; Pro ($25/month) includes 100 GB.

## Employee profiles (added 23 Nov)
- Everyone: **avatar (top right) → My profile** → *Change photo*, *Edit* (mobile, nationality, emergency contact), and **Documents**: iqama, passport, driving licence, medical insurance — numbers, expiry dates and copies (photo or PDF, 10 MB).
- Executives: **Team → click a person** to see and edit everything, plus job title, department, joining date, role, and the **Contract & salary** tab (contract dates, basic salary, allowances, contract copies).
- **HR (Suhail):** sees the **Employees** menu with every profile, document and contract & salary, and can edit them, including roles (Employee / Executive) and enabling or disabling accounts. Naim and info@ always stay Executive. Change who is HR in **Team → HR access**.
- Privacy: an employee sees only their own documents; colleagues see only name and photo; contract & salary are executives-only. The Team list flags iqama/passport expiring within 60 days or already expired.

---

## 0. Test for free first
Every step below works on the **free** Supabase and Render plans. Do steps 1–4 but skip the two upgrades, then test with 2–3 colleagues.
Upgrade only before the whole company starts using the app. Upgrading keeps the same data and the same web address.
On the free plans, Render sleeps after 15 minutes (the next visitor waits about a minute) and Supabase pauses after a week without use (click *Restore* in Supabase to wake it).

Test script:
1. Naim (or info@) signs in and sees the Dashboard. Switch to the **Employee** view and back.
2. Create a test project. Choose a project manager and add an employee.
3. The employee submits one **project** expense and one **general** expense, each with a receipt photo.
4. The PM approves the project expense, and Suhail approves the general one. Both are now Approved, and Naim sees them on the Dashboard.
5. Submit one more and have Naim reject it with a reason. The employee sees the result and the reason.
6. Switch to Arabic on a phone, then install the app to the home screen (iPhone and Android).
7. Delete the test claims afterwards: open Supabase → Table Editor → expenses → delete the rows.

## 1. Supabase (≈10 min)
1. **When testing is done: Billing → upgrade the organization to Pro ($25/month).** Free projects pause after a week without use, and Pro adds daily backups.
2. **SQL Editor → New query →** paste all of `db/launch.sql` → **Run**.
   *Already ran it before 22 Nov 15:30 with the old naem@ address?* Also run `db/fix-naim-email.sql` the same way (no data is lost).
   ⚠ First-time setup only: it clears the old test tables. Once any expense or project exists it refuses to run, so it can never wipe real data.
3. **Authentication → URL Configuration**
   - Site URL: `https://mindmastersksa.onrender.com`
   - Redirect URLs: add `https://mindmastersksa.onrender.com/**`
4. **Authentication → Sign In / Providers → Azure:** must be **enabled** with your Azure Client ID, Secret and
   Tenant URL `https://login.microsoftonline.com/<your-tenant-id>`.

## 2. Microsoft Entra (Azure) app registration (check only)
- **Redirect URI (Web):** `https://ahltxilavuymitaivxey.supabase.co/auth/v1/callback`
- **Supported account types:** *Accounts in this organizational directory only*. This keeps sign-in to Mind Masters staff.
- **API permissions (Microsoft Graph, delegated):** `openid`, `email`, `profile`, then *Grant admin consent*.
- **Token configuration:** add optional claim **email** to the ID token.

## 3. Push to GitHub
The old unused files are already in the Recycle Bin. In PowerShell, inside `Desktop\mind-masters-ksa`:
```powershell
git add -A
git commit -m "Production launch: Supabase-backed expenses, approvals, Arabic, installable app"
git push
```
(`_backup_before_launch\` holds your previous index.html. It is ignored by git. Delete it once you're happy.)

## 4. Render
- Your existing **Web Service** stays as-is. Start command: `npm start`. Build command: leave empty, or use `npm install`.
- **When testing is done, upgrade the instance to Starter ($7/month).** The Free instance sleeps after 15 minutes, and the next person waits up to a minute for it to wake.
- Render redeploys automatically after the push. Open the site and press Ctrl+F5 once.

## 5. Go live
1. Naim and info@ sign in once and confirm they land on the **Dashboard**.
2. Suhail signs in once, so his name appears in routing.
3. Each project manager signs in once. Then an executive creates the projects (**Projects → New project**), picks the manager and ticks the team members.
4. Send staff the link with this message:
   > Open https://mindmastersksa.onrender.com on your phone → sign in with your work Microsoft account → install it:
   > **iPhone:** Safari → Share → *Add to Home Screen*. **Android:** Chrome → ⋮ → *Install app*.

## Monthly cost
Supabase Pro $25 + Render Starter $7 ≈ **$32/month (≈ SAR 120)**.
