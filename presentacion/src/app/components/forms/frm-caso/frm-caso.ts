import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CasoService } from '../../../shared/services/caso-service';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';
import { AuthService } from '../../../shared/services/auth-service';

@Component({
  selector: 'app-frm-caso',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatInputModule, ReactiveFormsModule, MatFormFieldModule],
  templateUrl: './frm-caso.html',
  styleUrl: './frm-caso.css'
})
export class FrmCaso implements OnInit {
  titulo!: string;

  private srvCaso = inject(CasoService);
  private srvAuth = inject(AuthService);
  private data = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  dialogRef = inject(MatDialogRef<FrmCaso>);

  private builder = inject(FormBuilder);
  myForm: FormGroup;

  constructor() {
    this.myForm = this.builder.group({
      id: [0],
      idTecnico: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(15)]],
      idCreador: [''], // Removemos las validaciones ya que se asigna automáticamente
      idArtefacto: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(15)]],
      descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      fechaEntrada: [''],
      fechaSalida: ['']
    });
  }

  get F() {
    return this.myForm.controls;
  }

  get usuarioActual(): string {
    return `${this.srvAuth.userActual.nombre} (${this.srvAuth.userActual.idUsuario})`;
  }

  onGuardar() {
  // Clonamos los datos del formulario
  const datosFormulario = { ...this.myForm.value };

  // Asignar automáticamente el idCreador del usuario logueado
  datosFormulario.idCreador = this.srvAuth.userActual.idUsuario;

  // Validar y convertir idArtefacto a número
  if (!datosFormulario.idArtefacto || isNaN(Number(datosFormulario.idArtefacto))) {
    this.dialog.open(DialogoGeneral, {
      data: {
        texto: 'Debe ingresar un número válido para el artefacto.',
        icono: 'warning',
        textoAceptar: 'Aceptar'
      }
    });
    return;
  }

  // Convertir explícitamente idArtefacto a número
  datosFormulario.idArtefacto = Number(datosFormulario.idArtefacto);

  // También puedes hacer lo mismo con idTecnico si es numérico:
  // datosFormulario.idTecnico = Number(datosFormulario.idTecnico);

  const observableGuardar = this.myForm.value.id === 0
    ? this.srvCaso.guardar(datosFormulario)
    : this.srvCaso.guardar(datosFormulario, this.myForm.value.id);

  observableGuardar?.subscribe({
    complete: () => {
      this.dialog.open(DialogoGeneral, {
        data: {
          texto: this.myForm.value.id === 0
            ? 'Caso insertado correctamente'
            : 'Caso modificado correctamente',
          icono: 'check',
          textoAceptar: 'Aceptar'
        }
      });
      this.dialogRef.close(true);
    },
    error: (err) => {
      this.dialog.open(DialogoGeneral, {
        data: {
          texto: 'Error al guardar el caso. Inténtelo de nuevo.',
          icono: 'error',
          textoAceptar: 'Aceptar'
        }
      });
    }
  });
}

  ngOnInit(): void {
    this.titulo = this.data.title;
    
    // Asignar automáticamente el idCreador del usuario logueado para casos nuevos
    if (!this.data.datos) {
      this.myForm.patchValue({
        idCreador: this.srvAuth.userActual.idUsuario
      });
    }
    
    if (this.data.datos) {
      this.myForm.setValue({
        id: this.data.datos.id,
        idTecnico: this.data.datos.idTecnico,
        idCreador: this.data.datos.idCreador,
        idArtefacto: this.data.datos.idArtefacto, //  contiene la serie directamente
        descripcion: this.data.datos.descripcion,
        fechaEntrada: this.data.datos.fechaEntrada || '',
        fechaSalida: this.data.datos.fechaSalida || ''
      });
    }
  }
}
