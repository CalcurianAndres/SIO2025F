import { Component, OnInit } from '@angular/core';
import { RestApiService } from '../services/rest-api.service';

@Component({
  selector: 'app-producto-ymaquinaria',
  templateUrl: './producto-ymaquinaria.component.html',
  styleUrls: ['./producto-ymaquinaria.component.css']
})
export class ProductoYMaquinariaComponent implements OnInit {

  constructor(private api:RestApiService) {
    this.usuario = api.usuario
 }

  ngOnInit(): void {
  }

  public usuario

}
