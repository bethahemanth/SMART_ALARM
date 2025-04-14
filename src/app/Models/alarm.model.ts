export interface Alarm {
    id: number;
    label: string;
    time: string;
    days: string[];
    enabled: boolean;
    group: 'Active' | 'Others';
    sound:string;
    showDelete?: boolean; 
  }
  export interface Settings {
    timeFormat24Hr: boolean;
    snoozeDuration: number;
    ringtone: string;
    vibration: boolean;
    alarmVolume: number;
    darkTheme: boolean;
    language: string;
  }