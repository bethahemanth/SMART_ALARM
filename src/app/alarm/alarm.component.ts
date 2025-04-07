import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Alarm } from '../Models/alarm.model';
import { AlarmService } from '../services/alarm.service';

@Component({
  selector: 'app-alarm',
  templateUrl: './alarm.component.html',
  styleUrls: ['./alarm.component.scss'],
  standalone: false
})
export class AlarmComponent implements OnInit {
  alarms: Alarm[] = [];
  selectedAlarmId: number | null = null;
  currentlyEditingId: number | null = null;
  newLabel: string = '';
  currentlyEditingTimeId: number | string = '';
  newTime: string='' // Initialize with the current date and time;
  

  dayOptions: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  selectedDaysMap: { [id: number]: string[] } = {};

  constructor(private alarmService: AlarmService,private cdRef:ChangeDetectorRef) {}

  ngOnInit(): void {
    this.alarms = this.alarmService.getAlarms();
    this.alarms.forEach(alarm => {
      this.selectedDaysMap[alarm.id] = [...alarm.days];
    });
  }

  toggleAlarm(alarm: Alarm): void {
    this.alarmService.toggleAlarm(alarm.id);
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

  get activeAlarms(): Alarm[] {
    return this.alarms.filter(a => a.group === 'Active');
  }

  get otherAlarms(): Alarm[] {
    return this.alarms.filter(a => a.group === 'Others');
  }

  startEditing(alarm: Alarm) {
    if (!alarm.enabled) return; 
    this.currentlyEditingId = alarm.id;
    this.newLabel = alarm.label;
  }
  
  startEditingTime(alarm: Alarm): void {
    if (!alarm.enabled) return;
    this.currentlyEditingTimeId = alarm.id;
    this.newTime = this.convertToISOTime(alarm.time);  // Initialize newTime with the current alarm time
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
    const datePart = now.toISOString().split('T')[0]; // Today's date in YYYY-MM-DD
  
    const isoTime = `${datePart}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  
    return isoTime; // Correct local time in ISO format
  }
  
  
  saveTime(alarm: Alarm): void {
    console.log('Save button clicked');
    console.log(`New Time: ${this.newTime}`);
    if (this.newTime) {
      alarm.time = this.formatTime(this.newTime); // Save the formatted time
      console.log(`Time saved for Alarm ID ${alarm.id}: ${alarm.time}`);
    }
    this.currentlyEditingTimeId = ''; // Exit editing mode
    this.cdRef.detectChanges(); // Trigger change detection to update the view
  }

  updateTime(event: any): void {
    const selectedTime = event.detail.value; // Get the selected time from the event
    if (selectedTime) {
      this.newTime = selectedTime; // Update the newTime property
      console.log(`Selected time: ${this.newTime}`);
    }
  }

  exitTimeEditing(): void {
    this.currentlyEditingTimeId = ''; // Exit editing mode
  }

  cancelTimeEditing(): void {
    this.currentlyEditingTimeId = ''; // Exit editing mode without saving
  }

  formatTime(isoString: string): string {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 24-hour time to 12-hour time
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
    console.log('Selected Days Map:', this.selectedDaysMap);
    this.alarms.forEach(alarm => {
      console.log(`Alarm ID: ${alarm.id}`);
      console.log(`Label: ${alarm.label}`);
      console.log(`Time: ${alarm.time}`);
      console.log(`Days: ${alarm.days}`);
    });
  }
}

