import { Component, EventEmitter, HostListener, Input, Output, ViewChild, ViewEncapsulation, } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
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
export class TextInputHighlightComponent {
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
TextInputHighlightComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0, type: TextInputHighlightComponent, deps: [{ token: i0.Renderer2 }, { token: i0.NgZone }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
TextInputHighlightComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.1.5", type: TextInputHighlightComponent, selector: "flx-text-input-highlight", inputs: { tags: "tags", textInputElement: "textInputElement", textInputValue: "textInputValue", tagCssClass: "tagCssClass" }, outputs: { tagClick: "tagClick", tagMouseEnter: "tagMouseEnter", tagMouseLeave: "tagMouseLeave" }, host: { listeners: { "window:resize": "onWindowResize()" } }, viewQueries: [{ propertyName: "highlightElement", first: true, predicate: ["highlightElement"], descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"flx-text-highlight-element\"\n     [ngStyle]=\"highlightElementContainerStyle\"\n     [innerHtml]=\"highlightedText\"\n     #highlightElement></div>", styles: [".flx-text-highlight-element{overflow:hidden;word-break:break-word;white-space:pre-wrap;position:absolute;top:0;bottom:0;left:0;right:0;pointer-events:none;background:transparent;color:#0000;z-index:91}.flx-text-highlight-tag{padding:1px 2px;margin:-1px -2px;border-radius:6px;overflow-wrap:break-word;background-color:#e1f2fe;font-weight:bold;opacity:.6}.flx-text-highlight-tag.flx-text-highlight-tag-hovered{opacity:1;color:#a8d3fe}\n"], directives: [{ type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }], encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.1.5", ngImport: i0, type: TextInputHighlightComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'flx-text-input-highlight',
                    templateUrl: './text-input-highlight.component.html',
                    styleUrls: ['./text-input-highlight.component.scss'],
                    encapsulation: ViewEncapsulation.None,
                }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1pbnB1dC1oaWdobGlnaHQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbWVudGlvbnMvc3JjL2xpYi90ZXh0LWlucHV0LWhpZ2hsaWdodC90ZXh0LWlucHV0LWhpZ2hsaWdodC5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9tZW50aW9ucy9zcmMvbGliL3RleHQtaW5wdXQtaGlnaGxpZ2h0L3RleHQtaW5wdXQtaGlnaGxpZ2h0LmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFFTCxTQUFTLEVBRVQsWUFBWSxFQUNaLFlBQVksRUFDWixLQUFLLEVBSUwsTUFBTSxFQUdOLFNBQVMsRUFDVCxpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7OztBQUl2QixNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ3BDLFdBQVc7SUFDWCxXQUFXO0lBQ1gsT0FBTztJQUNQLFFBQVE7SUFDUixXQUFXO0lBQ1gsV0FBVztJQUVYLGdCQUFnQjtJQUNoQixrQkFBa0I7SUFDbEIsbUJBQW1CO0lBQ25CLGlCQUFpQjtJQUNqQixhQUFhO0lBRWIsWUFBWTtJQUNaLGNBQWM7SUFDZCxlQUFlO0lBQ2YsYUFBYTtJQUViLHdEQUF3RDtJQUN4RCxXQUFXO0lBQ1gsYUFBYTtJQUNiLFlBQVk7SUFDWixhQUFhO0lBQ2IsVUFBVTtJQUNWLGdCQUFnQjtJQUNoQixZQUFZO0lBQ1osWUFBWTtJQUVaLFdBQVc7SUFDWCxlQUFlO0lBQ2YsWUFBWTtJQUNaLGdCQUFnQjtJQUVoQixlQUFlO0lBQ2YsYUFBYTtJQUViLFNBQVM7SUFDVCxZQUFZO0NBQ2IsQ0FBQyxDQUFDO0FBRUgsTUFBTSxnQkFBZ0IsR0FBRyw0QkFBNEIsQ0FBQztBQUV0RCxTQUFTLGdCQUFnQixDQUFDLEtBQWEsRUFBRSxHQUFpQjtJQUN4RCxPQUFPLEdBQUcsQ0FB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QUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTyxZQUFZLENBQUMsR0FBa0IsRUFBRSxLQUFpQjtRQUN4RCxHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNsQixHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvQixDQUFDOzt3SEFwVFUsMkJBQTJCOzRHQUEzQiwyQkFBMkIsd2ZDN0Z4QyxtS0FHNkI7MkZEMEZoQiwyQkFBMkI7a0JBTnZDLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLDBCQUEwQjtvQkFDcEMsV0FBVyxFQUFFLHVDQUF1QztvQkFDcEQsU0FBUyxFQUFFLENBQUMsdUNBQXVDLENBQUM7b0JBQ3BELGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2lCQUN0QztxSkFLVSxJQUFJO3NCQUFaLEtBQUs7Z0JBS0csZ0JBQWdCO3NCQUF4QixLQUFLO2dCQUtHLGNBQWM7c0JBQXRCLEtBQUs7Z0JBS0csV0FBVztzQkFBbkIsS0FBSztnQkFLSSxRQUFRO3NCQUFqQixNQUFNO2dCQUtHLGFBQWE7c0JBQXRCLE1BQU07Z0JBS0csYUFBYTtzQkFBdEIsTUFBTTtnQkFHQyxnQkFBZ0I7c0JBRHZCLFNBQVM7dUJBQUMsa0JBQWtCLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO2dCQW9EL0MsY0FBYztzQkFEYixZQUFZO3VCQUFDLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEhvc3RMaXN0ZW5lcixcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE91dHB1dCxcbiAgUmVuZGVyZXIyLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgSGlnaGxpZ2h0VGFnIH0gZnJvbSAnLi9oaWdobGlnaHQtdGFnLmludGVyZmFjZSc7XG5cbmNvbnN0IHN0eWxlUHJvcGVydGllcyA9IE9iamVjdC5mcmVlemUoW1xuICAnZGlyZWN0aW9uJywgLy8gUlRMIHN1cHBvcnRcbiAgJ2JveFNpemluZycsXG4gICd3aWR0aCcsIC8vIG9uIENocm9tZSBhbmQgSUUsIGV4Y2x1ZGUgdGhlIHNjcm9sbGJhciwgc28gdGhlIG1pcnJvciBkaXYgd3JhcHMgZXhhY3RseSBhcyB0aGUgdGV4dGFyZWEgZG9lc1xuICAnaGVpZ2h0JyxcbiAgJ292ZXJmbG93WCcsXG4gICdvdmVyZmxvd1knLCAvLyBjb3B5IHRoZSBzY3JvbGxiYXIgZm9yIElFXG5cbiAgJ2JvcmRlclRvcFdpZHRoJyxcbiAgJ2JvcmRlclJpZ2h0V2lkdGgnLFxuICAnYm9yZGVyQm90dG9tV2lkdGgnLFxuICAnYm9yZGVyTGVmdFdpZHRoJyxcbiAgJ2JvcmRlclN0eWxlJyxcblxuICAncGFkZGluZ1RvcCcsXG4gICdwYWRkaW5nUmlnaHQnLFxuICAncGFkZGluZ0JvdHRvbScsXG4gICdwYWRkaW5nTGVmdCcsXG5cbiAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL2ZvbnRcbiAgJ2ZvbnRTdHlsZScsXG4gICdmb250VmFyaWFudCcsXG4gICdmb250V2VpZ2h0JyxcbiAgJ2ZvbnRTdHJldGNoJyxcbiAgJ2ZvbnRTaXplJyxcbiAgJ2ZvbnRTaXplQWRqdXN0JyxcbiAgJ2xpbmVIZWlnaHQnLFxuICAnZm9udEZhbWlseScsXG5cbiAgJ3RleHRBbGlnbicsXG4gICd0ZXh0VHJhbnNmb3JtJyxcbiAgJ3RleHRJbmRlbnQnLFxuICAndGV4dERlY29yYXRpb24nLCAvLyBtaWdodCBub3QgbWFrZSBhIGRpZmZlcmVuY2UsIGJ1dCBiZXR0ZXIgYmUgc2FmZVxuXG4gICdsZXR0ZXJTcGFjaW5nJyxcbiAgJ3dvcmRTcGFjaW5nJyxcblxuICAndGFiU2l6ZScsXG4gICdNb3pUYWJTaXplJyxcbl0pO1xuXG5jb25zdCB0YWdJbmRleElkUHJlZml4ID0gJ2ZseC10ZXh0LWhpZ2hsaWdodC10YWctaWQtJztcblxuZnVuY3Rpb24gaW5kZXhJc0luc2lkZVRhZyhpbmRleDogbnVtYmVyLCB0YWc6IEhpZ2hsaWdodFRhZykge1xuICByZXR1cm4gdGFnLmluZGljZXMuc3RhcnQgPCBpbmRleCAmJiBpbmRleCA8IHRhZy5pbmRpY2VzLmVuZDtcbn1cblxuZnVuY3Rpb24gb3ZlcmxhcHModGFnQTogSGlnaGxpZ2h0VGFnLCB0YWdCOiBIaWdobGlnaHRUYWcpIHtcbiAgcmV0dXJuIChcbiAgICBpbmRleElzSW5zaWRlVGFnKHRhZ0IuaW5kaWNlcy5zdGFydCwgdGFnQSkgfHxcbiAgICBpbmRleElzSW5zaWRlVGFnKHRhZ0IuaW5kaWNlcy5lbmQsIHRhZ0EpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGlzQ29vcmRpbmF0ZVdpdGhpblJlY3QocmVjdDogQ2xpZW50UmVjdCwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgcmV0dXJuIHJlY3QubGVmdCA8IHggJiYgeCA8IHJlY3QucmlnaHQgJiYgcmVjdC50b3AgPCB5ICYmIHkgPCByZWN0LmJvdHRvbTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlSHRtbChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYWdNb3VzZUV2ZW50IHtcbiAgdGFnOiBIaWdobGlnaHRUYWc7XG4gIHRhcmdldDogSFRNTEVsZW1lbnQ7XG4gIGV2ZW50OiBNb3VzZUV2ZW50O1xufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdmbHgtdGV4dC1pbnB1dC1oaWdobGlnaHQnLFxuICB0ZW1wbGF0ZVVybDogJy4vdGV4dC1pbnB1dC1oaWdobGlnaHQuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi90ZXh0LWlucHV0LWhpZ2hsaWdodC5jb21wb25lbnQuc2NzcyddLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxufSlcbmV4cG9ydCBjbGFzcyBUZXh0SW5wdXRIaWdobGlnaHRDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBpbmRpY2VzIG9mIHRoZSB0ZXh0YXJlYSB2YWx1ZSB0byBoaWdobGlnaHQuXG4gICAqL1xuICBASW5wdXQoKSB0YWdzOiBIaWdobGlnaHRUYWdbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBUaGUgdGV4dGFyZWEgdG8gaGlnaGxpZ2h0LlxuICAgKi9cbiAgQElucHV0KCkgdGV4dElucHV0RWxlbWVudDogSFRNTFRleHRBcmVhRWxlbWVudDtcblxuICAvKipcbiAgICogVGhlIHRleHRhcmVhIHZhbHVlLCBpbiBub3QgcHJvdmlkZWQgd2lsbCBmYWxsIGJhY2sgdG8gdHJ5aW5nIHRvIGdyYWIgaXQgYXV0b21hdGljYWxseSBmcm9tIHRoZSB0ZXh0YXJlYS5cbiAgICovXG4gIEBJbnB1dCgpIHRleHRJbnB1dFZhbHVlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBDU1MgY2xhc3MgdG8gYWRkIHRvIGhpZ2hsaWdodGVkIHRhZ3MuXG4gICAqL1xuICBASW5wdXQoKSB0YWdDc3NDbGFzczogc3RyaW5nID0gJyc7XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBhcmVhIG92ZXIgYSB0YWcgaXMgY2xpY2tlZC5cbiAgICovXG4gIEBPdXRwdXQoKSB0YWdDbGljayA9IG5ldyBFdmVudEVtaXR0ZXI8VGFnTW91c2VFdmVudD4oKTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGFyZWEgb3ZlciBhIHRhZyBpcyBtb3VzZWQgb3Zlci5cbiAgICovXG4gIEBPdXRwdXQoKSB0YWdNb3VzZUVudGVyID0gbmV3IEV2ZW50RW1pdHRlcjxUYWdNb3VzZUV2ZW50PigpO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgYXJlYSBvdmVyIHRoZSB0YWcgaGFzIHRoZSBtb3VzZSByZW1vdmVkIGZyb20gaXQuXG4gICAqL1xuICBAT3V0cHV0KCkgdGFnTW91c2VMZWF2ZSA9IG5ldyBFdmVudEVtaXR0ZXI8VGFnTW91c2VFdmVudD4oKTtcblxuICBAVmlld0NoaWxkKCdoaWdobGlnaHRFbGVtZW50JywgeyBzdGF0aWM6IHRydWUgfSlcbiAgcHJpdmF0ZSBoaWdobGlnaHRFbGVtZW50OiBFbGVtZW50UmVmO1xuXG4gIGhpZ2hsaWdodEVsZW1lbnRDb250YWluZXJTdHlsZTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuICBoaWdobGlnaHRlZFRleHQ6IHN0cmluZztcblxuICBwcml2YXRlIHRleHRhcmVhRXZlbnRMaXN0ZW5lcnM6IEFycmF5PCgpID0+IHZvaWQ+ID0gW107XG4gIHByaXZhdGUgaGlnaGxpZ2h0VGFnRWxlbWVudHM6IEFycmF5PHtcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICBjbGllbnRSZWN0OiBDbGllbnRSZWN0O1xuICB9PjtcbiAgcHJpdmF0ZSBob3ZlcmVkVGFnOiBUYWdNb3VzZUV2ZW50IHwgdW5kZWZpbmVkO1xuICBwcml2YXRlIGlzRGVzdHJveWVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgIHByaXZhdGUgbmdab25lOiBOZ1pvbmUsXG4gICAgcHJpdmF0ZSBjZHI6IENoYW5nZURldGVjdG9yUmVmXG4gICkge31cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgaWYgKGNoYW5nZXMudGV4dElucHV0RWxlbWVudCkge1xuICAgICAgdGhpcy50ZXh0SW5wdXRFbGVtZW50Q2hhbmdlZCgpO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VzLnRhZ3MgfHwgY2hhbmdlcy50YWdDc3NDbGFzcyB8fCBjaGFuZ2VzLnRleHRJbnB1dFZhbHVlKSB7XG4gICAgICB0aGlzLmFkZFRhZ3MoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAvLyBUT0RPOiBmbHhSZWxhdGl2ZUNvbnRhaW5lciBkaXJlY3RpdmUgKHdyYXBwaW5nIGNvbXBvbmVudCkgaW5zdGVhZD9cbiAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQhLnBhcmVudEVsZW1lbnQhLnN0eWxlWydwb3NpdGlvbiddID0gJ3JlbGF0aXZlJztcbiAgICBpZiAoXG4gICAgICBnZXRDb21wdXRlZFN0eWxlKHRoaXMudGV4dElucHV0RWxlbWVudC5wYXJlbnRFbGVtZW50IGFzIEVsZW1lbnQpXG4gICAgICAgIC5kaXNwbGF5ID09PSAnaW5saW5lJ1xuICAgICkge1xuICAgICAgLy8gSWYgdGV4dGFyZWEgaXMgZGlyZWN0IGNoaWxkIG9mIGEgY29tcG9uZW50IChubyBESVYgY29udGFpbmVyKVxuICAgICAgdGhpcy50ZXh0SW5wdXRFbGVtZW50IS5wYXJlbnRFbGVtZW50IS5zdHlsZVsnZGlzcGxheSddID0gJ2Jsb2NrJztcbiAgICB9XG5cbiAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQuc3R5bGVbJ2JhY2tncm91bmQnXSA9ICdub25lJztcbiAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQuc3R5bGVbJ3Bvc2l0aW9uJ10gPSAncmVsYXRpdmUnO1xuICAgIHRoaXMudGV4dElucHV0RWxlbWVudC5zdHlsZVsnei1pbmRleCddID0gJzInO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5pc0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgdGhpcy50ZXh0YXJlYUV2ZW50TGlzdGVuZXJzLmZvckVhY2goKHVucmVnaXN0ZXIpID0+IHVucmVnaXN0ZXIoKSk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCd3aW5kb3c6cmVzaXplJylcbiAgb25XaW5kb3dSZXNpemUoKSB7XG4gICAgdGhpcy5yZWZyZXNoKCk7XG4gIH1cblxuICAvKipcbiAgICogTWFudWFsbHkgY2FsbCB0aGlzIGZ1bmN0aW9uIHRvIHJlZnJlc2ggdGhlIGhpZ2hsaWdodCBlbGVtZW50IGlmIHRoZSB0ZXh0YXJlYSBzdHlsZXMgaGF2ZSBjaGFuZ2VkXG4gICAqL1xuICByZWZyZXNoKCkge1xuICAgIGNvbnN0IGNvbXB1dGVkOiBhbnkgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMudGV4dElucHV0RWxlbWVudCk7XG4gICAgc3R5bGVQcm9wZXJ0aWVzLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgIHRoaXMuaGlnaGxpZ2h0RWxlbWVudENvbnRhaW5lclN0eWxlW3Byb3BdID0gY29tcHV0ZWRbcHJvcF07XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHRleHRJbnB1dEVsZW1lbnRDaGFuZ2VkKCkge1xuICAgIGNvbnN0IGVsZW1lbnRUeXBlID0gdGhpcy50ZXh0SW5wdXRFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoZWxlbWVudFR5cGUgIT09ICd0ZXh0YXJlYScpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1RoZSB0ZXh0LWlucHV0LWhpZ2hsaWdodCBjb21wb25lbnQgbXVzdCBiZSBwYXNzZWQgJyArXG4gICAgICAgICAgJ2EgdGV4dGFyZWEgdG8gdGhlIGB0ZXh0SW5wdXRFbGVtZW50YCBpbnB1dC4gSW5zdGVhZCByZWNlaXZlZCBhICcgK1xuICAgICAgICAgIGVsZW1lbnRUeXBlXG4gICAgICApO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgLy8gaW4gY2FzZSB0aGUgZWxlbWVudCB3YXMgZGVzdHJveWVkIGJlZm9yZSB0aGUgdGltZW91dCBmaXJlc1xuICAgICAgaWYgKHRoaXMuaXNEZXN0cm95ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJlZnJlc2goKTtcblxuICAgICAgdGhpcy50ZXh0YXJlYUV2ZW50TGlzdGVuZXJzLmZvckVhY2goKHVucmVnaXN0ZXIpID0+IHVucmVnaXN0ZXIoKSk7XG4gICAgICB0aGlzLnRleHRhcmVhRXZlbnRMaXN0ZW5lcnMgPSBbXTtcblxuICAgICAgY29uc3Qgb25JbnB1dCA9IHRoaXMucmVuZGVyZXIubGlzdGVuKFxuICAgICAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQsXG4gICAgICAgICdpbnB1dCcsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICB0aGlzLmFkZFRhZ3MoKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIHRoaXMudGV4dGFyZWFFdmVudExpc3RlbmVycy5wdXNoKG9uSW5wdXQpO1xuXG4gICAgICBjb25zdCBvblNjcm9sbCA9IHRoaXMucmVuZGVyZXIubGlzdGVuKFxuICAgICAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQsXG4gICAgICAgICdzY3JvbGwnLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5oaWdobGlnaHRFbGVtZW50Lm5hdGl2ZUVsZW1lbnQuc2Nyb2xsVG9wID1cbiAgICAgICAgICAgIHRoaXMudGV4dElucHV0RWxlbWVudC5zY3JvbGxUb3A7XG4gICAgICAgICAgdGhpcy5oaWdobGlnaHRUYWdFbGVtZW50cyA9IHRoaXMuaGlnaGxpZ2h0VGFnRWxlbWVudHMubWFwKCh0YWcpID0+IHtcbiAgICAgICAgICAgIHRhZy5jbGllbnRSZWN0ID0gdGFnLmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICByZXR1cm4gdGFnO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICApO1xuICAgICAgdGhpcy50ZXh0YXJlYUV2ZW50TGlzdGVuZXJzLnB1c2gob25TY3JvbGwpO1xuXG4gICAgICBjb25zdCBvbk1vdXNlVXAgPSB0aGlzLnJlbmRlcmVyLmxpc3RlbihcbiAgICAgICAgdGhpcy50ZXh0SW5wdXRFbGVtZW50LFxuICAgICAgICAnbW91c2V1cCcsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIHRoaXMudGV4dGFyZWFFdmVudExpc3RlbmVycy5wdXNoKG9uTW91c2VVcCk7XG5cbiAgICAgIC8vIG9ubHkgYWRkIGV2ZW50IGxpc3RlbmVycyBpZiB0aGUgaG9zdCBjb21wb25lbnQgYWN0dWFsbHkgYXNrcyBmb3IgaXRcbiAgICAgIGlmICh0aGlzLnRhZ0NsaWNrLm9ic2VydmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IG9uQ2xpY2sgPSB0aGlzLnJlbmRlcmVyLmxpc3RlbihcbiAgICAgICAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQsXG4gICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlVGV4dGFyZWFNb3VzZUV2ZW50KGV2ZW50LCAnY2xpY2snKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMudGV4dGFyZWFFdmVudExpc3RlbmVycy5wdXNoKG9uQ2xpY2spO1xuICAgICAgfVxuXG4gICAgICAvLyBvbmx5IGFkZCBldmVudCBsaXN0ZW5lcnMgaWYgdGhlIGhvc3QgY29tcG9uZW50IGFjdHVhbGx5IGFza3MgZm9yIGl0XG4gICAgICBpZiAodGhpcy50YWdNb3VzZUVudGVyLm9ic2VydmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IG9uTW91c2VNb3ZlID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oXG4gICAgICAgICAgdGhpcy50ZXh0SW5wdXRFbGVtZW50LFxuICAgICAgICAgICdtb3VzZW1vdmUnLFxuICAgICAgICAgIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVUZXh0YXJlYU1vdXNlRXZlbnQoZXZlbnQsICdtb3VzZW1vdmUnKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMudGV4dGFyZWFFdmVudExpc3RlbmVycy5wdXNoKG9uTW91c2VNb3ZlKTtcblxuICAgICAgICBjb25zdCBvbk1vdXNlTGVhdmUgPSB0aGlzLnJlbmRlcmVyLmxpc3RlbihcbiAgICAgICAgICB0aGlzLnRleHRJbnB1dEVsZW1lbnQsXG4gICAgICAgICAgJ21vdXNlbGVhdmUnLFxuICAgICAgICAgIChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuaG92ZXJlZFRhZykge1xuICAgICAgICAgICAgICB0aGlzLm9uTW91c2VMZWF2ZSh0aGlzLmhvdmVyZWRUYWcsIGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMudGV4dGFyZWFFdmVudExpc3RlbmVycy5wdXNoKG9uTW91c2VMZWF2ZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWRkVGFncygpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRUYWdzKCkge1xuICAgIGNvbnN0IHRleHRJbnB1dFZhbHVlID1cbiAgICAgIHR5cGVvZiB0aGlzLnRleHRJbnB1dFZhbHVlICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICA/IHRoaXMudGV4dElucHV0VmFsdWVcbiAgICAgICAgOiB0aGlzLnRleHRJbnB1dEVsZW1lbnQudmFsdWU7XG5cbiAgICBjb25zdCBwcmV2VGFnczogSGlnaGxpZ2h0VGFnW10gPSBbXTtcbiAgICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcblxuICAgIFsuLi50aGlzLnRhZ3NdXG4gICAgICAuc29ydCgodGFnQSwgdGFnQikgPT4ge1xuICAgICAgICByZXR1cm4gdGFnQS5pbmRpY2VzLnN0YXJ0IC0gdGFnQi5pbmRpY2VzLnN0YXJ0O1xuICAgICAgfSlcbiAgICAgIC5mb3JFYWNoKCh0YWcpID0+IHtcbiAgICAgICAgaWYgKHRhZy5pbmRpY2VzLnN0YXJ0ID4gdGFnLmluZGljZXMuZW5kKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEhpZ2hsaWdodCB0YWcgd2l0aCBpbmRpY2VzIFske3RhZy5pbmRpY2VzLnN0YXJ0fSwgJHt0YWcuaW5kaWNlcy5lbmR9XSBjYW5ub3Qgc3RhcnQgYWZ0ZXIgaXQgZW5kcy5gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByZXZUYWdzLmZvckVhY2goKHByZXZUYWcpID0+IHtcbiAgICAgICAgICBpZiAob3ZlcmxhcHMocHJldlRhZywgdGFnKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgSGlnaGxpZ2h0IHRhZyB3aXRoIGluZGljZXMgWyR7dGFnLmluZGljZXMuc3RhcnR9LCAke3RhZy5pbmRpY2VzLmVuZH1dIG92ZXJsYXBzIHdpdGggdGFnIFske3ByZXZUYWcuaW5kaWNlcy5zdGFydH0sICR7cHJldlRhZy5pbmRpY2VzLmVuZH1dYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRPRE8gLSBpbXBsZW1lbnQgdGhpcyBhcyBhbiBuZ0ZvciBvZiBpdGVtcyB0aGF0IGlzIGdlbmVyYXRlZCBpbiB0aGUgdGVtcGxhdGUgZm9yIGEgY2xlYW5lciBzb2x1dGlvblxuXG4gICAgICAgIGNvbnN0IGV4cGVjdGVkVGFnTGVuZ3RoID0gdGFnLmluZGljZXMuZW5kIC0gdGFnLmluZGljZXMuc3RhcnQ7XG4gICAgICAgIGNvbnN0IHRhZ0NvbnRlbnRzID0gdGV4dElucHV0VmFsdWUuc2xpY2UoXG4gICAgICAgICAgdGFnLmluZGljZXMuc3RhcnQsXG4gICAgICAgICAgdGFnLmluZGljZXMuZW5kXG4gICAgICAgICk7XG4gICAgICAgIGlmICh0YWdDb250ZW50cy5sZW5ndGggPT09IGV4cGVjdGVkVGFnTGVuZ3RoKSB7XG4gICAgICAgICAgY29uc3QgcHJldmlvdXNJbmRleCA9XG4gICAgICAgICAgICBwcmV2VGFncy5sZW5ndGggPiAwID8gcHJldlRhZ3NbcHJldlRhZ3MubGVuZ3RoIC0gMV0uaW5kaWNlcy5lbmQgOiAwO1xuICAgICAgICAgIGNvbnN0IGJlZm9yZSA9IHRleHRJbnB1dFZhbHVlLnNsaWNlKHByZXZpb3VzSW5kZXgsIHRhZy5pbmRpY2VzLnN0YXJ0KTtcbiAgICAgICAgICBwYXJ0cy5wdXNoKGVzY2FwZUh0bWwoYmVmb3JlKSk7XG4gICAgICAgICAgY29uc3QgY3NzQ2xhc3MgPSB0YWcuY3NzQ2xhc3MgfHwgdGhpcy50YWdDc3NDbGFzcztcbiAgICAgICAgICBjb25zdCB0YWdJZCA9IHRhZ0luZGV4SWRQcmVmaXggKyB0aGlzLnRhZ3MuaW5kZXhPZih0YWcpO1xuICAgICAgICAgIC8vIGZseC10ZXh0LWhpZ2hsaWdodC10YWctaWQtJHtpZH0gaXMgdXNlZCBpbnN0ZWFkIG9mIGEgZGF0YSBhdHRyaWJ1dGUgdG8gcHJldmVudCBhbiBhbmd1bGFyIHNhbml0aXphdGlvbiB3YXJuaW5nXG4gICAgICAgICAgcGFydHMucHVzaChcbiAgICAgICAgICAgIGA8c3BhbiBjbGFzcz1cImZseC10ZXh0LWhpZ2hsaWdodC10YWcgJHt0YWdJZH0gJHtjc3NDbGFzc31cIj4ke2VzY2FwZUh0bWwoXG4gICAgICAgICAgICAgIHRhZ0NvbnRlbnRzXG4gICAgICAgICAgICApfTwvc3Bhbj5gXG4gICAgICAgICAgKTtcbiAgICAgICAgICBwcmV2VGFncy5wdXNoKHRhZyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIGNvbnN0IHJlbWFpbmluZ0luZGV4ID1cbiAgICAgIHByZXZUYWdzLmxlbmd0aCA+IDAgPyBwcmV2VGFnc1twcmV2VGFncy5sZW5ndGggLSAxXS5pbmRpY2VzLmVuZCA6IDA7XG4gICAgY29uc3QgcmVtYWluaW5nID0gdGV4dElucHV0VmFsdWUuc2xpY2UocmVtYWluaW5nSW5kZXgpO1xuICAgIHBhcnRzLnB1c2goZXNjYXBlSHRtbChyZW1haW5pbmcpKTtcbiAgICBwYXJ0cy5wdXNoKCcmbmJzcDsnKTtcbiAgICB0aGlzLmhpZ2hsaWdodGVkVGV4dCA9IHBhcnRzLmpvaW4oJycpO1xuICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcblxuICAgIHRoaXMuaGlnaGxpZ2h0VGFnRWxlbWVudHMgPSBBcnJheS5mcm9tKFxuICAgICAgdGhpcy5oaWdobGlnaHRFbGVtZW50Lm5hdGl2ZUVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKVxuICAgICkubWFwKChlbGVtZW50OiBhbnkpID0+IHtcbiAgICAgIHJldHVybiB7IGVsZW1lbnQsIGNsaWVudFJlY3Q6IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlVGV4dGFyZWFNb3VzZUV2ZW50KFxuICAgIGV2ZW50OiBNb3VzZUV2ZW50LFxuICAgIGV2ZW50TmFtZTogJ2NsaWNrJyB8ICdtb3VzZW1vdmUnXG4gICkge1xuICAgIGNvbnN0IG1hdGNoaW5nVGFnSW5kZXggPSB0aGlzLmhpZ2hsaWdodFRhZ0VsZW1lbnRzLmZpbmRJbmRleCgoZWxtKSA9PlxuICAgICAgaXNDb29yZGluYXRlV2l0aGluUmVjdChlbG0uY2xpZW50UmVjdCwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSlcbiAgICApO1xuXG4gICAgaWYgKG1hdGNoaW5nVGFnSW5kZXggPiAtMSkge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5oaWdobGlnaHRUYWdFbGVtZW50c1ttYXRjaGluZ1RhZ0luZGV4XS5lbGVtZW50O1xuICAgICAgY29uc3QgdGFnQ2xhc3MgPSBBcnJheS5mcm9tKHRhcmdldC5jbGFzc0xpc3QpLmZpbmQoKGNsYXNzTmFtZSkgPT5cbiAgICAgICAgY2xhc3NOYW1lLnN0YXJ0c1dpdGgodGFnSW5kZXhJZFByZWZpeClcbiAgICAgICk7XG4gICAgICBpZiAodGFnQ2xhc3MpIHtcbiAgICAgICAgY29uc3QgdGFnSWQgPSB0YWdDbGFzcy5yZXBsYWNlKHRhZ0luZGV4SWRQcmVmaXgsICcnKTtcbiAgICAgICAgY29uc3QgdGFnOiBIaWdobGlnaHRUYWcgPSB0aGlzLnRhZ3NbTnVtYmVyKHRhZ0lkKV07XG4gICAgICAgIGNvbnN0IHRhZ01vdXNlRXZlbnQgPSB7IHRhZywgdGFyZ2V0LCBldmVudCB9O1xuXG4gICAgICAgIGlmIChldmVudE5hbWUgPT09ICdjbGljaycpIHtcbiAgICAgICAgICB0aGlzLnRhZ0NsaWNrLmVtaXQodGFnTW91c2VFdmVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuaG92ZXJlZFRhZykge1xuICAgICAgICAgICAgaWYgKHRoaXMuaG92ZXJlZFRhZy50YXJnZXQgIT09IHRhZ01vdXNlRXZlbnQudGFyZ2V0KSB7XG4gICAgICAgICAgICAgIHRoaXMub25Nb3VzZUxlYXZlKHRoaXMuaG92ZXJlZFRhZywgZXZlbnQpO1xuICAgICAgICAgICAgICB0aGlzLm9uTW91c2VFbnRlcih0YWdNb3VzZUV2ZW50LCBldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub25Nb3VzZUVudGVyKHRhZ01vdXNlRXZlbnQsIGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGV2ZW50TmFtZSA9PT0gJ21vdXNlbW92ZScgJiYgdGhpcy5ob3ZlcmVkVGFnKSB7XG4gICAgICB0aGlzLm9uTW91c2VMZWF2ZSh0aGlzLmhvdmVyZWRUYWcsIGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uTW91c2VFbnRlcih0YWc6IFRhZ01vdXNlRXZlbnQsIGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGFnLmV2ZW50ID0gZXZlbnQ7XG4gICAgdGFnLnRhcmdldC5jbGFzc0xpc3QuYWRkKCdmbHgtdGV4dC1oaWdobGlnaHQtdGFnLWhvdmVyZWQnKTtcbiAgICB0aGlzLmhvdmVyZWRUYWcgPSB0YWc7XG4gICAgdGhpcy50YWdNb3VzZUVudGVyLmVtaXQodGFnKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3VzZUxlYXZlKHRhZzogVGFnTW91c2VFdmVudCwgZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0YWcuZXZlbnQgPSBldmVudDtcbiAgICB0YWcudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ2ZseC10ZXh0LWhpZ2hsaWdodC10YWctaG92ZXJlZCcpO1xuICAgIHRoaXMuaG92ZXJlZFRhZyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnRhZ01vdXNlTGVhdmUuZW1pdCh0YWcpO1xuICB9XG59XG4iLCI8ZGl2IGNsYXNzPVwiZmx4LXRleHQtaGlnaGxpZ2h0LWVsZW1lbnRcIlxuICAgICBbbmdTdHlsZV09XCJoaWdobGlnaHRFbGVtZW50Q29udGFpbmVyU3R5bGVcIlxuICAgICBbaW5uZXJIdG1sXT1cImhpZ2hsaWdodGVkVGV4dFwiXG4gICAgICNoaWdobGlnaHRFbGVtZW50PjwvZGl2PiJdfQ==