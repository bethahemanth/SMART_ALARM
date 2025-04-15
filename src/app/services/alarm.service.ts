import { Injectable } from '@angular/core';
import { Alarm, Settings } from '../Models/alarm.model';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class AlarmService {
  alarmDate2 = [];
  st: any;
  constructor() { 
    this.createNotificationChannel();
    this.createSilentNotificationChannel(); // Initialize the silent channel
    this.createDailyNotificationChannel(); // Initialize the daily notification channel
    this.requestNotificationPermission();
    this.registerActionTypes();
    this.scheduleDailyNotification();
    this.registerDailyNotificationActions();
  }
    settings: Settings = {
      timeFormat24Hr: false,
      snoozeDuration: 5,
      ringtone: 'Morning Breeze',
      vibration: false,
      alarmVolume: 50,
      darkTheme: false,
      language: 'English'
    };
  dayOptions: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
    { id: 7, label: 'Wake-Up', time: '06:00 AM', days: [], enabled: false, group: 'Prebed', sound:'3' },
  ];

  getAlarms(): Alarm[] {
    const saved = localStorage.getItem('alarms');
    if (saved) {
      this.alarms = JSON.parse(saved);
    }
    return this.alarms;
  }
  
  
  saveAlarms(alarms: Alarm[]): void {
    this.alarms = alarms; // optional: update your internal array
    localStorage.setItem('alarms', JSON.stringify(alarms));
  }

  saveSettings(settings: Settings): void {
    this.settings = settings; // optional: update your internal settings
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  getSettings(): Settings {
    const saved = localStorage.getItem('settings');
    if (saved) {
      this.settings = JSON.parse(saved);
    }
    return this.settings;
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
  

   registerActionTypes() {
    LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'ALARM_ACTIONS',
          actions: [
            {
              id: 'STOP_ALARM',
              title: '🛑 Stop',
              foreground: false
            }
          ]
        }
      ]
    });
  }
  

   ScheduleAlarmForDays(alarm: Alarm,isSnooze:boolean=false) {
    const now = new Date();
  
    const weekdaysMap: { [key: string]: number } = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
    };
  
    alarm.days.forEach(day => {
      const targetDay = weekdaysMap[day];
      const alarmDate = new Date(now); 
      const dayDiff = (targetDay - now.getDay() + 7) % 7;
      alarmDate.setDate(now.getDate() + dayDiff);
      const [timeString, period] = alarm.time.split(' ');
      const [hourStr, minuteStr] = timeString.split(':');
      let hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      alarmDate.setHours(hour, minute, 0, 0);
      if(isSnooze){
        const snoozeDuration = this.settings?.snoozeDuration || 5; // Default to 5 minutes if not set
        alarmDate.setMinutes(alarmDate.getMinutes() + snoozeDuration); // Add snooze duration
      }
      if (alarmDate.getTime() > now.getTime()) {
        LocalNotifications.schedule({
          notifications: [
            {
              id: alarm.id * 10 + targetDay, 
              title: `🔔 ${alarm.label || 'Alarm'}`,
              body: `Alarm set for ${day} at ${alarm.time}`,
              schedule: { at: alarmDate },
              channelId: `alarm${alarm.sound||"1"}-channel`,
              actionTypeId: 'ALARM_ACTIONS',
              autoCancel: false,
              silent: false,
              ongoing:true,
              group:alarm.id.toString() // Group by alarm ID
            }
          ]
        }).then(() => {
          console.log(`✅ Alarm scheduled for ${day} at ${alarmDate}`);
        });

        const preAlarmDate = new Date(alarmDate.getTime() - 5 * 60 * 1000); // 5 minutes before
        if (preAlarmDate.getTime() > now.getTime()) {
          LocalNotifications.schedule({
            notifications: [
              {
                id: alarm.id * 10 + targetDay + 1000, // Unique ID for pre-alarm
                title: `⏰ Upcoming Alarm`,
                body: `Alarm will ring soon at ${alarm.time}`,
                schedule: { at: preAlarmDate },
                channelId: 'silent-channel', // Use the silent channel
                actionTypeId: 'PRE_ALARM_ACTIONS',
                autoCancel: false,
                silent: true,
                group:alarm.id.toString() 

              }
            ]
          }).then(() => {
            console.log(`✅ Pre-alarm scheduled for ${day} at ${preAlarmDate}`);
          });
        } else {
          console.log(`⏩ Skipping pre-alarm for ${day} as it's in the past`);
        }
      } else {
        console.log(`⏩ Skipping past alarm for ${day}`);
      }
      console.log("🕒 Now:", now);
      console.log("🔔 Alarm:", alarmDate); 
      this.st="🔔 Alarm:"+alarmDate;
      const formatted = alarmDate.toLocaleString('en-US', {
       weekday: 'short',
       year: 'numeric',
       month: 'short',
       day: '2-digit',
       hour: '2-digit',
       minute: '2-digit',
       second: '2-digit',
       hour12: true
     });
 
    
     localStorage.setItem('alarmData', JSON.stringify(formatted));
     
     console.log(formatted); // You can check the final result here
 
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
      sound:'alarm1',
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
      importance: 5,
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

   async createSilentNotificationChannel() {
    await LocalNotifications.createChannel({
      id: 'silent-channel',
      name: 'Silent Notifications',
      description: 'Pre-alarm notifications with no sound',
      importance: 3, // Default importance
      visibility: 1,
      sound: undefined, // No sound
      vibration: false
    }).then(() => {
      console.log('✅ Silent notification channel created');
    }).catch(err => {
      console.error('❌ Error creating silent notification channel', err);
    });
  }

  async createDailyNotificationChannel() {
    await LocalNotifications.createChannel({
      id: 'daily-notification-channel',
      name: 'Daily Notifications',
      description: 'Channel for daily notifications',
      importance: 4, // High importance
      visibility: 1, // Public visibility
      vibration: true,
      sound: undefined // No sound for daily notifications
    }).then(() => {
      console.log('✅ Daily notification channel created');
    }).catch(err => {
      console.error('❌ Error creating daily notification channel', err);
    });
  }

   async requestNotificationPermission() {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') {
      console.error('❌ Notification permission not granted');
    } else {
      console.log('✅ Notification permission granted');
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
        // LocalNotifications.cancel({ notifications: allIds }).then(() => {
        //   console.log('✅ All scheduled alarms canceled');
        // });
      } else {
        console.log('ℹ️ No scheduled alarms to cancel');
      }
  

     this.alarms = [];

      alarms.forEach(alarm => {
        this.alarms.push(alarm); // Add to internal array
        if (alarm.enabled) {
          this.ScheduleAlarmForDays(alarm); // Schedule the alarm
        }
      });
  
      // Step 4: Save the updated alarms to localStorage
      this.saveAlarms(this.alarms);
    });
  }


scheduleDailyNotification(): void {
  const now = new Date();
  const notificationTime = new Date();
  notificationTime.setHours(15, 5, 0, 0);
  if (notificationTime <= now) {
    notificationTime.setDate(notificationTime.getDate());
  }
    LocalNotifications.schedule({
      notifications: [
        {
          id: 9999,
          title: '⏰ Schedule Tomorrow’s Alarm',
          body: 'Would you like to schedule the alarm for 6:00 AM tomorrow?',
          schedule: { at: notificationTime},
          channelId: 'daily-notification-channel',
          actionTypeId: 'DAILY_NOTIFICATION_ACTIONS', // Attach action types
          autoCancel: false,
          silent: false,
        }
      ]
    }).then(() => {
      console.log(`✅ Daily notification scheduled for ${notificationTime}`);
    });
}



  registerDailyNotificationActions(): void {
    LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'DAILY_NOTIFICATION_ACTIONS',
          actions: [
            {
              id: 'SCHEDULE_ALARM',
              title: 'Schedule',
              foreground: true
            },
            {
              id: 'DISMISS_NOTIFICATION',
              title: 'Dismiss',
              foreground: false
            }
          ]
        }
      ]
    });
  }


  scheduleNextDayAlarm(): void {
    const now = new Date();
    const alarmTime = new Date(now);
    alarmTime.setDate(alarmTime.getDate() + 1); // Set for the next day
    alarmTime.setHours(6, 0, 0, 0); // Set time to 6:00 AM
    LocalNotifications.schedule({
      notifications: [
        {
          id: 10000, // Unique ID for the 6:00 AM alarm
          title: '⏰ Morning Alarm',
          body: 'Good morning! Time to wake up!',
          schedule: { at: alarmTime },
          channelId: 'alarm1-channel',
          actionTypeId: 'ALARM_ACTIONS',
          autoCancel: false,
          silent: false,
        }
      ]
    }).then(() => {
      const alarm:Alarm={
        id:this.alarms.length+1,
        label: 'Wake Up Morning Alarm',
        time: '06:00 AM',
        days: [this.dayOptions[(now.getDay()+1)%7]], // Set the current day
        enabled: true,  
        sound:'1',
        group: 'Active'
      };
      this.alarms.push(alarm);
      this.saveAlarms(this.alarms); 
      console.log(`✅ Alarm scheduled for ${alarmTime}`);
    });
  }
}