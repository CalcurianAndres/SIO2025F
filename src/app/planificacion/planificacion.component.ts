import { Component, OnInit } from '@angular/core';
import { RestApiService } from '../services/rest-api.service';

import * as moment from 'moment'


@Component({
  selector: 'app-planificacion',
  templateUrl: './planificacion.component.html',
  styleUrls: ['./planificacion.component.css']
})
export class PlanificacionComponent implements OnInit {

  public MAQUINAS;
  public FUNCIONES = [];
  public TRABAJOS = [];
  public cargado:boolean = false

  constructor(private api:RestApiService) { }

  ngOnInit(): void {
    
    this.ObtenerMaquinas()
    this.obtenerTrabajos()
    this.ObtenerDespachos()
    let mes = moment().format('M')
    let ano = moment().format('yyyy')
    this.getDaysFromDate(mes,ano)
    this.obtenerOrdenes()
  }

  // ***********************************************************
  getDaysFromDate(month, year) {
    
    moment.locale('es')
    
    moment.updateLocale('es', {
      months : [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
          "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ]
  });

    
    const startDate = moment(`${year}/${month}/01`)
    const endDate = startDate.clone().endOf('month')
    this.dateSelect = startDate;

    const diffDays = endDate.diff(startDate, 'days', true)
    const numberDays = Math.round(diffDays);

    const arrayDays = Object.keys([...Array(numberDays)]).map((a: any) => {
      a = parseInt(a) + 1;
      const dayObject = moment(`${year}-${month}-${a}`);
      return {
        name: dayObject.format("dddd"),
        value: a,
        indexWeek: dayObject.isoWeekday()
      };
    });

    this.monthSelect = arrayDays;
  }

  changeMonth(flag) {
    if (flag < 0) {
      const prevDate = this.dateSelect.clone().subtract(1, "month");
      this.getDaysFromDate(prevDate.format("MM"), prevDate.format("YYYY"));
    } else {
      const nextDate = this.dateSelect.clone().add(1, "month");
      this.getDaysFromDate(nextDate.format("MM"), nextDate.format("YYYY"));
    }
  }

  clickDay(day) {
    const monthYear = this.dateSelect.format('YYYY-MM')
    const parse = `${monthYear}-${day.value}`
    const objectDate = moment(parse)
    this.dateValue = objectDate;


  }
  // ***********************************************************

  week:any = [
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
    "Domingo"
  ]

  monthSelect: any[];
  dateSelect: any;
  dateValue: any;

  ObtenerMaquinas(){
    this.api.GetMaquinas()
      .subscribe(maquinas => {
        this.MAQUINAS = maquinas;
        this.obtenerTipos();
        this.cargado = true
      });
  }

  public Despachos = []
  ObtenerDespachos(){
    this.api.GetDespacho()
      .subscribe((resp:any)=>{
        this.Despachos = resp
      })
  }

  obtenerTipos(){
    let x = this.MAQUINAS.length;
    for(let i = 0; i< x; i++){
      let inde = this.FUNCIONES.includes(this.MAQUINAS[i].tipo)
      if(!inde){
        this.FUNCIONES.push(this.MAQUINAS[i].tipo)
      }
      if(i === x -1){
        this.FUNCIONES.push('DESPACHO')
      }
    }
  }

  obtenerOrdenes(){
    this.api.getOrden()
      .subscribe((resp:any)=>{
        // console.log(resp)
      })
  }

  Cant_hojas(x,y){
    return Math.ceil(x/y)
  }
  
  getFechas(fecha:any, funcion:any){

    // 2021-08-
    
    let mes = moment(this.dateSelect).format('MM')
    let ano = moment(this.dateSelect).format('yyyy')

    if(fecha<10){
      fecha = `0${fecha}`
    }

    let fecha_ = `${ano}-${mes}-${fecha}`

    let betas = [];

    let nuevo = this.TRABAJOS.filter(x => x.maquina.tipo === funcion);

    let despach = []
    if(funcion === 'DESPACHO'){
      let funcion_:any = this.Despachos.filter(x => x.fecha === `${fecha}-${mes}-${ano}`)
      if(funcion_.length>0){
        // // console.log(funcion_)
        for(let i=0;i<funcion_.length;i++){
          for(let x=0;x<funcion_[i].despacho.length;x++){
            despach.push(funcion_[i].despacho[x])
            if(i === funcion_[i].despacho.length-1){
              return despach
            }
          }
        }
      }
    }

    if(nuevo){
      let final = [];
      let Long = nuevo.length;
      for(let i=0; i<Long; i++){

        if(fecha_ >= nuevo[i].fechaI){
          if(fecha_ <= nuevo[i].fecha){
            final.push(nuevo[i])
          }
        }

      }
      return final;
      
    }
    // // // console.log(nuevo)
  }
    // // // console.log(this.TRABAJOS.length )

    // fecha = '2021-08-20'
    // funcion = "IMPRESION"

    
    // let nuevo = this.TRABAJOS.find(x => x.maquina.tipo === funcion);

    // if(nuevo){
    //   let fecha_final = moment(nuevo.fecha).format('yyyy-MM-DD')
    //   let fecha_Inicial = moment(nuevo.fechaI).format('yyyy-MM-DD')
    //   let fecha_actual = moment(fecha).format('yyyy-MM-DD')

    //   // // console.log(nuevo)

      // let MI:boolean = fecha_actual >= fecha_Inicial;
      // if(MI){
      //   let MF:boolean = fecha_actual <= fecha_final;
      //   // // console.log(MF)
      // }


    // if(nuevo){
    //   let fecha_final = moment(nuevo.fecha).format('yyyy-MM-DD')
    //   let fecha_Inicial = moment(nuevo.fechaI).format('yyyy-MM-DD')
    //   let fecha_actual = moment(fecha).format('yyyy-MM-DD')
      
    //   let MI:boolean = fecha_actual >= fecha_Inicial;

    //   if(MI){
    //     let MF:boolean = fecha_actual <= fecha_final;
    //     if(MF){
    //       // // console.log(nuevo,'_',funcion)
    //       return `${nuevo._id.slice(3,6)}`
    //     }
    //   }

    // }

    
    
    // if(nuevo){
    //   let fecha_final = moment(nuevo.fecha).format('yyyy-MM-DD')
    //   let fecha_Inicial = moment(nuevo.fechaI).format('yyyy-MM-DD')
    //   let fecha_actual = moment(fecha).format('yyyy-MM-DD')
      
    //   let MI:boolean = fecha_actual >= fecha_Inicial;
      
    //   if(MI){
    //     let MF:boolean = fecha_actual <= fecha_final;
    //     if(MF){
    //       // // console.log('aqui',nuevo)
    //        return `${nuevo._id.slice(3,6)}`
    //     }
    //   }
    // }



      // if(nuevo.fecha < fecha)

    // if(nuevo){
    //   let nuevo2 = nuevo.find(x => x.fecha <= fecha)
    //   // // console.log(nuevo2)
    // }


    // return nuevo

  obtenerTrabajos(){
    this.api.getTrabajos()
      .subscribe((resp:any)=>{
        this.cargado = false;
        this.TRABAJOS = resp;
        // // console.log(this.TRABAJOS)
        this.cargado = true;
      })
  }

}