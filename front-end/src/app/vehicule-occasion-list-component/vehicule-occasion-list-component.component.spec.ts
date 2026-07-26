import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeOccasionListComponentComponent } from './vehicule-occasion-list-component.component';

describe('VehiculeOccasionListComponentComponent', () => {
  let component: VehiculeOccasionListComponentComponent;
  let fixture: ComponentFixture<VehiculeOccasionListComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeOccasionListComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeOccasionListComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
