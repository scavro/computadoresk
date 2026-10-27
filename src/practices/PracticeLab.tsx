import { lazy, Suspense, useMemo } from 'react';
import type { ReactNode } from 'react';

import * as L from './logic';
import { useLocalStorage } from '../hooks/useLocalStorage';

const MemoryScene = lazy(() => import('./MemoryScene'));

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

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="lab-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
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
      <div className="lab-field full"><span>Representación</span><div className="bit-display">{'10101010'.split('').map((bit, index) => <span key={index}>{bit}</span>)}</div><small>La banda superior muestra el patrón conceptual; el resultado superior es el cálculo exacto.</small></div>
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
        {image && 'value' in image && <ResultList items={[{ label: 'Imagen', value: `${fmt(image.value.bytes, 0)} bytes · ${fmt(image.value.mib, 4)} MiB` }, { label: 'Píxeles', value: fmt(image.value.pixels, 0) }]}/>}
        {audio && 'value' in audio && <ResultList items={[{ label: 'Audio', value: `${fmt(audio.value.bytes, 0)} bytes · ${fmt(audio.value.mib, 4)} MiB` }]}/>}
        {video && 'value' in video && <ResultList items={[{ label: 'Vídeo', value: `${fmt(video.value.bytes, 0)} bytes · ${fmt(video.value.mib, 4)} MiB` }]}/>}
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
        { label: 'Palabras de 32 bits', value: fmt(info.value.words, 0) },
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
          <tr><td>Bits de selección</td><td>{addressBits - innerBits} bits</td></tr>
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

const labs: Record<string, () => ReactNode> = {
  bases: BasesLab,
  enteros: IntegersLab,
  reales: RealsLab,
  multimedia: MultimediaLab,
  rendimiento: PerformanceLab,
  memoria: MemoryLab,
  ampliacion: ExpansionLab,
  ddr: DDRLab,
};

export function PracticeLab({ id }: { id: string }) {
  const Component = labs[id];
  if (!Component) return <div className="empty-state">Práctica no encontrada.</div>;
  return <Component />;
}
