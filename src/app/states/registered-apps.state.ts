import { State, Action, StateContext } from '@ngxs/store';
import { AppData } from '../services/models/mastodon.interfaces';

export class AddRegisteredApp {
    static readonly type = '[RegisteredApps] Add app';
    constructor(public app: AppInfo) { }
}

export interface RegisteredAppsStateModel {
    apps: AppInfo[];
}

@State<RegisteredAppsStateModel>({
    name: 'registeredapps',
    defaults: {
        apps: []
    }
})
export class RegisteredAppsState {
    @Action(AddRegisteredApp)
    AddRegisteredApp(ctx: StateContext<RegisteredAppsStateModel>, action: AddRegisteredApp) {
        const state = ctx.getState();
        ctx.patchState({
            apps: [...state.apps, action.app]
        });

        // ctx.setState({
        //     registeredApps: [...state.registeredApps, action.app]
        // });
    }
}

export class AppInfo {
    instance: string;
    app: AppData;
}