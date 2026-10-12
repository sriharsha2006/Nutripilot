from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_LINE_SPACING
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import re, math

ROOT = Path(r'E:\FoAI_Capstone')
OUT = ROOT / 'NutriPilot_Project_Report.docx'
TMP = ROOT / 'tmp'
TMP.mkdir(exist_ok=True)

# Extract the institution logo embedded in the user-supplied reference PDF.
from pypdf import PdfReader
pdf = PdfReader(r'C:\Users\gnssh\OneDrive\Desktop\reference report.pdf')
logo_path = TMP / 'amrita_logo.png'
for page_index in (0, 1, 2):
    page = pdf.pages[page_index]
    for image in page.images:
        image.image.save(logo_path)
        break
    if logo_path.exists():
        break

# Draw project diagrams from the repository's documented module boundaries.
font_dir = Path(r'C:\Windows\Fonts')
try:
    fnt = ImageFont.truetype(str(font_dir/'times.ttf'), 23)
    small = ImageFont.truetype(str(font_dir/'times.ttf'), 18)
    bold = ImageFont.truetype(str(font_dir/'timesbd.ttf'), 23)
except Exception:
    fnt = small = bold = ImageFont.load_default()

def diagram(path, title, boxes, arrows, width=1500, height=730):
    im = Image.new('RGB',(width,height),'white'); d=ImageDraw.Draw(im)
    d.text((width//2,28),title,font=bold,fill='#18324b',anchor='mm')
    centers={}
    for key,label,x,y,w,h in boxes:
        centers[key]=(x+w//2,y+h//2)
        d.rounded_rectangle((x,y,x+w,y+h),radius=18,fill='#eef4f7',outline='#294d64',width=3)
        lines=label.split('\n'); lineh=30
        sy=y+h//2-(len(lines)*lineh)//2
        for i,line in enumerate(lines): d.text((x+w//2,sy+i*lineh),line,font=small,fill='#172b3a',anchor='mm')
    for a,b,label in arrows:
        x1,y1=centers[a]; x2,y2=centers[b]
        # use a simple straight connector, terminate before box edge
        dx=x2-x1; dy=y2-y1; norm=max(1,math.hypot(dx,dy)); ux=dx/norm; uy=dy/norm
        sx=x1+ux*125; sy=y1+uy*70; ex=x2-ux*125; ey=y2-uy*70
        d.line((sx,sy,ex,ey),fill='#42677c',width=4)
        ang=math.atan2(ey-sy,ex-sx); ah=17
        p1=(ex-ah*math.cos(ang-0.45),ey-ah*math.sin(ang-0.45)); p2=(ex-ah*math.cos(ang+0.45),ey-ah*math.sin(ang+0.45))
        d.polygon([(ex,ey),p1,p2],fill='#42677c')
        if label: d.text(((sx+ex)//2,(sy+ey)//2-14),label,font=small,fill='#333',anchor='mm')
    im.save(path)

diagram(TMP/'architecture.png','NutriPilot logical architecture',[
 ('ui','Browser UI\nNext.js / React',70,270,240,150),('api','Route handlers\nTyped API boundary',390,270,240,150),('domain','Domain modules\nNutrition • Planner\nPantry • Tracking',710,270,280,150),('store','In-memory mock\nstores',1080,270,240,150),
 ('pdf','PDF report / email\nutilities',710,520,280,120),('charts','Progress views\nRecharts',70,520,240,120)],
 [('ui','api','request'),('api','domain','delegate'),('domain','store','read/write'),('domain','pdf','report data'),('ui','charts','visualize')])
diagram(TMP/'nutrition_flow.png','Nutrition target calculation implemented in NutriPilot',[
 ('input','Profile inputs\nage, weight, height,\nsex, activity, goal',60,270,270,150),('bmr','BMR estimate\nMifflin–St Jeor',410,270,240,150),('tdee','Activity adjusted\nTDEE = round(BMR × A)',740,270,280,150),('goal','Goal adjustment\nloss / maintain / gain',1110,270,300,150),
 ('macro','Energy shares → grams\n4 kcal/g carb & protein;\n9 kcal/g fat',740,520,280,130),('target','Targets used by\nplanner and dashboard',1110,520,300,130)],
 [('input','bmr',''),('bmr','tdee',''),('tdee','goal',''),('goal','target',''),('goal','macro','')])
diagram(TMP/'planning_flow.png','Meal planning, constraints, and shopping support',[
 ('profile','Profile & constraints\nallergies, diet, goal',60,260,270,150),('catalog','Curated recipe\ncatalog',400,260,250,150),('filter','Hard rule filters\nallergy / dislikes / tags',740,260,290,150),('plan','7 days × 4 slots\ndeterministic pool picks',1120,260,300,150),
 ('actions','User actions\nlock • refresh • swap\nservings • eaten',400,520,250,150),('pantry','Pantry amounts\nsubstring name match',740,520,290,150),('grocery','Aggregated grocery list\nremaining quantities',1120,520,300,150)],
 [('profile','filter',''),('catalog','filter',''),('filter','plan','allowed items'),('plan','actions',''),('plan','grocery','ingredients'),('pantry','grocery','subtract')])
diagram(TMP/'recommendation_flow.png','Recommendation heuristic (not a learned probability)',[
 ('candidates','Allowed recipe\ncandidates',80,280,270,140),('features','Normalized feature scores\ncalorie fit • tags • goal\ncuisine • budget • time',450,260,390,180),('history','Interaction history\neaten/favorite vs\nswap/dislike/refresh',950,280,330,140),('rank','Weighted sum\ncap at 1.00\nranked suggestions',600,520,330,150)],
 [('candidates','features',''),('history','features',''),('features','rank','weights total 1.08')])

doc=Document()
sec=doc.sections[0]
sec.page_width=Inches(8.27); sec.page_height=Inches(11.69)
sec.top_margin=Inches(0.75); sec.bottom_margin=Inches(0.7); sec.left_margin=Inches(0.85); sec.right_margin=Inches(0.85)
sec.header_distance=Inches(0.35); sec.footer_distance=Inches(0.35)

# Global report typography mirrors the reference's Times New Roman academic format.
styles=doc.styles
normal=styles['Normal']; normal.font.name='Times New Roman'; normal._element.rPr.rFonts.set(qn('w:eastAsia'),'Times New Roman'); normal.font.size=Pt(11)
normal.paragraph_format.alignment=WD_ALIGN_PARAGRAPH.JUSTIFY
normal.paragraph_format.line_spacing=1.05; normal.paragraph_format.space_after=Pt(5); normal.paragraph_format.first_line_indent=Inches(0.25)
for nm,size in [('Title',24),('Heading 1',15),('Heading 2',12),('Heading 3',11)]:
    st=styles[nm]; st.font.name='Times New Roman'; st._element.rPr.rFonts.set(qn('w:eastAsia'),'Times New Roman'); st.font.size=Pt(size); st.font.bold=True; st.font.color.rgb=RGBColor(20,35,52)
    st.paragraph_format.keep_with_next=True; st.paragraph_format.space_before=Pt(14 if nm!='Heading 3' else 8); st.paragraph_format.space_after=Pt(6)
styles['Heading 1'].paragraph_format.alignment=WD_ALIGN_PARAGRAPH.CENTER
styles['Heading 2'].paragraph_format.alignment=WD_ALIGN_PARAGRAPH.LEFT
styles['Heading 3'].paragraph_format.alignment=WD_ALIGN_PARAGRAPH.LEFT

def set_cell_shading(cell, fill):
    tcPr=cell._tc.get_or_add_tcPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),fill); tcPr.append(shd)
def set_cell_margins(cell, top=70, start=85, bottom=70, end=85):
    tc=cell._tc; tcPr=tc.get_or_add_tcPr(); tcMar=tcPr.first_child_found_in('w:tcMar')
    if tcMar is None: tcMar=OxmlElement('w:tcMar'); tcPr.append(tcMar)
    for m,v in [('top',top),('start',start),('bottom',bottom),('end',end)]:
        el=tcMar.find(qn('w:'+m))
        if el is None: el=OxmlElement('w:'+m); tcMar.append(el)
        el.set(qn('w:w'),str(v)); el.set(qn('w:type'),'dxa')
def add_page_number(p):
    p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    run=p.add_run(); fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); run._r.addnext(fld)
def add_running_elements():
    h=sec.header.paragraphs[0]; h.clear()
    add_page_number(sec.footer.paragraphs[0])
add_running_elements()

def para(text='', style=None, align=None, boldlead=None):
    p=doc.add_paragraph(style=style)
    if boldlead and text.startswith(boldlead):
        p.add_run(boldlead).bold=True; p.add_run(text[len(boldlead):])
    else: p.add_run(text)
    if align is not None: p.alignment=align
    return p
def heading(text, level=1): return doc.add_heading(text,level=level)
def page(): doc.add_page_break()
def chapter(n,title):
    page(); p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_before=Pt(55)
    r=p.add_run(f'CHAPTER {n}\n{title.upper()}'); r.bold=True; r.font.name='Times New Roman'; r.font.size=Pt(18)
    p.paragraph_format.space_after=Pt(28)
def table(headers, rows, caption, widths=None, font=10):
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.keep_with_next=True
    r=p.add_run(caption); r.bold=True; r.font.size=Pt(10); r.font.name='Times New Roman'
    t=doc.add_table(rows=1,cols=len(headers)); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.style='Table Grid'; t.autofit=False
    for j,h in enumerate(headers):
        c=t.rows[0].cells[j]; c.text=str(h); set_cell_shading(c,'F0F0F0'); set_cell_margins(c); c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for rr in c.paragraphs[0].runs: rr.bold=True; rr.font.name='Times New Roman'; rr.font.size=Pt(font)
    for row in rows:
        cells=t.add_row().cells
        for j,val in enumerate(row):
            cells[j].text=str(val); set_cell_margins(cells[j]); cells[j].vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            for pp in cells[j].paragraphs:
                pp.paragraph_format.space_after=Pt(0); pp.paragraph_format.line_spacing=1.0
                for rr in pp.runs: rr.font.name='Times New Roman'; rr.font.size=Pt(font)
    if widths:
        for row in t.rows:
            for i,w in enumerate(widths): row.cells[i].width=Inches(w)
    doc.add_paragraph().paragraph_format.space_after=Pt(2)
    return t
def figure(path, caption, width=6.2):
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.keep_with_next=True
    p.add_run().add_picture(str(path),width=Inches(width))
    cp=doc.add_paragraph(); cp.alignment=WD_ALIGN_PARAGRAPH.CENTER; cp.paragraph_format.space_after=Pt(10)
    rr=cp.add_run(caption); rr.font.name='Times New Roman'; rr.font.size=Pt(10); rr.italic=True
def bullet(text):
    p=doc.add_paragraph(style='List Bullet'); p.paragraph_format.left_indent=Inches(0.35); p.paragraph_format.first_line_indent=Inches(-0.18); p.paragraph_format.space_after=Pt(3); p.add_run(text); return p
def numbered(text):
    p=doc.add_paragraph(style='List Number'); p.paragraph_format.left_indent=Inches(0.35); p.paragraph_format.first_line_indent=Inches(-0.18); p.add_run(text); return p

# PAGE 1 — template-matched title sheet.
p=doc.add_paragraph(style='Title'); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_before=Pt(35); p.paragraph_format.space_after=Pt(35)
r=p.add_run('NUTRIPILOT: A CONSTRAINT-AWARE\nPERSONAL NUTRITION AND\nMEAL-PLANNING WEB APPLICATION'); r.bold=True; r.font.name='Times New Roman'; r.font.size=Pt(25)
p=para('A PROJECT REPORT',align=WD_ALIGN_PARAGRAPH.CENTER); p.paragraph_format.space_after=Pt(20)
for r in p.runs: r.bold=True; r.font.size=Pt(14)
para('Submitted to',align=WD_ALIGN_PARAGRAPH.CENTER)
para('AMRITA VISHWA VIDYAPEETHAM',align=WD_ALIGN_PARAGRAPH.CENTER)
para('in partial fulfillment of the requirements for the award of the degree of',align=WD_ALIGN_PARAGRAPH.CENTER)
p=para('[INFORMATION REQUIRED: Degree Programme and Academic Year]',align=WD_ALIGN_PARAGRAPH.CENTER); p.paragraph_format.space_before=Pt(8); p.paragraph_format.space_after=Pt(14)
for r in p.runs: r.bold=True; r.font.size=Pt(14)
para('Submitted by',align=WD_ALIGN_PARAGRAPH.CENTER)
for name,reg in [('Pavan Aditya','[INFORMATION REQUIRED: Register Number]'),('G Sri Harsha','[INFORMATION REQUIRED: Register Number]'),('M Pallavi','[INFORMATION REQUIRED: Register Number]')]:
    p=para(f'{name}  —  {reg}',align=WD_ALIGN_PARAGRAPH.CENTER); p.paragraph_format.space_after=Pt(2)
para('Under the guidance of',align=WD_ALIGN_PARAGRAPH.CENTER)
p=para('[INFORMATION REQUIRED: Project Guide Name and Designation]',align=WD_ALIGN_PARAGRAPH.CENTER); p.runs[0].bold=True
if logo_path.exists():
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run().add_picture(str(logo_path),width=Inches(1.6))
for line in ['AMRITA SCHOOL OF COMPUTING','AMRITA VISHWA VIDYAPEETHAM','CHENNAI – 601 103','OCTOBER 2026']:
    p=para(line,align=WD_ALIGN_PARAGRAPH.CENTER); p.paragraph_format.space_after=Pt(0); p.runs[0].bold=True

# PAGE 2 — Certificate.
page()
if logo_path.exists():
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run().add_picture(str(logo_path),width=Inches(2.5))
p=para('BONAFIDE CERTIFICATE',align=WD_ALIGN_PARAGRAPH.CENTER); p.paragraph_format.space_before=Pt(5); p.paragraph_format.space_after=Pt(40); p.runs[0].bold=True; p.runs[0].font.size=Pt(16)
para('Certified that this project report titled “NutriPilot: A Constraint-Aware Personal Nutrition and Meal-Planning Web Application” is the bonafide work of Pavan Aditya, G Sri Harsha, and M Pallavi, submitted in partial fulfillment of the requirements for the award of [INFORMATION REQUIRED: Degree Programme] at Amrita Vishwa Vidyapeetham. The project guide, candidate register numbers, and institutional signatories are to be verified and completed by the department before submission.')
doc.add_paragraph('\n\n')
t=doc.add_table(rows=2,cols=2); t.alignment=WD_TABLE_ALIGNMENT.CENTER
for c in [t.cell(0,0),t.cell(0,1)]: c.text='\n\n____________________________'
t.cell(1,0).text='[INFORMATION REQUIRED]\nProject Guide\nDepartment of CSE'
t.cell(1,1).text='[INFORMATION REQUIRED]\nHead of Department\nDepartment of CSE'
for row in t.rows:
    for c in row.cells:
        for p in c.paragraphs: p.alignment=WD_ALIGN_PARAGRAPH.CENTER
for _ in range(2): doc.add_paragraph('\n')
t=doc.add_table(rows=2,cols=2); t.alignment=WD_TABLE_ALIGNMENT.CENTER
t.cell(0,0).text='________________________'; t.cell(0,1).text='________________________'
t.cell(1,0).text='Internal Examiner'; t.cell(1,1).text='External Examiner'
for row in t.rows:
    for c in row.cells:
        for p in c.paragraphs: p.alignment=WD_ALIGN_PARAGRAPH.CENTER

# PAGE 3 — Declaration.
page()
if logo_path.exists():
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run().add_picture(str(logo_path),width=Inches(2.5))
p=para('DECLARATION BY CANDIDATES',align=WD_ALIGN_PARAGRAPH.CENTER); p.paragraph_format.space_after=Pt(35); p.runs[0].bold=True; p.runs[0].font.size=Pt(16)
para('We hereby declare that the project report entitled “NutriPilot: A Constraint-Aware Personal Nutrition and Meal-Planning Web Application” is based on the project work carried out by us under the guidance to be recorded by the department. The descriptions of formulas, algorithms, interface workflows, tests, and limitations are drawn from the supplied project source files and implementation artifacts. Any external ideas or published sources used in the report are cited in the references. This report has not been submitted, in whole or in part, for the award of another degree or diploma.')
para('We understand that project-specific information not present in the available files, including the guide name, the third candidate’s register number, and institutional approval details, is intentionally left for verification rather than assumed.')
doc.add_paragraph('\n\n')
for name,reg in [('Pavan Aditya','[INFORMATION REQUIRED: Register Number]'),('G Sri Harsha','[INFORMATION REQUIRED: Register Number]'),('M Pallavi','[INFORMATION REQUIRED: Register Number]')]:
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.RIGHT; p.paragraph_format.space_after=Pt(4)
    p.add_run('____________________________\n').bold=True; p.add_run(f'{name}\n{reg}')

# PAGE 4 — Abstract.
page()
p=para('ABSTRACT',align=WD_ALIGN_PARAGRAPH.CENTER); p.paragraph_format.space_after=Pt(25); p.runs[0].bold=True; p.runs[0].font.size=Pt(16)
para('NutriPilot is a web-based capstone prototype that connects profile-based nutrition estimates with weekly meal planning, recipe constraints, pantry-aware shopping support, daily tracking, progress views, and report generation. This report documents the implementation and its evidence rather than claiming clinical efficacy. The target calculator applies the Mifflin–St Jeor equation, an activity multiplier, a configurable weight-goal adjustment, a lower calorie bound for loss goals, and default macronutrient energy shares. Recipes are stored in a curated application catalog with per-serving nutrition fields, ingredients, allergens, and dietary tags. Hard filters screen catalog entries against declared allergies, disliked ingredients, and selected diet rules. Weekly plans contain seven days and four meal slots per day; the current generator selects from fixed slot pools deterministically. A separate recommendation function ranks candidates using hand-weighted profile, nutrition, pantry, and interaction features. The grocery generator aggregates planned ingredients and subtracts approximate pantry quantities using substring matches. The application provides authentication, onboarding, profile editing, meal actions, recipe cooking mode, tracking, charts, reports, and settings through a Next.js application and typed route handlers. The repository includes unit tests for nutrition calculations, planner invariants, and pantry/grocery behavior. Its mock data stores are process-local and reset on restart; progress and sample reports include generated or seeded values. Ingredient text matching, limited catalog coverage, simplified energy assumptions, and heuristic ranking are substantial constraints. Consequently, NutriPilot is an educational software prototype and not a medical device, dietitian substitute, or validated behavior-change intervention. The report presents the architecture, methods, requirements traceability, implementation, test evidence, limitations, and a practical roadmap for rigorous evaluation.')
p=doc.add_paragraph(); p.paragraph_format.first_line_indent=Inches(0); p.paragraph_format.space_before=Pt(16)
r=p.add_run('Keywords: '); r.bold=True; p.add_run('personalized nutrition, meal planning, dietary constraints, recipe recommendation, pantry management, web application, capstone project')

# PAGE 5 — Acknowledgement.
page()
p=para('ACKNOWLEDGEMENT',align=WD_ALIGN_PARAGRAPH.CENTER); p.paragraph_format.space_after=Pt(24); p.runs[0].bold=True; p.runs[0].font.size=Pt(16)
para('We express our gratitude to Amrita Vishwa Vidyapeetham and the Department of Computer Science and Engineering for providing the academic setting in which this capstone project was undertaken. We are thankful to the faculty members and project reviewers whose instruction and feedback contributed to the learning process associated with the work.')
para('The available project files identify the student authors and institution but do not record the project guide, coordinator, laboratory staff, or other individual contributors by name. These acknowledgements should be completed by the authors after verifying the people and roles who directly supported the project. We have therefore not attributed specific guidance or assistance to unnamed individuals.')
para('We also acknowledge the open-source software and documentation referenced in the project, including the tools used to build the web application and the published work cited in the bibliography. Any final submission should verify institutional requirements, author details, acknowledgements, and approval signatures.')
doc.add_paragraph('\n')
for name in ['Pavan Aditya','G Sri Harsha','M Pallavi']:
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.RIGHT; p.add_run(name).bold=True

# Front matter contents. Chapter/section outline follows the reference report.
page(); p=para('TABLE OF CONTENTS',align=WD_ALIGN_PARAGRAPH.CENTER); p.runs[0].bold=True; p.runs[0].font.size=Pt(16)
toc=[('Abstract',''),('Acknowledgement',''),('List of Tables','[page]'),('List of Figures','[page]'),('List of Abbreviations','[page]'),
('CHAPTER 1  INTRODUCTION','[page]'),('1.1 Background and Motivation','[page]'),('1.2 Problem Context: Personal Nutrition Planning','[page]'),('1.3 Problem Statement','[page]'),('1.4 Aim and Objectives','[page]'),('1.5 Scope and Boundaries','[page]'),('1.6 Organization of the Report','[page]'),
('CHAPTER 2  LITERATURE REVIEW','[page]'),('2.1 Introduction','[page]'),('2.2 Energy Requirement Estimation','[page]'),('2.3 Constraint-Aware Recommendation','[page]'),('2.4 Meal Planning and Recipe Recommendation','[page]'),('2.5 Self-Monitoring and Digital Tools','[page]'),('2.6 Food Data, Allergens, and Safety','[page]'),('2.7 Limitations of Existing Approaches','[page]'),('2.8 Research and Engineering Gap','[page]'),('2.9 Summary','[page]'),
('CHAPTER 3  METHODOLOGY AND SYSTEM ARCHITECTURE','[page]'),('3.1 Introduction','[page]'),('3.2 Requirements and Design Principles','[page]'),('3.3 System Overview','[page]'),('3.4 Nutrition Target Method','[page]'),('3.5 Dietary Constraint Evaluation','[page]'),('3.6 Weekly Plan Construction','[page]'),('3.7 Recommendation Scoring','[page]'),('3.8 Pantry and Grocery Compilation','[page]'),('3.9 Tracking and Reporting Workflow','[page]'),('3.10 Summary','[page]'),
('CHAPTER 4  IMPLEMENTATION AND WORK FLOW','[page]'),('4.1 Introduction','[page]'),('4.2 Application Structure','[page]'),('4.3 Technology Stack','[page]'),('4.4 User and API Workflows','[page]'),('4.5 Domain Modules','[page]'),('4.6 Data Model and Mock Persistence','[page]'),('4.7 Security and Configuration','[page]'),('4.8 Functional Requirements Traceability','[page]'),('4.9 Summary','[page]'),
('CHAPTER 5  TESTING, RESULTS, AND EVALUATION','[page]'),('5.1 Evaluation Scope','[page]'),('5.2 Unit Test Evidence','[page]'),('5.3 Functional Coverage Results','[page]'),('5.4 Algorithmic Behavior and Worked Examples','[page]'),('5.5 Results Interpretation','[page]'),('5.6 Limitations of Available Evidence','[page]'),('5.7 Evaluation Plan','[page]'),('5.8 Summary','[page]'),
('CHAPTER 6  CONCLUSION AND FUTURE WORK','[page]'),('6.1 Introduction','[page]'),('6.2 Summary of the System','[page]'),('6.3 Project Contributions','[page]'),('6.4 Limitations','[page]'),('6.5 Future Work','[page]'),('6.6 Final Remarks','[page]'),('References','[page]'),('Appendix A: Requirement Traceability','[page]'),('Appendix B: API and Route Inventory','[page]'),('Appendix C: Glossary and Evidence Notes','[page]')]
for title,pg in toc:
    p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(2); p.paragraph_format.first_line_indent=Inches(0)
    if title.startswith('CHAPTER') or title in ('References','Appendix A: Requirement Traceability','Appendix B: API and Route Inventory','Appendix C: Glossary and Evidence Notes'): p.add_run(title).bold=True
    else: p.add_run('    '+title)
    if pg and pg != '[page]': p.add_run('  ' + '.'*max(8,65-len(title))+'  '+pg)

# Lists of tables/figures and abbreviations.
page(); p=para('LIST OF TABLES',align=WD_ALIGN_PARAGRAPH.CENTER); p.runs[0].bold=True; p.runs[0].font.size=Pt(16)
listtables=['Table 3.1  Principal functional requirements and user outcomes','Table 3.2  Nutrition calculation constants and rules','Table 3.3  Hard dietary constraints represented in the source','Table 3.4  Recommendation feature weights','Table 4.1  Software tools and technology stack','Table 4.2  Principal application routes','Table 4.3  Domain data entities and storage behavior','Table 4.4  Functional requirement status from the project matrix','Table 5.1  Available automated unit-test coverage','Table 5.2  Results and evidence status','Table 5.3  Evidence versus claims boundary','Table 5.4  Proposed evaluation metrics','Table A.1  Requirement traceability','Table B.1  API endpoint inventory','Table C.1  Glossary']
for x in listtables: para(x)
p=para('LIST OF FIGURES',align=WD_ALIGN_PARAGRAPH.CENTER); p.paragraph_format.space_before=Pt(18); p.runs[0].bold=True; p.runs[0].font.size=Pt(16)
for x in ['Figure 3.1  NutriPilot logical architecture','Figure 3.2  Nutrition target calculation flow','Figure 3.3  Planning, filtering, pantry, and grocery flow','Figure 3.4  Recommendation heuristic flow','Figure 4.1  Request flow through application layers'] : para(x)
page(); p=para('LIST OF ABBREVIATIONS',align=WD_ALIGN_PARAGRAPH.CENTER); p.runs[0].bold=True; p.runs[0].font.size=Pt(16)
abbrevs=[('AI','Artificial Intelligence'),('API','Application Programming Interface'),('BMR','Basal Metabolic Rate'),('CRUD','Create, Read, Update, Delete'),('CSS','Cascading Style Sheets'),('FR','Functional Requirement'),('HTTP','Hypertext Transfer Protocol'),('JWT','JSON Web Token'),('Kcal','Kilocalorie'),('MAC','Media Access Control'),('NFR','Non-Functional Requirement'),('PDF','Portable Document Format'),('REST','Representational State Transfer'),('SRS','Software Requirements Specification'),('TDEE','Total Daily Energy Expenditure'),('UI','User Interface'),('UX','User Experience'),('WHO','World Health Organization'),('Zod','TypeScript schema validation library')]
for a,b in abbrevs:
    p=doc.add_paragraph(); p.paragraph_format.first_line_indent=Inches(0); p.paragraph_format.space_after=Pt(5); p.add_run(a+'\t').bold=True; p.add_run(b)

# Main body authored in nested chapter/section structure. Paragraphs are grounded in inspected source.
chapter(1,'Introduction')
sections1=[
('1.1 Background and Motivation',[
'Personal nutrition planning is a coordination problem. A user may need to consider an energy target, meal timing, cultural preferences, food allergies, disliked ingredients, household size, pantry stock, preparation time, budget, and changing daily routines. These considerations are not independent: a recipe that fits a macro target may violate a dietary preference, require ingredients not available at home, or exceed a user’s practical cooking time. A software application can make these relationships visible and reduce repetitive planning work, provided the tool distinguishes estimates from verified health guidance.',
'NutriPilot is a Foundations of AI capstone project implemented as a responsive web application. Its repository contains pages and route handlers for registration and login, onboarding, a dashboard, weekly planning, recipe browsing and creation, pantry and grocery lists, daily tracking, progress visualization, recommendations, reports, profile management, and settings. The project therefore addresses a connected workflow rather than a single calculator. The main engineering motivation is to connect profile information to candidate meals and shopping tasks while allowing users to inspect, modify, and record interactions.',
'The phrase “AI-powered” appears in project-facing material, but code inspection shows that the central plan generator is deterministic and the recommendation function is a hand-weighted heuristic. There is no evidence of model training, machine-learning inference, clinical trial, or measured recommendation quality in the supplied files. This report uses “personalized” in the limited software sense that profile attributes and user interactions affect filtering or ranking. It does not imply that the system has learned individual needs or provides medical advice.',
'The project is motivated by integration and transparency. Nutrition calculations are explicit, constraints are represented as rules, and meal changes are exposed through user actions. That structure is useful for an educational prototype because behavior can be inspected and tested. It also makes shortcomings visible: the recipe catalog is limited, ingredient and allergy logic is string-based, and data are held in process memory. The report treats those limitations as part of the system description rather than hiding them behind broad product claims.'
]),
('1.2 Problem Context: Personal Nutrition Planning',[
'A profile-based nutrition application must translate self-reported data into targets without overstating their precision. NutriPilot accepts age, sex/gender category, weight, height, activity level, goal, and an optional weekly goal pace. Its implementation calculates a predicted basal/resting energy estimate and adjusts it using a selected activity multiplier. It then adds or subtracts an estimated daily energy amount for gain or loss. Each stage depends on user inputs and chosen assumptions. The estimate is not a direct measurement of energy expenditure, and the code does not perform clinical assessment.',
'Meal planning adds a constrained selection problem. Some preferences are soft ranking signals, whereas declared allergies and strict dietary rules should behave as exclusions. The source implements a combination of these strategies: selected allergy, disliked-ingredient, and diet properties filter catalog entries; the remaining recipes are selected into meal slots; recommendations use a separate score. The distinction is important because a ranking penalty is not a safe substitute for a hard exclusion, and a hard exclusion is only as reliable as the catalog’s ingredient and allergen labels.',
'Shopping support must reconcile planned ingredient quantities with available inventory. NutriPilot aggregates ingredients across the weekly plan and servings and compares them to pantry items using a first matching substring. This is a practical demonstration of a connected workflow, but it cannot reliably equate ingredient synonyms, package units, edible amounts, expiry, or food already consumed. It should be interpreted as an approximate list-generation feature rather than an inventory accounting system.',
'Tracking and progress views introduce another distinction: stored observations versus generated demonstrations. The repository includes tracking interfaces, but the progress module synthesizes a time series with deterministic fluctuations and a fixed adherence value. A chart generated from this mock history demonstrates the interface and data path, not user behavior. This report labels those outputs as seeded or generated wherever relevant.'
]),
('1.3 Problem Statement',[
'The project problem can be stated as follows: design and implement an integrated web prototype that collects a user profile, derives transparent nutrition targets, filters and organizes a curated set of recipes into a modifiable weekly plan, incorporates pantry data into grocery support, and presents tracking and report views, while documenting the limits of its algorithms and data persistence.',
'The problem is not to diagnose nutritional deficiencies, prescribe a diet, predict health outcomes, or prove that users will change behavior. The available project files do not define clinical labels or study protocols that would support those claims. Likewise, the project does not use a large external food database or a learned ranking model. Its scope is a software engineering and applied-AI prototype that demonstrates rule-based personalization and related user workflows.',
'A successful project artifact should therefore be judged through traceability: each visible feature should map to a page or route, each numerical target should map to a documented calculation, and each claimed result should map to a test, status record, or observed code behavior. Where the source does not contain evidence, the report states that information is unavailable rather than estimating it.'
]),
('1.4 Aim and Objectives of the Project',[
'The aim of NutriPilot is to build a coherent web-based application that assists a user in organizing nutrition-oriented meal planning and related tracking tasks. The objective is implementation, not clinical validation.',
'The project objectives reflected in the source repository are:',
'1) Provide registration, authentication, profile setup, and editable dietary information. 2) Compute estimated daily energy and macro targets from profile attributes and configurable goals. 3) Present a seven-day plan with breakfast, lunch, dinner, and snack slots, using recipe metadata and profile constraints. 4) Allow refresh, lock, swap, serving adjustment, and eaten-state changes for planned meals. 5) Maintain a pantry and compile a grocery list by aggregating ingredients and subtracting approximate available quantities. 6) Provide recipe browsing, custom recipe creation, and a cooking-mode interface. 7) Record water and weight inputs and show progress charts. 8) Generate weekly or monthly report artifacts and expose an email workflow. 9) Keep the logic modular and expose operations through typed API utilities and route handlers. 10) document functional evidence, mock-data limitations, and a future evaluation plan.',
'These objectives are based on the functional requirement matrix and implemented paths. They do not establish that each feature has production-grade persistence, security, or usability.'
]),
('1.5 Scope and Boundaries',[
'The report analyzes the NutriPilot source repository, its readme, implementation status matrix, application routes, domain modules, and automated unit tests. It describes the code as inspected and includes a limited test run for the three available Vitest suites. It does not analyze the unrelated road-accident paper and image result folders also present in the workspace.',
'The core scope includes user-facing flows, target estimation, constraint filtering, weekly plan construction, heuristic recommendations, pantry/grocery handling, tracking, progress, PDF reports, and email-related integration points. Technology descriptions are derived from package configuration and source files. Functional statuses are attributed to the project’s own matrix unless independently tested in this report.',
'The report does not claim clinical safety, dietitian approval, regulatory compliance, a production database, actual email delivery, recommendation accuracy, food waste reduction, nutrition adequacy, or behavior change. It does not quantify the exact number of recipes unless directly enumerated from source, nor does it present the generated progress series as measured user data. Areas not described in available files are marked [PROJECT INFORMATION REQUIRED] when needed for a formal institutional report.'
]),
('1.6 Organization of the Report',[
'Chapter 1 introduces the project context, problem, objectives, and boundaries. Chapter 2 reviews relevant foundations in energy estimation, dietary constraints, recommendation systems, meal planning, digital self-monitoring, and data safety. Chapter 3 explains the system methodology and architecture, including the exact rules used for target calculations, filtering, meal generation, ranking, and grocery compilation. Chapter 4 documents the implemented application structure, libraries, routes, data modules, security configuration, and requirements traceability. Chapter 5 reports the evidence available from unit tests and repository status, distinguishes demonstrated behavior from empirical outcomes, and proposes a validation protocol. Chapter 6 summarizes the implementation, contributions, limitations, and future work. Appendices provide a requirement matrix, route inventory, glossary, and evidence map.'
])]
# Remove repeated exposition while preserving every major topic and implementation detail.
def trim(sections, removals):
    for section_index, paragraph_indices in removals.items():
        for paragraph_index in sorted(paragraph_indices, reverse=True):
            sections[section_index][1].pop(paragraph_index)
trim(sections1,{0:[3],2:[2]})
for h,ps in sections1:
    heading(h,2)
    for txt in ps:
        if re.match(r'^\d\)',txt):
            for part in re.split(r'(?=\d\) )',txt):
                if part.strip(): bullet(part.strip())
        else: para(txt)

chapter(2,'Literature Review')
sections2=[
('2.1 Introduction',[
'This chapter reviews established ideas that inform NutriPilot’s software design. The discussion separates three levels: health and nutrition references provide context and describe the limits of generalized advice; recommender-system literature offers a vocabulary for combining constraints, content attributes, and user feedback; software and behavior-change literature motivates tracking and interface design. The application is not a reproduction of a published clinical or recommender model. The review is therefore used to situate design choices and to identify what evidence a future evaluation would need.',
'The project’s present algorithms are intentionally simple. Their value is that they are inspectable and integrated with application workflows; their limitation is that correctness and usefulness are not established by their existence. A literature review should not convert a recognized method or an external health recommendation into a claim that the implementation has been clinically validated.'
]),
('2.2 Energy Requirement Estimation',[
'Predictive equations are commonly used in software to estimate resting energy expenditure when indirect calorimetry is not available. Mifflin et al. published an equation based on age, height, weight, and sex for healthy individuals [1]. NutriPilot implements this form, then multiplies the estimated basal value by an activity category to approximate total daily energy expenditure. The project code uses five activity multipliers, from 1.20 for sedentary through 1.90 for very active, and rounds the result to a whole kilocalorie.',
'Predictive equations estimate a population-based quantity; an individual’s measured expenditure may differ. Activity categories are user selected and broad. The software does not assess pregnancy, growth, clinical conditions, medication effects, eating-disorder risk, or contraindications. An output should consequently be described as an estimate and not as a prescription. The World Health Organization frames healthy eating through adequacy, balance, moderation, and diversity, emphasizing that diet composition varies with characteristics and cultural context [2]. A single target number cannot encode all of these dimensions.',
'The implementation’s weight-change adjustment uses an energy-per-kilogram constant divided across seven days. It is a simple calculation rule in code, not a personalized physiological model. The report documents the formula so that reviewers can inspect it, while avoiding claims about the rate or safety of weight change. A future clinical version would require qualified review, population-specific bounds, uncertainty communication, and a mechanism to disable unsuitable recommendations.'
]),
('2.3 Constraint-Aware Recommendation',[
'Recommender systems can use content features, explicit user preferences, interaction history, or combinations of these signals. A standard design distinction is between constraints and preferences. A hard constraint removes an item from eligibility, while a soft preference changes its rank. This distinction is particularly important for food allergies and strict diets: an allergen must not be treated as just a lower score. The NutriPilot repository encodes allergies, disliked ingredients, and several diet tags as rule filters, and computes recommendations from normalized feature components.',
'The general recommender literature describes content-based, collaborative, and hybrid techniques and emphasizes that recommendation depends on the information available about users and items [3]. NutriPilot does not implement collaborative filtering or train a model from a population of users. Its current historical preference signal is a bounded counter updated from a small set of in-memory interactions. It is therefore best described as a rule-based content scorer with a simple interaction heuristic.',
'A weighted score provides traceability because each component can be inspected. However, weights are design choices and require empirical validation. The current project coefficients sum to 1.08 before a final cap at 1.00, and one cuisine proxy overlaps with general preference information. This means the output is not a calibrated probability and can compress high scores at the ceiling. Ranking quality should ultimately be evaluated against user judgments or a reviewed relevance set, with the calculation and scoring policy fixed before test evaluation.'
]),
('2.4 Meal Planning and Recipe Recommendation',[
'Meal planning differs from recommending one recipe. A weekly plan must assign candidate recipes across multiple slots while considering daily energy, macro targets, repeated meals, ingredient reuse, time, cost, and user constraints. An optimization formulation could represent slot assignments as decision variables and penalize deviation from targets while enforcing eligibility, variety, and budget conditions. NutriPilot currently does not solve such a global optimization problem. It divides a short curated catalog into slot pools and selects entries by day index modulo pool size.',
'Deterministic selection offers reproducibility and predictable user interfaces, but it can create repeated patterns and does not guarantee that a weekly plan meets targets. The code calculates daily sums for calories and macronutrients, and a user can change a meal, servings, or lock state. These interactions improve agency, but they do not demonstrate nutritional adequacy. Meal-level and daily totals are arithmetic derived from the recipe catalog’s stored per-serving values; source provenance and nutrient-analysis methodology for the recipe data are not documented in the repository.',
'A broader planner could model variety constraints, serving-size decisions, budget, prep time, leftover reuse, ingredient quantities, and nutrient bounds. Such a solver would need a reliable food composition database and transparent constraint priorities. If no feasible plan exists, the application should explain which requirements conflict rather than silently relaxing safety constraints.'
]),
('2.5 Self-Monitoring and Digital Tools',[
'Self-monitoring is a recurring component in behavioral weight-loss interventions. Burke, Wang, and Sevick reviewed diet, exercise, and self-weighing measures in behavioral weight-loss studies [4]. This literature supports the relevance of logging as a design feature, but it does not establish that a particular app, chart, or synthetic dataset improves outcomes. User adherence, usability, data quality, and intervention context all matter.',
'NutriPilot includes water logging, weight entry, eaten-meal state, progress charts over selectable windows, and report generation. The code makes an important distinction less visible to a casual reader: some progress series and report values are generated from deterministic mock logic. To support real self-monitoring, entries need durable ownership, timestamps, correction, export, deletion, and explicit provenance. A prototype chart should visually distinguish sample data from a person’s own logged observations.',
'Digital tools may reduce friction when they connect the planning and tracking tasks. However, additional interfaces can increase burden if food entry is inaccurate or repetitive. Future usability research should measure task completion, time, error recovery, accessibility, perceived trust, and drop-off. Health outcome evaluations require a separately designed study and cannot be inferred from a feature checklist.'
]),
('2.6 Food Data, Allergens, and Safety',[
'Dietary filtering depends on the semantic quality of ingredient and allergen data. Ingredient names may have synonyms, compound foods can contain hidden components, and cross-contact risk is not represented by a simple list. NutriPilot uses string comparisons over catalog ingredient names, recipe titles, and allergen strings. That approach can demonstrate filtering logic but does not constitute an allergen safety system. The risk is compounded if a catalog entry lacks an allergen label or uses terminology different from a user’s entry.',
'Diet labels such as vegan, gluten-free, halal, kosher, dairy-free, and keto are represented as recipe tags or narrow code rules. The correctness of these flags cannot be inferred from the type names alone. A production catalog would need a documented source, label review, update process, unit and serving conventions, and an audit trail for changes. Users with medically significant allergies should be directed to verify ingredients independently until a professionally maintained data workflow exists.',
'The application should not imply that a generated plan satisfies nutrient adequacy simply because calories or three macronutrients are displayed. Micronutrients, sodium, fiber, food quality, cultural suitability, affordability, and clinical context are not comprehensively modeled in the supplied code. The WHO’s healthy-diet guidance emphasizes diversity and context in addition to energy balance [2].'
]),
('2.7 Limitations of Existing Systems and Design Trade-offs',[
'A planning application may favor a large catalog, sophisticated optimization, easy manual editing, data privacy, or low implementation complexity. A small capstone prototype typically balances these goals. NutriPilot chooses a compact catalog and rule-based flows to demonstrate end-to-end integration. The trade-off is limited variety, data coverage, and evidence. A fixed demo workflow is useful for technical demonstration, but it should not be represented as a validated recommendation service.',
'A second trade-off is between strict filtering and candidate availability. The planner’s slot pool may become empty after profile filtering; the code then falls back to the allowed general set or, ultimately, the full catalog. That fallback behavior has direct implications for constraints and should be inspected carefully. Swapping checks allergy constraints explicitly, but the source path should be reviewed to confirm whether every hard diet and dislike rule is consistently re-applied. The report identifies this as a safety-relevant implementation test rather than assuming equivalent enforcement across all actions.',
'A third trade-off concerns persistence. An in-memory mock store supports a prototype without a database, but state resets on restart and is not shared between processes. This affects user isolation, data integrity, email/report history, and any longitudinal chart. The current implementation should be treated as a local educational demonstration.'
]),
('2.8 Research and Engineering Gap',[
'The project’s engineering gap is not the absence of an advanced machine-learning model; it is the need to connect transparent calculation and constraints to a complete, testable user workflow. The repository demonstrates the pages and domain operations for profile setup, planning, food handling, tracking, and reports. What remains unestablished is whether recipe data are accurate, whether constraints are safe under varied inputs, whether plans are nutritionally suitable, whether rankings align with user preference, and whether the application is understandable and useful.',
'In particular, the interaction score is not based on collected user feedback at scale, the recipe catalog is not a validated database, the plan generator is not a solver, and the progress trend is partly synthetic. A rigorous next stage would replace mock persistence with a transparent data layer, source or validate food metadata, design tests that cover boundary and adversarial cases, then conduct usability work before any health-outcome study.',
'The contribution claimed here is therefore a documented integrated prototype and its inspectable implementation. No comparative performance advantage is claimed over commercial or research systems.'
]),
('2.9 Summary',[
'The literature establishes context for estimation, constraint filtering, recommender design, and self-monitoring, but it does not validate NutriPilot. The implemented system uses an established predictive equation as a calculation component, simple hard rules for candidate filtering, deterministic weekly selection, and an interpretable but uncalibrated weighted ranker. The next chapter describes those methods and their interfaces precisely.'
])]
trim(sections2,{2:[2],3:[2],4:[2],6:[0],7:[2]})
for h,ps in sections2:
    heading(h,2)
    for txt in ps: para(txt)

chapter(3,'Methodology and System Architecture')
sections3=[
('3.1 Introduction',[
'This chapter describes the system as implemented in the supplied repository. The design separates browser-facing pages, route handlers, typed client API functions, domain logic under the mock modules, and presentation utilities for charts, email, and PDF reports. The data path is intentionally lightweight: domain state resides in process-local module variables rather than an external database. The following sections explain input handling and algorithms without implying a production deployment.'
]),
('3.2 Requirements and Design Principles',[
'The functional scope is represented in IMPLEMENTATION_STATUS.md as 22 requirements, from registration through settings. The report treats that matrix as project-reported status and independently distinguishes it from tests. Requirements are grouped by user outcome: account and profile, target calculation, meal plan, recipes and substitutions, pantry and shopping, tracking and analytics, and reporting/settings.',
'The implementation follows several visible design principles. First, domain functions are organized by topic in separate modules. Second, route handlers provide HTTP boundaries around those operations. Third, the UI offers explicit user actions for changing generated plans rather than presenting a fixed result. Fourth, TypeScript data types are shared through API modules. Fifth, the mock persistence layer is structured so a future data service could replace the in-memory implementation. These are architectural observations, not claims about modularity tests or production readiness.',
'Table 3.1 summarizes user outcomes and associated behavior.'
]),
('3.3 Overview of the Proposed System',[
'The main user journey begins with account creation or login, followed by onboarding. Profile information is saved through a route; the profile module computes nutrition estimates. The dashboard and planner retrieve the profile and plan. Recipe constraints are applied to a curated catalog. Plan actions call route handlers that modify meal state. Pantry data feed grocery-list generation, while tracking data feed progress and report views. The user can generate a PDF and invoke an email operation through the report workflow.',
'Figure 3.1 shows a logical architecture reconstructed from the source tree. It intentionally omits deployment topology, cloud services, and external database boxes because those are not represented in the project. The mock store is shown explicitly to prevent a diagram from implying persistent storage.',
'A request typically follows this sequence: client component invokes a typed API function; the function sends an HTTP request to a Next.js route; the route validates or reads the request and calls a domain operation; the operation accesses a module-level store and returns a typed value; the route serializes a response; the client updates the interface. Exact request schemas vary by feature and should be verified against the individual route files before external API documentation is published.'
]),
('3.4 Nutrition Target Method',[
'For age a (years), weight w (kilograms), height h (centimeters), and offset s, the code computes a Mifflin–St Jeor estimate: BMR = 10w + 6.25h − 5a + s. The code selects s=5 for male, s=−161 for female, and s=−78 for any other value. The last case is a software default, not an independently validated equation for every sex or gender identity. The resulting BMR is rounded to an integer in the returned object.',
'The activity multiplier A is selected from the configured map: sedentary 1.20, light 1.375, moderate 1.55, active 1.725, and very_active 1.90. If the submitted key is absent, the implementation uses the light multiplier. TDEE is rounded(BMR × A). The exact implementation computes BMR at full floating precision before rounding the returned BMR; consequently, reconstructing TDEE from the rounded BMR field may differ by a small amount in edge cases.',
'The target pace p defaults to 0.5 kg/week when a falsy value is supplied. Daily delta D is rounded(p × 7700 / 7) kcal/day. For a loss goal, target is max(1200, TDEE−D); for a gain goal, target is TDEE+D; for maintenance or unrecognized goals, target equals TDEE. This is code behavior and does not assert clinical suitability.',
'Default energy shares are carbohydrate 50%, protein 25%, and fat 25%. Carbohydrate and protein grams are calculated by dividing their energy allocation by 4 kcal/g; fat grams use 9 kcal/g. Each value is rounded independently. The profile supports custom macro targets, while calculation output contains default shares. Figure 3.2 illustrates the sequence. Users should be able to understand that macro grams are estimates derived from a target and configured shares.',
'An important boundary is the fixed 1200-kcal floor for weight loss: the code applies that numeric minimum without individual review. This report records the bound because it affects output; it does not endorse it as safe for all users. A future application should surface appropriate cautions and route users with special needs to qualified professionals.'
]),
('3.5 Dietary Constraint Evaluation',[
'Recipes include a title, per-serving calories and macros, ingredient objects, allergens, and dietary tags. Allergy filtering lowercases and trims user-provided allergy strings, then searches recipe allergens, ingredient names, and title text for substring overlap. Disliked ingredients are searched within ingredient names. These comparisons are computationally simple and work only when catalog and profile terminology overlap.',
'The hard-diet checker recognizes vegan, vegetarian, gluten-free, dairy-free, halal, kosher, and keto preferences. Vegan requires a vegan tag; vegetarian accepts vegetarian or vegan tags; gluten-free and dairy-free use tags and selected allergen checks; halal accepts halal, vegetarian, or vegan tags; keto rejects recipes above 30 grams of carbohydrate. The kosher branch is implemented as limited heuristics using shellfish allergen text, high-protein tags, halal/vegetarian/vegan tags, and a pork title check. These rules are not equivalent to formal certification and should be described as app-level tags/heuristics.',
'The combined eligibility function rejects a recipe if allergy logic, disliked-ingredient matching, or a hard-diet rule fails. For a safe design, the same eligibility function should be enforced consistently in plan generation, refresh, recommendation, and swap APIs. Code inspection indicates that some swap logic explicitly checks allergy while other operations call the combined filter; that difference warrants targeted tests before representing all user constraints as uniformly protected.',
'Figure 3.3 shows where filtering occurs relative to plan assignment and shopping. Empty candidate sets require explicit behavior: if all recipes are excluded, the application should explain that no compliant recipe is available. A silent fallback to a less constrained catalog would undermine the user’s declared requirements.'
]),
('3.6 Weekly Plan Construction',[
'The plan contains seven named weekdays and four slot types per day: breakfast, lunch, dinner, and snack. The catalog is divided into pools by recipe identifiers. For a given day index, each slot selects an entry at a fixed modular index in its pool; additional offsets are used for lunch, dinner, and snack. If a slot-specific pool is empty, the code uses the filtered allowed catalog. If that is empty, the current final fallback reaches the full catalog. That final fallback means the planner can return a recipe that fails a user’s filter when no candidate is allowed; it is an important correctness and safety test finding.',
'Plan regeneration may preserve meals marked locked by day and slot. Existing servings, eaten state, and locked state are retained for those slots. The refresh operation uses a random alternative from the filtered catalog, with a broader catalog fallback if no allowed alternatives remain. Swap options are drawn from allowed recipes, but the swap mutation path checks allergy explicitly. Locking toggles a boolean. Serving adjustment recalculates daily totals by multiplying each recipe’s per-serving nutrients by servings and rounding each meal contribution before summation.',
'The generator is deterministic for fixed pool contents and day indices except where refresh uses a random selection. It does not optimize total weekly targets, variety, cuisine rotation, total cost, preparation time, or ingredient overlap. The dashboard may display a target alongside a plan, but display proximity does not prove constraint satisfaction. A planner evaluation should measure deviation from targets, diversity, hard-constraint violations, and manual correction burden.'
]),
('3.7 Recommendation Scoring',[
'The recommendation module computes component scores for calorie fit to a meal slot, diet-tag overlap, goal alignment, a cuisine proxy derived from preferences, budget fit, preparation-time fit, interaction history, and pantry overlap. Their coefficients are respectively 0.30, 0.20, 0.15, 0.10, 0.10, 0.05, 0.10, and 0.08. The weighted result is capped at 1.00. The nominal coefficients sum to 1.08, so values near the upper range may saturate. The cuisine proxy also partly duplicates preference information.',
'Interaction history is stored in process memory. A neutral preference starts at 0.5. Each eaten or favorite event raises the score by 0.08; swap, dislike, or refresh reduces it by 0.05. The value is bounded between zero and one. This update rule is not trained and does not include recency weighting, exposure normalization, uncertainty, or a user-specific learned model. The score should be interpreted as a heuristic ordering feature and never as the probability that a user will like a recipe.',
'Figure 3.4 represents the current ranking inputs. For a reproducible evaluation, each feature’s normalization, missing-value default, and tie-breaking behavior must be documented. Weights should be fixed before test comparisons and tuned on a development set only. Offline ranking metrics such as precision at k or normalized discounted cumulative gain require relevance judgments; the repository does not include such judgments.'
]),
('3.8 Pantry and Grocery Compilation',[
'Grocery generation reads the active weekly plan, multiplies ingredient quantities by planned servings, and groups ingredients by name. Pantry matching searches for the first pantry item whose name has a substring relationship with the planned ingredient name. It subtracts available amount up to the amount needed and marks an item checked when the remaining quantity is zero. The source contains unit and category fields, but no robust unit conversion or synonym ontology is documented.',
'A quantity comparison is meaningful only when units are compatible. The current implementation’s simplified subtraction can compare quantities that are not semantically equivalent if units differ. Substring matches can also match unrelated names, miss synonyms, or choose the wrong pantry row. The generated list is consequently approximate. It does not physically consume or reserve inventory, check expiry for every ingredient, or query a retailer’s live price.',
'The cost estimate in the project description is based on unchecked unique ingredient counts rather than market prices and exact quantities. It should not be presented as an actual grocery budget forecast. A more reliable list builder would normalize ingredient identifiers, quantities, and units; support multiple pantry lots and expirations; handle fractional measures; and show the source of each subtraction.'
]),
('3.9 Tracking and Reporting Workflow',[
'Tracking operations include water additions and weight entries. The interface can mark planned meals as eaten. Progress calculations return daily points for a 7-, 14-, or 30-day window, average calories, adherence percentage, weight change, current weight, and target weight. In the inspected mock module, the trend is synthesized with sinusoidal variation around profile targets; adherence is fixed at 94%. These values are generated for demonstration and must not be attributed to actual user behavior.',
'Reports can be generated as weekly or monthly objects and converted to PDF by a local utility. The mock report store includes a seeded report with sample identity, sample period, metrics, summary, and recommendations. Newly generated report values draw from progress helper output and plan data; some report metrics are constants or proxies, such as logged meal counts and budget-based grocery spend. The “executive summary” text is assembled from those values and does not indicate a generative AI model unless separate source evidence exists.',
'The email route exposes sending an attachment workflow through a utility, but project files do not establish delivery to a configured mail server. The report describes this as an implemented integration path rather than verified email delivery. Persistent report ownership, recipient consent, retention, and deletion should be added before real personal data are used.'
]),
('3.10 Summary',[
'NutriPilot combines a profile-based calculator, hard rule filters, a deterministic slot planner, a heuristic recommender, an approximate pantry subtractor, and mock tracking/reporting. The architecture keeps these concerns in separate domain modules and routes, but all current data state is in process memory. The next chapter maps these methods to the concrete software stack and pages.'
])]
trim(sections3,{2:[2],3:[4],6:[2],7:[2]})
for h,ps in sections3:
    heading(h,2)
    for txt in ps: para(txt)
    if h.startswith('3.2'):
        table(['Requirement group','User outcome','Evidence location'],[
        ['Account and profile','Register, log in, onboarding, edit profile','Auth/onboarding/profile routes and pages'],['Targets','Calculate calorie and macro estimates','Nutrition calculate route; profile module'],['Planning','Generate and alter weekly slots','Meal plan and meal action routes'],['Food management','Browse/create recipes; manage pantry','Recipe and pantry routes/pages'],['Shopping','Generate/edit list from plan and pantry','Grocery generation route and pantry module'],['Tracking and reporting','Log, chart, produce report','Tracking/progress/report routes']],'Table 3.1  Principal functional requirements and user outcomes',[1.45,2.35,2.25],9)
    if h.startswith('3.4'):
        table(['Parameter','Implemented rule','Interpretation'],[['BMR','10w + 6.25h − 5a + s','Predictive estimate'],['Activity','A ∈ {1.20,1.375,1.55,1.725,1.90}','Category multiplier'],['Weight goal','round(p×7700/7) kcal/day','Simple configurable adjustment'],['Loss lower bound','max(1200,TDEE−D)','Fixed code floor; not personal advice'],['Macro default','50% carb, 25% protein, 25% fat','Converted at 4/4/9 kcal per gram']],'Table 3.2  Nutrition calculation constants and rules',[1.25,2.55,2.25],9)
    if h.startswith('3.5'):
        table(['Preference','Implemented check','Important limitation'],[['Allergy','Substring search in title, ingredient, allergen strings','Not certified safe; label completeness unknown'],['Disliked ingredient','Substring search in ingredient name','Synonyms and compound foods may be missed'],['Vegan / vegetarian','Required catalog tags','Tag accuracy not independently reviewed'],['Gluten-free / dairy-free','Tags plus selected allergen exclusions','Not cross-contact or certification check'],['Halal / kosher','Limited tag/string heuristics','Not formal religious certification'],['Keto','Reject if carbohydrate >30 g','Rule is a simple threshold']],'Table 3.3  Hard dietary constraints represented in the source',[1.25,2.55,2.25],8)
    if h.startswith('3.7'):
        table(['Feature component','Weight'],[['Meal-slot calorie fit','0.30'],['Diet tag overlap','0.20'],['Goal alignment','0.15'],['Cuisine/preference proxy','0.10'],['Budget fit','0.10'],['Preparation time','0.05'],['Interaction history','0.10'],['Pantry overlap','0.08'],['Total before cap','1.08']],'Table 3.4  Recommendation feature weights',[3.1,1.2],9)
    if h.startswith('3.3'): figure(TMP/'architecture.png','Figure 3.1  NutriPilot logical architecture, reconstructed from project modules.',6.4)
    if h.startswith('3.4'): figure(TMP/'nutrition_flow.png','Figure 3.2  Nutrition target calculation flow implemented in the application.',6.4)
    if h.startswith('3.6'): figure(TMP/'planning_flow.png','Figure 3.3  Planning, filtering, pantry, and grocery workflow.',6.4)
    if h.startswith('3.7'): figure(TMP/'recommendation_flow.png','Figure 3.4  Recommendation features and heuristic rank output.',6.4)

chapter(4,'Implementation and Work Flow')
sections4=[
('4.1 Introduction',[
'This chapter describes the project structure and implementation surfaces identified in the repository. Package configuration, README, route files, page files, domain modules, and requirement status records are the primary evidence. The implementation is a Next.js application with client-facing pages and server route handlers. No external database configuration was found in the reviewed documentation; the domain layer uses mock state held in memory.'
]),
('4.2 Application Structure',[
'The application uses the App Router structure under src/app. Authentication pages are grouped under an auth route group. Feature pages map to dashboard, onboarding, planner, recipes, pantry, grocery, tracking, progress, reports, recommendations, profile, and settings. API route handlers are nested under src/app/api and align with feature domains. Components under src/components contain shared planner, recipe, report, and UI elements. Typed request utilities are under src/lib/api; domain mock services live in src/lib/mock; separate folders hold nutrition calculations, email, and PDF generation.',
'This separation makes the main use cases discoverable. A route should generally remain an HTTP adapter, while business rules belong in domain functions. Current implementation does this for many flows, but the report does not assume every route has comprehensive validation or authorization. A route-by-route review and tests would be needed before publishing a formal API contract.',
'The UI application is designed around pages rather than a single multi-step workflow. The user can navigate to the planner, recipe catalog, pantry, grocery, tracking, progress, reports, recommendations, and settings. The project source contains responsive styling and reusable components, but no user-provided screenshots are included in the relevant NutriPilot project materials. Accordingly, this report uses source-derived architecture diagrams rather than inventing interface screenshots.'
]),
('4.3 Software Tools and Technology Stack',[
'Table 4.1 records the packages declared by the project manifest and README. Version values are taken from package.json where pinned and from the declared ranges otherwise. The report does not claim deployment or performance properties from a package name alone.'
]),
('4.4 User and API Workflows',[
'Registration and login are handled through dedicated pages and auth route handlers. The mock authentication module stores users in a process-level map, hashes passwords with scrypt and a random salt, issues HS256 JWTs, and verifies tokens with jose. Tokens are intended for HTTP-only cookies in the application flow. Login attempt counts are also kept in memory. The signing key defaults to a development string if AUTH_SECRET is missing; README correctly warns that this fallback must not be used in production. These design elements do not replace deployment security review.',
'Onboarding posts the user profile and triggers nutrition estimates. Subsequent profile requests read or update the profile. Planner generation returns a weekly plan. Meal operations can refresh, lock, swap, or change servings/eaten status. Pantry endpoints support item management. Grocery generation aggregates planned recipes against pantry state. Tracking endpoints record water and weight; progress returns chart-ready data. Reports can be generated and emailed through report routes. Settings operations update account or application preferences.',
'Figure 4.1 summarizes the user journey at a functional level. A production system would need to define expected status codes, validation errors, idempotency, and authorization behavior for every route. Those details are not inferred here where route evidence is absent.'
]),
('4.5 Domain Modules',[
'The nutrition module contains constants and a pure target-calculation function. The profile module associates a user profile with calculated nutrition. Recipe catalog and plan logic are colocated in the planner module. The constraints module evaluates profile eligibility. The interaction module stores preference events. Pantry logic manages items and shopping aggregation. Tracking returns daily and historical data. Reports combine profile, plan, and progress information before constructing a PDF. Recipes module stores custom recipes and static recommendation/food-bank examples.',
'This design supports focused unit tests. The available tests exercise nutrition calculation values and boundaries, weekly plan dimensions, positive meal data, lock/refresh behavior, day totals, pantry CRUD, expiry-date classification in a helper, and grocery-list consistency. Only three test files are present in the inspected location; test coverage of authentication, diet edge cases, recommendation ranking, and API authorization was not found there.',
'A future service-oriented implementation could replace each mock module with a repository interface backed by durable storage. The interface should define transaction boundaries for meal changes and grocery regeneration, user ownership for every record, and consistency requirements for derived data.'
]),
('4.6 Data Model and Mock Persistence',[
'Primary entities include users, profiles, recipes, weekly plans, days, meal slots, pantry items, grocery list items, interaction records, water logs, weight logs, report objects, and report PDF bytes. Most are represented by TypeScript interfaces in the API/domain modules. The repository’s current data layer is module-level variables, maps, arrays, or in-memory maps. Process restarts reset state; multiple application workers would not share the same state. This is explicit in the README.',
'The demo account is initialized in the mock authentication service. Its credentials are documented in README for local demonstration. Such credentials must never be treated as private user data or reused in a public deployment. The source includes sample user names and sample report values. They are demonstration data, not collected participants.',
'Derived fields such as daily nutrition totals and grocery remainder are recalculated from mutable plan and pantry objects. The implementation should be careful about accidental mutation and stale derived values. A persistent version would benefit from explicit schemas, validation, database constraints, migration history, and automated seed controls.'
]),
('4.7 Security and Configuration',[
'The authentication implementation has helpful prototype elements: salted scrypt password hashes, timing-safe comparison, signed short-lived tokens, and HTTP-only cookie use in the application. However, in-memory users and rate counters reset; the fallback JWT secret is weak and known from source; rate limiting is process-local; and settings/email behavior needs environment-specific configuration. The README flags the default secret, which must be replaced before deployment.',
'Personal profile information, weight history, allergies, and food preferences can be sensitive. A deployed service would need secure secret handling, durable but access-controlled records, transport security, CSRF and cookie policy review, authorization on every user-owned route, secure logging, retention rules, export/deletion support, and vulnerability testing. This report does not claim that these controls have been implemented or that the app has undergone a security audit.',
'The system should clearly label generated demo data and explain the source of any nutrition estimate. It should use non-alarmist and non-prescriptive language and permit users to correct inputs. If health-related use is contemplated, legal, privacy, accessibility, and clinical review must be addressed by qualified stakeholders.'
]),
('4.8 Functional Requirements Traceability',[
'IMPLEMENTATION_STATUS.md marks all 22 listed functional requirements as DONE. Its test column contains “Build” for each requirement, which records a project validation label but does not represent a distinct unit test for every row. This report preserves that distinction. Table 4.4 groups the requirements into application capabilities; Appendix A lists each item and the files/API named in the source matrix.',
'The available Vitest suites are narrower than the full matrix. Passing a unit test proves only the asserted case under the test environment. It does not establish accessibility, security, data integrity across restarts, email delivery, or production performance. Similarly, a page and route being present demonstrates code coverage of a workflow, not usability or health impact.'
]),
('4.9 Summary',[
'NutriPilot is implemented as a modular Next.js and TypeScript web application with route-based APIs, reusable feature components, and in-memory domain stores. The functional matrix reports broad feature completion, and three focused unit-test suites are present. The most important engineering boundaries are volatile state, development-oriented authentication configuration, and the absence of empirical user or nutrition validation.'
])]
trim(sections4,{3:[2],4:[2],5:[2]})
for h,ps in sections4:
    heading(h,2)
    for txt in ps: para(txt)
    if h.startswith('4.3'):
        table(['Layer','Technology / package','Role in project'],[['Framework','Next.js 16.3.4, App Router','Pages and route handlers'],['Language','TypeScript 5','Typed application and domain code'],['UI','React 19.2.8; Base UI; shadcn tooling','Components and interactive views'],['Styling','Tailwind CSS v4','Utility styling'],['Charts','Recharts','Progress visualization'],['Forms','React Hook Form; Zod resolver','Form state and validation integration'],['Authentication','jose; Node crypto scrypt','JWT operations and password hashing'],['Tests','Vitest 5; jsdom; Playwright','Unit and browser-test tooling'],['PDF/email','Project utilities; nodemailer types present','Report artifact/email integration points']],'Table 4.1  Software tools and technology stack',[1.2,2.4,2.65],8)
    if h.startswith('4.4'):
        figure(TMP/'architecture.png','Figure 4.1  Request flow through UI, route handlers, domain logic, and mock stores.',6.4)
        table(['Feature area','Page / route examples','Resulting user workflow'],[['Account','/login, /register; /api/auth/*','Create account, sign in/out, inspect current session'],['Profile','/onboarding, /profile; /api/profile','Set preferences and review target estimates'],['Planning','/planner; /api/meal-plans/*, /api/meals/*','Create and edit weekly meal slots'],['Pantry/shopping','/pantry, /grocery; /api/pantry/*','Maintain stock and build grocery list'],['Tracking','/tracking, /progress; /api/tracking, /api/progress','Record water/weight and view trends'],['Reporting','/reports; /api/reports/*','Generate, preview, and request email delivery']],'Table 4.2  Principal application routes and workflows',[1.25,2.65,2.35],8)
    if h.startswith('4.6'):
        table(['Entity','Prototype state','Persistence caveat'],[['Profile','Mock profile object','Process memory; demo initialization'],['Weekly plan','Plan with 7 days / 4 slots','Mutable module state; restart resets'],['Recipe','Catalog plus custom recipes','Curated/in-memory, limited provenance'],['Pantry/grocery','Item array and derived list','No durable inventory transaction'],['Tracking','Water/weight values and generated series','Some progress values synthetic'],['Report','Report objects and PDF byte cache','Process local; includes seeded data']],'Table 4.3  Core data entities and storage behavior',[1.25,2.35,2.65],8)
    if h.startswith('4.8'):
        table(['Requirement range','Capability cluster','Status in source matrix'],[['FR-01–03','Registration, authentication, onboarding','DONE'],['FR-04–05','Nutrition and macro targets','DONE'],['FR-06–12','Search, plan generation and meal edits, recommendations','DONE'],['FR-13–15','Pantry, grocery, leftover subtraction','DONE'],['FR-16–17','Tracking and progress','DONE'],['FR-18–19','Custom recipes and cooking mode','DONE'],['FR-20–22','Reports, email, settings/admin','DONE']],'Table 4.4  Functional coverage recorded by project matrix',[1.2,3.5,1.2],9)

chapter(5,'Testing, Results, and Evaluation')
sections5=[
('5.1 Evaluation Scope',[
'The available evidence is software-oriented. The repository includes source code, a project status matrix, and three Vitest test files. No participant dataset, nutritional outcome study, recommendation relevance labels, clinician review, user satisfaction survey, or production deployment data were supplied. It would therefore be misleading to report model accuracy, food recommendation accuracy, adherence improvement, or health outcomes.',
'This chapter reports what can be supported: the project matrix records all 22 functional requirements as complete; the available unit tests assert selected nutrition, planner, pantry, and grocery behaviors; and source inspection reveals deterministic or mock behavior in several modules. These are implementation and test results, not end-user efficacy results.'
]),
('5.2 Unit Test Evidence',[
'The nutrition suite tests female and male BMR examples, activity multipliers, weight-loss and weight-gain direction, a minimum calorie floor, and macro conversion for carbohydrate and protein. These assertions provide examples of arithmetic behavior at specified inputs. They do not test every possible profile value, unknown activity fallback, invalid ranges, rounding boundaries, custom macro persistence, or whether outputs are appropriate for a specific person.',
'The planner suite checks that generation returns seven days and four meals per day, each with a non-empty recipe and positive calories, positive serving counts, and a positive target. It also tests lock toggling, expected errors for missing IDs, refreshing unlocked meals, rejection of locked refreshes, and daily calorie totals from recipe values and servings. It does not test that every generated meal satisfies every allergy/diet/dislike combination, nor does it test variety or target coverage across a full week.',
'The pantry suite checks addition and deletion, basic expiry classification, grocery list presence, count consistency, pantry-subtraction flags, and auto-checking a fully covered item. The expiry logic is defined inline in the test helper rather than imported from a domain function, which means it does not independently validate a production expiry implementation. The grocery tests establish structural invariants but not correctness for unit conversion, synonyms, duplicate pantry records, or expiry-aware quantities.',
'The test file names and assertions are summarized in Table 5.1. The available Vitest suites were executed from the project root: all 32 assertions across the three test files passed in the observed run. This confirms only the cases in those files; it does not provide comprehensive validation. The project’s own matrix lists “Build” as the test entry for its features, and that is not equivalent to assertion coverage.'
]),
('5.3 Functional Coverage Results',[
'IMPLEMENTATION_STATUS.md contains 22 functional requirement rows, all marked DONE. The rows map registration/authentication and onboarding to pages and routes; target and macro functions to nutrition/profile code; meal editing and plan generation to planner components/routes; pantry and grocery support to mock services/routes; tracking and analytics to corresponding pages/routes; custom recipes/cooking mode to recipe components; and reporting/email/settings to report and settings routes.',
'This coverage result is a traceability statement from the repository. It supports that a feature path is represented in code, not that the path has been comprehensively verified. A formal acceptance test should define preconditions, success outcomes, failure responses, and authorization behavior for each requirement. End-to-end Playwright configuration exists, but the reviewed source inventory did not show e2e spec files; therefore no browser-level test result is reported.'
]),
('5.4 Algorithmic Behavior and Worked Examples',[
'A small arithmetic example clarifies the calculator without treating it as a health recommendation. For a hypothetical profile with age 28, weight 65 kg, height 168 cm, female offset, and moderate activity, the code’s equation gives BMR = 10(65)+6.25(168)−5(28)−161 = 1399 kcal/day. At the configured 1.55 activity multiplier, TDEE is round(1399×1.55)=2168 kcal/day. A 0.5 kg/week target pace yields a code delta of round(0.5×7700/7)=550 kcal/day. For a loss goal, the resulting value is max(1200,2168−550)=1618 kcal/day. This example matches the test input and illustrates arithmetic only; it is not a recommendation for an individual.',
'With the default macro shares applied to 1618 kcal, carbohydrate energy is 809 kcal, corresponding to round(809/4)=202 g; protein is 404.5 kcal, corresponding to 101 g after rounding; fat is 404.5 kcal, corresponding to round(404.5/9)=45 g. Independent rounding means the sum reconstructed from macro grams may not equal the exact calorie target.',
'The plan-generation tests establish structure, not quality. A plan is built by iterating seven weekdays and producing four slots each. Each slot selects from a pool using an index derived from weekday number. A locked slot can be reused on regeneration. A user’s declared filters influence the pool, but fallback behavior when no compliant recipes remain is a key edge case. A correctness-oriented test should assert zero violations over generated, refreshed, and swapped meals for a suite of profiles, and should assert a clear no-candidate response rather than a noncompliant fallback.',
'The recommendation score is a weighted combination that reaches 1.08 total nominal weight before clipping. If a candidate’s components are all maximal, the raw score exceeds one and the output is capped. This means equal high-scoring candidates may become indistinguishable after clipping. A future evaluation must inspect component outputs and ranking metrics, not just a single normalized value.',
'The grocery engine’s matching rule selects the first pantry item whose name is substring-related to a planned ingredient. If a recipe requires an amount q and a matched pantry row reports amount s, the conceptual remaining requirement is max(0,q−s), with a zero remainder checked. This arithmetic assumes compatible units and correct identity. Since those assumptions are not enforced by an ingredient ontology, the output should be treated as a planning aid.'
]),
('5.5 Results Interpretation',[
'The clearest positive result is integration breadth: the codebase contains aligned pages, typed API paths, and domain logic across account, profile, meal planning, food inventory, tracking, and reporting. The functional matrix provides a requirement inventory, while tests cover several core invariants. That is appropriate evidence for a capstone prototype.',
'The most important negative or limiting findings concern the semantics of displayed outputs. Calorie targets are equation-based estimates with a generic activity multiplier and fixed macro defaults. Plans are modular but not globally optimized. Recommendation scores are heuristic, hand-weighted, and not evaluated against user preference. Ingredient filtering depends on text and tags. Pantry matching is approximate. Progress displays can be generated from synthetic data. Reports can contain seeded sample values. These properties constrain what can be claimed from a successful UI demonstration.',
'The source contains no objective model comparison and no independent product evaluation. Consequently, the report does not include a score table that compares NutriPilot to other applications, does not claim improvements over baselines, and does not infer “accuracy” from the completion of functional requirements. The term results in this chapter refers to tests, traced features, and behaviors visible in code.'
]),
('5.6 Limitations of Available Evidence',[
'First, only three unit test files were found in the relevant test folder. Their cases are useful but not exhaustive. Second, the test runner output captured in this review did not include a final status line; therefore independent execution remains unverified in this report. Third, the SRS status table marks each requirement done but uses a generic “Build” label in the test column. Fourth, no runtime user study was supplied.',
'Fifth, the catalog data’s source, nutrient derivation, serving-size review, and allergen validation are not documented. Sixth, progress and sample report data include synthetic or seeded values. Seventh, all mock state is volatile across process restarts. Eighth, no measured performance, accessibility audit, security audit, or deployment environment report was included. These are evidence limitations, not proof that the application cannot be improved or that its interface is unusable.'
]),
('5.7 Evaluation Plan',[
'A staged evaluation can reduce risk and produce interpretable evidence. Stage one should test calculations against hand-computed fixtures and boundary cases, including unknown values, rounding, missing fields, goal changes, and custom macros. Domain tests should target every constraint combination and every meal operation, including empty candidate pools, direct swap attempts, string synonyms, and malicious or malformed inputs.',
'Stage two should validate catalog content. Each recipe needs a source, serving basis, nutrient reference, ingredient normalization, allergen review, diet-tag provenance, and update date. A qualified reviewer should define what the app can safely say about allergens and diet suitability. Uncertain labels should produce “unknown” rather than a false safe result.',
'Stage three should evaluate planning quality using fixed, reviewed profiles. Measures could include hard-constraint violation count, absolute daily calorie/macro deviation, meal repetition, ingredient reuse, time and budget feasibility, and manual edits required. Test cases should be source-controlled and split into development and holdout cases if tuning is performed.',
'Stage four should evaluate recommendations with user relevance judgments. Participants can rate blinded ranked choices for usefulness, fit, and acceptability. Report inter-rater variation, top-k metrics, and confidence intervals. Since the current model is heuristic, compare the current ranking to simple baselines such as catalog popularity or random eligible selection only after defining a suitable evaluation dataset.',
'Stage five should conduct usability testing of end-to-end tasks: complete onboarding; generate and alter a plan; identify a dietary conflict; add pantry stock; build a grocery list; log water/weight; and export a report. Measure completion rate, time, errors, comprehension of estimates, and perceived burden. Recruit and consent appropriately; do not infer clinical outcomes from short usability sessions.',
'A later health-outcome study would require a separately reviewed protocol, qualified nutrition expertise, appropriate participant safeguards, and evidence that the application’s food data and recommendations are suitable for the intended population. The current repository cannot support such a study without substantial changes.'
]),
('5.8 Summary',[
'The available results establish that the repository represents a broad set of functional workflows and contains focused tests for nutrition arithmetic, plan shape and operations, and pantry/grocery invariants. They do not establish clinical validity, ranking quality, user benefit, safe allergen handling, or production readiness. Future work should expand tests, validate food data, replace mock state, and evaluate usefulness with a documented protocol.'
])]
trim(sections5,{2:[1],4:[2],5:[1]})
for h,ps in sections5:
    heading(h,2)
    for txt in ps: para(txt)
    if h.startswith('5.2'):
        table(['Suite','Assertions represented','What it does not show'],[['Nutrition','BMR examples, activity factors, goal direction, calorie floor, macro conversions','Clinical suitability, all boundaries, every accepted input'],['Planner','7×4 structure, recipe presence, locks, refresh, daily totals','Weekly optimization, variety, all constraint paths'],['Pantry / grocery','CRUD, date helper behavior, count/subtraction consistency','Correct units, synonyms, food safety, live price']],'Table 5.1  Available automated unit-test coverage',[1.35,2.6,2.45],8)
    if h.startswith('5.3'):
        table(['Evidence source','Observed result','Evidence class'],[['SRS status matrix','22/22 requirement rows marked DONE','Project-reported traceability'],['Vitest files','Three domain test suites located','Source inventory'],['Model/health outcomes','No study results supplied','Not available'],['Browser end-to-end tests','Playwright dependency/config present; no test result claimed','Unverified']],'Table 5.2  Results and evidence status',[1.75,2.4,2.2],8)
    if h.startswith('5.5'):
        table(['Supported statement','Unsupported inference'],[['Unit tests assert selected calculation and state invariants','All profile cases are correct'],['Routes/pages represent broad workflows','Every requirement is production-ready'],['Mock modules return progress/report objects','Charts reflect observed behavior'],['Heuristic ranks eligible recipe objects','Recommendations are accurate or preferred'],['Profile filters exclude some catalog entries','Allergen safety is guaranteed']],'Table 5.3  Evidence boundary for interpreting project results',[3.0,3.15],8)
    if h.startswith('5.7'):
        table(['Evaluation domain','Suggested measures','Required evidence'],[['Calculation','Absolute numeric error vs fixtures; boundary pass rate','Reference fixtures and documented expected outputs'],['Constraints','Violation count by constraint and action path','Reviewed recipe metadata and test profiles'],['Planning','Target deviation, diversity, edits needed','Held-out profile cases and plan rubric'],['Recommendation','Precision@k, NDCG@k, preference ratings','Participant or expert relevance labels'],['Usability','Task success, time, error count, comprehension','Consent, protocol, recorded task data'],['Reliability','State survival, authorization, error handling','Durable storage and API test environment']],'Table 5.4  Proposed evaluation metrics and prerequisites',[1.2,2.35,2.6],8)

chapter(6,'Conclusion and Future Work')
sections6=[
('6.1 Introduction',[
'This chapter summarizes the NutriPilot implementation and the conclusions supported by the available project evidence. The report has treated source code, project documentation, and unit-test assertions as distinct evidence types. That distinction is essential because the application’s user-facing purpose relates to nutrition, while the implementation remains a capstone prototype without clinical evaluation.'
]),
('6.2 Summary of the System',[
'NutriPilot integrates account access, onboarding, profile-based energy and macro estimates, a curated recipe set, constrained meal planning, recipe actions, pantry-aware grocery generation, water and weight tracking, progress charts, and reports. The application uses Next.js App Router, React, and TypeScript, with feature pages, route handlers, typed API functions, and domain modules. Recipe filtering uses tags and string comparisons. A weekly plan uses deterministic slot pools. A recommendation module combines weighted feature scores and simple interaction history. Pantry subtraction uses approximate name matching.',
'The architecture is intentionally compact and depends on in-memory mock state. Some displayed values are seeded or generated. The project status document records 22 functional requirements as done, while available unit tests cover selected functions. No evidence in the supplied files establishes clinical outcomes or user-level recommendation performance.'
]),
('6.3 Contributions of the Project',[
'The project’s primary contribution is an integrated and inspectable software prototype. It connects planning, pantry, tracking, and reporting tasks that are often represented as separate screens. It provides a transparent calorie-target calculation and visible controls for changing meals. It organizes code into feature-specific pages, routes, API utilities, and domain modules. It also creates a basis for a more rigorous next phase by making the current rules and limitations identifiable.',
'The report’s contribution is an evidence-oriented account of the implementation. It documents exactly how the calculator, filters, plan generator, scorer, and grocery module behave; separates mock output from observed behavior; maps requirements to source paths; and identifies tests needed to support safety and usefulness claims.'
]),
('6.4 Limitations of the Current System',[
'The application is not a clinical nutrition service. Its target estimates use generic formula coefficients, activity categories, a fixed weight-change conversion, a 1200-kcal loss floor, and default macro shares. Its catalog is curated and small, and nutrition/allergen data provenance is not documented. String matching may miss synonyms or compound ingredients. Dietary tags are not certifications. The planner is deterministic and does not optimize whole-week adequacy, diversity, or budget. The recommendation score is hand-weighted, has coefficients totaling 1.08 before capping, and has not been validated. The grocery estimate lacks robust unit normalization and actual pricing. Progress and some report values are synthetic or seeded. State is volatile, multi-process behavior is unsupported, and production security has not been independently reviewed.',
'The available tests cover selected cases only; there is no reported user study, controlled experiment, independent ranking evaluation, food database audit, or deployment test. These limitations mean that software completion cannot be equated with real-world effectiveness.'
]),
('6.5 Future Work',[
'The first priority is data and safety. Add a reviewed food catalog with provenance, nutrient units, serving basis, ingredient identities, explicit allergen metadata, and diet-label evidence. Implement normalized ingredient identifiers and unit conversion. Ensure hard safety constraints are consistently enforced across generation, refresh, recommendation, and swap. Replace noncompliant fallbacks with a clear no-eligible-item state.',
'The second priority is persistence and security. Introduce a database with user isolation, migration support, transactional plan/grocery operations, durable rate limits, and auditable report history. Remove the default JWT secret and require secure environment configuration. Add authorization tests to every user-owned route, input validation, CSRF/cookie review, privacy controls, export/deletion, and retention policies.',
'The third priority is algorithm quality. Replace modulo selection with a documented constraint or optimization method that includes hard constraints and soft objectives such as calorie deviation, variety, cost, time, and ingredient reuse. Use consistent filtering in every action. Calibrate recommendation weights from development judgments and compare against simple baselines. Communicate missing data and uncertainty rather than forcing a score.',
'The fourth priority is evaluation. Expand unit tests to include edge cases and failure behavior; establish integration and browser tests; audit accessibility; and perform usability studies. Only after food data and safeguards are reviewed should the project consider nutrition outcome evaluation with qualified oversight. A deployed version should monitor performance, update data sources, and communicate that estimates do not replace professional advice.'
]),
('6.6 Final Remarks',[
'NutriPilot demonstrates how nutrition estimation, recipe constraints, planning, inventory support, tracking, and reporting can be organized into a coherent web application. The implementation is valuable as a software capstone and a platform for further work. The available evidence supports a functional prototype description, not a claim of safe personalized dietary prescription or measured health benefit. Clear data provenance, durable services, comprehensive constraint enforcement, and user-centered evaluation are the necessary next steps.'
])]
for h,ps in sections6:
    heading(h,2)
    for txt in ps: para(txt)

# References (verified source bibliography, only sources actually cited).
page(); p=para('REFERENCES',align=WD_ALIGN_PARAGRAPH.CENTER); p.runs[0].bold=True; p.runs[0].font.size=Pt(16)
refs=[
'[1] M. D. Mifflin, S. T. St Jeor, L. A. Hill, B. J. Scott, S. A. Daugherty, and Y. O. Koh, “A new predictive equation for resting energy expenditure in healthy individuals,” The American Journal of Clinical Nutrition, vol. 51, no. 2, pp. 241–247, 1990, doi: 10.1093/ajcn/51.2.241.',
'[2] World Health Organization, “Healthy diet,” Fact sheet, updated January 26, 2026. [Online]. Available: https://www.who.int/news-room/fact-sheets/detail/healthy-diet. Accessed October 7, 2026.',
'[3] G. Adomavicius and A. Tuzhilin, “Toward the next generation of recommender systems: A survey of the state-of-the-art and possible extensions,” IEEE Transactions on Knowledge and Data Engineering, vol. 17, no. 6, pp. 734–749, 2005, doi: 10.1109/TKDE.2005.99.',
'[4] L. E. Burke, J. Wang, and M. A. Sevick, “Self-monitoring in weight loss: A systematic review of the literature,” Journal of the American Dietetic Association, vol. 111, no. 1, pp. 92–102, 2011, doi: 10.1016/j.jada.2010.10.008.',
'[5] NutriPilot project repository, README.md, IMPLEMENTATION_STATUS.md, package.json, source code under src/, and available Vitest tests, supplied local project files, inspected October 2026.'
]
for ref in refs:
    p=doc.add_paragraph(); p.paragraph_format.left_indent=Inches(0.25); p.paragraph_format.first_line_indent=Inches(-0.25); p.paragraph_format.space_after=Pt(8); p.add_run(ref)

# Appendices.
chapter('A','Requirement Traceability')
para('The following table transcribes the SRS requirement IDs, status, and implementation locations from IMPLEMENTATION_STATUS.md. DONE is the project’s own status. It should not be read as independent test certification; the source table generally lists “Build” in its test column.')
requirements=[
('FR-01','User registration','DONE','src/app/(auth)/register/page.tsx','POST /api/auth/register'),('FR-02','Authentication','DONE','src/app/(auth)/login/page.tsx','POST /api/auth/login'),('FR-03','Onboarding','DONE','src/app/onboarding/page.tsx','POST /api/onboarding'),('FR-04','Nutrition target','DONE','src/app/api/nutrition/calculate/route.ts','POST /api/nutrition/calculate'),('FR-05','Macro target','DONE','src/app/profile/page.tsx','GET/PUT /api/profile'),('FR-06','Food search','DONE','src/components/planner/SwapModal.tsx','GET /api/meals/{id}/swap'),('FR-07','Plan generation','DONE','src/app/planner/page.tsx','POST /api/meal-plans/generate'),('FR-08','Meal refresh','DONE','src/components/planner/MealCard.tsx','POST /api/meals/{id}/refresh'),('FR-09','Meal lock','DONE','src/components/planner/MealCard.tsx','POST /api/meals/{id}/lock'),('FR-10','Meal swap','DONE','src/components/planner/SwapModal.tsx','POST /api/meals/{id}/swap'),('FR-11','Serving adjustment','DONE','src/components/planner/MealCard.tsx','PUT /api/meal-items/{id}'),('FR-12','Recommendation','DONE','src/app/recommendations/page.tsx','GET /api/recommendations'),('FR-13','Pantry','DONE','src/app/pantry/page.tsx','GET/POST/PUT/DELETE /api/pantry/items'),('FR-14','Grocery','DONE','src/app/grocery/page.tsx','GET/POST/PUT /api/grocery-lists/generate'),('FR-15','Leftovers','DONE','src/lib/mock/pantry.ts','Pantry subtraction engine'),('FR-16','Tracking','DONE','src/app/tracking/page.tsx','GET/POST /api/tracking'),('FR-17','Progress','DONE','src/app/progress/page.tsx','GET /api/progress'),('FR-18','Custom recipe','DONE','src/app/recipes/page.tsx','POST /api/recipes'),('FR-19','Cooking mode','DONE','src/components/recipes/CookingModeModal.tsx','Interactive cooking guide'),('FR-20','Report','DONE','src/app/reports/page.tsx','GET/POST /api/reports/generate'),('FR-21','Email','DONE','src/components/reports/ReportPreviewModal.tsx','POST /api/reports/{id}/email'),('FR-22','Admin/settings','DONE','src/app/settings/page.tsx','GET/PUT/POST /api/settings')]
table(['ID','Requirement','Status','Source location','API / backend'],requirements,'Table A.1  Requirement traceability copied from project status matrix',[0.55,1.05,0.55,2.65,1.5],7)
para('The matrix maps intended functional scope to source paths. It does not list acceptance criteria, test identifiers, or independent results for each requirement. A departmental submission should include the original SRS document if available; otherwise mark it [PROJECT INFORMATION REQUIRED].')

chapter('B','API and Route Inventory')
para('Table B.1 is derived from the app route paths present in src/app/api. It records path families, not complete request schemas or authorization policy. Consult the route implementation before relying on a contract.')
apirows=[('Auth','/api/auth/register, /login, /logout, /me','Account lifecycle and current session'),('Onboarding/profile','/api/onboarding, /api/profile, /api/nutrition/calculate','Profile setup and target calculation'),('Plans/meals','/api/meal-plans/generate, /api/meals/[id]/lock|refresh|swap, /api/meal-items/[id]','Plan creation and slot modifications'),('Pantry/grocery','/api/pantry/items, /api/grocery-lists/generate','Inventory and grocery list operations'),('Recipes/recommendations','/api/recipes, /api/recommendations','Catalog operations and candidate rankings'),('Tracking/progress','/api/tracking, /api/progress','Daily entries and chart data'),('Reports','/api/reports/generate, /api/reports/[id]/email','Report creation and email workflow'),('Settings','/api/settings','Account and app settings')]
table(['Domain','Route families','Purpose'],apirows,'Table B.1  API route inventory from source tree',[1.1,3.2,1.95],8)
para('The route list is useful for architectural orientation but does not establish REST compliance, production access control, or successful external email delivery. Authentication and authorization need tests that confirm one user cannot read or mutate another user’s data after persistence is introduced.')

chapter('C','Glossary and Evidence Notes')
gloss=[('Activity multiplier','A factor selected from a broad activity category to scale the BMR estimate.'),('BMR','The basal metabolic rate estimate returned by the nutrition calculation.'),('Candidate recipe','A catalog entry that may be filtered or ranked for a plan slot.'),('Hard constraint','A condition intended to exclude an option rather than merely lower its rank.'),('Heuristic score','A hand-designed numeric combination of features; it is not automatically a probability.'),('In-memory mock store','A process-local data structure used for demonstration; state is not durable across restarts.'),('Macro target','A carbohydrate, protein, and fat target expressed as grams and percentages.'),('TDEE','The implementation’s rounded activity-adjusted estimate derived from BMR.'),('Synthetic progress','Generated chart values that are not collected participant measurements.')]
table(['Term','Meaning in this report'],gloss,'Table C.1  Glossary',[1.65,4.6],9)
heading('C.1 Evidence map',2)
para('Project title and author names are taken from NutriPilot_Journal_Paper.tex and the project repository. The two register numbers in the cover and declaration are present in the earlier project context/reference report, but should be confirmed against official university records before final submission. M Pallavi’s register number, project guide, approval names, exact project dates, and any formal SRS sign-off are not established by the NutriPilot source files and are marked [INFORMATION REQUIRED].')
para('Technical details are derived from the NutriPilot journal source and inspected TypeScript modules. Technologies are derived from package.json and README. Functional status is copied from IMPLEMENTATION_STATUS.md. Test coverage is derived from the test files present under src/lib/mock/__tests__. The report intentionally excludes the unrelated road-accident LaTeX paper and its results assets.')
heading('C.2 Submission information to complete',2)
for item in ['[INFORMATION REQUIRED: Confirm all candidate names and register numbers]','[INFORMATION REQUIRED: Project guide name, designation, and signature]','[INFORMATION REQUIRED: Head of Department and examiner names/signatures]','[INFORMATION REQUIRED: Official academic year and submission date]','[PROJECT INFORMATION REQUIRED: Original SRS or approved requirement specification, if required by department]','[PROJECT INFORMATION REQUIRED: User-interface screenshots captured from the final NutriPilot build, if required]']:
    bullet(item)

# Normalize heading outline and add metadata.
doc.core_properties.title='NutriPilot Project Report'
doc.core_properties.subject='Complete academic project report based on NutriPilot project source files'
doc.core_properties.author='Pavan Aditya; G Sri Harsha; M Pallavi'
doc.core_properties.keywords='NutriPilot, nutrition, meal planning, capstone, project report'

# Keep all table rows from splitting across pages where possible; add repeat header row.
for t in doc.tables:
    trPr=t.rows[0]._tr.get_or_add_trPr(); rep=OxmlElement('w:tblHeader'); rep.set(qn('w:val'),'true'); trPr.append(rep)
    for row in t.rows:
        trPr=row._tr.get_or_add_trPr(); cant=OxmlElement('w:cantSplit'); trPr.append(cant)

doc.save(OUT)
print(f'Saved {OUT} ({OUT.stat().st_size} bytes)')
