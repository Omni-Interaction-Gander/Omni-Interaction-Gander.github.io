(() => {
  'use strict';
  const content = window.GANDER_BLOG;
  if (!content) return;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const sections = content.sections.map(id => document.getElementById(id)).filter(Boolean);
  const tocLinks = $$('.toc a');
  const languageStorageKey = 'gander-omni-interaction-agent-language';
  let language = 'en';
  let activeSection = sections[0];
  let scheduledFrame = false;
  const translate = key => content.strings[language][key] ?? content.strings.zh[key] ?? key;

  function updateContents() {
    const offset = $('.site-header').getBoundingClientRect().height + 32;
    activeSection = sections.filter(section => section.getBoundingClientRect().top <= offset).pop() || sections[0];
    tocLinks.forEach(link => {
      if (link.hash === `#${activeSection.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduledFrame = false;
  }
  function scheduleContentsUpdate() {
    if (!scheduledFrame) {
      scheduledFrame = true;
      window.requestAnimationFrame(updateContents);
    }
  }
  window.addEventListener('scroll', scheduleContentsUpdate, { passive: true });
  window.addEventListener('resize', scheduleContentsUpdate, { passive: true });
  window.addEventListener('hashchange', scheduleContentsUpdate);
  window.addEventListener('load', scheduleContentsUpdate);

  function setLanguage(next, preservePosition = false) {
    const currentSection = activeSection;
    const previousTop = currentSection?.getBoundingClientRect().top;
    language = next === 'en' ? 'en' : 'zh';
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = `${translate('title')} · ${translate('footer.blog')}`;
    $('meta[name="description"]').content = translate('meta.description');
    $('meta[property="og:title"]').content = translate('title');
    $('meta[property="og:description"]').content = translate('meta.description');
    $$('[data-i18n]').forEach(node => { node.textContent = translate(node.dataset.i18n); });
    $$('[data-i18n-alt]').forEach(node => node.setAttribute('alt', translate(node.dataset.i18nAlt)));
    $$('[data-i18n-aria]').forEach(node => node.setAttribute('aria-label', translate(node.dataset.i18nAria)));
    $$('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === language)));
    // Keep the reading position and existing media nodes when the article reflows.
    if (preservePosition && currentSection && window.scrollY > 200) {
      const delta = currentSection.getBoundingClientRect().top - previousTop;
      if (Math.abs(delta) > 1) {
        const previousBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollBy(0, delta);
        document.documentElement.style.scrollBehavior = previousBehavior;
      }
    }
    try { localStorage.setItem(languageStorageKey, language); } catch (_) { /* Optional in private/file contexts. */ }
    scheduleContentsUpdate();
  }
  try {
    const savedLanguage = localStorage.getItem(languageStorageKey);
    if (savedLanguage === 'zh' || savedLanguage === 'en') language = savedLanguage;
  } catch (_) { /* Default to English. */ }
  $$('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang, true)));
  $('.language-switch').hidden = false;
  setLanguage(language);

  const mobile = window.matchMedia('(max-width: 900px)');
  const contents = $('.toc');
  const adaptContents = () => { contents.open = !mobile.matches; };
  adaptContents();
  mobile.addEventListener?.('change', adaptContents);

  const videos = $$('video');
  videos.forEach(video => {
    const error = video.parentElement.querySelector('.video-error');
    video.addEventListener('play', () => {
      videos.forEach(other => { if (other !== video) other.pause(); });
    });
    video.addEventListener('error', () => { error.hidden = false; });
    video.addEventListener('loadeddata', () => { error.hidden = true; });
  });

  $$('.table-scroller').forEach(region => {
    region.addEventListener('keydown', event => {
      if (event.target !== region || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') region.scrollLeft = 0;
      else if (event.key === 'End') region.scrollLeft = region.scrollWidth;
      else region.scrollLeft += event.key === 'ArrowRight' ? 160 : -160;
    });
  });
  updateContents();
})();
