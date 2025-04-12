import { createClient } from '@supabase/supabase-js';

// Set Supabase URL
const supabaseUrl = 'https://jxjpnmwydldorerjjfhe.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a Supabase client with the service role key for admin privileges
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);