
import { Component } from '@angular/core';
import { Settings } from '../Models/alarm.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: false
})
export class SettingsComponent {
  settings: Settings = {
    timeFormat24Hr: false,
    snoozeDuration: 5,
    ringtone: 'Morning Breeze',
    vibration: false,
    alarmVolume: 50,
    darkTheme: false,
    language: 'English'
  };

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
      'Morning Breeze': 'assets/sounds/alarm1.mp3',
      'Gentle Chimes': 'assets/sounds/alarm2.mp3',
      'Forest Dawn': 'assets/sounds/alarm3.mp3'
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