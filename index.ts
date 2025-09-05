import {
  InterfaceDeclaration,
  TypeAliasDeclaration,
  Project,
  ScriptTarget,
  ModuleResolutionKind,
  ModuleKind,
  SyntaxKind,
} from "ts-morph";
import { getDefaultValueForType } from "./src/getDefaultValueForType";
import { getDeclarationName, getFunctionName } from "./src/names";

const project = new Project({
  compilerOptions: {
    target: ScriptTarget.ES2015,
    module: ModuleKind.NodeNext,
    moduleResolution: ModuleResolutionKind.NodeNext,
  },
});

project.addSourceFilesAtPaths("example/**/*{.d.ts,.ts}");

const diagnostics = project.getPreEmitDiagnostics();

console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));

const sourceFile = project.getSourceFileOrThrow("example.ts");
const interfaces = sourceFile.getInterfaces();
const types = sourceFile.getChildrenOfKind(SyntaxKind.TypeAliasDeclaration);

const xxx = (s: string | undefined): s is string => Boolean(s);

const allNames = interfaces
  .map(getDeclarationName)
  .concat(types.map(getDeclarationName))
  .filter(xxx);

const allNamesSet = new Set(allNames);

console.log("---");
console.log(allNames.join("\n"));

const file = project.createSourceFile("result.ts", undefined, {
  overwrite: true,
});

for (let i of interfaces) {
  const interfaceName = i.getName();
  if (!allNamesSet.has(interfaceName)) {
    continue;
  }

  const functionName =  getFunctionName(interfaceName);
  const functionText = generateFunctionText(i);

  file.addFunction({
    name: functionName,
    isExported: true,
    statements: functionText,
  });
}

file.formatText();
project.saveSync();

function generateFunctionText(
  interfaceDeclaration: InterfaceDeclaration
): string {
  // Получаем все свойства интерфейса
  const properties = interfaceDeclaration.getProperties();

  // Формируем тело возвращаемого объекта
  const objectProperties = properties
    .map((prop) => {
      const name = prop.getName();
      const type = prop.getType();
      const typeNode = prop.getTypeNode();

      return `${name}: ${getDefaultValueForType(
        allNamesSet,
        name,
        type,
        typeNode
      )}`;
    })
    .join(",\n    ");

  // Возвращаем тело функции
  return `return {\n    ${objectProperties}\n  };`;
}
