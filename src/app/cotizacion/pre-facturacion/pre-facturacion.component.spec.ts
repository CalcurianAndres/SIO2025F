import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreFacturacionComponent } from './pre-facturacion.component';

describe('PreFacturacionComponent', () => {
  let component: PreFacturacionComponent;
  let fixture: ComponentFixture<PreFacturacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreFacturacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreFacturacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
