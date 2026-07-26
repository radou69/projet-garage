import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilisateurListComponentComponent } from './utilisateur-list-component.component';

describe('UtilisateurListComponentComponent', () => {
  let component: UtilisateurListComponentComponent;
  let fixture: ComponentFixture<UtilisateurListComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateurListComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilisateurListComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
