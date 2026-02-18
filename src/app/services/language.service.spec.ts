import { TestBed } from '@angular/core/testing';

import { LanguageService } from './language.service';

xdescribe('LanguageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LanguageService = TestBed.get(LanguageService);
    expect(service).toBeTruthy();
  });
});
