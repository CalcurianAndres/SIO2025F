import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticasGestionComponent } from './estadisticas-gestion.component';

describe('EstadisticasGestionComponent', () => {
  let component: EstadisticasGestionComponent;
  let fixture: ComponentFixture<EstadisticasGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstadisticasGestionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadisticasGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
