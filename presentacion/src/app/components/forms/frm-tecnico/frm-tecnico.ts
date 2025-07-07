import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';

import { TecnicoService } from '../../../shared/services/tecnico-service';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';

@Component({
  selector: 'app-frm-tecnico',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatFormFieldModule
  ],
  templateUrl: './frm-tecnico.html',
  styleUrl: './frm-tecnico.css'
})
export class FrmTecnico implements OnInit {
  titulo!: string;
  srvTecnico = inject(TecnicoService);
  private data = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);
  dialogRef = inject(MatDialogRef<FrmTecnico>);
  private builder = inject(FormBuilder);

  myForm: FormGroup;

  constructor() {
    this.myForm = this.builder.group({
      id: [0],
      idTecnico: ['', [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(15),
        Validators.pattern('[0-9]*')
      ]],
      nombre: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30),
        Validators.pattern('([A-Za-zÑñáéíóú]*)( ([A-Za-zÑñáéíóú]*)){0,1}')
      ]],
      apellido1: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30),
        Validators.pattern('([A-Za-zÑñáéíóú]*)')
      ]],
      apellido2: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30),
        Validators.pattern('([A-Za-zÑñáéíóú]*)')
      ]],
      telefono: ['', [Validators.pattern('[0-9]{8}')]],
      celular: ['', [
        Validators.required,
        Validators.pattern('[0-9]{8}')
      ]],
      direccion: ['', [
        Validators.minLength(10),
        Validators.maxLength(255)
      ]],
      correo: ['', [
        Validators.required,
        Validators.email
      ]]
    });
  }

  get F() {
    return this.myForm.controls;
  }

  onGuardar() {
    const datos = this.myForm.value;
    if (datos.id === 0) {
      this.srvTecnico.guardar(datos).subscribe({
        complete: () => {
          this.dialog.open(DialogoGeneral, {
            data: {
              texto: 'Técnico creado correctamente',
              titulo: 'Técnico creado',
              icono: 'check',
              textoAceptar: 'Aceptar'
            }
          });
          this.dialogRef.close();
        }
      });
    } else {
      this.srvTecnico.guardar(datos, datos.id).subscribe({
        complete: () => {
          this.dialog.open(DialogoGeneral, {
            data: {
              texto: 'Técnico actualizado correctamente',
              titulo: 'Técnico actualizado',
              icono: 'check',
              textoAceptar: 'Aceptar'
            }
          });
          this.dialogRef.close();
        }
      });
    }
  }

  ngOnInit() {
    this.titulo = this.data.title;
    if (this.data.datos) {
      this.myForm.setValue({
        id: this.data.datos.id,
        idTecnico: this.data.datos.idTecnico,
        nombre: this.data.datos.nombre,
        apellido1: this.data.datos.apellido1,
        apellido2: this.data.datos.apellido2,
        telefono: this.data.datos.telefono,
        celular: this.data.datos.celular,
        direccion: this.data.datos.direccion,
        correo: this.data.datos.correo
      });
    }
  }
}