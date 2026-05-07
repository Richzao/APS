---
tipo: trabalho
semestre: 2026-1
disciplina: APS
status: ativo
prazo: 2026-05-13
---

# Documentação de Interface - SGFV

## Login

Representa RF0001. É a primeira tela do protótipo e não exibe a navegação interna antes da entrada no sistema. Permite alternar entre Paciente, Atendente, Médico e Administrador, carregando permissões visuais coerentes com cada perfil.

## Visão mobile do paciente

Representa RF0004, RF0006, RF0009 e RF0011. Simula a interface mobile do paciente Rafael Costa, senha A024, dentro de um mockup de smartphone. Exibe status, posição, pacientes à frente, sala provável, notificações e tempo previsto de atendimento.

O cálculo demonstrativo do tempo previsto soma a duração estimada dos pacientes antes do A024 na fila priorizada e adiciona 2 minutos de margem operacional.

## Check-in

Representa RF0003 e RF0011. Coleta CPF, nome, exame, contato, prioridade e confirmação de presença. A ação principal insere um paciente demonstrativo na fila e registra evento de auditoria.

## Fila em tempo real

Representa RF0004, RF0006 e RF0009. Exibe senha em destaque, posição, prioridade, status, sala e tempo de espera. Também destaca a previsão do paciente A024 para reforçar a demonstração do paciente X.

## Painel operacional

Representa RF0005 e RF0009. Exibe métricas de operação, tabela de pacientes, duração estimada de atendimento e comando para chamar o próximo paciente com base na fila priorizada.

## Configuração de regras

Representa RF0010. Exibe critérios de prioridade, pesos e estado ativo/inativo. Cada alteração gera evento de auditoria.

## Auditoria

Representa RF0012. Lista eventos sensíveis com data, usuário, perfil, ação, requisito relacionado e justificativa.

> [!info]
> As telas priorizam o fluxo essencial previsto para a entrega de 13/05/2026, sem criar módulos completos de cadastro, faturamento ou prontuário.
