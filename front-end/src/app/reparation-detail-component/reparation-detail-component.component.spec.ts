import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparationDetailComponentComponent } from './reparation-detail-component.component';

describe('ReparationDetailComponentComponent', () => {
  let component: ReparationDetailComponentComponent;
  let fixture: ComponentFixture<ReparationDetailComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparationDetailComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReparationDetailComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
