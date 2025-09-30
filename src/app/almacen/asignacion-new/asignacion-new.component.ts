import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignacion-new',
  templateUrl: './asignacion-new.component.html',
  styleUrls: ['./asignacion-new.component.css']
})
export class AsignacionNewComponent implements OnInit {


  @Input() asignacion_:any
  @Input() necesario:any
  @Input() repuestos:any;
  @Input() repuesto:any;
  @Output() onCloseModal = new EventEmitter();

  constructor(private api:RestApiService) { }

  ngOnInit(): void {
    this.BuscarUnaOrden();
    this.buscarRequisicion();
  }

  public Asignar:boolean = false;
  public ordenes = []
  public loading_:boolean = true;

  // TOTAL A ASIGNAR
  public Total
  //LOTES ENCONTRADOS
  public Lotes_encontrados = []
  // CANTIDAD QUE SE VA SUMANDO
  public sumando = 0
  // RESTANTES DE CADA PRODUCTO
  public restante = []
  //ACEPTADAS
  public material_cubierto = 0

  public cajas_por_id:any = []


  public trabajando = []
  public cantidad_cinta

  AsignarRepuesto(i){
    this.api.putRepuestosAprobados(this.repuestos[i], this.repuestos[i]._id)
      .subscribe((resp:any)=>{
        this.api.getRepuestosAprobados()
            .subscribe((resp:any)=>{
            this.repuestos = resp;
            Swal.fire({
              title:'Se realizó la asignación del repuesto',
              icon:'success',
              showConfirmButton:false,
              timer:5000,
              timerProgressBar:true,
              toast:true,
              position:'top-end'
            })
            this.onCloseModal.emit();
        })
      })
    
  }

  buscarRequisicion(){
    this.api.getRequi()
    .subscribe((resp:any)=>{
      // console.log(resp)
      for(let i =0; i<resp.length;i++){
        this.ordenes.push(resp[i])
        // // console.log(this.Almacenado, 'almacenado')
      }
      // this.onAgregarRequisicioes.emit(resp)
    })
  }

  asignar(i,n){
    this.trabajando = [i,n];
    // console.log(i,n)
    if(!this.Asignar){
      this.Asignar = true

      let material = this.ordenes[i].producto.materiales[this.ordenes[i].montaje][n]
      let parametro
      parametro = {material:material.producto._id, $and:[{cantidad:{ $gt:0}}, {cantidad:{$ne:'0.00'}}]}
      if(material.producto.grupo.nombre === 'Tinta'){
         this.Total = ((material.cantidad * this.ordenes[i].paginas)/1000).toFixed(2)
         parametro = {material:material.producto._id, $and:[{cantidad:{ $gt:0}}, {cantidad:{$ne:'0.00'}}]}
      }
      if(material.producto.grupo.nombre === 'Barniz'){
        this.Total = ((material.cantidad * this.ordenes[i].paginas)/1000).toFixed(2)
        parametro = {material:material.producto._id, $and:[{cantidad:{ $gt:0}}, {cantidad:{$ne:'0.00'}}]}
     }
      if(material.producto.grupo.nombre === 'Sustrato'){
        this.Total = (this.ordenes[i].paginas).toFixed(2)
        parametro = {material:material.producto._id, $and:[{cantidad:{ $gt:0}}, {cantidad:{$ne:'0.00'}}, {fuera:{$ne:true}}]}
      }
      if(material.producto.grupo.nombre === 'Soportes de Embalaje'){
        this.Total = Math.ceil(this.cajas_por_id[i]*material.cantidad)
        parametro = {material:material.producto._id, $and:[{cantidad:{ $gt:0}}, {cantidad:{$ne:'0.00'}}]}
      }
      if(material.producto.grupo.nombre === 'Cajas Corrugadas'){
        this.Total = Math.ceil(this.ordenes[i].cantidad / material.cantidad)
        parametro = {material:material.producto._id, $and:[{cantidad:{ $gt:0}}, {cantidad:{$ne:'0.00'}}]}
      }
      if(material.producto.grupo.nombre === 'Cinta de Embalaje'){
        this.Total = Math.ceil(this.ordenes[i].cantidad / material.cantidad)
        parametro = {material:material.producto._id, $and:[{cantidad:{ $gt:0}}, {cantidad:{$ne:'0.00'}}]}
      }

      if(this.ordenes[i].motivo){
        this.Total = material.cantidad
      }

      if(material.producto.grupo.nombre === 'Barniz' || material.producto.grupo.nombre === 'Cajas Corrugadas')
      {
        this.api.GETALLALMACEN()
         .subscribe((resp:any)=>{

           
           this.Lotes_encontrados = resp.filter(x=>x.material.nombre === material.producto.nombre);
           if(material.producto.grupo.nombre === 'Cajas Corrugadas'){
             this.cantidad_cinta = Number(this.Lotes_encontrados[0].material.cinta) * Number(this.cantidad_cajas)
           }
          this.loading_ = false
          let ordenes = this.momentaneos.filter(x => x.orden === this.trabajando[0] && x.producto === this.trabajando[1])
          for(let y=0;y<ordenes.length;y++){
           setTimeout(() => {
             (<HTMLInputElement>document.getElementById(ordenes[y].index.toString())).checked = true;
             this.seleccionar(ordenes[y].index)
           }, 500);
          }

         })
      }else if(material.producto.grupo.nombre === 'Soportes de Embalaje'){
        this.api.GETALLALMACEN()
        .subscribe((resp:any)=>{

          
          this.Lotes_encontrados = resp.filter(x=>x.material.nombre === material.producto.nombre);
          if(material.producto.grupo.nombre === 'Cajas Corrugadas'){
            this.cantidad_cinta = Number(this.Lotes_encontrados[0].material.cinta) * Number(this.cantidad_cajas)
          }
         this.loading_ = false
         let ordenes = this.momentaneos.filter(x => x.orden === this.trabajando[0] && x.producto === this.trabajando[1])
         for(let y=0;y<ordenes.length;y++){
          setTimeout(() => {
            (<HTMLInputElement>document.getElementById(ordenes[y].index.toString())).checked = true;
            this.seleccionar(ordenes[y].index)
          }, 500);
         }

        })
      }else{        
        this.api.BUSCARENALMACENPRODUCTO(parametro)
         .subscribe((resp:any)=>{
           this.Lotes_encontrados = resp;
           // console.log(this.Lotes_encontrados)
           this.loading_ = false

           let ordenes = this.momentaneos.filter(x => x.orden === this.trabajando[0] && x.producto === this.trabajando[1])
           for(let y=0;y<ordenes.length;y++){
            setTimeout(() => {
              (<HTMLInputElement>document.getElementById(ordenes[y].index.toString())).checked = true;
              this.seleccionar(ordenes[y].index)
            }, 500);
           }

         })
      }


    }else{
      if(this.sumando < this.Total){
        if((<HTMLInputElement>document.getElementById(`${i}_${n}`))){
          (<HTMLInputElement>document.getElementById(`${i}_${n}`)).style.display = 'none';
          this.material_cubierto--;
        }
      }
      this.sumando = 0;
      this.Asignar = false
      this.loading_ = true
    }
  }

  BuscarUnaOrden(){
    this.api.GETORDENESPECIFICA()
      .subscribe((resp:any)=>{
        for(let i=0;i<resp.length;i++){
          this.ordenes.push(resp[i])
        }
        // console.log(this.ordenes)
      })
  }

  public cantidad_cajas
  entero(x,y, i){
    this.cantidad_cajas = Math.ceil(x/y)
    this.cajas_por_id[i] = this.cantidad_cajas
    return Math.ceil(x/y);
  }

  Enterar(x){
    return Math.ceil(x)
  }


  public momentaneos = []
  public listos = []
  seleccionar(i){

    
    // console.log(this.Lotes_encontrados[i].cantidad)

    // (<HTMLInputElement>document.getElementById(i.toString())).checked
    if((<HTMLInputElement>document.getElementById(i.toString())).checked){
      this.sumando = Number(this.sumando) + Number(this.Lotes_encontrados[i].cantidad)
      this.sumando = Number(this.sumando.toFixed(2))
      if(this.Lotes_encontrados[i].material.grupo.nombre == 'Tinta' || this.Lotes_encontrados[i].material.grupo.nombre == 'Pega'){
        if(this.trabajando[1] == 0 && i == 0){
          this.restante[0] = '0';
        }else{
          if(this.trabajando[1] == 0){
            this.restante[`${i}`] = '0'
          }else{
            this.restante[`${this.trabajando[1]}${i}`] = '0';
          }
        }
      }else{

        if(this.Lotes_encontrados[i].material.grupo.nombre == 'Barniz Acuoso' || this.Lotes_encontrados[i].material.grupo.nombre == 'Barniz'){
          if(this.trabajando[1] == 0 && i == 0){
            this.restante[0] = '0';
          }else{
            if(this.trabajando[1] == 0){
              this.restante[`${i}`] = '0'
            }else{
              this.restante[`${this.trabajando[1]}${i}`] = '0';
            }
        }}else{
          if(this.sumando <= this.Total){
            if(this.trabajando[1] == 0 && i == 0){
              this.restante[0] = '0';
            }else{
              if(this.trabajando[1] == 0){
                this.restante[`${i}`] = '0'
              }else{
                this.restante[`${this.trabajando[1]}${i}`] = '0';
              }
            }
          }else{
            if(this.trabajando[1] == 0 && i == 0){
              this.restante[0] = Number(this.sumando) - Number(this.Total);
              // console.log(this.restante[0])
            }else{
              if(this.trabajando[1] == 0){
                this.restante[`${i}`] = Number(this.sumando) - Number(this.Total);
              }else{
                this.restante[`${this.trabajando[1]}${i}`] = Number(this.sumando) - Number(this.Total);
              }
            }
            this.sumando = Number(this.Total)
          }
        }
      }

      let asignado;

      if(this.trabajando[1] == 0 && i == 0){
        asignado = this.Lotes_encontrados[i].cantidad - this.restante[0]
      }else{
        if(this.trabajando[1] == 0){
          asignado = this.Lotes_encontrados[i].cantidad - this.restante[`${i}`]
        }else{
          asignado = this.Lotes_encontrados[i].cantidad - this.restante[`${this.trabajando[1]}${i}`]
        }
      }

      if(this.sumando>=this.Total){
        for(let x=0;x<this.Lotes_encontrados.length;x++){
          if(!(<HTMLInputElement>document.getElementById(x.toString())).checked){
            (<HTMLInputElement>document.getElementById(x.toString())).disabled = true;
          }
        }
      }else{      
        for(let x=0;x<this.Lotes_encontrados.length;x++){
          (<HTMLInputElement>document.getElementById(x.toString())).disabled = false;
        }
      }
      let indice = this.momentaneos.findIndex(x=> x.id === this.Lotes_encontrados[i]._id && x.index === i)
      if(indice < 0){

        let resto
        // console.log(this.trabajando[1],i)
        if(this.trabajando[1] == 0 && i == 0){
          resto = this.restante[0]
          // console.log('aqui')
        }else{
          if(this.trabajando[1] == 0){
            resto = this.restante[`${i}`]
          }else{
            resto = this.restante[`${this.trabajando[1]}${i}`]
          }
          // console.log('aqui')
        }

        // console.log(resto)
        this.momentaneos.push({unidad:this.Lotes_encontrados[i].material.unidad,EA_cantidad:this.Lotes_encontrados[i].cantidad,
          asignado,id:this.Lotes_encontrados[i]._id,codigo:this.Lotes_encontrados[i].codigo,lote:this.Lotes_encontrados[i].lote,marca:this.Lotes_encontrados[i].material.marca,
          material:this.Lotes_encontrados[i].material.nombre,restante:resto,index:i,orden:this.trabajando[0],producto:this.trabajando[1], id_m:this.Lotes_encontrados[i].material._id,
          ancho:this.Lotes_encontrados[i].material.ancho,largo:this.Lotes_encontrados[i].material.largo,calibre:this.Lotes_encontrados[i].material.calibre,gramaje:this.Lotes_encontrados[i].material.gramaje,})
      }
    }else{
      this.sumando = Number(this.sumando) - Number(this.Lotes_encontrados[i].cantidad)
      this.sumando = Number(this.sumando.toFixed(2))
      if(this.sumando < 1){
        this.sumando = 0
      }
      if(this.trabajando[1] == 0 && i == 0){
        this.restante[0] = null
      }else{
        if(this.trabajando[1] == 0){
          this.restante[`${i}`] = null
        }else{
          this.restante[`${this.trabajando[1]}${i}`] = null
        }
      }
      if(this.sumando>=this.Total){
        for(let x=0;x<this.Lotes_encontrados.length;x++){
          if(!(<HTMLInputElement>document.getElementById(x.toString())).checked){
            (<HTMLInputElement>document.getElementById(x.toString())).disabled = true;
          }
        }
      }else{      
        for(let x=0;x<this.Lotes_encontrados.length;x++){
          (<HTMLInputElement>document.getElementById(x.toString())).disabled = false;
        }
      }
    let indice = this.momentaneos.findIndex(x=> x.id === this.Lotes_encontrados[i]._id && x.index === i)
    this.momentaneos.splice(indice, 1)
    }
  }


  AsignarLotes(){
    (<HTMLInputElement>document.getElementById(`${this.trabajando[0]}_${this.trabajando[1]}`)).style.display = 'block';
    this.sumando = 0;
    this.Asignar = false;
    this.material_cubierto++;
    // console.log(this.material_cubierto)
    for(let x=0;x<this.Lotes_encontrados.length;x++){
      (<HTMLInputElement>document.getElementById(x.toString())).disabled = false;
      (<HTMLInputElement>document.getElementById(x.toString())).checked = false;

    }

    let falta = 0;
    let materiales = this.ordenes[this.trabajando[0]].producto.materiales[this.ordenes[this.trabajando[0]].montaje].length


    this.loading_ =true;
    this.Lotes_encontrados = []
  }


  cinta(){
    return Math.ceil(this.cantidad_cinta / 100)
  }


  Combinar(x,y){
    if(x == 0 && y == 0){
      return 0;
    }else{
      if(x == 0){
        return Number(y)
      }else{
        return Number(`${x}${y}`)
      }
    }
  }

  buscarCinta(n){
    this.trabajando = [this.trabajando[0],(this.ordenes[n].producto.materiales[this.ordenes[n].montaje].length)];
    this.Asignar = true
    this.Total = Math.ceil(this.cantidad_cinta / 100)
    this.api.BUSCARCINTA()
      .subscribe((resp:any)=>{
        this.Lotes_encontrados = resp;
        // console.log(this.Lotes_encontrados)
        this.loading_ = false

        let ordenes = this.momentaneos.filter(x => x.orden === this.trabajando[0] && x.producto === this.trabajando[1])
        for(let y=0;y<ordenes.length;y++){
         setTimeout(() => {
           (<HTMLInputElement>document.getElementById(ordenes[y].index.toString())).checked = true;
           this.seleccionar(ordenes[y].index)
         }, 500);
        }
      })
  }

  cerrarModal(){
    this.onCloseModal.emit();
  }

  Finalizar(){
    // console.log(this.momentaneos)

    let tabla = '';
    let materiales = []
    let lotes = []
    let cantidades = []
    let cantidad = []
    let ids = []
    let restantes = []
    let EA_cantidad = []
    let codigos = []
    let producto = []
    for(let i=0; i<this.momentaneos.length;i++){

      let material__;
      if(this.momentaneos[i].ancho){
        material__ = `${this.momentaneos[i].material} ${this.momentaneos[i].gramaje}g Cal:${this.momentaneos[i].calibre} ${this.momentaneos[i].ancho}x${this.momentaneos[i].largo} (${this.momentaneos[i].marca}) - código:${this.momentaneos[i].codigo}`
      }else{
        material__ = `${this.momentaneos[i].material} (${this.momentaneos[i].marca}) - código:${this.momentaneos[i].codigo}`
      }

      tabla = tabla + `
      <tr>
        <td>${material__}</td>
        <td>${this.momentaneos[i].lote}</td>
        <td>${this.momentaneos[i].asignado} ${this.momentaneos[i].unidad}</td>
      </tr>`
    
      materiales.push(material__)
      lotes.push(`${this.momentaneos[i].lote}`)
      codigos.push(`${this.momentaneos[i].codigo}`)
      cantidades.push(`${this.momentaneos[i].asignado} ${this.momentaneos[i].unidad}`)
      cantidad.push(this.momentaneos[i].asignado)
      ids.push(this.momentaneos[i].id)
      restantes.push(this.momentaneos[i].restante)
      EA_cantidad.push(this.momentaneos[i].EA_cantidad)
      producto.push(this.momentaneos[i].id_m)

      let requi:boolean = false;

      if(this.ordenes[this.trabajando[0]].motivo){
        requi = true
      }else{
        requi = false
      }

      if(i == this.momentaneos.length -1){
        let data = {
          tabla,
          materiales,
          lotes,
          cantidades,
          cantidad,
          ids,
          restantes,
          EA_cantidad,
          codigos,
          producto,
          orden:this.ordenes[this.trabajando[0]].sort,
          requi,
          orden_id:this.ordenes[this.trabajando[0]]._id
        }

        this.api.DESCONTARLOTE(data)
          .subscribe((resp:any)=>{
            Swal.fire({
              title:'Asignación exitosa',
              icon:'success',
              text:'Se realizó la asignación de material correctamente',
              toast:true,
              position:'top-end',
              showConfirmButton:false,
              timer:5000,
              timerProgressBar:true
            })
            this.momentaneos = []
            this.BuscarUnaOrden();
            this.buscarRequisicion();
            this.onCloseModal.emit();
          })
      }
    } 



  }

}