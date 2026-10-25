document.documentElement.classList.add('js');
const menu = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('#primary-navigation');
if (menu && nav) {
  const close = (returnFocus = false) => {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    if (returnFocus) menu.focus();
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') close(true);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    close();
    if (link.hash && link.getAttribute('href').startsWith('#')) {
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }
  }));
}

const filters = document.querySelectorAll('[data-year-filter]');
if (filters.length) {
  const groups = document.querySelectorAll('[data-publication-year]');
  const status = document.querySelector('[data-filter-status]');
  filters.forEach(button => button.addEventListener('click', () => {
    const year = button.dataset.yearFilter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    groups.forEach(group => { group.hidden = year !== 'all' && group.dataset.publicationYear !== year; });
    if (status) status.textContent = year === 'all' ? 'Showing all publications.' : `Showing publications from ${year}.`;
  }));
}
