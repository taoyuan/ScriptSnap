import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import prettier from 'rollup-plugin-prettier';
import path from 'path';
import fs from 'fs';

const SCRIPT_BANNER = `// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: __iconColor__; icon-glyph: __iconGlyph__;
`;

const inputDir = 'dist/apps';
const outputDir = 'apps';
const scriptableScripts = fs.readdirSync(inputDir).filter(file => file.endsWith('.js'));

const isDevelopment = process.env.NODE_ENV === 'development';

const devBaseUrl = 'http://localhost:3000';

export default scriptableScripts.map(script => {
  return {
    input: path.join(inputDir, script), 
    output: {
      file: path.join(outputDir, script.replace('.ts', '.js')), 
      format: 'es', 
      name: path.basename(script, '.ts'), 
    },
    plugins: [
      resolve(),
      commonjs(),
      prettier({
        parser: 'babel',
      }),
      {
        name: 'replace-url',
        transform(code) {
          if (isDevelopment) {
            const urlRegex = /(https?:\/\/)[^\/]+(\/.*snap\.js)/g;
            return {
              code: code.replace(urlRegex, `${devBaseUrl}$2`),
              map: null,
            };
          }
          return {code, map: null};
        },
      },
    ],
  };
});
