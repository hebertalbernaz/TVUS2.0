import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { findMatches } from '@/lib/textSearch';
import { cn } from '@/lib/utils';

const MIRRORED_STYLES = [
    'boxSizing', 'paddingTop', 'paddingBottom', 'paddingLeft',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight',
    'letterSpacing', 'wordSpacing', 'textIndent', 'textTransform', 'tabSize',
];

// Textarea with a transparent mirror layer behind it that paints search highlights at the exact text positions.
export const HighlightTextarea = forwardRef(function HighlightTextarea(
    { value, searchTerm = '', activeIndex = -1, selectNonce = 0, revealInPage = false, wrapperClassName, className, onScroll, ...props },
    forwardedRef
) {
    const textareaRef = useRef(null);
    const backdropRef = useRef(null);
    const handledNonce = useRef(selectNonce);
    const matches = useMemo(() => findMatches(value || '', searchTerm), [value, searchTerm]);
    const showBackdrop = matches.length > 0;

    const setRefs = useCallback((node) => {
        textareaRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
    }, [forwardedRef]);

    const syncBackdrop = useCallback(() => {
        const ta = textareaRef.current;
        const bd = backdropRef.current;
        if (!ta || !bd) return;
        const cs = window.getComputedStyle(ta);
        MIRRORED_STYLES.forEach((prop) => { bd.style[prop] = cs[prop]; });
        const scrollbar = ta.offsetWidth - ta.clientWidth - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
        bd.style.paddingRight = `${parseFloat(cs.paddingRight) + Math.max(0, scrollbar)}px`;
        bd.style.top = `${ta.offsetTop}px`;
        bd.style.left = `${ta.offsetLeft}px`;
        bd.style.width = `${ta.offsetWidth}px`;
        bd.style.height = `${ta.offsetHeight}px`;
        bd.scrollTop = ta.scrollTop;
    }, []);

    useLayoutEffect(() => {
        if (showBackdrop) syncBackdrop();
    }, [showBackdrop, value, syncBackdrop]);

    useEffect(() => {
        const ta = textareaRef.current;
        if (!showBackdrop || !ta || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(syncBackdrop);
        observer.observe(ta);
        return () => observer.disconnect();
    }, [showBackdrop, syncBackdrop]);

    useEffect(() => {
        const ta = textareaRef.current;
        const mark = backdropRef.current?.querySelector('mark[data-active="true"]');
        if (!ta || !mark) return;
        const top = mark.offsetTop;
        const outOfView = top < ta.scrollTop || top + mark.offsetHeight > ta.scrollTop + ta.clientHeight;
        if (outOfView) ta.scrollTo({ top: Math.max(0, top - ta.clientHeight / 3), behavior: 'smooth' });
        if (revealInPage) ta.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [activeIndex, searchTerm, revealInPage]);

    useEffect(() => {
        if (selectNonce === handledNonce.current) return;
        handledNonce.current = selectNonce;
        const ta = textareaRef.current;
        const match = matches[activeIndex];
        if (!ta || !match) return;
        ta.focus({ preventScroll: true });
        ta.setSelectionRange(match.start, match.end);
    }, [selectNonce, matches, activeIndex]);

    const handleScroll = (e) => {
        if (backdropRef.current) backdropRef.current.scrollTop = e.currentTarget.scrollTop;
        onScroll?.(e);
    };

    return (
        <div className={cn('relative flex-1 flex flex-col min-h-0', wrapperClassName)}>
            {showBackdrop && (
                <div
                    ref={backdropRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute overflow-hidden whitespace-pre-wrap break-words text-transparent border-solid border-transparent"
                >
                    {renderSegments(value, matches, activeIndex)}
                    {'\n '}
                </div>
            )}
            <Textarea
                ref={setRefs}
                value={value}
                onScroll={handleScroll}
                className={cn('relative flex-1 bg-transparent', className)}
                {...props}
            />
        </div>
    );
});

function renderSegments(text, matches, activeIndex) {
    const nodes = [];
    let cursor = 0;
    matches.forEach((m, i) => {
        if (m.start > cursor) nodes.push(text.slice(cursor, m.start));
        const active = i === activeIndex;
        nodes.push(
            <mark
                key={m.start}
                data-active={active ? 'true' : undefined}
                className={cn(
                    'rounded-[2px] text-transparent transition-colors duration-150',
                    active ? 'bg-orange-300 ring-1 ring-orange-500 dark:bg-orange-500/60' : 'bg-amber-200/80 dark:bg-amber-400/30'
                )}
            >
                {text.slice(m.start, m.end)}
            </mark>
        );
        cursor = m.end;
    });
    if (cursor < text.length) nodes.push(text.slice(cursor));
    return nodes;
}
