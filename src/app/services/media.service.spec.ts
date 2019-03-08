import { TestBed } from '@angular/core/testing';

import { MediaService } from './media.service';

xdescribe('MediaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MediaService = TestBed.get(MediaService);
    expect(service).toBeTruthy();
  });
});
