import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPacienteFormComponent } from './editar-paciente-form';

describe('EditarPacienteForm', () => {
  let component: EditarPacienteFormComponent;
  let fixture: ComponentFixture<EditarPacienteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPacienteFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPacienteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
