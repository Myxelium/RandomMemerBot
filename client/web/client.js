document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('#myFile').addEventListener('change', function(e) {
      var fileName = e.target.files[0].name;
      var nextSibling = e.target.nextElementSibling
      nextSibling.innerText = fileName
    })
});

document.getElementById('joinButton').addEventListener('click', function() {
    this.disabled = true;

    fetch('/join')
    .then(response => response.text())
    .then(data => {
        console.log(data);
        setTimeout(() => {
            this.disabled = false;
        }, 40000);
    })
    .catch((error) => {
        console.error('Error:', error);
        setTimeout(() => {
            this.disabled = false;
        }, 1000);
    });
});

function loadNextPlaybackTime() {
    fetch('/nextplaybacktime')
        .then(response => response.text())
        .then(data => {
            const nextPlaybackTime = document.getElementById('nextPlaybackTime');
            nextPlaybackTime.textContent = `Playing next time: ${data}`;
        }
    )
    .catch(error => console.error('Error:', error));
}

function loadFiles() {
    // Fetch the JSON data from the /sounds endpoint
    fetch('/sounds')
        .then(response => response.json())
        .then(data => {
            // Get the fileList element
            const fileList = document.getElementById('fileList');

            // Clear the current list
            fileList.innerHTML = '';

            // Add each file to the list
            data.forEach(file => {
                // Create a new list item
                const li = document.createElement('li');
                li.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center'

                // Create a div for the file name and add it to the list item
                const fileNameDiv = document.createElement('div');
                fileNameDiv.textContent = file;
                li.appendChild(fileNameDiv);

                // Create a div for the icons and add it to the list item
                const iconDiv = document.createElement('div');
                li.appendChild(iconDiv);

                // Create a div for the play icon and add it to the icon div
                const playIconDiv = document.createElement('span');
                playIconDiv.style.cursor = 'pointer';
                playIconDiv.textContent = '▶️';
                iconDiv.appendChild(playIconDiv);

                // Attach a click event listener to the play icon div
                playIconDiv.addEventListener('click', () => {
                    // Create a new audio object and play the file
                    let audio = new Audio('/sounds/' + file);
                    audio.play();
                });

                // Create a div for the trash icon and add it to the icon div
                const trashIconDiv = document.createElement('span');
                trashIconDiv.style.cursor = 'pointer';
                trashIconDiv.textContent = '🗑️';
                iconDiv.appendChild(trashIconDiv);

                // Attach a click event listener to the trash icon div
                trashIconDiv.addEventListener('click', () => {
                    // Send a DELETE request to the server to remove the file
                    fetch('/sounds/' + file, { method: 'DELETE' })
                        .then(response => response.text())
                        .then(message => {
                            console.log(message);

                            // Remove the list item from the fileList element
                            fileList.removeChild(li);
                        })
                        .catch(error => console.error('Error:', error));
                });

                // Add the list item to the fileList element
                fileList.appendChild(li);
            });
        })
        .catch(error => console.error('Error:', error));
}


// Call loadFiles when the script is loaded
loadFiles();
loadNextPlaybackTime();

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var fileInput = document.getElementById('myFile');
    var file = fileInput.files[0];
    var youtubeLink = document.getElementById('youtubeLink').value;

    if (file) {
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

                // Call loadFiles again to update the file list
                loadFiles();
            })
            .catch(error => {
                console.error(error);
                alert('An error occurred while uploading the file.');
            });
        });
    } else if (youtubeLink) {
        console.log(youtubeLink);
        fetch('/upload-youtube', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: youtubeLink }),
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
