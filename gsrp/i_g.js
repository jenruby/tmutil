// TM script
// To copy results use - 
// $ iG.xl_dump()
// Then paste special in sheets with columns: 
// Search Term  | 
// Result No | Result Title  | Result URL  
// Also Ask No | Also Ask Title  | Also Ask URL  
// Related Search no | Related Search Text                                 

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

  snippetA: function(){
    let rv = [...document.querySelectorAll('span a')].find(e => (e.text === 'About Featured Snippets'));
    return(rv);
  },

  hasSnippet: function(){
    return(iG.snippetA() ? true : false);
  },

  snippet: function(){
    if (!iG.hasSnippet()) return(null);
    let a = iG.snippetA();
    let snipDiv = a.closest('div').parentElement.parentElement.previousSibling;

    let matched_a = [...snipDiv.querySelectorAll('a')].find(a => (!a.href.match(/google/))  )
    rv = {
      title: snipDiv.querySelector('h3').textContent,
      url: matched_a ? matched_a.href : null, 
    }
    return(rv);
  },

  // True false based on if the given element is a search result
  isSearchResult: function(element, ix){
    if (iG.isRelatedSearchDiv(element, ix)){
      return(false);
    } else if (iG.isImagesDiv(element, ix)){
      return(false);
    } else if (iG.isAlsoAsklink(element, ix)){
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
      if (!iG.isSearchResult(element, ix)) { return }
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
    if (Array.isArray(str)) str = iG.arr_cp(str);
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
    res.query     = iG.query();
    res.results   = iG.search_results().items;
    res.also_asks = iG.also_asks().items;
    res.related   = iG.related_searches().items;
    res.snippet   = iG.snippet();
    return(res);
  },

  // Create clipboard for copy to spreadsheet
  xl_dump: function(){
    let rv = [];
    let res = iG.srp_summary();
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

      // Snippet: Title, URL
      tmp = (res.snippet && ix == 0) ? [res.snippet.title, res.snippet.url] : [null, null]
      tmp.forEach(e => row.push(e));

      rv.push(row);
    }
    iG.clipboard_copy(rv);
    console.log('Results copied to clipboard');
    return(rv);
  },

  btn_style = `
  .copy_btn {
      background-color: #5d965d;
      padding: 5px;
      font-size: 14px;
      border: none;
  }
  `,

  add_style: function(style_str){    
    let s = document.createElement('style');
    s.type = "text/css";
    s.innerHTML = style_str;
    (document.head || document.documentElement).appendChild(s);
  },

  button: function(in_opts){
   let opts = Object.assign({label: 'Copy', class: 'copy_btn'}, in_opts);
   let btn = document.createElement("button");
   btn.innerHTML = opts.label;
   btn.className = opts.class;
   btn.onclick = opts.onclick;
   // If opts.parent is given, insert the button before opts.before
   if (opts.before){
     opts.before.parentElement.insertBefore(btn, opts.before);
   }
   return(btn);
  },
}

window.iG = iG;

// (function() {
//     'use strict';
//     iG.xl_dump();
//     console.log('Loading in iG TM complete');
// })();

// setTimeout(() => {iG.xl_dump}, 1000)

if (document.querySelectorAll("h3.med").length > 0){
  iS.add_style(iS.btn_style);
  iS.button({label: 'Process', class: 'copy_btn', before: document.querySelectorAll("h3.med")[0], onclick: iG.xl_dump});
}
