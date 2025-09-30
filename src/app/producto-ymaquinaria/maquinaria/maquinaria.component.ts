import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from 'src/app/services/rest-api.service';
import { MaquinaInterface } from 'src/app/interface/maquinas.interfase';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-maquinaria',
  templateUrl: './maquinaria.component.html',
  styleUrls: ['./maquinaria.component.css']
})
export class MaquinariaComponent implements OnInit {

  public NUEVA_MAQUINA: boolean = false;
  public NUEVO_GRUPO: boolean = false;
  public MAQUINAS: MaquinaInterface[] = [];
  public FUNCIONES = [];
  public FASES = [];
  public GRUPOS = [];

  public MaquinaID

  public EDITAR_MAQUINA: boolean = false;


  maquinaForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    tipo: ['', Validators.required],
    colores: [''],
    cph: ['', Validators.required],
    precio: ['', Validators.required],
    reparacion: ['', Validators.required]
  })

  constructor(private fb: FormBuilder,
    private api: RestApiService) {
    this.usuario = api.usuario
  }

  ngOnInit(): void {
    this.ObtenerMaquinas();
    this.obtenerGrupos();
  }

  public usuario

  public Modal_Maquina() {
    if (this.NUEVA_MAQUINA) {
      this.NUEVA_MAQUINA = false;
    } else {
      this.NUEVA_MAQUINA = true;
    }
  }

  Edicion_Modal_Maquina() {
    if (this.EDITAR_MAQUINA) {
      this.EDITAR_MAQUINA = false;
    } else {
      this.EDITAR_MAQUINA = true;
    }
  }

  EditarMaquina(id) {
    this.Edicion_Modal_Maquina();
    this.api.getMaquinaID(id)
      .subscribe((resp: any) => {
        this.MaquinaID = resp;
      })
  }

  Finalizar_Edicion_M() {
    this.MaquinaID.tipo = this.MaquinaID.tipo.toUpperCase()

    this.api.putMaquina(this.MaquinaID._id, this.MaquinaID)
      .subscribe((resp: any) => {
        this.ObtenerMaquinas();
        this.Edicion_Modal_Maquina()
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Edición realizada con exito',
          showConfirmButton: false,
          timer: 1500

        })
      })
  }

  nuevaMaquina() {
    this.api.PostMaquinas(this.maquinaForm.value)
      .subscribe(resp => {
        this.maquinaForm.reset();
        this.NUEVA_MAQUINA = false;
        this.ObtenerMaquinas();
      })
  }

  ObtenerMaquinas() {
    this.api.GetMaquinas()
      .subscribe(maquinas => {
        this.MAQUINAS = maquinas;
        this.obtenerTipos();
      });
  }

  BorrarMaquina_(id) {
    Swal.fire({
      title: '¿Estas Seguro?',
      text: 'No podras revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Si, Eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.BorrarMaquina(id)
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Esta maquina ha sido eliminada',
          showConfirmButton: false,
          timer: 1500
        })
      }
    })
  }

  EliminarGrupo_(id) {
    Swal.fire({
      title: '¿Estas Seguro?',
      text: 'La eliminación de grupos afecta de manera negativa si ya existen productos creados en el sistema',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Si, Eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.EliminarGrupo(id)
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Este grupo ha sido eliminado',
          showConfirmButton: false,
          timer: 1500
        })
      }
    })
  }

  EliminarGrupo(id) {
    this.api.deleteGrupo(id)
      .subscribe((resp: any) => {
        this.obtenerGrupos();
      })
  }

  BorrarMaquina(id: any) {
    this.api.DeleteMaquinas(id)
      .subscribe(resp => {
        this.ObtenerMaquinas();
      })
  }

  // ----------------------GRUPOS -------------

  public Modal_Grupo() {
    if (this.NUEVO_GRUPO) {
      this.NUEVO_GRUPO = false
    } else {
      this.NUEVO_GRUPO = true
    }
  }

  obtenerTipos() {
    let x = this.MAQUINAS.length;
    for (let i = 0; i < x; i++) {
      let inde = this.FUNCIONES.includes(this.MAQUINAS[i].tipo)
      if (!inde) {
        this.FUNCIONES.push(this.MAQUINAS[i].tipo)
      }
    }
  }

  agregarTipo() {
    let este = (<HTMLInputElement>document.getElementById('tipos')).value;
    let inde = this.FASES.includes(este)
    if (!inde) {
      this.FASES.push(este)
    }
  }

  obtenerGrupos() {
    this.api.getGrupos()
      .subscribe((resp: any) => {
        this.GRUPOS = resp.grupos
      })
  }

  nuevoTipo() {
    let name = (<HTMLInputElement>document.getElementById('name')).value;

    let nuevoTipo = {
      nombre: name,
      tipos: this.FASES
    }

    // AGREGAR A LA BASE DE DATOS****************
    this.api.PostGrupos(nuevoTipo)
      .subscribe(resp => {
        this.obtenerGrupos();
        this.NUEVO_GRUPO = false
      })

  }




}
