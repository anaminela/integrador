-- TABELAS

CREATE TABLE usuario (
    id_usuario       SERIAL PRIMARY KEY,
    nome_completo    VARCHAR(150) NOT NULL,
    telefone         VARCHAR(20)  NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    cpf_cnpj         VARCHAR(20)  NOT NULL UNIQUE,
    senha_hash       VARCHAR(255) NOT NULL,
    perfil           VARCHAR(20)  NOT NULL
                     CHECK (perfil IN ('CLIENTE','ADMINISTRADOR','FUNCIONARIO','PROFESSOR')),
    data_nascimento  DATE,
    ativo            BOOLEAN NOT NULL DEFAULT TRUE,
    aceite_termos    BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em    TIMESTAMP
);
CREATE INDEX idx_usuario_perfil ON usuario(perfil);
CREATE INDEX idx_usuario_ativo  ON usuario(ativo);

CREATE TABLE quadra (
    id_quadra    SERIAL PRIMARY KEY,
    nome         VARCHAR(100) NOT NULL,
    descricao    TEXT,
    tamanho      VARCHAR(50),
    coberta      BOOLEAN NOT NULL DEFAULT FALSE,
    ativa        BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_quadra_ativa ON quadra(ativa);

CREATE TABLE modalidade (
    id_modalidade SERIAL PRIMARY KEY,
    nome          VARCHAR(80) NOT NULL UNIQUE,
    descricao     TEXT
);

CREATE TABLE quadra_modalidade (
    id_quadra      INT NOT NULL REFERENCES quadra(id_quadra)         ON DELETE CASCADE,
    id_modalidade  INT NOT NULL REFERENCES modalidade(id_modalidade) ON DELETE CASCADE,
    PRIMARY KEY (id_quadra, id_modalidade)
);

CREATE TABLE horario_quadra (
    id           SERIAL PRIMARY KEY,
    id_quadra    INT NOT NULL REFERENCES quadra(id_quadra) ON DELETE CASCADE,
    dia_semana   SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio  TIME NOT NULL DEFAULT '07:00',
    hora_fim     TIME NOT NULL DEFAULT '22:00',
    disponivel   BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_horario_quadra_dia UNIQUE (id_quadra, dia_semana),
    CONSTRAINT chk_horario_ordem CHECK (hora_inicio < hora_fim)
);
CREATE INDEX idx_horario_quadra_quadra ON horario_quadra(id_quadra);

CREATE TABLE agendamento (
    id_agendamento     SERIAL PRIMARY KEY,
    id_cliente         INT NOT NULL REFERENCES usuario(id_usuario),
    id_quadra          INT NOT NULL REFERENCES quadra(id_quadra),
    id_modalidade      INT REFERENCES modalidade(id_modalidade),
    id_usuario_criador INT REFERENCES usuario(id_usuario),
    data_reserva       DATE NOT NULL,
    hora_inicio        TIME NOT NULL,
    hora_fim           TIME NOT NULL,
    tipo_reserva       VARCHAR(20) NOT NULL DEFAULT 'AVULSO'
                       CHECK (tipo_reserva IN ('AVULSO','MENSAL','TURMA','EVENTO')),
    status             VARCHAR(20) NOT NULL DEFAULT 'SOLICITADO'
                       CHECK (status IN ('SOLICITADO','APROVADO','CONCLUIDO','CANCELADO','RECUSADO')),
    preco              NUMERIC(10,2) NOT NULL DEFAULT 0,
    criado_em          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em      TIMESTAMP,
    CONSTRAINT chk_agendamento_horario CHECK (hora_inicio < hora_fim)
);
CREATE INDEX idx_agend_quadra_data ON agendamento(id_quadra, data_reserva);
CREATE INDEX idx_agend_cliente     ON agendamento(id_cliente);
CREATE INDEX idx_agend_status      ON agendamento(status);

CREATE TABLE fila_espera (
    id_fila       SERIAL PRIMARY KEY,
    id_cliente    INT NOT NULL REFERENCES usuario(id_usuario),
    id_quadra     INT NOT NULL REFERENCES quadra(id_quadra),
    id_modalidade INT REFERENCES modalidade(id_modalidade),
    data_reserva  DATE NOT NULL,
    hora_inicio   TIME NOT NULL,
    hora_fim      TIME NOT NULL,
    posicao       INT NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'AGUARDANDO'
                  CHECK (status IN ('AGUARDANDO','CHAMADO','CONFIRMADO','CANCELADO')),
    criado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_fila_slot ON fila_espera(id_quadra, data_reserva, hora_inicio);

CREATE TABLE turma (
    id            SERIAL PRIMARY KEY,
    nome          VARCHAR(100) NOT NULL,
    professor_id  INT REFERENCES usuario(id_usuario),
    id_quadra     INT REFERENCES quadra(id_quadra),
    dia_semana    SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio   TIME NOT NULL,
    hora_fim      TIME NOT NULL,
    capacidade    INT NOT NULL DEFAULT 10,
    ativo         BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_turma_horario CHECK (hora_inicio < hora_fim)
);
CREATE INDEX idx_turma_quadra_dia ON turma(id_quadra, dia_semana);

CREATE TABLE turma_aluno (
    id_turma_aluno   SERIAL PRIMARY KEY,
    turma_id         INT NOT NULL REFERENCES turma(id)             ON DELETE CASCADE,
    id_usuario       INT NOT NULL REFERENCES usuario(id_usuario)   ON DELETE CASCADE,
    data_inscricao   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativo            BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_turma_aluno UNIQUE (turma_id, id_usuario)
);

CREATE TABLE treino (
    id_treino      SERIAL PRIMARY KEY,
    id_professor   INT REFERENCES usuario(id_usuario),
    id_modalidade  INT REFERENCES modalidade(id_modalidade),
    id_quadra      INT REFERENCES quadra(id_quadra),
    nome           VARCHAR(100),
    nivel          VARCHAR(50),
    dia_semana     VARCHAR(30),
    hora_inicio    TIME,
    hora_fim       TIME,
    vagas          INT DEFAULT 10,
    valor_mensal   NUMERIC(10,2) DEFAULT 0,
    ativo          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE inscricao_treino (
    id_inscricao      SERIAL PRIMARY KEY,
    id_treino         INT NOT NULL REFERENCES treino(id_treino) ON DELETE CASCADE,
    id_cliente        INT NOT NULL REFERENCES usuario(id_usuario),
    telefone_contato  VARCHAR(20),
    status            VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADO',
    criado_em         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE produto (
    id_produto      SERIAL PRIMARY KEY,
    nome            VARCHAR(100) NOT NULL,
    descricao       TEXT,
    categoria       VARCHAR(50)  NOT NULL DEFAULT 'OUTROS',
    qtd_estoque     INT           NOT NULL DEFAULT 0 CHECK (qtd_estoque >= 0),
    estoque_minimo  INT           NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
    preco_custo     NUMERIC(10,2) NOT NULL DEFAULT 0,
    preco_venda     NUMERIC(10,2) NOT NULL DEFAULT 0,
    ativo           BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_produto_categoria ON produto(categoria);
CREATE INDEX idx_produto_ativo     ON produto(ativo);

CREATE TABLE venda (
    id_venda         SERIAL PRIMARY KEY,
    id_usuario       INT REFERENCES usuario(id_usuario),   -- vendedor / operador
    id_cliente       INT REFERENCES usuario(id_usuario),   -- cliente
    data_venda       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_total      NUMERIC(10,2) NOT NULL DEFAULT 0,
    forma_pagamento  VARCHAR(30)
);

CREATE TABLE item_venda (
    id_item_venda   SERIAL PRIMARY KEY,
    id_venda        INT NOT NULL REFERENCES venda(id_venda)      ON DELETE CASCADE,
    id_produto      INT NOT NULL REFERENCES produto(id_produto),
    quantidade      INT NOT NULL CHECK (quantidade > 0),
    valor_unitario  NUMERIC(10,2) NOT NULL,
    subtotal        NUMERIC(10,2) NOT NULL
);

CREATE TABLE movimento_estoque (
    id_movimento_estoque SERIAL PRIMARY KEY,
    id_produto      INT NOT NULL REFERENCES produto(id_produto),
    id_usuario      INT REFERENCES usuario(id_usuario),
    tipo            VARCHAR(20) NOT NULL CHECK (tipo IN ('ENTRADA','SAIDA','AJUSTE')),
    quantidade      INT NOT NULL,
    origem          VARCHAR(50),
    data_movimento  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mov_estoque_produto ON movimento_estoque(id_produto);

CREATE TABLE pagamento (
    id_pagamento     SERIAL PRIMARY KEY,
    id_agendamento   INT REFERENCES agendamento(id_agendamento),
    id_venda         INT REFERENCES venda(id_venda),
    id_cliente       INT REFERENCES usuario(id_usuario),
    valor            NUMERIC(10,2) NOT NULL,
    forma_pagamento  VARCHAR(30) NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDENTE'
                     CHECK (status IN ('PENDENTE','PAGO','CANCELADO','ESTORNADO')),
    data_vencimento  DATE,
    criado_em        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movimento_caixa (
    id_movimento_caixa SERIAL PRIMARY KEY,
    id_usuario         INT REFERENCES usuario(id_usuario),
    id_agendamento     INT REFERENCES agendamento(id_agendamento),
    id_venda           INT REFERENCES venda(id_venda),
    id_pagamento       INT REFERENCES pagamento(id_pagamento),
    tipo               VARCHAR(20) NOT NULL CHECK (tipo IN ('ENTRADA','SAIDA')),
    categoria          VARCHAR(50) NOT NULL DEFAULT 'GERAL',
    valor              NUMERIC(10,2) NOT NULL,
    forma_pagamento    VARCHAR(30),
    data_movimento     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_caixa_data ON movimento_caixa(data_movimento);
CREATE INDEX idx_caixa_tipo ON movimento_caixa(tipo);

CREATE TABLE notificacao (
    id_notificacao SERIAL PRIMARY KEY,
    id_usuario     INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    tipo           VARCHAR(50) NOT NULL DEFAULT 'GERAL',
    mensagem       TEXT NOT NULL,
    lida           BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notif_usuario ON notificacao(id_usuario);

CREATE TABLE log_acao (
    id_log         SERIAL PRIMARY KEY,
    id_usuario     INT REFERENCES usuario(id_usuario),
    acao           VARCHAR(20),
    entidade       VARCHAR(80),
    entidade_id    INT,
    detalhe        TEXT,
    data_acao      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_log_data ON log_acao(data_acao);

CREATE TABLE recuperacao_senha (
    id_recuperacao SERIAL PRIMARY KEY,
    id_usuario     INT NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    token          VARCHAR(255) NOT NULL,
    expira_em      TIMESTAMP NOT NULL,
    utilizado      BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_recuperacao_token ON recuperacao_senha(token);

-- SEEDS
-- Senha padrão de todos os usuários seed: "senha123"
-- (hash bcrypt reutilizado do seed original do projeto)

INSERT INTO modalidade (id_modalidade, nome, descricao) VALUES
    (1,'Vôlei de Areia','Modalidade tradicional em areia'),
    (2,'Futevôlei',    'Mistura de futebol com vôlei em quadra de areia'),
    (3,'Beach Tennis', 'Tênis praticado em quadra de areia'),
    (4,'Funcional',    'Treinamento funcional em grupo'),
    (5,'Beach Soccer', 'Futebol de areia');
SELECT setval('modalidade_id_modalidade_seq', (SELECT MAX(id_modalidade) FROM modalidade));

INSERT INTO quadra (id_quadra, nome, descricao, tamanho, coberta, ativa) VALUES
    (1,'Quadra 1','Quadra coberta principal',     '16m x 8m', TRUE,  TRUE),
    (2,'Quadra 2','Quadra coberta secundária',    '16m x 8m', TRUE,  TRUE),
    (3,'Quadra 3','Quadra aberta - Beach Tennis', '20m x 10m',FALSE, TRUE),
    (4,'Quadra 4','Quadra aberta - Futevôlei',    '18m x 9m', FALSE, TRUE);
SELECT setval('quadra_id_quadra_seq', (SELECT MAX(id_quadra) FROM quadra));

INSERT INTO quadra_modalidade (id_quadra, id_modalidade) VALUES
    (1,1),(1,2),(1,3),
    (2,1),(2,2),(2,3),(2,4),
    (3,3),(3,1),
    (4,2),(4,5);

-- Horários de funcionamento: seg (1) a sáb (6) 07:00-22:00, domingo (0) 08:00-20:00
INSERT INTO horario_quadra (id_quadra, dia_semana, hora_inicio, hora_fim, disponivel)
SELECT q.id_quadra, d.dia,
       CASE WHEN d.dia = 0 THEN TIME '08:00' ELSE TIME '07:00' END,
       CASE WHEN d.dia = 0 THEN TIME '20:00' ELSE TIME '22:00' END,
       TRUE
FROM quadra q CROSS JOIN (SELECT generate_series(0,6) AS dia) d;

INSERT INTO usuario (id_usuario, nome_completo, telefone, email, cpf_cnpj, senha_hash, perfil, data_nascimento, ativo, aceite_termos) VALUES
    (1,'Administrador G2', '(49) 99999-0001', 'admin@g2arena.com',      '000.000.000-00', '$2a$10$ku0vVx/khjo7ZPuCCLZOp.7l5Vr5W.Z7eNETk2OeWDvwG3fB8X5w.', 'ADMINISTRADOR', '1985-01-15', TRUE, TRUE),
    (2,'Carlos Souza',     '(49) 99999-0002', 'carlos.souza@g2arena.com','111.111.111-11', '$2a$10$ku0vVx/khjo7ZPuCCLZOp.7l5Vr5W.Z7eNETk2OeWDvwG3fB8X5w.', 'FUNCIONARIO',   '1990-03-22', TRUE, TRUE),
    (3,'Mariana Alves',    '(49) 99999-0003', 'mariana.alves@g2arena.com','222.222.222-22','$2a$10$ku0vVx/khjo7ZPuCCLZOp.7l5Vr5W.Z7eNETk2OeWDvwG3fB8X5w.', 'FUNCIONARIO',   '1993-07-10', TRUE, TRUE),
    (4,'Prof. Ricardo Nunes','(49) 99999-0004','ricardo.nunes@g2arena.com','333.333.333-33','$2a$10$ku0vVx/khjo7ZPuCCLZOp.7l5Vr5W.Z7eNETk2OeWDvwG3fB8X5w.','PROFESSOR',     '1988-11-05', TRUE, TRUE),
    (5,'Profa. Juliana Reis','(49) 99999-0005','juliana.reis@g2arena.com','444.444.444-44','$2a$10$ku0vVx/khjo7ZPuCCLZOp.7l5Vr5W.Z7eNETk2OeWDvwG3fB8X5w.','PROFESSOR',      '1991-05-20', TRUE, TRUE),
    (6,'Ana Lima',         '(49) 99999-1111', 'ana.lima@email.com',       '123.456.789-00','$2a$10$ku0vVx/khjo7ZPuCCLZOp.7l5Vr5W.Z7eNETk2OeWDvwG3fB8X5w.','CLIENTE',        '1995-02-14', TRUE, TRUE),
    (7,'Bruno Ferreira',   '(49) 99999-1112', 'bruno.ferreira@email.com', '234.567.890-11','$2a$10$ku0vVx/khjo7ZPuCCLZOp.7l5Vr5W.Z7eNETk2OeWDvwG3fB8X5w.','CLIENTE',        '1992-08-30', TRUE, TRUE),
    (8,'Camila Rocha',     '(49) 99999-1113', 'camila.rocha@email.com',   '345.678.901-22','$2a$10$ku0vVx/khjo7ZPuCCLZOp.7l5Vr5W.Z7eNETk2OeWDvwG3fB8X5w.','CLIENTE',        '1998-12-01', TRUE, TRUE),
    (9,'Diego Martins',    '(49) 99999-1114', 'diego.martins@email.com',  '456.789.012-33','$2a$10$ku0vVx/khjo7ZPuCCLZOp.7l5Vr5W.Z7eNETk2OeWDvwG3fB8X5w.','CLIENTE',        '1989-06-18', TRUE, TRUE),
    (10,'Eduarda Pires',   '(49) 99999-1115', 'eduarda.pires@email.com',  '567.890.123-44','$2a$10$ku0vVx/khjo7ZPuCCLZOp.7l5Vr5W.Z7eNETk2OeWDvwG3fB8X5w.','CLIENTE',        '2000-09-25', TRUE, TRUE),
    (11,'Felipe Andrade',  '(49) 99999-1116', 'felipe.andrade@email.com', '678.901.234-55','$2a$10$ku0vVx/khjo7ZPuCCLZOp.7l5Vr5W.Z7eNETk2OeWDvwG3fB8X5w.','CLIENTE',        '1996-04-12', TRUE, TRUE);
SELECT setval('usuario_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuario));

-- Turmas (professor + quadra + dia da semana)
INSERT INTO turma (id, nome, professor_id, id_quadra, dia_semana, hora_inicio, hora_fim, capacidade, ativo) VALUES
    (1,'Beach Tennis Iniciante', 4, 3, 1, '19:00','20:00', 8, TRUE),
    (2,'Beach Tennis Avançado',  4, 3, 3, '20:00','21:00', 8, TRUE),
    (3,'Futevôlei Iniciante',    5, 4, 2, '18:00','19:00', 10,TRUE),
    (4,'Vôlei de Areia Adulto',  5, 1, 4, '19:00','20:00', 12,TRUE),
    (5,'Funcional Manhã',        4, 2, 6, '08:00','09:00', 15,TRUE);
SELECT setval('turma_id_seq', (SELECT MAX(id) FROM turma));

INSERT INTO turma_aluno (turma_id, id_usuario) VALUES
    (1,6),(1,7),(1,8),
    (2,9),
    (3,10),(3,11),
    (4,6),(4,9),
    (5,8);

-- Produtos
INSERT INTO produto (id_produto, nome, descricao, categoria, qtd_estoque, estoque_minimo, preco_custo, preco_venda, ativo) VALUES
    (1,'Água Mineral 500ml','Garrafa 500ml','Bebidas', 80, 20, 1.50, 4.00, TRUE),
    (2,'Gatorade 500ml','Isotônico sabor limão','Bebidas', 30, 10, 4.50, 9.00, TRUE),
    (3,'Coca-Cola Lata','Refrigerante 350ml','Bebidas', 60, 15, 2.80, 6.00, TRUE),
    (4,'Barra de Cereal','Barra 25g','Alimentos', 45, 15, 1.20, 3.50, TRUE),
    (5,'Bola de Beach Tennis','Bola oficial','Materiais', 20, 5, 15.00, 30.00, TRUE),
    (6,'Raquete Beach Tennis','Raquete iniciante','Materiais', 10, 3, 120.00, 249.90, TRUE),
    (7,'Protetor Solar FPS 50','Bisnaga 120ml','Higiene', 15, 5, 18.00, 39.90, TRUE),
    (8,'Toalha Esportiva','Microfibra','Vestuário', 12, 4, 22.00, 49.90, TRUE);
SELECT setval('produto_id_produto_seq', (SELECT MAX(id_produto) FROM produto));

-- Agendamentos (datas relativas para sempre haver dados atuais)
INSERT INTO agendamento (id_cliente, id_quadra, id_modalidade, id_usuario_criador, data_reserva, hora_inicio, hora_fim, tipo_reserva, status, preco) VALUES
    (6, 1, 1, 6, CURRENT_DATE,             '19:00','20:00','AVULSO','APROVADO', 90.00),
    (7, 2, 2, 7, CURRENT_DATE,             '20:00','21:00','AVULSO','APROVADO', 90.00),
    (8, 3, 3, 8, CURRENT_DATE + INTERVAL '1 day','18:00','19:00','AVULSO','APROVADO', 60.00),
    (9, 4, 2, 9, CURRENT_DATE + INTERVAL '2 day','21:00','22:00','AVULSO','SOLICITADO',90.00),
    (10,1, 1,10, CURRENT_DATE - INTERVAL '1 day','09:00','10:00','AVULSO','CONCLUIDO',60.00),
    (11,2, 3,11, CURRENT_DATE - INTERVAL '2 day','15:00','16:00','AVULSO','CANCELADO',60.00);

-- Fila de espera
INSERT INTO fila_espera (id_cliente, id_quadra, id_modalidade, data_reserva, hora_inicio, hora_fim, posicao, status) VALUES
    (11, 1, 1, CURRENT_DATE, '19:00','20:00', 1, 'AGUARDANDO'),
    ( 9, 2, 2, CURRENT_DATE, '20:00','21:00', 1, 'AGUARDANDO');

-- Vendas + itens
INSERT INTO venda (id_venda, id_usuario, id_cliente, valor_total, forma_pagamento) VALUES
    (1, 2, 6, 13.00, 'PIX'),
    (2, 3, 7, 39.90, 'CREDITO');
SELECT setval('venda_id_venda_seq', (SELECT MAX(id_venda) FROM venda));

INSERT INTO item_venda (id_venda, id_produto, quantidade, valor_unitario, subtotal) VALUES
    (1, 1, 2, 4.00, 8.00),
    (1, 4, 1, 3.50, 3.50),
    (1, 3, 1, 6.00, 6.00),
    (2, 7, 1, 39.90, 39.90);

-- Movimentações de estoque (entrada inicial + saídas das vendas)
INSERT INTO movimento_estoque (id_produto, id_usuario, tipo, quantidade, origem) VALUES
    (1, 1, 'ENTRADA', 80, 'ESTOQUE_INICIAL'),
    (2, 1, 'ENTRADA', 30, 'ESTOQUE_INICIAL'),
    (3, 1, 'ENTRADA', 60, 'ESTOQUE_INICIAL'),
    (1, 2, 'SAIDA',    2, 'VENDA'),
    (3, 2, 'SAIDA',    1, 'VENDA'),
    (4, 2, 'SAIDA',    1, 'VENDA'),
    (7, 3, 'SAIDA',    1, 'VENDA');

-- Pagamentos
INSERT INTO pagamento (id_agendamento, id_venda, id_cliente, valor, forma_pagamento, status, data_vencimento) VALUES
    (1,    NULL, 6, 90.00, 'PIX',     'PAGO',     CURRENT_DATE),
    (2,    NULL, 7, 90.00, 'CREDITO', 'PAGO',     CURRENT_DATE),
    (3,    NULL, 8, 60.00, 'PIX',     'PENDENTE', CURRENT_DATE + INTERVAL '1 day'),
    (NULL, 1,    6, 13.00, 'PIX',     'PAGO',     CURRENT_DATE),
    (NULL, 2,    7, 39.90, 'CREDITO', 'PAGO',     CURRENT_DATE);

-- Movimentos de caixa
INSERT INTO movimento_caixa (id_usuario, id_agendamento, id_venda, id_pagamento, tipo, categoria, valor, forma_pagamento) VALUES
    (2, 1,    NULL, 1, 'ENTRADA', 'AGENDAMENTO', 90.00, 'PIX'),
    (2, 2,    NULL, 2, 'ENTRADA', 'AGENDAMENTO', 90.00, 'CREDITO'),
    (2, NULL, 1,    4, 'ENTRADA', 'VENDA',       13.00, 'PIX'),
    (3, NULL, 2,    5, 'ENTRADA', 'VENDA',       39.90, 'CREDITO'),
    (1, NULL, NULL, NULL,'SAIDA', 'MANUTENCAO', 150.00, 'DINHEIRO'),
    (1, NULL, NULL, NULL,'SAIDA', 'FORNECEDOR', 320.00, 'PIX');

-- Notificações
INSERT INTO notificacao (id_usuario, tipo, mensagem, lida) VALUES
    (6,'AGENDAMENTO','Sua reserva para hoje às 19:00 foi confirmada.', FALSE),
    (7,'AGENDAMENTO','Sua reserva para hoje às 20:00 foi confirmada.', FALSE),
    (1,'ESTOQUE',    'Produto "Raquete Beach Tennis" próximo do estoque mínimo.', FALSE),
    (8,'TURMA',      'Você foi matriculado na turma Beach Tennis Iniciante.', TRUE);

-- Logs de ação
INSERT INTO log_acao (id_usuario, acao, entidade, entidade_id, detalhe) VALUES
    (1,'CREATE','usuario',   6, 'HTTP 201 - cadastro cliente'),
    (2,'CREATE','agendamento',1, 'HTTP 201 - reserva aprovada'),
    (1,'UPDATE','produto',   1, 'HTTP 200 - ajuste de preço'),
    (2,'LOGIN', 'auth',   NULL, 'HTTP 200 - login funcionário');

-- FIM
