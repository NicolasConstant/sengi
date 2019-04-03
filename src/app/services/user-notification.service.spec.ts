import { TestBed } from '@angular/core/testing';

import { UserNotificationService } from './user-notification.service';

xdescribe('UserNotificationServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserNotificationService = TestBed.get(UserNotificationService);
    expect(service).toBeTruthy();
  });
});
