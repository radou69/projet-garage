import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeListComponentComponent } from './vehicule-list-component.component';

describe('VehiculeListComponentComponent', () => {
  let component: VehiculeListComponentComponent;
  let fixture: ComponentFixture<VehiculeListComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeListComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeListComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
