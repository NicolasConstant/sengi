import { Component, OnInit, Input } from '@angular/core';

import { NavigationService } from '../../../services/navigation.service';
import { StatusWrapper } from '../../../models/common.model';

@Component({
    selector: 'app-edit-status',
    templateUrl: './edit-status.component.html',
    styleUrls: ['./edit-status.component.scss']
})
export class EditStatusComponent implements OnInit {

    @Input() isDirectMention: boolean;
    @Input() userHandle: string;
    @Input() statusToEdit: StatusWrapper;

    constructor(private readonly navigationService: NavigationService) {
    }

    ngOnInit() {
    }

    closeColumn() {
        this.navigationService.closePanel();
    }
}
