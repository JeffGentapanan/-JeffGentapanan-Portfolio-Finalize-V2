import { createContext, useContext, useEffect, useState } from 'react';
import { api, jsonRequest } from '@/lib/api';
const empty = { authenticated: false, configured: false, csrf: '' };
const Context = createContext(null);
export function OwnerProvider({ children }) {
    const [session, setSession] = useState(empty);
    useEffect(() => { let active = true; api('/api/session').then(value => { if (active)
        setSession(value); }).catch(() => { }); return () => { active = false; }; }, []);
    async function login(password) { setSession(await api('/api/login', jsonRequest('POST', { password }))); }
    async function logout() { await api('/api/logout', jsonRequest('POST', {}, session.csrf)); setSession({ ...empty, configured: true }); }
    return <Context.Provider value={{ ...session, login, logout }}>{children}</Context.Provider>;
}
export function useOwner() { const owner = useContext(Context); if (!owner)
    throw new Error('OwnerProvider is required.'); return owner; }
