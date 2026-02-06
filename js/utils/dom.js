/** DOM helper utilities */

export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

export function el(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'className') {
      element.className = val;
    } else if (key === 'dataset') {
      Object.assign(element.dataset, val);
    } else if (key.startsWith('on')) {
      element.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (key === 'html') {
      element.innerHTML = val;
    } else if (key === 'text') {
      element.textContent = val;
    } else if (key === 'style' && typeof val === 'object') {
      Object.assign(element.style, val);
    } else {
      element.setAttribute(key, val);
    }
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(String(child)));
    } else {
      element.appendChild(child);
    }
  }
  return element;
}

export function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function render(container, ...nodes) {
  clearNode(container);
  for (const n of nodes.flat()) {
    if (n) container.appendChild(typeof n === 'string' ? document.createTextNode(n) : n);
  }
}

export function show(el) { el.classList.remove('hidden'); }
export function hide(el) { el.classList.add('hidden'); }
export function toggle(el, force) { el.classList.toggle('hidden', force !== undefined ? !force : undefined); }
