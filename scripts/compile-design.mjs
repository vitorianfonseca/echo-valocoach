import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import generateModule from "@babel/generator";
const traverse = traverseModule.default,
  generate = generateModule.default;
const classes = new Map(),
  unknown = new Set(),
  assets = new Map();
const simple = {
  absolute: "position:absolute",
  relative: "position:relative",
  fixed: "position:fixed",
  block: "display:block",
  flex: "display:flex",
  grid: "display:grid",
  hidden: "display:none",
  "flex-col": "flex-direction:column",
  "flex-wrap": "flex-wrap:wrap",
  "flex-none": "flex:none",
  "shrink-0": "flex-shrink:0",
  "items-center": "align-items:center",
  "items-start": "align-items:flex-start",
  "items-end": "align-items:flex-end",
  "justify-between": "justify-content:space-between",
  "justify-center": "justify-content:center",
  "justify-end": "justify-content:flex-end",
  "content-stretch": "align-content:stretch",
  "self-stretch": "align-self:stretch",
  "overflow-clip": "overflow:clip",
  "overflow-hidden": "overflow:hidden",
  "overflow-auto": "overflow:auto",
  "pointer-events-none": "pointer-events:none",
  "cursor-pointer": "cursor:pointer",
  "object-cover": "object-fit:cover",
  "object-contain": "object-fit:contain",
  "max-w-none": "max-width:none",
  "whitespace-nowrap": "white-space:nowrap",
  "whitespace-pre": "white-space:pre",
  "whitespace-pre-wrap": "white-space:pre-wrap",
  uppercase: "text-transform:uppercase",
  "text-left": "text-align:left",
  "text-right": "text-align:right",
  "text-center": "text-align:center",
  "text-ellipsis": "text-overflow:ellipsis",
  "font-normal": "font-weight:400",
  "font-medium": "font-weight:500",
  "font-semibold": "font-weight:600",
  "font-bold": "font-weight:700",
  "font-extrabold": "font-weight:800",
  "border-dashed": "border-style:dashed",
  "border-solid": "border-style:solid",
  border: "border-width:1px",
  "border-b": "border-bottom-width:1px",
  "border-t": "border-top-width:1px",
  "border-l": "border-left-width:1px",
  "border-r": "border-right-width:1px",
  "border-l-2": "border-left-width:2px",
  "bg-gradient-to-r":
    "background-image:linear-gradient(to right,var(--gradient-from),var(--gradient-to))",
  "-translate-x-1/2": "--tx:-50%;translate:var(--tx,0) var(--ty,0)",
  "-translate-y-1/2": "--ty:-50%;translate:var(--tx,0) var(--ty,0)",
  "rotate-180": "rotate:180deg",
};
const props = {
  w: ["width"],
  h: ["height"],
  size: ["width", "height"],
  "min-w": ["min-width"],
  "min-h": ["min-height"],
  "max-w": ["max-width"],
  left: ["left"],
  right: ["right"],
  top: ["top"],
  bottom: ["bottom"],
  inset: ["inset"],
  gap: ["gap"],
  p: ["padding"],
  px: ["padding-left", "padding-right"],
  py: ["padding-top", "padding-bottom"],
  pt: ["padding-top"],
  pb: ["padding-bottom"],
  pl: ["padding-left"],
  pr: ["padding-right"],
  m: ["margin"],
  mb: ["margin-bottom"],
  mt: ["margin-top"],
  leading: ["line-height"],
  tracking: ["letter-spacing"],
  rounded: ["border-radius"],
  bg: ["background-color"],
  border: ["border-color"],
  flex: ["flex"],
  shadow: ["box-shadow"],
  opacity: ["opacity"],
  from: ["--gradient-from"],
  to: ["--gradient-to"],
};
function css(c) {
  if (simple[c]) return simple[c];
  if (c === "[word-break:break-word]") return "overflow-wrap:break-word";
  let m = c.match(/^font-\['(.+)'\]$/);
  if (m)
    return `font-family:'${m[1].split(":")[0].replaceAll("_", " ")}',sans-serif`;
  m = c.match(/^(.+?)-\[(.*)\]$/);
  if (m) {
    let [, key, val] = m;
    val = val
      .replaceAll("_", " ")
      .replace(
        /calc\((.*?)\)/g,
        (_, s) => "calc(" + s.replace(/(?<=[\d%])([+-])(?=\d)/g, " $1 ") + ")",
      );
    if (key === "text")
      return val.startsWith("color:") ? val : `font-size:${val}`;
    if (key === "drop-shadow")
      return (
        "filter:" +
        val
          .split(/,(?![^()]*\))/)
          .map((s) => `drop-shadow(${s})`)
          .join(" ")
      );
    if (props[key]) return props[key].map((p) => `${p}:${val}`).join(";");
  }
  m = c.match(/^(.+?)-(full|px|0|1\/2)$/);
  if (m && props[m[1]])
    return props[m[1]]
      .map(
        (p) =>
          `${p}:${{ full: "100%", px: "1px", 0: "0", "1/2": "50%" }[m[2]]}`,
      )
      .join(";");
  m = c.match(/^opacity-(\d+)$/);
  if (m) return `opacity:${Number(m[1]) / 100}`;
  unknown.add(c);
  return "";
}
function convert(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((c) => {
      if (/^d[0-9a-f]{9}$/.test(c)) return c;
      if (!classes.has(c)) {
        const decl = css(c);
        classes.set(c, {
          name:
            "d" + crypto.createHash("sha1").update(c).digest("hex").slice(0, 9),
          decl,
        });
      }
      return classes.get(c).name;
    })
    .join(" ");
}
const inventory = JSON.parse(fs.readFileSync("design/screens.json", "utf8")),
  manifest = [];
fs.mkdirSync("src/screens", { recursive: true });
for (const screen of inventory) {
  const f = `design/context/${screen.id.replace(":", "-")}.json`;
  if (!fs.existsSync(f)) continue;
  const result = JSON.parse(fs.readFileSync(f, "utf8"));
  let code = result.content.find(
    (c) => c.type === "text" && /export default|import .*svgPaths/.test(c.text),
  )?.text;
  if (!code) {
    console.warn("No full context:", screen.id);
    continue;
  }
  code = code
    .replace(/^```(?:tsx|jsx|typescript)?\n/, "")
    .replace(/\n```$/, "");
  const prefix = code.match(/const assetPathPrefix = "([^"]+)";/)?.[1];
  if (prefix) {
    code = code.replace(/const assetPathPrefix = "[^"]+";/, "");
    code = code.replace(/`\$\{assetPathPrefix\}\/([^`]+)`/g, (_, file) => {
      const url = prefix + "/" + file;
      const local =
        crypto.createHash("sha256").update(url).digest("hex").slice(0, 18) +
        path.extname(file);
      assets.set(url, local);
      return JSON.stringify("./assets/" + local);
    });
  }
  code = code.replace(
    /"https:\/\/www.figma.com\/api\/mcp\/asset\/[^"\s]+"/g,
    (quoted) => {
      const url = JSON.parse(quoted),
        local =
          crypto.createHash("sha256").update(url).digest("hex").slice(0, 18) +
          (path.extname(url) || ".png");
      assets.set(url, local);
      return JSON.stringify("./assets/" + local);
    },
  );
  try {
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });
    traverse(ast, {
      JSXAttribute(p) {
        if (p.node.name.name === "className") {
          const v = p.node.value;
          if (v?.type === "StringLiteral") v.value = convert(v.value);
          else if (
            v?.type === "JSXExpressionContainer" &&
            v.expression.type === "LogicalExpression" &&
            v.expression.right.type === "StringLiteral"
          )
            v.expression.right.value = convert(v.expression.right.value);
        }
        if (p.node.name.name === "aria-hidden" && !p.node.value)
          p.node.value = { type: "StringLiteral", value: "true" };
      },
      StringLiteral(p) {
        if (
          p.parent.type === "LogicalExpression" &&
          p.parent.left.type === "Identifier" &&
          p.parent.left.name === "className"
        )
          p.node.value = convert(p.node.value);
      },
    });
    const file = screen.id.replace(":", "-") + ".tsx";
    fs.writeFileSync(
      "src/screens/" + file,
      "// Generated from Figma high-fidelity design context; styled with project CSS.\n// @ts-nocheck\n" +
        generate(ast).code +
        "\n",
    );
    manifest.push({ ...screen, file });
  } catch (e) {
    console.error(screen.id, e.message);
  }
}
fs.writeFileSync(
  "src/design.css",
  [...classes.values()]
    .map((x) => "." + x.name + "{" + x.decl + "}")
    .join("\n"),
);
fs.writeFileSync("src/manifest.json", JSON.stringify(manifest, null, 2));
fs.writeFileSync(
  "design/asset-downloads.json",
  JSON.stringify(
    [...assets].map(([url, file]) => ({ url, file })),
    null,
    2,
  ),
);
fs.writeFileSync(
  "design/unsupported-classes.json",
  JSON.stringify([...unknown], null, 2),
);
console.log({
  screens: manifest.length,
  assets: assets.size,
  classes: classes.size,
  unsupported: [...unknown],
});
