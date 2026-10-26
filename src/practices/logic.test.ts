import { describe, expect, it } from 'vitest';
import * as L from './logic';

describe('logic', () => {
  it('convierte decimal a binario', () => { expect(L.decToBinInt(13).bin).toBe('1101'); });
  it('convierte hex', () => { expect(L.hexToDec('2F').dec).toBe(47); expect(L.decToHex(47).hex).toBe('2F'); });
  it('min bits', () => { expect(L.minBitsForElements(750).bits).toBe(10); });
  it('C2', () => { expect(L.twosComplement(-12, 8)).toBe('11110100'); });
  it('IEEE', () => { expect(L.iee754Single(11).bits).toBe('01000001001100000000000000000000'); });
  it('multimedia', () => { expect(L.imageSize(2560,1440,24).bytes).toBe(11059200); });
  it('cpu', () => { expect(L.cpuTiming(3.2,200000000,4).mips).toBeCloseTo(800,5); });
  it('bus', () => { expect(L.busBw(64,80).bwMBs).toBe(640); });
  it('memoria', () => { expect(L.memoryInfo(8388608,1,32).bitsDir).toBe(23); });
  it('expansion', () => { const r=L.memoryExpand(256,8,1024,8); expect(r.total).toBe(4); expect(r.type).toBe('unidades'); });
  it('ddr', () => { expect(L.ddrBw(1600,64).rateMtps).toBe(3200); });
  it('errores', () => { expect(() => L.twosComplement(1000,8)).toThrow(); });
});
