const LOGO_META = {
  python:      { slug: 'python',      color: '#3776AB' },
  cpp:         { slug: 'cplusplus',   color: '#00599C' },
  html5:       { slug: 'html5',       color: '#E34F26' },
  java:        { slug: 'openjdk',     color: '#437291' },
  javascript:  { slug: 'javascript',  color: '#F7DF1E' },
  react:       { slug: 'react',       color: '#61DAFB' },
  mysql:       { slug: 'mysql',       color: '#4479A1' },
  git:         { slug: 'git',         color: '#F05033' },
};

const SIMPLE_ICONS_CDN = 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons';

function logoHTML(logoKey, courseName, size){
  const meta = LOGO_META[logoKey];
  if (!meta) return `<span class="fallback-letter">${(courseName || '?').charAt(0)}</span>`;
  const initial = (courseName || '?').charAt(0).toUpperCase();
  return `<img src="${SIMPLE_ICONS_CDN}/${meta.slug}.svg" alt="${courseName} logo" loading="lazy"
            onerror="this.outerHTML='<span class=\\'fallback-letter\\'>${initial}</span>'">`;
}

function logoColor(logoKey){
  const meta = LOGO_META[logoKey];
  return meta ? meta.color : '#4A4A4A';
}
