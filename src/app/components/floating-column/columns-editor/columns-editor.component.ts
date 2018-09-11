import { Component, OnInit, Input } from '@angular/core';
import { StreamElement, StreamTypeEnum, AddStream } from '../../../states/streams.state';
import { Store } from '@ngxs/store';
import { AccountsStateModel, AccountInfo } from '../../../states/accounts.state';
import { AccountWrapper } from '../../../models/account.models';

@Component({
  selector: 'app-columns-editor',
  templateUrl: './columns-editor.component.html',
  styleUrls: ['./columns-editor.component.scss']
})
export class ColumnsEditorComponent implements OnInit {
  @Input() account: AccountWrapper;

  availableStreams: StreamElement[] = [];

  constructor(private readonly store: Store) { }

  ngOnInit() {
    this.availableStreams.length = 0;
    this.availableStreams.push(new StreamElement(StreamTypeEnum.global, 'Global Timeline', this.account.username));
    this.availableStreams.push(new StreamElement(StreamTypeEnum.local, 'Local Timeline', this.account.username));
    this.availableStreams.push(new StreamElement(StreamTypeEnum.personnal, 'Personnal Timeline', this.account.username));
  }

  addStream(stream: StreamElement): boolean {
    if (stream) {
      this.store.dispatch([new AddStream(stream)]);
    }
    return false;
  }
}
