import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-traspasos-new',
  templateUrl: './traspasos-new.component.html',
  styleUrls: ['./traspasos-new.component.css']
})
export class TraspasosNewComponent implements OnInit {


  public ID_GRUPO_SUSTRATO = '61f92a1f2126d717f004cca6'

  @Input() materiales: any
  @Input() traslados: any
  @Output() onReset = new EventEmitter()
  @Output() onCloseModal = new EventEmitter()

  public m_selected = ''
  public almacen_selected = ''
  public observacion = ''
  public almacenado_para_transferir = []
  public usuario

  constructor(public api: RestApiService) {
    this.usuario = api.usuario
  }

  ngOnInit(): void {

  }



  public ordenCampoResumido: any = ''
  public filtros: any = ''
  public ordenDireccionResumido = 'asc'
  public productos_seleccionados = []


  BuscarMaterialSelected(e) {
    let sustrato = JSON.parse(e.value)

    this.almacenado_para_transferir = this.materiales[this.ID_GRUPO_SUSTRATO].filter((m: any) => m.material.nombre === sustrato.nombre && m.material.gramaje === sustrato.gramaje && m.material.calibre === sustrato.calibre && m.material.ancho === sustrato.ancho && m.material.largo === sustrato.largo && m.material.marca === sustrato.marca)
  }

  resumirMateriales(lista: any[], grupoId: string) {
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


  toggleSeleccionProducto(producto: any, event: any) {
    if (event.target.checked) {
      // Agregar a la lista
      this.productos_seleccionados.push(producto);
    } else {
      // Quitar de la lista
      this.productos_seleccionados = this.productos_seleccionados.filter(
        (p) => p._id !== producto._id // usa un campo único para identificar
      );
    }
    console.log('Seleccionados:', this.productos_seleccionados);
  }

  cerrar() {
    this.onCloseModal.emit()
  }

  Transferir() {
    // Antes de enviar, agrega la propiedad "almacen" a cada producto
    const productosAEnviar = this.productos_seleccionados.map(producto => ({
      ...producto,
      almacen: this.almacen_selected,
      observacion: this.observacion
    }));

    // CREAR PDF:::::::::::::::::::::::::::::::::::.
    const data = {
      destino: this.almacen_selected,
      numero: '',
      materiales: productosAEnviar,
      observacion: this.observacion,
      solicitado: `${this.usuario.Nombre} ${this.usuario.Apellido}`,
    }

    console.log(data)


    // CREAR PDF:::::::::::::::::::::::::::::::::::.

    // Ahora envía el array modificado
    this.api.InsertarVariosAAlmacenExterior(data)
      .subscribe((resp: any) => {
        // this.NotaSalida(resp.traslado)
        this.cerrar();
        this.onReset.emit()
        this.productos_seleccionados = []
        this.m_selected = ''
        this.traslados = false
        Swal.fire({
          text: `Se traslado material a ${this.almacen_selected}`,
          icon: 'success',
          toast: true,
          showConfirmButton: false,
          position: 'top-end',
          timer: 5000,
          timerProgressBar: true
        })
      });
  }

}
