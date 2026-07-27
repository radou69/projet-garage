import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparationListComponentComponent } from './reparation-list-component.component';

describe('ReparationListComponentComponent', () => {
  let component: ReparationListComponentComponent;
  let fixture: ComponentFixture<ReparationListComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparationListComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReparationListComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
