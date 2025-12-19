import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetornoMaterialNewComponent } from './retorno-material-new.component';

describe('RetornoMaterialNewComponent', () => {
  let component: RetornoMaterialNewComponent;
  let fixture: ComponentFixture<RetornoMaterialNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetornoMaterialNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetornoMaterialNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
