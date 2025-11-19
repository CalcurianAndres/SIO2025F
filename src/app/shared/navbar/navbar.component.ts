import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Usuario } from 'src/app/models/usuario.model';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private usuarioService: RestApiService, private renderer: Renderer2) {
    this.usuario = usuarioService.usuario;
  }

  public usuario: Usuario
  public cambio_cont: boolean = false

  pass1 = ''
  pass2 = ''

  @ViewChild('snowfall', { static: false }) snowfall: ElementRef;
  private _snowflakes: HTMLElement[] = [];
  private _snowCount = 20; // cantidad inicial de copos (ajusta si quieres más/menos)

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this._createSnowfall();
  }

  private _createSnowfall() {
    if (!this.snowfall) { return; }
    const container = this.snowfall.nativeElement as HTMLElement;

    for (let i = 0; i < this._snowCount; i++) {
      const span = this.renderer.createElement('span') as HTMLElement;
      this.renderer.addClass(span, 'snowflake');

      span.innerText = '❅';

      const sizeVariant = Math.random();
      if (sizeVariant < 0.4) {
        this.renderer.addClass(span, 'small');
      } else if (sizeVariant < 0.8) {
        this.renderer.addClass(span, 'medium');
      } else {
        this.renderer.addClass(span, 'large');
      }

      // posición horizontal aleatoria
      const left = Math.floor(Math.random() * 100);
      this.renderer.setStyle(span, 'left', `${left}%`);

      // Duraciones separadas: caída y oscilación
      const fallDuration = (2.5 + Math.random() * 4.0).toFixed(2); // 2.5s - 6.5s
      const swayDuration = (1.5 + Math.random() * 3.5).toFixed(2); // 1.5s - 5s

      // Delays negativos para dispersar el inicio
      const fallDelay = (-Math.random() * Number(fallDuration)).toFixed(2);
      const swayDelay = (-Math.random() * Number(swayDuration)).toFixed(2);

      // aplicar estilos de animación (dos animaciones: fall, sway)
      this.renderer.setStyle(span, 'animation-duration', `${fallDuration}s, ${swayDuration}s`);
      this.renderer.setStyle(span, 'animation-delay', `${fallDelay}s, ${swayDelay}s`);
      this.renderer.setStyle(span, 'animation-timing-function', `linear, ease-in-out`);
      this.renderer.setStyle(span, 'animation-iteration-count', `infinite, infinite`);

      // opacidad aleatoria
      const op = (0.6 + Math.random() * 0.4).toFixed(2);
      this.renderer.setStyle(span, 'opacity', op);

      this.renderer.appendChild(container, span);
      this._snowflakes.push(span);
    }
  }

  ngOnDestroy(): void {
    // limpiar copos creados
    try {
      this._snowflakes.forEach(f => {
        if (f.parentNode) { f.parentNode.removeChild(f); }
      });
      this._snowflakes = [];
    } catch (err) { /* silencioso */ }
  }

  logout() {
    this.usuarioService.logout();
  }

  cambiar() {
    if (this.cambio_cont) {
      this.cambio_cont = false
    } else {
      this.cambio_cont = true
    }
  }

  cambiarPass() {
    let data = {
      correo: this.usuario.Correo,
      pass: this.pass1
    }

    this.usuarioService.cambiarContrasena(data)
      .subscribe((resp: any) => {
        Swal.fire({
          title: 'Contraseña Cambiada',
          text: 'Se realizó el cambio de contraseña',
          icon: 'success',
          showConfirmButton: false,
        })
        this.pass1 = ''
        this.pass2 = ''
        this.cambiar()
      })
  }

}
