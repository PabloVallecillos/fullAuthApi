const url = 'http://localhost:3000';
const urlLogin = `${url}/login`;


if (window.location.href === urlLogin) {
  let password = document.getElementById('hidePassword');
  let eye = document.getElementById('mioClose');
  let close = '../images/close.svg'
  let open = '../images/open.svg';
  eye.src = 'http://localhost:3000/images/close.svg';
  // eye.onclick = (e) => {
    
  //   if (e.path[0].src == 'http://localhost:3000/images/close.svg') {
  //     eye.src = 'http://localhost:3000/images/open.svg';
  //     password.type = 'text'
  //   } else if (e.path[0].src == 'http://localhost:3000/images/open.svg'){
  //     eye.src = 'http://localhost:3000/images/close.svg';
  //     password.type = 'password'
  //   }
  
  // };
}
