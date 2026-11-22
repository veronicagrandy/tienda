import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Pedido } from '../../modelos/pedido';
import { Producto } from '../../modelos/producto';
import { ErrorPedido, PedidosServicio, calcularTotal } from '../../servicios/pedidos.servicio';
import { ProductosServicio } from '../../servicios/productos.servicio';
import {
  enteroPositivo,
  sinProductosRepetidos,
  sinSoloEspacios,
  validarExistencias,
} from '../../validadores/pedido.validadores';

type FormularioLinea = FormGroup<{
  productoId: FormControl<number | null>;
  cantidad: FormControl<number | null>;
}>;

export const maximoLineas = 15;

/** Funcionalidad 2: registro de un pedido con varios productos (formulario reactivo). */
@Component({
  selector: 'app-nuevo-pedido',
  imports: [ReactiveFormsModule, RouterLink, NgClass, CurrencyPipe, DecimalPipe],
  templateUrl: './nuevo-pedido.html',
})
export class NuevoPedido implements OnInit {
  private readonly constructorFormulario = inject(NonNullableFormBuilder);
  private readonly pedidosServicio = inject(PedidosServicio);
  protected readonly productosServicio = inject(ProductosServicio);

  // Llega desde el query param ?productoId=… (botón "Agregar a pedido" del catálogo).
  readonly productoId = input<string>();

  protected readonly maximoLineas = maximoLineas;
  protected readonly guardando = signal(false);
  protected readonly mensajeError = signal<string | null>(null);
  protected readonly pedidoGuardado = signal<Pedido | null>(null);
  protected readonly intentoEnviar = signal(false);

  // Mapa id → producto para búsquedas rápidas en validadores y en el resumen.
  private readonly mapaProductos = computed(
    () => new Map(this.productosServicio.productos().map((producto) => [producto.id, producto])),
  );

  protected readonly formulario = this.constructorFormulario.group({
    nombreCliente: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60), sinSoloEspacios]],
    observaciones: ['', [Validators.maxLength(200)]],
    items: this.constructorFormulario.array<FormularioLinea>([this.crearLinea()], {
      validators: [Validators.required, sinProductosRepetidos],
    }),
  });

  // Valor de las líneas convertido a signal para calcular el resumen y el total en vivo.
  private readonly valorLineas = toSignal(
    this.items.valueChanges.pipe(map(() => this.items.getRawValue())),
    { initialValue: this.items.getRawValue() },
  );

  protected readonly lineasResumen = computed(() =>
    this.valorLineas().flatMap((linea) => {
      const producto = linea.productoId !== null ? this.mapaProductos().get(linea.productoId) : undefined;
      const cantidad = linea.cantidad ?? 0;
      if (!producto || cantidad <= 0) {
        return [];
      }
      return [{ producto, cantidad, subtotal: producto.precio * cantidad }];
    }),
  );

  protected readonly total = computed(() =>
    calcularTotal(this.lineasResumen().map((linea) => ({ precioUnitario: linea.producto.precio, cantidad: linea.cantidad }))),
  );

  protected readonly cantidadUnidades = computed(() =>
    this.lineasResumen().reduce((suma, linea) => suma + linea.cantidad, 0),
  );

  // Productos ya elegidos, para deshabilitarlos en las demás líneas.
  private readonly idsSeleccionados = computed(() => this.valorLineas().map((linea) => linea.productoId));

  constructor() {
    // Si el stock cambia (p. ej. tras guardar), se revalidan las líneas con los datos nuevos.
    effect(() => {
      this.mapaProductos();
      untracked(() => this.items.controls.forEach((linea) => linea.updateValueAndValidity()));
    });
  }

  async ngOnInit(): Promise<void> {
    await this.productosServicio.cargarProductos();
    this.prellenarDesdeCatalogo();
  }

  get items() {
    return this.formulario.controls.items;
  }

  protected agregarLinea(): void {
    if (this.items.length < maximoLineas) {
      this.items.push(this.crearLinea());
    }
  }

  protected quitarLinea(indice: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(indice);
    }
  }

  protected buscarProducto(id: number | null): Producto | undefined {
    return id === null ? undefined : this.mapaProductos().get(id);
  }

  /** Una opción se deshabilita si el producto está agotado o ya está elegido en otra línea. */
  protected opcionDeshabilitada(producto: Producto, indiceLinea: number): boolean {
    const elegidoEnOtraLinea = this.idsSeleccionados().some(
      (id, indice) => id === producto.id && indice !== indiceLinea,
    );
    return producto.stock <= 0 || elegidoEnOtraLinea;
  }

  /** Muestra errores solo cuando el usuario ya interactuó o intentó enviar. */
  protected mostrarError(control: { invalid: boolean; touched: boolean; dirty: boolean }): boolean {
    return control.invalid && (control.touched || control.dirty || this.intentoEnviar());
  }

  protected async guardarPedido(): Promise<void> {
    this.intentoEnviar.set(true);
    this.mensajeError.set(null);
    this.pedidoGuardado.set(null);
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid || this.guardando()) {
      this.mensajeError.set('Revisa los campos marcados en rojo antes de confirmar el pedido.');
      return;
    }

    const valor = this.formulario.getRawValue();
    this.guardando.set(true);
    try {
      const pedido = await this.pedidosServicio.crearPedido({
        nombreCliente: valor.nombreCliente,
        observaciones: valor.observaciones,
        items: valor.items.map((linea) => ({ productoId: linea.productoId!, cantidad: linea.cantidad! })),
      });
      this.pedidoGuardado.set(pedido);
      this.reiniciarFormulario();
    } catch (error) {
      this.mensajeError.set(
        error instanceof ErrorPedido ? error.message : 'Ocurrió un error inesperado al guardar el pedido.',
      );
    } finally {
      this.guardando.set(false);
    }
  }

  protected reiniciarFormulario(): void {
    this.items.clear();
    this.items.push(this.crearLinea());
    this.formulario.reset();
    this.intentoEnviar.set(false);
  }

  private crearLinea(productoId: number | null = null): FormularioLinea {
    return this.constructorFormulario.group(
      {
        productoId: this.constructorFormulario.control<number | null>(productoId, Validators.required),
        cantidad: this.constructorFormulario.control<number | null>(1, [Validators.required, enteroPositivo]),
      },
      { validators: validarExistencias((id) => this.mapaProductos().get(id)) },
    );
  }

  private prellenarDesdeCatalogo(): void {
    const id = Number(this.productoId());
    const producto = this.mapaProductos().get(id);
    if (producto && producto.stock > 0) {
      this.items.at(0).controls.productoId.setValue(producto.id);
    }
  }
}
