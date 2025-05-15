import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vnjsgpcjkojylhamasxr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuanNncGNqa29qeWxoYW1hc3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMDI5MDQsImV4cCI6MjA2Mjc3ODkwNH0.95dAggy01QsfWV-pjY_RXT2hYDYJ0ySns9TbzAonarg';

export const supabase = createClient(supabaseUrl, supabaseKey);
