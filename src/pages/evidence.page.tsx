import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { css } from '@emotion/react';

type Evidence = {
  id: string;
  project: string;
  action: string;
  result: string;
  source: string;
  tags: string[];
  createdAt: string;
};

const STORAGE_KEY = 'career-evidence-lab.items.v1';

const TAG_OPTIONS = [
  'Product Thinking',
  'Problem Solving',
  'Rapid Prototyping',
  'User Empathy',
  'Technical Ownership',
  'Communication',
];

export default function EvidencePage() {
  const [items, setItems] = useState<Evidence[]>([]);
  const [project, setProject] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');
  const [source, setSource] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [githubOwner, setGithubOwner] = useState('oosuhada');
  const [githubRepo, setGithubRepo] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      setItems(JSON.parse(saved) as Evidence[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const strengths = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      item.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count, ratio: items.length === 0 ? 0 : count / items.length }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const persist = (next: Evidence[]) => {
    setItems(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project.trim() || !action.trim()) return;

    const next: Evidence = {
      id: crypto.randomUUID(),
      project: project.trim(),
      action: action.trim(),
      result: result.trim(),
      source: source.trim(),
      tags: selectedTags,
      createdAt: new Date().toISOString(),
    };

    persist([next, ...items]);
    setProject('');
    setAction('');
    setResult('');
    setSource('');
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  const importGitHub = async () => {
    if (!githubOwner.trim() || isImporting) return;
    setIsImporting(true);
    setImportError('');
    try {
      const params = new URLSearchParams({ owner: githubOwner.trim() });
      if (githubRepo.trim()) params.set('repo', githubRepo.trim());
      const response = await fetch(`/api/github-evidence?${params.toString()}`);
      const payload = (await response.json()) as { items?: Evidence[]; error?: string };
      if (!response.ok || !payload.items) throw new Error(payload.error ?? 'GitHub import failed');

      const incoming = payload.items;
      const incomingIds = new Set(incoming.map((item) => item.id));
      persist([...incoming, ...items.filter((item) => !incomingIds.has(item.id))]);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'GitHub 데이터를 불러오지 못했습니다.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <main css={pageCss}>
      <header css={headerCss}>
        <Link href="/" css={backCss}>
          ← Career Evidence Lab
        </Link>
        <h1>Evidence Board</h1>
        <p>프로젝트에서 실제로 한 행동을 쌓으면 반복되는 강점이 자동으로 드러납니다.</p>
      </header>

      <section css={panelCss}>
        <div css={sectionHeaderCss}>
          <div>
            <span>SOURCE CONNECTOR</span>
            <h2>GitHub에서 Evidence 가져오기</h2>
          </div>
        </div>
        <p css={connectorCopyCss}>
          README, 저장소 설명, 기술 언어와 Topics를 읽어 Source가 연결된 Evidence 후보를 만듭니다. 저장소명을 비우면 최근 개인 저장소를 가져옵니다.
        </p>
        <div css={connectorCss}>
          <input value={githubOwner} onChange={(event) => setGithubOwner(event.target.value)} placeholder="GitHub owner" />
          <input value={githubRepo} onChange={(event) => setGithubRepo(event.target.value)} placeholder="Repository (optional)" />
          <button type="button" disabled={isImporting} onClick={importGitHub}>
            {isImporting ? '가져오는 중…' : 'GitHub 가져오기'}
          </button>
        </div>
        {importError && <p css={errorCss}>{importError}</p>}
      </section>

      <section css={panelCss}>
        <div css={sectionHeaderCss}>
          <div>
            <span>NEW EVIDENCE</span>
            <h2>하나의 사건을 기록하세요</h2>
          </div>
          <b>{items.length} evidence</b>
        </div>

        <form onSubmit={submit} css={formCss}>
          <label>
            <span>Project / Context</span>
            <input value={project} onChange={(event) => setProject(event.target.value)} placeholder="어떤 프로젝트였나요?" />
          </label>
          <label>
            <span>Action</span>
            <textarea
              value={action}
              onChange={(event) => setAction(event.target.value)}
              placeholder="내가 직접 발견하고 결정하고 바꾼 행동을 구체적으로 적어보세요."
            />
          </label>
          <label>
            <span>Result</span>
            <textarea
              value={result}
              onChange={(event) => setResult(event.target.value)}
              placeholder="사용자 경험, 속도, 매출, 운영 비용 등 어떤 변화가 있었나요?"
            />
          </label>
          <label>
            <span>Source</span>
            <input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="GitHub PR, README, 회고 링크 또는 동료 피드백"
            />
          </label>

          <div css={tagGroupCss}>
            <span>이 Evidence가 보여주는 행동 패턴</span>
            <div>
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  data-active={selectedTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button css={submitCss} type="submit">
            Evidence 저장
          </button>
        </form>
      </section>

      <section css={panelCss}>
        <div css={sectionHeaderCss}>
          <div>
            <span>PATTERN</span>
            <h2>반복되는 강점</h2>
          </div>
        </div>

        {strengths.length === 0 ? (
          <p css={emptyCss}>태그가 포함된 Evidence를 쌓으면 강점 패턴이 여기에 나타납니다.</p>
        ) : (
          <div css={strengthListCss}>
            {strengths.map((strength) => (
              <div key={strength.name}>
                <div>
                  <strong>{strength.name}</strong>
                  <span>{strength.count} evidence</span>
                </div>
                <i>
                  <em style={{ width: `${Math.max(8, strength.ratio * 100)}%` }} />
                </i>
              </div>
            ))}
          </div>
        )}
      </section>

      <section css={listCss}>
        {items.map((item) => (
          <article key={item.id} css={evidenceCardCss}>
            <div css={cardMetaCss}>
              <span>{item.project}</span>
              <button type="button" onClick={() => persist(items.filter((candidate) => candidate.id !== item.id))}>
                삭제
              </button>
            </div>
            <h3>{item.action}</h3>
            {item.result && <p>{item.result}</p>}
            {item.tags.length > 0 && <div css={cardTagsCss}>{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
            {item.source && (
              <small>
                Source ·{' '}
                <a href={item.source} target="_blank" rel="noreferrer">
                  {item.source}
                </a>
              </small>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

const pageCss = css`
  min-height: 100dvh;
  padding: 48px 12px 90px;
  background: #f3f7fb;
  color: #17202a;
`;

const headerCss = css`
  max-width: 720px;
  margin: 0 auto 24px;

  h1 {
    margin: 22px 0 8px;
    font-size: 38px;
    letter-spacing: -0.045em;
  }

  p {
    margin: 0;
    color: #687887;
    line-height: 1.6;
  }
`;

const backCss = css`
  color: #527497;
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
`;

const panelCss = css`
  max-width: 720px;
  margin: 0 auto 14px;
  padding: 22px;
  border: 1px solid rgb(23 32 42 / 7%);
  border-radius: 22px;
  background: white;
`;

const sectionHeaderCss = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;

  span {
    color: #8aa0b6;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.12em;
  }

  h2 {
    margin: 5px 0 0;
    font-size: 20px;
  }

  b {
    padding: 6px 9px;
    border-radius: 999px;
    background: #edf4fa;
    color: #55738f;
    font-size: 11px;
  }
`;

const formCss = css`
  display: grid;
  gap: 13px;

  label {
    display: grid;
    gap: 6px;
  }

  label > span,
  & > div > span {
    color: #667787;
    font-size: 11px;
    font-weight: 800;
  }

  input,
  textarea {
    width: 100%;
    border: 1px solid #dfe8ef;
    border-radius: 12px;
    outline: none;
    background: #f9fbfd;
    color: #17202a;
    font: inherit;
  }

  input {
    height: 46px;
    padding: 0 12px;
  }

  textarea {
    min-height: 92px;
    padding: 12px;
    resize: vertical;
  }

  input:focus,
  textarea:focus {
    border-color: #7ba3c9;
  }
`;

const connectorCopyCss = css`
  margin: -4px 0 14px;
  color: #687887;
  font-size: 12px;
  line-height: 1.6;
`;

const connectorCss = css`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) auto;
  gap: 8px;

  input,
  button {
    min-height: 44px;
    border-radius: 12px;
    font: inherit;
  }

  input {
    min-width: 0;
    padding: 0 12px;
    border: 1px solid #dfe8ef;
    outline: 0;
    background: #f9fbfd;
  }

  button {
    padding: 0 14px;
    border: 0;
    background: #426b92;
    color: white;
    font-size: 11px;
    font-weight: 850;
    cursor: pointer;
  }

  button:disabled {
    cursor: progress;
    opacity: 0.55;
  }

  @media (width <= 620px) {
    grid-template-columns: 1fr;
  }
`;

const errorCss = css`
  margin: 10px 0 0;
  color: #a45d5d;
  font-size: 11px;
`;

const tagGroupCss = css`
  display: grid;
  gap: 9px;

  div {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  button {
    padding: 8px 10px;
    border: 1px solid #dce6ee;
    border-radius: 999px;
    background: white;
    color: #657789;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }

  button[data-active='true'] {
    border-color: #426b92;
    background: #426b92;
    color: white;
  }
`;

const submitCss = css`
  height: 50px;
  border: 0;
  border-radius: 13px;
  background: #17202a;
  color: white;
  font-weight: 850;
  cursor: pointer;
`;

const emptyCss = css`
  margin: 0;
  padding: 20px;
  border-radius: 14px;
  background: #f7fafc;
  color: #8594a1;
  font-size: 13px;
  text-align: center;
`;

const strengthListCss = css`
  display: grid;
  gap: 14px;

  & > div > div {
    display: flex;
    justify-content: space-between;
    margin-bottom: 7px;
  }

  strong,
  span {
    font-size: 12px;
  }

  span {
    color: #8797a5;
  }

  i {
    display: block;
    height: 7px;
    overflow: hidden;
    border-radius: 999px;
    background: #e9f0f5;
  }

  em {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: #5a82a9;
  }
`;

const listCss = css`
  display: grid;
  gap: 10px;
  max-width: 720px;
  margin: 0 auto;
`;

const evidenceCardCss = css`
  padding: 20px;
  border: 1px solid rgb(23 32 42 / 7%);
  border-radius: 20px;
  background: white;

  h3 {
    margin: 8px 0;
    font-size: 17px;
    line-height: 1.5;
  }

  p {
    margin: 0;
    color: #687887;
    font-size: 13px;
    line-height: 1.6;
  }

  small {
    display: block;
    margin-top: 12px;
    color: #98a6b2;
    font-size: 10px;
  }

  small a {
    color: inherit;
    text-underline-offset: 2px;
  }
`;

const cardMetaCss = css`
  display: flex;
  justify-content: space-between;
  gap: 12px;

  span {
    color: #527497;
    font-size: 11px;
    font-weight: 800;
  }

  button {
    border: 0;
    background: transparent;
    color: #a5b0ba;
    font-size: 10px;
    cursor: pointer;
  }
`;

const cardTagsCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;

  span {
    padding: 5px 8px;
    border-radius: 999px;
    background: #edf4fa;
    color: #55738f;
    font-size: 10px;
    font-weight: 700;
  }
`;
