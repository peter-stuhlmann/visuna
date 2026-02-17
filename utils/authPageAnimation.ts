export const pageAnimation = () => {
  // OLD CONTENT
  document.documentElement.animate(
    [
      { opacity: 1, scale: 1 },
      { opacity: 0, scale: 0 },
    ],
    {
      duration: 600,
      easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
      fill: 'forwards',
      pseudoElement: '::view-transition-old(auth-content)',
    }
  );

  // NEW CONTENT
  document.documentElement.animate(
    [
      { opacity: 0, transform: 'translateY(100%)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    {
      duration: 600,
      easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
      fill: 'forwards',
      pseudoElement: '::view-transition-new(auth-content)',
    }
  );
};
