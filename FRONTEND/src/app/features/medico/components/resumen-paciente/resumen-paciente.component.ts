import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription} from 'rxjs';
import { EvolucionService } from '@features/paciente/services/evolucion.service';
import { Problema } from '@features/paciente/interfaces/problema';
import { EstadoProblema } from '@features/medico/interfaces/estado-problema';
import { UtilidadService } from '@core/services/utilidad.service';
import { Evolucion } from '@features/paciente/interfaces/evolucion';
import { SHARED_IMPORTS } from '@shared/shared-imports';


@Component({
  standalone: true,
  selector: 'app-resumen-paciente',
  imports: [ ...SHARED_IMPORTS, RouterModule ],
  templateUrl: './resumen-paciente.component.html',
  styleUrls: ['./resumen-paciente.component.css']
})
export class ResumenPacienteComponent {
  pacienteId = 0;
  sub?: Subscription;

  listaEstadoProblema: EstadoProblema[] = [];
  problemas: Problema[] = [];
  evoluciones: Evolucion[] = [];
  diagnosticosDefinitivos: Evolucion[] = [];
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private evolucionService: EvolucionService,
    private _utilidadServicio: UtilidadService
  ) { }

  cargarEvoluciones() {
    this.evolucionService.listaPorPaciente(this.pacienteId).subscribe({
      next: (data) => {
        if (data.estado) {
          const ultimas4Evoluciones = (data.valor as Evolucion[] ?? []).slice();

          this.evoluciones = ultimas4Evoluciones
            .sort((a, b) => new Date(b.fechaConsulta).getTime() - new Date(a.fechaConsulta).getTime())
            .slice(0, 4);
          console.log('Lista de Evoluciones', this.evoluciones);
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron registros de evoluciones", "Error");
        }
      },
      error: () => {
        this._utilidadServicio.mostrarAlerta("No se pudo cargar la lista de evoluciones", "Opps!");
      }
    });
  }

  ngOnInit(): void {
    // cargar el id del usuario cuando se inicializa el componente
    this.sub = this.route.paramMap.subscribe(pm => {
      this.pacienteId = Number(pm.get('id')) || 0;
      this.cargarEvoluciones();
    });
  }

  getEstadoClass(estado: string | null | undefined): string {
    if (!estado) return 'estado-default';
    const estadoLower = estado.toLowerCase().trim();
    if (estadoLower === 'nuevo') return 'estado-nuevo';
    if (estadoLower === 'estable') return 'estado-estable';
    if (estadoLower === 'mejorando') return 'estado-mejorando';
    if (estadoLower === 'recurrente') return 'estado-recurrente';
    if (estadoLower === 'cronico' || estadoLower === 'crónico') return 'estado-cronico';
    return 'estado-default';
  }

  getEstadoNombre(evolucion: Evolucion): string {
    return evolucion.estadoProblemaNombre ?? '-';
  }
}