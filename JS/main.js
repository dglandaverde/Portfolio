const menuIcon = document.getElementById('menu-icon');
const navbar = document.querySelector('.navbar');

menuIcon.addEventListener('click', () => {
  navbar.classList.toggle('active');
});






emailjs.init({
  publicKey: 'K64adrKEjSfiP2FDz',
  // Do not allow headless browsers
  blockHeadless: true,
  blockList: {
    // Block the suspended emails
    list: ['foo@emailjs.com', 'bar@emailjs.com'],
    // The variable contains the email address
    watchVariable: 'userEmail',
  },
  limitRate: {
    // Set the limit rate for the application
    id: 'app',
    // Allow 1 request per 10s
    throttle: 1000,
  },
});

const form = document.querySelector('contact-form');
const nameUser = document.querySelector('.name');
const emailUser = document.querySelector('.email');
const messageUser = document.querySelector('.message');

const serviceID = 'service_k8pryh5';
const templateID = 'template_er0wv3l';
const publicKey = 'K64adrKEjSfiP2FDz';

emailjs.init(publicKey);

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const inputData = {
    from_name: nameUser.value,
    user_email: emailUser.value,
    user_message: messageUser.value,
  };

  emailjs.send(serviceID, templateID, inputData).then(
    () => {
      nameUser.value = '';
      emailUser.value = '';
      messageUser.value = '';
      alert('Your message has been sent successfully!');
    },
    (err) => {
      alert(JSON.stringify(err));
    }
  );
});




