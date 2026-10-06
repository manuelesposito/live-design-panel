#!/usr/bin/env python3
"""The values the panel's sheet needs when no Architrave is underneath it.

WHY (2026-09-21). The panel's half of style.css reads 245 custom properties and
sets none of them on a plain root: every definition it carries sits under a dial
(`--accent` under [data-tint="brown"], `--line` under [data-lines="on"]). On
Architrave that is fine, because the theme's own sheet and the QDS sheets under
it define the rest. On a stranger's theme nothing defines them, so the panel's
own buttons, rows and swatches come out with no spacing, no borders and no text
colour. Measured on stock Twenty Twenty-Five: 215 properties resolve to nothing.

So the plugin ships this sheet and loads it BEFORE panel.css, but only where it
is a guest. It sets variables and nothing else, so it cannot restyle the page it
lands on; and a host theme that defines the same names is loaded after it and
wins, which is why guests get defaults and Architrave is untouched.

WHAT IT TAKES: every custom property the sources below set on a bare `:root` or
`html` (no dial, no room, no media query), last one winning, narrowed to what
the panel's half actually reads, plus whatever those values name in turn. That
is Standard's light side at rest. The dark side is not in here yet: a guest gets
the light values in both rooms until the room question is settled.

    python3 tools/panel-tokens.py            write dist/panel-tokens.css (to look at)
    python3 tools/panel-tokens.py --report   what is taken, what is still missing
    python3 tools/panel-tokens.py --print    the sheet, to stdout
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import split_style as S  # noqa: E402

THEME = Path(__file__).resolve().parent.parent
OUT = THEME / "dist" / "panel-tokens.css"  # a build product, never a theme file: the theme zip must not carry it

# In the order the browser sees them: the QDS sheets, then the theme's own.
SOURCES = [
    "assets/css/quire.css",
    "assets/css/quire.pairs.css",
    "assets/css/quire.reading.css",
    "assets/css/quire.website.css",
]

READ = re.compile(r"var\(\s*(--[\w-]+)")
SET = re.compile(r"(?:^|[;{\s])(--[\w-]+)\s*:\s*([^;]+)")
PLAIN_ROOT = (":root", "html", ":root:not([data-theme])")


# A ROOM NAMES ITSELF THREE WAYS. `:root[data-theme="x"]` is the page in that
# room; `.theme-x` is a PATCH of the page in that room, which is how the panel
# draws its two preview pictures and its style tiles; and quire.pairs.css writes
# neutral-light as `:root[data-theme="neutral-light"]:root`, to win on
# specificity. Matching only the first left a guest with two preview pictures
# the same colour and three pairs (grey, news, arcade) it could not paint at all.
ROOM = re.compile(r'^:root\[data-theme="([a-z-]+)"\](?::root)?$')
ROOM_CLASS = re.compile(r"^\.theme-([a-z-]+)$")

# The sheets the rooms live in, in the order the browser sees them.
ROOM_SOURCES = ("assets/css/quire.css", "assets/css/quire.pairs.css")


def rooms(_unused: str, keep: set[str]) -> dict[str, dict[str, str]]:
    """Each colour room's own values, for the properties we are carrying.

    The rooms live in the QDS sheets, which a guest never receives, so without
    this the panel can set `data-theme` all it likes and nothing under it
    changes. Only the properties already being carried are taken, so a room
    cannot smuggle in a name the sheet does not use.

    Both spellings are collected and both are written out, because they are not
    the same job: the attribute paints the page, the class paints a patch of the
    panel that is showing a room it is not in.
    """
    out: dict[str, dict[str, str]] = {}
    for rel in ROOM_SOURCES:
        path = THEME / rel
        if not path.exists():
            continue
        for item in S.parse(S.strip_comments(path.read_text())):
            if item[0] != "rule":
                continue
            names = []
            for sel in S.split_selectors(item[1]):
                hit = ROOM.match(sel.strip()) or ROOM_CLASS.match(sel.strip())
                if hit:
                    names.append(hit.group(1))
            if not names:
                continue
            values = {name: value.strip() for name, value in SET.findall(item[2]) if name in keep}
            for room in names:
                out.setdefault(room, {}).update(values)
    return {room: values for room, values in out.items() if values}


def rooms_close(found: dict[str, str], keep: set[str]) -> set[str]:
    """Widen `keep` by whatever the ROOMS' own values name.

    close_over() walks what the sheets read at the root. A room's value can name
    a property the root never did, and then the room writes a var() chain with a
    hole in it and the whole declaration is thrown away. That is what happened to
    the pop-up menu's shadow: every room redefines --elevation-floating in terms
    of --elevation-contact-color and --elevation-ambient-color, neither of which
    the root sweep had any reason to keep, so a guest's menu had no shadow while
    the property looked present in the sheet.
    """
    while True:
        more: set[str] = set()
        for values in rooms("", keep).values():
            for value in values.values():
                more |= {ref for ref in READ.findall(value) if ref in found} - keep
        if not more:
            return keep
        keep |= more


def declarations(items: list, found: dict, inside_at: bool = False) -> None:
    """Custom properties set on a bare root, in source order, last value winning."""
    for item in items:
        if item[0] == "rule":
            if inside_at:
                continue
            if not any(sel.strip() in PLAIN_ROOT for sel in S.split_selectors(item[1])):
                continue
            for name, value in SET.findall(item[2]):
                found[name] = value.strip()
        elif item[0] == "at":
            declarations(item[2], found, True)


# The page paint below reads these, and the panel's own sheet does not, so they
# would be filtered out of both the root and the rooms and Dark would leave the
# paper white under light text.
PAINT_NEEDS = {"--surface-canvas", "--surface-plane", "--surface-base", "--text-primary", "--text-secondary"}

# WHAT ONLY JAVASCRIPT NAMES. A sheet's reads can be swept for; a script's cannot.
# presets.js stamps a role's face as `var(--face-inter)` or
# `var(--face-newsreader)` (its FAMILY table, and the comment there says why they
# are not the font-sans preset), and nothing in any stylesheet reads those two
# names, so the sweep dropped them and every role that rests on Inter or
# Newsreader resolved to nothing on a guest: on Twenty Twenty-Five, picking
# Standard left the title in the host's sans while the article read in
# Newsreader. Scanned out of the script rather than typed here, so a new one
# arrives on its own.
SCRIPT_NEEDS = re.compile(r"var\((--face-[\w-]+)\)")


def wanted() -> set[str]:
    """What the panel's half, its FRAME, its PARTS and the ROLE TABLE read.

    The frame is the catch. Those rules stay in the theme's half (the tiny panel
    wears the same classes), so a guest gets them as panel-shell.css and they
    were not being looked at here: 27 properties short, among them
    `--layer-overlay`. Without it the panel had no z-index at all and a
    stranger's own navigation painted straight over it.
    """
    css = (THEME / "style.css").read_text()
    theme_half, plugin = S.divide(S.parse(S.strip_comments(css)))
    reads = set(READ.findall(S.write(plugin)))
    reads |= set(READ.findall(S.write(S.shell(theme_half))))
    qds = S.parse(S.strip_comments((THEME / "assets" / "css" / "quire.css").read_text()))
    reads |= set(READ.findall(S.write(S.parts(qds))))  # the QDS components the panel wears
    page = THEME / "plugin" / "assets" / "css" / "panel-page.css"  # the role table a guest spends on core markup
    if page.exists():
        reads |= set(READ.findall(page.read_text()))
    reads |= set(READ.findall(S.write(S.lifted(theme_half)[0])))  # and the picture looks' spending rules
    script = THEME / "assets" / "js" / "presets.js"
    if script.exists():
        reads |= set(SCRIPT_NEEDS.findall(script.read_text()))  # the faces only the script names
    return reads | PAINT_NEEDS


def collect() -> dict[str, str]:
    found: dict[str, str] = {}
    for rel in SOURCES:
        path = THEME / rel
        if path.exists():
            declarations(S.parse(S.strip_comments(path.read_text())), found)
    css = (THEME / "style.css").read_text()
    theme_half, _ = S.divide(S.parse(S.strip_comments(css)))
    declarations(theme_half, found)
    return found


def close_over(names: set[str], found: dict[str, str]) -> set[str]:
    """A value may name another property; take those too, until nothing is added."""
    keep = {n for n in names if n in found}
    while True:
        more = {ref for n in keep for ref in READ.findall(found[n]) if ref in found} - keep
        if not more:
            return keep
        keep |= more


# WHAT A GUEST'S PAGE IS PAINTED WITH. Architrave paints its own page from
# theme.json presets (`--wp--preset--color--surface-canvas`), which exist only in
# that theme. A stranger's theme paints its own page and knows nothing of the
# room the reader picked, so Dark used to give pale grey text on white paper: the
# ink followed the room and the paper did not. This is the smallest honest fix -
# the page and its text take the room's paper and ink, and nothing else is
# touched. It applies ONLY once the reader has actually chosen something, which
# is what `data-chosen` says: presets.js writes it when anything the panel owns
# is in store, or when the site owner has published a default. Until then a
# guest's page keeps its own colours. `data-theme` alone was not enough, because
# the panel's default side has been dark since 2026-09-19 and that is
# Architrave's decision, not a stranger's: without the second gate every visitor
# to a guest site was handed a dark page nobody asked for.
# AND `data-chosen` ALONE, NOT `data-theme` WITH IT (2026-09-23, Twenty
# Twenty-Four): light Neutral writes no `data-theme` at all, its values are the
# root's own. So Standard, Terminal, Blueprint and Instrument never painted, and
# the page kept the host's off-white under the look's ink. Invisible on Twenty
# Twenty-Five, whose paper is already white. `data-chosen` is the gate that
# matters; with no attribute the root's values are the room.
PAINT = """
:root[data-chosen] body {
\tbackground-color: var(--surface-canvas);
\tcolor: var(--text-primary);
}
:root[data-chosen] body :is(h1, h2, h3, h4, h5, h6):not(:is(.has-text-color, .has-background, .wp-block-cover) *) {
\tcolor: var(--text-primary);
}
:root[data-chosen] body :is(.wp-block-post-content, .wp-block-post-excerpt, .entry-content):not(:is(.has-text-color, .has-background, .wp-block-cover) *) {
\tcolor: var(--text-primary);
}
"""
# A BAND THE THEME COLOURED KEEPS ITS OWN TEXT (2026-09-24, ten themes: Twenty
# Twenty-Two's header and Neve's "Expand with Patterns" are sections with a dark
# ground and light text, and every heading in them took the look's ink, dark on
# dark). Inside anything the theme gave a text or background colour, headings and
# text inherit that section's colour, which the palette placement already turns
# with the look. A COVER is the same (Neve FSE under Classic, dark: its hero title
# went light on a light photograph). WordPress marks a cover light or dark from
# its picture and gives the text black or white to match; that choice stands.


def sheet(found: dict[str, str], keep: set[str], room_values: dict | None = None) -> str:
    lines = [
        "/* Vibetiles: the values the panel draws itself with when the theme",
        " * underneath does not supply them, and the paper and ink of each colour room.",
        " * Generated by tools/panel-tokens.py; do not edit. Loaded only where the",
        " * plugin is a guest, always before panel.css. */",
        ":root {",
    ]
    lines += [f"\t{name}: {found[name]};" for name in found if name in keep]
    lines.append("}")
    for room, values in sorted((room_values or {}).items()):
        lines.append(f':root[data-theme="{room}"], .theme-{room} {{')
        lines += [f"\t{name}: {value};" for name, value in values.items()]
        lines.append("}")
    return "\n".join(lines) + "\n" + PAINT


def main() -> int:
    found = collect()
    need = wanted()
    keep = rooms_close(found, close_over(need, found))
    text = sheet(found, keep, rooms("", keep))

    if "--report" in sys.argv:
        missing = sorted(need - set(found))
        print(f"the panel's half reads {len(need)} properties")
        print(f"a bare root in the theme and QDS sets {len(found)} of anything")
        print(f"taken into the sheet: {len(keep)} ({len(keep & need)} asked for, {len(keep - need)} named by those values)")
        print(f"still missing: {len(missing)}")
        for name in missing:
            print("   ", name)
        return 0

    if "--print" in sys.argv:
        print(text, end="")
        return 0

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(text)
    print(f"{OUT.relative_to(THEME)}: {len(keep)} properties, {len(text) // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
