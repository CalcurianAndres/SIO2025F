import { Component, OnInit } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

  constructor(private api: RestApiService) { }

  ngOnInit(): void {
    this.GetGrupos();
    this.traerAlmacen();
  }


  public grupos = []
  public tipo_ = 'general'
  public grupo = '#'
  public cargando: boolean = false;
  public materiales = [];
  public almacenado: any
  public entradas_hasta_hoy = []
  public almacen_detallado = []
  public saldos_iniciales = []
  public saldos_finales = []
  public unidades = []
  public facturados = []
  public asignaciones = []
  public devoluciones = []
  public general = []
  public fechas = []

  desde = '';
  hasta = '';
  data: any = [];
  loading = false;



  exportarExcel() {
    if (!this.data?.length) return;

    const rows = [];
    let totalInicial = 0;
    let totalEntradas = 0;
    let totalSalidas = 0;
    let totalDevoluciones = 0;
    let totalFinal = 0;

    // Encabezados
    rows.push([
      'Material',
      'Saldo Inicial',
      'Entradas',
      'Salidas',
      'Devoluciones',
      'Saldo Final'
    ]);

    // Data
    this.data.forEach(item => {
      totalInicial += item.saldo_inicial;
      totalEntradas += item.entradas;
      totalSalidas += item.salidas;
      totalDevoluciones += item.devoluciones;
      totalFinal += item.saldo_final;

      rows.push([
        this.formatearMaterial(item),
        item.saldo_inicial,
        item.entradas,
        item.salidas,
        item.devoluciones,
        item.saldo_final
      ]);
    });

    // Totales
    // rows.push([
    //   'TOTALES',
    //   totalInicial,
    //   totalEntradas,
    //   totalSalidas,
    //   totalDevoluciones,
    //   totalFinal
    // ]);

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // 🧊 Freeze header
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    // 📐 Columnas
    worksheet['!cols'] = [
      { wch: 45 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 16 }
    ];

    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1F4E78' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: this.bordes()
    };

    const numberStyle = {
      numFmt: '#,##0.00',
      alignment: { horizontal: 'right' },
      border: this.bordes()
    };

    const positiveStyle = {
      ...numberStyle,
      font: { color: { rgb: '006100' } }
    };

    const negativeStyle = {
      ...numberStyle,
      font: { color: { rgb: '9C0006' } }
    };

    // const totalStyle = {
    //   font: { bold: true },
    //   fill: { fgColor: { rgb: 'D9E1F2' } },
    //   border: this.bordes(),
    //   numFmt: '#,##0.00'
    // };

    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) cell.s = headerStyle;
    }

    for (let R = 1; R <= range.e.r; R++) {
      worksheet[XLSX.utils.encode_cell({ r: R, c: 1 })].s = numberStyle;
      worksheet[XLSX.utils.encode_cell({ r: R, c: 2 })].s = positiveStyle;
      worksheet[XLSX.utils.encode_cell({ r: R, c: 3 })].s = negativeStyle;
      worksheet[XLSX.utils.encode_cell({ r: R, c: 4 })].s = positiveStyle;
      worksheet[XLSX.utils.encode_cell({ r: R, c: 5 })].s = numberStyle;
    }

    // Totales fila final
    const lastRow = range.e.r;
    for (let C = 0; C <= range.e.c; C++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: lastRow, c: C })];
      // if (cell) cell.s = totalStyle;
    }

    const workbook: XLSX.WorkBook = {
      Sheets: { Inventario: worksheet },
      SheetNames: ['Inventario']
    };

    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    saveAs(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }),
      `Reporte_Inventario_${this.desde}_al_${this.hasta}.xlsx`
    );
  }

  bordes() {
    return {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
  }

  formatearMaterial(item: any): string {
    let texto = item.nombre;

    if (item.marca) texto += ` (${item.marca})`;
    if (item.ancho && item.largo) texto += ` (${item.ancho} x ${item.largo})`;
    if (item.gramaje) texto += ` ${item.gramaje} g/m²`;
    if (item.calibre) texto += ` (${item.calibre} pt)`;

    return texto;
  }


  buscar() {
    if (!this.desde || !this.hasta) {
      alert('Selecciona un rango de fechas.');
      return;
    }
    this.loading = true;
    this.api.postReporteFinal(this.desde, this.hasta).subscribe({
      next: (res: any) => {
        this.data = res.movimientos;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  GetGrupos() {
    this.api.GetGrupoMp()
      .subscribe((resp: any) => {
        this.grupos = resp
      })
  }

  traerAlmacen() {
    this.api.getAlmacenado()
      .subscribe((resp: any) => {
        this.almacenado = resp;
        for (let i = 0; i < this.almacenado.length; i++) {
          let existe = this.almacen_detallado.findIndex(x => x.nombre === this.almacenado[i].material.nombre && x.marca === this.almacenado[i].material.marca && x.ancho === this.almacenado[i].material.ancho && x.largo === this.almacenado[i].material.largo && x.calibre === this.almacenado[i].material.calibre && x.gramaje === this.almacenado[i].material.gramaje)
          if (existe >= 0) {
            this.almacen_detallado[existe].cantidad = Number(this.almacen_detallado[existe].cantidad) + Number(this.almacenado[i].cantidad)
          } else {
            this.almacen_detallado.push({ nombre: this.almacenado[i].material.nombre, ancho: this.almacenado[i].material.ancho, largo: this.almacenado[i].material.largo, calibre: this.almacenado[i].material.calibre, gramaje: this.almacenado[i].material.gramaje, marca: this.almacenado[i].material.marca, cantidad: this.almacenado[i].cantidad, unidad: this.almacenado[i].material.unidad })
          }
        }
      })
  }

  tipo(e) {
    this.tipo_ = e;
    // console.log(this.tipo_)
  }

  puntoYcoma(n) {
    if (!n) {
      return 0
    }
    n = Number(n).toFixed(2)
    return n = new Intl.NumberFormat('de-DE').format(n)
  }


  getDespachosFacturados(desde, hasta) {
    this.asignaciones = []
    this.cargando = true;
    this.facturados = [];
    let ordenes = []
    this.general = []
    this.fechas = []
    this.api.getDespachoFechas_(desde, hasta)
      .subscribe((resp: any) => {
        for (let i = 0; i < resp.length; i++) {
          for (let n = 0; n < resp[i].despacho.length; n++) {
            this.facturados.push(resp[i].despacho[n])
            this.fechas.push(resp[i].fecha)
            ordenes.push(resp[i].despacho[n].op)

            if (i === resp.length - 1) {
              if (n === resp[i].despacho.length - 1) {
                this.api.postBuscarLoteporFecha(ordenes, desde, hasta)
                  .subscribe((resp: any) => {
                    if (this.asignaciones.length < 1) {
                      this.asignaciones = resp;
                    }
                    // console.log(this.asignaciones)
                    this.api.postBuscarDevolucionesPorFecha(ordenes, desde, hasta)
                      .subscribe((resp: any) => {
                        this.devoluciones = resp;

                        for (let n = 0; n < this.devoluciones.length; n++) {
                          let index = this.asignaciones.findIndex(x => x.orden === this.devoluciones[n].orden && x.material._id === this.devoluciones[n].material._id)
                          if (index >= 0) {
                            // console.log(this.devoluciones[n].cantidad)
                            // console.log(this.asignaciones[index].devolucion)
                            this.asignaciones[index].devolucion = Number(this.asignaciones[index].devolucion) + Number(this.devoluciones[n].cantidad)
                            // console.log(this.asignaciones[index])
                          }

                          if (n === this.devoluciones.length - 1) {
                            for (let iterator = 0; iterator < this.asignaciones.length; iterator++) {
                              let index__ = this.general.findIndex(x => x.material._id === this.asignaciones[iterator].material._id)

                              if (index__ < 0) {
                                this.general.push({ material: this.asignaciones[iterator].material, total: (this.asignaciones[iterator].cantidad - this.asignaciones[iterator].devolucion).toFixed(2) })
                                // console.log(this.general)
                              }
                              else {
                                this.general[index__].total = Number(this.general[index__].total) + Number((this.asignaciones[iterator].cantidad - this.asignaciones[iterator].devolucion).toFixed(2))
                                this.general[index__].total = (this.general[index__].total).toFixed(2)
                              }
                              this.general = this.general.sort(function (a, b) {
                                if (a.material.nombre.toLowerCase() < b.material.nombre.toLowerCase()) return -1
                                if (a.material.nombre.toLowerCase() > b.material.nombre.toLowerCase()) return 1
                                return 0

                              })

                              this.cargando = false;
                            }
                          }
                        }

                      })
                  })
              }
            }
          }
        }
      })
  }

  realizarBusqueda(desde, hasta) {

    this.materiales = []
    if (this.grupo == '#') {
      Swal.fire({
        title: 'Seleccione un grupo',
        text: 'Debe seleccionar un grupo para realizar la consulta',
        icon: 'error',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false
      })
      return
    }

    if (!desde || !hasta) {
      Swal.fire({
        title: 'Error en fecha',
        text: 'Es necesario ingresar 2 fechas validas',
        icon: 'error',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false
      })
      return
    }

    if (desde > hasta) {
      Swal.fire({
        title: 'Error en fecha',
        text: 'las fechas solicitadas no son validas',
        icon: 'error',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false
      })
      return
    }

    this.cargando = true

    let data = {
      desde, hasta, grupo: this.grupo
    }

    this.api.putBuscarAlmacen(data)
      .subscribe((resp: any) => {
        let materials__ = resp;
        // console.log( materials__)
        for (let i = 0; i < materials__.length; i++) {
          if (materials__[i].grupo === this.grupo) {
            let index = this.materiales.findIndex(x => x.nombre === materials__[i].nombre && x.marca === materials__[i].marca && x.ancho === materials__[i].ancho && x.largo === materials__[i].largo && x.calibre === materials__[i].calibre && x.gramaje === materials__[i].gramaje)
            if (index < 0) {
              this.materiales.push({ nombre: materials__[i].nombre, ancho: materials__[i].ancho, largo: materials__[i].largo, calibre: materials__[i].calibre, gramaje: materials__[i].gramaje, marca: materials__[i].marca, cantidad: materials__[i].cantidad, salida: 0, devoluciones: 0 })
            } else {
              this.materiales[index].cantidad = Number(this.materiales[index].cantidad) + Number(materials__[i].cantidad)
              this.materiales[index].cantidad = this.materiales[index].cantidad.toFixed(2)
            }
          }
        }
        this.api.postSalidas(data)
          .subscribe((resp: any) => {
            for (let i = 0; i < resp.length; i++) {
              for (let n = 0; n < resp[i].material.length; n++) {
                if (resp[i].material[n].material.grupo === this.grupo) {
                  let index = this.materiales.findIndex(x => x.nombre === resp[i].material[n].material.nombre && x.marca === resp[i].material[n].material.marca && x.ancho === resp[i].material[n].material.ancho && x.largo === resp[i].material[n].material.largo && x.calibre === resp[i].material[n].material.calibre && x.gramaje === resp[i].material[n].material.gramaje)
                  if (index < 0) {
                    this.materiales.push({ nombre: resp[i].material[n].material.nombre, ancho: resp[i].material[n].material.ancho, largo: resp[i].material[n].material.largo, calibre: resp[i].material[n].material.calibre, gramaje: resp[i].material[n].material.gramaje, marca: resp[i].material[n].material.marca, cantidad: 0, salida: resp[i].material[n].cantidad, devoluciones: 0 })
                  } else {
                    this.materiales[index].salida = Number(this.materiales[index].salida) + Number(resp[i].material[n].cantidad)
                    this.materiales[index].salida = this.materiales[index].salida.toFixed(2)
                  }
                }
              }
            }
            this.api.postDevoluciones(data)
              .subscribe((resp: any) => {
                for (let i = 0; i < resp.length; i++) {
                  for (let n = 0; n < resp[i].filtrado.length; n++) {
                    if (resp[i].filtrado[n].material.grupo === this.grupo) {
                      let index = this.materiales.findIndex(x => x.nombre === resp[i].filtrado[n].material.nombre && x.marca === resp[i].filtrado[n].material.marca && x.ancho === resp[i].filtrado[n].material.ancho && x.largo === resp[i].filtrado[n].material.largo && x.calibre === resp[i].filtrado[n].material.calibre && x.gramaje === resp[i].filtrado[n].material.gramaje)
                      if (index < 0) {
                        this.materiales.push({ nombre: resp[i].filtrado[n].material.nombre, ancho: resp[i].filtrado[n].material.ancho, largo: resp[i].filtrado[n].material.largo, calibre: resp[i].filtrado[n].material.calibre, gramaje: resp[i].filtrado[n].material.gramaje, marca: resp[i].filtrado[n].material.marca, cantidad: 0, salida: 0, devoluciones: resp[i].filtrado[n].cantidad })
                      } else {
                        this.materiales[index].devoluciones = Number(this.materiales[index].devoluciones) + Number(resp[i].filtrado[n].cantidad)
                        this.materiales[index].devoluciones = this.materiales[index].devoluciones.toFixed(2)
                      }
                    }
                  }
                }
                this.api.postentradashastahoy(data)
                  .subscribe((resp: any) => {
                    this.entradas_hasta_hoy = []
                    let materials__ = resp;
                    for (let i = 0; i < materials__.length; i++) {
                      if (materials__[i].grupo === this.grupo) {
                        let index = this.entradas_hasta_hoy.findIndex(x => x.nombre === materials__[i].nombre && x.marca === materials__[i].marca && x.ancho === materials__[i].ancho && x.largo === materials__[i].largo && x.gramaje === materials__[i].gramaje && x.calibre === materials__[i].calibre)
                        if (index < 0) {
                          this.entradas_hasta_hoy.push({ nombre: materials__[i].nombre, marca: materials__[i].marca, ancho: materials__[i].ancho, largo: materials__[i].largo, gramaje: materials__[i].gramaje, calibre: materials__[i].calibre, cantidad: materials__[i].cantidad, salida: 0, devoluciones: 0 })
                        } else {
                          this.entradas_hasta_hoy[index].cantidad = Number(this.entradas_hasta_hoy[index].cantidad) + Number(materials__[i].cantidad)
                          this.entradas_hasta_hoy[index].cantidad = this.entradas_hasta_hoy[index].cantidad.toFixed(2)
                        }
                      }
                    }
                    this.api.postsalidashastahoy(data)
                      .subscribe((resp: any) => {
                        for (let i = 0; i < resp.length; i++) {
                          for (let n = 0; n < resp[i].material.length; n++) {
                            if (resp[i].material[n].material.grupo === this.grupo) {
                              let index = this.entradas_hasta_hoy.findIndex(x => x.nombre === resp[i].material[n].material.nombre && x.marca === resp[i].material[n].material.marca && x.ancho === resp[i].material[n].material.ancho && x.largo === resp[i].material[n].material.largo && x.calibre === resp[i].material[n].material.calibre && x.gramaje === resp[i].material[n].material.gramaje)
                              if (index < 0) {
                                this.entradas_hasta_hoy.push({ nombre: resp[i].material[n].material.nombre, ancho: resp[i].material[n].material.ancho, largo: resp[i].material[n].material.largo, calibre: resp[i].material[n].material.calibre, gramaje: resp[i].material[n].material.gramaje, marca: resp[i].material[n].material.marca, cantidad: 0, salida: resp[i].material[n].cantidad, devoluciones: 0 })
                              } else {
                                this.entradas_hasta_hoy[index].salida = Number(this.entradas_hasta_hoy[index].salida) + Number(resp[i].material[n].cantidad)
                                this.entradas_hasta_hoy[index].salida = this.entradas_hasta_hoy[index].salida.toFixed(2)

                              }
                            }
                          }
                        }
                        this.api.postdevolucioneshastahoy(data)
                          .subscribe((resp: any) => {
                            for (let i = 0; i < resp.length; i++) {
                              for (let n = 0; n < resp[i].filtrado.length; n++) {
                                if (resp[i].filtrado[n].material.grupo === this.grupo) {
                                  let index = this.entradas_hasta_hoy.findIndex(x => x.nombre === resp[i].filtrado[n].material.nombre && x.marca === resp[i].filtrado[n].material.marca && x.ancho === resp[i].filtrado[n].material.ancho && x.largo === resp[i].filtrado[n].material.largo && x.calibre === resp[i].filtrado[n].material.calibre && x.gramaje === resp[i].filtrado[n].material.gramaje)
                                  if (index < 0) {
                                    this.entradas_hasta_hoy.push({ nombre: resp[i].filtrado[n].material.nombre, ancho: resp[i].filtrado[n].material.ancho, largo: resp[i].filtrado[n].material.largo, calibre: resp[i].filtrado[n].material.calibre, gramaje: resp[i].filtrado[n].material.gramaje, marca: resp[i].filtrado[n].material.marca, cantidad: 0, salida: 0, devoluciones: resp[i].filtrado[n].cantidad })
                                  } else {
                                    this.entradas_hasta_hoy[index].devoluciones = Number(this.entradas_hasta_hoy[index].devoluciones) + Number(resp[i].filtrado[n].cantidad)
                                    this.entradas_hasta_hoy[index].devoluciones = this.entradas_hasta_hoy[index].devoluciones.toFixed(2)
                                  }
                                }
                              }
                            }
                            // // console.log(this.entradas_hasta_hoy)
                            this.materiales = this.materiales.sort(function (a, b) {
                              if (a.nombre.toLowerCase() < b.nombre.toLowerCase()) return -1
                              if (a.nombre.toLowerCase() > b.nombre.toLowerCase()) return 1
                              return 0

                            })
                            for (let i = 0; i < this.materiales.length; i++) {
                              let almacenado
                              let iHasta_hoy
                              almacenado = this.almacen_detallado.find(x => x.nombre === this.materiales[i].nombre && x.marca === this.materiales[i].marca && x.ancho === this.materiales[i].ancho && x.largo === this.materiales[i].largo && x.gramaje === this.materiales[i].gramaje && x.calibre === this.materiales[i].calibre)
                              iHasta_hoy = this.entradas_hasta_hoy.findIndex(x => x.nombre === this.materiales[i].nombre && x.marca === this.materiales[i].marca && x.ancho === this.materiales[i].ancho && x.largo === this.materiales[i].largo && x.gramaje === this.materiales[i].gramaje && x.calibre === this.materiales[i].calibre)
                              // console.log(iHasta_hoy)
                              if (iHasta_hoy < 0) {
                                // console.log(this.materiales[i].nombre,'_-_',this.materiales[i].marca)
                                // console.log(this.entradas_hasta_hoy)
                              }
                              if (!almacenado) {
                                this.saldos_iniciales[i] = (0 + Number(this.entradas_hasta_hoy[iHasta_hoy].salida)) - (Number(this.entradas_hasta_hoy[iHasta_hoy].cantidad) + Number(this.entradas_hasta_hoy[iHasta_hoy].devoluciones))
                                this.saldos_iniciales[i] = this.saldos_iniciales[i].toFixed(2)

                                this.saldos_finales[i] = Number(this.saldos_iniciales[i]) + Number(this.materiales[i].cantidad)
                                this.saldos_finales[i] = this.saldos_finales[i] + Number(this.materiales[i].devoluciones)
                                this.saldos_finales[i] = this.saldos_finales[i] - Number(this.materiales[i].salida)
                                this.saldos_finales[i] = this.saldos_finales[i].toFixed(2)
                              } else {
                                this.saldos_iniciales[i] = (Number(almacenado.cantidad) + Number(this.entradas_hasta_hoy[iHasta_hoy].salida)) - (Number(this.entradas_hasta_hoy[iHasta_hoy].cantidad) + Number(this.entradas_hasta_hoy[iHasta_hoy].devoluciones))
                                this.saldos_iniciales[i] = this.saldos_iniciales[i].toFixed(2)

                                this.saldos_finales[i] = Number(this.saldos_iniciales[i]) + Number(this.materiales[i].cantidad)
                                this.saldos_finales[i] = this.saldos_finales[i] + Number(this.materiales[i].devoluciones)
                                this.saldos_finales[i] = this.saldos_finales[i] - Number(this.materiales[i].salida)
                                this.saldos_finales[i] = this.saldos_finales[i].toFixed(2)
                                this.unidades[i] = almacenado.unidad
                              }
                              // // console.log(this.saldos_iniciales[i],'i:',i)
                            }
                            // console.log(this.materiales)
                            // console.log(this.entradas_hasta_hoy)
                            this.cargando = false;
                          })
                      })
                  })
              })
          })
      })

  }

}


