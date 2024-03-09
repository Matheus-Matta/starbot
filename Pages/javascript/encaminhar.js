
const btn_enviar = document.querySelector(".box_encaminhar button")
btn_enviar.addEventListener("click", ()=>{
    const inputMarcado = document.querySelector('.box_encaminhar input[name="usuario"]:checked');
    if (inputMarcado) {
        const enviado = inputMarcado.value;
        const chatbox = document.querySelector(".chatOn")
        const html = chatbox.innerHTML
        const numero = document.querySelector(".chatOn").getAttribute("data-numero")
        const usuario = document.querySelector(".username").innerHTML.replace("User:","").replace("<br>", "")
        const nome = document.querySelector(".header-cliente .imgText h4").innerHTML
        const setor = inputMarcado.getAttribute("data-setor")
        const nomeUsuario =  inputMarcado.getAttribute("data-nome")
        const oldUsuario = document.querySelector(".usuario_wp").getAttribute('data-usuario')
        const data = {
            encaminhado: usuario,
            oldUsuario: oldUsuario,
            usuario: enviado,
            nome: nome,
            nomeUsuario: nomeUsuario,
            numero: numero,
            setor: setor,
            chatbox: html
        }
        fetch("/encaminhar",{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response =>{
            if(response.ok){
                const chatBar = document.querySelector(`.chatbar[data-numero="${numero}"]`);
                const box_encaminhar = document.querySelector(".box_encaminhar")
                const conteiner_modals = document.querySelector(".conteiner_modals")
                chatbox.remove();
                chatBar.remove();
                box_encaminhar.style.display = 'none'
                conteiner_modals.style.display = 'none'
            }
        })   
    }
})

export async function encaminhar(){
    document.querySelectorAll(".box_encaminhar label").forEach(item =>{
        item.remove();
    })
    await fetch("/users",{
        method: "GET"
    }).then(async (response) =>{
        if(response.ok){
            const users = await response.json()
            const usuario = document.querySelector(".usuario_wp").getAttribute('data-usuario')
            users.forEach((user,index) =>{
                if(user.usuario != usuario){
                    const html = `
                    <label for="encaminhar_user${index+1}">
                                <div>
                                    <input id="encaminhar_user${index+1}" type="radio" name="usuario" value="${user.usuario}" data-setor="${user.setor}" data-nome="${user.nome} ${user.sobrenome}">
                                    <h3 class="nome_user">${user.nome} ${user.sobrenome}</h3>
                                </div>
                                <div>
                                    <h4>Setor:</h4>
                                    <p class="setor_user">${user.setor}</p>
                                </div>
                        </label>
                    `
                    btn_enviar.insertAdjacentHTML('beforebegin', html);
                }
            })
        }
    }).catch(error=>{
        console.log(error)
    })
}