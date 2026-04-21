import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaEstadisticasPorPeriodoComponent } from './consulta-estadisticas-por-periodo.component';

describe('ConsultaEstadisticasPorPeriodoComponent', () => {
  let component: ConsultaEstadisticasPorPeriodoComponent;
  let fixture: ComponentFixture<ConsultaEstadisticasPorPeriodoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaEstadisticasPorPeriodoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaEstadisticasPorPeriodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
