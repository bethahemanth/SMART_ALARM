
import { Component, OnDestroy } from '@angular/core';
import { Settings } from '../Models/alarm.model';
import { AlarmService } from '../services/alarm.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: false
})
export class SettingsComponent implements OnDestroy {
  settings!: Settings;
  constructor(private alarmservice: AlarmService) {
    this.settings = this.alarmservice.getSettings();
  }
  ngOnDestroy(): void {
    this.alarmservice.saveSettings(this.settings); // Save settings on component destruction
    console.log('Settings saved to localStorage:', this.settings);
  }
  private audio = new Audio();
  // Method to log changes
  logSettingsChange() {
    console.log('Settings updated:', this.settings);
    if (this.settings.ringtone) {
      this.playRingtone(this.settings.ringtone);
    }
  }
   // Method to play the selected ringtone
   playRingtone(ringtone: string) {
    const ringtoneMap: { [key: string]: string } = {
      '1': 'assets/sounds/alarm1.mp3',
      '2': 'assets/sounds/alarm2.mp3',
      '3': 'assets/sounds/alarm3.mp3',
      '4': 'assets/sounds/alarm4.mp3' ,
      '5': 'assets/sounds/alarm5.mp3' ,
      '6': 'assets/sounds/alarm6.mp3' ,
    };

    const ringtonePath = ringtoneMap[ringtone];
    if (ringtonePath) {
      this.audio.src = ringtonePath;
      this.audio.load();
      this.audio.play();
    }
  }

  resetAllChanges() {
    this.settings = {
      timeFormat24Hr: false,
      snoozeDuration: 5,
      ringtone: 'Morning Breeze',
      vibration: false,
      alarmVolume: 50,
      darkTheme: false,
      language: 'English'
    };
    this.logSettingsChange(); // Log after resetting
  }
}