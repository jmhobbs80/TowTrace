CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  subscription_plan TEXT CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  payment_status TEXT CHECK (payment_status IN ('active', 'past_due', 'canceled')),
  tow_trace_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'dispatcher', 'driver', 'manager', 'system_admin', 'client_admin')),
  tenant_id UUID REFERENCES tenants(id),
  two_factor_secret TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY,
  vin TEXT UNIQUE NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  condition_photos TEXT,
  status TEXT CHECK (status IN ('active', 'idle', 'maintenance', 'out_of_service')),
  latitude REAL,
  longitude REAL,
  last_updated TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  driver_id UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'stored')),
  pickup_location TEXT,
  pickup_latitude REAL,
  pickup_longitude REAL,
  dropoff_location TEXT,
  dropoff_latitude REAL,
  dropoff_longitude REAL,
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_stops (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  address TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  order_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inspections (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  vehicle_id UUID REFERENCES vehicles(id),
  driver_id UUID REFERENCES users(id),
  data JSON,
  passed BOOLEAN,
  tire_pressure TEXT,
  brakes TEXT,
  lights TEXT,
  details TEXT,
  photo_uris TEXT,
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  amount REAL,
  status TEXT CHECK (status IN ('pending', 'paid', 'synced', 'overdue')),
  quickbooks_id TEXT,
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tracking_locations (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  driver_id UUID REFERENCES users(id),
  job_id UUID REFERENCES jobs(id),
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  speed REAL,
  timestamp TIMESTAMP NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE eld_devices (
  id UUID PRIMARY KEY,
  device_serial TEXT UNIQUE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id),
  tenant_id UUID REFERENCES tenants(id),
  status TEXT CHECK (status IN ('active', 'inactive', 'maintenance')),
  last_ping TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE eld_hours_of_service (
  id UUID PRIMARY KEY,
  driver_id UUID REFERENCES users(id),
  vehicle_id UUID REFERENCES vehicles(id),
  eld_device_id UUID REFERENCES eld_devices(id),
  status TEXT CHECK (status IN ('on_duty', 'off_duty', 'driving', 'sleeping')),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration_minutes INTEGER,
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription_features (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  feature_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription_payments (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  amount REAL NOT NULL,
  payment_date TIMESTAMP NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT CHECK (status IN ('success', 'failed', 'pending', 'refunded')),
  quickbooks_invoice_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  key_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  permissions TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);