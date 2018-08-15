import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions } from '@angular/http';
import { ApiRoutes } from './models/api.settings';

@Injectable()
export class AppService {
    private apiRoutes = new ApiRoutes();

    constructor(private readonly httpService: Http) {
    }

    createNewApplication(mastodonUrl: string): Promise<> {
        const url = mastodonUrl + this.apiRoutes.createApp;

        const options = new RequestOptions();
        const formData = new FormData();

        formData.append('client_name', 'Sengi');
        formData.append('redirect_uris', '');
        formData.append('scopes', 'read write follow');
        formData.append('website', 'https://github.com/NicolasConstant/sengi');

        return this.httpService.post(url, formData, options)
            .pipe(
                map((res: Response) => {
                    const result = res.json();
                    return result as TokenData;
                }))
            .toPromise()


            .then((res: Response) => {
                const result = res.json();
                return result as TokenData;
            });
    }
}