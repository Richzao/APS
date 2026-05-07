---
tipo: trabalho
semestre: 2026-1
disciplina: APS
status: ativo
prazo: 2026-05-13
---

# Guia de Estilo - Design System

## Princípios

- Interface operacional, clara e rápida para uso repetido em clínica.
- Hierarquia visual baseada em status da fila, prioridade e ações imediatas.
- Layout responsivo para desktop da recepção e celular do paciente.
- Demonstração visual forte para banca, com login autônomo e mockup de smartphone para o paciente.

## Paleta

| Token | Uso |
| --- | --- |
| `--teal-900` | Navegação lateral e destaque institucional. |
| `--teal-700` | Botões primários e estados ativos. |
| `--teal-100` | Badges de chamada e elementos de apoio. |
| `--amber` | Prioridades legais e avisos operacionais. |
| `--red` | Urgência, ausência e erros. |
| `--blue` | Status aguardando e informação neutra. |

## Componentes

- Botão primário com ícone para comandos claros.
- Badges para prioridade e status.
- Cards de métrica para acompanhamento operacional.
- Tabela para leitura densa pela equipe interna.
- Lista de fila responsiva para pacientes e painéis públicos.
- Alternador de perfil e controles de regras por estado ativo/inativo.
- Mockup mobile com ticket, previsão, linha do tempo e notificações.

## Tipografia

A aplicação usa `system-ui`, com pesos fortes apenas em senhas, métricas e ações. O objetivo é manter legibilidade e evitar aparência promocional.

## Responsividade

Em telas menores, a navegação passa para o topo, cards são empilhados e os itens da fila quebram em múltiplas linhas sem sobreposição de texto.
