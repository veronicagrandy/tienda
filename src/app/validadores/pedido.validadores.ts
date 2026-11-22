import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Producto } from '../modelos/producto';

/** La cantidad debe ser un número entero mayor o igual a 1. */
export function enteroPositivo(control: AbstractControl<number | null>): ValidationErrors | null {
  const valor = control.value;
  if (valor === null || valor === undefined) {
    return null; // de los vacíos se encarga Validators.required
  }
  return Number.isInteger(valor) && valor >= 1 ? null : { enteroPositivo: true };
}

/** Evita espacios en blanco como nombre válido. */
export function sinSoloEspacios(control: AbstractControl<string>): ValidationErrors | null {
  const valor = control.value ?? '';
  return valor.length > 0 && valor.trim().length === 0 ? { soloEspacios: true } : null;
}

/**
 * Validador de cada línea del pedido: la cantidad no puede superar las existencias.
 * Recibe una función de búsqueda para trabajar siempre con el stock más reciente.
 */
export function validarExistencias(buscarProducto: (id: number) => Producto | undefined): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const { productoId, cantidad } = grupo.value as { productoId: number | null; cantidad: number | null };
    if (productoId === null || cantidad === null) {
      return null;
    }
    const producto = buscarProducto(productoId);
    if (!producto) {
      return null;
    }
    if (producto.stock <= 0) {
      return { productoAgotado: true };
    }
    return cantidad > producto.stock ? { excedeStock: { disponible: producto.stock } } : null;
  };
}

/** Validador de la lista completa: un mismo producto no puede aparecer en dos líneas. */
export function sinProductosRepetidos(control: AbstractControl): ValidationErrors | null {
  const ids = (control as FormArray).controls
    .map((linea) => linea.value.productoId as number | null)
    .filter((id): id is number => id !== null);
  return new Set(ids).size !== ids.length ? { productoRepetido: true } : null;
}
