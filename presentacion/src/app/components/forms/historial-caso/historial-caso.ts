import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CasoService } from '../../../shared/services/caso-service';
import { PrintService } from '../../../shared/services/print-service';
import { TipoHistorial } from '../../../shared/models/interface';

@Component({
  selector: 'app-historial-caso',
  imports: [
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './historial-caso.html',
  styleUrl: './historial-caso.css'
})
export class HistorialCaso implements OnInit {
  
  private readonly casoService = inject(CasoService);
  private readonly printService = inject(PrintService);
  private readonly dialogRef = inject(MatDialogRef<HistorialCaso>);
  private readonly cdr = inject(ChangeDetectorRef);
  public readonly data = inject(MAT_DIALOG_DATA);

  historial: TipoHistorial[] = [];

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    const idCaso = this.data?.idCaso || this.data?.id || this.data?.caso?.id;
    
    if (!idCaso) {
      console.error('No se encontró ID del caso en los datos');
      return;
    }

    this.casoService.historial(idCaso).subscribe({
      next: (data) => {
        this.historial = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.historial = [];
        this.cdr.detectChanges();
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  getEstadoIcon(estado: number): string {
    switch(estado) {
      case 0: return 'task_alt'; // Aceptado
      case 1: return 'search'; // Diagnosticado
      case 2: return 'pending'; // Esperando Aprobación
      case 3: return 'inventory'; // Esperando Repuesto
      case 4: return 'build'; // Reparado
      case 5: return 'cancel'; // Sin Solución
      case 6: return 'check_circle'; // Entregado
      default: return 'help';
    }
  }

  getEstadoColor(estado: number): string {
    switch(estado) {
      case 0: return 'text-blue-600'; // Aceptado
      case 1: return 'text-orange-600'; // Diagnosticado
      case 2: return 'text-yellow-600'; // Esperando Aprobación
      case 3: return 'text-purple-600'; // Esperando Repuesto
      case 4: return 'text-green-600'; // Reparado
      case 5: return 'text-red-600'; // Sin Solución
      case 6: return 'text-emerald-600'; // Entregado
      default: return 'text-gray-600';
    }
  }

  getEstadoBorderColor(estado: number): string {
    switch(estado) {
      case 0: return 'border-blue-500'; // Aceptado
      case 1: return 'border-orange-500'; // Diagnosticado
      case 2: return 'border-yellow-500'; // Esperando Aprobación
      case 3: return 'border-purple-500'; // Esperando Repuesto
      case 4: return 'border-green-500'; // Reparado
      case 5: return 'border-red-500'; // Sin Solución
      case 6: return 'border-emerald-500'; // Entregado
      default: return 'border-gray-500';
    }
  }

  getEstadoTexto(estado: number): string {
    switch(estado) {
      case 0: return 'Aceptado';
      case 1: return 'Diagnosticado';
      case 2: return 'Esperando Aprobación';
      case 3: return 'Esperando Repuesto';
      case 4: return 'Reparado';
      case 5: return 'Sin Solución';
      case 6: return 'Entregado';
      default: return 'Estado desconocido';
    }
  }

  onImprimir(): void {
    const idCaso = this.data?.idCaso || this.data?.id || this.data?.caso?.id;
    
    const encabezado = [
      'Fecha', 'Estado', 'Responsable', 'Descripción'
    ];
    
    const cuerpo = this.historial.map((item: TipoHistorial) => {
      return [
        this.formatearFecha(item.fechaCambio),
        this.getEstadoTexto(item.estado),
        item.idResponsable || '',
        item.descripcion || ''
      ];
    });
    
    this.printService.print(
      encabezado, 
      cuerpo, 
      `Historial del Caso ${idCaso}`, 
      true
    );
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
