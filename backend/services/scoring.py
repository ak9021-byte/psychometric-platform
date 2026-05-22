import json

# ── Career Map ─────────────────────────────────────────────────────────────
CAREER_MAP = {
    "logical_mathematical": ["Data Scientist / ML Engineer", "Chartered Accountant (CA)", "Financial Analyst / CFA", "Software Engineer", "Research Scientist (ISRO/DRDO)", "Actuary / Actuarial Science", "Business Analytics Specialist", "Economist / Policy Analyst"],
    "interpersonal":        ["HR / Talent Acquisition Manager", "School Teacher / Government Teacher", "Education Counselor / Career Counselor", "Corporate Trainer", "Hotel Manager / Hospitality Manager", "Public Relations Executive", "Social Worker / NGO Officer", "Sales & Marketing Manager"],
    "bodily_kinesthetic":   ["Sports Coach / Athletic Coach", "Physiotherapist / Sports Physiotherapist", "Fitness Trainer / Yoga Instructor", "Army / Navy / Air Force Officer", "Professional Sportsperson", "Dancer / Choreographer", "Surgeon / Orthopedic Specialist", "Cabin Crew / Air Hostess"],
    "verbal_linguistic":    ["Journalist / Reporter / News Anchor", "Lawyer / Advocate / Corporate Lawyer", "Content Writer / Copywriter", "IAS / IPS / Civil Services Officer (UPSC)", "Author / Novelist / Content Creator", "Public Relations Manager", "Translator / Interpreter", "RJ / Podcast Host"],
    "musical":              ["Music Producer / Sound Engineer", "Playback Singer / Music Artist", "Film Score Composer", "Music Teacher / Music Therapist", "DJ / Electronic Music Producer", "Film Director / Cinematographer", "Actor / Theatre Artist"],
    "naturalist":           ["Environmental / ESG Analyst", "Forest Officer (IFS)", "Veterinary Doctor", "Agricultural Scientist / Agronomist", "Marine Biologist / Oceanographer", "Wildlife Photographer", "Horticulturist / Landscape Designer", "Geologist / Earth Scientist"],
    "spatial_visual":       ["Graphic Designer / UI Designer", "Architect / Urban Planner", "Interior Designer", "UX Researcher / UX-UI Designer", "Animator / VFX Artist / Game Artist", "Fashion Designer / Textile Designer", "Photographer / Videographer", "Illustrator / Cartoonist"],
    "intrapersonal":        ["Clinical Psychologist / Counseling Psychologist", "Life Coach / Mental Health Coach", "Entrepreneur / Startup Founder", "Research Scholar / PhD Academic", "Career Counselor / School Counselor", "Instructional Designer", "Public Policy Analyst", "Social Entrepreneur / Consultant"],
    "riasec_social":        ["MBBS Doctor / General Physician", "Nurse / Staff Nurse", "School Teacher / College Professor", "Social Worker / Community Development Officer", "NGO Professional / CSR Executive", "Pediatrician / Child Specialist", "Welfare Officer / Government Social Worker"],
    "riasec_enterprising":  ["Entrepreneur / Startup Founder", "Management Consultant (MBA)", "Sales Director / Business Development Manager", "CEO / Managing Director", "Stock Broker / Investment Advisor", "Real Estate Developer", "IAS / IPS / Civil Services Officer", "E-Commerce Entrepreneur"],
    "riasec_investigative": ["Data Scientist / ML Engineer", "Research Scientist / PhD Researcher", "Cybersecurity Analyst / Ethical Hacker", "Forensic Scientist / Crime Analyst", "Biotechnologist / Genetic Engineer", "Financial Analyst / CFA", "Pharmacist / Clinical Researcher", "AI & ML Specialist"],
    "riasec_realistic":     ["Civil / Mechanical / Electrical Engineer", "Commercial Pilot / Air Traffic Controller", "Army / Defence Officer (NDA/CDS)", "Automobile Engineer / EV Specialist", "Aeronautical Engineer", "Robotics & Automation Engineer", "Drone Technology Specialist", "Merchant Navy / Deck Officer"],
    "riasec_artistic":      ["Film Director / Assistant Director", "Graphic Designer / Brand Designer", "Fashion Designer / Costume Designer", "Actor / Theatre Artist", "Advertising Creative Director", "UX/UI Designer / Product Designer", "Animator / VFX Artist", "Screenwriter / Script Writer"],
    "riasec_conventional":  ["Chartered Accountant (CA)", "Company Secretary (CS)", "Bank PO / Bank Manager", "Cost & Management Accountant (CMA)", "Tax Consultant / GST Practitioner", "Compliance Officer / Legal Advisor", "RBI / SEBI / NABARD Officer", "Government Clerk / Administrative Officer"],
}

# ── Multi-trait career profiles (fixes oversimplified single-trait mapping) ─
CAREER_PROFILES = [
    {"title": "Data Scientist / ML Engineer",        "weights": {"logical_mathematical": 0.40, "riasec_investigative": 0.30, "spatial_visual": 0.15, "intrapersonal": 0.15}},
    {"title": "Software Engineer",                   "weights": {"logical_mathematical": 0.45, "riasec_investigative": 0.25, "riasec_conventional": 0.15, "spatial_visual": 0.15}},
    {"title": "Chartered Accountant (CA)",           "weights": {"logical_mathematical": 0.40, "riasec_conventional": 0.35, "intrapersonal": 0.15, "riasec_enterprising": 0.10}},
    {"title": "Doctor / General Physician",          "weights": {"riasec_investigative": 0.35, "riasec_social": 0.30, "logical_mathematical": 0.20, "interpersonal": 0.15}},
    {"title": "Lawyer / Advocate",                   "weights": {"verbal_linguistic": 0.35, "riasec_enterprising": 0.25, "logical_mathematical": 0.20, "interpersonal": 0.20}},
    {"title": "Journalist / News Anchor",            "weights": {"verbal_linguistic": 0.40, "interpersonal": 0.25, "riasec_artistic": 0.20, "riasec_investigative": 0.15}},
    {"title": "Entrepreneur / Startup Founder",      "weights": {"riasec_enterprising": 0.35, "intrapersonal": 0.25, "interpersonal": 0.20, "logical_mathematical": 0.20}},
    {"title": "Psychologist / Counselor",            "weights": {"intrapersonal": 0.35, "riasec_social": 0.30, "interpersonal": 0.25, "verbal_linguistic": 0.10}},
    {"title": "Architect / Urban Planner",           "weights": {"spatial_visual": 0.40, "riasec_realistic": 0.25, "logical_mathematical": 0.20, "riasec_artistic": 0.15}},
    {"title": "Graphic Designer / UI-UX Designer",   "weights": {"spatial_visual": 0.40, "riasec_artistic": 0.35, "intrapersonal": 0.15, "logical_mathematical": 0.10}},
    {"title": "Film Director / Cinematographer",     "weights": {"riasec_artistic": 0.35, "riasec_enterprising": 0.25, "spatial_visual": 0.20, "interpersonal": 0.20}},
    {"title": "Sports Coach / Athlete",              "weights": {"bodily_kinesthetic": 0.45, "riasec_realistic": 0.25, "interpersonal": 0.20, "intrapersonal": 0.10}},
    {"title": "Army / Defence Officer",              "weights": {"riasec_realistic": 0.35, "bodily_kinesthetic": 0.30, "riasec_enterprising": 0.20, "intrapersonal": 0.15}},
    {"title": "HR Manager / Corporate Trainer",      "weights": {"interpersonal": 0.40, "riasec_social": 0.25, "verbal_linguistic": 0.20, "riasec_enterprising": 0.15}},
    {"title": "Teacher / Professor",                 "weights": {"riasec_social": 0.35, "verbal_linguistic": 0.30, "interpersonal": 0.25, "intrapersonal": 0.10}},
    {"title": "Civil Engineer",                      "weights": {"riasec_realistic": 0.35, "logical_mathematical": 0.30, "spatial_visual": 0.25, "riasec_conventional": 0.10}},
    {"title": "Music Producer / Sound Engineer",     "weights": {"musical": 0.45, "riasec_artistic": 0.25, "spatial_visual": 0.15, "logical_mathematical": 0.15}},
    {"title": "Environmental Scientist / ESG Analyst","weights": {"naturalist": 0.40, "riasec_investigative": 0.30, "logical_mathematical": 0.20, "riasec_realistic": 0.10}},
    {"title": "IAS / IPS Officer (Civil Services)",  "weights": {"verbal_linguistic": 0.30, "riasec_enterprising": 0.25, "logical_mathematical": 0.25, "intrapersonal": 0.20}},
    {"title": "Fashion Designer",                    "weights": {"riasec_artistic": 0.40, "spatial_visual": 0.30, "interpersonal": 0.15, "riasec_enterprising": 0.15}},
    {"title": "Pilot / Aviation Officer",            "weights": {"riasec_realistic": 0.40, "logical_mathematical": 0.30, "spatial_visual": 0.20, "intrapersonal": 0.10}},
    {"title": "Bank PO / Finance Officer",           "weights": {"riasec_conventional": 0.35, "logical_mathematical": 0.35, "interpersonal": 0.15, "riasec_enterprising": 0.15}},
    {"title": "Veterinary Doctor",                   "weights": {"naturalist": 0.40, "riasec_investigative": 0.25, "riasec_social": 0.25, "bodily_kinesthetic": 0.10}},
    {"title": "Content Writer / Author",             "weights": {"verbal_linguistic": 0.45, "riasec_artistic": 0.25, "intrapersonal": 0.20, "riasec_investigative": 0.10}},
    {"title": "Cybersecurity / Ethical Hacker",      "weights": {"riasec_investigative": 0.40, "logical_mathematical": 0.35, "intrapersonal": 0.15, "riasec_realistic": 0.10}},
]


def normalize_scores(raw_scores: dict) -> dict:
    """
    Z-score normalization — fixes the clustered scores problem.
    Spreads scores to show clear differentiation between strong and weak traits.
    """
    values = list(raw_scores.values())
    if not values:
        return raw_scores

    mean    = sum(values) / len(values)
    variance= sum((v - mean) ** 2 for v in values) / len(values)
    std_dev = variance ** 0.5

    if std_dev == 0:
        return {k: 50.0 for k in raw_scores}

    normalized = {}
    for cat, score in raw_scores.items():
        z      = (score - mean) / std_dev
        scaled = max(0, min(100, (z + 3) / 6 * 100))
        normalized[cat] = round(scaled, 2)

    return normalized


def calculate_career_confidence(career_profile: dict, normalized_scores: dict) -> float:
    """Multi-trait weighted career matching — fixes oversimplified single-trait mapping."""
    score = 0.0
    for trait, weight in career_profile["weights"].items():
        score += normalized_scores.get(trait, 0) * weight
    return round(score, 2)


def calculate_scores(answers: list, questions: list) -> dict:
    """
    Improved scoring engine:
    1. Raw score per category
    2. Z-score normalization
    3. Multi-trait weighted career matching
    4. Confidence scores for top 5 careers
    5. Personality clarity and trait variance
    """

    # ── Step 1: Raw scores ─────────────────────────────────────────────────
    category_points = {cat: [] for cat in CAREER_MAP}
    q_map = {q.id: q for q in questions}

    for answer in answers:
        q = q_map.get(answer["question_id"])
        if not q or not q.score_map:
            continue
        try:
            score_map = json.loads(q.score_map)
            points    = score_map.get(answer["selected_option"], 0)
            cat       = q.category
            if cat in category_points:
                category_points[cat].append(points)
        except Exception:
            continue

    raw_scores = {}
    for cat, points in category_points.items():
        if points:
            raw_scores[cat] = round((sum(points) / (len(points) * 4)) * 100, 2)
        else:
            raw_scores[cat] = 0.0

    # ── Step 2: Z-score normalization ──────────────────────────────────────
    normalized_scores = normalize_scores(raw_scores)

    # ── Step 3: Multi-trait weighted career matching ───────────────────────
    career_matches = []
    for career in CAREER_PROFILES:
        confidence = calculate_career_confidence(career, normalized_scores)
        career_matches.append({"title": career["title"], "confidence": confidence})

    career_matches.sort(key=lambda x: x["confidence"], reverse=True)

    # ── Step 4: Top 5 with display confidence % ────────────────────────────
    top_5 = career_matches[:5]
    max_conf  = top_5[0]["confidence"]  if top_5 else 100
    min_conf  = top_5[-1]["confidence"] if top_5 else 0
    conf_range = max_conf - min_conf if max_conf != min_conf else 1

    top_5_display = []
    for c in top_5:
        display_conf = round(60 + ((c["confidence"] - min_conf) / conf_range) * 35, 1)
        top_5_display.append({"title": c["title"], "confidence": min(99, display_conf)})

    # ── Step 5: Personality clarity and trait variance ─────────────────────
    norm_values   = list(normalized_scores.values())
    trait_variance = round(max(norm_values) - min(norm_values), 2) if norm_values else 0

    personality_clarity = (
        "Strongly Defined"   if trait_variance > 60 else
        "Moderately Defined" if trait_variance > 30 else
        "Still Forming"
    )

    # ── Step 6: Build final result ─────────────────────────────────────────
    top_career = top_5_display[0]["title"] if top_5_display else "Undecided"

    result = {}
    result.update(raw_scores)
    result["top_career"]          = top_career
    result["top_5_careers"]       = top_5_display
    result["personality_clarity"] = personality_clarity
    result["trait_variance"]       = trait_variance

    return result