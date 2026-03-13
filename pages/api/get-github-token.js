import { isAuthorized } from '../../utils/auth';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!isAuthorized(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'GitHub Token missing from environment' });
    }

    // Expose token for frontend direct upload (Secured by Vercel deployment & Admin password context)
    return res.status(200).json({ token });
}
