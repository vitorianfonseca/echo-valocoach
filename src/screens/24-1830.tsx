// Generated from Figma high-fidelity design context; styled with project CSS.
// @ts-nocheck
const imgImageHeroOmen = "./assets/d045d83c0dc4cd5675c99949.png";
type EchoButtonSecondaryProps = {
  className?: string;
  label?: string;
};
function EchoButtonSecondary({
  className,
  label = "Continuar ↗",
}: EchoButtonSecondaryProps) {
  return (
    <div
      className={
        className ||
        "d450aff2f2 dca6bcd4b6 d18fd11b5e dba4c50899 d507c28c0b d60fbb7713 d9cc776dc4 dd1f2f65a0 d3960ffc24 d86843cf1e dd89972fe1 d4eded280e d71e31b2f1"
      }
      data-node-id="7:4"
      data-name="ECHO/button/secondary"
    >
      <p
        className="d0f92246ac d1ba71920b d2689f3958 d98fbcce75 dd89972fe1 d012fbd121 d4d2392e8e d4531df0ac de82ae8be0"
        data-node-id="7:5"
      >
        {label}
      </p>
    </div>
  );
}
type EchoMetricDefaultProps = {
  className?: string;
  delta?: string;
  label?: string;
  value?: string;
};
function EchoMetricDefault({
  className,
  delta = "↑ 18 vs. últimos 5",
  label = "ACS",
  value = "248",
}: EchoMetricDefaultProps) {
  return (
    <div
      className={
        className ||
        "d0f92246ac d507c28c0b d60fbb7713 d8dddea077 d7a9385434 d779cfeb53 d60541e1e2 d2f3d084c8 d9039f097d dd89972fe1 d4eded280e d8c64521aa de82ae8be0"
      }
      data-node-id="7:26"
      data-name="ECHO/metric/default"
    >
      <p
        className="db5a8a05bb d8ecebc9f8 de32ac1aeb dd89972fe1 d012fbd121 d69cdf25ad dfaf150a46"
        data-node-id="7:27"
      >
        {label}
      </p>
      <p
        className="dd392d27fa d0ce2a7f44 df36db923e dd89972fe1 d012fbd121 d4d47faf1b d4531df0ac"
        data-node-id="7:28"
      >
        {value}
      </p>
      <p
        className="dc6a60f045 d8ecebc9f8 defcc9af6d dd89972fe1 d012fbd121 da14daebf7 dcbe80b756"
        data-node-id="7:29"
      >
        {delta}
      </p>
    </div>
  );
}
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
export default function Component18BriefingSelecaoDeAgente() {
  return (
    <div
      className="dbc35e58cf d507c28c0b d60fbb7713 d8dddea077 d48bd7b1a1 d60541e1e2 dd01b4bf9c dd89972fe1 d48bd39401"
      data-node-id="24:1830"
      data-name="18 · Briefing / Seleção de agente"
    >
      <div
        className="d507c28c0b d60fbb7713 d90a9c4051 d3960ffc24 d8ef2268ef dd89972fe1 d012fbd121 d33734ec81"
        data-node-id="24:1831"
        data-name="Título da janela"
      >
        <p
          className="d0f92246ac dd392d27fa d0ce2a7f44 ddab3e991e dd89972fe1 d012fbd121 db38bdd3c9 d4531df0ac de82ae8be0"
          data-node-id="24:1832"
        >
          ECHO
        </p>
        <EchoButtonGhost
          className="d507c28c0b d345168367 d60fbb7713 d9cc776dc4 dd1f2f65a0 d3960ffc24 d86843cf1e dd89972fe1 d4eded280e d012fbd121 dd524f8b87"
          label="Fechar"
        />
      </div>
      <div
        className="d507c28c0b d60fbb7713 d8dddea077 d1e06005a8 d4a8092b73 d60541e1e2 d08b04966c dd89972fe1 d012fbd121 d33734ec81"
        data-node-id="24:1835"
        data-name="Hero do briefing"
      >
        <div
          className="dda4dbfbc4 d4c2f08c33 dffb747820 d2167406b2 d33734ec81"
          data-node-id="24:1836"
          data-name="Image / hero/omen"
        >
          <img
            alt=""
            className="dda4dbfbc4 d7b7df0449 d2191c1456 d7d85d0c21 da4326536b d48bd39401"
            src={imgImageHeroOmen}
          />
        </div>
        <div
          className="d0f92246ac d507c28c0b d60fbb7713 d8dddea077 d1e06005a8 d60541e1e2 dd89972fe1 d012fbd121 d5d94a614c"
          data-node-id="24:1837"
          data-name="Antes do jogo"
        >
          <p
            className="db5a8a05bb d8ecebc9f8 de32ac1aeb dd89972fe1 d012fbd121 d69cdf25ad dcbe80b756 de82ae8be0"
            data-node-id="24:1838"
          >
            ASCENT / SELEÇÃO DE AGENTE
          </p>
          <div
            className="dd392d27fa d0ce2a7f44 dd6b7ed772 dd89972fe1 d012fbd121 d4ff263121 d4531df0ac d5d94a614c"
            data-node-id="24:1839"
          >
            <p className="daa31b986a d5a4fd449f">Antes do</p>
            <p className="daa31b986a">próximo jogo.</p>
          </div>
        </div>
      </div>
      <div
        className="d0f92246ac d507c28c0b d60fbb7713 d90a9c4051 d60541e1e2 dd89972fe1 d012fbd121 d33734ec81 de82ae8be0"
        data-node-id="24:1840"
        data-name="Histórico pessoal"
      >
        <EchoMetricDefault
          className="d507c28c0b d60fbb7713 d8dddea077 d7a9385434 d779cfeb53 d60541e1e2 d2f3d084c8 d9039f097d dd89972fe1 d4eded280e d012fbd121 d6b4b3f0b5"
          delta="O teu histórico pessoal"
          label="OMEN / VITÓRIAS"
          value="58%"
        />
        <EchoMetricDefault
          className="d507c28c0b d60fbb7713 d8dddea077 d7a9385434 d779cfeb53 d60541e1e2 d2f3d084c8 d9039f097d dd89972fe1 d4eded280e d012fbd121 d6b4b3f0b5"
          delta="O teu histórico pessoal"
          label="KAST"
          value="74%"
        />
        <EchoMetricDefault
          className="d507c28c0b d60fbb7713 d8dddea077 d7a9385434 d779cfeb53 d60541e1e2 d2f3d084c8 d9039f097d dd89972fe1 d4eded280e d012fbd121 d6b4b3f0b5"
          delta="O teu histórico pessoal"
          label="SESSÃO"
          value="1V / 1D"
        />
      </div>
      <p
        className="d0f92246ac dd392d27fa d0ce2a7f44 ddab3e991e dd89972fe1 d012fbd121 db38bdd3c9 d4531df0ac de82ae8be0"
        data-node-id="24:1853"
      >
        O teu foco: entrar com apoio.
      </p>
      <p
        className="d0f92246ac dc6a60f045 d8ecebc9f8 d98fbcce75 dd89972fe1 d012fbd121 d4d2392e8e dfaf150a46 d33734ec81"
        data-node-id="24:1854"
      >
        Um lembrete do teu plano de treino. Sem dados dos adversários.
      </p>
      <EchoButtonSecondary
        className="d450aff2f2 dca6bcd4b6 d18fd11b5e dba4c50899 d507c28c0b d345168367 d60fbb7713 d9cc776dc4 dd1f2f65a0 d3960ffc24 d86843cf1e dd89972fe1 d4eded280e d012fbd121 d33734ec81"
        label="Rever depois da partida"
      />
      <p
        className="d0f92246ac dc6a60f045 d8ecebc9f8 defcc9af6d dd89972fe1 d012fbd121 da14daebf7 dfaf150a46 de82ae8be0"
        data-node-id="24:1857"
      >
        Fecha automaticamente quando a partida começa.
      </p>
      <p
        className="d0f92246ac db5a8a05bb d8ecebc9f8 de32ac1aeb dd89972fe1 d012fbd121 d69cdf25ad dfaf150a46 de82ae8be0"
        data-node-id="24:1858"
      >
        CONCEITO EDITÁVEL / DADOS DEMO
      </p>
    </div>
  );
}
