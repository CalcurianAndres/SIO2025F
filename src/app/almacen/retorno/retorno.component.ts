import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-retorno',
  templateUrl: './retorno.component.html',
  styleUrls: ['./retorno.component.css']
})
export class RetornoComponent implements OnInit {

  constructor(public api: RestApiService) { }

  @Input() retorno: any;
  @Input() retorno2: any;
  @Input() retorno3: any;
  @Input() Pendientes: any;
  @Input() Aprobados: any
  @Output() onCloseModal = new EventEmitter()

  public productos_almacenados_en_a_exterior = []
  public almacen = ''
  public selected = null;
  public selected_ = null;
  public materiales_para_retornar = []
  public cantidad = 0
  public observacion = ''

  ngOnInit(): void {
    this.getAlmacenExterior()
  }

  cerrar() {
    this.onCloseModal.emit()
  }

  modificarSelected(i) {
    let index = i.target.value
    this.selected = this.getProductosAgrupados(this.almacen)[index]
    console.log(this.selected_)
  }


  getAlmacenExterior() {
    this.api.VerProductosDeAlmacenExterior()
      .subscribe((resp: any) => {
        this.productos_almacenados_en_a_exterior = resp.data
      })
  }


  filtrarPorAlmacen(almacen_: any) {
    return this.productos_almacenados_en_a_exterior.filter((almacen: any) => almacen.almacen === almacen_)
  }

  filtrarPorMaterial(material) {
    return this.productos_almacenados_en_a_exterior.filter(p => p.material.nombre == material.nombre && p.material.ancho == material.ancho && p.material.largo == material.largo && p.material.marca == material.marca && p.material.gramaje == material.gramaje && p.material.calibre == material.calibre)
  }

  getProductosAgrupados(convertidora: any): any[] {
    const agrupado = new Map<string, any>();

    for (const p of this.filtrarPorAlmacen(convertidora)) {
      const clave = `${p.material.ancho}|${p.material.largo}|${p.material.nombre}|${p.material.marca}|${p.material.calibre}|${p.material.gramaje}`;

      if (!agrupado.has(clave)) {
        agrupado.set(clave, {
          nombre: p.material.nombre,
          marca: p.material.marca,
          ancho: p.material.ancho,
          largo: p.material.largo,
          calibre: p.material.calibre,
          gramaje: p.material.gramaje,
          total: 0,
        });
      }

      agrupado.get(clave)!.total += Number(p.cantidad);
    }

    return Array.from(agrupado.values());
  }


  add_material(i: any, material_) {
    const material = this.filtrarPorMaterial(material_)[i];

    const index = this.materiales_para_retornar.indexOf(material);

    if (index !== -1) {
      // Si ya existe, lo eliminamos
      this.materiales_para_retornar.splice(index, 1);
    } else {
      // Si no existe, lo agregamos
      this.materiales_para_retornar.push(material);
    }

    console.log(this.materiales_para_retornar);
  }

  devolverMaterial() {

    let data = {
      origen: this.almacen,
      material: this.selected,
      cantidad: this.cantidad,
      observacion: this.observacion,
      solicitado: `${this.api.usuario.Nombre} ${this.api.usuario.Apellido}`
    }

    this.api.nuevoRetorno(data)
      .subscribe((resp: any) => {
        this.productos_almacenados_en_a_exterior = []
        this.almacen = ''
        this.selected;
        this.materiales_para_retornar = []
        this.onCloseModal.emit()

        Swal.fire({
          text: 'Retorno de material a almacenes de Poligrafica solicitado',
          icon: 'success',
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true
        })
      })

    // this.api.RetornarMaterial({material:this.materiales_para_retornar})
    //   .subscribe((resp:any) => {
    //     this.productos_almacenados_en_a_exterior = []
    //     this.almacen = ''
    //     this.selected;
    //     this.materiales_para_retornar = []
    //     this.onCloseModal.emit()

    //     Swal.fire({
    //       text:'Retorno de material a almacenes de Poligrafica completado',
    //       icon:'success',
    //       showConfirmButton:false,
    //       timer:5000,
    //       timerProgressBar:true
    //     })
    //   })
  }

  devolverMaterial2(id) {


    this.api.RetornarMaterial({ material: this.materiales_para_retornar, retorno: id })
      .subscribe((resp: any) => {
        this.productos_almacenados_en_a_exterior = []
        this.almacen = ''
        this.selected;
        this.materiales_para_retornar = []
        this.onCloseModal.emit()

        Swal.fire({
          text: 'Retorno de material a almacenes de Poligrafica completado',
          icon: 'success',
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true
        })
      })
  }

  updateRetorno(id: string, desicion: string) {
    this.api.putRetornos(id, desicion)
      .subscribe((resp: any) => {

        if (desicion === 'Aprobado') {
          Swal.fire({
            text: 'Retorno de material a almacenes de Poligrafica Aprobado',
            icon: 'success',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true
          })
        } else {
          Swal.fire({
            text: 'Retorno de material a almacenes de Poligrafica rechazados',
            icon: 'success',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true
          })
        }

        this.productos_almacenados_en_a_exterior = []
        this.almacen = ''
        this.selected;
        this.materiales_para_retornar = []
        this.onCloseModal.emit()
      })
  }

  omitTotal(item: any) {
    const { total, ...rest } = item;
    return rest;
  }




}
