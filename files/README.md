# EcoTurma

Registro coletivo de ações sustentáveis de uma turma. Cada pessoa cria uma conta,
registra as ações que fez (economia de energia, transporte, resíduos, etc.) e o
site soma o impacto de todo o grupo, mostra um painel por categoria e um ranking.

Projeto acadêmico feito em HTML, CSS e JavaScript puro (sem frameworks nem
servidor), para poder ser publicado gratuitamente no GitHub Pages.

## Estrutura do projeto

```
ecoturma/
├── index.html        # Tela de login e cadastro
├── app.html          # Painel principal (só acessível logado)
├── css/
│   └── style.css     # Estilos do site
└── js/
    ├── storage.js    # Categorias, usuários, senhas e ações (localStorage)
    ├── login.js      # Lógica da tela de login/cadastro
    └── app.js        # Lógica do painel principal
```

## Como funciona o login

Não há um servidor: os dados ficam salvos no `localStorage` do navegador,
ou seja, **no computador onde o site está sendo usado**. Isso significa que:

- Contas criadas em um computador não aparecem em outro.
- Para toda a turma ver as mesmas ações, todos precisam usar o mesmo
  navegador/computador (por exemplo, num laboratório de informática) ou você
  pode digitar as ações de todo mundo em um único aparelho durante uma
  apresentação.
- As senhas não são enviadas em texto puro: são transformadas com SHA-256
  antes de serem guardadas. Isso evita o caso mais óbvio (ver a senha "de
  cabeça" no localStorage), mas **não é o mesmo nível de segurança de um
  sistema com backend de verdade** — não use senhas reais/sensíveis para
  testar.

Isso é normal e esperado para um site 100% estático (sem servidor) hospedado
no GitHub Pages, e costuma ser suficiente para um projeto de faculdade.

## Como publicar no GitHub Pages

1. Crie um repositório novo no GitHub (por exemplo `ecoturma`).
2. Suba todos os arquivos desta pasta para o repositório (pela interface web
   do GitHub, arrastando os arquivos, ou via `git`):
   ```bash
   git init
   git add .
   git commit -m "Primeira versão do EcoTurma"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/ecoturma.git
   git push -u origin main
   ```
3. No repositório, vá em **Settings → Pages**.
4. Em "Build and deployment", escolha **Deploy from a branch**, selecione a
   branch `main` e a pasta `/ (root)`, depois clique em **Save**.
5. Depois de alguns instantes, o GitHub mostra o link do site, algo como
   `https://SEU-USUARIO.github.io/ecoturma/`.

Não precisa de nenhuma etapa de build (`npm install`, etc.) — é HTML puro.

## Rodando localmente antes de publicar

Basta abrir o `index.html` num navegador. Se o navegador bloquear alguma
funcionalidade por segurança ao abrir o arquivo direto (`file://`), rode um
servidor local simples a partir da pasta do projeto:

```bash
python3 -m http.server 8000
```

E acesse `http://localhost:8000`.

## Próximos passos (se quiser evoluir o projeto)

Para os dados serem realmente compartilhados entre computadores diferentes
(cada aluno usando o próprio celular, por exemplo), o próximo passo seria
trocar o `localStorage` por um backend real, como:

- **Firebase** (Authentication + Firestore) — gratuito para projetos
  pequenos, sem precisar manter servidor.
- **Supabase** — alternativa open-source ao Firebase, também com plano
  gratuito.

Isso ficaria isolado principalmente no arquivo `js/storage.js`, então dá
para trocar a "camada de dados" sem precisar reescrever as telas.
