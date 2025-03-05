import TEntidad from './TEntidad';

export default class TLuz extends TEntidad {
  intensidad: [number, number, number] = [0, 0, 0];
  constructor() {
    super();
  }

  getIntensidad(): [number, number, number] {
    return this.intensidad;
  }

  setIntensidad(intensidad: [number, number, number]): void {
    this.intensidad = intensidad;
  }
}
