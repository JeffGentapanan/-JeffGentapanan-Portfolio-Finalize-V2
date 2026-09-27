import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, requireSupabase, OWNER_ID } from '@/lib/supabase';

const Context = createContext(null);

export function OwnerProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    // INITIAL_SESSION also restores an existing login after a refresh.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(session?.user?.id === OWNER_ID);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    if (data.user.id !== OWNER_ID) {
      await client.auth.signOut({ scope: 'local' });
      throw new Error('This account does not have owner access.');
    }
    setAuthenticated(true);
  }

  async function logout() {
    const { error } = await requireSupabase().auth.signOut({ scope: 'local' });
    if (error) throw error;
    setAuthenticated(false);
  }

  return (
    <Context.Provider value={{ authenticated, configured: Boolean(supabase), login, logout }}>
      {children}
    </Context.Provider>
  );
}

export function useOwner() {
  const owner = useContext(Context);
  if (!owner) throw new Error('OwnerProvider is required.');
  return owner;
}
