import { useEffect, useMemo, useRef, useState } from 'react';
import { buildOrganSearchIndex } from '@/lib/textSearch';
import { translate } from '@/services/translation';
import { useFindShortcut, useMatchCursor } from '@/components/Editors/ReportSearch';

// Search across every section (organ) of a multi-section report, jumping between sections as the user navigates matches.
export function useOrganSearch({ organs, currentIndex, setCurrentIndex, language, containerRef }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectNonce, setSelectNonce] = useState(0);
    const inputRef = useRef(null);
    const organButtonRefs = useRef([]);
    useFindShortcut(containerRef, inputRef);

    const hasTerm = searchTerm.trim().length > 0;

    const { stats, flat, nameMatches } = useMemo(
        () => buildOrganSearchIndex(organs, searchTerm, (o) => `${o.organ_name} ${translate(o.organ_name, language)}`),
        [organs, searchTerm, language]
    );

    // Sem ocorrências no texto, navega pelos órgãos cujo nome casa com o termo.
    const byName = flat.length === 0 && nameMatches.length > 0;
    const { current, step, setIndex } = useMatchCursor(byName ? nameMatches.length : flat.length);

    const goTo = (i) => {
        const target = byName ? nameMatches[i] : flat[i]?.organ;
        if (target !== undefined && target !== currentIndex) setCurrentIndex(target);
    };

    useEffect(() => {
        if (!hasTerm) return;
        if (flat.length) {
            const ahead = flat.findIndex((m) => m.organ >= currentIndex);
            const start = ahead === -1 ? 0 : ahead;
            setIndex(start);
            goTo(start);
        } else if (nameMatches.length) {
            setIndex(0);
            setCurrentIndex(nameMatches[0]);
        }
    }, [searchTerm]);

    useEffect(() => {
        if (!hasTerm) return;
        organButtonRefs.current[currentIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [currentIndex, hasTerm]);

    const selectOrgan = (idx) => {
        setCurrentIndex(idx);
        const first = byName ? nameMatches.indexOf(idx) : flat.findIndex((m) => m.organ === idx);
        if (first !== -1) setIndex(first);
    };

    const active = byName ? null : flat[current];

    return {
        searchTerm,
        setSearchTerm,
        hasTerm,
        inputRef,
        stats,
        total: byName ? nameMatches.length : flat.length,
        byName,
        current,
        sectionsWithMatches: stats.filter((s) => s.count > 0).length,
        activeIndexInCurrent: active && active.organ === currentIndex ? active.index : -1,
        selectNonce,
        onNext: () => goTo(step(1)),
        onPrev: () => goTo(step(-1)),
        onGoToText: () => setSelectNonce((n) => n + 1),
        selectOrgan,
        organButtonRef: (idx) => (el) => { organButtonRefs.current[idx] = el; },
    };
}
