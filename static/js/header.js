function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const header = document.querySelector('.site-header');

  if (!menuToggle || !navLinks || !header) return;

  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active')
      ? 'hidden'
      : '';
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (
      !menuToggle.contains(target) &&
      !navLinks.contains(target) &&
      navLinks.classList.contains('active')
    ) {
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Handle resize events
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 767) {
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      }
    }, 250);
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initMobileMenu);

Dropzone.autoDiscover = false;

document.addEventListener('DOMContentLoaded', function () {
  const submitBtn = document.getElementById('submitBtn');

  const myDropzone = new Dropzone('#uploadForm', {
    url: document.getElementById('uploadForm').action,
    acceptedFiles: '.csv',
    maxFiles: 1,
    autoProcessQueue: false,
    addRemoveLinks: true,
    dictDefaultMessage: 'גרור קובץ CSV לכאן או לחץ להעלאה',
    dictRemoveFile: 'הסר קובץ',
    dictFileTooBig: 'הקובץ גדול מדי',
    dictInvalidFileType: 'סוג קובץ לא חוקי. רק קבצי CSV מותרים',
  });

  myDropzone.on('addedfile', function () {
    submitBtn.disabled = false;
  });

  myDropzone.on('removedfile', function () {
    submitBtn.disabled = true;
  });

  submitBtn.addEventListener('click', function (e) {
    e.preventDefault();
    myDropzone.processQueue();
  });

  myDropzone.on('success', function (file, response) {
    // Handle success - you can redirect or show results here
    console.log('Upload successful', response);
  });

  myDropzone.on('error', function (file, errorMessage) {
    console.error('Upload error:', errorMessage);
    // Show error message to user
    const errorSpan = document.createElement('span');
    errorSpan.className = 'error-message';
    errorSpan.textContent = errorMessage;
    file.previewElement.appendChild(errorSpan);
  });
});
