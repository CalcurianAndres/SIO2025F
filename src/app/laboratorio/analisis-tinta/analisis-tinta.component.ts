import { Component, OnInit } from '@angular/core';

import { rgb2lab, lab2rgb, deltaE } from 'rgb-lab'

import { Cell, Img, PdfMakeWrapper, Stack, Table, Txt } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';
import { SubirArchivosService } from 'src/app/services/subir-archivos.service';
import * as moment from 'moment';

@Component({
  selector: 'app-analisis-tinta',
  templateUrl: './analisis-tinta.component.html',
  styleUrls: ['./analisis-tinta.component.css']
})
export class AnalisisTintaComponent implements OnInit {


  public carton:boolean = true
  public sustrato: boolean = false;
  public muestra:boolean = false;

  public l1 = []
  public a1 = []
  public b1 = []

  public l2 = []
  public a2 = []
  public b2 = []

  public l3 = []
  public a3 = []
  public b3 = []

  public d1 = []
  public d2 = []

  public papel_e1 = `background-color:rgb(255, 255, 255);`
  public papel_m1 = `background-color:rgb(255, 255, 255);`
  public papel_e2 = `background-color:rgb(255, 255, 255);`
  public papel_m2 = `background-color:rgb(255, 255, 255);`
  public papel_e3 = `background-color:rgb(255, 255, 255);`
  public papel_m3 = `background-color:rgb(255, 255, 255);`

  public carton_e1 = `background-color:rgb(255, 255, 255);`
  public carton_m1 = `background-color:rgb(255, 255, 255);`
  public carton_e2 = `background-color:rgb(255, 255, 255);`
  public carton_m2 = `background-color:rgb(255, 255, 255);`
  public carton_e3 = `background-color:rgb(255, 255, 255);`
  public carton_m3 = `background-color:rgb(255, 255, 255);`

  public muestra1 = `background-color:rgb(255, 255, 255);`
  public muestra2 = `background-color:rgb(255, 255, 255);`
  public muestra3 = `background-color:rgb(255, 255, 255);`

  public _carton_:boolean = false;
  public _papel_:boolean = false;

  public validado:boolean = false;

  public papel_muestra_ = 'Carton';

  public DrawDown_ = [
    'Cumple','Cumple','Cumple','Cumple','Cumple','Cumple'
  ]

  public Big_e = `background-color:rgb(255, 255, 255);`
  public Big_m = `background-color:rgb(255, 255, 255);`;
  public _BIG_:boolean = false
  public _tipo_ = []
  public Observacion_;
  public muestra__:any;

  public f_fabricacion;
  public f_vencimiento;
  public estandar_utilizado;

  public ImgSubir:File;
  public img = 'no-file';
  public usuario;
  public usuario_;
  public dia;
  public Resultado = 'APROBADO';
  public tipo;
  public sobre = '#';
  public prueba = 'Cartón'
  public presentacion_;
  public cantidad__;


  constructor(private api:RestApiService,
    private subirArchivo:SubirArchivosService) {
      this.usuario = api.usuario
     }

  ngOnInit(): void {
    this.BuscarEnObservacion();
  }


  public observadores
  public Lotes_por_analizar = []
  BuscarEnObservacion(){
    this.api.getPorAnalizar()
      .subscribe((resp:any)=>{
        this.observadores = resp;
        for(let i=0;i<resp.length;i++){
          for(let x=0;x<resp[i].totales.length;x++){

            let material = resp[i].totales[x]

            if(material.grupo === 'Tinta'){
              
              // console.log(material)
              this.Lotes_por_analizar.push(
                {
                  lote:material.lote,
                  nombre:material.producto,
                  marca:material.marca,
                  grupo:i
                }
              )

              // console.log(this.Lotes_por_analizar)

            }

          }
        }
      })
  }

  public FacturaSelected
  public totales
  public Actual
  public Lote_
  public material
  _BuscarLote(e){
    this.Actual = e;
    let split = e.split('*')
    
    this.FacturaSelected = this.observadores[split[0]]
    this.Lote_ = split[1]

    let material = this.observadores[split[0]].productos.filter(x=>x.lote === split[1])
    this.totales = this.observadores[split[0]].totales.filter(x=>x.lote === split[1])
    this.totales = this.totales[0]
    this.material = material

    this.cantidad__ = this.totales.total
    // console.log(this.totales)
    // console.log(this.FacturaSelected)

    this.f_fabricacion = this.material[0].fabricacion
    this.presentacion_ = this.material[0].material.presentacion

    this.api.getAnalisisTinta(this.Lote_)
            .subscribe((resp_:any)=>{
              if(resp_.empty){
                for(let i=0;i<this.material.length;i++){
                  let presentacion = this.cantidad.findIndex(x=> x.presentacion === this.material[i].material.presentacion && x.neto === this.material[i].capacidad)
                  this.neto_total = Number(this.neto_total) + Number(this.material[i].cantidad);
                  this.neto_total = Number(this.neto_total)
                  if(presentacion <0){
                    this.cantidad.push({presentacion:this.material[i].material.presentacion, cantidad:this.material[i].capacidad,neto:this.material[i].capacidad, unidades:1})
                  }else{
                    this.cantidad[presentacion].cantidad = Number(this.cantidad[presentacion].cantidad) + Number(this.material[i].capacidad)
                    this.cantidad[presentacion].unidades++
                    this.cantidad[presentacion].cantidad = (this.cantidad[presentacion].cantidad).toFixed(2)
                  }
                  this.material[i].material.presentacion
                }
                this.muestra__ = this.material[0]
                // console.log(this.muestra__, '-', this.cantidad)
              }else{
                this.sobre =  resp_.sobre
                this.cantidad_(this.sobre);
                this.papel_muestra(resp_.prueba_)
                this.presentacion_ = resp_.presentacion
                this.cantidad__ = resp_.total
                this.muestra__ = {material:{nombre:resp_.producto, marca:resp_.marcar}, lote:resp_.lote}
                this.cantidad = resp_.presentacion
                this.f_fabricacion = resp_.f_fabricacion
                this.f_vencimiento = resp_.f_vencimiento
                this.estandar_utilizado = resp_.estandar
                this.DrawDown_ = resp_.DrawDown
                this.l1[0] = resp_.carton[0][0].lab_estandar[0]
                this.a1[0] = resp_.carton[0][0].lab_estandar[1]
                this.b1[0] = resp_.carton[0][0].lab_estandar[2]
                this.l1[3] = resp_.carton[0][0].lab_muestra[0]
                this.a1[3] = resp_.carton[0][0].lab_muestra[1]
                this.b1[3] = resp_.carton[0][0].lab_muestra[2]
                this.l1[6] = resp_.carton[0][0].lab_muestra[3]
                this.a1[6] = resp_.carton[0][0].lab_muestra[4]
                this.b1[6] = resp_.carton[0][0].lab_muestra[5]
                this.d1[0] = resp_.carton[0][0].lab_muestra[6]

                this.l1[1] = resp_.carton[1][0].lab_estandar[0]
                this.a1[1] = resp_.carton[1][0].lab_estandar[1]
                this.b1[1] = resp_.carton[1][0].lab_estandar[2]
                this.l1[4] = resp_.carton[1][0].lab_muestra[0]
                this.a1[4] = resp_.carton[1][0].lab_muestra[1]
                this.b1[4] = resp_.carton[1][0].lab_muestra[2]
                this.l1[7] = resp_.carton[1][0].lab_muestra[3]
                this.a1[7] = resp_.carton[1][0].lab_muestra[4]
                this.b1[7] = resp_.carton[1][0].lab_muestra[5]
                this.d1[1] = resp_.carton[1][0].lab_muestra[6]

                this.l1[2] = resp_.carton[2][0].lab_estandar[0]
                this.a1[2] = resp_.carton[2][0].lab_estandar[1]
                this.b1[2] = resp_.carton[2][0].lab_estandar[2]
                this.l1[5] = resp_.carton[2][0].lab_muestra[0]
                this.a1[5] = resp_.carton[2][0].lab_muestra[1]
                this.b1[5] = resp_.carton[2][0].lab_muestra[2]
                this.l1[8] = resp_.carton[2][0].lab_muestra[3]
                this.a1[8] = resp_.carton[2][0].lab_muestra[4]
                this.b1[8] = resp_.carton[2][0].lab_muestra[5]
                this.d1[2] = resp_.carton[2][0].lab_muestra[6]

                this.move()

                this.l2[0] = resp_.papel[0][0].lab_estandar[0]
                this.a2[0] = resp_.papel[0][0].lab_estandar[1]
                this.b2[0] = resp_.papel[0][0].lab_estandar[2]
                this.l2[3] = resp_.papel[0][0].lab_muestra[0]
                this.a2[3] = resp_.papel[0][0].lab_muestra[1]
                this.b2[3] = resp_.papel[0][0].lab_muestra[2]
                this.l2[6] = resp_.papel[0][0].lab_muestra[3]
                this.a2[6] = resp_.papel[0][0].lab_muestra[4]
                this.b2[6] = resp_.papel[0][0].lab_muestra[5]
                this.d1[3] = resp_.papel[0][0].lab_muestra[6]

                this.l2[1] = resp_.papel[1][0].lab_estandar[0]
                this.a2[1] = resp_.papel[1][0].lab_estandar[1]
                this.b2[1] = resp_.papel[1][0].lab_estandar[2]
                this.l2[4] = resp_.papel[1][0].lab_muestra[0]
                this.a2[4] = resp_.papel[1][0].lab_muestra[1]
                this.b2[4] = resp_.papel[1][0].lab_muestra[2]
                this.l2[7] = resp_.papel[1][0].lab_muestra[3]
                this.a2[7] = resp_.papel[1][0].lab_muestra[4]
                this.b2[7] = resp_.papel[1][0].lab_muestra[5]
                this.d1[4] = resp_.papel[1][0].lab_muestra[6]

                this.l2[2] = resp_.papel[2][0].lab_estandar[0]
                this.a2[2] = resp_.papel[2][0].lab_estandar[1]
                this.b2[2] = resp_.papel[2][0].lab_estandar[2]
                this.l2[5] = resp_.papel[2][0].lab_muestra[0]
                this.a2[5] = resp_.papel[2][0].lab_muestra[1]
                this.b2[5] = resp_.papel[2][0].lab_muestra[2]
                this.l2[8] = resp_.papel[2][0].lab_muestra[3]
                this.a2[8] = resp_.papel[2][0].lab_muestra[4]
                this.b2[8] = resp_.papel[2][0].lab_muestra[5]
                this.d1[5] = resp_.papel[2][0].lab_muestra[6]

                this.move2()

                this.l3[0] = resp_.prueba[0][0].lab[0]
                this.a3[0] = resp_.prueba[0][0].lab[1]
                this.b3[0] = resp_.prueba[0][0].lab[2]

                this.l3[1] = resp_.prueba[1][0].lab[0]
                this.a3[1] = resp_.prueba[1][0].lab[1]
                this.b3[1] = resp_.prueba[1][0].lab[2]
                
                this.l3[2] = resp_.prueba[2][0].lab[0]
                this.a3[2] = resp_.prueba[2][0].lab[1]
                this.b3[2] = resp_.prueba[2][0].lab[2]

                this.usuario_ = resp_.guardado
                this.dia = resp_.dia
                this.move3()
                
                if(resp_.img){
                  this.img = resp_.img
                  document.getElementsByClassName('file-name')[0].innerHTML = 'Se cargó archivo DrawDown';
                }
                this.Observacion_ = resp_.observaciones

                this._tipo_ = resp_.tipo
              }
            })
  }


  move(){
    // GRUPO 1
    if(this.l1[0], this.a1[0], this.b1[0])
    {
      this.l1[0] = Number(this.l1[0])
      this.a1[0] = Number(this.a1[0])
      this.b1[0] = Number(this.b1[0])
  
      let rgb_converted = lab2rgb([this.l1[0],this.a1[0],this.b1[0]])
      
      this.papel_e1 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }
    if(this.l1[3], this.a1[3], this.b1[3])
    {
      this.l1[3] = Number(this.l1[3])
      this.a1[3] = Number(this.a1[3])
      this.b1[3] = Number(this.b1[3])
  
      let rgb_converted = lab2rgb([this.l1[3],this.a1[3],this.b1[3]])
      
      this.papel_m1 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }

    // GRUPO 2
    if(this.l1[1], this.a1[1], this.b1[1])
    {
      this.l1[1] = Number(this.l1[1])
      this.a1[1] = Number(this.a1[1])
      this.b1[1] = Number(this.b1[1])
  
      let rgb_converted = lab2rgb([this.l1[1],this.a1[1],this.b1[1]])
      
      this.papel_e2 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }
    if(this.l1[4], this.a1[4], this.b1[4])
    {
      this.l1[4] = Number(this.l1[4])
      this.a1[4] = Number(this.a1[4])
      this.b1[4] = Number(this.b1[4])
  
      let rgb_converted = lab2rgb([this.l1[4],this.a1[4],this.b1[4]])
      
      this.papel_m2 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }

    // GRUPO 3
    if(this.l1[2], this.a1[2], this.b1[2])
    {
      this.l1[2] = Number(this.l1[2])
      this.a1[2] = Number(this.a1[2])
      this.b1[2] = Number(this.b1[2])
  
      let rgb_converted = lab2rgb([this.l1[2],this.a1[2],this.b1[2]])
      
      this.papel_e3 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }
    if(this.l1[5], this.a1[5], this.b1[5])
    {
      this.l1[5] = Number(this.l1[5])
      this.a1[5] = Number(this.a1[5])
      this.b1[5] = Number(this.b1[5])
  
      let rgb_converted = lab2rgb([this.l1[5],this.a1[5],this.b1[5]])
      
      this.papel_m3 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }
  }

  move2(){
    // GRUPO 1
    if(this.l2[0], this.a2[0], this.b2[0])
    {
      this.l2[0] = Number(this.l2[0])
      this.a2[0] = Number(this.a2[0])
      this.b2[0] = Number(this.b2[0])
  
      let rgb_converted = lab2rgb([this.l2[0],this.a2[0],this.b2[0]])
      
      this.carton_e1 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }
    if(this.l2[3], this.a2[3], this.b2[3])
    {
      this.l2[3] = Number(this.l2[3])
      this.a2[3] = Number(this.a2[3])
      this.b2[3] = Number(this.b2[3])
  
      let rgb_converted = lab2rgb([this.l2[3],this.a2[3],this.b2[3]])
      
      this.carton_m1 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }

    // GRUPO 2
    if(this.l2[1], this.a2[1], this.b2[1])
    {
      this.l2[1] = Number(this.l2[1])
      this.a2[1] = Number(this.a2[1])
      this.b2[1] = Number(this.b2[1])
  
      let rgb_converted = lab2rgb([this.l2[1],this.a2[1],this.b2[1]])
      
      this.carton_e2 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }
    if(this.l2[4], this.a2[4], this.b2[4])
    {
      this.l2[4] = Number(this.l2[4])
      this.a2[4] = Number(this.a2[4])
      this.b2[4] = Number(this.b2[4])
  
      let rgb_converted = lab2rgb([this.l2[4],this.a2[4],this.b2[4]])
      
      this.carton_m2 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }

    // GRUPO 3
    if(this.l2[2], this.a2[2], this.b2[2])
    {
      this.l2[2] = Number(this.l2[2])
      this.a2[2] = Number(this.a2[2])
      this.b2[2] = Number(this.b2[2])
  
      let rgb_converted = lab2rgb([this.l2[2],this.a2[2],this.b2[2]])
      
      this.carton_e3 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }
    if(this.l2[5], this.a2[5], this.b2[5])
    {
      this.l2[5] = Number(this.l2[5])
      this.a2[5] = Number(this.a2[5])
      this.b2[5] = Number(this.b2[5])
  
      let rgb_converted = lab2rgb([this.l2[5],this.a2[5],this.b2[5]])
      
      this.carton_m3 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }
  }

  move3(){
    if(this.l3[0], this.a3[0], this.b3[0])
    {
      this.l3[0] = Number(this.l3[0])
      this.a3[0] = Number(this.a3[0])
      this.b3[0] = Number(this.b3[0])
  
      let rgb_converted = lab2rgb([this.l3[0],this.a3[0],this.b3[0]])
      
      this.muestra1 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }
    if(this.l3[1], this.a3[1], this.b3[1])
    {
      this.l3[1] = Number(this.l3[1])
      this.a3[1] = Number(this.a3[1])
      this.b3[1] = Number(this.b3[1])
  
      let rgb_converted = lab2rgb([this.l3[1],this.a3[1],this.b3[1]])
      
      this.muestra2 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }
    if(this.l3[2], this.a3[2], this.b3[2])
    {
      this.l3[2] = Number(this.l3[2])
      this.a3[2] = Number(this.a3[2])
      this.b3[2] = Number(this.b3[2])
  
      let rgb_converted = lab2rgb([this.l3[2],this.a3[2],this.b3[2]])
      
      this.muestra3 = `background-color:rgb(${rgb_converted[0]},${rgb_converted[1]},${rgb_converted[2]});`
    }
  }

  carton_(){
      this.carton = true
      this.sustrato = false
      this.muestra = false
  }

  sustrato_(){
    this.carton = false
    this.sustrato = true
    this.muestra = false
  }

  muestra_(){
    this.carton = false
    this.sustrato = false
    this.muestra = true
  }

  cantidad_(e){
    this.tipo = e;
    switch(e){
      case 'Carton':
        this._carton_ = true;
        this._papel_ = false
        this.carton = true;
        this.sustrato = false;
        this.muestra = false
      break;
      case 'Papel':
        this._carton_ = false;
        this._papel_ = true
        this.carton = false;
        this.sustrato = true;
        this.muestra = false
      break
      case 'Ambos':
        this._carton_ = true;
        this._papel_ = true
        this.carton = true;
        this.sustrato = false;
        this.muestra = false
      break
      default:
        this._carton_ = false;
        this._papel_ = false
        this.muestra = false
      break
    }
  }

  validar(){
    if(!this.validado){
      this.validado = true;
    }else{
      this.validado = false;
    }
  }

  verImagen(){
    Swal.fire({
      imageUrl: `http://192.168.0.23:8080/api/imagen/analisis/${this.img}`,
      imageAlt: 'Draw down',
      showConfirmButton:false
    })
  }


  puntoYcoma(n){
    n = new Intl.NumberFormat('de-DE').format(n)
    if(n === 'NaN'){
      return 'N/A'
    }else{
      return n 
    }
   }

  GenerarPDF(){


    for(let i= 0;i<this.d1.length;i++){
      if(!this.d1[i]){
        if(this.d1[i] === 0){
          this.d1[i] = '0.00'
        }else{
          this.d1[i] = 'N/A'
        }
      }else{
        this.d1[i] = this.puntoYcoma(this.d1[i])
      }
    }

    for(let i= 0;i<this.l1.length;i++){
      if(!this.l1[i]){
        if(this.l1[i] === 0){
          this.l1[i] = '0.00'
        }else{
          this.l1[i] = 'N/A'
        }
      }else{
        this.l1[i] = this.puntoYcoma(this.l1[i])
      }
    }
    for(let i= 0;i<this.a1.length;i++){
      if(!this.a1[i]){
        if(this.a1[i] === 0){
          this.a1[i] = '0.00'
        }else{
          this.a1[i] = 'N/A'
        }
      }else{
        this.a1[i] = this.puntoYcoma(this.a1[i])
      }
    }
    for(let i= 0;i<this.b1.length;i++){
      if(!this.b1[i]){
        if(this.b1[i] === 0){
          this.b1[i] = '0.00'
        }else{
          this.b1[i] = 'N/A'
        }
      }else{
        this.b1[i] = this.puntoYcoma(this.b1[i])
      }
    }

    for(let i= 0;i<this.l2.length;i++){
      if(!this.l2[i]){
        if(this.l2[i] === 0){
          this.l2[i] = '0.00'
        }else{
          this.l2[i] = 'N/A'
        }
      }else{
        this.l2[i] = this.puntoYcoma(this.l2[i])
      }
    }
    for(let i= 0;i<this.a2.length;i++){
      if(!this.a2[i]){
        if(this.a2[i] === 0){
          this.a2[i] = '0.00'
        }else{
          this.a2[i] = 'N/A'
        }
      }else{
        this.a2[i] = this.puntoYcoma(this.a2[i])
      }
    }
    for(let i= 0;i<this.b2.length;i++){
      if(!this.b2[i]){
        if(this.b2[i] === 0){
          this.b2[i] = '0.00'
        }else{
          this.b2[i] = 'N/A'
        }
      }else{
        this.b2[i] = this.puntoYcoma(this.b2[i])
      }
    }

    for(let i= 0;i<this.l3.length;i++){
      if(!this.l3[i]){
        if(this.l3[i] === 0){
          this.l3[i] = '0.00'
        }else{
          this.l3[i] = 'N/A'
        }
      }else{
        this.l3[i] = this.puntoYcoma(this.l3[i])
      }
    }
    for(let i= 0;i<this.a3.length;i++){
      if(!this.a3[i]){
        if(this.a3[i] === 0){
          this.a3[i] = '0.00'
        }else{
          this.a3[i] = 'N/A'
        }
      }else{
        this.a3[i] = this.puntoYcoma(this.a3[i])
      }
    }
    for(let i= 0;i<this.b3.length;i++){
      if(!this.b3[i]){
        if(this.b3[i] === 0){
          this.b3[i] = '0.00'
        }else{
          this.b3[i] = 'N/A'
        }
      }else{
        this.b3[i] = this.puntoYcoma(this.b3[i])
      }
    }

    let img = this.img
    let hoy = moment().format('DD/MM/YYYY')
    let dia = this.dia;
    let guardado = this.usuario_
    let validado = `${this.usuario.Nombre} ${this.usuario.Apellido}`
    let Resultado = this.Resultado;
    this.f_fabricacion = moment(this.f_fabricacion).format('DD/MM/YYYY')
    this.f_vencimiento = moment(this.f_vencimiento).format('DD/MM/YYYY')
    let analisis = {
      producto:this.muestra__.material.nombre,
      marcar:this.muestra__.material.marca,
      presentacion:this.presentacion_,
      total:this.cantidad__,
      f_fabricacion:this.f_fabricacion,
      f_vencimiento:this.f_vencimiento,
      estandar:this.estandar_utilizado,
      DrawDown:this.DrawDown_,
      tipo:this._tipo_,
      lote:this.muestra__.lote,
      carton:[
        // 1
        [
          {
          lab_estandar:[this.l1[0],this.a1[0],this.b1[0]],
          lab_muestra:[this.l1[3],this.a1[3],this.b1[3],this.l1[6],this.a1[6],this.b1[6],this.d1[0]]
          }
        ],
        // 2
        [
          {
          lab_estandar:[this.l1[1],this.a1[1],this.b1[1]],
          lab_muestra:[this.l1[4],this.a1[4],this.b1[4],this.l1[7],this.a1[7],this.b1[7],this.d1[1]]
          }
        ],
        // 3
        [
          {lab_estandar:[this.l1[2],this.a1[2],this.b1[2]],
          lab_muestra:[this.l1[5],this.a1[5],this.b1[5],this.l1[8],this.a1[8],this.b1[8],this.d1[2]]},
        ]
      ],
      papel:[
        // 1
        [
          {lab_estandar:[this.l2[0],this.a2[0],this.b2[0]],
          lab_muestra:[this.l2[3],this.a2[3],this.b2[3],this.l2[6],this.a2[6],this.b2[6],this.d1[3]]},
        ],
        // 2
        [
          {lab_estandar:[this.l2[1],this.a2[1],this.b2[1]],
          lab_muestra:[this.l2[4],this.a2[4],this.b2[4],this.l2[7],this.a2[7],this.b2[7],this.d1[4]]},
        ],
        // 3
        [
          {lab_estandar:[this.l2[2],this.a2[2],this.b2[2]],
          lab_muestra:[this.l2[5],this.a2[5],this.b2[5],this.l2[8],this.a2[8],this.b2[8],this.d1[5]]},
        ]
      ],
      prueba:[
        [{lab:[this.l3[0],this.a3[0],this.b3[0]]}],
        [{lab:[this.l3[1],this.a3[1],this.b3[1]]}],
        [{lab:[this.l3[2],this.a3[2],this.b3[2]]}]
      ],
      observaciones:this.Observacion_
    }
    let marca 
    if(analisis.marcar === 'Olin' || analisis.marcar === 'olin'){
      marca = 'Fábrica de Tinta Olin, C.A'
    }else{
      marca = analisis.marcar
    }
    let sustrato_muestra_ = this.papel_muestra_
    async function GenerarCertificado(){
      const pdf = new PdfMakeWrapper();
      PdfMakeWrapper.setFonts(pdfFonts);
      pdf.pageOrientation('portrait');
      pdf.pageSize('A4');

      pdf.add(
        new Table([
          [
            new Cell(await new Img('../../assets/poli_cintillo.png').width(50).margin([0, 5]).build()).alignment('center').rowSpan(4).end,
            new Cell(new Txt(`
            FORMATO DE REPORTE DE ANÁLISIS DE TINTAS
            `).bold().end).alignment('center').fontSize(9).rowSpan(4).end,
            new Cell(new Txt('Código: FLC-005').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('N° de Revisión: 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Fecha de Revisión: 03/08/2023').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
          [
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('Página: 1 de 1').end).fillColor('#dedede').fontSize(5).alignment('center').end,
          ],
        ]).widths(['25%','50%','25%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )



      pdf.add(
        new Table([
          [
            new Cell(new Txt('Información de la tinta').bold().end).bold().color('#FFFFFF').alignment('center').fillColor('#000000').colSpan(4).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('').bold().end).border([false,false]).colSpan(4).bold().alignment('center').fontSize(0).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
            new Cell(new Txt('').end).end,
          ],
          [
            new Cell(new Txt('Producto').bold().end).fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt(analisis.producto).bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('Proveedor').bold().end).fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt(marca).alignment('center').bold().end).fontSize(7).end,
          ],
          [
            new Cell(new Txt('N° de Lote').bold().end).fillColor('#dedede').fontSize(7).end,
            new Cell(new Txt(analisis.lote).bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('Presentación').bold().end).fillColor('#dedede').fontSize(7).end,
            new Cell(new Txt(analisis.presentacion).bold().end).alignment('center').fontSize(7).end,
          ],
          [
            new Cell(new Txt('Fecha de fabricación').bold().end).fillColor('#dedede').fontSize(7).end,
            new Cell(new Txt(analisis.f_fabricacion).bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('Fecha de vencimiento').bold().end).fillColor('#dedede').fontSize(7).end,
            new Cell(new Txt(analisis.f_vencimiento).bold().end).alignment('center').fontSize(7).end,
          ],
          [
            new Cell(new Txt('Cantidad (Kg)').bold().end).fillColor('#dedede').fontSize(7).end,
            new Cell(new Txt(analisis.total).bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('Estándar Utilizado').bold().end).fillColor('#dedede').fontSize(7).end,
            new Cell(new Txt(analisis.estandar).bold().end).alignment('center').fontSize(7).end,
          ]
        ]).widths(['15%','35%','15%','35%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt(' ').end).border([false]).fontSize(1).end
          ]
        ]).widths(['100%']).end
      )

      pdf.add(
        new Table([
          [
            new Cell(new Txt('Propiedades y características evaluadas').bold().end).colSpan(13).bold().color('#FFFFFF').alignment('center').fillColor('#000000').end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
          ],
          [
            new Cell(new Txt('').bold().end).border([false,false]).colSpan(13).bold().fontSize(0).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
          ],
          [
            new Cell(new Txt('Análisis cualitativo (Draw down)').bold().end).border([false,false]).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').colSpan(12).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).border([false,false]).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('').bold().end).border([false,false]).colSpan(12).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).border([false,false]).end,
          ],
          [
            new Cell(new Txt('Tono').bold().end).alignment('center').fontSize(8).fillColor('#dedede').colSpan(5).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt(analisis.DrawDown[0]).bold().end).colSpan(7).fontSize(8).alignment('center').end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(await new Img(`http://192.168.0.23:8080/api/imagen/analisis/${img}`).width(150).margin([8, 0]).build()).rowSpan(34).border([false, false]).fontSize(8).end,
          ],
          [
            new Cell(new Txt('Transparencia / Opacidad').alignment('center').bold().end).fontSize(8).fillColor('#dedede').colSpan(5).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt(analisis.DrawDown[1]).bold().end).colSpan(7).fontSize(8).alignment('center').end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
          ],
          [
            new Cell(new Txt('Viscosidad').bold().end).alignment('center').fontSize(8).fillColor('#dedede').colSpan(5).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt(analisis.DrawDown[2]).bold().end).colSpan(7).fontSize(8).alignment('center').end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
          ],
          [
            new Cell(new Txt('Secado capa fina (1-3 horas)').alignment('center').bold().end).fontSize(8).fillColor('#dedede').colSpan(5).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt(analisis.DrawDown[3]).bold().end).colSpan(7).fontSize(8).alignment('center').end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
          ],
          [
            new Cell(new Txt('Secado capa gruesa (24 horas)').alignment('center').bold().end).fontSize(8).fillColor('#dedede').colSpan(5).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt(analisis.DrawDown[4]).bold().end).colSpan(7).fontSize(8).alignment('center').end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
          ],
          [
            new Cell(new Txt('Brillo').bold().end).alignment('center').fontSize(8).fillColor('#dedede').colSpan(5).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt(analisis.DrawDown[5]).bold().end).colSpan(7).fontSize(8).alignment('center').end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).border([false, false]).fontSize(8).fillColor('#dedede').end,
          ],
          [
            new Cell(new Txt('').bold().end).border([false,false]).fontSize(0).colSpan(12).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Análisis cuantitativo (Roll down)').bold().end).border([false,false]).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').colSpan(12).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('').bold().end).border([false,false]).fontSize(0).colSpan(12).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Tipo de sustrato').bold().end).alignment('center').fontSize(7).fillColor('#dedede').colSpan(3).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Descarga').bold().end).margin([0,6,0,0]).alignment('center').rowSpan(2).fontSize(5).fillColor('#dedede').end,
            new Cell(new Txt('Tinta evaluada').bold().end).margin([0,5,0,0]).alignment('center').rowSpan(2).fontSize(5).fillColor('#dedede').end,
            new Cell(new Txt('Coordenadas de color (ISO 12647-2:2013)').alignment('center').bold().end).fontSize(7).fillColor('#dedede').colSpan(7).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('').bold().end).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Descripción').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('Gramaje \n (g/m²)').bold().end).fontSize(4).alignment('center').fillColor('#dedede').end,
            new Cell(new Txt('Calibre (pt)').bold().end).fontSize(4).alignment('center').fillColor('#dedede').end,
            new Cell(new Txt('Descarga').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('Tinta evaluada').bold().end).fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('L*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('a*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('b*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('∆L*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('∆a*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('∆b*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('∆E*').bold().end).alignment('center').fontSize(7).fillColor('#dedede').end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).margin([0,30,0,0]).rowSpan(6).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).margin([0,30,0,0]).rowSpan(6).fontSize(7).alignment('center').end,
            new Cell(new Txt(analisis.tipo[0]).bold().end).margin([0,30,0,0]).rowSpan(6).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end).fillColor('#cccccc').margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(7).end,
            new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.carton[0][0].lab_estandar[0]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[0][0].lab_estandar[1]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[0][0].lab_estandar[2]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[0][0].lab_muestra[3]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[0][0].lab_muestra[4]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[0][0].lab_muestra[5]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[0][0].lab_muestra[6]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.carton[0][0].lab_muestra[0]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[0][0].lab_muestra[1]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[0][0].lab_muestra[2]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).rowSpan(2).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('2°').bold().end).fillColor('#dddddd').margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(7).end,
            new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.carton[1][0].lab_estandar[0]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[1][0].lab_estandar[1]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[1][0].lab_estandar[2]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[1][0].lab_muestra[3]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[1][0].lab_muestra[4]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[1][0].lab_muestra[5]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[1][0].lab_muestra[6]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.carton[1][0].lab_muestra[0]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[1][0].lab_muestra[1]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[1][0].lab_muestra[2]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).rowSpan(2).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('3°').bold().end).fillColor('#eeeeee').margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(7).end,
            new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.carton[2][0].lab_estandar[0]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[2][0].lab_estandar[1]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[2][0].lab_estandar[2]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[2][0].lab_muestra[3]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[2][0].lab_muestra[4]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[2][0].lab_muestra[5]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[2][0].lab_muestra[6]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end).fillColor('#cccccc').margin([0,5,0,0]).alignment('center').fontSize(5).end,
            new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.carton[2][0].lab_muestra[0]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[2][0].lab_muestra[1]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.carton[2][0].lab_muestra[2]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Papel').bold().end).margin([0,30,0,0]).rowSpan(6).alignment('center').fontSize(7).end,
            new Cell(new Txt(analisis.tipo[1]).bold().end).margin([0,30,0,0]).rowSpan(6).fontSize(7).alignment('center').end,
            new Cell(new Txt('N/A').bold().end).margin([0,30,0,0]).rowSpan(6).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end).fillColor('#cccccc').margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(7).end,
            new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.papel[0][0].lab_estandar[0]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[0][0].lab_estandar[1]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[0][0].lab_estandar[2]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[0][0].lab_muestra[3]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[0][0].lab_muestra[4]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[0][0].lab_muestra[5]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[0][0].lab_muestra[6]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.papel[0][0].lab_muestra[0]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[0][0].lab_muestra[1]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[0][0].lab_muestra[2]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).rowSpan(2).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('2°').bold().end).fillColor('#dddddd').margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(7).end,
            new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.papel[1][0].lab_estandar[0]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[1][0].lab_estandar[1]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[1][0].lab_estandar[2]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[1][0].lab_muestra[3]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[1][0].lab_muestra[4]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[1][0].lab_muestra[5]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[1][0].lab_muestra[6]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.papel[1][0].lab_muestra[0]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[1][0].lab_muestra[1]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[1][0].lab_muestra[2]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).rowSpan(2).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).rowSpan(2).fontSize(7).alignment('center').end,
            new Cell(new Txt('3°').bold().end).fillColor('#eeeeee').margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(7).end,
            new Cell(new Txt('Estándar').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.papel[2][0].lab_estandar[0]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[2][0].lab_estandar[1]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[2][0].lab_estandar[2]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[2][0].lab_muestra[3]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[2][0].lab_muestra[4]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[2][0].lab_muestra[5]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[2][0].lab_muestra[6]).bold().end).margin([0,5,0,0]).rowSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Cartón').bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('N/A').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('16').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('1°').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Muestra').bold().end).fontSize(5).end,
            new Cell(new Txt(analisis.papel[2][0].lab_muestra[0]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[2][0].lab_muestra[1]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt(analisis.papel[2][0].lab_muestra[2]).bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt(' ').bold().end).border([false,false]).colSpan(12).alignment('center').fontSize(0).end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(0).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Prueba o ensayos adicionales').bold().end).border([false,false]).colSpan(12).alignment('center').alignment('center').color('#FFFFFF').fontSize(10).fillColor('#9e9e9e').colSpan(12).end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(0).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt(' ').bold().end).border([false,false]).colSpan(12).alignment('center').fontSize(0).end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(0).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Descarga').bold().end).fillColor('#dedede').alignment('center').fontSize(7).end,
            new Cell(new Txt('L*').bold().end).fillColor('#dedede').fontSize(7).alignment('center').end,
            new Cell(new Txt('a*').bold().end).fillColor('#dedede').fontSize(7).alignment('center').end,
            new Cell(new Txt('b*').bold().end).fillColor('#dedede').alignment('center').fontSize(7).end,
            new Cell(new Txt('Sustrato:').bold().end).alignment('center').fillColor('#dedede').colSpan(2).fontSize(7).end,
            new Cell(new Txt('').bold().end).alignment('center').colSpan(3).fontSize(7).end,
            new Cell(new Txt(sustrato_muestra_).bold().end).colSpan(2).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).colSpan(4).border([false,false]).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(0).fillColor('#9e9e9e').end,
          ],
          
          [
            new Cell(new Txt('1°').bold().end).fillColor('#cccccc').alignment('center').fontSize(7).end,
            new Cell(new Txt(analisis.prueba[0][0].lab[0]).bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt(analisis.prueba[0][0].lab[1]).bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt(analisis.prueba[0][0].lab[2]).bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('').bold().end).border([false,false]).colSpan(8).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(0).fillColor('#9e9e9e').end,
          ],
          
          [
            new Cell(new Txt('2°').bold().end).fillColor('#dddddd').alignment('center').fontSize(7).end,
            new Cell(new Txt(analisis.prueba[1][0].lab[0]).bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt(analisis.prueba[1][0].lab[1]).bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt(analisis.prueba[1][0].lab[2]).bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('').bold().end).border([false,false]).colSpan(8).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(0).fillColor('#9e9e9e').end,
          ],
          
          [
            new Cell(new Txt('3°').bold().end).fillColor('#eeeeee').alignment('center').fontSize(7).end,
            new Cell(new Txt(analisis.prueba[2][0].lab[0]).bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt(analisis.prueba[2][0].lab[1]).bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt(analisis.prueba[2][0].lab[2]).bold().end).alignment('center').fontSize(7).end,
            new Cell(new Txt('').bold().end).border([false,false]).colSpan(8).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(0).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt(' ').bold().end).border([false,false]).colSpan(12).alignment('center').fontSize(0).end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(0).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt('Observaciones').bold().end).colSpan(12).alignment('center').alignment('center').color('#FFFFFF').fillColor('#000000').colSpan(12).end,
            new Cell(new Txt(analisis.observaciones).bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(0).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt(analisis.observaciones).bold().end).border([false,false]).colSpan(12).alignment('center').fontSize(0).end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(0).fillColor('#9e9e9e').end,
          ],
          [
            new Cell(new Txt(analisis.observaciones).bold().end).height(150).colSpan(12).fontSize(7).colSpan(12).end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).fontSize(7).alignment('center').end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('').bold().end).alignment('center').fontSize(5).end,
            new Cell(new Txt('Draw down').bold().end).alignment('center').color('#FFFFFF').fontSize(0).fillColor('#9e9e9e').end,
          ],
        ]).widths(['10%','5%','5%','6%','6%','4%','4%','4%','4%','4%','4%','4%','40%']).end
      )
      pdf.add(
        new Table([
          [
            new Cell(new Txt('').bold().end).border([false,false]).alignment('center').fontSize(0).end,
            new Cell(new Txt('').bold().end).border([false,false]).alignment('center').fontSize(0).end,
            new Cell(new Txt('').bold().end).border([false,false]).alignment('center').fontSize(0).end,
          ],
          [
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Resultado de análisis:').bold().end).colSpan(2).fillColor('#000000').color('#FFFFFF').alignment('center').end,
                  new Cell(new Txt('').bold().end).alignment('center').fontSize(0).end,
                ],
                [
                  new Cell(new Txt(Resultado).bold().end).margin([0,9.5]).colSpan(2).alignment('center').end,
                  new Cell(new Txt('').bold().end).alignment('center').fontSize(0).end,
                ],

              ]).widths(['35%','65%']).end
            ).border([false,false]).alignment('center').end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Realizado por:').bold().end).colSpan(2).fillColor('#000000').color('#FFFFFF').alignment('center').end,
                  new Cell(new Txt('').bold().end).alignment('center').fontSize(0).end,
                ],
                [
                  new Cell(new Txt('Firma:').bold().end).border([true,false,false,false]).fillColor('#eaeaea').alignment('center').end,
                  new Cell(new Txt(guardado).bold().end).border([false,false,true,false]).alignment('center').fontSize(7).end,
                ],
                [
                  new Cell(new Txt('Fecha:').bold().end).border([true,false,false,true]).fillColor('#eaeaea').alignment('center').end,
                  new Cell(new Txt(dia).bold().end).border([false,false,true,true]).alignment('center').fontSize(7).end,
                ]
              ]).widths(['35%','65%']).end
            ).border([false,false]).alignment('center').end,
            new Cell(
              new Table([
                [
                  new Cell(new Txt('Validado por:').bold().end).colSpan(2).fillColor('#000000').color('#FFFFFF').alignment('center').end,
                  new Cell(new Txt('').bold().end).alignment('center').fontSize(0).end,
                ],
                [
                  new Cell(new Txt('Firma:').bold().end).border([true,false,false,false]).fillColor('#eaeaea').alignment('center').end,
                  new Cell(new Txt(validado).bold().end).border([false,false,true,false]).alignment('center').fontSize(7).end,
                ],
                [
                  new Cell(new Txt('Fecha:').bold().end).border([true,false,false,true]).fillColor('#eaeaea').alignment('center').end,
                  new Cell(new Txt(hoy).bold().end).border([false,false,true,true]).alignment('center').fontSize(7).end,
                ]
              ]).widths(['35%','65%']).end
            ).border([false,false]).alignment('center').end,
          ]
        ]).widths(['33%','33%','33%']).end
      )

      pdf.create().download(`${analisis.producto} ${analisis.marcar} Lote:${analisis.lote}`)
    }

    GenerarCertificado()
    this._BuscarLote(this.Actual)
    this.QuitarDeObservacion(Resultado)
    Resultado

  }

  PreFinalizacion(){
    Swal.fire({
      icon:'info',
      title:'Notificación de resultados',
      text:'Se realizará la notificación de los resultados obtenidos de este análisis',
      showDenyButton: true,
      showCancelButton:true,
      confirmButtonText:'Confirmar',
      denyButtonText:'Añadir a producción',
      cancelButtonText:'Cancelar',
      denyButtonColor:'#3e8ed0',
      confirmButtonColor:'#48c78e',
      cancelButtonColor:'#f14668',
      allowOutsideClick: false
    }).then((result)=>{
      if (result.isConfirmed) {
        this.GenerarPDF()
        let data = {
          resultado:this.Resultado,
          correos:'calcurianandres@gmail.com',
          observacion:this.Observacion_,
          lote:this.Lote_,
          tabla:`
          <tr>
            <td>${this.material[0].material.nombre} (${this.material[0].material.marca})</td>
            <td>${this.Lote_}</td>
            <td>${this.totales.total}</td>
            <td>${this.Resultado}</td>
          </tr>
          `
        }

        this.api.enviarNotificacion(data)
          .subscribe((resp:any)=>{
            // console.log('correo enviado')
          })

      } else if (result.isDenied) {
        this.GenerarPDF()
        let data = {
          resultado:this.Resultado,
          correos:'calcurianandres@gmail.com,zuleima.vela@poligraficaindustrial.com',
          observacion:this.Observacion_,
          lote:this.Lote_,
          tabla:`
          <tr>
            <td>${this.material[0].material.nombre} (${this.material[0].material.marca})</td>
            <td>${this.Lote_}</td>
            <td>${this.totales.total}</td>
            <td>${this.Resultado}</td>
          </tr>
          `
        }

        this.api.enviarNotificacion(data)
          .subscribe((resp:any)=>{
            // console.log('correo enviado')
          })
      }
    })
  }

  QuitarDeObservacion(Resultado){

    for(let i=0;i<this.FacturaSelected.totales.length;i++){
      if(this.FacturaSelected.totales[i].lote === this.Lote_){
        this.FacturaSelected.totales[i].resultado = Resultado
        
      }
      
      if(i === this.FacturaSelected.totales.length -1){
        
        this.api.putFacturacion(this.FacturaSelected._id, this.FacturaSelected)
          .subscribe((resp:any)=>{
           this.api.FinalizarFacturacion(this.FacturaSelected._id)
            .subscribe((resp:any)=>{
              // console.log(resp)
            })
          })
      }
    }
  }

  papel_muestra(e){
    this.papel_muestra_ = e;
    this.prueba = e
  }

  cualitativo(n,e){
    this.DrawDown_[n] = e
    // console.log(this.DrawDown_)
    // console.log(this._tipo_)
  }

  Guardar_(){


    // console.log(this.usuario)
    let hoy = moment().format('DD/MM/YYYY')
    let analisis = {
      producto:this.muestra__.material.nombre,
      marcar:this.muestra__.material.marca,
      presentacion:this.presentacion_,
      f_fabricacion:this.f_fabricacion,
      f_vencimiento:this.f_vencimiento,
      estandar:this.estandar_utilizado,
      DrawDown:this.DrawDown_,
      tipo:this._tipo_,
      lote:this.muestra__.lote,
      guardado:`${this.usuario.Nombre} ${this.usuario.Apellido}`,
      dia:hoy,
      sobre:this.tipo,
      prueba_:this.prueba,
      total:this.cantidad__,
      carton:[
        // 1
        [
          {
          lab_estandar:[this.l1[0],this.a1[0],this.b1[0]],
          lab_muestra:[this.l1[3],this.a1[3],this.b1[3],this.l1[6],this.a1[6],this.b1[6],this.d1[0]]
          }
        ],
        // 2
        [
          {
          lab_estandar:[this.l1[1],this.a1[1],this.b1[1]],
          lab_muestra:[this.l1[4],this.a1[4],this.b1[4],this.l1[7],this.a1[7],this.b1[7],this.d1[1]]
          }
        ],
        // 3
        [
          {lab_estandar:[this.l1[2],this.a1[2],this.b1[2]],
          lab_muestra:[this.l1[5],this.a1[5],this.b1[5],this.l1[8],this.a1[8],this.b1[8],this.d1[2]]},
        ]
      ],
      papel:[
        // 1
        [
          {lab_estandar:[this.l2[0],this.a2[0],this.b2[0]],
          lab_muestra:[this.l2[3],this.a2[3],this.b2[3],this.l2[6],this.a2[6],this.b2[6],this.d1[3]]},
        ],
        // 2
        [
          {lab_estandar:[this.l2[1],this.a2[1],this.b2[1]],
          lab_muestra:[this.l2[4],this.a2[4],this.b2[4],this.l2[7],this.a2[7],this.b2[7],this.d1[4]]},
        ],
        // 3
        [
          {lab_estandar:[this.l2[2],this.a2[2],this.b2[2]],
          lab_muestra:[this.l2[5],this.a2[5],this.b2[5],this.l2[8],this.a2[8],this.b2[8],this.d1[5]]},
        ]
      ],
      prueba:[
        [{lab:[this.l3[0],this.a3[0],this.b3[0]]}],
        [{lab:[this.l3[1],this.a3[1],this.b3[1]]}],
        [{lab:[this.l3[2],this.a3[2],this.b3[2]]}]
      ],
      observaciones:this.Observacion_
    }


    this.api.postAnalisisTinta(analisis)
      .subscribe((resp:any)=>{
        if(this.ImgSubir){
          this.subirArchivo.actualizarFoto(this.ImgSubir, 'analisis', resp._id )
          .then(img => {
            if(img){
            document.getElementsByClassName('file-name')[0].innerHTML = 'Sin archivo...';
            this.ImgSubir = null;
          }
      });
        }else{
          Swal.fire({
            title:'Análisis guardado',
            icon:'success',
            timer:1500,
            showConfirmButton:false,
            timerProgressBar:true,
            toast:true,
            position:'top-end'
          })
        }
      })
  }

  public cantidad = []
  public neto_total = 0;
  getLote(lote){
    this.api.getAlmacenadoPorLote(lote)
      .subscribe((resp:any)=>{
        if(resp.length > 0){
          if(resp[0].material.grupo != '61fd54e2d9115415a4416f17'){
            Swal.fire({
              icon:'error',
              text:'El lote solicitado no existe o pertenece a otro grupo de material diferente a "Tintas."',
              title:'Error!',
              showConfirmButton:false,
              timer:3500,
              timerProgressBar:true
            })
          }else{
            this.api.getAnalisisTinta(lote)
            .subscribe((resp_:any)=>{
              // console.log(resp_)
              if(resp_.empty){
                for(let i=0;i<resp.length;i++){
                  let presentacion = this.cantidad.findIndex(x=> x.presentacion === resp[i].material.presentacion && x.neto === resp[i].cantidad)
                  this.neto_total = Number(this.neto_total) + Number(resp[i].cantidad);
                  this.neto_total = Number(this.neto_total)
                  if(presentacion <0){
                    this.cantidad.push({presentacion:resp[i].material.presentacion, cantidad:resp[i].cantidad,neto:resp[i].cantidad, unidades:1})
                  }else{
                    this.cantidad[presentacion].cantidad = Number(this.cantidad[presentacion].cantidad) + Number(resp[i].cantidad)
                    this.cantidad[presentacion].unidades++
                    this.cantidad[presentacion].cantidad = (this.cantidad[presentacion].cantidad).toFixed(2)
                  }
                  resp[i].material.presentacion
                }
                this.muestra__ = resp[0]
                // console.log(this.muestra__, '-', this.cantidad)
              }else{
                this.sobre =  resp_.sobre
                this.cantidad_(this.sobre);
                this.papel_muestra(resp_.prueba_)
                this.presentacion_ = resp_.presentacion
                this.cantidad__ = resp_.total
                this.muestra__ = {material:{nombre:resp_.producto, marca:resp_.marcar}, lote:resp_.lote}
                this.cantidad = resp_.presentacion
                this.f_fabricacion = resp_.f_fabricacion
                this.f_vencimiento = resp_.f_vencimiento
                this.estandar_utilizado = resp_.estandar
                this.DrawDown_ = resp_.DrawDown
                this.l1[0] = resp_.carton[0][0].lab_estandar[0]
                this.a1[0] = resp_.carton[0][0].lab_estandar[1]
                this.b1[0] = resp_.carton[0][0].lab_estandar[2]
                this.l1[3] = resp_.carton[0][0].lab_muestra[0]
                this.a1[3] = resp_.carton[0][0].lab_muestra[1]
                this.b1[3] = resp_.carton[0][0].lab_muestra[2]
                this.l1[6] = resp_.carton[0][0].lab_muestra[3]
                this.a1[6] = resp_.carton[0][0].lab_muestra[4]
                this.b1[6] = resp_.carton[0][0].lab_muestra[5]
                this.d1[0] = resp_.carton[0][0].lab_muestra[6]

                this.l1[1] = resp_.carton[1][0].lab_estandar[0]
                this.a1[1] = resp_.carton[1][0].lab_estandar[1]
                this.b1[1] = resp_.carton[1][0].lab_estandar[2]
                this.l1[4] = resp_.carton[1][0].lab_muestra[0]
                this.a1[4] = resp_.carton[1][0].lab_muestra[1]
                this.b1[4] = resp_.carton[1][0].lab_muestra[2]
                this.l1[7] = resp_.carton[1][0].lab_muestra[3]
                this.a1[7] = resp_.carton[1][0].lab_muestra[4]
                this.b1[7] = resp_.carton[1][0].lab_muestra[5]
                this.d1[1] = resp_.carton[1][0].lab_muestra[6]

                this.l1[2] = resp_.carton[2][0].lab_estandar[0]
                this.a1[2] = resp_.carton[2][0].lab_estandar[1]
                this.b1[2] = resp_.carton[2][0].lab_estandar[2]
                this.l1[5] = resp_.carton[2][0].lab_muestra[0]
                this.a1[5] = resp_.carton[2][0].lab_muestra[1]
                this.b1[5] = resp_.carton[2][0].lab_muestra[2]
                this.l1[8] = resp_.carton[2][0].lab_muestra[3]
                this.a1[8] = resp_.carton[2][0].lab_muestra[4]
                this.b1[8] = resp_.carton[2][0].lab_muestra[5]
                this.d1[2] = resp_.carton[2][0].lab_muestra[6]

                this.move()

                this.l2[0] = resp_.papel[0][0].lab_estandar[0]
                this.a2[0] = resp_.papel[0][0].lab_estandar[1]
                this.b2[0] = resp_.papel[0][0].lab_estandar[2]
                this.l2[3] = resp_.papel[0][0].lab_muestra[0]
                this.a2[3] = resp_.papel[0][0].lab_muestra[1]
                this.b2[3] = resp_.papel[0][0].lab_muestra[2]
                this.l2[6] = resp_.papel[0][0].lab_muestra[3]
                this.a2[6] = resp_.papel[0][0].lab_muestra[4]
                this.b2[6] = resp_.papel[0][0].lab_muestra[5]
                this.d1[3] = resp_.papel[0][0].lab_muestra[6]

                this.l2[1] = resp_.papel[1][0].lab_estandar[0]
                this.a2[1] = resp_.papel[1][0].lab_estandar[1]
                this.b2[1] = resp_.papel[1][0].lab_estandar[2]
                this.l2[4] = resp_.papel[1][0].lab_muestra[0]
                this.a2[4] = resp_.papel[1][0].lab_muestra[1]
                this.b2[4] = resp_.papel[1][0].lab_muestra[2]
                this.l2[7] = resp_.papel[1][0].lab_muestra[3]
                this.a2[7] = resp_.papel[1][0].lab_muestra[4]
                this.b2[7] = resp_.papel[1][0].lab_muestra[5]
                this.d1[4] = resp_.papel[1][0].lab_muestra[6]

                this.l2[2] = resp_.papel[2][0].lab_estandar[0]
                this.a2[2] = resp_.papel[2][0].lab_estandar[1]
                this.b2[2] = resp_.papel[2][0].lab_estandar[2]
                this.l2[5] = resp_.papel[2][0].lab_muestra[0]
                this.a2[5] = resp_.papel[2][0].lab_muestra[1]
                this.b2[5] = resp_.papel[2][0].lab_muestra[2]
                this.l2[8] = resp_.papel[2][0].lab_muestra[3]
                this.a2[8] = resp_.papel[2][0].lab_muestra[4]
                this.b2[8] = resp_.papel[2][0].lab_muestra[5]
                this.d1[5] = resp_.papel[2][0].lab_muestra[6]

                this.move2()

                this.l3[0] = resp_.prueba[0][0].lab[0]
                this.a3[0] = resp_.prueba[0][0].lab[1]
                this.b3[0] = resp_.prueba[0][0].lab[2]

                this.l3[1] = resp_.prueba[1][0].lab[0]
                this.a3[1] = resp_.prueba[1][0].lab[1]
                this.b3[1] = resp_.prueba[1][0].lab[2]
                
                this.l3[2] = resp_.prueba[2][0].lab[0]
                this.a3[2] = resp_.prueba[2][0].lab[1]
                this.b3[2] = resp_.prueba[2][0].lab[2]

                this.usuario_ = resp_.guardado
                this.dia = resp_.dia
                this.move3()
                
                if(resp_.img){
                  this.img = resp_.img
                  document.getElementsByClassName('file-name')[0].innerHTML = 'Se cargó archivo DrawDown';
                }
                this.Observacion_ = resp_.observaciones

                this._tipo_ = resp_.tipo
              }
            })
          }
        }else{
          Swal.fire({
            icon:'error',
            text:'El lote solicitado no existe o pertenece a otro grupo de material diferente a "Tintas."',
            title:'Error!',
            showConfirmButton:false,
            timer:3500,
            timerProgressBar:true
          })
        }
      })
  }

big(n){
  // console.log(n)
  switch(n){
    case 'p1':
      this.Big_e = this.papel_e1
      this.Big_m = this.papel_m1
      this._BIG_ = true;
    break;
    case 'p2':
      this.Big_e = this.papel_e2
      this.Big_m = this.papel_m2
      this._BIG_ = true;
    break;
    case 'p3':
      this.Big_e = this.papel_e3
      this.Big_m = this.papel_m3
      this._BIG_ = true;
    break;
    case 'c1':
      this.Big_e = this.carton_e1
      this.Big_m = this.carton_m1
      this._BIG_ = true;
    break;
    case 'c2':
      this.Big_e = this.carton_e2
      this.Big_m = this.carton_m2
      this._BIG_ = true;
    break;
    case 'c3':
      this.Big_e = this.carton_e3
      this.Big_m = this.carton_m3
      this._BIG_ = true;
    break;
  }
}

close_modal(){
  this._BIG_ = false;
}

CambiarImagen( event:any ){
  this.ImgSubir = (event.target).files[0];
  document.getElementsByClassName('file-name')[0].innerHTML = this.ImgSubir.name;
}

}
