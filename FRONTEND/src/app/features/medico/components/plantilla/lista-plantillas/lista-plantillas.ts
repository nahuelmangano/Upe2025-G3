import { Component, OnInit, inject, ViewChild, TemplateRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PlantillaService } from '@features/medico/services/plantilla.service';
import { CampoService } from '@features/medico/services/campo.service';
import { TipoCampoService } from '@features/medico/services/tipo-campo.service';
import { UtilidadService } from '@core/services/utilidad.service';
import { ResponseApi } from '@core/interfaces/response-api';
import { MedicoService } from '@features/medico/services/medico.service';
import { SHARED_IMPORTS } from '@shared/shared-imports';


interface Seccion {
  titulo: string;
  campos: any[];
}

@Component({
  selector: 'app-lista-plantillas',
  standalone: true,
  templateUrl: './lista-plantillas.html',
  styleUrls: ['./lista-plantillas.css'],
  imports: [ ...SHARED_IMPORTS, RouterModule, DatePipe ]
})
export class ListaPlantillasComponent implements OnInit {
  private medicoService = inject(MedicoService);
  private plantillaService = inject(PlantillaService);
  private campoService = inject(CampoService);
  private tipoCampoService = inject(TipoCampoService);
  private utilidadService = inject(UtilidadService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  @ViewChild('previsualizacionDialog') previsualizacionDialog!: TemplateRef<any>;

  filtro: string = '';
  dataSource: any[] = [];
  todasPlantillas: any[] = [];
  tiposCampos: any[] = [];

  ngOnInit(): void {
    this.cargarTiposCampo();
    this.cargarPlantillasDelMedico();
  }

  private cargarTiposCampo(): void {
    this.tipoCampoService.lista().subscribe({
      next: (res: ResponseApi) => {
        if (res.estado && Array.isArray(res.valor)) {
          this.tiposCampos = res.valor;
        }
      },
    });
  }

cargarPlantillasDelMedico(): void {
  const userId = this.utilidadService.obtenerUsuarioId();

  this.medicoService.lista().subscribe({
    next: (medicosResp: ResponseApi) => {
      if (medicosResp.estado && Array.isArray(medicosResp.valor)) {
        const medico = medicosResp.valor.find((m: any) => m.usuarioId === userId);
        if (!medico) {
          this.utilidadService.mostrarAlerta('No se encontró el médico correspondiente al usuario', 'Error');
          return;
        }

        const medicoId = medico.id;

        this.plantillaService.listaPorMedico(medicoId).subscribe({
          next: (res: ResponseApi) => {
            if (res.estado && Array.isArray(res.valor)) {
              const activas = res.valor.filter(p => p.activo === true);
              this.dataSource = activas;
              this.todasPlantillas = activas;
            }
          },
          error: (err) => {
            this.utilidadService.mostrarAlerta('Error al cargar las plantillas', 'Error');
          }
        });
      }
    },
    error: (err) => {
      this.utilidadService.mostrarAlerta('Error al cargar los médicos', 'Error');
    }
  });
}



  filtrarPlantillas(valor: string | null): void {
    if (!valor) {
      this.dataSource = [...this.todasPlantillas];
      return;
    }
    const busqueda = valor.toLowerCase();
    this.dataSource = this.todasPlantillas.filter(p =>
      (p.nombre || '').toLowerCase().includes(busqueda) ||
      (p.descripcion || '').toLowerCase().includes(busqueda)
    );
  }

  editarPlantilla(plantilla: any): void {
  this.campoService.lista(plantilla.id).subscribe({
    next: (res: ResponseApi) => {
      if (res.estado && Array.isArray(res.valor)) {
        const camposFiltrados = res.valor
          .filter(c => c.activo === 1 || c.activo === true)
          .sort((a, b) => a.orden - b.orden);

        const SECCION_TIPO_ID = 12;

        const secciones: any[] = [];
        let seccionActual: any | null = null;

        camposFiltrados.forEach((campo) => {
          if (campo.tipoCampoId === SECCION_TIPO_ID) {
            seccionActual = {
              titulo: campo.etiqueta || 'Sección sin título',
              campos: []
            };
            secciones.push(seccionActual);
          } else if (seccionActual) {
            seccionActual.campos.push(campo);
          }
        });
        const plantillaCompleta = {
          ...plantilla,
          secciones
        };
        this.router.navigate(['/medico/plantillas', plantilla.id], {
          state: { plantilla: plantillaCompleta }
        });
      } else {
        this.utilidadService.mostrarAlerta(
          'No se encontraron campos para esta plantilla.',
          'Información'
        );
      }
    },
    error: (err) => {
      this.utilidadService.mostrarAlerta(
        'Error al preparar la plantilla para editar.',
        'Error'
      );
    }
  });
}




  verPlantilla(plantilla: any): void {
    this.campoService.lista(plantilla.id).subscribe({
      next: (res: ResponseApi) => {
        if (res.estado && Array.isArray(res.valor)) {
          const campos = res.valor
            .filter(c => c.activo === 1 || c.activo === true)
            .sort((a, b) => a.orden - b.orden)
            .map(campo => ({
              ...campo,
              tipoCampoNombre: this.obtenerNombreTipoCampo(campo.tipoCampoId),
              valor: campo.valor ?? ''
            }));
          const secciones: Seccion[] = [];
          let seccionActual: Seccion | null = null;
          campos.forEach((campo, index) => {
            if (campo.tipoCampoNombre === '__SECCION__') {
              seccionActual = {
                titulo: campo.etiqueta || 'Sección sin título',
                campos: []
              };
              secciones.push(seccionActual);
            } else {
              if (!seccionActual) {
                seccionActual = { titulo: 'Campos sin sección', campos: [] };
                secciones.push(seccionActual);
              }
              seccionActual.campos.push(campo);
            }
          });
          const datosDialog = {
            nombrePlantilla: plantilla.nombre,
            descripcion: plantilla.descripcion,
            secciones
          };

          this.dialog.open(this.previsualizacionDialog, {
            data: datosDialog,
            width: '750px',
            autoFocus: false
          });
        } else {
        }
      },
      error: (err) => {
        this.utilidadService.mostrarAlerta('Error al cargar los campos de la plantilla.', 'Error');
      }
    });
  }

eliminarPlantilla(plantilla: any): void {
  const confirmar = confirm(`¿Seguro que deseas eliminar la plantilla "${plantilla.nombre}"?`);
  if (!confirmar) return;
  const plantillaInactiva = { ...plantilla, activo: false };

  this.plantillaService.editar(plantillaInactiva).subscribe({
    next: (res: ResponseApi) => {
      if (res.estado) {
        this.utilidadService.mostrarAlerta(
          `La plantilla "${plantilla.nombre}" fue eliminada correctamente.`,
          'Éxito'
        );
        this.dataSource = this.dataSource.filter(p => p.id !== plantilla.id);
      } else {
        this.utilidadService.mostrarAlerta(
          res.mensaje || 'No se pudo eliminar la plantilla.',
          'Error'
        );
      }
    },
    error: (err) => {
      this.utilidadService.mostrarAlerta('Error al eliminar la plantilla.', 'Error');
    }
  });
}


  private obtenerNombreTipoCampo(tipoCampoId: number): string {
    const tipo = this.tiposCampos.find(t => t.id === tipoCampoId);
    return tipo?.nombre || 'Texto Corto';
  }

  completarPlantilla(plantilla: any): void {
    this.utilidadService.mostrarAlerta(`Completar plantilla: ${plantilla.nombre}`, 'Info');
  }

  getInputType(tipo: string): string {
    if (!tipo) return 'text';
    const nombre = tipo.toLowerCase();
    switch (nombre) {
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

  esOpcionSeleccionada(opcion: string, valor: any): boolean {
    if (!valor) return false;
    if (Array.isArray(valor)) return valor.includes(opcion);
    return valor.toString() === opcion.toString();
  }
}
