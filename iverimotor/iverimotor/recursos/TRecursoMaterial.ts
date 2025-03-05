import TRecurso from './TRecurso';

export default class TRecursoMaterial extends TRecurso {
  coeficientesLuz: [number, number, number, number] = [0, 0, 0, 0];
  constructor(nombre: string) {
    super(nombre);
  }
}
