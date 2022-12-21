import { ChangeDetectorRef, EventEmitter, NgZone, OnChanges, OnDestroy, Renderer2, SimpleChanges } from '@angular/core';
import { HighlightTag } from './highlight-tag.interface';
import * as i0 from "@angular/core";
export interface TagMouseEvent {
    tag: HighlightTag;
    target: HTMLElement;
    event: MouseEvent;
}
export declare class TextInputHighlightComponent implements OnChanges, OnDestroy {
    private renderer;
    private ngZone;
    private cdr;
    /**
     * An array of indices of the textarea value to highlight.
     */
    tags: HighlightTag[];
    /**
     * The textarea to highlight.
     */
    textInputElement: HTMLTextAreaElement;
    /**
     * The textarea value, in not provided will fall back to trying to grab it automatically from the textarea.
     */
    textInputValue: string;
    /**
     * The CSS class to add to highlighted tags.
     */
    tagCssClass: string;
    /**
     * Called when the area over a tag is clicked.
     */
    tagClick: EventEmitter<TagMouseEvent>;
    /**
     * Called when the area over a tag is moused over.
     */
    tagMouseEnter: EventEmitter<TagMouseEvent>;
    /**
     * Called when the area over the tag has the mouse removed from it.
     */
    tagMouseLeave: EventEmitter<TagMouseEvent>;
    private highlightElement;
    highlightElementContainerStyle: {
        [key: string]: string;
    };
    highlightedText: string;
    private textareaEventListeners;
    private highlightTagElements;
    private hoveredTag;
    private isDestroyed;
    constructor(renderer: Renderer2, ngZone: NgZone, cdr: ChangeDetectorRef);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    ngOnDestroy(): void;
    onWindowResize(): void;
    /**
     * Manually call this function to refresh the highlight element if the textarea styles have changed
     */
    refresh(): void;
    private textInputElementChanged;
    private addTags;
    private handleTextareaMouseEvent;
    private onMouseEnter;
    private onMouseLeave;
    static ɵfac: i0.ɵɵFactoryDeclaration<TextInputHighlightComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TextInputHighlightComponent, "flx-text-input-highlight", never, { "tags": "tags"; "textInputElement": "textInputElement"; "textInputValue": "textInputValue"; "tagCssClass": "tagCssClass"; }, { "tagClick": "tagClick"; "tagMouseEnter": "tagMouseEnter"; "tagMouseLeave": "tagMouseLeave"; }, never, never, false, never>;
}
