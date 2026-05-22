import json

# ── Career Map based on careers.xlsx ──────────────────────────────────────
# Each category maps to the most relevant career from the Excel database

CAREER_MAP = {
    # ── Intelligence-based ────────────────────────────────────────────────
    "logical_mathematical": [
        "Data Analyst / Business Intelligence Analyst",
        "Chartered Accountant (CA)",
        "Financial Analyst / CFA",
        "Actuary / Actuarial Science",
        "Software Engineer / Computer Programmer",
        "Research Scientist (ISRO / DRDO / BARC)",
        "Risk Analyst / Credit Analyst",
        "Business Analytics Specialist",
        "FinTech Specialist",
        "Economist / Policy Analyst",
    ],
    "interpersonal": [
        "HR / Talent Acquisition Manager",
        "School Teacher / Government Teacher (TET/CTET)",
        "Education Counselor / Career Counselor",
        "Corporate Trainer / Soft Skills Trainer",
        "Hotel Manager / Hospitality Manager",
        "Public Relations (PR) Executive",
        "Social Worker / NGO Officer",
        "Sales & Marketing Manager",
        "Event / Wedding Planner",
        "Customer Success Manager",
    ],
    "bodily_kinesthetic": [
        "Sports Coach / Athletic Coach",
        "Physiotherapist / Sports Physiotherapist",
        "Fitness / Personal Trainer / Yoga Instructor",
        "Army / Navy / Air Force Officer",
        "Professional Sportsperson (Cricket / Athletics / Football)",
        "Sports Manager / Sports Analyst",
        "Dancer / Choreographer",
        "Surgeon / Orthopedic Specialist",
        "Cabin Crew / Air Hostess",
        "Sports Science Professional",
    ],
    "verbal_linguistic": [
        "Journalist / Reporter / News Anchor",
        "Lawyer / Advocate / Corporate Lawyer",
        "Content Writer / Copywriter / UX Writer",
        "Script Writer / Screenwriter",
        "IAS / IPS / Civil Services Officer (UPSC)",
        "Public Relations Manager / Corporate Communications",
        "Author / Novelist / Content Creator",
        "Translator / Interpreter / Language Trainer",
        "RJ / Podcast Host / Media Presenter",
        "Legal Content Writer / Legal Researcher",
    ],
    "musical": [
        "Music Producer / Sound Engineer",
        "Playback Singer / Music Artist",
        "Film Score Composer / Background Score Creator",
        "Music Teacher / Music Therapist",
        "DJ / Electronic Music Producer",
        "RJ / Podcast Host (Music Focus)",
        "Actor / Theatre Artist (Performing Arts)",
        "Celebrity Manager / Talent Manager",
        "Music Director / A&R Executive",
        "Film Director / Cinematographer",
    ],
    "naturalist": [
        "Environmental / ESG Analyst / Sustainability Analyst",
        "Forest Officer (IFS) / Forest Guard / Ranger",
        "Veterinary Doctor / Animal Scientist",
        "Agricultural Scientist / Agronomist",
        "Marine Biologist / Oceanographer",
        "GIS Analyst / Geospatial Technology Specialist",
        "Wildlife Photographer / Documentary Maker",
        "Environmental Management Professional",
        "Forestry & Wildlife Conservation Officer",
        "Horticulturist / Landscape Designer",
    ],
    "spatial_visual": [
        "Graphic Designer / UI Designer / Motion Graphics Designer",
        "Architect / Urban Planner",
        "Interior Designer / Space Planner",
        "UX Researcher / UX/UI Designer",
        "Animator / VFX Artist / Game Artist",
        "Fashion Designer / Textile Designer",
        "Game Designer / Game Developer",
        "Photographer / Videographer / Cinematographer",
        "Illustrator / Cartoonist / Fine Artist",
        "VR / AR Designer (XR Technology)",
    ],
    "intrapersonal": [
        "Clinical Psychologist / Counseling Psychologist",
        "Life Coach / Mental Health Coach",
        "Entrepreneur / Startup Founder",
        "Organizational Psychologist / Behavioral Scientist",
        "Research Scholar / PhD Academic / College Professor",
        "Career Counselor / School Counselor",
        "Instructional Designer / Curriculum Designer",
        "Public Policy Analyst / Think Tank Researcher",
        "Child Psychologist / Sports Psychologist",
        "Social Entrepreneur / Consultant",
    ],

    # ── RIASEC-based ─────────────────────────────────────────────────────
    "riasec_social": [
        "MBBS Doctor / General Physician",
        "Nurse / Staff Nurse / Nursing Assistant",
        "School Teacher / College Professor",
        "Social Worker / Community Development Officer",
        "Counseling Psychologist / School Counselor",
        "Education Counselor / Career Counselor",
        "NGO Professional / CSR Executive",
        "Soft Skills Trainer / Corporate Trainer",
        "Pediatrician / Child Specialist",
        "Welfare Officer / Government Social Worker",
    ],
    "riasec_enterprising": [
        "Entrepreneur / Startup Founder / Business Owner",
        "Management Consultant (MBA - Top B-Schools)",
        "Sales Director / Business Development Manager",
        "CEO / Managing Director / General Manager",
        "Stock Broker / Investment Advisor / Trader",
        "Real Estate Developer / Property Consultant",
        "IAS / IPS / Civil Services Officer (UPSC)",
        "Political Analyst / Policy Assistant",
        "Luxury Brand Manager",
        "E-Commerce Entrepreneur / Dropshipping Business",
    ],
    "riasec_investigative": [
        "Data Scientist / Machine Learning Engineer",
        "Research Scientist / PhD Researcher",
        "Cybersecurity Analyst / Ethical Hacker",
        "Forensic Scientist / Crime Analyst",
        "Biotechnologist / Genetic Engineer",
        "Financial Analyst / CFA / Actuarial Science",
        "Pharmacist / Clinical Researcher",
        "AI & Machine Learning Specialist",
        "Business Intelligence Analyst",
        "Behavioral Scientist / Organizational Psychologist",
    ],
    "riasec_realistic": [
        "Civil / Mechanical / Electrical Engineer",
        "Commercial Pilot / Air Traffic Controller",
        "Army / Defence Officer (NDA / CDS / Agniveer)",
        "Automobile Engineer / EV Technology Specialist",
        "Aeronautical Engineer / Aircraft Maintenance Engineer",
        "Robotics & Automation Engineer",
        "Drone Technology Specialist / UAV Pilot",
        "Construction Manager / Project Engineer",
        "Merchant Navy / Deck Officer",
        "Paramilitary Officer (CRPF / BSF / CISF)",
    ],
    "riasec_artistic": [
        "Film Director / Assistant Director",
        "Graphic Designer / Brand Designer",
        "Fashion Designer / Costume Designer",
        "Actor / Theatre Artist / Performer",
        "Advertising Creative Director / Copywriter",
        "UX/UI Designer / Product Designer",
        "Animator / VFX Artist / Motion Designer",
        "Photographer / Videographer",
        "Screenwriter / Script Writer",
        "Music Producer / Film Score Composer",
    ],
    "riasec_conventional": [
        "Chartered Accountant (CA)",
        "Company Secretary (CS)",
        "Bank PO / Bank Manager (IBPS / SBI)",
        "Cost & Management Accountant (CMA)",
        "Tax Consultant / GST Practitioner",
        "Compliance Officer / Legal Advisor",
        "RBI / SEBI / NABARD Officer",
        "Government Clerk / Administrative Officer (SSC/CGL)",
        "Insurance Underwriter / IRDA Career",
        "Accounting Software Specialist (Tally / SAP / ERP)",
    ],
}

# Primary career per category (first = best match)
PRIMARY_CAREER = {cat: careers[0] for cat, careers in CAREER_MAP.items()}


def calculate_scores(answers: list, questions: list) -> dict:
    scores = {cat: [] for cat in CAREER_MAP}
    q_map  = {q.id: q for q in questions}

    for answer in answers:
        q = q_map.get(answer["question_id"])
        if not q or not q.score_map:
            continue
        try:
            score_map = json.loads(q.score_map)
            points    = score_map.get(answer["selected_option"], 0)
            cat       = q.category
            if cat in scores:
                scores[cat].append(points)
        except Exception:
            continue

    # Average each category, scale to 0–100
    final = {}
    for cat, vals in scores.items():
        if vals:
            final[cat] = round((sum(vals) / (len(vals) * 4)) * 100, 2)
        else:
            final[cat] = 0.0

    # Pick top career from highest scoring category
    top_cat = max(final, key=final.get)

    # Top 3 career category suggestions
    sorted_cats = sorted(final.items(), key=lambda x: x[1], reverse=True)
    top_3_careers = []
    for cat, score in sorted_cats[:3]:
        careers = CAREER_MAP.get(cat, [])
        if careers:
            top_3_careers.append({
                "category": cat,
                "score": score,
                "primary_career": careers[0],
                "all_careers": careers[:5],  # top 5 per category
            })

    final["top_career"]    = PRIMARY_CAREER.get(top_cat, "Undecided")
    final["top_3_careers"] = top_3_careers

    return final