import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { Usuario } from 'src/app/models/usuario.model';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private usuarioService: RestApiService, private renderer: Renderer2, private theme: ThemeService) {
    this.usuario = usuarioService.usuario;
  }

  public usuario: Usuario
  public cambio_cont: boolean = false

  pass1 = ''
  pass2 = ''

  @ViewChild('snowfall', { static: false }) snowfall: ElementRef;
  private _snowflakes: HTMLElement[] = [];
  private _snowCount = 20; // cantidad inicial de copos (ajusta si quieres más/menos)


  mostrarNuevoTema = false;

  ngOnInit(): void {
    const visto = localStorage.getItem('temaVisto');
    this.mostrarNuevoTema = !visto;
    this.theme.initTheme();
    const theme_ = localStorage.getItem('theme');

    if (theme_ === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  ngAfterViewInit(): void {
    // this._createSnowfall();
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

  toggleTheme() {
    const current = localStorage.getItem('theme');
    localStorage.setItem('temaVisto', 'true');
    this.mostrarNuevoTema = false;

    if (current === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  }

  abrirSelectorTema() {
    // Lo marca como visto
    localStorage.setItem('temaVisto', 'true');
    this.mostrarNuevoTema = false;

    const currentColor = this.theme.getPrimary() || '#1c2831';

    Swal.fire({
      title: '🎨 Cambiar color principal',
      html: `
      <p style="margin-bottom:10px;">Selecciona un nuevo color</p>
      <input id="colorPicker" type="color" value="${currentColor}"
        style="width:100%; height:50px; border:none; cursor:pointer;">
    `,
      confirmButtonText: 'Guardar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const picker = document.getElementById('colorPicker') as HTMLInputElement;
        const preview = document.getElementById('preview') as HTMLElement;

        picker.addEventListener('input', () => {
          preview.style.background = picker.value;
          document.documentElement.style.setProperty('--primary-color', picker.value);
        });
      },
      preConfirm: () => {
        const picker = document.getElementById('colorPicker') as HTMLInputElement;
        return picker.value;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.theme.setPrimary(result.value);
        this.setPrimaryTheme(result.value);

        Swal.fire({
          icon: 'success',
          title: 'Color guardado ✅',
          text: 'El nuevo color principal fue guardado',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
      }
    });
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

  /**
* Actualiza el color primario y calcula automáticamente 
* si el texto debe ser blanco o negro.
* @param {string} hexColor - El color en formato HEX (ej: #00d1b2)
*/
  setPrimaryTheme(hexColor) {
    const root = document.documentElement;

    // 1. Establecer el color primario
    root.style.setProperty('--primary-color', hexColor);

    // 2. Calcular contraste para el texto
    const contrastColor = this.getContrastColor(hexColor);
    root.style.setProperty('--text-on-primary', contrastColor);
  }

  /**
   * Ayudante: Recibe un HEX y devuelve '#000000' o '#ffffff'
   * basado en la luminancia (fórmula YIQ).
   */
  getContrastColor(hex) {
    console.log(hex)
    // Eliminar el hash si existe
    hex = hex.replace('#', '');

    // Convertir a RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calcular luminancia (Fórmula YIQ estándar)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    console.log(yiq)

    // Si yiq >= 128 es un color claro -> devolver texto negro
    // Si yiq < 128 es un color oscuro -> devolver texto blanco
    return (yiq >= 128) ? '#000000' : '#ffffff';
  }

}
