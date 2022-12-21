import { EventEmitter, OnInit, TemplateRef } from '@angular/core';
import { ChoiceWithIndices } from './text-input-autocomplete';
import { TagMouseEvent } from './text-input-highlight';
import * as i0 from "@angular/core";
export declare class MentionsComponent implements OnInit {
    /**
     * Reference to the text input element
     */
    textInputElement: HTMLTextAreaElement | HTMLInputElement;
    /**
     * Reference to the menu template
     */
    menuTemplate: TemplateRef<any>;
    /**
     * The character that will trigger the menu to appear
     */
    triggerCharacter: string;
    /**
     * The regular expression that will match the search text after the trigger character
     */
    searchRegexp: RegExp;
    /**
     * Whether to close the menu when the host textInputElement loses focus
     */
    closeMenuOnBlur: boolean;
    /**
     * Selected choices (required in editing mode in order to keep track of choices)
     */
    selectedChoices: any[];
    /**
     * A function that formats the selected choice once selected.
     * The result (label) is also used as a choice identifier (e.g. when editing choices)
     */
    getChoiceLabel: (choice: any) => string;
    /**
     * Called when the options menu is shown
     */
    menuShow: EventEmitter<any>;
    /**
     * Called when the options menu is hidden
     */
    menuHide: EventEmitter<any>;
    /**
     * Called when a choice is selected
     */
    choiceSelected: EventEmitter<ChoiceWithIndices>;
    /**
     * Called when a choice is removed
     */
    choiceRemoved: EventEmitter<ChoiceWithIndices>;
    /**
     * Called when a choice is selected, removed, or if any of the choices' indices change
     */
    selectedChoicesChange: EventEmitter<ChoiceWithIndices[]>;
    /**
     * Called on user input after entering trigger character. Emits search term to search by
     */
    search: EventEmitter<string>;
    /**
     * The CSS class to add to highlighted tags
     */
    tagCssClass: string;
    /**
     * Called when the area over a tag is clicked
     */
    tagClick: EventEmitter<TagMouseEvent>;
    /**
     * Called when the area over a tag is moused over
     */
    tagMouseEnter: EventEmitter<TagMouseEvent>;
    /**
     * Called when the area over the tag has the mouse is removed from it
     */
    tagMouseLeave: EventEmitter<TagMouseEvent>;
    selectedCwis: ChoiceWithIndices[];
    constructor();
    ngOnInit(): void;
    onSelectedChoicesChange(cwis: ChoiceWithIndices[]): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MentionsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MentionsComponent, "flx-mentions", never, { "textInputElement": "textInputElement"; "menuTemplate": "menuTemplate"; "triggerCharacter": "triggerCharacter"; "searchRegexp": "searchRegexp"; "closeMenuOnBlur": "closeMenuOnBlur"; "selectedChoices": "selectedChoices"; "getChoiceLabel": "getChoiceLabel"; "tagCssClass": "tagCssClass"; }, { "menuShow": "menuShow"; "menuHide": "menuHide"; "choiceSelected": "choiceSelected"; "choiceRemoved": "choiceRemoved"; "selectedChoicesChange": "selectedChoicesChange"; "search": "search"; "tagClick": "tagClick"; "tagMouseEnter": "tagMouseEnter"; "tagMouseLeave": "tagMouseLeave"; }, never, never, false, never>;
}
