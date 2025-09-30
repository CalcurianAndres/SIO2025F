import { Component, OnInit, Input,Output,EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-despachos',
  templateUrl: './despachos.component.html',
  styleUrls: ['./despachos.component.css']
})
export class DespachosComponent implements OnInit {

  @Input() modal_despacho:any
  @Input() despachos_filtrado:any
  @Input() despachos_orden:any
  @Input() lote_mayor:any
  @Input() Ej_montados:any
  @Input() c_devoluciones:any
  @Input() hojas:any;

  Total_Despachado = 0;
  public chart_rendimiento;

  @Output() onCloseModal = new EventEmitter();

  constructor(private router:Router,) { }

  ngOnInit(): void {
  }

  public ids = []
  public ready:boolean = false;
  sumaCantidades(){

    let existe_cert = []
    for(let i=0;i<this.despachos_filtrado.length;i++){
      for(let x=0;x<this.despachos_filtrado[i].despacho.length;x++){
        // console.log(this.despachos_filtrado[i].despacho[x].op,'/',this.despachos_orden)
        if(this.despachos_filtrado[i].despacho[x].op === this.despachos_orden && !existe_cert.includes(this.despachos_filtrado[i].despacho[x].certificado)){
          this.Total_Despachado = Number(this.Total_Despachado) + Number(this.despachos_filtrado[i].despacho[x].cantidad)
          existe_cert.push(this.despachos_filtrado[i].despacho[x].certificado)
        }
      }
    }
    this.producto =  Number(this.Total_Despachado) / Number(this.Ej_montados)

    // let existe = this.ids.find(x=> x.id === id)
    // if(existe){
    //   return 
    // }else{
    //   this.ids.push({id})
    //   this.Total_Despachado = Number(this.Total_Despachado) + cantidad
    // }
  }

  puntoYcoma(n){
    if(!n){
      return 0
    }
    n = Number(n).toFixed(2)
    return n = new Intl.NumberFormat('de-DE').format(n)
  }

  showChart(){

    
    if(this.chart_rendimiento){
      this.chart_rendimiento.destroy();
    }

    let perdida = 100 - Number(this.rendimiento(this.asignadas,this.producto))
    if(perdida < 1){
      perdida = 0
    }

    var ctx = (<HTMLCanvasElement>document.getElementById("chart_rendimiento")).getContext('2d')

    this.chart_rendimiento = new Chart(ctx,{
      type:'doughnut',
      data:{
        labels:['Efectividad','Desperdicio'],
        datasets: [{
          label: 'Sustrato consumido',
          data: [this.rendimiento(this.asignadas,this.producto),perdida],
          backgroundColor: [
            'rgb(54, 162, 235,0.2)',
            'rgb(255, 99, 132,0.2)',
          ],
          borderColor: [
            'rgb(54, 162, 235)',
            'rgb(255, 99, 132)',
          ],
          hoverOffset: 4
        }]
      }
    })
  }

  rendimiento(x,y){
    let percent = y * 100 / x;
    return Number(percent).toFixed(2)
  }

  redondear(n){
    return Math.ceil(n)
  }

  public producto = 0;
  public asignadas
  showPercent(){
    let hojas = 0
    let descuentos = 0;
    console.log(this.lote_mayor)
    for(let i=0;i<this.lote_mayor.length;i++){
      if(this.lote_mayor[i].ancho){
        hojas = Number(hojas)+ this.lote_mayor[i].cantidad
      }

      if(i === this.lote_mayor.length -1){
        for(let x=0;x<this.c_devoluciones.length;x++){
          for(let y=0;y<this.c_devoluciones[x].filtrado.length;y++){
            let _material_ = this.c_devoluciones[x].filtrado[y].material;
            if(_material_.ancho){
              descuentos = Number(descuentos) + Number(this.c_devoluciones[x].filtrado[y].cantidad)
              // console.log(this.c_devoluciones[x].filtrado[y])
            }
          }
        }
      }

    }
    this.asignadas = hojas - descuentos;
    
    this.sumaCantidades();
    this.showChart()
    this.ready = true
  }

  closemodal(){
    this.ids = []
    this.Total_Despachado = null;
    // console.log(this.Total_Despachado)
    this.asignadas = 0;
    this.producto = 0
    if(this.chart_rendimiento){
      this.chart_rendimiento.destroy();
    }
    this.ready = false
    this.onCloseModal.emit();
  }

}
