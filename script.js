// Firebase Configuration
// Updated with the correct database URL from the error message
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "wedding-fefff.firebaseapp.com",
    projectId: "wedding-fefff",
    storageBucket: "wedding-fefff.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "https://wedding-fefff-default-rtdb.asia-southeast1.firebasedatabase.app"
  };
  
  // Initialize Firebase with error handling
  try {
      firebase.initializeApp(firebaseConfig);
      console.log("Firebase initialized successfully");
  } catch (error) {
      console.error("Firebase initialization error:", error);
      alert("There was an error connecting to the database. See console for details.");
  }
  
  // Get a reference to the database service
  const database = firebase.database();
  
  // Reference to the comments collection
  const commentsRef = database.ref('comments');
  
  // Function to get URL parameters - Properly preserves capitalization
  function getUrlParameter(name) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      var results = regex.exec(location.search);
      
      if (results === null) {
          return '';
      }
      
      // Get the raw parameter value
      var rawValue = results[1];
      
      // First, handle '+' signs specially to preserve capitalization
      // The '+' character in URLs represents spaces, but standard replacement loses capitalization
      var nameWithSpaces = rawValue.replace(/\+/g, ' ');
      
      try {
          // Now decode any percent-encoded characters
          return decodeURIComponent(nameWithSpaces);
      } catch (e) {
          console.error("Error decoding URL parameter:", e);
          return nameWithSpaces; // Fallback if decoding fails
      }
  }
  
  // When document is ready
  $(document).ready(function() {
      // Get the name parameter from URL - with improved handling
      const guestName = getUrlParameter('name');
      
      // Update the greeting if a name is provided
      if (guestName && guestName.trim() !== '') {
          $('#personalized-greeting').html(`Dear ${guestName},`);
          $('#personalized-view-invitation').html(`View Your Invitation`);
          document.title = `Wedding Invitation for ${guestName}`;
          
          // Pre-fill the comment form
          $('#commenterName').val(guestName);
          
          // Log success for debugging
          console.log("Name parameter successfully processed:", guestName);
      } else {
          console.log("No name parameter found or empty value");
      }
      
      // Set up background music with improved handling
      const bgMusic = document.getElementById('bgMusic');
      let audioPlaying = false;
      
      // Make sure the audio element is properly loaded
      if (bgMusic) {
          console.log("Audio element found, setting up event handlers");
          
          // Set initial volume
          bgMusic.volume = 0.5;
          
          // Force load the audio file
          bgMusic.load();
      } else {
          console.error("Audio element not found! Check your HTML.");
      }
      
      // Auto play music when user interacts with page (to satisfy browser autoplay policies)
      $(document).one('click', function() {
          if (bgMusic) {
              try {
                  // Play with promise handling for modern browsers
                  const playPromise = bgMusic.play();
                  
                  if (playPromise !== undefined) {
                      playPromise.then(() => {
                          console.log("Audio started playing successfully");
                          $('#toggleMusic').html('<i class="fas fa-volume-up"></i>');
                          audioPlaying = true;
                      }).catch(error => {
                          console.error("Audio autoplay prevented:", error);
                          // Some browsers require a user gesture specifically on the audio control
                          alert("Please click the sound icon to enable music");
                      });
                  }
              } catch(e) {
                  console.error("Audio play error:", e);
              }
          }
      });
      
      // Improved toggle music button with better error handling
      $('#toggleMusic').on('click', function() {
          if (!bgMusic) {
              alert("Sorry, audio player could not be initialized");
              return;
          }
          
          try {
              if (audioPlaying) {
                  bgMusic.pause();
                  $(this).html('<i class="fas fa-volume-mute"></i>');
                  audioPlaying = false;
                  console.log("Audio paused");
              } else {
                  const playPromise = bgMusic.play();
                  
                  if (playPromise !== undefined) {
                      playPromise.then(() => {
                          $(this).html('<i class="fas fa-volume-up"></i>');
                          audioPlaying = true;
                          console.log("Audio playing");
                      }).catch(error => {
                          console.error("Audio play prevented:", error);
                          alert("Your browser blocked autoplay. Try again with a direct click.");
                      });
                  }
              }
          } catch(e) {
              console.error("Toggle audio error:", e);
              alert("There was a problem with the audio playback.");
          }
      });
      
      // Countdown timer
      function updateCountdown() {
          const weddingDate = new Date('June 7, 2025 10:00:00').getTime();
          const now = new Date().getTime();
          const distance = weddingDate - now;
          
          // Time calculations
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
          // Display results
          $('#days').text(days.toString().padStart(2, '0'));
          $('#hours').text(hours.toString().padStart(2, '0'));
          $('#minutes').text(minutes.toString().padStart(2, '0'));
          $('#seconds').text(seconds.toString().padStart(2, '0'));
          
          // If countdown is finished
          if (distance < 0) {
              clearInterval(countdownInterval);
              $('#days, #hours, #minutes, #seconds').text('00');
          }
      }
      
      // Update countdown immediately and then every second
      updateCountdown();
      const countdownInterval = setInterval(updateCountdown, 1000);
      
      // Create floating hearts
      function createHearts() {
          const heartsContainer = document.getElementById('hearts');
          
          // Remove all existing hearts
          while (heartsContainer && heartsContainer.firstChild) {
              heartsContainer.removeChild(heartsContainer.firstChild);
          }
          
          // Create new hearts
          if (heartsContainer) {
              for (let i = 0; i < 10; i++) {
                  const heart = document.createElement('div');
                  heart.classList.add('heart');
                  heart.style.left = Math.random() * 100 + '%';
                  heart.style.animationDelay = Math.random() * 3 + 's';
                  heartsContainer.appendChild(heart);
              }
          }
      }
      
      // Create hearts initially and then every 3 seconds
      createHearts();
      setInterval(createHearts, 3000);
      
      // Load comments from Firebase when the page loads
      loadComments();
      
      // Comment form handling with Firebase
      $('#commentForm').on('submit', function(e) {
          e.preventDefault();
          
          // Simple validation
          if ($('#commenterName').val().trim() === '' || $('#commentText').val().trim() === '') {
              alert('Please enter your name and message.');
              return;
          }
          
          // Get form values
          const name = $('#commenterName').val();
          const comment = $('#commentText').val();
          
          // Disable the submit button to prevent double submission
          const submitButton = $(this).find('button[type="submit"]');
          submitButton.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Sending...');
          
          // Create a new comment object
          const newComment = {
              name: name,
              message: comment,
              timestamp: firebase.database.ServerValue.TIMESTAMP
          };
          
          // Push the comment to Firebase
          commentsRef.push(newComment)
              .then(() => {
                  console.log("Comment added successfully");
                  
                  // Clear form
                  $('#commentText').val('');
                  
                  // Show success message
                  const successMessage = $('<div class="alert alert-success mt-3" role="alert">Thank you for your wishes!</div>');
                  $(this).append(successMessage);
                  
                  // Re-enable the submit button
                  submitButton.prop('disabled', false).html('Send Wishes');
                  
                  // Remove success message after 3 seconds
                  setTimeout(() => {
                      successMessage.fadeOut('slow', function() {
                          $(this).remove();
                      });
                  }, 3000);
                  
                  // Reload comments to show the new one
                  loadComments();
              })
              .catch((error) => {
                  console.error("Error adding comment: ", error);
                  alert("There was an error submitting your comment: " + error.message);
                  
                  // Re-enable the submit button
                  submitButton.prop('disabled', false).html('Send Wishes');
              });
      });
      
      // Function to load comments from Firebase
function loadComments() {
    // Clear existing comments
    $('#commentsContainer').empty();
    
    // Display loading indicator
    $('#commentsContainer').html('<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading comments...</div>');
    
    // Check if we have any comments
    commentsRef.once('value')
        .then((snapshot) => {
            console.log("Checking for comments...");
            
            if (!snapshot.exists()) {
                console.log("No comments found");
                $('#commentsContainer').html('<p class="text-center">No comments yet. Be the first to leave your wishes!</p>');
                return;
            }
            
            console.log("Found comments:", snapshot.numChildren());
            
            // Clear the container
            $('#commentsContainer').empty();
            
            // Array to hold comments
            const comments = [];
            
            // Get each comment
            snapshot.forEach((childSnapshot) => {
                const comment = childSnapshot.val();
                comments.push(comment);
            });
            
            // Reverse array to show newest comments first
            comments.reverse();
            
            // Flower icons array - using appropriate Font Awesome icons
            const flowerIcons = [
                'fa-spa',           // Flower spa icon
                'fa-seedling',      // Seedling icon
                'fa-leaf',          // Leaf icon
                // 'fa-fan',           // Fan icon (looks like a flower)
                // 'fa-asterisk'       // Asterisk (star-like, resembles a simple flower)
            ];
            
            // Render each comment
            comments.forEach((comment) => {
                // Format the date (from timestamp)
                const date = new Date(comment.timestamp);
                const formattedDate = formatDate(date);
                
                // Get a consistent icon and background color for each user
                // Use the name to create a hash for consistency
                const nameHash = comment.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                
                // Background colors - pink and cream tones
                const bgColors = [
                    // '#f8bbd0', // Light pink
                    '#f9e8d2', // Light cream
                    // '#fce4ec', // Very light pink
                    '#fff3e0', // Very light cream
                    // '#ffebee'  // Pale pink
                ];
                
                // Select consistent icon and color for the same user
                const iconIndex = Math.abs(nameHash) % flowerIcons.length;
                const colorIndex = Math.abs(nameHash + 1) % bgColors.length; // +1 to offset from icon index
                
                const selectedIcon = flowerIcons[iconIndex];
                const avatarBgColor = bgColors[colorIndex];
                
                // Create comment HTML with flower icon
                const commentHTML = `
                    <div class="comment-card mb-3 animate__animated animate__fadeIn">
                        <div class="comment-header d-flex align-items-start mb-2">
                            <div class="avatar text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                 style="width: 40px; height: 40px; flex-shrink: 0; background-color: ${avatarBgColor};">
                                <i class="fas ${selectedIcon}" style="color: var(--secondary-color);"></i>
                            </div>
                            <div class="text-start" style="width: 100%;">
                                <div class="d-flex justify-content-between align-items-baseline">
                                    <h5 class="mb-0">${comment.name}</h5>
                                    <small class="text-muted ms-2">${formattedDate}</small>
                                </div>
                                <div class="comment-body p-3 bg-light rounded mt-2 text-start">
                                    <p class="mb-0">${comment.message}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add to container
                $('#commentsContainer').append(commentHTML);
            });
        })
        .catch((error) => {
            console.error("Error getting comments: ", error);
            $('#commentsContainer').html(`<p class="text-center text-danger">Error loading comments: ${error.message}. Please try refreshing the page.</p>`);
        });
}
      
      // Helper function to format date for comments
      function formatDate(date) {
          const now = new Date();
          const diffTime = Math.abs(now - date);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0) {
              return 'Today';
          } else if (diffDays === 1) {
              return 'Yesterday';
          } else if (diffDays < 7) {
              return `${diffDays} days ago`;
          } else {
              // Format date as MM/DD/YYYY
              return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
          }
      }
      
      // Smooth scrolling for anchor links
      $('a[href^="#"]').on('click', function(e) {
          e.preventDefault();
          
          const target = $(this.hash);
          if (target.length) {
              $('html, body').animate({
                  scrollTop: target.offset().top
              }, 800);
          }
      });
      
      // Add parallax effect on scroll
      $(window).scroll(function() {
          const scrollPosition = $(this).scrollTop();
          $('.cover-section').css({
              'background-position': 'center ' + (scrollPosition * 0.5) + 'px'
          });
      });
      
      // Image gallery interaction
      $('.gallery-img').on('click', function() {
          $(this).addClass('animate__animated animate__pulse');
          setTimeout(() => {
              $(this).removeClass('animate__animated animate__pulse');
          }, 1000);
      });
      
      // Add animation on scroll for sections
      function animateOnScroll() {
          $('.card-section').each(function() {
              const position = $(this).offset().top;
              const scroll = $(window).scrollTop();
              const windowHeight = $(window).height();
              
              if (scroll + windowHeight > position + 100) {
                  $(this).addClass('animate__animated animate__fadeIn');
              }
          });
      }
      
      // Call on scroll and on load
      $(window).on('scroll', animateOnScroll);
      animateOnScroll();
  });
  
  // Function to open Google Maps directions
  function showDirections() {
      // Replace with actual venue coordinates
      const venueAddress = "Gedung Produksi Batik Tulis Ponorogo";
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venueAddress)}`;
      window.open(mapsUrl, '_blank');
  }