import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const sections = [
  { id: 'concepto', link: 'El concepto', heading: /Más que un lugar/ },
  { id: 'arquitectura', link: 'Arquitectura', heading: /La grandeza toma forma/ },
  { id: 'gastronomia', link: 'Gastronomía', heading: /Un legado que se saborea/ },
  { id: 'experiencia', link: 'La experiencia', heading: /No vienes a cenar/ },
];

async function expectModelReady(viewer) {
  await expect(viewer.locator('canvas')).toBeVisible();
  await expect(viewer.locator('.model-loading')).toHaveCount(0);
  // Canvas keeps inaccessible fallback children in its DOM even with working WebGL.
  await expect(viewer.locator('.model-fallback')).not.toBeVisible();
  await expect(viewer.getByRole('button', { name: 'Restablecer vista 3D' })).toBeVisible();
  const size = await viewer.locator('canvas').evaluate(canvas => ({ width: canvas.width, height: canvas.height }));
  expect(size.width).toBeGreaterThan(0);
  expect(size.height).toBeGreaterThan(0);
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth);
  expect(overflow, 'Page must fit the viewport without horizontal scrolling').toBeLessThanOrEqual(1);
}

test('desktop navigation reaches all five requested sections and the temple renders in WebGL', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Kemet Royal: Soberanía\.Sofisticación\.Misticismo\./);
  await expectModelReady(page.getByRole('group', { name: 'Modelo 3D interactivo de la fachada monumental de Kemet Royal', exact: true }));

  const navigation = page.getByRole('navigation', { name: 'Navegación principal' });
  for (const section of sections) {
    await navigation.getByRole('link', { name: section.link, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${section.id}$`));
    await expect(page.locator(`#${section.id}`).getByRole('heading', { level: 2, name: section.heading })).toBeInViewport();
  }
  await page.getByRole('link', { name: 'Kemet Royal, inicio', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
  expect(errors).toEqual([]);
});

test('the collection tabs load all four supplied artifacts', async ({ page }) => {
  await page.goto('/#concepto');
  const tabs = page.getByRole('tablist', { name: 'Explorar la colección 3D' });
  for (const name of ['La estatua', 'Ojo de Horus', 'La pirámide', 'El papiro']) {
    const tab = tabs.getByRole('tab', { name: new RegExp(name) });
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.getByRole('tab', { selected: true })).toHaveCount(1);
    await expectModelReady(page.getByRole('group', { name: `Modelo interactivo: ${name}`, exact: true }));
  }
  await page.keyboard.press('Home');
  await expect(tabs.getByRole('tab', { name: /La estatua/ })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.getByRole('tab', { name: /Ojo de Horus/ })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(tabs.getByRole('tab', { name: /El papiro/ })).toBeFocused();
});

test('architecture stages can be selected with reduced motion', async ({ page }) => {
  await page.goto('/#arquitectura');
  const tabs = page.getByRole('tablist', { name: 'Etapas de la arquitectura' });
  const stages = [
    { tab: 'Etapa 1: El curso del Nilo', title: 'El curso del Nilo' },
    { tab: 'Etapa 2: Un templo para los sentidos', title: 'Un templo para los sentidos' },
    { tab: 'Etapa 3: Coronado por la luz', title: 'Coronado por la luz' },
  ];
  for (const stage of stages) {
    await tabs.getByRole('tab', { name: stage.tab }).click();
    await expect(tabs.getByRole('tab', { name: stage.tab })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel').getByRole('heading', { name: stage.title })).toBeVisible();
  }
  await page.keyboard.press('Home');
  await expect(tabs.getByRole('tab', { name: stages[0].tab })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.getByRole('tab', { name: stages[1].tab })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(tabs.getByRole('tab', { name: stages[2].tab })).toBeFocused();
  await expectModelReady(page.getByRole('group', { name: 'Construcción progresiva del complejo Kemet Royal' }));
});

test('scrolling advances the architectural construction story', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const tabs = page.getByRole('tablist', { name: 'Etapas de la arquitectura' });
  for (const { progress, tab } of [{ progress: 0, tab: /Etapa 1:/ }, { progress: 0.5, tab: /Etapa 2:/ }, { progress: 0.99, tab: /Etapa 3:/ }]) {
    await page.locator('#arquitectura').evaluate((section, progress) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (section.offsetHeight - window.innerHeight) * progress, behavior: 'instant' });
    }, progress);
    await expect(tabs.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true');
  }
});

test('a failed temple download shows a static poster without a permanent loading overlay', async ({ page }) => {
  await page.route('**/models/temple.glb', route => route.abort('failed'));
  await page.goto('/');
  const viewer = page.getByRole('group', { name: 'Modelo 3D interactivo de la fachada monumental de Kemet Royal', exact: true });
  await expect(viewer.getByText('Vista del modelo · Exploración 3D no disponible', { exact: true })).toBeVisible();
  await expect(viewer.locator('.model-loading')).toHaveCount(0);
  await expect(viewer.locator('.model-fallback img')).toBeVisible();
  expect(await viewer.locator('.model-fallback img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(viewer.getByRole('button', { name: 'Restablecer vista 3D' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Reservar mi Banquete Real', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('the reservation validates inputs and downloads an honest personal calendar reminder', async ({ page }) => {
  const writes = [];
  page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) writes.push(request.url()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Reservar mi Banquete Real', exact: true }).first().click();
  const dialog = page.getByRole('dialog');
  const prepare = dialog.getByRole('button', { name: 'Preparar mi banquete' });
  const name = dialog.getByLabel('Tu nombre');
  const email = dialog.getByLabel('Correo electrónico');
  const date = dialog.getByLabel('Fecha deseada');
  await expect(dialog).toBeVisible();
  await prepare.click();
  await expect(name).toBeFocused();
  expect(await name.evaluate(input => input.validity.valueMissing)).toBe(true);
  await expect(dialog.getByText('Tu banquete, un paso más cerca', { exact: true })).toHaveCount(0);

  await name.fill('Ana Gómez');
  await email.fill('correo-invalido');
  await prepare.click();
  await expect(email).toBeFocused();
  expect(await email.evaluate(input => input.validity.typeMismatch)).toBe(true);
  await email.fill('ana@example.com');
  await date.fill('2020-01-01');
  await prepare.click();
  await expect(date).toBeFocused();
  expect(await date.evaluate(input => input.validity.rangeUnderflow)).toBe(true);

  const requestedDate = await page.evaluate(() => {
    const day = new Date();
    day.setDate(day.getDate() + 2);
    return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
  });
  await date.fill(requestedDate);
  await dialog.getByLabel(/^Hora/).fill('19:30');
  await dialog.getByLabel('Comensales').selectOption('4');
  await dialog.getByLabel('Ocasión').fill('Aniversario, real; 2');
  await name.fill('   ');
  await prepare.click();
  await expect(dialog.getByRole('alert')).toHaveText('Escribe tu nombre para personalizar tu visita.');
  await name.fill('Ana Gómez');
  await prepare.click();

  await expect(dialog.getByRole('heading', { name: 'Tu banquete, un paso más cerca' })).toBeVisible();
  await expect(dialog.getByText('Tu reserva aún no está confirmada.', { exact: true })).toBeVisible();
  await expect(dialog.getByText(/no envía una solicitud al restaurante/)).toBeVisible();
  await expect(dialog.getByText('4 personas', { exact: true })).toBeVisible();
  await expect(dialog.getByText('19:30', { exact: true })).toBeVisible();
  const downloadPending = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Guardar recordatorio en mi calendario' }).click();
  const download = await downloadPending;
  expect(download.suggestedFilename()).toBe('kemet-royal-recordatorio.ics');
  // RFC 5545 folds long content lines; unfold before inspecting field values.
  const contents = (await readFile(await download.path(), 'utf8')).replace(/\r\n[ \t]/g, '');
  const startsAt = new Date(`${requestedDate}T19:30:00-06:00`).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  expect(contents).toContain('BEGIN:VCALENDAR\r\nVERSION:2.0');
  expect(contents).toContain(`DTSTART:${startsAt}`);
  expect(contents).toContain('SUMMARY:Contactar a Kemet Royal: consultar disponibilidad');
  expect(contents).toContain('Este recordatorio no es una reserva. No se ha enviado ninguna solicitud.');
  expect(contents).toContain('Aniversario\\, real\\; 2');
  expect(contents).toContain('STATUS:TENTATIVE');
  expect(contents).toContain('END:VCALENDAR');
  await expect(dialog.getByRole('button', { name: 'Descargar de nuevo' })).toBeVisible();
  expect(writes, 'Preparing a visit must not silently send personal data or a booking request').toEqual([]);

  await dialog.getByRole('button', { name: 'Editar los detalles' }).click();
  await expect(name).toHaveValue('Ana Gómez');
  await expect(date).toHaveValue(requestedDate);
});

test('the reservation traps keyboard focus and Escape returns focus to its trigger', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Reservar mi Banquete Real', exact: true }).first();
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Preparar mi banquete' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Cerrar reserva' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

for (const width of [390, 768]) {
  test(`${width}px navigation and all sections fit without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await expectNoHorizontalOverflow(page);
    for (const section of sections) {
      if (width === 390) {
        const toggle = page.getByRole('button', { name: 'Abrir menú', exact: true });
        await toggle.click();
        await expect(page.getByRole('button', { name: 'Cerrar menú', exact: true })).toHaveAttribute('aria-expanded', 'true');
        await page.getByRole('navigation', { name: 'Navegación móvil' }).getByRole('link', { name: section.link, exact: true }).click();
        await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toHaveCount(0);
      } else {
        await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: section.link, exact: true }).click();
      }
      await expect(page).toHaveURL(new RegExp(`#${section.id}$`));
      await expect(page.locator(`#${section.id}`).getByRole('heading', { level: 2, name: section.heading })).toBeInViewport();
      await expectNoHorizontalOverflow(page);
    }
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expectNoHorizontalOverflow(page);
    if (width === 390) {
      await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: 'Abrir menú', exact: true })).toBeFocused();
      await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toHaveCount(0);
      await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
      await page.getByRole('navigation', { name: 'Navegación móvil' }).getByRole('button', { name: 'Reserva tu experiencia' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Abrir menú', exact: true })).toBeFocused();
    }
  });
}
