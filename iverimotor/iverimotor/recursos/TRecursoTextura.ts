import TRecurso from './TRecurso';

export default class TRecursoTextura extends TRecurso {
  id: number = 0;
  width: number = 0;
  height: number = 0;

  constructor(nombre: string) {
    super(nombre);
  }
}
