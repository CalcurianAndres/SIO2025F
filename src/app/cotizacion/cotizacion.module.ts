import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotizacionComponent } from './cotizacion.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CotizacionRoutingModule } from './cotizacion-routing.module';
import { GestionComponent } from './gestion/gestion.component';
import { PreFacturacionComponent } from './pre-facturacion/pre-facturacion.component';
import { MainComponent } from './main/main.component';
import { TokenValidationComponent } from '../token-validation/token-validation.component';
import { EtiquetaComponent } from './etiqueta/etiqueta.component';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { ConsultaFacturacionComponent } from './consulta-facturacion/consulta-facturacion.component';
import { CotizacionCarrouselComponent } from './gestion/cotizacion/cotizacion.component';



@NgModule({
  declarations: [CotizacionComponent, GestionComponent, EtiquetaComponent, PreFacturacionComponent, MainComponent, TokenValidationComponent, ConsultaFacturacionComponent, CotizacionCarrouselComponent],
  imports: [
    SharedModule,
    CommonModule,
    CotizacionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgxQRCodeModule,
  ]
})
export class CotizacionModule { }
