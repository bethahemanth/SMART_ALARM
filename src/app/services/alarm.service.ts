import { Injectable } from '@angular/core';
import { Alarm } from '../Models/alarm.model';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class AlarmService {
  constructor() { 
    this.createNotificationChannel();
    this.requestNotificationPermission();
    
  }
  sounds = [
    { id: 1, name: 'Morning Breeze', path: 'assets/sounds/alarm1.mp3' ,alarmId:1},
    { id: 2, name: 'Gentle Chimes', path: 'assets/sounds/alarm2.mp3' ,alarmId:2}, 
    { id: 3, name: 'Forest Dawn', path: 'assets/sounds/alarm3.mp3' ,alarmId:3},
    { id: 4, name: 'Echo Pulse', path: 'assets/sounds/alarm4.mp3' ,alarmId:4},
    { id: 5, name: 'Crystal Bell', path: 'assets/sounds/alarm5.mp3' ,alarmId:5},
    { id: 6, name: 'Feather Wake', path: 'assets/sounds/alarm6.mp3' ,alarmId:6},
  ];

  private alarms: Alarm[] = [
    { id: 1, label: 'Wake-Up', time: '09:20 AM', days: ['Sun', 'Mon', 'Tue'],enabled: true, group: 'Active',sound:'1' },
    { id: 2, label: '+ Add Label', time: '09:00 AM', days: ['Sun', 'Mon', 'Tue'], enabled: true, group: 'Active',sound:'2' },
    { id: 3, label: 'Wake-Up', time: '09:00 AM', days: ['Sun', 'Mon', 'Tue'], enabled: true, group: 'Active' ,sound:'2' },
    { id: 4, label: 'Wake-Up', time: '09:00 AM', days: ['Sun', 'Mon', 'Tue'], enabled: false, group: 'Active', sound:'3' },
    { id: 5, label: 'Wake-Up', time: '09:00 AM', days:['Sun', 'Mon', 'Tue'], enabled: false, group: 'Others', sound:'1' },
    { id: 6, label: '+ Add Label', time: '09:00 AM', days:['Sun', 'Mon', 'Tue'], enabled: false, group: 'Others', sound:'1' },
  ];

  getAlarms(): Alarm[] {
    const storedAlarms = localStorage.getItem('alarms');
    if (storedAlarms) {
      return JSON.parse(storedAlarms);
    } else {
      // If nothing in localStorage, store initial alarms
      localStorage.setItem('alarms', JSON.stringify(this.alarms));
      return this.alarms;
    }
  }
  
  saveAlarms(alarms: Alarm[]): void {
    this.alarms = alarms; // optional: update your internal array
    localStorage.setItem('alarms', JSON.stringify(alarms));
  }
  getSoundById(id: string) {
    return this.sounds.find(sound => sound.id === Number(id))?.name||"";
  }

  toggleAlarm(alarmId: number) {
    const alarm = this.alarms.find(a => a.id === alarmId);
    if (alarm) {
      alarm.enabled = !alarm.enabled;
    }
  }
  
  ScheduleAlarm(alarm:Alarm){
    const alarmTime = new Date(alarm.time);
    if (alarmTime.getTime() < Date.now()) return; // Skip past alarms
    LocalNotifications.schedule({
      notifications: [
        {
          id: alarm.id,
          title: `🔔 ${alarm.label || 'Alarm'}`,
          body: `Alarm set for ${alarmTime.toLocaleTimeString()}`,
          schedule: { at: alarmTime },
          channelId: `alarm${alarm.sound||"1"}-channel`,
          actionTypeId: 'ALARM_ACTIONS',
          autoCancel:false,
          silent:false,
        }
      ]
    }).then(() => {
      console.log(`✅ Alarm scheduled: ${alarm.label} at ${alarm.time}`);
    });
   }
   ScheduleAlarmForDays(alarm: Alarm) {
    const now = new Date();
  
    const weekdaysMap: { [key: string]: number } = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
    };
  
    alarm.days.forEach(day => {
      const targetDay = weekdaysMap[day];
      const alarmDate = new Date(now); // start from today
  
      // Calculate days to add to reach targetDay
      const dayDiff = (targetDay - now.getDay() + 7) % 7;
      alarmDate.setDate(now.getDate() + dayDiff);
  
      // Set the time (e.g. '09:00 AM' to hours and minutes)
      const [timeString, period] = alarm.time.split(' ');
      const [hourStr, minuteStr] = timeString.split(':');
      let hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
  
      alarmDate.setHours(hour, minute, 0, 0); // set time part
  
      if (alarmDate.getTime() > now.getTime()) {
        // Schedule the alarm
        LocalNotifications.schedule({
          notifications: [
            {
              id: alarm.id * 10 + targetDay, // make unique per day
              title: `🔔 ${alarm.label || 'Alarm'}`,
              body: `Alarm set for ${day} at ${alarm.time}`,
              schedule: { at: alarmDate },
              channelId: `alarm${alarm.sound||"1"}-channel`,
              actionTypeId: 'ALARM_ACTIONS',
              autoCancel: false,
              silent: false,
            }
          ]
        }).then(() => {
          console.log(`✅ Alarm scheduled for ${day} at ${alarmDate}`);
        });
      } else {
        console.log(`⏩ Skipping past alarm for ${day}`);
      }
    });
  }
  
   async createNotificationChannel() {
    await LocalNotifications.createChannel({
      id: 'alarm1-channel',
      name: 'Alarm Notifications',
      vibration:true,
      description: 'Channel for repeating alarm notifications',
      importance: 5, // Max importance
      visibility: 1,
      sound:'alarm1'
    }).then(() => {
      console.log('✅ Notification channel created');
    }).catch(err => {
      console.error('❌ Error creating notification channel', err);
    });
    await LocalNotifications.createChannel({
      id: 'alarm2-channel',
      name: 'Alarm Notifications',
      vibration:true,
      description: 'Channel for repeating alarm notifications',
      importance: 5, // Max importance
      visibility: 1,
      sound:'alarm2'
    }).then(() => {
      console.log('✅ Notification channel created');
    }).catch(err => {
      console.error('❌ Error creating notification channel', err);
    });
    await LocalNotifications.createChannel({
      id: 'alarm3-channel',
      name: 'Alarm Notifications',
      vibration:true,
      description: 'Channel for repeating alarm notifications',
      importance: 5, // Max importance
      visibility: 1,
      sound:'alarm3'
    }).then(() => {
      console.log('✅ Notification channel created');
    }).catch(err => {
      console.error('❌ Error creating notification channel', err);
    });
    await LocalNotifications.createChannel({
      id: 'alarm4-channel',
      name: 'Alarm Notifications',
      vibration:true,
      description: 'Channel for repeating alarm notifications',
      importance: 5, // Max importance
      visibility: 1,
      sound:'alarm4'
    }).then(() => {
      console.log('✅ Notification channel created');
    }).catch(err => {
      console.error('❌ Error creating notification channel', err);
    });
    await LocalNotifications.createChannel({
      id: 'alarm5-channel',
      name: 'Alarm Notifications',
      vibration:true,
      description: 'Channel for repeating alarm notifications',
      importance: 5, // Max importance
      visibility: 1,
      sound:'alarm5'
    }).then(() => {
      console.log('✅ Notification channel created');
    }).catch(err => {
      console.error('❌ Error creating notification channel', err);
    });
    await LocalNotifications.createChannel({
      id: 'alarm6-channel',
      name: 'Alarm Notifications',
      vibration:true,
      description: 'Channel for repeating alarm notifications',
      importance: 5, // Max importance
      visibility: 1,
      sound:'alarm6'
    }).then(() => {
      console.log('✅ Notification channel created');
    }).catch(err => {
      console.error('❌ Error creating notification channel', err);
    });

   }
   async requestNotificationPermission() {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') {
      console.error('❌ Notification permission not granted');
    }
  }

  cancelAlarm(alarmId: number) {
    LocalNotifications.cancel({ notifications: [{ id: alarmId }] }).then(() => {
      console.log(`✅ Alarm canceled: ${alarmId}`);
    });
  }
  getAlarmById(id: number): Alarm | undefined {
    return this.alarms.find(alarm => alarm.id === id);
  } 
   


  setalarms(alarms: Alarm[]) {
    // Step 1: Get all scheduled notifications
    LocalNotifications.getPending().then(result => {
      const allIds = result.notifications.map(n => ({ id: n.id }));
      
      if (allIds.length > 0) {
        // Step 2: Cancel all notifications
        LocalNotifications.cancel({ notifications: allIds }).then(() => {
          console.log('✅ All scheduled alarms canceled');
        });
      } else {
        console.log('ℹ️ No scheduled alarms to cancel');
      }
  
      // Step 3: Re-schedule active alarms
      alarms
        .filter(alarm => alarm.enabled)
        .forEach(alarm => this.ScheduleAlarmForDays(alarm));
    });
  }
  

}