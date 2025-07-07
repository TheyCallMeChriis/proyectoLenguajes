export interface TipoAdministrador {
  id?: number;
  idAdministrador: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  telefono: string;
  celular: string;
  direccion: string;
  correo: string;
}
export interface IToken{
    token : string,
    tkRef : string;
}