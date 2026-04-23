# 🔐 Configurar Regras de Segurança — Firebase

## Por que isso é importante?
As regras garantem que cada aluno só acessa os próprios dados.
Nenhum aluno consegue ver o progresso de outro.

---

## Como aplicar as regras

1. Acesse: https://console.firebase.google.com
2. Selecione o projeto **digimaster-evolua**
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Regras**
5. Apague tudo que estiver lá
6. Cole o conteúdo do arquivo `firestore.rules`
7. Clique em **Publicar**

---

## Como ativar o login com Google

1. No Firebase Console, clique em **Authentication**
2. Clique em **Sign-in method**
3. Clique em **Google** → ative o toggle → salve
4. Clique em **E-mail/senha** → ative o primeiro toggle → salve

---

## Como hospedar no GitHub Pages

1. Crie um repositório no GitHub (ex: `digimaster`)
2. Faça upload de todos os arquivos mantendo as pastas
3. Vá em **Settings → Pages**
4. Source: **Deploy from a branch** → branch **main** → pasta **/ (root)**
5. Salve e aguarde ~2 minutos
6. Acesse: `https://seu-usuario.github.io/digimaster`

---

## ⚠️ Importante — Domínio autorizado no Firebase

Após hospedar no GitHub Pages, você precisa autorizar o domínio:

1. Firebase Console → **Authentication** → **Settings**
2. Em **Domínios autorizados**, clique em **Adicionar domínio**
3. Digite: `seu-usuario.github.io`
4. Salve

Sem isso, o login com Google não vai funcionar no site publicado.
