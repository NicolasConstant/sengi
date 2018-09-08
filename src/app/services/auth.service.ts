import { Injectable } from "@angular/core";
import { Http, Response, RequestOptions } from "@angular/http";
import { ApiRoutes } from "./models/api.settings";
import { TokenData } from "./models/mastodon.interfaces";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AuthService {
  private apiRoutes = new ApiRoutes();

  constructor(
    private readonly httpClient: HttpClient) {
  }

  // getToken(instance: string, email: string, password: string): Promise<TokenData> {

  //   //TODO retrieve those via API
  //   const clientId = localStorage.getItem("client_id");
  //   const clientSecret = localStorage.getItem("client_secret");

  //   //Retrieve Token
  //   const url = this.getHostUrl(instance) + this.apiRoutes.getToken;

  //   const options = new RequestOptions();
  //   const formData = new FormData();

  //   formData.append("client_id", clientId);
  //   formData.append("client_secret", clientSecret);
  //   formData.append("grant_type", "password");
  //   formData.append("username", email);
  //   formData.append("password", password);
  //   formData.append("scope", "read write follow");

  //   return this.httpService.post(url, formData, options).toPromise()
  //     .then((res: Response) => {
  //       const result = res.json();
  //       return result as TokenData;
  //     });
  // }

  // private getHostUrl(url: string): string {
  //   url = url.replace("http://", "");
  //   if (!url.startsWith("https://")) {
  //     url = "https://" + url;
  //   }
  //   return url;
  // }

  getToken(instance: string, client_id: string, client_secret: string, code: string, redirect_uri: string): Promise<TokenData> {
    const url = `https://${instance}/oauth/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirect_uri)}`;

    return this.httpClient.post<TokenData>(url, null).toPromise();
  }
}
