import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-databinded-text',
    templateUrl: './databinded-text.component.html',
    styleUrls: ['./databinded-text.component.scss']
})
export class DatabindedTextComponent implements OnInit {
    private accounts: string[] = [];
    private hastags: string[] = [];

    processedText: string;

    @Output() accountSelected = new EventEmitter<string>();
    @Output() hashtagSelected = new EventEmitter<string>();
    @Output() textSelected = new EventEmitter();

    @Input('text')
    set text(value: string){
        this.processedText = value;
    }

    constructor() { }

    ngOnInit() {
    }

}
