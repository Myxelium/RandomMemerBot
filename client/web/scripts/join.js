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