var logo = document.getElementById('logotype');
var body = document.getElementsByTagName('body')[0];

var today = new Date();
var month = today.getMonth() + 1;

if (month == 10) { // Halloween
    logo.src = 'assets/seasonal/logo-autumn.svg';
    body.className += ' autumn';
    document.head.innerHTML += '<link rel="stylesheet" href="assets/seasonal/autumn.css" type="text/css"/>';
}