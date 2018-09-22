import { State, Action, StateContext } from '@ngxs/store';
import { TokenData } from '../services/models/mastodon.interfaces';

export class AddAccount {
    static readonly type = '[Accounts] Add account';
    constructor(public account: AccountInfo) {}
}

export class SelectAccount {
    static readonly type = '[Accounts] Select account';
    constructor(public account: AccountInfo, public multiselection: boolean = false) {}
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

    @Action(SelectAccount)
    SelectAccount(ctx: StateContext<AccountsStateModel>, action: SelectAccount){
        const state = ctx.getState();
        const multiSelection = action.multiselection;
        const selectedAccount = action.account;
        const accounts = [...state.accounts];
        if(!multiSelection) {
            accounts.forEach(x => x.isSelected = false);
        }
        const acc = accounts.find(x => x.username === selectedAccount.username && x.instance === selectedAccount.instance);
        acc.isSelected = !acc.isSelected;

        ctx.patchState({
            accounts: accounts
        });
    }
}

export class AccountInfo { 
    username: string;
    instance: string;
    token: TokenData;
    isSelected: boolean;
}