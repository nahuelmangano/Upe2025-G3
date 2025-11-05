import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPacientesMedico } from './lista-pacientes-medico';

describe('ListaPacientesMedico', () => {
  let component: ListaPacientesMedico;
  let fixture: ComponentFixture<ListaPacientesMedico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaPacientesMedico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaPacientesMedico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
