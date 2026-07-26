import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendezVousListComponentComponent } from './rendez-vous-list-component.component';

describe('RendezVousListComponentComponent', () => {
  let component: RendezVousListComponentComponent;
  let fixture: ComponentFixture<RendezVousListComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendezVousListComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RendezVousListComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
