import { State, Action, StateContext } from '@ngxs/store';
import { TokenData } from '../services/models/mastodon.interfaces';

export class AddAccount {
    static readonly type = '[Accounts] Add account';
    constructor(public account: AccountInfo) {}
}

export interface AccountsStateModel {
    accounts: AccountInfo[];
}


@State<AccountsStateModel>({
    name: 'registeredaccounts',
    defaults: {
        accounts: []
    }
})
export class AccountsState {
    @Action(AddAccount)
    AddAccount(ctx: StateContext<AccountsStateModel>, action: AddAccount) {
        const state = ctx.getState();
        ctx.patchState({
            accounts: [...state.accounts, action.account]
        });
    }
}

export class AccountInfo { 
    username: string;
    instance: string;
    token: TokenData;
}