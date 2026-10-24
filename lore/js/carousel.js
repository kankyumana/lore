var N = 9;
var activeIdx = 1;
var isAnimating = false;
var igScriptLoaded = false;

function getSlotClass(diff) {
  var abs = Math.abs(diff);
  if (diff === 0) return 'active';
  if (abs === 1) return 'side';
  if (abs === 2) return diff < 0 ? 'far-left' : 'far-right';
  return 'far';
}

function loadVisibleIframes() {
  var items = document.querySelectorAll('.carousel-item');
  items.forEach(function(item) {
    var iframe = item.querySelector('iframe');
    if (!iframe) return;
    var src = iframe.getAttribute('data-src');
    if (!src || iframe.src !== 'about:blank') return;
    var diff = parseInt(item.getAttribute('data-index')) - activeIdx;
    if (diff > N/2) diff -= N;
    if (diff < -N/2) diff += N;
    // load iframes for active and adjacent slides
    if (Math.abs(diff) <= 1) {
      iframe.src = src;
      // for Instagram, process embed after load
      if (src.indexOf('instagram.com') > -1) {
        iframe.onload = function() {
          if (window.instgrm) window.instgrm.Embeds.process();
        };
      }
    }
  });
}

function updateLayout() {
  var items = document.querySelectorAll('.carousel-item');
  var dots = document.querySelectorAll('.c-dot');
  var track = document.getElementById('ctrack');
  
  items.forEach(function(item, i) {
    var diff = i - activeIdx;
    if (diff > N/2) diff -= N;
    if (diff < -N/2) diff += N;
    item.className = 'carousel-item ' + getSlotClass(diff);
  });
  
  var containerW = track.parentElement.offsetWidth;
  var activeW = window.innerWidth < 960 ? 280 : 480;
  var gap = 20;
  
  var ordered = [];
  for (var offset = -Math.floor(N/2); offset <= Math.floor(N/2); offset++) {
    var idx = ((activeIdx + offset) % N + N) % N;
    ordered.push({idx: idx, offset: offset});
  }
  
  items.forEach(function(item) { item.style.order = '99'; item.style.display = 'none'; });
  
  ordered.forEach(function(o) {
    if (Math.abs(o.offset) <= 2) {
      var item = items[o.idx];
      item.style.order = String(o.offset + 4);
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
    }
  });
  
  dots.forEach(function(d, i) { d.classList.toggle('active', i === activeIdx); });
  
  var activeEl = document.querySelector('.carousel-item.active');
  if (activeEl) {
    var outerRect = track.parentElement.getBoundingClientRect();
    var elRect = activeEl.getBoundingClientRect();
    var elCenter = elRect.left + elRect.width/2 - outerRect.left;
    var containerCenter = outerRect.width / 2;
    var adjust = containerCenter - elCenter;
    var currentTranslate = parseFloat(track.dataset.translate || 0);
    var newTranslate = currentTranslate + adjust;
    track.dataset.translate = String(newTranslate);
    track.style.transform = 'translateX(' + newTranslate + 'px)';
  }
  
  // Auto-load visible iframes
  loadVisibleIframes();
}

function selectSlide(idx) {
  if (idx === activeIdx || isAnimating) return;
  isAnimating = true;
  activeIdx = ((idx % N) + N) % N;
  updateLayout();
  setTimeout(function() { isAnimating = false; }, 450);
}

function shiftCarousel(dir) {
  selectSlide((activeIdx + dir + N) % N);
}

function playVideo(idx, evt) {
  evt.stopPropagation();
  var cover = document.getElementById('cover-' + idx);
  var iframe = document.getElementById('iframe-' + idx);
  if (idx !== activeIdx) { selectSlide(idx); return; }
  var src = iframe.getAttribute('data-src');
  if (iframe.src === 'about:blank' || iframe.src === '') {
    iframe.src = src;
    // For Instagram, process after load
    if (src.indexOf('instagram.com') > -1) {
      iframe.onload = function() {
        if (window.instgrm) window.instgrm.Embeds.process();
      };
    }
  }
  cover.classList.add('hidden');
}

window.addEventListener('load', function() {
  updateLayout();
  // Pre-load iframe for active item
  var activeIframe = document.getElementById('iframe-' + activeIdx);
  if (activeIframe) {
    activeIframe.src = activeIframe.getAttribute('data-src');
    if (activeIframe.getAttribute('data-src').indexOf('instagram.com') > -1) {
      activeIframe.onload = function() {
        if (window.instgrm) window.instgrm.Embeds.process();
      };
    }
  }
  
  var autoTimer = setInterval(function() {
    if (!document.querySelector('.video-cover.hidden')) shiftCarousel(1);
  }, 7000);
  
  document.getElementById('ctrack').addEventListener('click', function() {
    clearInterval(autoTimer);
  });
});

window.addEventListener('resize', function() {
  document.querySelectorAll('.carousel-item').forEach(function(el) {
    el.style.removeProperty('transform');
  });
  document.getElementById('ctrack').dataset.translate = '0';
  updateLayout();
});
(function(){var done=false,sec=document.getElementById('motion');function load(){if(done)return;done=true;var x=document.createElement('script');x.async=true;x.src='https://www.instagram.com/embed.js';document.body.appendChild(x);}if(!sec||!('IntersectionObserver' in window)){window.addEventListener('load',load);return;}new IntersectionObserver(function(e,o){if(e[0].isIntersecting){load();o.disconnect();}},{rootMargin:'600px'}).observe(sec);})();
