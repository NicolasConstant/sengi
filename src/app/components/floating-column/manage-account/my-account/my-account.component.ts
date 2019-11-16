import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { faCheckSquare } from "@fortawesome/free-regular-svg-icons";
import { faPenAlt, faTrash, faPlus, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

import { NotificationService } from '../../../../services/notification.service';
import { StreamElement, StreamTypeEnum, AddStream, RemoveAllStreams, RemoveStream } from '../../../../states/streams.state';
import { AccountWrapper } from '../../../../models/account.models';
import { RemoveAccount } from '../../../../states/accounts.state';
import { NavigationService } from '../../../../services/navigation.service';
import { MastodonWrapperService } from '../../../../services/mastodon-wrapper.service';
import { ToolsService } from '../../../../services/tools.service';
import { AccountSettings } from '../../../../states/settings.state';

@Component({
    selector: 'app-my-account',
    templateUrl: './my-account.component.html',
    styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit, OnDestroy {
    faPlus = faPlus;
    faTrash = faTrash;
    faPenAlt = faPenAlt;
    faCheckSquare = faCheckSquare;
    faCheck = faCheck;
    faTimes = faTimes;

    avatarNotificationDisabled: boolean;
    customStatusLengthEnabled: boolean;
    customStatusLength: number;
    private accountSettings: AccountSettings;
    
    availableStreams: StreamWrapper[] = [];
    availableLists: StreamWrapper[] = [];

    private _account: AccountWrapper;
    @Input('account')
    set account(acc: AccountWrapper) {
        this._account = acc;
        this.loadStreams(acc);
        this.loadAccountSettings();
    }
    get account(): AccountWrapper {
        return this._account;
    }
    
    @Select(state => state.streamsstatemodel.streams) streamElements$: Observable<StreamElement[]>;
    private streamChangedSub: Subscription;

    constructor(
        private readonly store: Store,
        private readonly toolsService: ToolsService,
        private readonly navigationService: NavigationService,
        private readonly mastodonService: MastodonWrapperService,
        private readonly notificationService: NotificationService) { }

    ngOnInit() {
        this.streamChangedSub = this.streamElements$.subscribe((streams: StreamElement[]) => {
            this.loadStreams(this.account);
        });           
    }

    ngOnDestroy(): void {
        if(this.streamChangedSub) { 
            this.streamChangedSub.unsubscribe();
        }
    }

    private loadAccountSettings(){
        this.accountSettings = this.toolsService.getAccountSettings(this.account.info);

        this.customStatusLengthEnabled = this.accountSettings.customStatusCharLengthEnabled;          
        this.customStatusLength = this.accountSettings.customStatusCharLength;
        this.avatarNotificationDisabled = this.accountSettings.disableAvatarNotifications;
    }

    onCustomLengthEnabledChanged(): boolean {
        this.accountSettings.customStatusCharLengthEnabled = this.customStatusLengthEnabled;
        this.toolsService.saveAccountSettings(this.accountSettings);
        return false;
    }

    customStatusLengthChanged(event): boolean{
        this.accountSettings.customStatusCharLength = this.customStatusLength;
        this.toolsService.saveAccountSettings(this.accountSettings);
        return false;
    }

    private loadStreams(account: AccountWrapper){
        const instance = account.info.instance;
        this.availableStreams.length = 0;
        this.availableStreams.push(new StreamWrapper(new StreamElement(StreamTypeEnum.global, 'Federated Timeline', account.info.id, null, null, null, instance)));
        this.availableStreams.push(new StreamWrapper(new StreamElement(StreamTypeEnum.local, 'Local Timeline', account.info.id, null, null, null, instance)));
        this.availableStreams.push(new StreamWrapper(new StreamElement(StreamTypeEnum.personnal, 'Home', account.info.id, null, null, null, instance)));

        const loadedStreams = <StreamElement[]>this.store.snapshot().streamsstatemodel.streams;
        this.availableStreams.forEach(s => {
            if(loadedStreams.find(x => x.id === s.id)){
                s.isAdded = true;
            } else {
                s.isAdded = false;
            }
        });

        this.availableLists.length = 0;
        this.mastodonService.getLists(account.info)
            .then((streams: StreamElement[]) => {
                this.availableLists.length = 0;
                for (let stream of streams) {
                    let wrappedStream = new StreamWrapper(stream);
                    if(loadedStreams.find(x => x.id == stream.id)){
                        wrappedStream.isAdded = true;
                    } else {
                        wrappedStream.isAdded = false;
                    }
                    this.availableLists.push(wrappedStream);
                }                
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, this.account.info);
            });
    }

    addStream(stream: StreamWrapper): boolean {
        if (stream && !stream.isAdded) {
            this.store.dispatch([new AddStream(stream)]).toPromise()
                .then(() => {
                    stream.isAdded = true;
                });            
        }
        return false;
    }

    removeAccount(): boolean {
        const accountId = this.account.info.id;
        this.store.dispatch([new RemoveAllStreams(accountId), new RemoveAccount(accountId)]);
        this.navigationService.closePanel();
        return false;
    }

    listTitle: string;
    creationLoading: boolean;
    createList(): boolean {
        if(this.creationLoading || !this.listTitle || this.listTitle == '') return false;
                
        this.creationLoading = true;
        this.mastodonService.createList(this.account.info, this.listTitle)
            .then((stream: StreamElement) => {
                this.listTitle = null;
                let wrappedStream = new StreamWrapper(stream);
                this.availableLists.push(wrappedStream);
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, this.account.info);
            })
            .then(() => {
                this.creationLoading = false;
            });

        return false;
    }

    editList(list: StreamWrapper): boolean {
        list.editList = !list.editList;
        return false;
    }

    openCloseDeleteConfirmation(list: StreamWrapper, state: boolean): boolean {
        list.confirmDeletion = state;
        return false;
    }

    deleteList(list: StreamWrapper): boolean {
        this.mastodonService.deleteList(this.account.info, list.listId)
            .then(() => {
                const isAdded = this.availableLists.find(x => x.id === list.id).isAdded;
                if(isAdded){
                    this.store.dispatch([new RemoveStream(list.id)]);
                }
                this.availableLists = this.availableLists.filter(x => x.id !== list.id);
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, this.account.info);
            });

        return false;
    }

    onDisableAvatarNotificationChanged() {
        let settings = this.toolsService.getAccountSettings(this.account.info);
        settings.disableAvatarNotifications = this.avatarNotificationDisabled;
        this.toolsService.saveAccountSettings(settings);
    }
}

export class StreamWrapper extends StreamElement {
    constructor(stream: StreamElement) {
        super(stream.type, stream.name, stream.accountId, stream.tag, stream.list, stream.listId, stream.instance);
    }

    isAdded: boolean;
    confirmDeletion: boolean;
    editList: boolean;
}