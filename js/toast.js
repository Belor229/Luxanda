// Toast Notification System
class Toast {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Create container if it doesn't exist
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.toast-container');
    }
  }

  show(message, type = 'info', title = '', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = this.getIcon(type);

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    this.container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('fade-out');
        setTimeout(() => {
          if (toast.parentElement) {
            toast.remove();
          }
        }, 300);
      }
    }, duration);

    return toast;
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  success(message, title = 'Succès') {
    return this.show(message, 'success', title);
  }

  error(message, title = 'Erreur') {
    return this.show(message, 'error', title);
  }

  warning(message, title = 'Attention') {
    return this.show(message, 'warning', title);
  }

  info(message, title = 'Information') {
    return this.show(message, 'info', title);
  }
}

// Global toast instance
const toast = new Toast();

// Make toast available globally
window.toast = toast;
