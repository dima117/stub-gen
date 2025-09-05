import { InterfaceDeclaration, Project, SyntaxKind, Type, TypeNode } from "ts-morph";

const project = new Project();

project.addSourceFilesAtPaths("example/**/*{.d.ts,.ts}");

const diagnostics = project.getPreEmitDiagnostics();

console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));

const sourceFile = project.getSourceFileOrThrow("example.ts");
const interfaces = sourceFile.getInterfaces();

const file = project.createSourceFile("result.ts", undefined, { overwrite: true });

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
  const objectProperties = properties.map(prop => {
    const name = prop.getName();
    const type = prop.getType();
    const typeNode = prop.getTypeNode();
    
    return `${name}: ${getDefaultValueForType(type, typeNode)}`;
  }).join(',\n    ');
  
  // Возвращаем тело функции
  return `return {\n    ${objectProperties}\n  };`;
}

function getDefaultValueForType(type: Type, typeNode?: TypeNode): string {
  if (type.isString()) {
    return '""';
  } else if (type.isNumber()) {
    return '0';
  } else if (type.isBoolean()) {
    return 'false';
  } else if (type.isArray()) {
    return '[]';
  } else if (type.isObject() && !type.isInterface()) {
    return '{}';
  } else if (type.isNull()) {
    return 'null';
  } else if (type.isUndefined()) {
    return 'undefined';
  } else if (type.isEnum()) {
    // Для enum берем первое значение или 0
    const enumMembers = type.getSymbol()?.getDeclarations()?.[0]?.getSourceFile()
      .getDescendantsOfKind(SyntaxKind.EnumMember);
    if (enumMembers && enumMembers.length > 0) {
      const enumName = type.getSymbol()?.getName();
      const firstMemberName = enumMembers[0].getName();
      return `${enumName}.${firstMemberName}`;
    }
    return '0';
  } else if (type.isUnion()) {
    // Для union типов берем первый вариант
    const unionTypes = type.getUnionTypes();
    if (unionTypes.length > 0) {
      return getDefaultValueForType(unionTypes[0]);
    }
    return 'undefined';
  } else if (type.isInterface() || type.isObject()) {
    // Для вложенных интерфейсов или объектных типов
    const interfaceName = type.getSymbol()?.getName();
    if (interfaceName && interfaceName !== 'Object') {
      return `Get${interfaceName}()`;
    }
    return '{}';
  } else if (typeNode && typeNode.getKind() === SyntaxKind.TypeLiteral) {
    // Для встроенных литеральных типов
    return '{}';
  } else {
    // Для всех остальных типов
    return 'undefined';
  }
}