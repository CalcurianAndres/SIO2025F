import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solcitud',
  templateUrl: './solcitud.component.html',
  styleUrls: ['./solcitud.component.css']
})
export class SolcitudComponent implements OnInit {
  
  public materiales:any;
  public orden_selected;
  public Otro:boolean = false;
  public Repuesto:boolean = false;
  public grupos;
  public almacenado
  public por_confirmar = []
  public _materiales = []
  public usuario
  public asociacion = '#'
  public Maquinas:any;
  public Categorias:any;
  public Repuestos:any;
  public RepuestosLista = []

  public maquina_selected = "";
  public categoria_selected = "";
  public temporal = []



  @Input() solicitud:any
  @Input() orden:any
  @Output() onCloseModal = new EventEmitter();

  constructor(private api:RestApiService) {

    this.usuario = api.usuario
   }

  ngOnInit(): void {
    this.buscarRepuestos()
  }
buscarRepuestos(){
  this.api.getRepuesto()
    .subscribe((resp:any)=>{
      this.Repuestos = resp.repuesto
      // console.log(this.Repuestos)
    })
}

cargarRepuestos(){
  let info = this.Repuestos.filter((x:any) => x.maquina === this.maquina_selected && x.categoria === this.categoria_selected)
  return this.Repuestos.filter((x:any) => x.maquina === this.maquina_selected || x.maquina === '620d635af53de725bcfbe905' && x.categoria === this.categoria_selected)
}
  
BuscarMaquinas(){
  this.api.GetMaquinas()
    .subscribe((resp:any)=>{
      this.Maquinas = resp;
      const maquinas = this.Maquinas;
      const maquinasUnicas = maquinas.reduce((acc, maquina) => {
      if (!acc.find((m) => m.nombre === maquina.nombre)) {
        acc.push(maquina);
      }
      return acc;
      }, []);
        this.Maquinas = maquinasUnicas;
    })
  }

  GetCategorias(){
    this.api.getCategorias()
      .subscribe((resp:any)=>{
        this.Categorias = resp.categorias;
        // console.log(this.Categorias)
      })
  }

  getGRupos(){
    this.api.GetGrupoMp()
      .subscribe((resp:any)=>{
        this.grupos = resp;
        // // console.log(this.grupos)
      })
  }

  quitarMaterial(i){
    this.por_confirmar.splice(i)
    this._materiales.splice(i)
  }

  cambiarCantidades(i,e){
    this._materiales[i].cantidad = e;
    // // console.log(this._materiales)
  }

  AdjuntarMaterial(e){
    let almacen = this.almacenado.find(x => x.material._id === e)
    this.por_confirmar.push(almacen)
    let mat = this._materiales.push({
      producto:almacen.material._id,
      cantidad:0
    })
    // // console.log(this._materiales)
  }

  public articulos_limpieza = false
  mostrarMaterial(e){
    if(e === "#"){
    (<HTMLInputElement>document.getElementById('_material_')).disabled = true
    }else{
      console.error(e)
      if(e === '6412e32738e497148025ee50'){
        this.articulos_limpieza = true;
      }
      this.api.getAlmacenado()
        .subscribe((resp:any)=>{
          (<HTMLInputElement>document.getElementById('_material_')).disabled = false
          this.almacenado = resp.filter(x => x.material.grupo._id === e)
          let bs_= this.almacenado;
          if(e != '61f92a1f2126d717f004cca6'){
            this.almacenado = [...this.almacenado.reduce((map, obj) => map.set(obj.material.nombre, obj), new Map()).values()];
            for(let i=0;i<bs_.length;i++){
              let index = this.almacenado.find(x=> x.material.nombre === bs_[i].material.nombre && x.material.marca === bs_[i].material.marca)
              if(!index){
                this.almacenado.push(bs_[i])
              }
            }
            this.almacenado.sort(function(a, b) {
              if(a.material.nombre.toLowerCase() < b.material.nombre.toLowerCase()) return -1
              if(a.material.nombre.toLowerCase() > b.material.nombre.toLowerCase()) return 1
              return 0
    
            })
          }
        })
    }
  }

  TraerMateriales(e){

    // // console.log(e)

    if(e === 'Otro'){
      this.Otro = true;
      this.Repuesto = false
      this.getGRupos();
    }else if(e === "repuesto"){
      this.Otro = false;
      this.Repuesto = true;
      this.BuscarMaquinas()
      this.GetCategorias()
      this.buscarRepuestos()
    }else{
      let Orden_seleccionada = this.orden.find(x => x.sort == e)
      this.orden_selected = Orden_seleccionada
      this.Otro = false;
      this.Repuesto = false;
      if(Orden_seleccionada){
        this.materiales = Orden_seleccionada.producto.materiales[Orden_seleccionada.montaje]
        this.materiales.sort(function(a, b) {
          if(a.material.nombre.toLowerCase() < b.material.nombre.toLowerCase()) return -1
          if(a.material.nombre.toLowerCase() > b.material.nombre.toLowerCase()) return 1
          return 0

        })
      }else{
        this.materiales = undefined;
      }
    }
  }

  onClose(){
    this.solicitud = false;
    this.onCloseModal.emit();
  }

  public motivo__ = '';
FinalizarSolicitu = async () => {
  const motivo = this.motivo__
  
  if (!motivo) {
    Swal.fire({
      title: 'Debes agregar un motivo',
      text: 'Es necesario agregar un motivo a la solicitud de material',
      icon: 'error',
      timerProgressBar: true,
      timer: 5000,
      showConfirmButton: false
    });
    return;
  }

  let requisicion:any = {}
  if(this.articulos_limpieza){
    requisicion = {
      categoria:this.articulos_limpieza,
      sort: this.asociacion,
      motivo: motivo,
      usuario: `${this.api.usuario.Nombre} ${this.api.usuario.Apellido}`,
      producto: {
        producto: this.api.usuario.Correo,
        materiales: [[]]
      }
    };
  }else{
    requisicion = {
      categoria:this.articulos_limpieza,
      sort: this.asociacion,
      motivo: motivo,
      usuario: `${this.api.usuario.Nombre} ${this.api.usuario.Apellido}`,
      producto: {
        producto:'N/A',
        materiales: [[]]
      }
    };
  }



  this.articulos_limpieza = false;

  requisicion.producto.materiales[0] = this._materiales

  try {
    await Promise.all(this._materiales.map(async (material) => {
      const resp:any = await this.api.getAlmacenadoID2(material.producto).toPromise();
      const cantidad = resp.reduce((acc, curr) => acc + Number(curr.cantidad), 0);

      console.log(resp)

      if (cantidad < Number(material.cantidad)) {
        throw new Error(`Cantidad excedida: la cantidad solicitada de ${resp[0].material.nombre} es mayor a la cantidad de producto en el almacén, existe en almacén: ${cantidad.toFixed(2)}`);
      }
    }));

    await this.api.postReq(requisicion).toPromise();
    
    Swal.fire({
      showConfirmButton: false,
      title: 'Hecho!',
      text: 'Se realizó la solicitud correctamente',
      icon: 'success',
      timer: 5000
    });

    this._materiales = [];
    this.por_confirmar = [];
    this.onClose();
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error.message,
      icon: 'error',
      showConfirmButton: false
    });
  }
}

  FinalizarSolicitudR(){
    let motivo = (<HTMLInputElement>document.getElementById('__motivo')).value;
    if(!motivo || this.RepuestosLista.length < 1){
      Swal.fire({
        position:'top-end',
        toast:true,
        timer:3000,
        text:'Debes llenar todos los campos',
        icon:'error',
        showConfirmButton:false,
        timerProgressBar:true
      })
      return
    }
    let data = {
      orden: 'Repuesto',
      repuestos:this.RepuestosLista,
      motivo,
      usuario:`${this.api.usuario.Nombre} ${this.api.usuario.Apellido}`
    }

    this.api.postRequisicionRepuesto(data)
        .subscribe((resp:any)=>{
          this.maquina_selected = '';
          this.categoria_selected = '';
          this.RepuestosLista = []
          this.temporal = []
        })

    Swal.fire({
      icon:'success',
      title:'Nueva solicitud de repuesto',
      text:'Se realizó la solicitud de un repuesto',
      timerProgressBar:true,
      timer:5000,
      showConfirmButton:false
    })
    this.onCloseModal.emit();
    // let data = {
    //   orden:'Repuesto',
    //   repuestos:this.RepuestosLista
    // }
    // this.api.postRequisicionRepuesto(data)
    //   .subscribe((resp:any)=>{
    //     // console.log(resp)
    //   })
  }

  seleccionarRepuesto(e){

    if(e.value === "#"){
      return
    }else {
      this.temporal.push(this.cargarRepuestos().find(x=> x._id === e.value))
      this.RepuestosLista.push({repuesto:e.value, cantidad:0})
    }
    
  }

  cambiarCantidadesR(i,e){
    this.RepuestosLista[i].cantidad = e;
  }
  quitarMaterialR(i){
    this.RepuestosLista.splice(i,1);
  }

  FinalizarSolicitud(){

    let iteration = 0

    let requisicion = {
      sort:this.orden_selected.sort,
      motivo:(<HTMLInputElement>document.getElementById('razon')).value,
      usuario:`${this.api.usuario.Nombre} ${this.api.usuario.Apellido}`,
      producto:{
        producto:this.orden_selected.producto.producto,
        materiales:[[]]
      }
    }


  for(let i=0;i<this.materiales.length;i++){
    let _i = i.toString();

    let cantidad = (<HTMLInputElement>document.getElementById(_i)).value;
    let producto = (<HTMLInputElement>document.getElementById(_i)).name;

    let num = Number(cantidad)

    if(num > 0){

      iteration++
      requisicion.producto.materiales[0].push({
        cantidad,
        producto 
      })
    }


    // // console.log(requisicion)


  }

  let cantidad = (<HTMLInputElement>document.getElementById('100')).value;
  let producto = (<HTMLInputElement>document.getElementById('100')).name;

  let num = Number(cantidad)

    if(num > 0){

      iteration++
      requisicion.producto.materiales[0].push({
        cantidad,
        producto 
      })
    }

  if(iteration>0){

    let materiales_fr =  requisicion.producto.materiales[0];

    //test
    for(let i=0;i<materiales_fr.length;i++){
      this.api.getAlmacenadoID2(materiales_fr[i].producto)
        .subscribe((resp:any)=>{
          let cantidad = 0;
          for(let i=0;i<resp.length;i++){
            cantidad = cantidad + Number(resp[i].cantidad)
          }

          if(cantidad < Number(materiales_fr[i].cantidad)){
            Swal.fire({
              title:'Cantidad excedida',
              text:`la cantidad solicitada de ${resp[0].material.nombre} es mayor a la cantidad de producto en el almacen,
              existe en almacen: ${cantidad.toFixed(2)}`,
              icon:'warning',
              showConfirmButton:false
            })
            i = 1000
          }else if(i === materiales_fr.length -1){
            this.api.postReq(requisicion)
               .subscribe((resp:any)=>{
                Swal.fire(
                {
                  showConfirmButton:false,
                   title:'Hecho!',
                  text:'Se realizó la solicitud correctamente',
                  icon:'success',
                  timer:5000
                }
              )
              materiales_fr = []
              this.por_confirmar = []
              this.onClose()
            })
          }
        })

        // if(i === this._materiales.length -1){
        //   if(aprobado){
        //     this.api.postReq(requisicion)
        //        .subscribe((resp:any)=>{
        //         Swal.fire(
        //         {
        //           showConfirmButton:false,
        //            title:'Hecho!',
        //           text:'Se realizó la solicitud correctamente',
        //           icon:'success',
        //           timer:5000
        //         }
        //       )
        //       this._materiales = []
        //       this.onClose()
        //     })
        //   }
        // }
    }

    //test
    
  }else{
    Swal.fire(
      {
        showConfirmButton:false,
        title:'Error!',
        text:'Debe ingresar al menos una cantidad de cualquier producto',
        icon:'error'
      }
    )

    return
  }

  
  
  
}


}
