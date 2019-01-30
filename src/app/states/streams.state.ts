import { State, Action, StateContext } from '@ngxs/store';

export class AddStream {
    static readonly type = '[Streams] Add stream';
    constructor(public stream: StreamElement) {}
}

export class RemoveAllStreams {
    static readonly type = '[Streams] Remove all streams';
    constructor(public accountId :string) {}
}

export class RemoveStream {
    static readonly type = '[Streams] Remove stream';
    constructor(public streamId :string) {}
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
    @Action(RemoveAllStreams)
    RemoveAllStreams(ctx: StateContext<StreamsStateModel>, action: RemoveAllStreams){
        const state = ctx.getState();
        const filteredStreams = state.streams.filter(x => x.accountId !== action.accountId);
        ctx.patchState({
            streams: [...filteredStreams]
        });
    }
    @Action(RemoveStream)
    RemoveStream(ctx: StateContext<StreamsStateModel>, action: RemoveStream){
        const state = ctx.getState();
        const filteredStreams = state.streams.filter(x => x.id !== action.streamId);
        ctx.patchState({
            streams: [...filteredStreams]
        });
    }
}

export class StreamElement {
    public id: string;

    constructor(
        public type: StreamTypeEnum, 
        public name: string, 
        public accountId: string,
        public tag: string,
        public list: string,
        public displayableFullName: string) {
            this.id = `${type}-${name}-${accountId}`;
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
  