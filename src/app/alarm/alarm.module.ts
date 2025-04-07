// alarm.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular'; 
import { AlarmComponent } from './alarm.component';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [AlarmComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports: [AlarmComponent] 
})
export class AlarmModule {}
