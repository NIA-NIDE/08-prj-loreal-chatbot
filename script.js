/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Conversation history
let messages = [
  {
    role: "system",
    content:
      "You are a helpful assistant for L'Oréal products. You only answer questions related to L'Oréal makeup, skincare, haircare, fragrances, routines, and recommendations. Politely refuse to answer unrelated questions.",
  },
];

// Function to display messages
function displayMessages() {
  chatWindow.innerHTML = "";
  for (let i = 1; i < messages.length; i++) {
    // Skip system message
    const msg = messages[i];
    const msgDiv = document.createElement("div");
    msgDiv.className = `msg ${msg.role}`;
    if (msg.role === "user") {
      msgDiv.innerHTML = `<div class="bubble user-bubble">${msg.content}</div>`;
    } else {
      msgDiv.innerHTML = `<div class="bubble ai-bubble">${msg.content}</div>`;
    }
    chatWindow.appendChild(msgDiv);
  }
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Initial display
displayMessages();

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Add user message to history
  messages.push({ role: "user", content: userMessage });

  // Clear input
  userInput.value = "";

  // Display updated messages
  displayMessages();

  // Send to OpenAI API (temporary - switch to Cloudflare Worker after deployment)
  try {
    const response = await fetch("https://chat-bot.nmccrory.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.error?.message || JSON.stringify(data);
      throw new Error(`HTTP ${response.status}: ${errorMessage}`);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error(`Unexpected API response: ${JSON.stringify(data)}`);
    }

    const aiMessage = data.choices[0].message.content;

    // Add AI response to history
    messages.push({ role: "assistant", content: aiMessage });

    // Display updated messages
    displayMessages();
  } catch (error) {
    console.error("Error:", error);
    // Add error message
    messages.push({
      role: "assistant",
      content: `Sorry, there was an error: ${error.message}. Please check your API key and model access then try again.`,
    });
    displayMessages();
  }
});
