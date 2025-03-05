import TRecurso from './TRecurso';

export default class TRecursoShader extends TRecurso {
  id: number = 0;

  constructor(nombre: string) {
    super(nombre);
  }

  setInt(uniform: string, valor: number): void {
    // TODO
  }
  setMat4(uniform: string, valor: number[]): void {
    // TODO
  }
}
