import { Component, OnInit } from '@angular/core';
import { RestApiService } from 'src/app/services/rest-api.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-movimiento-material',
  templateUrl: './movimiento-material.component.html',
  styleUrls: ['./movimiento-material.component.css']
})
export class MovimientoMaterialComponent implements OnInit {

  constructor(public api:RestApiService) {

   }

   colores = [
    'Amarillo proceso',
    'Azul proceso',
    'Blanco',
    'Negro',
    'Dorado'
   ]

   public grupos = []
   public Resultado:any = [];
   public fechas = {
    desde:'',
    hasta:''
   }

   public buscar = false;

   mostrarDetalles: { [grupo: string]: boolean } = {};

    toggleDetalles(grupo: string) {
      this.mostrarDetalles[grupo] = !this.mostrarDetalles[grupo];
    }


   exportToExcel(): void {
    // Extraemos los datos de la tabla con la suma por grupo
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.getTableData());

    // Crear el libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Totales por Grupo');

    // Generar el archivo Excel y hacer la descarga
    XLSX.writeFile(wb, 'TotalesPorGrupo.xlsx');
  }

  // Función que prepara los datos de la tabla con la suma de los totales por grupo
  getTableData() {
    const totalsByGroup = {};

    for (const despachos of this.Resultado.despachos) {
      for (const factura of despachos.despacho) {
        // Procesamos cada grupo de materiales de cada factura
        for (const materiales of this.sumarMaterialesPorGrupo(factura.op)) {
          const grupo = materiales.grupo;
          const cantidad = materiales.cantidad;
          const unidad = this.UnidadesMedicion(materiales.grupo);

          // Inicializamos el grupo si no existe en el objeto de totales
          if (!totalsByGroup[grupo]) {
            totalsByGroup[grupo] = {
              grupo: grupo,
              cantidad: 0,
              unidad: unidad
            };
          }

          // Sumamos la cantidad de materiales por grupo
          totalsByGroup[grupo].cantidad += cantidad;
        }
      }
    }

    // Convertimos el objeto de totales a un array para exportarlo a Excel
    return Object.values(totalsByGroup).map((item:any) => ({
      'Grupo': item.grupo,
      'Total Asignado': `${item.cantidad} ${item.unidad}`,
    }));
  }

  
   mostrarFechas(){
    if(this.fechas.desde && this.fechas.hasta){
      this.BuscarMovimientos();
    }
   }

  BuscarGrupo = () => {
    this.api.GetGrupoMp().subscribe((resp:any) => {
      this.grupos = resp
    })
  }

  BuscarMovimientos = () => {
    this.buscar = false;
    this.api.getMovimientoMaterial(this.fechas.desde, this.fechas.hasta).subscribe((resp:any) => {
      this.Resultado = resp;

      this.buscar = true;
    })
  }


  getKeys = (obj:any) => {
    return Object.keys(obj)
  }

  

  ngOnInit(): void {
  }

  /**
   * Genera un número aleatorio dentro de un rango específico (incluyendo ambos extremos).
   * @param min - El límite inferior del rango.
   * @param max - El límite superior del rango.
   * @returns Un número aleatorio dentro del rango [min, max].
   */
  generarNumeroRandom(min: number, max: number): number {
      if (min > max) {
          throw new Error("El valor mínimo no puede ser mayor que el valor máximo.");
      }
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  asignaciones = (op:string) =>{
    return this.Resultado.asignaciones.filter(asignaciones => asignaciones.orden === op)
  }

  devoluciones = (op:string) =>{
    return this.Resultado.devoluciones.filter(asignaciones => asignaciones.orden === op)
  }


  sumarDevolucionesPorGrupo_ = (op) => {
    const devolucionesFiltradas = this.devoluciones(op);
    let resumenPorGrupo = {};
    let i = 0
    devolucionesFiltradas.forEach(devolucion => {
      i++
      devolucion.filtrado.forEach(material =>  {
        let grupoName = material.material.grupo.nombre

        if(i > 1 && grupoName === 'Sustrato'){
          grupoName = 'Papel / Cartón'
        }

        if(!resumenPorGrupo[grupoName]){
          resumenPorGrupo[grupoName] = 0
        }
        resumenPorGrupo[grupoName] += Number(material.cantidad)
      });
    });

    return Object.keys(resumenPorGrupo).map(grupo => {
      return {grupo, cantidad:resumenPorGrupo[grupo]};
    })
  }

  sumarDevolucionesPorGrupo = (op) => {
    const devolucionesFiltradas = this.devoluciones(op);
    let resumenPorGrupo = {};

    devolucionesFiltradas.forEach(devolucion => {
      devolucion.filtrado.forEach(material =>  {
        if(!resumenPorGrupo[material.material.grupo.nombre]){
          resumenPorGrupo[material.material.grupo.nombre] = 0
        }
        resumenPorGrupo[material.material.grupo.nombre] += Number(material.cantidad)
      });
    });

    return Object.keys(resumenPorGrupo).map(grupo => {
      return {grupo, cantidad:resumenPorGrupo[grupo]};
    })
  }

  BuscarDevolucionDeOrdenPorGrupo(grupo: string, op: string):any {
    const devolucion = this.sumarDevolucionesPorGrupo(op).find(devoluciones => devoluciones.grupo === grupo);
    return devolucion ?? 0;
}

devolucionPorMaterialEspecifico = (op, material) =>{
  const devolucionesFiltradas = this.devoluciones(op);
  let total = 0

  devolucionesFiltradas.forEach(devolucion => {
    devolucion.filtrado.forEach(material_ =>{
      const nombreCompleto = `${material_.material.nombre}${material_.material.marca ? ' ' + material_.material.marca : ''}`;
        if (material.nombre === nombreCompleto) {
          total += Number(material_.cantidad || 0);
        }
    })
  })

  return total
}


  UnidadesMedicion(Grupo:any){
    switch (Grupo) {
      case 'Sustrato':
        return 'Und.'
      break;

      case 'Tinta':
        return 'kg.'
      break

      case 'Barniz':
        return 'kg.'
      break
    
      default:
        return 'Und.'
      break;
    }
  }


  sumarMaterialesPorGrupo = (op) => {
    const asignacionesFiltradas = this.asignaciones(op);
    const resumenPorGrupo: {
      [grupo: string]: {
        cantidad: number;
        detalles: { [nombre: string]: { cantidad: number; devolucion:number; despachado:number; unidad: string } };
      };
    } = {};
  
    let i = 0;
    let primerSustratoNombre = '';

    asignacionesFiltradas.forEach(asignacion => {
      i++;
      asignacion.material.forEach(material => {
        let GrupoNombre = material.material.grupo.nombre;
        const ancho = material.material.ancho || '';
        const largo = material.material.largo || '';
        const gramaje = material.material.gramaje || '';
        const calibre = material.material.calibre || '';
        let nombreMaterial = `${material.material.nombre} ${material.material.marca}`;
        if(ancho && largo && gramaje && calibre){
          nombreMaterial = `${material.material.nombre} ${material.material.marca} (${ancho}x${largo}) ${gramaje}g/m² - ${calibre}pt`
        }
        const unidad = material.material.unidad || 'und';
  
         // Guardamos el primer Sustrato original (i == 0)
          if (i === 1 && GrupoNombre === 'Sustrato' && !primerSustratoNombre) {
            primerSustratoNombre = nombreMaterial;
          }

          // Si no es el primero, es Sustrato y diferente del primero: renombrar a Papel / Cartón
          if (i > 1 && GrupoNombre === 'Sustrato' && nombreMaterial !== primerSustratoNombre) {
            GrupoNombre = 'Papel / Cartón';
          }
  
        if (!resumenPorGrupo[GrupoNombre]) {
          resumenPorGrupo[GrupoNombre] = {
            cantidad: 0,
            detalles: {}
          };
        }
  
        // Sumar cantidad total por grupo
        resumenPorGrupo[GrupoNombre].cantidad += Number(material.cantidad);
  
        // Agrupar materiales iguales por nombre
        if (!resumenPorGrupo[GrupoNombre].detalles[nombreMaterial]) {
          resumenPorGrupo[GrupoNombre].detalles[nombreMaterial] = {
            cantidad: 0,
            devolucion:0,
            despachado:0,
            unidad
          };
        }
  
        resumenPorGrupo[GrupoNombre].detalles[nombreMaterial].cantidad += Number(material.cantidad);
      });
    });
  
    // Transformar en array para la vista
    const resultado = Object.keys(resumenPorGrupo).map(grupo => ({
      grupo,
      cantidad: resumenPorGrupo[grupo].cantidad,
      detalles: Object.keys(resumenPorGrupo[grupo].detalles).map(nombre => ({
        nombre,
        devolucion: resumenPorGrupo[grupo].detalles[nombre].devolucion,
        cantidad: resumenPorGrupo[grupo].detalles[nombre].cantidad,
        unidad: resumenPorGrupo[grupo].detalles[nombre].unidad
      }))
    }));
  
    // Ordenar como antes
    return resultado.sort((a, b) => {
      if (a.grupo === 'Sustrato') return -1;
      if (b.grupo === 'Sustrato') return 1;
      if (a.grupo === 'Tinta') return -1;
      if (b.grupo === 'Tinta') return 1;
      if (a.grupo === 'Barniz') return -1;
      if (b.grupo === 'Barniz') return 1;
      if (a.grupo === 'Cajas Corrugadas') return -1;
      if (b.grupo === 'Cajas Corrugadas') return 1;
      if (a.grupo === 'Soportes de Embalaje') return -1;
      if (b.grupo === 'Soportes de Embalaje') return 1;
      if (a.grupo === 'Cinta de Embalaje') return -1;
      if (b.grupo === 'Cinta de Embalaje') return 1;
      return a.grupo.localeCompare(b.grupo);
    });
  };
  
  


  despachoParcial( asignado:any, producto_despachado:any, op:string){


    let sustrato_asignado = this.sumarMaterialesPorGrupo(op).find(material => material.grupo === 'Sustrato')
    let cajas_asignadas = this.sumarMaterialesPorGrupo(op).find(material => material.grupo === 'Cajas Corrugadas')

    let orden = this.Resultado.ordenes.find(orden => orden.sort === op)

    
    let producto_maximo:any = '';
    
    if(!sustrato_asignado){
      let cajas_cajas = orden.producto.materiales[orden.montaje].find(m => Number(m.cantidad) > 5);
      producto_maximo = cajas_asignadas.cantidad * Number(cajas_cajas.cantidad)
    }else{
      producto_maximo = sustrato_asignado.cantidad * orden.producto.ejemplares[orden.montaje]
    }

    return (asignado * producto_despachado) / producto_maximo
  }

  despachoCompleto(asignado:any, op: string) {
    const parciales = this.Resultado.parciales.filter(desp => 
      desp.despacho.some(filt => filt.op === op && filt.parcial_ === true)
    );
    const documentosProcesados = new Set(); // Rastrear documentos ya procesados
    let suma_de_parciales = 0;
    let cantidades = 0

    for (let i = 0; i < parciales.length; i++) {
      for(let j=0;j < parciales[i].despacho.length; j++){
        const documento = parciales[i].despacho[j]._id; // Identificador único del parcial
        
        // Verifica si el documento ya fue procesado
        if (documentosProcesados.has(documento)) {
            continue; // Saltar al siguiente si ya fue procesado
        }else{
          // Agregar el documento al conjunto de procesados
          documentosProcesados.add(documento)
          if(parciales[i].despacho[j].op === op){
            cantidades += parciales[i].despacho[j].cantidad
          }
        }


      }
        if (i === parciales.length -1) {
            suma_de_parciales += this.despachoParcial(asignado, cantidades, op);
        }
    }
    return suma_de_parciales
}


restaDeDevoluciones(asignado:any, devoluciones:any){
  if(!devoluciones){
    devoluciones = 0
  }

  return asignado - devoluciones
}
  
}
