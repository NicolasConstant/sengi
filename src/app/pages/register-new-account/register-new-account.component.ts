import { Component, OnInit, Input } from "@angular/core";
import { Store, Select } from '@ngxs/store';

import { AuthService } from "../../services/auth.service";
import { TokenData } from "../../services/models/mastodon.interfaces";
import { AccountsService } from "../../services/accounts.service";
import { AddRegisteredApp, RegisteredAppsState, RegisteredAppsStateModel } from "../../stores/registered-apps.state";
import { Observable } from "rxjs";

@Component({
  selector: "app-register-new-account",
  templateUrl: "./register-new-account.component.html",
  styleUrls: ["./register-new-account.component.css"]
})
export class RegisterNewAccountComponent implements OnInit {
  @Input() mastodonFullHandle: string;
  // @Input() email: string;
  // @Input() password: string;
  result: string;
  
  //@Select() registeredApps$: Observable<RegisteredAppsStateModel>;
  registeredApps$: Observable<RegisteredAppsStateModel>;

  constructor(
    private readonly authService: AuthService,
    private readonly accountsService: AccountsService,
    private readonly store: Store) { 

      this.registeredApps$ = this.store.select(state => state.registeredapps.registeredApps);

    }

  ngOnInit() {
    this.registeredApps$.subscribe(x => { 
      console.error('registeredApps$')
      console.warn(x);
    });

  }

  onSubmit(): boolean {

    this.store
      .dispatch(new AddRegisteredApp({ name: 'test', id: 15, client_id: 'dsqdqs', client_secret: 'dsqdqs', redirect_uri: 'dsqdqs' }))
      .subscribe(res => {
        console.error('dispatch');
        console.warn(res);
      });

    


    

    // let fullHandle = this.mastodonFullHandle.split('@').filter(x => x != null && x !== '');
    
    // console.log(fullHandle[0]);
    // console.log(fullHandle[1]);

    // this.result = fullHandle[0] + '*' + fullHandle[1];

    // window.location.href = "https://google.com";






    //register app 

    //ask for getting token

    // this.authService.getToken(this.mastodonNode, this.email, this.password)
    //   .then((res: TokenData) => {
    //     this.result = res.access_token;

    //     this.accountsService.addNewAccount(this.mastodonNode, this.email, res);

    //   })
    //   .catch(err => {
    //     this.result = err;
    //   });

    

    return false;
  }
}
