import { useEffect, useMemo, useRef, useState } from 'react';
import { findMatches } from '@/lib/textSearch';
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

    const stats = useMemo(() => organs.map((organ) => ({
        count: findMatches(organ.report_text || '', searchTerm).length,
        nameMatch: findMatches(`${organ.organ_name} ${translate(organ.organ_name, language)}`, searchTerm).length > 0,
    })), [organs, searchTerm, language]);

    const flat = useMemo(
        () => stats.flatMap((s, organ) => Array.from({ length: s.count }, (_, index) => ({ organ, index }))),
        [stats]
    );

    const { current, step, setIndex } = useMatchCursor(flat.length);

    const goTo = (i) => {
        const match = flat[i];
        if (match && match.organ !== currentIndex) setCurrentIndex(match.organ);
    };

    useEffect(() => {
        if (!hasTerm) return;
        if (flat.length) {
            const ahead = flat.findIndex((m) => m.organ >= currentIndex);
            const start = ahead === -1 ? 0 : ahead;
            setIndex(start);
            goTo(start);
        } else {
            const byName = stats.findIndex((s) => s.nameMatch);
            if (byName !== -1) setCurrentIndex(byName);
        }
    }, [searchTerm]);

    useEffect(() => {
        if (!hasTerm) return;
        organButtonRefs.current[currentIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [currentIndex, hasTerm]);

    const selectOrgan = (idx) => {
        setCurrentIndex(idx);
        const first = flat.findIndex((m) => m.organ === idx);
        if (first !== -1) setIndex(first);
    };

    const active = flat[current];

    return {
        searchTerm,
        setSearchTerm,
        hasTerm,
        inputRef,
        stats,
        total: flat.length,
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
