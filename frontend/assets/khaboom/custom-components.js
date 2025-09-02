/**
 * Kha-Boom! Custom Components JavaScript
 * Handles interactive UI elements and responsive behaviors
 */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle functionality
  const mobileMenuBtn = document.getElementById('kbMobileMenuBtn');
  const navMenu = document.querySelector('.kb-nav');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      navMenu.classList.toggle('kb-nav-open');
      mobileMenuBtn.classList.toggle('kb-menu-active');
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    if (navMenu && navMenu.classList.contains('kb-nav-open') && 
        !event.target.closest('.kb-nav') && 
        !event.target.closest('#kbMobileMenuBtn')) {
      navMenu.classList.remove('kb-nav-open');
      mobileMenuBtn.classList.remove('kb-menu-active');
    }
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      if (targetId !== '#') {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          // Account for fixed header
          const headerHeight = document.querySelector('.kb-custom-header')?.offsetHeight || 0;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Close mobile menu after clicking a link
          if (navMenu && navMenu.classList.contains('kb-nav-open')) {
            navMenu.classList.remove('kb-nav-open');
            mobileMenuBtn?.classList.remove('kb-menu-active');
          }
        }
      }
    });
  });
});
