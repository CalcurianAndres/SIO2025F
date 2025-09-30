import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaDespachosComponent } from './vista-despachos.component';

describe('VistaDespachosComponent', () => {
  let component: VistaDespachosComponent;
  let fixture: ComponentFixture<VistaDespachosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VistaDespachosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VistaDespachosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
