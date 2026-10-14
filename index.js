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
    const urlPowerAutomate = "https://default554116b687be480a9e3aa0e9e1a653.4b.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/02/workflows/53a06847ff1a435baa429b1692cfc84f/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6J_jbnw0N4Ji2DKpAYDQEhNjpGpNRYUdKmueyuuXmrs";

    let listaProdutos = [];

    async function carregarProdutos() {
        try {
            const resposta = await fetch(urlDadosJson);
            if (!resposta.ok) {
                throw new Error("Não foi possível carregar dados.json.");
            }
            
            listaProdutos = await resposta.json();
            
            codigoSelect.innerHTML = '<option value="">Selecione um produto...</option>';
            listaProdutos.forEach(prod => {
                const option = document.createElement("option");
                option.value = prod.codigo;
                option.textContent = `${prod.codigo} - ${prod.nome || 'Produto'} (Saldo: ${prod["saldo atual"] || 0})`;
                codigoSelect.appendChild(option);
            });
        } catch (erro) {
            console.error(erro);
            codigoSelect.innerHTML = '<option value="">Erro ao carregar</option>';
            mensagemStatus.textContent = "Erro ao carregar os dados do GitHub.";
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
                throw new Error("Erro no Power Automate.");
            }
        } catch (erro) {
            console.error(erro);
            mensagemStatus.textContent = "Erro ao enviar a solicitação.";
            mensagemStatus.className = "status-msg erro";
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.textContent = "Processar Movimentação";
        }
    });
});
