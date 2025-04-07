import { Injectable } from '@angular/core';
import { Alarm } from '../Models/alarm.model';

@Injectable({
  providedIn: 'root'
})
export class AlarmService {

  private alarms: Alarm[] = [
    { id: 1, label: 'Wake-Up', time: '09:20 AM', days: ['Sun', 'Mon', 'Tue'],enabled: true, group: 'Active' },
    { id: 2, label: '+ Add Label', time: '09:00 AM', days: ['Sun', 'Mon', 'Tue'], enabled: true, group: 'Active' },
    { id: 3, label: 'Wake-Up', time: '09:00 AM', days: ['Sun', 'Mon', 'Tue'], enabled: true, group: 'Active' },
    { id: 4, label: 'Wake-Up', time: '09:00 AM', days: ['Sun', 'Mon', 'Tue'], enabled: false, group: 'Active' },
    { id: 5, label: 'Wake-Up', time: '09:00 AM', days:['Sun', 'Mon', 'Tue'], enabled: false, group: 'Others' },
    { id: 6, label: '+ Add Label', time: '09:00 AM', days:['Sun', 'Mon', 'Tue'], enabled: false, group: 'Others' }
  ];

  getAlarms(): Alarm[] {
    return this.alarms;
  }
  toggleAlarm(alarmId: number) {
    const alarm = this.alarms.find(a => a.id === alarmId);
    if (alarm) {
      alarm.enabled = !alarm.enabled;
    }
  }
  
}
