import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmacenMewComponent } from './almacen-mew.component';

describe('AlmacenMewComponent', () => {
  let component: AlmacenMewComponent;
  let fixture: ComponentFixture<AlmacenMewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlmacenMewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlmacenMewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
