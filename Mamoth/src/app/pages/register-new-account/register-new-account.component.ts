import { Component, OnInit, Input } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { TokenData } from "../../services/models/mastodon.interfaces";

@Component({
  selector: "app-register-new-account",
  templateUrl: "./register-new-account.component.html",
  styleUrls: ["./register-new-account.component.css"]
})
export class RegisterNewAccountComponent implements OnInit {
  @Input() mastodonNode: string;
  @Input() email: string;
  @Input() password: string;
  result: string;

  constructor(
    private readonly authService: AuthService) { }

  ngOnInit() {
  }

  onSubmit(): boolean {
    this.authService.getToken(this.mastodonNode, this.email, this.password)
      .then((res: TokenData) => {
        this.result = res.access_token;
      })
      .catch(err => {
        this.result = err;
      });

    return false;
  }
}
