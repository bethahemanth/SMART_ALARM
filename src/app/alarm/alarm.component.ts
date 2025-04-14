import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Alarm } from '../Models/alarm.model';
import { AlarmService } from '../services/alarm.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-alarm',
  templateUrl: './alarm.component.html',
  styleUrls: ['./alarm.component.scss'],
  standalone: false
})
export class AlarmComponent implements OnInit, OnDestroy, AfterViewInit {
  alarms: Alarm[] = [];
  selectedAlarmId: number | null = null;
  currentlyEditingId: number | null = null;
  newLabel: string = '';
  currentlyEditingTimeId: number | string = '';
  newTime: string = '';
  isAlarmEnabled: { [key: number]: boolean } = {}; 
  isAddAlarmModalOpen: boolean = false; 
  newAlarmTime: string = ''; 
  newAlarmLabel: string = ''; 

  dayOptions: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(private alarmService: AlarmService, private cdRef: ChangeDetectorRef, private router: Router) {}

  ngAfterViewInit(): void {
    this.alarms = this.alarmService.getAlarms(); 
    this.alarms.forEach(alarm => {
      this.isAlarmEnabled[alarm.id] = !alarm.enabled; 
    });
    this.alarmService.setalarms(this.alarms);
    this.cdRef.detectChanges();
  }

  deleteAlarm(alarm: any) {
    this.alarms = this.alarms.filter(a => a.id !== alarm.id);
  }
  
  ngOnDestroy(): void {
    this.alarmService.setalarms(this.alarms);
    this.alarmService.saveAlarms(this.alarms); 
    console.log('Alarms saved to localStorage:', this.alarms);
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: Event): void {
    this.alarmService.setalarms(this.alarms);
    this.alarmService.saveAlarms(this.alarms);
    console.log('Alarms saved on browser close/refresh:', this.alarms);
  }

  openSoundPicker(alarm: Alarm) {
    this.router.navigate(['/soundpicker'], { state: { alarmId: alarm.id } });
  }

  ngOnInit(): void {
    console.log("component loaded");
  }

  getSoundName(id: string): string {
    const sound = this.alarmService.getSoundById(id); 
    return sound; 
  }

  toggleAlarm(alarmId: number): void {
    const alarm = this.alarms.find(a => a.id === alarmId);
    if (alarm) {
      alarm.enabled = !alarm.enabled; 
      this.alarmService.setalarms(this.alarms); 
      this.cdRef.detectChanges();
      console.log(`Alarm ID ${alarmId} is now ${alarm.enabled ? 'ON' : 'OFF'}`);
    }
  }

  onToggleChange(alarm: Alarm, event: any): void {
    const isChecked = event.detail.checked; 
    this.isAlarmEnabled[alarm.id] = isChecked;
    alarm.enabled = isChecked; 
    this.alarmService.setalarms(this.alarms); 
    console.log(`Alarm ID ${alarm.id} is now ${isChecked ? 'ON' : 'OFF'}`);
  }

  toggleOptions(id: number): void {
    this.selectedAlarmId = this.selectedAlarmId === id ? null : id;
  }

  toggleDay(alarm: Alarm, day: string): void {
    const index = alarm.days.indexOf(day);
    if (index >= 0) {
      alarm.days.splice(index, 1);
    } else {
      alarm.days.push(day);
    }
  }
  openAddAlarmModal() {
    this.isAddAlarmModalOpen = true; 
  }

  closeAddAlarmModal() {
    this.isAddAlarmModalOpen = false; 
    this.newAlarmTime = ''; 
    this.newAlarmLabel = ''; 
  }
  saveNewAlarm() {
    if (this.newAlarmTime) {
      const newAlarmTimedate = new Date(this.newAlarmTime); 
      const currentTime = new Date();
      const currentDay = currentTime.getDay();
      const currentTimeStr = currentTime.toTimeString().split(' ')[0]; 
      const alarmTimeStr = newAlarmTimedate.toTimeString().split(' ')[0]; 
      if (alarmTimeStr <= currentTimeStr) {
        newAlarmTimedate.setDate(newAlarmTimedate.getDate() + 1); 
      }
  
      const newAlarm: Alarm = {
        id: this.alarms.length + 1, 
        label: this.newAlarmLabel || 'New Alarm',
        time: this.formatTime(this.newAlarmTime), 
        days: this.getDaysForTime(newAlarmTimedate), 
        enabled: true,
        group: 'Active',
        sound: '1' 
      };
      this.isAlarmEnabled[newAlarm.id] = true;
      this.alarms.push(newAlarm); 
      this.alarmService.ScheduleAlarmForDays(newAlarm); 
      this.alarmService.saveAlarms(this.alarms);
      console.log('New alarm added:', newAlarm);
      this.closeAddAlarmModal();
    } else {
      console.log('Please select a time for the alarm.');
    }
  }
  
  
  getDaysForTime(time: Date): string[] {
    const selectedDay = time.getDay(); 
    return [this.dayOptions[selectedDay]];
  }
  
  get activeAlarms(): Alarm[] {
    return this.alarms.filter(a => a.group === 'Active');
  }
  startEditing(alarm: Alarm) {
    this.currentlyEditingId = alarm.id;
    this.newLabel = alarm.label;
  }

  startEditingTime(alarm: Alarm): void {
    this.currentlyEditingTimeId = alarm.id;
    this.newTime = this.convertToISOTime(alarm.time); 
    console.log(`Editing time for Alarm ID ${alarm.id}`);
  }

  convertToISOTime(timeStr: string): string {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    const now = new Date();
    const datePart = now.toISOString().split('T')[0];

    const isoTime = `${datePart}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

    return isoTime; 
  }

  saveTime(alarm: Alarm): void {
    console.log('Save button clicked');
    console.log(`New Time: ${this.newTime}`);
    if (this.newTime) {
      const formattedTime = this.formatTime(this.newTime); 
      if (alarm.time !== formattedTime) {
        alarm.time = formattedTime; 
        console.log(`Time saved for Alarm ID ${alarm.id}: ${alarm.time}`);
        this.alarmService.ScheduleAlarmForDays(alarm); 
        this.alarmService.setalarms(this.alarms); 
      }
     
      this.isAlarmEnabled[alarm.id] = true; 
      alarm.enabled = true; 
      this.alarmService.setalarms(this.alarms);
      console.log(`Alarm ID ${alarm.id} is now ON`);
    }
    this.currentlyEditingTimeId = ''; 
    this.cdRef.detectChanges(); 
  }

  updateTime(event: any): void {
    const selectedTime = event.detail.value; 
    if (selectedTime) {
      this.newTime = selectedTime;
      console.log(`Selected time: ${this.newTime}`);
    }
  }

  exitTimeEditing(): void {
    this.currentlyEditingTimeId = ''; 
  }

  cancelTimeEditing(alarm: Alarm): void {
    this.currentlyEditingTimeId = ''; 
    this.isAlarmEnabled[alarm.id] = false; 
    alarm.enabled = false;
    this.alarmService.setalarms(this.alarms); 
    console.log(`Alarm ID ${alarm.id} has been turned OFF.`);
    this.cdRef.detectChanges(); 
  }

  formatTime(isoString: string): string {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; 
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  saveLabel(alarm: Alarm) {
    if (this.newLabel.trim()) {
      alarm.label = this.newLabel.trim();
    }
    this.currentlyEditingId = null;
  }

  logAllSelectedValues(): void {
    console.log('Alarms:', this.alarms);
    this.alarms.forEach(alarm => {
      console.log(`Alarm ID: ${alarm.id}`);
      console.log(`Label: ${alarm.label}`);
      console.log(`Time: ${alarm.time}`);
      console.log(`Days: ${alarm.days}`);
    });
  }

  onSettings(){
    console.log("settings");
    this.router.navigate(['/settings']);
  }
  onNotifications(){
    console.log("notification");
    this.router.navigate(['/notification']);
  }
}

