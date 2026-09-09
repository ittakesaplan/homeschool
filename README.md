# Homeschool Portfolio & Learning Journal

A private, password-protected site for recording daily learning activities, uploading photos and work samples, and curating a portfolio of highlights.

## Setup

### 1. Create a Supabase project (free)

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **New Project** — pick any name and set a database password
3. Wait for the project to finish provisioning (~1 minute)

### 2. Run the database setup

1. In your Supabase project, go to **SQL Editor** → **New Query**
2. Paste the contents of `supabase-setup.sql` and click **Run**
3. You should see "Success. No rows returned" — that means the tables and policies were created

### 3. Create user accounts

1. Go to **Authentication** → **Users** → **Add User**
2. Add accounts for each person who needs access (email + password)
3. That's it — these are the login credentials for the site

### 4. Get your API keys

1. Go to **Settings** → **API**
2. Copy the **Project URL** and the **anon / public** key

### 5. Configure environment variables

For **local development**, create a `.env` file in the project root:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For **Vercel deployment**, add these as Environment Variables in your Vercel project settings.

### 6. Deploy

Follow the standard GitHub → Vercel workflow:
1. Create a repo under the **ittakesaplan** GitHub org
2. Upload the project files (drag from inside the unzipped folder)
3. Connect to Vercel, add the env vars, deploy
4. Add a custom domain in Vercel settings if desired

## Local development

```bash
npm install
npm run dev
```

## Tech stack

- React 18 + Vite
- Supabase (auth, database, file storage)
- React Router
- date-fns for date formatting
- lucide-react for icons
