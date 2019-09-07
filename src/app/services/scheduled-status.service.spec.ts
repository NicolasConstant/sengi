import { TestBed } from '@angular/core/testing';

import { ScheduledStatusService } from './scheduled-status.service';

xdescribe('ScheduledStatusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScheduledStatusService = TestBed.get(ScheduledStatusService);
    expect(service).toBeTruthy();
  });
});
