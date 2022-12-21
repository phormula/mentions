import * as i0 from '@angular/core';
import { EventEmitter, Component, Input, Output, ViewEncapsulation, ViewChild, HostListener, NgModule } from '@angular/core';
import * as i1 from '@angular/common';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

/* jshint browser: true */
// We'll copy the properties below into the mirror div.
// Note that some browsers, such as Firefox, do not concatenate properties
// into their shorthand (e.g. padding-top, padding-bottom etc. -> padding),
// so we have to list every single property explicitly.
let properties = [
    'direction',
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    // https://developer.mozilla.org/en-US/docs/Web/CSS/font
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',
    'letterSpacing',
    'wordSpacing',
    'tabSize',
    'MozTabSize',
];
function isBrowser() {
    return typeof window !== 'undefined';
}
function isFirefox() {
    return isBrowser() && window.mozInnerScreenX != null;
}
function getCaretCoordinates(element, position, options = {}) {
    var _a;
    if (!isBrowser()) {
        throw new Error('textarea-caret-position#getCaretCoordinates should only be called in a browser');
    }
    let debug = (options && options.debug) || false;
    if (debug) {
        let el = document.querySelector('#input-textarea-caret-position-mirror-div');
        if (el)
            (_a = el === null || el === void 0 ? void 0 : el.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(el);
    }
    // The mirror div will replicate the textarea's style
    let div = document.createElement('div');
    div.id = 'input-textarea-caret-position-mirror-div';
    document.body.appendChild(div);
    let style = div.style;
    let computed = window.getComputedStyle
        ? window.getComputedStyle(element)
        : element.currentStyle; // currentStyle for IE < 9
    let isInput = element.nodeName === 'INPUT';
    // Default textarea styles
    style.whiteSpace = 'pre-wrap';
    if (!isInput)
        style.wordWrap = 'break-word'; // only for textarea-s
    // Position off-screen
    style.position = 'absolute'; // required to return coordinates properly
    if (!debug)
        style.visibility = 'hidden'; // not 'display: none' because we want rendering
    // Transfer the element's properties to the div
    properties.forEach(function (prop) {
        if (isInput && prop === 'lineHeight') {
            // Special case for <input>s because text is rendered centered and line height may be != height
            if (computed.boxSizing === 'border-box') {
                let height = parseInt(computed.height);
                let outerHeight = parseInt(computed.paddingTop) +
                    parseInt(computed.paddingBottom) +
                    parseInt(computed.borderTopWidth) +
                    parseInt(computed.borderBottomWidth);
                let targetHeight = outerHeight + parseInt(computed.lineHeight);
                if (height > targetHeight) {
                    style.lineHeight = height - outerHeight + 'px';
                }
                else if (height === targetHeight) {
                    style.lineHeight = computed.lineHeight;
                }
                else {
                    style.lineHeight = '0';
                }
            }
            else {
                style.lineHeight = computed.height;
            }
        }
        else {
            style[prop] = computed[prop];
        }
    });
    if (isFirefox()) {
        // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
        if (element.scrollHeight > parseInt(computed.height))
            style.overflowY = 'scroll';
    }
    else {
        style.overflow = 'hidden'; // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
    }
    div.textContent = element.value.substring(0, position);
    // The second special handling for input type="text" vs textarea:
    // spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
    if (isInput)
        div.textContent = div.textContent.replace(/\s/g, '\u00a0');
    let span = document.createElement('span');
    // Wrapping must be replicated *exactly*, including when a long word gets
    // onto the next line, with whitespace at the end of the line before (#7).
    // The  *only* reliable way to do that is to copy the *entire* rest of the
    // textarea's content into the <span> created at the caret position.
    // For inputs, just '.' would be enough, but no need to bother.
    span.textContent = element.value.substring(position) || '.'; // || because a completely empty faux span doesn't render at all
    div.appendChild(span);
    let coordinates = {
        top: span.offsetTop + parseInt(computed['borderTopWidth']),
        left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
        height: parseInt(computed['lineHeight']),
    };
    if (debug) {
        span.style.backgroundColor = '#aaa';
    }
    else {
        document.body.removeChild(div);
    }
    return coordinates;
}
// if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
//   module.exports = getCaretCoordinates;
// } else if (isBrowser()) {
//   (window as any).getCaretCoordinates = getCaretCoordinates;
// }

class TextInputAutocompleteComponent {
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
function getChoiceIndex(text, label, labels) {
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
function precedingCharValid(char) {
    return !char || char === '\n' || char === ' ' || char === '(';
}
// TODO: move to common!
function findStringIndex(text, value, callback) {
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

const styleProperties = Object.freeze([
    'direction',
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    // https://developer.mozilla.org/en-US/docs/Web/CSS/font
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',
    'letterSpacing',
    'wordSpacing',
    'tabSize',
    'MozTabSize',
]);
const tagIndexIdPrefix = 'flx-text-highlight-tag-id-';
function indexIsInsideTag(index, tag) {
    return tag.indices.start < index && index < tag.indices.end;
}
function overlaps(tagA, tagB) {
    return (indexIsInsideTag(tagB.indices.start, tagA) ||
        indexIsInsideTag(tagB.indices.end, tagA));
}
function isCoordinateWithinRect(rect, x, y) {
    return rect.left < x && x < rect.right && rect.top < y && y < rect.bottom;
}
function escapeHtml(str) {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
class TextInputHighlightComponent {
    constructor(renderer, ngZone, cdr) {
        this.renderer = renderer;
        this.ngZone = ngZone;
        this.cdr = cdr;
        /**
         * An array of indices of the textarea value to highlight.
         */
        this.tags = [];
        /**
         * The CSS class to add to highlighted tags.
         */
        this.tagCssClass = '';
        /**
         * Called when the area over a tag is clicked.
         */
        this.tagClick = new EventEmitter();
        /**
         * Called when the area over a tag is moused over.
         */
        this.tagMouseEnter = new EventEmitter();
        /**
         * Called when the area over the tag has the mouse removed from it.
         */
        this.tagMouseLeave = new EventEmitter();
        this.highlightElementContainerStyle = {};
        this.textareaEventListeners = [];
        this.isDestroyed = false;
    }
    ngOnChanges(changes) {
        if (changes.textInputElement) {
            this.textInputElementChanged();
        }
        if (changes.tags || changes.tagCssClass || changes.textInputValue) {
            this.addTags();
        }
    }
    ngOnInit() {
        // TODO: flxRelativeContainer directive (wrapping component) instead?
        this.textInputElement.parentElement.style['position'] = 'relative';
        if (getComputedStyle(this.textInputElement.parentElement)
            .display === 'inline') {
            // If textarea is direct child of a component (no DIV container)
            this.textInputElement.parentElement.style['display'] = 'block';
        }
        this.textInputElement.style['background'] = 'none';
        this.textInputElement.style['position'] = 'relative';
        this.textInputElement.style['z-index'] = '2';
    }
    ngOnDestroy() {
        this.isDestroyed = true;
        this.textareaEventListeners.forEach((unregister) => unregister());
    }
    onWindowResize() {
        this.refresh();
    }
    /**
     * Manually call this function to refresh the highlight element if the textarea styles have changed
     */
    refresh() {
        const computed = getComputedStyle(this.textInputElement);
        styleProperties.forEach((prop) => {
            this.highlightElementContainerStyle[prop] = computed[prop];
        });
    }
    textInputElementChanged() {
        const elementType = this.textInputElement.tagName.toLowerCase();
        if (elementType !== 'textarea') {
            throw new Error('The text-input-highlight component must be passed ' +
                'a textarea to the `textInputElement` input. Instead received a ' +
                elementType);
        }
        setTimeout(() => {
            // in case the element was destroyed before the timeout fires
            if (this.isDestroyed) {
                return;
            }
            this.refresh();
            this.textareaEventListeners.forEach((unregister) => unregister());
            this.textareaEventListeners = [];
            const onInput = this.renderer.listen(this.textInputElement, 'input', () => {
                this.addTags();
            });
            this.textareaEventListeners.push(onInput);
            const onScroll = this.renderer.listen(this.textInputElement, 'scroll', () => {
                this.highlightElement.nativeElement.scrollTop =
                    this.textInputElement.scrollTop;
                this.highlightTagElements = this.highlightTagElements.map((tag) => {
                    tag.clientRect = tag.element.getBoundingClientRect();
                    return tag;
                });
            });
            this.textareaEventListeners.push(onScroll);
            const onMouseUp = this.renderer.listen(this.textInputElement, 'mouseup', () => {
                this.refresh();
            });
            this.textareaEventListeners.push(onMouseUp);
            // only add event listeners if the host component actually asks for it
            if (this.tagClick.observers.length > 0) {
                const onClick = this.renderer.listen(this.textInputElement, 'click', (event) => {
                    this.handleTextareaMouseEvent(event, 'click');
                });
                this.textareaEventListeners.push(onClick);
            }
            // only add event listeners if the host component actually asks for it
            if (this.tagMouseEnter.observers.length > 0) {
                const onMouseMove = this.renderer.listen(this.textInputElement, 'mousemove', (event) => {
                    this.handleTextareaMouseEvent(event, 'mousemove');
                });
                this.textareaEventListeners.push(onMouseMove);
                const onMouseLeave = this.renderer.listen(this.textInputElement, 'mouseleave', (event) => {
                    if (this.hoveredTag) {
                        this.onMouseLeave(this.hoveredTag, event);
                    }
                });
                this.textareaEventListeners.push(onMouseLeave);
            }
            this.addTags();
        });
    }
    addTags() {
        const textInputValue = typeof this.textInputValue !== 'undefined'
            ? this.textInputValue
            : this.textInputElement.value;
        const prevTags = [];
        const parts = [];
        [...this.tags]
            .sort((tagA, tagB) => {
            return tagA.indices.start - tagB.indices.start;
        })
            .forEach((tag) => {
            if (tag.indices.start > tag.indices.end) {
                throw new Error(`Highlight tag with indices [${tag.indices.start}, ${tag.indices.end}] cannot start after it ends.`);
            }
            prevTags.forEach((prevTag) => {
                if (overlaps(prevTag, tag)) {
                    throw new Error(`Highlight tag with indices [${tag.indices.start}, ${tag.indices.end}] overlaps with tag [${prevTag.indices.start}, ${prevTag.indices.end}]`);
                }
            });
            // TODO - implement this as an ngFor of items that is generated in the template for a cleaner solution
            const expectedTagLength = tag.indices.end - tag.indices.start;
            const tagContents = textInputValue.slice(tag.indices.start, tag.indices.end);
            if (tagContents.length === expectedTagLength) {
                const previousIndex = prevTags.length > 0 ? prevTags[prevTags.length - 1].indices.end : 0;
                const before = textInputValue.slice(previousIndex, tag.indices.start);
                parts.push(escapeHtml(before));
                const cssClass = tag.cssClass || this.tagCssClass;
                const tagId = tagIndexIdPrefix + this.tags.indexOf(tag);
                // flx-text-highlight-tag-id-${id} is used instead of a data attribute to prevent an angular sanitization warning
                parts.push(`<span class="flx-text-highlight-tag ${tagId} ${cssClass}">${escapeHtml(tagContents)}</span>`);
                prevTags.push(tag);
            }
        });
        const remainingIndex = prevTags.length > 0 ? prevTags[prevTags.length - 1].indices.end : 0;
        const remaining = textInputValue.slice(remainingIndex);
        parts.push(escapeHtml(remaining));
        parts.push('&nbsp;');
        this.highlightedText = parts.join('');
        this.cdr.detectChanges();
        this.highlightTagElements = Array.from(this.highlightElement.nativeElement.getElementsByTagName('span')).map((element) => {
            return { element, clientRect: element.getBoundingClientRect() };
        });
    }
    handleTextareaMouseEvent(event, eventName) {
        const matchingTagIndex = this.highlightTagElements.findIndex((elm) => isCoordinateWithinRect(elm.clientRect, event.clientX, event.clientY));
        if (matchingTagIndex > -1) {
            const target = this.highlightTagElements[matchingTagIndex].element;
            const tagClass = Array.from(target.classList).find((className) => className.startsWith(tagIndexIdPrefix));
            if (tagClass) {
                const tagId = tagClass.replace(tagIndexIdPrefix, '');
                const tag = this.tags[Number(tagId)];
                const tagMouseEvent = { tag, target, event };
                if (eventName === 'click') {
                    this.tagClick.emit(tagMouseEvent);
                }
                else {
                    if (this.hoveredTag) {
                        if (this.hoveredTag.target !== tagMouseEvent.target) {
                            this.onMouseLeave(this.hoveredTag, event);
                            this.onMouseEnter(tagMouseEvent, event);
                        }
                    }
                    else {
                        this.onMouseEnter(tagMouseEvent, event);
                    }
                }
            }
        }
        else if (eventName === 'mousemove' && this.hoveredTag) {
            this.onMouseLeave(this.hoveredTag, event);
        }
    }
    onMouseEnter(tag, event) {
        tag.event = event;
        tag.target.classList.add('flx-text-highlight-tag-hovered');
        this.hoveredTag = tag;
        this.tagMouseEnter.emit(tag);
    }
    onMouseLeave(tag, event) {
        tag.event = event;
        tag.target.classList.remove('flx-text-highlight-tag-hovered');
        this.hoveredTag = undefined;
        this.tagMouseLeave.emit(tag);
    }
}
/** @nocollapse */ TextInputHighlightComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: TextInputHighlightComponent, deps: [{ token: i0.Renderer2 }, { token: i0.NgZone }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ TextInputHighlightComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.0.4", type: TextInputHighlightComponent, selector: "flx-text-input-highlight", inputs: { tags: "tags", textInputElement: "textInputElement", textInputValue: "textInputValue", tagCssClass: "tagCssClass" }, outputs: { tagClick: "tagClick", tagMouseEnter: "tagMouseEnter", tagMouseLeave: "tagMouseLeave" }, host: { listeners: { "window:resize": "onWindowResize()" } }, viewQueries: [{ propertyName: "highlightElement", first: true, predicate: ["highlightElement"], descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"flx-text-highlight-element\"\n     [ngStyle]=\"highlightElementContainerStyle\"\n     [innerHtml]=\"highlightedText\"\n     #highlightElement></div>", styles: [".flx-text-highlight-element{overflow:hidden;word-break:break-word;white-space:pre-wrap;position:absolute;inset:0;pointer-events:none;background:transparent;color:#0000;z-index:91}.flx-text-highlight-tag{padding:1px 2px;margin:-1px -2px;border-radius:6px;overflow-wrap:break-word;background-color:#e1f2fe;font-weight:700;opacity:.6}.flx-text-highlight-tag.flx-text-highlight-tag-hovered{opacity:1}\n"], dependencies: [{ kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }], encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: TextInputHighlightComponent, decorators: [{
            type: Component,
            args: [{ selector: 'flx-text-input-highlight', encapsulation: ViewEncapsulation.None, template: "<div class=\"flx-text-highlight-element\"\n     [ngStyle]=\"highlightElementContainerStyle\"\n     [innerHtml]=\"highlightedText\"\n     #highlightElement></div>", styles: [".flx-text-highlight-element{overflow:hidden;word-break:break-word;white-space:pre-wrap;position:absolute;inset:0;pointer-events:none;background:transparent;color:#0000;z-index:91}.flx-text-highlight-tag{padding:1px 2px;margin:-1px -2px;border-radius:6px;overflow-wrap:break-word;background-color:#e1f2fe;font-weight:700;opacity:.6}.flx-text-highlight-tag.flx-text-highlight-tag-hovered{opacity:1}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.Renderer2 }, { type: i0.NgZone }, { type: i0.ChangeDetectorRef }]; }, propDecorators: { tags: [{
                type: Input
            }], textInputElement: [{
                type: Input
            }], textInputValue: [{
                type: Input
            }], tagCssClass: [{
                type: Input
            }], tagClick: [{
                type: Output
            }], tagMouseEnter: [{
                type: Output
            }], tagMouseLeave: [{
                type: Output
            }], highlightElement: [{
                type: ViewChild,
                args: ['highlightElement', { static: true }]
            }], onWindowResize: [{
                type: HostListener,
                args: ['window:resize']
            }] } });

class MentionsComponent {
    constructor() {
        /**
         * The character that will trigger the menu to appear
         */
        this.triggerCharacter = '@';
        /**
         * The regular expression that will match the search text after the trigger character
         */
        this.searchRegexp = /^\w*$/;
        /**
         * Whether to close the menu when the host textInputElement loses focus
         */
        this.closeMenuOnBlur = false;
        /**
         * Selected choices (required in editing mode in order to keep track of choices)
         */
        this.selectedChoices = [];
        /**
         * Called when the options menu is shown
         */
        this.menuShow = new EventEmitter();
        /**
         * Called when the options menu is hidden
         */
        this.menuHide = new EventEmitter();
        /**
         * Called when a choice is selected
         */
        this.choiceSelected = new EventEmitter();
        /**
         * Called when a choice is removed
         */
        this.choiceRemoved = new EventEmitter();
        /**
         * Called when a choice is selected, removed, or if any of the choices' indices change
         */
        this.selectedChoicesChange = new EventEmitter();
        /**
         * Called on user input after entering trigger character. Emits search term to search by
         */
        this.search = new EventEmitter();
        // --- text-input-highlight.component inputs/outputs ---
        /**
         * The CSS class to add to highlighted tags
         */
        this.tagCssClass = '';
        /**
         * Called when the area over a tag is clicked
         */
        this.tagClick = new EventEmitter();
        /**
         * Called when the area over a tag is moused over
         */
        this.tagMouseEnter = new EventEmitter();
        /**
         * Called when the area over the tag has the mouse is removed from it
         */
        this.tagMouseLeave = new EventEmitter();
        this.selectedCwis = [];
    }
    ngOnInit() { }
    onSelectedChoicesChange(cwis) {
        this.selectedCwis = cwis;
        this.selectedChoicesChange.emit(cwis);
    }
}
/** @nocollapse */ MentionsComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: MentionsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ MentionsComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.0.4", type: MentionsComponent, selector: "flx-mentions", inputs: { textInputElement: "textInputElement", menuTemplate: "menuTemplate", triggerCharacter: "triggerCharacter", searchRegexp: "searchRegexp", closeMenuOnBlur: "closeMenuOnBlur", selectedChoices: "selectedChoices", getChoiceLabel: "getChoiceLabel", tagCssClass: "tagCssClass" }, outputs: { menuShow: "menuShow", menuHide: "menuHide", choiceSelected: "choiceSelected", choiceRemoved: "choiceRemoved", selectedChoicesChange: "selectedChoicesChange", search: "search", tagClick: "tagClick", tagMouseEnter: "tagMouseEnter", tagMouseLeave: "tagMouseLeave" }, ngImport: i0, template: "<flx-text-input-autocomplete [textInputElement]=\"textInputElement\" [menuTemplate]=\"menuTemplate\"\n  [triggerCharacter]=\"triggerCharacter\" [searchRegexp]=\"searchRegexp\" [closeMenuOnBlur]=\"closeMenuOnBlur\"\n  [getChoiceLabel]=\"getChoiceLabel\" [selectedChoices]=\"selectedChoices\" (search)=\"search.emit($event)\"\n  (choiceSelected)=\"choiceSelected.emit($event)\" (choiceRemoved)=\"choiceRemoved.emit($event)\"\n  (selectedChoicesChange)=\"onSelectedChoicesChange($event)\" (menuShow)=\"menuShow.emit()\"\n  (menuHide)=\"menuHide.emit()\"></flx-text-input-autocomplete>\n\n<flx-text-input-highlight [textInputElement]=\"textInputElement\" [tags]=\"selectedCwis\" [tagCssClass]=\"tagCssClass\"\n  (tagClick)=\"tagClick.emit($event)\" (tagMouseEnter)=\"tagMouseEnter.emit($event)\"\n  (tagMouseLeave)=\"tagMouseLeave.emit($event)\"></flx-text-input-highlight>", styles: [""], dependencies: [{ kind: "component", type: TextInputAutocompleteComponent, selector: "flx-text-input-autocomplete", inputs: ["textInputElement", "menuTemplate", "triggerCharacter", "searchRegexp", "closeMenuOnBlur", "selectedChoices", "getChoiceLabel"], outputs: ["menuShow", "menuHide", "choiceSelected", "choiceRemoved", "selectedChoicesChange", "search"] }, { kind: "component", type: TextInputHighlightComponent, selector: "flx-text-input-highlight", inputs: ["tags", "textInputElement", "textInputValue", "tagCssClass"], outputs: ["tagClick", "tagMouseEnter", "tagMouseLeave"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: MentionsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'flx-mentions', template: "<flx-text-input-autocomplete [textInputElement]=\"textInputElement\" [menuTemplate]=\"menuTemplate\"\n  [triggerCharacter]=\"triggerCharacter\" [searchRegexp]=\"searchRegexp\" [closeMenuOnBlur]=\"closeMenuOnBlur\"\n  [getChoiceLabel]=\"getChoiceLabel\" [selectedChoices]=\"selectedChoices\" (search)=\"search.emit($event)\"\n  (choiceSelected)=\"choiceSelected.emit($event)\" (choiceRemoved)=\"choiceRemoved.emit($event)\"\n  (selectedChoicesChange)=\"onSelectedChoicesChange($event)\" (menuShow)=\"menuShow.emit()\"\n  (menuHide)=\"menuHide.emit()\"></flx-text-input-autocomplete>\n\n<flx-text-input-highlight [textInputElement]=\"textInputElement\" [tags]=\"selectedCwis\" [tagCssClass]=\"tagCssClass\"\n  (tagClick)=\"tagClick.emit($event)\" (tagMouseEnter)=\"tagMouseEnter.emit($event)\"\n  (tagMouseLeave)=\"tagMouseLeave.emit($event)\"></flx-text-input-highlight>" }]
        }], ctorParameters: function () { return []; }, propDecorators: { textInputElement: [{
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
            }], tagCssClass: [{
                type: Input
            }], tagClick: [{
                type: Output
            }], tagMouseEnter: [{
                type: Output
            }], tagMouseLeave: [{
                type: Output
            }] } });

class TextInputAutocompleteMenuComponent {
    constructor(elementRef) {
        this.elementRef = elementRef;
        this.selectChoice = new Subject();
        this.choiceLoading = false;
        this.trackById = (index, choice) => (typeof choice.id !== 'undefined' ? choice.id : choice);
    }
    set choices(choices) {
        this._choices = choices;
        if (choices.indexOf(this.activeChoice) === -1 && choices.length > 0) {
            this.activeChoice = choices[0];
        }
    }
    get choices() {
        return this._choices;
    }
    onArrowDown(event) {
        event.preventDefault();
        const index = this.choices.indexOf(this.activeChoice);
        if (this.choices[index + 1]) {
            this.scrollToChoice(index + 1);
        }
    }
    onArrowUp(event) {
        event.preventDefault();
        const index = this.choices.indexOf(this.activeChoice);
        if (this.choices[index - 1]) {
            this.scrollToChoice(index - 1);
        }
    }
    onEnter(event) {
        if (this.choices.indexOf(this.activeChoice) > -1) {
            event.preventDefault();
            this.selectChoice.next(this.activeChoice);
        }
    }
    scrollToChoice(index) {
        this.activeChoice = this._choices[index];
        if (this.dropdownMenuElement) {
            const ulPosition = this.dropdownMenuElement.nativeElement.getBoundingClientRect();
            const li = this.dropdownMenuElement.nativeElement.children[index];
            const liPosition = li.getBoundingClientRect();
            if (liPosition.top < ulPosition.top || liPosition.bottom > ulPosition.bottom) {
                li.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
    }
}
/** @nocollapse */ TextInputAutocompleteMenuComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: TextInputAutocompleteMenuComponent, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ TextInputAutocompleteMenuComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.0.4", type: TextInputAutocompleteMenuComponent, selector: "flx-text-input-autocomplete-menu", host: { listeners: { "document:keydown.ArrowDown": "onArrowDown($event)", "document:keydown.ArrowUp": "onArrowUp($event)", "document:keydown.Enter": "onEnter($event)" } }, viewQueries: [{ propertyName: "dropdownMenuElement", first: true, predicate: ["dropdownMenu"], descendants: true }], ngImport: i0, template: `
    <ul
      *ngIf="choices?.length"
      #dropdownMenu
      class="dropdown-menu"
      [style.top.px]="position?.top"
      [style.left.px]="position?.left"
    >
      <li *ngFor="let choice of choices; trackBy: trackById" [class.active]="activeChoice === choice">
        <a href="javascript:;" (click)="selectChoice.next(choice)">
          {{ choice.name }}
        </a>
      </li>
    </ul>
  `, isInline: true, styles: [".dropdown-menu{display:block;max-height:200px;overflow-y:auto}\n"], dependencies: [{ kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: TextInputAutocompleteMenuComponent, decorators: [{
            type: Component,
            args: [{ selector: 'flx-text-input-autocomplete-menu', template: `
    <ul
      *ngIf="choices?.length"
      #dropdownMenu
      class="dropdown-menu"
      [style.top.px]="position?.top"
      [style.left.px]="position?.left"
    >
      <li *ngFor="let choice of choices; trackBy: trackById" [class.active]="activeChoice === choice">
        <a href="javascript:;" (click)="selectChoice.next(choice)">
          {{ choice.name }}
        </a>
      </li>
    </ul>
  `, styles: [".dropdown-menu{display:block;max-height:200px;overflow-y:auto}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }]; }, propDecorators: { dropdownMenuElement: [{
                type: ViewChild,
                args: ['dropdownMenu', { static: false }]
            }], onArrowDown: [{
                type: HostListener,
                args: ['document:keydown.ArrowDown', ['$event']]
            }], onArrowUp: [{
                type: HostListener,
                args: ['document:keydown.ArrowUp', ['$event']]
            }], onEnter: [{
                type: HostListener,
                args: ['document:keydown.Enter', ['$event']]
            }] } });

class TextInputAutocompleteModule {
}
/** @nocollapse */ TextInputAutocompleteModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: TextInputAutocompleteModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ TextInputAutocompleteModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.0.4", ngImport: i0, type: TextInputAutocompleteModule, declarations: [TextInputAutocompleteComponent,
        TextInputAutocompleteMenuComponent], imports: [CommonModule], exports: [TextInputAutocompleteComponent,
        TextInputAutocompleteMenuComponent] });
/** @nocollapse */ TextInputAutocompleteModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: TextInputAutocompleteModule, imports: [CommonModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: TextInputAutocompleteModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [
                        TextInputAutocompleteComponent,
                        TextInputAutocompleteMenuComponent
                    ],
                    imports: [CommonModule],
                    exports: [
                        TextInputAutocompleteComponent,
                        TextInputAutocompleteMenuComponent
                    ],
                    entryComponents: [TextInputAutocompleteMenuComponent]
                }]
        }] });

class TextInputHighlightModule {
}
/** @nocollapse */ TextInputHighlightModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: TextInputHighlightModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ TextInputHighlightModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.0.4", ngImport: i0, type: TextInputHighlightModule, declarations: [TextInputHighlightComponent], imports: [CommonModule], exports: [TextInputHighlightComponent] });
/** @nocollapse */ TextInputHighlightModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: TextInputHighlightModule, imports: [CommonModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: TextInputHighlightModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [
                        TextInputHighlightComponent,
                    ],
                    imports: [CommonModule],
                    exports: [
                        TextInputHighlightComponent,
                    ]
                }]
        }] });

class MentionsModule {
}
/** @nocollapse */ MentionsModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: MentionsModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
/** @nocollapse */ MentionsModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.0.4", ngImport: i0, type: MentionsModule, declarations: [MentionsComponent], imports: [TextInputAutocompleteModule, TextInputHighlightModule], exports: [MentionsComponent,
        TextInputAutocompleteModule,
        TextInputHighlightModule] });
/** @nocollapse */ MentionsModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: MentionsModule, imports: [TextInputAutocompleteModule, TextInputHighlightModule, TextInputAutocompleteModule,
        TextInputHighlightModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.0.4", ngImport: i0, type: MentionsModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [MentionsComponent],
                    imports: [TextInputAutocompleteModule, TextInputHighlightModule],
                    exports: [
                        MentionsComponent,
                        TextInputAutocompleteModule,
                        TextInputHighlightModule,
                    ],
                }]
        }] });

/*
 * Public API Surface of mentions
 */

/**
 * Generated bundle index. Do not edit.
 */

export { MentionsComponent, MentionsModule, TextInputAutocompleteComponent, TextInputAutocompleteMenuComponent, TextInputAutocompleteModule, TextInputHighlightComponent, TextInputHighlightModule, findStringIndex, getChoiceIndex, precedingCharValid };
//# sourceMappingURL=mentions.mjs.map
