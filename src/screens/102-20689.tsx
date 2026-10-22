// Generated from Figma high-fidelity design context; styled with project CSS.
// @ts-nocheck
const imgEstadoRepouso = "./assets/ede81d9e376d159fecc61ca8.svg";
const imgEstadoRepouso1 = "./assets/66dac173dd5920568ccebe8b.svg";
const imgEstadoRepouso2 = "./assets/e55c3662b202d029d3a72f1a.svg";
const imgEstadoRepouso3 = "./assets/32f5feedd2aaba07c71e21e6.svg";
const imgEstadoRepouso4 = "./assets/e8b2d8fe179dd2c16e59d6fc.svg";
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
type EchoLogoProps = {
  className?: string;
  estado?: "Repouso";
};
function EchoLogo({ className, estado = "Repouso" }: EchoLogoProps) {
  return (
    <div className={className || "dd89972fe1 d19dd8c02c"} data-node-id="72:111">
      <img
        alt=""
        className="dda4dbfbc4 d0214b4b35 d7b7df0449 d2191c1456 d48bd39401"
        src={imgEstadoRepouso}
      />
      <img
        alt=""
        className="dda4dbfbc4 d0214b4b35 d7b7df0449 d2191c1456 d48bd39401"
        src={imgEstadoRepouso1}
      />
      <img
        alt=""
        className="dda4dbfbc4 d0214b4b35 d7b7df0449 d2191c1456 d48bd39401"
        src={imgEstadoRepouso2}
      />
      <img
        alt=""
        className="dda4dbfbc4 d0214b4b35 d7b7df0449 d2191c1456 d48bd39401"
        src={imgEstadoRepouso3}
      />
      <img
        alt=""
        className="dda4dbfbc4 d0214b4b35 d7b7df0449 d2191c1456 d48bd39401"
        src={imgEstadoRepouso4}
      />
    </div>
  );
}
export default function OverlayTesteDeCaptura() {
  return (
    <div
      className="d450aff2f2 dca6bcd4b6 d18fd11b5e dba4c50899 d507c28c0b d60fbb7713 d8dddea077 d78b25a7df d60541e1e2 d04ae36c03 dd89972fe1 d48bd39401"
      data-node-id="102:20689"
      data-name="Overlay / Teste de captura"
    >
      <EchoLogo className="dc05faf844 dd89972fe1 d012fbd121 de32adf4cf" />
      <p
        className="d0f92246ac dd392d27fa d0ce2a7f44 ddf289bf82 dd89972fe1 d012fbd121 de4a600588 d4531df0ac d12436b26d"
        data-node-id="102:23440"
      >
        Captura verificada.
      </p>
      <div
        className="d0f92246ac dc6a60f045 d8ecebc9f8 dd6b7ed772 dd89972fe1 d012fbd121 d4d2392e8e d4531df0ac d12436b26d"
        data-node-id="102:23441"
      >
        <p className="d98fbcce75 d5a4fd449f">✓ OBS ligado</p>
        <p className="d98fbcce75 d5a4fd449f">✓ Origem do jogo encontrada</p>
        <p className="d98fbcce75 d5a4fd449f">✓ Pasta com escrita</p>
        <p className="d98fbcce75 d5a4fd449f">✓ NVENC disponível · 720p30</p>
        <p className="d98fbcce75">
          O teste terminou. Nenhuma gravação está em curso.
        </p>
      </div>
      <div
        className="d507c28c0b d345168367 d60fbb7713 d1e06005a8 d60541e1e2 dd89972fe1 d012fbd121 d12436b26d"
        data-node-id="102:23442"
        data-name="Ações"
      >
        <EchoButtonPrimary
          className="da6cae6171 d507c28c0b d60fbb7713 d9cc776dc4 dd1f2f65a0 d3960ffc24 d86843cf1e dd89972fe1 d4eded280e d012fbd121 d44879387c"
          label="Fechar teste"
        />
        <EchoButtonSecondary
          className="d450aff2f2 dca6bcd4b6 d18fd11b5e dba4c50899 d507c28c0b d60fbb7713 d9cc776dc4 dd1f2f65a0 d3960ffc24 d86843cf1e dd89972fe1 d4eded280e d012fbd121 d44879387c"
          label="Rever definições"
        />
      </div>
    </div>
  );
}
