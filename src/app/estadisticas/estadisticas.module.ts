import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { EstadisticasRoutingModule } from './estadisticas-routing.module';
import { EstadisticasComponent } from './estadisticas.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { GestionesComponent } from './gestiones/gestiones.component';
import { ConsumoComponent } from './consumo/consumo.component';
import { AdicionalesComponent } from './adicionales/adicionales.component';
import { DespachosComponent } from './despachos/despachos.component';





@NgModule({
  declarations: [MainComponent,EstadisticasComponent, GestionesComponent, ConsumoComponent, AdicionalesComponent, DespachosComponent],
  imports: [
    SharedModule,
    CommonModule,
    EstadisticasRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class EstadisticasModule { }
