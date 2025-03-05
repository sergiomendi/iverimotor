import TEntidad from './TEntidad';
import TRecursoMalla from '../recursos/TRecursoMalla';

export default class TMalla extends TEntidad {
  malla: TRecursoMalla | undefined;
  constructor() {
    super();
  }
}
