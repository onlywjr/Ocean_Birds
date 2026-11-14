(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  window.transitionPageContent = (update, imageSource, afterTransition) => {
    const finish = () => afterTransition?.();
    const updateWhenReady = () => {
      if (reducedMotion.matches || typeof document.startViewTransition !== 'function') {
        update();
        requestAnimationFrame(() => requestAnimationFrame(finish));
        return;
      }
      const transition = document.startViewTransition(update);
      transition.finished.then(finish, finish);
    };

    if (!imageSource) {
      updateWhenReady();
      return;
    }

    const image = new Image();
    image.src = imageSource;
    if (image.complete) {
      Promise.resolve(image.decode?.()).catch(() => {}).finally(updateWhenReady);
    } else {
      image.onload = () => Promise.resolve(image.decode?.()).catch(() => {}).finally(updateWhenReady);
      image.onerror = updateWhenReady;
    }
  };
})();
