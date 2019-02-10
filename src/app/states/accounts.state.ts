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

export class RemoveAccount {
    static readonly type = '[Accounts] Remove account';
    constructor(public accountId: string) {}
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
        const newAcc = action.account;
        newAcc.id = `${newAcc.username}@${newAcc.instance}`;

        const state = ctx.getState();
        ctx.patchState({
            accounts: [...state.accounts, newAcc]
        });
    }

    @Action(SelectAccount)
    SelectAccount(ctx: StateContext<AccountsStateModel>, action: SelectAccount){
        const state = ctx.getState();
        const multiSelection = action.multiselection;
        const selectedAccount = action.account;
        const copyAccounts = [...state.accounts];
        if(!multiSelection) {
            copyAccounts
                .filter(x => x.id !== selectedAccount.id)
                .forEach(x => x.isSelected = false);
        }
        const acc = copyAccounts.find(x => x.id === selectedAccount.id);
        acc.isSelected = !acc.isSelected;

        ctx.patchState({
            accounts: copyAccounts
        });
    }

    @Action(RemoveAccount)
    RemoveAccount(ctx: StateContext<AccountsStateModel>, action: RemoveAccount){
        const state = ctx.getState();
        const filteredAccounts = state.accounts.filter(x => x.id !== action.accountId);
        ctx.patchState({
            accounts: filteredAccounts
        });
    }
}

export class AccountInfo { 
    id: string;
    order: number;
    username: string;
    instance: string;
    token: TokenData;
    isSelected: boolean;    
}