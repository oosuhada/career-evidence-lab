import Link from 'next/link';
import { css } from '@emotion/react';

export default function CareerEvidenceHome() {
  return (
    <main css={pageCss}>
      <section css={heroCss}>
        <p css={eyebrowCss}>CAREER EVIDENCE LAB</p>
        <h1>
          강점을 주장하지 않고,
          <br />
          증거로 보여줍니다.
        </h1>
        <p css={descriptionCss}>
          동료 피드백만으로 나를 정의하지 않습니다. 프로젝트, GitHub, 회고, 실제 성과와 피드백을 하나의 Evidence로 모아
          반복해서 나타나는 강점을 발견합니다.
        </p>

        <div css={ctaRowCss}>
          <Link href="/evidence" css={primaryLinkCss}>
            내 Evidence 만들기
          </Link>
          <Link href="/survey" css={secondaryLinkCss}>
            기존 동료 피드백 사용하기
          </Link>
        </div>
      </section>

      <section css={principleGridCss}>
        <article>
          <span>01</span>
          <strong>Claim</strong>
          <p>“문제 해결을 잘한다”처럼 확인할 수 없는 자기소개를 먼저 쓰지 않습니다.</p>
        </article>
        <article>
          <span>02</span>
          <strong>Evidence</strong>
          <p>무엇을 바꿨고, 어떤 역할을 했고, 어떤 결과가 있었는지 실제 사건을 기록합니다.</p>
        </article>
        <article>
          <span>03</span>
          <strong>Pattern</strong>
          <p>여러 Evidence에서 반복되는 행동 패턴을 모아 나만의 커리어 강점으로 해석합니다.</p>
        </article>
      </section>
    </main>
  );
}

const pageCss = css`
  min-height: 100dvh;
  padding: 64px 12px 80px;
  color: #17202a;
  background:
    radial-gradient(circle at 20% 0%, rgb(180 215 255 / 42%), transparent 34rem),
    linear-gradient(180deg, #f7fbff 0%, #eef5fb 100%);
`;

const heroCss = css`
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 0 48px;

  h1 {
    margin: 12px 0 20px;
    font-size: clamp(38px, 8vw, 62px);
    line-height: 1.08;
    letter-spacing: -0.055em;
  }
`;

const eyebrowCss = css`
  margin: 0;
  color: #315f91;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.16em;
`;

const descriptionCss = css`
  max-width: 650px;
  margin: 0;
  color: #5f6f7f;
  font-size: 16px;
  line-height: 1.75;
`;

const ctaRowCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 30px;
`;

const primaryLinkCss = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0 20px;
  border-radius: 14px;
  background: #17202a;
  color: white;
  font-weight: 800;
  text-decoration: none;
`;

const secondaryLinkCss = css`
  ${primaryLinkCss}
  border: 1px solid rgb(23 32 42 / 12%);
  background: rgb(255 255 255 / 66%);
  color: #17202a;
`;

const principleGridCss = css`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  max-width: 720px;
  margin: 0 auto;

  article {
    min-height: 190px;
    padding: 20px;
    border: 1px solid rgb(23 32 42 / 8%);
    border-radius: 20px;
    background: rgb(255 255 255 / 72%);
  }

  span {
    color: #8aa0b6;
    font-size: 11px;
    font-weight: 800;
  }

  strong {
    display: block;
    margin-top: 28px;
    font-size: 20px;
  }

  p {
    margin: 9px 0 0;
    color: #637282;
    font-size: 13px;
    line-height: 1.6;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;

    article {
      min-height: auto;
    }

    strong {
      margin-top: 18px;
    }
  }
`;
