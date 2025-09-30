import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AlmacenComponent } from './almacen.component';
import { MainComponent } from './main/main.component';
import { ReportesComponent } from './reportes/reportes.component';
import { RecepcionComponent } from './recepcion/recepcion.component';
import { IndexComponent } from './index/index.component';
import { InventarioComponent } from './inventario/inventario.component';
import { AsignacionNewComponent } from './asignacion-new/asignacion-new.component';
import { RepuestosComponent } from './repuestos/repuestos.component';
import { MovimientoMaterialComponent } from './movimiento-material/movimiento-material.component';

const routes: Routes =[
  {
    path:'',
    component:AlmacenComponent,
    children:[
      {
        path:'',
        component:IndexComponent
      },
      {
        path:'reportes',
        component:ReportesComponent
      },
      {
        path:'recepcion',
        component:RecepcionComponent
      },
      {
        path:'almacen',
        component:MainComponent
      },
      {
        path:'inventario',
        component:InventarioComponent
      },
      {
        path:'asignacion',
        component:AsignacionNewComponent
      },
      {
        path:'repuestos',
        component:RepuestosComponent
      },
      {
        path:'movimiento-material',
        component:MovimientoMaterialComponent
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

export class AlmacenRoutingModule { }
