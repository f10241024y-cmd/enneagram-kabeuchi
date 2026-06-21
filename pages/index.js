import React, { useState, useRef, useEffect, useCallback } from "react";
import Head from "next/head";
import { Send, RotateCcw, Copy, Check, Sparkles, Calendar } from "lucide-react";

const TYPE_LABELS = {
  1: "改革する人",
  2: "人を助ける人",
  3: "動機づける人",
  4: "個性的な人",
  5: "調べる人",
  6: "忠実な人",
  7: "熱中する人",
  8: "統率する人",
  9: "調停する人",
};

const SUBTYPE_LABELS = {
  sp: "自己保存",
  so: "社会的",
  sx: "一対一",
};

const INITIAL_MESSAGE = `エニアグラムには9つのタイプがあります。

1. 改革する人 — 正しさ・規律を重んじる
2. 人を助ける人 — 人に尽くす、愛されたい
3. 動機づける人 — 成果・評価を追い求める
4. 個性的な人 — 独自性、特別な感情を求める
5. 調べる人 — 知識で身を守る、観察者的
6. 忠実な人 — 安全・所属・信頼を求める
7. 熱中する人 — 楽しさ・可能性を追い続ける
8. 統率する人 — 力・自立・支配を求める
9. 調停する人 — 平和・調和を保ちたい

まずは直感で構いません。この中で「なんとなく自分っぽいな」と思うものはどれですか?(複数候補でもOKです。当たっていても外れていても、ここから一緒に検証していきます)`;

const TYPE_CHEATSHEET = `
# タイプ別チートシート(質問の精度を上げるための虎の巻。丸暗記の質問文をそのまま使うのではなく、
ユーザーの発言に応じて言い回しを変え、自然な対話の中に織り込むこと)

## 各タイプの核心(根元的欲求/根元的怖れ/決め手の質問)
※「ライト質問」は対話の最初、ユーザーが直感でタイプを選んだ直後に使う、明るく気軽な共感チェック用。
　「決め手」は、ライト質問で手応えを掴んだ後、本当にそのタイプかをさらに絞り込むための、やや踏み込んだ質問。

タイプ1(改革する人)
- 欲求:正しく・善く・誠実でありたい / 怖れ:腐敗・不道徳・不完全であること
- ライト質問:物事の「正しいやり方」が自然と気になる?改善点や粗が目につきやすい?時間やルールはきっちり守る方?
- 決め手:「正しいやり方」と違うものへの苛立ちは強いか。内なる批評家(もっと良くできるはず)の声は強いか。

タイプ2(人を助ける人)
- 欲求:無条件に愛されたい / 怖れ:求められない、愛される価値がない
- ライト質問:困ってる人を見ると放っておけない?人に頼られると嬉しい?気配り上手だとよく言われる?
- 決め手:人の役に立てていないと自分の存在価値が揺らぐか。自分のニーズより他者のニーズを優先しがちか。

タイプ3(動機づける人)
- 欲求:価値があると評価されたい / 怖れ:値打ちがない
- ライト質問:目標を立てて達成するのが好き?人からどう見られるか結構気にする方?効率よく成果を出すのが得意?
- 決め手:結果や評価を出せていない時、自分に価値がないと感じるか。「本当の自分」と「見せている自分」にズレを感じるか。

タイプ4(個性的な人)
- 欲求:自分の存在意義・独自性を見つけたい / 怖れ:取るに足りない存在だ
- ライト質問:人と同じより、自分らしい個性を大事にしたい?感情の機微に敏感な方?特別な体験や美しいものに惹かれる?
- 決め手:自分は人と違うという感覚が強いか。強い感情(喪失感・憧れ)に長く浸る傾向があるか。

タイプ5(調べる人)
- 欲求:有能で適任でありたい(知識・観察でリソースを確保) / 怖れ:無力で役に立たず無能
- ライト質問:一人の時間が好き?物事は深く理解してから動きたい方?知識や情報を集めるのが好き?
- 決め手:エネルギーや時間を他者に奪われることへの警戒が強いか。一人で知識を蓄えることで安心するか。

タイプ6(忠実な人)
- 欲求:安全と支援(所属)を見つけたい / 怖れ:自力で生き残れない
- ライト質問:何事も慎重に準備する方?信頼できる人やグループがいると安心する?最悪のケースをつい先に考えてしまう?
- 決め手:権威やルールに対して頼る方か疑う方か(恐怖順応型/恐怖対抗型)。最悪のシナリオを先回りして考える癖があるか。

タイプ7(熱中する人)
- 欲求:満ち足りて満足していたい / 怖れ:痛みや喪失に囚われること
- ライト質問:新しいことが好き?予定や選択肢はたくさんある方が安心する?退屈や制限されるのが苦手?
- 決め手:嫌な感情が来た時、気を逸らし前向きに切り替え別の選択肢を探す動きが自動的に出るか。可能性を検討する過程自体が楽しいか。

タイプ8(統率する人)
- 欲求:自分自身を守りたい(支配・コントロール) / 怖れ:他者から支配・危害を加えられる
- ライト質問:物事は自分で決めたい方?ストレートに物を言う方?頼られると力になりたくなる?
- 決め手:弱さを見せることに強い抵抗があるか。対立を恐れず、むしろ自分から仕掛ける方か。

タイプ9(調停する人)
- 欲求:内面の安定(心の平和)を保ちたい / 怖れ:奪われ引き離される
- ライト質問:争いごとはなるべく避けたい?まわりに合わせるのは得意な方?「まあいいか」とよく思う?
- 決め手:対立や緊張を避けるため自分の意見を後回しにしがちか。「まあいいか」と流すことが多いか。

## ウイング判別(基本タイプが決まった後、両隣のタイプの軸で対比する)
1w9:落ち着いた・距離を置いた改革者 / 1w2:人に関わる・教え導く改革者
2w1:原則的・一線を引く援助者 / 2w3:社交的・成功重視で愛を見せる援助者
3w2:人当たりが良く支援的な達成者 / 3w4:内省的で独自性を重視する達成者
4w3:外向的で成果も意識する個性派 / 4w5:内向的で知的な個性派
5w4:感情的・独自性重視の観察者 / 5w6:忠誠・体制志向が強い観察者
6w5:内向的・分析的な忠実者 / 6w7:外向的・楽観的な忠実者
7w6:仲間重視で不安も混じる熱中者 / 7w8:独立心が強く自己主張する熱中者
8w7:遊び心・刺激も重視する統率者 / 8w9:落ち着いた包容力のある統率者
9w8:自己主張がやや強い調停者 / 9w1:几帳面・理想主義が混じる調停者

## サブタイプ判別(ウイングが決まった後、最後に判定する)
- 自己保存(sp):物理的な安全・快適さ・リソース(お金・健康・環境・所有物)への関心が強く出るか
- 社会的(so):集団内での立ち位置・所属・社会的な評価・グループへの貢献に関心が強く出るか
- 一対一(sx):特定の一人との強い結びつき・魅力・情熱的な繋がりに関心が強く出るか

## 各タイプの「気をつけたいこと」と「成長のために意識したいこと」(最終診断の締めで使う)
タイプ1:気をつけたいこと=完璧主義で自分にも他人にも厳しくなりすぎること / 成長=「これで十分」を意識し、曖昧さを受け入れる練習
タイプ2:気をつけたいこと=自分のニーズを後回しにして燃え尽きること / 成長=頼まれなくても自分から休む・受け取る練習
タイプ3:気をつけたいこと=評価や成果のために本音を後回しにすること / 成長=評価がなくても自分の価値を感じる練習
タイプ4:気をつけたいこと=感情に浸りすぎて行動が止まること / 成長=感情を観察しつつ行動に移す練習
タイプ5:気をつけたいこと=知識に閉じこもり人との関わりや行動を避けること / 成長=情報を集めすぎず先に行動してみる練習
タイプ6:気をつけたいこと=不安から最悪を想定しすぎて動けなくなること / 成長=自分の内なる直感・判断を信頼する練習
タイプ7:気をつけたいこと=痛みや退屈から逃げて深掘りや継続を避けること / 成長=一つのことに留まり不快な感情にも向き合う練習
タイプ8:気をつけたいこと=力で押し通し弱さを見せず孤立すること / 成長=頼ることを許し、弱さを見せる練習
タイプ9:気をつけたいこと=自分の意見を後回しにして周りに流されること / 成長=自分の意見や望みを言葉にする練習
`;

const SYSTEM_PROMPT = `あなたは熟練したエニアグラムのガイド役です。ユーザーと一対一の「壁打ち」対話を通じて、
表面的な行動イメージではなく「根元的欲求」「根元的怖れへの反応パターン」「親への定位(保護者像・養育者像との関係)」
という深層の動機からタイプ・ウイング・サブタイプを、必ずこの順番のフェーズで特定していきます。

${TYPE_CHEATSHEET}

# フェーズの進め方(必ずこの順番を守る)

## フェーズA:基本タイプの特定(最優先・最初にここを終わらせる)
- 対話の最初に、ユーザーは9タイプの簡単な説明を見て「直感で近いと思うもの」を1つ以上選んでいる
- その直感の選択を出発点として扱う。**いきなり怖れ・痛みの話をしない。**
  まずチートシートの「ライト質問」を2〜3個、明るく気軽なテンションで聞き、
  「めっちゃ当たってる」「楽しい」と思える共感体験を先に作ることを最優先する
  (例:「7番を選んだあなたに聞きたいんですが、新しいことが好きですか?予定や選択肢はたくさんある方が安心しますか?」のように、
  リストの中から2〜3個まとめて聞いてもOK)
- ライト質問で十分な手応え(共感・肯定の反応)が得られたら、その流れのまま少しずつ深い話に移行する。
  「めっちゃ当てはまる」という反応が続いた後に、根元的な怖れ・痛みへの自動的な反応パターンを聞く
  (例:「ちなみに、嫌な感情や痛みを感じたとき、最初に体や心が勝手にやる動きって何かありますか?」)
- 親への定位(保護者像・養育者像とどう繋がっているか/断っているか/葛藤しているか)も検証材料として聞く
- ライト質問の反応が薄い・矛盾する場合は、無理にそのタイプを押し付けず、
  チートシートの「決め手」を参考に「実はこちらのタイプの方が近いかもしれません」と別タイプの可能性を提示して検証し直す
- 候補が2〜3タイプに絞れたら、チートシートの「決め手」を参考に、それらを見分ける質問をピンポイントで聞く
- 基本タイプの確度が medium 以上になったら、必ずその時点で診断タグを1度出力し、
  本文でも「ここまでで基本タイプはタイプ◯◯が濃厚です」とユーザーに明示してフェーズAを区切る
  (この時点では wing と subtype は空文字 "" のままでよい)

## フェーズB:ウイングの特定(基本タイプが medium 以上確定してから)
- チートシートの「ウイング判別」を参考に、両隣のタイプそれぞれの根拠となる質問を対比的に聞く
- 絞れたら診断タグを更新して出力する(wing を追加、confidence は据え置きか引き上げ)

## フェーズC:サブタイプの特定(ウイングが定まってから最後に)
- チートシートの「サブタイプ判別」を参考に、自己保存・社会的・一対一それぞれの典型的な
  刺激/エネルギーの向け先を対比する質問をする
- 確信が持てたら confidence="high" にして、type・wing・subtype すべて揃った最終タグを出力する
- **このとき本文の締めくくりは、「他に気になることはありますか?」のような開かれた質問で終わらせない。**
  必ずチートシートの「気をつけたいこと」と「成長のために意識したいこと」を、
  確定したタイプ・ウイング・サブタイプの組み合わせに合わせて自分の言葉でかみ砕き、
  「あなたが気をつけた方がいいこと」「成長のために意識したいこと」として伝えて締める

# 共通ルール
- チートシートの文言を機械的に読み上げず、ユーザーの言葉や文脈に合わせて自然な言い回しに変える
- ユーザーが「しっくりこない」と言ったら、ステレオタイプとのズレを疑い、動機ベースで再確認する
- 一問一答ではなく、回答を受けて深掘りする自然な対話にする。1ターンに質問は基本1つだけ
- 結論を急がない。各フェーズで根拠が複数そろうまで次のフェーズに進まない
- 診断タグは、新しい情報が増えてフェーズが進んだ/確度が変わったタイミングで毎回出力し直す
  (本文にもタグの内容を書いて構わない)
- confidence="high" の最終診断を出した後の対話で、話すことが一区切りついたタイミングでも、
  「何か気になることはありますか?」のような曖昧な質問で終わらせず、
  そのタイプが気をつけたいこと・成長のために意識したいことを具体的に伝えることを優先する

<diagnosis type="数字(1-9、必須)" wing="隣接タイプの数字、未確定なら空文字" subtype="sp|so|sx、未確定なら空文字" confidence="low|medium|high">
ここに、ここまでの根拠を踏まえた簡潔な要約(箇条書き可、150字程度)を書く
</diagnosis>

confidence="high" は type・wing・subtype すべての根拠がそろって初めて使うこと。

口調は親しみやすく、決めつけず、ユーザー自身の言葉を尊重する。説明は簡潔に。
対話の序盤(ライト質問の段階)は特にテンション高めで楽しく、「当たってる!」という体験を作ることを優先する。
深い質問に入ってからは、トーンを少し落ち着かせつつも親身さは保つ。
一度に長い講義をせず、対話のキャッチボールを大切にする。`;

function parseDiagnosis(text) {
  const m = text.match(/<diagnosis([^>]*)>([\s\S]*?)<\/diagnosis>/);
  if (!m) return { clean: text, diagnosis: null };
  const attrs = {};
  const attrRegex = /(\w+)="([^"]*)"/g;
  let am;
  while ((am = attrRegex.exec(m[1]))) attrs[am[1]] = am[2];
  const clean = (text.slice(0, m.index) + text.slice(m.index + m[0].length)).trim();
  return { clean, diagnosis: { ...attrs, summary: m[2].trim() } };
}

function EnneagramDiagram({ type, wing, confidence }) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  const pos = {};
  for (let n = 1; n <= 9; n++) {
    const angle = (-90 + ((n % 9) * 40)) * (Math.PI / 180);
    pos[n] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const hexad = [1, 4, 2, 8, 5, 7, 1];
  const triangle = [9, 6, 3, 9];

  const isActive = (n) => type && Number(type) === n;
  const isWing = (n) => wing && Number(wing) === n;
  const glow = confidence === "high";

  const lineColor = "rgba(240,233,226,0.16)";
  const activeColor = "#D98E4A";

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="エニアグラム図"
      style={{ display: "block", width: "100%", maxWidth: "260px", aspectRatio: "1 / 1" }}
    >
      {hexad.slice(0, -1).map((n, i) => (
        <line
          key={`h-${i}`}
          x1={pos[n].x} y1={pos[n].y}
          x2={pos[hexad[i + 1]].x} y2={pos[hexad[i + 1]].y}
          stroke={lineColor} strokeWidth="1"
        />
      ))}
      {triangle.slice(0, -1).map((n, i) => (
        <line
          key={`t-${i}`}
          x1={pos[n].x} y1={pos[n].y}
          x2={pos[triangle[i + 1]].x} y2={pos[triangle[i + 1]].y}
          stroke={lineColor} strokeWidth="1"
        />
      ))}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={lineColor} strokeWidth="1" />

      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <g key={n}>
          {isActive(n) && glow && (
            <circle cx={pos[n].x} cy={pos[n].y} r="16" fill={activeColor} opacity="0.18">
              <animate attributeName="r" values="14;19;14" dur="2.4s" repeatCount="indefinite" />
            </circle>
          )}
          <circle
            cx={pos[n].x} cy={pos[n].y}
            r={isActive(n) ? 9 : isWing(n) ? 7 : 5}
            fill={isActive(n) ? activeColor : isWing(n) ? "#5B9C92" : "#3A3240"}
            stroke={isActive(n) || isWing(n) ? "none" : "rgba(240,233,226,0.25)"}
            strokeWidth="1"
          />
          <text
            x={pos[n].x} y={pos[n].y}
            textAnchor="middle" dominantBaseline="central"
            fontSize="9" fontFamily="'JetBrains Mono', monospace"
            fill={isActive(n) || isWing(n) ? "#1F1A24" : "#A89A8E"}
            fontWeight={isActive(n) ? "700" : "400"}
          >
            {n}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const raw = (data?.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");

      const { clean, diagnosis: diag } = parseDiagnosis(raw || "(応答を取得できませんでした)");
      if (diag) setDiagnosis(diag);
      setMessages((prev) => [...prev, { role: "assistant", content: clean }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "接続でエラーが起きました。もう一度送ってみてください。" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const reset = () => {
    setMessages([{ role: "assistant", content: INITIAL_MESSAGE }]);
    setDiagnosis(null);
    setInput("");
  };

  const copySummary = () => {
    if (!diagnosis) return;
    const t = `【壁打ちエニアグラム診断】
タイプ${diagnosis.type}(${TYPE_LABELS[diagnosis.type] || ""}) / ウイング${diagnosis.wing} / ${SUBTYPE_LABELS[diagnosis.subtype] || diagnosis.subtype}サブタイプ

${diagnosis.summary}`;
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>エニアグラム壁打ち</title>
        <meta name="description" content="対話形式でエニアグラムのタイプ・ウイング・サブタイプを掘り下げる壁打ちアプリ" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#1F1A24" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </Head>
      <div style={appStyles.app}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,500;0,600;1,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; overflow: hidden; }
          ::selection { background: #D98E4A55; }
          .scrollbar::-webkit-scrollbar { width: 6px; }
          .scrollbar::-webkit-scrollbar-thumb { background: #4A404F; border-radius: 4px; }
          textarea:focus, button:focus-visible { outline: 2px solid #D98E4A; outline-offset: 2px; }
          @keyframes blink { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
          @media (max-width: 768px) {
            .sidebar { display: none !important; }
            .main-area { min-width: 100vw !important; }
          }
        `}</style>

        <aside className="sidebar" style={appStyles.sidebar}>
          <div>
            <div style={appStyles.eyebrow}>壁打ち式・対話型診断</div>
            <h1 style={appStyles.title}>エニアグラム<br />壁打ち</h1>
            <p style={appStyles.lead}>
              選択式テストでは届かない、根元的欲求と怖れの反応パターンを対話で掘り下げます。
            </p>
          </div>

          <div style={appStyles.diagramWrap}>
            <EnneagramDiagram type={diagnosis?.type} wing={diagnosis?.wing} confidence={diagnosis?.confidence} />
          </div>

          {diagnosis ? (
            <div style={appStyles.resultCard}>
              <div style={appStyles.resultEyebrow}>
                {diagnosis.confidence === "high"
                  ? "確定 ・ type + wing + subtype"
                  : diagnosis.wing
                  ? "ウイング判別中 ・ confidence " + diagnosis.confidence
                  : "基本タイプ判別中 ・ confidence " + diagnosis.confidence}
              </div>
              <div style={appStyles.resultType}>
                タイプ{diagnosis.type}
                <span style={appStyles.resultTypeLabel}>{TYPE_LABELS[diagnosis.type]}</span>
              </div>
              {(diagnosis.wing || diagnosis.subtype) && (
                <div style={appStyles.resultSub}>
                  {diagnosis.wing ? `ウイング${diagnosis.wing}` : "ウイング未確定"}
                  {diagnosis.subtype ? ` ・ ${SUBTYPE_LABELS[diagnosis.subtype] || diagnosis.subtype}サブタイプ` : ""}
                </div>
              )}
              <p style={appStyles.resultSummary}>{diagnosis.summary}</p>

              <button style={appStyles.copyBtn} onClick={copySummary}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "コピーしました" : "結果をコピー"}
              </button>

              {diagnosis.confidence === "high" && (
                <a href="#" style={appStyles.coachCta} onClick={(e) => e.preventDefault()}>
                  <Calendar size={14} />
                  この結果をもとに1on1で深掘りする
                </a>
              )}
            </div>
          ) : (
            <div style={appStyles.hintCard}>
              <Sparkles size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>会話が進むと、ここに見立てが浮かび上がってきます。</span>
            </div>
          )}

          <button style={appStyles.resetBtn} onClick={reset}>
            <RotateCcw size={13} /> 最初からやり直す
          </button>
        </aside>

        <main className="main-area" style={appStyles.main}>
          <div ref={scrollRef} className="scrollbar" style={appStyles.chatScroll}>
            {messages.map((m, i) => (
              <div key={i} style={m.role === "user" ? appStyles.rowUser : appStyles.rowAssistant}>
                <div style={m.role === "user" ? appStyles.bubbleUser : appStyles.bubbleAssistant}>
                  {m.content.split("\n").map((line, j) => (
                    <p key={j} style={{ margin: j === 0 ? 0 : "0.6em 0 0" }}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div style={appStyles.rowAssistant}>
                <div style={appStyles.bubbleAssistant}>
                  <span style={appStyles.typingDot}>●</span>
                  <span style={{ ...appStyles.typingDot, animationDelay: "0.2s" }}>●</span>
                  <span style={{ ...appStyles.typingDot, animationDelay: "0.4s" }}>●</span>
                </div>
              </div>
            )}
          </div>

          <div style={appStyles.inputBar}>
            <textarea
              style={appStyles.textarea}
              value={input}
              placeholder="思ったことをそのまま書いてください…"
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button style={appStyles.sendBtn} onClick={send} disabled={loading || !input.trim()} aria-label="送信">
              <Send size={16} />
            </button>
          </div>
        </main>
      </div>
    </>
  );
}

const palette = {
  bg: "#1F1A24",
  surface: "#251F2A",
  surface2: "#2F2734",
  border: "rgba(240,233,226,0.09)",
  text: "#F0E9E2",
  textMuted: "#A89A8E",
  accent: "#D98E4A",
  accent2: "#5B9C92",
};

const appStyles = {
  app: {
    display: "flex",
    minHeight: "100vh",
    height: "100vh",
    background: palette.bg,
    color: palette.text,
    fontFamily: "'Inter', sans-serif",
  },
  sidebar: {
    width: "320px",
    minWidth: "280px",
    flex: "0 0 320px",
    padding: "32px 26px",
    borderRight: `1px solid ${palette.border}`,
    display: "flex",
    flexDirection: "column",
    gap: "22px",
    overflowY: "auto",
  },
  eyebrow: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    letterSpacing: "0.12em",
    color: palette.accent2,
    marginBottom: "10px",
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 500,
    fontSize: "32px",
    lineHeight: 1.15,
    margin: "0 0 12px",
  },
  lead: {
    color: palette.textMuted,
    fontSize: "13.5px",
    lineHeight: 1.6,
    margin: 0,
  },
  diagramWrap: {
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  hintCard: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
    fontSize: "12.5px",
    color: palette.textMuted,
    lineHeight: 1.6,
    padding: "14px",
    background: palette.surface,
    border: `1px dashed ${palette.border}`,
    borderRadius: "12px",
  },
  resultCard: {
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  resultEyebrow: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    letterSpacing: "0.08em",
    color: palette.accent,
    textTransform: "uppercase",
  },
  resultType: {
    fontFamily: "'Fraunces', serif",
    fontSize: "22px",
    fontWeight: 600,
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
  },
  resultTypeLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px",
    fontWeight: 400,
    color: palette.textMuted,
  },
  resultSub: {
    fontSize: "12px",
    color: palette.accent2,
    fontFamily: "'JetBrains Mono', monospace",
  },
  resultSummary: {
    fontSize: "12.5px",
    color: palette.textMuted,
    lineHeight: 1.65,
    margin: "4px 0 6px",
  },
  copyBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    background: "transparent",
    border: `1px solid ${palette.border}`,
    color: palette.text,
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "12.5px",
    cursor: "pointer",
  },
  coachCta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    background: palette.accent,
    color: "#1F1A24",
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: "12.5px",
    fontWeight: 600,
    textDecoration: "none",
    marginTop: "2px",
  },
  resetBtn: {
    marginTop: "auto",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    color: palette.textMuted,
    fontSize: "12px",
    cursor: "pointer",
    padding: "8px",
  },
  main: {
    flex: "1 1 480px",
    display: "flex",
    flexDirection: "column",
    minWidth: "320px",
    height: "100vh",
  },
  chatScroll: {
    flex: 1,
    overflowY: "auto",
    padding: "36px 8% 20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  rowAssistant: { display: "flex", justifyContent: "flex-start" },
  rowUser: { display: "flex", justifyContent: "flex-end" },
  bubbleAssistant: {
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    borderRadius: "14px 14px 14px 4px",
    padding: "14px 16px",
    maxWidth: "640px",
    fontSize: "14.5px",
    lineHeight: 1.7,
  },
  bubbleUser: {
    background: palette.accent,
    color: "#1F1A24",
    borderRadius: "14px 14px 4px 14px",
    padding: "12px 16px",
    maxWidth: "640px",
    fontSize: "14.5px",
    lineHeight: 1.6,
    fontWeight: 500,
  },
  typingDot: {
    display: "inline-block",
    fontSize: "8px",
    margin: "0 1px",
    animation: "blink 1.2s infinite",
  },
  inputBar: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
    padding: "16px 8% 28px",
    borderTop: `1px solid ${palette.border}`,
  },
  textarea: {
    flex: 1,
    resize: "none",
    background: palette.surface2,
    border: `1px solid ${palette.border}`,
    borderRadius: "12px",
    padding: "12px 14px",
    color: palette.text,
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.5,
    maxHeight: "140px",
  },
  sendBtn: {
    background: palette.accent,
    border: "none",
    color: "#1F1A24",
    borderRadius: "10px",
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
};
