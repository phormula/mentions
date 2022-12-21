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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1pbnB1dC1hdXRvY29tcGxldGUtbWVudS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9tZW50aW9ucy9zcmMvbGliL3RleHQtaW5wdXQtYXV0b2NvbXBsZXRlL3RleHQtaW5wdXQtYXV0b2NvbXBsZXRlLW1lbnUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQWMsWUFBWSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMvRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7QUE2Qi9CLE1BQU0sT0FBTyxrQ0FBa0M7SUFVN0MsWUFBbUIsVUFBc0I7UUFBdEIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQVB6QyxpQkFBWSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFJN0Isa0JBQWEsR0FBRyxLQUFLLENBQUM7UUFLdEIsY0FBUyxHQUFHLENBQUMsS0FBYSxFQUFFLE1BQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxFQUFFLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUZ4RCxDQUFDO0lBSTdDLElBQUksT0FBTyxDQUFDLE9BQWM7UUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuRSxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQztJQUNILENBQUM7SUFFRCxJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUdELFdBQVcsQ0FBQyxLQUFvQjtRQUM5QixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDM0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDaEM7SUFDSCxDQUFDO0lBR0QsU0FBUyxDQUFDLEtBQW9CO1FBQzVCLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdEQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRTtZQUMzQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNoQztJQUNILENBQUM7SUFHRCxPQUFPLENBQUMsS0FBb0I7UUFDMUIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDaEQsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUMzQztJQUNILENBQUM7SUFFTyxjQUFjLENBQUMsS0FBYTtRQUNsQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFekMsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDNUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQ2xGLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBRTlDLElBQUksVUFBVSxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRTtnQkFDNUUsRUFBRSxDQUFDLGNBQWMsQ0FBQztvQkFDaEIsUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLEtBQUssRUFBRSxTQUFTO2lCQUNqQixDQUFDLENBQUM7YUFDSjtTQUNGO0lBQ0gsQ0FBQzs7a0pBbEVVLGtDQUFrQztzSUFBbEMsa0NBQWtDLHlXQXpCbkM7Ozs7Ozs7Ozs7Ozs7O0dBY1Q7MkZBV1Usa0NBQWtDO2tCQTNCOUMsU0FBUzsrQkFDRSxrQ0FBa0MsWUFDbEM7Ozs7Ozs7Ozs7Ozs7O0dBY1Q7aUdBWTZDLG1CQUFtQjtzQkFBaEUsU0FBUzt1QkFBQyxjQUFjLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFO2dCQXlCNUMsV0FBVztzQkFEVixZQUFZO3VCQUFDLDRCQUE0QixFQUFFLENBQUMsUUFBUSxDQUFDO2dCQVV0RCxTQUFTO3NCQURSLFlBQVk7dUJBQUMsMEJBQTBCLEVBQUUsQ0FBQyxRQUFRLENBQUM7Z0JBVXBELE9BQU87c0JBRE4sWUFBWTt1QkFBQyx3QkFBd0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSG9zdExpc3RlbmVyLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZmx4LXRleHQtaW5wdXQtYXV0b2NvbXBsZXRlLW1lbnUnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDx1bFxuICAgICAgKm5nSWY9XCJjaG9pY2VzPy5sZW5ndGhcIlxuICAgICAgI2Ryb3Bkb3duTWVudVxuICAgICAgY2xhc3M9XCJkcm9wZG93bi1tZW51XCJcbiAgICAgIFtzdHlsZS50b3AucHhdPVwicG9zaXRpb24/LnRvcFwiXG4gICAgICBbc3R5bGUubGVmdC5weF09XCJwb3NpdGlvbj8ubGVmdFwiXG4gICAgPlxuICAgICAgPGxpICpuZ0Zvcj1cImxldCBjaG9pY2Ugb2YgY2hvaWNlczsgdHJhY2tCeTogdHJhY2tCeUlkXCIgW2NsYXNzLmFjdGl2ZV09XCJhY3RpdmVDaG9pY2UgPT09IGNob2ljZVwiPlxuICAgICAgICA8YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgKGNsaWNrKT1cInNlbGVjdENob2ljZS5uZXh0KGNob2ljZSlcIj5cbiAgICAgICAgICB7eyBjaG9pY2UubmFtZSB9fVxuICAgICAgICA8L2E+XG4gICAgICA8L2xpPlxuICAgIDwvdWw+XG4gIGAsXG4gIHN0eWxlczogW1xuICAgIGBcbiAgICAgIC5kcm9wZG93bi1tZW51IHtcbiAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgIG1heC1oZWlnaHQ6IDIwMHB4O1xuICAgICAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgICAgfVxuICAgIGAsXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIFRleHRJbnB1dEF1dG9jb21wbGV0ZU1lbnVDb21wb25lbnQge1xuICBAVmlld0NoaWxkKCdkcm9wZG93bk1lbnUnLCB7IHN0YXRpYzogZmFsc2UgfSkgZHJvcGRvd25NZW51RWxlbWVudDogRWxlbWVudFJlZjxIVE1MVUxpc3RFbGVtZW50PjtcbiAgcG9zaXRpb246IHsgdG9wOiBudW1iZXI7IGxlZnQ6IG51bWJlciB9O1xuICBzZWxlY3RDaG9pY2UgPSBuZXcgU3ViamVjdCgpO1xuICBhY3RpdmVDaG9pY2U6IGFueTtcbiAgc2VhcmNoVGV4dDogc3RyaW5nO1xuICBjaG9pY2VMb2FkRXJyb3I6IGFueTtcbiAgY2hvaWNlTG9hZGluZyA9IGZhbHNlO1xuICBwcml2YXRlIF9jaG9pY2VzOiBhbnlbXTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudFJlZjogRWxlbWVudFJlZikge31cblxuICB0cmFja0J5SWQgPSAoaW5kZXg6IG51bWJlciwgY2hvaWNlOiBhbnkpID0+ICh0eXBlb2YgY2hvaWNlLmlkICE9PSAndW5kZWZpbmVkJyA/IGNob2ljZS5pZCA6IGNob2ljZSk7XG5cbiAgc2V0IGNob2ljZXMoY2hvaWNlczogYW55W10pIHtcbiAgICB0aGlzLl9jaG9pY2VzID0gY2hvaWNlcztcbiAgICBpZiAoY2hvaWNlcy5pbmRleE9mKHRoaXMuYWN0aXZlQ2hvaWNlKSA9PT0gLTEgJiYgY2hvaWNlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmFjdGl2ZUNob2ljZSA9IGNob2ljZXNbMF07XG4gICAgfVxuICB9XG5cbiAgZ2V0IGNob2ljZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Nob2ljZXM7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDprZXlkb3duLkFycm93RG93bicsIFsnJGV2ZW50J10pXG4gIG9uQXJyb3dEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuY2hvaWNlcy5pbmRleE9mKHRoaXMuYWN0aXZlQ2hvaWNlKTtcbiAgICBpZiAodGhpcy5jaG9pY2VzW2luZGV4ICsgMV0pIHtcbiAgICAgIHRoaXMuc2Nyb2xsVG9DaG9pY2UoaW5kZXggKyAxKTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDprZXlkb3duLkFycm93VXAnLCBbJyRldmVudCddKVxuICBvbkFycm93VXAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5jaG9pY2VzLmluZGV4T2YodGhpcy5hY3RpdmVDaG9pY2UpO1xuICAgIGlmICh0aGlzLmNob2ljZXNbaW5kZXggLSAxXSkge1xuICAgICAgdGhpcy5zY3JvbGxUb0Nob2ljZShpbmRleCAtIDEpO1xuICAgIH1cbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OmtleWRvd24uRW50ZXInLCBbJyRldmVudCddKVxuICBvbkVudGVyKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKHRoaXMuY2hvaWNlcy5pbmRleE9mKHRoaXMuYWN0aXZlQ2hvaWNlKSA+IC0xKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5zZWxlY3RDaG9pY2UubmV4dCh0aGlzLmFjdGl2ZUNob2ljZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzY3JvbGxUb0Nob2ljZShpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5hY3RpdmVDaG9pY2UgPSB0aGlzLl9jaG9pY2VzW2luZGV4XTtcblxuICAgIGlmICh0aGlzLmRyb3Bkb3duTWVudUVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IHVsUG9zaXRpb24gPSB0aGlzLmRyb3Bkb3duTWVudUVsZW1lbnQubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGNvbnN0IGxpID0gdGhpcy5kcm9wZG93bk1lbnVFbGVtZW50Lm5hdGl2ZUVsZW1lbnQuY2hpbGRyZW5baW5kZXhdO1xuICAgICAgY29uc3QgbGlQb3NpdGlvbiA9IGxpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICBpZiAobGlQb3NpdGlvbi50b3AgPCB1bFBvc2l0aW9uLnRvcCB8fCBsaVBvc2l0aW9uLmJvdHRvbSA+IHVsUG9zaXRpb24uYm90dG9tKSB7XG4gICAgICAgIGxpLnNjcm9sbEludG9WaWV3KHtcbiAgICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCcsXG4gICAgICAgICAgYmxvY2s6ICduZWFyZXN0JyxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=