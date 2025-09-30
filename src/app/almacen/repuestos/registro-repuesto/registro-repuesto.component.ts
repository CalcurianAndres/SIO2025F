import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import { SubirArchivosService } from 'src/app/services/subir-archivos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-repuesto',
  templateUrl: './registro-repuesto.component.html',
  styleUrls: ['./registro-repuesto.component.css']
})
export class RegistroRepuestoComponent implements OnInit {

  constructor(private api:RestApiService,
              private upload:SubirArchivosService) { }

  @Input() Maquinas:any;
  @Input() Categorias:any;
  @Input() Repuesto:any;
  @Input() nuevoMaterial:any;
  @Input() Edicion:boolean;
  @Input() Repuestos_:any
  @Output() onCloseModal = new EventEmitter();

  ngOnInit(): void {
  }

  SubirFoto(e){
    let image = (e.target).files[0]
    this.upload.actualizarFoto(image,'repuestos','id')
      .then(img =>{
        // console.log(img)
        this.nuevoMaterial.foto = img;
      })
  }

  editar(){
    this.api.putRepuesto(this.nuevoMaterial, this.nuevoMaterial._id)
      .subscribe((resp:any)=>{
        // console.log(resp)
        this.cerrar();
      })
  }

  SNParte(e){
    // console.log(e.target.checked)
    if(e.target.checked === true){
      const fechaActual = Date.now();

        // Convertir la fecha actual a una cadena
        const fechaActualCadena = fechaActual.toString();

        // Obtener los últimos 3 dígitos de la fecha actual
        const ultimos3Digitos = fechaActualCadena.slice(-3);

        // Obtener los segundos actuales
        const segundosActuales = new Date().getSeconds();

        // Convertir los segundos actuales a una cadena
        const segundosActualesCadena = segundosActuales.toString();

        // Obtener los últimos 2 dígitos de los segundos actuales
        const ultimos2Digitos = segundosActualesCadena.slice(-2);

        // Combinar los últimos 3 dígitos de la fecha actual y los últimos 2 dígitos de los segundos actuales
        const idUnico = ultimos3Digitos + ultimos2Digitos;

  // Devolver el ID único generado
      this.nuevoMaterial.parte = `*${idUnico}`;
      (<HTMLInputElement>document.getElementById('n_parte')).disabled = true;
    }else{
      this.nuevoMaterial.parte = '';
      (<HTMLInputElement>document.getElementById('n_parte')).disabled = false;
    }
  }

  guardar(){
    this.api.postRepuesto(this.nuevoMaterial)
        .subscribe((resp:any)=>{
          if(resp.error){
            Swal.fire({
              title:resp.error.mensaje,
              showConfirmButton:false,
              icon:'warning',
              timerProgressBar:true,
              timer:2500
            })
            return
          }
          this.Repuestos_.push(resp.repuesto)
          this.cerrar()
          
         })
  }


  cerrar(){
    this.onCloseModal.emit()
  }

}
