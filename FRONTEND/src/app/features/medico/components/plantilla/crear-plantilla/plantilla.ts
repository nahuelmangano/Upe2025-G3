import { Component, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef,NgZone, OnInit} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom, forkJoin } from 'rxjs';
import { TipoCampoService } from '@features/medico/services/tipo-campo.service';
import { PlantillaService } from '@features/medico/services/plantilla.service';
import { CampoService } from '@features/medico/services/campo.service';
import { Plantilla } from '@features/medico/interfaces/plantilla';
import { Campo } from '@features/medico/interfaces/campo';
import { ResponseApi } from '@core/interfaces/response-api';
import { UtilidadService } from '@core/services/utilidad.service';
import { MedicoService } from '@features/medico/services/medico.service';
import { SHARED_IMPORTS } from '@shared/shared-imports';

@Component({
  selector: 'app-plantilla',
  standalone: true,
  templateUrl: './plantilla.html',
  styleUrls: ['./plantilla.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ ...SHARED_IMPORTS, RouterModule ],
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
    private dialog: MatDialog,
    private medicoService: MedicoService
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
      }
    });
  }

  private cargarCamposParaEditar(plantillaId: number): void {
  this.campoService.lista(plantillaId).subscribe({
    next: (res: ResponseApi) => {
      if (res.estado && Array.isArray(res.valor)) {
        const campos = res.valor
          .filter((c: any) => c.activo)
          .sort((a: any, b: any) => a.orden - b.orden);
        let seccionActual: FormGroup | null = null;
        campos.forEach((campo: any) => {
          if (
            campo.tipoCampoNombre === '__SECCION__' ||
            campo.tipoCampoId === this.tipoSeccionId
          ) {
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
      },
      error: () => {
        this.utilidadService.mostrarAlerta('Error al cargar la plantilla para editar.', 'Error');
      }
    });
  }

  private obtenerNombreTipoCampo(tipoCampoId: number | null | undefined): string {
    if (tipoCampoId == null) return '';
    const tipo = this.tiposCampos.find(t => t.id === tipoCampoId);
    return tipo?.nombre || '';
  }

  private crearCampoFormGroup(campo: any): FormGroup {
    return this.fb.group({
      id: [campo.id],
      etiqueta: [campo.etiqueta, Validators.required],
      tipoCampoId: [campo.tipoCampoId, Validators.required],
      tipoCampoNombre: [campo.tipoCampoNombre ?? this.obtenerNombreTipoCampo(campo.tipoCampoId)],
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
    } else {
      campo.patchValue({
        tipoCampoNombre: ''
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

  getDescripcionTipoCampo(tipo: string | null | undefined): string {
  if (!tipo) return '';
  switch (tipo.toLowerCase()) {
    case 'texto corto': return 'Texto breve, una sola línea.';
    case 'texto largo': return 'Texto largo, varias líneas, por ejemplo observaciones.';
    case 'número entero': return 'Números sin decimales. Ej: edad, cantidad.';
    case 'número decimal': return 'Números decimales, con coma o punto. Ej: peso, altura.';
    case 'fecha y hora': return 'Fecha y/o hora seleccionable.';
    case 'archivo': return 'Permite cargar un archivo.';
    case 'email': return 'Dirección de correo electrónico.';
    case 'teléfono': return 'Número de teléfono.';
    case 'casilla de verificación': return 'Opción seleccionable tipo check.';
    case 'selección única': return 'Lista de opciones, sólo una respuesta posible.';
    case 'selección múltiple': return 'Lista de opciones, permite múltiples respuestas.';
    default: return '';
  }
}

  getIconoTipoCampo(tipo: string | null | undefined): string {
    if (!tipo) return 'help_outline';
    switch (tipo.toLowerCase()) {
      case 'texto corto': return 'short_text';
      case 'texto largo': return 'subject';
      case 'número entero': return 'tag';
      case 'número decimal': return 'calculate';
      case 'fecha y hora': return 'event';
      case 'archivo': return 'attach_file';
      case 'email': return 'alternate_email';
      case 'teléfono': return 'call';
      case 'casilla de verificación': return 'check_box';
      case 'selección única': return 'radio_button_checked';
      case 'selección múltiple': return 'checklist';
      case '__seccion__': return 'view_agenda';
      default: return 'device_unknown';
    }
  }

  async guardar(): Promise<void> {
  if (this.formulario.invalid) {
    this.utilidadService.mostrarAlerta('Completá todos los datos antes de guardar.', 'Advertencia');
    return;
  }

  try {
    const userId = this.utilidadService.obtenerUsuarioId();
    const resp = await firstValueFrom(this.medicoService.lista()); 
    if (!resp.estado || !resp.valor) {
      this.utilidadService.mostrarAlerta('Error al buscar médico', 'Error');
      return;
    }

    console.log(userId);
    

    const medico = resp.valor.find((m: any) => m.usuarioId === userId);
    console.log(medico);
    if (!medico) {
      this.utilidadService.mostrarAlerta('No se encontró el médico correspondiente al usuario', 'Error');
      return;
    }

    const medicoId = medico.id;
    const medicoNombre = `${medico.usuarioNombre} ${medico.usuarioApellido}`;

    const plantilla: Plantilla = {
      id: this.plantillaId || 0,
      activo: true,
      descripcion: this.formulario.value.descripcion ?? '',
      nombre: this.formulario.value.nombrePlantilla ?? '',
      medicoId: medicoId,
      medicoNombre: medicoNombre
    };

    let res = this.modoEdicion
      ? await firstValueFrom(this.plantillaService.editar(plantilla))
      : await firstValueFrom(this.plantillaService.crear(plantilla));

    const plantillaId = this.modoEdicion ? this.plantillaId! : res.valor.id;
    if (res.estado) {
      await this.guardarCampos(plantillaId, plantilla.nombre ?? '');
      this.utilidadService.mostrarAlerta(this.modoEdicion ? 'Plantilla actualizada.' : 'Plantilla creada.', 'Éxito');
      this.router.navigate(['/medico/mis-plantillas']);
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
          tipoCampoNombre: v.tipoCampoNombre ?? this.obtenerNombreTipoCampo(v.tipoCampoId),
          plantillaId: pid,
          plantillaNombre: pname,
          activo: 1
        });
      });
    });
    await firstValueFrom(forkJoin(camposGuardar.map(c => this.campoService.crear(c))));
  }

  deshacer(): void {
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
    this.router.navigate(['/medico/mis-plantillas']);
  }
}
