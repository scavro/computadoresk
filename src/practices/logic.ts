export type BinFraccResult = {
  sign: '' | '-';
  integer: string;
  frac: string;
  exact: boolean;
  steps: string[];
};

export function decToBinInt(n: number): { bin: string; steps: string[] } {
  if (!Number.isFinite(n) || !Number.isInteger(n)) throw new Error('Introduce un entero no negativo.');
  if (n < 0) throw new Error('Usa solo valores no negativos.');
  if (n === 0) return { bin: '0', steps: ['0 ÷ 2 = 0 resto 0'] };
  let x = n;
  const steps: string[] = [];
  const remainders: string[] = [];
  while (x > 0) {
    const r = x % 2;
    steps.push(`${x} ÷ 2 = ${Math.floor(x / 2)} resto ${r}`);
    remainders.push(r.toString());
    x = Math.floor(x / 2);
  }
  return { bin: remainders.reverse().join(''), steps };
}

export function binIntToDec(s: string): { dec: number; steps: string[] } {
  const clean = s.replace(/\s+/g, '');
  if (!/^[01]+$/.test(clean)) throw new Error('Solo se admiten 0 y 1.');
  const steps: string[] = [];
  let sum = 0;
  for (let i = 0; i < clean.length; i++) {
    const bit = Number(clean[clean.length - 1 - i]);
    const val = bit * 2 ** i;
    if (bit === 1) steps.push(`2^${i} · 1 = ${val}`);
    sum += val;
  }
  return { dec: sum, steps: steps.length ? steps.reverse() : ['Valor 0'] };
}

export function decToBinFrac(n: number, maxFrac = 12): BinFraccResult {
  if (!Number.isFinite(n) || n < 0) throw new Error('Introduce un número >= 0.');
  const intPart = Math.floor(n);
  const frac = n - intPart;
  const { bin: binInt, steps } = decToBinInt(intPart);
  const fracBits: string[] = [];
  let exact = true;
  let f = frac;
  let count = 0;
  while (f > 0 && count < maxFrac) {
    const prod = f * 2;
    const b = Math.floor(prod);
    fracBits.push(b.toString());
    steps.push(`${f.toFixed(6)} × 2 = ${prod.toFixed(6)} -> bit ${b}`);
    f = prod - b;
    count++;
    if (f === 0) break;
  }
  if (f > 0) exact = false;
  return { sign: '', integer: binInt, frac: fracBits.join('') || '0', exact, steps };
}

export function decToHex(n: number): { hex: string; steps: string[] } {
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) throw new Error('Introduce un entero no negativo.');
  if (n === 0) return { hex: '0', steps: ['0 ÷ 16 = 0 resto 0'] };
  let x = n;
  const steps: string[] = [];
  const map = '0123456789ABCDEF';
  const rem: string[] = [];
  while (x > 0) {
    const r = x % 16;
    steps.push(`${x} ÷ 16 = ${Math.floor(x / 16)} resto ${r} (${map[r]})`);
    rem.push(map[r]);
    x = Math.floor(x / 16);
  }
  return { hex: rem.reverse().join(''), steps };
}

export function hexToDec(s: string): { dec: number; steps: string[] } {
  const clean = s.replace(/\s+/g, '').toUpperCase();
  if (!/^[0-9A-F]+$/.test(clean)) throw new Error('Solo hex válido 0-9A-F.');
  const map: Record<string, number> = { '0':0,'1':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'A':10,'B':11,'C':12,'D':13,'E':14,'F':15 };
  const steps: string[] = [];
  let sum = 0;
  for (let i = 0; i < clean.length; i++) {
    const pow = clean.length - 1 - i;
    const v = map[clean[i]];
    steps.push(`16^${pow} × ${v} (${clean[i]}) = ${v * 16 ** pow}`);
    sum += v * 16 ** pow;
  }
  return { dec: sum, steps };
}

export function minBitsForElements(n: number): { bits: number; total: number; spare: number } {
  if (!Number.isInteger(n) || n <= 0) throw new Error('N debe ser un entero positivo.');
  const bits = Math.ceil(Math.log2(n));
  const total = 2 ** bits;
  return { bits, total, spare: total - n };
}

export function unsigned(n: number, bits: number): string {
  if (!Number.isInteger(n) || n < 0) throw new Error('Valor no negativo.');
  const max = 2 ** bits - 1;
  if (n > max) throw new Error(`Desbordamiento. Máximo para ${bits} bits: ${max}.`);
  return n.toString(2).padStart(bits, '0');
}

export function signMagnitude(n: number, bits: number): string {
  if (bits < 2) throw new Error('Se necesitan al menos 2 bits.');
  const sign = n < 0 ? '1' : '0';
  const mag = Math.abs(Math.trunc(n));
  const maxMag = 2 ** (bits - 1) - 1;
  if (mag > maxMag) throw new Error(`Magnitud fuera de rango para signo-magnitud (${bits} bits).`);
  return sign + mag.toString(2).padStart(bits - 1, '0');
}

export function onesComplement(n: number, bits: number): string {
  const absVal = Math.abs(Math.trunc(n));
  const max = 2 ** bits - 1;
  if (absVal > max) throw new Error('Valor fuera de rango.');
  if (n >= 0) return unsigned(n, bits);
  const mag = (2 ** bits - 1) ^ absVal;
  return mag.toString(2).padStart(bits, '0');
}

export function twosComplement(n: number, bits: number): string {
  const min = -(2 ** (bits - 1));
  const max = 2 ** (bits - 1) - 1;
  if (n < min || n > max) throw new Error(`Fuera de rango [-${2**(bits-1)}, ${max}] para ${bits} bits.`);
  if (n >= 0) return unsigned(n, bits);
  const val = (2 ** bits + n) >>> 0;
  return val.toString(2).padStart(bits, '0');
}

export function fixedUnsigned(n: number, frac: number): { bin: string; rangeMax: number; res: number; value: number } {
  if (n <= 0 || frac < 0 || !Number.isInteger(n) || !Number.isInteger(frac)) throw new Error('Formato inválido.');
  const res = 2 ** -frac;
  const rangeMax = 2 ** n - res;
  return { bin: (Math.round(n * 2 ** frac) / 2 ** frac).toString(2), rangeMax, res, value: rangeMax };
}

export function fixedTwos(n: number, frac: number, val: number): { rep: string; rangeMin: number; rangeMax: number; res: number } {
  if (n <= 0 || frac < 0 || !Number.isInteger(n) || !Number.isInteger(frac)) throw new Error('Formato inválido.');
  const res = 2 ** -frac;
  const rangeMin = -(2 ** (n - 1));
  const rangeMax = 2 ** (n - 1) - res;
  const scaled = Math.round(val * 2 ** frac);
  const minScaled = Math.round(rangeMin * 2 ** frac);
  const maxScaled = Math.round(rangeMax * 2 ** frac);
  if (scaled < minScaled || scaled > maxScaled) throw new Error('Valor fuera del rango del formato.');
  let rep = (scaled % (2 ** n)).toString(2).padStart(n, '0');
  if (rep.length > n) rep = rep.slice(-n);
  return { rep, rangeMin, rangeMax, res };
}

export function iee754Single(val: number): { bits: string; s: string; e: string; f: string; hex: string } {
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setFloat32(0, val, false);
  const u = view.getUint32(0);
  const bits = u.toString(2).padStart(32, '0');
  return { bits, s: bits.slice(0,1), e: bits.slice(1,9), f: bits.slice(9), hex: u.toString(16).toUpperCase().padStart(8,'0') };
}

export function imageSize(w: number, h: number, bpp: number): { pixels: number; bytes: number; mib: number } {
  if (w <= 0 || h <= 0 || bpp <= 0) throw new Error('Valores inválidos.');
  const pixels = w * h;
  const bytes = (pixels * bpp) / 8;
  return { pixels, bytes, mib: bytes / (1024 ** 2) };
}

export function audioSize(durationS: number, sr: number, bps: number, channels: number): { bytes: number; mib: number } {
  if (durationS <= 0 || sr <= 0 || bps <= 0 || channels <= 0) throw new Error('Valores inválidos.');
  const bytes = (durationS * sr * bps * channels) / 8;
  return { bytes, mib: bytes / (1024 ** 2) };
}

export function videoSize(durationS: number, w: number, h: number, bpp: number, fps: number): { bytes: number; mib: number } {
  if (durationS <= 0 || w <= 0 || h <= 0 || bpp <= 0 || fps <= 0) throw new Error('Valores inválidos.');
  const frames = durationS * fps;
  const bytes = (frames * w * h * bpp) / 8;
  return { bytes, mib: bytes / (1024 ** 2) };
}

export function cpuTiming(freqGHz: number, ni: number, cpi: number) {
  if (freqGHz <= 0 || ni <= 0 || cpi <= 0) throw new Error('Valores inválidos.');
  const fHz = freqGHz * 1e9;
  const TclkNs = 1000 / freqGHz;
  const Nc = ni * cpi;
  const T = Nc / fHz;
  const mips = (ni / T) / 1e6;
  return { TclkNs, Nc, T, mips };
}

export function busBw(bits: number, mtps: number): { bwBs: number; bwMBs: number; bwGBs: number } {
  if (bits <= 0 || mtps <= 0) throw new Error('Valores inválidos.');
  const bwBs = mtps * 1e6 * bits;
  const bwMBs = bwBs / 8 / 1e6;
  const bwGBs = bwBs / 8 / 1e9;
  return { bwBs, bwMBs, bwGBs };
}

export function busOcc(bwEffMBs: number, toS: number, tS: number): { po: number; vT: number } {
  if (tS <= 0) throw new Error('Tiempo total inválido.');
  const po = (toS / tS) * 100;
  const vT = (bwEffMBs * toS) / tS;
  return { po, vT };
}

export function memoryInfo(units: number, bytesPerUnit: number, wordBits: number) {
  if (units <= 0 || bytesPerUnit <= 0 || wordBits <= 0) throw new Error('Valores inválidos.');
  const capBytes = units * bytesPerUnit;
  const bitsDir = Math.ceil(Math.log2(units));
  const words = capBytes / (wordBits / 8);
  return { capBytes, capKiB: capBytes / 1024, capMiB: capBytes / (1024 ** 2), bitsDir, words: Math.floor(words) };
}

export function memoryExpand(c0N: number, c0L: number, n: number, l: number) {
  if (c0N <= 0 || c0L <= 0 || n <= 0 || l <= 0) throw new Error('Valores inválidos.');
  const r = Math.ceil(l / c0L);
  const q = Math.ceil(n / c0N);
  const total = r * q;
  const type = l === c0L && n > c0N ? 'unidades' : n === c0N && l > c0L ? 'bits' : n > c0N && l > c0L ? 'combinada' : 'igual';
  const bitsSel = Math.ceil(Math.log2(q));
  return { r, q, total, type, bitsSel };
}

export function ddrBw(freqMHz: number, widthBits: number): { rateMtps: number; bwGBs: number } {
  if (freqMHz <= 0 || widthBits <= 0) throw new Error('Valores inválidos.');
  const rateMtps = freqMHz * 2;
  const bwGBs = (rateMtps * 1e6 * widthBits) / 8 / 1e9;
  return { rateMtps, bwGBs };
}
