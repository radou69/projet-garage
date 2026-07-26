import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisDetailComponentComponent } from './devis-detail-component.component';

describe('DevisDetailComponentComponent', () => {
  let component: DevisDetailComponentComponent;
  let fixture: ComponentFixture<DevisDetailComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevisDetailComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevisDetailComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
