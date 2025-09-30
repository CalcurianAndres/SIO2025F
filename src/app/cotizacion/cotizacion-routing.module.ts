import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CotizacionComponent } from './cotizacion.component';
import { MainComponent } from './main/main.component';
import { GestionComponent } from './gestion/gestion.component';
import { PreFacturacionComponent } from './pre-facturacion/pre-facturacion.component';
import { TokenValidationComponent } from '../token-validation/token-validation.component';
import { TwoStep } from '../Auth/twoStep.guard';
import { EtiquetaComponent } from './etiqueta/etiqueta.component';
import { ConsultaFacturacionComponent } from './consulta-facturacion/consulta-facturacion.component';
import { CotizacionCarrouselComponent } from './gestion/cotizacion/cotizacion.component';

const routes: Routes =[
  {
    path:'',
    component:CotizacionComponent,
    children:[
      {
        path:'',
        canActivate: [TwoStep],
        component:MainComponent
      },
      {
        path:'gestion',
        canActivate: [TwoStep],
        component:GestionComponent
      },
      {
        path:'pre-facturacion',
        canActivate: [TwoStep],
        component:PreFacturacionComponent
      },
      {
        path:'cotizacion',
        canActivate: [TwoStep],
        component:CotizacionCarrouselComponent
      },
      {
        path:'etiqueta',
        component:EtiquetaComponent
      },
      {
        path:'verificacion',
        component:TokenValidationComponent
      },
      {
        path:'consulta-facturacion',
        canActivate: [TwoStep],
        component:ConsultaFacturacionComponent
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
export class CotizacionRoutingModule { }
