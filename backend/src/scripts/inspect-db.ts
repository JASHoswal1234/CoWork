import { supabaseAdmin } from '../config/supabase';

async function inspect() {
  const { data: users, error: uErr } = await supabaseAdmin.from('users').select('*');
  console.log('USERS COUNT:', users?.length, 'ERR:', uErr);
  if (users) {
    console.log(users.map((u: any) => ({ id: u.id, email: u.email, role: u.role, name: u.name })));
  }

  const { data: workers, error: wErr } = await supabaseAdmin.from('workers').select('*');
  console.log('\nWORKERS COUNT:', workers?.length, 'ERR:', wErr);
  if (workers) {
    console.log(workers.map((w: any) => ({ id: w.id, user_id: w.user_id, available: w.available })));
  }
}

inspect().catch(console.error);
