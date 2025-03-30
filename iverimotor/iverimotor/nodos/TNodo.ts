import TEntidad from '../entidades/TEntidad';
import { mat4, vec3 } from 'gl-matrix';

export default class TNodo {
  hijos: TNodo[] = [];
  padre: TNodo | null;
  entidad: TEntidad | null;
  pos: vec3;
  traslacion: vec3;
  rotacion: vec3;
  escalado: vec3;
  matrizTransf: mat4;

  actualizarMatriz: boolean = false;

  constructor(entidad: TEntidad | null = null) {
    this.entidad = entidad;
    this.hijos = [];
    this.padre = null;
    this.pos = vec3.create();
    this.traslacion = vec3.create();
    this.rotacion = vec3.create();
    this.escalado = vec3.fromValues(1, 1, 1);
    this.matrizTransf = mat4.create();
  }

  public update() {
    this.hijos.forEach((hijo) => hijo.update());
  }

  public render(gl: WebGLRenderingContext, matrizAcumulada: mat4): void {
    // Calcular la matriz de transformación para este nodo
    const matrizTransformacion = this.calcularMatriz();

    // Multiplicar por la matriz acumulada de los padres
    const matrizFinal = mat4.create();
    mat4.multiply(matrizFinal, matrizAcumulada, matrizTransformacion);

    // Actualizar la matriz de transformación del nodo
    this.matrizTransf = matrizFinal;

    // Renderizar la entidad con la matriz correcta
    if (this.entidad) {
      this.entidad.dibujar(gl, matrizFinal); // Usar matrizFinal en lugar de this.matrizTransf
    }

    // Renderizar hijos con la matriz acumulada
    this.hijos.forEach((hijo) => hijo.render(gl, matrizFinal));
  }

  public calcularMatriz(): mat4 {
    let matriz = mat4.create();
    mat4.translate(matriz, matriz, this.traslacion);
    mat4.rotateX(matriz, matriz, this.rotacion[0]);
    mat4.rotateY(matriz, matriz, this.rotacion[1]);
    mat4.rotateZ(matriz, matriz, this.rotacion[2]);
    mat4.scale(matriz, matriz, this.escalado);
    return matriz;
  }

  addChild(nodo: TNodo): void {
    nodo.padre = this;
    this.hijos.push(nodo);
  }

  removeChild(nodo: TNodo): void {
    const index = this.hijos.indexOf(nodo);
    if (index > -1) {
      this.hijos.splice(index, 1);
    }
  }

  setEntidad(entidad: TEntidad): void {
    this.entidad = entidad;
  }

  getEntidad(): TEntidad | null {
    return this.entidad;
  }

  getPadre(): TNodo | null {
    return this.padre;
  }

  setTraslacion(traslacion: vec3): void {
    this.traslacion = traslacion;
  }

  setRotacion(rotacion: vec3): void {
    this.rotacion = rotacion;
  }

  setEscalado(escalado: vec3): void {
    this.escalado = escalado;
  }

  trasladar(traslacion: vec3): void {
    this.traslacion[0] += traslacion[0];
    this.traslacion[1] += traslacion[1];
    this.traslacion[2] += traslacion[2];
  }

  rotar(rotacion: vec3): void {
    this.rotacion[0] += rotacion[0];
    this.rotacion[1] += rotacion[1];
    this.rotacion[2] += rotacion[2];
  }

  escalar(escalado: vec3): void {
    this.escalado[0] *= escalado[0];
    this.escalado[1] *= escalado[1];
    this.escalado[2] *= escalado[2];
  }

  getTraslacion(): vec3 {
    return this.traslacion;
  }

  getRotacion(): vec3 {
    return this.rotacion;
  }

  getEscalado(): vec3 {
    return this.escalado;
  }

  setMatrizTransformacion(matriz: mat4): void {
    this.matrizTransf = matriz;
    this.actualizarMatriz = true;
  }

  getMatrizTransformacion(): mat4 {
    return this.matrizTransf;
  }
}
