import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalisisMenuComponent } from './analisis-menu.component';

describe('AnalisisMenuComponent', () => {
  let component: AnalisisMenuComponent;
  let fixture: ComponentFixture<AnalisisMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalisisMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalisisMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
