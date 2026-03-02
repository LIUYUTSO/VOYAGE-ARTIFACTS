export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { content, path, message, isBinary } = req.body;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'LIUYUTSO';
    const REPO_NAME = 'VOYAGE-ARTIFACTS';

    if (!GITHUB_TOKEN) {
        return res.status(500).json({ error: 'GitHub Token not configured' });
    }

    try {
        // 1. Get the current file SHA (if it exists) to allow updating
        let sha;
        try {
            const getFileRes = await fetch(
                `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
                {
                    headers: {
                        Authorization: `Bearer ${GITHUB_TOKEN}`,
                        Accept: 'application/vnd.github.v3+json',
                    },
                }
            );
            if (getFileRes.ok) {
                const fileData = await getFileRes.json();
                sha = fileData.sha;
            }
        } catch (err) {
            console.log('File does not exist yet, creating new one.');
        }

        // 2. Prepare content (handle binary for .glb files)
        let bodyContent = content;
        if (isBinary) {
            // Binary content should already be base64 from the client
            bodyContent = content;
        } else {
            bodyContent = Buffer.from(content).toString('base64');
        }

        // 3. Push to GitHub
        const pushRes = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message || 'CMS Update: Automatic push from Voyage artifacts',
                    content: bodyContent,
                    sha: sha, // Include SHA if updating
                    branch: 'main',
                }),
            }
        );

        const result = await pushRes.json();

        if (!pushRes.ok) {
            return res.status(pushRes.status).json({ error: result.message || 'GitHub Sync failed' });
        }

        return res.status(200).json({
            message: 'Cloud Sync Successful',
            url: result.content.html_url
        });

    } catch (error) {
        console.error('GitHub Sync Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
