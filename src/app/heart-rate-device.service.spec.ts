import { TestBed } from '@angular/core/testing';

import { HeartRateDeviceService } from './heart-rate-device.service';

describe('HeartRateDeviceService', () => {
  let service: HeartRateDeviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeartRateDeviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
