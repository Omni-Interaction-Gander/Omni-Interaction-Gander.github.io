(() => {
  'use strict';
  const content = window.GANDER_CONTENT;
  if (!content) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { language: 'en', capability: 0, samples: content.demos.map(() => 0), result: 0 };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  try { if (localStorage.getItem('gander-language') === 'zh') state.language = 'zh'; } catch (_) { /* Storage is optional. */ }

  function t(key) { return content[state.language][key] ?? content.en[key] ?? key; }
  function element(tag, attributes = {}, text = '') {
    const node = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) node.textContent = text;
    return node;
  }
  function translated(tag, key, attributes = {}) { return element(tag, { ...attributes, 'data-i18n': key }, t(key)); }
  function annotateLabel(node, key) { node.dataset.i18nAria = key; node.setAttribute('aria-label', t(key)); }
  function pauseVideos(root = document) { $$('video', root).forEach(video => video.pause()); }

  function bindTabKeys(tablist, select) {
    tablist.addEventListener('keydown', event => {
      const tabs = $$('[role="tab"]', tablist);
      const index = tabs.indexOf(event.target);
      if (index === -1 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(next);
      tabs[next].focus({ preventScroll: true });
      revealTab(tabs[next]);
    });
  }
  function revealTab(tab) {
    const list = tab.parentElement;
    const left = tab.offsetLeft - list.offsetLeft;
    // Scroll only the horizontal tab strip, never the page or video.
    if (left < list.scrollLeft) list.scrollTo({ left, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    else if (left + tab.offsetWidth > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: left + tab.offsetWidth - list.clientWidth, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
  }
  function synchronizeTabs(tabs, panels, active) {
    tabs.forEach((tab, index) => {
      tab.setAttribute('aria-selected', String(index === active));
      tab.tabIndex = index === active ? 0 : -1;
      panels[index].hidden = index !== active;
    });
  }

  const capabilityTabs = [];
  const capabilityPanels = [];
  const sampleTabs = [];
  const samplePanels = [];
  content.demos.forEach((demo, index) => {
    const titleKey = `demo.${demo.key}.title`;
    const button = element('button', { type: 'button', role: 'tab', id: `cap-tab-${demo.id}`, 'aria-controls': `cap-panel-${demo.id}`, class: 'capability-tab' });
    button.append(element('span', { class: 'tab-number', 'aria-hidden': 'true' }, String(index + 1).padStart(2, '0')), translated('span', `demo.${demo.key}.short`, { class: 'tab-name' }));
    button.addEventListener('click', () => { selectCapability(index); revealTab(button); });
    $('#capability-tabs').append(button);
    capabilityTabs.push(button);

    const panel = element('div', { id: `cap-panel-${demo.id}`, role: 'tabpanel', 'aria-labelledby': button.id, class: 'capability-panel', tabindex: '0' });
    const info = element('div', { class: 'demo-info' });
    const heading = element('div');
    heading.append(translated('h3', titleKey));
    const description = translated('p', `demo.${demo.key}.description`);
    const tabs = [];
    const frames = [];
    if (demo.samples.length > 1) {
      const list = element('div', { role: 'tablist', class: 'sample-tabs' });
      annotateLabel(list, 'cap.sampleTabs');
      demo.samples.forEach((sample, sampleIndex) => {
        const tab = translated('button', sample.label, { type: 'button', role: 'tab', class: 'sample-tab', id: `sample-tab-${sample.id}`, 'aria-controls': `sample-panel-${sample.id}` });
        tab.addEventListener('click', () => selectSample(index, sampleIndex));
        list.append(tab);
        tabs.push(tab);
      });
      bindTabKeys(list, next => selectSample(index, next));
      heading.append(list);
    }
    info.append(heading, description);
    panel.append(info);
    demo.samples.forEach(sample => {
      const frame = element('div', { class: 'video-frame', id: `sample-panel-${sample.id}` });
      if (demo.samples.length > 1) {
        frame.setAttribute('role', 'tabpanel');
        frame.setAttribute('aria-labelledby', `sample-tab-${sample.id}`);
      }
      const source = sample.src;
      const video = element('video', { controls: '', playsinline: '', preload: 'none', poster: sample.poster, width: '1920', height: '1080', 'data-src': source });
      annotateLabel(video, sample.label || titleKey);
      const directLink = translated('a', 'cap.open', { href: source });
      video.append(directLink);
      const error = element('div', { class: 'video-error', role: 'status', hidden: '' });
      error.append(translated('p', 'cap.error'), translated('a', 'cap.open', { href: source, target: '_blank', rel: 'noopener' }));
      video.addEventListener('error', () => { error.hidden = false; });
      video.addEventListener('loadeddata', () => { error.hidden = true; });
      video.addEventListener('play', () => {
        // There must be only one audio source, including when resuming via browser media controls.
        if (state.capability !== index || demo.samples[state.samples[index]].id !== sample.id) { video.pause(); return; }
        $$('video').forEach(other => { if (other !== video) other.pause(); });
      });
      frame.append(video, error);
      frames.push(frame);
      panel.append(frame);
    });
    sampleTabs.push(tabs);
    samplePanels.push(frames);
    if (tabs.length) synchronizeTabs(tabs, frames, 0);
    $('#capability-panels').append(panel);
    capabilityPanels.push(panel);
  });

  function ensureVideoSource(index) {
    const video = $('video', samplePanels[index][state.samples[index]]);
    if (!video.hasAttribute('src')) video.src = video.dataset.src;
  }
  function announceCapability() {
    $('#capability-status').textContent = t('status.capability')
      .replace('{current}', state.capability + 1).replace('{total}', content.demos.length)
      .replace('{title}', t(`demo.${content.demos[state.capability].key}.short`));
  }
  function selectCapability(next, initial = false) {
    next = (next + content.demos.length) % content.demos.length;
    if (next === state.capability && !initial) return;
    const previous = state.capability;
    pauseVideos(capabilityPanels[previous]);
    if (capabilityPanels[previous].contains(document.activeElement)) capabilityTabs[next].focus({ preventScroll: true });
    state.capability = next;
    synchronizeTabs(capabilityTabs, capabilityPanels, next);
    ensureVideoSource(next);
    $('#page-count').replaceChildren(document.createTextNode(String(next + 1).padStart(2, '0') + ' '), element('span', {}, `/ ${String(content.demos.length).padStart(2, '0')}`));
    if (!initial) {
      announceCapability();
      if (!reducedMotion.matches && capabilityPanels[next].animate) {
        const direction = next === (previous + 1) % content.demos.length ? 1 : -1;
        capabilityPanels[next].animate([{ opacity: .35, transform: `translateX(${direction * 12}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 250, easing: 'ease-out' });
      }
    }
  }
  function selectSample(index, next) {
    if (state.samples[index] === next) return;
    const previousPanel = samplePanels[index][state.samples[index]];
    pauseVideos(previousPanel);
    if (previousPanel.contains(document.activeElement)) sampleTabs[index][next].focus({ preventScroll: true });
    state.samples[index] = next;
    synchronizeTabs(sampleTabs[index], samplePanels[index], next);
    ensureVideoSource(index);
  }
  $('#previous-capability').addEventListener('click', () => { selectCapability(state.capability - 1); revealTab(capabilityTabs[state.capability]); });
  $('#next-capability').addEventListener('click', () => { selectCapability(state.capability + 1); revealTab(capabilityTabs[state.capability]); });
  bindTabKeys($('#capability-tabs'), selectCapability);
  selectCapability(0, true);

  function makeTable(data) {
    const outer = element('div', { class: data.id === 6 ? 'ablation-block' : 'benchmark-block' });
    outer.append(translated('h3', `table${data.id}.title`));
    if (data.id !== 6) outer.append(translated('p', `table${data.id}.summary`, { class: 'result-summary' }));
    outer.append(translated('p', 'results.scroll', { class: 'table-scroll-hint' }));
    const scroll = element('div', { class: 'table-scroll', tabindex: '0', role: 'region' });
    annotateLabel(scroll, `table${data.id}.caption`);
    scroll.addEventListener('keydown', event => {
      if (event.target !== scroll || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') scroll.scrollLeft = 0;
      else if (event.key === 'End') scroll.scrollLeft = scroll.scrollWidth;
      else scroll.scrollLeft += event.key === 'ArrowRight' ? 160 : -160;
    });
    const table = element('table', { 'data-table': data.id });
    table.append(translated('caption', `table${data.id}.caption`));
    const head = element('thead');
    const headings = element('tr');
    data.columns.forEach(column => headings.append(column.startsWith('column.') ? translated('th', column, { scope: 'col' }) : element('th', { scope: 'col' }, column)));
    head.append(headings);
    table.append(head);
    let body;
    data.rows.forEach((row, rowIndex) => {
      const group = data.groups?.find(item => item.start === rowIndex);
      const reference = data.referenceRows?.includes(rowIndex);
      if (!body || group || reference) {
        body = element('tbody', { class: reference ? 'reference-body' : '' });
        table.append(body);
      }
      if (group) {
        const labelId = `table-${data.id}-group-${rowIndex}`;
        body.setAttribute('aria-labelledby', labelId);
        const groupRow = element('tr', { class: 'table-group' });
        groupRow.append(translated('th', group.label, { id: labelId, scope: 'rowgroup', colspan: data.columns.length }));
        body.append(groupRow);
      }
      const tr = element('tr', { class: row[0] === 'Gander' ? 'gander-row' : reference ? 'reference-row' : '' });
      row.forEach((value, cellIndex) => {
        const tag = cellIndex === 0 ? 'th' : 'td';
        const attributes = cellIndex === 0 ? { scope: 'row' } : {};
        tr.append(value.startsWith('column.') ? translated(tag, value, attributes) : element(tag, attributes, value));
      });
      body.append(tr);
    });
    scroll.append(table);
    outer.append(scroll, translated('p', `table${data.id}.note`, { class: 'table-note' }));
    if (data.id === 3) {
      outer.append(translated('p', 'table3.referenceNote', { class: 'table-note' }));
      outer.append(translated('p', 'table3.glossary', { class: 'table-glossary' }));
    }
    const source = element('p', { class: 'table-source' });
    const link = element('a', { href: `https://arxiv.org/pdf/2609.08977#page=${({3:20,4:21,5:22,6:22})[data.id]}`, target: '_blank', rel: 'noopener', class: 'source-link' });
    link.append(translated('span', 'results.source'), element('span', { 'aria-hidden': 'true' }, ' ↗'));
    source.append(link);
    outer.append(source);
    return outer;
  }
  const resultTabs = [];
  const resultPanels = [];
  ['duplex', 'spoken', 'omni'].forEach((key, index) => {
    const tab = translated('button', `results.${key}`, { type: 'button', role: 'tab', id: `result-tab-${key}`, 'aria-controls': `result-panel-${key}`, class: 'result-tab' });
    tab.addEventListener('click', () => selectResult(index));
    const panel = element('div', { role: 'tabpanel', id: `result-panel-${key}`, 'aria-labelledby': tab.id, class: 'result-panel', tabindex: '0' });
    panel.append(makeTable(content.tables[key]));
    if (key === 'omni') panel.append(makeTable(content.tables.ablation));
    resultTabs.push(tab); resultPanels.push(panel);
    $('#result-tabs').append(tab); $('#result-panels').append(panel);
  });
  function selectResult(index) { state.result = index; synchronizeTabs(resultTabs, resultPanels, index); }
  bindTabKeys($('#result-tabs'), selectResult);
  selectResult(0);

  function setLanguage(language) {
    state.language = language === 'zh' ? 'zh' : 'en';
    document.documentElement.lang = state.language === 'zh' ? 'zh-CN' : 'en';
    document.title = t('meta.title');
    $('meta[name="description"]').content = t('meta.description');
    $('meta[property="og:title"]').content = t('meta.title');
    $('meta[property="og:description"]').content = t('meta.description');
    $$('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
    $$('[data-i18n-aria]').forEach(node => node.setAttribute('aria-label', t(node.dataset.i18nAria)));
    $$('[data-i18n-alt]').forEach(node => node.setAttribute('alt', t(node.dataset.i18nAlt)));
    $$('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === state.language)));
    // Text-only updates keep every video element, currentTime, and play state intact.
    if ($('#capability-status').textContent) announceCapability();
    try { localStorage.setItem('gander-language', state.language); } catch (_) { /* Private/file contexts can deny storage. */ }
  }
  $$('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
  setLanguage(state.language);
})();
