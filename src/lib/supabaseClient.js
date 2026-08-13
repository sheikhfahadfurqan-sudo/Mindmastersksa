/**
 * Supabase Client Initialization for Mind Masters KSA
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ahltxilavuymitaivxey.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_I0cJCEEZdAJNZC4g7NyBvQ_XBxCRN9j';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
