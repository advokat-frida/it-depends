import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const readBuilt = (path) => readFile(new URL(`../public/demo/${path}`, import.meta.url), 'utf8');

describe('built static page', () => {
  it('built page references separate local modules fonts and art', async () => {
    const html = await readBuilt('index.html');
    const css = await readBuilt('styles.css');

    expect(html).toContain('<script type="module" src="./app.js"></script>');
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
