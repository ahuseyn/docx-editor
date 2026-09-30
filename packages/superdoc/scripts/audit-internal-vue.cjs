'use strict';

const fs = require('node:fs');
const path = require('node:path');

function auditInternalVue(entries, { vueEntries = [], typescript } = {}) {
  const ts = typescript ?? require('typescript');
  const entryFiles = new Set(vueEntries);
  const visited = new Set();
  function visit(file) {
    if (visited.has(file)) return;
    visited.add(file);
    const source = fs.readFileSync(file, 'utf8');
    const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, false);
    const specifiers = [];
    function collect(node) {
      let literal;
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) literal = node.moduleSpecifier;
      else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) literal = node.argument.literal;
      else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || ts.isIdentifier(node.expression) && node.expression.text === 'require')) literal = node.arguments[0];
      if (literal && ts.isStringLiteral(literal)) specifiers.push(literal.text);
      ts.forEachChild(node, collect);
    }
    collect(parsed);
    for (const specifier of specifiers) {
      if (/^(?:vue(?:\/|$)|@vue\/)/.test(specifier) && !entryFiles.has(file)) {
        throw new Error(`Internal UI chunk imports external Vue: ${file} -> ${specifier}`);
      }
      if (!specifier.startsWith('.')) continue;
      let target = path.resolve(path.dirname(file), specifier);
      if (/\.d\.[cm]?ts$/.test(file) && !fs.existsSync(target)) target = target.replace(/\.js$/, '.d.ts');
      if (/\.(?:[cm]?js|d\.[cm]?ts)$/.test(target) && fs.existsSync(target)) visit(target);
    }
  }
  for (const entry of entries) visit(entry);
  return visited.size;
}

module.exports = { auditInternalVue };
