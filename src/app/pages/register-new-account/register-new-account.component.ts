import { Component, OnInit, Input } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { TokenData } from "../../services/models/mastodon.interfaces";
import { AccountsService } from "../../services/accounts.service";

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

  constructor(
    private readonly authService: AuthService,
    private readonly accountsService: AccountsService) { }

  ngOnInit() {
  }

  onSubmit(): boolean {
    let fullHandle = this.mastodonFullHandle.split('@').filter(x => x != null && x !== '');
    
    console.log(fullHandle[0]);
    console.log(fullHandle[1]);

    this.result = fullHandle[0] + '*' + fullHandle[1];

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
