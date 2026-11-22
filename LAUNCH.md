# Mind Masters — Launch checklist

App address: https://mindmastersksa.onrender.com

## How approvals work
| Expense type | Step 1 | Step 2 (final) |
|---|---|---|
| **Project expense** | Project manager of that project | Executive (Naim / info@) |
| **General expense** (food, groceries, misc.) | General approver — **suhail@mindmastersksa.com** for now | Executive (Naim / info@) |

- If a project has no manager, or the manager submits their own expense, it goes straight to the executive.
- Executives can approve or reject at any stage. A rejection always needs a reason, which the employee sees.
- To hand general expenses to the new accounts officer later: **Team → Approval routing → change the email → Save.** Claims already waiting move to the new person automatically.
- naim@ and info@ become Executives automatically on first sign-in. They can switch between the **Executive** and **Employee** views. Employees never see that switch, the dashboard, or the Team page.

---

## 0. Test for free first
Every step below works on the **free** Supabase and Render plans. Do steps 1–4 but skip the two upgrades, then test with 2–3 colleagues.
Upgrade only before the whole company starts using the app. Upgrading keeps the same data and the same web address.
On the free plans, Render sleeps after 15 minutes (the next visitor waits about a minute) and Supabase pauses after a week without use (click *Restore* in Supabase to wake it).

Test script:
1. Naim (or info@) signs in and sees the Dashboard. Switch to the **Employee** view and back.
2. Create a test project. Choose a project manager and add an employee.
3. The employee submits one **project** expense and one **general** expense, each with a receipt photo.
4. The PM approves the project expense, and Suhail approves the general one. Both then appear for Naim.
5. Naim approves one and rejects the other with a reason. The employee sees the result and the reason.
6. Switch to Arabic on a phone, then install the app to the home screen (iPhone and Android).
7. Delete the test claims afterwards: open Supabase → Table Editor → expenses → delete the rows.

## 1. Supabase (≈10 min)
1. **When testing is done: Billing → upgrade the organization to Pro ($25/month).** Free projects pause after a week without use, and Pro adds daily backups.
2. **SQL Editor → New query →** paste all of `db/launch.sql` → **Run**.
   *Already ran it before 22 Nov 15:30 with the old naem@ address?* Also run `db/fix-naim-email.sql` the same way (no data is lost).
   ⚠ This deletes the old test tables and dummy data. Run it once, before real use.
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
