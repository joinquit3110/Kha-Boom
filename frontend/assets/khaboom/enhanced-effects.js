// Enhanced Effects for Kha-Boom! Website

document.addEventListener('DOMContentLoaded', function() {
  // Update feature cards with enhanced content and animations
  enhanceFeatureCards();
  
  // Enhance colorful text with hover effects
  enhanceColorfulText();
  
  // Add click ripple effect
  addRippleEffect();
});

// Update feature cards with better content and styling
function enhanceFeatureCards() {
  // Modern feature content with emojis
  const featureContent = [
    {
      title: "Immersive Learning",
      description: "Experience interactive 3D visualizations that make learning engaging and effective.",
      icon: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 18.5A2.493 2.493 0 0 1 7.51 20H7.5a2.468 2.468 0 0 1-2.4-3.154 2.98 2.98 0 0 1-.85-5.274 2.468 2.468 0 0 1 .92-3.182 2.477 2.477 0 0 1 1.876-3.344 2.5 2.5 0 0 1 3.41-1.856A2.5 2.5 0 0 1 12 5.5m0 13v-13m0 13a2.493 2.493 0 0 0 4.49 1.5h.01a2.468 2.468 0 0 0 2.403-3.154 2.98 2.98 0 0 0 .847-5.274 2.468 2.468 0 0 0-.921-3.182 2.477 2.477 0 0 0-1.875-3.344A2.5 2.5 0 0 0 14.5 3 2.5 2.5 0 0 0 12 5.5m-8 5a2.5 2.5 0 0 1 3.48-2.3m-.28 8.551a3 3 0 0 1-2.953-5.185M20 10.5a2.5 2.5 0 0 0-3.481-2.3m.28 8.551a3 3 0 0 0 2.954-5.185"></path>
            </svg>`
    },
    {
      title: "AI-Powered",
      description: "Personalized learning that adapts to your unique style and pace.",
      icon: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8.65692 9.41494h.01M7.27103 13h.01m7.67737 1.9156h.01M10.9999 17h.01m3.178-10.90671c-.8316.38094-1.8475.22903-2.5322-.45571-.3652-.36522-.5789-.82462-.6409-1.30001-.0574-.44-.0189-.98879.1833-1.39423-1.99351.20001-3.93304 1.06362-5.46025 2.59083-3.51472 3.51472-3.51472 9.21323 0 12.72793 3.51471 3.5147 9.21315 3.5147 12.72795 0 1.5601-1.5602 2.4278-3.5507 2.6028-5.5894-.2108.008-.6725.0223-.8328.0157-.635.0644-1.2926-.1466-1.779-.633-.3566-.3566-.5651-.8051-.6257-1.2692-.0561-.4293.0145-.87193.2117-1.26755-.1159.20735-.2619.40237-.4381.57865-1.0283 1.0282-2.6953 1.0282-3.7235 0-1.0282-1.02824-1.0282-2.69531 0-3.72352.0977-.09777.2013-.18625.3095-.26543"></path>
            </svg>`
    },
    {
      title: "Instant Feedback",
      description: "Get real-time insights to track your progress and improve faster.",
      icon: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8v4l3 3M3.22302 14C4.13247 18.008 7.71683 21 12 21c4.9706 0 9-4.0294 9-9 0-4.97056-4.0294-9-9-9-3.72916 0-6.92858 2.26806-8.29409 5.5M7 9H3V5"></path>
            </svg>`
    }
  ];
  
  // Get all feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  
  // Update each card with new content
  featureCards.forEach((card, index) => {
    if (index < featureContent.length) {
      // Get card elements
      const title = card.querySelector('h3');
      const description = card.querySelector('p');
      const icon = card.querySelector('.feature-icon');
      
      // Update content
      if (title) title.textContent = featureContent[index].title;
      if (description) description.textContent = featureContent[index].description;
      if (icon) icon.innerHTML = featureContent[index].icon;
      
      // Add animation delay
      card.style.animationDelay = `${index * 0.2}s`;
      
      // Add animated class
      setTimeout(() => {
        card.classList.add('animated');
      }, 100);
    }
  });
  
  // Update section header
  const sectionHeader = document.querySelector('.section-header h2');
  if (sectionHeader) {
    sectionHeader.textContent = "Revolutionary Learning Technology";
  }
}

// Enhance colorful text with more dynamic effects
function enhanceColorfulText() {
  // Find all colorful text spans
  const colorfulSpans = document.querySelectorAll('.colorful-text');
  
  colorfulSpans.forEach(span => {
    // Add enhanced text class
    span.classList.add('kb-enhanced-text');
    
    // Set data-text attribute for glow effect
    const text = span.textContent;
    span.setAttribute('data-text', text);
    
    // Add letter-by-letter animation for longer text
    if (text.length > 5) {
      // Split text into spans for each letter
      const letters = text.split('');
      const wrappedLetters = letters.map((letter, i) => 
        `<span class="letter" style="animation-delay: ${i * 0.1}s;">${letter}</span>`
      ).join('');
      
      // Replace content with letter spans
      span.innerHTML = wrappedLetters;
      
      // Add animation to letters
      const letterSpans = span.querySelectorAll('.letter');
      letterSpans.forEach(letter => {
        letter.addEventListener('mouseover', function() {
          this.style.transform = 'translateY(-5px) scale(1.2)';
          this.style.transition = 'transform 0.3s ease';
        });
        
        letter.addEventListener('mouseout', function() {
          this.style.transform = 'translateY(0) scale(1)';
        });
      });
    }
  });
}

// Add an exciting color explosion effect when clicking
function addRippleEffect() {
  document.addEventListener('click', function(e) {
    // Create explosion container
    const explosion = document.createElement('div');
    explosion.classList.add('color-explosion');
    document.body.appendChild(explosion);
    
    // Position the explosion exactly at cursor position using viewport coords
    explosion.style.left = `${e.clientX}px`;
    explosion.style.top = `${e.clientY}px`;
    
    // Choose from our vibrant brand colors
    const colors = ['#6B46C1', '#CD0E66', '#FD8C00', '#38B2AC', '#805AD5', '#D53F8C', '#DD6B20', '#319795'];
    
    // Create more particles in random directions
    const particleCount = 12 + Math.floor(Math.random() * 8); // 12-20 particles
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('explosion-particle');
      
      // Random size for each particle
      const size = 5 + Math.random() * 12;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random direction and distance
      const angle = Math.random() * Math.PI * 2; // Random angle in radians
      const distance = 20 + Math.random() * 80; // Random distance
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      // Set direction variables for CSS animation
      particle.style.setProperty('--x', `${x}px`);
      particle.style.setProperty('--y', `${y}px`);
      
      // Random rotation for extra flair
      particle.style.setProperty('--rotate', `${Math.random() * 360}deg`);
      
      // Random animation duration
      particle.style.setProperty('--duration', `${0.5 + Math.random() * 0.5}s`);
      
      // Set random color from our expanded palette
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      // Add different shapes
      if (Math.random() > 0.7) { // 30% chance of different shapes
        particle.style.borderRadius = Math.random() > 0.5 ? '2px' : '50% 0 50% 50%';
      }
      
      explosion.appendChild(particle);
    }
    
    // Add a central flash
    const flash = document.createElement('div');
    flash.classList.add('explosion-flash');
    explosion.appendChild(flash);
    
    // Remove the explosion after animation completes
    setTimeout(() => {
      explosion.remove();
    }, 1000);
  });
}
