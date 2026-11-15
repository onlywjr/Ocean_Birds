(() => {
  const birds = [
    ['白腹鰹鳥', 25], ['大白鷺', 27], ['小白鷺', 30], ['蒼鷺', 32], ['岩鷺', 34],
    ['黑鳶', 36], ['魚鷹', 38], ['彩鷸', 40], ['小環頸鴴', 42], ['東方環頸鴴', 44],
    ['金斑鴴', 46], ['鐵嘴鴴', 48], ['灰斑鴴', 50], ['小青足鷸', 52], ['中杓鷸', 54],
    ['半蹼鷸', 56], ['紅胸濱鷸', 58], ['磯鷸', 60], ['翻石鷸', 62], ['小燕鷗', 64],
    ['黑嘴鷗', 66], ['鳳頭燕鷗', 68], ['黑脊鷗', 70], ['翠鳥', 72], ['白鶺鴒', 74]
  ];
  const sizes = [4, 6, 8, 10, 12];
  const ranks = ['鳥類初學者', '鳥類觀察家', '鳥專家', '鳥博士', '鳥神'];
  const questionGrid = document.querySelector('#question-grid');
  const photoTray = document.querySelector('#photo-tray');
  const board = document.querySelector('#board');
  const welcome = document.querySelector('#welcome');
  const complete = document.querySelector('#complete');
  const statusRank = document.querySelector('#rank');
  const matchesOutput = document.querySelector('#matches');
  const totalOutput = document.querySelector('#total');
  const scoreOutput = document.querySelector('#score');
  const livesOutput = document.querySelector('#lives');
  const message = document.querySelector('#message');
  const nextRound = document.querySelector('#next-round');
  const photoPreview = document.querySelector('#photo-preview');
  let level = 0;
  let round = [];
  let matched = new Set();
  let selectedPhoto = null;
  let score = 0;
  let lives = 5;
  let locked = false;

  const shuffle = values => [...values].sort(() => Math.random() - .5);

  function setMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle('is-error', isError);
  }

  function renderLives() {
    livesOutput.replaceChildren(...Array.from({ length: 5 }, (_, index) => {
      const heart = document.createElement('span');
      heart.className = `life-heart${index >= lives ? ' is-lost' : ''}`;
      heart.textContent = '♥';
      heart.setAttribute('aria-hidden', 'true');
      return heart;
    }));
    livesOutput.setAttribute('aria-label', `剩餘 ${lives} 條命`);
  }

  function showPhotoPreview(photo, pointerEvent) {
    const image = photo.querySelector('img');
    if (!image) return;
    const bounds = photo.getBoundingClientRect();
    const width = Math.min(380, window.innerWidth - 28);
    const height = width / 1.5 + 16;
    const pointerX = pointerEvent?.clientX ?? bounds.left + bounds.width / 2;
    const pointerY = pointerEvent?.clientY ?? bounds.top + bounds.height / 2;
    const placeLeft = pointerX + 22 + width > window.innerWidth - 14;
    const left = placeLeft ? Math.max(14, pointerX - width - 22) : pointerX + 22;
    const top = Math.min(Math.max(14, pointerY - height / 2), window.innerHeight - height - 14);
    const previewImage = photoPreview.querySelector('img');
    if (previewImage.src !== image.src) {
      previewImage.src = image.src;
      previewImage.alt = image.alt;
    }
    photoPreview.style.setProperty('--preview-width', `${width}px`);
    photoPreview.style.left = `${left}px`;
    photoPreview.style.top = `${top}px`;
    photoPreview.classList.toggle('points-right', placeLeft);
    photoPreview.classList.add('is-visible');
  }

  function hidePhotoPreview() {
    photoPreview.classList.remove('is-visible');
  }

  function makeQuestion(bird) {
    const slot = document.createElement('button');
    slot.type = 'button';
    slot.className = 'question-slot';
    slot.dataset.pair = String(bird[1]);
    slot.setAttribute('aria-label', `將${bird[0]}的照片拖放至此`);
    const name = document.createElement('strong');
    name.textContent = bird[0];
    const hint = document.createElement('span');
    hint.className = 'slot-hint';
    hint.textContent = '拖放照片到這裡';
    slot.append(name, hint);
    slot.addEventListener('click', () => {
      if (selectedPhoto) matchPhotoToSlot(selectedPhoto, slot);
    });
    slot.addEventListener('dragover', event => {
      if (slot.disabled) return;
      event.preventDefault();
      slot.classList.add('is-drop-ready');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('is-drop-ready'));
    slot.addEventListener('drop', event => {
      event.preventDefault();
      slot.classList.remove('is-drop-ready');
      const pair = event.dataTransfer.getData('text/plain');
      const photo = photoTray.querySelector(`.bird-photo[data-pair="${CSS.escape(pair)}"]`);
      if (photo) matchPhotoToSlot(photo, slot);
    });
    return slot;
  }

  function makePhoto(bird) {
    const photo = document.createElement('button');
    photo.type = 'button';
    photo.className = 'bird-photo';
    photo.dataset.pair = String(bird[1]);
    photo.draggable = true;
    photo.setAttribute('aria-label', `拖曳${bird[0]}照片到上方正確的鳥名框`);
    const image = document.createElement('img');
    image.src = window.GUESS_IMAGE_PATHS[bird[1]];
    image.alt = bird[0];
    image.draggable = false;
    image.loading = 'lazy';
    photo.append(image);
    photo.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && !photo.disabled) showPhotoPreview(photo, event);
    });
    photo.addEventListener('pointermove', event => {
      if (event.pointerType === 'mouse' && !photo.disabled) showPhotoPreview(photo, event);
    });
    photo.addEventListener('pointerleave', hidePhotoPreview);
    photo.addEventListener('focus', () => showPhotoPreview(photo));
    photo.addEventListener('blur', hidePhotoPreview);
    photo.addEventListener('click', () => {
      if (locked || photo.disabled) return;
      photoTray.querySelectorAll('.bird-photo').forEach(item => item.classList.remove('is-selected'));
      if (selectedPhoto === photo) {
        selectedPhoto = null;
        setMessage('將鳥類照片拖進正確的鳥名框。');
        return;
      }
      selectedPhoto = photo;
      photo.classList.add('is-selected');
      setMessage('照片已選取，點上方正確鳥名框也可完成放置。');
    });
    photo.addEventListener('dragstart', event => {
      if (photo.disabled || locked) return event.preventDefault();
      selectedPhoto = photo;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', photo.dataset.pair);
      requestAnimationFrame(() => photo.classList.add('is-dragging'));
    });
    photo.addEventListener('dragend', () => {
      photo.classList.remove('is-dragging');
      questionGrid.querySelectorAll('.is-drop-ready').forEach(slot => slot.classList.remove('is-drop-ready'));
    });
    return photo;
  }

  function renderRound() {
    selectedPhoto = null;
    locked = false;
    const columns = round.length === 4 ? 4 : round.length / 2;
    questionGrid.style.setProperty('--columns', String(columns));
    photoTray.style.setProperty('--columns', String(columns));
    const questions = round.map(bird => {
      const slot = makeQuestion(bird);
      if (matched.has(String(bird[1]))) {
        slot.disabled = true;
        slot.classList.add('is-matched');
        slot.querySelector('.slot-hint').textContent = '配對完成 ✓';
      }
      return slot;
    });
    questionGrid.replaceChildren(...questions);
    photoTray.replaceChildren(...shuffle(round.filter(bird => !matched.has(String(bird[1])))).map(makePhoto));
  }

  function beginRound() {
    round = shuffle(birds).slice(0, sizes[level]);
    matched = new Set();
    statusRank.textContent = ranks[level];
    matchesOutput.textContent = '0';
    totalOutput.textContent = String(round.length);
    renderLives();
    document.querySelector('#round-kicker').textContent = `ROUND ${String(level + 1).padStart(2, '0')}`;
    document.querySelector('#round-title').textContent = level === 0 ? '認識海岸鳥類' : `${ranks[level]}挑戰`;
    nextRound.hidden = true;
    nextRound.textContent = level === sizes.length - 1 ? '完成挑戰 →' : '下一輪 →';
    setMessage('將鳥類照片拖進正確的鳥名框。');
    renderRound();
  }

  function matchPhotoToSlot(photo, slot) {
    if (!photo || !slot || locked || photo.disabled || slot.disabled) return;
    const right = photo.dataset.pair === slot.dataset.pair;
    selectedPhoto = null;
    photo.classList.remove('is-selected');
    if (right) {
      photo.disabled = true;
      photo.classList.add('is-matched');
      slot.disabled = true;
      slot.classList.add('is-matched');
      slot.querySelector('.slot-hint').textContent = '配對完成 ✓';
      matched.add(slot.dataset.pair);
      score += 10;
      scoreOutput.textContent = String(score);
      matchesOutput.textContent = String(matched.size);
      if (matched.size === round.length) {
        setMessage('全部配對正確！可以進入下一輪。');
        nextRound.hidden = false;
      } else {
        setMessage('答對了！再幫下一隻鳥找名字。');
      }
      return;
    }

    locked = true;
    lives = Math.max(0, lives - 1);
    renderLives();
    score = Math.max(0, score - 2);
    scoreOutput.textContent = String(score);
    photo.classList.add('is-mismatch');
    slot.classList.add('is-mismatch');
    setMessage(lives === 0 ? '生命值用完了，這趟辨認旅程結束。' : `名字不相符，失去一條命，還剩 ${lives} 條。`, true);
    window.setTimeout(() => {
      photo.classList.remove('is-mismatch');
      slot.classList.remove('is-mismatch');
      if (lives === 0) {
        finish(false);
        return;
      }
      locked = false;
      setMessage('將鳥類照片拖進正確的鳥名框。');
    }, 650);
  }

  function finish(won = true) {
    board.hidden = true;
    complete.hidden = false;
    document.querySelector('#complete-title').textContent = won ? '海岸鳥類專家' : '生命值用完了';
    const summary = won
      ? (score >= 360 ? '鳥類辨識高手，海岸的鳥兒都難不倒你！' : score >= 220 ? '觀察得很仔細，再多走幾趟海岸就能認識更多鳥朋友。' : '每一張照片都是新的線索，再挑戰一次，認識更多海岸鳥朋友吧。')
      : `五條命都用完了，最後一輪答對 ${matched.size} 題。重新開始，再試試看吧！`;
    document.querySelector('#final-score').textContent = String(score);
    document.querySelector('#complete-copy').textContent = summary;
  }

  document.querySelector('#begin').addEventListener('click', () => {
    level = 0;
    score = 0;
    lives = 5;
    renderLives();
    scoreOutput.textContent = '0';
    welcome.hidden = true;
    complete.hidden = true;
    board.hidden = false;
    beginRound();
  });
  document.querySelector('#reshuffle').addEventListener('click', () => {
    renderRound();
    setMessage('照片已重新排列，請繼續配對。');
  });
  nextRound.addEventListener('click', () => {
    if (level === sizes.length - 1) return finish();
    level++;
    beginRound();
  });
  document.querySelector('#play-again').addEventListener('click', () => {
    complete.hidden = true;
    board.hidden = false;
    level = 0;
    score = 0;
    lives = 5;
    renderLives();
    scoreOutput.textContent = '0';
    beginRound();
  });
})();
