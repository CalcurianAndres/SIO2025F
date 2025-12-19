import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-retorno-material-new',
  templateUrl: './retorno-material-new.component.html',
  styleUrls: ['./retorno-material-new.component.css']
})
export class RetornoMaterialNewComponent implements OnInit {

  @Input() AlmacenExterno: any;
  @Input() Solicitud_retorno: any;
  @Output() onCloseModal = new EventEmitter();
  @Output() CargarAlmExterno = new EventEmitter();
  @Output() onRestar = new EventEmitter();


  public almacen = ''
  public selected_ = ''
  public cantidad = ''
  public observacion = ''
  public materiales_para_retornar = false;
  public filtros: any = ''
  public ordenDireccionResumido = 'asc';
  public ordenCampoResumido = '';
  public selected;


  add_matrial(e) {
    this.selected = this.resumirMaterialesExteriorires(this.AlmacenExterno[this.almacen], this.almacen)[e]
    console.log(this.selected)
  }

  devolverMaterial() {

    let data = {
      origen: this.almacen,
      material: this.selected,
      cantidad: this.cantidad,
      observacion: this.observacion,
      solicitado: `${this.api.usuario.Nombre} ${this.api.usuario.Apellido}`
    }

    this.api.nuevoRetorno(data)
      .subscribe((resp: any) => {
        this.onRestar.emit();
        this.selected;
        this.onCloseModal.emit()

        Swal.fire({
          text: 'Retorno de material a almacenes de Poligrafica solicitado',
          icon: 'success',
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true
        })
      })
  }

  constructor(public api: RestApiService) { }

  ngOnInit(): void {
    this.cargarAlmacenExterno();
  }

  cargarAlmacenExterno() {
    if (this.AlmacenExterno.length <= 0) {
      this.CargarAlmExterno.emit()
    }
  }

  cerrar() {
    this.onCloseModal.emit()
  }

  resumirMaterialesExteriorires(lista: any[], grupoId: string) {
    const busqueda = this.filtros[grupoId]?.toLowerCase() || "";

    // 1. Filtrar antes de agrupar 
    if (busqueda.trim()) {
      lista = lista.filter(item => {
        const m = item.material;
        return (
          m.nombre?.toLowerCase().includes(busqueda) ||
          m.marca?.toLowerCase().includes(busqueda)
        );
      });
    }

    // 2. Agrupar igual que antes
    const mapa = new Map();

    for (const item of lista) {
      const m = item.material;

      const clave = [
        m.nombre,
        m.marca,
        m.calibre,
        m.gramaje,
        m.ancho,
        m.largo
      ].join('|');

      if (mapa.has(clave)) {
        mapa.get(clave).cantidad += parseFloat(item.cantidad);
      } else {
        mapa.set(clave, {
          nombre: m.nombre,
          marca: m.marca,
          calibre: m.calibre,
          gramaje: m.gramaje,
          ancho: m.ancho,
          largo: m.largo,
          cantidad: parseFloat(item.cantidad)
        });
      }
    }

    // 3. Ordenamiento (igual que antes)
    let arr = Array.from(mapa.values());

    arr.sort((a, b) => {
      const campo = this.ordenCampoResumido;
      let valA = a[campo];
      let valB = b[campo];

      if (campo === 'cantidad') {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = valA?.toString().toLowerCase();
        valB = valB?.toString().toLowerCase();
      }

      if (valA < valB) return this.ordenDireccionResumido === 'asc' ? -1 : 1;
      if (valA > valB) return this.ordenDireccionResumido === 'asc' ? 1 : -1;
      return 0;
    });

    return arr;
  }

}
