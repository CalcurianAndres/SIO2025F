import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { RestApiService } from 'src/app/services/rest-api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { iif } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  public NUEVA_ORDEN:boolean = false;

  public cs:boolean = false;
  public ps:boolean = false;
  public os:boolean = false;

  public Cantidad_ejemplares = 1000;
  public Ejemplares_montados = 1;
  public demasia = 0;
  public paginas = Math.ceil(this.Cantidad_ejemplares / this.Ejemplares_montados)
  public Fases:boolean = false;
  public SinMaterial:boolean = false;

  i_montajes = 0;

  oc_ = '';
  fo_ = '';
  ae_ = 0;
  observacion_ = '';

  x; 
  y;

  public cajas = 0;



  public TOTALES = [
    {
      material:null,
      marca:null,
      total:null,
      grupo:null,
      presentacion:null,
      neto:null,
      unidad:null,
      ancho:null,
      largo:null
    }
  ];

  public CLIENTES;
  public PRODUCTOS = [];
  public PRODUCTO = {
    montajes:null,
    ejemplares:null,
    materiales: [],
    _id:null,
    grupo:null,
    sustrato:[{
      nombre:'',
      marca:''
    }],
    dimensiones:null
  };
  public montajes
  public MAQUINAS
  public ALMACEN
  public CANTIDAD = [];
  public _CANTIDAD = [];

  public CLIENTE
  public OC

  public Fecha_S

  public restantes = [];
  public almacenes = [];
  public hoy;
  public usuario;

  constructor(public api:RestApiService,
              private router: Router) { this.usuario = api.usuario }

  ngOnInit(): void {
    this.obtenerClientes();
    this.BuscarAlmacen();
    this.Almacenado();
    this.OrdenesdeCompra();
    this.hoy = moment().format('yyyy-MM-DD');
  }

  public OrdenesDeCompra = []
  OrdenesdeCompra(){
    this.api.getOrdenesDeCompra()
      .subscribe((resp:any)=>{
        this.OrdenesDeCompra = resp
        // console.log(this.OrdenesDeCompra)
      })
  }

  NumToLet(n){
    switch(n)
    {
        case 0: return "A";
        case 1: return "B";
        case 2: return "C";
        case 3: return "D";
        case 4: return "E";
        case 5: return "F";
        case 6: return "G";
        case 7: return "H";
        case 8: return "I";
    }

  }

  alertaRoja(aja){
    let cantidad = this.PRODUCTO.materiales.length
    if(cantidad > this.restantes.length){
      this.restantes.push(aja)
    }else{
      this.restantes = [];
      this.restantes.push(aja)
    }

    // // // console.log(this.restantes)
  }

  modal_nueva_orden(){
    if(!this.NUEVA_ORDEN){
      this.NUEVA_ORDEN = true
    }else{
      this.NUEVA_ORDEN = false
    }
  }

  obtenerClientes(){
    this.api.GetClientes()
      .subscribe((resp:any)=>{
        this.CLIENTES = resp.clientes
      })
  }

  public OrdenSelected
  OrdenDeCompraSeleccionada(e){
    this.cs = true;
    this.OrdenSelected = this.ordenesFiltered[e];
    (<HTMLInputElement>document.getElementById('cliente')).value = this.ordenesFiltered[e].cliente._id;
    this.cliente_selected(this.ordenesFiltered[e].cliente._id)
  }

  public ordenesFiltered
  cliente_selected(e){

    this.ordenesFiltered = this.OrdenesDeCompra.filter(x=>x.cliente._id === e)
    this.ps = false
    this.oc_ = ''
    this.fo_ = ''
    if(e === '0'){
      this.cs = false 
    }else{
      this.CLIENTE = e
      let index = this.CLIENTES.find(x => x._id === e)
      this.ALMACEN = index.almacenes;
    }

    this.api.getById(e)
      .subscribe((resp:any)=>{
        this.PRODUCTOS = resp.productos;
        // // // console.log(this.PRODUCTOS)
      })
  }

  Almacenado(){
    this.api.getAlmacenado()
      .subscribe((resp:any)=>{
        this._CANTIDAD = resp;
        this.totalizar_materiales();
      })
  }

  cambios(){

    this.Ejemplares_montados = this.PRODUCTO.ejemplares[this.i_montajes]
    // this.paginas = Math.ceil(this.Cantidad_ejemplares / this.Ejemplares_montados)
    this.Ejemplares(this.Ejemplares_montados)
    // this.Cantidad(this.Cantidad_ejemplares)

  }

  public Cantidad_de_orden
  public Fecha_solicitada
  public ProductodeProductos
  producto_selected(e){

    let splitted = e.target.value.split('*')

    let indexOF = this.OrdenSelected.productos.findIndex(x=> x.producto._id == splitted[0] && x.fecha == splitted[1])
    this.ProductodeProductos = indexOF
    this.Cantidad_de_orden = this.OrdenSelected.productos[indexOF].cantidad
    this.Fecha_solicitada = this.OrdenSelected.productos[indexOF].fecha
    this.Fecha_S = this.Fecha_solicitada;
    this.Cantidad_ejemplares = this.Cantidad_de_orden
    if(e.target.value === '0'){
      this.ps = false 
    }else{
      this.ps = true;
      this.oc_ = this.OrdenSelected.orden
      this.fo_ = this.OrdenSelected.fecha_recepcion
    }

    this.api.getOneById(splitted[0])
      .subscribe((resp:any)=>{
        this.PRODUCTO = resp.producto;
        // // // console.log(this.PRODUCTO,'PRODUCTO')
        this.montajes = this.PRODUCTO.montajes
        this.Ejemplares_montados = this.PRODUCTO.ejemplares[this.i_montajes];
        this.Ejemplares(this.Ejemplares_montados)
        this.MAQUINAS = resp.maquinas;
        //   this.modal_nueva_orden()
        let x = this.PRODUCTO.materiales.length;
        this.CANTIDAD = [];
        for(let i=0; i<x; i++){
          let respuesta = this._CANTIDAD.find(x => x.material.nombre == this.PRODUCTO[this.i_montajes].materiales[i].producto.nombre && x.material.marca == this.PRODUCTO.materiales[i].producto.marca && x.material.grupo.nombre)
          
          // // // console.log(this.PRODUCTO)
          if(!respuesta){
            this.SinMaterial = true;
            return
          }else{
            this.SinMaterial = false;
          }
          
          this.CANTIDAD.push(respuesta)
        }
       })


  }

  orden_selected(e){
    if(e.target.value === null){
      this.os = false 
    }else{
      this.os = true;
      this.OC = e.target.value;
    }

    
  }

  BuscarAlmacen(){
    this.api.getAlmacen()
      .subscribe((resp:any) => {
        this.ALMACEN = resp.materiales;
        this.totalizar_materiales();
      })
  }

  Cantidad(e){
    this.Cantidad_ejemplares = e.target.value
    // // // console.log(e.target.value)
    this.paginas = Math.ceil(this.Cantidad_ejemplares / this.Ejemplares_montados)
    let demasia = (<HTMLInputElement>document.getElementById('demasia_input')).value;
    this.Demasia(demasia)
    // this.paginas = this.paginas + this.demasia
    // this.paginas = this.paginas
  }

  Ejemplares(e){
    // alert(e)
    this.Ejemplares_montados = e
    this.paginas = Math.ceil(this.Cantidad_ejemplares / this.Ejemplares_montados) 
    this.paginas = this.paginas + this.demasia
    this.Demasia(this.demasia_)
    // // // console.log(this.Cantidad_ejemplares, '/', this.Ejemplares_montados, '/ ', this.demasia ,'-', this.paginas)
    // this.paginas = (this.paginas)
  }
  public demasia_ = 0;
  Demasia(e){

    this.paginas = Math.ceil(this.Cantidad_ejemplares / this.Ejemplares_montados)
    this.demasia = Math.ceil(e * this.paginas / 100)
    this.demasia_ = e
    this.paginas = this.paginas + this.demasia

    // // // console.log(this.Cantidad_ejemplares, '/', this.Ejemplares_montados, '/ ', this.demasia ,'-', this.paginas)
    // this.paginas = (this.paginas)

  }

  buscar_tintas(tinta, marca,sinMarca?,ancho?,largo?,calibre?){
    let almacenado = [];
    if(sinMarca){
      almacenado = this._CANTIDAD.filter(x => x.material.nombre === tinta && x.cantidad > 0)
    }else{
      almacenado = this._CANTIDAD.filter(x => x.material.nombre === tinta && x.material.marca === marca && x.cantidad > 0)
    }
    if(ancho){
      almacenado = this._CANTIDAD.filter(x => x.material.nombre === tinta && x.material.marca === marca && x.material.ancho === ancho && x.material.largo === largo && x.material.calibre === calibre && x.cantidad > 0)
    }
    if(almacenado.length < 1){
      return 'No hay producto en inventario'
    }else{
      let cantidades = 0;
      let neto = 0
      for(let i = 0; i<almacenado.length; i++)
      {

          // cantidades = cantidades +  Number(almacenado[i].cantidad)
          

          cantidades =  cantidades + (Number(almacenado[i].material.neto) * Number(almacenado[i].cantidad))
      }
        return cantidades.toFixed(2)
      }
  }

  restantes_(tinta, marca,i,caja?){
    let almacenado = [];
    if(caja === 'caja' || caja === 'barniz'){
      almacenado = this._CANTIDAD.filter(x => x.material.nombre === tinta && x.cantidad > 0)
    }else{
      almacenado = this._CANTIDAD.filter(x => x.material.nombre === tinta && x.material.marca === marca && x.cantidad > 0)
    }
    if(almacenado.length < 1){
      return 0
    }else{
      
      let cantidades = 0;
      for(let i = 0; i<almacenado.length; i++)
        {

          cantidades =  cantidades + (Number(almacenado[i].material.neto) * Number(almacenado[i].cantidad))
        }

        //  * this.paginas
        let necesario
        if(caja === 'caja'){
          necesario = this.Cantidad_ejemplares / this.PRODUCTO.materiales[this.i_montajes][i].cantidad;
          this.cajas = this.Cantidad_ejemplares / this.PRODUCTO.materiales[this.i_montajes][i].cantidad;
        }else{
          necesario = (this.PRODUCTO.materiales[this.i_montajes][i].cantidad * this.paginas)/1000;
        }
        let EnAlmacen = cantidades.toFixed(2);
        return (Number(EnAlmacen) - necesario).toFixed(2);
      }
  }

  totalizar_materiales(){
    for(let i=0; i<this._CANTIDAD.length; i++){
      let existe = this.TOTALES.find(x => x.material == this._CANTIDAD[i].material.nombre && x.marca == this._CANTIDAD[i].material.marca);
      if(existe){
          let x = this.TOTALES.findIndex(x => x.material == this._CANTIDAD[i].material.nombre && x.marca == this._CANTIDAD[i].material.marca)
          
          this.TOTALES[x].total = Number(this.TOTALES[x].total)
          this._CANTIDAD[i].cantidad = Number(this._CANTIDAD[i].cantidad)
          this._CANTIDAD[i].neto = Number(this._CANTIDAD[i].material.neto)

          let def = (this._CANTIDAD[i].neto * this._CANTIDAD[i].cantidad) / this.TOTALES[x].neto

          this.TOTALES[x].total = this.TOTALES[x].total + def;

        }else{
        this.TOTALES.push({
                       material:this._CANTIDAD[i].material.nombre,
                       marca:this._CANTIDAD[i].material.marca,
                       grupo:this._CANTIDAD[i].material.grupo.nombre,
                       presentacion:this._CANTIDAD[i].material.presentacion,
                       neto:this._CANTIDAD[i].material.neto,
                       unidad:this._CANTIDAD[i].material.unidad,
                      ancho:this._CANTIDAD[i].material.ancho,
                      largo:this._CANTIDAD[i].material.largo,
                      total:this._CANTIDAD[i].cantidad
                    })
      }
    }

  }

  Fecha_s(e){
    this.Fecha_S = e;
  }

  TimesTime(){

    let index = this.PRODUCTO.materiales[this.i_montajes].length
    
    for(let i=0; i<index; i++){
      if(this.PRODUCTO.materiales[this.i_montajes][i].producto.grupo.nombre != "Sustrato")
      {
        let resto;
        if(this.PRODUCTO.materiales[this.i_montajes][i].producto.grupo.nombre === "Cajas Corrugadas"){
          resto = this.restantes_(this.PRODUCTO.materiales[this.i_montajes][i].producto.nombre, this.PRODUCTO.materiales[this.i_montajes][i].producto.marca,i,'caja')
        }else if(this.PRODUCTO.materiales[this.i_montajes][i].producto.grupo.nombre === "Barniz"){
          resto = this.restantes_(this.PRODUCTO.materiales[this.i_montajes][i].producto.nombre, this.PRODUCTO.materiales[this.i_montajes][i].producto.marca,i,'barniz')
        }else if(this.PRODUCTO.materiales[this.i_montajes][i].producto.grupo.nombre === "Soportes de Embalaje"){
          resto = this.cajas * this.PRODUCTO.materiales[this.i_montajes][i].cantidad
        }else{
          resto = this.restantes_(this.PRODUCTO.materiales[this.i_montajes][i].producto.nombre, this.PRODUCTO.materiales[this.i_montajes][i].producto.marca,i)
        }
        resto = Number(resto)
        if(resto < 0){
          // console.log(this.PRODUCTO.materiales[this.i_montajes][i].producto.nombre, '<>', resto)
            Swal.fire({
              icon:'error',
              title:'Oops!',
              text:'No posees los materiales necesarios para realizar este producto 1',
              showConfirmButton:false,
              // timer:2500
            })
            return
        }
      }else{
        let SUSTRATO_EN_ALMACEN = this.buscar_tintas(this.PRODUCTO.materiales[this.i_montajes][i].producto.nombre,this.PRODUCTO.materiales[this.i_montajes][i].producto.marca,'NA',this.PRODUCTO.materiales[this.i_montajes][i].producto.ancho,this.PRODUCTO.materiales[this.i_montajes][i].producto.largo,this.PRODUCTO.materiales[this.i_montajes][i].producto.calibre)
        let resta = Number(SUSTRATO_EN_ALMACEN) - this.paginas;
        if(resta <0){
          Swal.fire({
            icon:'error',
            title:'Oops!',
            text:'No posees los materiales necesarios para realizar este producto',
            showConfirmButton:false,
            // timer:2500
          })
          return
        }
      }
    }

    // for(let i=0; i<this.restantes.length; i++){
    //   if(this.restantes[i] < 0){
    //     Swal.fire({
    //       icon:'error',
    //       title:'Oops!',
    //       text:'No posees los materiales necesarios para realizar este producto',
    //       showConfirmButton:false,
    //       // timer:2500
    //     })
    //     return
    //   }
    // }

    this.Fases = true;
    this.modal_nueva_orden()
  }

  colocarFecha(e,fase,i){

    // CPH = CANTIDAD POR HOJAS

    this.api.getFechas(e.target.value)
      .subscribe((resp:any)=>{
        let cph = 0
        let HorasAgregadas = 0
        let fecha;

        if(resp.trabajo.length > 0){
          cph = resp.trabajo[0].maquina.cph

            // HpC = this.paginas / diasAgregados;
            // let hoymas3 = moment(resp.trabajo[0].fecha).add(HpC, 'hours').format('yyyy-MM-DD');

            let hoy = moment().format('yyyy-MM-DD');

            let fecha_ = resp.trabajo[0].fecha;

            let after = moment(fecha_).isAfter(hoy, 'day');

            // // // console.log(fecha_,'/',hoy,'/',after)

            if(!after){
              fecha = hoy;
            }else{
              fecha = fecha_;
            }



        }else{
          let hoy = moment().format('yyyy-MM-DD');
          fecha = hoy;
        }

        (<HTMLInputElement>document.getElementById(fase)).value = fecha


        if(cph > 0){
          HorasAgregadas = this.paginas / cph;
        }else{
          let MaquinaSelected2 = this.MAQUINAS.find(x => x._id == e.target.value)

          cph = MaquinaSelected2.cph;

          HorasAgregadas = this.paginas / cph;
        }

        let dias = HorasAgregadas / 7;

          let hoymas3 = moment(fecha).add(dias, 'days').format('yyyy-MM-DD');

          (<HTMLInputElement>document.getElementById(`${fase}-C`)).value = hoymas3;

      })
  }

  reprogramar(e, fase){

          let maquina = (<HTMLInputElement>document.getElementById(`${fase}-maquina`)).value
          let MaquinaSelected2 = this.MAQUINAS.find(x => x._id == maquina)

          let cph = MaquinaSelected2.cph;

          let HorasAgregadas = this.paginas / cph;

          let dias = HorasAgregadas / 7;

          let hoymas3 = moment(e.target.value).add(dias, 'days').format('yyyy-MM-DD');

          (<HTMLInputElement>document.getElementById(`${fase}-C`)).value = hoymas3;
  }

  // test(){
  //   // // console.log()
  // }

  
  finalizar(cantidad){

    let data = {
      usuario:`${this.usuario.Nombre} ${this.usuario.Apellido}`,
      fecha_o:this.fo_,
      montaje:this.i_montajes,
      cliente:this.CLIENTE,
      producto:this.PRODUCTO._id,
      orden_compra:this.oc_,
      cantidad:cantidad.value,
      paginas:this.paginas,
      demasia:this.demasia_,
      fecha_s:this.Fecha_S,
      almacen:this.ae_,
      e_c:(<HTMLInputElement>document.getElementById(`e_c`)).checked,
      i_ancho:(<HTMLInputElement>document.getElementById(`ancho_imprimir`)).value,
      i_largo:(<HTMLInputElement>document.getElementById(`largo_imprimir`)).value,
      observacion:this.observacion_,
      ordencompra:this.OrdenSelected,
      ProductodeProductos:this.ProductodeProductos
    }

    this.api.postOrden(data)
      .subscribe((resp:any)=>{
        let fases = this.PRODUCTO.grupo.tipos.length
        for(let x=0; x<fases; x++){
          
          let fase = this.PRODUCTO.grupo.tipos[x]
          // // // console.log(this.PRODUCTO.grupo.tipos[x])
          let maquina = (<HTMLInputElement>document.getElementById(`${fase}-maquina`)).value
          let fechaI = (<HTMLInputElement>document.getElementById(`${fase}`)).value
          let fecha = (<HTMLInputElement>document.getElementById(`${fase}-C`)).value

          let Data = {
            maquina,
            fechaI, 
            fecha,
            orden:resp,
            pos:x
          }

          this.api.postOrden2(Data)
            .subscribe((respuesta:any)=>{
              // // // console.log(respuesta)
            })

        }
        this.router.navigate([`/orden-produccion/${resp}`]);
      })
  }

}
