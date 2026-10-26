export const topicMeta = [
  {
    id: 1,
    title: 'Representación de la información y estructura básica de un computador',
    shortTitle: 'Información y computador',
    description: 'Bits, códigos, enteros, reales, caracteres, multimedia, CPU, memoria y buses.',
    examples: 48,
    pages: 92,
    color: 'blue',
  },
  {
    id: 2,
    title: 'Unidad de memoria',
    shortTitle: 'Unidad de memoria',
    description: 'Direcciones, jerarquía, tecnologías, módulos, ampliaciones y DDR SDRAM.',
    examples: 11,
    pages: 49,
    color: 'red',
  },
] as const;

export const practiceMeta = [
  { id: 'bases', number: 'P01', title: 'Sistemas de numeración', description: 'Convierte entre bases y descubre cada paso.', topic: 1, icon: 'binary' },
  { id: 'enteros', number: 'P02', title: 'Enteros con signo', description: 'Explora rangos, bits y desbordamiento.', topic: 1, icon: 'toggle' },
  { id: 'reales', number: 'P03', title: 'Coma fija e IEEE 754', description: 'Descompón la representación de números reales.', topic: 1, icon: 'sigma' },
  { id: 'multimedia', number: 'P04', title: 'Almacenamiento multimedia', description: 'Calcula imagen, audio y vídeo sin comprimir.', topic: 1, icon: 'image' },
  { id: 'rendimiento', number: 'P05', title: 'Procesador y buses', description: 'Relaciona CPI, MIPS, ancho de banda y ocupación.', topic: 1, icon: 'gauge' },
  { id: 'memoria', number: 'P06', title: 'Memoria y direcciones', description: 'Visualiza unidades, palabras y direcciones.', topic: 2, icon: 'memory' },
  { id: 'ampliacion', number: 'P07', title: 'Ampliación de memoria 3D', description: 'Construye bancos de chips y su decodificador.', topic: 2, icon: 'boxes' },
  { id: 'ddr', number: 'P08', title: 'Laboratorio DDR SDRAM', description: 'Conecta reloj, MT/s y ancho de banda.', topic: 2, icon: 'waves' },
] as const;

export const futureTopics = [
  { id: 3, title: 'Unidad de entrada/salida' },
  { id: 4, title: 'Unidad central de procesamiento' },
  { id: 5, title: 'Sistemas operativos' },
  { id: 6, title: 'Procesos' },
];
