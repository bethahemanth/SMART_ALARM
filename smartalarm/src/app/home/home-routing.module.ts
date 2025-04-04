import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { AlarmItemComponent } from '../alarm-item/alarm-item.component';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  { path: 'alarms', component: HomePage },
  {path:'addalarm',component:AlarmItemComponent},
  { path: 'editalarm/:id', component: AlarmItemComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
