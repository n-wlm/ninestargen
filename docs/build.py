#!/usr/bin/env python3
"""KeystoneDoc builder.

Bundles the modular Markdown sections under ``sections/`` into a single,
self-contained ``documentation.html`` for humans. Pure Python standard
library: no pip installs, no network. Run it with ``python3 build.py`` from
inside the ``docs/`` directory (or pass ``--docs <path>``).

The build is a pure assembly step:
  * front-matter is parsed (a flat ``key: value`` subset),
  * Markdown bodies are rendered to static HTML here,
  * the design system (CSS), behaviour (JS) and the Mermaid library are
    inlined from ``_assets/`` so the output works fully offline.

Diagram rendering (Mermaid) happens in the browser from the inlined library;
everything else is plain HTML text, so the prose is readable without JS.
"""

import argparse
import datetime as _dt
import html
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


# --------------------------------------------------------------------------
# Front-matter (flat key: value subset, comma-separated lists)
# --------------------------------------------------------------------------

LIST_KEYS = {"linked_paths"}


def parse_frontmatter(text):
    """Return (meta_dict, body). Front-matter is delimited by '---' lines."""
    meta = {}
    body = text
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            block = text[3:end].strip("\n")
            body = text[end + 4:]
            if body.startswith("\n"):
                body = body[1:]
            for line in block.split("\n"):
                line = line.rstrip()
                if not line.strip() or line.strip().startswith("#"):
                    continue
                if ":" not in line:
                    continue
                key, _, value = line.partition(":")
                key = key.strip()
                value = value.strip()
                if key in LIST_KEYS:
                    meta[key] = [v.strip() for v in value.split(",") if v.strip()]
                else:
                    meta[key] = value
    return meta, body


# --------------------------------------------------------------------------
# Markdown rendering (small, well-scoped subset)
# --------------------------------------------------------------------------

CALLOUT_ICONS = {
    "note": "ti-info-circle",
    "tip": "ti-bulb",
    "warning": "ti-alert-triangle",
    "caution": "ti-alert-octagon",
    "important": "ti-flag-3",
    "decision": "ti-git-branch",
}


def slugify(text):
    text = re.sub(r"<[^>]+>", "", text)
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text)
    return text.strip("-") or "section"


def esc(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def inline(text):
    """Render inline Markdown (code, links, images, bold, italic)."""
    codes = []

    def stash(m):
        codes.append(m.group(1))
        return "\x00%d\x00" % (len(codes) - 1)

    text = re.sub(r"`([^`]+)`", stash, text)
    text = esc(text)
    text = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)",
                  r'<img alt="\1" src="\2" loading="lazy"/>', text)
    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)",
                  lambda m: '<a href="%s">%s</a>' % (m.group(2), m.group(1)), text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"__([^_]+)__", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"<em>\1</em>", text)
    text = re.sub(r"(?<![\w_])_([^_\n]+)_(?![\w_])", r"<em>\1</em>", text)

    def unstash(m):
        return "<code>%s</code>" % esc(codes[int(m.group(1))])

    return re.sub(r"\x00(\d+)\x00", unstash, text)


def _split_row(row):
    row = row.strip()
    if row.startswith("|"):
        row = row[1:]
    if row.endswith("|"):
        row = row[:-1]
    return [c.strip() for c in row.split("|")]


def _render_table(rows):
    header = _split_row(rows[0])
    aligns = []
    for cell in _split_row(rows[1]):
        left = cell.startswith(":")
        right = cell.endswith(":")
        aligns.append("center" if left and right else "right" if right
                      else "left" if left else "")
    out = ['<div class="table-wrap"><table><thead><tr>']
    for i, h in enumerate(header):
        style = ' style="text-align:%s"' % aligns[i] if i < len(aligns) and aligns[i] else ""
        out.append("<th%s>%s</th>" % (style, inline(h)))
    out.append("</tr></thead><tbody>")
    for row in rows[2:]:
        if not row.strip():
            continue
        cells = _split_row(row)
        out.append("<tr>")
        for i, c in enumerate(cells):
            style = ' style="text-align:%s"' % aligns[i] if i < len(aligns) and aligns[i] else ""
            out.append("<td%s>%s</td>" % (style, inline(c)))
        out.append("</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


def _render_list(lines):
    items = []
    for ln in lines:
        m = re.match(r"^(\s*)([-*+]|\d+\.)\s+(.*)$", ln)
        if m:
            indent = len(m.group(1).replace("\t", "  "))
            ordered = m.group(2)[0].isdigit()
            items.append([indent, ordered, m.group(3)])
        elif items and ln.strip():
            items[-1][2] += " " + ln.strip()

    def build(idx, level):
        if idx >= len(items):
            return "", idx
        ordered = items[idx][1]
        tag = "ol" if ordered else "ul"
        out = ["<%s>" % tag]
        while idx < len(items):
            indent = items[idx][0]
            if indent < level:
                break
            if indent > level:
                child, idx = build(idx, indent)
                out[-1] = out[-1][:-5] + child + "</li>"
                continue
            out.append("<li>%s</li>" % inline(items[idx][2]))
            idx += 1
        out.append("</%s>" % tag)
        return "".join(out), idx

    base_indent = items[0][0] if items else 0
    html_out, _ = build(0, base_indent)
    return html_out


def _render_blockquote(buf):
    m = re.match(r"^\[!(\w+)\]\s*(.*)$", buf[0])
    if m:
        typ = m.group(1).lower()
        rest = [m.group(2)] + buf[1:]
        body = " ".join(x.strip() for x in rest if x.strip())
        icon = CALLOUT_ICONS.get(typ, "ti-info-circle")
        return ('<div class="callout callout-%s"><i class="ti %s callout-icon" '
                'aria-hidden="true"></i><div class="callout-body">'
                '<span class="callout-label">%s</span> %s</div></div>'
                % (typ, icon, typ.capitalize(), inline(body)))
    return "<blockquote>%s</blockquote>" % inline(
        " ".join(b.strip() for b in buf))


def _is_block_start(line):
    s = line.strip()
    return (s.startswith("#") or s.startswith("```") or s.startswith(">")
            or re.match(r"^([-*+]|\d+\.)\s+", s)
            or re.match(r"^(\*{3,}|-{3,}|_{3,})\s*$", s))


def render_markdown(md, headings):
    """Render Markdown to HTML. Append (level, text, id) for h2/h3 to headings."""
    lines = md.replace("\r\n", "\n").split("\n")
    out = []
    i, n = 0, len(lines)
    while i < n:
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith("```"):
            lang = stripped[3:].strip()
            i += 1
            buf = []
            while i < n and not lines[i].strip().startswith("```"):
                buf.append(lines[i])
                i += 1
            i += 1
            code = "\n".join(buf)
            if lang.lower() == "mermaid":
                out.append('<div class="diagram"><pre class="mermaid">%s</pre>'
                           '<button class="zoom-btn" type="button" '
                           'aria-label="Zoom diagram"><i class="ti ti-maximize"></i>'
                           '</button></div>' % esc(code))
            else:
                out.append('<div class="codeblock"><div class="codeblock-head">'
                           '<span class="codeblock-lang">%s</span>'
                           '<button class="copy-btn" type="button" aria-label="Copy">'
                           '<i class="ti ti-copy"></i></button></div>'
                           '<pre><code>%s</code></pre></div>'
                           % (esc(lang or "text"), esc(code)))
            continue

        if stripped == "":
            i += 1
            continue

        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            level = len(m.group(1))
            text = m.group(2).strip()
            hid = slugify(text)
            if level in (2, 3):
                headings.append((level, text, hid))
            out.append('<h%d id="%s">%s</h%d>' % (level, hid, inline(text), level))
            i += 1
            continue

        if re.match(r"^(\*{3,}|-{3,}|_{3,})\s*$", stripped):
            out.append("<hr/>")
            i += 1
            continue

        if stripped.startswith(">"):
            buf = []
            while i < n and lines[i].lstrip().startswith(">"):
                buf.append(re.sub(r"^\s*>\s?", "", lines[i]))
                i += 1
            out.append(_render_blockquote(buf))
            continue

        if ("|" in line and i + 1 < n and "-" in lines[i + 1]
                and re.match(r"^\s*\|?[\s:|-]+\|?\s*$", lines[i + 1])):
            tbuf = [line, lines[i + 1]]
            i += 2
            while i < n and "|" in lines[i] and lines[i].strip():
                tbuf.append(lines[i])
                i += 1
            out.append(_render_table(tbuf))
            continue

        if re.match(r"^\s*([-*+]|\d+\.)\s+", line):
            buf = []
            while i < n and (re.match(r"^\s*([-*+]|\d+\.)\s+", lines[i])
                             or (lines[i].startswith(" ") and lines[i].strip() and buf)):
                buf.append(lines[i])
                i += 1
            out.append(_render_list(buf))
            continue

        buf = [line]
        i += 1
        while i < n and lines[i].strip() and not _is_block_start(lines[i]):
            buf.append(lines[i])
            i += 1
        out.append("<p>%s</p>" % inline(" ".join(b.strip() for b in buf)))

    return "\n".join(out)


# --------------------------------------------------------------------------
# Git-based staleness detection
# --------------------------------------------------------------------------

def _git(args, cwd):
    try:
        res = subprocess.run(["git"] + args, cwd=cwd, capture_output=True,
                             text=True, timeout=15)
        if res.returncode == 0:
            return res.stdout.strip()
    except Exception:
        return None
    return None


def git_available(root):
    return _git(["rev-parse", "--is-inside-work-tree"], root) == "true"


def newest_commit_date(paths, root):
    newest = None
    for p in paths:
        iso = _git(["log", "-1", "--format=%cI", "--", p], root)
        if iso:
            try:
                d = _dt.datetime.fromisoformat(iso).date()
            except ValueError:
                continue
            if newest is None or d > newest:
                newest = d
    return newest


def compute_status(meta, root, has_git):
    """Return (effective_status, reason). 'review' if code is newer than doc."""
    declared = (meta.get("status") or "current").lower()
    if declared == "draft":
        return "draft", ""
    if not has_git:
        return declared, ""
    paths = meta.get("linked_paths") or []
    last = meta.get("last_updated")
    if not paths or not last:
        return declared, ""
    try:
        doc_date = _dt.date.fromisoformat(last.strip())
    except ValueError:
        return declared, ""
    newest = newest_commit_date(paths, root)
    if newest and newest > doc_date:
        return "review", "linked code changed on %s, after doc date %s" % (newest, last)
    return "current", ""


# --------------------------------------------------------------------------
# Assembly
# --------------------------------------------------------------------------

STATUS_LABEL = {"current": "current", "review": "review", "draft": "draft"}


def read_asset(rel):
    path = os.path.join(HERE, "_assets", rel)
    with open(path, "r", encoding="utf-8") as fh:
        return fh.read()


def load_sections(docs_dir):
    sections_dir = os.path.join(docs_dir, "sections")
    files = sorted(f for f in os.listdir(sections_dir)
                   if f.endswith(".md") and not f.startswith("_"))
    sections = []
    for fname in files:
        with open(os.path.join(sections_dir, fname), "r", encoding="utf-8") as fh:
            raw = fh.read()
        meta, body = parse_frontmatter(raw)
        meta.setdefault("id", slugify(meta.get("title", os.path.splitext(fname)[0])))
        meta.setdefault("title", meta["id"].replace("-", " ").title())
        sections.append({"file": fname, "meta": meta, "body": body})
    return sections


def freshness_panel(sections):
    rows = []
    for s in sections:
        st = s["effective_status"]
        cls = {"current": "ok", "review": "warn", "draft": "muted"}.get(st, "muted")
        linked = ", ".join(s["meta"].get("linked_paths") or []) or "&mdash;"
        rows.append(
            '<tr><td>%s</td><td class="mono muted">%s</td><td class="muted">%s</td>'
            '<td class="right"><span class="status status-%s">%s</span></td></tr>'
            % (esc(s["meta"]["title"]), linked,
               esc(s["meta"].get("last_updated", "&mdash;")), cls, st))
    return (
        '<div class="panel"><div class="panel-head">'
        '<i class="ti ti-activity" aria-hidden="true"></i> Freshness panel</div>'
        '<div class="table-wrap"><table class="freshness"><thead><tr>'
        '<th>section</th><th>linked code</th><th>updated</th>'
        '<th class="right">status</th></tr></thead><tbody>%s</tbody></table></div></div>'
        % "".join(rows))


def build_html(docs_dir, meta_cfg):
    has_git = git_available(docs_dir)
    repo_root = _git(["rev-parse", "--show-toplevel"], docs_dir) or docs_dir
    sections = load_sections(docs_dir)

    health_total = 0
    health_current = 0
    for s in sections:
        status, reason = compute_status(s["meta"], repo_root, has_git)
        s["effective_status"] = status
        s["status_reason"] = reason
        if s["meta"].get("id") != "changelog":
            health_total += 1
            if status == "current":
                health_current += 1
    health = round(100 * health_current / health_total) if health_total else 100

    project = meta_cfg.get("project", "Project")
    accent = meta_cfg.get("accent", "#185FA5")
    default_theme = meta_cfg.get("theme", "auto")
    offline = meta_cfg.get("offline", True)
    built = _dt.date.today().isoformat()

    nav_items = []
    panes = []
    index = []
    first_id = sections[0]["meta"]["id"] if sections else "overview"

    for s in sections:
        m = s["meta"]
        sid = m["id"]
        status = s["effective_status"]
        dot = {"current": "ok", "review": "warn", "draft": "muted"}.get(status, "muted")
        nav_items.append(
            '<li class="nav-item" data-target="%s" data-status="%s">'
            '<span class="dot dot-%s" title="%s"></span>'
            '<span class="nav-label">%s</span></li>'
            % (sid, status, dot, status, esc(m["title"])))

        headings = []
        body_html = render_markdown(s["body"], headings)

        chips = "".join(
            '<span class="chip mono"><i class="ti ti-link" aria-hidden="true"></i>%s</span>'
            % esc(p) for p in (m.get("linked_paths") or []))
        meta_line = []
        if m.get("last_updated"):
            meta_line.append("updated %s" % esc(m["last_updated"]))
        if m.get("owner"):
            meta_line.append(esc(m["owner"]))
        reason_html = ('<div class="stale-note"><i class="ti ti-alert-triangle" '
                       'aria-hidden="true"></i> %s</div>' % esc(s["status_reason"])
                       if status == "review" and s["status_reason"] else "")

        header = (
            '<div class="section-header"><div class="sh-title">'
            '<h1>%s</h1><span class="status status-%s">%s</span></div>'
            '<div class="sh-meta">%s</div>%s%s</div>'
            % (esc(m["title"]), dot, STATUS_LABEL.get(status, status),
               " &middot; ".join(meta_line),
               ('<div class="chips">%s</div>' % chips) if chips else "",
               reason_html))

        extra = freshness_panel(sections) if sid == first_id else ""
        if m.get("summary"):
            summary_html = '<p class="section-summary">%s</p>' % inline(m["summary"])
        else:
            summary_html = ""

        hidden_attr = "" if sid == first_id else " hidden"
        panes.append(
            '<section class="pane" id="pane-%s" data-status="%s"%s>%s%s%s%s</section>'
            % (sid, status, hidden_attr, header, summary_html, extra, body_html))

        index.append({
            "id": sid,
            "title": m["title"],
            "status": status,
            "last_updated": m.get("last_updated", ""),
            "linked_paths": m.get("linked_paths", []),
            "summary": m.get("summary", ""),
            "anchors": [{"text": t, "id": hid} for _lvl, t, hid in headings],
        })

    health_cls = "ok" if health >= 80 else "warn" if health >= 50 else "bad"

    css = read_asset("base.css")
    app_js = read_asset("app.js")
    if offline:
        mermaid_tag = "<script>%s</script>" % read_asset("vendor/mermaid.min.js")
    else:
        mermaid_tag = ('<script src="https://cdn.jsdelivr.net/npm/'
                       'mermaid@10/dist/mermaid.min.js"></script>')

    index_json = json.dumps({
        "project": project,
        "generated": built,
        "health": health,
        "sections": index,
    }, ensure_ascii=False, indent=0)

    doc = """<!DOCTYPE html>
<html lang="en" data-theme="{theme}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="generator" content="KeystoneDoc"/>
<title>{project} &middot; Documentation</title>
<style>:root{{--accent:{accent};}}
{css}</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="topbar">
  <div class="brand">
    <i class="ti ti-book-2 brand-icon" aria-hidden="true"></i>
    <div><div class="proj">{project}</div>
    <div class="sub">project documentation &middot; built {built}</div></div>
  </div>
  <div class="top-actions">
    <div class="search">
      <i class="ti ti-search" aria-hidden="true"></i>
      <input id="search" type="search" placeholder="Search documentation&hellip;"
             autocomplete="off" aria-label="Search documentation"/>
      <div id="search-results" role="listbox"></div>
    </div>
    <span class="health health-{health_cls}" title="share of sections current">
      <i class="ti ti-heartbeat" aria-hidden="true"></i> {health}%</span>
    <button id="theme-toggle" type="button" aria-label="Toggle theme">
      <i class="ti ti-moon" aria-hidden="true"></i></button>
  </div>
</header>
<div class="layout">
  <nav class="sidebar" aria-label="Sections">
    <ul class="nav">{nav}</ul>
    <label class="stale-toggle"><input type="checkbox" id="only-stale"/>
      <span>Show only sections needing review</span></label>
  </nav>
  <main class="content" id="main">{panes}</main>
  <aside class="toc" aria-label="On this page">
    <div class="toc-title">On this page</div>
    <ul id="toc-list"></ul>
  </aside>
</div>
<div id="zoom-overlay" hidden><div id="zoom-inner"></div></div>
<script id="doc-index" type="application/json">{index_json}</script>
{mermaid_tag}
<script>{app_js}</script>
</body>
</html>""".format(theme=esc(default_theme), project=esc(project), accent=accent,
                  css=css, built=built, health=health, health_cls=health_cls,
                  nav="".join(nav_items), panes="".join(panes),
                  index_json=index_json.replace("</", "<\\/"),
                  mermaid_tag=mermaid_tag, app_js=app_js)

    return doc, sections, health


def verify(doc, sections):
    """Light verification: report broken in-page anchors and counts."""
    ids = set(re.findall(r'id="([^"]+)"', doc))
    anchor_targets = set(re.findall(r'href="#([^"]+)"', doc))
    broken = [a for a in anchor_targets if a and a not in ids and a != "main"]
    diagrams = doc.count('class="mermaid"')
    return {"sections": len(sections), "diagrams": diagrams, "broken_links": broken}


def main(argv=None):
    parser = argparse.ArgumentParser(description="Build documentation.html from sections/")
    parser.add_argument("--docs", default=HERE,
                        help="Path to the docs directory (defaults to build.py location)")
    parser.add_argument("--out", default=None, help="Output path override")
    args = parser.parse_args(argv)

    docs_dir = os.path.abspath(args.docs)
    meta_path = os.path.join(docs_dir, "_meta.json")
    meta_cfg = {}
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as fh:
            meta_cfg = json.load(fh)

    doc, sections, health = build_html(docs_dir, meta_cfg)

    out_path = args.out or meta_cfg.get("output") or os.path.join(docs_dir, "documentation.html")
    if not os.path.isabs(out_path):
        out_path = os.path.join(docs_dir, out_path)
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(doc)

    report = verify(doc, sections)
    size_kb = round(len(doc.encode("utf-8")) / 1024)
    stale = [s["meta"]["title"] for s in sections if s["effective_status"] == "review"]

    print("KeystoneDoc build complete")
    print("  output:    %s (%d KB)" % (out_path, size_kb))
    print("  sections:  %d   diagrams: %d   health: %d%%"
          % (report["sections"], report["diagrams"], health))
    if stale:
        print("  needs review: %s" % ", ".join(stale))
    if report["broken_links"]:
        print("  WARNING broken anchors: %s" % ", ".join(report["broken_links"]))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
