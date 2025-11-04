import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { PacienteService } from '@features/paciente/services/paciente.service';
import { Paciente } from '@features/paciente/interfaces/paciente';
import { ResponseApi } from '@core/interfaces/response-api';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ObraSocialService } from '@features/maestros/services/obra-social.service';
import { PacienteObraSocialService } from '@features/paciente/services/paciente-obra-social.service';
import { ObraSocial } from '@features/maestros/interfaces/obra-social';
import { PacienteObraSocial } from '@features/paciente/interfaces/paciente-obra-social';
import { PacienteContextService } from '@core/services/paciente-context.service';
import { SHARED_IMPORTS } from '@shared/shared-imports';

interface PacienteExtendido extends Paciente {
  obraSocialNombre: string;
  numeroAfiliado: string;
}

interface RelacionConObra {
  obra: ObraSocial;
  relaciones: PacienteObraSocial[];
}

@Component({
  selector: 'app-lista-pacientes-medico',
  standalone: true,
  imports: [ ...SHARED_IMPORTS, RouterModule ],
  templateUrl: './lista-pacientes-medico.html',
  styleUrls: ['./lista-pacientes-medico.css']
})

export class ListaPacientesMedicoComponent {
  displayedColumns: string[] = ['dni', 'nombreCompleto', 'edad', 'grupoSanguineo', 'obraSocialNombre', 'numeroAfiliado'];
  selectedPaciente?: Paciente;
  dataSource: PacienteExtendido[] = [];
  dataListaPacientes = new MatTableDataSource<PacienteExtendido>(this.dataSource);
  pacientesCompletos: any[] = [];
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private pacienteService: PacienteService,
    private obraSocialService: ObraSocialService,
    private pacienteObraSocialService: PacienteObraSocialService,
    private router: Router,
    private scroller: ViewportScroller,
    private pacienteContexto: PacienteContextService
  ) { }

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarObrasSocialesPorPaciente(listaObras: ObraSocial[]): void {
    this.dataSource.forEach((paciente, index) => {
      const llamadas: Observable<RelacionConObra>[] = listaObras.map(obra =>
        this.pacienteObraSocialService
          .listaPorPacienteObraSocial(paciente.id!, obra.id!)
          .pipe(
            map((res: ResponseApi) => ({ obra, relaciones: res.valor as PacienteObraSocial[] }))
          )
      );

      forkJoin(llamadas).subscribe(resultados => {
        const relacionValida = resultados.find(r => r.relaciones.length > 0);

        if (relacionValida) {
          const relacion = relacionValida.relaciones[0];
          paciente.obraSocialNombre = relacionValida.obra.nombre;
          paciente.numeroAfiliado = relacion.numeroAfiliado || '-';
        } else {
          paciente.obraSocialNombre = 'Sin obra social';
          paciente.numeroAfiliado = '-';
        }

        this.dataListaPacientes.data = [...this.dataSource];
      });
    });
  }

  cargarPacientes(): void {
    forkJoin({
      pacientes: this.pacienteService.lista(),
      obras: this.obraSocialService.lista(),
    }).subscribe(({ pacientes, obras }) => {
      const listaPacientes = pacientes.valor as Paciente[];
      const listaObras = obras.valor as ObraSocial[];

      this.dataSource = listaPacientes.map(paciente => ({
        ...paciente,
        edad: this.calcularEdad(paciente.fechaNac),
        obraSocialNombre: 'Cargando...',
        numeroAfiliado: '...',
      }));

      this.dataListaPacientes = new MatTableDataSource(this.dataSource);

      if (this.paginacionTabla) {
        this.dataListaPacientes.paginator = this.paginacionTabla;
      }

      this.cargarObrasSocialesPorPaciente(listaObras);
    });
  }

  calcularEdad(fechaNac: string | Date): number {
    const fechaNacimiento = new Date(fechaNac);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  ngAfterViewInit(): void {
    this.dataListaPacientes.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaPacientes.filter = filterValue.trim().toLocaleLowerCase();
  }

  seleccionarPaciente(paciente: Paciente): void {
    this.router.navigate(['/medico/paciente/' + paciente.id + '/resumen']).then(() => {
      this.scroller.scrollToPosition([0, 0]);
      this.pacienteContexto.setPacienteContext(paciente.id!);
    })
  }

}

