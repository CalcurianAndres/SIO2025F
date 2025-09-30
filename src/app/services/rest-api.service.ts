import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { MaquinaInterface } from '../interface/maquinas.interfase';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Usuario } from '../models/usuario.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RestApiService {


  api_url = environment.api;

  constructor(public http: HttpClient,
    private router: Router) { }

  public usuario!: Usuario;

  get token(): string {
    return localStorage.getItem('token') || '';
  }
  get token_two(): string {
    return localStorage.getItem('token_two') || '';
  }
  get headers2() {
    return {
      'Authorization': this.token_two
    }
  }
  get headers() {
    return {
      'Authorization': this.token
    }
  }

  // **************************************************************************
  // **************************** MAQUINAS ************************************
  // ************************************************************************** 

  GetMaquinas() {
    const url = `${this.api_url}/maquinas`
    return this.http.get<MaquinaInterface[]>(url)
  }

  PostMaquinas(data: MaquinaInterface) {
    const url = `${this.api_url}/maquinas`
    return this.http.post<MaquinaInterface>(url, data)
  }

  DeleteMaquinas(id) {
    const url = `${this.api_url}/maquinas/${id}`
    return this.http.delete(url)
  }


  // **************************************************************************
  // **************************** GRUPOS **************************************
  // **************************************************************************

  getGrupos() {
    const url = `${this.api_url}/grupos`
    return this.http.get(url)
  }

  PostGrupos(data: any) {
    const url = `${this.api_url}/grupos`
    return this.http.post(url, data)
  }

  // ****************************************************************************
  // **************************** CLIENTES **************************************
  // ****************************************************************************

  GetClientes() {
    const url = `${this.api_url}/clientes`
    return this.http.get(url)
  }

  PostClientes(data) {
    const url = `${this.api_url}/clientes`
    return this.http.post(url, data)
  }

  // ****************************************************************************
  // **************************** Almacen ***************************************
  // ****************************************************************************


  getAlmacen() {
    const url = `${this.api_url}/materiales`
    return this.http.get(url)
  }

  getAlmacen_() {
    const url = `${this.api_url}/almacenado-final`
    return this.http.get(url)
  }

  GetGrupoMp() {
    const url = `${this.api_url}/tipo-materia-prima`
    return this.http.get(url)
  }

  PostAlmacen(data) {
    const url = `${this.api_url}/nuevo-material`
    return this.http.post(url, data)
  }

  // ****************************************************************************
  // **************************** Productos *************************************
  // ****************************************************************************

  postProducto(data) {
    const url = `${this.api_url}/nuevo-producto`
    return this.http.post(url, data)
  }

  getById(id) {
    const url = `${this.api_url}/productos/${id}`
    return this.http.get(url)
  }

  getOneById(id) {
    const url = `${this.api_url}/producto/${id}`
    return this.http.get(url)
  }


  getFechas(id) {
    const url = `${this.api_url}/trabajos/${id}`
    return this.http.get(url);
  }

  postOrden(data) {
    const url = `${this.api_url}/orden`
    return this.http.post(url, data)
  }
  postOrden2(data) {
    const url = `${this.api_url}/trabajos`
    return this.http.post(url, data)
  }
  getOrdenById(id) {
    const url = `${this.api_url}/orden/${id}`
    return this.http.get(url);
  }
  getOrden() {
    const url = `${this.api_url}/orden`
    return this.http.get(url);
  }

  getTrabajos() {
    const url = `${this.api_url}/trabajos`
    return this.http.get(url);
  }

  getEstado(id: any) {
    const url = `${this.api_url}/orden/etapa/${id}`
    return this.http.get(url);
  }

  getInfToday(fecha: any) {
    const url = `${this.api_url}/gestion`
    return this.http.post(url, fecha)
  }

  postGestion(data) {
    const url = `${this.api_url}/gestiones`
    return this.http.post(url, data)
  }

  getGestiones() {
    const url = `${this.api_url}/gestiones`
    return this.http.get(url);
  }

  getGestionesByOp(op_id) {
    const url = `${this.api_url}/gestiones/${op_id}`
    return this.http.get(url);
  }
  postRestrasar(data) {
    const url = `${this.api_url}/trabajos/retrasar`
    return this.http.post(url, data)
  }
  postAcelerar(data) {
    const url = `${this.api_url}/trabajos/acelerar`
    return this.http.post(url, data)
  }

  postNuevaBobina(data) {
    const url = `${this.api_url}/bobina`
    return this.http.post(url, data)
  }
  deleteBobina(data) {
    const url = `${this.api_url}/bobina-delete`
    return this.http.post(url, data)
  }

  getBobina() {
    const url = `${this.api_url}/bobina`
    return this.http.get(url)
  }

  postNuevoSustrato(data) {
    const url = `${this.api_url}/sustrato`
    return this.http.post(url, data)
  }

  getSustratos() {
    const url = `${this.api_url}/sustrato`
    return this.http.get(url)
  }

  getConversiones() {
    const url = `${this.api_url}/conversiones`
    return this.http.get(url)
  }

  Login(data) {
    const url = `${this.api_url}/login`
    return this.http.post(url, data)
  }

  validarToken(): Observable<boolean> {


    return this.http.get(`${this.api_url}/renew`, {
      headers: this.headers
    }).pipe(
      tap((resp: any) => {

        const { estado, _id, Nombre, Apellido, Correo, Departamento, Role, Nueva_orden, Consulta, Almacen, Maquinaria, Planificacion, Gestiones, Despacho, Estadisticas, Precios, pin, laboratorio } = resp.usuario;

        this.usuario = new Usuario(estado, _id, Nombre, Apellido, Correo, Departamento, Role, Nueva_orden, Consulta, Almacen, Maquinaria, Planificacion, Gestiones, Despacho, Estadisticas, Precios, pin, laboratorio);
        localStorage.setItem('token', resp.token);
        localStorage.setItem('menu', JSON.stringify(resp.menu));
      }),
      map(resp => true),
      catchError(error => of(false))
    )

  }

  ValidarVerificacion(): Observable<boolean> {
    return this.http.get(`${this.api_url}/renew2`, {
      headers: this.headers2
    }).pipe(
      tap((resp: any) => {
        localStorage.setItem('token_two', resp.token_two);
        localStorage.setItem('menu', JSON.stringify(resp.menu));
      }),
      map(resp => true),
      catchError(error => of(false))
    )
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('token_two');
    localStorage.removeItem('menu');
    this.router.navigateByUrl('login');
  }

  getMaterialesPorConfirmar() {
    const url = `${this.api_url}/orden_material`
    return this.http.get(url)
  }

  modificarMaterialTal(data) {
    const url = `${this.api_url}/material/descuento`
    return this.http.post(url, data)
  }

  eliminarMaterial(id: any, motivo) {
    const url = `${this.api_url}/materiales/${id}`
    const data = {
      motivo
    }
    return this.http.post(url, data)
  }

  eliminarSustrato(id: any, motivo) {
    const url = `${this.api_url}/sustratos/${id}`
    const data = {
      motivo
    }
    return this.http.post(url, data)
  }

  reporteInventario(data) {
    const url = `${this.api_url}/materialess/reporte`
    return this.http.post(url, data);
  }

  realizarDescuentoAlmacen(data) {
    const url = `${this.api_url}/material/descuento`
    return this.http.post(url, data);
  }

  postAlmacenado(data) {
    const url = `${this.api_url}/almacenado`
    return this.http.post(url, data);
  }

  getAlmacenado() {
    const url = `${this.api_url}/almacenado`
    return this.http.get(url)
  }

  getAlmacenadoID(id) {
    const url = `${this.api_url}/almacenado/${id}`
    return this.http.get(url)
  }


  getAlmacenadoID2(id) {
    const url = `${this.api_url}/almacenados/${id}`
    return this.http.get(url)
  }

  putAlmacenadoID(id, body) {
    const url = `${this.api_url}/almacenado/${id}`
    return this.http.put(url, body)
  }

  getOrdenById2(id) {
    const url = `${this.api_url}/etiquetar/${id}`
    return this.http.get(url)
  }

  getMaterialesID(id) {
    const url = `${this.api_url}/materiales/${id}`
    return this.http.get(url)
  }

  putMaterialID(id, body) {
    const url = `${this.api_url}/material/${id}`
    return this.http.put(url, body)
  }

  getMaquinaID(id) {
    const url = `${this.api_url}/maquinas/${id}`
    return this.http.get(url)
  }

  putMaquina(id, body) {
    const url = `${this.api_url}/maquinas/${id}`
    return this.http.put(url, body)
  }

  deleteGrupo(id) {
    const url = `${this.api_url}/grupo/${id}`
    return this.http.delete(url)
  }

  getMaquinasByOrdens(id) {
    const url = `${this.api_url}/maquina-orden/${id}`
    return this.http.get(url)
  }

  updateProducto(data, id) {

    const url = `${this.api_url}/producto/${id}`
    return this.http.post(url, data)
  }

  /**
   * Finaliza el trabajo que se esta realizando
   */
  finalizarTrabajo(id) {
    const url = `${this.api_url}/finalizar-trabajo`
    return this.http.put(url, id)
  }

  cambiarContrasena(data) {
    const url = `${this.api_url}/usuario/cambio-password`
    return this.http.put(url, data)
  }

  postReq(data) {
    const url = `${this.api_url}/requi`
    return this.http.post(url, data)
  }

  getRequi() {
    const url = `${this.api_url}/requi`
    return this.http.get(url)
  }

  getRequiEspera() {
    const url = `${this.api_url}/requi/espera`
    return this.http.get(url)
  }

  DeleteRequi(id) {
    const url = `${this.api_url}/requi/${id}`
    return this.http.delete(url)
  }

  UpdateRequi(id) {
    let data = 'nada'
    const url = `${this.api_url}/requi/${id}`
    return this.http.put(url, data)
  }

  getLotes() {
    const url = `${this.api_url}/devoluciones`
    return this.http.get(url)
  }

  postDevolucion(data) {
    const url = `${this.api_url}/material/devolucion`
    return this.http.post(url, data)
  }

  getDevolucion() {
    const url = `${this.api_url}/devolucion`
    return this.http.get(url)
  }

  putDevolucion(id, data) {
    const url = `${this.api_url}/devoluciones/${id}`
    return this.http.put(url, data)
  }

  DeleteDevolucion(id) {
    const url = `${this.api_url}/devoluciones/${id}`
    return this.http.delete(url)
  }

  PostDespacho(data) {
    const url = `${this.api_url}/despacho`
    return this.http.post(url, data)
  }

  GetDespacho() {
    const url = `${this.api_url}/despacho`
    return this.http.get(url)
  }

  PutDespacho(id, data) {
    const url = `${this.api_url}/despacho/${id}`
    return this.http.put(url, data)
  }

  PutDespachos(id, data) {
    const url = `${this.api_url}/despachos/${id}`
    return this.http.put(url, data)
  }

  GetDespachoByOrden(orden) {
    console.log(orden)
    const url = `${this.api_url}/despacho/${orden}`
    return this.http.get(url)
  }

  CerrarOrden(id) {
    const url = `${this.api_url}/orden-cerrar/${id}`
    return this.http.get(url)
  }

  updateTrabajo(id, data) {
    const url = `${this.api_url}/trabajo/${id}`
    return this.http.put(url, data)
  }

  BuscarAlmacenes(producto) {
    // console.log(producto,'kakaka')
    const url = `${this.api_url}/despacho/almacen`
    return this.http.post(url, { producto })
  }




  EstadisticasOrden(data) {
    const url = `${this.api_url}/estadisticas/ordens`
    return this.http.post(url, data)
  }

  putCliente(data, id) {
    const url = `${this.api_url}/cliente/${id}`
    return this.http.put(url, data)
  }

  putOrden(data, id) {
    const url = `${this.api_url}/orden/${id}`
    return this.http.put(url, data)
  }

  getOrdenesTodas() {
    const url = `${this.api_url}/orden-todo`
    return this.http.get(url)
  }
  putBobinas(id, data) {

    delete data._id

    const url = `${this.api_url}/sustrato/${id}`
    return this.http.put(url, data)
  }


  getOrdensByCliente(cliente) {
    const url = `${this.api_url}/orden-cliente/${cliente}`
    return this.http.get(url)
  }

  getDespachosbyOrden(orden) {
    const url = `${this.api_url}/despachos-pendientes/${orden}`
    return this.http.get(url)
  }

  postEscala(data) {
    const url = `${this.api_url}/cotizacion/intervalo`
    return this.http.post(url, data)
  }

  getEscala(producto) {
    const url = `${this.api_url}/cotizacion/intervalo/${producto}`
    return this.http.get(url)
  }

  DeleteEscala(id) {
    const url = `${this.api_url}/cotizacion/intervalo/${id}`
    return this.http.delete(url)
  }

  GetOneEscala(producto, cantidad) {
    const url = `${this.api_url}/cotizacion/intervalo/producto/${producto}`
    return this.http.post(url, cantidad)
  }
  GetEscalaByCliente(cliente) {
    const url = `${this.api_url}/cotizacion/intervalo-todos/${cliente}`
    return this.http.get(url)
  }

  putIntervalo(data) {
    const url = `${this.api_url}/cotizacion/intervalos`
    return this.http.put(url, data)
  }


  getDespachosYOrdenes() {
    const url = `${this.api_url}/despachos/pre-facturacion`
    return this.http.get(url)
  }

  TwoStepsValidation(pin) {
    const url = `${this.api_url}/validation2steps`
    return this.http.post(url, pin)
  }

  crearPin(data) {
    const url = `${this.api_url}/crear-pin`
    return this.http.post(url, data)
  }

  aumentoPre(data) {
    const url = `${this.api_url}/incremento/pre`
    return this.http.post(url, data)
  }

  facturado(data) {
    const url = `${this.api_url}/facturado`
    return this.http.put(url, data)
  }

  ImprimirPDF(data) {
    const url = `${this.api_url}/prints`
    return this.http.post(url, data)

  }

  postOrdenDeCompra(data) {
    const url = `${this.api_url}/orden-compra`
    return this.http.post(url, data)
  }

  getOrdenesDeCompra() {
    const url = `${this.api_url}/orden-compra`
    return this.http.get(url)
  }

  putOrdenesDeCompra(data, id) {
    const url = `${this.api_url}/orden-compra/${id}`
    return this.http.put(url, data)
  }

  putCerrarLotes(id) {
    const url = `${this.api_url}/devoluciones`
    return this.http.put(url, id)
  }

  getDespachados() {
    const url = `${this.api_url}/despachados`
    return this.http.get(url)
  }

  getDespachadoTodos() {
    const url = `${this.api_url}/despachados-todos`
    return this.http.get(url)
  }

  getDespachoFechas(desde, hasta) {
    const url = `${this.api_url}/despacho-fechas/${desde}/${hasta}`
    return this.http.get(url)

  }

  getDespachoCliente(cliente, desde, hasta) {
    const url = `${this.api_url}/despachos-cliente/${cliente}/${desde}/${hasta}`
    return this.http.get(url)
  }

  copyTags(orden, cantidad) {
    const url = `${this.api_url}/copy/${orden}/${cantidad}`
    return this.http.get(url)
  }

  updateManyMateriales(id, data) {
    const url = `${this.api_url}/materiales/${id}`
    return this.http.put(url, data)
  }

  putAgregarformula(id, data) {
    const url = `${this.api_url}/agregar-formula/${id}`
    return this.http.put(url, data)
  }



  // **********************************************************************
  // *            API PARA CONSULTAS DE LABORATORIO                       *
  // **********************************************************************

  getAlmacenadoPorLote(lote) {
    const url = `${this.api_url}/analisis/${lote}`
    return this.http.get(url)
  }

  // **********************************************************************
  // *            FINAL API PARA CONSULTAS DE LABORATORIO                 *
  // **********************************************************************


  putBuscarAlmacen(data) {
    const url = `${this.api_url}/reporte-inventario`
    return this.http.post(url, data)
  }

  postSalidas(data) {
    const url = `${this.api_url}/reporte-salidas`
    return this.http.post(url, data)
  }

  postDevoluciones(data) {
    const url = `${this.api_url}/reporte-devoluciones`
    return this.http.post(url, data)
  }

  postentradashastahoy(data) {
    const url = `${this.api_url}/corte-de-fecha`
    return this.http.post(url, data)
  }

  postsalidashastahoy(data) {
    const url = `${this.api_url}/corte-salida`
    return this.http.post(url, data)
  }

  postdevolucioneshastahoy(data) {
    const url = `${this.api_url}/corte-devolucion`
    return this.http.post(url, data)
  }

  getDespachoFechas_(desde, hasta) {
    const url = `${this.api_url}/gastos/${desde}/${hasta}`
    return this.http.get(url)

  }

  postBuscarLoteporFecha(ordenes, desde, hasta) {
    let data = {
      ordenes, desde, hasta
    }
    const url = `${this.api_url}/lote-fecha`
    return this.http.post(url, data)
  }

  postBuscarDevolucionesPorFecha(ordenes, desde, hasta) {
    let data = {
      ordenes, desde, hasta
    }
    const url = `${this.api_url}/devoluciones-fecha`
    return this.http.post(url, data)
  }

  getTodoslosProductos() {
    const url = `${this.api_url}/productos-todos`
    return this.http.get(url)

  }

  postAnalisisSustrato(data) {
    const url = `${this.api_url}/analisis-sustrato`
    return this.http.post(url, data)
  }

  getLotesUsados(lote) {
    const url = `${this.api_url}/analisis-sustrato/${lote}`
    return this.http.get(url)
  }

  PostEditarGestiones(data) {
    const url = `${this.api_url}/many-gestiones`
    return this.http.post(url, data)
  }

  imprimirTest() {
    const url = `${this.api_url}/createMark`
    return this.http.get(url)
  }

  postDepartamento(data) {
    const url = `${this.api_url}/departamento`
    return this.http.post(url, data)
  }

  GetDepartamento() {
    const url = `${this.api_url}/departamento`
    return this.http.get(url)
  }

  postAnalisisTinta(data) {
    const url = `${this.api_url}/analisis-tinta`
    return this.http.post(url, data)
  }

  getAnalisisTinta(lote) {
    const url = `${this.api_url}/analisis-tinta/${lote}`
    return this.http.get(url)
  }

  postFabricantes(data) {
    const url = `${this.api_url}/compras/fabricante`
    return this.http.post(url, data)
  }

  getFabricantes() {
    const url = `${this.api_url}/compras/fabricante`
    return this.http.get(url)
  }

  putFabricantes(id, data) {
    const url = `${this.api_url}/compras/fabricante/${id}`
    return this.http.put(url, data)
  }

  postProveedor(data) {
    const url = `${this.api_url}/compras/proveedor`
    return this.http.post(url, data)
  }

  GetProveedores() {
    const url = `${this.api_url}/compras/proveedor`
    return this.http.get(url)
  }

  putProveedores(id, data) {
    const url = `${this.api_url}/compras/proveedor/${id}`
    return this.http.put(url, data)
  }






  // NEW DATA
  // post MATERIA PRIMA 
  PostMateriaPrima(data) {
    const url = `${this.api_url}/materia-prima`
    return this.http.post(url, data)
  }
  getMateriaPrima() {
    const url = `${this.api_url}/materia-prima`
    return this.http.get(url)
  }

  putMateriaPrima(id, data) {
    const url = `${this.api_url}/materia-prima/${id}`
    return this.http.put(url, data)
  }

  postFacturacion(data) {
    const url = `${this.api_url}/facturacion`
    return this.http.post(url, data)
  }

  getFacturacion() {
    const url = `${this.api_url}/facturacion`
    return this.http.get(url)
  }

  putFacturacion(id, data) {
    const url = `${this.api_url}/facturacion/${id}`
    return this.http.put(url, data)
  }

  sendNotificacion(id) {
    const url = `${this.api_url}/notificacion-recepcion/${id}`
    return this.http.get(url)
  }

  Cambiaraobservacion(id) {
    const url = `${this.api_url}/recepcion-observacion/${id}`
    return this.http.get(url)
  }

  SubirIteratorFacturacion() {
    const url = `${this.api_url}/addifacturacion`
    return this.http.get(url)
  }

  getPorAnalizar() {
    const url = `${this.api_url}/por-analizar`
    return this.http.get(url)
  }

  FinalizarFacturacion(id) {
    const url = `${this.api_url}/cerrar-facturacion/${id}`
    return this.http.get(url)
  }

  enviarNotificacion(data) {
    const url = `${this.api_url}/enviar-notificacion`
    return this.http.post(url, data)

  }



  GETORDENESPECIFICA() {
    const url = `${this.api_url}/orden-especifica`
    return this.http.get(url)
  }

  BUSCARENALMACENPRODUCTO(parametro) {
    const url = `${this.api_url}/buscar-en-almacen`
    return this.http.post(url, parametro)

  }

  GETALLALMACEN() {
    const url = `${this.api_url}/buscar-por-nombre`
    return this.http.get(url)
  }

  BUSCARCINTA() {
    const url = `${this.api_url}/buscar-cinta`
    return this.http.get(url)
  }

  DESCONTARLOTE(data) {
    const url = `${this.api_url}/descontar`
    return this.http.post(url, data)
  }


  postCategoria(data) {
    const url = `${this.api_url}/categoria`
    return this.http.post(url, data)
  }

  getCategorias() {
    const url = `${this.api_url}/categoria`
    return this.http.get(url)
  }

  postRepuesto(data) {
    const url = `${this.api_url}/repuesto`
    return this.http.post(url, data)
  }

  getRepuesto() {
    const url = `${this.api_url}/repuesto`
    return this.http.get(url)
  }

  postpieza(data) {
    const url = `${this.api_url}/pieza`
    return this.http.post(url, data)
  }

  getpieza() {
    const url = `${this.api_url}/pieza`
    return this.http.get(url)
  }

  putRepuesto(data, id) {
    const url = `${this.api_url}/repuesto/${id}`
    return this.http.put(url, data)
  }

  putPieza(data, id) {
    const url = `${this.api_url}/pieza/${id}`
    return this.http.put(url, data)
  }

  postRequisicionRepuesto(data) {
    const url = `${this.api_url}/solicitudrepuesto`;
    return this.http.post(url, data)
  }

  getRequisicionRepuesto() {
    const url = `${this.api_url}/solicitudrepuesto`;
    return this.http.get(url)
  }

  putRequisicionRepuesto(data, id) {
    const url = `${this.api_url}/solicitudrepuesto/${id}`;
    return this.http.put(url, data)
  }

  getRepuestosAprobados() {
    const url = `${this.api_url}/repuestos-aprobados`;
    return this.http.get(url)
  }

  putRepuestosAprobados(data, id) {
    const url = `${this.api_url}/descuento-repuesto/${id}`;
    return this.http.put(url, data)
  }

  getRepuestosFinalizados(asignacion) {
    const url = `${this.api_url}/solicitud-repuestos-asignadas/${asignacion}`;
    return this.http.get(url)
  }

  getEstadisticasImpresoras() {
    const url = `${this.api_url}/estadisticas/impresoras`;
    return this.http.get(url)
  }

  getMovimientoMaterial(desde, hasta) {
    const url = `${this.api_url}/material-reporte?desde=${desde}&hasta=${hasta}`;
    return this.http.get(url)
  }

  InsertarVariosAAlmacenExterior(data) {
    const url = `${this.api_url}/almacen-exterior`;
    return this.http.post(url, data)
  }

  VerProductosDeAlmacenExterior() {
    const url = `${this.api_url}/almacen-exterior`;
    return this.http.get(url)
  }

  trasladosPendientes() {
    const url = `${this.api_url}/traslados-pendientes`;
    return this.http.get(url)
  }

  AceptarTraslado(id: any) {
    const url = `${this.api_url}/traslado-acepta/${id}`;
    return this.http.get(url)
  }

  CancelarTraslado(id: any) {
    const url = `${this.api_url}/traslado-cancelada/${id}`;
    return this.http.get(url)
  }

  UltimaGestion(data: any) {
    const url = `${this.api_url}/last-gestiones`;
    return this.http.post(url, data)
  }


}
