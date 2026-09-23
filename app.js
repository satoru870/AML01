const quizState = { score: 0, currentStep: 0, answers: [] };

const quizQuestions = [
  { question: '高リスクの法域との間で、明白なビジネス上の理由がない電信送金が続いている。', feedback: 'CAMS基準における不自然な電信送金のレッド・フラッグに該当します。送金目的と資金源を確認し、合理性が説明できない場合はEDD（強化された顧客管理）を開始してください。' },
  { question: '報告基準額をわずかに下回る現金入金が、複数の支店で短期間に行われている。', feedback: 'ストラクチャリング／スマーフィングの典型的な兆候です。顧客単位・関係者単位で取引を集約し、通常の取引プロファイルと照合します。' },
  { question: '顧客が実質的支配者（UBO）の情報提供を躊躇し、名目上の役員だけを提示している。', feedback: '透明性の欠如は高リスク指標です。UBO、SOW（富の源泉）、SOF（資金の源泉）を検証できるまで、口座開設や取引を保留します。' },
  { question: '暗号資産がミキサーを経由し、複数チェーンへ短時間で移動している。', feedback: 'ミキサー利用とチェーンホッピングの組み合わせは、追跡回避を意図した可能性があります。ウォレット・エクスポージャーと取引目的を確認してください。' },
  { question: '顧客の事業内容と一致しない高額な第三者支払いを要求している。', feedback: '経済合理性のない第三者支払いは、資金の迂回や受益者隠蔽の兆候です。契約書、請求書、支払関係者の関係性を確認し、必要なら報告手順へ進みます。' },
  { question: '古物商に対し、所在地から大きく離れた地域の金属類を現金で大量に売却している。', feedback: 'NRA令和7年版が示す組織的な金属類窃盗リスクと整合する可能性があります。品目の由来、本人確認、取引頻度を精査してください。' },
  { question: '送り状の価格が市場価格と著しく乖離し、輸送経路も経済的に不合理である。', feedback: 'TBML（貿易ベースのマネー・ローンダリング）のレッド・フラッグです。価格、数量、貨物、輸送、支払の5点を独立資料で突合します。' },
  { question: '顧客が本人確認書類の提出を繰り返し拒み、急いだ口座開設を求めている。', feedback: 'CDDの実施を妨げる行動は重大なリスク予兆です。確認が完了するまで関係開始を見合わせ、拒否の事実を記録してください。' },
  { question: '休眠状態だった口座が、突然、多数の小口入金と海外送金に使われている。', feedback: '口座乗っ取りやマネーミュール利用の可能性があります。過去のプロファイルからの逸脱としてアラートを発出し、送金先のリスクも確認します。' },
  { question: '取引の複雑さを説明する資料がないのに、複数の法人・法域を経由する決済を求めている。', feedback: 'レイヤリングによる資金の出所隠蔽が疑われます。取引の最終受益者と目的を把握できない場合、EDDとエスカレーションを行います。' }
];

function getQuizElements() {
  return { question: document.querySelector('[data-quiz-question]'), count: document.querySelector('[data-quiz-count]'), progress: document.querySelector('[data-quiz-progress]'), answers: document.querySelector('[data-quiz-answers]'), feedback: document.querySelector('[data-quiz-feedback]'), result: document.querySelector('[data-quiz-result]') };
}
function renderQuestion() {
  const elements = getQuizElements();
  if (!elements.question) return;
  const current = quizQuestions[quizState.currentStep];
  elements.question.textContent = current.question;
  elements.count.textContent = `RISK CHECK / ${String(quizState.currentStep + 1).padStart(2, '0')} OF ${quizQuestions.length}`;
  elements.progress.style.width = `${((quizState.currentStep) / quizQuestions.length) * 100}%`;
  elements.feedback.hidden = true;
  elements.answers.innerHTML = '<button class="quiz__answer" type="button" data-answer="yes" aria-label="はい、高リスクの兆候として該当する">はい、該当する</button><button class="quiz__answer" type="button" data-answer="no" aria-label="いいえ、現時点では該当しない">いいえ、該当しない</button>';
  elements.answers.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', () => handleAnswer(button.dataset.answer)));
}
function renderFeedback(answer) {
  const elements = getQuizElements();
  const current = quizQuestions[quizState.currentStep];
  elements.feedback.innerHTML = answer === 'yes' ? `<strong>リスクシグナルを検知</strong><span>${current.feedback}</span>` : '<strong>継続監視を推奨</strong><span>現時点で該当しない場合も、顧客プロファイルと取引実態の変化を継続的にモニタリングしてください。</span>';
  elements.feedback.hidden = false;
}
function handleAnswer(answer) {
  quizState.answers.push(answer);
  if (answer === 'yes') quizState.score += 1;
  renderFeedback(answer);
  const elements = getQuizElements();
  elements.answers.querySelectorAll('button').forEach((button) => { button.disabled = true; });
  window.setTimeout(() => {
    quizState.currentStep += 1;
    if (quizState.currentStep < quizQuestions.length) renderQuestion(); else renderResult();
  }, 2200);
}
function renderResult() {
  const elements = getQuizElements();
  elements.progress.style.width = '100%';
  elements.count.textContent = 'RISK CHECK / COMPLETE';
  elements.question.hidden = true;
  elements.answers.hidden = true;
  elements.feedback.hidden = true;
  elements.result.hidden = false;
  const level = quizState.score >= 7 ? 'HIGH' : quizState.score >= 4 ? 'ELEVATED' : 'BASELINE';
  elements.result.innerHTML = `<div class="quiz__result-score">${quizState.score}<small> / 10</small></div><h3>診断レベル：${level}</h3><p>${level === 'HIGH' ? '複数の重大なレッド・フラッグが確認されました。EDD、取引制限、責任者への即時エスカレーションを検討してください。' : '検知力を維持するため、5つの実務テーマを定期的に復習し、顧客・取引プロファイルを更新してください。'}</p><button class="button button--primary" type="button" data-quiz-reset>もう一度診断する</button>`;
  elements.result.querySelector('[data-quiz-reset]').addEventListener('click', resetQuiz);
}
function resetQuiz() { quizState.score = 0; quizState.currentStep = 0; quizState.answers = []; const elements = getQuizElements(); elements.question.hidden = false; elements.answers.hidden = false; elements.result.hidden = true; renderQuestion(); }

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (toggle && nav) toggle.addEventListener('click', () => { const open = nav.classList.toggle('site-nav--open'); toggle.setAttribute('aria-expanded', String(open)); });
  const quiz = document.querySelector('[data-quiz]');
  if (quiz) renderQuestion();
});
