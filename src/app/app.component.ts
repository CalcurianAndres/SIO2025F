import { Component, OnInit } from '@angular/core';
import { ReloadService } from './services/reload.service';
import Swal from 'sweetalert2';
import { NgIf } from '@angular/common';
import { RestApiService } from './services/rest-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Poligrafica';

  constructor(public reload: ReloadService, public api: RestApiService) { }

  ngOnInit(): void {

    this.applyPrimaryContrast();
    this.reload.socket.on("nueva-requisicion", () => {


      console.log(this.api.usuario)
      if (this.api.usuario.acepta === true) {

        // 🔊 Reproducir sonido
        const audio = new Audio('../assets/sounds/Notificacion.mp3');
        audio.play();

        Swal.fire({
          title: 'Nueva Solicitud de material',
          text: 'Se ha recibido una nueva solicitud de material.',
          icon: 'info',
          confirmButtonText: 'Aceptar',
          toast: true,
          position: 'top-end',
        });
      }


    });


    this.reload.socket.on('requisicion_aceptada', () => {
      if (this.api.usuario.asigna === true) {
        // 🔊 Reproducir sonido
        const audio = new Audio('../assets/sounds/Notificacion.mp3');
        audio.play();

        Swal.fire({
          title: 'Nueva Solicitud de material aprobada',
          text: 'Se ha aprobado una nueva solicitud de material para ser asignada.',
          icon: 'info',
          confirmButtonText: 'Aceptar',
          toast: true,
          position: 'top-end',
        });
      }
    })



  }


  applyPrimaryContrast() {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary-color')
      .trim();

    const rgb = this.hexToRgb(color);

    if (!rgb) return;

    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

    const targets = document.querySelectorAll('.button.is-primary, .navbar.is-primary');

    targets.forEach((el: any) => {
      el.classList.remove('is-light-text', 'is-dark-text');

      if (brightness < 140) {
        el.classList.add('is-light-text');
      } else {
        el.classList.add('is-dark-text');
      }
    });
  }


  hexToRgb(hex: string) {
    hex = hex.replace('#', '');

    if (hex.length === 3) {
      hex = hex.split('').map(x => x + x).join('');
    }

    const num = parseInt(hex, 16);

    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

}
