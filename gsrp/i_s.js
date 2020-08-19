var iS = {

  let btn_style = `
  .copy_btn {
      background-color: #5d965d;
      padding: 5px;
      font-size: 14px;
      border: none;
  }
  `;

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

if (document.querySelectorAll("h3.med").length > 0){
  iS.add_style(iS.btn_style);
  iS.button({label: 'Process', class: 'copy_btn', before: document.querySelectorAll("h3.med")[0], onclick: iG.xl_dump});
}