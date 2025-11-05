import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPacienteForm } from './crear-paciente-form';

describe('CrearPacienteForm', () => {
  let component: CrearPacienteForm;
  let fixture: ComponentFixture<CrearPacienteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPacienteForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPacienteForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
