import { AlarmService } from './../services/alarm.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Alarm } from '../Models/alarm.model';

@Component({
  selector: 'app-alarmaction',
  templateUrl: './alarmaction.component.html',
  styleUrls: ['./alarmaction.component.scss'],
  imports:[IonicModule,CommonModule]
})
export class AlarmactionComponent  {
 alarm!: Alarm|undefined; 
  alarmTime: string = '12:30 PM';
  alarmAudio = new Audio(); // Add your tone in assets
  audiopath = 'assets/sounds/alarm_id.mp3'; // Add your tone in assets
  alarmId: string = ''; // This will be set from the route parameter
  constructor(private navCtrl: NavController, private platform: Platform,private alarmService:AlarmService,private route:ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.alarmId = params['alarmId']; // Get the alarmId from the route
       if(this.alarmId) this.alarm=this.alarmService.getAlarmById(Number(this.alarmId));
       this.alarmAudio.src = this.audiopath.replace('_id',this.alarm?.sound || "1"); // Set the audio source
       this.alarmTime = this.alarm?.time || '12:30 PM'; // Set the alarm time
       this.playAlarm();
     });
    }

  playAlarm() {
    this.alarmAudio.loop = true;
    this.alarmAudio.play().catch(err => console.log('Error playing alarm:', err));
  }

  stopAlarm() {
    this.alarmAudio.pause();
    this.alarmAudio.currentTime = 0;
    this.navCtrl.navigateBack(''); // adjust path as needed
  }

  snooze() {
    if(this.alarm){
      this.alarmService.ScheduleAlarmForDays(this.alarm,true);
    }
    this.alarmAudio.pause();
    this.alarmAudio.currentTime = 0;
    this.navCtrl.navigateBack(''); // adjust path as needed
  }

  endAlarm() {
    this.stopAlarm(); // behaves the same as stop here
  }

}
