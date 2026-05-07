# APS - SGFV

Este repositório concentra os documentos entregáveis da disciplina de APS (Análise e Projeto de Software) e o protótipo React do SGFV, Sistema de Gerenciamento de Filas Virtuais para clínicas de exames laboratoriais.

O material reunido aqui registra os artefatos produzidos ao longo da disciplina, facilitando a organização, o versionamento, a consulta dos documentos do projeto e a execução da versão demonstrável da interface.

## Documentos disponíveis

- `Documentos/DocVisao.pdf`: documento de visão do projeto.
- `Documentos/APS - Documento de Requisitos - SGFV - v1.1.docx`: documento de requisitos.
- `Documentos/Documento de Arquitetura de Software.docx`: documento de arquitetura de software.

## Protótipo React

O protótipo implementa uma aplicação React com Vite, TypeScript, dados mockados e navegação por hash para facilitar publicação estática, inclusive em GitHub Pages.

### Como executar

```bash
npm install
npm run dev
```

Para gerar a versão de entrega:

```bash
npm run build
```

### Rotas

- `#/login`: tela inicial de autenticação e seleção visual de perfil.
- `#/paciente`: simulação mobile do paciente Rafael Costa, senha A024.
- `#/check-in`: registro de chegada e entrada na fila.
- `#/fila`: acompanhamento da fila em tempo real simulado.
- `#/operacao`: painel para atendente e médico com chamada do próximo paciente.
- `#/regras`: configuração de regras de prioridade.
- `#/auditoria`: histórico de eventos sensíveis.

### Perfis

- Paciente: visão mobile com posição, status, sala provável e tempo previsto.
- Atendente: check-in, fila e operação.
- Médico: fila e chamada do próximo paciente.
- Administrador: operação, regras e auditoria.

### Roteiro de apresentação

1. Abrir `#/login` e mostrar que o sistema começa em uma tela de acesso clara.
2. Entrar como Paciente para exibir a experiência mobile de Rafael Costa, senha A024.
3. Destacar a previsão de atendimento calculada pela fila priorizada.
4. Voltar ao login e entrar como Médico para chamar o próximo paciente no painel operacional.
5. Entrar como Administrador para mostrar regras e auditoria dos eventos sensíveis.

### Relação com requisitos

| Requisito | Cobertura no protótipo |
| --- | --- |
| RF0001 | Tela de login e troca de perfil com permissões visuais. |
| RF0003 | Registro de check-in com inserção mockada na fila. |
| RF0004 | Tela de fila e visão mobile com status, posição e tempo de espera. |
| RF0005 | Ação de chamar próximo paciente no painel operacional. |
| RF0006 | Ordenação por prioridade, tempo de espera e cálculo de previsão. |
| RF0009 | Métricas operacionais e atualização periódica simulada. |
| RF0010 | Tela de regras com ativação visual de critérios. |
| RF0011 | Notificações simuladas na visão mobile e no check-in. |
| RF0012 | Tela de auditoria com eventos de acesso, check-in, chamada e regras. |

### Tempo previsto do paciente X

O paciente fixo da demonstração é Rafael Costa, senha A024. A previsão soma a duração estimada dos pacientes antes dele na fila priorizada e adiciona uma margem operacional de 2 minutos. O valor é recalculado quando a fila muda, por exemplo ao chamar o próximo paciente.

## Estrutura do repositório

```text
APS/
├── Documentos/
├── documentacao/
├── src/
├── index.html
├── package.json
├── README.md
└── vite.config.ts
```

## Observações

- O protótipo não possui back-end real nesta etapa.
- A atualização em tempo real é simulada por estado local.
- Novos documentos formais devem ser adicionados preferencialmente na pasta `Documentos/`.
