import { Component, OnInit } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';

@Component({
  selector: 'app-almacen-mew',
  templateUrl: './almacen-mew.component.html',
  styleUrls: ['./almacen-mew.component.css']
})
export class AlmacenMewComponent implements OnInit {

  constructor(public api: RestApiService) { }


  public loading: boolean = true;
  public resumido = true
  public grupos: any = [];
  public almacen: any = [];
  public expandido: any = {};
  public orden: any = {};
  ordenCampoResumido: string = 'nombre';
  ordenCampoMateriales: string = 'nombre';
  ordenDireccionResumido: 'asc' | 'desc' = 'asc';
  ordenDireccionMateriales: 'asc' | 'desc' = 'asc';
  filtros: { [grupoId: string]: string } = {};
  public tipo_almacen: 'almacen' | 'material' | 'bobinas' = 'almacen';
  requisicions = 0;
  ordenes = 0;
  por_aprobar = 0;
  devoluciones = 0;
  traslados = 0;
  retornos = [];

  public Materiales_registrados: any = []
  public AlmacenExterior: any = []


  public asignacion_ = false
  public repuesto = false
  public exterior = false
  public Almacenado = true;
  public Materiales = false


  // variables de modales:::::::::::::::::::::::::
  // :::::::::::::NUEVO MATERIAL::::::::::::::::::::
  nuevo_material: boolean = false;

  // ::::::::::::::NUEVO INVENTARIO:::::::::::::::::::
  Nuevo_inventario: boolean = false

  // :::::::::::::CONFIRMACION DE SOLICITUD DE MATERIAL:::::::::::::
  confirmar_solicitud: boolean = false;

  // :::::::::::::::::::::.CONFIRMACION DE DEVOLUCIONES::::::::::::
  confirmacion_devoluciones: boolean = false;

  // :::::::::::::::::::NUEVO TRASLADO DE MATERIAL:::::::::::::::::::
  nuevo_traslado: boolean = false;
  // ::::::::::::::::::::: APROBACION DE TRASLADOS::::::::::::::::::::.
  traspasos_pendientes: boolean = false;

  // ::::::::::::::::::SOLICITUD DE RETORNO::::::::::::::::::::
  Solicitud_retorno: boolean = false
  // ::::::::::::::::::::::RETORNO DE MATERIAL POR APROBAR :::::::::::::::::::
  Retorno_pendiente: boolean = false;




  // :::::::::::::::::::::::FUNCIONES NUEVO MATERIAL:::::::::::::::::::::::::::::::::::..
  nuevoMaterial() {
    this.nuevo_material = !this.nuevo_material
  }

  ngOnInit(): void {
    this.cargarAlmacer();
  }

  CargarAlmacenExterno() {
    this.loading = true;
    try {
      this.api.getAlmacenExteriorNuevo().subscribe((resp: any) => {
        this.AlmacenExterior = resp;
        this.buscarRetornos()
        for (const g of Object.keys(this.AlmacenExterior)) {
          this.expandido[g] = false;
          this.filtros[g] = "";
        }
        this.loading = false;
      })
    } catch (err) {
      console.log('ERROR INTERNO', err)
    }
  }

  MaterialesBusqueda(e: any) {
    if (e === 'materiales') {
      this.CargarMaterialesRegistrados()
    } else {
      this.loading = true;
      this.Almacenado = true;
      this.Materiales = false;
      this.loading = false
    }
  }

  CargarMaterialesRegistrados = async (n?) => {
    if (!n) {
      this.loading = true;
      this.Almacenado = false;
      this.Materiales = true;
    }
    try {
      this.api.getMaterialesRegistradosNew().subscribe((resp: any) => {
        this.Materiales_registrados = resp;
        for (const g of this.grupos) {
          this.expandido[g._id] = false;
          this.filtros[g._id] = "";
        }
        this.loading = false;
      })
    } catch (error) {
      console.log('Error al cargar materiales registrados', error);
    }
  }

  cargarAlmacer = async () => {
    try {
      this.api.getAlmacenPoligrafica().subscribe((resp: any) => {
        this.grupos = resp.grupos;
        this.almacen = resp.Almacen;
        this.requisicions = resp.requisiciones;
        this.ordenes = resp.orden;
        this.por_aprobar = resp.espera;
        this.devoluciones = resp.devoluciones;
        this.traslados = resp.traslados

        console.log('Almacenes cargados', this.por_aprobar);
        for (const g of this.grupos) {
          this.expandido[g._id] = false;
          this.filtros[g._id] = "";
        }
        this.loading = false;
      });
    } catch (error) {
      console.log('Error al cargar almacenes', error);
    }
  }

  filtrarMaterialesRegistrados(lista: any[], grupoId: string) {
    if (!lista) return [];

    const busqueda = this.filtros[grupoId]?.toLowerCase() || "";

    let arr = lista;

    // FILTRAR
    if (busqueda.trim()) {
      arr = arr.filter(item => (
        item.nombre?.toLowerCase().includes(busqueda) ||
        item.marca?.toLowerCase().includes(busqueda) ||
        item.ancho?.toString().toLowerCase().includes(busqueda) ||
        item.largo?.toString().toLowerCase().includes(busqueda)
      ));
    }

    // ORDENAR
    arr = [...arr].sort((a, b) => {
      let valA = a[this.ordenCampoMateriales];
      let valB = b[this.ordenCampoMateriales];

      valA = valA?.toString().toLowerCase();
      valB = valB?.toString().toLowerCase();

      if (valA < valB) return this.ordenDireccionMateriales === 'asc' ? -1 : 1;
      if (valA > valB) return this.ordenDireccionMateriales === 'asc' ? 1 : -1;
      return 0;
    });

    return arr;
  }

  filtrarDetallado(lista: any[], grupoId: string) {
    const busqueda = this.filtros[grupoId]?.toLowerCase() || "";

    if (!busqueda.trim()) return lista;

    return lista.filter(item => {
      const m = item.material;
      return (
        m.nombre?.toLowerCase().includes(busqueda) ||
        m.marca?.toLowerCase().includes(busqueda) ||
        item.codigo?.toLowerCase().includes(busqueda) ||
        item.lote?.toLowerCase().includes(busqueda)
      );
    });
  }

  filtrarDetalladoExterior(lista: any[], grupoId: string) {
    const busqueda = this.filtros[grupoId]?.toLowerCase() || "";

    if (!busqueda.trim()) return lista;

    return lista.filter(item => {
      const m = item.material;
      return (
        m.nombre?.toLowerCase().includes(busqueda) ||
        m.marca?.toLowerCase().includes(busqueda) ||
        item.codigo?.toLowerCase().includes(busqueda) ||
        item.lote?.toLowerCase().includes(busqueda)
      );
    });
  }

  toggleGrupo(id: string) {
    this.expandido[id] = !this.expandido[id];
  }

  resumirMaterialesExteriorires(lista: any[], grupoId: string) {
    const busqueda = this.filtros[grupoId]?.toLowerCase() || "";

    // 1. Filtrar antes de agrupar 
    if (busqueda.trim()) {
      lista = lista.filter(item => {
        const m = item.material;
        return (
          m.nombre?.toLowerCase().includes(busqueda) ||
          m.marca?.toLowerCase().includes(busqueda)
        );
      });
    }

    // 2. Agrupar igual que antes
    const mapa = new Map();

    for (const item of lista) {
      const m = item.material;

      const clave = [
        m.nombre,
        m.marca,
        m.calibre,
        m.gramaje,
        m.ancho,
        m.largo
      ].join('|');

      if (mapa.has(clave)) {
        mapa.get(clave).cantidad += parseFloat(item.cantidad);
      } else {
        mapa.set(clave, {
          nombre: m.nombre,
          marca: m.marca,
          calibre: m.calibre,
          gramaje: m.gramaje,
          ancho: m.ancho,
          largo: m.largo,
          cantidad: parseFloat(item.cantidad)
        });
      }
    }

    // 3. Ordenamiento (igual que antes)
    let arr = Array.from(mapa.values());

    arr.sort((a, b) => {
      const campo = this.ordenCampoResumido;
      let valA = a[campo];
      let valB = b[campo];

      if (campo === 'cantidad') {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = valA?.toString().toLowerCase();
        valB = valB?.toString().toLowerCase();
      }

      if (valA < valB) return this.ordenDireccionResumido === 'asc' ? -1 : 1;
      if (valA > valB) return this.ordenDireccionResumido === 'asc' ? 1 : -1;
      return 0;
    });

    return arr;
  }

  resumirMateriales(lista: any[], grupoId: string) {
    const busqueda = this.filtros[grupoId]?.toLowerCase() || "";

    // 1. Filtrar antes de agrupar 
    if (busqueda.trim()) {
      lista = lista.filter(item => {
        const m = item.material;
        return (
          m.nombre?.toLowerCase().includes(busqueda) ||
          m.marca?.toLowerCase().includes(busqueda)
        );
      });
    }

    // 2. Agrupar igual que antes
    const mapa = new Map();

    for (const item of lista) {
      const m = item.material;

      const clave = [
        m.nombre,
        m.marca,
        m.calibre,
        m.gramaje,
        m.ancho,
        m.largo
      ].join('|');

      if (mapa.has(clave)) {
        mapa.get(clave).cantidad += parseFloat(item.cantidad);
      } else {
        mapa.set(clave, {
          nombre: m.nombre,
          marca: m.marca,
          calibre: m.calibre,
          gramaje: m.gramaje,
          ancho: m.ancho,
          largo: m.largo,
          cantidad: parseFloat(item.cantidad)
        });
      }
    }

    // 3. Ordenamiento (igual que antes)
    let arr = Array.from(mapa.values());

    arr.sort((a, b) => {
      const campo = this.ordenCampoResumido;
      let valA = a[campo];
      let valB = b[campo];

      if (campo === 'cantidad') {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = valA?.toString().toLowerCase();
        valB = valB?.toString().toLowerCase();
      }

      if (valA < valB) return this.ordenDireccionResumido === 'asc' ? -1 : 1;
      if (valA > valB) return this.ordenDireccionResumido === 'asc' ? 1 : -1;
      return 0;
    });

    return arr;
  }


  ordenarMaterialesRegistrados(campo: string) {
    if (this.ordenCampoMateriales === campo) {
      this.ordenCampoMateriales = this.ordenDireccionMateriales === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenCampoMateriales = campo;
      this.ordenDireccionMateriales = 'asc'
    }
  }

  ordenarResumido(campo: string) {
    if (this.ordenCampoResumido === campo) {
      // alternar asc <-> desc
      this.ordenDireccionResumido =
        this.ordenDireccionResumido === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenCampoResumido = campo;
      this.ordenDireccionResumido = 'asc';
    }
  }


  ordenarGrupo(id: string, campo: string) {
    // si no existe configurar ascendente
    if (!this.orden[id]) {
      this.orden[id] = { campo, asc: true };
    } else {
      // si se ordena la misma columna, invertir orden
      if (this.orden[id].campo === campo) {
        this.orden[id].asc = !this.orden[id].asc;
      } else {
        // si se cambia de columna, nueva orden ascendente
        this.orden[id] = { campo, asc: true };
      }
    }

    const asc = this.orden[id].asc ? 1 : -1;

    // ORDENAR EL GRUPO SELECCIONADO
    this.almacen[id].sort((a: any, b: any) => {
      let valA, valB;

      switch (campo) {
        case 'fecha':
          valA = new Date(a.fecha);
          valB = new Date(b.fecha);
          break;

        case 'material':
          valA = a.material.nombre.toLowerCase();
          valB = b.material.nombre.toLowerCase();
          break;

        case 'marca':
          valA = a.material.marca?.toLowerCase() || '';
          valB = b.material.marca?.toLowerCase() || '';
          break;

        case 'cantidad':
          valA = parseFloat(a.cantidad);
          valB = parseFloat(b.cantidad);
          break;
      }

      if (valA < valB) return -1 * asc;
      if (valA > valB) return 1 * asc;
      return 0;
    });
  }

  buscarRetornosPendientes() {
    return this.retornos.filter(r => r.estatus === 'Por confirmar')
  }

  buscarRetornosAprobados() {
    return this.retornos.filter(r => r.estatus === 'Aprobado')
  }

  buscarRetornos() {
    this.api.getRetornos()
      .subscribe((resp: any) => {
        this.retornos = resp
        console.warn(resp)
      })
  }

}
