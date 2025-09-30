import { Component, OnInit } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {

  constructor(private api:RestApiService) { }

  ngOnInit(): void {
    this.BuscarGruposEnAlmacen();
    this.getMateriaPrima();
  }

  public SECCIONES = []
  public Materia_Prima = []
  public hide = true;

  BuscarGruposEnAlmacen(){
    this.api.GetGrupoMp()
      .subscribe((resp:any)=>{
        this.SECCIONES = resp
    })
  }

  MostrarInfo(grupo){

    let estado = document.getElementById(grupo).style.display

    if(estado === 'block'){
      (<HTMLInputElement>document.getElementById(grupo)).style.display = 'none';
      (<HTMLInputElement>document.getElementById(`${grupo}_down`)).style.display = 'block';
      (<HTMLInputElement>document.getElementById(`${grupo}_up`)).style.display = 'none';
    }else{
      (<HTMLInputElement>document.getElementById(grupo)).style.display = 'block';
      (<HTMLInputElement>document.getElementById(`${grupo}_down`)).style.display = 'none';
      (<HTMLInputElement>document.getElementById(`${grupo}_up`)).style.display = 'block';

    }

  }


  getMateriaPrima(){
    this.api.getMateriaPrima()
      .subscribe((resp:any)=>{
        this.Materia_Prima = resp;
        // console.log(this.Materia_Prima)
      })
  }

  editar(i){
    (<HTMLInputElement>document.getElementById(`${i}_1`)).style.display = 'block';
    (<HTMLInputElement>document.getElementById(`${i}_2`)).style.display = 'block';
    (<HTMLInputElement>document.getElementById(`${i}_3`)).style.display = 'block';
    (<HTMLInputElement>document.getElementById(`${i}_4`)).style.display = 'block';
    (<HTMLInputElement>document.getElementById(`${i}_5`)).style.display = 'block';
    (<HTMLInputElement>document.getElementById(`${i}_6`)).style.display = 'block';
    (<HTMLInputElement>document.getElementById(`${i}_7`)).style.display = 'block';
    (<HTMLInputElement>document.getElementById(`${i}_8`)).style.display = 'block';


    (<HTMLInputElement>document.getElementById(`1_${i}`)).style.display = 'none';
    (<HTMLInputElement>document.getElementById(`2_${i}`)).style.display = 'none';
    (<HTMLInputElement>document.getElementById(`3_${i}`)).style.display = 'none';
    (<HTMLInputElement>document.getElementById(`4_${i}`)).style.display = 'none';
    (<HTMLInputElement>document.getElementById(`5_${i}`)).style.display = 'none';
    (<HTMLInputElement>document.getElementById(`6_${i}`)).style.display = 'none';
  }

  Finalizar(id, i){
    (<HTMLInputElement>document.getElementById(`1_${i}`)).style.display = 'block';
    (<HTMLInputElement>document.getElementById(`2_${i}`)).style.display = 'block';
    (<HTMLInputElement>document.getElementById(`3_${i}`)).style.display = 'block';
    (<HTMLInputElement>document.getElementById(`4_${i}`)).style.display = 'block';
    (<HTMLInputElement>document.getElementById(`5_${i}`)).style.display = 'block';
    (<HTMLInputElement>document.getElementById(`6_${i}`)).style.display = 'block';


    (<HTMLInputElement>document.getElementById(`${i}_1`)).style.display = 'none';
    (<HTMLInputElement>document.getElementById(`${i}_2`)).style.display = 'none';
    (<HTMLInputElement>document.getElementById(`${i}_3`)).style.display = 'none';
    (<HTMLInputElement>document.getElementById(`${i}_4`)).style.display = 'none';
    (<HTMLInputElement>document.getElementById(`${i}_5`)).style.display = 'none';
    (<HTMLInputElement>document.getElementById(`${i}_6`)).style.display = 'none';
    (<HTMLInputElement>document.getElementById(`${i}_7`)).style.display = 'none';
    (<HTMLInputElement>document.getElementById(`${i}_8`)).style.display = 'none';

    // console.log(id)
  }

}
