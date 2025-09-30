import { Component, OnInit } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';

@Component({
  selector: 'app-estadisticas-gestion',
  templateUrl: './estadisticas-gestion.component.html',
  styleUrls: ['./estadisticas-gestion.component.css']
})
export class EstadisticasGestionComponent implements OnInit {

  constructor(public api:RestApiService) { }

  public stats:any = []
  ngOnInit(): void {
    this.api.getEstadisticasImpresoras()
              .subscribe((resp:any) =>{
                this.stats = resp
                console.log(this.stats[0].Roland_700)
              })
  }


  getAverage(roland700Data: any[]): number {

    const uniqueData = this.getUniqueData(roland700Data);
    const totalHojas = uniqueData.reduce((acc, item) => acc + Number(item.totalHojas), 0);
    return totalHojas / uniqueData.length;
  }

  getUniqueData(roland700Data: any[]): { fecha: string; totalHojas: number }[] {
    const uniqueSet = new Set<string>();
    const uniqueData: { fecha: string; totalHojas: number }[] = [];

    roland700Data.forEach(maquina => {
        const fecha = maquina.fecha;
        const hojas = Number(maquina.hojas);
        const key = `${fecha}-${hojas}`; // Crear una clave única combinando fecha y cantidad

        if (!uniqueSet.has(key)) {
            uniqueSet.add(key);
            uniqueData.push({ fecha, totalHojas: hojas });
        }
    });

    return uniqueData;
}





}
