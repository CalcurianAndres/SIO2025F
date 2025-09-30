import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2'
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RestApiService } from '../services/rest-api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [
    './login.component.css'
  ]
})
export class LoginComponent implements OnInit{

  cargando = false;
  correo:string = '';
  email:string = '';

  
  public formSubmitted = false;
  public loginForm = this.fb.group({
    Correo:['', [Validators.required, Validators.email]],
    Password:['', Validators.required],
    remember: [false]
  });
  
  constructor(private router:Router,
    private fb:FormBuilder,
    private api:RestApiService) {
    }
  
    ngOnInit(){
      this.email = localStorage.getItem('correo') || '';
        if(this.email.length > 2 ){
          this.loginForm.get('remember')?.patchValue(true);
        }
    }



  login(){    
    //Agregar clase de cargar a boton
    this.cargando = true;

    if(this.loginForm.get('remember')?.value === true){
      this.correo = this.loginForm.get('Correo')?.value;
      localStorage.setItem('correo', this.correo);
    }else{
      localStorage.removeItem('correo');
    }
    

    this.api.Login(this.loginForm.value)
        .subscribe((resp:any) =>{
          localStorage.setItem('token', resp.token);
          this.router.navigateByUrl('/')
        }, (err) => {
          this.cargando = false;
          // // console.log(err)
          Swal.fire('Error', err.error.err.message, 'error')
        })
    // // // console.log(this.loginForm.value)

  }

}