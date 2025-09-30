import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from 'src/app/services/rest-api.service';
import { PdfMakeWrapper, Txt, Img, Table, Cell, Columns, Stack } from 'pdfmake-wrapper';
import bulmaCollapsible from '@creativebulma/bulma-collapsible';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as moment from 'moment';

import Swal from 'sweetalert2';
import { BehaviorSubject, Subject, zip } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';




@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  fileName= 'ExcelSheet.xlsx';

  public resumido:boolean = true;
  public detallado:boolean = false;

  public NUEVO_PRODUCTO:boolean = false;
  public ALMACEN;
  public SECCIONES

  public PESO= 0
  public GRAMAJE = 300
  public ANCHO= 0
  public LARGO= 0
  public HOJAS = 0

  public PESO_= 0
  public GRAMAJE_ = 300
  public ANCHO_= 0
  public LARGO_= 0
  public HOJAS_ = 0

  empty:boolean = true;

  public OTRO:boolean = true;
  public Gs;

  public CONVERSION:boolean = false;
  public BOBINAS:boolean = false;
  public CONSULTAB:boolean = false;

  public BOBINAS_;
  public product_selected;
  public _producto_seleccionado;

  public boolean_sustrato:boolean = false;
  public Sustratos;

  public New_Sustrato:boolean = false;

  public Mat_Selected;
  public Num_Bobina

  public MATERIALES_NECESARIOS:boolean = false;
  public _NUEVO_PRODUCTO:boolean = false;
  public EDICION_ALMACEN:boolean = false;

  public DESCUENTOS = [];

  public name_p_e
  public cantidad_p_e
  public id_p_e
  public eliminacion:boolean = false;
  public eliminar_sustrato:boolean = false;

  public reporte:boolean = false;


  public AlmacenadoId;
  public MaterialID;

  public loading:boolean = true;

  public _bobina:boolean = false;
  public descontar_b:boolean = false;

  public Devoluciones;

  codigoID = '';
  loteID = '';
  cantidadID = '';

  codigo = '';
  lote = '';
  cantidad = '';
  pedido = '';
  precio = 0;

  public New_color:boolean = false;
  public caja_:boolean = false;

  asignacion:boolean = false;
  confirmacion:boolean = false;

  public asignacion_:boolean = false



  public _Almacenado:boolean = true;
  public Editar_NUEVO_PRODUCTO:boolean = false;

  public listFiltered = []

  public TOTALES = [
    {
      material:null,
      marca:null,
      calibre:null,
      gramaje:null,
      total:null,
      grupo:null,
      presentacion:null,
      neto:null,
      unidad:null,
      ancho:null,
      largo:null
    }
  ];

  public _bobina_ = ''

  public Dev_:boolean = false;


  public Almacenado = [];
  Pendiente;

  public Bobillas = true;

  public RepuestosAprobados = []
  public aprobadosRepuesto = false
  public grupo_to_download = ''

  public translado = false;
  
  searchTerm$ = new BehaviorSubject<string>('')
  private OnDestroy$ = new Subject();


  InventarioForm:FormGroup = this.fb.group({
    ancho:[''],
    largo:[''],
    gramaje:[''],
    calibre:[''],
    producto:['', Validators.required],
    marca:['',Validators.required],
    presentacion:['', Validators.required],
    unidad:['',Validators.required],
    neto:['', Validators.required],
    color:['Negro',Validators.required],
    cinta:[''],
    // codigo:['',Validators.required],
    // cantidad:['', Validators.required],
    // lote:['', Validators.required],
    NewControl:['']
  });

  BobinaForm:FormGroup = this.fb.group({
    Nbobina:['', Validators.required],
    material:['', Validators.required],
    marca:[''],
    gramaje:['', Validators.required],
    calibre:['', Validators.required],
    ancho:['', Validators.required],
    peso:['', Validators.required],
    lote:['', Validators.required],
    convertidora:['',Validators.required]
  });


  constructor(private fb:FormBuilder,
              private api:RestApiService) {
                this.usuario = api.usuario;
              }


  ngOnInit(): void {
    this.porConfirmar();
    this.BuscarAlmacen();
    this.getAalmacenado();
    this.BuscarGruposEnAlmacen();
    // this.getSustratos();
    this.totalizar_materiales()
    this.Gs = (<HTMLInputElement>document.getElementById('selected')).value
    this.Buscar_conversiones()
    this.getbobinas();
    this.getOrdenes();
    this.buscarPendientes();
    this.buscarRepuestos();
    this.buscarRepuestosAprobados();
    this.getDevolucion();
    this.filterList();
    this.getAlmacenExterior()
    this.BuscarPendientes()
  }

  ngOnDestroy(): void {
    this.OnDestroy$.next();
  }

  public usuario

  public orden;

  public m_selected
  public almacenado_para_transferir:any = []

  public exterior = false;

  productos_seleccionados: any[] = [];
  productos_almacenados_en_a_exterior = []
  almacen_selected = ''
  exterior_sencillo = true;
  public observacion = ''
  public pendientes = []
  public traspasos_pendientes = false

  BuscarPendientes(){
    this.api.trasladosPendientes()
      .subscribe((resp:any)=>{
        this.pendientes = resp.traslado
        console.warn(this.pendientes)
      })
  }

  cancelar_tralado(traslado_id){


    Swal.fire({
      title: "¿Seguro que quieres cancelar este traslado?",
      text:'si cancelas este traslado no podras verlo otra vez en el futuro',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Cancelar",
      denyButtonText: `Mantener`,
      confirmButtonColor:'#f14668',
      denyButtonColor:'#3ec487'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.api.CancelarTraslado(traslado_id)
          .subscribe((resp:any)=>{
            this.traspasos_pendientes = false;
            this.getAlmacenExterior();
            this.BuscarPendientes();
            this.BuscarAlmacen();
            this.getAalmacenado();
            this.BuscarGruposEnAlmacen();
            // this.getSustratos();
            this.totalizar_materiales()
            Swal.fire({
              text:'Se canceló traslado de material',
              icon:'success',
              showConfirmButton:false,
              toast:true,
              timer:5000,
              position:'top-end',
              timerProgressBar:true
            })
          })
      } else if (result.isDenied) {
        Swal.fire({
          text:'No hubo cambios',
          icon:'info',
          showConfirmButton:false,
          toast:true,
          timer:5000,
          position:'top-end',
          timerProgressBar:true
        })
      }
    });
  }

  aceptar_traslado(traslado_id){
    this.api.AceptarTraslado(traslado_id)
      .subscribe((resp:any)=>{
        this.traspasos_pendientes = false;
        this.getAlmacenExterior();
        this.BuscarPendientes();
        this.BuscarAlmacen();
        this.getAalmacenado();
        this.BuscarGruposEnAlmacen();
        // this.getSustratos();
        this.totalizar_materiales()
        // this.NotaSalida(resp.traslado)
        Swal.fire({
          text:'Se aprobó traslado de material',
          icon:'success',
          showConfirmButton:false,
          toast:true,
          timer:5000,
          position:'top-end',
          timerProgressBar:true
        })
      })
  }

  getProductosAgrupados_(materiales:any): any[] {
    const agrupado = new Map<string, any>();
  
    for (const p of materiales) {
      const clave = `${p.material.ancho}|${p.material.largo}|${p.material.nombre}|${p.material.marca}|${p.material.calibre}|${p.material.gramaje}`;
  
      if (!agrupado.has(clave)) {
        agrupado.set(clave, {
          nombre: p.material.nombre,
          marca:p.material.marca,
          ancho:p.material.ancho,
          largo:p.material.largo,
          calibre: p.material.calibre,
          gramaje: p.material.gramaje,
          total: 0,
        });
      }
  
      agrupado.get(clave)!.total += Number(p.cantidad);
    }
  
    return Array.from(agrupado.values());
  }

  getProductosAgrupados(convertidora:any): any[] {
    const agrupado = new Map<string, any>();
  
    for (const p of this.filtrarPorAlmacen(convertidora)) {
      const clave = `${p.material.ancho}|${p.material.largo}|${p.material.nombre}|${p.material.marca}|${p.material.calibre}|${p.material.gramaje}`;
  
      if (!agrupado.has(clave)) {
        agrupado.set(clave, {
          nombre: p.material.nombre,
          marca:p.material.marca,
          ancho:p.material.ancho,
          largo:p.material.largo,
          calibre: p.material.calibre,
          gramaje: p.material.gramaje,
          total: 0,
        });
      }
  
      agrupado.get(clave)!.total += Number(p.cantidad);
    }
  
    return Array.from(agrupado.values());
  }


  getAlmacenExterior(){
    this.api.VerProductosDeAlmacenExterior()
      .subscribe((resp:any)=>{
        this.productos_almacenados_en_a_exterior = resp.data
      })
  }

  NotaSalida = async(data:any) =>{

    const fecha = moment(data.fecha).format('DD/MM/YYYY')

    const pdf = new PdfMakeWrapper();
    PdfMakeWrapper.setFonts(pdfFonts);
    pdf.pageOrientation('portrait');

    pdf.add(
      new Table([
        [
          new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([35, 5]).build()).rowSpan(4).end,
          new Cell(new Txt(`
          NOTA DE TRASLADO DE MATERIALES`).bold().end).alignment('center').fontSize(13).rowSpan(4).end,
          new Cell(new Txt('Código: FAL-007').end).fillColor('#dedede').fontSize(8).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('N° de Revisión: 0').end).fillColor('#dedede').fontSize(8).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('Fecha de Revision: 14/05/2025').end).fillColor('#dedede').fontSize(8).alignment('center').end,
        ],
        [
          new Cell(new Txt('').end).end,
          new Cell(new Txt('').end).end,
          new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(8).alignment('center').end,
        ],
      ]).widths(['25%','50%','25%']).end
    )

    pdf.add(

      pdf.ln(1)

    )

    pdf.add(
      new  Table([
        [
          new Cell(new Txt('Destino').end).fillColor('#dedede').fontSize(10).end,
          new Cell(new Txt('Nº').end).fillColor('#dedede').fontSize(10).end
        ],
        [
          new Cell(new Txt(data.destino).end).margin([0,5,0,0]).fontSize(10).end,
          new Cell(new Txt(`AL-NT-${data.numero}`).bold().end).fontSize(20).end
        ]
      ]).widths(['70%','30%']).end
    )

    pdf.add(
      pdf.ln(1)
    )

    const materiales_ = [
      'Metalizado 70g/m² - 63pt (72x50)','Metalizado 70g/m² - 63pt (72x50)','Metalizado 70g/m² - 63pt (72x50)','Metalizado 70g/m² - 63pt (72x50)'
    ]

    const materiales = data.materiales.map(m =>
      `${m.material?.nombre || 'Sin nombre'} (${m.material?.marca || 'Sin marca'}) ` +
      `${m.material?.gramaje || 'N/A'}g/m² - ${m.material?.calibre || 'N/A'}pt ` +
      `(${m.material?.ancho || 'N/A'}x${m.material?.largo || 'N/A'})`
    );
    
    const paletas = data.materiales.map(m => m.codigo || '');
    const lotes = data.materiales.map(m => m.lote || '');
    const cantidades = data.materiales.map(m => m.cantidad || '');

    pdf.add(
      new  Table([
        [
          new Cell(new Txt('Material').end).fillColor('#dedede').fontSize(10).end,
          new Cell(new Txt('Código').end).fillColor('#dedede').fontSize(10).end,
          new Cell(new Txt('Lote').end).fillColor('#dedede').fontSize(10).end,
          new Cell(new Txt('Cantidad (und)').end).fillColor('#dedede').fontSize(10).end
        ],
        [
          new Cell(new Stack(materiales).end).fontSize(10).end,
          new Cell(new Stack(paletas).end).fontSize(10).end,
          new Cell(new Stack(lotes).end).fontSize(10).end,
          new Cell(new Stack(cantidades).end).fontSize(10).end
        ],
      ]).widths(['55%','15%','15%','15%']).end
    )

    pdf.add(
      pdf.ln(1)
    )

    pdf.add(
      new  Table([
        [
          new Cell(new Txt('Observación:').end).fillColor('#dedede').fontSize(10).end,
        ],
        [
          new Cell(new Txt(data.observacion).end).height(5).fontSize(10).end,
        ],
      ]).widths(['100%']).end
    )

    pdf.add(
      pdf.ln(1)
    )

    pdf.add(
      new  Table([
        [
          new Cell(new Txt('Solicitado por:').end).fillColor('#dedede').fontSize(10).end,
          new Cell(new Txt('Entregado por:').end).fillColor('#dedede').fontSize(10).end,
          new Cell(new Txt('Recibido por:').end).fillColor('#dedede').fontSize(10).end
        ],
        [
          new Cell(new Txt(`Firma: ${data.solicitado}
          
          Fecha: ${fecha}`).end).fontSize(10).end,
          new Cell(new Txt(`Firma:
          
          Fecha:`).end).fontSize(10).end,
          new Cell(new Txt(`Firma:
          
          Fecha:`).end).fontSize(10).end
        ],
      ]).widths(['30%','30%','30%']).end
    )


    pdf.create().download()
  }

  Transferir() {
    // Antes de enviar, agrega la propiedad "almacen" a cada producto
    const productosAEnviar = this.productos_seleccionados.map(producto => ({
      ...producto,
      almacen: this.almacen_selected,
      observacion:this.observacion
    }));

    // CREAR PDF:::::::::::::::::::::::::::::::::::.
    const data = {
      destino:this.almacen_selected,
      numero:'',
      materiales:productosAEnviar,
      observacion:this.observacion,
      solicitado:`${this.usuario.Nombre} ${this.usuario.Apellido}`,
    }

    console.log(data)


    // CREAR PDF:::::::::::::::::::::::::::::::::::.
  
    // Ahora envía el array modificado
    this.api.InsertarVariosAAlmacenExterior(data)
      .subscribe((resp: any) => {
        // this.NotaSalida(resp.traslado)
        this.BuscarPendientes();
        this.getAlmacenExterior();
        this.productos_seleccionados = []
        this.m_selected = ''
        this.translado = false
        Swal.fire({
          text:`Se traslado material a ${this.almacen_selected}`,
          icon:'success',
          toast:true,
          showConfirmButton:false,
          position:'top-end',
          timer:5000,
          timerProgressBar:true
        })
      });
  }

  filtrarPorAlmacen(almacen_:any){
    return this.productos_almacenados_en_a_exterior.filter((almacen:any) => almacen.almacen === almacen_)
  }

  toggleSeleccionProducto(producto: any, event: any) {
    if (event.target.checked) {
      // Agregar a la lista
      this.productos_seleccionados.push(producto);
    } else {
      // Quitar de la lista
      this.productos_seleccionados = this.productos_seleccionados.filter(
        (p) => p._id !== producto._id // usa un campo único para identificar
      );
    }
    console.log('Seleccionados:', this.productos_seleccionados);
  }


  filtrarSustrato(){
    return this.TOTALES.filter((t:any) => t.grupo === 'Sustrato')
  }

  BuscarMaterialSelected(e: any) {
    const sustrato = JSON.parse(e.value);
    console.log(sustrato)
    console.log(sustrato)
    this.almacenado_para_transferir.push(this.listFiltered.filter((material:any)=> material.material.gramaje == sustrato.gramaje && material.material.calibre == sustrato.calibre && material.material.nombre == sustrato.material && material.material.marca == sustrato.marca && material.material.ancho == sustrato.ancho && material.material.largo == sustrato.largo));
    this.almacenado_para_transferir = this.almacenado_para_transferir.flat();
    console.log(this.almacenado_para_transferir)
    this.productos_seleccionados = []
  }

  generarPdf_(){
    let grupos = this.SECCIONES;
    let grupo = this.grupo_to_download;
    let productos = this.listFiltered;
    let hoy = moment().format('DD/MM/YYYY')

    function generar_pdf(){
          const pdf = new PdfMakeWrapper();
          PdfMakeWrapper.setFonts(pdfFonts);
          pdf.pageOrientation('landscape');

          pdf.add(
            new Table([
              [
                new Cell(new Txt(hoy).end).border([false, false]).end,
              ]
            ]).widths(['100%']).end
          )

          pdf.add(
            new Table([
              [
                new Cell(new Txt('').end).border([false, false]).end,
              ]
            ]).widths(['100%']).end
          )

            pdf.add(
              new Table([
                [
                  new Cell(new Txt(grupo).end).fillColor('#000000').color('#ffffff').end,
                ]
              ]).widths(['100%']).end
            )

            pdf.add(
              new Table([
                [
                  new Cell(new Txt('Material').end).fillColor('#696969').end,
                  new Cell(new Txt('Marca').end).fillColor('#696969').end,
                  new Cell(new Txt('Presentación').end).fillColor('#696969').end,
                  new Cell(new Txt('Código').end).fillColor('#696969').end,
                  new Cell(new Txt('Lote').end).fillColor('#696969').end,
                  new Cell(new Txt('Gramaje').end).fillColor('#696969').end,
                  new Cell(new Txt('Calibre').end).fillColor('#696969').end,
                  new Cell(new Txt('Total').end).fillColor('#696969').end,
                ]
              ]).widths(['24%','16%','17%','9%','9%','8%','7%','10%']).end
            )
            for(let n=0;n<productos.length;n++){
              if(productos[n].material.grupo.nombre === grupo && productos[n].cantidad > 0){
                let producto = (productos[n].material.neto * productos[n].cantidad).toFixed(2);
                if(grupo === 'Sustrato'){
                  pdf.add(
                    new Table([
                      [
                        new Cell(new Txt(`${productos[n].material.nombre} (${productos[n].material.ancho} x ${productos[n].material.largo})`).end).end,
                        new Cell(new Txt(productos[n].material.marca).end).end,
                        new Cell(new Txt(`${productos[n].material.presentacion} ${productos[n].material.neto} ${productos[n].material.unidad}`).end).end,
                        new Cell(new Txt(productos[n].codigo).end).end,
                        new Cell(new Txt(productos[n].lote).end).end,
                        new Cell(new Txt(productos[n].material.gramaje).end).end,
                        new Cell(new Txt(productos[n].material.calibre).end).end,
                        new Cell(new Txt(`${producto} ${productos[n].material.unidad}`).end).end,
                      ]
                    ]).widths(['24%','16%','17%','9%','9%','8%','7%','10%']).end
                  )
                }else{
                  pdf.add(
                    new Table([
                      [
                        new Cell(new Txt(`${productos[n].material.nombre}`).end).end,
                        new Cell(new Txt(productos[n].material.marca).end).end,
                        new Cell(new Txt(`${productos[n].material.presentacion} ${productos[n].material.neto} ${productos[n].material.unidad}`).end).end,
                        new Cell(new Txt(productos[n].codigo).end).end,
                        new Cell(new Txt(productos[n].lote).end).end,
                        new Cell(new Txt('N/A').end).end,
                        new Cell(new Txt('N/A').end).end,
                        new Cell(new Txt(`${producto} ${productos[n].material.unidad}`).end).end,
                      ]
                    ]).widths(['24%','16%','17%','9%','9%','8%','7%','10%']).end
                  )
                }
              }
              
            }

      pdf.create().download()
    }
    generar_pdf();
  }

  
  _generarPdf_(){
    let grupo = this.grupo_to_download;
    let material = this.TOTALES
    let hoy = moment().format('DD/MM/YYYY')


    function generarResumen(){
      const pdf = new PdfMakeWrapper();
      PdfMakeWrapper.setFonts(pdfFonts);


      pdf.add(
        new Table([
          [
            new Cell(new Txt(hoy).end).border([false, false]).end,
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').end).border([false, false]).end,
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(grupo).end).fillColor('#000000').color('#ffffff').end
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('').fontSize(2).end).border([false, false]).end
          ]
        ]).widths(['100%']).end
      )

      if(grupo === 'Sustrato'){
        pdf.add(
          new Table([
            [
              new Cell(new Txt('Material').end).fillColor('#ededed').end,
              new Cell(new Txt('Marca').end).fillColor('#ededed').end,
              new Cell(new Txt('Calibre').end).fillColor('#ededed').end,
              new Cell(new Txt('Gramaje').end).fillColor('#ededed').end,
              new Cell(new Txt('Total').end).fillColor('#ededed').end,
            ]
          ]).widths(['35%','25%','10%','10%','20%']).end
        )
      }else{
        pdf.add(
          new Table([
            [
              new Cell(new Txt('Material').end).fillColor('#ededed').end,
              new Cell(new Txt('Marca').end).fillColor('#ededed').end,
              new Cell(new Txt('Total').end).fillColor('#ededed').end,
            ]
          ]).widths(['60%','30%','10%']).end
        )
      }

      if(grupo === 'Sustrato'){
        for(let i=0;i<material.length;i++){
          if(material[i].grupo === grupo){
            let total = (material[i].neto * material[i].total).toFixed(2);
            total = `${total} ${material[i].unidad}` 
            pdf.add(
              new Table([
                [
                  new Cell(new Txt(`${material[i].material} (${material[i].ancho} x ${material[i].largo})`).end).end,
                  new Cell(new Txt(material[i].marca).end).end,
                  new Cell(new Txt(material[i].calibre).end).end,
                  new Cell(new Txt(material[i].gramaje).end).end,
                  new Cell(new Txt(total).end).end,
                ]
              ]).widths(['35%','25%','10%','10%','20%']).end
            )
          }
        }
      }else{
        for(let i=0;i<material.length;i++){
          if(material[i].grupo === grupo){
            let total = (material[i].neto * material[i].total).toFixed(2);
            total = `${total} ${material[i].unidad}` 
            pdf.add(
              new Table([
                [
                  new Cell(new Txt(`${material[i].material} (${material[i].presentacion} ${material[i].neto}${material[i].unidad})`).end).end,
                  new Cell(new Txt(material[i].marca).end).end,
                  new Cell(new Txt(total).end).end,
                ]
              ]).widths(['60%','30%','10%']).end
            )
          }
        }
      }

      pdf.create().download()
    }
    generarResumen();
  }

  generarPdf(){
    let bobinas = this.BOBINAS_
    let hoy = moment().format('DD/MM/YYYY')

    function generar_reporte(){
          const pdf = new PdfMakeWrapper();
          PdfMakeWrapper.setFonts(pdfFonts);
          pdf.pageOrientation('portrait');

          pdf.add(
            new Table([
              [
                new Cell(new Txt(hoy).end).border([false, false]).end,
              ]
            ]).widths(['100%']).end
          )
    
          pdf.add(
            new Table([
              [
                new Cell(new Txt('').end).border([false, false]).end,
              ]
            ]).widths(['100%']).end
          )
    

          pdf.add(
            new Table([
              [
                new Cell(new Txt('Nº').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Material').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Gramaje (g/m²)').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Calibre').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Ancho (cm)').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Peso').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Lote').end).fillColor('#000000').color('#ffffff').end,
              ],
              [
                new Cell(new Txt('Convertidora Finlandia, C.A.').end).colSpan(7).fillColor('#696969').color('#ffffff').end,
                new Cell(new Txt('Material').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Gramaje (g/m²)').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Calibre').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Ancho (cm)').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Peso').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Lote').end).fillColor('#000000').color('#ffffff').end,
              ]
            ]).widths(['12%','40%','10%','9%','9%','9%','11%']).end
          )

          for(let i=0;i<bobinas.length;i++){
            if(bobinas[i].convertidora === 'Convertidora Finlandia, C.A.'){
              pdf.add(
                new Table([
                  [
                    new Cell(new Txt(bobinas[i].Nbobina).end).end,
                    new Cell(new Txt(`${bobinas[i].material}(${bobinas[i].marca})`).end).end,
                    new Cell(new Txt(bobinas[i].gramaje).end).end,
                    new Cell(new Txt(bobinas[i].calibre).end).end,
                    new Cell(new Txt(bobinas[i].ancho).end).end,
                    new Cell(new Txt(bobinas[i].peso).end).end,
                    new Cell(new Txt(bobinas[i].lote).end).end,
                  ]
                ]).widths(['12%','40%','10%','9%','9%','9%','11%']).end
              )
            }
          }
          pdf.add(
            new Table([
              [
                new Cell(new Txt('Convertidora Finlandia, C.A.').end).colSpan(7).fillColor('#696969').color('#ffffff').end,
                new Cell(new Txt('Material').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Gramaje (g/m²)').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Calibre').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Ancho (cm)').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Peso').end).fillColor('#000000').color('#ffffff').end,
                new Cell(new Txt('Lote').end).fillColor('#000000').color('#ffffff').end,
              ]
            ]).widths(['12%','40%','10%','9%','9%','9%','11%']).end
          )
          for(let i=0;i<bobinas.length;i++){
            if(bobinas[i].convertidora === 'Redispaca Distribuidora de Papel, C.A.'){
              pdf.add(
                new Table([
                  [
                    new Cell(new Txt(bobinas[i].Nbobina).end).end,
                    new Cell(new Txt(`${bobinas[i].material}(${bobinas[i].marca})`).end).end,
                    new Cell(new Txt(bobinas[i].gramaje).end).end,
                    new Cell(new Txt(bobinas[i].calibre).end).end,
                    new Cell(new Txt(bobinas[i].ancho).end).end,
                    new Cell(new Txt(bobinas[i].peso).end).end,
                    new Cell(new Txt(bobinas[i].lote).end).end,
                  ]
                ]).widths(['12%','40%','10%','9%','9%','9%','11%']).end
              )
            }
          }
        pdf.create().download()
    }
    generar_reporte();

  }

  buscarRepuestosAprobados(){
    this.api.getRepuestosAprobados()
      .subscribe((resp:any)=>{
        this.RepuestosAprobados = resp;
        // console.log(this.RepuestosAprobados)
      })
  }
  modal_asignacion_repuestos(){
    if(this.RepuestosAprobados.length > 0){
      if(this.asignacion_){
        this.aprobadosRepuesto = false;
        this.asignacion_ = false
      }else{
        this.asignacion_ = true
        this.aprobadosRepuesto = true
      }
    }
  }

  filterList(): void {
    this.searchTerm$
    .pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.OnDestroy$)
    )
    .subscribe(term => {
      this.listFiltered = this.Almacenado
        .filter(item => item.material.nombre.toLowerCase().indexOf(term.toLowerCase()) >= 0);
    });
  }

  cerrarAsignacion(){
    this.asignacion_ = false
    this.Repuestos = false
    this.buscarPendientes()
    this.getOrdenes();
  }

  CancelarDevolucion(id){
    Swal.fire({
      title:'Cuidado!',
      text:'¿Estas seguro que quieres cancelar esta devolución?. No se podrá recuperar esta información luego',
      icon:'warning',
      showCancelButton:true,
      showConfirmButton:true,
      confirmButtonText:'Si!, Cancelar devolución.',
      cancelButtonText:'Mantener devolución pendiente.',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        // // // console.log(id);

        this.api.DeleteDevolucion(id)
          .subscribe((resp:any)=>{
            Swal.fire(
              {
                title:'Cancelado!',
                text:'Esta devolución fué cancelada, el almacén no sufrio ningun cambio.',
                icon:'success',
                showConfirmButton:false
              })
              this.getDevolucion();
              this.Modal_Devolucion()
              this.getAalmacenado();
          })
      }
    })

  }

  changeView_(){
    if(this.Bobillas){
      this.Bobillas = false;
    }else{
      this.Bobillas = true;
    }
  }

  confirmarDevolucion(data, id){

    Swal.fire({
      title:'Cuidado!',
      text:'Verifica las cantidades que sean correctas antes de confirmar.',
      icon:'warning',
      showCancelButton:true,
      showConfirmButton:true,
      confirmButtonText:'Confirmar!',
      cancelButtonText:'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {

        // // // console.log(data);
        // // // console.log(id);

        this.api.putDevolucion(id,data)
          .subscribe((resp:any)=>{

            Swal.fire(
              {
                title:'Confirmado!',
                text:'El material fué agregado al almacén.',
                icon:'success',
                showConfirmButton:false
              })

              this.getDevolucion();
              this.Modal_Devolucion()
              this.getAalmacenado();
          })
      }
    })

  }

  getDevolucion(){
    this.api.getDevolucion()
      .subscribe((resp:any) => {
        this.Devoluciones = resp;
      })
  }


  getOrdenes(){
    this.api.getOrden()
    .subscribe( (resp:any) => {
      this.orden = resp;
    } )

  }

  buscarPendientes(){
    this.api.getRequiEspera()
      .subscribe((resp:any)=>{
        this.Pendiente = resp;
      })
  }

  public Repuestos;
  buscarRepuestos(){
    this.api.getRequisicionRepuesto()
      .subscribe((resp:any)=>{
        this.Repuestos = resp
      })
  }


  Requisicion(){
    this.confirmacion = true
  }

  showOrden(){
    // // // console.log(this.orden)
  }

  agregarRequisicion(e){
    this.necesario.push(e)
  }

  public necesario = [];

  porConfirmar(){
    // console.log('WHAAT')
    this.api.getMaterialesPorConfirmar()
      .subscribe((resp:any)=>{
        // console.log('ok')
        this.necesario = resp;
      })
  }

  define_color(e){
    if(e != 'Pantone'){
      this.InventarioForm.get('color').setValue(e);
      (<HTMLInputElement>document.getElementById('color')).value = e;
    }else{
      (<HTMLInputElement>document.getElementById('color')).value = '';
      (<HTMLInputElement>document.getElementById('color')).disabled = false;
    }
  }

  Modal_Devolucion(){
    if(this.Dev_){
      this.Dev_ = false;
    }else{
      this.Dev_ = true;
    }
  }

  Modal_Almacen_ep(){
    if(this.Editar_NUEVO_PRODUCTO){
      this.Editar_NUEVO_PRODUCTO = false;
    }else{
      this.Editar_NUEVO_PRODUCTO = true;
    }
  }

  modal_asignacion(){
    if(this.necesario.length > 0){
      if(this.asignacion_){
        this.asignacion_ = false
      }else{
        this.asignacion_ = true
      }
    }
  }

  existencia_(seccion){

    let existencia = this.Almacenado.find(x => x.material.grupo.nombre === seccion)

    if(existencia){
      return true
    }else{
      return false
    }

  }

  public _sustratos_ = []
  public Test_UniqueObjectNewMap_valuesAsArr = []
  buscarSustratos(){
    let x = 0;
    let sustratos = this.ALMACEN.filter(x => x.grupo.nombre == 'Sustrato')
    for(let i=0; i<sustratos.length; i++){
      let sustrato = this._sustratos_.find(x=> x == sustratos[i].nombre);
      x++
      if(!sustrato){
        this._sustratos_.push({Marca:`${sustratos[i].nombre} (${sustratos[i].marca})`,Nombre:`${sustratos[i].nombre}`})
      }
      if(x == sustratos.length)
      {
        let newArray_test:any;
        newArray_test = this._sustratos_

        let UniqueArrayforMarca = [
          ...new Map(this._sustratos_.map((item) => [item["Marca"], item])).values(),
        ]

        let Test_UniqueObject = newArray_test.map((item) => [item['Marca'], item]);

        let Test_UniqueObjectNewMap = new Map(Test_UniqueObject)

        let Test_UniqueObjectNewMap_keys = Test_UniqueObjectNewMap.keys()
        let Test_UniqueObjectNewMap_values = Test_UniqueObjectNewMap.values()
        this.Test_UniqueObjectNewMap_valuesAsArr = [
          ...Test_UniqueObjectNewMap_values
        ]

        // // console.log(this.Test_UniqueObjectNewMap_valuesAsArr)
        // // console.log(this._sustratos_)

      }
    }
  }

  public _calibre_ = []
  buscarCalibre(e){
    let material = (<HTMLInputElement>document.getElementById('Material_Seleccionado')).value
    let splitted = material.split('_')
    let e1 = splitted[0];
    let marca = splitted[1].split('(')
    let sustratos = this.ALMACEN.filter(x =>x.nombre == e1 && x.marca == marca[1].slice(0,-1) && x.gramaje == e)
    // // // console.log(sustratos,'15515151515151515151515151515151')
    for(let i=0; i<sustratos.length; i++){
      let calibre = this._calibre_.find(x=> x.calibre == sustratos[i].calibre);
      if(!calibre){
        this._calibre_.push(sustratos[i])
        }
    }
  }

  public _gramajes_ = []
  buscarGramaje(e:string){
    let splitted = e.split('_')
    let e1 = splitted[0];
    let marca = splitted[1].split('(')
    console.log(e1,'<>',marca)
    this._gramajes_ = []
    let sustratos = this.ALMACEN.filter(x => x.nombre == e1 && x.marca == marca[1].slice(0,-1))
    for(let i=0; i<sustratos.length; i++){
      let gramaje = this._gramajes_.find(x=> x.gramaje == sustratos[i].gramaje);
      if(!gramaje){
        this._gramajes_.push(sustratos[i])
        }
    }
    // // // console.log(this._gramajes_,'GRAMAGRAMAGRAMA')
  }

  public _ancho_ = []
  buscarAncho(e){
    let material = (<HTMLInputElement>document.getElementById('Material_Seleccionado')).value
    let splitted = material.split('_')
    let e1 = splitted[0];
    let marca = splitted[1].split('(')
    let gramaje = (<HTMLInputElement>document.getElementById('Gramaje_Seleccionado')).value
    this._ancho_ = []
    let sustratos = this.ALMACEN.filter(x => x.calibre == e && x.nombre == e1 && x.marca == marca[1].slice(0,-1) && x.gramaje == gramaje)
    for(let i=0; i<sustratos.length; i++){
      let ancho = this._ancho_.find(x=> x.ancho == sustratos[i].ancho);
      if(!ancho){
        this._ancho_.push(sustratos[i])
        }
    }
  }

  define_color2(e){
    if(e != 'Pantone'){
      this.MaterialID.color = e;
    }else{
      (<HTMLInputElement>document.getElementById('color')).disabled = false;
      (<HTMLInputElement>document.getElementById('color')).value = '';
    }
  }

  Editar_2(id){
    this.Modal_Almacen_ep()
    this.api.getMaterialesID(id)
      .subscribe((resp:any)=>{
        this.MaterialID = resp;
        if(resp.grupo.nombre === 'Tinta'){
          this.New_color = true;
        }
        if(resp.grupo.nombre === 'Cajas Corrugadas'){
          this.caja_ = true;
        }
        // // // console.log(this.MaterialID,'ok')
      })
  }

  Editar_Material_F(){
    let grupo = this.MaterialID.grupo._id;

    this.MaterialID.grupo = grupo;

    // // // console.log(this.MaterialID)

    this.api.putMaterialID(this.MaterialID._id, this.MaterialID)
          .subscribe((resp:any)=>{
            this.Modal_Almacen_ep();
            this.getAalmacenado();
                this.BuscarAlmacen();
                this.totalizar_materiales();
                Swal.fire({
                  position:'center',
                  icon:'success',
                  title:'Material editado con exito!',
                  showConfirmButton: false,
                  timer:1500
                })

          })
  }

  public precioID = 0
  Editar(id){
    this.edit_almacen()
    this.api.getAlmacenadoID(id)
      .subscribe((resp:any)=>{
        this.AlmacenadoId = resp;
        // console.log(this.AlmacenadoId)
        this.selecciona_producto(this.AlmacenadoId.material.grupo.nombre)
        this.codigoID = this.AlmacenadoId.codigo;
        this.loteID = this.AlmacenadoId.lote;
        this.cantidadID = this.AlmacenadoId.cantidad;
        this.precioID = this.AlmacenadoId.precio
      })
  }

  _Editar(producto){
    let body = {
      material:this.AlmacenadoId.material._id,
      codigo:this.codigoID,
      lote:this.loteID,
      cantidad:this.cantidadID,
      motivo:this.Edition__,
      precio:this.precioID
    }

    this.api.putAlmacenadoID(this.AlmacenadoId._id, body)
    .subscribe((resp:any)=>{
      this.edit_almacen();
      Swal.fire({
        position:'center',
        icon:'success',
        title:'El inventario fue editado con exito',
        showConfirmButton: false,
        timer:1500
      })
      this.getAalmacenado();
      this.BuscarAlmacen();
      this.totalizar_materiales();
      this.codigoID = ''
      this.loteID = ''
      this.cantidadID = ''
      this.AlmacenadoId = ''
    })

  }

  public edit_almacen(){
    if(this.EDICION_ALMACEN){
      this.EDICION_ALMACEN = false;
    }else{
      this.EDICION_ALMACEN = true;
    }
  }

  Almacenes(e){
    if(e == 'Almacenada'){
      if(!this.resumido){
        this.resumido = true;
        this.detallado = false;
      }
      this._Almacenado = true;
      this._bobina = false;
    }else if(e == 'Bobinas'){
      this._Almacenado = false;
      this._bobina = true;
      this.getbobinas();
    }else{
      if(this.resumido){
        this.resumido = false;
        this.detallado = true;
      }
      this._Almacenado = false;
      this._bobina = false;
    }
  }

  getAalmacenado(){
    this.api.getAlmacenado()
      .subscribe((resp:any)=>{
        this.Almacenado = resp;
        console.warn('::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::',resp)
        this.Almacenado = this.Almacenado.sort(function(a, b) {
          if(a.material.nombre.toLowerCase() < b.material.nombre.toLowerCase()) return -1
          if(a.material.nombre.toLowerCase() > b.material.nombre.toLowerCase()) return 1
          return 0

        })
        // // // console.log(this.Almacenado)
        // this.listFiltered = this.Almacenado
        this.filterList();
        this.totalizar_materiales();
      })
  }

  puntoYcoma(n){
   return n = new Intl.NumberFormat('de-DE').format(n)
  }

  Cambio_opciones(e){
    if(e === 'otros'){
      this.OTRO = true
    }else{
      this.OTRO = false;
      this.Gs = e;
    }

    if(e === '61f92a1f2126d717f004cca6'){
      this.New_Sustrato = true;
    }else{
      this.New_Sustrato = false;
    }

    if(e === '61fd54e2d9115415a4416f17'){
      this.New_color = true;
    }else{
      this.New_color = false;
    }

    if(e === '61fd7a8ed9115415a4416f74'){
      this.caja_ = true;
    }else{
      this.caja_ = false
    }

  }

  public Edition__ = '';
  public Edition__2 = '';

  public Nuevo_producto(){
    if(this._NUEVO_PRODUCTO){
      this._NUEVO_PRODUCTO = false;
    }else{
      this._NUEVO_PRODUCTO = true;
    }

  }

  public Modal_Almacen(){
    if(this.NUEVO_PRODUCTO){
      this.NUEVO_PRODUCTO = false;
    }else{
      this.NUEVO_PRODUCTO = true;
    }
  }

  public Modal_bobinas(){
    if(this.BOBINAS){
      this.BOBINAS = false;
    }else{
      this.BOBINAS = true;
      this.buscarSustratos()
    }
  }

  public modal_Conversion(){
    if(this.CONVERSION){
      this.CONVERSION = false;
    }else{
      this.CONVERSION = true;
    }
  }

  public modal_reporte(){
    if(this.reporte){
      this.reporte = false;
    }else{
      this.reporte = true;
    }
  }

  public check_bobinas(){
    if(this.CONSULTAB){
      this.CONSULTAB = false;
    }else{
      this.CONSULTAB = true;
    }
  }

  public bobina__;
  descontar_bobina(bobina?){
    if(this.descontar_b){
      this.descontar_b = false;
    }else{
      this.descontar_b = true;
      this.bobina__ = bobina;
    }
  }
  descontar_bobina_(numero){
    let data = {
      bobina:this.bobina__,
      numero
    }
    this.api.deleteBobina(data)
      .subscribe((resp:any)=>{
        Swal.fire({
          text:resp,
          icon:'info',
          showConfirmButton:false
        });
        this.getbobinas();
        this.descontar_bobina();
        this.Buscar_conversiones();
      })
  }

  BuscarGruposEnAlmacen(){
    this.loading = true;
    this.api.GetGrupoMp()
      .subscribe((resp:any)=>{
        this.SECCIONES = resp
        this.loading = false;
      })
  }

  BuscarAlmacen(){
    this.loading = true;
    this.api.getAlmacen()
      .subscribe((resp:any) => {
        this.ALMACEN = resp.materiales;
        // // console.log('666666666666666666666666',this.ALMACEN)
        this.filterList();
        this.totalizar_materiales()
        this.loading = false;
      })
  }


  selecciona_producto(e){
    if(e == 0){
      (<HTMLInputElement>document.getElementById('Producto_select')).disabled = true;
    }else{
      (<HTMLInputElement>document.getElementById('Producto_select')).disabled = false;
      this.product_selected = e;
    }
  }

  public ButtonsEdit:boolean = false;
  public Bobina_index = null;
  EditarBobina(i,n){
    this.Bobina_index = i;
    this.ButtonsEdit = true
    document.getElementById(`${i}${n}1`).style.display = 'block'
    document.getElementById(`${i}${n}2`).style.display = 'block'
    document.getElementById(`${i}${n}3`).style.display = 'block'
    document.getElementById(`${i}${n}4`).style.display = 'block'
    document.getElementById(`${i}${n}5`).style.display = 'block'
    document.getElementById(`${i}${n}6`).style.display = 'block'

    document.getElementById(`1${i}${n}`).style.display = 'none'
    document.getElementById(`2${i}${n}`).style.display = 'none'
    document.getElementById(`3${i}${n}`).style.display = 'none'
    document.getElementById(`4${i}${n}`).style.display = 'none'
    document.getElementById(`5${i}${n}`).style.display = 'none'
    document.getElementById(`6${i}${n}`).style.display = 'none'

  }

  DoneEdit(i,n){
    this.Bobina_index = null;
    this.ButtonsEdit = false;
    document.getElementById(`${i}${n}1`).style.display = 'none'
    document.getElementById(`${i}${n}2`).style.display = 'none'
    document.getElementById(`${i}${n}3`).style.display = 'none'
    document.getElementById(`${i}${n}4`).style.display = 'none'
    document.getElementById(`${i}${n}5`).style.display = 'none'
    document.getElementById(`${i}${n}6`).style.display = 'none'

    document.getElementById(`1${i}${n}`).style.display = 'block'
    document.getElementById(`2${i}${n}`).style.display = 'block'
    document.getElementById(`3${i}${n}`).style.display = 'block'
    document.getElementById(`4${i}${n}`).style.display = 'block'
    document.getElementById(`5${i}${n}`).style.display = 'block'
    document.getElementById(`6${i}${n}`).style.display = 'block'

    // console.log(this.BOBINAS_[i]._id,'/',this.BOBINAS_[i])

    this.api.putBobinas(this.BOBINAS_[i]._id, this.BOBINAS_[i])
      .subscribe((resp:any)=>{
        Swal.fire({
          title:'Editado',
          text:'Bobina editada correctamente',
          icon:'success',
          showConfirmButton:false
        })
      })

  }

  public fuera = false

  almacenar(producto){
    let data = {
      material:producto.value,
      codigo:this.codigo,
      lote:this.lote,
      cantidad:this.cantidad,
      pedido:this.pedido,
      precio:this.precio,
      fuera:this.fuera
    }

    this.api.postAlmacenado(data)
      .subscribe((resp:any)=>{
        Swal.fire({
          position:'center',
          icon:'success',
          title:'Nueva materia prima agregada',
          showConfirmButton: false,
          timer:1500
        })
        this.Nuevo_producto();
        this.BuscarAlmacen();
        this.getAalmacenado();
        this.codigo = '';
        this.lote = '';
        this.cantidad ='';
        this.precio = 0;
        this.pedido = '';
        (<HTMLInputElement>document.getElementById('Nuevoproducto')).value = "0";
      }, err =>{
        Swal.fire({
          position:'center',
          icon:'error',
          title:'Lote y código ya existe',
          text:'Este N° de Lote, junto a este código ya se encuentra registrado en Sio. Es necesario que cada producto almacenado sea único en el sistema.',
          showConfirmButton: false,
        })
      })
  }

  producto_seleccionado(e){
    if(e == 0){
      this._producto_seleccionado = false
      this.codigo = '';
      this.lote = '';
      this.cantidad = '';
    }else{
      this._producto_seleccionado = true
    }
  }


  Almacenar(){

    let grupo;

    if(this.OTRO){
    grupo = this.InventarioForm.get('NewControl').value
    }
    else{
      grupo = this.Gs;
    }


    const data = {
      producto: this.InventarioForm.get('producto').value,
      marca:this.InventarioForm.get('marca').value,

      ancho:this.InventarioForm.get('ancho').value,
      largo:this.InventarioForm.get('largo').value,
      gramaje:this.InventarioForm.get('gramaje').value,
      calibre:this.InventarioForm.get('calibre').value,


      // cantidad: this.InventarioForm.get('cantidad').value,
      unidad: this.InventarioForm.get('unidad').value,
      presentacion: this.InventarioForm.get('presentacion').value,
      neto: this.InventarioForm.get('neto').value,
      color:this.InventarioForm.get('color').value,
      // codigo: this.InventarioForm.get('codigo').value,
      // lote: this.InventarioForm.get('lote').value,
      cinta:this.InventarioForm.get('cinta').value,
      grupo,
      nuevo:this.OTRO

    }

    // // // console.log(this.InventarioForm.get('color').value)

    if(this.InventarioForm.invalid){
      return
    }



    this.api.PostAlmacen(data)
     .subscribe(resp=>{
        this.InventarioForm.reset();
        this.BuscarAlmacen();
        this.BuscarGruposEnAlmacen();
        this.Modal_Almacen();
        // this.getSustratos();
      })

   }

   Peso(e){
    this.PESO = e.target.value
    this.HOJAS = this.PESO*10000000000
    let otro = this.GRAMAJE*this.ANCHO*this.LARGO
    this.HOJAS = this.HOJAS/otro
    this.HOJAS = Math.trunc(this.HOJAS)
    // /( this.GRAMAJE*this.ANCHO*this.LARGO)
   }
   Gramaje(e){
     this.GRAMAJE = e
     this.HOJAS = this.PESO*10000000000
     let otro = this.GRAMAJE*this.ANCHO*this.LARGO
     this.HOJAS = this.HOJAS/otro
     this.HOJAS = Math.trunc(this.HOJAS)
     //  /( this.GRAMAJE*this.ANCHO*this.LARGO)
   }
   Ancho(e){
     this.ANCHO = e
     this.HOJAS = this.PESO*10000000000
     let otro = this.GRAMAJE*this.ANCHO*this.LARGO
     this.HOJAS = this.HOJAS/otro
     this.HOJAS = Math.trunc(this.HOJAS)
     //  /( this.GRAMAJE*this.ANCHO*this.LARGO)
   }
   Largo(e){
     this.LARGO = e
     this.HOJAS = this.PESO*10000000000
     let otro = this.GRAMAJE*this.ANCHO*this.LARGO
     this.HOJAS = this.HOJAS/otro
     this.HOJAS = Math.trunc(this.HOJAS)
     //  /( this.GRAMAJE*this.ANCHO*this.LARGO)
   }

  //  ***********************************************************
  Hojas_(e){
    this.HOJAS_ = e.target.value
    let all = this.HOJAS_ * this.GRAMAJE_*this.ANCHO_*this.LARGO_
    this.PESO_ = all / 10000000000;
    // /( this.GRAMAJE*this.ANCHO*this.LARGO)
   }
   Gramaje_(e){
     this.GRAMAJE_ = e.target.value
     let all = this.HOJAS_ * this.GRAMAJE_*this.ANCHO_*this.LARGO_
     this.PESO_ = all / 10000000000;
     //  /( this.GRAMAJE*this.ANCHO*this.LARGO)
   }
   Ancho_(e){
     this.ANCHO_ = e.target.value
     let all = this.HOJAS_ * this.GRAMAJE_*this.ANCHO_*this.LARGO_
     this.PESO_ = all / 10000000000;
     //  /( this.GRAMAJE*this.ANCHO*this.LARGO)
   }
   Largo_(e){
     this.LARGO_ = e.target.value
     let all = this.HOJAS_ * this.GRAMAJE_*this.ANCHO_*this.LARGO_
     this.PESO_ = all / 10000000000;
     //  /( this.GRAMAJE*this.ANCHO*this.LARGO)
   }
  //  ***********************************************************


  nuevaBobina(){
    let splited = this.BobinaForm.get('material').value;
    splited = splited.split('_')
    let marca = splited[1].split('(')
    this.BobinaForm.get('material').setValue(splited[0])
    this.BobinaForm.get('marca').setValue(marca[1].slice(0,-1))
    this.api.postNuevaBobina(this.BobinaForm.value)
      .subscribe((resp:any)=>{
        this.BobinaForm.reset();
        this.Modal_bobinas();
        this.getbobinas();
        Swal.fire({
          title:'Nueva Bobina Agregada!',
          text:'Se agregó una nueva bobina al almacen de bobinas',
          icon:'success',
          showConfirmButton:false
        })
      })
  }

  public Convertidora;
  seleccionar_material(e){
    (<HTMLInputElement>document.getElementById('bobina_selected')).disabled = false;
    this.SUSTRATO_CONVERSION = [];
    this.Convertidora = e;
    let BobinasEnConvertidora = this.BOBINAS_.filter(x => x.convertidora === e)
    // // console.log(BobinasEnConvertidora)
    for(let i = 0; i<BobinasEnConvertidora.length; i++){
      let bobina = BobinasEnConvertidora[i]
      // // console.log(bobina)
      // let sustrato = this.ALMACEN.filter(x => x.nombre == bobina.material && x.marca == bobina.marca && x.ancho == bobina.ancho && x.gramaje == bobina.gramaje && x.calibre == bobina.calibre)
      let sustrato = this.ALMACEN.filter(x => x.nombre == bobina.material &&  x.ancho == bobina.ancho)

          console.log(sustrato,'aja')
          if(sustrato){
          for(let i =0; i<sustrato.length;i++){
  
              let existe = this.SUSTRATO_CONVERSION.find(x => x._id == sustrato[i]._id)
              if(!existe){
                this.SUSTRATO_CONVERSION.push(sustrato[i])
              }
            }
          }
    }
  }

  public SUSTRATO_CONVERSION = [];
  public BobinasSencillas = [];
  getbobinas(){
    this.I_f = 0;
    this.I_r = 0;
    this.BobinasSencillas = [];
    this.api.getBobina()
      .subscribe((resp:any)=>{
        this.BOBINAS_ = resp;
        let Almacen = this.ALMACEN;
        for(let i = 0; i<this.BOBINAS_.length; i++){
          let bobina = this.BOBINAS_[i]
          if(bobina.convertidora === 'Convertidora Finlandia, C.A.'){
            this.I_f++;
          }else{
            this.I_r++;
          }
          let sumada = this.BobinasSencillas.findIndex(x => x.material === this.BOBINAS_[i].material && x.marca === this.BOBINAS_[i].marca && x.ancho === this.BOBINAS_[i].ancho && x.gramaje === this.BOBINAS_[i].gramaje && x.calibre === this.BOBINAS_[i].calibre && x.convertidora === this.BOBINAS_[i].convertidora)

          if(sumada < 0){
            let data = {
              material:this.BOBINAS_[i].material,
              marca:this.BOBINAS_[i].marca,
              calibre:this.BOBINAS_[i].calibre,
              gramaje:this.BOBINAS_[i].gramaje,
              ancho:this.BOBINAS_[i].ancho,
              convertidora:this.BOBINAS_[i].convertidora,
              peso:this.BOBINAS_[i].peso
            }
            this.BobinasSencillas.push(data)
          }
          else{
              let peso = Number(this.BobinasSencillas[sumada].peso) + Number(this.BOBINAS_[i].peso)
              this.BobinasSencillas[sumada].peso = peso
          }

          // // console.log(this.BobinasSencillas)

          let sustrato = this.ALMACEN.find(x => x.nombre == bobina.material && x.marca == bobina.marca && x.ancho == bobina.ancho && x.gramaje == bobina.gramaje)

          // // console.log(sustrato)
          if(sustrato){

            let existe = this.SUSTRATO_CONVERSION.find(x => x._id == sustrato._id)
            if(!existe){
              this.SUSTRATO_CONVERSION.push(sustrato)
            }
          }

          // let sustrato = this.ALMACEN.find(x => x.nombre == bobina.material && x.gramaje == bobina.gramaje && x.ancho == bobina.ancho)
          // // console.log(sustrato, 'bobina')
          // if(sustrato){
          //   // console.log( this.SUSTRATO_CONVERSION,'bOBINAS')

          // }
        }
      })
  }


  public conversiones = []
  Buscar_conversiones(){
    this.api.getConversiones()
      .subscribe((resp:any)=>{
        this.conversiones = resp;
      })
  }

  Buscar_Bobina(e){
    let material = this.ALMACEN.find(x => x._id == e.target.value)

    if(material){
      (<HTMLInputElement>document.getElementById('_gramaje')).value = material.gramaje;
      (<HTMLInputElement>document.getElementById('_ancho')).value = material.ancho;
      (<HTMLInputElement>document.getElementById('_largo')).value = material.largo;
      this.Gramaje(material.gramaje);
      this.Ancho(material.ancho);
      this.Largo(material.largo);
      // if(TheBobina){
      // (<HTMLInputElement>document.getElementById('_ancho')).value = TheBobina.ancho
      // }
      // if(TheBobina){
      //   // // console.log(TheBobina)
      //   this.Mat_Selected = TheBobina.material;
      //   this.Num_Bobina = TheBobina.Nbobina;
      // }
    }

  }

  public I_f = 0;
  public I_r = 0;

  Generar_Conversion(){
    let sustrato = (<HTMLInputElement>document.getElementById('bobina_selected')).value;
    let peso = (<HTMLInputElement>document.getElementById('_peso')).value;
    let gramaje = (<HTMLInputElement>document.getElementById('_gramaje')).value;
    let ancho = (<HTMLInputElement>document.getElementById('_ancho')).value;
    let largo = (<HTMLInputElement>document.getElementById('_largo')).value;
    let observacion = (<HTMLInputElement>document.getElementById('observacion')).value;
    let convertidora = (<HTMLInputElement>document.getElementById('convertidora')).value;
    let Material = this.ALMACEN.find(x=> x._id == sustrato)

    let data = {
      material:`${Material.nombre} (${Material.marca})`,
      codigo:this.Num_Bobina,
      peso,
      sustrato:`${Material.nombre} (${Material.marca})`,
      hojas:this.HOJAS,
    }

    let solicitado = [
      `${this.usuario.Nombre} ${this.usuario.Apellido}`,
      // 'Gerente de Operaciones',
      'Poligráfica Industrial, C.A.'
    ]

    let hojas:string = data.hojas.toString()

    let hoy = moment().format('DD/MM/YYYY')

     this.api.postNuevoSustrato(data)
       .subscribe((resp:any)=>{
         this.modal_Conversion();
         Swal.fire({
           title:'Nueva Solicitud de Conversion Creada',
           text:`Su solicitud de conversion para ${Material.nombre}, fue realizada`,
           icon:'success',
           showConfirmButton:false,
         })

        async function recibo() {
          const pdf = new PdfMakeWrapper();
          PdfMakeWrapper.setFonts(pdfFonts);
          pdf.pageOrientation('landscape');


          pdf.add(
            new Table([
              [
                new Cell(await new Img('../../assets/poli_cintillo.png').width(85).margin([35, 5]).build()).rowSpan(4).end,
                new Cell(new Txt(`
                SOLICITUD DE CONVERSIÓN`).bold().end).alignment('center').fontSize(13).rowSpan(4).end,
                new Cell(new Txt('Código: FAL-002').end).fillColor('#dedede').fontSize(9).alignment('center').end,
              ],
              [
                new Cell(new Txt('').end).end,
                new Cell(new Txt('').end).end,
                new Cell(new Txt('N° de Revisión: 0').end).fillColor('#dedede').fontSize(9).alignment('center').end,
              ],
              [
                new Cell(new Txt('').end).end,
                new Cell(new Txt('').end).end,
                new Cell(new Txt('Fecha de Revision: 3/11/2022').end).fillColor('#dedede').fontSize(9).alignment('center').end,
              ],
              [
                new Cell(new Txt('').end).end,
                new Cell(new Txt('').end).end,
                new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(9).alignment('center').end,
              ],
            ]).widths(['25%','50%','25%']).end
          )

          pdf.add(

            pdf.ln(2)

          )

          pdf.add(
            new Table([
              [
                new Cell(new Table(([
                  [
                    new Cell(new Txt('CONVERTIDORA').end).fillColor('#dedede').end,
                    new Cell(new Txt(convertidora).end).end,
                  ]
                ])
                ).widths(['30%','70%']).end
                ).alignment('center').end,

                new Cell(new Txt('').end).end,

                new Cell(new Table(([
                  [
                    new Cell(new Txt('CONVERSIÓN').end).alignment('center').colSpan(2).color('#ffffff').fillColor('#000000').end,
                    new Cell(new Txt('').end).end
                  ],
                  [
                    new Cell(new Txt('N°').margin([0,6]).end).alignment('center').fillColor('#dedede').end,
                    new Cell(new Txt(resp).bold().end).fontSize(20).end
                  ],
                  [
                    new Cell(new Txt('FECHA DE SOLICITUD').end).alignment('center').fillColor('#dedede').end,
                    new Cell(new Txt(`${hoy}`).margin([0,6]).bold().end).end
                  ]
                ])).widths(['30%','70%']).end
                ).alignment('center').end,

              ]
            ]).widths(['45%','15%','40%']).layout('noBorders').end

          )


          pdf.add(

            pdf.ln(2)

          )

          pdf.add(
            new Table(([
              [
                new Cell(new Txt('MATERIAL').margin([0,6]).bold().end).fillColor('#dedede').end,
                new Cell(new Txt('GRAMAJE    (g/m²)').bold().end).fillColor('#dedede').end,
                new Cell(new Txt('ANCHO DE BOBINA (cm)').bold().end).fillColor('#dedede').end,
                new Cell(new Txt('CORTE (cm)').margin([0,6]).bold().end).fillColor('#dedede').colSpan(2).end,
                new Cell(new Txt('').end).fillColor('#dedede').end,
                new Cell(new Txt('PESO (t)').margin([0,6]).bold().end).fillColor('#dedede').end,
                new Cell(new Txt('HOJAS (und)').margin([0,6]).bold().end).fillColor('#dedede').end,
                new Cell(new Txt('OBSERVACIÓN').margin([0,6]).bold().end).fillColor('#dedede').end,
              ],
              [
                new Cell(new Txt(data.sustrato).end).end,
                new Cell(new Txt(gramaje).end).end,
                new Cell(new Txt(ancho).end).end,
                new Cell(new Txt(ancho).end).end,
                new Cell(new Txt(largo).end).end,
                new Cell(new Txt(peso).end).end,
                new Cell(new Txt(hojas).color('red').end).end,
                new Cell(new Txt(observacion).end).end,
              ]
            ])).widths(['17%','11%','11%','11%','11%','11%','11%','17%']).alignment('center').end
          )

          pdf.add(

            pdf.ln(2)

          )

          pdf.add(
            new Table(([
              [
                new Cell(new Txt("").end).end,

                new Cell(new Table(([
                  [
                    new Cell(new Txt('SOLICITADO POR:').color('#ffffff').end).fillColor('#000000').alignment('center').end
                  ],
                  [
                    new Cell(new Stack(solicitado).end).alignment('center').end

                  ]
                ])).widths(['100%']).end
                ).end,
              ]

            ])).widths(['60%','40%']).layout('noBorders').alignment('center').end
          )




          pdf.create().download(`CONVERSION_${resp}`)

        }

        recibo();

      })
  }

  // getSustratos(){
  //   this.api.getSustratos()
  //     .subscribe((resp:any)=>{
  //       // // console.log(resp)
  //       if(resp.length>0){
  //         this.boolean_sustrato = true;
  //         this.Sustratos = resp;
  //       }
  //     })

  totalizar(neto,cantidad){
    let total = neto*cantidad;
    return total;
  }



  BuscarTotal(Material:any, cantidad_Mat:any, cantidad_orden:any){
    let El_Material = this.ALMACEN.find(x=> x.nombre == Material)
    const total_necesario = (cantidad_Mat / 1000) * cantidad_orden
    let Total_en_Presentacion = total_necesario / El_Material.neto

    if( Total_en_Presentacion % 1 == 0 ){

      if(Total_en_Presentacion < 1){
        Total_en_Presentacion = 1;
      }

      return {total:Total_en_Presentacion,
        presentacion: El_Material.presentacion}

    }else {
      Total_en_Presentacion = Math.round(Total_en_Presentacion)

      if(Total_en_Presentacion < 1){
        Total_en_Presentacion = 1;
      }

      return {total:Total_en_Presentacion,
              presentacion: El_Material.presentacion}
    }

  }



  RestarMaterial(material, total){
    const data = {
      material:material.material,
      total
    }


    let Descuento = this.DESCUENTOS.find(x => x.material == material.material)

    if(!Descuento){
      this.DESCUENTOS.push(data)
    }

  }

  modal_eliminacion(){
    if(this.eliminacion){
      this.eliminacion = false;
    }else{
      this.eliminacion = true;
    }
  }

  eliminar_p(nombre, cantidad, id, sustrato?){
    this.name_p_e = nombre
    this.cantidad_p_e = cantidad
    this.id_p_e = id

    if(sustrato){
      this.eliminar_sustrato = true;
    }

    this.modal_eliminacion();

  }

  confirmar_eliminacion(motivo){

    motivo = motivo.value;

    if(this.eliminar_sustrato){
      this.api.eliminarSustrato(this.id_p_e, motivo)
      .subscribe((resp:any)=>{
        this.BuscarAlmacen();
        this.porConfirmar();
        this.modal_eliminacion();

        this.BuscarAlmacen();
        this.BuscarGruposEnAlmacen();
        this.getbobinas();
        // this.getSustratos();
        this.porConfirmar();
        // // // console.log(resp)
      })
    }else{
      this.api.eliminarMaterial(this.id_p_e, motivo)
        .subscribe((resp:any)=>{
          // // // console.log(resp)
          this.BuscarAlmacen();
          this.porConfirmar();
          this.modal_eliminacion();
        })
    }

  }



  descargarInventario(desde, hasta){
    const data = {
      desde:desde.value,
      hasta:hasta.value
    }

    this.api.reporteInventario(data)
      .subscribe((resp:any)=>{


        // // // console.log('aqui es la broma:', resp)

        const pdf = new PdfMakeWrapper();
        PdfMakeWrapper.setFonts(pdfFonts);

        async function generarPDF(){

          pdf.add(
            new Table([
              [
                new Cell( new Txt(` Movimientos Realizados en el Almacen`).end).alignment('center').end,
              ],
              [
                new Cell( new Txt(` Desde: ${desde.value} Hasta: ${hasta.value}`).end).alignment('center').end,
              ]
            ]).widths(['100%']).layout('noBorders').end
          )

          pdf.add(

            pdf.ln(2)

          )

          pdf.add(
            new Table([
              [
                new Cell( new Txt('PRODUCTOS EN ALMACEN').end).fillColor('#dedede').alignment('center').end,
              ]
            ]).widths(['100%']).layout('noBorders').end
          )

          pdf.add(

            pdf.ln(2)

          )
          pdf.add(
            new Table([
              [
                new Cell( new Txt(`NOMBRE`).end).end,
                new Cell( new Txt(`PRESENTACIÓN`).end).end,
                new Cell( new Txt(`CANTIDAD`).end).end,
                new Cell( new Txt(`CÓDIGO`).end).end,
                new Cell( new Txt(`LOTE`).end).end,

              ]
            ]).widths(['20%','20%','20%', '20%', '20%']).end
          )
          for(let i = 0; i < resp.almacen.length; i++){
            pdf.add(
              new Table([
                [
                  new Cell( new Txt(`${resp.almacen[i].nombre}`).end).end,
                  new Cell( new Txt(`${resp.almacen[i].presentacion} ${resp.almacen[i].neto} ${resp.almacen[i].unidad}`).end).end,
                  new Cell( new Txt(`${resp.almacen[i].cantidad}`).end).end,
                  new Cell( new Txt(`${resp.almacen[i].codigo}`).end).end,
                  new Cell( new Txt(`${resp.almacen[i].lote}`).end).end,

                ]
              ]).widths(['20%','20%','20%', '20%', '20%']).end
            )
          }

          pdf.add(

            pdf.ln(2)

          )

          pdf.add(
            new Table([
              [
                new Cell( new Txt('PRODUCTOS INGRESADOS EN LA FECHA ESTIPULADA').end).fillColor('#dedede').alignment('center').end,
              ]
            ]).widths(['100%']).layout('noBorders').end
          )

          pdf.add(

            pdf.ln(2)

          )

          pdf.add(
            new Table([
              [
                new Cell( new Txt(`NOMBRE`).end).end,
                new Cell( new Txt(`PRESENTACIÓN`).end).end,
                new Cell( new Txt(`CANTIDAD`).end).end,
                new Cell( new Txt(`CÓDIGO`).end).end,
                new Cell( new Txt(`LOTE`).end).end,

              ]
            ]).widths(['20%','20%','20%', '20%', '20%']).end
          )
          for(let i = 0; i < resp.ingresos.length; i++){
            pdf.add(
              new Table([
                [
                  new Cell( new Txt(`${resp.ingresos[i].material.nombre}`).end).end,
                  new Cell( new Txt(`${resp.ingresos[i].material.presentacion} ${resp.ingresos[i].material.neto} ${resp.ingresos[i].material.unidad}`).end).end,
                  new Cell( new Txt(`${resp.ingresos[i].material.cantidad}`).end).end,
                  new Cell( new Txt(`${resp.ingresos[i].material.codigo}`).end).end,
                  new Cell( new Txt(`${resp.ingresos[i].material.lote}`).end).end,

                ]
              ]).widths(['20%','20%','20%', '20%', '20%']).end
            )
          }

          pdf.add(

            pdf.ln(2)

          )

          pdf.add(
            new Table([
              [
                new Cell( new Txt('SALIDAS DEL ALMACEN').end).fillColor('#dedede').alignment('center').end,
              ]
            ]).widths(['100%']).layout('noBorders').end
          )

          pdf.add(

            pdf.ln(2)

          )

          pdf.add(
            new Table([
              [
                new Cell( new Txt(`NOMBRE`).end).end,
                new Cell( new Txt(`PRESENTACIÓN`).end).end,
                new Cell( new Txt(`CANTIDAD`).end).end,
                new Cell( new Txt(`RAZON`).end).end,
                new Cell( new Txt(`FECHA`).end).end,

              ]
            ]).widths(['20%','20%','20%', '20%', '20%']).end
          )
          for(let i = 0; i < resp.descuentos.length; i++){
            pdf.add(
              new Table([
                [
                  new Cell( new Txt(`${resp.descuentos[i].material.nombre}`).end).end,
                  new Cell( new Txt(`${resp.descuentos[i].material.presentacion} ${resp.descuentos[i].material.neto} ${resp.descuentos[i].material.unidad}`).end).end,
                  new Cell( new Txt(`${resp.descuentos[i].descuento}`).end).end,
                  new Cell( new Txt(`${resp.descuentos[i].razon}`).end).end,
                  new Cell( new Txt(`${resp.descuentos[i].fecha.slice(0, 10)}`).end).end,

                ]
              ]).widths(['20%','20%','20%', '20%', '20%']).end
            )
          }






          pdf.create().download()

        }
        generarPDF();
        this.modal_reporte()
      })

  }
  filterPorGrupo(grupo:any){
    return this.TOTALES.filter(p => p.grupo === grupo)
  }

  totalizar_materiales() {

    // console.log(this.Almacenado,'1')

    // this.Almacenado = this.Almacenado.filter((item, index, self) => {
    //   const mat = item.material;
    //   return index === self.findIndex(other =>
    //     other.material.nombre === mat.nombre &&
    //     other.material.marca === mat.marca &&
    //     other.material.ancho === mat.ancho &&
    //     other.material.largo === mat.largo &&
    //     other.material.calibre === mat.calibre &&
    //     other.material.gramaje === mat.gramaje
    //   );
    // });

    // console.log(this.Almacenado,'2')

    this.TOTALES = []

    for (const item of this.Almacenado) {
      const mat = item.material;
  
      // Normalizar valores para evitar duplicados por espacios o tipos diferentes
      const nombre = String(mat.nombre || '').trim();
      const marca = String(mat.marca || '').trim();
      const ancho = Number(mat.ancho || 0);
      const largo = Number(mat.largo || 0);
      const calibre = String(mat.calibre || '').trim();
      const gramaje = String(mat.gramaje || '').trim();
  
      // Buscar si ya existe en TOTALES
      const index = this.TOTALES.findIndex(x =>
        x.material === nombre &&
        x.marca === marca &&
        x.ancho === ancho &&
        x.largo === largo &&
        x.calibre === calibre &&
        x.gramaje === gramaje
      );
  
      const cantidad = Number(item.cantidad || 0);
      const neto = Number(mat.neto || 0);
  
      if (index >= 0) {
        const def = neto && this.TOTALES[index].neto
          ? (neto * cantidad) / this.TOTALES[index].neto
          : cantidad;
        this.TOTALES[index].total += def;
      } else {
        this.TOTALES.push({
          material: nombre,
          marca: marca,
          calibre: calibre,
          gramaje: gramaje,
          grupo: mat.grupo?.nombre || '',
          presentacion: mat.presentacion || '',
          neto: neto,
          unidad: mat.unidad || '',
          ancho: ancho,
          largo: largo,
          total: cantidad
        });
      }
    }
  }

  changeView(){

    if(this.resumido){
      this.resumido = false;
      this.detallado = true;
    }else{
      this.resumido = true;
      this.detallado = false;
    }
  }

  seleccion_inventario(material, marca){

    let materiales_en_almacen = [];

    for(let i=0; i<this.ALMACEN.length; i++){
      if(this.ALMACEN[i].nombre == material && this.ALMACEN[i].marca == marca){
        materiales_en_almacen.push({
          nombre:this.ALMACEN[i].nombre,
          marca:this.ALMACEN[i].marca,

        });
      }
    }

    return materiales_en_almacen;
  }

  caja(cajas){
    this.caja_ = cajas;
  }

  finalizar_asignacion(){
        this.BuscarAlmacen()
        this.porConfirmar()
        this.getAalmacenado()
        this.getOrdenes()
  }

  // existencia(x){
  //   let lotes = this.LOTES.length;
  //   let existencia = 0;
  //   for(let i = 0; i<lotes; i++){
  //     if(this.LOTES[i].i == x){
  //       existencia = existencia + this.LOTES[i].almacenado;
  //     }
  //   }

  //   return existencia
  // }




}
