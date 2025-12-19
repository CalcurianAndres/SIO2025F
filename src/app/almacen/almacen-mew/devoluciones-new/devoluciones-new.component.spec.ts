import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolucionesNewComponent } from './devoluciones-new.component';

describe('DevolucionesNewComponent', () => {
  let component: DevolucionesNewComponent;
  let fixture: ComponentFixture<DevolucionesNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DevolucionesNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DevolucionesNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
