import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-object-viewer',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule, MatCardModule, CommonModule],
  templateUrl: './object-viewer.html',
  styleUrl: './object-viewer.css'
})
export class ObjectViewer {
  readonly data = inject(MAT_DIALOG_DATA);

  get titulo(): string {
    return this.data?.title || 'Información';
  }

  get datos(): any {
    return this.data?.datos || {};
  }

  get icono(): string {
    return this.data?.icono || 'info';
  }

  // Convierte el objeto en un array de pares clave-valor para mostrar
  get datosArray(): { key: string, value: any, label: string }[] {
    const obj = this.datos;
    if (!obj || typeof obj !== 'object') return [];
    
    return Object.keys(obj)
      .filter(key => key !== 'id' && obj[key] !== null && obj[key] !== undefined)
      .map(key => ({
        key,
        value: obj[key],
        label: this.formatLabel(key)
      }));
  }

  // Formatea la etiqueta del campo (convierte camelCase a título)
  private formatLabel(key: string): string {
    // Mapeo de campos específicos para mejor presentación
    const fieldMap: { [key: string]: string } = {
      'idCliente': 'ID Cliente',
      'idUsuario': 'ID Usuario',
      'serie': 'Serie',
      'marca': 'Marca',
      'modelo': 'Modelo',
      'categoria': 'Categoría',
      'descripcion': 'Descripción',
      'nombre': 'Nombre',
      'apellido': 'Apellido',
      'email': 'Email',
      'telefono': 'Teléfono',
      'direccion': 'Dirección',
      'fechaCreacion': 'Fecha de Creación',
      'fechaModificacion': 'Fecha de Modificación',
      'estado': 'Estado',
      'rol': 'Rol'
    };

    if (fieldMap[key]) {
      return fieldMap[key];
    }

    // Convierte camelCase a título
    return key.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  // Formatea el valor para mostrar
  formatValue(value: any): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toLocaleDateString();
    return JSON.stringify(value);
  }
}
