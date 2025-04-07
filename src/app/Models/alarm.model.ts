export interface Alarm {
    id: number;
    label: string;
    time: string;
    days: string[];
    enabled: boolean;
    group: 'Active' | 'Others';
  }
  