import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const FORMATADOR = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatar(centavos: number): string {
  return FORMATADOR.format(centavos / 100);
}

@Component({
  selector: 'app-currency-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInput),
      multi: true,
    },
  ],
  template: `
    <input
      [id]="inputId()"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      [value]="display()"
      [disabled]="desabilitado()"
      [attr.aria-invalid]="ariaInvalid()"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [class]="inputClass()"
      (input)="onInput($event)"
      (blur)="onTouched()"
    />
  `,
})
export class CurrencyInput implements ControlValueAccessor {
  readonly inputId = input<string>('');
  readonly ariaInvalid = input<boolean>(false);
  readonly ariaDescribedby = input<string>('');
  readonly inputClass = input<string>(
    'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text shadow-sm transition outline-none focus:border-transparent focus:ring-2 focus:ring-brand',
  );

  protected readonly centavos = signal(0);
  protected readonly desabilitado = signal(false);
  protected readonly display = computed(() => formatar(this.centavos()));

  private onChange: (valor: number) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  writeValue(valor: number | null): void {
    this.centavos.set(typeof valor === 'number' && Number.isFinite(valor) ? valor : 0);
  }

  registerOnChange(fn: (valor: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.desabilitado.set(desabilitado);
  }

  protected onInput(evento: Event): void {
    const alvo = evento.target as HTMLInputElement;
    const digitos = alvo.value.replace(/\D/g, '').slice(0, 12);
    const valor = digitos ? Number.parseInt(digitos, 10) : 0;
    this.centavos.set(valor);
    alvo.value = this.display();
    this.onChange(valor);
  }
}
