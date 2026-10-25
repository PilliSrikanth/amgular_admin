import { TestBed } from '@angular/core/testing';

import { AdminSubscriptionService } from './admin-subscription.service';

describe('AdminSubscriptionService', () => {
  let service: AdminSubscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminSubscriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
