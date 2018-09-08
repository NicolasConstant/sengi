import { Injectable } from "@angular/core";
import { TokenData } from "./models/mastodon.interfaces";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AuthService {
  constructor(
    private readonly httpClient: HttpClient) {
  }

  getToken(instance: string, client_id: string, client_secret: string, code: string, redirect_uri: string): Promise<TokenData> {
    const url = `https://${instance}/oauth/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirect_uri)}`;

    return this.httpClient.post<TokenData>(url, null).toPromise();
  }
}
