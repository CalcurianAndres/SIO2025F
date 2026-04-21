import { Component, OnInit } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cortes-inventario',
  templateUrl: './cortes-inventario.component.html',
  styleUrls: ['./cortes-inventario.component.css']
})
export class CortesInventarioComponent implements OnInit {

  cortesHistoricos: any[] = [];
  idCorteSeleccionado: string = '';

  comparativaConsolidada: any[] = [];
  comparativaDetallada: any[] = [];
  infoCorte: any = null;
  loading: boolean = false;

  constructor(private _almacenService: RestApiService) { }

  ngOnInit() {
    this.cargarHistorico();
  }

  descargarExcel() {
    if (!this.idCorteSeleccionado) return;
    const url = `${this._almacenService.api_url}/snapshot/excel-comparativa/${this.idCorteSeleccionado}`;
    window.open(url, '_blank');
  }

  cargarHistorico() {
    this._almacenService.obtenerHistoricoCortes().subscribe(res => {
      this.cortesHistoricos = res.historico;
    });
  }

  ejecutarCorteNuevo() {
    const etiqueta = prompt("Nombre para este corte (ej: Cierre Abril 2026):");
    if (!etiqueta) return;

    this.loading = true;
    this._almacenService.generarCorte(etiqueta).subscribe(res => {
      Swal.fire({
        text: 'Corte de inventario generado exitosamente',
        icon: 'success',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end'
      })
      this.cargarHistorico();
      this.loading = false;
    });
  }

  consultarComparativa() {
    if (!this.idCorteSeleccionado) return;

    this.loading = true;
    this._almacenService.compararCorte(this.idCorteSeleccionado).subscribe(res => {
      this.comparativaConsolidada = res.comparativaConsolidada;
      this.comparativaDetallada = res.comparativaDetallada;
      this.infoCorte = res.infoCorte;
      this.loading = false;
      console.log(this.comparativaConsolidada)
    });
  }

  // En tu clase CorteInventarioComponent
  selectedConsolidadoId: string | null = null;
  filtroBusqueda: string = '';

  // Función para seleccionar/deseleccionar un item del consolidado
  toggleDetalle(item: any) {
    // Generamos una llave única similar a la del backend para filtrar el detallado
    const llave = `${item.materialId}-${item.marca}-${item.especificaciones}`;
    this.selectedConsolidadoId = (this.selectedConsolidadoId === llave) ? null : llave;
  }

  // Función para obtener el detallado filtrado y ordenado
  get detalladoFiltrado() {
    let lista = this.comparativaDetallada;

    // 1. Si hay un item seleccionado en el consolidado, filtramos por sus propiedades
    if (this.selectedConsolidadoId) {
      lista = lista.filter(d => {
        const espec = `(${d.ancho}x${d.largo} ${d.gramaje}g ${d.calibre}pt)`.replace(/\s+/g, ' ').trim();
        const llaveItem = `${d.materialId}-${d.marca}-${espec}`;
        return llaveItem === this.selectedConsolidadoId;
      });
    }

    // 2. Filtro de búsqueda por texto (nombre, código o lote)
    if (this.filtroBusqueda) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      lista = lista.filter(d =>
        d.nombre.toLowerCase().includes(busqueda) ||
        d.codigo.toLowerCase().includes(busqueda) ||
        d.lote.toLowerCase().includes(busqueda)
      );
    }

    // 3. Ordenar alfabéticamente por nombre y luego por código
    return lista.sort((a, b) => {
      if (a.nombre.toLowerCase() < b.nombre.toLowerCase()) return -1;
      if (a.nombre.toLowerCase() > b.nombre.toLowerCase()) return 1;
      return a.codigo.localeCompare(b.codigo);
    });
  }


  itemsAbiertos: { [key: string]: boolean } = {};

  toggleAcordeon(llaveLogica: string) {
    // Ahora cerramos todos y abrimos solo el seleccionado (o lo cerramos si ya estaba abierto)
    const estadoActual = !!this.itemsAbiertos[llaveLogica];
    this.itemsAbiertos = {}; // Opcional: limpia otros para que sea un acordeón real
    this.itemsAbiertos[llaveLogica] = !estadoActual;
  }

  obtenerLotesDeItem(itemConsolidado: any) {
    // Filtramos el detallado usando la misma lógica de construcción de llave
    return this.comparativaDetallada.filter(d => {
      const llaveDetalle = `${d.materialId}-${d.marca}-${d.gramaje}-${d.calibre}-${d.ancho}-${d.largo}`;
      return llaveDetalle === itemConsolidado.llaveLogica;
    }).sort((a, b) => a.codigo.localeCompare(b.codigo));
  }


}
