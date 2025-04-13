import { Injectable } from '@angular/core';
import { Alarm } from '../Models/alarm.model';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class AlarmService {
  constructor() { 
    this.createNotificationChannel();
    this.createSilentNotificationChannel(); // Initialize the silent channel
    this.requestNotificationPermission();
    this.registerActionTypes();
    this.listenToNotificationActions();
    this.scheduleDailyNotification();
    this.registerDailyNotificationActions();
    this.listenToDailyNotificationActions();
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
      // Ensure all alarms are turned off by default
      this.alarms.forEach(alarm => {
        alarm.enabled = false;
      });
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

  listenToNotificationActions() {
    LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
      const notificationId = event.notification.id;
      const actionId = event.actionId;
    
      if (actionId && actionId === 'STOP_ALARM') {
        this.cancelAlarm(notificationId);
        console.log(`🛑 Alarm stopped via notification for id: ${notificationId}`);
      } else {
        console.log(`ℹ️ Notification tapped, no action taken (actionId: ${actionId})`);
      }
    });
  }

  

   ScheduleAlarmForDays(alarm: Alarm) {
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
  
      if (alarmDate.getTime() > now.getTime()) {
        // Schedule main alarm
        LocalNotifications.schedule({
          notifications: [
            {
              id: alarm.id * 10 + targetDay, // Unique ID for each day
              title: `🔔 ${alarm.label || 'Alarm'}`,
              body: `Alarm set for ${day} at ${alarm.time}`,
              schedule: { at: alarmDate },
              channelId: `alarm${alarm.sound || "1"}-channel`,
              actionTypeId: 'ALARM_ACTIONS',
              autoCancel: false,
              silent: false,
            }
          ]
        }).then(() => {
          console.log(`✅ Alarm scheduled for ${day} at ${alarmDate}`);
        });
      
        // Schedule pre-alarm
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
                silent: true 
                
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

  scheduleDailyNotification(): void {
    const now = new Date();
    const notificationTime = new Date(now);
    notificationTime.setHours(4, 50, 0, 0); 

    if (notificationTime.getTime() <= now.getTime()) {
      // If it's already past 10:00 PM today, schedule for tomorrow
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    LocalNotifications.schedule({
      notifications: [
        {
          id: 9999, // Unique ID for the daily notification
          title: '⏰ Schedule Tomorrow’s Alarm',
          body: 'Would you like to schedule the alarm for 6:00 AM tomorrow?',
          schedule: { at: notificationTime, repeats: true },
          channelId: 'daily-notification-channel',
          actionTypeId: 'DAILY_NOTIFICATION_ACTIONS',
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

  listenToDailyNotificationActions(): void {
    LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
      const actionId = event.actionId;

      if (actionId === 'SCHEDULE_ALARM') {
        this.scheduleNextDayAlarm();
        console.log('✅ Alarm scheduled for 6:00 AM tomorrow');
      } else if (actionId === 'DISMISS_NOTIFICATION') {
        console.log('❌ Notification dismissed');
      }
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
      console.log(`✅ Alarm scheduled for ${alarmTime}`);
    });
  }
}