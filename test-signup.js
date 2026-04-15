const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kunnbxdupjdwrvboywan.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bm5ieGR1cGpkd3J2Ym95d2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODEwMzAsImV4cCI6MjA4NTE1NzAzMH0.JGo6wk-fb_Dlq2QoQmGy1yucRAHMipryfa9t2dxt_x0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  const { data, error } = await supabase.auth.signUp({
    email: 'testlogin@luxanda.com',
    password: 'Password123!',
    options: {
      data: {
        role: 'ADMIN'
      }
    }
  });

  console.log("Signup:", data, error?.message || 'Success');

  if (data.user) {
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'testlogin@luxanda.com',
      password: 'Password123!'
    });
    console.log("Login:", loginData, loginError?.message || 'Success');
  }
}

testSignup();
