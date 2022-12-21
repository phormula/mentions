import { EventEmitter, NgZone, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges, TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
export interface ChoiceWithIndices {
    choice: any;
    indices: {
        start: number;
        end: number;
    };
}
export declare class TextInputAutocompleteComponent implements OnChanges, OnInit, OnDestroy {
    private ngZone;
    private renderer;
    /**
     * Reference to the text input element.
     */
    textInputElement: HTMLTextAreaElement | HTMLInputElement;
    /**
     * Reference to the menu template (used to display the search results).
     */
    menuTemplate: TemplateRef<any>;
    /**
     * The character which will trigger the search.
     */
    triggerCharacter: string;
    /**
     * The regular expression that will match the search text after the trigger character.
     * No match will hide the menu.
     */
    searchRegexp: RegExp;
    /**
     * Whether to close the menu when the host textInputElement loses focus.
     */
    closeMenuOnBlur: boolean;
    /**
     * Pre-set choices for edit text mode, or to select/mark choices from outside the mentions component.
     */
    selectedChoices: any[];
    /**
     * A function that formats the selected choice once selected.
     * The result (label) is also used as a choice identifier (e.g. when editing choices).
     */
    getChoiceLabel: (choice: any) => string;
    /**
     * Called when the choices menu is shown.
     */
    menuShow: EventEmitter<any>;
    /**
     * Called when the choices menu is hidden.
     */
    menuHide: EventEmitter<any>;
    /**
     * Called when a choice is selected.
     */
    choiceSelected: EventEmitter<ChoiceWithIndices>;
    /**
     * Called when a choice is removed.
     */
    choiceRemoved: EventEmitter<ChoiceWithIndices>;
    /**
     * Called when a choice is selected, removed, or if any of the choices' indices change.
     */
    selectedChoicesChange: EventEmitter<ChoiceWithIndices[]>;
    /**
     * Called on user input after entering trigger character. Emits search term to search by.
     */
    search: EventEmitter<string>;
    private _eventListeners;
    private _selectedCwis;
    private _dumpedCwis;
    private _editingCwi;
    menuCtrl?: {
        template: TemplateRef<any>;
        context: any;
        position: {
            top: number;
            left: number;
        };
        triggerCharacterPosition: number;
        lastCaretPosition?: number;
    };
    constructor(ngZone: NgZone, renderer: Renderer2);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    ngOnDestroy(): void;
    onKeydown(event: KeyboardEvent): void;
    onInput(event: any): void;
    onBlur(event: FocusEvent): void;
    onClick(event: MouseEvent): void;
    private hideMenu;
    private showMenu;
    selectChoice: (choice: any) => void;
    editChoice(choice: any): void;
    dumpNonExistingChoices(): void;
    retrieveExistingChoices(): void;
    addToSelected(cwi: ChoiceWithIndices): void;
    removeFromSelected(cwi: ChoiceWithIndices): void;
    getLineHeight(elm: HTMLElement): number;
    getChoiceIndex(label: string): number;
    updateIndices(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<TextInputAutocompleteComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TextInputAutocompleteComponent, "flx-text-input-autocomplete", never, { "textInputElement": "textInputElement"; "menuTemplate": "menuTemplate"; "triggerCharacter": "triggerCharacter"; "searchRegexp": "searchRegexp"; "closeMenuOnBlur": "closeMenuOnBlur"; "selectedChoices": "selectedChoices"; "getChoiceLabel": "getChoiceLabel"; }, { "menuShow": "menuShow"; "menuHide": "menuHide"; "choiceSelected": "choiceSelected"; "choiceRemoved": "choiceRemoved"; "selectedChoicesChange": "selectedChoicesChange"; "search": "search"; }, never, never, false, never>;
}
export declare function getChoiceIndex(text: string, label: string, labels: string[]): number;
export declare function precedingCharValid(char: string): boolean;
export declare function findStringIndex(text: string, value: string, callback: (startIndex: number, endIndex: number) => boolean): number;
