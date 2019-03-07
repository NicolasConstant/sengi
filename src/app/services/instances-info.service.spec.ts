import { TestBed } from '@angular/core/testing';

import { InstancesInfoService } from './instances-info.service';

xdescribe('InstancesInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InstancesInfoService = TestBed.get(InstancesInfoService);
    expect(service).toBeTruthy();
  });
});
