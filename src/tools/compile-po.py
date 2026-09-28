"""Compile languages/<locale>.po into the .mo WordPress actually reads.

GNU gettext's own `msgfmt` does the same job and is the reference, but it is
not installed here and pulling a toolchain in for one file is not worth it:
the MO format is a sorted table of two string blocks and two offset arrays,
which is what this writes. Verified against the msgfmt-built de_DE.mo it
replaced — every entry identical, including the plural pair, and only the
header's generator lines (POT-Creation-Date and friends) absent.

An entry with an empty msgstr is LEFT OUT rather than written empty, because
gettext answers an empty translation with the empty string; a missing one
falls back to the English in the source, which is what an untranslated
string should show.

    python3 tools/compile-po.py languages/de_DE.po languages/de_DE.mo
"""
import re, struct, sys

def unescape(s):
    return re.sub(r'\\(.)', lambda m: {'n':'\n','t':'\t','r':'\r','"':'"','\\':'\\'}.get(m.group(1), m.group(1)), s)

def parse(path):
    entries = []          # (msgctxt, msgid, msgid_plural or None, [msgstrs])
    cur = {'ctxt': None, 'id': None, 'plural': None, 'strs': {}}
    field = None
    for raw in open(path, encoding='utf-8'):
        line = raw.strip()
        if not line or line.startswith('#'):
            if not line and cur['id'] is not None:
                entries.append(cur); cur = {'ctxt': None, 'id': None, 'plural': None, 'strs': {}}; field = None
            continue
        m = re.match(r'^msgctxt "(.*)"$', line)
        if m:
            if cur['id'] is not None:
                entries.append(cur); cur = {'ctxt': None, 'id': None, 'plural': None, 'strs': {}}
            cur['ctxt'] = unescape(m.group(1)); field = ('ctxt',); continue
        m = re.match(r'^msgid "(.*)"$', line)
        if m:
            if cur['id'] is not None:
                entries.append(cur); cur = {'ctxt': None, 'id': None, 'plural': None, 'strs': {}}
            cur['id'] = unescape(m.group(1)); field = ('id',); continue
        m = re.match(r'^msgid_plural "(.*)"$', line)
        if m:
            cur['plural'] = unescape(m.group(1)); field = ('plural',); continue
        m = re.match(r'^msgstr(?:\[(\d+)\])? "(.*)"$', line)
        if m:
            idx = int(m.group(1) or 0)
            cur['strs'][idx] = unescape(m.group(2)); field = ('str', idx); continue
        m = re.match(r'^"(.*)"$', line)
        if m and field:
            t = unescape(m.group(1))
            if field[0] == 'ctxt': cur['ctxt'] += t
            elif field[0] == 'id': cur['id'] += t
            elif field[0] == 'plural': cur['plural'] += t
            else: cur['strs'][field[1]] += t
            continue
        raise SystemExit('unparsed line: ' + line)
    if cur['id'] is not None:
        entries.append(cur)
    return entries

def compile_mo(entries, out):
    items = []
    for e in entries:
        key = e['id'] if e['plural'] is None else e['id'] + '\x00' + e['plural']
        # A CONTEXT IS PART OF THE KEY, joined with EOT (\x04) — how gettext
        # keeps _x( 'newsletter', 'slug' ) apart from a plain 'newsletter'.
        if e.get('ctxt') is not None:
            key = e['ctxt'] + '\x04' + key
        val = '\x00'.join(e['strs'][i] for i in sorted(e['strs']))
        if e['id'] != '' and val.strip('\x00') == '':
            continue                      # untranslated: leave it to the source
        items.append((key.encode('utf-8'), val.encode('utf-8')))
    items.sort(key=lambda kv: kv[0])
    n = len(items)
    keystart = 7 * 4 + 16 * n
    offsets, ids, strs = [], b'', b''
    for k, v in items:
        offsets.append((len(ids), len(k), len(strs), len(v)))
        ids += k + b'\x00'; strs += v + b'\x00'
    valuestart = keystart + len(ids)
    koff, voff = b'', b''
    for o1, l1, o2, l2 in offsets:
        koff += struct.pack('<II', l1, o1 + keystart)
        voff += struct.pack('<II', l2, o2 + valuestart)
    data = struct.pack('<IIIIIII', 0x950412de, 0, n, 7 * 4, 7 * 4 + n * 8, 0, 0) + koff + voff + ids + strs
    open(out, 'wb').write(data)
    return n

if __name__ == '__main__':
    print(compile_mo(parse(sys.argv[1]), sys.argv[2]), 'entries')
