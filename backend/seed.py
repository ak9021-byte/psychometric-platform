import sys, os
sys.path.append(os.path.dirname(__file__))

from database import SessionLocal, engine
from models import Base, Question
import json

Base.metadata.create_all(bind=engine)

# ── SCORING GUIDE ──────────────────────────────────────────────────────────
# Forced-choice questions make students CHOOSE between two traits
# This forces real differentiation — no more "average everywhere" profiles
#
# For forced-choice: only ONE option scores high (4), others score low (0-1)
# For Likert scale:  a=4 (Always), b=2 (Often), c=1 (Sometimes), d=0 (Never)

QUESTIONS = [

    # ── LOGICAL-MATHEMATICAL vs OTHER (forced choice) ────────────────────

    {"text": "Which activity feels more satisfying to you?",
     "category": "logical_mathematical",
     "option_a": "Solving a complex math or logic puzzle",
     "option_b": "Creating something artistic like drawing or music",
     "option_c": "Playing a sport or physical activity",
     "option_d": "Talking and connecting with new people",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 0, "d": 0})},

    {"text": "When you have free time, what do you most naturally do?",
     "category": "logical_mathematical",
     "option_a": "Read about science, technology or finance",
     "option_b": "Listen to music or watch movies",
     "option_c": "Go out and meet friends",
     "option_d": "Do some physical activity or sports",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 0, "d": 0})},

    {"text": "You are given a project. What is your first instinct?",
     "category": "logical_mathematical",
     "option_a": "Create a detailed plan with numbers and data",
     "option_b": "Brainstorm creative ideas first",
     "option_c": "Talk to the team and get everyone's input",
     "option_d": "Just start doing it hands-on",
     "score_map": json.dumps({"a": 4, "b": 1, "c": 1, "d": 0})},

    {"text": "Which subject did you enjoy most in school?",
     "category": "logical_mathematical",
     "option_a": "Mathematics or Science",
     "option_b": "Arts or Music",
     "option_c": "Physical Education or Sports",
     "option_d": "Languages or Social Studies",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 0, "d": 0})},

    {"text": "If a train travels 60 km in 45 minutes, what is its speed in km/h?",
     "category": "logical_mathematical",
     "option_a": "80 km/h", "option_b": "75 km/h",
     "option_c": "90 km/h", "option_d": "70 km/h",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 0, "d": 0})},

    {"text": "Which number comes next: 2, 6, 12, 20, 30, ?",
     "category": "logical_mathematical",
     "option_a": "40", "option_b": "42",
     "option_c": "44", "option_d": "38",
     "score_map": json.dumps({"a": 0, "b": 4, "c": 0, "d": 0})},

    {"text": "How comfortable are you with computer programming concepts?",
     "category": "logical_mathematical",
     "option_a": "Very comfortable", "option_b": "Somewhat comfortable",
     "option_c": "A little", "option_d": "Not at all",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "A shirt costs ₹800 after a 20% discount. What was the original price?",
     "category": "logical_mathematical",
     "option_a": "₹960", "option_b": "₹1000",
     "option_c": "₹1050", "option_d": "₹900",
     "score_map": json.dumps({"a": 0, "b": 4, "c": 0, "d": 0})},


    # ── INTERPERSONAL vs OTHER (forced choice) ────────────────────────────

    {"text": "Which role would you prefer in a group project?",
     "category": "interpersonal",
     "option_a": "Team coordinator — keeping everyone aligned",
     "option_b": "Data analyst — handling numbers and research",
     "option_c": "Creative lead — designing and visual work",
     "option_d": "Technical expert — building and coding",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 1, "d": 0})},

    {"text": "A friend is upset. What is your natural reaction?",
     "category": "interpersonal",
     "option_a": "Sit with them, listen and comfort them",
     "option_b": "Give them space and let them sort it out",
     "option_c": "Analyze the problem and suggest a solution",
     "option_d": "Distract them with an activity or sport",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 1, "d": 1})},

    {"text": "Which environment makes you feel most energized?",
     "category": "interpersonal",
     "option_a": "A social gathering with many people",
     "option_b": "A quiet library or study room alone",
     "option_c": "A sports ground or gym",
     "option_d": "An art studio or music room",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 1, "d": 1})},

    {"text": "How easily do you make new friends?",
     "category": "interpersonal",
     "option_a": "Very easily — I love meeting people",
     "option_b": "Easily with some effort",
     "option_c": "With difficulty — I prefer small circles",
     "option_d": "Very difficult — I prefer being alone",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How often do friends come to you for advice?",
     "category": "interpersonal",
     "option_a": "Very often — I am the go-to person",
     "option_b": "Often", "option_c": "Sometimes",
     "option_d": "Never",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you comfortable speaking in front of a large group?",
     "category": "interpersonal",
     "option_a": "Very comfortable — I enjoy it",
     "option_b": "Comfortable", "option_c": "Nervous but manage",
     "option_d": "Very uncomfortable",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How well can you manage conflicts between people?",
     "category": "interpersonal",
     "option_a": "Very well — I am a natural mediator",
     "option_b": "Well", "option_c": "Somewhat",
     "option_d": "Poorly — I avoid conflicts",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy organizing group events or activities?",
     "category": "interpersonal",
     "option_a": "Love it", "option_b": "Like it",
     "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── BODILY-KINESTHETIC vs OTHER (forced choice) ───────────────────────

    {"text": "On a holiday, which activity excites you most?",
     "category": "bodily_kinesthetic",
     "option_a": "Trekking, sports or adventure activity",
     "option_b": "Reading books or solving puzzles",
     "option_c": "Visiting art galleries or concerts",
     "option_d": "Spending time with friends and family",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 0, "d": 0})},

    {"text": "Which describes you best in learning?",
     "category": "bodily_kinesthetic",
     "option_a": "I learn best by doing things physically",
     "option_b": "I learn best by reading and thinking",
     "option_c": "I learn best by listening and discussing",
     "option_d": "I learn best through visuals and diagrams",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 0, "d": 1})},

    {"text": "How often do you participate in sports or physical activities?",
     "category": "bodily_kinesthetic",
     "option_a": "Daily", "option_b": "Several times a week",
     "option_c": "Occasionally", "option_d": "Rarely or never",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you good at activities requiring hand-eye coordination?",
     "category": "bodily_kinesthetic",
     "option_a": "Excellent", "option_b": "Good",
     "option_c": "Average", "option_d": "Poor",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy dance, yoga, martial arts or gymnastics?",
     "category": "bodily_kinesthetic",
     "option_a": "Love them", "option_b": "Like them",
     "option_c": "Neutral", "option_d": "Dislike them",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy building or assembling things with your hands?",
     "category": "bodily_kinesthetic",
     "option_a": "Love it", "option_b": "Like it",
     "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── VERBAL-LINGUISTIC vs OTHER (forced choice) ────────────────────────

    {"text": "Which task would you pick voluntarily?",
     "category": "verbal_linguistic",
     "option_a": "Write an essay or give a speech",
     "option_b": "Solve a mathematical problem",
     "option_c": "Design a poster or graphic",
     "option_d": "Play a team sport",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 1, "d": 0})},

    {"text": "How much do you enjoy reading books or articles?",
     "category": "verbal_linguistic",
     "option_a": "Love it — I read daily",
     "option_b": "Like it", "option_c": "Neutral",
     "option_d": "Dislike it — I rarely read",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you good at expressing your thoughts in writing?",
     "category": "verbal_linguistic",
     "option_a": "Excellent", "option_b": "Good",
     "option_c": "Average", "option_d": "Poor",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy debates, discussions or public speaking?",
     "category": "verbal_linguistic",
     "option_a": "Love it", "option_b": "Like it",
     "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you find it easy to learn new languages?",
     "category": "verbal_linguistic",
     "option_a": "Very easy", "option_b": "Somewhat easy",
     "option_c": "Difficult", "option_d": "Very difficult",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy storytelling or creative writing?",
     "category": "verbal_linguistic",
     "option_a": "Love it", "option_b": "Like it",
     "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── MUSICAL vs OTHER (forced choice) ─────────────────────────────────

    {"text": "Which would you choose as a hobby?",
     "category": "musical",
     "option_a": "Learning to play a musical instrument",
     "option_b": "Coding or programming",
     "option_c": "Playing cricket or football",
     "option_d": "Painting or sketching",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 0, "d": 1})},

    {"text": "Can you easily recognize different musical instruments by sound?",
     "category": "musical",
     "option_a": "Always", "option_b": "Usually",
     "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you play any musical instrument?",
     "category": "musical",
     "option_a": "Yes, professionally", "option_b": "Yes, as a hobby",
     "option_c": "Learning", "option_d": "No",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Can you easily remember tunes or melodies after hearing them once?",
     "category": "musical",
     "option_a": "Always", "option_b": "Usually",
     "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy composing or creating music?",
     "category": "musical",
     "option_a": "Love it", "option_b": "Like it",
     "option_c": "Neutral", "option_d": "Not interested",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── NATURALIST vs OTHER (forced choice) ───────────────────────────────

    {"text": "Which career sounds most meaningful to you?",
     "category": "naturalist",
     "option_a": "Forest Officer or Wildlife Conservationist",
     "option_b": "Software Engineer or Data Analyst",
     "option_c": "Actor or Music Artist",
     "option_d": "Business Owner or Entrepreneur",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 0, "d": 0})},

    {"text": "How interested are you in plants, animals and nature?",
     "category": "naturalist",
     "option_a": "Very interested", "option_b": "Interested",
     "option_c": "Neutral", "option_d": "Not interested",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy outdoor activities like hiking or gardening?",
     "category": "naturalist",
     "option_a": "Love it", "option_b": "Like it",
     "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you concerned about environmental issues and sustainability?",
     "category": "naturalist",
     "option_a": "Very concerned — I actively work on it",
     "option_b": "Concerned", "option_c": "Somewhat",
     "option_d": "Not concerned",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Can you identify different species of plants or animals?",
     "category": "naturalist",
     "option_a": "Many species", "option_b": "Some species",
     "option_c": "Very few", "option_d": "None",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── SPATIAL-VISUAL vs OTHER (forced choice) ───────────────────────────

    {"text": "Which task comes most naturally to you?",
     "category": "spatial_visual",
     "option_a": "Designing a room layout or creating a graphic",
     "option_b": "Writing a detailed report or article",
     "option_c": "Organizing a team event or meeting",
     "option_d": "Running, playing sport or physical workout",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 0, "d": 0})},

    {"text": "Do you enjoy drawing, sketching or painting?",
     "category": "spatial_visual",
     "option_a": "Love it", "option_b": "Like it",
     "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Can you easily visualize how objects look from different angles?",
     "category": "spatial_visual",
     "option_a": "Always", "option_b": "Usually",
     "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you good at jigsaw puzzles or spatial reasoning tasks?",
     "category": "spatial_visual",
     "option_a": "Excellent", "option_b": "Good",
     "option_c": "Average", "option_d": "Poor",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy photography or graphic design?",
     "category": "spatial_visual",
     "option_a": "Love it", "option_b": "Like it",
     "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── INTRAPERSONAL vs OTHER (forced choice) ────────────────────────────

    {"text": "After a difficult day, what do you prefer?",
     "category": "intrapersonal",
     "option_a": "Spend time alone reflecting and journaling",
     "option_b": "Talk to friends and get social",
     "option_c": "Go for a run or physical activity",
     "option_d": "Listen to music or watch a film",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 1, "d": 1})},

    {"text": "How well do you understand your own emotions and reactions?",
     "category": "intrapersonal",
     "option_a": "Very well — I reflect daily",
     "option_b": "Well", "option_c": "Somewhat",
     "option_d": "Poorly — I rarely think about it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you regularly reflect on your goals and personal growth?",
     "category": "intrapersonal",
     "option_a": "Always", "option_b": "Often",
     "option_c": "Sometimes", "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you prefer working independently and setting your own goals?",
     "category": "intrapersonal",
     "option_a": "Always prefer independent work",
     "option_b": "Usually prefer independent work",
     "option_c": "Sometimes", "option_d": "Prefer direction from others",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── RIASEC — REALISTIC (forced choice) ───────────────────────────────

    {"text": "Which of these would you most enjoy doing?",
     "category": "riasec_realistic",
     "option_a": "Fixing a machine or building something physical",
     "option_b": "Conducting scientific research or experiments",
     "option_c": "Leading a team meeting or business pitch",
     "option_d": "Counseling someone going through difficulties",
     "score_map": json.dumps({"a": 4, "b": 1, "c": 0, "d": 0})},

    {"text": "Do you prefer practical hands-on tasks over theoretical ones?",
     "category": "riasec_realistic",
     "option_a": "Strongly prefer hands-on",
     "option_b": "Prefer hands-on", "option_c": "Equal",
     "option_d": "Prefer theoretical",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How athletic or physically active are you?",
     "category": "riasec_realistic",
     "option_a": "Very active — daily workout/sport",
     "option_b": "Active", "option_c": "Moderately",
     "option_d": "Not active",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy repairing or building physical objects?",
     "category": "riasec_realistic",
     "option_a": "Love it", "option_b": "Like it",
     "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── RIASEC — INVESTIGATIVE (forced choice) ────────────────────────────

    {"text": "When you encounter a problem, what is your instinct?",
     "category": "riasec_investigative",
     "option_a": "Research it deeply until I fully understand it",
     "option_b": "Ask someone experienced for guidance",
     "option_c": "Try different solutions practically",
     "option_d": "Create a creative workaround",
     "score_map": json.dumps({"a": 4, "b": 1, "c": 1, "d": 0})},

    {"text": "Are you curious about how things work scientifically?",
     "category": "riasec_investigative",
     "option_a": "Very curious — I love science",
     "option_b": "Curious", "option_c": "Somewhat",
     "option_d": "Not curious",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy researching and finding answers to complex questions?",
     "category": "riasec_investigative",
     "option_a": "Love it", "option_b": "Like it",
     "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How comfortable are you with scientific or mathematical reasoning?",
     "category": "riasec_investigative",
     "option_a": "Very comfortable", "option_b": "Comfortable",
     "option_c": "Somewhat", "option_d": "Uncomfortable",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── RIASEC — ARTISTIC (forced choice) ────────────────────────────────

    {"text": "Which project would excite you most?",
     "category": "riasec_artistic",
     "option_a": "Designing a brand identity or creative campaign",
     "option_b": "Analyzing market data and making predictions",
     "option_c": "Managing a team to hit sales targets",
     "option_d": "Building a machine or technical system",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 0, "d": 0})},

    {"text": "Do you express yourself through art, music or writing?",
     "category": "riasec_artistic",
     "option_a": "Very much — it is my main outlet",
     "option_b": "Somewhat", "option_c": "A little",
     "option_d": "Not at all",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you prefer unstructured creative work environments?",
     "category": "riasec_artistic",
     "option_a": "Strongly prefer creative freedom",
     "option_b": "Prefer creative work",
     "option_c": "Neutral", "option_d": "Prefer strict structure",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy acting, drama or performing on stage?",
     "category": "riasec_artistic",
     "option_a": "Love it", "option_b": "Like it",
     "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── RIASEC — SOCIAL (forced choice) ──────────────────────────────────

    {"text": "Which role would make you feel most fulfilled?",
     "category": "riasec_social",
     "option_a": "Helping and caring for people in need",
     "option_b": "Building technology or engineering solutions",
     "option_c": "Running a successful business",
     "option_d": "Creating art or music",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 0, "d": 0})},

    {"text": "Do you enjoy teaching or training other people?",
     "category": "riasec_social",
     "option_a": "Love it", "option_b": "Like it",
     "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you feel fulfilled when you help someone in need?",
     "category": "riasec_social",
     "option_a": "Always — it is my purpose",
     "option_b": "Often", "option_c": "Sometimes",
     "option_d": "Rarely",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How patient are you when explaining things to others?",
     "category": "riasec_social",
     "option_a": "Very patient", "option_b": "Patient",
     "option_c": "Somewhat", "option_d": "Impatient",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── RIASEC — ENTERPRISING (forced choice) ─────────────────────────────

    {"text": "Which describes your ideal future best?",
     "category": "riasec_enterprising",
     "option_a": "Running my own successful business or startup",
     "option_b": "Being a top scientist or researcher",
     "option_c": "Being a famous artist or performer",
     "option_d": "Serving society as a doctor or social worker",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 0, "d": 0})},

    {"text": "Do you enjoy leading a team or project?",
     "category": "riasec_enterprising",
     "option_a": "Love it — I am a natural leader",
     "option_b": "Like it", "option_c": "Neutral",
     "option_d": "Prefer to follow",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Are you good at persuading people to your point of view?",
     "category": "riasec_enterprising",
     "option_a": "Very good", "option_b": "Good",
     "option_c": "Average", "option_d": "Not good",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you have entrepreneurial ideas or ambitions?",
     "category": "riasec_enterprising",
     "option_a": "Very much — I have specific plans",
     "option_b": "Somewhat", "option_c": "A little",
     "option_d": "Not at all",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},


    # ── RIASEC — CONVENTIONAL (forced choice) ─────────────────────────────

    {"text": "Which work style suits you best?",
     "category": "riasec_conventional",
     "option_a": "Following clear procedures with accurate data",
     "option_b": "Exploring new ideas with creative freedom",
     "option_c": "Leading people and making big decisions",
     "option_d": "Working outdoors with physical activity",
     "score_map": json.dumps({"a": 4, "b": 0, "c": 0, "d": 0})},

    {"text": "Are you good at keeping records and managing data?",
     "category": "riasec_conventional",
     "option_a": "Excellent", "option_b": "Good",
     "option_c": "Average", "option_d": "Poor",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "Do you enjoy tasks requiring attention to detail and accuracy?",
     "category": "riasec_conventional",
     "option_a": "Love it", "option_b": "Like it",
     "option_c": "Neutral", "option_d": "Dislike it",
     "score_map": json.dumps({"a": 4, "b": 2, "c": 1, "d": 0})},

    {"text": "How comfortable are you working with spreadsheets or accounting?",
     "category": "riasec_conventional",
     "option_a": "Very comfortable", "option_b": "Comfortable",
     "option_c": "Somewhat", "option_d": "Uncomfortable",
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

        # Count forced-choice questions
        forced = sum(1 for q in QUESTIONS if q["score_map"] in [
            json.dumps({"a": 4, "b": 0, "c": 0, "d": 0}),
            json.dumps({"a": 0, "b": 4, "c": 0, "d": 0}),
        ])
        print(f"\n🎯 Forced-choice questions: {forced}")
        print(f"📝 Likert scale questions:  {len(QUESTIONS) - forced}")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed()