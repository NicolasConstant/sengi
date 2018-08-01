import { Account } from "../services/models/mastodon.interfaces";


export class AccountWrapper {
  constructor() {
  }

  id: number;
  username: string;
  display_name: string;
  avatar: string;
}
