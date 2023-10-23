import { loadFiles } from "./file-list.js";

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('#myFile').addEventListener('change', function(e) {
      var fileName = e.target.files[0].name;
      var nextSibling = e.target.nextElementSibling
      nextSibling.innerText = fileName
    })
});

export function loadNextPlaybackTime() {
    fetch('/nextplaybacktime')
        .then(response => response.text())
        .then(data => {
            const nextPlaybackTime = document.getElementById('nextPlaybackTime');
            nextPlaybackTime.textContent = `Playing next time: ${data}`;
        })
        .catch(error => console.error('Error:', error));
}

document.getElementById('uploadForm').addEventListener('submit', function (event) {
    event.preventDefault();

    var fileInput = document.getElementById('myFile');
    var file = fileInput.files[0];
    var youtubeLink = document.getElementById('youtubeLink').value;

    if (file) {
        var objectURL = URL.createObjectURL(file);
        var audio = new Audio(objectURL);

        audio.addEventListener('loadedmetadata', function () {
            var duration = audio.duration;
            console.log(duration);

            if (duration >= 10) {
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
                })
                .catch(error => {
                    console.error(error);
                    alert('An error occurred while uploading the file.');
                }).finally(() => {
                    fileInput.value = '';
                    loadFiles();
                    alert('File uploaded successfully.');
                });
        });
    } else if (youtubeLink) {
        console.log(youtubeLink);
        fetch('/upload-youtube', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: youtubeLink
                }),
            })
            .then(response => response.text())
            .then(data => {
                console.log(data);
                // if response is not ok, alert
                if (data !== 'ok') {
                    alert(data);
                    return;
                }
                alert('File uploaded successfully.');
                loadFiles();
            })
            .catch(error => {
                console.error(error);
                alert('An error occurred while uploading the file.');
            });
    } else {
        alert('Please select a file or paste a YouTube link.');
    }
});
