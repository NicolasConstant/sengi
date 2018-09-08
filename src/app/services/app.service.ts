import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions } from '@angular/http';
import { map } from "rxjs/operators";

import { ApiRoutes } from './models/api.settings';
import { AppData } from './models/mastodon.interfaces';
import { Router } from '@angular/router';

@Injectable()
export class AppService {
    private apiRoutes = new ApiRoutes();

    constructor(
        private readonly httpService: Http,
        private readonly router: Router) {
    }

    createNewApplication(instance: string, redirectUrl: string): Promise<AppData> {
        const url = 'https://' + instance + this.apiRoutes.createApp;
        
        // const redirect_uri = this.router.url;
        // var redirect_uri = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');

        // if(redirect_uri === 'file://'){
        //     redirect_uri = 'http://localhost';
        // }

        // console.warn(`redirect_uri ${redirect_uri}`); 
        // return null; 

        const options = new RequestOptions();
        const formData = new FormData();

        formData.append('client_name', 'Sengi');
        formData.append('redirect_uris', redirectUrl);
        formData.append('scopes', 'read write follow');
        formData.append('website', 'https://github.com/NicolasConstant/sengi');

        return this.httpService.post(url, formData, options)
            .pipe(
                map((res: Response) => {
                    const result = res.json();
                    console.warn(result);
                    return result as AppData;
                }))
            .toPromise();

        //     // .then((res: Response) => {
        //     //     const result = res.json(); 
        //     //     return result as TokenData;
        //     // });
    }
}