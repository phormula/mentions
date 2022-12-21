import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextInputAutocompleteComponent } from './text-input-autocomplete.component';
import { TextInputAutocompleteMenuComponent } from './text-input-autocomplete-menu.component';
import * as i0 from "@angular/core";
export class TextInputAutocompleteModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1pbnB1dC1hdXRvY29tcGxldGUubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbWVudGlvbnMvc3JjL2xpYi90ZXh0LWlucHV0LWF1dG9jb21wbGV0ZS90ZXh0LWlucHV0LWF1dG9jb21wbGV0ZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFL0MsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDckYsT0FBTyxFQUFFLGtDQUFrQyxFQUFFLE1BQU0sMENBQTBDLENBQUM7O0FBYzlGLE1BQU0sT0FBTywyQkFBMkI7OzJJQUEzQiwyQkFBMkI7NElBQTNCLDJCQUEyQixpQkFWcEMsOEJBQThCO1FBQzlCLGtDQUFrQyxhQUUxQixZQUFZLGFBRXBCLDhCQUE4QjtRQUM5QixrQ0FBa0M7NElBSXpCLDJCQUEyQixZQVA1QixZQUFZOzJGQU9YLDJCQUEyQjtrQkFadkMsUUFBUTttQkFBQztvQkFDUixZQUFZLEVBQUU7d0JBQ1osOEJBQThCO3dCQUM5QixrQ0FBa0M7cUJBQ25DO29CQUNELE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQztvQkFDdkIsT0FBTyxFQUFFO3dCQUNQLDhCQUE4Qjt3QkFDOUIsa0NBQWtDO3FCQUNuQztvQkFDRCxlQUFlLEVBQUUsQ0FBQyxrQ0FBa0MsQ0FBQztpQkFDdEQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuaW1wb3J0IHsgVGV4dElucHV0QXV0b2NvbXBsZXRlQ29tcG9uZW50IH0gZnJvbSAnLi90ZXh0LWlucHV0LWF1dG9jb21wbGV0ZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgVGV4dElucHV0QXV0b2NvbXBsZXRlTWVudUNvbXBvbmVudCB9IGZyb20gJy4vdGV4dC1pbnB1dC1hdXRvY29tcGxldGUtbWVudS5jb21wb25lbnQnO1xuXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBUZXh0SW5wdXRBdXRvY29tcGxldGVDb21wb25lbnQsXG4gICAgVGV4dElucHV0QXV0b2NvbXBsZXRlTWVudUNvbXBvbmVudFxuICBdLFxuICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlXSxcbiAgZXhwb3J0czogW1xuICAgIFRleHRJbnB1dEF1dG9jb21wbGV0ZUNvbXBvbmVudCxcbiAgICBUZXh0SW5wdXRBdXRvY29tcGxldGVNZW51Q29tcG9uZW50XG4gIF0sXG4gIGVudHJ5Q29tcG9uZW50czogW1RleHRJbnB1dEF1dG9jb21wbGV0ZU1lbnVDb21wb25lbnRdXG59KVxuZXhwb3J0IGNsYXNzIFRleHRJbnB1dEF1dG9jb21wbGV0ZU1vZHVsZSB7fVxuIl19