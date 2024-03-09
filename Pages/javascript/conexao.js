import { imgRedimensionar } from "./utilsWhats.js";
import { enviarIMG  } from "./utilsWhats.js";
const socket = new WebSocket('ws://10.0.0.93:8080');

socket.onopen = function () {
  console.log('Conexão estabelecida.');
};


socket.onmessage = function (event) {
  const msg = JSON.parse(event.data);

    const usuario = document.querySelector(".usuario_wp").getAttribute("data-usuario");
    if (msg.usuario === usuario) {

      const header = document.querySelector('.header-cliente');
      const chatlist = document.querySelector('.chatlist')

      if(!msg.encaminhado){

        // messagem recebida normalmente

        let chatbox = document.querySelector(`.chatbox[data-numero="${msg.cliente.numero}"]`);
        if (!chatbox) {
          const box = `<div class="chatbox" data-numero='${msg.cliente.numero}'></div>`;
          header.insertAdjacentHTML('afterend', box);
          chatbox = document.querySelector(`.chatbox[data-numero="${msg.cliente.numero}"]`);
        }


        if(msg.image){
          const mensagem = `<div class="message friend_msg"><p><img class="chatbox_img" src="${msg.image}" alt=""><span>${msg.msg}</span><span>${msg.data}</span></p></div>`;
          chatbox.insertAdjacentHTML('beforeend', mensagem);
          const imgElement = chatbox.querySelector(`.chatbox_img[src="${msg.image}"]`);
          imgRedimensionar(imgElement);
        } else if(msg.video){
          const mensagem = `<div class="message friend_msg"><p><video src="${msg.video}" controls></video><span>${msg.msg}</span><span>${msg.data}</span></p></div>`;
          chatbox.insertAdjacentHTML('beforeend', mensagem);
        } else {
          const mensagem = `<div class="message friend_msg"><p><span>${msg.msg}</span><span>${msg.data}</span></p></div>`;
          chatbox.insertAdjacentHTML('beforeend', mensagem);
        }



        if (!chatbox.classList.contains('chatOn')) {
          chatbox.classList.add("chatOff")
        }

        let chatBar = document.querySelector(`.chatbar[data-numero="${msg.cliente.numero}"]`);
        if (!chatBar) {
          const html = `
                <div class="block active chatbar" data-numero="${msg.cliente.numero}">
                    <div class="box-iconMsg">
                        <span></span>
                        <img class="icon-msg" src="./uploads/chat_FILL0_wght400_GRAD0_opsz24.svg" alt="">
                    </div>  
                        <div class="details">
                            <div class="listHead">
                                <h4 class="nomeCliente">${msg.cliente.nome}</h4>
                                <p class="time">${msg.data}</p>
                            </div>
                            <div class="message_p">
                                <p>${msg.msg}</p>
                            </div>
                        </div>
                </div>
          `
          chatlist.insertAdjacentHTML('beforeend', html)
          chatBar = document.querySelector(`.chatbar[data-numero="${msg.cliente.numero}"]`);
          activeChat(chatBar);
        } else {
          let envio = 'Imagem Recebida <svg class="icon_chatbar_msg-img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-down"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19 3 3v-5.5"/><path d="m17 22 3-3"/><circle cx="9" cy="9" r="2"/></svg>'
          const ultimaMsg = document.querySelector(`.chatbar[data-numero="${msg.cliente.numero}"] .message_p p`)
          const ultimaData = document.querySelector(`.chatbar[data-numero="${msg.cliente.numero}"] .time`)
          ultimaMsg.innerHTML = msg.msg || envio
          ultimaData.innerHTML = msg.data
        }

      } else {
        // messagem recebida por encaminhamento 

        const chatboxHTML = `<div class="chatbox chatOff" data-numero='${msg.numero}'></div>`;
        header.insertAdjacentHTML('afterend', chatboxHTML);
        const dataAtual = new Date();
        const horaAtual = dataAtual.getHours().toString().padStart(2, '0');
        const minutoAtual = dataAtual.getMinutes().toString().padStart(2, '0');
        const chatbox = document.querySelector(`.chatbox[data-numero="${msg.numero}"]`);
        chatbox.innerHTML = msg.chatbox
        const mensagem = `<div class="message friend_msg"><p>**BOT**: ${msg.nome} foi transferido para você por ${msg.encaminhado}<br><span>${horaAtual}:${minutoAtual}</span></p></div>`;
        chatbox.insertAdjacentHTML('beforeend', mensagem);

        const html = `
        <div class="block active chatbar" data-numero="${msg.numero}">
            <div class="box-iconMsg">
                <img class="icon-msg" src="./uploads/chat_FILL0_wght400_GRAD0_opsz24.svg" alt="">
            </div>  
                <div class="details">
                    <div class="listHead">
                        <h4 class="nomeCliente">${msg.nome}</h4>
                        <p class="time">${horaAtual}:${minutoAtual}</p>
                    </div>
                    <div class="message_p">
                        <p>**BOT**: ${msg.nome} foi transferido para você por ${msg.encaminhado}</p>
                    </div>
                </div>
        </div>
      `
      chatlist.insertAdjacentHTML('beforeend', html)
      const chatBar = document.querySelector(`.chatbar[data-numero="${msg.numero}"]`);
      activeChat(chatBar);
      }
    }
};

socket.onclose = function () {
  console.log('Conexão fechada.');
};

const enviar = document.querySelector(".btn_enviar-msg")
const inputText = document.querySelector(".text_input")

enviar.addEventListener("click", enviarMsg)
inputText.addEventListener('focus', () => {
  // Adiciona o ouvinte de evento de tecla Enter quando o inputText recebe foco
  window.addEventListener("keydown", handleEnterKeyPress);
});

inputText.addEventListener('blur', () => {
  // Remove o ouvinte de evento de tecla Enter quando o inputText perde foco
  window.removeEventListener("keydown", handleEnterKeyPress);
});

function handleEnterKeyPress(event) {
  if (event.key === 'Enter') {
    enviarMsg();
  }
}

async  function enviarMsg() {
  const input = document.querySelector(".text_input")
  const msg = input.value
  const usuario = document.querySelector(".usuario_wp").getAttribute("data-usuario");
  const cliente = document.querySelector(".chatOn").getAttribute('data-numero');
  const nome = document.querySelector(`.chatbar[data-numero="${cliente}"] .nomeCliente`).innerHTML;
  const imagens = await enviarIMG();
  const test = /^\s*$/;
 
  if (!test.test(msg) || imagens) {
    const data = {
      usuario: usuario,
      cliente: cliente,
      nome: nome,
      msg: msg,
      imagem: imagens,
      video: null
    }
    const dataAtual = new Date();
    const horaAtual = dataAtual.getHours().toString().padStart(2, '0');
    const minutoAtual = dataAtual.getMinutes().toString().padStart(2, '0');
    let chatbox = document.querySelector(`.chatbox[data-numero="${cliente}"]`);
    if(imagens){
      imagens.forEach(url =>{
        const mensagem = `<div class="message my_msg"><p><img class="chatbox_img" src="${url}" alt=""><span>${msg}</span><span>${horaAtual}:${minutoAtual}</span></p></div>`;
        chatbox.insertAdjacentHTML('beforeend', mensagem);
        const newimg = chatbox.querySelector(`.chatbox_img[src="${url}"]`);
        if(newimg){
            imgRedimensionar(newimg)
        }
      })
    } else{
        const mensagem = `<div class="message my_msg"><p>${msg}<br><span>${horaAtual}:${minutoAtual}</span></p></div>`;
        chatbox.insertAdjacentHTML('beforeend', mensagem);
    }
    // Envia a mensagem para o servidor
    const mensagemJSON = JSON.stringify(data);
    socket.send(mensagemJSON);
    input.value = ''
  } else {
    input.classList.add("input_semValor")
    setTimeout(() => {
      input.classList.remove("input_semValor")
    }, 3000)
  }
}





export function activeChat(chatBar) {
  chatBar.addEventListener("click", () => {
    const numero = chatBar.getAttribute('data-numero')

    const sideNone = document.querySelector(".sideNone")
    const sideflex = document.querySelector(".sideFlex")
    sideNone.classList.remove("sideNone")
    sideflex.classList.remove('sideFlex')
    sideNone.classList.add("sideFlex")
    sideflex.classList.add('sideNone')

    const nomeHeader = document.querySelector(".imgText h4")
    const nome = chatBar.querySelector('.nomeCliente').innerHTML
    nomeHeader.innerHTML = nome

    const chats = document.querySelectorAll(".chatbox")
    chats.forEach(chat => {
      const chat_numero = chat.getAttribute('data-numero')
      if (chat_numero == numero) {
        chat.classList.remove("chatOff")
        chat.classList.add("chatOn");
      } else {
        chat.classList.remove("chatOn")
        chat.classList.add("chatOff");
      }
    })
    const barOn = document.querySelectorAll(".barOn");
    barOn.forEach(bar => {
      bar.classList.remove("barOn")
    })
    if(!chatBar.classList.contains("barOn")){
       chatBar.classList.add("barOn")
    }

  }
  )
}
