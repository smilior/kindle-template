/**
 * Capture Cloudflare OS screens for Ch3 in light mode, with focused crops.
 * Usage: node scripts/capture-ch3-light.mjs
 *
 * ルール（AGENTS.md / kindle-book/references/screenshots.md）:
 * - Light モード強制（gadgets:theme-mode + data-mode + colorScheme）
 * - フル画面ではなくフォーカス切り出し（フォーム／セットアップカード／シェル）
 * - deviceScaleFactor 2 の PNG → book/JP/images/
 */
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../book/JP/images');
const BASE = 'http://localhost:8787';
const USER = `booklt${Date.now().toString().slice(-6)}`;
const PASS = 'BookLight!0909';

fs.mkdirSync(OUT, { recursive: true });

function clampClip(box, vw, vh) {
  const x = Math.max(0, Math.floor(box.x));
  const y = Math.max(0, Math.floor(box.y));
  const x2 = Math.min(vw, Math.ceil(box.x + box.width));
  const y2 = Math.min(vh, Math.ceil(box.y + box.height));
  const width = x2 - x;
  const height = y2 - y;
  if (width < 40 || height < 40) {
    throw new Error(`clip too small: ${JSON.stringify({ x, y, width, height, box, vw, vh })}`);
  }
  return { x, y, width, height };
}

async function forceLight(page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('gadgets:theme-mode', 'light');
    } catch {}
  });
  await page.emulateMedia({ colorScheme: 'light' });
}

async function applyLightDom(page) {
  await page.evaluate(() => {
    try {
      localStorage.setItem('gadgets:theme-mode', 'light');
    } catch {}
    document.documentElement.setAttribute('data-mode', 'light');
    document.documentElement.style.colorScheme = 'light';
  });
}

async function shotClip(page, file, box) {
  const vp = page.viewportSize();
  const clip = clampClip(box, vp.width, vp.height);
  const out = path.join(OUT, file);
  await page.screenshot({ path: out, type: 'png', clip, animations: 'disabled' });
  console.log('wrote', file, clip);
}

/** Crop around auth form (heading through primary button) */
async function shotAuthForm(page, file) {
  const box = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const btn = [...document.querySelectorAll('button')].find((b) =>
      /Sign in|Create account/i.test(b.textContent || '')
    );
    const link = [...document.querySelectorAll('a')].find((a) =>
      /Create one|Sign in/i.test(a.textContent || '')
    );
    if (!h1 || !btn) return null;
    const a = h1.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const c = link?.getBoundingClientRect();
    const logo = h1.parentElement?.querySelector('svg,img')?.getBoundingClientRect();
    const top = Math.min(a.y, logo?.y ?? a.y) - 16;
    const bottom = Math.max(b.bottom, c?.bottom ?? b.bottom) + 20;
    const left = Math.min(a.x, b.x) - 36;
    const right = Math.max(a.right, b.right) + 36;
    return { x: left, y: top, width: right - left, height: bottom - top };
  });
  if (!box) {
    await page.screenshot({ path: path.join(OUT, file), type: 'png' });
    console.log('wrote full fallback', file);
    return;
  }
  await shotClip(page, file, box);
}

/** Visible setup step card + page title */
async function shotSetupStep(page, file) {
  const box = await page.evaluate(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Visible step panel (carousel items sit off-screen at large x)
    const panels = [...document.querySelectorAll('div')].filter((d) => {
      const r = d.getBoundingClientRect();
      const t = (d.innerText || '').slice(0, 200);
      const onScreen = r.x >= 0 && r.x < vw - 80 && r.right <= vw + 20 && r.y >= 0 && r.y < vh;
      const isStep =
        /Create your profile|Choose your model|Connect your services|You're all set/.test(t) &&
        r.width > 360 &&
        r.width < 700 &&
        r.height > 260 &&
        r.height < 700;
      return onScreen && isStep;
    });
    panels.sort((a, b) => {
      // prefer mid-size, higher on page
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      return ra.width - rb.width || ra.y - rb.y;
    });
    const panel = panels[0];
    const title = [...document.querySelectorAll('h1')].find((h) =>
      /set you up|Let's/i.test(h.textContent || '')
    );
    if (!panel) {
      // fallback center region
      return { x: vw * 0.2, y: vh * 0.08, width: vw * 0.6, height: vh * 0.85 };
    }
    const pr = panel.getBoundingClientRect();
    const tr = title?.getBoundingClientRect();
    const top = Math.min(pr.y, tr?.y ?? pr.y) - 12;
    const bottom = Math.min(vh - 8, pr.bottom + 16);
    const left = Math.max(8, pr.x - 16);
    const right = Math.min(vw - 8, pr.right + 16);
    // include Next button if below card
    const next = [...document.querySelectorAll('button')].find((b) =>
      /Next|Let's build/i.test(b.textContent || '')
    );
    const nr = next?.getBoundingClientRect();
    const bottom2 =
      nr && nr.x >= left - 40 && nr.x < right + 40
        ? Math.min(vh - 8, Math.max(bottom, nr.bottom + 12))
        : bottom;
    return { x: left, y: Math.max(0, top), width: right - left, height: bottom2 - Math.max(0, top) };
  });
  await shotClip(page, file, box);
}

/** App shell: left nav + main, cropped vertically to content */
async function shotAppShell(page, file, { maxHeight = 640 } = {}) {
  const box = await page.evaluate((maxH) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Find bottom of main interesting content
    const markers = [
      ...document.querySelectorAll('h1,h2,button,textarea,input,[placeholder]'),
    ];
    let bottom = 420;
    for (const el of markers) {
      const t = el.textContent || el.getAttribute('placeholder') || '';
      if (
        /What are we working|GET STARTED|Create workspace|Workspaces|Home|Explore|Blueprints|Outputs|Untitled|Start a new/i.test(
          t
        )
      ) {
        bottom = Math.max(bottom, el.getBoundingClientRect().bottom);
      }
    }
    // also any list row
    for (const el of document.querySelectorAll('a,button,li,div')) {
      const t = (el.textContent || '').trim();
      if (/Untitled Workspace|Create workspace|GET STARTED|Automate a workflow|Build a team/i.test(t)) {
        const r = el.getBoundingClientRect();
        if (r.width > 120 && r.bottom < vh) bottom = Math.max(bottom, r.bottom);
      }
    }
    bottom = Math.min(vh - 4, Math.max(bottom + 36, 480));
    bottom = Math.min(bottom, maxH);
    return { x: 0, y: 0, width: Math.min(vw, 1120), height: bottom };
  }, maxHeight);
  await shotClip(page, file, box);
}

async function clickNextIfAny(page) {
  const next = page.getByRole('button', { name: /^Next/i });
  if (await next.isVisible().catch(() => false)) {
    const enabled = await next.isEnabled().catch(() => false);
    if (enabled) {
      await next.click();
      await page.waitForTimeout(600);
      await applyLightDom(page);
      return true;
    }
  }
  return false;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  });
  const page = await context.newPage();
  await forceLight(page);

  // Fresh session for sign-in capture
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await applyLightDom(page);
  // clear session if not on sign-in
  if (!(await page.getByText('Sign in to your account').isVisible().catch(() => false))) {
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('gadgets:theme-mode', 'light');
    });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await applyLightDom(page);
  }
  await page.waitForSelector('text=Sign in to your account', { timeout: 15000 });
  await applyLightDom(page);
  await shotAuthForm(page, 'ch3-signin.png');

  await page.getByRole('link', { name: /Create one/i }).click();
  await page.waitForURL(/signup/);
  await applyLightDom(page);
  await page.waitForTimeout(250);
  await shotAuthForm(page, 'ch3-create-account.png');

  await page.getByRole('textbox', { name: 'Username' }).fill(USER);
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill(PASS);
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill(PASS);
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForTimeout(1200);
  await applyLightDom(page);

  await page.waitForSelector('text=Create your profile', { timeout: 20000 });
  await applyLightDom(page);
  await page.waitForTimeout(400);
  await shotSetupStep(page, 'ch3-setup-profile.png');

  // Advance profile
  await clickNextIfAny(page);

  // Model step — skip if Next works, else leave and try continue
  if (await page.getByText('Choose your model').isVisible().catch(() => false)) {
    const advanced = await clickNextIfAny(page);
    if (!advanced) {
      // Try adding Cloudflare Workers AI if free (no key)
      const add = page.getByRole('button', { name: /Add new model/i });
      if (await add.isVisible().catch(() => false)) {
        await add.click();
        await page.waitForTimeout(500);
        // open select
        const combo = page.getByRole('combobox').or(page.locator('[role="combobox"]')).first();
        if (await combo.isVisible().catch(() => false)) {
          await combo.click();
          await page.waitForTimeout(300);
          // Prefer Workers AI free models
          const workers = page.getByRole('option', { name: /Workers AI|Cloudflare/i }).first();
          if (await workers.isVisible().catch(() => false)) {
            await workers.click();
          } else {
            const any = page.getByRole('option').first();
            if (await any.isVisible().catch(() => false)) await any.click();
          }
          await page.waitForTimeout(300);
        }
        const addModel = page.getByRole('button', { name: /Add Model/i });
        if (await addModel.isEnabled().catch(() => false)) {
          await addModel.click().catch(() => {});
          await page.waitForTimeout(500);
        } else {
          await page.keyboard.press('Escape');
        }
      }
      await clickNextIfAny(page);
    }
  }

  // Services
  if (await page.getByText('Connect your services').isVisible().catch(() => false)) {
    await clickNextIfAny(page);
  }

  // Done
  await page.waitForTimeout(500);
  await applyLightDom(page);
  if (await page.getByText("You're all set").isVisible().catch(() => false)) {
    await shotSetupStep(page, 'ch3-setup-done.png');
    const build = page.getByRole('button', { name: /Let's build/i });
    if (await build.isVisible().catch(() => false)) {
      await build.click();
      await page.waitForTimeout(1500);
    }
  } else {
    // still capture whatever step is visible as done fallback, then force home
    console.log('warn: no all-set screen, title=', await page.title());
  }

  await applyLightDom(page);
  // If still on setup, go home via completing remaining Next
  for (let i = 0; i < 4; i++) {
    if (await page.getByText('What are we working on').isVisible().catch(() => false)) break;
    if (await page.getByRole('button', { name: /Let's build/i }).isVisible().catch(() => false)) {
      await page.getByRole('button', { name: /Let's build/i }).click();
      await page.waitForTimeout(1200);
      break;
    }
    if (!(await clickNextIfAny(page))) break;
  }

  await applyLightDom(page);
  await page.waitForTimeout(800);

  // Home
  if (await page.getByText('What are we working on').isVisible().catch(() => false)) {
    await shotAppShell(page, 'ch3-home.png', { maxHeight: 680 });
  } else {
    // navigate home
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await applyLightDom(page);
    await page.waitForTimeout(600);
    await shotAppShell(page, 'ch3-home.png', { maxHeight: 680 });
  }

  // Workspaces
  const ws = page.getByRole('link', { name: /^Workspaces$/i }).or(page.getByText('Workspaces', { exact: true }));
  if (await ws.first().isVisible().catch(() => false)) {
    await ws.first().click();
  } else {
    await page.goto(BASE + '/workspaces', { waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(900);
  await applyLightDom(page);
  await page.waitForTimeout(300);
  await shotAppShell(page, 'ch3-workspaces.png', { maxHeight: 620 });

  console.log('done. user=', USER);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
