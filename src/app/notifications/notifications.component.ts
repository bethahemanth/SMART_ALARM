import { AlarmService } from './../services/alarm.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  standalone:false
})
export class NotificationsComponent  implements OnInit {
    alarms: any[] = [];
    enabledAlarms: any[] = [];
    
    constructor(private alarmService:AlarmService) { }
  
    ngOnInit() {
        this.alarms = this.alarmService.getAlarms(); // Fetch alarms from the service
        this.enabledAlarms = this.alarms.filter(alarm => alarm.enabled === true);
    }
  
  }
    
