// Simple hash-based router
class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.location.hash = path;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const path = hash.split('/')[0] === '' ? '/' : hash;
    
    // Check for exact match first
    if (this.routes[path]) {
      this.currentRoute = path;
      this.routes[path]();
      return;
    }

    // Check for dynamic routes (like /:id)
    for (const route in this.routes) {
      if (route.includes(':')) {
        const routePattern = route.replace(':', '');
        if (path.startsWith('/') && path !== '/') {
          const pathParts = path.split('/');
          if (pathParts.length === 2) {
            this.currentRoute = path;
            this.routes[route](pathParts[1]);
            return;
          }
        }
      }
    }

    // Default to root
    if (this.routes['/']) {
      this.currentRoute = '/';
      this.routes['/']();
    }
  }

  start() {
    this.handleRoute();
  }
}

