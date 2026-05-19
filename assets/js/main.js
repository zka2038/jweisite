const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const carousel = document.querySelector(".carousel");

if (carousel) {
  const slides = carousel.querySelectorAll(".carousel-slide");
  const dots = carousel.querySelectorAll(".dot");
  const prevButton = carousel.querySelector(".carousel-btn.prev");
  const nextButton = carousel.querySelector(".carousel-btn.next");

  let currentSlide = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let lastWheelSlideTime = 0;

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));

    slides[index].classList.add("active");
    if (dots[index]) {
      dots[index].classList.add("active");
    }
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function previousSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }

  nextButton.addEventListener("click", nextSlide);
  prevButton.addEventListener("click", previousSlide);

  carousel.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  carousel.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) < 45 || Math.abs(deltaY) > Math.abs(deltaX) * 0.75) {
      return;
    }

    if (deltaX < 0) {
      nextSlide();
    } else {
      previousSlide();
    }
  }, { passive: true });

  carousel.addEventListener("wheel", (event) => {
    const horizontalSwipe = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.5;

    if (!horizontalSwipe || Math.abs(event.deltaX) < 24) {
      return;
    }

    event.preventDefault();

    const now = Date.now();
    if (now - lastWheelSlideTime < 500) {
      return;
    }

    lastWheelSlideTime = now;

    if (event.deltaX > 0) {
      nextSlide();
    } else {
      previousSlide();
    }
  }, { passive: false });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentSlide = index;
      showSlide(currentSlide);
    });
  });

  setInterval(nextSlide, 5000);
}

document.querySelectorAll(".artwork-gallery").forEach((gallery) => {
  const slides = gallery.querySelectorAll(".gallery-slide");
  const counter = gallery.querySelector(".gallery-counter");
  const prevButton = gallery.querySelector(".gallery-btn.prev");
  const nextButton = gallery.querySelector(".gallery-btn.next");
  const swipeSurface = gallery.querySelector(".gallery-stage") || gallery;

  if (slides.length < 2 || !counter || !prevButton || !nextButton) {
    return;
  }

  let currentSlide = Array.from(slides).findIndex((slide) => slide.classList.contains("active"));
  let pointerStartX = 0;
  let pointerStartY = 0;
  let isPointerDown = false;
  let activePointerId = null;
  let lastWheelSlideTime = 0;

  if (currentSlide < 0) {
    currentSlide = 0;
    slides[currentSlide].classList.add("active");
  }
  

  function showGallerySlide(index) {
    slides[currentSlide].classList.remove("active");
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add("active");
    counter.textContent = `${currentSlide + 1}/${slides.length}`;
  }

  function showNextGallerySlide() {
    showGallerySlide(currentSlide + 1);
  }

  function showPreviousGallerySlide() {
    showGallerySlide(currentSlide - 1);
  }

  function handleSwipe(deltaX, deltaY) {
    if (Math.abs(deltaX) < 45 || Math.abs(deltaY) > Math.abs(deltaX) * 0.75) {
      return;
    }

    if (deltaX < 0) {
      showNextGallerySlide();
    } else {
      showPreviousGallerySlide();
    }
  }

  gallery.addEventListener("click", (event) => {
    const button = event.target.closest(".gallery-btn");

    if (!button || !gallery.contains(button)) {
      return;
    }

    if (button.classList.contains("prev")) {
      showPreviousGallerySlide();
      return;
    }

    if (button.classList.contains("next")) {
      showNextGallerySlide();
    }
  });

  swipeSurface.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    if (event.target.closest(".gallery-btn")) {
      return;
    }

    isPointerDown = true;
    activePointerId = event.pointerId;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;

    if (swipeSurface.setPointerCapture) {
      swipeSurface.setPointerCapture(event.pointerId);
    }
  });

  swipeSurface.addEventListener("pointerup", (event) => {
    if (!isPointerDown || event.pointerId !== activePointerId) {
      return;
    }

    isPointerDown = false;
    activePointerId = null;
    handleSwipe(event.clientX - pointerStartX, event.clientY - pointerStartY);

    if (swipeSurface.hasPointerCapture && swipeSurface.hasPointerCapture(event.pointerId)) {
      swipeSurface.releasePointerCapture(event.pointerId);
    }
  });

  swipeSurface.addEventListener("pointercancel", (event) => {
    if (swipeSurface.hasPointerCapture && swipeSurface.hasPointerCapture(event.pointerId)) {
      swipeSurface.releasePointerCapture(event.pointerId);
    }

    isPointerDown = false;
    activePointerId = null;
  });

  swipeSurface.addEventListener("wheel", (event) => {
    const horizontalSwipe = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.5;

    if (!horizontalSwipe || Math.abs(event.deltaX) < 24) {
      return;
    }

    event.preventDefault();

    const now = Date.now();
    if (now - lastWheelSlideTime < 650) {
      return;
    }

    lastWheelSlideTime = now;

    if (event.deltaX > 0) {
      showNextGallerySlide();
    } else {
      showPreviousGallerySlide();
    }
  }, { passive: false });
});

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
