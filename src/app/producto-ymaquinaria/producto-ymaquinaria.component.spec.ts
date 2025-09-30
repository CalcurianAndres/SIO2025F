import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoYMaquinariaComponent } from './producto-ymaquinaria.component';

describe('ProductoYMaquinariaComponent', () => {
  let component: ProductoYMaquinariaComponent;
  let fixture: ComponentFixture<ProductoYMaquinariaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductoYMaquinariaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductoYMaquinariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
