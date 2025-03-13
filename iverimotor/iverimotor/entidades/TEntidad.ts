import { mat4 } from 'gl-matrix';

export default abstract class TEntidad {
  constructor() {}
  abstract dibujar(gl: WebGLRenderingContext, matrizTransformacion: mat4): void;
}
