(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('rxjs')) :
    typeof define === 'function' && define.amd ? define('mentions', ['exports', '@angular/core', '@angular/common', 'rxjs'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.mentions = {}, global.ng.core, global.ng.common, global.rxjs));
})(this, (function (exports, i0, i1, rxjs) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var i0__namespace = /*#__PURE__*/_interopNamespace(i0);
    var i1__namespace = /*#__PURE__*/_interopNamespace(i1);

    /* jshint browser: true */
    // We'll copy the properties below into the mirror div.
    // Note that some browsers, such as Firefox, do not concatenate properties
    // into their shorthand (e.g. padding-top, padding-bottom etc. -> padding),
    // so we have to list every single property explicitly.
    var properties = [
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
    function getCaretCoordinates(element, position, options) {
        if (options === void 0) { options = {}; }
        var _a;
        if (!isBrowser()) {
            throw new Error('textarea-caret-position#getCaretCoordinates should only be called in a browser');
        }
        var debug = (options && options.debug) || false;
        if (debug) {
            var el = document.querySelector('#input-textarea-caret-position-mirror-div');
            if (el)
                (_a = el === null || el === void 0 ? void 0 : el.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(el);
        }
        // The mirror div will replicate the textarea's style
        var div = document.createElement('div');
        div.id = 'input-textarea-caret-position-mirror-div';
        document.body.appendChild(div);
        var style = div.style;
        var computed = window.getComputedStyle
            ? window.getComputedStyle(element)
            : element.currentStyle; // currentStyle for IE < 9
        var isInput = element.nodeName === 'INPUT';
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
                    var height = parseInt(computed.height);
                    var outerHeight = parseInt(computed.paddingTop) +
                        parseInt(computed.paddingBottom) +
                        parseInt(computed.borderTopWidth) +
                        parseInt(computed.borderBottomWidth);
                    var targetHeight = outerHeight + parseInt(computed.lineHeight);
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
        var span = document.createElement('span');
        // Wrapping must be replicated *exactly*, including when a long word gets
        // onto the next line, with whitespace at the end of the line before (#7).
        // The  *only* reliable way to do that is to copy the *entire* rest of the
        // textarea's content into the <span> created at the caret position.
        // For inputs, just '.' would be enough, but no need to bother.
        span.textContent = element.value.substring(position) || '.'; // || because a completely empty faux span doesn't render at all
        div.appendChild(span);
        var coordinates = {
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

    var TextInputAutocompleteComponent = /** @class */ (function () {
        function TextInputAutocompleteComponent(ngZone, renderer) {
            var _this = this;
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
            this.menuShow = new i0.EventEmitter();
            /**
             * Called when the choices menu is hidden.
             */
            this.menuHide = new i0.EventEmitter();
            /**
             * Called when a choice is selected.
             */
            this.choiceSelected = new i0.EventEmitter();
            /**
             * Called when a choice is removed.
             */
            this.choiceRemoved = new i0.EventEmitter();
            /**
             * Called when a choice is selected, removed, or if any of the choices' indices change.
             */
            this.selectedChoicesChange = new i0.EventEmitter();
            /**
             * Called on user input after entering trigger character. Emits search term to search by.
             */
            this.search = new i0.EventEmitter();
            this._eventListeners = [];
            this._selectedCwis = [];
            this._dumpedCwis = [];
            this.selectChoice = function (choice) {
                var label = _this.getChoiceLabel(choice);
                var startIndex = _this.menuCtrl.triggerCharacterPosition;
                var start = _this.textInputElement.value.slice(0, startIndex);
                var caretPosition = _this.menuCtrl.lastCaretPosition || _this.textInputElement.selectionStart;
                var end = _this.textInputElement.value.slice(caretPosition);
                var insertValue = label + ' ';
                _this.textInputElement.value = start + insertValue + end;
                // force ng model / form control to update
                _this.textInputElement.dispatchEvent(new Event('input'));
                var setCursorAt = (start + insertValue).length;
                _this.textInputElement.setSelectionRange(setCursorAt, setCursorAt);
                _this.textInputElement.focus();
                var choiceWithIndices = {
                    choice: choice,
                    indices: {
                        start: startIndex,
                        end: startIndex + label.length,
                    },
                };
                _this.addToSelected(choiceWithIndices);
                _this.updateIndices();
                _this.selectedChoicesChange.emit(_this._selectedCwis);
                _this.hideMenu();
            };
        }
        TextInputAutocompleteComponent.prototype.ngOnChanges = function (changes) {
            var _this = this;
            if (changes.selectedChoices) {
                if (Array.isArray(this.selectedChoices)) {
                    /**
                     * Timeout needed since ngOnChanges is fired before the textInputElement value is updated.
                     * The problem is specific to publisher.landing component implementation, i.e. single
                     * textarea element is used for each account, only text changes..
                     * Use ngZone.runOutsideAngular to optimize the timeout so it doesn't fire
                     * global change detection events continuously..
                     */
                    this.ngZone.runOutsideAngular(function () {
                        setTimeout(function () {
                            var selectedCwisPrevious = JSON.stringify(_this._selectedCwis);
                            _this._selectedCwis = _this.selectedChoices.map(function (c) {
                                return {
                                    choice: c,
                                    indices: { start: -1, end: -1 },
                                };
                            });
                            _this.updateIndices();
                            // Remove choices that index couldn't be found for
                            _this._selectedCwis = _this._selectedCwis.filter(function (cwi) { return cwi.indices.start > -1; });
                            if (JSON.stringify(_this._selectedCwis) !== selectedCwisPrevious) {
                                // TODO: Should check for indices change only (ignoring the changes inside choice object)
                                _this.ngZone.run(function () {
                                    _this.selectedChoicesChange.emit(_this._selectedCwis);
                                });
                            }
                        });
                    });
                }
            }
        };
        TextInputAutocompleteComponent.prototype.ngOnInit = function () {
            var _this = this;
            var onKeydown = this.renderer.listen(this.textInputElement, 'keydown', function (event) { return _this.onKeydown(event); });
            this._eventListeners.push(onKeydown);
            var onInput = this.renderer.listen(this.textInputElement, 'input', function (event) { return _this.onInput(event); });
            this._eventListeners.push(onInput);
            var onBlur = this.renderer.listen(this.textInputElement, 'blur', function (event) { return _this.onBlur(event); });
            this._eventListeners.push(onBlur);
            var onClick = this.renderer.listen(this.textInputElement, 'click', function (event) { return _this.onClick(event); });
            this._eventListeners.push(onClick);
        };
        TextInputAutocompleteComponent.prototype.ngOnDestroy = function () {
            this.hideMenu();
            this._eventListeners.forEach(function (unregister) { return unregister(); });
        };
        TextInputAutocompleteComponent.prototype.onKeydown = function (event) {
            var _this = this;
            var cursorPosition = this.textInputElement.selectionStart;
            var precedingChar = this.textInputElement.value.charAt(cursorPosition - 1);
            if (event.key === this.triggerCharacter &&
                precedingCharValid(precedingChar)) {
                this.showMenu();
                return;
            }
            var keyCode = event.keyCode || event.charCode;
            if (keyCode === 8 || keyCode === 46) {
                // backspace or delete
                var cwiToEdit = this._selectedCwis.find(function (cwi) {
                    var label = _this.getChoiceLabel(cwi.choice);
                    var labelEndIndex = _this.getChoiceIndex(label) + label.length;
                    return cursorPosition === labelEndIndex;
                });
                if (cwiToEdit) {
                    this.editChoice(cwiToEdit.choice);
                }
            }
        };
        TextInputAutocompleteComponent.prototype.onInput = function (event) {
            var value = event.target.value;
            var selectedCwisPrevious = JSON.stringify(this._selectedCwis);
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
            var cursorPosition = this.textInputElement.selectionStart;
            if (cursorPosition < this.menuCtrl.triggerCharacterPosition) {
                this.hideMenu();
                return;
            }
            var searchText = value.slice(this.menuCtrl.triggerCharacterPosition + 1, cursorPosition);
            if (!searchText.match(this.searchRegexp)) {
                this.hideMenu();
                return;
            }
            this.search.emit(searchText);
        };
        TextInputAutocompleteComponent.prototype.onBlur = function (event) {
            if (!this.menuCtrl) {
                return;
            }
            this.menuCtrl.lastCaretPosition = this.textInputElement
                .selectionStart;
            if (this.closeMenuOnBlur) {
                this.hideMenu();
            }
        };
        TextInputAutocompleteComponent.prototype.onClick = function (event) {
            if (!this.menuCtrl) {
                return;
            }
            var cursorPosition = this.textInputElement.selectionStart;
            if (cursorPosition <= this.menuCtrl.triggerCharacterPosition) {
                this.hideMenu();
                return;
            }
            var searchText = this.textInputElement.value.slice(this.menuCtrl.triggerCharacterPosition + 1, cursorPosition);
            if (!searchText.match(this.searchRegexp)) {
                this.hideMenu();
                return;
            }
        };
        TextInputAutocompleteComponent.prototype.hideMenu = function () {
            var _this = this;
            if (!this.menuCtrl) {
                return;
            }
            this.menuCtrl = undefined;
            this.menuHide.emit();
            if (this._editingCwi) {
                // If user didn't make any changes to it, add it back to the selected choices
                var label_1 = this.getChoiceLabel(this._editingCwi.choice);
                var labelExists = this.getChoiceIndex(label_1 + ' ') > -1;
                var choiceExists = this._selectedCwis.find(function (cwi) { return _this.getChoiceLabel(cwi.choice) === label_1; });
                if (labelExists && !choiceExists) {
                    this.addToSelected(this._editingCwi);
                    this.updateIndices();
                    this.selectedChoicesChange.emit(this._selectedCwis);
                }
            }
            this._editingCwi = undefined;
        };
        TextInputAutocompleteComponent.prototype.showMenu = function () {
            if (this.menuCtrl) {
                return;
            }
            var lineHeight = this.getLineHeight(this.textInputElement);
            var _a = getCaretCoordinates(this.textInputElement, this.textInputElement.selectionStart), top = _a.top, left = _a.left;
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
        };
        TextInputAutocompleteComponent.prototype.editChoice = function (choice) {
            var _this = this;
            var label = this.getChoiceLabel(choice);
            var startIndex = this.getChoiceIndex(label);
            var endIndex = startIndex + label.length;
            this._editingCwi = this._selectedCwis.find(function (cwi) { return _this.getChoiceLabel(cwi.choice) === label; });
            this.removeFromSelected(this._editingCwi);
            this.selectedChoicesChange.emit(this._selectedCwis);
            this.textInputElement.focus();
            this.textInputElement.setSelectionRange(endIndex, endIndex);
            this.showMenu();
            this.menuCtrl.triggerCharacterPosition = startIndex;
            // TODO: editValue to be provided externally?
            var editValue = label.replace(this.triggerCharacter, '');
            this.search.emit(editValue);
        };
        TextInputAutocompleteComponent.prototype.dumpNonExistingChoices = function () {
            var _this = this;
            var choicesToDump = this._selectedCwis.filter(function (cwi) {
                var label = _this.getChoiceLabel(cwi.choice);
                return _this.getChoiceIndex(label) === -1;
            });
            if (choicesToDump.length) {
                choicesToDump.forEach(function (cwi) {
                    _this.removeFromSelected(cwi);
                    _this._dumpedCwis.push(cwi);
                });
            }
        };
        TextInputAutocompleteComponent.prototype.retrieveExistingChoices = function () {
            var _this = this;
            var choicesToRetrieve = this._dumpedCwis.filter(function (dcwi) {
                var label = _this.getChoiceLabel(dcwi.choice);
                var labelExists = _this.getChoiceIndex(label) > -1;
                var choiceExists = _this._selectedCwis.find(function (scwi) { return _this.getChoiceLabel(scwi.choice) === label; });
                return labelExists && !choiceExists;
            });
            if (choicesToRetrieve.length) {
                choicesToRetrieve.forEach(function (c) {
                    _this.addToSelected(c);
                    _this._dumpedCwis.splice(_this._dumpedCwis.indexOf(c), 1);
                });
            }
        };
        TextInputAutocompleteComponent.prototype.addToSelected = function (cwi) {
            var _this = this;
            var exists = this._selectedCwis.some(function (scwi) { return _this.getChoiceLabel(scwi.choice) === _this.getChoiceLabel(cwi.choice); });
            if (!exists) {
                this._selectedCwis.push(cwi);
                this.choiceSelected.emit(cwi);
            }
        };
        TextInputAutocompleteComponent.prototype.removeFromSelected = function (cwi) {
            var _this = this;
            var exists = this._selectedCwis.some(function (scwi) { return _this.getChoiceLabel(scwi.choice) === _this.getChoiceLabel(cwi.choice); });
            if (exists) {
                this._selectedCwis.splice(this._selectedCwis.indexOf(cwi), 1);
                this.choiceRemoved.emit(cwi);
            }
        };
        TextInputAutocompleteComponent.prototype.getLineHeight = function (elm) {
            var lineHeightStr = getComputedStyle(elm).lineHeight || '';
            var lineHeight = parseFloat(lineHeightStr);
            var normalLineHeight = 1.2;
            var fontSizeStr = getComputedStyle(elm).fontSize || '';
            // const fontSize = +toPX(fontSizeStr);
            var fontSize = parseFloat(fontSizeStr);
            if (lineHeightStr === lineHeight + '') {
                return fontSize * lineHeight;
            }
            if (lineHeightStr.toLowerCase() === 'normal') {
                return fontSize * normalLineHeight;
            }
            // return toPX(lineHeightStr);
            return parseFloat(lineHeightStr);
        };
        TextInputAutocompleteComponent.prototype.getChoiceIndex = function (label) {
            var _this = this;
            var text = this.textInputElement && this.textInputElement.value;
            var labels = this._selectedCwis.map(function (cwi) { return _this.getChoiceLabel(cwi.choice); });
            return getChoiceIndex(text, label, labels);
        };
        TextInputAutocompleteComponent.prototype.updateIndices = function () {
            var _this = this;
            this._selectedCwis = this._selectedCwis.map(function (cwi) {
                var label = _this.getChoiceLabel(cwi.choice);
                var index = _this.getChoiceIndex(label);
                return {
                    choice: cwi.choice,
                    indices: {
                        start: index,
                        end: index + label.length,
                    },
                };
            });
        };
        return TextInputAutocompleteComponent;
    }());
    TextInputAutocompleteComponent.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: TextInputAutocompleteComponent, deps: [{ token: i0__namespace.NgZone }, { token: i0__namespace.Renderer2 }], target: i0__namespace.ɵɵFactoryTarget.Component });
    TextInputAutocompleteComponent.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.1.5", type: TextInputAutocompleteComponent, selector: "flx-text-input-autocomplete", inputs: { textInputElement: "textInputElement", menuTemplate: "menuTemplate", triggerCharacter: "triggerCharacter", searchRegexp: "searchRegexp", closeMenuOnBlur: "closeMenuOnBlur", selectedChoices: "selectedChoices", getChoiceLabel: "getChoiceLabel" }, outputs: { menuShow: "menuShow", menuHide: "menuHide", choiceSelected: "choiceSelected", choiceRemoved: "choiceRemoved", selectedChoicesChange: "selectedChoicesChange", search: "search" }, usesOnChanges: true, ngImport: i0__namespace, template: "<div *ngIf=\"menuCtrl\" class=\"menu-template-container\">\n   <ng-container *ngTemplateOutlet=\"menuTemplate; context: menuCtrl.context\"></ng-container>", styles: [":host .menu-template-container{position:absolute;z-index:999}\n"], directives: [{ type: i1__namespace.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i1__namespace.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet"] }] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: TextInputAutocompleteComponent, decorators: [{
                type: i0.Component,
                args: [{
                        selector: 'flx-text-input-autocomplete',
                        templateUrl: './text-input-autocomplete.component.html',
                        styleUrls: ['./text-input-autocomplete.component.scss'],
                    }]
            }], ctorParameters: function () { return [{ type: i0__namespace.NgZone }, { type: i0__namespace.Renderer2 }]; }, propDecorators: { textInputElement: [{
                    type: i0.Input
                }], menuTemplate: [{
                    type: i0.Input
                }], triggerCharacter: [{
                    type: i0.Input
                }], searchRegexp: [{
                    type: i0.Input
                }], closeMenuOnBlur: [{
                    type: i0.Input
                }], selectedChoices: [{
                    type: i0.Input
                }], getChoiceLabel: [{
                    type: i0.Input
                }], menuShow: [{
                    type: i0.Output
                }], menuHide: [{
                    type: i0.Output
                }], choiceSelected: [{
                    type: i0.Output
                }], choiceRemoved: [{
                    type: i0.Output
                }], selectedChoicesChange: [{
                    type: i0.Output
                }], search: [{
                    type: i0.Output
                }] } });
    function getChoiceIndex(text, label, labels) {
        text = text || '';
        labels.forEach(function (l) {
            // Mask other labels that contain given label,
            // e.g. if the given label is '@TED', mask '@TEDEducation' label
            if (l !== label && l.indexOf(label) > -1) {
                text = text.replace(new RegExp(l, 'g'), '*'.repeat(l.length));
            }
        });
        return findStringIndex(text, label, function (startIndex, endIndex) {
            // Only labels that are preceded with below defined chars are valid,
            // (avoid 'labels' found in e.g. links being mistaken for choices)
            var precedingChar = text[startIndex - 1];
            return (precedingCharValid(precedingChar) ||
                text.slice(startIndex - 4, startIndex) === '<br>');
        });
    }
    function precedingCharValid(char) {
        return !char || char === '\n' || char === ' ' || char === '(';
    }
    // TODO: move to common!
    function findStringIndex(text, value, callback) {
        var index = text.indexOf(value);
        if (index === -1) {
            return -1;
        }
        var conditionMet = callback(index, index + value.length);
        while (!conditionMet && index > -1) {
            index = text.indexOf(value, index + 1);
            conditionMet = callback(index, index + value.length);
        }
        return index;
    }

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
            desc = { enumerable: true, get: function () { return m[k]; } };
        }
        Object.defineProperty(o, k2, desc);
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    /** @deprecated */
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2)
            for (var i = 0, l = from.length, ar; i < l; i++) {
                if (ar || !(i in from)) {
                    if (!ar)
                        ar = Array.prototype.slice.call(from, 0, i);
                    ar[i] = from[i];
                }
            }
        return to.concat(ar || Array.prototype.slice.call(from));
    }
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }
    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m")
            throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }
    function __classPrivateFieldIn(state, receiver) {
        if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function"))
            throw new TypeError("Cannot use 'in' operator on non-object");
        return typeof state === "function" ? receiver === state : state.has(receiver);
    }

    var styleProperties = Object.freeze([
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
    var tagIndexIdPrefix = 'flx-text-highlight-tag-id-';
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
    var TextInputHighlightComponent = /** @class */ (function () {
        function TextInputHighlightComponent(renderer, ngZone, cdr) {
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
            this.tagClick = new i0.EventEmitter();
            /**
             * Called when the area over a tag is moused over.
             */
            this.tagMouseEnter = new i0.EventEmitter();
            /**
             * Called when the area over the tag has the mouse removed from it.
             */
            this.tagMouseLeave = new i0.EventEmitter();
            this.highlightElementContainerStyle = {};
            this.textareaEventListeners = [];
            this.isDestroyed = false;
        }
        TextInputHighlightComponent.prototype.ngOnChanges = function (changes) {
            if (changes.textInputElement) {
                this.textInputElementChanged();
            }
            if (changes.tags || changes.tagCssClass || changes.textInputValue) {
                this.addTags();
            }
        };
        TextInputHighlightComponent.prototype.ngOnInit = function () {
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
        };
        TextInputHighlightComponent.prototype.ngOnDestroy = function () {
            this.isDestroyed = true;
            this.textareaEventListeners.forEach(function (unregister) { return unregister(); });
        };
        TextInputHighlightComponent.prototype.onWindowResize = function () {
            this.refresh();
        };
        /**
         * Manually call this function to refresh the highlight element if the textarea styles have changed
         */
        TextInputHighlightComponent.prototype.refresh = function () {
            var _this = this;
            var computed = getComputedStyle(this.textInputElement);
            styleProperties.forEach(function (prop) {
                _this.highlightElementContainerStyle[prop] = computed[prop];
            });
        };
        TextInputHighlightComponent.prototype.textInputElementChanged = function () {
            var _this = this;
            var elementType = this.textInputElement.tagName.toLowerCase();
            if (elementType !== 'textarea') {
                throw new Error('The text-input-highlight component must be passed ' +
                    'a textarea to the `textInputElement` input. Instead received a ' +
                    elementType);
            }
            setTimeout(function () {
                // in case the element was destroyed before the timeout fires
                if (_this.isDestroyed) {
                    return;
                }
                _this.refresh();
                _this.textareaEventListeners.forEach(function (unregister) { return unregister(); });
                _this.textareaEventListeners = [];
                var onInput = _this.renderer.listen(_this.textInputElement, 'input', function () {
                    _this.addTags();
                });
                _this.textareaEventListeners.push(onInput);
                var onScroll = _this.renderer.listen(_this.textInputElement, 'scroll', function () {
                    _this.highlightElement.nativeElement.scrollTop =
                        _this.textInputElement.scrollTop;
                    _this.highlightTagElements = _this.highlightTagElements.map(function (tag) {
                        tag.clientRect = tag.element.getBoundingClientRect();
                        return tag;
                    });
                });
                _this.textareaEventListeners.push(onScroll);
                var onMouseUp = _this.renderer.listen(_this.textInputElement, 'mouseup', function () {
                    _this.refresh();
                });
                _this.textareaEventListeners.push(onMouseUp);
                // only add event listeners if the host component actually asks for it
                if (_this.tagClick.observers.length > 0) {
                    var onClick = _this.renderer.listen(_this.textInputElement, 'click', function (event) {
                        _this.handleTextareaMouseEvent(event, 'click');
                    });
                    _this.textareaEventListeners.push(onClick);
                }
                // only add event listeners if the host component actually asks for it
                if (_this.tagMouseEnter.observers.length > 0) {
                    var onMouseMove = _this.renderer.listen(_this.textInputElement, 'mousemove', function (event) {
                        _this.handleTextareaMouseEvent(event, 'mousemove');
                    });
                    _this.textareaEventListeners.push(onMouseMove);
                    var onMouseLeave = _this.renderer.listen(_this.textInputElement, 'mouseleave', function (event) {
                        if (_this.hoveredTag) {
                            _this.onMouseLeave(_this.hoveredTag, event);
                        }
                    });
                    _this.textareaEventListeners.push(onMouseLeave);
                }
                _this.addTags();
            });
        };
        TextInputHighlightComponent.prototype.addTags = function () {
            var _this = this;
            var textInputValue = typeof this.textInputValue !== 'undefined'
                ? this.textInputValue
                : this.textInputElement.value;
            var prevTags = [];
            var parts = [];
            __spreadArray([], __read(this.tags)).sort(function (tagA, tagB) {
                return tagA.indices.start - tagB.indices.start;
            })
                .forEach(function (tag) {
                if (tag.indices.start > tag.indices.end) {
                    throw new Error("Highlight tag with indices [" + tag.indices.start + ", " + tag.indices.end + "] cannot start after it ends.");
                }
                prevTags.forEach(function (prevTag) {
                    if (overlaps(prevTag, tag)) {
                        throw new Error("Highlight tag with indices [" + tag.indices.start + ", " + tag.indices.end + "] overlaps with tag [" + prevTag.indices.start + ", " + prevTag.indices.end + "]");
                    }
                });
                // TODO - implement this as an ngFor of items that is generated in the template for a cleaner solution
                var expectedTagLength = tag.indices.end - tag.indices.start;
                var tagContents = textInputValue.slice(tag.indices.start, tag.indices.end);
                if (tagContents.length === expectedTagLength) {
                    var previousIndex = prevTags.length > 0 ? prevTags[prevTags.length - 1].indices.end : 0;
                    var before = textInputValue.slice(previousIndex, tag.indices.start);
                    parts.push(escapeHtml(before));
                    var cssClass = tag.cssClass || _this.tagCssClass;
                    var tagId = tagIndexIdPrefix + _this.tags.indexOf(tag);
                    // flx-text-highlight-tag-id-${id} is used instead of a data attribute to prevent an angular sanitization warning
                    parts.push("<span class=\"flx-text-highlight-tag " + tagId + " " + cssClass + "\">" + escapeHtml(tagContents) + "</span>");
                    prevTags.push(tag);
                }
            });
            var remainingIndex = prevTags.length > 0 ? prevTags[prevTags.length - 1].indices.end : 0;
            var remaining = textInputValue.slice(remainingIndex);
            parts.push(escapeHtml(remaining));
            parts.push('&nbsp;');
            this.highlightedText = parts.join('');
            this.cdr.detectChanges();
            this.highlightTagElements = Array.from(this.highlightElement.nativeElement.getElementsByTagName('span')).map(function (element) {
                return { element: element, clientRect: element.getBoundingClientRect() };
            });
        };
        TextInputHighlightComponent.prototype.handleTextareaMouseEvent = function (event, eventName) {
            var matchingTagIndex = this.highlightTagElements.findIndex(function (elm) { return isCoordinateWithinRect(elm.clientRect, event.clientX, event.clientY); });
            if (matchingTagIndex > -1) {
                var target = this.highlightTagElements[matchingTagIndex].element;
                var tagClass = Array.from(target.classList).find(function (className) { return className.startsWith(tagIndexIdPrefix); });
                if (tagClass) {
                    var tagId = tagClass.replace(tagIndexIdPrefix, '');
                    var tag = this.tags[Number(tagId)];
                    var tagMouseEvent = { tag: tag, target: target, event: event };
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
        };
        TextInputHighlightComponent.prototype.onMouseEnter = function (tag, event) {
            tag.event = event;
            tag.target.classList.add('flx-text-highlight-tag-hovered');
            this.hoveredTag = tag;
            this.tagMouseEnter.emit(tag);
        };
        TextInputHighlightComponent.prototype.onMouseLeave = function (tag, event) {
            tag.event = event;
            tag.target.classList.remove('flx-text-highlight-tag-hovered');
            this.hoveredTag = undefined;
            this.tagMouseLeave.emit(tag);
        };
        return TextInputHighlightComponent;
    }());
    TextInputHighlightComponent.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: TextInputHighlightComponent, deps: [{ token: i0__namespace.Renderer2 }, { token: i0__namespace.NgZone }, { token: i0__namespace.ChangeDetectorRef }], target: i0__namespace.ɵɵFactoryTarget.Component });
    TextInputHighlightComponent.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.1.5", type: TextInputHighlightComponent, selector: "flx-text-input-highlight", inputs: { tags: "tags", textInputElement: "textInputElement", textInputValue: "textInputValue", tagCssClass: "tagCssClass" }, outputs: { tagClick: "tagClick", tagMouseEnter: "tagMouseEnter", tagMouseLeave: "tagMouseLeave" }, host: { listeners: { "window:resize": "onWindowResize()" } }, viewQueries: [{ propertyName: "highlightElement", first: true, predicate: ["highlightElement"], descendants: true, static: true }], usesOnChanges: true, ngImport: i0__namespace, template: "<div class=\"flx-text-highlight-element\"\n     [ngStyle]=\"highlightElementContainerStyle\"\n     [innerHtml]=\"highlightedText\"\n     #highlightElement></div>", styles: [".flx-text-highlight-element{overflow:hidden;word-break:break-word;white-space:pre-wrap;position:absolute;top:0;bottom:0;left:0;right:0;pointer-events:none;background:transparent;color:#0000;z-index:91}.flx-text-highlight-tag{padding:1px 2px;margin:-1px -2px;border-radius:6px;overflow-wrap:break-word;background-color:#e1f2fe;font-weight:bold;opacity:.6}.flx-text-highlight-tag.flx-text-highlight-tag-hovered{opacity:1;color:#a8d3fe}\n"], directives: [{ type: i1__namespace.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }], encapsulation: i0__namespace.ViewEncapsulation.None });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: TextInputHighlightComponent, decorators: [{
                type: i0.Component,
                args: [{
                        selector: 'flx-text-input-highlight',
                        templateUrl: './text-input-highlight.component.html',
                        styleUrls: ['./text-input-highlight.component.scss'],
                        encapsulation: i0.ViewEncapsulation.None,
                    }]
            }], ctorParameters: function () { return [{ type: i0__namespace.Renderer2 }, { type: i0__namespace.NgZone }, { type: i0__namespace.ChangeDetectorRef }]; }, propDecorators: { tags: [{
                    type: i0.Input
                }], textInputElement: [{
                    type: i0.Input
                }], textInputValue: [{
                    type: i0.Input
                }], tagCssClass: [{
                    type: i0.Input
                }], tagClick: [{
                    type: i0.Output
                }], tagMouseEnter: [{
                    type: i0.Output
                }], tagMouseLeave: [{
                    type: i0.Output
                }], highlightElement: [{
                    type: i0.ViewChild,
                    args: ['highlightElement', { static: true }]
                }], onWindowResize: [{
                    type: i0.HostListener,
                    args: ['window:resize']
                }] } });

    var MentionsComponent = /** @class */ (function () {
        function MentionsComponent() {
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
            this.menuShow = new i0.EventEmitter();
            /**
             * Called when the options menu is hidden
             */
            this.menuHide = new i0.EventEmitter();
            /**
             * Called when a choice is selected
             */
            this.choiceSelected = new i0.EventEmitter();
            /**
             * Called when a choice is removed
             */
            this.choiceRemoved = new i0.EventEmitter();
            /**
             * Called when a choice is selected, removed, or if any of the choices' indices change
             */
            this.selectedChoicesChange = new i0.EventEmitter();
            /**
             * Called on user input after entering trigger character. Emits search term to search by
             */
            this.search = new i0.EventEmitter();
            // --- text-input-highlight.component inputs/outputs ---
            /**
             * The CSS class to add to highlighted tags
             */
            this.tagCssClass = '';
            /**
             * Called when the area over a tag is clicked
             */
            this.tagClick = new i0.EventEmitter();
            /**
             * Called when the area over a tag is moused over
             */
            this.tagMouseEnter = new i0.EventEmitter();
            /**
             * Called when the area over the tag has the mouse is removed from it
             */
            this.tagMouseLeave = new i0.EventEmitter();
            this.selectedCwis = [];
        }
        MentionsComponent.prototype.ngOnInit = function () { };
        MentionsComponent.prototype.onSelectedChoicesChange = function (cwis) {
            this.selectedCwis = cwis;
            this.selectedChoicesChange.emit(cwis);
        };
        return MentionsComponent;
    }());
    MentionsComponent.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: MentionsComponent, deps: [], target: i0__namespace.ɵɵFactoryTarget.Component });
    MentionsComponent.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.1.5", type: MentionsComponent, selector: "flx-mentions", inputs: { textInputElement: "textInputElement", menuTemplate: "menuTemplate", triggerCharacter: "triggerCharacter", searchRegexp: "searchRegexp", closeMenuOnBlur: "closeMenuOnBlur", selectedChoices: "selectedChoices", getChoiceLabel: "getChoiceLabel", tagCssClass: "tagCssClass" }, outputs: { menuShow: "menuShow", menuHide: "menuHide", choiceSelected: "choiceSelected", choiceRemoved: "choiceRemoved", selectedChoicesChange: "selectedChoicesChange", search: "search", tagClick: "tagClick", tagMouseEnter: "tagMouseEnter", tagMouseLeave: "tagMouseLeave" }, ngImport: i0__namespace, template: "<flx-text-input-autocomplete [textInputElement]=\"textInputElement\" [menuTemplate]=\"menuTemplate\"\n  [triggerCharacter]=\"triggerCharacter\" [searchRegexp]=\"searchRegexp\" [closeMenuOnBlur]=\"closeMenuOnBlur\"\n  [getChoiceLabel]=\"getChoiceLabel\" [selectedChoices]=\"selectedChoices\" (search)=\"search.emit($event)\"\n  (choiceSelected)=\"choiceSelected.emit($event)\" (choiceRemoved)=\"choiceRemoved.emit($event)\"\n  (selectedChoicesChange)=\"onSelectedChoicesChange($event)\" (menuShow)=\"menuShow.emit()\"\n  (menuHide)=\"menuHide.emit()\"></flx-text-input-autocomplete>\n\n<flx-text-input-highlight [textInputElement]=\"textInputElement\" [tags]=\"selectedCwis\" [tagCssClass]=\"tagCssClass\"\n  (tagClick)=\"tagClick.emit($event)\" (tagMouseEnter)=\"tagMouseEnter.emit($event)\"\n  (tagMouseLeave)=\"tagMouseLeave.emit($event)\"></flx-text-input-highlight>", styles: [""], components: [{ type: TextInputAutocompleteComponent, selector: "flx-text-input-autocomplete", inputs: ["textInputElement", "menuTemplate", "triggerCharacter", "searchRegexp", "closeMenuOnBlur", "selectedChoices", "getChoiceLabel"], outputs: ["menuShow", "menuHide", "choiceSelected", "choiceRemoved", "selectedChoicesChange", "search"] }, { type: TextInputHighlightComponent, selector: "flx-text-input-highlight", inputs: ["tags", "textInputElement", "textInputValue", "tagCssClass"], outputs: ["tagClick", "tagMouseEnter", "tagMouseLeave"] }] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: MentionsComponent, decorators: [{
                type: i0.Component,
                args: [{
                        selector: 'flx-mentions',
                        templateUrl: './mentions.component.html',
                        styleUrls: ['./mentions.component.scss'],
                    }]
            }], ctorParameters: function () { return []; }, propDecorators: { textInputElement: [{
                    type: i0.Input
                }], menuTemplate: [{
                    type: i0.Input
                }], triggerCharacter: [{
                    type: i0.Input
                }], searchRegexp: [{
                    type: i0.Input
                }], closeMenuOnBlur: [{
                    type: i0.Input
                }], selectedChoices: [{
                    type: i0.Input
                }], getChoiceLabel: [{
                    type: i0.Input
                }], menuShow: [{
                    type: i0.Output
                }], menuHide: [{
                    type: i0.Output
                }], choiceSelected: [{
                    type: i0.Output
                }], choiceRemoved: [{
                    type: i0.Output
                }], selectedChoicesChange: [{
                    type: i0.Output
                }], search: [{
                    type: i0.Output
                }], tagCssClass: [{
                    type: i0.Input
                }], tagClick: [{
                    type: i0.Output
                }], tagMouseEnter: [{
                    type: i0.Output
                }], tagMouseLeave: [{
                    type: i0.Output
                }] } });

    var TextInputAutocompleteMenuComponent = /** @class */ (function () {
        function TextInputAutocompleteMenuComponent(elementRef) {
            this.elementRef = elementRef;
            this.selectChoice = new rxjs.Subject();
            this.choiceLoading = false;
            this.trackById = function (index, choice) { return (typeof choice.id !== 'undefined' ? choice.id : choice); };
        }
        Object.defineProperty(TextInputAutocompleteMenuComponent.prototype, "choices", {
            get: function () {
                return this._choices;
            },
            set: function (choices) {
                this._choices = choices;
                if (choices.indexOf(this.activeChoice) === -1 && choices.length > 0) {
                    this.activeChoice = choices[0];
                }
            },
            enumerable: false,
            configurable: true
        });
        TextInputAutocompleteMenuComponent.prototype.onArrowDown = function (event) {
            event.preventDefault();
            var index = this.choices.indexOf(this.activeChoice);
            if (this.choices[index + 1]) {
                this.scrollToChoice(index + 1);
            }
        };
        TextInputAutocompleteMenuComponent.prototype.onArrowUp = function (event) {
            event.preventDefault();
            var index = this.choices.indexOf(this.activeChoice);
            if (this.choices[index - 1]) {
                this.scrollToChoice(index - 1);
            }
        };
        TextInputAutocompleteMenuComponent.prototype.onEnter = function (event) {
            if (this.choices.indexOf(this.activeChoice) > -1) {
                event.preventDefault();
                this.selectChoice.next(this.activeChoice);
            }
        };
        TextInputAutocompleteMenuComponent.prototype.scrollToChoice = function (index) {
            this.activeChoice = this._choices[index];
            if (this.dropdownMenuElement) {
                var ulPosition = this.dropdownMenuElement.nativeElement.getBoundingClientRect();
                var li = this.dropdownMenuElement.nativeElement.children[index];
                var liPosition = li.getBoundingClientRect();
                if (liPosition.top < ulPosition.top || liPosition.bottom > ulPosition.bottom) {
                    li.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                    });
                }
            }
        };
        return TextInputAutocompleteMenuComponent;
    }());
    TextInputAutocompleteMenuComponent.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: TextInputAutocompleteMenuComponent, deps: [{ token: i0__namespace.ElementRef }], target: i0__namespace.ɵɵFactoryTarget.Component });
    TextInputAutocompleteMenuComponent.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.1.5", type: TextInputAutocompleteMenuComponent, selector: "flx-text-input-autocomplete-menu", host: { listeners: { "document:keydown.ArrowDown": "onArrowDown($event)", "document:keydown.ArrowUp": "onArrowUp($event)", "document:keydown.Enter": "onEnter($event)" } }, viewQueries: [{ propertyName: "dropdownMenuElement", first: true, predicate: ["dropdownMenu"], descendants: true }], ngImport: i0__namespace, template: "\n    <ul\n      *ngIf=\"choices?.length\"\n      #dropdownMenu\n      class=\"dropdown-menu\"\n      [style.top.px]=\"position?.top\"\n      [style.left.px]=\"position?.left\"\n    >\n      <li *ngFor=\"let choice of choices; trackBy: trackById\" [class.active]=\"activeChoice === choice\">\n        <a href=\"javascript:;\" (click)=\"selectChoice.next(choice)\">\n          {{ choice.name }}\n        </a>\n      </li>\n    </ul>\n  ", isInline: true, styles: ["\n      .dropdown-menu {\n        display: block;\n        max-height: 200px;\n        overflow-y: auto;\n      }\n    "], directives: [{ type: i1__namespace.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i1__namespace.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: TextInputAutocompleteMenuComponent, decorators: [{
                type: i0.Component,
                args: [{
                        selector: 'flx-text-input-autocomplete-menu',
                        template: "\n    <ul\n      *ngIf=\"choices?.length\"\n      #dropdownMenu\n      class=\"dropdown-menu\"\n      [style.top.px]=\"position?.top\"\n      [style.left.px]=\"position?.left\"\n    >\n      <li *ngFor=\"let choice of choices; trackBy: trackById\" [class.active]=\"activeChoice === choice\">\n        <a href=\"javascript:;\" (click)=\"selectChoice.next(choice)\">\n          {{ choice.name }}\n        </a>\n      </li>\n    </ul>\n  ",
                        styles: [
                            "\n      .dropdown-menu {\n        display: block;\n        max-height: 200px;\n        overflow-y: auto;\n      }\n    ",
                        ],
                    }]
            }], ctorParameters: function () { return [{ type: i0__namespace.ElementRef }]; }, propDecorators: { dropdownMenuElement: [{
                    type: i0.ViewChild,
                    args: ['dropdownMenu', { static: false }]
                }], onArrowDown: [{
                    type: i0.HostListener,
                    args: ['document:keydown.ArrowDown', ['$event']]
                }], onArrowUp: [{
                    type: i0.HostListener,
                    args: ['document:keydown.ArrowUp', ['$event']]
                }], onEnter: [{
                    type: i0.HostListener,
                    args: ['document:keydown.Enter', ['$event']]
                }] } });

    var TextInputAutocompleteModule = /** @class */ (function () {
        function TextInputAutocompleteModule() {
        }
        return TextInputAutocompleteModule;
    }());
    TextInputAutocompleteModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: TextInputAutocompleteModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    TextInputAutocompleteModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: TextInputAutocompleteModule, declarations: [TextInputAutocompleteComponent,
            TextInputAutocompleteMenuComponent], imports: [i1.CommonModule], exports: [TextInputAutocompleteComponent,
            TextInputAutocompleteMenuComponent] });
    TextInputAutocompleteModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: TextInputAutocompleteModule, imports: [[i1.CommonModule]] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: TextInputAutocompleteModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        declarations: [
                            TextInputAutocompleteComponent,
                            TextInputAutocompleteMenuComponent
                        ],
                        imports: [i1.CommonModule],
                        exports: [
                            TextInputAutocompleteComponent,
                            TextInputAutocompleteMenuComponent
                        ],
                        entryComponents: [TextInputAutocompleteMenuComponent]
                    }]
            }] });

    var TextInputHighlightModule = /** @class */ (function () {
        function TextInputHighlightModule() {
        }
        return TextInputHighlightModule;
    }());
    TextInputHighlightModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: TextInputHighlightModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    TextInputHighlightModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: TextInputHighlightModule, declarations: [TextInputHighlightComponent], imports: [i1.CommonModule], exports: [TextInputHighlightComponent] });
    TextInputHighlightModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: TextInputHighlightModule, imports: [[i1.CommonModule]] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: TextInputHighlightModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        declarations: [
                            TextInputHighlightComponent,
                        ],
                        imports: [i1.CommonModule],
                        exports: [
                            TextInputHighlightComponent,
                        ]
                    }]
            }] });

    var MentionsModule = /** @class */ (function () {
        function MentionsModule() {
        }
        return MentionsModule;
    }());
    MentionsModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: MentionsModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    MentionsModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: MentionsModule, declarations: [MentionsComponent], imports: [TextInputAutocompleteModule, TextInputHighlightModule], exports: [MentionsComponent,
            TextInputAutocompleteModule,
            TextInputHighlightModule] });
    MentionsModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: MentionsModule, imports: [[TextInputAutocompleteModule, TextInputHighlightModule], TextInputAutocompleteModule,
            TextInputHighlightModule] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0__namespace, type: MentionsModule, decorators: [{
                type: i0.NgModule,
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

    exports.MentionsComponent = MentionsComponent;
    exports.MentionsModule = MentionsModule;
    exports.TextInputAutocompleteComponent = TextInputAutocompleteComponent;
    exports.TextInputAutocompleteMenuComponent = TextInputAutocompleteMenuComponent;
    exports.TextInputAutocompleteModule = TextInputAutocompleteModule;
    exports.TextInputHighlightComponent = TextInputHighlightComponent;
    exports.TextInputHighlightModule = TextInputHighlightModule;
    exports.findStringIndex = findStringIndex;
    exports.getChoiceIndex = getChoiceIndex;
    exports.precedingCharValid = precedingCharValid;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=mentions.umd.js.map
