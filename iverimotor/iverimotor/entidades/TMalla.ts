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

    // Pasar las texturas al shader
    const uBaseColorTexture = gl.getUniformLocation(
      shaderProgram,
      'uBaseColorTexture'
    );
    if (
      uBaseColorTexture &&
      this.recursoGLTF.textures &&
      this.recursoGLTF.textures[0]
    ) {
      gl.activeTexture(gl.TEXTURE0); // Activar TEXTURE0
      gl.bindTexture(gl.TEXTURE_2D, this.recursoGLTF.textures[0]); // Usar la primera textura (color base)
      gl.uniform1i(uBaseColorTexture, 0); // Pasar TEXTURE0 al shader
    }

    const uMetallicRoughnessTexture = gl.getUniformLocation(
      shaderProgram,
      'uMetallicRoughnessTexture'
    );
    if (
      uMetallicRoughnessTexture &&
      this.recursoGLTF.textures &&
      this.recursoGLTF.textures[1]
    ) {
      gl.activeTexture(gl.TEXTURE1); // Activar TEXTURE1
      gl.bindTexture(gl.TEXTURE_2D, this.recursoGLTF.textures[1]); // Usar la segunda textura (metalicidad/rugosidad)
      gl.uniform1i(uMetallicRoughnessTexture, 1); // Pasar TEXTURE1 al shader
    }

    // Pasar la intensidad de la luz al shader
    const uLightIntensity = gl.getUniformLocation(
      shaderProgram,
      'uLightIntensity'
    );
    if (uLightIntensity) {
      gl.uniform4fv(uLightIntensity, [1.0, 1.0, 1.0, 1.0]); // Luz blanca con intensidad completa
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
