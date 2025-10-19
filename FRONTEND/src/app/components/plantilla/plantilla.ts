import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
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
import { Plantilla } from 'src/app/interfaces/plantilla';
import { Campo } from 'src/app/interfaces/campo';
import { ResponseApi } from '../../interfaces/response-api';

@Component({
  selector: 'app-plantilla',
  standalone: true,
  templateUrl: './plantilla.html',
  styleUrls: ['./plantilla.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule
  ],
  providers: [FormBuilder]
})
export class PlantillaComponent {
  @ViewChild('previsualizacionDialog') previsualizacionDialog!: TemplateRef<any>;

  formulario: FormGroup;
  tiposCampos: any[] = [];
  tipoSeleccionado: any = null;

  constructor(
    private fb: FormBuilder,
    private tipoCampoService: TipoCampoService,
    private plantillaService: PlantillaService,
    private campoService: CampoService,
    private dialog: MatDialog
  ) {
    this.formulario = this.fb.group({
      nombrePlantilla: ['', Validators.required],
      descripcion: [''],
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

  agregarCampo(seccionIndex: number, tipoCampo: any) {
    const campos = this.secciones.at(seccionIndex).get('campos') as FormArray;
    const campo = this.fb.group({
      etiqueta: ['', Validators.required],
      tipoCampoId: [tipoCampo.id, Validators.required],
      tipoCampoNombre: [tipoCampo.nombre],
      obligatorio: [false],
      opciones: [''],
      orden: [campos.length + 1]
    });
    campos.push(campo);
  }

  eliminarCampo(seccionIndex: number, campoIndex: number) {
    const campos = this.secciones.at(seccionIndex).get('campos') as FormArray;
    campos.removeAt(campoIndex);
  }

  agregarCampoUltimaSeccion(tipoCampo: any) {
    if (this.secciones.length === 0) {
      alert('Se necesita agregar primero una sección para poder añadir campos.');
      return;
    }
    const index = this.secciones.length - 1;
    this.agregarCampo(index, tipoCampo);
  }

  onTipoCampoChange(seccionIndex: number, campoIndex: number, tipoId: number) {
    const campo = (this.secciones.at(seccionIndex).get('campos') as FormArray).at(campoIndex);
    const tipo = this.tiposCampos.find(t => t.id === tipoId);
    campo.patchValue({ tipoCampoNombre: tipo ? tipo.nombre : '' });

    if (!this.esCampoConOpciones(tipo ? tipo.nombre : '')) {
      campo.patchValue({ opciones: '' });
    }
  }

  esCampoConOpciones(tipoNombre: string): boolean {
    if (!tipoNombre) return false;
    const t = tipoNombre.toLowerCase();
    return t === 'selección única' || t === 'selección múltiple';
  }

  getInputType(tipo: string): string {
    if (!tipo) return 'text';
    const nombre = tipo.toLowerCase();
    switch (nombre) {
      case 'texto corto':
        return 'text';
      case 'texto largo':
        return 'textarea';
      case 'número entero':
        return 'number';
      case 'número decimal':
        return 'decimal';
      case 'fecha y hora':
        return 'datetime-local';
      case 'archivo':
        return 'file';
      case 'email':
        return 'email';
      case 'teléfono':
        return 'tel';
      case 'casilla de verificación':
        return 'checkbox';
      case 'selección única':
      case 'selección múltiple':
        return 'select';
      default:
        return 'text';
    }
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
    if (!this.formulario.valid) {
      alert('Completa todos los campos antes de guardar.');
      return;
    }

    const plantillaGuardar: Plantilla = {
      id: 0,
      activo: true,
      descripcion: this.formulario.value.descripcion || '',
      nombre: this.formulario.value.nombrePlantilla,
      medicoId: 0,
      medicoNombre: ''
    };

    this.plantillaService.crear(plantillaGuardar).subscribe({
      next: (res: ResponseApi) => {
        if (res.estado && res.valor && res.valor.id) {
          const plantillaId = res.valor.id;
          this.guardarCampos(plantillaGuardar, plantillaId);
        } else {
          alert('Error al crear la plantilla');
        }
      },
      error: (err) => console.error('Error al guardar plantilla', err)
    });
  }

  private guardarCampos(plantilla: Plantilla, plantillaId: number) {
    const camposGuardar: Campo[] = [];

    this.secciones.controls.forEach((seccion, indexSeccion) => {
      const camposArr = seccion.get('campos') as FormArray;
      camposArr.controls.forEach((campoControl, indexCampo) => {
        const value = campoControl.value;
        camposGuardar.push({
          id: 0,
          etiqueta: value.etiqueta,
          obligatorio: !!value.obligatorio,
          opciones: value.opciones || '',
          orden: indexCampo + 1,
          tipoCampoId: value.tipoCampoId,
          tipoCampoNombre: value.tipoCampoNombre,
          plantillaId: plantillaId,
          plantillaNombre: plantilla.nombre,
          activo: 1
        });
      });
    });

    camposGuardar.forEach(campo => {
      this.campoService.crear(campo).subscribe({
        next: () => {},
        error: (err) => console.error('Error al guardar campo', err)
      });
    });

    alert('Plantilla y campos creados correctamente.');
    this.deshacer();
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
