import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { IndexComponent } from './index.component';

const routes: Routes =[
  {
    path:'',
    component:IndexComponent,
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
export class IndexRoutingModule { }
