import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { Battery, BatteryStatus, Device, DeviceCategory } from '@/types';
import { generateId } from '@/utils/id';

const DEVICES_KEY = '@battery_tracker/devices';
const BATTERIES_KEY = '@battery_tracker/batteries';

const DUMMY_DEVICES: Device[] = [
  { id: 'd1', name: 'Sony A7 IV', category: 'cameras', createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'd2', name: 'Nikon D5200', category: 'cameras', createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'd3', name: 'Godox SL-60W', category: 'lights', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'd4', name: 'DJI Mini 3 Pro', category: 'drones', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'd5', name: 'Rode NTG5', category: 'audio', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date().toISOString() },
];

const DUMMY_BATTERIES: Battery[] = [
  { id: 'b1', deviceId: 'd1', name: 'NP-FZ100 #1', status: 'charged', updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'b2', deviceId: 'd1', name: 'NP-FZ100 #2', status: 'discharged', updatedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'b3', deviceId: 'd1', name: 'NP-FZ100 #3', status: 'charging', updatedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'b4', deviceId: 'd2', name: 'EN-EL14a #1', status: 'charged', updatedAt: new Date(Date.now() - 5400000).toISOString() },
  { id: 'b5', deviceId: 'd2', name: 'EN-EL14a #2', status: 'discharged', updatedAt: new Date(Date.now() - 10800000).toISOString() },
  { id: 'b6', deviceId: 'd3', name: 'Power Pack #1', status: 'charged', updatedAt: new Date(Date.now() - 900000).toISOString() },
  { id: 'b7', deviceId: 'd3', name: 'Power Pack #2', status: 'charging', updatedAt: new Date(Date.now() - 2700000).toISOString() },
  { id: 'b8', deviceId: 'd4', name: 'Intelligent Battery #1', status: 'charged', updatedAt: new Date(Date.now() - 600000).toISOString() },
  { id: 'b9', deviceId: 'd4', name: 'Intelligent Battery #2', status: 'discharged', updatedAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 'b10', deviceId: 'd4', name: 'Intelligent Battery #3', status: 'discharged', updatedAt: new Date(Date.now() - 18000000).toISOString() },
  { id: 'b11', deviceId: 'd5', name: 'AA Pack #1', status: 'charged', updatedAt: new Date(Date.now() - 300000).toISOString() },
];

interface BatteryContextType {
  devices: Device[];
  batteries: Battery[];
  isLoading: boolean;
  addDevice: (name: string, category: DeviceCategory) => Promise<Device>;
  updateDevice: (id: string, name: string, category: DeviceCategory) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  addBattery: (deviceId: string, name: string, status: BatteryStatus) => Promise<Battery>;
  updateBattery: (id: string, name: string, status: BatteryStatus) => Promise<void>;
  deleteBattery: (id: string) => Promise<void>;
  getBatteriesForDevice: (deviceId: string) => Battery[];
  getDevice: (id: string) => Device | undefined;
}

const BatteryContext = createContext<BatteryContextType | null>(null);

export function BatteryProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [devicesJson, batteriesJson] = await Promise.all([
        AsyncStorage.getItem(DEVICES_KEY),
        AsyncStorage.getItem(BATTERIES_KEY),
      ]);

      if (devicesJson && batteriesJson) {
        setDevices(JSON.parse(devicesJson));
        setBatteries(JSON.parse(batteriesJson));
      } else {
        setDevices(DUMMY_DEVICES);
        setBatteries(DUMMY_BATTERIES);
        await Promise.all([
          AsyncStorage.setItem(DEVICES_KEY, JSON.stringify(DUMMY_DEVICES)),
          AsyncStorage.setItem(BATTERIES_KEY, JSON.stringify(DUMMY_BATTERIES)),
        ]);
      }
    } catch (e) {
      setDevices(DUMMY_DEVICES);
      setBatteries(DUMMY_BATTERIES);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDevices = useCallback(async (updated: Device[]) => {
    setDevices(updated);
    await AsyncStorage.setItem(DEVICES_KEY, JSON.stringify(updated));
  }, []);

  const saveBatteries = useCallback(async (updated: Battery[]) => {
    setBatteries(updated);
    await AsyncStorage.setItem(BATTERIES_KEY, JSON.stringify(updated));
  }, []);

  const addDevice = useCallback(async (name: string, category: DeviceCategory): Promise<Device> => {
    const now = new Date().toISOString();
    const device: Device = { id: generateId(), name, category, createdAt: now, updatedAt: now };
    await saveDevices([device, ...devices]);
    return device;
  }, [devices, saveDevices]);

  const updateDevice = useCallback(async (id: string, name: string, category: DeviceCategory) => {
    const updated = devices.map(d => d.id === id ? { ...d, name, category, updatedAt: new Date().toISOString() } : d);
    await saveDevices(updated);
  }, [devices, saveDevices]);

  const deleteDevice = useCallback(async (id: string) => {
    await saveDevices(devices.filter(d => d.id !== id));
    await saveBatteries(batteries.filter(b => b.deviceId !== id));
  }, [devices, batteries, saveDevices, saveBatteries]);

  const addBattery = useCallback(async (deviceId: string, name: string, status: BatteryStatus): Promise<Battery> => {
    const battery: Battery = { id: generateId(), deviceId, name, status, updatedAt: new Date().toISOString() };
    await saveBatteries([battery, ...batteries]);
    return battery;
  }, [batteries, saveBatteries]);

  const updateBattery = useCallback(async (id: string, name: string, status: BatteryStatus) => {
    const updated = batteries.map(b => b.id === id ? { ...b, name, status, updatedAt: new Date().toISOString() } : b);
    await saveBatteries(updated);
  }, [batteries, saveBatteries]);

  const deleteBattery = useCallback(async (id: string) => {
    await saveBatteries(batteries.filter(b => b.id !== id));
  }, [batteries, saveBatteries]);

  const getBatteriesForDevice = useCallback((deviceId: string) => {
    return batteries.filter(b => b.deviceId === deviceId);
  }, [batteries]);

  const getDevice = useCallback((id: string) => {
    return devices.find(d => d.id === id);
  }, [devices]);

  return (
    <BatteryContext.Provider value={{
      devices, batteries, isLoading,
      addDevice, updateDevice, deleteDevice,
      addBattery, updateBattery, deleteBattery,
      getBatteriesForDevice, getDevice,
    }}>
      {children}
    </BatteryContext.Provider>
  );
}

export function useBattery() {
  const ctx = useContext(BatteryContext);
  if (!ctx) throw new Error('useBattery must be used within BatteryProvider');
  return ctx;
}
