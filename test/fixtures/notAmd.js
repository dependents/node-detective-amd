const style = (input, stack) => {
  if (input === '' || input == null) return '';
  if (colors.enabled === false) return input;
  if (colors.visible === false) return '';
  let str = '' + input;
  let nl = str.includes('\n');
  let n = stack.length;
  if (n > 0 && stack.includes('unstyle')) {
    stack = [...new Set(['unstyle', ...stack])].reverse();
  }
  while (n-- > 0) str = wrap(colors.styles[stack[n]], str, nl);
  return str;
};
  
const define = (name, codes, type) => {
  colors.styles[name] = ansi({ name, codes });
  let keys = colors.keys[type] || (colors.keys[type] = []);
  keys.push(name);

  Reflect.defineProperty(colors, name, {
    configurable: true,
    enumerable: true,
    set(value) {
      colors.alias(name, value);
    },
    get() {
      let color = input => style(input, color.stack);
      Reflect.setPrototypeOf(color, colors);
      color.stack = this.stack ? this.stack.concat(name) : [name];
      return color;
    }
  });
};