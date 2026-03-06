const fmtAgo = (iso) => {
  if (!iso) return '-';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

function setBadge(el, state) {
  el.className = 'badge';
  if (state === 'READY') {
    el.classList.add('ok');
    el.textContent = 'READY';
  } else if (state === 'ERROR' || state === 'CANCELED') {
    el.classList.add('bad');
    el.textContent = state;
  } else {
    el.classList.add('warn');
    el.textContent = state || 'UNKNOWN';
  }
}

async function load() {
  const [ghRes, veRes] = await Promise.all([
    fetch('/api/github').then((r) => r.json()),
    fetch('/api/vercel').then((r) => r.json())
  ]);

  if (ghRes.error) throw new Error(`GitHub: ${ghRes.error}`);
  if (veRes.error) throw new Error(`Vercel: ${veRes.error}`);

  document.getElementById('repoName').textContent = ghRes.repo?.full_name || '-';
  document.getElementById('repoLink').href = ghRes.repo?.html_url || '#';

  const latest = ghRes.commits?.[0];
  document.getElementById('latestCommit').textContent = latest ? fmtAgo(latest.commit.author.date) : '-';

  const tbody = document.getElementById('commitsTable');
  tbody.innerHTML = (ghRes.commits || []).slice(0, 8).map((c) => `
    <tr>
      <td>${(c.commit.message || '').split('\n')[0]}</td>
      <td>${c.commit.author?.name || '-'}</td>
      <td>${fmtAgo(c.commit.author?.date)}</td>
    </tr>
  `).join('') || '<tr><td colspan="3">No commit data</td></tr>';

  document.getElementById('deployCount').textContent = veRes.count24h ?? '-';
  setBadge(document.getElementById('deployState'), veRes.latest?.state);
  document.getElementById('deployMeta').textContent = veRes.latest
    ? `${veRes.latest.name || ''} • ${fmtAgo(veRes.latest.createdAt)}${veRes.latest.url ? ` • ${veRes.latest.url}` : ''}`
    : 'No deployment data';

  document.getElementById('updatedAt').textContent = `Updated: ${new Date().toLocaleString()}`;
}

async function refresh() {
  const btn = document.getElementById('refreshBtn');
  btn.disabled = true;
  btn.textContent = 'Refreshing...';
  try {
    await load();
  } catch (e) {
    document.getElementById('updatedAt').textContent = `Error: ${e.message}`;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Refresh';
  }
}

document.getElementById('refreshBtn').addEventListener('click', refresh);
refresh();
setInterval(refresh, 60000);
