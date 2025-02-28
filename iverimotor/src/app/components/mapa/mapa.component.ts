import { Component, ElementRef, ViewChild } from '@angular/core';
import { EngineService } from '../../services/iverimotor-engine.service';

@Component({
  selector: 'mapa-component',
  standalone: true,
  templateUrl: './mapa.component.html',
})
export class MapaComponent {
  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  public constructor(private engServ: EngineService) {}

  public ngOnInit(): void {
    this.engServ.createScene(this.rendererCanvas);
    // this.engServ.animate();
  }
}
