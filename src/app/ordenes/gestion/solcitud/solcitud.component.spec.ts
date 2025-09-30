import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolcitudComponent } from './solcitud.component';

describe('SolcitudComponent', () => {
  let component: SolcitudComponent;
  let fixture: ComponentFixture<SolcitudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolcitudComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SolcitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
