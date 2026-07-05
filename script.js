const capybara = document.getElementById('capybara');

if (capybara) {
  let dragState = null;
  let releaseTimer = null;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const setDragPosition = (left, top, rotate) => {
    capybara.style.setProperty('--drag-left', `${left}px`);
    capybara.style.setProperty('--drag-top', `${top}px`);
    capybara.style.setProperty('--pull-rotate', `${rotate}deg`);
  };

  const beginDrag = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    window.clearTimeout(releaseTimer);

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
    capybara.classList.remove('is-released');
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
    capybara.classList.add('is-released');
    capybara.style.setProperty('--pull-rotate', '0deg');

    releaseTimer = window.setTimeout(() => {
      capybara.classList.remove('is-released');
      capybara.removeAttribute('style');
    }, 850);
  };

  capybara.addEventListener('pointerdown', beginDrag);
  capybara.addEventListener('pointermove', moveDrag);
  capybara.addEventListener('pointerup', endDrag);
  capybara.addEventListener('pointercancel', endDrag);
}
