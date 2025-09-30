import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdenesComponent } from './ordenes.component';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { OrdenComponent } from '../orden/orden.component';
import { GestionComponent } from './gestion/gestion.component';
import { EtiquetaComponent } from '../cotizacion/etiqueta/etiqueta.component';
import { EstadisticasGestionComponent } from './gestion/estadisticas-gestion/estadisticas-gestion.component';


const routes: Routes =[
  {
    path:'',
    component:OrdenesComponent,
    children:[
      {
        path:'',
        component:MainComponent
      },
      {
        path:'gestion',
        component:GestionComponent
      },
      {
        path:'etiqueta',
        component:EtiquetaComponent
      },
      {
        path:'estadisticas-gestion',
        component:EstadisticasGestionComponent
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
export class OrdenesRoutingModule { }
