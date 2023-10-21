export function updateAvoidList() {
    fetch('/avoidlist')
        .then(response => response.json())
        .then(data => {
            const avoidListElement = document.getElementById('avoidList');

            // Clear the avoid list.
            avoidListElement.innerHTML = '';

            // Add each user in the avoid list to the UI.
            data.avoidUsers.forEach(user => {
                const listItem = document.createElement('li');
                listItem.textContent = user;
                listItem.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';

                // Add a button to remove the user from the avoid list.
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.className = 'btn btn-success';
                removeButton.addEventListener('click', function () {
                    fetch(`/avoidlist/${user}`, {
                            method: 'DELETE',
                        })
                        .then(_ => {
                            updateAvoidList();
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                });

                listItem.appendChild(removeButton);
                avoidListElement.appendChild(listItem);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}