import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovimientoMaterialComponent } from './movimiento-material.component';

describe('MovimientoMaterialComponent', () => {
  let component: MovimientoMaterialComponent;
  let fixture: ComponentFixture<MovimientoMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovimientoMaterialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovimientoMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
