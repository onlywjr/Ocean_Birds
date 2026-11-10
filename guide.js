const firstFrame = 2;
const lastFrame = 6;
const viewer = document.querySelector('#original-frame');
const counter = document.querySelector('#page-counter');
const frameNumber = document.querySelector('#frame-number');
let frame = firstFrame;

function showFrame(nextFrame) {
  frame = Math.max(firstFrame, Math.min(lastFrame, nextFrame));
  viewer.src = `main-page.html?frame=${frame}`;
  counter.textContent = `${frame - firstFrame + 1} / ${lastFrame - firstFrame + 1}`;
  frameNumber.textContent = frame;
  document.querySelector('#previous').disabled = frame === firstFrame;
  document.querySelector('#next').disabled = frame === lastFrame;
}

document.querySelector('#previous').addEventListener('click', () => showFrame(frame - 1));
document.querySelector('#next').addEventListener('click', () => showFrame(frame + 1));
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') showFrame(frame - 1);
  if (event.key === 'ArrowRight') showFrame(frame + 1);
});
showFrame(firstFrame);
