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
        "top_career":          result.top_career,
        "top_careers":         result.top_5_careers or [],   # ← renamed to top_careers for frontend
        "personality_clarity": result.personality_clarity or "Moderately Defined",
        "trait_variance":      result.trait_variance or 0,
        "completed_at":        str(result.completed_at) if result.completed_at else "",
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
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_RIGHT
        from reportlab.platypus import Image as RLImage
    except ImportError:
        raise HTTPException(status_code=500, detail="reportlab not installed.")

    buffer   = BytesIO()
    doc      = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=20*mm, leftMargin=20*mm, topMargin=15*mm, bottomMargin=15*mm)
    PRIMARY  = colors.HexColor("#667eea")
    SECONDARY= colors.HexColor("#764ba2")
    DARK     = colors.HexColor("#1e293b")
    GRAY     = colors.HexColor("#64748b")
    LGRAY    = colors.HexColor("#f1f5f9")
    WHITE    = colors.white
    GREEN    = colors.HexColor("#10b981")
    ORANGE   = colors.HexColor("#f59e0b")
    RED      = colors.HexColor("#ef4444")
    BLUE     = colors.HexColor("#3b82f6")

    title_s  = ParagraphStyle("t",  fontSize=18, fontName="Helvetica-Bold", textColor=WHITE,  alignment=TA_CENTER)
    sub_s    = ParagraphStyle("s",  fontSize=10, fontName="Helvetica",      textColor=colors.HexColor("#e2e8f0"), alignment=TA_CENTER)
    sec_s    = ParagraphStyle("se", fontSize=13, fontName="Helvetica-Bold", textColor=DARK,   spaceBefore=6, spaceAfter=4)
    lbl_s    = ParagraphStyle("l",  fontSize=10, fontName="Helvetica-Bold", textColor=DARK)
    val_s    = ParagraphStyle("v",  fontSize=10, fontName="Helvetica",      textColor=GRAY)
    sm_s     = ParagraphStyle("sm", fontSize=9,  fontName="Helvetica",      textColor=GRAY)
    car_s    = ParagraphStyle("c",  fontSize=18, fontName="Helvetica-Bold", textColor=WHITE,  alignment=TA_CENTER)
    rt_s     = ParagraphStyle("r",  fontSize=10, fontName="Helvetica-Bold", textColor=DARK,   alignment=TA_RIGHT)

    story = []
    W = A4[0] - 40*mm

    # ── Header ──────────────────────────────────────────────────────────────
    logo_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "logo.png")
    if os.path.exists(logo_path):
        logo = RLImage(logo_path, width=38*mm, height=18*mm)
        hd = Table([[logo, Paragraph("Psychometric Assessment Report", title_s), ""]], colWidths=[42*mm, W-84*mm, 42*mm])
    else:
        hd = Table([[Paragraph("Knowletive", title_s), Paragraph("Psychometric Assessment Report", title_s)]], colWidths=[W/2, W/2])
    hd.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), PRIMARY),
        ("ALIGN",      (0,0), (-1,-1), "CENTER"),
        ("VALIGN",     (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 14),
        ("BOTTOMPADDING", (0,0), (-1,-1), 14),
    ]))
    story.append(hd)

    tg = Table([[Paragraph("Knowletive  |  Training Minds, Placing Talents", sub_s)]], colWidths=[W])
    tg.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), SECONDARY),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ]))
    story.append(tg)
    story.append(Spacer(1, 8*mm))

    # ── Student Info ─────────────────────────────────────────────────────────
    story.append(Paragraph("Student Information", sec_s))
    story.append(HRFlowable(width=W, thickness=1, color=PRIMARY, spaceAfter=5))
    completed_str = result.completed_at.strftime("%d %B %Y") if result.completed_at else "—"
    info_rows = [
        [Paragraph("<b>Name</b>", lbl_s),         Paragraph(current_user.name or "—", val_s),
         Paragraph("<b>Email</b>", lbl_s),         Paragraph(current_user.email or "—", val_s)],
        [Paragraph("<b>School</b>", lbl_s),        Paragraph(current_user.school or "—", val_s),
         Paragraph("<b>Class</b>", lbl_s),         Paragraph(current_user.student_class or "—", val_s)],
        [Paragraph("<b>Father's Name</b>", lbl_s), Paragraph(current_user.father_name or "—", val_s),
         Paragraph("<b>Mother's Name</b>", lbl_s), Paragraph(current_user.mother_name or "—", val_s)],
        [Paragraph("<b>Completed On</b>", lbl_s),  Paragraph(completed_str, val_s), "", ""],
    ]
    it = Table(info_rows, colWidths=[38*mm, 57*mm, 38*mm, 37*mm])
    it.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [WHITE, LGRAY]),
        ("TOPPADDING",     (0,0), (-1,-1), 7),
        ("BOTTOMPADDING",  (0,0), (-1,-1), 7),
        ("LEFTPADDING",    (0,0), (-1,-1), 8),
        ("GRID",           (0,0), (-1,-1), 0.3, colors.HexColor("#e2e8f0")),
        ("VALIGN",         (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(it)
    story.append(Spacer(1, 8*mm))

    # ── Career Banner ────────────────────────────────────────────────────────
    career_rows = [
        [Paragraph("RECOMMENDED CAREER PATH", sub_s)],
        [Paragraph(result.top_career or "—", car_s)],
        [Paragraph(f"Personality: {result.personality_clarity or 'Moderately Defined'}", sub_s)],
    ]
    ct = Table(career_rows, colWidths=[W])
    ct.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), PRIMARY),
        ("ALIGN",         (0,0), (-1,-1), "CENTER"),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
    ]))
    story.append(ct)
    story.append(Spacer(1, 6*mm))

    # ── Top 5 Careers ────────────────────────────────────────────────────────
    # ✅ FIX: use "career" key (matches scoring service output)
    #         fallback to "title" for backward compatibility
    top5 = result.top_5_careers or []
    if top5:
        story.append(Paragraph("Top 5 Career Matches with Confidence Score", sec_s))
        story.append(HRFlowable(width=W, thickness=1, color=PRIMARY, spaceAfter=5))

        rank_labels = ["🥇 Best Fit", "🥈 Great Fit", "🥉 Strong Fit", "#4", "#5"]
        conf_rows = [[
            Paragraph("<b>Rank</b>",       lbl_s),
            Paragraph("<b>Career</b>",     lbl_s),
            Paragraph("<b>Confidence</b>", rt_s),
        ]]
        for i, c in enumerate(top5[:5]):
            # ✅ KEY FIX: "career" first, fallback to "title"
            career_name = c.get("career") or c.get("title") or "—"
            confidence  = c.get("confidence", 0)
            conf_rows.append([
                Paragraph(rank_labels[i] if i < len(rank_labels) else f"#{i+1}", val_s),
                Paragraph(career_name, val_s),
                Paragraph(f"<b>{float(confidence):.1f}%</b>", rt_s),
            ])

        conf_t = Table(conf_rows, colWidths=[28*mm, 117*mm, 25*mm])
        conf_t.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,0),  PRIMARY),
            ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
            ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, LGRAY]),
            ("TOPPADDING",    (0,0), (-1,-1), 8),
            ("BOTTOMPADDING", (0,0), (-1,-1), 8),
            ("LEFTPADDING",   (0,0), (-1,-1), 8),
            ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#e2e8f0")),
            ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
            # Highlight top career row
            ("BACKGROUND",    (0,1), (-1,1),  colors.HexColor("#667eea15")),
            ("FONTNAME",      (0,1), (-1,1),  "Helvetica-Bold"),
        ]))
        story.append(conf_t)
        story.append(Spacer(1, 6*mm))

    # ── Intelligence Scores ──────────────────────────────────────────────────
    story.append(Paragraph("Multiple Intelligence Scores  (Gardner's Theory)", sec_s))
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

    def get_status(s):
        if s >= 75: return "Excellent",  GREEN
        if s >= 60: return "Very Good",  BLUE
        if s >= 45: return "Good",       ORANGE
        return               "Needs Work", RED

    def bar_t(score):
        f = max(1, int((score / 100) * 85))
        e = 85 - f
        b = Table([["", ""]], colWidths=[f*mm*0.38, e*mm*0.38])
        b.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (0,0), PRIMARY),
            ("BACKGROUND",    (1,0), (1,0), colors.HexColor("#e2e8f0")),
            ("TOPPADDING",    (0,0), (-1,-1), 4),
            ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ]))
        return b

    intel_rows = [[
        Paragraph("<b>Intelligence Type</b>", lbl_s),
        Paragraph("<b>Score Bar</b>",         lbl_s),
        Paragraph("<b>Score</b>",             rt_s),
        Paragraph("<b>Status</b>",            lbl_s),
    ]]
    for name, score in intel_items:
        sl, sc = get_status(score)
        intel_rows.append([
            Paragraph(name, val_s),
            bar_t(score),
            Paragraph(f"<b>{score:.0f}%</b>", rt_s),
            Paragraph(f"<b>{sl}</b>", ParagraphStyle("st", fontSize=9, fontName="Helvetica-Bold", textColor=sc)),
        ])
    ilt = Table(intel_rows, colWidths=[48*mm, 72*mm, 18*mm, 32*mm])
    ilt.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  PRIMARY),
        ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, LGRAY]),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#e2e8f0")),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(ilt)
    story.append(Spacer(1, 6*mm))

    # ── RIASEC Scores ────────────────────────────────────────────────────────
    story.append(Paragraph("RIASEC Personality Profile  (Holland's Theory)", sec_s))
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

    def get_rs(s):
        if s > 80: return "Highly Dominant", colors.HexColor("#be185d")
        if s > 60: return "Dominant",        GREEN
        if s > 40: return "Avg Dominant",    ORANGE
        return               "Less Dominant",  GRAY

    riasec_rows = [[
        Paragraph("<b>Type</b>",        lbl_s),
        Paragraph("<b>Description</b>", lbl_s),
        Paragraph("<b>Score</b>",       rt_s),
        Paragraph("<b>Status</b>",      lbl_s),
    ]]
    for name, desc, score in riasec_items:
        sl, sc = get_rs(score)
        riasec_rows.append([
            Paragraph(f"<b>{name}</b>", lbl_s),
            Paragraph(desc, val_s),
            Paragraph(f"<b>{score:.1f}%</b>", rt_s),
            Paragraph(f"<b>{sl}</b>", ParagraphStyle("rs", fontSize=9, fontName="Helvetica-Bold", textColor=sc)),
        ])
    rt = Table(riasec_rows, colWidths=[38*mm, 68*mm, 22*mm, 42*mm])
    rt.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  SECONDARY),
        ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, LGRAY]),
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#e2e8f0")),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(rt)
    story.append(Spacer(1, 8*mm))

    # ── Footer ───────────────────────────────────────────────────────────────
    ft = Table([[
        Paragraph("© Knowletive — Training Minds, Placing Talents", sm_s),
        Paragraph("Confidential Psychometric Report", ParagraphStyle("fr", fontSize=9, fontName="Helvetica", textColor=GRAY, alignment=TA_RIGHT)),
    ]], colWidths=[W/2, W/2])
    ft.setStyle(TableStyle([
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("LINEABOVE",  (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    story.append(ft)

    # ✅ FIX: wrap doc.build in try/except so errors are visible, not silent
    try:
        doc.build(story)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

    buffer.seek(0)
    safe_name = (current_user.name or "student").replace(" ", "_")
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=psychometric_report_{safe_name}.pdf"},
    )