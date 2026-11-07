// This file automatically exports all games in this folder using Vite's import.meta.glob
// Add new game components as separate files in this folder


const modules = import.meta.glob('./*.jsx', { eager: true });

const games = Object.entries(modules).map(([path, mod]) => {
  // Find the first exported React component (function starting with uppercase)
  let Component = null;
  for (const key of Object.keys(mod)) {
    if (typeof mod[key] === 'function' && /^[A-Z]/.test(key)) {
      Component = mod[key];
      break;
    }
  }
  // fallback to default export if no named component found
  if (!Component && mod.default) Component = mod.default;
  return {
    id: path.replace('./', '').replace(/\.jsx?$/, ''),
    Component,
    metadata: mod.metadata || {},
  };
});

export default games;
