import http from 'node:http';
import https from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { promises, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import invariant from 'vinxi/lib/invariant';
import { virtualId, handlerModule, join as join$1 } from 'vinxi/lib/path';
import { pathToFileURL } from 'node:url';
import { fromJSON, crossSerializeStream, getCrossReferenceHeader } from 'seroval';
import { CustomEventPlugin, DOMExceptionPlugin, EventPlugin, FormDataPlugin, HeadersPlugin, ReadableStreamPlugin, RequestPlugin, ResponsePlugin, URLSearchParamsPlugin, URLPlugin } from 'seroval-plugins/web';
import { sharedConfig, lazy, createComponent, createUniqueId, useContext, createRenderEffect, onCleanup, createContext as createContext$1, createMemo, createSignal, on, runWithOwner, getOwner, startTransition, resetErrorBoundaries, batch, untrack, $TRACK, getListener, catchError, ErrorBoundary, Suspense, children, Show, createRoot } from 'solid-js';
import { renderToString, isServer, getRequestEvent, ssrElement, escape, mergeProps, ssr, createComponent as createComponent$1, useAssets, spread, ssrHydrationKey, renderToStream, NoHydration, Hydration, ssrAttribute, HydrationScript, delegateEvents } from 'solid-js/web';
import { provideRequestEvent } from 'solid-js/web/storage';
import { NullProtoObj } from 'rou3';
import { FastURL, FastResponse } from 'srvx';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode$1(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodeQueryKey(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$1(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    const nextChar = input[_base.length];
    if (!nextChar || nextChar === "/" || nextChar === "?") {
      return input;
    }
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const nextChar = input[_base.length];
  if (nextChar && nextChar !== "/" && nextChar !== "?") {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o$1(n){throw new Error(`${n} is not implemented yet!`)}let i$4 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o$1("Readable.asyncIterator")}iterator(e){throw o$1("Readable.iterator")}map(e,t){throw o$1("Readable.map")}filter(e,t){throw o$1("Readable.filter")}forEach(e,t){throw o$1("Readable.forEach")}reduce(e,t,r){throw o$1("Readable.reduce")}find(e,t){throw o$1("Readable.find")}findIndex(e,t){throw o$1("Readable.findIndex")}some(e,t){throw o$1("Readable.some")}toArray(e){throw o$1("Readable.toArray")}every(e,t){throw o$1("Readable.every")}flatMap(e,t){throw o$1("Readable.flatMap")}drop(e,t){throw o$1("Readable.drop")}take(e,t){throw o$1("Readable.take")}asIndexedPairs(e){throw o$1("Readable.asIndexedPairs")}};let l$4 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c$2=class c{allowHalfOpen=true;_destroy;constructor(e=new i$4,t=new l$4){Object.assign(this,e),Object.assign(this,t),this._destroy=m$2(e._destroy,t._destroy);}};function _$2(){return Object.assign(c$2.prototype,i$4.prototype),Object.assign(c$2.prototype,l$4.prototype),c$2}function m$2(...n){return function(...e){for(const t of n)t(...e);}}const g$2=_$2();let A$3 = class A extends g$2{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}};let y$3 = class y extends i$4{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A$3;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p$3(this.headers)}get trailersDistinct(){return p$3(this.trailers)}};function p$3(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}let w$1 = class w extends l$4{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}};const E$2=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R$4(n={}){const e=new E$2,t=Array.isArray(n)||H$3(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H$3(n){return typeof n?.entries=="function"}function v$2(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S$4=new Set([101,204,205,304]);async function b$4(n,e){const t=new y$3,r=new w$1(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R$4(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S$4.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C$1(n,e,t={}){try{const r=await b$4(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v$2(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode$1(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage$1(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode$1(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode$1(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage$1(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus$1(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHost$1(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol$1(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL$1(event, opts = {}) {
  const host = getRequestHost$1(event, opts);
  const protocol = getRequestProtocol$1(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}

const RawBodySymbol = Symbol.for("h3RawBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !/\bchunked\b/i.test(
    String(event.node.req.headers["transfer-encoding"] ?? "")
  )) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
function getRequestWebStream$1(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS$1 = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage$1(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS$1, "");
}
function sanitizeStatusCode$1(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode$1(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus$1(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode$1(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage$1(text);
  }
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect$1(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode$1(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader$1(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode$1(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage$1(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream$1(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$2(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode$1(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage$1(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$2(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

let H3Event$1 = class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
};
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event$1(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler$2 = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler$2((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler$2(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler$2((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus$1(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$2=globalThis.Headers,i$3=globalThis.AbortController,l$3=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable$1(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable$1(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l$3;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l$3(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch$1 = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$2;
const AbortController = globalThis.AbortController || i$3;
createFetch({ fetch: fetch$1, Headers: Headers$1, AbortController });

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r$1="sha256",s$1="base64url";function digest(t){if(e)return e(r$1,t,s$1);const o=createHash(r$1).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s$1):o.digest(s$1)}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize$1(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize$1(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {};



const appConfig$1 = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {
      "/_build/assets/**": {
        "headers": {
          "cache-control": "public, immutable, max-age=31536000"
        }
      }
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig$1));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());

const nitroAsyncContext = getContext("nitro-app", {
  asyncContext: true,
  AsyncLocalStorage: AsyncLocalStorage 
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler$2((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect$1(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$0 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus$1(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL$1(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus$1(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader$1(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const appConfig = {"name":"vinxi","routers":[{"name":"public","type":"static","base":"/","dir":"./public","root":"/Users/dedirosandi/Documents/PROJECT/program-ela","order":0,"outDir":"/Users/dedirosandi/Documents/PROJECT/program-ela/.vinxi/build/public"},{"name":"ssr","type":"http","link":{"client":"client"},"handler":"src/entry-server.tsx","extensions":["js","jsx","ts","tsx"],"target":"server","root":"/Users/dedirosandi/Documents/PROJECT/program-ela","base":"/","outDir":"/Users/dedirosandi/Documents/PROJECT/program-ela/.vinxi/build/ssr","order":1},{"name":"client","type":"client","base":"/_build","handler":"src/entry-client.tsx","extensions":["js","jsx","ts","tsx"],"target":"browser","root":"/Users/dedirosandi/Documents/PROJECT/program-ela","outDir":"/Users/dedirosandi/Documents/PROJECT/program-ela/.vinxi/build/client","order":2},{"name":"server-fns","type":"http","base":"/_server","handler":"node_modules/@solidjs/start/dist/runtime/server-handler.js","target":"server","root":"/Users/dedirosandi/Documents/PROJECT/program-ela","outDir":"/Users/dedirosandi/Documents/PROJECT/program-ela/.vinxi/build/server-fns","order":3}],"server":{"compressPublicAssets":{"brotli":true},"routeRules":{"/_build/assets/**":{"headers":{"cache-control":"public, immutable, max-age=31536000"}}},"experimental":{"asyncContext":true},"preset":"vercel"},"root":"/Users/dedirosandi/Documents/PROJECT/program-ela"};
					const buildManifest = {"ssr":{"_Button-BuAho1tZ.js":{"file":"assets/Button-BuAho1tZ.js","name":"Button"},"_HttpStatusCode-DH8IeaZe.js":{"file":"assets/HttpStatusCode-DH8IeaZe.js","name":"HttpStatusCode"},"_Loading-b-bAnbUN.js":{"file":"assets/Loading-b-bAnbUN.js","name":"Loading"},"_ProductForm-CMxez_KK.js":{"file":"assets/ProductForm-CMxez_KK.js","name":"ProductForm","imports":["_Button-BuAho1tZ.js"],"dynamicImports":["src/components/BarcodeScanner.tsx"]},"_UserForm-B0Y6JnWz.js":{"file":"assets/UserForm-B0Y6JnWz.js","name":"UserForm","imports":["_Button-BuAho1tZ.js"]},"_action-BnePvtfc.js":{"file":"assets/action-BnePvtfc.js","name":"action","imports":["_routing-BQM0aEOD.js"]},"_components-BfweKUze.js":{"file":"assets/components-BfweKUze.js","name":"components","imports":["_routing-BQM0aEOD.js"]},"_createAsync-CBz8AaaQ.js":{"file":"assets/createAsync-CBz8AaaQ.js","name":"createAsync"},"_fetchEvent-oIVSvjBj.js":{"file":"assets/fetchEvent-oIVSvjBj.js","name":"fetchEvent","isDynamicEntry":true},"_index-Dps0aSs2.js":{"file":"assets/index-Dps0aSs2.js","name":"index"},"_products-C9CQ8v25.js":{"file":"assets/products-C9CQ8v25.js","name":"products","imports":["_server-fns-runtime-DJML9_-T.js","src/db/index.ts","_schema-DxiP6MVG.js"]},"_routing-BQM0aEOD.js":{"file":"assets/routing-BQM0aEOD.js","name":"routing"},"_schema-DxiP6MVG.js":{"file":"assets/schema-DxiP6MVG.js","name":"schema","isDynamicEntry":true},"_server-fns-runtime-DJML9_-T.js":{"file":"assets/server-fns-runtime-DJML9_-T.js","name":"server-fns-runtime","imports":["_fetchEvent-oIVSvjBj.js"]},"_users-DiCcX9od.js":{"file":"assets/users-DiCcX9od.js","name":"users","imports":["_server-fns-runtime-DJML9_-T.js","src/db/index.ts","_schema-DxiP6MVG.js"]},"src/components/BarcodeScanner.tsx":{"file":"assets/BarcodeScanner-CiYZ4G5B.js","name":"BarcodeScanner","src":"src/components/BarcodeScanner.tsx","isDynamicEntry":true},"src/db/index.ts":{"file":"assets/index-BinUX9hy.js","name":"index","src":"src/db/index.ts","isDynamicEntry":true,"imports":["_schema-DxiP6MVG.js"]},"src/lib/session.ts":{"file":"assets/session-BHF4uoyM.js","name":"session","src":"src/lib/session.ts","isDynamicEntry":true,"imports":["_server-fns-runtime-DJML9_-T.js","_fetchEvent-oIVSvjBj.js","src/db/index.ts","_schema-DxiP6MVG.js"]},"src/routes/[...404].tsx?pick=default&pick=$css":{"file":"_...404_.js","name":"_...404_","src":"src/routes/[...404].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js","_HttpStatusCode-DH8IeaZe.js"]},"src/routes/about.tsx?pick=default&pick=$css":{"file":"about.js","name":"about","src":"src/routes/about.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js"]},"src/routes/auth/login.tsx?pick=default&pick=$css":{"file":"login.js","name":"login","src":"src/routes/auth/login.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_server-fns-runtime-DJML9_-T.js","_Loading-b-bAnbUN.js","_action-BnePvtfc.js","_fetchEvent-oIVSvjBj.js","_routing-BQM0aEOD.js"],"dynamicImports":["src/db/index.ts","_schema-DxiP6MVG.js","_fetchEvent-oIVSvjBj.js","src/lib/session.ts"]},"src/routes/dashboard.tsx?pick=default&pick=$css":{"file":"dashboard.js","name":"dashboard","src":"src/routes/dashboard.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_server-fns-runtime-DJML9_-T.js","src/lib/session.ts","_routing-BQM0aEOD.js","_components-BfweKUze.js","_Loading-b-bAnbUN.js","_createAsync-CBz8AaaQ.js","_fetchEvent-oIVSvjBj.js","src/db/index.ts","_schema-DxiP6MVG.js"]},"src/routes/dashboard/bad-stock.tsx?pick=default&pick=$css":{"file":"bad-stock.js","name":"bad-stock","src":"src/routes/dashboard/bad-stock.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js"]},"src/routes/dashboard/barang-keluar.tsx?pick=default&pick=$css":{"file":"barang-keluar.js","name":"barang-keluar","src":"src/routes/dashboard/barang-keluar.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js"]},"src/routes/dashboard/barang-masuk.tsx?pick=default&pick=$css":{"file":"barang-masuk.js","name":"barang-masuk","src":"src/routes/dashboard/barang-masuk.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js"]},"src/routes/dashboard/index.tsx?pick=default&pick=$css":{"file":"index.js","name":"index","src":"src/routes/dashboard/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_server-fns-runtime-DJML9_-T.js","_index-Dps0aSs2.js","_createAsync-CBz8AaaQ.js","_fetchEvent-oIVSvjBj.js"],"dynamicImports":["src/lib/session.ts"]},"src/routes/dashboard/main.tsx?pick=default&pick=$css":{"file":"main.js","name":"main","src":"src/routes/dashboard/main.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_components-BfweKUze.js","_routing-BQM0aEOD.js"]},"src/routes/dashboard/produk/[id]/edit.tsx?pick=default&pick=$css":{"file":"edit.js","name":"edit","src":"src/routes/dashboard/produk/[id]/edit.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js","_products-C9CQ8v25.js","_ProductForm-CMxez_KK.js","_Loading-b-bAnbUN.js","_routing-BQM0aEOD.js","_createAsync-CBz8AaaQ.js","_server-fns-runtime-DJML9_-T.js","_fetchEvent-oIVSvjBj.js","src/db/index.ts","_schema-DxiP6MVG.js","_Button-BuAho1tZ.js"]},"src/routes/dashboard/produk/create.tsx?pick=default&pick=$css":{"file":"create.js","name":"create","src":"src/routes/dashboard/produk/create.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js","_products-C9CQ8v25.js","_ProductForm-CMxez_KK.js","_routing-BQM0aEOD.js","_server-fns-runtime-DJML9_-T.js","_fetchEvent-oIVSvjBj.js","src/db/index.ts","_schema-DxiP6MVG.js","_Button-BuAho1tZ.js"]},"src/routes/dashboard/produk/index.tsx?pick=default&pick=$css":{"file":"index2.js","name":"index","src":"src/routes/dashboard/produk/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js","_products-C9CQ8v25.js","_components-BfweKUze.js","_createAsync-CBz8AaaQ.js","_server-fns-runtime-DJML9_-T.js","_fetchEvent-oIVSvjBj.js","src/db/index.ts","_schema-DxiP6MVG.js","_routing-BQM0aEOD.js"]},"src/routes/dashboard/settings.tsx?pick=default&pick=$css":{"file":"settings.js","name":"settings","src":"src/routes/dashboard/settings.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js"]},"src/routes/dashboard/users/[id].tsx?pick=default&pick=$css":{"file":"_id_.js","name":"_id_","src":"src/routes/dashboard/users/[id].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js","_users-DiCcX9od.js","_UserForm-B0Y6JnWz.js","_routing-BQM0aEOD.js","_createAsync-CBz8AaaQ.js","_server-fns-runtime-DJML9_-T.js","_fetchEvent-oIVSvjBj.js","src/db/index.ts","_schema-DxiP6MVG.js","_Button-BuAho1tZ.js"]},"src/routes/dashboard/users/create.tsx?pick=default&pick=$css":{"file":"create2.js","name":"create","src":"src/routes/dashboard/users/create.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js","_users-DiCcX9od.js","_UserForm-B0Y6JnWz.js","_routing-BQM0aEOD.js","_server-fns-runtime-DJML9_-T.js","_fetchEvent-oIVSvjBj.js","src/db/index.ts","_schema-DxiP6MVG.js","_Button-BuAho1tZ.js"]},"src/routes/dashboard/users/index.tsx?pick=default&pick=$css":{"file":"index3.js","name":"index","src":"src/routes/dashboard/users/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js","_users-DiCcX9od.js","_createAsync-CBz8AaaQ.js","_components-BfweKUze.js","_server-fns-runtime-DJML9_-T.js","_fetchEvent-oIVSvjBj.js","src/db/index.ts","_schema-DxiP6MVG.js","_routing-BQM0aEOD.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"index4.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_server-fns-runtime-DJML9_-T.js","src/lib/session.ts","_createAsync-CBz8AaaQ.js","_components-BfweKUze.js","_fetchEvent-oIVSvjBj.js","src/db/index.ts","_schema-DxiP6MVG.js","_routing-BQM0aEOD.js"]},"virtual:$vinxi/handler/ssr":{"file":"ssr.js","name":"ssr","src":"virtual:$vinxi/handler/ssr","isEntry":true,"imports":["_fetchEvent-oIVSvjBj.js","_index-Dps0aSs2.js","_Loading-b-bAnbUN.js","_routing-BQM0aEOD.js","_action-BnePvtfc.js","_HttpStatusCode-DH8IeaZe.js"],"dynamicImports":["src/routes/[...404].tsx?pick=default&pick=$css","src/routes/[...404].tsx?pick=default&pick=$css","src/routes/about.tsx?pick=default&pick=$css","src/routes/about.tsx?pick=default&pick=$css","src/routes/auth/login.tsx?pick=default&pick=$css","src/routes/auth/login.tsx?pick=default&pick=$css","src/routes/dashboard/bad-stock.tsx?pick=default&pick=$css","src/routes/dashboard/bad-stock.tsx?pick=default&pick=$css","src/routes/dashboard/barang-keluar.tsx?pick=default&pick=$css","src/routes/dashboard/barang-keluar.tsx?pick=default&pick=$css","src/routes/dashboard/barang-masuk.tsx?pick=default&pick=$css","src/routes/dashboard/barang-masuk.tsx?pick=default&pick=$css","src/routes/dashboard/index.tsx?pick=default&pick=$css","src/routes/dashboard/index.tsx?pick=default&pick=$css","src/routes/dashboard/main.tsx?pick=default&pick=$css","src/routes/dashboard/main.tsx?pick=default&pick=$css","src/routes/dashboard/produk/[id]/edit.tsx?pick=default&pick=$css","src/routes/dashboard/produk/[id]/edit.tsx?pick=default&pick=$css","src/routes/dashboard/produk/create.tsx?pick=default&pick=$css","src/routes/dashboard/produk/create.tsx?pick=default&pick=$css","src/routes/dashboard/produk/index.tsx?pick=default&pick=$css","src/routes/dashboard/produk/index.tsx?pick=default&pick=$css","src/routes/dashboard/settings.tsx?pick=default&pick=$css","src/routes/dashboard/settings.tsx?pick=default&pick=$css","src/routes/dashboard/users/[id].tsx?pick=default&pick=$css","src/routes/dashboard/users/[id].tsx?pick=default&pick=$css","src/routes/dashboard/users/create.tsx?pick=default&pick=$css","src/routes/dashboard/users/create.tsx?pick=default&pick=$css","src/routes/dashboard/users/index.tsx?pick=default&pick=$css","src/routes/dashboard/users/index.tsx?pick=default&pick=$css","src/routes/dashboard.tsx?pick=default&pick=$css","src/routes/dashboard.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css"],"css":["assets/ssr-WNa2LR0V.css"]}},"client":{"_Button-lI7l4pQ1.js":{"file":"assets/Button-lI7l4pQ1.js","name":"Button","imports":["_web-B77D8VL7.js"]},"_HttpStatusCode-DjTx85av.js":{"file":"assets/HttpStatusCode-DjTx85av.js","name":"HttpStatusCode"},"_Loading-dYFU-h2h.js":{"file":"assets/Loading-dYFU-h2h.js","name":"Loading","imports":["_web-B77D8VL7.js"]},"_ProductForm-DsQCavUB.js":{"file":"assets/ProductForm-DsQCavUB.js","name":"ProductForm","imports":["_preload-helper-ug3pwPZ1.js","_web-B77D8VL7.js","_Button-lI7l4pQ1.js"],"dynamicImports":["src/components/BarcodeScanner.tsx"]},"_UserForm-ri37YpI2.js":{"file":"assets/UserForm-ri37YpI2.js","name":"UserForm","imports":["_web-B77D8VL7.js","_Button-lI7l4pQ1.js"]},"_action-tENG7AIF.js":{"file":"assets/action-tENG7AIF.js","name":"action","imports":["_web-B77D8VL7.js","_routing-D8yMn4L8.js"]},"_components-lAEjSgtd.js":{"file":"assets/components-lAEjSgtd.js","name":"components","imports":["_web-B77D8VL7.js","_routing-D8yMn4L8.js"]},"_createAsync-DwDWr0TH.js":{"file":"assets/createAsync-DwDWr0TH.js","name":"createAsync","imports":["_web-B77D8VL7.js"]},"_index-D0gPe-Qg.js":{"file":"assets/index-D0gPe-Qg.js","name":"index","imports":["_web-B77D8VL7.js"]},"_preload-helper-ug3pwPZ1.js":{"file":"assets/preload-helper-ug3pwPZ1.js","name":"preload-helper"},"_products-Bt1scIOC.js":{"file":"assets/products-Bt1scIOC.js","name":"products","imports":["_server-runtime-C6utdK21.js"]},"_routing-D8yMn4L8.js":{"file":"assets/routing-D8yMn4L8.js","name":"routing","imports":["_web-B77D8VL7.js"]},"_server-runtime-C6utdK21.js":{"file":"assets/server-runtime-C6utdK21.js","name":"server-runtime"},"_users-C72Eb6nw.js":{"file":"assets/users-C72Eb6nw.js","name":"users","imports":["_server-runtime-C6utdK21.js"]},"_web-B77D8VL7.js":{"file":"assets/web-B77D8VL7.js","name":"web"},"src/components/BarcodeScanner.tsx":{"file":"assets/BarcodeScanner-CcNMGE-w.js","name":"BarcodeScanner","src":"src/components/BarcodeScanner.tsx","isDynamicEntry":true,"imports":["_web-B77D8VL7.js"]},"src/routes/[...404].tsx?pick=default&pick=$css":{"file":"assets/_...404_-DEHdqO7T.js","name":"_...404_","src":"src/routes/[...404].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_index-D0gPe-Qg.js","_HttpStatusCode-DjTx85av.js"]},"src/routes/about.tsx?pick=default&pick=$css":{"file":"assets/about-CPibYA7I.js","name":"about","src":"src/routes/about.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_index-D0gPe-Qg.js"]},"src/routes/auth/login.tsx?pick=default&pick=$css":{"file":"assets/login-Dc6ZwhAi.js","name":"login","src":"src/routes/auth/login.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_server-runtime-C6utdK21.js","_Loading-dYFU-h2h.js","_action-tENG7AIF.js","_routing-D8yMn4L8.js"]},"src/routes/dashboard.tsx?pick=default&pick=$css":{"file":"assets/dashboard-CMq5HOHt.js","name":"dashboard","src":"src/routes/dashboard.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_server-runtime-C6utdK21.js","_routing-D8yMn4L8.js","_components-lAEjSgtd.js","_Loading-dYFU-h2h.js","_createAsync-DwDWr0TH.js"]},"src/routes/dashboard/bad-stock.tsx?pick=default&pick=$css":{"file":"assets/bad-stock-C7kYTAH-.js","name":"bad-stock","src":"src/routes/dashboard/bad-stock.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_index-D0gPe-Qg.js"]},"src/routes/dashboard/barang-keluar.tsx?pick=default&pick=$css":{"file":"assets/barang-keluar-DYmJwA3q.js","name":"barang-keluar","src":"src/routes/dashboard/barang-keluar.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_index-D0gPe-Qg.js"]},"src/routes/dashboard/barang-masuk.tsx?pick=default&pick=$css":{"file":"assets/barang-masuk-BRyqJpYU.js","name":"barang-masuk","src":"src/routes/dashboard/barang-masuk.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_index-D0gPe-Qg.js"]},"src/routes/dashboard/index.tsx?pick=default&pick=$css":{"file":"assets/index-D90WEW3r.js","name":"index","src":"src/routes/dashboard/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_server-runtime-C6utdK21.js","_index-D0gPe-Qg.js","_createAsync-DwDWr0TH.js"]},"src/routes/dashboard/main.tsx?pick=default&pick=$css":{"file":"assets/main-bWtj_JCV.js","name":"main","src":"src/routes/dashboard/main.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_components-lAEjSgtd.js","_routing-D8yMn4L8.js"]},"src/routes/dashboard/produk/[id]/edit.tsx?pick=default&pick=$css":{"file":"assets/edit-Be4KZO-Q.js","name":"edit","src":"src/routes/dashboard/produk/[id]/edit.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_index-D0gPe-Qg.js","_products-Bt1scIOC.js","_ProductForm-DsQCavUB.js","_Loading-dYFU-h2h.js","_routing-D8yMn4L8.js","_createAsync-DwDWr0TH.js","_server-runtime-C6utdK21.js","_preload-helper-ug3pwPZ1.js","_Button-lI7l4pQ1.js"]},"src/routes/dashboard/produk/create.tsx?pick=default&pick=$css":{"file":"assets/create-DLMF0B8x.js","name":"create","src":"src/routes/dashboard/produk/create.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_index-D0gPe-Qg.js","_products-Bt1scIOC.js","_ProductForm-DsQCavUB.js","_routing-D8yMn4L8.js","_server-runtime-C6utdK21.js","_preload-helper-ug3pwPZ1.js","_Button-lI7l4pQ1.js"]},"src/routes/dashboard/produk/index.tsx?pick=default&pick=$css":{"file":"assets/index-BwmaBC60.js","name":"index","src":"src/routes/dashboard/produk/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_index-D0gPe-Qg.js","_products-Bt1scIOC.js","_components-lAEjSgtd.js","_createAsync-DwDWr0TH.js","_server-runtime-C6utdK21.js","_routing-D8yMn4L8.js"]},"src/routes/dashboard/settings.tsx?pick=default&pick=$css":{"file":"assets/settings-BCP4ZAFe.js","name":"settings","src":"src/routes/dashboard/settings.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_index-D0gPe-Qg.js"]},"src/routes/dashboard/users/[id].tsx?pick=default&pick=$css":{"file":"assets/_id_-l9tvnHXo.js","name":"_id_","src":"src/routes/dashboard/users/[id].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_index-D0gPe-Qg.js","_users-C72Eb6nw.js","_UserForm-ri37YpI2.js","_routing-D8yMn4L8.js","_createAsync-DwDWr0TH.js","_server-runtime-C6utdK21.js","_Button-lI7l4pQ1.js"]},"src/routes/dashboard/users/create.tsx?pick=default&pick=$css":{"file":"assets/create-tqVW4jW7.js","name":"create","src":"src/routes/dashboard/users/create.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_index-D0gPe-Qg.js","_users-C72Eb6nw.js","_UserForm-ri37YpI2.js","_routing-D8yMn4L8.js","_server-runtime-C6utdK21.js","_Button-lI7l4pQ1.js"]},"src/routes/dashboard/users/index.tsx?pick=default&pick=$css":{"file":"assets/index-CWzKkoAN.js","name":"index","src":"src/routes/dashboard/users/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_index-D0gPe-Qg.js","_users-C72Eb6nw.js","_createAsync-DwDWr0TH.js","_components-lAEjSgtd.js","_server-runtime-C6utdK21.js","_routing-D8yMn4L8.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"assets/index-Crk1m6o4.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_web-B77D8VL7.js","_server-runtime-C6utdK21.js","_createAsync-DwDWr0TH.js","_components-lAEjSgtd.js","_routing-D8yMn4L8.js"]},"virtual:$vinxi/handler/client":{"file":"assets/client-DeqmpdKB.js","name":"client","src":"virtual:$vinxi/handler/client","isEntry":true,"imports":["_web-B77D8VL7.js","_index-D0gPe-Qg.js","_preload-helper-ug3pwPZ1.js","_Loading-dYFU-h2h.js","_routing-D8yMn4L8.js","_action-tENG7AIF.js","_HttpStatusCode-DjTx85av.js"],"dynamicImports":["src/routes/[...404].tsx?pick=default&pick=$css","src/routes/about.tsx?pick=default&pick=$css","src/routes/auth/login.tsx?pick=default&pick=$css","src/routes/dashboard/bad-stock.tsx?pick=default&pick=$css","src/routes/dashboard/barang-keluar.tsx?pick=default&pick=$css","src/routes/dashboard/barang-masuk.tsx?pick=default&pick=$css","src/routes/dashboard/index.tsx?pick=default&pick=$css","src/routes/dashboard/main.tsx?pick=default&pick=$css","src/routes/dashboard/produk/[id]/edit.tsx?pick=default&pick=$css","src/routes/dashboard/produk/create.tsx?pick=default&pick=$css","src/routes/dashboard/produk/index.tsx?pick=default&pick=$css","src/routes/dashboard/settings.tsx?pick=default&pick=$css","src/routes/dashboard/users/[id].tsx?pick=default&pick=$css","src/routes/dashboard/users/create.tsx?pick=default&pick=$css","src/routes/dashboard/users/index.tsx?pick=default&pick=$css","src/routes/dashboard.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css"],"css":["assets/client-WNa2LR0V.css"]}},"server-fns":{"_Button-BuAho1tZ.js":{"file":"assets/Button-BuAho1tZ.js","name":"Button"},"_Loading-b-bAnbUN.js":{"file":"assets/Loading-b-bAnbUN.js","name":"Loading"},"_ProductForm-CMxez_KK.js":{"file":"assets/ProductForm-CMxez_KK.js","name":"ProductForm","imports":["_Button-BuAho1tZ.js"],"dynamicImports":["src/components/BarcodeScanner.tsx"]},"_UserForm-B0Y6JnWz.js":{"file":"assets/UserForm-B0Y6JnWz.js","name":"UserForm","imports":["_Button-BuAho1tZ.js"]},"_action-CnXm9LBs.js":{"file":"assets/action-CnXm9LBs.js","name":"action","imports":["_routing-CMRlbYJP.js"]},"_components-2Zj0uUoj.js":{"file":"assets/components-2Zj0uUoj.js","name":"components","imports":["_routing-CMRlbYJP.js"]},"_createAsync-CBz8AaaQ.js":{"file":"assets/createAsync-CBz8AaaQ.js","name":"createAsync"},"_fetchEvent-CIpVWTXg.js":{"file":"assets/fetchEvent-CIpVWTXg.js","name":"fetchEvent","isDynamicEntry":true},"_index-Dps0aSs2.js":{"file":"assets/index-Dps0aSs2.js","name":"index"},"_products-BWm0EwFZ.js":{"file":"assets/products-BWm0EwFZ.js","name":"products","imports":["_server-fns-runtime-HUGH5Jm0.js","src/db/index.ts","_schema-DxiP6MVG.js"]},"_routing-CMRlbYJP.js":{"file":"assets/routing-CMRlbYJP.js","name":"routing"},"_schema-DxiP6MVG.js":{"file":"assets/schema-DxiP6MVG.js","name":"schema","isDynamicEntry":true},"_server-fns-DSWMe6uF.js":{"file":"assets/server-fns-DSWMe6uF.js","name":"server-fns","imports":["_fetchEvent-CIpVWTXg.js"],"dynamicImports":["src/routes/[...404].tsx?pick=default&pick=$css","src/routes/[...404].tsx?pick=default&pick=$css","src/routes/about.tsx?pick=default&pick=$css","src/routes/about.tsx?pick=default&pick=$css","src/routes/auth/login.tsx?pick=default&pick=$css","src/routes/auth/login.tsx?pick=default&pick=$css","src/routes/dashboard/bad-stock.tsx?pick=default&pick=$css","src/routes/dashboard/bad-stock.tsx?pick=default&pick=$css","src/routes/dashboard/barang-keluar.tsx?pick=default&pick=$css","src/routes/dashboard/barang-keluar.tsx?pick=default&pick=$css","src/routes/dashboard/barang-masuk.tsx?pick=default&pick=$css","src/routes/dashboard/barang-masuk.tsx?pick=default&pick=$css","src/routes/dashboard/index.tsx?pick=default&pick=$css","src/routes/dashboard/index.tsx?pick=default&pick=$css","src/routes/dashboard/main.tsx?pick=default&pick=$css","src/routes/dashboard/main.tsx?pick=default&pick=$css","src/routes/dashboard/produk/[id]/edit.tsx?pick=default&pick=$css","src/routes/dashboard/produk/[id]/edit.tsx?pick=default&pick=$css","src/routes/dashboard/produk/create.tsx?pick=default&pick=$css","src/routes/dashboard/produk/create.tsx?pick=default&pick=$css","src/routes/dashboard/produk/index.tsx?pick=default&pick=$css","src/routes/dashboard/produk/index.tsx?pick=default&pick=$css","src/routes/dashboard/settings.tsx?pick=default&pick=$css","src/routes/dashboard/settings.tsx?pick=default&pick=$css","src/routes/dashboard/users/[id].tsx?pick=default&pick=$css","src/routes/dashboard/users/[id].tsx?pick=default&pick=$css","src/routes/dashboard/users/create.tsx?pick=default&pick=$css","src/routes/dashboard/users/create.tsx?pick=default&pick=$css","src/routes/dashboard/users/index.tsx?pick=default&pick=$css","src/routes/dashboard/users/index.tsx?pick=default&pick=$css","src/routes/dashboard.tsx?pick=default&pick=$css","src/routes/dashboard.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/index.tsx?pick=default&pick=$css","src/routes/dashboard/index.tsx?pick=default&pick=%24css&tsr-directive-use-server=","src/routes/dashboard.tsx?pick=default&pick=%24css&tsr-directive-use-server=","src/routes/auth/login.tsx?pick=default&pick=%24css&tsr-directive-use-server=","src/lib/auth-checks.ts?tsr-directive-use-server=","src/lib/products.ts?tsr-directive-use-server=","src/lib/products.ts?tsr-directive-use-server=","src/lib/products.ts?tsr-directive-use-server=","src/lib/products.ts?tsr-directive-use-server=","src/lib/products.ts?tsr-directive-use-server=","src/lib/users.ts?tsr-directive-use-server=","src/lib/users.ts?tsr-directive-use-server=","src/lib/users.ts?tsr-directive-use-server=","src/lib/users.ts?tsr-directive-use-server=","src/lib/users.ts?tsr-directive-use-server=","src/lib/session.ts?tsr-directive-use-server=","src/lib/session.ts?tsr-directive-use-server=","src/lib/session.ts?tsr-directive-use-server=","src/app.tsx"]},"_server-fns-runtime-HUGH5Jm0.js":{"file":"assets/server-fns-runtime-HUGH5Jm0.js","name":"server-fns-runtime","imports":["_fetchEvent-CIpVWTXg.js"]},"_users-BYnp0MmX.js":{"file":"assets/users-BYnp0MmX.js","name":"users","imports":["_server-fns-runtime-HUGH5Jm0.js","src/db/index.ts","_schema-DxiP6MVG.js"]},"src/app.tsx":{"file":"assets/app-DdXtN6Nq.js","name":"app","src":"src/app.tsx","isDynamicEntry":true,"imports":["_index-Dps0aSs2.js","_server-fns-DSWMe6uF.js","_Loading-b-bAnbUN.js","_routing-CMRlbYJP.js","_action-CnXm9LBs.js","_fetchEvent-CIpVWTXg.js"],"css":["assets/app-WNa2LR0V.css"]},"src/components/BarcodeScanner.tsx":{"file":"assets/BarcodeScanner-CiYZ4G5B.js","name":"BarcodeScanner","src":"src/components/BarcodeScanner.tsx","isDynamicEntry":true},"src/db/index.ts":{"file":"assets/index-BinUX9hy.js","name":"index","src":"src/db/index.ts","isDynamicEntry":true,"imports":["_schema-DxiP6MVG.js"]},"src/lib/auth-checks.ts?tsr-directive-use-server=":{"file":"assets/auth-checks-BwLvXVBd.js","name":"auth-checks","src":"src/lib/auth-checks.ts?tsr-directive-use-server=","isDynamicEntry":true,"imports":["_server-fns-runtime-HUGH5Jm0.js","src/lib/session.ts","_fetchEvent-CIpVWTXg.js","src/db/index.ts","_schema-DxiP6MVG.js"]},"src/lib/products.ts?tsr-directive-use-server=":{"file":"assets/products-QOPIUUBV.js","name":"products","src":"src/lib/products.ts?tsr-directive-use-server=","isDynamicEntry":true,"imports":["_server-fns-runtime-HUGH5Jm0.js","src/db/index.ts","_schema-DxiP6MVG.js","_fetchEvent-CIpVWTXg.js"]},"src/lib/session.ts":{"file":"assets/session-D_Gl5yQj.js","name":"session","src":"src/lib/session.ts","isDynamicEntry":true,"imports":["_server-fns-runtime-HUGH5Jm0.js","_fetchEvent-CIpVWTXg.js","src/db/index.ts","_schema-DxiP6MVG.js"]},"src/lib/session.ts?tsr-directive-use-server=":{"file":"assets/session-C4pX75Tv.js","name":"session","src":"src/lib/session.ts?tsr-directive-use-server=","isDynamicEntry":true,"imports":["_server-fns-runtime-HUGH5Jm0.js","_fetchEvent-CIpVWTXg.js","src/db/index.ts","_schema-DxiP6MVG.js"]},"src/lib/users.ts?tsr-directive-use-server=":{"file":"assets/users-DUDoXUFs.js","name":"users","src":"src/lib/users.ts?tsr-directive-use-server=","isDynamicEntry":true,"imports":["_server-fns-runtime-HUGH5Jm0.js","src/db/index.ts","_schema-DxiP6MVG.js","_fetchEvent-CIpVWTXg.js"]},"src/routes/[...404].tsx?pick=default&pick=$css":{"file":"_...404_.js","name":"_...404_","src":"src/routes/[...404].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js"]},"src/routes/about.tsx?pick=default&pick=$css":{"file":"about.js","name":"about","src":"src/routes/about.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js"]},"src/routes/auth/login.tsx?pick=default&pick=$css":{"file":"login.js","name":"login","src":"src/routes/auth/login.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_server-fns-runtime-HUGH5Jm0.js","_Loading-b-bAnbUN.js","_action-CnXm9LBs.js","_fetchEvent-CIpVWTXg.js","_routing-CMRlbYJP.js"],"dynamicImports":["src/db/index.ts","_schema-DxiP6MVG.js","_fetchEvent-CIpVWTXg.js","src/lib/session.ts"]},"src/routes/auth/login.tsx?pick=default&pick=%24css&tsr-directive-use-server=":{"file":"assets/login-CGNBHsLW.js","name":"login","src":"src/routes/auth/login.tsx?pick=default&pick=%24css&tsr-directive-use-server=","isDynamicEntry":true,"imports":["_server-fns-runtime-HUGH5Jm0.js","_fetchEvent-CIpVWTXg.js"],"dynamicImports":["src/db/index.ts","_schema-DxiP6MVG.js","_fetchEvent-CIpVWTXg.js","src/lib/session.ts"]},"src/routes/dashboard.tsx?pick=default&pick=$css":{"file":"dashboard.js","name":"dashboard","src":"src/routes/dashboard.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_server-fns-runtime-HUGH5Jm0.js","src/lib/session.ts","_routing-CMRlbYJP.js","_components-2Zj0uUoj.js","_Loading-b-bAnbUN.js","_createAsync-CBz8AaaQ.js","_fetchEvent-CIpVWTXg.js","src/db/index.ts","_schema-DxiP6MVG.js"]},"src/routes/dashboard.tsx?pick=default&pick=%24css&tsr-directive-use-server=":{"file":"assets/dashboard-D5mZp-20.js","name":"dashboard","src":"src/routes/dashboard.tsx?pick=default&pick=%24css&tsr-directive-use-server=","isDynamicEntry":true,"imports":["_server-fns-runtime-HUGH5Jm0.js","src/lib/session.ts","_fetchEvent-CIpVWTXg.js","src/db/index.ts","_schema-DxiP6MVG.js"]},"src/routes/dashboard/bad-stock.tsx?pick=default&pick=$css":{"file":"bad-stock.js","name":"bad-stock","src":"src/routes/dashboard/bad-stock.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js"]},"src/routes/dashboard/barang-keluar.tsx?pick=default&pick=$css":{"file":"barang-keluar.js","name":"barang-keluar","src":"src/routes/dashboard/barang-keluar.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js"]},"src/routes/dashboard/barang-masuk.tsx?pick=default&pick=$css":{"file":"barang-masuk.js","name":"barang-masuk","src":"src/routes/dashboard/barang-masuk.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js"]},"src/routes/dashboard/index.tsx?pick=default&pick=$css":{"file":"index.js","name":"index","src":"src/routes/dashboard/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_server-fns-runtime-HUGH5Jm0.js","_index-Dps0aSs2.js","_createAsync-CBz8AaaQ.js","_fetchEvent-CIpVWTXg.js"],"dynamicImports":["src/lib/session.ts"]},"src/routes/dashboard/index.tsx?pick=default&pick=%24css&tsr-directive-use-server=":{"file":"assets/index-D39yfOTr.js","name":"index","src":"src/routes/dashboard/index.tsx?pick=default&pick=%24css&tsr-directive-use-server=","isDynamicEntry":true,"imports":["_server-fns-runtime-HUGH5Jm0.js","_fetchEvent-CIpVWTXg.js"],"dynamicImports":["src/lib/session.ts"]},"src/routes/dashboard/main.tsx?pick=default&pick=$css":{"file":"main.js","name":"main","src":"src/routes/dashboard/main.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_components-2Zj0uUoj.js","_routing-CMRlbYJP.js"]},"src/routes/dashboard/produk/[id]/edit.tsx?pick=default&pick=$css":{"file":"edit.js","name":"edit","src":"src/routes/dashboard/produk/[id]/edit.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js","_products-BWm0EwFZ.js","_ProductForm-CMxez_KK.js","_Loading-b-bAnbUN.js","_routing-CMRlbYJP.js","_createAsync-CBz8AaaQ.js","_server-fns-runtime-HUGH5Jm0.js","_fetchEvent-CIpVWTXg.js","src/db/index.ts","_schema-DxiP6MVG.js","_Button-BuAho1tZ.js"]},"src/routes/dashboard/produk/create.tsx?pick=default&pick=$css":{"file":"create.js","name":"create","src":"src/routes/dashboard/produk/create.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js","_products-BWm0EwFZ.js","_ProductForm-CMxez_KK.js","_routing-CMRlbYJP.js","_server-fns-runtime-HUGH5Jm0.js","_fetchEvent-CIpVWTXg.js","src/db/index.ts","_schema-DxiP6MVG.js","_Button-BuAho1tZ.js"]},"src/routes/dashboard/produk/index.tsx?pick=default&pick=$css":{"file":"index2.js","name":"index","src":"src/routes/dashboard/produk/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js","_products-BWm0EwFZ.js","_components-2Zj0uUoj.js","_createAsync-CBz8AaaQ.js","_server-fns-runtime-HUGH5Jm0.js","_fetchEvent-CIpVWTXg.js","src/db/index.ts","_schema-DxiP6MVG.js","_routing-CMRlbYJP.js"]},"src/routes/dashboard/settings.tsx?pick=default&pick=$css":{"file":"settings.js","name":"settings","src":"src/routes/dashboard/settings.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js"]},"src/routes/dashboard/users/[id].tsx?pick=default&pick=$css":{"file":"_id_.js","name":"_id_","src":"src/routes/dashboard/users/[id].tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js","_users-BYnp0MmX.js","_UserForm-B0Y6JnWz.js","_routing-CMRlbYJP.js","_createAsync-CBz8AaaQ.js","_server-fns-runtime-HUGH5Jm0.js","_fetchEvent-CIpVWTXg.js","src/db/index.ts","_schema-DxiP6MVG.js","_Button-BuAho1tZ.js"]},"src/routes/dashboard/users/create.tsx?pick=default&pick=$css":{"file":"create2.js","name":"create","src":"src/routes/dashboard/users/create.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js","_users-BYnp0MmX.js","_UserForm-B0Y6JnWz.js","_routing-CMRlbYJP.js","_server-fns-runtime-HUGH5Jm0.js","_fetchEvent-CIpVWTXg.js","src/db/index.ts","_schema-DxiP6MVG.js","_Button-BuAho1tZ.js"]},"src/routes/dashboard/users/index.tsx?pick=default&pick=$css":{"file":"index3.js","name":"index","src":"src/routes/dashboard/users/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_index-Dps0aSs2.js","_users-BYnp0MmX.js","_createAsync-CBz8AaaQ.js","_components-2Zj0uUoj.js","_server-fns-runtime-HUGH5Jm0.js","_fetchEvent-CIpVWTXg.js","src/db/index.ts","_schema-DxiP6MVG.js","_routing-CMRlbYJP.js"]},"src/routes/index.tsx?pick=default&pick=$css":{"file":"index4.js","name":"index","src":"src/routes/index.tsx?pick=default&pick=$css","isEntry":true,"isDynamicEntry":true,"imports":["_server-fns-runtime-HUGH5Jm0.js","src/lib/session.ts","_createAsync-CBz8AaaQ.js","_components-2Zj0uUoj.js","_fetchEvent-CIpVWTXg.js","src/db/index.ts","_schema-DxiP6MVG.js","_routing-CMRlbYJP.js"]},"virtual:$vinxi/handler/server-fns":{"file":"server-fns.js","name":"server-fns","src":"virtual:$vinxi/handler/server-fns","isEntry":true,"imports":["_server-fns-DSWMe6uF.js","_fetchEvent-CIpVWTXg.js"]}}};

					const routeManifest = {"ssr":{},"client":{},"server-fns":{}};

        function createProdApp(appConfig) {
          return {
            config: { ...appConfig, buildManifest, routeManifest },
            getRouter(name) {
              return appConfig.routers.find(router => router.name === name)
            }
          }
        }

        function plugin$2(app) {
          const prodApp = createProdApp(appConfig);
          globalThis.app = prodApp;
        }

function plugin$1(app) {
	globalThis.$handle = (event) => app.h3App.handler(event);
}

/**
 * Traverses the module graph and collects assets for a given chunk
 *
 * @param {any} manifest Client manifest
 * @param {string} id Chunk id
 * @param {Map<string, string[]>} assetMap Cache of assets
 * @param {string[]} stack Stack of chunk ids to prevent circular dependencies
 * @returns Array of asset URLs
 */
function findAssetsInViteManifest(manifest, id, assetMap = new Map(), stack = []) {
	if (stack.includes(id)) {
		return [];
	}

	const cached = assetMap.get(id);
	if (cached) {
		return cached;
	}
	const chunk = manifest[id];
	if (!chunk) {
		return [];
	}

	const assets = [
		...(chunk.assets?.filter(Boolean) || []),
		...(chunk.css?.filter(Boolean) || [])
	];
	if (chunk.imports) {
		stack.push(id);
		for (let i = 0, l = chunk.imports.length; i < l; i++) {
			assets.push(...findAssetsInViteManifest(manifest, chunk.imports[i], assetMap, stack));
		}
		stack.pop();
	}
	assets.push(chunk.file);
	const all = Array.from(new Set(assets));
	assetMap.set(id, all);

	return all;
}

/** @typedef {import("../app.js").App & { config: { buildManifest: { [key:string]: any } }}} ProdApp */

function createHtmlTagsForAssets(router, app, assets) {
	return assets
		.filter(
			(asset) =>
				asset.endsWith(".css") ||
				asset.endsWith(".js") ||
				asset.endsWith(".mjs"),
		)
		.map((asset) => ({
			tag: "link",
			attrs: {
				href: joinURL(app.config.server.baseURL ?? "/", router.base, asset),
				key: join$1(app.config.server.baseURL ?? "", router.base, asset),
				...(asset.endsWith(".css")
					? { rel: "stylesheet", fetchPriority: "high" }
					: { rel: "modulepreload" }),
			},
		}));
}

/**
 *
 * @param {ProdApp} app
 * @returns
 */
function createProdManifest(app) {
	const manifest = new Proxy(
		{},
		{
			get(target, routerName) {
				invariant(typeof routerName === "string", "Bundler name expected");
				const router = app.getRouter(routerName);
				const bundlerManifest = app.config.buildManifest[routerName];

				invariant(
					router.type !== "static",
					"manifest not available for static router",
				);
				return {
					handler: router.handler,
					async assets() {
						/** @type {{ [key: string]: string[] }} */
						let assets = {};
						assets[router.handler] = await this.inputs[router.handler].assets();
						for (const route of (await router.internals.routes?.getRoutes()) ??
							[]) {
							assets[route.filePath] = await this.inputs[
								route.filePath
							].assets();
						}
						return assets;
					},
					async routes() {
						return (await router.internals.routes?.getRoutes()) ?? [];
					},
					async json() {
						/** @type {{ [key: string]: { output: string; assets: string[]} }} */
						let json = {};
						for (const input of Object.keys(this.inputs)) {
							json[input] = {
								output: this.inputs[input].output.path,
								assets: await this.inputs[input].assets(),
							};
						}
						return json;
					},
					chunks: new Proxy(
						{},
						{
							get(target, chunk) {
								invariant(typeof chunk === "string", "Chunk expected");
								const chunkPath = join$1(
									router.outDir,
									router.base,
									chunk + ".mjs",
								);
								return {
									import() {
										if (globalThis.$$chunks[chunk + ".mjs"]) {
											return globalThis.$$chunks[chunk + ".mjs"];
										}
										return import(
											/* @vite-ignore */ pathToFileURL(chunkPath).href
										);
									},
									output: {
										path: chunkPath,
									},
								};
							},
						},
					),
					inputs: new Proxy(
						{},
						{
							ownKeys(target) {
								const keys = Object.keys(bundlerManifest)
									.filter((id) => bundlerManifest[id].isEntry)
									.map((id) => id);
								return keys;
							},
							getOwnPropertyDescriptor(k) {
								return {
									enumerable: true,
									configurable: true,
								};
							},
							get(target, input) {
								invariant(typeof input === "string", "Input expected");
								if (router.target === "server") {
									const id =
										input === router.handler
											? virtualId(handlerModule(router))
											: input;
									return {
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: join$1(
												router.outDir,
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								} else if (router.target === "browser") {
									const id =
										input === router.handler && !input.endsWith(".html")
											? virtualId(handlerModule(router))
											: input;
									return {
										import() {
											return import(
												/* @vite-ignore */ joinURL(
													app.config.server.baseURL ?? "",
													router.base,
													bundlerManifest[id].file,
												)
											);
										},
										assets() {
											return createHtmlTagsForAssets(
												router,
												app,
												findAssetsInViteManifest(bundlerManifest, id),
											);
										},
										output: {
											path: joinURL(
												app.config.server.baseURL ?? "",
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								}
							},
						},
					),
				};
			},
		},
	);

	return manifest;
}

function plugin() {
	globalThis.MANIFEST =
		createProdManifest(globalThis.app)
			;
}

const chunks = {};
			 



			 function app() {
				 globalThis.$$chunks = chunks;
			 }

const plugins = [
  plugin$2,
plugin$1,
plugin,
app
];

function parseSetCookie$1(setCookieValue, options) {
  const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair$1(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
  } catch {
  }
  const cookie = {
    name,
    value
  };
  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }
  return cookie;
}
function _parseNameValuePair$1(nameValuePairStr) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}

const kEventNS = "h3.internal.event.";
const kEventRes = /* @__PURE__ */ Symbol.for(`${kEventNS}res`);
const kEventResHeaders = /* @__PURE__ */ Symbol.for(`${kEventNS}res.headers`);
var H3Event = class {
	
	app;
	
	req;
	
	url;
	
	context;
	
	static __is_event__ = true;
	constructor(req, context, app) {
		this.context = context || req.context || new NullProtoObj();
		this.req = req;
		this.app = app;
		const _url = req._url;
		this.url = _url && _url instanceof URL ? _url : new FastURL(req.url);
	}
	
	get res() {
		return this[kEventRes] ||= new H3EventResponse();
	}
	
	get runtime() {
		return this.req.runtime;
	}
	
	waitUntil(promise) {
		this.req.waitUntil?.(promise);
	}
	toString() {
		return `[${this.req.method}] ${this.req.url}`;
	}
	toJSON() {
		return this.toString();
	}
	
	get node() {
		return this.req.runtime?.node;
	}
	
	get headers() {
		return this.req.headers;
	}
	
	get path() {
		return this.url.pathname + this.url.search;
	}
	
	get method() {
		return this.req.method;
	}
};
var H3EventResponse = class {
	status;
	statusText;
	get headers() {
		return this[kEventResHeaders] ||= new Headers();
	}
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;

function sanitizeStatusMessage(statusMessage = "") {
	return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}

function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
	if (!statusCode) return defaultStatusCode;
	if (typeof statusCode === "string") statusCode = +statusCode;
	if (statusCode < 100 || statusCode > 599) return defaultStatusCode;
	return statusCode;
}


var HTTPError = class HTTPError extends Error {
	get name() {
		return "HTTPError";
	}
	
	status;
	
	statusText;
	
	headers;
	
	cause;
	
	data;
	
	body;
	
	unhandled;
	
	static isError(input) {
		return input instanceof Error && input?.name === "HTTPError";
	}
	
	static status(status, statusText, details) {
		return new HTTPError({
			...details,
			statusText,
			status
		});
	}
	constructor(arg1, arg2) {
		let messageInput;
		let details;
		if (typeof arg1 === "string") {
			messageInput = arg1;
			details = arg2;
		} else details = arg1;
		const status = sanitizeStatusCode(details?.status || (details?.cause)?.status || details?.status || details?.statusCode, 500);
		const statusText = sanitizeStatusMessage(details?.statusText || (details?.cause)?.statusText || details?.statusText || details?.statusMessage);
		const message = messageInput || details?.message || (details?.cause)?.message || details?.statusText || details?.statusMessage || [
			"HTTPError",
			status,
			statusText
		].filter(Boolean).join(" ");
		super(message, { cause: details });
		this.cause = details;
		this.status = status;
		this.statusText = statusText || void 0;
		const rawHeaders = details?.headers || (details?.cause)?.headers;
		this.headers = rawHeaders ? new Headers(rawHeaders) : void 0;
		this.unhandled = details?.unhandled ?? (details?.cause)?.unhandled ?? void 0;
		this.data = details?.data;
		this.body = details?.body;
	}
	
	get statusCode() {
		return this.status;
	}
	
	get statusMessage() {
		return this.statusText;
	}
	toJSON() {
		const unhandled = this.unhandled;
		return {
			status: this.status,
			statusText: this.statusText,
			unhandled,
			message: unhandled ? "HTTPError" : this.message,
			data: unhandled ? void 0 : this.data,
			...unhandled ? void 0 : this.body
		};
	}
};
function isJSONSerializable(value, _type) {
	if (value === null || value === void 0) return true;
	if (_type !== "object") return _type === "boolean" || _type === "number" || _type === "string";
	if (typeof value.toJSON === "function") return true;
	if (Array.isArray(value)) return true;
	if (typeof value.pipe === "function" || typeof value.pipeTo === "function") return false;
	if (value instanceof NullProtoObj) return true;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}

const kNotFound = /* @__PURE__ */ Symbol.for("h3.notFound");
const kHandled = /* @__PURE__ */ Symbol.for("h3.handled");
function toResponse(val, event, config = {}) {
	if (typeof val?.then === "function") return (val.catch?.((error) => error) || Promise.resolve(val)).then((resolvedVal) => toResponse(resolvedVal, event, config));
	const response = prepareResponse(val, event, config);
	if (typeof response?.then === "function") return toResponse(response, event, config);
	const { onResponse: onResponse$1 } = config;
	return onResponse$1 ? Promise.resolve(onResponse$1(response, event)).then(() => response) : response;
}
var HTTPResponse = class {
	#headers;
	#init;
	body;
	constructor(body, init) {
		this.body = body;
		this.#init = init;
	}
	get status() {
		return this.#init?.status || 200;
	}
	get statusText() {
		return this.#init?.statusText || "OK";
	}
	get headers() {
		return this.#headers ||= new Headers(this.#init?.headers);
	}
};
function prepareResponse(val, event, config, nested) {
	if (val === kHandled) return new FastResponse(null);
	if (val === kNotFound) val = new HTTPError({
		status: 404,
		message: `Cannot find any route matching [${event.req.method}] ${event.url}`
	});
	if (val && val instanceof Error) {
		const isHTTPError = HTTPError.isError(val);
		const error = isHTTPError ? val : new HTTPError(val);
		if (!isHTTPError) {
			error.unhandled = true;
			if (val?.stack) error.stack = val.stack;
		}
		if (error.unhandled && !config.silent) console.error(error);
		const { onError: onError$1 } = config;
		return onError$1 && !nested ? Promise.resolve(onError$1(error, event)).catch((error$1) => error$1).then((newVal) => prepareResponse(newVal ?? val, event, config, true)) : errorResponse(error, config.debug);
	}
	const preparedRes = event[kEventRes];
	const preparedHeaders = preparedRes?.[kEventResHeaders];
	event[kEventRes] = void 0;
	if (!(val instanceof Response)) {
		const res = prepareResponseBody(val, event, config);
		const status = res.status || preparedRes?.status;
		return new FastResponse(nullBody(event.req.method, status) ? null : res.body, {
			status,
			statusText: res.statusText || preparedRes?.statusText,
			headers: res.headers && preparedHeaders ? mergeHeaders$1(res.headers, preparedHeaders) : res.headers || preparedHeaders
		});
	}
	if (!preparedHeaders || nested || !val.ok) return val;
	try {
		mergeHeaders$1(val.headers, preparedHeaders, val.headers);
		return val;
	} catch {
		return new FastResponse(nullBody(event.req.method, val.status) ? null : val.body, {
			status: val.status,
			statusText: val.statusText,
			headers: mergeHeaders$1(val.headers, preparedHeaders)
		});
	}
}
function mergeHeaders$1(base, overrides, target = new Headers(base)) {
	for (const [name, value] of overrides) if (name === "set-cookie") target.append(name, value);
	else target.set(name, value);
	return target;
}
const frozenHeaders = () => {
	throw new Error("Headers are frozen");
};
var FrozenHeaders = class extends Headers {
	constructor(init) {
		super(init);
		this.set = this.append = this.delete = frozenHeaders;
	}
};
const emptyHeaders = /* @__PURE__ */ new FrozenHeaders({ "content-length": "0" });
const jsonHeaders = /* @__PURE__ */ new FrozenHeaders({ "content-type": "application/json;charset=UTF-8" });
function prepareResponseBody(val, event, config) {
	if (val === null || val === void 0) return {
		body: "",
		headers: emptyHeaders
	};
	const valType = typeof val;
	if (valType === "string") return { body: val };
	if (val instanceof Uint8Array) {
		event.res.headers.set("content-length", val.byteLength.toString());
		return { body: val };
	}
	if (val instanceof HTTPResponse || val?.constructor?.name === "HTTPResponse") return val;
	if (isJSONSerializable(val, valType)) return {
		body: JSON.stringify(val, void 0, config.debug ? 2 : void 0),
		headers: jsonHeaders
	};
	if (valType === "bigint") return {
		body: val.toString(),
		headers: jsonHeaders
	};
	if (val instanceof Blob) {
		const headers = new Headers({
			"content-type": val.type,
			"content-length": val.size.toString()
		});
		let filename = val.name;
		if (filename) {
			filename = encodeURIComponent(filename);
			headers.set("content-disposition", `filename="${filename}"; filename*=UTF-8''${filename}`);
		}
		return {
			body: val.stream(),
			headers
		};
	}
	if (valType === "symbol") return { body: val.toString() };
	if (valType === "function") return { body: `${val.name}()` };
	return { body: val };
}
function nullBody(method, status) {
	return method === "HEAD" || status === 100 || status === 101 || status === 102 || status === 204 || status === 205 || status === 304;
}
function errorResponse(error, debug) {
	return new FastResponse(JSON.stringify({
		...error.toJSON(),
		stack: debug && error.stack ? error.stack.split("\n").map((l) => l.trim()) : void 0
	}, void 0, debug ? 2 : void 0), {
		status: error.status,
		statusText: error.statusText,
		headers: error.headers ? mergeHeaders$1(jsonHeaders, error.headers) : new Headers(jsonHeaders)
	});
}
function callMiddleware(event, middleware, handler, index = 0) {
	if (index === middleware.length) return handler(event);
	const fn = middleware[index];
	let nextCalled;
	let nextResult;
	const next = () => {
		if (nextCalled) return nextResult;
		nextCalled = true;
		nextResult = callMiddleware(event, middleware, handler, index + 1);
		return nextResult;
	};
	const ret = fn(event, next);
	return isUnhandledResponse(ret) ? next() : typeof ret?.then === "function" ? ret.then((resolved) => isUnhandledResponse(resolved) ? next() : resolved) : ret;
}
function isUnhandledResponse(val) {
	return val === void 0 || val === kNotFound;
}

function getRequestHost(event, opts = {}) {
	if (opts.xForwardedHost) {
		const xForwardedHost = (event.req.headers.get("x-forwarded-host") || "").split(",").shift()?.trim();
		if (xForwardedHost) return xForwardedHost;
	}
	return event.req.headers.get("host") || "";
}

function getRequestProtocol(event, opts = {}) {
	if (opts.xForwardedProto !== false) {
		const forwardedProto = event.req.headers.get("x-forwarded-proto");
		if (forwardedProto === "https") return "https";
		if (forwardedProto === "http") return "http";
	}
	return (event.url || new URL(event.req.url)).protocol.slice(0, -1);
}

function getRequestURL(event, opts = {}) {
	const url = new URL(event.url || event.req.url);
	url.protocol = getRequestProtocol(event, opts);
	if (opts.xForwardedHost) {
		const host = getRequestHost(event, opts);
		if (host) {
			url.host = host;
			if (!host.includes(":")) url.port = "";
		}
	}
	return url;
}

function getRequestIP(event, opts = {}) {
	if (opts.xForwardedFor) {
		const _header = event.req.headers.get("x-forwarded-for");
		if (_header) {
			const xForwardedFor = _header.split(",")[0].trim();
			if (xForwardedFor) return xForwardedFor;
		}
	}
	return event.req.context?.clientAddress || event.req.ip || void 0;
}

function defineHandler(input) {
	if (typeof input === "function") return handlerWithFetch(input);
	const handler = input.handler || (input.fetch ? function _fetchHandler(event) {
		return input.fetch(event.req);
	} : NoHandler);
	return Object.assign(handlerWithFetch(input.middleware?.length ? function _handlerMiddleware(event) {
		return callMiddleware(event, input.middleware, handler);
	} : handler), input);
}
function handlerWithFetch(handler) {
	if ("fetch" in handler) return handler;
	return Object.assign(handler, { fetch: (req) => {
		if (typeof req === "string") req = new URL(req, "http://_");
		if (req instanceof URL) req = new Request(req);
		const event = new H3Event(req);
		try {
			return Promise.resolve(toResponse(handler(event), event));
		} catch (error) {
			return Promise.resolve(toResponse(error, event));
		}
	} });
}

const NoHandler = () => kNotFound;

function redirect(location, status = 302, statusText) {
	return new HTTPResponse(`<html><head><meta http-equiv="refresh" content="0; url=${location.replace(/"/g, "%22")}" /></head></html>`, {
		status,
		statusText: (status === 301 ? "Moved Permanently" : "Found"),
		headers: {
			"content-type": "text/html; charset=utf-8",
			location
		}
	});
}

function parse(str, options) {
	if (typeof str !== "string") throw new TypeError("argument str must be a string");
	const obj = {};
	const opt = {};
	const dec = opt.decode || decode;
	let index = 0;
	while (index < str.length) {
		const eqIdx = str.indexOf("=", index);
		if (eqIdx === -1) break;
		let endIdx = str.indexOf(";", index);
		if (endIdx === -1) endIdx = str.length;
		else if (endIdx < eqIdx) {
			index = str.lastIndexOf(";", eqIdx - 1) + 1;
			continue;
		}
		const key = str.slice(index, eqIdx).trim();
		if (opt?.filter && !opt?.filter(key)) {
			index = endIdx + 1;
			continue;
		}
		if (void 0 === obj[key]) {
			let val = str.slice(eqIdx + 1, endIdx).trim();
			if (val.codePointAt(0) === 34) val = val.slice(1, -1);
			obj[key] = tryDecode(val, dec);
		}
		index = endIdx + 1;
	}
	return obj;
}
function decode(str) {
	return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
	try {
		return decode2(str);
	} catch {
		return str;
	}
}
const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize(name, value, options) {
	const opt = options || {};
	const enc = opt.encode || encodeURIComponent;
	if (typeof enc !== "function") throw new TypeError("option encode is invalid");
	if (!fieldContentRegExp.test(name)) throw new TypeError("argument name is invalid");
	const encodedValue = enc(value);
	if (encodedValue && !fieldContentRegExp.test(encodedValue)) throw new TypeError("argument val is invalid");
	let str = name + "=" + encodedValue;
	if (void 0 !== opt.maxAge && opt.maxAge !== null) {
		const maxAge = opt.maxAge - 0;
		if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) throw new TypeError("option maxAge is invalid");
		str += "; Max-Age=" + Math.floor(maxAge);
	}
	if (opt.domain) {
		if (!fieldContentRegExp.test(opt.domain)) throw new TypeError("option domain is invalid");
		str += "; Domain=" + opt.domain;
	}
	if (opt.path) {
		if (!fieldContentRegExp.test(opt.path)) throw new TypeError("option path is invalid");
		str += "; Path=" + opt.path;
	}
	if (opt.expires) {
		if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) throw new TypeError("option expires is invalid");
		str += "; Expires=" + opt.expires.toUTCString();
	}
	if (opt.httpOnly) str += "; HttpOnly";
	if (opt.secure) str += "; Secure";
	if (opt.priority) switch (typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority) {
		case "low":
			str += "; Priority=Low";
			break;
		case "medium":
			str += "; Priority=Medium";
			break;
		case "high":
			str += "; Priority=High";
			break;
		default: throw new TypeError("option priority is invalid");
	}
	if (opt.sameSite) switch (typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite) {
		case true:
			str += "; SameSite=Strict";
			break;
		case "lax":
			str += "; SameSite=Lax";
			break;
		case "strict":
			str += "; SameSite=Strict";
			break;
		case "none":
			str += "; SameSite=None";
			break;
		default: throw new TypeError("option sameSite is invalid");
	}
	if (opt.partitioned) str += "; Partitioned";
	return str;
}
function isDate(val) {
	return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}
function parseSetCookie(setCookieValue, options) {
	const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
	const parsed = _parseNameValuePair(parts.shift() || "");
	const name = parsed.name;
	let value = parsed.value;
	try {
		value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
	} catch {}
	const cookie = {
		name,
		value
	};
	for (const part of parts) {
		const sides = part.split("=");
		const partKey = (sides.shift() || "").trimStart().toLowerCase();
		const partValue = sides.join("=");
		switch (partKey) {
			case "expires":
				cookie.expires = new Date(partValue);
				break;
			case "max-age":
				cookie.maxAge = Number.parseInt(partValue, 10);
				break;
			case "secure":
				cookie.secure = true;
				break;
			case "httponly":
				cookie.httpOnly = true;
				break;
			case "samesite":
				cookie.sameSite = partValue;
				break;
			default: cookie[partKey] = partValue;
		}
	}
	return cookie;
}
function _parseNameValuePair(nameValuePairStr) {
	let name = "";
	let value = "";
	const nameValueArr = nameValuePairStr.split("=");
	if (nameValueArr.length > 1) {
		name = nameValueArr.shift();
		value = nameValueArr.join("=");
	} else value = nameValuePairStr;
	return {
		name,
		value
	};
}

function parseCookies(event) {
	return parse(event.req.headers.get("cookie") || "");
}

function getCookie(event, name) {
	return parseCookies(event)[name];
}

function setCookie(event, name, value, options) {
	const newCookie = serialize(name, value, {
		path: "/",
		...options
	});
	const currentCookies = event.res.headers.getSetCookie();
	if (currentCookies.length === 0) {
		event.res.headers.set("set-cookie", newCookie);
		return;
	}
	const newCookieKey = _getDistinctCookieKey(name, options || {});
	event.res.headers.delete("set-cookie");
	for (const cookie of currentCookies) {
		if (_getDistinctCookieKey(cookie.split("=")?.[0], parseSetCookie(cookie)) === newCookieKey) continue;
		event.res.headers.append("set-cookie", cookie);
	}
	event.res.headers.append("set-cookie", newCookie);
}

function deleteCookie(event, name, serializeOptions) {
	setCookie(event, name, "", {
		...serializeOptions,
		maxAge: 0
	});
}

function _getDistinctCookieKey(name, options) {
	return [
		name,
		options.domain || "",
		options.path || "/"
	].join(";");
}

new TextEncoder();

function getBodyStream(event) {
	return event.req.body || void 0;
}

const getRequestWebStream = getBodyStream;

const sendRedirect = (_, loc, code) => redirect(loc, code);

function getResponseStatusText(event) {
	return event.res.statusText || "";
}

function appendResponseHeader(event, name, value) {
	if (Array.isArray(value)) for (const valueItem of value) event.res.headers.append(name, valueItem);
	else event.res.headers.append(name, value);
}

function setResponseHeader(event, name, value) {
	if (Array.isArray(value)) {
		event.res.headers.delete(name);
		for (const valueItem of value) event.res.headers.append(name, valueItem);
	} else event.res.headers.set(name, value);
}

const setHeader = setResponseHeader;

function getResponseStatus(event) {
	return event.res.status || 200;
}

function setResponseStatus(event, code, text) {
	if (code) event.res.status = sanitizeStatusCode(code, event.res.status);
	if (text) event.res.statusText = sanitizeStatusMessage(text);
}

function getResponseHeaders(event) {
	return Object.fromEntries(event.res.headers.entries());
}

function getResponseHeader(event, name) {
	return event.res.headers.get(name) || void 0;
}

function removeResponseHeader(event, name) {
	return event.res.headers.delete(name);
}
const eventHandler$1 = defineHandler;

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, key + "" , value);
function M$6(e) {
  let t;
  const s = f$2(e), o = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(s, { ...o, body: e.node.req.body }) : new Request(s, { ...o, get body() {
    return t || (t = m$1(e), t);
  } });
}
function l$2(e) {
  var _a;
  return (_a = e.web) != null ? _a : e.web = { request: M$6(e), url: f$2(e) }, e.web.request;
}
function N$3() {
  return x$1();
}
const d$1 = /* @__PURE__ */ Symbol("$HTTPEvent");
function R$3(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[d$1]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function n$1(e) {
  return function(...t) {
    var _a;
    let s = t[0];
    if (R$3(s)) t[0] = s instanceof H3Event || s.__is_event__ ? s : s[d$1];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (s = N$3(), !s) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      t.unshift(s);
    }
    return e(...t);
  };
}
const f$2 = n$1(getRequestURL), y$2 = n$1(getRequestIP), u$2 = n$1(setResponseStatus), c$1 = n$1(getResponseStatus), h$1 = n$1(getResponseStatusText), r = n$1(getResponseHeaders), p$2 = n$1(getResponseHeader), b$3 = n$1(setResponseHeader), g$1 = n$1(appendResponseHeader), z$2 = n$1(parseCookies), B$2 = n$1(getCookie), D$3 = n$1(setCookie), G$3 = n$1(deleteCookie), J$3 = n$1(setHeader), m$1 = n$1(getRequestWebStream), H$2 = n$1(removeResponseHeader), S$3 = n$1(l$2);
function K$1() {
  var _a;
  return getContext("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function x$1() {
  return K$1().use().event;
}
const te$4 = Object.freeze(Object.defineProperty({ __proto__: null, H3Event: H3Event, HTTPEventSymbol: d$1, appendResponseHeader: g$1, deleteCookie: G$3, eventHandler, getCookie: B$2, getEvent: x$1, getRequestIP: y$2, getRequestURL: f$2, getRequestWebStream: m$1, getResponseHeader: p$2, getResponseHeaders: r, getResponseStatus: c$1, getResponseStatusText: h$1, getWebRequest: S$3, isEvent: R$3, parseCookies: z$2, removeResponseHeader: H$2, setCookie: D$3, setHeader: J$3, setResponseHeader: b$3, setResponseStatus: u$2, toWebRequest: l$2 }, Symbol.toStringTag, { value: "Module" })), i$2 = "solidFetchEvent";
function Q$3(e) {
  return { request: S$3(e), response: X$1(e), clientAddress: y$2(e), locals: {}, nativeEvent: e };
}
function se$2(e) {
  return { ...e };
}
function ne$3(e) {
  if (!e.context[i$2]) {
    const t = Q$3(e);
    e.context[i$2] = t;
  }
  return e.context[i$2];
}
function oe$1(e, t) {
  for (const [s, o] of t.entries()) g$1(e, s, o);
}
let V$3 = class V {
  constructor(t) {
    __publicField$2(this, "event");
    this.event = t;
  }
  get(t) {
    const s = p$2(this.event, t);
    return Array.isArray(s) ? s.join(", ") : s || null;
  }
  has(t) {
    return this.get(t) !== null;
  }
  set(t, s) {
    return b$3(this.event, t, s);
  }
  delete(t) {
    return H$2(this.event, t);
  }
  append(t, s) {
    g$1(this.event, t, s);
  }
  getSetCookie() {
    const t = p$2(this.event, "Set-Cookie");
    return Array.isArray(t) ? t : [t];
  }
  forEach(t) {
    return Object.entries(r(this.event)).forEach(([s, o]) => t(Array.isArray(o) ? o.join(", ") : o, s, this));
  }
  entries() {
    return Object.entries(r(this.event)).map(([t, s]) => [t, Array.isArray(s) ? s.join(", ") : s])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(r(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(r(this.event)).map((t) => Array.isArray(t) ? t.join(", ") : t)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
};
function X$1(e) {
  return { get status() {
    return c$1(e);
  }, set status(t) {
    u$2(e, t);
  }, get statusText() {
    return h$1(e);
  }, set statusText(t) {
    u$2(e, c$1(e), t);
  }, headers: new V$3(e) };
}

const fetchEventCIpVWTXg = /*#__PURE__*/Object.freeze({
  __proto__: null,
  a: ne$3,
  b: u$2,
  c: J$3,
  d: se$2,
  e: x$1,
  f: G$3,
  g: B$2,
  h: te$4,
  m: oe$1,
  p: z$2,
  s: D$3
});

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
const b$2 = "Invariant Violation", { setPrototypeOf: ue$1 = function(e, r) {
  return e.__proto__ = r, e;
} } = Object;
let v$1 = class v extends Error {
  constructor(r = b$2) {
    super(typeof r == "number" ? `${b$2}: ${r} (see https://github.com/apollographql/invariant-packages)` : r);
    __publicField$1(this, "framesToPop", 1);
    __publicField$1(this, "name", b$2);
    ue$1(this, v.prototype);
  }
};
function pe$1(e, r) {
  if (!e) throw new v$1(r);
}
const I$1 = [{ page: true, $component: { src: "src/routes/[...404].tsx?pick=default&pick=$css", build: () => import('../build/_...404_.mjs'), import: () => import('../build/_...404_.mjs') }, path: "/*404", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/[...404].tsx" }, { page: true, $component: { src: "src/routes/about.tsx?pick=default&pick=$css", build: () => import('../build/about.mjs'), import: () => import('../build/about.mjs') }, path: "/about", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/about.tsx" }, { page: true, $component: { src: "src/routes/auth/login.tsx?pick=default&pick=$css", build: () => import('../build/login.mjs'), import: () => import('../build/login.mjs') }, path: "/auth/login", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/auth/login.tsx" }, { page: true, $component: { src: "src/routes/dashboard/bad-stock.tsx?pick=default&pick=$css", build: () => import('../build/bad-stock.mjs'), import: () => import('../build/bad-stock.mjs') }, path: "/dashboard/bad-stock", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/bad-stock.tsx" }, { page: true, $component: { src: "src/routes/dashboard/barang-keluar.tsx?pick=default&pick=$css", build: () => import('../build/barang-keluar.mjs'), import: () => import('../build/barang-keluar.mjs') }, path: "/dashboard/barang-keluar", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/barang-keluar.tsx" }, { page: true, $component: { src: "src/routes/dashboard/barang-masuk.tsx?pick=default&pick=$css", build: () => import('../build/barang-masuk.mjs'), import: () => import('../build/barang-masuk.mjs') }, path: "/dashboard/barang-masuk", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/barang-masuk.tsx" }, { page: true, $component: { src: "src/routes/dashboard/index.tsx?pick=default&pick=$css", build: () => import('../build/index.mjs'), import: () => import('../build/index.mjs') }, path: "/dashboard/", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard/main.tsx?pick=default&pick=$css", build: () => import('../build/main.mjs'), import: () => import('../build/main.mjs') }, path: "/dashboard/main", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/main.tsx" }, { page: true, $component: { src: "src/routes/dashboard/produk/[id]/edit.tsx?pick=default&pick=$css", build: () => import('../build/edit.mjs'), import: () => import('../build/edit.mjs') }, path: "/dashboard/produk/:id/edit", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/produk/[id]/edit.tsx" }, { page: true, $component: { src: "src/routes/dashboard/produk/create.tsx?pick=default&pick=$css", build: () => import('../build/create.mjs'), import: () => import('../build/create.mjs') }, path: "/dashboard/produk/create", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/produk/create.tsx" }, { page: true, $component: { src: "src/routes/dashboard/produk/index.tsx?pick=default&pick=$css", build: () => import('../build/index2.mjs'), import: () => import('../build/index2.mjs') }, path: "/dashboard/produk/", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/produk/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard/settings.tsx?pick=default&pick=$css", build: () => import('../build/settings.mjs'), import: () => import('../build/settings.mjs') }, path: "/dashboard/settings", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/settings.tsx" }, { page: true, $component: { src: "src/routes/dashboard/users/[id].tsx?pick=default&pick=$css", build: () => import('../build/_id_.mjs'), import: () => import('../build/_id_.mjs') }, path: "/dashboard/users/:id", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/users/[id].tsx" }, { page: true, $component: { src: "src/routes/dashboard/users/create.tsx?pick=default&pick=$css", build: () => import('../build/create2.mjs'), import: () => import('../build/create2.mjs') }, path: "/dashboard/users/create", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/users/create.tsx" }, { page: true, $component: { src: "src/routes/dashboard/users/index.tsx?pick=default&pick=$css", build: () => import('../build/index3.mjs'), import: () => import('../build/index3.mjs') }, path: "/dashboard/users/", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/users/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard.tsx?pick=default&pick=$css", build: () => import('../build/dashboard.mjs'), import: () => import('../build/dashboard.mjs') }, path: "/dashboard", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard.tsx" }, { page: true, $component: { src: "src/routes/index.tsx?pick=default&pick=$css", build: () => import('../build/index4.mjs'), import: () => import('../build/index4.mjs') }, path: "/", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/index.tsx" }], le$1 = me$1(I$1.filter((e) => e.page));
function me$1(e) {
  function r(t, a, o, n) {
    const i = Object.values(t).find((c) => o.startsWith(c.id + "/"));
    return i ? (r(i.children || (i.children = []), a, o.slice(i.id.length)), t) : (t.push({ ...a, id: o, path: o.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), t);
  }
  return e.sort((t, a) => t.path.length - a.path.length).reduce((t, a) => r(t, a, a.path, a.path), []);
}
function he$1(e) {
  return e.$HEAD || e.$GET || e.$POST || e.$PUT || e.$PATCH || e.$DELETE;
}
createRouter$1({ routes: I$1.reduce((e, r) => {
  if (!he$1(r)) return e;
  let t = r.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (a, o) => `**:${o}`).split("/").map((a) => a.startsWith(":") || a.startsWith("*") ? a : encodeURIComponent(a)).join("/");
  if (/:[^/]*\?/g.test(t)) throw new Error(`Optional parameters are not supported in API routes: ${t}`);
  if (e[t]) throw new Error(`Duplicate API routes for "${t}" found at "${e[t].route.path}" and "${r.path}"`);
  return e[t] = { route: r }, e;
}, {}) });
var ge$1 = " ";
const be$2 = { style: (e) => ssrElement("style", e.attrs, () => e.children, true), link: (e) => ssrElement("link", e.attrs, void 0, true), script: (e) => e.attrs.src ? ssrElement("script", mergeProps(() => e.attrs, { get id() {
  return e.key;
} }), () => ssr(ge$1), true) : null, noscript: (e) => ssrElement("noscript", e.attrs, () => escape(e.children), true) };
function _e$1(e, r) {
  let { tag: t, attrs: { key: a, ...o } = { key: void 0 }, children: n } = e;
  return be$2[t]({ attrs: { ...o, nonce: r }, key: a, children: n });
}
function ke$2(e, r, t, a = "default") {
  return lazy(async () => {
    var _a;
    {
      const n = (await e.import())[a], c = (await ((_a = r.inputs) == null ? void 0 : _a[e.src].assets())).filter((u) => u.tag === "style" || u.attrs.rel === "stylesheet");
      return { default: (u) => [...c.map((m) => _e$1(m)), createComponent(n, u)] };
    }
  });
}
function M$5() {
  function e(t) {
    return { ...t, ...t.$$route ? t.$$route.require().route : void 0, info: { ...t.$$route ? t.$$route.require().route.info : {}, filesystem: true }, component: t.$component && ke$2(t.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: t.children ? t.children.map(e) : void 0 };
  }
  return le$1.map(e);
}
let q$2;
const Ae$1 = isServer ? () => getRequestEvent().routes : () => q$2 || (q$2 = M$5());
function Re$1(e) {
  const r = B$2(e.nativeEvent, "flash");
  if (r) try {
    let t = JSON.parse(r);
    if (!t || !t.result) return;
    const a = [...t.input.slice(0, -1), new Map(t.input[t.input.length - 1])], o = t.error ? new Error(t.result) : t.result;
    return { input: a, url: t.url, pending: false, result: t.thrown ? void 0 : o, error: t.thrown ? o : void 0 };
  } catch (t) {
    console.error(t);
  } finally {
    D$3(e.nativeEvent, "flash", "", { maxAge: 0 });
  }
}
async function $e$2(e) {
  const r = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, e.response.headers.set("Content-Type", "text/html"), Object.assign(e, { manifest: await r.json(), assets: [...await r.inputs[r.handler].assets()], router: { submission: Re$1(e) }, routes: M$5(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const Pe$1 = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function xe$1(e) {
  return e.status && Pe$1.has(e.status) ? e.status : 302;
}
const ye$1 = { "src_routes_dashboard_index_tsx--getAuthenticatedUser_1": { functionName: "getAuthenticatedUser_1", importer: () => import('../build/index-D39yfOTr.mjs') }, "src_routes_dashboard_tsx--protectRoute_1": { functionName: "protectRoute_1", importer: () => import('../build/dashboard-D5mZp-20.mjs') }, "src_routes_auth_login_tsx--login_action": { functionName: "login_action", importer: () => import('../build/login-CGNBHsLW.mjs') }, "src_lib_auth-checks_ts--checkSession_1": { functionName: "checkSession_1", importer: () => import('../build/auth-checks-BwLvXVBd.mjs') }, "src_lib_products_ts--getProducts_1": { functionName: "getProducts_1", importer: () => import('../build/products-QOPIUUBV.mjs') }, "src_lib_products_ts--getProduct_1": { functionName: "getProduct_1", importer: () => import('../build/products-QOPIUUBV.mjs') }, "src_lib_products_ts--createProduct_1": { functionName: "createProduct_1", importer: () => import('../build/products-QOPIUUBV.mjs') }, "src_lib_products_ts--updateProduct_1": { functionName: "updateProduct_1", importer: () => import('../build/products-QOPIUUBV.mjs') }, "src_lib_products_ts--deleteProduct_1": { functionName: "deleteProduct_1", importer: () => import('../build/products-QOPIUUBV.mjs') }, "src_lib_users_ts--getUsers_1": { functionName: "getUsers_1", importer: () => import('../build/users-DUDoXUFs.mjs') }, "src_lib_users_ts--getUser_1": { functionName: "getUser_1", importer: () => import('../build/users-DUDoXUFs.mjs') }, "src_lib_users_ts--createUser_1": { functionName: "createUser_1", importer: () => import('../build/users-DUDoXUFs.mjs') }, "src_lib_users_ts--updateUser_1": { functionName: "updateUser_1", importer: () => import('../build/users-DUDoXUFs.mjs') }, "src_lib_users_ts--deleteUser_1": { functionName: "deleteUser_1", importer: () => import('../build/users-DUDoXUFs.mjs') }, "src_lib_session_ts--getUser_1": { functionName: "getUser_1", importer: () => import('../build/session-C4pX75Tv.mjs') }, "src_lib_session_ts--createUserSession_1": { functionName: "createUserSession_1", importer: () => import('../build/session-C4pX75Tv.mjs') }, "src_lib_session_ts--logout_1": { functionName: "logout_1", importer: () => import('../build/session-C4pX75Tv.mjs') } };
function we$2(e) {
  const r = new TextEncoder().encode(e), t = r.length, a = t.toString(16), o = "00000000".substring(0, 8 - a.length) + a, n = new TextEncoder().encode(`;0x${o};`), i = new Uint8Array(12 + t);
  return i.set(n), i.set(r, 12), i;
}
function J$2(e, r) {
  return new ReadableStream({ start(t) {
    crossSerializeStream(r, { scopeId: e, plugins: [CustomEventPlugin, DOMExceptionPlugin, EventPlugin, FormDataPlugin, HeadersPlugin, ReadableStreamPlugin, RequestPlugin, ResponsePlugin, URLSearchParamsPlugin, URLPlugin], onSerialize(a, o) {
      t.enqueue(we$2(o ? `(${getCrossReferenceHeader(e)},${a})` : a));
    }, onDone() {
      t.close();
    }, onError(a) {
      t.error(a);
    } });
  } });
}
async function Se$1(e) {
  const r = ne$3(e), t = r.request, a = t.headers.get("X-Server-Id"), o = t.headers.get("X-Server-Instance"), n = t.headers.has("X-Single-Flight"), i = new URL(t.url);
  let c, p;
  if (a) pe$1(typeof a == "string", "Invalid server function"), [c, p] = a.split("#");
  else if (c = i.searchParams.get("id"), p = i.searchParams.get("name"), !c || !p) return new Response(null, { status: 404 });
  const u = ye$1[c];
  let m;
  if (!u) return new Response(null, { status: 404 });
  m = await u.importer();
  const j = m[u.functionName];
  let l = [];
  if (!o || e.method === "GET") {
    const s = i.searchParams.get("args");
    if (s) {
      const d = JSON.parse(s);
      (d.t ? fromJSON(d, { plugins: [CustomEventPlugin, DOMExceptionPlugin, EventPlugin, FormDataPlugin, HeadersPlugin, ReadableStreamPlugin, RequestPlugin, ResponsePlugin, URLSearchParamsPlugin, URLPlugin] }) : d).forEach((h) => l.push(h));
    }
  }
  if (e.method === "POST") {
    const s = t.headers.get("content-type"), d = e.node.req, h = d instanceof ReadableStream, B = d.body instanceof ReadableStream, T = h && d.locked || B && d.body.locked, C = h ? d : d.body;
    if ((s == null ? void 0 : s.startsWith("multipart/form-data")) || (s == null ? void 0 : s.startsWith("application/x-www-form-urlencoded"))) l.push(await (T ? t : new Request(t, { ...t, body: C })).formData());
    else if (s == null ? void 0 : s.startsWith("application/json")) {
      const X = T ? t : new Request(t, { ...t, body: C });
      l = fromJSON(await X.json(), { plugins: [CustomEventPlugin, DOMExceptionPlugin, EventPlugin, FormDataPlugin, HeadersPlugin, ReadableStreamPlugin, RequestPlugin, ResponsePlugin, URLSearchParamsPlugin, URLPlugin] });
    }
  }
  try {
    let s = await provideRequestEvent(r, async () => (sharedConfig.context = { event: r }, r.locals.serverFunctionMeta = { id: c + "#" + p }, j(...l)));
    if (n && o && (s = await A$2(r, s)), s instanceof Response) {
      if (s.headers && s.headers.has("X-Content-Raw")) return s;
      o && (s.headers && oe$1(e, s.headers), s.status && (s.status < 300 || s.status >= 400) && u$2(e, s.status), s.customBody ? s = await s.customBody() : s.body == null && (s = null));
    }
    return o ? (J$3(e, "content-type", "text/javascript"), J$2(o, s)) : F(s, t, l);
  } catch (s) {
    if (s instanceof Response) n && o && (s = await A$2(r, s)), s.headers && oe$1(e, s.headers), s.status && (!o || s.status < 300 || s.status >= 400) && u$2(e, s.status), s.customBody ? s = s.customBody() : s.body == null && (s = null), J$3(e, "X-Error", "true");
    else if (o) {
      const d = s instanceof Error ? s.message : typeof s == "string" ? s : "true";
      J$3(e, "X-Error", d.replace(/[\r\n]+/g, ""));
    } else s = F(s, t, l, true);
    return o ? (J$3(e, "content-type", "text/javascript"), J$2(o, s)) : s;
  }
}
function F(e, r, t, a) {
  const o = new URL(r.url), n = e instanceof Error;
  let i = 302, c;
  return e instanceof Response ? (c = new Headers(e.headers), e.headers.has("Location") && (c.set("Location", new URL(e.headers.get("Location"), o.origin + "").toString()), i = xe$1(e))) : c = new Headers({ Location: new URL(r.headers.get("referer")).toString() }), e && c.append("Set-Cookie", `flash=${encodeURIComponent(JSON.stringify({ url: o.pathname + o.search, result: n ? e.message : e, thrown: a, error: n, input: [...t.slice(0, -1), [...t[t.length - 1].entries()]] }))}; Secure; HttpOnly;`), new Response(null, { status: i, headers: c });
}
let _$1;
function Ue$1(e) {
  var _a;
  const r = new Headers(e.request.headers), t = z$2(e.nativeEvent), a = e.response.headers.getSetCookie();
  r.delete("cookie");
  let o = false;
  return ((_a = e.nativeEvent.node) == null ? void 0 : _a.req) && (o = true, e.nativeEvent.node.req.headers.cookie = ""), a.forEach((n) => {
    if (!n) return;
    const { maxAge: i, expires: c, name: p, value: u } = parseSetCookie$1(n);
    if (i != null && i <= 0) {
      delete t[p];
      return;
    }
    if (c != null && c.getTime() <= Date.now()) {
      delete t[p];
      return;
    }
    t[p] = u;
  }), Object.entries(t).forEach(([n, i]) => {
    r.append("cookie", `${n}=${i}`), o && (e.nativeEvent.node.req.headers.cookie += `${n}=${i};`);
  }), r;
}
async function A$2(e, r) {
  let t, a = new URL(e.request.headers.get("referer")).toString();
  r instanceof Response && (r.headers.has("X-Revalidate") && (t = r.headers.get("X-Revalidate").split(",")), r.headers.has("Location") && (a = new URL(r.headers.get("Location"), new URL(e.request.url).origin + "").toString()));
  const o = se$2(e);
  return o.request = new Request(a, { headers: Ue$1(e) }), await provideRequestEvent(o, async () => {
    await $e$2(o), _$1 || (_$1 = (await import('../build/app-DdXtN6Nq.mjs')).default), o.router.dataOnly = t || true, o.router.previousUrl = e.request.headers.get("referer");
    try {
      renderToString(() => {
        sharedConfig.context.event = o, _$1();
      });
    } catch (c) {
      console.log(c);
    }
    const n = o.router.data;
    if (!n) return r;
    let i = false;
    for (const c in n) n[c] === void 0 ? delete n[c] : i = true;
    return i && (r instanceof Response ? r.customBody && (n._$value = r.customBody()) : (n._$value = r, r = new Response(null, { status: 200 })), r.customBody = () => n, r.headers.set("X-Single-Flight", "true")), r;
  });
}
const He$1 = eventHandler$1(Se$1);

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
function M$4(e) {
  let t;
  const s = f$1(e), r = { duplex: "half", method: e.method, headers: e.headers };
  return e.node.req.body instanceof ArrayBuffer ? new Request(s, { ...r, body: e.node.req.body }) : new Request(s, { ...r, get body() {
    return t || (t = m(e), t);
  } });
}
function g(e) {
  var _a;
  return (_a = e.web) != null ? _a : e.web = { request: M$4(e), url: f$1(e) }, e.web.request;
}
function N$2() {
  return x();
}
const d = /* @__PURE__ */ Symbol("$HTTPEvent");
function R$2(e) {
  return typeof e == "object" && (e instanceof H3Event || (e == null ? void 0 : e[d]) instanceof H3Event || (e == null ? void 0 : e.__is_event__) === true);
}
function n(e) {
  return function(...t) {
    var _a;
    let s = t[0];
    if (R$2(s)) t[0] = s instanceof H3Event || s.__is_event__ ? s : s[d];
    else {
      if (!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext)) throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");
      if (s = N$2(), !s) throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");
      t.unshift(s);
    }
    return e(...t);
  };
}
const f$1 = n(getRequestURL), l$1 = n(getRequestIP), c = n(setResponseStatus), u$1 = n(getResponseStatus), h = n(getResponseStatusText), o = n(getResponseHeaders), p$1 = n(getResponseHeader), y$1 = n(setResponseHeader), b$1 = n(appendResponseHeader), z$1 = n(sendRedirect), B$1 = n(getCookie), D$2 = n(setCookie), G$2 = n(deleteCookie), J$1 = n(setHeader), m = n(getRequestWebStream), S$2 = n(removeResponseHeader), H$1 = n(g);
function K() {
  var _a;
  return getContext("nitro-app", { asyncContext: !!((_a = globalThis.app.config.server.experimental) == null ? void 0 : _a.asyncContext), AsyncLocalStorage: AsyncLocalStorage });
}
function x() {
  return K().use().event;
}
const te$3 = Object.freeze(Object.defineProperty({ __proto__: null, H3Event: H3Event, HTTPEventSymbol: d, appendResponseHeader: b$1, deleteCookie: G$2, eventHandler, getCookie: B$1, getEvent: x, getRequestIP: l$1, getRequestURL: f$1, getRequestWebStream: m, getResponseHeader: p$1, getResponseHeaders: o, getResponseStatus: u$1, getResponseStatusText: h, getWebRequest: H$1, isEvent: R$2, removeResponseHeader: S$2, sendRedirect: z$1, setCookie: D$2, setHeader: J$1, setResponseHeader: y$1, setResponseStatus: c, toWebRequest: g }, Symbol.toStringTag, { value: "Module" })), i$1 = "solidFetchEvent";
function Q$2(e) {
  return { request: H$1(e), response: X(e), clientAddress: l$1(e), locals: {}, nativeEvent: e };
}
function se$1(e) {
  return { ...e };
}
function ne$2(e) {
  if (!e.context[i$1]) {
    const t = Q$2(e);
    e.context[i$1] = t;
  }
  return e.context[i$1];
}
let V$2 = class V {
  constructor(t) {
    __publicField(this, "event");
    this.event = t;
  }
  get(t) {
    const s = p$1(this.event, t);
    return Array.isArray(s) ? s.join(", ") : s || null;
  }
  has(t) {
    return this.get(t) !== null;
  }
  set(t, s) {
    return y$1(this.event, t, s);
  }
  delete(t) {
    return S$2(this.event, t);
  }
  append(t, s) {
    b$1(this.event, t, s);
  }
  getSetCookie() {
    const t = p$1(this.event, "Set-Cookie");
    return Array.isArray(t) ? t : [t];
  }
  forEach(t) {
    return Object.entries(o(this.event)).forEach(([s, r]) => t(Array.isArray(r) ? r.join(", ") : r, s, this));
  }
  entries() {
    return Object.entries(o(this.event)).map(([t, s]) => [t, Array.isArray(s) ? s.join(", ") : s])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(o(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values(o(this.event)).map((t) => Array.isArray(t) ? t.join(", ") : t)[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
};
function X(e) {
  return { get status() {
    return u$1(e);
  }, set status(t) {
    c(e, t);
  }, get statusText() {
    return h(e);
  }, set statusText(t) {
    c(e, u$1(e), t);
  }, headers: new V$2(e) };
}

const fetchEventOIVSvjBj = /*#__PURE__*/Object.freeze({
  __proto__: null,
  a: ne$2,
  b: z$1,
  c: c,
  d: J$1,
  e: se$1,
  f: x,
  g: B$1,
  h: G$2,
  i: te$3,
  s: D$2
});

const y = createContext$1(), v = ["title", "meta"], p = [], f = ["name", "http-equiv", "content", "charset", "media"].concat(["property"]), l = (n, t) => {
  const e = Object.fromEntries(Object.entries(n.props).filter(([r]) => t.includes(r)).sort());
  return (Object.hasOwn(e, "name") || Object.hasOwn(e, "property")) && (e.name = e.name || e.property, delete e.property), n.tag + JSON.stringify(e);
};
function E$1() {
  if (!sharedConfig.context) {
    const e = document.head.querySelectorAll("[data-sm]");
    Array.prototype.forEach.call(e, (r) => r.parentNode.removeChild(r));
  }
  const n = /* @__PURE__ */ new Map();
  function t(e) {
    if (e.ref) return e.ref;
    let r = document.querySelector(`[data-sm="${e.id}"]`);
    return r ? (r.tagName.toLowerCase() !== e.tag && (r.parentNode && r.parentNode.removeChild(r), r = document.createElement(e.tag)), r.removeAttribute("data-sm")) : r = document.createElement(e.tag), r;
  }
  return { addTag(e) {
    if (v.indexOf(e.tag) !== -1) {
      const i = e.tag === "title" ? p : f, a = l(e, i);
      n.has(a) || n.set(a, []);
      let s = n.get(a), u = s.length;
      s = [...s, e], n.set(a, s);
      let c = t(e);
      e.ref = c, spread(c, e.props);
      let d = null;
      for (var r = u - 1; r >= 0; r--) if (s[r] != null) {
        d = s[r];
        break;
      }
      return c.parentNode != document.head && document.head.appendChild(c), d && d.ref && d.ref.parentNode && document.head.removeChild(d.ref), u;
    }
    let o = t(e);
    return e.ref = o, spread(o, e.props), o.parentNode != document.head && document.head.appendChild(o), -1;
  }, removeTag(e, r) {
    const o = e.tag === "title" ? p : f, i = l(e, o);
    if (e.ref) {
      const a = n.get(i);
      if (a) {
        if (e.ref.parentNode) {
          e.ref.parentNode.removeChild(e.ref);
          for (let s = r - 1; s >= 0; s--) a[s] != null && document.head.appendChild(a[s].ref);
        }
        a[r] = null, n.set(i, a);
      } else e.ref.parentNode && e.ref.parentNode.removeChild(e.ref);
    }
  } };
}
function w() {
  const n = [];
  return useAssets(() => ssr(S$1(n))), { addTag(t) {
    if (v.indexOf(t.tag) !== -1) {
      const e = t.tag === "title" ? p : f, r = l(t, e), o = n.findIndex((i) => i.tag === t.tag && l(i, e) === r);
      o !== -1 && n.splice(o, 1);
    }
    return n.push(t), n.length;
  }, removeTag(t, e) {
  } };
}
const I = (n) => {
  const t = isServer ? w() : E$1();
  return createComponent$1(y.Provider, { value: t, get children() {
    return n.children;
  } });
}, A$1 = (n, t, e) => (M$3({ tag: n, props: t, setting: e, id: createUniqueId(), get name() {
  return t.name || t.property;
} }), null);
function M$3(n) {
  const t = useContext(y);
  if (!t) throw new Error("<MetaProvider /> should be in the tree");
  createRenderEffect(() => {
    const e = t.addTag(n);
    onCleanup(() => t.removeTag(n, e));
  });
}
function S$1(n) {
  return n.map((t) => {
    var _a, _b;
    const r = Object.keys(t.props).map((i) => i === "children" ? "" : ` ${i}="${escape(t.props[i], true)}"`).join("");
    let o = t.props.children;
    return Array.isArray(o) && (o = o.join("")), ((_a = t.setting) == null ? void 0 : _a.close) ? `<${t.tag} data-sm="${t.id}"${r}>${((_b = t.setting) == null ? void 0 : _b.escape) ? escape(o) : o || ""}</${t.tag}>` : `<${t.tag} data-sm="${t.id}"${r}/>`;
  }).join("");
}
const k = (n) => A$1("title", n, { escape: true, close: true });

var i = ["<div", ' class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>'];
function s() {
  return ssr(i, ssrHydrationKey());
}

function ye() {
  let t = /* @__PURE__ */ new Set();
  function e(r) {
    return t.add(r), () => t.delete(r);
  }
  let n = false;
  function s(r, o) {
    if (n) return !(n = false);
    const a = { to: r, options: o, defaultPrevented: false, preventDefault: () => a.defaultPrevented = true };
    for (const c of t) c.listener({ ...a, from: c.location, retry: (f) => {
      f && (n = true), c.navigate(r, { ...o, resolve: false });
    } });
    return !a.defaultPrevented;
  }
  return { subscribe: e, confirm: s };
}
let D$1;
function V$1() {
  (!window.history.state || window.history.state._depth == null) && window.history.replaceState({ ...window.history.state, _depth: window.history.length - 1 }, ""), D$1 = window.history.state._depth;
}
isServer || V$1();
function Ie$1(t) {
  return { ...t, _depth: window.history.state && window.history.state._depth };
}
function qe(t, e) {
  let n = false;
  return () => {
    const s = D$1;
    V$1();
    const r = s == null ? null : D$1 - s;
    if (n) {
      n = false;
      return;
    }
    r && e(r) ? (n = true, window.history.go(-r)) : t();
  };
}
const we$1 = /^(?:[a-z0-9]+:)?\/\//i, ve = /^\/+|(\/)\/+$/g, Re = "http://sr";
function L$1(t, e = false) {
  const n = t.replace(ve, "$1");
  return n ? e || /^[?#]/.test(n) ? n : "/" + n : "";
}
function W$1(t, e, n) {
  if (we$1.test(e)) return;
  const s = L$1(t), r = n && L$1(n);
  let o = "";
  return !r || e.startsWith("/") ? o = s : r.toLowerCase().indexOf(s.toLowerCase()) !== 0 ? o = s + r : o = r, (o || "/") + L$1(e, !o);
}
function Pe(t, e) {
  if (t == null) throw new Error(e);
  return t;
}
function xe(t, e) {
  return L$1(t).replace(/\/*(\*.*)?$/g, "") + L$1(e);
}
function Y$2(t) {
  const e = {};
  return t.searchParams.forEach((n, s) => {
    s in e ? Array.isArray(e[s]) ? e[s].push(n) : e[s] = [e[s], n] : e[s] = n;
  }), e;
}
function be$1(t, e, n) {
  const [s, r] = t.split("/*", 2), o = s.split("/").filter(Boolean), a = o.length;
  return (c) => {
    const f = c.split("/").filter(Boolean), h = f.length - a;
    if (h < 0 || h > 0 && r === void 0 && !e) return null;
    const l = { path: a ? "" : "/", params: {} }, m = (d) => n === void 0 ? void 0 : n[d];
    for (let d = 0; d < a; d++) {
      const p = o[d], y = p[0] === ":", v = y ? f[d] : f[d].toLowerCase(), F = y ? p.slice(1) : p.toLowerCase();
      if (y && $$1(v, m(F))) l.params[F] = v;
      else if (y || !$$1(v, F)) return null;
      l.path += `/${v}`;
    }
    if (r) {
      const d = h ? f.slice(-h).join("/") : "";
      if ($$1(d, m(r))) l.params[r] = d;
      else return null;
    }
    return l;
  };
}
function $$1(t, e) {
  const n = (s) => s === t;
  return e === void 0 ? true : typeof e == "string" ? n(e) : typeof e == "function" ? e(t) : Array.isArray(e) ? e.some(n) : e instanceof RegExp ? e.test(t) : false;
}
function Ae(t) {
  const [e, n] = t.pattern.split("/*", 2), s = e.split("/").filter(Boolean);
  return s.reduce((r, o) => r + (o.startsWith(":") ? 2 : 3), s.length - (n === void 0 ? 0 : 1));
}
function Z(t) {
  const e = /* @__PURE__ */ new Map(), n = getOwner();
  return new Proxy({}, { get(s, r) {
    return e.has(r) || runWithOwner(n, () => e.set(r, createMemo(() => t()[r]))), e.get(r)();
  }, getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  }, ownKeys() {
    return Reflect.ownKeys(t());
  }, has(s, r) {
    return r in t();
  } });
}
function ee$1(t) {
  let e = /(\/?\:[^\/]+)\?/.exec(t);
  if (!e) return [t];
  let n = t.slice(0, e.index), s = t.slice(e.index + e[0].length);
  const r = [n, n += e[1]];
  for (; e = /^(\/\:[^\/]+)\?/.exec(s); ) r.push(n += e[1]), s = s.slice(e[0].length);
  return ee$1(s).reduce((o, a) => [...o, ...r.map((c) => c + a)], []);
}
const Ce = 100, Ee$1 = createContext$1(), te$2 = createContext$1(), E = () => Pe(useContext(Ee$1), "<A> and 'use' router primitives can be only used inside a Route."), Fe = () => useContext(te$2) || E().base, We = (t) => {
  const e = Fe();
  return createMemo(() => e.resolvePath(t()));
}, $e$1 = (t) => {
  const e = E();
  return createMemo(() => {
    const n = t();
    return n !== void 0 ? e.renderPath(n) : n;
  });
}, Me = () => E().navigatorFactory(), De = () => E().location, Ue = () => E().isRouting, ze = () => E().params;
function Le(t, e = "") {
  const { component: n, preload: s, load: r, children: o, info: a } = t, c = !o || Array.isArray(o) && !o.length, f = { key: t, component: n, preload: s || r, info: a };
  return ne$1(t.path).reduce((h, l) => {
    for (const m of ee$1(l)) {
      const d = xe(e, m);
      let p = c ? d : d.split("/*", 1)[0];
      p = p.split("/").map((y) => y.startsWith(":") || y.startsWith("*") ? y : encodeURIComponent(y)).join("/"), h.push({ ...f, originalPath: l, pattern: p, matcher: be$1(p, !c, t.matchFilters) });
    }
    return h;
  }, []);
}
function Se(t, e = 0) {
  return { routes: t, score: Ae(t[t.length - 1]) * 1e4 - e, matcher(n) {
    const s = [];
    for (let r = t.length - 1; r >= 0; r--) {
      const o = t[r], a = o.matcher(n);
      if (!a) return null;
      s.unshift({ ...a, route: o });
    }
    return s;
  } };
}
function ne$1(t) {
  return Array.isArray(t) ? t : [t];
}
function Oe(t, e = "", n = [], s = []) {
  const r = ne$1(t);
  for (let o = 0, a = r.length; o < a; o++) {
    const c = r[o];
    if (c && typeof c == "object") {
      c.hasOwnProperty("path") || (c.path = "");
      const f = Le(c, e);
      for (const h of f) {
        n.push(h);
        const l = Array.isArray(c.children) && c.children.length === 0;
        if (c.children && !l) Oe(c.children, h.pattern, n, s);
        else {
          const m = Se([...n], s.length);
          s.push(m);
        }
        n.pop();
      }
    }
  }
  return n.length ? s : s.sort((o, a) => a.score - o.score);
}
function M$2(t, e) {
  for (let n = 0, s = t.length; n < s; n++) {
    const r = t[n].matcher(e);
    if (r) return r;
  }
  return [];
}
function _e(t, e, n) {
  const s = new URL(Re), r = createMemo((l) => {
    const m = t();
    try {
      return new URL(m, s);
    } catch {
      return console.error(`Invalid path ${m}`), l;
    }
  }, s, { equals: (l, m) => l.href === m.href }), o = createMemo(() => r().pathname), a = createMemo(() => r().search, true), c = createMemo(() => r().hash), f = () => "", h = on(a, () => Y$2(r()));
  return { get pathname() {
    return o();
  }, get search() {
    return a();
  }, get hash() {
    return c();
  }, get state() {
    return e();
  }, get key() {
    return f();
  }, query: n ? n(h) : Z(h) };
}
let R$1;
function He() {
  return R$1;
}
let C = false;
function Ke() {
  return C;
}
function Ne(t) {
  C = t;
}
function Te(t, e, n, s = {}) {
  const { signal: [r, o], utils: a = {} } = t, c = a.parsePath || ((i) => i), f = a.renderPath || ((i) => i), h = a.beforeLeave || ye(), l = W$1("", s.base || "");
  if (l === void 0) throw new Error(`${l} is not a valid base path`);
  l && !r().value && o({ value: l, replace: true, scroll: false });
  const [m, d] = createSignal(false);
  let p;
  const y = (i, u) => {
    u.value === v() && u.state === S() || (p === void 0 && d(true), R$1 = i, p = u, startTransition(() => {
      p === u && (F(p.value), re(p.state), resetErrorBoundaries(), isServer || z[1]((g) => g.filter((P) => P.pending)));
    }).finally(() => {
      p === u && batch(() => {
        R$1 = void 0, i === "navigate" && ie(p), d(false), p = void 0;
      });
    }));
  }, [v, F] = createSignal(r().value), [S, re] = createSignal(r().state), O = _e(v, S, a.queryWrapper), _ = [], z = createSignal(isServer ? ue() : []), H = createMemo(() => typeof s.transformUrl == "function" ? M$2(e(), s.transformUrl(O.pathname)) : M$2(e(), O.pathname)), K = () => {
    const i = H(), u = {};
    for (let g = 0; g < i.length; g++) Object.assign(u, i[g].params);
    return u;
  }, se = a.paramsWrapper ? a.paramsWrapper(K, e) : Z(K), N = { pattern: l, path: () => l, outlet: () => null, resolvePath(i) {
    return W$1(l, i);
  } };
  return createRenderEffect(on(r, (i) => y("native", i), { defer: true })), { base: N, location: O, params: se, isRouting: m, renderPath: f, parsePath: c, navigatorFactory: ae, matches: H, beforeLeave: h, preloadRoute: ce, singleFlight: s.singleFlight === void 0 ? true : s.singleFlight, submissions: z };
  function oe(i, u, g) {
    untrack(() => {
      if (typeof u == "number") {
        u && (a.go ? a.go(u) : console.warn("Router integration does not support relative routing"));
        return;
      }
      const P = !u || u[0] === "?", { replace: j, resolve: x, scroll: B, state: b } = { replace: false, resolve: !P, scroll: true, ...g }, A = x ? i.resolvePath(u) : W$1(P && O.pathname || "", u);
      if (A === void 0) throw new Error(`Path '${u}' is not a routable path`);
      if (_.length >= Ce) throw new Error("Too many redirects");
      const T = v();
      if (A !== T || b !== S()) if (isServer) {
        const k = getRequestEvent();
        k && (k.response = { status: 302, headers: new Headers({ Location: A }) }), o({ value: A, replace: j, scroll: B, state: b });
      } else h.confirm(A, g) && (_.push({ value: T, replace: j, scroll: B, state: S() }), y("navigate", { value: A, state: b }));
    });
  }
  function ae(i) {
    return i = i || useContext(te$2) || N, (u, g) => oe(i, u, g);
  }
  function ie(i) {
    const u = _[0];
    u && (o({ ...i, replace: u.replace, scroll: u.scroll }), _.length = 0);
  }
  function ce(i, u) {
    const g = M$2(e(), i.pathname), P = R$1;
    R$1 = "preload";
    for (let j in g) {
      const { route: x, params: B } = g[j];
      x.component && x.component.preload && x.component.preload();
      const { preload: b } = x;
      C = true, u && b && runWithOwner(n(), () => b({ params: B, location: { pathname: i.pathname, search: i.search, hash: i.hash, query: Y$2(i), state: null, key: "" }, intent: "preload" })), C = false;
    }
    R$1 = P;
  }
  function ue() {
    const i = getRequestEvent();
    return i && i.router && i.router.submission ? [i.router.submission] : [];
  }
}
function ke$1(t, e, n, s) {
  const { base: r, location: o, params: a } = t, { pattern: c, component: f, preload: h } = s().route, l = createMemo(() => s().path);
  f && f.preload && f.preload(), C = true;
  const m = h ? h({ params: a, location: o, intent: R$1 || "initial" }) : void 0;
  return C = false, { parent: e, pattern: c, path: l, outlet: () => f ? createComponent(f, { params: a, location: o, data: m, get children() {
    return n();
  } }) : n(), resolvePath(p) {
    return W$1(r.path(), p, l());
  } };
}

const q$1 = "Location", W = 5e3, G$1 = 18e4;
let b = /* @__PURE__ */ new Map();
isServer || setInterval(() => {
  const e = Date.now();
  for (let [t, r] of b.entries()) !r[4].count && e - r[0] > G$1 && b.delete(t);
}, 3e5);
function R() {
  if (!isServer) return b;
  const e = getRequestEvent();
  if (!e) throw new Error("Cannot find cache context");
  return (e.router || (e.router = {})).cache || (e.router.cache = /* @__PURE__ */ new Map());
}
function N$1(e, t = true) {
  return startTransition(() => {
    const r = Date.now();
    M$1(e, (o) => {
      t && (o[0] = 0), o[4][1](r);
    });
  });
}
function M$1(e, t) {
  e && !Array.isArray(e) && (e = [e]);
  for (let r of b.keys()) (e === void 0 || D(r, e)) && t(b.get(r));
}
function P(e, t) {
  e.GET && (e = e.GET);
  const r = (...o) => {
    const n = R(), a = He(), f = Ke(), A = getOwner() ? Me() : void 0, m = Date.now(), l = t + S(o);
    let s = n.get(l), p;
    if (isServer) {
      const i = getRequestEvent();
      if (i) {
        const u = (i.router || (i.router = {})).dataOnly;
        if (u) {
          const w = i && (i.router.data || (i.router.data = {}));
          if (w && l in w) return w[l];
          if (Array.isArray(u) && !D(l, u)) return w[l] = void 0, Promise.resolve();
        }
      }
    }
    if (getListener() && !isServer && (p = true, onCleanup(() => s[4].count--)), s && s[0] && (isServer || a === "native" || s[4].count || Date.now() - s[0] < W)) {
      p && (s[4].count++, s[4][0]()), s[3] === "preload" && a !== "preload" && (s[0] = m);
      let i = s[1];
      return a !== "preload" && (i = "then" in s[1] ? s[1].then(g(false), g(true)) : g(false)(s[1]), !isServer && a === "navigate" && startTransition(() => s[4][1](s[0]))), f && "then" in i && i.catch(() => {
      }), i;
    }
    let c;
    if (!isServer && sharedConfig.has && sharedConfig.has(l) ? (c = sharedConfig.load(l), delete globalThis._$HY.r[l]) : c = e(...o), s ? (s[0] = m, s[1] = c, s[3] = a, !isServer && a === "navigate" && startTransition(() => s[4][1](s[0]))) : (n.set(l, s = [m, c, , a, createSignal(m)]), s[4].count = 0), p && (s[4].count++, s[4][0]()), isServer) {
      const i = getRequestEvent();
      if (i && i.router.dataOnly) return i.router.data[l] = c;
    }
    if (a !== "preload" && (c = "then" in c ? c.then(g(false), g(true)) : g(false)(c)), f && "then" in c && c.catch(() => {
    }), isServer && sharedConfig.context && sharedConfig.context.async && !sharedConfig.context.noHydrate) {
      const i = getRequestEvent();
      (!i || !i.serverOnly) && sharedConfig.context.serialize(l, c);
    }
    return c;
    function g(i) {
      return async (u) => {
        if (u instanceof Response) {
          const w = getRequestEvent();
          if (w) for (const [F, T] of u.headers) F == "set-cookie" ? w.response.headers.append("set-cookie", T) : w.response.headers.set(F, T);
          const C = u.headers.get(q$1);
          if (C !== null) {
            A && C.startsWith("/") ? startTransition(() => {
              A(C, { replace: true });
            }) : isServer ? w && (w.response.status = 302) : window.location.href = C;
            return;
          }
          u.customBody && (u = await u.customBody());
        }
        if (i) throw u;
        return s[2] = u, u;
      };
    }
  };
  return r.keyFor = (...o) => t + S(o), r.key = t, r;
}
P.get = (e) => R().get(e)[2];
P.set = (e, t) => {
  const r = R(), o = Date.now();
  let n = r.get(e);
  n ? (n[0] = o, n[1] = Promise.resolve(t), n[2] = t, n[3] = "preload") : (r.set(e, n = [o, Promise.resolve(t), t, "preload", createSignal(o)]), n[4].count = 0);
};
P.delete = (e) => R().delete(e);
P.clear = () => R().clear();
function D(e, t) {
  for (let r of t) if (r && e.startsWith(r)) return true;
  return false;
}
function S(e) {
  return JSON.stringify(e, (t, r) => z(r) ? Object.keys(r).sort().reduce((o, n) => (o[n] = r[n], o), {}) : r);
}
function z(e) {
  let t;
  return e != null && typeof e == "object" && (!(t = Object.getPrototypeOf(e)) || t === Object.prototype);
}
const _ = /* @__PURE__ */ new Map();
function J(e, t) {
  const r = E(), o = createMemo(() => r.submissions[0]().filter((n) => n.url === e.base && true));
  return new Proxy([], { get(n, a) {
    return a === $TRACK ? o() : a === "pending" ? o().some((f) => !f.result) : o()[a];
  }, has(n, a) {
    return a in o();
  } });
}
function te$1(e, t) {
  const r = J(e);
  return new Proxy({}, { get(o, n) {
    var _a;
    return r.length === 0 && n === "clear" || n === "retry" ? () => {
    } : (_a = r[r.length - 1]) == null ? void 0 : _a[n];
  } });
}
function re$1(e, t = {}) {
  function r(...a) {
    const f = this.r, d = this.f, A = (f.singleFlight && e.withOptions ? e.withOptions({ headers: { "X-Single-Flight": "true" } }) : e)(...a), [m, l] = createSignal();
    let s;
    function p(c) {
      return async (g) => {
        var _a;
        const i = await Q$1(g, c, f.navigatorFactory());
        let u = null;
        if ((_a = o.onComplete) == null ? void 0 : _a.call(o, { ...s, result: i == null ? void 0 : i.data, error: i == null ? void 0 : i.error, pending: false, retry() {
          return u = s.retry();
        } }), u) return u;
        if (!i) return s.clear();
        if (l(i), i.error && !d) throw i.error;
        return i.data;
      };
    }
    return f.submissions[1]((c) => [...c, s = { input: a, url: n, get result() {
      var _a;
      return (_a = m()) == null ? void 0 : _a.data;
    }, get error() {
      var _a;
      return (_a = m()) == null ? void 0 : _a.error;
    }, get pending() {
      return !m();
    }, clear() {
      f.submissions[1]((g) => g.filter((i) => i !== s));
    }, retry() {
      return l(void 0), e(...a).then(p(), p(true));
    } }]), A.then(p(), p(true));
  }
  const o = typeof t == "string" ? { name: t } : t, n = e.url || o.name && `https://action/${o.name}` || (isServer ? "" : `https://action/${Y$1(e.toString())}`);
  return r.base = n, $(r, n);
}
function $(e, t) {
  return e.toString = () => {
    if (!t) throw new Error("Client Actions need explicit names if server rendered");
    return t;
  }, e.with = function(...r) {
    const o = function(...a) {
      return e.call(this, ...r, ...a);
    };
    o.base = e.base;
    const n = new URL(t, Re);
    return n.searchParams.set("args", S(r)), $(o, (n.origin === "https://action" ? n.origin : "") + n.pathname + n.search);
  }, e.url = t, isServer || (_.set(t, e), getOwner() && onCleanup(() => _.delete(t))), e;
}
const Y$1 = (e) => e.split("").reduce((t, r) => (t << 5) - t + r.charCodeAt(0) | 0, 0);
async function Q$1(e, t, r) {
  let o, n, a, f;
  if (e instanceof Response) {
    if (e.headers.has("X-Revalidate") && (a = e.headers.get("X-Revalidate").split(",")), e.customBody && (o = n = await e.customBody(), e.headers.has("X-Single-Flight") && (o = o._$value, delete n._$value, f = Object.keys(n))), e.headers.has("Location")) {
      const d = e.headers.get("Location") || "/";
      d.startsWith("http") ? window.location.href = d : r(d);
    }
  } else {
    if (t) return { error: e };
    o = e;
  }
  return M$1(a, (d) => d[0] = 0), f && f.forEach((d) => P.set(d, n[d])), await N$1(a, false), o != null ? { data: o } : void 0;
}

const u = isServer ? (t) => {
  const e = getRequestEvent();
  return e.response.status = t.code, e.response.statusText = t.text, onCleanup(() => !e.nativeEvent.handled && !e.complete && (e.response.status = 200)), null;
} : (t) => null;

const G = [{ page: true, $component: { src: "src/routes/[...404].tsx?pick=default&pick=$css", build: () => import('../build/_...404_2.mjs'), import: () => import('../build/_...404_2.mjs') }, path: "/*404", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/[...404].tsx" }, { page: true, $component: { src: "src/routes/about.tsx?pick=default&pick=$css", build: () => import('../build/about2.mjs'), import: () => import('../build/about2.mjs') }, path: "/about", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/about.tsx" }, { page: true, $component: { src: "src/routes/auth/login.tsx?pick=default&pick=$css", build: () => import('../build/login2.mjs'), import: () => import('../build/login2.mjs') }, path: "/auth/login", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/auth/login.tsx" }, { page: true, $component: { src: "src/routes/dashboard/bad-stock.tsx?pick=default&pick=$css", build: () => import('../build/bad-stock2.mjs'), import: () => import('../build/bad-stock2.mjs') }, path: "/dashboard/bad-stock", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/bad-stock.tsx" }, { page: true, $component: { src: "src/routes/dashboard/barang-keluar.tsx?pick=default&pick=$css", build: () => import('../build/barang-keluar2.mjs'), import: () => import('../build/barang-keluar2.mjs') }, path: "/dashboard/barang-keluar", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/barang-keluar.tsx" }, { page: true, $component: { src: "src/routes/dashboard/barang-masuk.tsx?pick=default&pick=$css", build: () => import('../build/barang-masuk2.mjs'), import: () => import('../build/barang-masuk2.mjs') }, path: "/dashboard/barang-masuk", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/barang-masuk.tsx" }, { page: true, $component: { src: "src/routes/dashboard/index.tsx?pick=default&pick=$css", build: () => import('../build/index5.mjs'), import: () => import('../build/index5.mjs') }, path: "/dashboard/", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard/main.tsx?pick=default&pick=$css", build: () => import('../build/main2.mjs'), import: () => import('../build/main2.mjs') }, path: "/dashboard/main", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/main.tsx" }, { page: true, $component: { src: "src/routes/dashboard/produk/[id]/edit.tsx?pick=default&pick=$css", build: () => import('../build/edit2.mjs'), import: () => import('../build/edit2.mjs') }, path: "/dashboard/produk/:id/edit", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/produk/[id]/edit.tsx" }, { page: true, $component: { src: "src/routes/dashboard/produk/create.tsx?pick=default&pick=$css", build: () => import('../build/create3.mjs'), import: () => import('../build/create3.mjs') }, path: "/dashboard/produk/create", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/produk/create.tsx" }, { page: true, $component: { src: "src/routes/dashboard/produk/index.tsx?pick=default&pick=$css", build: () => import('../build/index22.mjs'), import: () => import('../build/index22.mjs') }, path: "/dashboard/produk/", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/produk/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard/settings.tsx?pick=default&pick=$css", build: () => import('../build/settings2.mjs'), import: () => import('../build/settings2.mjs') }, path: "/dashboard/settings", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/settings.tsx" }, { page: true, $component: { src: "src/routes/dashboard/users/[id].tsx?pick=default&pick=$css", build: () => import('../build/_id_2.mjs'), import: () => import('../build/_id_2.mjs') }, path: "/dashboard/users/:id", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/users/[id].tsx" }, { page: true, $component: { src: "src/routes/dashboard/users/create.tsx?pick=default&pick=$css", build: () => import('../build/create22.mjs'), import: () => import('../build/create22.mjs') }, path: "/dashboard/users/create", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/users/create.tsx" }, { page: true, $component: { src: "src/routes/dashboard/users/index.tsx?pick=default&pick=$css", build: () => import('../build/index32.mjs'), import: () => import('../build/index32.mjs') }, path: "/dashboard/users/", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/users/index.tsx" }, { page: true, $component: { src: "src/routes/dashboard.tsx?pick=default&pick=$css", build: () => import('../build/dashboard2.mjs'), import: () => import('../build/dashboard2.mjs') }, path: "/dashboard", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard.tsx" }, { page: true, $component: { src: "src/routes/index.tsx?pick=default&pick=$css", build: () => import('../build/index42.mjs'), import: () => import('../build/index42.mjs') }, path: "/", filePath: "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/index.tsx" }], Ht = Mt(G.filter((t) => t.page));
function Mt(t) {
  function r(e, n, s, o) {
    const a = Object.values(e).find((i) => s.startsWith(i.id + "/"));
    return a ? (r(a.children || (a.children = []), n, s.slice(a.id.length)), e) : (e.push({ ...n, id: s, path: s.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/") }), e);
  }
  return t.sort((e, n) => e.path.length - n.path.length).reduce((e, n) => r(e, n, n.path, n.path), []);
}
function Nt(t, r) {
  const e = Bt.lookup(t);
  if (e && e.route) {
    const n = e.route, s = r === "HEAD" ? n.$HEAD || n.$GET : n[`$${r}`];
    if (s === void 0) return;
    const o = n.page === true && n.$component !== void 0;
    return { handler: s, params: e.params, isPage: o };
  }
}
function qt(t) {
  return t.$HEAD || t.$GET || t.$POST || t.$PUT || t.$PATCH || t.$DELETE;
}
const Bt = createRouter$1({ routes: G.reduce((t, r) => {
  if (!qt(r)) return t;
  let e = r.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (n, s) => `**:${s}`).split("/").map((n) => n.startsWith(":") || n.startsWith("*") ? n : encodeURIComponent(n)).join("/");
  if (/:[^/]*\?/g.test(e)) throw new Error(`Optional parameters are not supported in API routes: ${e}`);
  if (t[e]) throw new Error(`Duplicate API routes for "${e}" found at "${t[e].route.path}" and "${r.path}"`);
  return t[e] = { route: r }, t;
}, {}) });
var jt = " ";
const Wt = { style: (t) => ssrElement("style", t.attrs, () => t.children, true), link: (t) => ssrElement("link", t.attrs, void 0, true), script: (t) => t.attrs.src ? ssrElement("script", mergeProps(() => t.attrs, { get id() {
  return t.key;
} }), () => ssr(jt), true) : null, noscript: (t) => ssrElement("noscript", t.attrs, () => escape(t.children), true) };
function A(t, r) {
  let { tag: e, attrs: { key: n, ...s } = { key: void 0 }, children: o } = t;
  return Wt[e]({ attrs: { ...s, nonce: r }, key: n, children: o });
}
function Kt(t, r, e, n = "default") {
  return lazy(async () => {
    var _a;
    {
      const o = (await t.import())[n], i = (await ((_a = r.inputs) == null ? void 0 : _a[t.src].assets())).filter((l) => l.tag === "style" || l.attrs.rel === "stylesheet");
      return { default: (l) => [...i.map((b) => A(b)), createComponent(o, l)] };
    }
  });
}
function V() {
  function t(e) {
    return { ...e, ...e.$$route ? e.$$route.require().route : void 0, info: { ...e.$$route ? e.$$route.require().route.info : {}, filesystem: true }, component: e.$component && Kt(e.$component, globalThis.MANIFEST.client, globalThis.MANIFEST.ssr), children: e.children ? e.children.map(t) : void 0 };
  }
  return Ht.map(t);
}
let H;
const zt = isServer ? () => getRequestEvent().routes : () => H || (H = V());
function Gt(t) {
  const r = B$1(t.nativeEvent, "flash");
  if (r) try {
    let e = JSON.parse(r);
    if (!e || !e.result) return;
    const n = [...e.input.slice(0, -1), new Map(e.input[e.input.length - 1])], s = e.error ? new Error(e.result) : e.result;
    return { input: n, url: e.url, pending: false, result: e.thrown ? void 0 : s, error: e.thrown ? s : void 0 };
  } catch (e) {
    console.error(e);
  } finally {
    D$2(t.nativeEvent, "flash", "", { maxAge: 0 });
  }
}
async function Vt(t) {
  const r = globalThis.MANIFEST.client;
  return globalThis.MANIFEST.ssr, t.response.headers.set("Content-Type", "text/html"), Object.assign(t, { manifest: await r.json(), assets: [...await r.inputs[r.handler].assets()], router: { submission: Gt(t) }, routes: V(), complete: false, $islands: /* @__PURE__ */ new Set() });
}
const Yt = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function L(t) {
  return t.status && Yt.has(t.status) ? t.status : 302;
}
function Qt(t, r, e = {}, n) {
  return eventHandler$1({ handler: (s) => {
    const o = ne$2(s);
    return provideRequestEvent(o, async () => {
      const a = Nt(new URL(o.request.url).pathname, o.request.method);
      if (a) {
        const m = await a.handler.import(), g = o.request.method === "HEAD" ? m.HEAD || m.GET : m[o.request.method];
        o.params = a.params || {}, sharedConfig.context = { event: o };
        const c = await g(o);
        if (c !== void 0) return c;
        if (o.request.method !== "GET") throw new Error(`API handler for ${o.request.method} "${o.request.url}" did not return a response.`);
        if (!a.isPage) return;
      }
      const i = await r(o), u = typeof e == "function" ? await e(i) : { ...e }, l = u.mode || "stream";
      if (u.nonce && (i.nonce = u.nonce), l === "sync") {
        const m = renderToString(() => (sharedConfig.context.event = i, t(i)), u);
        if (i.complete = true, i.response && i.response.headers.get("Location")) {
          const g = L(i.response);
          return z$1(s, i.response.headers.get("Location"), g);
        }
        return m;
      }
      if (u.onCompleteAll) {
        const m = u.onCompleteAll;
        u.onCompleteAll = (g) => {
          N(i)(g), m(g);
        };
      } else u.onCompleteAll = N(i);
      if (u.onCompleteShell) {
        const m = u.onCompleteShell;
        u.onCompleteShell = (g) => {
          M(i, s)(), m(g);
        };
      } else u.onCompleteShell = M(i, s);
      const b = renderToStream(() => (sharedConfig.context.event = i, t(i)), u);
      if (i.response && i.response.headers.get("Location")) {
        const m = L(i.response);
        return z$1(s, i.response.headers.get("Location"), m);
      }
      if (l === "async") return b;
      const { writable: v, readable: k } = new TransformStream();
      return b.pipeTo(v), k;
    });
  } });
}
function M(t, r) {
  return () => {
    if (t.response && t.response.headers.get("Location")) {
      const e = L(t.response);
      c(r, e), J$1(r, "Location", t.response.headers.get("Location"));
    }
  };
}
function N(t) {
  return ({ write: r }) => {
    t.complete = true;
    const e = t.response && t.response.headers.get("Location");
    e && r(`<script>window.location="${e}"<\/script>`);
  };
}
function Xt(t, r, e) {
  return Qt(t, Vt, r);
}
const Y = (t) => (r) => {
  const { base: e } = r, n = children(() => r.children), s = createMemo(() => Oe(n(), r.base || ""));
  let o;
  const a = Te(t, s, () => o, { base: e, singleFlight: r.singleFlight, transformUrl: r.transformUrl });
  return t.create && t.create(a), createComponent$1(Ee$1.Provider, { value: a, get children() {
    return createComponent$1(Zt, { routerState: a, get root() {
      return r.root;
    }, get preload() {
      return r.rootPreload || r.rootLoad;
    }, get children() {
      return [(o = getOwner()) && null, createComponent$1(te, { routerState: a, get branches() {
        return s();
      } })];
    } });
  } });
};
function Zt(t) {
  const r = t.routerState.location, e = t.routerState.params, n = createMemo(() => t.preload && untrack(() => {
    Ne(true), t.preload({ params: e, location: r, intent: He() || "initial" }), Ne(false);
  }));
  return createComponent$1(Show, { get when() {
    return t.root;
  }, keyed: true, get fallback() {
    return t.children;
  }, children: (s) => createComponent$1(s, { params: e, location: r, get data() {
    return n();
  }, get children() {
    return t.children;
  } }) });
}
function te(t) {
  if (isServer) {
    const s = getRequestEvent();
    if (s && s.router && s.router.dataOnly) {
      ee(s, t.routerState, t.branches);
      return;
    }
    s && ((s.router || (s.router = {})).matches || (s.router.matches = t.routerState.matches().map(({ route: o, path: a, params: i }) => ({ path: o.originalPath, pattern: o.pattern, match: a, params: i, info: o.info }))));
  }
  const r = [];
  let e;
  const n = createMemo(on(t.routerState.matches, (s, o, a) => {
    let i = o && s.length === o.length;
    const u = [];
    for (let l = 0, b = s.length; l < b; l++) {
      const v = o && o[l], k = s[l];
      a && v && k.route.key === v.route.key ? u[l] = a[l] : (i = false, r[l] && r[l](), createRoot((m) => {
        r[l] = m, u[l] = ke$1(t.routerState, u[l - 1] || t.routerState.base, q(() => n()[l + 1]), () => {
          var _a;
          const g = t.routerState.matches();
          return (_a = g[l]) != null ? _a : g[0];
        });
      }));
    }
    return r.splice(s.length).forEach((l) => l()), a && i ? a : (e = u[0], u);
  }));
  return q(() => n() && e)();
}
const q = (t) => () => createComponent$1(Show, { get when() {
  return t();
}, keyed: true, children: (r) => createComponent$1(te$2.Provider, { value: r, get children() {
  return r.outlet();
} }) });
function ee(t, r, e) {
  const n = new URL(t.request.url), s = M$2(e, new URL(t.router.previousUrl || t.request.url).pathname), o = M$2(e, n.pathname);
  for (let a = 0; a < o.length; a++) {
    (!s[a] || o[a].route !== s[a].route) && (t.router.dataOnly = true);
    const { route: i, params: u } = o[a];
    i.preload && i.preload({ params: u, location: r.location, intent: "preload" });
  }
}
function re([t, r], e, n) {
  return [t, n ? (s) => r(n(s)) : r];
}
function se(t) {
  let r = false;
  const e = (s) => typeof s == "string" ? { value: s } : s, n = re(createSignal(e(t.get()), { equals: (s, o) => s.value === o.value && s.state === o.state }), void 0, (s) => (!r && t.set(s), sharedConfig.registry && !sharedConfig.done && (sharedConfig.done = true), s));
  return t.init && onCleanup(t.init((s = t.get()) => {
    r = true, n[1](e(s)), r = false;
  })), Y({ signal: n, create: t.create, utils: t.utils });
}
function ne(t, r, e) {
  return t.addEventListener(r, e), () => t.removeEventListener(r, e);
}
function oe(t, r) {
  const e = t && document.getElementById(t);
  e ? e.scrollIntoView() : r && window.scrollTo(0, 0);
}
function ae(t) {
  const r = new URL(t);
  return r.pathname + r.search;
}
function ie(t) {
  let r;
  const e = { value: t.url || (r = getRequestEvent()) && ae(r.request.url) || "" };
  return Y({ signal: [() => e, (n) => Object.assign(e, n)] })(t);
}
function ce(t = true, r = false, e = "/_server", n) {
  return (s) => {
    const o = s.base.path(), a = s.navigatorFactory(s.base);
    let i, u;
    function l(c) {
      return c.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function b(c) {
      if (c.defaultPrevented || c.button !== 0 || c.metaKey || c.altKey || c.ctrlKey || c.shiftKey) return;
      const d = c.composedPath().find((D) => D instanceof Node && D.nodeName.toUpperCase() === "A");
      if (!d || r && !d.hasAttribute("link")) return;
      const f = l(d), h = f ? d.href.baseVal : d.href;
      if ((f ? d.target.baseVal : d.target) || !h && !d.hasAttribute("state")) return;
      const P = (d.getAttribute("rel") || "").split(/\s+/);
      if (d.hasAttribute("download") || P && P.includes("external")) return;
      const R = f ? new URL(h, document.baseURI) : new URL(h);
      if (!(R.origin !== window.location.origin || o && R.pathname && !R.pathname.toLowerCase().startsWith(o.toLowerCase()))) return [d, R];
    }
    function v(c) {
      const d = b(c);
      if (!d) return;
      const [f, h] = d, U = s.parsePath(h.pathname + h.search + h.hash), P = f.getAttribute("state");
      c.preventDefault(), a(U, { resolve: false, replace: f.hasAttribute("replace"), scroll: !f.hasAttribute("noscroll"), state: P ? JSON.parse(P) : void 0 });
    }
    function k(c) {
      const d = b(c);
      if (!d) return;
      const [f, h] = d;
      n && (h.pathname = n(h.pathname)), s.preloadRoute(h, f.getAttribute("preload") !== "false");
    }
    function m(c) {
      clearTimeout(i);
      const d = b(c);
      if (!d) return u = null;
      const [f, h] = d;
      u !== f && (n && (h.pathname = n(h.pathname)), i = setTimeout(() => {
        s.preloadRoute(h, f.getAttribute("preload") !== "false"), u = f;
      }, 20));
    }
    function g(c) {
      if (c.defaultPrevented) return;
      let d = c.submitter && c.submitter.hasAttribute("formaction") ? c.submitter.getAttribute("formaction") : c.target.getAttribute("action");
      if (!d) return;
      if (!d.startsWith("https://action/")) {
        const h = new URL(d, Re);
        if (d = s.parsePath(h.pathname + h.search), !d.startsWith(e)) return;
      }
      if (c.target.method.toUpperCase() !== "POST") throw new Error("Only POST forms are supported for Actions");
      const f = _.get(d);
      if (f) {
        c.preventDefault();
        const h = new FormData(c.target, c.submitter);
        f.call({ r: s, f: c.target }, c.target.enctype === "multipart/form-data" ? h : new URLSearchParams(h));
      }
    }
    delegateEvents(["click", "submit"]), document.addEventListener("click", v), t && (document.addEventListener("mousemove", m, { passive: true }), document.addEventListener("focusin", k, { passive: true }), document.addEventListener("touchstart", k, { passive: true })), document.addEventListener("submit", g), onCleanup(() => {
      document.removeEventListener("click", v), t && (document.removeEventListener("mousemove", m), document.removeEventListener("focusin", k), document.removeEventListener("touchstart", k)), document.removeEventListener("submit", g);
    });
  };
}
function ue(t) {
  if (isServer) return ie(t);
  const r = () => {
    const n = window.location.pathname.replace(/^\/+/, "/") + window.location.search, s = window.history.state && window.history.state._depth && Object.keys(window.history.state).length === 1 ? void 0 : window.history.state;
    return { value: n + window.location.hash, state: s };
  }, e = ye();
  return se({ get: r, set({ value: n, replace: s, scroll: o, state: a }) {
    s ? window.history.replaceState(Ie$1(a), "", n) : window.history.pushState(a, "", n), oe(decodeURIComponent(window.location.hash.slice(1)), o), V$1();
  }, init: (n) => ne(window, "popstate", qe(n, (s) => {
    if (s) return !e.confirm(s);
    {
      const o = r();
      return !e.confirm(o.value, { state: o.state });
    }
  })), create: ce(t.preload, t.explicitLinks, t.actionBase, t.transformUrl), utils: { go: (n) => window.history.go(n), beforeLeave: e } })(t);
}
var le = ["<div", ' class="p-4 bg-red-50 text-red-900 min-h-screen"><h1 class="text-2xl font-bold mb-2">Application Error</h1><pre class="whitespace-pre-wrap overflow-auto p-4 bg-red-100 rounded text-sm"><!--$-->', "<!--/--><!--$-->", "<!--/--></pre></div>"];
function de() {
  return createComponent$1(ue, { root: (t) => createComponent$1(I, { get children() {
    return [createComponent$1(k, { children: "SolidStart - Basic" }), createComponent$1(ErrorBoundary, { fallback: (r) => ssr(le, ssrHydrationKey(), escape(r.toString()), r.stack && `

${escape(r.stack)}`), get children() {
      return createComponent$1(Suspense, { get fallback() {
        return createComponent$1(s, {});
      }, get children() {
        return t.children;
      } });
    } })];
  } }), get children() {
    return createComponent$1(zt, {});
  } });
}
var pe = ["<span", ' style="font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;">', "</span>"], he = ["<span", ' style="font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;">500 | Internal Server Error</span>'];
const me = (t) => {
  const r = isServer ? "500 | Internal Server Error" : "Error | Uncaught Client Exception";
  return createComponent$1(ErrorBoundary, { fallback: (e) => (console.error(e), [ssr(pe, ssrHydrationKey(), escape(r)), createComponent$1(u, { code: 500 })]), get children() {
    return t.children;
  } });
}, fe = (t) => {
  let r = false;
  const e = catchError(() => t.children, (n) => {
    console.error(n), r = !!n;
  });
  return r ? [ssr(he, ssrHydrationKey()), createComponent$1(u, { code: 500 })] : e;
};
var B = ["<script", ">", "<\/script>"], ge = ["<script", ' type="module"', " async", "><\/script>"], be = ["<script", ' type="module" async', "><\/script>"];
const we = ssr("<!DOCTYPE html>");
function Q(t, r, e = []) {
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (s.path !== t[0].path) continue;
    let o = [...e, s];
    if (s.children) {
      const a = t.slice(1);
      if (a.length === 0 || (o = Q(a, s.children, o), !o)) continue;
    }
    return o;
  }
}
function $e(t) {
  const r = getRequestEvent(), e = r.nonce;
  let n = [];
  return Promise.resolve().then(async () => {
    let s = [];
    if (r.router && r.router.matches) {
      const o = [...r.router.matches];
      for (; o.length && (!o[0].info || !o[0].info.filesystem); ) o.shift();
      const a = o.length && Q(o, r.routes);
      if (a) {
        const i = globalThis.MANIFEST.client.inputs;
        for (let u = 0; u < a.length; u++) {
          const l = a[u], b = i[l.$component.src];
          s.push(b.assets());
        }
      }
    }
    n = await Promise.all(s).then((o) => [...new Map(o.flat().map((a) => [a.attrs.key, a])).values()].filter((a) => a.attrs.rel === "modulepreload" && !r.assets.find((i) => i.attrs.key === a.attrs.key)));
  }), useAssets(() => n.length ? n.map((s) => A(s)) : void 0), createComponent$1(NoHydration, { get children() {
    return [we, createComponent$1(fe, { get children() {
      return createComponent$1(t.document, { get assets() {
        return [createComponent$1(HydrationScript, {}), r.assets.map((s) => A(s, e))];
      }, get scripts() {
        return e ? [ssr(B, ssrHydrationKey() + ssrAttribute("nonce", escape(e, true), false), `window.manifest = ${JSON.stringify(r.manifest)}`), ssr(ge, ssrHydrationKey(), ssrAttribute("nonce", escape(e, true), false), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))] : [ssr(B, ssrHydrationKey(), `window.manifest = ${JSON.stringify(r.manifest)}`), ssr(be, ssrHydrationKey(), ssrAttribute("src", escape(globalThis.MANIFEST.client.inputs[globalThis.MANIFEST.client.handler].output.path, true), false))];
      }, get children() {
        return createComponent$1(Hydration, { get children() {
          return createComponent$1(me, { get children() {
            return createComponent$1(de, {});
          } });
        } });
      } });
    } })];
  } });
}
var ke = ['<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="/favicon.ico">', "</head>"], Ee = ["<html", ' lang="en">', '<body><div id="app">', "</div><!--$-->", "<!--/--></body></html>"];
const Ie = Xt(() => createComponent$1($e, { document: ({ assets: t, children: r, scripts: e }) => ssr(Ee, ssrHydrationKey(), createComponent$1(NoHydration, { get children() {
  return ssr(ke, escape(t));
} }), escape(r), escape(e)) }));

const handlers = [
  { route: '/_server', handler: He$1, lazy: false, middleware: true, method: undefined },
  { route: '/', handler: Ie, lazy: false, middleware: true, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b$4(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C$1(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  {
    const _handler = h3App.handler;
    h3App.handler = (event) => {
      const ctx = { event };
      return nitroAsyncContext.callAsync(ctx, () => _handler(event));
    };
  }
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const ISR_URL_PARAM = "__isr_route";

const nitroApp = useNitroApp();
const handler = toNodeListener(nitroApp.h3App);
const listener = function(req, res) {
  const isrRoute = req.headers["x-now-route-matches"];
  if (isrRoute) {
    const { [ISR_URL_PARAM]: url } = parseQuery(isrRoute);
    if (url && typeof url === "string") {
      const routeRules = getRouteRulesForPath(url);
      if (routeRules.isr) {
        req.url = url;
      }
    }
  } else {
    const queryIndex = req.url.indexOf("?");
    const urlQueryIndex = queryIndex === -1 ? -1 : req.url.indexOf(`${ISR_URL_PARAM}=`, queryIndex);
    if (urlQueryIndex !== -1) {
      const { [ISR_URL_PARAM]: url, ...params } = parseQuery(
        req.url.slice(queryIndex)
      );
      if (url && typeof url === "string") {
        const routeRules = getRouteRulesForPath(url);
        if (routeRules.isr) {
          req.url = withQuery(url, params);
        }
      }
    }
  }
  return handler(req, res);
};

export { $e$1 as $, Ae$1 as A, B$2 as B, D$3 as D, G$3 as G, L$1 as L, Me as M, Ue as U, We as W, s as a, se$1 as b, De as c, x as d, B$1 as e, G$2 as f, D$2 as g, fetchEventCIpVWTXg as h, fetchEventOIVSvjBj as i, k, listener as l, re$1 as r, se$2 as s, te$1 as t, u, x$1 as x, ze as z };
//# sourceMappingURL=nitro.mjs.map
