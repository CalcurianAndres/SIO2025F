import { Component, OnInit   } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})
export class GestionComponent implements OnInit {



  constructor(private api:RestApiService) { }
  
  public escalas = false;
  public clientes = []
  public carga_clientes:boolean = true

  public nueva_columna_:boolean = false;

  public numero_tintas = 0
  public sustrato = []
  public grupos = []
  public maquinas = []
  public gruposMP = []
  public materiales = []

  public sustrato_selected = ''
  public grupo_selected = ''
  public grupo_selected2 = ''
  public Materiales_Agregados = []
  public material_selected;
  public cantidad_added = 0

  public cantidad_escalas = 0
  public cantidad_desperdicio = 0
  public cantidad_por_escala:number[] = []
  public maquinas_selected:any[] = []

  public ejemplares = 0
  public kilos_tintas = 0

  public precios = {
    sustrato: 0,
    tinta:0,
    maquinas:[]
  }

  

  ngOnInit(): void {
    this.api.GetClientes()
      .subscribe((resp:any)=>{
        this.clientes = resp.clientes
        // console.log(this.clientes)
        this.carga_clientes = false;

      })
  }

  // Se ejecuta cada vez que cambia el input
  onInputChange(event: any, i:number) {
    const value = event.target.value.replace(/\./g, ''); // eliminamos separadores
    this.cantidad_por_escala[i] = Number(value) || 0; // guardamos como número
    event.target.value = this.formatNumber(this.cantidad_por_escala[i]); // mostramos formateado


    this.calcularPreciosMaquina(this.cantidad_por_escala[i], i)
    this.calcularPreciosMateriales(this.cantidad_por_escala[i])
  }

  calculoPrecioSustrato(cantidad:number){
    let hojas_a_usar = (cantidad / this.ejemplares) + this.cantidad_desperdicio;
    let precio_neto =  (this.precios.sustrato * hojas_a_usar);
    return (1000 * precio_neto) / cantidad;
  }

  calcularPrecioTinta(cantidad:number){
    let tinta_a_usar = ((cantidad / this.ejemplares) + this.cantidad_desperdicio) / 1000;
    let kilo_gramos = tinta_a_usar * this.kilos_tintas
    let precio_neto = kilo_gramos * this.precios.tinta  
    return (1000 * precio_neto) / cantidad;
  }

  calcularPreciosMaquina(cantidad: number, i: number) {
    let hojas_a_usar = (cantidad / this.ejemplares) + this.cantidad_desperdicio;
  
    let total = 0;
  
  
    this.maquinas_selected.forEach(maquina => {
      let horas = hojas_a_usar / maquina.cph;
      let precio_neto = maquina.precio * horas;
      total += (1000 * precio_neto) / cantidad; // acumula
      // console.log(maquina.tipo, ' => ', (1000 * precio_neto) / cantidad);
    });
  
    // asignar el total al array precios
    this.precios.maquinas[i] = total;
  
    console.log("Total máquinas => ", total);
  }


  calcularPreciosMateriales(cantidad:number){
    let hojas_a_usar = (cantidad / this.ejemplares) + this.cantidad_desperdicio;
  
    let total = 0;

    this.Materiales_Agregados.forEach(material => {
      let cantidad_ = material.cantidad
      if(this.grupo_selected2 === 'Cajas Corrugadas'){
        console.log(
          material.material.nombre,' => ', Math.ceil(cantidad / cantidad_)
        )
      }else{
        console.log(
          material.material.nombre,' => ', (cantidad_ * (hojas_a_usar / 1000))
        )
      }
    })

  }

  

  formatNumber(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // separador de miles con "."
  }

  calcularPrecioSustrato(){
    let sustrato = this.sustrato.find((s:any) => s._id === this.sustrato_selected)
    if(!sustrato.ultimoPrecio){
      this.precios.sustrato = -1
    }else{
      this.precios.sustrato = sustrato.ultimoPrecio
    }
  }

  add_material() {
    const nuevoMaterial = this.filtrarMateiralPorGrupo()[this.material_selected];
  
    // Verificar si ya existe
    const yaExiste = this.Materiales_Agregados.some(
      item => item.material === nuevoMaterial
    );
  
    if (!yaExiste) {
      this.Materiales_Agregados.push({
        material: nuevoMaterial,
        cantidad: this.cantidad_added
      });
      console.log("Agregado correctamente:", this.Materiales_Agregados);
    } else {
      console.warn("Este material ya fue agregado");
    }
  
    // Reset de campos
    this.material_selected = '';
    this.cantidad_added = 0;
  }
  

  getSustratos(){
    this.api.getAlmacen()
      .subscribe((response:any)=>{
        let sustratos = response.materiales.filter((r:any) => r.grupo.nombre === 'Sustrato')
        this.sustrato = sustratos
      })
  }

  getTintas() {
    this.api.getAlmacen()
      .subscribe((response: any) => {
        let tintas = response.materiales.filter((r: any) => 
          r.grupo?.nombre === 'Tinta' && 
          r.ultimoPrecio !== undefined && 
          r.ultimoPrecio !== 0
        );
  
        if (tintas.length > 0) {
          // Mostrar cada tinta en consola
          tintas.forEach((t: any) => {
            console.log(`Tinta: ${t.nombre} | Último Precio: ${t.ultimoPrecio}`);
          });
  
          // Calcular promedio
          let promedio = tintas.reduce((acc: number, t: any) => acc + t.ultimoPrecio, 0) / tintas.length;
  
          console.log("Promedio último precio tintas:", promedio);
          this.precios.tinta = promedio
        } else {
          console.log("No hay tintas con precio válido");
        }
      });
  }
  

  getGrupos(){
    this.api.getGrupos()
      .subscribe((response:any) => {
        this.grupos = response.grupos
      })
  }

  getMaquinas(){
    this.api.GetMaquinas()
      .subscribe((response:any)=>{
        this.maquinas = response;
      })
  }

  GetGrupoMp(){
    this.api.GetGrupoMp()
      .subscribe((response:any) => {
        this.gruposMP = response.filter(g => g.nombre !== 'Sustrato' && g.nombre !== 'Tinta');
      })
  }

  getMateriales(){
    this.api.getAlmacen()
      .subscribe((response:any) => {
        this.materiales = response.materiales
      })
  }


  filtrarMaquinaPorGrupo(grupo:any){
    return this.maquinas.filter((m:any) => m.tipo === grupo)
  }

  filtrarMateiralPorGrupo(){
    return this.materiales.filter((m:any) => m.grupo.nombre === this.grupo_selected2)
  }



  Confirm(i,n){
    document.getElementById(`Confirm${i}_${n}`).style.display = 'none';
    document.getElementById(`Cantidad${i}_${n}`).style.display = 'none';
    document.getElementById(`Precio${i}_${n}`).style.display = 'none';

    document.getElementById(`Edit${i}_${n}`).style.display = 'block';
    document.getElementById(`Delete${i}_${n}`).style.display = 'block';
    document.getElementById(`cant_${i}_${n}`).style.display = 'block';
    document.getElementById(`precio_${i}_${n}`).style.display = 'block';


    this.api.putIntervalo(this.intervalos[n])
      .subscribe((resp:any)=>{
        return
      })

  }

  Delete(i, n){
    Swal.fire({
      title: '¿Quieres eliminar este intervalo?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Eliminar',
      denyButtonText: `Cancelar`,
      confirmButtonColor:'#48c78e'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.intervalos[n].escalas.splice(i,1)
        this.api.putIntervalo(this.intervalos[n])
        .subscribe((resp:any)=>{
        Swal.fire({title:'Eliminado', icon:'success', showConfirmButton:false})
        })
      } else if (result.isDenied) {
        Swal.fire({title:'Ningun intervalo de la tabla fue modificado', icon:'info', showConfirmButton:false})
      }
    })
  }

  add_columna(n){
    document.getElementById(`nuevaColumna${n}`).style.display = 'block'
  }

  FindDescripcion(e){
    let El_producto = this.productos.find(x=>x._id == this.producto)
    this.Descripcion = false;
    for(let i=0; i<El_producto.materiales[e].length; i++){
      let grupo = El_producto.materiales[e][i].producto.grupo
      if(grupo === '61f92a1f2126d717f004cca6'){
        let descripcion = El_producto.materiales[e][i].producto
        this.desc = `${descripcion.nombre} (${descripcion.marca}) ${descripcion.ancho}x${descripcion.largo} Calibre:${descripcion.calibre} Gramaje:${descripcion.gramaje} Ejemplares:${El_producto.ejemplares[e]}`
      }
    }
  }

  Edit(i, n){

    document.getElementById(`Confirm${i}_${n}`).style.display = 'block';
    document.getElementById(`Cantidad${i}_${n}`).style.display = 'block';
    document.getElementById(`Precio${i}_${n}`).style.display = 'block';

    document.getElementById(`Edit${i}_${n}`).style.display = 'none';
    document.getElementById(`Delete${i}_${n}`).style.display = 'none';
    document.getElementById(`cant_${i}_${n}`).style.display = 'none';
    document.getElementById(`precio_${i}_${n}`).style.display = 'none';

  }

  NumToLet(n){
    switch(n)
    {
        case 0: return "A";
        case 1: return "B";
        case 2: return "C";
        case 3: return "D";
        case 4: return "E";
        case 5: return "F";
        case 6: return "G";
        case 7: return "H";
        case 8: return "I";
    }

  }

  nueva_columna(a,b,n){
    this.intervalos[n].escalas.push({cantidad:a,precio:b})
    document.getElementById(`nuevaColumna${n}`).style.display = 'none'
    this.api.putIntervalo(this.intervalos[n])
        .subscribe((resp:any)=>{
        return
        })
  }

  public consulta_precios:boolean = true;
  consultar_precioss(){
    if(!this.consulta_precios){
      this.consulta_precios = true
    }else{
      this.consulta_precios = false
    }
  }

  public producto_seleccionado:boolean = false
  public montajes = []
  public producto;
  public intervalos;
  select_producto(e){
    
    if(e != '#'){

      if(e === 'all'){
        this.producto_seleccionado = false;
        this.api.GetEscalaByCliente(this.Cliente_selected)
          .subscribe((resp:any)=>{
            this.intervalos = resp
          })

      }else{
      this.producto = e;
      this.montajes = []
      this.producto_seleccionado = true
      let tets = this.productos.find(x=>x._id == e)
      for(let i=0;i<tets.ejemplares.length;i++){
        this.montajes.push(i)
      }
      this.api.getEscala(e)
        .subscribe((resp:any)=>{
          this.intervalos = resp

        })}
    }else{
      this.producto_seleccionado = false
    }
  }

  public newTable:boolean = false
  New_table(){
    if(!this.newTable){
      // console.log('aqui')
      this.newTable = true
    }else{
      this.newTable = false
    }
  }

  cancelarTabla(){
    this.desc = 'Debes seleccionar un montaje'
        this.montaj = [],
        this.escala = [],
        this.producto = '';
        (<HTMLInputElement>document.getElementById('count')).value='';
        (<HTMLInputElement>document.getElementById('price')).value='';
        this.newTable = false;
        this.Descripcion = false;
  }

  new_escala_vesion(){
    let data = {
      descripcion:this.desc,
      montaje:this.montaj,
      escalas:this.escala,
      producto:this.producto,
      cliente:this.Cliente_selected
    }

    this.intervalos.push(data)

    this.api.postEscala(data)
      .subscribe((resp:any)=>{
        this.desc = 'Debes seleccionar un montaje'
        this.montaj = [],
        this.escala = [],
        this.producto = '';
        (<HTMLInputElement>document.getElementById('count')).value='';
        (<HTMLInputElement>document.getElementById('price')).value='';
        this.newTable = false;
        this.Descripcion = false;
        Swal.fire({
          title:'Hecho',
          text:'Se creó nueva tabla en este producto',
          icon:'success',
          showConfirmButton:false
        })
      })
  }

  delete_escalas(i){
    this.escala.splice(i,1)
  }

  public input_precio:boolean = true;
  cantidad(e){
    if(e != ''){
      this.input_precio = false
    }else{
      this.input_precio = true

    }
  }

  public escala = []
  nueva_escala(a,b){
    this.escala.push({cantidad:Number(a),precio:Number(b)})
  }

  public agregar:boolean = true;
  precio(e){
    if(e != ''){
      this.agregar = false
    }else{
      this.agregar = true

    }
  }

  public Descripcion:boolean = false
  public desc = 'Debe seleccionar un montaje';
  public montaj;
  next(a,b){
    if(a && b){
      if(b != '#'){
        this.montaj = b,
        this.Descripcion = true;
      }
    }
  }

  public Ordenes = []
  public carga_ordenes:boolean = true;
  public Cliente_selected;
  select_cliente(e){
    if(e != '#'){
      this.Cliente_selected = e;
      // console.log(this.Cliente_selected)
      this.api.getById(e)
        .subscribe((resp:any)=>{
          this.productos = resp.productos;
          this.carga_ordenes = false;
          // console.log(this.productos)
        })
    }
  }

  public Despachos = []
  public cargar_despachos:boolean = true
  select_orden(e){
    this.Despachos = []
    if(e != '#'){
      this.api.getDespachosbyOrden(e)
        .subscribe((resp:any)=>{


          for(let i=0;i<resp.length;i++){
            for(let x=0;x<resp[i].despacho.length;x++){
              if(resp[i].despacho[x].op === e){
                this.Despachos.push({producto:resp[i].despacho[x].producto,cantidad:resp[i].despacho[x].cantidad})
              }
            }
          }
          // console.log(this.Despachos)
          this.cargar_despachos = false;
        })
    }
  }

  public cargar_previo:boolean = true
  public producto_selected;
  public cantidad_selected;
  public Escala=0
  public PrecioXunidad=0
  Select_Despacho(e){
    if(e != '#'){
      let separado = e.split('*')
      let producto = separado[0]
      let cantidad = separado[1]

      this.producto_selected = producto
      this.cantidad_selected = cantidad
      this.cargar_previo = false;

      this.api.GetOneEscala(producto,{cantidad})
        .subscribe((resp:any)=>{
          this.Escala = resp.Escala[resp.Escala.length-1].cantidad
          this.PrecioXunidad = resp.Escala[resp.Escala.length-1].precio
          resp.MonitorBCV
          let split_dolar = resp.MonitorBCV.split(' ')
          this.tasa = Number(split_dolar[1])
        })
    }else{
      this.cargar_previo = true;
    }
  }

  public cargo_productos:boolean = true;
  public tasa = 0;
  public productos = []
  public Escalas:any
  escalas_modal(){
    if(!this.escalas){
      this.productos = []
      this.Escalas = []
      this.escalas = true;
      this.api.getById(this.Cliente_selected)
        .subscribe((resp:any)=>{
          this.productos = resp.productos;
          // console.log(this.productos)
          this.cargo_productos = false;
          this.api.getEscala(this.Cliente_selected)
            .subscribe((resp:any)=>{
              this.Escalas = resp
            })
        })
    }else{
      this.escalas = false;
      this.cargo_productos = true;
    }
  }


  public Nueva_Escala = false;

  add_escala(x){
    // let index = x.toString()
    document.getElementById(x).style.display = 'block'
    document.getElementById(`table_${x}`).style.display = 'none'
  }

  cancelar_intervalo(x){
    document.getElementById(x).style.display = 'none'
    document.getElementById(`table_${x}`).style.display = 'block'
  }

  NuevoIntervalo(cantidad,precio,producto,i){
    let data = {
      producto,precio,cantidad,cliente:this.Cliente_selected
    }

    this.api.postEscala(data)
      .subscribe((resp:any)=>{
        this.escalas_modal()
        this.escalas_modal()
        this.cancelar_intervalo(i)
      })
  }

  delete_escala(escala){
    Swal.fire({
      title: '¿Quieres eliminar este intervalo de la escala?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: 'Eliminar',
      denyButtonText: `No Eliminar`,
      confirmButtonColor:'#48c78e',
      icon:'question'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.api.DeleteEscala(escala)
          .subscribe((resp:any)=>{
            this.escalas_modal()
            this.escalas_modal()
            Swal.fire({
              title:'Eliminado',
              icon:'success',
              showConfirmButton:false
            })
          })
      } else if (result.isDenied) {
      }
    })
  }

  puntoYcoma(n){
    if(!n){
      return 0
    }
    n = Number(n).toFixed(2)
    return n = new Intl.NumberFormat('de-DE').format(n)
  }

}
