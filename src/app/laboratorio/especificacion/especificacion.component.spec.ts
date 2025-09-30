import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspecificacionComponent } from './especificacion.component';

describe('EspecificacionComponent', () => {
  let component: EspecificacionComponent;
  let fixture: ComponentFixture<EspecificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EspecificacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EspecificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
