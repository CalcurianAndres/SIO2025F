import { Component, OnInit } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nuevo-material',
  templateUrl: './nuevo-material.component.html',
  styleUrls: ['./nuevo-material.component.css']
})
export class NuevoMaterialComponent implements OnInit {

  constructor(private api:RestApiService) { }

  public Fabricantes = [];
  public Fabricantes_filtrados
  public grupos;
  public Fabricante:any = '';
  public Sustrato:boolean = false;
  public Tinta:boolean = false;
  public color = '_';
  public material;
  public origen_actual;
  public gramaje;
  public calibre;
  public Asignacion = true

  ngOnInit(): void {
    this.ObtenerFabricantes()
    this.obtenerGrupos()
  }



  seleccionarGrupo(e){
    let filtrado = []
    this.Sustrato = false;
    this.Tinta = false;
    this.Fabricante = []
    this.origen_actual = null
    for(let i=0;i<this.Fabricantes.length;i++){
      if(this.Fabricantes[i].grupo.includes(e)){
        filtrado.push(this.Fabricantes[i])
      }

      if(i == this.Fabricantes.length -1){
        if(e === 'Sustrato'){
          this.Sustrato = true
        }

        if(e === 'Tinta'){
          this.Tinta = true
        }
        this.Fabricantes_filtrados = filtrado
      }
    } 
  }

  origen(e){
    this.origen_actual = e;
  }

  obtenerGrupos(){
    this.api.GetGrupoMp()
      .subscribe((resp:any)=>{
        this.grupos = resp;
      })
  }

  ObtenerFabricantes(){
    this.api.getFabricantes()
      .subscribe((resp:any)=>{
        this.Fabricantes = resp;
      })
    }
    
    seleccionarFabricante(e){
      this.Fabricante = this.Fabricantes.find(x=> x._id === e)
      this.color = null;
  }

  color_(e){
    this.color = e
  }


  Finalizar(){

    let marca;
    if(this.origen_actual){
      marca = `${this.Fabricante.alias} (${this.origen_actual})`
    }else{
      marca = `${this.Fabricante.alias}`
    }
    let data = 
    {
      nombre:this.material,
      marca:marca,
      gramaje:this.gramaje,
      calibre:this.calibre,
      color:this.color
    } 

    this.api.PostMateriaPrima(data)
      .subscribe((resp:any)=>{
        Swal.fire({
          title:'Nueva materia prima registrada',
          icon:'success',
          toast:true,
          position:'top-end',
          showConfirmButton:false,
          timer:5000,
          timerProgressBar:true
        })
      })

      this.Asignacion = false;
  }


  

}
