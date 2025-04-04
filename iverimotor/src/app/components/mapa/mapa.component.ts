import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { EngineService } from '../../services/iverimotor-engine.service';
import { vec3 } from 'gl-matrix';

@Component({
  selector: 'mapa-component',
  standalone: true,
  templateUrl: './mapa.component.html',
})
export class MapaComponent implements OnInit {
  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  private isDragging = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  private rotationYaw = 0; // Rotación en eje Y (horizontal)
  private rotationPitch = 0; // Rotación en eje X (vertical)
  private rotationRoll = 0; // Rotación en eje Z (profundidad)

  public constructor(private engServ: EngineService) {}

  public async ngOnInit(): Promise<void> {
    this.engServ.crearEscena(this.rendererCanvas);
    await this.dibujarMapa();
  }

  public async dibujarMapa(): Promise<void> {
    // Crear cámara, luz y malla
    const camara = this.engServ.crearCamara();
    const luz = this.engServ.crearLuz();
    const malla = await this.engServ.crearMalla('axe', 'fire_axe.gltf');

    // Crear nodo de la cámara con posición inicial
    const nodoCamara = this.engServ.crearNodo(
      this.engServ.nodoRaiz,
      camara,
      vec3.fromValues(0, 0, 10),
      vec3.fromValues(1, 1, 1),
      vec3.fromValues(0, 0, 0)
    );

    // Crear nodo de la luz
    this.engServ.crearNodo(
      this.engServ.nodoRaiz,
      luz,
      vec3.fromValues(50, 100, 50),
      vec3.fromValues(1, 1, 1),
      vec3.fromValues(0, 0, 0)
    );

    // Crear nodo de la malla en el origen
    const nodoMalla = this.engServ.crearNodo(
      this.engServ.nodoRaiz,
      malla,
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0.5, 0.5, 0.5),
      vec3.fromValues(0, 0, 0)
    );

    // Agregar eventos para rotar el modelo con el mouse
    this.addMouseEvents(nodoMalla);
  }

  private addMouseEvents(nodoMalla: any): void {
    const canvas = this.rendererCanvas.nativeElement;

    canvas.addEventListener('mousedown', (event) => {
      this.isDragging = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    });

    canvas.addEventListener('mousemove', (event) => {
      if (this.isDragging && nodoMalla) {
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;

        // Actualizar los ángulos de rotación
        this.rotationYaw += deltaX * 0.005; // Rotación horizontal
        this.rotationPitch += deltaY * 0.005; // Rotación vertical (invertido)

        // Limitar la rotación vertical para evitar que el modelo se voltee
        this.rotationPitch = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, this.rotationPitch)
        );

        // Calcular la rotación en los tres ejes (Yaw, Pitch, Roll)
        nodoMalla.setRotacion(
          vec3.fromValues(
            this.rotationPitch,
            this.rotationYaw,
            this.rotationRoll
          )
        );
      }
    });

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
    });
  }
}
