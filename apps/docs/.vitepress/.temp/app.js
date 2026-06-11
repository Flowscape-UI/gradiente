var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { ssrRenderAttrs, ssrRenderSlot, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderComponent, ssrRenderVNode, ssrRenderClass, ssrRenderStyle, renderToString } from "vue/server-renderer";
import { defineComponent, mergeProps, useSSRContext, shallowRef, inject, computed, ref, watch, onUnmounted, reactive, markRaw, readonly, nextTick, h, unref, onMounted, watchEffect, watchPostEffect, onUpdated, resolveComponent, createVNode, resolveDynamicComponent, withCtx, renderSlot, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, renderList, defineAsyncComponent, provide, toHandlers, withKeys, onBeforeUnmount, useSlots, useModel, createSSRApp } from "vue";
import { usePreferredDark, useDark, useMediaQuery, useWindowSize, onKeyStroke, useWindowScroll, useScrollLock } from "@vueuse/core";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
import { Position, VueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { parse as parse$1, converter, formatRgb, fixupHueShorter, fixupHueDecreasing, fixupHueIncreasing, fixupHueLonger, interpolate, getMode } from "culori";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, placeholder, ViewPlugin, Decoration } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/language";
const _sfc_main$19 = /* @__PURE__ */ defineComponent({
  __name: "VPBadge",
  __ssrInlineRender: true,
  props: {
    text: {},
    type: { default: "tip" }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({
        class: ["VPBadge", __props.type]
      }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, () => {
        _push(`${ssrInterpolate(__props.text)}`);
      }, _push, _parent);
      _push(`</span>`);
    };
  }
});
const _sfc_setup$19 = _sfc_main$19.setup;
_sfc_main$19.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPBadge.vue");
  return _sfc_setup$19 ? _sfc_setup$19(props, ctx) : void 0;
};
function deserializeFunctions(r) {
  return Array.isArray(r) ? r.map(deserializeFunctions) : typeof r == "object" && r !== null ? Object.keys(r).reduce((t, n) => (t[n] = deserializeFunctions(r[n]), t), {}) : typeof r == "string" && r.startsWith("_vp-fn_") ? new Function(`return ${r.slice(7)}`)() : r;
}
const siteData = deserializeFunctions(JSON.parse('{"lang":"en-US","dir":"ltr","title":"gradiente","description":"Lightweight gradient toolkit for modern rendering systems.","base":"/gradiente/","head":[],"router":{"prefetchLinks":true},"appearance":true,"themeConfig":{"logo":"/logo.svg","siteTitle":"gradiente","socialLinks":[{"icon":"github","link":"https://github.com/Flowscape-UI/gradiente"}],"search":{"provider":"local"}},"locales":{"root":{"label":"English","lang":"en","themeConfig":{"nav":[{"text":"Getting Started","link":"/getting-started"},{"text":"Playground","items":[{"text":"DSL Playground","link":"/playground/dsl"},{"text":"Gradient Playground","link":"https://flowscape-ui.github.io/gradiente/playground"}]}],"sidebar":[{"text":"Introduction","items":[{"text":"What is Gradiente?","link":"/what-is-gradiente"},{"text":"Getting Started","link":"/getting-started"}]},{"text":"Core API","items":[{"text":"Introduction","link":"/core-api/intro"},{"text":"Working with gradients","link":"/core-api/working-with-gradients"},{"text":"Gradient Types","items":[{"text":"Overview","link":"/core-api/gradients/"},{"text":"Linear","link":"/core-api/gradients/linear"},{"text":"Radial","link":"/core-api/gradients/radial"},{"text":"Diamond","link":"/core-api/gradients/diamond"},{"text":"Conic","link":"/core-api/gradients/conic"},{"text":"Mesh","link":"/core-api/gradients/mesh"}]},{"text":"Transformers","link":"/core-api/transformers"},{"text":"Custom Transformers","link":"/core-api/custom-transformers"},{"text":"Custom Gradients","link":"/core-api/custom-gradients"},{"text":"Examples","link":"/core-api/examples"}]},{"text":"DSL Patterns","items":[{"text":"What is DSL?","link":"/dsl/what-is-dsl"},{"text":"How to read DSL?","link":"/dsl/how-to-read-dsl"},{"text":"Design Guide","link":"/dsl/design-guide"},{"text":"Real-World Examples","link":"/dsl/real-world-examples"},{"text":"Design Your Own Patterns","link":"/dsl/design-your-own-patterns"}]},{"text":"Playground","items":[{"text":"DSL Playground","link":"/playground/dsl"},{"text":"Gradient Playground","link":"https://flowscape-ui.github.io/gradiente/playground"}]}]}},"ru":{"label":"Русский","lang":"ru","link":"/ru/","themeConfig":{"nav":[{"text":"Перейти к документации","link":"/ru/getting-started"},{"text":"Playground","items":[{"text":"DSL Playground","link":"/playground/dsl"},{"text":"Gradient Playground","link":"https://flowscape-ui.github.io/gradiente/playground"}]}],"sidebar":[{"text":"Введение","items":[{"text":"Чем является gradiente?","link":"/ru/what-is-gradiente"},{"text":"Быстрый старт","link":"/ru/getting-started"}]},{"text":"Ключевое API","items":[{"text":"Введение","link":"/ru/core-api/intro"},{"text":"Объект градиента","link":"/ru/core-api/working-with-gradients"},{"text":"Типы градиентов","items":[{"text":"Обзор","link":"/ru/core-api/gradients/"},{"text":"Linear","link":"/ru/core-api/gradients/linear"},{"text":"Radial","link":"/ru/core-api/gradients/radial"},{"text":"Diamond","link":"/ru/core-api/gradients/diamond"},{"text":"Conic","link":"/ru/core-api/gradients/conic"},{"text":"Mesh","link":"/ru/core-api/gradients/mesh"}]},{"text":"Трансформеры","link":"/ru/core-api/transformers"},{"text":"Кастомные трансформеры","link":"/ru/core-api/custom-transformers"},{"text":"Кастомные градиенты","link":"/ru/core-api/custom-gradients"},{"text":"Примеры","link":"/ru/core-api/examples"}]},{"text":"Паттерны DSL","items":[{"text":"Что такое DSL?","link":"/ru/dsl/what-is-dsl"},{"text":"Как читать DSL?","link":"/ru/dsl/how-to-read-dsl"},{"text":"Руководство по дизайну","link":"/ru/dsl/design-guide"},{"text":"Реальные примеры","link":"/ru/dsl/real-world-examples"},{"text":"Создание собственных паттернов","link":"/ru/dsl/design-your-own-patterns"}]},{"text":"Playground","items":[{"text":"DSL Playground","link":"/playground/dsl"},{"text":"Gradient Playground","link":"https://flowscape-ui.github.io/gradiente/playground"}]}]}}},"scrollOffset":134,"cleanUrls":false}'));
const __vite_import_meta_env__ = {};
const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i;
const APPEARANCE_KEY = "vitepress-theme-appearance";
const HASH_RE = /#.*$/;
const HASH_OR_QUERY_RE = /[?#].*$/;
const INDEX_OR_EXT_RE = /(?:(^|\/)index)?\.(?:md|html)$/;
const inBrowser = typeof document !== "undefined";
const notFoundPageData = {
  relativePath: "404.md",
  filePath: "",
  title: "404",
  description: "Not Found",
  headers: [],
  frontmatter: { sidebar: false, layout: "page" },
  lastUpdated: 0,
  isNotFound: true
};
function isActive(currentPath, matchPath, asRegex = false) {
  if (matchPath === void 0) {
    return false;
  }
  currentPath = normalize(`/${currentPath}`);
  if (asRegex) {
    return new RegExp(matchPath).test(currentPath);
  }
  if (normalize(matchPath) !== currentPath) {
    return false;
  }
  const hashMatch = matchPath.match(HASH_RE);
  if (hashMatch) {
    return (inBrowser ? location.hash : "") === hashMatch[0];
  }
  return true;
}
function normalize(path) {
  return decodeURI(path).replace(HASH_OR_QUERY_RE, "").replace(INDEX_OR_EXT_RE, "$1");
}
function isExternal(path) {
  return EXTERNAL_URL_RE.test(path);
}
function getLocaleForPath(siteData2, relativePath) {
  return Object.keys((siteData2 == null ? void 0 : siteData2.locales) || {}).find((key) => key !== "root" && !isExternal(key) && isActive(relativePath, `/${key}/`, true)) || "root";
}
function resolveSiteDataByRoute(siteData2, relativePath) {
  var _a, _b, _c, _d, _e, _f, _g;
  const localeIndex = getLocaleForPath(siteData2, relativePath);
  return Object.assign({}, siteData2, {
    localeIndex,
    lang: ((_a = siteData2.locales[localeIndex]) == null ? void 0 : _a.lang) ?? siteData2.lang,
    dir: ((_b = siteData2.locales[localeIndex]) == null ? void 0 : _b.dir) ?? siteData2.dir,
    title: ((_c = siteData2.locales[localeIndex]) == null ? void 0 : _c.title) ?? siteData2.title,
    titleTemplate: ((_d = siteData2.locales[localeIndex]) == null ? void 0 : _d.titleTemplate) ?? siteData2.titleTemplate,
    description: ((_e = siteData2.locales[localeIndex]) == null ? void 0 : _e.description) ?? siteData2.description,
    head: mergeHead(siteData2.head, ((_f = siteData2.locales[localeIndex]) == null ? void 0 : _f.head) ?? []),
    themeConfig: {
      ...siteData2.themeConfig,
      ...(_g = siteData2.locales[localeIndex]) == null ? void 0 : _g.themeConfig
    }
  });
}
function createTitle(siteData2, pageData) {
  const title = pageData.title || siteData2.title;
  const template = pageData.titleTemplate ?? siteData2.titleTemplate;
  if (typeof template === "string" && template.includes(":title")) {
    return template.replace(/:title/g, title);
  }
  const templateString = createTitleTemplate(siteData2.title, template);
  if (title === templateString.slice(3)) {
    return title;
  }
  return `${title}${templateString}`;
}
function createTitleTemplate(siteTitle, template) {
  if (template === false) {
    return "";
  }
  if (template === true || template === void 0) {
    return ` | ${siteTitle}`;
  }
  if (siteTitle === template) {
    return "";
  }
  return ` | ${template}`;
}
function hasTag(head, tag) {
  const [tagType, tagAttrs] = tag;
  if (tagType !== "meta")
    return false;
  const keyAttr = Object.entries(tagAttrs)[0];
  if (keyAttr == null)
    return false;
  return head.some(([type, attrs]) => type === tagType && attrs[keyAttr[0]] === keyAttr[1]);
}
function mergeHead(prev, curr) {
  return [...prev.filter((tagAttrs) => !hasTag(curr, tagAttrs)), ...curr];
}
const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g;
const DRIVE_LETTER_REGEX = /^[a-z]:/i;
function sanitizeFileName(name) {
  const match = DRIVE_LETTER_REGEX.exec(name);
  const driveLetter = match ? match[0] : "";
  return driveLetter + name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, "_").replace(/(^|\/)_+(?=[^/]*$)/, "$1");
}
const KNOWN_EXTENSIONS = /* @__PURE__ */ new Set();
function treatAsHtml(filename) {
  var _a;
  if (KNOWN_EXTENSIONS.size === 0) {
    const extraExts = typeof process === "object" && ((_a = process.env) == null ? void 0 : _a.VITE_EXTRA_EXTENSIONS) || (__vite_import_meta_env__ == null ? void 0 : __vite_import_meta_env__.VITE_EXTRA_EXTENSIONS) || "";
    ("3g2,3gp,aac,ai,apng,au,avif,bin,bmp,cer,class,conf,crl,css,csv,dll,doc,eps,epub,exe,gif,gz,ics,ief,jar,jpe,jpeg,jpg,js,json,jsonld,m4a,man,mid,midi,mjs,mov,mp2,mp3,mp4,mpe,mpeg,mpg,mpp,oga,ogg,ogv,ogx,opus,otf,p10,p7c,p7m,p7s,pdf,png,ps,qt,roff,rtf,rtx,ser,svg,t,tif,tiff,tr,ts,tsv,ttf,txt,vtt,wav,weba,webm,webp,woff,woff2,xhtml,xml,yaml,yml,zip" + (extraExts && typeof extraExts === "string" ? "," + extraExts : "")).split(",").forEach((ext2) => KNOWN_EXTENSIONS.add(ext2));
  }
  const ext = filename.split(".").pop();
  return ext == null || !KNOWN_EXTENSIONS.has(ext.toLowerCase());
}
function escapeRegExp(str) {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
const dataSymbol = Symbol();
const siteDataRef = shallowRef(siteData);
function initData(route) {
  const site = computed(() => resolveSiteDataByRoute(siteDataRef.value, route.data.relativePath));
  const appearance = site.value.appearance;
  const isDark = appearance === "force-dark" ? ref(true) : appearance === "force-auto" ? usePreferredDark() : appearance ? useDark({
    storageKey: APPEARANCE_KEY,
    initialValue: () => appearance === "dark" ? "dark" : "auto",
    ...typeof appearance === "object" ? appearance : {}
  }) : ref(false);
  const hashRef = ref(inBrowser ? location.hash : "");
  if (inBrowser) {
    window.addEventListener("hashchange", () => {
      hashRef.value = location.hash;
    });
  }
  watch(() => route.data, () => {
    hashRef.value = inBrowser ? location.hash : "";
  });
  return {
    site,
    theme: computed(() => site.value.themeConfig),
    page: computed(() => route.data),
    frontmatter: computed(() => route.data.frontmatter),
    params: computed(() => route.data.params),
    lang: computed(() => site.value.lang),
    dir: computed(() => route.data.frontmatter.dir || site.value.dir),
    localeIndex: computed(() => site.value.localeIndex || "root"),
    title: computed(() => createTitle(site.value, route.data)),
    description: computed(() => route.data.description || site.value.description),
    isDark,
    hash: computed(() => hashRef.value)
  };
}
function useData$1() {
  const data = inject(dataSymbol);
  if (!data) {
    throw new Error("vitepress data not properly injected in app");
  }
  return data;
}
function joinPath(base, path) {
  return `${base}${path}`.replace(/\/+/g, "/");
}
function withBase(path) {
  return EXTERNAL_URL_RE.test(path) || !path.startsWith("/") ? path : joinPath(siteDataRef.value.base, path);
}
function pathToFile(path) {
  let pagePath = path.replace(/\.html$/, "");
  pagePath = decodeURIComponent(pagePath);
  pagePath = pagePath.replace(/\/$/, "/index");
  {
    if (inBrowser) {
      const base = "/gradiente/";
      pagePath = sanitizeFileName(pagePath.slice(base.length).replace(/\//g, "_") || "index") + ".md";
      let pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()];
      if (!pageHash) {
        pagePath = pagePath.endsWith("_index.md") ? pagePath.slice(0, -9) + ".md" : pagePath.slice(0, -3) + "_index.md";
        pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()];
      }
      if (!pageHash)
        return null;
      pagePath = `${base}${"assets"}/${pagePath}.${pageHash}.js`;
    } else {
      pagePath = `./${sanitizeFileName(pagePath.slice(1).replace(/\//g, "_"))}.md.js`;
    }
  }
  return pagePath;
}
let contentUpdatedCallbacks = [];
function onContentUpdated(fn) {
  contentUpdatedCallbacks.push(fn);
  onUnmounted(() => {
    contentUpdatedCallbacks = contentUpdatedCallbacks.filter((f) => f !== fn);
  });
}
function getScrollOffset() {
  let scrollOffset = siteDataRef.value.scrollOffset;
  let offset = 0;
  let padding = 24;
  if (typeof scrollOffset === "object" && "padding" in scrollOffset) {
    padding = scrollOffset.padding;
    scrollOffset = scrollOffset.selector;
  }
  if (typeof scrollOffset === "number") {
    offset = scrollOffset;
  } else if (typeof scrollOffset === "string") {
    offset = tryOffsetSelector(scrollOffset, padding);
  } else if (Array.isArray(scrollOffset)) {
    for (const selector of scrollOffset) {
      const res = tryOffsetSelector(selector, padding);
      if (res) {
        offset = res;
        break;
      }
    }
  }
  return offset;
}
function tryOffsetSelector(selector, padding) {
  const el = document.querySelector(selector);
  if (!el)
    return 0;
  const bot = el.getBoundingClientRect().bottom;
  if (bot < 0)
    return 0;
  return bot + padding;
}
const RouterSymbol = Symbol();
const fakeHost = "http://a.com";
const getDefaultRoute = () => ({
  path: "/",
  component: null,
  data: notFoundPageData
});
function createRouter(loadPageModule, fallbackComponent) {
  const route = reactive(getDefaultRoute());
  const router = {
    route,
    go
  };
  async function go(href = inBrowser ? location.href : "/") {
    var _a, _b;
    href = normalizeHref(href);
    if (await ((_a = router.onBeforeRouteChange) == null ? void 0 : _a.call(router, href)) === false)
      return;
    if (inBrowser && href !== normalizeHref(location.href)) {
      history.replaceState({ scrollPosition: window.scrollY }, "");
      history.pushState({}, "", href);
    }
    await loadPage(href);
    await ((_b = router.onAfterRouteChange ?? router.onAfterRouteChanged) == null ? void 0 : _b(href));
  }
  let latestPendingPath = null;
  async function loadPage(href, scrollPosition = 0, isRetry = false) {
    var _a, _b;
    if (await ((_a = router.onBeforePageLoad) == null ? void 0 : _a.call(router, href)) === false)
      return;
    const targetLoc = new URL(href, fakeHost);
    const pendingPath = latestPendingPath = targetLoc.pathname;
    try {
      let page = await loadPageModule(pendingPath);
      if (!page) {
        throw new Error(`Page not found: ${pendingPath}`);
      }
      if (latestPendingPath === pendingPath) {
        latestPendingPath = null;
        const { default: comp, __pageData } = page;
        if (!comp) {
          throw new Error(`Invalid route component: ${comp}`);
        }
        await ((_b = router.onAfterPageLoad) == null ? void 0 : _b.call(router, href));
        route.path = inBrowser ? pendingPath : withBase(pendingPath);
        route.component = markRaw(comp);
        route.data = true ? markRaw(__pageData) : readonly(__pageData);
        if (inBrowser) {
          nextTick(() => {
            let actualPathname = siteDataRef.value.base + __pageData.relativePath.replace(/(?:(^|\/)index)?\.md$/, "$1");
            if (!siteDataRef.value.cleanUrls && !actualPathname.endsWith("/")) {
              actualPathname += ".html";
            }
            if (actualPathname !== targetLoc.pathname) {
              targetLoc.pathname = actualPathname;
              href = actualPathname + targetLoc.search + targetLoc.hash;
              history.replaceState({}, "", href);
            }
            if (targetLoc.hash && !scrollPosition) {
              let target = null;
              try {
                target = document.getElementById(decodeURIComponent(targetLoc.hash).slice(1));
              } catch (e) {
                console.warn(e);
              }
              if (target) {
                scrollTo(target, targetLoc.hash);
                return;
              }
            }
            window.scrollTo(0, scrollPosition);
          });
        }
      }
    } catch (err) {
      if (!/fetch|Page not found/.test(err.message) && !/^\/404(\.html|\/)?$/.test(href)) {
        console.error(err);
      }
      if (!isRetry) {
        try {
          const res = await fetch(siteDataRef.value.base + "hashmap.json");
          window.__VP_HASH_MAP__ = await res.json();
          await loadPage(href, scrollPosition, true);
          return;
        } catch (e) {
        }
      }
      if (latestPendingPath === pendingPath) {
        latestPendingPath = null;
        route.path = inBrowser ? pendingPath : withBase(pendingPath);
        route.component = fallbackComponent ? markRaw(fallbackComponent) : null;
        const relativePath = inBrowser ? pendingPath.replace(/(^|\/)$/, "$1index").replace(/(\.html)?$/, ".md").replace(/^\//, "") : "404.md";
        route.data = { ...notFoundPageData, relativePath };
      }
    }
  }
  if (inBrowser) {
    if (history.state === null) {
      history.replaceState({}, "");
    }
    window.addEventListener("click", (e) => {
      if (e.defaultPrevented || !(e.target instanceof Element) || e.target.closest("button") || // temporary fix for docsearch action buttons
      e.button !== 0 || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey)
        return;
      const link2 = e.target.closest("a");
      if (!link2 || link2.closest(".vp-raw") || link2.hasAttribute("download") || link2.hasAttribute("target"))
        return;
      const linkHref = link2.getAttribute("href") ?? (link2 instanceof SVGAElement ? link2.getAttribute("xlink:href") : null);
      if (linkHref == null)
        return;
      const { href, origin, pathname, hash, search } = new URL(linkHref, link2.baseURI);
      const currentUrl = new URL(location.href);
      if (origin === currentUrl.origin && treatAsHtml(pathname)) {
        e.preventDefault();
        if (pathname === currentUrl.pathname && search === currentUrl.search) {
          if (hash !== currentUrl.hash) {
            history.pushState({}, "", href);
            window.dispatchEvent(new HashChangeEvent("hashchange", {
              oldURL: currentUrl.href,
              newURL: href
            }));
          }
          if (hash) {
            scrollTo(link2, hash, link2.classList.contains("header-anchor"));
          } else {
            window.scrollTo(0, 0);
          }
        } else {
          go(href);
        }
      }
    }, { capture: true });
    window.addEventListener("popstate", async (e) => {
      var _a;
      if (e.state === null)
        return;
      const href = normalizeHref(location.href);
      await loadPage(href, e.state && e.state.scrollPosition || 0);
      await ((_a = router.onAfterRouteChange ?? router.onAfterRouteChanged) == null ? void 0 : _a(href));
    });
    window.addEventListener("hashchange", (e) => {
      e.preventDefault();
    });
  }
  return router;
}
function useRouter() {
  const router = inject(RouterSymbol);
  if (!router) {
    throw new Error("useRouter() is called without provider.");
  }
  return router;
}
function useRoute() {
  return useRouter().route;
}
function scrollTo(el, hash, smooth = false) {
  let target = null;
  try {
    target = el.classList.contains("header-anchor") ? el : document.getElementById(decodeURIComponent(hash).slice(1));
  } catch (e) {
    console.warn(e);
  }
  if (target) {
    let scrollToTarget = function() {
      if (!smooth || Math.abs(targetTop - window.scrollY) > window.innerHeight)
        window.scrollTo(0, targetTop);
      else
        window.scrollTo({ left: 0, top: targetTop, behavior: "smooth" });
    };
    const targetPadding = parseInt(window.getComputedStyle(target).paddingTop, 10);
    const targetTop = window.scrollY + target.getBoundingClientRect().top - getScrollOffset() + targetPadding;
    requestAnimationFrame(scrollToTarget);
  }
}
function normalizeHref(href) {
  const url = new URL(href, fakeHost);
  url.pathname = url.pathname.replace(/(^|\/)index(\.html)?$/, "$1");
  if (siteDataRef.value.cleanUrls)
    url.pathname = url.pathname.replace(/\.html$/, "");
  else if (!url.pathname.endsWith("/") && !url.pathname.endsWith(".html"))
    url.pathname += ".html";
  return url.pathname + url.search + url.hash;
}
const runCbs = () => contentUpdatedCallbacks.forEach((fn) => fn());
const Content = defineComponent({
  name: "VitePressContent",
  props: {
    as: { type: [Object, String], default: "div" }
  },
  setup(props) {
    const route = useRoute();
    const { frontmatter, site } = useData$1();
    watch(frontmatter, runCbs, { deep: true, flush: "post" });
    return () => h(props.as, site.value.contentProps ?? { style: { position: "relative" } }, [
      route.component ? h(route.component, {
        onVnodeMounted: runCbs,
        onVnodeUpdated: runCbs,
        onVnodeUnmounted: runCbs
      }) : "404 Page Not Found"
    ]);
  }
});
const _sfc_main$18 = /* @__PURE__ */ defineComponent({
  __name: "VPBackdrop",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.show) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPBackdrop" }, _attrs))} data-v-88e99993></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$18 = _sfc_main$18.setup;
_sfc_main$18.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPBackdrop.vue");
  return _sfc_setup$18 ? _sfc_setup$18(props, ctx) : void 0;
};
const VPBackdrop = /* @__PURE__ */ _export_sfc(_sfc_main$18, [["__scopeId", "data-v-88e99993"]]);
const useData = useData$1;
function throttleAndDebounce(fn, delay) {
  let timeoutId;
  let called = false;
  return () => {
    if (timeoutId)
      clearTimeout(timeoutId);
    if (!called) {
      fn();
      (called = true) && setTimeout(() => called = false, delay);
    } else
      timeoutId = setTimeout(fn, delay);
  };
}
function ensureStartingSlash(path) {
  return path.startsWith("/") ? path : `/${path}`;
}
function normalizeLink$1(url) {
  const { pathname, search, hash, protocol } = new URL(url, "http://a.com");
  if (isExternal(url) || url.startsWith("#") || !protocol.startsWith("http") || !treatAsHtml(pathname))
    return url;
  const { site } = useData();
  const normalizedPath = pathname.endsWith("/") || pathname.endsWith(".html") ? url : url.replace(/(?:(^\.+)\/)?.*$/, `$1${pathname.replace(/(\.md)?$/, site.value.cleanUrls ? "" : ".html")}${search}${hash}`);
  return withBase(normalizedPath);
}
function useLangs({ correspondingLink = false } = {}) {
  const { site, localeIndex, page, theme: theme2, hash } = useData();
  const currentLang = computed(() => {
    var _a, _b;
    return {
      label: (_a = site.value.locales[localeIndex.value]) == null ? void 0 : _a.label,
      link: ((_b = site.value.locales[localeIndex.value]) == null ? void 0 : _b.link) || (localeIndex.value === "root" ? "/" : `/${localeIndex.value}/`)
    };
  });
  const localeLinks = computed(() => Object.entries(site.value.locales).flatMap(([key, value]) => currentLang.value.label === value.label ? [] : {
    text: value.label,
    link: normalizeLink(value.link || (key === "root" ? "/" : `/${key}/`), theme2.value.i18nRouting !== false && correspondingLink, page.value.relativePath.slice(currentLang.value.link.length - 1), !site.value.cleanUrls) + hash.value
  }));
  return { localeLinks, currentLang };
}
function normalizeLink(link2, addPath, path, addExt) {
  return addPath ? link2.replace(/\/$/, "") + ensureStartingSlash(path.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, addExt ? ".html" : "")) : link2;
}
const _sfc_main$17 = /* @__PURE__ */ defineComponent({
  __name: "NotFound",
  __ssrInlineRender: true,
  setup(__props) {
    const { theme: theme2 } = useData();
    const { currentLang } = useLangs();
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "NotFound" }, _attrs))} data-v-64ec84e1><p class="code" data-v-64ec84e1>${ssrInterpolate(((_a = unref(theme2).notFound) == null ? void 0 : _a.code) ?? "404")}</p><h1 class="title" data-v-64ec84e1>${ssrInterpolate(((_b = unref(theme2).notFound) == null ? void 0 : _b.title) ?? "PAGE NOT FOUND")}</h1><div class="divider" data-v-64ec84e1></div><blockquote class="quote" data-v-64ec84e1>${ssrInterpolate(((_c = unref(theme2).notFound) == null ? void 0 : _c.quote) ?? "But if you don't change your direction, and if you keep looking, you may end up where you are heading.")}</blockquote><div class="action" data-v-64ec84e1><a class="link"${ssrRenderAttr("href", unref(withBase)(unref(currentLang).link))}${ssrRenderAttr("aria-label", ((_d = unref(theme2).notFound) == null ? void 0 : _d.linkLabel) ?? "go to home")} data-v-64ec84e1>${ssrInterpolate(((_e = unref(theme2).notFound) == null ? void 0 : _e.linkText) ?? "Take me home")}</a></div></div>`);
    };
  }
});
const _sfc_setup$17 = _sfc_main$17.setup;
_sfc_main$17.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/NotFound.vue");
  return _sfc_setup$17 ? _sfc_setup$17(props, ctx) : void 0;
};
const NotFound = /* @__PURE__ */ _export_sfc(_sfc_main$17, [["__scopeId", "data-v-64ec84e1"]]);
function getSidebar(_sidebar, path) {
  if (Array.isArray(_sidebar))
    return addBase(_sidebar);
  if (_sidebar == null)
    return [];
  path = ensureStartingSlash(path);
  const dir = Object.keys(_sidebar).sort((a, b) => {
    return b.split("/").length - a.split("/").length;
  }).find((dir2) => {
    return path.startsWith(ensureStartingSlash(dir2));
  });
  const sidebar = dir ? _sidebar[dir] : [];
  return Array.isArray(sidebar) ? addBase(sidebar) : addBase(sidebar.items, sidebar.base);
}
function getSidebarGroups(sidebar) {
  const groups = [];
  let lastGroupIndex = 0;
  for (const index in sidebar) {
    const item = sidebar[index];
    if (item.items) {
      lastGroupIndex = groups.push(item);
      continue;
    }
    if (!groups[lastGroupIndex]) {
      groups.push({ items: [] });
    }
    groups[lastGroupIndex].items.push(item);
  }
  return groups;
}
function getFlatSideBarLinks(sidebar) {
  const links = [];
  function recursivelyExtractLinks(items) {
    for (const item of items) {
      if (item.text && item.link) {
        links.push({
          text: item.text,
          link: item.link,
          docFooterText: item.docFooterText
        });
      }
      if (item.items) {
        recursivelyExtractLinks(item.items);
      }
    }
  }
  recursivelyExtractLinks(sidebar);
  return links;
}
function hasActiveLink(path, items) {
  if (Array.isArray(items)) {
    return items.some((item) => hasActiveLink(path, item));
  }
  return isActive(path, items.link) ? true : items.items ? hasActiveLink(path, items.items) : false;
}
function addBase(items, _base) {
  return [...items].map((_item) => {
    const item = { ..._item };
    const base = item.base || _base;
    if (base && item.link)
      item.link = base + item.link;
    if (item.items)
      item.items = addBase(item.items, base);
    return item;
  });
}
function useSidebar() {
  const { frontmatter, page, theme: theme2 } = useData();
  const is960 = useMediaQuery("(min-width: 960px)");
  const isOpen = ref(false);
  const _sidebar = computed(() => {
    const sidebarConfig = theme2.value.sidebar;
    const relativePath = page.value.relativePath;
    return sidebarConfig ? getSidebar(sidebarConfig, relativePath) : [];
  });
  const sidebar = ref(_sidebar.value);
  watch(_sidebar, (next, prev) => {
    if (JSON.stringify(next) !== JSON.stringify(prev))
      sidebar.value = _sidebar.value;
  });
  const hasSidebar = computed(() => {
    return frontmatter.value.sidebar !== false && sidebar.value.length > 0 && frontmatter.value.layout !== "home";
  });
  const leftAside = computed(() => {
    if (hasAside)
      return frontmatter.value.aside == null ? theme2.value.aside === "left" : frontmatter.value.aside === "left";
    return false;
  });
  const hasAside = computed(() => {
    if (frontmatter.value.layout === "home")
      return false;
    if (frontmatter.value.aside != null)
      return !!frontmatter.value.aside;
    return theme2.value.aside !== false;
  });
  const isSidebarEnabled = computed(() => hasSidebar.value && is960.value);
  const sidebarGroups = computed(() => {
    return hasSidebar.value ? getSidebarGroups(sidebar.value) : [];
  });
  function open() {
    isOpen.value = true;
  }
  function close() {
    isOpen.value = false;
  }
  function toggle() {
    isOpen.value ? close() : open();
  }
  return {
    isOpen,
    sidebar,
    sidebarGroups,
    hasSidebar,
    hasAside,
    leftAside,
    isSidebarEnabled,
    open,
    close,
    toggle
  };
}
function useCloseSidebarOnEscape(isOpen, close) {
  let triggerElement;
  watchEffect(() => {
    triggerElement = isOpen.value ? document.activeElement : void 0;
  });
  onMounted(() => {
    window.addEventListener("keyup", onEscape);
  });
  onUnmounted(() => {
    window.removeEventListener("keyup", onEscape);
  });
  function onEscape(e) {
    if (e.key === "Escape" && isOpen.value) {
      close();
      triggerElement == null ? void 0 : triggerElement.focus();
    }
  }
}
function useSidebarControl(item) {
  const { page, hash } = useData();
  const collapsed = ref(false);
  const collapsible = computed(() => {
    return item.value.collapsed != null;
  });
  const isLink = computed(() => {
    return !!item.value.link;
  });
  const isActiveLink = ref(false);
  const updateIsActiveLink = () => {
    isActiveLink.value = isActive(page.value.relativePath, item.value.link);
  };
  watch([page, item, hash], updateIsActiveLink);
  onMounted(updateIsActiveLink);
  const hasActiveLink$1 = computed(() => {
    if (isActiveLink.value) {
      return true;
    }
    return item.value.items ? hasActiveLink(page.value.relativePath, item.value.items) : false;
  });
  const hasChildren = computed(() => {
    return !!(item.value.items && item.value.items.length);
  });
  watchEffect(() => {
    collapsed.value = !!(collapsible.value && item.value.collapsed);
  });
  watchPostEffect(() => {
    (isActiveLink.value || hasActiveLink$1.value) && (collapsed.value = false);
  });
  function toggle() {
    if (collapsible.value) {
      collapsed.value = !collapsed.value;
    }
  }
  return {
    collapsed,
    collapsible,
    isLink,
    isActiveLink,
    hasActiveLink: hasActiveLink$1,
    hasChildren,
    toggle
  };
}
function useAside() {
  const { hasSidebar } = useSidebar();
  const is960 = useMediaQuery("(min-width: 960px)");
  const is1280 = useMediaQuery("(min-width: 1280px)");
  const isAsideEnabled = computed(() => {
    if (!is1280.value && !is960.value) {
      return false;
    }
    return hasSidebar.value ? is1280.value : is960.value;
  });
  return {
    isAsideEnabled
  };
}
const ignoreRE = /\b(?:VPBadge|header-anchor|footnote-ref|ignore-header)\b/;
const resolvedHeaders = [];
function resolveTitle(theme2) {
  return typeof theme2.outline === "object" && !Array.isArray(theme2.outline) && theme2.outline.label || theme2.outlineTitle || "On this page";
}
function getHeaders(range) {
  const headers = [
    ...document.querySelectorAll(".VPDoc :where(h1,h2,h3,h4,h5,h6)")
  ].filter((el) => el.id && el.hasChildNodes()).map((el) => {
    const level = Number(el.tagName[1]);
    return {
      element: el,
      title: serializeHeader(el),
      link: "#" + el.id,
      level
    };
  });
  return resolveHeaders(headers, range);
}
function serializeHeader(h2) {
  let ret = "";
  for (const node of h2.childNodes) {
    if (node.nodeType === 1) {
      if (ignoreRE.test(node.className))
        continue;
      ret += node.textContent;
    } else if (node.nodeType === 3) {
      ret += node.textContent;
    }
  }
  return ret.trim();
}
function resolveHeaders(headers, range) {
  if (range === false) {
    return [];
  }
  const levelsRange = (typeof range === "object" && !Array.isArray(range) ? range.level : range) || 2;
  const [high, low] = typeof levelsRange === "number" ? [levelsRange, levelsRange] : levelsRange === "deep" ? [2, 6] : levelsRange;
  return buildTree(headers, high, low);
}
function useActiveAnchor(container, marker) {
  const { isAsideEnabled } = useAside();
  const onScroll = throttleAndDebounce(setActiveLink, 100);
  let prevActiveLink = null;
  onMounted(() => {
    requestAnimationFrame(setActiveLink);
    window.addEventListener("scroll", onScroll);
  });
  onUpdated(() => {
    activateLink(location.hash);
  });
  onUnmounted(() => {
    window.removeEventListener("scroll", onScroll);
  });
  function setActiveLink() {
    if (!isAsideEnabled.value) {
      return;
    }
    const scrollY = window.scrollY;
    const innerHeight = window.innerHeight;
    const offsetHeight = document.body.offsetHeight;
    const isBottom = Math.abs(scrollY + innerHeight - offsetHeight) < 1;
    const headers = resolvedHeaders.map(({ element, link: link2 }) => ({
      link: link2,
      top: getAbsoluteTop(element)
    })).filter(({ top }) => !Number.isNaN(top)).sort((a, b) => a.top - b.top);
    if (!headers.length) {
      activateLink(null);
      return;
    }
    if (scrollY < 1) {
      activateLink(null);
      return;
    }
    if (isBottom) {
      activateLink(headers[headers.length - 1].link);
      return;
    }
    let activeLink = null;
    for (const { link: link2, top } of headers) {
      if (top > scrollY + getScrollOffset() + 4) {
        break;
      }
      activeLink = link2;
    }
    activateLink(activeLink);
  }
  function activateLink(hash) {
    if (prevActiveLink) {
      prevActiveLink.classList.remove("active");
    }
    if (hash == null) {
      prevActiveLink = null;
    } else {
      prevActiveLink = container.value.querySelector(`a[href="${decodeURIComponent(hash)}"]`);
    }
    const activeLink = prevActiveLink;
    if (activeLink) {
      activeLink.classList.add("active");
      marker.value.style.top = activeLink.offsetTop + 39 + "px";
      marker.value.style.opacity = "1";
    } else {
      marker.value.style.top = "33px";
      marker.value.style.opacity = "0";
    }
  }
}
function getAbsoluteTop(element) {
  let offsetTop = 0;
  while (element !== document.body) {
    if (element === null) {
      return NaN;
    }
    offsetTop += element.offsetTop;
    element = element.offsetParent;
  }
  return offsetTop;
}
function buildTree(data, min, max) {
  resolvedHeaders.length = 0;
  const result = [];
  const stack = [];
  data.forEach((item) => {
    const node = { ...item, children: [] };
    let parent = stack[stack.length - 1];
    while (parent && parent.level >= node.level) {
      stack.pop();
      parent = stack[stack.length - 1];
    }
    if (node.element.classList.contains("ignore-header") || parent && "shouldIgnore" in parent) {
      stack.push({ level: node.level, shouldIgnore: true });
      return;
    }
    if (node.level > max || node.level < min)
      return;
    resolvedHeaders.push({ element: node.element, link: node.link });
    if (parent)
      parent.children.push(node);
    else
      result.push(node);
    stack.push(node);
  });
  return result;
}
const _sfc_main$16 = /* @__PURE__ */ defineComponent({
  __name: "VPDocOutlineItem",
  __ssrInlineRender: true,
  props: {
    headers: {},
    root: { type: Boolean }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_VPDocOutlineItem = resolveComponent("VPDocOutlineItem", true);
      _push(`<ul${ssrRenderAttrs(mergeProps({
        class: ["VPDocOutlineItem", __props.root ? "root" : "nested"]
      }, _attrs))} data-v-663b40ec><!--[-->`);
      ssrRenderList(__props.headers, ({ children, link: link2, title }) => {
        _push(`<li data-v-663b40ec><a class="outline-link"${ssrRenderAttr("href", link2)}${ssrRenderAttr("title", title)} data-v-663b40ec>${ssrInterpolate(title)}</a>`);
        if (children == null ? void 0 : children.length) {
          _push(ssrRenderComponent(_component_VPDocOutlineItem, { headers: children }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</li>`);
      });
      _push(`<!--]--></ul>`);
    };
  }
});
const _sfc_setup$16 = _sfc_main$16.setup;
_sfc_main$16.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPDocOutlineItem.vue");
  return _sfc_setup$16 ? _sfc_setup$16(props, ctx) : void 0;
};
const VPDocOutlineItem = /* @__PURE__ */ _export_sfc(_sfc_main$16, [["__scopeId", "data-v-663b40ec"]]);
const _sfc_main$15 = /* @__PURE__ */ defineComponent({
  __name: "VPDocAsideOutline",
  __ssrInlineRender: true,
  setup(__props) {
    const { frontmatter, theme: theme2 } = useData();
    const headers = shallowRef([]);
    onContentUpdated(() => {
      headers.value = getHeaders(frontmatter.value.outline ?? theme2.value.outline);
    });
    const container = ref();
    const marker = ref();
    useActiveAnchor(container, marker);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<nav${ssrRenderAttrs(mergeProps({
        "aria-labelledby": "doc-outline-aria-label",
        class: ["VPDocAsideOutline", { "has-outline": headers.value.length > 0 }],
        ref_key: "container",
        ref: container
      }, _attrs))} data-v-5aafddaf><div class="content" data-v-5aafddaf><div class="outline-marker" data-v-5aafddaf></div><div aria-level="2" class="outline-title" id="doc-outline-aria-label" role="heading" data-v-5aafddaf>${ssrInterpolate(unref(resolveTitle)(unref(theme2)))}</div>`);
      _push(ssrRenderComponent(VPDocOutlineItem, {
        headers: headers.value,
        root: true
      }, null, _parent));
      _push(`</div></nav>`);
    };
  }
});
const _sfc_setup$15 = _sfc_main$15.setup;
_sfc_main$15.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideOutline.vue");
  return _sfc_setup$15 ? _sfc_setup$15(props, ctx) : void 0;
};
const VPDocAsideOutline = /* @__PURE__ */ _export_sfc(_sfc_main$15, [["__scopeId", "data-v-5aafddaf"]]);
const _sfc_main$14 = /* @__PURE__ */ defineComponent({
  __name: "VPDocAsideCarbonAds",
  __ssrInlineRender: true,
  props: {
    carbonAds: {}
  },
  setup(__props) {
    const VPCarbonAds = () => null;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPDocAsideCarbonAds" }, _attrs))}>`);
      _push(ssrRenderComponent(unref(VPCarbonAds), { "carbon-ads": __props.carbonAds }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$14 = _sfc_main$14.setup;
_sfc_main$14.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideCarbonAds.vue");
  return _sfc_setup$14 ? _sfc_setup$14(props, ctx) : void 0;
};
const _sfc_main$13 = /* @__PURE__ */ defineComponent({
  __name: "VPDocAside",
  __ssrInlineRender: true,
  setup(__props) {
    const { theme: theme2 } = useData();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPDocAside" }, _attrs))} data-v-1e8b2da7>`);
      ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push, _parent);
      ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push, _parent);
      _push(ssrRenderComponent(VPDocAsideOutline, null, null, _parent));
      ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push, _parent);
      _push(`<div class="spacer" data-v-1e8b2da7></div>`);
      ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push, _parent);
      if (unref(theme2).carbonAds) {
        _push(ssrRenderComponent(_sfc_main$14, {
          "carbon-ads": unref(theme2).carbonAds
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push, _parent);
      ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup$13 = _sfc_main$13.setup;
_sfc_main$13.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPDocAside.vue");
  return _sfc_setup$13 ? _sfc_setup$13(props, ctx) : void 0;
};
const VPDocAside = /* @__PURE__ */ _export_sfc(_sfc_main$13, [["__scopeId", "data-v-1e8b2da7"]]);
function useEditLink() {
  const { theme: theme2, page } = useData();
  return computed(() => {
    const { text = "Edit this page", pattern = "" } = theme2.value.editLink || {};
    let url;
    if (typeof pattern === "function") {
      url = pattern(page.value);
    } else {
      url = pattern.replace(/:path/g, page.value.filePath);
    }
    return { url, text };
  });
}
function usePrevNext() {
  const { page, theme: theme2, frontmatter } = useData();
  return computed(() => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const sidebar = getSidebar(theme2.value.sidebar, page.value.relativePath);
    const links = getFlatSideBarLinks(sidebar);
    const candidates = uniqBy(links, (link2) => link2.link.replace(/[?#].*$/, ""));
    const index = candidates.findIndex((link2) => {
      return isActive(page.value.relativePath, link2.link);
    });
    const hidePrev = ((_a = theme2.value.docFooter) == null ? void 0 : _a.prev) === false && !frontmatter.value.prev || frontmatter.value.prev === false;
    const hideNext = ((_b = theme2.value.docFooter) == null ? void 0 : _b.next) === false && !frontmatter.value.next || frontmatter.value.next === false;
    return {
      prev: hidePrev ? void 0 : {
        text: (typeof frontmatter.value.prev === "string" ? frontmatter.value.prev : typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.text : void 0) ?? ((_c = candidates[index - 1]) == null ? void 0 : _c.docFooterText) ?? ((_d = candidates[index - 1]) == null ? void 0 : _d.text),
        link: (typeof frontmatter.value.prev === "object" ? frontmatter.value.prev.link : void 0) ?? ((_e = candidates[index - 1]) == null ? void 0 : _e.link)
      },
      next: hideNext ? void 0 : {
        text: (typeof frontmatter.value.next === "string" ? frontmatter.value.next : typeof frontmatter.value.next === "object" ? frontmatter.value.next.text : void 0) ?? ((_f = candidates[index + 1]) == null ? void 0 : _f.docFooterText) ?? ((_g = candidates[index + 1]) == null ? void 0 : _g.text),
        link: (typeof frontmatter.value.next === "object" ? frontmatter.value.next.link : void 0) ?? ((_h = candidates[index + 1]) == null ? void 0 : _h.link)
      }
    };
  });
}
function uniqBy(array, keyFn) {
  const seen = /* @__PURE__ */ new Set();
  return array.filter((item) => {
    const k = keyFn(item);
    return seen.has(k) ? false : seen.add(k);
  });
}
const _sfc_main$12 = /* @__PURE__ */ defineComponent({
  __name: "VPLink",
  __ssrInlineRender: true,
  props: {
    tag: {},
    href: {},
    noIcon: { type: Boolean },
    target: {},
    rel: {}
  },
  setup(__props) {
    const props = __props;
    const tag = computed(() => props.tag ?? (props.href ? "a" : "span"));
    const isExternal2 = computed(
      () => props.href && EXTERNAL_URL_RE.test(props.href) || props.target === "_blank"
    );
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(tag.value), mergeProps({
        class: ["VPLink", {
          link: __props.href,
          "vp-external-link-icon": isExternal2.value,
          "no-icon": __props.noIcon
        }],
        href: __props.href ? unref(normalizeLink$1)(__props.href) : void 0,
        target: __props.target ?? (isExternal2.value ? "_blank" : void 0),
        rel: __props.rel ?? (isExternal2.value ? "noreferrer" : void 0)
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }), _parent);
    };
  }
});
const _sfc_setup$12 = _sfc_main$12.setup;
_sfc_main$12.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPLink.vue");
  return _sfc_setup$12 ? _sfc_setup$12(props, ctx) : void 0;
};
const _sfc_main$11 = /* @__PURE__ */ defineComponent({
  __name: "VPDocFooterLastUpdated",
  __ssrInlineRender: true,
  setup(__props) {
    const { theme: theme2, page, lang } = useData();
    const date = computed(
      () => new Date(page.value.lastUpdated)
    );
    const isoDatetime = computed(() => date.value.toISOString());
    const datetime = ref("");
    onMounted(() => {
      watchEffect(() => {
        var _a, _b, _c;
        datetime.value = new Intl.DateTimeFormat(
          ((_b = (_a = theme2.value.lastUpdated) == null ? void 0 : _a.formatOptions) == null ? void 0 : _b.forceLocale) ? lang.value : void 0,
          ((_c = theme2.value.lastUpdated) == null ? void 0 : _c.formatOptions) ?? {
            dateStyle: "short",
            timeStyle: "short"
          }
        ).format(date.value);
      });
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<p${ssrRenderAttrs(mergeProps({ class: "VPLastUpdated" }, _attrs))} data-v-e668c220>${ssrInterpolate(((_a = unref(theme2).lastUpdated) == null ? void 0 : _a.text) || unref(theme2).lastUpdatedText || "Last updated")}: <time${ssrRenderAttr("datetime", isoDatetime.value)} data-v-e668c220>${ssrInterpolate(datetime.value)}</time></p>`);
    };
  }
});
const _sfc_setup$11 = _sfc_main$11.setup;
_sfc_main$11.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPDocFooterLastUpdated.vue");
  return _sfc_setup$11 ? _sfc_setup$11(props, ctx) : void 0;
};
const VPDocFooterLastUpdated = /* @__PURE__ */ _export_sfc(_sfc_main$11, [["__scopeId", "data-v-e668c220"]]);
const _sfc_main$10 = /* @__PURE__ */ defineComponent({
  __name: "VPDocFooter",
  __ssrInlineRender: true,
  setup(__props) {
    const { theme: theme2, page, frontmatter } = useData();
    const editLink = useEditLink();
    const control = usePrevNext();
    const hasEditLink = computed(
      () => theme2.value.editLink && frontmatter.value.editLink !== false
    );
    const hasLastUpdated = computed(() => page.value.lastUpdated);
    const showFooter = computed(
      () => hasEditLink.value || hasLastUpdated.value || control.value.prev || control.value.next
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      if (showFooter.value) {
        _push(`<footer${ssrRenderAttrs(mergeProps({ class: "VPDocFooter" }, _attrs))} data-v-b1fe8316>`);
        ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push, _parent);
        if (hasEditLink.value || hasLastUpdated.value) {
          _push(`<div class="edit-info" data-v-b1fe8316>`);
          if (hasEditLink.value) {
            _push(`<div class="edit-link" data-v-b1fe8316>`);
            _push(ssrRenderComponent(_sfc_main$12, {
              class: "edit-link-button",
              href: unref(editLink).url,
              "no-icon": true
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span class="vpi-square-pen edit-link-icon" data-v-b1fe8316${_scopeId}></span> ${ssrInterpolate(unref(editLink).text)}`);
                } else {
                  return [
                    createVNode("span", { class: "vpi-square-pen edit-link-icon" }),
                    createTextVNode(" " + toDisplayString(unref(editLink).text), 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          if (hasLastUpdated.value) {
            _push(`<div class="last-updated" data-v-b1fe8316>`);
            _push(ssrRenderComponent(VPDocFooterLastUpdated, null, null, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (((_a = unref(control).prev) == null ? void 0 : _a.link) || ((_b = unref(control).next) == null ? void 0 : _b.link)) {
          _push(`<nav class="prev-next" aria-labelledby="doc-footer-aria-label" data-v-b1fe8316><span class="visually-hidden" id="doc-footer-aria-label" data-v-b1fe8316>Pager</span><div class="pager" data-v-b1fe8316>`);
          if ((_c = unref(control).prev) == null ? void 0 : _c.link) {
            _push(ssrRenderComponent(_sfc_main$12, {
              class: "pager-link prev",
              href: unref(control).prev.link
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                var _a2, _b2;
                if (_push2) {
                  _push2(`<span class="desc" data-v-b1fe8316${_scopeId}>${(((_a2 = unref(theme2).docFooter) == null ? void 0 : _a2.prev) || "Previous page") ?? ""}</span><span class="title" data-v-b1fe8316${_scopeId}>${unref(control).prev.text ?? ""}</span>`);
                } else {
                  return [
                    createVNode("span", {
                      class: "desc",
                      innerHTML: ((_b2 = unref(theme2).docFooter) == null ? void 0 : _b2.prev) || "Previous page"
                    }, null, 8, ["innerHTML"]),
                    createVNode("span", {
                      class: "title",
                      innerHTML: unref(control).prev.text
                    }, null, 8, ["innerHTML"])
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="pager" data-v-b1fe8316>`);
          if ((_d = unref(control).next) == null ? void 0 : _d.link) {
            _push(ssrRenderComponent(_sfc_main$12, {
              class: "pager-link next",
              href: unref(control).next.link
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                var _a2, _b2;
                if (_push2) {
                  _push2(`<span class="desc" data-v-b1fe8316${_scopeId}>${(((_a2 = unref(theme2).docFooter) == null ? void 0 : _a2.next) || "Next page") ?? ""}</span><span class="title" data-v-b1fe8316${_scopeId}>${unref(control).next.text ?? ""}</span>`);
                } else {
                  return [
                    createVNode("span", {
                      class: "desc",
                      innerHTML: ((_b2 = unref(theme2).docFooter) == null ? void 0 : _b2.next) || "Next page"
                    }, null, 8, ["innerHTML"]),
                    createVNode("span", {
                      class: "title",
                      innerHTML: unref(control).next.text
                    }, null, 8, ["innerHTML"])
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div></nav>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</footer>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$10 = _sfc_main$10.setup;
_sfc_main$10.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPDocFooter.vue");
  return _sfc_setup$10 ? _sfc_setup$10(props, ctx) : void 0;
};
const VPDocFooter = /* @__PURE__ */ _export_sfc(_sfc_main$10, [["__scopeId", "data-v-b1fe8316"]]);
const _sfc_main$$ = /* @__PURE__ */ defineComponent({
  __name: "VPDoc",
  __ssrInlineRender: true,
  setup(__props) {
    const { theme: theme2 } = useData();
    const route = useRoute();
    const { hasSidebar, hasAside, leftAside } = useSidebar();
    const pageName = computed(
      () => route.path.replace(/[./]+/g, "_").replace(/_html$/, "")
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Content = resolveComponent("Content");
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["VPDoc", { "has-sidebar": unref(hasSidebar), "has-aside": unref(hasAside) }]
      }, _attrs))} data-v-7914ced5>`);
      ssrRenderSlot(_ctx.$slots, "doc-top", {}, null, _push, _parent);
      _push(`<div class="container" data-v-7914ced5>`);
      if (unref(hasAside)) {
        _push(`<div class="${ssrRenderClass([{ "left-aside": unref(leftAside) }, "aside"])}" data-v-7914ced5><div class="aside-curtain" data-v-7914ced5></div><div class="aside-container" data-v-7914ced5><div class="aside-content" data-v-7914ced5>`);
        _push(ssrRenderComponent(VPDocAside, null, {
          "aside-top": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)
              ];
            }
          }),
          "aside-bottom": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)
              ];
            }
          }),
          "aside-outline-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)
              ];
            }
          }),
          "aside-outline-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)
              ];
            }
          }),
          "aside-ads-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)
              ];
            }
          }),
          "aside-ads-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)
              ];
            }
          }),
          _: 3
        }, _parent));
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="content" data-v-7914ced5><div class="content-container" data-v-7914ced5>`);
      ssrRenderSlot(_ctx.$slots, "doc-before", {}, null, _push, _parent);
      _push(`<main class="main" data-v-7914ced5>`);
      _push(ssrRenderComponent(_component_Content, {
        class: ["vp-doc", [
          pageName.value,
          unref(theme2).externalLinkIcon && "external-link-icon-enabled"
        ]]
      }, null, _parent));
      _push(`</main>`);
      _push(ssrRenderComponent(VPDocFooter, null, {
        "doc-footer-before": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)
            ];
          }
        }),
        _: 3
      }, _parent));
      ssrRenderSlot(_ctx.$slots, "doc-after", {}, null, _push, _parent);
      _push(`</div></div></div>`);
      ssrRenderSlot(_ctx.$slots, "doc-bottom", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup$$ = _sfc_main$$.setup;
_sfc_main$$.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPDoc.vue");
  return _sfc_setup$$ ? _sfc_setup$$(props, ctx) : void 0;
};
const VPDoc = /* @__PURE__ */ _export_sfc(_sfc_main$$, [["__scopeId", "data-v-7914ced5"]]);
const _sfc_main$_ = /* @__PURE__ */ defineComponent({
  __name: "VPButton",
  __ssrInlineRender: true,
  props: {
    tag: {},
    size: { default: "medium" },
    theme: { default: "brand" },
    text: {},
    href: {},
    target: {},
    rel: {}
  },
  setup(__props) {
    const props = __props;
    const isExternal2 = computed(
      () => props.href && EXTERNAL_URL_RE.test(props.href)
    );
    const component = computed(() => {
      return props.tag || (props.href ? "a" : "button");
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(component.value), mergeProps({
        class: ["VPButton", [__props.size, __props.theme]],
        href: __props.href ? unref(normalizeLink$1)(__props.href) : void 0,
        target: props.target ?? (isExternal2.value ? "_blank" : void 0),
        rel: props.rel ?? (isExternal2.value ? "noreferrer" : void 0)
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(__props.text)}`);
          } else {
            return [
              createTextVNode(toDisplayString(__props.text), 1)
            ];
          }
        }),
        _: 1
      }), _parent);
    };
  }
});
const _sfc_setup$_ = _sfc_main$_.setup;
_sfc_main$_.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPButton.vue");
  return _sfc_setup$_ ? _sfc_setup$_(props, ctx) : void 0;
};
const VPButton = /* @__PURE__ */ _export_sfc(_sfc_main$_, [["__scopeId", "data-v-5a7a780a"]]);
const _sfc_main$Z = /* @__PURE__ */ defineComponent({
  ...{ inheritAttrs: false },
  __name: "VPImage",
  __ssrInlineRender: true,
  props: {
    image: {},
    alt: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_VPImage = resolveComponent("VPImage", true);
      if (__props.image) {
        _push(`<!--[-->`);
        if (typeof __props.image === "string" || "src" in __props.image) {
          _push(`<img${ssrRenderAttrs(mergeProps({ class: "VPImage" }, typeof __props.image === "string" ? _ctx.$attrs : { ...__props.image, ..._ctx.$attrs }, {
            src: unref(withBase)(typeof __props.image === "string" ? __props.image : __props.image.src),
            alt: __props.alt ?? (typeof __props.image === "string" ? "" : __props.image.alt || "")
          }))} data-v-359c81ad>`);
        } else {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(_component_VPImage, mergeProps({
            class: "dark",
            image: __props.image.dark,
            alt: __props.image.alt
          }, _ctx.$attrs), null, _parent));
          _push(ssrRenderComponent(_component_VPImage, mergeProps({
            class: "light",
            image: __props.image.light,
            alt: __props.image.alt
          }, _ctx.$attrs), null, _parent));
          _push(`<!--]-->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$Z = _sfc_main$Z.setup;
_sfc_main$Z.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPImage.vue");
  return _sfc_setup$Z ? _sfc_setup$Z(props, ctx) : void 0;
};
const VPImage = /* @__PURE__ */ _export_sfc(_sfc_main$Z, [["__scopeId", "data-v-359c81ad"]]);
const _sfc_main$Y = /* @__PURE__ */ defineComponent({
  __name: "VPHero",
  __ssrInlineRender: true,
  props: {
    name: {},
    text: {},
    tagline: {},
    image: {},
    actions: {}
  },
  setup(__props) {
    const heroImageSlotExists = inject("hero-image-slot-exists");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["VPHero", { "has-image": __props.image || unref(heroImageSlotExists) }]
      }, _attrs))} data-v-e167be43><div class="container" data-v-e167be43><div class="main" data-v-e167be43>`);
      ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push, _parent);
      ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, () => {
        _push(`<h1 class="heading" data-v-e167be43>`);
        if (__props.name) {
          _push(`<span class="name clip" data-v-e167be43>${__props.name ?? ""}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.text) {
          _push(`<span class="text" data-v-e167be43>${__props.text ?? ""}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</h1>`);
        if (__props.tagline) {
          _push(`<p class="tagline" data-v-e167be43>${__props.tagline ?? ""}</p>`);
        } else {
          _push(`<!---->`);
        }
      }, _push, _parent);
      ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push, _parent);
      if (__props.actions) {
        _push(`<div class="actions" data-v-e167be43><!--[-->`);
        ssrRenderList(__props.actions, (action) => {
          _push(`<div class="action" data-v-e167be43>`);
          _push(ssrRenderComponent(VPButton, {
            tag: "a",
            size: "medium",
            theme: action.theme,
            text: action.text,
            href: action.link,
            target: action.target,
            rel: action.rel
          }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push, _parent);
      _push(`</div>`);
      if (__props.image || unref(heroImageSlotExists)) {
        _push(`<div class="image" data-v-e167be43><div class="image-container" data-v-e167be43><div class="image-bg" data-v-e167be43></div>`);
        ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, () => {
          if (__props.image) {
            _push(ssrRenderComponent(VPImage, {
              class: "image-src",
              image: __props.image
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
        }, _push, _parent);
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$Y = _sfc_main$Y.setup;
_sfc_main$Y.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPHero.vue");
  return _sfc_setup$Y ? _sfc_setup$Y(props, ctx) : void 0;
};
const VPHero = /* @__PURE__ */ _export_sfc(_sfc_main$Y, [["__scopeId", "data-v-e167be43"]]);
const _sfc_main$X = /* @__PURE__ */ defineComponent({
  __name: "VPHomeHero",
  __ssrInlineRender: true,
  setup(__props) {
    const { frontmatter: fm } = useData();
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(fm).hero) {
        _push(ssrRenderComponent(VPHero, mergeProps({
          class: "VPHomeHero",
          name: unref(fm).hero.name,
          text: unref(fm).hero.text,
          tagline: unref(fm).hero.tagline,
          image: unref(fm).hero.image,
          actions: unref(fm).hero.actions
        }, _attrs), {
          "home-hero-info-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-info-before")
              ];
            }
          }),
          "home-hero-info": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-info")
              ];
            }
          }),
          "home-hero-info-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-info-after")
              ];
            }
          }),
          "home-hero-actions-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-actions-after")
              ];
            }
          }),
          "home-hero-image": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-image")
              ];
            }
          }),
          _: 3
        }, _parent));
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$X = _sfc_main$X.setup;
_sfc_main$X.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPHomeHero.vue");
  return _sfc_setup$X ? _sfc_setup$X(props, ctx) : void 0;
};
const _sfc_main$W = /* @__PURE__ */ defineComponent({
  __name: "VPFeature",
  __ssrInlineRender: true,
  props: {
    icon: {},
    title: {},
    details: {},
    link: {},
    linkText: {},
    rel: {},
    target: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$12, mergeProps({
        class: "VPFeature",
        href: __props.link,
        rel: __props.rel,
        target: __props.target,
        "no-icon": true,
        tag: __props.link ? "a" : "div"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<article class="box" data-v-5f8b1dac${_scopeId}>`);
            if (typeof __props.icon === "object" && __props.icon.wrap) {
              _push2(`<div class="icon" data-v-5f8b1dac${_scopeId}>`);
              _push2(ssrRenderComponent(VPImage, {
                image: __props.icon,
                alt: __props.icon.alt,
                height: __props.icon.height || 48,
                width: __props.icon.width || 48
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else if (typeof __props.icon === "object") {
              _push2(ssrRenderComponent(VPImage, {
                image: __props.icon,
                alt: __props.icon.alt,
                height: __props.icon.height || 48,
                width: __props.icon.width || 48
              }, null, _parent2, _scopeId));
            } else if (__props.icon) {
              _push2(`<div class="icon" data-v-5f8b1dac${_scopeId}>${__props.icon ?? ""}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<h2 class="title" data-v-5f8b1dac${_scopeId}>${__props.title ?? ""}</h2>`);
            if (__props.details) {
              _push2(`<p class="details" data-v-5f8b1dac${_scopeId}>${__props.details ?? ""}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.linkText) {
              _push2(`<div class="link-text" data-v-5f8b1dac${_scopeId}><p class="link-text-value" data-v-5f8b1dac${_scopeId}>${ssrInterpolate(__props.linkText)} <span class="vpi-arrow-right link-text-icon" data-v-5f8b1dac${_scopeId}></span></p></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</article>`);
          } else {
            return [
              createVNode("article", { class: "box" }, [
                typeof __props.icon === "object" && __props.icon.wrap ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "icon"
                }, [
                  createVNode(VPImage, {
                    image: __props.icon,
                    alt: __props.icon.alt,
                    height: __props.icon.height || 48,
                    width: __props.icon.width || 48
                  }, null, 8, ["image", "alt", "height", "width"])
                ])) : typeof __props.icon === "object" ? (openBlock(), createBlock(VPImage, {
                  key: 1,
                  image: __props.icon,
                  alt: __props.icon.alt,
                  height: __props.icon.height || 48,
                  width: __props.icon.width || 48
                }, null, 8, ["image", "alt", "height", "width"])) : __props.icon ? (openBlock(), createBlock("div", {
                  key: 2,
                  class: "icon",
                  innerHTML: __props.icon
                }, null, 8, ["innerHTML"])) : createCommentVNode("", true),
                createVNode("h2", {
                  class: "title",
                  innerHTML: __props.title
                }, null, 8, ["innerHTML"]),
                __props.details ? (openBlock(), createBlock("p", {
                  key: 3,
                  class: "details",
                  innerHTML: __props.details
                }, null, 8, ["innerHTML"])) : createCommentVNode("", true),
                __props.linkText ? (openBlock(), createBlock("div", {
                  key: 4,
                  class: "link-text"
                }, [
                  createVNode("p", { class: "link-text-value" }, [
                    createTextVNode(toDisplayString(__props.linkText) + " ", 1),
                    createVNode("span", { class: "vpi-arrow-right link-text-icon" })
                  ])
                ])) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$W = _sfc_main$W.setup;
_sfc_main$W.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPFeature.vue");
  return _sfc_setup$W ? _sfc_setup$W(props, ctx) : void 0;
};
const VPFeature = /* @__PURE__ */ _export_sfc(_sfc_main$W, [["__scopeId", "data-v-5f8b1dac"]]);
const _sfc_main$V = /* @__PURE__ */ defineComponent({
  __name: "VPFeatures",
  __ssrInlineRender: true,
  props: {
    features: {}
  },
  setup(__props) {
    const props = __props;
    const grid = computed(() => {
      const length = props.features.length;
      if (!length) {
        return;
      } else if (length === 2) {
        return "grid-2";
      } else if (length === 3) {
        return "grid-3";
      } else if (length % 3 === 0) {
        return "grid-6";
      } else if (length > 3) {
        return "grid-4";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.features) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPFeatures" }, _attrs))} data-v-871c3dee><div class="container" data-v-871c3dee><div class="items" data-v-871c3dee><!--[-->`);
        ssrRenderList(__props.features, (feature) => {
          _push(`<div class="${ssrRenderClass([[grid.value], "item"])}" data-v-871c3dee>`);
          _push(ssrRenderComponent(VPFeature, {
            icon: feature.icon,
            title: feature.title,
            details: feature.details,
            link: feature.link,
            "link-text": feature.linkText,
            rel: feature.rel,
            target: feature.target
          }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$V = _sfc_main$V.setup;
_sfc_main$V.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPFeatures.vue");
  return _sfc_setup$V ? _sfc_setup$V(props, ctx) : void 0;
};
const VPFeatures = /* @__PURE__ */ _export_sfc(_sfc_main$V, [["__scopeId", "data-v-871c3dee"]]);
const _sfc_main$U = /* @__PURE__ */ defineComponent({
  __name: "VPHomeFeatures",
  __ssrInlineRender: true,
  setup(__props) {
    const { frontmatter: fm } = useData();
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(fm).features) {
        _push(ssrRenderComponent(VPFeatures, mergeProps({
          class: "VPHomeFeatures",
          features: unref(fm).features
        }, _attrs), null, _parent));
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$U = _sfc_main$U.setup;
_sfc_main$U.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPHomeFeatures.vue");
  return _sfc_setup$U ? _sfc_setup$U(props, ctx) : void 0;
};
const _sfc_main$T = /* @__PURE__ */ defineComponent({
  __name: "VPHomeContent",
  __ssrInlineRender: true,
  setup(__props) {
    const { width: vw } = useWindowSize({
      initialWidth: 0,
      includeScrollbar: false
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "vp-doc container",
        style: unref(vw) ? { "--vp-offset": `calc(50% - ${unref(vw) / 2}px)` } : {}
      }, _attrs))} data-v-31195447>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup$T = _sfc_main$T.setup;
_sfc_main$T.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPHomeContent.vue");
  return _sfc_setup$T ? _sfc_setup$T(props, ctx) : void 0;
};
const VPHomeContent = /* @__PURE__ */ _export_sfc(_sfc_main$T, [["__scopeId", "data-v-31195447"]]);
const _sfc_main$S = /* @__PURE__ */ defineComponent({
  __name: "VPHome",
  __ssrInlineRender: true,
  setup(__props) {
    const { frontmatter, theme: theme2 } = useData();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Content = resolveComponent("Content");
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["VPHome", {
          "external-link-icon-enabled": unref(theme2).externalLinkIcon
        }]
      }, _attrs))} data-v-da20cff5>`);
      ssrRenderSlot(_ctx.$slots, "home-hero-before", {}, null, _push, _parent);
      _push(ssrRenderComponent(_sfc_main$X, null, {
        "home-hero-info-before": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)
            ];
          }
        }),
        "home-hero-info": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)
            ];
          }
        }),
        "home-hero-info-after": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)
            ];
          }
        }),
        "home-hero-actions-after": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)
            ];
          }
        }),
        "home-hero-image": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)
            ];
          }
        }),
        _: 3
      }, _parent));
      ssrRenderSlot(_ctx.$slots, "home-hero-after", {}, null, _push, _parent);
      ssrRenderSlot(_ctx.$slots, "home-features-before", {}, null, _push, _parent);
      _push(ssrRenderComponent(_sfc_main$U, null, null, _parent));
      ssrRenderSlot(_ctx.$slots, "home-features-after", {}, null, _push, _parent);
      if (unref(frontmatter).markdownStyles !== false) {
        _push(ssrRenderComponent(VPHomeContent, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Content, null, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_Content)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(ssrRenderComponent(_component_Content, null, null, _parent));
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$S = _sfc_main$S.setup;
_sfc_main$S.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPHome.vue");
  return _sfc_setup$S ? _sfc_setup$S(props, ctx) : void 0;
};
const VPHome = /* @__PURE__ */ _export_sfc(_sfc_main$S, [["__scopeId", "data-v-da20cff5"]]);
const _sfc_main$R = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
  const _component_Content = resolveComponent("Content");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPPage" }, _attrs))}>`);
  ssrRenderSlot(_ctx.$slots, "page-top", {}, null, _push, _parent);
  _push(ssrRenderComponent(_component_Content, null, null, _parent));
  ssrRenderSlot(_ctx.$slots, "page-bottom", {}, null, _push, _parent);
  _push(`</div>`);
}
const _sfc_setup$R = _sfc_main$R.setup;
_sfc_main$R.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPPage.vue");
  return _sfc_setup$R ? _sfc_setup$R(props, ctx) : void 0;
};
const VPPage = /* @__PURE__ */ _export_sfc(_sfc_main$R, [["ssrRender", _sfc_ssrRender$1]]);
const _sfc_main$Q = /* @__PURE__ */ defineComponent({
  __name: "VPContent",
  __ssrInlineRender: true,
  setup(__props) {
    const { page, frontmatter } = useData();
    const { hasSidebar } = useSidebar();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["VPContent", {
          "has-sidebar": unref(hasSidebar),
          "is-home": unref(frontmatter).layout === "home"
        }],
        id: "VPContent"
      }, _attrs))} data-v-6d074218>`);
      if (unref(page).isNotFound) {
        ssrRenderSlot(_ctx.$slots, "not-found", {}, () => {
          _push(ssrRenderComponent(NotFound, null, null, _parent));
        }, _push, _parent);
      } else if (unref(frontmatter).layout === "page") {
        _push(ssrRenderComponent(VPPage, null, {
          "page-top": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "page-top", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "page-top", {}, void 0, true)
              ];
            }
          }),
          "page-bottom": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "page-bottom", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "page-bottom", {}, void 0, true)
              ];
            }
          }),
          _: 3
        }, _parent));
      } else if (unref(frontmatter).layout === "home") {
        _push(ssrRenderComponent(VPHome, null, {
          "home-hero-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-before", {}, void 0, true)
              ];
            }
          }),
          "home-hero-info-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)
              ];
            }
          }),
          "home-hero-info": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)
              ];
            }
          }),
          "home-hero-info-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)
              ];
            }
          }),
          "home-hero-actions-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)
              ];
            }
          }),
          "home-hero-image": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)
              ];
            }
          }),
          "home-hero-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-after", {}, void 0, true)
              ];
            }
          }),
          "home-features-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-features-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-features-before", {}, void 0, true)
              ];
            }
          }),
          "home-features-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-features-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-features-after", {}, void 0, true)
              ];
            }
          }),
          _: 3
        }, _parent));
      } else if (unref(frontmatter).layout && unref(frontmatter).layout !== "doc") {
        ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(frontmatter).layout), null, null), _parent);
      } else {
        _push(ssrRenderComponent(VPDoc, null, {
          "doc-top": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "doc-top", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "doc-top", {}, void 0, true)
              ];
            }
          }),
          "doc-bottom": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "doc-bottom", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "doc-bottom", {}, void 0, true)
              ];
            }
          }),
          "doc-footer-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)
              ];
            }
          }),
          "doc-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "doc-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "doc-before", {}, void 0, true)
              ];
            }
          }),
          "doc-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "doc-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "doc-after", {}, void 0, true)
              ];
            }
          }),
          "aside-top": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)
              ];
            }
          }),
          "aside-outline-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)
              ];
            }
          }),
          "aside-outline-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)
              ];
            }
          }),
          "aside-ads-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)
              ];
            }
          }),
          "aside-ads-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)
              ];
            }
          }),
          "aside-bottom": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)
              ];
            }
          }),
          _: 3
        }, _parent));
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$Q = _sfc_main$Q.setup;
_sfc_main$Q.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPContent.vue");
  return _sfc_setup$Q ? _sfc_setup$Q(props, ctx) : void 0;
};
const VPContent = /* @__PURE__ */ _export_sfc(_sfc_main$Q, [["__scopeId", "data-v-6d074218"]]);
const _sfc_main$P = /* @__PURE__ */ defineComponent({
  __name: "VPFooter",
  __ssrInlineRender: true,
  setup(__props) {
    const { theme: theme2, frontmatter } = useData();
    const { hasSidebar } = useSidebar();
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(theme2).footer && unref(frontmatter).footer !== false) {
        _push(`<footer${ssrRenderAttrs(mergeProps({
          class: ["VPFooter", { "has-sidebar": unref(hasSidebar) }]
        }, _attrs))} data-v-56f2ca5c><div class="container" data-v-56f2ca5c>`);
        if (unref(theme2).footer.message) {
          _push(`<p class="message" data-v-56f2ca5c>${unref(theme2).footer.message ?? ""}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(theme2).footer.copyright) {
          _push(`<p class="copyright" data-v-56f2ca5c>${unref(theme2).footer.copyright ?? ""}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></footer>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$P = _sfc_main$P.setup;
_sfc_main$P.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPFooter.vue");
  return _sfc_setup$P ? _sfc_setup$P(props, ctx) : void 0;
};
const VPFooter = /* @__PURE__ */ _export_sfc(_sfc_main$P, [["__scopeId", "data-v-56f2ca5c"]]);
function useLocalNav() {
  const { theme: theme2, frontmatter } = useData();
  const headers = shallowRef([]);
  const hasLocalNav = computed(() => {
    return headers.value.length > 0;
  });
  onContentUpdated(() => {
    headers.value = getHeaders(frontmatter.value.outline ?? theme2.value.outline);
  });
  return {
    headers,
    hasLocalNav
  };
}
const _sfc_main$O = /* @__PURE__ */ defineComponent({
  __name: "VPLocalNavOutlineDropdown",
  __ssrInlineRender: true,
  props: {
    headers: {},
    navHeight: {}
  },
  setup(__props) {
    const { theme: theme2 } = useData();
    const open = ref(false);
    const vh = ref(0);
    const main = ref();
    ref();
    function closeOnClickOutside(e) {
      var _a;
      if (!((_a = main.value) == null ? void 0 : _a.contains(e.target))) {
        open.value = false;
      }
    }
    watch(open, (value) => {
      if (value) {
        document.addEventListener("click", closeOnClickOutside);
        return;
      }
      document.removeEventListener("click", closeOnClickOutside);
    });
    onKeyStroke("Escape", () => {
      open.value = false;
    });
    onContentUpdated(() => {
      open.value = false;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "VPLocalNavOutlineDropdown",
        style: { "--vp-vh": vh.value + "px" },
        ref_key: "main",
        ref: main
      }, _attrs))} data-v-e5a773b5>`);
      if (__props.headers.length > 0) {
        _push(`<button class="${ssrRenderClass({ open: open.value })}" data-v-e5a773b5><span class="menu-text" data-v-e5a773b5>${ssrInterpolate(unref(resolveTitle)(unref(theme2)))}</span><span class="vpi-chevron-right icon" data-v-e5a773b5></span></button>`);
      } else {
        _push(`<button data-v-e5a773b5>${ssrInterpolate(unref(theme2).returnToTopLabel || "Return to top")}</button>`);
      }
      if (open.value) {
        _push(`<div class="items" data-v-e5a773b5><div class="header" data-v-e5a773b5><a class="top-link" href="#" data-v-e5a773b5>${ssrInterpolate(unref(theme2).returnToTopLabel || "Return to top")}</a></div><div class="outline" data-v-e5a773b5>`);
        _push(ssrRenderComponent(VPDocOutlineItem, { headers: __props.headers }, null, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$O = _sfc_main$O.setup;
_sfc_main$O.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPLocalNavOutlineDropdown.vue");
  return _sfc_setup$O ? _sfc_setup$O(props, ctx) : void 0;
};
const VPLocalNavOutlineDropdown = /* @__PURE__ */ _export_sfc(_sfc_main$O, [["__scopeId", "data-v-e5a773b5"]]);
const _sfc_main$N = /* @__PURE__ */ defineComponent({
  __name: "VPLocalNav",
  __ssrInlineRender: true,
  props: {
    open: { type: Boolean }
  },
  emits: ["open-menu"],
  setup(__props) {
    const { theme: theme2, frontmatter } = useData();
    const { hasSidebar } = useSidebar();
    const { headers } = useLocalNav();
    const { y } = useWindowScroll();
    const navHeight = ref(0);
    onMounted(() => {
      navHeight.value = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--vp-nav-height"
        )
      );
    });
    onContentUpdated(() => {
      headers.value = getHeaders(frontmatter.value.outline ?? theme2.value.outline);
    });
    const empty = computed(() => {
      return headers.value.length === 0;
    });
    const emptyAndNoSidebar = computed(() => {
      return empty.value && !hasSidebar.value;
    });
    const classes = computed(() => {
      return {
        VPLocalNav: true,
        "has-sidebar": hasSidebar.value,
        empty: empty.value,
        fixed: emptyAndNoSidebar.value
      };
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(frontmatter).layout !== "home" && (!emptyAndNoSidebar.value || unref(y) >= navHeight.value)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: classes.value }, _attrs))} data-v-d2e7ed88><div class="container" data-v-d2e7ed88>`);
        if (unref(hasSidebar)) {
          _push(`<button class="menu"${ssrRenderAttr("aria-expanded", __props.open)} aria-controls="VPSidebarNav" data-v-d2e7ed88><span class="vpi-align-left menu-icon" data-v-d2e7ed88></span><span class="menu-text" data-v-d2e7ed88>${ssrInterpolate(unref(theme2).sidebarMenuLabel || "Menu")}</span></button>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(VPLocalNavOutlineDropdown, {
          headers: unref(headers),
          navHeight: navHeight.value
        }, null, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$N = _sfc_main$N.setup;
_sfc_main$N.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPLocalNav.vue");
  return _sfc_setup$N ? _sfc_setup$N(props, ctx) : void 0;
};
const VPLocalNav = /* @__PURE__ */ _export_sfc(_sfc_main$N, [["__scopeId", "data-v-d2e7ed88"]]);
function useNav() {
  const isScreenOpen = ref(false);
  function openScreen() {
    isScreenOpen.value = true;
    window.addEventListener("resize", closeScreenOnTabletWindow);
  }
  function closeScreen() {
    isScreenOpen.value = false;
    window.removeEventListener("resize", closeScreenOnTabletWindow);
  }
  function toggleScreen() {
    isScreenOpen.value ? closeScreen() : openScreen();
  }
  function closeScreenOnTabletWindow() {
    window.outerWidth >= 768 && closeScreen();
  }
  const route = useRoute();
  watch(() => route.path, closeScreen);
  return {
    isScreenOpen,
    openScreen,
    closeScreen,
    toggleScreen
  };
}
const _sfc_main$M = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<button${ssrRenderAttrs(mergeProps({
    class: "VPSwitch",
    type: "button",
    role: "switch"
  }, _attrs))} data-v-de59a603><span class="check" data-v-de59a603>`);
  if (_ctx.$slots.default) {
    _push(`<span class="icon" data-v-de59a603>`);
    ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
    _push(`</span>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</span></button>`);
}
const _sfc_setup$M = _sfc_main$M.setup;
_sfc_main$M.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPSwitch.vue");
  return _sfc_setup$M ? _sfc_setup$M(props, ctx) : void 0;
};
const VPSwitch = /* @__PURE__ */ _export_sfc(_sfc_main$M, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-de59a603"]]);
const _sfc_main$L = /* @__PURE__ */ defineComponent({
  __name: "VPSwitchAppearance",
  __ssrInlineRender: true,
  setup(__props) {
    const { isDark, theme: theme2 } = useData();
    const toggleAppearance = inject("toggle-appearance", () => {
      isDark.value = !isDark.value;
    });
    const switchTitle = ref("");
    watchPostEffect(() => {
      switchTitle.value = isDark.value ? theme2.value.lightModeSwitchTitle || "Switch to light theme" : theme2.value.darkModeSwitchTitle || "Switch to dark theme";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(VPSwitch, mergeProps({
        title: switchTitle.value,
        class: "VPSwitchAppearance",
        "aria-checked": unref(isDark),
        onClick: unref(toggleAppearance)
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="vpi-sun sun" data-v-41457f67${_scopeId}></span><span class="vpi-moon moon" data-v-41457f67${_scopeId}></span>`);
          } else {
            return [
              createVNode("span", { class: "vpi-sun sun" }),
              createVNode("span", { class: "vpi-moon moon" })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$L = _sfc_main$L.setup;
_sfc_main$L.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue");
  return _sfc_setup$L ? _sfc_setup$L(props, ctx) : void 0;
};
const VPSwitchAppearance = /* @__PURE__ */ _export_sfc(_sfc_main$L, [["__scopeId", "data-v-41457f67"]]);
const _sfc_main$K = /* @__PURE__ */ defineComponent({
  __name: "VPNavBarAppearance",
  __ssrInlineRender: true,
  setup(__props) {
    const { site } = useData();
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(site).appearance && unref(site).appearance !== "force-dark" && unref(site).appearance !== "force-auto") {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPNavBarAppearance" }, _attrs))} data-v-6f0a72c7>`);
        _push(ssrRenderComponent(VPSwitchAppearance, null, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$K = _sfc_main$K.setup;
_sfc_main$K.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavBarAppearance.vue");
  return _sfc_setup$K ? _sfc_setup$K(props, ctx) : void 0;
};
const VPNavBarAppearance = /* @__PURE__ */ _export_sfc(_sfc_main$K, [["__scopeId", "data-v-6f0a72c7"]]);
const focusedElement = ref();
let active = false;
let listeners = 0;
function useFlyout(options) {
  const focus = ref(false);
  if (inBrowser) {
    !active && activateFocusTracking();
    listeners++;
    const unwatch = watch(focusedElement, (el) => {
      var _a, _b, _c;
      if (el === options.el.value || ((_a = options.el.value) == null ? void 0 : _a.contains(el))) {
        focus.value = true;
        (_b = options.onFocus) == null ? void 0 : _b.call(options);
      } else {
        focus.value = false;
        (_c = options.onBlur) == null ? void 0 : _c.call(options);
      }
    });
    onUnmounted(() => {
      unwatch();
      listeners--;
      if (!listeners) {
        deactivateFocusTracking();
      }
    });
  }
  return readonly(focus);
}
function activateFocusTracking() {
  document.addEventListener("focusin", handleFocusIn);
  active = true;
  focusedElement.value = document.activeElement;
}
function deactivateFocusTracking() {
  document.removeEventListener("focusin", handleFocusIn);
}
function handleFocusIn() {
  focusedElement.value = document.activeElement;
}
const _sfc_main$J = /* @__PURE__ */ defineComponent({
  __name: "VPMenuLink",
  __ssrInlineRender: true,
  props: {
    item: {}
  },
  setup(__props) {
    const { page } = useData();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPMenuLink" }, _attrs))} data-v-b5654ccb>`);
      _push(ssrRenderComponent(_sfc_main$12, {
        class: {
          active: unref(isActive)(
            unref(page).relativePath,
            __props.item.activeMatch || __props.item.link,
            !!__props.item.activeMatch
          )
        },
        href: __props.item.link,
        target: __props.item.target,
        rel: __props.item.rel,
        "no-icon": __props.item.noIcon
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span data-v-b5654ccb${_scopeId}>${__props.item.text ?? ""}</span>`);
          } else {
            return [
              createVNode("span", {
                innerHTML: __props.item.text
              }, null, 8, ["innerHTML"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$J = _sfc_main$J.setup;
_sfc_main$J.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPMenuLink.vue");
  return _sfc_setup$J ? _sfc_setup$J(props, ctx) : void 0;
};
const VPMenuLink = /* @__PURE__ */ _export_sfc(_sfc_main$J, [["__scopeId", "data-v-b5654ccb"]]);
const _sfc_main$I = /* @__PURE__ */ defineComponent({
  __name: "VPMenuGroup",
  __ssrInlineRender: true,
  props: {
    text: {},
    items: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPMenuGroup" }, _attrs))} data-v-395539e4>`);
      if (__props.text) {
        _push(`<p class="title" data-v-395539e4>${ssrInterpolate(__props.text)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(__props.items, (item) => {
        _push(`<!--[-->`);
        if ("link" in item) {
          _push(ssrRenderComponent(VPMenuLink, { item }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$I = _sfc_main$I.setup;
_sfc_main$I.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPMenuGroup.vue");
  return _sfc_setup$I ? _sfc_setup$I(props, ctx) : void 0;
};
const VPMenuGroup = /* @__PURE__ */ _export_sfc(_sfc_main$I, [["__scopeId", "data-v-395539e4"]]);
const _sfc_main$H = /* @__PURE__ */ defineComponent({
  __name: "VPMenu",
  __ssrInlineRender: true,
  props: {
    items: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPMenu" }, _attrs))} data-v-a31df1ad>`);
      if (__props.items) {
        _push(`<div class="items" data-v-a31df1ad><!--[-->`);
        ssrRenderList(__props.items, (item) => {
          _push(`<!--[-->`);
          if ("link" in item) {
            _push(ssrRenderComponent(VPMenuLink, { item }, null, _parent));
          } else if ("component" in item) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props), null), _parent);
          } else {
            _push(ssrRenderComponent(VPMenuGroup, {
              text: item.text,
              items: item.items
            }, null, _parent));
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup$H = _sfc_main$H.setup;
_sfc_main$H.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPMenu.vue");
  return _sfc_setup$H ? _sfc_setup$H(props, ctx) : void 0;
};
const VPMenu = /* @__PURE__ */ _export_sfc(_sfc_main$H, [["__scopeId", "data-v-a31df1ad"]]);
const _sfc_main$G = /* @__PURE__ */ defineComponent({
  __name: "VPFlyout",
  __ssrInlineRender: true,
  props: {
    icon: {},
    button: {},
    label: {},
    items: {}
  },
  setup(__props) {
    const open = ref(false);
    const el = ref();
    useFlyout({ el, onBlur });
    function onBlur() {
      open.value = false;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "VPFlyout",
        ref_key: "el",
        ref: el
      }, _attrs))} data-v-e1fe9462><button type="button" class="button" aria-haspopup="true"${ssrRenderAttr("aria-expanded", open.value)}${ssrRenderAttr("aria-label", __props.label)} data-v-e1fe9462>`);
      if (__props.button || __props.icon) {
        _push(`<span class="text" data-v-e1fe9462>`);
        if (__props.icon) {
          _push(`<span class="${ssrRenderClass([__props.icon, "option-icon"])}" data-v-e1fe9462></span>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.button) {
          _push(`<span data-v-e1fe9462>${__props.button ?? ""}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span class="vpi-chevron-down text-icon" data-v-e1fe9462></span></span>`);
      } else {
        _push(`<span class="vpi-more-horizontal icon" data-v-e1fe9462></span>`);
      }
      _push(`</button><div class="menu" data-v-e1fe9462>`);
      _push(ssrRenderComponent(VPMenu, { items: __props.items }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default", {}, void 0, true)
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$G = _sfc_main$G.setup;
_sfc_main$G.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPFlyout.vue");
  return _sfc_setup$G ? _sfc_setup$G(props, ctx) : void 0;
};
const VPFlyout = /* @__PURE__ */ _export_sfc(_sfc_main$G, [["__scopeId", "data-v-e1fe9462"]]);
const _sfc_main$F = /* @__PURE__ */ defineComponent({
  __name: "VPSocialLink",
  __ssrInlineRender: true,
  props: {
    icon: {},
    link: {},
    ariaLabel: {}
  },
  setup(__props) {
    var _a;
    const props = __props;
    const el = ref();
    onMounted(async () => {
      var _a2;
      await nextTick();
      const span = (_a2 = el.value) == null ? void 0 : _a2.children[0];
      if (span instanceof HTMLElement && span.className.startsWith("vpi-social-") && (getComputedStyle(span).maskImage || getComputedStyle(span).webkitMaskImage) === "none") {
        span.style.setProperty(
          "--icon",
          `url('https://api.iconify.design/simple-icons/${props.icon}.svg')`
        );
      }
    });
    const svg = computed(() => {
      if (typeof props.icon === "object") return props.icon.svg;
      return `<span class="vpi-social-${props.icon}"></span>`;
    });
    {
      typeof props.icon === "string" && ((_a = useSSRContext()) == null ? void 0 : _a.vpSocialIcons.add(props.icon));
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<a${ssrRenderAttrs(mergeProps({
        ref_key: "el",
        ref: el,
        class: "VPSocialLink no-icon",
        href: __props.link,
        "aria-label": __props.ariaLabel ?? (typeof __props.icon === "string" ? __props.icon : ""),
        target: "_blank",
        rel: "noopener"
      }, _attrs))} data-v-048a1cfa>${svg.value ?? ""}</a>`);
    };
  }
});
const _sfc_setup$F = _sfc_main$F.setup;
_sfc_main$F.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPSocialLink.vue");
  return _sfc_setup$F ? _sfc_setup$F(props, ctx) : void 0;
};
const VPSocialLink = /* @__PURE__ */ _export_sfc(_sfc_main$F, [["__scopeId", "data-v-048a1cfa"]]);
const _sfc_main$E = /* @__PURE__ */ defineComponent({
  __name: "VPSocialLinks",
  __ssrInlineRender: true,
  props: {
    links: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPSocialLinks" }, _attrs))} data-v-b854c0cb><!--[-->`);
      ssrRenderList(__props.links, ({ link: link2, icon, ariaLabel }) => {
        _push(ssrRenderComponent(VPSocialLink, {
          key: link2,
          icon,
          link: link2,
          ariaLabel
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$E = _sfc_main$E.setup;
_sfc_main$E.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPSocialLinks.vue");
  return _sfc_setup$E ? _sfc_setup$E(props, ctx) : void 0;
};
const VPSocialLinks = /* @__PURE__ */ _export_sfc(_sfc_main$E, [["__scopeId", "data-v-b854c0cb"]]);
const _sfc_main$D = /* @__PURE__ */ defineComponent({
  __name: "VPNavBarExtra",
  __ssrInlineRender: true,
  setup(__props) {
    const { site, theme: theme2 } = useData();
    const { localeLinks, currentLang } = useLangs({ correspondingLink: true });
    const hasExtraContent = computed(
      () => localeLinks.value.length && currentLang.value.label || site.value.appearance || theme2.value.socialLinks
    );
    return (_ctx, _push, _parent, _attrs) => {
      if (hasExtraContent.value) {
        _push(ssrRenderComponent(VPFlyout, mergeProps({
          class: "VPNavBarExtra",
          label: "extra navigation"
        }, _attrs), {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(localeLinks).length && unref(currentLang).label) {
                _push2(`<div class="group translations" data-v-85141c91${_scopeId}><p class="trans-title" data-v-85141c91${_scopeId}>${ssrInterpolate(unref(currentLang).label)}</p><!--[-->`);
                ssrRenderList(unref(localeLinks), (locale) => {
                  _push2(ssrRenderComponent(VPMenuLink, { item: locale }, null, _parent2, _scopeId));
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(site).appearance && unref(site).appearance !== "force-dark" && unref(site).appearance !== "force-auto") {
                _push2(`<div class="group" data-v-85141c91${_scopeId}><div class="item appearance" data-v-85141c91${_scopeId}><p class="label" data-v-85141c91${_scopeId}>${ssrInterpolate(unref(theme2).darkModeSwitchLabel || "Appearance")}</p><div class="appearance-action" data-v-85141c91${_scopeId}>`);
                _push2(ssrRenderComponent(VPSwitchAppearance, null, null, _parent2, _scopeId));
                _push2(`</div></div></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(theme2).socialLinks) {
                _push2(`<div class="group" data-v-85141c91${_scopeId}><div class="item social-links" data-v-85141c91${_scopeId}>`);
                _push2(ssrRenderComponent(VPSocialLinks, {
                  class: "social-links-list",
                  links: unref(theme2).socialLinks
                }, null, _parent2, _scopeId));
                _push2(`</div></div>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                unref(localeLinks).length && unref(currentLang).label ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "group translations"
                }, [
                  createVNode("p", { class: "trans-title" }, toDisplayString(unref(currentLang).label), 1),
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(localeLinks), (locale) => {
                    return openBlock(), createBlock(VPMenuLink, {
                      key: locale.link,
                      item: locale
                    }, null, 8, ["item"]);
                  }), 128))
                ])) : createCommentVNode("", true),
                unref(site).appearance && unref(site).appearance !== "force-dark" && unref(site).appearance !== "force-auto" ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "group"
                }, [
                  createVNode("div", { class: "item appearance" }, [
                    createVNode("p", { class: "label" }, toDisplayString(unref(theme2).darkModeSwitchLabel || "Appearance"), 1),
                    createVNode("div", { class: "appearance-action" }, [
                      createVNode(VPSwitchAppearance)
                    ])
                  ])
                ])) : createCommentVNode("", true),
                unref(theme2).socialLinks ? (openBlock(), createBlock("div", {
                  key: 2,
                  class: "group"
                }, [
                  createVNode("div", { class: "item social-links" }, [
                    createVNode(VPSocialLinks, {
                      class: "social-links-list",
                      links: unref(theme2).socialLinks
                    }, null, 8, ["links"])
                  ])
                ])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$D = _sfc_main$D.setup;
_sfc_main$D.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavBarExtra.vue");
  return _sfc_setup$D ? _sfc_setup$D(props, ctx) : void 0;
};
const VPNavBarExtra = /* @__PURE__ */ _export_sfc(_sfc_main$D, [["__scopeId", "data-v-85141c91"]]);
const _sfc_main$C = /* @__PURE__ */ defineComponent({
  __name: "VPNavBarHamburger",
  __ssrInlineRender: true,
  props: {
    active: { type: Boolean }
  },
  emits: ["click"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<button${ssrRenderAttrs(mergeProps({
        type: "button",
        class: ["VPNavBarHamburger", { active: __props.active }],
        "aria-label": "mobile navigation",
        "aria-expanded": __props.active,
        "aria-controls": "VPNavScreen"
      }, _attrs))} data-v-62a10cce><span class="container" data-v-62a10cce><span class="top" data-v-62a10cce></span><span class="middle" data-v-62a10cce></span><span class="bottom" data-v-62a10cce></span></span></button>`);
    };
  }
});
const _sfc_setup$C = _sfc_main$C.setup;
_sfc_main$C.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavBarHamburger.vue");
  return _sfc_setup$C ? _sfc_setup$C(props, ctx) : void 0;
};
const VPNavBarHamburger = /* @__PURE__ */ _export_sfc(_sfc_main$C, [["__scopeId", "data-v-62a10cce"]]);
const _sfc_main$B = /* @__PURE__ */ defineComponent({
  __name: "VPNavBarMenuLink",
  __ssrInlineRender: true,
  props: {
    item: {}
  },
  setup(__props) {
    const { page } = useData();
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$12, mergeProps({
        class: {
          VPNavBarMenuLink: true,
          active: unref(isActive)(
            unref(page).relativePath,
            __props.item.activeMatch || __props.item.link,
            !!__props.item.activeMatch
          )
        },
        href: __props.item.link,
        target: __props.item.target,
        rel: __props.item.rel,
        "no-icon": __props.item.noIcon,
        tabindex: "0"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span data-v-b5bc24c2${_scopeId}>${__props.item.text ?? ""}</span>`);
          } else {
            return [
              createVNode("span", {
                innerHTML: __props.item.text
              }, null, 8, ["innerHTML"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$B = _sfc_main$B.setup;
_sfc_main$B.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenuLink.vue");
  return _sfc_setup$B ? _sfc_setup$B(props, ctx) : void 0;
};
const VPNavBarMenuLink = /* @__PURE__ */ _export_sfc(_sfc_main$B, [["__scopeId", "data-v-b5bc24c2"]]);
const _sfc_main$A = /* @__PURE__ */ defineComponent({
  __name: "VPNavBarMenuGroup",
  __ssrInlineRender: true,
  props: {
    item: {}
  },
  setup(__props) {
    const props = __props;
    const { page } = useData();
    const isChildActive = (navItem) => {
      if ("component" in navItem) return false;
      if ("link" in navItem) {
        return isActive(
          page.value.relativePath,
          navItem.link,
          !!props.item.activeMatch
        );
      }
      return navItem.items.some(isChildActive);
    };
    const childrenActive = computed(() => isChildActive(props.item));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(VPFlyout, mergeProps({
        class: {
          VPNavBarMenuGroup: true,
          active: unref(isActive)(unref(page).relativePath, __props.item.activeMatch, !!__props.item.activeMatch) || childrenActive.value
        },
        button: __props.item.text,
        items: __props.item.items
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup$A = _sfc_main$A.setup;
_sfc_main$A.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenuGroup.vue");
  return _sfc_setup$A ? _sfc_setup$A(props, ctx) : void 0;
};
const _sfc_main$z = /* @__PURE__ */ defineComponent({
  __name: "VPNavBarMenu",
  __ssrInlineRender: true,
  setup(__props) {
    const { theme: theme2 } = useData();
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(theme2).nav) {
        _push(`<nav${ssrRenderAttrs(mergeProps({
          "aria-labelledby": "main-nav-aria-label",
          class: "VPNavBarMenu"
        }, _attrs))} data-v-b5c2a901><span id="main-nav-aria-label" class="visually-hidden" data-v-b5c2a901> Main Navigation </span><!--[-->`);
        ssrRenderList(unref(theme2).nav, (item) => {
          _push(`<!--[-->`);
          if ("link" in item) {
            _push(ssrRenderComponent(VPNavBarMenuLink, { item }, null, _parent));
          } else if ("component" in item) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props), null), _parent);
          } else {
            _push(ssrRenderComponent(_sfc_main$A, { item }, null, _parent));
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]--></nav>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$z = _sfc_main$z.setup;
_sfc_main$z.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavBarMenu.vue");
  return _sfc_setup$z ? _sfc_setup$z(props, ctx) : void 0;
};
const VPNavBarMenu = /* @__PURE__ */ _export_sfc(_sfc_main$z, [["__scopeId", "data-v-b5c2a901"]]);
function createSearchTranslate(defaultTranslations) {
  const { localeIndex, theme: theme2 } = useData();
  function translate(key) {
    var _a, _b, _c;
    const keyPath = key.split(".");
    const themeObject = (_a = theme2.value.search) == null ? void 0 : _a.options;
    const isObject = themeObject && typeof themeObject === "object";
    const locales = isObject && ((_c = (_b = themeObject.locales) == null ? void 0 : _b[localeIndex.value]) == null ? void 0 : _c.translations) || null;
    const translations = isObject && themeObject.translations || null;
    let localeResult = locales;
    let translationResult = translations;
    let defaultResult = defaultTranslations;
    const lastKey = keyPath.pop();
    for (const k of keyPath) {
      let fallbackResult = null;
      const foundInFallback = defaultResult == null ? void 0 : defaultResult[k];
      if (foundInFallback) {
        fallbackResult = defaultResult = foundInFallback;
      }
      const foundInTranslation = translationResult == null ? void 0 : translationResult[k];
      if (foundInTranslation) {
        fallbackResult = translationResult = foundInTranslation;
      }
      const foundInLocale = localeResult == null ? void 0 : localeResult[k];
      if (foundInLocale) {
        fallbackResult = localeResult = foundInLocale;
      }
      if (!foundInFallback) {
        defaultResult = fallbackResult;
      }
      if (!foundInTranslation) {
        translationResult = fallbackResult;
      }
      if (!foundInLocale) {
        localeResult = fallbackResult;
      }
    }
    return (localeResult == null ? void 0 : localeResult[lastKey]) ?? (translationResult == null ? void 0 : translationResult[lastKey]) ?? (defaultResult == null ? void 0 : defaultResult[lastKey]) ?? "";
  }
  return translate;
}
const _sfc_main$y = /* @__PURE__ */ defineComponent({
  __name: "VPNavBarSearchButton",
  __ssrInlineRender: true,
  setup(__props) {
    const defaultTranslations = {
      button: {
        buttonText: "Search",
        buttonAriaLabel: "Search"
      }
    };
    const translate = createSearchTranslate(defaultTranslations);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<button${ssrRenderAttrs(mergeProps({
        type: "button",
        class: "DocSearch DocSearch-Button",
        "aria-label": unref(translate)("button.buttonAriaLabel")
      }, _attrs))}><span class="DocSearch-Button-Container"><span class="vp-icon DocSearch-Search-Icon"></span><span class="DocSearch-Button-Placeholder">${ssrInterpolate(unref(translate)("button.buttonText"))}</span></span><span class="DocSearch-Button-Keys"><kbd class="DocSearch-Button-Key"></kbd><kbd class="DocSearch-Button-Key">K</kbd></span></button>`);
    };
  }
});
const _sfc_setup$y = _sfc_main$y.setup;
_sfc_main$y.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearchButton.vue");
  return _sfc_setup$y ? _sfc_setup$y(props, ctx) : void 0;
};
const _sfc_main$x = /* @__PURE__ */ defineComponent({
  __name: "VPNavBarSearch",
  __ssrInlineRender: true,
  setup(__props) {
    const VPLocalSearchBox = defineAsyncComponent(() => import("./VPLocalSearchBox.CHutBmzi.js"));
    const VPAlgoliaSearchBox = () => null;
    const { theme: theme2 } = useData();
    const loaded = ref(false);
    const actuallyLoaded = ref(false);
    onMounted(() => {
      {
        return;
      }
    });
    function load() {
      if (!loaded.value) {
        loaded.value = true;
        setTimeout(poll, 16);
      }
    }
    function poll() {
      const e = new Event("keydown");
      e.key = "k";
      e.metaKey = true;
      window.dispatchEvent(e);
      setTimeout(() => {
        if (!document.querySelector(".DocSearch-Modal")) {
          poll();
        }
      }, 16);
    }
    function isEditingContent(event) {
      const element = event.target;
      const tagName = element.tagName;
      return element.isContentEditable || tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA";
    }
    const showSearch = ref(false);
    {
      onKeyStroke("k", (event) => {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          showSearch.value = true;
        }
      });
      onKeyStroke("/", (event) => {
        if (!isEditingContent(event)) {
          event.preventDefault();
          showSearch.value = true;
        }
      });
    }
    const provider = "local";
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPNavBarSearch" }, _attrs))}>`);
      if (unref(provider) === "local") {
        _push(`<!--[-->`);
        if (showSearch.value) {
          _push(ssrRenderComponent(unref(VPLocalSearchBox), {
            onClose: ($event) => showSearch.value = false
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<div id="local-search">`);
        _push(ssrRenderComponent(_sfc_main$y, {
          onClick: ($event) => showSearch.value = true
        }, null, _parent));
        _push(`</div><!--]-->`);
      } else if (unref(provider) === "algolia") {
        _push(`<!--[-->`);
        if (loaded.value) {
          _push(ssrRenderComponent(unref(VPAlgoliaSearchBox), {
            algolia: ((_a = unref(theme2).search) == null ? void 0 : _a.options) ?? unref(theme2).algolia,
            onVnodeBeforeMount: ($event) => actuallyLoaded.value = true
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (!actuallyLoaded.value) {
          _push(`<div id="docsearch">`);
          _push(ssrRenderComponent(_sfc_main$y, { onClick: load }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$x = _sfc_main$x.setup;
_sfc_main$x.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSearch.vue");
  return _sfc_setup$x ? _sfc_setup$x(props, ctx) : void 0;
};
const _sfc_main$w = /* @__PURE__ */ defineComponent({
  __name: "VPNavBarSocialLinks",
  __ssrInlineRender: true,
  setup(__props) {
    const { theme: theme2 } = useData();
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(theme2).socialLinks) {
        _push(ssrRenderComponent(VPSocialLinks, mergeProps({
          class: "VPNavBarSocialLinks",
          links: unref(theme2).socialLinks
        }, _attrs), null, _parent));
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$w = _sfc_main$w.setup;
_sfc_main$w.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavBarSocialLinks.vue");
  return _sfc_setup$w ? _sfc_setup$w(props, ctx) : void 0;
};
const VPNavBarSocialLinks = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["__scopeId", "data-v-be4f8634"]]);
const _sfc_main$v = /* @__PURE__ */ defineComponent({
  __name: "VPNavBarTitle",
  __ssrInlineRender: true,
  setup(__props) {
    const { site, theme: theme2 } = useData();
    const { hasSidebar } = useSidebar();
    const { currentLang } = useLangs();
    const link2 = computed(
      () => {
        var _a;
        return typeof theme2.value.logoLink === "string" ? theme2.value.logoLink : (_a = theme2.value.logoLink) == null ? void 0 : _a.link;
      }
    );
    const rel = computed(
      () => {
        var _a;
        return typeof theme2.value.logoLink === "string" ? void 0 : (_a = theme2.value.logoLink) == null ? void 0 : _a.rel;
      }
    );
    const target = computed(
      () => {
        var _a;
        return typeof theme2.value.logoLink === "string" ? void 0 : (_a = theme2.value.logoLink) == null ? void 0 : _a.target;
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["VPNavBarTitle", { "has-sidebar": unref(hasSidebar) }]
      }, _attrs))} data-v-7642aea1><a class="title"${ssrRenderAttr("href", link2.value ?? unref(normalizeLink$1)(unref(currentLang).link))}${ssrRenderAttr("rel", rel.value)}${ssrRenderAttr("target", target.value)} data-v-7642aea1>`);
      ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push, _parent);
      if (unref(theme2).logo) {
        _push(ssrRenderComponent(VPImage, {
          class: "logo",
          image: unref(theme2).logo
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(theme2).siteTitle) {
        _push(`<span data-v-7642aea1>${unref(theme2).siteTitle ?? ""}</span>`);
      } else if (unref(theme2).siteTitle === void 0) {
        _push(`<span data-v-7642aea1>${ssrInterpolate(unref(site).title)}</span>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push, _parent);
      _push(`</a></div>`);
    };
  }
});
const _sfc_setup$v = _sfc_main$v.setup;
_sfc_main$v.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTitle.vue");
  return _sfc_setup$v ? _sfc_setup$v(props, ctx) : void 0;
};
const VPNavBarTitle = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["__scopeId", "data-v-7642aea1"]]);
const _sfc_main$u = /* @__PURE__ */ defineComponent({
  __name: "VPNavBarTranslations",
  __ssrInlineRender: true,
  setup(__props) {
    const { theme: theme2 } = useData();
    const { localeLinks, currentLang } = useLangs({ correspondingLink: true });
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(localeLinks).length && unref(currentLang).label) {
        _push(ssrRenderComponent(VPFlyout, mergeProps({
          class: "VPNavBarTranslations",
          icon: "vpi-languages",
          label: unref(theme2).langMenuLabel || "Change language"
        }, _attrs), {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="items" data-v-2db5e1c8${_scopeId}><p class="title" data-v-2db5e1c8${_scopeId}>${ssrInterpolate(unref(currentLang).label)}</p><!--[-->`);
              ssrRenderList(unref(localeLinks), (locale) => {
                _push2(ssrRenderComponent(VPMenuLink, { item: locale }, null, _parent2, _scopeId));
              });
              _push2(`<!--]--></div>`);
            } else {
              return [
                createVNode("div", { class: "items" }, [
                  createVNode("p", { class: "title" }, toDisplayString(unref(currentLang).label), 1),
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(localeLinks), (locale) => {
                    return openBlock(), createBlock(VPMenuLink, {
                      key: locale.link,
                      item: locale
                    }, null, 8, ["item"]);
                  }), 128))
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$u = _sfc_main$u.setup;
_sfc_main$u.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavBarTranslations.vue");
  return _sfc_setup$u ? _sfc_setup$u(props, ctx) : void 0;
};
const VPNavBarTranslations = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["__scopeId", "data-v-2db5e1c8"]]);
const _sfc_main$t = /* @__PURE__ */ defineComponent({
  __name: "VPNavBar",
  __ssrInlineRender: true,
  props: {
    isScreenOpen: { type: Boolean }
  },
  emits: ["toggle-screen"],
  setup(__props) {
    const props = __props;
    const { y } = useWindowScroll();
    const { hasSidebar } = useSidebar();
    const { frontmatter } = useData();
    const classes = ref({});
    watchPostEffect(() => {
      classes.value = {
        "has-sidebar": hasSidebar.value,
        "home": frontmatter.value.layout === "home",
        "top": y.value === 0,
        "screen-open": props.isScreenOpen
      };
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["VPNavBar", classes.value]
      }, _attrs))} data-v-e05d3b6e><div class="wrapper" data-v-e05d3b6e><div class="container" data-v-e05d3b6e><div class="title" data-v-e05d3b6e>`);
      _push(ssrRenderComponent(VPNavBarTitle, null, {
        "nav-bar-title-before": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)
            ];
          }
        }),
        "nav-bar-title-after": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(`</div><div class="content" data-v-e05d3b6e><div class="content-body" data-v-e05d3b6e>`);
      ssrRenderSlot(_ctx.$slots, "nav-bar-content-before", {}, null, _push, _parent);
      _push(ssrRenderComponent(_sfc_main$x, { class: "search" }, null, _parent));
      _push(ssrRenderComponent(VPNavBarMenu, { class: "menu" }, null, _parent));
      _push(ssrRenderComponent(VPNavBarTranslations, { class: "translations" }, null, _parent));
      _push(ssrRenderComponent(VPNavBarAppearance, { class: "appearance" }, null, _parent));
      _push(ssrRenderComponent(VPNavBarSocialLinks, { class: "social-links" }, null, _parent));
      _push(ssrRenderComponent(VPNavBarExtra, { class: "extra" }, null, _parent));
      ssrRenderSlot(_ctx.$slots, "nav-bar-content-after", {}, null, _push, _parent);
      _push(ssrRenderComponent(VPNavBarHamburger, {
        class: "hamburger",
        active: __props.isScreenOpen,
        onClick: ($event) => _ctx.$emit("toggle-screen")
      }, null, _parent));
      _push(`</div></div></div></div><div class="divider" data-v-e05d3b6e><div class="divider-line" data-v-e05d3b6e></div></div></div>`);
    };
  }
});
const _sfc_setup$t = _sfc_main$t.setup;
_sfc_main$t.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavBar.vue");
  return _sfc_setup$t ? _sfc_setup$t(props, ctx) : void 0;
};
const VPNavBar = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["__scopeId", "data-v-e05d3b6e"]]);
const _sfc_main$s = /* @__PURE__ */ defineComponent({
  __name: "VPNavScreenAppearance",
  __ssrInlineRender: true,
  setup(__props) {
    const { site, theme: theme2 } = useData();
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(site).appearance && unref(site).appearance !== "force-dark" && unref(site).appearance !== "force-auto") {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPNavScreenAppearance" }, _attrs))} data-v-0406ca40><p class="text" data-v-0406ca40>${ssrInterpolate(unref(theme2).darkModeSwitchLabel || "Appearance")}</p>`);
        _push(ssrRenderComponent(VPSwitchAppearance, null, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$s = _sfc_main$s.setup;
_sfc_main$s.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenAppearance.vue");
  return _sfc_setup$s ? _sfc_setup$s(props, ctx) : void 0;
};
const VPNavScreenAppearance = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["__scopeId", "data-v-0406ca40"]]);
const _sfc_main$r = /* @__PURE__ */ defineComponent({
  __name: "VPNavScreenMenuLink",
  __ssrInlineRender: true,
  props: {
    item: {}
  },
  setup(__props) {
    const closeScreen = inject("close-screen");
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$12, mergeProps({
        class: "VPNavScreenMenuLink",
        href: __props.item.link,
        target: __props.item.target,
        rel: __props.item.rel,
        "no-icon": __props.item.noIcon,
        onClick: unref(closeScreen)
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span data-v-a65bbf11${_scopeId}>${__props.item.text ?? ""}</span>`);
          } else {
            return [
              createVNode("span", {
                innerHTML: __props.item.text
              }, null, 8, ["innerHTML"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$r = _sfc_main$r.setup;
_sfc_main$r.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuLink.vue");
  return _sfc_setup$r ? _sfc_setup$r(props, ctx) : void 0;
};
const VPNavScreenMenuLink = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["__scopeId", "data-v-a65bbf11"]]);
const _sfc_main$q = /* @__PURE__ */ defineComponent({
  __name: "VPNavScreenMenuGroupLink",
  __ssrInlineRender: true,
  props: {
    item: {}
  },
  setup(__props) {
    const closeScreen = inject("close-screen");
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$12, mergeProps({
        class: "VPNavScreenMenuGroupLink",
        href: __props.item.link,
        target: __props.item.target,
        rel: __props.item.rel,
        "no-icon": __props.item.noIcon,
        onClick: unref(closeScreen)
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span data-v-41427faa${_scopeId}>${__props.item.text ?? ""}</span>`);
          } else {
            return [
              createVNode("span", {
                innerHTML: __props.item.text
              }, null, 8, ["innerHTML"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$q = _sfc_main$q.setup;
_sfc_main$q.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupLink.vue");
  return _sfc_setup$q ? _sfc_setup$q(props, ctx) : void 0;
};
const VPNavScreenMenuGroupLink = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["__scopeId", "data-v-41427faa"]]);
const _sfc_main$p = /* @__PURE__ */ defineComponent({
  __name: "VPNavScreenMenuGroupSection",
  __ssrInlineRender: true,
  props: {
    text: {},
    items: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPNavScreenMenuGroupSection" }, _attrs))} data-v-2276e7b7>`);
      if (__props.text) {
        _push(`<p class="title" data-v-2276e7b7>${ssrInterpolate(__props.text)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(__props.items, (item) => {
        _push(ssrRenderComponent(VPNavScreenMenuGroupLink, {
          key: item.text,
          item
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$p = _sfc_main$p.setup;
_sfc_main$p.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroupSection.vue");
  return _sfc_setup$p ? _sfc_setup$p(props, ctx) : void 0;
};
const VPNavScreenMenuGroupSection = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["__scopeId", "data-v-2276e7b7"]]);
const _sfc_main$o = /* @__PURE__ */ defineComponent({
  __name: "VPNavScreenMenuGroup",
  __ssrInlineRender: true,
  props: {
    text: {},
    items: {}
  },
  setup(__props) {
    const props = __props;
    const isOpen = ref(false);
    const groupId = computed(
      () => `NavScreenGroup-${props.text.replace(" ", "-").toLowerCase()}`
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["VPNavScreenMenuGroup", { open: isOpen.value }]
      }, _attrs))} data-v-7547801e><button class="button"${ssrRenderAttr("aria-controls", groupId.value)}${ssrRenderAttr("aria-expanded", isOpen.value)} data-v-7547801e><span class="button-text" data-v-7547801e>${__props.text ?? ""}</span><span class="vpi-plus button-icon" data-v-7547801e></span></button><div${ssrRenderAttr("id", groupId.value)} class="items" data-v-7547801e><!--[-->`);
      ssrRenderList(__props.items, (item) => {
        _push(`<!--[-->`);
        if ("link" in item) {
          _push(`<div class="item" data-v-7547801e>`);
          _push(ssrRenderComponent(VPNavScreenMenuGroupLink, { item }, null, _parent));
          _push(`</div>`);
        } else if ("component" in item) {
          _push(`<div class="item" data-v-7547801e>`);
          ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props, { "screen-menu": "" }), null), _parent);
          _push(`</div>`);
        } else {
          _push(`<div class="group" data-v-7547801e>`);
          _push(ssrRenderComponent(VPNavScreenMenuGroupSection, {
            text: item.text,
            items: item.items
          }, null, _parent));
          _push(`</div>`);
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup$o = _sfc_main$o.setup;
_sfc_main$o.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenuGroup.vue");
  return _sfc_setup$o ? _sfc_setup$o(props, ctx) : void 0;
};
const VPNavScreenMenuGroup = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["__scopeId", "data-v-7547801e"]]);
const _sfc_main$n = /* @__PURE__ */ defineComponent({
  __name: "VPNavScreenMenu",
  __ssrInlineRender: true,
  setup(__props) {
    const { theme: theme2 } = useData();
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(theme2).nav) {
        _push(`<nav${ssrRenderAttrs(mergeProps({ class: "VPNavScreenMenu" }, _attrs))}><!--[-->`);
        ssrRenderList(unref(theme2).nav, (item) => {
          _push(`<!--[-->`);
          if ("link" in item) {
            _push(ssrRenderComponent(VPNavScreenMenuLink, { item }, null, _parent));
          } else if ("component" in item) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.props, { "screen-menu": "" }), null), _parent);
          } else {
            _push(ssrRenderComponent(VPNavScreenMenuGroup, {
              text: item.text || "",
              items: item.items
            }, null, _parent));
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]--></nav>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$n = _sfc_main$n.setup;
_sfc_main$n.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenMenu.vue");
  return _sfc_setup$n ? _sfc_setup$n(props, ctx) : void 0;
};
const _sfc_main$m = /* @__PURE__ */ defineComponent({
  __name: "VPNavScreenSocialLinks",
  __ssrInlineRender: true,
  setup(__props) {
    const { theme: theme2 } = useData();
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(theme2).socialLinks) {
        _push(ssrRenderComponent(VPSocialLinks, mergeProps({
          class: "VPNavScreenSocialLinks",
          links: unref(theme2).socialLinks
        }, _attrs), null, _parent));
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$m = _sfc_main$m.setup;
_sfc_main$m.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenSocialLinks.vue");
  return _sfc_setup$m ? _sfc_setup$m(props, ctx) : void 0;
};
const _sfc_main$l = /* @__PURE__ */ defineComponent({
  __name: "VPNavScreenTranslations",
  __ssrInlineRender: true,
  setup(__props) {
    const { localeLinks, currentLang } = useLangs({ correspondingLink: true });
    const isOpen = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(localeLinks).length && unref(currentLang).label) {
        _push(`<div${ssrRenderAttrs(mergeProps({
          class: ["VPNavScreenTranslations", { open: isOpen.value }]
        }, _attrs))} data-v-b5776f58><button class="title" data-v-b5776f58><span class="vpi-languages icon lang" data-v-b5776f58></span> ${ssrInterpolate(unref(currentLang).label)} <span class="vpi-chevron-down icon chevron" data-v-b5776f58></span></button><ul class="list" data-v-b5776f58><!--[-->`);
        ssrRenderList(unref(localeLinks), (locale) => {
          _push(`<li class="item" data-v-b5776f58>`);
          _push(ssrRenderComponent(_sfc_main$12, {
            class: "link",
            href: locale.link
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(locale.text)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(locale.text), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$l = _sfc_main$l.setup;
_sfc_main$l.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavScreenTranslations.vue");
  return _sfc_setup$l ? _sfc_setup$l(props, ctx) : void 0;
};
const VPNavScreenTranslations = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["__scopeId", "data-v-b5776f58"]]);
const _sfc_main$k = /* @__PURE__ */ defineComponent({
  __name: "VPNavScreen",
  __ssrInlineRender: true,
  props: {
    open: { type: Boolean }
  },
  setup(__props) {
    const screen = ref(null);
    useScrollLock(inBrowser ? document.body : null);
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.open) {
        _push(`<div${ssrRenderAttrs(mergeProps({
          class: "VPNavScreen",
          ref_key: "screen",
          ref: screen,
          id: "VPNavScreen"
        }, _attrs))} data-v-b10d73c3><div class="container" data-v-b10d73c3>`);
        ssrRenderSlot(_ctx.$slots, "nav-screen-content-before", {}, null, _push, _parent);
        _push(ssrRenderComponent(_sfc_main$n, { class: "menu" }, null, _parent));
        _push(ssrRenderComponent(VPNavScreenTranslations, { class: "translations" }, null, _parent));
        _push(ssrRenderComponent(VPNavScreenAppearance, { class: "appearance" }, null, _parent));
        _push(ssrRenderComponent(_sfc_main$m, { class: "social-links" }, null, _parent));
        ssrRenderSlot(_ctx.$slots, "nav-screen-content-after", {}, null, _push, _parent);
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$k = _sfc_main$k.setup;
_sfc_main$k.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNavScreen.vue");
  return _sfc_setup$k ? _sfc_setup$k(props, ctx) : void 0;
};
const VPNavScreen = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["__scopeId", "data-v-b10d73c3"]]);
const _sfc_main$j = /* @__PURE__ */ defineComponent({
  __name: "VPNav",
  __ssrInlineRender: true,
  setup(__props) {
    const { isScreenOpen, closeScreen, toggleScreen } = useNav();
    const { frontmatter } = useData();
    const hasNavbar = computed(() => {
      return frontmatter.value.navbar !== false;
    });
    provide("close-screen", closeScreen);
    watchEffect(() => {
      if (inBrowser) {
        document.documentElement.classList.toggle("hide-nav", !hasNavbar.value);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (hasNavbar.value) {
        _push(`<header${ssrRenderAttrs(mergeProps({ class: "VPNav" }, _attrs))} data-v-c7c9c8f2>`);
        _push(ssrRenderComponent(VPNavBar, {
          "is-screen-open": unref(isScreenOpen),
          onToggleScreen: unref(toggleScreen)
        }, {
          "nav-bar-title-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)
              ];
            }
          }),
          "nav-bar-title-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)
              ];
            }
          }),
          "nav-bar-content-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "nav-bar-content-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "nav-bar-content-before", {}, void 0, true)
              ];
            }
          }),
          "nav-bar-content-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "nav-bar-content-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "nav-bar-content-after", {}, void 0, true)
              ];
            }
          }),
          _: 3
        }, _parent));
        _push(ssrRenderComponent(VPNavScreen, { open: unref(isScreenOpen) }, {
          "nav-screen-content-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "nav-screen-content-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "nav-screen-content-before", {}, void 0, true)
              ];
            }
          }),
          "nav-screen-content-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "nav-screen-content-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "nav-screen-content-after", {}, void 0, true)
              ];
            }
          }),
          _: 3
        }, _parent));
        _push(`</header>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$j = _sfc_main$j.setup;
_sfc_main$j.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPNav.vue");
  return _sfc_setup$j ? _sfc_setup$j(props, ctx) : void 0;
};
const VPNav = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["__scopeId", "data-v-c7c9c8f2"]]);
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  __name: "VPSidebarItem",
  __ssrInlineRender: true,
  props: {
    item: {},
    depth: {}
  },
  setup(__props) {
    const props = __props;
    const {
      collapsed,
      collapsible,
      isLink,
      isActiveLink,
      hasActiveLink: hasActiveLink2,
      hasChildren,
      toggle
    } = useSidebarControl(computed(() => props.item));
    const sectionTag = computed(() => hasChildren.value ? "section" : `div`);
    const linkTag = computed(() => isLink.value ? "a" : "div");
    const textTag = computed(() => {
      return !hasChildren.value ? "p" : props.depth + 2 === 7 ? "p" : `h${props.depth + 2}`;
    });
    const itemRole = computed(() => isLink.value ? void 0 : "button");
    const classes = computed(() => [
      [`level-${props.depth}`],
      { collapsible: collapsible.value },
      { collapsed: collapsed.value },
      { "is-link": isLink.value },
      { "is-active": isActiveLink.value },
      { "has-active": hasActiveLink2.value }
    ]);
    function onItemInteraction(e) {
      if ("key" in e && e.key !== "Enter") {
        return;
      }
      !props.item.link && toggle();
    }
    function onCaretClick() {
      props.item.link && toggle();
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_VPSidebarItem = resolveComponent("VPSidebarItem", true);
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(sectionTag.value), mergeProps({
        class: ["VPSidebarItem", classes.value]
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (__props.item.text) {
              _push2(`<div class="item"${ssrRenderAttr("role", itemRole.value)}${ssrRenderAttr("tabindex", __props.item.items && 0)} data-v-901faf0d${_scopeId}><div class="indicator" data-v-901faf0d${_scopeId}></div>`);
              if (__props.item.link) {
                _push2(ssrRenderComponent(_sfc_main$12, {
                  tag: linkTag.value,
                  class: "link",
                  href: __props.item.link,
                  rel: __props.item.rel,
                  target: __props.item.target
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      ssrRenderVNode(_push3, createVNode(resolveDynamicComponent(textTag.value), { class: "text" }, null), _parent3, _scopeId2);
                    } else {
                      return [
                        (openBlock(), createBlock(resolveDynamicComponent(textTag.value), {
                          class: "text",
                          innerHTML: __props.item.text
                        }, null, 8, ["innerHTML"]))
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(textTag.value), { class: "text" }, null), _parent2, _scopeId);
              }
              if (__props.item.collapsed != null && __props.item.items && __props.item.items.length) {
                _push2(`<div class="caret" role="button" aria-label="toggle section" tabindex="0" data-v-901faf0d${_scopeId}><span class="vpi-chevron-right caret-icon" data-v-901faf0d${_scopeId}></span></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.item.items && __props.item.items.length) {
              _push2(`<div class="items" data-v-901faf0d${_scopeId}>`);
              if (__props.depth < 5) {
                _push2(`<!--[-->`);
                ssrRenderList(__props.item.items, (i) => {
                  _push2(ssrRenderComponent(_component_VPSidebarItem, {
                    key: i.text,
                    item: i,
                    depth: __props.depth + 1
                  }, null, _parent2, _scopeId));
                });
                _push2(`<!--]-->`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              __props.item.text ? (openBlock(), createBlock("div", mergeProps({
                key: 0,
                class: "item",
                role: itemRole.value
              }, toHandlers(
                __props.item.items ? { click: onItemInteraction, keydown: onItemInteraction } : {},
                true
              ), {
                tabindex: __props.item.items && 0
              }), [
                createVNode("div", { class: "indicator" }),
                __props.item.link ? (openBlock(), createBlock(_sfc_main$12, {
                  key: 0,
                  tag: linkTag.value,
                  class: "link",
                  href: __props.item.link,
                  rel: __props.item.rel,
                  target: __props.item.target
                }, {
                  default: withCtx(() => [
                    (openBlock(), createBlock(resolveDynamicComponent(textTag.value), {
                      class: "text",
                      innerHTML: __props.item.text
                    }, null, 8, ["innerHTML"]))
                  ]),
                  _: 1
                }, 8, ["tag", "href", "rel", "target"])) : (openBlock(), createBlock(resolveDynamicComponent(textTag.value), {
                  key: 1,
                  class: "text",
                  innerHTML: __props.item.text
                }, null, 8, ["innerHTML"])),
                __props.item.collapsed != null && __props.item.items && __props.item.items.length ? (openBlock(), createBlock("div", {
                  key: 2,
                  class: "caret",
                  role: "button",
                  "aria-label": "toggle section",
                  onClick: onCaretClick,
                  onKeydown: withKeys(onCaretClick, ["enter"]),
                  tabindex: "0"
                }, [
                  createVNode("span", { class: "vpi-chevron-right caret-icon" })
                ], 32)) : createCommentVNode("", true)
              ], 16, ["role", "tabindex"])) : createCommentVNode("", true),
              __props.item.items && __props.item.items.length ? (openBlock(), createBlock("div", {
                key: 1,
                class: "items"
              }, [
                __props.depth < 5 ? (openBlock(true), createBlock(Fragment, { key: 0 }, renderList(__props.item.items, (i) => {
                  return openBlock(), createBlock(_component_VPSidebarItem, {
                    key: i.text,
                    item: i,
                    depth: __props.depth + 1
                  }, null, 8, ["item", "depth"]);
                }), 128)) : createCommentVNode("", true)
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }), _parent);
    };
  }
});
const _sfc_setup$i = _sfc_main$i.setup;
_sfc_main$i.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPSidebarItem.vue");
  return _sfc_setup$i ? _sfc_setup$i(props, ctx) : void 0;
};
const VPSidebarItem = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["__scopeId", "data-v-901faf0d"]]);
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "VPSidebarGroup",
  __ssrInlineRender: true,
  props: {
    items: {}
  },
  setup(__props) {
    const disableTransition = ref(true);
    let timer = null;
    onMounted(() => {
      timer = setTimeout(() => {
        timer = null;
        disableTransition.value = false;
      }, 300);
    });
    onBeforeUnmount(() => {
      if (timer != null) {
        clearTimeout(timer);
        timer = null;
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      ssrRenderList(__props.items, (item) => {
        _push(`<div class="${ssrRenderClass([{ "no-transition": disableTransition.value }, "group"])}" data-v-db056ffa>`);
        _push(ssrRenderComponent(VPSidebarItem, {
          item,
          depth: 0
        }, null, _parent));
        _push(`</div>`);
      });
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$h = _sfc_main$h.setup;
_sfc_main$h.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPSidebarGroup.vue");
  return _sfc_setup$h ? _sfc_setup$h(props, ctx) : void 0;
};
const VPSidebarGroup = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["__scopeId", "data-v-db056ffa"]]);
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  __name: "VPSidebar",
  __ssrInlineRender: true,
  props: {
    open: { type: Boolean }
  },
  setup(__props) {
    const { sidebarGroups, hasSidebar } = useSidebar();
    const props = __props;
    const navEl = ref(null);
    const isLocked = useScrollLock(inBrowser ? document.body : null);
    watch(
      [props, navEl],
      () => {
        var _a;
        if (props.open) {
          isLocked.value = true;
          (_a = navEl.value) == null ? void 0 : _a.focus();
        } else isLocked.value = false;
      },
      { immediate: true, flush: "post" }
    );
    const key = ref(0);
    watch(
      sidebarGroups,
      () => {
        key.value += 1;
      },
      { deep: true }
    );
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(hasSidebar)) {
        _push(`<aside${ssrRenderAttrs(mergeProps({
          class: ["VPSidebar", { open: __props.open }],
          ref_key: "navEl",
          ref: navEl
        }, _attrs))} data-v-192dfe24><div class="curtain" data-v-192dfe24></div><nav class="nav" id="VPSidebarNav" aria-labelledby="sidebar-aria-label" tabindex="-1" data-v-192dfe24><span class="visually-hidden" id="sidebar-aria-label" data-v-192dfe24> Sidebar Navigation </span>`);
        ssrRenderSlot(_ctx.$slots, "sidebar-nav-before", {}, null, _push, _parent);
        _push(ssrRenderComponent(VPSidebarGroup, {
          items: unref(sidebarGroups),
          key: key.value
        }, null, _parent));
        ssrRenderSlot(_ctx.$slots, "sidebar-nav-after", {}, null, _push, _parent);
        _push(`</nav></aside>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$g = _sfc_main$g.setup;
_sfc_main$g.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPSidebar.vue");
  return _sfc_setup$g ? _sfc_setup$g(props, ctx) : void 0;
};
const VPSidebar = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["__scopeId", "data-v-192dfe24"]]);
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "VPSkipLink",
  __ssrInlineRender: true,
  setup(__props) {
    const { theme: theme2 } = useData();
    const route = useRoute();
    const backToTop = ref();
    watch(() => route.path, () => backToTop.value.focus());
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><span tabindex="-1" data-v-2bdc84d8></span><a href="#VPContent" class="VPSkipLink visually-hidden" data-v-2bdc84d8>${ssrInterpolate(unref(theme2).skipToContentLabel || "Skip to content")}</a><!--]-->`);
    };
  }
});
const _sfc_setup$f = _sfc_main$f.setup;
_sfc_main$f.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPSkipLink.vue");
  return _sfc_setup$f ? _sfc_setup$f(props, ctx) : void 0;
};
const VPSkipLink = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["__scopeId", "data-v-2bdc84d8"]]);
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "Layout",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      isOpen: isSidebarOpen,
      open: openSidebar,
      close: closeSidebar
    } = useSidebar();
    const route = useRoute();
    watch(() => route.path, closeSidebar);
    useCloseSidebarOnEscape(isSidebarOpen, closeSidebar);
    const { frontmatter } = useData();
    const slots = useSlots();
    const heroImageSlotExists = computed(() => !!slots["home-hero-image"]);
    provide("hero-image-slot-exists", heroImageSlotExists);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Content = resolveComponent("Content");
      if (unref(frontmatter).layout !== false) {
        _push(`<div${ssrRenderAttrs(mergeProps({
          class: ["Layout", unref(frontmatter).pageClass]
        }, _attrs))} data-v-a185ca79>`);
        ssrRenderSlot(_ctx.$slots, "layout-top", {}, null, _push, _parent);
        _push(ssrRenderComponent(VPSkipLink, null, null, _parent));
        _push(ssrRenderComponent(VPBackdrop, {
          class: "backdrop",
          show: unref(isSidebarOpen),
          onClick: unref(closeSidebar)
        }, null, _parent));
        _push(ssrRenderComponent(VPNav, null, {
          "nav-bar-title-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "nav-bar-title-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "nav-bar-title-before", {}, void 0, true)
              ];
            }
          }),
          "nav-bar-title-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "nav-bar-title-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "nav-bar-title-after", {}, void 0, true)
              ];
            }
          }),
          "nav-bar-content-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "nav-bar-content-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "nav-bar-content-before", {}, void 0, true)
              ];
            }
          }),
          "nav-bar-content-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "nav-bar-content-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "nav-bar-content-after", {}, void 0, true)
              ];
            }
          }),
          "nav-screen-content-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "nav-screen-content-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "nav-screen-content-before", {}, void 0, true)
              ];
            }
          }),
          "nav-screen-content-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "nav-screen-content-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "nav-screen-content-after", {}, void 0, true)
              ];
            }
          }),
          _: 3
        }, _parent));
        _push(ssrRenderComponent(VPLocalNav, {
          open: unref(isSidebarOpen),
          onOpenMenu: unref(openSidebar)
        }, null, _parent));
        _push(ssrRenderComponent(VPSidebar, { open: unref(isSidebarOpen) }, {
          "sidebar-nav-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "sidebar-nav-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "sidebar-nav-before", {}, void 0, true)
              ];
            }
          }),
          "sidebar-nav-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "sidebar-nav-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "sidebar-nav-after", {}, void 0, true)
              ];
            }
          }),
          _: 3
        }, _parent));
        _push(ssrRenderComponent(VPContent, null, {
          "page-top": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "page-top", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "page-top", {}, void 0, true)
              ];
            }
          }),
          "page-bottom": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "page-bottom", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "page-bottom", {}, void 0, true)
              ];
            }
          }),
          "not-found": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "not-found", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "not-found", {}, void 0, true)
              ];
            }
          }),
          "home-hero-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-before", {}, void 0, true)
              ];
            }
          }),
          "home-hero-info-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-info-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-info-before", {}, void 0, true)
              ];
            }
          }),
          "home-hero-info": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-info", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-info", {}, void 0, true)
              ];
            }
          }),
          "home-hero-info-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-info-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-info-after", {}, void 0, true)
              ];
            }
          }),
          "home-hero-actions-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-actions-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-actions-after", {}, void 0, true)
              ];
            }
          }),
          "home-hero-image": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-image", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-image", {}, void 0, true)
              ];
            }
          }),
          "home-hero-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-hero-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-hero-after", {}, void 0, true)
              ];
            }
          }),
          "home-features-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-features-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-features-before", {}, void 0, true)
              ];
            }
          }),
          "home-features-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "home-features-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "home-features-after", {}, void 0, true)
              ];
            }
          }),
          "doc-footer-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "doc-footer-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "doc-footer-before", {}, void 0, true)
              ];
            }
          }),
          "doc-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "doc-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "doc-before", {}, void 0, true)
              ];
            }
          }),
          "doc-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "doc-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "doc-after", {}, void 0, true)
              ];
            }
          }),
          "doc-top": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "doc-top", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "doc-top", {}, void 0, true)
              ];
            }
          }),
          "doc-bottom": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "doc-bottom", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "doc-bottom", {}, void 0, true)
              ];
            }
          }),
          "aside-top": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-top", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-top", {}, void 0, true)
              ];
            }
          }),
          "aside-bottom": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-bottom", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-bottom", {}, void 0, true)
              ];
            }
          }),
          "aside-outline-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-outline-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-outline-before", {}, void 0, true)
              ];
            }
          }),
          "aside-outline-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-outline-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-outline-after", {}, void 0, true)
              ];
            }
          }),
          "aside-ads-before": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-ads-before", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-ads-before", {}, void 0, true)
              ];
            }
          }),
          "aside-ads-after": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              ssrRenderSlot(_ctx.$slots, "aside-ads-after", {}, null, _push2, _parent2, _scopeId);
            } else {
              return [
                renderSlot(_ctx.$slots, "aside-ads-after", {}, void 0, true)
              ];
            }
          }),
          _: 3
        }, _parent));
        _push(ssrRenderComponent(VPFooter, null, null, _parent));
        ssrRenderSlot(_ctx.$slots, "layout-bottom", {}, null, _push, _parent);
        _push(`</div>`);
      } else {
        _push(ssrRenderComponent(_component_Content, _attrs, null, _parent));
      }
    };
  }
});
const _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/Layout.vue");
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
const Layout = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__scopeId", "data-v-a185ca79"]]);
const GridSettings = {
  xmini: [[0, 2]],
  mini: [],
  small: [
    [920, 6],
    [768, 5],
    [640, 4],
    [480, 3],
    [0, 2]
  ],
  medium: [
    [960, 5],
    [832, 4],
    [640, 3],
    [480, 2]
  ],
  big: [
    [832, 3],
    [640, 2]
  ]
};
function useSponsorsGrid({ el, size = "medium" }) {
  const onResize = throttleAndDebounce(manage, 100);
  onMounted(() => {
    manage();
    window.addEventListener("resize", onResize);
  });
  onUnmounted(() => {
    window.removeEventListener("resize", onResize);
  });
  function manage() {
    adjustSlots(el.value, size);
  }
}
function adjustSlots(el, size) {
  const tsize = el.children.length;
  const asize = el.querySelectorAll(".vp-sponsor-grid-item:not(.empty)").length;
  const grid = setGrid(el, size, asize);
  manageSlots(el, grid, tsize, asize);
}
function setGrid(el, size, items) {
  const settings = GridSettings[size];
  const screen = window.innerWidth;
  let grid = 1;
  settings.some(([breakpoint, value]) => {
    if (screen >= breakpoint) {
      grid = items < value ? items : value;
      return true;
    }
  });
  setGridData(el, grid);
  return grid;
}
function setGridData(el, value) {
  el.dataset.vpGrid = String(value);
}
function manageSlots(el, grid, tsize, asize) {
  const diff = tsize - asize;
  const rem = asize % grid;
  const drem = rem === 0 ? rem : grid - rem;
  neutralizeSlots(el, drem - diff);
}
function neutralizeSlots(el, count) {
  if (count === 0) {
    return;
  }
  count > 0 ? addSlots(el, count) : removeSlots(el, count * -1);
}
function addSlots(el, count) {
  for (let i = 0; i < count; i++) {
    const slot = document.createElement("div");
    slot.classList.add("vp-sponsor-grid-item", "empty");
    el.append(slot);
  }
}
function removeSlots(el, count) {
  for (let i = 0; i < count; i++) {
    el.removeChild(el.lastElementChild);
  }
}
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "VPSponsorsGrid",
  __ssrInlineRender: true,
  props: {
    size: { default: "medium" },
    data: {}
  },
  setup(__props) {
    const props = __props;
    const el = ref(null);
    useSponsorsGrid({ el, size: props.size });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["VPSponsorsGrid vp-sponsor-grid", [__props.size]],
        ref_key: "el",
        ref: el
      }, _attrs))}><!--[-->`);
      ssrRenderList(__props.data, (sponsor) => {
        _push(`<div class="vp-sponsor-grid-item"><a class="vp-sponsor-grid-link"${ssrRenderAttr("href", sponsor.url)} target="_blank" rel="sponsored noopener"><article class="vp-sponsor-grid-box"><h4 class="visually-hidden">${ssrInterpolate(sponsor.name)}</h4><img class="vp-sponsor-grid-image"${ssrRenderAttr("src", sponsor.img)}${ssrRenderAttr("alt", sponsor.name)}></article></a></div>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPSponsorsGrid.vue");
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "VPSponsors",
  __ssrInlineRender: true,
  props: {
    mode: { default: "normal" },
    tier: {},
    size: {},
    data: {}
  },
  setup(__props) {
    const props = __props;
    const sponsors = computed(() => {
      const isSponsors = props.data.some((s) => {
        return "items" in s;
      });
      if (isSponsors) {
        return props.data;
      }
      return [
        { tier: props.tier, size: props.size, items: props.data }
      ];
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["VPSponsors vp-sponsor", [__props.mode]]
      }, _attrs))}><!--[-->`);
      ssrRenderList(sponsors.value, (sponsor, index) => {
        _push(`<section class="vp-sponsor-section">`);
        if (sponsor.tier) {
          _push(`<h3 class="vp-sponsor-tier">${ssrInterpolate(sponsor.tier)}</h3>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_sfc_main$d, {
          size: sponsor.size,
          data: sponsor.items
        }, null, _parent));
        _push(`</section>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPSponsors.vue");
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "VPDocAsideSponsors",
  __ssrInlineRender: true,
  props: {
    tier: {},
    size: {},
    data: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "VPDocAsideSponsors" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$c, {
        mode: "aside",
        tier: __props.tier,
        size: __props.size,
        data: __props.data
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPDocAsideSponsors.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "VPHomeSponsors",
  __ssrInlineRender: true,
  props: {
    message: {},
    actionText: { default: "Become a sponsor" },
    actionLink: {},
    data: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "VPHomeSponsors" }, _attrs))} data-v-ccc37149><div class="container" data-v-ccc37149><div class="header" data-v-ccc37149><div class="love" data-v-ccc37149><span class="vpi-heart icon" data-v-ccc37149></span></div>`);
      if (__props.message) {
        _push(`<h2 class="message" data-v-ccc37149>${ssrInterpolate(__props.message)}</h2>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="sponsors" data-v-ccc37149>`);
      _push(ssrRenderComponent(_sfc_main$c, { data: __props.data }, null, _parent));
      _push(`</div>`);
      if (__props.actionLink) {
        _push(`<div class="action" data-v-ccc37149>`);
        _push(ssrRenderComponent(VPButton, {
          theme: "sponsor",
          text: __props.actionText,
          href: __props.actionLink
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPHomeSponsors.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "VPTeamMembersItem",
  __ssrInlineRender: true,
  props: {
    size: { default: "medium" },
    member: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<article${ssrRenderAttrs(mergeProps({
        class: ["VPTeamMembersItem", [__props.size]]
      }, _attrs))} data-v-d133c62a><div class="profile" data-v-d133c62a><figure class="avatar" data-v-d133c62a><img class="avatar-img"${ssrRenderAttr("src", __props.member.avatar)}${ssrRenderAttr("alt", __props.member.name)} data-v-d133c62a></figure><div class="data" data-v-d133c62a><h1 class="name" data-v-d133c62a>${ssrInterpolate(__props.member.name)}</h1>`);
      if (__props.member.title || __props.member.org) {
        _push(`<p class="affiliation" data-v-d133c62a>`);
        if (__props.member.title) {
          _push(`<span class="title" data-v-d133c62a>${ssrInterpolate(__props.member.title)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.member.title && __props.member.org) {
          _push(`<span class="at" data-v-d133c62a> @ </span>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.member.org) {
          _push(ssrRenderComponent(_sfc_main$12, {
            class: ["org", { link: __props.member.orgLink }],
            href: __props.member.orgLink,
            "no-icon": ""
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(__props.member.org)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(__props.member.org), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</p>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.member.desc) {
        _push(`<p class="desc" data-v-d133c62a>${__props.member.desc ?? ""}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.member.links) {
        _push(`<div class="links" data-v-d133c62a>`);
        _push(ssrRenderComponent(VPSocialLinks, {
          links: __props.member.links
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (__props.member.sponsor) {
        _push(`<div class="sp" data-v-d133c62a>`);
        _push(ssrRenderComponent(_sfc_main$12, {
          class: "sp-link",
          href: __props.member.sponsor,
          "no-icon": ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="vpi-heart sp-icon" data-v-d133c62a${_scopeId}></span> ${ssrInterpolate(__props.member.actionText || "Sponsor")}`);
            } else {
              return [
                createVNode("span", { class: "vpi-heart sp-icon" }),
                createTextVNode(" " + toDisplayString(__props.member.actionText || "Sponsor"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</article>`);
    };
  }
});
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPTeamMembersItem.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const VPTeamMembersItem = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-d133c62a"]]);
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "VPTeamMembers",
  __ssrInlineRender: true,
  props: {
    size: { default: "medium" },
    members: {}
  },
  setup(__props) {
    const props = __props;
    const classes = computed(() => [props.size, `count-${props.members.length}`]);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["VPTeamMembers", classes.value]
      }, _attrs))} data-v-665c9602><div class="container" data-v-665c9602><!--[-->`);
      ssrRenderList(__props.members, (member) => {
        _push(`<div class="item" data-v-665c9602>`);
        _push(ssrRenderComponent(VPTeamMembersItem, {
          size: __props.size,
          member
        }, null, _parent));
        _push(`</div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPTeamMembers.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const _sfc_main$7 = {};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPTeamPage.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = {};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPTeamPageSection.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = {};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_bd75e26432e8abd741c662372a7de47d/node_modules/vitepress/dist/client/theme-default/components/VPTeamPageTitle.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const theme = {
  Layout,
  enhanceApp: ({ app }) => {
    app.component("Badge", _sfc_main$19);
  }
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "gradiente-flow",
  __ssrInlineRender: true,
  setup(__props) {
    const commonStyle = {
      targetPosition: Position.Left,
      sourcePosition: Position.Left
    };
    const nodes = [
      {
        ...commonStyle,
        id: "gradiente",
        type: "input",
        data: {
          label: h("div", { class: "node-content" }, [
            h("img", {
              src: "/gradiente/logo.svg",
              style: {
                width: "48px",
                height: "48px",
                marginBottom: "6px"
              }
            }),
            h("div")
          ])
        },
        position: { x: 40, y: 180 },
        sourcePosition: Position.Right
      },
      {
        ...commonStyle,
        id: "css",
        data: {
          label: h("div", { class: "node-content" }, [
            h("img", {
              src: "/gradiente/icons/css.svg",
              style: {
                width: "48px",
                height: "48px",
                marginBottom: "6px"
              }
            }),
            h("div")
          ])
        },
        position: { x: 380, y: 40 }
      },
      {
        ...commonStyle,
        id: "html",
        data: {
          label: h("div", { class: "node-content" }, [
            h("img", {
              src: "/gradiente/icons/html.svg",
              style: {
                width: "48px",
                height: "48px",
                marginBottom: "6px"
              }
            }),
            h("div")
          ])
        },
        position: { x: 380, y: 140 }
      },
      {
        ...commonStyle,
        id: "webgl",
        data: {
          label: h("div", { class: "node-content" }, [
            h("img", {
              src: "/gradiente/icons/webgl.svg",
              style: {
                width: "48px",
                height: "48px",
                marginBottom: "6px"
              }
            }),
            h("div")
          ])
        },
        position: { x: 380, y: 240 }
      },
      {
        ...commonStyle,
        id: "flowscape",
        data: {
          label: h("div", { class: "node-content" }, [
            h("img", {
              src: "/gradiente/icons/flowscape.svg",
              style: {
                width: "48px",
                height: "48px",
                marginBottom: "6px"
              }
            }),
            h("div")
          ])
        },
        position: { x: 380, y: 340 }
      }
    ];
    const commonStylesEdges = {
      animated: true,
      source: "gradiente",
      style: {
        stroke: "#fb7655",
        strokeWidth: 3
      }
    };
    const edges = [
      { ...commonStylesEdges, id: "e1", target: "css" },
      { ...commonStylesEdges, id: "e2", target: "html" },
      { ...commonStylesEdges, id: "e3", target: "flowscape" },
      { ...commonStylesEdges, id: "e4", target: "webgl" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "gradiente-flow" }, _attrs))} data-v-b73f9421>`);
      _push(ssrRenderComponent(unref(VueFlow), {
        nodes,
        edges,
        "fit-view-on-init": ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(Background), {
              variant: "dots",
              gap: 20,
              size: 1
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(Background), {
                variant: "dots",
                gap: 20,
                size: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/gradiente-flow.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const GradienteFlow = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-b73f9421"]]);
function roundTo(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
function isAngleUnit(unit) {
  return unit === "deg" || unit === "rad" || unit === "turn" || unit === "grad";
}
function isAngle(value) {
  try {
    return typeof angleValueFromString(value) === "number";
  } catch (e) {
    return false;
  }
}
function angleValueFromString(value) {
  const match = value.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(deg|rad|turn|grad)$/);
  if (match === null) {
    throw new Error(`Invalid angle value: "${value}"`);
  }
  if (!isAngleUnit(match[2])) {
    throw new Error(`Unsupported angle unit: "${match[2]}"`);
  }
  if (!Number.isFinite(+match[1])) {
    throw new SyntaxError(`Invalid angle value: "${match[1]}"`);
  }
  const angleValue = Number(match[1]);
  switch (match[2]) {
    case "deg":
      return degToRad(angleValue);
    case "rad":
      return angleValue;
    case "turn":
      return turnToRad(angleValue);
    case "grad":
      return gradToRad(angleValue);
  }
}
function degToRad(value) {
  return value * Math.PI / 180;
}
function radToDeg(value) {
  return value * 180 / Math.PI;
}
function turnToRad(value) {
  return value * Math.PI * 2;
}
function gradToRad(value) {
  return value * Math.PI / 200;
}
function normalizeAngleDeg(value, digits = 3) {
  const normalized = (value % 360 + 360) % 360;
  return roundTo(normalized, digits);
}
function normalizeAngleRad(value, digits = 6) {
  const tau = Math.PI * 2;
  return roundTo((value % tau + tau) % tau, digits);
}
var PatternTokenKind = /* @__PURE__ */ ((PatternTokenKind2) => {
  PatternTokenKind2["START"] = "^";
  PatternTokenKind2["END"] = ".";
  PatternTokenKind2["GROUP_OPEN"] = "(";
  PatternTokenKind2["GROUP_CLOSE"] = ")";
  PatternTokenKind2["COMMA"] = ",";
  PatternTokenKind2["SEQUENCE_OPEN"] = "[";
  PatternTokenKind2["SEQUENCE_CLOSE"] = "]";
  PatternTokenKind2["OR"] = "|";
  PatternTokenKind2["AND"] = "&";
  PatternTokenKind2["NOT"] = "!";
  PatternTokenKind2["REPEAT"] = "~";
  PatternTokenKind2["CONFIG"] = "config";
  PatternTokenKind2["COLOR_STOP"] = "color-stop";
  PatternTokenKind2["COLOR_HINT"] = "color-hint";
  return PatternTokenKind2;
})(PatternTokenKind || {});
function matchExpression(classified, patternTokens, inputIndex, patternIndex) {
  let currentInputIndex = inputIndex;
  let currentPatternIndex = patternIndex;
  while (currentPatternIndex < patternTokens.length) {
    const token = patternTokens[currentPatternIndex];
    if (token === PatternTokenKind.END || token === PatternTokenKind.GROUP_CLOSE || token === PatternTokenKind.SEQUENCE_CLOSE || token === PatternTokenKind.OR) {
      break;
    }
    if (token === PatternTokenKind.COMMA) {
      currentPatternIndex += 1;
      continue;
    }
    const result = matchPrimary(
      classified,
      patternTokens,
      currentInputIndex,
      currentPatternIndex
    );
    if (!result.matched) {
      return {
        matched: false,
        nextInputIndex: inputIndex,
        nextPatternIndex: patternIndex
      };
    }
    currentInputIndex = result.nextInputIndex;
    currentPatternIndex = result.nextPatternIndex;
  }
  return {
    matched: true,
    nextInputIndex: currentInputIndex,
    nextPatternIndex: currentPatternIndex
  };
}
function matchEntity(classified, patternTokens, inputIndex, patternIndex) {
  const expected = patternTokens[patternIndex];
  const current = classified[inputIndex];
  if (expected !== PatternTokenKind.CONFIG && expected !== PatternTokenKind.COLOR_STOP && expected !== PatternTokenKind.COLOR_HINT) {
    throw new Error(`Expected entity token at pattern index ${patternIndex}`);
  }
  if (!current) {
    return {
      matched: false,
      nextInputIndex: inputIndex,
      nextPatternIndex: patternIndex
    };
  }
  if (current.type !== expected) {
    return {
      matched: false,
      nextInputIndex: inputIndex,
      nextPatternIndex: patternIndex
    };
  }
  return {
    matched: true,
    nextInputIndex: inputIndex + 1,
    nextPatternIndex: patternIndex + 1
  };
}
function matchPrimary(classified, patternTokens, inputIndex, patternIndex) {
  const token = patternTokens[patternIndex];
  if (token === PatternTokenKind.CONFIG || token === PatternTokenKind.COLOR_STOP || token === PatternTokenKind.COLOR_HINT) {
    return matchEntity(classified, patternTokens, inputIndex, patternIndex);
  }
  if (token === PatternTokenKind.SEQUENCE_OPEN) {
    return matchSequence(classified, patternTokens, inputIndex, patternIndex);
  }
  if (token === PatternTokenKind.GROUP_OPEN) {
    return matchGroup(classified, patternTokens, inputIndex, patternIndex);
  }
  if (token === PatternTokenKind.REPEAT) {
    return matchRepeat(classified, patternTokens, inputIndex, patternIndex);
  }
  throw new Error(`Unsupported primary token "${token}" at pattern index ${patternIndex}`);
}
function findMatchingToken(tokens, startIndex, openToken, closeToken) {
  if (tokens[startIndex] !== openToken) {
    throw new Error(
      `Expected "${openToken}" at pattern index ${startIndex}, got "${tokens[startIndex]}"`
    );
  }
  let depth = 0;
  for (let i = startIndex; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token === openToken) {
      depth += 1;
      continue;
    }
    if (token === closeToken) {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }
  throw new Error(`Unclosed token pair "${openToken}${closeToken}"`);
}
function matchSequence(classified, patternTokens, inputIndex, patternIndex) {
  if (patternTokens[patternIndex] !== PatternTokenKind.SEQUENCE_OPEN) {
    throw new Error(`Expected "[" at pattern index ${patternIndex}`);
  }
  const closeIndex = findMatchingToken(
    patternTokens,
    patternIndex,
    PatternTokenKind.SEQUENCE_OPEN,
    PatternTokenKind.SEQUENCE_CLOSE
  );
  let currentInputIndex = inputIndex;
  let currentPatternIndex = patternIndex + 1;
  while (currentPatternIndex < closeIndex) {
    const token = patternTokens[currentPatternIndex];
    if (token === PatternTokenKind.COMMA) {
      currentPatternIndex += 1;
      continue;
    }
    const result = matchPrimary(
      classified,
      patternTokens,
      currentInputIndex,
      currentPatternIndex
    );
    if (!result.matched) {
      return {
        matched: false,
        nextInputIndex: inputIndex,
        nextPatternIndex: patternIndex
      };
    }
    currentInputIndex = result.nextInputIndex;
    currentPatternIndex = result.nextPatternIndex;
  }
  return {
    matched: true,
    nextInputIndex: currentInputIndex,
    nextPatternIndex: closeIndex + 1
  };
}
function splitTopLevelOr(tokens) {
  const result = [];
  let current = [];
  let groupDepth = 0;
  let sequenceDepth = 0;
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token === PatternTokenKind.GROUP_OPEN) {
      groupDepth += 1;
      current.push(token);
      continue;
    }
    if (token === PatternTokenKind.GROUP_CLOSE) {
      groupDepth -= 1;
      current.push(token);
      continue;
    }
    if (token === PatternTokenKind.SEQUENCE_OPEN) {
      sequenceDepth += 1;
      current.push(token);
      continue;
    }
    if (token === PatternTokenKind.SEQUENCE_CLOSE) {
      sequenceDepth -= 1;
      current.push(token);
      continue;
    }
    if (token === PatternTokenKind.OR && groupDepth === 0 && sequenceDepth === 0) {
      result.push(current);
      current = [];
      continue;
    }
    current.push(token);
  }
  if (current.length > 0) {
    result.push(current);
  }
  return result;
}
function matchGroup(classified, patternTokens, inputIndex, patternIndex) {
  if (patternTokens[patternIndex] !== PatternTokenKind.GROUP_OPEN) {
    throw new Error(`Expected "(" at pattern index ${patternIndex}`);
  }
  const closeIndex = findMatchingToken(
    patternTokens,
    patternIndex,
    PatternTokenKind.GROUP_OPEN,
    PatternTokenKind.GROUP_CLOSE
  );
  const innerTokens = patternTokens.slice(patternIndex + 1, closeIndex);
  const branches = splitTopLevelOr(innerTokens);
  for (const branch of branches) {
    const result = matchExpression(
      classified,
      branch,
      inputIndex,
      0
    );
    if (result.matched) {
      return {
        matched: true,
        nextInputIndex: result.nextInputIndex,
        nextPatternIndex: closeIndex + 1
      };
    }
  }
  return {
    matched: false,
    nextInputIndex: inputIndex,
    nextPatternIndex: patternIndex
  };
}
function matchRepeat(classified, patternTokens, inputIndex, patternIndex) {
  if (patternTokens[patternIndex] !== PatternTokenKind.REPEAT) {
    throw new Error(`Expected "~" at pattern index ${patternIndex}`);
  }
  let currentInputIndex = inputIndex;
  let currentPatternIndex = patternIndex + 1;
  while (true) {
    const result = matchPrimary(
      classified,
      patternTokens,
      currentInputIndex,
      currentPatternIndex
    );
    if (!result.matched) {
      break;
    }
    if (result.nextInputIndex === currentInputIndex) {
      throw new Error("Repeat expression did not consume input");
    }
    currentInputIndex = result.nextInputIndex;
  }
  const nextPatternIndex = getPrimaryEndIndex(patternTokens, currentPatternIndex);
  return {
    matched: true,
    nextInputIndex: currentInputIndex,
    nextPatternIndex
  };
}
function getPrimaryEndIndex(patternTokens, patternIndex) {
  const token = patternTokens[patternIndex];
  if (token === PatternTokenKind.CONFIG || token === PatternTokenKind.COLOR_STOP || token === PatternTokenKind.COLOR_HINT) {
    return patternIndex + 1;
  }
  if (token === PatternTokenKind.SEQUENCE_OPEN) {
    return findMatchingToken(
      patternTokens,
      patternIndex,
      PatternTokenKind.SEQUENCE_OPEN,
      PatternTokenKind.SEQUENCE_CLOSE
    ) + 1;
  }
  if (token === PatternTokenKind.GROUP_OPEN) {
    return findMatchingToken(
      patternTokens,
      patternIndex,
      PatternTokenKind.GROUP_OPEN,
      PatternTokenKind.GROUP_CLOSE
    ) + 1;
  }
  if (token === PatternTokenKind.REPEAT) {
    return getPrimaryEndIndex(patternTokens, patternIndex + 1);
  }
  throw new Error(`Unsupported token "${token}" in getPrimaryEndIndex`);
}
function validatePattern(input) {
  validatePatternSyntax(input);
  validatePatternSemantic(input);
  validatePatternStructure(input);
  return true;
}
function validatePatternSyntax(input) {
  const tokens = tokenizePattern(input);
  if (tokens.length === 0) {
    throw new Error("Pattern cannot be empty");
  }
  if (tokens[0] !== PatternTokenKind.START) {
    throw new Error("Pattern must start with ^");
  }
  if (tokens[tokens.length - 1] !== PatternTokenKind.END) {
    throw new Error('Pattern must end with "."');
  }
  let groupDepth = 0;
  let sequenceDepth = 0;
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token === PatternTokenKind.GROUP_OPEN) {
      groupDepth += 1;
      continue;
    }
    if (token === PatternTokenKind.GROUP_CLOSE) {
      groupDepth -= 1;
      if (groupDepth < 0) {
        throw new Error(`Unexpected ")" at token index ${i}`);
      }
      continue;
    }
    if (token === PatternTokenKind.SEQUENCE_OPEN) {
      sequenceDepth += 1;
      continue;
    }
    if (token === PatternTokenKind.SEQUENCE_CLOSE) {
      sequenceDepth -= 1;
      if (sequenceDepth < 0) {
        throw new Error(`Unexpected "]" at token index ${i}`);
      }
      continue;
    }
  }
  if (groupDepth !== 0) {
    throw new Error('Unclosed group "()" in pattern');
  }
  if (sequenceDepth !== 0) {
    throw new Error('Unclosed sequence "[]" in pattern');
  }
  return true;
}
const NEXT_TOKEN_MAP = {
  "^": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],
  "(": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],
  "[": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],
  "|": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],
  "&": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],
  "!": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],
  "~": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],
  ",": ["(", "[", "!", "~", "config", "color-stop", "color-hint"],
  "config": [",", "|", "&", ")", "]", "."],
  "color-stop": [",", "|", "&", ")", "]", "."],
  "color-hint": [",", "|", "&", ")", "]", "."],
  ")": [",", "|", "&", ")", "]", "."],
  "]": [",", "|", "&", ")", "]", "."],
  ".": []
};
function validatePatternSemantic(input) {
  const tokens = tokenizePattern(input);
  if (tokens.length === 0) {
    throw new Error("Pattern cannot be empty");
  }
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const current = tokens[i];
    const next = tokens[i + 1];
    const allowedNext = NEXT_TOKEN_MAP[current];
    if (!allowedNext) {
      throw new Error(`No semantic transition rule defined for token "${current}"`);
    }
    if (!allowedNext.includes(next)) {
      throw new Error(
        `Token "${next}" is not allowed after "${current}" at index ${i + 1}`
      );
    }
  }
  return true;
}
function validatePatternStructure(input) {
  const tokens = tokenizePattern(input);
  for (let i = 0; i < tokens.length; i += 1) {
    const current = tokens[i];
    const next = tokens[i + 1];
    const previous = tokens[i - 1];
    if (current === PatternTokenKind.GROUP_OPEN && next === PatternTokenKind.GROUP_CLOSE) {
      throw new Error(`Empty group "()" is not allowed at token index ${i}`);
    }
    if (current === PatternTokenKind.SEQUENCE_OPEN && next === PatternTokenKind.SEQUENCE_CLOSE) {
      throw new Error(`Empty sequence "[]" is not allowed at token index ${i}`);
    }
    if (current === PatternTokenKind.COMMA) {
      if (previous === void 0) {
        throw new Error(`Unexpected "," at token index ${i}`);
      }
      if (next === void 0) {
        throw new Error(`Unexpected "," at token index ${i}`);
      }
      if (previous === PatternTokenKind.SEQUENCE_OPEN) {
        throw new Error(`Sequence cannot start with "," at token index ${i}`);
      }
      if (next === PatternTokenKind.SEQUENCE_CLOSE) {
        throw new Error(`Sequence cannot end with "," at token index ${i}`);
      }
      if (previous === PatternTokenKind.COMMA) {
        throw new Error(`Unexpected consecutive "," at token index ${i}`);
      }
      if (next === PatternTokenKind.COMMA) {
        throw new Error(`Unexpected consecutive "," at token index ${i}`);
      }
    }
  }
  return true;
}
function tokenizePattern(input) {
  const source = input.trim();
  const tokens = [];
  let index = 0;
  while (index < source.length) {
    const rest = source.slice(index);
    const char = source[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (rest.startsWith(PatternTokenKind.COLOR_STOP)) {
      tokens.push(PatternTokenKind.COLOR_STOP);
      index += PatternTokenKind.COLOR_STOP.length;
      continue;
    }
    if (rest.startsWith(PatternTokenKind.COLOR_HINT)) {
      tokens.push(PatternTokenKind.COLOR_HINT);
      index += PatternTokenKind.COLOR_HINT.length;
      continue;
    }
    if (rest.startsWith(PatternTokenKind.CONFIG)) {
      tokens.push(PatternTokenKind.CONFIG);
      index += PatternTokenKind.CONFIG.length;
      continue;
    }
    if (char === PatternTokenKind.START || char === PatternTokenKind.END || char === PatternTokenKind.GROUP_OPEN || char === PatternTokenKind.GROUP_CLOSE || char === PatternTokenKind.SEQUENCE_OPEN || char === PatternTokenKind.SEQUENCE_CLOSE || char === PatternTokenKind.COMMA || char === PatternTokenKind.OR || char === PatternTokenKind.AND || char === PatternTokenKind.NOT || char === PatternTokenKind.REPEAT) {
      tokens.push(char);
      index += 1;
      continue;
    }
    throw new Error(`Unexpected token near "${rest}" at index ${index}`);
  }
  return tokens;
}
function validate(classified, pattern) {
  validatePattern(pattern);
  const patternTokens = tokenizePattern(pattern);
  const bodyTokens = patternTokens.slice(1, -1);
  const result = matchExpression(classified, bodyTokens, 0, 0);
  if (!result.matched) {
    throw new Error("Input does not match pattern");
  }
  if (result.nextInputIndex !== classified.length) {
    throw new Error("Pattern did not consume all inputs");
  }
  if (result.nextPatternIndex !== bodyTokens.length) {
    throw new Error("Input ended before pattern was fully matched");
  }
  return true;
}
const REPEATING_PREFIX$1 = "repeating-";
const PARAMS_VALIDATION_PATTERN = "^[([config,color-stop,([color-hint,color-stop]|color-stop)]|color-stop),~([color-hint,color-stop]|color-stop)].";
function parseStringToAbi(value, pattern = PARAMS_VALIDATION_PATTERN) {
  const source = value.trim();
  if (source.length === 0) {
    throw new Error("Expected function call, received empty string");
  }
  const { functionName, isRepeating, inputs } = extractOuterFunctionCall(source);
  const classified = classifyInputs(inputs);
  validate(classified, pattern);
  return {
    functionName,
    isRepeating,
    inputs: classified
  };
}
function isColorHint$1(value) {
  return /^-?\d*\.?\d+(%|deg|rad|turn|grad|px|em|rem|vh|vw|vmin|vmax|cm|mm|in|pt|pc|q)?$/i.test(value.trim());
}
function isColorStop(value) {
  try {
    const chunk = splitTopLevelByWhitespace(value)[0];
    const color = parse$1(chunk);
    return color !== void 0;
  } catch {
    return false;
  }
}
function classifyInputs(inputs) {
  const normalizedTypes = inputs.map((value) => value.trim()).filter((value) => value.length > 0);
  if (normalizedTypes.length === 0) {
    return [];
  }
  return normalizedTypes.map((value, index) => {
    if (index === 0 && !isColorStop(value)) {
      return {
        type: "config",
        value
      };
    }
    if (isColorStop(value)) {
      return {
        type: "color-stop",
        value
      };
    }
    if (isColorHint$1(value)) {
      return {
        type: "color-hint",
        value
      };
    }
    return {
      type: "config",
      value
    };
  });
}
function extractOuterFunctionCall(value) {
  const openIndex = value.indexOf("(");
  if (openIndex <= 0) {
    throw new Error("Expected function opening parenthesis");
  }
  let functionName = value.slice(0, openIndex).trim();
  if (functionName.length === 0) {
    throw new Error('Expected function name before "("');
  }
  const isRepeating = functionName.startsWith(REPEATING_PREFIX$1);
  if (isRepeating) {
    functionName = functionName.slice(REPEATING_PREFIX$1.length);
  }
  const closeIndex = findOuterClosingParenIndex(value, openIndex);
  if (closeIndex === -1) {
    throw new Error("Unclosed function parenthesis");
  }
  const body = value.slice(openIndex + 1, closeIndex);
  const inputs = splitTopLevelInputs(body);
  return {
    functionName,
    isRepeating,
    inputs
  };
}
function findOuterClosingParenIndex(value, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < value.length; i += 1) {
    const char = value[i];
    if (char === "(") {
      depth += 1;
      continue;
    }
    if (char === ")") {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
      if (depth < 0) {
        return -1;
      }
    }
  }
  return -1;
}
function splitTopLevelInputs(value) {
  const result = [];
  let current = "";
  let parenDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (char === "(") {
      parenDepth += 1;
      current += char;
      continue;
    }
    if (char === ")") {
      parenDepth -= 1;
      current += char;
      continue;
    }
    if (char === "{") {
      braceDepth += 1;
      current += char;
      continue;
    }
    if (char === "}") {
      braceDepth -= 1;
      current += char;
      continue;
    }
    if (char === "[") {
      bracketDepth += 1;
      current += char;
      continue;
    }
    if (char === "]") {
      bracketDepth -= 1;
      current += char;
      continue;
    }
    if (char === "," && parenDepth === 0 && braceDepth === 0 && bracketDepth === 0) {
      pushTrimmed(result, current);
      current = "";
      continue;
    }
    current += char;
  }
  pushTrimmed(result, current);
  return result;
}
function pushTrimmed(target, value) {
  const trimmed = value.trim();
  if (trimmed.length > 0) {
    target.push(trimmed);
  }
}
function splitTopLevelByWhitespace(value) {
  const source = value.trim();
  const result = [];
  let current = "";
  let parenDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (char === "(") {
      parenDepth += 1;
      current += char;
      continue;
    }
    if (char === ")") {
      parenDepth -= 1;
      current += char;
      continue;
    }
    if (char === "{") {
      braceDepth += 1;
      current += char;
      continue;
    }
    if (char === "}") {
      braceDepth -= 1;
      current += char;
      continue;
    }
    if (char === "[") {
      bracketDepth += 1;
      current += char;
      continue;
    }
    if (char === "]") {
      bracketDepth -= 1;
      current += char;
      continue;
    }
    if (/\s/.test(char) && parenDepth === 0 && braceDepth === 0 && bracketDepth === 0) {
      if (current.trim().length > 0) {
        result.push(current.trim());
        current = "";
      }
      continue;
    }
    current += char;
  }
  if (current.trim().length > 0) {
    result.push(current.trim());
  }
  return result;
}
const GRADIENT_COLOR_SPACE = [
  // defalult
  "oklab",
  // cylindrical
  "lch",
  "oklch",
  "hsl",
  "hwb",
  // cartesian
  "lab",
  "srgb",
  "srgb-linear",
  "xyz",
  "display-p3",
  "a98-rgb",
  "prophoto-rgb",
  "rec2020"
];
const GRADIENT_HUE_INTERPOLATIONS = [
  "shorter",
  "longer",
  "increasing",
  "decreasing"
];
const GRADIENT_POLAR_COLOR_SPACES = [
  "hsl",
  "hwb",
  "lch",
  "oklch"
];
function isGradientHueInterpolation(value) {
  return GRADIENT_HUE_INTERPOLATIONS.includes(
    value
  );
}
function isGradientColorSpace(value) {
  return GRADIENT_COLOR_SPACE.includes(
    value
  );
}
function isGradientPolarColorSpace(value) {
  return GRADIENT_POLAR_COLOR_SPACES.includes(
    value
  );
}
class GradientBase {
  constructor(type, config) {
    __publicField(this, "type");
    __publicField(this, "_config");
    this.type = type;
    this._config = this._cloneConfig(config);
    this._validateConfig(this._config);
  }
  getConfig() {
    return this._cloneConfig(this._config);
  }
  toJSON() {
    return {
      type: this.type,
      config: this.getConfig()
    };
  }
  _cloneConfig(value) {
    return structuredClone(value);
  }
}
class GradientWithStopsBase extends GradientBase {
  constructor(type, stops, config) {
    config.interpolation = GradientWithStopsBase._normalizeConfigInterpolation(config.interpolation);
    super(type, config);
    __publicField(this, "_stops", []);
    this._stops = this._getSortedStops(this._cloneStops(stops));
    this._validateStops(this._stops);
  }
  static fromAbi(abi) {
    throw new Error("Gradient deserialization from ABI is not implemented in Base class. Please use specific gradient type classes.");
  }
  static fromString(input) {
    return this.fromAbi(parseStringToAbi(input));
  }
  static _normalizeConfigInterpolation(value) {
    const { colorSpace, hue } = value;
    if (hue === void 0) {
      return { colorSpace };
    }
    if (!isGradientPolarColorSpace(colorSpace)) {
      return { colorSpace };
    }
    return {
      colorSpace,
      hue
    };
  }
  isRepeating() {
    return this.getConfig().isRepeating ?? false;
  }
  minColorStopsCount() {
    return 1;
  }
  getStops() {
    return this._cloneStops(this._stops);
  }
  toJSON() {
    return {
      ...super.toJSON(),
      stops: this.getStops()
    };
  }
  addStop(stop) {
    const nextStops = [
      ...this._cloneStops(this._stops),
      ...this._cloneStops([stop])
    ];
    const sortedStops = this._getSortedStops(nextStops);
    this._validateStops(sortedStops);
    this._stops = sortedStops;
  }
  removeStop(index) {
    if (!Number.isInteger(index)) {
      throw new TypeError("Gradient stop index must be an integer");
    }
    if (index < 0 || index >= this._stops.length) {
      throw new RangeError("Gradient stop index is out of bounds");
    }
    const colorStopCount = this._stops.filter(
      (stop) => stop.type === "color-stop"
    ).length;
    if (colorStopCount <= this.minColorStopsCount()) {
      throw new Error(
        `Color stop count should be greather than ${this.minColorStopsCount()}`
      );
    }
    const nextIndex = index + 1 > this._stops.length - 1 ? this._stops.length - 1 : index + 1;
    const prevIndex = index - 1 >= 0 ? index - 1 : 0;
    if (index !== nextIndex && this._stops[nextIndex].type === "color-hint") {
      this._stops.splice(nextIndex, 1);
    }
    this._stops.splice(index, 1);
    if (index !== prevIndex && this._stops[prevIndex].type === "color-hint") {
      this._stops.splice(prevIndex, 1);
    }
  }
  _serializeStopsCompact() {
    const tokens = this._buildSerializedStopTokens();
    if (this._canOmitAllStopPositions(tokens)) {
      return tokens.map((token) => {
        if (token.type !== "color-stop") {
          throw new Error("Unexpected color-hint token in compact stop serialization");
        }
        return token.value;
      });
    }
    return tokens.map((token) => {
      if (token.type === "color-hint") {
        return `${this._formatPercent(token.position)}%`;
      }
      if (token.positions.length === 2) {
        return `${token.value} ${this._formatPercent(token.positions[0])}% ${this._formatPercent(token.positions[1])}%`;
      }
      return `${token.value} ${this._formatPercent(token.positions[0])}%`;
    });
  }
  _buildSerializedStopTokens() {
    const result = [];
    const stops = this.getStops();
    for (let index = 0; index < stops.length; index++) {
      const current = stops[index];
      if (current.type === "color-hint") {
        result.push({
          type: "color-hint",
          position: current.position
        });
        continue;
      }
      const next = stops[index + 1];
      if (next && next.type === "color-stop" && next.value === current.value) {
        result.push({
          type: "color-stop",
          value: current.value,
          positions: [current.position, next.position]
        });
        index += 1;
        continue;
      }
      result.push({
        type: "color-stop",
        value: current.value,
        positions: [current.position]
      });
    }
    return result;
  }
  _canOmitAllStopPositions(tokens) {
    const stopTokens = tokens.filter(
      (token) => token.type === "color-stop"
    );
    if (tokens.some((token) => token.type === "color-hint")) {
      return false;
    }
    if (stopTokens.some((token) => token.positions.length !== 1)) {
      return false;
    }
    if (stopTokens.length <= 1) {
      return false;
    }
    const epsilon = 1e-6;
    for (let index = 0; index < stopTokens.length; index++) {
      const expected = index / (stopTokens.length - 1);
      const actual = stopTokens[index].positions[0];
      if (Math.abs(actual - expected) > epsilon) {
        return false;
      }
    }
    return true;
  }
  _formatPercent(value) {
    return roundTo(value * 100, 3);
  }
  static _normalizeAbiInputsToStops(inputs) {
    const pending = [];
    for (const input of inputs) {
      if (input.type === "color-hint") {
        pending.push({
          type: "color-hint",
          position: this._parsePosition(input.value)
        });
        continue;
      }
      if (input.type === "color-stop") {
        pending.push(...this._parseColorStopInput(input.value));
        continue;
      }
      throw new SyntaxError(
        `Unsupported gradient stop ABI input type: "${input.type}"`
      );
    }
    return this._resolvePendingStops(pending);
  }
  static _parsePosition(input) {
    const value = input.trim().toLowerCase();
    const match = value.match(/^([+-]?(?:\d+\.?\d*|\.\d+))%$/);
    if (match === null) {
      throw new SyntaxError(`Invalid gradient stop position: "${input}"`);
    }
    const numeric = Number(match[1]);
    if (!Number.isFinite(numeric)) {
      throw new SyntaxError(`Invalid gradient stop position: "${input}"`);
    }
    return numeric / 100;
  }
  static _parseColorStopInput(input) {
    const parts = splitTopLevelByWhitespace(input);
    if (parts.length === 0) {
      throw new SyntaxError("Color-stop input cannot be empty");
    }
    const positions = [];
    while (parts.length > 0) {
      const last = parts[parts.length - 1];
      if (!/%$/.test(last)) {
        break;
      }
      positions.unshift(this._parsePosition(last));
      parts.pop();
      if (positions.length === 2) {
        break;
      }
    }
    const color = parts.join(" ").trim();
    if (color.length === 0) {
      throw new SyntaxError(`Color-stop is missing color value: "${input}"`);
    }
    if (positions.length === 0) {
      return [
        {
          type: "color-stop",
          value: color
        }
      ];
    }
    if (positions.length === 1) {
      return [
        {
          type: "color-stop",
          value: color,
          position: positions[0]
        }
      ];
    }
    return [
      {
        type: "color-stop",
        value: color,
        position: positions[0]
      },
      {
        type: "color-stop",
        value: color,
        position: positions[1]
      }
    ];
  }
  static _resolvePendingStops(input) {
    if (input.length === 0) {
      throw new SyntaxError("Gradient must contain at least one stop");
    }
    const stops = input.map((item) => ({ ...item }));
    const firstColorStopIndex = stops.findIndex(
      (item) => item.type === "color-stop"
    );
    const lastColorStopIndex = [...stops].reverse().findIndex((item) => item.type === "color-stop");
    if (firstColorStopIndex === -1) {
      throw new SyntaxError("Gradient must contain at least one color-stop");
    }
    const realLastColorStopIndex = stops.length - 1 - lastColorStopIndex;
    if (stops[firstColorStopIndex].position === void 0) {
      stops[firstColorStopIndex].position = 0;
    }
    if (stops[realLastColorStopIndex].position === void 0) {
      stops[realLastColorStopIndex].position = 1;
    }
    let segmentStart = -1;
    for (let index = 0; index < stops.length; index++) {
      const current = stops[index];
      if (current.position !== void 0) {
        if (segmentStart !== -1) {
          const start = stops[segmentStart];
          const end = current;
          const gap = index - segmentStart;
          for (let inner = 1; inner < gap; inner++) {
            const item = stops[segmentStart + inner];
            if (item.position === void 0) {
              item.position = start.position + (end.position - start.position) * inner / gap;
            }
          }
        }
        segmentStart = index;
      }
    }
    return stops.map((item) => {
      if (item.position === void 0) {
        throw new SyntaxError("Failed to resolve gradient stop position");
      }
      if (item.type === "color-stop") {
        return {
          type: item.type,
          value: item.value,
          position: item.position
        };
      }
      return {
        type: item.type,
        position: item.position
      };
    });
  }
  _cloneStops(stops) {
    return structuredClone(stops);
  }
  _getSortedStops(stops) {
    return stops.map((stop, index) => ({ stop, index })).sort((a, b) => {
      if (a.stop.position !== b.stop.position) {
        return a.stop.position - b.stop.position;
      }
      return a.index - b.index;
    }).map((item) => item.stop);
  }
  _validateStops(stops) {
    this._validateStopsShape(stops);
    this._validateStopsSequence(stops);
  }
  _validateStopsShape(value) {
    if (!Array.isArray(value)) {
      throw new TypeError("Gradient stops must be an array");
    }
    for (const stop of value) {
      if (typeof stop !== "object" || stop === null) {
        throw new TypeError("Gradient stop must be an object");
      }
      const stopType = stop.type;
      if (stopType !== "color-stop" && stopType !== "color-hint") {
        throw new TypeError(`Invalid gradient stop type: ${String(stopType)}`);
      }
      if (stop.type === "color-stop" && typeof stop.value !== "string") {
        throw new TypeError("Gradient stop value must be a string");
      }
      if (typeof stop.position !== "number" || Number.isNaN(stop.position)) {
        throw new TypeError("Gradient stop position must be a valid number");
      }
    }
  }
  _validateStopsSequence(value) {
    if (value.length < this.minColorStopsCount()) {
      throw new TypeError(`Gradient must contain at least ${this.minColorStopsCount()} stop`);
    }
    if (value[0].type !== "color-stop") {
      throw new TypeError("Gradient stop sequence must start with a color-stop");
    }
    if (value[value.length - 1].type === "color-hint") {
      throw new TypeError("Gradient stop sequence cannot end with a color-hint");
    }
    for (let index = 1; index < value.length; index++) {
      const prev = value[index - 1];
      const current = value[index];
      if (prev.type === "color-hint" && current.type !== "color-stop") {
        throw new TypeError(
          "A color-hint must be followed by a color-stop"
        );
      }
    }
  }
}
const GRADIENT_ANGLE_UNITS = [
  "deg",
  "rad",
  "turn",
  "grad"
];
const GRADIENT_LENGTH_UNITS$1 = [
  "px",
  "em",
  "rem",
  "vw",
  "vh",
  "vmin",
  "vmax",
  "cm",
  "mm",
  "in",
  "pt",
  "pc"
];
function parseGradientAngle(input) {
  const match = input.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(deg|rad|turn|grad)$/);
  if (match === null || !isGradientAngleUnit(match[2])) {
    throw new SyntaxError(`Invalid gradient angle: "${input}"`);
  }
  return {
    kind: "angle",
    value: Number(match[1]),
    unit: match[2]
  };
}
function formatGradientAngle(value) {
  return `${value.value}${value.unit}`;
}
function parseGradientLengthPercentage(input) {
  const percentMatch = input.match(/^([+-]?(?:\d+\.?\d*|\.\d+))%$/);
  if (percentMatch !== null) {
    return {
      kind: "percent",
      value: Number(percentMatch[1])
    };
  }
  const lengthMatch = input.match(
    /^([+-]?(?:\d+\.?\d*|\.\d+))([a-z]+)$/
  );
  if (lengthMatch === null || !isGradientLengthUnit(lengthMatch[2])) {
    throw new SyntaxError(`Invalid gradient length-percentage: "${input}"`);
  }
  return {
    kind: "length",
    value: Number(lengthMatch[1]),
    unit: lengthMatch[2]
  };
}
function formatGradientLengthPercentage(value) {
  if (value.kind === "percent") {
    return `${value.value}%`;
  }
  return `${value.value}${value.unit}`;
}
function isGradientLengthPercentageToken(value) {
  if (value === void 0) {
    return false;
  }
  return /^([+-]?(?:\d+\.?\d*|\.\d+))%$/.test(value) || /^([+-]?(?:\d+\.?\d*|\.\d+))[a-z]+$/.test(value);
}
function parseGradientPosition(tokens) {
  if (tokens.length === 0) {
    throw new SyntaxError("Gradient position cannot be empty");
  }
  if (tokens.length > 2) {
    throw new SyntaxError(`Invalid gradient position: ${tokens.join(" ")}`);
  }
  const allLengthPercentage = tokens.every(
    (token) => isGradientLengthPercentageToken(token)
  );
  const hasLengthPercentage = tokens.some(
    (token) => isGradientLengthPercentageToken(token)
  );
  if (allLengthPercentage) {
    if (tokens.length !== 2) {
      throw new SyntaxError(`Invalid gradient position: ${tokens.join(" ")}`);
    }
    return {
      kind: "values",
      x: parseGradientLengthPercentage(tokens[0]),
      y: parseGradientLengthPercentage(tokens[1])
    };
  }
  if (hasLengthPercentage) {
    throw new SyntaxError(
      `Invalid mixed gradient position: ${tokens.join(" ")}`
    );
  }
  return parseGradientKeywordPosition(tokens);
}
function formatGradientPosition(position) {
  if (position.kind === "keywords") {
    return `${position.x} ${position.y}`;
  }
  return `${formatGradientLengthPercentage(position.x)} ${formatGradientLengthPercentage(position.y)}`;
}
function validateGradientAngle(value) {
  if (typeof value !== "object" || value === null) {
    throw new TypeError("Gradient angle must be an object");
  }
  if (value.kind !== "angle") {
    throw new TypeError('Gradient angle kind must be "angle"');
  }
  if (typeof value.value !== "number" || !Number.isFinite(value.value)) {
    throw new TypeError("Gradient angle value must be finite");
  }
  if (!isGradientAngleUnit(value.unit)) {
    throw new TypeError(`Invalid gradient angle unit: "${String(value.unit)}"`);
  }
}
function validateGradientLengthPercentage(value) {
  if (typeof value !== "object" || value === null) {
    throw new TypeError("Gradient length-percentage must be an object");
  }
  if (typeof value.value !== "number" || !Number.isFinite(value.value)) {
    throw new TypeError("Gradient length-percentage value must be finite");
  }
  if (value.kind === "percent") {
    return;
  }
  if (value.kind === "length" && isGradientLengthUnit(value.unit)) {
    return;
  }
  throw new TypeError("Invalid gradient length-percentage");
}
function validateGradientPosition(position) {
  if (typeof position !== "object" || position === null) {
    throw new TypeError("Gradient position must be an object");
  }
  if (position.kind === "keywords") {
    if (!isGradientPositionKeywordX(position.x) || !isGradientPositionKeywordY(position.y)) {
      throw new TypeError("Invalid gradient keyword position");
    }
    return;
  }
  if (position.kind === "values") {
    validateGradientLengthPercentage(position.x);
    validateGradientLengthPercentage(position.y);
    return;
  }
  throw new TypeError(
    `Invalid gradient position kind: "${String(position.kind)}"`
  );
}
function isDefaultGradientPosition(position) {
  return position.kind === "keywords" && position.x === "center" && position.y === "center";
}
function parseGradientKeywordPosition(tokens) {
  for (const token of tokens) {
    if (!isGradientPositionKeywordX(token) && !isGradientPositionKeywordY(token)) {
      throw new SyntaxError(`Invalid gradient position token: "${token}"`);
    }
  }
  const hasLeft = tokens.includes("left");
  const hasRight = tokens.includes("right");
  const hasTop = tokens.includes("top");
  const hasBottom = tokens.includes("bottom");
  if (hasLeft && hasRight) {
    throw new SyntaxError(`Invalid gradient position: ${tokens.join(" ")}`);
  }
  if (hasTop && hasBottom) {
    throw new SyntaxError(`Invalid gradient position: ${tokens.join(" ")}`);
  }
  const x = hasLeft ? "left" : hasRight ? "right" : "center";
  const y = hasTop ? "top" : hasBottom ? "bottom" : "center";
  return {
    kind: "keywords",
    x,
    y
  };
}
function isGradientAngleUnit(value) {
  return GRADIENT_ANGLE_UNITS.includes(value);
}
function isGradientLengthUnit(value) {
  return GRADIENT_LENGTH_UNITS$1.includes(value);
}
function isGradientPositionKeywordX(value) {
  return value === "left" || value === "center" || value === "right";
}
function isGradientPositionKeywordY(value) {
  return value === "top" || value === "center" || value === "bottom";
}
const _GradientLinear = class _GradientLinear extends GradientWithStopsBase {
  constructor(stops, config) {
    super(
      "linear-gradient",
      stops,
      _GradientLinear._resolveConfig(config)
    );
  }
  static normalizeConfig(input) {
    const tokens = _GradientLinear._tokenizeConfigInput(input);
    const seen = /* @__PURE__ */ new Set();
    for (const token of tokens) {
      if (seen.has(token.type)) {
        throw new SyntaxError(
          `Duplicate linear gradient config token: "${token.type}"`
        );
      }
      seen.add(token.type);
    }
    const angleToken = tokens.find((token) => token.type === "angle");
    const colorSpaceToken = tokens.find((token) => token.type === "colorSpace");
    const hueToken = tokens.find((token) => token.type === "hue");
    return _GradientLinear._resolveConfig({
      angle: angleToken ? _GradientLinear._parseAngleToken(angleToken.value) : void 0,
      interpolation: {
        colorSpace: (colorSpaceToken == null ? void 0 : colorSpaceToken.value) ?? _GradientLinear.DEFAULT_CONFIG.interpolation.colorSpace,
        hue: hueToken == null ? void 0 : hueToken.value
      }
    });
  }
  static fromString(input) {
    return _GradientLinear.fromAbi(parseStringToAbi(input));
  }
  static fromAbi(abi) {
    var _a, _b;
    if (abi.functionName !== "linear-gradient") {
      throw new Error("Invalid function name for GradientLinear");
    }
    const config = ((_a = abi.inputs[0]) == null ? void 0 : _a.type) === "config" ? _GradientLinear.normalizeConfig(abi.inputs[0].value) : _GradientLinear._resolveConfig();
    const inputsWithoutConfig = ((_b = abi.inputs[0]) == null ? void 0 : _b.type) === "config" ? abi.inputs.slice(1) : abi.inputs;
    const stops = _GradientLinear._normalizeAbiInputsToStops(inputsWithoutConfig);
    return new _GradientLinear(stops, {
      ...config,
      isRepeating: abi.isRepeating
    });
  }
  clone() {
    const snapshot = this.toJSON();
    return new _GradientLinear(snapshot.stops, snapshot.config);
  }
  equals(other) {
    return other instanceof _GradientLinear && JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }
  toJSON() {
    return super.toJSON();
  }
  toString() {
    const functionName = this.isRepeating() ? `repeating-${this.type}` : this.type;
    const config = this._serializeConfig(this.getConfig());
    const stops = this._serializeStopsCompact();
    const parts = [
      config,
      ...stops
    ].filter(Boolean);
    return `${functionName}(${parts.join(", ")})`;
  }
  _validateConfig(config) {
    if (typeof config.angle !== "number" || !Number.isFinite(config.angle)) {
      throw new TypeError("Linear gradient angle must be a finite number");
    }
    if (config.isRepeating !== void 0 && typeof config.isRepeating !== "boolean") {
      throw new TypeError("Linear gradient repeating flag must be a boolean");
    }
    if (typeof config.interpolation !== "object" || config.interpolation === null) {
      throw new TypeError("Linear gradient interpolation must be an object");
    }
    if (!isGradientColorSpace(config.interpolation.colorSpace)) {
      throw new TypeError(
        `Invalid linear gradient color space: "${String(config.interpolation.colorSpace)}"`
      );
    }
    if (config.interpolation.hue !== void 0 && !isGradientHueInterpolation(config.interpolation.hue)) {
      throw new TypeError(
        `Invalid linear gradient hue interpolation: "${String(config.interpolation.hue)}"`
      );
    }
  }
  static _resolveConfig(input = {}) {
    const interpolation = {
      ..._GradientLinear.DEFAULT_CONFIG.interpolation,
      ...input.interpolation
    };
    return {
      angle: normalizeAngleRad(
        input.angle ?? _GradientLinear.DEFAULT_CONFIG.angle
      ),
      interpolation,
      isRepeating: input.isRepeating ?? _GradientLinear.DEFAULT_CONFIG.isRepeating
    };
  }
  static _parseAngleToken(input) {
    if (!input.startsWith("to ")) {
      return normalizeAngleRad(angleValueFromString(input));
    }
    const tokens = input.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
      throw new SyntaxError("Linear gradient angle keyword cannot be empty");
    }
    if (tokens[0] !== "to") {
      throw new SyntaxError(
        'Linear gradient keyword direction must start with "to"'
      );
    }
    const directions = tokens.slice(1);
    if (directions.length === 0 || directions.length > 2) {
      throw new SyntaxError(
        "Linear gradient keyword direction must contain one or two direction tokens"
      );
    }
    const allowed = /* @__PURE__ */ new Set(["top", "right", "bottom", "left"]);
    for (const direction of directions) {
      if (!allowed.has(direction)) {
        throw new SyntaxError(
          `Invalid linear gradient direction token: "${direction}"`
        );
      }
    }
    if (new Set(directions).size !== directions.length) {
      throw new SyntaxError(
        "Linear gradient keyword direction cannot contain duplicate tokens"
      );
    }
    const hasTop = directions.includes("top");
    const hasRight = directions.includes("right");
    const hasBottom = directions.includes("bottom");
    const hasLeft = directions.includes("left");
    if (hasTop && hasBottom || hasLeft && hasRight) {
      throw new SyntaxError(
        "Linear gradient keyword direction contains conflicting tokens"
      );
    }
    if (hasTop && hasLeft) {
      return degToRad(315);
    }
    if (hasTop && hasRight) {
      return degToRad(45);
    }
    if (hasBottom && hasLeft) {
      return degToRad(225);
    }
    if (hasBottom && hasRight) {
      return degToRad(135);
    }
    if (hasTop) {
      return degToRad(0);
    }
    if (hasRight) {
      return degToRad(90);
    }
    if (hasBottom) {
      return degToRad(180);
    }
    if (hasLeft) {
      return degToRad(270);
    }
    throw new SyntaxError(
      `Unsupported linear gradient keyword direction: "${input}"`
    );
  }
  static _tokenizeConfigInput(input) {
    const value = input.trim().toLowerCase();
    if (value.length === 0) {
      throw new SyntaxError("Linear gradient config cannot be empty");
    }
    const parts = value.split(/\s+/);
    const tokens = [];
    for (let index = 0; index < parts.length; index += 1) {
      const part = parts[index];
      if (part === "in") {
        const colorSpace = parts[index + 1];
        if (colorSpace === void 0 || !isGradientColorSpace(colorSpace)) {
          throw new SyntaxError('Expected color space after "in"');
        }
        tokens.push({
          type: "colorSpace",
          value: colorSpace
        });
        index += 1;
        continue;
      }
      if (isAngle(part)) {
        tokens.push({
          type: "angle",
          value: part
        });
        continue;
      }
      if (part === "to") {
        const directionParts = [];
        const firstDirection = parts[index + 1];
        const secondDirection = parts[index + 2];
        if (firstDirection !== void 0) {
          directionParts.push(firstDirection);
        }
        if (secondDirection === "left" || secondDirection === "right") {
          directionParts.push(secondDirection);
        }
        tokens.push({
          type: "angle",
          value: `to ${directionParts.join(" ")}`
        });
        index += directionParts.length;
        continue;
      }
      if (isGradientHueInterpolation(part)) {
        const nextPart = parts[index + 1];
        if (nextPart !== "hue") {
          throw new SyntaxError(`Expected "hue" after "${part}"`);
        }
        tokens.push({
          type: "hue",
          value: part
        });
        index += 1;
        continue;
      }
      throw new SyntaxError(`Unknown linear gradient config token: "${part}"`);
    }
    return tokens;
  }
  _serializeConfig(config) {
    const parts = [
      this._serializeAngle(config.angle),
      this._serializeInterpolation(config.interpolation)
    ].filter(Boolean);
    return parts.join(" ");
  }
  _serializeAngle(angle) {
    const angleDeg = normalizeAngleDeg(radToDeg(angle), 3);
    switch (angleDeg) {
      case 0:
        return "to top";
      case 45:
        return "to top right";
      case 90:
        return "to right";
      case 135:
        return "to bottom right";
      case 180:
        return "";
      case 225:
        return "to bottom left";
      case 270:
        return "to left";
      case 315:
        return "to top left";
      default:
        return `${angleDeg}deg`;
    }
  }
  _serializeInterpolation(interpolation) {
    if (this._isDefaultInterpolation(interpolation)) {
      return "";
    }
    const { colorSpace, hue } = interpolation;
    if (hue === void 0) {
      return `in ${colorSpace}`;
    }
    return `in ${colorSpace} ${hue} hue`;
  }
  _isDefaultInterpolation(interpolation) {
    return interpolation.colorSpace === _GradientLinear.DEFAULT_CONFIG.interpolation.colorSpace && interpolation.hue === void 0;
  }
};
__publicField(_GradientLinear, "DEFAULT_CONFIG", {
  angle: Math.PI,
  interpolation: {
    colorSpace: "srgb"
  },
  isRepeating: false
});
let GradientLinear = _GradientLinear;
const GRADIENT_LENGTH_UNITS = [
  "px",
  "em",
  "rem",
  "vw",
  "vh",
  "vmin",
  "vmax",
  "cm",
  "mm",
  "in",
  "pt",
  "pc"
];
const _GradientRadial = class _GradientRadial extends GradientWithStopsBase {
  constructor(stops, config) {
    super(
      new.target.gradientType,
      stops,
      _GradientRadial._resolveConfig(config)
    );
  }
  static normalizeConfig(input) {
    const value = input.trim().toLowerCase();
    if (value.length === 0) {
      throw new SyntaxError("Radial gradient config cannot be empty");
    }
    return _GradientRadial._parseConfigInput(value);
  }
  static fromString(input) {
    return _GradientRadial.fromAbi(parseStringToAbi(input));
  }
  static fromAbi(abi) {
    var _a;
    if (abi.functionName !== "radial-gradient") {
      throw new Error("Invalid function name for GradientRadial");
    }
    const config = _GradientRadial._parseConfig(abi.inputs);
    const inputsWithoutConfig = ((_a = abi.inputs[0]) == null ? void 0 : _a.type) === "config" ? abi.inputs.slice(1) : abi.inputs;
    const stops = _GradientRadial._normalizeAbiInputsToStops(inputsWithoutConfig);
    return new _GradientRadial(stops, {
      ...config,
      isRepeating: abi.isRepeating
    });
  }
  clone() {
    const snapshot = this.toJSON();
    return new _GradientRadial(snapshot.stops, snapshot.config);
  }
  equals(other) {
    return other instanceof _GradientRadial && JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }
  minColorStopsCount() {
    return 2;
  }
  toJSON() {
    return super.toJSON();
  }
  toString() {
    const functionName = this.isRepeating() ? `repeating-${this.type}` : this.type;
    const config = this._serializeConfig(this.getConfig());
    const stops = this._serializeStopsCompact();
    const parts = [
      config,
      ...stops
    ].filter(Boolean);
    return `${functionName}(${parts.join(", ")})`;
  }
  _validateConfig(config) {
    if (!_GradientRadial._isShape(config.shape)) {
      throw new TypeError(
        `Invalid radial gradient shape: "${String(config.shape)}"`
      );
    }
    this._validateSize(config.size);
    this._validatePosition(config.position);
    if (config.isRepeating !== void 0 && typeof config.isRepeating !== "boolean") {
      throw new TypeError("Radial gradient repeating flag must be a boolean");
    }
    if (typeof config.interpolation !== "object" || config.interpolation === null) {
      throw new TypeError("Radial gradient interpolation must be an object");
    }
    if (!isGradientColorSpace(config.interpolation.colorSpace)) {
      throw new TypeError(
        `Invalid radial gradient color space: "${String(config.interpolation.colorSpace)}"`
      );
    }
    if (config.interpolation.hue !== void 0 && !isGradientHueInterpolation(config.interpolation.hue)) {
      throw new TypeError(
        `Invalid radial gradient hue interpolation: "${String(config.interpolation.hue)}"`
      );
    }
  }
  static _resolveConfig(input = {}) {
    const interpolation = {
      ..._GradientRadial.DEFAULT_CONFIG.interpolation,
      ...input.interpolation
    };
    return {
      shape: input.shape ?? _GradientRadial.DEFAULT_CONFIG.shape,
      size: structuredClone(
        input.size ?? _GradientRadial.DEFAULT_CONFIG.size
      ),
      position: structuredClone(
        input.position ?? _GradientRadial.DEFAULT_CONFIG.position
      ),
      interpolation,
      isRepeating: input.isRepeating ?? _GradientRadial.DEFAULT_CONFIG.isRepeating
    };
  }
  static _parseConfig(inputs) {
    const input = inputs.find((item) => item.type === "config");
    if (input === void 0) {
      return _GradientRadial._resolveConfig();
    }
    return _GradientRadial.normalizeConfig(input.value);
  }
  static _parseConfigInput(input) {
    const tokens = splitTopLevelByWhitespace(input);
    const config = {};
    let seenShape = false;
    let seenSize = false;
    let seenPosition = false;
    let seenInterpolation = false;
    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index];
      if (_GradientRadial._isShape(token)) {
        if (seenShape) {
          throw new SyntaxError("Duplicate radial gradient shape");
        }
        config.shape = token;
        seenShape = true;
        continue;
      }
      if (_GradientRadial._isExtent(token)) {
        if (seenSize) {
          throw new SyntaxError("Duplicate radial gradient size");
        }
        config.size = {
          kind: "extent",
          value: token
        };
        seenSize = true;
        continue;
      }
      if (_GradientRadial._isLengthPercentageToken(token)) {
        if (seenSize) {
          throw new SyntaxError("Duplicate radial gradient size");
        }
        const next = tokens[index + 1];
        if ((config.shape ?? _GradientRadial.DEFAULT_CONFIG.shape) === "ellipse" && _GradientRadial._isLengthPercentageToken(next)) {
          config.size = {
            kind: "explicit",
            x: _GradientRadial._parseLengthPercentage(token),
            y: _GradientRadial._parseLengthPercentage(next)
          };
          index += 1;
        } else {
          config.size = {
            kind: "explicit",
            x: _GradientRadial._parseLengthPercentage(token)
          };
        }
        seenSize = true;
        continue;
      }
      if (token === "at") {
        if (seenPosition) {
          throw new SyntaxError("Duplicate radial gradient position");
        }
        const positionTokens = [];
        for (let positionIndex = index + 1; positionIndex < tokens.length; positionIndex += 1) {
          const positionToken = tokens[positionIndex];
          if (positionToken === "in") {
            break;
          }
          positionTokens.push(positionToken);
        }
        config.position = _GradientRadial._parseRadialPosition(positionTokens);
        index += positionTokens.length;
        seenPosition = true;
        continue;
      }
      if (token === "in") {
        if (seenInterpolation) {
          throw new SyntaxError("Duplicate radial gradient interpolation");
        }
        const colorSpace = tokens[index + 1];
        if (colorSpace === void 0 || !isGradientColorSpace(colorSpace)) {
          throw new SyntaxError(
            "Invalid radial-gradient interpolation: missing color space"
          );
        }
        const maybeHue = tokens[index + 2];
        const maybeHueKeyword = tokens[index + 3];
        if (maybeHue !== void 0) {
          if (!isGradientHueInterpolation(maybeHue)) {
            throw new SyntaxError(
              `Invalid radial-gradient hue interpolation: "${maybeHue}"`
            );
          }
          if (maybeHueKeyword !== "hue") {
            throw new SyntaxError(
              `Expected "hue" after "${maybeHue}"`
            );
          }
          config.interpolation = {
            colorSpace,
            hue: maybeHue
          };
          index += 3;
        } else {
          config.interpolation = {
            colorSpace
          };
          index += 1;
        }
        seenInterpolation = true;
        continue;
      }
      throw new SyntaxError(`Unknown radial gradient config token: "${token}"`);
    }
    return _GradientRadial._resolveConfig(config);
  }
  static _parseRadialPosition(tokens) {
    if (tokens.length === 0) {
      throw new SyntaxError("Radial gradient position cannot be empty");
    }
    if (tokens.length > 2) {
      throw new SyntaxError(
        `Invalid radial-gradient position: ${tokens.join(" ")}`
      );
    }
    const allLengthPercentage = tokens.every(
      (token) => _GradientRadial._isLengthPercentageToken(token)
    );
    const hasLengthPercentage = tokens.some(
      (token) => _GradientRadial._isLengthPercentageToken(token)
    );
    if (allLengthPercentage) {
      if (tokens.length !== 2) {
        throw new SyntaxError(
          `Invalid radial-gradient position: ${tokens.join(" ")}`
        );
      }
      return {
        kind: "values",
        x: _GradientRadial._parseLengthPercentage(tokens[0]),
        y: _GradientRadial._parseLengthPercentage(tokens[1])
      };
    }
    if (hasLengthPercentage) {
      throw new SyntaxError(
        `Invalid mixed radial-gradient position: ${tokens.join(" ")}`
      );
    }
    return _GradientRadial._parseKeywordPosition(tokens);
  }
  static _parseKeywordPosition(tokens) {
    for (const token of tokens) {
      if (!_GradientRadial._isPositionKeywordX(token) && !_GradientRadial._isPositionKeywordY(token)) {
        throw new SyntaxError(
          `Invalid radial-gradient position token: "${token}"`
        );
      }
    }
    const hasLeft = tokens.includes("left");
    const hasRight = tokens.includes("right");
    const hasTop = tokens.includes("top");
    const hasBottom = tokens.includes("bottom");
    if (hasLeft && hasRight) {
      throw new SyntaxError(
        `Invalid radial-gradient position: ${tokens.join(" ")}`
      );
    }
    if (hasTop && hasBottom) {
      throw new SyntaxError(
        `Invalid radial-gradient position: ${tokens.join(" ")}`
      );
    }
    const x = hasLeft ? "left" : hasRight ? "right" : "center";
    const y = hasTop ? "top" : hasBottom ? "bottom" : "center";
    return {
      kind: "keywords",
      x,
      y
    };
  }
  static _parseLengthPercentage(input) {
    const percentMatch = input.match(/^([+-]?(?:\d+\.?\d*|\.\d+))%$/);
    if (percentMatch !== null) {
      return {
        kind: "percent",
        value: Number(percentMatch[1])
      };
    }
    const lengthMatch = input.match(
      /^([+-]?(?:\d+\.?\d*|\.\d+))([a-z]+)$/
    );
    if (lengthMatch === null || !_GradientRadial._isLengthUnit(lengthMatch[2])) {
      throw new SyntaxError(`Invalid length-percentage: "${input}"`);
    }
    return {
      kind: "length",
      value: Number(lengthMatch[1]),
      unit: lengthMatch[2]
    };
  }
  static _isShape(value) {
    return value === "circle" || value === "ellipse";
  }
  static _isExtent(value) {
    return value === "closest-side" || value === "closest-corner" || value === "farthest-side" || value === "farthest-corner";
  }
  static _isLengthPercentageToken(value) {
    if (value === void 0) {
      return false;
    }
    return /^([+-]?(?:\d+\.?\d*|\.\d+))%$/.test(value) || /^([+-]?(?:\d+\.?\d*|\.\d+))[a-z]+$/.test(value);
  }
  static _isLengthUnit(value) {
    return GRADIENT_LENGTH_UNITS.includes(value);
  }
  static _isPositionKeywordX(value) {
    return value === "left" || value === "center" || value === "right";
  }
  static _isPositionKeywordY(value) {
    return value === "top" || value === "center" || value === "bottom";
  }
  _serializeConfig(config) {
    const parts = [
      this._serializeRadialConfig(config),
      this._serializeInterpolation(config.interpolation)
    ].filter(Boolean);
    return parts.join(" ");
  }
  _serializeRadialConfig(config) {
    const parts = [];
    if (!this._isDefaultShape(config.shape)) {
      parts.push(config.shape);
    }
    if (!this._isDefaultSize(config.size)) {
      parts.push(this._serializeSize(config.size));
    }
    if (!this._isDefaultPosition(config.position)) {
      parts.push(`at ${this._serializePosition(config.position)}`);
    }
    return parts.join(" ");
  }
  _serializeSize(size) {
    if (size.kind === "extent") {
      return size.value;
    }
    const x = this._formatLengthPercentage(size.x);
    if (size.y === void 0) {
      return x;
    }
    return `${x} ${this._formatLengthPercentage(size.y)}`;
  }
  _serializePosition(position) {
    if (position.kind === "keywords") {
      return `${position.x} ${position.y}`;
    }
    return `${this._formatLengthPercentage(position.x)} ${this._formatLengthPercentage(position.y)}`;
  }
  _serializeInterpolation(interpolation) {
    if (this._isDefaultInterpolation(interpolation)) {
      return "";
    }
    if (interpolation.hue === void 0) {
      return `in ${interpolation.colorSpace}`;
    }
    return `in ${interpolation.colorSpace} ${interpolation.hue} hue`;
  }
  _formatLengthPercentage(value) {
    if (value.kind === "percent") {
      return `${value.value}%`;
    }
    return `${value.value}${value.unit}`;
  }
  _isDefaultShape(shape) {
    return shape === _GradientRadial.DEFAULT_CONFIG.shape;
  }
  _isDefaultSize(size) {
    return size.kind === "extent" && _GradientRadial.DEFAULT_CONFIG.size.kind === "extent" && size.value === _GradientRadial.DEFAULT_CONFIG.size.value;
  }
  _isDefaultPosition(position) {
    const defaultPosition = _GradientRadial.DEFAULT_CONFIG.position;
    return position.kind === "keywords" && defaultPosition.kind === "keywords" && position.x === defaultPosition.x && position.y === defaultPosition.y;
  }
  _isDefaultInterpolation(interpolation) {
    return interpolation.colorSpace === _GradientRadial.DEFAULT_CONFIG.interpolation.colorSpace && interpolation.hue === void 0;
  }
  _validateSize(size) {
    if (typeof size !== "object" || size === null) {
      throw new TypeError("Radial gradient size must be an object");
    }
    if (size.kind === "extent") {
      if (!_GradientRadial._isExtent(size.value)) {
        throw new TypeError(
          `Invalid radial gradient extent: "${String(size.value)}"`
        );
      }
      return;
    }
    if (size.kind === "explicit") {
      this._validateLengthPercentage(size.x);
      if (size.y !== void 0) {
        this._validateLengthPercentage(size.y);
      }
      return;
    }
    throw new TypeError(
      `Invalid radial gradient size kind: "${String(size.kind)}"`
    );
  }
  _validatePosition(position) {
    if (typeof position !== "object" || position === null) {
      throw new TypeError("Radial gradient position must be an object");
    }
    if (position.kind === "keywords") {
      if (!_GradientRadial._isPositionKeywordX(position.x) || !_GradientRadial._isPositionKeywordY(position.y)) {
        throw new TypeError("Invalid radial gradient keyword position");
      }
      return;
    }
    if (position.kind === "values") {
      this._validateLengthPercentage(position.x);
      this._validateLengthPercentage(position.y);
      return;
    }
    throw new TypeError(
      `Invalid radial gradient position kind: "${String(position.kind)}"`
    );
  }
  _validateLengthPercentage(value) {
    if (typeof value !== "object" || value === null) {
      throw new TypeError("Gradient length-percentage must be an object");
    }
    if (typeof value.value !== "number" || !Number.isFinite(value.value)) {
      throw new TypeError("Gradient length-percentage value must be finite");
    }
    if (value.kind === "percent") {
      return;
    }
    if (value.kind === "length" && _GradientRadial._isLengthUnit(value.unit)) {
      return;
    }
    throw new TypeError("Invalid gradient length-percentage");
  }
};
__publicField(_GradientRadial, "gradientType", "radial-gradient");
__publicField(_GradientRadial, "DEFAULT_CONFIG", {
  shape: "ellipse",
  size: {
    kind: "extent",
    value: "farthest-corner"
  },
  position: {
    kind: "keywords",
    x: "center",
    y: "center"
  },
  interpolation: {
    colorSpace: "srgb"
  },
  isRepeating: false
});
let GradientRadial = _GradientRadial;
const _GradientConic = class _GradientConic extends GradientWithStopsBase {
  constructor(stops, config) {
    super(
      "conic-gradient",
      stops,
      _GradientConic._resolveConfig(config)
    );
  }
  static normalizeConfig(input) {
    const value = input.trim().toLowerCase();
    if (value.length === 0) {
      throw new SyntaxError("Conic gradient config cannot be empty");
    }
    return _GradientConic._parseConfigInput(value);
  }
  static fromString(input) {
    return _GradientConic.fromAbi(parseStringToAbi(input));
  }
  static fromAbi(abi) {
    if (abi.functionName !== "conic-gradient") {
      throw new Error("Invalid function name for GradientConic");
    }
    const configInput = abi.inputs.find((input) => input.type === "config");
    const config = configInput ? _GradientConic.normalizeConfig(configInput.value) : _GradientConic._resolveConfig();
    const inputsWithoutConfig = abi.inputs.filter(
      (input) => input.type !== "config"
    );
    const stops = _GradientConic._normalizeAbiInputsToStops(inputsWithoutConfig);
    return new _GradientConic(stops, {
      ...config,
      isRepeating: abi.isRepeating
    });
  }
  clone() {
    const snapshot = this.toJSON();
    return new _GradientConic(snapshot.stops, snapshot.config);
  }
  equals(other) {
    return other instanceof _GradientConic && JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }
  minColorStopsCount() {
    return 2;
  }
  toJSON() {
    return super.toJSON();
  }
  toString() {
    const functionName = this.isRepeating() ? `repeating-${this.type}` : this.type;
    const config = this._serializeConfig(this.getConfig());
    const stops = this._serializeStopsCompact();
    const parts = [
      config,
      ...stops
    ].filter(Boolean);
    return `${functionName}(${parts.join(", ")})`;
  }
  _validateConfig(config) {
    validateGradientAngle(config.from);
    validateGradientPosition(config.position);
    if (config.isRepeating !== void 0 && typeof config.isRepeating !== "boolean") {
      throw new TypeError("Conic gradient repeating flag must be a boolean");
    }
    if (typeof config.interpolation !== "object" || config.interpolation === null) {
      throw new TypeError("Conic gradient interpolation must be an object");
    }
    if (!isGradientColorSpace(config.interpolation.colorSpace)) {
      throw new TypeError(
        `Invalid conic gradient color space: "${String(config.interpolation.colorSpace)}"`
      );
    }
    if (config.interpolation.hue !== void 0 && !isGradientHueInterpolation(config.interpolation.hue)) {
      throw new TypeError(
        `Invalid conic gradient hue interpolation: "${String(config.interpolation.hue)}"`
      );
    }
  }
  static _resolveConfig(input = {}) {
    const interpolation = {
      ..._GradientConic.DEFAULT_CONFIG.interpolation,
      ...input.interpolation
    };
    return {
      from: structuredClone(
        input.from ?? _GradientConic.DEFAULT_CONFIG.from
      ),
      position: structuredClone(
        input.position ?? _GradientConic.DEFAULT_CONFIG.position
      ),
      interpolation,
      isRepeating: input.isRepeating ?? _GradientConic.DEFAULT_CONFIG.isRepeating
    };
  }
  static _parseConfigInput(input) {
    const tokens = splitTopLevelByWhitespace(input);
    const config = {};
    let seenFrom = false;
    let seenPosition = false;
    let seenInterpolation = false;
    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index];
      if (token === "from") {
        if (seenFrom) {
          throw new SyntaxError("Duplicate conic gradient from angle");
        }
        const angle = tokens[index + 1];
        if (angle === void 0) {
          throw new SyntaxError(
            "Invalid conic-gradient config: missing angle after from"
          );
        }
        config.from = parseGradientAngle(angle);
        seenFrom = true;
        index += 1;
        continue;
      }
      if (token === "at") {
        if (seenPosition) {
          throw new SyntaxError("Duplicate conic gradient position");
        }
        const positionTokens = [];
        for (let positionIndex = index + 1; positionIndex < tokens.length; positionIndex += 1) {
          const positionToken = tokens[positionIndex];
          if (positionToken === "in") {
            break;
          }
          positionTokens.push(positionToken);
        }
        config.position = parseGradientPosition(positionTokens);
        seenPosition = true;
        index += positionTokens.length;
        continue;
      }
      if (token === "in") {
        if (seenInterpolation) {
          throw new SyntaxError("Duplicate conic gradient interpolation");
        }
        const colorSpace = tokens[index + 1];
        if (colorSpace === void 0 || !isGradientColorSpace(colorSpace)) {
          throw new SyntaxError(
            "Invalid conic-gradient interpolation: missing color space"
          );
        }
        const maybeHue = tokens[index + 2];
        const maybeHueKeyword = tokens[index + 3];
        if (maybeHue !== void 0) {
          if (!isGradientHueInterpolation(maybeHue)) {
            throw new SyntaxError(
              `Invalid conic-gradient hue interpolation: "${maybeHue}"`
            );
          }
          if (maybeHueKeyword !== "hue") {
            throw new SyntaxError(
              `Expected "hue" after "${maybeHue}"`
            );
          }
          config.interpolation = {
            colorSpace,
            hue: maybeHue
          };
          seenInterpolation = true;
          index += 3;
          continue;
        }
        config.interpolation = {
          colorSpace
        };
        seenInterpolation = true;
        index += 1;
        continue;
      }
      throw new SyntaxError(`Unknown conic gradient config token: "${token}"`);
    }
    return _GradientConic._resolveConfig(config);
  }
  _serializeConfig(config) {
    const parts = [];
    if (!this._isDefaultFrom(config.from)) {
      parts.push(`from ${formatGradientAngle(config.from)}`);
    }
    if (!isDefaultGradientPosition(config.position)) {
      parts.push(`at ${formatGradientPosition(config.position)}`);
    }
    const interpolation = this._serializeInterpolation(config.interpolation);
    if (interpolation.length > 0) {
      parts.push(interpolation);
    }
    return parts.join(" ");
  }
  _serializeInterpolation(interpolation) {
    if (this._isDefaultInterpolation(interpolation)) {
      return "";
    }
    if (interpolation.hue === void 0) {
      return `in ${interpolation.colorSpace}`;
    }
    return `in ${interpolation.colorSpace} ${interpolation.hue} hue`;
  }
  _isDefaultFrom(from) {
    return from.value === 0 && from.unit === "deg";
  }
  _isDefaultInterpolation(interpolation) {
    return interpolation.colorSpace === _GradientConic.DEFAULT_CONFIG.interpolation.colorSpace && interpolation.hue === void 0;
  }
};
__publicField(_GradientConic, "DEFAULT_CONFIG", {
  from: {
    kind: "angle",
    value: 0,
    unit: "deg"
  },
  position: {
    kind: "keywords",
    x: "center",
    y: "center"
  },
  interpolation: {
    colorSpace: "srgb"
  },
  isRepeating: false
});
let GradientConic = _GradientConic;
const _GradientDiamond = class _GradientDiamond extends GradientRadial {
  constructor(stops, config) {
    super(stops, config);
  }
  static fromString(input) {
    return _GradientDiamond.fromAbi(parseStringToAbi(input));
  }
  static fromAbi(abi) {
    var _a;
    if (abi.functionName !== "diamond-gradient") {
      throw new Error("Invalid function name for GradientDiamond");
    }
    const config = this._parseConfig(abi.inputs);
    const inputsWithoutConfig = ((_a = abi.inputs[0]) == null ? void 0 : _a.type) === "config" ? abi.inputs.slice(1) : abi.inputs;
    const stops = this._normalizeAbiInputsToStops(inputsWithoutConfig);
    return new _GradientDiamond(stops, {
      ...config,
      isRepeating: abi.isRepeating
    });
  }
  clone() {
    const snapshot = this.toJSON();
    return new _GradientDiamond(snapshot.stops, snapshot.config);
  }
  equals(other) {
    return other instanceof _GradientDiamond && JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }
  toJSON() {
    return super.toJSON();
  }
};
__publicField(_GradientDiamond, "gradientType", "diamond-gradient");
let GradientDiamond = _GradientDiamond;
const toRgb$2 = converter("rgb");
function getHueFixup$1(hue) {
  switch (hue) {
    case "longer":
      return fixupHueLonger;
    case "increasing":
      return fixupHueIncreasing;
    case "decreasing":
      return fixupHueDecreasing;
    default:
      return fixupHueShorter;
  }
}
function colorSpaceToCuloriMode$1(colorSpace) {
  switch (colorSpace) {
    case "a98-rgb":
      return "a98";
    case "display-p3":
      return "p3";
    case "prophoto-rgb":
      return "prophoto";
    case "xyz":
      return "xyz65";
    case "srgb":
    case "srgb-linear":
      return "rgb";
    default:
      return colorSpace;
  }
}
function getCuloriModeChannels(mode) {
  const definition = getMode(mode);
  if (definition === void 0) {
    throw new Error(`Unsupported Culori color mode: ${mode}`);
  }
  return definition.channels.filter((channel) => channel !== "alpha");
}
function createCuloriInterpolationOverrides$1(interpolation) {
  if (interpolation.hue === void 0) {
    return void 0;
  }
  return {
    h: {
      fixup: getHueFixup$1(interpolation.hue)
    }
  };
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function clampUnit(value) {
  return clamp(value, 0, 1);
}
function clampIndex(index, length) {
  return clamp(index, 0, length - 1);
}
function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}
function normalizeHue(value) {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}
function formatMeshColor(input) {
  const color = toRgb$2(input);
  if (!color) {
    throw new Error("Failed to convert sampled mesh color to rgb");
  }
  const formatted = formatRgb(color);
  if (formatted === void 0) {
    throw new Error("Failed to format sampled mesh color");
  }
  return formatted;
}
function toMeshRgbColor(input) {
  const color = toRgb$2(input);
  if (!color) {
    throw new Error("Failed to convert sampled mesh color to rgb");
  }
  return [
    clampUnit(color.r ?? 0),
    clampUnit(color.g ?? 0),
    clampUnit(color.b ?? 0),
    clampUnit(color.alpha ?? 1)
  ];
}
function readMeshVertexGridCoordinate(id) {
  const separated = id.match(/^v(\d+)[_-](\d+)$/);
  if (separated !== null) {
    return {
      column: Number(separated[1]),
      row: Number(separated[2])
    };
  }
  const compact = id.match(/^v(\d)(\d)$/);
  if (compact !== null) {
    return {
      column: Number(compact[1]),
      row: Number(compact[2])
    };
  }
  return null;
}
function buildRegularVertexGrid(vertices, config) {
  const grid = buildRegularVertexGridFromIds(vertices, config);
  if (grid === null) {
    throw new Error(
      "Bicubic mesh sampling requires regular vertex ids such as v00, v10, v01, v11"
    );
  }
  return grid;
}
function buildRegularVertexGridFromIds(vertices, config) {
  const result = Array.from(
    { length: config.rows },
    () => Array.from({ length: config.columns })
  );
  for (const vertex of vertices) {
    const coordinate = readMeshVertexGridCoordinate(vertex.id);
    if (coordinate === null) {
      return null;
    }
    if (coordinate.row < 0 || coordinate.column < 0 || coordinate.row >= config.rows || coordinate.column >= config.columns) {
      return null;
    }
    if (result[coordinate.row][coordinate.column] !== void 0) {
      return null;
    }
    result[coordinate.row][coordinate.column] = vertex;
  }
  if (result.some(
    (row) => row.some((vertex) => vertex === void 0)
  )) {
    return null;
  }
  return result;
}
function findPatchCell(grid, patch) {
  for (let row = 0; row < grid.length - 1; row += 1) {
    for (let column = 0; column < grid[row].length - 1; column += 1) {
      if (grid[row][column].id === patch.topLeft && grid[row][column + 1].id === patch.topRight && grid[row + 1][column + 1].id === patch.bottomRight && grid[row + 1][column].id === patch.bottomLeft) {
        return {
          row,
          column
        };
      }
    }
  }
  throw new Error(
    `Mesh patch does not match adjacent regular grid vertices: ${patch.id}`
  );
}
function normalizeHueSamples(values, hue) {
  const result = [...values];
  for (let index = 1; index < result.length; index += 1) {
    const previous = result[index - 1];
    let current = result[index];
    if (hue === "increasing") {
      while (current < previous) {
        current += 360;
      }
    } else if (hue === "decreasing") {
      while (current > previous) {
        current -= 360;
      }
    } else if (hue === "longer") {
      const delta = current - previous;
      if (delta > 0 && delta < 180) {
        current -= 360;
      } else if (delta < 0 && delta > -180) {
        current += 360;
      }
    } else {
      while (current - previous > 180) {
        current -= 360;
      }
      while (current - previous < -180) {
        current += 360;
      }
    }
    result[index] = current;
  }
  return result;
}
function createMeshColorSampler(vertices, patches, config) {
  const vertexById = new Map(vertices.map((vertex) => [vertex.id, vertex]));
  const patchById = new Map(patches.map((patch) => [patch.id, patch]));
  const mode = colorSpaceToCuloriMode$1(config.interpolation.colorSpace);
  const interpolationOverrides = createCuloriInterpolationOverrides$1(config.interpolation);
  const pairInterpolatorCache = /* @__PURE__ */ new Map();
  let bicubicContext;
  function getVertexOrThrow(id) {
    const vertex = vertexById.get(id);
    if (vertex === void 0) {
      throw new Error(`Mesh vertex not found: ${id}`);
    }
    return vertex;
  }
  function getPatchOrThrow(id) {
    const patch = patchById.get(id);
    if (patch === void 0) {
      throw new Error(`Mesh patch not found: ${id}`);
    }
    return patch;
  }
  function getPairInterpolator(left, right) {
    const cacheKey = `${left}\0${right}`;
    const cached = pairInterpolatorCache.get(cacheKey);
    if (cached !== void 0) {
      return cached;
    }
    const colorInterpolator = interpolate(
      [left, right],
      mode,
      interpolationOverrides
    );
    pairInterpolatorCache.set(cacheKey, colorInterpolator);
    return colorInterpolator;
  }
  function interpolateColor(left, right, t) {
    if (typeof left === "string" && typeof right === "string") {
      return getPairInterpolator(left, right)(t);
    }
    const colorInterpolator = interpolate(
      [left, right],
      mode,
      interpolationOverrides
    );
    return colorInterpolator(t);
  }
  function sampleBilinearPatchColor(patch, u, v) {
    const topLeft = getVertexOrThrow(patch.topLeft);
    const topRight = getVertexOrThrow(patch.topRight);
    const bottomRight = getVertexOrThrow(patch.bottomRight);
    const bottomLeft = getVertexOrThrow(patch.bottomLeft);
    const top = interpolateColor(topLeft.color, topRight.color, u);
    const bottom = interpolateColor(
      bottomLeft.color,
      bottomRight.color,
      u
    );
    return interpolateColor(top, bottom, v);
  }
  function buildBicubicSampleContext() {
    const grid = buildRegularVertexGrid(vertices, config);
    const channels = getCuloriModeChannels(mode);
    const toMode = converter(mode);
    const vertexChannels = /* @__PURE__ */ new Map();
    const patchCells = /* @__PURE__ */ new Map();
    for (const vertex of vertices) {
      const values = /* @__PURE__ */ new Map();
      const rgb = toRgb$2(vertex.color);
      if (!rgb) {
        throw new Error(`Failed to convert mesh vertex color: ${vertex.color}`);
      }
      values.set("alpha", rgb.alpha ?? 1);
      const color = toMode(vertex.color);
      if (color === void 0) {
        throw new Error(`Failed to convert mesh vertex color: ${vertex.color}`);
      }
      for (const channel of channels) {
        const value = color[channel];
        values.set(
          channel,
          typeof value === "number" && Number.isFinite(value) ? value : 0
        );
      }
      vertexChannels.set(vertex.id, values);
    }
    for (const patch of patches) {
      patchCells.set(patch.id, findPatchCell(grid, patch));
    }
    return {
      grid,
      patchCells,
      mode,
      channels,
      hue: config.interpolation.hue,
      vertexChannels
    };
  }
  function getBicubicSampleContext() {
    bicubicContext ?? (bicubicContext = buildBicubicSampleContext());
    return bicubicContext;
  }
  function readColorChannel(context, vertex, channel) {
    const channels = context.vertexChannels.get(vertex.id);
    if (channels === void 0) {
      throw new Error(`Failed to read mesh vertex color: ${vertex.color}`);
    }
    return channels.get(channel) ?? 0;
  }
  function sampleBicubicColorChannel(context, row, column, channel, u, v) {
    var _a;
    const rows = context.grid.length;
    const columns = ((_a = context.grid[0]) == null ? void 0 : _a.length) ?? 0;
    const horizontal = [];
    for (let y = -1; y <= 2; y += 1) {
      const sampleRow = context.grid[clampIndex(row + y, rows)];
      const values = [
        readColorChannel(
          context,
          sampleRow[clampIndex(column - 1, columns)],
          channel
        ),
        readColorChannel(
          context,
          sampleRow[clampIndex(column, columns)],
          channel
        ),
        readColorChannel(
          context,
          sampleRow[clampIndex(column + 1, columns)],
          channel
        ),
        readColorChannel(
          context,
          sampleRow[clampIndex(column + 2, columns)],
          channel
        )
      ];
      const fixedValues = channel === "h" ? normalizeHueSamples(values, context.hue) : values;
      horizontal.push(catmullRom(
        fixedValues[0],
        fixedValues[1],
        fixedValues[2],
        fixedValues[3],
        u
      ));
    }
    const vertical = channel === "h" ? normalizeHueSamples(horizontal, context.hue) : horizontal;
    const sampled = catmullRom(
      vertical[0],
      vertical[1],
      vertical[2],
      vertical[3],
      v
    );
    return channel === "h" ? normalizeHue(sampled) : sampled;
  }
  function sampleBicubicPatchColor(patch, u, v) {
    const context = getBicubicSampleContext();
    const cell = context.patchCells.get(patch.id);
    if (cell === void 0) {
      throw new Error(
        `Mesh patch does not match adjacent regular grid vertices: ${patch.id}`
      );
    }
    const color = {
      mode: context.mode
    };
    for (const channel of context.channels) {
      color[channel] = sampleBicubicColorChannel(
        context,
        cell.row,
        cell.column,
        channel,
        u,
        v
      );
    }
    color.alpha = clampUnit(sampleBicubicColorChannel(
      context,
      cell.row,
      cell.column,
      "alpha",
      u,
      v
    ));
    return color;
  }
  function samplePatchColorValue(patchId, u, v) {
    const patch = getPatchOrThrow(patchId);
    if (config.method === "bicubic") {
      return sampleBicubicPatchColor(patch, u, v);
    }
    return sampleBilinearPatchColor(patch, u, v);
  }
  return {
    samplePatchColor: (patchId, u, v) => formatMeshColor(samplePatchColorValue(patchId, u, v)),
    samplePatchColorRgb: (patchId, u, v) => toMeshRgbColor(samplePatchColorValue(
      patchId,
      clampUnit(u),
      clampUnit(v)
    ))
  };
}
const MESH_ID_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const MESH_PATCH_SIDES = [
  "top",
  "right",
  "bottom",
  "left"
];
const _GradientMesh = class _GradientMesh extends GradientBase {
  constructor(vertices, patches, config) {
    super(
      "mesh-gradient",
      _GradientMesh._resolveConfig(vertices, patches, config)
    );
    __publicField(this, "_vertices");
    __publicField(this, "_patches");
    __publicField(this, "_colorSampler");
    this._vertices = structuredClone(vertices);
    this._patches = structuredClone(patches);
    this._validateMesh();
  }
  static normalizeConfig(input) {
    const tokens = splitTopLevelByWhitespace(input.trim().toLowerCase());
    if (tokens.length === 0) {
      throw new SyntaxError("Mesh gradient config cannot be empty");
    }
    return _GradientMesh._resolveConfig([], [], _GradientMesh._parseConfig(tokens));
  }
  static fromString(input) {
    const { functionName, isRepeating, inputs } = _GradientMesh._parseFunction(input);
    if (functionName !== "mesh-gradient") {
      throw new Error("Invalid function name for GradientMesh");
    }
    if (isRepeating) {
      throw new Error("GradientMesh does not support repeating gradients");
    }
    let config;
    const vertices = [];
    const patches = [];
    const handles = [];
    for (const rawInput of inputs) {
      const tokens = splitTopLevelByWhitespace(rawInput);
      const kind = tokens[0];
      if (kind === "grid") {
        if (config !== void 0) {
          throw new Error("mesh-gradient can only contain one grid config");
        }
        config = _GradientMesh._parseConfig(tokens);
        continue;
      }
      if (kind === "vertex") {
        vertices.push(_GradientMesh._parseVertex(tokens));
        continue;
      }
      if (kind === "patch") {
        patches.push(_GradientMesh._parsePatch(tokens));
        continue;
      }
      if (kind === "handle") {
        handles.push(_GradientMesh._parseHandle(tokens));
        continue;
      }
      throw new Error(`Unsupported mesh-gradient input: ${rawInput}`);
    }
    return new _GradientMesh(
      vertices,
      _GradientMesh._attachHandles(patches, handles),
      config
    );
  }
  static fromAbi(abi) {
    if (abi.functionName !== "mesh-gradient") {
      throw new Error("Invalid function name for GradientMesh");
    }
    if (abi.isRepeating) {
      throw new Error("GradientMesh does not support repeating gradients");
    }
    return _GradientMesh.fromString(
      `${abi.functionName}(${abi.inputs.map((input) => input.value).join(", ")})`
    );
  }
  clone() {
    const snapshot = this.toJSON();
    return new _GradientMesh(
      snapshot.vertices,
      snapshot.patches,
      snapshot.config
    );
  }
  equals(other) {
    return other instanceof _GradientMesh && JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON());
  }
  toJSON() {
    return {
      ...super.toJSON(),
      vertices: this.getVertices(),
      patches: this.getPatches()
    };
  }
  toString() {
    const parts = [
      this._serializeConfig(this.getConfig()),
      ...this._vertices.map((vertex) => this._serializeVertex(vertex)),
      ...this._patches.map((patch) => this._serializePatch(patch)),
      ...this._patches.flatMap((patch) => this._serializeHandles(patch))
    ];
    return `${this.type}(${parts.join(", ")})`;
  }
  getVertices() {
    return structuredClone(this._vertices);
  }
  getPatches() {
    return structuredClone(this._patches);
  }
  getVertex(id) {
    const vertex = this._vertices.find((item) => item.id === id);
    return vertex ? structuredClone(vertex) : null;
  }
  getPatch(id) {
    const patch = this._patches.find((item) => item.id === id);
    return patch ? structuredClone(patch) : null;
  }
  samplePatchColor(patchId, u, v) {
    this._validateSampleCoordinate(u, "u");
    this._validateSampleCoordinate(v, "v");
    return this._getColorSampler().samplePatchColor(patchId, u, v);
  }
  _validateConfig(config) {
    if (!Number.isInteger(config.rows) || config.rows < 2) {
      throw new TypeError("Mesh gradient rows must be an integer >= 2");
    }
    if (!Number.isInteger(config.columns) || config.columns < 2) {
      throw new TypeError("Mesh gradient columns must be an integer >= 2");
    }
    if (!_GradientMesh._isInterpolationMethod(config.method)) {
      throw new TypeError("Invalid mesh gradient interpolation method");
    }
    if (typeof config.interpolation !== "object" || config.interpolation === null) {
      throw new TypeError("Mesh gradient interpolation must be an object");
    }
    if (!isGradientColorSpace(config.interpolation.colorSpace)) {
      throw new TypeError(
        `Invalid mesh gradient color space: "${String(config.interpolation.colorSpace)}"`
      );
    }
    if (config.interpolation.hue !== void 0 && !isGradientHueInterpolation(config.interpolation.hue)) {
      throw new TypeError(
        `Invalid mesh gradient hue interpolation: "${String(config.interpolation.hue)}"`
      );
    }
  }
  static _resolveConfig(vertices, patches, input = {}) {
    var _a, _b;
    const inferred = _GradientMesh._inferGridSize(vertices, patches);
    const rows = input.rows ?? (inferred == null ? void 0 : inferred.rows) ?? _GradientMesh.DEFAULT_CONFIG.rows;
    const columns = input.columns ?? (inferred == null ? void 0 : inferred.columns) ?? _GradientMesh._inferMissingColumns(vertices, rows) ?? _GradientMesh.DEFAULT_CONFIG.columns;
    const interpolation = _GradientMesh._normalizeInterpolation({
      colorSpace: ((_a = input.interpolation) == null ? void 0 : _a.colorSpace) ?? _GradientMesh.DEFAULT_CONFIG.interpolation.colorSpace,
      hue: (_b = input.interpolation) == null ? void 0 : _b.hue
    });
    return {
      rows,
      columns,
      method: input.method ?? _GradientMesh.DEFAULT_CONFIG.method,
      interpolation
    };
  }
  static _inferMissingColumns(vertices, rows) {
    if (vertices.length === 0 || !Number.isInteger(rows) || rows < 2 || vertices.length % rows !== 0) {
      return void 0;
    }
    const columns = vertices.length / rows;
    return columns >= 2 ? columns : void 0;
  }
  static _inferGridSize(vertices, patches) {
    return _GradientMesh._inferGridSizeFromVertexIds(vertices) ?? _GradientMesh._inferGridSizeFromCounts(vertices.length, patches.length);
  }
  static _inferGridSizeFromVertexIds(vertices) {
    if (vertices.length === 0) {
      return void 0;
    }
    const coordinates = vertices.map(
      (vertex) => readMeshVertexGridCoordinate(vertex.id)
    );
    if (coordinates.some((coordinate) => coordinate === null)) {
      return void 0;
    }
    const typedCoordinates = coordinates;
    const rows = Math.max(...typedCoordinates.map((item) => item.row)) + 1;
    const columns = Math.max(...typedCoordinates.map((item) => item.column)) + 1;
    if (rows * columns !== vertices.length) {
      return void 0;
    }
    return {
      rows,
      columns
    };
  }
  static _inferGridSizeFromCounts(vertexCount, patchCount) {
    if (vertexCount < 4 || patchCount < 1) {
      return void 0;
    }
    const candidates = [];
    for (let rows = 2; rows <= vertexCount; rows += 1) {
      if (vertexCount % rows !== 0) {
        continue;
      }
      const columns = vertexCount / rows;
      if (columns < 2) {
        continue;
      }
      if ((rows - 1) * (columns - 1) === patchCount) {
        candidates.push({
          rows,
          columns
        });
      }
    }
    if (candidates.length === 1) {
      return candidates[0];
    }
    return candidates.find((item) => item.rows === item.columns);
  }
  static _parseConfig(tokens) {
    if (tokens[0] !== "grid" || tokens.length < 3) {
      throw new SyntaxError("Invalid mesh grid config");
    }
    const rows = Number(tokens[1]);
    const columns = Number(tokens[2]);
    let method;
    let interpolation;
    let seenMethod = false;
    let seenInterpolation = false;
    for (let index = 3; index < tokens.length; index += 1) {
      const token = tokens[index];
      if (token === "method") {
        if (seenMethod) {
          throw new SyntaxError("Duplicate mesh gradient method");
        }
        const value = tokens[index + 1];
        if (!_GradientMesh._isInterpolationMethod(value)) {
          throw new SyntaxError(`Invalid mesh gradient method: ${value}`);
        }
        method = value;
        seenMethod = true;
        index += 1;
        continue;
      }
      if (token === "in") {
        if (seenInterpolation) {
          throw new SyntaxError("Duplicate mesh gradient interpolation");
        }
        const colorSpace = tokens[index + 1];
        if (colorSpace === void 0 || !isGradientColorSpace(colorSpace)) {
          throw new SyntaxError(
            "Invalid mesh-gradient interpolation: missing color space"
          );
        }
        const maybeHue = tokens[index + 2];
        const maybeHueKeyword = tokens[index + 3];
        if (maybeHue !== void 0 && maybeHueKeyword === "hue") {
          if (!isGradientHueInterpolation(maybeHue)) {
            throw new SyntaxError(
              `Invalid mesh-gradient hue interpolation: "${maybeHue}"`
            );
          }
          interpolation = {
            colorSpace,
            hue: maybeHue
          };
          seenInterpolation = true;
          index += 3;
          continue;
        }
        interpolation = {
          colorSpace
        };
        seenInterpolation = true;
        index += 1;
        continue;
      }
      throw new SyntaxError(`Unsupported mesh grid config token: ${token}`);
    }
    return {
      rows,
      columns,
      method,
      interpolation
    };
  }
  static _parseVertex(tokens) {
    if (tokens.length < 5) {
      throw new SyntaxError("Invalid mesh vertex input");
    }
    return {
      id: tokens[1],
      x: _GradientMesh._parseLengthPercentage(tokens[2]),
      y: _GradientMesh._parseLengthPercentage(tokens[3]),
      color: tokens.slice(4).join(" ")
    };
  }
  static _parsePatch(tokens) {
    if (tokens.length !== 6) {
      throw new SyntaxError("Invalid mesh patch input");
    }
    return {
      id: tokens[1],
      topLeft: tokens[2],
      topRight: tokens[3],
      bottomRight: tokens[4],
      bottomLeft: tokens[5]
    };
  }
  static _parseHandle(tokens) {
    if (tokens.length !== 7) {
      throw new SyntaxError("Invalid mesh handle input");
    }
    const side = tokens[2];
    if (!_GradientMesh._isPatchSide(side)) {
      throw new SyntaxError(`Invalid mesh handle side: ${side}`);
    }
    return {
      patchId: tokens[1],
      side,
      from: {
        x: _GradientMesh._parseLengthPercentage(tokens[3]),
        y: _GradientMesh._parseLengthPercentage(tokens[4])
      },
      to: {
        x: _GradientMesh._parseLengthPercentage(tokens[5]),
        y: _GradientMesh._parseLengthPercentage(tokens[6])
      }
    };
  }
  static _attachHandles(patches, handles) {
    const nextPatches = patches.map((patch) => structuredClone(patch));
    const patchMap = new Map(nextPatches.map((patch) => [patch.id, patch]));
    for (const handle of handles) {
      const patch = patchMap.get(handle.patchId);
      if (patch === void 0) {
        throw new Error(`Mesh handle references missing patch: ${handle.patchId}`);
      }
      patch.handles ?? (patch.handles = {});
      if (patch.handles[handle.side] !== void 0) {
        throw new Error(
          `Duplicate mesh handle for patch ${handle.patchId} side ${handle.side}`
        );
      }
      patch.handles[handle.side] = {
        from: handle.from,
        to: handle.to
      };
    }
    return nextPatches;
  }
  static _parseLengthPercentage(input) {
    return parseGradientLengthPercentage(input);
  }
  static _normalizeInterpolation(interpolation) {
    const { colorSpace, hue } = interpolation;
    if (hue === void 0 || !isGradientPolarColorSpace(colorSpace)) {
      return { colorSpace };
    }
    return {
      colorSpace,
      hue
    };
  }
  static _isInterpolationMethod(value) {
    return value === "bilinear" || value === "bicubic";
  }
  static _isPatchSide(value) {
    return value === "top" || value === "right" || value === "bottom" || value === "left";
  }
  static _parseFunction(input) {
    const source = input.trim();
    const openIndex = source.indexOf("(");
    if (openIndex <= 0) {
      throw new Error("Expected mesh-gradient function call");
    }
    let functionName = source.slice(0, openIndex).trim();
    const isRepeating = functionName.startsWith("repeating-");
    if (isRepeating) {
      functionName = functionName.slice("repeating-".length);
    }
    const closeIndex = _GradientMesh._findOuterClosingParenIndex(
      source,
      openIndex
    );
    if (closeIndex === -1) {
      throw new Error("Unclosed mesh-gradient function parenthesis");
    }
    const trailing = source.slice(closeIndex + 1).trim();
    if (trailing.length > 0 && !trailing.startsWith(`${functionName}(`) && !trailing.startsWith(`repeating-${functionName}(`)) {
      throw new Error(`Unexpected mesh-gradient trailing input: ${trailing}`);
    }
    return {
      functionName,
      isRepeating,
      inputs: _GradientMesh._splitTopLevelInputs(
        source.slice(openIndex + 1, closeIndex)
      )
    };
  }
  static _findOuterClosingParenIndex(value, openIndex) {
    let depth = 0;
    for (let index = openIndex; index < value.length; index += 1) {
      const char = value[index];
      if (char === "(") {
        depth += 1;
        continue;
      }
      if (char === ")") {
        depth -= 1;
        if (depth === 0) {
          return index;
        }
        if (depth < 0) {
          return -1;
        }
      }
    }
    return -1;
  }
  static _splitTopLevelInputs(value) {
    const result = [];
    let current = "";
    let parenDepth = 0;
    let braceDepth = 0;
    let bracketDepth = 0;
    for (let index = 0; index < value.length; index += 1) {
      const char = value[index];
      if (char === "(") {
        parenDepth += 1;
        current += char;
        continue;
      }
      if (char === ")") {
        parenDepth -= 1;
        current += char;
        continue;
      }
      if (char === "{") {
        braceDepth += 1;
        current += char;
        continue;
      }
      if (char === "}") {
        braceDepth -= 1;
        current += char;
        continue;
      }
      if (char === "[") {
        bracketDepth += 1;
        current += char;
        continue;
      }
      if (char === "]") {
        bracketDepth -= 1;
        current += char;
        continue;
      }
      if (char === "," && parenDepth === 0 && braceDepth === 0 && bracketDepth === 0) {
        _GradientMesh._pushTrimmed(result, current);
        current = "";
        continue;
      }
      current += char;
    }
    if (parenDepth !== 0 || braceDepth !== 0 || bracketDepth !== 0) {
      throw new Error("Unbalanced mesh-gradient input parentheses");
    }
    _GradientMesh._pushTrimmed(result, current);
    return result;
  }
  static _pushTrimmed(target, value) {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      target.push(trimmed);
    }
  }
  _validateMesh() {
    if (!Array.isArray(this._vertices)) {
      throw new TypeError("Mesh gradient vertices must be an array");
    }
    if (!Array.isArray(this._patches)) {
      throw new TypeError("Mesh gradient patches must be an array");
    }
    const config = this.getConfig();
    const expectedVertexCount = config.rows * config.columns;
    const expectedPatchCount = (config.rows - 1) * (config.columns - 1);
    if (this._vertices.length !== expectedVertexCount) {
      throw new Error(
        `Mesh gradient expected ${expectedVertexCount} vertices for ${config.rows}x${config.columns} grid, received ${this._vertices.length}`
      );
    }
    if (this._patches.length !== expectedPatchCount) {
      throw new Error(
        `Mesh gradient expected ${expectedPatchCount} patches for ${config.rows}x${config.columns} grid, received ${this._patches.length}`
      );
    }
    const vertexIds = /* @__PURE__ */ new Set();
    for (const vertex of this._vertices) {
      this._validateId(vertex.id, "vertex");
      if (vertexIds.has(vertex.id)) {
        throw new Error(`Duplicate mesh vertex id: ${vertex.id}`);
      }
      vertexIds.add(vertex.id);
      validateGradientLengthPercentage(vertex.x);
      validateGradientLengthPercentage(vertex.y);
      if (!parse$1(vertex.color)) {
        throw new Error(`Invalid mesh vertex color: ${vertex.color}`);
      }
    }
    const patchIds = /* @__PURE__ */ new Set();
    for (const patch of this._patches) {
      this._validateId(patch.id, "patch");
      if (patchIds.has(patch.id)) {
        throw new Error(`Duplicate mesh patch id: ${patch.id}`);
      }
      patchIds.add(patch.id);
      this._validatePatchVertices(patch, vertexIds);
      this._validateHandles(patch);
    }
    this._validateRegularPatchTopology();
  }
  _validateId(id, label) {
    if (!MESH_ID_PATTERN.test(id)) {
      throw new Error(`Invalid mesh ${label} id: ${id}`);
    }
  }
  _validatePatchVertices(patch, vertexIds) {
    const ids = [
      patch.topLeft,
      patch.topRight,
      patch.bottomRight,
      patch.bottomLeft
    ];
    if (new Set(ids).size !== 4) {
      throw new Error(`Mesh patch must use 4 unique vertices: ${patch.id}`);
    }
    for (const id of ids) {
      if (!vertexIds.has(id)) {
        throw new Error(`Mesh patch references missing vertex: ${id}`);
      }
    }
  }
  _validateHandles(patch) {
    if (patch.handles === void 0) {
      return;
    }
    for (const side of MESH_PATCH_SIDES) {
      const handle = patch.handles[side];
      if (handle === void 0) {
        continue;
      }
      validateGradientLengthPercentage(handle.from.x);
      validateGradientLengthPercentage(handle.from.y);
      validateGradientLengthPercentage(handle.to.x);
      validateGradientLengthPercentage(handle.to.y);
    }
  }
  _validateRegularPatchTopology() {
    const coordinates = /* @__PURE__ */ new Map();
    for (const vertex of this._vertices) {
      const coordinate = readMeshVertexGridCoordinate(vertex.id);
      if (coordinate === null) {
        return;
      }
      coordinates.set(vertex.id, coordinate);
    }
    const config = this.getConfig();
    const seenCells = /* @__PURE__ */ new Set();
    for (const [id, coordinate] of coordinates) {
      if (coordinate.row < 0 || coordinate.column < 0 || coordinate.row >= config.rows || coordinate.column >= config.columns) {
        throw new Error(`Mesh vertex is outside grid topology: ${id}`);
      }
    }
    for (const patch of this._patches) {
      const topLeft = coordinates.get(patch.topLeft);
      const topRight = coordinates.get(patch.topRight);
      const bottomRight = coordinates.get(patch.bottomRight);
      const bottomLeft = coordinates.get(patch.bottomLeft);
      if (topLeft === void 0 || topRight === void 0 || bottomRight === void 0 || bottomLeft === void 0) {
        return;
      }
      const isAdjacent = topRight.row === topLeft.row && topRight.column === topLeft.column + 1 && bottomRight.row === topLeft.row + 1 && bottomRight.column === topLeft.column + 1 && bottomLeft.row === topLeft.row + 1 && bottomLeft.column === topLeft.column;
      if (!isAdjacent) {
        throw new Error(
          `Mesh patch does not match adjacent regular grid vertices: ${patch.id}`
        );
      }
      const key = `${topLeft.row}:${topLeft.column}`;
      if (seenCells.has(key)) {
        throw new Error(`Duplicate mesh patch cell: ${patch.id}`);
      }
      seenCells.add(key);
    }
  }
  _serializeConfig(config) {
    const parts = [
      "grid",
      String(config.rows),
      String(config.columns),
      "method",
      config.method
    ];
    const interpolation = this._serializeInterpolation(config.interpolation);
    if (interpolation.length > 0) {
      parts.push(interpolation);
    }
    return parts.join(" ");
  }
  _serializeInterpolation(interpolation) {
    if (this._isDefaultInterpolation(interpolation)) {
      return "";
    }
    if (interpolation.hue === void 0) {
      return `in ${interpolation.colorSpace}`;
    }
    return `in ${interpolation.colorSpace} ${interpolation.hue} hue`;
  }
  _serializeVertex(vertex) {
    return [
      "vertex",
      vertex.id,
      formatGradientLengthPercentage(vertex.x),
      formatGradientLengthPercentage(vertex.y),
      vertex.color
    ].join(" ");
  }
  _serializePatch(patch) {
    return [
      "patch",
      patch.id,
      patch.topLeft,
      patch.topRight,
      patch.bottomRight,
      patch.bottomLeft
    ].join(" ");
  }
  _serializeHandles(patch) {
    if (patch.handles === void 0) {
      return [];
    }
    const result = [];
    for (const side of MESH_PATCH_SIDES) {
      const handle = patch.handles[side];
      if (handle === void 0) {
        continue;
      }
      result.push([
        "handle",
        patch.id,
        side,
        formatGradientLengthPercentage(handle.from.x),
        formatGradientLengthPercentage(handle.from.y),
        formatGradientLengthPercentage(handle.to.x),
        formatGradientLengthPercentage(handle.to.y)
      ].join(" "));
    }
    return result;
  }
  _isDefaultInterpolation(interpolation) {
    return interpolation.colorSpace === _GradientMesh.DEFAULT_CONFIG.interpolation.colorSpace && interpolation.hue === void 0;
  }
  _validateSampleCoordinate(value, label) {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new RangeError(
        `Mesh patch sample coordinate ${label} must be between 0 and 1`
      );
    }
  }
  _getColorSampler() {
    this._colorSampler ?? (this._colorSampler = createMeshColorSampler(
      this._vertices,
      this._patches,
      this.getConfig()
    ));
    return this._colorSampler;
  }
};
__publicField(_GradientMesh, "DEFAULT_CONFIG", {
  rows: 2,
  columns: 2,
  method: "bilinear",
  interpolation: {
    colorSpace: "srgb"
  }
});
let GradientMesh = _GradientMesh;
const REPEATING_PREFIX = "repeating-";
const BUILT_IN_GRADIENTS = {
  "linear-gradient": GradientLinear,
  "radial-gradient": GradientRadial,
  "diamond-gradient": GradientDiamond,
  "conic-gradient": GradientConic,
  "mesh-gradient": GradientMesh
};
class GradientFactory {
  static add(type, value) {
    this._ensureInitialized();
    this._registry.set(
      this._normalizeFunctionName(type),
      value
    );
  }
  static get(functionName) {
    this._ensureInitialized();
    return this._registry.get(this._normalizeFunctionName(functionName)) ?? null;
  }
  static remove(functionName) {
    this._ensureInitialized();
    return this._registry.delete(this._normalizeFunctionName(functionName));
  }
  static create(input) {
    if (typeof input === "string") {
      const functionName2 = this._readFunctionName(input);
      const adapter2 = this.get(functionName2);
      if (!adapter2) {
        throw new Error(`No gradient registered for: ${functionName2}`);
      }
      return adapter2.fromString(input);
    }
    const functionName = this._normalizeFunctionName(input.functionName);
    const adapter = this.get(functionName);
    if (!adapter) {
      throw new Error(`No gradient registered for: ${functionName}`);
    }
    return adapter.fromAbi({
      ...input,
      functionName
    });
  }
  static isValid(input) {
    try {
      this.create(input);
      return true;
    } catch {
      return false;
    }
  }
  static _ensureInitialized() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    this.add("linear-gradient", BUILT_IN_GRADIENTS["linear-gradient"]);
    this.add("radial-gradient", BUILT_IN_GRADIENTS["radial-gradient"]);
    this.add("diamond-gradient", BUILT_IN_GRADIENTS["diamond-gradient"]);
    this.add("conic-gradient", BUILT_IN_GRADIENTS["conic-gradient"]);
    this.add("mesh-gradient", BUILT_IN_GRADIENTS["mesh-gradient"]);
  }
  static _readFunctionName(input) {
    const source = input.trim();
    const openIndex = source.indexOf("(");
    if (openIndex <= 0) {
      throw new Error("Expected gradient function call");
    }
    return this._normalizeFunctionName(source.slice(0, openIndex));
  }
  static _normalizeFunctionName(input) {
    const functionName = input.trim().toLowerCase();
    return functionName.startsWith(REPEATING_PREFIX) ? functionName.slice(REPEATING_PREFIX.length) : functionName;
  }
}
__publicField(GradientFactory, "_registry", /* @__PURE__ */ new Map());
__publicField(GradientFactory, "_initialized", false);
function parse(input) {
  return GradientFactory.create(input);
}
class GradientTransformerModule {
  constructor(options) {
    __publicField(this, "target");
    __publicField(this, "gradientType");
    __publicField(this, "_gradientClass");
    __publicField(this, "_expectedName");
    this.target = options.target;
    this.gradientType = options.gradientType;
    this._gradientClass = options.gradientClass;
    this._expectedName = options.expectedName;
  }
  to(input) {
    return this.transform(this._expectGradient(input));
  }
  _expectGradient(input) {
    if (!(input instanceof this._gradientClass)) {
      throw new Error(`Expected ${this._expectedName}`);
    }
    return input;
  }
}
class GradientCssStringTransformerModule extends GradientTransformerModule {
  transform(gradient) {
    return gradient.toString();
  }
}
class ModuleTransformerLinearGradientToCss extends GradientCssStringTransformerModule {
  constructor() {
    super({
      target: "css",
      gradientType: "linear-gradient",
      gradientClass: GradientLinear,
      expectedName: "GradientLinear"
    });
  }
}
class ModuleTransformerRadialGradientToCss extends GradientCssStringTransformerModule {
  constructor() {
    super({
      target: "css",
      gradientType: "radial-gradient",
      gradientClass: GradientRadial,
      expectedName: "GradientRadial"
    });
  }
}
function isRenderableColorStop(stop) {
  return stop.type === "color-stop" && stop.position != null;
}
function getRenderableColorStops(stops) {
  return stops.filter(isRenderableColorStop).sort((a, b) => a.position - b.position);
}
function getRenderableColorStopCount(stops) {
  return getRenderableColorStops(stops).length;
}
function getRenderableStopRange(stops) {
  const colorStops = getRenderableColorStops(stops);
  if (!colorStops.length) {
    return { min: 0, max: 1, stops: [] };
  }
  const min = Math.min(...colorStops.map((stop) => stop.position));
  const max = Math.max(...colorStops.map((stop) => stop.position));
  return { min, max, stops: colorStops };
}
function normalizeRenderableStops(stops, min, max) {
  const range = max - min || 1;
  return getRenderableColorStops(stops).map((stop) => ({
    ...stop,
    position: (stop.position - min) / range
  }));
}
function sampleColorStopAtPosition(stops, position) {
  const colorStops = getRenderableColorStops(stops);
  if (colorStops.length === 0) {
    throw new Error("Cannot sample color from empty gradient stops.");
  }
  if (position <= colorStops[0].position) {
    return colorStops[0].value;
  }
  const lastStop = colorStops[colorStops.length - 1];
  if (position >= lastStop.position) {
    return lastStop.value;
  }
  for (let index = 0; index < colorStops.length - 1; index += 1) {
    const current = colorStops[index];
    const next = colorStops[index + 1];
    if (position >= current.position && position <= next.position) {
      const range = next.position - current.position || 1;
      const localT = (position - current.position) / range;
      const colorInterpolator = interpolate(
        [current.value, next.value],
        "rgb"
      );
      const formatted = formatRgb(colorInterpolator(localT));
      if (formatted === void 0) {
        throw new Error("Failed to format sampled gradient color.");
      }
      return formatted;
    }
  }
  return lastStop.value;
}
function fitRenderableStopsToLimit(stops, maxStops) {
  const colorStops = getRenderableColorStops(stops);
  if (colorStops.length <= maxStops) {
    return colorStops;
  }
  const sampledStops = [];
  for (let index = 0; index < maxStops; index += 1) {
    const position = index / (maxStops - 1);
    sampledStops.push({
      type: "color-stop",
      value: sampleColorStopAtPosition(colorStops, position),
      position
    });
  }
  return sampledStops;
}
function positiveModulo(value, modulo) {
  return (value % modulo + modulo) % modulo;
}
function sampleRepeatingColorAtPosition(stops, position, firstPosition, period) {
  const localPosition = firstPosition + positiveModulo(position - firstPosition, period);
  return sampleColorStopAtPosition(stops, localPosition);
}
function expandRepeatingStopsTo(stops, from, to) {
  const colorStops = getRenderableColorStops(stops);
  if (colorStops.length < 2) {
    return colorStops;
  }
  const firstPosition = colorStops[0].position;
  const lastPosition = colorStops[colorStops.length - 1].position;
  const period = lastPosition - firstPosition;
  if (period <= 0) {
    return colorStops;
  }
  const result = [];
  let order = 0;
  result.push({
    type: "color-stop",
    value: sampleRepeatingColorAtPosition(
      colorStops,
      from,
      firstPosition,
      period
    ),
    position: from,
    _order: order
  });
  order += 1;
  const startRepeat = Math.floor((from - firstPosition) / period) - 1;
  const endRepeat = Math.ceil((to - firstPosition) / period) + 1;
  for (let repeatIndex = startRepeat; repeatIndex <= endRepeat; repeatIndex += 1) {
    const offset = repeatIndex * period;
    for (const stop of colorStops) {
      const position = stop.position + offset;
      if (position <= from || position >= to) {
        continue;
      }
      result.push({
        ...stop,
        position,
        _order: order
      });
      order += 1;
    }
  }
  result.push({
    type: "color-stop",
    value: sampleRepeatingColorAtPosition(
      colorStops,
      to,
      firstPosition,
      period
    ),
    position: to,
    _order: order
  });
  return result.sort((a, b) => {
    if (a.position === b.position) {
      return a._order - b._order;
    }
    return a.position - b.position;
  }).map(({ _order, ...stop }) => stop);
}
function expandRepeatingStops(stops) {
  return expandRepeatingStopsTo(stops, 0, 1);
}
function getMaxVisibleRadialT(center, radii, width, height) {
  const corners = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: 0, y: height },
    { x: width, y: height }
  ];
  return Math.max(
    ...corners.map((corner) => {
      const dx = (corner.x - center.x) / Math.max(radii.x, 1e-4);
      const dy = (corner.y - center.y) / Math.max(radii.y, 1e-4);
      return Math.sqrt(dx * dx + dy * dy);
    })
  );
}
const DEFAULT_INTERPOLATION = {
  colorSpace: "srgb"
};
function getHueFixup(hue) {
  switch (hue) {
    case "longer":
      return fixupHueLonger;
    case "increasing":
      return fixupHueIncreasing;
    case "decreasing":
      return fixupHueDecreasing;
    default:
      return fixupHueShorter;
  }
}
function colorSpaceToCuloriMode(colorSpace) {
  switch (colorSpace) {
    case "a98-rgb":
      return "a98";
    case "display-p3":
      return "p3";
    case "prophoto-rgb":
      return "prophoto";
    case "xyz":
      return "xyz65";
    case "srgb":
    case "srgb-linear":
      return "rgb";
    default:
      return colorSpace;
  }
}
function createCuloriInterpolationOverrides(interpolation) {
  if (interpolation.hue === void 0) {
    return void 0;
  }
  return {
    h: {
      fixup: getHueFixup(interpolation.hue)
    }
  };
}
function isColorHint(stop) {
  return stop.type === "color-hint";
}
function getColorStopsWithPositions(stops) {
  const colorStops = stops.filter(
    isRenderableColorStop
  );
  if (colorStops.length === 0) {
    return [];
  }
  if (colorStops.length === 1) {
    return [
      {
        ...colorStops[0],
        position: colorStops[0].position ?? 0
      }
    ];
  }
  return colorStops.map((stop, index) => {
    if (stop.position != null) {
      return stop;
    }
    if (index === 0) {
      return {
        ...stop,
        position: 0
      };
    }
    if (index === colorStops.length - 1) {
      return {
        ...stop,
        position: 1
      };
    }
    return {
      ...stop,
      position: index / (colorStops.length - 1)
    };
  });
}
function getColorSegments(stops) {
  const segments = [];
  let from;
  let hint;
  for (const stop of stops) {
    if (isRenderableColorStop(stop)) {
      if (from !== void 0) {
        segments.push({
          from,
          to: stop,
          hint
        });
      }
      from = stop;
      hint = void 0;
      continue;
    }
    if (isColorHint(stop) && from !== void 0) {
      hint = stop;
    }
  }
  return segments;
}
function hasColorHints(stops) {
  return stops.some(isColorHint);
}
function getHintedColorProgress(positionProgress, hint, startPosition = 0, endPosition = 1) {
  if (hint === void 0) {
    return positionProgress;
  }
  const range = endPosition - startPosition;
  if (range === 0) {
    return positionProgress;
  }
  const hintProgress = (hint.position - startPosition) / range;
  if (hintProgress <= 0) {
    return positionProgress <= 0 ? 0 : 1;
  }
  if (hintProgress >= 1) {
    return positionProgress >= 1 ? 1 : 0;
  }
  if (Math.abs(hintProgress - 0.5) < 1e-6) {
    return positionProgress;
  }
  return Math.pow(
    positionProgress,
    Math.log(0.5) / Math.log(hintProgress)
  );
}
function getSegmentSamplePositions(sampleCount, segment) {
  const samples = Array.from(
    { length: sampleCount + 1 },
    (_, index) => index / sampleCount
  );
  if (segment.hint === void 0) {
    return samples;
  }
  const range = segment.to.position - segment.from.position;
  if (range === 0) {
    return samples;
  }
  const hintProgress = (segment.hint.position - segment.from.position) / range;
  if (hintProgress <= 0 || hintProgress >= 1) {
    return samples;
  }
  const nearestIndex = Math.round(hintProgress * sampleCount);
  samples[nearestIndex] = hintProgress;
  return samples;
}
function formatColorForCanvas$1(input) {
  const color = toRgb$1(input);
  if (!color) {
    throw new Error("Failed to convert interpolated color to rgb.");
  }
  const formatted = formatRgb(color);
  if (formatted === void 0) {
    throw new Error("Failed to format interpolated color to rgb.");
  }
  return formatted;
}
const DEFAULT_SAMPLE_COUNT = 64;
const toRgb$1 = converter("rgb");
function resolveRenderableGradientStops(gradient, sampleCount = DEFAULT_SAMPLE_COUNT) {
  const sourceStops = gradient.getStops();
  const colorStops = getColorStopsWithPositions(sourceStops);
  const interpolation = gradient.getConfig().interpolation;
  const shouldSample = interpolation !== void 0 || hasColorHints(sourceStops);
  if (colorStops.length < 2) {
    return colorStops;
  }
  if (!shouldSample) {
    return gradient.isRepeating() ? expandRepeatingStops(colorStops) : colorStops;
  }
  const sampledStops = [];
  const resolvedInterpolation = interpolation ?? DEFAULT_INTERPOLATION;
  const mode = colorSpaceToCuloriMode(resolvedInterpolation.colorSpace);
  const overrides = createCuloriInterpolationOverrides(resolvedInterpolation);
  const segments = getColorSegments(sourceStops);
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const current = segment.from;
    const next = segment.to;
    const startPosition = current.position;
    const endPosition = next.position;
    if (startPosition === endPosition) {
      if (index === 0) {
        sampledStops.push(current);
      }
      sampledStops.push(next);
      continue;
    }
    const colorInterpolator = interpolate(
      [current.value, next.value],
      mode,
      overrides
    );
    const samplePositions = getSegmentSamplePositions(sampleCount, segment);
    for (let sampleIndex = 0; sampleIndex < samplePositions.length; sampleIndex += 1) {
      if (index > 0 && sampleIndex === 0) {
        continue;
      }
      const localT = samplePositions[sampleIndex];
      const colorT = getHintedColorProgress(
        localT,
        segment.hint,
        startPosition,
        endPosition
      );
      const position = startPosition + (endPosition - startPosition) * localT;
      const color = colorInterpolator(colorT);
      sampledStops.push({
        type: "color-stop",
        value: formatColorForCanvas$1(color),
        position
      });
    }
  }
  return gradient.isRepeating() ? expandRepeatingStops(sampledStops) : sampledStops;
}
const EPSILON = 1e-4;
function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}
function formatNumber(value, precision = 3) {
  return `${Number(value.toFixed(precision))}`;
}
function resolveLengthPercentage(value, reference, options = {}) {
  if (value.kind === "percent") {
    return value.value / 100 * reference;
  }
  if (value.unit === "px" || options.allowUnsupportedUnitAsRaw) {
    return value.value;
  }
  const context = options.context ?? "gradient";
  throw new Error(
    `Unsupported ${context} length unit: ${value.unit}`
  );
}
function resolveKeywordPositionX(value, width) {
  if (value === "left") return 0;
  if (value === "right") return width;
  return width / 2;
}
function resolveKeywordPositionY(value, height) {
  if (value === "top") return 0;
  if (value === "bottom") return height;
  return height / 2;
}
function resolveGradientPosition(position, width, height, options = {}) {
  if (position.kind === "keywords") {
    return {
      x: resolveKeywordPositionX(position.x, width),
      y: resolveKeywordPositionY(position.y, height)
    };
  }
  return {
    x: resolveLengthPercentage(position.x, width, options),
    y: resolveLengthPercentage(position.y, height, options)
  };
}
function resolveAngleToRadians(angle) {
  if (angle.unit === "deg") return degToRad(angle.value);
  if (angle.unit === "turn") return turnToRad(angle.value);
  if (angle.unit === "grad") return gradToRad(angle.value);
  return angle.value;
}
function resolveLinearGradientLine(angle, width, height) {
  const dirX = Math.sin(angle);
  const dirY = -Math.cos(angle);
  const centerX = width / 2;
  const centerY = height / 2;
  const lineLength = Math.abs(width * dirX) + Math.abs(height * dirY);
  return {
    start: {
      x: centerX - dirX * lineLength / 2,
      y: centerY - dirY * lineLength / 2
    },
    end: {
      x: centerX + dirX * lineLength / 2,
      y: centerY + dirY * lineLength / 2
    }
  };
}
function resolveLinearGradientVector(angle) {
  const dx = Math.sin(angle);
  const dy = -Math.cos(angle);
  const scale = Math.max(Math.abs(dx), Math.abs(dy), EPSILON);
  const unitX = dx / scale;
  const unitY = dy / scale;
  return {
    x1: 50 - unitX * 50,
    y1: 50 - unitY * 50,
    x2: 50 + unitX * 50,
    y2: 50 + unitY * 50
  };
}
function getGradientCorners(width, height) {
  return [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: 0, y: height },
    { x: width, y: height }
  ];
}
function getEuclideanDistance(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function getManhattanDistance(from, to) {
  return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
}
function getCornerDeltas(center, width, height) {
  return [
    { dx: -center.x, dy: -center.y },
    { dx: width - center.x, dy: -center.y },
    { dx: -center.x, dy: height - center.y },
    { dx: width - center.x, dy: height - center.y }
  ];
}
function scaleEllipseRadiiToCorner(radiusX, radiusY, dx, dy) {
  const safeRadiusX = Math.max(radiusX, EPSILON);
  const safeRadiusY = Math.max(radiusY, EPSILON);
  const scale = Math.sqrt(
    dx * dx / (safeRadiusX * safeRadiusX) + dy * dy / (safeRadiusY * safeRadiusY)
  );
  return {
    x: safeRadiusX * scale,
    y: safeRadiusY * scale
  };
}
function scaleDiamondRadiiToCorner(radiusX, radiusY, dx, dy) {
  const safeRadiusX = Math.max(radiusX, EPSILON);
  const safeRadiusY = Math.max(radiusY, EPSILON);
  const scale = Math.abs(dx) / safeRadiusX + Math.abs(dy) / safeRadiusY;
  return {
    x: safeRadiusX * scale,
    y: safeRadiusY * scale
  };
}
function resolveRadialRadii(size, shape, center, width, height, options = {}) {
  if (size.kind === "explicit") {
    const radiusX = resolveLengthPercentage(size.x, width, options);
    const radiusY = size.y ? resolveLengthPercentage(size.y, height, options) : radiusX;
    return {
      x: Math.max(radiusX, EPSILON),
      y: Math.max(shape === "circle" ? radiusX : radiusY, EPSILON)
    };
  }
  const left = center.x;
  const right = width - center.x;
  const top = center.y;
  const bottom = height - center.y;
  if (shape === "circle") {
    const cornerDistances = getGradientCorners(width, height).map(
      (corner) => getEuclideanDistance(center, corner)
    );
    if (size.value === "closest-side") {
      const radius2 = Math.max(Math.min(left, right, top, bottom), EPSILON);
      return { x: radius2, y: radius2 };
    }
    if (size.value === "farthest-side") {
      const radius2 = Math.max(Math.max(left, right, top, bottom), EPSILON);
      return { x: radius2, y: radius2 };
    }
    if (size.value === "closest-corner") {
      const radius2 = Math.max(Math.min(...cornerDistances), EPSILON);
      return { x: radius2, y: radius2 };
    }
    const radius = Math.max(Math.max(...cornerDistances), EPSILON);
    return { x: radius, y: radius };
  }
  const closestSideRadiusX = Math.min(left, right);
  const closestSideRadiusY = Math.min(top, bottom);
  const farthestSideRadiusX = Math.max(left, right);
  const farthestSideRadiusY = Math.max(top, bottom);
  if (size.value === "closest-side") {
    return {
      x: Math.max(closestSideRadiusX, EPSILON),
      y: Math.max(closestSideRadiusY, EPSILON)
    };
  }
  if (size.value === "farthest-side") {
    return {
      x: Math.max(farthestSideRadiusX, EPSILON),
      y: Math.max(farthestSideRadiusY, EPSILON)
    };
  }
  const corners = getCornerDeltas(center, width, height);
  if (size.value === "closest-corner") {
    return corners.map(
      (corner) => scaleEllipseRadiiToCorner(
        closestSideRadiusX,
        closestSideRadiusY,
        corner.dx,
        corner.dy
      )
    ).reduce(
      (closest, current) => current.x * current.y < closest.x * closest.y ? current : closest
    );
  }
  return corners.map(
    (corner) => scaleEllipseRadiiToCorner(
      farthestSideRadiusX,
      farthestSideRadiusY,
      corner.dx,
      corner.dy
    )
  ).reduce(
    (farthest, current) => current.x * current.y > farthest.x * farthest.y ? current : farthest
  );
}
function resolveDiamondRadii(size, shape, center, width, height, options = {}) {
  if (size.kind === "explicit") {
    const radiusX = resolveLengthPercentage(size.x, width, options);
    const radiusY = size.y ? resolveLengthPercentage(size.y, height, options) : radiusX;
    return {
      x: Math.max(radiusX, EPSILON),
      y: Math.max(shape === "circle" ? radiusX : radiusY, EPSILON)
    };
  }
  const left = center.x;
  const right = width - center.x;
  const top = center.y;
  const bottom = height - center.y;
  if (shape === "circle") {
    const cornerDistances = getGradientCorners(width, height).map(
      (corner) => getManhattanDistance(center, corner)
    );
    if (size.value === "closest-side") {
      const radius2 = Math.max(Math.min(left, right, top, bottom), EPSILON);
      return { x: radius2, y: radius2 };
    }
    if (size.value === "farthest-side") {
      const radius2 = Math.max(Math.max(left, right, top, bottom), EPSILON);
      return { x: radius2, y: radius2 };
    }
    if (size.value === "closest-corner") {
      const radius2 = Math.max(Math.min(...cornerDistances), EPSILON);
      return { x: radius2, y: radius2 };
    }
    const radius = Math.max(Math.max(...cornerDistances), EPSILON);
    return { x: radius, y: radius };
  }
  const closestSideRadiusX = Math.min(left, right);
  const closestSideRadiusY = Math.min(top, bottom);
  const farthestSideRadiusX = Math.max(left, right);
  const farthestSideRadiusY = Math.max(top, bottom);
  if (size.value === "closest-side") {
    return {
      x: Math.max(closestSideRadiusX, EPSILON),
      y: Math.max(closestSideRadiusY, EPSILON)
    };
  }
  if (size.value === "farthest-side") {
    return {
      x: Math.max(farthestSideRadiusX, EPSILON),
      y: Math.max(farthestSideRadiusY, EPSILON)
    };
  }
  const corners = getCornerDeltas(center, width, height);
  if (size.value === "closest-corner") {
    return corners.map(
      (corner) => scaleDiamondRadiiToCorner(
        closestSideRadiusX,
        closestSideRadiusY,
        corner.dx,
        corner.dy
      )
    ).reduce(
      (closest, current) => current.x * current.y < closest.x * closest.y ? current : closest
    );
  }
  return corners.map(
    (corner) => scaleDiamondRadiiToCorner(
      farthestSideRadiusX,
      farthestSideRadiusY,
      corner.dx,
      corner.dy
    )
  ).reduce(
    (farthest, current) => current.x * current.y > farthest.x * farthest.y ? current : farthest
  );
}
function getMaxVisibleDiamondT(center, radii, width, height) {
  return Math.max(
    ...getGradientCorners(width, height).map(
      (corner) => Math.abs(corner.x - center.x) / Math.max(radii.x, EPSILON) + Math.abs(corner.y - center.y) / Math.max(radii.y, EPSILON)
    )
  );
}
function resolveMeshVertex(vertex, width, height) {
  return {
    id: vertex.id,
    x: resolveLengthPercentage(vertex.x, width, {
      context: "mesh-gradient"
    }),
    y: resolveLengthPercentage(vertex.y, height, {
      context: "mesh-gradient"
    }),
    color: toMeshRgbColor(vertex.color)
  };
}
function buildMeshVertexMapFromVertices(vertices, width, height) {
  return new Map(
    vertices.map((vertex) => [
      vertex.id,
      resolveMeshVertex(vertex, width, height)
    ])
  );
}
function buildRegularMeshGridFromVertices(config, vertices, vertexMap) {
  const idGrid = buildRegularMeshGridFromVertexIds(
    config,
    vertices,
    vertexMap
  );
  if (idGrid) {
    return idGrid;
  }
  const resolvedVertices = vertices.map((vertex) => {
    const resolved = vertexMap.get(vertex.id);
    if (!resolved) {
      throw new Error(`Missing mesh vertex: ${vertex.id}`);
    }
    return resolved;
  }).sort((a, b) => {
    if (Math.abs(a.y - b.y) > 1e-4) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });
  const result = [];
  for (let row = 0; row < config.rows; row += 1) {
    const start = row * config.columns;
    const end = start + config.columns;
    result.push(resolvedVertices.slice(start, end));
  }
  return result;
}
function buildRegularMeshGridFromVertexIds(config, vertices, vertexMap) {
  const result = Array.from(
    { length: config.rows },
    () => []
  );
  for (const vertex of vertices) {
    const coordinate = readMeshVertexGridCoordinate(vertex.id);
    if (coordinate === null) {
      return null;
    }
    if (coordinate.row < 0 || coordinate.column < 0 || coordinate.row >= config.rows || coordinate.column >= config.columns) {
      return null;
    }
    const resolved = vertexMap.get(vertex.id);
    if (!resolved) {
      throw new Error(`Missing mesh vertex: ${vertex.id}`);
    }
    if (result[coordinate.row][coordinate.column]) {
      return null;
    }
    result[coordinate.row][coordinate.column] = resolved;
  }
  if (result.some(
    (row) => row.length !== config.columns || row.some((vertex) => vertex === void 0)
  )) {
    return null;
  }
  return result;
}
function buildMeshRenderContext(gradient, width, height) {
  const config = gradient.getConfig();
  const vertices = gradient.getVertices();
  const patches = gradient.getPatches();
  const vertexMap = buildMeshVertexMapFromVertices(vertices, width, height);
  const grid = buildRegularMeshGridFromVertices(config, vertices, vertexMap);
  const sampler = createMeshColorSampler(vertices, patches, config);
  return {
    config,
    patches,
    vertexMap,
    grid,
    sampler
  };
}
function clampColor(value) {
  return Math.min(1, Math.max(0, value));
}
function mix(a, b, t) {
  return a + (b - a) * t;
}
function samplePosition(topLeft, topRight, bottomRight, bottomLeft, u, v) {
  const topX = mix(topLeft.x, topRight.x, u);
  const topY = mix(topLeft.y, topRight.y, u);
  const bottomX = mix(bottomLeft.x, bottomRight.x, u);
  const bottomY = mix(bottomLeft.y, bottomRight.y, u);
  return {
    x: mix(topX, bottomX, v),
    y: mix(topY, bottomY, v)
  };
}
function samplePatchColor(sampler, patchId, u, v) {
  return sampler.samplePatchColorRgb(
    patchId,
    clampColor(u),
    clampColor(v)
  );
}
function buildPatchTriangles(sampler, patch, vertexMap, subdivisions) {
  const topLeft = vertexMap.get(patch.topLeft);
  const topRight = vertexMap.get(patch.topRight);
  const bottomRight = vertexMap.get(patch.bottomRight);
  const bottomLeft = vertexMap.get(patch.bottomLeft);
  if (!topLeft || !topRight || !bottomRight || !bottomLeft) {
    throw new Error(`Mesh patch references missing vertex: ${patch.id}`);
  }
  const samples = [];
  for (let y = 0; y <= subdivisions; y += 1) {
    const row = [];
    const v = y / subdivisions;
    for (let x = 0; x <= subdivisions; x += 1) {
      const u = x / subdivisions;
      const position = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u, v);
      const color = samplePatchColor(
        sampler,
        patch.id,
        u,
        v
      );
      row.push({
        id: `${patch.id}:${x}:${y}`,
        x: position.x,
        y: position.y,
        color
      });
    }
    samples.push(row);
  }
  const triangles = [];
  for (let y = 0; y < subdivisions; y += 1) {
    for (let x = 0; x < subdivisions; x += 1) {
      const topLeftSample = samples[y][x];
      const topRightSample = samples[y][x + 1];
      const bottomRightSample = samples[y + 1][x + 1];
      const bottomLeftSample = samples[y + 1][x];
      triangles.push(
        [topLeftSample, topRightSample, bottomRightSample],
        [topLeftSample, bottomRightSample, bottomLeftSample]
      );
    }
  }
  return triangles;
}
function samplePatchVertexAt(sampler, patchId, u, v, x, y, id) {
  return {
    id,
    x,
    y,
    color: samplePatchColor(
      sampler,
      patchId,
      u,
      v
    )
  };
}
function createPatchVertexKey(topLeft, topRight, bottomRight, bottomLeft) {
  return `${topLeft}\0${topRight}\0${bottomRight}\0${bottomLeft}`;
}
function buildPatchIdsByVertices(patches) {
  return new Map(
    patches.map((patch) => [
      createPatchVertexKey(
        patch.topLeft,
        patch.topRight,
        patch.bottomRight,
        patch.bottomLeft
      ),
      patch.id
    ])
  );
}
function findPatchIdByVertices(patchIdsByVertices, topLeft, topRight, bottomRight, bottomLeft) {
  const patchId = patchIdsByVertices.get(createPatchVertexKey(
    topLeft.id,
    topRight.id,
    bottomRight.id,
    bottomLeft.id
  ));
  if (patchId === void 0) {
    throw new Error(
      `Missing mesh patch for cell ${topLeft.id}/${topRight.id}/${bottomRight.id}/${bottomLeft.id}`
    );
  }
  return patchId;
}
function buildMeshEdgeSkirtTriangles(sampler, patches, grid, width, height, subdivisions) {
  var _a;
  const triangles = [];
  const rows = grid.length;
  const columns = ((_a = grid[0]) == null ? void 0 : _a.length) ?? 0;
  if (rows < 2 || columns < 2) {
    return triangles;
  }
  const patchIdsByVertices = buildPatchIdsByVertices(patches);
  for (let column = 0; column < columns - 1; column += 1) {
    const topLeft = grid[0][column];
    const topRight = grid[0][column + 1];
    const bottomRight = grid[1][column + 1];
    const bottomLeft = grid[1][column];
    const patchId = findPatchIdByVertices(
      patchIdsByVertices,
      topLeft,
      topRight,
      bottomRight,
      bottomLeft
    );
    for (let index = 0; index < subdivisions; index += 1) {
      const u0 = index / subdivisions;
      const u1 = (index + 1) / subdivisions;
      const top0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u0, 0);
      const top1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u1, 0);
      const bottom0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u0, 1);
      const bottom1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u1, 1);
      const v0 = Math.min(0, (0 - top0.y) / Math.max(bottom0.y - top0.y, 1e-4));
      const v1 = Math.min(0, (0 - top1.y) / Math.max(bottom1.y - top1.y, 1e-4));
      const boundary0 = samplePatchVertexAt(sampler, patchId, u0, 0, top0.x, top0.y, `top:${column}:${index}:b0`);
      const boundary1 = samplePatchVertexAt(sampler, patchId, u1, 0, top1.x, top1.y, `top:${column}:${index}:b1`);
      const projected0 = samplePatchVertexAt(sampler, patchId, u0, v0, top0.x, 0, `top:${column}:${index}:p0`);
      const projected1 = samplePatchVertexAt(sampler, patchId, u1, v1, top1.x, 0, `top:${column}:${index}:p1`);
      triangles.push(
        [projected0, projected1, boundary1],
        [projected0, boundary1, boundary0]
      );
    }
  }
  for (let column = 0; column < columns - 1; column += 1) {
    const row = rows - 2;
    const topLeft = grid[row][column];
    const topRight = grid[row][column + 1];
    const bottomRight = grid[row + 1][column + 1];
    const bottomLeft = grid[row + 1][column];
    const patchId = findPatchIdByVertices(
      patchIdsByVertices,
      topLeft,
      topRight,
      bottomRight,
      bottomLeft
    );
    for (let index = 0; index < subdivisions; index += 1) {
      const u0 = index / subdivisions;
      const u1 = (index + 1) / subdivisions;
      const top0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u0, 0);
      const top1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u1, 0);
      const bottom0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u0, 1);
      const bottom1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u1, 1);
      const v0 = Math.max(1, (height - top0.y) / Math.max(bottom0.y - top0.y, 1e-4));
      const v1 = Math.max(1, (height - top1.y) / Math.max(bottom1.y - top1.y, 1e-4));
      const boundary0 = samplePatchVertexAt(sampler, patchId, u0, 1, bottom0.x, bottom0.y, `bottom:${column}:${index}:b0`);
      const boundary1 = samplePatchVertexAt(sampler, patchId, u1, 1, bottom1.x, bottom1.y, `bottom:${column}:${index}:b1`);
      const projected0 = samplePatchVertexAt(sampler, patchId, u0, v0, bottom0.x, height, `bottom:${column}:${index}:p0`);
      const projected1 = samplePatchVertexAt(sampler, patchId, u1, v1, bottom1.x, height, `bottom:${column}:${index}:p1`);
      triangles.push(
        [boundary0, boundary1, projected1],
        [boundary0, projected1, projected0]
      );
    }
  }
  for (let row = 0; row < rows - 1; row += 1) {
    const topLeft = grid[row][0];
    const topRight = grid[row][1];
    const bottomRight = grid[row + 1][1];
    const bottomLeft = grid[row + 1][0];
    const patchId = findPatchIdByVertices(
      patchIdsByVertices,
      topLeft,
      topRight,
      bottomRight,
      bottomLeft
    );
    for (let index = 0; index < subdivisions; index += 1) {
      const v0 = index / subdivisions;
      const v1 = (index + 1) / subdivisions;
      const left0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 0, v0);
      const left1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 0, v1);
      const right0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 1, v0);
      const right1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 1, v1);
      const u0 = Math.min(0, (0 - left0.x) / Math.max(right0.x - left0.x, 1e-4));
      const u1 = Math.min(0, (0 - left1.x) / Math.max(right1.x - left1.x, 1e-4));
      const boundary0 = samplePatchVertexAt(sampler, patchId, 0, v0, left0.x, left0.y, `left:${row}:${index}:b0`);
      const boundary1 = samplePatchVertexAt(sampler, patchId, 0, v1, left1.x, left1.y, `left:${row}:${index}:b1`);
      const projected0 = samplePatchVertexAt(sampler, patchId, u0, v0, 0, left0.y, `left:${row}:${index}:p0`);
      const projected1 = samplePatchVertexAt(sampler, patchId, u1, v1, 0, left1.y, `left:${row}:${index}:p1`);
      triangles.push(
        [projected0, boundary0, boundary1],
        [projected0, boundary1, projected1]
      );
    }
  }
  for (let row = 0; row < rows - 1; row += 1) {
    const column = columns - 2;
    const topLeft = grid[row][column];
    const topRight = grid[row][column + 1];
    const bottomRight = grid[row + 1][column + 1];
    const bottomLeft = grid[row + 1][column];
    const patchId = findPatchIdByVertices(
      patchIdsByVertices,
      topLeft,
      topRight,
      bottomRight,
      bottomLeft
    );
    for (let index = 0; index < subdivisions; index += 1) {
      const v0 = index / subdivisions;
      const v1 = (index + 1) / subdivisions;
      const left0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 0, v0);
      const left1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 0, v1);
      const right0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 1, v0);
      const right1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 1, v1);
      const u0 = Math.max(1, (width - left0.x) / Math.max(right0.x - left0.x, 1e-4));
      const u1 = Math.max(1, (width - left1.x) / Math.max(right1.x - left1.x, 1e-4));
      const boundary0 = samplePatchVertexAt(sampler, patchId, 1, v0, right0.x, right0.y, `right:${row}:${index}:b0`);
      const boundary1 = samplePatchVertexAt(sampler, patchId, 1, v1, right1.x, right1.y, `right:${row}:${index}:b1`);
      const projected0 = samplePatchVertexAt(sampler, patchId, u0, v0, width, right0.y, `right:${row}:${index}:p0`);
      const projected1 = samplePatchVertexAt(sampler, patchId, u1, v1, width, right1.y, `right:${row}:${index}:p1`);
      triangles.push(
        [boundary0, projected0, projected1],
        [boundary0, projected1, boundary1]
      );
    }
  }
  return triangles;
}
function getMeshBarycentricWeights(x, y, a, b, c) {
  const denominator = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
  if (Math.abs(denominator) < 1e-6) {
    return null;
  }
  const wA = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / denominator;
  const wB = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / denominator;
  const wC = 1 - wA - wB;
  const epsilon = -1e-4;
  if (wA < epsilon || wB < epsilon || wC < epsilon) {
    return null;
  }
  return [wA, wB, wC];
}
function mixMeshTriangleColor(weights, a, b, c) {
  const [wA, wB, wC] = weights;
  return [
    a.color[0] * wA + b.color[0] * wB + c.color[0] * wC,
    a.color[1] * wA + b.color[1] * wB + c.color[1] * wC,
    a.color[2] * wA + b.color[2] * wB + c.color[2] * wC,
    a.color[3] * wA + b.color[3] * wB + c.color[3] * wC
  ];
}
function getAverageMeshTriangleColor(triangle) {
  const [a, b, c] = triangle;
  return [
    (a.color[0] + b.color[0] + c.color[0]) / 3,
    (a.color[1] + b.color[1] + c.color[1]) / 3,
    (a.color[2] + b.color[2] + c.color[2]) / 3,
    (a.color[3] + b.color[3] + c.color[3]) / 3
  ];
}
function rasterizeMeshTriangle(width, height, triangle, visit) {
  const [a, b, c] = triangle;
  const minX = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)));
  const maxX = Math.min(width - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
  const minY = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(a.y, b.y, c.y)));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const weights = getMeshBarycentricWeights(
        x + 0.5,
        y + 0.5,
        a,
        b,
        c
      );
      if (!weights) {
        continue;
      }
      visit(x, y, mixMeshTriangleColor(weights, a, b, c));
    }
  }
}
const toRgb = converter("rgb");
function parseColorToRgbaByte(input) {
  const color = toRgb(input);
  if (!color) {
    throw new Error(`Failed to convert color: ${input}`);
  }
  return {
    r: Math.round((color.r ?? 0) * 255),
    g: Math.round((color.g ?? 0) * 255),
    b: Math.round((color.b ?? 0) * 255),
    a: Math.round((color.alpha ?? 1) * 255)
  };
}
function parseColorToRgbaTuple(input) {
  const color = parseColorToRgbaByte(input);
  return [
    color.r,
    color.g,
    color.b,
    color.a
  ];
}
function formatColorForCanvas(input) {
  const color = toRgb(input);
  if (!color) {
    throw new Error(`Failed to convert color: ${input}`);
  }
  const formatted = formatRgb(color);
  if (formatted === void 0) {
    throw new Error(`Failed to format color: ${input}`);
  }
  return formatted;
}
function mixRgbaByteColor(from, to, t) {
  return {
    r: Math.round(from.r + (to.r - from.r) * t),
    g: Math.round(from.g + (to.g - from.g) * t),
    b: Math.round(from.b + (to.b - from.b) * t),
    a: Math.round(from.a + (to.a - from.a) * t)
  };
}
function formatRgbaTupleAsCss(color, alphaPrecision = 4, separator = ", ") {
  return `rgba(${[
    color[0],
    color[1],
    color[2],
    Number(color[3].toFixed(alphaPrecision))
  ].join(separator)})`;
}
function encodeSvgDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
function encodeSvgDataUrlCss(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
const DIAMOND_SAMPLE_COUNT = 96;
function buildDiamondPolygon$1(center, radii, position) {
  const x = radii.x * position;
  const y = radii.y * position;
  return [
    `${formatNumber(center.x)} ${formatNumber(center.y - y)}`,
    `${formatNumber(center.x + x)} ${formatNumber(center.y)}`,
    `${formatNumber(center.x)} ${formatNumber(center.y + y)}`,
    `${formatNumber(center.x - x)} ${formatNumber(center.y)}`
  ].join(" ");
}
class ModuleTransformerDiamondGradientToCss extends GradientTransformerModule {
  constructor() {
    super({
      target: "css",
      gradientType: "diamond-gradient",
      gradientClass: GradientDiamond,
      expectedName: "GradientDiamond"
    });
  }
  transform(gradient) {
    const config = gradient.getConfig();
    const isRepeating = gradient.isRepeating();
    const center = resolveGradientPosition(
      config.position,
      100,
      100,
      {
        context: "CSS diamond gradient"
      }
    );
    const radii = resolveDiamondRadii(
      config.size,
      config.shape,
      center,
      100,
      100,
      {
        context: "CSS diamond gradient"
      }
    );
    const maxVisibleT = getMaxVisibleDiamondT(center, radii, 100, 100);
    const maxT = isRepeating ? maxVisibleT : 1;
    const baseStops = resolveRenderableGradientStops(
      gradient,
      DIAMOND_SAMPLE_COUNT
    );
    const stops = getRenderableColorStops(
      isRepeating ? expandRepeatingStopsTo(baseStops, 0, maxVisibleT) : baseStops
    );
    const outerColor = sampleColorStopAtPosition(stops, maxT);
    const polygons = [];
    const sampleCount = Math.max(
      DIAMOND_SAMPLE_COUNT,
      Math.ceil(DIAMOND_SAMPLE_COUNT * maxT)
    );
    for (let index = sampleCount; index >= 0; index -= 1) {
      const position = index / sampleCount * maxT;
      const color = sampleColorStopAtPosition(stops, position);
      const points = buildDiamondPolygon$1(center, radii, position);
      polygons.push(`<polygon points="${points}" fill="${color}"/>`);
    }
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">',
      `<rect width="100" height="100" fill="${outerColor}"/>`,
      ...polygons,
      "</svg>"
    ].join("");
    return encodeSvgDataUrlCss(svg);
  }
}
class ModuleTransformerConicGradientToCss extends GradientCssStringTransformerModule {
  constructor() {
    super({
      target: "css",
      gradientType: "conic-gradient",
      gradientClass: GradientConic,
      expectedName: "GradientConic"
    });
  }
}
const CSS_SAMPLE_SIZE = 96;
const BICUBIC_SUBDIVISIONS$3 = 24;
function paintTriangle(colors, width, height, triangle) {
  rasterizeMeshTriangle(width, height, triangle, (x, y, color) => {
    const offset = y * width + x;
    if (colors[offset] !== null) {
      return;
    }
    colors[offset] = [
      Math.round(color[0] * 255),
      Math.round(color[1] * 255),
      Math.round(color[2] * 255),
      color[3]
    ];
  });
}
class ModuleTransformerMeshGradientToCss extends GradientTransformerModule {
  constructor() {
    super({
      target: "css",
      gradientType: "mesh-gradient",
      gradientClass: GradientMesh,
      expectedName: "GradientMesh"
    });
  }
  transform(gradient) {
    const { config, patches, vertexMap, grid, sampler } = buildMeshRenderContext(gradient, CSS_SAMPLE_SIZE, CSS_SAMPLE_SIZE);
    const subdivisions = config.method === "bicubic" ? BICUBIC_SUBDIVISIONS$3 : 1;
    const triangles = patches.flatMap(
      (patch) => buildPatchTriangles(sampler, patch, vertexMap, subdivisions)
    );
    const edgeTriangles = buildMeshEdgeSkirtTriangles(
      sampler,
      patches,
      grid,
      CSS_SAMPLE_SIZE,
      CSS_SAMPLE_SIZE,
      subdivisions
    );
    const renderTriangles = [
      ...triangles,
      ...edgeTriangles
    ];
    const colors = Array.from({ length: CSS_SAMPLE_SIZE * CSS_SAMPLE_SIZE }, () => null);
    const rects = [];
    for (const triangle of renderTriangles) {
      paintTriangle(
        colors,
        CSS_SAMPLE_SIZE,
        CSS_SAMPLE_SIZE,
        triangle
      );
    }
    for (let y = 0; y < CSS_SAMPLE_SIZE; y += 1) {
      for (let x = 0; x < CSS_SAMPLE_SIZE; x += 1) {
        const color = colors[y * CSS_SAMPLE_SIZE + x];
        if (!color) {
          continue;
        }
        rects.push(
          `<rect x="${x}" y="${y}" width="1" height="1" fill="${formatRgbaTupleAsCss(color, 3, ",")}"/>`
        );
      }
    }
    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CSS_SAMPLE_SIZE} ${CSS_SAMPLE_SIZE}" preserveAspectRatio="none" shape-rendering="crispEdges">`,
      ...rects,
      "</svg>"
    ].join("");
    return encodeSvgDataUrlCss(svg);
  }
}
class ModuleTransformerLinearGradientToCanvas extends GradientTransformerModule {
  constructor() {
    super({
      target: "canvas-2d",
      gradientType: "linear-gradient",
      gradientClass: GradientLinear,
      expectedName: "GradientLinear"
    });
  }
  transform(gradient) {
    return {
      draw: (ctx, width, height) => {
        const angle = gradient.getConfig().angle;
        const line = resolveLinearGradientLine(angle, width, height);
        let startX = line.start.x;
        let startY = line.start.y;
        let endX = line.end.x;
        let endY = line.end.y;
        const renderStops = resolveRenderableGradientStops(gradient);
        const { min, max, stops } = getRenderableStopRange(renderStops);
        let normalizedStops = stops;
        if (min < 0 || max > 1) {
          const vx = endX - startX;
          const vy = endY - startY;
          const baseStartX = startX;
          const baseStartY = startY;
          startX = baseStartX + vx * min;
          startY = baseStartY + vy * min;
          endX = baseStartX + vx * max;
          endY = baseStartY + vy * max;
          normalizedStops = normalizeRenderableStops(stops, min, max);
        }
        const canvasGradient = ctx.createLinearGradient(
          startX,
          startY,
          endX,
          endY
        );
        for (const stop of normalizedStops) {
          canvasGradient.addColorStop(
            stop.position,
            formatColorForCanvas(stop.value)
          );
        }
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = canvasGradient;
        ctx.fillRect(0, 0, width, height);
      }
    };
  }
}
const RADIAL_GRADIENT_SAMPLE_COUNT = 128;
class ModuleTransformerRadialGradientToCanvas extends GradientTransformerModule {
  constructor() {
    super({
      target: "canvas-2d",
      gradientType: "radial-gradient",
      gradientClass: GradientRadial,
      expectedName: "GradientRadial"
    });
  }
  transform(gradient) {
    return {
      draw: (ctx, width, height) => {
        const config = gradient.getConfig();
        const isRepeating = gradient.isRepeating();
        const center = resolveGradientPosition(
          config.position,
          width,
          height,
          {
            context: "Canvas radial gradient",
            allowUnsupportedUnitAsRaw: true
          }
        );
        const radii = resolveRadialRadii(
          config.size,
          config.shape,
          center,
          width,
          height,
          {
            context: "Canvas radial gradient",
            allowUnsupportedUnitAsRaw: true
          }
        );
        const maxVisibleT = getMaxVisibleRadialT(
          center,
          radii,
          width,
          height
        );
        const baseStops = resolveRenderableGradientStops(
          gradient,
          RADIAL_GRADIENT_SAMPLE_COUNT
        );
        const renderStops = isRepeating ? expandRepeatingStopsTo(baseStops, 0, maxVisibleT) : baseStops;
        const { min, max, stops } = getRenderableStopRange(renderStops);
        let normalizedStops = stops;
        let innerFactor = 0;
        let outerFactor = isRepeating ? maxVisibleT : 1;
        if (isRepeating) {
          normalizedStops = normalizeRenderableStops(stops, 0, maxVisibleT);
        } else if (min < 0 || max > 1) {
          normalizedStops = normalizeRenderableStops(stops, min, max);
          innerFactor = min;
          outerFactor = max;
        }
        if (config.shape === "circle") {
          const baseRadius = radii.x;
          const innerRadius2 = Math.max(0, baseRadius * innerFactor);
          const outerRadius2 = Math.max(
            innerRadius2 + 1e-4,
            baseRadius * outerFactor
          );
          const g2 = ctx.createRadialGradient(
            center.x,
            center.y,
            innerRadius2,
            center.x,
            center.y,
            outerRadius2
          );
          for (const stop of normalizedStops) {
            g2.addColorStop(
              stop.position,
              formatColorForCanvas(stop.value)
            );
          }
          ctx.fillStyle = g2;
          ctx.fillRect(0, 0, width, height);
          return;
        }
        const outerRadius = Math.max(radii.x, radii.y);
        const scaleX = radii.x / outerRadius;
        const scaleY = radii.y / outerRadius;
        const innerRadius = Math.max(0, outerRadius * innerFactor);
        const scaledOuterRadius = Math.max(
          innerRadius + 1e-4,
          outerRadius * outerFactor
        );
        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.scale(scaleX, scaleY);
        const g = ctx.createRadialGradient(
          0,
          0,
          innerRadius,
          0,
          0,
          scaledOuterRadius
        );
        for (const stop of normalizedStops) {
          g.addColorStop(
            stop.position,
            formatColorForCanvas(stop.value)
          );
        }
        ctx.fillStyle = g;
        const drawRadius = scaledOuterRadius + 2;
        ctx.fillRect(
          -drawRadius / scaleX * 2,
          -drawRadius / scaleY * 2,
          drawRadius / scaleX * 4,
          drawRadius / scaleY * 4
        );
        ctx.restore();
      }
    };
  }
}
const DIAMOND_GRADIENT_SAMPLE_COUNT = 128;
const DIAMOND_COLOR_LOOKUP_SIZE = 1024;
function sampleColorAtPosition(stops, position) {
  if (stops.length === 0) {
    throw new Error("Cannot sample color from empty diamond gradient stops.");
  }
  if (stops.length === 1 || position <= stops[0].position) {
    return parseColorToRgbaTuple(stops[0].value);
  }
  const lastStop = stops[stops.length - 1];
  if (position >= lastStop.position) {
    return parseColorToRgbaTuple(lastStop.value);
  }
  for (let index = 0; index < stops.length - 1; index += 1) {
    const current = stops[index];
    const next = stops[index + 1];
    if (position >= current.position && position <= next.position) {
      const range = next.position - current.position || 1;
      const localT = (position - current.position) / range;
      const currentColor = parseColorToRgbaTuple(current.value);
      const nextColor = parseColorToRgbaTuple(next.value);
      return [
        Math.round(currentColor[0] + (nextColor[0] - currentColor[0]) * localT),
        Math.round(currentColor[1] + (nextColor[1] - currentColor[1]) * localT),
        Math.round(currentColor[2] + (nextColor[2] - currentColor[2]) * localT),
        Math.round(currentColor[3] + (nextColor[3] - currentColor[3]) * localT)
      ];
    }
  }
  return parseColorToRgbaTuple(lastStop.value);
}
function buildColorLookup(stops, maxT) {
  const lookup = new Uint8ClampedArray(DIAMOND_COLOR_LOOKUP_SIZE * 4);
  for (let index = 0; index < DIAMOND_COLOR_LOOKUP_SIZE; index += 1) {
    const position = index / (DIAMOND_COLOR_LOOKUP_SIZE - 1) * maxT;
    const color = sampleColorAtPosition(stops, position);
    const offset = index * 4;
    lookup[offset] = color[0];
    lookup[offset + 1] = color[1];
    lookup[offset + 2] = color[2];
    lookup[offset + 3] = color[3];
  }
  return lookup;
}
class ModuleTransformerDiamondGradientToCanvas extends GradientTransformerModule {
  constructor() {
    super({
      target: "canvas-2d",
      gradientType: "diamond-gradient",
      gradientClass: GradientDiamond,
      expectedName: "GradientDiamond"
    });
  }
  transform(gradient) {
    return {
      draw: (ctx, width, height) => {
        const config = gradient.getConfig();
        const isRepeating = gradient.isRepeating();
        const center = resolveGradientPosition(
          config.position,
          width,
          height,
          {
            context: "Canvas diamond gradient"
          }
        );
        const radii = resolveDiamondRadii(
          config.size,
          config.shape,
          center,
          width,
          height,
          {
            context: "Canvas diamond gradient"
          }
        );
        const maxVisibleT = getMaxVisibleDiamondT(
          center,
          radii,
          width,
          height
        );
        const baseStops = resolveRenderableGradientStops(
          gradient,
          DIAMOND_GRADIENT_SAMPLE_COUNT
        );
        const renderStops = getRenderableColorStops(
          isRepeating ? expandRepeatingStopsTo(baseStops, 0, maxVisibleT) : baseStops
        );
        const colorLookup = buildColorLookup(renderStops, maxVisibleT);
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const t = Math.abs(x - center.x) / Math.max(radii.x, 1e-4) + Math.abs(y - center.y) / Math.max(radii.y, 1e-4);
            const lookupIndex = Math.min(
              DIAMOND_COLOR_LOOKUP_SIZE - 1,
              Math.max(
                0,
                Math.round(
                  t / Math.max(maxVisibleT, 1e-4) * (DIAMOND_COLOR_LOOKUP_SIZE - 1)
                )
              )
            );
            const lookupOffset = lookupIndex * 4;
            const offset = (y * width + x) * 4;
            data[offset] = colorLookup[lookupOffset];
            data[offset + 1] = colorLookup[lookupOffset + 1];
            data[offset + 2] = colorLookup[lookupOffset + 2];
            data[offset + 3] = colorLookup[lookupOffset + 3];
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }
    };
  }
}
const CONIC_GRADIENT_SAMPLE_COUNT = 128;
class ModuleTransformerConicGradientToCanvas extends GradientTransformerModule {
  constructor() {
    super({
      target: "canvas-2d",
      gradientType: "conic-gradient",
      gradientClass: GradientConic,
      expectedName: "GradientConic"
    });
  }
  transform(gradient) {
    return {
      draw: (ctx, width, height) => {
        const config = gradient.getConfig();
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        const { x: cx, y: cy } = resolveGradientPosition(
          config.position,
          width,
          height,
          {
            context: "Canvas conic gradient",
            allowUnsupportedUnitAsRaw: true
          }
        );
        const from = resolveAngleToRadians(config.from);
        const renderStops = resolveRenderableGradientStops(
          gradient,
          CONIC_GRADIENT_SAMPLE_COUNT
        );
        const stops = this._normalizeStops(renderStops);
        if (stops.length === 0) {
          ctx.putImageData(imageData, 0, 0);
          return;
        }
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const dx = x - cx;
            const dy = y - cy;
            let angle = Math.atan2(dy, dx) + Math.PI / 2 - from;
            while (angle < 0) {
              angle += Math.PI * 2;
            }
            while (angle >= Math.PI * 2) {
              angle -= Math.PI * 2;
            }
            const t = angle / (Math.PI * 2);
            const color = this._sampleColor(stops, t);
            const index = (y * width + x) * 4;
            data[index] = color.r;
            data[index + 1] = color.g;
            data[index + 2] = color.b;
            data[index + 3] = color.a;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }
    };
  }
  _normalizeStops(stops) {
    const colorStops = getRenderableColorStops(stops).map((stop) => ({
      position: clamp01(stop.position),
      color: parseColorToRgbaByte(stop.value)
    })).sort((a, b) => a.position - b.position);
    return colorStops;
  }
  _sampleColor(stops, t) {
    if (stops.length === 1) {
      return stops[0].color;
    }
    const first = stops[0];
    const extended = [...stops, { ...first, position: first.position + 1 }];
    let sampleT = t;
    if (sampleT < first.position) {
      sampleT += 1;
    }
    for (let i = 0; i < extended.length - 1; i++) {
      const left = extended[i];
      const right = extended[i + 1];
      if (sampleT >= left.position && sampleT <= right.position) {
        const span = right.position - left.position || 1;
        const localT = (sampleT - left.position) / span;
        return mixRgbaByteColor(left.color, right.color, localT);
      }
    }
    return stops[stops.length - 1].color;
  }
}
const BICUBIC_SUBDIVISIONS$2 = 24;
function fillMeshTriangle(data, width, height, triangle) {
  rasterizeMeshTriangle(width, height, triangle, (x, y, color) => {
    const offset = (y * width + x) * 4;
    data[offset] = Math.round(color[0] * 255);
    data[offset + 1] = Math.round(color[1] * 255);
    data[offset + 2] = Math.round(color[2] * 255);
    data[offset + 3] = Math.round(color[3] * 255);
  });
}
class ModuleTransformerMeshGradientToCanvas extends GradientTransformerModule {
  constructor() {
    super({
      target: "canvas-2d",
      gradientType: "mesh-gradient",
      gradientClass: GradientMesh,
      expectedName: "GradientMesh"
    });
  }
  transform(gradient) {
    return {
      draw: (ctx, width, height) => {
        const imageData = ctx.createImageData(width, height);
        const { config, patches, vertexMap, grid, sampler } = buildMeshRenderContext(gradient, width, height);
        const subdivisions = config.method === "bicubic" ? BICUBIC_SUBDIVISIONS$2 : 1;
        const edgeTriangles = buildMeshEdgeSkirtTriangles(
          sampler,
          patches,
          grid,
          width,
          height,
          subdivisions
        );
        for (const patch of patches) {
          const triangles = buildPatchTriangles(
            sampler,
            patch,
            vertexMap,
            subdivisions
          );
          for (const triangle of triangles) {
            fillMeshTriangle(imageData.data, width, height, triangle);
          }
        }
        for (const triangle of edgeTriangles) {
          fillMeshTriangle(imageData.data, width, height, triangle);
        }
        ctx.putImageData(imageData, 0, 0);
      }
    };
  }
}
function createWebGLShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Failed to create WebGL shader.");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`WebGL shader compile error: ${error}`);
  }
  return shader;
}
function createWebGLProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = createWebGLShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createWebGLShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentSource
  );
  const program = gl.createProgram();
  if (!program) {
    throw new Error("Failed to create WebGL program.");
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`WebGL program link error: ${error}`);
  }
  return program;
}
function toWebGLColor(input) {
  const color = parseColorToRgbaByte(input);
  return [
    color.r / 255,
    color.g / 255,
    color.b / 255,
    color.a / 255
  ];
}
function getWebGLSampleCount(stops, maxStops) {
  const colorStopCount = getRenderableColorStopCount(stops);
  const segmentCount = Math.max(1, colorStopCount - 1);
  return Math.max(2, Math.floor((maxStops - 1) / segmentCount));
}
function fitStopsToWebGLLimit(stops, maxStops) {
  return fitRenderableStopsToLimit(stops, maxStops);
}
const WEBGL_MAX_STOPS = 128;
const WEBGL_FRAGMENT_PRECISION = "precision mediump float;";
const WEBGL_FULLSCREEN_VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;
function createWebGLColorStopsShader(maxStops = WEBGL_MAX_STOPS) {
  return `
uniform int u_stopCount;
uniform float u_positions[${maxStops}];
uniform vec4 u_colors[${maxStops}];

vec4 getGradientColor(float t) {
    vec4 result = u_colors[0];

    for (int i = 0; i < ${maxStops - 1}; i++) {
        if (i >= u_stopCount - 1) {
            break;
        }

        float currentPosition = u_positions[i];
        float nextPosition = u_positions[i + 1];

        if (t <= currentPosition) {
            return u_colors[i];
        }

        if (t >= currentPosition && t <= nextPosition) {
            float localT = (t - currentPosition) / max(nextPosition - currentPosition, 0.00001);
            return mix(u_colors[i], u_colors[i + 1], localT);
        }

        result = u_colors[i + 1];
    }

    return result;
}
`;
}
const WEBGL_MESH_VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec4 a_color;
varying vec4 v_color;

void main() {
    v_color = a_color;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;
const WEBGL_MESH_FRAGMENT_SHADER = `
${WEBGL_FRAGMENT_PRECISION}
varying vec4 v_color;

void main() {
    gl_FragColor = v_color;
}
`;
const WEBGL_FULLSCREEN_TRIANGLES = new Float32Array([
  -1,
  -1,
  1,
  -1,
  -1,
  1,
  -1,
  1,
  1,
  -1,
  1,
  1
]);
function prepareWebGLCanvas(canvas, width, height) {
  const gl = canvas.getContext("webgl");
  if (!gl) {
    throw new Error("WebGL is not supported.");
  }
  canvas.width = width;
  canvas.height = height;
  gl.viewport(0, 0, width, height);
  return gl;
}
function bindWebGLAttribute(gl, program, name, data, size) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    throw new Error(`Failed to create WebGL buffer for attribute "${name}".`);
  }
  const location2 = gl.getAttribLocation(program, name);
  if (location2 < 0) {
    throw new Error(`WebGL attribute "${name}" was not found.`);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(location2);
  gl.vertexAttribPointer(location2, size, gl.FLOAT, false, 0, 0);
  return buffer;
}
function bindWebGLFullscreenQuad(gl, program) {
  bindWebGLAttribute(
    gl,
    program,
    "a_position",
    WEBGL_FULLSCREEN_TRIANGLES,
    2
  );
}
function setWebGLGradientStopUniforms(gl, program, stops, maxStops = WEBGL_MAX_STOPS) {
  const limitedStops = stops.slice(0, maxStops);
  const positions = new Float32Array(maxStops);
  const colors = new Float32Array(maxStops * 4);
  limitedStops.forEach((stop, index) => {
    const color = toWebGLColor(stop.value);
    positions[index] = stop.position;
    colors[index * 4 + 0] = color[0];
    colors[index * 4 + 1] = color[1];
    colors[index * 4 + 2] = color[2];
    colors[index * 4 + 3] = color[3];
  });
  gl.uniform1i(
    gl.getUniformLocation(program, "u_stopCount"),
    limitedStops.length
  );
  gl.uniform1fv(
    gl.getUniformLocation(program, "u_positions"),
    positions
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "u_colors"),
    colors
  );
}
function clearWebGLCanvas(gl) {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
function drawWebGLTriangles(gl, vertexCount) {
  clearWebGLCanvas(gl);
  gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}
class ModuleTransformerLinearGradientToCanvasWebGL extends GradientTransformerModule {
  constructor() {
    super({
      target: "canvas-webgl",
      gradientType: "linear-gradient",
      gradientClass: GradientLinear,
      expectedName: "GradientLinear"
    });
  }
  transform(gradient) {
    return {
      draw: (canvas, width, height) => {
        const gl = prepareWebGLCanvas(canvas, width, height);
        const fragmentSource = `
                    ${WEBGL_FRAGMENT_PRECISION}

                    varying vec2 v_uv;

                    uniform vec2 u_start;
                    uniform vec2 u_end;
                    ${createWebGLColorStopsShader(WEBGL_MAX_STOPS)}

                    void main() {
                        vec2 axis = u_end - u_start;
                        vec2 point = v_uv;

                        float axisLengthSquared = dot(axis, axis);
                        float t = dot(point - u_start, axis) / axisLengthSquared;

                        t = clamp(t, 0.0, 1.0);

                        gl_FragColor = getGradientColor(t);
                    }
                `;
        const program = createWebGLProgram(
          gl,
          WEBGL_FULLSCREEN_VERTEX_SHADER,
          fragmentSource
        );
        gl.useProgram(program);
        bindWebGLFullscreenQuad(gl, program);
        const angle = gradient.getConfig().angle;
        const line = resolveLinearGradientLine(angle, width, height);
        let startX = line.start.x;
        let startY = line.start.y;
        let endX = line.end.x;
        let endY = line.end.y;
        const sampleCount = getWebGLSampleCount(
          gradient.getStops(),
          WEBGL_MAX_STOPS
        );
        const renderStops = resolveRenderableGradientStops(
          gradient,
          sampleCount
        );
        const { min, max, stops } = getRenderableStopRange(renderStops);
        let normalizedStops = stops;
        if (min < 0 || max > 1) {
          const vx = endX - startX;
          const vy = endY - startY;
          const baseStartX = startX;
          const baseStartY = startY;
          startX = baseStartX + vx * min;
          startY = baseStartY + vy * min;
          endX = baseStartX + vx * max;
          endY = baseStartY + vy * max;
          normalizedStops = normalizeRenderableStops(stops, min, max);
        }
        const startU = startX / width;
        const startV = 1 - startY / height;
        const endU = endX / width;
        const endV = 1 - endY / height;
        const limitedStops = fitStopsToWebGLLimit(
          normalizedStops,
          WEBGL_MAX_STOPS
        );
        gl.uniform2f(
          gl.getUniformLocation(program, "u_start"),
          startU,
          startV
        );
        gl.uniform2f(
          gl.getUniformLocation(program, "u_end"),
          endU,
          endV
        );
        setWebGLGradientStopUniforms(
          gl,
          program,
          limitedStops,
          WEBGL_MAX_STOPS
        );
        drawWebGLTriangles(gl, 6);
      }
    };
  }
}
class ModuleTransformerConicGradientToCanvasWebGL extends GradientTransformerModule {
  constructor() {
    super({
      target: "canvas-webgl",
      gradientType: "conic-gradient",
      gradientClass: GradientConic,
      expectedName: "GradientConic"
    });
  }
  transform(gradient) {
    return {
      draw: (canvas, width, height) => {
        const config = gradient.getConfig();
        const gl = prepareWebGLCanvas(canvas, width, height);
        const fragmentSource = `
                    ${WEBGL_FRAGMENT_PRECISION}

                    const float PI = 3.141592653589793;
                    const float TWO_PI = 6.283185307179586;

                    varying vec2 v_uv;

                    uniform vec2 u_center;
                    uniform float u_startAngle;
                    ${createWebGLColorStopsShader(WEBGL_MAX_STOPS)}

                    void main() {
                        vec2 delta = v_uv - u_center;

                        float angle = atan(delta.y, delta.x);
                        float cssAngle = mod((PI * 0.5) - angle + TWO_PI, TWO_PI);

                        float t = mod(cssAngle - u_startAngle + TWO_PI, TWO_PI) / TWO_PI;

                        gl_FragColor = getGradientColor(t);
                    }
                `;
        const program = createWebGLProgram(
          gl,
          WEBGL_FULLSCREEN_VERTEX_SHADER,
          fragmentSource
        );
        gl.useProgram(program);
        bindWebGLFullscreenQuad(gl, program);
        const center = resolveGradientPosition(
          config.position,
          width,
          height,
          {
            context: "WebGL conic gradient"
          }
        );
        const sampleCount = getWebGLSampleCount(
          gradient.getStops(),
          WEBGL_MAX_STOPS
        );
        const renderStops = resolveRenderableGradientStops(
          gradient,
          sampleCount
        );
        const limitedStops = fitStopsToWebGLLimit(
          renderStops,
          WEBGL_MAX_STOPS
        );
        gl.uniform2f(
          gl.getUniformLocation(program, "u_center"),
          center.x / width,
          1 - center.y / height
        );
        gl.uniform1f(
          gl.getUniformLocation(program, "u_startAngle"),
          resolveAngleToRadians(config.from)
        );
        setWebGLGradientStopUniforms(
          gl,
          program,
          limitedStops,
          WEBGL_MAX_STOPS
        );
        drawWebGLTriangles(gl, 6);
      }
    };
  }
}
const MAX_REPEATING_RADIAL_T = 16;
class ModuleTransformerRadialGradientToCanvasWebGL extends GradientTransformerModule {
  constructor() {
    super({
      target: "canvas-webgl",
      gradientType: "radial-gradient",
      gradientClass: GradientRadial,
      expectedName: "GradientRadial"
    });
  }
  transform(gradient) {
    return {
      draw: (canvas, width, height) => {
        const config = gradient.getConfig();
        const isRepeating = gradient.isRepeating();
        const gl = prepareWebGLCanvas(canvas, width, height);
        const fragmentSource = `
                    ${WEBGL_FRAGMENT_PRECISION}

                    varying vec2 v_uv;

                    uniform vec2 u_center;
                    uniform vec2 u_radius;
                    uniform float u_tMax;
                    ${createWebGLColorStopsShader(WEBGL_MAX_STOPS)}

                    void main() {
                        vec2 delta = v_uv - u_center;
                        vec2 normalized = delta / max(u_radius, vec2(0.00001));
                        float t = length(normalized);

                        t = clamp(t, 0.0, u_tMax);
                        t = t / max(u_tMax, 0.00001);

                        gl_FragColor = getGradientColor(t);
                    }
                `;
        const program = createWebGLProgram(
          gl,
          WEBGL_FULLSCREEN_VERTEX_SHADER,
          fragmentSource
        );
        gl.useProgram(program);
        bindWebGLFullscreenQuad(gl, program);
        const center = resolveGradientPosition(
          config.position,
          width,
          height,
          {
            context: "WebGL radial gradient"
          }
        );
        const radius = resolveRadialRadii(
          config.size,
          config.shape,
          center,
          width,
          height,
          {
            context: "WebGL radial gradient"
          }
        );
        const maxVisibleT = getMaxVisibleRadialT(
          center,
          radius,
          width,
          height
        );
        const sampleCount = getWebGLSampleCount(
          gradient.getStops(),
          WEBGL_MAX_STOPS
        );
        const baseStops = resolveRenderableGradientStops(
          gradient,
          sampleCount
        );
        const repeatMaxT = Math.min(maxVisibleT, MAX_REPEATING_RADIAL_T);
        const maxT = isRepeating ? repeatMaxT : 1;
        const renderStops = isRepeating ? expandRepeatingStopsTo(baseStops, 0, repeatMaxT) : baseStops;
        const normalizedStops = isRepeating ? normalizeRenderableStops(renderStops, 0, repeatMaxT) : renderStops;
        const limitedStops = fitStopsToWebGLLimit(
          normalizedStops,
          WEBGL_MAX_STOPS
        );
        gl.uniform2f(
          gl.getUniformLocation(program, "u_center"),
          center.x / width,
          1 - center.y / height
        );
        gl.uniform2f(
          gl.getUniformLocation(program, "u_radius"),
          radius.x / width,
          radius.y / height
        );
        gl.uniform1f(
          gl.getUniformLocation(program, "u_tMax"),
          maxT
        );
        setWebGLGradientStopUniforms(
          gl,
          program,
          limitedStops,
          WEBGL_MAX_STOPS
        );
        drawWebGLTriangles(gl, 6);
      }
    };
  }
}
const MAX_REPEATING_DIAMOND_T = 16;
class ModuleTransformerDiamondGradientToCanvasWebGL extends GradientTransformerModule {
  constructor() {
    super({
      target: "canvas-webgl",
      gradientType: "diamond-gradient",
      gradientClass: GradientDiamond,
      expectedName: "GradientDiamond"
    });
  }
  transform(gradient) {
    return {
      draw: (canvas, width, height) => {
        const config = gradient.getConfig();
        const isRepeating = gradient.isRepeating();
        const gl = prepareWebGLCanvas(canvas, width, height);
        const fragmentSource = `
                    ${WEBGL_FRAGMENT_PRECISION}

                    varying vec2 v_uv;

                    uniform vec2 u_center;
                    uniform vec2 u_radius;
                    uniform float u_tMax;
                    ${createWebGLColorStopsShader(WEBGL_MAX_STOPS)}

                    void main() {
                        vec2 delta = v_uv - u_center;
                        vec2 normalized = abs(delta) / max(u_radius, vec2(0.00001));
                        float t = normalized.x + normalized.y;

                        t = clamp(t, 0.0, u_tMax);
                        t = t / max(u_tMax, 0.00001);

                        gl_FragColor = getGradientColor(t);
                    }
                `;
        const program = createWebGLProgram(
          gl,
          WEBGL_FULLSCREEN_VERTEX_SHADER,
          fragmentSource
        );
        gl.useProgram(program);
        bindWebGLFullscreenQuad(gl, program);
        const center = resolveGradientPosition(
          config.position,
          width,
          height,
          {
            context: "WebGL diamond gradient"
          }
        );
        const radius = resolveDiamondRadii(
          config.size,
          config.shape,
          center,
          width,
          height,
          {
            context: "WebGL diamond gradient"
          }
        );
        const maxVisibleT = getMaxVisibleDiamondT(
          center,
          radius,
          width,
          height
        );
        const sampleCount = getWebGLSampleCount(
          gradient.getStops(),
          WEBGL_MAX_STOPS
        );
        const baseStops = resolveRenderableGradientStops(
          gradient,
          sampleCount
        );
        const repeatMaxT = Math.min(maxVisibleT, MAX_REPEATING_DIAMOND_T);
        const maxT = isRepeating ? repeatMaxT : 1;
        const renderStops = isRepeating ? expandRepeatingStopsTo(baseStops, 0, repeatMaxT) : baseStops;
        const normalizedStops = isRepeating ? normalizeRenderableStops(renderStops, 0, repeatMaxT) : renderStops;
        const limitedStops = fitStopsToWebGLLimit(
          normalizedStops,
          WEBGL_MAX_STOPS
        );
        gl.uniform2f(
          gl.getUniformLocation(program, "u_center"),
          center.x / width,
          1 - center.y / height
        );
        gl.uniform2f(
          gl.getUniformLocation(program, "u_radius"),
          radius.x / width,
          radius.y / height
        );
        gl.uniform1f(
          gl.getUniformLocation(program, "u_tMax"),
          maxT
        );
        setWebGLGradientStopUniforms(
          gl,
          program,
          limitedStops,
          WEBGL_MAX_STOPS
        );
        drawWebGLTriangles(gl, 6);
      }
    };
  }
}
const BICUBIC_SUBDIVISIONS$1 = 24;
function toClipX(value, width) {
  return value / width * 2 - 1;
}
function toClipY(value, height) {
  return 1 - value / height * 2;
}
class ModuleTransformerMeshGradientToCanvasWebGL extends GradientTransformerModule {
  constructor() {
    super({
      target: "canvas-webgl",
      gradientType: "mesh-gradient",
      gradientClass: GradientMesh,
      expectedName: "GradientMesh"
    });
  }
  transform(gradient) {
    return {
      draw: (canvas, width, height) => {
        const gl = prepareWebGLCanvas(canvas, width, height);
        const program = createWebGLProgram(
          gl,
          WEBGL_MESH_VERTEX_SHADER,
          WEBGL_MESH_FRAGMENT_SHADER
        );
        const { config, patches, vertexMap, grid, sampler } = buildMeshRenderContext(gradient, width, height);
        const subdivisions = config.method === "bicubic" ? BICUBIC_SUBDIVISIONS$1 : 1;
        const edgeTriangles = buildMeshEdgeSkirtTriangles(
          sampler,
          patches,
          grid,
          width,
          height,
          subdivisions
        );
        const positions = [];
        const colors = [];
        for (const patch of patches) {
          const triangles = buildPatchTriangles(
            sampler,
            patch,
            vertexMap,
            subdivisions
          );
          for (const triangle of triangles) {
            for (const vertex of triangle) {
              positions.push(
                toClipX(vertex.x, width),
                toClipY(vertex.y, height)
              );
              colors.push(...vertex.color);
            }
          }
        }
        for (const triangle of edgeTriangles) {
          for (const vertex of triangle) {
            positions.push(
              toClipX(vertex.x, width),
              toClipY(vertex.y, height)
            );
            colors.push(...vertex.color);
          }
        }
        gl.useProgram(program);
        bindWebGLAttribute(
          gl,
          program,
          "a_position",
          new Float32Array(positions),
          2
        );
        bindWebGLAttribute(
          gl,
          program,
          "a_color",
          new Float32Array(colors),
          4
        );
        drawWebGLTriangles(gl, positions.length / 2);
      }
    };
  }
}
const SVG_GRADIENT_SAMPLE_COUNT = 128;
function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function toPercent(value) {
  return `${Number((value * 100).toFixed(3))}%`;
}
function formatPoint(value) {
  return `${formatNumber(value)}%`;
}
function normalizeSvgStops(stops) {
  return getRenderableColorStops(stops);
}
function parseSvgColor(input) {
  return parseColorToRgbaByte(input);
}
function formatSvgColor(color) {
  if (color.a >= 255) {
    return `rgb(${color.r} ${color.g} ${color.b})`;
  }
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${Number((color.a / 255).toFixed(4))})`;
}
function mixSvgColor(from, to, t) {
  return mixRgbaByteColor(from, to, t);
}
function sampleSvgStops(stops, position) {
  const colorStops = normalizeSvgStops(stops);
  if (colorStops.length === 0) {
    throw new Error("Cannot sample color from empty gradient stops.");
  }
  if (colorStops.length === 1) {
    return parseSvgColor(colorStops[0].value);
  }
  const first = colorStops[0];
  const extendedStops = [
    ...colorStops,
    {
      ...first,
      position: first.position + 1
    }
  ];
  let samplePosition2 = position;
  if (samplePosition2 < first.position) {
    samplePosition2 += 1;
  }
  for (let index = 0; index < extendedStops.length - 1; index += 1) {
    const current = extendedStops[index];
    const next = extendedStops[index + 1];
    if (samplePosition2 >= current.position && samplePosition2 <= next.position) {
      const span = next.position - current.position || 1;
      const localT = (samplePosition2 - current.position) / span;
      return mixSvgColor(
        parseSvgColor(current.value),
        parseSvgColor(next.value),
        localT
      );
    }
  }
  return parseSvgColor(colorStops[colorStops.length - 1].value);
}
function buildSvgStops(gradient) {
  return normalizeSvgStops(
    resolveRenderableGradientStops(gradient, SVG_GRADIENT_SAMPLE_COUNT)
  ).map(
    (stop) => `<stop offset="${toPercent(clamp01(stop.position))}" stop-color="${escapeXml(stop.value)}"/>`
  ).join("");
}
function buildSvgGradientResult(input) {
  const defs = `<defs>${input.gradient}</defs>`;
  return {
    id: input.id,
    href: `#${input.id}`,
    url: `url(#${input.id})`,
    type: input.type,
    gradient: input.gradient,
    defs,
    svg: `<svg xmlns="http://www.w3.org/2000/svg">${defs}</svg>`
  };
}
const DEFAULT_ID$4 = "gradiente-linear-gradient";
class ModuleTransformerLinearGradientToSvg extends GradientTransformerModule {
  constructor() {
    super({
      target: "svg",
      gradientType: "linear-gradient",
      gradientClass: GradientLinear,
      expectedName: "GradientLinear"
    });
  }
  transform(gradientValue) {
    const id = DEFAULT_ID$4;
    const vector = resolveLinearGradientVector(gradientValue.getConfig().angle);
    const stopsSvg = buildSvgStops(gradientValue);
    const gradient = [
      `<linearGradient id="${id}" gradientUnits="objectBoundingBox" x1="${formatPoint(vector.x1)}" y1="${formatPoint(vector.y1)}" x2="${formatPoint(vector.x2)}" y2="${formatPoint(vector.y2)}">`,
      stopsSvg,
      "</linearGradient>"
    ].join("");
    return buildSvgGradientResult({
      id,
      type: "linearGradient",
      gradient
    });
  }
}
const DEFAULT_ID$3 = "gradiente-radial-gradient";
class ModuleTransformerRadialGradientToSvg extends GradientTransformerModule {
  constructor() {
    super({
      target: "svg",
      gradientType: "radial-gradient",
      gradientClass: GradientRadial,
      expectedName: "GradientRadial"
    });
  }
  transform(gradientValue) {
    const config = gradientValue.getConfig();
    const id = DEFAULT_ID$3;
    const center = resolveGradientPosition(
      config.position,
      100,
      100,
      {
        context: "SVG radial gradient",
        allowUnsupportedUnitAsRaw: true
      }
    );
    const radii = resolveRadialRadii(
      config.size,
      config.shape,
      center,
      100,
      100,
      {
        context: "SVG radial gradient",
        allowUnsupportedUnitAsRaw: true
      }
    );
    const radius = Math.max(radii.x, radii.y);
    const scaleX = radii.x / radius;
    const scaleY = radii.y / radius;
    const transform = config.shape === "ellipse" ? ` gradientTransform="translate(${center.x} ${center.y}) scale(${scaleX} ${scaleY}) translate(${-center.x} ${-center.y})"` : "";
    const gradient = [
      `<radialGradient id="${id}" gradientUnits="objectBoundingBox" cx="${formatPoint(center.x)}" cy="${formatPoint(center.y)}" r="${formatPoint(radius)}"${transform}>`,
      buildSvgStops(gradientValue),
      "</radialGradient>"
    ].join("");
    return buildSvgGradientResult({
      id,
      type: "radialGradient",
      gradient
    });
  }
}
const DEFAULT_ID$2 = "gradiente-conic-gradient";
const TWO_PI = Math.PI * 2;
const VIEW_BOX_SIZE$1 = 100;
const CONIC_SEGMENT_COUNT = 720;
function getCoverRadius(center) {
  const corners = [
    { x: 0, y: 0 },
    { x: VIEW_BOX_SIZE$1, y: 0 },
    { x: 0, y: VIEW_BOX_SIZE$1 },
    { x: VIEW_BOX_SIZE$1, y: VIEW_BOX_SIZE$1 }
  ];
  return Math.max(...corners.map(
    (corner) => getEuclideanDistance(center, corner)
  )) * 1.02;
}
function pointOnConicRay(center, radius, angle) {
  return {
    x: center.x + Math.sin(angle) * radius,
    y: center.y - Math.cos(angle) * radius
  };
}
class ModuleTransformerConicGradientToSvg extends GradientTransformerModule {
  constructor() {
    super({
      target: "svg",
      gradientType: "conic-gradient",
      gradientClass: GradientConic,
      expectedName: "GradientConic"
    });
  }
  transform(gradientValue) {
    const config = gradientValue.getConfig();
    const id = DEFAULT_ID$2;
    const center = resolveGradientPosition(
      config.position,
      VIEW_BOX_SIZE$1,
      VIEW_BOX_SIZE$1,
      {
        context: "SVG conic gradient",
        allowUnsupportedUnitAsRaw: true
      }
    );
    const from = resolveAngleToRadians(config.from);
    const stops = resolveRenderableGradientStops(
      gradientValue,
      SVG_GRADIENT_SAMPLE_COUNT
    );
    const radius = getCoverRadius(center);
    const paths = [];
    for (let index = 0; index < CONIC_SEGMENT_COUNT; index += 1) {
      const startT = index / CONIC_SEGMENT_COUNT;
      const endT = (index + 1) / CONIC_SEGMENT_COUNT;
      const color = formatSvgColor(
        sampleSvgStops(stops, startT + (endT - startT) / 2)
      );
      const start = pointOnConicRay(center, radius, startT * TWO_PI + from);
      const end = pointOnConicRay(center, radius, endT * TWO_PI + from);
      paths.push(
        [
          `<path d="M ${formatNumber(center.x)} ${formatNumber(center.y)}`,
          `L ${formatNumber(start.x)} ${formatNumber(start.y)}`,
          `A ${formatNumber(radius)} ${formatNumber(radius)} 0 0 1 ${formatNumber(end.x)} ${formatNumber(end.y)}`,
          `Z" fill="${color}" stroke="${color}" stroke-width="0.25"/>`
        ].join(" ")
      );
    }
    const vectorSvg = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_BOX_SIZE$1} ${VIEW_BOX_SIZE$1}" width="${VIEW_BOX_SIZE$1}" height="${VIEW_BOX_SIZE$1}">`,
      ...paths,
      "</svg>"
    ].join("");
    const gradient = [
      `<pattern id="${id}" patternUnits="objectBoundingBox" width="1" height="1" viewBox="0 0 ${VIEW_BOX_SIZE$1} ${VIEW_BOX_SIZE$1}" preserveAspectRatio="none">`,
      `<image width="${VIEW_BOX_SIZE$1}" height="${VIEW_BOX_SIZE$1}" href="${escapeXml(encodeSvgDataUrl(vectorSvg))}"/>`,
      "</pattern>"
    ].join("");
    return buildSvgGradientResult({
      id,
      type: "pattern",
      gradient
    });
  }
}
const DEFAULT_ID$1 = "gradiente-diamond-gradient";
const VIEW_BOX_SIZE = 100;
function buildDiamondPolygon(center, radii, position) {
  const x = radii.x * position;
  const y = radii.y * position;
  return [
    `${formatNumber(center.x)} ${formatNumber(center.y - y)}`,
    `${formatNumber(center.x + x)} ${formatNumber(center.y)}`,
    `${formatNumber(center.x)} ${formatNumber(center.y + y)}`,
    `${formatNumber(center.x - x)} ${formatNumber(center.y)}`
  ].join(" ");
}
class ModuleTransformerDiamondGradientToSvg extends GradientTransformerModule {
  constructor() {
    super({
      target: "svg",
      gradientType: "diamond-gradient",
      gradientClass: GradientDiamond,
      expectedName: "GradientDiamond"
    });
  }
  transform(gradientValue) {
    const config = gradientValue.getConfig();
    const isRepeating = gradientValue.isRepeating();
    const id = DEFAULT_ID$1;
    const center = resolveGradientPosition(
      config.position,
      VIEW_BOX_SIZE,
      VIEW_BOX_SIZE,
      {
        context: "SVG diamond gradient"
      }
    );
    const radii = resolveDiamondRadii(
      config.size,
      config.shape,
      center,
      VIEW_BOX_SIZE,
      VIEW_BOX_SIZE,
      {
        context: "SVG diamond gradient"
      }
    );
    const maxVisibleT = getMaxVisibleDiamondT(
      center,
      radii,
      VIEW_BOX_SIZE,
      VIEW_BOX_SIZE
    );
    const maxT = isRepeating ? maxVisibleT : 1;
    const baseStops = resolveRenderableGradientStops(
      gradientValue,
      SVG_GRADIENT_SAMPLE_COUNT
    );
    const stops = getRenderableColorStops(
      isRepeating ? expandRepeatingStopsTo(baseStops, 0, maxVisibleT) : baseStops
    );
    const outerColor = formatSvgColor(sampleSvgStops(stops, maxT));
    const sampleCount = Math.max(
      SVG_GRADIENT_SAMPLE_COUNT,
      Math.ceil(SVG_GRADIENT_SAMPLE_COUNT * maxT)
    );
    const polygons = [];
    for (let index = sampleCount; index >= 0; index -= 1) {
      const position = index / sampleCount * maxT;
      const color = formatSvgColor(sampleSvgStops(stops, position));
      const points = buildDiamondPolygon(center, radii, position);
      polygons.push(`<polygon points="${points}" fill="${color}"/>`);
    }
    const vectorSvg = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}" width="${VIEW_BOX_SIZE}" height="${VIEW_BOX_SIZE}" preserveAspectRatio="none">`,
      `<rect width="${VIEW_BOX_SIZE}" height="${VIEW_BOX_SIZE}" fill="${outerColor}"/>`,
      ...polygons,
      "</svg>"
    ].join("");
    const gradient = [
      `<pattern id="${id}" patternUnits="objectBoundingBox" width="1" height="1" viewBox="0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}" preserveAspectRatio="none">`,
      `<image width="${VIEW_BOX_SIZE}" height="${VIEW_BOX_SIZE}" href="${escapeXml(encodeSvgDataUrl(vectorSvg))}"/>`,
      "</pattern>"
    ].join("");
    return buildSvgGradientResult({
      id,
      type: "pattern",
      gradient
    });
  }
}
const DEFAULT_ID = "gradiente-mesh-gradient";
const MESH_VIEW_BOX_SIZE = 100;
const BILINEAR_SUBDIVISIONS = 32;
const BICUBIC_SUBDIVISIONS = 40;
function triangleToPolygon(triangle) {
  const [a, b, c] = triangle;
  const average = getAverageMeshTriangleColor(triangle);
  const color = formatRgbaTupleAsCss(
    [
      Math.round(average[0] * 255),
      Math.round(average[1] * 255),
      Math.round(average[2] * 255),
      average[3]
    ]
  );
  const points = [
    `${formatNumber(a.x)} ${formatNumber(a.y)}`,
    `${formatNumber(b.x)} ${formatNumber(b.y)}`,
    `${formatNumber(c.x)} ${formatNumber(c.y)}`
  ].join(" ");
  return `<polygon points="${points}" fill="${color}" stroke="${color}" stroke-width="0.08"/>`;
}
class ModuleTransformerMeshGradientToSvg extends GradientTransformerModule {
  constructor() {
    super({
      target: "svg",
      gradientType: "mesh-gradient",
      gradientClass: GradientMesh,
      expectedName: "GradientMesh"
    });
  }
  transform(gradientValue) {
    const id = DEFAULT_ID;
    const { config, patches, vertexMap, grid, sampler } = buildMeshRenderContext(
      gradientValue,
      MESH_VIEW_BOX_SIZE,
      MESH_VIEW_BOX_SIZE
    );
    const subdivisions = config.method === "bicubic" ? BICUBIC_SUBDIVISIONS : BILINEAR_SUBDIVISIONS;
    const patchTriangles = patches.flatMap(
      (patch) => buildPatchTriangles(sampler, patch, vertexMap, subdivisions)
    );
    const edgeTriangles = buildMeshEdgeSkirtTriangles(
      sampler,
      patches,
      grid,
      MESH_VIEW_BOX_SIZE,
      MESH_VIEW_BOX_SIZE,
      subdivisions
    );
    const triangles = [
      ...patchTriangles,
      ...edgeTriangles
    ];
    const polygons = triangles.map(triangleToPolygon);
    const imageSvg = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MESH_VIEW_BOX_SIZE} ${MESH_VIEW_BOX_SIZE}" width="${MESH_VIEW_BOX_SIZE}" height="${MESH_VIEW_BOX_SIZE}" preserveAspectRatio="none">`,
      ...polygons,
      "</svg>"
    ].join("");
    const gradient = [
      `<pattern id="${id}" patternUnits="objectBoundingBox" width="1" height="1" viewBox="0 0 ${MESH_VIEW_BOX_SIZE} ${MESH_VIEW_BOX_SIZE}" preserveAspectRatio="none">`,
      `<image width="${MESH_VIEW_BOX_SIZE}" height="${MESH_VIEW_BOX_SIZE}" href="${escapeXml(encodeSvgDataUrl(imageSvg))}"/>`,
      "</pattern>"
    ].join("");
    return buildSvgGradientResult({
      id,
      type: "pattern",
      gradient
    });
  }
}
class GradientTransformer {
  static add(module) {
    this._ensureInitialized();
    this._modules.set(this._getKey(module.target, module.gradientType), module);
  }
  static get(target, gradientType) {
    this._ensureInitialized();
    return this._modules.get(this._getKey(target, gradientType)) ?? null;
  }
  static remove(target, gradientType) {
    this._ensureInitialized();
    return this._modules.delete(this._getKey(target, gradientType));
  }
  static to(target, input) {
    const gradient = typeof input === "string" ? parse(input) : input;
    const module = this.get(target, gradient.type);
    if (!module) {
      throw new Error(
        `No transformer registered for target "${target}" and gradient "${gradient.type}"`
      );
    }
    return module.to(gradient);
  }
  static from(target, gradientType, input) {
    const module = this.get(target, gradientType);
    if (!module || !module.from) {
      throw new Error(
        `No reverse transformer registered for target "${target}" and gradient "${gradientType}"`
      );
    }
    return module.from(input);
  }
  static _ensureInitialized() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    this.add(new ModuleTransformerLinearGradientToCss());
    this.add(new ModuleTransformerRadialGradientToCss());
    this.add(new ModuleTransformerDiamondGradientToCss());
    this.add(new ModuleTransformerConicGradientToCss());
    this.add(new ModuleTransformerMeshGradientToCss());
    this.add(new ModuleTransformerLinearGradientToCanvas());
    this.add(new ModuleTransformerRadialGradientToCanvas());
    this.add(new ModuleTransformerDiamondGradientToCanvas());
    this.add(new ModuleTransformerConicGradientToCanvas());
    this.add(new ModuleTransformerMeshGradientToCanvas());
    this.add(new ModuleTransformerLinearGradientToCanvasWebGL());
    this.add(new ModuleTransformerRadialGradientToCanvasWebGL());
    this.add(new ModuleTransformerDiamondGradientToCanvasWebGL());
    this.add(new ModuleTransformerConicGradientToCanvasWebGL());
    this.add(new ModuleTransformerMeshGradientToCanvasWebGL());
    this.add(new ModuleTransformerLinearGradientToSvg());
    this.add(new ModuleTransformerRadialGradientToSvg());
    this.add(new ModuleTransformerConicGradientToSvg());
    this.add(new ModuleTransformerDiamondGradientToSvg());
    this.add(new ModuleTransformerMeshGradientToSvg());
  }
  static _getKey(target, gradientType) {
    return `${target}:${gradientType}`;
  }
}
__publicField(GradientTransformer, "_modules", /* @__PURE__ */ new Map());
__publicField(GradientTransformer, "_initialized", false);
function transformTo(target, input) {
  return GradientTransformer.to(target, input);
}
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "gradient-preview",
  __ssrInlineRender: true,
  props: {
    title: {},
    gradient: {},
    syntax: { default: "" },
    caption: { default: "" },
    tone: { default: "dark" }
  },
  setup(__props) {
    const props = __props;
    const previewState = computed(() => {
      try {
        const gradient = parse(props.gradient);
        return {
          backgroundImage: transformTo("css", gradient),
          error: "",
          normalized: gradient.toString()
        };
      } catch (value) {
        return {
          backgroundImage: "",
          error: value instanceof Error ? value.message : "Failed to render gradient.",
          normalized: props.syntax || props.gradient
        };
      }
    });
    const normalizedGradient = computed(() => {
      return previewState.value.normalized;
    });
    const error = computed(() => {
      return previewState.value.error;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<figure${ssrRenderAttrs(mergeProps({
        class: ["gradient-preview", `gradient-preview--${__props.tone}`]
      }, _attrs))}><div class="gradient-preview__visual" style="${ssrRenderStyle({ backgroundImage: previewState.value.backgroundImage })}"${ssrRenderAttr("data-gradiente-input", __props.gradient)}${ssrRenderAttr("data-gradiente-normalized", normalizedGradient.value)} data-gradiente-renderer="css"${ssrRenderAttr("aria-label", `${__props.title} gradient preview`)}></div><figcaption class="gradient-preview__body"><span class="gradient-preview__title">${ssrInterpolate(__props.title)}</span><code class="gradient-preview__syntax">${ssrInterpolate(__props.syntax || normalizedGradient.value)}</code>`);
      if (__props.caption) {
        _push(`<p class="gradient-preview__caption">${ssrInterpolate(__props.caption)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (error.value) {
        _push(`<p class="gradient-preview__error">${ssrInterpolate(error.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</figcaption></figure>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/gradient-preview.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
function getErrorRange(message, input) {
  const match = message.match(/at index (\d+)/);
  if (!match) {
    return {
      start: 0,
      end: Math.max(1, input.length)
    };
  }
  const index = Number(match[1]);
  return {
    start: Math.max(0, index),
    end: Math.min(input.length, index + 1)
  };
}
function analyzePattern(input) {
  try {
    const tokens = tokenizePattern(input);
    validatePattern(input);
    return {
      valid: true,
      tokens,
      diagnostics: []
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid pattern";
    const range = getErrorRange(message, input);
    return {
      valid: false,
      tokens: [],
      diagnostics: [
        {
          message,
          start: range.start,
          end: range.end,
          severity: "error"
        }
      ]
    };
  }
}
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "dsl-pattern-editor",
  __ssrInlineRender: true,
  props: {
    "modelValue": { required: true },
    "modelModifiers": {}
  },
  emits: ["update:modelValue"],
  setup(__props) {
    const model = useModel(__props, "modelValue");
    const editorRef = ref(null);
    let view = null;
    const tokenTheme = {
      entity: { color: "#0284c7", background: "rgba(2,132,199,0.16)" },
      operator: { color: "#ca8a04", background: "rgba(202,138,4,0.16)" },
      group: { color: "#9333ea", background: "rgba(147,51,234,0.16)" },
      sequence: { color: "#e11d48", background: "rgba(225,29,72,0.16)" },
      separator: { color: "#64748b", background: "rgba(100,116,139,0.16)" },
      unknown: { color: "#dc2626", background: "rgba(220,38,38,0.18)" }
    };
    function getTokenType(value) {
      if (value === "config" || value === "color-stop" || value === "color-hint") {
        return "entity";
      }
      if (value === "^" || value === "." || value === "|" || value === "~" || value === "!" || value === "&") {
        return "operator";
      }
      if (value === "(" || value === ")") return "group";
      if (value === "[" || value === "]") return "sequence";
      if (value === ",") return "separator";
      return "unknown";
    }
    function createHighlightPlugin() {
      return ViewPlugin.fromClass(
        class {
          constructor(view2) {
            __publicField(this, "decorations");
            this.decorations = this.build(view2);
          }
          update(update) {
            if (update.docChanged || update.viewportChanged) {
              this.decorations = this.build(update.view);
            }
          }
          build(view2) {
            const text = view2.state.doc.toString();
            const re = /config|color-stop|color-hint|[\^\.\|\~\!\&\(\)\[\],]/g;
            const decorations = [];
            let match;
            while (match = re.exec(text)) {
              const value = match[0];
              const type = getTokenType(value);
              const theme2 = tokenTheme[type];
              decorations.push(
                Decoration.mark({
                  attributes: {
                    style: [
                      `color: ${theme2.color}`,
                      `background: ${theme2.background}`,
                      "border-radius: 5px",
                      "padding: 1px 2px"
                    ].join(";")
                  }
                }).range(match.index, match.index + value.length)
              );
            }
            return Decoration.set(decorations, true);
          }
        },
        {
          decorations: (plugin) => plugin.decorations
        }
      );
    }
    function createErrorPlugin() {
      return ViewPlugin.fromClass(
        class {
          constructor(view2) {
            __publicField(this, "decorations");
            this.decorations = this.build(view2);
          }
          update(update) {
            if (update.docChanged || update.viewportChanged) {
              this.decorations = this.build(update.view);
            }
          }
          build(view2) {
            const text = view2.state.doc.toString();
            const result = analyzePattern(text);
            if (result.valid || text.length === 0) {
              return Decoration.none;
            }
            const decorations = result.diagnostics.map((diagnostic) => {
              const from = Math.max(0, diagnostic.start);
              const to = Math.max(from + 1, Math.min(text.length, diagnostic.end));
              return Decoration.mark({
                attributes: {
                  title: diagnostic.message,
                  style: [
                    "text-decoration-line: underline",
                    "text-decoration-style: wavy",
                    "text-decoration-color: #ef4444",
                    "text-decoration-thickness: 2px",
                    "text-underline-offset: 4px"
                  ].join(";")
                }
              }).range(from, to);
            });
            return Decoration.set(decorations, true);
          }
        },
        {
          decorations: (plugin) => plugin.decorations
        }
      );
    }
    const dslHighlight = createHighlightPlugin();
    const dslErrors = createErrorPlugin();
    onMounted(() => {
      if (!editorRef.value) return;
      view = new EditorView({
        parent: editorRef.value,
        state: EditorState.create({
          doc: model.value,
          extensions: [
            bracketMatching(),
            keymap.of(defaultKeymap),
            placeholder(
              "^[([config,color-stop]|color-stop),~([color-hint,color-stop]|color-stop)]...."
            ),
            dslHighlight,
            dslErrors,
            EditorView.updateListener.of((update) => {
              if (!update.docChanged) return;
              model.value = update.state.doc.toString();
            }),
            EditorView.theme({
              "&": {
                width: "100%",
                padding: "24px 16px",
                fontFamily: '"Source Code Pro", monospace',
                fontSize: "20px",
                fontWeight: "bold",
                background: "white",
                color: "black",
                border: "none"
              },
              ".cm-content": {
                padding: "0",
                caretColor: "black"
              },
              ".cm-line": {
                padding: "0"
              },
              ".cm-scroller": {
                overflow: "hidden",
                fontFamily: "inherit"
              },
              ".cm-focused": {
                outline: "none"
              },
              ".cm-placeholder": {
                color: "#888"
              }
            })
          ]
        })
      });
    });
    watch(model, (value) => {
      if (!view) return;
      const current = view.state.doc.toString();
      if (value === current) return;
      view.dispatch({
        changes: {
          from: 0,
          to: current.length,
          insert: value
        }
      });
    });
    onBeforeUnmount(() => {
      view == null ? void 0 : view.destroy();
      view = null;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "editorRef",
        ref: editorRef,
        class: "input"
      }, _attrs))} data-v-44359220></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/playground/dsl-pattern-editor.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const DslPatternEditor = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-44359220"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "dsl-pattern-tree",
  __ssrInlineRender: true,
  props: {
    pattern: {}
  },
  setup(__props) {
    const props = __props;
    const tokenTheme = {
      entity: { color: "#0284c7", background: "rgba(2,132,199,0.16)" },
      operator: { color: "#ca8a04", background: "rgba(202,138,4,0.16)" },
      group: { color: "#9333ea", background: "rgba(147,51,234,0.16)" },
      sequence: { color: "#e11d48", background: "rgba(225,29,72,0.16)" },
      separator: { color: "#64748b", background: "rgba(100,116,139,0.16)" },
      unknown: { color: "#dc2626", background: "rgba(220,38,38,0.18)" }
    };
    const selectedPairId = ref(null);
    const selectedBranchIds = ref([]);
    const collapsedIds = ref(/* @__PURE__ */ new Set());
    const tokenRegex = /config|color-stop|color-hint|[\^\.\|\~\!\&\(\)\[\],]/g;
    function createNode(value, id) {
      if (value === "config")
        return {
          id,
          type: "entity",
          title: "CONFIG",
          symbol: value,
          description: "Gradient configuration input."
        };
      if (value === "color-stop")
        return {
          id,
          type: "entity",
          title: "COLOR STOP",
          symbol: value,
          description: "Gradient color stop input."
        };
      if (value === "color-hint")
        return {
          id,
          type: "entity",
          title: "COLOR HINT",
          symbol: value,
          description: "Interpolation hint between color stops."
        };
      const map = {
        "^": {
          type: "operator",
          title: "BEGIN",
          symbol: "^",
          description: "Pattern starts here."
        },
        ".": {
          type: "operator",
          title: "END",
          symbol: ".",
          description: "Pattern ends here."
        },
        "[": {
          type: "sequence",
          title: "SEQUENCE",
          symbol: "[",
          description: "Ordered list of expressions.",
          children: [],
          collapsible: true
        },
        "]": {
          type: "sequence",
          title: "SEQUENCE CLOSE",
          symbol: "]",
          description: "Closes the current sequence."
        },
        "(": {
          type: "group",
          title: "GROUP",
          symbol: "(",
          description: "Grouped expression or alternatives.",
          children: [],
          collapsible: true
        },
        ")": {
          type: "group",
          title: "GROUP CLOSE",
          symbol: ")",
          description: "Closes the current group."
        },
        "|": {
          type: "operator",
          title: "OR",
          symbol: "|",
          description: "Splits the current group into alternative branches."
        },
        "~": {
          type: "operator",
          title: "REPEAT",
          symbol: "~",
          description: "Repeats the next expression zero or more times."
        },
        ",": {
          type: "separator",
          title: "SEPARATOR",
          symbol: ",",
          description: "Separates sequence items."
        },
        "!": {
          type: "operator",
          title: "NOT",
          symbol: "!",
          description: "Reserved logical NOT operator."
        },
        "&": {
          type: "operator",
          title: "AND",
          symbol: "&",
          description: "Reserved logical AND operator."
        }
      };
      return {
        id,
        ...map[value] ?? {
          type: "unknown",
          title: "UNKNOWN",
          symbol: value,
          description: "Unknown token."
        }
      };
    }
    function parsePattern(input) {
      var _a, _b;
      let idCounter = 0;
      let pairCounter = 0;
      const root = {
        id: `node-${idCounter++}`,
        type: "operator",
        title: "PATTERN",
        symbol: input,
        description: "Full Gradiente DSL pattern.",
        children: [],
        collapsible: true
      };
      const stack = [{ node: root, kind: "root", branchIndex: 0 }];
      const pairStack = [];
      const tokens = [...input.matchAll(tokenRegex)].map((m) => m[0]);
      for (const value of tokens) {
        const current = stack[stack.length - 1];
        const node = createNode(value, `node-${idCounter++}`);
        const activeGroup = [...stack].reverse().find((x) => x.kind === "group");
        if (activeGroup) {
          node.branchId = `${activeGroup.node.id}-branch-${activeGroup.branchIndex}`;
        }
        (_a = current.node).children ?? (_a.children = []);
        if (value === "^" || value === ".") {
          node.pairId = "pattern-root";
          current.node.children.push(node);
          continue;
        }
        if (value === "[" || value === "(") {
          const pairId = `pair-${pairCounter++}`;
          node.pairId = pairId;
          pairStack.push(pairId);
          current.node.children.push(node);
          stack.push({
            node,
            pairId,
            kind: value === "(" ? "group" : "sequence",
            branchIndex: 0
          });
          continue;
        }
        if (value === "|") {
          if (current.kind === "group") {
            node.branchPair = [
              `${current.node.id}-branch-${current.branchIndex}`,
              `${current.node.id}-branch-${current.branchIndex + 1}`
            ];
            current.node.children.push(node);
            current.branchIndex++;
            continue;
          }
          current.node.children.push(node);
          continue;
        }
        if (value === "]" || value === ")") {
          const pairId = pairStack.pop();
          node.pairId = pairId;
          if (stack.length > 1) stack.pop();
          const parent = stack[stack.length - 1];
          (_b = parent.node).children ?? (_b.children = []);
          parent.node.children.push(node);
          continue;
        }
        current.node.children.push(node);
      }
      return root;
    }
    const tree = computed(() => parsePattern(props.pattern));
    function explainNode(node, depth = 0) {
      var _a;
      const pad = "  ".repeat(depth);
      const line = node.title === "PATTERN" ? `${pad}Pattern` : `${pad}${node.title} "${node.symbol}" - ${node.description}`;
      const children = ((_a = node.children) == null ? void 0 : _a.flatMap((child) => explainNode(child, depth + 1))) ?? [];
      return [line, ...children];
    }
    const explanation = computed(() => explainNode(tree.value).join("\n"));
    function toggleCollapse(id) {
      const next = new Set(collapsedIds.value);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      collapsedIds.value = next;
    }
    const TreeNodeView = defineComponent({
      name: "TreeNodeView",
      props: {
        node: { type: Object, required: true },
        depth: { type: Number, default: 0 },
        selectedPairId: { type: String, default: null },
        selectedBranchIds: { type: Array, default: () => [] },
        collapsedIds: { type: Object, required: true },
        onSelectPair: {
          type: Function,
          required: true
        },
        onSelectBranches: {
          type: Function,
          required: true
        },
        onToggleCollapse: {
          type: Function,
          required: true
        }
      },
      setup(props2) {
        return () => {
          var _a;
          const theme2 = tokenTheme[props2.node.type];
          const isPairSelected = props2.node.pairId && props2.node.pairId === props2.selectedPairId;
          const isBranchSelected = props2.node.branchId && props2.selectedBranchIds.includes(props2.node.branchId);
          const isCollapsed = props2.collapsedIds.has(props2.node.id);
          const hasChildren = !!((_a = props2.node.children) == null ? void 0 : _a.length);
          const typeStyle = {
            color: theme2.color,
            background: theme2.background,
            borderRightColor: theme2.color
          };
          return h("div", { class: "nodeGroup" }, [
            h(
              "div",
              {
                class: [
                  "node",
                  isPairSelected ? "selectedPair" : "",
                  isBranchSelected ? "selectedBranch" : ""
                ],
                style: { marginLeft: `${props2.depth * 30}px` },
                onClick: (event) => {
                  event.stopPropagation();
                  if (props2.node.branchPair) {
                    props2.onSelectBranches(props2.node.branchPair);
                    return;
                  }
                  if (props2.node.pairId) {
                    props2.onSelectPair(props2.node.pairId);
                  }
                }
              },
              [
                hasChildren ? h(
                  "button",
                  {
                    class: "collapseButton",
                    onClick: (event) => {
                      event.stopPropagation();
                      props2.onToggleCollapse(props2.node.id);
                    }
                  },
                  isCollapsed ? "+" : "-"
                ) : h("span", { class: "collapseSpacer" }),
                h(
                  "div",
                  { class: "type", style: typeStyle },
                  `${props2.node.title} = "${props2.node.symbol}"`
                ),
                h("div", { class: "description" }, props2.node.description)
              ]
            ),
            !isCollapsed && hasChildren ? props2.node.children.map(
              (child, index) => h(TreeNodeView, {
                key: index,
                node: child,
                depth: props2.depth + 1,
                selectedPairId: props2.selectedPairId,
                selectedBranchIds: props2.selectedBranchIds,
                collapsedIds: props2.collapsedIds,
                onSelectPair: props2.onSelectPair,
                onSelectBranches: props2.onSelectBranches,
                onToggleCollapse: props2.onToggleCollapse
              })
            ) : null
          ]);
        };
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "treeCard" }, _attrs))} data-v-6af35dd1>`);
      _push(ssrRenderComponent(unref(TreeNodeView), {
        node: tree.value,
        depth: 0,
        "selected-pair-id": selectedPairId.value,
        "selected-branch-ids": selectedBranchIds.value,
        "collapsed-ids": collapsedIds.value,
        "on-select-pair": (id) => {
          selectedPairId.value = id;
          selectedBranchIds.value = [];
        },
        "on-select-branches": (ids) => {
          selectedBranchIds.value = ids;
          selectedPairId.value = null;
        },
        "on-toggle-collapse": toggleCollapse
      }, null, _parent));
      _push(`<details class="explain" data-v-6af35dd1><summary data-v-6af35dd1>Explain pattern</summary><pre data-v-6af35dd1>${ssrInterpolate(explanation.value)}</pre></details></section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/playground/dsl-pattern-tree.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const DslPatternTree = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-6af35dd1"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dsl",
  __ssrInlineRender: true,
  setup(__props) {
    const pattern = ref(
      "^[([config,color-stop,([color-hint,color-stop]|color-stop)]|color-stop),~([color-hint,color-stop]|color-stop)]."
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(DslPatternEditor, {
        modelValue: pattern.value,
        "onUpdate:modelValue": ($event) => pattern.value = $event
      }, null, _parent));
      _push(ssrRenderComponent(DslPatternTree, { pattern: pattern.value }, null, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add(".vitepress/theme/components/playground/dsl.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const RawTheme = {
  extends: theme,
  enhanceApp({ app }) {
    app.component("DSLPlayground", _sfc_main);
    app.component("GradienteFlow", GradienteFlow);
    app.component("GradientPreview", _sfc_main$3);
  }
};
const ClientOnly = defineComponent({
  setup(_, { slots }) {
    const show = ref(false);
    onMounted(() => {
      show.value = true;
    });
    return () => show.value && slots.default ? slots.default() : null;
  }
});
function useCodeGroups() {
  if (inBrowser) {
    window.addEventListener("click", (e) => {
      var _a;
      const el = e.target;
      if (el.matches(".vp-code-group input")) {
        const group = (_a = el.parentElement) == null ? void 0 : _a.parentElement;
        if (!group)
          return;
        const i = Array.from(group.querySelectorAll("input")).indexOf(el);
        if (i < 0)
          return;
        const blocks = group.querySelector(".blocks");
        if (!blocks)
          return;
        const current = Array.from(blocks.children).find((child) => child.classList.contains("active"));
        if (!current)
          return;
        const next = blocks.children[i];
        if (!next || current === next)
          return;
        current.classList.remove("active");
        next.classList.add("active");
        const label = group == null ? void 0 : group.querySelector(`label[for="${el.id}"]`);
        label == null ? void 0 : label.scrollIntoView({ block: "nearest" });
      }
    });
  }
}
function useCopyCode() {
  if (inBrowser) {
    const timeoutIdMap = /* @__PURE__ */ new WeakMap();
    window.addEventListener("click", (e) => {
      var _a;
      const el = e.target;
      if (el.matches('div[class*="language-"] > button.copy')) {
        const parent = el.parentElement;
        const sibling = (_a = el.nextElementSibling) == null ? void 0 : _a.nextElementSibling;
        if (!parent || !sibling) {
          return;
        }
        const isShell = /language-(shellscript|shell|bash|sh|zsh)/.test(parent.className);
        const ignoredNodes = [".vp-copy-ignore", ".diff.remove"];
        const clone = sibling.cloneNode(true);
        clone.querySelectorAll(ignoredNodes.join(",")).forEach((node) => node.remove());
        let text = clone.textContent || "";
        if (isShell) {
          text = text.replace(/^ *(\$|>) /gm, "").trim();
        }
        copyToClipboard(text).then(() => {
          el.classList.add("copied");
          clearTimeout(timeoutIdMap.get(el));
          const timeoutId = setTimeout(() => {
            el.classList.remove("copied");
            el.blur();
            timeoutIdMap.delete(el);
          }, 2e3);
          timeoutIdMap.set(el, timeoutId);
        });
      }
    });
  }
}
async function copyToClipboard(text) {
  try {
    return navigator.clipboard.writeText(text);
  } catch {
    const element = document.createElement("textarea");
    const previouslyFocusedElement = document.activeElement;
    element.value = text;
    element.setAttribute("readonly", "");
    element.style.contain = "strict";
    element.style.position = "absolute";
    element.style.left = "-9999px";
    element.style.fontSize = "12pt";
    const selection = document.getSelection();
    const originalRange = selection ? selection.rangeCount > 0 && selection.getRangeAt(0) : null;
    document.body.appendChild(element);
    element.select();
    element.selectionStart = 0;
    element.selectionEnd = text.length;
    document.execCommand("copy");
    document.body.removeChild(element);
    if (originalRange) {
      selection.removeAllRanges();
      selection.addRange(originalRange);
    }
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  }
}
function useUpdateHead(route, siteDataByRouteRef) {
  let isFirstUpdate = true;
  let managedHeadElements = [];
  const updateHeadTags = (newTags) => {
    if (isFirstUpdate) {
      isFirstUpdate = false;
      newTags.forEach((tag) => {
        const headEl = createHeadElement(tag);
        for (const el of document.head.children) {
          if (el.isEqualNode(headEl)) {
            managedHeadElements.push(el);
            return;
          }
        }
      });
      return;
    }
    const newElements = newTags.map(createHeadElement);
    managedHeadElements.forEach((oldEl, oldIndex) => {
      const matchedIndex = newElements.findIndex((newEl) => newEl == null ? void 0 : newEl.isEqualNode(oldEl ?? null));
      if (matchedIndex !== -1) {
        delete newElements[matchedIndex];
      } else {
        oldEl == null ? void 0 : oldEl.remove();
        delete managedHeadElements[oldIndex];
      }
    });
    newElements.forEach((el) => el && document.head.appendChild(el));
    managedHeadElements = [...managedHeadElements, ...newElements].filter(Boolean);
  };
  watchEffect(() => {
    const pageData = route.data;
    const siteData2 = siteDataByRouteRef.value;
    const pageDescription = pageData && pageData.description;
    const frontmatterHead = pageData && pageData.frontmatter.head || [];
    const title = createTitle(siteData2, pageData);
    if (title !== document.title) {
      document.title = title;
    }
    const description = pageDescription || siteData2.description;
    let metaDescriptionElement = document.querySelector(`meta[name=description]`);
    if (metaDescriptionElement) {
      if (metaDescriptionElement.getAttribute("content") !== description) {
        metaDescriptionElement.setAttribute("content", description);
      }
    } else {
      createHeadElement(["meta", { name: "description", content: description }]);
    }
    updateHeadTags(mergeHead(siteData2.head, filterOutHeadDescription(frontmatterHead)));
  });
}
function createHeadElement([tag, attrs, innerHTML]) {
  const el = document.createElement(tag);
  for (const key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
  if (innerHTML) {
    el.innerHTML = innerHTML;
  }
  if (tag === "script" && attrs.async == null) {
    el.async = false;
  }
  return el;
}
function isMetaDescription(headConfig) {
  return headConfig[0] === "meta" && headConfig[1] && headConfig[1].name === "description";
}
function filterOutHeadDescription(head) {
  return head.filter((h2) => !isMetaDescription(h2));
}
const hasFetched = /* @__PURE__ */ new Set();
const createLink = () => document.createElement("link");
const viaDOM = (url) => {
  const link2 = createLink();
  link2.rel = `prefetch`;
  link2.href = url;
  document.head.appendChild(link2);
};
const viaXHR = (url) => {
  const req = new XMLHttpRequest();
  req.open("GET", url, req.withCredentials = true);
  req.send();
};
let link;
const doFetch = inBrowser && (link = createLink()) && link.relList && link.relList.supports && link.relList.supports("prefetch") ? viaDOM : viaXHR;
function usePrefetch() {
  if (!inBrowser) {
    return;
  }
  if (!window.IntersectionObserver) {
    return;
  }
  let conn;
  if ((conn = navigator.connection) && (conn.saveData || /2g/.test(conn.effectiveType))) {
    return;
  }
  const rIC = window.requestIdleCallback || setTimeout;
  let observer = null;
  const observeLinks = () => {
    if (observer) {
      observer.disconnect();
    }
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link2 = entry.target;
          observer.unobserve(link2);
          const { pathname } = link2;
          if (!hasFetched.has(pathname)) {
            hasFetched.add(pathname);
            const pageChunkPath = pathToFile(pathname);
            if (pageChunkPath)
              doFetch(pageChunkPath);
          }
        }
      });
    });
    rIC(() => {
      document.querySelectorAll("#app a").forEach((link2) => {
        const { hostname, pathname } = new URL(link2.href instanceof SVGAnimatedString ? link2.href.animVal : link2.href, link2.baseURI);
        const extMatch = pathname.match(/\.\w+$/);
        if (extMatch && extMatch[0] !== ".html") {
          return;
        }
        if (
          // only prefetch same tab navigation, since a new tab will load
          // the lean js chunk instead.
          link2.target !== "_blank" && // only prefetch inbound links
          hostname === location.hostname
        ) {
          if (pathname !== location.pathname) {
            observer.observe(link2);
          } else {
            hasFetched.add(pathname);
          }
        }
      });
    });
  };
  onMounted(observeLinks);
  const route = useRoute();
  watch(() => route.path, observeLinks);
  onUnmounted(() => {
    observer && observer.disconnect();
  });
}
function resolveThemeExtends(theme2) {
  if (theme2.extends) {
    const base = resolveThemeExtends(theme2.extends);
    return {
      ...base,
      ...theme2,
      async enhanceApp(ctx) {
        if (base.enhanceApp)
          await base.enhanceApp(ctx);
        if (theme2.enhanceApp)
          await theme2.enhanceApp(ctx);
      }
    };
  }
  return theme2;
}
const Theme = resolveThemeExtends(RawTheme);
const VitePressApp = defineComponent({
  name: "VitePressApp",
  setup() {
    const { site, lang, dir } = useData$1();
    onMounted(() => {
      watchEffect(() => {
        document.documentElement.lang = lang.value;
        document.documentElement.dir = dir.value;
      });
    });
    if (site.value.router.prefetchLinks) {
      usePrefetch();
    }
    useCopyCode();
    useCodeGroups();
    if (Theme.setup)
      Theme.setup();
    return () => h(Theme.Layout);
  }
});
async function createApp() {
  globalThis.__VITEPRESS__ = true;
  const router = newRouter();
  const app = newApp();
  app.provide(RouterSymbol, router);
  const data = initData(router.route);
  app.provide(dataSymbol, data);
  app.component("Content", Content);
  app.component("ClientOnly", ClientOnly);
  Object.defineProperties(app.config.globalProperties, {
    $frontmatter: {
      get() {
        return data.frontmatter.value;
      }
    },
    $params: {
      get() {
        return data.page.value.params;
      }
    }
  });
  if (Theme.enhanceApp) {
    await Theme.enhanceApp({
      app,
      router,
      siteData: siteDataRef
    });
  }
  return { app, router, data };
}
function newApp() {
  return createSSRApp(VitePressApp);
}
function newRouter() {
  let isInitialPageLoad = inBrowser;
  return createRouter((path) => {
    let pageFilePath = pathToFile(path);
    let pageModule = null;
    if (pageFilePath) {
      if (isInitialPageLoad) {
        pageFilePath = pageFilePath.replace(/\.js$/, ".lean.js");
      }
      if (false) ;
      else {
        pageModule = import(
          /*@vite-ignore*/
          pageFilePath
        );
      }
    }
    if (inBrowser) {
      isInitialPageLoad = false;
    }
    return pageModule;
  }, Theme.NotFound);
}
if (inBrowser) {
  createApp().then(({ app, router, data }) => {
    router.go().then(() => {
      useUpdateHead(router.route, data.site);
      app.mount("#app");
    });
  });
}
async function render(path) {
  const { app, router } = await createApp();
  await router.go(path);
  const ctx = { content: "", vpSocialIcons: /* @__PURE__ */ new Set() };
  ctx.content = await renderToString(app, ctx);
  return ctx;
}
export {
  useRouter as a,
  createSearchTranslate as c,
  dataSymbol as d,
  escapeRegExp as e,
  inBrowser as i,
  pathToFile as p,
  render,
  useData as u
};
