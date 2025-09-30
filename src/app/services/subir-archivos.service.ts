import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SubirArchivosService {
  api_url = environment.api;

  constructor() { }


  async actualizarFoto(
    archivo:File,
    tipo:'usuarios'|'errors'|'producto'|'despacho'|'distribucion'|'aereo'|'analisis'|'fabricante'|'proveedor'|'repuestos',
    id:string
  ) {
    try{
      
      const url = `${this.api_url}/upload/${tipo}/${id}`;
      const formData = new FormData(); 
      formData.append('archivo', archivo);

      const resp = await fetch( url ,{
        method:'PUT',
        headers: {
          'Authorization': localStorage.getItem('token') || ''
        },
        body: formData
      });

      const data = await resp.json();
      if (data.ok && tipo != 'analisis' && tipo != 'fabricante'){
        if(tipo != 'proveedor'){
          // Swal.fire({title:'Excelente!', text:'Se ha actualizado la imagen', icon:'success', showConfirmButton:false, timer:2000, timerProgressBar:true});
          return data.img
        }
      }else{
        if(tipo != 'fabricante'){
          // Swal.fire('Error', data.err.message, 'error');
        }
        
        return false;
      }
      return 'path image'


    } catch(error){
      // console.log(error)
      return false;
    }

  }

}
