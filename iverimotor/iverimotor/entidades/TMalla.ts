import TRecursoGLTF from '../recursos/TRecursoMalla';
import TEntidad from './TEntidad';
import { mat4 } from 'gl-matrix';

export default class TMalla extends TEntidad {
  private recursoGLTF: TRecursoGLTF;
  private shaderProgram: WebGLProgram;

  constructor(recursoGLTF: TRecursoGLTF, shaderProgram: WebGLProgram) {
    super();
    this.recursoGLTF = recursoGLTF;
    this.shaderProgram = shaderProgram;
  }

  public dibujar(gl: WebGLRenderingContext, matrizTransformacion: mat4): void {
    gl.useProgram(this.shaderProgram);

    // Obtener ubicaciones de atributos en el shader
    const positionLocation = gl.getAttribLocation(
      this.shaderProgram,
      'aPosition'
    );
    const normalLocation = gl.getAttribLocation(this.shaderProgram, 'aNormal');
    const texCoordLocation = gl.getAttribLocation(
      this.shaderProgram,
      'aTexCoord'
    );

    console.log('positionLocation:', positionLocation);
    console.log('normalLocation:', normalLocation);
    console.log('texCoordLocation:', texCoordLocation);

    // Pasar la matriz de transformación al shader
    const uModelMatrix = gl.getUniformLocation(
      this.shaderProgram,
      'uModelMatrix'
    );
    if (uModelMatrix) {
      gl.uniformMatrix4fv(uModelMatrix, false, matrizTransformacion);
    }

    // Pasar las texturas al shader
    if (this.recursoGLTF.textures.length > 0) {
      const uBaseColorTexture = gl.getUniformLocation(
        this.shaderProgram,
        'uBaseColorTexture'
      );
      if (uBaseColorTexture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.recursoGLTF.textures[0]);
        gl.uniform1i(uBaseColorTexture, 0);
      }

      if (this.recursoGLTF.textures.length > 1) {
        const uMetallicRoughnessTexture = gl.getUniformLocation(
          this.shaderProgram,
          'uMetallicRoughnessTexture'
        );
        if (uMetallicRoughnessTexture) {
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, this.recursoGLTF.textures[1]);
          gl.uniform1i(uMetallicRoughnessTexture, 1);
        }
      }
    }

    // Pasar la intensidad de la luz al shader
    const uLightIntensity = gl.getUniformLocation(
      this.shaderProgram,
      'uLightIntensity'
    );
    if (uLightIntensity) {
      gl.uniform4fv(uLightIntensity, [1.0, 1.0, 1.0, 1.0]);
    }

    // Vincular buffer de vértices
    if (this.recursoGLTF.vertexBuffer && positionLocation !== -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.recursoGLTF.vertexBuffer);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(positionLocation);
    } else {
      console.error('Vertex buffer no está definido o no se usa en el shader');
    }

    // Vincular buffer de normales
    if (this.recursoGLTF.normalBuffer && normalLocation !== -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.recursoGLTF.normalBuffer);
      gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(normalLocation);
    } else {
      console.warn('Normal buffer no está definido o no se usa en el shader');
    }

    // Vincular buffer de coordenadas de textura
    if (this.recursoGLTF.textureCoordBuffer && texCoordLocation !== -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.recursoGLTF.textureCoordBuffer);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(texCoordLocation);
    } else {
      console.warn(
        'Texture coordinate buffer no está definido o no se usa en el shader'
      );
    }

    console.log('Indices:', this.recursoGLTF.indices.length);
    // Vincular buffer de índices
    if (this.recursoGLTF.indexBuffer && this.recursoGLTF.indices.length > 0) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.recursoGLTF.indexBuffer);
      gl.drawElements(
        gl.TRIANGLES,
        this.recursoGLTF.indices.length,
        gl.UNSIGNED_SHORT,
        0
      );
    } else {
      console.error('Index buffer no está definido o no contiene datos');
    }
  }
}
