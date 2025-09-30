import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { RestApiService } from 'src/app/services/rest-api.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})
export class GestionComponent implements OnInit {
  
  public TRABAJOS = [];
  public MAQUINAS;
  public NUEVA_GESTION:boolean = false;
  public FASE = 'IMPRESION';
  public GESTIONES;
  public LAST_ONE;
  public HOY = moment().format('yyyy-MM-DD');
  public FASES = [];
  public FUNCIONES = [];

  public GRUPOS = [];
  public orden = [];
  public usuario
  public jo:boolean = false;
  public despacho:boolean = false;

  public Despachos = [];

  public edit = -1;


  devolucion:boolean = false;
  solicitud:boolean = false;

  constructor(private api:RestApiService) { 
      this.usuario = api.usuario;
    }

  ngOnInit(): void {
    this.Tarea();
    this.getMaquinas();
    this.getGestiones();
    this.getOrdenes();
    this.getDespachos();
    this.api.getGrupos()
      .subscribe((resp:any)=>{

        this.GRUPOS = resp.grupos
        // // console.log(this.GRUPOS,'___________________________________________*')
      })
  }

  verificacion(cadena){
    let factura = cadena.substr(0,1)
    if(factura == "F"){
      return true
    }else{
      return false
    }
  }

  public Almacenes_edicion = []
  public almacen__ = false;
  BuscarAlmacen(producto){
    // console.log(producto)
    this.api.BuscarAlmacenes(producto)
      .subscribe((resp:any)=>{
        // // console.log(resp)
        this.Almacenes_edicion.push(resp)
        this.almacen__ = true;
        return resp;
      })
  }

  cambiarAlmacenes(e,x,y){

    this.Despachos[x].despacho[y].destino = e;
    this.api.PutDespachos(this.Despachos[x]._id, this.Despachos[x])
    .subscribe((resp:any)=>{
      // // console.log('done')
    })
  }

  documento(e,x,y){
    
    let factura = (<HTMLInputElement>document.getElementById(`${x}_${y}`)).checked
    if(factura){
      this.Despachos[x].despacho[y].documento = `F - ${e}`
    }else{
      this.Despachos[x].despacho[y].documento = `N - ${e}`
    }

    this.api.PutDespachos(this.Despachos[x]._id, this.Despachos[x])
    .subscribe((resp:any)=>{
      // // console.log('done')
    })

  }

  despachar(x,y,op){

    Swal.fire({
      title: 'Cuidado',
      text: `¿Quieres realizar el despacho sólo de la orden ${op} sin tomar en cuenta las otras?`,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText:'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, despachar'
    }).then((result) => {
      if (result.isConfirmed) {
        if(this.Despachos[x].despacho[y].documento == "" || this.Despachos[x].despacho[y].certificado == ""){
          Swal.fire({
            icon: 'error',
            title: 'Debes llenar todos los campos',
            text: 'Es necesario que el despacho cuente con un número de certificado y un documento para poder proceder.',
            showConfirmButton:false
          })
          return
        }
        let hoy = moment().format('DD-MM-yyyy');
        this.Despachos[x].despacho[y].parcial = hoy;
        this.api.PutDespachos(this.Despachos[x]._id, this.Despachos[x])
          .subscribe((resp:any)=>{
      // // console.log('done')
      let iterator = 0;
      for(let i=0;i<this.Despachos[x].despacho.length;i++){
        // // console.log(i,'iterator', this.Despachos[x].despacho.length)
        // console.log(this.Despachos[x].despacho[i].parcial)
        if(!this.Despachos[x].despacho[i].parcial){
          iterator++

        }

        if(i == this.Despachos[x].despacho.length -1){
          if(iterator < 1){
            this.Despachos[x].fecha = hoy
            this.Despachos[x].estado = 'despachado'
            this.api.PutDespachos(this.Despachos[x]._id, this.Despachos[x])
              .subscribe((resp:any)=>{
                 this.getDespachos();
            })
          }
        }
      }
        })
        Swal.fire(
          {
            title:'Despachado',
            text:`Se realizó el despacho de la orden ${op}`,
            icon:'success',
            showConfirmButton:false
          }
        )
      }
    })
  }

  certificado(e,x,y){
    this.Despachos[x].despacho[y].certificado = e;

    this.api.PutDespachos(this.Despachos[x]._id, this.Despachos[x])
    .subscribe((resp:any)=>{
      // // console.log('done')
    })

  }

  editado(e,x,y){
    this.Almacenes_edicion = []
    this.Despachos[x].despacho[y].cantidad = Number(e);

    this.api.PutDespachos(this.Despachos[x]._id, this.Despachos[x])
    .subscribe((resp:any)=>{
      // // console.log('done')
    })
    // // console.log(this.Despachos[x])
  }

  nuevo_despacho(){
    this.despacho = true;
  }

  editar_cant(x){
    this.edit = x
    // console.log(this.Despachos[x])
    for(let i=0;i<this.Despachos[x].despacho.length;i++){
      let almacenes = this.BuscarAlmacen(this.Despachos[x].despacho[i].producto)
    }
  }

  listo(){
    this.almacen__ = false;
    this.Almacenes_edicion = []
    this.edit = -1;
  }

  Despachado_(id,x){
    for(let i=0;i<this.Despachos[x].despacho.length;i++){
      if(this.Despachos[x].despacho[i].certificado == "" || this.Despachos[x].despacho[i].documento == ""){
        Swal.fire({
          icon: 'error',
          title: 'Debes llenar todos los campos',
          text: 'Es necesario que todos los despachos cuenten con un número de certificado y un documento para poder proceder.',
          showConfirmButton:false
        })
        return
      }
    }
    this.api.PutDespacho(id,this.Despachos[x])
      .subscribe((resp:any)=>{
        // // console.log(resp)
        if(resp.orden){
          Swal.fire({
            title:'Limite excedido',
            text:`el despacho de la orden ${resp.orden} supera el 110% de la cantidad solicitada`,
            icon:'error',
            showConfirmButton:false
          })
        }else{
        Swal.fire({
          title:'Despacho realizado',
          text:'Se realizó despacho de productos',
          icon:'success',
          showConfirmButton:false
        })
      }
        this.getDespachos();
      })
  }

  getDespachos(){
    this.api.GetDespacho()
    .subscribe((resp:any)=>{
      this.Despachos = resp
      // // console.log(this.Despachos)
    })
  }

  modal_solicitud(){
    if(this.solicitud){
      this.solicitud = false
    }else{
      this.solicitud = true
    }
  }

  getOrdenes(){
    this.api.getOrden()
    .subscribe( (resp:any) => {
      this.orden = resp;
    } )

  }

  JustOne(n){
    if(n <= 0){
      this.jo = true;
    }
  }

  format(fecha){
    let fecha_formateada = moment(fecha).format('DD-MM-yyyy')
    return fecha_formateada
  }

  modal_Devolucion(){
    if(this.devolucion){
      this.devolucion = false
    }else{
      this.devolucion = true
    }
  }

  modal_nueva_gestion(){
    if(!this.NUEVA_GESTION){
      this.NUEVA_GESTION = true
    }else{
      this.NUEVA_GESTION = false
    }
  }
  fase(e){
    this.FASE = e.target.value;
    this.TRABAJOS = [];
    this.Tarea();
  }

  getMaquinas(){
    this.api.GetMaquinas()
      .subscribe(resp =>{
        this.MAQUINAS = resp
        this.obtenerTipos();
      })
  }

  obtenerTipos(){
    let x = this.MAQUINAS.length;
    for(let i = 0; i< x; i++){
      let inde = this.FUNCIONES.includes(this.MAQUINAS[i].tipo)
      if(!inde){
        this.FUNCIONES.push(this.MAQUINAS[i].tipo)
      }
    }
  }

  calcular_Productos(e){
    let value_hojas = e.target.value;
    let orden =  (<HTMLInputElement>document.getElementById('orden_selected')).value;

    let separator = orden.split('-')
    orden = separator[1];

    let Ejemplares = this.TRABAJOS.find(x => x._id == orden);


    const productos:any = value_hojas * Ejemplares.orden.producto.ejemplares[Ejemplares.orden.montaje];

    // // console.log(value_hojas,'value');
    // // console.log(Ejemplares,'Ejemplares');

    (<HTMLInputElement>document.getElementById('productos_input')).value = productos;
  }

  calcular_Hojas(e){
    let value_productos = e.target.value;

    let orden =  (<HTMLInputElement>document.getElementById('orden_selected')).value;

    let separator = orden.split('-')
    orden = separator[1];


    let Ejemplares = this.TRABAJOS.find(x => x._id == orden);

    const productos:any = Math.ceil(value_productos / Ejemplares.orden.producto.ejemplares[Ejemplares.orden.montaje]);

    (<HTMLInputElement>document.getElementById('hojas_input')).value = productos;
  }

  retrasar(orden:any, maquina:any, fecha:any, trabajo:any, dias){

    let data = {
      orden:orden,
      maquina:maquina,
      fecha:fecha,
      trabajo:trabajo,
      dias
    }

    this.api.postRestrasar(data)
      .subscribe((resp:any)=>{
        // // console.log(resp)
        Swal.fire({
          icon:'info',
          title:'Se realizó un retraso en la planificación',
          text:'se agregó 1 dia mas a esta gestión y a todas las ordenes que utilicen estos mismos equipos',
          showConfirmButton:false,
        });
        this.TRABAJOS = [];
        this.Tarea();
        this.getMaquinas();
        this.getGestiones();
      });
  }

  redondear(x,y){
      return Math.ceil(x/y)
  }

  acelerar(orden:any, maquina:any, fecha:any, trabajo:any, fechaI:any, dias){

    let fecha_lapsos = moment(fecha)
    let fechaI_lapso = moment(fechaI)
    let lapso = fecha_lapsos.diff(fechaI_lapso, 'days')

    if(lapso < 1){
      Swal.fire({
        icon:'error',
        text:'Esta gestión termina hoy',
        showConfirmButton:false,
      });
      return
    }

    let data = {
      orden:orden,
      maquina:maquina,
      fecha:fecha,
      trabajo:trabajo,
      dias
    }

    this.api.postAcelerar(data)
      .subscribe((resp:any)=>{
        Swal.fire({
          icon:'success',
          title:'Fue adelantada la planificación',
          text:'se adelantó 1 dia mas a esta gestión y a todas las ordenes que utilizen estos mismos equipos',
          showConfirmButton:false,
        });
        this.TRABAJOS = [];
        this.Tarea();
    this.getMaquinas();
    this.getGestiones();
      })
  }

  CompararTama(op, fase, grupo, hojas_, productos_,){
    // // // console.log(fase,'<>',grupo)
    let group = this.GRUPOS.find(x=> x._id === grupo)

    console.log(group)

    let index = group.tipos.findIndex(x => x === fase)

    console.log(index)

    if(index > 0){
      let gest = this.GESTIONES.filter(x => x.maquina.tipo == group.tipos[index -1] && x.op == op)
      console.log('gestiones',gest,'Grupos',group)
      let hojas = 0;
      let productos = 0;
      for(let i =0; i<gest.length; i++){
        hojas = hojas + Number(gest[i].hojas);
        productos = productos + Number(gest[i].productos);
      }

      // // console.log(hojas,'<->',productos)
      if(hojas < hojas_ || productos < productos_){
        Swal.fire({
          title:'Error!',
          text:'La cantidad excede las gestiones realizadas en la fase anterior',
          icon:'error',
          showConfirmButton:false
        })
        return 1
      }
    }
  }

  finalizar(){

    Swal.fire({
      title: 'Cuidado',
      text: " Recuerda verificar que la cantidad suministrada sea la realizada en el momento y no la suma total de las mismas",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#48c78e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Verificado',
      cancelButtonText:'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        let hoy = moment().format('yyyy-MM-DD');
    let orden =  ''
    let productos = ''
    let hojas = ''

    orden =  (<HTMLInputElement>document.getElementById('orden_selected')).value;

    let separator = orden.split('-')

    // // // console.log(separator[3]);




    orden = separator[1];
    // // // console.log(separator[0],'<>',separator[1])

    let Ejemplares = this.TRABAJOS.find(x => x._id == orden);

    // // console.log('EJEM',Ejemplares)

    productos = (<HTMLInputElement>document.getElementById('productos_input')).value
    hojas = (<HTMLInputElement>document.getElementById('hojas_input')).value

    if(this.CompararTama(separator[0],separator[2],separator[3], hojas, productos) === 1){
      return
    }


    let restante = this.GESTIONES.filter(x=> x.orden == orden)

    let long = restante.length

    let _productos = 0;
    let _hojas = 0;

    if(long <= 0){
      // // // console.log(orden)
      let Actual = this.TRABAJOS.find(x=> x._id == orden)
      // // // console.log(Actual)
      _productos = Actual.orden.cantidad - Number(productos);
      _hojas = this.redondear(Ejemplares.orden.cantidad, Ejemplares.orden.producto.ejemplares[Ejemplares.orden.montaje]) - Number(hojas)

      // // // console.log(Actual.orden.paginas_o,'-',Number(hojas))
    }else{
      _productos = restante[long - 1].Rproductos-Number(productos)
      _hojas = restante[long - 1].Rhojas - Number(hojas)
    }

    // alert(_hojas)

    let data = {
      op:separator[0],
      orden : orden,
      fecha : hoy,
      maquina: Ejemplares.maquina._id,
      productos:productos,
      hojas:hojas,
      Rproductos:_productos,
      Rhojas:_hojas
    }

     this.api.postGestion(data)
       .subscribe((resp:any)=>{
         (<HTMLInputElement>document.getElementById('productos_input')).value = '';
         (<HTMLInputElement>document.getElementById('hojas_input')).value = '';
         this.modal_nueva_gestion();
         this.getGestiones();
      })

      }
    })

  }

  getGestiones(){
    this.api.getGestiones()
      .subscribe((resp:any)=>{
        this.GESTIONES = resp
        // // console.log('all gestions', resp)
      })
  }


  Tarea(){
    let hoy = moment().format('yyyy-MM-DD');
    this.TRABAJOS = []
    
    this.api.getTrabajos()
      .subscribe((resp:any)=>{

        let nuevo = resp.filter(x => x.maquina.tipo === this.FASE);

        if(nuevo){
          let Long = nuevo.length;
          for(let i=0; i<Long; i++){
    
            if(hoy >= nuevo[i].fechaI){
              if(hoy <= nuevo[i].fecha){
                this.TRABAJOS.push(nuevo[i])
              }
            }
    
          }
        }
      })
  }

  finalizar_gestion(id){
    let data = {id}
    this.api.finalizarTrabajo(data)
      .subscribe((resp:any)=>{
        Swal.fire({
          title:'Gestion finalizada',
          text:'La gestion fue finalizada con exito',
          showConfirmButton:false,
        })
        this.getGestiones();
        this.getMaquinas();
        this.Tarea();
      })
  }

  calcularHojas(x,y){
    return Math.ceil(x/y);
  }

  TraerTareasFueraDeFecha(){
    let hoy = moment().format('yyyy-MM-DD');
    this.TRABAJOS = []
    
    this.api.getTrabajos()
      .subscribe((resp:any)=>{

        let nuevo = resp.filter(x => x.maquina.tipo === this.FASE);
        if(nuevo){
          let Long = nuevo.length;
          for(let i=0; i<Long; i++){
    
            // if(hoy >= nuevo[i].fechaI){
            //   if(hoy <= nuevo[i].fecha){
              //   }
              // }
              
              this.TRABAJOS.push(nuevo[i])
              // // // console.log(this.GRUPOS)
            }
            
        }
      })
  }

}

