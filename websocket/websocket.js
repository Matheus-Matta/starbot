const WebSocket = require('ws');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const wss = new WebSocket.Server({ host: '10.0.0.93', port: 8080 });
const { salvarMensagem } = require("../Sqlite3/configSqlite.js")
async function wp_sendmsg(mensagem) {
    const mensagemJSON = JSON.stringify(mensagem);
    wss.clients.forEach(cliente => {
        if (cliente.readyState === WebSocket.OPEN) {
            cliente.send(mensagemJSON);
        }
    });
}

module.exports = {
    iniciarSocket: function (client,filaEspera, MessageMedia) {
        wss.on('connection', function connection(ws, session) {
            filaEspera();
            ws.on('message', async function incoming(message) {
                const dados = JSON.parse(message);

                if(dados.imagem){
                    const imagens = dados.imagem
                    imagens.forEach( async (img,i)=>{
                        setTimeout( async () => {
                            await salva_enviar_IMG(img)
                        }, 1000);
                        
                        async function salva_enviar_IMG(img){
                            let mgsImg = null;
                            if(i == 0){
                                mgsImg = dados.msg
                            }    
                            const pathPasta = path.join(`./Pages/imagens/${dados.usuario}`);
                            if (!fs.existsSync(pathPasta)) {
                                fs.mkdirSync(pathPasta);
                            }
                            const timestamp = Date.now();
                            const filepath = path.join(pathPasta,`/${dados.cliente}_${timestamp}.jpg`)
                            const response = await axios.get(img, { responseType: 'stream' });
                            const writer = fs.createWriteStream(filepath);
                            response.data.pipe(writer);

                            writer.on('finish', async () => {
                                const dir = `imagens/${dados.usuario}/${dados.cliente}_${timestamp}.jpg`
                                await salvarMensagem(dados.cliente, dados.usuario, dados.cliente, dados.nome, dados.msg, dir,dados.video)
                                const media = MessageMedia.fromFilePath(filepath);
                                await client.sendMessage(dados.cliente,mgsImg, { media: media });
                            });
                            writer.on('error', (err) => {
                                console.error('Erro ao salvar a imagem:', err);
                            });
                        } 
                    })
                } else {
                    await client.sendMessage(dados.cliente, dados.msg);
                    await salvarMensagem(dados.cliente, dados.usuario, dados.cliente, dados.nome, dados.msg,dados.imagem,dados.video)
                }
              
            });

            // Fechar a conexão quando o cliente desconectar
            ws.on('close', function close() {
            });
        });
    },
    wp_sendmsg: wp_sendmsg
} 