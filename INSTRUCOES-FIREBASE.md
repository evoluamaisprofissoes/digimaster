# Configuração Firebase — DigiMaster

## 1) Authentication
Ative no Firebase Console:

- Google
- E-mail/senha

Depois, em **Authentication > Settings > Domínios autorizados**, adicione:

- seu-usuario.github.io
- seu domínio personalizado, se houver

## 2) Firestore Rules

Abra **Firestore Database > Regras** e cole o conteúdo do arquivo `firestore.rules`.

## 3) Admin / Professor

Troque o e-mail placeholder pelos e-mails reais do professor/admin em dois lugares:

- `js/firebase.js` → `ADMIN_EMAILS`
- `firestore.rules` → função `isAdmin()`

Sem isso, o painel do professor não aparecerá.

## 4) Publicação no GitHub Pages

Envie a pasta completa mantendo esta estrutura:

- `index.html`
- `assets/`
- `css/`
- `js/`

Depois ative em **Settings > Pages**.

## 5) Observação importante

O login com Google só funciona no domínio autorizado no Firebase. Se testar localmente por arquivo (`file://`), o popup do Google pode falhar.
