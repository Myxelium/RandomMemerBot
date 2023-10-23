export function loadFiles() {
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
                iconDiv.className = 'd-flex';
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
                    fetch('/sounds/' + file, {
                            method: 'DELETE'
                        })
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
