class Card{
    constructor(obj){
        this.object=obj;
    }
    getCode(){
        return `
        <div id="${this.object.mal_id}" class="card" style="background-image: url(${this.object.images.jpg.image_url});">
            <div class="card-text">
                <h3 class="card-title">${this.object.title}</h3>
                <span class="card-score">${this.object.score==null? "0.00":this.object.score}</span>
            </div>
        </div>
        `
    }
}
class SelectedWindow{
    constructor(obj){
        this.object=obj;
    }
    getCode(){
        return `
        <button id="close-selected-btn"><i class="fa-solid fa-x"></i></button>
        <img id="selected-cover" src="${this.object.images.jpg.image_url}"alt="">
        <h2 id="selected-title">${this.object.title}</h2>
        <p id="selected-description">${this.object.synopsis}</p>
        <div id="extra-info-container">
            <div id="score-container">
                <h3>MAL Score</h3>
                <span id="selected-score">${this.object.score==null? "0.00":this.object.score}</span>
            </div>
            <div id="date-container">
                <h3>Aired from</h3>
                <p id="selected-date"><span>${this.object.aired.from.slice(0,10)}</span> to <span>${this.object.aired.to==null ? this.object.status : this.object.aired.to.slice(0,10)}</span></p>    
            </div>
            <div id="age-container">
                <h3>Age rating</h3>
                <span id="selected-rating">${this.object.rating}</span>
            </div>
        </div>
        <div id="trailer-container">${this.object.trailer.embed_url!=null ? `<h2>Trailer:</h2><iframe id="selected-trailer" src="${this.object.trailer.embed_url}"></iframe>` : ""}</div>
        `;
    }
}
let loadedCards=[];
let selectedWindow;
const parameters={
    limit:25,
    order_by: "temp",
    sort: "desc",
    currentPage: 1,
    maxPage: 0 //temporaneo
}
const jikanAPI=`https://api.jikan.moe/v4/anime?`;

document.addEventListener("DOMContentLoaded",(e)=>{
    parameters.order_by=document.querySelector("#order-by").value;
    console.log(parameters);
    loadcards();
    //browsing
    document.querySelector("#card-grid").addEventListener("click",(e)=>{
        if (e.target.classList.contains("card")) selectTitle(e.target.id);
    });
    document.querySelector("#previous-page-link").addEventListener("click",(e)=>{
        parameters.currentPage=Math.max(parameters.currentPage-1,1)
        if (document.querySelector("#searchbar").value=="") loadcards();
        else searchAnime(document.querySelector("#searchbar").value);
    })
    document.querySelector("#next-page-link").addEventListener("click",(e)=>{
        parameters.currentPage=Math.min(parameters.currentPage+1,parameters.maxPage)
        if (document.querySelector("#searchbar").value=="")loadcards();
        else searchAnime(document.querySelector("#searchbar").value);
    })
    document.querySelector("#search-btn").addEventListener("click",(e)=>{
        let searchStr=document.querySelector("#searchbar").value;
        searchAnime(searchStr);
    })
    document.querySelector("#searchbar").addEventListener("keydown",(e)=>{
        if(e.key=="Enter"){
            let searchStr=document.querySelector("#searchbar").value;
            searchAnime(searchStr);    
        }
    })
    document.querySelector("#home-btn").addEventListener("click",(e)=>{
        document.querySelector("#page-links").classList.remove("inactive");
        document.querySelector("#searchbar").value="";
        parameters.currentPage=1;
        loadcards();
    })
    //filters, sorting
    document.querySelector("#order-by").addEventListener("input",(e)=>{
        parameters.order_by=e.target.value;
        parameters.currentPage=1;
        if (document.querySelector("#searchbar").value!="") searchAnime(document.querySelector("#searchbar").value);
        else loadcards();
    })
    document.querySelector("#sort-btn").addEventListener("click",(e)=>{
        if (parameters.sort=="desc") {
            parameters.sort="asc";
            parameters.currentPage=1;
            document.querySelector("#sort-btn").innerHTML=`<i class="fa-solid fa-sort-up"></i>`
        }
        else{
            parameters.sort="desc";
            document.querySelector("#sort-btn").innerHTML=`<i class="fa-solid fa-sort-down"></i>`
        }
        if (document.querySelector("#searchbar").value!="") searchAnime(document.querySelector("#searchbar").value);
        else loadcards();
    })    
})
function searchAnime(searchStr){
    if (searchStr!=""){
        loadcards(`&q=${searchStr}`);
        // document.querySelector("#page-links").classList.add("inactive");
    }
    else {
        loadcards()
        // document.querySelector("#page-links").classList.remove("inactive");
    }
}
function loadcards(extraParameters){
    if (extraParameters==undefined) extraParameters="";
    fetch(`${jikanAPI}&page=${parameters.currentPage}&order_by=${parameters.order_by}&sort=${parameters.sort}&limit=${parameters.limit}${extraParameters}&sfw=true`)
    .then(result=>result.json())
    .then(json=>{
        loadedCards=[];
        for(let obj of json.data){
            loadedCards.push(new Card(obj))
        };
        console.log(json.pagination);
        parameters.maxPage=json.pagination.last_visible_page;
        refreshGrid();
    })
    .catch(error=>{
        console.log(error);
    })
}
function refreshGrid(){
    let str="";
    for (let card of loadedCards){
        str+=card.getCode();
    }
    document.querySelector("#card-grid").innerHTML=str;
    let page=`${parameters.currentPage}/${parameters.maxPage}`;
    document.querySelector("#current-page-link").innerHTML=page;
}
function selectTitle(id){
    document.querySelector("#selected-tab").classList.add("active");
    selectedWindow=new SelectedWindow(getItemById(id));
    document.querySelector("#selected-tab").innerHTML=selectedWindow.getCode();
    document.querySelector("#close-selected-btn").addEventListener("click",(e)=>{
        document.querySelector("#selected-tab").classList.remove("active");
    })
}

function getItemById(id){
    for (let card of loadedCards) {
        if (card.object.mal_id==id) return card.object;
    }
    return -1;
}