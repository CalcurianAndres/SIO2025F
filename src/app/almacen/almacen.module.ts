import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { AlmacenRoutingModule } from './almacen-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ConfirmacionComponent } from './main/confirmacion/confirmacion.component';
import { AsignacionComponent } from './main/asignacion/asignacion.component';
import { ReportesComponent } from './reportes/reportes.component';
import { RecepcionComponent } from './recepcion/recepcion.component';
import { IndexComponent } from './index/index.component';
import { RouterModule } from '@angular/router';
import { InventarioComponent } from './inventario/inventario.component';
import { AsignacionNewComponent } from './asignacion-new/asignacion-new.component';
import { RepuestosComponent } from './repuestos/repuestos.component';
import { CategoriasComponent } from './repuestos/categorias/categorias.component';
import { RegistroRepuestoComponent } from './repuestos/registro-repuesto/registro-repuesto.component';
import { RepuestoAlmacenadoComponent } from './repuestos/repuesto-almacenado/repuesto-almacenado.component';
import { MovimientoMaterialComponent } from './movimiento-material/movimiento-material.component';
import { RetornoComponent } from './retorno/retorno.component';




@NgModule({
  declarations: [MainComponent, ConfirmacionComponent, AsignacionComponent, ReportesComponent, RecepcionComponent, IndexComponent, InventarioComponent, AsignacionNewComponent, RepuestosComponent, CategoriasComponent, RegistroRepuestoComponent, RepuestoAlmacenadoComponent, MovimientoMaterialComponent, RetornoComponent],
  imports: [
    CommonModule,
    AlmacenRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AlmacenModule { }
