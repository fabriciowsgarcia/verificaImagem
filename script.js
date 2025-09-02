// script.js (versão final com upload de arquivo local)

// MUDANÇA 1: Seleciona o novo input de ARQUIVO em vez do de URL
const apiKeyInput = document.querySelector("#api-key-input");
const imageFileInput = document.querySelector("#image-file-input"); // << MUDOU
const analisarBtn = document.querySelector("#analisar-btn");
const resultadoDiv = document.querySelector("#resultado");

analisarBtn.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value.trim();

    // MUDANÇA 2: Pega o ARQUIVO do input em vez da URL
    const file = imageFileInput.files[0]; // << MUDOU

    // Validação: Verifica se a chave ou o arquivo estão faltando
    if (!apiKey || !file) {
        resultadoDiv.textContent = "⚠️ Por favor, preencha a sua Chave de API e selecione um arquivo de imagem.";
        return;
    }

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`;
    
    analisarBtn.disabled = true;
    resultadoDiv.textContent = "Analisando a imagem... 🤖";

    try {
        // MUDANÇA 3: A chamada 'fetch(imageUrl)' foi REMOVIDA! Não precisamos mais buscar a imagem na web.

        // MUDANÇA 4: O tipo da imagem (mime type) vem diretamente do arquivo que o usuário selecionou.
        const imageMimeType = file.type; // << MUDOU

        // Passo B (quase igual): Converter o ARQUIVO para o formato Base64.
        const imageDataBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file); // << MUDOU (passamos o arquivo local para o leitor)
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
