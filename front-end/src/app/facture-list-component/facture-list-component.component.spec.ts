import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactureListComponentComponent } from './facture-list-component.component';

describe('FactureListComponentComponent', () => {
  let component: FactureListComponentComponent;
  let fixture: ComponentFixture<FactureListComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactureListComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactureListComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
