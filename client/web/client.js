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
                li.className = 'grid-x';

                // Create a div for the file name and add it to the list item
                const fileNameDiv = document.createElement('div');
                fileNameDiv.className = 'cell auto';
                fileNameDiv.textContent = file;
                li.appendChild(fileNameDiv);

                // Create a div for the trash icon and add it to the list item
                const trashIconDiv = document.createElement('div');
                trashIconDiv.className = 'cell shrink';
                trashIconDiv.style.cursor = 'pointer';
                trashIconDiv.textContent = '🗑️';
                li.appendChild(trashIconDiv);

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

            // Call loadFiles again to update the file list
            loadFiles();
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred while uploading the file.');
        });
    });
});
