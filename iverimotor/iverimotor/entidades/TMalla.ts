import TRecursoGLTF from '../recursos/TRecursoMalla';
import { mat4 } from 'gl-matrix';

export default class TMalla {
  private gl: WebGLRenderingContext;
  private recursoGLTF: TRecursoGLTF;
  private shaderProgram: WebGLProgram;

  constructor(
    gl: WebGLRenderingContext,
    recursoGLTF: TRecursoGLTF,
    shaderProgram: WebGLProgram
  ) {
    this.gl = gl;
    this.recursoGLTF = recursoGLTF;
    this.shaderProgram = shaderProgram;
  }

  public dibujar(gl: WebGLRenderingContext, matrizTransformacion: mat4): void {
    const shaderProgram = this.shaderProgram;

    gl.useProgram(shaderProgram);

    // Obtener ubicaciones de atributos en el shader
    const positionLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
    const normalLocation = gl.getAttribLocation(shaderProgram, 'aNormal');
    const texCoordLocation = gl.getAttribLocation(shaderProgram, 'aTexCoord');

    // Pasar la matriz de transformación al shader
    const uModelMatrix = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
    if (uModelMatrix) {
      gl.uniformMatrix4fv(uModelMatrix, false, matrizTransformacion);
    }

    // Vincular buffer de vértices
    if (this.recursoGLTF.vertexBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.recursoGLTF.vertexBuffer);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(positionLocation);
    } else {
      console.error('Vertex buffer no está definido');
    }

    // Vincular buffer de normales (si existe)
    if (this.recursoGLTF.normalBuffer && normalLocation !== -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.recursoGLTF.normalBuffer);
      gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(normalLocation);
    } else {
      console.warn('Normal buffer no está definido o no se usa en el shader');
    }

    // Vincular buffer de coordenadas de textura (si existe)
    if (this.recursoGLTF.textureCoordBuffer && texCoordLocation !== -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.recursoGLTF.textureCoordBuffer);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(texCoordLocation);
    } else {
      console.warn(
        'Texture coordinate buffer no está definido o no se usa en el shader'
      );
    }

    // Vincular buffer de índices
    if (this.recursoGLTF.indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.recursoGLTF.indexBuffer);
      gl.drawElements(
        gl.TRIANGLES,
        this.recursoGLTF.indices.length,
        gl.UNSIGNED_SHORT,
        0
      );
    } else {
      console.error('Index buffer no está definido');
    }
  }
}
