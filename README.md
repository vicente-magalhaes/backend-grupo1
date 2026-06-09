# App de conexão aluno <-> instrutor para CNH

## 📖 Ideia de Negócio
**Resumo:**
Dado o fim da obrigatoriedade de frequentar a autoescola para se obter a Carteira Nacional de Habilitação, o aplicativo Quero Dirigir surge com o objetivo de flexibilizar, facilitar e diminuir os custos no processo de treinamento para a prova prática do Detran. Sua principal função é conectar instrutores autônomos a pessoas que desejam se preparar para a prova prática com profissionais bem treinados e experientes.


**Contexto:**
A partir da criação da Resolução CONTRAN Nº 1020, acabou-se com a exigência de frequentar Centros de Formação de Condutores (autoescolas) para obter a Carteira de Habilitação Nacional (CNH). Consequentemente, a demanda pelas autoescolas diminui, de modo que os instrutores não necessitam mais do intermédio dessas instituições para conseguir alunos a quem podem ensinar conduta correta no trânsito. A partir disso, enfrentam o impasse de se conectar aos alunos. O nosso objetivo é criar um app de Marketplace (oferecimento de serviços) para conectar instrutores autônomos a pessoas que desejam se preparar para a prova prática com profissionais bem treinados e experientes.

**Problema:**
No método de preparação para a prova prática tradicional, com as autoescolas, há pouca praticidade e altos custos. A disponibilidade de horários oferecida pela autoescola é pouco flexível. Assim, o aluno leva muito mais tempo até o fim do processo, enquanto o instrutor fica subordinado às alocações da autoescola. Além disso, o aluno precisa ir até a autoescola para iniciar a aula, e caso atrase, perde a aula e lida com altos gastos. Pouco desse gasto do aluno é repassado para o instrutor.
Como não é mais necessário que o aluno frequente o Centro de Formação de Condutores, ele tende a buscar mais flexibilidade e economia. Com isso, surge a dificuldade de acesso a bons profissionais, enquanto estes buscam um meio de obter alunos.

**Função:**
O software será responsável por conctar os instrutores de aulas práticas com os alunos que desejam tirar sua habilitação de carro ou moto. Para isso, o aluno fará uma busca por instrutores, filtrando por categoria desejada, bairro/região e se necessita de veículo para a aula. Assim, terá acesso a uma lista de instrutores que atendem aos requisitos, podendo acessar detalhes completos dos instrutores, suas agendas e então solicitar aula. O instrutor poderá gerenciar suas aulas pelo próprio app e liberar para o aluno relatórios de aula. 

**Perfil de Usuário:**
| Aluno (Candidato a Condutor) | Instrutor de Trânsito |
| :--- | :--- |
| Busca a obtenção da Carteira Nacional de Habilitação (CNH). | Busca autonomia profissional (desvinculação exclusiva de autoescolas). |
| Procura alternativas financeiramente mais acessíveis (otimização de custos). | Almeja expandir sua carteira de clientes e alcance de mercado. |
| Necessita de flexibilidade para o agendamento de aulas práticas. | Deseja maximizar sua margem de lucro por meio de remuneração direta. |
| Valoriza a personalização do ensino com metodologias adaptadas ao seu perfil. | Exige autonomia e controle total sobre a gestão da própria agenda. |
| Valoriza a personalização do ensino com metodologias adaptadas ao seu perfil. | Necessita de uma ferramenta centralizada para gestão de agendamentos e recebimentos (redução de burocracia)." |

---

## 📋 Requisitos

Abaixo está a visão geral das funcionalidades do sistema. Para visualizar as regras de negócio detalhadas e os Critérios de Aceitação completos de cada item, **[consulte o nosso Documento de Requisitos completo](./docs/requisitos.md)**.


| Código      | Nome                                           | Tipo | Descrição Resumida                                                                                                                                 |
| ----------- | ---------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **REQ01**   | Cadastro de usuário                            | F    | Cadastro e seção “Meu perfil” do aluno com visualização e edição dos dados pessoais e do ponto de encontro.                                        |
| **REQ02**   | Solicitação de Perfil de Instrutor             | F    | Cadastro de instrutor com categorias A/B, CNH, credencial e veículo próprio; status “Em Análise”; seção “Meu perfil” editável.                   |
| **REQ03**   | Busca, Seleção e Agendamento de Instrutores    | F    | Busca por categoria e modalidade de veículo; agenda com antecedência mínima de 8 dias; preço da aula; política de reembolso em “Meus Agendamentos”. |
| **REQ04**   | Gestão de Solicitações de Aulas pelo Instrutor | F    | Painel de solicitações com aceitar/recusar; pagamento na solicitação; cancelamento automático e reembolso se instrutor não responder em 24 h.      |
| **REQ05**   | Alocação Inteligente                           | F    | Dashboard de Evolução para aluno e instrutor; atualização de perfis a partir das avaliações no chat (REQ06).                                        |
| **REQ06**   | Chat Integrado entre Aluno e Instrutor         | F    | Chats por par aluno–instrutor; texto e localização; avaliações de 0 a 5 estrelas após a aula; notificações de mensagens.                         |
| **REQ07**   | Compartilhamento Seguro de Localização         | F    | Endereço parcial antes da confirmação; pop-up de confirmação do ponto de encontro; endereço completo nas notificações após confirmação.           |
| **REQ08**   | Relatório de Aula                              | F    | Relatórios por aula com baliza, percurso, embreagem e observações; visibilidade após confirmação da aula pelos próximos instrutores.             |
| **REQ09**   | Pagamento Seguro                               | F    | Pagamento na solicitação (cartão, débito, Pix); reembolso automático se instrutor não responder em 24 h; reembolsos conforme política do REQ03.    |
| **REQNF01** | Desempenho                                     | NF   | 95% das requisições simples da API respondem em até 200 ms em ambiente local após aquecimento dos containers.                                     |
| **REQNF02** | Persistência e integridade                     | NF   | Entidades críticas com PK/FK/check constraints; dados preservados enquanto o volume Docker existir.                                                |
| **REQNF03** | Isolamento e manutenibilidade                  | NF   | Frontend, backend e banco em containers separados; alterações no frontend não exigem rebuild do banco.                                            |
| **REQNF04** | Observabilidade                                | NF   | `/health`, logs de containers e healthcheck do PostgreSQL; suporte a Prometheus/Grafana ou alertas CI/CD em produção.                              |


---

## 💻 Tecnologias Utilizadas

A stack principal do projeto foi escolhida visando produtividade, escalabilidade e facilidade de manutenção:

- **Linguagem:** Python
- **Framework Backend:** FastAPI (para criação ágil dos microsserviços e APIs)
- **Banco de Dados e Autenticação:** Supabase (PostgreSQL em nuvem)
- **IDE Recomendada:** Cursor

---

## 🚀 Instruções de Instalação (Para novos Desenvolvedores)

Seja bem-vindo ao time! Para configurar o projeto na sua máquina local, siga o passo a passo abaixo no terminal do Cursor:

**1. Clone o repositório para o seu computador:**

```bash
git clone [https://github.com/vicente-magalhaes/backend-grupo1.git](https://github.com/vicente-magalhaes/backend-grupo1.git)
cd backend-grupo1
```

**2. Crie o Ambiente Virtual (Isolamento do projeto):**

```bash
python -m venv venv
```

**3. Ative o Ambiente Virtual:**

- *No Windows:*
  ```bash
  venv\Scripts\activate
  ```
- *No Mac/Linux:*
  ```bash
  source venv/bin/activate
  ```

*(Você saberá que deu certo quando aparecer um `(venv)` no início da linha do seu terminal).*

**4. Instale as dependências do projeto:**

```bash
pip install -r requirements.txt
```

**5. Configure as variáveis de ambiente:**
* Crie uma cópia do arquivo `.env.example` na raiz do projeto e renomeie essa cópia para `.env`.
* Abra o arquivo `.env` e preencha os valores das chaves do Supabase (URL e API Key). 
* *Nota: Solicite os valores atuais aos Owners do projeto caso ainda não os tenha.*

---

## 🛠️ Instruções de Uso e Boas Práticas (Git Flow)

Para mantermos a organização do código e evitarmos conflitos, adotamos um fluxo de trabalho rigoroso com o Git. **Leia com atenção:**

### Entendendo as Branches:

- `main`: É a nossa branch de Produção. O código aqui deve estar 100% funcional e finalizado. **NUNCA codifique diretamente na main.**
- `dev`: É a nossa branch de Integração (Desenvolvimento). É aqui que juntamos o trabalho de todo mundo para testar se tudo funciona em conjunto. **Evite codificar grandes coisas diretamente na dev.**
- `feature/...`: São as branches de trabalho individual. Cada nova funcionalidade (ex: cadastro, banco de dados) deve ter sua própria branch.

### Sua rotina diária de código:

1. **Sempre ative o venv** ao abrir o Cursor (Passo 3 da instalação).
2. Vá para a branch de integração e puxe as novidades da equipe:
  ```bash
   git checkout dev
   git pull origin dev
  ```
3. Crie a sua branch de trabalho para a tarefa do dia e entre nela:
  ```bash
   git checkout -b feature/nome-da-sua-tarefa
  ```
4. Escreva seu código e teste localmente usando o servidor (localhost).
5. Salve seu trabalho (Commits) e envie para a nuvem:
  ```bash
   git add .
   git commit -m "Descrição clara do que foi feito"
   git push -u origin feature/nome-da-sua-tarefa
  ```
6. Quando a funcionalidade estiver pronta e validada, crie um *Pull Request* no GitHub para fundir (merge) a sua `feature` na branch `dev`.

---

## 🏗️ Arquitetura e Estrutura de Diretórios

*(A ser preenchido durante o desenvolvimento do projeto)*

---

## 🔒 Segurança: Segredos e Autenticações

Para que o sistema funcione com o banco de dados e outros serviços, utilizamos "chaves" de acesso. Para proteger essas informações, seguimos este padrão:

* **Arquivo `.env` (O Cofre):** Este arquivo guarda as suas chaves reais (API Keys, URLs de Banco). Ele é **estritamente pessoal** e nunca deve ser enviado para o GitHub. O nosso `.gitignore` já está configurado para ignorá-lo.
* **Arquivo `.env.example` (O Modelo):** Este é um arquivo público que contém apenas os nomes das variáveis necessárias (ex: `SUPABASE_URL=`), mas sem os valores. Ele serve para que novos desenvolvedores saibam o que precisam configurar.
* **API Keys:** São como senhas de acesso ao Supabase. Trate-as com o mesmo cuidado que trataria a senha do seu e-mail.

---

## 👥 Owners / Grupo 01

- Felipe Jebyeol Lee Yoon (Nº USP: 16865040)
- Gabriel Baglioni Carvalho Silva (Nº USP: 16866510)
- Vicente Magalhães Fraga Oliveira (Nº USP: 17098022)

