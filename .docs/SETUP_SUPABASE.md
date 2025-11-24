# Supabase Setup Guide for X402 Payment Integration

## Step 1: Access Your Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your existing project (or create a new one)

## Step 2: Run the Database Schema

1. Navigate to **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `.docs/supabase_schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)

You should see: "Success. No rows returned"

## Step 3: Get Your Environment Variables

### Get Supabase URL:
1. Go to **Project Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy the **Project URL**
4. Example: `https://abcdefghijklmn.supabase.co`

### Get Anon Key:
1. Still in **API** settings
2. Under **Project API keys**, find `anon` `public`
3. Click **Reveal** and copy the key
4. This is safe to expose in your frontend

### Get Service Role Key:
1. Still in **API** settings
2. Under **Project API keys**, find `service_role` `secret`
3. Click **Reveal** and copy the key
4. ⚠️ **NEVER expose this in frontend code**
5. This is for backend/API routes only

## Step 4: Update Your `.env.local`

Add these three lines to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Replace:
- `your-project-id` with your actual project ID
- `your-anon-key-here` with the anon/public key
- `your-service-role-key-here` with the service_role key

## Step 5: Verify the Setup

### Check Tables Created:
1. Go to **Table Editor** in Supabase
2. You should see: `payment_transactions` table
3. Click on it to see the columns

### Check Views Created:
1. Still in **Table Editor**
2. Look for `farcaster_users_stats` (should show under Views)

### Check Policies:
1. Click on `payment_transactions` table
2. Go to **RLS** tab
3. You should see 3 policies enabled:
   - Users can view their own payment transactions
   - Service role can insert payment transactions
   - Service role can update payment transactions

## Step 6: Test the Connection

Create a simple test file to verify:

```typescript
// test-supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Test query
const test = async () => {
  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .limit(1);

  console.log('Data:', data);
  console.log('Error:', error);
};

test();
```

Run: `npx ts-node test-supabase.ts`

Expected: `Data: []` (empty array, no error)

## Troubleshooting

### Error: "relation does not exist"
- The SQL schema didn't run successfully
- Go back to SQL Editor and re-run the schema

### Error: "JWT expired" or "Invalid API key"
- Check that you copied the correct anon/service keys
- Make sure no extra spaces in `.env.local`
- Restart your dev server after adding env vars

### Error: "permission denied"
- RLS policies not set up correctly
- Re-run the SQL schema (it includes policy creation)

### Can't see the table in Table Editor
- Refresh the page
- Check that SQL ran without errors
- Look in **Database** → **Tables** section

## Security Notes

✅ **Safe to expose:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

❌ **NEVER expose:**
- `SUPABASE_SERVICE_ROLE_KEY` (backend only!)

✅ **Row Level Security (RLS) is enabled**
- Users can only read their own transactions
- Only backend can insert/update via service role key

## Next Steps

Once setup is complete:
1. ✅ Database schema created
2. ✅ Environment variables configured
3. ✅ Connection tested
4. → Proceed to create API routes
5. → Proceed to create frontend components

## Useful Supabase Dashboard Links

- **SQL Editor**: Write and run SQL queries
- **Table Editor**: View and edit data visually
- **API Docs**: Auto-generated API documentation
- **Logs**: View real-time database logs
- **Database → Roles**: Manage permissions
