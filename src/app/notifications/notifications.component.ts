import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent  implements OnInit {
data:any;
  constructor() { }

  ngOnInit() {
    localStorage.getItem('alarms')
    this.data =  localStorage.getItem('alarms');
    
  }

}
