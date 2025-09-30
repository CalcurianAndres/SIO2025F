import { Component, OnInit } from '@angular/core';
import { RestApiService } from '../services/rest-api.service';

@Component({
  selector: 'app-desarrollo',
  templateUrl: './desarrollo.component.html',
  styleUrls: ['./desarrollo.component.css']
})
export class DesarrolloComponent implements OnInit {

  constructor(private api:RestApiService) { }

  public productos
  ngOnInit(): void {
    this.api.getTodoslosProductos()
      .subscribe((resp:any)=>{
        this.productos = resp;
        // console.log(this.productos)
      })
  }

}
