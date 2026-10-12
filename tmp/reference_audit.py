import pdfplumber, re, collections
p=r"C:\Users\gnssh\OneDrive\Desktop\reference report.pdf"
d=pdfplumber.open(p)
print("PAGE_COUNT",len(d.pages))
for i,pg in enumerate(d.pages,1):
    lines=(pg.extract_text() or "").splitlines()
    print(f"\nPAGE {i}: "+" | ".join(lines[:5]))
    if i<=10:
        print("FULL:", " || ".join(lines))
        fonts=collections.Counter(round(c.get("size",0),1) for c in pg.chars)
        names=collections.Counter(c.get("fontname","") for c in pg.chars)
        print("SIZES",fonts.most_common(8),"FONTS",names.most_common(5))