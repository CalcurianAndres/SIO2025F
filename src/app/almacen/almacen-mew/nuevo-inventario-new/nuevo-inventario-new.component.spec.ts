import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoInventarioNewComponent } from './nuevo-inventario-new.component';

describe('NuevoInventarioNewComponent', () => {
  let component: NuevoInventarioNewComponent;
  let fixture: ComponentFixture<NuevoInventarioNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NuevoInventarioNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevoInventarioNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
