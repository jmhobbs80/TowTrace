// File: src/components/auth/TenantSelect.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Tenant = {
  id: string;
  name: string;
  domain: string;
};

type TenantSelectProps = {
  onSelect: (tenantId: string) => void;
};

const TenantSelect: React.FC<TenantSelectProps> = ({ onSelect }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, domain');
        
      if (data && !error) {
        setTenants(data);
        if (data.length > 0) {
          setSelectedTenant(data[0].id);
          onSelect(data[0].id);
        }
      }
      
      setLoading(false);
    };
    
    fetchTenants();
  }, [onSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tenantId = e.target.value;
    setSelectedTenant(tenantId);
    onSelect(tenantId);
  };

  if (loading) {
    return <div>Loading organizations...</div>;
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Organization
      </label>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        value={selectedTenant}
        onChange={handleChange}
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TenantSelect;