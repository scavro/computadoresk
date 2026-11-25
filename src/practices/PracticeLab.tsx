import { lazy, Suspense, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';

import * as L from './logic';
import { useLocalStorage } from '../hooks/useLocalStorage';

const MemoryScene = lazy(() => import('./MemoryScene'));
const DiskScene = lazy(() => import('./DiskScene'));

function safe<T>(fn: () => T): { value: T } | { error: string } {
  try { return { value: fn() }; } catch (error) { return { error: error instanceof Error ? error.message : 'Error desconocido.' }; }
}
function fmt(value: number, digits = 6): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits }).format(value);
}

function LabShell({ title, description, children, result }: { title: string; description: string; children: ReactNode; result: ReactNode }) {
  return (
    <div className="lab-grid">
      <section className="lab-panel"><h2>{title}</h2><p>{description}</p><div className="lab-fields">{children}</div></section>
      <section className="lab-panel"><h3>Resultado</h3>{result}</section>
    </div>
  );
}

function Field({ label, children, hint, full = false }: { label: string; children: React.ReactNode; hint?: string; full?: boolean }) {
  return <label className={full ? 'lab-field full' : 'lab-field'}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function ErrorBox({ error }: { error: string | null }) {
  return error ? <div className="lab-error" role="alert">{error}</div> : null;
}

function ResultList({ items }: { items: Array<{ label: string; value: string }> }) {
  return <dl className="result-list">{items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>;
}

export function BasesLab() {
  const [decimal, setDecimal] = useLocalStorage('fc-lab-1-1', '37.625');
  const [maxFrac, setMaxFrac] = useLocalStorage('fc-lab-1-2', '12');
  const [binary, setBinary] = useLocalStorage('fc-lab-1-3', '100101.101');
  const [hex, setHex] = useLocalStorage('fc-lab-1-4', '25');
  const [elements, setElements] = useLocalStorage('fc-lab-1-5', '750');
  const conv = useMemo(() => safe(() => L.decToBinFrac(Number(decimal), Number(maxFrac))), [decimal, maxFrac]);
  const hexConv = useMemo(() => safe(() => L.decToHex(Math.floor(Number(decimal)))), [decimal]);
  const binDec = useMemo(() => safe(() => L.binToDec(binary)), [binary]);
  const hexDec = useMemo(() => safe(() => L.hexToDec(hex)), [hex]);
  const bits = useMemo(() => safe(() => L.minBitsForElements(Number(elements))), [elements]);

  return (
    <LabShell title="Conversor de sistemas" description="Convierte valores, separa pasos y calcula el número mínimo de bits para codificar N elementos." result={
      <>
        {conv && 'value' in conv && <ResultList items={[
          { label: 'Entero', value: conv.value.integer },
          { label: 'Fracción', value: conv.value.frac === '0' ? 'exactamente 0' : conv.value.frac },
          { label: 'Representación exacta', value: conv.value.exact ? 'Sí' : 'No, con truncamiento' },
          { label: 'Hexadecimal', value: 'value' in hexConv ? hexConv.value.hex : (hexConv as { error: string }).error },
          { label: 'Binario → decimal', value: 'value' in binDec ? String(binDec.value.dec) : (binDec as { error: string }).error },
          { label: 'Hexadecimal → decimal', value: 'value' in hexDec ? String(hexDec.value.dec) : (hexDec as { error: string }).error },
          { label: 'Bits mínimos para N', value: 'value' in bits ? `${bits.value.bits} bits (${bits.value.total} combinaciones, ${bits.value.spare} libres)` : (bits as { error: string }).error },
        ]} />}
        {conv && 'error' in conv && <ErrorBox error={conv.error} />}
        <details className="formula-note"><summary>Pasos de conversión decimal → binario</summary>{'value' in conv && conv.value.steps.map((step, index) => <div key={index}>{step}</div>)}{!('value' in conv) && 'Introduce un valor válido.'}</details>
      </>
    }>
      <Field label="Decimal (introduce entero o fracción)" hint="Ejemplo: 37.625"><input value={decimal} onChange={(event) => setDecimal(event.target.value)} inputMode="decimal" /></Field>
      <Field label="Bits de fracción máximos" hint="1 a 16"><input value={maxFrac} onChange={(event) => setMaxFrac(event.target.value)} inputMode="numeric" /></Field>
      <Field label="Binario para convertir a decimal" hint="Solo 0 y 1"><input value={binary} onChange={(event) => setBinary(event.target.value)} /></Field>
      <Field label="Hexadecimal para convertir a decimal" hint="0-9A-F"><input value={hex} onChange={(event) => setHex(event.target.value)} /></Field>
      <Field label="N elementos a codificar" hint="Calcula ceil(log₂ N)"><input value={elements} onChange={(event) => setElements(event.target.value)} inputMode="numeric" /></Field>
    </LabShell>
  );
}

export function IntegersLab() {
  const [bits, setBits] = useLocalStorage('fc-lab-2-1', '8');
  const [value, setValue] = useLocalStorage('fc-lab-2-2', '-12');
  const b = Number(bits);
  const v = Number(value);
  const rows = useMemo(() => [
    { label: 'Binario sin signo', calc: () => L.unsigned(Math.abs(Math.trunc(v)), b) },
    { label: 'Signo y magnitud', calc: () => L.signMagnitude(v, b) },
    { label: 'Complemento a 1', calc: () => L.onesComplement(v, b) },
    { label: 'Complemento a 2', calc: () => L.twosComplement(v, b) },
    { label: 'Exceso a 2^(n-1)', calc: () => L.excessM(v, b) },
  ], [b, v]);
  const range = `[-${2 ** (b - 1)}, ${2 ** (b - 1) - 1}]`;
  const c2Preview = safe(() => L.twosComplement(v, b));

  return (
    <LabShell title="Enteros con signo" description="Observa cómo cambia la misma secuencia de bits según el sistema de representación." result={
      <div>
        <ResultList items={rows.map((row) => {
          const r = safe(() => {
            if (!Number.isInteger(b) || b < 4 || b > 16) throw new Error('El número de bits debe ser un entero entre 4 y 16.');
            if (!Number.isInteger(v)) throw new Error('Introduce un número entero.');
            return row.calc();
          });
          return { label: row.label, value: 'value' in r ? r.value : (r as { error: string }).error };
        })} />
        <div className="formula-note">Rango de complemento a 2 para {b} bits: {range}.</div>
      </div>
    }>
      <Field label="Número de bits" hint="4 a 16"><input value={bits} onChange={(event) => setBits(event.target.value)} inputMode="numeric" /></Field>
      <Field label="Número decimal" hint="Ejemplo: -12"><input value={value} onChange={(event) => setValue(event.target.value)} inputMode="decimal" /></Field>
      <div className="lab-field full">
        <span>Bits en complemento a 2</span>
        <div className="bit-display">
          {('value' in c2Preview ? c2Preview.value : '00000000').split('').map((bit, index) => (
            <span key={index} className={index === 0 ? 'sign' : ''}>{bit}</span>
          ))}
        </div>
        <small>El bit rojo a la izquierda corresponde al signo / peso negativo en C2.</small>
      </div>
    </LabShell>
  );
}

export function RealsLab() {
  const [bits, setBits] = useLocalStorage('fc-lab-3-1', '10');
  const [frac, setFrac] = useLocalStorage('fc-lab-3-2', '4');
  const [value, setValue] = useLocalStorage('fc-lab-3-3', '-12.375');
  const [ieeeValue, setIeeeValue] = useLocalStorage('fc-lab-3-4', '18.75');
  const fixed = useMemo(() => safe(() => L.fixedTwos(Number(bits), Number(frac), Number(value))), [bits, frac, value]);
  const unsigned = useMemo(() => safe(() => L.fixedUnsigned(Number(bits), Number(frac))), [bits, frac]);
  const ieee = useMemo(() => safe(() => L.iee754Single(Number(ieeeValue))), [ieeeValue]);

  return (
    <LabShell title="Coma fija e IEEE 754" description="Descompón los bits de un número real y observa rango, resolución y campos." result={
      <div>
        {fixed && 'value' in fixed && <ResultList items={[
          { label: 'Representación C2', value: fixed.value.rep },
          { label: 'Rango', value: `[${fmt(fixed.value.rangeMin)}, ${fmt(fixed.value.rangeMax)}]` },
          { label: 'Resolución', value: String(fixed.value.res) },
        ]} />}
        {fixed && 'error' in fixed && <ErrorBox error={fixed.error} />}
        {unsigned && 'value' in unsigned && <ResultList items={[
          { label: 'Máximo sin signo', value: fmt(unsigned.value.rangeMax) },
          { label: 'Resolución sin signo', value: String(unsigned.value.res) },
        ]} />}
        {ieee && 'value' in ieee && <div className="formula-note">IEEE 754 simple<br />s={ieee.value.s} · e={ieee.value.e} · f={ieee.value.f}<br />bits={ieee.value.bits}<br />hex={ieee.value.hex}</div>}
        {ieee && 'error' in ieee && <ErrorBox error={ieee.error} />}
      </div>
    }>
      <Field label="Bits totales (coma fija)" hint="Ejemplo: 10"><input value={bits} onChange={(event) => setBits(event.target.value)} inputMode="numeric" /></Field>
      <Field label="Bits fraccionarios" hint="Ejemplo: 4"><input value={frac} onChange={(event) => setFrac(event.target.value)} inputMode="numeric" /></Field>
      <Field label="Valor para C2" hint="-12.375"><input value={value} onChange={(event) => setValue(event.target.value)} inputMode="decimal" /></Field>
      <Field label="Valor para IEEE 754 simple" hint="18.75"><input value={ieeeValue} onChange={(event) => setIeeeValue(event.target.value)} inputMode="decimal" /></Field>
    </LabShell>
  );
}

export function MultimediaLab() {
  const [w, setW] = useLocalStorage('fc-lab-4-1', '2560');
  const [h, setH] = useLocalStorage('fc-lab-4-2', '1440');
  const [bpp, setBpp] = useLocalStorage('fc-lab-4-3', '24');
  const [audioDuration, setAudioDuration] = useLocalStorage('fc-lab-4-4', '20');
  const [sr, setSr] = useLocalStorage('fc-lab-4-5', '48000');
  const [audioBps, setAudioBps] = useLocalStorage('fc-lab-4-6', '16');
  const [channels, setChannels] = useLocalStorage('fc-lab-4-7', '2');
  const [videoDuration, setVideoDuration] = useLocalStorage('fc-lab-4-8', '20');
  const [fps, setFps] = useLocalStorage('fc-lab-4-9', '25');
  const image = useMemo(() => safe(() => L.imageSize(Number(w), Number(h), Number(bpp))), [w, h, bpp]);
  const audio = useMemo(() => safe(() => L.audioSize(Number(audioDuration), Number(sr), Number(audioBps), Number(channels))), [audioDuration, sr, audioBps, channels]);
  const video = useMemo(() => safe(() => L.videoSize(Number(videoDuration), Number(w), Number(h), Number(bpp), Number(fps))), [videoDuration, w, h, bpp, fps]);

  return (
    <LabShell title="Almacenamiento multimedia" description="Calcula el tamaño de imagen, audio y vídeo sin comprimir." result={
      <div>
        {image && 'value' in image && <ResultList items={[{ label: 'Imagen', value: `${fmt(image.value.bytes, 0)} bytes · ${fmt(image.value.mib, 4)} MiB` }, { label: 'Píxeles', value: fmt(image.value.pixels, 0) }]} />}
        {audio && 'value' in audio && <ResultList items={[{ label: 'Audio', value: `${fmt(audio.value.bytes, 0)} bytes · ${fmt(audio.value.mib, 4)} MiB` }]} />}
        {video && 'value' in video && <ResultList items={[{ label: 'Vídeo', value: `${fmt(video.value.bytes, 0)} bytes · ${fmt(video.value.mib, 4)} MiB` }]} />}
        <ErrorBox error={image && 'error' in image ? image.error : audio && 'error' in audio ? audio.error : video && 'error' in video ? video.error : null} />
      </div>
    }>
      <Field label="Ancho imagen" hint="2560"><input value={w} onChange={(event) => setW(event.target.value)} inputMode="numeric" /></Field>
      <Field label="Alto imagen" hint="1440"><input value={h} onChange={(event) => setH(event.target.value)} inputMode="numeric" /></Field>
      <Field label="Bits por píxel" hint="24"><input value={bpp} onChange={(event) => setBpp(event.target.value)} inputMode="numeric" /></Field>
      <Field label="Duración audio (s)" hint="20"><input value={audioDuration} onChange={(event) => setAudioDuration(event.target.value)} inputMode="decimal" /></Field>
      <Field label="Muestreo (Hz)" hint="48000"><input value={sr} onChange={(event) => setSr(event.target.value)} inputMode="numeric" /></Field>
      <Field label="Bits por muestra" hint="16"><input value={audioBps} onChange={(event) => setAudioBps(event.target.value)} inputMode="numeric" /></Field>
      <Field label="Canales" hint="2"><input value={channels} onChange={(event) => setChannels(event.target.value)} inputMode="numeric" /></Field>
      <Field label="FPS vídeo" hint="25"><input value={fps} onChange={(event) => setFps(event.target.value)} inputMode="numeric" /></Field>
      <Field label="Duración vídeo (s)" hint="20"><input value={videoDuration} onChange={(event) => setVideoDuration(event.target.value)} inputMode="decimal" /></Field>
    </LabShell>
  );
}

export function PerformanceLab() {
  const [freq, setFreq] = useLocalStorage('fc-lab-5-1', '3.2');
  const [ni, setNi] = useLocalStorage('fc-lab-5-2', '200000000');
  const [cpi, setCpi] = useLocalStorage('fc-lab-5-3', '4');
  const [bits, setBits] = useLocalStorage('fc-lab-5-4', '64');
  const [mtps, setMtps] = useLocalStorage('fc-lab-5-5', '80');
  const [to, setTo] = useLocalStorage('fc-lab-5-6', '1.5');
  const [t, setT] = useLocalStorage('fc-lab-5-7', '2');
  const cpu = useMemo(() => safe(() => L.cpuTiming(Number(freq), Number(ni), Number(cpi))), [freq, ni, cpi]);
  const bw = useMemo(() => safe(() => L.busBw(Number(bits), Number(mtps))), [bits, mtps]);
  const occ = useMemo(() => safe(() => L.busOcc('value' in bw ? bw.value.bwMBs : 0, Number(to), Number(t))), [bw, to, t]);
  return (
    <LabShell title="Procesador y buses" description="Relaciona frecuencia, CPI, MIPS, ancho de banda y ocupación." result={
      <div>
        {cpu && 'value' in cpu && <ResultList items={[
          { label: 'Periodo de reloj', value: `${fmt(cpu.value.TclkNs, 4)} ns` },
          { label: 'Ciclos totales', value: fmt(cpu.value.Nc, 0) },
          { label: 'Tiempo de ejecución', value: `${fmt(cpu.value.T, 6)} s` },
          { label: 'Velocidad', value: `${fmt(cpu.value.mips, 2)} MIPS` },
        ]} />}
        {bw && 'value' in bw && <ResultList items={[
          { label: 'Ancho de banda', value: `${fmt(bw.value.bwMBs, 2)} MB/s · ${fmt(bw.value.bwGBs, 3)} GB/s` },
        ]} />}
        {occ && 'value' in occ && <ResultList items={[
          { label: 'Ocupación', value: `${fmt(occ.value.po, 2)} %` },
          { label: 'Transferencia real', value: `${fmt(occ.value.vT, 2)} MB/s` },
        ]} />}
        <ErrorBox error={cpu && 'error' in cpu ? cpu.error : bw && 'error' in bw ? bw.error : null} />
      </div>
    }>
      <Field label="Frecuencia (GHz)" hint="3.2"><input value={freq} onChange={(event) => setFreq(event.target.value)} inputMode="decimal" /></Field>
      <Field label="Instrucciones" hint="200000000"><input value={ni} onChange={(event) => setNi(event.target.value)} inputMode="numeric" /></Field>
      <Field label="CPI" hint="4"><input value={cpi} onChange={(event) => setCpi(event.target.value)} inputMode="decimal" /></Field>
      <Field label="Bits del bus" hint="64"><input value={bits} onChange={(event) => setBits(event.target.value)} inputMode="numeric" /></Field>
      <Field label="Transferencias/s (millones)" hint="80"><input value={mtps} onChange={(event) => setMtps(event.target.value)} inputMode="decimal" /></Field>
      <Field label="Tiempo ocupado (s)" hint="1.5"><input value={to} onChange={(event) => setTo(event.target.value)} inputMode="decimal" /></Field>
      <Field label="Tiempo total (s)" hint="2"><input value={t} onChange={(event) => setT(event.target.value)} inputMode="decimal" /></Field>
    </LabShell>
  );
}

export function MemoryLab() {
  const [units, setUnits] = useLocalStorage('fc-lab-6-1', '8388608');
  const [bytesPerUnit, setBytesPerUnit] = useLocalStorage('fc-lab-6-2', '1');
  const [wordBits, setWordBits] = useLocalStorage('fc-lab-6-3', '32');
  const info = useMemo(() => safe(() => L.memoryInfo(Number(units), Number(bytesPerUnit), Number(wordBits))), [units, bytesPerUnit, wordBits]);
  return (
    <LabShell title="Memoria y direcciones" description="Calcula capacidad, bits de dirección y palabras completas." result={
      <div>{info && 'value' in info && <ResultList items={[
        { label: 'Capacidad', value: `${fmt(info.value.capBytes, 0)} bytes · ${fmt(info.value.capMiB, 4)} MiB` },
        { label: 'Bits de dirección', value: String(info.value.bitsDir) },
        { label: 'Palabras completas', value: fmt(info.value.words, 0) },
      ]} />}{info && 'error' in info && <ErrorBox error={info.error} />}</div>
    }>
      <Field label="Unidades direccionables" hint="8388608"><input value={units} onChange={(event) => setUnits(event.target.value)} inputMode="numeric" /></Field>
      <Field label="Bytes por unidad" hint="1"><input value={bytesPerUnit} onChange={(event) => setBytesPerUnit(event.target.value)} inputMode="numeric" /></Field>
      <Field label="Bits por palabra" hint="32"><input value={wordBits} onChange={(event) => setWordBits(event.target.value)} inputMode="numeric" /></Field>
    </LabShell>
  );
}

export function ExpansionLab() {
  const [baseN, setBaseN] = useLocalStorage('fc-lab-7-1', '256');
  const [baseL, setBaseL] = useLocalStorage('fc-lab-7-2', '8');
  const [targetN, setTargetN] = useLocalStorage('fc-lab-7-3', '1024');
  const [targetL, setTargetL] = useLocalStorage('fc-lab-7-4', '8');
  const [selectedGroup, setSelectedGroup] = useLocalStorage('fc-lab-7-5', 0);
  const exp = useMemo(() => safe(() => L.memoryExpand(Number(baseN), Number(baseL), Number(targetN), Number(targetL))), [baseN, baseL, targetN, targetL]);
  const data = 'value' in exp ? exp.value : null;
  const groups = data?.q ?? 1;
  const chips = data?.r ?? 1;
  const typeLabel = data?.type === 'unidades' ? 'Ampliación de unidades' : data?.type === 'bits' ? 'Ampliación de bits' : data?.type === 'combinada' ? 'Ampliación combinada' : 'Sin ampliación';
  const addressBits = data ? Math.ceil(Math.log2(Number(targetN))) : 0;
  const innerBits = data ? Math.ceil(Math.log2(Number(baseN))) : 0;

  return (
    <div className="lab-grid">
      <section className="lab-panel">
        <h2>Ampliación de memoria</h2>
        <p>Configura la memoria base y la deseada. La escena 3D muestra grupos de circuitos y el decodificador.</p>
        <div className="lab-fields">
          <Field label="Unidades base N₀" hint="256"><input value={baseN} onChange={(event) => setBaseN(event.target.value)} inputMode="numeric" /></Field>
          <Field label="Bits por unidad L₀" hint="8"><input value={baseL} onChange={(event) => setBaseL(event.target.value)} inputMode="numeric" /></Field>
          <Field label="Unidades objetivo N" hint="1024"><input value={targetN} onChange={(event) => setTargetN(event.target.value)} inputMode="numeric" /></Field>
          <Field label="Bits por unidad L" hint="8"><input value={targetL} onChange={(event) => setTargetL(event.target.value)} inputMode="numeric" /></Field>
          <Field label="Grupo seleccionado" hint="0 a q-1"><input value={selectedGroup} onChange={(event) => setSelectedGroup(Number(event.target.value) || 0)} inputMode="numeric" /></Field>
        </div>
        <ErrorBox error={exp && 'error' in exp ? exp.error : null} />
        {data && <table className="memory-table"><thead><tr><th>Parámetro</th><th>Valor</th></tr></thead><tbody>
          <tr><td>Caso</td><td>{typeLabel}</td></tr>
          <tr><td>Circuitos por grupo (r)</td><td>{data.r}</td></tr>
          <tr><td>Grupos (q)</td><td>{data.q}</td></tr>
          <tr><td>Total de circuitos</td><td>{data.total}</td></tr>
          <tr><td>Bits de selección</td><td>{data.bitsSel}</td></tr>
          <tr><td>Dirección total</td><td>{addressBits} bits</td></tr>
          <tr><td>Dirección interna</td><td>{innerBits} bits</td></tr>
        </tbody></table>}
      </section>
      <section className="lab-panel">
        <h3>Escena 3D</h3>
        <Suspense fallback={<div className="scene-loading">Cargando escena…</div>}>
          <MemoryScene groups={groups} chipsPerGroup={chips} selectedGroup={Math.max(0, Math.min(selectedGroup, Math.max(0, groups - 1)))} />
        </Suspense>
        <div className="formula-note">Cada grupo representa una ampliación de bits; el decodificador selecciona uno de los q grupos mediante {data?.bitsSel ?? 0} bits más significativos.</div>
      </section>
    </div>
  );
}

export function DDRLab() {
  const [freq, setFreq] = useLocalStorage('fc-lab-8-1', '1600');
  const [width, setWidth] = useLocalStorage('fc-lab-8-2', '64');
  const ddr = useMemo(() => safe(() => L.ddrBw(Number(freq), Number(width))), [freq, width]);
  return (
    <LabShell title="DDR SDRAM" description="Convierte la frecuencia de reloj en tasa de transferencia y ancho de banda." result={
      <div>{ddr && 'value' in ddr && <ResultList items={[
        { label: 'Tasa nominal', value: `${fmt(ddr.value.rateMtps, 0)} MT/s` },
        { label: 'Ancho de banda', value: `${fmt(ddr.value.bwGBs, 3)} GB/s` },
      ]} />}{ddr && 'error' in ddr && <ErrorBox error={ddr.error} />}</div>
    }>
      <Field label="Frecuencia de reloj (MHz)" hint="1600"><input value={freq} onChange={(event) => setFreq(event.target.value)} inputMode="decimal" /></Field>
      <Field label="Anchura de datos (bits)" hint="64"><input value={width} onChange={(event) => setWidth(event.target.value)} inputMode="numeric" /></Field>
    </LabShell>
  );
}

/* =========================================================================
   P09 · SIMULADOR INTERACTIVO DE MEMORIA CACHÉ (SVG + GSAP)
   ========================================================================= */
export function CacheLab() {
  const [mpBytes, setMpBytes] = useLocalStorage('fc-lab-9-mp', '256');
  const [cacheBytes, setCacheBytes] = useLocalStorage('fc-lab-9-cache', '64');
  const [blockBytes, setBlockBytes] = useLocalStorage('fc-lab-9-block', '16');
  const [mapping, setMapping] = useLocalStorage<L.CacheMapping>('fc-lab-9-map', 'set');
  const [ways, setWays] = useLocalStorage('fc-lab-9-ways', '2');
  const [policy, setPolicy] = useLocalStorage<L.CachePolicy>('fc-lab-9-pol', 'LRU');
  const [seq, setSeq] = useLocalStorage('fc-lab-9-seq', '0x02, 0x44, 0x0B, 0x80');
  const [stepIdx, setStepIdx] = useLocalStorage('fc-lab-9-step', 3);
  const svgRef = useRef<SVGSVGElement>(null);

  const sim = useMemo(
    () => safe(() => L.simulateCache(Number(mpBytes), Number(cacheBytes), Number(blockBytes), mapping, Number(ways), policy, seq)),
    [mpBytes, cacheBytes, blockBytes, mapping, ways, policy, seq],
  );

  const data = 'value' in sim ? sim.value : null;
  const clampedStep = data ? Math.max(0, Math.min(stepIdx, data.steps.length - 1)) : 0;
  const active = data ? data.steps[clampedStep] : null;

  useEffect(() => {
    if (!svgRef.current || !active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.cache-flow-arrow', { strokeDashoffset: 28 }, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' });
      gsap.fromTo('.cache-active-way', { scale: 0.96 }, { scale: 1, duration: 0.35, ease: 'back.out(2)', transformOrigin: 'center' });
    }, svgRef);
    return () => ctx.revert();
  }, [clampedStep, policy, mapping, seq, active]);

  const loadUnedPreset = (pol: L.CachePolicy) => {
    setMpBytes('256');
    setCacheBytes('64');
    setBlockBytes('16');
    setMapping('set');
    setWays('2');
    setPolicy(pol);
    setSeq('0x02, 0x44, 0x0B, 0x80');
    setStepIdx(3);
  };

  return (
    <div className="lab-grid">
      <section className="lab-panel">
        <h2>Simulador de memoria caché</h2>
        <p>Descompone cada dirección y sigue la evolución del directorio, aciertos, fallos y reemplazos LRU o FIFO.</p>
        <div className="preset-bar">
          <button type="button" className="button button-quiet" onClick={() => loadUnedPreset('LRU')}>Problema UNED (LRU)</button>
          <button type="button" className="button button-quiet" onClick={() => loadUnedPreset('FIFO')}>Problema UNED (FIFO)</button>
          <button type="button" className="button button-quiet" onClick={() => { setMpBytes('256'); setCacheBytes('64'); setBlockBytes('16'); setMapping('direct'); setSeq('0x00, 0x40, 0x04, 0x44, 0x10'); setStepIdx(4); }}>Directa con conflicto</button>
        </div>
        <div className="lab-fields">
          <Field label="Memoria principal (B)" hint="Potencia de 2 (ej. 256)"><input value={mpBytes} onChange={(e) => setMpBytes(e.target.value)} inputMode="numeric" /></Field>
          <Field label="Tamaño caché (B)" hint="Potencia de 2 (ej. 64)"><input value={cacheBytes} onChange={(e) => setCacheBytes(e.target.value)} inputMode="numeric" /></Field>
          <Field label="Tamaño bloque/línea (B)" hint="Potencia de 2 (ej. 16)"><input value={blockBytes} onChange={(e) => setBlockBytes(e.target.value)} inputMode="numeric" /></Field>
          <Field label="Correspondencia">
            <select value={mapping} onChange={(e) => setMapping(e.target.value as L.CacheMapping)}>
              <option value="direct">Directa</option>
              <option value="set">Asociativa por conjuntos</option>
              <option value="fully">Totalmente asociativa</option>
            </select>
          </Field>
          {mapping === 'set' && (
            <Field label="Vías por conjunto (r)" hint="Potencia de 2 (ej. 2)"><input value={ways} onChange={(e) => setWays(e.target.value)} inputMode="numeric" /></Field>
          )}
          <Field label="Política de reemplazo">
            <select value={policy} onChange={(e) => setPolicy(e.target.value as L.CachePolicy)} disabled={mapping === 'direct'}>
              <option value="LRU">LRU (menos reciente)</option>
              <option value="FIFO">FIFO (primero en entrar)</option>
            </select>
          </Field>
          <Field label="Secuencia hexadecimal de accesos" hint="Separadas por comas: 0x02, 0x44, 0x0B, 0x80" full>
            <input value={seq} onChange={(e) => setSeq(e.target.value)} />
          </Field>
        </div>
        <ErrorBox error={'error' in sim ? sim.error : null} />
        {data && (
          <ResultList items={[
            { label: 'Formato de dirección', value: `${data.tagBits} etiq. | ${data.indexBits} ${mapping === 'direct' ? 'línea' : 'conj.'} | ${data.offsetBits} despl. (${data.addrBits} bits)` },
            { label: 'Organización', value: `${data.numBlocksMp} bloques MP · ${data.numLines} líneas · ${data.numSets} conjuntos` },
            { label: 'Tasa de aciertos (h)', value: `${data.hits}/${data.steps.length} (${fmt(data.hitRate * 100, 1)} %)` },
            { label: 'Tiempo medio (t_c=2ns, PF=60ns)', value: `${fmt(data.tamNs, 2)} ns` },
          ]} />
        )}
      </section>

      <section className="lab-panel">
        <h3>Traza visual paso a paso</h3>
        {data && active && (
          <>
            <div className="step-selector" role="tablist" aria-label="Pasos de acceso a caché">
              {data.steps.map((st, idx) => (
                <button
                  type="button"
                  key={st.step}
                  className={`step-pill ${idx === clampedStep ? 'is-active' : ''} ${st.hit ? 'is-hit' : 'is-miss'}`}
                  onClick={() => setStepIdx(idx)}
                >
                  <span>#{st.step}</span>
                  <strong>{st.addressHex}</strong>
                  <small>{st.hit ? 'Acierto' : 'Fallo'}</small>
                </button>
              ))}
            </div>

            <svg ref={svgRef} viewBox="0 0 560 155" className="diagram-svg" aria-label="Descomposición de dirección de caché">
              <text x="16" y="22" className="svg-caption">Acceso #{active.step}: {active.addressHex} → Bloque B{active.block}</text>
              <rect x="16" y="34" width="185" height="44" rx="3" className="svg-box-navy" />
              <text x="26" y="52" className="svg-box-label">ETIQUETA ({data.tagBits} b)</text>
              <text x="26" y="70" className="svg-box-mono">{active.tagBitsStr}</text>

              <rect x="207" y="34" width="150" height="44" rx="3" className="svg-box-red" />
              <text x="217" y="52" className="svg-box-label">{mapping === 'fully' ? 'ASOCIATIVA' : mapping === 'direct' ? `LÍNEA (${data.indexBits} b)` : `CONJUNTO (${data.indexBits} b)`}</text>
              <text x="217" y="70" className="svg-box-mono">{mapping === 'fully' ? 'Todas' : `${active.indexBitsStr} (q=${active.setIndex})`}</text>

              <rect x="363" y="34" width="181" height="44" rx="3" className="svg-box-gold" />
              <text x="373" y="52" className="svg-box-label-dark">DESPLAZ. ({data.offsetBits} b)</text>
              <text x="373" y="70" className="svg-box-mono-dark">{active.offsetBitsStr}</text>

              <path d="M282 78 V108 H330" className="cache-flow-arrow" fill="none" strokeWidth="2.5" strokeDasharray="6 4" />
              <rect x="16" y="98" width="528" height="44" rx="3" className={active.hit ? 'svg-status-hit' : 'svg-status-miss'} />
              <text x="30" y="125" className="svg-status-text">
                {active.hit
                  ? `ACIERTO en Conjunto ${active.setIndex}, Vía ${active.wayIndex} (Bloque B${active.block} ya cargado)`
                  : `FALLO: carga B${active.block} en Conjunto ${active.setIndex}, Vía ${active.wayIndex}${active.evictedBlock !== null ? ` · Expulsa B${active.evictedBlock} (${policy})` : ' (vía libre)'}`}
              </text>
            </svg>

            <div className="cache-sets-grid">
              {active.setsSnapshot.slice(0, 8).map((setLines, sIdx) => (
                <div key={sIdx} className={`cache-set-card ${sIdx === active.setIndex ? 'is-target-set' : ''}`}>
                  <div className="cache-set-header">
                    <strong>{mapping === 'direct' ? `Línea ${sIdx}` : `Conjunto ${sIdx}`}</strong>
                    {sIdx === active.setIndex && <span>Seleccionado</span>}
                  </div>
                  <div className="cache-ways-list">
                    {setLines.map((ln) => {
                      const isCurrent = sIdx === active.setIndex && ln.way === active.wayIndex;
                      return (
                        <div key={ln.way} className={`cache-way-row ${isCurrent ? 'cache-active-way' : ''} ${ln.valid ? 'is-valid' : ''}`}>
                          <span className="way-id">V{ln.way}</span>
                          {ln.valid ? (
                            <>
                              <strong>B{ln.block}</strong>
                              <code>etiq {ln.tag}</code>
                              {ln.isLru && setLines.filter((x) => x.valid).length > 1 && (
                                <em className="lru-badge">{policy === 'LRU' ? 'LRU' : '1.º FIFO'}</em>
                              )}
                            </>
                          ) : (
                            <small>Vacía</small>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* =========================================================================
   P10 · DISCO DURO MAGNÉTICO 3D (THREE.JS): GEOMETRÍA Y TIEMPOS
   ========================================================================= */
export function HDDLab() {
  const [platters, setPlatters] = useLocalStorage('fc-lab-10-platters', '4');
  const [tracks, setTracks] = useLocalStorage('fc-lab-10-tracks', '20000');
  const [sectors, setSectors] = useLocalStorage('fc-lab-10-sectors', '500');
  const [bytesSec, setBytesSec] = useLocalStorage('fc-lab-10-bsec', '512');
  const [rpm, setRpm] = useLocalStorage('fc-lab-10-rpm', '7200');
  const [seekMs, setSeekMs] = useLocalStorage('fc-lab-10-seek', '6');
  const [readSectors, setReadSectors] = useLocalStorage('fc-lab-10-read', '250');
  const [cylView, setCylView] = useLocalStorage('fc-lab-10-cyl', 1);
  const [secView, setSecView] = useLocalStorage('fc-lab-10-secv', 2);
  const [spinning, setSpinning] = useLocalStorage('fc-lab-10-spin', true);

  const calc = useMemo(
    () => safe(() => L.hddMetrics(Number(platters), Number(tracks), Number(sectors), Number(bytesSec), Number(rpm), Number(seekMs), Number(readSectors))),
    [platters, tracks, sectors, bytesSec, rpm, seekMs, readSectors],
  );
  const data = 'value' in calc ? calc.value : null;

  return (
    <div className="lab-grid">
      <section className="lab-panel">
        <h2>Geometría y tiempos de disco duro</h2>
        <p>Manipula platos, cilindros, sectores y velocidad de rotación. Compara lectura secuencial frente a aleatoria.</p>
        <div className="lab-fields">
          <Field label="Número de platos (1–6)" hint="2 caras por plato"><input value={platters} onChange={(e) => setPlatters(e.target.value)} inputMode="numeric" /></Field>
          <Field label="Pistas por cara" hint="20000"><input value={tracks} onChange={(e) => setTracks(e.target.value)} inputMode="numeric" /></Field>
          <Field label="Sectores medios / pista" hint="500"><input value={sectors} onChange={(e) => setSectors(e.target.value)} inputMode="numeric" /></Field>
          <Field label="Bytes por sector" hint="512 o 4096"><input value={bytesSec} onChange={(e) => setBytesSec(e.target.value)} inputMode="numeric" /></Field>
          <Field label="Velocidad de giro (RPM)" hint="5400, 7200, 10000…"><input value={rpm} onChange={(e) => setRpm(e.target.value)} inputMode="numeric" /></Field>
          <Field label="Búsqueda media t_seek (ms)" hint="6"><input value={seekMs} onChange={(e) => setSeekMs(e.target.value)} inputMode="decimal" /></Field>
          <Field label="Sectores a transferir" hint="250"><input value={readSectors} onChange={(e) => setReadSectors(e.target.value)} inputMode="numeric" /></Field>
          <Field label="Cilindro resaltado en 3D (0–4)" hint="0 exterior · 4 interior">
            <input type="range" min={0} max={4} value={cylView} onChange={(e) => setCylView(Number(e.target.value))} />
          </Field>
        </div>
        <div className="preset-bar">
          <button type="button" className="button button-quiet" onClick={() => setSecView((s) => (s + 1) % 12)}>Cambiar sector objetivo</button>
          <button type="button" className="button button-quiet" onClick={() => setSpinning((s) => !s)}>{spinning ? 'Pausar rotación 3D' : 'Reanudar rotación 3D'}</button>
        </div>
        <ErrorBox error={'error' in calc ? calc.error : null} />
        {data && (
          <ResultList items={[
            { label: 'Superficies (caras)', value: `${data.surfaces} caras` },
            { label: 'Capacidad de 1 cilindro', value: `${fmt(data.cylinderBytes / 1024, 1)} KiB` },
            { label: 'Capacidad total del disco', value: `${fmt(data.totalGB, 2)} GB · ${fmt(data.totalGiB, 2)} GiB` },
            { label: 'Vuelta completa / Latencia media', value: `${fmt(data.revMs, 2)} ms / ${fmt(data.avgRotMs, 2)} ms` },
            { label: `Lectura secuencial (${readSectors} sect.)`, value: `${fmt(data.sequentialMs, 2)} ms` },
            { label: `Lectura aleatoria (${readSectors} sect.)`, value: `${fmt(data.randomMs, 1)} ms (${fmt(data.ratioRandomVsSeq, 1)}× más lenta)` },
          ]} />
        )}
      </section>
      <section className="lab-panel">
        <h3>Modelo espacial 3D (platos, cilindro, pista y sector)</h3>
        <Suspense fallback={<div className="scene-loading">Cargando escena 3D del disco duro…</div>}>
          <DiskScene
            platters={Number(platters) || 3}
            selectedCylinder={cylView}
            selectedSector={secView}
            rpm={Number(rpm) || 7200}
            spinning={spinning}
          />
        </Suspense>
        <div className="formula-note">
          Un cilindro reúne todas las pistas de idéntico radio en las {data?.surfaces ?? 2} caras: se lee completo sin mover el peine de cabezales (t_seek = 0 al cambiar de cabeza).
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   P11 · LABORATORIO DE E/S: PROGRAMADA, INTERRUPCIONES Y DMA (SVG + GSAP)
   ========================================================================= */
export function IODmaLab() {
  const [bytes, setBytes] = useLocalStorage('fc-lab-11-bytes', '500');
  const [rate, setRate] = useLocalStorage('fc-lab-11-rate', '1.5');
  const [instNs, setInstNs] = useLocalStorage('fc-lab-11-inst', '200');
  const [irqInst, setIrqInst] = useLocalStorage('fc-lab-11-irq', '25');
  const [dmaSetup, setDmaSetup] = useLocalStorage('fc-lab-11-setup', '10');
  const [dmaSteal, setDmaSteal] = useLocalStorage('fc-lab-11-steal', '100');
  const barsRef = useRef<SVGSVGElement>(null);

  const res = useMemo(
    () => safe(() => L.ioComparison(Number(bytes), Number(rate), Number(instNs), 4, Number(irqInst), Number(dmaSetup), Number(dmaSteal))),
    [bytes, rate, instNs, irqInst, dmaSetup, dmaSteal],
  );
  const data = 'value' in res ? res.value : null;

  useEffect(() => {
    if (!barsRef.current || !data) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.io-bar-busy', { scaleX: 0, transformOrigin: 'left center', duration: 0.5, stagger: 0.08, ease: 'power2.out' });
    }, barsRef);
    return () => ctx.revert();
  }, [data]);

  return (
    <div className="lab-grid">
      <section className="lab-panel">
        <h2>E/S programada, interrupciones y DMA</h2>
        <p>Compara cuánta CPU consume cada técnica de E/S y cuántas instrucciones útiles pueden ejecutarse durante la transferencia.</p>
        <div className="preset-bar">
          <button type="button" className="button button-quiet" onClick={() => { setBytes('500'); setRate('1.5'); setInstNs('200'); setIrqInst('25'); setDmaSetup('10'); setDmaSteal('100'); }}>Bloque corto (500 B)</button>
          <button type="button" className="button button-quiet" onClick={() => { setBytes('4000'); setRate('2'); setInstNs('100'); setIrqInst('80'); setDmaSetup('120'); setDmaSteal('80'); }}>Bloque 4 KB alta tasa</button>
        </div>
        <div className="lab-fields">
          <Field label="Tamaño del bloque (B)" hint="500"><input value={bytes} onChange={(e) => setBytes(e.target.value)} inputMode="numeric" /></Field>
          <Field label="Velocidad periférico (MB/s)" hint="1 MB/s = 10⁶ B/s"><input value={rate} onChange={(e) => setRate(e.target.value)} inputMode="decimal" /></Field>
          <Field label="Tiempo medio instrucción (ns)" hint="200"><input value={instNs} onChange={(e) => setInstNs(e.target.value)} inputMode="decimal" /></Field>
          <Field label="Instrucciones por interrupción" hint="Salvar + RSI + retorno"><input value={irqInst} onChange={(e) => setIrqInst(e.target.value)} inputMode="numeric" /></Field>
          <Field label="Instrucciones config./fin DMA" hint="Inicialización + fin"><input value={dmaSetup} onChange={(e) => setDmaSetup(e.target.value)} inputMode="numeric" /></Field>
          <Field label="Robo de ciclo DMA / byte (ns)" hint="100"><input value={dmaSteal} onChange={(e) => setDmaSteal(e.target.value)} inputMode="decimal" /></Field>
        </div>
        <ErrorBox error={'error' in res ? res.error : null} />
      </section>

      <section className="lab-panel">
        <h3>Reparto del tiempo de CPU y del bus</h3>
        {data && (
          <>
            <svg ref={barsRef} viewBox="0 0 540 215" className="diagram-svg" aria-label="Comparación de ocupación de CPU por técnica de E/S">
              {[
                { y: 24, label: '1. E/S programada (espera activa)', pct: data.pollCpuPct, free: data.pollFreeInst },
                { y: 90, label: '2. E/S por interrupciones', pct: data.irqCpuPct, free: data.irqFreeInst },
                { y: 156, label: '3. DMA por robo de ciclos', pct: data.dmaCpuPct, free: data.dmaFreeInst },
              ].map((row) => {
                const fullW = 500;
                const busyW = Math.max(4, (row.pct / 100) * fullW);
                return (
                  <g key={row.label}>
                    <text x="20" y={row.y} className="svg-caption">{row.label} — {fmt(row.pct, 1)}% CPU en E/S · {fmt(row.free, 0)} inst. libres</text>
                    <rect x="20" y={row.y + 8} width={fullW} height="28" rx="3" className="svg-bar-free" />
                    <rect x="20" y={row.y + 8} width={busyW} height="28" rx="3" className="svg-bar-busy io-bar-busy" />
                  </g>
                );
              })}
            </svg>
            <ResultList items={[
              { label: 'Intervalo entre bytes del periférico', value: `${fmt(data.byteIntervalNs, 2)} ns/B (transferencia: ${fmt(data.transferWallUs, 2)} µs)` },
              { label: 'Programada · CPU ocupada', value: `${fmt(data.pollCpuBusyUs, 2)} µs (0 instrucciones de otros programas)` },
              { label: 'Interrupciones · CPU ocupada', value: data.irqSaturated ? 'Saturada (la RSI supera el intervalo entre bytes)' : `${fmt(data.irqCpuBusyUs, 2)} µs · ${fmt(data.irqFreeInst, 0)} instrucciones libres` },
              { label: 'DMA · CPU ocupada/detenida', value: `${fmt(data.dmaCpuBusyUs, 2)} µs (${fmt(data.dmaInitUs, 2)} µs software + ${fmt(data.dmaStealUs, 2)} µs robo de bus)` },
              { label: 'DMA · Instrucciones ejecutadas en paralelo', value: `${fmt(data.dmaFreeInst, 0)} instrucciones completas` },
            ]} />
          </>
        )}
      </section>
    </div>
  );
}

/* =========================================================================
   P12 · RUTA DE DATOS Y SEGMENTACIÓN PIPELINE DE 5 ETAPAS (SVG + GSAP)
   ========================================================================= */
const PIPELINE_PRESETS: Record<string, { name: string; seq: L.PipelineInstSpec[] }> = {
  loadUse: {
    name: 'Riesgo Load-Use + ALU (LW → ADD → SUB → SW)',
    seq: [
      { op: 'LW', label: 'I1: lw  x1, 0(x2)', dst: 'x1', src1: 'x2', src2: null },
      { op: 'ADD', label: 'I2: add x3, x1, x4', dst: 'x3', src1: 'x1', src2: 'x4' },
      { op: 'SUB', label: 'I3: sub x5, x3, x6', dst: 'x5', src1: 'x3', src2: 'x6' },
      { op: 'SW', label: 'I4: sw  x5, 4(x2)', dst: null, src1: 'x5', src2: 'x2' },
    ],
  },
  aluChain: {
    name: 'Cadena ALU sin paradas con Forwarding',
    seq: [
      { op: 'ADD', label: 'I1: add x1, x2, x3', dst: 'x1', src1: 'x2', src2: 'x3' },
      { op: 'SUB', label: 'I2: sub x4, x1, x5', dst: 'x4', src1: 'x1', src2: 'x5' },
      { op: 'OR', label: 'I3: or  x6, x4, x1', dst: 'x6', src1: 'x4', src2: 'x1' },
      { op: 'ADD', label: 'I4: add x7, x8, x9', dst: 'x7', src1: 'x8', src2: 'x9' },
    ],
  },
  independent: {
    name: 'Instrucciones independientes (cauce ideal)',
    seq: [
      { op: 'LW', label: 'I1: lw  x1, 0(x2)', dst: 'x1', src1: 'x2', src2: null },
      { op: 'ADD', label: 'I2: add x3, x4, x5', dst: 'x3', src1: 'x4', src2: 'x5' },
      { op: 'SUB', label: 'I3: sub x6, x7, x8', dst: 'x6', src1: 'x7', src2: 'x8' },
      { op: 'OR', label: 'I4: or  x9, x10, x11', dst: 'x9', src1: 'x10', src2: 'x11' },
    ],
  },
};

export function PipelineLab() {
  const [presetKey, setPresetKey] = useLocalStorage('fc-lab-12-preset', 'loadUse');
  const [forwarding, setForwarding] = useLocalStorage('fc-lab-12-fwd', true);
  const [cycle, setCycle] = useLocalStorage('fc-lab-12-cycle', 5);
  const svgRef = useRef<SVGSVGElement>(null);

  const preset = PIPELINE_PRESETS[presetKey] ?? PIPELINE_PRESETS.loadUse;
  const sim = useMemo(() => L.simulatePipeline(preset.seq, forwarding), [preset, forwarding]);
  const activeCycle = Math.max(1, Math.min(cycle, sim.totalCycles));

  const stageOccupants = useMemo(() => {
    const map: Record<'IF' | 'ID' | 'EX' | 'MEM' | 'WB', string | null> = { IF: null, ID: null, EX: null, MEM: null, WB: null };
    let hasStall = false;
    sim.rows.forEach((r, idx) => {
      const cell = r.cells[activeCycle - 1];
      if (cell === 'STALL') hasStall = true;
      else if (cell) map[cell] = `I${idx + 1} (${r.inst.op})`;
    });
    return { map, hasStall };
  }, [sim, activeCycle]);

  useEffect(() => {
    if (!svgRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.stage-active', { y: -4 }, { y: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' });
    }, svgRef);
    return () => ctx.revert();
  }, [activeCycle, forwarding, presetKey]);

  const stages: Array<{ id: 'IF' | 'ID' | 'EX' | 'MEM' | 'WB'; name: string; hw: string; x: number }> = [
    { id: 'IF', name: 'IF', hw: 'PC + Mem. Inst.', x: 14 },
    { id: 'ID', name: 'ID', hw: 'IR + Registros', x: 122 },
    { id: 'EX', name: 'EX', hw: 'ALU + Mux', x: 230 },
    { id: 'MEM', name: 'MEM', hw: 'Mem. Datos', x: 338 },
    { id: 'WB', name: 'WB', hw: 'Escritura Reg.', x: 446 },
  ];

  return (
    <div className="lab-grid">
      <section className="lab-panel">
        <h2>Ruta de datos y segmentación</h2>
        <p>Inspecciona ciclo a ciclo las 5 etapas del cauce RISC, las paradas por riesgo de datos y las rutas de anticipación (*forwarding*).</p>
        <div className="lab-fields">
          <Field label="Programa de prueba" full>
            <select value={presetKey} onChange={(e) => { setPresetKey(e.target.value); setCycle(5); }}>
              {Object.entries(PIPELINE_PRESETS).map(([k, val]) => <option key={k} value={k}>{val.name}</option>)}
            </select>
          </Field>
          <Field label="Unidad de anticipación (Forwarding)">
            <select value={forwarding ? 'yes' : 'no'} onChange={(e) => setForwarding(e.target.value === 'yes')}>
              <option value="yes">Activada (EX→EX y MEM→EX)</option>
              <option value="no">Desactivada (espera a WB)</option>
            </select>
          </Field>
          <Field label={`Ciclo inspeccionado: C${activeCycle} de C${sim.totalCycles}`}>
            <input type="range" min={1} max={sim.totalCycles} value={activeCycle} onChange={(e) => setCycle(Number(e.target.value))} />
          </Field>
        </div>
        <div className="preset-bar">
          <button type="button" className="button button-quiet" onClick={() => setCycle(Math.max(1, activeCycle - 1))}>← Ciclo anterior</button>
          <button type="button" className="button button-quiet" onClick={() => setCycle(Math.min(sim.totalCycles, activeCycle + 1))}>Siguiente ciclo →</button>
        </div>
        <ResultList items={[
          { label: 'Ciclos con segmentación', value: `${sim.totalCycles} ciclos (${sim.stalls} ciclos de parada)` },
          { label: 'Ciclos sin segmentar (5/inst.)', value: `${sim.nonPipelinedCycles} ciclos` },
          { label: 'CPI medio efectivo', value: `${fmt(sim.cpi, 2)} ciclos/instrucción` },
          { label: 'Ganancia de velocidad (Speedup)', value: `${fmt(sim.speedup, 2)}×` },
        ]} />
      </section>

      <section className="lab-panel">
        <h3>Estado de la ruta de datos en el ciclo C{activeCycle}</h3>
        <svg ref={svgRef} viewBox="0 0 550 150" className="diagram-svg" aria-label="Ruta de datos segmentada en 5 etapas">
          {stages.map((st, idx) => {
            const occ = stageOccupants.map[st.id];
            return (
              <g key={st.id} className={occ ? 'stage-active' : ''}>
                {idx < stages.length - 1 && (
                  <line x1={st.x + 92} y1="62" x2={st.x + 108} y2="62" stroke="currentColor" strokeWidth="2" />
                )}
                <rect x={st.x} y="24" width="92" height="76" rx="4" className={occ ? 'svg-stage-busy' : 'svg-stage-idle'} />
                <text x={st.x + 10} y="44" className="svg-stage-title">{st.name}</text>
                <text x={st.x + 10} y="60" className="svg-stage-sub">{st.hw}</text>
                <text x={st.x + 10} y="84" className="svg-stage-inst">{occ ?? 'Libre'}</text>
              </g>
            );
          })}
          {forwarding && (
            <g className="svg-fwd-paths">
              <path d="M322 100 V126 H252 V102" fill="none" strokeWidth="2" strokeDasharray="4 3" />
              <path d="M430 100 V136 H238 V102" fill="none" strokeWidth="2" strokeDasharray="4 3" />
              <text x="262" y="122" className="svg-fwd-label">Forwarding EX→EX / MEM→EX</text>
            </g>
          )}
        </svg>

        <div className="pipeline-table-wrap">
          <table className="memory-table pipeline-grid-table">
            <thead>
              <tr>
                <th>Instrucción</th>
                {Array.from({ length: sim.totalCycles }, (_, idx) => (
                  <th key={idx} className={idx + 1 === activeCycle ? 'is-active-col' : ''}>C{idx + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sim.rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td>
                    <strong>{row.inst.label}</strong>
                    {row.hazardNote && <small className="pipeline-note">{row.hazardNote}</small>}
                  </td>
                  {row.cells.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      onClick={() => setCycle(cIdx + 1)}
                      className={`pipe-cell pipe-${cell ? cell.toLowerCase() : 'empty'} ${cIdx + 1 === activeCycle ? 'is-active-col' : ''}`}
                    >
                      {cell === 'STALL' ? '••' : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const labs: Record<string, () => ReactNode> = {
  bases: BasesLab,
  enteros: IntegersLab,
  reales: RealsLab,
  multimedia: MultimediaLab,
  rendimiento: PerformanceLab,
  memoria: MemoryLab,
  ampliacion: ExpansionLab,
  ddr: DDRLab,
  cache: CacheLab,
  hdd: HDDLab,
  'es-dma': IODmaLab,
  'cpu-pipeline': PipelineLab,
};

export function PracticeLab({ id }: { id: string }) {
  const Component = labs[id];
  if (!Component) return <div className="empty-state">Práctica no encontrada.</div>;
  return <Component />;
}
