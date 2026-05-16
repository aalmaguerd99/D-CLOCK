from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1242, 2688
BG        = (237, 234, 228)
BLACK     = (13,  13,  12)
GRAY      = (140, 138, 130)
GRAY_LITE = (195, 192, 185)
SEP       = (210, 205, 195)
BLUE      = (37,  99,  235)
WHITE     = (255, 255, 255)

OUT = os.path.join(os.path.dirname(__file__), "ios")
FP  = r"C:\Windows\Fonts"

def F(name, size):
    for fname in [name, name.replace("bd",""), "arial.ttf"]:
        try:
            return ImageFont.truetype(os.path.join(FP, fname), size)
        except:
            pass
    return ImageFont.load_default()

def tw(font, text):
    b = font.getbbox(text)
    return b[2] - b[0]

def cx(draw, text, y, font, color):
    draw.text(((W - tw(font, text)) // 2, y), text, font=font, fill=color)

# ── Shared components ────────────────────────────────────────────────────────

def status_bar(d):
    f = F("arialbd.ttf", 52)
    d.text((80, 58), "12:06", font=f, fill=BLACK)
    bx = W - 170
    d.rounded_rectangle([(bx, 68), (bx+110, 100)], radius=6, outline=BLACK, width=3)
    d.rounded_rectangle([(bx, 68), (bx+65,  100)], radius=5, fill=BLACK)
    d.rectangle([(bx+113, 78), (bx+118, 90)], fill=BLACK)

def icon_fp(d, cx_, cy, col):
    for r in [12, 20, 28, 36]:
        d.arc([(cx_-r, cy-r), (cx_+r, cy+r)], 200, 340, fill=col, width=4)
    d.ellipse([(cx_-5, cy-5), (cx_+5, cy+5)], fill=col)

def icon_clk(d, cx_, cy, col):
    r = 28
    d.ellipse([(cx_-r, cy-r), (cx_+r, cy+r)], outline=col, width=4)
    d.line([(cx_, cy), (cx_, cy-16)], fill=col, width=4)
    d.line([(cx_, cy), (cx_+13, cy+5)], fill=col, width=4)

def icon_per(d, cx_, cy, col):
    d.ellipse([(cx_-16, cy-44), (cx_+16, cy-12)], outline=col, width=4)
    d.arc([(cx_-34, cy-8), (cx_+34, cy+36)], 0, 180, fill=col, width=4)

def tab_bar(d, active):
    TY = H - 230
    d.line([(0, TY), (W, TY)], fill=SEP, width=2)
    labels = ["Registro", "Historial", "Perfil"]
    icons  = [icon_fp, icon_clk, icon_per]
    for i, (label, icon) in enumerate(zip(labels, icons)):
        icx = W // 6 + i * (W // 3)
        icy = TY + 80
        if i == active:
            d.ellipse([(icx-55, icy-55), (icx+55, icy+55)], fill=BLACK)
            ic = WHITE
        else:
            ic = GRAY
        icon(d, icx, icy, ic)
        lf = F("arialbd.ttf" if i == active else "arial.ttf", 36)
        lc = BLACK if i == active else GRAY
        lw = tw(lf, label)
        d.text((icx - lw//2, icy+65), label, font=lf, fill=lc)

# ── Screen 1: Registro ───────────────────────────────────────────────────────

def make_registro():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    status_bar(d)

    # D99-TECH header
    d.polygon([(95,202),(118,182),(141,202),(118,222)], fill=BLUE)
    d.text((158, 186), "D99-TECH", font=F("arial.ttf", 44), fill=GRAY)

    # Big time
    ft = F("arialbd.ttf", 196)
    cx(d, "12:06 p.m.", 308, ft, BLACK)

    # Date
    cx(d, "Viernes, 15 De Mayo", 530, F("arial.ttf", 52), GRAY)

    # Divider
    d.line([(70, 628), (W-70, 628)], fill=SEP, width=2)

    # Employee name
    d.text((70, 668), "Juan Carlos Garcia Lopez", font=F("arialbd.ttf", 78), fill=BLACK)

    # Badge
    d.text((70, 778), "087  ·  TECNICO", font=F("arial.ttf", 50), fill=GRAY)

    # Status
    d.ellipse([(70, 872), (98, 900)], fill=BLACK)
    d.text((115, 860), "SIN REGISTRO", font=F("arialbd.ttf", 44), fill=BLACK)

    # Register button
    d.rounded_rectangle([(70, 960), (W-70, 1160)], radius=32, fill=BLACK)
    cx(d, "REGISTRAR ENTRADA", 996, F("arialbd.ttf", 58), WHITE)
    cx(d, "Toca para tomar foto y fichar", 1082, F("arial.ttf", 44), (175,172,165))

    # Registros hoy
    d.text((70, 1250), "REGISTROS HOY", font=F("arial.ttf", 38), fill=GRAY)
    d.text((70, 1308), "Sin registros aún", font=F("arial.ttf", 48), fill=GRAY_LITE)

    tab_bar(d, 0)
    return img

# ── Screen 2: Historial ──────────────────────────────────────────────────────

def make_historial():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    status_bar(d)

    d.text((70, 170), "HISTORIAL HOY", font=F("arial.ttf", 40), fill=GRAY)
    d.text((70, 228), "Juan Carlos Garcia Lopez", font=F("arialbd.ttf", 78), fill=BLACK)
    d.line([(0, 368), (W, 368)], fill=SEP, width=2)

    rows = [
        ("Hoy · Jueves 15 Mayo",  "↑ 09:01",  "↓ 06:00",  "8h 59min"),
        ("Miércoles 14 Mayo",      "↑ 08:58",  "↓ 06:05",  "9h 07min"),
        ("Martes 13 Mayo",         "↑ 09:05",  "↓ 05:45",  "8h 40min"),
        ("Lunes 12 Mayo",          "↑ 08:55",  "↓ 05:30",  "8h 35min"),
        ("Viernes 9 Mayo",         "↑ 09:10",  "↓ 06:15",  "9h 05min"),
        ("Jueves 8 Mayo",          "↑ 09:00",  "↓ 06:00",  "9h 00min"),
    ]

    y = 405
    for date, ent, sal, total in rows:
        d.text((70, y),    date,  font=F("arial.ttf",   40), fill=GRAY)
        d.text((70, y+54), ent,   font=F("arialbd.ttf", 54), fill=BLACK)
        d.text((640,y+54), sal,   font=F("arialbd.ttf", 54), fill=BLACK)
        d.text((70, y+122),total, font=F("arial.ttf",   40), fill=GRAY)
        d.line([(70, y+175),(W-70, y+175)], fill=SEP, width=1)
        y += 200

    tab_bar(d, 1)
    return img

# ── Screen 3: Perfil ─────────────────────────────────────────────────────────

def make_perfil():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    status_bar(d)

    d.text((70, 170), "PERFIL", font=F("arial.ttf", 40), fill=GRAY)

    # Avatar circle
    acx, acy, ar = W//2, 460, 130
    d.ellipse([(acx-ar, acy-ar), (acx+ar, acy+ar)], fill=(200,195,185))
    # Person silhouette (scaled up)
    d.ellipse([(acx-42, acy-68), (acx+42, acy+10)], fill=WHITE)
    d.chord([(acx-90, acy+10), (acx+90, acy+120)], 0, 180, fill=WHITE)

    # Name
    cx(d, "Juan Carlos Garcia Lopez", 645, F("arialbd.ttf", 62), BLACK)
    cx(d, "Empleado #087",             730, F("arial.ttf",   50), GRAY)

    # Badge
    bt = "TECNICO"
    bw = tw(F("arialbd.ttf", 42), bt) + 74
    bx = (W - bw) // 2
    d.rounded_rectangle([(bx, 820), (bx+bw, 886)], radius=33, fill=(216,211,203))
    cx(d, bt, 833, F("arialbd.ttf", 42), BLACK)

    d.line([(70, 930), (W-70, 930)], fill=SEP, width=2)

    items = [
        ("Empresa",        "D99-TECH"),
        ("Departamento",   "Técnico"),
        ("Horario",        "09:00 a.m. – 06:00 p.m."),
        ("Días laborales", "Lunes a Viernes"),
    ]
    y = 965
    for lbl, val in items:
        d.text((70, y),    lbl, font=F("arial.ttf",   42), fill=GRAY)
        d.text((70, y+58), val, font=F("arialbd.ttf", 54), fill=BLACK)
        d.line([(70, y+132),(W-70, y+132)], fill=SEP, width=1)
        y += 158

    # Logout button
    by = H - 440
    d.rounded_rectangle([(70, by), (W-70, by+120)], radius=25,
                        outline=SEP, width=2, fill=BG)
    cx(d, "Cerrar sesión", by+38, F("arialbd.ttf", 52), BLACK)

    tab_bar(d, 2)
    return img

# ── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for fname, fn in [
        ("screenshot-1-registro.png",  make_registro),
        ("screenshot-2-historial.png", make_historial),
        ("screenshot-3-perfil.png",    make_perfil),
    ]:
        path = os.path.join(OUT, fname)
        fn().save(path, "PNG")
        print(f"OK  {path}  (1242x2688)")
    print("\nListo — sube las 3 imagenes a App Store Connect.")
