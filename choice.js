const questionElement = document.querySelector('#question');
const answersElement = document.querySelector('#answers');
const feedbackElement = document.querySelector('#feedback');
const progressElement = document.querySelector('#progress');
const startButton = document.querySelector('#start');
const scoreElement = document.querySelector('#score');
const questionCount = 10;
let round = [];
let current = 0;
let correct = 0;

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function showQuestion() {
  if (current >= round.length) {
    questionElement.textContent = `測驗完成！你答對 ${correct} 題，得到 ${correct * 10} 分。`;
    progressElement.textContent = `${questionCount} / ${questionCount}`;
    answersElement.replaceChildren();
    feedbackElement.textContent = '這回的觀察任務完成，重新測驗會抽出新題。';
    startButton.textContent = '重新測驗';
    startButton.hidden = false;
    return;
  }

  const question = round[current];
  progressElement.textContent = `${current + 1} / ${questionCount}`;
  questionElement.textContent = question.prompt;
  feedbackElement.textContent = '';
  startButton.hidden = true;
  answersElement.replaceChildren(...question.choices.map((choice, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = choice;
    button.addEventListener('click', () => {
      for (const option of answersElement.querySelectorAll('button')) option.disabled = true;
      if (index + 1 === question.correctOption) {
        correct++;
        scoreElement.textContent = String(correct * 10);
        button.classList.add('correct');
        feedbackElement.textContent = '答對了！';
      } else {
        button.classList.add('incorrect');
        answersElement.children[question.correctOption - 1].classList.add('correct');
        feedbackElement.textContent = `正確答案是「${question.choices[question.correctOption - 1]}」。`;
      }
      window.setTimeout(() => { current++; showQuestion(); }, 850);
    });
    return button;
  }));
}

startButton.addEventListener('click', () => {
  round = shuffle(window.CHOICE_QUIZ).slice(0, questionCount);
  current = 0;
  correct = 0;
  scoreElement.textContent = '0';
  showQuestion();
});
