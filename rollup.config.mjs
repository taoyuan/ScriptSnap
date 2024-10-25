import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import prettier from 'rollup-plugin-prettier';
import path from 'path';
import fs from 'fs';

const isDevelopment = process.env.NODE_ENV === 'development';

const inputDir = 'dist/scripts';
const outputDir = isDevelopment ? 'dev-scripts' : 'scripts';
const scriptableScripts = fs.readdirSync(inputDir).filter(file => file.endsWith('.js'));

const devBaseUrl = 'http://localhost:3883';

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
            const urlRegex = /(https?:\/\/)[^\/]+(\/.*script\.js)/g;
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
