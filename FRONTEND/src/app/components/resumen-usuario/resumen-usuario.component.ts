import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription} from 'rxjs';
import { EvolucionService } from '../../services/evolucion.service';
import { Problema } from '../../interfaces/problema';
import { EstadoProblema } from '../../interfaces/estado-problema';
import { UtilidadService } from 'src/app/reutilizable/utilidad.service';
import { Evolucion } from '../../interfaces/evolucion';
import { SharedModule } from 'src/app/reutilizable/shared/shared-module';

@Component({
  standalone: true,
  selector: 'app-resumen-usuario',
  imports: [CommonModule, RouterModule, CommonModule, SharedModule],
  templateUrl: './resumen-usuario.component.html',
  styleUrls: ['./resumen-usuario.component.css']
})
export class ResumenUsuarioComponent {
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
          const ultimas4Evoluciones = data.valor as Evolucion[];

          this.evoluciones = ultimas4Evoluciones.slice(-4); // toma las ultimas 4
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