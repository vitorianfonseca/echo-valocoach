import designContent from "./content.json";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { call, desktop, downloadJSON, importMedia, type Media } from "./bridge";
import {
  importMatches,
  mergeMatches,
  stats,
  safeInterval,
  type State,
  initialState,
} from "./model";
import inventory from "../design/screens.json";
type Props = {
  route: string;
  title: string;
  state: State;
  setState: Dispatch<SetStateAction<State>>;
  go: (id: string) => void;
  notify: (text: string) => void;
  media: Media[];
  setMedia: Dispatch<SetStateAction<Media[]>>;
};
const drills = inventory.filter((s) => s.name.startsWith("Exercício"));
const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();
const formatTime = (n: number) =>
  `${Math.floor(n / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(n % 60)
    .toString()
    .padStart(2, "0")}`;
function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="empty">{children}</p>;
}
export function Workspace(p: Props) {
  const { route, title, state, go } = p;
  let content;
  if (route === "12:2" || route === "24:1649") content = <Home {...p} />;
  else if (
    ["12:172", "13:145", "13:520", "13:929", "24:1859", "91:62"].includes(route)
  )
    content = <Matches {...p} />;
  else if (
    [
      "13:302",
      "13:741",
      "91:43",
      "16:1629",
      "91:51",
      "91:52",
      "16:1991",
      "91:44",
      "134:39086",
      "134:39582",
    ].includes(route)
  )
    content = <Video {...p} />;
  else if (["14:353", "14:626", "91:60", "91:61"].includes(route))
    content = <Maps {...p} />;
  else if (
    route.startsWith("105:") ||
    [
      "15:901",
      "15:1052",
      "15:1226",
      "18:2073",
      "91:58",
      "91:59",
      "137:39808",
      "141:40163",
    ].includes(route) ||
    route.startsWith("18:")
  )
    content = <Training {...p} />;
  else if (["15:601", "15:742", "134:39334", "91:69"].includes(route))
    content = <Progress {...p} />;
  else if (
    ["16:867", "91:53", "91:54", "91:55", "91:56", "91:57"].includes(route)
  )
    content = <Coach {...p} />;
  else if (route === "134:39210") content = <Correction {...p} />;
  else if (["91:41", "91:42", "134:39458"].includes(route))
    content = <Sources {...p} />;
  else if (
    ["14:757", "91:63"].includes(route) ||
    route.startsWith("98:") ||
    ["106:33332", "106:33858", "106:34384", "106:34910", "24:1830"].includes(
      route,
    )
  )
    content = <Agents {...p} />;
  else if (route === "16:1122" || route === "108:32508") content = <Glossary />;
  else if (["16:1891", "91:47", "91:48", "91:49", "91:50"].includes(route))
    content = <Onboarding {...p} />;
  else if (route === "16:1764" || route === "91:64")
    content = <Search {...p} />;
  else content = <Settings {...p} />;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ECHO / {state.settings.player}</p>
          <h1>{title.replace(/^\d+ · /, "")}</h1>
        </div>
        <button onClick={() => go("12:2")}>Início ↗</button>
      </div>
      {content}
      <p className="footnote">
        ECHO ·{" "}
        {desktop
          ? "Dados guardados neste dispositivo"
          : "Modo web · vídeos disponíveis nesta sessão"}{" "}
        · Estatísticas calculadas apenas a partir de dados importados.
      </p>
    </>
  );
}
function Home(p: Props) {
  const s = stats(p.state.matches);
  return (
    <>
      <Card>
        <div className="split">
          <div>
            <p className="eyebrow">O TEU PRÓXIMO PASSO</p>
            <h2>
              {p.media.length
                ? "Uma decisão de cada vez."
                : "Começa pela tua partida."}
            </h2>
            <p>
              Revê um momento, escolhe um exercício e acompanha as próximas
              partidas.
            </p>
          </div>
          <button className="primary" onClick={() => p.go("13:302")}>
            {p.media.length ? "Rever vídeo ↗" : "Importar vídeo ↗"}
          </button>
        </div>
      </Card>
      <div className="metrics">
        {[
          ["PARTIDAS", s.count],
          ["VITÓRIAS", s.winrate === null ? "—" : s.winrate + "%"],
          ["K/D", s.kd ?? "—"],
          ["TREINOS", p.state.sessions.length],
        ].map(([k, v]) => (
          <Card key={k}>
            <p className="eyebrow">{k}</p>
            <strong className="number">{v}</strong>
          </Card>
        ))}
      </div>
      <div className="two-col">
        <Card title="Últimas partidas">
          <MatchRows {...p} matches={p.state.matches.slice(0, 5)} />
          <button onClick={() => p.go("12:172")}>
            Ver todas / importar dados
          </button>
        </Card>
        <Card title="O que já funciona?">
          <p>
            Usa um clip para rever boas decisões e identifica o que queres
            repetir.
          </p>
          <button className="primary" onClick={() => p.go("16:867")}>
            Falar com ECHO ↗
          </button>
        </Card>
      </div>
      <Card title="Como te sentes nesta sessão?">
        <p>
          Faz uma pausa se perderes o foco. Não inferimos o teu estado emocional
          a partir de estatísticas.
        </p>
        <button onClick={() => p.go("91:69")}>Rever o meu ritmo</button>
      </Card>
    </>
  );
}
function MatchRows(p: Props & { matches: State["matches"] }) {
  return p.matches.length ? (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mapa / data</th>
            <th>Agente</th>
            <th>Resultado</th>
            <th>K / D / A</th>
            <th>Origem</th>
          </tr>
        </thead>
        <tbody>
          {p.matches.map((m) => (
            <tr key={m.id}>
              <td>
                {m.map.split("/").filter(Boolean).pop()}
                <small>{new Date(m.date).toLocaleDateString("pt-PT")}</small>
              </td>
              <td>{m.agent}</td>
              <td className={m.won ? "win" : "loss"}>
                {m.roundsWon} : {m.roundsLost}
              </td>
              <td>
                {m.kills} / {m.deaths} / {m.assists}
              </td>
              <td>{m.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty>Ainda não há partidas. Importa um ficheiro JSON para começar.</Empty>
  );
}
function Matches(p: Props) {
  const [filter, setFilter] = useState(""),
    [result, setResult] = useState("all"),
    [compare, setCompare] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const filtered = p.state.matches.filter(
    (m) =>
      (m.map + " " + m.agent).toLowerCase().includes(filter.toLowerCase()) &&
      (result === "all" || m.won === (result === "win")),
  );
  const ingest = (data: unknown) => {
    try {
      const matches = importMatches(data);
      p.setState((s) => ({ ...s, matches: mergeMatches(s.matches, matches) }));
      p.notify(`${matches.length} partidas importadas.`);
    } catch (e) {
      p.notify((e as Error).message);
    }
  };
  async function importData() {
    try {
      if (desktop) {
        const data = await call("data:import");
        if (data) ingest(data);
      } else input.current?.click();
    } catch (e) {
      p.notify((e as Error).message);
    }
  }
  return (
    <>
      <div className="toolbar">
        <input
          aria-label="Pesquisar partidas"
          placeholder="Pesquisar mapa ou agente…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select
          aria-label="Resultado"
          value={result}
          onChange={(e) => setResult(e.target.value)}
        >
          <option value="all">Todos os resultados</option>
          <option value="win">Vitórias</option>
          <option value="loss">Derrotas</option>
        </select>
        <button className="primary" onClick={importData}>
          Importar JSON
        </button>
        <button
          onClick={() => downloadJSON(p.state.matches, "echo-partidas.json")}
        >
          Exportar
        </button>
        <input
          hidden
          type="file"
          accept=".json"
          ref={input}
          onChange={async (e) => {
            try {
              const f = e.target.files?.[0];
              if (f) ingest(JSON.parse(await f.text()));
            } catch {
              p.notify("Ficheiro JSON inválido.");
            }
          }}
        />
      </div>
      <Card>
        <MatchRows {...p} matches={filtered} />
      </Card>
      <Card title="Comparar partidas">
        <p>
          Seleciona duas partidas. A comparação mostra diferenças descritivas,
          não causas.
        </p>
        <div className="two-col">
          {[0, 1].map((i) => (
            <select
              key={i}
              aria-label={"Partida " + (i + 1)}
              value={compare[i] || ""}
              onChange={(e) =>
                setCompare((v) => {
                  const n = [...v];
                  n[i] = e.target.value;
                  return n;
                })
              }
            >
              <option value="">Escolher partida</option>
              {p.state.matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.map} · {m.date.slice(0, 10)} · {m.kills}/{m.deaths}
                </option>
              ))}
            </select>
          ))}
        </div>
        {compare.length === 2 && compare.every(Boolean) && (
          <MatchRows
            {...p}
            matches={compare
              .map((id) => p.state.matches.find((m) => m.id === id)!)
              .filter(Boolean)}
          />
        )}
      </Card>
      <Card title="Formato de importação">
        <p>
          Suporta uma lista de partidas ECHO ou respostas Riot em{" "}
          <code>{"{puuid, matches: [...]}"}</code>. A ligação automática exige
          acesso Riot aprovado.
        </p>
        <button
          onClick={() =>
            downloadJSON(
              [
                {
                  id: "a-tua-partida",
                  map: "Ascent",
                  agent: "Omen",
                  date: now(),
                  won: true,
                  kills: 18,
                  deaths: 12,
                  assists: 7,
                  roundsWon: 13,
                  roundsLost: 8,
                  source: "import",
                },
              ],
              "modelo-importacao.json",
            )
          }
        >
          Descarregar modelo JSON
        </button>
        <button onClick={() => p.go("16:1252")}>Configurar Riot</button>
      </Card>
    </>
  );
}
function Video(p: Props) {
  const [selected, setSelected] = useState(p.media[0]?.id || ""),
    [time, setTime] = useState(0),
    [duration, setDuration] = useState(0),
    [note, setNote] = useState(""),
    [start, setStart] = useState(0),
    [end, setEnd] = useState(15),
    [busy, setBusy] = useState(false);
  const video = useRef<HTMLVideoElement>(null),
    active = p.media.find((m) => m.id === selected) || p.media[0];
  const addMedia = async () => {
    try {
      const files = await importMedia();
      if (files.length) {
        p.setMedia((m) => [...m, ...files]);
        setSelected(files[0].id);
      }
    } catch (e) {
      p.notify((e as Error).message);
    }
  };
  async function exportClip() {
    if (!active || !safeInterval(start, end, duration))
      return p.notify("Define um intervalo válido dentro do vídeo.");
    setBusy(true);
    try {
      if (await call("clip:export", { mediaId: active.id, start, end }))
        p.notify("Clip exportado.");
    } catch (e) {
      p.notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="toolbar">
        <select
          aria-label="Vídeo"
          value={active?.id || ""}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Escolher vídeo</option>
          {p.media.map((m) => (
            <option value={m.id} key={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <button className="primary" onClick={addMedia}>
          Importar vídeo
        </button>
        <button onClick={() => p.go("16:1513")}>Gravar ecrã</button>
      </div>
      <div className="video-grid">
        <Card>
          {active ? (
            <video
              ref={video}
              key={active.id}
              src={active.url}
              controls
              preload="metadata"
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => {
                setDuration(e.currentTarget.duration);
                setEnd(Math.min(15, e.currentTarget.duration));
              }}
              onError={() =>
                p.notify(
                  "Não foi possível abrir este vídeo. Confirma o ficheiro e o formato.",
                )
              }
            />
          ) : (
            <div className="video-empty">
              <h2>O teu vídeo, o teu contexto.</h2>
              <p>
                Importa MP4, WebM ou MOV para rever momentos, tomar notas e
                exportar clips.
              </p>
              <button onClick={addMedia}>Escolher ficheiro</button>
            </div>
          )}
          <div className="toolbar">
            <label>
              Ir para (seg.)
              <input
                type="number"
                min="0"
                max={duration}
                value={Math.floor(time)}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (video.current && n >= 0 && n <= duration)
                    video.current.currentTime = n;
                }}
              />
            </label>
            <label>
              Velocidade
              <select
                defaultValue="1"
                onChange={(e) => {
                  if (video.current)
                    video.current.playbackRate = Number(e.target.value);
                }}
              >
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((v) => (
                  <option key={v} value={v}>
                    {v}×
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Card>
        <Card title="Antes da decisão">
          <p>Pausa antes do contacto. O que sabias neste momento?</p>
          <textarea
            placeholder="Informação disponível, apoio, utilidade e plano…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            className="primary"
            disabled={!active || !note.trim()}
            onClick={() => {
              p.setState((s) => ({
                ...s,
                notes: [
                  ...s.notes,
                  { id: uid(), mediaId: active!.id, time, text: note.trim() },
                ],
              }));
              setNote("");
            }}
          >
            Guardar nota · {formatTime(time)}
          </button>
          <button onClick={() => p.go("16:867")}>Rever com ECHO ↗</button>
          <p className="muted">
            O replay 2D só pode representar posições registadas. Não inferimos
            coordenadas a partir de um screenshot.
          </p>
        </Card>
      </div>
      <div className="two-col">
        <Card title="Momentos guardados">
          {p.state.notes
            .filter((n) => n.mediaId === active?.id)
            .map((n) => (
              <div className="note" key={n.id}>
                <button
                  onClick={() => {
                    if (video.current) video.current.currentTime = n.time;
                  }}
                >
                  {formatTime(n.time)}
                </button>
                <p>{n.text}</p>
                <button
                  aria-label="Apagar nota"
                  onClick={() =>
                    p.setState((s) => ({
                      ...s,
                      notes: s.notes.filter((x) => x.id !== n.id),
                    }))
                  }
                >
                  ×
                </button>
              </div>
            ))}
        </Card>
        <Card title="Exportar clip">
          <div className="two-col">
            <label>
              Início (s)
              <input
                type="number"
                min="0"
                value={start}
                onChange={(e) => setStart(Number(e.target.value))}
              />
            </label>
            <label>
              Fim (s)
              <input
                type="number"
                min="0"
                value={end}
                onChange={(e) => setEnd(Number(e.target.value))}
              />
            </label>
          </div>
          <button
            disabled={busy || !active}
            className="primary"
            onClick={exportClip}
          >
            {busy ? "A exportar…" : "Exportar MP4"}
          </button>
          <p className="muted">
            Exportação local na app desktop. O ficheiro original é preservado.
          </p>
        </Card>
      </div>
    </>
  );
}
function Training(p: Props) {
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("all"),
    [seconds, setSeconds] = useState(0),
    [running, setRunning] = useState(false),
    [active, setActive] = useState(
      p.route.startsWith("105:") ? p.route : p.state.plan[0] || drills[0].id,
    ),
    [reflection, setReflection] = useState("");
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (!running) {
      last.current = null;
      return;
    }
    last.current = Date.now();
    const t = setInterval(() => {
      const current = Date.now();
      const delta = Math.floor((current - (last.current || current)) / 1000);
      if (delta) {
        setSeconds((n) => n + delta);
        last.current = current;
      }
    }, 250);
    return () => clearInterval(t);
  }, [running]);
  const group = (index: number) =>
    index < 14
      ? "Mira"
      : index < 23
        ? "Coordenação"
        : index < 30
          ? "Utilidade"
          : "Rotina";
  const list = drills.filter(
    (d, i) =>
      d.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "all" || group(i) === category),
  );
  function add(id: string) {
    p.setState((s) => ({ ...s, plan: [...new Set([...s.plan, id])] }));
    p.notify("Exercício adicionado ao plano.");
  }
  function finish() {
    if (seconds < 1) return p.notify("Inicia o cronómetro antes de concluir.");
    p.setState((s) => ({
      ...s,
      sessions: [
        ...s.sessions,
        { id: uid(), exercise: active, seconds, at: now(), reflection },
      ],
    }));
    setRunning(false);
    setSeconds(0);
    setReflection("");
    p.notify(
      "Sessão guardada. A conclusão é um registo teu, não uma medida automática de melhoria.",
    );
  }
  return (
    <>
      <div className="two-col">
        <Card title="Plano pessoal">
          {p.state.plan.length ? (
            p.state.plan.map((id) => (
              <div className="plan-row" key={id}>
                <button
                  onClick={() => {
                    setActive(id);
                    setSeconds(0);
                    setRunning(false);
                  }}
                >
                  {drills.find((d) => d.id === id)?.name || id}
                </button>
                <button
                  aria-label="Remover exercício"
                  onClick={() =>
                    p.setState((s) => ({
                      ...s,
                      plan: s.plan.filter((x) => x !== id),
                    }))
                  }
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <Empty>Adiciona um exercício da biblioteca.</Empty>
          )}
        </Card>
        <Card title="Sessão de treino">
          <select
            aria-label="Exercício da sessão"
            value={active}
            disabled={running}
            onChange={(e) => {
              setActive(e.target.value);
              setSeconds(0);
            }}
          >
            {drills.map((d) => (
              <option value={d.id} key={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <strong className="timer">{formatTime(seconds)}</strong>
          <p>
            Define um objetivo observável. Pratica com intenção e regista o que
            conseguiste repetir.
          </p>
          <div className="toolbar">
            <button className="primary" onClick={() => setRunning((v) => !v)}>
              {running ? "Pausar" : "Iniciar"}
            </button>
            <button
              onClick={() => {
                setRunning(false);
                setSeconds(0);
              }}
            >
              Reiniciar
            </button>
            <button onClick={finish}>Concluir sessão</button>
          </div>
          <textarea
            aria-label="Reflexão de treino"
            placeholder="O que funcionou? O que vais testar na próxima partida?"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          />
        </Card>
      </div>
      <div className="two-col">
        {(
          (
            designContent as Record<string, { title: string; text: string[] }[]>
          )[active] || []
        ).map((section) => (
          <Card key={section.title} title={section.title}>
            {section.text
              .filter((t) => t !== section.title)
              .map((t, i) => (
                <p key={i}>{t}</p>
              ))}
          </Card>
        ))}
      </div>
      <Card title="Biblioteca de treino">
        <div className="toolbar">
          <input
            placeholder="Pesquisar exercícios…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            aria-label="Área de treino"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {["all", "Mira", "Coordenação", "Utilidade", "Rotina"].map((s) => (
              <option value={s} key={s}>
                {s === "all" ? "Todas as áreas" : s}
              </option>
            ))}
          </select>
          <span>{list.length} exercícios</span>
        </div>
        <div className="drill-grid">
          {list.map((d) => (
            <article className="drill" key={d.id}>
              <p className="eyebrow">{group(drills.indexOf(d))}</p>
              <h3>{d.name.replace(/^Exercício \d+ \/ /, "")}</h3>
              <div className="toolbar">
                <button onClick={() => add(d.id)}>Adicionar ao plano</button>
                <button
                  onClick={() => {
                    setActive(d.id);
                    p.go(d.id);
                  }}
                >
                  Abrir ↗
                </button>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </>
  );
}
function Progress(p: Props) {
  const s = stats(p.state.matches),
    total = p.state.sessions.reduce((n, s) => n + s.seconds, 0);
  const half = Math.floor(p.state.matches.length / 2),
    before = stats(p.state.matches.slice(half)),
    after = stats(p.state.matches.slice(0, half));
  return (
    <>
      <div className="metrics">
        {[
          ["SESSÕES", p.state.sessions.length],
          ["TEMPO DE TREINO", formatTime(total)],
          ["PARTIDAS", s.count],
          ["VITÓRIAS", s.winrate === null ? "—" : s.winrate + "%"],
        ].map(([k, v]) => (
          <Card key={k}>
            <p className="eyebrow">{k}</p>
            <strong className="number">{v}</strong>
          </Card>
        ))}
      </div>
      <Card title="Transferência para partidas">
        <p>
          Compara duas metades do teu histórico. Diferenças de mapa, adversários
          e função podem explicar a variação.
        </p>
        {half > 0 ? (
          <div className="two-col">
            <div>
              <h3>Antes · {before.count} partidas</h3>
              <p>
                Vitórias: {before.winrate}% · K/D: {before.kd ?? "—"}
              </p>
            </div>
            <div>
              <h3>Depois · {after.count} partidas</h3>
              <p>
                Vitórias: {after.winrate}% · K/D: {after.kd ?? "—"}
              </p>
            </div>
          </div>
        ) : (
          <Empty>Importa pelo menos duas partidas para comparar.</Empty>
        )}
        <p className="muted">
          Esta comparação não prova que o treino causou uma melhoria. O ECHO
          Score não é calculado sem uma população de referência validada.
        </p>
      </Card>
      <Card title="Histórico de treino">
        {p.state.sessions.length ? (
          <table>
            <thead>
              <tr>
                <th>Exercício</th>
                <th>Duração</th>
                <th>Data</th>
                <th>Reflexão</th>
              </tr>
            </thead>
            <tbody>
              {[...p.state.sessions].reverse().map((s) => (
                <tr key={s.id}>
                  <td>{drills.find((d) => d.id === s.exercise)?.name}</td>
                  <td>{formatTime(s.seconds)}</td>
                  <td>{new Date(s.at).toLocaleDateString("pt-PT")}</td>
                  <td>{s.reflection || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty>As sessões concluídas aparecem aqui.</Empty>
        )}
        <button
          onClick={() =>
            downloadJSON(p.state.sessions, "echo-relatorio-treino.json")
          }
        >
          Exportar relatório
        </button>
      </Card>
    </>
  );
}
function Coach(p: Props) {
  const [activeId, setActiveId] = useState(p.state.conversations[0].id),
    [question, setQuestion] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [consent, setConsent] = useState(false),
    [frame, setFrame] = useState<string | null>(null);
  const conversation =
    p.state.conversations.find((c) => c.id === activeId) ||
    p.state.conversations[0];
  async function send() {
    if (!question.trim() || busy) return;
    if (!consent)
      return setError(
        "Confirma o envio desta mensagem e contexto ao fornecedor de IA.",
      );
    const text = question.trim(),
      cid = conversation.id;
    setBusy(true);
    setError("");
    p.setState((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.id === cid
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: uid(), role: "user", text, at: now() },
              ],
            }
          : c,
      ),
    }));
    setQuestion("");
    try {
      const response = await call("ai:ask", {
        question: text,
        history: conversation.messages.map((m) => ({
          role: m.role,
          text: m.text,
        })),
        context: {
          statistics: stats(p.state.matches),
          recentMatches: p.state.matches.slice(0, 5),
          notes: p.state.notes.slice(-5),
          corrections: p.state.corrections.slice(-3),
        },
        frames: frame ? [frame] : [],
      });
      p.setState((s) => ({
        ...s,
        conversations: s.conversations.map((c) =>
          c.id === cid
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: uid(),
                    role: "assistant",
                    text: response.text,
                    at: response.at,
                    model: response.model,
                  },
                ],
              }
            : c,
        ),
      }));
      setFrame(null);
    } catch (e) {
      setError((e as Error).message);
      setQuestion(text);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="chat-grid">
      <Card title="Conversas">
        <button
          className="primary"
          onClick={() => {
            const id = uid();
            p.setState((s) => ({
              ...s,
              conversations: [
                ...s.conversations,
                { id, name: "Nova conversa", messages: [] },
              ],
            }));
            setActiveId(id);
          }}
        >
          + Nova conversa
        </button>
        {p.state.conversations.map((c) => (
          <button
            className={c.id === conversation.id ? "selected" : ""}
            key={c.id}
            onClick={() => setActiveId(c.id)}
          >
            {c.name}
          </button>
        ))}
        <label>
          Nome da conversa
          <input
            value={conversation.name}
            onChange={(e) =>
              p.setState((s) => ({
                ...s,
                conversations: s.conversations.map((c) =>
                  c.id === conversation.id ? { ...c, name: e.target.value } : c,
                ),
              }))
            }
          />
        </label>
        <button
          onClick={() => {
            if (!confirm("Apagar esta conversa do dispositivo?")) return;
            p.setState((s) => ({
              ...s,
              conversations:
                s.conversations.length === 1
                  ? [{ id: uid(), name: "Nova conversa", messages: [] }]
                  : s.conversations.filter((c) => c.id !== conversation.id),
            }));
          }}
        >
          Apagar conversa
        </button>
        <button
          onClick={() => downloadJSON(conversation, "echo-conversa.json")}
        >
          Exportar conversa
        </button>
      </Card>
      <Card title="Conhece o teu jogo.">
        <div className="messages" aria-live="polite">
          {conversation.messages.length ? (
            conversation.messages.map((m) => (
              <article className={"message " + m.role} key={m.id}>
                <p className="eyebrow">
                  {m.role === "user" ? "TU" : "ECHO"}
                  {m.model ? " · " + m.model : ""}
                </p>
                <p>{m.text}</p>
              </article>
            ))
          ) : (
            <Empty>
              Faz uma pergunta sobre uma decisão. A IA só recebe o contexto que
              autorizas; não vê a tua partida automaticamente.
            </Empty>
          )}
          {busy && <p>A analisar o contexto enviado…</p>}
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <textarea
          aria-label="Mensagem para ECHO"
          placeholder="Pergunta ao ECHO…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send();
          }}
        />
        <div className="toolbar">
          <label className="file-button">
            Anexar frame
            <input
              type="file"
              accept="image/png,image/jpeg"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 2e6)
                  return setError("Escolhe uma imagem até 2 MB.");
                const r = new FileReader();
                r.onload = () => setFrame(String(r.result));
                r.readAsDataURL(f);
              }}
            />
          </label>
          {frame && (
            <>
              <img className="frame-preview" src={frame} alt="Frame a enviar" />
              <button onClick={() => setFrame(null)}>Remover</button>
            </>
          )}
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          Enviar esta conversa, até 5 partidas/notas e o frame anexado à OpenAI
          para análise.
        </label>
        <button
          className="primary"
          disabled={busy || !question.trim() || !consent}
          onClick={send}
        >
          {busy ? "A analisar…" : "Enviar"}
        </button>
      </Card>
      <Card title="Contexto e confiança">
        <p>
          {p.state.matches.length} partidas · {p.state.notes.length} notas ·{" "}
          {p.state.corrections.length} correções locais.
        </p>
        <p>
          Um frame não permite medir timings ou ouvir a comunicação. As
          interpretações devem ser confirmadas no vídeo.
        </p>
        <button onClick={() => p.go("134:39458")}>Ver fontes e limites</button>
        <button onClick={() => p.go("134:39210")}>Corrigir uma análise</button>
        <button onClick={() => p.go("16:1252")}>Configurar IA</button>
      </Card>
    </div>
  );
}
function Correction(p: Props) {
  const [reason, setReason] = useState("Falta contexto da equipa"),
    [context, setContext] = useState("");
  return (
    <div className="two-col">
      <Card title="O teu contexto pode mudar a análise.">
        <label>
          Motivo
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            {[
              "Falta contexto da equipa",
              "Evento identificado incorretamente",
              "Interpretação tática discutível",
              "Outro",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          O que faltou?
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Explica o plano e o que aconteceu…"
          />
        </label>
        <button
          className="primary"
          disabled={!context.trim()}
          onClick={() => {
            p.setState((s) => ({
              ...s,
              corrections: [
                ...s.corrections,
                { id: uid(), reason, context, at: now() },
              ],
            }));
            setContext("");
            p.notify(
              "Correção guardada. Será incluída como relato na próxima pergunta à IA.",
            );
          }}
        >
          Guardar correção
        </button>
      </Card>
      <Card title="Correções guardadas">
        {p.state.corrections.map((c) => (
          <article key={c.id}>
            <h3>{c.reason}</h3>
            <p>{c.context}</p>
            <small>{new Date(c.at).toLocaleString("pt-PT")}</small>
          </article>
        ))}
      </Card>
    </div>
  );
}
function Sources(p: Props) {
  return (
    <>
      <div className="two-col">
        <Card title="Estatísticas e vídeo">
          <p>Partidas: {p.state.matches.length} importadas.</p>
          <p>Vídeos: {p.media.length} ficheiros selecionados por ti.</p>
          <p>
            Notas e correções são relatos do utilizador. A IA recebe apenas o
            contexto autorizado ao enviar.
          </p>
        </Card>
        <Card title="Conhecimento por versão">
          <p>Patch do conteúdo: por confirmar.</p>
          <p>
            Recomendações de habilidades e mapas precisam de validação para a
            versão da partida.
          </p>
          <p>
            Não existe uma avaliação independente de precisão deste modelo
            integrada na app.
          </p>
        </Card>
      </div>
      <Card title="Como interpretar confiança">
        <p>
          As estatísticas calculadas são separadas das interpretações do coach.
          Não mostramos percentagens de confiança sem calibração. Sem contexto
          suficiente, a IA deve indicar o que falta.
        </p>
        <p>
          O ECHO Score do design é demonstrativo. A app não inventa percentis ou
          populações de comparação.
        </p>
        <button onClick={() => p.go("16:867")}>Voltar ao coach</button>
      </Card>
    </>
  );
}
function Maps(p: Props) {
  const [name, setName] = useState("Entrada A"),
    [agent, setAgent] = useState("Viper"),
    [markers, setMarkers] = useState<{ x: number; y: number }[]>([]),
    [active, setActive] = useState<string | null>(null);
  return (
    <>
      <div className="two-col">
        <Card title="Editor de setups · Ascent">
          <p className="muted">
            Esquema de planeamento. Não valida geometria, alcance, combustível
            nem patch.
          </p>
          <div
            className="tactical-map"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setMarkers((m) => [
                ...m,
                {
                  x: (e.clientX - r.left) / r.width,
                  y: (e.clientY - r.top) / r.height,
                },
              ]);
            }}
          >
            <img
              src={assetMap["14-626"].imgImageMapAscentMini}
              alt="Minimapa Ascent do design"
            />
            {markers.map((m, i) => (
              <button
                key={i}
                className="smoke-marker"
                aria-label={"Remover marcador " + (i + 1)}
                style={{ left: m.x * 100 + "%", top: m.y * 100 + "%" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setMarkers((s) => s.filter((_, j) => i !== j));
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <p>
            Clica para adicionar um marcador; clica no marcador para o remover.
          </p>
        </Card>
        <Card title="Guardar e rever">
          <label>
            Nome
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Agente
            <select value={agent} onChange={(e) => setAgent(e.target.value)}>
              {["Viper", "Omen", "Brimstone", "Clove", "Astra", "Harbor"].map(
                (a) => (
                  <option key={a}>{a}</option>
                ),
              )}
            </select>
          </label>
          <button
            className="primary"
            disabled={!name.trim() || !markers.length}
            onClick={() => {
              const setup = {
                id: active || uid(),
                name,
                map: "Ascent",
                agent,
                markers,
              };
              p.setState((s) => ({
                ...s,
                setups: [...s.setups.filter((x) => x.id !== setup.id), setup],
              }));
              setActive(setup.id);
              p.notify("Setup guardado localmente.");
            }}
          >
            Guardar setup
          </button>
          <button
            onClick={() => {
              setMarkers([]);
              setActive(null);
            }}
          >
            Novo setup
          </button>
          <button
            onClick={() =>
              downloadJSON(
                { name, map: "Ascent", agent, markers },
                "echo-setup.json",
              )
            }
          >
            Exportar JSON
          </button>
          <h3>Biblioteca</h3>
          {p.state.setups.map((s) => (
            <div className="plan-row" key={s.id}>
              <button
                onClick={() => {
                  setActive(s.id);
                  setName(s.name);
                  setAgent(s.agent);
                  setMarkers(s.markers);
                }}
              >
                {s.name} · {s.agent}
              </button>
              <button
                aria-label="Apagar setup"
                onClick={() => {
                  p.setState((v) => ({
                    ...v,
                    setups: v.setups.filter((x) => x.id !== s.id),
                  }));
                  if (active === s.id) {
                    setActive(null);
                    setMarkers([]);
                  }
                }}
              >
                ×
              </button>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
import assetMap from "./assets.json";
const agents = inventory.filter((s) =>
  s.name.includes("Perfil completo / Prototype"),
);
function Agents(p: Props) {
  const [search, setSearch] = useState("");
  const selected = agents.find((s) => s.id === p.route);
  return (
    <>
      <div className="toolbar">
        <input
          placeholder="Pesquisar agentes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => p.go("14:757")}>Todos os agentes</button>
      </div>
      {selected && (
        <Card title={selected.name.split(" · ")[0]}>
          <p>
            Escolhe um foco de treino e revê as tuas partidas neste agente. Os
            dados demonstrativos do perfil Figma não são apresentados como
            estatísticas tuas.
          </p>
          <MatchRows
            {...p}
            matches={p.state.matches.filter(
              (m) =>
                m.agent.toLowerCase() ===
                selected.name.split(" · ")[0].toLowerCase(),
            )}
          />
          <button onClick={() => p.go("15:1052")}>Escolher treino</button>
          <button onClick={() => p.setState((s) => ({ ...s, demo: true }))}>
            Consultar perfil visual completo
          </button>
        </Card>
      )}
      {selected && (
        <div className="two-col">
          {(
            (
              designContent as Record<
                string,
                { title: string; text: string[] }[]
              >
            )[selected.id] || []
          ).map((section) => (
            <Card key={section.title} title={section.title}>
              {section.text.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </Card>
          ))}
        </div>
      )}
      <div className="agent-grid">
        {agents
          .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
          .map((a) => {
            const i = agents.indexOf(a),
              art = (assetMap["14-757"] as Record<string, string>)[
                "imgArtwork" + (i || "")
              ];
            return (
              <button
                className="agent-tile"
                key={a.id}
                onClick={() => p.go(a.id)}
              >
                {art && <img src={art} alt="" />}
                <h2>{a.name.split(" · ")[0]}</h2>
                <span>Abrir perfil ↗</span>
              </button>
            );
          })}
      </div>
    </>
  );
}
const terms: Record<string, string> = {
  Trade:
    "Eliminar rapidamente o adversário que eliminou o teu colega, conforme a posição e a oportunidade.",
  "K/D":
    "Rácio entre eliminações e mortes. Sem mortes, o rácio não é definido.",
  KAST: "Percentagem de rondas com kill, assist, sobrevivência ou morte trocada. Precisa de eventos por ronda.",
  ACS: "Pontuação média de combate disponibilizada pelo jogo. Não mede todas as decisões.",
  Eco: "Ronda com investimento reduzido para preservar economia futura.",
  Retake: "Recuperar o site depois da colocação da spike.",
  Default:
    "Distribuição inicial para obter informação e controlar áreas antes de executar um plano.",
  "Crosshair placement":
    "Posicionamento da mira em relação ao contacto esperado.",
  Recon: "Utilidade para obter informação sobre o adversário.",
  Clutch: "Situação em que és o último jogador vivo da tua equipa.",
  Lineup: "Posição e orientação preparadas para usar uma habilidade.",
  "Primeiro contacto":
    "Primeira interação relevante com o adversário; o contexto determina a decisão.",
};
function Glossary() {
  const [query, setQuery] = useState("");
  return (
    <>
      <input
        placeholder="Pesquisar conceito…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="two-col">
        {Object.entries(terms)
          .filter(([k, v]) =>
            (k + v).toLowerCase().includes(query.toLowerCase()),
          )
          .map(([k, v]) => (
            <Card key={k} title={k}>
              <p>{v}</p>
            </Card>
          ))}
      </div>
    </>
  );
}
function Search(p: Props) {
  const [query, setQuery] = useState("");
  return (
    <Card title="Pesquisa global">
      <input
        autoFocus
        placeholder="Agentes, exercícios, definições…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="screen-list">
        {inventory
          .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
          .map((s) => (
            <button key={s.id} onClick={() => p.go(s.id)}>
              {s.name}
            </button>
          ))}
      </div>
    </Card>
  );
}
function Onboarding(p: Props) {
  return (
    <>
      <Card title="Bem-vindo ao teu espaço de treino.">
        <p>
          Os teus dados ficam neste dispositivo. Importa partidas e vídeos para
          começar; configura a IA quando quiseres enviar contexto para análise.
        </p>
        <div className="toolbar">
          <button onClick={() => p.go("12:172")}>1 · Importar partidas</button>
          <button onClick={() => p.go("13:302")}>2 · Importar VOD</button>
          <button onClick={() => p.go("16:1252")}>
            3 · Configurar integrações
          </button>
          <button
            className="primary"
            onClick={() => {
              p.setState((s) => ({ ...s, onboarded: true }));
              p.go("12:2");
            }}
          >
            Entrar na ECHO ↗
          </button>
        </div>
      </Card>
      <Sources {...p} />
    </>
  );
}
function Settings(p: Props) {
  const [status, setStatus] = useState({
      ai: false,
      riot: false,
      model: "gpt-4.1-mini",
      platform: "",
    }),
    [key, setKey] = useState(""),
    [riotKey, setRiotKey] = useState(""),
    [model, setModel] = useState("gpt-4.1-mini"),
    [puuid, setPuuid] = useState(""),
    [region, setRegion] = useState("eu"),
    [busy, setBusy] = useState(false),
    [sources, setSources] = useState<any[]>([]),
    [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null),
    streamRef = useRef<MediaStream | null>(null);
  const setSetting = (value: Partial<State["settings"]>) =>
    p.setState((s) => ({ ...s, settings: { ...s.settings, ...value } }));
  useEffect(() => {
    if (desktop)
      call("integration:status")
        .then((s) => {
          setStatus(s);
          setModel(s.model);
        })
        .catch((e) => p.notify(e.message));
    return () => {
      if (recorder.current?.state === "recording") recorder.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  async function saveKeys() {
    try {
      const payload: any = { model };
      if (key) payload.aiKey = key;
      if (riotKey) payload.riotKey = riotKey;
      await call("integration:save", payload);
      setKey("");
      setRiotKey("");
      setStatus(await call("integration:status"));
      p.notify("Integrações guardadas no cofre do sistema.");
    } catch (e) {
      p.notify((e as Error).message);
    }
  }
  async function sync() {
    setBusy(true);
    try {
      const data = await call("riot:matches", { puuid, region });
      const matches = importMatches(data);
      p.setState((s) => ({ ...s, matches: mergeMatches(s.matches, matches) }));
      p.notify(`${matches.length} partidas sincronizadas.`);
    } catch (e) {
      p.notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function startCapture(source: string) {
    setSources([]);
    try {
      await call("capture:select", source);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: false,
      });
      streamRef.current = stream;
      const rid = await call("capture:start");
      const rec = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8",
      });
      recorder.current = rec;
      let chain = Promise.resolve(),
        failed = false;
      rec.ondataavailable = (e) => {
        if (e.data.size)
          chain = chain
            .then(async () => {
              await call(
                "capture:chunk",
                rid,
                new Uint8Array(await e.data.arrayBuffer()),
              );
            })
            .catch((err) => {
              failed = true;
              p.notify("Erro ao guardar gravação: " + err.message);
              if (rec.state === "recording") rec.stop();
            });
      };
      rec.onstop = async () => {
        setRecording(false);
        stream.getTracks().forEach((t) => t.stop());
        try {
          await chain;
          const m = await call("capture:stop", rid);
          p.setMedia((v) => [...v, m]);
          p.notify(
            failed
              ? "Gravação parcial guardada."
              : "Gravação guardada. Abre Partida / VOD para rever.",
          );
        } catch (e) {
          p.notify((e as Error).message);
        }
      };
      stream.getVideoTracks()[0].onended = () => {
        if (rec.state === "recording") rec.stop();
      };
      rec.start(2000);
      setRecording(true);
    } catch (e) {
      p.notify((e as Error).message);
    }
  }
  return (
    <>
      <div className="two-col">
        <Card title="Aparência e conta">
          <label>
            Nome
            <input
              value={p.state.settings.player}
              onChange={(e) => setSetting({ player: e.target.value })}
            />
          </label>
          <label>
            Tag
            <input
              value={p.state.settings.tag}
              onChange={(e) => setSetting({ tag: e.target.value })}
            />
          </label>
          <label>
            Tema
            <select
              value={p.state.settings.theme}
              onChange={(e) =>
                setSetting({ theme: e.target.value as "dark" | "light" })
              }
            >
              <option value="dark">Noite</option>
              <option value="light">Dia</option>
            </select>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={p.state.settings.reducedMotion}
              onChange={(e) => setSetting({ reducedMotion: e.target.checked })}
            />
            Reduzir movimento
          </label>
          <p className="muted">
            Preferências guardadas automaticamente. A tradução funcional
            completa para inglês está pendente.
          </p>
        </Card>
        <Card title="IA · Integração">
          <p>
            Estado: {status.ai ? "Configurada" : "Sem chave"}. A chave fica
            cifrada no cofre do sistema; não é enviada para o repositório.
          </p>
          <label>
            Chave OpenAI
            <input
              type="password"
              autoComplete="off"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={status.ai ? "Introduzir para substituir" : "sk-…"}
            />
          </label>
          <label>
            Modelo
            <input value={model} onChange={(e) => setModel(e.target.value)} />
          </label>
          <button className="primary" onClick={saveKeys}>
            Guardar integração
          </button>
          <button
            onClick={async () => {
              try {
                await call("integration:save", { aiKey: "" });
                setStatus((s) => ({ ...s, ai: false }));
                p.notify("Chave removida.");
              } catch (e) {
                p.notify((e as Error).message);
              }
            }}
          >
            Remover chave
          </button>
          <p className="muted">
            Chamadas à API são cobradas pela tua conta do fornecedor. A app pede
            consentimento antes de enviar contexto.
          </p>
        </Card>
      </div>
      <Card title="Dados Riot · acesso aprovado">
        <p>
          Para sincronizar é necessária uma chave de produção autorizada e o
          PUUID de um jogador que tenha dado consentimento. O login RSO público
          depende da aprovação e de um backend de autenticação.
        </p>
        <div className="two-col">
          <label>
            Chave Riot
            <input
              type="password"
              value={riotKey}
              onChange={(e) => setRiotKey(e.target.value)}
              placeholder={status.riot ? "Configurada · substituir" : "RGAPI-…"}
            />
          </label>
          <label>
            PUUID
            <input value={puuid} onChange={(e) => setPuuid(e.target.value)} />
          </label>
        </div>
        <div className="toolbar">
          <select
            aria-label="Região Riot"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            {["eu", "na", "ap", "kr", "br", "latam"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <button onClick={saveKeys}>Guardar chave</button>
          <button disabled={busy || !puuid} className="primary" onClick={sync}>
            {busy ? "A sincronizar…" : "Sincronizar partidas"}
          </button>
        </div>
      </Card>
      <Card title="Gravação local">
        <p>
          Escolhe explicitamente o ecrã ou janela a gravar. Captura de vídeo a
          30 FPS, sem áudio. No macOS, permite Gravação do ecrã nas definições
          do sistema.
        </p>
        <button
          className={recording ? "danger" : "primary"}
          onClick={async () => {
            if (recording) {
              recorder.current?.stop();
              return;
            }
            try {
              setSources(await call("capture:sources"));
            } catch (e) {
              p.notify((e as Error).message);
            }
          }}
        >
          {recording ? "Parar e guardar gravação" : "Escolher ecrã para gravar"}
        </button>
        {recording && (
          <p role="status">
            ● Gravação em curso. Mantém este ecrã aberto até parar.
          </p>
        )}
        <div className="source-grid">
          {sources.map((s) => (
            <button key={s.id} onClick={() => startCapture(s.id)}>
              <img src={s.thumbnail} alt="" />
              {s.name}
            </button>
          ))}
        </div>
      </Card>
      <Card title="Dados e privacidade">
        <div className="toolbar">
          <button
            onClick={async () => {
              try {
                if (desktop) await call("data:export", p.state);
                else downloadJSON(p.state);
              } catch (e) {
                p.notify((e as Error).message);
              }
            }}
          >
            Exportar dados locais
          </button>
          <button
            className="danger"
            onClick={async () => {
              if (
                !confirm(
                  "Apagar os registos locais e as chaves? Os vídeos originais não serão apagados.",
                )
              )
                return;
              try {
                if (desktop) await call("data:clear");
                p.setState(structuredClone(initialState));
                p.setMedia([]);
                p.notify(
                  "Registos e chaves removidos. Os ficheiros de vídeo permanecem no disco.",
                );
              } catch (e) {
                p.notify((e as Error).message);
              }
            }}
          >
            Apagar dados e chaves
          </button>
        </div>
      </Card>
    </>
  );
}
