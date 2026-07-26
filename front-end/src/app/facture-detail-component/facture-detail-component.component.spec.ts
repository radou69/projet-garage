import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactureDetailComponentComponent } from './facture-detail-component.component';

describe('FactureDetailComponentComponent', () => {
  let component: FactureDetailComponentComponent;
  let fixture: ComponentFixture<FactureDetailComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactureDetailComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactureDetailComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
