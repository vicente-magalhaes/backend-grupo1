# 🗄️ Diretrizes de Modelagem de Banco de Dados (Supabase / PostgreSQL)

> [cite_start]**Contexto:** Este documento resume as regras fundamentais de Bancos de Dados Relacionais (BDR) e Normalização, servindo como guia obrigatório para a criação de tabelas no Supabase[cite: 2579, 2588, 2946].

## 1. Conceitos Fundamentais
A conversão do modelo lógico para o físico no Supabase deve seguir regras estritas:
* [cite_start]**Entidades e Tabelas:** Cada entidade do negócio (ex: Aluno, Instrutor) torna-se uma Tabela[cite: 2688, 2691, 2868].
* [cite_start]**Atributos e Colunas:** As características da entidade (ex: nome, cargo) tornam-se as colunas (campos) da tabela[cite: 2689, 2870].
* [cite_start]**Registros:** Cada linha na tabela representa uma ocorrência única da entidade[cite: 2630, 2871].

## 2. O Uso de Chaves (Obrigatório)
[cite_start]Os relacionamentos entre as tabelas são criados exclusivamente através do uso de chaves[cite: 2728, 2729, 2887].
* [cite_start]**Chave Primária (Primary Key - PK):** Todo registro deve ter um identificador único que nunca se repete [cite: 2876-2878]. No Supabase, usaremos preferencialmente `UUID` genéricos ou `BIGINT` gerados automaticamente.
* [cite_start]**Chave Estrangeira (Foreign Key - FK):** É o campo que armazena o valor da Chave Primária de outra tabela, criando a conexão lógica entre elas [cite: 2884-2886, 2915].
* [cite_start]**Chaves Concatenadas (Compostas):** Em alguns casos, a exclusividade de um registro só é garantida pela combinação de dois ou mais campos (ex: `apartamento` e `bloco` para identificar uma vaga de garagem)[cite: 2922, 2923, 2926, 2927].

## 3. Regras de Relacionamento e Cardinalidade
[cite_start]A cardinalidade expressa a relação numérica entre as tabelas[cite: 2761, 2762].
* [cite_start]**Relacionamentos 1:N (Um-para-Muitos):** A chave estrangeira fica sempre do lado "Muitos"[cite: 2764, 2765, 2918].
* [cite_start]**Relacionamentos N:N (Muitos-para-Muitos):** Relacionamentos N:N não podem ser implementados diretamente em bancos relacionais[cite: 2729, 2730]. [cite_start]É **obrigatório** quebrar essa relação criando uma tabela intermediária (tabela de junção), transformando-a em dois relacionamentos 1:N[cite: 3454].

## 4. Normalização de Dados (Evitando Anomalias)
[cite_start]A normalização é essencial para evitar redundância de dados, evitar inconsistências e prevenir anomalias na hora de inserir, alterar ou excluir registros[cite: 2946, 2947, 3042]. Todas as tabelas no Supabase devem respeitar até a Terceira Forma Normal (3FN).

### Primeira Forma Normal (1FN) - Valores Atômicos
* [cite_start]**Regra:** Todas as colunas devem conter apenas valores atômicos (únicos)[cite: 3098, 3100, 3101]. 
* [cite_start]**Prática:** É proibido ter colunas com listas, conjuntos de valores ou dados compostos separados por vírgula no mesmo campo[cite: 3101, 3381]. [cite_start]Estruturas compostas devem ser transformadas em outras tabelas[cite: 3455].

### Segunda Forma Normal (2FN) - Dependência Total
* [cite_start]**Regra:** A tabela deve estar em 1FN e todos os atributos não-chave devem ser totalmente dependentes da chave primária inteira[cite: 3134, 3135].
* **Prática:** Se uma tabela tem uma chave primária composta (duas colunas formam o ID), nenhum campo pode depender apenas de metade dessa chave. 

### Terceira Forma Normal (3FN) - Dependência Exclusiva
* [cite_start]**Regra:** A tabela deve estar em 2FN e não pode haver dependência funcional entre atributos não-chave[cite: 3240, 3243, 3244]. Os atributos devem depender *apenas* da chave primária.
* [cite_start]**Prática 1 (Isolamento):** Se o endereço depende do `CEP` ou do `CPF` do cliente, e não do ID do Pedido, esses dados devem ser movidos para uma tabela `Clientes`[cite: 3258, 3260, 3261].
* [cite_start]**Prática 2 (Sem Dados Calculados):** Campos cujo valor pode ser obtido através de cálculos matemáticos sobre outras colunas (ex: `valor_total = quantidade * valor_unitario`) **não devem** ser salvos no banco de dados[cite: 3267, 3270]. O backend (aplicação) deve fazer esse cálculo em tempo de execução.