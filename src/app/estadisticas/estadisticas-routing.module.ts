import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EstadisticasComponent } from './estadisticas.component';
import { MainComponent } from './main/main.component';

const routes: Routes =[
  {
    path:'',
    component:EstadisticasComponent,
    children:[
      {
        path:'',
        component:MainComponent
      }]
}]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})

export class EstadisticasRoutingModule { }
