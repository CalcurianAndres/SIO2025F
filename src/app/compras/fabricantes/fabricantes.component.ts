import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from 'src/app/services/rest-api.service';
import { SubirArchivosService } from 'src/app/services/subir-archivos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fabricantes',
  templateUrl: './fabricantes.component.html',
  styleUrls: ['./fabricantes.component.css']
})
export class FabricantesComponent implements OnInit {

  public NuevoFabricante:boolean = false;
  public EditarFabricante:boolean = false;
  public Grupos = [];
  public internacional = false
  public ImgSubir:File
  public imageSrc;
  public proveedor:boolean = false;
  public proveedores = []
  public filas;

  public contacto_n
  public contacto_e
  public contacto_t
  public contacto = []

  public Direccion_proveedor
  public Rif_proveedor

  constructor(private api:RestApiService,
              private fb:FormBuilder,
              private subirArchivo:SubirArchivosService) { }

  ngOnInit(): void {

    this.getGrupos()
    this.BuscarFabricantes()
  }

  FabricacionForm:FormGroup = this.fb.group({
    nombre:['', Validators.required],
    alias:['', Validators.required],
    pais:[''],
    ciudad:[''],
    grupo:['', Validators.required],
    logo:['',],
  });

  Edicion:FormGroup = this.fb.group({
    nombre:['', Validators.required],
    alias:['', Validators.required],
    pais:[''],
    ciudad:[''],
    grupo:['', Validators.required],
    logo:['',],
  });


  getGrupos(){
    this.api.GetGrupoMp()
    .subscribe((resp:any)=>{
      this.Grupos = resp
      // console.log(this.Grupos)
    })
  }

  AgregarContacto(){
    this.contacto.push({nombre:this.contacto_n, email:this.contacto_e, telefono:this.contacto_t})
    this.contacto_n = ''
    this.contacto_e = ''
    this.contacto_t = ''
    // console.log( this.contacto)
  }

  NewFabricacion(){
    
    if(this.FabricacionForm.invalid){
      Swal.fire({
        title:'Debes llenar los campos obligatorios',
        icon:'error',
        showConfirmButton:false,
        toast:true,
        position:'top-end',
        timerProgressBar:true,
        timer:2000
      })

      return
    }

    let data = {
      nombre:this.FabricacionForm.get('nombre').value,
      alias:this.FabricacionForm.get('alias').value,
      origenes:this.Origenes,
      grupo:this.Grupos_,
    }

    if(this.proveedor){
      let info = {
        nombre:this.FabricacionForm.get('nombre').value,
        direccion:this.Direccion_proveedor,
        rif:this.Rif_proveedor,
        grupo:this.Grupos_,
        contactos:this.contacto,
        fabricantes:this.FabricacionForm.get('nombre').value,
      }

      this.api.postProveedor(info)
        .subscribe((resp:any)=>{
          this.subirArchivo.actualizarFoto(this.ImgSubir,'proveedor',resp._id)
        .then(logo => {
          this.ImgSubir = null;
          if(logo){
          document.getElementsByClassName('file-name')[0].innerHTML = 'Sin archivo...';
          // console.log('img',logo)
        }
        });
        })

    }

    if(this.proveedor){
      (<HTMLInputElement>document.getElementById('dp')).checked = false;
        this.proveedor_()
    }

    this.api.postFabricantes(data)
      .subscribe((resp:any)=>{
        Swal.fire({
          title:'Nuevo fabricante',
          text:'Se registro nuevo fabricante',
          icon:'success',
          showConfirmButton:false,
          toast:true,
          position:'top-end',
          timerProgressBar:true,
          timer:2000
        })

        this.subirArchivo.actualizarFoto(this.ImgSubir,'fabricante',resp._id)
        .then(logo => {
          this.BuscarFabricantes()
          this.ImgSubir = null;
          if(logo){
          document.getElementsByClassName('file-name')[0].innerHTML = 'Sin archivo...';
          // console.log('img',logo)
        }
        });
        this.FabricacionForm.get('nombre').setValue('');
        this.Origenes = [];
        this.FabricacionForm.get('grupo').setValue(''),

        this.nuevoFabricante_()
        this.BuscarFabricantes()
      })
  }

  nuevoFabricante_(){
    if(this.NuevoFabricante){
      this.NuevoFabricante = false;
      (<HTMLInputElement>document.getElementById('dp')).checked = false;
      this.proveedor_()
    }else{
      this.NuevoFabricante = true
      this.Grupos_ = []
    }
  }

  origen_(n){
    if(n === 'i'){
      this.internacional = true
    }else{
      this.internacional = false
    }
  }


  CambiarImagen( event:any ){
    this.ImgSubir = (event.target).files[0];
    document.getElementsByClassName('file-name')[0].innerHTML = this.ImgSubir.name;
    // console.log((event.target).files[0])

        const file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = e => this.imageSrc = reader.result;

        reader.readAsDataURL(file);
  }

  CambiarImagenE( event:any ){
    this.ImgSubir = (event.target).files[0];
    document.getElementsByClassName('file-name')[0].innerHTML = this.ImgSubir.name;
    // console.log((event.target).files[0])

        const file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = e => this.imageSrcEdition = reader.result;

        reader.readAsDataURL(file);
  }

  proveedor_(){
    if(this.proveedor){
      this.proveedor = false;
    }else{
      this.proveedor = true;
    }
  }

  BuscarFabricantes(){
    this.api.getFabricantes()
      .subscribe((resp:any)=>{
        this.proveedores = resp;
        this.filas = this.proveedores.length / 4
        this.filas = Math.ceil(this.filas)
        // console.log(this.proveedores)
      })
  }

  public imageSrcEdition;
  public inter:boolean = false;
  public edicion;
  public proveedor__;
  Editar(id){

    this.edicion = id
    if(this.EditarFabricante){
      this.EditarFabricante = false;
      this.EdicionAvailable = false;
      return
    }else{
      this.EditarFabricante = true
    }

    let proveedor = this.proveedores.filter(x=> x._id === id)
    let el_proveedor = proveedor[0]
    this.proveedor__ = el_proveedor;

    

    this.Edicion.get('nombre').setValue(el_proveedor.nombre);
    this.Origenes = el_proveedor.origenes
    this.Edicion.get('grupo').setValue(el_proveedor.grupo._id)
    this.imageSrcEdition = `http://192.168.0.23:8080/api/imagen/fabricante/${el_proveedor.logo}`
    if(el_proveedor.origenes.length > 0){
      this.inter = true;
      this.origen_('i')
    }else if(el_proveedor.origenes.length === 0){
      // console.log(el_proveedor.origenes.length)
      this.inter = false;
      this.origen_('n')
    }
    this.Grupos_ = el_proveedor.grupo
  }

  public Origenes = []
  addPais(){

    let origen = `${this.FabricacionForm.get('pais').value}, ${this.FabricacionForm.get('ciudad').value}`
    this.Origenes.push(origen)

    this.FabricacionForm.get('pais').setValue(''),
    this.FabricacionForm.get('ciudad').setValue('')
  }

  public Grupos_ = []
  addGrupo(e){
    let existe = this.Grupos_.find(x=> x === e)

    if(!existe){
      this.Grupos_.push(e)
      // console.log(this.Grupos_)
    }
  }

  deleteGrupo(n){
    this.Grupos_.splice(n,1)
  }

  addPaisE(){

    let origen = `${this.Edicion.get('pais').value}, ${this.Edicion.get('ciudad').value}`
    this.Origenes.push(origen)

    this.FabricacionForm.get('pais').setValue(''),
    this.FabricacionForm.get('ciudad').setValue('')
  }

  deleteOrigen(i){
    // console.log(i)
    this.Origenes.splice(i, 1)
  }

  EdicionFabricacion(){
    let data = {
      nombre:this.Edicion.get('nombre').value,
      alias:this.Edicion.get('alias').value,
      origenes:this.Origenes,
      grupo:this.Grupos_
    }

    this.api.putFabricantes(this.edicion, data)
      .subscribe((resp:any)=>{
        Swal.fire({
          title:'Se editó exitosamente',
          icon:'success',
          timer:1500,
          showConfirmButton:false,
          timerProgressBar:true,
          toast:true,
          position:'top-end'
        })
        if(this.ImgSubir){
          this.subirArchivo.actualizarFoto(this.ImgSubir,'fabricante',resp._id)
          .then(logo => {
            this.BuscarFabricantes()
            if(logo){
            document.getElementsByClassName('file-name')[0].innerHTML = 'Sin archivo...';
            this.ImgSubir = null;
            // console.log('img',logo)
          }
          });
        }
        this.Editar('x')
      })

  }

  public EdicionAvailable = false;
  HabilitarEdicion(){
    this.EdicionAvailable = true
  }

}

