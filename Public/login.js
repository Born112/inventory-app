document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      if (data.success) {
        localStorage.setItem("token", data.token);
        document.getElementById("message").innerText = "Login successful!";
        // редирект в личный кабинет:
        // window.location.href = "/dashboard.html";
      } else {
        document.getElementById("message").innerText = "Login failed: " + data.error;
      }
    } catch (err) {
      document.getElementById("message").innerText = "Error: " + err.message;
    }
  });
  