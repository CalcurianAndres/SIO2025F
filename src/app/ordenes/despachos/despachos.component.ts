import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-despachos',
  templateUrl: './despachos.component.html',
  styleUrls: ['./despachos.component.css']
})
export class DespachosComponent implements OnInit {

  @Input() despacho:any
  @Input() ORDENES:any
  @Output() onCloseModal = new EventEmitter();

  public Ordenes_seleccionadas = [];
  public dated:boolean = false;
  public date;
  public hoy;

  constructor(private api:RestApiService) { }

  ngOnInit(): void {
    this.hoy = moment().format('yyyy-MM-DD');
  }

  onClose(){
    this.despacho = false;
    this.onCloseModal.emit();
  }

  Orden_Selected(orden){
    // // console.log()
    let select = this.ORDENES.find(x => x.sort === orden)
    if(select){
      let existe = this.Ordenes_seleccionadas.find(x => x.op === orden)
      if(!existe){

        this.Ordenes_seleccionadas.push(
          {
            op:select.sort,
            producto:select.producto.producto,
            cantidad:select.cantidad_o,
            oc:select.orden,
            destino:select.almacen,
            parcial_:false,
          })
        }
    }
  }

  eliminar_Selected(op){
    let index = this.Ordenes_seleccionadas.findIndex(x => x.op === op)
    this.Ordenes_seleccionadas.splice(index, 1);
  }

  change_value(e, i){
    this.Ordenes_seleccionadas[i].cantidad = e;
    // // console.log(this.Ordenes_seleccionadas)
  }

  fecha(e){
    if(!e){
      this.dated = false
    }else{
      this.dated = true;
      this.date = e;
    }
  }
  public observacion;
  Observar(e){
    this.observacion = e;
    // console.log(this.observacion)
  }

  public Almacenes_edicion = []
  public Almacen__:boolean = false;
  public Selected;
  BuscarAlmacen(producto, i){
    this.Almacenes_edicion = [];
    this.Almacen__ = true;
    this.Selected = i;
    this.api.BuscarAlmacenes(producto)
      .subscribe((resp:any)=>{
        // console.log(resp)
        this.Almacenes_edicion.push(resp.almacenes)
        // console.log(this.Almacenes_edicion)
        return resp;
      })
  }

  SeleccionarAlmacen(e,i){
    if(e != '#'){
      this.Ordenes_seleccionadas[i].destino = e
      this.Almacen__ = false
    }else{
      return
    }
  }

  despachar(){
    Swal.fire({
      title: '¿Generar nuevo despacho y notificar al equipo?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Si, generar',
      denyButtonText: `Cancelar`,
      icon:'question'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        let fecha_m = moment(this.date).format('DD-MM-yyyy')

        this.api.PostDespacho({fecha:fecha_m,
                               despacho:this.Ordenes_seleccionadas,
                               observacion:this.observacion})
          .subscribe((resp:any)=>{

            this.date = '';
            this.dated = false;
            this.Ordenes_seleccionadas = [];
            this.onClose();
            Swal.fire({title:'Generado!', text:'', icon:'success',showConfirmButton:false,})
          })
      } else if (result.isDenied) {
        Swal.fire({
          title:'Verifica la información',
          text:'Puedes verificar la información y planificar un despacho, cuando quieras',
          icon:'info',
          showConfirmButton:false,
        })
      }
    })
  }


}
