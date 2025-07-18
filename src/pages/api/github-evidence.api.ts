import type { NextApiRequest, NextApiResponse } from 'next';

type GitHubRepo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  pushed_at: string;
};

type ImportedEvidence = {
  id: string;
  project: string;
  action: string;
  result: string;
  source: string;
  tags: string[];
  createdAt: string;
};

const GITHUB_API = 'https://api.github.com';
const TAG_RULES: Array<[string, string[]]> = [
  ['Technical Ownership', ['architecture', 'backend', 'frontend', 'fullstack', 'infra', 'docker', 'api', 'server', 'ios', 'flutter']],
  ['Product Thinking', ['product', 'ux', 'user', 'research', 'decision', 'workflow', 'discovery']],
  ['Rapid Prototyping', ['prototype', 'demo', 'hackathon', 'experiment', 'playground']],
  ['Problem Solving', ['optimization', 'observability', 'debug', 'rca', 'search', 'retrieval', 'rag']],
  ['Communication', ['documentation', 'docs', 'onboarding', 'collaboration']],
  ['User Empathy', ['accessibility', 'interview', 'feedback', 'journey', 'persona']],
];

function githubHeaders() {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'career-evidence-lab',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function githubFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, { headers: githubHeaders() });
  if (!response.ok) {
    const message = response.status === 404 ? 'GitHub 저장소 또는 사용자를 찾을 수 없습니다.' : 'GitHub 데이터를 불러오지 못했습니다.';
    throw new Error(message);
  }
  return (await response.json()) as T;
}

function normalizeReadme(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/[>*_`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstUsefulSentence(readme: string, fallback: string) {
  const clean = normalizeReadme(readme);
  if (!clean) return fallback;
  const sentence = clean.split(/(?<=[.!?。다])\s+/).find((item) => item.length >= 35) ?? clean;
  return sentence.slice(0, 260);
}

function inferTags(repo: GitHubRepo, text: string) {
  const haystack = [repo.language ?? '', repo.description ?? '', ...(repo.topics ?? []), text].join(' ').toLowerCase();
  const tags = TAG_RULES.filter(([, keywords]) => keywords.some((keyword) => haystack.includes(keyword))).map(([tag]) => tag);
  if (repo.language && !tags.includes('Technical Ownership')) tags.push('Technical Ownership');
  return tags.slice(0, 4);
}

async function readReadme(owner: string, repo: string) {
  try {
    const result = await githubFetch<{ content?: string; encoding?: string; html_url?: string }>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`,
    );
    if (result.encoding !== 'base64' || !result.content) return { text: '', source: '' };
    const text = Buffer.from(result.content.replace(/\n/g, ''), 'base64').toString('utf8');
    return { text, source: result.html_url ?? '' };
  } catch {
    return { text: '', source: '' };
  }
}

async function toEvidence(owner: string, repo: GitHubRepo): Promise<ImportedEvidence> {
  const readme = await readReadme(owner, repo.name);
  const fallback = repo.description ?? `${repo.name} 저장소를 설계하고 구현했습니다.`;
  const action = firstUsefulSentence(readme.text, fallback);
  const topicSummary = [...(repo.topics ?? []), repo.language].filter(Boolean).slice(0, 5).join(' · ');

  return {
    id: `github:${owner}/${repo.name}`,
    project: repo.name,
    action,
    result: topicSummary ? `Repository evidence · ${topicSummary}` : 'Repository evidence imported from GitHub',
    source: readme.source || repo.html_url,
    tags: inferTags(repo, `${action} ${topicSummary}`),
    createdAt: repo.pushed_at,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const owner = typeof req.query.owner === 'string' ? req.query.owner.trim() : '';
  const repository = typeof req.query.repo === 'string' ? req.query.repo.trim() : '';
  if (!/^[A-Za-z0-9-]{1,39}$/.test(owner)) {
    return res.status(400).json({ error: '올바른 GitHub 사용자명을 입력해 주세요.' });
  }

  try {
    let repos: GitHubRepo[];
    if (repository) {
      if (!/^[A-Za-z0-9_.-]{1,100}$/.test(repository)) {
        return res.status(400).json({ error: '올바른 저장소명을 입력해 주세요.' });
      }
      repos = [await githubFetch<GitHubRepo>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`)];
    } else {
      repos = await githubFetch<GitHubRepo[]>(
        `/users/${encodeURIComponent(owner)}/repos?sort=pushed&direction=desc&per_page=12&type=owner`,
      );
    }

    const candidates = repos.filter((repo) => !repo.fork && !repo.archived).slice(0, 8);
    const evidence = await Promise.all(candidates.map((repo) => toEvidence(owner, repo)));
    return res.status(200).json({ items: evidence });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GitHub 데이터를 불러오지 못했습니다.';
    return res.status(502).json({ error: message });
  }
}
