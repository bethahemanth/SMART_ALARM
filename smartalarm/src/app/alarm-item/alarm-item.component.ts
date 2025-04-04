import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Alarm, DataService } from '../services/data.service';

@Component({
  selector: 'app-alarm-item',
  templateUrl: './alarm-item.component.html',
  styleUrls: ['./alarm-item.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone:false
})
export class AlarmItemComponent  implements OnInit {

  alarm: Alarm = { id: 0, time: '', repeat: 'Never', label: '', sound: 'Default', snooze: '',active:true };
  isedit = false;
  audio: HTMLAudioElement | null = null;
  constructor(public route: ActivatedRoute, public router: Router,public dataservice:DataService) {}

  ngOnInit() {
    const alarmId = this.route.snapshot.paramMap.get('id');
    if (alarmId) {
      const alarm = this.dataservice.getAlarmById(Number(alarmId));
      if(alarm) this.alarm = alarm;
      this.isedit = true;
    }
 
  }

  saveAlarm() {
    if(!this.isedit)this.dataservice.AddAlarm(this.alarm); 
    this.router.navigate(['home/alarms']);
  }

  deleteAlarm() {
    alert('Alarm Deleted');
    this.dataservice.DeleteAlarm(this.alarm.id);
    console.log(this.alarm.id);
    this.router.navigate(['home/alarms']);
  }

  playSound(event: any) {
    const selectedSound = event.detail.value; 
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    let soundFile = '';
    if (selectedSound == 'Default') {
      soundFile = '../assets/sounds/default.mp3';
    } else if (selectedSound == 'Radial') {
      soundFile = '../assets/sounds/radial.mp3';
    }
    //n

    if (soundFile) {
      this.audio = new Audio(soundFile);
      this.audio.play();
      setTimeout(() => {
        this.audio?.pause();
      }, 3000);
    }
  }

}
