import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeFormComponentComponent } from './vehicule-form-component.component';

describe('VehiculeFormComponentComponent', () => {
  let component: VehiculeFormComponentComponent;
  let fixture: ComponentFixture<VehiculeFormComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeFormComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
