import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { zip } from 'rxjs';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalles',
  templateUrl: './detalles.component.html',
  styleUrls: ['./detalles.component.css']
})
export class DetallesComponent implements OnChanges {

  @Input() detalle: any
  @Input() orden_detalle: any
  @Input() orden_id: any
  @Input() cantidad_d: any
  @Input() cantidad_do: any
  @Input() ejemplares_montados: any
  @Output() onCloseModal = new EventEmitter();
  @Output() CargarOrdenes = new EventEmitter();

  public trabajos;
  public gestiones_;
  public cargando: boolean = true;
  public detallado: boolean = false;
  public despachos = [];
  /**
   * Total de despachos mostrados en la tabla, sin duplicar N y F relacionados.
   */
  public despacho = 0;
  /**
   * Devuelve el listado de despachos a mostrar en la tabla según la lógica:
   * - Si hay al menos un despacho con documento que inicia en 'N', solo se muestran los que inician en 'N'.
   * - Si no hay ninguno con 'N', se muestran los que inician en 'F'.
   * - Si no hay ni 'N' ni 'F', se muestran todos.
   */
  /**
   * Devuelve el listado de despachos a mostrar en la tabla según la lógica:
   * - Si hay al menos un despacho con documento que inicia en 'N', solo se muestran los que inician en 'N'.
   * - Si no hay ninguno con 'N', se muestran los que inician en 'F'.
   * - Si no hay ni 'N' ni 'F', se muestran todos.
   *
   * @returns Array de despachos filtrados para mostrar en la tabla.
   */
  /**
   * Devuelve el listado de despachos a mostrar en la tabla según la lógica:
   * - Si hay al menos un despacho con documento que inicia en 'N', solo se muestran los que inician en 'N'.
   * - Si no hay ninguno con 'N', se muestran los que inician en 'F'.
   * - Si no hay ni 'N' ni 'F', se muestran todos.
   * Además, incluye el despacho siguiente (index+1) de cada elemento mostrado, sin importar condiciones.
   *
   * @returns Array de despachos filtrados para mostrar en la tabla.
   */
  getDespachosFiltrados() {
    console.log(this.despachos)
    if (!Array.isArray(this.despachos)) return [];
    // Marcar facturas asociadas a notas por cantidad
    const facturasAsociadas = new Set();
    const notasIdx = [];
    const facturasIdx = [];
    this.despachos.forEach((d, idx) => {
      if (d?.documento?.startsWith('N')) notasIdx.push(idx);
      if (d?.documento?.startsWith('F')) facturasIdx.push(idx);
    });
    // Para cada nota, buscar la factura con la misma cantidad y marcarla como asociada
    notasIdx.forEach(nIdx => {
      const nota = this.despachos[nIdx];
      const fIdx = facturasIdx.find(idx => {
        const factura = this.despachos[idx];
        return Number(factura.cantidad) === Number(nota.cantidad) && !facturasAsociadas.has(idx);
      });
      if (fIdx !== undefined) {
        facturasAsociadas.add(fIdx);
      }
    });
    // Construir la lista base: todas las notas y las facturas no asociadas
    let baseList = [];
    baseList.push(...notasIdx);
    baseList.push(...facturasIdx.filter(idx => !facturasAsociadas.has(idx)));
    // Si no hay notas ni facturas, mostrar todos
    if (baseList.length === 0) {
      baseList = this.despachos.map((_, idx) => idx);
    }
    // Agregar el siguiente despacho (index+1) de cada uno mostrado, sin duplicar
    const indicesSet = new Set<number>();
    baseList.forEach((idx: number) => {
      indicesSet.add(idx);
      if (typeof idx === 'number' && idx + 1 < this.despachos.length) {
        indicesSet.add(idx + 1);
      }
    });
    // Ordenar los índices para mantener el orden original
    const indices: number[] = Array.from(indicesSet).filter(i => typeof i === 'number').sort((a, b) => a - b);
    return indices.map((idx: number) => this.despachos[idx]);
  }

  /**
   * Calcula el total de despachos a mostrar, evitando duplicados N+F.
   * Suma solo los despachos filtrados según la lógica de getDespachosFiltrados.
   */
  /**
   * Calcula el total de despachos a mostrar, evitando duplicados N+F.
   * Suma solo los despachos filtrados según la lógica de getDespachosFiltrados.
   *
   * @returns Número total de productos despachados según el filtro aplicado.
   */
  getTotalDespacho(): number {
    return this.getDespachosFiltrados().reduce((sum, d) => sum + (Number(d.cantidad) || 0), 0);
  }
  public usuario;
  public Maquinas;


  /**
   * Busca la factura asociada a un despacho que comienza con 'N'.
   *
   * Este método recibe el índice de un despacho dentro del arreglo 'despachos'.
   * Primero, verifica que el elemento en esa posición exista, que tenga el campo 'documento',
   * y que dicho documento comience con la letra 'N'. Si alguna de estas condiciones no se cumple,
   * retorna una cadena vacía como medida de seguridad para evitar errores.
   *
   * Si el despacho es válido, busca a partir de la posición siguiente (i > index) el primer despacho
   * cuyo documento comience con 'F', que representa una factura relacionada. Utiliza 'find' para obtener
   * el primer elemento que cumpla con esa condición.
   *
   * Si encuentra una factura, retorna una cadena con el número de documento y, si existe, el campo 'parcial';
   * si no, muestra la fecha. Si no encuentra ninguna factura, retorna 'N/A'.
   *
   * @param index Índice del despacho con documento que inicia en 'N'.
   * @returns Cadena con la factura asociada o 'N/A' si no existe.
   */
  getFacturaParaN(despacho: any): string {
    // Verifica que el despacho actual exista y que su documento comience con 'N'.
    if (!despacho || !despacho.documento || !despacho.documento.startsWith('N')) return '';
    // Busca una factura con la misma cantidad en todo el arreglo
    const factura = Array.isArray(this.despachos)
      ? this.despachos.find((d) => d?.documento?.startsWith('F') && Number(d.cantidad) === Number(despacho.cantidad))
      : null;
    // Si encuentra una factura, retorna el documento y el campo parcial o la fecha; si no, retorna 'N/A'.
    return factura ? `${factura.documento} / ${factura.parcial || factura.fecha}` : 'N/A';
  }

  /**
   * Indica si existe al menos un despacho cuyo documento comience con 'N'.
   *
   * Recorre el arreglo 'despachos' y utiliza 'some' para verificar si hay algún elemento
   * cuyo campo 'documento' comience con la letra 'N'. Si encuentra al menos uno, retorna true;
   * de lo contrario, retorna false.
   *
   * @returns true si hay despachos con documento que inicia en 'N', false en caso contrario.
   */
  tieneDespachosN(): boolean {
    return this.despachos.some(d => d?.documento?.startsWith('N'));
  }

  constructor(private api: RestApiService) {
    this.usuario = api.usuario;
  }

  /**
   * Detecta cambios en las propiedades de entrada del componente.
   * Si cambia 'detalle' y tiene valor, ejecuta la carga de gestiones y despachos.
   *
   * @param changes Cambios detectados en las propiedades @Input.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['detalle'] && this.detalle) {
      this.gestiones(); // Se ejecuta apenas se abra la modal
    }
  }

  /**
   * Calcula el total de hojas y productos gestionados para un tipo de máquina específico.
   *
   * @param tipo Tipo de máquina a filtrar.
   * @returns Objeto con la suma de hojas y productos gestionados para ese tipo.
   */
  getTotalesPorTipo(tipo: string): { hojas: number, productos: number } {
    console.log(this.gestiones_)
    const filtradas = this.gestiones_.filter(g => g.maquina.tipo === tipo && g.op === this.orden_id);
    const hojas = filtradas.reduce((sum, g) => sum + Number(g.hojas || 0), 0);
    const productos = filtradas.reduce((sum, g) => sum + Number(g.productos || 0), 0);
    return { hojas, productos };
  }


  /**
   * Cambia la fecha o el valor de un campo específico de un trabajo y lo actualiza en el backend.
   *
   * @param dato Nuevo valor a asignar.
   * @param trabajo ID del trabajo a actualizar.
   * @param campo Nombre del campo a modificar.
   */
  cambiarFecha(dato, trabajo, campo: string) {
    this.api.updateTrabajo(trabajo, { [campo]: dato })
      .subscribe((resp: any) => {
        // Respuesta ignorada, pero podría usarse para feedback.
      })
  }

  /**
   * Formatea un número a entero y lo devuelve con formato de miles (de-DE).
   *
   * @param n Número a formatear.
   * @returns Cadena con el número formateado.
   */
  format(n) {
    n = Math.ceil(n);
    return n = new Intl.NumberFormat('de-DE').format(n)
  }

  /**
   * Finaliza la edición de una gestión, mostrando los datos en modo solo lectura y enviando los cambios al backend.
   *
   * @param i Índice de la gestión a finalizar.
   */
  Finalizar(i) {
    // Cambia la visualización de los campos a modo solo lectura
    document.getElementById(`dato_hoja_${i}`).style.display = 'block'
    document.getElementById(`dato_producto_${i}`).style.display = 'block'
    document.getElementById(`edicion_${i}`).style.display = 'block'
    document.getElementById(`dato_fecha_${i}`).style.display = 'block'
    document.getElementById(`productos_${i}`).style.display = 'none'
    document.getElementById(`hojas_${i}`).style.display = 'none'
    document.getElementById(`finalizar_${i}`).style.display = 'none'
    document.getElementById(`fecha_${i}`).style.display = 'none'

    // Filtra las gestiones del mismo tipo de máquina
    let gestiones = this.gestiones_.filter(x => x.maquina.tipo == this.gestiones_[i].maquina.tipo)

    // Envía los cambios al backend y muestra un mensaje de éxito
    this.api.PostEditarGestiones(gestiones)
      .subscribe((resp: any) => {
        Swal.fire({
          title: 'gestión editada con exito',
          toast: true,
          icon: 'success',
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 1500,
          position: 'top-end',
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })
      })
  }

  /**
   * Cambia la fecha de una gestión en el arreglo local.
   *
   * @param e Nueva fecha seleccionada.
   * @param i Índice de la gestión a modificar.
   */
  chage_date(e, i) {
    this.gestiones_[i].fecha = e;
  }

  /**
   * Habilita la edición de una gestión, mostrando los campos editables en la interfaz.
   *
   * @param i Índice de la gestión a editar.
   */
  editar_gestion(i) {
    document.getElementById(`dato_hoja_${i}`).style.display = 'none'
    document.getElementById(`dato_producto_${i}`).style.display = 'none'
    document.getElementById(`edicion_${i}`).style.display = 'none'
    document.getElementById(`dato_fecha_${i}`).style.display = 'none'
    document.getElementById(`productos_${i}`).style.display = 'block'
    document.getElementById(`hojas_${i}`).style.display = 'block'
    document.getElementById(`finalizar_${i}`).style.display = 'block'
    document.getElementById(`fecha_${i}`).style.display = 'block'
    // Mensaje de desarrollo comentado
  }

  /**
   * Carga todos los datos necesarios para mostrar el detalle de la orden:
   * trabajos, gestiones, despachos y máquinas.
   * Activa el modo detallado en la vista.
   */
  gestiones() {
    this.buscarTrabajos();
    this.buscarGestiones();
    this.buscarDespachos();
    this.BuscarMaquinas();
    this.detallado = true;
  }

  /**
   * Calcula la diferencia entre dos valores, retornando 0 si el resultado es negativo.
   *
   * @param a Valor total.
   * @param b Valor a restar.
   * @returns Diferencia positiva o 0.
   */
  restan(a, b) {
    let c = a - b;
    if (c < 0) {
      return 0
    } else {
      return c
    }
  }

  /**
   * Solicita confirmación para cerrar la orden de producción.
   * Si el usuario confirma, llama al backend para cerrar la orden,
   * recarga la lista de órdenes y muestra un mensaje de éxito.
   */
  cerrarOrden() {
    Swal.fire({
      title: '¿Cerrar orden de producción?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Cerrar',
      denyButtonText: `No cerrar`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.CerrarOrden(this.orden_id)
          .subscribe((resp: any) => {
            this.CargarOrdenes.emit();
            this.onClose()
            Swal.fire('¡Cerrada!', '', 'success')
          })
      } else if (result.isDenied) {
        Swal.fire('La orden no fué cerrada', '', 'info')
      }
    })
  }

  /**
   * Obtiene los despachos asociados a la orden desde el backend y los almacena en el arreglo local.
   * También agrega registros de fecha o parcial para visualización.
   */
  buscarDespachos() {
    this.cargando = true;
    this.api.GetDespachoByOrden(this.orden_detalle)
      .subscribe((resp: any) => {
        this.despachos = [];
        for (let i = 0; i < resp.length; i++) {
          for (let y = 0; y < resp[i].despacho.length; y++) {
            if (resp[i].despacho[y].op === this.orden_detalle) {
              this.despachos.push(resp[i].despacho[y]);
              if (resp[i].despacho[y].parcial) {
                this.despachos.push({ fecha: resp[i].despacho[y].parcial });
              } else {
                this.despachos.push({ fecha: resp[i].fecha });
              }
            }
          }
        }
        this.cargando = false;
      });
  }

  /**
   * Obtiene las gestiones asociadas a la orden desde el backend y las almacena en el arreglo local.
   */
  buscarGestiones() {
    this.api.getGestionesByOp(this.orden_id)
      .subscribe((resp: any) => {
        this.gestiones_ = resp;
      })
  }

  /**
   * Muestra una alerta con el valor recibido (función placeholder para cambio de máquina).
   *
   * @param e Valor seleccionado.
   */
  CambioDeMaquina(e) {
    alert(e)
  }

  /**
   * Cambia la cantidad de hojas gestionadas para una gestión y recalcula los productos asociados.
   * También actualiza los valores restantes (Rhojas y Rproductos) para todas las gestiones del mismo tipo de máquina.
   *
   * @param e Nueva cantidad de hojas.
   * @param i Índice de la gestión a modificar.
   */
  change_hojas(e, i) {
    // Calcular productos por hoja
    let pph = this.ejemplares_montados
    this.gestiones_[i].hojas = e;
    this.gestiones_[i].productos = pph * e;

    let gestionesXtipo = this.gestiones_.filter(x => x.maquina.tipo == this.gestiones_[i].maquina.tipo)

    for (let n = 0; n < gestionesXtipo.length; n++) {
      let productos = this.cantidad_d
      let hojas = Math.ceil(productos / this.ejemplares_montados)

      if (n == 0) {
        let index = this.gestiones_.findIndex(x => x._id === gestionesXtipo[n]._id)
        this.gestiones_[index].Rhojas = hojas - this.gestiones_[index].hojas
        this.gestiones_[index].Rproductos = productos - this.gestiones_[index].productos
      } else {
        let index = this.gestiones_.findIndex(x => x._id === gestionesXtipo[n]._id)
        let anterior = this.gestiones_.findIndex(x => x._id === gestionesXtipo[n - 1]._id)

        this.gestiones_[index].Rhojas = this.gestiones_[anterior].Rhojas - this.gestiones_[index].hojas
        this.gestiones_[index].Rhojas = Math.ceil(this.gestiones_[index].Rhojas)
        this.gestiones_[index].Rproductos = this.gestiones_[anterior].Rproductos - this.gestiones_[index].productos
        this.gestiones_[index].Rproductos = Math.ceil(this.gestiones_[index].Rproductos)
      }
    }
  }

  /**
   * Cambia la cantidad de productos gestionados para una gestión y recalcula las hojas asociadas.
   * También actualiza los valores restantes (Rhojas y Rproductos) para todas las gestiones del mismo tipo de máquina.
   *
   * @param e Nueva cantidad de productos.
   * @param i Índice de la gestión a modificar.
   */
  change_productos(e, i) {
    this.gestiones_[i].productos = e;
    this.gestiones_[i].hojas = e / this.ejemplares_montados;
    this.gestiones_[i].hojas = Math.ceil(this.gestiones_[i].hojas)

    let gestionesXtipo = this.gestiones_.filter(x => x.maquina.tipo == this.gestiones_[i].maquina.tipo)
    for (let n = 0; n < gestionesXtipo.length; n++) {
      let productos = this.cantidad_d
      let hojas = Math.ceil(productos / this.ejemplares_montados)

      if (n == 0) {
        let index = this.gestiones_.findIndex(x => x._id === gestionesXtipo[n]._id)
        this.gestiones_[index].Rhojas = hojas - this.gestiones_[index].hojas
        this.gestiones_[index].Rproductos = productos - this.gestiones_[index].productos
      } else {
        let index = this.gestiones_.findIndex(x => x._id === gestionesXtipo[n]._id)
        let anterior = this.gestiones_.findIndex(x => x._id === gestionesXtipo[n - 1]._id)

        this.gestiones_[index].Rhojas = this.gestiones_[anterior].Rhojas - this.gestiones_[index].hojas
        this.gestiones_[index].Rhojas = Math.ceil(this.gestiones_[index].Rhojas)
        this.gestiones_[index].Rproductos = this.gestiones_[anterior].Rproductos - this.gestiones_[index].productos
        this.gestiones_[index].Rproductos = Math.ceil(this.gestiones_[index].Rproductos)
      }
    }
  }

  /**
   * Obtiene los trabajos (máquinas asociadas a la orden) desde el backend y los almacena en el arreglo local.
   */
  buscarTrabajos() {
    this.api.getMaquinasByOrdens(this.orden_id)
      .subscribe((resp: any) => {
        this.trabajos = resp.maquinasDB;
      })
  }

  /**
   * Obtiene el listado de todas las máquinas disponibles desde el backend y lo almacena en el arreglo local.
   */
  BuscarMaquinas() {
    this.api.GetMaquinas()
      .subscribe((resp: any) => {
        this.Maquinas = resp
      })
  }

  /**
   * Cierra la vista de detalle, limpia los datos temporales y emite el evento de cierre.
   */
  onClose() {
    this.detalle = false;
    this.detallado = false;
    this.despachos = [];
    this.despacho = 0;
    this.onCloseModal.emit();
  }

}
