# DigiMaster — By Evolua+ Profissões

Projeto de treino de digitação com:

- login com Google e e-mail/senha via Firebase
- sincronização em nuvem
- lições com metas de WPM e precisão
- ranking da turma
- painel do professor/admin
- feedback sonoro
- lembrete visual de posição das mãos após login
- certificado automático em PDF ao concluir todos os desafios

## Estrutura

```text
assets/
  logo.png
  hand-position.png
css/
  style.css
js/
  app.js
  data.js
  firebase.js
  keyboard.js
  lessons.js
  stats.js
index.html
firestore.rules
INSTRUCOES-FIREBASE.md
```

## Importante

O projeto já está configurado para usar os caminhos `assets/`, `css/` e `js/`.

## Certificado

O certificado é liberado quando o aluno conclui todos os desafios com as metas batidas.

## Admin

Defina o e-mail do professor/admin em:

- `js/firebase.js` → constante `ADMIN_EMAILS`
- `firestore.rules` → função `isAdmin()`
