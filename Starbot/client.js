const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth()
});

const qrcode = require('qrcode-terminal');

const path = require('path');
const fs = require('fs');

const mensagens = require('./mesagens/mesagens.js');
const { salvarMenu, lerMenu, apagarMenu, verificarInatividade, lerCliente } = require('./file/file.js');
const { contarOpcoes, verificarCpf } = require('./utils/utils.js')
const { wp_sendmsg, iniciarSocket } = require("../websocket/websocket.js")
const { select_db, salvarMensagem, updateValue} = require("../Sqlite3/configSqlite.js")
const { app } = require("../app/app.js");

const FILA = [] // array para fila de espera

iniciarSocket(client,filaEspera, MessageMedia)
app(client,mensagens,filaEspera) 

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    
    setInterval(() => verificarInatividade(client), 10 * 60 * 1000); // 10 minuto * 60 segundos * 1000 milissegundos
    console.log('Cliente pronto!');
});

client.on('message', async (msg) => {
    
    // Obtém a data e hora atual
    const numero = msg.from;
    const mensagem = msg.body.toLowerCase(); // Converte a mensagem para minúsculas
    const CLIENTE = lerCliente(numero)
    let menu = 'inicio';
    let diferenca = 2000;


    if(CLIENTE){
        menu = CLIENTE.menu
        const dataCliente = new Date(CLIENTE.dataHora);
        const dataAtual = new Date();
        if(dataCliente && dataAtual){
            diferenca = dataAtual - dataCliente;
        }
    }
   

if (diferenca > 1000) {
        
    let image = null;
    let video = null;
    if (msg.type === 'ptt') {
        client.sendMessage(numero,'Desculpe, não escutamos audio. Por favor, envie uma mensagem')
        return 0;
    }
    // Verifica se a mensagem contém uma imagem
    if (msg.hasMedia) {
        const pathPasta = path.join(`./Pages/imagens/${numero}`);
        if (!fs.existsSync(pathPasta)) {
            fs.mkdirSync(pathPasta);
        }
        const mediafile = await msg.downloadMedia();
        const date = new Date(msg.timestamp * 1000).toISOString().substring(0, 10);

        if(msg.type == 'image'){  
            const filepath = path.join(pathPasta, `${msg.id.id}_${date}.jpg`);
            fs.writeFileSync(filepath, mediafile.data, 'base64');
            image = `imagens/${numero}/${msg.id.id}_${date}.jpg`;

        } else if (msg.type == 'video'){
            const filepath = path.join(pathPasta, `${msg.id.id}_${date}.mp4`);
            fs.writeFileSync(filepath, mediafile.data, 'base64');
            video = `imagens/${numero}/${msg.id.id}_${date}.mp4`;

        }
           
        
    }
    // Verifica se a mensagem é igual a 'sair'
    if (mensagem === 'sair' && menu != 'atendido') {
        menu = 'sair'; // define sair para finalizar a conversa no switch
    }

    // verificar se está em um menu de opçoes e contar quantas opçoes tem

    if (/\d/.test(menu)) {
        const qtd = contarOpcoes(mensagens[menu])
        if (+mensagem > 0 && +mensagem <= qtd) { // verifica se a msg passou do limite das opçoes 
            // adiciona ao menu a opção/mensagem, para que seja enviado a resposta correta 
            menu = menu + mensagem;
        } else {
            menu = 'invalido'  // define invalido para ser enviado a menssagem 'Opção inválida' no switch
        }
    }

    switch (menu) {
        case 'inicio':
            await msg.reply(mensagens.menu1);
            salvarMenu(numero, 'menu1')
            break;
        case 'invalido':
            await msg.reply('Opção inválida');
            salvarMenu(numero, 'menu1')
            break;
        case 'sair':
            await msg.reply(mensagens.finalizado);
            salvarMenu(numero, 'avaliar')
            FILA.forEach((cliente,index)=>{
                if(cliente.numero == numero){
                    FILA.splice(index, 1);
                }
            })
            break;
        case 'avaliar':
            await msg.reply(mensagens.avaliado);
            apagarMenu(numero, client)
            break;
        case 'atendido':
                const dataAtual = new Date();
                const horaAtual = dataAtual.getHours().toString().padStart(2, '0');
                const minutoAtual = dataAtual.getMinutes().toString().padStart(2, '0');
                const data = {
                    usuario: CLIENTE.atendidoPor,
                    cliente: {
                        numero: numero,
                        nome: CLIENTE.nome
                    },
                    data: `${horaAtual}:${minutoAtual}`,
                    msg: msg.body,
                    image: image,
                    video: video
                }
                await salvarMensagem(numero , numero, CLIENTE.atendidoPor, CLIENTE.nome, msg.body, image, video)
                await wp_sendmsg(data);
            break
        case "cpf": 
            await msg.reply(mensagens.cpf);
            salvarMenu(numero,"transferir",null, msg.body, CLIENTE.setor, CLIENTE.desc)
            break;
        case 'menu11':
            await msg.reply(mensagens.menu11);
            salvarMenu(numero,"inicio")
            break;
        case 'menu12':
            await msg.reply(mensagens.menu12);
            salvarMenu(numero, 'menu12')
            break;
        case "menu121":
            await msg.reply(mensagens.menu121);
            salvarMenu(numero, 'menu121',null,null,'montagem')
            break;  
        case "menu1211":
            await msg.reply(mensagens.nome_sobrenome);
            salvarMenu(numero, 'cpf',null,null,'montagem')
            break;
        case "menu1212":
            await msg.reply(mensagens.nome_sobrenome);
            salvarMenu(numero, 'cpf',null,null,'assistencia')
            break
        case 'menu122':
            await msg.reply(mensagens.nome_sobrenome);
            salvarMenu(numero, 'cpf',null,null,'entrega')
            break;
        case 'menu123':
            await msg.reply(mensagens.menu123);
            salvarMenu(numero,'ocorrido',null,null,'sac')
            break 
        case 'ocorrido':
            await msg.reply(mensagens.nome_sobrenome);
            salvarMenu(numero,'cpf',null,null, CLIENTE.setor, msg.body)
            break;
        case 'transferir':
            const cpf = verificarCpf(msg.body)
            if(!cpf){
                salvarMenu(numero,"transferir",null, CLIENTE.nome, CLIENTE.setor)
                await msg.reply(mensagens.cpfInvalido);
            } else {
                const query = "SELECT * FROM Funcionarios WHERE ativo = 1 AND setor = ? ORDER BY qtdAtendimento ASC";
                const array = [CLIENTE.setor];
                await select_db(query, array, async (err, users) => {
                    if (err) {
                        console.error('Erro ao buscar funcionários:', err.message);
                        return;
                    }

                    if (!users || users.length === 0) {
                        await client.sendMessage(numero, "No momento, não temos nenhum funcionário disponível. Entraremos em contato assim que possível.");
                        salvarMenu(numero, 'espera', null , mensagem, CLIENTE.setor);
                        const cliente = {
                            nome: CLIENTE.nome,
                            numero: numero,
                            setor: CLIENTE.setor,
                            cpf: cpf,
                            desc: CLIENTE.desc
                        }
                        FILA.push(cliente)
                        return;
                    }
                    const user = users[0];
                    if (user) {
                        // Aqui você pode prosseguir com o atendimento usando o funcionário encontrado
                        salvarMenu(numero, 'atendido', user.usuario, mensagem, CLIENTE.setor,CLIENTE.desc);
                        const msgTransferencia = `**BOT:** O cliente: ${mensagem}\n Numero: ${numero}\n Foi Transferido para você!!`

                        // Obter a hora e minuto atual
                        const dataAtual = new Date();
                        const horaAtual = dataAtual.getHours().toString().padStart(2, '0');
                        const minutoAtual = dataAtual.getMinutes().toString().padStart(2, '0');
                        const data = {
                            usuario: user.usuario,
                            cliente: {
                                numero: numero,
                                cpf: cpf,
                                nome: CLIENTE.nome,
                                desc: CLIENTE.desc
                            },
                            data: `${horaAtual}:${minutoAtual}`,
                            msg: msgTransferencia
                        }

                        // cadastro cliente aqui
                        // function ();

                        await wp_sendmsg(data);
                        await msg.reply( `atendimento transferido para *${user.nome} ${user.sobrenome}*`);                    
                        await salvarMensagem(numero,numero,user.usuario, CLIENTE.nome, msgTransferencia)
                        const novaQtdAtendimento = user.qtdAtendimento + 1;
                        await updateValue('Funcionarios', 'qtdAtendimento', novaQtdAtendimento, 'id', user.id, (err) => {
                            if (err) {
                                console.error('Erro ao atualizar qtdAtendimento:', err.message);
                            }
                        });
                    } else {
                        console.log('Erro: Nenhum usuário encontrado ou propriedade "usuario" não definida.');
                        // Aqui você pode lidar com a situação em que o usuário não foi encontrado ou a propriedade "usuario" não está definida
                    }
                });
            }
            break;
        case 'espera':
            await client.sendMessage(numero, "No momento, não temos nenhum funcionário disponível. Entraremos em contato assim que possível.");
            break;
        default:
            msg.reply('ops!! ocorreu um erro digite "sair"');
            break;
    }


}
});

client.initialize();


async function web_sendMsg(numero, msg) {
    await client.sendMessage(numero, msg);
}
async function filaEspera(){
    if(FILA.length > 0){
        FILA.forEach( async (cliente, index) =>{
            const query = "SELECT * FROM Funcionarios WHERE ativo = 1 AND setor = ? ORDER BY qtdAtendimento ASC";
            const array = [cliente.setor];
            await select_db(query, array, async (err, users) => {
                if (err) {
                    console.error('Erro ao buscar funcionários:', err.message);
                    return;
                }

                if (!users || users.length === 0){
                    return;
                }
                const user = users[0];
                if (user) {
                    // Aqui você pode prosseguir com o atendimento usando o funcionário encontrado
                    salvarMenu(cliente.numero, 'atendido', user.usuario, cliente.nome, cliente.setor);
                    const msgTransferencia = `**BOT:** O cliente: ${cliente.nome}\n Numero: ${cliente.numero}\n Foi Transferido para você!!`

                    // Obter a hora e minuto atual
                    const dataAtual = new Date();
                    const horaAtual = dataAtual.getHours().toString().padStart(2, '0');
                    const minutoAtual = dataAtual.getMinutes().toString().padStart(2, '0');
                    const data = {
                        usuario: user.usuario,
                        cliente: {
                            numero: cliente.numero,
                            nome: cliente.nome
                        },
                        data: `${horaAtual}:${minutoAtual}`,
                        msg: msgTransferencia
                    }
                    await wp_sendmsg(data);
                    await client.sendMessage(cliente.numero,`atendimento transferido para *${user.nome} ${user.sobrenome}*`);
                    await salvarMensagem(cliente.numero,cliente.numero,user.usuario, cliente.nome, msgTransferencia)
                    const novaQtdAtendimento = user.qtdAtendimento + 1;
                        await updateValue('Funcionarios', 'qtdAtendimento', novaQtdAtendimento, 'id', user.id, (err) => {
                            if (err) {
                                console.error('Erro ao atualizar qtdAtendimento:', err.message);
                            }
                    });
                    FILA.splice(index, 1);
                } else {
                    console.log('Erro: Nenhum usuário encontrado ou propriedade "usuario" não definida.');
                    // Aqui você pode lidar com a situação em que o usuário não foi encontrado ou a propriedade "usuario" não está definida
                }
        })
    });
}
}
module.exports = {
    web_sendMsg: web_sendMsg
}

