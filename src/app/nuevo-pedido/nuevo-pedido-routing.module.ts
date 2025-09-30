import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NuevoPedidoComponent } from './nuevo-pedido.component';
import { MainComponent } from './main/main.component';
import { OrdenCompraComponent } from './orden-compra/orden-compra.component';
import { ConsultaOrdenComponent } from './consulta-orden/consulta-orden.component';
import { IndexComponent } from './index/index.component';


const routes: Routes =[
  {
    path:'',
    component:NuevoPedidoComponent,
    children:[
      {
        path:'',
        component:IndexComponent
      },
      {
        path:'orden-produccion',
        component:MainComponent
      },
      {
        path:'orden-compra',
        component:OrdenCompraComponent
      },
      {
        path:'ver-oc',
        component:ConsultaOrdenComponent
      }]
}]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class NuevoPedidoRoutingModule { }
