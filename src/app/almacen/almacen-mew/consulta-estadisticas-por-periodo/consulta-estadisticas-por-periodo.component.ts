import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-consulta-estadisticas-por-periodo',
  templateUrl: './consulta-estadisticas-por-periodo.component.html',
  styleUrls: ['./consulta-estadisticas-por-periodo.component.css']
})
export class ConsultaEstadisticasPorPeriodoComponent {

  from!: string;
  to!: string;

  cargando = false;
  data: any[] = [];

  lineChart!: Chart;
  barChart!: Chart;

  constructor(private http: HttpClient) { }

  consultar() {
    if (!this.from || !this.to) return;

    this.cargando = true;

    this.http.get<any[]>(
      'http://192.168.0.27:8080/api/reportes/consumo-materiales-por-periodo',
      { params: { from: this.from, to: this.to, groupBy: 'month' } }
    ).subscribe({
      next: res => {
        this.data = res;
        this.cargando = false;
        this.renderCharts();
      },
      error: () => {
        this.cargando = false;
        alert('Error consultando datos');
      }
    });
  }

  renderCharts() {
    const labels = this.data.map(p => p.label);

    const asignadoOP = this.data.map(p =>
      p.grupos.reduce((a: number, g: any) => a + g.totalAsignadoOP, 0)
    );

    const devueltoOP = this.data.map(p =>
      p.grupos.reduce((a: number, g: any) => a + g.totalDevueltoOP, 0)
    );

    const consumidoOP = this.data.map(p =>
      p.grupos.reduce((a: number, g: any) => a + g.totalConsumidoOP, 0)
    );

    /* ===== LINE CHART ===== */
    if (this.lineChart) this.lineChart.destroy();

    this.lineChart = new Chart('lineChart', {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Consumido OP',
            data: consumidoOP,
            borderColor: 'rgba(35, 209, 96, 1)',
            backgroundColor: 'rgba(35, 209, 96, 0.25)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Asignado OP',
            data: asignadoOP,
            borderColor: 'rgba(255, 56, 96, 1)',
            backgroundColor: 'rgba(255, 56, 96, 0.15)',
            fill: true,
            tension: 0.3
          }
        ]
      }
    });

    /* ===== BAR CHART ===== */
    if (this.barChart) this.barChart.destroy();

    this.barChart = new Chart('barChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Asignado OP',
            data: asignadoOP,
            backgroundColor: 'rgba(255, 56, 96, 0.7)'
          },
          {
            label: 'Devuelto OP',
            data: devueltoOP,
            backgroundColor: 'rgba(255, 221, 87, 0.7)'
          }
        ]
      }
    });
  }

}
