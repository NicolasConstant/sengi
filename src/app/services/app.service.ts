import { Injectable } from '@angular/core';
import { ApiRoutes } from './models/api.settings';
import { AppData } from './models/mastodon.interfaces';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppService {
    private apiRoutes = new ApiRoutes();

    constructor(private readonly httpClient: HttpClient) {
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