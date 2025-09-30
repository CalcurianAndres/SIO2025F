import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-materia-prima',
  templateUrl: './materia-prima.component.html',
  styleUrls: ['./materia-prima.component.css']
})
export class MateriaPrimaComponent implements OnInit {

  constructor(private api:RestApiService,
              private fb:FormBuilder) { }

  ngOnInit(): void {
    this.buscarAlmacen()
    this.BuscarGruposEnAlmacen()
    this.buscar_proveedores()
  }

  public Materiales = []
  public sustrato_modal = false;
  public tinta_modal = false;
  public fuente_modal = false;
  public caja_modal = false;
  public plancha_modal = false;
  public sustrato_selected;
  public tinta_selected;
  public fuente_selected;
  public caja_selected;
  public plancha_selected;
  public Edited_sustrato = false;
  public Edited_fuente = false;
  public Edited_caja = false;
  public Edited_plancha = false;
  public preparacion_tinta = false;
  public test = 25235074
  public Sustrato = []
  public Tintas = []
  public Quimicos = []
  public Cajas = []
  public Planchas = []

  public OTRO:boolean = true;
  public Gs;
  public New_Sustrato = false;
  public New_color = false;
  public caja_ = false

  public NUEVO_PRODUCTO = false;
  public SECCIONES = []

  public _Sustrato = true
  public _Tintas = false
  public _Solucion = false;
  public _Cajas = false;
  public _Plancha = false;

  public proveedores = []
  public proveedores__ = []
  public proveedores_ = []

  InventarioForm:FormGroup = this.fb.group({
    ancho:[''],
    largo:[''],
    gramaje:[''],
    calibre:[''],
    producto:['', Validators.required],
    marca:['',Validators.required],
    presentacion:['', Validators.required],
    unidad:['',Validators.required],
    neto:['', Validators.required],
    color:['Negro',Validators.required],
    cinta:[''],
    proveedor:['',Validators.required],
    // codigo:['',Validators.required],
    // cantidad:['', Validators.required],
    // lote:['', Validators.required],
    NewControl:['']
  });

  buscar_proveedores(){
    this.api.getFabricantes()
      .subscribe((resp:any) => {
        this.proveedores = resp;
      })
  }

  Sustrato__(){
    this._Sustrato = true;
    this._Tintas = false;
    this._Solucion = false;
    this._Cajas = false;
    this._Plancha = false;
  }

  Tintas__(){
    this._Plancha = false;
    this._Cajas = false;
    this._Solucion = false;
    this._Sustrato = false;
    this._Tintas = true;
  }

  Solucion__(){
    this._Solucion = true;
    this._Sustrato = false;
    this._Tintas = false;
    this._Cajas = false;
    this._Plancha = false;
  }

  Cajas__(){
    this._Solucion = false;
    this._Sustrato = false;
    this._Tintas = false;
    this._Plancha = false;
    this._Cajas = true;
  }

  Plancha__(){
    this._Solucion = false;
    this._Sustrato = false;
    this._Tintas = false;
    this._Cajas = false;
    this._Plancha = true;
  }

  BuscarGruposEnAlmacen(){
    this.api.GetGrupoMp()
      .subscribe((resp:any)=>{
        this.SECCIONES = resp
      })
  }

  public Modal_Almacen(){
    if(this.NUEVO_PRODUCTO){
      this.NUEVO_PRODUCTO = false;
    }else{
      this.NUEVO_PRODUCTO = true;
    }
  }

  buscarAlmacen(){
    this.api.getMateriaPrima()
    .subscribe((resp:any)=>{
      this.Materiales = resp
      for(let i=0;i<this.Materiales.length;i++){
        if(this.Materiales[i].grupo.nombre === 'Sustrato'){
          let existe = this.Sustrato.find(x=>x.nombre === this.Materiales[i].nombre && x.marca === this.Materiales[i].marca && x.calibre === this.Materiales[i].calibre && x.gramaje === this.Materiales[i].gramaje)
          if(!existe){
            this.Sustrato.push(this.Materiales[i])
          }
        }
        if(this.Materiales[i].grupo.nombre === 'Tinta'){
          let existe = this.Tintas.find(x=>x.nombre === this.Materiales[i].nombre && x.marca === this.Materiales[i].marca )
          if(!existe){
            this.Tintas.push(this.Materiales[i])
          }
        }
        if(this.Materiales[i].grupo.nombre === 'Quimicos'){
          let existe = this.Quimicos.find(x=>x.nombre === this.Materiales[i].nombre && x.marca === this.Materiales[i].marca )
          // console.log(existe)
          if(!existe){
            this.Quimicos.push(this.Materiales[i])
            // console.log(this.Quimicos)
          }
        }
        if(this.Materiales[i].grupo.nombre === 'Cajas Corrugadas'){
          let existe = this.Cajas.find(x=>x.nombre === this.Materiales[i].nombre)
          // console.log(existe)
          if(!existe){
            this.Cajas.push(this.Materiales[i])
            // console.log(this.Cajas)
          }
        }
        if(this.Materiales[i].grupo.nombre === 'Otros materiales'){
          let existe = this.Planchas.find(x=>x.nombre === this.Materiales[i].nombre)
          // console.log(existe)
          if(!existe){
            this.Planchas.push(this.Materiales[i])
            // console.log(this.Cajas)
          }
        }
      }
    })
  }


  Cambio_opciones(e){
    if(e === 'otros'){
      this.OTRO = true
    }else{
      this.OTRO = false;
      this.Gs = e;
    }

    if(e === '61f92a1f2126d717f004cca6'){
      this.New_Sustrato = true;
    }else{
      this.New_Sustrato = false;
    }

    if(e === '61fd54e2d9115415a4416f17'){
      this.New_color = true;
    }else{
      this.New_color = false;
    }

    if(e === '61fd7a8ed9115415a4416f74'){
      this.caja_ = true;
    }else{
      this.caja_ = false
    }

  }

  public cuidad
  origenes__(e){
    this.cuidad = e;
    this.InventarioForm.get('marca').setValue(`${this.proveedor} (${this.cuidad})`);
    // console.log(this.cuidad)
  }
  
  public exist_origenes = false;;
  public origenes;
  public proveedor;
  
  addProveedor(e){
    
    let one = this.proveedores.filter(x=>x._id === e)
    // console.log(one[0].origenes)
    if(one[0].origenes.length >0 && this.New_Sustrato){
      this.exist_origenes = true;
      this.origenes = one[0].origenes
    }else{
      this.exist_origenes = false;
    }

    this.proveedor = one[0].alias
    this.proveedores__.push(one[0].nombre)
    this.proveedores_.push(one[0]._id)

    if(!this.exist_origenes){
      this.InventarioForm.get('marca').setValue(this.proveedor);
    }

    // console.log(this.proveedores__)
    
  }

  define_color(e){
    if(e != 'Pantone'){
      this.InventarioForm.get('color').setValue(e);
      (<HTMLInputElement>document.getElementById('color')).value = e;
    }else{
      (<HTMLInputElement>document.getElementById('color')).value = '';
      (<HTMLInputElement>document.getElementById('color')).disabled = false;
    }
  }


  Almacenar(){

    this.cuidad = null;
    this.exist_origenes = false;;
    this.origenes = null;
    this.proveedor = [];

    let grupo;

    if(this.OTRO){
    grupo = this.InventarioForm.get('NewControl').value
    }
    else{
      grupo = this.Gs;
    }


    const data = {
      producto: this.InventarioForm.get('producto').value,
      marca:this.InventarioForm.get('marca').value,

      ancho:this.InventarioForm.get('ancho').value,
      largo:this.InventarioForm.get('largo').value,
      gramaje:this.InventarioForm.get('gramaje').value,
      calibre:this.InventarioForm.get('calibre').value,


      // cantidad: this.InventarioForm.get('cantidad').value,
      unidad: this.InventarioForm.get('unidad').value,
      presentacion: this.InventarioForm.get('presentacion').value,
      neto: this.InventarioForm.get('neto').value,
      color:this.InventarioForm.get('color').value,
      // codigo: this.InventarioForm.get('codigo').value,
      // lote: this.InventarioForm.get('lote').value,
      cinta:this.InventarioForm.get('cinta').value,
      proveedor:this.proveedores_,
      grupo,
      nuevo:this.OTRO

    }

    // // // console.log(this.InventarioForm.get('color').value)

    if(this.InventarioForm.invalid){
      return
    }



    this.api.PostMateriaPrima(data)
     .subscribe(resp=>{
        this.InventarioForm.reset();
        this.buscarAlmacen();
        this.Modal_Almacen();
        Swal.fire({
          title:'Nueva materia prima registrada',
          icon:'success',
          text:'Se registró nueva materia prima en materiales registrados',
          timer:2000,
          showConfirmButton:false,
          timerProgressBar:true
        })

        this.proveedores__ = []
        this.proveedores_ = []
        // this.getSustratos();
      })

   }

   modal_fuentes(producto){
    if(this.fuente_modal){
      this.fuente_modal = false
      return
    }

    this.fuente_modal = true
    this.fuente_selected = this.Materiales.find(x=> x._id === producto)
    // console.log(this.fuente_selected)
  }

  modal_caja(producto){
    if(this.caja_modal){
      this.caja_modal = false
      return
    }
    this.caja_modal = true
    this.caja_selected = this.Materiales.find(x=> x._id === producto)
    // console.log(this.caja_selected)

  }

  modal_plancha(producto){
    if(this.plancha_modal){
      this.plancha_modal = false
      return
    }

    this.plancha_modal = true
    this.plancha_selected = this.Materiales.find(x=> x._id === producto)
    // console.log(this.plancha_selected)
  }

  editar_plancha(){
    this.Edited_plancha = true;
  }

  finalizar_edicion_plancha(){
    this.Edited_plancha = false;

    let info = {
      data:{
        teq:this.plancha_selected.teq,
      },
      info:{nombre:this.plancha_selected.nombre, marca:this.plancha_selected.marca}
    }

    this.api.updateManyMateriales(this.plancha_selected._id, info)
      .subscribe((resp:any)=>{
        // console.log('done')
      })
  }

  editar_caja(){
    this.Edited_caja = true;
  }

  finalizar_edicion_caja(){
    this.Edited_caja = false;

    let info = {
      data:{
        descripcion:this.caja_selected.descripcion,
        tipo:this.caja_selected.tipo,
        ECT:this.caja_selected.ECT,
      },
      info:{nombre:this.caja_selected.nombre}
    }

    this.api.updateManyMateriales(this.caja_selected._id, info)
      .subscribe((resp:any)=>{
        // console.log('done')
      })

  }

  
  editar_fuente(){
    this.Edited_fuente = true;
  }
  finalizar_edicion_fuente(){
    this.Edited_fuente = false;

    let info = {
      data:{
        chemical:this.fuente_selected.chemical,
        ph:this.fuente_selected.ph,
        conductividad:this.fuente_selected.conductividad,
      },
      info:{nombre:this.fuente_selected.nombre, marca:this.fuente_selected.marca, calibre:this.fuente_selected.calibre, gramaje:this.fuente_selected.gramaje}
    }

    this.api.updateManyMateriales(this.fuente_selected._id, info)
      .subscribe((resp:any)=>{
        // console.log('done')
      })
  }

  modal_sustrato(producto){
    if(this.sustrato_modal){
      this.sustrato_modal = false
      return
    }

    this.sustrato_modal = true
    this.sustrato_selected = this.Materiales.find(x=> x._id === producto)
    // console.log(this.sustrato_selected)
  }


  editar_sustrato(){
    this.Edited_sustrato = true;
  }

  finalizar_sustrato(){

    let info = {
      data:{gramaje_e:[this.sustrato_selected.gramaje_e[0],this.sustrato_selected.gramaje_e[1],this.sustrato_selected.gramaje_e[2]],
        calibre_e:[this.sustrato_selected.calibre_e[0],this.sustrato_selected.calibre_e[1],this.sustrato_selected.calibre_e[2],this.sustrato_selected.calibre_e[3],this.sustrato_selected.calibre_e[4],this.sustrato_selected.calibre_e[5],this.sustrato_selected.calibre_e[6],this.sustrato_selected.calibre_e[7],this.sustrato_selected.calibre_e[8]],
        cobb:[this.sustrato_selected.cobb[0],this.sustrato_selected.cobb[1],this.sustrato_selected.cobb[2],this.sustrato_selected.cobb[3],this.sustrato_selected.cobb[4],this.sustrato_selected.cobb[5]],
        curling:[this.sustrato_selected.curling[0],this.sustrato_selected.curling[1],this.sustrato_selected.curling[2]],
        blancura:[this.sustrato_selected.blancura[0],this.sustrato_selected.blancura[1],this.sustrato_selected.blancura[2]]},
      info:{nombre:this.sustrato_selected.nombre, marca:this.sustrato_selected.marca, calibre:this.sustrato_selected.calibre, gramaje:this.sustrato_selected.gramaje}
    }

    this.Edited_sustrato = false;
    this.api.putMateriaPrima(this.sustrato_selected._id, info)
      .subscribe((resp:any)=>{
        // console.log('done')
      })
  }


  modal_tintas(producto){
    if(this.tinta_modal){
      this.tinta_modal = false
      return
    }

    this.tinta_modal = true
    this.tinta_selected = this.Materiales.find(x=> x._id === producto)

  }

  modal_tintas_(producto){
    if(this.preparacion_tinta){
      this.preparacion_tinta = false
      return
    }
    this.preparacion_tinta = true;
    this.tinta_selected = this.Materiales.find(x=> x._id === producto)
    this.preparacion_pendiente = this.tinta_selected.preparacion
    // console.log(this.preparacion_pendiente)
  }

  delete_formula(i){
    // console.log(i)
    this.preparacion_pendiente.splice(i,1)
  }

  public preparacion_pendiente = []
  agregar_preparacion(producto,cantidad){

    let nombre = this.Materiales.find(x=> x._id === producto)

    this.preparacion_pendiente.push({nombre:`${nombre.nombre} (${nombre.marca})`,id:nombre._id,cantidad})


    // // console.log( this.preparacion_pendiente)

  }

  Finalizar_formula(id){
    let preparacion = this.preparacion_pendiente;
    this.preparacion_pendiente = [];
    // console.log(id, preparacion)

    this.api.putAgregarformula(id, preparacion)
      .subscribe((resp:any)=>{
        // console.log(resp)
        Swal.fire({
          icon:'success',
          title:'Preparación actualizada',
          text:`Se actualizó la lista de tinta necesaria para la preparación de: ${resp.nombre} (${resp.color})`,
          showConfirmButton:false,
          timer:3000,
          timerProgressBar:true
        })

        this.modal_tintas_('x')
      })
  }

}
