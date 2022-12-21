import { Component, HostListener, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
export class TextInputAutocompleteMenuComponent {
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
TextInputAutocompleteMenuComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0, type: TextInputAutocompleteMenuComponent, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
TextInputAutocompleteMenuComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.1.5", type: TextInputAutocompleteMenuComponent, selector: "flx-text-input-autocomplete-menu", host: { listeners: { "document:keydown.ArrowDown": "onArrowDown($event)", "document:keydown.ArrowUp": "onArrowUp($event)", "document:keydown.Enter": "onEnter($event)" } }, viewQueries: [{ propertyName: "dropdownMenuElement", first: true, predicate: ["dropdownMenu"], descendants: true }], ngImport: i0, template: `
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
  `, isInline: true, styles: ["\n      .dropdown-menu {\n        display: block;\n        max-height: 200px;\n        overflow-y: auto;\n      }\n    "], directives: [{ type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0, type: TextInputAutocompleteMenuComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'flx-text-input-autocomplete-menu',
                    template: `
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
  `,
                    styles: [
                        `
      .dropdown-menu {
        display: block;
        max-height: 200px;
        overflow-y: auto;
      }
    `,
                    ],
                }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1pbnB1dC1hdXRvY29tcGxldGUtbWVudS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9tZW50aW9ucy9zcmMvbGliL3RleHQtaW5wdXQtYXV0b2NvbXBsZXRlL3RleHQtaW5wdXQtYXV0b2NvbXBsZXRlLW1lbnUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQWMsWUFBWSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMvRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7QUE2Qi9CLE1BQU0sT0FBTyxrQ0FBa0M7SUFVN0MsWUFBbUIsVUFBc0I7UUFBdEIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQVB6QyxpQkFBWSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFJN0Isa0JBQWEsR0FBRyxLQUFLLENBQUM7UUFLdEIsY0FBUyxHQUFHLENBQUMsS0FBYSxFQUFFLE1BQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxFQUFFLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUZ4RCxDQUFDO0lBSTdDLElBQUksT0FBTyxDQUFDLE9BQWM7UUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuRSxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQztJQUNILENBQUM7SUFFRCxJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUdELFdBQVcsQ0FBQyxLQUFvQjtRQUM5QixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDM0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDaEM7SUFDSCxDQUFDO0lBR0QsU0FBUyxDQUFDLEtBQW9CO1FBQzVCLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdEQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRTtZQUMzQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNoQztJQUNILENBQUM7SUFHRCxPQUFPLENBQUMsS0FBb0I7UUFDMUIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDaEQsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUMzQztJQUNILENBQUM7SUFFTyxjQUFjLENBQUMsS0FBYTtRQUNsQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFekMsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDNUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ2xGLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBRTlDLElBQUksVUFBVSxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRTtnQkFDNUUsRUFBRSxDQUFDLGNBQWMsQ0FBQztvQkFDaEIsUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLEtBQUssRUFBRSxTQUFTO2lCQUNqQixDQUFDLENBQUM7YUFDSjtTQUNGO0lBQ0gsQ0FBQzs7K0hBbEVVLGtDQUFrQzttSEFBbEMsa0NBQWtDLHlXQXpCbkM7Ozs7Ozs7Ozs7Ozs7O0dBY1Q7MkZBV1Usa0NBQWtDO2tCQTNCOUMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsa0NBQWtDO29CQUM1QyxRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7O0dBY1Q7b0JBQ0QsTUFBTSxFQUFFO3dCQUNOOzs7Ozs7S0FNQztxQkFDRjtpQkFDRjtpR0FFK0MsbUJBQW1CO3NCQUFoRSxTQUFTO3VCQUFDLGNBQWMsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7Z0JBeUI1QyxXQUFXO3NCQURWLFlBQVk7dUJBQUMsNEJBQTRCLEVBQUUsQ0FBQyxRQUFRLENBQUM7Z0JBVXRELFNBQVM7c0JBRFIsWUFBWTt1QkFBQywwQkFBMEIsRUFBRSxDQUFDLFFBQVEsQ0FBQztnQkFVcEQsT0FBTztzQkFETixZQUFZO3VCQUFDLHdCQUF3QixFQUFFLENBQUMsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBIb3N0TGlzdGVuZXIsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdmbHgtdGV4dC1pbnB1dC1hdXRvY29tcGxldGUtbWVudScsXG4gIHRlbXBsYXRlOiBgXG4gICAgPHVsXG4gICAgICAqbmdJZj1cImNob2ljZXM/Lmxlbmd0aFwiXG4gICAgICAjZHJvcGRvd25NZW51XG4gICAgICBjbGFzcz1cImRyb3Bkb3duLW1lbnVcIlxuICAgICAgW3N0eWxlLnRvcC5weF09XCJwb3NpdGlvbj8udG9wXCJcbiAgICAgIFtzdHlsZS5sZWZ0LnB4XT1cInBvc2l0aW9uPy5sZWZ0XCJcbiAgICA+XG4gICAgICA8bGkgKm5nRm9yPVwibGV0IGNob2ljZSBvZiBjaG9pY2VzOyB0cmFja0J5OiB0cmFja0J5SWRcIiBbY2xhc3MuYWN0aXZlXT1cImFjdGl2ZUNob2ljZSA9PT0gY2hvaWNlXCI+XG4gICAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiAoY2xpY2spPVwic2VsZWN0Q2hvaWNlLm5leHQoY2hvaWNlKVwiPlxuICAgICAgICAgIHt7IGNob2ljZS5uYW1lIH19XG4gICAgICAgIDwvYT5cbiAgICAgIDwvbGk+XG4gICAgPC91bD5cbiAgYCxcbiAgc3R5bGVzOiBbXG4gICAgYFxuICAgICAgLmRyb3Bkb3duLW1lbnUge1xuICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgbWF4LWhlaWdodDogMjAwcHg7XG4gICAgICAgIG92ZXJmbG93LXk6IGF1dG87XG4gICAgICB9XG4gICAgYCxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgVGV4dElucHV0QXV0b2NvbXBsZXRlTWVudUNvbXBvbmVudCB7XG4gIEBWaWV3Q2hpbGQoJ2Ryb3Bkb3duTWVudScsIHsgc3RhdGljOiBmYWxzZSB9KSBkcm9wZG93bk1lbnVFbGVtZW50OiBFbGVtZW50UmVmPEhUTUxVTGlzdEVsZW1lbnQ+O1xuICBwb3NpdGlvbjogeyB0b3A6IG51bWJlcjsgbGVmdDogbnVtYmVyIH07XG4gIHNlbGVjdENob2ljZSA9IG5ldyBTdWJqZWN0KCk7XG4gIGFjdGl2ZUNob2ljZTogYW55O1xuICBzZWFyY2hUZXh0OiBzdHJpbmc7XG4gIGNob2ljZUxvYWRFcnJvcjogYW55O1xuICBjaG9pY2VMb2FkaW5nID0gZmFsc2U7XG4gIHByaXZhdGUgX2Nob2ljZXM6IGFueVtdO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7fVxuXG4gIHRyYWNrQnlJZCA9IChpbmRleDogbnVtYmVyLCBjaG9pY2U6IGFueSkgPT4gKHR5cGVvZiBjaG9pY2UuaWQgIT09ICd1bmRlZmluZWQnID8gY2hvaWNlLmlkIDogY2hvaWNlKTtcblxuICBzZXQgY2hvaWNlcyhjaG9pY2VzOiBhbnlbXSkge1xuICAgIHRoaXMuX2Nob2ljZXMgPSBjaG9pY2VzO1xuICAgIGlmIChjaG9pY2VzLmluZGV4T2YodGhpcy5hY3RpdmVDaG9pY2UpID09PSAtMSAmJiBjaG9pY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuYWN0aXZlQ2hvaWNlID0gY2hvaWNlc1swXTtcbiAgICB9XG4gIH1cblxuICBnZXQgY2hvaWNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fY2hvaWNlcztcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OmtleWRvd24uQXJyb3dEb3duJywgWyckZXZlbnQnXSlcbiAgb25BcnJvd0Rvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5jaG9pY2VzLmluZGV4T2YodGhpcy5hY3RpdmVDaG9pY2UpO1xuICAgIGlmICh0aGlzLmNob2ljZXNbaW5kZXggKyAxXSkge1xuICAgICAgdGhpcy5zY3JvbGxUb0Nob2ljZShpbmRleCArIDEpO1xuICAgIH1cbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OmtleWRvd24uQXJyb3dVcCcsIFsnJGV2ZW50J10pXG4gIG9uQXJyb3dVcChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmNob2ljZXMuaW5kZXhPZih0aGlzLmFjdGl2ZUNob2ljZSk7XG4gICAgaWYgKHRoaXMuY2hvaWNlc1tpbmRleCAtIDFdKSB7XG4gICAgICB0aGlzLnNjcm9sbFRvQ2hvaWNlKGluZGV4IC0gMSk7XG4gICAgfVxuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6a2V5ZG93bi5FbnRlcicsIFsnJGV2ZW50J10pXG4gIG9uRW50ZXIoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAodGhpcy5jaG9pY2VzLmluZGV4T2YodGhpcy5hY3RpdmVDaG9pY2UpID4gLTEpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0aGlzLnNlbGVjdENob2ljZS5uZXh0KHRoaXMuYWN0aXZlQ2hvaWNlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNjcm9sbFRvQ2hvaWNlKGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmFjdGl2ZUNob2ljZSA9IHRoaXMuX2Nob2ljZXNbaW5kZXhdO1xuXG4gICAgaWYgKHRoaXMuZHJvcGRvd25NZW51RWxlbWVudCkge1xuICAgICAgY29uc3QgdWxQb3NpdGlvbiA9IHRoaXMuZHJvcGRvd25NZW51RWxlbWVudC5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgY29uc3QgbGkgPSB0aGlzLmRyb3Bkb3duTWVudUVsZW1lbnQubmF0aXZlRWxlbWVudC5jaGlsZHJlbltpbmRleF07XG4gICAgICBjb25zdCBsaVBvc2l0aW9uID0gbGkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgIGlmIChsaVBvc2l0aW9uLnRvcCA8IHVsUG9zaXRpb24udG9wIHx8IGxpUG9zaXRpb24uYm90dG9tID4gdWxQb3NpdGlvbi5ib3R0b20pIHtcbiAgICAgICAgbGkuc2Nyb2xsSW50b1ZpZXcoe1xuICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJyxcbiAgICAgICAgICBibG9jazogJ25lYXJlc3QnLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==