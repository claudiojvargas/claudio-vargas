const projects = Array.from(document.querySelectorAll('.project-card'));

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

        metaContainer.innerHTML = `
          <span class="language">${language}</span>
          <span class="stars">⭐ ${stars}</span>
          <span class="updated">Atualizado em ${updatedAt}</span>
        `;
      } catch (error) {
        metaContainer.innerHTML = '<span class="language">Metadados indisponíveis no momento</span>';
      }
    })
  );
}

document.getElementById('year').textContent = new Date().getFullYear();
loadRepoMeta();
