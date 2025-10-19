import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TipoCampoService } from '../../services/tipo-campo.service';
import { PlantillaService } from '../../services/plantilla.service';
import { CampoService } from '../../services/campo.service';
import { ResponseApi } from '../../interfaces/response-api';

@Component({
  selector: 'app-plantilla',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule
  ],
  providers: [FormBuilder],
  templateUrl: './plantilla.html',
  styleUrls: ['./plantilla.css']
})
export class PlantillaComponent {
  @ViewChild('previsualizacionDialog') previsualizacionDialog!: TemplateRef<any>;

  formulario: FormGroup;
  tiposCampos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private tipoCampoService: TipoCampoService,
    private plantillaService: PlantillaService,
    private campoService: CampoService,
    private dialog: MatDialog
  ) {
    this.formulario = this.fb.group({
      nombrePlantilla: ['', Validators.required],
      secciones: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.cargarTiposCampo();
  }

  cargarTiposCampo(): void {
    this.tipoCampoService.lista().subscribe({
      next: (res: ResponseApi) => {
        if (res.estado && Array.isArray(res.valor)) {
          this.tiposCampos = res.valor;
        }
      },
      error: (err) => console.error('Error HTTP al cargar tipos de campo:', err)
    });
  }

  get secciones(): FormArray {
    return this.formulario.get('secciones') as FormArray;
  }

  agregarSeccion() {
    const seccion = this.fb.group({
      titulo: ['', Validators.required],
      campos: this.fb.array([])
    });
    this.secciones.push(seccion);
  }

  eliminarSeccion(index: number) {
    this.secciones.removeAt(index);
  }

  agregarCampo(seccionIndex: number) {
    const campos = this.secciones.at(seccionIndex).get('campos') as FormArray;
    const campo = this.fb.group({
      etiqueta: ['', Validators.required],
      tipoCampoId: [null, Validators.required]
    });
    campos.push(campo);
  }

  eliminarCampo(seccionIndex: number, campoIndex: number) {
    const campos = this.secciones.at(seccionIndex).get('campos') as FormArray;
    campos.removeAt(campoIndex);
  }

  drop(event: CdkDragDrop<FormGroup[]>, seccionIndex: number) {
    const campos = this.secciones.at(seccionIndex).get('campos') as FormArray;
    moveItemInArray(campos.controls, event.previousIndex, event.currentIndex);
  }

  previsualizar() {
    if (this.formulario.valid) {
      this.dialog.open(this.previsualizacionDialog, {
        width: '600px',
        data: this.formulario.value
      });
    } else {
      alert('Por favor complete todos los campos requeridos antes de previsualizar.');
    }
  }

  guardar() {
    if (this.formulario.valid) {
      const plantillaGuardar: plantilla = {
      id: 0, // o el id para editar si aplica
      activo: true,
      descripcion: '', // si tienes un campo descripción, adaptarlo
      nombre: this.formulario.value.nombrePlantilla,
      medicoId: 0, // asignar el id correspondiente según contexto
      medicoNombre: '',


    };
      console.log(' Datos guardados:', this.formulario.value);
    }
  }

  deshacer() {
    this.formulario.reset();
    this.secciones.clear();
  }

  obtenerNombreTipo(id: number): string {
    const tipo = this.tiposCampos.find(t => t.id === id);
    return tipo ? tipo.nombre : 'Desconocido';
  }
}
