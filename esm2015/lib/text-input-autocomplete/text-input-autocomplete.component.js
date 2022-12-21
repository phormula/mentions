import { Component, EventEmitter, Input, Output, } from '@angular/core';
import { getCaretCoordinates } from './textarea-caret-position';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
export class TextInputAutocompleteComponent {
    constructor(ngZone, renderer) {
        this.ngZone = ngZone;
        this.renderer = renderer;
        /**
         * The character which will trigger the search.
         */
        this.triggerCharacter = '@';
        /**
         * The regular expression that will match the search text after the trigger character.
         * No match will hide the menu.
         */
        this.searchRegexp = /^\w*$/;
        /**
         * Whether to close the menu when the host textInputElement loses focus.
         */
        this.closeMenuOnBlur = false;
        /**
         * Pre-set choices for edit text mode, or to select/mark choices from outside the mentions component.
         */
        this.selectedChoices = [];
        /**
         * Called when the choices menu is shown.
         */
        this.menuShow = new EventEmitter();
        /**
         * Called when the choices menu is hidden.
         */
        this.menuHide = new EventEmitter();
        /**
         * Called when a choice is selected.
         */
        this.choiceSelected = new EventEmitter();
        /**
         * Called when a choice is removed.
         */
        this.choiceRemoved = new EventEmitter();
        /**
         * Called when a choice is selected, removed, or if any of the choices' indices change.
         */
        this.selectedChoicesChange = new EventEmitter();
        /**
         * Called on user input after entering trigger character. Emits search term to search by.
         */
        this.search = new EventEmitter();
        this._eventListeners = [];
        this._selectedCwis = [];
        this._dumpedCwis = [];
        this.selectChoice = (choice) => {
            const label = this.getChoiceLabel(choice);
            const startIndex = this.menuCtrl.triggerCharacterPosition;
            const start = this.textInputElement.value.slice(0, startIndex);
            const caretPosition = this.menuCtrl.lastCaretPosition || this.textInputElement.selectionStart;
            const end = this.textInputElement.value.slice(caretPosition);
            const insertValue = label + ' ';
            this.textInputElement.value = start + insertValue + end;
            // force ng model / form control to update
            this.textInputElement.dispatchEvent(new Event('input'));
            const setCursorAt = (start + insertValue).length;
            this.textInputElement.setSelectionRange(setCursorAt, setCursorAt);
            this.textInputElement.focus();
            const choiceWithIndices = {
                choice,
                indices: {
                    start: startIndex,
                    end: startIndex + label.length,
                },
            };
            this.addToSelected(choiceWithIndices);
            this.updateIndices();
            this.selectedChoicesChange.emit(this._selectedCwis);
            this.hideMenu();
        };
    }
    ngOnChanges(changes) {
        if (changes.selectedChoices) {
            if (Array.isArray(this.selectedChoices)) {
                /**
                 * Timeout needed since ngOnChanges is fired before the textInputElement value is updated.
                 * The problem is specific to publisher.landing component implementation, i.e. single
                 * textarea element is used for each account, only text changes..
                 * Use ngZone.runOutsideAngular to optimize the timeout so it doesn't fire
                 * global change detection events continuously..
                 */
                this.ngZone.runOutsideAngular(() => {
                    setTimeout(() => {
                        const selectedCwisPrevious = JSON.stringify(this._selectedCwis);
                        this._selectedCwis = this.selectedChoices.map((c) => {
                            return {
                                choice: c,
                                indices: { start: -1, end: -1 },
                            };
                        });
                        this.updateIndices();
                        // Remove choices that index couldn't be found for
                        this._selectedCwis = this._selectedCwis.filter((cwi) => cwi.indices.start > -1);
                        if (JSON.stringify(this._selectedCwis) !== selectedCwisPrevious) {
                            // TODO: Should check for indices change only (ignoring the changes inside choice object)
                            this.ngZone.run(() => {
                                this.selectedChoicesChange.emit(this._selectedCwis);
                            });
                        }
                    });
                });
            }
        }
    }
    ngOnInit() {
        const onKeydown = this.renderer.listen(this.textInputElement, 'keydown', (event) => this.onKeydown(event));
        this._eventListeners.push(onKeydown);
        const onInput = this.renderer.listen(this.textInputElement, 'input', (event) => this.onInput(event));
        this._eventListeners.push(onInput);
        const onBlur = this.renderer.listen(this.textInputElement, 'blur', (event) => this.onBlur(event));
        this._eventListeners.push(onBlur);
        const onClick = this.renderer.listen(this.textInputElement, 'click', (event) => this.onClick(event));
        this._eventListeners.push(onClick);
    }
    ngOnDestroy() {
        this.hideMenu();
        this._eventListeners.forEach((unregister) => unregister());
    }
    onKeydown(event) {
        const cursorPosition = this.textInputElement.selectionStart;
        const precedingChar = this.textInputElement.value.charAt(cursorPosition - 1);
        if (event.key === this.triggerCharacter &&
            precedingCharValid(precedingChar)) {
            this.showMenu();
            return;
        }
        const keyCode = event.keyCode || event.charCode;
        if (keyCode === 8 || keyCode === 46) {
            // backspace or delete
            const cwiToEdit = this._selectedCwis.find((cwi) => {
                const label = this.getChoiceLabel(cwi.choice);
                const labelEndIndex = this.getChoiceIndex(label) + label.length;
                return cursorPosition === labelEndIndex;
            });
            if (cwiToEdit) {
                this.editChoice(cwiToEdit.choice);
            }
        }
    }
    onInput(event) {
        const value = event.target.value;
        const selectedCwisPrevious = JSON.stringify(this._selectedCwis);
        if (!this.menuCtrl) {
            // dump choices that are removed from the text (e.g. select all + paste),
            // and/or retrieve them if user e.g. UNDO the action
            // BUG: if text that contains mentions is selected and deleted using trigger char, no choices will be dumped (this.menuCtrl will be defined)!
            this.dumpNonExistingChoices();
            this.retrieveExistingChoices();
            this.updateIndices();
            if (JSON.stringify(this._selectedCwis) !== selectedCwisPrevious) {
                // TODO: Should probably check for indices change only (ignoring the changes inside choice object)
                this.selectedChoicesChange.emit(this._selectedCwis);
            }
            return;
        }
        this.updateIndices();
        if (JSON.stringify(this._selectedCwis) !== selectedCwisPrevious) {
            this.selectedChoicesChange.emit(this._selectedCwis);
        }
        if (value[this.menuCtrl.triggerCharacterPosition] !== this.triggerCharacter) {
            this.hideMenu();
            return;
        }
        const cursorPosition = this.textInputElement.selectionStart;
        if (cursorPosition < this.menuCtrl.triggerCharacterPosition) {
            this.hideMenu();
            return;
        }
        const searchText = value.slice(this.menuCtrl.triggerCharacterPosition + 1, cursorPosition);
        if (!searchText.match(this.searchRegexp)) {
            this.hideMenu();
            return;
        }
        this.search.emit(searchText);
    }
    onBlur(event) {
        if (!this.menuCtrl) {
            return;
        }
        this.menuCtrl.lastCaretPosition = this.textInputElement
            .selectionStart;
        if (this.closeMenuOnBlur) {
            this.hideMenu();
        }
    }
    onClick(event) {
        if (!this.menuCtrl) {
            return;
        }
        const cursorPosition = this.textInputElement.selectionStart;
        if (cursorPosition <= this.menuCtrl.triggerCharacterPosition) {
            this.hideMenu();
            return;
        }
        const searchText = this.textInputElement.value.slice(this.menuCtrl.triggerCharacterPosition + 1, cursorPosition);
        if (!searchText.match(this.searchRegexp)) {
            this.hideMenu();
            return;
        }
    }
    hideMenu() {
        if (!this.menuCtrl) {
            return;
        }
        this.menuCtrl = undefined;
        this.menuHide.emit();
        if (this._editingCwi) {
            // If user didn't make any changes to it, add it back to the selected choices
            const label = this.getChoiceLabel(this._editingCwi.choice);
            const labelExists = this.getChoiceIndex(label + ' ') > -1;
            const choiceExists = this._selectedCwis.find((cwi) => this.getChoiceLabel(cwi.choice) === label);
            if (labelExists && !choiceExists) {
                this.addToSelected(this._editingCwi);
                this.updateIndices();
                this.selectedChoicesChange.emit(this._selectedCwis);
            }
        }
        this._editingCwi = undefined;
    }
    showMenu() {
        if (this.menuCtrl) {
            return;
        }
        const lineHeight = this.getLineHeight(this.textInputElement);
        const { top, left } = getCaretCoordinates(this.textInputElement, this.textInputElement.selectionStart);
        this.menuCtrl = {
            template: this.menuTemplate,
            context: {
                selectChoice: this.selectChoice,
                // $implicit: {
                //   selectChoice: this.selectChoice
                // },
            },
            position: {
                top: top + lineHeight,
                left: left,
            },
            triggerCharacterPosition: this.textInputElement.selectionStart,
        };
        this.menuShow.emit();
    }
    editChoice(choice) {
        const label = this.getChoiceLabel(choice);
        const startIndex = this.getChoiceIndex(label);
        const endIndex = startIndex + label.length;
        this._editingCwi = this._selectedCwis.find((cwi) => this.getChoiceLabel(cwi.choice) === label);
        this.removeFromSelected(this._editingCwi);
        this.selectedChoicesChange.emit(this._selectedCwis);
        this.textInputElement.focus();
        this.textInputElement.setSelectionRange(endIndex, endIndex);
        this.showMenu();
        this.menuCtrl.triggerCharacterPosition = startIndex;
        // TODO: editValue to be provided externally?
        const editValue = label.replace(this.triggerCharacter, '');
        this.search.emit(editValue);
    }
    dumpNonExistingChoices() {
        const choicesToDump = this._selectedCwis.filter((cwi) => {
            const label = this.getChoiceLabel(cwi.choice);
            return this.getChoiceIndex(label) === -1;
        });
        if (choicesToDump.length) {
            choicesToDump.forEach((cwi) => {
                this.removeFromSelected(cwi);
                this._dumpedCwis.push(cwi);
            });
        }
    }
    retrieveExistingChoices() {
        const choicesToRetrieve = this._dumpedCwis.filter((dcwi) => {
            const label = this.getChoiceLabel(dcwi.choice);
            const labelExists = this.getChoiceIndex(label) > -1;
            const choiceExists = this._selectedCwis.find((scwi) => this.getChoiceLabel(scwi.choice) === label);
            return labelExists && !choiceExists;
        });
        if (choicesToRetrieve.length) {
            choicesToRetrieve.forEach((c) => {
                this.addToSelected(c);
                this._dumpedCwis.splice(this._dumpedCwis.indexOf(c), 1);
            });
        }
    }
    addToSelected(cwi) {
        const exists = this._selectedCwis.some((scwi) => this.getChoiceLabel(scwi.choice) === this.getChoiceLabel(cwi.choice));
        if (!exists) {
            this._selectedCwis.push(cwi);
            this.choiceSelected.emit(cwi);
        }
    }
    removeFromSelected(cwi) {
        const exists = this._selectedCwis.some((scwi) => this.getChoiceLabel(scwi.choice) === this.getChoiceLabel(cwi.choice));
        if (exists) {
            this._selectedCwis.splice(this._selectedCwis.indexOf(cwi), 1);
            this.choiceRemoved.emit(cwi);
        }
    }
    getLineHeight(elm) {
        const lineHeightStr = getComputedStyle(elm).lineHeight || '';
        const lineHeight = parseFloat(lineHeightStr);
        const normalLineHeight = 1.2;
        const fontSizeStr = getComputedStyle(elm).fontSize || '';
        // const fontSize = +toPX(fontSizeStr);
        const fontSize = parseFloat(fontSizeStr);
        if (lineHeightStr === lineHeight + '') {
            return fontSize * lineHeight;
        }
        if (lineHeightStr.toLowerCase() === 'normal') {
            return fontSize * normalLineHeight;
        }
        // return toPX(lineHeightStr);
        return parseFloat(lineHeightStr);
    }
    getChoiceIndex(label) {
        const text = this.textInputElement && this.textInputElement.value;
        const labels = this._selectedCwis.map((cwi) => this.getChoiceLabel(cwi.choice));
        return getChoiceIndex(text, label, labels);
    }
    updateIndices() {
        this._selectedCwis = this._selectedCwis.map((cwi) => {
            const label = this.getChoiceLabel(cwi.choice);
            const index = this.getChoiceIndex(label);
            return {
                choice: cwi.choice,
                indices: {
                    start: index,
                    end: index + label.length,
                },
            };
        });
    }
}
TextInputAutocompleteComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0, type: TextInputAutocompleteComponent, deps: [{ token: i0.NgZone }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component });
TextInputAutocompleteComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.1.5", type: TextInputAutocompleteComponent, selector: "flx-text-input-autocomplete", inputs: { textInputElement: "textInputElement", menuTemplate: "menuTemplate", triggerCharacter: "triggerCharacter", searchRegexp: "searchRegexp", closeMenuOnBlur: "closeMenuOnBlur", selectedChoices: "selectedChoices", getChoiceLabel: "getChoiceLabel" }, outputs: { menuShow: "menuShow", menuHide: "menuHide", choiceSelected: "choiceSelected", choiceRemoved: "choiceRemoved", selectedChoicesChange: "selectedChoicesChange", search: "search" }, usesOnChanges: true, ngImport: i0, template: "<div *ngIf=\"menuCtrl\" class=\"menu-template-container\">\n   <ng-container *ngTemplateOutlet=\"menuTemplate; context: menuCtrl.context\"></ng-container>", styles: [":host .menu-template-container{position:absolute;z-index:999}\n"], directives: [{ type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0, type: TextInputAutocompleteComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'flx-text-input-autocomplete',
                    templateUrl: './text-input-autocomplete.component.html',
                    styleUrls: ['./text-input-autocomplete.component.scss'],
                }]
        }], ctorParameters: function () { return [{ type: i0.NgZone }, { type: i0.Renderer2 }]; }, propDecorators: { textInputElement: [{
                type: Input
            }], menuTemplate: [{
                type: Input
            }], triggerCharacter: [{
                type: Input
            }], searchRegexp: [{
                type: Input
            }], closeMenuOnBlur: [{
                type: Input
            }], selectedChoices: [{
                type: Input
            }], getChoiceLabel: [{
                type: Input
            }], menuShow: [{
                type: Output
            }], menuHide: [{
                type: Output
            }], choiceSelected: [{
                type: Output
            }], choiceRemoved: [{
                type: Output
            }], selectedChoicesChange: [{
                type: Output
            }], search: [{
                type: Output
            }] } });
export function getChoiceIndex(text, label, labels) {
    text = text || '';
    labels.forEach((l) => {
        // Mask other labels that contain given label,
        // e.g. if the given label is '@TED', mask '@TEDEducation' label
        if (l !== label && l.indexOf(label) > -1) {
            text = text.replace(new RegExp(l, 'g'), '*'.repeat(l.length));
        }
    });
    return findStringIndex(text, label, (startIndex, endIndex) => {
        // Only labels that are preceded with below defined chars are valid,
        // (avoid 'labels' found in e.g. links being mistaken for choices)
        const precedingChar = text[startIndex - 1];
        return (precedingCharValid(precedingChar) ||
            text.slice(startIndex - 4, startIndex) === '<br>');
    });
}
export function precedingCharValid(char) {
    return !char || char === '\n' || char === ' ' || char === '(';
}
// TODO: move to common!
export function findStringIndex(text, value, callback) {
    let index = text.indexOf(value);
    if (index === -1) {
        return -1;
    }
    let conditionMet = callback(index, index + value.length);
    while (!conditionMet && index > -1) {
        index = text.indexOf(value, index + 1);
        conditionMet = callback(index, index + value.length);
    }
    return index;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1pbnB1dC1hdXRvY29tcGxldGUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbWVudGlvbnMvc3JjL2xpYi90ZXh0LWlucHV0LWF1dG9jb21wbGV0ZS90ZXh0LWlucHV0LWF1dG9jb21wbGV0ZS5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9tZW50aW9ucy9zcmMvbGliL3RleHQtaW5wdXQtYXV0b2NvbXBsZXRlL3RleHQtaW5wdXQtYXV0b2NvbXBsZXRlLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsWUFBWSxFQUNaLEtBQUssRUFLTCxNQUFNLEdBSVAsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7OztBQWlCaEUsTUFBTSxPQUFPLDhCQUE4QjtJQTBGekMsWUFBb0IsTUFBYyxFQUFVLFFBQW1CO1FBQTNDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBM0UvRDs7V0FFRztRQUNNLHFCQUFnQixHQUFHLEdBQUcsQ0FBQztRQUVoQzs7O1dBR0c7UUFDTSxpQkFBWSxHQUFXLE9BQU8sQ0FBQztRQUV4Qzs7V0FFRztRQUNNLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBRWpDOztXQUVHO1FBQ00sb0JBQWUsR0FBVSxFQUFFLENBQUM7UUFTckM7O1dBRUc7UUFDTyxhQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUV4Qzs7V0FFRztRQUNPLGFBQVEsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBRXhDOztXQUVHO1FBQ08sbUJBQWMsR0FBRyxJQUFJLFlBQVksRUFBcUIsQ0FBQztRQUVqRTs7V0FFRztRQUNPLGtCQUFhLEdBQUcsSUFBSSxZQUFZLEVBQXFCLENBQUM7UUFFaEU7O1dBRUc7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LENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdEQ7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBSZW5kZXJlcjIsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFRlbXBsYXRlUmVmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgZ2V0Q2FyZXRDb29yZGluYXRlcyB9IGZyb20gJy4vdGV4dGFyZWEtY2FyZXQtcG9zaXRpb24nO1xuLy8gQHRzLWlnbm9yZVxuLy8gaW1wb3J0IHRvUFggZnJvbSAndG8tcHgnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENob2ljZVdpdGhJbmRpY2VzIHtcbiAgY2hvaWNlOiBhbnk7XG4gIGluZGljZXM6IHtcbiAgICBzdGFydDogbnVtYmVyO1xuICAgIGVuZDogbnVtYmVyO1xuICB9O1xufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdmbHgtdGV4dC1pbnB1dC1hdXRvY29tcGxldGUnLFxuICB0ZW1wbGF0ZVVybDogJy4vdGV4dC1pbnB1dC1hdXRvY29tcGxldGUuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi90ZXh0LWlucHV0LWF1dG9jb21wbGV0ZS5jb21wb25lbnQuc2NzcyddLFxufSlcbmV4cG9ydCBjbGFzcyBUZXh0SW5wdXRBdXRvY29tcGxldGVDb21wb25lbnRcbiAgaW1wbGVtZW50cyBPbkNoYW5nZXMsIE9uSW5pdCwgT25EZXN0cm95XG57XG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIHRleHQgaW5wdXQgZWxlbWVudC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHRleHRJbnB1dEVsZW1lbnQ6IEhUTUxUZXh0QXJlYUVsZW1lbnQgfCBIVE1MSW5wdXRFbGVtZW50O1xuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIG1lbnUgdGVtcGxhdGUgKHVzZWQgdG8gZGlzcGxheSB0aGUgc2VhcmNoIHJlc3VsdHMpLlxuICAgKi9cbiAgQElucHV0KClcbiAgbWVudVRlbXBsYXRlITogVGVtcGxhdGVSZWY8YW55PjtcblxuICAvKipcbiAgICogVGhlIGNoYXJhY3RlciB3aGljaCB3aWxsIHRyaWdnZXIgdGhlIHNlYXJjaC5cbiAgICovXG4gIEBJbnB1dCgpIHRyaWdnZXJDaGFyYWN0ZXIgPSAnQCc7XG5cbiAgLyoqXG4gICAqIFRoZSByZWd1bGFyIGV4cHJlc3Npb24gdGhhdCB3aWxsIG1hdGNoIHRoZSBzZWFyY2ggdGV4dCBhZnRlciB0aGUgdHJpZ2dlciBjaGFyYWN0ZXIuXG4gICAqIE5vIG1hdGNoIHdpbGwgaGlkZSB0aGUgbWVudS5cbiAgICovXG4gIEBJbnB1dCgpIHNlYXJjaFJlZ2V4cDogUmVnRXhwID0gL15cXHcqJC87XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gY2xvc2UgdGhlIG1lbnUgd2hlbiB0aGUgaG9zdCB0ZXh0SW5wdXRFbGVtZW50IGxvc2VzIGZvY3VzLlxuICAgKi9cbiAgQElucHV0KCkgY2xvc2VNZW51T25CbHVyID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFByZS1zZXQgY2hvaWNlcyBmb3IgZWRpdCB0ZXh0IG1vZGUsIG9yIHRvIHNlbGVjdC9tYXJrIGNob2ljZXMgZnJvbSBvdXRzaWRlIHRoZSBtZW50aW9ucyBjb21wb25lbnQuXG4gICAqL1xuICBASW5wdXQoKSBzZWxlY3RlZENob2ljZXM6IGFueVtdID0gW107XG5cbiAgLyoqXG4gICAqIEEgZnVuY3Rpb24gdGhhdCBmb3JtYXRzIHRoZSBzZWxlY3RlZCBjaG9pY2Ugb25jZSBzZWxlY3RlZC5cbiAgICogVGhlIHJlc3VsdCAobGFiZWwpIGlzIGFsc28gdXNlZCBhcyBhIGNob2ljZSBpZGVudGlmaWVyIChlLmcuIHdoZW4gZWRpdGluZyBjaG9pY2VzKS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldENob2ljZUxhYmVsITogKGNob2ljZTogYW55KSA9PiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBjaG9pY2VzIG1lbnUgaXMgc2hvd24uXG4gICAqL1xuICBAT3V0cHV0KCkgbWVudVNob3cgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBjaG9pY2VzIG1lbnUgaXMgaGlkZGVuLlxuICAgKi9cbiAgQE91dHB1dCgpIG1lbnVIaWRlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIGNob2ljZSBpcyBzZWxlY3RlZC5cbiAgICovXG4gIEBPdXRwdXQoKSBjaG9pY2VTZWxlY3RlZCA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hvaWNlV2l0aEluZGljZXM+KCk7XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgY2hvaWNlIGlzIHJlbW92ZWQuXG4gICAqL1xuICBAT3V0cHV0KCkgY2hvaWNlUmVtb3ZlZCA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hvaWNlV2l0aEluZGljZXM+KCk7XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgY2hvaWNlIGlzIHNlbGVjdGVkLCByZW1vdmVkLCBvciBpZiBhbnkgb2YgdGhlIGNob2ljZXMnIGluZGljZXMgY2hhbmdlLlxuICAgKi9cbiAgQE91dHB1dCgpIHNlbGVjdGVkQ2hvaWNlc0NoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hvaWNlV2l0aEluZGljZXNbXT4oKTtcblxuICAvKipcbiAgICogQ2FsbGVkIG9uIHVzZXIgaW5wdXQgYWZ0ZXIgZW50ZXJpbmcgdHJpZ2dlciBjaGFyYWN0ZXIuIEVtaXRzIHNlYXJjaCB0ZXJtIHRvIHNlYXJjaCBieS5cbiAgICovXG4gIEBPdXRwdXQoKSBzZWFyY2ggPSBuZXcgRXZlbnRFbWl0dGVyPHN0cmluZz4oKTtcblxuICBwcml2YXRlIF9ldmVudExpc3RlbmVyczogQXJyYXk8KCkgPT4gdm9pZD4gPSBbXTtcblxuICBwcml2YXRlIF9zZWxlY3RlZEN3aXM6IENob2ljZVdpdGhJbmRpY2VzW10gPSBbXTtcbiAgcHJpdmF0ZSBfZHVtcGVkQ3dpczogQ2hvaWNlV2l0aEluZGljZXNbXSA9IFtdO1xuICBwcml2YXRlIF9lZGl0aW5nQ3dpOiBDaG9pY2VXaXRoSW5kaWNlcztcblxuICBtZW51Q3RybD86IHtcbiAgICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcbiAgICBjb250ZXh0OiBhbnk7XG4gICAgcG9zaXRpb246IHtcbiAgICAgIHRvcDogbnVtYmVyO1xuICAgICAgbGVmdDogbnVtYmVyO1xuICAgIH07XG4gICAgdHJpZ2dlckNoYXJhY3RlclBvc2l0aW9uOiBudW1iZXI7XG4gICAgbGFzdENhcmV0UG9zaXRpb24/OiBudW1iZXI7XG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSwgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyKSB7fVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoY2hhbmdlcy5zZWxlY3RlZENob2ljZXMpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMuc2VsZWN0ZWRDaG9pY2VzKSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGltZW91dCBuZWVkZWQgc2luY2UgbmdPbkNoYW5nZXMgaXMgZmlyZWQgYmVmb3JlIHRoZSB0ZXh0SW5wdXRFbGVtZW50IHZhbHVlIGlzIHVwZGF0ZWQuXG4gICAgICAgICAqIFRoZSBwcm9ibGVtIGlzIHNwZWNpZmljIHRvIHB1Ymxpc2hlci5sYW5kaW5nIGNvbXBvbmVudCBpbXBsZW1lbnRhdGlvbiwgaS5lLiBzaW5nbGVcbiAgICAgICAgICogdGV4dGFyZWEgZWxlbWVudCBpcyB1c2VkIGZvciBlYWNoIGFjY291bnQsIG9ubHkgdGV4dCBjaGFuZ2VzLi5cbiAgICAgICAgICogVXNlIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhciB0byBvcHRpbWl6ZSB0aGUgdGltZW91dCBzbyBpdCBkb2Vzbid0IGZpcmVcbiAgICAgICAgICogZ2xvYmFsIGNoYW5nZSBkZXRlY3Rpb24gZXZlbnRzIGNvbnRpbnVvdXNseS4uXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZEN3aXNQcmV2aW91cyA9IEpTT04uc3RyaW5naWZ5KHRoaXMuX3NlbGVjdGVkQ3dpcyk7XG5cbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdGVkQ3dpcyA9IHRoaXMuc2VsZWN0ZWRDaG9pY2VzLm1hcCgoYykgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNob2ljZTogYyxcbiAgICAgICAgICAgICAgICBpbmRpY2VzOiB7IHN0YXJ0OiAtMSwgZW5kOiAtMSB9LFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUluZGljZXMoKTtcblxuICAgICAgICAgICAgLy8gUmVtb3ZlIGNob2ljZXMgdGhhdCBpbmRleCBjb3VsZG4ndCBiZSBmb3VuZCBmb3JcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdGVkQ3dpcyA9IHRoaXMuX3NlbGVjdGVkQ3dpcy5maWx0ZXIoXG4gICAgICAgICAgICAgIChjd2kpID0+IGN3aS5pbmRpY2VzLnN0YXJ0ID4gLTFcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChKU09OLnN0cmluZ2lmeSh0aGlzLl9zZWxlY3RlZEN3aXMpICE9PSBzZWxlY3RlZEN3aXNQcmV2aW91cykge1xuICAgICAgICAgICAgICAvLyBUT0RPOiBTaG91bGQgY2hlY2sgZm9yIGluZGljZXMgY2hhbmdlIG9ubHkgKGlnbm9yaW5nIHRoZSBjaGFuZ2VzIGluc2lkZSBjaG9pY2Ugb2JqZWN0KVxuICAgICAgICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDaG9pY2VzQ2hhbmdlLmVtaXQodGhpcy5fc2VsZWN0ZWRDd2lzKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIGNvbnN0IG9uS2V5ZG93biA9IHRoaXMucmVuZGVyZXIubGlzdGVuKFxuICAgICAgdGhpcy50ZXh0SW5wdXRFbGVtZW50LFxuICAgICAgJ2tleWRvd24nLFxuICAgICAgKGV2ZW50KSA9PiB0aGlzLm9uS2V5ZG93bihldmVudClcbiAgICApO1xuICAgIHRoaXMuX2V2ZW50TGlzdGVuZXJzLnB1c2gob25LZXlkb3duKTtcblxuICAgIGNvbnN0IG9uSW5wdXQgPSB0aGlzLnJlbmRlcmVyLmxpc3RlbihcbiAgICAgIHRoaXMudGV4dElucHV0RWxlbWVudCxcbiAgICAgICdpbnB1dCcsXG4gICAgICAoZXZlbnQpID0+IHRoaXMub25JbnB1dChldmVudClcbiAgICApO1xuICAgIHRoaXMuX2V2ZW50TGlzdGVuZXJzLnB1c2gob25JbnB1dCk7XG5cbiAgICBjb25zdCBvbkJsdXIgPSB0aGlzLnJlbmRlcmVyLmxpc3RlbihcbiAgICAgIHRoaXMudGV4dElucHV0RWxlbWVudCxcbiAgICAgICdibHVyJyxcbiAgICAgIChldmVudCkgPT4gdGhpcy5vbkJsdXIoZXZlbnQpXG4gICAgKTtcbiAgICB0aGlzLl9ldmVudExpc3RlbmVycy5wdXNoKG9uQmx1cik7XG5cbiAgICBjb25zdCBvbkNsaWNrID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oXG4gICAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQsXG4gICAgICAnY2xpY2snLFxuICAgICAgKGV2ZW50KSA9PiB0aGlzLm9uQ2xpY2soZXZlbnQpXG4gICAgKTtcbiAgICB0aGlzLl9ldmVudExpc3RlbmVycy5wdXNoKG9uQ2xpY2spO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5oaWRlTWVudSgpO1xuICAgIHRoaXMuX2V2ZW50TGlzdGVuZXJzLmZvckVhY2goKHVucmVnaXN0ZXIpID0+IHVucmVnaXN0ZXIoKSk7XG4gIH1cblxuICBvbktleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IHRoaXMudGV4dElucHV0RWxlbWVudC5zZWxlY3Rpb25TdGFydDtcbiAgICBjb25zdCBwcmVjZWRpbmdDaGFyID0gdGhpcy50ZXh0SW5wdXRFbGVtZW50LnZhbHVlLmNoYXJBdChcbiAgICAgIGN1cnNvclBvc2l0aW9uISAtIDFcbiAgICApO1xuXG4gICAgaWYgKFxuICAgICAgZXZlbnQua2V5ID09PSB0aGlzLnRyaWdnZXJDaGFyYWN0ZXIgJiZcbiAgICAgIHByZWNlZGluZ0NoYXJWYWxpZChwcmVjZWRpbmdDaGFyKVxuICAgICkge1xuICAgICAgdGhpcy5zaG93TWVudSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGtleUNvZGUgPSBldmVudC5rZXlDb2RlIHx8IGV2ZW50LmNoYXJDb2RlO1xuICAgIGlmIChrZXlDb2RlID09PSA4IHx8IGtleUNvZGUgPT09IDQ2KSB7XG4gICAgICAvLyBiYWNrc3BhY2Ugb3IgZGVsZXRlXG4gICAgICBjb25zdCBjd2lUb0VkaXQgPSB0aGlzLl9zZWxlY3RlZEN3aXMuZmluZCgoY3dpKSA9PiB7XG4gICAgICAgIGNvbnN0IGxhYmVsID0gdGhpcy5nZXRDaG9pY2VMYWJlbChjd2kuY2hvaWNlKTtcbiAgICAgICAgY29uc3QgbGFiZWxFbmRJbmRleCA9IHRoaXMuZ2V0Q2hvaWNlSW5kZXgobGFiZWwpICsgbGFiZWwubGVuZ3RoO1xuICAgICAgICByZXR1cm4gY3Vyc29yUG9zaXRpb24gPT09IGxhYmVsRW5kSW5kZXg7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGN3aVRvRWRpdCkge1xuICAgICAgICB0aGlzLmVkaXRDaG9pY2UoY3dpVG9FZGl0LmNob2ljZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb25JbnB1dChldmVudDogYW55KTogdm9pZCB7XG4gICAgY29uc3QgdmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgY29uc3Qgc2VsZWN0ZWRDd2lzUHJldmlvdXMgPSBKU09OLnN0cmluZ2lmeSh0aGlzLl9zZWxlY3RlZEN3aXMpO1xuXG4gICAgaWYgKCF0aGlzLm1lbnVDdHJsKSB7XG4gICAgICAvLyBkdW1wIGNob2ljZXMgdGhhdCBhcmUgcmVtb3ZlZCBmcm9tIHRoZSB0ZXh0IChlLmcuIHNlbGVjdCBhbGwgKyBwYXN0ZSksXG4gICAgICAvLyBhbmQvb3IgcmV0cmlldmUgdGhlbSBpZiB1c2VyIGUuZy4gVU5ETyB0aGUgYWN0aW9uXG4gICAgICAvLyBCVUc6IGlmIHRleHQgdGhhdCBjb250YWlucyBtZW50aW9ucyBpcyBzZWxlY3RlZCBhbmQgZGVsZXRlZCB1c2luZyB0cmlnZ2VyIGNoYXIsIG5vIGNob2ljZXMgd2lsbCBiZSBkdW1wZWQgKHRoaXMubWVudUN0cmwgd2lsbCBiZSBkZWZpbmVkKSFcbiAgICAgIHRoaXMuZHVtcE5vbkV4aXN0aW5nQ2hvaWNlcygpO1xuICAgICAgdGhpcy5yZXRyaWV2ZUV4aXN0aW5nQ2hvaWNlcygpO1xuICAgICAgdGhpcy51cGRhdGVJbmRpY2VzKCk7XG4gICAgICBpZiAoSlNPTi5zdHJpbmdpZnkodGhpcy5fc2VsZWN0ZWRDd2lzKSAhPT0gc2VsZWN0ZWRDd2lzUHJldmlvdXMpIHtcbiAgICAgICAgLy8gVE9ETzogU2hvdWxkIHByb2JhYmx5IGNoZWNrIGZvciBpbmRpY2VzIGNoYW5nZSBvbmx5IChpZ25vcmluZyB0aGUgY2hhbmdlcyBpbnNpZGUgY2hvaWNlIG9iamVjdClcbiAgICAgICAgdGhpcy5zZWxlY3RlZENob2ljZXNDaGFuZ2UuZW1pdCh0aGlzLl9zZWxlY3RlZEN3aXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlSW5kaWNlcygpO1xuICAgIGlmIChKU09OLnN0cmluZ2lmeSh0aGlzLl9zZWxlY3RlZEN3aXMpICE9PSBzZWxlY3RlZEN3aXNQcmV2aW91cykge1xuICAgICAgdGhpcy5zZWxlY3RlZENob2ljZXNDaGFuZ2UuZW1pdCh0aGlzLl9zZWxlY3RlZEN3aXMpO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHZhbHVlW3RoaXMubWVudUN0cmwudHJpZ2dlckNoYXJhY3RlclBvc2l0aW9uXSAhPT0gdGhpcy50cmlnZ2VyQ2hhcmFjdGVyXG4gICAgKSB7XG4gICAgICB0aGlzLmhpZGVNZW51KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSB0aGlzLnRleHRJbnB1dEVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XG4gICAgaWYgKGN1cnNvclBvc2l0aW9uISA8IHRoaXMubWVudUN0cmwudHJpZ2dlckNoYXJhY3RlclBvc2l0aW9uKSB7XG4gICAgICB0aGlzLmhpZGVNZW51KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2VhcmNoVGV4dCA9IHZhbHVlLnNsaWNlKFxuICAgICAgdGhpcy5tZW51Q3RybC50cmlnZ2VyQ2hhcmFjdGVyUG9zaXRpb24gKyAxLFxuICAgICAgY3Vyc29yUG9zaXRpb25cbiAgICApO1xuICAgIGlmICghc2VhcmNoVGV4dC5tYXRjaCh0aGlzLnNlYXJjaFJlZ2V4cCkpIHtcbiAgICAgIHRoaXMuaGlkZU1lbnUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNlYXJjaC5lbWl0KHNlYXJjaFRleHQpO1xuICB9XG5cbiAgb25CbHVyKGV2ZW50OiBGb2N1c0V2ZW50KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLm1lbnVDdHJsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tZW51Q3RybC5sYXN0Q2FyZXRQb3NpdGlvbiA9IHRoaXMudGV4dElucHV0RWxlbWVudFxuICAgICAgLnNlbGVjdGlvblN0YXJ0IGFzIG51bWJlcjtcblxuICAgIGlmICh0aGlzLmNsb3NlTWVudU9uQmx1cikge1xuICAgICAgdGhpcy5oaWRlTWVudSgpO1xuICAgIH1cbiAgfVxuXG4gIG9uQ2xpY2soZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMubWVudUN0cmwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IHRoaXMudGV4dElucHV0RWxlbWVudC5zZWxlY3Rpb25TdGFydDtcbiAgICBpZiAoY3Vyc29yUG9zaXRpb24hIDw9IHRoaXMubWVudUN0cmwudHJpZ2dlckNoYXJhY3RlclBvc2l0aW9uKSB7XG4gICAgICB0aGlzLmhpZGVNZW51KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2VhcmNoVGV4dCA9IHRoaXMudGV4dElucHV0RWxlbWVudC52YWx1ZS5zbGljZShcbiAgICAgIHRoaXMubWVudUN0cmwudHJpZ2dlckNoYXJhY3RlclBvc2l0aW9uICsgMSxcbiAgICAgIGN1cnNvclBvc2l0aW9uIVxuICAgICk7XG4gICAgaWYgKCFzZWFyY2hUZXh0Lm1hdGNoKHRoaXMuc2VhcmNoUmVnZXhwKSkge1xuICAgICAgdGhpcy5oaWRlTWVudSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaGlkZU1lbnUoKSB7XG4gICAgaWYgKCF0aGlzLm1lbnVDdHJsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tZW51Q3RybCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLm1lbnVIaWRlLmVtaXQoKTtcblxuICAgIGlmICh0aGlzLl9lZGl0aW5nQ3dpKSB7XG4gICAgICAvLyBJZiB1c2VyIGRpZG4ndCBtYWtlIGFueSBjaGFuZ2VzIHRvIGl0LCBhZGQgaXQgYmFjayB0byB0aGUgc2VsZWN0ZWQgY2hvaWNlc1xuICAgICAgY29uc3QgbGFiZWwgPSB0aGlzLmdldENob2ljZUxhYmVsKHRoaXMuX2VkaXRpbmdDd2kuY2hvaWNlKTtcbiAgICAgIGNvbnN0IGxhYmVsRXhpc3RzID0gdGhpcy5nZXRDaG9pY2VJbmRleChsYWJlbCArICcgJykgPiAtMTtcbiAgICAgIGNvbnN0IGNob2ljZUV4aXN0cyA9IHRoaXMuX3NlbGVjdGVkQ3dpcy5maW5kKFxuICAgICAgICAoY3dpKSA9PiB0aGlzLmdldENob2ljZUxhYmVsKGN3aS5jaG9pY2UpID09PSBsYWJlbFxuICAgICAgKTtcbiAgICAgIGlmIChsYWJlbEV4aXN0cyAmJiAhY2hvaWNlRXhpc3RzKSB7XG4gICAgICAgIHRoaXMuYWRkVG9TZWxlY3RlZCh0aGlzLl9lZGl0aW5nQ3dpKTtcbiAgICAgICAgdGhpcy51cGRhdGVJbmRpY2VzKCk7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRDaG9pY2VzQ2hhbmdlLmVtaXQodGhpcy5fc2VsZWN0ZWRDd2lzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fZWRpdGluZ0N3aSA9IHVuZGVmaW5lZCBhcyB1bmtub3duIGFzIENob2ljZVdpdGhJbmRpY2VzO1xuICB9XG5cbiAgcHJpdmF0ZSBzaG93TWVudSgpIHtcbiAgICBpZiAodGhpcy5tZW51Q3RybCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGxpbmVIZWlnaHQgPSB0aGlzLmdldExpbmVIZWlnaHQodGhpcy50ZXh0SW5wdXRFbGVtZW50KTtcbiAgICBjb25zdCB7IHRvcCwgbGVmdCB9ID0gZ2V0Q2FyZXRDb29yZGluYXRlcyhcbiAgICAgIHRoaXMudGV4dElucHV0RWxlbWVudCxcbiAgICAgIHRoaXMudGV4dElucHV0RWxlbWVudC5zZWxlY3Rpb25TdGFydFxuICAgICk7XG5cbiAgICB0aGlzLm1lbnVDdHJsID0ge1xuICAgICAgdGVtcGxhdGU6IHRoaXMubWVudVRlbXBsYXRlLFxuICAgICAgY29udGV4dDoge1xuICAgICAgICBzZWxlY3RDaG9pY2U6IHRoaXMuc2VsZWN0Q2hvaWNlLFxuICAgICAgICAvLyAkaW1wbGljaXQ6IHtcbiAgICAgICAgLy8gICBzZWxlY3RDaG9pY2U6IHRoaXMuc2VsZWN0Q2hvaWNlXG4gICAgICAgIC8vIH0sXG4gICAgICB9LFxuICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgdG9wOiB0b3AgKyBsaW5lSGVpZ2h0LFxuICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgfSxcbiAgICAgIHRyaWdnZXJDaGFyYWN0ZXJQb3NpdGlvbjogdGhpcy50ZXh0SW5wdXRFbGVtZW50LnNlbGVjdGlvblN0YXJ0IGFzIG51bWJlcixcbiAgICB9O1xuXG4gICAgdGhpcy5tZW51U2hvdy5lbWl0KCk7XG4gIH1cblxuICBzZWxlY3RDaG9pY2UgPSAoY2hvaWNlOiBhbnkpID0+IHtcbiAgICBjb25zdCBsYWJlbCA9IHRoaXMuZ2V0Q2hvaWNlTGFiZWwoY2hvaWNlKTtcbiAgICBjb25zdCBzdGFydEluZGV4ID0gdGhpcy5tZW51Q3RybCEudHJpZ2dlckNoYXJhY3RlclBvc2l0aW9uO1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy50ZXh0SW5wdXRFbGVtZW50LnZhbHVlLnNsaWNlKDAsIHN0YXJ0SW5kZXgpO1xuICAgIGNvbnN0IGNhcmV0UG9zaXRpb24gPVxuICAgICAgdGhpcy5tZW51Q3RybCEubGFzdENhcmV0UG9zaXRpb24gfHwgdGhpcy50ZXh0SW5wdXRFbGVtZW50LnNlbGVjdGlvblN0YXJ0O1xuICAgIGNvbnN0IGVuZCA9IHRoaXMudGV4dElucHV0RWxlbWVudC52YWx1ZS5zbGljZShjYXJldFBvc2l0aW9uISk7XG4gICAgY29uc3QgaW5zZXJ0VmFsdWUgPSBsYWJlbCArICcgJztcbiAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQudmFsdWUgPSBzdGFydCArIGluc2VydFZhbHVlICsgZW5kO1xuICAgIC8vIGZvcmNlIG5nIG1vZGVsIC8gZm9ybSBjb250cm9sIHRvIHVwZGF0ZVxuICAgIHRoaXMudGV4dElucHV0RWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnaW5wdXQnKSk7XG5cbiAgICBjb25zdCBzZXRDdXJzb3JBdCA9IChzdGFydCArIGluc2VydFZhbHVlKS5sZW5ndGg7XG4gICAgdGhpcy50ZXh0SW5wdXRFbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKHNldEN1cnNvckF0LCBzZXRDdXJzb3JBdCk7XG4gICAgdGhpcy50ZXh0SW5wdXRFbGVtZW50LmZvY3VzKCk7XG5cbiAgICBjb25zdCBjaG9pY2VXaXRoSW5kaWNlcyA9IHtcbiAgICAgIGNob2ljZSxcbiAgICAgIGluZGljZXM6IHtcbiAgICAgICAgc3RhcnQ6IHN0YXJ0SW5kZXgsXG4gICAgICAgIGVuZDogc3RhcnRJbmRleCArIGxhYmVsLmxlbmd0aCxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIHRoaXMuYWRkVG9TZWxlY3RlZChjaG9pY2VXaXRoSW5kaWNlcyk7XG4gICAgdGhpcy51cGRhdGVJbmRpY2VzKCk7XG4gICAgdGhpcy5zZWxlY3RlZENob2ljZXNDaGFuZ2UuZW1pdCh0aGlzLl9zZWxlY3RlZEN3aXMpO1xuXG4gICAgdGhpcy5oaWRlTWVudSgpO1xuICB9O1xuXG4gIGVkaXRDaG9pY2UoY2hvaWNlOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBsYWJlbCA9IHRoaXMuZ2V0Q2hvaWNlTGFiZWwoY2hvaWNlKTtcbiAgICBjb25zdCBzdGFydEluZGV4ID0gdGhpcy5nZXRDaG9pY2VJbmRleChsYWJlbCk7XG4gICAgY29uc3QgZW5kSW5kZXggPSBzdGFydEluZGV4ICsgbGFiZWwubGVuZ3RoO1xuXG4gICAgdGhpcy5fZWRpdGluZ0N3aSA9IHRoaXMuX3NlbGVjdGVkQ3dpcy5maW5kKFxuICAgICAgKGN3aSkgPT4gdGhpcy5nZXRDaG9pY2VMYWJlbChjd2kuY2hvaWNlKSA9PT0gbGFiZWxcbiAgICApIGFzIENob2ljZVdpdGhJbmRpY2VzO1xuICAgIHRoaXMucmVtb3ZlRnJvbVNlbGVjdGVkKHRoaXMuX2VkaXRpbmdDd2kpO1xuICAgIHRoaXMuc2VsZWN0ZWRDaG9pY2VzQ2hhbmdlLmVtaXQodGhpcy5fc2VsZWN0ZWRDd2lzKTtcblxuICAgIHRoaXMudGV4dElucHV0RWxlbWVudC5mb2N1cygpO1xuICAgIHRoaXMudGV4dElucHV0RWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShlbmRJbmRleCwgZW5kSW5kZXgpO1xuXG4gICAgdGhpcy5zaG93TWVudSgpO1xuICAgIHRoaXMubWVudUN0cmwhLnRyaWdnZXJDaGFyYWN0ZXJQb3NpdGlvbiA9IHN0YXJ0SW5kZXg7XG5cbiAgICAvLyBUT0RPOiBlZGl0VmFsdWUgdG8gYmUgcHJvdmlkZWQgZXh0ZXJuYWxseT9cbiAgICBjb25zdCBlZGl0VmFsdWUgPSBsYWJlbC5yZXBsYWNlKHRoaXMudHJpZ2dlckNoYXJhY3RlciwgJycpO1xuICAgIHRoaXMuc2VhcmNoLmVtaXQoZWRpdFZhbHVlKTtcbiAgfVxuXG4gIGR1bXBOb25FeGlzdGluZ0Nob2ljZXMoKTogdm9pZCB7XG4gICAgY29uc3QgY2hvaWNlc1RvRHVtcCA9IHRoaXMuX3NlbGVjdGVkQ3dpcy5maWx0ZXIoKGN3aSkgPT4ge1xuICAgICAgY29uc3QgbGFiZWwgPSB0aGlzLmdldENob2ljZUxhYmVsKGN3aS5jaG9pY2UpO1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0Q2hvaWNlSW5kZXgobGFiZWwpID09PSAtMTtcbiAgICB9KTtcblxuICAgIGlmIChjaG9pY2VzVG9EdW1wLmxlbmd0aCkge1xuICAgICAgY2hvaWNlc1RvRHVtcC5mb3JFYWNoKChjd2kpID0+IHtcbiAgICAgICAgdGhpcy5yZW1vdmVGcm9tU2VsZWN0ZWQoY3dpKTtcbiAgICAgICAgdGhpcy5fZHVtcGVkQ3dpcy5wdXNoKGN3aSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZXRyaWV2ZUV4aXN0aW5nQ2hvaWNlcygpOiB2b2lkIHtcbiAgICBjb25zdCBjaG9pY2VzVG9SZXRyaWV2ZSA9IHRoaXMuX2R1bXBlZEN3aXMuZmlsdGVyKChkY3dpKSA9PiB7XG4gICAgICBjb25zdCBsYWJlbCA9IHRoaXMuZ2V0Q2hvaWNlTGFiZWwoZGN3aS5jaG9pY2UpO1xuICAgICAgY29uc3QgbGFiZWxFeGlzdHMgPSB0aGlzLmdldENob2ljZUluZGV4KGxhYmVsKSA+IC0xO1xuICAgICAgY29uc3QgY2hvaWNlRXhpc3RzID0gdGhpcy5fc2VsZWN0ZWRDd2lzLmZpbmQoXG4gICAgICAgIChzY3dpKSA9PiB0aGlzLmdldENob2ljZUxhYmVsKHNjd2kuY2hvaWNlKSA9PT0gbGFiZWxcbiAgICAgICk7XG4gICAgICByZXR1cm4gbGFiZWxFeGlzdHMgJiYgIWNob2ljZUV4aXN0cztcbiAgICB9KTtcblxuICAgIGlmIChjaG9pY2VzVG9SZXRyaWV2ZS5sZW5ndGgpIHtcbiAgICAgIGNob2ljZXNUb1JldHJpZXZlLmZvckVhY2goKGMpID0+IHtcbiAgICAgICAgdGhpcy5hZGRUb1NlbGVjdGVkKGMpO1xuICAgICAgICB0aGlzLl9kdW1wZWRDd2lzLnNwbGljZSh0aGlzLl9kdW1wZWRDd2lzLmluZGV4T2YoYyksIDEpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgYWRkVG9TZWxlY3RlZChjd2k6IENob2ljZVdpdGhJbmRpY2VzKTogdm9pZCB7XG4gICAgY29uc3QgZXhpc3RzID0gdGhpcy5fc2VsZWN0ZWRDd2lzLnNvbWUoXG4gICAgICAoc2N3aSkgPT5cbiAgICAgICAgdGhpcy5nZXRDaG9pY2VMYWJlbChzY3dpLmNob2ljZSkgPT09IHRoaXMuZ2V0Q2hvaWNlTGFiZWwoY3dpLmNob2ljZSlcbiAgICApO1xuXG4gICAgaWYgKCFleGlzdHMpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkQ3dpcy5wdXNoKGN3aSk7XG4gICAgICB0aGlzLmNob2ljZVNlbGVjdGVkLmVtaXQoY3dpKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVGcm9tU2VsZWN0ZWQoY3dpOiBDaG9pY2VXaXRoSW5kaWNlcyk6IHZvaWQge1xuICAgIGNvbnN0IGV4aXN0cyA9IHRoaXMuX3NlbGVjdGVkQ3dpcy5zb21lKFxuICAgICAgKHNjd2kpID0+XG4gICAgICAgIHRoaXMuZ2V0Q2hvaWNlTGFiZWwoc2N3aS5jaG9pY2UpID09PSB0aGlzLmdldENob2ljZUxhYmVsKGN3aS5jaG9pY2UpXG4gICAgKTtcblxuICAgIGlmIChleGlzdHMpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkQ3dpcy5zcGxpY2UodGhpcy5fc2VsZWN0ZWRDd2lzLmluZGV4T2YoY3dpKSwgMSk7XG4gICAgICB0aGlzLmNob2ljZVJlbW92ZWQuZW1pdChjd2kpO1xuICAgIH1cbiAgfVxuXG4gIGdldExpbmVIZWlnaHQoZWxtOiBIVE1MRWxlbWVudCk6IG51bWJlciB7XG4gICAgY29uc3QgbGluZUhlaWdodFN0ciA9IGdldENvbXB1dGVkU3R5bGUoZWxtKS5saW5lSGVpZ2h0IHx8ICcnO1xuICAgIGNvbnN0IGxpbmVIZWlnaHQgPSBwYXJzZUZsb2F0KGxpbmVIZWlnaHRTdHIpO1xuICAgIGNvbnN0IG5vcm1hbExpbmVIZWlnaHQgPSAxLjI7XG5cbiAgICBjb25zdCBmb250U2l6ZVN0ciA9IGdldENvbXB1dGVkU3R5bGUoZWxtKS5mb250U2l6ZSB8fCAnJztcbiAgICAvLyBjb25zdCBmb250U2l6ZSA9ICt0b1BYKGZvbnRTaXplU3RyKTtcbiAgICBjb25zdCBmb250U2l6ZSA9IHBhcnNlRmxvYXQoZm9udFNpemVTdHIpO1xuXG4gICAgaWYgKGxpbmVIZWlnaHRTdHIgPT09IGxpbmVIZWlnaHQgKyAnJykge1xuICAgICAgcmV0dXJuIGZvbnRTaXplICogbGluZUhlaWdodDtcbiAgICB9XG5cbiAgICBpZiAobGluZUhlaWdodFN0ci50b0xvd2VyQ2FzZSgpID09PSAnbm9ybWFsJykge1xuICAgICAgcmV0dXJuIGZvbnRTaXplICogbm9ybWFsTGluZUhlaWdodDtcbiAgICB9XG5cbiAgICAvLyByZXR1cm4gdG9QWChsaW5lSGVpZ2h0U3RyKTtcbiAgICByZXR1cm4gcGFyc2VGbG9hdChsaW5lSGVpZ2h0U3RyKTtcbiAgfVxuXG4gIGdldENob2ljZUluZGV4KGxhYmVsOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGNvbnN0IHRleHQgPSB0aGlzLnRleHRJbnB1dEVsZW1lbnQgJiYgdGhpcy50ZXh0SW5wdXRFbGVtZW50LnZhbHVlO1xuICAgIGNvbnN0IGxhYmVscyA9IHRoaXMuX3NlbGVjdGVkQ3dpcy5tYXAoKGN3aSkgPT5cbiAgICAgIHRoaXMuZ2V0Q2hvaWNlTGFiZWwoY3dpLmNob2ljZSlcbiAgICApO1xuXG4gICAgcmV0dXJuIGdldENob2ljZUluZGV4KHRleHQsIGxhYmVsLCBsYWJlbHMpO1xuICB9XG5cbiAgdXBkYXRlSW5kaWNlcygpOiB2b2lkIHtcbiAgICB0aGlzLl9zZWxlY3RlZEN3aXMgPSB0aGlzLl9zZWxlY3RlZEN3aXMubWFwKChjd2kpID0+IHtcbiAgICAgIGNvbnN0IGxhYmVsID0gdGhpcy5nZXRDaG9pY2VMYWJlbChjd2kuY2hvaWNlKTtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5nZXRDaG9pY2VJbmRleChsYWJlbCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjaG9pY2U6IGN3aS5jaG9pY2UsXG4gICAgICAgIGluZGljZXM6IHtcbiAgICAgICAgICBzdGFydDogaW5kZXgsXG4gICAgICAgICAgZW5kOiBpbmRleCArIGxhYmVsLmxlbmd0aCxcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENob2ljZUluZGV4KFxuICB0ZXh0OiBzdHJpbmcsXG4gIGxhYmVsOiBzdHJpbmcsXG4gIGxhYmVsczogc3RyaW5nW11cbik6IG51bWJlciB7XG4gIHRleHQgPSB0ZXh0IHx8ICcnO1xuXG4gIGxhYmVscy5mb3JFYWNoKChsKSA9PiB7XG4gICAgLy8gTWFzayBvdGhlciBsYWJlbHMgdGhhdCBjb250YWluIGdpdmVuIGxhYmVsLFxuICAgIC8vIGUuZy4gaWYgdGhlIGdpdmVuIGxhYmVsIGlzICdAVEVEJywgbWFzayAnQFRFREVkdWNhdGlvbicgbGFiZWxcbiAgICBpZiAobCAhPT0gbGFiZWwgJiYgbC5pbmRleE9mKGxhYmVsKSA+IC0xKSB7XG4gICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKG5ldyBSZWdFeHAobCwgJ2cnKSwgJyonLnJlcGVhdChsLmxlbmd0aCkpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGZpbmRTdHJpbmdJbmRleCh0ZXh0LCBsYWJlbCwgKHN0YXJ0SW5kZXgsIGVuZEluZGV4KSA9PiB7XG4gICAgLy8gT25seSBsYWJlbHMgdGhhdCBhcmUgcHJlY2VkZWQgd2l0aCBiZWxvdyBkZWZpbmVkIGNoYXJzIGFyZSB2YWxpZCxcbiAgICAvLyAoYXZvaWQgJ2xhYmVscycgZm91bmQgaW4gZS5nLiBsaW5rcyBiZWluZyBtaXN0YWtlbiBmb3IgY2hvaWNlcylcbiAgICBjb25zdCBwcmVjZWRpbmdDaGFyID0gdGV4dFtzdGFydEluZGV4IC0gMV07XG4gICAgcmV0dXJuIChcbiAgICAgIHByZWNlZGluZ0NoYXJWYWxpZChwcmVjZWRpbmdDaGFyKSB8fFxuICAgICAgdGV4dC5zbGljZShzdGFydEluZGV4IC0gNCwgc3RhcnRJbmRleCkgPT09ICc8YnI+J1xuICAgICk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlY2VkaW5nQ2hhclZhbGlkKGNoYXI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gIWNoYXIgfHwgY2hhciA9PT0gJ1xcbicgfHwgY2hhciA9PT0gJyAnIHx8IGNoYXIgPT09ICcoJztcbn1cblxuLy8gVE9ETzogbW92ZSB0byBjb21tb24hXG5leHBvcnQgZnVuY3Rpb24gZmluZFN0cmluZ0luZGV4KFxuICB0ZXh0OiBzdHJpbmcsXG4gIHZhbHVlOiBzdHJpbmcsXG4gIGNhbGxiYWNrOiAoc3RhcnRJbmRleDogbnVtYmVyLCBlbmRJbmRleDogbnVtYmVyKSA9PiBib29sZWFuXG4pOiBudW1iZXIge1xuICBsZXQgaW5kZXggPSB0ZXh0LmluZGV4T2YodmFsdWUpO1xuICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgbGV0IGNvbmRpdGlvbk1ldCA9IGNhbGxiYWNrKGluZGV4LCBpbmRleCArIHZhbHVlLmxlbmd0aCk7XG5cbiAgd2hpbGUgKCFjb25kaXRpb25NZXQgJiYgaW5kZXggPiAtMSkge1xuICAgIGluZGV4ID0gdGV4dC5pbmRleE9mKHZhbHVlLCBpbmRleCArIDEpO1xuICAgIGNvbmRpdGlvbk1ldCA9IGNhbGxiYWNrKGluZGV4LCBpbmRleCArIHZhbHVlLmxlbmd0aCk7XG4gIH1cblxuICByZXR1cm4gaW5kZXg7XG59XG4iLCI8ZGl2ICpuZ0lmPVwibWVudUN0cmxcIiBjbGFzcz1cIm1lbnUtdGVtcGxhdGUtY29udGFpbmVyXCI+XG4gICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwibWVudVRlbXBsYXRlOyBjb250ZXh0OiBtZW51Q3RybC5jb250ZXh0XCI+PC9uZy1jb250YWluZXI+Il19