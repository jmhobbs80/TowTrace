// File: src/context/TenantContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Tenant } from '../types';

type TenantContextType = {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  loading: boolean;
};

const TenantContext = createContext<TenantContextType>({
  currentTenant: null,
  setCurrentTenant: () => {},
  loading: true,
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check JWT for tenant information
    const getTenantFromSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const jwt = session.access_token;
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        
        if (payload.tenant_id) {
          // Fetch tenant details
          const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', payload.tenant_id)
            .single();
            
          if (data && !error) {
            setCurrentTenant(data);
          }
        }
      }
      
      setLoading(false);
    };
    
    getTenantFromSession();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setCurrentTenant(null);
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <TenantContext.Provider value={{ currentTenant, setCurrentTenant, loading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);