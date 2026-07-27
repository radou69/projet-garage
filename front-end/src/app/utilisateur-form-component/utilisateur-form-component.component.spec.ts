import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilisateurFormComponentComponent } from './utilisateur-form-component.component';

describe('UtilisateurFormComponentComponent', () => {
  let component: UtilisateurFormComponentComponent;
  let fixture: ComponentFixture<UtilisateurFormComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateurFormComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilisateurFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
