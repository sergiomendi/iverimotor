import { mat4, vec3 } from 'gl-matrix';
import TEntidad from './TEntidad';

export default class TCamara extends TEntidad {
  private viewMatrix: mat4;
  private pos: vec3;
  private target: vec3;
  private up: vec3;

  constructor() {
    super();
    this.viewMatrix = mat4.create();
    this.pos = vec3.fromValues(0, 0, 35); // Posición inicial de la cámara
    this.target = vec3.fromValues(0, 0, 0); // Punto al que mira la cámara
    this.up = vec3.fromValues(0, 1, 0); // Vector "up" de la cámara
    this.actualizarViewMatrix();
  }

  // Actualiza la matriz de vista basada en la posición, target y up
  private actualizarViewMatrix(): void {
    mat4.lookAt(this.viewMatrix, this.pos, this.target, this.up);
  }

  // Devuelve la matriz de vista
  public getViewMatrix(): mat4 {
    return this.viewMatrix;
  }

  // Métodos para mover la cámara
  public setPos(pos: vec3): void {
    this.pos = pos;
    this.actualizarViewMatrix();
  }

  public setTarget(target: vec3): void {
    this.target = target;
    this.actualizarViewMatrix();
  }

  public setUp(up: vec3): void {
    this.up = up;
    this.actualizarViewMatrix();
  }

  public getPos(): vec3 {
    return this.pos;
  }

  public getTarget(): vec3 {
    return this.target;
  }

  public getUp(): vec3 {
    return this.up;
  }

  // Implementación del método dibujar (aunque la cámara no se dibuja)
  public dibujar(gl: WebGLRenderingContext, matrizTransformacion: mat4): void {}
}
