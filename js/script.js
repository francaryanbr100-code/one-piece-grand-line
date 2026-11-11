
const API_URL = "https://api.api-onepiece.com/v2/characters/en";

const charactersContainer = document.getElementById("characters-container");
const searchInput = document.getElementById("search-input");
const ageFilter = document.getElementById("age-filter");
const loadMoreButton = document.getElementById("load-more");
const resultsMessage = document.getElementById("results-message");

const characterAliases = {
    
    "Montblanc Cricket": "Mont Blanc Cricket",
    "Lucky Roo": "Lucky Roux",
    "Charlotte Linlin / Big Mom": "Charlotte Linlin",
    "Kaido": "Kaidou",
    "Marchall D. Teach / Barbe Noire": "Marshall D. Teach",
    "Baggy / Le Clown": "Buggy",
    "Krieg / Don Krieg": "Krieg",
    "Eustass Kidd": "Eustass Kid",
    "Yassop": "Yasopp",
    "Gyn": "Gin",
    "Das Bones": "Daz Bones",
    "Edward Weeble": "Edward Weevil"
};
const characterImages = {

    "Monkey D Luffy": "https://i.pinimg.com/736x/31/5c/32/315c3288e853ed5ee806a4df72e8bb88.jpg",

    "Roronoa Zoro": "https://static.wikia.nocookie.net/glad-you-came/images/a/a2/Zoro.png/revision/latest/thumbnail/width/360/height/360?cb=20230710081928",

    "Nami": "https://sm.ign.com/ign_br/screenshot/default/imagem-2025-03-26-123855099_td4y.jpg",

    "Sanji": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFyGJb0RpSOrOZhcwuWbFZe1OBuqEQ7810XEYdyVSwshwzu7dJtYVlgy6V&s=10",

    "Usopp": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSGGRHwG3jdiJ0SbH-HhkVWvfow_Ln3ikSp-7QREwWoopz7t52zAw5GlU&s=10",

    "Tony-Tony Chopper": "https://static.wikia.nocookie.net/onepiece/images/e/e6/Tony_Tony_Chopper_Anime_Pre_Timeskip_Infobox.png/revision/latest?cb=20240727231907&path-prefix=pt",

    "Nico Robin": "https://64.media.tumblr.com/6dcc1d66770b897347c7b4c29c2c23ab/4e171844afb8c47a-21/s500x750/46abd728ae6c4ce73236682f99a162651ab98890.jpg",

    "Franky": "https://i.pinimg.com/736x/bf/6a/cd/bf6acd283b518e45255a3cf7fa15df5a.jpg",

    "Brook": "https://i.pinimg.com/736x/59/d8/cc/59d8ccb398958fb814d2106bd8b8089f.jpg",

    "Jinbe": "https://i.pinimg.com/736x/f6/9a/6f/f69a6f788350903118f909d401f42ecb.jpg",

    "Baby 5": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfDNHL2v1ZtjmsboOscRVIOHym_-XE81KnDujdUBjjVPSSWCRVbLWAIJlo&s=10",

    "Ideo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9RrTTUiZ3zw7zIHXf2UZgLs-Wy8ZIQMBt4Zg5LgmasxWuN8doumlCn1w&s=10",

    "Trafalgar D. Water Law": "https://i.pinimg.com/736x/78/23/47/7823475f33dd0a5c5a1ee4e19993c3fd.jpg",

    "Pingouin": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9RrLCfZ667ZircPnXYD1VLG2aHM06ASjEj34Noa-zPNVW2494TajAkIU&s=10"




};

// Busca automaticamente imagens na One Piece Wiki
// Busca automaticamente retratos dos personagens na Wiki

const imageCache = new Map();

async function fetchAutomaticImage(characterName) {
    if (!imageCache.has(characterName)) {
        imageCache.set(
            characterName,
            fetchAutomaticImage(characterName)
        );
    }

    return imageCache.get(characterName);
}

async function getAutomaticImage(characterName) {
    console.log("BUSCANDO IMAGEM PARA:", characterName);

    try {
        const wikiName = characterAliases[characterName] || characterName;

        // Função auxiliar para procurar uma imagem em uma página
        async function findImageInPage(pageTitle) {
            const searchUrl = `https://onepiece.fandom.com/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=images&imlimit=100&format=json&origin=*`;

            const response = await fetch(searchUrl);
            const data = await response.json();

            const page = Object.values(data.query?.pages || {})[0];
            const images = page?.images || [];

            // Prioridade: Anime Infobox
            let selectedImage = images.find(image => {
                const title = image.title.toLowerCase();
                return title.includes("anime") && title.includes("infobox");
            });

            // Segunda opção: imagem com o nome do personagem
            if (!selectedImage) {
                const normalizedName = pageTitle.toLowerCase();

                selectedImage = images.find(image => {
                    const title = image.title.toLowerCase();

                    return title.includes(normalizedName) &&
                        /\.(png|jpg|jpeg|webp)$/i.test(title);
                });
            }

            if (!selectedImage) return null;

            const imageUrl = `https://onepiece.fandom.com/api.php?action=query&titles=${encodeURIComponent(selectedImage.title)}&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*`;

            const imageResponse = await fetch(imageUrl);
            const imageData = await imageResponse.json();

            const imagePage = Object.values(imageData.query?.pages || {})[0];

            return imagePage?.imageinfo?.[0]?.thumburl || null;
        }

        // Primeira e segunda tentativas: página direta
        let imageUrl = await findImageInPage(wikiName);

        if (imageUrl) {
            console.log("IMAGEM ENCONTRADA:", characterName, imageUrl);
            return imageUrl;
        }

        // Terceira tentativa: pesquisa na Wiki
        console.log("PESQUISANDO OUTRA PÁGINA:", characterName);

        const searchUrl = `https://onepiece.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(wikiName)}&srnamespace=0&srlimit=5&format=json&origin=*`;

        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        const results = searchData.query?.search || [];

        for (const result of results) {
            const title = result.title.toLowerCase();

            // Evita páginas de episódios, capítulos e históricos
            if (
                title.includes("/history") ||
                title.includes("episode ") ||
                title.includes("chapter ") ||
                title.includes("pirates")
            ) {
                continue;
            }

            imageUrl = await findImageInPage(result.title);

            if (imageUrl) {
                console.log("IMAGEM ENCONTRADA NA PESQUISA:", characterName, result.title);
                return imageUrl;
            }
        }

        console.log("NENHUMA IMAGEM ENCONTRADA:", characterName);
        return null;

    } catch (error) {
        console.error("Erro ao buscar imagem:", error);
        return null;
    }
}




let allCharacters = [];
let filteredCharacters = [];
let currentPage = 1;

const charactersPerPage = 20;

// Traduz o status do personagem

function translateStatus(status) {
    const statuses = {
        vivant: "Vivo",
        living: "Vivo",
        alive: "Vivo",
        mort: "Morto",
        dead: "Morto",
        inconnu: "Desconhecido",
        unknown: "Desconhecido"
    };

    return statuses[status?.toLowerCase()] || status || "Não informado";

}

// Formata a recompensa
function formatBounty(bounty) {
    if (!bounty || bounty === "0") {
        return "Não informada";
    }

    return bounty + " ฿";
}

// Cria as iniciais do personagem
function getInitials(name) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join("")
        .toUpperCase();
}

// Cria o card do personagem
function createCharacterCard(character) {
    const card = document.createElement("article");
    card.classList.add("character-card");

    const avatar = document.createElement("div");
    avatar.classList.add("character-avatar");
    avatar.textContent = getInitials(character.name || "?");
    const customImage = characterImages[character.name];
    if (character.name === "Baby 5" || character.name === "Ideo") {
    console.log("Nome recebido:", character.name);
    console.log("Imagem personalizada:", customImage);
}

function addImage(imageUrl) {
    if (!imageUrl) return;

    const image = document.createElement("img");

    image.src = imageUrl;
    image.alt = character.name;
    image.classList.add("character-image");
    image.loading = "lazy";

    image.onerror = () => image.remove();

    avatar.appendChild(image);
}

if (customImage) {
    addImage(customImage);
} else {
    getAutomaticImage(character.name).then(imageUrl => {
        if (imageUrl && avatar.isConnected) {
            addImage(imageUrl);
        }
    });
}

    const info = document.createElement("div");
    info.classList.add("character-info");

    const name = document.createElement("h3");
    name.textContent = character.name || "Nome desconhecido";

    const age = document.createElement("p");
    age.textContent = "Idade: " + (character.age || "Não informada");

    const status = document.createElement("p");
    status.textContent = "Status: " + translateStatus(character.status);

    const bounty = document.createElement("p");
    bounty.textContent = "Recompensa: " + formatBounty(character.bounty);

    const crew = document.createElement("p");
    crew.textContent = "Tripulação: " +
        (character.crew?.name || "Não informada");

    const fruit = document.createElement("p");
    fruit.textContent = "Fruta: " +
        (character.fruit?.name || "Nenhuma informação");

    info.appendChild(name);
    info.appendChild(age);
    info.appendChild(status);
    info.appendChild(bounty);
    info.appendChild(crew);
    info.appendChild(fruit);

    card.appendChild(avatar);
    card.appendChild(info);

    return card;
}

// Exibe os personagens na tela
function displayCharacters() {
    charactersContainer.innerHTML = "";

    const start = 0;
    const end = currentPage * charactersPerPage;

    const charactersToDisplay = filteredCharacters.slice(start, end);

    charactersToDisplay.forEach(character => {
        charactersContainer.appendChild(createCharacterCard(character));
    });

    resultsMessage.textContent =
        `Exibindo ${charactersToDisplay.length} de ${filteredCharacters.length} personagens.`;

    loadMoreButton.style.display =
        end < filteredCharacters.length ? "block" : "none";
}

// Aplica pesquisa e filtro de idade
function filterCharacters() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedAge = ageFilter.value;

    filteredCharacters = allCharacters.filter(character => {
        const nameMatches = (character.name || "")
            .toLowerCase()
            .includes(searchTerm);

        const age = parseInt(character.age, 10);

        let ageMatches = true;

        if (selectedAge && !Number.isNaN(age)) {
            if (selectedAge === "0-12") {
                ageMatches = age <= 12;
            } else if (selectedAge === "13-17") {
                ageMatches = age >= 13 && age <= 17;
            } else if (selectedAge === "18-29") {
                ageMatches = age >= 18 && age <= 29;
            } else if (selectedAge === "30-59") {
                ageMatches = age >= 30 && age <= 59;
            } else if (selectedAge === "60+") {
                ageMatches = age >= 60;
            }
        } else if (selectedAge) {
            ageMatches = false;
        }

        return nameMatches && ageMatches;
    });

    currentPage = 1;

    if (filteredCharacters.length === 0) {
        charactersContainer.innerHTML = "";
        resultsMessage.textContent = "Nenhum personagem encontrado.";
        loadMoreButton.style.display = "none";
        return;
    }

    displayCharacters();
}

// Busca os personagens na API
async function loadCharacters() {
    resultsMessage.textContent = "Carregando personagens...";
    loadMoreButton.style.display = "none";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Erro ao consultar a API.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("A API não retornou uma lista de personagens.");
        }

        allCharacters = data;
        filterCharacters();

    } catch (error) {
        console.error("Erro ao carregar personagens:", error);

        resultsMessage.textContent =
            "Não foi possível carregar os personagens. Tente novamente.";
    }
}

// Eventos de pesquisa e filtro
searchInput.addEventListener("input", filterCharacters);

ageFilter.addEventListener("change", filterCharacters);

// Carrega mais personagens
loadMoreButton.addEventListener("click", function () {
    currentPage++;
    displayCharacters();
});

// Inicia o site
loadCharacters();
