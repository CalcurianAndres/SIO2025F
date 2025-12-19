import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaEstadisticasComponent } from './consulta-estadisticas.component';

describe('ConsultaEstadisticasComponent', () => {
  let component: ConsultaEstadisticasComponent;
  let fixture: ComponentFixture<ConsultaEstadisticasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaEstadisticasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaEstadisticasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
