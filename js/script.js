async function buscarLivro(event) {
    event.preventDefault();
    const input = document.getElementById('input-livro');
    const loading = document.getElementById('loading');
    const query = input.value.trim();
    
    if (!query) return;

    try {
        if (loading) loading.style.display = "block";
        const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.docs && data.docs.length > 0) {
            const livro = data.docs[0];
            const novoLivro = {
                id: livro.key,
                titulo: livro.title,
                autor: livro.author_name ? livro.author_name[0] : "Desconhecido",
                ano: livro.first_publish_year || "N/A",
                capa: livro.cover_i ? `https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg` : 'https://via.placeholder.com/50x75?text=Sem+Capa',
                link: `https://openlibrary.org${livro.key}`,
                lido: false // STATUS INICIAL
            };
            salvarNoLocalStorage(novoLivro);
            input.value = ""; 
        } else { alert("Livro não encontrado."); }
    } catch (error) { alert("Erro na busca."); }
    finally { if (loading) loading.style.display = "none"; }
}

function salvarNoLocalStorage(livro) {
    let favoritos = JSON.parse(localStorage.getItem('meusLivros')) || [];
    if (favoritos.some(item => item.id === livro.id)) {
        alert("Livro já está na lista!"); return;
    }
    favoritos.push(livro);
    localStorage.setItem('meusLivros', JSON.stringify(favoritos));
    renderizarTabela();
}

function renderizarTabela(filtro = "") {
    const corpoTabela = document.getElementById('corpo-tabela');
    const contador = document.getElementById('contador');
    let favoritos = JSON.parse(localStorage.getItem('meusLivros')) || [];
    
    corpoTabela.innerHTML = "";
    
    // Filtra os livros se houver texto no campo de busca da tabela
    const livrosFiltrados = favoritos.filter(l => 
        l.titulo.toLowerCase().includes(filtro.toLowerCase()) || 
        l.autor.toLowerCase().includes(filtro.toLowerCase())
    );

    if (contador) contador.innerText = livrosFiltrados.length;

    livrosFiltrados.forEach((livro, index) => {
        const indexReal = favoritos.findIndex(f => f.id === livro.id);
        const linha = `
            <tr class="${livro.lido ? 'linha-lido' : ''}">
                <td><img src="${livro.capa}" class="capa-livro" onerror="this.src='https://via.placeholder.com/50x75?text=N/A'"></td>
                <td class="${livro.lido ? 'titulo-lido' : ''}"><a href="${livro.link}" target="_blank">${livro.titulo}</a></td>
                <td>${livro.autor}</td>
                <td>${livro.ano}</td>
                <td>
                    <button class="btn-status ${livro.lido ? 'lido' : 'nao-lido'}" onclick="alternarStatus(${indexReal})">
                        ${livro.lido ? 'Lido ✓' : 'Pendente'}
                    </button>
                </td>
                <td><button class="btn-excluir" onclick="excluirLivro(${indexReal})">Excluir</button></td>
            </tr>
        `;
        corpoTabela.innerHTML += linha;
    });
}

function alternarStatus(index) {
    let favoritos = JSON.parse(localStorage.getItem('meusLivros')) || [];
    favoritos[index].lido = !favoritos[index].lido;
    localStorage.setItem('meusLivros', JSON.stringify(favoritos));
    renderizarTabela(document.getElementById('filtro-tabela').value);
}

function excluirLivro(index) {
    let favoritos = JSON.parse(localStorage.getItem('meusLivros')) || [];
    favoritos.splice(index, 1);
    localStorage.setItem('meusLivros', JSON.stringify(favoritos));
    renderizarTabela(document.getElementById('filtro-tabela').value);
}

// BUSCA EM TEMPO REAL NA TABELA
document.getElementById('filtro-tabela').addEventListener('input', (e) => {
    renderizarTabela(e.target.value);
});

document.getElementById('btn-limpar-tudo').addEventListener('click', () => {
    if (confirm("Apagar tudo?")) { localStorage.removeItem('meusLivros'); renderizarTabela(); }
});

document.addEventListener('DOMContentLoaded', () => renderizarTabela());
document.getElementById('form-busca').addEventListener('submit', buscarLivro);