import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { zip } from 'rxjs';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalles',
  templateUrl: './detalles.component.html',
  styleUrls: ['./detalles.component.css']
})
export class DetallesComponent implements OnChanges {

  @Input() detalle:any
  @Input() orden_detalle:any
  @Input() orden_id:any
  @Input() cantidad_d:any
  @Input() cantidad_do:any
  @Input() ejemplares_montados:any
  @Output() onCloseModal = new EventEmitter();
  @Output() CargarOrdenes = new EventEmitter();

  public trabajos;
  public gestiones_;
  public cargando:boolean = true;
  public detallado:boolean = false;
  public despachos = [];
  public despacho = 0;
  public usuario;
  public Maquinas;

  constructor(private api:RestApiService) {
    this.usuario = api.usuario;
   }

   ngOnChanges(changes: SimpleChanges) {
    if (changes['detalle'] && this.detalle) {
      this.gestiones(); // Se ejecuta apenas se abra la modal
    }
  }

  getTotalesPorTipo(tipo: string): { hojas: number, productos: number } {
    const filtradas = this.gestiones_.filter(g => g.maquina.tipo === tipo && g.op === this.orden_id);
    const hojas = filtradas.reduce((sum, g) => sum + Number(g.hojas || 0), 0);
    const productos = filtradas.reduce((sum, g) => sum + Number(g.productos || 0), 0);
    return { hojas, productos };
  }
  

  cambiarFecha(dato, trabajo, campo:string){
    this.api.updateTrabajo(trabajo, {[campo]:dato})
      .subscribe((resp:any)=>{

      })
  }

  format(n){
    n = Math.ceil(n);
    return n = new Intl.NumberFormat('de-DE').format(n)
  }

  Finalizar(i){
    document.getElementById(`dato_hoja_${i}`).style.display = 'block'
    document.getElementById(`dato_producto_${i}`).style.display = 'block'
    document.getElementById(`edicion_${i}`).style.display = 'block'
    document.getElementById(`dato_fecha_${i}`).style.display = 'block'
    document.getElementById(`productos_${i}`).style.display = 'none'
    document.getElementById(`hojas_${i}`).style.display = 'none' 
    document.getElementById(`finalizar_${i}`).style.display = 'none'
    document.getElementById(`fecha_${i}`).style.display = 'none'

    let gestiones = this.gestiones_.filter(x => x.maquina.tipo == this.gestiones_[i].maquina.tipo)


    this.api.PostEditarGestiones(gestiones)
      .subscribe((resp:any)=>{
        Swal.fire({
          // title:'Editado',
          title:'gestión editada con exito',
          toast:true,
          icon:'success',
          showConfirmButton:false,
          timerProgressBar:true,
          timer:1500,
          position:'top-end',
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })
      })
  }

  chage_date(e, i){
    this.gestiones_[i].fecha = e;
  }

  editar_gestion(i){

    document.getElementById(`dato_hoja_${i}`).style.display = 'none'
    document.getElementById(`dato_producto_${i}`).style.display = 'none'
    document.getElementById(`edicion_${i}`).style.display = 'none'
    document.getElementById(`dato_fecha_${i}`).style.display = 'none'
    document.getElementById(`productos_${i}`).style.display = 'block'
    document.getElementById(`hojas_${i}`).style.display = 'block' 
    document.getElementById(`finalizar_${i}`).style.display = 'block'
    document.getElementById(`fecha_${i}`).style.display = 'block'
    
    // Swal.fire({
    //   title:'En desarrollo',
    //   text:'La siguiente función se encuentra en desarrollo, pronto estará disponible',
    //   toast:true,
    //   icon:'info',
    //   timer:1500,
    //   showConfirmButton:false,
    //   timerProgressBar:true,
    //   didOpen: (toast) => {
    //     toast.addEventListener('mouseenter', Swal.stopTimer)
    //     toast.addEventListener('mouseleave', Swal.resumeTimer)
    //   }
    // })
  }

  gestiones(){
    this.buscarTrabajos();
    this.buscarGestiones();
    this.buscarDespachos();
    this.BuscarMaquinas();
      this.detallado = true;
  }

  restan(a,b){
    let c = a -b;
    if(c < 0){
      return 0
    }else{
      return c
    }

  }

  cerrarOrden(){
    Swal.fire({
      title: '¿Cerrar orden de producción?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Cerrar',
      denyButtonText: `No cerrar`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.api.CerrarOrden(this.orden_id)
          .subscribe((resp:any)=>{
            this.CargarOrdenes.emit();
            this.onClose()
            Swal.fire('¡Cerrada!', '', 'success')
          })
      } else if (result.isDenied) {
        Swal.fire('La orden no fué cerrada', '', 'info')
      }
    })
    // // console.log(this.orden_id)
  }

  buscarDespachos(){
    this.api.GetDespachoByOrden(this.orden_detalle)
      .subscribe((resp:any)=>{
        for(let i=0; i<resp.length; i++){
          for(let y=0; y<resp[i].despacho.length; y++){

            if(resp[i].despacho[y].op === this.orden_detalle)
            {
              this.despachos.push(resp[i].despacho[y])
              if(resp[i].despacho[y].parcial){
                this.despachos.push({fecha:resp[i].despacho[y].parcial})
              }else{
                this.despachos.push({fecha:resp[i].fecha})
              }
              this.despacho = this.despacho + resp[i].despacho[y].cantidad
              // console.log(this.despachos, 'aquiiii!!')
            }
          }
        }
      })
  }

  buscarGestiones(){
    this.api.getGestionesByOp(this.orden_id)
      .subscribe((resp:any)=>{
        this.gestiones_ = resp;
        // console.log(resp)
      })
    // this.api.getGestiones()
    //   .subscribe((resp:any)=>{
    //     this.gestiones_ = resp;
    //   })
  }

  CambioDeMaquina(e){
    alert(e)
  }

  change_hojas(e, i){
    //calcular producto por hoja
    let pph = this.ejemplares_montados
    this.gestiones_[i].hojas = e;
    this.gestiones_[i].productos = pph * e;

    let gestionesXtipo = this.gestiones_.filter(x => x.maquina.tipo == this.gestiones_[i].maquina.tipo) 
    
    for(let n=0;n<gestionesXtipo.length;n++){
      let productos = this.cantidad_d
      let hojas = Math.ceil(productos / this.ejemplares_montados)

      if(n == 0){
        let index = this.gestiones_.findIndex(x=> x._id === gestionesXtipo[n]._id)
        this.gestiones_[index].Rhojas = hojas - this.gestiones_[index].hojas
        this.gestiones_[index].Rproductos = productos - this.gestiones_[index].productos
      }else{
        let index = this.gestiones_.findIndex(x=> x._id === gestionesXtipo[n]._id)
        let anterior = this.gestiones_.findIndex(x=> x._id === gestionesXtipo[n-1]._id)

        this.gestiones_[index].Rhojas = this.gestiones_[anterior].Rhojas - this.gestiones_[index].hojas
        this.gestiones_[index].Rhojas = Math.ceil(this.gestiones_[index].Rhojas)
        this.gestiones_[index].Rproductos = this.gestiones_[anterior].Rproductos - this.gestiones_[index].productos
        this.gestiones_[index].Rproductos = Math.ceil(this.gestiones_[index].Rproductos)
      }
    }

  }

  change_productos(e,i){
    this.gestiones_[i].productos = e;
    this.gestiones_[i].hojas = e / this.ejemplares_montados;
    this.gestiones_[i].hojas = Math.ceil(this.gestiones_[i].hojas)

    let gestionesXtipo = this.gestiones_.filter(x => x.maquina.tipo == this.gestiones_[i].maquina.tipo)
    for(let n=0;n<gestionesXtipo.length;n++){
      let productos = this.cantidad_d
      let hojas = Math.ceil(productos / this.ejemplares_montados)

      if(n == 0){
        let index = this.gestiones_.findIndex(x=> x._id === gestionesXtipo[n]._id)
        this.gestiones_[index].Rhojas = hojas - this.gestiones_[index].hojas
        this.gestiones_[index].Rproductos = productos - this.gestiones_[index].productos
      }else{
        let index = this.gestiones_.findIndex(x=> x._id === gestionesXtipo[n]._id)
        let anterior = this.gestiones_.findIndex(x=> x._id === gestionesXtipo[n-1]._id)

        this.gestiones_[index].Rhojas = this.gestiones_[anterior].Rhojas - this.gestiones_[index].hojas
        this.gestiones_[index].Rhojas = Math.ceil(this.gestiones_[index].Rhojas)
        this.gestiones_[index].Rproductos = this.gestiones_[anterior].Rproductos - this.gestiones_[index].productos
        this.gestiones_[index].Rproductos = Math.ceil(this.gestiones_[index].Rproductos)
      }
    }

  }

  buscarTrabajos(){
    this.api.getMaquinasByOrdens(this.orden_id)
      .subscribe((resp:any)=>{
        this.trabajos = resp.maquinasDB;
        // this.trabajos = this.trabajos.sort(x => x.fechaI)
      })
  }

  BuscarMaquinas(){
    this.api.GetMaquinas()
      .subscribe((resp:any)=>{
        this.Maquinas = resp

        // console.log(this.Maquinas)
      })
  }

  onClose(){
    this.detalle = false;
    this.detallado = false;
    this.despachos = [];
    this.despacho = 0;
    this.onCloseModal.emit();
  }

}
