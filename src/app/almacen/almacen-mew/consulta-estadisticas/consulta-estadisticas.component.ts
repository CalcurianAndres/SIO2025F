import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-consulta-estadisticas',
  templateUrl: './consulta-estadisticas.component.html',
  styleUrls: ['./consulta-estadisticas.component.css']
})
export class ConsultaEstadisticasComponent {


  from!: string;
  to!: string;

  cargando = false;
  data: any[] = [];

  constructor(private http: HttpClient) { }

  consultar() {
    if (!this.from || !this.to) return;

    this.cargando = true;

    this.http.get<any[]>(
      `http://192.168.0.27:8080/api/reportes/consumo-materiales-simple`,
      {
        params: {
          from: this.from,
          to: this.to
        }
      }
    ).subscribe({
      next: res => {
        this.data = res.map(g => ({
          ...g,
          abierto: false   // 👈 ESTO ES LO ÚNICO NUEVO
        }));

        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        alert('Error consultando datos');
      }
    });
  }

  nombreMaterial(m: any): string {
    if (m.ancho && m.largo) {
      return `${m.nombre} ${m.marca} (${m.ancho}x${m.largo}) ${m.gramaje ?? ''}g/m² ${m.calibre ?? ''}pt`;
    }
    return `${m.nombre} ${m.marca}`;
  }
}
