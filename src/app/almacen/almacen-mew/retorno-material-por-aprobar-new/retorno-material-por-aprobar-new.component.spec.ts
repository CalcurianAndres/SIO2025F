import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetornoMaterialPorAprobarNewComponent } from './retorno-material-por-aprobar-new.component';

describe('RetornoMaterialPorAprobarNewComponent', () => {
  let component: RetornoMaterialPorAprobarNewComponent;
  let fixture: ComponentFixture<RetornoMaterialPorAprobarNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetornoMaterialPorAprobarNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetornoMaterialPorAprobarNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
