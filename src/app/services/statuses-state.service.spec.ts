import { TestBed } from '@angular/core/testing';

import { StatusesStateService } from './statuses-state.service';
import { setRootDomAdapter } from '@angular/platform-browser/src/dom/dom_adapter';

describe('StatusesStateService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: StatusesStateService = TestBed.get(StatusesStateService);
        expect(service).toBeTruthy();
    });

    it('should set unset favorited status', () => {
        const statusId = 'statusId';
        const accountId = 'accountId';
        
        const service: StatusesStateService = TestBed.get(StatusesStateService);
        service.statusFavoriteStatusChanged(statusId, accountId, true);
        let result = service.getStateForStatus(statusId, accountId);

        expect(result.isFavorited).toBeTruthy();
    });

    it('should set unset rebloged status', () => {
        const statusId = 'statusId';
        const accountId = 'accountId';
        
        const service: StatusesStateService = TestBed.get(StatusesStateService);
        service.statusReblogStatusChanged(statusId, accountId, true);
        let result = service.getStateForStatus(statusId, accountId);

        expect(result.isRebloged).toBeTruthy();
    });

    it('should be able to reset favorited status', () => {
        const statusId = 'statusId';
        const accountId = 'accountId';
        
        const service: StatusesStateService = TestBed.get(StatusesStateService);
        service.statusFavoriteStatusChanged(statusId, accountId, true);
        service.statusFavoriteStatusChanged(statusId, accountId, false);
        let result = service.getStateForStatus(statusId, accountId);

        expect(result.isFavorited).toBeFalsy();
    });

    it('should be able to reset rebloged status', () => {
        const statusId = 'statusId';
        const accountId = 'accountId';
        
        const service: StatusesStateService = TestBed.get(StatusesStateService);
        service.statusReblogStatusChanged(statusId, accountId, true);
        service.statusReblogStatusChanged(statusId, accountId, false);
        let result = service.getStateForStatus(statusId, accountId);

        expect(result.isRebloged).toBeFalsy();
    });
});
