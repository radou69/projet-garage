import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparationFormComponentComponent } from './reparation-form-component.component';

describe('ReparationFormComponentComponent', () => {
  let component: ReparationFormComponentComponent;
  let fixture: ComponentFixture<ReparationFormComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparationFormComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReparationFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
