import { TestBed } from '@angular/core/testing';

import { UserNotificationServiceService } from './user-notification-service.service';

xdescribe('UserNotificationServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserNotificationServiceService = TestBed.get(UserNotificationServiceService);
    expect(service).toBeTruthy();
  });
});
