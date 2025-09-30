import { Component, OnInit } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consulta-orden',
  templateUrl: './consulta-orden.component.html',
  styleUrls: ['./consulta-orden.component.css']
})
export class ConsultaOrdenComponent implements OnInit {

  constructor(private api:RestApiService) { }

  ngOnInit(): void {
    this.GetOrdens()
    this.obtenerClientes()
  }

  public Ordenes = []
  public Orden;
  public selected = false;
  public all_ = true;
  public PRODUCTO = []
  public CLIENTES = []
  public loading = false;
  public Despachos = false;
  public despacho:any = []


  obtenerClientes(){
    this.api.GetClientes()
      .subscribe((resp:any)=>{
        this.CLIENTES = resp.clientes
      })
  }

  GetOrdens(){
    this.api.getOrdenesDeCompra()
      .subscribe((resp:any)=>{
        this.Ordenes = resp
        this.Ordenes.reverse();
        // console.log(this.Ordenes)
      })
  }

  BuscarDespacho(orden_detalle){
    console.log(orden_detalle)
    // Expresión regular para buscar números de orden que siguen el formato 'Nº Orden'
    const regex = /(\d+)\s+por/g;

    // Array para almacenar los números de orden encontrados
    const numerosOrden = [];

    // Buscar coincidencias en el texto usando la expresión regular
    let match;
    while ((match = regex.exec(orden_detalle)) !== null) {
      // El número de orden está en el primer grupo capturado por la expresión regular
      numerosOrden.push(match[1]);
    }

    // Mostrar el resultado
    console.log("Números de orden encontrados:", numerosOrden);

    this.despacho = []
    for(let x=0;x<numerosOrden.length;x++){
      this.api.GetDespachoByOrden(numerosOrden[x])
      .subscribe((resp:any)=>{
        console.log(resp)
        for(let i=0; i<resp.length; i++){
          for(let y=0; y<resp[i].despacho.length; y++){
  
            if(resp[i].despacho[y].op === numerosOrden[x])
            {
              console.log(resp[i].despacho[y].op,'/',numerosOrden[x])
              this.despacho.push(resp[i].despacho[y])
              console.log(this.despacho)
              if(resp[i].despacho[y].parcial){
                this.despacho.push({fecha:resp[i].despacho[y].parcial})
              }else{
                this.despacho.push({fecha:resp[i].fecha})
              }
              // this.despacho = this.despacho + resp[i].despacho[y].cantidad
            }
          }
        }
      })
      if(x == numerosOrden.length -1){
      }
    }

  }

  public CLIENTES_ACTUAL = ''
  filtrarCliente(cliente_id){
    if(cliente_id === '#'){
      this.GetOrdens();
      this.PRODUCTOS = []
      this.all_ = true;
      this.selected = false;
    }else{
      this.GetOrdens();
      this.loading = true;
      setTimeout(() => {
        this.BuscarProductos(cliente_id)
        let filtered = this.Ordenes.filter((x:any)=> x.cliente._id === cliente_id)
        this.Ordenes = filtered;
        this.CLIENTES_ACTUAL = cliente_id;
        this.PRODUCTOS = []
        this.loading = false;
      }, 1000);
    }
  }

  FiltrarPorProducto(e){
    if(e != '#'){
      this.loading = true;
      setTimeout(() => {
        console.log(this.Ordenes)
        let filtered = this.Ordenes.filter((orden: any) => {
          return orden.productos.some((producto: any) => {
            return producto.producto._id === e;
          });
        });
        this.Ordenes = filtered;
        this.loading = false;
      }, 1000);
    }else{
      this.filtrarCliente(this.CLIENTES_ACTUAL)
    }
  }

  MostarOrden(e){
    if(e != 'all'){
      // console.log(e)
      this.all_ = false;
      this.Orden = this.Ordenes[e]
      this.selected = true;
    }else if(e === 'all'){
      this.all_ = true;
    }
  }
  puntoYcoma(n){
    if(!n){
      return 0
    }
    n = Number(n)
    return n = new Intl.NumberFormat('de-DE').format(n)
  }

  BuscarProductos(id){
    this.api.getById(id)
        .subscribe((resp:any)=>{
          this.PRODUCTOS = resp.productos;
          // // // console.log(this.PRODUCTOS)
      })
  }

  public producto__;
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

  public _CANTIDAD = ''
  NuevaCantidad(e){
    this._CANTIDAD = e
  }

  public __Fecha = ''
  Fecha__(e){
    this.__Fecha = e
  }

  public PRODUCTOS = [];
  Edicion(i){
    document.getElementById(`status_${i}`).style.width = '1px';
    document.getElementById(`cantidad_${i}`).style.display = 'none';
    document.getElementById(`fecha_${i}`).style.display = 'none';
    document.getElementById(`edit_${i}`).style.display = 'none';
    // document.getElementById(`dele_${i}`).style.display = 'none';
    document.getElementById(`producto_${i}`).style.display = 'none'
    document.getElementById(`cantidad__${i}`).style.display = 'block';
    document.getElementById(`fecha__${i}`).style.display = 'block';
    document.getElementById(`producto__${i}`).style.display = 'block';
    document.getElementById(`listo_${i}`).style.display = 'block';
    this.api.getById(this.Orden.cliente._id)
      .subscribe((resp:any)=>{
        this.PRODUCTOS = resp.productos
        // console.log(this.PRODUCTOS)
      })
  }

  Terminar( i){
    this.api.putOrdenesDeCompra(this.Orden, this.Orden._id)
      .subscribe((resp:any)=>{
        document.getElementById(`status_${i}`).style.width = '150px';
    document.getElementById(`cantidad_${i}`).style.display = 'block';
    document.getElementById(`fecha_${i}`).style.display = 'block';
    document.getElementById(`edit_${i}`).style.display = 'block';
    // document.getElementById(`dele_${i}`).style.display = 'block';
    document.getElementById(`producto_${i}`).style.display = 'block'
    document.getElementById(`cantidad__${i}`).style.display = 'none';
    document.getElementById(`fecha__${i}`).style.display = 'none';
    document.getElementById(`producto__${i}`).style.display = 'none';
    document.getElementById(`listo_${i}`).style.display = 'none';

    Swal.fire({
      title:'Orden editada con exito!',
      icon:'success',
      showConfirmButton:false,
      timerProgressBar:true,
      toast:true,
      timer:2000,
      position:'top-end'
    })
      })
  }
  
  AgregarNuevo(){
    let id = this.Orden._id
    // console.log(this.Orden)
    this.Orden.productos.push(
      {
        producto:this.PRODUCTO,
        nombre:this.producto__,
        cantidad:this._CANTIDAD,
        fecha:this.__Fecha
      })
      
      this.__Fecha = ''
      this._CANTIDAD = ''
      this.PRODUCTO = []
      this.listoOCEDIT()
      this.GetOrdens()
      setTimeout(()=> {
        let index = this.Ordenes.findIndex(x=> x._id === id)
        this.MostarOrden(index)
      },1000)

  }

  edicionOC(){
    document.getElementById(`EditionForm`).style.display = 'block';
    document.getElementById('addprod').style.display = 'block';
    document.getElementById(`okbutton`).style.display = 'block';
    document.getElementById(`editionButton`).style.display = 'none';
    document.getElementById(`Info__`).style.display = 'none';
    this.api.getById(this.Orden.cliente._id)
      .subscribe((resp:any)=>{
        this.PRODUCTOS = resp.productos
        // console.log(this.PRODUCTOS)
      })
  }

  listoOCEDIT(){
    this.api.putOrdenesDeCompra(this.Orden, this.Orden._id)
      .subscribe((resp:any)=>{
        document.getElementById(`EditionForm`).style.display = 'none';
        document.getElementById('addprod').style.display = 'none';
        document.getElementById(`okbutton`).style.display = 'none';
        document.getElementById(`editionButton`).style.display = 'block';
        document.getElementById(`Info__`).style.display = 'block';
      })

  }

}
