import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprovacionTrasladosNewComponent } from './aprovacion-traslados-new.component';

describe('AprovacionTrasladosNewComponent', () => {
  let component: AprovacionTrasladosNewComponent;
  let fixture: ComponentFixture<AprovacionTrasladosNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AprovacionTrasladosNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AprovacionTrasladosNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
