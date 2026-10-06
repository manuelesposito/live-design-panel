#!/usr/bin/env python3
"""The font library: tools/font-library.json in, everything the panel needs out.

WHY (2026-09-23). The panel offered fifteen faces, each typed by hand into five
places: reading-face.js (the list), presets.js (the family, the weight range,
the italic), style.css (the reading rule, the interface rule, the tile sample,
the mono ladder) and fonts.json (the files). Seventy-four more that way is
seventy-four chances to forget one of the five. So the fifteen stay where they
are, with their history, and the rest are one line each in font-library.json;
this script does the other four jobs.

WHAT IT WRITES
    plugin/font-files.json             per face: where each file and the licence
                                       are fetched from, and each file's
                                       @font-face (style, weight, unicode-range)
    plugin/assets/js/font-library.js   window.ArchitraveFontLibrary, read by
                                       reading-face.js and presets.js
    plugin/assets/css/font-library.css the per-face rules (no @font-face)

FONTS ON DEMAND (2026-09-23, docs/fonts-on-demand.md). The files are NOT in the
plugin: wordpress.org takes a zip under 10 MB and they were 7.6 of its 9.1. The
plugin fetches a face's files into the site's uploads the first time the owner
picks it (plugin/fonts-on-demand.php), from the addresses in font-files.json,
and writes their @font-face rules there. This script still fetches every file,
into tools/.font-cache (not committed), because the measure is read from them.

THE FILES. A variable face ships its variable file: the one with the optical
size axis where it has one (a display serif without it is a text serif blown
up), the weight-only one otherwise. A face whose axes do not include weight
(Geist Pixel's shape, Workbench's scanlines, Climate Crisis's year) ships its
regular instance, so its weight row greys out as VT323's does. A static face
ships its regular and its bold, and says exactly which weights it has, so the
weight row does not offer a Medium the file cannot draw. Each file comes as
latin and latin-ext with its unicode-range: a browser fetches latin-ext only
when a page has a letter in it, a Polish or a Turkish one.

THE MEASURE. `ch` is the zero's width, and the zero stands differently to the
letters in every face, so the same 53ch is a different line in each. The
fifteen were measured to hold Newsreader's 72 letters a line (style.css, THE
FINAL TWELVE AS READING FACES); every face here is given the measure that does
the same, from its own advance widths at 400, weighted by how often each letter
comes up in English, against Newsreader's. Checked against the hand-measured
fifteen with --check.

    python3 tools/font-library.py            fetch what is missing, write the four
    python3 tools/font-library.py --check    the computed measure beside each hand-set one
"""

from __future__ import annotations

import io
import json
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

THEME = Path(__file__).resolve().parent.parent
LIST = THEME / "tools" / "font-library.json"
FONTS = THEME / "tools" / ".font-cache"  # read for the measure, never shipped
MANIFEST = THEME / "plugin" / "font-files.json"
JS = THEME / "plugin" / "assets" / "js" / "font-library.js"
CSS = THEME / "plugin" / "assets" / "css" / "font-library.css"
API = "https://api.fontsource.org/v1"
CDN = "https://cdn.jsdelivr.net/fontsource/fonts"
SUBSETS = ("latin", "latin-ext")

# How often each letter comes up in English, and the space between words.
FREQ = dict(zip("etaoinshrdlcumwfgypbvkjxqz", [12.7, 9.1, 8.2, 7.5, 7.0, 6.7, 6.3, 6.1, 6.0, 4.3, 4.0, 2.8, 2.8, 2.4, 2.4, 2.2, 2.0, 2.0, 1.9, 1.5, 1.0, 0.8, 0.2, 0.2, 0.1, 0.1]))
SPACE = 18.0
# Where a variable face is read: at 400, and at the reading size, 22px, for the
# faces that redraw themselves by size (Inter set 60ch by hand, measured live;
# at its default optical size it computes to 54).
AT = {"wght": 400, "opsz": 22}
# Newsreader at 53ch holds 72 letters a line (style.css): the reference.
REFERENCE = (THEME / "assets/fonts/webfonts/newsreader-latin-opsz-normal.woff2", 53)
# The mono ladder (style.css, THE MONOSPACED FACES TAKE A LOWER FLOOR ON A PHONE).
LADDER = {
    "tiny": "clamp(12px, calc(7.629px + 1.278cqi), 16px)",
    "small": "clamp(13px, calc(7.537px + 1.597cqi), 18px)",
    "compact": "clamp(14px, calc(7.444px + 1.917cqi), 20px)",
    "default": "clamp(16px, calc(9.444px + 1.917cqi), 22px)",
    "comfortable": "clamp(18px, calc(11.444px + 1.917cqi), 24px)",
    "large": "clamp(20px, calc(11.259px + 2.556cqi), 28px)",
    "huge": "clamp(22px, calc(6.703px + 4.473cqi), 36px)",
}
FALLBACK = {
    "sans": "system-ui, sans-serif",
    "serif": "Georgia, serif",
    "mono": "ui-monospace, Menlo, monospace",
    "pixel": "ui-monospace, monospace",
    "display": "system-ui, sans-serif",
}


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "curl/8.0"})  # the API answers 403 to Python's own
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def resolved(pkg: str) -> str:
    """What @latest means today, asked of jsDelivr and written down.

    THE PINS (2026-09-25, for wordpress.org). The shipped manifest must say
    exactly what a site will receive: @latest changes under it, and guideline 7
    asks for a disclosure a reviewer can check. Re-running this script moves
    the pins on purpose; nothing moves them on a site."""
    return json.loads(fetch(f"https://data.jsdelivr.com/v1/packages/npm/{pkg}/resolved"))["version"]


def plan(face: dict) -> dict:
    """What to ship for one face: its files and what they can do."""
    meta = json.loads(fetch(f"{API}/fonts/{face['id']}"))
    pin = resolved(f"@fontsource/{face['id']}")
    axes = {}
    if meta.get("variable"):
        axes = {k: (float(v["min"]), float(v["max"])) for k, v in json.loads(fetch(f"{API}/variable/{face['id']}"))["axes"].items()}
    styles = [s for s in ("normal", "italic") if s in meta["styles"]]
    subsets = [s for s in SUBSETS if s in meta["subsets"]]
    files = []
    if "wght" in axes:
        lo, hi = int(axes["wght"][0]), min(int(axes["wght"][1]), 900)
        axis = "opsz" if "opsz" in axes else "wght"
        vf = resolved(f"@fontsource-variable/{face['id']}")
        for st in styles:
            for sub in subsets:
                files.append((f"{CDN}/{face['id']}:vf@{vf}/{sub}-{axis}-{st}.woff2", f"{face['id']}-{sub}-{axis}-{st}.woff2", st, f"{lo} {hi}", meta["unicodeRange"][sub]))
        weights = {"range": [lo, hi]}
    else:
        have = meta["weights"]
        ship = [w for w in (400, 700) if w in have] or [min(have, key=lambda w: abs(w - 400))]
        if ship == [400] and 500 in have and 700 not in have:
            ship = [400, 500]  # DM Mono: its heaviest is a Medium
        for st in styles:
            for w in ship:
                if st not in meta["variants"][str(w)]:
                    continue  # Cardo's italic has no bold
                for sub in subsets:
                    files.append((f"{CDN}/{face['id']}@{pin}/{sub}-{w}-{st}.woff2", f"{face['id']}-{sub}-{w}-{st}.woff2", st, str(w), meta["unicodeRange"][sub]))
        weights = {"weights": ship} if len(ship) > 1 else {"range": []}
    return {"files": files, "italic": "italic" in styles, "license": meta["license"], "pin": pin, **weights}


def licence_name(face: dict) -> str:
    return re.sub(r"[^A-Z0-9]", "", face["family"].upper()) + "-OFL.txt"


def average(path: Path) -> float:
    """Letters per em-wide stretch of text, against the zero: zero / average advance."""
    font = TTFont(io.BytesIO(path.read_bytes()))
    if "fvar" in font:
        loc = {a.axisTag: (min(max(AT.get(a.axisTag, a.defaultValue), a.minValue), a.maxValue)) for a in font["fvar"].axes}
        font = instancer.instantiateVariableFont(font, loc)
    cmap, hmtx = font.getBestCmap(), font["hmtx"]
    width = lambda ch: hmtx[cmap[ord(ch)]][0]
    avg = (sum(width(c) * f for c, f in FREQ.items()) + width(" ") * SPACE) / (sum(FREQ.values()) + SPACE)
    return width("0") / avg


def measure(path: Path) -> int:
    ref = average(REFERENCE[0])
    return round(REFERENCE[1] * ref / average(path))


def main() -> int:
    data = json.loads(LIST.read_text())
    faces = data["faces"]

    if "--check" in sys.argv:
        hand = {"inter-latin-opsz-normal": 60, "atkinson-hyperlegible-next-latin-wght-normal": 49, "geist-latin-wght-normal": 50,
                "ibm-plex-sans-latin-wght-normal": 50, "geist-mono-latin-wght-normal": 68, "martian-mono-latin-wdth-wght-normal": 60,
                "kode-mono-latin-wght-normal": 70, "jetbrains-mono-latin-wght-normal": 68, "doto-latin-wght-normal": 58,
                "vt323-latin-400-normal": 72, "handjet-latin-wght-normal": 56, "libre-baskerville-latin-wght-normal": 53, "vollkorn-latin-wght-normal": 53}
        for name, set_by_hand in hand.items():
            print(f"{name:48} by hand {set_by_hand:3}ch   computed {measure(THEME / 'assets/fonts/webfonts' / (name + '.woff2')):3}ch")
        return 0

    FONTS.mkdir(exist_ok=True)
    todo = [f for f in faces if not f.get("have")]
    with ThreadPoolExecutor(12) as ex:
        plans = dict(zip([f["id"] for f in todo], ex.map(plan, todo)))

    def get(job):
        url, name = job
        dest = FONTS / name
        if not dest.exists():
            try:
                dest.write_bytes(fetch(url))
            except Exception as e:
                return f"{name}: {e} ({url})"
        return None

    jobs = [(u, n) for p in plans.values() for (u, n, *_) in p["files"]]
    jobs += [(f"https://cdn.jsdelivr.net/npm/@fontsource/{f['id']}@{plans[f['id']]['pin']}/LICENSE", licence_name(f)) for f in todo]
    with ThreadPoolExecutor(12) as ex:
        failed = [x for x in ex.map(get, jobs) if x]
    # A cut the listing promises and the CDN does not have (Cardo's bold italic)
    # is left out, and the browser slants the bold from the regular italic. A
    # face missing its regular is a real failure.
    for p in plans.values():
        p["files"] = [f for f in p["files"] if (FONTS / f[1]).exists()]
    lost = [x for x in failed if "-400-normal" in x or "-wght-normal" in x or "-opsz-normal" in x]
    if failed:
        print("could not fetch:", *failed, sep="\n    ")
    if lost:
        return 1

    library, manifest, rules = [], {}, []
    for f in faces:
        stack = f'"{f["family"]}", {FALLBACK[f["group"]]}'
        if f.get("have"):
            first = THEME / f["have"]
            entry = {"italic": f.get("italic", False), "range": f.get("range", [100, 900]), "bundled": True}  # ships in the plugin (fonts.json): font-fetch.js never asks the server for it  # a bundled face says what it can do (Routed Gothic, 2026-10-02: one weight, a half italic)
        else:
            p = plans[f["id"]]
            manifest[f["id"]] = {
                "family": f["family"],
                "licence": {"url": f"https://cdn.jsdelivr.net/npm/@fontsource/{f['id']}@{p['pin']}/LICENSE", "name": licence_name(f)},
                "files": [{"url": url, "name": name, "style": st, "weight": weight, "range": urange} for url, name, st, weight, urange in p["files"]],
            }
            first = FONTS / next(n for _, n, st, _, _ in p["files"] if st == "normal" and "-latin-" in n)
            entry = {"italic": p["italic"], **({"weights": p["weights"]} if "weights" in p else {"range": p["range"]})}
        ch = measure(first)
        library.append({"id": f["id"], "label": f["family"], "group": f["group"], "family": stack, **entry})
        weight = " --font-weight-reading: var(--font-weight-body);" if f["group"] == "sans" else ""
        rules.append(f':root[data-face="{f["id"]}"] {{ --font-reading: {stack};{weight} --layout-content-width-reading: {ch}ch; }}')
        rules.append(f':root[data-sans="{f["id"]}"] {{ --font-sans: {stack}; --wp--preset--font-family--font-sans: {stack}; }}')
        rules.append(f'.reading-tile[data-face-sample="{f["id"]}"] {{ font-family: {stack}; }}')

    monos = [f["id"] for f in faces if f["group"] == "mono"]
    ladder = [
        ":root:is(%s)[data-reading=\"%s\"] { --text-reading-body: %s; }" % (", ".join(f'[data-face="{i}"]' for i in monos), step, value)
        for step, value in LADDER.items()
    ]

    head = "/* Vibetiles: the font library. Generated by tools/font-library.py from\n * tools/font-library.json; do not edit. The @font-face rules are not here: a\n * face's files are fetched into the site's uploads when the owner first picks\n * it, and plugin/fonts-on-demand.php writes their rules there. Until then a\n * face's stack falls back to its section's system face. */\n"
    CSS.write_text(head + "\n".join(rules) + "\n\n/* The monospaced faces take the lower floor on a phone, as Geist Mono does (style.css). */\n" + "\n".join(ladder) + "\n")
    JS.write_text(
        "/* Vibetiles: the font library, for reading-face.js and presets.js.\n"
        " * Generated by tools/font-library.py from tools/font-library.json; do not edit.\n"
        " * `range` is the weight axis (empty: one weight); `weights` the exact cuts of a\n"
        " * static face. */\n"
        "window.ArchitraveFontLibrary = " + json.dumps(library, ensure_ascii=False, indent="\t") + ";\n"
    )
    MANIFEST.write_text(json.dumps({"_": "Generated by tools/font-library.py; do not edit. Where the plugin fetches each library face from when the owner first picks it (fonts-on-demand.php).", "faces": manifest}, ensure_ascii=False, indent="\t") + "\n")
    files = sum(len(m["files"]) for m in manifest.values())
    size = sum((FONTS / x["name"]).stat().st_size for m in manifest.values() for x in m["files"])
    print(f"{len(library)} faces, {files} files, {size / 1e6:.1f} MB fetched on demand (none in the plugin)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
