import { Injectable } from '@angular/core';

export interface Alarm {
  id: number;        
  time: string;      
  repeat: string;     
  label: string;      
  sound: string;      
  snooze: string;    
  active:boolean;

}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  alarms: Alarm[] = [
    { id: 1, time: '2025-04-03T16:46:28', repeat: 'Never', label: 'Alarm', sound: 'Radial', snooze: '10' ,active:true},
    { id: 2, time: '2025-04-03T06:46:28', repeat: 'Daily', label: 'Morning', sound: 'Default', snooze: '5',active:false }
  ];

  constructor() { }

  public getAlarms(): Alarm[] {
    return this.alarms;
  }

  public getAlarmById(id: number): Alarm|undefined {
    return this.alarms.find(x=>x.id ==id);
  }

 public AddAlarm(alarm:Alarm){
  this.alarms.push(alarm);
  this.alarms.map((x,i)=>x.id=i+1);
 } 
 public DeleteAlarm(id:number){
  const i=this.alarms.findIndex(x=>x.id==id);
  if(i!==-1)
  {
  this.alarms.splice(i,1);
  console.log(this.alarms);
  }
 }

}
