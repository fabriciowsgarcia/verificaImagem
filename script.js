// script.js (versão final com modelo de IA atualizado)

const apiKeyInput = document.querySelector("#api-key-input");
const imageFileInput = document.querySelector("#image-file-input");
const analisarBtn = document.querySelector("#analisar-btn");
const resultadoDiv = document.querySelector("#resultado");

analisarBtn.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value.trim();
    const file = imageFileInput.files[0];

    if (!apiKey || !file) {
        resultadoDiv.textContent = "⚠️ Por favor, preencha a sua Chave de API e selecione um arquivo de imagem.";
        return;
    }

    // MUDANÇA FINAL: Atualizamos o nome do modelo para a versão mais recente do Google AI.
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    analisarBtn.disabled = true;
    resultadoDiv.textContent = "Analisando a imagem... 🤖";

    try {
        const imageMimeType = file.type;

        const imageDataBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const requestBody = {
            "contents": [{
                "parts": [
                    { "text": "Descreva esta imagem em detalhes, em português." },
                    {
                        "inline_data": {
                            "mime_type": imageMimeType,
                            "data": imageDataBase64
                        }
                    }
                ]
            }]
        };

        const response = await fetch(apiURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro da API: ${error.error.message}`);
        }

        const data = await response.json();
        const descricao = data.candidates[0].content.parts[0].text;
        resultadoDiv.textContent = descricao;

    } catch (error) {
        console.error("Erro:", error);
        resultadoDiv.textContent = `❌ Erro ao analisar a imagem: ${error.message}`;
    } finally {
        analisarBtn.disabled = false;
    }
});
