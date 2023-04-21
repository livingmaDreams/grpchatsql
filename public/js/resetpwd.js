document.getElementById('form-forgotpassword-page').addEventListener('submit', forgotPassword);

function forgotPassword(event){
  event.preventDefault();
  const mail = event.target.mail.value;
  const obj = {mail};
  axios.post('http://localhost:3000/forgotpassword/called',obj)
  .then(() => window.location.href='http://localhost:3000/login')
  .catch(err => console.log(err));
}