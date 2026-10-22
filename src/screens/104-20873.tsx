// Generated from Figma high-fidelity design context; styled with project CSS.
// @ts-nocheck
type EchoButtonGhostProps = {
  className?: string;
  label?: string;
};
function EchoButtonGhost({
  className,
  label = "Continuar ↗",
}: EchoButtonGhostProps) {
  return (
    <div
      className={
        className ||
        "d507c28c0b d60fbb7713 d9cc776dc4 dd1f2f65a0 d3960ffc24 d86843cf1e dd89972fe1 d4eded280e d71e31b2f1"
      }
      data-node-id="7:6"
      data-name="ECHO/button/ghost"
    >
      <p
        className="d0f92246ac d1ba71920b d2689f3958 d98fbcce75 dd89972fe1 d012fbd121 d4d2392e8e d4531df0ac de82ae8be0"
        data-node-id="7:7"
      >
        {label}
      </p>
    </div>
  );
}
type EchoButtonPrimaryProps = {
  className?: string;
  label?: string;
};
function EchoButtonPrimary({
  className,
  label = "Continuar ↗",
}: EchoButtonPrimaryProps) {
  return (
    <div
      className={
        className ||
        "da6cae6171 d507c28c0b d60fbb7713 d9cc776dc4 dd1f2f65a0 d3960ffc24 d86843cf1e dd89972fe1 d4eded280e d71e31b2f1"
      }
      data-node-id="7:2"
      data-name="ECHO/button/primary"
    >
      <p
        className="d0f92246ac d1ba71920b d2689f3958 d98fbcce75 dd89972fe1 d012fbd121 d4d2392e8e de2fa8e84d de82ae8be0"
        data-node-id="7:3"
      >
        {label}
      </p>
    </div>
  );
}
export default function OverlayCriteriosDaRevisao() {
  return (
    <div
      className="d450aff2f2 dca6bcd4b6 d18fd11b5e dba4c50899 d507c28c0b d60fbb7713 d8dddea077 d78b25a7df d60541e1e2 d04ae36c03 dd89972fe1 d48bd39401"
      data-node-id="104:20873"
      data-name="Overlay / Critérios da revisão"
    >
      <p
        className="d0f92246ac dd392d27fa d0ce2a7f44 ddf289bf82 dd89972fe1 d012fbd121 de4a600588 d4531df0ac d12436b26d"
        data-node-id="104:20874"
      >
        Uma nota com contexto.
      </p>
      <p
        className="d0f92246ac dc6a60f045 d8ecebc9f8 d98fbcce75 dd89972fe1 d012fbd121 d4d2392e8e d4531df0ac d12436b26d"
        data-node-id="104:20875"
      >
        A nota da revisão é uma avaliação qualitativa de 0–10. É diferente do
        ECHO Score de 0–1000.
      </p>
      <p
        className="d0f92246ac d413c3a6f7 de83a7042b d6b319aafd dd89972fe1 d012fbd121 d7984cf1cb d4531df0ac d12436b26d"
        data-node-id="104:20876"
      >
        O que o ECHO avalia
      </p>
      <p
        className="d0f92246ac dc6a60f045 d8ecebc9f8 d98fbcce75 dd89972fe1 d012fbd121 d4d2392e8e d4531df0ac d12436b26d"
        data-node-id="104:20877"
      >
        Decisão e timing · apoio e trocas · uso de utilidade · posicionamento.
        Cada conclusão liga à ronda e à fonte usada.
      </p>
      <p
        className="d0f92246ac d413c3a6f7 de83a7042b d6b319aafd dd89972fe1 d012fbd121 d7984cf1cb d4531df0ac d12436b26d"
        data-node-id="104:20878"
      >
        O que fica incerto
      </p>
      <p
        className="d0f92246ac dc6a60f045 d8ecebc9f8 d98fbcce75 dd89972fe1 d012fbd121 d4d2392e8e d4531df0ac d12436b26d"
        data-node-id="104:20879"
      >
        Sem VOD ou comunicação de equipa, algumas intenções não podem ser
        confirmadas. A análise identifica essas limitações e evita atribuir
        culpa só pelo resultado.
      </p>
      <div
        className="d507c28c0b d345168367 d60fbb7713 d1e06005a8 d60541e1e2 dd89972fe1 d012fbd121 d12436b26d"
        data-node-id="104:20880"
        data-name="Ações"
      >
        <EchoButtonPrimary
          className="da6cae6171 d507c28c0b d60fbb7713 d9cc776dc4 dd1f2f65a0 d3960ffc24 d86843cf1e dd89972fe1 d4eded280e d012fbd121 d44879387c"
          label="Ver no VOD"
        />
        <EchoButtonGhost
          className="d507c28c0b d60fbb7713 d9cc776dc4 dd1f2f65a0 d3960ffc24 d86843cf1e dd89972fe1 d4eded280e d012fbd121 d44879387c"
          label="Fechar"
        />
      </div>
    </div>
  );
}
