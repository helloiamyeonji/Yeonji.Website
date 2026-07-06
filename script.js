const capybara = document.getElementById('capybara');
const hometownSection = document.getElementById('hometown');
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

if (capybara) {
  const cryBubble = capybara.querySelector('.cry-bubble');
  const capybaraCries = [
    'Let me go!',
    'Please put me down!',
    'Hey, I need the floor!',
  ];
  let dragState = null;
  let fallFrame = null;

  const setDragPosition = (left, top, rotate) => {
    capybara.style.setProperty('--drag-left', `${left}px`);
    capybara.style.setProperty('--drag-top', `${top}px`);
    capybara.style.setProperty('--pull-rotate', `${rotate}deg`);
  };

  const beginDrag = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    window.cancelAnimationFrame(fallFrame);

    const rect = capybara.getBoundingClientRect();
    dragState = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      startX: event.clientX,
      width: rect.width,
      height: rect.height,
    };

    setDragPosition(rect.left, rect.top, 0);
    if (cryBubble) {
      cryBubble.textContent =
        capybaraCries[Math.floor(Math.random() * capybaraCries.length)];
    }

    capybara.classList.remove('is-falling');
    capybara.classList.remove('is-grounded');
    capybara.classList.add('is-dragging');
    capybara.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const moveDrag = (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }

    const left = clamp(
      event.clientX - dragState.offsetX,
      -24,
      window.innerWidth - dragState.width + 24,
    );
    const top = clamp(
      event.clientY - dragState.offsetY,
      12,
      window.innerHeight - dragState.height - 12,
    );
    const rotate = clamp((event.clientX - dragState.startX) / 18, -10, 10);

    setDragPosition(left, top, rotate);
  };

  const endDrag = (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }

    try {
      capybara.releasePointerCapture(event.pointerId);
    } catch {
      // The pointer may already be released by the browser.
    }

    dragState = null;
    capybara.classList.remove('is-dragging');
    capybara.classList.add('is-falling');
    capybara.style.setProperty('--pull-rotate', '0deg');

    const rect = capybara.getBoundingClientRect();
    const releasedLeft = rect.left;
    const groundTop = window.innerHeight - rect.height - 50;
    let top = Math.min(rect.top, groundTop);
    let velocity = 0;
    let lastTime = performance.now();

    const fall = (time) => {
      const delta = Math.min((time - lastTime) / 1000, 0.04);
      lastTime = time;
      velocity += 2600 * delta;
      top += velocity * delta;

      if (top >= groundTop) {
        top = groundTop;
        velocity *= -0.28;

        if (Math.abs(velocity) < 120) {
          setDragPosition(releasedLeft, groundTop, 0);
          capybara.classList.remove('is-falling');
          capybara.classList.add('is-grounded');
          return;
        }
      }

      setDragPosition(releasedLeft, top, 0);
      fallFrame = window.requestAnimationFrame(fall);
    };

    fallFrame = window.requestAnimationFrame(fall);
  };

  capybara.addEventListener('pointerdown', beginDrag);
  capybara.addEventListener('pointermove', moveDrag);
  capybara.addEventListener('pointerup', endDrag);
  capybara.addEventListener('pointercancel', endDrag);
}

if (hometownSection) {
  const updateHometown = () => {
    const rect = hometownSection.getBoundingClientRect();
    const progress = clamp(-rect.top / (rect.height - window.innerHeight), 0, 1);
    hometownSection.style.setProperty('--hometown-progress', progress);
    hometownSection.classList.toggle('is-expanded', progress > 0.42);
  };

  updateHometown();
  window.addEventListener('scroll', updateHometown, { passive: true });
  window.addEventListener('resize', updateHometown);
}
