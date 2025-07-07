export interface CasoFormData {
  id?: number;          // Opcional, solo para editar casos existentes
  idTecnico: string;    // VARCHAR(15)
  idCreador?: string;   // Opcional, se puede agregar si quieres asignar quién crea el caso
  idArtefacto: number;  // INT
  descripcion: string;  // VARCHAR(100)
}