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
