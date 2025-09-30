import { Component, OnInit } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(private api:RestApiService) {
      this.usuario = api.usuario
   }

  ngOnInit(): void {
    // // // console.log(this.usuario)
  }

  public usuario


  getOrdenes(){
    
  }

}
