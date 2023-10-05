document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var fileInput = document.getElementById('myFile');
    var file = fileInput.files[0];

    var objectURL = URL.createObjectURL(file);
    var audio = new Audio(objectURL);

    audio.addEventListener('loadedmetadata', function() {
        var duration = audio.duration;
        console.log(duration);

        if (duration > 10) {
            alert('File is longer than 10 seconds.');
            return;
        }

        if (file.size > 1024 * 1024) {
            alert('File is larger than 1MB.');
            return;
        }

        if (file.name.split('.').pop().toLowerCase() !== 'mp3') {
            alert('Only .mp3 files are allowed.');
            return;
        }

        var formData = new FormData();
        formData.append('myFile', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            alert('File uploaded successfully.');
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred while uploading the file.');
        });
    });
});