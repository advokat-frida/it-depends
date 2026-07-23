import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const readBuilt = (path) => readFile(new URL(`../dist/standalone/IT-DEPENDS/${path}`, import.meta.url), 'utf8');

describe('built static page', () => {
  it('built page references a bundled classic script plus separate local fonts and art', async () => {
    const html = await readBuilt('index.html');
    const css = await readBuilt('styles.css');
    const app = await readBuilt('app.js');

    expect(html).toContain('<script defer src="./app.js"></script>');
    expect(html).not.toContain('type="module"');
    expect(app).not.toMatch(/^\s*import\s/m);
    expect(app).toContain('data-card-back-art');
    expect(app).toContain('${kind}-card-back.png');
    expect(css).toContain("url('./assets/art/scenario-card-back.png')");
    expect(css).toContain("url('./assets/art/curveball-card-back.png')");
    expect(html).not.toMatch(/data:(?:image|font)\//i);
    expect(css).toContain("url('./assets/fonts/");
    expect(css).not.toMatch(/base64/i);
    expect(html).toContain("img-src 'self'");
  });

  it('built page contains the AF skeleton and IT DEPENDS phase landmarks', async () => {
    const html = await readBuilt('index.html');

    expect(html).toContain('ADVOKAT FRIDA');
    expect(html).toContain('IT DEPENDS');
    expect(html).toContain('Make the call. Then meet the fact you didn&rsquo;t have.');
    expect(html).toContain('data-phase="request"');
    expect(html).toContain('data-phase="debrief"');
    expect(html).toContain('Not legal advice');
  });
});
