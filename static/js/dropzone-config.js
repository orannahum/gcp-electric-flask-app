// Dropzone configuration
Dropzone.options.uploadForm = {
    acceptedFiles: '.csv',
    maxFiles: 1,
    maxFilesize: 10, // MB
    addRemoveLinks: true,
    autoProcessQueue: false,
    dictDefaultMessage: 'גרור קובץ CSV לכאן או לחץ להעלאה',
    dictMaxFilesExceeded: 'ניתן להעלות רק קובץ אחד',
    dictInvalidFileType: 'ניתן להעלות רק קובצי CSV',

    init: function() {
        var myDropzone = this;
        console.log('Dropzone initialized'); // Debug log

        // Handle maxfiles exceeded
        this.on("maxfilesexceeded", function(file) {
            console.log('Max files exceeded, removing all files');
            this.removeAllFiles();
            this.addFile(file);
        });
        
        // Handle file type errors
        this.on("error", function(file, message) {
            console.error('Dropzone error:', message);
            if (message === "You can't upload files of this type.") {
                alert("ניתן להעלות רק קובצי CSV");
            }
            this.removeFile(file);
        });

        // Handle file added
        this.on("addedfile", function(file) {
            console.log('File added:', file.name);
        });

        // Handle the submit button
        document.getElementById('submitBtn').addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Submit button clicked');
            
            if (myDropzone.files.length > 0) {
                console.log('Processing file:', myDropzone.files[0].name);
                myDropzone.processQueue();
            } else {
                console.log('No file selected');
                alert('נא להעלות קובץ CSV תחילה');
            }
        });

        // Handle upload success
        this.on("success", function(file, response) {
            console.log('Upload success, response:', response);
            
            // Check if response contains results
            if (response && response.includes('results')) {
                console.log('Results found in response');
                // Reload the page to show results
                window.location.reload();
            } else {
                console.log('No results in response');
                alert('הקובץ הועלה בהצלחה אך לא התקבלו תוצאות');
            }
        });

        // Handle upload complete
        this.on("complete", function(file) {
            console.log('Upload complete for file:', file.name);
        });

        // Handle any errors during upload
        this.on("error", function(file, errorMessage, xhr) {
            console.error('Upload error:', errorMessage);
            if (xhr) {
                console.error('Server response:', xhr.responseText);
            }
            alert('שגיאה בהעלאת הקובץ: ' + errorMessage);
        });
    },

    // Handle the actual sending of the file
    sending: function(file, xhr, formData) {
        console.log('Sending file:', file.name);
        // You can add additional form data here if needed
        // formData.append("additional_data", "value");
    }
};