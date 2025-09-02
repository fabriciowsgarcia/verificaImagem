// script.js (versão corrigida e melhorada)

// 1. Seleciona os elementos do HTML com os quais vamos interagir
const apiKeyInput = document.querySelector("#api-key-input");
const imageUrlInput = document.querySelector("#image-url-input");
const analisarBtn = document.querySelector("#analisar-btn");
const resultadoDiv = document.querySelector("#resultado");

// 2. Adiciona um "ouvinte" de evento ao botão.
// A função é 'async' pois a comunicação com a IA leva tempo.
analisarBtn.addEventListener("click", async () => {
    // Pega os valores dos campos e remove espaços em branco extras
    const apiKey = apiKeyInput.value.trim();
    const imageUrl = imageUrlInput.value.trim();

    // Validação: Verifica se algum dos campos está vazio
    if (!apiKey || !imageUrl) {
        resultadoDiv.textContent = "⚠️ Por favor, preencha a sua Chave de API e a URL da imagem.";
        return; // Para a execução da função aqui
    }

    // A URL da API do Google AI para o modelo de visão
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`;
    
    // Inicia o estado de "carregando" na interface para o usuário saber que algo está acontecendo
    analisarBtn.disabled = true;
    resultadoDiv.textContent = "Analisando a imagem... 🤖";

    // O bloco try...catch...finally é para tratamento de erros.
    try {
        // Passo A: "Baixar" a imagem no navegador e pegar o tipo dela (jpeg, png, etc)
        const responseImage = await fetch(imageUrl);
        if (!responseImage.ok) {
            throw new Error("Não foi possível buscar a imagem. Verifique a URL ou tente outra (pode ser um erro de CORS).");
        }
        const imageBlob = await responseImage.blob();
        const imageMimeType = imageBlob.type; // MELHORIA: Detecta o tipo da imagem automaticamente

        // Passo B: Converter a imagem para o formato Base64, que é o que a API aceita
        const imageDataBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]); // Pega só o código Base64
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
        });

        // Monta o corpo da requisição para a API
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

        // Passo C: Faz a chamada para a API do Gemini
        const response = await fetch(apiURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Erro da API: ${error.error.message}`);
        }

        // Passo D: Extrai os dados da resposta e exibe na tela
        const data = await response.json();
        // O caminho para o texto pode ser longo, é preciso navegar no objeto JSON retornado
        const descricao = data.candidates[0].content.parts[0].text;
        resultadoDiv.textContent = descricao;

    } catch (error) {
        // Se algo der errado em qualquer etapa, mostra uma mensagem de erro
        console.error("Erro:", error);
        resultadoDiv.textContent = `❌ Erro ao analisar a imagem: ${error.message}`;
    } finally {
        // Independente de sucesso ou erro, reabilita o botão
        analisarBtn.disabled = false;
    }
});
