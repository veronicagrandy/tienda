import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraNavegacion } from './componentes/barra-navegacion/barra-navegacion';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BarraNavegacion],
  templateUrl: './app.html',
})
export class App {
  protected readonly anioActual = new Date().getFullYear();
}
