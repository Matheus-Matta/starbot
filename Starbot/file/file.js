
const fs = require('fs');
const mensagens = require('../mesagens/mesagens.js');

const filePath = './starbot/file/menuAtual.txt';

// Função para salvar o menu atual para um cliente
function salvarMenu(numero, menu,atendidoPor,nome,setor,desc) {

    // Obter a data e hora atual
    const dataAtual = new Date();


    // Verifica se o arquivo existe, se não, cria o arquivo
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
    }

    // Lê o conteúdo atual do arquivo
    const conteudo = fs.readFileSync(filePath, 'utf8');
    let clientes = {};
    // Se houver conteúdo no arquivo, analisa o conteúdo para obter os clientes existentes
    if (conteudo.trim() !== '') {
        clientes = JSON.parse(conteudo);
    }
    
     
    // Atualiza o menu atual do cliente junto com a data e hora
    clientes[numero] = {
        menu: menu,
        dataHora: dataAtual,
        atendidoPor: atendidoPor || null,
        nome: nome || null,
        setor: setor || null,
        desc: desc || null
    };

    // Escreve os clientes atualizados de volta para o arquivo
    fs.writeFileSync(filePath, JSON.stringify(clientes));
}


// Função para ler o menu atual de um cliente
function lerMenu(numero) {

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
        return 'inicio';
    }

    // Lê o conteúdo atual do arquivo
    const conteudo = fs.readFileSync(filePath, 'utf8');
    let clientes = {};

    // Se houver conteúdo no arquivo, analisa o conteúdo para obter os clientes existentes
    if (conteudo.trim() !== '') {
        clientes = JSON.parse(conteudo);
    }

    // Verifica se o número está registrado como cliente e se há um menu associado
    if (numero in clientes && clientes[numero].menu) {
        // Retorna o menu associado
        return clientes[numero].menu;
    } else {
        return 'inicio';
    }
}

async function apagarMenu(numero, client) {

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
        console.log('O arquivo não existe.');
        return;
    }

    // Lê o conteúdo atual do arquivo
    let conteudo = fs.readFileSync(filePath, 'utf8');
    let clientes = {};

    // Se houver conteúdo no arquivo, analisa o conteúdo para obter os clientes existentes
    if (conteudo.trim() !== '') {
        clientes = JSON.parse(conteudo);
    }

    // Verifica se o número está registrado como cliente
    if (numero in clientes) {
        // Remove a entrada correspondente ao número
        delete clientes[numero];
        // Escreve os clientes atualizados de volta para o arquivo
        conteudo = JSON.stringify(clientes);
        fs.writeFileSync(filePath, conteudo);

        try {
            // Agora, envie a mensagem de encerramento do atendimento
            await client.sendMessage(numero, 'Atendimento encerrado!!');
        } catch (erro) {
            console.error('Erro ao enviar a mensagem para', numero, ':', erro);
        }


    }
}

async function verificarInatividade(client) {
    let mensagem;
    let enviar = false;
    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
        console.log('O arquivo não existe.');
        return;
    }

    // Lê o conteúdo atual do arquivo
    let conteudo = fs.readFileSync(filePath, 'utf8');
    let clientes = {};

    // Se houver conteúdo no arquivo, analisa o conteúdo para obter os clientes existentes
    if (conteudo.trim() !== '') {
        clientes = JSON.parse(conteudo);
    }

    // Obtém a data e hora atuais
    const agora = new Date();

    // Itera sobre os clientes
    for (const numero in clientes) {

        let menu = clientes[numero].menu

        // Obtém a data e hora da última mensagem do cliente
        const ultimaMensagem = new Date(clientes[numero].dataHora);

        // Calcula a diferença de tempo entre agora e a última mensagem (em milissegundos)
        const diferencaTempo = agora - ultimaMensagem;

        // Verifica se a diferença de tempo é maior que 10 minutos (em milissegundos)
        if (diferencaTempo > 10 * 60 * 1000 && menu != 'avaliar' && menu != 'atendido') { // 10 minutos * 60 segundos * 1000 milissegundos
            mensagem = mensagens.inativo;
            // Remove o menu associado ao cliente
            delete clientes[numero];
            enviar = true;
        } else if (diferencaTempo > 5 * 60 * 1000 && menu == 'avaliar') { // 5 minutos * 60 segundos * 1000 milissegundos
            delete clientes[numero];
        }

        // Escreve os clientes atualizados de volta para o arquivo
        conteudo = JSON.stringify(clientes);
        fs.writeFileSync(filePath, conteudo);

        if (enviar) {
            try {
                // Agora, envie a mensagem de encerramento do atendimento
                await client.sendMessage(numero, mensagem);
            } catch (erro) {
                console.error('Erro ao enviar a mensagem para', numero, ':', erro);
            }
        }

    }

    // Escreve os clientes atualizados de volta para o arquivo
    fs.writeFileSync(filePath, JSON.stringify(clientes));

}
// Função para ler o menu atual de um cliente
function lerCliente(numero) {

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
        return 'inicio';
    }

    // Lê o conteúdo atual do arquivo
    const conteudo = fs.readFileSync(filePath, 'utf8');
    let clientes = {};

    // Se houver conteúdo no arquivo, analisa o conteúdo para obter os clientes existentes
    if (conteudo.trim() !== '') {
        clientes = JSON.parse(conteudo);
    }

    // Verifica se o número está registrado como cliente e se há um menu associado
    if (numero in clientes) {
        // Retorna o menu associado
        return clientes[numero];
    } else {
        return null;
    }
}

module.exports = {
    verificarInatividade: verificarInatividade,
    salvarMenu: salvarMenu,
    lerMenu: lerMenu,
    apagarMenu: apagarMenu,
    lerCliente:  lerCliente
};