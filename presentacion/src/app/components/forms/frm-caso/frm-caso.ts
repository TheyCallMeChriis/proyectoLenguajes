import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CasoService } from '../../../shared/services/caso-service';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';

@Component({
  selector: 'app-frm-caso',

  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './frm-caso.html',
  styleUrls: ['./frm-caso.css'],
})
export class FrmCaso implements OnInit {
  titulo!: string;
  myForm: FormGroup;

  private data = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<FrmCaso>);
  private builder = inject(FormBuilder);
  private srvCaso = inject(CasoService);
  private dialog = inject(MatDialog);

  constructor() {
    this.myForm = this.builder.group({
      id: [0], // id interno, para edición
      idTecnico: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(15),
        ],
      ],
      idCreador: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(15),
        ],
      ],
      idArtefacto: [null, [Validators.required]],
      descripcion: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(100),
        ],
      ],
    });
  }

  ngOnInit() {
    this.titulo = this.data.title ?? 'Formulario Caso';

    if (this.data.datos) {
      // Modo edición
      this.myForm.patchValue({
        id: this.data.datos.id ?? 0,
        idTecnico: this.data.datos.idTecnico ?? '',
        idCreador: this.data.datos.idCreador ?? '',
        idArtefacto: this.data.datos.idArtefacto ?? null,
        descripcion: this.data.datos.descripcion ?? '',
      });
    } else {
      // Modo creación (puedes precargar algún idCreador si lo tienes guardado)
      this.myForm.patchValue({
        id: 0,
        idTecnico: '',
        idCreador: '',
        idArtefacto: null,
        descripcion: '',
      });
    }
  }

  get F() {
    return this.myForm.controls;
  }

  onGuardar() {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }

    const datos = this.myForm.value;

    if (datos.id === 0) {
      // Crear nuevo caso (sin id)
      // Elimina 'id' antes de enviar porque el backend no espera ese campo al crear
      const { id, ...payload } = datos;
      this.srvCaso.guardar(payload).subscribe({
        next: () => {
          this.dialog.open(DialogoGeneral, {
            data: {
              texto: 'Caso creado correctamente',
              titulo: 'Caso creado',
              icono: 'check',
              textoAceptar: 'Aceptar',
            },
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.dialog.open(DialogoGeneral, {
            data: {
              texto: 'Error al crear el caso: ' + err,
              titulo: 'Error',
              icono: 'error',
              textoAceptar: 'Aceptar',
            },
          });
        },
      });
    } else {
      // Actualizar caso (usa el id)
      this.srvCaso.guardar(datos, datos.id).subscribe({
        next: () => {
          this.dialog.open(DialogoGeneral, {
            data: {
              texto: 'Caso actualizado correctamente',
              titulo: 'Caso actualizado',
              icono: 'check',
              textoAceptar: 'Aceptar',
            },
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.dialog.open(DialogoGeneral, {
            data: {
              texto: 'Error al actualizar el caso: ' + err,
              titulo: 'Error',
              icono: 'error',
              textoAceptar: 'Aceptar',
            },
          });
        },
      });
    }
  }
}
