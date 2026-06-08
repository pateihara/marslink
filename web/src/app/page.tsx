//web/src/app/page.tsx
"use client";

import { useCallback, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

type UserRole = "CREW" | "CONTROL";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
};

type Mission = {
  id: string;
  name: string;
  code: string;
  currentDay: number;
  phase: string;
  status: string;
  distanceKm: number;
  delayMinutes: number;
  signalQuality: number;
};

type Message = {
  id: string;
  content: string;
  priority: string;
  status: string;
  delayMinutes: number;
  createdAt: string;
  sender: User;
  receiver?: User | null;
  statusHistory: {
    id: string;
    status: string;
    note?: string;
    createdAt: string;
  }[];
};

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDay?: number | null;
  imageUrl?: string | null;
  assignee?: User | null;
  createdBy: User;
};

type CrewMember = User & {
  vitals: {
    id: string;
    heartRate: number;
    oxygen: number;
    temperature: number;
    stressLevel: number;
    createdAt: string;
  }[];
  assignedTasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
  }[];
};

type CommunicationWindow = {
  id: string;
  isOpen: boolean;
  signalQuality: number;
  delayMinutes: number;
  opensAt: string;
  closesAt: string;
  mission: Mission;
};

type MissionLog = {
  id: string;
  missionId: string;
  authorId: string;
  title: string;
  content: string;
  mood: "CALM" | "FOCUSED" | "TIRED" | "STRESSED" | "ALERT";
  imageUrl?: string | null;
  createdAt: string;
  author: User;
};

type LoginResponse = {
  token: string;
  user: User;
  mission: Mission;
};

type Tab = "overview" | "messages" | "crew" | "tasks" | "logs";

export default function Home() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [windowData, setWindowData] = useState<CommunicationWindow | null>(null);

  const [loginEmail, setLoginEmail] = useState("controle@marslink.com");
  const [loginPassword, setLoginPassword] = useState("123456");
  const [missionCode, setMissionCode] = useState("ARES2026");

  const [newMessage, setNewMessage] = useState("");
  const [newMessagePriority, setNewMessagePriority] = useState("NORMAL");

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("NORMAL");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");

  const [newLogTitle, setNewLogTitle] = useState("");
  const [newLogContent, setNewLogContent] = useState("");
  const [newLogMood, setNewLogMood] = useState("FOCUSED");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const queuedMessages = useMemo(() => {
    return messages.filter((message) => message.status === "QUEUED").length;
  }, [messages]);

  const pendingTasks = useMemo(() => {
    return tasks.filter((task) => task.status !== "DONE").length;
  }, [tasks]);

  const visualLogsCount = useMemo(() => {
    return logs.filter((log) => Boolean(log.imageUrl)).length;
  }, [logs]);

  const loadDashboardData = useCallback(async (currentToken: string) => {
    if (!currentToken) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const authHeaders = {
        Authorization: `Bearer ${currentToken}`,
      };

      const [
        messagesResponse,
        tasksResponse,
        crewResponse,
        logsResponse,
        windowResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/messages`, { headers: authHeaders }),
        fetch(`${API_URL}/api/tasks`, { headers: authHeaders }),
        fetch(`${API_URL}/api/crew`, { headers: authHeaders }),
        fetch(`${API_URL}/api/logs`, { headers: authHeaders }),
        fetch(`${API_URL}/api/windows/current`, { headers: authHeaders }),
      ]);

      if (!messagesResponse.ok) {
        throw new Error("Erro ao carregar mensagens.");
      }

      if (!tasksResponse.ok) {
        throw new Error("Erro ao carregar tarefas.");
      }

      if (!crewResponse.ok) {
        throw new Error("Erro ao carregar tripulação.");
      }

      if (!logsResponse.ok) {
        throw new Error("Erro ao carregar logs da missão.");
      }

      if (!windowResponse.ok) {
        throw new Error("Erro ao carregar janela de comunicação.");
      }

      const messagesData = (await messagesResponse.json()) as Message[];
      const tasksData = (await tasksResponse.json()) as Task[];
      const crewData = (await crewResponse.json()) as CrewMember[];
      const logsData = (await logsResponse.json()) as MissionLog[];
      const windowDataResponse =
        (await windowResponse.json()) as CommunicationWindow;

      setMessages(messagesData);
      setTasks(tasksData);
      setCrew(crewData);
      setLogs(logsData);
      setWindowData(windowDataResponse);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados do dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  async function apiFetch<T>(
    path: string,
    currentToken: string,
    options?: RequestInit,
  ): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
        ...(options?.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro na requisição.");
    }

    return data as T;
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          missionCode,
        }),
      });

      const data = (await response.json()) as LoginResponse | { message: string };

      if (!response.ok) {
        throw new Error("message" in data ? data.message : "Erro no login.");
      }

      const loginData = data as LoginResponse;

      if (loginData.user.role !== "CONTROL") {
        throw new Error(
          "Use uma conta do Controle Terra para acessar o dashboard web.",
        );
      }

      localStorage.setItem("marslink.token", loginData.token);
      localStorage.setItem("marslink.user", JSON.stringify(loginData.user));
      localStorage.setItem(
        "marslink.mission",
        JSON.stringify(loginData.mission),
      );

      setToken(loginData.token);
      setUser(loginData.user);
      setMission(loginData.mission);

      await loadDashboardData(loginData.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao realizar login.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newMessage.trim() || !token) {
      return;
    }

    try {
      setError("");

      await apiFetch<Message>("/api/messages", token, {
        method: "POST",
        body: JSON.stringify({
          content: newMessage,
          priority: newMessagePriority,
        }),
      });

      setNewMessage("");
      setNewMessagePriority("NORMAL");

      await loadDashboardData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar mensagem.");
    }
  }

  async function handleUpdateMessageStatus(messageId: string, status: string) {
    if (!token) {
      return;
    }

    try {
      setError("");

      await apiFetch<Message>(`/api/messages/${messageId}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          note: `Status alterado pelo Controle Terra para ${translateStatus(status)}.`,
        }),
      });

      await loadDashboardData(token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar mensagem.",
      );
    }
  }

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newTaskTitle.trim() || !token) {
      return;
    }

    try {
      setError("");

      await apiFetch<Task>("/api/tasks", token, {
        method: "POST",
        body: JSON.stringify({
          title: newTaskTitle,
          priority: newTaskPriority,
          assigneeId: newTaskAssignee || null,
          dueDay: mission?.currentDay || 47,
        }),
      });

      setNewTaskTitle("");
      setNewTaskPriority("NORMAL");
      setNewTaskAssignee("");

      await loadDashboardData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar tarefa.");
    }
  }


  async function handleCreateLog(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newLogTitle.trim() || !newLogContent.trim() || !token) {
      return;
    }

    try {
      setError("");

      await apiFetch<MissionLog>("/api/logs", token, {
        method: "POST",
        body: JSON.stringify({
          title: newLogTitle,
          content: newLogContent,
          mood: newLogMood,
        }),
      });

      setNewLogTitle("");
      setNewLogContent("");
      setNewLogMood("FOCUSED");

      await loadDashboardData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar log.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("marslink.token");
    localStorage.removeItem("marslink.user");
    localStorage.removeItem("marslink.mission");

    setToken("");
    setUser(null);
    setMission(null);
    setMessages([]);
    setTasks([]);
    setCrew([]);
    setLogs([]);
    setWindowData(null);
    setActiveTab("overview");
  }

  if (!token || !user || !mission) {
    return (
      <main className="loginPage">
        <section className="loginHero">
          <div className="logoRow">
            <div className="logoMark">M</div>
            <div>
              <div className="logoTitle">MarsLink</div>
              <div className="logoSub">{"// controle terra"}</div>
            </div>
          </div>

          <div className="heroCenter">
            <div className="missionBadge">
              <span className="pulseDot" />
              Missão Ares-1 · Latência extrema
            </div>

            <h1 className="heroTitle">
              Controle da <span>fronteira</span> do espaço.
            </h1>

            <p className="heroText">
              Plataforma integrada de comunicação e coordenação para missões em
              ambientes de conexão instável. Projetada para Marte. Aplicada na
              Terra.
            </p>
          </div>

          <div className="heroStats">
            <div>
              <div className="heroStatValue orange">18</div>
              <div className="heroStatLabel">min delay</div>
            </div>
            <div>
              <div className="heroStatValue">47</div>
              <div className="heroStatLabel">dias em rota</div>
            </div>
            <div>
              <div className="heroStatValue">4</div>
              <div className="heroStatLabel">tripulantes</div>
            </div>
          </div>
        </section>

        <section className="loginPanel">
          <form className="loginCard" onSubmit={handleLogin}>
            <h2 className="loginTitle">Acesso ao sistema</h2>
            <p className="loginDescription">
              Entre com as credenciais do Controle Terra para acompanhar a
              missão Ares-1.
            </p>

            {error ? <div className="errorBox">{error}</div> : null}

            <div className="formGroup">
              <label className="label" htmlFor="email">
                E-mail operacional
              </label>
              <input
                id="email"
                className="input"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
              />
            </div>

            <div className="formGroup">
              <label className="label" htmlFor="code">
                Código da missão
              </label>
              <input
                id="code"
                className="input"
                value={missionCode}
                onChange={(event) => setMissionCode(event.target.value)}
              />
            </div>

            <div className="formGroup">
              <label className="label" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />
            </div>

            <button className="primaryButton" disabled={loading}>
              {loading ? "Acessando..." : "Acessar Controle Terra"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="dashboardShell">
        <aside className="sidebar">
          <div className="logoRow">
            <div className="logoMark">M</div>
            <div>
              <div className="logoTitle">MarsLink</div>
              <div className="logoSub">{"// controle terra"}</div>
            </div>
          </div>

          <nav className="sidebarNav">
            <button
              className={`sidebarItem ${
                activeTab === "overview" ? "active" : ""
              }`}
              type="button"
              onClick={() => setActiveTab("overview")}
            >
              Visão geral
            </button>

            <button
              className={`sidebarItem ${
                activeTab === "messages" ? "active" : ""
              }`}
              type="button"
              onClick={() => setActiveTab("messages")}
            >
              Comunicações
            </button>

            <button
              className={`sidebarItem ${activeTab === "crew" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab("crew")}
            >
              Tripulação
            </button>

            <button
              className={`sidebarItem ${activeTab === "tasks" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab("tasks")}
            >
              Tarefas
            </button>

            <button
              className={`sidebarItem ${activeTab === "logs" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab("logs")}
            >
              Logs da missão
            </button>
          </nav>

          <div className="sidebarFooter">
            <button
              className="secondaryButton"
              type="button"
              onClick={handleLogout}
            >
              Sair do sistema
            </button>
          </div>
        </aside>

        <section className="main">
          <header className="topbar">
            <div>
              <h1 className="pageTitle">{getTabTitle(activeTab)}</h1>
              <p className="pageSubtitle">
                {mission.name} · Dia {mission.currentDay} · {mission.phase}
              </p>
            </div>

            <div className="topbarRight">
              <span className="pill green">
                <span className="pulseDot" />
                {windowData?.isOpen ? "Janela aberta" : "Janela fechada"}
              </span>

              <span className="pill orange">
                Delay {windowData?.delayMinutes ?? mission.delayMinutes} min
              </span>

              <button
                className="secondaryButton"
                type="button"
                onClick={() => void loadDashboardData(token)}
              >
                Atualizar
              </button>
            </div>
          </header>

          {error ? <div className="errorBox">{error}</div> : null}

          {activeTab === "overview" ? (
            <Overview
              mission={mission}
              windowData={windowData}
              queuedMessages={queuedMessages}
              pendingTasks={pendingTasks}
              visualLogsCount={visualLogsCount}
              messages={messages}
              tasks={tasks}
              crew={crew}
              logs={logs}
              loading={loading}
            />
          ) : null}

          {activeTab === "messages" ? (
            <MessagesTab
              messages={messages}
              newMessage={newMessage}
              newMessagePriority={newMessagePriority}
              setNewMessage={setNewMessage}
              setNewMessagePriority={setNewMessagePriority}
              handleCreateMessage={handleCreateMessage}
              handleUpdateMessageStatus={handleUpdateMessageStatus}
            />
          ) : null}

          {activeTab === "crew" ? <CrewTab crew={crew} /> : null}

          {activeTab === "tasks" ? (
            <TasksTab
              tasks={tasks}
              crew={crew}
              newTaskTitle={newTaskTitle}
              newTaskPriority={newTaskPriority}
              newTaskAssignee={newTaskAssignee}
              setNewTaskTitle={setNewTaskTitle}
              setNewTaskPriority={setNewTaskPriority}
              setNewTaskAssignee={setNewTaskAssignee}
              handleCreateTask={handleCreateTask}
            />
          ) : null}

          {activeTab === "logs" ? (
            <LogsTab
              logs={logs}
              newLogTitle={newLogTitle}
              newLogContent={newLogContent}
              newLogMood={newLogMood}
              setNewLogTitle={setNewLogTitle}
              setNewLogContent={setNewLogContent}
              setNewLogMood={setNewLogMood}
              handleCreateLog={handleCreateLog}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Overview({
  mission,
  windowData,
  queuedMessages,
  pendingTasks,
  visualLogsCount,
  messages,
  tasks,
  crew,
  logs,
  loading,
}: {
  mission: Mission;
  windowData: CommunicationWindow | null;
  queuedMessages: number;
  pendingTasks: number;
  visualLogsCount: number;
  messages: Message[];
  tasks: Task[];
  crew: CrewMember[];
  logs: MissionLog[];
  loading: boolean;
}) {
  return (
    <>
      <div className="grid4">
        <MetricCard
          label="// janela"
          value={windowData?.isOpen ? "Aberta" : "Fechada"}
          sub={`Sinal ${windowData?.signalQuality ?? mission.signalQuality}%`}
          orange
        />

        <MetricCard
          label="// delay atual"
          value={`${windowData?.delayMinutes ?? mission.delayMinutes} min`}
          sub={`${formatKm(mission.distanceKm)} km Terra–Marte`}
        />

        <MetricCard
          label="// mensagens na fila"
          value={String(queuedMessages)}
          sub="Aguardando próxima etapa"
          orange
        />

        <MetricCard
          label="// tarefas pendentes"
          value={String(pendingTasks)}
          sub={`${visualLogsCount} registros visuais enviados`}
        />
      </div>

      {loading ? <p className="pageSubtitle">Atualizando dados...</p> : null}

      <div className="grid2">
        <div className="card">
          <h2 className="cardTitle">Últimas comunicações</h2>

          <div className="list">
            {messages.slice(0, 4).map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="cardTitle">Tripulação e sinais vitais</h2>

          <div className="list">
            {crew.map((member) => (
              <CrewItem key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="grid2">
        <div className="card">
          <h2 className="cardTitle">Tarefas críticas</h2>

          <div className="list">
            {tasks.slice(0, 4).map((task) => (
              <TaskItem key={task.id} task={task} onUpdateStatus={null} />
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="cardTitle">Últimos logs da missão</h2>

          <div className="list">
            {logs.slice(0, 3).map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function MessagesTab({
  messages,
  newMessage,
  newMessagePriority,
  setNewMessage,
  setNewMessagePriority,
  handleCreateMessage,
  handleUpdateMessageStatus,
}: {
  messages: Message[];
  newMessage: string;
  newMessagePriority: string;
  setNewMessage: (value: string) => void;
  setNewMessagePriority: (value: string) => void;
  handleCreateMessage: (event: React.FormEvent<HTMLFormElement>) => void;
  handleUpdateMessageStatus: (messageId: string, status: string) => void;
}) {
  return (
    <>
      <form className="card" onSubmit={handleCreateMessage}>
        <h2 className="cardTitle">Nova instrução para a tripulação</h2>

        <div className="formGroup">
          <label className="label" htmlFor="message">
            Mensagem
          </label>

          <textarea
            id="message"
            className="textarea"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            placeholder="Digite a instrução do Controle Terra..."
          />
        </div>

        <div className="formRow">
          <div>
            <label className="label" htmlFor="priority">
              Prioridade
            </label>

            <select
              id="priority"
              className="select"
              value={newMessagePriority}
              onChange={(event) => setNewMessagePriority(event.target.value)}
            >
              <option value="LOW">Baixa</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Alta</option>
              <option value="CRITICAL">Crítica</option>
            </select>
          </div>

          <button className="primaryButton" type="submit">
            Enviar para fila
          </button>
        </div>
      </form>

      <div style={{ height: 14 }} />

      <div className="card">
        <h2 className="cardTitle">Histórico de comunicações</h2>

        <div className="list">
          {messages.map((message) => (
            <div className="listItem" key={message.id}>
              <div className="listHead">
                <div>
                  <div className="listTitle">
                    {message.sender.name} → {message.receiver?.name || "Todos"}
                  </div>

                  <div className="listMeta">
                    {formatDate(message.createdAt)} · delay{" "}
                    {message.delayMinutes} min
                  </div>
                </div>

                <StatusPill status={message.status} />
              </div>

              <p className="listText">{message.content}</p>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                  flexWrap: "wrap",
                }}
              >
                <button
                  className="secondaryButton"
                  type="button"
                  onClick={() => handleUpdateMessageStatus(message.id, "SENT")}
                >
                  Marcar como transmitida
                </button>

                <button
                  className="secondaryButton"
                  type="button"
                  onClick={() =>
                    handleUpdateMessageStatus(message.id, "DELIVERED")
                  }
                >
                  Marcar como recebida
                </button>

                <button
                  className="secondaryButton"
                  type="button"
                  onClick={() =>
                    handleUpdateMessageStatus(message.id, "ACKNOWLEDGED")
                  }
                >
                  Marcar como lida
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CrewTab({ crew }: { crew: CrewMember[] }) {
  return (
    <div className="grid2">
      {crew.map((member) => {
        const vital = member.vitals[0];

        return (
          <div className="card" key={member.id}>
            <div className="listHead">
              <div>
                <h2 className="cardTitle">{member.name}</h2>
                <p className="pageSubtitle">{member.email}</p>
              </div>

              <span className="pill orange">{member.avatar}</span>
            </div>

            <div className="grid4">
              <MetricCard
                label="FC"
                value={`${vital?.heartRate ?? "-"} bpm`}
                sub="Freq. cardíaca"
              />

              <MetricCard
                label="O₂"
                value={`${vital?.oxygen ?? "-"}%`}
                sub="Oxigenação"
              />

              <MetricCard
                label="Temp."
                value={`${vital?.temperature ?? "-"}°C`}
                sub="Temperatura"
              />

              <MetricCard
                label="Stress"
                value={`${vital?.stressLevel ?? "-"}%`}
                sub="Nível simulado"
              />
            </div>

            <h3 className="cardTitle">Tarefas atribuídas</h3>

            <div className="list">
              {member.assignedTasks.map((task) => (
                <div className="listItem" key={task.id}>
                  <div className="listHead">
                    <span className="listTitle">{task.title}</span>
                    <StatusPill status={task.status} />
                  </div>

                  <p className="listText">
                    Prioridade: {translateStatus(task.priority)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TasksTab({
  tasks,
  crew,
  newTaskTitle,
  newTaskPriority,
  newTaskAssignee,
  setNewTaskTitle,
  setNewTaskPriority,
  setNewTaskAssignee,
  handleCreateTask,
}: {
  tasks: Task[];
  crew: CrewMember[];
  newTaskTitle: string;
  newTaskPriority: string;
  newTaskAssignee: string;
  setNewTaskTitle: (value: string) => void;
  setNewTaskPriority: (value: string) => void;
  setNewTaskAssignee: (value: string) => void;
  handleCreateTask: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <>
      <form className="card" onSubmit={handleCreateTask}>
        <h2 className="cardTitle">Criar tarefa para a missão</h2>

        <div className="formGroup">
          <label className="label" htmlFor="taskTitle">
            Tarefa
          </label>

          <input
            id="taskTitle"
            className="input"
            value={newTaskTitle}
            onChange={(event) => setNewTaskTitle(event.target.value)}
            placeholder="Ex: Revisar protocolo de comunicação"
          />
        </div>

        <div className="formRow">
          <div>
            <label className="label" htmlFor="taskAssignee">
              Responsável
            </label>

            <select
              id="taskAssignee"
              className="select"
              value={newTaskAssignee}
              onChange={(event) => setNewTaskAssignee(event.target.value)}
            >
              <option value="">Sem responsável</option>

              {crew.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="taskPriority">
              Prioridade
            </label>

            <select
              id="taskPriority"
              className="select"
              value={newTaskPriority}
              onChange={(event) => setNewTaskPriority(event.target.value)}
            >
              <option value="LOW">Baixa</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Alta</option>
              <option value="CRITICAL">Crítica</option>
            </select>
          </div>
        </div>

        <button className="primaryButton" type="submit">
          Criar tarefa
        </button>
      </form>

      <div style={{ height: 14 }} />

      <div className="card">
        <h2 className="cardTitle">Tarefas da missão</h2>

        <div className="list">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onUpdateStatus={null} />
          ))}
        </div>
      </div>
    </>
  );
}

function LogsTab({
  logs,
  newLogTitle,
  newLogContent,
  newLogMood,
  setNewLogTitle,
  setNewLogContent,
  setNewLogMood,
  handleCreateLog,
}: {
  logs: MissionLog[];
  newLogTitle: string;
  newLogContent: string;
  newLogMood: string;
  setNewLogTitle: (value: string) => void;
  setNewLogContent: (value: string) => void;
  setNewLogMood: (value: string) => void;
  handleCreateLog: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <>
      <form className="card" onSubmit={handleCreateLog}>
        <h2 className="cardTitle">Novo log da missão</h2>

        <div className="formGroup">
          <label className="label" htmlFor="logTitle">
            Título
          </label>

          <input
            id="logTitle"
            className="input"
            value={newLogTitle}
            onChange={(event) => setNewLogTitle(event.target.value)}
            placeholder="Ex: Estado geral da tripulação"
          />
        </div>

        <div className="formGroup">
          <label className="label" htmlFor="logContent">
            Registro
          </label>

          <textarea
            id="logContent"
            className="textarea"
            value={newLogContent}
            onChange={(event) => setNewLogContent(event.target.value)}
            placeholder="Descreva o evento, decisão ou observação da missão..."
          />
        </div>

        <div className="formRow">
          <div>
            <label className="label" htmlFor="logMood">
              Estado emocional
            </label>

            <select
              id="logMood"
              className="select"
              value={newLogMood}
              onChange={(event) => setNewLogMood(event.target.value)}
            >
              <option value="CALM">Calmo</option>
              <option value="FOCUSED">Focado</option>
              <option value="TIRED">Cansado</option>
              <option value="STRESSED">Estressado</option>
              <option value="ALERT">Alerta</option>
            </select>
          </div>

          <button className="primaryButton" type="submit">
            Registrar log
          </button>
        </div>
      </form>

      <div style={{ height: 14 }} />

      <div className="card">
        <h2 className="cardTitle">Histórico de logs</h2>

        <div className="list">
          {logs.map((log) => (
            <LogItem key={log.id} log={log} />
          ))}
        </div>
      </div>
    </>
  );
}

function MetricCard({
  label,
  value,
  sub,
  orange,
}: {
  label: string;
  value: string;
  sub: string;
  orange?: boolean;
}) {
  return (
    <div className="card">
      <div className="metricLabel">{label}</div>
      <div className={`metricValue ${orange ? "orange" : ""}`}>{value}</div>
      <div className="metricSub">{sub}</div>
    </div>
  );
}

function MessageItem({ message }: { message: Message }) {
  return (
    <div className="listItem">
      <div className="listHead">
        <div>
          <div className="listTitle">
            {message.sender.name} → {message.receiver?.name || "Todos"}
          </div>

          <div className="listMeta">{formatDate(message.createdAt)}</div>
        </div>

        <StatusPill status={message.status} />
      </div>

      <p className="listText">{message.content}</p>
    </div>
  );
}

function CrewItem({ member }: { member: CrewMember }) {
  const vital = member.vitals[0];

  return (
    <div className="listItem">
      <div className="listHead">
        <div>
          <div className="listTitle">{member.name}</div>

          <div className="listMeta">
            FC {vital?.heartRate ?? "-"} · O₂ {vital?.oxygen ?? "-"}% · Stress{" "}
            {vital?.stressLevel ?? "-"}%
          </div>
        </div>

        <span className="pill orange">{member.avatar}</span>
      </div>
    </div>
  );
}

function TaskItem({
  task,
  onUpdateStatus,
}: {
  task: Task;
  onUpdateStatus: ((taskId: string, status: string) => void) | null;
}) {
  return (
    <div className="listItem">
      {task.imageUrl ? (
        <EvidenceImage
          imageUrl={task.imageUrl}
          title={`Evidência visual da tarefa: ${task.title}`}
        />
      ) : null}

      <div className="listHead">
        <div>
          <div className="listTitle">{task.title}</div>

          <div className="listMeta">
            {task.assignee?.name || "Sem responsável"} · Prioridade{" "}
            {translateStatus(task.priority)}
            {task.imageUrl ? " · evidência visual anexada" : ""}
          </div>
        </div>

        <StatusPill status={task.status} />
      </div>

      {task.description ? <p className="listText">{task.description}</p> : null}

      {onUpdateStatus ? (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            flexWrap: "wrap",
          }}
        >
          <button
            className="secondaryButton"
            type="button"
            onClick={() => onUpdateStatus(task.id, "PENDING")}
          >
            Pendente
          </button>

          <button
            className="secondaryButton"
            type="button"
            onClick={() => onUpdateStatus(task.id, "IN_PROGRESS")}
          >
            Em andamento
          </button>

          <button
            className="secondaryButton"
            type="button"
            onClick={() => onUpdateStatus(task.id, "DONE")}
          >
            Concluir
          </button>
        </div>
      ) : null}
    </div>
  );
}

function LogItem({ log }: { log: MissionLog }) {
  return (
    <div className="listItem">
      {log.imageUrl ? (
        <EvidenceImage
          imageUrl={log.imageUrl}
          title={`Registro visual da missão: ${log.title}`}
        />
      ) : null}

      <div className="listHead">
        <div>
          <div className="listTitle">{log.title}</div>

          <div className="listMeta">
            {log.author.name} · {formatDate(log.createdAt)}
          </div>
        </div>

        <MoodPill mood={log.mood} />
      </div>

      <p className="listText">{log.content}</p>
    </div>
  );
}

function EvidenceImage({
  imageUrl,
  title,
}: {
  imageUrl: string;
  title: string;
}) {
  return (
    <a
      href={imageUrl}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "block",
        textDecoration: "none",
        marginBottom: 12,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={title}
        style={{
          width: "100%",
          height: 220,
          objectFit: "contain",
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "#111",
          padding: 8,
          cursor: "pointer",
        }}
      />

      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          fontWeight: 800,
          color: "var(--orange)",
        }}
      >
        Abrir imagem em tamanho original ↗
      </div>
    </a>
  );
}

function StatusPill({ status }: { status: string }) {
  const className =
    status === "DONE" ||
    status === "ACKNOWLEDGED" ||
    status === "DELIVERED"
      ? "pill green"
      : status === "QUEUED" || status === "IN_PROGRESS" || status === "SENT"
        ? "pill orange"
        : status === "CRITICAL"
          ? "pill warn"
          : "pill";

  return <span className={className}>{translateStatus(status)}</span>;
}

function MoodPill({ mood }: { mood: string }) {
  const moodLabel: Record<string, string> = {
    CALM: "CALMO",
    FOCUSED: "FOCADO",
    TIRED: "CANSADO",
    STRESSED: "ESTRESSADO",
    ALERT: "ALERTA",
  };

  const className =
    mood === "CALM" || mood === "FOCUSED"
      ? "pill green"
      : mood === "TIRED"
        ? "pill orange"
        : "pill warn";

  return <span className={className}>{moodLabel[mood] || mood}</span>;
}

function translateStatus(status: string) {
  const statusLabel: Record<string, string> = {
    CREATED: "CRIADA",
    QUEUED: "NA FILA",
    SENT: "TRANSMITIDA",
    DELIVERED: "RECEBIDA",
    ACKNOWLEDGED: "LIDA",
    PENDING: "PENDENTE",
    IN_PROGRESS: "EM ANDAMENTO",
    DONE: "CONCLUÍDA",
    CANCELLED: "CANCELADA",
    LOW: "BAIXA",
    NORMAL: "NORMAL",
    HIGH: "ALTA",
    CRITICAL: "CRÍTICA",
  };

  return statusLabel[status] || status;
}

function getTabTitle(tab: Tab) {
  const titles: Record<Tab, string> = {
    overview: "Visão geral da missão",
    messages: "Comunicações",
    crew: "Tripulação",
    tasks: "Tarefas",
    logs: "Logs da missão",
  };

  return titles[tab];
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatKm(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(value);
}