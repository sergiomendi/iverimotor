import { mat4, vec3, vec4 } from 'gl-matrix';
import TEntidad from './TEntidad';

export default class TLuz extends TEntidad {
  intensidad: vec4 = vec4.fromValues(0, 0, 0, 0);
  private shaderProgram: WebGLProgram;

  constructor(shaderProgram: WebGLProgram) {
    super();
    this.shaderProgram = shaderProgram;
  }

  getIntensidad(): vec4 {
    return this.intensidad;
  }

  setIntensidad(intensidad: vec4): void {
    this.intensidad = intensidad;
  }

  dibujar(gl: WebGLRenderingContext, matrizTransformacion: mat4): void {
    console.log('Dibujando luz con intensidad', this.intensidad);

    // Usar el shader program
    gl.useProgram(this.shaderProgram);

    // Obtener la ubicación de la variable uniforme en el shader
    const uLightIntensity = gl.getUniformLocation(
      this.shaderProgram,
      'uLightIntensity'
    );

    // Pasar la intensidad de la luz al shader
    gl.uniform4fv(uLightIntensity, this.intensidad);
  }
}
