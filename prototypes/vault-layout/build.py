#!/usr/bin/env python3
"""PROTOTYPE, throwaway. Builds three Obsidian layouts of a cairn vault into out/. Not part of the plugin."""
import json
import re
import shutil
import sys
from pathlib import Path

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "~/dev/personal/brain").expanduser()
OUT = Path(__file__).parent / "out"
LINK = re.compile(r"\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]")
TYPE_FOLDER = {"concept": "concepts", "system": "systems", "project": "projects",
               "synthesis": "synthesis", "person": "people"}
DEPENDS_HEADING = {"concept": "Connects to", "system": "Built from", "synthesis": "What it combines"}
AREAS = {
    "Data formats": ["parquet", "avro", "json", "csv", "arrow"],
    "Storage and table formats": ["hdfs", "open-table-format", "small-file-problem", "bloom-filter"],
    "Engines": ["flink", "spark", "bigquery", "snowflake", "druid"],
}


def parse(text):
    if not text.startswith("---\n"):
        return {}, text
    end = text.index("\n---", 4)
    meta = {}
    for line in text[4:end].splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta, text[end + 4:].lstrip("\n")


def render(meta, body):
    return "---\n" + "".join(f"{k}: {v}\n" for k, v in meta.items()) + "---\n" + body


def title_of(body, slug):
    m = re.search(r"^# (.+)$", body, re.M)
    return m.group(1).strip() if m else slug.replace("-", " ").capitalize()


def section(body, heading):
    m = re.search(rf"^## {re.escape(heading)}\n(.*?)(?=^## |\Z)", body, re.M | re.S)
    return m.group(1) if m else ""


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def load():
    docs = []
    for folder in TYPE_FOLDER.values():
        for f in sorted((SRC / folder).glob("*.md")):
            meta, body = parse(f.read_text())
            docs.append(dict(slug=f.stem, kind="note", meta=meta, body=body))
    for kind, folder in [("map", "maps"), ("queue", "queue"), ("interview", "interviews")]:
        for f in sorted((SRC / folder).glob("*.md")):
            meta, body = parse(f.read_text())
            docs.append(dict(slug=f.stem, kind=kind, meta=meta, body=body))
    for f in sorted(SRC.glob("study/*/README.md")):
        topic = f.parent.name
        docs.append(dict(slug=f"study-{topic}", kind="study", topic=topic,
                         meta={"type": "study", "topic": f"\"[[{topic}]]\""}, body=f.read_text()))
    templates = {}
    for f in sorted((SRC / "templates").glob("*.md")):
        meta, body = parse(f.read_text())
        templates[f.stem] = (meta, body)
        docs.append(dict(slug=f.stem, kind="template", meta=meta, body=body))
    return docs, templates


def fix(docs, templates, company):
    by_slug = {d["slug"]: d for d in docs}

    for d in [d for d in docs if d["kind"] == "queue"]:
        topics = re.search(r"^Topics:.*$", d["body"], re.M)
        if topics and f"[[{d['slug']}]]" in topics.group(0):
            del by_slug[d["slug"]]
            d["slug"] = f"what-is-{d['slug']}"
            by_slug[d["slug"]] = d

    for d in docs:
        if d["kind"] != "template":
            d["body"] = re.sub(r"`study/([a-z0-9-]+)/`", r"[[study-\1|study pack]]", d["body"])

    referrers = {}
    for d in docs:
        if d["kind"] == "template":
            continue
        for target, alias in LINK.findall(d["body"]):
            target = target.strip()
            referrers.setdefault(target, []).append((d, alias))

    for target, refs in referrers.items():
        if target in by_slug:
            continue
        is_company = company and all(r[0]["meta"].get("company") for r in refs)
        ntype = "system" if is_company else "concept"
        alias = next((a for _, a in refs if a), "")
        title = alias or target.replace("-", " ").capitalize()
        tmeta, tbody = templates[ntype]
        meta = dict(tmeta)
        meta["company"] = company if is_company else ""
        meta["status"] = "stub"
        stub = dict(slug=target, kind="stub", meta=meta, body=tbody.replace("{{title}}", title))
        docs.append(stub)
        by_slug[target] = stub

    for d in docs:
        if d["kind"] != "map":
            continue
        def link_item(m):
            slug = slugify(m.group(1))
            return f"- [[{slug}|{m.group(1)}]]" if slug in by_slug else m.group(0)
        d["body"] = re.sub(r"^- ([^\[\n]+)$", link_item, d["body"], flags=re.M)

    for d in docs:
        if d["kind"] not in ("note", "stub"):
            continue
        t = d["meta"].get("type")
        links = [l for l, _ in LINK.findall(section(d["body"], DEPENDS_HEADING.get(t, "")))]
        if links:
            d["meta"]["depends"] = "[" + ", ".join(f'"[[{l}]]"' for l in dict.fromkeys(links)) + "]"
        if d["meta"].get("status") == "defensible":
            dates = re.findall(r"\d{4}-\d{2}-\d{2}", d["meta"].get("interviewed", ""))
            if dates:
                d["meta"]["reviewed"] = max(dates)
    return docs


def place_a(d):
    return {"note": lambda: TYPE_FOLDER[d["meta"]["type"]], "stub": lambda: TYPE_FOLDER[d["meta"]["type"]],
            "queue": lambda: "queue", "map": lambda: "maps", "interview": lambda: "interviews",
            "study": lambda: f"study/{d.get('topic')}", "template": lambda: "templates"}[d["kind"]]()


def place_b(d):
    if d["kind"] in ("stub", "queue"):
        return "1 To learn"
    if d["kind"] == "note":
        return "3 Defensible" if d["meta"].get("status") == "defensible" else "2 Drafts"
    return {"map": "Maps", "interview": "_cairn/interviews", "study": f"_cairn/study/{d.get('topic')}",
            "template": "_cairn/templates"}[d["kind"]]


def place_c(d):
    return {"note": "notes", "stub": "notes", "queue": "questions", "map": "maps",
            "interview": "_cairn/interviews", "study": f"_cairn/study/{d.get('topic')}",
            "template": "_cairn/templates"}[d["kind"]]


EXCLUDE_TEMPLATES = """filters:
  not:
    - file.inFolder("templates")
    - file.inFolder("_cairn/templates")
"""

REVIEW_BASE = EXCLUDE_TEMPLATES + """formulas:
  mentions: file.backlinks.length
properties:
  formula.mentions:
    displayName: Mentioned by
  note.reviewed:
    displayName: Last read-back
views:
  - type: table
    name: Next read-back
    limit: 1
    filters:
      and:
        - 'status == "defensible"'
    order: [file.name, note.type, note.reviewed]
    sort:
      - property: note.reviewed
        direction: ASC
  - type: table
    name: Read back next
    filters:
      and:
        - 'status == "defensible"'
    order: [file.name, note.type, note.company, note.reviewed, note.interviewed]
    sort:
      - property: note.reviewed
        direction: ASC
  - type: table
    name: Drafts
    filters:
      and:
        - 'status == "draft"'
    order: [file.name, note.type, note.company, note.interviewed]
  - type: table
    name: Not written yet
    filters:
      and:
        - 'status == "stub"'
    order: [file.name, note.type, note.company, formula.mentions]
    sort:
      - property: formula.mentions
        direction: DESC
  - type: table
    name: Open questions
    filters:
      and:
        - 'type == "queue"'
        - 'status == "open"'
    order: [file.name, note.company, note.opened]
    sort:
      - property: note.opened
        direction: ASC
"""

BOARD_BASE = """filters:
  or:
    - file.inFolder("1 To learn")
    - file.inFolder("2 Drafts")
    - file.inFolder("3 Defensible")
formulas:
  mentions: file.backlinks.length
properties:
  formula.mentions:
    displayName: Mentioned by
views:
  - type: table
    name: Pipeline
    groupBy:
      property: file.folder
      direction: ASC
    order: [file.name, note.type, note.status, note.company, formula.mentions, note.reviewed]
  - type: cards
    name: To learn
    filters:
      and:
        - file.inFolder("1 To learn")
    order: [file.name, note.type, note.status, formula.mentions]
  - type: cards
    name: Drafts
    filters:
      and:
        - file.inFolder("2 Drafts")
    order: [file.name, note.type, note.interviewed]
  - type: cards
    name: Defensible
    filters:
      and:
        - file.inFolder("3 Defensible")
    order: [file.name, note.type, note.reviewed]
    sort:
      - property: note.reviewed
        direction: ASC
"""


def maps_list(docs):
    return "\n".join(f"- [[{d['slug']}|{title_of(d['body'], d['slug'])}]]" for d in docs if d["kind"] == "map")


def extras_a(docs, company):
    return {
        "Review.base": REVIEW_BASE,
        "Home.md": f"""# Brain

Grey dots in the graph are topics a note mentions that nobody has written yet.

## Read back next
![[Review.base#Read back next]]

## Drafts
![[Review.base#Drafts]]

## Not written yet
![[Review.base#Not written yet]]

## Open questions
![[Review.base#Open questions]]

## Maps
{maps_list(docs)}
""",
    }


def extras_b(docs, company):
    return {
        "_cairn/Board.base": BOARD_BASE,
        "Home.md": f"""# Brain

A topic's folder is how well you know it: `1 To learn`, then `2 Drafts` after its interview, then
`3 Defensible`. Cairn moves the file; links follow it.

![[Board.base#Pipeline]]

## Maps
{maps_list(docs)}
""",
    }


def extras_c(docs, company):
    slugs = {d["slug"]: d for d in docs if d["kind"] in ("note", "stub")}
    out, area_links, used = {}, [], set()

    def map_file(name, members, comp=""):
        lines = [f"- [[{s}|{title_of(slugs[s]['body'], s)}]]" for s in members]
        meta = {"type": "map", "company": comp}
        out[f"maps/{slugify(name)}.md"] = render(meta, f"# {name}\n\n" + "\n".join(lines) + "\n")
        area_links.append(f"- [[{slugify(name)}|{name}]]")

    for name, members in AREAS.items():
        members = [s for s in members if s in slugs and not slugs[s]["meta"].get("company")]
        used.update(members)
        if members:
            map_file(name, members)
    comp = [s for s, d in slugs.items() if d["meta"].get("company")]
    rest = [s for s in slugs if s not in used and s not in comp]
    if rest:
        map_file("Unsorted", rest)
    if company and comp:
        map_file(company, comp, company)
        area_links[-1] += " (company)"
    out["_cairn/Review.base"] = REVIEW_BASE
    out["Review.md"] = """# Review

## Today's read-back
![[Review.base#Next read-back]]

## Not written yet, most mentioned first
![[Review.base#Not written yet]]

## Drafts
![[Review.base#Drafts]]

## Open questions
![[Review.base#Open questions]]
"""
    out["Home.md"] = "# Brain\n\n[[Review|Review your notes]]\n\n## Areas\n" + "\n".join(area_links) + \
        "\n\n## Other maps\n" + maps_list(docs) + "\n"
    return out


def obsidian_config(vault, templates_folder):
    cfg = vault / ".obsidian"
    cfg.mkdir(parents=True)
    shutil.copy(SRC / ".obsidian/core-plugins.json", cfg / "core-plugins.json")
    color = lambda q, rgb: {"query": q, "color": {"a": 1, "rgb": rgb}}
    files = {
        "app.json": {"alwaysUpdateLinks": True, "useMarkdownLinks": False, "newLinkFormat": "shortest"},
        "templates.json": {"folder": templates_folder},
        "backlink.json": {"backlinkInDocument": True},
        "graph.json": {"search": "-path:templates -path:_cairn", "showTags": False, "showOrphans": True,
                       "colorGroups": [color("[status:stub]", 0x9E9E9E), color("[status:draft]", 0xF0A030),
                                       color("[status:defensible]", 0x3FA34D), color("[type:queue]", 0x5B8DEF)]},
    }
    for name, data in files.items():
        (cfg / name).write_text(json.dumps(data, indent=2) + "\n")


def build():
    m = re.search(r'^company\s*=\s*"([^"]*)"', (SRC / "cairn.toml").read_text(), re.M)
    company = m.group(1) if m else ""
    docs, templates = load()
    docs = fix(docs, templates, company)
    if OUT.exists():
        shutil.rmtree(OUT)
    variants = [("A-type-folders", place_a, extras_a, "templates"),
                ("B-lifecycle", place_b, extras_b, "_cairn/templates"),
                ("C-flat-maps", place_c, extras_c, "_cairn/templates")]
    for name, place, extras, tfolder in variants:
        vault = OUT / name
        for d in docs:
            path = vault / place(d) / f"{d['slug']}.md"
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(render(d["meta"], d["body"]))
        for rel, text in extras(docs, company).items():
            (vault / rel).parent.mkdir(parents=True, exist_ok=True)
            (vault / rel).write_text(text)
        obsidian_config(vault, tfolder)
        print(f"{vault}  ({sum(1 for _ in vault.rglob('*.md'))} md files)")


if __name__ == "__main__":
    build()
