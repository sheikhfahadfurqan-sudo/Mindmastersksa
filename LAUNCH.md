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


## ★ Staff without a company email (added 23 Nov)
People without an @mindmastersksa.com account sign in with a **6-digit code sent to their personal email**. Only people an executive adds can do this.

**One-time setup (≈15 min):**
1. ✅ Done 23 Nov: `db/update-2026-11-23c-email-code.sql` has been run in Supabase.
2. ✅ Checked 23 Nov: Email sign-in is enabled and *Allow new users to sign up* is on. The database still refuses anyone who wasn't added.
3. Supabase → **Authentication → Emails → Templates**: put the code in **both** the **Confirm sign up** template (used for a person's first sign-in) and the **Magic Link** template (used every time after that). Subject: `Your Mind Masters sign-in code`. Body:
   ```html
   <h2>Mind Masters</h2>
   <p>Your sign-in code is:</p>
   <p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
   <p>رمز الدخول الخاص بك أعلاه. The code expires in 1 hour.</p>
   ```
4. Supabase → **Authentication → Emails → SMTP Settings → Enable custom SMTP**. Supabase's built-in sender only sends a few emails per hour, so it is not enough for real use.
   - **Option A: your GoDaddy Microsoft 365 mailbox** (e.g. info@ or a new `noreply@`): Host `smtp.office365.com`, Port `587`, Username = the mailbox, Password = its password, Sender = the same address.
     If sending fails, *Authenticated SMTP* is switched off for that mailbox. Turn it on in Microsoft 365 admin → Users → the user → Mail → *Manage email apps*, or use option B.
   - **Option B: a free email-sending service** such as Brevo or Resend. Verify the mindmastersksa.com domain there (a few DNS records in GoDaddy), then paste the SMTP details they give you.
5. Push the new app to GitHub (step 3 below).

**Adding a person:** Naim or info@ → **Team → Add a person without a company email** → name + personal email → **Add person**. Send them the app link. They tap **Sign in with an email code**, type their email, then type the code from the email.
- Until they sign in, they're listed under that card with a **Remove** button.
- After their first sign-in they appear under **People** with a *Personal email* badge. To stop their access later, click their name and untick **Can sign in and submit expenses**.
- Test it first with your own Gmail address.


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
