import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroRepuestoComponent } from './registro-repuesto.component';

describe('RegistroRepuestoComponent', () => {
  let component: RegistroRepuestoComponent;
  let fixture: ComponentFixture<RegistroRepuestoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroRepuestoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroRepuestoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
