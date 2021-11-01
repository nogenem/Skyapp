import './styles.css';

// Polyfill
if (!Element.prototype.closest)
  Element.prototype.closest = function (s: string) {
    var el = this;
    if (!document.documentElement.contains(el)) return null;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement as HTMLElement;
    } while (el !== null);
    return null;
  };

interface ToastElement extends HTMLElement {
  toast_duration: number;
  toast_transition: number;
}

type OnClick = (e: MouseEvent) => void;

interface ToastArgs {
  html: string;
  onClick?: OnClick;
  duration?: number;
  transition?: number;
  color?: string;
  background?: string;
  borderColor?: string;
}

const root = document.getElementById('toast-root') as HTMLElement;

const removeToast = (el: HTMLElement) => {
  root.removeChild(el);
  el.remove();
};

const onToastClick = (onClick?: OnClick) => (e: MouseEvent) => {
  const toast = (e.target as Element).closest('.chat-toast') as ToastElement;
  if (toast) {
    if (onClick) onClick(e);

    const duration = toast.toast_duration;
    const transition = toast.toast_transition;

    toast.style.opacity = '0';
    if (duration && duration < 0) {
      setTimeout(() => {
        removeToast(toast);
      }, transition);
    }
  }
};

const createElement = (id: string, onClick?: OnClick): ToastElement => {
  const el = document.createElement('div') as unknown as ToastElement;
  el.classList.add('chat-toast');
  el.id = id;
  el.addEventListener('click', onToastClick(onClick));
  return el;
};

class Toast {
  static show({
    html = '',
    onClick = undefined,
    duration = 3000,
    transition = 200,
    color = '#fff',
    background = '#323232',
    borderColor = '#262626',
  }: ToastArgs): void {
    let id = new Date().getTime().toString(36) + Math.random().toString(36);
    let el = createElement(id, onClick);

    let innerHTML = html;
    if (!innerHTML.startsWith('<')) {
      innerHTML = `<span class="chat-toast-span">${innerHTML}</span>`;
    }

    el.innerHTML = innerHTML;
    el.style.color = color;
    el.style.background = background;
    el.style.borderColor = borderColor;
    el.style.transition = `opacity ${transition}ms`;

    el.toast_duration = duration;
    el.toast_transition = transition;

    root.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '1';
    }, 0);
    if (duration > 0) {
      setTimeout(() => {
        el.style.opacity = '0';
      }, duration);
      setTimeout(() => {
        removeToast(el);
      }, duration + transition);
    }
  }

  static success(args: ToastArgs) {
    Toast.show({
      ...args,
      color: '#fff',
      background: '#4caf50',
      borderColor: '#000',
    });
  }

  static error(args: ToastArgs) {
    Toast.show({
      ...args,
      color: '#fff',
      background: '#f44336',
      borderColor: '#000',
    });
  }

  static info(args: ToastArgs) {
    Toast.show({
      ...args,
      color: '#fff',
      background: '#2196f3',
      borderColor: '#000',
    });
  }

  static warning(args: ToastArgs) {
    Toast.show({
      ...args,
      color: '#fff',
      background: '#ff9800',
      borderColor: '#000',
    });
  }
}

// SOOOOOOOOOOO ANNOYINGGGGGGGGGGGGGGGGGGGGGGGG
interface WindowWithToast extends Window {
  Toast: Toast;
}
(window as unknown as WindowWithToast).Toast = Toast;
export default Toast;
