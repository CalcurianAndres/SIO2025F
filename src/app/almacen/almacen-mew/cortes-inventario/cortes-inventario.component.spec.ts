import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CortesInventarioComponent } from './cortes-inventario.component';

describe('CortesInventarioComponent', () => {
  let component: CortesInventarioComponent;
  let fixture: ComponentFixture<CortesInventarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CortesInventarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CortesInventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
