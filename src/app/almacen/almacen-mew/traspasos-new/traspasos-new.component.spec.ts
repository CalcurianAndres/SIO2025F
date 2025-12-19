import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraspasosNewComponent } from './traspasos-new.component';

describe('TraspasosNewComponent', () => {
  let component: TraspasosNewComponent;
  let fixture: ComponentFixture<TraspasosNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TraspasosNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TraspasosNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
