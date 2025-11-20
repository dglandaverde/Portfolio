/* ============================================
   PORTFOLIO - MAIN JAVASCRIPT
   Mobile Menu, Navigation & Contact Form
   ============================================ */

// ============================================
// Mobile Menu Toggle
// ============================================
const menuIcon = document.getElementById('menu-icon');
const navbar = document.querySelector('.navbar');

if (menuIcon && navbar) {
  menuIcon.addEventListener('click', () => {
    const isActive = navbar.classList.toggle('active');
    menuIcon.setAttribute('aria-expanded', isActive);
  });

  // Close menu when clicking on a nav link (better UX on mobile)
  const navLinks = navbar.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('active');
      menuIcon.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
      navbar.classList.remove('active');
      menuIcon.setAttribute('aria-expanded', 'false');
    }
  });
}

// ============================================
// Active Navigation Link on Scroll
// ============================================
const sections = document.querySelectorAll('section');
const navLinksAll = document.querySelectorAll('.navbar a');

window.addEventListener('scroll', () => {
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= (sectionTop - 150)) {
      current = section.getAttribute('id');
    }
  });

  navLinksAll.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// ============================================
// EmailJS Configuration & Contact Form
// ============================================
emailjs.init({
  publicKey: 'K64adrKEjSfiP2FDz',
  blockHeadless: true,
  blockList: {
    list: ['foo@emailjs.com', 'bar@emailjs.com'],
    watchVariable: 'userEmail',
  },
  limitRate: {
    id: 'app',
    throttle: 10000,
  },
});

// Form Elements - CORRECTED SELECTORS
const form = document.querySelector('.contact-form');
const nameUser = document.getElementById('name');
const emailUser = document.getElementById('email');
const messageUser = document.getElementById('message');
const btnSend = document.getElementById('btn-send');

const serviceID = 'service_k8pryh5';
const templateID = 'template_er0wv3l';

if (form && nameUser && emailUser && messageUser) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Disable button during sending
    if (btnSend) {
      btnSend.disabled = true;
      btnSend.textContent = 'Sending...';
    }

    const inputData = {
      from_name: nameUser.value,
      user_email: emailUser.value,
      user_message: messageUser.value,
    };

    emailjs.send(serviceID, templateID, inputData)
      .then(() => {
        // Success
        nameUser.value = '';
        emailUser.value = '';
        messageUser.value = '';
        alert('✅ Your message has been sent successfully!');
      })
      .catch((err) => {
        // Error
        console.error('EmailJS Error:', err);
        alert('❌ Failed to send message. Please try again later.');
      })
      .finally(() => {
        // Re-enable button
        if (btnSend) {
          btnSend.disabled = false;
          btnSend.textContent = 'Enviar Mensaje';
        }
      });
  });
}




