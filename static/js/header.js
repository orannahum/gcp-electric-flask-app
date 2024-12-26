// בדיקה אם Dropzone הוגדר כראוי
if (typeof Dropzone === 'undefined') {
  console.error('Dropzone לא נטען כראוי!');
} else {
  // השבתת גילוי אוטומטי
  Dropzone.autoDiscover = false;

  document.addEventListener('DOMContentLoaded', function () {
    const submitBtn = document.getElementById('submitBtn');

    // בדיקה שהטופס קיים לפני אתחול
    const uploadForm = document.getElementById('uploadForm');
    if (!submitBtn || !uploadForm) {
      console.error('אלמנט הטופס לא נמצא');
      return;
    }

    // אתחול Dropzone
    const myDropzone = new Dropzone('#uploadForm', {
      url: uploadForm.action,
      acceptedFiles: '.csv',
      maxFiles: 1,
      autoProcessQueue: false,
      addRemoveLinks: true,
      dictDefaultMessage: 'גרור קובץ CSV לכאן או לחץ להעלאה',
      dictRemoveFile: 'הסר קובץ',
      dictFileTooBig: 'הקובץ גדול מדי',
      dictInvalidFileType: 'סוג קובץ לא חוקי. רק קבצי CSV מותרים',
    });

    // עדכון כפתור שליחה
    myDropzone.on('addedfile', function () {
      submitBtn.disabled = false;
    });

    myDropzone.on('removedfile', function () {
      submitBtn.disabled = true;
    });

    // טיפול באירוע שליחה
    submitBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (myDropzone.getQueuedFiles().length === 0) {
        alert('נא להעלות קובץ לפני השליחה');
        return;
      }
      myDropzone.processQueue();
    });

    // טיפול בהצלחה
    myDropzone.on('success', function (file, response) {
      console.log('העלאה מוצלחת:', response);
    });

    // טיפול בשגיאה
    myDropzone.on('error', function (file, errorMessage) {
      console.error('שגיאת העלאה:', errorMessage);
      const errorSpan = document.createElement('span');
      errorSpan.className = 'error-message';
      errorSpan.textContent = errorMessage;
      file.previewElement.appendChild(errorSpan);
    });
  });
}
