import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisFormComponentComponent } from './devis-form-component.component';

describe('DevisFormComponentComponent', () => {
  let component: DevisFormComponentComponent;
  let fixture: ComponentFixture<DevisFormComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevisFormComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevisFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
