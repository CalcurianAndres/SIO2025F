import { environment } from 'src/environments/environment';

export class Usuario {
    constructor(
        public estado: boolean, 
        public _id: string,
        public Nombre: string, 
        public Apellido: string, 
        public Correo: string,
        public Departamento:string,
        public Role: string,
        public Nueva_orden: Number,
        public Consulta:Number,
        public Almacen:Number,
        public Maquinaria:Number,
        public Planificacion:Number,
        public Gestiones:Number,
        public Despacho:Number,
        public Estadisticas:Number,
        public Precios:Number,
        public pin: string,
        public laboratorio: String
    ) {}
}