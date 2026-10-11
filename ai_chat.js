const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");



// Pet Specialist Prompt
const specialistPrompt = `
You are PET COMPANION AI — A certified pet specialist.
Always answer in this structured format:

🐾 Overview  
🐾 Possible Causes  
🐾 Diet Suggestions  
🐾 Care Instructions  
🐾 What to Avoid  
🐾 When to Visit Vet  

Keep answers simple and helpful.
`;

// Add a message bubble
function addMessage(msg, sender) {
    const div = document.createElement("div");
    div.classList.add("message", sender === "user" ? "userMsg" : "botMsg");
    div.textContent = msg;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Send question to AI
async function askAI(question) {
    addMessage(question, "user");

    const typing = document.createElement("div");
    typing.classList.add("message", "botMsg");
    typing.textContent = "Typing...";
    chatBox.appendChild(typing);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{
                                text: specialistPrompt + "\nUser: " + question
                            }]
                        }
                    ]
                })
            }
        );

        const data = await response.json();
        typing.remove();

        // NEW RESPONSE STRUCTURE
        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I couldn't generate a response.";

        addMessage(reply, "bot");

    } catch (error) {
        typing.remove();
        addMessage("AI error. Please check your internet or API key.", "bot");
        console.error("AI ERROR:", error);
    }
}

// Send button
sendBtn.addEventListener("click", () => {
    const text = userInput.value.trim();
    if (!text) return;
    askAI(text);
    userInput.value = "";
});

// Enter key triggers send
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
    /* -------------------------------------
   AI CHAT FUNCTION (FULL WORKING)
-------------------------------------- */

const aiInput = document.getElementById("aiInput");
const aiSend = document.getElementById("aiSend");
const aiMessages = document.getElementById("aiMessages");

const GEMINI_KEY = "AIzaSyAaIGhYDXOA86l3LdYxLMNJoNGah1mjeDY";  // your key

// Specialist mode prompt
const AI_PROMPT = `
You are PET COMPANION AI — A certified specialist for dogs & cats.

Always answer in this structured format:
🐾 Overview  
🐾 Possible Causes  
🐾 Diet Suggestions  
🐾 Care Instructions  
🐾 What to Avoid  
🐾 When to Visit Vet  

Keep answers simple & helpful.
`;

// Add message bubble
function addAIMsg(text, sender) {
  const div = document.createElement("div");
  div.classList.add(sender === "user" ? "user-msg" : "ai-msg");
  div.textContent = text;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

// Send message to Gemini API
async function sendToAI(question) {
  addAIMsg(question, "user");

  // typing…
  const typing = document.createElement("div");
  typing.classList.add("ai-msg");
  typing.textContent = "Typing...";
  aiMessages.appendChild(typing);
  aiMessages.scrollTop = aiMessages.scrollHeight;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: AI_PROMPT + "\nUser: " + question }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    typing.remove();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn’t generate a response.";

    addAIMsg(reply, "ai");

  } catch (err) {
    typing.remove();
    addAIMsg("AI error. Please check your connection or API key.", "ai");
    console.error(err);
  }
}

// Event listener for send button
if (aiSend && aiInput) {
  aiSend.addEventListener("click", () => {
    const text = aiInput.value.trim();
    if (text.length === 0) return;
    sendToAI(text);
    aiInput.value = "";
  });

  aiInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") aiSend.click();
  });
}
});
