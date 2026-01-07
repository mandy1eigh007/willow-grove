'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Assume supabase client is set up

export default function Nav() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ccc' }}>
      <div>
        <a href="/profiles" style={{ marginRight: '20px' }}>Profiles</a>
        <a href="/avatar" style={{ marginRight: '20px' }}>Avatar</a>
        <a href="/story">Story</a>
      </div>
      <button onClick={handleSignOut}>Sign out</button>
    </nav>
  );
}