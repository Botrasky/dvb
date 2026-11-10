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
 if (filters && matchMedia('(max-width:640px)').matches) {
   filters.open = new URLSearchParams(location.search).has('topic');
 }
 if (document.querySelector('.wu-article')) {
   const back = document.querySelector('.wu-back');
   if (back) back.href = '/writeups/';
   const navLinks = document.getElementById('navLinks');
   const explore = navLinks?.querySelector('a[href="/"], a[href="../../index.html"]');
   if (explore) {
     explore.textContent = 'Dashboard';
     const libraryItem = document.createElement('li');
     const libraryLink = document.createElement('a');
     libraryLink.href = '/writeups/';
     libraryLink.textContent = 'Writeups';
     libraryLink.addEventListener('click', closeMenu);
     libraryItem.append(libraryLink);
     explore.parentElement.after(libraryItem);
   }
   const author = navLinks?.querySelector('a[href="/portfolio/"], a[href="../../about.html"]');
   if (author) {
     author.href = '/author/';
     author.textContent = 'Author';
   }
   const portfolio = navLinks?.querySelector('a[href="/portfolio/#contact"], a[href="../../about.html#contact"]');
   if (portfolio) {
     portfolio.href = '/portfolio/';
     portfolio.textContent = 'Portfolio';
   }
   const footerLibrary = document.querySelector('.footer-links a[href="/"], .footer-links a[href="../../index.html"]');
   if (footerLibrary) footerLibrary.href = '/writeups/';
   const footerAuthor = document.querySelector('.footer-links a[href="/portfolio/"], .footer-links a[href="../../about.html"]');
   if (footerAuthor) footerAuthor.href = '/author/';
 }
})();
