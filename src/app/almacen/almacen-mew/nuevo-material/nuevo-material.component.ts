import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { color } from 'html2canvas/dist/types/css/types/color';

@Component({
  selector: 'app-nuevo-material',
  templateUrl: './nuevo-material.component.html',
  styleUrls: ['./nuevo-material.component.css']
})
export class NuevoMaterialComponent implements OnInit {


  @Input() newMaterial: any;
  @Input() grupos: any;
  @Output() onCloseModal = new EventEmitter()


  public pantone_selected = false;
  public OTRO = false;
  public data = {
    grupo: '',
    cinta: '',
    color: '',
    ancho: '',
    largo: '',
    calibre: '',
    gramaje: '',
    producto: '',
    marca: '',
    presentacion: '',
    neto: '',
    unidad: ''
  }

  constructor() { }

  ngOnInit(): void {
  }

  cerrar() {
    this.onCloseModal.emit()
  }

  define_color(color: any) {
    if (color != 'Pantone') {
      this.pantone_selected = false;
      this.data.color = color
    } else {
      this.pantone_selected = true;
    }
  }

  Cambio_opciones(grupo) {
    if (grupo != 'otros') {
      this.OTRO = false
      this.data.grupo = grupo
    } else {
      this.OTRO = true
    }
  }

  Almacenar() {
    console.log(this.data)
  }


  GrupoNombre() {
    if (this.data.grupo) {
      let grupo = this.grupos.find(g => g._id === this.data.grupo)
      return grupo.nombre
    } else return
  }




}
