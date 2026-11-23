import { feedbackNotes } from './feedback-notes.js';

const links = [...document.querySelectorAll('nav a')];
const solutionTitle = document.querySelector('.brand').textContent;
const demos = document.querySelector('#demos');
const feedbackToggle = document.querySelector('#feedback-toggle');
const listToggle = document.querySelector('#feedback-list-toggle');
const listClose = document.querySelector('#feedback-list-close');
const panel = document.querySelector('#feedback-panel');
const panelHeading = document.querySelector('#feedback-title');
const list = document.querySelector('#feedback-list');
const status = document.querySelector('#feedback-status');
const frames = new Map();
let jumpAttempt = 0;

function setPanel(open, focus) {
  panel.hidden = !open;
  listToggle.setAttribute('aria-expanded', String(open));
  if (focus) (open ? panelHeading : listToggle).focus();
}

function goToFeedback(topic) {
  const frame = frames.get(window.location.pathname.replace(/\/$/, ''));
  const attempt = ++jumpAttempt;
  const deadline = performance.now() + 2000;
  let workspace;
  status.hidden = true;

  function findMarker() {
    if (attempt !== jumpAttempt) return;
    const frameDocument = frame?.contentDocument;
    const marker = frameDocument?.querySelector(`[data-feedback-topic="${topic}"]`);

    if (marker?.getClientRects().length) {
      setPanel(false);
      marker.querySelector('.peer-feedback-number').scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (attempt !== jumpAttempt || !marker.isConnected) return;
        marker.focus({ preventScroll: true });
        marker.click();
      }));
      return;
    }

    if (marker) {
      const disclosure = frameDocument.querySelector(`[data-feedback-disclosure="${topic}"][aria-expanded="false"]`);
      if (disclosure?.getClientRects().length) disclosure.click();
    } else if (!workspace) {
      workspace = frameDocument?.querySelector('[data-feedback-workspace]');
      workspace?.click();
    }

    if (performance.now() < deadline) requestAnimationFrame(findMarker);
    else {
      status.textContent = '표시 위치를 찾지 못했습니다. 화면이 로드된 뒤 다시 선택하세요.';
      status.hidden = false;
    }
  }

  findMarker();
}

for (const [topic, note] of Object.entries(feedbackNotes).sort(([, a], [, b]) => a.number - b.number)) {
  const [title, feedback, change] = note.ko;
  const item = document.createElement('li');
  item.innerHTML = `
    <details name="peer-feedback">
      <summary><span class="feedback-list-number" aria-hidden="true"></span><strong></strong><span class="feedback-chevron" aria-hidden="true"></span></summary>
      <div class="feedback-list-detail">
        <dl><dt>받은 피드백</dt><dd></dd><dt>최신 버전에서 바뀐 점</dt><dd></dd></dl>
        <button type="button" class="feedback-jump">화면에서 보기 <span aria-hidden="true">↗</span></button>
      </div>
    </details>`;
  item.querySelector('.feedback-list-number').textContent = note.number;
  item.querySelector('strong').textContent = title;
  const [before, after] = item.querySelectorAll('dd');
  before.textContent = feedback;
  after.textContent = change;
  const jump = item.querySelector('button');
  jump.setAttribute('aria-label', `${title} 화면에서 보기`);
  jump.addEventListener('click', () => goToFeedback(topic));
  list.append(item);
}
list.querySelector('details').open = true;

function syncFeedback(frame) {
  const frameDocument = frame.contentDocument;
  if (!frameDocument?.documentElement) return;
  const enabled = !frame.hidden && feedbackToggle.getAttribute('aria-pressed') === 'true';
  frameDocument.documentElement.toggleAttribute('data-show-peer-feedback', enabled);
  frameDocument.dispatchEvent(new Event('peer-feedback-change'));
}

feedbackToggle.addEventListener('click', () => {
  const enabled = feedbackToggle.getAttribute('aria-pressed') === 'true';
  feedbackToggle.setAttribute('aria-pressed', String(!enabled));
  jumpAttempt++;
  listToggle.hidden = enabled;
  setPanel(!enabled, !enabled);
  frames.forEach(syncFeedback);
});

listToggle.addEventListener('click', () => setPanel(panel.hidden, true));
listClose.addEventListener('click', () => setPanel(false, true));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !panel.hidden) setPanel(false, true);
});

function showVersion() {
  jumpAttempt++;
  status.hidden = true;
  const route = window.location.pathname.replace(/\/$/, '');
  for (const link of links) {
    const selected = link.pathname === route;
    let frame = frames.get(link.pathname);

    if (selected) {
      link.setAttribute('aria-current', 'page');
      document.title = `${solutionTitle} · ${link.textContent}`;
      if (!frame) {
        frame = document.createElement('iframe');
        frame.title = `${solutionTitle} · ${link.textContent}`;
        frame.addEventListener('load', () => syncFeedback(frame));
        frame.src = `/demo${link.pathname}/`;
        frames.set(link.pathname, frame);
        demos.append(frame);
      }
    } else {
      link.removeAttribute('aria-current');
    }

    if (frame) {
      frame.hidden = !selected;
      syncFeedback(frame);
    }
  }
}

for (const link of links) {
  link.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (link.pathname === window.location.pathname) return;
    window.history.pushState(null, '', link.href);
    showVersion();
  });
}

window.addEventListener('popstate', showVersion);
showVersion();
