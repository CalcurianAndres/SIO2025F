import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-devoluciones-new',
  templateUrl: './devoluciones-new.component.html',
  styleUrls: ['./devoluciones-new.component.css']
})
export class DevolucionesNewComponent implements OnInit {

  constructor(public api: RestApiService) { }

  @Input() Dev_: any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onReset = new EventEmitter();

  ngOnInit(): void {
    this.getDevolucion()
  }


  public Devoluciones = [];

  getDevolucion() {
    this.api.getDevolucion()
      .subscribe((resp: any) => {
        this.Devoluciones = resp;
      })
  }


  Modal_Devolucion() {
    this.onCloseModal.emit();
  }

  confirmarDevolucion(data, id) {

    Swal.fire({
      title: 'Cuidado!',
      text: 'Verifica las cantidades que sean correctas antes de confirmar.',
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Confirmar!',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {

        // Llamamos al API para hacer la devolución
        this.api.putDevolucion(id, data)
          .subscribe((resp: any) => {

            // Verificamos si la respuesta tiene el conflicto específico
            if (resp.conflicto) {
              // Si hay un conflicto, mostramos el mensaje de error
              Swal.fire({
                title: 'Error!',
                text: resp.message,  // El mensaje de conflicto que viene de la API
                icon: 'error',
                showConfirmButton: true,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#d33',
              });
            } else {
              // Si la devolución fue exitosa, mostramos el mensaje de éxito
              Swal.fire({
                title: 'Confirmado!',
                text: 'El material fue agregado al almacén.',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,  // Se puede agregar un temporizador para que se cierre automáticamente
              });

              // Actualizamos las vistas después de una devolución exitosa
              this.Modal_Devolucion();
              this.onReset.emit();
            }

          }, (error) => {
            // Este bloque solo se ejecuta si hay un error con la solicitud HTTP (no es un error de lógica)
            Swal.fire({
              title: 'Error!',
              text: 'Hubo un problema al procesar la solicitud. Inténtalo de nuevo más tarde.',
              icon: 'error',
              showConfirmButton: true,
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#d33',
            });
          });
      }
    });

  }

  CancelarDevolucion(id) {
    Swal.fire({
      title: 'Cuidado!',
      text: '¿Estas seguro que quieres cancelar esta devolución?. No se podrá recuperar esta información luego',
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Si!, Cancelar devolución.',
      cancelButtonText: 'Mantener devolución pendiente.',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        // // // console.log(id);

        this.api.DeleteDevolucion(id)
          .subscribe((resp: any) => {
            Swal.fire(
              {
                title: 'Cancelado!',
                text: 'Esta devolución fué cancelada, el almacén no sufrio ningun cambio.',
                icon: 'success',
                showConfirmButton: false
              })
            this.Modal_Devolucion()
            this.onReset.emit();
          })
      }
    })

  }

}
