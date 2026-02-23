const projects = Array.from(document.querySelectorAll('.project-card'));
const themeToggle = document.getElementById('theme-toggle');

const chipClass =
  'rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 font-medium text-brand-800 dark:border-slate-700 dark:bg-slate-800 dark:text-brand-200';
const githubButtonClass =
  'rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:text-brand-300 dark:hover:bg-slate-800';
const siteButtonClass =
  'rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-800';

function createProjectLinks(card, homepageUrl) {
  const linksContainer = card.querySelector('.project-links');
  const githubUrl = card.dataset.githubUrl;

  const githubButton = `
    <a
      class="${githubButtonClass}"
      href="${githubUrl}"
      target="_blank"
      rel="noopener noreferrer"
    >Ver no GitHub ↗</a>
  `;

  const siteButton = homepageUrl
    ? `
      <a
        class="${siteButtonClass}"
        href="${homepageUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >Acessar site ↗</a>
    `
    : '';

  linksContainer.innerHTML = `${githubButton}${siteButton}`;
}

async function loadRepoMeta() {
  await Promise.all(
    projects.map(async (card) => {
      const repo = card.dataset.repo;
      const metaContainer = card.querySelector('.project-meta');

      try {
        const response = await fetch(`https://api.github.com/repos/${repo}`);

        if (!response.ok) {
          throw new Error(`Erro ao carregar ${repo}`);
        }

        const data = await response.json();
        const language = data.language || 'N/A';
        const stars = data.stargazers_count ?? 0;
        const updatedAt = new Date(data.updated_at).toLocaleDateString('pt-BR');
        const homepageUrl = data.homepage && data.homepage.trim() ? data.homepage.trim() : '';

        metaContainer.innerHTML = `
          <span class="${chipClass}">${language}</span>
          <span class="${chipClass}">⭐ ${stars}</span>
          <span class="${chipClass}">Atualizado em ${updatedAt}</span>
        `;

        createProjectLinks(card, homepageUrl);
      } catch (error) {
        metaContainer.innerHTML = `<span class="${chipClass}">Metadados indisponíveis no momento</span>`;
        createProjectLinks(card, '');
      }
    })
  );
}

function applyTheme(theme) {
  updateThemeToggleLabel(theme);

  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

function updateThemeToggleLabel(theme) {
  if (!themeToggle) return;

  const nextTheme = theme === 'dark' ? 'white' : 'dark';
  themeToggle.textContent = `Mudar para tema ${nextTheme}`;
}

function initTheme() {
  const storedTheme = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = storedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(theme);

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    const nextTheme = isDark ? 'light' : 'dark';

    applyTheme(nextTheme);
    localStorage.setItem('portfolio-theme', nextTheme);
  });
}

document.getElementById('year').textContent = new Date().getFullYear();
initTheme();
loadRepoMeta();
