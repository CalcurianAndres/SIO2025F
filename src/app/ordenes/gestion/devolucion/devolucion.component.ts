import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { from } from 'rxjs';
import { UnicosPipe } from 'src/app/pipe/unicos.pipe';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

import { PdfMakeWrapper, Txt, Img, Table, Cell, Columns, Stack } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as moment from 'moment';
import { Usuario } from 'src/app/models/usuario.model';

@Component({
  selector: 'app-devolucion',
  templateUrl: './devolucion.component.html',
  styleUrls: ['./devolucion.component.css']
})
export class DevolucionComponent implements OnInit {

  @Input() devolucion:any
  @Output() onCloseModal = new EventEmitter();

  public devoluciones
  public materiales
  public repeticion = [];
  public Data_devolucion = [];
  public usuario;
  public RepuestoAprobados = []
  public Repuesto = false;
  public FormatoMateriales = []
  public _Motivo = ''
  public cantidades:any = []

  constructor(private api:RestApiService) {
    this.usuario = api.usuario
  }

  ngOnInit(): void {
    this.api.getLotes()
    .subscribe((resp:any)=>{
      this.getAlmacen();
      this.devoluciones = resp;
      for(let i = 0; i< resp.length; i++){
        this.repeticion.push(resp[i].orden)
        let final = resp.length - 1
        if(i == final){
          const dataArr = new Set(this.repeticion);
          let result = [...dataArr];
          this.repeticion = result.reverse();
        }
      }
      
    })
  }

  public Almacen = [];
  getAlmacen(){
    this.api.getAlmacen()
      .subscribe((resp:any)=>{
        this.Almacen = resp.materiales;
      })
  }

  getRepuestosAceptados(asignacion){
    this.api.getRepuestosFinalizados(asignacion) 
      .subscribe((resp:any)=>{
        this.RepuestoAprobados = resp;
        // console.log(this.RepuestoAprobados)
      })
  }
  
  public orden_selected
  seleccionarMateriales(){
    let orden_ = (<HTMLInputElement>document.getElementById('ordens')).value
    if(orden_ === 'Repuesto'){
      this.Repuesto = true;
    }else{
      this.Repuesto = false;
      this.orden_selected = orden_
    }
    this.materiales = this.devoluciones.filter(devoluciones => devoluciones.orden === orden_);
    // console.log(this.materiales)
    for(let i=0;i<this.materiales.length;i++){
      if(!this.materiales.nombre){
        // console.log(this.materiales[i])
        this.materiales.slice(i,1);
      }else{
        this.materiales[i].material.sort(function(a, b) {
          if(a.material.nombre.toLowerCase() < b.material.nombre.toLowerCase()) return -1
          if(a.material.nombre.toLowerCase() > b.material.nombre.toLowerCase()) return 1
          return 0
  
        })
      }
    }
    let malas = this.materiales.filter(materiales => materiales.material[0].material === null)
    if(orden_ == '#'){
    this.materiales = this.materiales.filter(materiales => materiales.material[0].material != null);
    }

    // console.log(this.materiales)
    this.materiales = this.materiales.reverse();
  // this.materiales = this.materiales.material
  
  }

  onClose(){
    this.devolucion = false;
    this.onCloseModal.emit();
  }

  finalizarDevolucion(){

    if(this._Motivo.length < 1){
      // let id_ = String(id)
      document.getElementById('Motivo__').focus();
      document.getElementById(`_error`).style.display = "block";
      return
    }

    let filtrado = this.Data_devolucion.filter(x => x.cantidad > 0)
    let orden = (<HTMLInputElement>document.getElementById('ordens')).value
    let data = {
      orden,
      filtrado, 
      motivo:this._Motivo,
      usuario:`${this.usuario.Nombre} ${this.usuario.Apellido}`
    }

    let motivo;

    // let lote = this.devoluciones.find(x=> x._id == data.id)
    // for(let iter=0;iter<data.filtrado.length;iter++){
    //   let material = data.filtrado[iter].material
    //   let _lote = data.filtrado[iter].lote
    //   let _codigo = data.filtrado[iter].codigo
    //   let comparativa = lote.material.findIndex(x=> x.material._id == material && x.lote == _lote && x.codigo == _codigo);
    //   // console.log(data.filtrado[iter].cantidad,'>',lote.material[comparativa].cantidad)
    //   if(data.filtrado[iter].cantidad > Number(lote.material[comparativa].cantidad)){
    //     console.log(data.filtrado[iter],'___', data.filtrado[iter].cantidad)
    //     console.log(lote.material[comparativa],'___', lote.material[comparativa].cantidad)
    //     Swal.fire({
    //       title:'Error',
    //       text:'La cantidad de material devuelto no puede ser mayor a la asignada',
    //       icon:'error',
    //       showConfirmButton:false
    //     })
    //     return
    //   }
    // }

    this.api.postDevolucion(data)
       .subscribe((resp:any)=>{
       Swal.fire({
        title:'Devolución',
        text: 'Se realizó la devolución de materiales',
        icon:'success',
        timer:3000,
        showConfirmButton:false
    }),
    
    motivo = this._Motivo;
    this._Motivo = ''
    this.Data_devolucion = [];
    this.FormatoMateriales = []
    this.cantidades = []
    this.materiales = undefined
    this.DescargarFormato(motivo, filtrado);
    (<HTMLInputElement>document.getElementById('ordens')).value = "·"
    this.onClose();
    })

  }

  formate(n){
    if(n >= 10){
      n = `00${n}`
  }
  else if(n >= 100){
    n = `0${n}`
  }
  else if(n < 10){
    n = `000${n}`
  }
    // console.log(n)
    return `AL-ASG-${n}`
  }

  agregarMaterial(id, cantidad, material,lote,codigo,i,x){
    



    let data = 
    {
      id,
      material,
      lote,
      codigo,
      cantidad:cantidad.value
    }

    let index = this.Data_devolucion.findIndex(x => x.id === id && x.material === material && x.lote === lote && x.codigo === codigo)

    if(index == -1 ){
      this.Data_devolucion.push(data);
    }else{
      this.Data_devolucion[index] = data
    }

    // console.log(data)

    // // console.log(this.Data_devolucion)

    this.agregarAFormato(i,x, cantidad.value);

  }

  buscarAsignacion(e){
    let asignacion = '24';
    asignacion = asignacion + e;
    this.getRepuestosAceptados(asignacion)
  }

  CerrarDevolucion(id){
    this.api.putCerrarLotes({id:id})
      .subscribe((resp:any)=>{
        this.api.getLotes()
    .subscribe((resp:any)=>{
      this.devoluciones = resp;
      for(let i = 0; i< resp.length; i++){
        this.repeticion.push(resp[i].orden)
        let final = resp.length - 1
        if(i == final){
          const dataArr = new Set(this.repeticion);
          let result = [...dataArr];
          this.repeticion = result;
        }
      }
      this.seleccionarMateriales();
      Swal.fire({
        icon:'info',
        title:'Eliminado',
        text:'Ya no se mostrará en un futuro',
        timer:4000,
        timerProgressBar: true,
        showConfirmButton:false
      })
    })
      })
  }


  DescargarFormato(motivo, filtrado){

    let hoy = moment().format('DD/MM/YYYY')
    let orden = this.orden_selected;
    let usuario = this.usuario
    const pdf = new PdfMakeWrapper();
    PdfMakeWrapper.setFonts(pdfFonts);
    pdf.pageOrientation('landscape')

    console.log(filtrado)

    const filtradasConMateriales = filtrado.map(item => {
      // Encuentra el material correspondiente en el array materiales
      console.log(this.Almacen)
      const material = this.Almacen.find(mat => mat._id === item.material);
      
      // Retorna un nuevo objeto con el material reemplazado
      return {
        ...item,         // Copia las propiedades originales de item
        material: material || null // Reemplaza el ID del material con el objeto del material o null si no se encuentra
      };
    });

    console.log(filtradasConMateriales)

    // Objeto para almacenar los materiales agrupados por asignación
    let materialesAgrupados = {};
    console.log(this.FormatoMateriales)
    // Iterar sobre cada material y agruparlo por asignación
    this.FormatoMateriales.forEach(material => {
        // Verificar si ya existe la asignación en el objeto materialesAgrupados
        if (materialesAgrupados.hasOwnProperty(material.asignacion)) {
            // Si ya existe, agregar el material al array correspondiente
            materialesAgrupados[material.asignacion].push(material);
        } else {
            // Si no existe, crear un nuevo array con este material
            materialesAgrupados[material.asignacion] = [material];
        }
    });

    // Convertir el objeto en un array de objetos con la estructura deseada
    let materiales = Object.keys(materialesAgrupados).map(asignacion => {
        return {
            asignacion: asignacion,
            material: materialesAgrupados[asignacion]
        };
    });

    materiales = materiales.reverse();

    let cantidad = [];
    // let cantidad = this.cantidades;
    let materiales_ = []
    let lotes_ = []
    let indiceUnidad = 0;
    // for(let i=0;i<materiales.length;i++){
    //   let material:any = materiales[i]
    //   for(let x=0;x<material.material.length;x++){
    //     materiales_.push(`${material.material[x].material.nombre} (${material.material[x].material.marca}) - código: ${material.material[x].codigo}`);
    //     lotes_.push(`${material.material[x].lote}`);
    //     cantidad[indiceUnidad] =  `${cantidad[indiceUnidad]} ${material.material[x].material.unidad}`
    //     indiceUnidad++;
    //   }
    // }

    for(let i=0;i<filtradasConMateriales.length;i++){
      materiales_.push(`${filtradasConMateriales[i].material.nombre} (${filtradasConMateriales[i].material.marca}) - código: ${filtradasConMateriales[i].codigo}`)
      lotes_.push(filtradasConMateriales[i].lote)
      cantidad.push(`${filtradasConMateriales[i].cantidad} ${filtradasConMateriales[i].material.unidad}`)
    }

    async function generarPDF(){

      pdf.add(
        new Table([
             [
                new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([20, 5]).build()).rowSpan(4).end,
                new Cell(new Txt(`
                FORMATO DEVOLUCIÓN DE MATERIAL`).bold().end).alignment('center').fontSize(13).rowSpan(4).end,
                new Cell(new Txt('Código: FAL-006').end).fillColor('#dedede').fontSize(7).alignment('center').end,
              ],
              [
                new Cell(new Txt('').end).end,
                new Cell(new Txt('').end).end,
                new Cell(new Txt('N° de Revisión: 0').end).fillColor('#dedede').fontSize(7).alignment('center').end,
              ],
              [
                new Cell(new Txt('').end).end,
                new Cell(new Txt('').end).end,
                new Cell(new Txt('Fecha de Revision: 11/10/2022').end).fillColor('#dedede').fontSize(7).alignment('center').end,
              ],
              [
                new Cell(new Txt('').end).end,
                new Cell(new Txt('').end).end,
                new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(7).alignment('center').end,
              ],
            ]).widths(['25%','50%','25%']).end
    );
    
    pdf.add(
        '\n'
    )
    
    pdf.add(
        new Table([
          [
            new Cell(new Txt('FECHA DE DEVOLUCIÓN').end).fillColor('#dedede').fontSize(10).alignment('center').end,
            new Cell(new Txt(`${hoy}`).end).end,
            new Cell(new Txt('N° DEVOLUCIÓN').end).fillColor('#dedede').fontSize(10).alignment('center').end,
            new Cell(new Txt(``).end).fontSize(15).alignment('center').end,
          ],
          [
            new Cell(new Txt('UNIDAD ADMINISTRATIVA').end).fillColor('#dedede').fontSize(10).alignment('center').end,
            new Cell(new Txt('GERENCIA DE OPERACIONES').end).end,
            new Cell(new Txt('ORDEN DE PRODUCCIÓN').end).fillColor('#dedede').fontSize(10).alignment('center').end,
            new Cell(new Txt(`${orden}`).end).alignment('center').end,
          ]
        ]).widths(['25%','25%','25%','25%']).end
      )
    
    pdf.add(
        '\n'
    )
    
    pdf.add(
        new Table([
            [
                new Cell(new Txt('DESCRIPCIÓN DEL MATERIAL').end).fillColor('#dedede').fontSize(9).alignment('center').end,
                new Cell(new Txt('N° DE LOTE').end).fillColor('#dedede').fontSize(9).alignment('center').end,
                new Cell(new Txt('CANTIDAD DEVUELTA').end).fillColor('#dedede').fontSize(9).alignment('center').end,
            ],
            [
                new Cell(new Stack(materiales_).end).end,
                new Cell(new Stack(lotes_).end).end,
                new Cell(new Stack(cantidad).end).end
            ]
        ]).widths(['50%','25%','25%']).end
    )
    
    pdf.add(
        '\n'
    )
    
    pdf.add(
        new Table([
            [
                new Cell(new Txt('MOTIVO').end).fillColor('#dedede').fontSize(9).alignment('center').end,
                new Cell(new Txt('DEVUELTO POR:').end).fillColor('#dedede').fontSize(9).alignment('center').end,
                new Cell(new Txt('RECIBIDO POR:').end).fillColor('#dedede').fontSize(9).alignment('center').end,
            ],
            [
                new Cell(new Txt(motivo).end).fontSize(11).end,
                new Cell(new Txt(`
                FIRMA: ${usuario.Nombre} ${usuario.Apellido}
    
                FECHA:${hoy}
                `).end).fontSize(9).end,
                new Cell(new Txt(`
                FIRMA: YRAIDA BAPTISTA
    
                FECHA:${hoy}
                `).end).fontSize(9).end,
    
            ]
    
        ]).widths(['50%','25%','25%']).end
    )
    
    pdf.add(
        new Txt('Si usted esta consultando una versión de este documento, Asegúrese que sea la vigente').alignment('right').fontSize(8).end
    )
      pdf.create().download(`DEVOLUCION DE MATERIAL`)
    }
    generarPDF();
  }


  agregarAFormato(x, y ,cantidad) {
    let material = this.materiales[x].material[y];
    let index = this.FormatoMateriales.indexOf(material);

    if (index === -1 && cantidad > 0) {
        this.FormatoMateriales.push(material);
        this.cantidades.push(cantidad)
        console.log(this.FormatoMateriales);
    } else {
        this.FormatoMateriales.splice(index, 1);
        this.cantidades.splice(index, 1);
        console.log(this.FormatoMateriales);
        console.log(this.materiales, 'Here is the materials')
    }
}

}
