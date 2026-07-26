import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendezVousFormComponentComponent } from './rendez-vous-form-component.component';

describe('RendezVousFormComponentComponent', () => {
  let component: RendezVousFormComponentComponent;
  let fixture: ComponentFixture<RendezVousFormComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendezVousFormComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendezVousFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
