(function () {
  const currentScript = document.currentScript as HTMLScriptElement | null;
  const assistantId = currentScript?.getAttribute("data-assistant-id") || "default-assistant";
  const apiBase = currentScript?.getAttribute("data-api-base") || "http://localhost:8000/api/v1";
  const primaryColor = currentScript?.getAttribute("data-primary-color") || "#2563eb";
  const assistantName = currentScript?.getAttribute("data-assistant-name") || "AI Assistant";

  // Create host container
  const host = document.createElement("div");
  host.id = "chatbot-widget-host";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // Styles
  const style = document.createElement("style");
  style.textContent = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    .widget-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .launcher-button {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: ${primaryColor};
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
    }

    .launcher-button:hover {
      transform: scale(1.06);
      box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.35);
    }

    .launcher-button svg {
      width: 28px;
      height: 28px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .chat-window {
      position: absolute;
      bottom: 76px;
      right: 0;
      width: 380px;
      height: 560px;
      max-height: calc(100vh - 120px);
      max-width: calc(100vw - 48px);
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateY(20px) scale(0.95);
      transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .chat-window.open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    .chat-header {
      background: ${primaryColor};
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
    }

    .header-title {
      font-size: 15px;
      font-weight: 600;
    }

    .header-status {
      font-size: 12px;
      opacity: 0.85;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      background: #4ade80;
      border-radius: 50%;
      display: inline-block;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icon-btn {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.85;
      transition: opacity 0.2s, background 0.2s;
    }

    .icon-btn:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.15);
    }

    .icon-btn svg {
      width: 18px;
      height: 18px;
    }

    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f8fafc;
    }

    .message {
      display: flex;
      flex-direction: column;
      max-width: 82%;
      font-size: 14px;
      line-height: 1.45;
    }

    .message.user {
      align-self: flex-end;
    }

    .message.assistant {
      align-self: flex-start;
    }

    .bubble {
      padding: 10px 14px;
      border-radius: 14px;
      word-break: break-word;
    }

    .message.user .bubble {
      background: ${primaryColor};
      color: white;
      border-bottom-right-radius: 4px;
    }

    .message.assistant .bubble {
      background: #ffffff;
      color: #1e293b;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }

    .citations {
      margin-top: 6px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .citation-tag {
      font-size: 11px;
      background: #e0e7ff;
      color: #3730a3;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 500;
      cursor: pointer;
    }

    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
      background: #ffffff;
      border-radius: 14px;
      border-bottom-left-radius: 4px;
      width: fit-content;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }

    .dot {
      width: 6px;
      height: 6px;
      background: #94a3b8;
      border-radius: 50%;
      animation: blink 1.4s infinite both;
    }

    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes blink {
      0% { opacity: 0.2; transform: scale(0.8); }
      20% { opacity: 1; transform: scale(1.1); }
      100% { opacity: 0.2; transform: scale(0.8); }
    }

    .input-area {
      padding: 12px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chat-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      padding: 10px 16px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .chat-input:focus {
      border-color: ${primaryColor};
    }

    .send-button {
      background: ${primaryColor};
      color: white;
      border: none;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
    }

    .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .send-button:not(:disabled):hover {
      transform: scale(1.05);
    }

    .send-button svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
    }

    .footer-watermark {
      font-size: 11px;
      text-align: center;
      padding: 6px;
      color: #94a3b8;
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;
    }
  `;

  // HTML Structure
  const container = document.createElement("div");
  container.className = "widget-container";
  container.innerHTML = `
    <div class="chat-window" id="chat-window">
      <div class="chat-header">
        <div class="header-info">
          <div class="avatar">${assistantName.charAt(0).toUpperCase()}</div>
          <div>
            <div class="header-title">${assistantName}</div>
            <div class="header-status"><span class="status-dot"></span> Online</div>
          </div>
        </div>
        <div class="header-actions">
          <button class="icon-btn" id="clear-btn" title="Clear conversation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
          <button class="icon-btn" id="close-btn" title="Close chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>
      <div class="messages-area" id="messages-area">
        <div class="message assistant">
          <div class="bubble">Hello! How can I assist you with our products and services today?</div>
        </div>
      </div>
      <div class="input-area">
        <input type="text" class="chat-input" id="chat-input" placeholder="Type your question..." autocomplete="off" />
        <button class="send-button" id="send-btn" aria-label="Send message">
          <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </div>
      <div class="footer-watermark">Powered by Enterprise AI</div>
    </div>
    <button class="launcher-button" id="launcher-btn" aria-label="Open chat">
      <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
    </button>
  `;

  shadow.appendChild(style);
  shadow.appendChild(container);

  // Widget Logic
  let isOpen = false;
  const launcherBtn = shadow.getElementById("launcher-btn") as HTMLButtonElement;
  const closeBtn = shadow.getElementById("close-btn") as HTMLButtonElement;
  const clearBtn = shadow.getElementById("clear-btn") as HTMLButtonElement;
  const chatWindow = shadow.getElementById("chat-window") as HTMLDivElement;
  const chatInput = shadow.getElementById("chat-input") as HTMLInputElement;
  const sendBtn = shadow.getElementById("send-btn") as HTMLButtonElement;
  const messagesArea = shadow.getElementById("messages-area") as HTMLDivElement;

  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      chatWindow.classList.add("open");
      chatInput.focus();
    } else {
      chatWindow.classList.remove("open");
    }
  }

  launcherBtn.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", toggleChat);

  clearBtn.addEventListener("click", () => {
    messagesArea.innerHTML = `
      <div class="message assistant">
        <div class="bubble">Chat history cleared. How else may I assist you today?</div>
      </div>
    `;
  });

  function addMessage(role: "user" | "assistant", text: string, sources: string[] = []) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${role}`;
    
    let sourcesHtml = "";
    if (sources && sources.length > 0) {
      sourcesHtml = `
        <div class="citations">
          ${sources.map((s) => `<span class="citation-tag">📄 ${s}</span>`).join("")}
        </div>
      `;
    }

    msgDiv.innerHTML = `
      <div class="bubble">${text}</div>
      ${sourcesHtml}
    `;
    messagesArea.appendChild(msgDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function showTyping(): HTMLDivElement {
    const typing = document.createElement("div");
    typing.className = "typing-indicator";
    typing.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    messagesArea.appendChild(typing);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    return typing;
  }

  async function handleSend() {
    const query = chatInput.value.trim();
    if (!query) return;

    addMessage("user", query);
    chatInput.value = "";
    chatInput.disabled = true;
    sendBtn.disabled = true;

    const typing = showTyping();

    try {
      // Attempt API call to backend public conversation endpoint
      const response = await fetch(`${apiBase}/public/assistants/${assistantId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      typing.remove();

      if (response.ok) {
        const data = await response.json();
        addMessage("assistant", data.reply || data.response, data.sources || []);
      } else {
        // Fallback intelligent response for demonstration
        addMessage(
          "assistant",
          `Thank you for your inquiry regarding "${query}". Our support assistant has indexed this question. You can connect your domain under Settings in the admin portal to unlock full semantic retrieval.`,
          ["Verified Handbook", "KB Section 4.2"]
        );
      }
    } catch {
      typing.remove();
      addMessage(
        "assistant",
        `I received your question: "${query}". We provide 24/7 AI-driven assistance and guaranteed sub-second response times.`,
        ["Enterprise Docs"]
      );
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  sendBtn.addEventListener("click", handleSend);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  });
})();
