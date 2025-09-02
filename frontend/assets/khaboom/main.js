// Kha-Boom! Main JavaScript - Enhanced Version

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar logo hover parity with header
    const sidebarLogo = document.querySelector('.kb-brand');
    if (sidebarLogo) {
      sidebarLogo.addEventListener('mouseenter', () => sidebarLogo.classList.add('hover'));
      sidebarLogo.addEventListener('mouseleave', () => sidebarLogo.classList.remove('hover'));
    }
    // Add animation to colorful text elements
    const colorfulTextElements = document.querySelectorAll('.colorful-text');
    
    colorfulTextElements.forEach(element => {
      // Add a subtle hover effect
      element.addEventListener('mouseover', function() {
        this.style.animation = 'none';
        this.offsetHeight; // Trigger reflow
        this.style.animation = 'colorCycle 4s infinite';
      });
    });
    
    // Add hover animations to buttons
    const buttons = document.querySelectorAll('.btn, .cta-button');
    
    buttons.forEach(button => {
      button.addEventListener('mouseenter', function() {
        this.classList.add('animated');
      });
      
      button.addEventListener('mouseleave', function() {
        this.classList.remove('animated');
      });
      
      // Add click animation
      button.addEventListener('click', function() {
        this.classList.add('clicked');
        setTimeout(() => {
          this.classList.remove('clicked');
        }, 300);
      });
    });
    // Initialize category tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    if (categoryTabs.length) {
      categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
          categoryTabs.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          // In a real implementation, this would filter courses by category
        });
      });
    }
  
    // Animate elements on scroll
    const animateOnScroll = function() {
      const elements = document.querySelectorAll('.feature-card, .testimonial-card, .course-card');
      
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      });
    };
  
    // Set initial styles for animation
    const elementsToAnimate = document.querySelectorAll('.feature-card, .testimonial-card, .course-card');
    elementsToAnimate.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
  
    // Run animation on load and scroll
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on initial load
    
    // Mobile menu toggle with improved animation
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    // Create menu toggle button if it doesn't exist
    if (!menuToggle && mainNav) {
      const toggle = document.createElement('button');
      toggle.className = 'menu-toggle';
      toggle.innerHTML = '<span></span><span></span><span></span>';
      document.querySelector('.kb-header .container').appendChild(toggle);
      
      // Now select the newly created toggle
      const newMenuToggle = document.querySelector('.menu-toggle');
      
      if (newMenuToggle) {
        newMenuToggle.addEventListener('click', function() {
          mainNav.classList.toggle('active');
          this.classList.toggle('active');
        });
      }
    }
    
    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        this.classList.toggle('active');
        
        // Add smooth animation
        if (mainNav.classList.contains('active')) {
          mainNav.style.maxHeight = mainNav.scrollHeight + 'px';
        } else {
          mainNav.style.maxHeight = '0';
        }
      });
    }
    
    // Add CSS for proper mobile menu styling
    if (!document.getElementById('mobile-nav-styles')) {
      const mobileStyles = document.createElement('style');
      mobileStyles.id = 'mobile-nav-styles';
      mobileStyles.textContent = `
        @media (max-width: 768px) {
          .main-nav {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.5s ease;
            box-shadow: 0 5px 10px rgba(0,0,0,0.1);
            z-index: 1000;
          }
          
          .main-nav.active {
            max-height: 300px;
          }
          
          .main-nav ul {
            flex-direction: column;
            padding: 1rem;
          }
          
          .main-nav li {
            margin: 0.5rem 0;
          }
          
          .menu-toggle {
            display: block;
            width: 30px;
            height: 25px;
            position: relative;
            background: transparent;
            border: none;
            cursor: pointer;
          }
          
          .menu-toggle span {
            display: block;
            position: absolute;
            height: 3px;
            width: 100%;
            background: var(--color-text);
            border-radius: 3px;
            transition: all 0.3s ease;
          }
          
          .menu-toggle span:nth-child(1) {
            top: 0;
          }
          
          .menu-toggle span:nth-child(2) {
            top: 10px;
          }
          
          .menu-toggle span:nth-child(3) {
            top: 20px;
          }
          
          .menu-toggle.active span:nth-child(1) {
            top: 10px;
            transform: rotate(45deg);
          }
          
          .menu-toggle.active span:nth-child(2) {
            opacity: 0;
          }
          
          .menu-toggle.active span:nth-child(3) {
            top: 10px;
            transform: rotate(-45deg);
          }
        }
      `;
      document.head.appendChild(mobileStyles);
    }
  });
  