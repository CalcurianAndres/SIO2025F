import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit {

  constructor(public api:RestApiService) { }

  @Input() categoria_!:boolean;
  @Input() categorias!:any;
  @Output() onCloseModal = new EventEmitter();

  ngOnInit(): void {
  }

  guardar(data){
    this.api.postCategoria(data)
      .subscribe((resp:any)=>{
        this.categorias = resp.categorias
      })
  }

  cerrar(){
    this.onCloseModal.emit()
  }

  AgregarNuevaCategoria(categ){
    if(categ){
      this.api.postCategoria({nombre:categ})
        .subscribe((resp:any)=>{
          // console.log(resp)
          this.cerrar();
        })
    }
  }

}
