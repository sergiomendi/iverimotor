import TEntidad from './TEntidad';
import TRecursoMalla from '../recursos/TRecurso';

export default class TMalla extends TEntidad {
  malla: TRecursoMalla | undefined;
  constructor() {
    super();
  }

  cargarMalla(malla: TFichero): void {
    this.malla = malla;
  }
}
