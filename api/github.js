export default async function handler(req, res) {
  try {
    const repo = process.env.GITHUB_REPO || 'ayuubb/openclaw-project';
    const token = process.env.GITHUB_TOKEN;
    const headers = {
      'Accept': 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const [repoResp, commitsResp] = await Promise.all([
      fetch(`https://api.github.com/repos/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${repo}/commits?per_page=10`, { headers })
    ]);

    if (!repoResp.ok) {
      const txt = await repoResp.text();
      return res.status(500).json({ error: `repo fetch failed: ${txt}` });
    }
    if (!commitsResp.ok) {
      const txt = await commitsResp.text();
      return res.status(500).json({ error: `commits fetch failed: ${txt}` });
    }

    const [repoJson, commitsJson] = await Promise.all([repoResp.json(), commitsResp.json()]);
    res.status(200).json({ repo: repoJson, commits: commitsJson });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
