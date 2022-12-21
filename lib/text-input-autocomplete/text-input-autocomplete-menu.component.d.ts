import { ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
export declare class TextInputAutocompleteMenuComponent {
    elementRef: ElementRef;
    dropdownMenuElement: ElementRef<HTMLUListElement>;
    position: {
        top: number;
        left: number;
    };
    selectChoice: Subject<unknown>;
    activeChoice: any;
    searchText: string;
    choiceLoadError: any;
    choiceLoading: boolean;
    private _choices;
    constructor(elementRef: ElementRef);
    trackById: (index: number, choice: any) => any;
    set choices(choices: any[]);
    get choices(): any[];
    onArrowDown(event: KeyboardEvent): void;
    onArrowUp(event: KeyboardEvent): void;
    onEnter(event: KeyboardEvent): void;
    private scrollToChoice;
    static ɵfac: i0.ɵɵFactoryDeclaration<TextInputAutocompleteMenuComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TextInputAutocompleteMenuComponent, "flx-text-input-autocomplete-menu", never, {}, {}, never, never, false, never>;
}
