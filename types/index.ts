export type DeviceCategory = 'cameras' | 'lights' | 'audio' | 'drones' | 'other';
export type BatteryStatus = 'charged' | 'charging' | 'discharged';

export interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  createdAt: string;
  updatedAt: string;
}

export interface Battery {
  id: string;
  deviceId: string;
  name: string;
  status: BatteryStatus;
  updatedAt: string;
}
