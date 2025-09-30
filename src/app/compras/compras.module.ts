import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComprasRoutingModule } from './compras-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MainComponent } from './main/main.component';
import { FabricantesComponent } from './fabricantes/fabricantes.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [MainComponent, FabricantesComponent, ProveedoresComponent],
  imports: [
    CommonModule,
    ComprasRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class ComprasModule { }
