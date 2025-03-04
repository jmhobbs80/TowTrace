export type RootStackParamList = {
  VINScanner: undefined;
  JobTracker: undefined;
  FleetTracker: undefined;
  JobAssignment: undefined;
  EldManagement: undefined;
  SubscriptionSettings: undefined;
  Login: undefined;
};

export interface InspectionData {
  details: string;
  passed: boolean;
  tirePressure: string;
  brakes: string;
  lights: string;
  date: string;
  photoUris?: string[];
}

export interface VehiclePhoto {
  uri: string;
  type: 'front' | 'rear' | 'side' | 'damage';
  timestamp: string;
}

export interface Vehicle {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
  vin?: string;
  photos?: VehiclePhoto[];
  driverId?: string;
  assignedJobId?: string;
}

export interface TrackingLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
}

export interface Driver {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  currentVehicleId?: string;
}

export interface Job {
  id: string;
  driverId?: string;
  vehicleId?: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  stops?: Array<{
    latitude: number;
    longitude: number;
    address: string;
    orderId: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  userRole?: "driver" | "dispatcher";
  isLoading: boolean;
  logout: () => Promise<void>;
  subscription?: string;
  hasEldAccess?: boolean;
}