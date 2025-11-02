import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { ProblemasService, Problema } from '../../services/problemas.service';
import { PacienteCatalogoService, Opcion } from '../../services/catalogo.service';

@Component({
  standalone: true,
  selector: 'app-paciente-problema-form',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './problema-form.component.html',
  styleUrls: ['./problema-form.component.css']
})
export class ProblemaFormComponent implements OnInit, OnDestroy {
  pacienteId = 0;
  sub?: Subscription;
  opcionesTitulo: Problema[] = [];
  estados: Opcion[] = [];

  titulo = '';
  estadoId?: number;
  descripcion = '';

  constructor(private route: ActivatedRoute, private router: Router, private problemas: ProblemasService, private catalogo: PacienteCatalogoService) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(pm => {
      this.pacienteId = Number(pm.get('id')) || 0;
      this.problemas.list().subscribe(p => { this.opcionesTitulo = p; });
      this.catalogo.estadosProblema().subscribe(e => { this.estados = e; this.estadoId = e[0]?.id; });
    });
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  cancelar(): void { this.router.navigate(['/pages', 'pacientes', this.pacienteId, 'evoluciones']); }

  async crear(): Promise<void> {
    await firstValueFrom(this.problemas.create({ titulo: this.titulo, descripcion: this.descripcion, estadoProblemaId: this.estadoId }));
    this.router.navigate(['/pages', 'pacientes', this.pacienteId, 'evoluciones']);
  }
}
