import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ResponseApi } from '@core/interfaces/response-api';

import { Paciente } from '@features/paciente/interfaces/paciente';
import { Domicilio } from '@features/paciente/interfaces/domicilio';
import { ObraSocial } from '@features/maestros/interfaces/obra-social';
import { Sexo } from '@features/maestros/interfaces/sexo';
import { PacienteService } from '@features/paciente/services/paciente.service';
import { DomicilioService } from '@features/paciente/services/domicilio.service';
import { ObraSocialService } from '@features/maestros/services/obra-social.service';
import { SexoService } from '@features/maestros/services/sexo.service';
import { PacienteObraSocial } from '@features/paciente/interfaces/paciente-obra-social';
import { PacienteObraSocialService } from '@features/paciente/services/paciente-obra-social.service';

import { GeoDataService, Pais, Provincia } from '@shared/services/geo-data.service';

import { ModalDomicilioComponent } from '@features/paciente/modals/modal-domicilio/modal-domicilio.component';
import { ModalObraSocialComponent } from '@features/paciente/modals/modal-obra-social/modal-obra-social.component';

import { ViewportScroller } from '@angular/common';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { SHARED_IMPORTS } from '@shared/shared-imports';


interface PacienteExtendido extends Paciente, Domicilio {
  obraSocialId?: number | null;
  obraSocialNombre?: string | null;
  numeroAfiliado?: string | null;
}

interface RelacionConObra {
  obra: ObraSocial;
  relaciones: PacienteObraSocial[];
}

@Component({
  selector: 'app-editar-paciente-form',
  standalone: true,
  imports: [ ...SHARED_IMPORTS, RouterModule ],
  templateUrl: './editar-paciente-form.html',
  styleUrl: './editar-paciente-form.css'
})
export class EditarPacienteFormComponent {
  formularioPaciente: FormGroup;
  tituloAccion = "Editar Paciente";

  pacienteCargado: Partial<PacienteExtendido> = {};

  listaDomicilios: Domicilio[] = [];
  listaObrasSociales: ObraSocial[] = [];
  listaSexos: Sexo[] = [];
  listaGruposSanguineos: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Lo desconoce'];
  listaNacionalidades: string[] = [];

  domicilioSeleccionado: Domicilio | null = null;

  listaPaisesUnicos: string[] = [];
  listaProvinciasUnicas: string[] = [];
  listaCiudadesUnicas: string[] = [];
  listaCallesUnicas: string[] = [];
  idPaciente?: number;

  listaPaises: Pais[] = [];
  listaProvincias: Provincia[] = [];
  listaCiudades: string[] = [];
  listaCalles: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private scroller: ViewportScroller,
    private _pacienteServicio: PacienteService,
    private _domicilioServicio: DomicilioService,
    private _obraSocialServicio: ObraSocialService,
    private _pacienteObraSocialServicio: PacienteObraSocialService,
    private _sexoServicio: SexoService,
    private _geoDataService: GeoDataService
  ) {
    this.formularioPaciente = this.fb.group({
      nombre: ["", Validators.required],
      apellido: ["", Validators.required],
      dni: ["", [Validators.required, Validators.pattern('^[0-9]*$')]],
      email: [""],
      fechaNac: ["", Validators.required],
      grupoSanguineo: [""],
      nacionalidad: [""],
      ocupacion: [""],
      telefono1: ["", Validators.required],
      telefono2: [""],
      sexoId: [null, Validators.required],
      pais: ["", Validators.required],
      provincia: ["", Validators.required],
      ciudad: ["", Validators.required],
      calle: ["", Validators.required],
      altura: ["", Validators.required],
      piso: [""],
      departamento: [""],
      codigoPostal: [""],
      obraSocialId: [null],
      numeroAfiliado: [""]
    })
    this.formularioPaciente.get('dni')?.disable();
    this.formularioPaciente.get('fechaNac')?.disable();
    this.formularioPaciente.get('grupoSanguineo')?.disable();
  }

  ngOnInit(): void {
    this.idPaciente = Number(this.route.snapshot.paramMap.get('id'));
    this.cargaInicial();
    this.formularioPaciente.get('pais')?.valueChanges.subscribe(paisSeleccionado => {
      this.onSeleccionarPais(paisSeleccionado)
    });

    this.formularioPaciente.get('provincia')?.valueChanges.subscribe(provinciaSeleccionada => {
      this.onSeleccionarProvincia(provinciaSeleccionada);
    });
  }

  cargarObrasSocialesPorUnPacienteParaForm(
    paciente: Paciente,
    listaObras: ObraSocial[]
  ) {
    const llamadas: Observable<RelacionConObra>[] = listaObras.map(obra =>
      this._pacienteObraSocialServicio
        .listaPorPacienteObraSocial(paciente.id!, obra.id!)
        .pipe(
          map((res: ResponseApi) => ({
            obra,
            relaciones: res.valor as PacienteObraSocial[]
          }))
        )
    );

    forkJoin(llamadas).subscribe(resultados => {
      const relacionValida = resultados.find(r => r.relaciones.length > 0);

      if (relacionValida) {
        const relacion = relacionValida.relaciones[0];
        this.pacienteCargado = {
          ...this.pacienteCargado,
          obraSocialNombre: relacionValida.obra.nombre,
          obraSocialId: relacionValida.obra.id,
          numeroAfiliado: relacion.numeroAfiliado
        };

        this.formularioPaciente.patchValue({
          obraSocialId: relacionValida.obra.id,
          numeroAfiliado: relacion.numeroAfiliado
        });
      }
    });

  }

  cargaInicial(): void {
    if (this.idPaciente) {
      this.cargarPacientePorId(this.idPaciente);
    }
  }

  onSeleccionarPais(paisSeleccionado: Pais): void {
    this.formularioPaciente.get('provincia')?.setValue(null);
    this.formularioPaciente.get('ciudad')?.setValue(null);
    this.listaProvincias = paisSeleccionado ? paisSeleccionado.states : [];
    this.listaCiudades = [];
  }

  onSeleccionarProvincia(provinciaSeleccionada: Provincia): void {
    this.formularioPaciente.get('ciudad')?.setValue(null);
    this.listaCiudades = provinciaSeleccionada ? provinciaSeleccionada.cities : [];
  }

  cargarPacientePorId(pacienteId: number): void {

    this._geoDataService.obtenerNacionalidades().subscribe(data => {
      this.listaNacionalidades = data
    });

    this._geoDataService.obtenerUbicaciones().subscribe(data => {
      this.listaPaises = data

      forkJoin({
        pacientes: this._pacienteServicio.lista(),
        obras: this._obraSocialServicio.lista(),
        domicilios: this._domicilioServicio.lista()
      }).subscribe(({ pacientes, obras, domicilios }) => {
        const listaPacientes = pacientes.valor as Paciente[];
        const listaObras = obras.valor as ObraSocial[];
        const listaDomicilios = domicilios.valor as Domicilio[];

        const pacienteData = listaPacientes.find(p => p.id === pacienteId);

        if (!pacienteData) {
          this._snackBar.open('No se encontró el paciente', 'Cerrar', { duration: 3000 });
          return;
        }

        const domicilioData = listaDomicilios.find(d => d.id === pacienteData.domicilioId);

        this.procesarListasDeCalles(listaDomicilios);

        if (pacienteData) {
          this.pacienteCargado = { ...pacienteData, ...domicilioData };
        }

        const paisSeleccionado = this.listaPaises.find(
          p => p.country_name_es === domicilioData?.pais
        );

        this.listaProvincias = paisSeleccionado ? paisSeleccionado.states : [];

        const provinciaSeleccionada = this.listaProvincias.find(
          pr => pr.state_name === domicilioData?.provincia
        );

        this.listaCiudades = provinciaSeleccionada ? provinciaSeleccionada.cities : [];

        const ciudadSeleccionada = this.listaCiudades.find(
          c => c === domicilioData?.ciudad
        );

        this.formularioPaciente.patchValue({
          ...pacienteData,
          pais: paisSeleccionado || null,
          provincia: provinciaSeleccionada || null,
          ciudad: ciudadSeleccionada || null,
          calle: domicilioData?.calle,
          altura: domicilioData?.altura,
          piso: domicilioData?.piso,
          departamento: domicilioData?.departamento,
          codigoPostal: domicilioData?.codigoPostal
        });

        this._sexoServicio.lista().subscribe(data => this.listaSexos = data.valor);
        this._sexoServicio.lista().subscribe({
          next: (sexos: ResponseApi) => {
            if (sexos.estado && sexos.valor) {
              const listaSexos = sexos.valor as Sexo[];
              const sexoData = listaSexos.find(s => s.id === pacienteData.sexoId);
              this.formularioPaciente.patchValue({
                sexoId: sexoData?.id,
                sexoNombre: sexoData?.nombre
              })
            }
          },
          error: () => this._snackBar.open('No se pudo cargar la lista de sexos para procesar.', 'Cerrar', { duration: 3000 })
        })

        this._obraSocialServicio.lista().subscribe(data => this.listaObrasSociales = data.valor);
        this.cargarObrasSocialesPorUnPacienteParaForm(pacienteData, listaObras);
      });
    });
  }

  private procesarListasDeCalles(domicilios: Domicilio[]) {
    const callesSet = new Set<string>();
    domicilios[0].id
    domicilios.forEach(d => {
      if (d.calle) callesSet.add(d.calle);
    });
    this.listaCalles = Array.from(callesSet).sort();
  }

  abrirModalSimple(tipo: string, etiqueta: string) {
    const dialogRef = this.dialog.open(ModalDomicilioComponent, {
      disableClose: true,
      data: { title: `Agregar ${tipo}`, label: etiqueta }
    });

    dialogRef.afterClosed().subscribe(nuevoValor => {
      this.listaCalles.push(nuevoValor);
      this.listaCalles.sort();
      this.formularioPaciente.get('calle')?.setValue(nuevoValor);
    });
  }

  getDomicilioSeleccionado(): Domicilio | undefined {
    const id = this.formularioPaciente.get('domicilioId')?.value;
    return this.listaDomicilios.find(d => d.id === id);
  }

  getObraSocialSeleccionada(): ObraSocial | undefined {
    const id = this.formularioPaciente.get('obraSocialId')?.value;
    return this.listaObrasSociales.find(os => os.id === id);
  }

  abrirModalDomicilio(domicilioEditar?: Domicilio) {
    const dialogRef = this.dialog.open(ModalDomicilioComponent, {
      disableClose: true,
      data: domicilioEditar
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        if (domicilioEditar) {
          const index = this.listaDomicilios.findIndex(d => d.id === resultado.id);
          if (index !== -1) {
            this.listaDomicilios[index] = resultado;
          }
        } else {
          this.listaDomicilios.push(resultado);
        }
        this.formularioPaciente.get('domicilioId')?.setValue(resultado.id);
      }
    });
  }

  abrirModalObraSocial(obraSocialEditar?: ObraSocial) {
    const dialogRef = this.dialog.open(ModalObraSocialComponent, {
      disableClose: true,
      data: obraSocialEditar
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        if (obraSocialEditar) {
          const index = this.listaObrasSociales.findIndex(os => os.id === resultado.id);
          if (index !== -1) {
            this.listaObrasSociales[index] = resultado;
          }
        } else {
          this.listaObrasSociales.push(resultado);
        }
        this.formularioPaciente.get('obraSocialId')?.setValue(resultado.id);
      }
    });
  }

  abrirModalDomicilioSeleccionado() {
    const domicilio = this.getDomicilioSeleccionado();
    if (domicilio) {
      this.abrirModalDomicilio(domicilio);
    }
  }

  abrirModalObraSocialSeleccionada() {
    const obraSocial = this.getObraSocialSeleccionada();
    if (obraSocial) {
      this.abrirModalObraSocial(obraSocial);
    }
  }

  private normalizarValor(valor: any): any {
    if (valor === null || valor === undefined) return undefined;

    if (typeof valor === 'string' && valor.trim() === '') return undefined;

    if (valor && typeof valor === 'object') {
      if ('country_name_es' in valor) return valor.country_name_es;
      if ('state_name' in valor) return valor.state_name;
      return JSON.stringify(valor);
    }

    return valor;
  }

  private seModificoDomicilio(cambios: object): boolean {
    const camposDomicilio = [
      "pais",
      "provincia",
      "ciudad",
      "calle",
      "altura",
      "piso",
      "departamento",
      "codigoPostal"
    ];

    return Object.keys(cambios).some(key => camposDomicilio.includes(key));
  }

  private seModificoObraSocial(cambios: object): boolean {
    const camposObraSocial = ["obraSocialId", "numeroAfiliado"];
    return Object.keys(cambios).some(key => camposObraSocial.includes(key));
  }

  private _editarRelacionPacienteObraSocial(pacienteId: number, obraSocialId: number, numeroAfiliado?: string) {
    this._pacienteObraSocialServicio.listaPorPacienteObraSocial(pacienteId, obraSocialId).subscribe({
      next: (resp: ResponseApi) => {
        if (resp.estado) {
          const relacionObtenida: PacienteObraSocial = {
            ...resp.valor[0]
          }
          const relacionEditar: PacienteObraSocial = {
            id: relacionObtenida.id,
            vigenteDesde: relacionObtenida.vigenteDesde,
            activo: relacionObtenida.activo,
            pacienteId: relacionObtenida.pacienteId,
            pacienteNombre: relacionObtenida.pacienteNombre,
            obraSocialId: relacionObtenida.obraSocialId,
            obraSocialNombre: relacionObtenida.obraSocialNombre,
            numeroAfiliado: numeroAfiliado
          }

          this._pacienteObraSocialServicio.editar(relacionEditar).subscribe({
            next: (resp: ResponseApi) => {
              if (resp.estado) {
                this._snackBar.open('Paciente editado con éxito', 'Cerrar', { duration: 3000 });
                this.formularioPaciente.disable();
                setTimeout(() => this.router.navigate(['/recepcionista/pacientes']).then(() => {
                  this.scroller.scrollToPosition([0, 0]);
                }), 3000);
              } else {
                this._snackBar.open('Error al editar la obra social', 'Error', { duration: 3000 });
              }
            }
          });
        }
      },
      error: () => {
        this._snackBar.open('Error al obtener la obra social', 'Error', { duration: 3000 });
      }

    })
  }

  guardarRelacionPacienteObraSocial(): void {
    const formValues = this.formularioPaciente.value;
    const obraSocialSeleccionadaId = formValues.obraSocialId;
    const numeroAfiliado = formValues.numeroAfiliado;
    if (obraSocialSeleccionadaId === this.pacienteCargado.obraSocialId) {
      this._editarRelacionPacienteObraSocial(this.idPaciente!, this.pacienteCargado.obraSocialId!, numeroAfiliado);
    } else {
      if (obraSocialSeleccionadaId === null) {
        this._snackBar.open('Debe seleccionar una obra social para agregar el número de afiliado', 'Error', { duration: 3000 });
        return;
      }
      if (numeroAfiliado.trim() === '') {
        this._snackBar.open('Debe seleccionar agregar el número de afiliado a la obra social', 'Error', { duration: 3000 });
        return;
      }
      this._crearRelacionPacienteObraSocial(this.idPaciente!, Number(obraSocialSeleccionadaId), numeroAfiliado);
    }
  }

  private _crearRelacionPacienteObraSocial(pacienteId: number, obraSocialId: number, numeroAfiliado?: string) {
    const relacion: PacienteObraSocial = {
      activo: 1,
      pacienteId,
      obraSocialId,
      vigenteDesde: new Date(),
      numeroAfiliado: numeroAfiliado ?? null
    };

    this._pacienteObraSocialServicio.crear(relacion).subscribe({
      next: (resp: ResponseApi) => {
        if (resp.estado) {
          this._snackBar.open('Paciente editado con éxito', 'Cerrar', { duration: 3000 });
          this.formularioPaciente.disable();
          setTimeout(() => this.router.navigate(['/recepcionista/pacientes']).then(() => {
            this.scroller.scrollToPosition([0, 0]);
          }), 3000);
        } else {
          this._snackBar.open('Error al asociar la obra social', 'Error', { duration: 3000 });
        }
      },
      error: () => {
        this._snackBar.open('Error al asociar la obra social', 'Error', { duration: 3000 });
      }
    });
  }

  editarPaciente(cambios: Partial<PacienteExtendido>, paciente: Paciente): void {
    this._pacienteServicio.editar(paciente).subscribe({
      next: (resp: ResponseApi) => {
        if (resp.estado && resp.valor) {
          if (this.seModificoObraSocial(cambios)) {
            this.guardarRelacionPacienteObraSocial();
          } else {
            this._snackBar.open('Paciente editado con éxito', 'Cerrar', { duration: 3000 });
            this.formularioPaciente.disable();
            setTimeout(() => this.router.navigate(['/recepcionista/pacientes']).then(() => {
              this.scroller.scrollToPosition([0, 0]);
            }), 3000);
          }
        } else {
          this._snackBar.open('Error al editar paciente', 'Error', { duration: 3000 });
        }
      },
      error: () => {
        this._snackBar.open('Hubo un error en el proceso', 'Cerrar', { duration: 3000 });
      }
    });
  }

  guardarPaciente(): void {
    const formValues = this.formularioPaciente.value;
    const cambios: Partial<PacienteExtendido> = {};

    (Object.keys(formValues) as (keyof PacienteExtendido)[]).forEach(key => {

      const original = this.normalizarValor(this.pacienteCargado[key]);
      const actual = this.normalizarValor(formValues[key]);

      if (original !== actual) {
        cambios[key] = actual;
      }
    });

    if (Object.keys(cambios).length > 0) {

      if (this.seModificoDomicilio(cambios)) {

        const nuevoDomicilio: Domicilio = {
          pais: formValues.pais.country_name_es,
          provincia: formValues.provincia.state_name,
          ciudad: formValues.ciudad,
          calle: formValues.calle,
          altura: formValues.altura.toString() ?? '',
          piso: formValues.piso,
          departamento: formValues.departamento,
          codigoPostal: formValues.codigoPostal
        };

        this._domicilioServicio.crear(nuevoDomicilio).subscribe({
          next: (domicilioResponse: ResponseApi) => {
            if (!domicilioResponse.estado) {
              this._snackBar.open('Error al crear el domicilio', 'Error', { duration: 3000 });
              return;
            }
            const domicilioCreado = domicilioResponse.valor as Domicilio;

            const paciente: Paciente = {
              id: this.idPaciente,
              nombre: formValues.nombre,
              apellido: formValues.apellido,
              dni: this.pacienteCargado.dni!,
              email: formValues.email,
              fechaNac: this.pacienteCargado.fechaNac!,
              grupoSanguineo: this.pacienteCargado.grupoSanguineo!,
              nacionalidad: formValues.nacionalidad,
              ocupacion: formValues.ocupacion,
              telefono1: formValues.telefono1,
              telefono2: formValues.telefono2,
              domicilioId: domicilioCreado.id,
              domicilioCiudad: domicilioCreado.ciudad,
              sexoId: formValues.sexoId,
              sexoNombre: this.listaSexos[formValues.sexoId - 1].nombre,
              activo: 1
            };

            this.editarPaciente(cambios, paciente);
          },
          error: () => {
            this._snackBar.open('Hubo un error al crear el domicilio', 'Error', { duration: 3000 });
          }
        });
        return;
      }

      if (this.seModificoObraSocial(cambios)) {
        this.guardarRelacionPacienteObraSocial();
        return;
      }

      const paciente: Paciente = {
        id: this.idPaciente,
        nombre: formValues.nombre,
        apellido: formValues.apellido,
        dni: this.pacienteCargado.dni!,
        email: formValues.email,
        fechaNac: this.pacienteCargado.fechaNac!,
        grupoSanguineo: this.pacienteCargado.grupoSanguineo!,
        nacionalidad: formValues.nacionalidad,
        ocupacion: formValues.ocupacion,
        telefono1: formValues.telefono1,
        telefono2: formValues.telefono2,
        domicilioId: this.pacienteCargado.domicilioId,
        domicilioCiudad: this.pacienteCargado.ciudad,
        sexoId: formValues.sexoId,
        sexoNombre: this.listaSexos[formValues.sexoId - 1].nombre,
        activo: 1
      };

      this.editarPaciente(cambios, paciente);
    } else {
      this._snackBar.open('No se modificó ningún dato del paciente.', 'Cerrar', { duration: 3000 });
    }
  }

  cancelarGuardarPaciente(): void {
    this.router.navigate(['/recepcionista/pacientes']).then(() => {
      this.scroller.scrollToPosition([0, 0]);
    })
  }
}
