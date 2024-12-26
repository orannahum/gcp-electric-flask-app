document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileUpload');
    const fileNameDisplay = document.querySelector('.file-name');
    const removeFileButton = document.querySelector('.remove-file');
    const uploadLabel = document.querySelector('.upload-text');
    const uploadHint = document.querySelector('.upload-hint');

    fileInput.addEventListener('change', function(e) {
        if (this.files.length > 0) {
            const fileName = this.files[0].name;
            fileNameDisplay.textContent = fileName;
            removeFileButton.style.display = 'inline-block';
            uploadLabel.style.display = 'none';
            uploadHint.style.display = 'none';
        }
    });

    removeFileButton.addEventListener('click', function() {
        fileInput.value = '';
        fileNameDisplay.textContent = '';
        this.style.display = 'none';
        uploadLabel.style.display = 'block';
        uploadHint.style.display = 'block';
    });
}); 