const URL = 'https://scriptsnap.mylaby.com/snap.js';
const DOCUMENTATION_URL = 'https://scriptsnap.mylaby.com/';
const ICON = 'cloud-download-alt';
const COLOR = 'blue';

class SnapInstaller {
  fileManager: FileManager;
  documentsDirectory: string;

  constructor() {
    this.fileManager = FileManager.iCloud();
    this.documentsDirectory = this.fileManager.documentsDirectory();
  }

  hashCode(input: string): number {
    return (
      Array.from(input).reduce(
        (accumulator, currentChar) => Math.imul(31, accumulator) + currentChar.charCodeAt(0),
        0,
      ) >>> 0
    );
  }

  async install(name: string, sourceUrl: string, documentationUrl: string, icon: string, color: string): Promise<void> {
    try {
      const filePath = this.fileManager.joinPath(this.documentsDirectory, `${name}.js`);
      const req = new Request(sourceUrl);
      const code = await req.loadString();
      const hash = this.hashCode(code);
      const codeToStore = Data.fromString(
        `// Variables used by Scriptable.\n` +
          `// These must be at the very top of the file. Do not edit.\n` +
          `// icon-color: ${color}; icon-glyph: ${icon};\n` +
          `// This script was installed using ScriptSnap.\n` +
          `// Do not remove these lines, if you want to benefit from automatic updates.\n` +
          `// source: ${sourceUrl}; docs: ${documentationUrl}; hash: ${hash};\n\n${code}`,
      );
      this.fileManager.write(filePath, codeToStore);
      const selfFilePath = this.fileManager.joinPath(this.documentsDirectory, `${Script.name()}.js`);
      this.fileManager.remove(selfFilePath);
      const callback = new CallbackURL('scriptable:///run');
      callback.addParameter('scriptName', 'Snap');
      await callback.open();
    } catch (error) {
      console.error(`Failed to install script: ${error}`);
    }
  }
}

await new SnapInstaller().install('Snap', URL, DOCUMENTATION_URL, ICON, COLOR);

export {};
