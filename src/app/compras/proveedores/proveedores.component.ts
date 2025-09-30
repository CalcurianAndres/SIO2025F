import { Component, OnInit } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import { SubirArchivosService } from 'src/app/services/subir-archivos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit {

  public imageSrc;
  public ImgSubir:File;
  public Grupos = []
  public Grupos_ = []

  public contacto_n = ''
  public contacto_e = ''
  public contacto_t = ''
  public contacto = []

  public fabricantes;
  public filas;

  public NuevoProveedor = false;

  public Razon_social;
  public Direccion;
  public rif;

  public Proveedores

  public EdicionProductos = false;

  public  AvailableEdition = false;

  constructor(private api:RestApiService,
    private subirArchivo:SubirArchivosService) { }

  ngOnInit(): void {
    this.getGrupos()
    this.BuscarFabricantes()
    this.getProveedores_()
  }


  getProveedores_(){
    this.api.GetProveedores()
      .subscribe((resp:any)=>{
        this.Proveedores = resp
        this.filas = this.Proveedores.length / 4
        this.filas = Math.ceil(this.filas)
        // console.log(this.filas)
      })
  }

  origen_(n){
    // console.log(n)
  }

  nuevoProveedor_(){
    if(!this.NuevoProveedor){
      this.NuevoProveedor = true
    }else{
      this.NuevoProveedor = false;
    }
  }

  getGrupos(){
    this.api.GetGrupoMp()
    .subscribe((resp:any)=>{
      this.Grupos = resp
      // console.log(this.Grupos)
    })
  }

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
  
  CambiarImagen(event:any){
    this.ImgSubir = (event.target).files[0];
    document.getElementsByClassName('file-name')[0].innerHTML = this.ImgSubir.name;
    // console.log((event.target).files[0])

        const file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = e => this.imageSrc = reader.result;

        reader.readAsDataURL(file);
  }

  AgregarContacto(){
    this.contacto.push({nombre:this.contacto_n, email:this.contacto_e, telefono:this.contacto_t})
    this.contacto_n = ''
    this.contacto_e = ''
    this.contacto_t = ''
    // console.log( this.contacto)
  }

  deleteContacto(i){
    this.contacto.splice(i,1)
  }

  BuscarFabricantes(){
    this.api.getFabricantes()
      .subscribe((resp:any)=>{
        this.fabricantes = resp;
      })
  }

  public Fabricantes__ = []
  addFabricante(e){
    let existe = this.Fabricantes__.find(x=> x === e)

    if(!existe){
      this.Fabricantes__.push(e)
    }
  }

  deleteFabricante(i){
    this.Fabricantes__.splice(i,1)
  }


  FinalizarProveedor(){
    let data = {
      nombre:this.Razon_social,
      direccion:this.Direccion,
      rif:this.rif,
      grupo:this.Grupos_,
      contactos:this.contacto,
      fabricantes:this.Fabricantes__,      
    }


    // console.log(data)

    this.api.postProveedor(data)
      .subscribe((resp:any)=>{

        Swal.fire({
          title:'Nuevo proveedor',
          text:'Se registro nuevo proveedor',
          icon:'success',
          showConfirmButton:false,
          toast:true,
          position:'top-end',
          timerProgressBar:true,
          timer:2000
        })



        this.subirArchivo.actualizarFoto(this.ImgSubir,'proveedor',resp._id)
        .then(logo => {
          this.getProveedores_()
          this.ImgSubir = null;
          if(logo){
          document.getElementsByClassName('file-name')[0].innerHTML = 'Sin archivo...';
          // console.log('img',logo)
        }
        });

        this.nuevoProveedor_()
        this.getProveedores_()
        this.Razon_social = ''
        this.Direccion = ''
        this.rif = ''
        this.Grupos_ = []
        this.contacto = []
        this.Fabricantes__ = []
      })
  }


  public id_proveedor;
  Editar(id){
    if(this.EdicionProductos){
      this.EdicionProductos = false;
      this.AvailableEdition = false;
      return
    }else{
      this.EdicionProductos = true
    }
    let proveedor = this.Proveedores.filter(x=> x._id === id)

    let el_proveedor = proveedor[0];
    this.id_proveedor = id
    this.Razon_social = el_proveedor.nombre
    this.Direccion = el_proveedor.direccion
    this.rif = el_proveedor.rif
    this.Grupos_ = el_proveedor.grupo
    this.contacto = el_proveedor.contactos
    this.Fabricantes__ = el_proveedor.fabricantes
    this.imageSrc = `http://192.168.0.23:8080/api/imagen/proveedor/${el_proveedor.logo}`

  }

  EdicionProvedor(){
    this.AvailableEdition = true;
  }


  FinalizarEdicion(){
    let data = {
      nombre:this.Razon_social,
      direccion:this.Direccion,
      rif:this.rif,
      grupo:this.Grupos_,
      contactos:this.contacto,
      fabricantes:this.Fabricantes__,      
    }

    // console.log(this.ImgSubir)
    this.api.putProveedores(this.id_proveedor, data)
      .subscribe((resp:any)=>{
        this.AvailableEdition = false;
        Swal.fire({
          title:'Se editó existosamente',
          icon:'success',
          timer:1500,
          showConfirmButton:false,
          timerProgressBar:true,
          toast:true,
          position:'top-end'
        })
        if(this.ImgSubir){
          this.subirArchivo.actualizarFoto(this.ImgSubir,'proveedor',resp._id)
          .then(logo => {
            this.getProveedores_()
            if(logo){
            document.getElementsByClassName('file-name')[0].innerHTML = 'Sin archivo...';
            this.ImgSubir = null;
            // console.log('img',logo)
          }
          });
        }
      })
  }
  

}
