// ============ Helpers ============
const projects = Array.from(document.querySelectorAll('.project-card'));
const themeToggle = document.getElementById('theme-toggle');

const githubButtonClass = 'btn-gh';
const siteButtonClass = 'btn-site';

const token = (import.meta.env.VITE_GITHUB_TOKEN || '').trim();

fetch('https://api.github.com/users/claudiojvargas', {
  headers: token ? { Authorization: `Bearer ${token}` } : {}
})
  .then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
    return data;
  })
  .then(console.log)
  .catch(console.error);

function safeTrim(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function formatDateBR(isoString) {
  try {
    return new Date(isoString).toLocaleDateString('pt-BR');
  } catch {
    return '—';
  }
}

async function fetchWithTimeout(url, { timeoutMs = 5000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      // Evita resultados “estranhos” entre deploys / caches intermediários
      cache: 'no-store',
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// ============ Projetos ============
function createProjectLinks(card, siteUrl) {
  const linksContainer = card.querySelector('.project-links');
  if (!linksContainer) return;

  const githubUrl = safeTrim(card.dataset.githubUrl);
  const site = safeTrim(siteUrl);

  const githubButton = githubUrl
    ? `
      <a
        class="${githubButtonClass}"
        href="${githubUrl}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir repositório no GitHub"
      >Ver no GitHub ↗</a>
    `
    : '';

  const siteButton = site
    ? `
      <a
        class="${siteButtonClass}"
        href="${site}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir site do projeto"
      >Acessar site ↗</a>
    `
    : '';

  linksContainer.innerHTML = `${githubButton}${siteButton}`;
}

async function loadRepoMeta() {
  if (projects.length === 0) return;

  await Promise.all(
    projects.map(async (card) => {
      const manualSiteUrl = safeTrim(card.dataset.siteUrl);
      createProjectLinks(card, manualSiteUrl);
    })
  );
}

// ============ Tema ============
function applyTheme(theme) {
  const root = document.documentElement;
  const isDark = theme === 'dark';
  root.classList.toggle('dark', isDark);

  // A11y + UX
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.textContent = isDark ? 'Ativar tema claro' : 'Ativar tema escuro';
  }
}

function initTheme() {
  // Evita crash se botão não existir
  const storedTheme = safeTrim(localStorage.getItem('portfolio-theme'));
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const theme = storedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);

  if (!themeToggle) return;

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    const nextTheme = isDark ? 'light' : 'dark';

    applyTheme(nextTheme);
    localStorage.setItem('portfolio-theme', nextTheme);
  });
}

// ============ Boot ============
(function boot() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  initTheme();
  loadRepoMeta();
})();