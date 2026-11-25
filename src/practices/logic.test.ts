import { describe, expect, it } from 'vitest';
import * as L from './logic';

describe('conversiones de bases', () => {
  it('convierte enteros decimales a binario', () => {
    expect(L.decToBinInt(13).bin).toBe('1101');
  });

  it('convierte binario con parte fraccionaria a decimal', () => {
    expect(L.binToDec('100101.101').dec).toBe(37.625);
    expect(L.binToDec('0.001').dec).toBe(0.125);
  });

  it('rechaza binarios mal formados', () => {
    expect(() => L.binToDec('10.01.1')).toThrow();
    expect(() => L.binToDec('102')).toThrow();
  });

  it('convierte entre decimal y hexadecimal', () => {
    expect(L.hexToDec('2F').dec).toBe(47);
    expect(L.decToHex(47).hex).toBe('2F');
  });

  it('calcula los bits mínimos para codificar elementos', () => {
    expect(L.minBitsForElements(750)).toEqual({ bits: 10, total: 1024, spare: 274 });
  });
});

describe('representaciones de enteros', () => {
  it('codifica complemento a 2', () => {
    expect(L.twosComplement(-12, 8)).toBe('11110100');
    expect(L.twosComplement(127, 8)).toBe('01111111');
    expect(L.twosComplement(-1, 33)).toBe('1'.repeat(33));
  });

  it('comprueba los límites de complemento a 1', () => {
    expect(L.onesComplement(-12, 8)).toBe('11110011');
    expect(L.onesComplement(-127, 8)).toBe('10000000');
    expect(L.onesComplement(-1, 33)).toBe('1'.repeat(32) + '0');
    expect(() => L.onesComplement(-128, 8)).toThrow();
  });

  it('codifica exceso a M sin aplicar complemento a 2', () => {
    expect(L.excessM(0, 8)).toBe('10000000');
    expect(L.excessM(-128, 8)).toBe('00000000');
    expect(L.excessM(127, 8)).toBe('11111111');
  });

  it('rechaza desbordamientos', () => {
    expect(() => L.twosComplement(1000, 8)).toThrow();
    expect(() => L.excessM(128, 8)).toThrow();
  });
});

describe('coma fija', () => {
  it('calcula rango y resolución sin signo', () => {
    const result = L.fixedUnsigned(12, 5);
    expect(result.rangeMax).toBe(127.96875);
    expect(result.res).toBe(0.03125);
  });

  it('codifica negativos en complemento a 2 con bits fraccionarios', () => {
    expect(L.fixedTwos(10, 4, -12.375).rep).toBe('1100111010');
    expect(L.fixedTwos(8, 4, -1).rep).toBe('11110000');
  });

  it('escala correctamente el rango con la parte fraccionaria', () => {
    const result = L.fixedTwos(10, 4, 0);
    expect(result.rangeMin).toBe(-32);
    expect(result.rangeMax).toBe(31.9375);
    expect(result.res).toBe(0.0625);
  });
});

describe('rendimiento y memoria', () => {
  it('codifica IEEE 754', () => {
    expect(L.iee754Single(11).bits).toBe('01000001001100000000000000000000');
  });

  it('calcula tamaños multimedia', () => {
    expect(L.imageSize(2560, 1440, 24).bytes).toBe(11059200);
  });

  it('calcula rendimiento de CPU y bus', () => {
    expect(L.cpuTiming(3.2, 200000000, 4).mips).toBeCloseTo(800, 5);
    expect(L.cpuTiming(3.2, 200000000, 4).TclkNs).toBeCloseTo(0.3125);
    expect(L.busBw(64, 80).bwMBs).toBe(640);
  });

  it('calcula direcciones y ampliaciones de memoria', () => {
    expect(L.memoryInfo(8388608, 1, 32).bitsDir).toBe(23);
    const result = L.memoryExpand(256, 8, 1024, 8);
    expect(result.total).toBe(4);
    expect(result.type).toBe('unidades');
  });

  it('calcula DDR', () => {
    expect(L.ddrBw(1600, 64).rateMtps).toBe(3200);
  });
});

describe('memoria caché, HDD, E/S y segmentación', () => {
  it('reproduce exactamente el problema UNED de caché asociativa 2 vías (LRU vs FIFO)', () => {
    const lru = L.simulateCache(256, 64, 16, 'set', 2, 'LRU', '0x02, 0x44, 0x0B, 0x80');
    expect([lru.tagBits, lru.indexBits, lru.offsetBits]).toEqual([3, 1, 4]);
    expect(lru.steps.map((s) => s.hit)).toEqual([false, false, true, false]);
    // En 0x80 con LRU se expulsa B4 y queda B0 como LRU
    expect(lru.steps[3].evictedBlock).toBe(4);
    expect(lru.steps[3].lruBlockInSet).toBe(0);

    const fifo = L.simulateCache(256, 64, 16, 'set', 2, 'FIFO', '0x02, 0x44, 0x0B, 0x80');
    // Con FIFO en 0x80 se expulsa B0 (el primero en llegar)
    expect(fifo.steps[3].evictedBlock).toBe(0);
  });

  it('calcula geometría y tiempos secuencial vs aleatorio en HDD', () => {
    const hdd = L.hddMetrics(4, 20000, 500, 512, 7200, 6, 250);
    expect(hdd.surfaces).toBe(8);
    expect(hdd.totalGB).toBeCloseTo(40.96, 5);
    expect(hdd.revMs).toBeCloseTo(8.3333, 3);
    expect(hdd.sequentialMs).toBeCloseTo(14.3333, 3);
    expect(hdd.randomMs).toBeGreaterThan(hdd.sequentialMs * 100);
  });

  it('compara E/S programada, interrupciones y DMA por robo de ciclos', () => {
    const io = L.ioComparison(500, 1.5, 200, 4, 25, 10, 100);
    // 10 inst * 200 ns = 2 us; 500 * 100 ns = 50 us => 52 us ocupado en DMA
    expect(io.dmaCpuBusyUs).toBeCloseTo(52, 5);
    // Tiempo libre durante transferencia: 500 * (666.666... - 100) ns / 200 ns = 1416 instrucciones completas
    expect(io.dmaFreeInst).toBe(1416);
  });

  it('simula riesgos de datos en pipeline con y sin forwarding', () => {
    const seq: L.PipelineInstSpec[] = [
      { op: 'LW', label: 'lw x1, 0(x2)', dst: 'x1', src1: 'x2', src2: null },
      { op: 'ADD', label: 'add x3, x1, x4', dst: 'x3', src1: 'x1', src2: 'x4' },
      { op: 'SUB', label: 'sub x5, x3, x6', dst: 'x5', src1: 'x3', src2: 'x6' },
    ];
    const noFwd = L.simulatePipeline(seq, false);
    const fwd = L.simulatePipeline(seq, true);
    expect(fwd.stalls).toBe(1); // Solo 1 burbuja por load-use LW -> ADD; ADD -> SUB se resuelve por EX->EX
    expect(noFwd.stalls).toBeGreaterThan(fwd.stalls);
    expect(fwd.totalCycles).toBe(8); // 3 + 4 + 1 stall = 8 ciclos
  });
});
