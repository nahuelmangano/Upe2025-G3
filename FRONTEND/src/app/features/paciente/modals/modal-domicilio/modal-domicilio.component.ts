import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';

export interface ModalSimpleTextData {
  title: string;
  label: string;
  value?: string;
}

@Component({
  selector: 'app-modal-domicilio',
  templateUrl: './modal-domicilio.component.html',
  styleUrls: ['./modal-domicilio.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class ModalDomicilioComponent {
  formulario: FormGroup;
  titulo: string;
  etiqueta: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModalDomicilioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalSimpleTextData
  ) {
    this.titulo = data.title;
    this.etiqueta = data.label;
    this.formulario = this.fb.group({
      texto: [data.value || '', Validators.required]
    });
  }

  guardar() {
    if (this.formulario.valid) {
      this.dialogRef.close(this.formulario.value.texto);
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}