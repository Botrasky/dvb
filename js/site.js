(() => {
 const body = document.querySelector('.wu-body');
 if (body) {
   const headings = [...body.querySelectorAll('h2')];
   if (headings.length) {
     const contents = document.createElement('details'); contents.className = 'article-contents';
     const summary = document.createElement('summary'); summary.textContent = 'On this page'; contents.append(summary);
     const list = document.createElement('ul');
     headings.forEach((h,i) => { if(!h.id) h.id = 'section-' + (i+1); const li=document.createElement('li'); const a=document.createElement('a'); a.href='#'+h.id; a.textContent=h.textContent; li.append(a); list.append(li); });
     contents.append(list); body.before(contents);
   }
 }
 const filters = document.querySelector('.wu-filter-panel');
 if(filters && matchMedia('(max-width:640px)').matches) filters.open = false;
})();
