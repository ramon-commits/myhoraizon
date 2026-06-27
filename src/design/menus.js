/* ============================================================
   menus.js — GEDEELDE menu-/popover-positionering (fundament-laag)

   Eén bron van waarheid voor waar elk menu/popover verschijnt.
   Meet de ECHTE menu-grootte (geen vaste schatting) + de echte
   schermgrenzen en zorgt dat het menu ALTIJD volledig in beeld valt:
     • opent standaard onder/naast de trigger
     • flipt naar boven als er onder geen ruimte is
     • schuift horizontaal naar binnen bij rand-overloop
     • klemt de eindpositie altijd binnen de schermranden (marge)
     • hoge z-index → ligt bovenop kaarten/widgets, nooit erachter
     • begrenst de hoogte (interne scroll) als het menu te hoog is

   Gebruik (in elk menu-component):
     const ref = useSmartMenu({ align, gap, margin, dep, anchorRef });
     return <div className="…" ref={ref}>…</div>;

   ESM-port van de blauwdruk: window-globals -> imports/exports, body letterlijk.
   ============================================================ */
import React from 'react'

export function placeMenu(menuEl, anchorEl, opts) {
  opts = opts || {};
  if (!menuEl || !anchorEl) return;
  var margin = opts.margin == null ? 10 : opts.margin;
  var gap = opts.gap == null ? 6 : opts.gap;
  var align = opts.align || "start";
  var z = opts.z || 1200;

  var a = anchorEl.getBoundingClientRect();

  /* reset oude (CSS-)plaatsing zodat de natuurlijke maat exact klopt */
  menuEl.style.position = "fixed";
  menuEl.style.right = "auto";
  menuEl.style.bottom = "auto";
  menuEl.style.margin = "0";
  menuEl.style.transform = "none";
  menuEl.style.zIndex = z;
  menuEl.style.maxHeight = "";
  menuEl.style.overflowY = "";

  var vw = window.innerWidth;
  var vh = window.innerHeight;
  var mw = menuEl.offsetWidth;
  var mh = menuEl.offsetHeight;

  /* hoogte begrenzen zodat een lang menu altijd past (interne scroll) */
  var maxH = vh - margin * 2;
  if (mh > maxH) {
    menuEl.style.maxHeight = maxH + "px";
    menuEl.style.overflowY = "auto";
    mh = maxH;
  }

  /* verticaal: voorkeur onder de trigger, anders erboven, anders klemmen */
  var top;
  var below = a.bottom + gap;
  var above = a.top - gap - mh;
  if (below + mh <= vh - margin) top = below;
  else if (above >= margin) top = above;
  else top = vh - margin - mh;

  /* horizontaal: begin uitgelijnd op de trigger, schuif daarna naar binnen */
  var left;
  if (align === "end") left = a.right - mw;
  else if (align === "center") left = a.left + a.width / 2 - mw / 2;
  else left = a.left;

  if (left + mw > vw - margin) left = vw - margin - mw;
  if (left < margin) left = margin;
  if (top + mh > vh - margin) top = vh - margin - mh;
  if (top < margin) top = margin;

  /* Robuust tegen getransformeerde voorouders: een ancestor met transform/
     filter/perspective/contain maakt zichzelf het containing-block voor een
     position:fixed kind. Dan zijn left/top relatief aan díe voorouder, niet aan
     het scherm. We sporen dat block op en rekenen onze scherm-coördinaten om
     naar de lokale ruimte ervan, zodat het menu tóch exact in beeld landt.    */
  var ox = 0, oy = 0;
  var cb = menuEl.parentElement;
  while (cb && cb.nodeType === 1) {
    var cs = window.getComputedStyle(cb);
    var wc = cs.willChange || "";
    if (cs.transform !== "none" || cs.perspective !== "none" || cs.filter !== "none" ||
        (cs.backdropFilter && cs.backdropFilter !== "none") ||
        /transform|perspective|filter/.test(wc) ||
        (cs.contain && /paint|layout|strict|content/.test(cs.contain))) {
      var cr = cb.getBoundingClientRect();
      ox = cr.left + (parseFloat(cs.borderLeftWidth) || 0);
      oy = cr.top + (parseFloat(cs.borderTopWidth) || 0);
      break;
    }
    cb = cb.parentElement;
  }

  menuEl.style.left = Math.round(left - ox) + "px";
  menuEl.style.top = Math.round(top - oy) + "px";
}

export function useSmartMenu(opts) {
  opts = opts || {};
  var ref = React.useRef(null);
  var dep = opts.dep;
  React.useLayoutEffect(function () {
    var el = ref.current;
    if (!el) return;
    var anchor = (opts.anchorRef && opts.anchorRef.current) ||
      el.previousElementSibling || el.parentElement;
    if (!anchor) return;
    var place = function () { placeMenu(el, anchor, opts); };
    place();
    /* nog een keer na de eerste frame: lettertypes/inhoud zijn dan gezet */
    var raf = requestAnimationFrame(place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return function () {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep]);
  return ref;
}
