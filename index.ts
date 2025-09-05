import {
  InterfaceDeclaration,
  Project,
  ScriptTarget,
  ModuleResolutionKind,
  ModuleKind,
} from "ts-morph";
import { getDefaultValueForType } from "./example/src/getDefaultValueForType";

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

const file = project.createSourceFile("result.ts", undefined, {
  overwrite: true,
});

for (let i of interfaces) {
  const interfaceName = i.getName();
  const functionName = `Get${interfaceName}`;
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

      return `${name}: ${getDefaultValueForType(name, type, typeNode)}`;
    })
    .join(",\n    ");

  // Возвращаем тело функции
  return `return {\n    ${objectProperties}\n  };`;
}
