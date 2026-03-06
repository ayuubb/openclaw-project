export default async function handler(req, res) {
  try {
    const token = process.env.VERCEL_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;

    if (!token || !projectId) {
      return res.status(200).json({
        latest: null,
        count24h: 0,
        note: 'Set VERCEL_TOKEN and VERCEL_PROJECT_ID in environment variables.'
      });
    }

    const resp = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(500).json({ error: `vercel fetch failed: ${txt}` });
    }

    const data = await resp.json();
    const deployments = data.deployments || [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const count24h = deployments.filter((d) => now - new Date(d.createdAt).getTime() <= oneDay).length;

    const latest = deployments[0]
      ? {
          id: deployments[0].uid,
          name: deployments[0].name,
          state: deployments[0].state,
          createdAt: deployments[0].createdAt,
          url: deployments[0].url ? `https://${deployments[0].url}` : null
        }
      : null;

    res.status(200).json({ latest, count24h });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
