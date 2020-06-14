import { Component, OnInit, Input, EventEmitter, Output, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-user-follows',
    templateUrl: './user-follows.component.html',
    styleUrls: ['./user-follows.component.scss']
})
export class UserFollowsComponent implements OnInit, OnDestroy {

    private _type: string;
    private _currentAccount: string;

    @Input('type')
    set setType(type: string) {
        this._type = type;
        this.load(this._type, this._currentAccount);
    }
    get setType(): string {
        return this._type;
    }

    @Input('currentAccount')
    set currentAccount(accountName: string) {
        this._currentAccount = accountName;
        this.load(this._type, this._currentAccount);
    }
    get currentAccount(): string {
        return this._currentAccount;
    }

    @Input() refreshEventEmitter: EventEmitter<any>;
    @Input() goToTopEventEmitter: EventEmitter<any>;

    @Output() browseAccountEvent = new EventEmitter<string>();

    @ViewChild('statusstream') public statustream: ElementRef;

    private refreshSubscription: Subscription;
    private goToTopSubscription: Subscription;

    constructor() { }
 
    ngOnInit() {
        if (this.refreshEventEmitter) {
            this.refreshSubscription = this.refreshEventEmitter.subscribe(() => {
                this.refresh();
            })
        }

        if (this.goToTopEventEmitter) {
            this.goToTopSubscription = this.goToTopEventEmitter.subscribe(() => {
                this.goToTop();
            })
        }
    }

    ngOnDestroy(): void {
        if (this.refreshSubscription) this.refreshSubscription.unsubscribe();
        if (this.goToTopSubscription) this.goToTopSubscription.unsubscribe();
    }

    private load(type: string, accountName: string) {
        if (type && accountName) {
            console.warn(`type: ${type} account ${accountName}`);
        }
    }

    refresh(): any {
    }

    goToTop(): any {
        const stream = this.statustream.nativeElement as HTMLElement;
        setTimeout(() => {
            stream.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 0);
    }
}
