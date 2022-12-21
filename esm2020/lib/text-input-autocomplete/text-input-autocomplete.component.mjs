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
/** @nocollapse */ TextInputAutocompleteComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: TextInputAutocompleteComponent, deps: [{ token: i0.NgZone }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ TextInputAutocompleteComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.0.4", type: TextInputAutocompleteComponent, selector: "flx-text-input-autocomplete", inputs: { textInputElement: "textInputElement", menuTemplate: "menuTemplate", triggerCharacter: "triggerCharacter", searchRegexp: "searchRegexp", closeMenuOnBlur: "closeMenuOnBlur", selectedChoices: "selectedChoices", getChoiceLabel: "getChoiceLabel" }, outputs: { menuShow: "menuShow", menuHide: "menuHide", choiceSelected: "choiceSelected", choiceRemoved: "choiceRemoved", selectedChoicesChange: "selectedChoicesChange", search: "search" }, usesOnChanges: true, ngImport: i0, template: "<div *ngIf=\"menuCtrl\" class=\"menu-template-container\">\n   <ng-container *ngTemplateOutlet=\"menuTemplate; context: menuCtrl.context\"></ng-container>", styles: [":host .menu-template-container{position:absolute;z-index:999}\n"], dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: TextInputAutocompleteComponent, decorators: [{
            type: Component,
            args: [{ selector: 'flx-text-input-autocomplete', template: "<div *ngIf=\"menuCtrl\" class=\"menu-template-container\">\n   <ng-container *ngTemplateOutlet=\"menuTemplate; context: menuCtrl.context\"></ng-container>", styles: [":host .menu-template-container{position:absolute;z-index:999}\n"] }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1pbnB1dC1hdXRvY29tcGxldGUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbWVudGlvbnMvc3JjL2xpYi90ZXh0LWlucHV0LWF1dG9jb21wbGV0ZS90ZXh0LWlucHV0LWF1dG9jb21wbGV0ZS5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9tZW50aW9ucy9zcmMvbGliL3RleHQtaW5wdXQtYXV0b2NvbXBsZXRlL3RleHQtaW5wdXQtYXV0b2NvbXBsZXRlLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsWUFBWSxFQUNaLEtBQUssRUFLTCxNQUFNLEdBSVAsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7OztBQWlCaEUsTUFBTSxPQUFPLDhCQUE4QjtJQTBGekMsWUFBb0IsTUFBYyxFQUFVLFFBQW1CO1FBQTNDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBM0UvRDs7V0FFRztRQUNNLHFCQUFnQixHQUFHLEdBQUcsQ0FBQztRQUVoQzs7O1dBR0c7UUFDTSxpQkFBWSxHQUFXLE9BQU8sQ0FBQztRQUV4Qzs7V0FFRztRQUNNLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBRWpDOztXQUVHO1FBQ00sb0JBQWUsR0FBVSxFQUFFLENBQUM7UUFTckM7O1dBRUc7UUFDTyxhQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUV4Qzs7V0FFRztRQUNPLGFBQVEsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBRXhDOztXQUVHO1FBQ08sbUJBQWMsR0FBRyxJQUFJLFlBQVksRUFBcUIsQ0FBQztRQUVqRTs7V0FFRztRQUNPLGtCQUFhLEdBQUcsSUFBSSxZQUFZLEVBQXFCLENBQUM7UUFFaEU7O1dBRUc7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b3J0IHtcbiAgQ29tcG9uZW50LFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LFxuICBOZ1pvbmUsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgUmVuZGVyZXIyLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBUZW1wbGF0ZVJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IGdldENhcmV0Q29vcmRpbmF0ZXMgfSBmcm9tICcuL3RleHRhcmVhLWNhcmV0LXBvc2l0aW9uJztcbi8vIEB0cy1pZ25vcmVcbi8vIGltcG9ydCB0b1BYIGZyb20gJ3RvLXB4JztcblxuZXhwb3J0IGludGVyZmFjZSBDaG9pY2VXaXRoSW5kaWNlcyB7XG4gIGNob2ljZTogYW55O1xuICBpbmRpY2VzOiB7XG4gICAgc3RhcnQ6IG51bWJlcjtcbiAgICBlbmQ6IG51bWJlcjtcbiAgfTtcbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZmx4LXRleHQtaW5wdXQtYXV0b2NvbXBsZXRlJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3RleHQtaW5wdXQtYXV0b2NvbXBsZXRlLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vdGV4dC1pbnB1dC1hdXRvY29tcGxldGUuY29tcG9uZW50LnNjc3MnXSxcbn0pXG5leHBvcnQgY2xhc3MgVGV4dElucHV0QXV0b2NvbXBsZXRlQ29tcG9uZW50XG4gIGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkluaXQsIE9uRGVzdHJveVxue1xuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSB0ZXh0IGlucHV0IGVsZW1lbnQuXG4gICAqL1xuICBASW5wdXQoKVxuICB0ZXh0SW5wdXRFbGVtZW50OiBIVE1MVGV4dEFyZWFFbGVtZW50IHwgSFRNTElucHV0RWxlbWVudDtcblxuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBtZW51IHRlbXBsYXRlICh1c2VkIHRvIGRpc3BsYXkgdGhlIHNlYXJjaCByZXN1bHRzKS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIG1lbnVUZW1wbGF0ZSE6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgLyoqXG4gICAqIFRoZSBjaGFyYWN0ZXIgd2hpY2ggd2lsbCB0cmlnZ2VyIHRoZSBzZWFyY2guXG4gICAqL1xuICBASW5wdXQoKSB0cmlnZ2VyQ2hhcmFjdGVyID0gJ0AnO1xuXG4gIC8qKlxuICAgKiBUaGUgcmVndWxhciBleHByZXNzaW9uIHRoYXQgd2lsbCBtYXRjaCB0aGUgc2VhcmNoIHRleHQgYWZ0ZXIgdGhlIHRyaWdnZXIgY2hhcmFjdGVyLlxuICAgKiBObyBtYXRjaCB3aWxsIGhpZGUgdGhlIG1lbnUuXG4gICAqL1xuICBASW5wdXQoKSBzZWFyY2hSZWdleHA6IFJlZ0V4cCA9IC9eXFx3KiQvO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGNsb3NlIHRoZSBtZW51IHdoZW4gdGhlIGhvc3QgdGV4dElucHV0RWxlbWVudCBsb3NlcyBmb2N1cy5cbiAgICovXG4gIEBJbnB1dCgpIGNsb3NlTWVudU9uQmx1ciA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBQcmUtc2V0IGNob2ljZXMgZm9yIGVkaXQgdGV4dCBtb2RlLCBvciB0byBzZWxlY3QvbWFyayBjaG9pY2VzIGZyb20gb3V0c2lkZSB0aGUgbWVudGlvbnMgY29tcG9uZW50LlxuICAgKi9cbiAgQElucHV0KCkgc2VsZWN0ZWRDaG9pY2VzOiBhbnlbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBBIGZ1bmN0aW9uIHRoYXQgZm9ybWF0cyB0aGUgc2VsZWN0ZWQgY2hvaWNlIG9uY2Ugc2VsZWN0ZWQuXG4gICAqIFRoZSByZXN1bHQgKGxhYmVsKSBpcyBhbHNvIHVzZWQgYXMgYSBjaG9pY2UgaWRlbnRpZmllciAoZS5nLiB3aGVuIGVkaXRpbmcgY2hvaWNlcykuXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXRDaG9pY2VMYWJlbCE6IChjaG9pY2U6IGFueSkgPT4gc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgY2hvaWNlcyBtZW51IGlzIHNob3duLlxuICAgKi9cbiAgQE91dHB1dCgpIG1lbnVTaG93ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgY2hvaWNlcyBtZW51IGlzIGhpZGRlbi5cbiAgICovXG4gIEBPdXRwdXQoKSBtZW51SGlkZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBjaG9pY2UgaXMgc2VsZWN0ZWQuXG4gICAqL1xuICBAT3V0cHV0KCkgY2hvaWNlU2VsZWN0ZWQgPSBuZXcgRXZlbnRFbWl0dGVyPENob2ljZVdpdGhJbmRpY2VzPigpO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIGNob2ljZSBpcyByZW1vdmVkLlxuICAgKi9cbiAgQE91dHB1dCgpIGNob2ljZVJlbW92ZWQgPSBuZXcgRXZlbnRFbWl0dGVyPENob2ljZVdpdGhJbmRpY2VzPigpO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIGNob2ljZSBpcyBzZWxlY3RlZCwgcmVtb3ZlZCwgb3IgaWYgYW55IG9mIHRoZSBjaG9pY2VzJyBpbmRpY2VzIGNoYW5nZS5cbiAgICovXG4gIEBPdXRwdXQoKSBzZWxlY3RlZENob2ljZXNDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPENob2ljZVdpdGhJbmRpY2VzW10+KCk7XG5cbiAgLyoqXG4gICAqIENhbGxlZCBvbiB1c2VyIGlucHV0IGFmdGVyIGVudGVyaW5nIHRyaWdnZXIgY2hhcmFjdGVyLiBFbWl0cyBzZWFyY2ggdGVybSB0byBzZWFyY2ggYnkuXG4gICAqL1xuICBAT3V0cHV0KCkgc2VhcmNoID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XG5cbiAgcHJpdmF0ZSBfZXZlbnRMaXN0ZW5lcnM6IEFycmF5PCgpID0+IHZvaWQ+ID0gW107XG5cbiAgcHJpdmF0ZSBfc2VsZWN0ZWRDd2lzOiBDaG9pY2VXaXRoSW5kaWNlc1tdID0gW107XG4gIHByaXZhdGUgX2R1bXBlZEN3aXM6IENob2ljZVdpdGhJbmRpY2VzW10gPSBbXTtcbiAgcHJpdmF0ZSBfZWRpdGluZ0N3aTogQ2hvaWNlV2l0aEluZGljZXM7XG5cbiAgbWVudUN0cmw/OiB7XG4gICAgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG4gICAgY29udGV4dDogYW55O1xuICAgIHBvc2l0aW9uOiB7XG4gICAgICB0b3A6IG51bWJlcjtcbiAgICAgIGxlZnQ6IG51bWJlcjtcbiAgICB9O1xuICAgIHRyaWdnZXJDaGFyYWN0ZXJQb3NpdGlvbjogbnVtYmVyO1xuICAgIGxhc3RDYXJldFBvc2l0aW9uPzogbnVtYmVyO1xuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbmdab25lOiBOZ1pvbmUsIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMikge31cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKGNoYW5nZXMuc2VsZWN0ZWRDaG9pY2VzKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnNlbGVjdGVkQ2hvaWNlcykpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRpbWVvdXQgbmVlZGVkIHNpbmNlIG5nT25DaGFuZ2VzIGlzIGZpcmVkIGJlZm9yZSB0aGUgdGV4dElucHV0RWxlbWVudCB2YWx1ZSBpcyB1cGRhdGVkLlxuICAgICAgICAgKiBUaGUgcHJvYmxlbSBpcyBzcGVjaWZpYyB0byBwdWJsaXNoZXIubGFuZGluZyBjb21wb25lbnQgaW1wbGVtZW50YXRpb24sIGkuZS4gc2luZ2xlXG4gICAgICAgICAqIHRleHRhcmVhIGVsZW1lbnQgaXMgdXNlZCBmb3IgZWFjaCBhY2NvdW50LCBvbmx5IHRleHQgY2hhbmdlcy4uXG4gICAgICAgICAqIFVzZSBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIgdG8gb3B0aW1pemUgdGhlIHRpbWVvdXQgc28gaXQgZG9lc24ndCBmaXJlXG4gICAgICAgICAqIGdsb2JhbCBjaGFuZ2UgZGV0ZWN0aW9uIGV2ZW50cyBjb250aW51b3VzbHkuLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRDd2lzUHJldmlvdXMgPSBKU09OLnN0cmluZ2lmeSh0aGlzLl9zZWxlY3RlZEN3aXMpO1xuXG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RlZEN3aXMgPSB0aGlzLnNlbGVjdGVkQ2hvaWNlcy5tYXAoKGMpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjaG9pY2U6IGMsXG4gICAgICAgICAgICAgICAgaW5kaWNlczogeyBzdGFydDogLTEsIGVuZDogLTEgfSxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVJbmRpY2VzKCk7XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBjaG9pY2VzIHRoYXQgaW5kZXggY291bGRuJ3QgYmUgZm91bmQgZm9yXG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RlZEN3aXMgPSB0aGlzLl9zZWxlY3RlZEN3aXMuZmlsdGVyKFxuICAgICAgICAgICAgICAoY3dpKSA9PiBjd2kuaW5kaWNlcy5zdGFydCA+IC0xXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAoSlNPTi5zdHJpbmdpZnkodGhpcy5fc2VsZWN0ZWRDd2lzKSAhPT0gc2VsZWN0ZWRDd2lzUHJldmlvdXMpIHtcbiAgICAgICAgICAgICAgLy8gVE9ETzogU2hvdWxkIGNoZWNrIGZvciBpbmRpY2VzIGNoYW5nZSBvbmx5IChpZ25vcmluZyB0aGUgY2hhbmdlcyBpbnNpZGUgY2hvaWNlIG9iamVjdClcbiAgICAgICAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ2hvaWNlc0NoYW5nZS5lbWl0KHRoaXMuX3NlbGVjdGVkQ3dpcyk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICBjb25zdCBvbktleWRvd24gPSB0aGlzLnJlbmRlcmVyLmxpc3RlbihcbiAgICAgIHRoaXMudGV4dElucHV0RWxlbWVudCxcbiAgICAgICdrZXlkb3duJyxcbiAgICAgIChldmVudCkgPT4gdGhpcy5vbktleWRvd24oZXZlbnQpXG4gICAgKTtcbiAgICB0aGlzLl9ldmVudExpc3RlbmVycy5wdXNoKG9uS2V5ZG93bik7XG5cbiAgICBjb25zdCBvbklucHV0ID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oXG4gICAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQsXG4gICAgICAnaW5wdXQnLFxuICAgICAgKGV2ZW50KSA9PiB0aGlzLm9uSW5wdXQoZXZlbnQpXG4gICAgKTtcbiAgICB0aGlzLl9ldmVudExpc3RlbmVycy5wdXNoKG9uSW5wdXQpO1xuXG4gICAgY29uc3Qgb25CbHVyID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oXG4gICAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQsXG4gICAgICAnYmx1cicsXG4gICAgICAoZXZlbnQpID0+IHRoaXMub25CbHVyKGV2ZW50KVxuICAgICk7XG4gICAgdGhpcy5fZXZlbnRMaXN0ZW5lcnMucHVzaChvbkJsdXIpO1xuXG4gICAgY29uc3Qgb25DbGljayA9IHRoaXMucmVuZGVyZXIubGlzdGVuKFxuICAgICAgdGhpcy50ZXh0SW5wdXRFbGVtZW50LFxuICAgICAgJ2NsaWNrJyxcbiAgICAgIChldmVudCkgPT4gdGhpcy5vbkNsaWNrKGV2ZW50KVxuICAgICk7XG4gICAgdGhpcy5fZXZlbnRMaXN0ZW5lcnMucHVzaChvbkNsaWNrKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuaGlkZU1lbnUoKTtcbiAgICB0aGlzLl9ldmVudExpc3RlbmVycy5mb3JFYWNoKCh1bnJlZ2lzdGVyKSA9PiB1bnJlZ2lzdGVyKCkpO1xuICB9XG5cbiAgb25LZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSB0aGlzLnRleHRJbnB1dEVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XG4gICAgY29uc3QgcHJlY2VkaW5nQ2hhciA9IHRoaXMudGV4dElucHV0RWxlbWVudC52YWx1ZS5jaGFyQXQoXG4gICAgICBjdXJzb3JQb3NpdGlvbiEgLSAxXG4gICAgKTtcblxuICAgIGlmIChcbiAgICAgIGV2ZW50LmtleSA9PT0gdGhpcy50cmlnZ2VyQ2hhcmFjdGVyICYmXG4gICAgICBwcmVjZWRpbmdDaGFyVmFsaWQocHJlY2VkaW5nQ2hhcilcbiAgICApIHtcbiAgICAgIHRoaXMuc2hvd01lbnUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBrZXlDb2RlID0gZXZlbnQua2V5Q29kZSB8fCBldmVudC5jaGFyQ29kZTtcbiAgICBpZiAoa2V5Q29kZSA9PT0gOCB8fCBrZXlDb2RlID09PSA0Nikge1xuICAgICAgLy8gYmFja3NwYWNlIG9yIGRlbGV0ZVxuICAgICAgY29uc3QgY3dpVG9FZGl0ID0gdGhpcy5fc2VsZWN0ZWRDd2lzLmZpbmQoKGN3aSkgPT4ge1xuICAgICAgICBjb25zdCBsYWJlbCA9IHRoaXMuZ2V0Q2hvaWNlTGFiZWwoY3dpLmNob2ljZSk7XG4gICAgICAgIGNvbnN0IGxhYmVsRW5kSW5kZXggPSB0aGlzLmdldENob2ljZUluZGV4KGxhYmVsKSArIGxhYmVsLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIGN1cnNvclBvc2l0aW9uID09PSBsYWJlbEVuZEluZGV4O1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChjd2lUb0VkaXQpIHtcbiAgICAgICAgdGhpcy5lZGl0Q2hvaWNlKGN3aVRvRWRpdC5jaG9pY2UpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9uSW5wdXQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IHZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgIGNvbnN0IHNlbGVjdGVkQ3dpc1ByZXZpb3VzID0gSlNPTi5zdHJpbmdpZnkodGhpcy5fc2VsZWN0ZWRDd2lzKTtcblxuICAgIGlmICghdGhpcy5tZW51Q3RybCkge1xuICAgICAgLy8gZHVtcCBjaG9pY2VzIHRoYXQgYXJlIHJlbW92ZWQgZnJvbSB0aGUgdGV4dCAoZS5nLiBzZWxlY3QgYWxsICsgcGFzdGUpLFxuICAgICAgLy8gYW5kL29yIHJldHJpZXZlIHRoZW0gaWYgdXNlciBlLmcuIFVORE8gdGhlIGFjdGlvblxuICAgICAgLy8gQlVHOiBpZiB0ZXh0IHRoYXQgY29udGFpbnMgbWVudGlvbnMgaXMgc2VsZWN0ZWQgYW5kIGRlbGV0ZWQgdXNpbmcgdHJpZ2dlciBjaGFyLCBubyBjaG9pY2VzIHdpbGwgYmUgZHVtcGVkICh0aGlzLm1lbnVDdHJsIHdpbGwgYmUgZGVmaW5lZCkhXG4gICAgICB0aGlzLmR1bXBOb25FeGlzdGluZ0Nob2ljZXMoKTtcbiAgICAgIHRoaXMucmV0cmlldmVFeGlzdGluZ0Nob2ljZXMoKTtcbiAgICAgIHRoaXMudXBkYXRlSW5kaWNlcygpO1xuICAgICAgaWYgKEpTT04uc3RyaW5naWZ5KHRoaXMuX3NlbGVjdGVkQ3dpcykgIT09IHNlbGVjdGVkQ3dpc1ByZXZpb3VzKSB7XG4gICAgICAgIC8vIFRPRE86IFNob3VsZCBwcm9iYWJseSBjaGVjayBmb3IgaW5kaWNlcyBjaGFuZ2Ugb25seSAoaWdub3JpbmcgdGhlIGNoYW5nZXMgaW5zaWRlIGNob2ljZSBvYmplY3QpXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRDaG9pY2VzQ2hhbmdlLmVtaXQodGhpcy5fc2VsZWN0ZWRDd2lzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZUluZGljZXMoKTtcbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkodGhpcy5fc2VsZWN0ZWRDd2lzKSAhPT0gc2VsZWN0ZWRDd2lzUHJldmlvdXMpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRDaG9pY2VzQ2hhbmdlLmVtaXQodGhpcy5fc2VsZWN0ZWRDd2lzKTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB2YWx1ZVt0aGlzLm1lbnVDdHJsLnRyaWdnZXJDaGFyYWN0ZXJQb3NpdGlvbl0gIT09IHRoaXMudHJpZ2dlckNoYXJhY3RlclxuICAgICkge1xuICAgICAgdGhpcy5oaWRlTWVudSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gdGhpcy50ZXh0SW5wdXRFbGVtZW50LnNlbGVjdGlvblN0YXJ0O1xuICAgIGlmIChjdXJzb3JQb3NpdGlvbiEgPCB0aGlzLm1lbnVDdHJsLnRyaWdnZXJDaGFyYWN0ZXJQb3NpdGlvbikge1xuICAgICAgdGhpcy5oaWRlTWVudSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNlYXJjaFRleHQgPSB2YWx1ZS5zbGljZShcbiAgICAgIHRoaXMubWVudUN0cmwudHJpZ2dlckNoYXJhY3RlclBvc2l0aW9uICsgMSxcbiAgICAgIGN1cnNvclBvc2l0aW9uXG4gICAgKTtcbiAgICBpZiAoIXNlYXJjaFRleHQubWF0Y2godGhpcy5zZWFyY2hSZWdleHApKSB7XG4gICAgICB0aGlzLmhpZGVNZW51KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zZWFyY2guZW1pdChzZWFyY2hUZXh0KTtcbiAgfVxuXG4gIG9uQmx1cihldmVudDogRm9jdXNFdmVudCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5tZW51Q3RybCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubWVudUN0cmwubGFzdENhcmV0UG9zaXRpb24gPSB0aGlzLnRleHRJbnB1dEVsZW1lbnRcbiAgICAgIC5zZWxlY3Rpb25TdGFydCBhcyBudW1iZXI7XG5cbiAgICBpZiAodGhpcy5jbG9zZU1lbnVPbkJsdXIpIHtcbiAgICAgIHRoaXMuaGlkZU1lbnUoKTtcbiAgICB9XG4gIH1cblxuICBvbkNsaWNrKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLm1lbnVDdHJsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSB0aGlzLnRleHRJbnB1dEVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XG4gICAgaWYgKGN1cnNvclBvc2l0aW9uISA8PSB0aGlzLm1lbnVDdHJsLnRyaWdnZXJDaGFyYWN0ZXJQb3NpdGlvbikge1xuICAgICAgdGhpcy5oaWRlTWVudSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNlYXJjaFRleHQgPSB0aGlzLnRleHRJbnB1dEVsZW1lbnQudmFsdWUuc2xpY2UoXG4gICAgICB0aGlzLm1lbnVDdHJsLnRyaWdnZXJDaGFyYWN0ZXJQb3NpdGlvbiArIDEsXG4gICAgICBjdXJzb3JQb3NpdGlvbiFcbiAgICApO1xuICAgIGlmICghc2VhcmNoVGV4dC5tYXRjaCh0aGlzLnNlYXJjaFJlZ2V4cCkpIHtcbiAgICAgIHRoaXMuaGlkZU1lbnUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGhpZGVNZW51KCkge1xuICAgIGlmICghdGhpcy5tZW51Q3RybCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubWVudUN0cmwgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5tZW51SGlkZS5lbWl0KCk7XG5cbiAgICBpZiAodGhpcy5fZWRpdGluZ0N3aSkge1xuICAgICAgLy8gSWYgdXNlciBkaWRuJ3QgbWFrZSBhbnkgY2hhbmdlcyB0byBpdCwgYWRkIGl0IGJhY2sgdG8gdGhlIHNlbGVjdGVkIGNob2ljZXNcbiAgICAgIGNvbnN0IGxhYmVsID0gdGhpcy5nZXRDaG9pY2VMYWJlbCh0aGlzLl9lZGl0aW5nQ3dpLmNob2ljZSk7XG4gICAgICBjb25zdCBsYWJlbEV4aXN0cyA9IHRoaXMuZ2V0Q2hvaWNlSW5kZXgobGFiZWwgKyAnICcpID4gLTE7XG4gICAgICBjb25zdCBjaG9pY2VFeGlzdHMgPSB0aGlzLl9zZWxlY3RlZEN3aXMuZmluZChcbiAgICAgICAgKGN3aSkgPT4gdGhpcy5nZXRDaG9pY2VMYWJlbChjd2kuY2hvaWNlKSA9PT0gbGFiZWxcbiAgICAgICk7XG4gICAgICBpZiAobGFiZWxFeGlzdHMgJiYgIWNob2ljZUV4aXN0cykge1xuICAgICAgICB0aGlzLmFkZFRvU2VsZWN0ZWQodGhpcy5fZWRpdGluZ0N3aSk7XG4gICAgICAgIHRoaXMudXBkYXRlSW5kaWNlcygpO1xuICAgICAgICB0aGlzLnNlbGVjdGVkQ2hvaWNlc0NoYW5nZS5lbWl0KHRoaXMuX3NlbGVjdGVkQ3dpcyk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2VkaXRpbmdDd2kgPSB1bmRlZmluZWQgYXMgdW5rbm93biBhcyBDaG9pY2VXaXRoSW5kaWNlcztcbiAgfVxuXG4gIHByaXZhdGUgc2hvd01lbnUoKSB7XG4gICAgaWYgKHRoaXMubWVudUN0cmwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsaW5lSGVpZ2h0ID0gdGhpcy5nZXRMaW5lSGVpZ2h0KHRoaXMudGV4dElucHV0RWxlbWVudCk7XG4gICAgY29uc3QgeyB0b3AsIGxlZnQgfSA9IGdldENhcmV0Q29vcmRpbmF0ZXMoXG4gICAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQsXG4gICAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQuc2VsZWN0aW9uU3RhcnRcbiAgICApO1xuXG4gICAgdGhpcy5tZW51Q3RybCA9IHtcbiAgICAgIHRlbXBsYXRlOiB0aGlzLm1lbnVUZW1wbGF0ZSxcbiAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAgc2VsZWN0Q2hvaWNlOiB0aGlzLnNlbGVjdENob2ljZSxcbiAgICAgICAgLy8gJGltcGxpY2l0OiB7XG4gICAgICAgIC8vICAgc2VsZWN0Q2hvaWNlOiB0aGlzLnNlbGVjdENob2ljZVxuICAgICAgICAvLyB9LFxuICAgICAgfSxcbiAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgIHRvcDogdG9wICsgbGluZUhlaWdodCxcbiAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyQ2hhcmFjdGVyUG9zaXRpb246IHRoaXMudGV4dElucHV0RWxlbWVudC5zZWxlY3Rpb25TdGFydCBhcyBudW1iZXIsXG4gICAgfTtcblxuICAgIHRoaXMubWVudVNob3cuZW1pdCgpO1xuICB9XG5cbiAgc2VsZWN0Q2hvaWNlID0gKGNob2ljZTogYW55KSA9PiB7XG4gICAgY29uc3QgbGFiZWwgPSB0aGlzLmdldENob2ljZUxhYmVsKGNob2ljZSk7XG4gICAgY29uc3Qgc3RhcnRJbmRleCA9IHRoaXMubWVudUN0cmwhLnRyaWdnZXJDaGFyYWN0ZXJQb3NpdGlvbjtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMudGV4dElucHV0RWxlbWVudC52YWx1ZS5zbGljZSgwLCBzdGFydEluZGV4KTtcbiAgICBjb25zdCBjYXJldFBvc2l0aW9uID1cbiAgICAgIHRoaXMubWVudUN0cmwhLmxhc3RDYXJldFBvc2l0aW9uIHx8IHRoaXMudGV4dElucHV0RWxlbWVudC5zZWxlY3Rpb25TdGFydDtcbiAgICBjb25zdCBlbmQgPSB0aGlzLnRleHRJbnB1dEVsZW1lbnQudmFsdWUuc2xpY2UoY2FyZXRQb3NpdGlvbiEpO1xuICAgIGNvbnN0IGluc2VydFZhbHVlID0gbGFiZWwgKyAnICc7XG4gICAgdGhpcy50ZXh0SW5wdXRFbGVtZW50LnZhbHVlID0gc3RhcnQgKyBpbnNlcnRWYWx1ZSArIGVuZDtcbiAgICAvLyBmb3JjZSBuZyBtb2RlbCAvIGZvcm0gY29udHJvbCB0byB1cGRhdGVcbiAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2lucHV0JykpO1xuXG4gICAgY29uc3Qgc2V0Q3Vyc29yQXQgPSAoc3RhcnQgKyBpbnNlcnRWYWx1ZSkubGVuZ3RoO1xuICAgIHRoaXMudGV4dElucHV0RWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShzZXRDdXJzb3JBdCwgc2V0Q3Vyc29yQXQpO1xuICAgIHRoaXMudGV4dElucHV0RWxlbWVudC5mb2N1cygpO1xuXG4gICAgY29uc3QgY2hvaWNlV2l0aEluZGljZXMgPSB7XG4gICAgICBjaG9pY2UsXG4gICAgICBpbmRpY2VzOiB7XG4gICAgICAgIHN0YXJ0OiBzdGFydEluZGV4LFxuICAgICAgICBlbmQ6IHN0YXJ0SW5kZXggKyBsYWJlbC5sZW5ndGgsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICB0aGlzLmFkZFRvU2VsZWN0ZWQoY2hvaWNlV2l0aEluZGljZXMpO1xuICAgIHRoaXMudXBkYXRlSW5kaWNlcygpO1xuICAgIHRoaXMuc2VsZWN0ZWRDaG9pY2VzQ2hhbmdlLmVtaXQodGhpcy5fc2VsZWN0ZWRDd2lzKTtcblxuICAgIHRoaXMuaGlkZU1lbnUoKTtcbiAgfTtcblxuICBlZGl0Q2hvaWNlKGNob2ljZTogYW55KTogdm9pZCB7XG4gICAgY29uc3QgbGFiZWwgPSB0aGlzLmdldENob2ljZUxhYmVsKGNob2ljZSk7XG4gICAgY29uc3Qgc3RhcnRJbmRleCA9IHRoaXMuZ2V0Q2hvaWNlSW5kZXgobGFiZWwpO1xuICAgIGNvbnN0IGVuZEluZGV4ID0gc3RhcnRJbmRleCArIGxhYmVsLmxlbmd0aDtcblxuICAgIHRoaXMuX2VkaXRpbmdDd2kgPSB0aGlzLl9zZWxlY3RlZEN3aXMuZmluZChcbiAgICAgIChjd2kpID0+IHRoaXMuZ2V0Q2hvaWNlTGFiZWwoY3dpLmNob2ljZSkgPT09IGxhYmVsXG4gICAgKSBhcyBDaG9pY2VXaXRoSW5kaWNlcztcbiAgICB0aGlzLnJlbW92ZUZyb21TZWxlY3RlZCh0aGlzLl9lZGl0aW5nQ3dpKTtcbiAgICB0aGlzLnNlbGVjdGVkQ2hvaWNlc0NoYW5nZS5lbWl0KHRoaXMuX3NlbGVjdGVkQ3dpcyk7XG5cbiAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQuZm9jdXMoKTtcbiAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UoZW5kSW5kZXgsIGVuZEluZGV4KTtcblxuICAgIHRoaXMuc2hvd01lbnUoKTtcbiAgICB0aGlzLm1lbnVDdHJsIS50cmlnZ2VyQ2hhcmFjdGVyUG9zaXRpb24gPSBzdGFydEluZGV4O1xuXG4gICAgLy8gVE9ETzogZWRpdFZhbHVlIHRvIGJlIHByb3ZpZGVkIGV4dGVybmFsbHk/XG4gICAgY29uc3QgZWRpdFZhbHVlID0gbGFiZWwucmVwbGFjZSh0aGlzLnRyaWdnZXJDaGFyYWN0ZXIsICcnKTtcbiAgICB0aGlzLnNlYXJjaC5lbWl0KGVkaXRWYWx1ZSk7XG4gIH1cblxuICBkdW1wTm9uRXhpc3RpbmdDaG9pY2VzKCk6IHZvaWQge1xuICAgIGNvbnN0IGNob2ljZXNUb0R1bXAgPSB0aGlzLl9zZWxlY3RlZEN3aXMuZmlsdGVyKChjd2kpID0+IHtcbiAgICAgIGNvbnN0IGxhYmVsID0gdGhpcy5nZXRDaG9pY2VMYWJlbChjd2kuY2hvaWNlKTtcbiAgICAgIHJldHVybiB0aGlzLmdldENob2ljZUluZGV4KGxhYmVsKSA9PT0gLTE7XG4gICAgfSk7XG5cbiAgICBpZiAoY2hvaWNlc1RvRHVtcC5sZW5ndGgpIHtcbiAgICAgIGNob2ljZXNUb0R1bXAuZm9yRWFjaCgoY3dpKSA9PiB7XG4gICAgICAgIHRoaXMucmVtb3ZlRnJvbVNlbGVjdGVkKGN3aSk7XG4gICAgICAgIHRoaXMuX2R1bXBlZEN3aXMucHVzaChjd2kpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0cmlldmVFeGlzdGluZ0Nob2ljZXMoKTogdm9pZCB7XG4gICAgY29uc3QgY2hvaWNlc1RvUmV0cmlldmUgPSB0aGlzLl9kdW1wZWRDd2lzLmZpbHRlcigoZGN3aSkgPT4ge1xuICAgICAgY29uc3QgbGFiZWwgPSB0aGlzLmdldENob2ljZUxhYmVsKGRjd2kuY2hvaWNlKTtcbiAgICAgIGNvbnN0IGxhYmVsRXhpc3RzID0gdGhpcy5nZXRDaG9pY2VJbmRleChsYWJlbCkgPiAtMTtcbiAgICAgIGNvbnN0IGNob2ljZUV4aXN0cyA9IHRoaXMuX3NlbGVjdGVkQ3dpcy5maW5kKFxuICAgICAgICAoc2N3aSkgPT4gdGhpcy5nZXRDaG9pY2VMYWJlbChzY3dpLmNob2ljZSkgPT09IGxhYmVsXG4gICAgICApO1xuICAgICAgcmV0dXJuIGxhYmVsRXhpc3RzICYmICFjaG9pY2VFeGlzdHM7XG4gICAgfSk7XG5cbiAgICBpZiAoY2hvaWNlc1RvUmV0cmlldmUubGVuZ3RoKSB7XG4gICAgICBjaG9pY2VzVG9SZXRyaWV2ZS5mb3JFYWNoKChjKSA9PiB7XG4gICAgICAgIHRoaXMuYWRkVG9TZWxlY3RlZChjKTtcbiAgICAgICAgdGhpcy5fZHVtcGVkQ3dpcy5zcGxpY2UodGhpcy5fZHVtcGVkQ3dpcy5pbmRleE9mKGMpLCAxKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFkZFRvU2VsZWN0ZWQoY3dpOiBDaG9pY2VXaXRoSW5kaWNlcyk6IHZvaWQge1xuICAgIGNvbnN0IGV4aXN0cyA9IHRoaXMuX3NlbGVjdGVkQ3dpcy5zb21lKFxuICAgICAgKHNjd2kpID0+XG4gICAgICAgIHRoaXMuZ2V0Q2hvaWNlTGFiZWwoc2N3aS5jaG9pY2UpID09PSB0aGlzLmdldENob2ljZUxhYmVsKGN3aS5jaG9pY2UpXG4gICAgKTtcblxuICAgIGlmICghZXhpc3RzKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZEN3aXMucHVzaChjd2kpO1xuICAgICAgdGhpcy5jaG9pY2VTZWxlY3RlZC5lbWl0KGN3aSk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlRnJvbVNlbGVjdGVkKGN3aTogQ2hvaWNlV2l0aEluZGljZXMpOiB2b2lkIHtcbiAgICBjb25zdCBleGlzdHMgPSB0aGlzLl9zZWxlY3RlZEN3aXMuc29tZShcbiAgICAgIChzY3dpKSA9PlxuICAgICAgICB0aGlzLmdldENob2ljZUxhYmVsKHNjd2kuY2hvaWNlKSA9PT0gdGhpcy5nZXRDaG9pY2VMYWJlbChjd2kuY2hvaWNlKVxuICAgICk7XG5cbiAgICBpZiAoZXhpc3RzKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZEN3aXMuc3BsaWNlKHRoaXMuX3NlbGVjdGVkQ3dpcy5pbmRleE9mKGN3aSksIDEpO1xuICAgICAgdGhpcy5jaG9pY2VSZW1vdmVkLmVtaXQoY3dpKTtcbiAgICB9XG4gIH1cblxuICBnZXRMaW5lSGVpZ2h0KGVsbTogSFRNTEVsZW1lbnQpOiBudW1iZXIge1xuICAgIGNvbnN0IGxpbmVIZWlnaHRTdHIgPSBnZXRDb21wdXRlZFN0eWxlKGVsbSkubGluZUhlaWdodCB8fCAnJztcbiAgICBjb25zdCBsaW5lSGVpZ2h0ID0gcGFyc2VGbG9hdChsaW5lSGVpZ2h0U3RyKTtcbiAgICBjb25zdCBub3JtYWxMaW5lSGVpZ2h0ID0gMS4yO1xuXG4gICAgY29uc3QgZm9udFNpemVTdHIgPSBnZXRDb21wdXRlZFN0eWxlKGVsbSkuZm9udFNpemUgfHwgJyc7XG4gICAgLy8gY29uc3QgZm9udFNpemUgPSArdG9QWChmb250U2l6ZVN0cik7XG4gICAgY29uc3QgZm9udFNpemUgPSBwYXJzZUZsb2F0KGZvbnRTaXplU3RyKTtcblxuICAgIGlmIChsaW5lSGVpZ2h0U3RyID09PSBsaW5lSGVpZ2h0ICsgJycpIHtcbiAgICAgIHJldHVybiBmb250U2l6ZSAqIGxpbmVIZWlnaHQ7XG4gICAgfVxuXG4gICAgaWYgKGxpbmVIZWlnaHRTdHIudG9Mb3dlckNhc2UoKSA9PT0gJ25vcm1hbCcpIHtcbiAgICAgIHJldHVybiBmb250U2l6ZSAqIG5vcm1hbExpbmVIZWlnaHQ7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIHRvUFgobGluZUhlaWdodFN0cik7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQobGluZUhlaWdodFN0cik7XG4gIH1cblxuICBnZXRDaG9pY2VJbmRleChsYWJlbDogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBjb25zdCB0ZXh0ID0gdGhpcy50ZXh0SW5wdXRFbGVtZW50ICYmIHRoaXMudGV4dElucHV0RWxlbWVudC52YWx1ZTtcbiAgICBjb25zdCBsYWJlbHMgPSB0aGlzLl9zZWxlY3RlZEN3aXMubWFwKChjd2kpID0+XG4gICAgICB0aGlzLmdldENob2ljZUxhYmVsKGN3aS5jaG9pY2UpXG4gICAgKTtcblxuICAgIHJldHVybiBnZXRDaG9pY2VJbmRleCh0ZXh0LCBsYWJlbCwgbGFiZWxzKTtcbiAgfVxuXG4gIHVwZGF0ZUluZGljZXMoKTogdm9pZCB7XG4gICAgdGhpcy5fc2VsZWN0ZWRDd2lzID0gdGhpcy5fc2VsZWN0ZWRDd2lzLm1hcCgoY3dpKSA9PiB7XG4gICAgICBjb25zdCBsYWJlbCA9IHRoaXMuZ2V0Q2hvaWNlTGFiZWwoY3dpLmNob2ljZSk7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuZ2V0Q2hvaWNlSW5kZXgobGFiZWwpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2hvaWNlOiBjd2kuY2hvaWNlLFxuICAgICAgICBpbmRpY2VzOiB7XG4gICAgICAgICAgc3RhcnQ6IGluZGV4LFxuICAgICAgICAgIGVuZDogaW5kZXggKyBsYWJlbC5sZW5ndGgsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDaG9pY2VJbmRleChcbiAgdGV4dDogc3RyaW5nLFxuICBsYWJlbDogc3RyaW5nLFxuICBsYWJlbHM6IHN0cmluZ1tdXG4pOiBudW1iZXIge1xuICB0ZXh0ID0gdGV4dCB8fCAnJztcblxuICBsYWJlbHMuZm9yRWFjaCgobCkgPT4ge1xuICAgIC8vIE1hc2sgb3RoZXIgbGFiZWxzIHRoYXQgY29udGFpbiBnaXZlbiBsYWJlbCxcbiAgICAvLyBlLmcuIGlmIHRoZSBnaXZlbiBsYWJlbCBpcyAnQFRFRCcsIG1hc2sgJ0BURURFZHVjYXRpb24nIGxhYmVsXG4gICAgaWYgKGwgIT09IGxhYmVsICYmIGwuaW5kZXhPZihsYWJlbCkgPiAtMSkge1xuICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShuZXcgUmVnRXhwKGwsICdnJyksICcqJy5yZXBlYXQobC5sZW5ndGgpKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBmaW5kU3RyaW5nSW5kZXgodGV4dCwgbGFiZWwsIChzdGFydEluZGV4LCBlbmRJbmRleCkgPT4ge1xuICAgIC8vIE9ubHkgbGFiZWxzIHRoYXQgYXJlIHByZWNlZGVkIHdpdGggYmVsb3cgZGVmaW5lZCBjaGFycyBhcmUgdmFsaWQsXG4gICAgLy8gKGF2b2lkICdsYWJlbHMnIGZvdW5kIGluIGUuZy4gbGlua3MgYmVpbmcgbWlzdGFrZW4gZm9yIGNob2ljZXMpXG4gICAgY29uc3QgcHJlY2VkaW5nQ2hhciA9IHRleHRbc3RhcnRJbmRleCAtIDFdO1xuICAgIHJldHVybiAoXG4gICAgICBwcmVjZWRpbmdDaGFyVmFsaWQocHJlY2VkaW5nQ2hhcikgfHxcbiAgICAgIHRleHQuc2xpY2Uoc3RhcnRJbmRleCAtIDQsIHN0YXJ0SW5kZXgpID09PSAnPGJyPidcbiAgICApO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZWNlZGluZ0NoYXJWYWxpZChjaGFyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuICFjaGFyIHx8IGNoYXIgPT09ICdcXG4nIHx8IGNoYXIgPT09ICcgJyB8fCBjaGFyID09PSAnKCc7XG59XG5cbi8vIFRPRE86IG1vdmUgdG8gY29tbW9uIVxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRTdHJpbmdJbmRleChcbiAgdGV4dDogc3RyaW5nLFxuICB2YWx1ZTogc3RyaW5nLFxuICBjYWxsYmFjazogKHN0YXJ0SW5kZXg6IG51bWJlciwgZW5kSW5kZXg6IG51bWJlcikgPT4gYm9vbGVhblxuKTogbnVtYmVyIHtcbiAgbGV0IGluZGV4ID0gdGV4dC5pbmRleE9mKHZhbHVlKTtcbiAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGxldCBjb25kaXRpb25NZXQgPSBjYWxsYmFjayhpbmRleCwgaW5kZXggKyB2YWx1ZS5sZW5ndGgpO1xuXG4gIHdoaWxlICghY29uZGl0aW9uTWV0ICYmIGluZGV4ID4gLTEpIHtcbiAgICBpbmRleCA9IHRleHQuaW5kZXhPZih2YWx1ZSwgaW5kZXggKyAxKTtcbiAgICBjb25kaXRpb25NZXQgPSBjYWxsYmFjayhpbmRleCwgaW5kZXggKyB2YWx1ZS5sZW5ndGgpO1xuICB9XG5cbiAgcmV0dXJuIGluZGV4O1xufVxuIiwiPGRpdiAqbmdJZj1cIm1lbnVDdHJsXCIgY2xhc3M9XCJtZW51LXRlbXBsYXRlLWNvbnRhaW5lclwiPlxuICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cIm1lbnVUZW1wbGF0ZTsgY29udGV4dDogbWVudUN0cmwuY29udGV4dFwiPjwvbmctY29udGFpbmVyPiJdfQ==