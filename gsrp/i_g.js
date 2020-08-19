var iG = {

  isRelatedSearchDiv: function(element, ix){
    if ((element.parentElement.nodeName === "DIV") && (element.innerText.match(/^Searches/)) ) {
      return(element.parentElement)
    } else { return(null); }
  },

  isImagesDiv: function(element, ix){  
    if ((element.parentElement.nodeName === "DIV") && (element.innerText.match(/^Images/)) ) {
      return(element.parentElement)
    } else { return(null); }
  },

  isAlsoAsklink: function(element, ix){
    if ((element.parentElement.nodeName === "A") && (element.innerText.length === 0)) {
      return(element.parentElement)
    } else { return(null); }
  },

  // True false based on if the given element is a search result
  isSearchResult: function(element, ix){
    if (isRelatedSearchDiv(element, ix)){
      return(false); 
    } else if (isImagesDiv(element, ix)){
      return(false);
    } else if (isAlsoAsklink(element, ix)){
      return(false); 
    } else if (element.parentElement && element.parentElement.href ) {
      return(true);
    }
    return(false); 
  },

  search_results: function(){
   let rv = {title: 'Search Results', items: []};
   // console.log('Search Results ------')
   let h3s = document.querySelectorAll("h3");
   let i_sr = 1;
   [...h3s].forEach((element, ix) => {
      if (!isSearchResult(element, ix)) { return }
      // let str = `${i_sr}: ${element.innerText} : ${element.parentElement['href']}`;
      // console.log(str); 
      rv.items.push({label: element.innerText, url: element.parentElement.href});
      i_sr += 1; 
    })  
   return(rv);
  },

  also_asks: function(){
    let rv = {title: 'People also ask', items: []};
   // Find the People also ask div
   let aad = [...document.querySelectorAll('h2')].find(e => e.innerText.match(/^People\s+also\s+ask/)).parentElement;
   if (!(aad.nodeName === 'DIV')){ throw(`Parent of h2[People also ask] was expected to be DIV. Was: ${aad.nodeName}`)}

   // There are dual links. First link has user visible question, second has url
   let alist = aad.querySelectorAll('a');
   for (let ix=0; ix < alist.length/2; ix++){
     let a1 = alist[ix*2];
     let a2 = alist[ix*2+1];
     let str = `${ix+1}: ${a1.href} : ${a2.innerHTML}`;
      // console.log(str); 
      rv.items.push({q: a2.innerHTML, url: a1.href});
   }
   return(rv);
  },

  related_searches: function(){
    let rv = {title: 'Related Searches', items: []};

    let rsd = [...document.querySelectorAll('h3')].find(e => (e.parentElement && (e.parentElement.nodeName === "DIV") && (e.innerText.match(/^Searches\s+related/))))
    if ( !rsd || !(rsd.parentElement.nodeName === 'DIV')){ throw(`Parent of h3[Searches related to ...] not found.`)}
    rsd = rsd.parentElement.parentElement;
    [...rsd.querySelectorAll('a')].forEach(e => {
      rv.items.push({label: e.innerText})
    })
    return(rv);
  },

  // What was queried?
  query: function(){
    return(document.querySelectorAll("input[name='q'][type='hidden']")[0].value);
  },

  // Copy string to the clipboard. No return value.
  // Use Paste Special CMD + SHIFT + v to paste as cells in Sheets
  clipboard_copy: function(str) {
    if (Array.isArray(str)) str = arr_cp(str);
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  },

  // Given an array, add tabs betweeen rows and LF between lines
  // Assumes each element of the array is also an array
  arr_cp: function(arr) {
      if (!Array.isArray(arr)) arr = [arr];
      let pl = arr.map(e => Array.isArray(e) ? `${e.join('\t')}` : e);
      return(pl.join('\n'));
  },

  // Result object for srp summary
  srp_summary: function(){
    let res = {};
    res.query = query();
    res.results = search_results().items;
    res.also_asks = also_asks().items;
    res.related = related_searches().items;
    return(res);
  },

  // Create clipboard for copy to spreadsheet
  xl_dump: function(){
    let rv = [];
    let res = srp_summary();
    let num_results, num_asks, num_related; 
    [num_results, num_asks, num_related] = [res.results.length, res.also_asks.length, res.related.length];  
    let tot_lines = Math.max(num_results, num_asks, num_related);
    for (let ix=0; ix < tot_lines; ix++){
      let tmp;
      let row = [];
      row.push(res.query);

      // Results: Number, title, url
      tmp = (num_results > ix) ? [ix+1, res.results[ix].label, res.results[ix].url] : [null, null, null]
      tmp.forEach(e => row.push(e));

      // Also asks: Number, title, url
      tmp = (num_asks > ix) ? [ix+1, res.also_asks[ix].q, res.also_asks[ix].url] : [null, null, null]
      tmp.forEach(e => row.push(e));

      // Related: Number, terms
      tmp = (num_related > ix) ? [ix+1, res.related[ix].label] : [null, null]
      tmp.forEach(e => row.push(e));
      rv.push(row);
    }
    clipboard_copy(rv);
    console.log('Results copied to clipboard');
    return(rv);
  }
}

window.iG = iG;
