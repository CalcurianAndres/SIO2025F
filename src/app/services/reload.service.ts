import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ReloadService {
  socket: any;

  constructor() {
    this.socket = io('http://192.168.0.27:8080');

    this.socket.on("reload", () => {
      console.log("Nueva versión detectada. Recargando...");
      window.location.reload();
    });

    this.socket.on("nueva-requisicion", (data) => {
      console.log("Nueva requisición recibida:", data);
      // Aquí puedes agregar lógica adicional para manejar la nueva requisición
    });

    this.socket.on('requisicion_aceptada', (data) => {
      console.log("Nueva requisición aceptada:", data);
    });



  }
}