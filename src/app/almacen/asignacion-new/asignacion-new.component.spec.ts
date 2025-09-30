import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionNewComponent } from './asignacion-new.component';

describe('AsignacionNewComponent', () => {
  let component: AsignacionNewComponent;
  let fixture: ComponentFixture<AsignacionNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsignacionNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
