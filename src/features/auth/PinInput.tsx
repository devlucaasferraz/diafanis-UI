import { useLayoutEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';

const LENGTH = 6;
export function PinInput({ error }: { error?: string }) {
  const [digits, setDigits] = useState<string[]>(() => Array(LENGTH).fill(''));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const placeCaret = (input: HTMLInputElement) => input.setSelectionRange(input.value.length, input.value.length);
  const focus = (index: number) => {
    const input = inputs.current[index];
    if (input) { input.focus(); placeCaret(input); }
  };
  useLayoutEffect(() => {
    const input = inputs.current.find(element => element === document.activeElement);
    if (input) placeCaret(input);
  }, [digits]);
  const write = (index: number, text: string) => {
    const numbers = text.replace(/\D/g, '').slice(0, LENGTH - index);
    if (!numbers) return;
    setDigits(previous => {
      const next = [...previous];
      [...numbers].forEach((digit, offset) => { next[index + offset] = digit; });
      return next;
    });
    focus(Math.min(index + numbers.length, LENGTH - 1));
  };
  const paste = (event: ClipboardEvent<HTMLInputElement>, index: number) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text').replace(/\D/g, '');
    write(text.length >= LENGTH ? 0 : index, text);
  };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const target = digits[index] || index === 0 ? index : index - 1;
      setDigits(previous => previous.map((digit, i) => i === target ? '' : digit));
      focus(target);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      focus(Math.max(0, Math.min(LENGTH - 1, index + (event.key === 'ArrowLeft' ? -1 : 1))));
    }
  };
  return <fieldset className="auth-pin-group">
    <legend className="sr-only">Código de verificação</legend>
    <input name="pin" type="hidden" value={digits.join('')} />
    <div className="auth-pin-slots">
      {digits.map((digit, index) => <input
        key={index} id={`pin-${index}`} ref={element => { inputs.current[index] = element; }}
        type="text" inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'}
        aria-label={`Dígito ${index + 1} de ${LENGTH}`} aria-invalid={!!error}
        aria-describedby={error ? 'pin-error' : undefined} value={digit} maxLength={LENGTH}
        onFocus={event => placeCaret(event.currentTarget)}
        onChange={event => {
          if (!event.currentTarget.value) setDigits(previous => previous.map((value, i) => i === index ? '' : value));
          else {
            const native = event.nativeEvent as InputEvent;
            const text = native.inputType === 'insertText' && native.data?.length === 1 ? native.data : event.currentTarget.value;
            write(index, text);
          }
        }}
        onKeyDown={event => keyDown(event, index)} onPaste={event => paste(event, index)}
      />)}
    </div>
    {error && <p className="auth-error" id="pin-error" role="alert">{error}</p>}
  </fieldset>;
}
