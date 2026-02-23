# Claudio Vargas · Landing Page de Portfólio

Landing page profissional e minimalista para apresentar perfil, competências e projetos de destaque no GitHub.

## Tecnologias

- HTML5
- Tailwind CSS (CDN)
- JavaScript (Vanilla)
- GitHub REST API

## O que tem na versão 2

- Visual com identidade azul reforçada
- Modo escuro com alternância manual e persistência em `localStorage`
- Cards com microinterações (hover)
- Metadados dinâmicos dos repositórios (linguagem, estrelas e última atualização)
- Botão **Acessar site ↗** automático para projetos que possuem link em `homepage` no repositório

## Estrutura

- `index.html`: conteúdo principal da página com classes utilitárias do Tailwind
- `script.js`: carregamento dinâmico de metadados dos repositórios, links de site e controle de tema

## Executar localmente

Você pode abrir `index.html` diretamente no navegador.

Opcionalmente, para servir localmente:

```bash
python3 -m http.server 4173
```

Depois acesse: `http://localhost:4173`
