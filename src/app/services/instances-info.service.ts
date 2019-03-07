import { Injectable } from '@angular/core';

import { MastodonService } from './mastodon.service';
import { Instance } from './models/mastodon.interfaces';

@Injectable({
    providedIn: 'root'
})
export class InstancesInfoService {
    private defaultMaxChars = 500; 
    private cachedMaxInstanceChar: { [id: string] : Promise<number>; } = {};

    constructor(private mastodonService: MastodonService) { }

    getMaxStatusChars(instance:string): Promise<number> {
        if(!this.cachedMaxInstanceChar[instance]){
            this.cachedMaxInstanceChar[instance] = this.mastodonService.getInstance(instance)
                .then((instance: Instance)=>{
                    if(instance.max_toot_chars){
                        return instance.max_toot_chars;
                    } else {
                        return this.defaultMaxChars;
                    }
                })
                .catch(() => {
                    return this.defaultMaxChars;
                });
        }
        return this.cachedMaxInstanceChar[instance];
    }
}
