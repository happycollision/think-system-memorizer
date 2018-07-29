export function createElWithInnerHTML(str: string): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = str;
  return el;
}
