import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeOccasionFormComponentComponent } from './vehicule-occasion-form-component.component';

describe('VehiculeOccasionFormComponentComponent', () => {
  let component: VehiculeOccasionFormComponentComponent;
  let fixture: ComponentFixture<VehiculeOccasionFormComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeOccasionFormComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeOccasionFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
