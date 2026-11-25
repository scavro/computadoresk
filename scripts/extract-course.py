#!/usr/bin/env python3
"""
Extractor completo del curso Fundamentos de Computadores (UNED).
Genera:
- public/fuentes/*.pdf (con portadas encuadernadas en tema-1..4.pdf)
- public/covers/*.webp (portada general y portadillas de temas 1..4)
- public/figures/*.webp (figuras extraídas y recortadas de los temas 1..4)
- public/content/topic-{1..4}.json
- public/content/exercises-{1..3}.json
- public/content/sources.json
"""

from __future__ import annotations
import json
import os
import re
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image, ImageChops
from pypdf import PdfReader, PdfWriter

PROJ = Path(__file__).resolve().parent.parent
PARENT = PROJ.parent
APUNTES = PARENT / "APUNTES"
OUT_CONTENT = PROJ / "public" / "content"
OUT_FUENTES = PROJ / "public" / "fuentes"
OUT_FIGURES = PROJ / "public" / "figures"
OUT_COVERS = PROJ / "public" / "covers"

for d in (OUT_CONTENT, OUT_FUENTES, OUT_FIGURES, OUT_COVERS):
    d.mkdir(parents=True, exist_ok=True)


def run_pdftotext(pdf_path: Path, layout: bool = True, extra_args: list[str] | None = None) -> str:
    cmd = ["pdftotext"]
    if layout:
        cmd.append("-layout")
    if extra_args:
        cmd.extend(extra_args)
    cmd.extend([str(pdf_path), "-"])
    return subprocess.check_output(cmd, text=True)


def trim_whitespace(img: Image.Image, pad: int = 14) -> Image.Image:
    rgb = img.convert("RGB")
    bg = Image.new("RGB", rgb.size, (255, 255, 255))
    diff = ImageChops.difference(rgb, bg).convert("L")
    # Threshold faint noise
    diff = diff.point(lambda p: 255 if p > 12 else 0)
    bbox = diff.getbbox()
    if not bbox:
        return rgb
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(rgb.width, x1 + pad)
    y1 = min(rgb.height, y1 + pad)
    return rgb.crop((x0, y0, x1, y1))


def prepare_pdfs_and_covers() -> dict[str, int]:
    portadas_pdf = APUNTES / "Portadas_Fundamentos_de_Computadores.pdf"
    if not portadas_pdf.exists():
        print("Aviso: No se encontró APUNTES/, conservando PDFs actuales en public/fuentes/")
        return {}

    portadas_reader = PdfReader(str(portadas_pdf))
    page_counts: dict[str, int] = {}

    for t in (1, 2, 3, 4):
        src_pdf = APUNTES / f"TEMA {t}" / f"TEMA {t}.pdf"
        src_reader = PdfReader(str(src_pdf))
        writer = PdfWriter()
        writer.add_page(portadas_reader.pages[t])  # Page 2..5 = index 1..4
        for pg in src_reader.pages:
            writer.add_page(pg)
        dst = OUT_FUENTES / f"tema-{t}.pdf"
        with open(dst, "wb") as f:
            writer.write(f)
        page_counts[f"tema-{t}"] = len(src_reader.pages)

    copies = [
        (APUNTES / "TEMA 1" / "Tema1_ ejercicios.pdf", OUT_FUENTES / "ejercicios-tema-1.pdf"),
        (APUNTES / "TEMA 1" / "Tema1_ soluciones.pdf", OUT_FUENTES / "soluciones-tema-1.pdf"),
        (APUNTES / "TEMA 2" / "Tema02_ejercicios.pdf", OUT_FUENTES / "ejercicios-tema-2.pdf"),
        (APUNTES / "TEMA 2" / "Tema02_soluciones_ejercicios.pdf", OUT_FUENTES / "soluciones-tema-2.pdf"),
        (PARENT / "uned-2627-fc-t2-ejercicios_cache_enunciados.pdf", OUT_FUENTES / "ejercicios-cache-tema-2.pdf"),
        (APUNTES / "TEMA 3" / "Tema03_ejercicios.pdf", OUT_FUENTES / "ejercicios-tema-3.pdf"),
        (APUNTES / "TEMA 3" / "Tema03_soluciones_ejercicios.pdf", OUT_FUENTES / "soluciones-tema-3.pdf"),
        (APUNTES / "FC_información_básica.pdf", OUT_FUENTES / "informacion-basica.pdf"),
        (portadas_pdf, OUT_FUENTES / "portadas.pdf"),
    ]
    for src, dst in copies:
        if src.exists():
            shutil.copy2(src, dst)
            page_counts[dst.stem] = len(PdfReader(str(dst)).pages)

    guia_src = PARENT / "7103104-_2027.pdf"
    if guia_src.exists():
        shutil.copy2(guia_src, OUT_FUENTES / "guia.pdf")
    if (OUT_FUENTES / "guia.pdf").exists():
        page_counts["guia"] = len(PdfReader(str(OUT_FUENTES / "guia.pdf")).pages)

    with tempfile.TemporaryDirectory() as tmp:
        prefix = os.path.join(tmp, "cover")
        subprocess.run(["pdftoppm", "-png", "-r", "160", str(portadas_pdf), prefix], check=True)
        names = ["portada-general", "portada-tema-1", "portada-tema-2", "portada-tema-3", "portada-tema-4"]
        for idx, name in enumerate(names, start=1):
            img = Image.open(f"{prefix}-{idx}.png")
            img.save(OUT_COVERS / f"{name}.webp", "WEBP", quality=88, method=6)

    return page_counts


def parse_bbox_xml(pdf_path: Path) -> ET.Element:
    xml_str = run_pdftotext(pdf_path, layout=False, extra_args=["-bbox-layout"])
    xml_clean = re.sub(r"<!DOCTYPE[^>]*>", "", xml_str)
    xml_clean = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", xml_clean)
    return ET.fromstring(xml_clean)


def extract_vector_figures(topic: int, pdf_path: Path) -> dict[int, list[dict]]:
    """
    Para Tema 1 y Tema 2: usa pdftotext -bbox-layout para localizar pies 'Figura X.Y'
    y recorta la banda gráfica superior de la página renderizada a 180 DPI.
    Devuelve { page_number_1based: [ { fig_id, src, caption, y0, y1 } ] }
    """
    root = parse_bbox_xml(pdf_path)
    ns = "{http://www.w3.org/1999/xhtml}"

    figs_by_page: dict[int, list[dict]] = {}
    pages = root.findall(f".//{ns}page")

    for p_idx, page_el in enumerate(pages):
        p_num = p_idx + 1
        pw = float(page_el.attrib["width"])
        ph = float(page_el.attrib["height"])

        lines_info = []
        for block in page_el.findall(f".//{ns}block"):
            for line in block.findall(f"{ns}line"):
                words = [w.text or "" for w in line.findall(f"{ns}word")]
                text = " ".join(words).strip()
                if not text:
                    continue
                x0 = float(line.attrib["xMin"])
                y0 = float(line.attrib["yMin"])
                x1 = float(line.attrib["xMax"])
                y1 = float(line.attrib["yMax"])
                # Ignorar cabecera superior (y1 < 62) o número de página suelto al pie
                if y1 < 62:
                    continue
                if y0 > ph - 58 and re.match(r"^\d+$", text):
                    continue
                lines_info.append({"text": text, "x0": x0, "y0": y0, "x1": x1, "y1": y1, "w": x1 - x0})

        lines_info.sort(key=lambda item: (item["y0"], item["x0"]))

        # Localizar líneas que son pie de figura: empiezan por "Figura X.Y"
        cap_indices = []
        for idx, ln in enumerate(lines_info):
            m = re.match(rf"^Figura\s+({topic}\.\d+)\b(.*)$", ln["text"])
            if m and ln["x0"] < 310:
                # Comprobar que no es una frase normal tipo "Figura 2.9 muestra cómo..."
                rest = m.group(2).strip()
                if rest.startswith(("muestra", "ilustra", "representa", "compara", "se ")):
                    continue
                cap_indices.append((idx, m.group(1)))

        if not cap_indices:
            continue

        with tempfile.TemporaryDirectory() as tmp:
            prefix = os.path.join(tmp, "pg")
            subprocess.run(
                ["pdftoppm", "-png", "-r", "180", "-f", str(p_num), "-l", str(p_num), str(pdf_path), prefix],
                check=True,
            )
            png_files = sorted(Path(tmp).glob("pg-*.png"))
            if not png_files:
                continue
            page_img = Image.open(png_files[0])
            scale_x = page_img.width / pw
            scale_y = page_img.height / ph

            prev_limit_y = 64.0
            for cap_pos, (c_idx, fig_num) in enumerate(cap_indices):
                cap_line = lines_info[c_idx]
                # Unir líneas de continuación del pie de figura (inmediatamente debajo, margen similar)
                cap_texts = [cap_line["text"]]
                cap_end_y = cap_line["y1"]
                k = c_idx + 1
                while k < len(lines_info):
                    nxt = lines_info[k]
                    if nxt["y0"] - cap_end_y < 8.5 and not re.match(rf"^(Figura|Tabla|▷|Ejemplo|{topic}\.\d+)", nxt["text"]):
                        # Si empieza un párrafo nuevo con sangría normal tras pie corto, parar si la línea anterior acabó en punto y tiene ancho menor
                        if cap_texts[-1].endswith(".") and (nxt["y0"] - cap_end_y > 5.0):
                            break
                        cap_texts.append(nxt["text"])
                        cap_end_y = nxt["y1"]
                        k += 1
                    else:
                        break

                # Buscar hacia arriba desde c_idx - 1 la última línea de prosa real (ancha o alineada al margen izquierdo de texto)
                fig_top_y = prev_limit_y
                for j in range(c_idx - 1, -1, -1):
                    ln = lines_info[j]
                    if ln["y1"] <= prev_limit_y:
                        break
                    # ¿Es prosa normal del cuerpo o título de sección?
                    is_heading = bool(re.match(rf"^({topic}\.\d+(?:\.\d+)*\.?|–)\s+\S", ln["text"]))
                    is_left_margin_prose = ln["x0"] < 96 and (ln["w"] > 135 or ln["text"].endswith((".", ":", ";")))
                    is_wide_prose = ln["w"] > 260 or is_left_margin_prose or (ln["x0"] < 108 and len(ln["text"]) > 42 and not re.search(r"0x[0-9A-F]{2}|D\d+|A\d+", ln["text"]))
                    is_prev_caption_or_note = ln["text"].startswith(("Figura ", "Tabla ", "▷", "◀"))
                    if is_heading or is_wide_prose or is_prev_caption_or_note:
                        fig_top_y = max(prev_limit_y, ln["y1"] + 3.0)
                        break

                fig_bot_y = cap_line["y0"] - 2.0
                if fig_bot_y - fig_top_y >= 24.0:
                    crop_box = (
                        int(max(0, 42 * scale_x)),
                        int(max(0, fig_top_y * scale_y)),
                        int(min(page_img.width, (pw - 42) * scale_x)),
                        int(min(page_img.height, fig_bot_y * scale_y)),
                    )
                    cropped = trim_whitespace(page_img.crop(crop_box), pad=12)
                    if cropped.height >= 28 and cropped.width >= 60:
                        slug = f"t{topic}-fig-{fig_num.replace('.', '-')}.webp"
                        cropped.save(OUT_FIGURES / slug, "WEBP", quality=86, method=6)
                        figs_by_page.setdefault(p_num, []).append({
                            "fig_num": fig_num,
                            "src": f"./figures/{slug}",
                            "caption": " ".join(cap_texts),
                            "y0": fig_top_y,
                            "y1": cap_end_y,
                        })
                prev_limit_y = cap_end_y + 3.0

    return figs_by_page


def extract_embedded_figures(topic: int, pdf_path: Path) -> dict[int, list[dict]]:
    """
    Para Tema 3 y Tema 4: extrae las imágenes raster nativas embebidas con pdfimages -png -p.
    Devuelve { page_number_1based: [ { src, index_on_page } ] }
    """
    figs_by_page: dict[int, list[dict]] = {}
    with tempfile.TemporaryDirectory() as tmp:
        prefix = os.path.join(tmp, "emb")
        subprocess.run(["pdfimages", "-png", "-p", str(pdf_path), prefix], check=True)
        files = sorted(Path(tmp).glob("emb-*.png"))
        counter = 0
        for fpath in files:
            # emb-<page>-<num>.png
            m = re.match(r"emb-(\d+)-(\d+)\.png$", fpath.name)
            if not m:
                continue
            p_num = int(m.group(1))
            img = Image.open(fpath)
            if img.width < 120 or img.height < 60:
                continue
            counter += 1
            trimmed = trim_whitespace(img, pad=10)
            slug = f"t{topic}-img-p{p_num}-{counter}.webp"
            trimmed.save(OUT_FIGURES / slug, "WEBP", quality=86, method=6)
            figs_by_page.setdefault(p_num, []).append({
                "src": f"./figures/{slug}",
                "page": p_num,
                "idx": counter,
            })
    return figs_by_page


def clean_common_artifacts(text: str) -> str:
    text = text.replace("\x08", "")
    text = text.replace("\f", "\n")
    text = re.sub(r"\|\{z\}", "", text)
    # Reparación puntual conocida de pdftotext en sección 1.3.1 (raíz cuadrada perdida en √2)
    text = text.replace("expresarse de esta forma, como 2 o π", "expresarse de esta forma, como √2 o π")
    # Unir guiones de final de línea entre letras minúsculas
    text = re.sub(r"([a-záéíóúüñ])-\n\s*([a-záéíóúüñ])", r"\1\2", text)
    return text


def is_header_or_footer(line: str, topic: int) -> bool:
    s = line.strip()
    if not s:
        return False
    if re.match(r"^\d{1,3}$", s):
        return True
    if "Apuntes de Fundamentos de Computadores" in s and ("Díaz Martínez" in s or re.match(r"^\d+\s+Apuntes", s)):
        return True
    if s == "García":  # Salto de línea del encabezado largo "...Chaos\nGarcía"
        return True
    if re.match(rf"^Tema\s+{topic}[.:]\s+.+\s+\d+$", s):
        return True
    if re.match(r"^Índice general(\s+\d+)?$", s):
        return True
    if topic == 3 and s == "TEMA 3 UNIDAD DE ENTRADA/SALIDA":
        return True
    if topic == 4 and (
        s == "Fundamentos de Computadores"
        or re.match(r"^José Manuel Díaz Martínez,\s*Rocío Muñoz Mansilla y Dictino Chaos García\s+\d+$", s)
        or s in ("TEMA 4: UNIDAD CENTRAL DE", "PROCESAMIENTO (CPU)")
        or s.startswith("©José Manuel Díaz Martínez")
    ):
        return True
    return False


def looks_tabular_or_code(text: str) -> bool:
    lines = [ln for ln in text.splitlines() if ln.strip()]
    if len(lines) < 2:
        return False
    # Código ensamblador o pseudocódigo o escaleras de división / tablas con columnas espaciadas
    multi_gap_lines = sum(1 for ln in lines if len(re.findall(r"\S {3,}\S", ln.strip())) >= 1)
    asm_lines = sum(
        1
        for ln in lines
        if re.match(r"^\s*(LOAD|STORE|ADD|SUB|MUL|DIV|JMP|JZ|JN|CALL|RET|PUSH|POP|MOV|CMP|LW|SW|ADDI|BEQ|BNE|LDR|STR|B\.|li |la |mv )\b", ln)
    )
    if asm_lines >= 2:
        return True
    if multi_gap_lines >= 2 and multi_gap_lines / len(lines) >= 0.5:
        # Evitar falsos positivos de párrafos justificados normales
        avg_len = sum(len(ln.strip()) for ln in lines) / len(lines)
        if avg_len < 78:
            return True
    return False


def parse_topic_1_or_2(topic: int, title: str, skip_pages: int) -> dict:
    pdf_path = APUNTES / f"TEMA {topic}" / f"TEMA {topic}.pdf"
    figs_by_page = extract_vector_figures(topic, pdf_path)

    # Usamos bbox-layout también para ignorar el texto flotante dentro de las cajas de figuras recortadas
    root = parse_bbox_xml(pdf_path)
    ns = "{http://www.w3.org/1999/xhtml}"
    xml_pages = root.findall(f".//{ns}page")

    raw_text = run_pdftotext(pdf_path, layout=True)
    raw_pages = raw_text.split("\f")
    if raw_pages and not raw_pages[-1].strip():
        raw_pages.pop()

    sections: list[dict] = []
    current: dict | None = None
    buffer: list[str] = []
    mode = "paragraph"  # paragraph | note | example
    mode_title: str | None = None

    def flush():
        nonlocal buffer, mode, mode_title
        if not current or not buffer:
            buffer = []
            mode = "paragraph"
            mode_title = None
            return
        txt = clean_common_artifacts("\n".join(buffer)).strip()
        buffer = []
        if not txt:
            mode = "paragraph"
            mode_title = None
            return
        if mode in ("note", "example"):
            current["blocks"].append({"type": mode, "title": mode_title, "text": txt})
        elif looks_tabular_or_code(txt):
            current["blocks"].append({"type": "pre", "text": txt})
        else:
            # Colapsar saltos de línea simples de maquetación en prosa fluida
            collapsed = re.sub(r"\s*\n\s*", " ", txt).strip()
            current["blocks"].append({"type": "paragraph", "text": collapsed})
        mode = "paragraph"
        mode_title = None

    # Recoger palabras que están dentro del área gráfica de cada figura para descartar líneas sueltas del dibujo
    fig_noise_by_page: dict[int, set[str]] = {}
    for p_num, flist in figs_by_page.items():
        if p_num - 1 >= len(xml_pages):
            continue
        pg_el = xml_pages[p_num - 1]
        noise: set[str] = set()
        for ln_el in pg_el.findall(f".//{ns}line"):
            y0 = float(ln_el.attrib["yMin"])
            y1 = float(ln_el.attrib["yMax"])
            for fitem in flist:
                # Dentro del área del dibujo (encima del pie)
                if y0 >= fitem["y0"] - 1 and y1 <= fitem["y1"] - 10:
                    wtxt = " ".join((w.text or "") for w in ln_el.findall(f"{ns}word")).strip()
                    if wtxt and not wtxt.startswith("Figura "):
                        noise.add(re.sub(r"\s+", " ", wtxt))
        fig_noise_by_page[p_num] = noise

    for p_idx in range(skip_pages, len(raw_pages)):
        p_num = p_idx + 1
        page_lines = raw_pages[p_idx].splitlines()
        page_figs = list(figs_by_page.get(p_num, []))
        noise_set = fig_noise_by_page.get(p_num, set())
        skip_caption_continuation = False

        for raw_line in page_lines:
            if is_header_or_footer(raw_line, topic):
                continue

            clean_ln = raw_line.replace("\x08", "").rstrip()
            stripped = clean_ln.strip()
            norm = re.sub(r"\s+", " ", stripped)

            if skip_caption_continuation:
                if not stripped:
                    skip_caption_continuation = False
                    continue
                if not re.match(rf"^({topic}\.\d+|–|▷|Ejemplo\s+{topic}\.|Tabla\s+{topic}\.)", stripped) and len(stripped) < 95:
                    skip_caption_continuation = False
                    continue
                skip_caption_continuation = False

            # Descartar texto interno de diagrama que ya está en la imagen recortada
            if norm and norm in noise_set and not norm.startswith(("Figura ", "Tabla ", "Ejemplo ", "▷")):
                continue

            # Sección principal X.Y. o X.Y.Z.
            m_sec = re.match(rf"^\s*({topic}\.\d+(?:\.\d+)?\.)\s+(.+)$", clean_ln)
            if m_sec and "...." not in clean_ln and ". . ." not in clean_ln and len(m_sec.group(2)) < 120:
                flush()
                if current:
                    sections.append(current)
                sec_num = m_sec.group(1)
                sec_title = m_sec.group(2).strip()
                current = {
                    "id": f"s-{topic}-{sec_num.replace('.', '-').strip('-')}",
                    "number": sec_num,
                    "title": sec_title,
                    "page": p_num,
                    "pdfPage": p_num + 1,  # +1 por la portada añadida al PDF
                    "blocks": [],
                }
                continue

            if not current:
                continue

            # Subapartado con guion "– Título"
            m_sub = re.match(r"^\s*–\s+([A-ZÁÉÍÓÚÑ][^\n.]{2,85})$", clean_ln)
            if m_sub and mode == "paragraph":
                flush()
                current["blocks"].append({"type": "heading", "text": m_sub.group(1).strip()})
                continue

            # Pie de figura -> insertar bloque figure (con imagen si fue extraída)
            m_fig = re.match(rf"^Figura\s+({topic}\.\d+)\b(.*)$", stripped)
            if m_fig and not m_fig.group(2).strip().startswith(("muestra", "ilustra", "representa", "compara", "se ")):
                flush()
                fig_num = m_fig.group(1)
                matched_fig = next((f for f in page_figs if f["fig_num"] == fig_num), None)
                if matched_fig:
                    current["blocks"].append({
                        "type": "figure",
                        "src": matched_fig["src"],
                        "alt": matched_fig["caption"],
                        "text": matched_fig["caption"],
                    })
                    if len(matched_fig["caption"]) > len(stripped):
                        skip_caption_continuation = True
                else:
                    current["blocks"].append({"type": "caption", "text": stripped})
                continue

            # Pie de tabla
            if re.match(rf"^Tabla\s+{topic}\.\d+\s*[–—:\-.]", stripped):
                flush()
                current["blocks"].append({"type": "caption", "text": stripped})
                continue

            # Inicio de Nota ▷ Nota
            if stripped.startswith("▷"):
                flush()
                mode = "note"
                mode_title = "Nota"
                rest = re.sub(r"^▷\s*Nota\.?\s*", "", stripped)
                if "◀" in rest:
                    before, after = rest.split("◀", 1)
                    if before.strip():
                        buffer.append(before.strip())
                    flush()
                    if after.strip():
                        buffer.append(after.strip())
                elif rest:
                    buffer.append(rest)
                continue

            # Cierre de Nota ◀
            if mode == "note" and "◀" in clean_ln:
                before, after = clean_ln.split("◀", 1)
                if before.strip():
                    buffer.append(before.rstrip())
                flush()
                if after.strip():
                    buffer.append(after.strip())
                continue

            # Inicio de Ejemplo X.Y
            m_ex = re.match(rf"^Ejemplo\s+({topic}\.\d+)\b(.*)$", stripped)
            if m_ex:
                flush()
                mode = "example"
                mode_title = f"Ejemplo {m_ex.group(1)}"
                if m_ex.group(2).strip():
                    buffer.append(m_ex.group(2).strip())
                continue

            # Fin explícito de Ejemplo en T1/T2 marcado por \x08 al final de línea en raw_line
            if mode == "example" and "\x08" in raw_line and not stripped.startswith("Ejemplo"):
                if stripped:
                    buffer.append(clean_ln)
                flush()
                continue

            # Línea en blanco
            if not stripped:
                if mode == "paragraph":
                    flush()
                else:
                    buffer.append("")
                continue

            buffer.append(clean_ln)

    flush()
    if current:
        sections.append(current)

    return {
        "id": topic,
        "title": title,
        "source": f"tema-{topic}.pdf",
        "totalPages": len(raw_pages),
        "sections": sections,
    }


def parse_topic_3() -> dict:
    topic = 3
    pdf_path = APUNTES / "TEMA 3" / "TEMA 3.pdf"
    emb_figs = extract_embedded_figures(topic, pdf_path)
    raw_text = run_pdftotext(pdf_path, layout=True)
    raw_pages = raw_text.split("\f")
    if raw_pages and not raw_pages[-1].strip():
        raw_pages.pop()

    sections: list[dict] = []
    current: dict | None = None
    buffer: list[str] = []
    mode = "paragraph"
    mode_title: str | None = None

    def flush():
        nonlocal buffer, mode, mode_title
        if not current or not buffer:
            buffer = []
            mode = "paragraph"
            mode_title = None
            return
        txt = clean_common_artifacts("\n".join(buffer)).strip()
        buffer = []
        if not txt:
            mode = "paragraph"
            mode_title = None
            return
        if mode in ("note", "example"):
            current["blocks"].append({"type": mode, "title": mode_title, "text": txt})
        elif looks_tabular_or_code(txt):
            current["blocks"].append({"type": "pre", "text": txt})
        else:
            collapsed = re.sub(r"\s*\n\s*", " ", txt).strip()
            current["blocks"].append({"type": "paragraph", "text": collapsed})
        mode = "paragraph"
        mode_title = None

    for p_idx, page_str in enumerate(raw_pages):
        p_num = p_idx + 1
        page_imgs = list(emb_figs.get(p_num, []))
        img_cursor = 0

        for raw_line in page_str.splitlines():
            if is_header_or_footer(raw_line, topic):
                continue
            clean_ln = raw_line.rstrip()
            stripped = clean_ln.strip()

            # Encabezados 3.X o 3.X.Y o 3.X.Y.Z (evitando números con punto de miles como 3.110.400)
            m_head = re.match(r"^\s*(3\.[1-9](?:\.\d{1,2})*)\s+([A-ZÁÉÍÓÚÑ¿¡].+)$", clean_ln)
            if m_head and "...." not in clean_ln and len(m_head.group(2)) < 115:
                sec_num = m_head.group(1)
                sec_title = m_head.group(2).strip()
                # Convertir MAYÚSCULAS de primer nivel en formato legible manteniendo siglas
                if sec_title.isupper():
                    sec_title = sec_title.capitalize()
                    for acro in ("E/s", "Dma", "Cpu", "Gpu", "Pic", "Pe/s", "Rsi", "Ram", "Rom"):
                        sec_title = re.sub(rf"\b{re.escape(acro)}\b", acro.upper(), sec_title, flags=re.I)
                depth = sec_num.count(".")
                flush()
                if depth <= 2:
                    if current:
                        sections.append(current)
                    current = {
                        "id": f"s-3-{sec_num.replace('.', '-')}",
                        "number": f"{sec_num}.",
                        "title": sec_title,
                        "page": p_num,
                        "pdfPage": p_num + 1,
                        "blocks": [],
                    }
                elif current:
                    current["blocks"].append({"type": "heading", "text": f"{sec_num}. {sec_title}"})
                continue

            if not current:
                continue

            # Pie Figura 3.X
            m_fig = re.match(r"^Figura\s+(3\.\d+)\.?(\s+.*)?$", stripped)
            if m_fig and not (m_fig.group(2) or "").strip().startswith(("muestra", "ilustra", "se ")):
                flush()
                if img_cursor < len(page_imgs):
                    img_item = page_imgs[img_cursor]
                    img_cursor += 1
                    current["blocks"].append({
                        "type": "figure",
                        "src": img_item["src"],
                        "alt": stripped,
                        "text": stripped,
                    })
                else:
                    current["blocks"].append({"type": "caption", "text": stripped})
                continue

            # Ejemplo 3.X
            m_ex = re.match(r"^Ejemplo\s+(3\.\d+)\.?(\s+.*)?$", stripped)
            if m_ex:
                flush()
                mode = "example"
                mode_title = f"Ejemplo {m_ex.group(1)}"
                rest = (m_ex.group(2) or "").strip()
                if rest:
                    buffer.append(rest)
                continue

            if not stripped:
                if mode == "paragraph":
                    flush()
                elif mode == "example" and len(buffer) >= 4 and buffer[-1] == "":
                    flush()
                else:
                    buffer.append("")
                continue

            buffer.append(clean_ln)

        # Si quedaron imágenes embebidas en esta página sin pie explícito (ej. esquemas en mitad de ejemplo)
        flush()
        while current and img_cursor < len(page_imgs):
            img_item = page_imgs[img_cursor]
            img_cursor += 1
            current["blocks"].append({
                "type": "figure",
                "src": img_item["src"],
                "alt": f"Esquema del Tema 3 (pág. {p_num})",
                "text": f"Esquema ilustrativo · pág. {p_num}",
            })

    flush()
    if current:
        sections.append(current)

    return {
        "id": 3,
        "title": "Unidad de entrada/salida",
        "source": "tema-3.pdf",
        "totalPages": len(raw_pages),
        "sections": sections,
    }


def parse_topic_4() -> dict:
    topic = 4
    pdf_path = APUNTES / "TEMA 4" / "TEMA 4.pdf"
    emb_figs = extract_embedded_figures(topic, pdf_path)
    raw_text = run_pdftotext(pdf_path, layout=True)
    raw_pages = raw_text.split("\f")
    if raw_pages and not raw_pages[-1].strip():
        raw_pages.pop()

    sections: list[dict] = []
    current: dict = {
        "id": "s-4-intro",
        "number": "4.0.",
        "title": "Introducción",
        "page": 1,
        "pdfPage": 2,
        "blocks": [],
    }
    buffer: list[str] = []
    mode = "paragraph"
    mode_title: str | None = None

    def flush():
        nonlocal buffer, mode, mode_title
        if not buffer:
            mode = "paragraph"
            mode_title = None
            return
        txt = clean_common_artifacts("\n".join(buffer)).strip()
        buffer = []
        if not txt:
            mode = "paragraph"
            mode_title = None
            return
        if mode in ("note", "example"):
            current["blocks"].append({"type": mode, "title": mode_title, "text": txt})
        elif looks_tabular_or_code(txt):
            current["blocks"].append({"type": "pre", "text": txt})
        else:
            collapsed = re.sub(r"\s*\n\s*", " ", txt).strip()
            current["blocks"].append({"type": "paragraph", "text": collapsed})
        mode = "paragraph"
        mode_title = None

    for p_idx, page_str in enumerate(raw_pages):
        p_num = p_idx + 1
        page_imgs = list(emb_figs.get(p_num, []))
        img_cursor = 0

        for raw_line in page_str.splitlines():
            if is_header_or_footer(raw_line, topic):
                continue
            clean_ln = raw_line.rstrip()
            stripped = clean_ln.strip()

            if p_num == 1 and stripped == "Introducción":
                continue

            # Encabezados 4.X. o 4.X.Y. o 4.X.Y.Z.
            m_head = re.match(r"^\s*(4\.\d+(?:\.\d+)*\.)\s+([A-ZÁÉÍÓÚÑ¿¡].+)$", clean_ln)
            if m_head and "...." not in clean_ln and len(m_head.group(2)) < 120:
                sec_num = m_head.group(1)
                sec_title = m_head.group(2).strip()
                depth = sec_num.rstrip(".").count(".")
                flush()
                if depth <= 2:
                    if current["blocks"]:
                        sections.append(current)
                    current = {
                        "id": f"s-4-{sec_num.replace('.', '-').strip('-')}",
                        "number": sec_num,
                        "title": sec_title,
                        "page": p_num,
                        "pdfPage": p_num + 1,
                        "blocks": [],
                    }
                else:
                    current["blocks"].append({"type": "heading", "text": f"{sec_num} {sec_title}"})
                continue

            # Ejemplo: ...
            m_ex = re.match(r"^Ejemplo:\s*(.+)$", stripped)
            if m_ex:
                flush()
                mode = "example"
                mode_title = "Ejemplo"
                buffer.append(m_ex.group(1).strip())
                continue

            if not stripped:
                flush()
                # Si el párrafo recién cerrado menciona una Figura 4.X y hay imagen en la página, insertarla justo ahí
                if current["blocks"] and img_cursor < len(page_imgs):
                    last_txt = current["blocks"][-1].get("text", "")
                    m_ref = re.search(r"Figura\s+(4\.\d+)", last_txt)
                    if m_ref:
                        img_item = page_imgs[img_cursor]
                        img_cursor += 1
                        current["blocks"].append({
                            "type": "figure",
                            "src": img_item["src"],
                            "alt": f"Figura {m_ref.group(1)}",
                            "text": f"Figura {m_ref.group(1)} (pág. {p_num})",
                        })
                continue

            buffer.append(clean_ln)

        flush()
        while img_cursor < len(page_imgs):
            img_item = page_imgs[img_cursor]
            img_cursor += 1
            current["blocks"].append({
                "type": "figure",
                "src": img_item["src"],
                "alt": f"Esquema del Tema 4 (pág. {p_num})",
                "text": f"Esquema del Tema 4 · pág. {p_num}",
            })

    flush()
    if current["blocks"]:
        sections.append(current)

    return {
        "id": 4,
        "title": "Unidad central de procesamiento",
        "source": "tema-4.pdf",
        "totalPages": len(raw_pages),
        "sections": sections,
    }


def text_to_clean_blocks(raw: str, topic: int) -> list[dict]:
    lines = []
    for ln in raw.replace("\f", "\n").splitlines():
        if is_header_or_footer(ln, topic):
            continue
        # Limpiar cabeceras de ejercicios/soluciones
        s = ln.strip()
        if re.match(r"^Tema\s+\d+:\s+.+\s+\d+$", s):
            continue
        if re.match(r"^\d+\s+Tema\s+\d+:", s):
            continue
        lines.append(ln.rstrip())

    cleaned = clean_common_artifacts("\n".join(lines)).strip()
    chunks = re.split(r"\n\s*\n", cleaned)
    blocks: list[dict] = []
    for ch in chunks:
        c = ch.strip("\n")
        if not c.strip():
            continue
        if looks_tabular_or_code(c):
            blocks.append({"type": "pre", "text": c})
        else:
            blocks.append({"type": "paragraph", "text": c.strip()})
    return blocks


def split_by_regex(text: str, pattern: str) -> list[tuple[str, str]]:
    matches = list(re.finditer(pattern, text, re.M))
    out: list[tuple[str, str]] = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        out.append((m.group(1), text[start:end].strip()))
    return out


def parse_exercises_1() -> dict:
    ex_txt = run_pdftotext(OUT_FUENTES / "ejercicios-tema-1.pdf", layout=True)
    sol_txt = run_pdftotext(OUT_FUENTES / "soluciones-tema-1.pdf", layout=True)

    ex_chunks = [
        (k, v)
        for k, v in split_by_regex(ex_txt, r"^\s*(1\.\d+)\.?\s+[A-ZÁÉÍÓÚÑ(]")
        if "Ejercicios propuestos" not in v
    ]
    sol_map = dict(split_by_regex(sol_txt, r"^\s*(1\.\d+)\.?\s+[A-ZÁÉÍÓÚÑ(]"))

    exercises = []
    for key, stmt in ex_chunks:
        sol_raw = sol_map.get(key, "")
        # Quitar el enunciado repetido antes de "Solución:" en soluciones si aparece
        if "Solución:" in sol_raw:
            sol_raw = "Solución:\n" + sol_raw.split("Solución:", 1)[1].strip()
        exercises.append({
            "id": key,
            "number": key,
            "origin": "Material UNED",
            "statement": text_to_clean_blocks(stmt, 1),
            "solution": text_to_clean_blocks(sol_raw, 1),
        })
    return {"topic": 1, "exercises": exercises}


def build_extra_cache_exercises() -> tuple[dict, list[dict]]:
    extra_problem = {
        "id": "2.46",
        "number": "2.Extra",
        "origin": "Problema adicional de caché UNED",
        "statement": [
            {
                "type": "paragraph",
                "text": "Problema adicional de memoria caché (correspondencia asociativa por conjuntos).\nUn procesador dispone de una memoria principal de 256 B, direccionable por bytes (direcciones de 8 bits), y una memoria caché de 64 B dividida en bloques de 16 B.\nLa memoria caché está organizada mediante correspondencia asociativa por conjuntos de 2 vías (líneas por conjunto) y utiliza la política de reemplazo LRU. Inicialmente la memoria caché se encuentra completamente vacía.\nEl procesador realiza la siguiente secuencia de accesos a memoria en formato hexadecimal:\n0x02 → 0x44 → 0x0B → 0x80.",
            },
            {
                "type": "paragraph",
                "text": "Se pide:\n1. Descomponer la dirección de memoria principal en los campos de Etiqueta, Conjunto y Desplazamiento, indicando el número de bits de cada uno.\n2. Analizar paso a paso cada acceso determinando: bloque accedido, conjunto asignado, etiqueta, resultado (Acierto/Fallo) y la evolución del estado de la caché indicando cuál es el bloque LRU (Least Recently Used).\n3. Explicar brevemente qué bloque se habría expulsado en el último acceso si se hubiese utilizado FIFO en lugar de LRU.",
            },
        ],
        "solution": [
            {
                "type": "paragraph",
                "text": "1) Descomposición de la dirección de memoria principal (8 bits):\n• Memoria principal: 256 B = 2⁸ B con direccionamiento por bytes ⇒ dirección de n = 8 bits.\n• Tamaño de bloque / línea: 16 B = 2⁴ B ⇒ Desplazamiento d = 4 bits (bits b₃..b₀). Número de bloques en MP: 256 / 16 = 16 bloques (B0..B15).\n• Líneas de caché: N_LC = 64 B / 16 B = 4 líneas. Al ser asociativa por conjuntos de r = 2 vías: Q = N_LC / r = 4 / 2 = 2 = 2¹ conjuntos (Conjunto 0 y Conjunto 1) ⇒ Conjunto c = 1 bit (bit b₄), con q = j mod 2.\n• Etiqueta: e = n − c − d = 8 − 1 − 4 = 3 bits (bits b₇..b₅).",
            },
            {
                "type": "pre",
                "text": "Formato de dirección (8 bits):  [ Etiqueta: 3 bits | Conjunto: 1 bit | Desplazamiento: 4 bits ]\n\nAcceso  Hex    Binario (e|c|d)   Bloque j  Conjunto q  Etiq.  Resultado  Estado Conjunto 0 [Vía 0, Vía 1] y LRU\n------  -----  ----------------  --------  ----------  -----  ---------  -------------------------------------------------\n  1     0x02   000 | 0 | 0010      B0          0        000   FALLO      [V0: B0 (MRU), V1: vacía]\n  2     0x44   010 | 0 | 0100      B4          0        010   FALLO      [V0: B0 (LRU), V1: B4 (MRU)]\n  3     0x0B   000 | 0 | 1011      B0          0        000   ACIERTO    [V0: B0 (MRU), V1: B4 (LRU)]  <- se actualiza LRU\n  4     0x80   100 | 0 | 0000      B8          0        100   FALLO      [V0: B0 (LRU), V1: B8 (MRU)]  <- sale B4 (era LRU)",
            },
            {
                "type": "paragraph",
                "text": "2) Detalle paso a paso:\n• 0x02 (0000 0010₂): Bloque j = 0, Conjunto q = 0, Etiqueta = 000₂, Desplazamiento = 2. Fallo forzoso (caché vacía). Se carga B0 en Conjunto 0, Vía 0.\n• 0x44 (0100 0100₂): Bloque j = 4, Conjunto q = 0, Etiqueta = 010₂, Desplazamiento = 4. Fallo forzoso. Se carga B4 en Conjunto 0, Vía 1 (libre). El bloque menos recientemente usado (LRU) pasa a ser B0.\n• 0x0B (0000 1011₂): Bloque j = 0, Conjunto q = 0, Etiqueta = 000₂, Desplazamiento = 11. Acierto en Vía 0 (localidad espacial dentro de B0). Al referenciarse B0 en este instante, B0 pasa a ser MRU y el bloque LRU pasa a ser B4.\n• 0x80 (1000 0000₂): Bloque j = 8, Conjunto q = 0, Etiqueta = 100₂, Desplazamiento = 0. Fallo de conflicto (Conjunto 0 lleno). LRU expulsa a B4 (Vía 1) y carga B8. Estado final del Conjunto 0: Vía 0 = B0 (LRU), Vía 1 = B8 (MRU); el Conjunto 1 permanece vacío.",
            },
            {
                "type": "paragraph",
                "text": "3) Comparación con política FIFO:\nCon FIFO (First-In, First-Out) los aciertos no alteran el orden de llegada. B0 entró en el acceso 1 y B4 entró en el acceso 2; el acierto sobre B0 en el acceso 3 (0x0B) no renueva su antigüedad. Por tanto, en el último acceso (0x80), FIFO habría expulsado al Bloque B0 (el primero que entró) en lugar del Bloque B4, dejando en el Conjunto 0 los bloques B8 y B4.",
            },
        ],
    }

    quiz = [
        {
            "id": "Q1",
            "question": "¿Cuál es la función principal de la memoria caché y dónde se ubica físicamente en los computadores actuales?",
            "options": [
                "A) Incrementar la capacidad total de almacenamiento secundario del equipo.",
                "B) Reducir los tiempos de espera del procesador situándose de forma integrada en el propio procesador, entre este y la memoria principal.",
                "C) Sustituir completamente a las memorias DRAM debido a su menor coste por byte.",
                "D) Almacenar únicamente los datos de las aplicaciones que no caben en la memoria RAM.",
            ],
            "correct": 1,
            "explanation": "La caché es una memoria SRAM rápida integrada en el procesador (niveles L1/L2/L3) para amortiguar la diferencia de velocidad entre CPU y DRAM.",
        },
        {
            "id": "Q2",
            "question": "¿En qué principios se fundamenta la eficacia de una memoria caché de pequeña capacidad para satisfacer la mayoría de los accesos a memoria?",
            "options": [
                "A) Principio de inclusión y exclusión de datos.",
                "B) Principio de localidad temporal y localidad espacial.",
                "C) Principio de coherencia y sincronización de buses.",
                "D) Principio de aleatoriedad y fragmentación de memoria.",
            ],
            "correct": 1,
            "explanation": "La localidad temporal (reutilizar datos recientes) y espacial (acceder a direcciones contiguas del mismo bloque cargado) permiten altas tasas de acierto.",
        },
        {
            "id": "Q3",
            "question": "En el método de correspondencia directa, ¿cómo se descompone una dirección de memoria principal de n bits?",
            "options": [
                "A) Solo en dos campos: Etiqueta (e) y Desplazamiento (d).",
                "B) En tres campos: Etiqueta (e), Conjunto (c) y Desplazamiento (d).",
                "C) En tres campos: Etiqueta (e), Línea (b) y Desplazamiento (d).",
                "D) En dos campos: Bloque (f) y Conjunto (c).",
            ],
            "correct": 2,
            "explanation": "En correspondencia directa cada bloque tiene una única línea posible determinada por el campo Línea (b), además de Etiqueta (e) y Desplazamiento (d).",
        },
        {
            "id": "Q4",
            "question": "Si un sistema dispone de N_LC líneas de caché, ¿qué función determina la línea i asignada a un bloque de memoria principal j en correspondencia directa?",
            "options": [
                "A) i = j × N_LC",
                "B) i = j mod N_LC",
                "C) i = j / N_LC",
                "D) i = j + N_LC",
            ],
            "correct": 1,
            "explanation": "La operación módulo (i = j mod N_LC) asigna cíclicamente cada bloque j de memoria principal a su única línea candidata i.",
        },
        {
            "id": "Q5",
            "question": "¿Qué diferencia principal presenta la correspondencia totalmente asociativa respecto a la correspondencia directa?",
            "options": [
                "A) Cada bloque solo puede colocarse en la línea 0 de la caché.",
                "B) Cualquier bloque de memoria principal se puede almacenar en cualquiera de las líneas de la memoria caché.",
                "C) La dirección de memoria principal exige un campo reservado para la línea.",
                "D) No necesita almacenar etiquetas en el directorio de la caché.",
            ],
            "correct": 1,
            "explanation": "En totalmente asociativa no hay restricción de ubicación: cualquier bloque puede ocupar cualquier línea y la dirección solo se divide en Etiqueta y Desplazamiento.",
        },
        {
            "id": "Q6",
            "question": "Una memoria caché asociativa por conjuntos de r vías divide sus N_LC líneas en Q conjuntos. ¿Cómo se calculan Q y el conjunto q asignado al bloque j?",
            "options": [
                "A) Q = N_LC · r  y  q = j + Q",
                "B) Q = N_LC / r  y  q = j mod Q",
                "C) Q = r / N_LC  y  q = j × Q",
                "D) Q = N_LC − r  y  q = j / Q",
            ],
            "correct": 1,
            "explanation": "Las N_LC líneas se agrupan en Q = N_LC / r conjuntos de r líneas cada uno, y el bloque j va al conjunto q = j mod Q.",
        },
        {
            "id": "Q7",
            "question": "¿Qué diferencia a la política de reemplazo LRU de la política FIFO?",
            "options": [
                "A) FIFO reemplaza el bloque consultado más recientemente y LRU el más antiguo.",
                "B) FIFO selecciona el bloque que primero se incorporó a la caché, mientras que LRU selecciona el bloque que lleva más tiempo sin ser utilizado.",
                "C) LRU solo se utiliza en correspondencia directa y FIFO en asociativa por conjuntos.",
                "D) FIFO actualiza el orden en cada acierto de lectura y LRU no modifica prioridades.",
            ],
            "correct": 1,
            "explanation": "FIFO atiende solo al instante de carga inicial; LRU registra los aciertos y descarta el bloque menos recientemente referenciado.",
        },
        {
            "id": "Q8",
            "question": "¿En qué se diferencian la escritura inmediata (write-through) y la escritura diferida (write-back)?",
            "options": [
                "A) Write-through escribe solo en la memoria principal; write-back escribe solo en los registros del procesador.",
                "B) Write-through actualiza simultáneamente la caché y la memoria principal; write-back actualiza inicialmente solo la caché y pospone la actualización en memoria principal hasta reemplazar el bloque modificado (usando un dirty bit M).",
                "C) Write-through requiere un bit de modificación (M = 1) por línea; write-back no necesita directorio.",
                "D) Write-back actualiza la memoria principal en cada ciclo de reloj.",
            ],
            "correct": 1,
            "explanation": "Write-back reduce el tráfico al bus escribiendo solo en caché marcando el bit de modificación M = 1, volcando a memoria principal únicamente al expulsar esa línea.",
        },
        {
            "id": "Q9",
            "question": "En un procesador con niveles L1, L2 y L3, ¿cuál es la estructura y características típicas de la caché L1?",
            "options": [
                "A) Es la más grande y lenta, compartida por todos los núcleos del sistema.",
                "B) Es privada del núcleo, la más rápida y de menor capacidad, dividida habitualmente en L1-I (instrucciones) y L1-D (datos).",
                "C) Es una memoria unificada que solo almacena datos y excluye instrucciones.",
                "D) Se ubica físicamente en el módulo de la memoria RAM externa.",
            ],
            "correct": 1,
            "explanation": "L1 es privada de cada núcleo, de mínima latencia y suele separarse en caché de instrucciones (L1-I) y caché de datos (L1-D) para evitar conflictos estructurales.",
        },
        {
            "id": "Q10",
            "question": "En un sistema con tiempo de acceso a caché t_c, tasa de fallos m = 1 − h y penalización por fallo PF, ¿cuál es la fórmula del tiempo medio de acceso a memoria (t_am)?",
            "options": [
                "A) t_am = t_c · (1 − h) + PF",
                "B) t_am = t_c + (1 − h) · PF = t_c + m · PF",
                "C) t_am = (t_c + PF) / m",
                "D) t_am = h · t_c · PF",
            ],
            "correct": 1,
            "explanation": "Todo acceso consulta primero la caché (t_c) y únicamente la fracción de fallos m = 1 − h incurre en la penalización adicional PF.",
        },
    ]
    return extra_problem, quiz


def parse_exercises_2() -> dict:
    ex_txt = run_pdftotext(OUT_FUENTES / "ejercicios-tema-2.pdf", layout=True)
    sol_txt = run_pdftotext(OUT_FUENTES / "soluciones-tema-2.pdf", layout=True)

    ex_txt = re.sub(r"^\s*2\.10\.\s+Ejercicios propuestos.*$", "", ex_txt, flags=re.M)
    sol_txt = re.sub(r"^\s*2\.11\.\s+Soluciones ejercicios propuestos.*$", "", sol_txt, flags=re.M)

    ex_chunks = split_by_regex(ex_txt, r"^ {0,4}(2\.\d+)\.?\s+\S")
    sol_map = dict(split_by_regex(sol_txt, r"^ {0,4}(2\.\d+)\.\s+\S"))

    exercises = []
    for key, stmt in ex_chunks:
        sol_raw = sol_map.get(key, "")
        if "Solución:" in sol_raw:
            sol_raw = "Solución:\n" + sol_raw.split("Solución:", 1)[1].strip()
        exercises.append({
            "id": key,
            "number": key,
            "origin": "Material UNED",
            "statement": text_to_clean_blocks(stmt, 2),
            "solution": text_to_clean_blocks(sol_raw, 2),
        })

    extra_problem, quiz = build_extra_cache_exercises()
    exercises.append(extra_problem)

    return {"topic": 2, "exercises": exercises, "quiz": quiz}


def parse_exercises_3() -> dict:
    ex_txt = run_pdftotext(OUT_FUENTES / "ejercicios-tema-3.pdf", layout=True)
    sol_txt = run_pdftotext(OUT_FUENTES / "soluciones-tema-3.pdf", layout=True)

    ex_chunks = split_by_regex(ex_txt, r"^\s*Ejercicio\s+(3\.\d+)\.")
    sol_map = dict(split_by_regex(sol_txt, r"^\s*Ejercicio\s+(3\.\d+)\."))

    exercises = []
    for key, stmt in ex_chunks:
        # Limpiar cabeceras de sección 3.2 PROBLEMAS que queden al final de 3.9
        stmt_clean = re.sub(r"\n\s*3\.2\s+PROBLEMAS\s*$", "", stmt, flags=re.M)
        sol_raw = sol_map.get(key, "")
        sol_raw = re.sub(r"\n\s*3\.2\s+PROBLEMAS\s*$", "", sol_raw, flags=re.M)
        if "Solución:" in sol_raw:
            sol_raw = "Solución:\n" + sol_raw.split("Solución:", 1)[1].strip()
        num_int = int(key.split(".")[1])
        category = "Autoevaluación UNED" if num_int <= 9 else "Problema UNED"
        exercises.append({
            "id": key,
            "number": key,
            "origin": category,
            "statement": text_to_clean_blocks(stmt_clean, 3),
            "solution": text_to_clean_blocks(sol_raw, 3),
        })
    return {"topic": 3, "exercises": exercises}


def write_json(name: str, payload: dict) -> None:
    out_file = OUT_CONTENT / name
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)


def main() -> None:
    prepare_pdfs_and_covers()

    # Limpiar figuras antiguas antes de regenerar
    for old in OUT_FIGURES.glob("*.webp"):
        old.unlink()

    t1 = parse_topic_1_or_2(1, "Representación de la información y estructura básica de un computador", skip_pages=2)
    t2 = parse_topic_1_or_2(2, "Unidad de memoria", skip_pages=4)
    t3 = parse_topic_3()
    t4 = parse_topic_4()

    ex1 = parse_exercises_1()
    ex2 = parse_exercises_2()
    ex3 = parse_exercises_3()

    sources = {
        "documents": [
            {
                "id": "portadas",
                "title": "Portadas del Bloque I",
                "file": "portadas.pdf",
                "pages": 5,
                "description": "Portada general de la asignatura y portadillas editoriales de los Temas 1 a 4.",
            },
            {
                "id": "tema-1",
                "title": "Apuntes del Tema 1 (con portada)",
                "file": "tema-1.pdf",
                "pages": 93,
                "description": "Representación de la información y estructura básica de un computador.",
            },
            {
                "id": "ejercicios-1",
                "title": "Ejercicios del Tema 1",
                "file": "ejercicios-tema-1.pdf",
                "pages": 4,
                "description": "Los 27 enunciados propuestos del Tema 1.",
            },
            {
                "id": "soluciones-1",
                "title": "Soluciones del Tema 1",
                "file": "soluciones-tema-1.pdf",
                "pages": 35,
                "description": "Desarrollo completo de los 27 ejercicios del Tema 1.",
            },
            {
                "id": "tema-2",
                "title": "Apuntes del Tema 2 completo (con portada)",
                "file": "tema-2.pdf",
                "pages": 139,
                "description": "Unidad de memoria: conceptos, semiconductores, módulos DDR, memoria caché, asociativa y secundaria (HDD/SSD/ópticos/cinta).",
            },
            {
                "id": "ejercicios-2",
                "title": "Ejercicios del Tema 2",
                "file": "ejercicios-tema-2.pdf",
                "pages": 12,
                "description": "Los 45 enunciados propuestos de la Unidad de memoria.",
            },
            {
                "id": "soluciones-2",
                "title": "Soluciones del Tema 2",
                "file": "soluciones-tema-2.pdf",
                "pages": 69,
                "description": "Desarrollo completo de los 45 ejercicios del Tema 2.",
            },
            {
                "id": "ejercicios-cache-2",
                "title": "Problema y cuestionario extra de Memoria Caché (Tema 2)",
                "file": "ejercicios-cache-tema-2.pdf",
                "pages": 5,
                "description": "Problema de caché asociativa por conjuntos (LRU vs FIFO) y 10 preguntas de autoevaluación.",
            },
            {
                "id": "tema-3",
                "title": "Apuntes del Tema 3 completo (con portada)",
                "file": "tema-3.pdf",
                "pages": 83,
                "description": "Unidad de entrada/salida: controladores, E/S programada, interrupciones, DMA, procesadores de E/S y GPU.",
            },
            {
                "id": "ejercicios-3",
                "title": "Ejercicios y autoevaluación del Tema 3",
                "file": "ejercicios-tema-3.pdf",
                "pages": 6,
                "description": "9 cuestiones de autoevaluación y 9 problemas de Entrada/Salida.",
            },
            {
                "id": "soluciones-3",
                "title": "Soluciones del Tema 3",
                "file": "soluciones-tema-3.pdf",
                "pages": 14,
                "description": "Soluciones razonadas de las 18 actividades del Tema 3.",
            },
            {
                "id": "tema-4",
                "title": "Apuntes del Tema 4 completo (con portada)",
                "file": "tema-4.pdf",
                "pages": 93,
                "description": "Unidad central de procesamiento: puertas y ALU, repertorios RISC-V/ARM/x86-64, ruta de datos, segmentación, control y GPUs/NPUs.",
            },
            {
                "id": "informacion",
                "title": "Información básica 2026–2027",
                "file": "informacion-basica.pdf",
                "pages": 2,
                "description": "Temario oficial de 10 temas, evaluación y normas del examen presencial.",
            },
            {
                "id": "guia",
                "title": "Guía docente completa 2026–2027",
                "file": "guia.pdf",
                "pages": 12,
                "description": "Equipo docente, competencias, plan de trabajo de 150 horas y bibliografía.",
            },
        ]
    }

    write_json("topic-1.json", t1)
    write_json("topic-2.json", t2)
    write_json("topic-3.json", t3)
    write_json("topic-4.json", t4)
    write_json("exercises-1.json", ex1)
    write_json("exercises-2.json", ex2)
    write_json("exercises-3.json", ex3)
    write_json("sources.json", sources)

    fig_count = len(list(OUT_FIGURES.glob("*.webp")))
    for t in (t1, t2, t3, t4):
        ex_blocks = sum(1 for s in t["sections"] for b in s["blocks"] if b["type"] == "example")
        fig_blocks = sum(1 for s in t["sections"] for b in s["blocks"] if b["type"] == "figure")
        print(
            f"Tema {t['id']}: {len(t['sections'])} secciones, {t['totalPages']} págs., "
            f"{ex_blocks} bloques de ejemplo, {fig_blocks} figuras insertadas."
        )
    print(
        f"Ejercicios: T1={len(ex1['exercises'])}, T2={len(ex2['exercises'])} (+{len(ex2['quiz'])} test caché), "
        f"T3={len(ex3['exercises'])}. Total imágenes de figuras={fig_count}."
    )


if __name__ == "__main__":
    main()
