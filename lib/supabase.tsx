// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

require('dotenv').config()
const supabaseUrl = 'https://ldkgbbutcuvxzjnatgvp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxka2diYnV0Y3V2eHpqbmF0Z3ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODk1NDI4MiwiZXhwIjoyMDU0NTMwMjgyfQ.FOdky4lgOGuGovrulLIG6o31o4MVKrX_zC6cnt0ysiA';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase environment variables are not set.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
