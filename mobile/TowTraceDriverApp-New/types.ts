export type RootStackParamList = {
  VINScanner: undefined;
  JobTracker: undefined;
  Inspection: undefined;
  FleetTracker: undefined;
  JobAssignment: undefined;
  EldDashboard: undefined;
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
}

export interface TrackingLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
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