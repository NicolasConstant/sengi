import { State, Action, StateContext } from '@ngxs/store';

export class AddStream {
    static readonly type = '[Streams] Add stream';
    constructor(public stream: StreamElement) {}
}

export class UpdateStream {
    static readonly type = '[Streams] Update stream';
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

export class MoveStreamUp {
    static readonly type = '[Streams] Move stream up';
    constructor(public streamId :string) {}
}

export class MoveStreamDown {
    static readonly type = '[Streams] Move stream down';
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
    @Action(UpdateStream)
    UpdateStream(ctx: StateContext<StreamsStateModel>, action: UpdateStream){
        const state = ctx.getState();

        const updatedStream = state.streams.find(x => x.id === action.stream.id);

        updatedStream.hideBoosts = action.stream.hideBoosts;
        updatedStream.hideReplies = action.stream.hideReplies;
        updatedStream.hideBots = action.stream.hideBots;

        ctx.patchState({
            streams: [...state.streams]
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
    @Action(MoveStreamUp)
    MoveStreamUp(ctx: StateContext<StreamsStateModel>, action: MoveStreamUp){
        const state = ctx.getState();
        const sourceIndex = state.streams.findIndex(x => x.id === action.streamId);
        if(sourceIndex === 0) return;

        let streamsCopy = [...state.streams];
        streamsCopy[sourceIndex - 1] = state.streams[sourceIndex];
        streamsCopy[sourceIndex] = state.streams[sourceIndex - 1];

        ctx.patchState({
            streams: streamsCopy
        });
    }
    @Action(MoveStreamDown)
    MoveStreamDown(ctx: StateContext<StreamsStateModel>, action: MoveStreamDown){
        const state = ctx.getState();
        const sourceIndex = state.streams.findIndex(x => x.id === action.streamId);
        if(sourceIndex === state.streams.length - 1) return;

        let streamsCopy = [...state.streams];
        streamsCopy[sourceIndex + 1] = state.streams[sourceIndex];
        streamsCopy[sourceIndex] = state.streams[sourceIndex + 1];

        ctx.patchState({
            streams: streamsCopy
        });
    }
}

export class StreamElement {
    public id: string;

    public hideBoosts: boolean = false;
    public hideReplies: boolean = false;
    public hideBots: boolean = false;

    constructor(
        public type: StreamTypeEnum, 
        public name: string, 
        public accountId: string,
        public tag: string,
        public list: string,
        public listId: string,
        public instance: string) {
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
  