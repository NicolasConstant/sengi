import { State, Action, StateContext } from '@ngxs/store';
import { TokenData } from '../services/models/mastodon.interfaces';

export class AddAccount {
    static readonly type = '[Accounts] Add account';
    constructor(public account: AccountInfo) {}
}

export class ReorderAccounts {
    static readonly type = '[Accounts] Reorder';
    constructor(public accounts: AccountInfo[]) {}
}

export class SelectAccount {
    static readonly type = '[Accounts] Select account';
    constructor(public account: AccountInfo, public multiselection: boolean = false) {}
}

export class UpdateAccount {
    static readonly type = '[Accounts] Update account';
    constructor(public account: AccountInfo) {}
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
        const state = ctx.getState();
        const newAcc = action.account;
        newAcc.id = `${newAcc.username}@${newAcc.instance}`;

        if(state.accounts.filter(x => x.isSelected).length === 0)
            newAcc.isSelected = true;

        ctx.patchState({
            accounts: [...state.accounts, newAcc]
        });
    }

    @Action(ReorderAccounts)
    ReorderAccounts(ctx: StateContext<AccountsStateModel>, action: ReorderAccounts){
        // const state = ctx.getState();
        const reorderedAccounts = action.accounts;

        ctx.patchState({
            accounts: [...reorderedAccounts]
        });
    }

    @Action(UpdateAccount)
    UpdateAccount(ctx: StateContext<AccountsStateModel>, action: UpdateAccount){
        const state = ctx.getState();
        
        let editedAcc = state.accounts.find(x => x.id === action.account.id);
        editedAcc.token = action.account.token;

        ctx.patchState({
            accounts: [...state.accounts]
        });
    }

    @Action(SelectAccount)
    SelectAccount(ctx: StateContext<AccountsStateModel>, action: SelectAccount){
        const state = ctx.getState();

        const selectedAccount = action.account;
        const oldSelectedAccount = state.accounts.find(x => x.isSelected);

        if(oldSelectedAccount != null && selectedAccount.id === oldSelectedAccount.id) return;

        const acc = state.accounts.find(x => x.id === selectedAccount.id);
        acc.isSelected = true;

        if(oldSelectedAccount != null) oldSelectedAccount.isSelected = false;

        ctx.patchState({
            accounts: [...state.accounts]
        });
    }

    @Action(RemoveAccount)
    RemoveAccount(ctx: StateContext<AccountsStateModel>, action: RemoveAccount){
        const state = ctx.getState();
        const filteredAccounts = state.accounts.filter(x => x.id !== action.accountId);

        if(filteredAccounts.length === 1)
            filteredAccounts[0].isSelected = true;

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