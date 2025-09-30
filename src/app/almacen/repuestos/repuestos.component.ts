import { Component, OnInit } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-repuestos',
  templateUrl: './repuestos.component.html',
  styleUrls: ['./repuestos.component.css']
})
export class RepuestosComponent implements OnInit {

  constructor(public api:RestApiService) { }

  public Maquinas
  public Categoria = false;
  public Categorias = [];
  public Repuesto = false;
  public Repuestos = []
  public Almacen = false;
  public Almacenes = [];

  public Mostrar_registro = false;

  public equis = [];
  public ye = [];
  public edicion = false;
  public notas = false;
  public editar_nota = false;

  public data = {
    _id : '',
    nota:''

  }

  public nuevoMaterial = {
    maquina: '',
    categoria: '',
    nombre: '',
    parte:'',
    foto:''
  }
  public Almacen__ = {
    maquina : '',
    categoria: '',
    repuesto: '',
    fecha:'',
    proveedor:'',
    factura:'',
    precio:'',
    ubicacion:'',
    cantidad: 0
  }

  filteredParts: string[] = [];
  filteredParts2: string[] = [];
  public search = false
  public showImage = false
  public showImage2 = false


  ngOnInit(): void {
    this.buscarMaquinas();
    this.buscarCategorias();
    this.buscarRepuestos();
    this.buscarPiezas();
  }

  filterParts(searchTerm: string) {
    this.filteredParts = this.Repuestos.filter(part => part.parte.toLowerCase().includes(searchTerm.toLowerCase()) || part.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  filterParts2(searchTerm: string) {
    this.filteredParts2 = this.Almacenes.filter(part => part.repuesto.parte.toLowerCase().includes(searchTerm.toLowerCase()) || part.repuesto.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  scrollTo(parte){
    const element = document.getElementById(parte);

    // If the element exists, scroll to it
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      element.classList.add('blink');
    }
  }

  verNotas(notas){
    this.notas = true;
    this.data._id = notas._id;
    this.data.nota = notas.nota;
  }

  actualizarNota(){
    // console.log(this.data);
    
    this.api.putPieza(this.data, this.data._id)
      .subscribe((resp:any)=>{
        // console.log(resp)
      })
  }

  NuevaPieza(){
    this.Almacen = true;
    this.Almacen__ = {
    maquina : '',
    categoria: '',
    repuesto: '',
    fecha:'',
    proveedor:'',
    factura:'',
    precio:'',
    ubicacion:'',
    cantidad: 0
  } 
  }


  cerrarRegistro(){
    this.Repuesto = false;
    this.edicion = false
  }
  

  editar(repuesto){
    this.nuevoMaterial = repuesto;
    this.edicion = true;
    this.Repuesto = true;
  }

  editarPieza(pieza){
    this.Almacen__ = pieza;
    this.edicion = true;
    this.Almacen = true;
  }

  showInfo(x,y){
    if(this.equis[x] && this.ye[y]){
      this.equis[x] = false;
      this.ye[y] = false
    }else{
      this.equis[x] = true;
      this.ye[y] = true
    }
  }

  changeBeta(){
    if(this.Mostrar_registro){
      this.Mostrar_registro = false
    }else{
      this.Mostrar_registro = true
    }
  }

  ordenarPorNombre(matriz, propiedad) {
    // Comparar dos objetos en función de la propiedad especificada
    const comparar = (a, b) => {
      if (a[propiedad] < b[propiedad]) {
        return -1;
      } else if (a[propiedad] > b[propiedad]) {
        return 1;
      } else {
        return 0;
      }
    };
  
    // Ordenar la matriz utilizando la función de comparación
    return matriz.sort(comparar);
  }

  buscarPiezas(){
    this.api.getpieza()
      .subscribe((resp:any) =>{
        this.Almacenes = resp.pieza
      })
  }

  buscarRepuestos(){
    this.api.getRepuesto()
        .subscribe((resp:any)=>{
          this.Repuestos = resp.repuesto;

          const comparar = (a, b) => {
            if (a['nombre'] < b['nombre']) {
              return -1;
            } else if (a['nombre'] > b['nombre']) {
              return 1;
            } else {
              return 0;
            }
          };
  
          this.Repuestos = this.Repuestos.sort(comparar)
        })
  }

  buscarCategorias(){
    this.api.getCategorias()
        .subscribe((resp:any)=>{
          this.Categorias = resp.categorias;
          
        })
  }

  onMouseMove(event: MouseEvent) {
    const img = event.target as HTMLImageElement;
    const x = (100 * event.offsetX / img.offsetWidth) + '%';
    const y = (100 * event.offsetY / img.offsetHeight) + '%';
    img.style.setProperty('--x', x);
    img.style.setProperty('--y', y);
  }
  // Function to display an image using SweetAlert2 library
public foto = ''
  verImagen(foto, nombre, n?) {

  
  if(n){
    this.showImage = true
  }else{
    this.showImage2 = true
  }

  // Check if the 'foto' variable is empty or undefined
  if (!foto) {
    // If empty, assign a default 'no-image' value to 'foto'
    this.foto = 'http://192.168.0.23:8080/api/imagen/repuestos/no-image';
  }else{
    this.foto = `http://192.168.0.23:8080/api/imagen/repuestos/${foto}`
  }

  // Use SweetAlert2 to display the image
  // Swal.fire({
  //   title: nombre, // Set the title of the dialog
  //   imageUrl: `http://192.168.0.23:8080/api/imagen/repuestos/${foto}`, // Specify the URL of the image
  //   imageWidth: 400, // Set the width of the image in pixels
  //   imageAlt: nombre, // Set the alternative text for the image
  //   showConfirmButton: false // Hide the confirmation button
  // });
}

  buscarMaquinas(){
    this.api.GetMaquinas()
      .subscribe((resp:any)=>{
        this.Maquinas = resp;
        const maquinas = this.Maquinas;
        const maquinasUnicas = maquinas.reduce((acc, maquina) => {
        if (!acc.find((m) => m.nombre === maquina.nombre)) {
          acc.push(maquina);
        }
        return acc;
        }, []);
          this.Maquinas = maquinasUnicas;
      })
  }

  AbrirCategorias(){
    
    this.Categoria = true
    // console.log(this.Categoria);
  }

  NuevoRepuesto(){
    this.nuevoMaterial = {
      maquina: '',
      categoria: '',
      nombre: '',
      parte:'',
      foto:''
    }
    this.Repuesto = true;
    this.buscarMaquinas();
    this.buscarCategorias();
    this.buscarRepuestos();
  }

  hasMatchingRepuesto(maquinaId: string, categoriaId: string): boolean {
    return this.Repuestos.some(repuesto => repuesto.maquina == maquinaId && repuesto.categoria == categoriaId);
  }

  hasMatchingRepuesto2(maquinaId: string, categoriaId: string): boolean {
    return this.Almacenes.some(repuesto => repuesto.maquina == maquinaId && repuesto.categoria == categoriaId);
  }

  cerrarPiezas(){
    this.Almacen = false;
    this.edicion = false;
    this.buscarMaquinas();
    this.buscarCategorias();
    this.buscarRepuestos();
  }
  

}
