const sqlite3 = require('sqlite3').verbose();

 // Conectar-se ao banco de dados (se não existir, ele será criado automaticamente)
 const db = new sqlite3.Database('Sqlite.db', (err) => {
    
    db.run('DROP TABLE IF EXISTS Mensagens', (err) => {
        if (err) {
            console.error('Erro ao excluir a tabela de mensagens:', err.message);
            return;
        }
        console.log('Tabela de mensagens excluída com sucesso.');
    });

    // Verifica se a tabela de funcionários existe, se não, cria a tabela
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Funcionarios'", (err, row) => {
        if (err) {
            console.error('Erro ao verificar a existência da tabela de funcionários:', err.message);
            return;
        }

        // Se a tabela de funcionários não existir, crie-a
        if (!row) {
            db.run(`CREATE TABLE Funcionarios (
                id INTEGER PRIMARY KEY,
                nome TEXT,
                sobrenome TEXT,
                usuario TEXT UNIQUE,
                qtdAtendimento INTEGER,
                senha TEXT,
                setor TEXT,
                ativo INTEGER,
                admin INTEGER
            )`, (err) => {
                if (err) {
                    console.error('Erro ao criar a tabela de funcionários:', err.message);
                    return;
                }
            });
        }
    });

    // Verifica se a tabela de clientes existe, se não, cria a tabela
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Clientes'", (err, row) => {
        if (err) {
            console.error('Erro ao verificar a existência da tabela de clientes:', err.message);
            return;
        }

        // Se a tabela de clientes não existir, crie-a
        if (!row) {
            db.run(`CREATE TABLE Clientes (
                numero TEXT PRIMARY KEY,
                nome TEXT,
                sobrenome TEXT,
                cpf TEXT,
                dataNascimento TEXT,
                email TEXT,
                cep TEXT,
                endereço TEXT,
                pontoRef TEXT  
            )`, (err) => {
                if (err) {
                    console.error('Erro ao criar a tabela de clientes:', err.message);
                    return;
                }
            });
        }
    });

    // Verifica se a tabela de mensagens existe, se não, cria a tabela
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Mensagens'", (err, row) => {
        if (err) {
            console.error('Erro ao verificar a existência da tabela de mensagens:', err.message);
            return;
        }

        // Se a tabela de mensagens não existir, crie-a
        if (!row) {
            db.run(`CREATE TABLE Mensagens (
                id INTEGER PRIMARY KEY,
                numero TEXT,
                finalizado INTEGER,
                remetente TEXT,
                destinatario TEXT,
                nome TEXT,
                mensagem TEXT,
                imagem TEXT,
                video TEXT,
                dataHora TEXT
            )`, (err) => {
                if (err) {
                    console.error('Erro ao criar a tabela de mensagens:', err.message);
                    return;
                }
            });
        }
    });
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Avaliacoes'", (err, row) => {
        if (err) {
            console.error('Erro ao verificar a existência da tabela de mensagens:', err.message);
            return;
        }

        // Se a tabela de mensagens não existir, crie-a
        if (!row) {
            db.run(`CREATE TABLE Avaliacoes (
                id INTEGER PRIMARY KEY,
                cliente TEXT,
                atendente TEXT,
                nota INTEGER,
                ondeNosConheceu TEXT  
            )`, (err) => {
                if (err) {
                    console.error('Erro ao criar a tabela de mensagens:', err.message);
                    return;
                }
            });
        }
    });
    // Insira o funcionário administrador
    const table = 'Funcionarios';
    const columns = 'nome, sobrenome, usuario, qtdAtendimento, senha, setor, ativo, admin';
    const values = ['matheus', 'eduardo', 'matheus.admin', 0, 'admin3004', 'Adm', 1, 1];
    //insert_db(table, columns, values);
   
    console.log("Banco de dados ativado!")
});
db.close((err) => {
    if (err) {
        console.error('Erro ao fechar o banco de dados', err.message);
    }
});

// exemplo de uso, os values deve ser passados em uma array
// insert_Db('users',"nome,email,password",['matheus','matheus@gmail.com','12345678'])
function insert_db(table, coluns, values) {

    let insertQuery = `INSERT INTO ${table} (${coluns}) VALUES `

    const qtd = (coluns.match(/,/g) || []).length + 1;
    if (qtd == null) {
        return console.log("Erro! as colunas estão vazias")
    }

    const inter = Array.from({ length: qtd }, () => '?');
    const qtdInter = '(' + inter.join(', ') + ')';
    insertQuery = insertQuery + qtdInter;

    const db = new sqlite3.Database('Sqlite.db', (err) => {
        if (err) {
            return console.error('Erro ao conectar ao banco de dados:', err.message);
        }
        db.run(insertQuery, values, function (err) {
            if (err) {
                return console.error('Erro ao inserir dados:', err.message);
            }
        });
    });
    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar o banco de dados', err.message);
        }
    });

}

async function select_db(query, array, callback) {
    const db = new sqlite3.Database('Sqlite.db', (err) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err.message);
            callback(err, null); // Chama o callback com erro
            return;
        }

        db.all(query, array, (err, rows) => {
            if (err) {
                console.error('Erro ao executar consulta:', err.message);
                callback(err, null); // Chama o callback com erro
                return;
            }

            if (!rows || rows.length === 0) {
                callback(null, null); // Chama o callback com null para indicar que nenhum usuário foi encontrado
            } else {
                callback(null, rows); // Chama o callback com o primeiro usuário encontrado
            }
        });
    });
    db.close((err) => {
        if (err) {
            console.error(err.message);
            return null
        }
    });
}

function select_user(array, callback) {
    const db = new sqlite3.Database('Sqlite.db', (err) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err.message);
            callback(err, null); // Chama o callback com erro
            return;
        }
        const query = 'SELECT * FROM Funcionarios WHERE usuario = ? AND senha = ?';
        db.all(query, array, (err, rows) => {
            if (err) {
                console.error('Erro ao executar consulta:', err.message);
                callback(err, null); // Chama o callback com erro
                return;
            }

            if (!rows || rows.length === 0) {
                callback(null, null); // Chama o callback com null para indicar que nenhum usuário foi encontrado
            } else {
                callback(null, rows[0]); // Chama o callback com o primeiro usuário encontrado
            }
            // Fecha o banco de dados após a conclusão da consulta
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                    return null;
                }
            });
        });
    });
}
async function updateValue(table, column, newValue, conditionColumn, conditionValue, callback) {
    const db = new sqlite3.Database('Sqlite.db', (err) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err.message);
            callback(err);
            return;
        }

        // Monta a consulta SQL de atualização
        const query = `UPDATE ${table} SET ${column} = ? WHERE ${conditionColumn} = ?`;

        // Executa a consulta com os valores fornecidos
        db.run(query, [newValue, conditionValue], function (err) {
            if (err) {
                console.error('Erro ao atualizar valor:', err.message);
                callback(err);
                return;
            }

            // Verifica se algum registro foi atualizado
            if (this.changes > 0) {
                callback(null);
            } else {
                console.log(`Nenhum registro encontrado em ${table} para atualização`);
                callback(new Error(`Nenhum registro encontrado em ${table} para atualização`));
            }
        });
    });

    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar o banco de dados:', err.message);
        }
    });
}
async function salvarMensagem(numero , remetente, destinatario, nome, mensagem, imagem, video) {
    const db = new sqlite3.Database('Sqlite.db', (err) => {
        const query = "INSERT INTO Mensagens (numero, remetente, destinatario, nome, mensagem, finalizado, dataHora, imagem, video) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)";
        const dataAtual = new Date();
        const horaAtual = dataAtual.getHours().toString().padStart(2, '0');
        const minutoAtual = dataAtual.getMinutes().toString().padStart(2, '0');
        const values = [numero, remetente, destinatario, nome, mensagem, 0, `${horaAtual}:${minutoAtual}`,imagem, video];
        db.run(query, values, function (err) {
            if (err) {
                console.error('Erro ao inserir mensagem:', err.message);
            }
        });
    })

}
async function updadeSqlite(query, array) {
    const db = new sqlite3.Database('Sqlite.db', (err) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err.message);
            return;
        }
        // Executa a consulta com o número fornecido
        db.run(query, array, function (err) {
            if (err) {
                console.error(err.message);
                return;
            }
            // Verifica se algum registro foi atualizado
            if (this.changes > 0) {
                return;
            }
        });
    });
    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar o banco de dados:', err.message);
        }
    });
}
async function buscarMensagens(usuario, callback) {
    const db = new sqlite3.Database('Sqlite.db', (err) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err.message);
            callback(err, null); // Chama o callback com erro
            return;
        }

        const query = ` SELECT * FROM Mensagens WHERE 
                        (destinatario = ? AND finalizado = 0) OR 
                        (remetente = ? AND finalizado = 0) 
                        ORDER BY dataHora`;

        const values = [usuario, usuario];

        db.all(query, values, function (err, rows) {
            if (err) {
                console.error('Erro ao buscar mensagens:', err.message);
                callback(err, null); // Chama o callback com erro
                return;
            }

            // Chama o callback com os resultados da consulta
            callback(null, rows);
        });
    });
}
module.exports = {
    updateValue: updateValue,
    select_db: select_db,
    insert_db: insert_db,
    select_user: select_user,
    buscarMensagens: buscarMensagens,
    salvarMensagem: salvarMensagem,
    updadeSqlite: updadeSqlite
};

