import fs from "node:fs";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
const traverse = traverseModule.default;
const content = {};
for (const file of fs.readdirSync("src/screens")) {
  if (!/^(105-|98-)/.test(file)) continue;
  const ast = parse(fs.readFileSync("src/screens/" + file, "utf8"), {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });
  const sections = [];
  traverse(ast, {
    JSXElement(p) {
      const n = p.node.openingElement.attributes.find(
        (a) => a.type === "JSXAttribute" && a.name.name === "data-name",
      )?.value?.value;
      if (
        n &&
        (["Como praticar", "O teu objetivo", "Pontos principais"].includes(n) ||
          n.startsWith("Habilidade /"))
      ) {
        const text = [];
        p.traverse({
          JSXText(q) {
            const t = q.node.value.replace(/\s+/g, " ").trim();
            if (t) text.push(t);
          },
        });
        if (text.length) sections.push({ title: n, text });
      }
    },
  });
  content[file.replace(".tsx", "").replace("-", ":")] = sections;
}
fs.writeFileSync("src/content.json", JSON.stringify(content, null, 2));
