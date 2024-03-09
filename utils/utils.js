function contarOpcoes(texto) {
    // Divida o texto em linhas usando a quebra de linha como separador
    const linhas = texto.split('\n');

    // Inicialize um contador para o número de opções
    let contador = 1;

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
    contarOpcoes: contarOpcoes
};