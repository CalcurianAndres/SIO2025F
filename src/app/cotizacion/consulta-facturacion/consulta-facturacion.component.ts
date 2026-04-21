import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestApiService } from 'src/app/services/rest-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consulta-facturacion',
  templateUrl: './consulta-facturacion.component.html',
  styleUrls: ['./consulta-facturacion.component.css']
})
export class ConsultaFacturacionComponent implements OnInit {

  constructor(private api: RestApiService,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.api.getDespachadoTodos()
      .subscribe((resp: any) => {
        this.Despachos = resp;
      })
  }

  Select_opcion(e) {
    if (e === 'cliente') {
      this.m_fecha = false
      this.m_orden = false
      this.m_cliente = true;
      this.ObtenerClientes()
    } else if (e === 'fecha') {
      this.m_fecha = true
      this.m_cliente = false;
      this.m_orden = false
    } else if (e === 'orden') {
      this.m_orden = true
      this.m_fecha = false
      this.m_cliente = false;
    }
  }

  public Despachos = []
  public Clientes = []

  public m_cliente: boolean = false;
  public m_fecha: boolean = false;
  public m_orden: boolean = false;

  public Total_Bs = 0
  public Total_USD = 0
  public Total_Bs_N = 0
  public Total_USD_N = 0

  public Facturas: boolean = true;
  public Notas: boolean = false

  ObtenerClientes() {
    // console.log('work')
    this.api.GetClientes()
      .subscribe((resp: any) => {
        this.Clientes = resp.clientes
      })
  }


  puntoYcoma(n) {
    if (n === null || n === undefined || isNaN(n)) {
      return "0,00";
    }

    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(n);
  }

  // Formatea con separador de miles (puntos) y coma decimal, con EXACTAMENTE 4 decimales
  puntoYcoma4(n) {
    // permitir 0 como valor válido, solo tratar null/undefined como ausente

    if (n === null || n === undefined) {
      return 0
    }
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(n)
  }


  NE() {
    let element = document.getElementById('NE_');
    element.classList.add("is-active");
    document.getElementById('FA_').classList.remove("is-active");
    this.Notas = true;
    this.Facturas = false
  }

  FA() {
    let element = document.getElementById('NE_');
    element.classList.remove("is-active");
    document.getElementById('FA_').classList.add("is-active");
    this.Notas = false;
    this.Facturas = true
  }

  public INDEX
  public ORDENES = []
  public NOTAS = []
  Buscar_op(op) {
    this.ORDENES = []
    this.NOTAS = []
    this.Total_Bs = 0;
    this.Total_USD = 0;
    this.Total_Bs_N = 0;
    this.Total_USD_N = 0;
    this.api.getDespachosbyOrden(op)
      .subscribe((resp: any) => {
        for (let i = 0; i < resp.length; i++) {
          for (let x = 0; x < resp[i].despacho.length; x++) {
            if (resp[i].despacho[x].tasa) {
              if (resp[i].despacho[x].documento.charAt(0) === 'F') {
                if (resp[i].despacho[x].op === op) {
                  resp[i].despacho[x].fecha = resp[i].fecha
                  this.ORDENES.push(resp[i].despacho[x])
                  this.Total_USD = this.Total_USD +=
                    (resp[i].despacho[x].cantidad / 1000 * resp[i].despacho[x].precio) < 100
                      ? (resp[i].despacho[x].cantidad * resp[i].despacho[x].precio)
                      : ((resp[i].despacho[x].cantidad / 1000) * resp[i].despacho[x].precio);
                  this.Total_Bs = this.Total_Bs + (this.Total_USD * resp[i].despacho[x].tasa);
                }
              } else {
                resp[i].despacho[x].fecha = resp[i].fecha
                this.NOTAS.push(resp[i].despacho[x])
                this.Total_USD_N = this.Total_USD_N +=
                  (resp[i].despacho[x].cantidad / 1000 * resp[i].despacho[x].precio) < 100
                    ? (resp[i].despacho[x].cantidad * resp[i].despacho[x].precio)
                    : ((resp[i].despacho[x].cantidad / 1000) * resp[i].despacho[x].precio);
                this.Total_Bs_N = this.Total_Bs_N + (this.Total_USD_N * resp[i].despacho[x].tasa);
              }
            }
          }
        }

      })
  }


  buscar_fecha(desde, hasta) {

    if (!desde.value || !hasta.value) {
      Swal.fire({
        title: 'Error',
        text: 'Debes ingresar 2 fechas validas',
        icon: 'error',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      })
    }

    if (desde.value > hasta.value) {
      Swal.fire({
        title: 'Error',
        text: 'Debes ingresar 2 fechas validas',
        icon: 'error',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      })
    }

    this.api.getDespachoFechas(desde.value, hasta.value)
      .subscribe((resp: any) => {
        this.ORDENES = []
        this.NOTAS = []
        this.Total_Bs = 0;
        this.Total_USD = 0;
        this.Total_Bs_N = 0;
        this.Total_USD_N = 0;
        for (let i = 0; i < resp.length; i++) {
          for (let x = 0; x < resp[i].despacho.length; x++) {
            if (resp[i].despacho[x].tasa) {
              if (resp[i].despacho[x].documento.charAt(0) === 'F') {
                resp[i].despacho[x].fecha = resp[i].fecha
                this.ORDENES.push(resp[i].despacho[x])
                this.Total_USD = this.Total_USD +=
                  (resp[i].despacho[x].cantidad / 1000 * resp[i].despacho[x].precio) < 100
                    ? (resp[i].despacho[x].cantidad * resp[i].despacho[x].precio)
                    : ((resp[i].despacho[x].cantidad / 1000) * resp[i].despacho[x].precio);
                this.Total_Bs = this.Total_Bs + (this.Total_USD * resp[i].despacho[x].tasa);
              } else {
                resp[i].despacho[x].fecha = resp[i].fecha
                this.NOTAS.push(resp[i].despacho[x])
                this.Total_USD_N = this.Total_USD_N +=
                  (resp[i].despacho[x].cantidad / 1000 * resp[i].despacho[x].precio) < 100
                    ? (resp[i].despacho[x].cantidad * resp[i].despacho[x].precio)
                    : ((resp[i].despacho[x].cantidad / 1000) * resp[i].despacho[x].precio);
                this.Total_Bs_N = this.Total_Bs_N + (this.Total_USD_N * resp[i].despacho[x].tasa);
              }
            }
          }
        }
      })

  }

  generarSubTotalBS(cantidad, precio, tasa) {
    let SubtotalBS
    let precio_millar_Bs: any = (precio * tasa).toFixed(2)
    let Bs: any;
    Bs = ((cantidad / 1000) * precio_millar_Bs)
    SubtotalBS = Bs
    return SubtotalBS
  }

  BuscarCliente(cliente, desde, hasta) {

    // console.log(cliente, '*', desde, '*', hasta)

    if (cliente === '#') {
      Swal.fire({
        title: 'Error',
        text: 'Debes seleccionar un cliente',
        icon: 'error',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      })
    }

    if (!desde || !hasta) {
      Swal.fire({
        title: 'Error',
        text: 'Debes ingresar 2 fechas validas',
        icon: 'error',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      })
    }

    this.api.getDespachoCliente(cliente, desde, hasta)
      .subscribe((resp: any) => {
        this.ORDENES = []
        this.NOTAS = []
        this.Total_Bs = 0;
        this.Total_USD = 0;
        this.Total_Bs_N = 0;
        this.Total_USD_N = 0;
        // console.log(resp)
        for (let i = 0; i < resp.length; i++) {
          if (resp[i].tasa) {
            if (resp[i].documento.charAt(0) === 'F') {
              resp[i].fecha = resp[i].fecha
              this.ORDENES.push(resp[i])
              this.Total_USD = this.Total_USD += (resp[i].cantidad / 1000 * resp[i].precio) < 100
                ? (resp[i].cantidad * resp[i].precio)
                : ((resp[i].cantidad / 1000) * resp[i].precio);
              this.Total_Bs = this.Total_Bs + this.Total_USD * resp[i].tasa;
            } else {
              resp[i].fecha = resp[i].fecha
              this.NOTAS.push(resp[i])
              // this.Total_USD_N = this.Total_USD_N + ((resp[i].cantidad / 1000) * resp[i].precio);
              this.Total_USD_N = this.Total_USD_N += (resp[i].cantidad / 1000 * resp[i].precio) < 100
                ? (resp[i].cantidad * resp[i].precio)
                : ((resp[i].cantidad / 1000) * resp[i].precio);
              this.Total_Bs_N = this.Total_Bs_N + this.Total_USD_N * resp[i].tasa;
            }
          }
        }
      })
  }

}
