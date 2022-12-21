import { Component, EventEmitter, Input, Output, } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./text-input-autocomplete/text-input-autocomplete.component";
import * as i2 from "./text-input-highlight/text-input-highlight.component";
export class MentionsComponent {
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
/** @nocollapse */ MentionsComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.0.4", type: MentionsComponent, selector: "flx-mentions", inputs: { textInputElement: "textInputElement", menuTemplate: "menuTemplate", triggerCharacter: "triggerCharacter", searchRegexp: "searchRegexp", closeMenuOnBlur: "closeMenuOnBlur", selectedChoices: "selectedChoices", getChoiceLabel: "getChoiceLabel", tagCssClass: "tagCssClass" }, outputs: { menuShow: "menuShow", menuHide: "menuHide", choiceSelected: "choiceSelected", choiceRemoved: "choiceRemoved", selectedChoicesChange: "selectedChoicesChange", search: "search", tagClick: "tagClick", tagMouseEnter: "tagMouseEnter", tagMouseLeave: "tagMouseLeave" }, ngImport: i0, template: "<flx-text-input-autocomplete [textInputElement]=\"textInputElement\" [menuTemplate]=\"menuTemplate\"\n  [triggerCharacter]=\"triggerCharacter\" [searchRegexp]=\"searchRegexp\" [closeMenuOnBlur]=\"closeMenuOnBlur\"\n  [getChoiceLabel]=\"getChoiceLabel\" [selectedChoices]=\"selectedChoices\" (search)=\"search.emit($event)\"\n  (choiceSelected)=\"choiceSelected.emit($event)\" (choiceRemoved)=\"choiceRemoved.emit($event)\"\n  (selectedChoicesChange)=\"onSelectedChoicesChange($event)\" (menuShow)=\"menuShow.emit()\"\n  (menuHide)=\"menuHide.emit()\"></flx-text-input-autocomplete>\n\n<flx-text-input-highlight [textInputElement]=\"textInputElement\" [tags]=\"selectedCwis\" [tagCssClass]=\"tagCssClass\"\n  (tagClick)=\"tagClick.emit($event)\" (tagMouseEnter)=\"tagMouseEnter.emit($event)\"\n  (tagMouseLeave)=\"tagMouseLeave.emit($event)\"></flx-text-input-highlight>", styles: [""], dependencies: [{ kind: "component", type: i1.TextInputAutocompleteComponent, selector: "flx-text-input-autocomplete", inputs: ["textInputElement", "menuTemplate", "triggerCharacter", "searchRegexp", "closeMenuOnBlur", "selectedChoices", "getChoiceLabel"], outputs: ["menuShow", "menuHide", "choiceSelected", "choiceRemoved", "selectedChoicesChange", "search"] }, { kind: "component", type: i2.TextInputHighlightComponent, selector: "flx-text-input-highlight", inputs: ["tags", "textInputElement", "textInputValue", "tagCssClass"], outputs: ["tagClick", "tagMouseEnter", "tagMouseLeave"] }] });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudGlvbnMuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbWVudGlvbnMvc3JjL2xpYi9tZW50aW9ucy5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi9wcm9qZWN0cy9tZW50aW9ucy9zcmMvbGliL21lbnRpb25zLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsWUFBWSxFQUNaLEtBQUssRUFFTCxNQUFNLEdBRVAsTUFBTSxlQUFlLENBQUM7Ozs7QUFVdkIsTUFBTSxPQUFPLGlCQUFpQjtJQTZGNUI7UUFoRkE7O1dBRUc7UUFDTSxxQkFBZ0IsR0FBRyxHQUFHLENBQUM7UUFFaEM7O1dBRUc7UUFDTSxpQkFBWSxHQUFHLE9BQU8sQ0FBQztRQUVoQzs7V0FFRztRQUNNLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBRWpDOztXQUVHO1FBQ00sb0JBQWUsR0FBVSxFQUFFLENBQUM7UUFTckM7O1dBRUc7UUFDTyxhQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUV4Qzs7V0FFRztRQUNPLGFBQVEsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBRXhDOztXQUVHO1FBQ08sbUJBQWMsR0FBRyxJQUFJLFlBQVksRUFBcUIsQ0FBQztRQUVqRTs7V0FFRztRQUNPLGtCQUFhLEdBQUcsSUFBSSxZQUFZLEVBQXFCLENBQUM7UUFFaEU7O1dBRUc7UUFDTywwQkFBcUIsR0FBRyxJQUFJLFlBQVksRUFBdUIsQ0FBQztRQUUxRTs7V0FFRztRQUNPLFdBQU0sR0FBRyxJQUFJLFlBQVksRUFBVSxDQUFDO1FBRTlDLHdEQUF3RDtRQUN4RDs7V0FFRztRQUNNLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBRWxDOztXQUVHO1FBQ08sYUFBUSxHQUFHLElBQUksWUFBWSxFQUFpQixDQUFDO1FBRXZEOztXQUVHO1FBQ08sa0JBQWEsR0FBRyxJQUFJLFlBQVksRUFBaUIsQ0FBQztRQUU1RDs7V0FFRztRQUNPLGtCQUFhLEdBQUcsSUFBSSxZQUFZLEVBQWlCLENBQUM7UUFFNUQsaUJBQVksR0FBd0IsRUFBRSxDQUFDO0lBRXhCLENBQUM7SUFFaEIsUUFBUSxLQUFVLENBQUM7SUFFbkIsdUJBQXVCLENBQUMsSUFBeUI7UUFDL0MsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDOztpSUFwR1UsaUJBQWlCO3FIQUFqQixpQkFBaUIsaW1CQ2pCOUIsdTJCQVMwRTsyRkRRN0QsaUJBQWlCO2tCQUw3QixTQUFTOytCQUNFLGNBQWM7MEVBU3hCLGdCQUFnQjtzQkFEZixLQUFLO2dCQU9OLFlBQVk7c0JBRFgsS0FBSztnQkFNRyxnQkFBZ0I7c0JBQXhCLEtBQUs7Z0JBS0csWUFBWTtzQkFBcEIsS0FBSztnQkFLRyxlQUFlO3NCQUF2QixLQUFLO2dCQUtHLGVBQWU7c0JBQXZCLEtBQUs7Z0JBT04sY0FBYztzQkFEYixLQUFLO2dCQU1JLFFBQVE7c0JBQWpCLE1BQU07Z0JBS0csUUFBUTtzQkFBakIsTUFBTTtnQkFLRyxjQUFjO3NCQUF2QixNQUFNO2dCQUtHLGFBQWE7c0JBQXRCLE1BQU07Z0JBS0cscUJBQXFCO3NCQUE5QixNQUFNO2dCQUtHLE1BQU07c0JBQWYsTUFBTTtnQkFNRSxXQUFXO3NCQUFuQixLQUFLO2dCQUtJLFFBQVE7c0JBQWpCLE1BQU07Z0JBS0csYUFBYTtzQkFBdEIsTUFBTTtnQkFLRyxhQUFhO3NCQUF0QixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgVGVtcGxhdGVSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBDaG9pY2VXaXRoSW5kaWNlcyB9IGZyb20gJy4vdGV4dC1pbnB1dC1hdXRvY29tcGxldGUnO1xuaW1wb3J0IHsgVGFnTW91c2VFdmVudCB9IGZyb20gJy4vdGV4dC1pbnB1dC1oaWdobGlnaHQnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdmbHgtbWVudGlvbnMnLFxuICB0ZW1wbGF0ZVVybDogJy4vbWVudGlvbnMuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9tZW50aW9ucy5jb21wb25lbnQuc2NzcyddLFxufSlcbmV4cG9ydCBjbGFzcyBNZW50aW9uc0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIHRleHQgaW5wdXQgZWxlbWVudFxuICAgKi9cbiAgQElucHV0KClcbiAgdGV4dElucHV0RWxlbWVudDogSFRNTFRleHRBcmVhRWxlbWVudCB8IEhUTUxJbnB1dEVsZW1lbnQ7XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgbWVudSB0ZW1wbGF0ZVxuICAgKi9cbiAgQElucHV0KClcbiAgbWVudVRlbXBsYXRlITogVGVtcGxhdGVSZWY8YW55PjtcblxuICAvKipcbiAgICogVGhlIGNoYXJhY3RlciB0aGF0IHdpbGwgdHJpZ2dlciB0aGUgbWVudSB0byBhcHBlYXJcbiAgICovXG4gIEBJbnB1dCgpIHRyaWdnZXJDaGFyYWN0ZXIgPSAnQCc7XG5cbiAgLyoqXG4gICAqIFRoZSByZWd1bGFyIGV4cHJlc3Npb24gdGhhdCB3aWxsIG1hdGNoIHRoZSBzZWFyY2ggdGV4dCBhZnRlciB0aGUgdHJpZ2dlciBjaGFyYWN0ZXJcbiAgICovXG4gIEBJbnB1dCgpIHNlYXJjaFJlZ2V4cCA9IC9eXFx3KiQvO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGNsb3NlIHRoZSBtZW51IHdoZW4gdGhlIGhvc3QgdGV4dElucHV0RWxlbWVudCBsb3NlcyBmb2N1c1xuICAgKi9cbiAgQElucHV0KCkgY2xvc2VNZW51T25CbHVyID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFNlbGVjdGVkIGNob2ljZXMgKHJlcXVpcmVkIGluIGVkaXRpbmcgbW9kZSBpbiBvcmRlciB0byBrZWVwIHRyYWNrIG9mIGNob2ljZXMpXG4gICAqL1xuICBASW5wdXQoKSBzZWxlY3RlZENob2ljZXM6IGFueVtdID0gW107XG5cbiAgLyoqXG4gICAqIEEgZnVuY3Rpb24gdGhhdCBmb3JtYXRzIHRoZSBzZWxlY3RlZCBjaG9pY2Ugb25jZSBzZWxlY3RlZC5cbiAgICogVGhlIHJlc3VsdCAobGFiZWwpIGlzIGFsc28gdXNlZCBhcyBhIGNob2ljZSBpZGVudGlmaWVyIChlLmcuIHdoZW4gZWRpdGluZyBjaG9pY2VzKVxuICAgKi9cbiAgQElucHV0KClcbiAgZ2V0Q2hvaWNlTGFiZWwhOiAoY2hvaWNlOiBhbnkpID0+IHN0cmluZztcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIG9wdGlvbnMgbWVudSBpcyBzaG93blxuICAgKi9cbiAgQE91dHB1dCgpIG1lbnVTaG93ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgb3B0aW9ucyBtZW51IGlzIGhpZGRlblxuICAgKi9cbiAgQE91dHB1dCgpIG1lbnVIaWRlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIGNob2ljZSBpcyBzZWxlY3RlZFxuICAgKi9cbiAgQE91dHB1dCgpIGNob2ljZVNlbGVjdGVkID0gbmV3IEV2ZW50RW1pdHRlcjxDaG9pY2VXaXRoSW5kaWNlcz4oKTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBjaG9pY2UgaXMgcmVtb3ZlZFxuICAgKi9cbiAgQE91dHB1dCgpIGNob2ljZVJlbW92ZWQgPSBuZXcgRXZlbnRFbWl0dGVyPENob2ljZVdpdGhJbmRpY2VzPigpO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIGNob2ljZSBpcyBzZWxlY3RlZCwgcmVtb3ZlZCwgb3IgaWYgYW55IG9mIHRoZSBjaG9pY2VzJyBpbmRpY2VzIGNoYW5nZVxuICAgKi9cbiAgQE91dHB1dCgpIHNlbGVjdGVkQ2hvaWNlc0NoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hvaWNlV2l0aEluZGljZXNbXT4oKTtcblxuICAvKipcbiAgICogQ2FsbGVkIG9uIHVzZXIgaW5wdXQgYWZ0ZXIgZW50ZXJpbmcgdHJpZ2dlciBjaGFyYWN0ZXIuIEVtaXRzIHNlYXJjaCB0ZXJtIHRvIHNlYXJjaCBieVxuICAgKi9cbiAgQE91dHB1dCgpIHNlYXJjaCA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nPigpO1xuXG4gIC8vIC0tLSB0ZXh0LWlucHV0LWhpZ2hsaWdodC5jb21wb25lbnQgaW5wdXRzL291dHB1dHMgLS0tXG4gIC8qKlxuICAgKiBUaGUgQ1NTIGNsYXNzIHRvIGFkZCB0byBoaWdobGlnaHRlZCB0YWdzXG4gICAqL1xuICBASW5wdXQoKSB0YWdDc3NDbGFzczogc3RyaW5nID0gJyc7XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBhcmVhIG92ZXIgYSB0YWcgaXMgY2xpY2tlZFxuICAgKi9cbiAgQE91dHB1dCgpIHRhZ0NsaWNrID0gbmV3IEV2ZW50RW1pdHRlcjxUYWdNb3VzZUV2ZW50PigpO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgYXJlYSBvdmVyIGEgdGFnIGlzIG1vdXNlZCBvdmVyXG4gICAqL1xuICBAT3V0cHV0KCkgdGFnTW91c2VFbnRlciA9IG5ldyBFdmVudEVtaXR0ZXI8VGFnTW91c2VFdmVudD4oKTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGFyZWEgb3ZlciB0aGUgdGFnIGhhcyB0aGUgbW91c2UgaXMgcmVtb3ZlZCBmcm9tIGl0XG4gICAqL1xuICBAT3V0cHV0KCkgdGFnTW91c2VMZWF2ZSA9IG5ldyBFdmVudEVtaXR0ZXI8VGFnTW91c2VFdmVudD4oKTtcblxuICBzZWxlY3RlZEN3aXM6IENob2ljZVdpdGhJbmRpY2VzW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7fVxuXG4gIG9uU2VsZWN0ZWRDaG9pY2VzQ2hhbmdlKGN3aXM6IENob2ljZVdpdGhJbmRpY2VzW10pOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkQ3dpcyA9IGN3aXM7XG4gICAgdGhpcy5zZWxlY3RlZENob2ljZXNDaGFuZ2UuZW1pdChjd2lzKTtcbiAgfVxufVxuIiwiPGZseC10ZXh0LWlucHV0LWF1dG9jb21wbGV0ZSBbdGV4dElucHV0RWxlbWVudF09XCJ0ZXh0SW5wdXRFbGVtZW50XCIgW21lbnVUZW1wbGF0ZV09XCJtZW51VGVtcGxhdGVcIlxuICBbdHJpZ2dlckNoYXJhY3Rlcl09XCJ0cmlnZ2VyQ2hhcmFjdGVyXCIgW3NlYXJjaFJlZ2V4cF09XCJzZWFyY2hSZWdleHBcIiBbY2xvc2VNZW51T25CbHVyXT1cImNsb3NlTWVudU9uQmx1clwiXG4gIFtnZXRDaG9pY2VMYWJlbF09XCJnZXRDaG9pY2VMYWJlbFwiIFtzZWxlY3RlZENob2ljZXNdPVwic2VsZWN0ZWRDaG9pY2VzXCIgKHNlYXJjaCk9XCJzZWFyY2guZW1pdCgkZXZlbnQpXCJcbiAgKGNob2ljZVNlbGVjdGVkKT1cImNob2ljZVNlbGVjdGVkLmVtaXQoJGV2ZW50KVwiIChjaG9pY2VSZW1vdmVkKT1cImNob2ljZVJlbW92ZWQuZW1pdCgkZXZlbnQpXCJcbiAgKHNlbGVjdGVkQ2hvaWNlc0NoYW5nZSk9XCJvblNlbGVjdGVkQ2hvaWNlc0NoYW5nZSgkZXZlbnQpXCIgKG1lbnVTaG93KT1cIm1lbnVTaG93LmVtaXQoKVwiXG4gIChtZW51SGlkZSk9XCJtZW51SGlkZS5lbWl0KClcIj48L2ZseC10ZXh0LWlucHV0LWF1dG9jb21wbGV0ZT5cblxuPGZseC10ZXh0LWlucHV0LWhpZ2hsaWdodCBbdGV4dElucHV0RWxlbWVudF09XCJ0ZXh0SW5wdXRFbGVtZW50XCIgW3RhZ3NdPVwic2VsZWN0ZWRDd2lzXCIgW3RhZ0Nzc0NsYXNzXT1cInRhZ0Nzc0NsYXNzXCJcbiAgKHRhZ0NsaWNrKT1cInRhZ0NsaWNrLmVtaXQoJGV2ZW50KVwiICh0YWdNb3VzZUVudGVyKT1cInRhZ01vdXNlRW50ZXIuZW1pdCgkZXZlbnQpXCJcbiAgKHRhZ01vdXNlTGVhdmUpPVwidGFnTW91c2VMZWF2ZS5lbWl0KCRldmVudClcIj48L2ZseC10ZXh0LWlucHV0LWhpZ2hsaWdodD4iXX0=