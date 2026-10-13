document.addEventListener("DOMContentLoaded", () => {
    // Referências dos elementos do formulário
    const tipoAcaoSelect = document.getElementById("tipoAcao");
    const numRequisicaoInput = document.getElementById("numRequisicao");
    const turmaExtensaoInput = document.getElementById("turmaExtensao");
    const codigoSelect = document.getElementById("codigoSelect");
    const quantidadeInput = document.getElementById("quantidade");
    const validadeInput = document.getElementById("validade");
    const estoqueForm = document.getElementById("estoqueForm");
    const mensagemStatus = document.getElementById("mensagemStatus");
    const btnEnviar = document.getElementById("btnEnviar");

    // 1. Link RAW oficial do seu repositório no GitHub
    const urlDadosJson = "https://raw.githubusercontent.com/changluis2016-jpg/ESTOQUE/main/dados.json";

    // 2. Cole aqui a URL do seu gatilho HTTP do Power Automate
    const urlPowerAutomate = "COLE_AQUI_A_URL_DO_SEU_POWER_AUTOMATE";

    let listaProdutos = [];

    // Carregar os produtos do arquivo JSON no GitHub
    async function carregarProdutos() {
        try {
            const resposta = await fetch(urlDadosJson);
            if (!resposta.ok) {
                throw new Error("Não foi possível carregar o arquivo dados.json do GitHub.");
            }
            
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
            codigoSelect.innerHTML = '<option value="">Erro ao carregar produtos</option>';
            mensagemStatus.textContent = "Erro ao carregar os dados do GitHub. Verifique o arquivo dados.json.";
            mensagemStatus.className = "status-msg erro";
        }
    }

    carregarProdutos();

    // Processar e enviar o formulário para o Power Automate
    estoqueForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const tipoAcao = tipoAcaoSelect.value;
        const numRequisicao = numRequisicaoInput.value.trim();
        const turmaExtensao = turmaExtensaoInput.value.trim();
        const codigoSelecionado = codigoSelect.value;
        const quantidade = parseInt(quantidadeInput.value, 10);
        const validade = validadeInput.value;

        // Localiza o produto na lista carregada do GitHub para obter o ID
        const produtoEncontrado = listaProdutos.find(p => String(p.codigo) === String(codigoSelecionado));
        const idProduto = produtoEncontrado ? String(produtoEncontrado.ID) : "";

        // Estrutura do Payload exatamente igual ao Schema do Gatilho HTTP do Power Automate
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

        // Bloqueia o botão durante o envio
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
                mensagemStatus.textContent = "Movimentação registrada e processada com sucesso!";
                mensagemStatus.className = "status-msg sucesso";
                estoqueForm.reset();
            } else {
                throw new Error("O fluxo do Power Automate retornou um erro.");
            }
        } catch (erro) {
            console.error(erro);
            mensagemStatus.textContent = "Erro ao enviar a solicitação para o Power Automate.";
            mensagemStatus.className = "status-msg erro";
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.textContent = "Processar Movimentação";
        }
    });
});
});
