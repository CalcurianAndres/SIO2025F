import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { IndexComponent } from './index/index.component';
import { MainComponent } from './index/main/main.component';
import { SharedModule } from './shared/shared.module';
import { IndexModule } from './index/index.module';
import { AppRoutingModule } from './app-routing.module';
import { NuevoPedidoComponent } from './nuevo-pedido/nuevo-pedido.component';
import { NuevoPedidoModule } from './nuevo-pedido/nuevo-pedido.module';
import { RouterModule } from '@angular/router';
import { ProductoYMaquinariaComponent } from './producto-ymaquinaria/producto-ymaquinaria.component';
import { ProductoYMaquinariaModule } from './producto-ymaquinaria/producto-ymaquinaria.module';
import { AlmacenComponent } from './almacen/almacen.component';
import { AlmacenModule } from './almacen/almacen.module';
import { OrdenComponent } from './orden/orden.component';
import { OrdenesModule } from './ordenes/ordenes.module';
import { OrdenesComponent } from './ordenes/ordenes.component';
import { PlanificacionComponent } from './planificacion/planificacion.component';
import { LoginComponent } from './login/login.component';
import { EstadisticasModule } from './estadisticas/estadisticas.module';

import localeES from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { UnicosPipe } from './pipe/unicos.pipe';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { CotizacionModule } from './cotizacion/cotizacion.module';
import { TokenValidationComponent } from './token-validation/token-validation.component';
registerLocaleData(localeES, 'es')

import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { LaboratorioComponent } from './laboratorio/laboratorio.component';
import { LaboratorioModule } from './laboratorio/laboratorio.module';
import { DesarrolloComponent } from './desarrollo/desarrollo.component';
import { ComprasComponent } from './compras/compras.component';
import { NumberFormatDirective } from './directives/number-format.directive';



@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    MainComponent,
    NuevoPedidoComponent,
    ProductoYMaquinariaComponent,
    AlmacenComponent,
    OrdenComponent,
    OrdenesComponent,
    PlanificacionComponent,
    LoginComponent,
    UnicosPipe,
    BarChartComponent,
    DesarrolloComponent,
    ComprasComponent,
    NumberFormatDirective
  ],
  imports: [
    BrowserModule,
    RouterModule,
    SharedModule,
    AppRoutingModule,
    EstadisticasModule,
    LaboratorioModule,
    IndexModule,
    NuevoPedidoModule,
    ProductoYMaquinariaModule,
    AlmacenModule,
    OrdenesModule,
    CotizacionModule,
    ReactiveFormsModule,
    FormsModule,
    NgxQRCodeModule
  ],
  exports:[NumberFormatDirective],
  providers: [{provide: LOCALE_ID, useValue: 'es'}],
  bootstrap: [AppComponent]
})
export class AppModule { }
