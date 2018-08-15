import { State, Action, StateContext } from '@ngxs/store';
​
export class AddRegisteredApp {
    static readonly type = '[RegisteredApps] Add app';
    constructor(public app: AppInfo) { }
}

export interface RegisteredAppsStateModel {
    registeredApps: AppInfo[];
}

@State<RegisteredAppsStateModel>({
  name: 'registeredapps',
  defaults: {
      registeredApps: []
  }
})
export class RegisteredAppsState {    
    @Action(AddRegisteredApp)
    AddRegisteredApp(ctx: StateContext<RegisteredAppsStateModel>, action: AddRegisteredApp) {
        const state = ctx.getState();
        ctx.patchState({
            registeredApps: [...state.registeredApps, action.app]
        });

        // ctx.setState({
        //     registeredApps: [...state.registeredApps, action.app]
        // });
    }
}

export class AppInfo {
    id: number;
    name: string;
    redirect_uri: string;
    client_id: string;
    client_secret: string;
}