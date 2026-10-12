// Folds each UTF-16 unit to one char so match offsets stay valid in the original text.
const fold = (text) => {
    let out = '';
    for (let i = 0; i < text.length; i++) {
        out += text[i].normalize('NFD').charAt(0).toLowerCase().charAt(0);
    }
    return out;
};

export function findMatches(text, term) {
    const needle = fold((term || '').trim());
    if (!needle || !text) return [];
    const haystack = fold(text);
    const matches = [];
    let i = haystack.indexOf(needle);
    while (i !== -1) {
        matches.push({ start: i, end: i + needle.length });
        i = haystack.indexOf(needle, i + needle.length);
    }
    return matches;
}
