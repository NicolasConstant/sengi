import { State, Action, StateContext } from '@ngxs/store';

export class AddColumn {
    static readonly type = '[Columns] Add column';
    constructor(public column: ColumnElement) {}
}

export interface ColumnsStateModel {
    columns: ColumnElement[];
}

@State<ColumnsStateModel>({
    name: 'columnsstatemodel',
    defaults: {
        columns: []
    }
})
export class ColumnsState {
    @Action(AddColumn)
    AddColumn(ctx: StateContext<ColumnsStateModel>, action: AddColumn) {
        const state = ctx.getState();
        ctx.patchState({
            columns: [...state.columns, action.column]
        });
    }
}

export class ColumnElement {
    constructor(public type: ColumnTypeEnum, public name: string, public username: string) {
      
    }
  }
  
  export enum ColumnTypeEnum {
    unknown = 0,
    global = 1,
    local = 2,
    personnal = 3,
    favorites = 4,
    activity = 5,
    list = 6,
    directmessages = 7, 
  }
  