const story = document.querySelector('#story');
document.querySelectorAll('[data-scroll]').forEach(button => {
  button.addEventListener('click', () => {
    story.scrollBy({ top: Number(button.dataset.scroll) * story.clientHeight * 0.7, behavior: 'smooth' });
  });
});
