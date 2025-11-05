import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
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
import { SHARED_IMPORTS } from '@shared/shared-imports';


@Component({
  selector: 'app-paciente-form',
  templateUrl: './crear-paciente-form.html',
  styleUrls: ['./crear-paciente-form.css'],
  standalone: true,
  imports: [ ...SHARED_IMPORTS, RouterModule ]
})
export class CrearPacienteFormComponent implements OnInit {
  formularioPaciente: FormGroup;
  tituloAccion = "Agregar Nuevo Paciente";

  listaDomicilios: Domicilio[] = [];
  listaObrasSociales: ObraSocial[] = [];
  listaSexos: Sexo[] = [];
  listaGruposSanguineos: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Lo desconoce'];
  listaNacionalidades: string[] = [];

  domicilioSeleccionado: Domicilio | null = null;

  listaPaisesUnicos: string[] = [];
  listaProvinciasUnicas: string[] = [];
  listaCiudadesUnicas: string[] = [];

  listaPaises: Pais[] = [];
  listaProvincias: Provincia[] = [];
  listaCiudades: string[] = [];
  listaCalles: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private router: Router,
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
    });
  }

  ngOnInit(): void {
    this.cargarListas();
  }

  cargarListas() {
    this._obraSocialServicio.lista().subscribe(data => this.listaObrasSociales = data.valor);
    this._sexoServicio.lista().subscribe(data => this.listaSexos = data.valor);

    this._geoDataService.obtenerNacionalidades().subscribe(data => {
      this.listaNacionalidades = data
    })

    this.procesarListasDeDomicilios();

    this.formularioPaciente.get('pais')?.valueChanges.subscribe(paisSeleccionado => {
      this.onSeleccionarPais(paisSeleccionado)
    });

    this.formularioPaciente.get('provincia')?.valueChanges.subscribe(provinciaSeleccionada => {
      this.onSeleccionarProvincia(provinciaSeleccionada);
    });

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

  private procesarListasDeDomicilios(): void {
    const callesSet = new Set<string>();
    let domicilios: Domicilio[];

    this._geoDataService.obtenerUbicaciones().subscribe(data => {
      this.listaPaises = data
    });

    this._domicilioServicio.lista().subscribe({
      next: (data: ResponseApi) => {
        if (data.estado && data.valor) {
          domicilios = data.valor as Domicilio[];
          domicilios.forEach(d => {
            if (d.calle) callesSet.add(d.calle);
          });
          this.listaCalles = Array.from(callesSet).sort();
        }
      },
      error: () => console.error("No se pudo cargar la lista de calles para procesar.")
    });
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

  cancelarGuardarPaciente(): void {
    this.router.navigate(['/recepcionista/pacientes']).then(() => {
      this.scroller.scrollToPosition([0, 0]);
    })
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
          this._snackBar.open('Paciente creado con éxito', 'Cerrar', { duration: 3000 });
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

  guardarPaciente() {
    if (this.formularioPaciente.invalid) {
      this._snackBar.open('Por favor, complete los campos requeridos.', 'Cerrar', { duration: 3000 });
      return;
    }

    const formValues = this.formularioPaciente.value;

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
          nombre: formValues.nombre,
          apellido: formValues.apellido,
          dni: formValues.dni,
          email: formValues.email,
          fechaNac: formValues.fechaNac,
          grupoSanguineo: formValues.grupoSanguineo,
          nacionalidad: formValues.nacionalidad,
          ocupacion: formValues.ocupacion,
          telefono1: formValues.telefono1,
          telefono2: formValues.telefono2,
          sexoId: formValues.sexoId,
          domicilioId: domicilioCreado.id,
          activo: 1
        };

        this._pacienteServicio.crear(paciente).subscribe({
          next: (pacienteResponse: ResponseApi) => {
            if (!pacienteResponse.estado) {
              this._snackBar.open('Error al crear el paciente', 'Error', { duration: 3000 });
              return;
            }

            const pacienteCreado = pacienteResponse.valor as Paciente;
            const obraSocialSeleccionadaId = formValues.obraSocialId;

            if (!obraSocialSeleccionadaId) {
              this._snackBar.open('Paciente creado sin obra social', 'Cerrar', { duration: 3000 });
              this.formularioPaciente.disable();
              setTimeout(() => this.router.navigate(['/recepcionista/pacientes']).then(() => {
                this.scroller.scrollToPosition([0, 0]);
              }), 3000);
              return;
            }

            this._crearRelacionPacienteObraSocial(pacienteCreado.id!, obraSocialSeleccionadaId, formValues.numeroAfiliado);
          },
          error: () => {
            this._snackBar.open('Hubo un error en el proceso', 'Cerrar', { duration: 3000 });
          }
        });
      },
      error: () => {
        this._snackBar.open('Hubo un error al crear el domicilio', 'Error', { duration: 3000 });
      }
    });

  }
}