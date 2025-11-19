import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/models/usuario.model';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private usuarioService:RestApiService) { 
    this.usuario = usuarioService.usuario;
  }

  public usuario: Usuario
  public cambio_cont:boolean = false

  pass1 = ''
  pass2 = ''


  ngOnInit(): void {
  }

  logout(){
    this.usuarioService.logout();
  }

  cambiar(){
    if(this.cambio_cont){
      this.cambio_cont = false
    }else{
      this.cambio_cont = true
    }
  }

  cambiarPass(){
    let data = {
      correo:this.usuario.Correo,
      pass:this.pass1
    }

    this.usuarioService.cambiarContrasena(data)
      .subscribe((resp:any)=>{
        Swal.fire({
          title:'Contraseña Cambiada',
          text:'Se realizó el cambio de contraseña',
          icon:'success',
          showConfirmButton:false,
        })
        this.pass1 = ''
        this.pass2 = ''
        this.cambiar()
      })
  }

}
