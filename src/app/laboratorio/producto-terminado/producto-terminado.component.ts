import { Component, OnInit } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';

@Component({
  selector: 'app-producto-terminado',
  templateUrl: './producto-terminado.component.html',
  styleUrls: ['./producto-terminado.component.css']
})
export class ProductoTerminadoComponent implements OnInit {

  constructor(private api:RestApiService) { }

  ngOnInit(): void {
    this.getClientes();
  }


  public clientes;
  public productos;

  getClientes(){
    this.api.GetClientes()
      .subscribe((resp:any)=>{
        this.clientes = resp.clientes;
      })
  }


  buscar_productos(e){
    this.api.getById(e)
      .subscribe((resp:any)=>{
       this.productos = resp.productos
       // console.log(this.productos)
      })
  }

}
