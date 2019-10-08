import { TestBed } from '@angular/core/testing';

import { MastodonWrapperService } from './mastodon-wrapper.service';

xdescribe('MastodonWrapperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MastodonWrapperService = TestBed.get(MastodonWrapperService);
    expect(service).toBeTruthy();
  });
});
