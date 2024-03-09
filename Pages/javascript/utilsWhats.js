export function imgRedimensionar(img){
    img.addEventListener('click', ()=>{
    const box = document.querySelector(".container_chatbox-img")
    box.style.display = "flex"
    const newimg = img.cloneNode(true); 
    box.appendChild(newimg)
 })
}

const container = document.querySelector(".container_chatbox-img");
container.addEventListener("click", (event) => {
    const target = event.target;
    if (target.classList.contains('container_chatbox-img')) {
        const imgs = container.querySelectorAll("img");
        if (imgs) { // Verifica se img não é nulo
            imgs.forEach(img =>{
                img.remove();
            })
            container.style.display = "none";
        }
    }
});


const fileInput = document.querySelector("#inputFile")
const imagePreview = document.querySelector('.box-preview');
const btn_fechar = document.querySelector(".btn_fechar-preview")
fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    console.log(e.target.files)
    if(e.target.files){
        files.forEach( (file, i) => {
         const reader = new FileReader()
         reader.addEventListener("load",(e)=>{
            
            const target = e.target
            const url = target.result
            const img = `<div style="background-image: url(${url});" class="imgPreview" data-imgID="${i}"><svg class="delete_img-preview" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b05454" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></div>`
            imagePreview.insertAdjacentHTML('beforeend', img)
            const svg = document.querySelector(`div[data-imgID="${i}"] svg`);
            delImg(svg);
         })

         reader.readAsDataURL(file)
        });
    }
    btn_fechar.style.display = 'block'
    btn_fechar.addEventListener('click', removePreview)
});


export function removePreview(){
    const previews = document.querySelectorAll('.box-preview div')
    previews.forEach( p =>{
        p.remove();
    })
    const fileInput = document.querySelector("#inputFile")
    fileInput.value = ''
    btn_fechar.style.display = 'none'

}
function delImg(svg){
    svg.addEventListener("click",()=>{
       const img = svg.parentNode
       img.remove();
       const previews = document.querySelectorAll('.box-preview div')
       if(previews.length == 0){
            btn_fechar.style.display = 'none'
        }
    })  
}


export async  function enviarIMG(){
    const previews = document.querySelectorAll('.box-preview .imgPreview')
    const array = []
    if(previews.length == 0){
        return null;
    }
    previews.forEach(async p =>{
       await obterURL(p,array)
    })
    previews.forEach(p=>{
        p.remove();
    })
    btn_fechar.style.display = 'none'

    return array

    async function obterURL(p,array){
        const sty = window.getComputedStyle(p);
        const backgroundImage = sty.getPropertyValue('background-image');
        const url = backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
        array.push(url[1])
    }
}