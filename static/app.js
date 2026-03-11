document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById("chatForm");
    const userInput = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");
    const fileUpload = document.getElementById("fileUpload");
    const uploadStatus = document.getElementById("uploadStatus");

    // File Upload Handler
    fileUpload.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        uploadStatus.textContent = "Uploading...";
        uploadStatus.classList.remove("hidden", "text-green-400", "text-red-400");
        uploadStatus.classList.add("text-blue-400", "animate-pulse");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            uploadStatus.classList.remove("animate-pulse");

            if (res.ok) {
                uploadStatus.textContent = "Data Ready ✓";
                uploadStatus.classList.remove("text-blue-400", "text-red-400");
                uploadStatus.classList.add("text-green-400");
                addMessage(`Success: Processed <strong>${file.name}</strong>. What would you like to know about the performance?`, "bot");
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            uploadStatus.classList.remove("animate-pulse");
            uploadStatus.textContent = "Upload Error!";
            uploadStatus.classList.remove("text-blue-400", "text-green-400");
            uploadStatus.classList.add("text-red-400");
            addMessage("Failed to upload the data file.", "bot");
        }
    });

    // Chat Form Submission
    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, "user");
        userInput.value = "";

        const loadingId = addMessage(`<div class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div><div class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div><div class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div></div>`, "bot", true);

        try {
            const formData = new FormData();
            formData.append("query", text);

            const res = await fetch("/api/chat", {
                method: "POST",
                body: formData
            });
            const data = await res.json();

            // remove loading
            document.getElementById(loadingId).remove();

            if (res.ok) {
                addMessage(data.response, "bot");
            } else {
                addMessage(`<span class="text-red-400 font-semibold">Error:</span> ${data.error || "Something went wrong."}`, "bot");
            }
        } catch (error) {
            document.getElementById(loadingId).remove();
            addMessage(`<span class="text-red-400 font-semibold">Connection Error:</span> Could not reach the server.`, "bot");
        }
    });

    function addMessage(text, sender, isLoading = false) {
        const id = "msg-" + Date.now();
        const wrapper = document.createElement("div");
        wrapper.id = id;
        wrapper.className = "flex gap-4 transform transition-all duration-300 translate-y-2 opacity-0 " + (sender === "user" ? "flex-row-reverse" : "");

        const avatar = document.createElement("div");
        avatar.className = "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg " +
            (sender === "user" ? "bg-slate-600" : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20");
        avatar.textContent = sender === "user" ? "Me" : "TR";

        const bubble = document.createElement("div");
        bubble.className = "p-5 border text-sm leading-relaxed max-w-[85%] shadow-md " +
            (sender === "user" ?
                "bg-slate-700/80 border-slate-600 rounded-2xl rounded-tr-none text-white font-medium" :
                "bg-slate-800/80 border-slate-700/50 rounded-2xl rounded-tl-none text-slate-200");

        if (isLoading) {
            bubble.classList.add("text-slate-400", "py-6");
            bubble.innerHTML = text; // HTML directly for the bounce animation
        } else {
            // Apply markdown formatting
            let formattedText = text;
            // Bold
            formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-200">$1</strong>');
            // Italic
            formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
            // Line Breaks
            formattedText = formattedText.replace(/\n/g, '<br>');

            bubble.innerHTML = formattedText;
        }

        wrapper.appendChild(avatar);
        wrapper.appendChild(bubble);
        chatBox.appendChild(wrapper);

        // Animation trigger
        setTimeout(() => {
            wrapper.classList.remove("translate-y-2", "opacity-0");
        }, 10);

        // Scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;

        return id;
    }
});
