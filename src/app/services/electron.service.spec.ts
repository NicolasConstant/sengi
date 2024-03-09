import { TestBed } from '@angular/core/testing';

import { MyElectronService } from './electron.service';

xdescribe('MyElectronService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MyElectronService = TestBed.get(MyElectronService);
    expect(service).toBeTruthy();
  });
});
