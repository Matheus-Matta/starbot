import { activeChat } from "./conexao.js"
import { imgRedimensionar } from "./utilsWhats.js";
export async function carregarMsg(data){
    data.forEach(dt => {
            
            const usuario = document.querySelector(".usuario_wp").getAttribute("data-usuario");
            let chatbox = document.querySelector(`.chatbox[data-numero="${dt.numero}"]`);
            if (!chatbox) {
                const box = `<div class="chatbox" data-numero='${dt.numero}'></div>`;
                const header = document.querySelector('.header-cliente');
                header.insertAdjacentHTML('afterend', box);
                chatbox = document.querySelector(`.chatbox[data-numero="${dt.numero}"]`);
            }

            let mensagem
            if(dt.imagem){
                    mensagem = `<div class="message friend_msg"><p><img class="chatbox_img" src="${dt.imagem}" alt=""><span>${dt.mensagem}</span><span>${dt.dataHora}</span></p></div>`;
                if(dt.numero != dt.remetente){
                    mensagem = `<div class="message my_msg"><p><img class="chatbox_img" src="${dt.imagem}" alt=""><span>${dt.mensagem}</span><span>${dt.dataHora}</span></p></div>`;
                }
            } else if(dt.video){
                    mensagem = `<div class="message friend_msg"><p><video src="${dt.video}" controls></video><span>${dt.mensagem}</span><span>${dt.dataHora}</span></p></div>`;
                if(dt.numero != dt.remetente){
                    mensagem = `<div class="message my_msg"><p><video src="${dt.video}" controls></video><span>${dt.mensagem}</span><span>${dt.dataHora}</span></p></div>`;
                }
            } else {
                    mensagem = `<div class="message friend_msg"><p>${dt.mensagem}<br><span>${dt.dataHora}</span></p></div>`;;
                if(dt.numero != dt.remetente){
                    mensagem = `<div class="message my_msg"><p>${dt.mensagem}<br><span>${dt.dataHora}</span></p></div>`;
                }
            }
           
            chatbox.insertAdjacentHTML('beforeend', mensagem);

            const newimg = chatbox.querySelector(`.chatbox_img[src="${dt.imagem}"]`);
            if(newimg){
                imgRedimensionar(newimg)
            }

            if (!chatbox.classList.contains('chatOn')) {
            chatbox.classList.add("chatOff")
            }

            let chatBar = document.querySelector(`.chatbar[data-numero="${dt.numero}"]`);
            const chatlist = document.querySelector('.chatlist')
            if (!chatBar) {
            const html = `
                    <div class="block active chatbar" data-numero="${dt.numero}">
                        <div class="box-iconMsg">
                            <img class="icon-msg" src="./uploads/chat_FILL0_wght400_GRAD0_opsz24.svg" alt="">
                        </div>
                            <div class="details">
                                <div class="listHead">
                                    <h4 class="nomeCliente">${dt.nome}</h4>
                                    <p class="time">${dt.dataHora}</p>
                                </div>
                                <div class="message_p">
                                    <p>${dt.mensagem}</p>
                                </div>
                            </div>
                    </div>
            `
            chatlist.insertAdjacentHTML('beforeend', html)
            chatBar = document.querySelector(`.chatbar[data-numero="${dt.numero}"]`);
            activeChat(chatBar);
            } else {
                let envio = 'Imagem Recebida <svg class="icon_chatbar_msg-img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-down"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/><path d="m14 19 3 3v-5.5"/><path d="m17 22 3-3"/><circle cx="9" cy="9" r="2"/></svg>'
                const ultimaMsg = document.querySelector(`.chatbar[data-numero="${dt.numero}"] .message_p p`)
                const ultimaData = document.querySelector(`.chatbar[data-numero="${dt.numero}"] .time`)
                if(dt.numero == dt.remetente){
                    ultimaMsg.innerHTML = dt.mensagem || envio
                }
                ultimaData.innerHTML = dt.dataHora
            }
        
    });
}