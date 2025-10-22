import { Component, OnInit, inject, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { PlantillaService } from 'src/app/services/plantilla.service';
import { CampoService } from 'src/app/services/campo.service';
import { UtilidadService } from 'src/app/reutilizable/utilidad.service';
import { ResponseApi } from 'src/app/interfaces/response-api';
import { RouterModule } from '@angular/router';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-lista-plantillas',
  standalone: true,
  templateUrl: './lista-plantillas.html',
  styleUrl: './lista-plantillas.css',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule
  ]
})
export class ListaPlantillasComponent implements OnInit {
  private plantillaService = inject(PlantillaService);
  private campoService = inject(CampoService);
  private utilidadService = inject(UtilidadService);
  private dialog = inject(MatDialog);

  filtro: string = '';
  dataSource: any[] = [];
  todasPlantillas: any[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'acciones'];

  @ViewChild('previsualizacionDialog') previsualizacionDialog!: TemplateRef<any>;

  ngOnInit(): void {
    this.cargarPlantillasDelMedico();
  }

  cargarPlantillasDelMedico() {
    const medicoId = this.utilidadService.obtenerUsuarioId();
    this.plantillaService.listaPorMedico(medicoId).subscribe({
      next: (res: ResponseApi) => {
        if (res.estado && Array.isArray(res.valor)) {
          this.dataSource = res.valor;
          this.todasPlantillas = res.valor;
        }
      },
      error: (err: any) => console.error('Error al listar plantillas', err)
    });
  }

  filtrarPlantillas(valor: string | null) {
    if (!valor) {
      this.dataSource = [...this.todasPlantillas];
      return;
    }
    this.dataSource = this.todasPlantillas.filter(p =>
      (p.nombre || '').toLowerCase().includes(valor.toLowerCase()) ||
      (p.descripcion || '').toLowerCase().includes(valor.toLowerCase())
    );
  }

  verPlantilla(plantilla: any) {
  this.campoService.lista(plantilla.id).subscribe({
    next: (res: ResponseApi) => {
      if (res.estado && Array.isArray(res.valor)) {
        const campos = res.valor;
        campos.forEach(campo => {
          if (campo.valor === undefined || campo.valor === null) {
            campo.valor = '';
          }
        });
        const secciones: { titulo: string; campos: any[] }[] = [];
        campos.forEach(campo => {
          const titulo = campo.seccionTitulo || 'Sección sin título';
          let seccion = secciones.find(s => s.titulo === titulo);

          if (!seccion) {
            seccion = { titulo, campos: [] };
            secciones.push(seccion);
          }
          seccion.campos.push(campo);
        });

        secciones.forEach(s => s.campos.sort((a, b) => a.orden - b.orden));

        const datosDialog = {
          nombrePlantilla: plantilla.nombre,
          descripcion: plantilla.descripcion,
          secciones: secciones
        };

        this.dialog.open(this.previsualizacionDialog, {
          data: datosDialog,
          width: '700px',
          maxWidth: '97vw',
          minWidth: '450px'
        });
      } else {
        alert('Esta plantilla no tiene campos definidos.');
      }
    },
    error: (err: any) => {
      console.error('Error al cargar campos: ', err);
      alert('Error al cargar los campos de esta plantilla.');
    }
  });
}


  completarPlantilla(plantilla: any) {
    alert(`Completar plantilla: ${plantilla.nombre}`);
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
      case 'selección única':
      case 'selección múltiple': return 'select';
      default: return 'text';
    }
  }

  // Método auxiliar para selects
  esOpcionSeleccionada(opcion: string, valor: any): boolean {
    if (!valor) return false;
    if (Array.isArray(valor)) return valor.includes(opcion);
    return valor.toString() === opcion.toString();
  }
}
