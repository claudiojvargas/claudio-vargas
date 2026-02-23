// ============ Helpers ============
const projects = Array.from(document.querySelectorAll('.project-card'));
const themeToggle = document.getElementById('theme-toggle');

const chipClass = 'chip';
const githubButtonClass = 'btn-gh';
const siteButtonClass = 'btn-site';

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
      const repo = safeTrim(card.dataset.repo);
      const metaContainer = card.querySelector('.project-meta');

      if (!repo || !metaContainer) return;

      const manualSiteUrl = safeTrim(card.dataset.siteUrl);

      try {
        const response = await fetchWithTimeout(`https://api.github.com/repos/${repo}`, {
          timeoutMs: 6000,
        });

        // Rate limit / bloqueio / etc.
        if (!response.ok) {
          throw new Error(`GitHub HTTP ${response.status} para ${repo}`);
        }

        const data = await response.json();

        const language = data.language || 'N/A';
        const stars = Number.isFinite(data.stargazers_count) ? data.stargazers_count : 0;
        const updatedAt = data.updated_at ? formatDateBR(data.updated_at) : '—';

        const fallbackHomepage = safeTrim(data.homepage);
        const siteUrl = manualSiteUrl || fallbackHomepage;

        metaContainer.innerHTML = `
          <span class="${chipClass}">${language}</span>
          <span class="${chipClass}">⭐ ${stars}</span>
          <span class="${chipClass}">Atualizado em ${updatedAt}</span>
        `;

        createProjectLinks(card, siteUrl);
      } catch (error) {
        // Fallback seguro
        metaContainer.innerHTML = `
          <span class="${chipClass}">Metadados indisponíveis no momento</span>
        `;
        createProjectLinks(card, manualSiteUrl);
      }
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