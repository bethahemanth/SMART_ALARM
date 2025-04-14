import { NotificationsComponent } from './notifications/notifications.component';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AlarmComponent } from './alarm/alarm.component';
import { SoundpickerComponent } from './soundpicker/soundpicker.component';
import { SettingsComponent } from './settings/settings.component'; // Import the SettingsComponent
 // Import the NotificationComponent
const routes: Routes = [
  {
      path: '',
      component: AlarmComponent
  },
  {
    path:'soundpicker',
    component: SoundpickerComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path:'notification',
    component:NotificationsComponent
 }
  ];@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
