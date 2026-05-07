import {
  Activity,
  Bell,
  CalendarClock,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Eye,
  FileClock,
  LogIn,
  LogOut,
  MapPin,
  Play,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Stethoscope,
  Timer,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PerfilUsuario = "paciente" | "atendente" | "medico" | "administrador";
type StatusFila = "aguardando" | "chamado" | "em_atendimento" | "finalizado" | "ausente";
type Rota = "login" | "paciente" | "check-in" | "fila" | "operacao" | "regras" | "auditoria";

type PacienteFila = {
  id: string;
  senha: string;
  nome: string;
  exame: string;
  prioridade: "normal" | "idoso" | "gestante" | "pcd" | "urgente";
  status: StatusFila;
  chegada: string;
  esperaMin: number;
  duracaoEstimadaMin: number;
  guichePreferencial: string;
  notificacoes: string[];
  sala?: string;
};

type RegraPrioridade = {
  id: string;
  criterio: string;
  peso: number;
  ativo: boolean;
  descricao: string;
};

type EventoAuditoria = {
  id: string;
  dataHora: string;
  usuario: string;
  perfil: PerfilUsuario;
  acao: string;
  requisito: string;
  justificativa: string;
};

type MetricaOperacional = {
  rotulo: string;
  valor: string;
  apoio: string;
};

type PrevisaoAtendimento = {
  posicao: number;
  minutosRestantes: number;
  horarioPrevisto: string;
  pacientesAntes: number;
};

const pacienteDemoId = "4";
const margemOperacionalMin = 2;

const rotas: Array<{ id: Rota; label: string; icon: typeof Eye; perfis: PerfilUsuario[] }> = [
  { id: "paciente", label: "Paciente", icon: Smartphone, perfis: ["paciente"] },
  { id: "check-in", label: "Check-in", icon: ClipboardCheck, perfis: ["paciente", "atendente"] },
  { id: "fila", label: "Fila", icon: Users, perfis: ["atendente", "medico", "administrador"] },
  { id: "operacao", label: "Operação", icon: Stethoscope, perfis: ["atendente", "medico", "administrador"] },
  { id: "regras", label: "Regras", icon: SlidersHorizontal, perfis: ["administrador"] },
  { id: "auditoria", label: "Auditoria", icon: FileClock, perfis: ["administrador"] },
];

const filaInicial: PacienteFila[] = [
  {
    id: "1",
    senha: "A021",
    nome: "Marina Alves",
    exame: "Hemograma completo",
    prioridade: "gestante",
    status: "chamado",
    chegada: "08:05",
    esperaMin: 9,
    duracaoEstimadaMin: 7,
    guichePreferencial: "Sala 02",
    sala: "Sala 02",
    notificacoes: ["Sua senha foi chamada para a Sala 02."],
  },
  {
    id: "2",
    senha: "A022",
    nome: "João Batista",
    exame: "Glicemia em jejum",
    prioridade: "idoso",
    status: "aguardando",
    chegada: "08:08",
    esperaMin: 14,
    duracaoEstimadaMin: 8,
    guichePreferencial: "Sala 01",
    notificacoes: ["Prioridade legal confirmada no check-in."],
  },
  {
    id: "3",
    senha: "A023",
    nome: "Clara Mendes",
    exame: "Coleta infantil",
    prioridade: "urgente",
    status: "aguardando",
    chegada: "08:12",
    esperaMin: 6,
    duracaoEstimadaMin: 10,
    guichePreferencial: "Sala 03",
    notificacoes: ["Caso urgente validado pela recepção."],
  },
  {
    id: pacienteDemoId,
    senha: "A024",
    nome: "Rafael Costa",
    exame: "Perfil lipídico",
    prioridade: "normal",
    status: "aguardando",
    chegada: "08:17",
    esperaMin: 4,
    duracaoEstimadaMin: 9,
    guichePreferencial: "Sala 04",
    notificacoes: ["Check-in confirmado.", "Acompanhe sua posição sem permanecer na recepção."],
  },
  {
    id: "5",
    senha: "A025",
    nome: "Ana Lúcia",
    exame: "TSH e T4 livre",
    prioridade: "pcd",
    status: "aguardando",
    chegada: "08:19",
    esperaMin: 2,
    duracaoEstimadaMin: 6,
    guichePreferencial: "Sala 01",
    notificacoes: ["Prioridade PCD validada no check-in."],
  },
];

const regrasIniciais: RegraPrioridade[] = [
  { id: "r1", criterio: "Urgência registrada", peso: 100, ativo: true, descricao: "Casos urgentes sobem para o topo após validação da equipe." },
  { id: "r2", criterio: "Prioridade legal", peso: 70, ativo: true, descricao: "Idosos, gestantes e PCD recebem prioridade conforme conferência no check-in." },
  { id: "r3", criterio: "Tempo de espera", peso: 15, ativo: true, descricao: "A cada 10 minutos, a pontuação operacional aumenta para reduzir espera prolongada." },
  { id: "r4", criterio: "Ausência na chamada", peso: -50, ativo: true, descricao: "Paciente ausente retorna para reavaliação sem bloquear a fila." },
];

const auditoriaInicial: EventoAuditoria[] = [
  { id: "e1", dataHora: "13/05/2026 08:03", usuario: "paula.recepcao", perfil: "atendente", acao: "Check-in registrado para A021", requisito: "RF0003", justificativa: "Paciente presente na recepção" },
  { id: "e2", dataHora: "13/05/2026 08:05", usuario: "motor-fila", perfil: "administrador", acao: "Fila reorganizada por prioridade legal", requisito: "RF0006", justificativa: "Gestante validada no atendimento" },
  { id: "e3", dataHora: "13/05/2026 08:07", usuario: "dr.renato", perfil: "medico", acao: "Próximo paciente chamado para Sala 02", requisito: "RF0005", justificativa: "Guichê disponível" },
  { id: "e4", dataHora: "13/05/2026 08:11", usuario: "admin.clinica", perfil: "administrador", acao: "Peso de urgência revisado", requisito: "RF0010", justificativa: "Homologação operacional da manhã" },
];

const prioridadePeso: Record<PacienteFila["prioridade"], number> = {
  urgente: 4,
  gestante: 3,
  idoso: 3,
  pcd: 3,
  normal: 1,
};

function rotaAtual(): Rota {
  const hash = window.location.hash.replace("#/", "") as Rota;
  const rotasValidas: Rota[] = ["login", ...rotas.map((rota) => rota.id)];
  return rotasValidas.includes(hash) ? hash : "login";
}

function statusTexto(status: StatusFila) {
  return {
    aguardando: "Aguardando",
    chamado: "Chamado",
    em_atendimento: "Em atendimento",
    finalizado: "Finalizado",
    ausente: "Ausente",
  }[status];
}

function prioridadeTexto(prioridade: PacienteFila["prioridade"]) {
  return {
    normal: "Normal",
    idoso: "Idoso",
    gestante: "Gestante",
    pcd: "PCD",
    urgente: "Urgente",
  }[prioridade];
}

function somarMinutos(horario: string, minutos: number) {
  const [hora, minuto] = horario.split(":").map(Number);
  const data = new Date(2026, 4, 13, hora, minuto + minutos);
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function calcularPrevisao(filaOrdenada: PacienteFila[], pacienteId: string): PrevisaoAtendimento {
  const posicao = Math.max(1, filaOrdenada.findIndex((paciente) => paciente.id === pacienteId) + 1);
  const pacientesAntes = Math.max(0, posicao - 1);
  const minutosRestantes = filaOrdenada
    .slice(0, pacientesAntes)
    .filter((paciente) => paciente.status !== "finalizado" && paciente.status !== "ausente")
    .reduce((total, paciente) => total + paciente.duracaoEstimadaMin, margemOperacionalMin);

  return {
    posicao,
    pacientesAntes,
    minutosRestantes,
    horarioPrevisto: somarMinutos("08:24", minutosRestantes),
  };
}

function App() {
  const [rota, setRota] = useState<Rota>(rotaAtual);
  const [perfil, setPerfil] = useState<PerfilUsuario>("atendente");
  const [fila, setFila] = useState<PacienteFila[]>(filaInicial);
  const [regras, setRegras] = useState<RegraPrioridade[]>(regrasIniciais);
  const [auditoria, setAuditoria] = useState<EventoAuditoria[]>(auditoriaInicial);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState("08:24:10");

  useEffect(() => {
    const onHash = () => setRota(rotaAtual());
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = "/login";
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFila((atual) => atual.map((paciente) => (paciente.status === "aguardando" ? { ...paciente, esperaMin: paciente.esperaMin + 1 } : paciente)));
      setUltimaAtualizacao(new Date().toLocaleTimeString("pt-BR"));
    }, 9000);
    return () => window.clearInterval(timer);
  }, []);

  const filaOrdenada = useMemo(
    () =>
      [...fila].sort((a, b) => {
        const statusA = a.status === "chamado" ? 20 : 0;
        const statusB = b.status === "chamado" ? 20 : 0;
        return statusB + prioridadePeso[b.prioridade] * 10 + b.esperaMin - (statusA + prioridadePeso[a.prioridade] * 10 + a.esperaMin);
      }),
    [fila],
  );

  const pacienteDemo = fila.find((paciente) => paciente.id === pacienteDemoId) ?? filaInicial[3];
  const previsaoPaciente = calcularPrevisao(filaOrdenada, pacienteDemoId);

  const metricas: MetricaOperacional[] = [
    { rotulo: "Pacientes na fila", valor: String(fila.filter((p) => p.status !== "finalizado").length), apoio: "RF0004 / RF0009" },
    { rotulo: "Espera média", valor: `${Math.round(fila.reduce((acc, p) => acc + p.esperaMin, 0) / fila.length)} min`, apoio: "RNF0001" },
    { rotulo: "Previsão A024", valor: previsaoPaciente.horarioPrevisto, apoio: `${previsaoPaciente.minutosRestantes} min estimados` },
    { rotulo: "Última atualização", valor: ultimaAtualizacao, apoio: "tempo real simulado" },
  ];

  function navegar(destino: Rota) {
    window.location.hash = `/${destino}`;
  }

  function registrarAuditoria(acao: string, perfilEvento: PerfilUsuario, requisito: string, justificativa: string) {
    const evento: EventoAuditoria = {
      id: crypto.randomUUID(),
      dataHora: new Date().toLocaleString("pt-BR"),
      usuario: perfilEvento === "administrador" ? "admin.clinica" : perfilEvento === "medico" ? "dr.renato" : "paula.recepcao",
      perfil: perfilEvento,
      acao,
      requisito,
      justificativa,
    };
    setAuditoria((atual) => [evento, ...atual]);
  }

  function entrar(perfilSelecionado: PerfilUsuario) {
    setPerfil(perfilSelecionado);
    if (perfilSelecionado === "paciente") navegar("paciente");
    if (perfilSelecionado === "atendente") navegar("check-in");
    if (perfilSelecionado === "medico") navegar("operacao");
    if (perfilSelecionado === "administrador") navegar("regras");
    registrarAuditoria(`Login efetuado como ${perfilSelecionado}`, perfilSelecionado, "RF0001", "Acesso demonstrativo ao protótipo");
  }

  function sair() {
    setPerfil("atendente");
    navegar("login");
  }

  function chamarProximo() {
    const proximo = filaOrdenada.find((p) => p.status === "aguardando");
    if (!proximo) return;
    setFila((atual) =>
      atual.map((paciente) =>
        paciente.id === proximo.id
          ? { ...paciente, status: "chamado", sala: paciente.guichePreferencial }
          : paciente.status === "chamado"
            ? { ...paciente, status: "em_atendimento" }
            : paciente,
      ),
    );
    registrarAuditoria(`Próximo paciente chamado: ${proximo.senha}`, "medico", "RF0005", "Chamada operacional a partir da fila priorizada");
  }

  function simularCheckIn() {
    const novo: PacienteFila = {
      id: crypto.randomUUID(),
      senha: `A0${fila.length + 21}`,
      nome: "Paciente demonstração",
      exame: "Coleta de sangue",
      prioridade: "normal",
      status: "aguardando",
      chegada: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      esperaMin: 0,
      duracaoEstimadaMin: 8,
      guichePreferencial: "Sala 04",
      notificacoes: ["Check-in registrado pela recepção."],
    };
    setFila((atual) => [...atual, novo]);
    registrarAuditoria(`Check-in registrado para ${novo.senha}`, "atendente", "RF0003", "Entrada simulada pelo protótipo");
    navegar("fila");
  }

  function alternarRegra(id: string) {
    setRegras((atual) => atual.map((regra) => (regra.id === id ? { ...regra, ativo: !regra.ativo } : regra)));
    registrarAuditoria("Regra de prioridade alterada", "administrador", "RF0010", "Ajuste visual no protótipo");
  }

  if (rota === "login") {
    return <Login perfil={perfil} setPerfil={setPerfil} entrar={entrar} previsao={previsaoPaciente} />;
  }

  const rotasVisiveis = rotas.filter((item) => item.perfis.includes(perfil));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navegar(perfil === "paciente" ? "paciente" : "operacao")} aria-label="Ir para página inicial">
          <span className="brand-mark">SG</span>
          <span>
            <strong>SGFV</strong>
            <small>Fila clínica em tempo real</small>
          </span>
        </button>
        <nav aria-label="Navegação principal">
          {rotasVisiveis.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={rota === item.id ? "nav-item active" : "nav-item"} onClick={() => navegar(item.id)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button className="ghost logout" onClick={sair}>
          <LogOut size={17} />
          Sair
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Protótipo de alta fidelidade</p>
            <h1>{tituloRota(rota)}</h1>
          </div>
          <div className="session-card">
            <span className="sync-dot" />
            <div>
              <strong>{perfil}</strong>
              <small>Sincronizado às {ultimaAtualizacao}</small>
            </div>
          </div>
        </header>

        {rota === "paciente" && <PacienteMobile paciente={pacienteDemo} previsao={previsaoPaciente} ultimaAtualizacao={ultimaAtualizacao} />}
        {rota === "check-in" && <CheckIn simularCheckIn={simularCheckIn} perfil={perfil} />}
        {rota === "fila" && <Fila fila={filaOrdenada} ultimaAtualizacao={ultimaAtualizacao} pacienteDemoId={pacienteDemoId} previsao={previsaoPaciente} />}
        {rota === "operacao" && <Operacao metricas={metricas} fila={filaOrdenada} chamarProximo={chamarProximo} pacienteDemoId={pacienteDemoId} />}
        {rota === "regras" && <Regras regras={regras} alternarRegra={alternarRegra} />}
        {rota === "auditoria" && <Auditoria eventos={auditoria} />}
      </main>
    </div>
  );
}

function tituloRota(rota: Rota) {
  return {
    login: "Acesso ao SGFV",
    paciente: "Visão mobile do paciente",
    "check-in": "Registro de check-in",
    fila: "Fila em tempo real",
    operacao: "Painel operacional",
    regras: "Configuração de regras",
    auditoria: "Histórico e auditoria",
  }[rota];
}

function Login({
  perfil,
  setPerfil,
  entrar,
  previsao,
}: {
  perfil: PerfilUsuario;
  setPerfil: (perfil: PerfilUsuario) => void;
  entrar: (perfil: PerfilUsuario) => void;
  previsao: PrevisaoAtendimento;
}) {
  const perfis: Array<{ id: PerfilUsuario; titulo: string; descricao: string }> = [
    { id: "paciente", titulo: "Paciente", descricao: "Acompanhar senha A024 no celular" },
    { id: "atendente", titulo: "Atendente", descricao: "Registrar check-in e organizar fila" },
    { id: "medico", titulo: "Médico", descricao: "Chamar próximo paciente" },
    { id: "administrador", titulo: "Administrador", descricao: "Regras e auditoria" },
  ];

  return (
    <main className="login-screen">
      <section className="login-story">
        <span className="brand-mark large">SG</span>
        <p className="eyebrow">Sistema de Gerenciamento de Filas Virtuais</p>
        <h1>Atendimento laboratorial com previsibilidade e controle em tempo real.</h1>
        <p>
          Demonstração acadêmica do SGFV com autenticação por perfil, fila priorizada, painel operacional e experiência mobile do paciente.
        </p>
        <div className="login-proof">
          <article>
            <strong>{previsao.horarioPrevisto}</strong>
            <span>previsão de atendimento A024</span>
          </article>
          <article>
            <strong>{previsao.posicao}ª</strong>
            <span>posição atual na fila</span>
          </article>
          <article>
            <strong>RF0001</strong>
            <span>acesso segregado por perfil</span>
          </article>
        </div>
      </section>

      <section className="login-card" aria-label="Entrar no sistema">
        <ShieldCheck size={34} />
        <h2>Entrar no SGFV</h2>
        <p>Escolha um perfil de demonstração para acessar o sistema com permissões coerentes.</p>

        <div className="profile-cards">
          {perfis.map((item) => (
            <button key={item.id} className={perfil === item.id ? "profile-card selected" : "profile-card"} onClick={() => setPerfil(item.id)}>
              <strong>{item.titulo}</strong>
              <span>{item.descricao}</span>
            </button>
          ))}
        </div>

        <label>
          Identificador
          <input value={perfil === "paciente" ? "rafael.costa" : perfil === "medico" ? "dr.renato" : perfil === "administrador" ? "admin.clinica" : "paula.recepcao"} readOnly />
        </label>
        <label>
          Senha
          <input type="password" value="123456" readOnly />
        </label>
        <button className="primary wide" onClick={() => entrar(perfil)}>
          <LogIn size={18} />
          Acessar demonstração
        </button>
      </section>
    </main>
  );
}

function PacienteMobile({ paciente, previsao, ultimaAtualizacao }: { paciente: PacienteFila; previsao: PrevisaoAtendimento; ultimaAtualizacao: string }) {
  const timeline = [
    { label: "Check-in", detail: `Confirmado às ${paciente.chegada}`, done: true },
    { label: "Na fila", detail: `${previsao.pacientesAntes} pacientes antes de você`, done: true },
    { label: "Próximo atendimento", detail: `Previsão ${previsao.horarioPrevisto}`, done: false },
    { label: "Chamada", detail: paciente.sala ?? paciente.guichePreferencial, done: paciente.status === "chamado" },
  ];

  return (
    <section className="patient-stage">
      <div className="phone-frame" aria-label="Simulação mobile do paciente">
        <div className="phone-speaker" />
        <div className="phone-screen">
          <header className="patient-appbar">
            <div>
              <span>SGFV Paciente</span>
              <strong>{paciente.nome}</strong>
            </div>
            <Bell size={20} />
          </header>

          <section className="patient-ticket">
            <span className="badge status-aguardando">{statusTexto(paciente.status)}</span>
            <p>Sua senha</p>
            <h2>{paciente.senha}</h2>
            <small>{paciente.exame}</small>
          </section>

          <section className="patient-estimate">
            <div>
              <Timer size={24} />
              <span>Atendimento previsto</span>
            </div>
            <strong>{previsao.horarioPrevisto}</strong>
            <p>aprox. {previsao.minutosRestantes} min</p>
          </section>

          <div className="patient-stats">
            <article>
              <strong>{previsao.posicao}ª</strong>
              <span>posição</span>
            </article>
            <article>
              <strong>{previsao.pacientesAntes}</strong>
              <span>antes</span>
            </article>
            <article>
              <strong>{paciente.guichePreferencial}</strong>
              <span>provável</span>
            </article>
          </div>

          <section className="timeline">
            {timeline.map((item) => (
              <article key={item.label} className={item.done ? "done" : ""}>
                <span />
                <div>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </div>
              </article>
            ))}
          </section>

          <section className="mobile-alert">
            <MapPin size={18} />
            <p>Permaneça próximo à recepção. Atualizado às {ultimaAtualizacao}.</p>
          </section>
        </div>
      </div>

      <aside className="patient-explain panel">
        <p className="eyebrow">Paciente X da apresentação</p>
        <h2>Rafael Costa - senha A024</h2>
        <p>
          A previsão soma a duração estimada dos pacientes antes dele na fila priorizada e adiciona {margemOperacionalMin} minutos de margem operacional.
        </p>
        <div className="formula-card">
          <CalendarClock size={22} />
          <strong>{previsao.pacientesAntes} pacientes antes + margem = {previsao.minutosRestantes} min</strong>
        </div>
      </aside>
    </section>
  );
}

function CheckIn({ simularCheckIn, perfil }: { simularCheckIn: () => void; perfil: PerfilUsuario }) {
  return (
    <section className="screen two-col">
      <div className="panel">
        <h2>Dados de chegada</h2>
        <div className="form-grid">
          <label>CPF<input placeholder="000.000.000-00" /></label>
          <label>Nome<input placeholder="Nome do paciente" /></label>
          <label>Tipo de exame<input placeholder="Exame agendado" /></label>
          <label>Canal de contato<input placeholder="Telefone ou WhatsApp" /></label>
          <label>Prioridade<select><option>Sem prioridade</option><option>Idoso</option><option>Gestante</option><option>PCD</option><option>Urgente</option></select></label>
          <label>Confirmação<select><option>Paciente presente</option><option>Dados pendentes</option></select></label>
        </div>
        <button className="primary" onClick={simularCheckIn} disabled={!["paciente", "atendente"].includes(perfil)}>
          <Check size={18} />
          Registrar check-in
        </button>
      </div>
      <div className="panel notification-card">
        <Bell size={28} />
        <h2>Notificação prevista</h2>
        <p>Ao entrar na fila, o paciente recebe posição estimada, status atual e alerta de chamada, cobrindo RF0011 no fluxo essencial.</p>
      </div>
    </section>
  );
}

function Fila({ fila, ultimaAtualizacao, pacienteDemoId, previsao }: { fila: PacienteFila[]; ultimaAtualizacao: string; pacienteDemoId: string; previsao: PrevisaoAtendimento }) {
  return (
    <section className="screen">
      <div className="queue-hero">
        <div>
          <p className="eyebrow">Atualização simulada: {ultimaAtualizacao}</p>
          <h2>{fila[0]?.senha} em destaque</h2>
          <p>{fila[0]?.sala ?? fila[0]?.guichePreferencial} - {fila[0]?.exame}</p>
        </div>
        <div className="hero-estimate">
          <Timer size={24} />
          <strong>A024 às {previsao.horarioPrevisto}</strong>
          <span>{previsao.minutosRestantes} min previstos</span>
        </div>
      </div>
      <div className="queue-list">
        {fila.map((paciente, index) => (
          <article key={paciente.id} className={paciente.id === pacienteDemoId ? "queue-item target" : "queue-item"}>
            <strong>{index + 1}</strong>
            <div>
              <h3>{paciente.senha} - {paciente.nome}</h3>
              <p>{paciente.exame} - chegada {paciente.chegada}</p>
            </div>
            <span className={`badge prioridade-${paciente.prioridade}`}>{prioridadeTexto(paciente.prioridade)}</span>
            <span className={`badge status-${paciente.status}`}>{statusTexto(paciente.status)}</span>
            <span className="wait"><Clock3 size={16} /> {paciente.esperaMin} min</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function Operacao({ metricas, fila, chamarProximo, pacienteDemoId }: { metricas: MetricaOperacional[]; fila: PacienteFila[]; chamarProximo: () => void; pacienteDemoId: string }) {
  return (
    <section className="screen">
      <div className="metrics-grid">
        {metricas.map((metrica) => (
          <article className="metric" key={metrica.rotulo}>
            <span>{metrica.rotulo}</span>
            <strong>{metrica.valor}</strong>
            <small>{metrica.apoio}</small>
          </article>
        ))}
      </div>
      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Atendimento em andamento</h2>
            <p>Fila priorizada com destaque para o paciente X da demonstração.</p>
          </div>
          <button className="primary" onClick={chamarProximo}><Play size={18} /> Chamar próximo</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Senha</th><th>Paciente</th><th>Prioridade</th><th>Status</th><th>Previsão</th><th>Espera</th></tr></thead>
            <tbody>
              {fila.map((paciente) => (
                <tr key={paciente.id} className={paciente.id === pacienteDemoId ? "target-row" : ""}>
                  <td>{paciente.senha}</td>
                  <td>{paciente.nome}</td>
                  <td>{prioridadeTexto(paciente.prioridade)}</td>
                  <td>{statusTexto(paciente.status)}</td>
                  <td>{paciente.duracaoEstimadaMin} min</td>
                  <td>{paciente.esperaMin} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Regras({ regras, alternarRegra }: { regras: RegraPrioridade[]; alternarRegra: (id: string) => void }) {
  return (
    <section className="screen rules-grid">
      {regras.map((regra) => (
        <article className="panel rule-card" key={regra.id}>
          <div>
            <h2>{regra.criterio}</h2>
            <p>{regra.descricao}</p>
          </div>
          <strong>Peso {regra.peso}</strong>
          <label className="toggle">
            <input type="checkbox" checked={regra.ativo} onChange={() => alternarRegra(regra.id)} />
            <span>{regra.ativo ? "Ativa" : "Inativa"}</span>
          </label>
        </article>
      ))}
    </section>
  );
}

function Auditoria({ eventos }: { eventos: EventoAuditoria[] }) {
  return (
    <section className="screen panel">
      <div className="panel-heading">
        <h2>Eventos sensíveis</h2>
        <span className="badge status-chamado">RF0012</span>
      </div>
      <div className="audit-list">
        {eventos.map((evento) => (
          <article key={evento.id} className="audit-item">
            <span>{evento.dataHora}</span>
            <strong>{evento.acao}</strong>
            <p>{evento.usuario} - {evento.perfil} - {evento.justificativa}</p>
            <small>{evento.requisito}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

export default App;
