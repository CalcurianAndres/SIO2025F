import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-nuevo-inventario-new',
  templateUrl: './nuevo-inventario-new.component.html',
  styleUrls: ['./nuevo-inventario-new.component.css']
})
export class NuevoInventarioNewComponent implements OnInit {

  @Input() Inventario: any;
  @Input() grupos: any;
  @Input() Materiales: any;
  @Output() onCloseModal = new EventEmitter()
  @Output() onCargarMateriales = new EventEmitter();


  public grupo_selected = '';
  public materiales_filtrados = []
  public fuera = false;

  public data = {
    pedido: '',
    precio: '',
    codigo: '',
    lote: '',
    cantidad: '',
    producto: ''
  }

  constructor() { }

  ngOnInit(): void {
  }


  cerrar() {
    this.onCloseModal.emit()
  }

  // ::::FUNCION QUE HACE QUE SI NO SE HAN BUSCADO MATERIALES LOS BUSQUE
  // ::::::::::SINO SOLO FILTRE LOS DE ESE GRUPO::::::::::::::::::::::::

  CargarMateriales = async () => {
    if (this.Materiales.length <= 0) {
      await this.onCargarMateriales.emit();
    }

    setTimeout(() => {
      console.log(this.Materiales[this.grupo_selected], '<->', this.grupo_selected)
      this.materiales_filtrados = this.Materiales[this.grupo_selected]
    }, 1000);


  }

  almacenar() {
    console.log(this.data)
  }

  GrupoNombre() {
    if (this.grupo_selected) {
      let grupo = this.grupos.find(g => g._id === this.grupo_selected)
      return grupo.nombre
    } else return
  }

}
