import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AlarmComponent } from './alarm/alarm.component';
import { SoundpickerComponent } from './soundpicker/soundpicker.component';

const routes: Routes = [
  {
      path: '',
      component: AlarmComponent
  },
  {
    path:'soundpicker',
    component: SoundpickerComponent
  }
  ];@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
