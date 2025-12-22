fetch("https://notes-fwm8.onrender.com/api/Auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    username: "user1",
    email: "user1@example.com",
    password: "Password123!"
  })
})
.then(async r => {
  const text = await r.text();
  console.log("STATUS:", r.status);
  console.log("RESPONSE:", text);
})
.catch(console.error);
