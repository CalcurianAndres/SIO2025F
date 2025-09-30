import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Cell, Img, PdfMakeWrapper, Stack, Table, Txt } from 'pdfmake-wrapper';
import { RestApiService } from 'src/app/services/rest-api.service';
import { SubirArchivosService } from 'src/app/services/subir-archivos.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as moment from 'moment';

@Component({
  selector: 'app-especificacion',
  templateUrl: './especificacion.component.html',
  styleUrls: ['./especificacion.component.css']
})
export class EspecificacionComponent implements OnInit {

  constructor(private api:RestApiService,
    private route:ActivatedRoute,
    private subirArchivo:SubirArchivosService) {
      this.producto = this.route.snapshot.paramMap.get('producto'),
      this.usuario = api.usuario;
   }

  public producto;
  public productos:any
  public Sustrato;
  public colores = []
  public barniz = []
  public pega = []
  public caja
  public i_montajes = 0;
  public montajes;
  public Ejemplares;
  public ImgSubir:File;
  public usuario;

  baseUrl = environment.api

  public Edicion:boolean = false;
  
  ngOnInit(): void {
    this.buscarAlmacen();
    this.GetOneProducto(this.producto)
    // console.log(this.api.usuario)
  }

  Editar_Especificacion(){
    this.Edicion = true;
  }

  pull_toneladas(n){
    // this.tonelada()
  }

  public GetOneProducto(id){
    this.api.getOneById(id)
    .subscribe((resp:any)=>{
      this.productos = resp
      this.montajes = this.productos.producto.montajes
      // console.log(this.productos)
      this.Ejemplares = this.productos.producto.ejemplares[this.i_montajes]
      for(let i=0;i<resp.producto.materiales[this.i_montajes].length;i++){
        let grupo = resp.producto.materiales[this.i_montajes][i].producto.grupo.nombre
        if(grupo === 'Sustrato'){
          this.Sustrato = resp.producto.materiales[this.i_montajes][i].producto
          // this.tonelada();
        }
        if(grupo === 'Tinta'){
          this.colores.push(resp.producto.materiales[this.i_montajes][i].producto)
        }
        if(grupo === 'Barniz' || grupo === 'Barniz Acuoso'){
          this.barniz.push(resp.producto.materiales[this.i_montajes][i].producto.nombre)
          // console.log(this.barniz)
        }
        if(grupo === 'Pega'){
          this.pega.push(resp.producto.materiales[this.i_montajes][i].producto.nombre)
          // console.log(this.pega)
        }
        if(grupo === 'Cajas Corrugadas'){
          this.caja = resp.producto.materiales[this.i_montajes][i]
        }
      }
      // console.log(this.productos)
    })
  }

  public inicio = 5
  public registros = []
  intervalo(i,color){

    let repeat = this.registros.find(x=> x.color === color);
    if(!repeat){
      let show = i + this.inicio;
      this.registros.push({color,show})
      this.inicio++
      // console.log(this.registros)
      return show
    }

  }

  montaje(n){
    switch(n)
    {
        case 0: return "A";
        case 1: return "B";
        case 2: return "C";
        case 3: return "D";
        case 4: return "E";
        case 5: return "F";
        case 6: return "G";
        case 7: return "H";
        case 8: return "I";
    }
  }

  Seleccionarimpresora(e){
    let array = this.productos.producto.impresora_aprobada
    let existe = array.find(x => x === e)

    // console.log(e)

    if(!existe && e != '#'){
      this.productos.producto.impresora_aprobada.push(e)
    }


  }

  Seleccionartroqueladora(e){
    let array = this.productos.producto.troqueladora_aprobada
    let existe = array.find(x => x === e)

    // console.log(e)

    if(!existe && e != '#'){
      this.productos.producto.troqueladora_aprobada.push(e)
    }
    
  }

  Guillotina_aprobada(e){
    let array = this.productos.producto.guillotina_aprobada
    let existe = array.find(x => x === e)

    // console.log(e)
    if(this.productos.producto.guillotina_aprobada[0] === 'No aplica'){
      this.productos.producto.guillotina_aprobada = []
    }

    if(!existe && e != '#'){
      this.productos.producto.guillotina_aprobada.push(e)
    }

    if(e === '#'){
      this.productos.producto.guillotina_aprobada = []
      this.productos.producto.guillotina_aprobada.push('No aplica')
    }

  }
  Pegadora_aprobada(e){
    let array = this.productos.producto.pegadora_aprobada
    let existe = array.find(x => x === e)

    // console.log(e)
    if(this.productos.producto.pegadora_aprobada[0] === 'No aplica'){
      this.productos.producto.pegadora_aprobada = []
    }

    if(!existe && e != '#'){
      this.productos.producto.pegadora_aprobada.push(e)
    }

    if(e === '#'){
      this.productos.producto.pegadora_aprobada = []
      this.productos.producto.pegadora_aprobada.push('No aplica')
    }
  }


  deletePegadora(i){
    this.productos.producto.pegadora_aprobada.splice(i,1)
  }

  deleteGuillotina(i){
    this.productos.producto.guillotina_aprobada.splice(i,1)

  }

  deleteTroqueladora(i){
    this.productos.producto.troqueladora_aprobada.splice(i,1)

  }

  deleteImpresora(i){
    this.productos.producto.impresora_aprobada.splice(i,1)
  }

  Finalizar_edicion(){
    // console.log(this.producto)
    // console.log(this.productos.producto)
    this.api.updateProducto(this.productos.producto, this.producto)
      .subscribe((resp:any)=>{
        this.Edicion = false;
        Swal.fire({
          title:'Editado',
          text:'Se realizarón los cambios de manera exitosa',
          icon:'success',
          timerProgressBar:true,
          timer:2000,
          showConfirmButton:false
        })
      })
  }

  public aprobado;
  public formato_ = 'ai'
  aprobacion(e){
    let fecha = e.split('-')
    // console.log(`${fecha[2]}${fecha[1]}${fecha[0]}`)
    this.productos.producto.diseno_producto[0] = `${fecha[2]}${fecha[1]}${fecha[0]}`
  }
  __formato(e){
    this.productos.producto.diseno_producto[1]= e;
  }

  monateje(e,i){
    let fecha = e.split('-')
    // console.log(`${fecha[2]}${fecha[1]}${fecha[0]}`)
    if(i === 0){
      this.productos.producto.diseno_montaje[0] = `${fecha[2]}${fecha[1]}${fecha[0]}`
    }else{
      this.productos.producto.diseno_montaje[2] = `${fecha[2]}${fecha[1]}${fecha[0]}`
    }
  }

  __formato_monateje(e,i){
    if(i === 0){
      
      this.productos.producto.diseno_montaje[1]= e;
    }else{
      this.productos.producto.diseno_montaje[3]= e;
      
    }

  }

  direccion_dfibra(e){
    this.productos.producto.direccion_fibra = e;
  }

  hendidura(e){

  }


  public unidades_tonelada;
  tonelada(a,b,c){
    let paginas = this.Sustrato.gramaje*a*b
        paginas = 10000000000 / paginas
        paginas = Math.trunc(paginas)
        this.unidades_tonelada = this.Ejemplares * paginas;
        return  c * paginas
      // // console.log(paginas,'<------------>')

  }

  calcular_desperdicio(x,y,z){
    let area = x*y;
    let porcentaje = area * 100 / z
    porcentaje = porcentaje - 100;
    return porcentaje.toFixed(2);
  }
  


  public Desperdicio
  calcular_Desperdicio(){
    let area = this.productos.producto.tamano_sustrato[0]*this.productos.producto.tamano_sustrato[1];

    this.productos.producto.Area_impresion


    let porcentaje = area * 100 / this.productos.producto.Area_impresion

    porcentaje =  porcentaje - 100;

    this.Desperdicio = porcentaje.toFixed(2)

    // console.log(porcentaje)
  }

  public Materiales = [];
  public Sustrato__ = []
  public Tintas = []
  public Quimicos = []
  public Cajas = []
  public Planchas = []
  buscarAlmacen(){
    this.api.getAlmacen()
    .subscribe((resp:any)=>{
      this.Materiales = resp.materiales;
      for(let i=0;i<this.Materiales.length;i++){
        // // console.log(i)
        if(this.Materiales[i].grupo.nombre === 'Sustrato'){
          let existe = this.Sustrato__.find(x=>x.nombre === this.Materiales[i].nombre && x.marca === this.Materiales[i].marca && x.calibre === this.Materiales[i].calibre && x.gramaje === this.Materiales[i].gramaje)
          if(!existe){
            this.Sustrato__.push(this.Materiales[i])
          }
        }
        if(this.Materiales[i].grupo.nombre === 'Tinta'){
          let existe = this.Tintas.find(x=>x.nombre === this.Materiales[i].nombre && x.marca === this.Materiales[i].marca )
          if(!existe){
            this.Tintas.push(this.Materiales[i])
          }
        }
        if(this.Materiales[i].grupo.nombre === 'Quimicos'){
          let existe = this.Quimicos.find(x=>x.nombre === this.Materiales[i].nombre && x.marca === this.Materiales[i].marca )
          // console.log(existe)
          if(!existe){
            this.Quimicos.push(this.Materiales[i])
            // // console.log(this.Quimicos)
          }
        }
        if(this.Materiales[i].grupo.nombre === 'Cajas Corrugadas'){
          let existe = this.Cajas.find(x=>x.nombre === this.Materiales[i].nombre)
          // console.log(existe)
          if(!existe){
            this.Cajas.push(this.Materiales[i])
            // // console.log(this.Cajas)
          }
        }
        if(this.Materiales[i].grupo.nombre === 'Otros materiales'){
          let existe = this.Planchas.find(x=>x.nombre === this.Materiales[i].nombre)
          // console.log(existe)
          if(!existe){
            this.Planchas.push(this.Materiales[i])
            // // console.log(this.Planchas)
          }
        }
      }
    })
  }


  firmar(n){

    Swal.fire({
      title: '¿Seguro que quieres firmar este documento?',
      text:'Recuerda verificar que la información correspondiente a su departamento, la misma debe estar correcta antes de firmar',
      icon:'warning',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Firmar',
      confirmButtonColor:'#48c78e',
      denyButtonColor:'#f14668',
      denyButtonText:'Cancelar'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {

        if(n === 0){
          this.productos.producto.firmas[0] = `${this.usuario.Nombre} ${this.usuario.Apellido}`;
          this.productos.producto.firmas[1] = `${this.usuario.Departamento}`;
          this.productos.producto.firmas[2] = `${this.usuario._id}`;
          this.productos.producto.firmas[12] = moment().format('DD/MM/YYYY')
        }
        if(n === 1){
          this.productos.producto.firmas[3] = `${this.usuario.Nombre} ${this.usuario.Apellido}`;
          this.productos.producto.firmas[4] = `${this.usuario.Departamento}`;
          this.productos.producto.firmas[5] = `${this.usuario._id}`;
          this.productos.producto.firmas[13] = moment().format('DD/MM/YYYY')
        }
        if(n === 2){
          this.productos.producto.firmas[6] = `${this.usuario.Nombre} ${this.usuario.Apellido}`;
          this.productos.producto.firmas[7] = `${this.usuario.Departamento}`;
          this.productos.producto.firmas[8] = `${this.usuario._id}`;
          this.productos.producto.firmas[14] = moment().format('DD/MM/YYYY')
        }
        if(n === 3){
          this.productos.producto.firmas[9] = `${this.usuario.Nombre} ${this.usuario.Apellido}`;
          this.productos.producto.firmas[10] = `${this.usuario.Departamento}`;
          this.productos.producto.firmas[11] = `${this.usuario._id}`;
          this.productos.producto.firmas[15] = moment().format('DD/MM/YYYY')
        }
        Swal.fire({
          title:'Firmado',
          showConfirmButton:false,
          icon:'success',
          timer:2000,
          timerProgressBar:true
        })
      } else if (result.isDenied) {
        Swal.fire({
          title:`Documento aun sin firmar por ${this.usuario.Departamento}`,
          icon:'info',
          timer:2000,
          timerProgressBar:true,
          showConfirmButton:false,
        })
      }
    })
  }

  CambiarImagen( event:any ){
    this.ImgSubir = (event.target).files[0];
    document.getElementsByClassName('file-name_')[0].innerHTML = this.ImgSubir.name;
  }

  Formatear(text){
    
    text = text.replace(/\r?\n/g, `
    `);
    return text 
  }

  subirImagen(){
    // this.cargando = true;
    this.subirArchivo.actualizarFoto(this.ImgSubir, 'despacho', this.producto )
    .then(img => {
      if(img){

        // console.log(img)
        this.productos.producto.paletizado = img
        // this.usuario.img = img;
        document.getElementsByClassName('file-name')[0].innerHTML = 'Sin archivo...';
        this.ImgSubir = null;
      }
      // this.GetOneProducto(this.producto)
      // this.verProducto(this.OneProduct._id)
      // this.verProducto(this.OneProduct._id)
      // this.cargando = false;
      });
  }

  CambiarImagen_( event:any ){
    this.ImgSubir = (event.target).files[0];
    document.getElementsByClassName('file-name__')[0].innerHTML = this.ImgSubir.name;
  }

  subirImagen_(){
    // this.cargando = true;
    this.subirArchivo.actualizarFoto(this.ImgSubir, 'distribucion', this.producto )
    .then(img => {
      if(img){
        // this.usuario.img = img;
        this.productos.producto.distribucion = img
        document.getElementsByClassName('file-name')[0].innerHTML = 'Sin archivo...';
        this.ImgSubir = null;
      }
      // this.GetOneProducto(this.producto)
      // this.verProducto(this.OneProduct._id)
      // this.verProducto(this.OneProduct._id)
      // this.cargando = false;
      });
  }

  CambiarImagen__( event:any ){
    this.ImgSubir = (event.target).files[0];
    document.getElementsByClassName('file-name___')[0].innerHTML = this.ImgSubir.name;
  }

  subirImagen__(){
    // this.cargando = true;
    this.subirArchivo.actualizarFoto(this.ImgSubir, 'aereo', this.producto )
    .then(img => {
      if(img){
        // this.usuario.img = img;
        this.productos.producto.aereo = img
        document.getElementsByClassName('file-name')[0].innerHTML = 'Sin archivo...';
        this.ImgSubir = null;
      }
      // this.GetOneProducto(this.producto)
      // this.verProducto(this.OneProduct._id)
      // this.verProducto(this.OneProduct._id)
      // this.cargando = false;
      });
  }


  DescargarPDF(){

    // Swal.fire({
    //   position: 'top-end',
    //   icon: 'success',
    //   title: 'Descargando',
    //   showConfirmButton: false,
    //   timer: 1500,
    //   timerProgressBar:true
    // })

    let producto = this.productos.producto
    let producto_cerrado = ``
    let Sustrato = this.Sustrato
    let colores = []
    let tintas = []
    let necesario = ''
    let barniz = this.barniz
    let montajes = this.montajes
    let pelicula_a = []
    let pelicula_b = []
    let planchas = []
    let planchas_teq = []
    let toneladas_a
    let toneladas_b
    let desperdicio_a
    let desperdicio_b
    let tamano_pinza = []
    let secuencia_color = []
    let solucion_fuente = []
    let pega = this.pega
    let caja = this.caja

    let test:boolean = false;


    toneladas_a = this.tonelada(producto.tamano_sustrato[0], producto.tamano_sustrato[1],producto.ejemplares[0])
    toneladas_b = this.tonelada(producto.tamano_sustrato[0], producto.tamano_sustrato[1],producto.ejemplares[1])

    desperdicio_a = this.calcular_desperdicio(producto.tamano_sustrato[0],producto.tamano_sustrato[1],producto.Area_impresion[0])
    desperdicio_b = this.calcular_desperdicio(producto.tamano_sustrato[2],producto.tamano_sustrato[3],producto.Area_impresion[1])

    for(let i=0;i<this.colores.length;i++){
      colores.push(`•${this.colores[i].color}`)
      if(this.colores[i].preparacion.length < 1){
        tintas.push(`•${this.colores[i].nombre} (${this.colores[i].marca})`)
      }else{

        for(let n=0; n<this.colores[i].preparacion.length;n++){
          necesario = necesario + `${this.colores[i].preparacion[n].cantidad}g ${this.colores[i].preparacion[n].nombre}\n       `
          // console.log(necesario)
        }

        tintas.push(`•${this.colores[i].nombre} (${this.colores[i].marca})
              Preparación local (1kg):
              ${necesario}`)
      }

      if(this.colores[i].color === 'Negro'){
        pelicula_a.push(`Pelicula N°${i+1}: Negro:${producto.cliente.codigo}-${producto.codigo}-${producto.version}-A-1`)
        pelicula_b.push(`Pelicula N°${i+1}: Negro:${producto.cliente.codigo}-${producto.codigo}-${producto.version}-B-1`)
      }else if(this.colores[i].color === 'Cyan'){
        pelicula_a.push(`Pelicula N°${i+1}: Cyan:${producto.cliente.codigo}-${producto.codigo}-${producto.version}-A-2`)
        pelicula_b.push(`Pelicula N°${i+1}: Cyan:${producto.cliente.codigo}-${producto.codigo}-${producto.version}-B-2`)
      }else if(this.colores[i].color === 'Magenta'){
        pelicula_a.push(`Pelicula N°${i+1}: Magenta:${producto.cliente.codigo}-${producto.codigo}-${producto.version}-A-3`)
        pelicula_b.push(`Pelicula N°${i+1}: Magenta:${producto.cliente.codigo}-${producto.codigo}-${producto.version}-B-3`)
      }else if(this.colores[i].color === 'Amarillo'){
        pelicula_a.push(`Pelicula N°${i+1}: Amarillo:${producto.cliente.codigo}-${producto.codigo}-${producto.version}-A-4`)
        pelicula_b.push(`Pelicula N°${i+1}: Amarillo:${producto.cliente.codigo}-${producto.codigo}-${producto.version}-B-4`)
      }else{
        pelicula_a.push(`Pelicula N°${i+1}: ${this.colores[i].color}:${producto.cliente.codigo}-${producto.codigo}-${producto.version}-A-`)
        pelicula_b.push(`Pelicula N°${i+1}: ${this.colores[i].color}:${producto.cliente.codigo}-${producto.codigo}-${producto.version}-B-`)
      }

      if(producto.orden_de_color[i]){
        secuencia_color.push(`Cuerpo Nº ${i+1}: ${this.colores[producto.orden_de_color[i]].nombre}`)
      }

    }

    for(let i=0;i<this.Planchas.length;i++){
      if(this.Planchas[i].nombre === 'Planchas Litográficas'){
        planchas.push(`Positiva / ${this.Planchas[i].marca}`)
        planchas_teq.push(`${this.Planchas[i].teq}`)
      }
    }

    for(let i=0;i<this.Quimicos.length;i++){
      if(this.Quimicos[i].nombre === 'Solución de Fuente'){
        solucion_fuente.push(`${this.Quimicos[i].chemical}
        • pH: ${this.Quimicos[i].ph}
        • Conductividad: ${this.Quimicos[i].conductividad}`)
      }
    }

    for(let i =0; i< producto.impresora_aprobada.length; i++){
      tamano_pinza.push(`${producto.impresora_aprobada[i].text} (${producto.tamano_pinza[i]})`)
      // console.log(producto.impresora_aprobada[i])
    }

    if(producto.tamano_cerrado[2]){
      producto_cerrado = `${producto.tamano_cerrado[0]} x ${producto.tamano_cerrado[1]} x ${producto.tamano_cerrado[2]} ± ${producto.tamano_cerrado[3]}`
    }else{
      producto_cerrado = `${producto.tamano_cerrado[0]} x ${producto.tamano_cerrado[1]} ± ${producto.tamano_cerrado[3]}`
    }


    async function generarEspecificacion() {
      const pdf = new PdfMakeWrapper();
      PdfMakeWrapper.setFonts(pdfFonts);
      pdf.pageOrientation('portrait');
      pdf.pageSize('A4');

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 15]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`
            FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO
            `).bold().end).alignment('center').fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de Revision: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).border([false]).end,
            new Cell(new Txt('CÓDIGO DE ESPECIFICACIÓN').end).fontSize(10).fillColor('#000000').color('#FFFFFF').alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).border([false]).end,
            new Cell(new Txt(`E-${producto.cliente.codigo}-${producto.codigo}-${producto.version}-${producto.edicion}`).end).fontSize(15).alignment('center').end,
          ],
        ]).widths(['70%','30%']).end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('1. IDENTIFICACIÓN DE PRODUCTO').end).colSpan(2).fontSize(10).fillColor('#000000').color('#FFFFFF').end,
            new Cell(new Txt('').end).border([false]).end,
          ],
          [
            new Cell(new Txt('1.1. Cliente:').bold().end).end,
            new Cell(new Txt(`${producto.cliente.nombre}`).end).end
          ],
          [
            new Cell(new Txt('1.2. producto:').bold().end).end,
            new Cell(new Txt(`${producto.producto}`).end).end
          ],
          [
            new Cell(new Txt('1.3. código del producto:').bold().end).end,
            new Cell(new Txt(`${producto.cliente.codigo}-${producto.codigo}-${producto.version}`).end).end
          ],

        ]).widths(['30%','70%']).end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('2. DIMENSIONES DEL PRODUCTO').end).colSpan(2).fontSize(10).fillColor('#000000').color('#FFFFFF').end,
            new Cell(new Txt('').end).border([false]).end,
          ],
          [
            new Cell(new Txt('2.1. Tamaño del producto desplegado (mm):').bold().end).end,
            new Cell(new Txt(`${producto.tamano_desplegado[0]} x ${producto.tamano_desplegado[1]} ± ${producto.tamano_desplegado[2]}`).end).end
          ],
          [
            new Cell(new Txt('2.2. Tamaño del producto cerrado (mm):').bold().end).end,
            new Cell(new Txt(`${producto_cerrado}`).end).end
          ],
          [
            new Cell(
              new Table([
                [
                  new Cell(new Txt('2.3. diseño del producto').bold().end).margin([-5,0]).border([false]).end,
                ],
                [
                  new Cell(await new Img(`http://192.168.0.23:8080/api/imagen/producto/${producto.img}`).width(400).build()).alignment('center').end,
                ],
                [
                  new Cell(new Txt('Imagen 1: Diseño del producto').end).alignment('center').border([false]).end,
                ]
              ]).widths(['100%']).end
            ).colSpan(2).end,
            new Cell(new Txt(``).end).end
          ],
        ]).widths(['30%','70%']).pageBreak('after').end
      )

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 15]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`
            FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO
            `).bold().end).alignment('center').fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de Revision: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('3. MATERIA PRIMA').end).colSpan(3).fontSize(10).fillColor('#000000').color('#FFFFFF').end,
            new Cell(new Txt('').end).border([false]).end,
            new Cell(new Txt('').end).border([false]).end,

          ],
          [
            new Cell(new Txt('3.1. Tipo de sustrato a utilizar:').bold().end).end,
            new Cell(new Txt(`${Sustrato.nombre}`).end).colSpan(2).end,
            new Cell(new Txt('').end).border([false]).end,

          ],
          [
            new Cell(new Txt('3.2. Espesor / Calibre (μm):').bold().end).end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Minimo').bold().end).alignment('center').end,
                  new Cell(new Txt('Nominal').bold().end).alignment('center').end,
                  new Cell(new Txt('Maximo').bold().end).alignment('center').end,
                ],
                [
                  new Cell(new Txt(Sustrato.calibre_e[0]).end).alignment('center').end,
                  new Cell(new Txt(Sustrato.calibre_e[1]).end).alignment('center').end,
                  new Cell(new Txt(Sustrato.calibre_e[2]).end).alignment('center').end,
                ]
              ]).widths(['33%','34%','33%']).end
            ).end,
            new Cell(new Txt(`Método de ensayo:
            COVENIN 946-79
            TAPPI T411`).end).alignment('center').end,
          ],
          [
            new Cell(new Txt('3.3. Peso / Gramaje (g/m²):').bold().end).end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Minimo').bold().end).alignment('center').end,
                  new Cell(new Txt('Nominal').bold().end).alignment('center').end,
                  new Cell(new Txt('Maximo').bold().end).alignment('center').end,
                ],
                [
                  new Cell(new Txt(Sustrato.gramaje_e[0]).end).alignment('center').end,
                  new Cell(new Txt(Sustrato.gramaje_e[1]).end).alignment('center').end,
                  new Cell(new Txt(Sustrato.gramaje_e[2]).end).alignment('center').end,
                ]
              ]).widths(['33%','34%','33%']).end
            ).end,
            new Cell(new Txt(`Método de ensayo:
            COVENIN 945-84
            TAPPI T410`).end).alignment('center').end,
          ],
          [
            new Cell(new Txt('3.4. Colores aprobados:').bold().end).end,
            new Cell(new Stack(colores).end).colSpan(2).end,
            new Cell(new Txt('').end).end,

          ],
          [
            new Cell(new Txt('3.5. Tintas aprobadas (Marcas):').bold().end).end,
            new Cell(new Stack(tintas).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('3.6. Barnices aprobados:').bold().end).end,
            new Cell(new Stack(barniz).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('3.7. Dirección de fibra de la etiqueta::').bold().end).end,
            new Cell(new Txt(`Paralela al largo total del producto (${producto.tamano_desplegado[producto.direccion_fibra]})`).end).end,
            new Cell(new Txt(`Método de ensayo:
            COVENIN 26-79
            TAPPI T-409 om-98`).end).alignment('center').end,
          ]
        ]).widths(['30%','40%','30%']).pageBreak('after').end
      )

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 15]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`
            FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO
            `).bold().end).alignment('center').fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de Revision: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('4. PRE-IMPRESION').end).colSpan(3).fontSize(10).fillColor('#000000').color('#FFFFFF').end,
            new Cell(new Txt('').end).border([false]).end,
            new Cell(new Txt('').end).border([false]).end,
          ],
          [
            new Cell(new Txt('4.1. Nombre del archivo del diseño del producto:').bold().end).end,
            new Cell(new Txt(`AD-${producto.cliente.codigo}-${producto.codigo}-${producto.version}_${producto.diseno_producto[0]}.${producto.diseno_producto[1]}`).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
          ]
        ]).widths(['30%','35%','35%']).end
      )
      
      if(montajes == 2){
        pdf.add(
          new Table([
            [
              new Cell(new Txt('4.2. Código del montaje:').bold().end).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje A:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`M-${producto.cliente.codigo}-${producto.codigo}-${producto.version}-A`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje B:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`M-${producto.cliente.codigo}-${producto.codigo}-${producto.version}-B`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).end
            ],
            [
              new Cell(new Txt('4.3. Nombre del archivo del montaje del producto:').bold().end).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje A:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`M-${producto.cliente.codigo}-${producto.codigo}-${producto.version}-A_${producto.diseno_montaje[0]}.${producto.diseno_montaje[1]}`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje B:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`M-${producto.cliente.codigo}-${producto.codigo}-${producto.version}-B_${producto.diseno_montaje[2]}.${producto.diseno_montaje[3]}`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).end,
            ],
            [
              new Cell(new Txt('4.4. Código de películas:').bold().end).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje A:`).bold().end).end,
                  ],
                  [
                    new Cell(new Stack(pelicula_a).fontSize(9).end).end,
                  ]
                ]).layout('noBorders').end
              ).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje B:`).bold().end).end,
                  ],
                  [
                    new Cell(new Stack(pelicula_b).fontSize(9).end).end,
                  ]
                ]).layout('noBorders').end
              ).end,
            ]
          ]).widths(['30%','35%','35%']).end
        )

      }else{
        pdf.add(
          new Table([
            [
              new Cell(new Txt('4.2. Código del montaje:').bold().end).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje A:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`M-${producto.cliente.codigo}-${producto.codigo}-${producto.version}-A`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).colSpan(2).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje B:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`M-${producto.cliente.codigo}-${producto.codigo}-${producto.version}-B`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).end
            ],
            [
              new Cell(new Txt('4.3. Nombre del archivo del montaje del producto:').bold().end).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje A:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`M-${producto.cliente.codigo}-${producto.codigo}-${producto.version}-A_${producto.diseno_montaje[0]}.${producto.diseno_montaje[1]}`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).colSpan(2).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje B:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`M-${producto.cliente.codigo}-${producto.codigo}-${producto.version}-B_${producto.diseno_montaje[2]}.${producto.diseno_montaje[3]}`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).end,
            ],
            [
              new Cell(new Txt('4.4. Código de películas:').bold().end).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje A:`).bold().end).end,
                  ],
                  [
                    new Cell(new Stack(pelicula_a).fontSize(9).end).end,
                  ]
                ]).layout('noBorders').end
              ).colSpan(2).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje B:`).bold().end).end,
                  ],
                  [
                    new Cell(new Stack(pelicula_b).fontSize(9).end).end,
                  ]
                ]).layout('noBorders').end
              ).end,
            ]
          ]).widths(['30%','35%','35%']).end
        )
      }

      pdf.add(
        new Table([
          [
            new Cell(new Txt('4.5. Tipo / Marca de plancha:').bold().end).border([true,false,true,true]).end,
            new Cell(new Stack(planchas).end).colSpan(2).border([true,false,true,true]).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('4.6. Tiempo de exposición de quemado de plancha (s):').bold().end).border([true,false,true,true]).end,
            new Cell(new Stack(planchas_teq).end).colSpan(2).border([true,false,true,true]).end,
            new Cell(new Txt('').end).end,
          ]
        ]).widths(['30%','35%','35%']).end
      )
      
      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('5. IMPRESIÓN').end).colSpan(3).fontSize(10).fillColor('#000000').color('#FFFFFF').end,
            new Cell(new Txt('').end).border([false]).end,
            new Cell(new Txt('').end).border([false]).end,
          ],
          [
            new Cell(new Txt('5.1. Maquina impresora aprobada:').bold().end).end,
            new Cell(new Stack(producto.impresora_aprobada).end).colSpan(2).end,
            new Cell(new Txt('').end).end,
          ]
        ]).widths(['30%','35%','35%']).end
      )

      if(montajes == 2 ){
        pdf.add(
          new Table([
            [
              new Cell(new Txt('5.2. Tamaño de sustrato a imprimir / ejemplares por pliego:').bold().end).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje A:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${producto.tamano_sustrato[0]} x ${producto.tamano_sustrato[1]} cm
                    ${producto.ejemplares[0]} Ejemplares`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje B:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${producto.tamano_sustrato[2]} x ${producto.tamano_sustrato[3]} cm
                    ${producto.ejemplares[1]} Ejemplares`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).end
            ],
            [
              new Cell(new Txt('5.3. Rendimiento de unidades por cada tonelada de sustrato').bold().end).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje A:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${producto.tamano_sustrato[0]} x ${producto.tamano_sustrato[1]} cm
                    ${toneladas_a} unidades`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje B:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${producto.tamano_sustrato[2]} x ${producto.tamano_sustrato[3]} cm
                    ${toneladas_b} unidades`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).end
            ],
            [
              new Cell(new Txt('5.4. Área efectiva de impresión (cm²):').bold().end).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje A:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${producto.Area_impresion[0]}`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje B:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${producto.Area_impresion[1]}`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).end
            ],
            [
              new Cell(new Txt('5.5. Porcentaje de desperdicio (%):').bold().end).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje A:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${desperdicio_a}%`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje B:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${desperdicio_b}%`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).end
            ],
            [
              new Cell(new Txt('5.6. Tamaño de la pinza de impresión (mm)').bold().end).border([true,false,false,true]).end,
              new Cell(new Stack(tamano_pinza).end).colSpan(2).end,
              new Cell(new Txt('').end).end
            ],
            [
              new Cell(new Txt('5.7. Secuencia de colores en máquina:').bold().end).border([true,false,false,true]).end,
              new Cell(new Stack(secuencia_color).end).colSpan(2).end,
              new Cell(new Txt('').end).end
            ]
          ]).widths(['30%','35%','35%']).pageBreak('after').end
        )
      }else{
        pdf.add(
          new Table([
            [
              new Cell(new Txt('5.2. Tamaño de sustrato a imprimir / ejemplares por pliego:').bold().end).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje A:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${producto.tamano_sustrato[0]} x ${producto.tamano_sustrato[1]} cm
                    ${producto.ejemplares[0]} Ejemplares`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).colSpan(2).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje B:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${producto.tamano_sustrato[2]} x ${producto.tamano_sustrato[3]} cm
                    ${producto.ejemplares[1]} Ejemplares`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).end
            ],
            [
              new Cell(new Txt('5.3. Rendimiento de unidades por cada tonelada de sustrato').bold().end).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje A:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${producto.tamano_sustrato[0]} x ${producto.tamano_sustrato[1]} cm
                    ${toneladas_a} unidades`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).colSpan(2).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje B:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${producto.tamano_sustrato[2]} x ${producto.tamano_sustrato[3]} cm
                    ${toneladas_b} unidades`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).end
            ],
            [
              new Cell(new Txt('5.4. Área efectiva de impresión (cm²):').bold().end).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje A:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${producto.Area_impresion[0]}`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).colSpan(2).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje B:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${producto.Area_impresion[1]}`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).end
            ],
            [
              new Cell(new Txt('5.5. Porcentaje de desperdicio (%):').bold().end).border([true,false,false,true]).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje A:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${desperdicio_a}%`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).colSpan(2).end,
              new Cell(
                new Table([
                  [
                    new Cell(new Txt(`Montaje B:`).bold().end).end,
                  ],
                  [
                    new Cell(new Txt(`${desperdicio_b}%`).end).end,
                  ]
                ]).layout('noBorders').end
              ).border([true,false,true,true]).end
            ],
            [
              new Cell(new Txt('5.6. Tamaño de la pinza de impresión (mm)').bold().end).border([true,false,false,true]).end,
              new Cell(new Stack(tamano_pinza).end).colSpan(2).end,
              new Cell(new Txt('').end).end
            ],
            [
              new Cell(new Txt('5.7. Secuencia de colores en máquina:').bold().end).border([true,false,false,true]).end,
              new Cell(new Stack(secuencia_color).end).colSpan(2).end,
              new Cell(new Txt('').end).end
            ]
          ]).widths(['30%','35%','35%']).pageBreak('after').end
        )
      }

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 15]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`
            FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO
            `).bold().end).alignment('center').fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de Revision: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('5. IMPRESIÓN').end).colSpan(2).fontSize(10).fillColor('#000000').color('#FFFFFF').end,
            new Cell(new Txt('').end).border([false]).end,
          ],
          [
            new Cell(new Txt('5.8. Solución de fuente:').bold().end).border([true,false,false,true]).end,
            new Cell(new Stack(solucion_fuente).end).end,
          ]

        ]).widths(['30%','70%']).end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('6. POST-IMPRESIÓN').end).colSpan(2).fontSize(10).fillColor('#000000').color('#FFFFFF').end,
            new Cell(new Txt('').end).border([false]).end,
          ],
          [
            new Cell(new Txt('6.1. Maquina troqueladora aprobada:').bold().end).border([true,false,false,true]).end,
            new Cell(new Stack(producto.troqueladora_aprobada).end).end,
          ],
          [
            new Cell(new Txt('6.2. Tipo de troquel / cuchilla - ángulo:').bold().end).border([true,false,false,true]).end,
            new Cell(new Txt(`${producto.tipo_troquel[0]}
            Tipo de cuchilla: ${producto.tipo_troquel[1]}
            Tamaño de madera: ${producto.tipo_troquel[2]} 
            Espesor de madera: ${producto.tipo_troquel[3]}`).end).end,
          ],
          [
            new Cell(new Txt('6.3 Tamaño de canal de hendidura a utilizar (mm):').bold().end).border([true,false,false,true]).end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Fabricante / Marca').bold().end).end
                ],
                [
                  new Cell(new Txt(producto.hendidura_canal).end).end
                ]
              ]).layout('noBorders').end
            ).end,

          ],
          [
            new Cell(new Txt('6.4. Guillotina aprobada:').bold().end).border([true,false,false,true]).end,
            new Cell(new Stack(producto.guillotina_aprobada).end).end,
          ],
          [
            new Cell(new Txt('6.5. Tipo de cuchilla - ángulo (etiqueta)').bold().end).end,
            new Cell(new Txt(producto.guillotina_aprobada[0]).end).end
          ],
          [
            new Cell(new Txt('6.6. Máquina pegadora aprobada:').bold().end).end,
            new Cell(new Stack(producto.pegadora_aprobada).end).end
          ],
          [
            new Cell(new Txt('6.7. Pegamento aprobado:').bold().end).end,
            new Cell(new Stack(pega).end).end
          ],
          [
            new Cell(new Txt('6.8. Tipo de caja para embalaje:').bold().end).end,
            new Cell(new Txt(`${caja.producto.descripcion}
            Tipo: ${caja.producto.tipo}
            ECT Mínimo: ${caja.producto.ECT} KN/m`).end).end
          ],
          [
            new Cell(new Txt('6.9. Modelo de la caja:').bold().end).end,
            new Cell(new Txt(`${caja.producto.nombre}`).end).end
          ],
          [
            new Cell(new Txt('6.10. Proveedores de corrugados aprobados:').bold().end).end,
            new Cell(new Txt(`Servicios de Corrugados Maracay, C.A
            Corrugados Industriales de Venezuela, C.A. (CIVCA)`).end).end
          ],
          [
            new Cell(new Txt('6.11. Cantidad de unidades por caja:').bold().end).end,
            new Cell(new Txt(`${caja.cantidad} unidades`).end).end
          ],
          [
            new Cell(new Txt('6.12. Cantidad por paquetes:').bold().end).end,
            new Cell(new Txt(`${producto.Cantidad_paquete} unidades`).end).end
          ],

        ]).widths(['30%','70%']).pageBreak('after').end
      )

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 15]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`
            FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO
            `).bold().end).alignment('center').fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de Revision: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).end
      )

      pdf.add(
        pdf.ln(1)
      )
      
      pdf.add(
        new Table([
          [
            new Cell(new Txt('6. POST-IMPRESIÓN').end).colSpan(2).fontSize(10).fillColor('#000000').color('#FFFFFF').end,
            new Cell(new Txt('').end).border([false]).end,
          ],
          [
            new Cell(
              new Table([
                [
                  new Cell(new Txt('6.13. Distribución del producto en caja').bold().end).border([false]).colSpan(2).end,
                  new Cell(new Txt('').end).end
                ],
                [
                  new Cell(await new Img(`http://192.168.0.23:8080/api/imagen/aereo/${producto.aereo}`).width(200).build()).alignment('center').end,
                  new Cell(await new Img(`http://192.168.0.23:8080/api/imagen/distribucion/${producto.distribucion}`).width(200).build()).alignment('center').end,
                ],
                [
                  new Cell(new Txt(`Imagen 2: Distribución del producto 
                  (vista aerea)`).alignment('center').end).border([false]).end,
                  new Cell(new Txt(`Imagen 3: Distribución del producto 
                  (vista 3D)`).alignment('center').end).border([false]).end
                ]
              ]).layout('noBorders').widths(['50%','50%']).end,
            ).colSpan(2).end,
            new Cell(new Txt(``).end).end
          ],
          [
            new Cell(
              new Table([
                [
                  new Cell(new Txt('6.14. Paletizado').bold().end).border([false]).end,
                ],
                [

                  new Cell(new Txt(`Tipo de paleta: ${producto.tipo_paleta[0]}
                  Tamaño de paleta (cm): ${producto.tipo_paleta[1]}
                  Cantidad de estibas: ${producto.tipo_paleta[2]}
                  Peso de caja (Kg): ${producto.tipo_paleta[3]}`).end).border([false]).end,
                ],
                [
                  new Cell(await new Img(`http://192.168.0.23:8080/api/imagen/despacho/${producto.paletizado}`).width(200).build()).margin([300,0,0,0]).alignment('center').end,
                ],
                [
                  new Cell(new Txt(`Imagen 3: Paletizado aprobado 
                  (vista aerea)`).alignment('center').end).border([false]).end,
                ]
              ]).layout('noBorders').end,
            ).colSpan(2).end,
            new Cell(new Txt(``).end).end
          ]
          
        ]).widths(['30%','70%']).pageBreak('after').end
      )

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([0, 15]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`
            FORMATO 
            ESPECIFICACIÓN DE 
            PRODUCTO
            `).bold().end).alignment('center').fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FRP-007').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de Revision: 20/06/2023').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('7. CLASIFICACIÓN DE DEFECTOS').end).colSpan(2).fontSize(10).fillColor('#000000').color('#FFFFFF').end,
            new Cell(new Txt('').end).border([false]).end,
          ],
          [
            new Cell(new Txt('7.1. Defectos críticos:').bold().end).end,
            new Cell(new Txt(producto.defectos[0]).end).end
          ],
          [
            new Cell(new Txt('7.2. Defectos mayores:').bold().end).end,
            new Cell(new Txt(producto.defectos[1]).end).end
          ],
          [
            new Cell(new Txt('7.3. Defectos menores:').bold().end).end,
            new Cell(new Txt('').end).end
          ],
        ]).widths(['30%','70%']).end
      )
      
      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('test').alignment('center').bold().end).fillColor('#dedede').end,
            new Cell(new Txt('LABORATORIO DE CALIDAD').alignment('center').bold().end).fillColor('#dedede').end,
            new Cell(new Txt('GCIA. OPERACIONES:').alignment('center').bold().end).fillColor('#dedede').end,
            new Cell(new Txt('GCIA. GESTIÓN DE LA CALIDAD:').alignment('center').bold().end).fillColor('#dedede').end,
          ],
          [
            new Cell(
              new Table([
                [
                  new Cell(new Txt(producto.firmas[0]).alignment('center').bold().end).border([false]).end,
                ],
                [
                  new Cell(new Txt(producto.firmas[1]).italics().end).alignment('center').border([false]).end,
                ],
                [
                  new Cell(await new Img(`http://192.168.0.23:8080/api/imagen/firmas/${producto.firmas[2]}.png`).width(80).build()).border([false]).end,
                ],
                [
                  new Cell(new Txt(`Fecha: ${producto.firmas[12]}`).alignment('center').italics().end).border([false]).end,
                ],
              ]).alignment('center').end
            ).alignment('center').end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt(producto.firmas[3]).bold().end).border([false]).end,
                ],
                [
                  new Cell(new Txt(producto.firmas[4]).italics().end).border([false]).end,
                ],
                [
                  new Cell(await new Img(`http://192.168.0.23:8080/api/imagen/firmas/${producto.firmas[5]}.png`).width(80).build()).border([false]).end,
                ],
                [
                  new Cell(new Txt(`Fecha: ${producto.firmas[13]}`).italics().end).border([false]).end,
                ],
              ]).end
            ).end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt(producto.firmas[6]).bold().end).border([false]).end,
                ],
                [
                  new Cell(new Txt(producto.firmas[7]).italics().end).border([false]).end,
                ],
                [
                  new Cell(await new Img(`http://192.168.0.23:8080/api/imagen/firmas/${producto.firmas[8]}.png`).width(80).build()).border([false]).end,
                ],
                [
                  new Cell(new Txt(`Fecha: ${producto.firmas[14]}`).italics().end).border([false]).end,
                ],
                
              ]).end
            ).end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt(producto.firmas[9]).bold().end).border([false]).end,
                ],
                [
                  new Cell(new Txt(producto.firmas[10]).italics().end).border([false]).end,
                ],
                [
                  new Cell(await new Img(`http://192.168.0.23:8080/api/imagen/firmas/${producto.firmas[11]}.png`).width(80).build()).border([false]).end,
                ],
                [
                  new Cell(new Txt(`Fecha: ${producto.firmas[15]}`).italics().end).border([false]).end,
                ],
              ]).end
            ).end,
          ]
        ]).widths(['25%','25%','25%','25%']).end
      )






      



  
      pdf.create().download(`TEST`)
    }

    generarEspecificacion();

}


}
