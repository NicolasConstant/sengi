import { AccountWrapper } from "./account.models";

export class Stream {
  streamName: string;
}

export class TootWrapper {
  account: AccountWrapper;
  content: string;
}
