import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ComprasComponent } from './compras.component';
import { MainComponent } from './main/main.component';
import { FabricantesComponent } from './fabricantes/fabricantes.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';

const routes: Routes =[
{
  path:'',
  component:ComprasComponent,
  children: [
    {
      path:'',
      component:MainComponent
    },
    {
      path:'fabricantes',
      component:FabricantesComponent
    },
    {
      path:'proveedores',
      component:ProveedoresComponent
    }
  ]
}
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ComprasRoutingModule { }
