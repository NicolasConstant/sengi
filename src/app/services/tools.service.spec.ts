import { TestBed, inject } from '@angular/core/testing';

import { ToolsService } from './tools.service';

describe('ToolsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToolsService]
    });
  });

  it('should be created', inject([ToolsService], (service: ToolsService) => {
    expect(service).toBeTruthy();
  }));
});
