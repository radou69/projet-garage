import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisListComponentComponent } from './devis-list-component.component';

describe('DevisListComponentComponent', () => {
  let component: DevisListComponentComponent;
  let fixture: ComponentFixture<DevisListComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevisListComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevisListComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
