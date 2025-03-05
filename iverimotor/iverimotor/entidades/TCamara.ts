import TEntidad from './TEntidad';

export default class TCamara extends TEntidad {
  esPerspectiva: boolean | undefined;
  distancia: number | undefined;

  constructor() {
    super();
  }
  setPerspectiva(esPerspectiva: boolean): void {
    this.esPerspectiva = esPerspectiva;
  }
  setParalela(): void {
    // this.esPerspectiva = esPerspectiva;
  }
}
