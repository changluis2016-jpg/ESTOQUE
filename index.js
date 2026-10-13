document.addEventListener("DOMContentLoaded", () => {
    const codigoSelect = document.getElementById("codigoSelect");
    const estoqueForm = document.getElementById("estoqueForm");
    const mensagemStatus = document.getElementById("mensagemStatus");
    const btnEnviar = document.getElementById("btnEnviar");

    // Substitua pelo link RAW real do seu dados.json no GitHub
    const urlDadosJson = "https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPOSITORIO/main/dados.json";

    let listaProdutos = [];

    // 1. Carregar produtos do cache do GitHub para consulta instantânea
    async function carregarProdutos() {
        try {
            const resposta = await fetch(urlDadosJson);
            if (!resposta.ok) throw new Error("Erro ao carregar dados do GitHub");
            
            listaProdutos = await resposta.json();
            
            codigoSelect.innerHTML = '<option value="">Selecione um produto...</option>';
            listaProdutos.forEach(prod => {
                const option = document.createElement("option");
                option.value = prod.codigo;
                option.textContent = `${prod.codigo} - ${prod.nome || 'Produto'} (Saldo: ${prod.saldo_atual || 0})`;
                codigoSelect.appendChild(option);
            });
        } catch (erro) {
            console.error(erro);
            codigoSelect.innerHTML = '<option value="">Erro ao carregar produtos do JSON</option>';
            mensagemStatus.textContent = "Aviso: Não foi possível carregar o cache do GitHub.";
            mensagemStatus.className = "status-msg erro";
        }
    }

    carregarProdutos();

    // 2. Enviar a transação estruturada para o Power Automate
    estoqueForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const tipoAcao = document.getElementById("tipoAcao").value;
        const numRequisicao = document.getElementById("numRequisicao").value;
        const turmaExtensao = document.getElementById("turmaExtensao").value;
        const codigoSelecionado = codigoSelect.value;
        const quantidade = parseInt(document.getElementById("quantidade").value);
        const validade = document.getElementById("validade").value;

        // Localizar o ID correspondente no array carregado do GitHub
        const produtoEncontrado = listaProdutos.find(p => p.codigo == codigoSelecionado);
        const idProduto = produtoEncontrado ? produtoEncontrado.ID : "";

        // Payload completo enviado para o Power Automate
        const payload = {
            acao: tipoAcao,
            requisicao: numRequisicao,
            turma: turmaExtensao,
            itens: [
                {
                    codigo: codigoSelecionado,
                    quantidade: quantidade,
                    validade: validade,
                    id: idProduto
                }
            ]
        };

        btnEnviar.disabled = true;
        btnEnviar.textContent = "Processando...";
        mensagemStatus.textContent = "";

        try {
            const respostaFluxo = await fetch("SUA_URL_DO_POWER_AUTOMATE_AQUI", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (respostaFluxo.ok) {
                mensagemStatus.textContent = "Movimentação realizada com sucesso!";
                mensagemStatus.className = "status-msg sucesso";
                estoqueForm.reset();
            } else {
                throw new Error("Falha ao comunicar com o fluxo.");
            }
        } catch (erro) {
            console.error(erro);
            mensagemStatus.textContent = "Erro ao processar movimentação. Tente novamente.";
            mensagemStatus.className = "status-msg erro";
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.textContent = "Processar Movimentação";
        }
    });
});
});
