import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { NuevoPedidoRoutingModule } from './nuevo-pedido-routing.module';
import { FormsModule } from '@angular/forms';
import { OrdenCompraComponent } from './orden-compra/orden-compra.component';
import { ConsultaOrdenComponent } from './consulta-orden/consulta-orden.component';
import { IndexComponent } from './index/index.component';
import { RouterModule } from '@angular/router';
import { VistaDespachosComponent } from './consulta-orden/vista-despachos/vista-despachos.component';




@NgModule({
  declarations: [MainComponent, OrdenCompraComponent, ConsultaOrdenComponent, IndexComponent, VistaDespachosComponent],
  imports: [
    CommonModule,
    NuevoPedidoRoutingModule,
    FormsModule,
    RouterModule
  ],
  exports: [MainComponent]
})
export class NuevoPedidoModule { }
