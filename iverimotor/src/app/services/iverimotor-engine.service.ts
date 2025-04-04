import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';
import TCamara from '../../../iverimotor/entidades/TCamara';
import TLuz from '../../../iverimotor/entidades/TLuz';
import TNodo from '../../../iverimotor/nodos/TNodo';
import TMalla from '../../../iverimotor/entidades/TMalla';
import TEntidad from '../../../iverimotor/entidades/TEntidad';
import TGestorRecursos from '../../../iverimotor/recursos/TGestorRecursos';
import { mat4, vec3, vec4 } from 'gl-matrix';
import TRecursoMalla from '../../../iverimotor/recursos/TRecursoMalla';

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private gl!: WebGLRenderingContext; // Contexto WebGL
  private shaderProgram!: WebGLProgram; // Programa de shaders
  private frameId!: number; // ID del frame para el bucle de animación
  public nodoRaiz = new TNodo(); // Nodo raíz de la escena
  private gestorRecursos = new TGestorRecursos(); // Gestor de recursos

  constructor(private ngZone: NgZone) {}

  public ngOnDestroy(): void {
    if (this.frameId) cancelAnimationFrame(this.frameId);
  }

  public crearNodo(
    padre: TNodo,
    entidad: TEntidad,
    traslacion: vec3,
    escalado: vec3,
    rotacion: vec3
  ): TNodo {
    const nodo = new TNodo(entidad);
    padre.addChild(nodo);
    nodo.setTraslacion(traslacion);
    nodo.setEscalado(escalado);
    nodo.setRotacion(rotacion);
    return nodo;
  }

  public crearCamara(): TCamara {
    return new TCamara();
  }

  public crearLuz(): TLuz {
    const luz = new TLuz(this.shaderProgram);
    luz.setIntensidad(vec4.fromValues(1, 0, 0, 0));
    return luz;
  }

  public async crearMalla(nombre: string, fichero: string): Promise<TMalla> {
    console.log('Creando malla:', nombre);
    const recursoMalla = await this.gestorRecursos.getRecurso(
      nombre,
      `assets/${nombre}/${fichero}`,
      this.gl,
      this.shaderProgram
    );
    return new TMalla(recursoMalla, this.shaderProgram);
  }

  public async crearEscena(
    canvas: ElementRef<HTMLCanvasElement>
  ): Promise<void> {
    this.gl = canvas.nativeElement.getContext('webgl', { antialias: true })!;
    if (!this.gl) {
      console.error('WebGL no soportado');
      return;
    }
    this.setCanvasSize(canvas.nativeElement);
    this.gl.clearColor(0.0588, 0.1176, 0.2196, 1);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.initShaders();
    this.animate();
  }

  private setCanvasSize(canvas: HTMLCanvasElement): void {
    // Obtener el tamaño del contenedor del canvas
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Verificar si el canvas necesita cambiar de tamaño
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    // Ajustar el viewport de WebGL
    this.gl.viewport(0, 0, canvas.width, canvas.height);
  }

  private initShaders(): void {
    // VERTEX SHADER
    const vertexShaderSource = `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute vec2 aTexCoord;
      uniform mat4 uModelMatrix;
      uniform mat4 uViewMatrix;
      uniform mat4 uProjectionMatrix;
      varying vec3 vNormal;
      varying vec2 vTexCoord;

      void main(void) {
        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
        vNormal = aNormal;
        vTexCoord = aTexCoord;
      }
    `;

    // FRAGMENT SHADER
    const fragmentShaderSource = `
      precision mediump float;
      varying vec3 vNormal;
      varying vec2 vTexCoord;
      uniform sampler2D uBaseColorTexture;
      uniform sampler2D uMetallicRoughnessTexture;
      uniform vec4 uLightIntensity;

      void main(void) {
        vec4 baseColor = texture2D(uBaseColorTexture, vTexCoord);
        vec4 metallicRoughness = texture2D(uMetallicRoughnessTexture, vTexCoord);
        vec3 finalColor = baseColor.rgb * uLightIntensity.rgb;
        gl_FragColor = vec4(finalColor, baseColor.a);
      }
    `;

    const vertexShader = this.createShader(
      this.gl,
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.createShader(
      this.gl,
      this.gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    this.shaderProgram = this.createProgram(
      this.gl,
      vertexShader,
      fragmentShader
    );
  }

  private createShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Error compilando shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('Shader compilation failed');
    }
    return shader;
  }

  private createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Error linkeando programa:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      throw new Error('Program linking failed');
    }
    return program;
  }
  private animate() {
    // Llamar a animate() antes de la próxima actualización de la pantalla en cada frame
    this.frameId = requestAnimationFrame(() => this.animate());
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Obtener la matriz de vista de la cámara
    const camara = this.nodoRaiz.hijos
      .find((nodo) => nodo.getEntidad() instanceof TCamara)
      ?.getEntidad() as TCamara;
    const viewMatrix = camara ? camara.getViewMatrix() : mat4.create();

    // Configurar matriz de proyección
    const projectionMatrix = mat4.create();
    mat4.perspective(
      projectionMatrix,
      Math.PI / 3,
      this.gl.canvas.width / this.gl.canvas.height,
      0.5,
      1000.0
    );

    // Activar el programa de shaders
    this.gl.useProgram(this.shaderProgram);

    // Pasar matrices al shader
    const uViewMatrix = this.gl.getUniformLocation(
      this.shaderProgram,
      'uViewMatrix'
    );
    const uProjectionMatrix = this.gl.getUniformLocation(
      this.shaderProgram,
      'uProjectionMatrix'
    );

    if (!uViewMatrix || !uProjectionMatrix) {
      console.error(
        'No se pudieron encontrar las variables uniformes uViewMatrix o uProjectionMatrix en el shader.'
      );
      return;
    }

    this.gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);
    this.gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);

    // Renderizar la escena
    const matrizInicial = mat4.create();
    this.nodoRaiz.render(this.gl, matrizInicial);
  }
}
