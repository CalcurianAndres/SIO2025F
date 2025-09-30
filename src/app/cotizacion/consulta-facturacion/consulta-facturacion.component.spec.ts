import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaFacturacionComponent } from './consulta-facturacion.component';

describe('ConsultaFacturacionComponent', () => {
  let component: ConsultaFacturacionComponent;
  let fixture: ComponentFixture<ConsultaFacturacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaFacturacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaFacturacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
