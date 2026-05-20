def generate_pdf(user, result) -> bytes:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.units import cm
    import io

    buffer = io.BytesIO()
    doc    = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story  = []

    # Title
    title_style = ParagraphStyle("title", parent=styles["Title"], fontSize=22, textColor=colors.HexColor("#1e3a5f"), spaceAfter=6)
    story.append(Paragraph("IQ & Psychometric Report", title_style))
    story.append(Spacer(1, 0.3*cm))

    # Student info
    info_style = ParagraphStyle("info", parent=styles["Normal"], fontSize=11, spaceAfter=4)
    story.append(Paragraph(f"<b>Name:</b> {user.name}", info_style))
    story.append(Paragraph(f"<b>Email:</b> {user.email}", info_style))
    story.append(Paragraph(f"<b>School:</b> {user.school or 'N/A'}", info_style))
    story.append(Paragraph(f"<b>Class:</b> {user.student_class or 'N/A'}", info_style))
    story.append(Paragraph(f"<b>Father's Name:</b> {user.father_name or 'N/A'}", info_style))
    story.append(Spacer(1, 0.5*cm))

    # Top career highlight
    career_style = ParagraphStyle("career", parent=styles["Normal"], fontSize=14, textColor=colors.white, backColor=colors.HexColor("#1e3a5f"), spaceAfter=12, spaceBefore=6, leftIndent=10)
    story.append(Paragraph(f"Recommended Career: {result.top_career}", career_style))
    story.append(Spacer(1, 0.4*cm))

    # Intelligence scores table
    heading_style = ParagraphStyle("heading", parent=styles["Heading2"], fontSize=13, textColor=colors.HexColor("#1e3a5f"), spaceAfter=6)
    story.append(Paragraph("Multiple Intelligences (Gardner)", heading_style))

    intel_data = [
        ["Intelligence Type", "Score (%)", "Status"],
        ["Logical-Mathematical", f"{result.logical_mathematical:.1f}%", _status(result.logical_mathematical)],
        ["Interpersonal",        f"{result.interpersonal:.1f}%",        _status(result.interpersonal)],
        ["Bodily-Kinesthetic",   f"{result.bodily_kinesthetic:.1f}%",   _status(result.bodily_kinesthetic)],
        ["Verbal-Linguistic",    f"{result.verbal_linguistic:.1f}%",    _status(result.verbal_linguistic)],
        ["Musical",              f"{result.musical:.1f}%",              _status(result.musical)],
        ["Naturalist",           f"{result.naturalist:.1f}%",           _status(result.naturalist)],
        ["Spatial-Visual",       f"{result.spatial_visual:.1f}%",       _status(result.spatial_visual)],
        ["Intrapersonal",        f"{result.intrapersonal:.1f}%",        _status(result.intrapersonal)],
    ]
    story.append(_make_table(intel_data))
    story.append(Spacer(1, 0.5*cm))

    # RIASEC scores table
    story.append(Paragraph("RIASEC Personality Profile", heading_style))
    riasec_data = [
        ["Personality Type",  "Score", "Dominance"],
        ["Realistic",         f"{result.riasec_realistic:.1f}",     _riasec_level(result.riasec_realistic)],
        ["Investigative",     f"{result.riasec_investigative:.1f}", _riasec_level(result.riasec_investigative)],
        ["Artistic",          f"{result.riasec_artistic:.1f}",      _riasec_level(result.riasec_artistic)],
        ["Social",            f"{result.riasec_social:.1f}",        _riasec_level(result.riasec_social)],
        ["Enterprising",      f"{result.riasec_enterprising:.1f}",  _riasec_level(result.riasec_enterprising)],
        ["Conventional",      f"{result.riasec_conventional:.1f}",  _riasec_level(result.riasec_conventional)],
    ]
    story.append(_make_table(riasec_data))
    story.append(Spacer(1, 0.5*cm))

    story.append(Paragraph("This report is generated automatically based on your psychometric assessment.", styles["Italic"]))
    doc.build(story)
    buffer.seek(0)
    return buffer.read()


def _status(score: float) -> str:
    if score >= 75: return "Excellent"
    if score >= 60: return "Very Good"
    if score >= 45: return "Good"
    return "Needs Attention"

def _riasec_level(score: float) -> str:
    if score >= 80: return "Highly Dominant"
    if score >= 60: return "Dominant"
    if score >= 40: return "Average"
    return "Less Dominant"

def _make_table(data):
    from reportlab.platypus import Table, TableStyle
    from reportlab.lib import colors
    t = Table(data, colWidths=[7*cm, 3.5*cm, 4*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",  (0, 0), (-1, 0), colors.HexColor("#1e3a5f")),
        ("TEXTCOLOR",   (0, 0), (-1, 0), colors.white),
        ("FONTNAME",    (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",    (0, 0), (-1, 0), 11),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f0f4f8"), colors.white]),
        ("FONTSIZE",    (0, 1), (-1, -1), 10),
        ("GRID",        (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("ALIGN",       (1, 0), (-1, -1), "CENTER"),
        ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING",  (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t