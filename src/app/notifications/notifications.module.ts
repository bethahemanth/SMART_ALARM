import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NotificationsComponent } from './notifications.component';

@NgModule({
  declarations: [NotificationsComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [NotificationsComponent]
})
export class NotificationsModule { }
