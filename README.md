# Diafanís UI

Interface web da plataforma **Diafanís — Sistema de Gestão para Escritórios de Advocacia**.

---

## 🚀 Como Executar e Buildar

### Pré-requisitos
- **Node.js** (versão LTS recomendada)
- **Gerenciador de pacotes Yarn**

### Passo a passo

1. **Instalar as dependências:**
   ```bash
   yarn install
   ```

2. **Executar em modo de desenvolvimento:**
   ```bash
   yarn dev
   ```
   A aplicação estará disponível em `http://localhost:5173`.

3. **Gerar a build de produção:**
   ```bash
   yarn build
   ```
   Os arquivos compilados serão gerados no diretório `dist/`.

4. **Rodar os testes:**
   ```bash
   yarn test
   ```

---

## 🌿 Fluxo de Branches

Adotamos o seguinte padrão para organização do repositório:

- `main` *(produção)*: Branch principal estável. Responsável pelo pipeline de CI/CD. **Recebe PRs exclusivamente da `develop`**.
- `develop` *(desenvolvimento)*: Branch de integração. Aceita PRs vindos das branches de feature.
- `feature/<nome-da-feature>`: Branches de trabalho criadas para cada funcionalidade ou tela. PRs abertos para `develop` com merge condicionado à aprovação em Code Review.

---

## 🔍 Regras de PR e Code Review
Trabalhamos em pares para revisão cruzada de código. 

### Para quem abre o PR (Bom senso e atomicidade):
- **PRs atômicos:** Foque em uma única tela, funcionalidade ou correção.
- **Commits claros:** Mensagens descritivas explicando o que cada commit realizou.
- **Evite PRs gigantescos:** Não acumule milhares de linhas alteradas em poucos commits.

### Diretrizes para a Revisão (Code Review criterioso):
- [ ] **Comentários:** Verificar e remover comentários desnecessários ou redundantes.
- [ ] **Alinhamento e layout:** Componentes desalinhados ou cortados, layout quebrado, etc.
- [ ] **Eficiência:** Identificar trechos que podem ser escritos de forma mais performática ou limpa.
- [ ] **Arquitetura:** Garantir que pastas, hooks e componentes estejam em seus locais corretos no projeto.
- [ ] **Design/UI:** Evitar visual poluído e excesso desnecessário de cards/badges (evitar o estilo *"vibe coding"*).
- [ ] **Modularização:** Evitar *God Components* (componentes gigantescos e acumuladores de responsabilidade).
- [ ] **Testes:** Garantir a presença de testes automatizados de componentes para o que foi implementado.

---

## 👥 Integrantes

- Lucas Ferraz
- Gabriel Cavalcanti
- Maria Bianca
- Pedro Ventura
