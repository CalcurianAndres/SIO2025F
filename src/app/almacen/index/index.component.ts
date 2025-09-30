import { Component, OnInit } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  public usuario
  constructor(private Usuario:RestApiService) { 
    this.usuario = this.Usuario.usuario
  }

  ngOnInit(): void {
  }

}
