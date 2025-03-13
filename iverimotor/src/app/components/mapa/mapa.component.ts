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

  public constructor(private engServ: EngineService) {}

  public async ngOnInit(): Promise<void> {
    this.engServ.crearEscena(this.rendererCanvas);
    await this.dibujarMapa();
  }

  public async dibujarMapa(): Promise<void> {
    const camara = this.engServ.crearCamara();
    const luz = this.engServ.crearLuz();
    const mapa = await this.engServ.crearMalla();

    // Crear nodos y añadir la malla, cámara y luz a la escena
    const nMalla = this.engServ.crearNodo(
      this.engServ.nodoRaiz,
      mapa,
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(1, 1, 1),
      vec3.fromValues(0, 0, 0)
    );

    const nCamara = this.engServ.crearNodo(
      nMalla,
      camara,
      vec3.fromValues(0, 0, 5), // Posición de la cámara
      vec3.fromValues(1, 1, 1),
      vec3.fromValues(0, 0, 0)
    );

    const nLuz = this.engServ.crearNodo(
      this.engServ.nodoRaiz,
      luz,
      vec3.fromValues(0, 5, 0), // Posición de la luz
      vec3.fromValues(1, 1, 1),
      vec3.fromValues(0, 0, 0)
    );
  }
}
