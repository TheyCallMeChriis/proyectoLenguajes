export interface TipoOficinista {
  id?: number;             // id autoincremental (no se envía al crear)
  idOficinista: string;    // cédula u otro identificador
  nombre: string;
  apellido1: string;
  apellido2: string;
  telefono: string;
  celular: string;
  direccion: string;
  correo: string;
  rol?: number;            // opcional, se obtiene desde la vista (no se envía al guardar)
}
export interface IToken{
    token : string,
    tkRef : string;
}