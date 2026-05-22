from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Result, User
from auth_utils import get_current_user
from io import BytesIO
import os

router = APIRouter(prefix="/report", tags=["Report"])


@router.get("/my-result")
def get_my_result(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = db.query(Result).filter(Result.user_id == current_user.id).first()
    if not result:
        raise HTTPException(status_code=404, detail="No result found. Please complete the test first.")

    return {
        "user": {
            "name":          current_user.name,
            "email":         current_user.email,
            "school":        current_user.school,
            "student_class": current_user.student_class,
            "father_name":   current_user.father_name,
            "mother_name":   current_user.mother_name,
        },
        "intelligence": {
            "logical_mathematical": round(result.logical_mathematical, 2),
            "interpersonal":        round(result.interpersonal, 2),
            "bodily_kinesthetic":   round(result.bodily_kinesthetic, 2),
            "verbal_linguistic":    round(result.verbal_linguistic, 2),
            "musical":              round(result.musical, 2),
            "naturalist":           round(result.naturalist, 2),
            "spatial_visual":       round(result.spatial_visual, 2),
            "intrapersonal":        round(result.intrapersonal, 2),
        },
        "riasec": {
            "realistic":     round(result.riasec_realistic, 2),
            "investigative": round(result.riasec_investigative, 2),
            "artistic":      round(result.riasec_artistic, 2),
            "social":        round(result.riasec_social, 2),
            "enterprising":  round(result.riasec_enterprising, 2),
            "conventional":  round(result.riasec_conventional, 2),
        },
        "top_career":   result.top_career,
        "completed_at": str(result.completed_at) if result.completed_at else "",
    }


@router.get("/has-result")
def has_result(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = db.query(Result).filter(Result.user_id == current_user.id).first()
    return {"has_result": result is not None}


@router.get("/download-pdf")
def download_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = db.query(Result).filter(Result.user_id == current_user.id).first()
    if not result:
        raise HTTPException(status_code=404, detail="No result found.")

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.units import mm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
        from reportlab.platypus import Image as RLImage
    except ImportError:
        raise HTTPException(status_code=500, detail="reportlab not installed. Run: pip install reportlab")

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=20*mm, leftMargin=20*mm,
        topMargin=15*mm, bottomMargin=15*mm
    )

    # ── Colors ────────────────────────────────────────────────────────────────
    PRIMARY    = colors.HexColor("#667eea")
    SECONDARY  = colors.HexColor("#764ba2")
    DARK       = colors.HexColor("#1e293b")
    GRAY       = colors.HexColor("#64748b")
    LIGHT_GRAY = colors.HexColor("#f1f5f9")
    WHITE      = colors.white
    GREEN      = colors.HexColor("#10b981")
    ORANGE     = colors.HexColor("#f59e0b")
    RED        = colors.HexColor("#ef4444")
    BLUE       = colors.HexColor("#3b82f6")

    # ── Styles ────────────────────────────────────────────────────────────────
    title_style   = ParagraphStyle("title",   fontSize=18, fontName="Helvetica-Bold", textColor=WHITE,    alignment=TA_CENTER)
    subtitle_style= ParagraphStyle("sub",     fontSize=10, fontName="Helvetica",      textColor=colors.HexColor("#e2e8f0"), alignment=TA_CENTER)
    section_style = ParagraphStyle("section", fontSize=13, fontName="Helvetica-Bold", textColor=DARK,     spaceBefore=6, spaceAfter=4)
    label_style   = ParagraphStyle("label",   fontSize=10, fontName="Helvetica-Bold", textColor=DARK)
    value_style   = ParagraphStyle("value",   fontSize=10, fontName="Helvetica",      textColor=GRAY)
    small_style   = ParagraphStyle("small",   fontSize=9,  fontName="Helvetica",      textColor=GRAY)
    career_style  = ParagraphStyle("career",  fontSize=20, fontName="Helvetica-Bold", textColor=WHITE,    alignment=TA_CENTER, spaceAfter=4)
    career_sub    = ParagraphStyle("csub",    fontSize=10, fontName="Helvetica",      textColor=colors.HexColor("#e2e8f0"), alignment=TA_CENTER)
    right_style   = ParagraphStyle("right",   fontSize=10, fontName="Helvetica-Bold", textColor=DARK,     alignment=TA_RIGHT)

    story = []
    W = A4[0] - 40*mm  # usable width

    # ── HEADER ────────────────────────────────────────────────────────────────
    logo_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "frontend", "public", "logo.png"
    )

    if os.path.exists(logo_path):
        logo = RLImage(logo_path, width=38*mm, height=18*mm)
        header_data = [[logo, Paragraph("Psychometric Assessment Report", title_style), ""]]
        col_widths  = [42*mm, W - 84*mm, 42*mm]
    else:
        header_data = [[Paragraph("Knowletive", title_style), Paragraph("Psychometric Assessment Report", title_style)]]
        col_widths  = [W/2, W/2]

    header_table = Table(header_data, colWidths=col_widths)
    header_table.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,-1), PRIMARY),
        ("ALIGN",        (0,0), (-1,-1), "CENTER"),
        ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",   (0,0), (-1,-1), 14),
        ("BOTTOMPADDING",(0,0), (-1,-1), 14),
        ("LEFTPADDING",  (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 10),
    ]))
    story.append(header_table)

    # Tagline bar
    tag_table = Table([[Paragraph("Knowletive  |  Training Minds, Placing Talents", subtitle_style)]], colWidths=[W])
    tag_table.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,-1), SECONDARY),
        ("TOPPADDING",   (0,0), (-1,-1), 5),
        ("BOTTOMPADDING",(0,0), (-1,-1), 5),
    ]))
    story.append(tag_table)
    story.append(Spacer(1, 8*mm))

    # ── STUDENT INFO ──────────────────────────────────────────────────────────
    story.append(Paragraph("Student Information", section_style))
    story.append(HRFlowable(width=W, thickness=1, color=PRIMARY, spaceAfter=5))

    completed_str = result.completed_at.strftime("%d %B %Y") if result.completed_at else "—"

    info_rows = [
        [Paragraph("<b>Name</b>",          label_style), Paragraph(current_user.name          or "—", value_style),
         Paragraph("<b>Email</b>",         label_style), Paragraph(current_user.email         or "—", value_style)],
        [Paragraph("<b>School</b>",        label_style), Paragraph(current_user.school        or "—", value_style),
         Paragraph("<b>Class</b>",         label_style), Paragraph(current_user.student_class or "—", value_style)],
        [Paragraph("<b>Father's Name</b>", label_style), Paragraph(current_user.father_name   or "—", value_style),
         Paragraph("<b>Mother's Name</b>", label_style), Paragraph(current_user.mother_name   or "—", value_style)],
        [Paragraph("<b>Completed On</b>",  label_style), Paragraph(completed_str,                      value_style),
         "", ""],
    ]
    info_table = Table(info_rows, colWidths=[38*mm, 57*mm, 38*mm, 37*mm])
    info_table.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [WHITE, LIGHT_GRAY]),
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#e2e8f0")),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 8*mm))

    # ── CAREER BANNER ─────────────────────────────────────────────────────────
    career_rows = [
        [Paragraph("RECOMMENDED CAREER PATH", career_sub)],
        [Paragraph(result.top_career or "—", career_style)],
        [Paragraph("Based on your psychometric profile and RIASEC personality analysis", career_sub)],
    ]
    career_table = Table(career_rows, colWidths=[W])
    career_table.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,-1), PRIMARY),
        ("ALIGN",        (0,0), (-1,-1), "CENTER"),
        ("TOPPADDING",   (0,0), (-1,-1), 10),
        ("BOTTOMPADDING",(0,0), (-1,-1), 10),
    ]))
    story.append(career_table)
    story.append(Spacer(1, 8*mm))

    # ── INTELLIGENCE SCORES ───────────────────────────────────────────────────
    story.append(Paragraph("Multiple Intelligence Scores  (Gardner's Theory)", section_style))
    story.append(HRFlowable(width=W, thickness=1, color=PRIMARY, spaceAfter=5))

    intel_items = [
        ("Logical-Mathematical", result.logical_mathematical),
        ("Interpersonal",        result.interpersonal),
        ("Bodily-Kinesthetic",   result.bodily_kinesthetic),
        ("Verbal-Linguistic",    result.verbal_linguistic),
        ("Musical",              result.musical),
        ("Naturalist",           result.naturalist),
        ("Spatial-Visual",       result.spatial_visual),
        ("Intrapersonal",        result.intrapersonal),
    ]
    intel_items.sort(key=lambda x: x[1], reverse=True)

    def get_status(score):
        if score >= 75: return "Excellent",  GREEN
        if score >= 60: return "Very Good",  BLUE
        if score >= 45: return "Good",       ORANGE
        return               "Needs Work",  RED

    def bar_table(score, w=85):
        filled = max(1, int((score / 100) * w))
        empty  = w - filled
        bt = Table([["", ""]], colWidths=[filled*mm*0.38, empty*mm*0.38])
        bt.setStyle(TableStyle([
            ("BACKGROUND",   (0,0),(0,0), PRIMARY),
            ("BACKGROUND",   (1,0),(1,0), colors.HexColor("#e2e8f0")),
            ("TOPPADDING",   (0,0),(-1,-1), 4),
            ("BOTTOMPADDING",(0,0),(-1,-1), 4),
        ]))
        return bt

    # Header row
    intel_rows = [[
        Paragraph("<b>Intelligence Type</b>", label_style),
        Paragraph("<b>Score Bar</b>",          label_style),
        Paragraph("<b>Score</b>",              right_style),
        Paragraph("<b>Status</b>",             label_style),
    ]]
    for name, score in intel_items:
        slabel, scolor = get_status(score)
        intel_rows.append([
            Paragraph(name, value_style),
            bar_table(score),
            Paragraph(f"<b>{score:.0f}%</b>", right_style),
            Paragraph(f"<b>{slabel}</b>", ParagraphStyle("st", fontSize=9, fontName="Helvetica-Bold", textColor=scolor)),
        ])

    it = Table(intel_rows, colWidths=[48*mm, 72*mm, 18*mm, 32*mm])
    it.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  PRIMARY),
        ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, LIGHT_GRAY]),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#e2e8f0")),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(it)
    story.append(Spacer(1, 8*mm))

    # ── RIASEC SCORES ─────────────────────────────────────────────────────────
    story.append(Paragraph("RIASEC Personality Profile  (Holland's Theory)", section_style))
    story.append(HRFlowable(width=W, thickness=1, color=SECONDARY, spaceAfter=5))

    riasec_items = [
        ("Realistic",     "The Doers",      result.riasec_realistic),
        ("Investigative", "The Thinkers",   result.riasec_investigative),
        ("Artistic",      "The Creators",   result.riasec_artistic),
        ("Social",        "The Helpers",    result.riasec_social),
        ("Enterprising",  "The Persuaders", result.riasec_enterprising),
        ("Conventional",  "The Organizers", result.riasec_conventional),
    ]
    riasec_items.sort(key=lambda x: x[2], reverse=True)

    def get_riasec_status(score):
        if score > 80: return "Highly Dominant", colors.HexColor("#be185d")
        if score > 60: return "Dominant",        GREEN
        if score > 40: return "Avg Dominant",    ORANGE
        return               "Less Dominant",   GRAY

    riasec_rows = [[
        Paragraph("<b>Type</b>",        label_style),
        Paragraph("<b>Description</b>", label_style),
        Paragraph("<b>Score</b>",       right_style),
        Paragraph("<b>Status</b>",      label_style),
    ]]
    for name, desc, score in riasec_items:
        slabel, scolor = get_riasec_status(score)
        riasec_rows.append([
            Paragraph(f"<b>{name}</b>", label_style),
            Paragraph(desc,              value_style),
            Paragraph(f"<b>{score:.1f}%</b>", right_style),
            Paragraph(f"<b>{slabel}</b>", ParagraphStyle("rs", fontSize=9, fontName="Helvetica-Bold", textColor=scolor)),
        ])

    rt = Table(riasec_rows, colWidths=[38*mm, 68*mm, 22*mm, 42*mm])
    rt.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  SECONDARY),
        ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, LIGHT_GRAY]),
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#e2e8f0")),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(rt)
    story.append(Spacer(1, 10*mm))

    # ── FOOTER ────────────────────────────────────────────────────────────────
    footer_table = Table([[
        Paragraph("© Knowletive — Training Minds, Placing Talents", small_style),
        Paragraph("Confidential Psychometric Report", ParagraphStyle("fr", fontSize=9, fontName="Helvetica", textColor=GRAY, alignment=TA_RIGHT)),
    ]], colWidths=[W/2, W/2])
    footer_table.setStyle(TableStyle([
        ("TOPPADDING",  (0,0), (-1,-1), 8),
        ("LINEABOVE",   (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    story.append(footer_table)

    # ── Build ─────────────────────────────────────────────────────────────────
    doc.build(story)
    buffer.seek(0)

    safe_name = (current_user.name or "student").replace(" ", "_")
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=psychometric_report_{safe_name}.pdf"}
    )