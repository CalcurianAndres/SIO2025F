import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepuestoAlmacenadoComponent } from './repuesto-almacenado.component';

describe('RepuestoAlmacenadoComponent', () => {
  let component: RepuestoAlmacenadoComponent;
  let fixture: ComponentFixture<RepuestoAlmacenadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepuestoAlmacenadoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepuestoAlmacenadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
