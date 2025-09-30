import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orden-compra',
  templateUrl: './orden-compra.component.html',
  styleUrls: ['./orden-compra.component.css']
})
export class OrdenCompraComponent implements OnInit {

  constructor(private api:RestApiService,
    private route:ActivatedRoute) {
   }
  
  ngOnInit(): void {
    this.obtenerClientes()
  }

  public CLIENTES = []
  obtenerClientes(){
    this.api.GetClientes()
      .subscribe((resp:any)=>{
        this.CLIENTES = resp.clientes
      })
  }


  public PRODUCTOS = []
  public CLIENTE;
  cliente_selected(e){
    this.CLIENTE = e.target.value;
    if(e.target.value != '#')
    {
      this.api.getById(e.target.value)
        .subscribe((resp:any)=>{
          this.PRODUCTOS = resp.productos;
          // // // console.log(this.PRODUCTOS)
      })
    }else{
      this.PRODUCTOS = []
    }
  }

  public PRODUCTO = [];
  public producto__ = ''
  producto_selected(e){
    if(e != '#'){
      this.PRODUCTO = e
      let produc = this.PRODUCTOS.find(x=> x._id == e)
      this.producto__ = produc.producto
      // console.log(produc.producto)
    }else{
      this.PRODUCTO = []
    }
  }

  public ORDEN_COMPRA = ''
  OC(e){
    this.ORDEN_COMPRA = e
  }

  public Fecha_entrega = ''
  date_(e){
    this.Fecha_entrega = e
  }
  public _Fecha_entrega = ''
  date__(e){
    this._Fecha_entrega = e
  }

  public Loaded = false
  datos(){
    this.Loaded = true
  }

  public _CANTIDAD = ''
  NuevaCantidad(e){
    this._CANTIDAD = e
  }

  public __Fecha = ''
  Fecha__(e){
    this.__Fecha = e
  }


  public DATOS = []
  AgregarNuevo(){
    this.DATOS.push(
    {
     producto:this.PRODUCTO,
     nombre:this.producto__,
     cantidad:this._CANTIDAD,
     fecha:this.__Fecha
    })

    this.__Fecha = ''
    this._CANTIDAD = ''
    this.PRODUCTO = []
  }

  Eliminar(i){
    this.DATOS.splice(i,1)
  }

  Editar(i){
    let _i_ = i.toString()
    document.getElementById(`field_c${_i_}`).style.display = 'block';
    document.getElementById(`field_f${_i_}`).style.display = 'block';
    document.getElementById(`dato_c${_i_}`).style.display = 'none';
    document.getElementById(`dato_f${_i_}`).style.display = 'none';
    document.getElementById(`buttons${_i_}`).style.display = 'none'
    document.getElementById(`buttons_${_i_}`).style.display = 'block'
  }

  editarCantidad(e,i){
    this.DATOS[i].cantidad = e
  }

  editarFecha(e,i){
    this.DATOS[i].fecha = e
  }

  FinalizarEdicion(i){
    let _i_ = i.toString()
    document.getElementById(`field_c${_i_}`).style.display = 'none';
    document.getElementById(`field_f${_i_}`).style.display = 'none';
    document.getElementById(`dato_c${_i_}`).style.display = 'block';
    document.getElementById(`dato_f${_i_}`).style.display = 'block';
    document.getElementById(`buttons${_i_}`).style.display = 'block'
    document.getElementById(`buttons_${_i_}`).style.display = 'none'
  }

  nueva_oc() {
    let data = {
      cliente: this.CLIENTE,
      orden: this.ORDEN_COMPRA,
      fecha_entrega: this.Fecha_entrega,
      fecha_recepcion: this._Fecha_entrega,
      productos: this.DATOS
    };
  
    this.api.postOrdenDeCompra(data).subscribe({
      next: (resp: any) => {
        if (!resp.ok) {
          Swal.fire({
            icon: 'error',
            title: 'Orden de compra duplicada',
            text: 'Este número de orden de compra ya se encuentra registrado',
            showConfirmButton: false
          });
          return; // Detenemos la ejecución aquí para evitar el Swal de éxito
        }
  
        // Si la orden se registra correctamente, limpiamos los campos
        this.Loaded = false;
        this.DATOS = [];
        this.CLIENTE = '';
        this.ORDEN_COMPRA = '';
        this.Fecha_entrega = '';
        this._Fecha_entrega = '';
        this.PRODUCTOS = [];
  
        Swal.fire({
          icon: 'success',
          title: 'Hecho',
          text: 'Se registró una nueva orden de compra',
          showConfirmButton: false
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Hubo un problema al registrar la orden de compra',
          showConfirmButton: false
        });
      }
    });
  }
  

}
