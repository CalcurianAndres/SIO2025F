import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-retorno-material-por-aprobar-new',
  templateUrl: './retorno-material-por-aprobar-new.component.html',
  styleUrls: ['./retorno-material-por-aprobar-new.component.css']
})
export class RetornoMaterialPorAprobarNewComponent implements OnInit {


  @Input() Retorno_pendiente: any
  @Input() Pendientes: any
  @Output() onCloseModal = new EventEmitter();
  @Output() onReset = new EventEmitter();

  constructor(private api: RestApiService) { }

  ngOnInit(): void {
  }

  cerrar() {
    this.onCloseModal.emit()
  }

  updateRetorno(id: string, desicion: string) {
    this.api.putRetornos(id, desicion)
      .subscribe((resp: any) => {

        if (desicion === 'Aprobado') {
          Swal.fire({
            text: 'Retorno de material a almacenes de Poligrafica Aprobado',
            icon: 'success',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true
          })
        } else {
          Swal.fire({
            text: 'Retorno de material a almacenes de Poligrafica rechazados',
            icon: 'success',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true
          })
        }

        this.onReset.emit();
        this.onCloseModal.emit()
      })
  }
}
