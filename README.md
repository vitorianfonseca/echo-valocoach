# ECHO · ValoCoach

Aplicação desktop para Windows e macOS, baseada no Figma ECHO. **Versão de desenvolvimento 0.1.0 — não é ainda uma versão completa ou uma IA de precisão validada.**

## Executar

Requer Node.js 22.12+ e npm.

```sh
npm ci
npm run desktop
```

Pré-visualização web: `npm run dev`. Compilar: `npm run build`. Testes: `npm test` e `npm run test:e2e` (instalar Chromium com `npx playwright install chromium`).

Instaladores: `npm run package:mac` ou `npm run package:win` no respetivo sistema. O workflow Desktop builds gera artefactos para os sistemas suportados. Os builds são de desenvolvimento, sem assinatura comercial/notarização Apple ou certificado Windows.

## Dois modos explícitos

- **Design Figma**: 135 ecrãs exportados como React/CSS com assets locais e navegação do protótipo. Inclui exemplos de dados, erros, onboarding, agentes, modais e treino. A barra identifica os dados de demonstração.
- **Dados locais**: operações reais de importação, treino, vídeo, notas, conversas e configurações. Estes ecrãs usam o sistema visual ECHO, mas ainda não reproduzem todos os estados do Figma exatamente.

O inventário contém 158 frames da página de ecrãs completos. O limite de chamadas do plano Figma Education impediu a exportação de 23. Estão listados em `design/coverage.json`. A existência de um frame navegável **não significa** que todas as suas funcionalidades estejam implementadas. As variantes mobile não fazem parte desta entrega desktop.

## Operações implementadas

- Importação JSON validada de partidas ECHO e respostas Riot `{puuid,matches}`; deduplicação, filtros, comparação e estatísticas descritivas.
- Importação de vídeos locais, reprodução/velocidade, navegação temporal, notas com timestamps e exportação de intervalos MP4 por FFmpeg.
- Captura explícita de ecrã/janela na aplicação desktop: WebM, 30 FPS, sem áudio; o utilizador escolhe a fonte e inicia/termina a gravação. Não há deteção automática de partidas nem integração OBS.
- Biblioteca de 35 exercícios, plano persistente, cronómetro, pausas, reflexão e histórico de sessões.
- Editor esquemático de marcadores em Ascent, guardar/carregar/eliminar/exportar setups. Não é um simulador de habilidades.
- Conversas persistentes, renomear/apagar/exportar, correções e envio opcional de um frame. Um intervalo de VOD pode ser convertido localmente em quatro frames com timestamps; a pré-visualização exige consentimento antes de enviar à IA. Isto não equivale a análise contínua de vídeo.
- Integração real OpenAI Responses API através do processo principal; chave cifrada com Electron safeStorage; modelo configurável. Sem chave, a app devolve um erro claro e não simula uma resposta de IA.
- Sincronização manual de até 10 partidas através da API Riot com chave de produção aprovada e PUUID autorizado. Login RSO público ainda não implementado.
- Temas, redução de movimento, exportação e remoção de registos locais.

## O que está pendente

- Fidelidade visual verificada dos 23 frames bloqueados pelo limite do Figma; comparação detalhada de todos os elementos dos restantes frames.
- Ligação de cada controlo do design ao estado real correspondente. Algumas rotas partilham um espaço funcional em vez da composição exata do design.
- RSO, backend multiutilizador, sincronização cloud, aprovação Riot e onboarding da autorização.
- Análise automática de VOD completo, reconhecimento de eventos/posições, replay 2D real, modelos de economia/clutch, cálculo e calibração de ECHO Score.
- Validação com coaches, benchmark de precisão, atualização de conhecimento por patch e avaliação de confiança.
- Montagens de vários clips, áudio na gravação, integração OBS, deteção automática de jogo e notificações de partida.
- Tradução completa para inglês, cobertura mobile, assinatura/notarização dos instaladores e atualização automática.
- Testes reais com credenciais Riot/OpenAI, captura protegida pelo sistema operativo e exportação em todos os formatos; testes automatizados não substituem estes ensaios.

## Dados e credenciais

Os dados da app são guardados na pasta `userData` do Electron. Vídeos importados são referenciados por caminho e não copiados. Gravações ficam na subpasta `recordings`. Apagar dados remove os registos e chaves, **não apaga os ficheiros de vídeo**. O histórico é local; não há contas cloud.

A IA recebe contexto apenas depois de consentimento no chat: últimas mensagens, estatísticas, até cinco partidas/notas, até três correções e os frames opcionais. `store:false` é enviado à API; isto não altera outras políticas de retenção do fornecedor. A API é cobrada pela conta configurada. Nunca colocar chaves no GitHub ou em ficheiros de frontend.

A sincronização Riot destina-se apenas a jogadores autorizados. Não há scraping do cliente nem acesso à memória do jogo. Consultar as políticas atuais antes de distribuir o produto.

## Arquitetura

`src/screens/`: componentes React provenientes de contextos de design Figma. `src/design.css`: estilos compilados sem dependência Tailwind. `src/Workspace.tsx`: percursos funcionais. `src/model.ts`: validação e métricas. `electron/`: IPC restrito, persistência, cofre, media e integrações. `design/actions.json`: navegação importada. `design/asset-integrity.json`: hashes dos assets locais.

Os contextos brutos e screenshots de referência não são versionados. `scripts/compile-design.mjs` só deve ser executado depois de repor esses contextos; `scripts/download-assets.py` descarrega os URLs temporários e `scripts/dedupe-assets.py` normaliza os nomes pelo hash do conteúdo. O código compilado e assets finais estão no repositório e não necessitam de acesso ao Figma para construir.

## Referências

- [Figma ECHO](https://www.figma.com/design/RFffk9r2mNxE9w61L1TB2R/ECHO?node-id=2-2)
- [Políticas VALORANT e RSO](https://developer.riotgames.com/docs/valorant)
- [Segurança Electron](https://www.electronjs.org/docs/latest/tutorial/security)
- [Captura Electron](https://www.electronjs.org/docs/latest/api/desktop-capturer)
- [OpenAI: imagens e visão](https://developers.openai.com/api/docs/guides/images-vision)

ECHO não é um produto oficial da Riot Games. Imagens e marcas do jogo pertencem aos respetivos titulares; esta implementação usa os recursos fornecidos no design. A utilização comercial requer revisão dos direitos e das políticas aplicáveis.

## Movimento e desempenho

Transições entre ecrãs por View Transitions, entradas escalonadas de cartões visíveis, respostas ao pressionar botões, brilho pontual nos botões principais, aproximação suave das imagens dos agentes, abertura de diálogos e estados de processamento da IA. As entradas usam `transform` e `opacity`; não há partículas permanentes, loops decorativos em repouso ou `will-change` global. O indicador de IA só anima enquanto existe um pedido em curso.

A preferência do sistema e a opção da app desativam o movimento. Equipamentos com até quatro processadores lógicos recebem entradas mais curtas e sem brilho. Isto é uma heurística, não uma medição de GPU. `node scripts/measure-motion.mjs` mede sete transições na aplicação desktop: no Mac usado no desenvolvimento, mediana de 16,7 ms, percentil 95 de 17,5 ms, três frames acima de 33,4 ms em 278 amostras e zero animações ativas em repouso. Resultados dependem do equipamento; não foi validado FPS em Windows ou durante VALORANT.
