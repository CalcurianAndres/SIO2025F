import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-aprovacion-traslados-new',
  templateUrl: './aprovacion-traslados-new.component.html',
  styleUrls: ['./aprovacion-traslados-new.component.css']
})
export class AprovacionTrasladosNewComponent implements OnInit {


  @Input() traspasos_pendientes: any;
  @Output() onCloseModal = new EventEmitter();
  @Output() onReset = new EventEmitter();

  public pendientes = []

  constructor(private api: RestApiService) { }

  ngOnInit(): void {
    this.buscarPendientes();
  }

  buscarPendientes() {
    this.api.trasladosPendientes()
      .subscribe((resp: any) => {
        this.pendientes = resp.traslado
      })
  }

  cerrar() {
    this.onCloseModal.emit();
  }

  getProductosAgrupados_(materiales: any): any[] {
    const agrupado = new Map<string, any>();

    for (const p of materiales) {
      const clave = `${p.material.ancho}|${p.material.largo}|${p.material.nombre}|${p.material.marca}|${p.material.calibre}|${p.material.gramaje}`;

      if (!agrupado.has(clave)) {
        agrupado.set(clave, {
          nombre: p.material.nombre,
          marca: p.material.marca,
          ancho: p.material.ancho,
          largo: p.material.largo,
          calibre: p.material.calibre,
          gramaje: p.material.gramaje,
          total: 0,
        });
      }

      agrupado.get(clave)!.total += Number(p.cantidad);
    }

    return Array.from(agrupado.values());
  }


  cancelar_tralado(traslado_id) {


    Swal.fire({
      title: "¿Seguro que quieres cancelar este traslado?",
      text: 'si cancelas este traslado no podras verlo otra vez en el futuro',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Cancelar",
      denyButtonText: `Mantener`,
      confirmButtonColor: '#f14668',
      denyButtonColor: '#3ec487'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.api.CancelarTraslado(traslado_id)
          .subscribe((resp: any) => {
            this.traspasos_pendientes = false;
            this.cerrar()
            this.onReset.emit()
            Swal.fire({
              text: 'Se canceló traslado de material',
              icon: 'success',
              showConfirmButton: false,
              toast: true,
              timer: 5000,
              position: 'top-end',
              timerProgressBar: true
            })
          })
      } else if (result.isDenied) {
        Swal.fire({
          text: 'No hubo cambios',
          icon: 'info',
          showConfirmButton: false,
          toast: true,
          timer: 5000,
          position: 'top-end',
          timerProgressBar: true
        })
      }
    });
  }

  aceptar_traslado(traslado_id) {
    this.api.AceptarTraslado(traslado_id)
      .subscribe((resp: any) => {
        this.cerrar()
        this.onReset.emit()
        Swal.fire({
          text: 'Se aprobó traslado de material',
          icon: 'success',
          showConfirmButton: false,
          toast: true,
          timer: 5000,
          position: 'top-end',
          timerProgressBar: true
        })
      })
  }


}
