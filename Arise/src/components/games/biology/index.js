// Auto-import all physics games
const modules = import.meta.glob('./*.jsx', { eager: true });
const games = Object.entries(modules).map(([path, mod]) => {
  let Component = null;
  for (const key of Object.keys(mod)) {
    if (typeof mod[key] === 'function' && /^[A-Z]/.test(key)) {
      Component = mod[key];
      break;
    }
  }
  if (!Component && mod.default) Component = mod.default;
  return {
    id: path.replace('./', '').replace(/\.jsx?$/, ''),
    Component,
    metadata: mod.metadata || {},
  };
});
export default games;
