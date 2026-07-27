import { TestBed } from '@angular/core/testing';

import { VehiculeOccasionService } from './vehicule-occasion.service';

describe('VehiculeOccasionService', () => {
  let service: VehiculeOccasionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehiculeOccasionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
