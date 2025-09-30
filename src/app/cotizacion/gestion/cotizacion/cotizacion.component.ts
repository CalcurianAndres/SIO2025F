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
  public sustrato = []
  public grupos = []
  public maquinas = []
  public gruposMP = []
  public materiales = []

  public sustrato_selected = ''
  public grupo_selected = ''
  public grupo_selected2 = ''
  public Materiales_Agregados = []
  public material_selected;
  public cantidad_added = 0

  public cantidad_escalas = 0
  public cantidad_desperdicio = []
  public cantidad_por_escala: number[] = []
  public maquinas_selected: any[] = []

  public ejemplares = 0
  public kilos_tintas = 0
  public cantidad_planchas = 0
  public planchas_precio = 0
  public planchas
  public cajas_utilizar = []

  public metros_cinta_necesarios = []

  public barniz_existente = 0

  public precio_transporte = 300
  public division = 1000
  public otro = 0

  public precios = {
    sustrato: 0,
    tinta: 0,
    maquinas: []
  }

  ngOnInit(): void {

    this.getMateriales()
    this.getSustratos()
    this.getGrupos()
    this.getMaquinas()
    this.GetGrupoMp()
    this.getTintas()
    this.buscarPlancha()
  }

  margenGanancia: number = 20; // porcentaje por defecto

  margenGananciaMaquinas: number = 20; // valor inicial

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
      const data = this.calcularPreciosMaquina(this.cantidad_por_escala[i], y);
      total += data.precio;
    });
    return total;
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


  // Se ejecuta cada vez que cambia el input
  onInputChange(event: any, i: number) {
    const value = event.target.value.replace(/\./g, ''); // eliminamos separadores
    this.cantidad_por_escala[i] = Number(value) || 0; // guardamos como número
    event.target.value = this.formatNumber(this.cantidad_por_escala[i]); // mostramos formateado


    this.calcularPreciosMaquina(this.cantidad_por_escala[i], i)
    this.calcularPreciosMateriales(this.cantidad_por_escala[i], i)
    this.planchas_precio = this.calcularPlanchas()
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
   *      las horas se calculan como: horas = cantidad / cph (tal como en tu lógica original).
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
  calcularPreciosMaquina(cantidad: number, i: number) {
    // valores base
    const hojas_a_usar = (cantidad / this.ejemplares) + this.cantidad_desperdicio[i];
    const maquina: any = this.maquinas_selected[i];

    // guardas y parseos seguros
    const cph = Number(maquina?.cph) || 0;
    const tarifa = Number(maquina?.precio) || 0;

    // validación: evitar división por cero
    if (cph <= 0) {
      console.warn(`calcularPreciosMaquina: cph inválido para la máquina index ${i} (cph=${maquina?.cph})`);
      return { precio: 0, cantidad: 0 };
    }

    // helper para redondear al .5 más cercano
    const roundToNearestHalf = (v: number) => Math.round(v * 2) / 2;

    // tipos que usan la fórmula alternativa
    const tiposEspeciales = ['TROQUELAR', 'CORTAR', 'DOBLAR Y PEGAR', 'REVISAR Y ENFAJILLAR'];

    // cálculo de horas según tipo
    let horas = tiposEspeciales.includes(maquina?.tipo)
      ? (cantidad / cph)
      : (hojas_a_usar / cph);

    // redondeo y mínimo 1
    let horasRedondeadas = roundToNearestHalf(horas);
    if (horasRedondeadas < 1) horasRedondeadas = 1;

    horasRedondeadas = horasRedondeadas + (Number(maquina?.reparacion) || 0);

    // recalculamos precio con las horas redondeadas
    const precio_neto = tarifa * horasRedondeadas;

    // devolvemos precio con 2 decimales y la cantidad de horas
    return { precio: Number(precio_neto.toFixed(2)), cantidad: horasRedondeadas };
  }


  calculoPrecioMaterial(cantidad: number, i, n?) {

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

    // Obtener la máquina de pre-impresión
    let pre_impresion: any = this.maquinas.find(m => m.tipo === 'PRE-IMPRESIÓN');

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

    // Retornar costo total = costo de planchas + costo de máquina
    return (precio_unidad * total_planchas) + costo_maquina;
  }




  formatNumber(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // separador de miles con "."
  }

  calcularPrecioSustrato() {
    let sustrato = this.sustrato.find((s: any) => s._id === this.sustrato_selected)
    if (!sustrato.ultimoPrecio) {
      this.precios.sustrato = -1
    } else {
      this.precios.sustrato = sustrato.ultimoPrecio
    }
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
        this.gruposMP = response.filter(g => g.nombre !== 'Sustrato' && g.nombre !== 'Tinta');
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

  constructor(private renderer: Renderer2, private api: RestApiService) { }

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
  handleKeyboard(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') this.moveSlide(1);
    if (event.key === 'ArrowLeft') this.moveSlide(-1);
  }

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
}
