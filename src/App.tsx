import { useMotion, navigateWithMotion } from "./motion";
import { type Review } from "./video";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { createPortal } from "react-dom";
import inventory from "../design/screens.json";
import manifest from "./manifest.json";
import actions from "../design/actions.json";
import { initialState, type State, hydrate } from "./model";
import { call, desktop, loadState, saveState, type Media } from "./bridge";
import { Workspace } from "./Workspace";
const modules = import.meta.glob("./screens/*.tsx");
const views: Record<string, ComponentType> = {};
for (const s of manifest)
  views[s.id] = lazy(modules["./screens/" + s.file] as any);
const nav = [
  ["Início", "12:2"],
  ["Partidas", "12:172"],
  ["Mapas", "14:353"],
  ["Agentes", "14:757"],
  ["Progresso", "15:601"],
  ["Treino", "15:901"],
  ["ECHO", "16:867"],
];
const labelRoutes: Record<string, string> = {
  Início: "12:2",
  Home: "12:2",
  Partidas: "12:172",
  Matches: "12:172",
  Mapas: "14:353",
  Maps: "14:353",
  Agentes: "14:757",
  Agents: "14:757",
  Progresso: "15:601",
  Progress: "15:601",
  Treino: "15:901",
  Training: "15:901",
  ECHO: "16:867",
  Glossário: "16:1122",
  Sistema: "16:1252",
  Definições: "16:1400",
  Aparência: "16:1400",
  Gravação: "16:1513",
  "Conta e privacidade": "91:46",
  Biblioteca: "15:1052",
  "Plano pessoal": "15:901",
  VOD: "13:302",
  Placar: "13:520",
  "Replay 2D": "13:741",
  Economia: "13:929",
  Rondas: "24:1859",
  "Ver todas": "12:172",
  Fontes: "134:39458",
};
export default function App() {
  const [state, setState] = useState<State>(structuredClone(initialState)),
    [ready, setReady] = useState(false),
    [route, setRoute] = useState(
      decodeURIComponent(location.hash.slice(1)) || "12:2",
    ),
    [overlay, setOverlay] = useState<string | null>(null),
    [gallery, setGallery] = useState(false),
    [query, setQuery] = useState(""),
    [toast, setToast] = useState(""),
    [media, setMedia] = useState<Media[]>([]),
    [portal, setPortal] = useState<Element | null>(null),
    [width, setWidth] = useState(innerWidth),
    [loaded, setLoaded] = useState(0);
  const [review, setReview] = useState<Review | null>(null);
  useMotion(state.settings.reducedMotion);
  const navigationSequence = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = inventory.find((s) => s.id === route) || inventory[0],
    Screen = views[selected.id];
  const scale = Math.min(1, width / 1440);
  const notify = useCallback((text: string) => {
    setToast(text);
  }, []);
  useEffect(() => {
    let active = true;
    loadState()
      .then((s) => {
        if (active) {
          setState(s);
          setReady(true);
        }
      })
      .catch((e) => {
        notify(e.message);
        setReady(true);
      });
    if (desktop)
      call("media:list")
        .then((v) => active && setMedia(v))
        .catch((e) => notify(e.message));
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(
      () =>
        saveState(state).catch((e) =>
          notify("Não foi possível guardar: " + e.message),
        ),
      200,
    );
    return () => clearTimeout(t);
  }, [state, ready]);
  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme;
  }, [state.settings]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const onHash = () => {
      setRoute(decodeURIComponent(location.hash.slice(1)) || "12:2");
      setOverlay(null);
      window.scrollTo(0, 0);
    };
    const onResize = () => setWidth(innerWidth);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  const go = useCallback(async (id: string) => {
    if (!inventory.some((s) => s.id === id)) {
      notify("Este destino não está disponível.");
      return;
    }
    const sequence = ++navigationSequence.current;
    const file = manifest.find((s) => s.id === id)?.file;
    if (file)
      try {
        const loadedModule = (await modules["./screens/" + file]()) as {
          default: ComponentType;
        };
        views[id] = loadedModule.default;
      } catch {
        notify("Não foi possível abrir este ecrã.");
        return;
      }
    if (sequence !== navigationSequence.current) return;
    navigateWithMotion(() => {
      setGallery(false);
      setOverlay(null);
      setRoute(id);
      location.hash = encodeURIComponent(id);
      window.scrollTo(0, 0);
    });
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOverlay(null);
        setGallery(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setGallery((v) => !v);
      }
      if (e.altKey && /^[1-7]$/.test(e.key)) {
        e.preventDefault();
        go(nav[Number(e.key) - 1][1]);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [go]);
  useLayoutEffect(() => {
    const root = rootRef.current;
    const content =
      !state.demo && root?.querySelector(`[data-node-id="${route}"]`)
        ? root.querySelector('[data-name="Conteúdo"]') ||
          root.querySelector('[data-name="Content"]')
        : null;
    setPortal(content || null);
  }, [route, state.demo, loaded]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const map = (actions as Record<string, string[][]>)[route] || [];
    const actionable = new Set(map.map((x) => x[0]));
    const update = () => {
      root.querySelectorAll<HTMLElement>("[data-node-id]").forEach((el) => {
        const name = el.dataset.name || "";
        if (
          actionable.has(el.dataset.nodeId || "") ||
          /button|Tab \/|Ação|Menu da conta/.test(name)
        ) {
          el.setAttribute("role", "button");
          el.tabIndex = 0;
        }
      });
    };
    update();
    const obs = new MutationObserver(update);
    obs.observe(root, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [route, loaded]);
  function click(e: React.MouseEvent | React.KeyboardEvent, screenId = route) {
    if ((e.target as HTMLElement).closest(".live-content")) return;
    const target = e.target as HTMLElement;
    const chain: HTMLElement[] = [];
    let el: HTMLElement | null = target;
    while (el && el !== rootRef.current) {
      chain.push(el);
      el = el.parentElement;
    }
    const map = (actions as Record<string, string[][]>)[screenId] || [];
    for (const node of chain) {
      const found = map.find((a) => a[0] === node.dataset.nodeId);
      if (found) {
        e.preventDefault();
        const [, type, dest, kind] = found;
        if (type === "BACK") {
          history.back();
          return;
        }
        if (type === "CLOSE") {
          setOverlay(null);
          return;
        }
        if (type === "NODE" && dest) {
          if (kind === "OVERLAY") setOverlay(dest);
          else go(dest);
          return;
        }
      }
    }
    const btn = chain.find(
      (n) => n.getAttribute("role") === "button" || n.tagName === "A",
    );
    if (!btn) return;
    const label = btn.textContent?.trim() || "";
    if (labelRoutes[label]) {
      go(labelRoutes[label]);
      return;
    }
    if (/Menu da conta/.test(btn.dataset.name || "")) {
      go("91:65");
      return;
    }
    if (/Rever|Review/.test(label)) {
      go("13:302");
      return;
    }
    if (/fontes|sources/i.test(label)) {
      go("134:39458");
      return;
    }
    if (/contexto|corrigir/i.test(label)) {
      go("134:39210");
      return;
    }
    if (
      /Iniciar|Começar|Guardar|Enviar|Importar|Exportar|grava|Adiciona|Criar/i.test(
        label,
      )
    ) {
      setState((s) => ({ ...s, demo: false }));
      notify(
        "Modo funcional ativo. Usa os controlos para trabalhar com os teus dados.",
      );
      return;
    }
    notify("Consulta este estado no modo funcional ou no mapa de ecrãs.");
  }
  const workspace = (
    <Workspace
      route={route}
      title={selected.name}
      state={state}
      setState={setState}
      go={go}
      notify={notify}
      media={media}
      setMedia={setMedia}
      review={review}
      setReview={setReview}
    />
  );
  if (!ready) return <div className="loading">A abrir ECHO…</div>;
  const Overlay = overlay ? views[overlay] : null;
  return (
    <>
      <div className="app-tools">
        <span className="mode-badge">
          {state.demo ? "DESIGN · DADOS DE DEMONSTRAÇÃO" : "DADOS LOCAIS"}
        </span>
        <button onClick={() => setState((s) => ({ ...s, demo: !s.demo }))}>
          {state.demo ? "Usar a app" : "Ver design Figma"}
        </button>
        <button onClick={() => setGallery(true)}>Ecrãs ⌘/Ctrl K</button>
        <button
          onClick={() => {
            setState((s) => ({ ...s, demo: false }));
            go("16:1252");
          }}
        >
          Integrações
        </button>
        <span className="save-indicator">
          {desktop ? "Desktop · armazenamento local" : "Pré-visualização web"}
        </span>
      </div>
      <div className="design-viewport" style={{ width: 1440, zoom: scale }}>
        <div
          ref={rootRef}
          data-player={state.settings.player + " #" + state.settings.tag}
          className={"screen " + (!state.demo ? "live" : "")}
          onClick={(e) => click(e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              const t = e.target as HTMLElement;
              if (t.getAttribute("role") === "button") {
                e.preventDefault();
                click(e);
              }
            }
          }}
        >
          {Screen ? (
            <Suspense
              key={route}
              fallback={<div className="loading">A abrir ecrã…</div>}
            >
              <Screen />
              <Loaded key={route} onLoad={() => setLoaded((n) => n + 1)} />
            </Suspense>
          ) : (
            <>
              <header className="native-nav">
                <b>ECHO</b>
                {nav.map(([name, id]) => (
                  <button key={id} onClick={() => go(id)}>
                    {name}
                  </button>
                ))}
              </header>
              <main className="fallback-main">
                <p className="eyebrow">
                  ECHO /{" "}
                  {state.demo ? "ECRÃ EM RECONSTRUÇÃO" : "ESPAÇO PESSOAL"}
                </p>
                {workspace}
              </main>
            </>
          )}
          {Screen && !state.demo && portal
            ? createPortal(
                <div className="live-content">{workspace}</div>,
                portal,
              )
            : null}
          {Screen && !state.demo && !portal ? (
            <div className="fallback-main live-content">{workspace}</div>
          ) : null}
        </div>
      </div>
      {gallery && (
        <div className="modal-shade" onClick={() => setGallery(false)}>
          <section
            className="dialog gallery"
            role="dialog"
            aria-modal="true"
            aria-label="Mapa de ecrãs"
            onClick={(e) => e.stopPropagation()}
          >
            <header>
              <h2>Todos os ecrãs</h2>
              <button onClick={() => setGallery(false)}>Fechar ×</button>
            </header>
            <input
              autoFocus
              placeholder="Pesquisar ecrã, agente ou exercício…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="screen-list">
              {inventory
                .filter((s) =>
                  s.name.toLowerCase().includes(query.toLowerCase()),
                )
                .map((s) => (
                  <button key={s.id} onClick={() => go(s.id)}>
                    <span>{s.name}</span>
                    <small>
                      {views[s.id]
                        ? "Figma importado"
                        : "Comparação visual pendente"}
                    </small>
                  </button>
                ))}
            </div>
          </section>
        </div>
      )}
      {overlay && (
        <div className="modal-shade" onClick={() => setOverlay(null)}>
          <section
            className="figma-modal"
            role="dialog"
            aria-modal="true"
            aria-label={inventory.find((s) => s.id === overlay)?.name}
            onClick={(e) => {
              e.stopPropagation();
              click(e, overlay);
            }}
          >
            <button className="modal-close" onClick={() => setOverlay(null)}>
              Fechar ×
            </button>
            {Overlay ? (
              <Suspense fallback={<p>A abrir…</p>}>
                <Overlay />
              </Suspense>
            ) : (
              <p>Abre o modo funcional para executar esta ação.</p>
            )}
          </section>
        </div>
      )}
      {toast && (
        <div role="status" className="toast" onClick={() => setToast("")}>
          {toast}
        </div>
      )}
    </>
  );
}
function Loaded({ onLoad }: { onLoad: () => void }) {
  const ref = useRef(onLoad);
  useLayoutEffect(() => {
    ref.current();
  }, []);
  return null;
}
