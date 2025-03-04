CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'dispatcher', 'driver', 'manager')),
  tenant_id UUID REFERENCES tenants(id),
  two_factor_secret TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY,
  vin TEXT UNIQUE NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  condition_photos TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  driver_id UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'stored')),
  pickup_location TEXT,
  dropoff_location TEXT,
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inspections (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  driver_id UUID REFERENCES users(id),
  data JSON,
  passed BOOLEAN,
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  amount REAL,
  status TEXT CHECK (status IN ('pending', 'synced')),
  quickbooks_id TEXT,
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);