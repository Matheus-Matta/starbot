import { carregarMsg  } from "./carregarMsg.js";
import { encaminhar } from "./encaminhar.js";

const logoutButton = document.querySelector('#logoutButton');
logoutButton.addEventListener('click', function () {
    fetch('/logout', {
        method: 'POST',
    })
        .then(response => {
            if (response.ok) {
                // Redireciona para a página de login após o logout bem-sucedido
                window.location.href = '/';
            } else {
                throw new Error('Erro ao fazer logout.');
            }
        })
        .catch(error => {
            console.error('Erro:', error.message);
        });
});

// Suponha que você tenha uma função para carregar as informações do usuário

fetch('/user-data', {
    method: 'GET',
})
    .then(response => {
        if (response) {
            return response.json();
        }
    })
    .then(async (data) => {
        if (data.notSession) {
            fetch('/logout', {
                method: 'POST',
            })
                .then(response => {
                    if (response.ok) {
                        window.location.href = '/';
                    }
                })
                .catch(error => {
                    console.error('Erro:', error.message);
                });
        } else {
            await carregarDados(data);
        }
    })
    .catch(error => {
        console.error('Erro:', error.message);
    });


// Chame a função para carregar os dados do usuário quando necessário
async function carregarDados(data) {
    const perfil = document.querySelector(".header .username")
    const texto = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    ${data.nome} ${data.sobrenome}<br>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-headset"><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/></svg>
                    ${data.setor}`
    perfil.innerHTML = texto
    const online = document.querySelector('.btnOn')
    if(data.ativo == 0) {
        online.style.backgroundColor = 'tomato'
        online.innerHTML = "Offline"
        online.setAttribute("data-ativo",0)
    }
    const user = document.querySelector(".usuario_wp")
    user.setAttribute("data-usuario", data.usuario)
}


const btnOn = document.querySelector('.btnOn')
btnOn.addEventListener('click', () => {
    
    let num = +btnOn.getAttribute('data-ativo')
    if (num == 1) {
        num = 0;
        btnOn.setAttribute("data-ativo", 0)
    } else {
        num = 1;
        btnOn.setAttribute("data-ativo", 1)
    }
    const ativo = {
        ativo: num
    }
    fetch('/inServico', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Define o tipo de conteúdo como JSON
        },
        body: JSON.stringify(ativo)
    })
        .then(response => {
            if (response.ok) {
                let ativo = +btnOn.getAttribute('data-ativo')
                if (ativo == 1) {
                    btnOn.style.backgroundColor = '#00d38d'
                    btnOn.innerHTML = 'Online'
                } else {
                    btnOn.style.backgroundColor = 'tomato'
                    btnOn.innerHTML = "Offline"
                }
            }
        })
        .catch(error => {
            console.log('catch')
            console.error('Erro:', error.message);
        });
})
fetch('/obterMensagem', {
    method: 'POST',
})
    .then(response => {
        if (response) {
            return response.json();
        }
    })
    .then(async (data) => {
        await carregarMsg(data)
    })
    .catch(error => {
        console.error('Erro:', error.message);
    });

const menu_cliente = document.querySelector(".mais-op")
menu_cliente.addEventListener("click", ()=>{
        const opcoes = document.querySelector(".btn-hidden")
        if(!opcoes.classList.contains('btnMaisAtivo')){
            menu_cliente.classList.add("efeito-maisOp")
            opcoes.style.display = "block"
            opcoes.classList.add("btnMaisAtivo")
            menu_cliente.innerHTML = '<path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>'
        } else {
            menu_cliente.classList.remove("efeito-maisOp")
            opcoes.style.display = "none"
            opcoes.classList.remove("btnMaisAtivo")
            menu_cliente.innerHTML = '<path d="M120-240v-80h520v80H120Zm664-40L584-480l200-200 56 56-144 144 144 144-56 56ZM120-440v-80h400v80H120Zm0-200v-80h520v80H120Z"/>'
        }
})

const btnFinalizar = document.querySelector(".btn-finalizar")
const btnEncaminhar = document.querySelector(".btn-encaminhar")
const box = document.querySelector(".conteiner_modals")
const modal_encaminhar = document.querySelector(".conteiner_modals .box_encaminhar")
const modal_confirm = document.querySelector(".box_btnConfirma")

btnFinalizar.addEventListener("click",()=>{
    box.style.display = 'flex'
    modal_confirm.style.display = 'block'
})
btnEncaminhar.addEventListener("click", async ()=>{
    box.style.display = 'flex'
    modal_encaminhar.style.display = 'block'
    await encaminhar();
})
let espera = 1
const btn_confirm = document.querySelector(".box_btnConfirma div .btn_confirm")
const btn_cancel = document.querySelector(".box_btnConfirma div .btn_cancel")
btn_confirm.addEventListener("click", async ()=>{
    if(espera){
        espera = 0;
        await finalizarConversa()
        espera = 1;
        box.style.display = 'none'
        modal_confirm.style.display = 'none'

    }
})
btn_cancel.addEventListener('click',()=>{
    box.style.display = 'none'
    modal_confirm.style.display = 'none'
    return 0;
})

box.addEventListener("click",(event)=>{
    const target = event.target
    if(target.classList.contains('conteiner_modals')){
        box.style.display = 'none'
        modal_confirm.style.display = 'none'
        modal_encaminhar.style.display = 'none'
        return 0;
    } 
})

async function finalizarConversa(){
    const numero = document.querySelector(".chatOn").getAttribute("data-numero")
        const data = {
            numero: numero
        }
        fetch('/finalizar',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Define o tipo de conteúdo como JSON
            },
            body: JSON.stringify(data)
        }).then(response =>{
            if(response.ok){
            const chatbox = document.querySelector(`.chatbox[data-numero="${numero}"]`)
            const chatbar = document.querySelector(`.chatbar[data-numero="${numero}"]`)

            const sideNone = document.querySelector(".sideNone")
            const sideflex = document.querySelector(".sideFlex")
            sideNone.classList.remove("sideNone")
            sideflex.classList.remove('sideFlex')
            sideNone.classList.add("sideFlex")
            sideflex.classList.add('sideNone')

            chatbar.remove();
            chatbox.remove();
            }
        }).catch(error => {
            console.error('Erro:', error.message);
        });
}

