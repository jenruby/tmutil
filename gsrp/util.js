// GSRP Code - 
//  - search results
//  - people also ask
//  - related searches

function isRelatedSearchDiv(element, ix){  
  if ((element.parentElement.nodeName === "DIV") && (element.innerText.match(/^Searches/)) ) {
    return(element.parentElement)
  } else { return(null); }
}

function isImagesDiv(element, ix){  
  if ((element.parentElement.nodeName === "DIV") && (element.innerText.match(/^Images/)) ) {
    return(element.parentElement)
  } else { return(null); }
}


function isAlsoAsklink(element, ix){
  if ((element.parentElement.nodeName === "A") && (element.innerText.length === 0)) {
    return(element.parentElement)
  } else { return(null); }
}

// True false based on if the given element is a search result
function isSearchResult(element, ix){
  if (isRelatedSearchDiv(element, ix)){
    return(false); 
  } else if (isImagesDiv(element, ix)){
    return(false);
  } else if (isAlsoAsklink(element, ix)){
    return(false); 
  } else {
    return(true);
  }
  return(true); 
}


// function h_info(element, ix){  
//   let related_search_div = isRelatedSearchDiv(element, ix);
//   let str = `${ix} : `
//   if (related_search_div){
//     str = `${str} -- Related Searches`
//   } else if (isImagesDiv(element, ix)){
//     str = `${str} -- Images`
//   } else if (isAlsoAsklink(element, ix)){
//     str = `${str} -- Also Ask`
//   } else {
//     str = `${str}${element.parentElement.nodeName} :  ${element.innerText}`;
//   }
//   return(str);
// }

function search_results(){
 let rv = {title: 'Search Results', items: []};
 console.log('Search Results ------')
 let h3s = document.querySelectorAll("h3");
 let i_sr = 1;
 [...h3s].forEach((element, ix) => {
    if (!isSearchResult(element, ix)) { return }
    let str = `${i_sr}: ${element.innerText} : ${element.parentElement['href']}`;
    console.log(str); 
    rv.items.push({label: element.innerText, url: element.parentElement['href']});
    i_sr += 1; 
  })  
 return(rv);
}

function also_asks(){
  let rv = {title: 'People also ask', items: []};
 // Find the People also ask div
 let aad = [...document.querySelectorAll('h2')].find(e => e.innerText.match(/^People\s+also\s+ask/)).parentElement;
 if (!(aad.nodeName === 'DIV')){ throw(`Parent of h2[People also ask] was expected to be DIV. Was: ${aad.nodeName}`)}

 // There are dual links. First link has user visible question, second has url
 let alist = aad.querySelectorAll('a');
 for (ix=0; ix < alist.length/2; ix++){
   let a1 = alist[ix*2];
   let a2 = alist[ix*2+1];
   let str = `${ix+1}: ${a1['href']} : ${a2.innerHTML}`;
    console.log(str); 
    rv.items.push({q: a2.innerHTML, url: a1['href']});
 }
 return(rv);
}

function related_searches(){
  let rv = {title: 'Related Searches', items: []};

  let rsd = [...document.querySelectorAll('h3')].find(e => (e.parentElement && (e.parentElement.nodeName === "DIV") && (e.innerText.match(/^Searches\s+related/))))
  if ( !rsd || !(rsd.parentElement.nodeName === 'DIV')){ throw(`Parent of h3[Searches related to ...] not found.`)}
  rsd = rsd.parentElement.parentElement;
  [...rsd.querySelectorAll('a')].forEach(e => {
    rv.items.push({label: e.innerText})
  })
  return(rv);
}

// What was queried?
function query(){
  document.querySelectorAll("input[name='q'][type='hidden']")[0].value  
}


//
// --
//


let sa = search_results();
console.table(sa.items);

let aa = also_asks();
console.table(aa.items);

let rs = related_searches();
console.table(rs.items);
