import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PacienteService } from '../../../services/paciente.service';
import { Paciente } from '../../../interfaces/paciente';
import { ResponseApi } from '../../../interfaces/response-api';
import { MatTableDataSource } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ObraSocialService } from '../../../services/obra-social.service';
import { PacienteObraSocialService } from '../../../services/paciente-obra-social.service';
import { ObraSocial } from 'src/app/interfaces/obra-social';
import { PacienteObraSocial } from 'src/app/interfaces/paciente-obra-social';

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
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatDividerModule,
    MatCardModule,
    MatPaginator,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './lista-pacientes-medico.html',
  styleUrl: './lista-pacientes-medico.css'
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
    private scroller: ViewportScroller
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
    this.router.navigate(['/pages/pacientes/' + paciente.id + '/resumen']).then(() => {
      this.scroller.scrollToPosition([0, 0]);
    })
  }

}

