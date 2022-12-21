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
export function getCaretCoordinates(element, position, options = {}) {
    if (!isBrowser()) {
        throw new Error('textarea-caret-position#getCaretCoordinates should only be called in a browser');
    }
    let debug = (options && options.debug) || false;
    if (debug) {
        let el = document.querySelector('#input-textarea-caret-position-mirror-div');
        if (el)
            el?.parentNode?.removeChild(el);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dGFyZWEtY2FyZXQtcG9zaXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9tZW50aW9ucy9zcmMvbGliL3RleHQtaW5wdXQtYXV0b2NvbXBsZXRlL3RleHRhcmVhLWNhcmV0LXBvc2l0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBCQUEwQjtBQUUxQix1REFBdUQ7QUFDdkQsMEVBQTBFO0FBQzFFLDJFQUEyRTtBQUMzRSx1REFBdUQ7QUFDdkQsSUFBSSxVQUFVLEdBQUc7SUFDZixXQUFXO0lBQ1gsV0FBVztJQUNYLE9BQU87SUFDUCxRQUFRO0lBQ1IsV0FBVztJQUNYLFdBQVc7SUFFWCxnQkFBZ0I7SUFDaEIsa0JBQWtCO0lBQ2xCLG1CQUFtQjtJQUNuQixpQkFBaUI7SUFDakIsYUFBYTtJQUViLFlBQVk7SUFDWixjQUFjO0lBQ2QsZUFBZTtJQUNmLGFBQWE7SUFFYix3REFBd0Q7SUFDeEQsV0FBVztJQUNYLGFBQWE7SUFDYixZQUFZO0lBQ1osYUFBYTtJQUNiLFVBQVU7SUFDVixnQkFBZ0I7SUFDaEIsWUFBWTtJQUNaLFlBQVk7SUFFWixXQUFXO0lBQ1gsZUFBZTtJQUNmLFlBQVk7SUFDWixnQkFBZ0I7SUFFaEIsZUFBZTtJQUNmLGFBQWE7SUFFYixTQUFTO0lBQ1QsWUFBWTtDQUNiLENBQUM7QUFFRixTQUFTLFNBQVM7SUFDaEIsT0FBTyxPQUFPLE1BQU0sS0FBSyxXQUFXLENBQUM7QUFDdkMsQ0FBQztBQUVELFNBQVMsU0FBUztJQUNoQixPQUFPLFNBQVMsRUFBRSxJQUFLLE1BQWMsQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDO0FBQ2hFLENBQUM7QUFFRCxNQUFNLFVBQVUsbUJBQW1CLENBQ2pDLE9BQVksRUFDWixRQUF1QixFQUN2QixVQUFlLEVBQUU7SUFFakIsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFO1FBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQ2IsZ0ZBQWdGLENB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QztJQUVELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUM7QUFFRCw4RUFBOEU7QUFDOUUsMENBQTBDO0FBQzFDLDRCQUE0QjtBQUM1QiwrREFBK0Q7QUFDL0QsSUFBSSIsInNvdXJjZXNDb250ZW50IjpbIi8qIGpzaGludCBicm93c2VyOiB0cnVlICovXG5cbi8vIFdlJ2xsIGNvcHkgdGhlIHByb3BlcnRpZXMgYmVsb3cgaW50byB0aGUgbWlycm9yIGRpdi5cbi8vIE5vdGUgdGhhdCBzb21lIGJyb3dzZXJzLCBzdWNoIGFzIEZpcmVmb3gsIGRvIG5vdCBjb25jYXRlbmF0ZSBwcm9wZXJ0aWVzXG4vLyBpbnRvIHRoZWlyIHNob3J0aGFuZCAoZS5nLiBwYWRkaW5nLXRvcCwgcGFkZGluZy1ib3R0b20gZXRjLiAtPiBwYWRkaW5nKSxcbi8vIHNvIHdlIGhhdmUgdG8gbGlzdCBldmVyeSBzaW5nbGUgcHJvcGVydHkgZXhwbGljaXRseS5cbmxldCBwcm9wZXJ0aWVzID0gW1xuICAnZGlyZWN0aW9uJywgLy8gUlRMIHN1cHBvcnRcbiAgJ2JveFNpemluZycsXG4gICd3aWR0aCcsIC8vIG9uIENocm9tZSBhbmQgSUUsIGV4Y2x1ZGUgdGhlIHNjcm9sbGJhciwgc28gdGhlIG1pcnJvciBkaXYgd3JhcHMgZXhhY3RseSBhcyB0aGUgdGV4dGFyZWEgZG9lc1xuICAnaGVpZ2h0JyxcbiAgJ292ZXJmbG93WCcsXG4gICdvdmVyZmxvd1knLCAvLyBjb3B5IHRoZSBzY3JvbGxiYXIgZm9yIElFXG5cbiAgJ2JvcmRlclRvcFdpZHRoJyxcbiAgJ2JvcmRlclJpZ2h0V2lkdGgnLFxuICAnYm9yZGVyQm90dG9tV2lkdGgnLFxuICAnYm9yZGVyTGVmdFdpZHRoJyxcbiAgJ2JvcmRlclN0eWxlJyxcblxuICAncGFkZGluZ1RvcCcsXG4gICdwYWRkaW5nUmlnaHQnLFxuICAncGFkZGluZ0JvdHRvbScsXG4gICdwYWRkaW5nTGVmdCcsXG5cbiAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL2ZvbnRcbiAgJ2ZvbnRTdHlsZScsXG4gICdmb250VmFyaWFudCcsXG4gICdmb250V2VpZ2h0JyxcbiAgJ2ZvbnRTdHJldGNoJyxcbiAgJ2ZvbnRTaXplJyxcbiAgJ2ZvbnRTaXplQWRqdXN0JyxcbiAgJ2xpbmVIZWlnaHQnLFxuICAnZm9udEZhbWlseScsXG5cbiAgJ3RleHRBbGlnbicsXG4gICd0ZXh0VHJhbnNmb3JtJyxcbiAgJ3RleHRJbmRlbnQnLFxuICAndGV4dERlY29yYXRpb24nLCAvLyBtaWdodCBub3QgbWFrZSBhIGRpZmZlcmVuY2UsIGJ1dCBiZXR0ZXIgYmUgc2FmZVxuXG4gICdsZXR0ZXJTcGFjaW5nJyxcbiAgJ3dvcmRTcGFjaW5nJyxcblxuICAndGFiU2l6ZScsXG4gICdNb3pUYWJTaXplJyxcbl07XG5cbmZ1bmN0aW9uIGlzQnJvd3NlcigpIHtcbiAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnO1xufVxuXG5mdW5jdGlvbiBpc0ZpcmVmb3goKSB7XG4gIHJldHVybiBpc0Jyb3dzZXIoKSAmJiAod2luZG93IGFzIGFueSkubW96SW5uZXJTY3JlZW5YICE9IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYXJldENvb3JkaW5hdGVzKFxuICBlbGVtZW50OiBhbnksXG4gIHBvc2l0aW9uOiBudW1iZXIgfCBudWxsLFxuICBvcHRpb25zOiBhbnkgPSB7fVxuKSB7XG4gIGlmICghaXNCcm93c2VyKCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAndGV4dGFyZWEtY2FyZXQtcG9zaXRpb24jZ2V0Q2FyZXRDb29yZGluYXRlcyBzaG91bGQgb25seSBiZSBjYWxsZWQgaW4gYSBicm93c2VyJ1xuICAgICk7XG4gIH1cblxuICBsZXQgZGVidWcgPSAob3B0aW9ucyAmJiBvcHRpb25zLmRlYnVnKSB8fCBmYWxzZTtcbiAgaWYgKGRlYnVnKSB7XG4gICAgbGV0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICcjaW5wdXQtdGV4dGFyZWEtY2FyZXQtcG9zaXRpb24tbWlycm9yLWRpdidcbiAgICApO1xuICAgIGlmIChlbCkgZWw/LnBhcmVudE5vZGU/LnJlbW92ZUNoaWxkKGVsKTtcbiAgfVxuXG4gIC8vIFRoZSBtaXJyb3IgZGl2IHdpbGwgcmVwbGljYXRlIHRoZSB0ZXh0YXJlYSdzIHN0eWxlXG4gIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZGl2LmlkID0gJ2lucHV0LXRleHRhcmVhLWNhcmV0LXBvc2l0aW9uLW1pcnJvci1kaXYnO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG5cbiAgbGV0IHN0eWxlID0gZGl2LnN0eWxlO1xuICBsZXQgY29tcHV0ZWQgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZVxuICAgID8gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudClcbiAgICA6IGVsZW1lbnQuY3VycmVudFN0eWxlOyAvLyBjdXJyZW50U3R5bGUgZm9yIElFIDwgOVxuICBsZXQgaXNJbnB1dCA9IGVsZW1lbnQubm9kZU5hbWUgPT09ICdJTlBVVCc7XG5cbiAgLy8gRGVmYXVsdCB0ZXh0YXJlYSBzdHlsZXNcbiAgc3R5bGUud2hpdGVTcGFjZSA9ICdwcmUtd3JhcCc7XG4gIGlmICghaXNJbnB1dCkgc3R5bGUud29yZFdyYXAgPSAnYnJlYWstd29yZCc7IC8vIG9ubHkgZm9yIHRleHRhcmVhLXNcblxuICAvLyBQb3NpdGlvbiBvZmYtc2NyZWVuXG4gIHN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJzsgLy8gcmVxdWlyZWQgdG8gcmV0dXJuIGNvb3JkaW5hdGVzIHByb3Blcmx5XG4gIGlmICghZGVidWcpIHN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJzsgLy8gbm90ICdkaXNwbGF5OiBub25lJyBiZWNhdXNlIHdlIHdhbnQgcmVuZGVyaW5nXG5cbiAgLy8gVHJhbnNmZXIgdGhlIGVsZW1lbnQncyBwcm9wZXJ0aWVzIHRvIHRoZSBkaXZcbiAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wOiBhbnkpIHtcbiAgICBpZiAoaXNJbnB1dCAmJiBwcm9wID09PSAnbGluZUhlaWdodCcpIHtcbiAgICAgIC8vIFNwZWNpYWwgY2FzZSBmb3IgPGlucHV0PnMgYmVjYXVzZSB0ZXh0IGlzIHJlbmRlcmVkIGNlbnRlcmVkIGFuZCBsaW5lIGhlaWdodCBtYXkgYmUgIT0gaGVpZ2h0XG4gICAgICBpZiAoY29tcHV0ZWQuYm94U2l6aW5nID09PSAnYm9yZGVyLWJveCcpIHtcbiAgICAgICAgbGV0IGhlaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkLmhlaWdodCk7XG4gICAgICAgIGxldCBvdXRlckhlaWdodCA9XG4gICAgICAgICAgcGFyc2VJbnQoY29tcHV0ZWQucGFkZGluZ1RvcCkgK1xuICAgICAgICAgIHBhcnNlSW50KGNvbXB1dGVkLnBhZGRpbmdCb3R0b20pICtcbiAgICAgICAgICBwYXJzZUludChjb21wdXRlZC5ib3JkZXJUb3BXaWR0aCkgK1xuICAgICAgICAgIHBhcnNlSW50KGNvbXB1dGVkLmJvcmRlckJvdHRvbVdpZHRoKTtcbiAgICAgICAgbGV0IHRhcmdldEhlaWdodCA9IG91dGVySGVpZ2h0ICsgcGFyc2VJbnQoY29tcHV0ZWQubGluZUhlaWdodCk7XG4gICAgICAgIGlmIChoZWlnaHQgPiB0YXJnZXRIZWlnaHQpIHtcbiAgICAgICAgICBzdHlsZS5saW5lSGVpZ2h0ID0gaGVpZ2h0IC0gb3V0ZXJIZWlnaHQgKyAncHgnO1xuICAgICAgICB9IGVsc2UgaWYgKGhlaWdodCA9PT0gdGFyZ2V0SGVpZ2h0KSB7XG4gICAgICAgICAgc3R5bGUubGluZUhlaWdodCA9IGNvbXB1dGVkLmxpbmVIZWlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3R5bGUubGluZUhlaWdodCA9ICcwJztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3R5bGUubGluZUhlaWdodCA9IGNvbXB1dGVkLmhlaWdodDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGVbcHJvcF0gPSBjb21wdXRlZFtwcm9wXTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChpc0ZpcmVmb3goKSkge1xuICAgIC8vIEZpcmVmb3ggbGllcyBhYm91dCB0aGUgb3ZlcmZsb3cgcHJvcGVydHkgZm9yIHRleHRhcmVhczogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9OTg0Mjc1XG4gICAgaWYgKGVsZW1lbnQuc2Nyb2xsSGVpZ2h0ID4gcGFyc2VJbnQoY29tcHV0ZWQuaGVpZ2h0KSlcbiAgICAgIHN0eWxlLm92ZXJmbG93WSA9ICdzY3JvbGwnO1xuICB9IGVsc2Uge1xuICAgIHN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7IC8vIGZvciBDaHJvbWUgdG8gbm90IHJlbmRlciBhIHNjcm9sbGJhcjsgSUUga2VlcHMgb3ZlcmZsb3dZID0gJ3Njcm9sbCdcbiAgfVxuXG4gIGRpdi50ZXh0Q29udGVudCA9IGVsZW1lbnQudmFsdWUuc3Vic3RyaW5nKDAsIHBvc2l0aW9uKTtcbiAgLy8gVGhlIHNlY29uZCBzcGVjaWFsIGhhbmRsaW5nIGZvciBpbnB1dCB0eXBlPVwidGV4dFwiIHZzIHRleHRhcmVhOlxuICAvLyBzcGFjZXMgbmVlZCB0byBiZSByZXBsYWNlZCB3aXRoIG5vbi1icmVha2luZyBzcGFjZXMgLSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMzQwMjAzNS8xMjY5MDM3XG4gIGlmIChpc0lucHV0KSBkaXYudGV4dENvbnRlbnQgPSBkaXYudGV4dENvbnRlbnQhLnJlcGxhY2UoL1xccy9nLCAnXFx1MDBhMCcpO1xuXG4gIGxldCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAvLyBXcmFwcGluZyBtdXN0IGJlIHJlcGxpY2F0ZWQgKmV4YWN0bHkqLCBpbmNsdWRpbmcgd2hlbiBhIGxvbmcgd29yZCBnZXRzXG4gIC8vIG9udG8gdGhlIG5leHQgbGluZSwgd2l0aCB3aGl0ZXNwYWNlIGF0IHRoZSBlbmQgb2YgdGhlIGxpbmUgYmVmb3JlICgjNykuXG4gIC8vIFRoZSAgKm9ubHkqIHJlbGlhYmxlIHdheSB0byBkbyB0aGF0IGlzIHRvIGNvcHkgdGhlICplbnRpcmUqIHJlc3Qgb2YgdGhlXG4gIC8vIHRleHRhcmVhJ3MgY29udGVudCBpbnRvIHRoZSA8c3Bhbj4gY3JlYXRlZCBhdCB0aGUgY2FyZXQgcG9zaXRpb24uXG4gIC8vIEZvciBpbnB1dHMsIGp1c3QgJy4nIHdvdWxkIGJlIGVub3VnaCwgYnV0IG5vIG5lZWQgdG8gYm90aGVyLlxuICBzcGFuLnRleHRDb250ZW50ID0gZWxlbWVudC52YWx1ZS5zdWJzdHJpbmcocG9zaXRpb24pIHx8ICcuJzsgLy8gfHwgYmVjYXVzZSBhIGNvbXBsZXRlbHkgZW1wdHkgZmF1eCBzcGFuIGRvZXNuJ3QgcmVuZGVyIGF0IGFsbFxuICBkaXYuYXBwZW5kQ2hpbGQoc3Bhbik7XG5cbiAgbGV0IGNvb3JkaW5hdGVzID0ge1xuICAgIHRvcDogc3Bhbi5vZmZzZXRUb3AgKyBwYXJzZUludChjb21wdXRlZFsnYm9yZGVyVG9wV2lkdGgnXSksXG4gICAgbGVmdDogc3Bhbi5vZmZzZXRMZWZ0ICsgcGFyc2VJbnQoY29tcHV0ZWRbJ2JvcmRlckxlZnRXaWR0aCddKSxcbiAgICBoZWlnaHQ6IHBhcnNlSW50KGNvbXB1dGVkWydsaW5lSGVpZ2h0J10pLFxuICB9O1xuXG4gIGlmIChkZWJ1Zykge1xuICAgIHNwYW4uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNhYWEnO1xuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZGl2KTtcbiAgfVxuXG4gIHJldHVybiBjb29yZGluYXRlcztcbn1cblxuLy8gaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzICE9ICd1bmRlZmluZWQnKSB7XG4vLyAgIG1vZHVsZS5leHBvcnRzID0gZ2V0Q2FyZXRDb29yZGluYXRlcztcbi8vIH0gZWxzZSBpZiAoaXNCcm93c2VyKCkpIHtcbi8vICAgKHdpbmRvdyBhcyBhbnkpLmdldENhcmV0Q29vcmRpbmF0ZXMgPSBnZXRDYXJldENvb3JkaW5hdGVzO1xuLy8gfVxuIl19