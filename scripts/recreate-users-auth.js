const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("==> Cleaning up old invalid user instances in database...");

  try {
    // Attempting to securely clean up `auth.users` directly bypassing triggers that might conflict
    await prisma.$executeRawUnsafe(`DELETE FROM auth.users WHERE email IN ('odirickd@gmail.com', 'koladigitalentreprise@gmail.com')`);
    
    // Fallback: Delete from public.users to clear constraints just in case no ON DELETE CASCADE exists,
    // though the application trigger normally handles it.
    await prisma.$executeRawUnsafe(`DELETE FROM public.users WHERE email IN ('odirickd@gmail.com', 'koladigitalentreprise@gmail.com')`);
    console.log("Cleanup complete. Proceeding to GoTrue native Signup...");

    const usersToCreate = [
      {
        email: 'odirickd@gmail.com',
        password: 'Serena100925',
        role: 'ADMIN',
        full_name: 'Admin Principal'
      },
      {
        email: 'koladigitalentreprise@gmail.com',
        password: 'koladigitalentreprise',
        role: 'VENDOR',
        full_name: 'Kola Digital Entreprise'
      }
    ];

    for (const u of usersToCreate) {
      console.log(`\n==> Creating user: ${u.email}`);
      const { data, error } = await supabase.auth.signUp({
        email: u.email,
        password: u.password,
        options: {
          data: {
            role: u.role,
            full_name: u.full_name
          }
        }
      });

      if (error) {
        console.error(`ERROR creating ${u.email}:`, error.message);
      } else {
        console.log(`SUCCESS. User UUID: ${data.user.id}`);
      }
    }
  } catch (error) {
    console.error("Critical execution error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
