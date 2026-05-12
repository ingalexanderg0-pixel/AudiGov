/**
 * langController.js
 * Manages the language picker UI and applies i18n translations
 * to all [data-i18n], [data-i18n-placeholder], [data-i18n-title]
 * elements in the DOM.
 *
 * Call initLangController() once after DOM is ready.
 * The controller wires itself to the i18n singleton and
 * re-applies translations automatically on language change.
 */

import { i18n } from './i18n.js';

export function initLangController() {
  // Load saved preference first
  i18n.loadPreference();

  // Initial render
  _applyTranslations();
  _updateTrigger();
  _markActive();

  // Wire dropdown toggle
  const picker = document.getElementById('lang-picker');
  const trigger = document.getElementById('lang-trigger');
  const dropdown = document.getElementById('lang-dropdown');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    picker.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!picker.contains(e.target)) {
      picker.classList.remove('open');
    }
  });

  // Language option buttons
  dropdown.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.lang;
      if (code === i18n.lang) {
        picker.classList.remove('open');
        return;
      }

      i18n.setLang(code);
      picker.classList.remove('open');

      // Brief flash animation on the whole UI
      document.body.classList.add('lang-changing');
      setTimeout(() => document.body.classList.remove('lang-changing'), 400);
    });
  });

  // Re-apply on every language change
  i18n.onChange(() => {
    _applyTranslations();
    _updateTrigger();
    _markActive();
  });
}

/**
 * Apply translations to all annotated DOM elements.
 *
 *  data-i18n="key"              → sets element.textContent
 *  data-i18n-placeholder="key" → sets input.placeholder
 *  data-i18n-title="key"       → sets element.title
 *
 * IMPORTANT: Elements that display real code identifiers (node names,
 * file paths, function names, etc.) must NEVER have data-i18n attributes.
 * The translation engine only touches static UI chrome.
 */
function _applyTranslations() {
  // textContent — only for UI chrome, never for code data
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = i18n.t(key);
    if (val && val !== key) el.textContent = val;
  });

  // placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = i18n.t(key);
    if (val && val !== key) el.placeholder = val;
  });

  // title attribute (tooltips on buttons)
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = i18n.t(key);
    if (val && val !== key) el.title = val;
  });

  // Panel default title — update ONLY when no node is selected
  // (panel closed = no node name should be shown)
  const panel = document.getElementById('info-panel');
  const nameEl = document.getElementById('panel-node-name');
  if (nameEl && !panel?.classList.contains('open')) {
    nameEl.textContent = i18n.t('panel.defaultTitle');
  }

  // Update html lang attribute for accessibility
  document.documentElement.lang = i18n.lang;
}

/** Update the trigger button to show current language */
function _updateTrigger() {
  const langData = i18n.languages.find(l => l.code === i18n.lang);
  if (!langData) return;

  const flagEl = document.getElementById('lang-current-flag');
  const codeEl = document.getElementById('lang-current-code');
  if (flagEl) flagEl.textContent = langData.flag;
  if (codeEl) codeEl.textContent = langData.code.toUpperCase();
}

/** Mark the active language option in the dropdown */
function _markActive() {
  document.querySelectorAll('.lang-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === i18n.lang);
  });
}

/**
 * Translate a key dynamically (for use in JS-generated HTML).
 * Convenience re-export of i18n.t().
 */
export const t = (key) => i18n.t(key);
