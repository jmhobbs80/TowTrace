// File: src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useTenant } from './TenantContext';
import { Session, User } from '@supabase/supabase-js';
import { UserDetails } from '../types';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userDetails: UserDetails | null;
  loading: boolean;
  signIn: (email: string, password: string, tenantId: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userDetails: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentTenant } = useTenant();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        setUserDetails(data);
        
        // Fetch tenant data
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', data.tenant_id)
          .single();
          
        setCurrentTenant(tenantData);
      }
      
      setLoading(false);
    };
    
    getInitialSession();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          setUserDetails(data);
        } else {
          setUserDetails(null);
          setCurrentTenant(null);
        }
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [setCurrentTenant]);

  const signIn = async (email: string, password: string, tenantId: string) => {
    // Custom sign-in that includes tenant information
    const customClaims = { tenant_id: tenantId };
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        data: customClaims
      }
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentTenant(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, userDetails, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);