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
import { AlmacenMewComponent } from './almacen-mew/almacen-mew.component';
import { NuevoMaterialComponent } from './almacen-mew/nuevo-material/nuevo-material.component';
import { NuevoInventarioNewComponent } from './almacen-mew/nuevo-inventario-new/nuevo-inventario-new.component';
import { DevolucionesNewComponent } from './almacen-mew/devoluciones-new/devoluciones-new.component';
import { TraspasosNewComponent } from './almacen-mew/traspasos-new/traspasos-new.component';
import { AprovacionTrasladosNewComponent } from './almacen-mew/aprovacion-traslados-new/aprovacion-traslados-new.component';
import { RetornoMaterialNewComponent } from './almacen-mew/retorno-material-new/retorno-material-new.component';
import { RetornoMaterialPorAprobarNewComponent } from './almacen-mew/retorno-material-por-aprobar-new/retorno-material-por-aprobar-new.component';
import { ConsultaEstadisticasComponent } from './almacen-mew/consulta-estadisticas/consulta-estadisticas.component';
import { ConsultaEstadisticasPorPeriodoComponent } from './almacen-mew/consulta-estadisticas-por-periodo/consulta-estadisticas-por-periodo.component';
import { CortesInventarioComponent } from './almacen-mew/cortes-inventario/cortes-inventario.component';




@NgModule({
  declarations: [MainComponent, ConfirmacionComponent, AsignacionComponent, ReportesComponent, RecepcionComponent, IndexComponent, InventarioComponent, AsignacionNewComponent, RepuestosComponent, CategoriasComponent, RegistroRepuestoComponent, RepuestoAlmacenadoComponent, MovimientoMaterialComponent, RetornoComponent, AlmacenMewComponent, NuevoMaterialComponent, NuevoInventarioNewComponent, DevolucionesNewComponent, TraspasosNewComponent, AprovacionTrasladosNewComponent, RetornoMaterialNewComponent, RetornoMaterialPorAprobarNewComponent, ConsultaEstadisticasComponent, ConsultaEstadisticasPorPeriodoComponent, CortesInventarioComponent],
  imports: [
    CommonModule,
    AlmacenRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AlmacenModule { }
