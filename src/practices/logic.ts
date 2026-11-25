export type BinFraccResult = {
  sign: '' | '-';
  integer: string;
  frac: string;
  exact: boolean;
  steps: string[];
};

export function binToDec(s: string): { dec: number; steps: string[] } {
  const clean = s.replace(/\s+/g, '');
  if (!/^[01]+(?:\.[01]+)?$/.test(clean)) throw new Error('Usa dígitos binarios y, opcionalmente, una parte fraccionaria.');
  const [integer, fraction = ''] = clean.split('.');
  const result = binIntToDec(integer);
  let dec = result.dec;
  const steps = [...result.steps];
  for (let i = 0; i < fraction.length; i++) {
    const bit = Number(fraction[i]);
    const value = bit * 2 ** -(i + 1);
    if (bit === 1) steps.push(`2^-${i + 1} · 1 = ${value}`);
    dec += value;
  }
  return { dec, steps };
}

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
  if (!Number.isInteger(n) || !Number.isInteger(bits) || bits < 2) throw new Error('Introduce un entero y un formato de al menos 2 bits.');
  const absVal = Math.abs(n);
  const maxMag = 2 ** (bits - 1) - 1;
  if (absVal > maxMag) throw new Error(`Fuera de rango [${-maxMag}, ${maxMag}] para ${bits} bits.`);
  if (n >= 0) return unsigned(n, bits);
  const mag = 2 ** bits - 1 - absVal;
  return mag.toString(2).padStart(bits, '0');
}

export function excessM(n: number, bits: number, m = 2 ** (bits - 1)): string {
  if (!Number.isInteger(n) || !Number.isInteger(bits) || bits < 1 || !Number.isInteger(m) || m < 0) throw new Error('Formato o valor inválido.');
  return unsigned(n + m, bits);
}

export function twosComplement(n: number, bits: number): string {
  if (!Number.isInteger(n) || !Number.isInteger(bits) || bits < 2) throw new Error('Introduce un entero y un formato de al menos 2 bits.');
  const min = -(2 ** (bits - 1));
  const max = 2 ** (bits - 1) - 1;
  if (n < min || n > max) throw new Error(`Fuera de rango [-${2**(bits-1)}, ${max}] para ${bits} bits.`);
  if (n >= 0) return unsigned(n, bits);
  const val = 2 ** bits + n;
  return val.toString(2).padStart(bits, '0');
}

export function fixedUnsigned(n: number, frac: number): { bin: string; rangeMax: number; res: number; value: number } {
  if (n <= 0 || frac < 0 || frac >= n || !Number.isInteger(n) || !Number.isInteger(frac)) throw new Error('Formato inválido.');
  const res = 2 ** -frac;
  const rangeMax = 2 ** (n - frac) - res;
  return { bin: (2 ** n - 1).toString(2).padStart(n, '0'), rangeMax, res, value: rangeMax };
}

export function fixedTwos(n: number, frac: number, val: number): { rep: string; rangeMin: number; rangeMax: number; res: number } {
  if (n <= 0 || frac < 0 || frac >= n || !Number.isInteger(n) || !Number.isInteger(frac) || !Number.isFinite(val)) throw new Error('Formato o valor inválido.');
  const res = 2 ** -frac;
  const rangeMin = -(2 ** (n - frac - 1));
  const rangeMax = 2 ** (n - frac - 1) - res;
  const scaled = Math.round(val * 2 ** frac);
  const minScaled = -(2 ** (n - 1));
  const maxScaled = 2 ** (n - 1) - 1;
  if (scaled < minScaled || scaled > maxScaled) throw new Error('Valor fuera del rango del formato.');
  const modulus = 2 ** n;
  const encoded = ((scaled % modulus) + modulus) % modulus;
  return { rep: encoded.toString(2).padStart(n, '0'), rangeMin, rangeMax, res };
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
  const TclkNs = 1 / freqGHz;
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

/* =========================================================================
   NUEVOS LABORATORIOS: CACHÉ, HDD 3D, ENTRADA/SALIDA (DMA/IRQ) Y PIPELINE
   ========================================================================= */

export type CacheMapping = 'direct' | 'fully' | 'set';
export type CachePolicy = 'LRU' | 'FIFO';

export interface CacheLineState {
  way: number;
  valid: boolean;
  block: number | null;
  tag: string;
  loadedAt: number;
  lastUsed: number;
  isLru: boolean;
}

export interface CacheAccessStep {
  step: number;
  addressHex: string;
  addressDec: number;
  addressBin: string;
  tagBitsStr: string;
  indexBitsStr: string;
  offsetBitsStr: string;
  block: number;
  setIndex: number;
  wayIndex: number;
  hit: boolean;
  evictedBlock: number | null;
  lruBlockInSet: number | null;
  setsSnapshot: CacheLineState[][];
}

export interface CacheSimulationResult {
  addrBits: number;
  tagBits: number;
  indexBits: number;
  offsetBits: number;
  numBlocksMp: number;
  numLines: number;
  numSets: number;
  ways: number;
  hits: number;
  misses: number;
  hitRate: number;
  tamNs: number;
  steps: CacheAccessStep[];
}

function isPowerOfTwo(n: number): boolean {
  return Number.isInteger(n) && n > 0 && (n & (n - 1)) === 0;
}

export function simulateCache(
  mpBytes: number,
  cacheBytes: number,
  blockBytes: number,
  mapping: CacheMapping,
  waysInput: number,
  policy: CachePolicy,
  sequenceInput: string,
  tcNs = 2,
  missPenaltyNs = 60,
): CacheSimulationResult {
  if (!isPowerOfTwo(mpBytes) || !isPowerOfTwo(cacheBytes) || !isPowerOfTwo(blockBytes)) {
    throw new Error('Los tamaños de memoria principal, caché y bloque deben ser potencias de 2.');
  }
  if (blockBytes > cacheBytes || cacheBytes > mpBytes) {
    throw new Error('Debe cumplirse: Bloque ≤ Caché ≤ Memoria Principal.');
  }
  const numLines = cacheBytes / blockBytes;
  const numBlocksMp = mpBytes / blockBytes;
  const ways = mapping === 'direct' ? 1 : mapping === 'fully' ? numLines : waysInput;
  if (!isPowerOfTwo(ways) || ways > numLines) {
    throw new Error('El número de vías debe ser potencia de 2 y no superar el número de líneas.');
  }
  const numSets = numLines / ways;
  const addrBits = Math.round(Math.log2(mpBytes));
  const offsetBits = Math.round(Math.log2(blockBytes));
  const indexBits = mapping === 'fully' ? 0 : Math.round(Math.log2(numSets));
  const tagBits = addrBits - indexBits - offsetBits;

  const tokens = sequenceInput
    .split(/[\s,;→>-]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0 || tokens.length > 32) {
    throw new Error('Introduce entre 1 y 32 direcciones (ej.: 0x02, 0x44, 0x0B, 0x80).');
  }

  const addresses = tokens.map((tok) => {
    const clean = tok.toLowerCase().startsWith('0x') ? tok.slice(2) : tok;
    if (!/^[0-9a-fA-F]+$/.test(clean)) throw new Error(`Dirección hexadecimal inválida: ${tok}`);
    const val = parseInt(clean, 16);
    if (val < 0 || val >= mpBytes) throw new Error(`La dirección 0x${clean.toUpperCase()} supera la memoria principal (${mpBytes} B).`);
    return val;
  });

  const sets: CacheLineState[][] = Array.from({ length: numSets }, () =>
    Array.from({ length: ways }, (_, w) => ({
      way: w,
      valid: false,
      block: null,
      tag: '',
      loadedAt: 0,
      lastUsed: 0,
      isLru: false,
    })),
  );

  const steps: CacheAccessStep[] = [];
  let hits = 0;
  let misses = 0;

  const markLruFlags = (setLines: CacheLineState[]): number | null => {
    setLines.forEach((ln) => { ln.isLru = false; });
    const occupied = setLines.filter((ln) => ln.valid);
    if (occupied.length === 0) return null;
    const victim = occupied.reduce((best, cur) => {
      const metricBest = policy === 'LRU' ? best.lastUsed : best.loadedAt;
      const metricCur = policy === 'LRU' ? cur.lastUsed : cur.loadedAt;
      return metricCur < metricBest ? cur : best;
    });
    victim.isLru = true;
    return victim.block;
  };

  addresses.forEach((addr, idx) => {
    const stepNo = idx + 1;
    const bin = addr.toString(2).padStart(addrBits, '0');
    const tagStr = bin.slice(0, tagBits);
    const indexStr = indexBits > 0 ? bin.slice(tagBits, tagBits + indexBits) : '';
    const offsetStr = bin.slice(tagBits + indexBits);
    const block = Math.floor(addr / blockBytes);
    const setIndex = numSets === 1 ? 0 : block % numSets;
    const setLines = sets[setIndex];

    const existingWay = setLines.findIndex((ln) => ln.valid && ln.tag === tagStr);
    let hit = false;
    let wayIndex = existingWay;
    let evictedBlock: number | null = null;

    if (existingWay !== -1) {
      hit = true;
      hits += 1;
      setLines[existingWay].lastUsed = stepNo;
    } else {
      misses += 1;
      const freeWay = setLines.findIndex((ln) => !ln.valid);
      if (freeWay !== -1) {
        wayIndex = freeWay;
      } else {
        const victim = setLines.reduce((best, cur) => {
          const mBest = policy === 'LRU' ? best.lastUsed : best.loadedAt;
          const mCur = policy === 'LRU' ? cur.lastUsed : cur.loadedAt;
          return mCur < mBest ? cur : best;
        });
        wayIndex = victim.way;
        evictedBlock = victim.block;
      }
      setLines[wayIndex] = {
        way: wayIndex,
        valid: true,
        block,
        tag: tagStr,
        loadedAt: stepNo,
        lastUsed: stepNo,
        isLru: false,
      };
    }

    const lruBlockInSet = markLruFlags(setLines);
    const hexDigits = Math.max(2, Math.ceil(addrBits / 4));
    steps.push({
      step: stepNo,
      addressHex: `0x${addr.toString(16).toUpperCase().padStart(hexDigits, '0')}`,
      addressDec: addr,
      addressBin: bin,
      tagBitsStr: tagStr,
      indexBitsStr: indexStr || '—',
      offsetBitsStr: offsetStr,
      block,
      setIndex,
      wayIndex,
      hit,
      evictedBlock,
      lruBlockInSet,
      setsSnapshot: sets.map((s) => s.map((ln) => ({ ...ln }))),
    });
  });

  const hitRate = hits / addresses.length;
  const tamNs = tcNs + (1 - hitRate) * missPenaltyNs;
  return {
    addrBits,
    tagBits,
    indexBits,
    offsetBits,
    numBlocksMp,
    numLines,
    numSets,
    ways,
    hits,
    misses,
    hitRate,
    tamNs,
    steps,
  };
}

export function hddMetrics(
  platters: number,
  tracksPerSurface: number,
  sectorsPerTrack: number,
  bytesPerSector: number,
  rpm: number,
  seekMs: number,
  sectorsToRead: number,
) {
  if (
    !Number.isInteger(platters) || platters < 1 || platters > 12 ||
    tracksPerSurface <= 0 || sectorsPerTrack <= 0 || bytesPerSector <= 0 ||
    rpm <= 0 || seekMs < 0 || sectorsToRead <= 0
  ) {
    throw new Error('Introduce parámetros físicos positivos válidos.');
  }
  const surfaces = platters * 2;
  const trackBytes = sectorsPerTrack * bytesPerSector;
  const cylinderBytes = surfaces * trackBytes;
  const totalBytes = cylinderBytes * tracksPerSurface;
  const revMs = 60000 / rpm;
  const avgRotMs = revMs / 2;
  const sectorTransferMs = revMs / sectorsPerTrack;
  const sequentialMs = seekMs + avgRotMs + sectorsToRead * sectorTransferMs;
  const randomMs = sectorsToRead * (seekMs + avgRotMs + sectorTransferMs);
  return {
    surfaces,
    trackBytes,
    cylinderBytes,
    totalBytes,
    totalGB: totalBytes / 1e9,
    totalGiB: totalBytes / (1024 ** 3),
    revMs,
    avgRotMs,
    sectorTransferMs,
    sequentialMs,
    randomMs,
    ratioRandomVsSeq: randomMs / sequentialMs,
  };
}

export function ioComparison(
  blockBytes: number,
  devRateMBs: number,
  instTimeNs: number,
  pollInstPerByte: number,
  irqInstPerByte: number,
  dmaSetupTotalInst: number,
  dmaCycleStealNs: number,
) {
  if (
    blockBytes <= 0 || devRateMBs <= 0 || instTimeNs <= 0 ||
    pollInstPerByte <= 0 || irqInstPerByte <= 0 || dmaSetupTotalInst < 0 || dmaCycleStealNs < 0
  ) {
    throw new Error('Introduce valores positivos válidos.');
  }
  const byteIntervalNs = 1e3 / devRateMBs; // ns entre bytes del periférico (1 MB/s = 10^6 B/s => 1000 ns/B)
  const transferWallUs = (blockBytes * byteIntervalNs) / 1e3;

  // E/S programada: la CPU espera activamente durante toda la transferencia
  const pollCpuBusyUs = transferWallUs;
  const pollFreeInst = 0;

  // E/S por interrupciones: por cada byte ejecuta irqInstPerByte instrucciones
  const irqPerByteNs = irqInstPerByte * instTimeNs;
  const irqCpuBusyUs = (blockBytes * irqPerByteNs) / 1e3;
  const irqSaturated = irqPerByteNs >= byteIntervalNs;
  const irqFreeTimeNs = Math.max(0, blockBytes * (byteIntervalNs - irqPerByteNs));
  const irqFreeInst = Math.floor(irqFreeTimeNs / instTimeNs);

  // DMA por robo de ciclos: inicialización + final + robo de bus por byte
  const dmaInitUs = (dmaSetupTotalInst * instTimeNs) / 1e3;
  const dmaStealUs = (blockBytes * dmaCycleStealNs) / 1e3;
  const dmaCpuBusyUs = dmaInitUs + dmaStealUs;
  const dmaTotalWallUs = dmaInitUs + transferWallUs;
  const dmaFreeDuringTransferNs = Math.max(0, blockBytes * (byteIntervalNs - dmaCycleStealNs));
  const dmaFreeInst = Math.floor(dmaFreeDuringTransferNs / instTimeNs);

  return {
    byteIntervalNs,
    transferWallUs,
    pollCpuBusyUs,
    pollCpuPct: 100,
    pollFreeInst,
    irqCpuBusyUs,
    irqCpuPct: Math.min(100, (irqCpuBusyUs / transferWallUs) * 100),
    irqSaturated,
    irqFreeInst,
    dmaInitUs,
    dmaStealUs,
    dmaCpuBusyUs,
    dmaTotalWallUs,
    dmaCpuPct: Math.min(100, (dmaCpuBusyUs / dmaTotalWallUs) * 100),
    dmaFreeInst,
  };
}

export type PipelineOp = 'LW' | 'ADD' | 'SUB' | 'SW' | 'OR';

export interface PipelineInstSpec {
  op: PipelineOp;
  label: string;
  dst: string | null;
  src1: string | null;
  src2: string | null;
}

export interface PipelineScheduleRow {
  inst: PipelineInstSpec;
  cells: Array<'IF' | 'ID' | 'EX' | 'MEM' | 'WB' | 'STALL' | ''>;
  hazardNote: string | null;
}

export interface PipelineSimulationResult {
  rows: PipelineScheduleRow[];
  totalCycles: number;
  nonPipelinedCycles: number;
  stalls: number;
  cpi: number;
  speedup: number;
}

export function simulatePipeline(
  instructions: PipelineInstSpec[],
  forwarding: boolean,
): PipelineSimulationResult {
  if (instructions.length === 0 || instructions.length > 10) {
    throw new Error('La secuencia debe tener entre 1 y 10 instrucciones.');
  }

  interface Scheduled {
    spec: PipelineInstSpec;
    ifCycle: number;
    idCycle: number;
    exCycle: number;
    memCycle: number;
    wbCycle: number;
    stallCount: number;
    note: string | null;
  }

  const scheduled: Scheduled[] = [];

  for (let i = 0; i < instructions.length; i++) {
    const cur = instructions[i];
    const prev = scheduled[i - 1];
    const ifCycle = i === 0 ? 1 : prev.idCycle; // Entra en IF cuando la anterior pasa a ID
    const baseIdCycle = i === 0 ? 2 : Math.max(ifCycle + 1, prev.exCycle);

    // Calcular cuándo están disponibles los operandos fuente respecto a productores previos
    let requiredExCycle = baseIdCycle + 1;
    const notes: string[] = [];

    for (let p = Math.max(0, i - 2); p < i; p++) {
      const prod = scheduled[p];
      const reg = prod.spec.dst;
      if (!reg || reg === 'x0') continue;
      const depends = cur.src1 === reg || cur.src2 === reg;
      if (!depends) continue;

      if (!forwarding) {
        // Sin anticipación: el dato se escribe en WB y puede leerse en el ciclo siguiente (o en la 2ª mitad de WB -> EX en wbCycle + 1)
        const earliestEx = prod.wbCycle + 1;
        if (earliestEx > requiredExCycle) {
          requiredExCycle = earliestEx;
        }
        notes.push(`Espera ${reg} de I${p + 1} hasta WB`);
      } else {
        // Con anticipación: ALU produce al final de EX (disponible para EX siguiente en exCycle + 1); LW produce al final de MEM (disponible para EX en memCycle + 1)
        const readyForEx = prod.spec.op === 'LW' ? prod.memCycle + 1 : prod.exCycle + 1;
        if (readyForEx > requiredExCycle) {
          requiredExCycle = readyForEx;
          notes.push(`Riesgo load-use en ${reg} (1 burbuja + MEM→EX)`);
        } else {
          const path = prod.spec.op === 'LW' ? 'MEM→EX' : (prod.exCycle + 1 === requiredExCycle ? 'EX→EX' : 'MEM→EX');
          notes.push(`Anticipación ${path} (${reg})`);
        }
      }
    }

    const stallCount = Math.max(0, requiredExCycle - (baseIdCycle + 1));
    const exCycle = requiredExCycle;
    const memCycle = exCycle + 1;
    const wbCycle = memCycle + 1;

    scheduled.push({
      spec: cur,
      ifCycle,
      idCycle: baseIdCycle,
      exCycle,
      memCycle,
      wbCycle,
      stallCount,
      note: notes.length ? notes.join(' · ') : null,
    });
  }

  const totalCycles = scheduled[scheduled.length - 1].wbCycle;
  const rows: PipelineScheduleRow[] = scheduled.map((item) => {
    const cells: Array<'IF' | 'ID' | 'EX' | 'MEM' | 'WB' | 'STALL' | ''> = Array(totalCycles).fill('');
    cells[item.ifCycle - 1] = 'IF';
    for (let c = item.ifCycle + 1; c < item.idCycle; c++) cells[c - 1] = 'STALL';
    cells[item.idCycle - 1] = 'ID';
    for (let c = item.idCycle + 1; c < item.exCycle; c++) cells[c - 1] = 'STALL';
    cells[item.exCycle - 1] = 'EX';
    cells[item.memCycle - 1] = 'MEM';
    cells[item.wbCycle - 1] = 'WB';
    return {
      inst: item.spec,
      cells,
      hazardNote: item.note,
    };
  });

  const nonPipelinedCycles = instructions.length * 5;
  const stalls = scheduled.reduce((acc, s) => acc + s.stallCount, 0);
  const cpi = totalCycles / instructions.length;
  const speedup = nonPipelinedCycles / totalCycles;

  return { rows, totalCycles, nonPipelinedCycles, stalls, cpi, speedup };
}
