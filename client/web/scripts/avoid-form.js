import { updateAvoidList } from './avoid-list.js';

const avoidForm = document.getElementById('avoidForm');
if (avoidForm) {
    avoidForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const user = document.getElementById('avoidUser').value;

        if(!user)
            return;

        fetch('/avoidlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user
                }),
            })
            .then(response => response.text())
            .then((data) => {
                updateAvoidList();
                document.getElementById('avoidUser').value = '';
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });

    const removeUser = document.getElementById('removeUser');
    if(removeUser){
        document.getElementById('removeUser').addEventListener('click', function () {
            const user = document.getElementById('avoidUser').value;
    
            fetch(`/avoidlist/${user}`, {
                    method: 'DELETE',
                })
                .then(_ => {
                    updateAvoidList();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        })
    }
};