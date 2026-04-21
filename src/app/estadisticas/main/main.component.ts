import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Importar el plugin

import { HttpClient } from '@angular/common/http';

Chart.register(...registerables, ChartDataLabels); // Registrarlo

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})


export class MainComponent implements OnInit {

  fechaInicio: string = '2025-01-01';
  fechaFin: string = '2025-12-31';
  cargado: boolean = false;
  cargando: boolean = false;

  pilares: any[] = [];
  gruposDetalle: any[] = []; // Aquí guardamos los grupos para los acordeones
  resumenOrdenes: any = []
  private charts: any = {};
  filtroBusqueda = ''
  NroOP = '';
  selectedProducto: string = '';
  selectedCliente: string = '';
  reporte: any[] = [];
  public chartClientes: any;


  formularioValido(): boolean {
    switch (this.filtroBusqueda) {
      case 'fecha':
        // Requiere ambas fechas
        return !!this.fechaInicio && !!this.fechaFin;

      case 'orden':
        // Requiere que el número de OP no esté vacío
        return !!this.NroOP && this.NroOP.trim().length > 0;

      case 'cliente':
        // Requiere Cliente, Fecha Inicio y Fecha Fin
        // (El producto lo dejo opcional por si quieres ver todo lo del cliente)
        return !!this.selectedCliente && !!this.fechaInicio && !!this.fechaFin;

      default:
        return false;
    }
  }

  // Helper para mostrar/ocultar la sección completa si no hay nada
  hayAdicionales(): boolean {
    if (!this.reporte) return false;
    return this.reporte.some(g => g.total_neto_ad > 0);
  }

  consultar() {
    this.cargando = true;
    this.cargado = false;
    const base = 'http://192.168.0.27:8080/api';
    let url = '';

    if (this.filtroBusqueda === 'orden' && this.NroOP) {
      url = `${base}/inventario-reporte-op?op=${this.NroOP}`;
    }
    else if (this.filtroBusqueda === 'cliente') {
      // Nueva lógica para Cliente/Producto
      url = `${base}/inventario-reporte-filtro?fechaInicio=${this.fechaInicio}&fechaFin=${this.fechaFin}`;
      if (this.selectedCliente) url += `&clienteId=${this.selectedCliente}`;
      if (this.selectedProducto) url += `&productoId=${this.selectedProducto}`;
    }
    else {
      url = `${base}/inventario-reporte-detallado?fechaInicio=${this.fechaInicio}&fechaFin=${this.fechaFin}`;
    }

    this.http.get(url).subscribe({
      next: (res: any) => {
        this.procesarData(res.reporte);
        this.procesarTops(res.reporte);
        this.resumenOrdenes = res.resumenOrdenes;

        // Renderizar la nueva gráfica
        if (res.rankingClientes) {
          this.renderChartClientes(res.rankingClientes);
        }

        this.cargado = true;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  renderChartClientes(data: any[]) {
    if (this.chartClientes) this.chartClientes.destroy();

    // Definimos una paleta de colores vibrantes con 70% de opacidad (alpha 0.7)
    const coloresVibrantes = [
      'rgba(255, 99, 132, 0.7)',  // Rosa
      'rgba(54, 162, 235, 0.7)',  // Azul
      'rgba(255, 206, 86, 0.7)',  // Amarillo
      'rgba(75, 192, 192, 0.7)',  // Turquesa
      'rgba(153, 102, 255, 0.7)', // Morado
      'rgba(255, 159, 64, 0.7)',  // Naranja
      'rgba(72, 230, 95, 0.7)',   // Verde lima
      'rgba(230, 72, 217, 0.7)',  // Fucsia
    ];

    this.chartClientes = new Chart('chartClientes', {
      type: 'bar',
      plugins: [ChartDataLabels],
      data: {
        labels: data.map(c => c.nombre),
        datasets: [{
          label: 'Órdenes',
          data: data.map(c => c.cantidad),
          // Asignamos los colores ciclando el array si hay más de 8 clientes
          backgroundColor: data.map((_, i) => coloresVibrantes[i % coloresVibrantes.length]),
          // Bordes sólidos del mismo color pero sin transparencia
          borderColor: data.map((_, i) => coloresVibrantes[i % coloresVibrantes.length].replace('0.7', '1')),
          borderWidth: 2,
          borderRadius: { topLeft: 10, topRight: 10, bottomLeft: 0, bottomRight: 0 }, // Bordes redondeados arriba
          barPercentage: 0.7, // Ancho de la barra (un poco más separadas)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }, // Ocultamos leyenda (ya cada barra es un cliente)

          // --- CONFIGURACIÓN DE LOS "TAGS" (NÚMEROS SOBRE BARRAS) ---
          datalabels: {
            color: '#ffffff', // Texto blanco
            anchor: 'end',    // Anclado al final de la barra
            align: 'start',   // Alineado hacia adentro de la barra
            offset: 10,       // Espaciado del borde
            font: { weight: 'bold', size: 14 }, // Fuente grande y negrita
            // Pequeño truco para que parezca un tag: fondo oscuro transparente
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: 4,
            padding: { top: 4, bottom: 4, left: 8, right: 8 },
            formatter: (value) => {
              return `${value}`; // Ejemplo: "Ord: 15"
            }
          },

          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            displayColors: false // Ocultamos el cuadrito de color en el tooltip
          }
        },

        scales: {
          x: {
            grid: { display: false }, // Ocultamos líneas de cuadrícula verticales
            ticks: {
              color: '#1a202c',
              font: { weight: '600', size: 11 },
              maxRotation: 45, // Rotación para que no choquen los nombres largos
              minRotation: 45
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f0f2f5' }, // Líneas horizontales muy tenues
            ticks: {
              stepSize: 1, // Solo números enteros
              color: '#718096',
              font: { size: 11 }
            }
          }
        },
        layout: {
          // Añadimos padding arriba para que el datalabel de la barra más alta no se corte
          padding: { top: 30 }
        }
      }
    });
  }

  toggleGrupo(grupo: any, index: number) {
    grupo.abierto = !grupo.abierto;
    if (grupo.abierto) {
      // Esperamos un delay para que el DOM renderice el canvas
      setTimeout(() => this.renderGraficaDetalle(grupo, index), 100);
    }
  }

  renderGraficaDetalle(grupo: any, index: number) {
    const canvasId = 'chartGrupo' + index;
    const topMateriales = [...grupo.data.detalleMateriales]
      .sort((a, b) => b.neto_op - a.neto_op)
      .slice(0, 5);

    new Chart(canvasId, {
      type: 'doughnut',
      plugins: [ChartDataLabels], // <--- IMPORTANTE: Activamos el plugin aquí
      data: {
        labels: topMateriales.map(m => {
          const marca = m.marca ? ` ${m.marca}` : '';
          const dims = m.dimensiones ? ` [${m.dimensiones}]` : '';
          return `${m.nombreMaterial}${marca}${dims}`;
        }),
        datasets: [{
          data: topMateriales.map(m => m.neto_op),
          backgroundColor: ['#485fc7', '#3e8ed0', '#48c78e', '#f2a900', '#f14668'],
          hoverOffset: 20,
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        // cutout: '82%',
        plugins: {
          // CONFIGURACIÓN DE LOS NÚMEROS SOBRE EL GRÁFICO
          datalabels: {
            color: '#1a202c', // Color oscuro para que se vea
            anchor: 'end',    // Los pone justo al borde
            align: 'start',   // Los mete un poco hacia adentro
            offset: 10,       // Espaciado
            formatter: (value) => {
              // Si el número es muy grande, lo acortamos o le damos formato
              return value.toLocaleString();
            },
            // Solo muestra el número si la porción es lo suficientemente grande
            // display: (context) => {
            //   return context.dataset.data[context.dataIndex] > 0;
            // }
          },
          legend: {
            position: 'right',
            labels: {
              boxWidth: 8,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 15,
              color: '#1a202c',
              font: {
                size: 10,
                weight: '700'
              }
            }
          },
          tooltip: { enabled: true }
        },
        layout: {
          padding: { right: 30, left: 10, top: 20, bottom: 20 }
        }
      }
    });
  }

  procesarData(reporte: any[]) {

    this.reporte = reporte.map(g => ({ ...g, abierto: false })); // <--- Línea clave

    const findG = (n: string) => reporte.find(g => g.grupo.toUpperCase().includes(n.toUpperCase())) ||
      { total_neto_op: 0, total_neto_ad: 0, total_neto_gral: 0, detalleMateriales: [] };

    const gSustrato = findG('SUSTRATOS (CARTÓN)');
    const gPapel = findG('SUSTRATOS (PAPEL)');
    const gTinta = findG('TINTA');
    const gCajas = findG('CAJAS CORRUGADAS');
    const gBarniz = findG('BARNIZ');
    const gPega = findG('PEGA');
    const gBarnizAcuoso = findG('BARNIZ ACUOSO');

    // 1. Estructura para Acordeones
    this.gruposDetalle = [
      { nombre: 'Cartón', data: gSustrato, abierto: false },
      { nombre: 'Papel', data: gPapel, abierto: false },
      { nombre: 'Tintas', data: gTinta, abierto: false },
      { nombre: 'Cajas Corrugadas', data: gCajas, abierto: false },
      { nombre: 'Barniz', data: gBarniz, abierto: false },
      { nombre: 'Barniz acuoso', data: gBarnizAcuoso, abierto: false },
      { nombre: 'Pegas', data: gPega, abierto: false }
    ];

    // 2. Pilares Superiores
    this.pilares = [
      { nombre: 'Cartón', total: gSustrato.total_neto_op, peso: gSustrato.total_toneladas_op, unidad: 'Hojas', colorClass: 'is-link', porcentajeOP: this.calcPerc(gSustrato) },
      { nombre: 'Papel', total: gPapel.total_neto_op, peso: gPapel.total_toneladas_op, unidad: 'Hojas', colorClass: 'is-primary', porcentajeOP: this.calcPerc(gPapel) },
      { nombre: 'Tinta', total: gTinta.total_neto_op, unidad: 'Kg', colorClass: 'is-info', porcentajeOP: this.calcPerc(gTinta) },
      { nombre: 'Barniz', total: gBarniz.total_neto_op, unidad: 'Kg', colorClass: 'is-success', porcentajeOP: this.calcPerc(gBarniz) },
      { nombre: 'Cajas', total: gCajas.total_neto_op, unidad: 'Unds', colorClass: 'is-warning', porcentajeOP: this.calcPerc(gCajas) },
      { nombre: 'Barniz acuoso', total: gBarnizAcuoso.total_neto_gral, unidad: 'Unds', colorClass: 'is-primary', porcentajeOP: 0 },
      { nombre: 'Pega', total: gPega.total_neto_gral, unidad: 'Kg', colorClass: 'is-danger', porcentajeOP: 0 }
    ];
  }

  private calcPerc(g: any) {
    return g.total_neto_gral > 0 ? Math.round((g.total_neto_op / g.total_neto_gral) * 100) : 0;
  }
  // TOPS:::::::::::::::::::::::::::::
  public chartTopSustratos: any;
  public chartTopColores: any;

  procesarTops(reporte: any[]) {
    // 1. Obtener todos los materiales de los grupos de Sustratos y Tintas
    const sustratosRaw = reporte.find(g => g.grupo.toUpperCase().includes('SUSTRATOS (CARTÓN)'))?.detalleMateriales || [];
    const tintasRaw = reporte.find(g => g.grupo.toUpperCase().includes('TINTA'))?.detalleMateriales || [];

    // 2. Ordenar y sacar el Top 5
    const topSustratos = [...sustratosRaw].sort((a, b) => b.neto_total - a.neto_total).slice(0, 5);
    const topTintas = [...tintasRaw].sort((a, b) => b.neto_total - a.neto_total).slice(0, 5);

    this.renderTopCharts(topSustratos, topTintas);
  }

  renderTopCharts(sustratos: any[], tintas: any[]) {
    if (this.chartTopSustratos) this.chartTopSustratos.destroy();
    if (this.chartTopColores) this.chartTopColores.destroy();

    // Gráfico de Sustratos con Nombre Completo
    this.chartTopSustratos = new Chart('chartTopSustratos', {
      type: 'bar',
      data: {
        labels: sustratos.map(m => {
          const nombre = m.nombreMaterial || '';
          const marca = m.marca ? ` ${m.marca}` : '';
          const dims = m.dimensiones ? ` (${m.dimensiones})` : '';
          return `${nombre}${marca}${dims}`; // Ejemplo: "Cartulina Maule (70x100)"
        }),
        datasets: [{
          label: 'Cantidad Total (Hojas)',
          data: sustratos.map(m => m.neto_total.toFixed(2) || 0),
          backgroundColor: 'rgba(72, 95, 199, 0.6)',
          borderColor: 'rgba(72, 95, 199, 1)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false } // Ocultamos leyenda para ganar espacio
        },
        scales: {
          x: { beginAtZero: true },
          y: {
            ticks: {
              autoSkip: false, // Forzamos a que muestre todos los nombres
              font: { size: 10 } // Bajamos un poco la fuente si el nombre es muy largo
            }
          }
        }
      }
    });

    // Gráfico de Tintas con Nombre Completo
    this.chartTopColores = new Chart('chartTopColores', {
      type: 'bar',
      data: {
        labels: tintas.map(m => {
          const nombre = m.nombreMaterial || '';
          const marca = m.marca ? ` ${m.marca}` : '';
          return `${nombre}${marca}`;
        }),
        datasets: [{
          label: 'Kilos Gastados',
          data: tintas.map(m => m.neto_total.toFixed(2)),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
  // FIN ESTADISITCAS GENERALES ::::::::::::::::::::::::.


  apiData: any = null;
  loading: boolean = true;

  // Estados para el cálculo
  metricaSeleccionada: string = 'procesadoHojas';
  sustratosSeleccionados: boolean[] = [];
  mostrarMateriaPrima: boolean = false;

  rendimientoFinal: number = 0;
  totalDenominador: number = 0;
  rendimientoNeto: number = 0;




  orden_selected = '';

  public rendimiento = false;

  chartCumplimiento: any = null;
  porcentajeCumplimiento: number = 0;

  constructor(private api: RestApiService,
    private router: Router,
    private http: HttpClient) { }

  ngOnInit(): void {
  }

  MostrarRendimiento(orden) {
    this.orden_selected = orden;
    this.obtenerDatos();
    this.rendimiento = true;
  }

  chart_planificado: any = null;
  rendimientoPlanificado: number = 0;
  calcularPlanificado() {
    if (!this.apiData) return;

    const base = this.apiData.planificacion.unidadesBase || 0;
    const paginas = this.apiData.planificacion.paginasTotales || 1;

    // Nueva fórmula: Unidades Base / Paginas Totales
    this.rendimientoPlanificado = (base / paginas) * 100;

    setTimeout(() => {
      this.updateChartPlanificado(base, paginas);
    }, 100);
  }

  updateChartPlanificado(base: number, paginas: number) {
    const ctx = document.getElementById('chartPlanificado') as HTMLCanvasElement;
    if (!ctx) return;

    const datoVisual = base > paginas ? paginas : base;
    const faltante = paginas > base ? paginas - base : 0;

    // Color: Si el planificado es 100% o más, verde. Si no, turquesa.
    let colorBarra = this.rendimientoPlanificado >= 100 ? '#48c774' : '#00d1b2';

    if (this.chart_planificado) {
      this.chart_planificado.data.datasets[0].data = [datoVisual, faltante];
      this.chart_planificado.data.datasets[0].backgroundColor = [colorBarra, '#eeeeee'];
      this.chart_planificado.update();
    } else {
      this.chart_planificado = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [datoVisual, faltante],
            backgroundColor: [colorBarra, '#eeeeee'],
            borderWidth: 0,
            circumference: 180,
            rotation: 270,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: { display: false } // <--- ESTO MATA LOS NÚMEROS ESCRITOS
          }
          // // plugins: { legend: { display: false }, tooltip: { enabled: false } }
        }
      });
    }
  }

  calcularCumplimiento() {
    if (!this.apiData) return;
    const solicitado = this.apiData.cantidadSolicitada || 0;
    const despachado = this.apiData.metricas.unidadesTotalesDespachadas || 0;
    this.porcentajeCumplimiento = solicitado > 0 ? (despachado / solicitado) * 100 : 0;

    setTimeout(() => {
      this.updateChartCumplimiento(despachado, solicitado);
    }, 100);
  }

  updateChartCumplimiento(despachado: number, solicitado: number) {
    const ctx = document.getElementById('chartCumplimiento') as HTMLCanvasElement;
    if (!ctx) return;
    const dataGrafico = despachado > solicitado ? solicitado : despachado;
    const faltante = solicitado > despachado ? solicitado - despachado : 0;
    let colorBarra = this.porcentajeCumplimiento >= 100 ? '#48c774' : (despachado > solicitado ? '#ffdd57' : '#209cee');

    if (this.chartCumplimiento) {
      this.chartCumplimiento.data.datasets[0].data = [dataGrafico, faltante];
      this.chartCumplimiento.data.datasets[0].backgroundColor = [colorBarra, '#eeeeee'];
      this.chartCumplimiento.update();
    } else {
      this.chartCumplimiento = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [dataGrafico, faltante],
            backgroundColor: [colorBarra, '#eeeeee'],
            borderWidth: 0,
            circumference: 180,
            rotation: 270,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: { display: false } // <--- ESTO MATA LOS NÚMEROS ESCRITOS
          }
          // plugins: { legend: { display: false }, tooltip: { enabled: false } }
        }
      });
    }
  }

  obtenerDatos() {
    const url = `http://192.168.0.27:8080/api/rendimiento/${this.orden_selected}`;
    this.http.get(url).subscribe((res: any) => {
      this.apiData = res;
      this.sustratosSeleccionados = new Array(res.detallesSustratos.length).fill(true);
      this.loading = false;
      this.calcular();
      this.calcularCumplimiento();
      this.calcularPlanificado();
    });
  }

  chart_: any;
  chart_real: any;

  cerrarModal() {
    this.rendimiento = false;
    if (this.chart_) this.chart_.destroy();
    if (this.chart_real) this.chart_real.destroy();
    if (this.chart_planificado) this.chart_planificado.destroy(); // <--- LIMPIEZA
    if (this.chartCumplimiento) this.chartCumplimiento.destroy();

    this.chart_ = null;
    this.chart_real = null;
    this.chart_planificado = null;
    this.chartCumplimiento = null;
  }

  calcular() {
    if (!this.apiData) return;
    const numerador = this.apiData.metricas[this.metricaSeleccionada];
    let totalConDemasia = this.apiData.detallesSustratos.reduce((acc: number, s: any, i: number) => {
      return this.sustratosSeleccionados[i] ? acc + s.usado : acc;
    }, 0);
    let totalReal = totalConDemasia - (this.apiData.planificacion.hojasDemasia || 0);
    this.totalDenominador = totalConDemasia;
    this.rendimientoFinal = (numerador / totalConDemasia) * 100;
    this.rendimientoNeto = (numerador / totalReal) * 100; // Variable para el HTML

    setTimeout(() => {
      this.updateCharts(numerador, totalConDemasia, totalReal);
    }, 50);
  }

  updateCharts(bueno: number, totalPresupuesto: number, totalReal: number) {
    if (!this.chart_) {
      const ctx = document.getElementById('chartRendimiento') as HTMLCanvasElement;
      if (ctx) this.initChart(ctx);
    }
    this.applyChartData(bueno, totalPresupuesto, this.chart_);

    if (!this.chart_real) {
      const ctx_ = document.getElementById('chartRendimientoreal') as HTMLCanvasElement;
      if (ctx_) this.initChartReal(ctx_);
    }
    this.applyChartData(bueno, totalReal, this.chart_real);
  }
  initChart(ctx: HTMLCanvasElement) {
    this.chart_ = new Chart(ctx, {
      type: 'doughnut',
      data: { datasets: [{ data: [0, 0], backgroundColor: ['#00d1b2', '#eeeeee'], borderWidth: 0, circumference: 180, rotation: 270 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          datalabels: { display: false } // <--- ESTO MATA LOS NÚMEROS ESCRITOS
        }
      },
      // plugins: { legend: { display: false }, tooltip: { enabled: false } } }
    });
  }

  initChartReal(ctx: HTMLCanvasElement) {
    this.chart_real = new Chart(ctx, {
      type: 'doughnut',
      data: { datasets: [{ data: [0, 0], backgroundColor: ['#00d1b2', '#eeeeee'], borderWidth: 0, circumference: 180, rotation: 270 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          datalabels: { display: false } // <--- ESTO MATA LOS NÚMEROS ESCRITOS
        }
      }
      // plugins: { legend: { display: false }, tooltip: { enabled: false } } }
    });
  }

  applyChartData(bueno: number, total: number, chartObj: any) {
    if (!chartObj) return;
    const datoVisual = bueno > total ? total : bueno;
    const faltante = total > bueno ? total - bueno : 0;
    const porcentaje = (bueno / total) * 100;
    let color = porcentaje >= 100 ? '#48c774' : (bueno > total ? '#ffdd57' : '#00d1b2');

    chartObj.data.datasets[0].data = [datoVisual, faltante];
    chartObj.data.datasets[0].backgroundColor = [color, '#eeeeee'];
    chartObj.update();
  }

  toggleMateriaPrima() {
    this.mostrarMateriaPrima = !this.mostrarMateriaPrima;
  }



  public Ordenes = []
  public Despachos = []
  public Lotes = []
  public despachos = []
  public devoluciones = []
  public gestiones = []
  public requisiciones = []
  public trabajos = []
  public adicionales = []


  // public cargando = false;
  public sinBusqueda = true;
  public vacio = false;


  public Tinta = 0;
  public Amarillo = 0;
  public Cyan = 0;
  public Magenta = 0;
  public Negro = 0;
  public Otros_c = 0;

  public chart: any;
  public sustrato_char: any
  public barniz_char: any
  public Caja_chart: any
  public Pega_chart: any

  public Barniz_load: boolean = true;
  public Cajas_loading: boolean = true;
  public Pega_loading: boolean = true;

  public modal_despacho: boolean = false;

  goto(id) {
    this.router.navigateByUrl(`orden-produccion/${id}`)
  }

  rolltoorders() {
    document.getElementById('orders').scrollIntoView();
  }

  public despachos_filtrado = []
  public despachos_orden;
  public Ej_montados;
  public hojasTrabajadas
  despachos_porcentaje(op, montaje, orden) {
    this.Ej_montados = montaje;
    this.consumos('0', op)
    this.modal_consumos = false;
    this.modal_despacho = true;
    this.hojasTrabajadas = orden.paginas_o
    this.api.GetDespachoByOrden(op)
      .subscribe((resp: any) => {
        const certificadosVistos = new Set<string>();

        this.despachos_filtrado = resp.filter(item => {
          // Saca todos los certificados de este despacho
          const certificados = item.despacho.map(d => d.certificado);

          // Verifica si alguno ya fue visto
          const yaExiste = certificados.some(cert => certificadosVistos.has(cert));

          if (yaExiste) {
            return false; // descártalo
          }

          // Guarda todos los certificados nuevos
          certificados.forEach(cert => certificadosVistos.add(cert));
          return true; // déjalo pasar
        });
        this.despachos_orden = op
        // console.log(this.despachos_filtrado)
      })
  }

  Devolucion_Barniz: number = 0;
  sumarDescuentos(descuento) {
    this.Devolucion_Barniz = Number(this.Devolucion_Barniz) + Number(descuento);
  }

  public Producto_select;
  Producto_Selected(e) {
    if (e === '#') {
      this.Producto_select = undefined
    } else {
      this.api.getOneById(e)
        .subscribe((resp: any) => {
          this.Producto_select = resp.producto.producto
          return
        })
    }
    // console.log(this.Producto_select)
  }

  descuento(grupo, Nombre, Marca) {
    if (grupo === 'Barniz') {
      let descuento = this.data.Barniz.Devolucion_Barniz.find(x => x.Nombre === Nombre && x.Marca === Marca)
      if (!descuento) {
        return 0
      }
      return descuento.Cantidad
    }
    if (grupo === 'Pega') {
      let descuento = this.data.Pega.Devolucion_Pega.find(x => x.Nombre === Nombre && x.Marca === Marca)
      if (!descuento) {
        return 0
      }
      return descuento.Cantidad
    }
    if (grupo === 'Caja') {
      let descuento = this.data.Caja.Devolucion_Caja.find(x => x.Nombre === Nombre)
      if (!descuento) {
        return 0
      }
      return descuento.Cantidad
    }

  }

  restar__(nombre, marca, cantidad) {
    let descuento = this.data.devoluciones_totales.find(x => x.Nombre === nombre && x.Marca === marca)
    if (descuento) {
      let salida = cantidad - descuento.Cantidad
      return salida.toFixed(2)
    } else {
      return cantidad.toFixed(2)
    }
  }

  puntoYcoma(n) {
    if (!n) {
      return 0
    }
    n = Number(n).toFixed(2)
    return n = new Intl.NumberFormat('de-DE').format(n)
  }

  PegaChart() {

    let pega = this.data.Pega.Pega
    let labels = []
    let cantidades = []

    for (let i = 0; i < pega.length; i++) {
      labels.push(pega[i].Nombre)
      cantidades.push(pega[i].Cantidad - this.descuento('Pega', pega[i].Nombre, pega[i].Marca))
    }
    if (this.Pega_chart) {
      this.Pega_chart.destroy();
    }

    this.Pega_chart = new Chart("Pega_chart", {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sustrato consumido',
          data: cantidades,
          backgroundColor: [
            'rgb(255, 99, 132,0.2)',
            'rgb(54, 162, 235,0.2)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
          ],
          hoverOffset: 4
        }]
      }
    })
  }

  CajasChart() {
    let cajas = []
    let cantidad = []

    for (let i = 0; i < this.data.Caja.Caja.length; i++) {
      cajas.push(this.data.Caja.Caja[i].Nombre)
      cantidad.push(this.data.Caja.Caja[i].Cantidad - this.descuento('Caja', this.data.Caja.Caja[i].Nombre, 0))
    }

    if (this.Caja_chart) {
      this.Caja_chart.destroy();
    }

    this.Caja_chart = new Chart("Caja_chart", {
      type: 'bar',
      data: {
        labels: cajas,
        datasets: [{
          label: 'Cajas consumidas',
          data: cantidad,
          maxBarThickness: 30,
          backgroundColor: [
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
          ],
          borderColor: [
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ],
          borderWidth: 1,
          xAxisID: 'x'
        }]
      },

      options: {
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false,
            labels: {
              color: 'rgb(255, 99, 132)'
            }
          },
          title: {
            display: true,
            text: 'Cajas consumidas'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              maxTicksLimit: 10,
            },
            title: {
              display: true,
              text: 'Cajas'
            }
          },
          'x': {
            title: {
              display: true,
              text: 'Cantidad de cajas consumidas (Und)'
            }
          }
        }
      }
    })
  }

  BarnizChart() {

    if (this.barniz_char) {
      this.barniz_char.destroy();
    }

    this.barniz_char = new Chart("Barniz_chart", {
      type: 'pie',
      data: {
        labels: ['Barniz S/Impresión', 'Barniz acuoso'],
        datasets: [{
          label: 'Sustrato consumido',
          data: [this.data.Barniz.Total_Barniz - this.data.Barniz.Devolucion_Total_barniz, this.data.Barniz.Total_barniz_acuoso * 0.868],
          backgroundColor: [
            'rgb(255, 99, 132,0.2)',
            'rgb(54, 162, 235,0.2)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
          ],
          hoverOffset: 4
        }]
      }
    })
  }

  SustratoChar() {
    if (this.sustrato_char) {
      this.sustrato_char.destroy();
    }
    this.sustrato_char = new Chart("Sustrato_chart", {
      type: 'doughnut',
      data: {
        labels: ['Papel', 'Cartón'],
        datasets: [{
          label: 'Sustrato consumido',
          data: [this.data.asignados.Papel, this.data.asignados.Carton],
          backgroundColor: [
            'rgb(255, 99, 132,0.2)',
            'rgb(54, 162, 235,0.2)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
          ],
          hoverOffset: 4
        }]
      }
    })
  }


  public producto_form: boolean = false;
  public Productos_by_client;
  Cliente_Selected(e) {
    this.api.getById(e)
      .subscribe((resp: any) => {
        // console.log(resp)
        this.producto_form = true;
        this.Productos_by_client = resp
      })
  }

  public busqueda_clientes;
  public busqueda_orden;
  public clientes_form: boolean = false;

  busquedaCliente() {
    this.api.GetClientes()
      .subscribe((resp: any) => {
        this.busqueda_clientes = resp;
        this.clientes_form = true
      })
  }
  busquedaInteligente(e) {
    if (e === 'cliente') {
      this.api.GetClientes()
        .subscribe((resp: any) => {
          this.busqueda_clientes = resp;
          this.clientes_form = true
        })
    } else {
      this.clientes_form = false;
      this.producto_form = false;
    }
    if (e === 'orden') {
      this.busqueda_orden = true;
    } else {
      this.busqueda_orden = false;
    }
  }

  // test grafica
  createChart() {

    if (this.chart) {
      this.chart.destroy();
    }

    let Amarillo = this.data.asignados.detalle_tintas.Amarillo;
    Amarillo = Number(Amarillo) + Number(this.data.adicionales.detalle_tintas.Amarillo)
    Amarillo = Amarillo.toFixed(2)
    Amarillo = Number(Amarillo) - Number(this.data.Colores_devueltos.Amarillo)
    Amarillo = Amarillo.toFixed(2)

    let Magenta = this.data.asignados.detalle_tintas.Magenta;
    Magenta = Number(Magenta) + Number(this.data.adicionales.detalle_tintas.Magenta)
    Magenta = Magenta.toFixed(2)
    Magenta = Number(Magenta) - Number(this.data.Colores_devueltos.Magenta)
    Magenta = Magenta.toFixed(2)

    let Cyan = this.data.asignados.detalle_tintas.Cyan;
    Cyan = Number(Cyan) + Number(this.data.adicionales.detalle_tintas.Cyan)
    Cyan = Cyan.toFixed(2)
    Cyan = Number(Cyan) - Number(this.data.Colores_devueltos.Cyan)
    Cyan = Cyan.toFixed(2)

    let Negro = this.data.asignados.detalle_tintas.Negro;
    Negro = Number(Negro) + Number(this.data.adicionales.detalle_tintas.Negro)
    Negro = Negro.toFixed(2)
    Negro = Number(Negro) - Number(this.data.Colores_devueltos.Negro)
    Negro = Negro.toFixed(2)

    let Pantone = this.data.asignados.detalle_tintas.Pantone;
    Pantone = Number(Pantone) + Number(this.data.adicionales.detalle_tintas.Pantone)
    Pantone = Pantone.toFixed(2)
    Pantone = Number(Pantone) - Number(this.data.Colores_devueltos.Pantone)
    Pantone = Pantone.toFixed(2)

    this.chart = new Chart("MyChart", {
      type: 'bar', //this denotes tha type of chart

      data: {// values on X-Axis
        labels: ['Amarillo', 'Magenta', 'Cyan', 'Negro', 'Pantone'],
        datasets: [{
          label: 'Colores',
          data: [Amarillo, Magenta, Cyan, Negro, Pantone],
          backgroundColor: [
            'rgb(255, 255, 0,0.2)',
            'rgb(228, 0, 120,0.2)',
            'rgb(0, 255, 255,0.2)',
            'rgb(0, 0, 0,0.2)',
            'rgb(0, 115, 54,0.2)',
          ],
          borderColor: [
            'rgb(255, 255, 0)',
            '#e40078',
            'rgb(0, 255, 255)',
            'rgb(0, 0, 0)',
            'rgb(0, 115, 54)',
          ],
          borderWidth: 1,
        }]
      },
      options: {
        aspectRatio: 2.5,
        plugins: {
          legend: {
            display: false,
            labels: {
              color: 'rgb(255, 99, 132)'
            }
          },
          title: {
            display: true,
            text: 'Tintas consumidas'
          }
        },
        scales: {
          yAxisID: {
            beginAtZero: true,
            display: true,
            title: {
              display: true,
              text: 'Cantidad de tinta consumida (kg)'
            }
          },
          xAxisID: {
            title: {
              display: true,
              text: 'Colores'
            }
          }
        }
      }

    });

  }

  // test grafica

  public DetallesTinta: boolean = false;
  modalTintas() {
    if (this.DetallesTinta) {
      this.DetallesTinta = false
    } else {
      this.DetallesTinta = true;
    }
  }

  alert(id) {
    this.router.navigateByUrl(`orden-produccion/${id}`)
  }

  public Sustratos_suma = []
  public total_sustrato = 0;
  public Sustrato_load: boolean = true
  sumaSustrato() {
    this.peso_hojas = 0;
    this.peso_carton = 0;
    this.Sustratos_suma = [];
    this.total_sustrato = 0;
    this.Sustrato_load = true;

    const grupoSustratoId = '61f92a1f2126d717f004cca6';

    const agregarOModificar = (materialList, cantidad, operacion = 'sumar') => {
      const index = this.Sustratos_suma.findIndex(s =>
        s.Nombre === materialList.Nombre &&
        s.Marca === materialList.Marca &&
        s.Ancho === materialList.Ancho &&
        s.Largo === materialList.Largo &&
        s.Calibre === materialList.Calibre &&
        s.Gramaje === materialList.Gramaje
      );

      const cantidadFinal = Number(cantidad);

      if (index >= 0) {
        // Si existe, suma o resta
        this.Sustratos_suma[index].Cantidad += (operacion === 'restar' ? -cantidadFinal : cantidadFinal);
      } else if (operacion === 'sumar') {
        // Si no existe y es suma, lo agrega
        this.Sustratos_suma.push({ ...materialList, Cantidad: cantidadFinal });
      }
      // Si no existe y es una resta, no se agrega porque no había un material original.
    };

    // 1. Sumamos los sustratos
    this.Lotes.forEach(lote => {
      lote.material.forEach(item => {
        const mat = item.material;
        if (mat.grupo === grupoSustratoId) {
          const data = {
            Nombre: mat.nombre,
            Marca: mat.marca,
            Ancho: mat.ancho,
            Largo: mat.largo,
            Calibre: mat.calibre,
            Gramaje: mat.gramaje
          };
          agregarOModificar(data, item.cantidad, 'sumar');
        }
      });
    });

    // 2. Restamos las devoluciones
    this.devoluciones.forEach(dev => {
      dev.filtrado.forEach(item => {
        const mat = item.material;
        if (mat.grupo === grupoSustratoId) {
          const data = {
            Nombre: mat.nombre,
            Marca: mat.marca,
            Ancho: mat.ancho,
            Largo: mat.largo,
            Calibre: mat.calibre,
            Gramaje: mat.gramaje
          };
          agregarOModificar(data, item.cantidad, 'restar');
        }
      });
    });

    // 3. Eliminamos materiales con cantidad 0 o negativa (opcional)
    this.Sustratos_suma = this.Sustratos_suma.filter(s => s.Cantidad > 0);

    this.Sustrato_load = false;
  }



  detalles_sustratos: boolean = false;
  detalles_sustrato() {
    if (!this.detalles_sustratos) {
      this.detalles_sustratos = true
    } else {
      this.detalles_sustratos = false
    }
  }

  detalles_tintas: boolean = false
  detalles_tinta() {
    if (!this.detalles_tintas) {
      this.detalles_tintas = true
    } else {
      this.detalles_tintas = false
    }
  }

  public peso_carton = 0;
  public peso_hojas = 0;
  MostrarPeso(w, x, y, z) {

    let all = Number(w) * Number(x) * Number(y) * Number(z);
    let peso = all / 10000000000;

    if (x < 100) {
      this.peso_hojas = this.peso_hojas + peso;
    } else {
      this.peso_carton = this.peso_carton + peso;
    }

    this.total_sustrato = Number(this.total_sustrato) + Number(peso)
    return peso.toFixed(2)
  }

  public Tinta_load: boolean = true
  public Suma_Tintas = [];

  aMASa(a, b) {
    const safeNumber = (n) => Number(n ?? 0) || 0;

    const numA = safeNumber(a);
    const numB = safeNumber(b);

    console.log(numA, '<>', numB);

    const c = (numA + numB).toFixed(2);
    return c;
  }
  aMENOSa(a, b) {
    let c = (Number(a) - Number(b)).toFixed(2);
    return c
  }

  devuelto__(Nombre, Marca) {
    let devoluciones = this.data.devoluciones_totales.find(x => x.Nombre === Nombre && x.Marca === Marca)
    // console.log(devoluciones)
    return devoluciones[0].Cantidad
  }
  sumaTinta() {
    this.Tinta = 0;
    this.Suma_Tintas = []
    this.Amarillo = 0;
    this.Cyan = 0;
    this.Magenta = 0;
    this.Negro = 0;
    this.Otros_c = 0;
    for (let i = 0; i < this.data.Lotes.length; i++) {
      for (let x = 0; x < this.data.Lotes[i].material.length; x++) {
        if (this.data.Lotes[i].material[x].material.grupo === '61fd54e2d9115415a4416f17') {
          this.Tinta = Number(this.Tinta) + Number(this.data.Lotes[i].material[x].EA_Cantidad)

          switch (this.Lotes[i].material[x].material.color) {
            case 'Amarillo':
              this.Amarillo = Number(this.Amarillo) + Number(this.data.Lotes[i].material[x].EA_Cantidad)
              break;
            case 'Cyan':
              this.Cyan = this.Cyan + Number(this.data.Lotes[i].material[x].EA_Cantidad)
              break;
            case 'Magenta':
              this.Magenta = this.Magenta + Number(this.data.Lotes[i].material[x].EA_Cantidad)
              break;
            case 'Negro':
              this.Negro = this.Negro + Number(this.data.Lotes[i].material[x].EA_Cantidad)
              break;
            default:
              this.Otros_c = this.Otros_c + Number(this.data.Lotes[i].material[x].EA_Cantidad)
              break;
          }
          // // console.log(this.Lotes[i].material[x].material.color)
          let data = {
            Nombre: this.Lotes[i].material[x].material.nombre,
            Marca: this.Lotes[i].material[x].material.marca,
            Cantidad: this.Lotes[i].material[x].EA_Cantidad
          }

          let existe = this.Suma_Tintas.findIndex(x => x.Nombre === data.Nombre && x.Marca === data.Marca)

          if (existe < 0) {
            this.Suma_Tintas.push(data)
          } else {
            this.Suma_Tintas[existe].Cantidad = Number(this.Suma_Tintas[existe].Cantidad) + Number(data.Cantidad)
          }
        }
      }
      if (i == this.data.Lotes.length - 1) {
        this.Tinta_load = false;
      }
    }
  }

  GetDespacho(orden) {
    // alert(orden)
    let despacho = this.Despachos.find(despacho => despacho.despacho.op == orden)
    for (let i = 0; i < this.Despachos.length; i++) {
      for (let y = 0; y < this.Despachos[i].despacho.length; y++) {
        if (this.Despachos[i].despacho[y].op == orden) {
          return (this.Despachos[i].fecha)
        }
      }
    }
    return 'Sin despachar'
  }

  public g_trabajos = []
  public g_gestiones = []
  public modal_gestiones = false;
  gestiones_(id, op) {
    this.g_trabajos = this.data.Trabajos.filter(x => x.orden === id)
    this.g_gestiones = this.data.Gestiones.filter(x => x.op === id)
    this.modal_gestiones = true;

    // console.log(this.g_trabajos)

  }

  public c_lotes = []
  public c_devoluciones = []
  public lote_mayor: any = [];
  public modal_consumos = false;
  consumos(id, op) {
    this.lote_mayor = []
    this.c_devoluciones = []
    this.c_devoluciones = this.data.devoluciones.filter(x => x.orden === op)
    // console.log(this.c_devoluciones)

    this.c_lotes = this.data.Lotes.filter(x => x.orden === op)

    for (let i = 0; i < this.c_lotes.length; i++) {
      for (let n = 0; n < this.c_lotes[i].material.length; n++) {

        // // console.log(this.c_lotes[i].material[n].material.calibre)
        let index = this.lote_mayor.find(x => x.nombre === this.c_lotes[i].material[n].material.nombre && x.ancho === this.c_lotes[i].material[n].material.ancho && x.largo === this.c_lotes[i].material[n].material.largo && x.calibre === this.c_lotes[i].material[n].material.calibre && x.gramaje === this.c_lotes[i].material[n].material.gramaje)

        if (!index) {
          let marca = this.c_lotes[i].material[n].material.marca
          let id = this.c_lotes[i].material[n].material._id
          let cant = this.c_lotes[i].material[n].cantidad
          // cant = cant.toFixed(2)
          if (this.c_lotes[i].material[n].material.ancho && (i === 0 || i > 0 && this.lote_mayor.some(l => l.id === id))) {
            let ancho = this.c_lotes[i].material[n].material.ancho
            let largo = this.c_lotes[i].material[n].material.largo
            let calibre = this.c_lotes[i].material[n].material.calibre
            let gramaje = this.c_lotes[i].material[n].material.gramaje
            this.lote_mayor.push({ op, id, marca, nombre: this.c_lotes[i].material[n].material.nombre, cantidad: cant, ancho, largo, calibre, gramaje })
          } else {
            this.lote_mayor.push({ op, id, marca, nombre: this.c_lotes[i].material[n].material.nombre, cantidad: cant, ancho: null, largo: null, calibre: null, gramaje: null })
          }
        } else {
          let b = this.lote_mayor.findIndex(x => x.nombre === this.c_lotes[i].material[n].material.nombre)
          this.lote_mayor[b].cantidad = Number(this.lote_mayor[b].cantidad) + Number(this.c_lotes[i].material[n].cantidad)
        }


      }
    }
    this.modal_consumos = true;
  }

  public detalles_pega: boolean = false;
  detalle_pega() {
    if (!this.detalles_pega) {
      this.detalles_pega = true;
    } else {
      this.detalles_pega = false;
    }
  }

  public detalles_barniz: boolean = false;
  detalle_barniz() {
    if (!this.detalles_barniz) {
      this.detalles_barniz = true;
    } else {
      this.detalles_barniz = false;
    }
  }

  public data;
  tintasOrdenFinal = [];
  tintasAdicionalFinal = [];

  totalOrden = 0;
  totalAdicional = 0;

  procesarTintas() {
    const { devolucionesOrden, devolucionesAdicional } =
      this.agruparDevoluciones(this.data.devoluciones);

    this.tintasOrdenFinal = this.restarDevoluciones(
      this.data.asignados.Tintas,
      devolucionesOrden
    );

    this.tintasAdicionalFinal = this.restarDevoluciones(
      this.data.adicionales.Tintas,
      devolucionesAdicional
    );

    this.calcularTotales();
  }


  agruparDevoluciones(devoluciones: any[]) {
    const devolucionesOrden = {};
    const devolucionesAdicional = {};

    devoluciones.forEach(dev => {
      const target = dev.orden === '#'
        ? devolucionesAdicional
        : devolucionesOrden;

      dev.filtrado.forEach(item => {
        const key = `${item.material.nombre}__${item.material.marca}`;
        target[key] = (target[key] || 0) + item.cantidad;
      });
    });

    return { devolucionesOrden, devolucionesAdicional };
  }

  restarDevoluciones(tintas: any[], devoluciones: any) {
    return tintas.map(tinta => {
      const key = `${tinta.Nombre}__${tinta.Marca}`;
      return {
        ...tinta,
        Cantidad: Math.max(
          tinta.Cantidad - (devoluciones[key] || 0),
          0
        )
      };
    });
  }


  calcularTotales() {
    this.totalOrden = this.tintasOrdenFinal
      .reduce((s, t) => s + t.Cantidad, 0);

    this.totalAdicional = this.tintasAdicionalFinal
      .reduce((s, t) => s + t.Cantidad, 0);
  }


  Buscar_estadisticas(desde, hasta) {
    this.vacio = false;
    this.sinBusqueda = false;
    this.cargando = true;
    if (desde === 'orden' && hasta === 'orden') {
      let op = (<HTMLInputElement>document.getElementById('OP')).value
      if (!op) {
        Swal.fire({
          title: 'Debes llenar los campos',
          text: 'Debes introducir un número de orden de producción',
          icon: 'error',
          showConfirmButton: false,
        })
        return
      }
      this.api.EstadisticasOrden({ op })
        .subscribe((resp: any) => {
          if (resp.length < 1) {
            this.vacio = true;
          }
          if (resp.mensaje) {
            Swal.fire({
              title: 'Error',
              text: resp.mensaje,
              icon: 'error',
              showConfirmButton: false
            })
            return
          }
          this.data = resp;
          this.Tinta_load = false
          this.Ordenes = resp.orden
          this.Despachos = resp.despachos
          this.devoluciones = resp.devoluciones
          this.gestiones = resp.gestiones
          this.Lotes = resp.lotes
          this.requisiciones = resp.requisiciones
          this.trabajos = resp.trabajos
          this.adicionales = resp.Adicionales
          // // console.log(resp)
          this.cargando = false
          this.Sustrato_load = false;
          this.Barniz_load = false;
          this.Cajas_loading = false;
          this.Pega_loading = false;
          // this.sumaTinta();
          // this.sumaSustrato();
          this.sumaDevoluciones(this.devoluciones)
          this.createChart()
          this.SustratoChar()
          this.BarnizChart()
          this.CajasChart()
          this.PegaChart()
          this.procesarTintas();

        })
      return
    }

    if (this.clientes_form) {
      // console.log(desde,'/',hasta)
      let data;
      let cliente = (<HTMLInputElement>document.getElementById('cliente_select')).value
      if (cliente === '#') {
        Swal.fire({
          title: 'Seleccione un cliente',
          text: 'Debe indicar un cliente para realizar la busqueda especifica',
          icon: 'error',
          showConfirmButton: false
        })
        return
      } else {
        const client = { cliente }
        let producto = (<HTMLInputElement>document.getElementById('producto_select')).value
        if (producto != "#") {
          if (desde && hasta) {
            data = { cliente: client, producto: this.Producto_select, desde, hasta }
          } else {
            data = { cliente: client, producto: this.Producto_select }
          }
        } else {
          if (desde && hasta) {
            data = { cliente: client, desde, hasta }

          } else {

            data = { cliente: client }
          }
        }
        // TEST
        this.api.EstadisticasOrden(data)
          .subscribe((resp: any) => {
            if (resp.length < 1) {
              this.vacio = true;
            }
            if (resp.mensaje) {
              Swal.fire({
                title: 'Error',
                text: resp.mensaje,
                icon: 'error',
                showConfirmButton: false
              })
              return
            }
            this.data = resp;
            this.Tinta_load = false
            this.Ordenes = resp.orden
            this.Despachos = resp.despachos
            this.devoluciones = resp.devoluciones
            this.gestiones = resp.gestiones
            this.Lotes = resp.lotes
            this.requisiciones = resp.requisiciones
            this.trabajos = resp.trabajos
            this.adicionales = resp.Adicionales
            // console.log(resp)
            this.cargando = false
            this.Sustrato_load = false;
            this.Barniz_load = false;
            this.Cajas_loading = false;
            this.Pega_loading = false;
            // this.sumaTinta();
            // this.sumaSustrato();
            this.sumaDevoluciones(this.devoluciones)
            this.createChart()
            this.SustratoChar()
            this.BarnizChart()
            this.CajasChart()
            this.PegaChart()
            this.procesarTintas();

          })
        return
        // TEST

      }
    }

    if (!desde || !hasta) {
      this.cargando = false;
      this.sinBusqueda = true;
      Swal.fire({
        title: 'Debes seleccionar 2 fechas',
        text: 'Debes indicar un intervalo de busqueda valido (Fecha inicial de busqueda hasta fecha final).',
        icon: 'error',
        showConfirmButton: false,
      })
      return
    }
    if (desde > hasta) {
      this.cargando = false;
      this.sinBusqueda = true;
      Swal.fire({
        title: 'Error en la busqueda',
        text: 'La fecha de inicio no puede ser mayor a la fecha final',
        icon: 'error',
        showConfirmButton: false
      })
      return
    }
    this.api.EstadisticasOrden({ desde, hasta })
      .subscribe((resp: any) => {
        if (resp.length < 1) {
          this.vacio = true;
        }

        this.data = resp;
        this.Tinta_load = false
        this.Ordenes = resp.orden
        this.Despachos = resp.despachos
        this.devoluciones = resp.devoluciones
        this.gestiones = resp.gestiones
        this.Lotes = resp.lotes
        this.requisiciones = resp.requisiciones
        this.trabajos = resp.trabajos
        this.adicionales = resp.Adicionales
        this.cargando = false
        this.Sustrato_load = false;
        this.Barniz_load = false;
        this.Cajas_loading = false;
        this.Pega_loading = false;
        // this.sumaTinta();
        // this.sumaSustrato();
        this.sumaDevoluciones(this.devoluciones)
        console.log(this.data, '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        console.log(this.devoluciones, '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        this.createChart()
        this.SustratoChar()
        this.BarnizChart()
        this.CajasChart()
        this.PegaChart()
        this.procesarTintas();
      }, err => {
        // console.log(err)
      })

  }


  // VARIABLES DE DEVOLUCION
  public D_Negro = 0
  public D_Amarillo = 0
  public D_Cyan = 0
  public D_Magenta = 0
  public D_Pantone = 0
  public D_Tintas = []

  sumaDevoluciones(dev) {
    this.D_Negro = 0
    this.D_Amarillo = 0
    this.D_Cyan = 0
    this.D_Magenta = 0
    this.D_Pantone = 0
    this.D_Tintas = []
    for (let i = 0; i < dev.length; i++) {
      for (let x = 0; x < dev[i].filtrado.length; x++) {
        let material = dev[i].filtrado[x]
        let color = material.material.color
        let grupo = material.material.grupo
        if (color && grupo == "61fd54e2d9115415a4416f17") {
          switch (color) {
            case 'Amarillo':
              this.D_Amarillo = this.D_Amarillo + Number(material.cantidad)
              break;
            case 'Cyan':
              this.D_Cyan = this.D_Cyan + Number(material.cantidad)
              break;
            case 'Magenta':
              this.D_Magenta = this.D_Magenta + Number(material.cantidad)
              break;
            case 'Negro':
              this.D_Negro = this.D_Negro + Number(material.cantidad)
              break;
            default:
              this.D_Pantone = this.D_Pantone + Number(material.cantidad)
              break;
          }
        }

        let index = this.D_Tintas.findIndex(x => x.color == material.material.nombre && x.marca == material.marca)
        if (index == -1) {
          this.D_Tintas.push({ color: material.nombre, marca: material.marca, cantidad: material.cantidad })
          // alert(index)
        } else {
          this.D_Tintas[index].cantidad = this.D_Tintas[index].cantidad + Number(material.cantidad)
          // alert('aja')
        }

      }
    }
  }


  devoluciones_(id,) {
    let data = 0;
    let x = 0
    let y = 0
    for (let i = 0; i < this.c_devoluciones.length; i++) {
      x++
      y = 0
      let len = this.c_devoluciones[i].filtrado
      for (let n = 0; n < len.length; n++) {
        y++;
        if (this.c_devoluciones[i].filtrado[n].material == id) {
          data = data + this.c_devoluciones[i].filtrado[n].cantidad;
          // // console.log(this.c_devoluciones[i].filtrado[n])
        }
        if (x == this.c_devoluciones.length && y == len.length) {
          if (data > 0) {
            return data.toFixed(2);
          } else {
            return data
          }
        }
      }
    }

    // let dev_filtered = this.c_devoluciones.filter(x=> x.filtrado.material === id)
    // // console.log(dev_filtered)
    // if(dev_filtered.length > 0){
    //   return '150'
    // }else{
    //   return '0'
    // }

    // for(let i=0;i<this.c_devoluciones.length;i++){
    //   let len = this.c_devoluciones[i].filtrado
    //   for(let n=0;n<len.length;n++){
    //     if(this.c_devoluciones[i].filtrado[n].material === id){
    //       let duplicado = this.devoluc.find(x => x.material == id);
    //       if(duplicado){
    //         let index_ = this.devoluc.findIndex(x=> x.material == id)
    //         this.devoluc[index_].cantidad = this.devoluc[index_].cantidad + this.c_devoluciones[i].filtrado[n].cantidad
    //       }else{
    //         this.devoluc.push({material:id, cantidad:this.c_devoluciones[i].filtrado[n].cantidad})
    //       }
    //     }
    //   }
    // }
  }

}
