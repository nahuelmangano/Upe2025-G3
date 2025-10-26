import {Component,TemplateRef, ViewChild,ChangeDetectionStrategy,ChangeDetectorRef,NgZone,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {FormBuilder,FormGroup,FormArray, Validators, ReactiveFormsModule} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom, forkJoin } from 'rxjs';
import { TipoCampoService } from '../../../services/tipo-campo.service';
import { PlantillaService } from '../../../services/plantilla.service';
import { CampoService } from '../../../services/campo.service';
import { Plantilla } from '../../../interfaces/plantilla';
import { Campo } from '../../../interfaces/campo';
import { ResponseApi } from '../../../interfaces/response-api';
import { UtilidadService } from '../../../reutilizable/utilidad.service';

@Component({
  selector: 'app-plantilla',
  standalone: true,
  templateUrl: './plantilla.html',
  styleUrls: ['./plantilla.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
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
export class PlantillaComponent implements OnInit {
  @ViewChild('previsualizacionDialog') previsualizacionDialog!: TemplateRef<any>;

  formulario: FormGroup;
  tiposCampos: any[] = [];
  seccionSeleccionadaIndex: number | null = null;

  plantillaId: number | null = null;
  modoEdicion: boolean = false;
  tipoSeccionId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tipoCampoService: TipoCampoService,
    private plantillaService: PlantillaService,
    private campoService: CampoService,
    private utilidadService: UtilidadService,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private dialog: MatDialog
  ) {
    this.formulario = this.fb.group({
      nombrePlantilla: ['', Validators.required],
      descripcion: [''],
      secciones: this.fb.array([])
    });
  }

  get secciones(): FormArray {
    return this.formulario.get('secciones') as FormArray;
  }

  ngOnInit(): void {
  this.cargarTiposCampo();

  this.route.params.subscribe(params => {
    if (params['id']) {
      this.plantillaId = +params['id'];
      this.modoEdicion = true;
      const plantilla = history.state?.plantilla;

      if (plantilla && Array.isArray(plantilla.secciones)) {
        this.formulario.patchValue({
          nombrePlantilla: plantilla.nombre,
          descripcion: plantilla.descripcion
        });

        plantilla.secciones.forEach((sec: any, i: number) => {
          const campoForms = sec.campos.map((campo: any) =>
            this.crearCampoFormGroup(campo)
          );

          const seccionFG = this.fb.group({
            titulo: [sec.titulo ?? `Sección ${i + 1}`, Validators.required],
            campos: this.fb.array(campoForms)
          });

          this.secciones.push(seccionFG);
        });
        this.cdRef.detectChanges();
      } else {
        this.cargarPlantillaParaEditar(this.plantillaId);
      }
    }
  });
}


  cargarTiposCampo(): void {
    this.tipoCampoService.lista().subscribe({
      next: (res: ResponseApi) => {
        if (res.estado && Array.isArray(res.valor)) {
          const tipos = res.valor;
          const tipoSeccion = tipos.find((t: any) => t.nombre === '__SECCION__');
          this.tipoSeccionId = tipoSeccion?.id || null;
          this.tiposCampos = tipos.filter((t: any) => t.nombre !== '__SECCION__');
          this.cdRef.markForCheck();
        }
      },
    });
  }

  private cargarPlantillaParaEditar(id: number): void {
    const medicoId = this.utilidadService.obtenerUsuarioId();
    this.plantillaService.listaPorMedico(medicoId).subscribe({
      next: (res: ResponseApi) => {
        const plantilla = res.valor?.find((p: any) => p.id === id);
        if (plantilla) {
          this.formulario.patchValue({
            nombrePlantilla: plantilla.nombre,
            descripcion: plantilla.descripcion
          });
          this.cargarCamposParaEditar(id);
        }
      }
    });
  }

  private cargarCamposParaEditar(plantillaId: number): void {
    this.campoService.lista(plantillaId).subscribe({
      next: (res: ResponseApi) => {
        if (res.estado && Array.isArray(res.valor)) {
          const campos = res.valor.filter((c: any) => c.activo).sort((a: any, b: any) => a.orden - b.orden);
          let seccionActual: FormGroup | null = null;
          campos.forEach((campo: any) => {
            if (campo.tipoCampoNombre === '__SECCION__') {
              seccionActual = this.fb.group({
                titulo: [campo.etiqueta, Validators.required],
                campos: this.fb.array([])
              });
              this.secciones.push(seccionActual);
            } else if (seccionActual) {
              const camposArray = seccionActual.get('campos') as FormArray;
              camposArray.push(this.crearCampoFormGroup(campo));
            }
          });
          this.cdRef.detectChanges();
        }
      },
      error: (err) => {
        this.utilidadService.mostrarAlerta('Error al cargar los campos', 'Error');
      }
    });
  }

  private crearCampoFormGroup(campo: any): FormGroup {
    return this.fb.group({
      id: [campo.id],
      etiqueta: [campo.etiqueta, Validators.required],
      tipoCampoId: [campo.tipoCampoId, Validators.required],
      tipoCampoNombre: [campo.tipoCampoNombre],
      obligatorio: [campo.obligatorio],
      opciones: [campo.opciones ?? ''],
      orden: [campo.orden]
    });
  }

  agregarSeccion(): void {
    this.secciones.push(
      this.fb.group({
        titulo: ['', Validators.required],
        campos: this.fb.array([])
      })
    );
    if (this.seccionSeleccionadaIndex === null) {
      this.seccionSeleccionadaIndex = this.secciones.length - 1;
    }
    this.cdRef.detectChanges();
  }

  seleccionarSeccion(index: number): void {
    this.seccionSeleccionadaIndex = index;
  }

  eliminarSeccion(index: number): void {
    this.secciones.removeAt(index);
    if (this.seccionSeleccionadaIndex === index) {
      this.seccionSeleccionadaIndex = null;
    }
    this.cdRef.detectChanges();
  }

  agregarCampo(seccionIndex: number, tipoCampo: any): void {
    const campos = this.secciones.at(seccionIndex).get('campos') as FormArray;
    campos.push(this.fb.group({
      etiqueta: ['', Validators.required],
      tipoCampoId: [tipoCampo.id, Validators.required],
      tipoCampoNombre: [tipoCampo.nombre],
      obligatorio: [false],
      opciones: [''],
      orden: [campos.length + 1]
    }));
    this.cdRef.detectChanges();
  }

  agregarCampoASeccionSeleccionada(tipoCampo: any): void {
    const idx = this.seccionSeleccionadaIndex;
    if (idx === null || idx < 0) {
      this.utilidadService.mostrarAlerta(
        'Seleccioná una sección antes de agregar un campo.',
        'Atención'
      );
      return;
    }
    this.agregarCampo(idx, tipoCampo);
  }

  eliminarCampo(seccionIndex: number, campoIndex: number): void {
    const campos = this.secciones.at(seccionIndex).get('campos') as FormArray;
    campos.removeAt(campoIndex);
    this.cdRef.detectChanges();
  }

  esCampoConOpciones(tipoNombre: string | null | undefined): boolean {
    if (!tipoNombre) return false;
    const lower = tipoNombre.toLowerCase();
    return lower === 'selección única' || lower === 'selección múltiple';
  }

  onTipoCampoChange(seccionIndex: number, campoIndex: number, tipoId: number): void {
    const seccion = this.secciones.at(seccionIndex) as FormGroup;
    const campos = seccion.get('campos') as FormArray;
    const campo = campos.at(campoIndex) as FormGroup;
    const tipoSeleccionado = this.tiposCampos.find((t: any) => t.id === tipoId);
    if (tipoSeleccionado) {
      campo.patchValue({
        tipoCampoId: tipoSeleccionado.id,
        tipoCampoNombre: tipoSeleccionado.nombre
      });
    }
    if (!this.esCampoConOpciones(tipoSeleccionado?.nombre || '')) {
      campo.patchValue({ opciones: '' });
    }
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  getInputType(tipo: string | null | undefined): string {
    if (!tipo) return 'text';
    const n = tipo.toLowerCase();
    switch (n) {
      case 'texto corto': return 'text';
      case 'texto largo': return 'textarea';
      case 'número entero': return 'number';
      case 'número decimal': return 'decimal';
      case 'fecha y hora': return 'datetime-local';
      case 'archivo': return 'file';
      case 'email': return 'email';
      case 'teléfono': return 'tel';
      case 'casilla de verificación': return 'checkbox';
      case 'selección única': return 'select';
      case 'selección múltiple': return 'multiselect';
      default: return 'text';
    }
  }

  async guardar(): Promise<void> {
  if (this.formulario.invalid) {
    this.utilidadService.mostrarAlerta('Completá todos los datos antes de guardar.', 'Advertencia');
    return;
  }

  try {
    const medicoId = this.utilidadService.obtenerUsuarioId();
    const medicoNombre = this.utilidadService.obtenerNombreCompletoUsuario();

    const plantilla: Plantilla = {
      id: this.plantillaId || 0,
      activo: true,
      descripcion: this.formulario.value.descripcion ?? '',
      nombre: this.formulario.value.nombrePlantilla ?? '',
      medicoId,
      medicoNombre
    };

    let res = this.modoEdicion
      ? await firstValueFrom(this.plantillaService.editar(plantilla))
      : await firstValueFrom(this.plantillaService.crear(plantilla));

    const plantillaId = this.modoEdicion ? this.plantillaId! : res.valor.id;

    if (res.estado) {
      await this.guardarCampos(plantillaId, plantilla.nombre ?? '');
      this.utilidadService.mostrarAlerta(this.modoEdicion ? 'Plantilla actualizada.' : 'Plantilla creada.', 'Éxito');
      this.router.navigate(['/pages/mis-plantillas']);
    }
  } catch (e) {
    this.utilidadService.mostrarAlerta('Error al guardar.', 'Error');
  }
}

private async guardarCampos(pid: number, pname: string): Promise<void> {
  if (this.tipoSeccionId == null) {
    throw new Error('No se pudo obtener el tipo __SECCION__ (tipoSeccionId es null)');
  }

  if (this.modoEdicion) {
    const camposRes = await firstValueFrom(this.campoService.lista(pid));
    if (camposRes.estado) {
      const actives = camposRes.valor.filter((c: any) => c.activo);
      await Promise.all(actives.map((c: any) => firstValueFrom(this.campoService.eliminar(c.id))));
    }
  }
  const camposGuardar: Campo[] = [];
  let orden = 1;
  this.secciones.controls.forEach((seccion, i) => {
    const titulo = seccion.get('titulo')?.value ?? '';
    camposGuardar.push({
      id: 0,
      etiqueta: titulo,
      obligatorio: false,
      opciones: '',
      orden: orden++,
      tipoCampoId: this.tipoSeccionId!,
      tipoCampoNombre: '__SECCION__',
      plantillaId: pid,
      plantillaNombre: pname,
      activo: 1
    });
    const camposArr = seccion.get('campos') as FormArray;
    camposArr.controls.forEach((campoControl: any, j: number) => {
      const v = campoControl.value;
      camposGuardar.push({
        id: 0,
        etiqueta: v.etiqueta ?? '',
        obligatorio: v.obligatorio,
        opciones: v.opciones ?? '',
        orden: orden++,
        tipoCampoId: v.tipoCampoId,
        tipoCampoNombre: v.tipoCampoNombre,
        plantillaId: pid,
        plantillaNombre: pname,
        activo: 1
      });
    });
  });
  await firstValueFrom(forkJoin(camposGuardar.map(c => this.campoService.crear(c))));
}


  deshacer(): void {
    this.formulario.reset();
    this.secciones.clear();
    this.seccionSeleccionadaIndex = null;
    this.cdRef.detectChanges();
  }

  async previsualizar() {
    if (this.formulario.invalid) {
      this.utilidadService.mostrarAlerta('Completa todos los campos antes de previsualizar.', 'Advertencia');
      return;
    }
    const dialogRef = this.dialog.open(this.previsualizacionDialog, {
      width: '750px',
      autoFocus: false,
      data: this.formulario.getRawValue()
    });
    this.formulario.valueChanges.subscribe(valor => {
      if (dialogRef?.componentInstance) {
        this.ngZone.run(() => {
          dialogRef.componentInstance.data = valor;
          this.cdRef.markForCheck();
          this.cdRef.detectChanges();
        });
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/pages/mis-plantillas']);
  }
}
