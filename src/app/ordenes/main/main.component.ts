import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RestApiService } from 'src/app/services/rest-api.service';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';



import { PdfMakeWrapper, Txt, Img, Table, Cell, Columns, Stack } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  public ORDENES;
  public ESTADOS;
  public TRABAJOS;
  public detalle:boolean = false;
  public orden_detalle;
  public orden_id;
  public cantidad_d;
  public cantidad_do;
  public ejemplares_montados;
  public ordenes_todas

  public despacho:boolean = false;

  public loading:boolean = true;
  
  
  constructor(private api:RestApiService,
    private router:Router,
    ) {
      this.usuario = api.usuario
    }
    
    ngOnInit(): void {
      this.getOrdenes();
      this.obtenerTrabajos();
      this.getOrdenesTodas();
    }
    public usuario


  getOrdenesTodas(){
    this.api.getOrdenesTodas()
      .subscribe((resp:any) =>{
        this.ordenes_todas = resp
      })
  }

  getOrdenes(){
    this.api.getOrden()
      .subscribe((resp:any)=>{
        this.ORDENES = resp;
        this.ORDENES = this.ORDENES.reverse();
      })
  }

  detallar(id,sort, x, y, montajes){
    this.ejemplares_montados = montajes;
    this.detalle = true;
    this.orden_detalle = sort;
    this.orden_id = id;
    this.cantidad_d = x;
    this.cantidad_do = y;
    // // console.log(y)
  }

  despacho_(){
    this.despacho = true;
  }

  alert(id){
    this.router.navigateByUrl(`orden-produccion/${id}`)
  }

  getEstados(id){
    let estado = this.TRABAJOS.find(x => x.orden._id == id && x.maquina.tipo === 'IMPRIMIR')
    let hoy = moment().format('yyyy-MM-DD');

    // // // console.log(estado)
    if(estado){
      if(hoy < estado.fechaI){
        let date = moment(estado.fechaI).format('yyyy-MM-DD')
        date = moment('yyyy-MM-DD').format('DD-MM-yyyy')
        return `Impresión Comienza el: ${estado.fechaI}`
      }
    }

      let estado2 = this.TRABAJOS.find(x => x.orden._id == id && x.fechaI<= hoy && x.fecha >= hoy)
    if(estado2){
      // // console.log(estado2, 'this is')
        return `En proceso de: ${estado2.maquina.tipo}`
    }else{
      return `ORDEN FINALIZADA`
    }

  }

  obtenerTrabajos(){
    this.api.getTrabajos()
      .subscribe((resp:any)=>{
        this.TRABAJOS = resp;
        // // console.log(this.TRABAJOS)
        this.loading = false;
      })
  }


  exportarResumenExcel() {
    const ordenesFiltradas = this.ordenes_todas.filter((o: any) =>
      o.sort?.toString().startsWith('2025')
    );
  
    const DescargarResumen = async () => {
      const gestionPromises = ordenesFiltradas.map((orden: any) => {
        return this.api.UltimaGestion({ op: orden._id, cantidad: orden.paginas })
          .toPromise()
          .then((resp: any) => ({
            _id: orden._id,
            paginas_o: resp || 0,
          }))
          .catch(() => ({
            _id: orden._id,
            paginas_o: 0,
          }));
      });
  
      const resultadosGestion = await Promise.all(gestionPromises);
  
      // Crear los datos en forma de objetos planos (para Excel)
      const dataExcel = ordenesFiltradas.map((orden: any) => {
        const fecha = moment(orden.fecha).format('DD/MM/YYYY');
        const sort = orden.sort?.toString() || '';
        const paginas = Number(orden.paginas) || 0;
        const paginas_a_imprimir = Math.ceil(orden.cantidad / Number(orden.producto.ejemplares[orden.montaje])) || 0;
        const porcentaje = Number(orden.demasia) || 0;
        const hojas_demasia = Math.ceil(paginas_a_imprimir * (porcentaje / 100));
  
        const gestion = resultadosGestion.find((g: any) => g._id === orden._id);
        const paginas_o = (gestion as any)?.paginas_o || 0;
        const cantidad_o = orden.producto.ejemplares[orden.montaje] * paginas_o || 0;
  
        return {
          FECHA: fecha,
          'ORDEN DE PRODUCCIÓN': sort,
          'HOJAS DE DEMASÍA': `${hojas_demasia.toLocaleString('es-VE')}`,
          'HOJAS ASIGNADAS': paginas.toLocaleString('es-VE'),
          'HOJAS PROCESADAS': paginas_o.toLocaleString('es-VE'),
          'PRODUCTOS PROCESADOS': cantidad_o.toLocaleString('es-VE'),
        };
      });
  
      // Convertir a hoja de Excel
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel);
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Resumen 2025': worksheet },
        SheetNames: ['Resumen 2025'],
      };
  
      const excelBuffer: any = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
  
      // Guardar archivo
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, `RESUMEN_2025.xlsx`);
    };
  
    DescargarResumen();
  }
  



  resumen() {
    const ordenesFiltradas = this.ordenes_todas.filter((o: any) =>
      o.sort?.toString().startsWith('2025')
    );
  
    const DescargarResumen = async () => {
      // Paso 1: Llamar a UltimaGestion por cada orden
      const gestionPromises = ordenesFiltradas.map((orden: any) => {
        return this.api.UltimaGestion({ op: orden._id, cantidad: orden.paginas })
          .toPromise()
          .then((resp: any) => ({
            _id: orden._id,
            paginas_o: resp || 0, // cantidad procesada
          }))
          .catch(() => ({
            _id: orden._id,
            paginas_o: 0,
          }));
      });
  
      const resultadosGestion = await Promise.all(gestionPromises);
  
      const pdf = new PdfMakeWrapper();
      PdfMakeWrapper.setFonts(pdfFonts);
  
      // Paso 2: construir la tabla con datos actualizados
      const tablaDatos = ordenesFiltradas.map((orden: any, index: number) => {
        const fecha = moment(orden.fecha).format('DD/MM/YYYY');
        const sort = orden.sort?.toString() || '';
        const paginas = Number(orden.paginas) || 0;
        const paginas_a_imprimir = Math.ceil(orden.cantidad / Number(orden.producto.ejemplares[orden.montaje])) || 0;
        const porcentaje = Number(orden.demasia) || 0;
        const hojas_demasia = Math.ceil(paginas_a_imprimir * (porcentaje / 100));
  
        // Buscar el resultado de UltimaGestion
        const gestion = resultadosGestion.find((g:any) => g._id === orden._id);
        const paginas_o = (gestion as any)?.paginas_o || 0;
        const cantidad_o = orden.producto.ejemplares[orden.montaje] * paginas_o || 0;
  
        return [
          new Cell(new Txt(fecha).fontSize(9).end).fillColor(index % 2 === 0 ? '#f5f5f5' : null).end,
          new Cell(new Txt(sort).fontSize(9).end).fillColor(index % 2 === 0 ? '#f5f5f5' : null).end,
          new Cell(new Txt(`${hojas_demasia.toLocaleString('es-VE')} (${porcentaje}%)`).fontSize(9).end).fillColor(index % 2 === 0 ? '#f5f5f5' : null).end,
          new Cell(new Txt(paginas.toLocaleString('es-VE')).fontSize(9).end).fillColor(index % 2 === 0 ? '#f5f5f5' : null).end,
          new Cell(new Txt(paginas_o.toLocaleString('es-VE')).fontSize(9).end).fillColor(index % 2 === 0 ? '#f5f5f5' : null).end,
          new Cell(new Txt(cantidad_o.toLocaleString('es-VE')).fontSize(9).end).fillColor(index % 2 === 0 ? '#f5f5f5' : null).end,
        ];
      });
  
      const encabezado = [
        new Cell(new Txt('FECHA').bold().end).alignment('center').fillColor('#999999').color('#000000').fontSize(9).end,
        new Cell(new Txt('ORDEN DE PRODUCCIÓN').bold().end).alignment('center').fillColor('#999999').color('#000000').fontSize(9).end,
        new Cell(new Txt('HOJAS DE DEMASÍA').bold().end).alignment('center').fillColor('#999999').color('#000000').fontSize(9).end,
        new Cell(new Txt('HOJAS ASIGNADAS').bold().end).alignment('center').fillColor('#999999').color('#000000').fontSize(9).end,
        new Cell(new Txt('HOJAS PROCESADAS').bold().end).alignment('center').fillColor('#999999').color('#000000').fontSize(9).end,
        new Cell(new Txt('PRODUCTOS PROCESADOS').bold().end).alignment('center').fillColor('#999999').color('#000000').fontSize(9).end,
      ];
  
      pdf.add(
        new Table([encabezado, ...tablaDatos])
          .widths(['12%', '20%', '18%', '17%', '17%', '16%'])
          .layout('lightHorizontalLines')
          .end
      );
  
      pdf.create().download(`RESUMEN_2025`);
    };
  
    DescargarResumen();
  }
  

}
