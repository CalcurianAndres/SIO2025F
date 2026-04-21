import * as moment from 'moment';
import { Cell, Img, Line, PdfMakeWrapper, Table, Txt } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts";

import {
  Component,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy,
  Input,
  Renderer2,
  HostListener
} from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
interface Material {
  nombre: string;
  precio: number;
  grupo?: { nombre: string };
  fecha?: string;
}

@Component({
  selector: 'app-cotizacion-carrousel',
  templateUrl: './cotizacion.component.html',
  styleUrls: ['./cotizacion.component.css']
})


export class CotizacionCarrouselComponent implements AfterViewInit {


  public numero_tintas = 0
  public sustrato: any = []
  public grupos: any = []
  public maquinas: any = []
  public gruposMP: any = []
  public materiales: any = []

  public sustrato_selected = ''
  public grupo_selected = ''
  public grupo_selected2 = ''
  public Materiales_Agregados: any[] = []
  public material_selected: any;
  public cantidad_added = 0

  public cantidad_escalas = 0
  public cantidad_desperdicio = []
  public cantidad_por_escala: number[] = []
  public maquinas_selected: any[] = []

  public ejemplares = 0
  public kilos_tintas = 0
  public cantidad_planchas = 0
  public planchas_precio = 0
  public planchas: any
  public cajas_utilizar: any = []

  public metros_cinta_necesarios: any = []

  public barniz_existente = 0

  public precio_transporte = 300
  public division = 1000
  public otro = 0

  public precios = {
    sustrato: 0,
    tinta: 0,
    maquinas: []
  }

  precios_transporte: number[] = []
  public Clientes = []

  public cliente_selected = ''
  public producto = []
  public _producto = {
    producto: ''
  }
  public producto_selected = ''
  public aumento_sustrato = 0;
  public condicion_pago = 'Crédito 15 días a partir de la fecha de entrega.'
  public almacen_selected = ''
  public dias_validez = 7
  public nota = 'Este precio no incluye costo de troquel ni de las peliculas para su impresión, se puede pagar por separado o amortizarlos en la primera corrida, según su conveniencia.'

  ngOnInit(): void {

    this.getMateriales()
    this.getSustratos()
    this.getGrupos()
    this.getMaquinas()
    this.GetGrupoMp()
    this.getTintas()
    this.buscarPlancha()
    this.ObtenerClientes()
  }

  constructor(private renderer: Renderer2, private api: RestApiService) { }

  margenGanancia: number = 20; // porcentaje por defecto

  margenGananciaMaquinas: number = 20; // valor inicial

  public Cliente_selected: any = ''
  ObtenerElCliente() {
    this.Cliente_selected = this.Clientes.find((c: any) => c._id === this.cliente_selected)
  }

  ObtenerClientes() {
    this.api.GetClientes()
      .subscribe((response: any) => {
        console.log(response)
        this.Clientes = response.clientes;
      })
  }

  getProductos(cliente: string) {
    this.api.getById(cliente)
      .subscribe((response: any) => {
        console.log(response, '=> productos')
        this.producto = response.productos
      });
  }

  UpdatePreciosTransporte() {
    this.precios_transporte = this.syncPrecios(this.precios_transporte);
  }

  getSumaPorEscala(i: number): number {
    return this.getTotalConMargen(i) + this.getTotalMaquinasConMargen(i);
  }

  getGranTotalSuma(): number {
    let total = 0;
    for (let i = 0; i < this.cantidad_escalas; i++) {
      total += this.getSumaPorEscala(i);
    }
    return total;
  }



  getTotalMaquinasPorEscala(i: number): number {
    let total = 0;
    this.maquinas_selected.forEach((maq, y) => {
      const data = this.calcularPreciosMaquina(this.cantidad_por_escala[i], y, i);
      total += data.precio;
    });
    return total + this.maquinaLitografica().precio;
  }

  getTotalMaquinasConMargen(i: number): number {
    const total = this.getTotalMaquinasPorEscala(i);
    return total + (total * this.margenGananciaMaquinas / 100);
  }


  getTotalConMargen(i: number): number {
    const total = this.getTotalPorEscala(i);
    return total + (total * this.margenGanancia / 100);
  }


  getTotalPorEscala(i: number): number {
    let total = 0;

    // Planchas (si aplica)
    if (this.planchas) {
      total += this.calcularPlanchas();
    }

    // Tinta
    const tinta = this.calcularPrecioTinta(this.cantidad_por_escala[i], i);
    total += tinta.precio;

    // Sustrato
    const sustrato = this.calculoPrecioSustrato(this.cantidad_por_escala[i], i);
    total += sustrato.precio;

    // Materiales agregados
    this.Materiales_Agregados.forEach((mat, m) => {
      const material = this.calculoPrecioMaterial(this.cantidad_por_escala[i], m);
      total += material.precio;
    });

    return total;
  }
  onDesperdicioChange(event: any, i: number) {
    const input = event.target;
    let value = input.value;

    // 1. Guardar posición del cursor
    const selectionStart = input.selectionStart;
    const dotsBefore = (value.substring(0, selectionStart).match(/\./g) || []).length;

    // 2. Limpiar el valor (quitar puntos) y convertir a número
    const cleanValue = value.replace(/\./g, '');
    const numValue = Number(cleanValue) || 0;

    // 3. Actualizar tu array de desperdicio
    this.cantidad_desperdicio[i] = numValue;

    // 4. Formatear visualmente el input
    const formatted = this.formatNumber(numValue);
    input.value = formatted;

    // 5. Ajustar posición del cursor tras el formateo
    const dotsAfter = (formatted.substring(0, selectionStart).match(/\./g) || []).length;
    const diff = dotsAfter - dotsBefore;
    const newPosition = selectionStart + diff;
    input.setSelectionRange(newPosition, newPosition);

    // 6. Disparar cálculos automáticos
    // El desperdicio suele afectar materiales y planchas
    this.calcularPreciosMateriales(this.cantidad_por_escala[i], i);
    this.planchas_precio = this.calcularPlanchas();
  }

  // Se ejecuta cada vez que cambia el input
  onInputChange(event: any, i: number) {
    const input = event.target;
    let value = input.value;

    // 1. Guardar posición del cursor y contar cuántos puntos hay antes
    const selectionStart = input.selectionStart;
    const dotsBefore = (value.substring(0, selectionStart).match(/\./g) || []).length;

    // 2. Limpiar y guardar el número real
    const cleanValue = value.replace(/\./g, '');
    const numValue = Number(cleanValue) || 0;
    this.cantidad_por_escala[i] = numValue;

    // 3. Formatear para mostrar
    const formatted = this.formatNumber(numValue);
    input.value = formatted;

    // 4. Calcular nueva posición del cursor
    const dotsAfter = (formatted.substring(0, selectionStart).match(/\./g) || []).length;
    const diff = dotsAfter - dotsBefore;

    const newPosition = selectionStart + diff;
    input.setSelectionRange(newPosition, newPosition);

    // 5. Ejecutar tus cálculos de SIO
    this.ejecutarCalculos(numValue, i);
  }

  // Función auxiliar para no repetir código
  ejecutarCalculos(valor: number, i: number) {
    this.calcularPreciosMaquina(valor, i, i);
    this.calcularPreciosMateriales(valor, i);
    this.planchas_precio = this.calcularPlanchas();
  }

  calculoPrecioSustrato(cantidad: number, i: number) {
    let hojas_a_usar = (cantidad / this.ejemplares) + this.cantidad_desperdicio[i];
    let precio_neto = (this.precios.sustrato * hojas_a_usar);
    return { cantidad: hojas_a_usar, precio: precio_neto };
  }

  calcularPrecioTinta(cantidad: number, i: number) {

    // CALCULAR CUANTAS HOJAS SE NECESITAN
    let hojas = Math.ceil((cantidad / this.ejemplares) + this.cantidad_desperdicio[i]);

    //Calcular consumido por hoja
    let cantidad_por_1000 = this.kilos_tintas
    let cantidad_por_hoja = cantidad_por_1000 / 1000;

    // calcular consumo por total de hojas
    let cantidad_necesaria = cantidad_por_hoja * hojas;

    // Calcular Precio
    let precio_ultimo = this.precios.tinta;
    let precio_final = cantidad_necesaria * precio_ultimo

    return { precio: precio_final, cantidad: cantidad_necesaria };
  }

  /**
   * 🧮 calcularPreciosMaquina
   *
   * 🔎 ¿Qué hace?
   *   - Calcula las horas de máquina necesarias y el precio neto para la máquina
   *     indicada por el índice `i`, según la `cantidad` solicitada.
   *
   * 🧭 Lógica:
   *   1. Calcula `hojas_a_usar = (cantidad / this.ejemplares) + this.cantidad_desperdicio`.
   *   2. Por defecto: horas = hojas_a_usar / cph.
   *      Para máquinas de tipo especial (TROQUELAR, CORTAR, DOBLAR Y PEGAR, REVISAR Y ENFAJILLAR)
   *      las horas se calculan como: horas = cantidad / cph
   *   3. Redondea las horas al paso de 0.5 más cercano (ej: 1.10 → 1.0, 1.30 → 1.5).
   *   4. Impone un mínimo de **1 hora** (si el resultado redondeado < 1, se usa 1).
   *   5. Recalcula precio_neto = tarifa * horasRedondeadas.
   *
   * 🔢 Ejemplos:
   *   - horas reales = 1.10 → redondeo = 1.0 → horas devueltas = 1
   *   - horas reales = 1.30 → redondeo = 1.5 → horas devueltas = 1.5
   *
   * ⚠️ Notas:
   *   - Si `cph` es 0 o inválido, la función devuelve { precio: 0, cantidad: 0 } y muestra un warning.
   *   - Devuelve un objeto { precio: number, cantidad: number } donde `cantidad` = horas redondeadas.
   */
  calcularPreciosMaquina(cantidad: number, i: number, y: number) {
    // valores base
    const hojas_a_usar = (cantidad / this.ejemplares) + this.cantidad_desperdicio[y];
    const maquina: any = this.maquinas_selected[i];

    console.log(this.cantidad_desperdicio, '=> cantidad_desperdicio[y]', this.cantidad_desperdicio[y])
    console.log(`calcularPreciosMaquina: entrada => cantidad=${cantidad}, ejemplares=${this.ejemplares}, desperdicio=${this.cantidad_desperdicio[y]}, hojas_a_usar=${hojas_a_usar}`);
    console.log(`calcularPreciosMaquina: cantidad=${cantidad}, hojas_a_usar=${hojas_a_usar}, máquina index ${i} =>`, maquina);

    // guardas y parseos seguros
    const cph = Number(maquina?.cph) || 0;
    const tarifa = Number(maquina?.precio) || 0;

    console.log(`calcularPreciosMaquina: cph=${cph}, tarifa=${tarifa}`);

    // validación: evitar división por cero
    if (cph <= 0) {
      console.warn(`calcularPreciosMaquina: cph inválido para la máquina index ${i} (cph=${maquina?.cph})`);
      return { precio: 0, cantidad: 0 };
    }

    // helper para redondear al .5 más cercano
    const roundToNearestHalf = (v: number) => Math.round(v * 2) / 2;

    // tipos que usan la fórmula alternativa
    const tiposEspeciales = ['CORTAR', 'DOBLAR Y PEGAR', 'REVISAR Y ENFAJILLAR'];

    // cálculo de horas según tipo
    let horas = tiposEspeciales.includes(maquina?.tipo)
      ? (cantidad / cph)
      : (hojas_a_usar / cph);

    console.log(`calcularPreciosMaquina: horas sin redondear=${horas}`);

    // redondeo y mínimo 1
    let horasRedondeadas = roundToNearestHalf(horas);
    if (horasRedondeadas < 1) horasRedondeadas = 1;

    horasRedondeadas = horasRedondeadas + (Number(maquina?.reparacion) || 0);

    // recalculamos precio con las horas redondeadas
    const precio_neto = tarifa * horasRedondeadas;

    // devolvemos precio con 2 decimales y la cantidad de horas
    return { precio: Number(precio_neto.toFixed(2)), cantidad: horasRedondeadas };
  }


  calculoPrecioMaterial(cantidad: number, i: any, n?: any) {

    let material = this.Materiales_Agregados[i].material
    let grupo = material.grupo.nombre
    let paquetes = 1

    // CALCULAR CUANTAS HOJAS SE NECESITAN
    let hojas = Math.ceil((cantidad / this.ejemplares) + this.cantidad_desperdicio[i]);

    //Calcular consumido por hoja
    let cantidad_por_1000 = this.Materiales_Agregados[i].cantidad
    let cantidad_por_hoja = cantidad_por_1000 / 1000;

    // calcular consumo por total de hojas
    let cantidad_necesaria = cantidad_por_hoja * hojas;


    if (grupo === 'Cajas Corrugadas') {
      this.cajas_utilizar[n] = Math.ceil(cantidad / cantidad_por_1000);
      this.metros_cinta_necesarios[n] = material.cinta * this.cajas_utilizar[n]
      cantidad_necesaria = this.cajas_utilizar[n];
    } else if (grupo === 'Soportes de Embalaje') {
      cantidad_necesaria = cantidad_por_1000 / this.cajas_utilizar[n]
    } else if (grupo === 'Pega') {
      paquetes = material.presentacion.match(/\d+/);
      let cuanto_consumo = cantidad / 1000;
      cantidad_necesaria = cantidad_por_1000 * cuanto_consumo
    } else if (grupo === 'Barniz Acuoso') {
      paquetes = material.presentacion.match(/\d+/);
      let cuanto_consumo = hojas / 1000;
      cantidad_necesaria = cantidad_por_1000 * cuanto_consumo
    } else if (grupo === 'Cinta de Embalaje') {
      cantidad_necesaria = Math.ceil(this.metros_cinta_necesarios[n] / 100)
    } else if (grupo === 'Barniz') {
      this.barniz_existente = 1
    }

    // Calcular Precio
    let precio_ultimo = this.Materiales_Agregados[i].material.ultimoPrecio / paquetes;
    let precio_final = cantidad_necesaria * precio_ultimo

    return {
      cantidad: cantidad_necesaria, precio: precio_final
    }
  }


  calcularPreciosMateriales(cantidad: number, i: number) {
    let hojas_a_usar = (cantidad / this.ejemplares) + this.cantidad_desperdicio[i];

    let total = 0;

    this.Materiales_Agregados.forEach(material => {
      let cantidad_ = material.cantidad
      console.log(material.material)
      if (this.grupo_selected2 === 'Cajas Corrugadas') {
        console.log(
          material.material.nombre, ' => ', Math.ceil(cantidad / cantidad_)
        )
      } else {
        console.log(
          material.material.nombre, ' => ', (cantidad_ * (hojas_a_usar / 1000))
        )
      }
    })

  }



  buscarPlancha() {
    this.api.getAlmacen()
      .subscribe((response: any) => {
        this.planchas = response.materiales.filter((r: any) => r.nombre === 'Planchas Litográficas')[0]
      })
  }

  calcularPlanchas(): any {
    // Calcular precio unitario de la plancha
    let cantidad_paquete = this.planchas.presentacion.match(/\d+/);
    cantidad_paquete = Number(cantidad_paquete[0]);

    let precio_unidad = this.planchas.ultimoPrecio / cantidad_paquete;

    // Planchas a utilizar
    let total_planchas = this.cantidad_planchas + this.barniz_existente;

    // Retornar costo total = costo de planchas + costo de máquina
    return (precio_unidad * total_planchas)
  }




  formatNumber(value: number): string {
    if (!value && value !== 0) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  updateAlltransporte(event: any) {
    this.precios_transporte.forEach((_, i) => {
      this.precios_transporte[i] = Number(event.value) || 0;
    });
  }

  calcularPrecioBase(precio) {
    this.precio_base_sustrato = precio.value
  }

  public precio_base_sustrato = 0;
  calcularPrecioSustrato() {
    let sustrato = this.sustrato.find((s: any) => s._id === this.sustrato_selected)
    if (!sustrato.ultimoPrecio) {
      this.precios.sustrato = -1
    } else {
      this.precios.sustrato = sustrato.ultimoPrecio
      this.precio_base_sustrato = sustrato.ultimoPrecio
    }
  }

  ajustarPrecioSustrato() {
    this.precios.sustrato = (this.precio_base_sustrato + (this.precio_base_sustrato * (this.aumento_sustrato / 100)))
  }

  add_material() {
    const nuevoMaterial = this.filtrarMateiralPorGrupo()[this.material_selected];

    // Verificar si ya existe
    const yaExiste = this.Materiales_Agregados.some(
      item => item.material === nuevoMaterial
    );

    if (!yaExiste) {
      this.Materiales_Agregados.push({
        material: nuevoMaterial,
        cantidad: this.cantidad_added
      });
      console.log("Agregado correctamente:", this.Materiales_Agregados);
    } else {
      console.warn("Este material ya fue agregado");
    }


    if (this.grupo_selected2 === 'Cajas Corrugadas') {
      this.grupo_selected2 = 'Cinta de Embalaje'
      this.material_selected = 0;
      this.add_material()
    }

    // Reset de campos
    this.material_selected = '';
    this.cantidad_added = 0;
  }


  getSustratos() {
    this.api.getAlmacen()
      .subscribe((response: any) => {
        let sustratos = response.materiales.filter((r: any) => r.grupo.nombre === 'Sustrato')
        this.sustrato = sustratos
      })
  }

  getTintas() {
    this.api.getAlmacen_()
      .subscribe((response: Material[]) => {
        let tintas = response.filter(r =>
          r.grupo?.nombre === 'Tinta' && r.precio > 0
        );

        // único por nombre con precio mayor
        let tintasUnicas = Object.values(
          tintas.reduce((acc: any, t: Material) => {
            if (!acc[t.nombre] || t.precio > acc[t.nombre].precio) {
              acc[t.nombre] = t;
            }
            return acc;
          }, {})
        ) as Material[];

        if (tintasUnicas.length > 0) {
          // Mostrar cada tinta
          tintasUnicas.forEach(t => {
            console.log(`Tinta: ${t.nombre} | Precio: ${t.precio}`);
          });

          // Calcular promedio
          const promedio =
            tintasUnicas.reduce((acc, t) => acc + t.precio, 0) / tintasUnicas.length;

          console.log("Promedio de tintas únicas (precio mayor):", promedio);

          this.precios.tinta = Number(promedio.toFixed(2));
        } else {
          console.log("No hay tintas válidas en los últimos 3 meses");
        }
      });
  }


  maquinaLitografica() {
    // Obtener la máquina de pre-impresión
    let pre_impresion: any = this.maquinas.find((m: any) => m.tipo === 'PRE-IMPRESIÓN');

    let cph = pre_impresion.cph;     // trabajos por hora
    let precioHora = pre_impresion.precio; // precio por hora

    // Planchas a utilizar
    let total_planchas = this.cantidad_planchas + this.barniz_existente;

    // Calcular horas necesarias
    let horas = total_planchas / cph;

    // Redondear: mínimo 1h, múltiplos de 0.5h
    horas = Math.max(1, Math.ceil(horas * 2) / 2);

    // Costo de máquina
    let costo_maquina = horas * precioHora;

    return {
      nombre: pre_impresion.nombre,
      horas: horas,
      precio: costo_maquina
    }
  }

  syncPrecios(precios: number[]): number[] {
    let transporte = this.precio_transporte || 0;
    let escalas = this.cantidad_escalas || 0;
    let result = [...precios];

    // Si hay menos precios que escalas, agregar con valor por defecto (transporte)
    while (result.length < escalas) {
      result.push(transporte);
    }

    // Si hay más precios que escalas, cortar el exceso
    if (result.length > escalas) {
      result = result.slice(0, escalas);
    }

    return result;
  }







  getGrupos() {
    this.api.getGrupos()
      .subscribe((response: any) => {
        this.grupos = response.grupos
      })
  }

  getMaquinas() {
    this.api.GetMaquinas()
      .subscribe((response: any) => {
        this.maquinas = response;
      })
  }

  GetGrupoMp() {
    this.api.GetGrupoMp()
      .subscribe((response: any) => {
        this.gruposMP = response.filter((g: any) => g.nombre !== 'Sustrato' && g.nombre !== 'Tinta');
      })
  }

  getMateriales() {
    this.api.getAlmacen()
      .subscribe((response: any) => {
        this.materiales = response.materiales
      })
  }


  filtrarMaquinaPorGrupo(grupo: any) {
    return this.maquinas.filter((m: any) => m.tipo === grupo)
  }

  filtrarMateiralPorGrupo() {
    return this.materiales.filter((m: any) => m.grupo.nombre === this.grupo_selected2)
  }






  /** Puedes pasarle slides desde el padre con [slides]="miArray" */
  @Input() slides: Array<{ numba: number; title: string; subtitle?: string; content?: string; img?: string }> = [
    { numba: 1, title: 'Datos clientes', subtitle: '', content: 'Contenido de la card 1' },
    { numba: 2, title: 'Producto', subtitle: '', content: 'Contenido de la card 2' },
    { numba: 3, title: 'Maquinas', subtitle: '', content: 'Contenido de la card 3' },
    { numba: 4, title: 'Otra materia prima', subtitle: '', content: 'Contenido de la card 3' },
    { numba: 5, title: 'Escalas', subtitle: '', content: 'Contenido de la card 3' },
    { numba: 6, title: 'Detalles', subtitle: '', content: 'Contenido de la card 3' },
  ];

  @ViewChild('carousel', { static: false }) carousel!: ElementRef<HTMLDivElement>;
  @ViewChildren('carouselCard') carouselCards!: QueryList<ElementRef<HTMLDivElement>>;

  index = 0;
  cardWidth = 0;
  isDragging = false;
  startX = 0;
  prevTranslate = 0;

  private onWindowResize = () => this.updateCardWidth();
  private autoplayHandle: any = null;


  ngAfterViewInit(): void {
    // Esperar microtask para asegurar QueryList populated
    setTimeout(() => {
      this.updateCardWidth();
      // volver a calcular si cambian las cards dinámicamente
      this.carouselCards.changes.subscribe(() => this.updateCardWidth());
      window.addEventListener('resize', this.onWindowResize);
      this.goTo(this.index, false);
      // this.startAutoplay();
      this.stopAutoplay();
    }, 0);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
    this.stopAutoplay();
  }

  private updateCardWidth(): void {
    const first = this.carouselCards.first;
    if (first && first.nativeElement) {
      this.cardWidth = first.nativeElement.offsetWidth;
    } else {
      // fallback al ancho del contenedor
      this.cardWidth = this.carousel?.nativeElement?.offsetWidth ?? 0;
    }
    // ajustar la posición actual cuando cambia tamaño
    this.goTo(this.index, false);
  }

  goTo(i: number, animate = true) {
    if (this.slides.length === 0) return;
    // wrap-around
    if (i < 0) i = this.slides.length - 1;
    if (i >= this.slides.length) i = 0;
    this.index = i;

    const translateX = -this.index * this.cardWidth;
    if (animate) {
      this.renderer.setStyle(this.carousel.nativeElement, 'transition', 'transform 0.4s ease');
    } else {
      this.renderer.setStyle(this.carousel.nativeElement, 'transition', 'none');
    }
    this.renderer.setStyle(this.carousel.nativeElement, 'transform', `translateX(${translateX}px)`);
  }

  moveSlide(step: number) {
    this.goTo(this.index + step, true);
  }

  // --- Pointer (drag) handlers ---
  onPointerDown(evt: PointerEvent) {
    this.isDragging = true;
    this.startX = evt.clientX;
    this.prevTranslate = -this.index * this.cardWidth;
    this.renderer.setStyle(this.carousel.nativeElement, 'transition', 'none');
    // pausar autoplay mientras arrastra
    this.stopAutoplay();
  }

  onPointerMove(evt: PointerEvent) {
    if (!this.isDragging) return;
    const currentX = evt.clientX;
    const diff = currentX - this.startX;
    const translate = this.prevTranslate + diff;
    this.renderer.setStyle(this.carousel.nativeElement, 'transform', `translateX(${translate}px)`);
  }

  onPointerUp(evt: PointerEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    const endX = evt.clientX;
    const diff = endX - this.startX;
    // si desplazamiento mayor a 1/4 ancho de tarjeta -> cambiar slide
    if (Math.abs(diff) > this.cardWidth / 4) {
      if (diff < 0) this.moveSlide(1);
      else this.moveSlide(-1);
    } else {
      // volver al slide actual
      this.goTo(this.index, true);
    }
    // reanudar autoplay
    // this.startAutoplay();
  }

  // --- keyboard navigation ---
  @HostListener('document:keydown', ['$event'])
  // handleKeyboard(event: KeyboardEvent) {
  //   if (event.key === 'ArrowRight') this.moveSlide(1);
  //   if (event.key === 'ArrowLeft') this.moveSlide(-1);
  // }

  // --- Autoplay (opcional) ---
  // startAutoplay(intervalMs = 5000) {
  //   this.stopAutoplay();
  //   this.autoplayHandle = setInterval(() => this.moveSlide(1), intervalMs);
  // }

  stopAutoplay() {
    if (this.autoplayHandle) {
      clearInterval(this.autoplayHandle);
      this.autoplayHandle = null;
    }
  }


  public cliente = {
    nombre: '',
    direccion: '',
    rif: '',
    codigo: '',
    contactos: [
      {
        nombre: '',
      }
    ]
  }


  getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);

        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = error => reject(error);
      img.src = url;
    });
  }

  sustrato_Nuevo = {
    nombre: '',
    gramaje: '',
    calibre: '',
    ancho: '',
    largo: '',

  }

  DescargarPDF = async () => {

    var cliente: any = this.Clientes.find((c: any) => c._id === this.cliente_selected)
    if (!cliente) {
      cliente = this.cliente
    }
    var producto: any = this.producto.find((p: any) => p._id === this.producto_selected)
    if (!producto) {
      producto = this._producto
    }
    const tipos = this.grupos[this.grupo_selected].tipos
    const escalas_ = this.cantidad_por_escala;
    const precios: any = [];
    const condicion = this.condicion_pago;
    const almacen = this.almacen_selected;
    let sustrato: any = this.sustrato.find((s: any) => s._id === this.sustrato_selected)
    if (!sustrato) {
      sustrato = this.sustrato_Nuevo
    }
    let colores = ''
    const dias = this.dias_validez;
    const usuario = `${this.api.usuario.Nombre} ${this.api.usuario.Apellido}`;
    const departamento = this.api.usuario.Departamento;
    const fecha = new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date());
    const firma = `../../assets/firmas/${this.api.usuario._id}.png`;
    const nota = this.nota;

    const division = this.division;
    const backgroundBase64 = await this.getBase64ImageFromURL(
      '../../assets/HOJA_MEMBRETE_POLIGRAFICA.jpg'
    );



    if (this.barniz_existente > 0) {
      colores = `${this.cantidad_planchas} Colores + Barniz`
    } else {
      colores = `${this.cantidad_planchas} Colores`
    }


    for (let i = 0; i < escalas_.length; i++) {
      precios.push((((this.getTotalConMargen(i) + this.getTotalMaquinasConMargen(i) + this.precios_transporte[i]) * this.division) / this.cantidad_por_escala[i]) * (1 + (this.otro / 100)))
    }

    const pdf = new PdfMakeWrapper();
    PdfMakeWrapper.setFonts(pdfFonts);

    async function generarPDF() {

      // ==================== ENCABEZADO ====================
      // pdf.add(
      //   new Table([
      //     [
      //       new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([20, 5, 0, -5]).build()).rowSpan(4).end,
      //       new Cell(new Txt(`
      //         COTIZACIÓN
      //         `).bold().end).alignment('center').fontSize(13).rowSpan(4).end,
      //       new Cell(new Txt('Código: FDE-001').end).fillColor('#dedede').fontSize(7).alignment('center').end,
      //     ],
      //     [
      //       new Cell(new Txt('').end).end,
      //       new Cell(new Txt('').end).end,
      //       new Cell(new Txt('N° de Revisión: 0').end).fillColor('#dedede').fontSize(7).alignment('center').end,
      //     ],
      //     [
      //       new Cell(new Txt('').end).end,
      //       new Cell(new Txt('').end).end,
      //       new Cell(new Txt('Fecha de Revisión: 14/04/2023').end).fillColor('#dedede').fontSize(7).alignment('center').end,
      //     ],
      //     [
      //       new Cell(new Txt('').end).end,
      //       new Cell(new Txt('').end).end,
      //       new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(7).alignment('center').end,
      //     ],
      //   ])
      //     .widths(['25%', '50%', '25%'])
      //     .end
      // );

      // pdf.add(pdf.ln(1));
      pdf.background({
        image: backgroundBase64,
        width: 595.28,   // A4
        height: 841.89
      });

      // ==================== TABLA DE CABECERA DE LA COTIZACIÓN (NUEVO ESTILO) ====================
      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt('PRESUPUESTO').bold().alignment('center').color('#ffffff').end)
                    .colSpan(2)
                    .fillColor('#000000')
                    .end,
                  new Cell(new Txt('').end).end
                ],
                [
                  new Cell(new Txt('N°').bold().alignment('center').color('#000000').end)
                    .fillColor('#cccccc').end,
                  new Cell(new Txt(`${cliente.codigo}-26-xx`).bold().color('#e74c3c').alignment('center').end)
                    .fillColor('#ededed').end,
                ],
                [
                  new Cell(new Txt('Fecha').bold().alignment('center').color('#000000').end)
                    .fillColor('#cccccc').end,
                  new Cell(new Txt(fecha).alignment('center').color('#000000').end)
                    .fillColor('#ededed').end,
                ],
              ])
                .widths(['35%', '65%'])
                .layout({
                  hLineWidth: () => 0.7,
                  vLineWidth: () => 0.7,
                  hLineColor: () => '#bdc3c7',
                  vLineColor: () => '#bdc3c7',
                  paddingLeft: () => 6,
                  paddingRight: () => 6,
                  paddingTop: () => 4,
                  paddingBottom: () => 4,
                })
                .end
            ).end,
          ],
        ])
          .widths(['25%', '40%', '35%'])
          .layout('noBorders')
          .end
      );

      pdf.add(pdf.ln(1));

      // ==================== INFO DEL CLIENTE (ESTILIZADA) ====================
      pdf.add(
        new Table([
          // === Fila 1: datos del cliente ===
          [
            new Cell(
              new Table([
                [
                  new Cell(
                    new Txt(`Cliente: ${cliente.nombre || ''}`)
                      .bold()
                      .color('#000000')
                      .end
                  ).colSpan(2).end,
                  new Cell(new Txt('').end).end
                ],
                [
                  new Cell(
                    new Txt(`Rif: ${cliente.rif || ''}`)
                      .bold()
                      .color('#000000')
                      .end
                  ).colSpan(2).end,
                  new Cell(new Txt('').end).end
                ],
                [
                  new Cell(
                    new Txt('Dirección Fiscal:')
                      .bold()
                      .color('#000000')
                      .end
                  ).colSpan(2).end,
                  new Cell(new Txt('').end).end
                ],
                [
                  new Cell(
                    new Txt(cliente.direccion || 'No especificada')
                      .color('#000000')
                      .fontSize(9)
                      .end
                  ).colSpan(2).end,
                  new Cell(new Txt('').end).end
                ]
              ])
                .widths(['25%', '75%'])
                .layout('noBorders')
                .end
            ).end,

            // celda derecha vacía (espacio para la sección de contactos en la siguiente fila)
            new Cell(new Txt('').end).end
          ],

          // === Fila 2: contactos (alineado a la derecha, debajo) ===
          [
            new Cell(new Txt('').end).end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Atención:').bold().color('#000000').alignment('right').end).end
                ],
                [
                  new Cell(
                    new Txt(
                      (cliente.contactos && cliente.contactos[0] && cliente.contactos[0].nombre) ||
                      ''
                    )
                      .bold()
                      .color('#000000')
                      .alignment('right')
                      .end
                  ).end
                ]
              ])
                .widths(['100%'])
                .layout('noBorders')
                .end
            )
              .fillColor('#ffffff')
              .margin([0, 10, 0, 0]) // espacio arriba
              .end
          ]
        ])
          .widths(['65%', '35%']) // contactos en el lado derecho
          .layout('noBorders')
          .end
      );

      pdf.add(pdf.ln(1));


      // ==================== DESCRIPCIÓN DEL PRODUCTO ====================
      const detalles = tipos;
      const detallesTexto = detalles.join(' – ');

      pdf.add(
        new Table([
          [
            new Cell(
              new Txt(producto.producto || 'Producto no especificado')
                .bold()
                .color('#000000')
                .alignment('left')
                .lineHeight(0.6) // interlineado más pequeño
                .end
            )
              .end
          ],
          [
            new Cell(
              new Txt(
                `Sustrato: ${sustrato.nombre} ${sustrato.gramaje}g/m² Cal. ${sustrato.calibre}pt` ||
                'Sustrato no especificado'
              )
                .color('#000000')
                .alignment('left')
                .lineHeight(0.6)
                .end
            )
              .end
          ],
          [
            new Cell(
              new Txt(`Colores: ${colores}` || 'Colores no especificados')
                .color('#000000')
                .alignment('left')
                .lineHeight(0.6)
                .end
            )
              .end
          ],
          [
            new Cell(
              new Txt(`Procesos: ${detallesTexto}`)
                .color('#000000')
                .alignment('left')
                .lineHeight(0.6)
                .end
            ).end
          ]
        ])
          .widths(['100%'])
          .layout({
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 3, // puedes bajar también el padding si quieres más compacto
            paddingBottom: () => 3
          })
          .end
      );

      pdf.add(pdf.ln(1)); // Espacio antes de la siguiente sección


      // ======================= DESCRIPCION DEL PRODUCTO =======================




      // ==================== TABLA DE ESCALAS HORIZONTAL ====================
      const escalas = escalas_;
      const precios_ = precios;

      const headerRow = [
        new Cell(new Txt('Escala').bold().color('#ffffff').alignment('center').fontSize(10).end)
          .fillColor('#000000').end,
        ...escalas.map(e =>
          new Cell(new Txt(e.toLocaleString('es-VE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })).bold().color('#ffffff').alignment('center').fontSize(10).end)
            .fillColor('#000000').end
        )
      ];

      const priceRow = [
        new Cell(new Txt(`Precio/${division} und (USD)`).bold().color('#000000').alignment('center').fontSize(9).end)
          .fillColor('#cccccc').end,
        ...precios_.map((p: any) =>
          new Cell(new Txt(p.toLocaleString('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })).bold().color('#000000').alignment('center').fontSize(10).end)
            .fillColor('#cccccc').end
        )
      ];

      pdf.add(
        new Table([headerRow, priceRow])
          .widths(['20%', ...Array(escalas.length).fill(`${80 / escalas.length}%`)])
          .layout({
            hLineWidth: () => 0.7,
            vLineWidth: () => 0.7,
            hLineColor: () => '#bdc3c7',
            vLineColor: () => '#bdc3c7',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4,
          })
          .end
      );

      pdf.add(pdf.ln(1));

      // ==================== NOTA ADICIONAL ====================
      if (nota && nota.trim() !== '') {
        pdf.add(
          new Table([
            [
              new Cell(
                new Txt('Importante:').bold().fontSize(10).end
              ).end
            ],
            [
              new Cell(
                new Txt(
                  `${nota.trim()}`
                )
                  .fontSize(9)
                  .alignment('justify')
                  .end
              ).end
            ]
          ])
            .layout('noBorders')
            .end
        );

      }

      pdf.add(pdf.ln(1));

      // ==================== OBSERVACIONES (CONDICIONES) ====================
      pdf.add(
        new Table([
          [
            new Cell(
              new Txt('Nota:').bold().fontSize(10).end
            ).end
          ],
          [
            new Cell(
              new Txt(
                `1. Condición de Pago: ${condicion}\n` +
                `2. Entrega de mercancía ${almacen}.\n` +
                `3. Validez del presupuesto: ${dias} dias.\n` +
                `4. El cliente acepta una variación de hasta un 10% (diez por ciento) de más o de menos respecto a la cantidad del servicio solicitado, de acuerdo con la práctica en la industria de artes gráficas, ajustándose el monto total del precio del producto proporcionalmente a la cantidad despachada.`
              )
                .fontSize(9)
                .alignment('justify')
                .end
            ).end
          ]
        ])
          .layout('noBorders')
          .end
      );

      pdf.add(pdf.ln(2));


      // ==================== FIRMA ====================
      pdf.add(
        new Table([
          [new Cell(new Txt('Emitido por:').bold().end).end],
          [
            new Cell(
              await new Img(firma)
                .width(95)
                .height(45) // 🔹 Controla la altura fija para evitar saltos
                .margin([0, -15, 0, 0]) // 🔹 Ajusta la posición vertical más precisa
                .build()
            )
              .end,
          ],
          [new Cell(new Txt(usuario).end).end],
          [new Cell(new Txt(departamento).italics().fontSize(9).end).end],
        ])
          .layout('noBorders')
          .end
      );

      pdf.add(pdf.ln(2));

      // ==================== PIE DE PÁGINA ====================
      // pdf.add(
      //   new Txt('Calle Pantín,  Local Galpón Nro 29, Urb. Chacao-Caracas, Miranda, Venezuela. ZP: 1060,')
      //     .italics().fontSize(9).alignment('center').end
      // );
      // pdf.add(
      //   new Txt('email: info@poligraficaindustrial.com')
      //     .italics().fontSize(9).alignment('center').end
      // );

      // ==================== DESCARGA ====================
      pdf.create().download(`nn-C-26-xx`);
    }

    generarPDF();
  }




}
