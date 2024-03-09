// app.js

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

const { select_db, updadeSqlite, select_user, updateValue,buscarMensagens,salvarMensagem } = require("../Sqlite3/configSqlite.js")
const { apagarMenu, salvarMenu } = require("../Starbot/file/file.js");
const { wp_sendmsg } = require("../websocket/websocket.js")

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: '@maxxxmoveis5353!',
    resave: false,
    saveUninitialized: true
}));


const STATIC = '../pages'
app.use(express.static(path.join(__dirname, STATIC)));


module.exports = {
    app: function (client,mensagens,filaEspera){
        // Rota para carregar a página
        app.get('/', async (req, res) => {
            // Use o método sendFile() para enviar a página HTML

            const user = req.session.usuario || null
            if (user) {
                if(user.admin){
                    res.redirect('/dashboard')
                } else {
                    res.redirect('/atendimento')
                }
            } else {
                // Se o usuário não estiver autenticado, redirecione-o para a página de login
                res.sendFile(path.join(__dirname, STATIC, './login.html'));
            }
        });
        app.get('/dashboard', (req, res) => {
            const user = req.session.usuario
            const admin = user.admin
            if(admin){
                //const array = ['matheus','eduardo','matheus.admin','admin300401','admin',1,1]
                // const query = `INSERT INTO Funcionarios (nome, sobrenome, usuario, senha, setor, ativo, admin) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                // updadeSqlite(query,array)
                res.sendFile(path.join(__dirname, STATIC, './dashboard.html'));
            } else {
                res.redirect('/')
            }
            
        });
        app.post("/cadastro",async (req,res)=>{
            const user = req.session.usuario
            const admin = user.admin
            if(admin){
                const {nome, sobrenome, usuario, setor, senha} = req.body
                const array = [nome,sobrenome,usuario,0,senha,setor,0,0]
                const query = `INSERT INTO Funcionarios (nome, sobrenome, usuario, qtdAtendimento, senha, setor, ativo, admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                updadeSqlite(query,array)
            }
            
        })
        app.post('/login', (req, res) => {
            const { usuario, senha } = req.body;
            // Executar a consulta no banco de dados    
            select_user([usuario, senha], (err, user) => {
                if (err) {
                    return res.status(500).json({ login: false, message: 'Erro no servidor.' });
                }
                if (user) {
                    req.session.usuario = {
                        usuario: usuario,
                        nome: user.nome,
                        sobrenome: user.sobrenome,
                        setor: user.setor,
                        ativo: user.ativo,
                        qtd: user.qtdAtendimento,
                        admin: user.admin
                    };
                    return res.status(200).json({ login: true , admin: user.admin});
                } else {
                    return res.status(401).json({ login: false, message: 'Usuário ou senha inválidos.' });
                }
            });
        });
        app.post('/logout', (req, res) => {
            // Destrua a sessão do usuário
            const user = req.session.usuario.usuario
            req.session.destroy(err => {
                if (err) {
                    console.error('Erro ao fazer logout:', err);
                    res.status(500).json({ message: 'Erro ao fazer logout.' });
                } else {
                    updateValue('Funcionarios', 'ativo', 0, 'usuario', user, (err) => {
                        if (err) {
                            console.error('Erro ao atualizar valor:', err.message);
                            res.status(401).json({ logout: false })
                        }
                        res.status(200).json({ logout: true })
                    });
                }
            });
        });


        /////  whats rotas   ////// 

        app.get('/atendimento', (req, res) => {
            // Verifica se o usuário está autenticado
            const user = req.session.usuario || null
            if (user) {
                if (user.admin){
                    res.redirect('/dashboard');
                } else {
                    res.sendFile(path.join(__dirname, STATIC, './whats.html'));
                }
            } else {
                // Se o usuário não estiver autenticado, redirecione-o para a página de login
                res.redirect('/');
            }
        });
        app.get('/user-data', (req, res) => {
            // Verificar se o usuário está autenticado
            if (req.session.usuario) {
                // Se estiver autenticado, envie os dados do usuário
                const username = req.session.usuario.usuario;
                const query = 'SELECT id, nome, sobrenome, usuario, setor, ativo FROM Funcionarios WHERE usuario = ?';
                const array = [username];
        
                select_db(query, array, (err, user) => {
                    if (err) {
                        console.error('Erro ao obter usuário:', err.message);
                        res.status(500).json({ error: 'Erro ao obter usuário' });
                        return;
                    }
                    if (user) {
                        res.status(200).json(user[0]);
                    } else {
                        console.log('Nenhum usuário encontrado com o nome de usuário:', username);
                        res.status(404).json({ error: 'Usuário não encontrado' });
                    }
                });
            } else {
                // Se não estiver autenticado, retorne um erro ou um objeto vazio, conforme apropriado
                res.status(401).json({ notSession: true });
            }
        });
        app.post('/inServico', async (req, res) => {
            if (req.session.usuario) {
                await updateValue('Funcionarios', 'ativo', req.body.ativo, 'usuario', req.session.usuario.usuario, (err) => {
                    if (err) {
                        console.error('Erro ao atualizar valor:', err.message);
                        res.status(401).json({ alterado: false })
                    }
                    res.status(200).json({ alterado: true })
                    filaEspera();
                });
            } else {
                res.status(401).json({ alterado: false })
            }
        })

        app.post('/obterMensagem', (req, res) => {
            if (req.session.usuario) {
                const user = req.session.usuario.usuario;
                buscarMensagens(user, (err, data) => {
                    if (err) {
                        console.error('Erro ao buscar mensagens:', err.message);
                        res.status(500).json({ error: 'Erro ao buscar mensagens' });
                        return;
                    }
                    res.status(200).json(data);
                });
            } else {
                res.status(401).json({ error: 'Usuário não autenticado' });
            }
        });

        app.post("/finalizar", async (req, res) =>{
            const user = req.session.usuario
            if (user){
                const { numero } = req.body
                salvarMenu(numero, 'avaliar')
                await client.sendMessage(numero, mensagens.finalizado);
                const query = `UPDATE Mensagens SET finalizado = 1 WHERE remetente = ? OR destinatario = ?`;
                const array = [numero, numero]
                const novaQtd = user.qtd - 1;
                updadeSqlite(query,array)
                await updateValue('Funcionarios', 'qtdAtendimento',novaQtd, 'usuario', user.usuario, (err) => {
                    if (err) {
                        console.error('Erro ao atualizar qtdAtendimento:', err.message);
                    }
                });
                res.status(200).json({ mensagem: 'cliente finalizado' });
            } else {
                res.status(401).json({ error: 'Usuário não autenticado' });
            }
        })

        app.post("/encaminhar", async (req, res)=>{
            const data = req.body
            wp_sendmsg(data)
            salvarMenu(data.numero,'atendido',data.usuario,data.nome,data.setor)      
            const query = `UPDATE Mensagens  SET destinatario = ? WHERE destinatario = ? AND remetente = ? AND finalizado = 0;`
            const array = [data.usuario,data.oldUsuario,data.numero];
            updadeSqlite(query,array)   
            const query2 = `UPDATE Mensagens  SET remetente = ? WHERE remetente = ? AND destinatario = ? AND finalizado = 0;`
            const array2 = [data.usuario,data.oldUsuario,data.numero];
            updadeSqlite(query2,array2)   
            const mensagem = `**BOT**: ${data.nome} foi transferido para você por ${data.encaminhado}`
            salvarMensagem(data.numero , data.numero, data.usuario, data.nome, mensagem)
            const mensagem2 = `Você foi transferido para ${data.nomeUsuario} do SETOR: ${data.setor}`
            await client.sendMessage(data.numero, mensagem2);
            res.status(200).json({ok:'ok'})
        })

        app.get("/users",async (req,res)=>{
            // Query para selecionar funcionários que não são admin e estão ativos
            const query = `SELECT id, nome, sobrenome, usuario, setor, ativo, admin FROM Funcionarios WHERE admin = 0 AND ativo = 1 ORDER BY setor`;
            // Chamar a função select_db para executar a query
           await select_db(query, [], async (err, rows) => {
                if (err) {
                    console.error('Erro ao executar consulta:', err.message);
                    // Tratar o erro aqui, se necessário
                    return;
                }
                res.status(200).json(rows)
            });
            
        })
        // Start server
        
        app.listen(PORT, () => {
            console.log(`Server running at http://10.0.0.93:${PORT}/`);
        });

    }
}

