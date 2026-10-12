from PIL import Image, ImageDraw
import glob
files=sorted(glob.glob(r'E:\FoAI_Capstone\tmp\reference_pages\ref-*.png'))
canvas=Image.new('RGB',(1500,1500),'white')
d=ImageDraw.Draw(canvas)
for k,f in enumerate(files):
    im=Image.open(f).convert('RGB')
    im.thumbnail((450,650))
    x=(k%3)*500+25; y=(k//3)*750+20
    canvas.paste(im,(x,y))
    d.text((x,y+660),f'Page {k+1}',fill='black')
canvas.save(r'E:\FoAI_Capstone\tmp\reference_pages\contact.png')