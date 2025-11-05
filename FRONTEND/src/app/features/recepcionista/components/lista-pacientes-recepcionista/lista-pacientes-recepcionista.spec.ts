import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPacientesRecepcionista } from './lista-pacientes-recepcionista';

describe('ListaPacientesRecepcionista', () => {
  let component: ListaPacientesRecepcionista;
  let fixture: ComponentFixture<ListaPacientesRecepcionista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaPacientesRecepcionista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaPacientesRecepcionista);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
