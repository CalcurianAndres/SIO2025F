import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalisisSustratoComponent } from './analisis-sustrato.component';

describe('AnalisisSustratoComponent', () => {
  let component: AnalisisSustratoComponent;
  let fixture: ComponentFixture<AnalisisSustratoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalisisSustratoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalisisSustratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
