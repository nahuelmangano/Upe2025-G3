import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPlantillas } from './lista-plantillas';

describe('ListaPlantillas', () => {
  let component: ListaPlantillas;
  let fixture: ComponentFixture<ListaPlantillas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaPlantillas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaPlantillas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
