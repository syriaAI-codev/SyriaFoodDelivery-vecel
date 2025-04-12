import { createClient } from '@supabase/supabase-js';

// Set the Supabase URL
const supabaseUrl = 'https://jxjpnmwydldorerjjfhe.supabase.co';
// Get the Supabase anon key from environment variable
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);