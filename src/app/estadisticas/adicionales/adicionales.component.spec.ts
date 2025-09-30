import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdicionalesComponent } from './adicionales.component';

describe('AdicionalesComponent', () => {
  let component: AdicionalesComponent;
  let fixture: ComponentFixture<AdicionalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdicionalesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdicionalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
