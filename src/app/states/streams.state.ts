import { State, Action, StateContext } from '@ngxs/store';

export class AddStream {
    static readonly type = '[Streams] Add stream';
    constructor(public stream: StreamElement) {}
}

export interface StreamsStateModel {
    streams: StreamElement[];
}

@State<StreamsStateModel>({
    name: 'streamsstatemodel',
    defaults: {
        streams: []
    }
})
export class StreamsState {
    @Action(AddStream)
    AddStream(ctx: StateContext<StreamsStateModel>, action: AddStream) {
        const state = ctx.getState();
        ctx.patchState({
            streams: [...state.streams, action.stream]
        });
    }
}

export class StreamElement {
    constructor(public type: StreamTypeEnum, public name: string, public username: string) {
      
    }
  }
  
  export enum StreamTypeEnum {
    unknown = 0,
    global = 1,
    local = 2,
    personnal = 3,
    favorites = 4,
    activity = 5,
    list = 6,
    directmessages = 7,
    tag = 8,
}
  