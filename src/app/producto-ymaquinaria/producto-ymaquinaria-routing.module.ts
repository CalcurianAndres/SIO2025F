import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ProductoYMaquinariaComponent } from './producto-ymaquinaria.component';
import { MainComponent } from './main/main.component';
import { MaquinariaComponent } from './maquinaria/maquinaria.component';
import { ProductosComponent } from './productos/productos.component';

const routes: Routes =[
  {
    path:'',
    component:ProductoYMaquinariaComponent,
    children:[
      {
        path:'',
        component:MainComponent
      },
      {
        path:'maquinaria',
        component:MaquinariaComponent
      },
      {
        path:'productos',
        component:ProductosComponent
      }
    ]
}]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ProductoYMaquinariaRoutingModule { }
