import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Cell, Img, Line, PdfMakeWrapper, Table, Txt } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pre-facturacion',
  templateUrl: './pre-facturacion.component.html',
  styleUrls: ['./pre-facturacion.component.css']
})
export class PreFacturacionComponent implements OnInit {

  constructor(private api:RestApiService) {
    this.usuario = api.usuario
   }

  public usuario
  public Despachos
  public Tasa
  public Observacion = ''
  public Validacion:boolean = false
  public Modificacion:boolean = false
  public ModificaciondeEscala:boolean = false
  public ModificaciondePrecio:boolean = false
  public resumido:boolean = false
  public resumen:boolean = true
  public precio_millar_Bs

  ngOnInit(): void {
    this.api.getDespachosYOrdenes()
      .subscribe((resp:any)=>{
        this.Despachos = resp.preFacuracion
        // console.log(resp, 'TASAA')
        this.Tasa = resp.MonitorBCV
      })
  }

  startsWith(documento: string): boolean {
    if (documento && documento.length > 0) {
      // console.log(documento.charAt(0) === 'N')
      return documento.charAt(0) === 'N';
    }
    return false;
  }

  Editar_Cantidad_en_OC(){
    (<HTMLInputElement>document.getElementById('Cantidad_en_OC')).disabled = false
  }

  Editar_Cantidad_despachada(){
    (<HTMLInputElement>document.getElementById('Cantidad_Despachada')).disabled = false
  }


  calcularSub(x,y,z){
    let SubtotalBS
    let precio_millar_Bs:any = ( this.Despachos[this.INDEX].despacho.precio*this.Despachos[this.INDEX].despacho.tasa).toFixed(4)
    return SubtotalBS = this.puntoYcoma_(this.Despachos[this.INDEX].despacho.cantidad / 1000 * precio_millar_Bs)
    let sub_bs:any = (y*z).toFixed(4)
    x = x / 1000;
    return this.puntoYcoma(x*sub_bs)
  }

  Modificacion_close(){
    this.Modificacion = false;
    this.ModificaciondeEscala = false;
    this.ModificaciondePrecio = false;
  }

  resumir(){
    this.resumido = true;
  }

  habilitarBoton(){
    this.resumen = false;
  }

  closeModal(){
    this.Validacion = false;
  }

  buscarEscala_(i){
    Swal.fire({
      text:'Escala modificada',
      icon:'success',
      showConfirmButton:false
    })
    this.Modificacion_close();
    this.buscarEscala(i)
  }


  public Escala = {cantidad:0, precio:0};
  buscarEscala(precio,nueva?){
    // console.log(precio,'PRECIOOOO')
    let escalas = this.Despachos[this.INDEX].escala.escalas
    for(let i=0;i<escalas.length;i++){
      escalas[i].cantidad = Number(escalas[i].cantidad)
    }
    // console.log(escalas,'ESCALAAAAAAAAAAAAAAAAAAAS')
    let search = escalas.findLast(x=> x.cantidad <= precio)
    // console.log(search,'SEARCH')
    if(!search && !nueva){
      // console.log('fail')
      search = escalas[0]
    }
    this.Escala = search  
  }

  public INDEX = 0;
  ValidarDatos(i){
    if(!this.Validacion){
      this.Validacion = true;
      this.INDEX = i
      // let busqueda = this.Despachos[this.INDEX].find(x=>x.escala.escalas.cantidad === "100000")
      this.buscarEscala(this.Despachos[this.INDEX].orden.cantidad)
    }else{
      this.closeModal();
    }
  }

  modificarModal(i){
    this.Modificacion = true;
    if(i === 'escala'){
      this.ModificaciondeEscala = true
    }
    if(i === 'precio'){
      this.ModificaciondePrecio = true
    }
  }

  public confirmed:boolean = false;
  confirmar(){
    this.confirmed = true
  }

  public tipo_documento = 'F - '
  editTipo(e){
    this.tipo_documento = e
  }

  public n_documento = ''
  public numero_facturacion:boolean = false;
  editDocumento(e){
    this.n_documento = e;
    if(!e){
      this.numero_facturacion = false
    }
    else{
      this.numero_facturacion = true
    }
  }

  public fecha_facturacion:boolean = false
  fecha_modificacion(e){
    if(!e){
      this.fecha_facturacion = false
    }else{
      this.fecha_facturacion = true
    }
  }

  confirmar_todo(){
    Swal.fire({
      icon:'warning',
      title: 'Verifique bien los datos',
      text:`Los datos previamente mostrados, así como, la información suministrada por usted son de vital     importancia.
      Es necesario su correcta verificación.   Dichos cambios no podrán ser modificados`,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Continuar',
      denyButtonText: `Ir atrás`,
      confirmButtonColor:'#48c78e'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.Despachos[this.INDEX].despacho.documento =`${this.tipo_documento}${this.n_documento}`
        this.n_documento = ''
        this.tipo_documento = 'F - '
        this.Facturacion = false;
        Swal.fire(
        {title:'Listo.', 
        text:'Se realizó el registro de facturación correctamente.', 
        icon:'info',
        showConfirmButton:false}
        )
        this.numero_facturacion = false;
        this.fecha_facturacion = false;
        this.confirmed = false;
        const inputFacturaNumber = document.getElementById('factura_number') as HTMLInputElement;
        if (inputFacturaNumber) {
            inputFacturaNumber.value = ''; // Establece el valor en blanco
        }
        const inputFechaFactura = document.getElementById('fecha_factura') as HTMLInputElement;
        if(inputFechaFactura) {
          inputFechaFactura.value = ''
        }
        this.api.facturado(this.Despachos[this.INDEX].despacho)
          .subscribe((resp:any)=>{
            // console.log('donde')
          })
      } else if (result.isDenied) {
        Swal.fire({title:'Nada cambió', text:'Ningún cambio fue realizado.', icon:'info',showConfirmButton:false})
      }
    })
  }

  puntoYcoma(n) { 
    if (!n) { 
      return 0; 
    } 
    return new Intl.NumberFormat('de-DE', { 
      minimumFractionDigits: 4,
      maximumFractionDigits: 4 
    }).format(n);
  }

  puntoYcoma_(n) { 
    if (!n) { 
      return 0; 
    } 
    return n = new Intl.NumberFormat('de-DE', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(n)
  }

  puntoYcoma__(n) { 
    if (!n) { 
      return 0; 
    } 
    return n = new Intl.NumberFormat('de-DE', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    }).format(n)
  }

  public Facturacion:boolean = false
  openFacturacion(i){
    this.Facturacion = true
      this.INDEX = i
      // let busqueda = this.Despachos[this.INDEX].find(x=>x.escala.escalas.cantidad === "100000")
      this.buscarEscala(this.Despachos[this.INDEX].orden.cantidad)
  }
  closeFacturacion(){
    this.Facturacion = false
  }

  descargarPDF(){

    
    this.Despachos[this.INDEX].despacho.tasa = this.Tasa
    this.Despachos[this.INDEX].despacho.precio = this.Escala.precio
    this.Despachos[this.INDEX].despacho.escala = this.Escala.cantidad
    // console.log(this.Despachos[this.INDEX])


    let cliente = this.Despachos[this.INDEX].orden.cliente.nombre
    let rif = this.Despachos[this.INDEX].orden.cliente.rif
    let codigo_name = this.Despachos[this.INDEX].orden.cliente.codigo
    let direccion = this.Despachos[this.INDEX].orden.cliente.direccion
    let producto = this.Despachos[this.INDEX].orden.producto.producto
    let codigo = this.Despachos[this.INDEX].orden.producto.cod_cliente
    let observacion = this.Observacion
    let sustrato = ''
    let colores = '0'
    let usuario = `${this.usuario.Nombre} ${this.usuario.Apellido}`
    let cargo = this.usuario.Departamento
    let procesos = 'Barnizado'
    for(let n=1;n<this.Despachos[this.INDEX].orden.producto.post.length;n++){
        let incluye = procesos.includes(this.Despachos[this.INDEX].orden.producto.post[n]);
      if(procesos.includes(this.Despachos[this.INDEX].orden.producto.post[n])){
        procesos = procesos + `, ${this.Despachos[this.INDEX].orden.producto.post[n]}`;
      }
    }
    let cantidad = this.Despachos[this.INDEX].despacho.cantidad
    let fecha = new Date();
    let hoy = fecha.getDate();
    let dia = fecha.getDate();
    if(dia < 10){
      dia = Number(`0${dia}`)
    }
    let mes = fecha.getMonth()+1;
    if(mes < 10){
      mes = Number(`0${mes}`)
    }
    let ano = fecha.getFullYear();
    let firma = `../../assets/firmas/${this.usuario._id}.png`
    let escale
    escale = this.puntoYcoma__(this.Escala.cantidad)
    let tasa
    tasa = this.puntoYcoma(this.Tasa)
    let precioUSD
    precioUSD = this.puntoYcoma_(this.Escala.precio)
    let precioBS
    precioBS = this.puntoYcoma_(this.Escala.precio*this.Tasa)
    let SubtotalUSD
    SubtotalUSD = this.puntoYcoma_(this.Despachos[this.INDEX].despacho.cantidad / 1000 * this.Despachos[this.INDEX].despacho.precio)
    let SubtotalBS
    let precio_millar_Bs:any = ( this.Despachos[this.INDEX].despacho.precio*this.Despachos[this.INDEX].despacho.tasa).toFixed(4)
    let precio_millar_B_s:any = ( this.Despachos[this.INDEX].despacho.precio*this.Despachos[this.INDEX].despacho.tasa).toFixed(2)
    let Bs:any = ((cantidad / 1000) * precio_millar_B_s)
    Bs = this.puntoYcoma_(Bs)
    SubtotalBS = this.puntoYcoma_(Bs)
    // console.log(cantidad,'<- -------------------------------------------------- ->', Number((precio_millar_Bs).toFixed(2)))
    cantidad = this.puntoYcoma__(cantidad)
    
    
    // this.Despachos[this.INDEX].fecha_prefacturacion =  moment().format('DD/MM/YYYY')
    let contactos
    let cargos
    let margin = 0;

    // SubtotalBS = this.puntoYcoma_(SubtotalBS)

    for(let i=0;i<this.Despachos[this.INDEX].orden.cliente.contactos.length;i++){
      if(i === 0){
        // console.log(this.Despachos[this.INDEX].orden.cliente.contactos[i].trato)
        contactos = `${this.Despachos[this.INDEX].orden.cliente.contactos[i].trato} ${this.Despachos[this.INDEX].orden.cliente.contactos[i].nombre}`
        cargos = `${this.Despachos[this.INDEX].orden.cliente.contactos[i].cargo}`
      }
      if(i === 1){
        margin = -35
        contactos = contactos + ` \n\n ${this.Despachos[this.INDEX].orden.cliente.contactos[i].trato} ${this.Despachos[this.INDEX].orden.cliente.contactos[i].nombre}`
        cargos = cargos + ` \n\n\n ${this.Despachos[this.INDEX].orden.cliente.contactos[i].cargo}`
      }
    }
    // console.log(this.Despachos[this.INDEX].orden.cliente)
    for(let i=0;i<this.Despachos[this.INDEX].orden.producto.post.length;i++){
      procesos = procesos +', '+this.Despachos[this.INDEX].orden.producto.post[i];
    }
    for(let i=0;i<this.Despachos[this.INDEX].orden.producto.materiales[this.Despachos[this.INDEX].orden.montaje].length;i++)
    {
      let material = this.Despachos[this.INDEX].orden.producto.materiales[this.Despachos[this.INDEX].orden.montaje][i]
      // console.log(material.producto.grupo.nombre)
      if(material.producto.grupo.nombre === 'Sustrato'){
        sustrato = `${material.producto.nombre} ${material.producto.gramaje}g, calibre:${material.producto.calibre}`
      }else if(material.producto.grupo.nombre === 'Tinta'){
        let Numer = Number(colores) + 1;
        colores = Numer.toString()
      }
    }

    
    let pre;
    this.Despachos[this.INDEX].parcial = moment().format('DD-MM-yyyy')
    this.api.aumentoPre(this.Despachos[this.INDEX].despacho)
      .subscribe((resp:any)=>{
        pre = resp
        this.Validacion = false
        this.resumen = true
        this.resumido = false
        this.api.getDespachosYOrdenes()
      .subscribe((resp:any)=>{
        this.Despachos = resp.preFacuracion
        this.Tasa = resp.MonitorBCV
        generarPDF();
      })
        // if(pre < 10){
        //   pre = `000${pre}`
        // }
        // if(pre > 10 && pre < 100){

        // }
      })

    const pdf = new PdfMakeWrapper();
    PdfMakeWrapper.setFonts(pdfFonts);

    
    async function generarPDF(){
      // pdf.footer();

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([20, 5]).build()).rowSpan(4).end,
            new Cell(new Txt(`
            COTIZACIÓN`).bold().end).alignment('center').fontSize(13).rowSpan(4).end,
            new Cell(new Txt('Código: FDE-001').end).fillColor('#dedede').fontSize(7).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 0').end).fillColor('#dedede').fontSize(7).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de Revision: 14/04/2023').end).fillColor('#dedede').fontSize(7).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(7).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Table([
              [
                new Cell(new Txt('COTIZACIÓN').bold().end).colSpan(2).alignment('center').fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('').end).end,
              ],
              [
                new Cell(new Txt('N°').alignment('center').end).end,
                new Cell(new Txt(`C-25-${pre}`).bold().color('#FF0000').alignment('center').end).end,
              ],
              [
                new Cell(new Txt('Fecha').alignment('center').end).end,
                new Cell(new Txt(`${dia}/${mes}/${ano}`).alignment('center').end).end,
              ],
            ]).widths(['25%','75%']).end).end,

          ],
        ]).widths(['25%','40%','35%']).layout('noBorders').end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Cliente:').bold().end).end,
                  new Cell(new Txt(cliente).end).end,
                ],
                [
                  new Cell(new Txt('').end).end,
                  new Cell(new Txt('').end).end,

                ],
                [
                  new Cell(new Txt('Rif:').bold().end).end,
                  new Cell(new Txt(rif).end).end,
                ],
                [
                  new Cell(new Txt('').end).end,
                  new Cell(new Txt('').end).end,

                ],
                [
                  new Cell(new Txt('Dirección Fiscal:').bold().end).colSpan(2).end,
                  new Cell(new Txt('').end).end,
                ],
                [
                  new Cell(new Txt(direccion).end).colSpan(2).end,
                  new Cell(new Txt('').end).end,
                ]
              ]).widths(["15%", "85%"]).layout('noBorders').end,
              
            ).end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Contactos:').bold().end).end,
                ],
                [
                  new Cell(new Txt(contactos).end).end,

                ],
                [
                  new Cell(new Txt(cargos).margin([0,margin]).italics().fontSize(9).end).end,

                ]
              ]).layout('noBorders').end,
              
            ).end,
            
          ]

        ]).widths(['65%','35%']).layout('noBorders').end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Producto:').bold().end).end,
            new Cell(new Txt(producto).end).end,
          ],
          [
            new Cell(new Txt('Código:').bold().end).end,
            new Cell(new Txt(codigo).end).end,
          ],
          [
            new Cell(new Txt('Sustrato:').bold().end).end,
            new Cell(new Txt(sustrato).end).end,
          ],
          [
            new Cell(new Txt('Colores:').bold().end).end,
            new Cell(new Txt(colores).end).end,
          ],
          [
            new Cell(new Txt('Procesos:').bold().end).end,
            new Cell(new Txt(procesos).end).end,
          ],
        ]).layout('noBorders').end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            // new Cell(new Txt('Cantidad:').bold().margin([5,5]).alignment('center').end).fillColor('#dedede').end,
            new Cell(new Txt('Escala:').bold().alignment('center').end).fillColor('#dedede').end,
            new Cell(new Txt('Precio/millar (USD):').bold().alignment('center').end).fillColor('#dedede').end,
            new Cell(new Txt('Tasa de cambio (BCV):').bold().alignment('center').end).fillColor('#dedede').end,
            new Cell(new Txt('Precio/millar (Bs):').bold().alignment('center').end).fillColor('#dedede').end,
          ],
          [
            new Cell(new Txt(escale).alignment('center').end).end,
            new Cell(new Txt(precioUSD).alignment('center').end).end,
            new Cell(new Txt(tasa).alignment('center').end).end,
            new Cell(new Txt(precioBS).alignment('center').end).end,
          ]
        ]).widths(['13%','29%','29%','29%',]).end
      )

      pdf.add(
        pdf.ln(1)
      )
      
      pdf.add(
        new Table([
          [
            new Cell(new Txt('Cantidad a despachar:').bold().alignment('center').end).fillColor('#dedede').end,
            new Cell(new Txt('Subtotal USD:').bold().alignment('center').end).fillColor('#dedede').end,
            new Cell(new Txt('Subtotal Bs:').bold().alignment('center').end).fillColor('#dedede').end,
          ],
          [
            new Cell(new Txt(cantidad).alignment('center').end).end,
            new Cell(new Txt(SubtotalUSD).alignment('center').end).end,
            new Cell(new Txt(Bs).alignment('center').end).end,
            
          ]
        ]).widths(['33%','33%','34%',]).end
      )

      pdf.add(
        pdf.ln(1)
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Observaciones:').bold().end).end,
          ],
          [
            new Cell(new Txt(observacion).end).end,
          ]
        ]).layout('noBorders').end
      )

      pdf.add(
        pdf.ln(2)
      )


      pdf.add(
        new Table([
          [
            new Cell(new Txt('Emitido por:').bold().end).end,
          ],
          [
            new Cell(new Txt(usuario).end).end,
          ],
          [
            new Cell(new Txt(cargo).italics().fontSize(9).end).end,
          ],
          [
            new Cell(await new Img(firma).width(60).build()).end,
          ],
        ]).layout('noBorders').end
      )

      pdf.add(
        pdf.ln(2)
      )
      
      pdf.add(
        new Txt('Calle Pantín,  Local Galpón Nro 29, Urb. Chacao-Caracas, Miranda, Venezuela. ZP: 1060,').italics().fontSize(9).alignment('center').end
      )
      pdf.add(
        new Txt('email: info@poligraficaindustrial.com').italics().fontSize(9).alignment('center').end
      )

      pdf.create().download(`${codigo_name}-C-25-${pre}`)
    }
  }



}
