import { Component, OnInit } from '@angular/core';
import { zIndex } from 'html2canvas/dist/types/css/property-descriptors/z-index';
import * as moment from 'moment';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';




@Component({
  selector: 'app-etiqueta',
  templateUrl: './etiqueta.component.html',
  styleUrls: ['./etiqueta.component.css']
})
export class EtiquetaComponent implements OnInit {

  constructor(private api:RestApiService) { }

  public ordenes = []
  public valido:boolean = false;
  public orden;

  ngOnInit(): void {

    

    this.api.getOrden()
      .subscribe((resp:any)=>{
        this.ordenes = resp.reverse()
      })

    this.api.getDespachados()
      .subscribe((resp:any)=>{
        this.Despachados = resp
      })

  }

  Despachado(n){
    return this.Despachados.indexOf(n)
  }

  public __orden;
  public __Cajas
  public __gestiones;
  public __producto_por_caja
  public loaded = false;
  public fecha
  public hoy
  public sustrato
  public Despachados
  public cargando:boolean = false;
  public __orden__
  seleccionar_orden(e){
    // console.log(e,'<- e')
    this.__orden__ = e;
    let id = this.ordenes.find(x=> x.sort === e)
    // // console.log(id)
    e = id._id

    if(e != '#'){
      this.visto = false
      this.loaded = false;
      this.api.getOrdenById2(e)
      .subscribe((resp:any)=>{
        this.__Cajas = null
          this.__orden = resp.ordenes
          this.__gestiones = resp.gestiones
          this.fecha = resp.trabajos;
          this.hoy = moment.utc().format('DD/MM/yyyy');
          // console.log(this.__orden)
          this.orden = e;
          // console.log(this.orden, '<-- this.orden')
          // this.__orden = this.ordenes.find(x=> x._id === e)
          for(let i=0;i<this.__orden.producto.materiales[this.__orden.montaje].length;i++){
            
            let material = this.__orden.producto.materiales[this.__orden.montaje][i]
            if(material.producto.presentacion === 'Caja'){
              this.__producto_por_caja = material.cantidad
              this. __Cajas = Math.ceil(this.__orden.cantidad_o / material.cantidad);
              
            }
            if(this.__orden.producto.materiales[this.__orden.montaje][i].producto.ancho){
              this.sustrato = `${this.__orden.producto.materiales[this.__orden.montaje][i].producto.nombre}, Cal ${this.__orden.producto.materiales[this.__orden.montaje][i].producto.calibre}, Gramaje ${this.__orden.producto.materiales[this.__orden.montaje][i].producto.gramaje}`
            }
            
            if(i === this.__orden.producto.materiales[this.__orden.montaje].length -1){
              this.loaded = true
              this.valido = true;
            }
          }
        })
      
      
    }else{
      this.valido = false
    }
  }
  
  EtiquetasAImprimir(x,y){
    let z = x/y

   if( Number.isInteger(x / y)){
     return z
   }else{
    return z
   }
    
  }

  formatear(x,y){
    let z = x/y;
    return Math.trunc(z)
  }

  public visto = false;
  public cantidad__;
  public unidades__;
  public gestion
  public resto
  verEtiqueta(x,y,z, gestion,resto){

    this.visto = true
    
    let c = x/y
    
    c = Math.trunc(c)
    this.cantidad__ = c
    this.unidades__ = z
    this.gestion = gestion
    this.resto = resto


    // const WindowPrt = window.open(`http://localhost:4200/etiqueta/${this.orden}/${c}/${z}/${gestion}`, '', 'left=300,top=300,width=400,height=300,toolbar=0,scrollbars=0,status=0');
    // // window.open("http://localhost:4200/pruebas")
  }

  generarpdf()
  {
    this.cargando = true;
    let data = {
      orden:this.__orden,
      fecha:this.fecha,
      hoy:this.hoy,
      value:`${this.__orden.producto.producto}\nOP: ${this.__orden.sort}\nOC: ${this.__orden.orden}\n${this.unidades__} Und.`,
      sustrado:this.sustrato,
      cantidad:this.puntoYcoma(this.unidades__),
      copias:this.cantidad__,
      gestion:this.gestion,
      resto:this.resto
    }
    this.api.ImprimirPDF(data)
      .subscribe((resp:any)=>{
        // console.log(resp)
        // console.log('---> ',this.orden)
        this.seleccionar_orden(this.__orden__)
        this.visto = false
        this.api.copyTags(this.__orden.sort, this.unidades__)
          .subscribe((resp:any)=>{
           this.cargando = false;
            // console.log('done')
          })
      })
    
  }

  test_print(){
    this.api.imprimirTest()
      .subscribe((resp:any)=>{
        Swal.fire({
          position: 'top-end',
          icon:'success',
          title: 'Se imprimió etiqueta de prueba',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar:true,
          toast:true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })
      })
}

  puntoYcoma(n){
    return n = new Intl.NumberFormat('de-DE').format(n)
   }

}
