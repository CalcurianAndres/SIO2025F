import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { RestApiService } from '../services/rest-api.service';

@Component({
  selector: 'app-token-validation',
  templateUrl: './token-validation.component.html',
  styleUrls: ['./token-validation.component.css']
})
export class TokenValidationComponent implements OnInit {

  constructor(private api:RestApiService,
              private router:Router) { 
    this.usuario = this.api.usuario
    // console.log(this.usuario)
  }


  public usuario
  public nuevo_pin:boolean = true
  public sin_autorizar = true

  ngOnInit(): void {

    if(this.usuario.Precios === 1){
      if(this.usuario.pin === ''){
        this.nuevo_pin = true
      }else{
        this.nuevo_pin = false
      }
    }else{
      this.sin_autorizar = true;
      this.router.navigateByUrl('/')
    }
  }

  public pin1 = ''
  public pin2 = ''


  Crear_pin(){
    let data = {
      pin:this.pin2,
      correo:this.usuario.Correo
    }
    this.api.crearPin(data)
      .subscribe((resp:any)=>{
        Swal.fire({
          title:'Pin creado',
          text:'Se creó nuevo PIN para acceder al modulo',
          icon:'success',
          showConfirmButton:true
        })
        this.usuario.pin = '0'
        this.nuevo_pin = false
      })
  }

  Verificar(pin){
    let data = {
      correo: this.usuario.Correo,
      pin
    }
    this.api.TwoStepsValidation(data)
    .subscribe((resp:any) =>{
      localStorage.setItem('token_two', resp.token_two);
      this.router.navigateByUrl('/ventas')
    }, (err) => {
      // // console.log(err)
      Swal.fire({title:'Error', text:err.error.err.message,icon:'error',showConfirmButton:false})
    })
  }

}
