const ts = require('typescript');
const path = require('path');
const configPath = path.resolve(process.cwd(), 'tsconfig.app.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, process.cwd());
const program = ts.createProgram(parsed.fileNames, parsed.options);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (!diagnostics || diagnostics.length === 0) {
  console.log('No diagnostics');
  process.exit(0);
}
const formatHost = {
  getCanonicalFileName: fileName => fileName,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine
};
console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
process.exit(diagnostics.length > 0 ? 1 : 0);
