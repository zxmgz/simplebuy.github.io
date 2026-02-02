document.addEventListener("DOMContentLoaded", function() {
    var bar = document.getElementById("bar");
    var close = document.getElementById("Close");
    var menuToggle = document.getElementById("menu-toggle");
  
    var navLinksHTML = `
      <ul id="menu">
        <li><a href="../home-page/index.html">Home</a></li>
        <li><a class="active" href="#">About Us</a></li>
        <li><a href="../contact-page/contact.html">Contact</a></li>
        <li id="Close"><i class="fa-solid fa-xmark"></i></li>
      </ul>
    `;
  
    bar.addEventListener("click", function() {
      menuToggle.style.display = "flex";
      menuToggle.innerHTML = navLinksHTML;
      bar.style.display = "none";
    });
  
    document.addEventListener("click", function(event) {
      if (event.target.closest("#Close")) {
        menuToggle.style.display = "none";
        bar.style.display = "block";
      }
    });
  });