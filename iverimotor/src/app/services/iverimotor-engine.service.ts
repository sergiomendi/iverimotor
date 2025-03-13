import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';
import TCamara from '../../../iverimotor/entidades/TCamara';
import TLuz from '../../../iverimotor/entidades/TLuz';
import TNodo from '../../../iverimotor/nodos/TNodo';
import TMalla from '../../../iverimotor/entidades/TMalla';
import TEntidad from '../../../iverimotor/entidades/TEntidad';
import TGestorRecursos from '../../../iverimotor/recursos/TGestorRecursos';
import { mat4, vec3 } from 'gl-matrix';
import TRecursoMalla from '../../../iverimotor/recursos/TRecursoMalla';

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private gl!: WebGLRenderingContext; // Contexto WebGL
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
    return new TLuz();
  }

  public async crearMalla(): Promise<TMalla> {
    const tMalla = new TMalla();
    tMalla.inicializar(this.gl); // Inicializar la malla
    return tMalla;
  }

  public crearEscena(canvas: ElementRef<HTMLCanvasElement>): void {
    this.gl = canvas.nativeElement.getContext('webgl')!;
    if (!this.gl) {
      console.error('WebGL no soportado');
      return;
    }

    this.gl.clearColor(0, 0, 0, 1); // Fondo negro
    this.gl.enable(this.gl.DEPTH_TEST); // Habilitar prueba de profundidad

    this.animate();
  }

  private animate() {
    this.frameId = requestAnimationFrame(() => this.animate());
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    const matrizInicial = mat4.create();
    this.nodoRaiz.render(this.gl, matrizInicial);
  }
}
