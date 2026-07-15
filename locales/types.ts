export interface Translations {
  navDevices: string;
  navStats: string;
  navSettings: string;

  headerTitle: string;
  allDevices: (n: number) => string;
  allBatteries: (n: number) => string;
  ready: string;
  charging: string;
  low: string;
  searchPlaceholder: string;
  filterAll: string;
  filterCameras: string;
  filterLights: string;
  filterAudio: string;
  filterDrones: string;
  filterOther: string;
  
  statusCharged: string;
  statusCharging: string;
  statusDischarged: string;

  emptyDevicesTitle: string;
  emptyDevicesSubtitle: string;
  emptySearchTitle: string;
  emptySearchSubtitle: string;
  emptyBatteriesTitle: string;
  emptyBatteriesSubtitle: string;

  editDevice: string;
  deleteDevice: string;
  deleteBattery: string;
  deleteDeviceConfirm: (name: string) => string;
  deleteCancel: string;
  deleteConfirm: string;

  newDevice: string;
  deviceNameLabel: string;
  deviceNamePlaceholder: string;
  categoryLabel: string;
  saveChanges: string;
  addDevice: string;

  addBattery: string;
  editBattery: string;
  batteryNameLabel: string;
  batteryNamePlaceholder: string;
  statusLabel: string;

  batteriesCount: (n: number) => string;
  deviceCategoryCount: (cat: string, n: number) => string;

  statsTitle: string;
  statsSubtitle: string;
  statDevices: string;
  statBatteries: string;
  statReady: string;
  statNeedsCharge: string;
  gearReady: string;
  statusBreakdown: string;
  noBatteriesTracked: string;
  byCategory: string;
  catDeviceCount: (n: number) => string;
  catBatteryCount: (n: number) => string;

  settingsTitle: string;
  appearance: string;
  currentTheme: (scheme: string) => string;
  languageSection: string;
  langEnglish: string;
  langGreek: string;
  about: string;
  developerHeadline: string;
  developerName: string;
  appName: string;
  appTagline: string;
  appVersion: string;
  tips: string;
  tip1: string;
  tip2: string;
  tip3: string;
  tip4: string;
}
