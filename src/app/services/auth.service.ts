import { Injectable } from "@angular/core";
import { ApiRoutes } from './models/api.settings';
import { AppData, TokenData } from "./models/mastodon.interfaces";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AuthService {
  private apiRoutes = new ApiRoutes();

  constructor(
    private readonly httpClient: HttpClient) {
  }

  getToken(instance: string, client_id: string, client_secret: string, code: string, redirect_uri: string): Promise<TokenData> {
    const url = `https://${instance}/oauth/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirect_uri)}`;

    return this.httpClient.post<TokenData>(url, null).toPromise();
  }

  createNewApplication(instance: string, redirectUrl: string): Promise<AppData> {
    const url = 'https://' + instance + this.apiRoutes.createApp;    
    const formData = new FormData();

    formData.append('client_name', 'Sengi');
    formData.append('redirect_uris', redirectUrl);
    formData.append('scopes', 'read write follow');
    formData.append('website', 'https://github.com/NicolasConstant/sengi');

    return this.httpClient.post<AppData>(url, formData).toPromise();
}
}
