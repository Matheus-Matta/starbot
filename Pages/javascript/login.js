const form = document.querySelector("#formData_login");

form.addEventListener('submit', function(event) {
    // Evita o envio do formulário padrão
    event.preventDefault();

    // Obtém os valores dos campos do formulário
    const usuario = form.querySelector('#login_username').value;
    const senha = form.querySelector('#login_password').value;

    // Cria um objeto com os valores do formulário
    const formData = {
        usuario: usuario,
        senha: senha
    };

    // Envia a solicitação AJAX
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Define o tipo de conteúdo como JSON
        },
        body: JSON.stringify(formData) // Converte o objeto em JSON
    })
    .then(response => {
        if (response) {
            return response.json(); // Converte os dados da resposta em JSON
        }
    })
    .then(data => {
        if(data.login && data.admin){
            window.location.href = '/dashboard';
        }else if ( data.login ) {
            window.location.href = '/atendimento';
        } else {
            const area = document.querySelector(".area_notif")
            const popErr = document.createElement("div")
            popErr.classList.add("popErr")
            popErr.innerHTML = data.message;
            area.appendChild(popErr);
            setTimeout(()=>{
                popErr.remove();
            },5000)
        }
    })
    .catch(error => {
        console.error('Erro:', error.message); // Exibe erros no console
    });
});