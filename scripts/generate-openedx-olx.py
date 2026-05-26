#!/usr/bin/env python3
"""
generate-openedx-olx.py
=======================
Converts exports/education-course-details.json → Open edX OLX course archives.

One .tar.gz is generated per course in exports/olx/
Each archive can be imported directly in Open edX Studio:
  Tools → Import → Upload a Course Export File

Open edX OLX hierarchy (what this script builds):
  Course → Chapter (our "section") → Sequential (our "lesson")
         → Vertical (one per lesson, holds all XBlocks)
         → HTML XBlock (learning objectives, content sections, safety footer,
                        evidence references, interactive-component description)
         → Problem XBlock (CAPA multiple-choice for each quiz question)

Usage:
  python3 scripts/generate-openedx-olx.py [--org JourneyLite] [--run 2026]

Outputs: exports/olx/<course-slug>.tar.gz
"""

import argparse
import json
import os
import re
import sys
import tarfile
import tempfile
import textwrap
from html import escape
from pathlib import Path

# ─── Config ───────────────────────────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).parent.parent
EXPORT_FILE  = PROJECT_ROOT / "exports" / "education-course-details.json"
OUTPUT_DIR   = PROJECT_ROOT / "exports" / "olx"

# ─── Helpers ─────────────────────────────────────────────────────────────────

def slugify(s: str, max_len: int = 64) -> str:
    """Convert a string to a safe OLX url_name."""
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    return s[:max_len] or "item"


def xml_attr(s: str) -> str:
    """Escape a value for use in an XML attribute."""
    return escape(str(s), quote=True)


def html_paragraphs(lines: list[str]) -> str:
    """Wrap each non-empty string in a <p> tag."""
    return "\n".join(f"<p>{escape(line)}</p>" for line in lines if line.strip())


def write_file(base_dir: Path, rel_path: str, content: str) -> None:
    target = base_dir / rel_path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")


# ─── XBlock builders ─────────────────────────────────────────────────────────

def build_html_xblock(
    base_dir: Path,
    url_name: str,
    display_name: str,
    html_body: str,
) -> str:
    """Write html/<url_name>.xml + html/<url_name>.html; return vertical ref."""
    # XML pointer
    xml = textwrap.dedent(f"""\
        <html url_name="{xml_attr(url_name)}"
              display_name="{xml_attr(display_name)}"
              filename="{xml_attr(url_name)}" />
        """)
    write_file(base_dir, f"html/{url_name}.xml", xml)

    # HTML file
    full_html = textwrap.dedent(f"""\
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>{escape(display_name)}</title></head>
        <body>
        {html_body}
        </body>
        </html>
        """)
    write_file(base_dir, f"html/{url_name}.html", full_html)
    return url_name


def build_problem_xblock(
    base_dir: Path,
    url_name: str,
    display_name: str,
    questions: list[dict],
    passing_score: int = 100,
    max_attempts: int = 3,
) -> str:
    """Build a CAPA problem XML for one or more multiple-choice questions."""
    parts = [
        textwrap.dedent(f"""\
            <problem display_name="{xml_attr(display_name)}"
                     max_attempts="{max_attempts}"
                     weight="1">
            """)
    ]

    for q in questions:
        q_text     = escape(q.get("question", "Question"))
        options    = q.get("options", [])
        correct_i  = q.get("correctIndex")
        feedback   = q.get("feedback", "")
        q_type     = q.get("questionType", "single_choice")

        resp_tag = "multiplechoiceresponse" if q_type in ("single_choice", "multiple_choice") else "multiplechoiceresponse"
        group_type = "MultipleChoice"

        choices_xml = ""
        for i, opt in enumerate(options):
            correct = "true" if i == correct_i else "false"
            choices_xml += f'      <choice correct="{correct}">{escape(str(opt))}</choice>\n'

        solution_xml = ""
        if feedback:
            solution_xml = textwrap.dedent(f"""\
                  <solution>
                    <div class="detailed-solution">
                      <p>{escape(feedback)}</p>
                    </div>
                  </solution>
                """)

        parts.append(textwrap.dedent(f"""\
              <{resp_tag}>
                <label>{q_text}</label>
                <choicegroup type="{group_type}">
            {choices_xml.rstrip()}
                </choicegroup>
            {solution_xml.rstrip()}
              </{resp_tag}>
            """))

    parts.append("</problem>\n")
    xml = "".join(parts)
    write_file(base_dir, f"problem/{url_name}.xml", xml)
    return url_name


# ─── Lesson builder ──────────────────────────────────────────────────────────

def build_lesson(
    base_dir: Path,
    course_slug: str,
    section_idx: int,
    lesson_idx: int,
    lesson: dict,
) -> str:
    """
    Build all XBlocks for one lesson and write sequential/<url_name>.xml.
    Returns the sequential's url_name.
    """
    lesson_slug   = lesson.get("slug") or slugify(lesson.get("title", f"lesson-{lesson_idx}"))
    lesson_key    = f"{slugify(course_slug, 24)}-{slugify(lesson_slug, 36)}"
    display_name  = lesson.get("title", "Lesson")
    xblock_refs: list[str] = []   # url_names of HTML / problem blocks in order

    # ── 1. Learning objectives ──────────────────────────────────────────────
    objectives = lesson.get("learningObjectives") or []
    if objectives:
        obj_html = "<h3>Learning Objectives</h3>\n<ul>\n" + \
                   "".join(f"  <li>{escape(o)}</li>\n" for o in objectives) + \
                   "</ul>\n"
        url = f"{lesson_key}-objectives"
        build_html_xblock(base_dir, url, "Learning Objectives", obj_html)
        xblock_refs.append(url)

    # ── 2. Content sections ─────────────────────────────────────────────────
    sections = lesson.get("contentSections") or []
    for ci, cs in enumerate(sections):
        heading = cs.get("heading") or "Content"
        body    = cs.get("body") or []
        cs_html = f"<h3>{escape(heading)}</h3>\n" + html_paragraphs(body)
        url     = f"{lesson_key}-content-{ci + 1}"
        build_html_xblock(base_dir, url, heading, cs_html)
        xblock_refs.append(url)

    # ── 3. Interactive component ────────────────────────────────────────────
    ic = lesson.get("interactiveComponent")
    if ic:
        ic_type  = ic.get("interactionType", "interactive")
        ic_title = ic.get("title") or ic_type
        ic_desc  = ic.get("description") or ""
        try:
            ic_config = json.loads(ic.get("config") or "{}")
        except (json.JSONDecodeError, TypeError):
            ic_config = {}

        ic_html = textwrap.dedent(f"""\
            <div class="activity-notice">
              <h3>Interactive Activity: {escape(ic_title)}</h3>
              <p><strong>Type:</strong> {escape(ic_type)}</p>
              {f'<p>{escape(ic_desc)}</p>' if ic_desc else ''}
              <p class="note"><em>This activity is configured in the JourneyLite
              patient portal. Students completing this course through the portal
              app will interact with the full activity widget.</em></p>
            </div>
            """)
        url = f"{lesson_key}-activity"
        build_html_xblock(base_dir, url, ic_title, ic_html)
        xblock_refs.append(url)

    # ── 4. Knowledge check / quiz ───────────────────────────────────────────
    quiz = lesson.get("quiz")
    if quiz:
        questions = quiz.get("questions") or []
        if questions:
            passing = quiz.get("passingScore", 100)
            max_att = 3 if passing >= 100 else 5
            url     = f"{lesson_key}-quiz"
            build_problem_xblock(
                base_dir,
                url,
                quiz.get("title") or "Knowledge Check",
                questions,
                passing_score=passing,
                max_attempts=max_att,
            )
            xblock_refs.append(url)

    # ── 5. Patient safety footer ────────────────────────────────────────────
    safety = lesson.get("patientSafetyFooter") or ""
    if safety:
        safety_html = textwrap.dedent(f"""\
            <aside class="patient-safety">
              <h4>Patient Safety</h4>
              <p>{escape(safety)}</p>
            </aside>
            """)
        url = f"{lesson_key}-safety"
        build_html_xblock(base_dir, url, "Patient Safety Note", safety_html)
        xblock_refs.append(url)

    # ── 6. Evidence references ──────────────────────────────────────────────
    refs = lesson.get("evidenceReferences") or []
    if refs:
        refs_html = "<h4>Evidence & References</h4>\n<ul>\n"
        for r in refs:
            label = escape(r.get("label", "Reference"))
            url_r = r.get("url") or ""
            use   = escape(r.get("use") or "")
            if url_r:
                refs_html += f'  <li><a href="{xml_attr(url_r)}" target="_blank">{label}</a>'
            else:
                refs_html += f"  <li>{label}"
            if use:
                refs_html += f" — {use}"
            refs_html += "</li>\n"
        refs_html += "</ul>\n"
        url = f"{lesson_key}-refs"
        build_html_xblock(base_dir, url, "References", refs_html)
        xblock_refs.append(url)

    # ── Vertical ────────────────────────────────────────────────────────────
    vertical_name = f"{lesson_key}-v"
    vertical_refs = "".join(
        f'  <html url_name="{xml_attr(ref)}" />\n'
        if not ref.endswith("-quiz")
        else f'  <problem url_name="{xml_attr(ref)}" />\n'
        for ref in xblock_refs
    )
    write_file(
        base_dir,
        f"vertical/{vertical_name}.xml",
        textwrap.dedent(f"""\
            <vertical display_name="{xml_attr(display_name)}">
            {vertical_refs.rstrip()}
            </vertical>
            """),
    )

    # ── Sequential (lesson) ─────────────────────────────────────────────────
    seq_name = lesson_key
    write_file(
        base_dir,
        f"sequential/{seq_name}.xml",
        textwrap.dedent(f"""\
            <sequential display_name="{xml_attr(display_name)}">
              <vertical url_name="{xml_attr(vertical_name)}" />
            </sequential>
            """),
    )

    return seq_name


# ─── Course builder ──────────────────────────────────────────────────────────

def build_course(course: dict, org: str, run: str, out_dir: Path) -> Path:
    raw_slug    = course.get("slug") or slugify(course.get("title", "course"))
    course_slug = slugify(raw_slug, 40)
    course_id   = raw_slug.upper().replace("-", "_")[:32]
    title       = course.get("title", "Course")
    summary     = course.get("courseSummary") or ""
    sections    = course.get("sections") or []

    with tempfile.TemporaryDirectory() as tmpdir:
        base = Path(tmpdir) / course_slug

        # ── root course.xml ─────────────────────────────────────────────────
        write_file(
            base,
            "course.xml",
            f'<course url_name="{xml_attr(run)}" org="{xml_attr(org)}" course="{xml_attr(course_id)}" />\n',
        )

        # ── about pages ─────────────────────────────────────────────────────
        write_file(base, "about/overview.html",
                   f"<section><h2>{escape(title)}</h2><p>{escape(summary)}</p></section>\n")
        write_file(base, "about/short_description.html",
                   f"<p>{escape(summary[:160])}</p>\n")

        # ── chapters (sections) ─────────────────────────────────────────────
        chapter_refs: list[tuple[str, str]] = []   # (url_name, display_name)

        for si, section in enumerate(sections):
            section_slug    = section.get("slug") or slugify(section.get("title", f"section-{si}"))
            chapter_name    = f"{course_slug}-ch-{si + 1}-{slugify(section_slug, 24)}"
            section_title   = section.get("title") or f"Section {si + 1}"
            lessons         = section.get("lessons") or []

            sequential_refs: list[str] = []
            for li, lesson in enumerate(lessons):
                seq_name = build_lesson(base, course_slug, si, li, lesson)
                sequential_refs.append(seq_name)

            chapter_xml = textwrap.dedent(f"""\
                <chapter display_name="{xml_attr(section_title)}">
                """)
            for sref in sequential_refs:
                chapter_xml += f'  <sequential url_name="{xml_attr(sref)}" />\n'
            chapter_xml += "</chapter>\n"

            write_file(base, f"chapter/{chapter_name}.xml", chapter_xml)
            chapter_refs.append((chapter_name, section_title))

        # ── main course definition ───────────────────────────────────────────
        course_xml = textwrap.dedent(f"""\
            <course display_name="{xml_attr(title)}"
                    org="{xml_attr(org)}"
                    course="{xml_attr(course_id)}"
                    run="{xml_attr(run)}"
                    start="2026-01-01T00:00:00Z"
                    enrollment_start="2026-01-01T00:00:00Z"
                    language="en">
            """)
        for cref, _ in chapter_refs:
            course_xml += f'  <chapter url_name="{xml_attr(cref)}" />\n'
        course_xml += "</course>\n"

        write_file(base, f"course/{run}.xml", course_xml)

        # ── pack into .tar.gz ────────────────────────────────────────────────
        out_path = out_dir / f"{course_slug}.tar.gz"
        with tarfile.open(out_path, "w:gz") as tar:
            tar.add(base, arcname=course_slug)

        print(f"  ✓ {out_path.name}  ({len(sections)} sections, "
              f"{sum(len(s.get('lessons', [])) for s in sections)} lessons)")
        return out_path


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate Open edX OLX archives from Sanity export.")
    parser.add_argument("--org",  default="JourneyLite", help="Open edX organization name (default: JourneyLite)")
    parser.add_argument("--run",  default="2026",        help="Course run identifier (default: 2026)")
    parser.add_argument("--input", default=str(EXPORT_FILE), help="Path to education-course-details.json")
    parser.add_argument("--output", default=str(OUTPUT_DIR), help="Output directory for .tar.gz files")
    args = parser.parse_args()

    input_path  = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        print(f"ERROR: input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    output_path.mkdir(parents=True, exist_ok=True)

    with open(input_path, encoding="utf-8") as f:
        data = json.load(f)

    courses = data.get("courses") or []
    if not courses:
        print("No courses found in export file.", file=sys.stderr)
        sys.exit(1)

    print(f"\nGenerating Open edX OLX archives")
    print(f"  org={args.org}  run={args.run}")
    print(f"  input:  {input_path}")
    print(f"  output: {output_path}")
    print(f"  courses: {len(courses)}\n")

    for course in courses:
        build_course(course, org=args.org, run=args.run, out_dir=output_path)

    print(f"\nDone. Import each .tar.gz in Open edX Studio:")
    print(f"  Studio → Course → Tools → Import → Upload a Course Export File\n")


if __name__ == "__main__":
    main()
