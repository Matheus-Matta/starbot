function contarOpcoes(texto) {
    // Divida o texto em linhas usando a quebra de linha como separador
    const linhas = texto.split('\n');

    // Inicialize um contador para o número de opções
    let contador = 0;

    // Itere sobre cada linha
    for (let linha of linhas) {
        // Verifique se a linha começa com um número seguido de um hífen e possivelmente espaço(s)
        if (/^\d+\s*-/.test(linha)) {
            contador++;
        }
    }

    return contador;
}

module.exports = {
    contarOpcoes: contarOpcoes,
    verificarCpf: function (cpf) {
        // Remove caracteres não numéricos do CPF
        cpf = cpf.replace(/\D/g, '');
    
        // Verifica se o CPF tem 11 dígitos
        if (cpf.length !== 11) {
            return null;
        }
    
        // Calcula o primeiro dígito verificador
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = soma % 11;
        let digitoVerificador1 = resto < 2 ? 0 : 11 - resto;
    
        // Verifica se o primeiro dígito verificador está correto
        if (parseInt(cpf.charAt(9)) !== digitoVerificador1) {
            return null;
        }
    
        // Calcula o segundo dígito verificador
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = soma % 11;
        let digitoVerificador2 = resto < 2 ? 0 : 11 - resto;
    
        // Verifica se o segundo dígito verificador está correto
        if (parseInt(cpf.charAt(10)) !== digitoVerificador2) {
            return null;
        }
    
        // Formata o CPF com pontos e traço
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
};