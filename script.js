let loadedItems=[];
let selectedItem;
const parameters={
    limit:24,
    order_by: "temp",
    sort: "desc",
    currentPage: 1
}
const maxPage=26620/parameters.limit;
const jikanAPI=`https://api.jikan.moe/v4/anime?sfw=true`;

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
        loadcards();
    })
    document.querySelector("#next-page-link").addEventListener("click",(e)=>{
        parameters.currentPage=Math.min(parameters.currentPage+1,maxPage)
        loadcards();
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
        parameters.currentPage=1;
        loadcards();
    })
    //filters, sorting
    document.querySelector("#order-by").addEventListener("input",(e)=>{
        parameters.order_by=e.target.value;
        if (document.querySelector("#searchbar").value!="") searchAnime(document.querySelector("#searchbar").value);
        else loadcards();
    })
    document.querySelector("#sort-btn").addEventListener("click",(e)=>{
        if (parameters.sort=="desc") {
            parameters.sort="asc";
            document.querySelector("#sort-btn").innerHTML=`<i class="fa-solid fa-sort-up"></i>`
        }
        else{
            parameters.sort="desc";
            document.querySelector("#sort-btn").innerHTML=`<i class="fa-solid fa-sort-down"></i>`
        }
        if (document.querySelector("#searchbar").value!="") searchAnime(document.querySelector("#searchbar").value);
        else loadcards();
    })
    //aspetta 4s prima di selezionare, in attesa del caricamento
    setTimeout(()=>{
        selectTitle(loadedItems[0].mal_id)
    },4000);
})
function searchAnime(searchStr){
    if (searchStr!=""){
        loadcards(`&q=${searchStr}`);
        document.querySelector("#page-links").classList.add("inactive");
    }
    else {
        loadcards()
        document.querySelector("#page-links").classList.remove("inactive");
    }
}
function loadcards(extraParameters){
    if (extraParameters==undefined) extraParameters="";
    fetch(`${jikanAPI}&page=${parameters.currentPage}&order_by=${parameters.order_by}&sort=${parameters.sort}&limit=${parameters.limit}${extraParameters}`)
    .then(result=>result.json())
    .then(json=>{
        loadedItems=json.data;
        refreshGrid();
    })
    .catch(error=>{
        console.log(error);
    })
}
function refreshGrid(){
    let str="";
    for (let item of loadedItems){
        str+=
        `
        <div id="${item.mal_id}" class="card" style="background-image: url(${item.images.jpg.image_url});">
            <div class="card-text">
                <h3 class="card-title">${item.title}</h3>
                <span class="card-score">${item.score==null? "0.00":item.score}</span>
            </div>
        </div>
        `;
    }
    document.querySelector("#card-grid").innerHTML=str;
    document.querySelector("#current-page-link").innerHTML=parameters.currentPage;
}
function selectTitle(id){
    let selectedItem=getItemById(id);
    document.querySelector("#selected-title").innerHTML=selectedItem.title;
    document.querySelector("#selected-date").innerHTML=`<span>${selectedItem.aired.from.slice(0,10)}</span><span>${selectedItem.aired.to==null ? selectedItem.status : selectedItem.aired.to.slice(0,10)}</span>`;
    document.querySelector("#selected-score").innerHTML=selectedItem.score==null? "0.00":selectedItem.score;
    document.querySelector("#selected-cover").src=selectedItem.images.jpg.image_url;
    document.querySelector("#selected-description").innerHTML=selectedItem.synopsis;
    document.querySelector("#selected-rating").innerHTML=selectedItem.rating;
    document.querySelector("#trailer-container").innerHTML=selectedItem.trailer.embed_url!=null ? `<h2>Trailer:</h2><iframe id="selected-trailer" src="${selectedItem.trailer.embed_url}"></iframe>` : "";
}

function getItemById(id){
    for (let item of loadedItems) {
        if (item.mal_id==id) return item;
    }
    return -1;
}