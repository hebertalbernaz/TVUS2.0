import React, { useEffect, useState } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '');
const shortcutLabel = isMac ? '⌘F' : 'Ctrl+F';

export function useMatchCursor(total) {
    const [index, setIndex] = useState(0);
    const current = total ? Math.min(index, total - 1) : -1;
    const step = (dir) => {
        if (!total) return -1;
        const next = (current + dir + total) % total;
        setIndex(next);
        return next;
    };
    return { current, step, setIndex };
}

// Redirects Ctrl/Cmd+F to the report search while focus is inside the editor; a second press opens the browser's own find.
export function useFindShortcut(containerRef, inputRef) {
    useEffect(() => {
        const onKeyDown = (e) => {
            if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== 'f') return;
            const container = containerRef.current;
            const input = inputRef.current;
            if (!container || !input) return;
            const active = document.activeElement;
            if (active === input) return;
            if (active && active !== document.body && !container.contains(active)) return;
            e.preventDefault();
            input.focus();
            input.select();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [containerRef, inputRef]);
}

export function ReportSearch({ value, onChange, total, current, onNext, onPrev, onGoToText, inputRef, className }) {
    const hasTerm = value.trim().length > 0;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) onPrev(); else onNext();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            if (hasTerm && total > 0 && onGoToText) onGoToText();
            else { onChange(''); e.currentTarget.blur(); }
        }
    };

    return (
        <div className={cn('relative flex items-center w-full max-w-[18rem]', className)} role="search">
            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <Input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Pesquisar no laudo (${shortcutLabel})`}
                aria-label="Pesquisar no laudo"
                title="Enter: próximo · Shift+Enter: anterior · Esc: ir para o texto"
                className={cn(
                    'h-8 pl-8 text-xs bg-muted/30 border-border/60 transition-colors focus-visible:bg-background',
                    hasTerm ? 'pr-[6.5rem]' : 'pr-3'
                )}
            />
            {hasTerm && (
                <div className="absolute right-1 flex items-center gap-0.5 animate-in fade-in duration-150">
                    <span
                        className={cn('min-w-[2.5rem] text-right text-[11px] tabular-nums pr-1', total ? 'text-muted-foreground' : 'text-destructive')}
                        aria-live="polite"
                    >
                        {total ? `${current + 1}/${total}` : '0/0'}
                    </span>
                    <SearchIconButton label="Resultado anterior" onClick={onPrev} disabled={!total}><ChevronUp className="h-3.5 w-3.5" /></SearchIconButton>
                    <SearchIconButton label="Próximo resultado" onClick={onNext} disabled={!total}><ChevronDown className="h-3.5 w-3.5" /></SearchIconButton>
                    <SearchIconButton label="Limpar pesquisa" onClick={() => { onChange(''); inputRef?.current?.focus(); }}><X className="h-3.5 w-3.5" /></SearchIconButton>
                </div>
            )}
        </div>
    );
}

function SearchIconButton({ label, onClick, disabled, children }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            disabled={disabled}
            className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
            {children}
        </button>
    );
}
