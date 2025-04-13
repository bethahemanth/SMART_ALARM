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

  dayOptions: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(private alarmService: AlarmService, private cdRef: ChangeDetectorRef, private router: Router) {}

  ngAfterViewInit(): void {
    this.alarms = this.alarmService.getAlarms(); // Fetch alarms from the service

    // Ensure all alarms are turned off by default
    this.alarms.forEach(alarm => {
      alarm.enabled = false; // Turn off all alarms
      this.isAlarmEnabled[alarm.id] = false; // Initialize toggle states to false
    });
    this.alarmService.setalarms(this.alarms); // Save the updated alarms in the service
    this.cdRef.detectChanges(); // Trigger change detection to update the view
  }

  ngOnDestroy(): void {
    this.alarmService.setalarms(this.alarms);
    this.alarmService.saveAlarms(this.alarms); // Save alarms to localStorage when component is destroyed
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

  ngOnInit(): void {}

  getSoundName(id: string): string {
    const sound = this.alarmService.getSoundById(id); // Fetch sound name by ID
    return sound; // Return sound name or default message
  }

  toggleAlarm(alarmId: number): void {
    const alarm = this.alarms.find(a => a.id === alarmId);
    if (alarm) {
      alarm.enabled = !alarm.enabled; // Toggle the enabled state
      this.alarmService.setalarms(this.alarms); // Update the alarms in the service
      this.cdRef.detectChanges(); // Trigger change detection to update the view
      console.log(`Alarm ID ${alarmId} is now ${alarm.enabled ? 'ON' : 'OFF'}`);
    }
  }

  onToggleChange(alarm: Alarm, event: any): void {
    const isChecked = event.detail.checked; // Get the toggle state
    this.isAlarmEnabled[alarm.id] = isChecked; // Update the toggle state
    alarm.enabled = isChecked; // Update the alarm model
    this.alarmService.setalarms(this.alarms); // Save the updated alarms
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

  get activeAlarms(): Alarm[] {
    return this.alarms.filter(a => a.group === 'Active');
  }

  get otherAlarms(): Alarm[] {
    return this.alarms.filter(a => a.group === 'Others');
  }

  startEditing(alarm: Alarm) {
    this.currentlyEditingId = alarm.id;
    this.newLabel = alarm.label;
  }

  startEditingTime(alarm: Alarm): void {
    this.currentlyEditingTimeId = alarm.id;
    this.newTime = this.convertToISOTime(alarm.time); // Initialize newTime with the current alarm time
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
      const formattedTime = this.formatTime(this.newTime); 
      if (alarm.time !== formattedTime) {
        alarm.time = formattedTime; // Update the alarm's time only if it has changed
        console.log(`Time saved for Alarm ID ${alarm.id}: ${alarm.time}`);
        this.alarmService.ScheduleAlarmForDays(alarm); // Schedule the alarm
        this.alarmService.setalarms(this.alarms); // Update alarms in the service
      }
      // Ensure the alarm is turned ON
      this.isAlarmEnabled[alarm.id] = true; // Set the boolean to true
      alarm.enabled = true; // Update the alarm model
      this.alarmService.setalarms(this.alarms); // Save the updated alarms
      console.log(`Alarm ID ${alarm.id} is now ON`);
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

  cancelTimeEditing(alarm: Alarm): void {
    this.currentlyEditingTimeId = ''; // Exit editing mode without saving
    this.isAlarmEnabled[alarm.id] = false; // Set the toggle state to false
    alarm.enabled = false; // Update the alarm model
    this.alarmService.setalarms(this.alarms); // Save the updated alarms
    console.log(`Alarm ID ${alarm.id} has been turned OFF.`);
    this.cdRef.detectChanges(); // Trigger change detection to update the view
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
    this.alarms.forEach(alarm => {
      console.log(`Alarm ID: ${alarm.id}`);
      console.log(`Label: ${alarm.label}`);
      console.log(`Time: ${alarm.time}`);
      console.log(`Days: ${alarm.days}`);
    });
  }
}

