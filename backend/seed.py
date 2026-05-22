import sys, os
sys.path.append(os.path.dirname(__file__))

from database import SessionLocal, engine
from models import Base, Question
import json

Base.metadata.create_all(bind=engine)

# Scoring: a=4 (Strongly agree/Always/Excellent), b=2 (Somewhat/Often/Good),
#          c=1 (Rarely/Average), d=0 (Never/Poor/Not at all)
# This spreads scores accurately — low scorers get 0, high scorers get 4

QUESTIONS = [

    # ── LOGICAL-MATHEMATICAL (8 questions) ──────────────────────────────────

    {"text": "If a Train travels 60 km in 45 minutes, what is its speed in km/h?",
     "category": "logical_mathematical",
     "option_a": "80 km/h", "option_b": "75 km/h", "option_c": "90 km/h", "option_d": "70 km/h",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 0, "d": 0})},  # only 80 is correct

    {"text": "Which number comes next in the series: 2, 6, 12, 20, 30, ?",
     "category": "logical_mathematical",
     "option_a": "40", "option_b": "42", "option_c": "44", "option_d": "38",
     "score_map": json.dumps({"a": 0, "b": 4, "c": 0, "d": 0})},  # 42 is correct

    {"text": "How often do you enjoy solving puzzles or brain teasers?",
     "category": "logical_mathematical",
     "option_a": "Always", "option_b": "Often", "option_c": "Rarely", "option_d": "Never",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "When faced with a problem, do you prefer to think logically step-by-step?",
     "category": "logical_mathematical",
     "option_a": "Always", "option_b": "Usually", "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy working with numbers and financial calculations?",
     "category": "logical_mathematical",
     "option_a": "Very much", "option_b": "Somewhat", "option_c": "Neutral", "option_d": "Not at all",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "A shirt costs ₹800 after a 20% discount. What was the original price?",
     "category": "logical_mathematical",
     "option_a": "₹960", "option_b": "₹1000", "option_c": "₹1050", "option_d": "₹900",
     "score_map": json.dumps({"a": 0, "b": 4, "c": 0, "d": 0})},  # ₹1000 is correct

    {"text": "How comfortable are you with computer programming concepts?",
     "category": "logical_mathematical",
     "option_a": "Very comfortable", "option_b": "Somewhat comfortable", "option_c": "A little", "option_d": "Not at all",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy science experiments and lab work?",
     "category": "logical_mathematical",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── INTERPERSONAL (8 questions) ──────────────────────────────────────────

    {"text": "How Easily do you make new friends?",
     "category": "interpersonal",
     "option_a": "Very easily", "option_b": "Easily", "option_c": "With some effort", "option_d": "With great difficulty",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy working in teams more than working alone?",
     "category": "interpersonal",
     "option_a": "Always prefer teams", "option_b": "Usually prefer teams", "option_c": "Sometimes", "option_d": "Always prefer alone",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Can you easily tell when someone is upset or uncomfortable?",
     "category": "interpersonal",
     "option_a": "Always", "option_b": "Usually", "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How often do friends come to you for advice?",
     "category": "interpersonal",
     "option_a": "Very often", "option_b": "Often", "option_c": "Sometimes", "option_d": "Never",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you comfortable speaking in front of a group of people?",
     "category": "interpersonal",
     "option_a": "Very comfortable", "option_b": "Comfortable", "option_c": "Nervous but manage", "option_d": "Very uncomfortable",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy helping others solve their personal problems?",
     "category": "interpersonal",
     "option_a": "Always", "option_b": "Often", "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How well can you manage conflicts between people?",
     "category": "interpersonal",
     "option_a": "Very well", "option_b": "Well", "option_c": "Somewhat", "option_d": "Poorly",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy organizing group activities or events?",
     "category": "interpersonal",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── BODILY-KINESTHETIC (6 questions) ─────────────────────────────────────

    {"text": "How often do you participate in sports or physical activities?",
     "category": "bodily_kinesthetic",
     "option_a": "Daily", "option_b": "Several times a week", "option_c": "Occasionally", "option_d": "Rarely or never",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you good at activities that require hand-eye coordination?",
     "category": "bodily_kinesthetic",
     "option_a": "Excellent", "option_b": "Good", "option_c": "Average", "option_d": "Poor",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you learn better by doing things physically rather than reading?",
     "category": "bodily_kinesthetic",
     "option_a": "Strongly agree", "option_b": "Agree", "option_c": "Neutral", "option_d": "Disagree",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy activities like dance, yoga, or martial arts?",
     "category": "bodily_kinesthetic",
     "option_a": "Love them", "option_b": "Like them", "option_c": "Neutral", "option_d": "Dislike them",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How well do you control your body movements in physical tasks?",
     "category": "bodily_kinesthetic",
     "option_a": "Very well", "option_b": "Well", "option_c": "Average", "option_d": "Poorly",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy building or assembling things with your hands?",
     "category": "bodily_kinesthetic",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── VERBAL-LINGUISTIC (6 questions) ──────────────────────────────────────

    {"text": "How much do you enjoy reading books or articles?",
     "category": "verbal_linguistic",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you good at expressing your thoughts in writing?",
     "category": "verbal_linguistic",
     "option_a": "Excellent", "option_b": "Good", "option_c": "Average", "option_d": "Poor",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy storytelling or creative writing?",
     "category": "verbal_linguistic",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you find it easy to learn new languages?",
     "category": "verbal_linguistic",
     "option_a": "Very easy", "option_b": "Somewhat easy", "option_c": "Difficult", "option_d": "Very difficult",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How often do you use rich vocabulary in everyday conversation?",
     "category": "verbal_linguistic",
     "option_a": "Always", "option_b": "Often", "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy debates, discussions or public speaking?",
     "category": "verbal_linguistic",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── MUSICAL (5 questions) ─────────────────────────────────────────────────

    {"text": "Can you easily recognize different musical instruments by sound?",
     "category": "musical",
     "option_a": "Always", "option_b": "Usually", "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you play any musical instrument?",
     "category": "musical",
     "option_a": "Yes, professionally", "option_b": "Yes, as a hobby", "option_c": "Learning", "option_d": "No",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How often do you listen to music and analyze its elements?",
     "category": "musical",
     "option_a": "Very often", "option_b": "Often", "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Can you easily remember tunes or melodies after hearing them once?",
     "category": "musical",
     "option_a": "Always", "option_b": "Usually", "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy composing or creating music?",
     "category": "musical",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Not interested",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── NATURALIST (5 questions) ──────────────────────────────────────────────

    {"text": "How interested are you in plants, animals, and nature?",
     "category": "naturalist",
     "option_a": "Very interested", "option_b": "Interested", "option_c": "Neutral", "option_d": "Not interested",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you notice changes in weather and environment easily?",
     "category": "naturalist",
     "option_a": "Always", "option_b": "Usually", "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy outdoor activities like hiking or gardening?",
     "category": "naturalist",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Can you identify different species of plants or animals?",
     "category": "naturalist",
     "option_a": "Many species", "option_b": "Some species", "option_c": "Very few", "option_d": "None",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you concerned about environmental issues and sustainability?",
     "category": "naturalist",
     "option_a": "Very concerned", "option_b": "Concerned", "option_c": "Somewhat", "option_d": "Not concerned",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── SPATIAL-VISUAL (5 questions) ──────────────────────────────────────────

    {"text": "Are you good at reading maps and navigating places?",
     "category": "spatial_visual",
     "option_a": "Excellent", "option_b": "Good", "option_c": "Average", "option_d": "Poor",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy drawing, sketching, or painting?",
     "category": "spatial_visual",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Can you easily visualize how objects look from different angles?",
     "category": "spatial_visual",
     "option_a": "Always", "option_b": "Usually", "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy photography or graphic design?",
     "category": "spatial_visual",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you good at jigsaw puzzles or spatial reasoning tasks?",
     "category": "spatial_visual",
     "option_a": "Excellent", "option_b": "Good", "option_c": "Average", "option_d": "Poor",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── INTRAPERSONAL (4 questions) ───────────────────────────────────────────

    {"text": "How well do you understand your own emotions and reactions?",
     "category": "intrapersonal",
     "option_a": "Very well", "option_b": "Well", "option_c": "Somewhat", "option_d": "Poorly",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you regularly reflect on your goals and personal growth?",
     "category": "intrapersonal",
     "option_a": "Always", "option_b": "Often", "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you aware of your own strengths and weaknesses?",
     "category": "intrapersonal",
     "option_a": "Very aware", "option_b": "Aware", "option_c": "Somewhat", "option_d": "Not aware",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you prefer working independently and setting your own goals?",
     "category": "intrapersonal",
     "option_a": "Always", "option_b": "Usually", "option_c": "Sometimes", "option_d": "Prefer direction from others",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── RIASEC — REALISTIC (4 questions) ─────────────────────────────────────

    {"text": "Do you enjoy working with tools, machines, or mechanical things?",
     "category": "riasec_realistic",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you prefer practical, hands-on tasks over theoretical ones?",
     "category": "riasec_realistic",
     "option_a": "Strongly prefer hands-on", "option_b": "Prefer hands-on", "option_c": "Equal", "option_d": "Prefer theoretical",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy repairing or building physical objects?",
     "category": "riasec_realistic",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How athletic or physically active are you?",
     "category": "riasec_realistic",
     "option_a": "Very active", "option_b": "Active", "option_c": "Moderately", "option_d": "Not active",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── RIASEC — INVESTIGATIVE (4 questions) ──────────────────────────────────

    {"text": "Do you enjoy researching and finding answers to complex questions?",
     "category": "riasec_investigative",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you curious about how things work scientifically?",
     "category": "riasec_investigative",
     "option_a": "Very curious", "option_b": "Curious", "option_c": "Somewhat", "option_d": "Not curious",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you prefer analyzing data over socializing?",
     "category": "riasec_investigative",
     "option_a": "Strongly prefer analyzing", "option_b": "Prefer analyzing", "option_c": "Equal", "option_d": "Prefer socializing",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How comfortable are you with scientific or mathematical reasoning?",
     "category": "riasec_investigative",
     "option_a": "Very comfortable", "option_b": "Comfortable", "option_c": "Somewhat", "option_d": "Uncomfortable",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── RIASEC — ARTISTIC (4 questions) ───────────────────────────────────────

    {"text": "Do you express yourself through art, music, or writing?",
     "category": "riasec_artistic",
     "option_a": "Very much", "option_b": "Somewhat", "option_c": "A little", "option_d": "Not at all",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you prefer unstructured, creative work environments?",
     "category": "riasec_artistic",
     "option_a": "Strongly prefer", "option_b": "Prefer", "option_c": "Neutral", "option_d": "Prefer structure",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you appreciate beauty in design, art, and aesthetics?",
     "category": "riasec_artistic",
     "option_a": "Very much", "option_b": "Somewhat", "option_c": "A little", "option_d": "Not at all",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy acting, drama, or performing?",
     "category": "riasec_artistic",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── RIASEC — SOCIAL (4 questions) ────────────────────────────────────────

    {"text": "Do you enjoy teaching or training other people?",
     "category": "riasec_social",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you feel fulfilled when you help someone in need?",
     "category": "riasec_social",
     "option_a": "Always", "option_b": "Often", "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy volunteering or community service?",
     "category": "riasec_social",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How patient are you when explaining things to others?",
     "category": "riasec_social",
     "option_a": "Very patient", "option_b": "Patient", "option_c": "Somewhat", "option_d": "Impatient",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── RIASEC — ENTERPRISING (4 questions) ───────────────────────────────────

    {"text": "Do you enjoy leading a team or project?",
     "category": "riasec_enterprising",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Prefer to follow",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you good at persuading people to your point of view?",
     "category": "riasec_enterprising",
     "option_a": "Very good", "option_b": "Good", "option_c": "Average", "option_d": "Not good",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you have entrepreneurial ideas or ambitions?",
     "category": "riasec_enterprising",
     "option_a": "Very much", "option_b": "Somewhat", "option_c": "A little", "option_d": "Not at all",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy selling ideas, products, or services?",
     "category": "riasec_enterprising",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── RIASEC — CONVENTIONAL (4 questions) ───────────────────────────────────

    {"text": "Do you prefer following clear rules and procedures at work?",
     "category": "riasec_conventional",
     "option_a": "Strongly prefer", "option_b": "Prefer", "option_c": "Neutral", "option_d": "Prefer flexibility",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you good at keeping records and managing data?",
     "category": "riasec_conventional",
     "option_a": "Excellent", "option_b": "Good", "option_c": "Average", "option_d": "Poor",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy tasks that require attention to detail and accuracy?",
     "category": "riasec_conventional",
     "option_a": "Love it", "option_b": "Like it", "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How comfortable are you working with spreadsheets or accounting?",
     "category": "riasec_conventional",
     "option_a": "Very comfortable", "option_b": "Comfortable", "option_c": "Somewhat", "option_d": "Uncomfortable",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(Question).count()
        if existing > 0:
            print(f"⚠️  Database already has {existing} questions.")
            confirm = input("Delete existing and re-seed? (yes/no): ")
            if confirm.lower() != "yes":
                print("Skipping seed.")
                return
            db.query(Question).delete()
            db.commit()
            print("🗑️  Old questions deleted.")

        for q in QUESTIONS:
            db.add(Question(**q))
        db.commit()
        print(f"✅ Successfully seeded {len(QUESTIONS)} questions!")

        from collections import Counter
        cats = Counter(q["category"] for q in QUESTIONS)
        print("\n📊 Questions per category:")
        for cat, count in sorted(cats.items()):
            print(f"   {cat:<30} → {count} question{'s' if count > 1 else ''}")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed()