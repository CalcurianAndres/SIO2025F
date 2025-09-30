import { Component, OnInit } from '@angular/core';
import { RestApiService } from '../services/rest-api.service';

import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Canvas, Cell, Img, Line, PdfMakeWrapper, Rect, Table, Txt } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as moment from 'moment';

// const consultaDolar = require('consulta-dolar-venezuela');

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

  constructor(private api:RestApiService,
    private route:ActivatedRoute) {
      this.usuario = api.usuario
   }

  public usuario
  public proveedores;
  public proveedor_selected = '#';
  public Fabricantes;
  public Fabricantes_;
  public fabricante_selected;
  public Materia_prima;
  public Materia_prima_filtered = [];
  public Materia_prima_selected;

  public detalles:boolean = false;

  public N_factura =''
  public N_OC = ''
  public Transportista = ''
  public Lote = ''
  public F_fabricacion
  public codigo = ''

  public cantidades:boolean = false

  public Condicion:boolean = false

  public NuevaRecepcion:boolean = false;

  public Detallar = false
  public Detallar_ = false
  public Detallados = [] 
  public index_ 
  public index__ 

  public confirmado = false;
  public condicionado = false;

  public recepcion;

  GuardarCambios(){
    let productos = this.Pedido[this.index_].productos
    for(let i=0;i<productos.length;i++){
      if(this.Pedido[this.index_].productos[i].nombre === this.Detallados[0].nombre && this.Pedido[this.index_].productos[i].marca === this.Detallados[0].marca)
        {
          this.Pedido[this.index_].productos.splice(i,1)
          i--;
        }

      if(i === productos.length -1){
        // // console.log(this.Detallados)
        let total = 0;
        for(let n=0;n<this.Detallados.length;n++){
          total = Number(total) + Number(this.Detallados[n].capacidad)
          total = Number(total.toFixed(2));

          // console.log(total)
          // console.log(this.Pedido[this.index_])
          this.Pedido[this.index_].totales[this.index__].total = total
          this.Pedido[this.index_].productos.push(this.Detallados[n])
        }
        Swal.fire({
          title:'Edición realizada con exito',
          icon:'success',
          toast:true,
          timer:1500,
          showConfirmButton:false,
          timerProgressBar:true,
          position:'top-end'
        })
        this.abrirDetalles()
        return
      }
    }

  }

  Notificar(id){

    // console.log(id)

    this.api.sendNotificacion(id)
      .subscribe((resp:any)=>{
        // console.log(resp)
        this.BuscarFacturas();
        Swal.fire({
          title:'Se ha enviado la notificación',
          text:'La notificación del material fue enviada para su revisión',
          icon:'success',
          timer:5000,
          timerProgressBar:true,
          position:'top-end',
          toast:true,
          showConfirmButton:false
        })
      })
  }

  abrirDetalles_(i,n, producto, marca){

    this.index_ = i;
    this.index__ = n;
    this.Detallados = [] 
    let productos = this.Pedido[i].productos
    let filtro = productos.filter(x=>x.nombre === producto && x.marca === marca)
    this.Detallados.push(filtro)
    this.Detallados = this.Detallados[0]
    this.abrirDetalles();
   }

   public abrirDetalles(){
    if(!this.Detallar){
      this.Detallar = true
    }else{
      this.Detallar = false
    }
   }

  
  observacion(id, pedido){
    Swal.fire({
      title: '¿Imprimir formato de recepción de material?',
      text: "Todo el material esta previamente revisado y verificado",
      icon:'question',
      showCancelButton: true,
      confirmButtonColor: '#48c78e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Imprimir',
      cancelButtonText:'Enviar revisión'
    }).then((result) => {
      if (result.isConfirmed) {

        // console.log(pedido)

        this.GenerarPDF(pedido);
      }else{
        Swal.fire({
          title:'Observación',
          input:'textarea',
          inputAttributes: {
            autocapitalize: 'off'
          },
          confirmButtonColor: '#48c78e',
          cancelButtonColor: '#d33',
          showCancelButton: true,
          confirmButtonText: 'Enviar',
          showLoaderOnConfirm: true,
          cancelButtonText:'Cancelar',
          preConfirm: (info) => {
            return fetch(`//192.168.0.23:8080/api/recepcion-porconfirmar/${info}/${id}`)
              .then(response => {
                if (!response.ok) {
                  throw new Error(response.statusText)
                }
                return response.json()
              })
              .catch(error => {
                Swal.showValidationMessage(
                  `Error interno: ${error}`
                )
              })
          },
          allowOutsideClick: () => !Swal.isLoading()          
        }).then((result) => {
          if (result.isConfirmed) {
            // console.log(result)
            Swal.fire({
              title:'Enviado',
              text: `${result.value}`,
              icon:'success',
              showConfirmButton:false,
              toast:true,
              timer:5000,
              timerProgressBar:true,
              position:'top-end'
            })
            this.BuscarFacturas();
          }
        })
      }
    })
  }

  ver_condiciones_(x,y,grupo){
    if(grupo === 'Sustrato'){
      this.Condicion = true;
      this.grupo__ = grupo;
      setTimeout(() => {
        (<HTMLInputElement>document.getElementById('11')).checked = this.Pedido[x].condicion[y][0];;
        (<HTMLInputElement>document.getElementById('12')).checked = this.Pedido[x].condicion[y][1];;
        (<HTMLInputElement>document.getElementById('13')).checked = this.Pedido[x].condicion[y][2];;
        (<HTMLInputElement>document.getElementById('14')).checked = this.Pedido[x].condicion[y][3];;
        (<HTMLInputElement>document.getElementById('15')).checked = this.Pedido[x].condicion[y][4];;
        (<HTMLInputElement>document.getElementById('16')).checked = this.Pedido[x].condicion[y][5];;
        (<HTMLInputElement>document.getElementById('17')).checked = this.Pedido[x].condicion[y][6];;
        (<HTMLInputElement>document.getElementById('18')).checked = this.Pedido[x].condicion[y][7];;
        (<HTMLInputElement>document.getElementById('19')).checked = this.Pedido[x].condicion[y][8];;
        (<HTMLInputElement>document.getElementById('110')).checked = this.Pedido[x].condicion[y][9];;     
      },500)
    }else if(grupo === 'Cajas Corrugadas'){
      this.Condicion = true;
      this.grupo__ = grupo;
      setTimeout(() => {
        (<HTMLInputElement>document.getElementById('21')).checked = this.Pedido[x].condicion[y][0];;
        (<HTMLInputElement>document.getElementById('22')).checked = this.Pedido[x].condicion[y][1];;
        (<HTMLInputElement>document.getElementById('23')).checked = this.Pedido[x].condicion[y][2];;
        (<HTMLInputElement>document.getElementById('24')).checked = this.Pedido[x].condicion[y][3];;
        (<HTMLInputElement>document.getElementById('25')).checked = this.Pedido[x].condicion[y][4];;
      },500)
    }else{
      this.Condicion = true;
      this.grupo__ = grupo;
      setTimeout(() => {
        (<HTMLInputElement>document.getElementById('01')).checked = this.Pedido[x].condicion[y][0];;
        (<HTMLInputElement>document.getElementById('02')).checked = this.Pedido[x].condicion[y][1];;
        (<HTMLInputElement>document.getElementById('03')).checked = this.Pedido[x].condicion[y][2];;
        (<HTMLInputElement>document.getElementById('04')).checked = this.Pedido[x].condicion[y][3];;
        (<HTMLInputElement>document.getElementById('05')).checked = this.Pedido[x].condicion[y][4];;
      },500)
    }
  }

  public grupo;
   _abrirDetalles__(i,n, producto, marca,grupo){

    this.index_ = i;
    this.index__ = n;
    this.grupo = grupo;
    this.Detallados = [] 
    let productos = this.Pedido[i].productos
    let filtro = productos.filter(x=>x.nombre === producto && x.marca === marca)
    this.Detallados.push(filtro)
    this.Detallados = this.Detallados[0]
    this._abrirDetalles_();
   }

   public _abrirDetalles_(){
    if(!this.Detallar_){
      this.Detallar_ = true
    }else{
      this.Detallar_ = false
    }
   }

   Alert_(id){
    Swal.fire({
      title: '¿Cambiar estatus del material?',
      text: "¿Verifica que los documentos digitalizados coincidan con los cargados en el sistema?",
      icon:'question',
      showCancelButton: true,
      confirmButtonColor: '#48c78e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Correcto',
      cancelButtonText:'Enviar revisión'
    }).then((result) => {
      if (result.isConfirmed) {

        this.api.Cambiaraobservacion(id)
          .subscribe((resp:any)=>{
            Swal.fire({
              title:'Listo para análisis',
              text:'Se cambio estatus a «En observación»',
              toast:true,
              icon:'success',
              showConfirmButton:false,
              timerProgressBar:true,
              timer:5000,
              position:'top-end'
            })
            this.BuscarFacturas();
          })
      }else{
        Swal.fire({
          title:'Observación',
          input:'textarea',
          inputAttributes: {
            autocapitalize: 'off'
          },
          confirmButtonColor: '#48c78e',
          cancelButtonColor: '#d33',
          showCancelButton: true,
          confirmButtonText: 'Enviar',
          showLoaderOnConfirm: true,
          cancelButtonText:'Cancelar',
          preConfirm: (info) => {
            return fetch(`//192.168.0.23:8080/api/recepcion-porconfirmar/${info}/${id}`)
              .then(response => {
                if (!response.ok) {
                  throw new Error(response.statusText)
                }
                return response.json()
              })
              .catch(error => {
                Swal.showValidationMessage(
                  `Error interno: ${error}`
                )
              })
          },
          allowOutsideClick: () => !Swal.isLoading()          
        }).then((result) => {
          if (result.isConfirmed) {
            // console.log(result)
            Swal.fire({
              title:'Enviado',
              text: `${result.value}`,
              icon:'success',
              showConfirmButton:false,
              toast:true,
              timer:5000,
              timerProgressBar:true,
              position:'top-end'
            })
            this.BuscarFacturas();
          }
        })
      }
    })
   }

  ngOnInit(): void {
    this.buscarProveedores();
    this.buscarFabricantes();
    this.buscarMateriaPrima();
    this.BuscarFacturas();
  
  }

  BuscarFacturas(){
    this.api.getFacturacion()
      .subscribe((resp:any)=>{
        this.Pedido = resp
      })
  }

  buscarProveedores(){
    this.api.GetProveedores()
      .subscribe((resp:any)=>{
        this.proveedores = resp;
      })  
  }

  buscarFabricantes(){
    this.api.getFabricantes()
      .subscribe((resp:any)=>{
        this.Fabricantes = resp;
      })  
  }

  buscarMateriaPrima(){
    this.api.getMateriaPrima()
      .subscribe((resp:any)=>{
        this.Materia_prima = resp;
        // console.log(this.Materia_prima)
      })  
  }

  SeleccionarProveedor(e){
    if(e === '#'){
      this.Fabricantes = null;
      return
    }

    let fabricante = this.proveedores.filter(x=> x._id === e)
    // console.log(fabricante)
    this.proveedor_selected = e
    this.Fabricantes_ = fabricante[0].fabricantes
  }

  SeleccionarFabricantes(e){
    
    let fabricante = this.Fabricantes.filter(x=> x.nombre === e)
    this.fabricante_selected = fabricante[0]
  }

  public grupo__
  SeleccionarGrupo(e){
    this.grupo__ = e
    for(let i=0; i<this.Materia_prima.length;i++){
      for(let n=0; n<this.Materia_prima[i].proveedor.length;n++){
        // console.log(this.Materia_prima[i].proveedor[n],'-',this.fabricante_selected._id)
        if(this.Materia_prima[i].proveedor[n] === this.fabricante_selected._id)
        {
          if(this.Materia_prima[i].grupo.nombre === e){
            this.Materia_prima_filtered.push(this.Materia_prima[i])
            // console.log(this.grupo__)
          }
        }
      }
    }

    }

  cambiar_fabricacion_Detalles(e){
    for(let i=0;i<this.Detallados.length;i++){
      this.Detallados[i].fabricacion = e
    }
  }

  cambiar_lote_Detalles(e){
    for(let i=0;i<this.Detallados.length;i++){
      this.Detallados[i].lote = e
    }
  }

  cambiar_fabricacion(e){
    for(let i=0;i<this.envases.length;i++){
      this.envases[i].fabricacion = e
    }
  }

  cambiar_lote(e){
    for(let i=0;i<this.envases.length;i++){
      this.envases[i].lote = e
    }
  }

  Selected_Materia(e){
    if(e === '#'){
      this.cantidades = false
      return
    }
    this.cantidades = true
    this.Materia_prima_selected = this.Materia_prima_filtered.find(x=>x._id === e)
  }

  delete(i){
    this.envases.splice(i,1)
    this.cambiar_capacidad()
  }

  AgregarNuevo(capacidad, codigo){
    this.envases.push({
      material:this.Materia_prima_selected._id,
      nombre:this.Materia_prima_selected.nombre,
      marca:this.Materia_prima_selected.marca,
      fabricacion:this.F_fabricacion,
      capacidad:capacidad,
      lote:this.Lote,
      numero:codigo
    })

    this.cambiar_capacidad();
  }


  public cantidad
  public resto
  public envases = []
  public total_kilos
  calcularLatas(e){
    this.total_kilos = e;
    this.envases = []
    let cantidad = 0
    let contador = 0

    this.cantidad = 0;
    this.resto = 0;
    while(cantidad<e){
        let iteration = cantidad + this.Materia_prima_selected.neto
        // console.log(iteration)
        if(iteration<=e){
          cantidad = Number(iteration.toFixed(2));
          contador++
          this.cantidad = contador
        }else{
          let final = iteration - e;
          final = this.Materia_prima_selected.neto - final
          this.resto = Number(final.toFixed(2))
          cantidad = iteration;
        }
    }


    if(this.resto > 0){
      this.envases.push({
        material:this.Materia_prima_selected._id,
        nombre:this.Materia_prima_selected.nombre,
        marca:this.Materia_prima_selected.marca,
        fabricacion:this.F_fabricacion,
        capacidad:this.resto,
        lote:this.Lote,
        numero:1
      })
      for(let i=0;i<contador;i++){
        this.envases.push({
          material:this.Materia_prima_selected._id,
          nombre:this.Materia_prima_selected.nombre,
          marca:this.Materia_prima_selected.marca,
          capacidad:this.Materia_prima_selected.neto,
          fabricacion:this.F_fabricacion,
          lote:this.Lote,
          numero:i+2
        })
        // console.log(this.envases)
      }
    }
  }


  Borrar_detallado(i){
    this.Detallados.splice(i,1)
  }

  verDetalles_(){
    if(!this.detalles){
      this.detalles = true;
    }else{
      this.detalles = false;
    }
  }

  verDetalles(){
    if(!this.detalles){
      this.detalles = true;
    }else{
      if(!this.confirmado){
        this.confirmado = true;
      }
      this.detalles = false;
    }
  }

  verCondiciones(){
    if(!this.Condicion){
      this.Condicion = true;
    }else{
      if(!this.condicionado){
        this.condicionado = true;
      }
      this.Condicion = false;
    }
  }

  public condicion___
  guardarCondiciones(){
    let condicion
    switch(this.grupo__){
      case 'Sustrato':
        condicion = [
          (<HTMLInputElement>document.getElementById('11')).checked, 
          (<HTMLInputElement>document.getElementById('12')).checked, 
          (<HTMLInputElement>document.getElementById('13')).checked, 
          (<HTMLInputElement>document.getElementById('14')).checked, 
          (<HTMLInputElement>document.getElementById('15')).checked, 
          (<HTMLInputElement>document.getElementById('16')).checked, 
          (<HTMLInputElement>document.getElementById('17')).checked, 
          (<HTMLInputElement>document.getElementById('18')).checked, 
          (<HTMLInputElement>document.getElementById('19')).checked, 
          (<HTMLInputElement>document.getElementById('110')).checked, 
        ]
        break;
      case 'Cajas Corrugadas':
        condicion = [
          (<HTMLInputElement>document.getElementById('21')).checked, 
          (<HTMLInputElement>document.getElementById('22')).checked, 
          (<HTMLInputElement>document.getElementById('23')).checked, 
          (<HTMLInputElement>document.getElementById('24')).checked, 
          (<HTMLInputElement>document.getElementById('25')).checked, 
        ]
        break;
      default:
        condicion = [
          (<HTMLInputElement>document.getElementById('01')).checked, 
          (<HTMLInputElement>document.getElementById('02')).checked, 
          (<HTMLInputElement>document.getElementById('03')).checked, 
          (<HTMLInputElement>document.getElementById('04')).checked, 
          (<HTMLInputElement>document.getElementById('05')).checked, 
        ]
        break;
    }

    this.condicion___ = condicion
    this.verCondiciones()

  }

  verCondiciones_(){
    if(!this.Condicion){
      this.Condicion = true;
    }else{
      this.Condicion = false;
    }
  }

  public Factura;
  public Pedido = [];

  Guardar(){

    (<HTMLInputElement>document.getElementById('disabled_1')).disabled = true;
    (<HTMLInputElement>document.getElementById('disabled_2')).disabled = true;
    (<HTMLInputElement>document.getElementById('disabled_3')).disabled = true;
    (<HTMLInputElement>document.getElementById('disabled_4')).disabled = true;
    (<HTMLInputElement>document.getElementById('disabled_5')).disabled = true;
    (<HTMLInputElement>document.getElementById('grupo')).value = '#';
    this.cantidad = null;
    this.resto = null;
    this.F_fabricacion = null;
    this.codigo = null;
    this.Materia_prima_filtered = [];
    this.cantidades = null
    this.fabricante_selected = null

    this.confirmado = false;
    this.condicionado = false;

    
    
    if(!this.Factura){
      this.Factura = {
        factura:this.N_factura,
        orden:this.N_OC,
        transportista:this.Transportista,
        productos:this.envases,
        recepcion:this.recepcion,
        totales:[{lote:`${this.Lote}`,producto:`${this.Materia_prima_selected.nombre}`, marca:`${this.Materia_prima_selected.marca}`,total:this.total_kilos,grupo:this.Materia_prima_selected.grupo.nombre}],
        condicion:[this.condicion___],
        proveedor:this.proveedor_selected
      }
    }else{
      for(let i=0;i<this.envases.length;i++){
        this.Factura.productos.push(this.envases[i])
      }
      this.Factura.totales.push({lote:`${this.Lote}`,producto:`${this.Materia_prima_selected.nombre}`, marca:`${this.Materia_prima_selected.marca}`,total:this.total_kilos,grupo:this.Materia_prima_selected.grupo.nombre})
      this.Factura.condicion.push(this.condicion___)
    }
    
    this.Lote = null
    this.Materia_prima_selected = null;
    // console.log(this.Factura)

  }


  cambiar_capacidad(){
    this.total_kilos = 0;
    for(let i=0;i<this.envases.length;i++){
      this.total_kilos = Number(this.total_kilos) + Number(this.envases[i].capacidad)
      this.total_kilos = Number(this.total_kilos.toFixed(2))
    }
  }

  ver_condiciones(i,grupo){

    if(grupo === 'Sustrato'){
      this.Condicion = true;
      this.grupo__ = grupo;
      setTimeout(() => {
        (<HTMLInputElement>document.getElementById('11')).checked = this.Factura.condicion[i][0];;
        (<HTMLInputElement>document.getElementById('12')).checked = this.Factura.condicion[i][1];;
        (<HTMLInputElement>document.getElementById('13')).checked = this.Factura.condicion[i][2];;
        (<HTMLInputElement>document.getElementById('14')).checked = this.Factura.condicion[i][3];;
        (<HTMLInputElement>document.getElementById('15')).checked = this.Factura.condicion[i][4];;
        (<HTMLInputElement>document.getElementById('16')).checked = this.Factura.condicion[i][5];;
        (<HTMLInputElement>document.getElementById('17')).checked = this.Factura.condicion[i][6];;
        (<HTMLInputElement>document.getElementById('18')).checked = this.Factura.condicion[i][7];;
        (<HTMLInputElement>document.getElementById('19')).checked = this.Factura.condicion[i][8];;
        (<HTMLInputElement>document.getElementById('110')).checked = this.Factura.condicion[i][9];;     
      },500)
    }else if(grupo === 'Cajas Corrugadas'){
      this.Condicion = true;
      this.grupo__ = grupo;
      setTimeout(() => {
        (<HTMLInputElement>document.getElementById('21')).checked = this.Factura.condicion[i][0];;
        (<HTMLInputElement>document.getElementById('22')).checked = this.Factura.condicion[i][1];;
        (<HTMLInputElement>document.getElementById('23')).checked = this.Factura.condicion[i][2];;
        (<HTMLInputElement>document.getElementById('24')).checked = this.Factura.condicion[i][3];;
        (<HTMLInputElement>document.getElementById('25')).checked = this.Factura.condicion[i][4];;
      },500)
    }else{
      this.Condicion = true;
      this.grupo__ = grupo;
      setTimeout(() => {
        (<HTMLInputElement>document.getElementById('01')).checked = this.Factura.condicion[i][0];;
        (<HTMLInputElement>document.getElementById('02')).checked = this.Factura.condicion[i][1];;
        (<HTMLInputElement>document.getElementById('03')).checked = this.Factura.condicion[i][2];;
        (<HTMLInputElement>document.getElementById('04')).checked = this.Factura.condicion[i][3];;
        (<HTMLInputElement>document.getElementById('05')).checked = this.Factura.condicion[i][4];;
      },500)
    }
  }

  GenerarPDF(pedido){

    let iterator;
    this.api.SubirIteratorFacturacion()
      .subscribe((resp:any)=>{
        iterator = resp;
        generarPDF_()
      })

    let data = pedido

    let data_ = []

    let recepcion = moment(data.recepcion).format('DD/MM/YYYY')
    let hoy = moment().format('DD/MM/YYYY')
    // console.log(this.usuario)
    let usuario = `${this.usuario.Nombre} ${this.usuario.Apellido}`

    for(let i=0;i<data.productos.length;i++){

      let info = data_.findIndex(x=>x.lote === data.productos[i].lote)

      if(info < 0){
        data_.push({lote:data.productos[i].lote,fabricacion:data.productos[i].fabricacion,cantidad:0,presentacion:data.productos[i].material.presentacion,neto:data.productos[i].material.neto,unidad:data.productos[i].material.unidad})
      }else{
        // // console.log(data_)
        data_[info].cantidad = data_[info].cantidad + 1;
        // console.log(data_)
      }
    }


    let certificado = [];

    for(let i=0;i<data.totales.length;i++){
      if(data.totales[i].grupo === 'Sustrato'){
        for(let x=0;x<data.condicion[i].length;x++){

          if(x==0){
            if(data.condicion[i][x]){
              certificado[i] = `(x) Certificado de calidad, `
            }else{
              certificado[i] = `( ) Certificado de calidad, `
            }
          }

          if(x==1){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Identificación de lote, ` 
            }else{
              certificado[i] = certificado[i] + `( ) Identificación de lote, `
            }
          }

          if(x==2){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Paletas en buen estado, `
            }else{
              certificado[i] = certificado[i] + `( ) Paletas en buen estado, `
            }
          }

          if(x==3){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Paletas sin presentación de humedad, `
            }else{
              certificado[i] = certificado[i] + `( ) Paletas sin presentación de humedad, `
            }
          }

          if(x==4){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Paleta libres de insectos, \n`
            }else{
              certificado[i] = certificado[i] + `( ) Paleta libres de insectos, \n`
            }
          }

          if(x==5){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Embalaje limpio (Libre de excremento de animales, otros), `
            }else{
              certificado[i] = certificado[i] + `( ) Embalaje limpio (Libre de excremento de animales, otros), `
            }
          }


          if(x==6){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Embalaje sin rotura, `
            }else{
              certificado[i] = certificado[i] + `( ) Embalaje sin rotura, `
            }
          }

          if(x==7){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x)Embalaje seco externamente, `
            }else{
              certificado[i] = certificado[i] + `( )Embalaje seco externamente, `
            }
          }

          if(x==8){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Embalaje seco internamente, `
            }else{
              certificado[i] = certificado[i] + `( ) Embalaje seco internamente, `
            }
          }

          if(x==9){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Evidencia de fumigacion o tratamiento térmico (sello)`
            }else{
              certificado[i] = certificado[i] + `( ) Evidencia de fumigacion o tratamiento térmico (sello)`
            }
          }
          //
        }
      }else if(data.totales[i].grupo === 'Cajas corrugadas'){
        for(let x=0;x<data.condicion[i].length;x++){
          if(x==0){
            if(data.condicion[i][x]){
              certificado[i] = `(x) Certificado de calidad, `
            }else{
              certificado[i] = `( ) Certificado de calidad, `
            }
          }

          if(x==1){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Identificación de lote, `
            }else{
              certificado[i] = certificado[i] + `( ) Identificación de lote, `
            }
          }

          if(x==2){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Bultos sin presencia de humedad, `
            }else{
              certificado[i] = certificado[i] + `( ) Bultos sin presencia de humedad, `
            }
          }

          if(x==3){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Bultos sin presencia de insectos, `
            }else{
              certificado[i] = certificado[i] + `( ) Bultos sin presencia de insectos, `
            }
          }

          if(x==4){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Bultos sin evidencia visible de excremento de animales, `
            }else{
              certificado[i] = certificado[i] + `( ) Bultos sin evidencia visible de excremento de animales, `
            }
          }

        }
      }else{
        for(let x=0;x<data.condicion[i].length;x++){
          if(x==0){
            if(data.condicion[i][x]){
              certificado[i] = `(x) Certificado de calidad, `
            }else{
              certificado[i] = `( ) Certificado de calidad, `
            }
          }

          if(x==1){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Identificación de lote, `
            }else{
              certificado[i] = certificado[i] + `( ) Identificación de lote, `
            }
          }

          if(x==2){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Cajas en buen estado, `
            }else{
              certificado[i] = certificado[i] + `( ) Cajas en buen estado, `
            }
          }

          if(x==3){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Cajas limpias, `
            }else{
              certificado[i] = certificado[i] + `( ) Cajas limpias, `
            }
          }

          if(x==4){
            if(data.condicion[i][x]){
              certificado[i] = certificado[i] + `(x) Envases cerrados herméticamente, `
            }else{
              certificado[i] = certificado[i] + `( ) Envases cerrados herméticamente, `
            }
          }

        }
      }
    }

    const pdf = new PdfMakeWrapper();
    PdfMakeWrapper.setFonts(pdfFonts);
    pdf.pageOrientation('landscape');
    pdf.pageSize('A4');

    async function generarPDF_(){
      // console.log('test')

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(60).margin([0, 5,0,0]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`
            VERIFICACIÓN DE LAS CONDICIONES \n DEL MATERIAL RECIBIDO
            `).bold().end).alignment('center').fontSize(9).rowSpan(4).end,
            new Cell(new Txt('Código: FAL-002').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de Revisión: 03/08/2023').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).end
      )


      pdf.add(
        pdf.ln(1)
      )
      pdf.add(
        new Table([
          [
            new Cell(new Txt('DATOS DE RECEPCIÓN DE MATERIAL').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(8).end,
            new Cell(new Txt('').end).alignment('center').border([false]).color('#FFFFFF').fontSize(8).end,
            new Cell(new Txt('N° DE VERIFICACIÓN').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(8).end
          ]
        ]).widths(['80%','0.2%','19.8%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).end
          ]
        ]).layout('noBorders').widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Nombre del proveedor').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Nombre del transportista').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Fecha de recepción').end).fontSize(8).alignment('center').fillColor('#dddddd').end,
            new Cell(new Txt('N° Factura/ Nota de entrega').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('N° Orden de compra').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('').end).border([false]).fontSize(8).end,
            new Cell(new Txt(`AL-MR-${iterator}`).bold().end).margin([0,5,0,0]).alignment('center').rowSpan(2).end,
          ],
          [
            new Cell(new Txt(data.proveedor.nombre).end).alignment('center').fontSize(8).end,
            new Cell(new Txt(data.transportista).end).alignment('center').fontSize(8).end,
            new Cell(new Txt(recepcion).end).alignment('center').fontSize(8).end,
            new Cell(new Txt(data.factura).end).alignment('center').fontSize(8).end,
            new Cell(new Txt(data.orden).end).alignment('center').fontSize(8).end,
            new Cell(new Txt('').end).border([false]).fontSize(8).end,
            new Cell(new Txt('').end).border([false]).fontSize(8).end,
          ]
        ]).widths(['15%','20%','15%','15%','14%','0.2%','21%']).end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('DATOS DEL MATERIAL').end).alignment('center').color('#FFFFFF').fillColor('#9c9c9c').fontSize(8).end
          ]
        ]).widths(['100%']).layout('noBorders').end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).end
          ]
        ]).layout('noBorders').widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Descripción').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Grupo').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('N° de lote').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Fecha de fabricación').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Código').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Presentación').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Capacidad').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Total de unidades').end).alignment('center').fillColor('#dddddd').fontSize(8).end,
            new Cell(new Txt('Total').end).alignment('center').fillColor('#dddddd').fontSize(8).end
          ]
        ]).widths(['17.5%','8%','10%','12.5%','10%','12.5%','10%','12.5%','7%']).end
      )
      
      for(let i=0;i<data.totales.length;i++){
        
        let fabricacion = moment(data_[i].fabricacion).format('DD/MM/YYYY')

        pdf.add(
          new Table([
            [
              new Cell(new Txt(`${data.totales[i].producto} (${data.totales[i].marca})`).end).alignment('center').fontSize(8).border([true,false,true,true]).end,
              new Cell(new Txt(data.totales[i].grupo).end).alignment('center').fontSize(8).border([true,false,true,true]).end,
              new Cell(new Txt(data_[i].lote).end).alignment('center').fontSize(8).border([true,false,true,true]).end,
              new Cell(new Txt(fabricacion).end).alignment('center').fontSize(8).border([true,false,true,true]).end,
              new Cell(new Txt('N/A').end).alignment('center').fontSize(8).border([true,false,true,true]).end,
              new Cell(new Txt(data_[i].presentacion).end).alignment('center').fontSize(8).border([true,false,true,true]).end,
              new Cell(new Txt(data_[i].neto).end).alignment('center').fontSize(8).border([true,false,true,true]).end,
              new Cell(new Txt(data_[i].cantidad).end).alignment('center').fontSize(8).border([true,false,true,true]).end,
              new Cell(new Txt(data.totales[i].total).end).alignment('center').fontSize(8).border([true,false,true,true]).end,
            ],
            [
              new Cell(new Txt(`${certificado[i]}`).end).fillColor('#eeeeee').colSpan(9).fontSize(7).end,
              new Cell(new Txt('').end).fontSize(8).end,
              new Cell(new Txt('').end).fontSize(8).end,
              new Cell(new Txt('').end).fontSize(8).end,
              new Cell(new Txt('').end).fontSize(8).end,
              new Cell(new Txt('').end).fontSize(8).end,
              new Cell(new Txt('').end).fontSize(8).end,
              new Cell(new Txt('').end).fontSize(8).end,
              new Cell(new Txt('').end).fontSize(8).end
            ]
          ]).widths(['17.5%','8%','10%','12.5%','10%','12.5%','10%','12.5%','7%']).end
        )
          
          
      }

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).end
          ]
        ]).layout('noBorders').widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Observación').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(9).end,
                ],
                [
                  new Cell(new Txt(`\n\n\n`).end).fontSize(8).end,

                ]
              ]).widths(['100%']).end
            ).fontSize(8).end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Realizado por:').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(9).end,
                ],
                [
                  new Cell(new Txt(`Firma:\n\nFecha:`).end).fontSize(8).end,

                ]
              ]).widths(['100%']).end
            ).fontSize(8).end,
            new Cell(new Table([
              [
                new Cell(new Txt('Validado por:').end).alignment('center').color('#FFFFFF').fillColor('#000000').fontSize(9).end,
              ],
              [
                new Cell(new Txt(`Firma:${usuario}\n\nFecha:${hoy}`).end).fontSize(8).end,

              ]
            ]).widths(['100%']).end).fontSize(8).end
          ]
        ]).widths(['50%','25%','25%']).layout('noBorders').end
      )

      pdf.create().download(`test`)
    }

  }

  finalizar_(){
    (<HTMLInputElement>document.getElementById('disabled_1')).disabled = false;
    (<HTMLInputElement>document.getElementById('disabled_2')).disabled = false;
    (<HTMLInputElement>document.getElementById('disabled_3')).disabled = false;
    (<HTMLInputElement>document.getElementById('disabled_4')).disabled = false;
    this.N_factura = ''
    this.N_OC = ''
    this.Transportista = '';
    (<HTMLInputElement>document.getElementById('disabled_4')).value = '#'
    this.Pedido[this.N_pedido].productos =  this.Factura.productos;
    this.Pedido[this.N_pedido].totales = this.Factura.totales
    this.Pedido[this.N_pedido].condicion = this.Factura.condicion
    this.NuevaRecepcion = false
    this.api.putFacturacion(this.Id, this.Pedido[this.N_pedido])
      .subscribe((resp:any)=>{
        this.Factura = null;
        this.Fabricantes_ = null
        this.Edicion = false;
        // console.log(this.Pedido)
        this.BuscarFacturas();
      })
  }

  finalizar(){
    (<HTMLInputElement>document.getElementById('disabled_1')).disabled = false;
    (<HTMLInputElement>document.getElementById('disabled_2')).disabled = false;
    (<HTMLInputElement>document.getElementById('disabled_3')).disabled = false;
    (<HTMLInputElement>document.getElementById('disabled_4')).disabled = false;
    this.N_factura = ''
    this.N_OC = ''
    this.Transportista = '';
    (<HTMLInputElement>document.getElementById('disabled_4')).value = '#'
    this.api.postFacturacion(this.Factura)
    .subscribe((resp:any)=>{
        this.NuevaRecepcion = false
        this.Factura = null;
        this.Fabricantes_ = null
        this.BuscarFacturas();
      })
  }

  NuevaRecepcion_(){
    if(!this.NuevaRecepcion){
      this.NuevaRecepcion = true
    }else{
      this.NuevaRecepcion = false
    }
  }


  public Edicion:boolean = false;
  public N_pedido;
  public Id;
  EditarPedido(i){
    this.NuevaRecepcion_()
    // console.log(this.Pedido[i])

    this.N_factura = this.Pedido[i].factura;
    this.N_OC = this.Pedido[i].orden;
    this.Transportista = this.Pedido[i].transportista;
    this.proveedor_selected = this.Pedido[i].proveedor;
    this.SeleccionarProveedor(this.Pedido[i].proveedor._id)
    this.Factura = {totales:[],productos:[],condicion:[]}
    this.Factura.productos = this.Pedido[i].productos
    this.Factura.condicion = this.Pedido[i].condicion
    for(let n=0; n<this.Pedido[i].totales.length;n++){

      this.Factura.totales.push(this.Pedido[i].totales[n])
    }
    this.N_pedido = i;
    this.Id = this.Pedido[i]._id
    this.Edicion = true;
  }



  
}

