const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kunnbxdupjdwrvboywan.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bm5ieGR1cGpkd3J2Ym95d2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODEwMzAsImV4cCI6MjA4NTE1NzAzMH0.JGo6wk-fb_Dlq2QoQmGy1yucRAHMipryfa9t2dxt_x0'
);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'odirickd@gmail.com',
    password: 'Serena100925'
  });
  console.log("Login Test:", data, error?.message || null);
}

test();
