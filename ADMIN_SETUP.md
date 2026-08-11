# DigiMaster - ativacao do perfil administrativo

Esta atualizacao adiciona um dashboard administrativo com acesso de leitura ao desempenho dos alunos sem liberar os dados publicamente.

## 1. Publicar as regras do Firestore

No Firebase Console do projeto `digimaster-evolua-a57f0`:

1. Abra **Firestore Database > Rules**.
2. Substitua as regras atuais pelo conteudo do arquivo `firestore.rules` deste pacote.
3. Clique em **Publish**.

## 2. Tornar seu usuario administrador

Existem duas formas.

### Opcao A - conta corporativa

Contas verificadas terminadas em `@evoluaprofissoes.com.br` sao reconhecidas automaticamente como administradoras pelas regras novas.

### Opcao B - qualquer e-mail, inclusive Gmail

1. Entre uma vez no DigiMaster com a conta que sera sua conta administrativa.
2. No Firebase Console, abra **Authentication > Users**.
3. Localize sua conta e copie o **UID**.
4. Abra **Firestore Database > Data**.
5. Crie uma colecao chamada `admins`.
6. Crie um documento cujo **Document ID seja exatamente o seu UID**.
7. Adicione o campo booleano `active` com valor `true`.
8. Saia e entre novamente no DigiMaster.

O botao **Painel** passara a aparecer apenas para contas administrativas.

## 3. Arquivo a substituir no site

Substitua `js/firebase.js` pela versao deste pacote.

## O que muda

- Dashboard administrativo com total de alunos, WPM medio, precisao media e total de sessoes.
- Busca por nome/e-mail e ordenacao por WPM, precisao, sessoes e ultima atividade.
- Historico individual das ultimas 20 sessoes de cada aluno.
- Visualizacao das licoes concluidas de cada aluno.
- Exportacao CSV continua disponivel.
- Botao de logout visivel tambem no celular.
- Duracoes de 3, 5, 10 e 15 minutos, alem das atuais.
- Novo modo **Texto personalizado**, permitindo colar um texto de ate 12.000 caracteres.
- Banco ampliado de textos para pratica livre.
- 20 novas licoes: 5 Basico, 5 Intermediario, 5 Avancado e 5 Numeros.
- Sessoes passam a registrar tambem modo e duracao no Firestore.
- Progresso agregado passa a registrar quantidade de licoes concluidas.

## Observacao importante

Alterar o arquivo `firestore.rules` no GitHub nao publica as regras automaticamente. Elas precisam ser publicadas no Firebase Console ou por um pipeline de deploy configurado para o projeto.
