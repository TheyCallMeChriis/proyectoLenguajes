import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { CasoService } from '../../../shared/services/caso-service';
import { AuthService } from '../../../shared/services/auth-service';

interface EstadoOpcion {
  valor: number;
  texto: string;
  descripcion: string;
  color: string;
  icono: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-cambio-estado-caso',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './cambio-estado-caso.html',
  styleUrl: './cambio-estado-caso.css'
})
export class CambioEstadoCaso implements OnInit {
  
  private readonly fb = inject(FormBuilder);
  private readonly casoService = inject(CasoService);
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<CambioEstadoCaso>);
  public readonly data = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  cargando = false;
  error = false;
  mensajeError = '';

  estadosDisponibles: EstadoOpcion[] = [
    {
      valor: 0,
      texto: 'Aceptado',
      descripcion: 'El caso ha sido aceptado para revisión',
      color: 'text-blue-600',
      icono: 'task_alt'
    },
    {
      valor: 1,
      texto: 'Diagnosticado',
      descripcion: 'Se ha realizado el diagnóstico del problema',
      color: 'text-orange-600',
      icono: 'search'
    },
    {
      valor: 2,
      texto: 'Esperando Aprobación',
      descripcion: 'Esperando aprobación del cliente para proceder',
      color: 'text-yellow-600',
      icono: 'pending'
    },
    {
      valor: 3,
      texto: 'Esperando Repuesto',
      descripcion: 'En espera de repuestos necesarios',
      color: 'text-purple-600',
      icono: 'inventory'
    },
    {
      valor: 4,
      texto: 'Reparado',
      descripcion: 'La reparación ha sido completada',
      color: 'text-green-600',
      icono: 'build'
    },
    {
      valor: 5,
      texto: 'Sin Solución',
      descripcion: 'No se pudo encontrar solución al problema',
      color: 'text-red-600',
      icono: 'cancel'
    },
    {
      valor: 6,
      texto: 'Entregado',
      descripcion: 'El artefacto ha sido entregado al cliente',
      color: 'text-emerald-600',
      icono: 'check_circle'
    }
  ];

  ngOnInit(): void {
    this.inicializarFormulario();
    this.filtrarEstadosDisponibles();
  }

  inicializarFormulario(): void {
    this.form = this.fb.group({
      nuevoEstado: ['', [Validators.required]],
      descripcion: ['', [Validators.maxLength(500)]]
    });
  }

  filtrarEstadosDisponibles(): void {
    const estadoActual = this.data.estadoActual;
    this.estadosDisponibles = this.estadosDisponibles.map(estado => {
      let disabled = false;

      // Si el estado actual es 'Sin Solución', solo permitir 'Entregado'
      if (estadoActual === 5) {
        disabled = estado.valor !== 6; // Solo habilita 'Entregado'
      } else {
        // No permitir volver a estados anteriores (excepto casos específicos)
        if (estado.valor < estadoActual) {
          disabled = true;
        }
        // No permitir el estado actual
        if (estado.valor === estadoActual) {
          disabled = true;
        }
        // Estados finales, no permiten cambios
        if (estadoActual === 6) {
          disabled = true;
        }
      }
      return { ...estado, disabled };
    });
  }

  onSubmit(): void {
    if (this.form.valid && !this.cargando) {
      this.cargando = true;
      this.error = false;

      const payload = {
        estado: this.form.value.nuevoEstado,
        idResponsable: this.authService.userActual.idUsuario,
        descripcion: this.form.value.descripcion || ''
      };

      this.casoService.cambiarEstado(this.data.idCaso, payload).subscribe({
        next: (response) => {
          this.cargando = false;
          this.dialogRef.close({
            cambiado: true,
            nuevoEstado: payload.estado,
            descripcion: payload.descripcion
          });
        },
        error: (err) => {
          console.error('Error al cambiar estado:', err);
          this.error = true;
          this.mensajeError = err.error?.message || 'Error al cambiar el estado del caso';
          this.cargando = false;
        }
      });
    }
  }

  cerrar(): void {
    this.dialogRef.close({ cambiado: false });
  }

  getEstadoActualTexto(): string {
    const estado = this.estadosDisponibles.find(e => e.valor === this.data.estadoActual);
    return estado ? estado.texto : 'Estado desconocido';
  }

  getEstadoActualColor(): string {
    const estado = this.estadosDisponibles.find(e => e.valor === this.data.estadoActual);
    return estado ? estado.color : 'text-gray-600';
  }

  getEstadoActualIcono(): string {
    const estado = this.estadosDisponibles.find(e => e.valor === this.data.estadoActual);
    return estado ? estado.icono : 'help';
  }

  getEstadoSeleccionadoTexto(): string {
    const valorSeleccionado = this.form.get('nuevoEstado')?.value;
    const estado = this.estadosDisponibles.find(e => e.valor === valorSeleccionado);
    return estado ? estado.texto : '';
  }

  getEstadoSeleccionadoColor(): string {
    const valorSeleccionado = this.form.get('nuevoEstado')?.value;
    const estado = this.estadosDisponibles.find(e => e.valor === valorSeleccionado);
    return estado ? estado.color : 'text-gray-600';
  }

  getEstadoSeleccionadoIcono(): string {
    const valorSeleccionado = this.form.get('nuevoEstado')?.value;
    const estado = this.estadosDisponibles.find(e => e.valor === valorSeleccionado);
    return estado ? estado.icono : 'help';
  }
}
