import { Component, inject, ViewEncapsulation } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';
import { MessageComponent } from '../message/message.component';

import { Alarm, DataService } from '../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false,
})
export class HomePage {
  alarms: Alarm[] = [];

  constructor(public router: Router,public dataservice:DataService) {
    this.alarms = dataservice.getAlarms();
  }

  editAlarm(alarm: Alarm) {
    this.router.navigate(['home/editalarm', alarm.id]);
  }
}


