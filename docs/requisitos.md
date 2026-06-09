# Documento de Requisitos

## 2. Requisitos do Sistema

### 2.1. REQ01: Cadastro de usuário

**Descrição:** O sistema deve realizar o cadastro de novos alunos, armazenando as seguintes informações obrigatórias: nome completo, e-mail, telefone, CPF, senha e endereço do ponto de encontro para a primeira aula a ser solicitada.

**Critérios de aceitação:**

- O usuário deve conseguir acessar a tela de cadastro a partir da tela inicial do aplicativo.
- O cadastro só deve ser processado se todos os campos (nome, e-mail, telefone, CPF, senha e endereço do ponto de encontro para a primeira aula a ser solicitada) estiverem preenchidos.
- O sistema deve validar se o CPF e o e-mail inseridos possuem formatos válidos.
- O sistema não deve permitir a criação de uma conta se o CPF ou e-mail já estiverem cadastrados no banco de dados (exibindo mensagem de erro).
- Após o envio bem-sucedido dos dados, o usuário deve ser salvo no banco de dados e redirecionado automaticamente para a área logada do aplicativo.
- Haverá a seção **“Meu perfil”** para o usuário já cadastrado visualizar as informações nome, e-mail, telefone, CPF, senha e endereço do ponto de encontro e conseguir editá-las.

### 2.2. REQ02: Solicitação de Perfil de Instrutor

**Descrição:** O sistema deve permitir que um usuário com conta padrão solicite a habilitação do seu perfil como instrutor parceiro, selecionando a(s) categoria(s) de habilitação que deseja lecionar (A e/ou B) e fornecendo as documentações legais correspondentes para análise da plataforma.

**Critérios de aceitação:**

- O usuário logado deve ter acesso a uma opção na área de perfil para iniciar o cadastro como instrutor.
- O formulário deve conter um campo de múltipla escolha ou caixa de seleção obrigatória para que o usuário defina a(s) categoria(s) de instrução (A e/ou B).
- O formulário deve conter um campo em que o instrutor informa se fornecerá veículo próprio para as aulas.
- Em síntese, na criação de cadastro de instrutor, devem estar presentes os seguintes campos: nome completo, e-mail, telefone, CNH, credencial oficial, categorias habilitadas, veículo próprio “sim ou não” e senha.
- Após o envio, o perfil não deve ser ativado imediatamente; o status da solicitação deve ser alterado para **"Em Análise"**.
- O sistema deve exibir uma mensagem de sucesso informando que os documentos estão em análise, com um prazo estimado de resposta.
- Haverá a seção **“Meu perfil”** para o usuário já cadastrado visualizar as informações nome completo, e-mail, telefone, CNH, credencial oficial, categorias habilitadas, veículo próprio “sim ou não” e senha e conseguir editá-las.

### 2.3. REQ03: Busca, Seleção e Agendamento de Instrutores

**Descrição:** O sistema deve permitir que o aluno pesquise instrutores disponíveis informando sua localização e necessidades (categoria e veículo). A partir da lista de perfis compatíveis retornada, o aluno poderá acessar a página e a agenda do profissional escolhido para enviar uma solicitação de aula referente a um ou mais horários vagos.

**Critérios de aceitação:**

- A tela de busca deve exigir o preenchimento de dois filtros iniciais obrigatórios: **Categoria Desejada** (A ou B) e **Modalidade do Veículo** ("Tenho veículo próprio" ou "Preciso do veículo do instrutor").
- O sistema deve processar a busca e retornar uma lista contendo apenas instrutores que atendam aos critérios iniciais.
- Se a busca não retornar resultados, o sistema deve exibir uma mensagem clara (ex.: "Nenhum instrutor encontrado com esses critérios na sua região") e sugerir a alteração dos filtros.
- Na tela de resultados, o aluno deve ter acesso a opções de ordenação e filtros secundários, como: “Continuidade com o instrutor que já deu aulas para o aluno”, “Nota de avaliação (maior para menor)” e “Quantidade de aulas concluídas”.
- Cada instrutor na lista de resultados (card) deve exibir um resumo claro contendo: Foto, Nome, Nota média (estrelas), Total de aulas dadas e se possui veículo próprio.
- Ao clicar no perfil de um instrutor específico, o aluno deve visualizar os detalhes completos (os anteriores mais avaliações de alunos). No perfil deve haver um painel interativo de disponibilidade (agenda).
- Na tela do instrutor escolhido, exibir apenas aulas com início previsto para, no mínimo, **192 horas (8 dias)** após a data da solicitação.
- O sistema deve calcular e informar ao aluno, na seção **“Meus Agendamentos”**, os períodos de cancelamento e respectivas porcentagens de reembolso, conforme a política de retenção:
  - Cancelamento até **336 horas (14 dias)** antes do início da aula → **100%** de reembolso
  - Cancelamento entre **168 e 336 horas (7 a 14 dias)** → **80%** de reembolso
  - Cancelamento entre **24 e 168 horas (1 a 7 dias)** → **60%** de reembolso
  - Cancelamento até **24 horas** antes do início da aula → **40%** de reembolso
- O sistema deve apresentar essas informações de forma automática e contextualizada, considerando a data e hora da solicitação e o prazo máximo de confirmação do instrutor (24 horas). Exemplo:
  - Hoje: YYYY‑03‑01 18:00
  - Aula: YYYY‑03‑19 08:00
  - O sistema mostra ao aluno:
    - “Período de 100%: até YYYY‑03‑05 07:59.”
    - “Período de 80%: YYYY‑03‑05 08:00 até YYYY‑03‑12 07:59.”
    - “Período de 60%: YYYY‑03‑12 08:00 até YYYY‑03‑18 07:59.”
    - “Período de 40%: YYYY‑03‑18 08:00 até início da aula.”
- Na tela do instrutor escolhido, deve aparecer o **preço de cada aula** do instrutor selecionado.
- O painel de disponibilidade deve exibir apenas os dias e horários que o instrutor previamente configurou como livres, ocultando ou bloqueando horários já reservados por outros alunos.
- O botão **"Solicitar Aula"** só deve ser habilitado e clicável após o aluno selecionar uma data e um bloco de horário válidos na agenda.
- Ao confirmar a solicitação, o sistema deve registrar o pedido vinculado àquele horário específico e enviar uma notificação para o instrutor (status do pedido: **"Aguardando Confirmação"**).

### 2.4. REQ04: Gestão de Solicitações de Aulas pelo Instrutor

**Descrição:** O sistema deve notificar o instrutor sobre novas solicitações de aulas, permitindo que ele visualize os detalhes do pedido e do aluno, e decida entre aceitar e recusar o agendamento, atualizando o status do pedido e a sua agenda automaticamente.

**Critérios de aceitação:**

- O instrutor deve ter acesso a um painel ou aba específica de **"Solicitações Pendentes"**, além de receber uma notificação no aplicativo quando um novo pedido for feito. (Nas “Solicitações Pendentes”, haverá o status delas: “Aguardando confirmação” ou “Confirmado” ou “Cancelado”.)
- O card da solicitação pendente deve exibir de forma clara: Nome do aluno, foto, nota de avaliação do aluno (estrelas), datas e horários solicitados, categoria (A ou B) e a modalidade do veículo (Próprio ou do Instrutor).
- Se o instrutor clicar em **"Aceitar"**: O sistema deve alterar o status do pedido de "Aguardando Confirmação" para **"Confirmado"**, bloquear definitivamente aquele horário na agenda pública do instrutor e enviar uma notificação de sucesso para o aluno.
- Se o instrutor clicar em **"Recusar"**: O sistema deve exigir que o instrutor selecione um motivo rápido (ex.: "Imprevisto pessoal", "Local muito distante", "Veículo indisponível"), alterar o status para **"Cancelado"** e notificar o aluno sobre a recusa.
- Caso o instrutor não responda à solicitação em até **24 horas** antes do horário previsto para a aula, o sistema deve cancelar o pedido automaticamente por inatividade e avisar ambas as partes.
- Logo quando for clicado em **solicitar aula** (REQ04), o **pagamento** (REQ09) deverá ser confirmado pelo usuário e, assim, efetuado. Caso o instrutor não aceite nem recuse em até 24 horas, então o valor da aula é devolvido automaticamente.

### 2.5. REQ05: Alocação Inteligente

**Descrição:** O sistema deve utilizar inteligência artificial para sugerir o melhor instrutor com base no histórico de dificuldades do aluno e na experiência e habilidade do instrutor nos temas coincidentes com as dificuldades do aluno.

**Critérios de aceitação:**

- Deve haver um **“Dashboard de Evolução”** onde o aluno visualiza sua probabilidade estimada de passar na prova do Detran (média das notas obtidas em cada aula prática).
- No **“Dashboard de Evolução”**, deve haver também a média de cada uma das três competências: baliza, controle de embreagem e percurso (e.g., baliza 5.7, percurso 6.1, controle de embreagem 7.7).
- No **“Dashboard de Evolução”**, deve haver também o número de aulas realizadas, indicando quantas aulas faltam para completar o número mínimo de aulas antes que o candidato (o aluno) possa se inscrever para a prova prática do Detran.
- O instrutor terá acesso ao **“Dashboard de Evolução”** apenas dos alunos que terão aulas marcadas e confirmadas com ele. De fato, na seção “Dashboard de Evolução” na tela do instrutor, aparecerá o dropdown menu dos alunos aos quais ele dará aula.
- No momento em que o instrutor for avaliado no chat conforme o REQ06 do chat, a IA atualizará automaticamente o perfil do instrutor que aparece ao aluno na sua busca conforme o REQ03 da busca de instrutores.
- No momento em que o aluno for avaliado no chat conforme o REQ06 do chat, a IA atualizará automaticamente o perfil e o card de solicitação do aluno que aparece ao instrutor conforme o REQ04 da solicitação pelo aluno.

### 2.6. REQ06: Chat Integrado entre Aluno e Instrutor

**Descrição:** O sistema deve permitir comunicação por chat entre aluno e instrutor após a solicitação de aula ser enviada e a avaliação de cinco estrelas.

**Critérios de aceitação:**

- Na tela do aluno, o chat deverá ser composto por vários “chats”, cada um correspondendo a um instrutor com o qual ele fará a aula.
- Na tela do instrutor, o chat deverá ser composto por vários “chats”, cada um correspondendo a um aluno que solicitou uma aula.
- O chat só é habilitado após o aluno enviar a solicitação.
- A localização exata do aluno só aparece para o instrutor após a aula ser confirmada.
- O chat deve suportar envio de texto e localização.
- Notificações devem ser enviadas quando novas mensagens chegarem.
- Para o instrutor, logo após o término da aula, aparecerá a opção de avaliar o aluno com base no engajamento e no comportamento dele, de **0 a 5 estrelas**, no chat. Isso será importante para que um futuro instrutor desse mesmo aluno visualize a avaliação dele no seu card de solicitação (REQ04).
- Para o aluno, logo após o término da aula, aparecerá a opção de avaliar o instrutor com base na didática e na empatia dele, de **0 a 5 estrelas** no chat. Isso será importante, pois servirá como filtro de escolha para um aluno quando este for buscar instrutores (REQ03).

### 2.7. REQ07: Compartilhamento Seguro de Localização

**Descrição:** O sistema deve permitir que o aluno compartilhe seu endereço exato apenas após o instrutor aceitar a aula.

**Critérios de aceitação:**

- Antes da confirmação, o instrutor vê apenas bairro/região.
- Após a solicitação de aula com o instrutor escolhido pelo aluno, aparecerá uma mensagem / uma tela para o último perguntando se este deseja manter o endereço fornecido anteriormente (presente no cadastro) como ponto de encontro. A mensagem deverá ser do tipo notificação pop-up, perguntando: **“Você deseja enviar o seguinte endereço fornecido como o ponto de encontro da sua aula prática?”**. Também na notificação deve aparecer as opções de resposta: sim ou não (checkbox). No caso de **“não”**, deve surgir um campo, pedindo pelo endereço novo: **“Digite abaixo o endereço a partir do qual você iniciará esta aula prática.”** Haverá atualização automática no cadastro, no campo “Endereço do ponto de encontro”, conforme sua alteração abaixo.
- Após a confirmação, o instrutor recebe o endereço completo nas notificações.

### 2.8. REQ08: Relatório de Aula

**Descrição:** Após cada aula, o instrutor deve preencher um relatório com avaliação do desempenho do aluno.

**Critérios de aceitação:**

- Para o aluno, a seção **“Relatórios de aula”** deverá ser composta por vários “relatórios de aula”, cada um correspondendo a cada aula que o aluno fez. Ao selecionar um determinado “relatório de aula”, o aluno poderá visualizar o relatório em si.
- Para o instrutor, a seção **“Relatórios de aula”** deverá ser composta por vários “relatórios de aula”, cada um correspondendo às próximas aulas, em ordem de cima para baixo conforme o menor intervalo de tempo entre a ocasião e o horário de início da próxima aula.
- Campos obrigatórios: baliza, percurso, controle de embreagem e observações.
- O relatório só é visível ao aluno e aos próximos instrutores após estes confirmarem a aula. No relatório, haverá os seguintes dados: pontos fortes do aluno e pontos a serem melhorados por ele.

### 2.9. REQ09: Pagamento Seguro

**Descrição:** O sistema deve permitir que o aluno realize o pagamento das aulas diretamente pelo aplicativo e mostre a tela do comprovante quando o pagamento for efetuado, garantindo segurança, transparência e repasse automático ao instrutor após a confirmação da aula. O módulo de pagamento deve oferecer múltiplas opções (cartão de crédito, débito e Pix), além de gerenciar cancelamentos e reembolsos conforme políticas definidas no REQ03.

**Critérios de aceitação:**

- Logo quando for clicado em **solicitar aula** (REQ04), o **pagamento** (REQ09) deverá ser confirmado pelo usuário e, assim, efetuado. Caso o instrutor não aceite nem recuse em até 24 horas, então o valor da aula é devolvido automaticamente.
- O aluno deve visualizar o valor total da aula antes de confirmar o pagamento.
- O sistema deve oferecer pelo menos três métodos de pagamento: cartão de crédito, débito e Pix.

---

## 3. Requisitos Não Funcionais

### REQNF01 — Desempenho

95% das requisições simples da API devem responder em até **200 ms** em ambiente local após aquecimento dos containers.

### REQNF02 — Persistência e integridade

100% das entidades críticas devem possuir PK/FK/check constraints; perdas de container não devem apagar dados enquanto o volume Docker existir.

### REQNF03 — Isolamento e manutenibilidade

Frontend, backend e banco rodam em containers separados; alterações no frontend não exigem rebuild do banco.

### REQNF04 — Observabilidade

`/health`, logs de containers e healthcheck do PostgreSQL permitem detectar falha de serviço; em produção, pode-se plugar Prometheus/Grafana ou alertas CI/CD.
