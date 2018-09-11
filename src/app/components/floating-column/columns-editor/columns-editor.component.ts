import { Component, OnInit, Input } from '@angular/core';
import { StreamElement, StreamTypeEnum, AddStream } from '../../../states/streams.state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-columns-editor',
  templateUrl: './columns-editor.component.html',
  styleUrls: ['./columns-editor.component.scss']
})
export class ColumnsEditorComponent implements OnInit {
  @Input() username: string;

  availableStreams: StreamElement[] = [];

  constructor(private readonly store: Store) { }

  ngOnInit() {
    this.availableStreams.length = 0;

    this.availableStreams.push(new StreamElement(StreamTypeEnum.global, 'Global Timeline', this.username));
    this.availableStreams.push(new StreamElement(StreamTypeEnum.local, 'Local Timeline', this.username));
    this.availableStreams.push(new StreamElement(StreamTypeEnum.personnal, 'Personnal Timeline', this.username));
  }

  addStream(stream: StreamElement): boolean {
    if (stream) {
      this.store.dispatch([new AddStream(stream)]);
    }
    return false;
  }
}
