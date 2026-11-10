/* Vercel Web Analytics — page views only.

   No cookies, nothing stored in the browser, no consent banner needed, and no
   npm package or build step: the collector script is served by Vercel itself
   from this site's own domain at /_vercel/insights/script.js.

   It is injected here rather than written as a <script src> in the pages
   because that path is not a file in this repo, and scripts/ci-check.sh would
   correctly flag it as a reference to a missing local file.

   Collection must also be switched on in the Vercel dashboard
   (project dvb-og72 -> Analytics -> Enable); until then this is a no-op. */
(function () {
  var h = location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || location.protocol === 'file:') return;
  var s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/insights/script.js';
  document.head.appendChild(s);
})();
