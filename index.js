document.addEventListener("DOMContentLoaded", () => {
    const tipoAcaoSelect = document.getElementById("tipoAcao");
    const numRequisicaoInput = document.getElementById("numRequisicao");
    const turmaExtensaoInput = document.getElementById("turmaExtensao");
    const codigoSelect = document.getElementById("codigoSelect");
    const quantidadeInput = document.getElementById("quantidade");
    const validadeInput = document.getElementById("validade");
    const estoqueForm = document.getElementById("estoqueForm");
    const mensagemStatus = document.getElementById("mensagemStatus");
    const btnEnviar = document.getElementById("btnEnviar");

    const urlDadosJson = "https://raw.githubusercontent.com/changluis2016-jpg/ESTOQUE/main/dados.json";
    const urlPowerAutomate = "COLE_AQUI_A_URL_DO_SEU_POWER_AUTOMATE";

    let listaProdutos = [];

    async function carregarProdutos() {
        try {
            const resposta = await fetch(urlDadosJson);
            if (!resposta.ok) {
                throw new Error("Non potuit carregar dados.json.");
            }
            
            listaProdutos = await resposta.json();
            
            codigoSelect.innerHTML = '<option value="">Elige un producto...</option>';
            listaProdutos.forEach(prod => {
                const option = document.createElement("option");
                option.value = prod.codigo;
                option.textContent = `${prod.codigo} - ${prod.nome || 'Productum'} (Saldo: ${prod["saldo atual"] || 0})`;
                codigoSelect.appendChild(option);
            });
        } catch (erro) {
            console.error(erro);
            codigoSelect.innerHTML = '<option value="">Error in carregar</option>';
            mensagemStatus.textContent = "Error carring data from GitHub.";
            mensagemStatus.className = "status-msg erro";
        }
    }

    carregarProdutos();

    estoqueForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const tipoAcao = tipoAcaoSelect.value;
        const numRequisicao = numRequisicaoInput.value.trim();
        const turmaExtensao = turmaExtensaoInput.value.trim();
        const codigoSelecionado = codigoSelect.value;
        const quantidade = parseInt(quantidadeInput.value, 10);
        const validade = validadeInput.value;

        const produtoEncontrado = listaProdutos.find(p => String(p.codigo) === String(codigoSelecionado));
        const idProduto = produtoEncontrado ? String(produtoEncontrado.ID) : "";

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
            const respostaFluxo = await fetch(urlPowerAutomate, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (respostaFluxo.ok) {
                mensagemStatus.textContent = "Movimentação registrada com sucesso!";
                mensagemStatus.className = "status-msg sucesso";
                estoqueForm.reset();
            } else {
                throw new Error("Power Automate error.");
            }
        } catch (erro) {
            console.error(erro);
            mensagemStatus.textContent = "Error in sending request.";
            mensagemStatus.className = "status-msg erro";
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.textContent = "Processar Movimentação";
        }
    });
});
