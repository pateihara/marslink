//app/index.tsx
import {
  createLog,
  createMessage,
  getCurrentWindow,
  getLogs,
  getMessages,
  getTasks,
  login,
  updateTaskImage,
  updateTaskStatus,
  uploadMissionImage,
} from "@/src/services/api";
import { colors } from "@/src/theme/colors";
import {
  CommunicationWindow,
  LoginResponse,
  Message,
  Mission,
  MissionLog,
  Task,
  User,
} from "@/src/types/api";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Screen = "HOME" | "MESSAGES" | "TASKS" | "LOGS";

type SelectedImage = {
  uri: string;
  name: string;
  type: string;
};

export default function MarsLinkMobile() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);

  const [screen, setScreen] = useState<Screen>("HOME");

  const [email, setEmail] = useState("silva@marslink.com");
  const [password, setPassword] = useState("123456");
  const [missionCode, setMissionCode] = useState("ARES2026");

  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [windowData, setWindowData] = useState<CommunicationWindow | null>(
    null,
  );

  const [newMessage, setNewMessage] = useState("");

  const [newLogTitle, setNewLogTitle] = useState("");
  const [newLogContent, setNewLogContent] = useState("");
  const [newLogMood, setNewLogMood] = useState("FOCUSED");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );

  const [loading, setLoading] = useState(false);
  const [taskImageLoadingId, setTaskImageLoadingId] = useState<string | null>(
    null,
  );
  const [taskStatusLoadingId, setTaskStatusLoadingId] = useState<string | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);

  const queuedMessages = useMemo(() => {
    return messages.filter((message) => message.status === "QUEUED").length;
  }, [messages]);

  const pendingTasks = useMemo(() => {
    return tasks.filter((task) => task.status !== "DONE").length;
  }, [tasks]);

  async function loadMissionData(currentToken: string) {
    const [messagesData, tasksData, logsData, windowResponse] =
      await Promise.all([
        getMessages(currentToken),
        getTasks(currentToken),
        getLogs(currentToken),
        getCurrentWindow(currentToken),
      ]);

    setMessages(messagesData);
    setTasks(tasksData);
    setLogs(logsData);
    setWindowData(windowResponse);
  }

  async function handleLogin() {
    try {
      setLoading(true);

      const response: LoginResponse = await login({
        email,
        password,
        missionCode,
      });

      if (response.user.role !== "CREW") {
        throw new Error(
          "Use uma conta da tripulação para acessar o app mobile.",
        );
      }

      setToken(response.token);
      setUser(response.user);
      setMission(response.mission);

      await loadMissionData(response.token);
    } catch (error) {
      Alert.alert(
        "Erro no login",
        error instanceof Error ? error.message : "Não foi possível entrar.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    try {
      if (!token) {
        return;
      }

      setRefreshing(true);
      await loadMissionData(token);
    } catch (error) {
      Alert.alert(
        "Erro ao atualizar",
        error instanceof Error ? error.message : "Não foi possível atualizar.",
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSendMessage() {
    try {
      if (!token || !newMessage.trim()) {
        return;
      }

      setLoading(true);

      await createMessage(token, {
        content: newMessage,
        priority: "HIGH",
      });

      setNewMessage("");
      await loadMissionData(token);

      Alert.alert(
        "Mensagem na fila",
        "A comunicação foi salva na fila e será transmitida na próxima janela.",
      );
    } catch (error) {
      Alert.alert(
        "Erro ao enviar",
        error instanceof Error ? error.message : "Não foi possível enviar.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateTaskStatus(task: Task, status: string) {
    try {
      if (!token) {
        return;
      }

      if (task.status === status) {
        return;
      }

      setTaskStatusLoadingId(task.id);

      await updateTaskStatus(token, task.id, status);
      await loadMissionData(token);
    } catch (error) {
      Alert.alert(
        "Erro ao atualizar tarefa",
        error instanceof Error ? error.message : "Não foi possível atualizar.",
      );
    } finally {
      setTaskStatusLoadingId(null);
    }
  }

  async function pickSingleImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Autorize o acesso à galeria para anexar uma imagem.",
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.75,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    const fileName =
      asset.fileName ||
      `marslink-registro-${Date.now()}.${getExtensionFromUri(asset.uri)}`;

    return {
      uri: asset.uri,
      name: fileName,
      type: asset.mimeType || "image/jpeg",
    };
  }

  async function handlePickImage() {
    try {
      const image = await pickSingleImage();

      if (!image) {
        return;
      }

      setSelectedImage(image);
    } catch (error) {
      Alert.alert(
        "Erro ao selecionar imagem",
        error instanceof Error
          ? error.message
          : "Não foi possível selecionar a imagem.",
      );
    }
  }

  async function handleAttachTaskImage(task: Task) {
    try {
      if (!token) {
        return;
      }

      const image = await pickSingleImage();

      if (!image) {
        return;
      }

      setTaskImageLoadingId(task.id);

      const uploadResponse = await uploadMissionImage(token, image);
      await updateTaskImage(token, task.id, uploadResponse.url);
      await loadMissionData(token);

      Alert.alert(
        "Evidência anexada",
        "A imagem da tarefa foi enviada para o Controle Terra.",
      );
    } catch (error) {
      Alert.alert(
        "Erro ao anexar evidência",
        error instanceof Error
          ? error.message
          : "Não foi possível anexar a imagem à tarefa.",
      );
    } finally {
      setTaskImageLoadingId(null);
    }
  }

  async function handleRemoveTaskImage(task: Task) {
    try {
      if (!token) {
        return;
      }

      setTaskImageLoadingId(task.id);
      await updateTaskImage(token, task.id, null);
      await loadMissionData(token);

      Alert.alert(
        "Evidência removida",
        "A imagem da tarefa foi removida do registro operacional.",
      );
    } catch (error) {
      Alert.alert(
        "Erro ao remover evidência",
        error instanceof Error
          ? error.message
          : "Não foi possível remover a imagem da tarefa.",
      );
    } finally {
      setTaskImageLoadingId(null);
    }
  }

  async function handleCreateVisualLog() {
    try {
      if (!token || !newLogTitle.trim() || !newLogContent.trim()) {
        Alert.alert(
          "Dados incompletos",
          "Informe título e descrição para criar o registro visual.",
        );
        return;
      }

      setLoading(true);

      let imageUrl: string | null = null;

      if (selectedImage) {
        const uploadResponse = await uploadMissionImage(token, selectedImage);
        imageUrl = uploadResponse.url;
      }

      await createLog(token, {
        title: newLogTitle,
        content: newLogContent,
        mood: newLogMood,
        imageUrl,
      });

      setNewLogTitle("");
      setNewLogContent("");
      setNewLogMood("FOCUSED");
      setSelectedImage(null);

      await loadMissionData(token);

      Alert.alert(
        "Registro criado",
        selectedImage
          ? "O registro visual foi enviado para o Controle Terra."
          : "O log da missão foi criado com sucesso.",
      );
    } catch (error) {
      Alert.alert(
        "Erro ao criar registro",
        error instanceof Error
          ? error.message
          : "Não foi possível criar o registro visual.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setToken("");
    setUser(null);
    setMission(null);
    setMessages([]);
    setTasks([]);
    setLogs([]);
    setWindowData(null);
    setSelectedImage(null);
    setTaskImageLoadingId(null);
    setTaskStatusLoadingId(null);
    setScreen("HOME");
  }

  if (!token || !user || !mission) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.loginContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoBox}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>M</Text>
          </View>

          <View>
            <Text style={styles.logoTitle}>MarsLink</Text>
            <Text style={styles.logoSub}>{"// app da tripulação"}</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.badge}>MISSÃO ARES-1 · DIA 47</Text>

          <Text style={styles.heroTitle}>
            Sua posição em <Text style={styles.orange}>Marte</Text> começa aqui.
          </Text>

          <Text style={styles.heroText}>
            Comunicação assíncrona, tarefas e status da missão para ambientes de
            latência extrema.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesso à nave</Text>
          <Text style={styles.cardSub}>
            Entre com suas credenciais de tripulante.
          </Text>

          <Text style={styles.label}>Identificação</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tripulante@marslink.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Código da missão</Text>
          <TextInput
            style={styles.input}
            value={missionCode}
            onChangeText={setMissionCode}
            placeholder="ARES2026"
            placeholderTextColor={colors.muted}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="123456"
            placeholderTextColor={colors.muted}
            secureTextEntry
          />

          <Pressable
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#171717" />
            ) : (
              <Text style={styles.primaryButtonText}>Acessar sistema</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.appShell}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.appContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.orange}
          />
        }
      >
        <View style={styles.topbar}>
          <View>
            <Text style={styles.smallOrange}>MARSLINK · DIA 47</Text>
            <Text style={styles.title}>
              Bom dia,{"\n"}
              {user.name}.
            </Text>
            <Text style={styles.subtitle}>
              {mission.phase} · {pendingTasks} tarefas pendentes
            </Text>
          </View>

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>

        {screen === "HOME" ? (
          <HomeScreen
            mission={mission}
            windowData={windowData}
            queuedMessages={queuedMessages}
            pendingTasks={pendingTasks}
            messages={messages}
            tasks={tasks}
            logs={logs}
            goTo={setScreen}
          />
        ) : null}

        {screen === "MESSAGES" ? (
          <MessagesScreen
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            loading={loading}
          />
        ) : null}

        {screen === "TASKS" ? (
          <TasksScreen
            tasks={tasks}
            taskImageLoadingId={taskImageLoadingId}
            taskStatusLoadingId={taskStatusLoadingId}
            handleUpdateTaskStatus={handleUpdateTaskStatus}
            handleAttachTaskImage={handleAttachTaskImage}
            handleRemoveTaskImage={handleRemoveTaskImage}
          />
        ) : null}

        {screen === "LOGS" ? (
          <LogsScreen
            logs={logs}
            newLogTitle={newLogTitle}
            newLogContent={newLogContent}
            newLogMood={newLogMood}
            selectedImage={selectedImage}
            loading={loading}
            setNewLogTitle={setNewLogTitle}
            setNewLogContent={setNewLogContent}
            setNewLogMood={setNewLogMood}
            handlePickImage={handlePickImage}
            handleRemoveImage={() => setSelectedImage(null)}
            handleCreateVisualLog={handleCreateVisualLog}
          />
        ) : null}
      </ScrollView>

      <View style={styles.navbar}>
        <NavItem
          label="Home"
          active={screen === "HOME"}
          onPress={() => setScreen("HOME")}
        />

        <NavItem
          label="Comunicações"
          active={screen === "MESSAGES"}
          onPress={() => setScreen("MESSAGES")}
        />

        <NavItem
          label="Tarefas"
          active={screen === "TASKS"}
          onPress={() => setScreen("TASKS")}
        />

        <NavItem
          label="Logs"
          active={screen === "LOGS"}
          onPress={() => setScreen("LOGS")}
        />
      </View>
    </View>
  );
}

function HomeScreen({
  mission,
  windowData,
  queuedMessages,
  pendingTasks,
  messages,
  tasks,
  logs,
  goTo,
}: {
  mission: Mission;
  windowData: CommunicationWindow | null;
  queuedMessages: number;
  pendingTasks: number;
  messages: Message[];
  tasks: Task[];
  logs: MissionLog[];
  goTo: (screen: Screen) => void;
}) {
  return (
    <>
      <Pressable style={styles.statusCard} onPress={() => goTo("MESSAGES")}>
        <View>
          <Text style={styles.cardLabel}>{"// janela de comunicação"}</Text>
          <Text style={styles.statusTitle}>
            {windowData?.isOpen ? "Aberta" : "Fechada"}
          </Text>
          <Text style={styles.statusSub}>
            sinal {windowData?.signalQuality ?? mission.signalQuality}% · delay{" "}
            {windowData?.delayMinutes ?? mission.delayMinutes} min
          </Text>
        </View>

        <View style={styles.bigDelayBox}>
          <Text style={styles.bigDelay}>
            {windowData?.delayMinutes ?? mission.delayMinutes}
          </Text>
          <Text style={styles.delayLabel}>MIN</Text>
        </View>
      </Pressable>

      <View style={styles.grid}>
        <Pressable style={styles.miniCard} onPress={() => goTo("MESSAGES")}>
          <Text style={styles.cardLabel}>{"// comunicações"}</Text>
          <Text style={styles.metricOrange}>{queuedMessages}</Text>
          <Text style={styles.cardSub}>msgs na fila</Text>
        </Pressable>

        <Pressable style={styles.miniCard} onPress={() => goTo("TASKS")}>
          <Text style={styles.cardLabel}>{"// tarefas"}</Text>
          <Text style={styles.metricCream}>{pendingTasks}</Text>
          <Text style={styles.cardSub}>pendentes</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Última mensagem</Text>

        {messages[0] ? (
          <>
            <Text style={styles.itemTitle}>
              {messages[0].sender.name} →{" "}
              {messages[0].receiver?.name || "Todos"}
            </Text>
            <Text style={styles.itemText}>{messages[0].content}</Text>
            <Text style={styles.pill}>
              {translateStatus(messages[0].status)}
            </Text>
          </>
        ) : (
          <Text style={styles.cardSub}>Nenhuma mensagem encontrada.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Último registro visual</Text>

        {logs[0] ? (
          <>
            {logs[0].imageUrl ? (
              <Image
                source={{ uri: logs[0].imageUrl }}
                style={styles.logImage}
              />
            ) : null}

            <Text style={styles.itemTitle}>{logs[0].title}</Text>
            <Text style={styles.itemText}>{logs[0].content}</Text>
            <Text style={styles.pill}>{translateMood(logs[0].mood)}</Text>
          </>
        ) : (
          <Text style={styles.cardSub}>Nenhum log encontrado.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Próxima tarefa</Text>

        {tasks[0] ? (
          <>
            {tasks[0].imageUrl ? (
              <Image
                source={{ uri: tasks[0].imageUrl }}
                style={styles.logImage}
              />
            ) : null}

            <Text style={styles.itemTitle}>{tasks[0].title}</Text>
            <Text style={styles.itemText}>
              {tasks[0].description || "Sem descrição."}
            </Text>
            <Text style={styles.pill}>{translateStatus(tasks[0].status)}</Text>
          </>
        ) : (
          <Text style={styles.cardSub}>Nenhuma tarefa encontrada.</Text>
        )}
      </View>
    </>
  );
}

function MessagesScreen({
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  loading,
}: {
  messages: Message[];
  newMessage: string;
  setNewMessage: (value: string) => void;
  handleSendMessage: () => void;
  loading: boolean;
}) {
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Nova mensagem para o Controle Terra
        </Text>

        <TextInput
          style={styles.textarea}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Registre sua mensagem..."
          placeholderTextColor={colors.muted}
          multiline
        />

        <Pressable
          style={[styles.primaryButton, loading && styles.disabledButton]}
          onPress={handleSendMessage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#171717" />
          ) : (
            <Text style={styles.primaryButtonText}>Enviar para fila</Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Histórico</Text>

      {messages.map((message) => (
        <View style={styles.card} key={message.id}>
          <Text style={styles.itemTitle}>
            {message.sender.name} → {message.receiver?.name || "Todos"}
          </Text>
          <Text style={styles.itemText}>{message.content}</Text>

          <View style={styles.row}>
            <Text style={styles.pill}>{translateStatus(message.status)}</Text>
            <Text style={styles.meta}>delay {message.delayMinutes} min</Text>
          </View>
        </View>
      ))}
    </>
  );
}

function TasksScreen({
  tasks,
  taskImageLoadingId,
  taskStatusLoadingId,
  handleUpdateTaskStatus,
  handleAttachTaskImage,
  handleRemoveTaskImage,
}: {
  tasks: Task[];
  taskImageLoadingId: string | null;
  taskStatusLoadingId: string | null;
  handleUpdateTaskStatus: (task: Task, status: string) => void;
  handleAttachTaskImage: (task: Task) => void;
  handleRemoveTaskImage: (task: Task) => void;
}) {
  return (
    <>
      <Text style={styles.sectionTitle}>Tarefas do turno</Text>

      {tasks.map((task) => {
        const isLoadingImage = taskImageLoadingId === task.id;
        const isLoadingStatus = taskStatusLoadingId === task.id;

        return (
          <View style={styles.taskCard} key={task.id}>
            <View
              style={[
                styles.checkBox,
                task.status === "DONE" && styles.checkBoxDone,
                task.status === "IN_PROGRESS" && styles.checkBoxProgress,
              ]}
            >
              {task.status === "DONE" ? (
                <Text style={styles.checkText}>✓</Text>
              ) : task.status === "IN_PROGRESS" ? (
                <Text style={styles.checkText}>…</Text>
              ) : null}
            </View>

            <View style={{ flex: 1 }}>
              {task.imageUrl ? (
                <Image
                  source={{ uri: task.imageUrl }}
                  style={styles.taskEvidenceImage}
                />
              ) : null}

              <Text
                style={[
                  styles.itemTitle,
                  task.status === "DONE" && styles.doneText,
                ]}
              >
                {task.title}
              </Text>

              <Text style={styles.itemText}>
                {task.assignee?.name || "Sem responsável"} · Prioridade{" "}
                {translateStatus(task.priority)}
              </Text>

              <View style={styles.row}>
                <Text style={styles.pill}>{translateStatus(task.status)}</Text>
                {task.imageUrl ? (
                  <Text style={styles.meta}>1/1 evidência anexada</Text>
                ) : (
                  <Text style={styles.meta}>sem evidência visual</Text>
                )}
              </View>

              <Text style={styles.taskActionLabel}>Atualizar status</Text>

              <View style={styles.taskActionsRow}>
                <Pressable
                  style={[
                    styles.statusSmallButton,
                    task.status === "PENDING" && styles.statusSmallButtonActive,
                  ]}
                  onPress={() => handleUpdateTaskStatus(task, "PENDING")}
                  disabled={isLoadingStatus}
                >
                  <Text
                    style={[
                      styles.statusSmallButtonText,
                      task.status === "PENDING" &&
                        styles.statusSmallButtonTextActive,
                    ]}
                  >
                    Pendente
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.statusSmallButton,
                    task.status === "IN_PROGRESS" &&
                      styles.statusSmallButtonActive,
                  ]}
                  onPress={() => handleUpdateTaskStatus(task, "IN_PROGRESS")}
                  disabled={isLoadingStatus}
                >
                  <Text
                    style={[
                      styles.statusSmallButtonText,
                      task.status === "IN_PROGRESS" &&
                        styles.statusSmallButtonTextActive,
                    ]}
                  >
                    Em andamento
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.statusSmallButton,
                    task.status === "DONE" && styles.statusSmallButtonActive,
                  ]}
                  onPress={() => handleUpdateTaskStatus(task, "DONE")}
                  disabled={isLoadingStatus}
                >
                  <Text
                    style={[
                      styles.statusSmallButtonText,
                      task.status === "DONE" &&
                        styles.statusSmallButtonTextActive,
                    ]}
                  >
                    Concluir
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.taskActionLabel}>Evidência visual</Text>

              <View style={styles.taskActionsRow}>
                <Pressable
                  style={styles.secondarySmallButton}
                  onPress={() => handleAttachTaskImage(task)}
                  disabled={isLoadingImage}
                >
                  {isLoadingImage ? (
                    <ActivityIndicator color={colors.text} size="small" />
                  ) : (
                    <Text style={styles.secondarySmallButtonText}>
                      {task.imageUrl
                        ? "Trocar evidência"
                        : "Anexar evidência visual"}
                    </Text>
                  )}
                </Pressable>

                {task.imageUrl ? (
                  <Pressable
                    style={styles.removeSmallButton}
                    onPress={() => handleRemoveTaskImage(task)}
                    disabled={isLoadingImage}
                  >
                    <Text style={styles.removeSmallButtonText}>Remover</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        );
      })}
    </>
  );
}

function LogsScreen({
  logs,
  newLogTitle,
  newLogContent,
  newLogMood,
  selectedImage,
  loading,
  setNewLogTitle,
  setNewLogContent,
  setNewLogMood,
  handlePickImage,
  handleRemoveImage,
  handleCreateVisualLog,
}: {
  logs: MissionLog[];
  newLogTitle: string;
  newLogContent: string;
  newLogMood: string;
  selectedImage: SelectedImage | null;
  loading: boolean;
  setNewLogTitle: (value: string) => void;
  setNewLogContent: (value: string) => void;
  setNewLogMood: (value: string) => void;
  handlePickImage: () => void;
  handleRemoveImage: () => void;
  handleCreateVisualLog: () => void;
}) {
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Registro visual da missão</Text>
        <Text style={styles.cardSub}>
          Adicione um log operacional com até 1 imagem da missão.
        </Text>

        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={newLogTitle}
          onChangeText={setNewLogTitle}
          placeholder="Ex: Registro visual do setor Alpha-7"
          placeholderTextColor={colors.muted}
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.textarea}
          value={newLogContent}
          onChangeText={setNewLogContent}
          placeholder="Descreva o que foi registrado..."
          placeholderTextColor={colors.muted}
          multiline
        />

        <Text style={styles.label}>Estado emocional</Text>

        <View style={styles.moodGrid}>
          {[
            ["CALM", "Calmo"],
            ["FOCUSED", "Focado"],
            ["TIRED", "Cansado"],
            ["STRESSED", "Estressado"],
            ["ALERT", "Alerta"],
          ].map(([value, label]) => (
            <Pressable
              key={value}
              style={[
                styles.moodButton,
                newLogMood === value && styles.moodButtonActive,
              ]}
              onPress={() => setNewLogMood(value)}
            >
              <Text
                style={[
                  styles.moodButtonText,
                  newLogMood === value && styles.moodButtonTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Imagem anexada</Text>

        {selectedImage ? (
          <View style={styles.selectedImageBox}>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.selectedImage}
            />

            <View style={styles.rowBetween}>
              <Text style={styles.imageCounter}>1/1 imagem selecionada</Text>

              <Pressable onPress={handleRemoveImage}>
                <Text style={styles.removeImageText}>Remover</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.emptyImageBox}>
            <Text style={styles.cardSub}>
              Nenhuma imagem selecionada. O registro pode ser enviado sem imagem
              ou com 1 imagem.
            </Text>
          </View>
        )}

        <Pressable style={styles.secondaryButton} onPress={handlePickImage}>
          <Text style={styles.secondaryButtonText}>
            {selectedImage ? "Trocar imagem" : "Selecionar 1 imagem"}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.primaryButton, loading && styles.disabledButton]}
          onPress={handleCreateVisualLog}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#171717" />
          ) : (
            <Text style={styles.primaryButtonText}>Enviar registro visual</Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Histórico de logs</Text>

      {logs.map((log) => (
        <View style={styles.card} key={log.id}>
          {log.imageUrl ? (
            <Image source={{ uri: log.imageUrl }} style={styles.logImage} />
          ) : null}

          <Text style={styles.itemTitle}>{log.title}</Text>
          <Text style={styles.itemText}>{log.content}</Text>

          <View style={styles.row}>
            <Text style={styles.pill}>{translateMood(log.mood)}</Text>
            <Text style={styles.meta}>{formatDate(log.createdAt)}</Text>
          </View>
        </View>
      ))}
    </>
  );
}

function NavItem({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.navItem} onPress={onPress}>
      <Text style={[styles.navText, active && styles.navTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
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

function translateMood(mood: string) {
  const moodLabel: Record<string, string> = {
    CALM: "CALMO",
    FOCUSED: "FOCADO",
    TIRED: "CANSADO",
    STRESSED: "ESTRESSADO",
    ALERT: "ALERTA",
  };

  return moodLabel[mood] || mood;
}

function getExtensionFromUri(uri: string) {
  const extension = uri.split(".").pop();

  if (!extension || extension.length > 5) {
    return "jpg";
  }

  return extension;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loginContent: {
    paddingHorizontal: 22,
    paddingTop: 70,
    paddingBottom: 40,
  },
  appContent: {
    paddingHorizontal: 18,
    paddingTop: 64,
    paddingBottom: 120,
  },
  logoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 42,
  },
  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMarkText: {
    color: "#171717",
    fontSize: 20,
    fontWeight: "900",
  },
  logoTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  logoSub: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  hero: {
    marginBottom: 28,
  },
  badge: {
    alignSelf: "flex-start",
    color: colors.orange,
    backgroundColor: "rgba(252,110,32,0.1)",
    borderColor: "rgba(252,110,32,0.24)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 18,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 42,
    letterSpacing: -1.4,
  },
  orange: {
    color: colors.orange,
  },
  heroText: {
    color: colors.sub,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
  cardSub: {
    color: colors.sub,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 7,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 14,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  textarea: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 14,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 110,
    textAlignVertical: "top",
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: colors.orange,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },
  primaryButtonText: {
    color: "#171717",
    fontWeight: "900",
    fontSize: 15,
  },
  secondaryButton: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  smallOrange: {
    color: colors.orange,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 5,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 34,
  },
  subtitle: {
    color: colors.sub,
    fontSize: 13,
    marginTop: 6,
  },
  logoutButton: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  logoutText: {
    color: colors.sub,
    fontWeight: "800",
  },
  statusCard: {
    backgroundColor: colors.card,
    borderColor: "rgba(252,110,32,0.25)",
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  cardLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 7,
  },
  statusTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "900",
  },
  statusSub: {
    color: colors.sub,
    fontSize: 13,
    marginTop: 5,
  },
  bigDelayBox: {
    alignItems: "center",
  },
  bigDelay: {
    color: colors.orange,
    fontSize: 46,
    fontWeight: "900",
    lineHeight: 48,
  },
  delayLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900",
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  miniCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  metricOrange: {
    color: colors.orange,
    fontSize: 32,
    fontWeight: "900",
  },
  metricCream: {
    color: colors.cream,
    fontSize: 32,
    fontWeight: "900",
  },
  itemTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 5,
  },
  itemText: {
    color: colors.sub,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  pill: {
    alignSelf: "flex-start",
    color: colors.orange,
    backgroundColor: "rgba(252,110,32,0.1)",
    borderColor: "rgba(252,110,32,0.24)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "900",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    marginTop: 10,
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
  },
  taskCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkBoxDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkBoxProgress: {
    backgroundColor: "rgba(252,110,32,0.18)",
    borderColor: "rgba(252,110,32,0.45)",
  },
  checkText: {
    color: "#ffffff",
    fontWeight: "900",
  },
  doneText: {
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  taskEvidenceImage: {
    width: "100%",
    height: 170,
    borderRadius: 14,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  taskActionLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  taskActionsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 12,
  },
  statusSmallButton: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  statusSmallButtonActive: {
    backgroundColor: "rgba(252,110,32,0.12)",
    borderColor: "rgba(252,110,32,0.35)",
  },
  statusSmallButtonText: {
    color: colors.sub,
    fontSize: 12,
    fontWeight: "900",
  },
  statusSmallButtonTextActive: {
    color: colors.orange,
  },
  secondarySmallButton: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  secondarySmallButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  removeSmallButton: {
    borderColor: "rgba(252,110,32,0.35)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  removeSmallButtonText: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: "900",
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  moodButton: {
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  moodButtonActive: {
    backgroundColor: "rgba(252,110,32,0.12)",
    borderColor: "rgba(252,110,32,0.3)",
  },
  moodButtonText: {
    color: colors.sub,
    fontSize: 12,
    fontWeight: "900",
  },
  moodButtonTextActive: {
    color: colors.orange,
  },
  emptyImageBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  selectedImageBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
  },
  selectedImage: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  logImage: {
    width: "100%",
    height: 190,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  imageCounter: {
    color: colors.sub,
    fontSize: 12,
    fontWeight: "800",
  },
  removeImageText: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: "900",
  },
  navbar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 12,
    paddingBottom: 28,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  navItem: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  navText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
  },
  navTextActive: {
    color: colors.orange,
  },
});
