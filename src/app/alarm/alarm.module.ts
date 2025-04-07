// alarm.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular'; 
import { AlarmComponent } from './alarm.component';
import { FormsModule } from '@angular/forms';
import { SoundpickerComponent } from '../soundpicker/soundpicker.component';
@NgModule({
  declarations: [AlarmComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    SoundpickerComponent
  ],
  exports: [AlarmComponent] 
})
export class AlarmModule {}
