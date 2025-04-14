import {  NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsComponent } from './settings.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports:[SettingsComponent] 
})
export class SettingsModule { }
