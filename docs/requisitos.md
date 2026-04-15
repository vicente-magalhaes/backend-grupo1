# Documento de Requisitos

## 1. Requisitos do Sistema

### 1.1. REQ01: Cadastro de usuário

**Descrição:** O sistema deve realizar o cadastro de novos alunos, armazenando as seguintes informações obrigatórias: nome completo, e-mail, telefone, CPF, senha e endereço do ponto de encontro para a primeira aula a ser solicitada.

**Critérios de aceitação:** * O usuário deve conseguir acessar a tela de cadastro a partir da tela inicial do aplicativo.

- O cadastro só deve ser processado se todos os campos (nome, e-mail, telefone, CPF, senha e endereço do ponto de encontro para a primeira aula a ser solicitada) estiverem preenchidos.
- O sistema deve validar se o CPF e o e-mail inseridos possuem formatos válidos.
- O sistema não deve permitir a criação de uma conta se o CPF ou e-mail já estiverem cadastrados no banco de dados (exibindo mensagem de erro).
- Após o envio bem-sucedido dos dados, o usuário deve ser salvo no banco de dados e redirecionado automaticamente para a área logada do aplicativo.

### 1.2. REQ02: Solicitação de Perfil de Instrutor

**Descrição:** O sistema deve permitir que um usuário com conta padrão solicite a habilitação do seu perfil como instrutor parceiro, selecionando a(s) categoria(s) de habilitação que deseja lecionar (A ou B) e fornecendo as documentações legais correspondentes para análise da plataforma.

**Critérios de aceitação:** * O usuário logado deve ter acesso a uma opção na área de perfil para iniciar o cadastro como instrutor.

- O formulário deve conter um campo de múltipla escolha ou caixa de seleção obrigatória para que o usuário defina a(s) categoria(s) de instrução (A e/ou B).
- O formulário deve conter um campo em que o instrutor informa se fornecerá veículo próprio para as aulas.
- Se o  instrutor fornecer veículo próprio,  o sistema deve habilitar e tornar obrigatório o upload do CRLV do veículo e de uma foto que comprove a identificação visual exigida pela Resolução 1020 do Detran. 
- O sistema deve exigir o upload de documentos obrigatórios gerais (CNH do instrutor e credencial oficial).
- O envio da solicitação só deve ser habilitado se todos os campos obrigatórios e uploads exigidos para a categoria escolhida forem preenchidos.
- Após o envio, o perfil não deve ser ativado imediatamente; o status da solicitação deve ser alterado para "Em Análise".
- O sistema deve exibir uma mensagem de sucesso informando que os documentos estão em análise, com um prazo estimado de resposta.

### 1.3. REQ03: Busca, Seleção e Agendamento de Instrutores

**Descrição:** O sistema deve permitir que o aluno pesquise instrutores disponíveis informando sua localização e necessidades (categoria e veículo). A partir da lista de perfis compatíveis retornada, o aluno poderá acessar a página e a agenda do profissional escolhido para enviar uma solicitação de aula referente a um ou mais horários vagos.

**Critérios de Aceitação:**

- A tela de busca deve exigir o preenchimento de três filtros iniciais obrigatórios: Categoria Desejada (A ou B), Bairro/Região e Modalidade do Veículo ("Tenho veículo próprio" ou "Preciso do veículo do instrutor").
- O sistema deve processar a busca e retornar uma lista contendo apenas instrutores com status de perfil "Aprovado" que atendam aos critérios iniciais.
- Se a busca não retornar resultados, o sistema deve exibir uma mensagem clara (ex: "Nenhum instrutor encontrado com esses critérios na sua região") e sugerir a alteração dos filtros.
- Na tela de resultados, o aluno deve ter acesso a opções de ordenação e filtros secundários, como: “Continuidade com o instrutor que já deu aulas para o aluno”, “Nota de avaliação (maior para menor)”, “Área geográfica de atuação” e “Quantidade de aulas concluídas”.
- Na tela de resultados de instrutores disponíveis, exibir apenas aulas com início previsto para, no mínimo, 192 horas (8 dias) após a data da solicitação. O sistema deve calcular e informar ao aluno, na seção “Meus Agendamentos”, os períodos de cancelamento e respectivas porcentagens de reembolso, conforme a política de retenção:
Cancelamento até 336 horas (14 dias) antes do início da aula → 100% de reembolso  
Cancelamento entre 168 e 336 horas (7 a 14 dias) → 80% de reembolso  
Cancelamento entre 24 e 168 horas (1 a 7 dias) → 60% de reembolso  
Cancelamento até 24 horas antes do início da aula → 40% de reembolso  
O sistema deve apresentar essas informações de forma automática e contextualizada, considerando a data e hora da solicitação e o prazo máximo de confirmação do instrutor (24 horas). Exemplo:
Hoje: YYYY‑03‑01 18:00  
Aula: YYYY‑03‑19 08:00  
O sistema mostra ao aluno:

“Período de 100%: até YYYY‑03‑05 07:59.
Período de 80%: YYYY‑03‑05 08:00 até YYYY‑03‑12 07:59.
Período de 60%: YYYY‑03‑12 08:00 até YYYY‑03‑18 07:59.
Período de 40%: YYYY‑03‑18 08:00 até início da aula.”
Na tela de resultados, deve aparecer o preço das aulas de cada instrutor disponível.
- Cada instrutor na lista de resultados (card) deve exibir um resumo claro contendo: Foto, Nome, Nota média (estrelas), Total de aulas dadas e se possui veículo próprio adaptado.
- Ao clicar no perfil de um instrutor específico, o aluno deve visualizar os detalhes completos (os anteriores mais descrição do método de ensino e avaliações de alunos). No perfil deve haver um painel interativo de disponibilidade (agenda).
- O painel de disponibilidade deve exibir apenas os dias e horários que o instrutor previamente configurou como livres, ocultando ou bloqueando horários já reservados por outros alunos.
- O botão "Solicitar Aula" só deve ser habilitado e clicável após o aluno selecionar uma data e um bloco de horário válidos na agenda.
- Ao confirmar a solicitação, o sistema deve registrar o pedido vinculado àquele horário específico e enviar uma notificação para o instrutor (status do pedido: "Aguardando Confirmação").

### 1.4. REQ04: Gestão de Solicitações de Aulas pelo Instrutor

**Descrição:** O sistema deve notificar o instrutor sobre novas solicitações de aulas, permitindo que ele visualize os detalhes do pedido e do aluno, e decida entre aceitar e recusar o agendamento, atualizando o status do pedido e a sua agenda automaticamente.

**Critérios de Aceitação:** * O instrutor deve ter acesso a um painel ou aba específica de "Solicitações Pendentes", além de receber uma notificação no aplicativo quando um novo pedido for feito. (Nas “Solicitações Pendentes”, haverá o status delas: “Aguardando confirmação” ou “Confirmado” ou “Cancelado”.)

- O card da solicitação pendente deve exibir de forma clara: Nome do aluno, foto, nota de avaliação do aluno (estrelas), datas e horários solicitados, região da aula, categoria (A ou B) e a modalidade do veículo (Próprio ou do Instrutor).
- Se o instrutor clicar em "Aceitar": O sistema deve alterar o status do pedido de "Aguardando Confirmação" para "Confirmado", bloquear definitivamente aquele horário na agenda pública do instrutor e enviar uma notificação de sucesso para o aluno.
- Se o instrutor clicar em "Recusar": O sistema deve exigir que o instrutor selecione um motivo rápido (ex: "Imprevisto pessoal", "Local muito distante", "Veículo indisponível"), alterar o status para "Cancelado", liberar o horário na agenda e notificar o aluno sobre a recusa.
- Caso o instrutor não responda à solicitação em até 24 horas antes do horário previsto para a aula, o sistema deve cancelar o pedido automaticamente por inatividade e avisar ambas as partes.

### 1.5. REQ05: Alocação Inteligente e IA (Inovação)

**Descrição:** O sistema deve utilizar inteligência artificial para sugerir o melhor instrutor com base no histórico de dificuldades do aluno e na experiência e habilidade do instrutor nos temas coincidentes com as dificuldades do aluno.

**Critérios de aceitação:** * A IA deve analisar os “Relatórios de Aula” anteriores para identificar se o aluno precisa de reforço em baliza, percurso ou controle de embreagem.

- O sistema deve destacar instrutores que possuem as melhores avaliações especificamente nos pontos fracos do aluno.
- Deve haver um “Dashboard de Evolução” onde o aluno visualiza sua probabilidade estimada de passar na prova do Detran (média das notas obtidas em cada aula prática).

### 1.6. REQ06: Chat Integrado entre Aluno e Instrutor

**Descrição:** O sistema deve permitir comunicação por chat entre aluno e instrutor após a solicitação de aula ser enviada.

**Critérios de aceitação:**

- O chat só é habilitado após o aluno enviar a solicitação.
- A localização exata do aluno só aparece para o instrutor após a aula ser confirmada.
- O chat deve suportar envio de texto e localização.
- Notificações devem ser enviadas quando novas mensagens chegarem.

### 1.7. REQ07: Compartilhamento Seguro de Localização

**Descrição:** O sistema deve permitir que o aluno compartilhe seu endereço exato apenas após o instrutor aceitar a aula.

**Critérios de aceitação:**

- Antes da confirmação, o instrutor vê apenas bairro/região.
- O aluno pode editar o ponto de encontro. Após a solicitação de aula com o instrutor escolhido pelo aluno, aparecerá uma mensagem / uma tela para o último perguntando se este deseja manter o endereço fornecido anteriormente (ou nessa mensagem análoga anterior ou no cadastro caso seja a 1.a aula solicitada) como ponto de encontro.
- Após a confirmação, o instrutor recebe o endereço completo, ponto no mapa e (opcionalmente) rota sugerida.

### 1.8. REQ08: Relatório de Aula

**Descrição:** Após cada aula, o instrutor deve preencher um relatório com avaliação do desempenho do aluno.

**Critérios de aceitação:**

- Campos obrigatórios: baliza, percurso, controle de embreagem e observações.
- O relatório só é visível ao aluno e a futuros instrutores após o aluno marcar nova aula. No relatório, haverá os seguintes dados para alimentar o módulo de IA (requisito REQ05): pontos fortes do aluno e pontos a serem melhorados por ele.
- Os dados alimentam o módulo de IA, sendo útil para corretas sugestões de alocação de aulas entre os alunos que têm determinadas dificuldades contidas nesses dados e os instrutores que têm maior domínio e destreza nas habilidades e competências coincidentes com tais dificuldades..

### 1.9. REQ09: Pagamento Seguro

**Descrição:** O sistema deve permitir que o aluno realize o pagamento das aulas diretamente pelo aplicativo e mostre a tela do comprovante quando o pagamento for efetuado, garantindo segurança, transparência e repasse automático ao instrutor após a confirmação da aula. O módulo de pagamento deve oferecer múltiplas opções (cartão de crédito, débito e Pix), além de gerenciar cancelamentos e reembolsos conforme políticas definidas pela plataforma.

**Critérios de aceitação:**

- O aluno deve visualizar o valor total da aula antes de confirmar o pagamento.
- O sistema deve oferecer pelo menos três métodos de pagamento: cartão de crédito, débito e Pix.
- O pagamento só pode ser processado se o instrutor tiver confirmado a aula.
- Após o pagamento, o sistema deve exibir uma tela de comprovante digital, permitindo que o aluno baixe o comprovante e que o instrutor o acesse posteriormente.
- O repasse ao instrutor deve ocorrer automaticamente após a conclusão da aula, descontando a taxa da plataforma.
- Em caso de cancelamento antes de 24 horas da aula, o sistema deve permitir reembolso integral; após esse prazo, aplicar política de retenção parcial (o sistema devolve apenas 80% do valor pago.).
- Todas as transações devem ser registradas em log de auditoria para fins de conformidade e segurança.

### 1.10. REQ10: Escalabilidade e Performance - *NF*

**Descrição:** O sistema deve ser escalável para suportar o crescimento da base de usuários e utilizar arquitetura de nuvem para manter um tempo de resposta de até 2 segundos por requisição, mesmo em momentos de pico de acesso (ex: horários de pico diários entre 18h e 21h para agendamentos).

**Critérios de aceitação:** * Auto-scaling: A infraestrutura deve aumentar automaticamente o número de instâncias de processamento se o uso de CPU ultrapassar 70%.

- Tempo de resposta: A busca de instrutores por geolocalização não deve exceder 2 segundos, mesmo com 1.000 usuários simultâneos.

### 1.11. REQ11: Segurança e LGPD (Proteção de Dados) - *NF*

**Descrição:** O sistema deve garantir o sigilo das informações sensíveis (CPF, documentos, endereços) e a privacidade dos relatórios de aula.

**Critérios de aceitação:** * Criptografia: Todos os documentos (CNH, CRLV) devem ser armazenados com criptografia AES-256.

- Anonimização: Dados de geolocalização exata só devem ser revelados ao instrutor após a confirmação da aula.
- Log de auditoria: O sistema deve registrar quem acessou quais dados e quando, para fins de conformidade legal.

### 1.12. REQ12: Manutenibilidade - *NF*

**Descrição:** O software deve ser desenvolvido de forma que suas partes funcionem de maneira independente, facilitando correções e atualizações sem interromper o funcionamento geral do sistema. Para isso, será utilizada uma arquitetura baseada em microsserviços, na qual cada módulo - login, pagamento, chat, agendamento e notificações (do status das solicitações de aulas ao instrutor e também do recebimento da confirmação da aula prática ao aluno) - opera separadamente, comunicando-se por meio de interfaces bem definidas. Essa estrutura permite que falhas em um serviço não afetem os demais e que novas funcionalidades sejam adicionadas com menor risco.

**Critérios de aceitação:**

- Cada funcionalidade principal (cadastro, agendamento, pagamento, chat e notificações) deve ser implementada como um microsserviço independente.
- Atualizações ou correções em um microsserviço não devem causar indisponibilidade nos outros.
- O sistema deve permitir substituição ou melhoria de um serviço sem necessidade de reiniciar toda a aplicação.
- Deve existir documentação clara sobre as interfaces de comunicação entre os microsserviços.
- Pelo menos 80% das alterações devem ser isoladas a um único microsserviço, sem impacto em outros componentes.

### 1.13. REQ09: Integração Contínua e Entrega Contínua (CI/CD) e Observabilidade - *NF*

**Descrição:** O processo de desenvolvimento deve incluir CI/CD (Integração Contínua e Entrega Contínua), que consiste em práticas automáticas para garantir que o código seja testado e implantado de forma segura e rápida.
Na Integração Contínua (CI), cada nova alteração feita pelos desenvolvedores é automaticamente verificada por testes, evitando que erros se acumulem.
Na Entrega Contínua (CD), o sistema realiza a publicação das atualizações de forma automatizada, garantindo que novas versões cheguem ao ambiente de produção com segurança e sem interrupções.
Além disso, o sistema deve possuir mecanismos de observabilidade, ou seja, monitoramento constante do funcionamento dos serviços, com alertas automáticos em caso de falhas.

**Critérios de aceitação:**

- Toda alteração de código deve passar por testes automatizados antes de ser incorporada à versão principal (antes do merge na branch principal) [CI].
- O processo de implantação deve ocorrer de forma automatizada, sem necessidade de intervenção manual [CD].
- O sistema deve emitir alertas automáticos caso algum serviço essencial (pagamento, chat, agendamento e notificação) apresente erro por mais de 5 minutos, garantindo a observabilidade. → O requisito observabilidade será testado pela ocorrência dos alertas automáticos caso os serviços essenciais parem de funcionar.
- Pelo menos 90% dos microsserviços devem possuir logs estruturados e métricas instrumentadas (expostas via ferramentas como Prometheus, CloudWatch ou Grafana) que permitam visualizar o estado dos serviços em tempo real e gerar alertas automáticos em caso de falhas.

