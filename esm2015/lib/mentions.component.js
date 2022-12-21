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
MentionsComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0, type: MentionsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MentionsComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.1.5", type: MentionsComponent, selector: "flx-mentions", inputs: { textInputElement: "textInputElement", menuTemplate: "menuTemplate", triggerCharacter: "triggerCharacter", searchRegexp: "searchRegexp", closeMenuOnBlur: "closeMenuOnBlur", selectedChoices: "selectedChoices", getChoiceLabel: "getChoiceLabel", tagCssClass: "tagCssClass" }, outputs: { menuShow: "menuShow", menuHide: "menuHide", choiceSelected: "choiceSelected", choiceRemoved: "choiceRemoved", selectedChoicesChange: "selectedChoicesChange", search: "search", tagClick: "tagClick", tagMouseEnter: "tagMouseEnter", tagMouseLeave: "tagMouseLeave" }, ngImport: i0, template: "<flx-text-input-autocomplete [textInputElement]=\"textInputElement\" [menuTemplate]=\"menuTemplate\"\n  [triggerCharacter]=\"triggerCharacter\" [searchRegexp]=\"searchRegexp\" [closeMenuOnBlur]=\"closeMenuOnBlur\"\n  [getChoiceLabel]=\"getChoiceLabel\" [selectedChoices]=\"selectedChoices\" (search)=\"search.emit($event)\"\n  (choiceSelected)=\"choiceSelected.emit($event)\" (choiceRemoved)=\"choiceRemoved.emit($event)\"\n  (selectedChoicesChange)=\"onSelectedChoicesChange($event)\" (menuShow)=\"menuShow.emit()\"\n  (menuHide)=\"menuHide.emit()\"></flx-text-input-autocomplete>\n\n<flx-text-input-highlight [textInputElement]=\"textInputElement\" [tags]=\"selectedCwis\" [tagCssClass]=\"tagCssClass\"\n  (tagClick)=\"tagClick.emit($event)\" (tagMouseEnter)=\"tagMouseEnter.emit($event)\"\n  (tagMouseLeave)=\"tagMouseLeave.emit($event)\"></flx-text-input-highlight>", styles: [""], components: [{ type: i1.TextInputAutocompleteComponent, selector: "flx-text-input-autocomplete", inputs: ["textInputElement", "menuTemplate", "triggerCharacter", "searchRegexp", "closeMenuOnBlur", "selectedChoices", "getChoiceLabel"], outputs: ["menuShow", "menuHide", "choiceSelected", "choiceRemoved", "selectedChoicesChange", "search"] }, { type: i2.TextInputHighlightComponent, selector: "flx-text-input-highlight", inputs: ["tags", "textInputElement", "textInputValue", "tagCssClass"], outputs: ["tagClick", "tagMouseEnter", "tagMouseLeave"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0, type: MentionsComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'flx-mentions',
                    templateUrl: './mentions.component.html',
                    styleUrls: ['./mentions.component.scss'],
                }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudGlvbnMuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbWVudGlvbnMvc3JjL2xpYi9tZW50aW9ucy5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi9wcm9qZWN0cy9tZW50aW9ucy9zcmMvbGliL21lbnRpb25zLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsWUFBWSxFQUNaLEtBQUssRUFFTCxNQUFNLEdBRVAsTUFBTSxlQUFlLENBQUM7Ozs7QUFVdkIsTUFBTSxPQUFPLGlCQUFpQjtJQTZGNUI7UUFoRkE7O1dBRUc7UUFDTSxxQkFBZ0IsR0FBRyxHQUFHLENBQUM7UUFFaEM7O1dBRUc7UUFDTSxpQkFBWSxHQUFHLE9BQU8sQ0FBQztRQUVoQzs7V0FFRztRQUNNLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBRWpDOztXQUVHO1FBQ00sb0JBQWUsR0FBVSxFQUFFLENBQUM7UUFTckM7O1dBRUc7UUFDTyxhQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUV4Qzs7V0FFRztRQUNPLGFBQVEsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBRXhDOztXQUVHO1FBQ08sbUJBQWMsR0FBRyxJQUFJLFlBQVksRUFBcUIsQ0FBQztRQUVqRTs7V0FFRztRQUNPLGtCQUFhLEdBQUcsSUFBSSxZQUFZLEVBQXFCLENBQUM7UUFFaEU7O1dBRUc7UUFDTywwQkFBcUIsR0FBRyxJQUFJLFlBQVksRUFBdUIsQ0FBQztRQUUxRTs7V0FFRztRQUNPLFdBQU0sR0FBRyxJQUFJLFlBQVksRUFBVSxDQUFDO1FBRTlDLHdEQUF3RDtRQUN4RDs7V0FFRztRQUNNLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBRWxDOztXQUVHO1FBQ08sYUFBUSxHQUFHLElBQUksWUFBWSxFQUFpQixDQUFDO1FBRXZEOztXQUVHO1FBQ08sa0JBQWEsR0FBRyxJQUFJLFlBQVksRUFBaUIsQ0FBQztRQUU1RDs7V0FFRztRQUNPLGtCQUFhLEdBQUcsSUFBSSxZQUFZLEVBQWlCLENBQUM7UUFFNUQsaUJBQVksR0FBd0IsRUFBRSxDQUFDO0lBRXhCLENBQUM7SUFFaEIsUUFBUSxLQUFVLENBQUM7SUFFbkIsdUJBQXVCLENBQUMsSUFBeUI7UUFDL0MsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDOzs4R0FwR1UsaUJBQWlCO2tHQUFqQixpQkFBaUIsaW1CQ2pCOUIsdTJCQVMwRTsyRkRRN0QsaUJBQWlCO2tCQUw3QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxjQUFjO29CQUN4QixXQUFXLEVBQUUsMkJBQTJCO29CQUN4QyxTQUFTLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQztpQkFDekM7MEVBTUMsZ0JBQWdCO3NCQURmLEtBQUs7Z0JBT04sWUFBWTtzQkFEWCxLQUFLO2dCQU1HLGdCQUFnQjtzQkFBeEIsS0FBSztnQkFLRyxZQUFZO3NCQUFwQixLQUFLO2dCQUtHLGVBQWU7c0JBQXZCLEtBQUs7Z0JBS0csZUFBZTtzQkFBdkIsS0FBSztnQkFPTixjQUFjO3NCQURiLEtBQUs7Z0JBTUksUUFBUTtzQkFBakIsTUFBTTtnQkFLRyxRQUFRO3NCQUFqQixNQUFNO2dCQUtHLGNBQWM7c0JBQXZCLE1BQU07Z0JBS0csYUFBYTtzQkFBdEIsTUFBTTtnQkFLRyxxQkFBcUI7c0JBQTlCLE1BQU07Z0JBS0csTUFBTTtzQkFBZixNQUFNO2dCQU1FLFdBQVc7c0JBQW5CLEtBQUs7Z0JBS0ksUUFBUTtzQkFBakIsTUFBTTtnQkFLRyxhQUFhO3NCQUF0QixNQUFNO2dCQUtHLGFBQWE7c0JBQXRCLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBUZW1wbGF0ZVJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IENob2ljZVdpdGhJbmRpY2VzIH0gZnJvbSAnLi90ZXh0LWlucHV0LWF1dG9jb21wbGV0ZSc7XG5pbXBvcnQgeyBUYWdNb3VzZUV2ZW50IH0gZnJvbSAnLi90ZXh0LWlucHV0LWhpZ2hsaWdodCc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2ZseC1tZW50aW9ucycsXG4gIHRlbXBsYXRlVXJsOiAnLi9tZW50aW9ucy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL21lbnRpb25zLmNvbXBvbmVudC5zY3NzJ10sXG59KVxuZXhwb3J0IGNsYXNzIE1lbnRpb25zQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgdGV4dCBpbnB1dCBlbGVtZW50XG4gICAqL1xuICBASW5wdXQoKVxuICB0ZXh0SW5wdXRFbGVtZW50OiBIVE1MVGV4dEFyZWFFbGVtZW50IHwgSFRNTElucHV0RWxlbWVudDtcblxuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBtZW51IHRlbXBsYXRlXG4gICAqL1xuICBASW5wdXQoKVxuICBtZW51VGVtcGxhdGUhOiBUZW1wbGF0ZVJlZjxhbnk+O1xuXG4gIC8qKlxuICAgKiBUaGUgY2hhcmFjdGVyIHRoYXQgd2lsbCB0cmlnZ2VyIHRoZSBtZW51IHRvIGFwcGVhclxuICAgKi9cbiAgQElucHV0KCkgdHJpZ2dlckNoYXJhY3RlciA9ICdAJztcblxuICAvKipcbiAgICogVGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IHdpbGwgbWF0Y2ggdGhlIHNlYXJjaCB0ZXh0IGFmdGVyIHRoZSB0cmlnZ2VyIGNoYXJhY3RlclxuICAgKi9cbiAgQElucHV0KCkgc2VhcmNoUmVnZXhwID0gL15cXHcqJC87XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gY2xvc2UgdGhlIG1lbnUgd2hlbiB0aGUgaG9zdCB0ZXh0SW5wdXRFbGVtZW50IGxvc2VzIGZvY3VzXG4gICAqL1xuICBASW5wdXQoKSBjbG9zZU1lbnVPbkJsdXIgPSBmYWxzZTtcblxuICAvKipcbiAgICogU2VsZWN0ZWQgY2hvaWNlcyAocmVxdWlyZWQgaW4gZWRpdGluZyBtb2RlIGluIG9yZGVyIHRvIGtlZXAgdHJhY2sgb2YgY2hvaWNlcylcbiAgICovXG4gIEBJbnB1dCgpIHNlbGVjdGVkQ2hvaWNlczogYW55W10gPSBbXTtcblxuICAvKipcbiAgICogQSBmdW5jdGlvbiB0aGF0IGZvcm1hdHMgdGhlIHNlbGVjdGVkIGNob2ljZSBvbmNlIHNlbGVjdGVkLlxuICAgKiBUaGUgcmVzdWx0IChsYWJlbCkgaXMgYWxzbyB1c2VkIGFzIGEgY2hvaWNlIGlkZW50aWZpZXIgKGUuZy4gd2hlbiBlZGl0aW5nIGNob2ljZXMpXG4gICAqL1xuICBASW5wdXQoKVxuICBnZXRDaG9pY2VMYWJlbCE6IChjaG9pY2U6IGFueSkgPT4gc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgb3B0aW9ucyBtZW51IGlzIHNob3duXG4gICAqL1xuICBAT3V0cHV0KCkgbWVudVNob3cgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBvcHRpb25zIG1lbnUgaXMgaGlkZGVuXG4gICAqL1xuICBAT3V0cHV0KCkgbWVudUhpZGUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgY2hvaWNlIGlzIHNlbGVjdGVkXG4gICAqL1xuICBAT3V0cHV0KCkgY2hvaWNlU2VsZWN0ZWQgPSBuZXcgRXZlbnRFbWl0dGVyPENob2ljZVdpdGhJbmRpY2VzPigpO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIGNob2ljZSBpcyByZW1vdmVkXG4gICAqL1xuICBAT3V0cHV0KCkgY2hvaWNlUmVtb3ZlZCA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hvaWNlV2l0aEluZGljZXM+KCk7XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgY2hvaWNlIGlzIHNlbGVjdGVkLCByZW1vdmVkLCBvciBpZiBhbnkgb2YgdGhlIGNob2ljZXMnIGluZGljZXMgY2hhbmdlXG4gICAqL1xuICBAT3V0cHV0KCkgc2VsZWN0ZWRDaG9pY2VzQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxDaG9pY2VXaXRoSW5kaWNlc1tdPigpO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgb24gdXNlciBpbnB1dCBhZnRlciBlbnRlcmluZyB0cmlnZ2VyIGNoYXJhY3Rlci4gRW1pdHMgc2VhcmNoIHRlcm0gdG8gc2VhcmNoIGJ5XG4gICAqL1xuICBAT3V0cHV0KCkgc2VhcmNoID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XG5cbiAgLy8gLS0tIHRleHQtaW5wdXQtaGlnaGxpZ2h0LmNvbXBvbmVudCBpbnB1dHMvb3V0cHV0cyAtLS1cbiAgLyoqXG4gICAqIFRoZSBDU1MgY2xhc3MgdG8gYWRkIHRvIGhpZ2hsaWdodGVkIHRhZ3NcbiAgICovXG4gIEBJbnB1dCgpIHRhZ0Nzc0NsYXNzOiBzdHJpbmcgPSAnJztcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGFyZWEgb3ZlciBhIHRhZyBpcyBjbGlja2VkXG4gICAqL1xuICBAT3V0cHV0KCkgdGFnQ2xpY2sgPSBuZXcgRXZlbnRFbWl0dGVyPFRhZ01vdXNlRXZlbnQ+KCk7XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBhcmVhIG92ZXIgYSB0YWcgaXMgbW91c2VkIG92ZXJcbiAgICovXG4gIEBPdXRwdXQoKSB0YWdNb3VzZUVudGVyID0gbmV3IEV2ZW50RW1pdHRlcjxUYWdNb3VzZUV2ZW50PigpO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgYXJlYSBvdmVyIHRoZSB0YWcgaGFzIHRoZSBtb3VzZSBpcyByZW1vdmVkIGZyb20gaXRcbiAgICovXG4gIEBPdXRwdXQoKSB0YWdNb3VzZUxlYXZlID0gbmV3IEV2ZW50RW1pdHRlcjxUYWdNb3VzZUV2ZW50PigpO1xuXG4gIHNlbGVjdGVkQ3dpczogQ2hvaWNlV2l0aEluZGljZXNbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBuZ09uSW5pdCgpOiB2b2lkIHt9XG5cbiAgb25TZWxlY3RlZENob2ljZXNDaGFuZ2UoY3dpczogQ2hvaWNlV2l0aEluZGljZXNbXSk6IHZvaWQge1xuICAgIHRoaXMuc2VsZWN0ZWRDd2lzID0gY3dpcztcbiAgICB0aGlzLnNlbGVjdGVkQ2hvaWNlc0NoYW5nZS5lbWl0KGN3aXMpO1xuICB9XG59XG4iLCI8Zmx4LXRleHQtaW5wdXQtYXV0b2NvbXBsZXRlIFt0ZXh0SW5wdXRFbGVtZW50XT1cInRleHRJbnB1dEVsZW1lbnRcIiBbbWVudVRlbXBsYXRlXT1cIm1lbnVUZW1wbGF0ZVwiXG4gIFt0cmlnZ2VyQ2hhcmFjdGVyXT1cInRyaWdnZXJDaGFyYWN0ZXJcIiBbc2VhcmNoUmVnZXhwXT1cInNlYXJjaFJlZ2V4cFwiIFtjbG9zZU1lbnVPbkJsdXJdPVwiY2xvc2VNZW51T25CbHVyXCJcbiAgW2dldENob2ljZUxhYmVsXT1cImdldENob2ljZUxhYmVsXCIgW3NlbGVjdGVkQ2hvaWNlc109XCJzZWxlY3RlZENob2ljZXNcIiAoc2VhcmNoKT1cInNlYXJjaC5lbWl0KCRldmVudClcIlxuICAoY2hvaWNlU2VsZWN0ZWQpPVwiY2hvaWNlU2VsZWN0ZWQuZW1pdCgkZXZlbnQpXCIgKGNob2ljZVJlbW92ZWQpPVwiY2hvaWNlUmVtb3ZlZC5lbWl0KCRldmVudClcIlxuICAoc2VsZWN0ZWRDaG9pY2VzQ2hhbmdlKT1cIm9uU2VsZWN0ZWRDaG9pY2VzQ2hhbmdlKCRldmVudClcIiAobWVudVNob3cpPVwibWVudVNob3cuZW1pdCgpXCJcbiAgKG1lbnVIaWRlKT1cIm1lbnVIaWRlLmVtaXQoKVwiPjwvZmx4LXRleHQtaW5wdXQtYXV0b2NvbXBsZXRlPlxuXG48Zmx4LXRleHQtaW5wdXQtaGlnaGxpZ2h0IFt0ZXh0SW5wdXRFbGVtZW50XT1cInRleHRJbnB1dEVsZW1lbnRcIiBbdGFnc109XCJzZWxlY3RlZEN3aXNcIiBbdGFnQ3NzQ2xhc3NdPVwidGFnQ3NzQ2xhc3NcIlxuICAodGFnQ2xpY2spPVwidGFnQ2xpY2suZW1pdCgkZXZlbnQpXCIgKHRhZ01vdXNlRW50ZXIpPVwidGFnTW91c2VFbnRlci5lbWl0KCRldmVudClcIlxuICAodGFnTW91c2VMZWF2ZSk9XCJ0YWdNb3VzZUxlYXZlLmVtaXQoJGV2ZW50KVwiPjwvZmx4LXRleHQtaW5wdXQtaGlnaGxpZ2h0PiJdfQ==