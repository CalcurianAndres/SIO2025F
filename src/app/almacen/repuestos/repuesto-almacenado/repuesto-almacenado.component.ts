import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';

@Component({
  selector: 'app-repuesto-almacenado',
  templateUrl: './repuesto-almacenado.component.html',
  styleUrls: ['./repuesto-almacenado.component.css']
})
export class RepuestoAlmacenadoComponent implements OnInit {

  @Input() Maquinas:any;
  @Input() Categorias:any;
  @Input() Repuestos:any;
  @Input() Piezas:any;
  @Input() Almacen:any;
  @Input() Edicion:any;
  @Input() almacenado:any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onUpdate = new EventEmitter();
  public hoy 
  constructor(private api:RestApiService) { }

  ngOnInit(): void {

    this.hoy = Date.now();
  }


  cargarRepuestos(){
    if(this.Almacen.maquina != 'GENERICO'){
      return this.Repuestos.filter((x:any) => x.maquina === this.Almacen.maquina && x.categoria === this.Almacen.categoria);
    }else{
    return this.Repuestos.filter((x:any) => x.maquina === 'GENERICO' && x.categoria === this.Almacen.categoria)
    }
}

  cerrar(){
    this.onCloseModal.emit();
  }

  guardar(){
    this.api.postpieza(this.Almacen)
        .subscribe((resp:any)=>{

          this.onUpdate.emit();
          // console.log(resp)
          this.cerrar();

        })
  }

  editarPieza(){
    this.api.putPieza(this.Almacen, this.Almacen._id)
            .subscribe((resp:any) =>{
              this.cerrar();
            })
  }
}
