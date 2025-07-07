export interface TipoTecnico {
    id?: number;           
    idTecnico: string;     
    nombre: string;
    apellido1: string;
    apellido2: string;
    telefono: string;
    celular: string;
    direccion: string;
    correo: string;
    rol?: string;          
}

export interface IToken{
    token : string,
    tkRef : string;
}