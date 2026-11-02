import { TestBed } from '@angular/core/testing';
import { CurrencyInput } from './currency-input';

describe('CurrencyInput', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CurrencyInput] }).compileComponents();
  });

  it('formata valores em BRL', () => {
    const fixture = TestBed.createComponent(CurrencyInput);
    fixture.componentRef.setInput('inputId', 'valor');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value.replace(/\u00a0/g, ' ')).toBe('R$ 0,00');

    fixture.componentInstance.writeValue(125000);
    fixture.detectChanges();

    expect(input.value.replace(/\u00a0/g, ' ')).toBe('R$ 1.250,00');
  });

  it('emite centavos ao digitar', () => {
    const fixture = TestBed.createComponent(CurrencyInput);
    fixture.componentRef.setInput('inputId', 'valor');
    fixture.detectChanges();

    const emitidos: number[] = [];
    fixture.componentInstance.registerOnChange((valor) => emitidos.push(valor));

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '2500';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emitidos).toEqual([2500]);
    expect(input.value.replace(/\u00a0/g, ' ')).toBe('R$ 25,00');
  });

  it('ignora caracteres não numéricos', () => {
    const fixture = TestBed.createComponent(CurrencyInput);
    fixture.componentRef.setInput('inputId', 'valor');
    fixture.detectChanges();

    const emitidos: number[] = [];
    fixture.componentInstance.registerOnChange((valor) => emitidos.push(valor));

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'R$ abc 1.234,56';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emitidos).toEqual([123456]);
  });
});
