const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#mainNav');

function setMenuOpen(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  nav.classList.toggle('is-open', open);
}

menuButton.addEventListener('click', () => setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true'));
// Keep the fixed channel shortcut from covering the inquiry form or footer.
const kakaoFloatingLink = document.querySelector('.kakao-floating-link');
const visibleContactAreas = new Set();
const contactAreaObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) visibleContactAreas.add(entry.target);
    else visibleContactAreas.delete(entry.target);
  });
  kakaoFloatingLink.hidden = visibleContactAreas.size > 0;
});
document.querySelectorAll('#contact, .site-footer').forEach(area => contactAreaObserver.observe(area));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenuOpen(false); });

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function setHeadingLines(selector, value) {
  const heading = document.querySelector(selector);
  if (!heading) return;
  heading.textContent = '';
  value.split('\n').forEach((line, index, lines) => {
    if (index) heading.append(document.createElement('br'));
    const accentClass = selector === '#heroTitle' ? 'hero-period' : selector === '#contactTitle' ? 'contact-title-period' : '';
    const punctuation = accentClass && /[.。]$/.test(line) ? line.slice(-1) : '';
    heading.append(document.createTextNode(punctuation ? line.slice(0, -1) : line));
    if (punctuation) {
      const accent = document.createElement('span');
      accent.className = accentClass;
      accent.textContent = punctuation;
      heading.append(accent);
    }
  });
}

const worksGrid = document.querySelector('#worksGrid');
const workCategories = document.querySelector('#workCategories');
const homeVideoMarquee = document.querySelector('#homeVideoMarquee');
const homeVideoTrack = document.querySelector('#homeVideoTrack');
let allProjects = [];
let activeCategory = 'ALL';
const WORKS_PAGE_SIZE = 8;
let visibleProjectCount = WORKS_PAGE_SIZE;
const worksLoadMore = document.querySelector('#worksLoadMore');
worksLoadMore.addEventListener('click', () => {
  visibleProjectCount += WORKS_PAGE_SIZE;
  renderProjects({ append: true });
});
let homePlayerId = 0;
let homePlayerWindow = null;
let homePlayerReady = false;
let homeListenerTimer = null;

function projectFilterCategory(category) {
  if (['MUSIC', 'ORIGINAL MUSIC', 'CUSTOM SONG'].includes(category)) return 'MUSIC';
  if (['VIDEO', 'VIDEO & GAME'].includes(category)) return 'VIDEO';
  return 'ETC';
}

function renderCategories() {
  workCategories.replaceChildren();
  ['ALL', 'MUSIC', 'VIDEO', 'ETC'].forEach(category => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = category;
    button.setAttribute('aria-pressed', String(activeCategory === category));
    button.addEventListener('click', () => {
      activeCategory = category;
      visibleProjectCount = WORKS_PAGE_SIZE;
      renderCategories();
      renderProjects();
    });
    item.append(button);
    workCategories.append(item);
  });
}

function getYouTubeVideoId(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let videoId = '';
    if (host === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] || '';
    } else if (['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com'].includes(host)) {
      if (url.pathname === '/watch') videoId = url.searchParams.get('v') || '';
      else videoId = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] || '';
    }
    return /^[A-Za-z0-9_-]{11}$/.test(videoId) ? videoId : '';
  } catch {
    return '';
  }
}

function setHomePlayerPlaying(isPlaying) {
  homeVideoMarquee.classList.toggle('is-playing', isPlaying);
}

function setHomeVideoCardPoster(card, titleText, videoId) {
  card.replaceChildren();
  const thumbnail = document.createElement('img');
  thumbnail.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  thumbnail.alt = '';
  thumbnail.loading = 'lazy';
  thumbnail.decoding = 'async';
  const play = document.createElement('button');
  play.className = 'home-video-play';
  play.type = 'button';
  play.setAttribute('aria-label', `${titleText} 영상 재생`);
  play.innerHTML = '<span aria-hidden="true">▶</span>';
  const title = document.createElement('span');
  title.className = 'home-video-title';
  title.textContent = titleText;
  card.append(thumbnail, play, title);
}

function createHomeVideoCard(project, videoId) {
  const card = document.createElement('article');
  card.className = 'home-video-card';
  card.dataset.videoId = videoId;
  card.dataset.title = project.title;
  setHomeVideoCardPoster(card, project.title, videoId);
  return card;
}

function renderHomeVideos(projects) {
  const videos = projects.filter(project => project.published && project.show_on_home && getYouTubeVideoId(project.link || ''));
  homeVideoTrack.replaceChildren();
  homeVideoMarquee.hidden = videos.length === 0;
  homeVideoMarquee.closest('.hero').classList.toggle('has-home-videos', videos.length > 0);
  if (!videos.length) return;

  const viewportWidth = homeVideoMarquee.clientWidth || window.innerWidth * 0.78;
  const cardWidth = window.matchMedia('(max-width: 640px)').matches
    ? Math.min(260, window.innerWidth * 0.56)
    : Math.min(320, window.innerWidth * 0.27);
  const repeatCount = Math.max(1, Math.ceil((viewportWidth * 1.35) / ((cardWidth + 16) * videos.length)));
  const group = document.createElement('div');
  group.className = 'home-video-group';
  for (let index = 0; index < repeatCount; index += 1) {
    videos.forEach(project => group.append(createHomeVideoCard(project, getYouTubeVideoId(project.link))));
  }
  homeVideoTrack.append(group, group.cloneNode(true));
  const duplicateGroup = homeVideoTrack.lastElementChild;
  duplicateGroup.setAttribute('aria-hidden', 'true');
  duplicateGroup.querySelectorAll('button').forEach(button => { button.tabIndex = -1; });
  const duration = Math.max(24, Math.round(group.scrollWidth / 46));
  homeVideoTrack.style.setProperty('--marquee-duration', `${duration}s`);
}

homeVideoTrack.addEventListener('click', event => {
  const button = event.target.closest('.home-video-play');
  if (!button) return;
  const card = button.closest('.home-video-card');
  const videoId = card.dataset.videoId;
  const title = card.dataset.title;
  homeVideoTrack.querySelectorAll('.home-video-card').forEach(previousCard => {
    const previousPlayer = previousCard.querySelector('.home-video-player');
    if (!previousPlayer) return;
    previousPlayer.src = 'about:blank';
    setHomeVideoCardPoster(previousCard, previousCard.dataset.title, previousCard.dataset.videoId);
  });
  window.clearInterval(homeListenerTimer);
  const iframe = document.createElement('iframe');
  iframe.id = `sf-home-player-${++homePlayerId}`;
  iframe.className = 'home-video-player';
  iframe.title = `${title} YouTube 영상`;
  iframe.loading = 'eager';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}&playsinline=1&rel=0`;
  homePlayerReady = false;
  setHomePlayerPlaying(true);
  card.replaceChildren(iframe);
  homePlayerWindow = iframe.contentWindow;
  iframe.addEventListener('load', () => {
    const sendListening = () => iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: iframe.id, channel: 'widget' }), 'https://www.youtube.com');
    sendListening();
    window.clearInterval(homeListenerTimer);
    homeListenerTimer = window.setInterval(() => {
      if (homePlayerReady || !iframe.isConnected) return window.clearInterval(homeListenerTimer);
      sendListening();
    }, 500);
  });
});

window.addEventListener('message', event => {
  if (event.origin !== 'https://www.youtube.com' || event.source !== homePlayerWindow) return;
  let data = event.data;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { return; }
  }
  if (!data || typeof data !== 'object') return;
  if (data.event === 'onReady') {
    homePlayerReady = true;
    window.clearInterval(homeListenerTimer);
    ['onStateChange', 'onError'].forEach(name => {
      event.source.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: [name], id: data.id, channel: 'widget' }), 'https://www.youtube.com');
    });
  }
  const state = data.event === 'onStateChange' ? data.info : data.info?.playerState;
  if (state === 1) setHomePlayerPlaying(true);
  else if (state === 0 || state === 2 || data.event === 'onError') setHomePlayerPlaying(false);
});

let homeResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(homeResizeTimer);
  homeResizeTimer = setTimeout(() => {
    if (homeVideoMarquee.querySelector('iframe')) return;
    const selected = allProjects.filter(project => project.show_on_home);
    renderHomeVideos(selected);
  }, 150);
});

function renderProjects({ append = false } = {}) {
  const filtered = activeCategory === 'ALL' ? allProjects : allProjects.filter(project => projectFilterCategory(project.category) === activeCategory);
  const start = append ? worksGrid.children.length : 0;
  if (!append) worksGrid.replaceChildren();
  filtered.slice(start, visibleProjectCount).forEach(project => {
    const card = document.createElement('article');
    card.className = 'work-card';
    const videoId = getYouTubeVideoId(project.link || '');
    if (videoId) {
      const media = document.createElement('div');
      media.className = 'work-card-media work-card-media--video';
      const play = document.createElement('button');
      play.className = 'work-video-trigger';
      play.type = 'button';
      play.setAttribute('aria-label', `${project.title} YouTube 영상 재생`);
      const poster = document.createElement('img');
      poster.src = project.image || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      poster.alt = `${project.title} 대표 이미지`;
      poster.loading = 'lazy';
      const playIcon = document.createElement('span');
      playIcon.className = 'work-video-play-icon';
      playIcon.setAttribute('aria-hidden', 'true');
      play.append(poster, playIcon);
      play.addEventListener('click', () => {
        const video = document.createElement('iframe');
        video.className = 'work-card-video';
        video.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`;
        video.title = `${project.title} YouTube 영상`;
        video.loading = 'lazy';
        video.referrerPolicy = 'strict-origin-when-cross-origin';
        video.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        video.allowFullscreen = true;
        media.replaceChildren(video);
      }, { once: true });
      media.append(play);
      card.append(media);
    } else if (project.image) {
      const image = document.createElement('img');
      image.className = 'work-card-image work-card-media';
      image.src = project.image;
      image.alt = `${project.title} 대표 이미지`;
      image.loading = 'lazy';
      card.append(image);
    }
    const category = document.createElement('span');
    category.className = 'work-category';
    category.textContent = project.category;
    const year = document.createElement('span');
    year.className = 'work-year';
    year.textContent = project.year || '';
    const title = document.createElement('h3');
    title.textContent = project.title;
    const description = document.createElement('p');
    description.textContent = project.description;
    const metadata = document.createElement('div');
    metadata.className = 'work-card-meta';
    metadata.append(category);
    if (project.year) metadata.append(year);
    card.append(metadata, title);
    if (project.description) card.append(description);
    if (project.link && !videoId) {
      const link = document.createElement('a');
      link.href = project.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = '프로젝트 보기 ↗';
      card.append(link);
    }
    worksGrid.append(card);
  });
  worksGrid.hidden = filtered.length === 0;
  worksLoadMore.hidden = visibleProjectCount >= filtered.length;
}

function prefillProjectInquiry() {
  const params = new URLSearchParams(window.location.search);
  const title = (params.get('project_title') || '').slice(0, 160);
  const type = params.get('type') || '';
  const projectField = document.querySelector('#contactForm [name="project_title"]');
  const typeField = document.querySelector('#contactForm [name="type"]');
  const allowedTypes = new Set(['맞춤형 음악', '광고·브랜드 음악', '영상·콘텐츠 음악', '기타']);
  if (projectField) projectField.value = title;
  if (typeField && allowedTypes.has(type)) typeField.value = type;
}

prefillProjectInquiry();

function applySettings(settings) {
  setHeadingLines('#heroTitle', settings.hero_title || '');
  setText('#heroDescription', settings.hero_description || '');
  setText('#aboutLead', settings.about_lead || '');
  setText('#aboutDescription', settings.about_description || '');
  for (let number = 1; number <= 5; number += 1) {
    setText(`[data-copy="service_${number}_title"]`, settings[`service_${number}_title`] || '');
    setText(`[data-copy="service_${number}_description"]`, settings[`service_${number}_description`] || '');
  }
  setHeadingLines('#worksTitle', settings.works_title || '');
  setHeadingLines('#contactTitle', settings.contact_title || '');
  setText('#contactDescription', settings.contact_description || '');
  setText('#contactFooterCopy', settings.footer_copy || '');
  setText('#footerCopy', settings.footer_copy || '');
}

fetch('/api/site')
  .then(response => { if (!response.ok) throw new Error('사이트 데이터를 불러오지 못했습니다.'); return response.json(); })
  .then(data => {
    applySettings(data.settings);
    allProjects = Array.isArray(data.projects) ? data.projects : [];
    renderHomeVideos(Array.isArray(data.homeProjects) ? data.homeProjects : []);
    renderCategories(data.categories || []);
    renderProjects();
    // The first API render can change the HOME height. Re-align a direct hash
    // URL after that layout shift so refresh/deep links land on their section.
    if (window.location.hash.length > 1) {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      target?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  })
  .catch(() => {
    // Static HTML defaults remain readable if the local server is temporarily unavailable.
    renderCategories(['ORIGINAL MUSIC', 'CUSTOM SONG', 'VIDEO & GAME', 'BRAND & EVENT']);
  });

document.querySelector('#contactForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector('.form-status');
  const emailInput = form.elements.email;
  const phoneInput = form.elements.phone;
  const hasReplyAddress = Boolean(emailInput.value.trim() || phoneInput.value.trim());
  emailInput.setCustomValidity(hasReplyAddress ? '' : '이메일 또는 휴대폰 번호 중 하나를 입력해 주세요.');
  if (!form.reportValidity()) return;
  const button = form.querySelector('.submit-button');
  button.disabled = true;
  status.textContent = '문의 내용을 보내고 있습니다…';
  status.classList.remove('is-error', 'is-success');
  const values = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.error || '문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    status.textContent = result.message;
    status.classList.add('is-success');
    form.reset();
  } catch (error) {
    status.textContent = error.message;
    status.classList.add('is-error');
  } finally {
    button.disabled = false;
  }
});
