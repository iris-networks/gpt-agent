(function() {
	const o = document.createElement("link").relList;
	if (o && o.supports && o.supports("modulepreload")) return;
	for (const d of document.querySelectorAll('link[rel="modulepreload"]')) r(d);
	new MutationObserver(d => {
		for (const g of d)
			if (g.type === "childList")
				for (const h of g.addedNodes) h.tagName === "LINK" && h.rel === "modulepreload" && r(h)
	}).observe(document, {
		childList: !0,
		subtree: !0
	});

	function s(d) {
		const g = {};
		return d.integrity && (g.integrity = d.integrity), d.referrerPolicy && (g.referrerPolicy = d.referrerPolicy), d.crossOrigin === "use-credentials" ? g.credentials = "include" : d.crossOrigin === "anonymous" ? g.credentials = "omit" : g.credentials = "same-origin", g
	}

	function r(d) {
		if (d.ep) return;
		d.ep = !0;
		const g = s(d);
		fetch(d.href, g)
	}
})();

function ms(i) {
	return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i
}
var Pr = {
		exports: {}
	},
	Yn = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var V0;

function $1() {
	if (V0) return Yn;
	V0 = 1;
	var i = Symbol.for("react.transitional.element"),
		o = Symbol.for("react.fragment");

	function s(r, d, g) {
		var h = null;
		if (g !== void 0 && (h = "" + g), d.key !== void 0 && (h = "" + d.key), "key" in d) {
			g = {};
			for (var T in d) T !== "key" && (g[T] = d[T])
		} else g = d;
		return d = g.ref, {
			$$typeof: i,
			type: r,
			key: h,
			ref: d !== void 0 ? d : null,
			props: g
		}
	}
	return Yn.Fragment = o, Yn.jsx = s, Yn.jsxs = s, Yn
}
var Y0;

function W1() {
	return Y0 || (Y0 = 1, Pr.exports = $1()), Pr.exports
}
var p = W1(),
	Xr = {
		exports: {}
	},
	re = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var q0;

function em() {
	if (q0) return re;
	q0 = 1;
	var i = Symbol.for("react.transitional.element"),
		o = Symbol.for("react.portal"),
		s = Symbol.for("react.fragment"),
		r = Symbol.for("react.strict_mode"),
		d = Symbol.for("react.profiler"),
		g = Symbol.for("react.consumer"),
		h = Symbol.for("react.context"),
		T = Symbol.for("react.forward_ref"),
		A = Symbol.for("react.suspense"),
		v = Symbol.for("react.memo"),
		C = Symbol.for("react.lazy"),
		y = Symbol.iterator;

	function j(S) {
		return S === null || typeof S != "object" ? null : (S = y && S[y] || S["@@iterator"], typeof S == "function" ? S : null)
	}
	var R = {
			isMounted: function() {
				return !1
			},
			enqueueForceUpdate: function() {},
			enqueueReplaceState: function() {},
			enqueueSetState: function() {}
		},
		J = Object.assign,
		ie = {};

	function oe(S, U, Y) {
		this.props = S, this.context = U, this.refs = ie, this.updater = Y || R
	}
	oe.prototype.isReactComponent = {}, oe.prototype.setState = function(S, U) {
		if (typeof S != "object" && typeof S != "function" && S != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, S, U, "setState")
	}, oe.prototype.forceUpdate = function(S) {
		this.updater.enqueueForceUpdate(this, S, "forceUpdate")
	};

	function Ne() {}
	Ne.prototype = oe.prototype;

	function ue(S, U, Y) {
		this.props = S, this.context = U, this.refs = ie, this.updater = Y || R
	}
	var _e = ue.prototype = new Ne;
	_e.constructor = ue, J(_e, oe.prototype), _e.isPureReactComponent = !0;
	var al = Array.isArray,
		fe = {
			H: null,
			A: null,
			T: null,
			S: null,
			V: null
		},
		Re = Object.prototype.hasOwnProperty;

	function Pe(S, U, Y, V, Q, pe) {
		return Y = pe.ref, {
			$$typeof: i,
			type: S,
			key: U,
			ref: Y !== void 0 ? Y : null,
			props: pe
		}
	}

	function $(S, U) {
		return Pe(S.type, U, void 0, void 0, void 0, S.props)
	}

	function ge(S) {
		return typeof S == "object" && S !== null && S.$$typeof === i
	}

	function Xe(S) {
		var U = {
			"=": "=0",
			":": "=2"
		};
		return "$" + S.replace(/[=:]/g, function(Y) {
			return U[Y]
		})
	}
	var Ze = /\/+/g;

	function we(S, U) {
		return typeof S == "object" && S !== null && S.key != null ? Xe("" + S.key) : U.toString(36)
	}

	function ft() {}

	function Rl(S) {
		switch (S.status) {
			case "fulfilled":
				return S.value;
			case "rejected":
				throw S.reason;
			default:
				switch (typeof S.status == "string" ? S.then(ft, ft) : (S.status = "pending", S.then(function(U) {
						S.status === "pending" && (S.status = "fulfilled", S.value = U)
					}, function(U) {
						S.status === "pending" && (S.status = "rejected", S.reason = U)
					})), S.status) {
					case "fulfilled":
						return S.value;
					case "rejected":
						throw S.reason
				}
		}
		throw S
	}

	function We(S, U, Y, V, Q) {
		var pe = typeof S;
		(pe === "undefined" || pe === "boolean") && (S = null);
		var ne = !1;
		if (S === null) ne = !0;
		else switch (pe) {
			case "bigint":
			case "string":
			case "number":
				ne = !0;
				break;
			case "object":
				switch (S.$$typeof) {
					case i:
					case o:
						ne = !0;
						break;
					case C:
						return ne = S._init, We(ne(S._payload), U, Y, V, Q)
				}
		}
		if (ne) return Q = Q(S), ne = V === "" ? "." + we(S, 0) : V, al(Q) ? (Y = "", ne != null && (Y = ne.replace(Ze, "$&/") + "/"), We(Q, U, Y, "", function(Nl) {
			return Nl
		})) : Q != null && (ge(Q) && (Q = $(Q, Y + (Q.key == null || S && S.key === Q.key ? "" : ("" + Q.key).replace(Ze, "$&/") + "/") + ne)), U.push(Q)), 1;
		ne = 0;
		var il = V === "" ? "." : V + ":";
		if (al(S))
			for (var Be = 0; Be < S.length; Be++) V = S[Be], pe = il + we(V, Be), ne += We(V, U, Y, pe, Q);
		else if (Be = j(S), typeof Be == "function")
			for (S = Be.call(S), Be = 0; !(V = S.next()).done;) V = V.value, pe = il + we(V, Be++), ne += We(V, U, Y, pe, Q);
		else if (pe === "object") {
			if (typeof S.then == "function") return We(Rl(S), U, Y, V, Q);
			throw U = String(S), Error("Objects are not valid as a React child (found: " + (U === "[object Object]" ? "object with keys {" + Object.keys(S).join(", ") + "}" : U) + "). If you meant to render a collection of children, use an array instead.")
		}
		return ne
	}

	function N(S, U, Y) {
		if (S == null) return S;
		var V = [],
			Q = 0;
		return We(S, V, "", "", function(pe) {
			return U.call(Y, pe, Q++)
		}), V
	}

	function F(S) {
		if (S._status === -1) {
			var U = S._result;
			U = U(), U.then(function(Y) {
				(S._status === 0 || S._status === -1) && (S._status = 1, S._result = Y)
			}, function(Y) {
				(S._status === 0 || S._status === -1) && (S._status = 2, S._result = Y)
			}), S._status === -1 && (S._status = 0, S._result = U)
		}
		if (S._status === 1) return S._result.default;
		throw S._result
	}
	var X = typeof reportError == "function" ? reportError : function(S) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var U = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof S == "object" && S !== null && typeof S.message == "string" ? String(S.message) : String(S),
				error: S
			});
			if (!window.dispatchEvent(U)) return
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", S);
			return
		}
		console.error(S)
	};

	function ve() {}
	return re.Children = {
		map: N,
		forEach: function(S, U, Y) {
			N(S, function() {
				U.apply(this, arguments)
			}, Y)
		},
		count: function(S) {
			var U = 0;
			return N(S, function() {
				U++
			}), U
		},
		toArray: function(S) {
			return N(S, function(U) {
				return U
			}) || []
		},
		only: function(S) {
			if (!ge(S)) throw Error("React.Children.only expected to receive a single React element child.");
			return S
		}
	}, re.Component = oe, re.Fragment = s, re.Profiler = d, re.PureComponent = ue, re.StrictMode = r, re.Suspense = A, re.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = fe, re.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(S) {
			return fe.H.useMemoCache(S)
		}
	}, re.cache = function(S) {
		return function() {
			return S.apply(null, arguments)
		}
	}, re.cloneElement = function(S, U, Y) {
		if (S == null) throw Error("The argument must be a React element, but you passed " + S + ".");
		var V = J({}, S.props),
			Q = S.key,
			pe = void 0;
		if (U != null)
			for (ne in U.ref !== void 0 && (pe = void 0), U.key !== void 0 && (Q = "" + U.key), U) !Re.call(U, ne) || ne === "key" || ne === "__self" || ne === "__source" || ne === "ref" && U.ref === void 0 || (V[ne] = U[ne]);
		var ne = arguments.length - 2;
		if (ne === 1) V.children = Y;
		else if (1 < ne) {
			for (var il = Array(ne), Be = 0; Be < ne; Be++) il[Be] = arguments[Be + 2];
			V.children = il
		}
		return Pe(S.type, Q, void 0, void 0, pe, V)
	}, re.createContext = function(S) {
		return S = {
			$$typeof: h,
			_currentValue: S,
			_currentValue2: S,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, S.Provider = S, S.Consumer = {
			$$typeof: g,
			_context: S
		}, S
	}, re.createElement = function(S, U, Y) {
		var V, Q = {},
			pe = null;
		if (U != null)
			for (V in U.key !== void 0 && (pe = "" + U.key), U) Re.call(U, V) && V !== "key" && V !== "__self" && V !== "__source" && (Q[V] = U[V]);
		var ne = arguments.length - 2;
		if (ne === 1) Q.children = Y;
		else if (1 < ne) {
			for (var il = Array(ne), Be = 0; Be < ne; Be++) il[Be] = arguments[Be + 2];
			Q.children = il
		}
		if (S && S.defaultProps)
			for (V in ne = S.defaultProps, ne) Q[V] === void 0 && (Q[V] = ne[V]);
		return Pe(S, pe, void 0, void 0, null, Q)
	}, re.createRef = function() {
		return {
			current: null
		}
	}, re.forwardRef = function(S) {
		return {
			$$typeof: T,
			render: S
		}
	}, re.isValidElement = ge, re.lazy = function(S) {
		return {
			$$typeof: C,
			_payload: {
				_status: -1,
				_result: S
			},
			_init: F
		}
	}, re.memo = function(S, U) {
		return {
			$$typeof: v,
			type: S,
			compare: U === void 0 ? null : U
		}
	}, re.startTransition = function(S) {
		var U = fe.T,
			Y = {};
		fe.T = Y;
		try {
			var V = S(),
				Q = fe.S;
			Q !== null && Q(Y, V), typeof V == "object" && V !== null && typeof V.then == "function" && V.then(ve, X)
		} catch (pe) {
			X(pe)
		} finally {
			fe.T = U
		}
	}, re.unstable_useCacheRefresh = function() {
		return fe.H.useCacheRefresh()
	}, re.use = function(S) {
		return fe.H.use(S)
	}, re.useActionState = function(S, U, Y) {
		return fe.H.useActionState(S, U, Y)
	}, re.useCallback = function(S, U) {
		return fe.H.useCallback(S, U)
	}, re.useContext = function(S) {
		return fe.H.useContext(S)
	}, re.useDebugValue = function() {}, re.useDeferredValue = function(S, U) {
		return fe.H.useDeferredValue(S, U)
	}, re.useEffect = function(S, U, Y) {
		var V = fe.H;
		if (typeof Y == "function") throw Error("useEffect CRUD overload is not enabled in this build of React.");
		return V.useEffect(S, U)
	}, re.useId = function() {
		return fe.H.useId()
	}, re.useImperativeHandle = function(S, U, Y) {
		return fe.H.useImperativeHandle(S, U, Y)
	}, re.useInsertionEffect = function(S, U) {
		return fe.H.useInsertionEffect(S, U)
	}, re.useLayoutEffect = function(S, U) {
		return fe.H.useLayoutEffect(S, U)
	}, re.useMemo = function(S, U) {
		return fe.H.useMemo(S, U)
	}, re.useOptimistic = function(S, U) {
		return fe.H.useOptimistic(S, U)
	}, re.useReducer = function(S, U, Y) {
		return fe.H.useReducer(S, U, Y)
	}, re.useRef = function(S) {
		return fe.H.useRef(S)
	}, re.useState = function(S) {
		return fe.H.useState(S)
	}, re.useSyncExternalStore = function(S, U, Y) {
		return fe.H.useSyncExternalStore(S, U, Y)
	}, re.useTransition = function() {
		return fe.H.useTransition()
	}, re.version = "19.1.0", re
}
var K0;

function gs() {
	return K0 || (K0 = 1, Xr.exports = em()), Xr.exports
}
var w = gs();
const lm = ms(w);
var Zr = {
		exports: {}
	},
	qn = {},
	Ir = {
		exports: {}
	},
	Jr = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Q0;

function tm() {
	return Q0 || (Q0 = 1, function(i) {
		function o(N, F) {
			var X = N.length;
			N.push(F);
			e: for (; 0 < X;) {
				var ve = X - 1 >>> 1,
					S = N[ve];
				if (0 < d(S, F)) N[ve] = F, N[X] = S, X = ve;
				else break e
			}
		}

		function s(N) {
			return N.length === 0 ? null : N[0]
		}

		function r(N) {
			if (N.length === 0) return null;
			var F = N[0],
				X = N.pop();
			if (X !== F) {
				N[0] = X;
				e: for (var ve = 0, S = N.length, U = S >>> 1; ve < U;) {
					var Y = 2 * (ve + 1) - 1,
						V = N[Y],
						Q = Y + 1,
						pe = N[Q];
					if (0 > d(V, X)) Q < S && 0 > d(pe, V) ? (N[ve] = pe, N[Q] = X, ve = Q) : (N[ve] = V, N[Y] = X, ve = Y);
					else if (Q < S && 0 > d(pe, X)) N[ve] = pe, N[Q] = X, ve = Q;
					else break e
				}
			}
			return F
		}

		function d(N, F) {
			var X = N.sortIndex - F.sortIndex;
			return X !== 0 ? X : N.id - F.id
		}
		if (i.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
			var g = performance;
			i.unstable_now = function() {
				return g.now()
			}
		} else {
			var h = Date,
				T = h.now();
			i.unstable_now = function() {
				return h.now() - T
			}
		}
		var A = [],
			v = [],
			C = 1,
			y = null,
			j = 3,
			R = !1,
			J = !1,
			ie = !1,
			oe = !1,
			Ne = typeof setTimeout == "function" ? setTimeout : null,
			ue = typeof clearTimeout == "function" ? clearTimeout : null,
			_e = typeof setImmediate < "u" ? setImmediate : null;

		function al(N) {
			for (var F = s(v); F !== null;) {
				if (F.callback === null) r(v);
				else if (F.startTime <= N) r(v), F.sortIndex = F.expirationTime, o(A, F);
				else break;
				F = s(v)
			}
		}

		function fe(N) {
			if (ie = !1, al(N), !J)
				if (s(A) !== null) J = !0, Re || (Re = !0, we());
				else {
					var F = s(v);
					F !== null && We(fe, F.startTime - N)
				}
		}
		var Re = !1,
			Pe = -1,
			$ = 5,
			ge = -1;

		function Xe() {
			return oe ? !0 : !(i.unstable_now() - ge < $)
		}

		function Ze() {
			if (oe = !1, Re) {
				var N = i.unstable_now();
				ge = N;
				var F = !0;
				try {
					e: {
						J = !1,
						ie && (ie = !1, ue(Pe), Pe = -1),
						R = !0;
						var X = j;
						try {
							l: {
								for (al(N), y = s(A); y !== null && !(y.expirationTime > N && Xe());) {
									var ve = y.callback;
									if (typeof ve == "function") {
										y.callback = null, j = y.priorityLevel;
										var S = ve(y.expirationTime <= N);
										if (N = i.unstable_now(), typeof S == "function") {
											y.callback = S, al(N), F = !0;
											break l
										}
										y === s(A) && r(A), al(N)
									} else r(A);
									y = s(A)
								}
								if (y !== null) F = !0;
								else {
									var U = s(v);
									U !== null && We(fe, U.startTime - N), F = !1
								}
							}
							break e
						}
						finally {
							y = null, j = X, R = !1
						}
						F = void 0
					}
				}
				finally {
					F ? we() : Re = !1
				}
			}
		}
		var we;
		if (typeof _e == "function") we = function() {
			_e(Ze)
		};
		else if (typeof MessageChannel < "u") {
			var ft = new MessageChannel,
				Rl = ft.port2;
			ft.port1.onmessage = Ze, we = function() {
				Rl.postMessage(null)
			}
		} else we = function() {
			Ne(Ze, 0)
		};

		function We(N, F) {
			Pe = Ne(function() {
				N(i.unstable_now())
			}, F)
		}
		i.unstable_IdlePriority = 5, i.unstable_ImmediatePriority = 1, i.unstable_LowPriority = 4, i.unstable_NormalPriority = 3, i.unstable_Profiling = null, i.unstable_UserBlockingPriority = 2, i.unstable_cancelCallback = function(N) {
			N.callback = null
		}, i.unstable_forceFrameRate = function(N) {
			0 > N || 125 < N ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : $ = 0 < N ? Math.floor(1e3 / N) : 5
		}, i.unstable_getCurrentPriorityLevel = function() {
			return j
		}, i.unstable_next = function(N) {
			switch (j) {
				case 1:
				case 2:
				case 3:
					var F = 3;
					break;
				default:
					F = j
			}
			var X = j;
			j = F;
			try {
				return N()
			} finally {
				j = X
			}
		}, i.unstable_requestPaint = function() {
			oe = !0
		}, i.unstable_runWithPriority = function(N, F) {
			switch (N) {
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
					break;
				default:
					N = 3
			}
			var X = j;
			j = N;
			try {
				return F()
			} finally {
				j = X
			}
		}, i.unstable_scheduleCallback = function(N, F, X) {
			var ve = i.unstable_now();
			switch (typeof X == "object" && X !== null ? (X = X.delay, X = typeof X == "number" && 0 < X ? ve + X : ve) : X = ve, N) {
				case 1:
					var S = -1;
					break;
				case 2:
					S = 250;
					break;
				case 5:
					S = 1073741823;
					break;
				case 4:
					S = 1e4;
					break;
				default:
					S = 5e3
			}
			return S = X + S, N = {
				id: C++,
				callback: F,
				priorityLevel: N,
				startTime: X,
				expirationTime: S,
				sortIndex: -1
			}, X > ve ? (N.sortIndex = X, o(v, N), s(A) === null && N === s(v) && (ie ? (ue(Pe), Pe = -1) : ie = !0, We(fe, X - ve))) : (N.sortIndex = S, o(A, N), J || R || (J = !0, Re || (Re = !0, we()))), N
		}, i.unstable_shouldYield = Xe, i.unstable_wrapCallback = function(N) {
			var F = j;
			return function() {
				var X = j;
				j = F;
				try {
					return N.apply(this, arguments)
				} finally {
					j = X
				}
			}
		}
	}(Jr)), Jr
}
var P0;

function am() {
	return P0 || (P0 = 1, Ir.exports = tm()), Ir.exports
}
var $r = {
		exports: {}
	},
	yl = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var X0;

function im() {
	if (X0) return yl;
	X0 = 1;
	var i = gs();

	function o(A) {
		var v = "https://react.dev/errors/" + A;
		if (1 < arguments.length) {
			v += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var C = 2; C < arguments.length; C++) v += "&args[]=" + encodeURIComponent(arguments[C])
		}
		return "Minified React error #" + A + "; visit " + v + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
	}

	function s() {}
	var r = {
			d: {
				f: s,
				r: function() {
					throw Error(o(522))
				},
				D: s,
				C: s,
				L: s,
				m: s,
				X: s,
				S: s,
				M: s
			},
			p: 0,
			findDOMNode: null
		},
		d = Symbol.for("react.portal");

	function g(A, v, C) {
		var y = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: d,
			key: y == null ? null : "" + y,
			children: A,
			containerInfo: v,
			implementation: C
		}
	}
	var h = i.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

	function T(A, v) {
		if (A === "font") return "";
		if (typeof v == "string") return v === "use-credentials" ? v : ""
	}
	return yl.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = r, yl.createPortal = function(A, v) {
		var C = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!v || v.nodeType !== 1 && v.nodeType !== 9 && v.nodeType !== 11) throw Error(o(299));
		return g(A, v, null, C)
	}, yl.flushSync = function(A) {
		var v = h.T,
			C = r.p;
		try {
			if (h.T = null, r.p = 2, A) return A()
		} finally {
			h.T = v, r.p = C, r.d.f()
		}
	}, yl.preconnect = function(A, v) {
		typeof A == "string" && (v ? (v = v.crossOrigin, v = typeof v == "string" ? v === "use-credentials" ? v : "" : void 0) : v = null, r.d.C(A, v))
	}, yl.prefetchDNS = function(A) {
		typeof A == "string" && r.d.D(A)
	}, yl.preinit = function(A, v) {
		if (typeof A == "string" && v && typeof v.as == "string") {
			var C = v.as,
				y = T(C, v.crossOrigin),
				j = typeof v.integrity == "string" ? v.integrity : void 0,
				R = typeof v.fetchPriority == "string" ? v.fetchPriority : void 0;
			C === "style" ? r.d.S(A, typeof v.precedence == "string" ? v.precedence : void 0, {
				crossOrigin: y,
				integrity: j,
				fetchPriority: R
			}) : C === "script" && r.d.X(A, {
				crossOrigin: y,
				integrity: j,
				fetchPriority: R,
				nonce: typeof v.nonce == "string" ? v.nonce : void 0
			})
		}
	}, yl.preinitModule = function(A, v) {
		if (typeof A == "string")
			if (typeof v == "object" && v !== null) {
				if (v.as == null || v.as === "script") {
					var C = T(v.as, v.crossOrigin);
					r.d.M(A, {
						crossOrigin: C,
						integrity: typeof v.integrity == "string" ? v.integrity : void 0,
						nonce: typeof v.nonce == "string" ? v.nonce : void 0
					})
				}
			} else v == null && r.d.M(A)
	}, yl.preload = function(A, v) {
		if (typeof A == "string" && typeof v == "object" && v !== null && typeof v.as == "string") {
			var C = v.as,
				y = T(C, v.crossOrigin);
			r.d.L(A, C, {
				crossOrigin: y,
				integrity: typeof v.integrity == "string" ? v.integrity : void 0,
				nonce: typeof v.nonce == "string" ? v.nonce : void 0,
				type: typeof v.type == "string" ? v.type : void 0,
				fetchPriority: typeof v.fetchPriority == "string" ? v.fetchPriority : void 0,
				referrerPolicy: typeof v.referrerPolicy == "string" ? v.referrerPolicy : void 0,
				imageSrcSet: typeof v.imageSrcSet == "string" ? v.imageSrcSet : void 0,
				imageSizes: typeof v.imageSizes == "string" ? v.imageSizes : void 0,
				media: typeof v.media == "string" ? v.media : void 0
			})
		}
	}, yl.preloadModule = function(A, v) {
		if (typeof A == "string")
			if (v) {
				var C = T(v.as, v.crossOrigin);
				r.d.m(A, {
					as: typeof v.as == "string" && v.as !== "script" ? v.as : void 0,
					crossOrigin: C,
					integrity: typeof v.integrity == "string" ? v.integrity : void 0
				})
			} else r.d.m(A)
	}, yl.requestFormReset = function(A) {
		r.d.r(A)
	}, yl.unstable_batchedUpdates = function(A, v) {
		return A(v)
	}, yl.useFormState = function(A, v, C) {
		return h.H.useFormState(A, v, C)
	}, yl.useFormStatus = function() {
		return h.H.useHostTransitionStatus()
	}, yl.version = "19.1.0", yl
}
var Z0;

function Sp() {
	if (Z0) return $r.exports;
	Z0 = 1;

	function i() {
		if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(i)
		} catch (o) {
			console.error(o)
		}
	}
	return i(), $r.exports = im(), $r.exports
}
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var I0;

function nm() {
	if (I0) return qn;
	I0 = 1;
	var i = am(),
		o = gs(),
		s = Sp();

	function r(e) {
		var l = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			l += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var t = 2; t < arguments.length; t++) l += "&args[]=" + encodeURIComponent(arguments[t])
		}
		return "Minified React error #" + e + "; visit " + l + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
	}

	function d(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11)
	}

	function g(e) {
		var l = e,
			t = e;
		if (e.alternate)
			for (; l.return;) l = l.return;
		else {
			e = l;
			do l = e, (l.flags & 4098) !== 0 && (t = l.return), e = l.return; while (e)
		}
		return l.tag === 3 ? t : null
	}

	function h(e) {
		if (e.tag === 13) {
			var l = e.memoizedState;
			if (l === null && (e = e.alternate, e !== null && (l = e.memoizedState)), l !== null) return l.dehydrated
		}
		return null
	}

	function T(e) {
		if (g(e) !== e) throw Error(r(188))
	}

	function A(e) {
		var l = e.alternate;
		if (!l) {
			if (l = g(e), l === null) throw Error(r(188));
			return l !== e ? null : e
		}
		for (var t = e, a = l;;) {
			var n = t.return;
			if (n === null) break;
			var u = n.alternate;
			if (u === null) {
				if (a = n.return, a !== null) {
					t = a;
					continue
				}
				break
			}
			if (n.child === u.child) {
				for (u = n.child; u;) {
					if (u === t) return T(n), e;
					if (u === a) return T(n), l;
					u = u.sibling
				}
				throw Error(r(188))
			}
			if (t.return !== a.return) t = n, a = u;
			else {
				for (var c = !1, f = n.child; f;) {
					if (f === t) {
						c = !0, t = n, a = u;
						break
					}
					if (f === a) {
						c = !0, a = n, t = u;
						break
					}
					f = f.sibling
				}
				if (!c) {
					for (f = u.child; f;) {
						if (f === t) {
							c = !0, t = u, a = n;
							break
						}
						if (f === a) {
							c = !0, a = u, t = n;
							break
						}
						f = f.sibling
					}
					if (!c) throw Error(r(189))
				}
			}
			if (t.alternate !== a) throw Error(r(190))
		}
		if (t.tag !== 3) throw Error(r(188));
		return t.stateNode.current === t ? e : l
	}

	function v(e) {
		var l = e.tag;
		if (l === 5 || l === 26 || l === 27 || l === 6) return e;
		for (e = e.child; e !== null;) {
			if (l = v(e), l !== null) return l;
			e = e.sibling
		}
		return null
	}
	var C = Object.assign,
		y = Symbol.for("react.element"),
		j = Symbol.for("react.transitional.element"),
		R = Symbol.for("react.portal"),
		J = Symbol.for("react.fragment"),
		ie = Symbol.for("react.strict_mode"),
		oe = Symbol.for("react.profiler"),
		Ne = Symbol.for("react.provider"),
		ue = Symbol.for("react.consumer"),
		_e = Symbol.for("react.context"),
		al = Symbol.for("react.forward_ref"),
		fe = Symbol.for("react.suspense"),
		Re = Symbol.for("react.suspense_list"),
		Pe = Symbol.for("react.memo"),
		$ = Symbol.for("react.lazy"),
		ge = Symbol.for("react.activity"),
		Xe = Symbol.for("react.memo_cache_sentinel"),
		Ze = Symbol.iterator;

	function we(e) {
		return e === null || typeof e != "object" ? null : (e = Ze && e[Ze] || e["@@iterator"], typeof e == "function" ? e : null)
	}
	var ft = Symbol.for("react.client.reference");

	function Rl(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === ft ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case J:
				return "Fragment";
			case oe:
				return "Profiler";
			case ie:
				return "StrictMode";
			case fe:
				return "Suspense";
			case Re:
				return "SuspenseList";
			case ge:
				return "Activity"
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case R:
				return "Portal";
			case _e:
				return (e.displayName || "Context") + ".Provider";
			case ue:
				return (e._context.displayName || "Context") + ".Consumer";
			case al:
				var l = e.render;
				return e = e.displayName, e || (e = l.displayName || l.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
			case Pe:
				return l = e.displayName || null, l !== null ? l : Rl(e.type) || "Memo";
			case $:
				l = e._payload, e = e._init;
				try {
					return Rl(e(l))
				} catch {}
		}
		return null
	}
	var We = Array.isArray,
		N = o.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
		F = s.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
		X = {
			pending: !1,
			data: null,
			method: null,
			action: null
		},
		ve = [],
		S = -1;

	function U(e) {
		return {
			current: e
		}
	}

	function Y(e) {
		0 > S || (e.current = ve[S], ve[S] = null, S--)
	}

	function V(e, l) {
		S++, ve[S] = e.current, e.current = l
	}
	var Q = U(null),
		pe = U(null),
		ne = U(null),
		il = U(null);

	function Be(e, l) {
		switch (V(ne, l), V(pe, e), V(Q, null), l.nodeType) {
			case 9:
			case 11:
				e = (e = l.documentElement) && (e = e.namespaceURI) ? g0(e) : 0;
				break;
			default:
				if (e = l.tagName, l = l.namespaceURI) l = g0(l), e = b0(l, e);
				else switch (e) {
					case "svg":
						e = 1;
						break;
					case "math":
						e = 2;
						break;
					default:
						e = 0
				}
		}
		Y(Q), V(Q, e)
	}

	function Nl() {
		Y(Q), Y(pe), Y(ne)
	}

	function Gi(e) {
		e.memoizedState !== null && V(il, e);
		var l = Q.current,
			t = b0(l, e.type);
		l !== t && (V(pe, e), V(Q, t))
	}

	function dt(e) {
		pe.current === e && (Y(Q), Y(pe)), il.current === e && (Y(il), Gn._currentValue = X)
	}
	var Ri = Object.prototype.hasOwnProperty,
		Ya = i.unstable_scheduleCallback,
		wi = i.unstable_cancelCallback,
		tu = i.unstable_shouldYield,
		Ro = i.unstable_requestPaint,
		Al = i.unstable_now,
		wo = i.unstable_getCurrentPriorityLevel,
		qa = i.unstable_ImmediatePriority,
		au = i.unstable_UserBlockingPriority,
		zt = i.unstable_NormalPriority,
		Fo = i.unstable_LowPriority,
		Ka = i.unstable_IdlePriority,
		Vo = i.log,
		iu = i.unstable_setDisableYieldValue,
		_t = null,
		gl = null;

	function Wl(e) {
		if (typeof Vo == "function" && iu(e), gl && typeof gl.setStrictMode == "function") try {
			gl.setStrictMode(_t, e)
		} catch {}
	}
	var cl = Math.clz32 ? Math.clz32 : uu,
		nu = Math.log,
		Fi = Math.LN2;

	function uu(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (nu(e) / Fi | 0) | 0
	}
	var Ut = 256,
		ba = 4194304;

	function Pl(e) {
		var l = e & 42;
		if (l !== 0) return l;
		switch (e & -e) {
			case 1:
				return 1;
			case 2:
				return 2;
			case 4:
				return 4;
			case 8:
				return 8;
			case 16:
				return 16;
			case 32:
				return 32;
			case 64:
				return 64;
			case 128:
				return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
				return e & 4194048;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				return e & 62914560;
			case 67108864:
				return 67108864;
			case 134217728:
				return 134217728;
			case 268435456:
				return 268435456;
			case 536870912:
				return 536870912;
			case 1073741824:
				return 0;
			default:
				return e
		}
	}

	function Ht(e, l, t) {
		var a = e.pendingLanes;
		if (a === 0) return 0;
		var n = 0,
			u = e.suspendedLanes,
			c = e.pingedLanes;
		e = e.warmLanes;
		var f = a & 134217727;
		return f !== 0 ? (a = f & ~u, a !== 0 ? n = Pl(a) : (c &= f, c !== 0 ? n = Pl(c) : t || (t = f & ~e, t !== 0 && (n = Pl(t))))) : (f = a & ~u, f !== 0 ? n = Pl(f) : c !== 0 ? n = Pl(c) : t || (t = a & ~e, t !== 0 && (n = Pl(t)))), n === 0 ? 0 : l !== 0 && l !== n && (l & u) === 0 && (u = n & -n, t = l & -l, u >= t || u === 32 && (t & 4194048) !== 0) ? l : n
	}

	function va(e, l) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & l) === 0
	}

	function ou(e, l) {
		switch (e) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64:
				return l + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
				return l + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824:
				return -1;
			default:
				return -1
		}
	}

	function cu() {
		var e = Ut;
		return Ut <<= 1, (Ut & 4194048) === 0 && (Ut = 256), e
	}

	function Vi() {
		var e = ba;
		return ba <<= 1, (ba & 62914560) === 0 && (ba = 4194304), e
	}

	function Yi(e) {
		for (var l = [], t = 0; 31 > t; t++) l.push(e);
		return l
	}

	function jt(e, l) {
		e.pendingLanes |= l, l !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0)
	}

	function Yo(e, l, t, a, n, u) {
		var c = e.pendingLanes;
		e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= t, e.entangledLanes &= t, e.errorRecoveryDisabledLanes &= t, e.shellSuspendCounter = 0;
		var f = e.entanglements,
			m = e.expirationTimes,
			L = e.hiddenUpdates;
		for (t = c & ~t; 0 < t;) {
			var O = 31 - cl(t),
				_ = 1 << O;
			f[O] = 0, m[O] = -1;
			var D = L[O];
			if (D !== null)
				for (L[O] = null, O = 0; O < D.length; O++) {
					var B = D[O];
					B !== null && (B.lane &= -536870913)
				}
			t &= ~_
		}
		a !== 0 && Qa(e, a, 0), u !== 0 && n === 0 && e.tag !== 0 && (e.suspendedLanes |= u & ~(c & ~l))
	}

	function Qa(e, l, t) {
		e.pendingLanes |= l, e.suspendedLanes &= ~l;
		var a = 31 - cl(l);
		e.entangledLanes |= l, e.entanglements[a] = e.entanglements[a] | 1073741824 | t & 4194090
	}

	function ru(e, l) {
		var t = e.entangledLanes |= l;
		for (e = e.entanglements; t;) {
			var a = 31 - cl(t),
				n = 1 << a;
			n & l | e[a] & l && (e[a] |= l), t &= ~n
		}
	}

	function ya(e) {
		switch (e) {
			case 2:
				e = 1;
				break;
			case 8:
				e = 4;
				break;
			case 32:
				e = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				e = 128;
				break;
			case 268435456:
				e = 134217728;
				break;
			default:
				e = 0
		}
		return e
	}

	function Pa(e) {
		return e &= -e, 2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2
	}

	function su() {
		var e = F.p;
		return e !== 0 ? e : (e = window.event, e === void 0 ? 32 : H0(e.type))
	}

	function Sa(e, l) {
		var t = F.p;
		try {
			return F.p = e, l()
		} finally {
			F.p = t
		}
	}
	var Xl = Math.random().toString(36).slice(2),
		Fe = "__reactFiber$" + Xl,
		rl = "__reactProps$" + Xl,
		et = "__reactContainer$" + Xl,
		qi = "__reactEvents$" + Xl,
		fu = "__reactListeners$" + Xl,
		qo = "__reactHandles$" + Xl,
		ye = "__reactResources$" + Xl,
		Gt = "__reactMarker$" + Xl;

	function Ki(e) {
		delete e[Fe], delete e[rl], delete e[qi], delete e[fu], delete e[qo]
	}

	function Ol(e) {
		var l = e[Fe];
		if (l) return l;
		for (var t = e.parentNode; t;) {
			if (l = t[et] || t[Fe]) {
				if (t = l.alternate, l.child !== null || t !== null && t.child !== null)
					for (e = x0(e); e !== null;) {
						if (t = e[Fe]) return t;
						e = x0(e)
					}
				return l
			}
			e = t, t = e.parentNode
		}
		return null
	}

	function Ve(e) {
		if (e = e[Fe] || e[et]) {
			var l = e.tag;
			if (l === 5 || l === 6 || l === 13 || l === 26 || l === 27 || l === 3) return e
		}
		return null
	}

	function Rt(e) {
		var l = e.tag;
		if (l === 5 || l === 26 || l === 27 || l === 6) return e.stateNode;
		throw Error(r(33))
	}

	function wt(e) {
		var l = e[ye];
		return l || (l = e[ye] = {
			hoistableStyles: new Map,
			hoistableScripts: new Map
		}), l
	}

	function Ue(e) {
		e[Gt] = !0
	}
	var du = new Set,
		Ft = {};

	function pt(e, l) {
		Vt(e, l), Vt(e + "Capture", l)
	}

	function Vt(e, l) {
		for (Ft[e] = l, e = 0; e < l.length; e++) du.add(l[e])
	}
	var Ko = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),
		pu = {},
		hu = {};

	function Qo(e) {
		return Ri.call(hu, e) ? !0 : Ri.call(pu, e) ? !1 : Ko.test(e) ? hu[e] = !0 : (pu[e] = !0, !1)
	}

	function xa(e, l, t) {
		if (Qo(l))
			if (t === null) e.removeAttribute(l);
			else {
				switch (typeof t) {
					case "undefined":
					case "function":
					case "symbol":
						e.removeAttribute(l);
						return;
					case "boolean":
						var a = l.toLowerCase().slice(0, 5);
						if (a !== "data-" && a !== "aria-") {
							e.removeAttribute(l);
							return
						}
				}
				e.setAttribute(l, "" + t)
			}
	}

	function Ta(e, l, t) {
		if (t === null) e.removeAttribute(l);
		else {
			switch (typeof t) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(l);
					return
			}
			e.setAttribute(l, "" + t)
		}
	}

	function Zl(e, l, t, a) {
		if (a === null) e.removeAttribute(t);
		else {
			switch (typeof a) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(t);
					return
			}
			e.setAttributeNS(l, t, "" + a)
		}
	}
	var Xa, Ye;

	function Yt(e) {
		if (Xa === void 0) try {
			throw Error()
		} catch (t) {
			var l = t.stack.trim().match(/\n( *(at )?)/);
			Xa = l && l[1] || "", Ye = -1 < t.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < t.stack.indexOf("@") ? "@unknown:0:0" : ""
		}
		return `
` + Xa + e + Ye
	}
	var Qi = !1;

	function Pi(e, l) {
		if (!e || Qi) return "";
		Qi = !0;
		var t = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var a = {
				DetermineComponentFrameRoot: function() {
					try {
						if (l) {
							var _ = function() {
								throw Error()
							};
							if (Object.defineProperty(_.prototype, "props", {
									set: function() {
										throw Error()
									}
								}), typeof Reflect == "object" && Reflect.construct) {
								try {
									Reflect.construct(_, [])
								} catch (B) {
									var D = B
								}
								Reflect.construct(e, [], _)
							} else {
								try {
									_.call()
								} catch (B) {
									D = B
								}
								e.call(_.prototype)
							}
						} else {
							try {
								throw Error()
							} catch (B) {
								D = B
							}(_ = e()) && typeof _.catch == "function" && _.catch(function() {})
						}
					} catch (B) {
						if (B && D && typeof B.stack == "string") return [B.stack, D.stack]
					}
					return [null, null]
				}
			};
			a.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var n = Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot, "name");
			n && n.configurable && Object.defineProperty(a.DetermineComponentFrameRoot, "name", {
				value: "DetermineComponentFrameRoot"
			});
			var u = a.DetermineComponentFrameRoot(),
				c = u[0],
				f = u[1];
			if (c && f) {
				var m = c.split(`
`),
					L = f.split(`
`);
				for (n = a = 0; a < m.length && !m[a].includes("DetermineComponentFrameRoot");) a++;
				for (; n < L.length && !L[n].includes("DetermineComponentFrameRoot");) n++;
				if (a === m.length || n === L.length)
					for (a = m.length - 1, n = L.length - 1; 1 <= a && 0 <= n && m[a] !== L[n];) n--;
				for (; 1 <= a && 0 <= n; a--, n--)
					if (m[a] !== L[n]) {
						if (a !== 1 || n !== 1)
							do
								if (a--, n--, 0 > n || m[a] !== L[n]) {
									var O = `
` + m[a].replace(" at new ", " at ");
									return e.displayName && O.includes("<anonymous>") && (O = O.replace("<anonymous>", e.displayName)), O
								} while (1 <= a && 0 <= n);
						break
					}
			}
		} finally {
			Qi = !1, Error.prepareStackTrace = t
		}
		return (t = e ? e.displayName || e.name : "") ? Yt(t) : ""
	}

	function Po(e) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5:
				return Yt(e.type);
			case 16:
				return Yt("Lazy");
			case 13:
				return Yt("Suspense");
			case 19:
				return Yt("SuspenseList");
			case 0:
			case 15:
				return Pi(e.type, !1);
			case 11:
				return Pi(e.type.render, !1);
			case 1:
				return Pi(e.type, !0);
			case 31:
				return Yt("Activity");
			default:
				return ""
		}
	}

	function mu(e) {
		try {
			var l = "";
			do l += Po(e), e = e.return; while (e);
			return l
		} catch (t) {
			return `
Error generating stack: ` + t.message + `
` + t.stack
		}
	}

	function El(e) {
		switch (typeof e) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined":
				return e;
			case "object":
				return e;
			default:
				return ""
		}
	}

	function gu(e) {
		var l = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (l === "checkbox" || l === "radio")
	}

	function Xo(e) {
		var l = gu(e) ? "checked" : "value",
			t = Object.getOwnPropertyDescriptor(e.constructor.prototype, l),
			a = "" + e[l];
		if (!e.hasOwnProperty(l) && typeof t < "u" && typeof t.get == "function" && typeof t.set == "function") {
			var n = t.get,
				u = t.set;
			return Object.defineProperty(e, l, {
				configurable: !0,
				get: function() {
					return n.call(this)
				},
				set: function(c) {
					a = "" + c, u.call(this, c)
				}
			}), Object.defineProperty(e, l, {
				enumerable: t.enumerable
			}), {
				getValue: function() {
					return a
				},
				setValue: function(c) {
					a = "" + c
				},
				stopTracking: function() {
					e._valueTracker = null, delete e[l]
				}
			}
		}
	}

	function Za(e) {
		e._valueTracker || (e._valueTracker = Xo(e))
	}

	function bu(e) {
		if (!e) return !1;
		var l = e._valueTracker;
		if (!l) return !0;
		var t = l.getValue(),
			a = "";
		return e && (a = gu(e) ? e.checked ? "true" : "false" : e.value), e = a, e !== t ? (l.setValue(e), !0) : !1
	}

	function Ia(e) {
		if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
		try {
			return e.activeElement || e.body
		} catch {
			return e.body
		}
	}
	var Zo = /[\n"\\]/g;

	function Ml(e) {
		return e.replace(Zo, function(l) {
			return "\\" + l.charCodeAt(0).toString(16) + " "
		})
	}

	function Xi(e, l, t, a, n, u, c, f) {
		e.name = "", c != null && typeof c != "function" && typeof c != "symbol" && typeof c != "boolean" ? e.type = c : e.removeAttribute("type"), l != null ? c === "number" ? (l === 0 && e.value === "" || e.value != l) && (e.value = "" + El(l)) : e.value !== "" + El(l) && (e.value = "" + El(l)) : c !== "submit" && c !== "reset" || e.removeAttribute("value"), l != null ? Zi(e, c, El(l)) : t != null ? Zi(e, c, El(t)) : a != null && e.removeAttribute("value"), n == null && u != null && (e.defaultChecked = !!u), n != null && (e.checked = n && typeof n != "function" && typeof n != "symbol"), f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean" ? e.name = "" + El(f) : e.removeAttribute("name")
	}

	function vu(e, l, t, a, n, u, c, f) {
		if (u != null && typeof u != "function" && typeof u != "symbol" && typeof u != "boolean" && (e.type = u), l != null || t != null) {
			if (!(u !== "submit" && u !== "reset" || l != null)) return;
			t = t != null ? "" + El(t) : "", l = l != null ? "" + El(l) : t, f || l === e.value || (e.value = l), e.defaultValue = l
		}
		a = a ?? n, a = typeof a != "function" && typeof a != "symbol" && !!a, e.checked = f ? e.checked : !!a, e.defaultChecked = !!a, c != null && typeof c != "function" && typeof c != "symbol" && typeof c != "boolean" && (e.name = c)
	}

	function Zi(e, l, t) {
		l === "number" && Ia(e.ownerDocument) === e || e.defaultValue === "" + t || (e.defaultValue = "" + t)
	}

	function qt(e, l, t, a) {
		if (e = e.options, l) {
			l = {};
			for (var n = 0; n < t.length; n++) l["$" + t[n]] = !0;
			for (t = 0; t < e.length; t++) n = l.hasOwnProperty("$" + e[t].value), e[t].selected !== n && (e[t].selected = n), n && a && (e[t].defaultSelected = !0)
		} else {
			for (t = "" + El(t), l = null, n = 0; n < e.length; n++) {
				if (e[n].value === t) {
					e[n].selected = !0, a && (e[n].defaultSelected = !0);
					return
				}
				l !== null || e[n].disabled || (l = e[n])
			}
			l !== null && (l.selected = !0)
		}
	}

	function yu(e, l, t) {
		if (l != null && (l = "" + El(l), l !== e.value && (e.value = l), t == null)) {
			e.defaultValue !== l && (e.defaultValue = l);
			return
		}
		e.defaultValue = t != null ? "" + El(t) : ""
	}

	function Su(e, l, t, a) {
		if (l == null) {
			if (a != null) {
				if (t != null) throw Error(r(92));
				if (We(a)) {
					if (1 < a.length) throw Error(r(93));
					a = a[0]
				}
				t = a
			}
			t == null && (t = ""), l = t
		}
		t = El(l), e.defaultValue = t, a = e.textContent, a === t && a !== "" && a !== null && (e.value = a)
	}

	function Kt(e, l) {
		if (l) {
			var t = e.firstChild;
			if (t && t === e.lastChild && t.nodeType === 3) {
				t.nodeValue = l;
				return
			}
		}
		e.textContent = l
	}
	var Io = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));

	function xu(e, l, t) {
		var a = l.indexOf("--") === 0;
		t == null || typeof t == "boolean" || t === "" ? a ? e.setProperty(l, "") : l === "float" ? e.cssFloat = "" : e[l] = "" : a ? e.setProperty(l, t) : typeof t != "number" || t === 0 || Io.has(l) ? l === "float" ? e.cssFloat = t : e[l] = ("" + t).trim() : e[l] = t + "px"
	}

	function Tu(e, l, t) {
		if (l != null && typeof l != "object") throw Error(r(62));
		if (e = e.style, t != null) {
			for (var a in t) !t.hasOwnProperty(a) || l != null && l.hasOwnProperty(a) || (a.indexOf("--") === 0 ? e.setProperty(a, "") : a === "float" ? e.cssFloat = "" : e[a] = "");
			for (var n in l) a = l[n], l.hasOwnProperty(n) && t[n] !== a && xu(e, n, a)
		} else
			for (var u in l) l.hasOwnProperty(u) && xu(e, u, l[u])
	}

	function Ii(e) {
		if (e.indexOf("-") === -1) return !1;
		switch (e) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph":
				return !1;
			default:
				return !0
		}
	}
	var Jo = new Map([
			["acceptCharset", "accept-charset"],
			["htmlFor", "for"],
			["httpEquiv", "http-equiv"],
			["crossOrigin", "crossorigin"],
			["accentHeight", "accent-height"],
			["alignmentBaseline", "alignment-baseline"],
			["arabicForm", "arabic-form"],
			["baselineShift", "baseline-shift"],
			["capHeight", "cap-height"],
			["clipPath", "clip-path"],
			["clipRule", "clip-rule"],
			["colorInterpolation", "color-interpolation"],
			["colorInterpolationFilters", "color-interpolation-filters"],
			["colorProfile", "color-profile"],
			["colorRendering", "color-rendering"],
			["dominantBaseline", "dominant-baseline"],
			["enableBackground", "enable-background"],
			["fillOpacity", "fill-opacity"],
			["fillRule", "fill-rule"],
			["floodColor", "flood-color"],
			["floodOpacity", "flood-opacity"],
			["fontFamily", "font-family"],
			["fontSize", "font-size"],
			["fontSizeAdjust", "font-size-adjust"],
			["fontStretch", "font-stretch"],
			["fontStyle", "font-style"],
			["fontVariant", "font-variant"],
			["fontWeight", "font-weight"],
			["glyphName", "glyph-name"],
			["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
			["glyphOrientationVertical", "glyph-orientation-vertical"],
			["horizAdvX", "horiz-adv-x"],
			["horizOriginX", "horiz-origin-x"],
			["imageRendering", "image-rendering"],
			["letterSpacing", "letter-spacing"],
			["lightingColor", "lighting-color"],
			["markerEnd", "marker-end"],
			["markerMid", "marker-mid"],
			["markerStart", "marker-start"],
			["overlinePosition", "overline-position"],
			["overlineThickness", "overline-thickness"],
			["paintOrder", "paint-order"],
			["panose-1", "panose-1"],
			["pointerEvents", "pointer-events"],
			["renderingIntent", "rendering-intent"],
			["shapeRendering", "shape-rendering"],
			["stopColor", "stop-color"],
			["stopOpacity", "stop-opacity"],
			["strikethroughPosition", "strikethrough-position"],
			["strikethroughThickness", "strikethrough-thickness"],
			["strokeDasharray", "stroke-dasharray"],
			["strokeDashoffset", "stroke-dashoffset"],
			["strokeLinecap", "stroke-linecap"],
			["strokeLinejoin", "stroke-linejoin"],
			["strokeMiterlimit", "stroke-miterlimit"],
			["strokeOpacity", "stroke-opacity"],
			["strokeWidth", "stroke-width"],
			["textAnchor", "text-anchor"],
			["textDecoration", "text-decoration"],
			["textRendering", "text-rendering"],
			["transformOrigin", "transform-origin"],
			["underlinePosition", "underline-position"],
			["underlineThickness", "underline-thickness"],
			["unicodeBidi", "unicode-bidi"],
			["unicodeRange", "unicode-range"],
			["unitsPerEm", "units-per-em"],
			["vAlphabetic", "v-alphabetic"],
			["vHanging", "v-hanging"],
			["vIdeographic", "v-ideographic"],
			["vMathematical", "v-mathematical"],
			["vectorEffect", "vector-effect"],
			["vertAdvY", "vert-adv-y"],
			["vertOriginX", "vert-origin-x"],
			["vertOriginY", "vert-origin-y"],
			["wordSpacing", "word-spacing"],
			["writingMode", "writing-mode"],
			["xmlnsXlink", "xmlns:xlink"],
			["xHeight", "x-height"]
		]),
		$o = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;

	function Ja(e) {
		return $o.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e
	}
	var lt = null;

	function tt(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e
	}
	var Qt = null,
		Pt = null;

	function Aa(e) {
		var l = Ve(e);
		if (l && (e = l.stateNode)) {
			var t = e[rl] || null;
			e: switch (e = l.stateNode, l.type) {
				case "input":
					if (Xi(e, t.value, t.defaultValue, t.defaultValue, t.checked, t.defaultChecked, t.type, t.name), l = t.name, t.type === "radio" && l != null) {
						for (t = e; t.parentNode;) t = t.parentNode;
						for (t = t.querySelectorAll('input[name="' + Ml("" + l) + '"][type="radio"]'), l = 0; l < t.length; l++) {
							var a = t[l];
							if (a !== e && a.form === e.form) {
								var n = a[rl] || null;
								if (!n) throw Error(r(90));
								Xi(a, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name)
							}
						}
						for (l = 0; l < t.length; l++) a = t[l], a.form === e.form && bu(a)
					}
					break e;
				case "textarea":
					yu(e, t.value, t.defaultValue);
					break e;
				case "select":
					l = t.value, l != null && qt(e, !!t.multiple, l, !1)
			}
		}
	}
	var at = !1;

	function Au(e, l, t) {
		if (at) return e(l, t);
		at = !0;
		try {
			var a = e(l);
			return a
		} finally {
			if (at = !1, (Qt !== null || Pt !== null) && (no(), Qt && (l = Qt, e = Pt, Pt = Qt = null, Aa(l), e)))
				for (l = 0; l < e.length; l++) Aa(e[l])
		}
	}

	function Ea(e, l) {
		var t = e.stateNode;
		if (t === null) return null;
		var a = t[rl] || null;
		if (a === null) return null;
		t = a[l];
		e: switch (l) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(a = !a.disabled) || (e = e.type, a = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !a;
				break e;
			default:
				e = !1
		}
		if (e) return null;
		if (t && typeof t != "function") throw Error(r(231, l, typeof t));
		return t
	}
	var ce = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"),
		sl = !1;
	if (ce) try {
		var Oe = {};
		Object.defineProperty(Oe, "passive", {
			get: function() {
				sl = !0
			}
		}), window.addEventListener("test", Oe, Oe), window.removeEventListener("test", Oe, Oe)
	} catch {
		sl = !1
	}
	var qe = null,
		W = null,
		$a = null;

	function Eu() {
		if ($a) return $a;
		var e, l = W,
			t = l.length,
			a, n = "value" in qe ? qe.value : qe.textContent,
			u = n.length;
		for (e = 0; e < t && l[e] === n[e]; e++);
		var c = t - e;
		for (a = 1; a <= c && l[t - a] === n[u - a]; a++);
		return $a = n.slice(e, 1 < a ? 1 - a : void 0)
	}

	function Wa(e) {
		var l = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && l === 13 && (e = 13)) : e = l, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0
	}

	function ei() {
		return !0
	}

	function Mu() {
		return !1
	}

	function bl(e) {
		function l(t, a, n, u, c) {
			this._reactName = t, this._targetInst = n, this.type = a, this.nativeEvent = u, this.target = c, this.currentTarget = null;
			for (var f in e) e.hasOwnProperty(f) && (t = e[f], this[f] = t ? t(u) : u[f]);
			return this.isDefaultPrevented = (u.defaultPrevented != null ? u.defaultPrevented : u.returnValue === !1) ? ei : Mu, this.isPropagationStopped = Mu, this
		}
		return C(l.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var t = this.nativeEvent;
				t && (t.preventDefault ? t.preventDefault() : typeof t.returnValue != "unknown" && (t.returnValue = !1), this.isDefaultPrevented = ei)
			},
			stopPropagation: function() {
				var t = this.nativeEvent;
				t && (t.stopPropagation ? t.stopPropagation() : typeof t.cancelBubble != "unknown" && (t.cancelBubble = !0), this.isPropagationStopped = ei)
			},
			persist: function() {},
			isPersistent: ei
		}), l
	}
	var ht = {
			eventPhase: 0,
			bubbles: 0,
			cancelable: 0,
			timeStamp: function(e) {
				return e.timeStamp || Date.now()
			},
			defaultPrevented: 0,
			isTrusted: 0
		},
		li = bl(ht),
		Ma = C({}, ht, {
			view: 0,
			detail: 0
		}),
		Wo = bl(Ma),
		Ji, $i, La, ti = C({}, Ma, {
			screenX: 0,
			screenY: 0,
			clientX: 0,
			clientY: 0,
			pageX: 0,
			pageY: 0,
			ctrlKey: 0,
			shiftKey: 0,
			altKey: 0,
			metaKey: 0,
			getModifierState: lc,
			button: 0,
			buttons: 0,
			relatedTarget: function(e) {
				return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget
			},
			movementX: function(e) {
				return "movementX" in e ? e.movementX : (e !== La && (La && e.type === "mousemove" ? (Ji = e.screenX - La.screenX, $i = e.screenY - La.screenY) : $i = Ji = 0, La = e), Ji)
			},
			movementY: function(e) {
				return "movementY" in e ? e.movementY : $i
			}
		}),
		b = bl(ti),
		H = C({}, ti, {
			dataTransfer: 0
		}),
		z = bl(H),
		K = C({}, Ma, {
			relatedTarget: 0
		}),
		ee = bl(K),
		G = C({}, ht, {
			animationName: 0,
			elapsedTime: 0,
			pseudoElement: 0
		}),
		Z = bl(G),
		He = C({}, ht, {
			clipboardData: function(e) {
				return "clipboardData" in e ? e.clipboardData : window.clipboardData
			}
		}),
		fl = bl(He),
		it = C({}, ht, {
			data: 0
		}),
		mt = bl(it),
		gt = {
			Esc: "Escape",
			Spacebar: " ",
			Left: "ArrowLeft",
			Up: "ArrowUp",
			Right: "ArrowRight",
			Down: "ArrowDown",
			Del: "Delete",
			Win: "OS",
			Menu: "ContextMenu",
			Apps: "ContextMenu",
			Scroll: "ScrollLock",
			MozPrintableKey: "Unidentified"
		},
		Wi = {
			8: "Backspace",
			9: "Tab",
			12: "Clear",
			13: "Enter",
			16: "Shift",
			17: "Control",
			18: "Alt",
			19: "Pause",
			20: "CapsLock",
			27: "Escape",
			32: " ",
			33: "PageUp",
			34: "PageDown",
			35: "End",
			36: "Home",
			37: "ArrowLeft",
			38: "ArrowUp",
			39: "ArrowRight",
			40: "ArrowDown",
			45: "Insert",
			46: "Delete",
			112: "F1",
			113: "F2",
			114: "F3",
			115: "F4",
			116: "F5",
			117: "F6",
			118: "F7",
			119: "F8",
			120: "F9",
			121: "F10",
			122: "F11",
			123: "F12",
			144: "NumLock",
			145: "ScrollLock",
			224: "Meta"
		},
		ec = {
			Alt: "altKey",
			Control: "ctrlKey",
			Meta: "metaKey",
			Shift: "shiftKey"
		};

	function sh(e) {
		var l = this.nativeEvent;
		return l.getModifierState ? l.getModifierState(e) : (e = ec[e]) ? !!l[e] : !1
	}

	function lc() {
		return sh
	}
	var fh = C({}, Ma, {
			key: function(e) {
				if (e.key) {
					var l = gt[e.key] || e.key;
					if (l !== "Unidentified") return l
				}
				return e.type === "keypress" ? (e = Wa(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Wi[e.keyCode] || "Unidentified" : ""
			},
			code: 0,
			location: 0,
			ctrlKey: 0,
			shiftKey: 0,
			altKey: 0,
			metaKey: 0,
			repeat: 0,
			locale: 0,
			getModifierState: lc,
			charCode: function(e) {
				return e.type === "keypress" ? Wa(e) : 0
			},
			keyCode: function(e) {
				return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0
			},
			which: function(e) {
				return e.type === "keypress" ? Wa(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0
			}
		}),
		dh = bl(fh),
		ph = C({}, ti, {
			pointerId: 0,
			width: 0,
			height: 0,
			pressure: 0,
			tangentialPressure: 0,
			tiltX: 0,
			tiltY: 0,
			twist: 0,
			pointerType: 0,
			isPrimary: 0
		}),
		As = bl(ph),
		hh = C({}, Ma, {
			touches: 0,
			targetTouches: 0,
			changedTouches: 0,
			altKey: 0,
			metaKey: 0,
			ctrlKey: 0,
			shiftKey: 0,
			getModifierState: lc
		}),
		mh = bl(hh),
		gh = C({}, ht, {
			propertyName: 0,
			elapsedTime: 0,
			pseudoElement: 0
		}),
		bh = bl(gh),
		vh = C({}, ti, {
			deltaX: function(e) {
				return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0
			},
			deltaY: function(e) {
				return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0
			},
			deltaZ: 0,
			deltaMode: 0
		}),
		yh = bl(vh),
		Sh = C({}, ht, {
			newState: 0,
			oldState: 0
		}),
		xh = bl(Sh),
		Th = [9, 13, 27, 32],
		tc = ce && "CompositionEvent" in window,
		en = null;
	ce && "documentMode" in document && (en = document.documentMode);
	var Ah = ce && "TextEvent" in window && !en,
		Es = ce && (!tc || en && 8 < en && 11 >= en),
		Ms = " ",
		Ls = !1;

	function Ds(e, l) {
		switch (e) {
			case "keyup":
				return Th.indexOf(l.keyCode) !== -1;
			case "keydown":
				return l.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout":
				return !0;
			default:
				return !1
		}
	}

	function Bs(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null
	}
	var ai = !1;

	function Eh(e, l) {
		switch (e) {
			case "compositionend":
				return Bs(l);
			case "keypress":
				return l.which !== 32 ? null : (Ls = !0, Ms);
			case "textInput":
				return e = l.data, e === Ms && Ls ? null : e;
			default:
				return null
		}
	}

	function Mh(e, l) {
		if (ai) return e === "compositionend" || !tc && Ds(e, l) ? (e = Eu(), $a = W = qe = null, ai = !1, e) : null;
		switch (e) {
			case "paste":
				return null;
			case "keypress":
				if (!(l.ctrlKey || l.altKey || l.metaKey) || l.ctrlKey && l.altKey) {
					if (l.char && 1 < l.char.length) return l.char;
					if (l.which) return String.fromCharCode(l.which)
				}
				return null;
			case "compositionend":
				return Es && l.locale !== "ko" ? null : l.data;
			default:
				return null
		}
	}
	var Lh = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};

	function Cs(e) {
		var l = e && e.nodeName && e.nodeName.toLowerCase();
		return l === "input" ? !!Lh[e.type] : l === "textarea"
	}

	function Ns(e, l, t, a) {
		Qt ? Pt ? Pt.push(a) : Pt = [a] : Qt = a, l = fo(l, "onChange"), 0 < l.length && (t = new li("onChange", "change", null, t, a), e.push({
			event: t,
			listeners: l
		}))
	}
	var ln = null,
		tn = null;

	function Dh(e) {
		f0(e, 0)
	}

	function Lu(e) {
		var l = Rt(e);
		if (bu(l)) return e
	}

	function Os(e, l) {
		if (e === "change") return l
	}
	var ks = !1;
	if (ce) {
		var ac;
		if (ce) {
			var ic = "oninput" in document;
			if (!ic) {
				var zs = document.createElement("div");
				zs.setAttribute("oninput", "return;"), ic = typeof zs.oninput == "function"
			}
			ac = ic
		} else ac = !1;
		ks = ac && (!document.documentMode || 9 < document.documentMode)
	}

	function _s() {
		ln && (ln.detachEvent("onpropertychange", Us), tn = ln = null)
	}

	function Us(e) {
		if (e.propertyName === "value" && Lu(tn)) {
			var l = [];
			Ns(l, tn, e, tt(e)), Au(Dh, l)
		}
	}

	function Bh(e, l, t) {
		e === "focusin" ? (_s(), ln = l, tn = t, ln.attachEvent("onpropertychange", Us)) : e === "focusout" && _s()
	}

	function Ch(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return Lu(tn)
	}

	function Nh(e, l) {
		if (e === "click") return Lu(l)
	}

	function Oh(e, l) {
		if (e === "input" || e === "change") return Lu(l)
	}

	function kh(e, l) {
		return e === l && (e !== 0 || 1 / e === 1 / l) || e !== e && l !== l
	}
	var kl = typeof Object.is == "function" ? Object.is : kh;

	function an(e, l) {
		if (kl(e, l)) return !0;
		if (typeof e != "object" || e === null || typeof l != "object" || l === null) return !1;
		var t = Object.keys(e),
			a = Object.keys(l);
		if (t.length !== a.length) return !1;
		for (a = 0; a < t.length; a++) {
			var n = t[a];
			if (!Ri.call(l, n) || !kl(e[n], l[n])) return !1
		}
		return !0
	}

	function Hs(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e
	}

	function js(e, l) {
		var t = Hs(e);
		e = 0;
		for (var a; t;) {
			if (t.nodeType === 3) {
				if (a = e + t.textContent.length, e <= l && a >= l) return {
					node: t,
					offset: l - e
				};
				e = a
			}
			e: {
				for (; t;) {
					if (t.nextSibling) {
						t = t.nextSibling;
						break e
					}
					t = t.parentNode
				}
				t = void 0
			}
			t = Hs(t)
		}
	}

	function Gs(e, l) {
		return e && l ? e === l ? !0 : e && e.nodeType === 3 ? !1 : l && l.nodeType === 3 ? Gs(e, l.parentNode) : "contains" in e ? e.contains(l) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(l) & 16) : !1 : !1
	}

	function Rs(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var l = Ia(e.document); l instanceof e.HTMLIFrameElement;) {
			try {
				var t = typeof l.contentWindow.location.href == "string"
			} catch {
				t = !1
			}
			if (t) e = l.contentWindow;
			else break;
			l = Ia(e.document)
		}
		return l
	}

	function nc(e) {
		var l = e && e.nodeName && e.nodeName.toLowerCase();
		return l && (l === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || l === "textarea" || e.contentEditable === "true")
	}
	var zh = ce && "documentMode" in document && 11 >= document.documentMode,
		ii = null,
		uc = null,
		nn = null,
		oc = !1;

	function ws(e, l, t) {
		var a = t.window === t ? t.document : t.nodeType === 9 ? t : t.ownerDocument;
		oc || ii == null || ii !== Ia(a) || (a = ii, "selectionStart" in a && nc(a) ? a = {
			start: a.selectionStart,
			end: a.selectionEnd
		} : (a = (a.ownerDocument && a.ownerDocument.defaultView || window).getSelection(), a = {
			anchorNode: a.anchorNode,
			anchorOffset: a.anchorOffset,
			focusNode: a.focusNode,
			focusOffset: a.focusOffset
		}), nn && an(nn, a) || (nn = a, a = fo(uc, "onSelect"), 0 < a.length && (l = new li("onSelect", "select", null, l, t), e.push({
			event: l,
			listeners: a
		}), l.target = ii)))
	}

	function Da(e, l) {
		var t = {};
		return t[e.toLowerCase()] = l.toLowerCase(), t["Webkit" + e] = "webkit" + l, t["Moz" + e] = "moz" + l, t
	}
	var ni = {
			animationend: Da("Animation", "AnimationEnd"),
			animationiteration: Da("Animation", "AnimationIteration"),
			animationstart: Da("Animation", "AnimationStart"),
			transitionrun: Da("Transition", "TransitionRun"),
			transitionstart: Da("Transition", "TransitionStart"),
			transitioncancel: Da("Transition", "TransitionCancel"),
			transitionend: Da("Transition", "TransitionEnd")
		},
		cc = {},
		Fs = {};
	ce && (Fs = document.createElement("div").style, "AnimationEvent" in window || (delete ni.animationend.animation, delete ni.animationiteration.animation, delete ni.animationstart.animation), "TransitionEvent" in window || delete ni.transitionend.transition);

	function Ba(e) {
		if (cc[e]) return cc[e];
		if (!ni[e]) return e;
		var l = ni[e],
			t;
		for (t in l)
			if (l.hasOwnProperty(t) && t in Fs) return cc[e] = l[t];
		return e
	}
	var Vs = Ba("animationend"),
		Ys = Ba("animationiteration"),
		qs = Ba("animationstart"),
		_h = Ba("transitionrun"),
		Uh = Ba("transitionstart"),
		Hh = Ba("transitioncancel"),
		Ks = Ba("transitionend"),
		Qs = new Map,
		rc = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	rc.push("scrollEnd");

	function Il(e, l) {
		Qs.set(e, l), pt(l, [e])
	}
	var Ps = new WeakMap;

	function wl(e, l) {
		if (typeof e == "object" && e !== null) {
			var t = Ps.get(e);
			return t !== void 0 ? t : (l = {
				value: e,
				source: l,
				stack: mu(l)
			}, Ps.set(e, l), l)
		}
		return {
			value: e,
			source: l,
			stack: mu(l)
		}
	}
	var Fl = [],
		ui = 0,
		sc = 0;

	function Du() {
		for (var e = ui, l = sc = ui = 0; l < e;) {
			var t = Fl[l];
			Fl[l++] = null;
			var a = Fl[l];
			Fl[l++] = null;
			var n = Fl[l];
			Fl[l++] = null;
			var u = Fl[l];
			if (Fl[l++] = null, a !== null && n !== null) {
				var c = a.pending;
				c === null ? n.next = n : (n.next = c.next, c.next = n), a.pending = n
			}
			u !== 0 && Xs(t, n, u)
		}
	}

	function Bu(e, l, t, a) {
		Fl[ui++] = e, Fl[ui++] = l, Fl[ui++] = t, Fl[ui++] = a, sc |= a, e.lanes |= a, e = e.alternate, e !== null && (e.lanes |= a)
	}

	function fc(e, l, t, a) {
		return Bu(e, l, t, a), Cu(e)
	}

	function oi(e, l) {
		return Bu(e, null, null, l), Cu(e)
	}

	function Xs(e, l, t) {
		e.lanes |= t;
		var a = e.alternate;
		a !== null && (a.lanes |= t);
		for (var n = !1, u = e.return; u !== null;) u.childLanes |= t, a = u.alternate, a !== null && (a.childLanes |= t), u.tag === 22 && (e = u.stateNode, e === null || e._visibility & 1 || (n = !0)), e = u, u = u.return;
		return e.tag === 3 ? (u = e.stateNode, n && l !== null && (n = 31 - cl(t), e = u.hiddenUpdates, a = e[n], a === null ? e[n] = [l] : a.push(l), l.lane = t | 536870912), u) : null
	}

	function Cu(e) {
		if (50 < Nn) throw Nn = 0, br = null, Error(r(185));
		for (var l = e.return; l !== null;) e = l, l = e.return;
		return e.tag === 3 ? e.stateNode : null
	}
	var ci = {};

	function jh(e, l, t, a) {
		this.tag = e, this.key = t, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = l, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = a, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null
	}

	function zl(e, l, t, a) {
		return new jh(e, l, t, a)
	}

	function dc(e) {
		return e = e.prototype, !(!e || !e.isReactComponent)
	}

	function bt(e, l) {
		var t = e.alternate;
		return t === null ? (t = zl(e.tag, l, e.key, e.mode), t.elementType = e.elementType, t.type = e.type, t.stateNode = e.stateNode, t.alternate = e, e.alternate = t) : (t.pendingProps = l, t.type = e.type, t.flags = 0, t.subtreeFlags = 0, t.deletions = null), t.flags = e.flags & 65011712, t.childLanes = e.childLanes, t.lanes = e.lanes, t.child = e.child, t.memoizedProps = e.memoizedProps, t.memoizedState = e.memoizedState, t.updateQueue = e.updateQueue, l = e.dependencies, t.dependencies = l === null ? null : {
			lanes: l.lanes,
			firstContext: l.firstContext
		}, t.sibling = e.sibling, t.index = e.index, t.ref = e.ref, t.refCleanup = e.refCleanup, t
	}

	function Zs(e, l) {
		e.flags &= 65011714;
		var t = e.alternate;
		return t === null ? (e.childLanes = 0, e.lanes = l, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = t.childLanes, e.lanes = t.lanes, e.child = t.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = t.memoizedProps, e.memoizedState = t.memoizedState, e.updateQueue = t.updateQueue, e.type = t.type, l = t.dependencies, e.dependencies = l === null ? null : {
			lanes: l.lanes,
			firstContext: l.firstContext
		}), e
	}

	function Nu(e, l, t, a, n, u) {
		var c = 0;
		if (a = e, typeof e == "function") dc(e) && (c = 1);
		else if (typeof e == "string") c = R1(e, t, Q.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else e: switch (e) {
			case ge:
				return e = zl(31, t, l, n), e.elementType = ge, e.lanes = u, e;
			case J:
				return Ca(t.children, n, u, l);
			case ie:
				c = 8, n |= 24;
				break;
			case oe:
				return e = zl(12, t, l, n | 2), e.elementType = oe, e.lanes = u, e;
			case fe:
				return e = zl(13, t, l, n), e.elementType = fe, e.lanes = u, e;
			case Re:
				return e = zl(19, t, l, n), e.elementType = Re, e.lanes = u, e;
			default:
				if (typeof e == "object" && e !== null) switch (e.$$typeof) {
					case Ne:
					case _e:
						c = 10;
						break e;
					case ue:
						c = 9;
						break e;
					case al:
						c = 11;
						break e;
					case Pe:
						c = 14;
						break e;
					case $:
						c = 16, a = null;
						break e
				}
				c = 29, t = Error(r(130, e === null ? "null" : typeof e, "")), a = null
		}
		return l = zl(c, t, l, n), l.elementType = e, l.type = a, l.lanes = u, l
	}

	function Ca(e, l, t, a) {
		return e = zl(7, e, a, l), e.lanes = t, e
	}

	function pc(e, l, t) {
		return e = zl(6, e, null, l), e.lanes = t, e
	}

	function hc(e, l, t) {
		return l = zl(4, e.children !== null ? e.children : [], e.key, l), l.lanes = t, l.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, l
	}
	var ri = [],
		si = 0,
		Ou = null,
		ku = 0,
		Vl = [],
		Yl = 0,
		Na = null,
		vt = 1,
		yt = "";

	function Oa(e, l) {
		ri[si++] = ku, ri[si++] = Ou, Ou = e, ku = l
	}

	function Is(e, l, t) {
		Vl[Yl++] = vt, Vl[Yl++] = yt, Vl[Yl++] = Na, Na = e;
		var a = vt;
		e = yt;
		var n = 32 - cl(a) - 1;
		a &= ~(1 << n), t += 1;
		var u = 32 - cl(l) + n;
		if (30 < u) {
			var c = n - n % 5;
			u = (a & (1 << c) - 1).toString(32), a >>= c, n -= c, vt = 1 << 32 - cl(l) + n | t << n | a, yt = u + e
		} else vt = 1 << u | t << n | a, yt = e
	}

	function mc(e) {
		e.return !== null && (Oa(e, 1), Is(e, 1, 0))
	}

	function gc(e) {
		for (; e === Ou;) Ou = ri[--si], ri[si] = null, ku = ri[--si], ri[si] = null;
		for (; e === Na;) Na = Vl[--Yl], Vl[Yl] = null, yt = Vl[--Yl], Vl[Yl] = null, vt = Vl[--Yl], Vl[Yl] = null
	}
	var xl = null,
		je = null,
		xe = !1,
		ka = null,
		nt = !1,
		bc = Error(r(519));

	function za(e) {
		var l = Error(r(418, ""));
		throw cn(wl(l, e)), bc
	}

	function Js(e) {
		var l = e.stateNode,
			t = e.type,
			a = e.memoizedProps;
		switch (l[Fe] = e, l[rl] = a, t) {
			case "dialog":
				me("cancel", l), me("close", l);
				break;
			case "iframe":
			case "object":
			case "embed":
				me("load", l);
				break;
			case "video":
			case "audio":
				for (t = 0; t < kn.length; t++) me(kn[t], l);
				break;
			case "source":
				me("error", l);
				break;
			case "img":
			case "image":
			case "link":
				me("error", l), me("load", l);
				break;
			case "details":
				me("toggle", l);
				break;
			case "input":
				me("invalid", l), vu(l, a.value, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name, !0), Za(l);
				break;
			case "select":
				me("invalid", l);
				break;
			case "textarea":
				me("invalid", l), Su(l, a.value, a.defaultValue, a.children), Za(l)
		}
		t = a.children, typeof t != "string" && typeof t != "number" && typeof t != "bigint" || l.textContent === "" + t || a.suppressHydrationWarning === !0 || m0(l.textContent, t) ? (a.popover != null && (me("beforetoggle", l), me("toggle", l)), a.onScroll != null && me("scroll", l), a.onScrollEnd != null && me("scrollend", l), a.onClick != null && (l.onclick = po), l = !0) : l = !1, l || za(e)
	}

	function $s(e) {
		for (xl = e.return; xl;) switch (xl.tag) {
			case 5:
			case 13:
				nt = !1;
				return;
			case 27:
			case 3:
				nt = !0;
				return;
			default:
				xl = xl.return
		}
	}

	function un(e) {
		if (e !== xl) return !1;
		if (!xe) return $s(e), xe = !0, !1;
		var l = e.tag,
			t;
		if ((t = l !== 3 && l !== 27) && ((t = l === 5) && (t = e.type, t = !(t !== "form" && t !== "button") || zr(e.type, e.memoizedProps)), t = !t), t && je && za(e), $s(e), l === 13) {
			if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(r(317));
			e: {
				for (e = e.nextSibling, l = 0; e;) {
					if (e.nodeType === 8)
						if (t = e.data, t === "/$") {
							if (l === 0) {
								je = $l(e.nextSibling);
								break e
							}
							l--
						} else t !== "$" && t !== "$!" && t !== "$?" || l++;
					e = e.nextSibling
				}
				je = null
			}
		} else l === 27 ? (l = je, ra(e.type) ? (e = jr, jr = null, je = e) : je = l) : je = xl ? $l(e.stateNode.nextSibling) : null;
		return !0
	}

	function on() {
		je = xl = null, xe = !1
	}

	function Ws() {
		var e = ka;
		return e !== null && (Bl === null ? Bl = e : Bl.push.apply(Bl, e), ka = null), e
	}

	function cn(e) {
		ka === null ? ka = [e] : ka.push(e)
	}
	var vc = U(null),
		_a = null,
		St = null;

	function Xt(e, l, t) {
		V(vc, l._currentValue), l._currentValue = t
	}

	function xt(e) {
		e._currentValue = vc.current, Y(vc)
	}

	function yc(e, l, t) {
		for (; e !== null;) {
			var a = e.alternate;
			if ((e.childLanes & l) !== l ? (e.childLanes |= l, a !== null && (a.childLanes |= l)) : a !== null && (a.childLanes & l) !== l && (a.childLanes |= l), e === t) break;
			e = e.return
		}
	}

	function Sc(e, l, t, a) {
		var n = e.child;
		for (n !== null && (n.return = e); n !== null;) {
			var u = n.dependencies;
			if (u !== null) {
				var c = n.child;
				u = u.firstContext;
				e: for (; u !== null;) {
					var f = u;
					u = n;
					for (var m = 0; m < l.length; m++)
						if (f.context === l[m]) {
							u.lanes |= t, f = u.alternate, f !== null && (f.lanes |= t), yc(u.return, t, e), a || (c = null);
							break e
						} u = f.next
				}
			} else if (n.tag === 18) {
				if (c = n.return, c === null) throw Error(r(341));
				c.lanes |= t, u = c.alternate, u !== null && (u.lanes |= t), yc(c, t, e), c = null
			} else c = n.child;
			if (c !== null) c.return = n;
			else
				for (c = n; c !== null;) {
					if (c === e) {
						c = null;
						break
					}
					if (n = c.sibling, n !== null) {
						n.return = c.return, c = n;
						break
					}
					c = c.return
				}
			n = c
		}
	}

	function rn(e, l, t, a) {
		e = null;
		for (var n = l, u = !1; n !== null;) {
			if (!u) {
				if ((n.flags & 524288) !== 0) u = !0;
				else if ((n.flags & 262144) !== 0) break
			}
			if (n.tag === 10) {
				var c = n.alternate;
				if (c === null) throw Error(r(387));
				if (c = c.memoizedProps, c !== null) {
					var f = n.type;
					kl(n.pendingProps.value, c.value) || (e !== null ? e.push(f) : e = [f])
				}
			} else if (n === il.current) {
				if (c = n.alternate, c === null) throw Error(r(387));
				c.memoizedState.memoizedState !== n.memoizedState.memoizedState && (e !== null ? e.push(Gn) : e = [Gn])
			}
			n = n.return
		}
		e !== null && Sc(l, e, t, a), l.flags |= 262144
	}

	function zu(e) {
		for (e = e.firstContext; e !== null;) {
			if (!kl(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next
		}
		return !1
	}

	function Ua(e) {
		_a = e, St = null, e = e.dependencies, e !== null && (e.firstContext = null)
	}

	function vl(e) {
		return ef(_a, e)
	}

	function _u(e, l) {
		return _a === null && Ua(e), ef(e, l)
	}

	function ef(e, l) {
		var t = l._currentValue;
		if (l = {
				context: l,
				memoizedValue: t,
				next: null
			}, St === null) {
			if (e === null) throw Error(r(308));
			St = l, e.dependencies = {
				lanes: 0,
				firstContext: l
			}, e.flags |= 524288
		} else St = St.next = l;
		return t
	}
	var Gh = typeof AbortController < "u" ? AbortController : function() {
			var e = [],
				l = this.signal = {
					aborted: !1,
					addEventListener: function(t, a) {
						e.push(a)
					}
				};
			this.abort = function() {
				l.aborted = !0, e.forEach(function(t) {
					return t()
				})
			}
		},
		Rh = i.unstable_scheduleCallback,
		wh = i.unstable_NormalPriority,
		el = {
			$$typeof: _e,
			Consumer: null,
			Provider: null,
			_currentValue: null,
			_currentValue2: null,
			_threadCount: 0
		};

	function xc() {
		return {
			controller: new Gh,
			data: new Map,
			refCount: 0
		}
	}

	function sn(e) {
		e.refCount--, e.refCount === 0 && Rh(wh, function() {
			e.controller.abort()
		})
	}
	var fn = null,
		Tc = 0,
		fi = 0,
		di = null;

	function Fh(e, l) {
		if (fn === null) {
			var t = fn = [];
			Tc = 0, fi = Er(), di = {
				status: "pending",
				value: void 0,
				then: function(a) {
					t.push(a)
				}
			}
		}
		return Tc++, l.then(lf, lf), l
	}

	function lf() {
		if (--Tc === 0 && fn !== null) {
			di !== null && (di.status = "fulfilled");
			var e = fn;
			fn = null, fi = 0, di = null;
			for (var l = 0; l < e.length; l++)(0, e[l])()
		}
	}

	function Vh(e, l) {
		var t = [],
			a = {
				status: "pending",
				value: null,
				reason: null,
				then: function(n) {
					t.push(n)
				}
			};
		return e.then(function() {
			a.status = "fulfilled", a.value = l;
			for (var n = 0; n < t.length; n++)(0, t[n])(l)
		}, function(n) {
			for (a.status = "rejected", a.reason = n, n = 0; n < t.length; n++)(0, t[n])(void 0)
		}), a
	}
	var tf = N.S;
	N.S = function(e, l) {
		typeof l == "object" && l !== null && typeof l.then == "function" && Fh(e, l), tf !== null && tf(e, l)
	};
	var Ha = U(null);

	function Ac() {
		var e = Ha.current;
		return e !== null ? e : Ce.pooledCache
	}

	function Uu(e, l) {
		l === null ? V(Ha, Ha.current) : V(Ha, l.pool)
	}

	function af() {
		var e = Ac();
		return e === null ? null : {
			parent: el._currentValue,
			pool: e
		}
	}
	var dn = Error(r(460)),
		nf = Error(r(474)),
		Hu = Error(r(542)),
		Ec = {
			then: function() {}
		};

	function uf(e) {
		return e = e.status, e === "fulfilled" || e === "rejected"
	}

	function ju() {}

	function of(e, l, t) {
		switch (t = e[t], t === void 0 ? e.push(l) : t !== l && (l.then(ju, ju), l = t), l.status) {
			case "fulfilled":
				return l.value;
			case "rejected":
				throw e = l.reason, rf(e), e;
			default:
				if (typeof l.status == "string") l.then(ju, ju);
				else {
					if (e = Ce, e !== null && 100 < e.shellSuspendCounter) throw Error(r(482));
					e = l, e.status = "pending", e.then(function(a) {
						if (l.status === "pending") {
							var n = l;
							n.status = "fulfilled", n.value = a
						}
					}, function(a) {
						if (l.status === "pending") {
							var n = l;
							n.status = "rejected", n.reason = a
						}
					})
				}
				switch (l.status) {
					case "fulfilled":
						return l.value;
					case "rejected":
						throw e = l.reason, rf(e), e
				}
				throw pn = l, dn
		}
	}
	var pn = null;

	function cf() {
		if (pn === null) throw Error(r(459));
		var e = pn;
		return pn = null, e
	}

	function rf(e) {
		if (e === dn || e === Hu) throw Error(r(483))
	}
	var Zt = !1;

	function Mc(e) {
		e.updateQueue = {
			baseState: e.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		}
	}

	function Lc(e, l) {
		e = e.updateQueue, l.updateQueue === e && (l.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		})
	}

	function It(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		}
	}

	function Jt(e, l, t) {
		var a = e.updateQueue;
		if (a === null) return null;
		if (a = a.shared, (Te & 2) !== 0) {
			var n = a.pending;
			return n === null ? l.next = l : (l.next = n.next, n.next = l), a.pending = l, l = Cu(e), Xs(e, null, t), l
		}
		return Bu(e, a, l, t), Cu(e)
	}

	function hn(e, l, t) {
		if (l = l.updateQueue, l !== null && (l = l.shared, (t & 4194048) !== 0)) {
			var a = l.lanes;
			a &= e.pendingLanes, t |= a, l.lanes = t, ru(e, t)
		}
	}

	function Dc(e, l) {
		var t = e.updateQueue,
			a = e.alternate;
		if (a !== null && (a = a.updateQueue, t === a)) {
			var n = null,
				u = null;
			if (t = t.firstBaseUpdate, t !== null) {
				do {
					var c = {
						lane: t.lane,
						tag: t.tag,
						payload: t.payload,
						callback: null,
						next: null
					};
					u === null ? n = u = c : u = u.next = c, t = t.next
				} while (t !== null);
				u === null ? n = u = l : u = u.next = l
			} else n = u = l;
			t = {
				baseState: a.baseState,
				firstBaseUpdate: n,
				lastBaseUpdate: u,
				shared: a.shared,
				callbacks: a.callbacks
			}, e.updateQueue = t;
			return
		}
		e = t.lastBaseUpdate, e === null ? t.firstBaseUpdate = l : e.next = l, t.lastBaseUpdate = l
	}
	var Bc = !1;

	function mn() {
		if (Bc) {
			var e = di;
			if (e !== null) throw e
		}
	}

	function gn(e, l, t, a) {
		Bc = !1;
		var n = e.updateQueue;
		Zt = !1;
		var u = n.firstBaseUpdate,
			c = n.lastBaseUpdate,
			f = n.shared.pending;
		if (f !== null) {
			n.shared.pending = null;
			var m = f,
				L = m.next;
			m.next = null, c === null ? u = L : c.next = L, c = m;
			var O = e.alternate;
			O !== null && (O = O.updateQueue, f = O.lastBaseUpdate, f !== c && (f === null ? O.firstBaseUpdate = L : f.next = L, O.lastBaseUpdate = m))
		}
		if (u !== null) {
			var _ = n.baseState;
			c = 0, O = L = m = null, f = u;
			do {
				var D = f.lane & -536870913,
					B = D !== f.lane;
				if (B ? (be & D) === D : (a & D) === D) {
					D !== 0 && D === fi && (Bc = !0), O !== null && (O = O.next = {
						lane: 0,
						tag: f.tag,
						payload: f.payload,
						callback: null,
						next: null
					});
					e: {
						var ae = e,
							le = f;D = l;
						var Le = t;
						switch (le.tag) {
							case 1:
								if (ae = le.payload, typeof ae == "function") {
									_ = ae.call(Le, _, D);
									break e
								}
								_ = ae;
								break e;
							case 3:
								ae.flags = ae.flags & -65537 | 128;
							case 0:
								if (ae = le.payload, D = typeof ae == "function" ? ae.call(Le, _, D) : ae, D == null) break e;
								_ = C({}, _, D);
								break e;
							case 2:
								Zt = !0
						}
					}
					D = f.callback, D !== null && (e.flags |= 64, B && (e.flags |= 8192), B = n.callbacks, B === null ? n.callbacks = [D] : B.push(D))
				} else B = {
					lane: D,
					tag: f.tag,
					payload: f.payload,
					callback: f.callback,
					next: null
				}, O === null ? (L = O = B, m = _) : O = O.next = B, c |= D;
				if (f = f.next, f === null) {
					if (f = n.shared.pending, f === null) break;
					B = f, f = B.next, B.next = null, n.lastBaseUpdate = B, n.shared.pending = null
				}
			} while (!0);
			O === null && (m = _), n.baseState = m, n.firstBaseUpdate = L, n.lastBaseUpdate = O, u === null && (n.shared.lanes = 0), na |= c, e.lanes = c, e.memoizedState = _
		}
	}

	function sf(e, l) {
		if (typeof e != "function") throw Error(r(191, e));
		e.call(l)
	}

	function ff(e, l) {
		var t = e.callbacks;
		if (t !== null)
			for (e.callbacks = null, e = 0; e < t.length; e++) sf(t[e], l)
	}
	var pi = U(null),
		Gu = U(0);

	function df(e, l) {
		e = Bt, V(Gu, e), V(pi, l), Bt = e | l.baseLanes
	}

	function Cc() {
		V(Gu, Bt), V(pi, pi.current)
	}

	function Nc() {
		Bt = Gu.current, Y(pi), Y(Gu)
	}
	var $t = 0,
		se = null,
		Ee = null,
		Ie = null,
		Ru = !1,
		hi = !1,
		ja = !1,
		wu = 0,
		bn = 0,
		mi = null,
		Yh = 0;

	function Ke() {
		throw Error(r(321))
	}

	function Oc(e, l) {
		if (l === null) return !1;
		for (var t = 0; t < l.length && t < e.length; t++)
			if (!kl(e[t], l[t])) return !1;
		return !0
	}

	function kc(e, l, t, a, n, u) {
		return $t = u, se = l, l.memoizedState = null, l.updateQueue = null, l.lanes = 0, N.H = e === null || e.memoizedState === null ? Zf : If, ja = !1, u = t(a, n), ja = !1, hi && (u = hf(l, t, a, n)), pf(e), u
	}

	function pf(e) {
		N.H = Qu;
		var l = Ee !== null && Ee.next !== null;
		if ($t = 0, Ie = Ee = se = null, Ru = !1, bn = 0, mi = null, l) throw Error(r(300));
		e === null || nl || (e = e.dependencies, e !== null && zu(e) && (nl = !0))
	}

	function hf(e, l, t, a) {
		se = e;
		var n = 0;
		do {
			if (hi && (mi = null), bn = 0, hi = !1, 25 <= n) throw Error(r(301));
			if (n += 1, Ie = Ee = null, e.updateQueue != null) {
				var u = e.updateQueue;
				u.lastEffect = null, u.events = null, u.stores = null, u.memoCache != null && (u.memoCache.index = 0)
			}
			N.H = Ih, u = l(t, a)
		} while (hi);
		return u
	}

	function qh() {
		var e = N.H,
			l = e.useState()[0];
		return l = typeof l.then == "function" ? vn(l) : l, e = e.useState()[0], (Ee !== null ? Ee.memoizedState : null) !== e && (se.flags |= 1024), l
	}

	function zc() {
		var e = wu !== 0;
		return wu = 0, e
	}

	function _c(e, l, t) {
		l.updateQueue = e.updateQueue, l.flags &= -2053, e.lanes &= ~t
	}

	function Uc(e) {
		if (Ru) {
			for (e = e.memoizedState; e !== null;) {
				var l = e.queue;
				l !== null && (l.pending = null), e = e.next
			}
			Ru = !1
		}
		$t = 0, Ie = Ee = se = null, hi = !1, bn = wu = 0, mi = null
	}

	function Ll() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return Ie === null ? se.memoizedState = Ie = e : Ie = Ie.next = e, Ie
	}

	function Je() {
		if (Ee === null) {
			var e = se.alternate;
			e = e !== null ? e.memoizedState : null
		} else e = Ee.next;
		var l = Ie === null ? se.memoizedState : Ie.next;
		if (l !== null) Ie = l, Ee = e;
		else {
			if (e === null) throw se.alternate === null ? Error(r(467)) : Error(r(310));
			Ee = e, e = {
				memoizedState: Ee.memoizedState,
				baseState: Ee.baseState,
				baseQueue: Ee.baseQueue,
				queue: Ee.queue,
				next: null
			}, Ie === null ? se.memoizedState = Ie = e : Ie = Ie.next = e
		}
		return Ie
	}

	function Hc() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		}
	}

	function vn(e) {
		var l = bn;
		return bn += 1, mi === null && (mi = []), e = of(mi, e, l), l = se, (Ie === null ? l.memoizedState : Ie.next) === null && (l = l.alternate, N.H = l === null || l.memoizedState === null ? Zf : If), e
	}

	function Fu(e) {
		if (e !== null && typeof e == "object") {
			if (typeof e.then == "function") return vn(e);
			if (e.$$typeof === _e) return vl(e)
		}
		throw Error(r(438, String(e)))
	}

	function jc(e) {
		var l = null,
			t = se.updateQueue;
		if (t !== null && (l = t.memoCache), l == null) {
			var a = se.alternate;
			a !== null && (a = a.updateQueue, a !== null && (a = a.memoCache, a != null && (l = {
				data: a.data.map(function(n) {
					return n.slice()
				}),
				index: 0
			})))
		}
		if (l == null && (l = {
				data: [],
				index: 0
			}), t === null && (t = Hc(), se.updateQueue = t), t.memoCache = l, t = l.data[l.index], t === void 0)
			for (t = l.data[l.index] = Array(e), a = 0; a < e; a++) t[a] = Xe;
		return l.index++, t
	}

	function Tt(e, l) {
		return typeof l == "function" ? l(e) : l
	}

	function Vu(e) {
		var l = Je();
		return Gc(l, Ee, e)
	}

	function Gc(e, l, t) {
		var a = e.queue;
		if (a === null) throw Error(r(311));
		a.lastRenderedReducer = t;
		var n = e.baseQueue,
			u = a.pending;
		if (u !== null) {
			if (n !== null) {
				var c = n.next;
				n.next = u.next, u.next = c
			}
			l.baseQueue = n = u, a.pending = null
		}
		if (u = e.baseState, n === null) e.memoizedState = u;
		else {
			l = n.next;
			var f = c = null,
				m = null,
				L = l,
				O = !1;
			do {
				var _ = L.lane & -536870913;
				if (_ !== L.lane ? (be & _) === _ : ($t & _) === _) {
					var D = L.revertLane;
					if (D === 0) m !== null && (m = m.next = {
						lane: 0,
						revertLane: 0,
						action: L.action,
						hasEagerState: L.hasEagerState,
						eagerState: L.eagerState,
						next: null
					}), _ === fi && (O = !0);
					else if (($t & D) === D) {
						L = L.next, D === fi && (O = !0);
						continue
					} else _ = {
						lane: 0,
						revertLane: L.revertLane,
						action: L.action,
						hasEagerState: L.hasEagerState,
						eagerState: L.eagerState,
						next: null
					}, m === null ? (f = m = _, c = u) : m = m.next = _, se.lanes |= D, na |= D;
					_ = L.action, ja && t(u, _), u = L.hasEagerState ? L.eagerState : t(u, _)
				} else D = {
					lane: _,
					revertLane: L.revertLane,
					action: L.action,
					hasEagerState: L.hasEagerState,
					eagerState: L.eagerState,
					next: null
				}, m === null ? (f = m = D, c = u) : m = m.next = D, se.lanes |= _, na |= _;
				L = L.next
			} while (L !== null && L !== l);
			if (m === null ? c = u : m.next = f, !kl(u, e.memoizedState) && (nl = !0, O && (t = di, t !== null))) throw t;
			e.memoizedState = u, e.baseState = c, e.baseQueue = m, a.lastRenderedState = u
		}
		return n === null && (a.lanes = 0), [e.memoizedState, a.dispatch]
	}

	function Rc(e) {
		var l = Je(),
			t = l.queue;
		if (t === null) throw Error(r(311));
		t.lastRenderedReducer = e;
		var a = t.dispatch,
			n = t.pending,
			u = l.memoizedState;
		if (n !== null) {
			t.pending = null;
			var c = n = n.next;
			do u = e(u, c.action), c = c.next; while (c !== n);
			kl(u, l.memoizedState) || (nl = !0), l.memoizedState = u, l.baseQueue === null && (l.baseState = u), t.lastRenderedState = u
		}
		return [u, a]
	}

	function mf(e, l, t) {
		var a = se,
			n = Je(),
			u = xe;
		if (u) {
			if (t === void 0) throw Error(r(407));
			t = t()
		} else t = l();
		var c = !kl((Ee || n).memoizedState, t);
		c && (n.memoizedState = t, nl = !0), n = n.queue;
		var f = vf.bind(null, a, n, e);
		if (yn(2048, 8, f, [e]), n.getSnapshot !== l || c || Ie !== null && Ie.memoizedState.tag & 1) {
			if (a.flags |= 2048, gi(9, Yu(), bf.bind(null, a, n, t, l), null), Ce === null) throw Error(r(349));
			u || ($t & 124) !== 0 || gf(a, l, t)
		}
		return t
	}

	function gf(e, l, t) {
		e.flags |= 16384, e = {
			getSnapshot: l,
			value: t
		}, l = se.updateQueue, l === null ? (l = Hc(), se.updateQueue = l, l.stores = [e]) : (t = l.stores, t === null ? l.stores = [e] : t.push(e))
	}

	function bf(e, l, t, a) {
		l.value = t, l.getSnapshot = a, yf(l) && Sf(e)
	}

	function vf(e, l, t) {
		return t(function() {
			yf(l) && Sf(e)
		})
	}

	function yf(e) {
		var l = e.getSnapshot;
		e = e.value;
		try {
			var t = l();
			return !kl(e, t)
		} catch {
			return !0
		}
	}

	function Sf(e) {
		var l = oi(e, 2);
		l !== null && Gl(l, e, 2)
	}

	function wc(e) {
		var l = Ll();
		if (typeof e == "function") {
			var t = e;
			if (e = t(), ja) {
				Wl(!0);
				try {
					t()
				} finally {
					Wl(!1)
				}
			}
		}
		return l.memoizedState = l.baseState = e, l.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Tt,
			lastRenderedState: e
		}, l
	}

	function xf(e, l, t, a) {
		return e.baseState = t, Gc(e, Ee, typeof a == "function" ? a : Tt)
	}

	function Kh(e, l, t, a, n) {
		if (Ku(e)) throw Error(r(485));
		if (e = l.action, e !== null) {
			var u = {
				payload: n,
				action: e,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(c) {
					u.listeners.push(c)
				}
			};
			N.T !== null ? t(!0) : u.isTransition = !1, a(u), t = l.pending, t === null ? (u.next = l.pending = u, Tf(l, u)) : (u.next = t.next, l.pending = t.next = u)
		}
	}

	function Tf(e, l) {
		var t = l.action,
			a = l.payload,
			n = e.state;
		if (l.isTransition) {
			var u = N.T,
				c = {};
			N.T = c;
			try {
				var f = t(n, a),
					m = N.S;
				m !== null && m(c, f), Af(e, l, f)
			} catch (L) {
				Fc(e, l, L)
			} finally {
				N.T = u
			}
		} else try {
			u = t(n, a), Af(e, l, u)
		} catch (L) {
			Fc(e, l, L)
		}
	}

	function Af(e, l, t) {
		t !== null && typeof t == "object" && typeof t.then == "function" ? t.then(function(a) {
			Ef(e, l, a)
		}, function(a) {
			return Fc(e, l, a)
		}) : Ef(e, l, t)
	}

	function Ef(e, l, t) {
		l.status = "fulfilled", l.value = t, Mf(l), e.state = t, l = e.pending, l !== null && (t = l.next, t === l ? e.pending = null : (t = t.next, l.next = t, Tf(e, t)))
	}

	function Fc(e, l, t) {
		var a = e.pending;
		if (e.pending = null, a !== null) {
			a = a.next;
			do l.status = "rejected", l.reason = t, Mf(l), l = l.next; while (l !== a)
		}
		e.action = null
	}

	function Mf(e) {
		e = e.listeners;
		for (var l = 0; l < e.length; l++)(0, e[l])()
	}

	function Lf(e, l) {
		return l
	}

	function Df(e, l) {
		if (xe) {
			var t = Ce.formState;
			if (t !== null) {
				e: {
					var a = se;
					if (xe) {
						if (je) {
							l: {
								for (var n = je, u = nt; n.nodeType !== 8;) {
									if (!u) {
										n = null;
										break l
									}
									if (n = $l(n.nextSibling), n === null) {
										n = null;
										break l
									}
								}
								u = n.data,
								n = u === "F!" || u === "F" ? n : null
							}
							if (n) {
								je = $l(n.nextSibling), a = n.data === "F!";
								break e
							}
						}
						za(a)
					}
					a = !1
				}
				a && (l = t[0])
			}
		}
		return t = Ll(), t.memoizedState = t.baseState = l, a = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Lf,
			lastRenderedState: l
		}, t.queue = a, t = Qf.bind(null, se, a), a.dispatch = t, a = wc(!1), u = Qc.bind(null, se, !1, a.queue), a = Ll(), n = {
			state: l,
			dispatch: null,
			action: e,
			pending: null
		}, a.queue = n, t = Kh.bind(null, se, n, u, t), n.dispatch = t, a.memoizedState = e, [l, t, !1]
	}

	function Bf(e) {
		var l = Je();
		return Cf(l, Ee, e)
	}

	function Cf(e, l, t) {
		if (l = Gc(e, l, Lf)[0], e = Vu(Tt)[0], typeof l == "object" && l !== null && typeof l.then == "function") try {
			var a = vn(l)
		} catch (c) {
			throw c === dn ? Hu : c
		} else a = l;
		l = Je();
		var n = l.queue,
			u = n.dispatch;
		return t !== l.memoizedState && (se.flags |= 2048, gi(9, Yu(), Qh.bind(null, n, t), null)), [a, u, e]
	}

	function Qh(e, l) {
		e.action = l
	}

	function Nf(e) {
		var l = Je(),
			t = Ee;
		if (t !== null) return Cf(l, t, e);
		Je(), l = l.memoizedState, t = Je();
		var a = t.queue.dispatch;
		return t.memoizedState = e, [l, a, !1]
	}

	function gi(e, l, t, a) {
		return e = {
			tag: e,
			create: t,
			deps: a,
			inst: l,
			next: null
		}, l = se.updateQueue, l === null && (l = Hc(), se.updateQueue = l), t = l.lastEffect, t === null ? l.lastEffect = e.next = e : (a = t.next, t.next = e, e.next = a, l.lastEffect = e), e
	}

	function Yu() {
		return {
			destroy: void 0,
			resource: void 0
		}
	}

	function Of() {
		return Je().memoizedState
	}

	function qu(e, l, t, a) {
		var n = Ll();
		a = a === void 0 ? null : a, se.flags |= e, n.memoizedState = gi(1 | l, Yu(), t, a)
	}

	function yn(e, l, t, a) {
		var n = Je();
		a = a === void 0 ? null : a;
		var u = n.memoizedState.inst;
		Ee !== null && a !== null && Oc(a, Ee.memoizedState.deps) ? n.memoizedState = gi(l, u, t, a) : (se.flags |= e, n.memoizedState = gi(1 | l, u, t, a))
	}

	function kf(e, l) {
		qu(8390656, 8, e, l)
	}

	function zf(e, l) {
		yn(2048, 8, e, l)
	}

	function _f(e, l) {
		return yn(4, 2, e, l)
	}

	function Uf(e, l) {
		return yn(4, 4, e, l)
	}

	function Hf(e, l) {
		if (typeof l == "function") {
			e = e();
			var t = l(e);
			return function() {
				typeof t == "function" ? t() : l(null)
			}
		}
		if (l != null) return e = e(), l.current = e,
			function() {
				l.current = null
			}
	}

	function jf(e, l, t) {
		t = t != null ? t.concat([e]) : null, yn(4, 4, Hf.bind(null, l, e), t)
	}

	function Vc() {}

	function Gf(e, l) {
		var t = Je();
		l = l === void 0 ? null : l;
		var a = t.memoizedState;
		return l !== null && Oc(l, a[1]) ? a[0] : (t.memoizedState = [e, l], e)
	}

	function Rf(e, l) {
		var t = Je();
		l = l === void 0 ? null : l;
		var a = t.memoizedState;
		if (l !== null && Oc(l, a[1])) return a[0];
		if (a = e(), ja) {
			Wl(!0);
			try {
				e()
			} finally {
				Wl(!1)
			}
		}
		return t.memoizedState = [a, l], a
	}

	function Yc(e, l, t) {
		return t === void 0 || ($t & 1073741824) !== 0 ? e.memoizedState = l : (e.memoizedState = t, e = Vd(), se.lanes |= e, na |= e, t)
	}

	function wf(e, l, t, a) {
		return kl(t, l) ? t : pi.current !== null ? (e = Yc(e, t, a), kl(e, l) || (nl = !0), e) : ($t & 42) === 0 ? (nl = !0, e.memoizedState = t) : (e = Vd(), se.lanes |= e, na |= e, l)
	}

	function Ff(e, l, t, a, n) {
		var u = F.p;
		F.p = u !== 0 && 8 > u ? u : 8;
		var c = N.T,
			f = {};
		N.T = f, Qc(e, !1, l, t);
		try {
			var m = n(),
				L = N.S;
			if (L !== null && L(f, m), m !== null && typeof m == "object" && typeof m.then == "function") {
				var O = Vh(m, a);
				Sn(e, l, O, jl(e))
			} else Sn(e, l, a, jl(e))
		} catch (_) {
			Sn(e, l, {
				then: function() {},
				status: "rejected",
				reason: _
			}, jl())
		} finally {
			F.p = u, N.T = c
		}
	}

	function Ph() {}

	function qc(e, l, t, a) {
		if (e.tag !== 5) throw Error(r(476));
		var n = Vf(e).queue;
		Ff(e, n, l, X, t === null ? Ph : function() {
			return Yf(e), t(a)
		})
	}

	function Vf(e) {
		var l = e.memoizedState;
		if (l !== null) return l;
		l = {
			memoizedState: X,
			baseState: X,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: Tt,
				lastRenderedState: X
			},
			next: null
		};
		var t = {};
		return l.next = {
			memoizedState: t,
			baseState: t,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: Tt,
				lastRenderedState: t
			},
			next: null
		}, e.memoizedState = l, e = e.alternate, e !== null && (e.memoizedState = l), l
	}

	function Yf(e) {
		var l = Vf(e).next.queue;
		Sn(e, l, {}, jl())
	}

	function Kc() {
		return vl(Gn)
	}

	function qf() {
		return Je().memoizedState
	}

	function Kf() {
		return Je().memoizedState
	}

	function Xh(e) {
		for (var l = e.return; l !== null;) {
			switch (l.tag) {
				case 24:
				case 3:
					var t = jl();
					e = It(t);
					var a = Jt(l, e, t);
					a !== null && (Gl(a, l, t), hn(a, l, t)), l = {
						cache: xc()
					}, e.payload = l;
					return
			}
			l = l.return
		}
	}

	function Zh(e, l, t) {
		var a = jl();
		t = {
			lane: a,
			revertLane: 0,
			action: t,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, Ku(e) ? Pf(l, t) : (t = fc(e, l, t, a), t !== null && (Gl(t, e, a), Xf(t, l, a)))
	}

	function Qf(e, l, t) {
		var a = jl();
		Sn(e, l, t, a)
	}

	function Sn(e, l, t, a) {
		var n = {
			lane: a,
			revertLane: 0,
			action: t,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (Ku(e)) Pf(l, n);
		else {
			var u = e.alternate;
			if (e.lanes === 0 && (u === null || u.lanes === 0) && (u = l.lastRenderedReducer, u !== null)) try {
				var c = l.lastRenderedState,
					f = u(c, t);
				if (n.hasEagerState = !0, n.eagerState = f, kl(f, c)) return Bu(e, l, n, 0), Ce === null && Du(), !1
			} catch {} finally {}
			if (t = fc(e, l, n, a), t !== null) return Gl(t, e, a), Xf(t, l, a), !0
		}
		return !1
	}

	function Qc(e, l, t, a) {
		if (a = {
				lane: 2,
				revertLane: Er(),
				action: a,
				hasEagerState: !1,
				eagerState: null,
				next: null
			}, Ku(e)) {
			if (l) throw Error(r(479))
		} else l = fc(e, t, a, 2), l !== null && Gl(l, e, 2)
	}

	function Ku(e) {
		var l = e.alternate;
		return e === se || l !== null && l === se
	}

	function Pf(e, l) {
		hi = Ru = !0;
		var t = e.pending;
		t === null ? l.next = l : (l.next = t.next, t.next = l), e.pending = l
	}

	function Xf(e, l, t) {
		if ((t & 4194048) !== 0) {
			var a = l.lanes;
			a &= e.pendingLanes, t |= a, l.lanes = t, ru(e, t)
		}
	}
	var Qu = {
			readContext: vl,
			use: Fu,
			useCallback: Ke,
			useContext: Ke,
			useEffect: Ke,
			useImperativeHandle: Ke,
			useLayoutEffect: Ke,
			useInsertionEffect: Ke,
			useMemo: Ke,
			useReducer: Ke,
			useRef: Ke,
			useState: Ke,
			useDebugValue: Ke,
			useDeferredValue: Ke,
			useTransition: Ke,
			useSyncExternalStore: Ke,
			useId: Ke,
			useHostTransitionStatus: Ke,
			useFormState: Ke,
			useActionState: Ke,
			useOptimistic: Ke,
			useMemoCache: Ke,
			useCacheRefresh: Ke
		},
		Zf = {
			readContext: vl,
			use: Fu,
			useCallback: function(e, l) {
				return Ll().memoizedState = [e, l === void 0 ? null : l], e
			},
			useContext: vl,
			useEffect: kf,
			useImperativeHandle: function(e, l, t) {
				t = t != null ? t.concat([e]) : null, qu(4194308, 4, Hf.bind(null, l, e), t)
			},
			useLayoutEffect: function(e, l) {
				return qu(4194308, 4, e, l)
			},
			useInsertionEffect: function(e, l) {
				qu(4, 2, e, l)
			},
			useMemo: function(e, l) {
				var t = Ll();
				l = l === void 0 ? null : l;
				var a = e();
				if (ja) {
					Wl(!0);
					try {
						e()
					} finally {
						Wl(!1)
					}
				}
				return t.memoizedState = [a, l], a
			},
			useReducer: function(e, l, t) {
				var a = Ll();
				if (t !== void 0) {
					var n = t(l);
					if (ja) {
						Wl(!0);
						try {
							t(l)
						} finally {
							Wl(!1)
						}
					}
				} else n = l;
				return a.memoizedState = a.baseState = n, e = {
					pending: null,
					lanes: 0,
					dispatch: null,
					lastRenderedReducer: e,
					lastRenderedState: n
				}, a.queue = e, e = e.dispatch = Zh.bind(null, se, e), [a.memoizedState, e]
			},
			useRef: function(e) {
				var l = Ll();
				return e = {
					current: e
				}, l.memoizedState = e
			},
			useState: function(e) {
				e = wc(e);
				var l = e.queue,
					t = Qf.bind(null, se, l);
				return l.dispatch = t, [e.memoizedState, t]
			},
			useDebugValue: Vc,
			useDeferredValue: function(e, l) {
				var t = Ll();
				return Yc(t, e, l)
			},
			useTransition: function() {
				var e = wc(!1);
				return e = Ff.bind(null, se, e.queue, !0, !1), Ll().memoizedState = e, [!1, e]
			},
			useSyncExternalStore: function(e, l, t) {
				var a = se,
					n = Ll();
				if (xe) {
					if (t === void 0) throw Error(r(407));
					t = t()
				} else {
					if (t = l(), Ce === null) throw Error(r(349));
					(be & 124) !== 0 || gf(a, l, t)
				}
				n.memoizedState = t;
				var u = {
					value: t,
					getSnapshot: l
				};
				return n.queue = u, kf(vf.bind(null, a, u, e), [e]), a.flags |= 2048, gi(9, Yu(), bf.bind(null, a, u, t, l), null), t
			},
			useId: function() {
				var e = Ll(),
					l = Ce.identifierPrefix;
				if (xe) {
					var t = yt,
						a = vt;
					t = (a & ~(1 << 32 - cl(a) - 1)).toString(32) + t, l = "«" + l + "R" + t, t = wu++, 0 < t && (l += "H" + t.toString(32)), l += "»"
				} else t = Yh++, l = "«" + l + "r" + t.toString(32) + "»";
				return e.memoizedState = l
			},
			useHostTransitionStatus: Kc,
			useFormState: Df,
			useActionState: Df,
			useOptimistic: function(e) {
				var l = Ll();
				l.memoizedState = l.baseState = e;
				var t = {
					pending: null,
					lanes: 0,
					dispatch: null,
					lastRenderedReducer: null,
					lastRenderedState: null
				};
				return l.queue = t, l = Qc.bind(null, se, !0, t), t.dispatch = l, [e, l]
			},
			useMemoCache: jc,
			useCacheRefresh: function() {
				return Ll().memoizedState = Xh.bind(null, se)
			}
		},
		If = {
			readContext: vl,
			use: Fu,
			useCallback: Gf,
			useContext: vl,
			useEffect: zf,
			useImperativeHandle: jf,
			useInsertionEffect: _f,
			useLayoutEffect: Uf,
			useMemo: Rf,
			useReducer: Vu,
			useRef: Of,
			useState: function() {
				return Vu(Tt)
			},
			useDebugValue: Vc,
			useDeferredValue: function(e, l) {
				var t = Je();
				return wf(t, Ee.memoizedState, e, l)
			},
			useTransition: function() {
				var e = Vu(Tt)[0],
					l = Je().memoizedState;
				return [typeof e == "boolean" ? e : vn(e), l]
			},
			useSyncExternalStore: mf,
			useId: qf,
			useHostTransitionStatus: Kc,
			useFormState: Bf,
			useActionState: Bf,
			useOptimistic: function(e, l) {
				var t = Je();
				return xf(t, Ee, e, l)
			},
			useMemoCache: jc,
			useCacheRefresh: Kf
		},
		Ih = {
			readContext: vl,
			use: Fu,
			useCallback: Gf,
			useContext: vl,
			useEffect: zf,
			useImperativeHandle: jf,
			useInsertionEffect: _f,
			useLayoutEffect: Uf,
			useMemo: Rf,
			useReducer: Rc,
			useRef: Of,
			useState: function() {
				return Rc(Tt)
			},
			useDebugValue: Vc,
			useDeferredValue: function(e, l) {
				var t = Je();
				return Ee === null ? Yc(t, e, l) : wf(t, Ee.memoizedState, e, l)
			},
			useTransition: function() {
				var e = Rc(Tt)[0],
					l = Je().memoizedState;
				return [typeof e == "boolean" ? e : vn(e), l]
			},
			useSyncExternalStore: mf,
			useId: qf,
			useHostTransitionStatus: Kc,
			useFormState: Nf,
			useActionState: Nf,
			useOptimistic: function(e, l) {
				var t = Je();
				return Ee !== null ? xf(t, Ee, e, l) : (t.baseState = e, [e, t.queue.dispatch])
			},
			useMemoCache: jc,
			useCacheRefresh: Kf
		},
		bi = null,
		xn = 0;

	function Pu(e) {
		var l = xn;
		return xn += 1, bi === null && (bi = []), of(bi, e, l)
	}

	function Tn(e, l) {
		l = l.props.ref, e.ref = l !== void 0 ? l : null
	}

	function Xu(e, l) {
		throw l.$$typeof === y ? Error(r(525)) : (e = Object.prototype.toString.call(l), Error(r(31, e === "[object Object]" ? "object with keys {" + Object.keys(l).join(", ") + "}" : e)))
	}

	function Jf(e) {
		var l = e._init;
		return l(e._payload)
	}

	function $f(e) {
		function l(E, x) {
			if (e) {
				var M = E.deletions;
				M === null ? (E.deletions = [x], E.flags |= 16) : M.push(x)
			}
		}

		function t(E, x) {
			if (!e) return null;
			for (; x !== null;) l(E, x), x = x.sibling;
			return null
		}

		function a(E) {
			for (var x = new Map; E !== null;) E.key !== null ? x.set(E.key, E) : x.set(E.index, E), E = E.sibling;
			return x
		}

		function n(E, x) {
			return E = bt(E, x), E.index = 0, E.sibling = null, E
		}

		function u(E, x, M) {
			return E.index = M, e ? (M = E.alternate, M !== null ? (M = M.index, M < x ? (E.flags |= 67108866, x) : M) : (E.flags |= 67108866, x)) : (E.flags |= 1048576, x)
		}

		function c(E) {
			return e && E.alternate === null && (E.flags |= 67108866), E
		}

		function f(E, x, M, k) {
			return x === null || x.tag !== 6 ? (x = pc(M, E.mode, k), x.return = E, x) : (x = n(x, M), x.return = E, x)
		}

		function m(E, x, M, k) {
			var q = M.type;
			return q === J ? O(E, x, M.props.children, k, M.key) : x !== null && (x.elementType === q || typeof q == "object" && q !== null && q.$$typeof === $ && Jf(q) === x.type) ? (x = n(x, M.props), Tn(x, M), x.return = E, x) : (x = Nu(M.type, M.key, M.props, null, E.mode, k), Tn(x, M), x.return = E, x)
		}

		function L(E, x, M, k) {
			return x === null || x.tag !== 4 || x.stateNode.containerInfo !== M.containerInfo || x.stateNode.implementation !== M.implementation ? (x = hc(M, E.mode, k), x.return = E, x) : (x = n(x, M.children || []), x.return = E, x)
		}

		function O(E, x, M, k, q) {
			return x === null || x.tag !== 7 ? (x = Ca(M, E.mode, k, q), x.return = E, x) : (x = n(x, M), x.return = E, x)
		}

		function _(E, x, M) {
			if (typeof x == "string" && x !== "" || typeof x == "number" || typeof x == "bigint") return x = pc("" + x, E.mode, M), x.return = E, x;
			if (typeof x == "object" && x !== null) {
				switch (x.$$typeof) {
					case j:
						return M = Nu(x.type, x.key, x.props, null, E.mode, M), Tn(M, x), M.return = E, M;
					case R:
						return x = hc(x, E.mode, M), x.return = E, x;
					case $:
						var k = x._init;
						return x = k(x._payload), _(E, x, M)
				}
				if (We(x) || we(x)) return x = Ca(x, E.mode, M, null), x.return = E, x;
				if (typeof x.then == "function") return _(E, Pu(x), M);
				if (x.$$typeof === _e) return _(E, _u(E, x), M);
				Xu(E, x)
			}
			return null
		}

		function D(E, x, M, k) {
			var q = x !== null ? x.key : null;
			if (typeof M == "string" && M !== "" || typeof M == "number" || typeof M == "bigint") return q !== null ? null : f(E, x, "" + M, k);
			if (typeof M == "object" && M !== null) {
				switch (M.$$typeof) {
					case j:
						return M.key === q ? m(E, x, M, k) : null;
					case R:
						return M.key === q ? L(E, x, M, k) : null;
					case $:
						return q = M._init, M = q(M._payload), D(E, x, M, k)
				}
				if (We(M) || we(M)) return q !== null ? null : O(E, x, M, k, null);
				if (typeof M.then == "function") return D(E, x, Pu(M), k);
				if (M.$$typeof === _e) return D(E, x, _u(E, M), k);
				Xu(E, M)
			}
			return null
		}

		function B(E, x, M, k, q) {
			if (typeof k == "string" && k !== "" || typeof k == "number" || typeof k == "bigint") return E = E.get(M) || null, f(x, E, "" + k, q);
			if (typeof k == "object" && k !== null) {
				switch (k.$$typeof) {
					case j:
						return E = E.get(k.key === null ? M : k.key) || null, m(x, E, k, q);
					case R:
						return E = E.get(k.key === null ? M : k.key) || null, L(x, E, k, q);
					case $:
						var de = k._init;
						return k = de(k._payload), B(E, x, M, k, q)
				}
				if (We(k) || we(k)) return E = E.get(M) || null, O(x, E, k, q, null);
				if (typeof k.then == "function") return B(E, x, M, Pu(k), q);
				if (k.$$typeof === _e) return B(E, x, M, _u(x, k), q);
				Xu(x, k)
			}
			return null
		}

		function ae(E, x, M, k) {
			for (var q = null, de = null, P = x, te = x = 0, ol = null; P !== null && te < M.length; te++) {
				P.index > te ? (ol = P, P = null) : ol = P.sibling;
				var Se = D(E, P, M[te], k);
				if (Se === null) {
					P === null && (P = ol);
					break
				}
				e && P && Se.alternate === null && l(E, P), x = u(Se, x, te), de === null ? q = Se : de.sibling = Se, de = Se, P = ol
			}
			if (te === M.length) return t(E, P), xe && Oa(E, te), q;
			if (P === null) {
				for (; te < M.length; te++) P = _(E, M[te], k), P !== null && (x = u(P, x, te), de === null ? q = P : de.sibling = P, de = P);
				return xe && Oa(E, te), q
			}
			for (P = a(P); te < M.length; te++) ol = B(P, E, te, M[te], k), ol !== null && (e && ol.alternate !== null && P.delete(ol.key === null ? te : ol.key), x = u(ol, x, te), de === null ? q = ol : de.sibling = ol, de = ol);
			return e && P.forEach(function(ha) {
				return l(E, ha)
			}), xe && Oa(E, te), q
		}

		function le(E, x, M, k) {
			if (M == null) throw Error(r(151));
			for (var q = null, de = null, P = x, te = x = 0, ol = null, Se = M.next(); P !== null && !Se.done; te++, Se = M.next()) {
				P.index > te ? (ol = P, P = null) : ol = P.sibling;
				var ha = D(E, P, Se.value, k);
				if (ha === null) {
					P === null && (P = ol);
					break
				}
				e && P && ha.alternate === null && l(E, P), x = u(ha, x, te), de === null ? q = ha : de.sibling = ha, de = ha, P = ol
			}
			if (Se.done) return t(E, P), xe && Oa(E, te), q;
			if (P === null) {
				for (; !Se.done; te++, Se = M.next()) Se = _(E, Se.value, k), Se !== null && (x = u(Se, x, te), de === null ? q = Se : de.sibling = Se, de = Se);
				return xe && Oa(E, te), q
			}
			for (P = a(P); !Se.done; te++, Se = M.next()) Se = B(P, E, te, Se.value, k), Se !== null && (e && Se.alternate !== null && P.delete(Se.key === null ? te : Se.key), x = u(Se, x, te), de === null ? q = Se : de.sibling = Se, de = Se);
			return e && P.forEach(function(J1) {
				return l(E, J1)
			}), xe && Oa(E, te), q
		}

		function Le(E, x, M, k) {
			if (typeof M == "object" && M !== null && M.type === J && M.key === null && (M = M.props.children), typeof M == "object" && M !== null) {
				switch (M.$$typeof) {
					case j:
						e: {
							for (var q = M.key; x !== null;) {
								if (x.key === q) {
									if (q = M.type, q === J) {
										if (x.tag === 7) {
											t(E, x.sibling), k = n(x, M.props.children), k.return = E, E = k;
											break e
										}
									} else if (x.elementType === q || typeof q == "object" && q !== null && q.$$typeof === $ && Jf(q) === x.type) {
										t(E, x.sibling), k = n(x, M.props), Tn(k, M), k.return = E, E = k;
										break e
									}
									t(E, x);
									break
								} else l(E, x);
								x = x.sibling
							}
							M.type === J ? (k = Ca(M.props.children, E.mode, k, M.key), k.return = E, E = k) : (k = Nu(M.type, M.key, M.props, null, E.mode, k), Tn(k, M), k.return = E, E = k)
						}
						return c(E);
					case R:
						e: {
							for (q = M.key; x !== null;) {
								if (x.key === q)
									if (x.tag === 4 && x.stateNode.containerInfo === M.containerInfo && x.stateNode.implementation === M.implementation) {
										t(E, x.sibling), k = n(x, M.children || []), k.return = E, E = k;
										break e
									} else {
										t(E, x);
										break
									}
								else l(E, x);
								x = x.sibling
							}
							k = hc(M, E.mode, k),
							k.return = E,
							E = k
						}
						return c(E);
					case $:
						return q = M._init, M = q(M._payload), Le(E, x, M, k)
				}
				if (We(M)) return ae(E, x, M, k);
				if (we(M)) {
					if (q = we(M), typeof q != "function") throw Error(r(150));
					return M = q.call(M), le(E, x, M, k)
				}
				if (typeof M.then == "function") return Le(E, x, Pu(M), k);
				if (M.$$typeof === _e) return Le(E, x, _u(E, M), k);
				Xu(E, M)
			}
			return typeof M == "string" && M !== "" || typeof M == "number" || typeof M == "bigint" ? (M = "" + M, x !== null && x.tag === 6 ? (t(E, x.sibling), k = n(x, M), k.return = E, E = k) : (t(E, x), k = pc(M, E.mode, k), k.return = E, E = k), c(E)) : t(E, x)
		}
		return function(E, x, M, k) {
			try {
				xn = 0;
				var q = Le(E, x, M, k);
				return bi = null, q
			} catch (P) {
				if (P === dn || P === Hu) throw P;
				var de = zl(29, P, null, E.mode);
				return de.lanes = k, de.return = E, de
			} finally {}
		}
	}
	var vi = $f(!0),
		Wf = $f(!1),
		ql = U(null),
		ut = null;

	function Wt(e) {
		var l = e.alternate;
		V(ll, ll.current & 1), V(ql, e), ut === null && (l === null || pi.current !== null || l.memoizedState !== null) && (ut = e)
	}

	function ed(e) {
		if (e.tag === 22) {
			if (V(ll, ll.current), V(ql, e), ut === null) {
				var l = e.alternate;
				l !== null && l.memoizedState !== null && (ut = e)
			}
		} else ea()
	}

	function ea() {
		V(ll, ll.current), V(ql, ql.current)
	}

	function At(e) {
		Y(ql), ut === e && (ut = null), Y(ll)
	}
	var ll = U(0);

	function Zu(e) {
		for (var l = e; l !== null;) {
			if (l.tag === 13) {
				var t = l.memoizedState;
				if (t !== null && (t = t.dehydrated, t === null || t.data === "$?" || Hr(t))) return l
			} else if (l.tag === 19 && l.memoizedProps.revealOrder !== void 0) {
				if ((l.flags & 128) !== 0) return l
			} else if (l.child !== null) {
				l.child.return = l, l = l.child;
				continue
			}
			if (l === e) break;
			for (; l.sibling === null;) {
				if (l.return === null || l.return === e) return null;
				l = l.return
			}
			l.sibling.return = l.return, l = l.sibling
		}
		return null
	}

	function Pc(e, l, t, a) {
		l = e.memoizedState, t = t(a, l), t = t == null ? l : C({}, l, t), e.memoizedState = t, e.lanes === 0 && (e.updateQueue.baseState = t)
	}
	var Xc = {
		enqueueSetState: function(e, l, t) {
			e = e._reactInternals;
			var a = jl(),
				n = It(a);
			n.payload = l, t != null && (n.callback = t), l = Jt(e, n, a), l !== null && (Gl(l, e, a), hn(l, e, a))
		},
		enqueueReplaceState: function(e, l, t) {
			e = e._reactInternals;
			var a = jl(),
				n = It(a);
			n.tag = 1, n.payload = l, t != null && (n.callback = t), l = Jt(e, n, a), l !== null && (Gl(l, e, a), hn(l, e, a))
		},
		enqueueForceUpdate: function(e, l) {
			e = e._reactInternals;
			var t = jl(),
				a = It(t);
			a.tag = 2, l != null && (a.callback = l), l = Jt(e, a, t), l !== null && (Gl(l, e, t), hn(l, e, t))
		}
	};

	function ld(e, l, t, a, n, u, c) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(a, u, c) : l.prototype && l.prototype.isPureReactComponent ? !an(t, a) || !an(n, u) : !0
	}

	function td(e, l, t, a) {
		e = l.state, typeof l.componentWillReceiveProps == "function" && l.componentWillReceiveProps(t, a), typeof l.UNSAFE_componentWillReceiveProps == "function" && l.UNSAFE_componentWillReceiveProps(t, a), l.state !== e && Xc.enqueueReplaceState(l, l.state, null)
	}

	function Ga(e, l) {
		var t = l;
		if ("ref" in l) {
			t = {};
			for (var a in l) a !== "ref" && (t[a] = l[a])
		}
		if (e = e.defaultProps) {
			t === l && (t = C({}, t));
			for (var n in e) t[n] === void 0 && (t[n] = e[n])
		}
		return t
	}
	var Iu = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var l = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(l)) return
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return
		}
		console.error(e)
	};

	function ad(e) {
		Iu(e)
	}

	function id(e) {
		console.error(e)
	}

	function nd(e) {
		Iu(e)
	}

	function Ju(e, l) {
		try {
			var t = e.onUncaughtError;
			t(l.value, {
				componentStack: l.stack
			})
		} catch (a) {
			setTimeout(function() {
				throw a
			})
		}
	}

	function ud(e, l, t) {
		try {
			var a = e.onCaughtError;
			a(t.value, {
				componentStack: t.stack,
				errorBoundary: l.tag === 1 ? l.stateNode : null
			})
		} catch (n) {
			setTimeout(function() {
				throw n
			})
		}
	}

	function Zc(e, l, t) {
		return t = It(t), t.tag = 3, t.payload = {
			element: null
		}, t.callback = function() {
			Ju(e, l)
		}, t
	}

	function od(e) {
		return e = It(e), e.tag = 3, e
	}

	function cd(e, l, t, a) {
		var n = t.type.getDerivedStateFromError;
		if (typeof n == "function") {
			var u = a.value;
			e.payload = function() {
				return n(u)
			}, e.callback = function() {
				ud(l, t, a)
			}
		}
		var c = t.stateNode;
		c !== null && typeof c.componentDidCatch == "function" && (e.callback = function() {
			ud(l, t, a), typeof n != "function" && (ua === null ? ua = new Set([this]) : ua.add(this));
			var f = a.stack;
			this.componentDidCatch(a.value, {
				componentStack: f !== null ? f : ""
			})
		})
	}

	function Jh(e, l, t, a, n) {
		if (t.flags |= 32768, a !== null && typeof a == "object" && typeof a.then == "function") {
			if (l = t.alternate, l !== null && rn(l, t, n, !0), t = ql.current, t !== null) {
				switch (t.tag) {
					case 13:
						return ut === null ? yr() : t.alternate === null && Ge === 0 && (Ge = 3), t.flags &= -257, t.flags |= 65536, t.lanes = n, a === Ec ? t.flags |= 16384 : (l = t.updateQueue, l === null ? t.updateQueue = new Set([a]) : l.add(a), xr(e, a, n)), !1;
					case 22:
						return t.flags |= 65536, a === Ec ? t.flags |= 16384 : (l = t.updateQueue, l === null ? (l = {
							transitions: null,
							markerInstances: null,
							retryQueue: new Set([a])
						}, t.updateQueue = l) : (t = l.retryQueue, t === null ? l.retryQueue = new Set([a]) : t.add(a)), xr(e, a, n)), !1
				}
				throw Error(r(435, t.tag))
			}
			return xr(e, a, n), yr(), !1
		}
		if (xe) return l = ql.current, l !== null ? ((l.flags & 65536) === 0 && (l.flags |= 256), l.flags |= 65536, l.lanes = n, a !== bc && (e = Error(r(422), {
			cause: a
		}), cn(wl(e, t)))) : (a !== bc && (l = Error(r(423), {
			cause: a
		}), cn(wl(l, t))), e = e.current.alternate, e.flags |= 65536, n &= -n, e.lanes |= n, a = wl(a, t), n = Zc(e.stateNode, a, n), Dc(e, n), Ge !== 4 && (Ge = 2)), !1;
		var u = Error(r(520), {
			cause: a
		});
		if (u = wl(u, t), Cn === null ? Cn = [u] : Cn.push(u), Ge !== 4 && (Ge = 2), l === null) return !0;
		a = wl(a, t), t = l;
		do {
			switch (t.tag) {
				case 3:
					return t.flags |= 65536, e = n & -n, t.lanes |= e, e = Zc(t.stateNode, a, e), Dc(t, e), !1;
				case 1:
					if (l = t.type, u = t.stateNode, (t.flags & 128) === 0 && (typeof l.getDerivedStateFromError == "function" || u !== null && typeof u.componentDidCatch == "function" && (ua === null || !ua.has(u)))) return t.flags |= 65536, n &= -n, t.lanes |= n, n = od(n), cd(n, e, t, a), Dc(t, n), !1
			}
			t = t.return
		} while (t !== null);
		return !1
	}
	var rd = Error(r(461)),
		nl = !1;

	function dl(e, l, t, a) {
		l.child = e === null ? Wf(l, null, t, a) : vi(l, e.child, t, a)
	}

	function sd(e, l, t, a, n) {
		t = t.render;
		var u = l.ref;
		if ("ref" in a) {
			var c = {};
			for (var f in a) f !== "ref" && (c[f] = a[f])
		} else c = a;
		return Ua(l), a = kc(e, l, t, c, u, n), f = zc(), e !== null && !nl ? (_c(e, l, n), Et(e, l, n)) : (xe && f && mc(l), l.flags |= 1, dl(e, l, a, n), l.child)
	}

	function fd(e, l, t, a, n) {
		if (e === null) {
			var u = t.type;
			return typeof u == "function" && !dc(u) && u.defaultProps === void 0 && t.compare === null ? (l.tag = 15, l.type = u, dd(e, l, u, a, n)) : (e = Nu(t.type, null, a, l, l.mode, n), e.ref = l.ref, e.return = l, l.child = e)
		}
		if (u = e.child, !ar(e, n)) {
			var c = u.memoizedProps;
			if (t = t.compare, t = t !== null ? t : an, t(c, a) && e.ref === l.ref) return Et(e, l, n)
		}
		return l.flags |= 1, e = bt(u, a), e.ref = l.ref, e.return = l, l.child = e
	}

	function dd(e, l, t, a, n) {
		if (e !== null) {
			var u = e.memoizedProps;
			if (an(u, a) && e.ref === l.ref)
				if (nl = !1, l.pendingProps = a = u, ar(e, n))(e.flags & 131072) !== 0 && (nl = !0);
				else return l.lanes = e.lanes, Et(e, l, n)
		}
		return Ic(e, l, t, a, n)
	}

	function pd(e, l, t) {
		var a = l.pendingProps,
			n = a.children,
			u = e !== null ? e.memoizedState : null;
		if (a.mode === "hidden") {
			if ((l.flags & 128) !== 0) {
				if (a = u !== null ? u.baseLanes | t : t, e !== null) {
					for (n = l.child = e.child, u = 0; n !== null;) u = u | n.lanes | n.childLanes, n = n.sibling;
					l.childLanes = u & ~a
				} else l.childLanes = 0, l.child = null;
				return hd(e, l, a, t)
			}
			if ((t & 536870912) !== 0) l.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && Uu(l, u !== null ? u.cachePool : null), u !== null ? df(l, u) : Cc(), ed(l);
			else return l.lanes = l.childLanes = 536870912, hd(e, l, u !== null ? u.baseLanes | t : t, t)
		} else u !== null ? (Uu(l, u.cachePool), df(l, u), ea(), l.memoizedState = null) : (e !== null && Uu(l, null), Cc(), ea());
		return dl(e, l, n, t), l.child
	}

	function hd(e, l, t, a) {
		var n = Ac();
		return n = n === null ? null : {
			parent: el._currentValue,
			pool: n
		}, l.memoizedState = {
			baseLanes: t,
			cachePool: n
		}, e !== null && Uu(l, null), Cc(), ed(l), e !== null && rn(e, l, a, !0), null
	}

	function $u(e, l) {
		var t = l.ref;
		if (t === null) e !== null && e.ref !== null && (l.flags |= 4194816);
		else {
			if (typeof t != "function" && typeof t != "object") throw Error(r(284));
			(e === null || e.ref !== t) && (l.flags |= 4194816)
		}
	}

	function Ic(e, l, t, a, n) {
		return Ua(l), t = kc(e, l, t, a, void 0, n), a = zc(), e !== null && !nl ? (_c(e, l, n), Et(e, l, n)) : (xe && a && mc(l), l.flags |= 1, dl(e, l, t, n), l.child)
	}

	function md(e, l, t, a, n, u) {
		return Ua(l), l.updateQueue = null, t = hf(l, a, t, n), pf(e), a = zc(), e !== null && !nl ? (_c(e, l, u), Et(e, l, u)) : (xe && a && mc(l), l.flags |= 1, dl(e, l, t, u), l.child)
	}

	function gd(e, l, t, a, n) {
		if (Ua(l), l.stateNode === null) {
			var u = ci,
				c = t.contextType;
			typeof c == "object" && c !== null && (u = vl(c)), u = new t(a, u), l.memoizedState = u.state !== null && u.state !== void 0 ? u.state : null, u.updater = Xc, l.stateNode = u, u._reactInternals = l, u = l.stateNode, u.props = a, u.state = l.memoizedState, u.refs = {}, Mc(l), c = t.contextType, u.context = typeof c == "object" && c !== null ? vl(c) : ci, u.state = l.memoizedState, c = t.getDerivedStateFromProps, typeof c == "function" && (Pc(l, t, c, a), u.state = l.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof u.getSnapshotBeforeUpdate == "function" || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (c = u.state, typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount(), c !== u.state && Xc.enqueueReplaceState(u, u.state, null), gn(l, a, u, n), mn(), u.state = l.memoizedState), typeof u.componentDidMount == "function" && (l.flags |= 4194308), a = !0
		} else if (e === null) {
			u = l.stateNode;
			var f = l.memoizedProps,
				m = Ga(t, f);
			u.props = m;
			var L = u.context,
				O = t.contextType;
			c = ci, typeof O == "object" && O !== null && (c = vl(O));
			var _ = t.getDerivedStateFromProps;
			O = typeof _ == "function" || typeof u.getSnapshotBeforeUpdate == "function", f = l.pendingProps !== f, O || typeof u.UNSAFE_componentWillReceiveProps != "function" && typeof u.componentWillReceiveProps != "function" || (f || L !== c) && td(l, u, a, c), Zt = !1;
			var D = l.memoizedState;
			u.state = D, gn(l, a, u, n), mn(), L = l.memoizedState, f || D !== L || Zt ? (typeof _ == "function" && (Pc(l, t, _, a), L = l.memoizedState), (m = Zt || ld(l, t, m, a, D, L, c)) ? (O || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount()), typeof u.componentDidMount == "function" && (l.flags |= 4194308)) : (typeof u.componentDidMount == "function" && (l.flags |= 4194308), l.memoizedProps = a, l.memoizedState = L), u.props = a, u.state = L, u.context = c, a = m) : (typeof u.componentDidMount == "function" && (l.flags |= 4194308), a = !1)
		} else {
			u = l.stateNode, Lc(e, l), c = l.memoizedProps, O = Ga(t, c), u.props = O, _ = l.pendingProps, D = u.context, L = t.contextType, m = ci, typeof L == "object" && L !== null && (m = vl(L)), f = t.getDerivedStateFromProps, (L = typeof f == "function" || typeof u.getSnapshotBeforeUpdate == "function") || typeof u.UNSAFE_componentWillReceiveProps != "function" && typeof u.componentWillReceiveProps != "function" || (c !== _ || D !== m) && td(l, u, a, m), Zt = !1, D = l.memoizedState, u.state = D, gn(l, a, u, n), mn();
			var B = l.memoizedState;
			c !== _ || D !== B || Zt || e !== null && e.dependencies !== null && zu(e.dependencies) ? (typeof f == "function" && (Pc(l, t, f, a), B = l.memoizedState), (O = Zt || ld(l, t, O, a, D, B, m) || e !== null && e.dependencies !== null && zu(e.dependencies)) ? (L || typeof u.UNSAFE_componentWillUpdate != "function" && typeof u.componentWillUpdate != "function" || (typeof u.componentWillUpdate == "function" && u.componentWillUpdate(a, B, m), typeof u.UNSAFE_componentWillUpdate == "function" && u.UNSAFE_componentWillUpdate(a, B, m)), typeof u.componentDidUpdate == "function" && (l.flags |= 4), typeof u.getSnapshotBeforeUpdate == "function" && (l.flags |= 1024)) : (typeof u.componentDidUpdate != "function" || c === e.memoizedProps && D === e.memoizedState || (l.flags |= 4), typeof u.getSnapshotBeforeUpdate != "function" || c === e.memoizedProps && D === e.memoizedState || (l.flags |= 1024), l.memoizedProps = a, l.memoizedState = B), u.props = a, u.state = B, u.context = m, a = O) : (typeof u.componentDidUpdate != "function" || c === e.memoizedProps && D === e.memoizedState || (l.flags |= 4), typeof u.getSnapshotBeforeUpdate != "function" || c === e.memoizedProps && D === e.memoizedState || (l.flags |= 1024), a = !1)
		}
		return u = a, $u(e, l), a = (l.flags & 128) !== 0, u || a ? (u = l.stateNode, t = a && typeof t.getDerivedStateFromError != "function" ? null : u.render(), l.flags |= 1, e !== null && a ? (l.child = vi(l, e.child, null, n), l.child = vi(l, null, t, n)) : dl(e, l, t, n), l.memoizedState = u.state, e = l.child) : e = Et(e, l, n), e
	}

	function bd(e, l, t, a) {
		return on(), l.flags |= 256, dl(e, l, t, a), l.child
	}
	var Jc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};

	function $c(e) {
		return {
			baseLanes: e,
			cachePool: af()
		}
	}

	function Wc(e, l, t) {
		return e = e !== null ? e.childLanes & ~t : 0, l && (e |= Kl), e
	}

	function vd(e, l, t) {
		var a = l.pendingProps,
			n = !1,
			u = (l.flags & 128) !== 0,
			c;
		if ((c = u) || (c = e !== null && e.memoizedState === null ? !1 : (ll.current & 2) !== 0), c && (n = !0, l.flags &= -129), c = (l.flags & 32) !== 0, l.flags &= -33, e === null) {
			if (xe) {
				if (n ? Wt(l) : ea(), xe) {
					var f = je,
						m;
					if (m = f) {
						e: {
							for (m = f, f = nt; m.nodeType !== 8;) {
								if (!f) {
									f = null;
									break e
								}
								if (m = $l(m.nextSibling), m === null) {
									f = null;
									break e
								}
							}
							f = m
						}
						f !== null ? (l.memoizedState = {
							dehydrated: f,
							treeContext: Na !== null ? {
								id: vt,
								overflow: yt
							} : null,
							retryLane: 536870912,
							hydrationErrors: null
						}, m = zl(18, null, null, 0), m.stateNode = f, m.return = l, l.child = m, xl = l, je = null, m = !0) : m = !1
					}
					m || za(l)
				}
				if (f = l.memoizedState, f !== null && (f = f.dehydrated, f !== null)) return Hr(f) ? l.lanes = 32 : l.lanes = 536870912, null;
				At(l)
			}
			return f = a.children, a = a.fallback, n ? (ea(), n = l.mode, f = Wu({
				mode: "hidden",
				children: f
			}, n), a = Ca(a, n, t, null), f.return = l, a.return = l, f.sibling = a, l.child = f, n = l.child, n.memoizedState = $c(t), n.childLanes = Wc(e, c, t), l.memoizedState = Jc, a) : (Wt(l), er(l, f))
		}
		if (m = e.memoizedState, m !== null && (f = m.dehydrated, f !== null)) {
			if (u) l.flags & 256 ? (Wt(l), l.flags &= -257, l = lr(e, l, t)) : l.memoizedState !== null ? (ea(), l.child = e.child, l.flags |= 128, l = null) : (ea(), n = a.fallback, f = l.mode, a = Wu({
				mode: "visible",
				children: a.children
			}, f), n = Ca(n, f, t, null), n.flags |= 2, a.return = l, n.return = l, a.sibling = n, l.child = a, vi(l, e.child, null, t), a = l.child, a.memoizedState = $c(t), a.childLanes = Wc(e, c, t), l.memoizedState = Jc, l = n);
			else if (Wt(l), Hr(f)) {
				if (c = f.nextSibling && f.nextSibling.dataset, c) var L = c.dgst;
				c = L, a = Error(r(419)), a.stack = "", a.digest = c, cn({
					value: a,
					source: null,
					stack: null
				}), l = lr(e, l, t)
			} else if (nl || rn(e, l, t, !1), c = (t & e.childLanes) !== 0, nl || c) {
				if (c = Ce, c !== null && (a = t & -t, a = (a & 42) !== 0 ? 1 : ya(a), a = (a & (c.suspendedLanes | t)) !== 0 ? 0 : a, a !== 0 && a !== m.retryLane)) throw m.retryLane = a, oi(e, a), Gl(c, e, a), rd;
				f.data === "$?" || yr(), l = lr(e, l, t)
			} else f.data === "$?" ? (l.flags |= 192, l.child = e.child, l = null) : (e = m.treeContext, je = $l(f.nextSibling), xl = l, xe = !0, ka = null, nt = !1, e !== null && (Vl[Yl++] = vt, Vl[Yl++] = yt, Vl[Yl++] = Na, vt = e.id, yt = e.overflow, Na = l), l = er(l, a.children), l.flags |= 4096);
			return l
		}
		return n ? (ea(), n = a.fallback, f = l.mode, m = e.child, L = m.sibling, a = bt(m, {
			mode: "hidden",
			children: a.children
		}), a.subtreeFlags = m.subtreeFlags & 65011712, L !== null ? n = bt(L, n) : (n = Ca(n, f, t, null), n.flags |= 2), n.return = l, a.return = l, a.sibling = n, l.child = a, a = n, n = l.child, f = e.child.memoizedState, f === null ? f = $c(t) : (m = f.cachePool, m !== null ? (L = el._currentValue, m = m.parent !== L ? {
			parent: L,
			pool: L
		} : m) : m = af(), f = {
			baseLanes: f.baseLanes | t,
			cachePool: m
		}), n.memoizedState = f, n.childLanes = Wc(e, c, t), l.memoizedState = Jc, a) : (Wt(l), t = e.child, e = t.sibling, t = bt(t, {
			mode: "visible",
			children: a.children
		}), t.return = l, t.sibling = null, e !== null && (c = l.deletions, c === null ? (l.deletions = [e], l.flags |= 16) : c.push(e)), l.child = t, l.memoizedState = null, t)
	}

	function er(e, l) {
		return l = Wu({
			mode: "visible",
			children: l
		}, e.mode), l.return = e, e.child = l
	}

	function Wu(e, l) {
		return e = zl(22, e, null, l), e.lanes = 0, e.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}, e
	}

	function lr(e, l, t) {
		return vi(l, e.child, null, t), e = er(l, l.pendingProps.children), e.flags |= 2, l.memoizedState = null, e
	}

	function yd(e, l, t) {
		e.lanes |= l;
		var a = e.alternate;
		a !== null && (a.lanes |= l), yc(e.return, l, t)
	}

	function tr(e, l, t, a, n) {
		var u = e.memoizedState;
		u === null ? e.memoizedState = {
			isBackwards: l,
			rendering: null,
			renderingStartTime: 0,
			last: a,
			tail: t,
			tailMode: n
		} : (u.isBackwards = l, u.rendering = null, u.renderingStartTime = 0, u.last = a, u.tail = t, u.tailMode = n)
	}

	function Sd(e, l, t) {
		var a = l.pendingProps,
			n = a.revealOrder,
			u = a.tail;
		if (dl(e, l, a.children, t), a = ll.current, (a & 2) !== 0) a = a & 1 | 2, l.flags |= 128;
		else {
			if (e !== null && (e.flags & 128) !== 0) e: for (e = l.child; e !== null;) {
				if (e.tag === 13) e.memoizedState !== null && yd(e, t, l);
				else if (e.tag === 19) yd(e, t, l);
				else if (e.child !== null) {
					e.child.return = e, e = e.child;
					continue
				}
				if (e === l) break e;
				for (; e.sibling === null;) {
					if (e.return === null || e.return === l) break e;
					e = e.return
				}
				e.sibling.return = e.return, e = e.sibling
			}
			a &= 1
		}
		switch (V(ll, a), n) {
			case "forwards":
				for (t = l.child, n = null; t !== null;) e = t.alternate, e !== null && Zu(e) === null && (n = t), t = t.sibling;
				t = n, t === null ? (n = l.child, l.child = null) : (n = t.sibling, t.sibling = null), tr(l, !1, n, t, u);
				break;
			case "backwards":
				for (t = null, n = l.child, l.child = null; n !== null;) {
					if (e = n.alternate, e !== null && Zu(e) === null) {
						l.child = n;
						break
					}
					e = n.sibling, n.sibling = t, t = n, n = e
				}
				tr(l, !0, t, null, u);
				break;
			case "together":
				tr(l, !1, null, null, void 0);
				break;
			default:
				l.memoizedState = null
		}
		return l.child
	}

	function Et(e, l, t) {
		if (e !== null && (l.dependencies = e.dependencies), na |= l.lanes, (t & l.childLanes) === 0)
			if (e !== null) {
				if (rn(e, l, t, !1), (t & l.childLanes) === 0) return null
			} else return null;
		if (e !== null && l.child !== e.child) throw Error(r(153));
		if (l.child !== null) {
			for (e = l.child, t = bt(e, e.pendingProps), l.child = t, t.return = l; e.sibling !== null;) e = e.sibling, t = t.sibling = bt(e, e.pendingProps), t.return = l;
			t.sibling = null
		}
		return l.child
	}

	function ar(e, l) {
		return (e.lanes & l) !== 0 ? !0 : (e = e.dependencies, !!(e !== null && zu(e)))
	}

	function $h(e, l, t) {
		switch (l.tag) {
			case 3:
				Be(l, l.stateNode.containerInfo), Xt(l, el, e.memoizedState.cache), on();
				break;
			case 27:
			case 5:
				Gi(l);
				break;
			case 4:
				Be(l, l.stateNode.containerInfo);
				break;
			case 10:
				Xt(l, l.type, l.memoizedProps.value);
				break;
			case 13:
				var a = l.memoizedState;
				if (a !== null) return a.dehydrated !== null ? (Wt(l), l.flags |= 128, null) : (t & l.child.childLanes) !== 0 ? vd(e, l, t) : (Wt(l), e = Et(e, l, t), e !== null ? e.sibling : null);
				Wt(l);
				break;
			case 19:
				var n = (e.flags & 128) !== 0;
				if (a = (t & l.childLanes) !== 0, a || (rn(e, l, t, !1), a = (t & l.childLanes) !== 0), n) {
					if (a) return Sd(e, l, t);
					l.flags |= 128
				}
				if (n = l.memoizedState, n !== null && (n.rendering = null, n.tail = null, n.lastEffect = null), V(ll, ll.current), a) break;
				return null;
			case 22:
			case 23:
				return l.lanes = 0, pd(e, l, t);
			case 24:
				Xt(l, el, e.memoizedState.cache)
		}
		return Et(e, l, t)
	}

	function xd(e, l, t) {
		if (e !== null)
			if (e.memoizedProps !== l.pendingProps) nl = !0;
			else {
				if (!ar(e, t) && (l.flags & 128) === 0) return nl = !1, $h(e, l, t);
				nl = (e.flags & 131072) !== 0
			}
		else nl = !1, xe && (l.flags & 1048576) !== 0 && Is(l, ku, l.index);
		switch (l.lanes = 0, l.tag) {
			case 16:
				e: {
					e = l.pendingProps;
					var a = l.elementType,
						n = a._init;
					if (a = n(a._payload), l.type = a, typeof a == "function") dc(a) ? (e = Ga(a, e), l.tag = 1, l = gd(null, l, a, e, t)) : (l.tag = 0, l = Ic(null, l, a, e, t));
					else {
						if (a != null) {
							if (n = a.$$typeof, n === al) {
								l.tag = 11, l = sd(null, l, a, e, t);
								break e
							} else if (n === Pe) {
								l.tag = 14, l = fd(null, l, a, e, t);
								break e
							}
						}
						throw l = Rl(a) || a, Error(r(306, l, ""))
					}
				}
				return l;
			case 0:
				return Ic(e, l, l.type, l.pendingProps, t);
			case 1:
				return a = l.type, n = Ga(a, l.pendingProps), gd(e, l, a, n, t);
			case 3:
				e: {
					if (Be(l, l.stateNode.containerInfo), e === null) throw Error(r(387));a = l.pendingProps;
					var u = l.memoizedState;n = u.element,
					Lc(e, l),
					gn(l, a, null, t);
					var c = l.memoizedState;
					if (a = c.cache, Xt(l, el, a), a !== u.cache && Sc(l, [el], t, !0), mn(), a = c.element, u.isDehydrated)
						if (u = {
								element: a,
								isDehydrated: !1,
								cache: c.cache
							}, l.updateQueue.baseState = u, l.memoizedState = u, l.flags & 256) {
							l = bd(e, l, a, t);
							break e
						} else if (a !== n) {
						n = wl(Error(r(424)), l), cn(n), l = bd(e, l, a, t);
						break e
					} else {
						switch (e = l.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default:
								e = e.nodeName === "HTML" ? e.ownerDocument.body : e
						}
						for (je = $l(e.firstChild), xl = l, xe = !0, ka = null, nt = !0, t = Wf(l, null, a, t), l.child = t; t;) t.flags = t.flags & -3 | 4096, t = t.sibling
					} else {
						if (on(), a === n) {
							l = Et(e, l, t);
							break e
						}
						dl(e, l, a, t)
					}
					l = l.child
				}
				return l;
			case 26:
				return $u(e, l), e === null ? (t = M0(l.type, null, l.pendingProps, null)) ? l.memoizedState = t : xe || (t = l.type, e = l.pendingProps, a = ho(ne.current).createElement(t), a[Fe] = l, a[rl] = e, hl(a, t, e), Ue(a), l.stateNode = a) : l.memoizedState = M0(l.type, e.memoizedProps, l.pendingProps, e.memoizedState), null;
			case 27:
				return Gi(l), e === null && xe && (a = l.stateNode = T0(l.type, l.pendingProps, ne.current), xl = l, nt = !0, n = je, ra(l.type) ? (jr = n, je = $l(a.firstChild)) : je = n), dl(e, l, l.pendingProps.children, t), $u(e, l), e === null && (l.flags |= 4194304), l.child;
			case 5:
				return e === null && xe && ((n = a = je) && (a = L1(a, l.type, l.pendingProps, nt), a !== null ? (l.stateNode = a, xl = l, je = $l(a.firstChild), nt = !1, n = !0) : n = !1), n || za(l)), Gi(l), n = l.type, u = l.pendingProps, c = e !== null ? e.memoizedProps : null, a = u.children, zr(n, u) ? a = null : c !== null && zr(n, c) && (l.flags |= 32), l.memoizedState !== null && (n = kc(e, l, qh, null, null, t), Gn._currentValue = n), $u(e, l), dl(e, l, a, t), l.child;
			case 6:
				return e === null && xe && ((e = t = je) && (t = D1(t, l.pendingProps, nt), t !== null ? (l.stateNode = t, xl = l, je = null, e = !0) : e = !1), e || za(l)), null;
			case 13:
				return vd(e, l, t);
			case 4:
				return Be(l, l.stateNode.containerInfo), a = l.pendingProps, e === null ? l.child = vi(l, null, a, t) : dl(e, l, a, t), l.child;
			case 11:
				return sd(e, l, l.type, l.pendingProps, t);
			case 7:
				return dl(e, l, l.pendingProps, t), l.child;
			case 8:
				return dl(e, l, l.pendingProps.children, t), l.child;
			case 12:
				return dl(e, l, l.pendingProps.children, t), l.child;
			case 10:
				return a = l.pendingProps, Xt(l, l.type, a.value), dl(e, l, a.children, t), l.child;
			case 9:
				return n = l.type._context, a = l.pendingProps.children, Ua(l), n = vl(n), a = a(n), l.flags |= 1, dl(e, l, a, t), l.child;
			case 14:
				return fd(e, l, l.type, l.pendingProps, t);
			case 15:
				return dd(e, l, l.type, l.pendingProps, t);
			case 19:
				return Sd(e, l, t);
			case 31:
				return a = l.pendingProps, t = l.mode, a = {
					mode: a.mode,
					children: a.children
				}, e === null ? (t = Wu(a, t), t.ref = l.ref, l.child = t, t.return = l, l = t) : (t = bt(e.child, a), t.ref = l.ref, l.child = t, t.return = l, l = t), l;
			case 22:
				return pd(e, l, t);
			case 24:
				return Ua(l), a = vl(el), e === null ? (n = Ac(), n === null && (n = Ce, u = xc(), n.pooledCache = u, u.refCount++, u !== null && (n.pooledCacheLanes |= t), n = u), l.memoizedState = {
					parent: a,
					cache: n
				}, Mc(l), Xt(l, el, n)) : ((e.lanes & t) !== 0 && (Lc(e, l), gn(l, null, null, t), mn()), n = e.memoizedState, u = l.memoizedState, n.parent !== a ? (n = {
					parent: a,
					cache: a
				}, l.memoizedState = n, l.lanes === 0 && (l.memoizedState = l.updateQueue.baseState = n), Xt(l, el, a)) : (a = u.cache, Xt(l, el, a), a !== n.cache && Sc(l, [el], t, !0))), dl(e, l, l.pendingProps.children, t), l.child;
			case 29:
				throw l.pendingProps
		}
		throw Error(r(156, l.tag))
	}

	function Mt(e) {
		e.flags |= 4
	}

	function Td(e, l) {
		if (l.type !== "stylesheet" || (l.state.loading & 4) !== 0) e.flags &= -16777217;
		else if (e.flags |= 16777216, !N0(l)) {
			if (l = ql.current, l !== null && ((be & 4194048) === be ? ut !== null : (be & 62914560) !== be && (be & 536870912) === 0 || l !== ut)) throw pn = Ec, nf;
			e.flags |= 8192
		}
	}

	function eo(e, l) {
		l !== null && (e.flags |= 4), e.flags & 16384 && (l = e.tag !== 22 ? Vi() : 536870912, e.lanes |= l, Ti |= l)
	}

	function An(e, l) {
		if (!xe) switch (e.tailMode) {
			case "hidden":
				l = e.tail;
				for (var t = null; l !== null;) l.alternate !== null && (t = l), l = l.sibling;
				t === null ? e.tail = null : t.sibling = null;
				break;
			case "collapsed":
				t = e.tail;
				for (var a = null; t !== null;) t.alternate !== null && (a = t), t = t.sibling;
				a === null ? l || e.tail === null ? e.tail = null : e.tail.sibling = null : a.sibling = null
		}
	}

	function ze(e) {
		var l = e.alternate !== null && e.alternate.child === e.child,
			t = 0,
			a = 0;
		if (l)
			for (var n = e.child; n !== null;) t |= n.lanes | n.childLanes, a |= n.subtreeFlags & 65011712, a |= n.flags & 65011712, n.return = e, n = n.sibling;
		else
			for (n = e.child; n !== null;) t |= n.lanes | n.childLanes, a |= n.subtreeFlags, a |= n.flags, n.return = e, n = n.sibling;
		return e.subtreeFlags |= a, e.childLanes = t, l
	}

	function Wh(e, l, t) {
		var a = l.pendingProps;
		switch (gc(l), l.tag) {
			case 31:
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14:
				return ze(l), null;
			case 1:
				return ze(l), null;
			case 3:
				return t = l.stateNode, a = null, e !== null && (a = e.memoizedState.cache), l.memoizedState.cache !== a && (l.flags |= 2048), xt(el), Nl(), t.pendingContext && (t.context = t.pendingContext, t.pendingContext = null), (e === null || e.child === null) && (un(l) ? Mt(l) : e === null || e.memoizedState.isDehydrated && (l.flags & 256) === 0 || (l.flags |= 1024, Ws())), ze(l), null;
			case 26:
				return t = l.memoizedState, e === null ? (Mt(l), t !== null ? (ze(l), Td(l, t)) : (ze(l), l.flags &= -16777217)) : t ? t !== e.memoizedState ? (Mt(l), ze(l), Td(l, t)) : (ze(l), l.flags &= -16777217) : (e.memoizedProps !== a && Mt(l), ze(l), l.flags &= -16777217), null;
			case 27:
				dt(l), t = ne.current;
				var n = l.type;
				if (e !== null && l.stateNode != null) e.memoizedProps !== a && Mt(l);
				else {
					if (!a) {
						if (l.stateNode === null) throw Error(r(166));
						return ze(l), null
					}
					e = Q.current, un(l) ? Js(l) : (e = T0(n, a, t), l.stateNode = e, Mt(l))
				}
				return ze(l), null;
			case 5:
				if (dt(l), t = l.type, e !== null && l.stateNode != null) e.memoizedProps !== a && Mt(l);
				else {
					if (!a) {
						if (l.stateNode === null) throw Error(r(166));
						return ze(l), null
					}
					if (e = Q.current, un(l)) Js(l);
					else {
						switch (n = ho(ne.current), e) {
							case 1:
								e = n.createElementNS("http://www.w3.org/2000/svg", t);
								break;
							case 2:
								e = n.createElementNS("http://www.w3.org/1998/Math/MathML", t);
								break;
							default:
								switch (t) {
									case "svg":
										e = n.createElementNS("http://www.w3.org/2000/svg", t);
										break;
									case "math":
										e = n.createElementNS("http://www.w3.org/1998/Math/MathML", t);
										break;
									case "script":
										e = n.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild);
										break;
									case "select":
										e = typeof a.is == "string" ? n.createElement("select", {
											is: a.is
										}) : n.createElement("select"), a.multiple ? e.multiple = !0 : a.size && (e.size = a.size);
										break;
									default:
										e = typeof a.is == "string" ? n.createElement(t, {
											is: a.is
										}) : n.createElement(t)
								}
						}
						e[Fe] = l, e[rl] = a;
						e: for (n = l.child; n !== null;) {
							if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
							else if (n.tag !== 4 && n.tag !== 27 && n.child !== null) {
								n.child.return = n, n = n.child;
								continue
							}
							if (n === l) break e;
							for (; n.sibling === null;) {
								if (n.return === null || n.return === l) break e;
								n = n.return
							}
							n.sibling.return = n.return, n = n.sibling
						}
						l.stateNode = e;
						e: switch (hl(e, t, a), t) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								e = !!a.autoFocus;
								break e;
							case "img":
								e = !0;
								break e;
							default:
								e = !1
						}
						e && Mt(l)
					}
				}
				return ze(l), l.flags &= -16777217, null;
			case 6:
				if (e && l.stateNode != null) e.memoizedProps !== a && Mt(l);
				else {
					if (typeof a != "string" && l.stateNode === null) throw Error(r(166));
					if (e = ne.current, un(l)) {
						if (e = l.stateNode, t = l.memoizedProps, a = null, n = xl, n !== null) switch (n.tag) {
							case 27:
							case 5:
								a = n.memoizedProps
						}
						e[Fe] = l, e = !!(e.nodeValue === t || a !== null && a.suppressHydrationWarning === !0 || m0(e.nodeValue, t)), e || za(l)
					} else e = ho(e).createTextNode(a), e[Fe] = l, l.stateNode = e
				}
				return ze(l), null;
			case 13:
				if (a = l.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (n = un(l), a !== null && a.dehydrated !== null) {
						if (e === null) {
							if (!n) throw Error(r(318));
							if (n = l.memoizedState, n = n !== null ? n.dehydrated : null, !n) throw Error(r(317));
							n[Fe] = l
						} else on(), (l.flags & 128) === 0 && (l.memoizedState = null), l.flags |= 4;
						ze(l), n = !1
					} else n = Ws(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), n = !0;
					if (!n) return l.flags & 256 ? (At(l), l) : (At(l), null)
				}
				if (At(l), (l.flags & 128) !== 0) return l.lanes = t, l;
				if (t = a !== null, e = e !== null && e.memoizedState !== null, t) {
					a = l.child, n = null, a.alternate !== null && a.alternate.memoizedState !== null && a.alternate.memoizedState.cachePool !== null && (n = a.alternate.memoizedState.cachePool.pool);
					var u = null;
					a.memoizedState !== null && a.memoizedState.cachePool !== null && (u = a.memoizedState.cachePool.pool), u !== n && (a.flags |= 2048)
				}
				return t !== e && t && (l.child.flags |= 8192), eo(l, l.updateQueue), ze(l), null;
			case 4:
				return Nl(), e === null && Br(l.stateNode.containerInfo), ze(l), null;
			case 10:
				return xt(l.type), ze(l), null;
			case 19:
				if (Y(ll), n = l.memoizedState, n === null) return ze(l), null;
				if (a = (l.flags & 128) !== 0, u = n.rendering, u === null)
					if (a) An(n, !1);
					else {
						if (Ge !== 0 || e !== null && (e.flags & 128) !== 0)
							for (e = l.child; e !== null;) {
								if (u = Zu(e), u !== null) {
									for (l.flags |= 128, An(n, !1), e = u.updateQueue, l.updateQueue = e, eo(l, e), l.subtreeFlags = 0, e = t, t = l.child; t !== null;) Zs(t, e), t = t.sibling;
									return V(ll, ll.current & 1 | 2), l.child
								}
								e = e.sibling
							}
						n.tail !== null && Al() > ao && (l.flags |= 128, a = !0, An(n, !1), l.lanes = 4194304)
					}
				else {
					if (!a)
						if (e = Zu(u), e !== null) {
							if (l.flags |= 128, a = !0, e = e.updateQueue, l.updateQueue = e, eo(l, e), An(n, !0), n.tail === null && n.tailMode === "hidden" && !u.alternate && !xe) return ze(l), null
						} else 2 * Al() - n.renderingStartTime > ao && t !== 536870912 && (l.flags |= 128, a = !0, An(n, !1), l.lanes = 4194304);
					n.isBackwards ? (u.sibling = l.child, l.child = u) : (e = n.last, e !== null ? e.sibling = u : l.child = u, n.last = u)
				}
				return n.tail !== null ? (l = n.tail, n.rendering = l, n.tail = l.sibling, n.renderingStartTime = Al(), l.sibling = null, e = ll.current, V(ll, a ? e & 1 | 2 : e & 1), l) : (ze(l), null);
			case 22:
			case 23:
				return At(l), Nc(), a = l.memoizedState !== null, e !== null ? e.memoizedState !== null !== a && (l.flags |= 8192) : a && (l.flags |= 8192), a ? (t & 536870912) !== 0 && (l.flags & 128) === 0 && (ze(l), l.subtreeFlags & 6 && (l.flags |= 8192)) : ze(l), t = l.updateQueue, t !== null && eo(l, t.retryQueue), t = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (t = e.memoizedState.cachePool.pool), a = null, l.memoizedState !== null && l.memoizedState.cachePool !== null && (a = l.memoizedState.cachePool.pool), a !== t && (l.flags |= 2048), e !== null && Y(Ha), null;
			case 24:
				return t = null, e !== null && (t = e.memoizedState.cache), l.memoizedState.cache !== t && (l.flags |= 2048), xt(el), ze(l), null;
			case 25:
				return null;
			case 30:
				return null
		}
		throw Error(r(156, l.tag))
	}

	function e1(e, l) {
		switch (gc(l), l.tag) {
			case 1:
				return e = l.flags, e & 65536 ? (l.flags = e & -65537 | 128, l) : null;
			case 3:
				return xt(el), Nl(), e = l.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (l.flags = e & -65537 | 128, l) : null;
			case 26:
			case 27:
			case 5:
				return dt(l), null;
			case 13:
				if (At(l), e = l.memoizedState, e !== null && e.dehydrated !== null) {
					if (l.alternate === null) throw Error(r(340));
					on()
				}
				return e = l.flags, e & 65536 ? (l.flags = e & -65537 | 128, l) : null;
			case 19:
				return Y(ll), null;
			case 4:
				return Nl(), null;
			case 10:
				return xt(l.type), null;
			case 22:
			case 23:
				return At(l), Nc(), e !== null && Y(Ha), e = l.flags, e & 65536 ? (l.flags = e & -65537 | 128, l) : null;
			case 24:
				return xt(el), null;
			case 25:
				return null;
			default:
				return null
		}
	}

	function Ad(e, l) {
		switch (gc(l), l.tag) {
			case 3:
				xt(el), Nl();
				break;
			case 26:
			case 27:
			case 5:
				dt(l);
				break;
			case 4:
				Nl();
				break;
			case 13:
				At(l);
				break;
			case 19:
				Y(ll);
				break;
			case 10:
				xt(l.type);
				break;
			case 22:
			case 23:
				At(l), Nc(), e !== null && Y(Ha);
				break;
			case 24:
				xt(el)
		}
	}

	function En(e, l) {
		try {
			var t = l.updateQueue,
				a = t !== null ? t.lastEffect : null;
			if (a !== null) {
				var n = a.next;
				t = n;
				do {
					if ((t.tag & e) === e) {
						a = void 0;
						var u = t.create,
							c = t.inst;
						a = u(), c.destroy = a
					}
					t = t.next
				} while (t !== n)
			}
		} catch (f) {
			De(l, l.return, f)
		}
	}

	function la(e, l, t) {
		try {
			var a = l.updateQueue,
				n = a !== null ? a.lastEffect : null;
			if (n !== null) {
				var u = n.next;
				a = u;
				do {
					if ((a.tag & e) === e) {
						var c = a.inst,
							f = c.destroy;
						if (f !== void 0) {
							c.destroy = void 0, n = l;
							var m = t,
								L = f;
							try {
								L()
							} catch (O) {
								De(n, m, O)
							}
						}
					}
					a = a.next
				} while (a !== u)
			}
		} catch (O) {
			De(l, l.return, O)
		}
	}

	function Ed(e) {
		var l = e.updateQueue;
		if (l !== null) {
			var t = e.stateNode;
			try {
				ff(l, t)
			} catch (a) {
				De(e, e.return, a)
			}
		}
	}

	function Md(e, l, t) {
		t.props = Ga(e.type, e.memoizedProps), t.state = e.memoizedState;
		try {
			t.componentWillUnmount()
		} catch (a) {
			De(e, l, a)
		}
	}

	function Mn(e, l) {
		try {
			var t = e.ref;
			if (t !== null) {
				switch (e.tag) {
					case 26:
					case 27:
					case 5:
						var a = e.stateNode;
						break;
					case 30:
						a = e.stateNode;
						break;
					default:
						a = e.stateNode
				}
				typeof t == "function" ? e.refCleanup = t(a) : t.current = a
			}
		} catch (n) {
			De(e, l, n)
		}
	}

	function ot(e, l) {
		var t = e.ref,
			a = e.refCleanup;
		if (t !== null)
			if (typeof a == "function") try {
				a()
			} catch (n) {
				De(e, l, n)
			} finally {
				e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null)
			} else if (typeof t == "function") try {
				t(null)
			} catch (n) {
				De(e, l, n)
			} else t.current = null
	}

	function Ld(e) {
		var l = e.type,
			t = e.memoizedProps,
			a = e.stateNode;
		try {
			e: switch (l) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					t.autoFocus && a.focus();
					break e;
				case "img":
					t.src ? a.src = t.src : t.srcSet && (a.srcset = t.srcSet)
			}
		}
		catch (n) {
			De(e, e.return, n)
		}
	}

	function ir(e, l, t) {
		try {
			var a = e.stateNode;
			x1(a, e.type, t, l), a[rl] = l
		} catch (n) {
			De(e, e.return, n)
		}
	}

	function Dd(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && ra(e.type) || e.tag === 4
	}

	function nr(e) {
		e: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Dd(e.return)) return null;
				e = e.return
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && ra(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue e;
				e.child.return = e, e = e.child
			}
			if (!(e.flags & 2)) return e.stateNode
		}
	}

	function ur(e, l, t) {
		var a = e.tag;
		if (a === 5 || a === 6) e = e.stateNode, l ? (t.nodeType === 9 ? t.body : t.nodeName === "HTML" ? t.ownerDocument.body : t).insertBefore(e, l) : (l = t.nodeType === 9 ? t.body : t.nodeName === "HTML" ? t.ownerDocument.body : t, l.appendChild(e), t = t._reactRootContainer, t != null || l.onclick !== null || (l.onclick = po));
		else if (a !== 4 && (a === 27 && ra(e.type) && (t = e.stateNode, l = null), e = e.child, e !== null))
			for (ur(e, l, t), e = e.sibling; e !== null;) ur(e, l, t), e = e.sibling
	}

	function lo(e, l, t) {
		var a = e.tag;
		if (a === 5 || a === 6) e = e.stateNode, l ? t.insertBefore(e, l) : t.appendChild(e);
		else if (a !== 4 && (a === 27 && ra(e.type) && (t = e.stateNode), e = e.child, e !== null))
			for (lo(e, l, t), e = e.sibling; e !== null;) lo(e, l, t), e = e.sibling
	}

	function Bd(e) {
		var l = e.stateNode,
			t = e.memoizedProps;
		try {
			for (var a = e.type, n = l.attributes; n.length;) l.removeAttributeNode(n[0]);
			hl(l, a, t), l[Fe] = e, l[rl] = t
		} catch (u) {
			De(e, e.return, u)
		}
	}
	var Lt = !1,
		Qe = !1,
		or = !1,
		Cd = typeof WeakSet == "function" ? WeakSet : Set,
		ul = null;

	function l1(e, l) {
		if (e = e.containerInfo, Or = So, e = Rs(e), nc(e)) {
			if ("selectionStart" in e) var t = {
				start: e.selectionStart,
				end: e.selectionEnd
			};
			else e: {
				t = (t = e.ownerDocument) && t.defaultView || window;
				var a = t.getSelection && t.getSelection();
				if (a && a.rangeCount !== 0) {
					t = a.anchorNode;
					var n = a.anchorOffset,
						u = a.focusNode;
					a = a.focusOffset;
					try {
						t.nodeType, u.nodeType
					} catch {
						t = null;
						break e
					}
					var c = 0,
						f = -1,
						m = -1,
						L = 0,
						O = 0,
						_ = e,
						D = null;
					l: for (;;) {
						for (var B; _ !== t || n !== 0 && _.nodeType !== 3 || (f = c + n), _ !== u || a !== 0 && _.nodeType !== 3 || (m = c + a), _.nodeType === 3 && (c += _.nodeValue.length), (B = _.firstChild) !== null;) D = _, _ = B;
						for (;;) {
							if (_ === e) break l;
							if (D === t && ++L === n && (f = c), D === u && ++O === a && (m = c), (B = _.nextSibling) !== null) break;
							_ = D, D = _.parentNode
						}
						_ = B
					}
					t = f === -1 || m === -1 ? null : {
						start: f,
						end: m
					}
				} else t = null
			}
			t = t || {
				start: 0,
				end: 0
			}
		} else t = null;
		for (kr = {
				focusedElem: e,
				selectionRange: t
			}, So = !1, ul = l; ul !== null;)
			if (l = ul, e = l.child, (l.subtreeFlags & 1024) !== 0 && e !== null) e.return = l, ul = e;
			else
				for (; ul !== null;) {
					switch (l = ul, u = l.alternate, e = l.flags, l.tag) {
						case 0:
							break;
						case 11:
						case 15:
							break;
						case 1:
							if ((e & 1024) !== 0 && u !== null) {
								e = void 0, t = l, n = u.memoizedProps, u = u.memoizedState, a = t.stateNode;
								try {
									var ae = Ga(t.type, n, t.elementType === t.type);
									e = a.getSnapshotBeforeUpdate(ae, u), a.__reactInternalSnapshotBeforeUpdate = e
								} catch (le) {
									De(t, t.return, le)
								}
							}
							break;
						case 3:
							if ((e & 1024) !== 0) {
								if (e = l.stateNode.containerInfo, t = e.nodeType, t === 9) Ur(e);
								else if (t === 1) switch (e.nodeName) {
									case "HEAD":
									case "HTML":
									case "BODY":
										Ur(e);
										break;
									default:
										e.textContent = ""
								}
							}
							break;
						case 5:
						case 26:
						case 27:
						case 6:
						case 4:
						case 17:
							break;
						default:
							if ((e & 1024) !== 0) throw Error(r(163))
					}
					if (e = l.sibling, e !== null) {
						e.return = l.return, ul = e;
						break
					}
					ul = l.return
				}
	}

	function Nd(e, l, t) {
		var a = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				ta(e, t), a & 4 && En(5, t);
				break;
			case 1:
				if (ta(e, t), a & 4)
					if (e = t.stateNode, l === null) try {
						e.componentDidMount()
					} catch (c) {
						De(t, t.return, c)
					} else {
						var n = Ga(t.type, l.memoizedProps);
						l = l.memoizedState;
						try {
							e.componentDidUpdate(n, l, e.__reactInternalSnapshotBeforeUpdate)
						} catch (c) {
							De(t, t.return, c)
						}
					}
				a & 64 && Ed(t), a & 512 && Mn(t, t.return);
				break;
			case 3:
				if (ta(e, t), a & 64 && (e = t.updateQueue, e !== null)) {
					if (l = null, t.child !== null) switch (t.child.tag) {
						case 27:
						case 5:
							l = t.child.stateNode;
							break;
						case 1:
							l = t.child.stateNode
					}
					try {
						ff(e, l)
					} catch (c) {
						De(t, t.return, c)
					}
				}
				break;
			case 27:
				l === null && a & 4 && Bd(t);
			case 26:
			case 5:
				ta(e, t), l === null && a & 4 && Ld(t), a & 512 && Mn(t, t.return);
				break;
			case 12:
				ta(e, t);
				break;
			case 13:
				ta(e, t), a & 4 && zd(e, t), a & 64 && (e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null && (t = s1.bind(null, t), B1(e, t))));
				break;
			case 22:
				if (a = t.memoizedState !== null || Lt, !a) {
					l = l !== null && l.memoizedState !== null || Qe, n = Lt;
					var u = Qe;
					Lt = a, (Qe = l) && !u ? aa(e, t, (t.subtreeFlags & 8772) !== 0) : ta(e, t), Lt = n, Qe = u
				}
				break;
			case 30:
				break;
			default:
				ta(e, t)
		}
	}

	function Od(e) {
		var l = e.alternate;
		l !== null && (e.alternate = null, Od(l)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (l = e.stateNode, l !== null && Ki(l)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null
	}
	var ke = null,
		Dl = !1;

	function Dt(e, l, t) {
		for (t = t.child; t !== null;) kd(e, l, t), t = t.sibling
	}

	function kd(e, l, t) {
		if (gl && typeof gl.onCommitFiberUnmount == "function") try {
			gl.onCommitFiberUnmount(_t, t)
		} catch {}
		switch (t.tag) {
			case 26:
				Qe || ot(t, l), Dt(e, l, t), t.memoizedState ? t.memoizedState.count-- : t.stateNode && (t = t.stateNode, t.parentNode.removeChild(t));
				break;
			case 27:
				Qe || ot(t, l);
				var a = ke,
					n = Dl;
				ra(t.type) && (ke = t.stateNode, Dl = !1), Dt(e, l, t), _n(t.stateNode), ke = a, Dl = n;
				break;
			case 5:
				Qe || ot(t, l);
			case 6:
				if (a = ke, n = Dl, ke = null, Dt(e, l, t), ke = a, Dl = n, ke !== null)
					if (Dl) try {
						(ke.nodeType === 9 ? ke.body : ke.nodeName === "HTML" ? ke.ownerDocument.body : ke).removeChild(t.stateNode)
					} catch (u) {
						De(t, l, u)
					} else try {
						ke.removeChild(t.stateNode)
					} catch (u) {
						De(t, l, u)
					}
				break;
			case 18:
				ke !== null && (Dl ? (e = ke, S0(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, t.stateNode), Vn(e)) : S0(ke, t.stateNode));
				break;
			case 4:
				a = ke, n = Dl, ke = t.stateNode.containerInfo, Dl = !0, Dt(e, l, t), ke = a, Dl = n;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				Qe || la(2, t, l), Qe || la(4, t, l), Dt(e, l, t);
				break;
			case 1:
				Qe || (ot(t, l), a = t.stateNode, typeof a.componentWillUnmount == "function" && Md(t, l, a)), Dt(e, l, t);
				break;
			case 21:
				Dt(e, l, t);
				break;
			case 22:
				Qe = (a = Qe) || t.memoizedState !== null, Dt(e, l, t), Qe = a;
				break;
			default:
				Dt(e, l, t)
		}
	}

	function zd(e, l) {
		if (l.memoizedState === null && (e = l.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Vn(e)
		} catch (t) {
			De(l, l.return, t)
		}
	}

	function t1(e) {
		switch (e.tag) {
			case 13:
			case 19:
				var l = e.stateNode;
				return l === null && (l = e.stateNode = new Cd), l;
			case 22:
				return e = e.stateNode, l = e._retryCache, l === null && (l = e._retryCache = new Cd), l;
			default:
				throw Error(r(435, e.tag))
		}
	}

	function cr(e, l) {
		var t = t1(e);
		l.forEach(function(a) {
			var n = f1.bind(null, e, a);
			t.has(a) || (t.add(a), a.then(n, n))
		})
	}

	function _l(e, l) {
		var t = l.deletions;
		if (t !== null)
			for (var a = 0; a < t.length; a++) {
				var n = t[a],
					u = e,
					c = l,
					f = c;
				e: for (; f !== null;) {
					switch (f.tag) {
						case 27:
							if (ra(f.type)) {
								ke = f.stateNode, Dl = !1;
								break e
							}
							break;
						case 5:
							ke = f.stateNode, Dl = !1;
							break e;
						case 3:
						case 4:
							ke = f.stateNode.containerInfo, Dl = !0;
							break e
					}
					f = f.return
				}
				if (ke === null) throw Error(r(160));
				kd(u, c, n), ke = null, Dl = !1, u = n.alternate, u !== null && (u.return = null), n.return = null
			}
		if (l.subtreeFlags & 13878)
			for (l = l.child; l !== null;) _d(l, e), l = l.sibling
	}
	var Jl = null;

	function _d(e, l) {
		var t = e.alternate,
			a = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				_l(l, e), Ul(e), a & 4 && (la(3, e, e.return), En(3, e), la(5, e, e.return));
				break;
			case 1:
				_l(l, e), Ul(e), a & 512 && (Qe || t === null || ot(t, t.return)), a & 64 && Lt && (e = e.updateQueue, e !== null && (a = e.callbacks, a !== null && (t = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = t === null ? a : t.concat(a))));
				break;
			case 26:
				var n = Jl;
				if (_l(l, e), Ul(e), a & 512 && (Qe || t === null || ot(t, t.return)), a & 4) {
					var u = t !== null ? t.memoizedState : null;
					if (a = e.memoizedState, t === null)
						if (a === null)
							if (e.stateNode === null) {
								e: {
									a = e.type,
									t = e.memoizedProps,
									n = n.ownerDocument || n;l: switch (a) {
										case "title":
											u = n.getElementsByTagName("title")[0], (!u || u[Gt] || u[Fe] || u.namespaceURI === "http://www.w3.org/2000/svg" || u.hasAttribute("itemprop")) && (u = n.createElement(a), n.head.insertBefore(u, n.querySelector("head > title"))), hl(u, a, t), u[Fe] = e, Ue(u), a = u;
											break e;
										case "link":
											var c = B0("link", "href", n).get(a + (t.href || ""));
											if (c) {
												for (var f = 0; f < c.length; f++)
													if (u = c[f], u.getAttribute("href") === (t.href == null || t.href === "" ? null : t.href) && u.getAttribute("rel") === (t.rel == null ? null : t.rel) && u.getAttribute("title") === (t.title == null ? null : t.title) && u.getAttribute("crossorigin") === (t.crossOrigin == null ? null : t.crossOrigin)) {
														c.splice(f, 1);
														break l
													}
											}
											u = n.createElement(a), hl(u, a, t), n.head.appendChild(u);
											break;
										case "meta":
											if (c = B0("meta", "content", n).get(a + (t.content || ""))) {
												for (f = 0; f < c.length; f++)
													if (u = c[f], u.getAttribute("content") === (t.content == null ? null : "" + t.content) && u.getAttribute("name") === (t.name == null ? null : t.name) && u.getAttribute("property") === (t.property == null ? null : t.property) && u.getAttribute("http-equiv") === (t.httpEquiv == null ? null : t.httpEquiv) && u.getAttribute("charset") === (t.charSet == null ? null : t.charSet)) {
														c.splice(f, 1);
														break l
													}
											}
											u = n.createElement(a), hl(u, a, t), n.head.appendChild(u);
											break;
										default:
											throw Error(r(468, a))
									}
									u[Fe] = e,
									Ue(u),
									a = u
								}
								e.stateNode = a
							}
					else C0(n, e.type, e.stateNode);
					else e.stateNode = D0(n, a, e.memoizedProps);
					else u !== a ? (u === null ? t.stateNode !== null && (t = t.stateNode, t.parentNode.removeChild(t)) : u.count--, a === null ? C0(n, e.type, e.stateNode) : D0(n, a, e.memoizedProps)) : a === null && e.stateNode !== null && ir(e, e.memoizedProps, t.memoizedProps)
				}
				break;
			case 27:
				_l(l, e), Ul(e), a & 512 && (Qe || t === null || ot(t, t.return)), t !== null && a & 4 && ir(e, e.memoizedProps, t.memoizedProps);
				break;
			case 5:
				if (_l(l, e), Ul(e), a & 512 && (Qe || t === null || ot(t, t.return)), e.flags & 32) {
					n = e.stateNode;
					try {
						Kt(n, "")
					} catch (B) {
						De(e, e.return, B)
					}
				}
				a & 4 && e.stateNode != null && (n = e.memoizedProps, ir(e, n, t !== null ? t.memoizedProps : n)), a & 1024 && (or = !0);
				break;
			case 6:
				if (_l(l, e), Ul(e), a & 4) {
					if (e.stateNode === null) throw Error(r(162));
					a = e.memoizedProps, t = e.stateNode;
					try {
						t.nodeValue = a
					} catch (B) {
						De(e, e.return, B)
					}
				}
				break;
			case 3:
				if (bo = null, n = Jl, Jl = mo(l.containerInfo), _l(l, e), Jl = n, Ul(e), a & 4 && t !== null && t.memoizedState.isDehydrated) try {
					Vn(l.containerInfo)
				} catch (B) {
					De(e, e.return, B)
				}
				or && (or = !1, Ud(e));
				break;
			case 4:
				a = Jl, Jl = mo(e.stateNode.containerInfo), _l(l, e), Ul(e), Jl = a;
				break;
			case 12:
				_l(l, e), Ul(e);
				break;
			case 13:
				_l(l, e), Ul(e), e.child.flags & 8192 && e.memoizedState !== null != (t !== null && t.memoizedState !== null) && (hr = Al()), a & 4 && (a = e.updateQueue, a !== null && (e.updateQueue = null, cr(e, a)));
				break;
			case 22:
				n = e.memoizedState !== null;
				var m = t !== null && t.memoizedState !== null,
					L = Lt,
					O = Qe;
				if (Lt = L || n, Qe = O || m, _l(l, e), Qe = O, Lt = L, Ul(e), a & 8192) e: for (l = e.stateNode, l._visibility = n ? l._visibility & -2 : l._visibility | 1, n && (t === null || m || Lt || Qe || Ra(e)), t = null, l = e;;) {
					if (l.tag === 5 || l.tag === 26) {
						if (t === null) {
							m = t = l;
							try {
								if (u = m.stateNode, n) c = u.style, typeof c.setProperty == "function" ? c.setProperty("display", "none", "important") : c.display = "none";
								else {
									f = m.stateNode;
									var _ = m.memoizedProps.style,
										D = _ != null && _.hasOwnProperty("display") ? _.display : null;
									f.style.display = D == null || typeof D == "boolean" ? "" : ("" + D).trim()
								}
							} catch (B) {
								De(m, m.return, B)
							}
						}
					} else if (l.tag === 6) {
						if (t === null) {
							m = l;
							try {
								m.stateNode.nodeValue = n ? "" : m.memoizedProps
							} catch (B) {
								De(m, m.return, B)
							}
						}
					} else if ((l.tag !== 22 && l.tag !== 23 || l.memoizedState === null || l === e) && l.child !== null) {
						l.child.return = l, l = l.child;
						continue
					}
					if (l === e) break e;
					for (; l.sibling === null;) {
						if (l.return === null || l.return === e) break e;
						t === l && (t = null), l = l.return
					}
					t === l && (t = null), l.sibling.return = l.return, l = l.sibling
				}
				a & 4 && (a = e.updateQueue, a !== null && (t = a.retryQueue, t !== null && (a.retryQueue = null, cr(e, t))));
				break;
			case 19:
				_l(l, e), Ul(e), a & 4 && (a = e.updateQueue, a !== null && (e.updateQueue = null, cr(e, a)));
				break;
			case 30:
				break;
			case 21:
				break;
			default:
				_l(l, e), Ul(e)
		}
	}

	function Ul(e) {
		var l = e.flags;
		if (l & 2) {
			try {
				for (var t, a = e.return; a !== null;) {
					if (Dd(a)) {
						t = a;
						break
					}
					a = a.return
				}
				if (t == null) throw Error(r(160));
				switch (t.tag) {
					case 27:
						var n = t.stateNode,
							u = nr(e);
						lo(e, u, n);
						break;
					case 5:
						var c = t.stateNode;
						t.flags & 32 && (Kt(c, ""), t.flags &= -33);
						var f = nr(e);
						lo(e, f, c);
						break;
					case 3:
					case 4:
						var m = t.stateNode.containerInfo,
							L = nr(e);
						ur(e, L, m);
						break;
					default:
						throw Error(r(161))
				}
			} catch (O) {
				De(e, e.return, O)
			}
			e.flags &= -3
		}
		l & 4096 && (e.flags &= -4097)
	}

	function Ud(e) {
		if (e.subtreeFlags & 1024)
			for (e = e.child; e !== null;) {
				var l = e;
				Ud(l), l.tag === 5 && l.flags & 1024 && l.stateNode.reset(), e = e.sibling
			}
	}

	function ta(e, l) {
		if (l.subtreeFlags & 8772)
			for (l = l.child; l !== null;) Nd(e, l.alternate, l), l = l.sibling
	}

	function Ra(e) {
		for (e = e.child; e !== null;) {
			var l = e;
			switch (l.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					la(4, l, l.return), Ra(l);
					break;
				case 1:
					ot(l, l.return);
					var t = l.stateNode;
					typeof t.componentWillUnmount == "function" && Md(l, l.return, t), Ra(l);
					break;
				case 27:
					_n(l.stateNode);
				case 26:
				case 5:
					ot(l, l.return), Ra(l);
					break;
				case 22:
					l.memoizedState === null && Ra(l);
					break;
				case 30:
					Ra(l);
					break;
				default:
					Ra(l)
			}
			e = e.sibling
		}
	}

	function aa(e, l, t) {
		for (t = t && (l.subtreeFlags & 8772) !== 0, l = l.child; l !== null;) {
			var a = l.alternate,
				n = e,
				u = l,
				c = u.flags;
			switch (u.tag) {
				case 0:
				case 11:
				case 15:
					aa(n, u, t), En(4, u);
					break;
				case 1:
					if (aa(n, u, t), a = u, n = a.stateNode, typeof n.componentDidMount == "function") try {
						n.componentDidMount()
					} catch (L) {
						De(a, a.return, L)
					}
					if (a = u, n = a.updateQueue, n !== null) {
						var f = a.stateNode;
						try {
							var m = n.shared.hiddenCallbacks;
							if (m !== null)
								for (n.shared.hiddenCallbacks = null, n = 0; n < m.length; n++) sf(m[n], f)
						} catch (L) {
							De(a, a.return, L)
						}
					}
					t && c & 64 && Ed(u), Mn(u, u.return);
					break;
				case 27:
					Bd(u);
				case 26:
				case 5:
					aa(n, u, t), t && a === null && c & 4 && Ld(u), Mn(u, u.return);
					break;
				case 12:
					aa(n, u, t);
					break;
				case 13:
					aa(n, u, t), t && c & 4 && zd(n, u);
					break;
				case 22:
					u.memoizedState === null && aa(n, u, t), Mn(u, u.return);
					break;
				case 30:
					break;
				default:
					aa(n, u, t)
			}
			l = l.sibling
		}
	}

	function rr(e, l) {
		var t = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (t = e.memoizedState.cachePool.pool), e = null, l.memoizedState !== null && l.memoizedState.cachePool !== null && (e = l.memoizedState.cachePool.pool), e !== t && (e != null && e.refCount++, t != null && sn(t))
	}

	function sr(e, l) {
		e = null, l.alternate !== null && (e = l.alternate.memoizedState.cache), l = l.memoizedState.cache, l !== e && (l.refCount++, e != null && sn(e))
	}

	function ct(e, l, t, a) {
		if (l.subtreeFlags & 10256)
			for (l = l.child; l !== null;) Hd(e, l, t, a), l = l.sibling
	}

	function Hd(e, l, t, a) {
		var n = l.flags;
		switch (l.tag) {
			case 0:
			case 11:
			case 15:
				ct(e, l, t, a), n & 2048 && En(9, l);
				break;
			case 1:
				ct(e, l, t, a);
				break;
			case 3:
				ct(e, l, t, a), n & 2048 && (e = null, l.alternate !== null && (e = l.alternate.memoizedState.cache), l = l.memoizedState.cache, l !== e && (l.refCount++, e != null && sn(e)));
				break;
			case 12:
				if (n & 2048) {
					ct(e, l, t, a), e = l.stateNode;
					try {
						var u = l.memoizedProps,
							c = u.id,
							f = u.onPostCommit;
						typeof f == "function" && f(c, l.alternate === null ? "mount" : "update", e.passiveEffectDuration, -0)
					} catch (m) {
						De(l, l.return, m)
					}
				} else ct(e, l, t, a);
				break;
			case 13:
				ct(e, l, t, a);
				break;
			case 23:
				break;
			case 22:
				u = l.stateNode, c = l.alternate, l.memoizedState !== null ? u._visibility & 2 ? ct(e, l, t, a) : Ln(e, l) : u._visibility & 2 ? ct(e, l, t, a) : (u._visibility |= 2, yi(e, l, t, a, (l.subtreeFlags & 10256) !== 0)), n & 2048 && rr(c, l);
				break;
			case 24:
				ct(e, l, t, a), n & 2048 && sr(l.alternate, l);
				break;
			default:
				ct(e, l, t, a)
		}
	}

	function yi(e, l, t, a, n) {
		for (n = n && (l.subtreeFlags & 10256) !== 0, l = l.child; l !== null;) {
			var u = e,
				c = l,
				f = t,
				m = a,
				L = c.flags;
			switch (c.tag) {
				case 0:
				case 11:
				case 15:
					yi(u, c, f, m, n), En(8, c);
					break;
				case 23:
					break;
				case 22:
					var O = c.stateNode;
					c.memoizedState !== null ? O._visibility & 2 ? yi(u, c, f, m, n) : Ln(u, c) : (O._visibility |= 2, yi(u, c, f, m, n)), n && L & 2048 && rr(c.alternate, c);
					break;
				case 24:
					yi(u, c, f, m, n), n && L & 2048 && sr(c.alternate, c);
					break;
				default:
					yi(u, c, f, m, n)
			}
			l = l.sibling
		}
	}

	function Ln(e, l) {
		if (l.subtreeFlags & 10256)
			for (l = l.child; l !== null;) {
				var t = e,
					a = l,
					n = a.flags;
				switch (a.tag) {
					case 22:
						Ln(t, a), n & 2048 && rr(a.alternate, a);
						break;
					case 24:
						Ln(t, a), n & 2048 && sr(a.alternate, a);
						break;
					default:
						Ln(t, a)
				}
				l = l.sibling
			}
	}
	var Dn = 8192;

	function Si(e) {
		if (e.subtreeFlags & Dn)
			for (e = e.child; e !== null;) jd(e), e = e.sibling
	}

	function jd(e) {
		switch (e.tag) {
			case 26:
				Si(e), e.flags & Dn && e.memoizedState !== null && F1(Jl, e.memoizedState, e.memoizedProps);
				break;
			case 5:
				Si(e);
				break;
			case 3:
			case 4:
				var l = Jl;
				Jl = mo(e.stateNode.containerInfo), Si(e), Jl = l;
				break;
			case 22:
				e.memoizedState === null && (l = e.alternate, l !== null && l.memoizedState !== null ? (l = Dn, Dn = 16777216, Si(e), Dn = l) : Si(e));
				break;
			default:
				Si(e)
		}
	}

	function Gd(e) {
		var l = e.alternate;
		if (l !== null && (e = l.child, e !== null)) {
			l.child = null;
			do l = e.sibling, e.sibling = null, e = l; while (e !== null)
		}
	}

	function Bn(e) {
		var l = e.deletions;
		if ((e.flags & 16) !== 0) {
			if (l !== null)
				for (var t = 0; t < l.length; t++) {
					var a = l[t];
					ul = a, wd(a, e)
				}
			Gd(e)
		}
		if (e.subtreeFlags & 10256)
			for (e = e.child; e !== null;) Rd(e), e = e.sibling
	}

	function Rd(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Bn(e), e.flags & 2048 && la(9, e, e.return);
				break;
			case 3:
				Bn(e);
				break;
			case 12:
				Bn(e);
				break;
			case 22:
				var l = e.stateNode;
				e.memoizedState !== null && l._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (l._visibility &= -3, to(e)) : Bn(e);
				break;
			default:
				Bn(e)
		}
	}

	function to(e) {
		var l = e.deletions;
		if ((e.flags & 16) !== 0) {
			if (l !== null)
				for (var t = 0; t < l.length; t++) {
					var a = l[t];
					ul = a, wd(a, e)
				}
			Gd(e)
		}
		for (e = e.child; e !== null;) {
			switch (l = e, l.tag) {
				case 0:
				case 11:
				case 15:
					la(8, l, l.return), to(l);
					break;
				case 22:
					t = l.stateNode, t._visibility & 2 && (t._visibility &= -3, to(l));
					break;
				default:
					to(l)
			}
			e = e.sibling
		}
	}

	function wd(e, l) {
		for (; ul !== null;) {
			var t = ul;
			switch (t.tag) {
				case 0:
				case 11:
				case 15:
					la(8, t, l);
					break;
				case 23:
				case 22:
					if (t.memoizedState !== null && t.memoizedState.cachePool !== null) {
						var a = t.memoizedState.cachePool.pool;
						a != null && a.refCount++
					}
					break;
				case 24:
					sn(t.memoizedState.cache)
			}
			if (a = t.child, a !== null) a.return = t, ul = a;
			else e: for (t = e; ul !== null;) {
				a = ul;
				var n = a.sibling,
					u = a.return;
				if (Od(a), a === t) {
					ul = null;
					break e
				}
				if (n !== null) {
					n.return = u, ul = n;
					break e
				}
				ul = u
			}
		}
	}
	var a1 = {
			getCacheForType: function(e) {
				var l = vl(el),
					t = l.data.get(e);
				return t === void 0 && (t = e(), l.data.set(e, t)), t
			}
		},
		i1 = typeof WeakMap == "function" ? WeakMap : Map,
		Te = 0,
		Ce = null,
		he = null,
		be = 0,
		Ae = 0,
		Hl = null,
		ia = !1,
		xi = !1,
		fr = !1,
		Bt = 0,
		Ge = 0,
		na = 0,
		wa = 0,
		dr = 0,
		Kl = 0,
		Ti = 0,
		Cn = null,
		Bl = null,
		pr = !1,
		hr = 0,
		ao = 1 / 0,
		io = null,
		ua = null,
		pl = 0,
		oa = null,
		Ai = null,
		Ei = 0,
		mr = 0,
		gr = null,
		Fd = null,
		Nn = 0,
		br = null;

	function jl() {
		if ((Te & 2) !== 0 && be !== 0) return be & -be;
		if (N.T !== null) {
			var e = fi;
			return e !== 0 ? e : Er()
		}
		return su()
	}

	function Vd() {
		Kl === 0 && (Kl = (be & 536870912) === 0 || xe ? cu() : 536870912);
		var e = ql.current;
		return e !== null && (e.flags |= 32), Kl
	}

	function Gl(e, l, t) {
		(e === Ce && (Ae === 2 || Ae === 9) || e.cancelPendingCommit !== null) && (Mi(e, 0), ca(e, be, Kl, !1)), jt(e, t), ((Te & 2) === 0 || e !== Ce) && (e === Ce && ((Te & 2) === 0 && (wa |= t), Ge === 4 && ca(e, be, Kl, !1)), rt(e))
	}

	function Yd(e, l, t) {
		if ((Te & 6) !== 0) throw Error(r(327));
		var a = !t && (l & 124) === 0 && (l & e.expiredLanes) === 0 || va(e, l),
			n = a ? o1(e, l) : Sr(e, l, !0),
			u = a;
		do {
			if (n === 0) {
				xi && !a && ca(e, l, 0, !1);
				break
			} else {
				if (t = e.current.alternate, u && !n1(t)) {
					n = Sr(e, l, !1), u = !1;
					continue
				}
				if (n === 2) {
					if (u = l, e.errorRecoveryDisabledLanes & u) var c = 0;
					else c = e.pendingLanes & -536870913, c = c !== 0 ? c : c & 536870912 ? 536870912 : 0;
					if (c !== 0) {
						l = c;
						e: {
							var f = e;n = Cn;
							var m = f.current.memoizedState.isDehydrated;
							if (m && (Mi(f, c).flags |= 256), c = Sr(f, c, !1), c !== 2) {
								if (fr && !m) {
									f.errorRecoveryDisabledLanes |= u, wa |= u, n = 4;
									break e
								}
								u = Bl, Bl = n, u !== null && (Bl === null ? Bl = u : Bl.push.apply(Bl, u))
							}
							n = c
						}
						if (u = !1, n !== 2) continue
					}
				}
				if (n === 1) {
					Mi(e, 0), ca(e, l, 0, !0);
					break
				}
				e: {
					switch (a = e, u = n, u) {
						case 0:
						case 1:
							throw Error(r(345));
						case 4:
							if ((l & 4194048) !== l) break;
						case 6:
							ca(a, l, Kl, !ia);
							break e;
						case 2:
							Bl = null;
							break;
						case 3:
						case 5:
							break;
						default:
							throw Error(r(329))
					}
					if ((l & 62914560) === l && (n = hr + 300 - Al(), 10 < n)) {
						if (ca(a, l, Kl, !ia), Ht(a, 0, !0) !== 0) break e;
						a.timeoutHandle = v0(qd.bind(null, a, t, Bl, io, pr, l, Kl, wa, Ti, ia, u, 2, -0, 0), n);
						break e
					}
					qd(a, t, Bl, io, pr, l, Kl, wa, Ti, ia, u, 0, -0, 0)
				}
			}
			break
		} while (!0);
		rt(e)
	}

	function qd(e, l, t, a, n, u, c, f, m, L, O, _, D, B) {
		if (e.timeoutHandle = -1, _ = l.subtreeFlags, (_ & 8192 || (_ & 16785408) === 16785408) && (jn = {
				stylesheets: null,
				count: 0,
				unsuspend: w1
			}, jd(l), _ = V1(), _ !== null)) {
			e.cancelPendingCommit = _(Jd.bind(null, e, l, u, t, a, n, c, f, m, O, 1, D, B)), ca(e, u, c, !L);
			return
		}
		Jd(e, l, u, t, a, n, c, f, m)
	}

	function n1(e) {
		for (var l = e;;) {
			var t = l.tag;
			if ((t === 0 || t === 11 || t === 15) && l.flags & 16384 && (t = l.updateQueue, t !== null && (t = t.stores, t !== null)))
				for (var a = 0; a < t.length; a++) {
					var n = t[a],
						u = n.getSnapshot;
					n = n.value;
					try {
						if (!kl(u(), n)) return !1
					} catch {
						return !1
					}
				}
			if (t = l.child, l.subtreeFlags & 16384 && t !== null) t.return = l, l = t;
			else {
				if (l === e) break;
				for (; l.sibling === null;) {
					if (l.return === null || l.return === e) return !0;
					l = l.return
				}
				l.sibling.return = l.return, l = l.sibling
			}
		}
		return !0
	}

	function ca(e, l, t, a) {
		l &= ~dr, l &= ~wa, e.suspendedLanes |= l, e.pingedLanes &= ~l, a && (e.warmLanes |= l), a = e.expirationTimes;
		for (var n = l; 0 < n;) {
			var u = 31 - cl(n),
				c = 1 << u;
			a[u] = -1, n &= ~c
		}
		t !== 0 && Qa(e, t, l)
	}

	function no() {
		return (Te & 6) === 0 ? (On(0), !1) : !0
	}

	function vr() {
		if (he !== null) {
			if (Ae === 0) var e = he.return;
			else e = he, St = _a = null, Uc(e), bi = null, xn = 0, e = he;
			for (; e !== null;) Ad(e.alternate, e), e = e.return;
			he = null
		}
	}

	function Mi(e, l) {
		var t = e.timeoutHandle;
		t !== -1 && (e.timeoutHandle = -1, A1(t)), t = e.cancelPendingCommit, t !== null && (e.cancelPendingCommit = null, t()), vr(), Ce = e, he = t = bt(e.current, null), be = l, Ae = 0, Hl = null, ia = !1, xi = va(e, l), fr = !1, Ti = Kl = dr = wa = na = Ge = 0, Bl = Cn = null, pr = !1, (l & 8) !== 0 && (l |= l & 32);
		var a = e.entangledLanes;
		if (a !== 0)
			for (e = e.entanglements, a &= l; 0 < a;) {
				var n = 31 - cl(a),
					u = 1 << n;
				l |= e[n], a &= ~u
			}
		return Bt = l, Du(), t
	}

	function Kd(e, l) {
		se = null, N.H = Qu, l === dn || l === Hu ? (l = cf(), Ae = 3) : l === nf ? (l = cf(), Ae = 4) : Ae = l === rd ? 8 : l !== null && typeof l == "object" && typeof l.then == "function" ? 6 : 1, Hl = l, he === null && (Ge = 1, Ju(e, wl(l, e.current)))
	}

	function Qd() {
		var e = N.H;
		return N.H = Qu, e === null ? Qu : e
	}

	function Pd() {
		var e = N.A;
		return N.A = a1, e
	}

	function yr() {
		Ge = 4, ia || (be & 4194048) !== be && ql.current !== null || (xi = !0), (na & 134217727) === 0 && (wa & 134217727) === 0 || Ce === null || ca(Ce, be, Kl, !1)
	}

	function Sr(e, l, t) {
		var a = Te;
		Te |= 2;
		var n = Qd(),
			u = Pd();
		(Ce !== e || be !== l) && (io = null, Mi(e, l)), l = !1;
		var c = Ge;
		e: do try {
				if (Ae !== 0 && he !== null) {
					var f = he,
						m = Hl;
					switch (Ae) {
						case 8:
							vr(), c = 6;
							break e;
						case 3:
						case 2:
						case 9:
						case 6:
							ql.current === null && (l = !0);
							var L = Ae;
							if (Ae = 0, Hl = null, Li(e, f, m, L), t && xi) {
								c = 0;
								break e
							}
							break;
						default:
							L = Ae, Ae = 0, Hl = null, Li(e, f, m, L)
					}
				}
				u1(), c = Ge;
				break
			} catch (O) {
				Kd(e, O)
			}
			while (!0);
			return l && e.shellSuspendCounter++, St = _a = null, Te = a, N.H = n, N.A = u, he === null && (Ce = null, be = 0, Du()), c
	}

	function u1() {
		for (; he !== null;) Xd(he)
	}

	function o1(e, l) {
		var t = Te;
		Te |= 2;
		var a = Qd(),
			n = Pd();
		Ce !== e || be !== l ? (io = null, ao = Al() + 500, Mi(e, l)) : xi = va(e, l);
		e: do try {
				if (Ae !== 0 && he !== null) {
					l = he;
					var u = Hl;
					l: switch (Ae) {
						case 1:
							Ae = 0, Hl = null, Li(e, l, u, 1);
							break;
						case 2:
						case 9:
							if (uf(u)) {
								Ae = 0, Hl = null, Zd(l);
								break
							}
							l = function() {
								Ae !== 2 && Ae !== 9 || Ce !== e || (Ae = 7), rt(e)
							}, u.then(l, l);
							break e;
						case 3:
							Ae = 7;
							break e;
						case 4:
							Ae = 5;
							break e;
						case 7:
							uf(u) ? (Ae = 0, Hl = null, Zd(l)) : (Ae = 0, Hl = null, Li(e, l, u, 7));
							break;
						case 5:
							var c = null;
							switch (he.tag) {
								case 26:
									c = he.memoizedState;
								case 5:
								case 27:
									var f = he;
									if (!c || N0(c)) {
										Ae = 0, Hl = null;
										var m = f.sibling;
										if (m !== null) he = m;
										else {
											var L = f.return;
											L !== null ? (he = L, uo(L)) : he = null
										}
										break l
									}
							}
							Ae = 0, Hl = null, Li(e, l, u, 5);
							break;
						case 6:
							Ae = 0, Hl = null, Li(e, l, u, 6);
							break;
						case 8:
							vr(), Ge = 6;
							break e;
						default:
							throw Error(r(462))
					}
				}
				c1();
				break
			} catch (O) {
				Kd(e, O)
			}
			while (!0);
			return St = _a = null, N.H = a, N.A = n, Te = t, he !== null ? 0 : (Ce = null, be = 0, Du(), Ge)
	}

	function c1() {
		for (; he !== null && !tu();) Xd(he)
	}

	function Xd(e) {
		var l = xd(e.alternate, e, Bt);
		e.memoizedProps = e.pendingProps, l === null ? uo(e) : he = l
	}

	function Zd(e) {
		var l = e,
			t = l.alternate;
		switch (l.tag) {
			case 15:
			case 0:
				l = md(t, l, l.pendingProps, l.type, void 0, be);
				break;
			case 11:
				l = md(t, l, l.pendingProps, l.type.render, l.ref, be);
				break;
			case 5:
				Uc(l);
			default:
				Ad(t, l), l = he = Zs(l, Bt), l = xd(t, l, Bt)
		}
		e.memoizedProps = e.pendingProps, l === null ? uo(e) : he = l
	}

	function Li(e, l, t, a) {
		St = _a = null, Uc(l), bi = null, xn = 0;
		var n = l.return;
		try {
			if (Jh(e, n, l, t, be)) {
				Ge = 1, Ju(e, wl(t, e.current)), he = null;
				return
			}
		} catch (u) {
			if (n !== null) throw he = n, u;
			Ge = 1, Ju(e, wl(t, e.current)), he = null;
			return
		}
		l.flags & 32768 ? (xe || a === 1 ? e = !0 : xi || (be & 536870912) !== 0 ? e = !1 : (ia = e = !0, (a === 2 || a === 9 || a === 3 || a === 6) && (a = ql.current, a !== null && a.tag === 13 && (a.flags |= 16384))), Id(l, e)) : uo(l)
	}

	function uo(e) {
		var l = e;
		do {
			if ((l.flags & 32768) !== 0) {
				Id(l, ia);
				return
			}
			e = l.return;
			var t = Wh(l.alternate, l, Bt);
			if (t !== null) {
				he = t;
				return
			}
			if (l = l.sibling, l !== null) {
				he = l;
				return
			}
			he = l = e
		} while (l !== null);
		Ge === 0 && (Ge = 5)
	}

	function Id(e, l) {
		do {
			var t = e1(e.alternate, e);
			if (t !== null) {
				t.flags &= 32767, he = t;
				return
			}
			if (t = e.return, t !== null && (t.flags |= 32768, t.subtreeFlags = 0, t.deletions = null), !l && (e = e.sibling, e !== null)) {
				he = e;
				return
			}
			he = e = t
		} while (e !== null);
		Ge = 6, he = null
	}

	function Jd(e, l, t, a, n, u, c, f, m) {
		e.cancelPendingCommit = null;
		do oo(); while (pl !== 0);
		if ((Te & 6) !== 0) throw Error(r(327));
		if (l !== null) {
			if (l === e.current) throw Error(r(177));
			if (u = l.lanes | l.childLanes, u |= sc, Yo(e, t, u, c, f, m), e === Ce && (he = Ce = null, be = 0), Ai = l, oa = e, Ei = t, mr = u, gr = n, Fd = a, (l.subtreeFlags & 10256) !== 0 || (l.flags & 10256) !== 0 ? (e.callbackNode = null, e.callbackPriority = 0, d1(zt, function() {
					return t0(), null
				})) : (e.callbackNode = null, e.callbackPriority = 0), a = (l.flags & 13878) !== 0, (l.subtreeFlags & 13878) !== 0 || a) {
				a = N.T, N.T = null, n = F.p, F.p = 2, c = Te, Te |= 4;
				try {
					l1(e, l, t)
				} finally {
					Te = c, F.p = n, N.T = a
				}
			}
			pl = 1, $d(), Wd(), e0()
		}
	}

	function $d() {
		if (pl === 1) {
			pl = 0;
			var e = oa,
				l = Ai,
				t = (l.flags & 13878) !== 0;
			if ((l.subtreeFlags & 13878) !== 0 || t) {
				t = N.T, N.T = null;
				var a = F.p;
				F.p = 2;
				var n = Te;
				Te |= 4;
				try {
					_d(l, e);
					var u = kr,
						c = Rs(e.containerInfo),
						f = u.focusedElem,
						m = u.selectionRange;
					if (c !== f && f && f.ownerDocument && Gs(f.ownerDocument.documentElement, f)) {
						if (m !== null && nc(f)) {
							var L = m.start,
								O = m.end;
							if (O === void 0 && (O = L), "selectionStart" in f) f.selectionStart = L, f.selectionEnd = Math.min(O, f.value.length);
							else {
								var _ = f.ownerDocument || document,
									D = _ && _.defaultView || window;
								if (D.getSelection) {
									var B = D.getSelection(),
										ae = f.textContent.length,
										le = Math.min(m.start, ae),
										Le = m.end === void 0 ? le : Math.min(m.end, ae);
									!B.extend && le > Le && (c = Le, Le = le, le = c);
									var E = js(f, le),
										x = js(f, Le);
									if (E && x && (B.rangeCount !== 1 || B.anchorNode !== E.node || B.anchorOffset !== E.offset || B.focusNode !== x.node || B.focusOffset !== x.offset)) {
										var M = _.createRange();
										M.setStart(E.node, E.offset), B.removeAllRanges(), le > Le ? (B.addRange(M), B.extend(x.node, x.offset)) : (M.setEnd(x.node, x.offset), B.addRange(M))
									}
								}
							}
						}
						for (_ = [], B = f; B = B.parentNode;) B.nodeType === 1 && _.push({
							element: B,
							left: B.scrollLeft,
							top: B.scrollTop
						});
						for (typeof f.focus == "function" && f.focus(), f = 0; f < _.length; f++) {
							var k = _[f];
							k.element.scrollLeft = k.left, k.element.scrollTop = k.top
						}
					}
					So = !!Or, kr = Or = null
				} finally {
					Te = n, F.p = a, N.T = t
				}
			}
			e.current = l, pl = 2
		}
	}

	function Wd() {
		if (pl === 2) {
			pl = 0;
			var e = oa,
				l = Ai,
				t = (l.flags & 8772) !== 0;
			if ((l.subtreeFlags & 8772) !== 0 || t) {
				t = N.T, N.T = null;
				var a = F.p;
				F.p = 2;
				var n = Te;
				Te |= 4;
				try {
					Nd(e, l.alternate, l)
				} finally {
					Te = n, F.p = a, N.T = t
				}
			}
			pl = 3
		}
	}

	function e0() {
		if (pl === 4 || pl === 3) {
			pl = 0, Ro();
			var e = oa,
				l = Ai,
				t = Ei,
				a = Fd;
			(l.subtreeFlags & 10256) !== 0 || (l.flags & 10256) !== 0 ? pl = 5 : (pl = 0, Ai = oa = null, l0(e, e.pendingLanes));
			var n = e.pendingLanes;
			if (n === 0 && (ua = null), Pa(t), l = l.stateNode, gl && typeof gl.onCommitFiberRoot == "function") try {
				gl.onCommitFiberRoot(_t, l, void 0, (l.current.flags & 128) === 128)
			} catch {}
			if (a !== null) {
				l = N.T, n = F.p, F.p = 2, N.T = null;
				try {
					for (var u = e.onRecoverableError, c = 0; c < a.length; c++) {
						var f = a[c];
						u(f.value, {
							componentStack: f.stack
						})
					}
				} finally {
					N.T = l, F.p = n
				}
			}(Ei & 3) !== 0 && oo(), rt(e), n = e.pendingLanes, (t & 4194090) !== 0 && (n & 42) !== 0 ? e === br ? Nn++ : (Nn = 0, br = e) : Nn = 0, On(0)
		}
	}

	function l0(e, l) {
		(e.pooledCacheLanes &= l) === 0 && (l = e.pooledCache, l != null && (e.pooledCache = null, sn(l)))
	}

	function oo(e) {
		return $d(), Wd(), e0(), t0()
	}

	function t0() {
		if (pl !== 5) return !1;
		var e = oa,
			l = mr;
		mr = 0;
		var t = Pa(Ei),
			a = N.T,
			n = F.p;
		try {
			F.p = 32 > t ? 32 : t, N.T = null, t = gr, gr = null;
			var u = oa,
				c = Ei;
			if (pl = 0, Ai = oa = null, Ei = 0, (Te & 6) !== 0) throw Error(r(331));
			var f = Te;
			if (Te |= 4, Rd(u.current), Hd(u, u.current, c, t), Te = f, On(0, !1), gl && typeof gl.onPostCommitFiberRoot == "function") try {
				gl.onPostCommitFiberRoot(_t, u)
			} catch {}
			return !0
		} finally {
			F.p = n, N.T = a, l0(e, l)
		}
	}

	function a0(e, l, t) {
		l = wl(t, l), l = Zc(e.stateNode, l, 2), e = Jt(e, l, 2), e !== null && (jt(e, 2), rt(e))
	}

	function De(e, l, t) {
		if (e.tag === 3) a0(e, e, t);
		else
			for (; l !== null;) {
				if (l.tag === 3) {
					a0(l, e, t);
					break
				} else if (l.tag === 1) {
					var a = l.stateNode;
					if (typeof l.type.getDerivedStateFromError == "function" || typeof a.componentDidCatch == "function" && (ua === null || !ua.has(a))) {
						e = wl(t, e), t = od(2), a = Jt(l, t, 2), a !== null && (cd(t, a, l, e), jt(a, 2), rt(a));
						break
					}
				}
				l = l.return
			}
	}

	function xr(e, l, t) {
		var a = e.pingCache;
		if (a === null) {
			a = e.pingCache = new i1;
			var n = new Set;
			a.set(l, n)
		} else n = a.get(l), n === void 0 && (n = new Set, a.set(l, n));
		n.has(t) || (fr = !0, n.add(t), e = r1.bind(null, e, l, t), l.then(e, e))
	}

	function r1(e, l, t) {
		var a = e.pingCache;
		a !== null && a.delete(l), e.pingedLanes |= e.suspendedLanes & t, e.warmLanes &= ~t, Ce === e && (be & t) === t && (Ge === 4 || Ge === 3 && (be & 62914560) === be && 300 > Al() - hr ? (Te & 2) === 0 && Mi(e, 0) : dr |= t, Ti === be && (Ti = 0)), rt(e)
	}

	function i0(e, l) {
		l === 0 && (l = Vi()), e = oi(e, l), e !== null && (jt(e, l), rt(e))
	}

	function s1(e) {
		var l = e.memoizedState,
			t = 0;
		l !== null && (t = l.retryLane), i0(e, t)
	}

	function f1(e, l) {
		var t = 0;
		switch (e.tag) {
			case 13:
				var a = e.stateNode,
					n = e.memoizedState;
				n !== null && (t = n.retryLane);
				break;
			case 19:
				a = e.stateNode;
				break;
			case 22:
				a = e.stateNode._retryCache;
				break;
			default:
				throw Error(r(314))
		}
		a !== null && a.delete(l), i0(e, t)
	}

	function d1(e, l) {
		return Ya(e, l)
	}
	var co = null,
		Di = null,
		Tr = !1,
		ro = !1,
		Ar = !1,
		Fa = 0;

	function rt(e) {
		e !== Di && e.next === null && (Di === null ? co = Di = e : Di = Di.next = e), ro = !0, Tr || (Tr = !0, h1())
	}

	function On(e, l) {
		if (!Ar && ro) {
			Ar = !0;
			do
				for (var t = !1, a = co; a !== null;) {
					if (e !== 0) {
						var n = a.pendingLanes;
						if (n === 0) var u = 0;
						else {
							var c = a.suspendedLanes,
								f = a.pingedLanes;
							u = (1 << 31 - cl(42 | e) + 1) - 1, u &= n & ~(c & ~f), u = u & 201326741 ? u & 201326741 | 1 : u ? u | 2 : 0
						}
						u !== 0 && (t = !0, c0(a, u))
					} else u = be, u = Ht(a, a === Ce ? u : 0, a.cancelPendingCommit !== null || a.timeoutHandle !== -1), (u & 3) === 0 || va(a, u) || (t = !0, c0(a, u));
					a = a.next
				}
			while (t);
			Ar = !1
		}
	}

	function p1() {
		n0()
	}

	function n0() {
		ro = Tr = !1;
		var e = 0;
		Fa !== 0 && (T1() && (e = Fa), Fa = 0);
		for (var l = Al(), t = null, a = co; a !== null;) {
			var n = a.next,
				u = u0(a, l);
			u === 0 ? (a.next = null, t === null ? co = n : t.next = n, n === null && (Di = t)) : (t = a, (e !== 0 || (u & 3) !== 0) && (ro = !0)), a = n
		}
		On(e)
	}

	function u0(e, l) {
		for (var t = e.suspendedLanes, a = e.pingedLanes, n = e.expirationTimes, u = e.pendingLanes & -62914561; 0 < u;) {
			var c = 31 - cl(u),
				f = 1 << c,
				m = n[c];
			m === -1 ? ((f & t) === 0 || (f & a) !== 0) && (n[c] = ou(f, l)) : m <= l && (e.expiredLanes |= f), u &= ~f
		}
		if (l = Ce, t = be, t = Ht(e, e === l ? t : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), a = e.callbackNode, t === 0 || e === l && (Ae === 2 || Ae === 9) || e.cancelPendingCommit !== null) return a !== null && a !== null && wi(a), e.callbackNode = null, e.callbackPriority = 0;
		if ((t & 3) === 0 || va(e, t)) {
			if (l = t & -t, l === e.callbackPriority) return l;
			switch (a !== null && wi(a), Pa(t)) {
				case 2:
				case 8:
					t = au;
					break;
				case 32:
					t = zt;
					break;
				case 268435456:
					t = Ka;
					break;
				default:
					t = zt
			}
			return a = o0.bind(null, e), t = Ya(t, a), e.callbackPriority = l, e.callbackNode = t, l
		}
		return a !== null && a !== null && wi(a), e.callbackPriority = 2, e.callbackNode = null, 2
	}

	function o0(e, l) {
		if (pl !== 0 && pl !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var t = e.callbackNode;
		if (oo() && e.callbackNode !== t) return null;
		var a = be;
		return a = Ht(e, e === Ce ? a : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), a === 0 ? null : (Yd(e, a, l), u0(e, Al()), e.callbackNode != null && e.callbackNode === t ? o0.bind(null, e) : null)
	}

	function c0(e, l) {
		if (oo()) return null;
		Yd(e, l, !0)
	}

	function h1() {
		E1(function() {
			(Te & 6) !== 0 ? Ya(qa, p1) : n0()
		})
	}

	function Er() {
		return Fa === 0 && (Fa = cu()), Fa
	}

	function r0(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Ja("" + e)
	}

	function s0(e, l) {
		var t = l.ownerDocument.createElement("input");
		return t.name = l.name, t.value = l.value, e.id && t.setAttribute("form", e.id), l.parentNode.insertBefore(t, l), e = new FormData(e), t.parentNode.removeChild(t), e
	}

	function m1(e, l, t, a, n) {
		if (l === "submit" && t && t.stateNode === n) {
			var u = r0((n[rl] || null).action),
				c = a.submitter;
			c && (l = (l = c[rl] || null) ? r0(l.formAction) : c.getAttribute("formAction"), l !== null && (u = l, c = null));
			var f = new li("action", "action", null, a, n);
			e.push({
				event: f,
				listeners: [{
					instance: null,
					listener: function() {
						if (a.defaultPrevented) {
							if (Fa !== 0) {
								var m = c ? s0(n, c) : new FormData(n);
								qc(t, {
									pending: !0,
									data: m,
									method: n.method,
									action: u
								}, null, m)
							}
						} else typeof u == "function" && (f.preventDefault(), m = c ? s0(n, c) : new FormData(n), qc(t, {
							pending: !0,
							data: m,
							method: n.method,
							action: u
						}, u, m))
					},
					currentTarget: n
				}]
			})
		}
	}
	for (var Mr = 0; Mr < rc.length; Mr++) {
		var Lr = rc[Mr],
			g1 = Lr.toLowerCase(),
			b1 = Lr[0].toUpperCase() + Lr.slice(1);
		Il(g1, "on" + b1)
	}
	Il(Vs, "onAnimationEnd"), Il(Ys, "onAnimationIteration"), Il(qs, "onAnimationStart"), Il("dblclick", "onDoubleClick"), Il("focusin", "onFocus"), Il("focusout", "onBlur"), Il(_h, "onTransitionRun"), Il(Uh, "onTransitionStart"), Il(Hh, "onTransitionCancel"), Il(Ks, "onTransitionEnd"), Vt("onMouseEnter", ["mouseout", "mouseover"]), Vt("onMouseLeave", ["mouseout", "mouseover"]), Vt("onPointerEnter", ["pointerout", "pointerover"]), Vt("onPointerLeave", ["pointerout", "pointerover"]), pt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), pt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), pt("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), pt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), pt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), pt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var kn = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),
		v1 = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(kn));

	function f0(e, l) {
		l = (l & 4) !== 0;
		for (var t = 0; t < e.length; t++) {
			var a = e[t],
				n = a.event;
			a = a.listeners;
			e: {
				var u = void 0;
				if (l)
					for (var c = a.length - 1; 0 <= c; c--) {
						var f = a[c],
							m = f.instance,
							L = f.currentTarget;
						if (f = f.listener, m !== u && n.isPropagationStopped()) break e;
						u = f, n.currentTarget = L;
						try {
							u(n)
						} catch (O) {
							Iu(O)
						}
						n.currentTarget = null, u = m
					} else
						for (c = 0; c < a.length; c++) {
							if (f = a[c], m = f.instance, L = f.currentTarget, f = f.listener, m !== u && n.isPropagationStopped()) break e;
							u = f, n.currentTarget = L;
							try {
								u(n)
							} catch (O) {
								Iu(O)
							}
							n.currentTarget = null, u = m
						}
			}
		}
	}

	function me(e, l) {
		var t = l[qi];
		t === void 0 && (t = l[qi] = new Set);
		var a = e + "__bubble";
		t.has(a) || (d0(l, e, 2, !1), t.add(a))
	}

	function Dr(e, l, t) {
		var a = 0;
		l && (a |= 4), d0(t, e, a, l)
	}
	var so = "_reactListening" + Math.random().toString(36).slice(2);

	function Br(e) {
		if (!e[so]) {
			e[so] = !0, du.forEach(function(t) {
				t !== "selectionchange" && (v1.has(t) || Dr(t, !1, e), Dr(t, !0, e))
			});
			var l = e.nodeType === 9 ? e : e.ownerDocument;
			l === null || l[so] || (l[so] = !0, Dr("selectionchange", !1, l))
		}
	}

	function d0(e, l, t, a) {
		switch (H0(l)) {
			case 2:
				var n = K1;
				break;
			case 8:
				n = Q1;
				break;
			default:
				n = Vr
		}
		t = n.bind(null, l, t, e), n = void 0, !sl || l !== "touchstart" && l !== "touchmove" && l !== "wheel" || (n = !0), a ? n !== void 0 ? e.addEventListener(l, t, {
			capture: !0,
			passive: n
		}) : e.addEventListener(l, t, !0) : n !== void 0 ? e.addEventListener(l, t, {
			passive: n
		}) : e.addEventListener(l, t, !1)
	}

	function Cr(e, l, t, a, n) {
		var u = a;
		if ((l & 1) === 0 && (l & 2) === 0 && a !== null) e: for (;;) {
			if (a === null) return;
			var c = a.tag;
			if (c === 3 || c === 4) {
				var f = a.stateNode.containerInfo;
				if (f === n) break;
				if (c === 4)
					for (c = a.return; c !== null;) {
						var m = c.tag;
						if ((m === 3 || m === 4) && c.stateNode.containerInfo === n) return;
						c = c.return
					}
				for (; f !== null;) {
					if (c = Ol(f), c === null) return;
					if (m = c.tag, m === 5 || m === 6 || m === 26 || m === 27) {
						a = u = c;
						continue e
					}
					f = f.parentNode
				}
			}
			a = a.return
		}
		Au(function() {
			var L = u,
				O = tt(t),
				_ = [];
			e: {
				var D = Qs.get(e);
				if (D !== void 0) {
					var B = li,
						ae = e;
					switch (e) {
						case "keypress":
							if (Wa(t) === 0) break e;
						case "keydown":
						case "keyup":
							B = dh;
							break;
						case "focusin":
							ae = "focus", B = ee;
							break;
						case "focusout":
							ae = "blur", B = ee;
							break;
						case "beforeblur":
						case "afterblur":
							B = ee;
							break;
						case "click":
							if (t.button === 2) break e;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							B = b;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							B = z;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							B = mh;
							break;
						case Vs:
						case Ys:
						case qs:
							B = Z;
							break;
						case Ks:
							B = bh;
							break;
						case "scroll":
						case "scrollend":
							B = Wo;
							break;
						case "wheel":
							B = yh;
							break;
						case "copy":
						case "cut":
						case "paste":
							B = fl;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							B = As;
							break;
						case "toggle":
						case "beforetoggle":
							B = xh
					}
					var le = (l & 4) !== 0,
						Le = !le && (e === "scroll" || e === "scrollend"),
						E = le ? D !== null ? D + "Capture" : null : D;
					le = [];
					for (var x = L, M; x !== null;) {
						var k = x;
						if (M = k.stateNode, k = k.tag, k !== 5 && k !== 26 && k !== 27 || M === null || E === null || (k = Ea(x, E), k != null && le.push(zn(x, k, M))), Le) break;
						x = x.return
					}
					0 < le.length && (D = new B(D, ae, null, t, O), _.push({
						event: D,
						listeners: le
					}))
				}
			}
			if ((l & 7) === 0) {
				e: {
					if (D = e === "mouseover" || e === "pointerover", B = e === "mouseout" || e === "pointerout", D && t !== lt && (ae = t.relatedTarget || t.fromElement) && (Ol(ae) || ae[et])) break e;
					if ((B || D) && (D = O.window === O ? O : (D = O.ownerDocument) ? D.defaultView || D.parentWindow : window, B ? (ae = t.relatedTarget || t.toElement, B = L, ae = ae ? Ol(ae) : null, ae !== null && (Le = g(ae), le = ae.tag, ae !== Le || le !== 5 && le !== 27 && le !== 6) && (ae = null)) : (B = null, ae = L), B !== ae)) {
						if (le = b, k = "onMouseLeave", E = "onMouseEnter", x = "mouse", (e === "pointerout" || e === "pointerover") && (le = As, k = "onPointerLeave", E = "onPointerEnter", x = "pointer"), Le = B == null ? D : Rt(B), M = ae == null ? D : Rt(ae), D = new le(k, x + "leave", B, t, O), D.target = Le, D.relatedTarget = M, k = null, Ol(O) === L && (le = new le(E, x + "enter", ae, t, O), le.target = M, le.relatedTarget = Le, k = le), Le = k, B && ae) l: {
							for (le = B, E = ae, x = 0, M = le; M; M = Bi(M)) x++;
							for (M = 0, k = E; k; k = Bi(k)) M++;
							for (; 0 < x - M;) le = Bi(le),
							x--;
							for (; 0 < M - x;) E = Bi(E),
							M--;
							for (; x--;) {
								if (le === E || E !== null && le === E.alternate) break l;
								le = Bi(le), E = Bi(E)
							}
							le = null
						}
						else le = null;
						B !== null && p0(_, D, B, le, !1), ae !== null && Le !== null && p0(_, Le, ae, le, !0)
					}
				}
				e: {
					if (D = L ? Rt(L) : window, B = D.nodeName && D.nodeName.toLowerCase(), B === "select" || B === "input" && D.type === "file") var q = Os;
					else if (Cs(D))
						if (ks) q = Oh;
						else {
							q = Ch;
							var de = Bh
						}
					else B = D.nodeName,
					!B || B.toLowerCase() !== "input" || D.type !== "checkbox" && D.type !== "radio" ? L && Ii(L.elementType) && (q = Os) : q = Nh;
					if (q && (q = q(e, L))) {
						Ns(_, q, t, O);
						break e
					}
					de && de(e, D, L),
					e === "focusout" && L && D.type === "number" && L.memoizedProps.value != null && Zi(D, "number", D.value)
				}
				switch (de = L ? Rt(L) : window, e) {
					case "focusin":
						(Cs(de) || de.contentEditable === "true") && (ii = de, uc = L, nn = null);
						break;
					case "focusout":
						nn = uc = ii = null;
						break;
					case "mousedown":
						oc = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						oc = !1, ws(_, t, O);
						break;
					case "selectionchange":
						if (zh) break;
					case "keydown":
					case "keyup":
						ws(_, t, O)
				}
				var P;
				if (tc) e: {
					switch (e) {
						case "compositionstart":
							var te = "onCompositionStart";
							break e;
						case "compositionend":
							te = "onCompositionEnd";
							break e;
						case "compositionupdate":
							te = "onCompositionUpdate";
							break e
					}
					te = void 0
				}
				else ai ? Ds(e, t) && (te = "onCompositionEnd") : e === "keydown" && t.keyCode === 229 && (te = "onCompositionStart");te && (Es && t.locale !== "ko" && (ai || te !== "onCompositionStart" ? te === "onCompositionEnd" && ai && (P = Eu()) : (qe = O, W = "value" in qe ? qe.value : qe.textContent, ai = !0)), de = fo(L, te), 0 < de.length && (te = new mt(te, e, null, t, O), _.push({
					event: te,
					listeners: de
				}), P ? te.data = P : (P = Bs(t), P !== null && (te.data = P)))),
				(P = Ah ? Eh(e, t) : Mh(e, t)) && (te = fo(L, "onBeforeInput"), 0 < te.length && (de = new mt("onBeforeInput", "beforeinput", null, t, O), _.push({
					event: de,
					listeners: te
				}), de.data = P)),
				m1(_, e, L, t, O)
			}
			f0(_, l)
		})
	}

	function zn(e, l, t) {
		return {
			instance: e,
			listener: l,
			currentTarget: t
		}
	}

	function fo(e, l) {
		for (var t = l + "Capture", a = []; e !== null;) {
			var n = e,
				u = n.stateNode;
			if (n = n.tag, n !== 5 && n !== 26 && n !== 27 || u === null || (n = Ea(e, t), n != null && a.unshift(zn(e, n, u)), n = Ea(e, l), n != null && a.push(zn(e, n, u))), e.tag === 3) return a;
			e = e.return
		}
		return []
	}

	function Bi(e) {
		if (e === null) return null;
		do e = e.return; while (e && e.tag !== 5 && e.tag !== 27);
		return e || null
	}

	function p0(e, l, t, a, n) {
		for (var u = l._reactName, c = []; t !== null && t !== a;) {
			var f = t,
				m = f.alternate,
				L = f.stateNode;
			if (f = f.tag, m !== null && m === a) break;
			f !== 5 && f !== 26 && f !== 27 || L === null || (m = L, n ? (L = Ea(t, u), L != null && c.unshift(zn(t, L, m))) : n || (L = Ea(t, u), L != null && c.push(zn(t, L, m)))), t = t.return
		}
		c.length !== 0 && e.push({
			event: l,
			listeners: c
		})
	}
	var y1 = /\r\n?/g,
		S1 = /\u0000|\uFFFD/g;

	function h0(e) {
		return (typeof e == "string" ? e : "" + e).replace(y1, `
`).replace(S1, "")
	}

	function m0(e, l) {
		return l = h0(l), h0(e) === l
	}

	function po() {}

	function Me(e, l, t, a, n, u) {
		switch (t) {
			case "children":
				typeof a == "string" ? l === "body" || l === "textarea" && a === "" || Kt(e, a) : (typeof a == "number" || typeof a == "bigint") && l !== "body" && Kt(e, "" + a);
				break;
			case "className":
				Ta(e, "class", a);
				break;
			case "tabIndex":
				Ta(e, "tabindex", a);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				Ta(e, t, a);
				break;
			case "style":
				Tu(e, a, u);
				break;
			case "data":
				if (l !== "object") {
					Ta(e, "data", a);
					break
				}
			case "src":
			case "href":
				if (a === "" && (l !== "a" || t !== "href")) {
					e.removeAttribute(t);
					break
				}
				if (a == null || typeof a == "function" || typeof a == "symbol" || typeof a == "boolean") {
					e.removeAttribute(t);
					break
				}
				a = Ja("" + a), e.setAttribute(t, a);
				break;
			case "action":
			case "formAction":
				if (typeof a == "function") {
					e.setAttribute(t, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break
				} else typeof u == "function" && (t === "formAction" ? (l !== "input" && Me(e, l, "name", n.name, n, null), Me(e, l, "formEncType", n.formEncType, n, null), Me(e, l, "formMethod", n.formMethod, n, null), Me(e, l, "formTarget", n.formTarget, n, null)) : (Me(e, l, "encType", n.encType, n, null), Me(e, l, "method", n.method, n, null), Me(e, l, "target", n.target, n, null)));
				if (a == null || typeof a == "symbol" || typeof a == "boolean") {
					e.removeAttribute(t);
					break
				}
				a = Ja("" + a), e.setAttribute(t, a);
				break;
			case "onClick":
				a != null && (e.onclick = po);
				break;
			case "onScroll":
				a != null && me("scroll", e);
				break;
			case "onScrollEnd":
				a != null && me("scrollend", e);
				break;
			case "dangerouslySetInnerHTML":
				if (a != null) {
					if (typeof a != "object" || !("__html" in a)) throw Error(r(61));
					if (t = a.__html, t != null) {
						if (n.children != null) throw Error(r(60));
						e.innerHTML = t
					}
				}
				break;
			case "multiple":
				e.multiple = a && typeof a != "function" && typeof a != "symbol";
				break;
			case "muted":
				e.muted = a && typeof a != "function" && typeof a != "symbol";
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref":
				break;
			case "autoFocus":
				break;
			case "xlinkHref":
				if (a == null || typeof a == "function" || typeof a == "boolean" || typeof a == "symbol") {
					e.removeAttribute("xlink:href");
					break
				}
				t = Ja("" + a), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", t);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				a != null && typeof a != "function" && typeof a != "symbol" ? e.setAttribute(t, "" + a) : e.removeAttribute(t);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				a && typeof a != "function" && typeof a != "symbol" ? e.setAttribute(t, "") : e.removeAttribute(t);
				break;
			case "capture":
			case "download":
				a === !0 ? e.setAttribute(t, "") : a !== !1 && a != null && typeof a != "function" && typeof a != "symbol" ? e.setAttribute(t, a) : e.removeAttribute(t);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				a != null && typeof a != "function" && typeof a != "symbol" && !isNaN(a) && 1 <= a ? e.setAttribute(t, a) : e.removeAttribute(t);
				break;
			case "rowSpan":
			case "start":
				a == null || typeof a == "function" || typeof a == "symbol" || isNaN(a) ? e.removeAttribute(t) : e.setAttribute(t, a);
				break;
			case "popover":
				me("beforetoggle", e), me("toggle", e), xa(e, "popover", a);
				break;
			case "xlinkActuate":
				Zl(e, "http://www.w3.org/1999/xlink", "xlink:actuate", a);
				break;
			case "xlinkArcrole":
				Zl(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", a);
				break;
			case "xlinkRole":
				Zl(e, "http://www.w3.org/1999/xlink", "xlink:role", a);
				break;
			case "xlinkShow":
				Zl(e, "http://www.w3.org/1999/xlink", "xlink:show", a);
				break;
			case "xlinkTitle":
				Zl(e, "http://www.w3.org/1999/xlink", "xlink:title", a);
				break;
			case "xlinkType":
				Zl(e, "http://www.w3.org/1999/xlink", "xlink:type", a);
				break;
			case "xmlBase":
				Zl(e, "http://www.w3.org/XML/1998/namespace", "xml:base", a);
				break;
			case "xmlLang":
				Zl(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", a);
				break;
			case "xmlSpace":
				Zl(e, "http://www.w3.org/XML/1998/namespace", "xml:space", a);
				break;
			case "is":
				xa(e, "is", a);
				break;
			case "innerText":
			case "textContent":
				break;
			default:
				(!(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (t = Jo.get(t) || t, xa(e, t, a))
		}
	}

	function Nr(e, l, t, a, n, u) {
		switch (t) {
			case "style":
				Tu(e, a, u);
				break;
			case "dangerouslySetInnerHTML":
				if (a != null) {
					if (typeof a != "object" || !("__html" in a)) throw Error(r(61));
					if (t = a.__html, t != null) {
						if (n.children != null) throw Error(r(60));
						e.innerHTML = t
					}
				}
				break;
			case "children":
				typeof a == "string" ? Kt(e, a) : (typeof a == "number" || typeof a == "bigint") && Kt(e, "" + a);
				break;
			case "onScroll":
				a != null && me("scroll", e);
				break;
			case "onScrollEnd":
				a != null && me("scrollend", e);
				break;
			case "onClick":
				a != null && (e.onclick = po);
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref":
				break;
			case "innerText":
			case "textContent":
				break;
			default:
				if (!Ft.hasOwnProperty(t)) e: {
					if (t[0] === "o" && t[1] === "n" && (n = t.endsWith("Capture"), l = t.slice(2, n ? t.length - 7 : void 0), u = e[rl] || null, u = u != null ? u[t] : null, typeof u == "function" && e.removeEventListener(l, u, n), typeof a == "function")) {
						typeof u != "function" && u !== null && (t in e ? e[t] = null : e.hasAttribute(t) && e.removeAttribute(t)), e.addEventListener(l, a, n);
						break e
					}
					t in e ? e[t] = a : a === !0 ? e.setAttribute(t, "") : xa(e, t, a)
				}
		}
	}

	function hl(e, l, t) {
		switch (l) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li":
				break;
			case "img":
				me("error", e), me("load", e);
				var a = !1,
					n = !1,
					u;
				for (u in t)
					if (t.hasOwnProperty(u)) {
						var c = t[u];
						if (c != null) switch (u) {
							case "src":
								a = !0;
								break;
							case "srcSet":
								n = !0;
								break;
							case "children":
							case "dangerouslySetInnerHTML":
								throw Error(r(137, l));
							default:
								Me(e, l, u, c, t, null)
						}
					} n && Me(e, l, "srcSet", t.srcSet, t, null), a && Me(e, l, "src", t.src, t, null);
				return;
			case "input":
				me("invalid", e);
				var f = u = c = n = null,
					m = null,
					L = null;
				for (a in t)
					if (t.hasOwnProperty(a)) {
						var O = t[a];
						if (O != null) switch (a) {
							case "name":
								n = O;
								break;
							case "type":
								c = O;
								break;
							case "checked":
								m = O;
								break;
							case "defaultChecked":
								L = O;
								break;
							case "value":
								u = O;
								break;
							case "defaultValue":
								f = O;
								break;
							case "children":
							case "dangerouslySetInnerHTML":
								if (O != null) throw Error(r(137, l));
								break;
							default:
								Me(e, l, a, O, t, null)
						}
					} vu(e, u, f, m, L, c, n, !1), Za(e);
				return;
			case "select":
				me("invalid", e), a = c = u = null;
				for (n in t)
					if (t.hasOwnProperty(n) && (f = t[n], f != null)) switch (n) {
						case "value":
							u = f;
							break;
						case "defaultValue":
							c = f;
							break;
						case "multiple":
							a = f;
						default:
							Me(e, l, n, f, t, null)
					}
				l = u, t = c, e.multiple = !!a, l != null ? qt(e, !!a, l, !1) : t != null && qt(e, !!a, t, !0);
				return;
			case "textarea":
				me("invalid", e), u = n = a = null;
				for (c in t)
					if (t.hasOwnProperty(c) && (f = t[c], f != null)) switch (c) {
						case "value":
							a = f;
							break;
						case "defaultValue":
							n = f;
							break;
						case "children":
							u = f;
							break;
						case "dangerouslySetInnerHTML":
							if (f != null) throw Error(r(91));
							break;
						default:
							Me(e, l, c, f, t, null)
					}
				Su(e, a, n, u), Za(e);
				return;
			case "option":
				for (m in t)
					if (t.hasOwnProperty(m) && (a = t[m], a != null)) switch (m) {
						case "selected":
							e.selected = a && typeof a != "function" && typeof a != "symbol";
							break;
						default:
							Me(e, l, m, a, t, null)
					}
				return;
			case "dialog":
				me("beforetoggle", e), me("toggle", e), me("cancel", e), me("close", e);
				break;
			case "iframe":
			case "object":
				me("load", e);
				break;
			case "video":
			case "audio":
				for (a = 0; a < kn.length; a++) me(kn[a], e);
				break;
			case "image":
				me("error", e), me("load", e);
				break;
			case "details":
				me("toggle", e);
				break;
			case "embed":
			case "source":
			case "link":
				me("error", e), me("load", e);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (L in t)
					if (t.hasOwnProperty(L) && (a = t[L], a != null)) switch (L) {
						case "children":
						case "dangerouslySetInnerHTML":
							throw Error(r(137, l));
						default:
							Me(e, l, L, a, t, null)
					}
				return;
			default:
				if (Ii(l)) {
					for (O in t) t.hasOwnProperty(O) && (a = t[O], a !== void 0 && Nr(e, l, O, a, t, void 0));
					return
				}
		}
		for (f in t) t.hasOwnProperty(f) && (a = t[f], a != null && Me(e, l, f, a, t, null))
	}

	function x1(e, l, t, a) {
		switch (l) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li":
				break;
			case "input":
				var n = null,
					u = null,
					c = null,
					f = null,
					m = null,
					L = null,
					O = null;
				for (B in t) {
					var _ = t[B];
					if (t.hasOwnProperty(B) && _ != null) switch (B) {
						case "checked":
							break;
						case "value":
							break;
						case "defaultValue":
							m = _;
						default:
							a.hasOwnProperty(B) || Me(e, l, B, null, a, _)
					}
				}
				for (var D in a) {
					var B = a[D];
					if (_ = t[D], a.hasOwnProperty(D) && (B != null || _ != null)) switch (D) {
						case "type":
							u = B;
							break;
						case "name":
							n = B;
							break;
						case "checked":
							L = B;
							break;
						case "defaultChecked":
							O = B;
							break;
						case "value":
							c = B;
							break;
						case "defaultValue":
							f = B;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (B != null) throw Error(r(137, l));
							break;
						default:
							B !== _ && Me(e, l, D, B, a, _)
					}
				}
				Xi(e, c, f, m, L, O, u, n);
				return;
			case "select":
				B = c = f = D = null;
				for (u in t)
					if (m = t[u], t.hasOwnProperty(u) && m != null) switch (u) {
						case "value":
							break;
						case "multiple":
							B = m;
						default:
							a.hasOwnProperty(u) || Me(e, l, u, null, a, m)
					}
				for (n in a)
					if (u = a[n], m = t[n], a.hasOwnProperty(n) && (u != null || m != null)) switch (n) {
						case "value":
							D = u;
							break;
						case "defaultValue":
							f = u;
							break;
						case "multiple":
							c = u;
						default:
							u !== m && Me(e, l, n, u, a, m)
					}
				l = f, t = c, a = B, D != null ? qt(e, !!t, D, !1) : !!a != !!t && (l != null ? qt(e, !!t, l, !0) : qt(e, !!t, t ? [] : "", !1));
				return;
			case "textarea":
				B = D = null;
				for (f in t)
					if (n = t[f], t.hasOwnProperty(f) && n != null && !a.hasOwnProperty(f)) switch (f) {
						case "value":
							break;
						case "children":
							break;
						default:
							Me(e, l, f, null, a, n)
					}
				for (c in a)
					if (n = a[c], u = t[c], a.hasOwnProperty(c) && (n != null || u != null)) switch (c) {
						case "value":
							D = n;
							break;
						case "defaultValue":
							B = n;
							break;
						case "children":
							break;
						case "dangerouslySetInnerHTML":
							if (n != null) throw Error(r(91));
							break;
						default:
							n !== u && Me(e, l, c, n, a, u)
					}
				yu(e, D, B);
				return;
			case "option":
				for (var ae in t)
					if (D = t[ae], t.hasOwnProperty(ae) && D != null && !a.hasOwnProperty(ae)) switch (ae) {
						case "selected":
							e.selected = !1;
							break;
						default:
							Me(e, l, ae, null, a, D)
					}
				for (m in a)
					if (D = a[m], B = t[m], a.hasOwnProperty(m) && D !== B && (D != null || B != null)) switch (m) {
						case "selected":
							e.selected = D && typeof D != "function" && typeof D != "symbol";
							break;
						default:
							Me(e, l, m, D, a, B)
					}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var le in t) D = t[le], t.hasOwnProperty(le) && D != null && !a.hasOwnProperty(le) && Me(e, l, le, null, a, D);
				for (L in a)
					if (D = a[L], B = t[L], a.hasOwnProperty(L) && D !== B && (D != null || B != null)) switch (L) {
						case "children":
						case "dangerouslySetInnerHTML":
							if (D != null) throw Error(r(137, l));
							break;
						default:
							Me(e, l, L, D, a, B)
					}
				return;
			default:
				if (Ii(l)) {
					for (var Le in t) D = t[Le], t.hasOwnProperty(Le) && D !== void 0 && !a.hasOwnProperty(Le) && Nr(e, l, Le, void 0, a, D);
					for (O in a) D = a[O], B = t[O], !a.hasOwnProperty(O) || D === B || D === void 0 && B === void 0 || Nr(e, l, O, D, a, B);
					return
				}
		}
		for (var E in t) D = t[E], t.hasOwnProperty(E) && D != null && !a.hasOwnProperty(E) && Me(e, l, E, null, a, D);
		for (_ in a) D = a[_], B = t[_], !a.hasOwnProperty(_) || D === B || D == null && B == null || Me(e, l, _, D, a, B)
	}
	var Or = null,
		kr = null;

	function ho(e) {
		return e.nodeType === 9 ? e : e.ownerDocument
	}

	function g0(e) {
		switch (e) {
			case "http://www.w3.org/2000/svg":
				return 1;
			case "http://www.w3.org/1998/Math/MathML":
				return 2;
			default:
				return 0
		}
	}

	function b0(e, l) {
		if (e === 0) switch (l) {
			case "svg":
				return 1;
			case "math":
				return 2;
			default:
				return 0
		}
		return e === 1 && l === "foreignObject" ? 0 : e
	}

	function zr(e, l) {
		return e === "textarea" || e === "noscript" || typeof l.children == "string" || typeof l.children == "number" || typeof l.children == "bigint" || typeof l.dangerouslySetInnerHTML == "object" && l.dangerouslySetInnerHTML !== null && l.dangerouslySetInnerHTML.__html != null
	}
	var _r = null;

	function T1() {
		var e = window.event;
		return e && e.type === "popstate" ? e === _r ? !1 : (_r = e, !0) : (_r = null, !1)
	}
	var v0 = typeof setTimeout == "function" ? setTimeout : void 0,
		A1 = typeof clearTimeout == "function" ? clearTimeout : void 0,
		y0 = typeof Promise == "function" ? Promise : void 0,
		E1 = typeof queueMicrotask == "function" ? queueMicrotask : typeof y0 < "u" ? function(e) {
			return y0.resolve(null).then(e).catch(M1)
		} : v0;

	function M1(e) {
		setTimeout(function() {
			throw e
		})
	}

	function ra(e) {
		return e === "head"
	}

	function S0(e, l) {
		var t = l,
			a = 0,
			n = 0;
		do {
			var u = t.nextSibling;
			if (e.removeChild(t), u && u.nodeType === 8)
				if (t = u.data, t === "/$") {
					if (0 < a && 8 > a) {
						t = a;
						var c = e.ownerDocument;
						if (t & 1 && _n(c.documentElement), t & 2 && _n(c.body), t & 4)
							for (t = c.head, _n(t), c = t.firstChild; c;) {
								var f = c.nextSibling,
									m = c.nodeName;
								c[Gt] || m === "SCRIPT" || m === "STYLE" || m === "LINK" && c.rel.toLowerCase() === "stylesheet" || t.removeChild(c), c = f
							}
					}
					if (n === 0) {
						e.removeChild(u), Vn(l);
						return
					}
					n--
				} else t === "$" || t === "$?" || t === "$!" ? n++ : a = t.charCodeAt(0) - 48;
			else a = 0;
			t = u
		} while (t);
		Vn(l)
	}

	function Ur(e) {
		var l = e.firstChild;
		for (l && l.nodeType === 10 && (l = l.nextSibling); l;) {
			var t = l;
			switch (l = l.nextSibling, t.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					Ur(t), Ki(t);
					continue;
				case "SCRIPT":
				case "STYLE":
					continue;
				case "LINK":
					if (t.rel.toLowerCase() === "stylesheet") continue
			}
			e.removeChild(t)
		}
	}

	function L1(e, l, t, a) {
		for (; e.nodeType === 1;) {
			var n = t;
			if (e.nodeName.toLowerCase() !== l.toLowerCase()) {
				if (!a && (e.nodeName !== "INPUT" || e.type !== "hidden")) break
			} else if (a) {
				if (!e[Gt]) switch (l) {
					case "meta":
						if (!e.hasAttribute("itemprop")) break;
						return e;
					case "link":
						if (u = e.getAttribute("rel"), u === "stylesheet" && e.hasAttribute("data-precedence")) break;
						if (u !== n.rel || e.getAttribute("href") !== (n.href == null || n.href === "" ? null : n.href) || e.getAttribute("crossorigin") !== (n.crossOrigin == null ? null : n.crossOrigin) || e.getAttribute("title") !== (n.title == null ? null : n.title)) break;
						return e;
					case "style":
						if (e.hasAttribute("data-precedence")) break;
						return e;
					case "script":
						if (u = e.getAttribute("src"), (u !== (n.src == null ? null : n.src) || e.getAttribute("type") !== (n.type == null ? null : n.type) || e.getAttribute("crossorigin") !== (n.crossOrigin == null ? null : n.crossOrigin)) && u && e.hasAttribute("async") && !e.hasAttribute("itemprop")) break;
						return e;
					default:
						return e
				}
			} else if (l === "input" && e.type === "hidden") {
				var u = n.name == null ? null : "" + n.name;
				if (n.type === "hidden" && e.getAttribute("name") === u) return e
			} else return e;
			if (e = $l(e.nextSibling), e === null) break
		}
		return null
	}

	function D1(e, l, t) {
		if (l === "") return null;
		for (; e.nodeType !== 3;)
			if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = $l(e.nextSibling), e === null)) return null;
		return e
	}

	function Hr(e) {
		return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState === "complete"
	}

	function B1(e, l) {
		var t = e.ownerDocument;
		if (e.data !== "$?" || t.readyState === "complete") l();
		else {
			var a = function() {
				l(), t.removeEventListener("DOMContentLoaded", a)
			};
			t.addEventListener("DOMContentLoaded", a), e._reactRetry = a
		}
	}

	function $l(e) {
		for (; e != null; e = e.nextSibling) {
			var l = e.nodeType;
			if (l === 1 || l === 3) break;
			if (l === 8) {
				if (l = e.data, l === "$" || l === "$!" || l === "$?" || l === "F!" || l === "F") break;
				if (l === "/$") return null
			}
		}
		return e
	}
	var jr = null;

	function x0(e) {
		e = e.previousSibling;
		for (var l = 0; e;) {
			if (e.nodeType === 8) {
				var t = e.data;
				if (t === "$" || t === "$!" || t === "$?") {
					if (l === 0) return e;
					l--
				} else t === "/$" && l++
			}
			e = e.previousSibling
		}
		return null
	}

	function T0(e, l, t) {
		switch (l = ho(t), e) {
			case "html":
				if (e = l.documentElement, !e) throw Error(r(452));
				return e;
			case "head":
				if (e = l.head, !e) throw Error(r(453));
				return e;
			case "body":
				if (e = l.body, !e) throw Error(r(454));
				return e;
			default:
				throw Error(r(451))
		}
	}

	function _n(e) {
		for (var l = e.attributes; l.length;) e.removeAttributeNode(l[0]);
		Ki(e)
	}
	var Ql = new Map,
		A0 = new Set;

	function mo(e) {
		return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument
	}
	var Ct = F.d;
	F.d = {
		f: C1,
		r: N1,
		D: O1,
		C: k1,
		L: z1,
		m: _1,
		X: H1,
		S: U1,
		M: j1
	};

	function C1() {
		var e = Ct.f(),
			l = no();
		return e || l
	}

	function N1(e) {
		var l = Ve(e);
		l !== null && l.tag === 5 && l.type === "form" ? Yf(l) : Ct.r(e)
	}
	var Ci = typeof document > "u" ? null : document;

	function E0(e, l, t) {
		var a = Ci;
		if (a && typeof l == "string" && l) {
			var n = Ml(l);
			n = 'link[rel="' + e + '"][href="' + n + '"]', typeof t == "string" && (n += '[crossorigin="' + t + '"]'), A0.has(n) || (A0.add(n), e = {
				rel: e,
				crossOrigin: t,
				href: l
			}, a.querySelector(n) === null && (l = a.createElement("link"), hl(l, "link", e), Ue(l), a.head.appendChild(l)))
		}
	}

	function O1(e) {
		Ct.D(e), E0("dns-prefetch", e, null)
	}

	function k1(e, l) {
		Ct.C(e, l), E0("preconnect", e, l)
	}

	function z1(e, l, t) {
		Ct.L(e, l, t);
		var a = Ci;
		if (a && e && l) {
			var n = 'link[rel="preload"][as="' + Ml(l) + '"]';
			l === "image" && t && t.imageSrcSet ? (n += '[imagesrcset="' + Ml(t.imageSrcSet) + '"]', typeof t.imageSizes == "string" && (n += '[imagesizes="' + Ml(t.imageSizes) + '"]')) : n += '[href="' + Ml(e) + '"]';
			var u = n;
			switch (l) {
				case "style":
					u = Ni(e);
					break;
				case "script":
					u = Oi(e)
			}
			Ql.has(u) || (e = C({
				rel: "preload",
				href: l === "image" && t && t.imageSrcSet ? void 0 : e,
				as: l
			}, t), Ql.set(u, e), a.querySelector(n) !== null || l === "style" && a.querySelector(Un(u)) || l === "script" && a.querySelector(Hn(u)) || (l = a.createElement("link"), hl(l, "link", e), Ue(l), a.head.appendChild(l)))
		}
	}

	function _1(e, l) {
		Ct.m(e, l);
		var t = Ci;
		if (t && e) {
			var a = l && typeof l.as == "string" ? l.as : "script",
				n = 'link[rel="modulepreload"][as="' + Ml(a) + '"][href="' + Ml(e) + '"]',
				u = n;
			switch (a) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script":
					u = Oi(e)
			}
			if (!Ql.has(u) && (e = C({
					rel: "modulepreload",
					href: e
				}, l), Ql.set(u, e), t.querySelector(n) === null)) {
				switch (a) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script":
						if (t.querySelector(Hn(u))) return
				}
				a = t.createElement("link"), hl(a, "link", e), Ue(a), t.head.appendChild(a)
			}
		}
	}

	function U1(e, l, t) {
		Ct.S(e, l, t);
		var a = Ci;
		if (a && e) {
			var n = wt(a).hoistableStyles,
				u = Ni(e);
			l = l || "default";
			var c = n.get(u);
			if (!c) {
				var f = {
					loading: 0,
					preload: null
				};
				if (c = a.querySelector(Un(u))) f.loading = 5;
				else {
					e = C({
						rel: "stylesheet",
						href: e,
						"data-precedence": l
					}, t), (t = Ql.get(u)) && Gr(e, t);
					var m = c = a.createElement("link");
					Ue(m), hl(m, "link", e), m._p = new Promise(function(L, O) {
						m.onload = L, m.onerror = O
					}), m.addEventListener("load", function() {
						f.loading |= 1
					}), m.addEventListener("error", function() {
						f.loading |= 2
					}), f.loading |= 4, go(c, l, a)
				}
				c = {
					type: "stylesheet",
					instance: c,
					count: 1,
					state: f
				}, n.set(u, c)
			}
		}
	}

	function H1(e, l) {
		Ct.X(e, l);
		var t = Ci;
		if (t && e) {
			var a = wt(t).hoistableScripts,
				n = Oi(e),
				u = a.get(n);
			u || (u = t.querySelector(Hn(n)), u || (e = C({
				src: e,
				async: !0
			}, l), (l = Ql.get(n)) && Rr(e, l), u = t.createElement("script"), Ue(u), hl(u, "link", e), t.head.appendChild(u)), u = {
				type: "script",
				instance: u,
				count: 1,
				state: null
			}, a.set(n, u))
		}
	}

	function j1(e, l) {
		Ct.M(e, l);
		var t = Ci;
		if (t && e) {
			var a = wt(t).hoistableScripts,
				n = Oi(e),
				u = a.get(n);
			u || (u = t.querySelector(Hn(n)), u || (e = C({
				src: e,
				async: !0,
				type: "module"
			}, l), (l = Ql.get(n)) && Rr(e, l), u = t.createElement("script"), Ue(u), hl(u, "link", e), t.head.appendChild(u)), u = {
				type: "script",
				instance: u,
				count: 1,
				state: null
			}, a.set(n, u))
		}
	}

	function M0(e, l, t, a) {
		var n = (n = ne.current) ? mo(n) : null;
		if (!n) throw Error(r(446));
		switch (e) {
			case "meta":
			case "title":
				return null;
			case "style":
				return typeof t.precedence == "string" && typeof t.href == "string" ? (l = Ni(t.href), t = wt(n).hoistableStyles, a = t.get(l), a || (a = {
					type: "style",
					instance: null,
					count: 0,
					state: null
				}, t.set(l, a)), a) : {
					type: "void",
					instance: null,
					count: 0,
					state: null
				};
			case "link":
				if (t.rel === "stylesheet" && typeof t.href == "string" && typeof t.precedence == "string") {
					e = Ni(t.href);
					var u = wt(n).hoistableStyles,
						c = u.get(e);
					if (c || (n = n.ownerDocument || n, c = {
							type: "stylesheet",
							instance: null,
							count: 0,
							state: {
								loading: 0,
								preload: null
							}
						}, u.set(e, c), (u = n.querySelector(Un(e))) && !u._p && (c.instance = u, c.state.loading = 5), Ql.has(e) || (t = {
							rel: "preload",
							as: "style",
							href: t.href,
							crossOrigin: t.crossOrigin,
							integrity: t.integrity,
							media: t.media,
							hrefLang: t.hrefLang,
							referrerPolicy: t.referrerPolicy
						}, Ql.set(e, t), u || G1(n, e, t, c.state))), l && a === null) throw Error(r(528, ""));
					return c
				}
				if (l && a !== null) throw Error(r(529, ""));
				return null;
			case "script":
				return l = t.async, t = t.src, typeof t == "string" && l && typeof l != "function" && typeof l != "symbol" ? (l = Oi(t), t = wt(n).hoistableScripts, a = t.get(l), a || (a = {
					type: "script",
					instance: null,
					count: 0,
					state: null
				}, t.set(l, a)), a) : {
					type: "void",
					instance: null,
					count: 0,
					state: null
				};
			default:
				throw Error(r(444, e))
		}
	}

	function Ni(e) {
		return 'href="' + Ml(e) + '"'
	}

	function Un(e) {
		return 'link[rel="stylesheet"][' + e + "]"
	}

	function L0(e) {
		return C({}, e, {
			"data-precedence": e.precedence,
			precedence: null
		})
	}

	function G1(e, l, t, a) {
		e.querySelector('link[rel="preload"][as="style"][' + l + "]") ? a.loading = 1 : (l = e.createElement("link"), a.preload = l, l.addEventListener("load", function() {
			return a.loading |= 1
		}), l.addEventListener("error", function() {
			return a.loading |= 2
		}), hl(l, "link", t), Ue(l), e.head.appendChild(l))
	}

	function Oi(e) {
		return '[src="' + Ml(e) + '"]'
	}

	function Hn(e) {
		return "script[async]" + e
	}

	function D0(e, l, t) {
		if (l.count++, l.instance === null) switch (l.type) {
			case "style":
				var a = e.querySelector('style[data-href~="' + Ml(t.href) + '"]');
				if (a) return l.instance = a, Ue(a), a;
				var n = C({}, t, {
					"data-href": t.href,
					"data-precedence": t.precedence,
					href: null,
					precedence: null
				});
				return a = (e.ownerDocument || e).createElement("style"), Ue(a), hl(a, "style", n), go(a, t.precedence, e), l.instance = a;
			case "stylesheet":
				n = Ni(t.href);
				var u = e.querySelector(Un(n));
				if (u) return l.state.loading |= 4, l.instance = u, Ue(u), u;
				a = L0(t), (n = Ql.get(n)) && Gr(a, n), u = (e.ownerDocument || e).createElement("link"), Ue(u);
				var c = u;
				return c._p = new Promise(function(f, m) {
					c.onload = f, c.onerror = m
				}), hl(u, "link", a), l.state.loading |= 4, go(u, t.precedence, e), l.instance = u;
			case "script":
				return u = Oi(t.src), (n = e.querySelector(Hn(u))) ? (l.instance = n, Ue(n), n) : (a = t, (n = Ql.get(u)) && (a = C({}, t), Rr(a, n)), e = e.ownerDocument || e, n = e.createElement("script"), Ue(n), hl(n, "link", a), e.head.appendChild(n), l.instance = n);
			case "void":
				return null;
			default:
				throw Error(r(443, l.type))
		} else l.type === "stylesheet" && (l.state.loading & 4) === 0 && (a = l.instance, l.state.loading |= 4, go(a, t.precedence, e));
		return l.instance
	}

	function go(e, l, t) {
		for (var a = t.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'), n = a.length ? a[a.length - 1] : null, u = n, c = 0; c < a.length; c++) {
			var f = a[c];
			if (f.dataset.precedence === l) u = f;
			else if (u !== n) break
		}
		u ? u.parentNode.insertBefore(e, u.nextSibling) : (l = t.nodeType === 9 ? t.head : t, l.insertBefore(e, l.firstChild))
	}

	function Gr(e, l) {
		e.crossOrigin == null && (e.crossOrigin = l.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = l.referrerPolicy), e.title == null && (e.title = l.title)
	}

	function Rr(e, l) {
		e.crossOrigin == null && (e.crossOrigin = l.crossOrigin), e.referrerPolicy == null && (e.referrerPolicy = l.referrerPolicy), e.integrity == null && (e.integrity = l.integrity)
	}
	var bo = null;

	function B0(e, l, t) {
		if (bo === null) {
			var a = new Map,
				n = bo = new Map;
			n.set(t, a)
		} else n = bo, a = n.get(t), a || (a = new Map, n.set(t, a));
		if (a.has(e)) return a;
		for (a.set(e, null), t = t.getElementsByTagName(e), n = 0; n < t.length; n++) {
			var u = t[n];
			if (!(u[Gt] || u[Fe] || e === "link" && u.getAttribute("rel") === "stylesheet") && u.namespaceURI !== "http://www.w3.org/2000/svg") {
				var c = u.getAttribute(l) || "";
				c = e + c;
				var f = a.get(c);
				f ? f.push(u) : a.set(c, [u])
			}
		}
		return a
	}

	function C0(e, l, t) {
		e = e.ownerDocument || e, e.head.insertBefore(t, l === "title" ? e.querySelector("head > title") : null)
	}

	function R1(e, l, t) {
		if (t === 1 || l.itemProp != null) return !1;
		switch (e) {
			case "meta":
			case "title":
				return !0;
			case "style":
				if (typeof l.precedence != "string" || typeof l.href != "string" || l.href === "") break;
				return !0;
			case "link":
				if (typeof l.rel != "string" || typeof l.href != "string" || l.href === "" || l.onLoad || l.onError) break;
				switch (l.rel) {
					case "stylesheet":
						return e = l.disabled, typeof l.precedence == "string" && e == null;
					default:
						return !0
				}
			case "script":
				if (l.async && typeof l.async != "function" && typeof l.async != "symbol" && !l.onLoad && !l.onError && l.src && typeof l.src == "string") return !0
		}
		return !1
	}

	function N0(e) {
		return !(e.type === "stylesheet" && (e.state.loading & 3) === 0)
	}
	var jn = null;

	function w1() {}

	function F1(e, l, t) {
		if (jn === null) throw Error(r(475));
		var a = jn;
		if (l.type === "stylesheet" && (typeof t.media != "string" || matchMedia(t.media).matches !== !1) && (l.state.loading & 4) === 0) {
			if (l.instance === null) {
				var n = Ni(t.href),
					u = e.querySelector(Un(n));
				if (u) {
					e = u._p, e !== null && typeof e == "object" && typeof e.then == "function" && (a.count++, a = vo.bind(a), e.then(a, a)), l.state.loading |= 4, l.instance = u, Ue(u);
					return
				}
				u = e.ownerDocument || e, t = L0(t), (n = Ql.get(n)) && Gr(t, n), u = u.createElement("link"), Ue(u);
				var c = u;
				c._p = new Promise(function(f, m) {
					c.onload = f, c.onerror = m
				}), hl(u, "link", t), l.instance = u
			}
			a.stylesheets === null && (a.stylesheets = new Map), a.stylesheets.set(l, e), (e = l.state.preload) && (l.state.loading & 3) === 0 && (a.count++, l = vo.bind(a), e.addEventListener("load", l), e.addEventListener("error", l))
		}
	}

	function V1() {
		if (jn === null) throw Error(r(475));
		var e = jn;
		return e.stylesheets && e.count === 0 && wr(e, e.stylesheets), 0 < e.count ? function(l) {
			var t = setTimeout(function() {
				if (e.stylesheets && wr(e, e.stylesheets), e.unsuspend) {
					var a = e.unsuspend;
					e.unsuspend = null, a()
				}
			}, 6e4);
			return e.unsuspend = l,
				function() {
					e.unsuspend = null, clearTimeout(t)
				}
		} : null
	}

	function vo() {
		if (this.count--, this.count === 0) {
			if (this.stylesheets) wr(this, this.stylesheets);
			else if (this.unsuspend) {
				var e = this.unsuspend;
				this.unsuspend = null, e()
			}
		}
	}
	var yo = null;

	function wr(e, l) {
		e.stylesheets = null, e.unsuspend !== null && (e.count++, yo = new Map, l.forEach(Y1, e), yo = null, vo.call(e))
	}

	function Y1(e, l) {
		if (!(l.state.loading & 4)) {
			var t = yo.get(e);
			if (t) var a = t.get(null);
			else {
				t = new Map, yo.set(e, t);
				for (var n = e.querySelectorAll("link[data-precedence],style[data-precedence]"), u = 0; u < n.length; u++) {
					var c = n[u];
					(c.nodeName === "LINK" || c.getAttribute("media") !== "not all") && (t.set(c.dataset.precedence, c), a = c)
				}
				a && t.set(null, a)
			}
			n = l.instance, c = n.getAttribute("data-precedence"), u = t.get(c) || a, u === a && t.set(null, n), t.set(c, n), this.count++, a = vo.bind(this), n.addEventListener("load", a), n.addEventListener("error", a), u ? u.parentNode.insertBefore(n, u.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(n, e.firstChild)), l.state.loading |= 4
		}
	}
	var Gn = {
		$$typeof: _e,
		Provider: null,
		Consumer: null,
		_currentValue: X,
		_currentValue2: X,
		_threadCount: 0
	};

	function q1(e, l, t, a, n, u, c, f) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Yi(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Yi(0), this.hiddenUpdates = Yi(null), this.identifierPrefix = a, this.onUncaughtError = n, this.onCaughtError = u, this.onRecoverableError = c, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = f, this.incompleteTransitions = new Map
	}

	function O0(e, l, t, a, n, u, c, f, m, L, O, _) {
		return e = new q1(e, l, t, c, f, m, L, _), l = 1, u === !0 && (l |= 24), u = zl(3, null, null, l), e.current = u, u.stateNode = e, l = xc(), l.refCount++, e.pooledCache = l, l.refCount++, u.memoizedState = {
			element: a,
			isDehydrated: t,
			cache: l
		}, Mc(u), e
	}

	function k0(e) {
		return e ? (e = ci, e) : ci
	}

	function z0(e, l, t, a, n, u) {
		n = k0(n), a.context === null ? a.context = n : a.pendingContext = n, a = It(l), a.payload = {
			element: t
		}, u = u === void 0 ? null : u, u !== null && (a.callback = u), t = Jt(e, a, l), t !== null && (Gl(t, e, l), hn(t, e, l))
	}

	function _0(e, l) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var t = e.retryLane;
			e.retryLane = t !== 0 && t < l ? t : l
		}
	}

	function Fr(e, l) {
		_0(e, l), (e = e.alternate) && _0(e, l)
	}

	function U0(e) {
		if (e.tag === 13) {
			var l = oi(e, 67108864);
			l !== null && Gl(l, e, 67108864), Fr(e, 67108864)
		}
	}
	var So = !0;

	function K1(e, l, t, a) {
		var n = N.T;
		N.T = null;
		var u = F.p;
		try {
			F.p = 2, Vr(e, l, t, a)
		} finally {
			F.p = u, N.T = n
		}
	}

	function Q1(e, l, t, a) {
		var n = N.T;
		N.T = null;
		var u = F.p;
		try {
			F.p = 8, Vr(e, l, t, a)
		} finally {
			F.p = u, N.T = n
		}
	}

	function Vr(e, l, t, a) {
		if (So) {
			var n = Yr(a);
			if (n === null) Cr(e, l, a, xo, t), j0(e, a);
			else if (X1(n, e, l, t, a)) a.stopPropagation();
			else if (j0(e, a), l & 4 && -1 < P1.indexOf(e)) {
				for (; n !== null;) {
					var u = Ve(n);
					if (u !== null) switch (u.tag) {
						case 3:
							if (u = u.stateNode, u.current.memoizedState.isDehydrated) {
								var c = Pl(u.pendingLanes);
								if (c !== 0) {
									var f = u;
									for (f.pendingLanes |= 2, f.entangledLanes |= 2; c;) {
										var m = 1 << 31 - cl(c);
										f.entanglements[1] |= m, c &= ~m
									}
									rt(u), (Te & 6) === 0 && (ao = Al() + 500, On(0))
								}
							}
							break;
						case 13:
							f = oi(u, 2), f !== null && Gl(f, u, 2), no(), Fr(u, 2)
					}
					if (u = Yr(a), u === null && Cr(e, l, a, xo, t), u === n) break;
					n = u
				}
				n !== null && a.stopPropagation()
			} else Cr(e, l, a, null, t)
		}
	}

	function Yr(e) {
		return e = tt(e), qr(e)
	}
	var xo = null;

	function qr(e) {
		if (xo = null, e = Ol(e), e !== null) {
			var l = g(e);
			if (l === null) e = null;
			else {
				var t = l.tag;
				if (t === 13) {
					if (e = h(l), e !== null) return e;
					e = null
				} else if (t === 3) {
					if (l.stateNode.current.memoizedState.isDehydrated) return l.tag === 3 ? l.stateNode.containerInfo : null;
					e = null
				} else l !== e && (e = null)
			}
		}
		return xo = e, null
	}

	function H0(e) {
		switch (e) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "resize":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart":
				return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave":
				return 8;
			case "message":
				switch (wo()) {
					case qa:
						return 2;
					case au:
						return 8;
					case zt:
					case Fo:
						return 32;
					case Ka:
						return 268435456;
					default:
						return 32
				}
			default:
				return 32
		}
	}
	var Kr = !1,
		sa = null,
		fa = null,
		da = null,
		Rn = new Map,
		wn = new Map,
		pa = [],
		P1 = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");

	function j0(e, l) {
		switch (e) {
			case "focusin":
			case "focusout":
				sa = null;
				break;
			case "dragenter":
			case "dragleave":
				fa = null;
				break;
			case "mouseover":
			case "mouseout":
				da = null;
				break;
			case "pointerover":
			case "pointerout":
				Rn.delete(l.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture":
				wn.delete(l.pointerId)
		}
	}

	function Fn(e, l, t, a, n, u) {
		return e === null || e.nativeEvent !== u ? (e = {
			blockedOn: l,
			domEventName: t,
			eventSystemFlags: a,
			nativeEvent: u,
			targetContainers: [n]
		}, l !== null && (l = Ve(l), l !== null && U0(l)), e) : (e.eventSystemFlags |= a, l = e.targetContainers, n !== null && l.indexOf(n) === -1 && l.push(n), e)
	}

	function X1(e, l, t, a, n) {
		switch (l) {
			case "focusin":
				return sa = Fn(sa, e, l, t, a, n), !0;
			case "dragenter":
				return fa = Fn(fa, e, l, t, a, n), !0;
			case "mouseover":
				return da = Fn(da, e, l, t, a, n), !0;
			case "pointerover":
				var u = n.pointerId;
				return Rn.set(u, Fn(Rn.get(u) || null, e, l, t, a, n)), !0;
			case "gotpointercapture":
				return u = n.pointerId, wn.set(u, Fn(wn.get(u) || null, e, l, t, a, n)), !0
		}
		return !1
	}

	function G0(e) {
		var l = Ol(e.target);
		if (l !== null) {
			var t = g(l);
			if (t !== null) {
				if (l = t.tag, l === 13) {
					if (l = h(t), l !== null) {
						e.blockedOn = l, Sa(e.priority, function() {
							if (t.tag === 13) {
								var a = jl();
								a = ya(a);
								var n = oi(t, a);
								n !== null && Gl(n, t, a), Fr(t, a)
							}
						});
						return
					}
				} else if (l === 3 && t.stateNode.current.memoizedState.isDehydrated) {
					e.blockedOn = t.tag === 3 ? t.stateNode.containerInfo : null;
					return
				}
			}
		}
		e.blockedOn = null
	}

	function To(e) {
		if (e.blockedOn !== null) return !1;
		for (var l = e.targetContainers; 0 < l.length;) {
			var t = Yr(e.nativeEvent);
			if (t === null) {
				t = e.nativeEvent;
				var a = new t.constructor(t.type, t);
				lt = a, t.target.dispatchEvent(a), lt = null
			} else return l = Ve(t), l !== null && U0(l), e.blockedOn = t, !1;
			l.shift()
		}
		return !0
	}

	function R0(e, l, t) {
		To(e) && t.delete(l)
	}

	function Z1() {
		Kr = !1, sa !== null && To(sa) && (sa = null), fa !== null && To(fa) && (fa = null), da !== null && To(da) && (da = null), Rn.forEach(R0), wn.forEach(R0)
	}

	function Ao(e, l) {
		e.blockedOn === l && (e.blockedOn = null, Kr || (Kr = !0, i.unstable_scheduleCallback(i.unstable_NormalPriority, Z1)))
	}
	var Eo = null;

	function w0(e) {
		Eo !== e && (Eo = e, i.unstable_scheduleCallback(i.unstable_NormalPriority, function() {
			Eo === e && (Eo = null);
			for (var l = 0; l < e.length; l += 3) {
				var t = e[l],
					a = e[l + 1],
					n = e[l + 2];
				if (typeof a != "function") {
					if (qr(a || t) === null) continue;
					break
				}
				var u = Ve(t);
				u !== null && (e.splice(l, 3), l -= 3, qc(u, {
					pending: !0,
					data: n,
					method: t.method,
					action: a
				}, a, n))
			}
		}))
	}

	function Vn(e) {
		function l(m) {
			return Ao(m, e)
		}
		sa !== null && Ao(sa, e), fa !== null && Ao(fa, e), da !== null && Ao(da, e), Rn.forEach(l), wn.forEach(l);
		for (var t = 0; t < pa.length; t++) {
			var a = pa[t];
			a.blockedOn === e && (a.blockedOn = null)
		}
		for (; 0 < pa.length && (t = pa[0], t.blockedOn === null);) G0(t), t.blockedOn === null && pa.shift();
		if (t = (e.ownerDocument || e).$$reactFormReplay, t != null)
			for (a = 0; a < t.length; a += 3) {
				var n = t[a],
					u = t[a + 1],
					c = n[rl] || null;
				if (typeof u == "function") c || w0(t);
				else if (c) {
					var f = null;
					if (u && u.hasAttribute("formAction")) {
						if (n = u, c = u[rl] || null) f = c.formAction;
						else if (qr(n) !== null) continue
					} else f = c.action;
					typeof f == "function" ? t[a + 1] = f : (t.splice(a, 3), a -= 3), w0(t)
				}
			}
	}

	function Qr(e) {
		this._internalRoot = e
	}
	Mo.prototype.render = Qr.prototype.render = function(e) {
		var l = this._internalRoot;
		if (l === null) throw Error(r(409));
		var t = l.current,
			a = jl();
		z0(t, a, e, l, null, null)
	}, Mo.prototype.unmount = Qr.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var l = e.containerInfo;
			z0(e.current, 2, null, e, null, null), no(), l[et] = null
		}
	};

	function Mo(e) {
		this._internalRoot = e
	}
	Mo.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var l = su();
			e = {
				blockedOn: null,
				target: e,
				priority: l
			};
			for (var t = 0; t < pa.length && l !== 0 && l < pa[t].priority; t++);
			pa.splice(t, 0, e), t === 0 && G0(e)
		}
	};
	var F0 = o.version;
	if (F0 !== "19.1.0") throw Error(r(527, F0, "19.1.0"));
	F.findDOMNode = function(e) {
		var l = e._reactInternals;
		if (l === void 0) throw typeof e.render == "function" ? Error(r(188)) : (e = Object.keys(e).join(","), Error(r(268, e)));
		return e = A(l), e = e !== null ? v(e) : null, e = e === null ? null : e.stateNode, e
	};
	var I1 = {
		bundleType: 0,
		version: "19.1.0",
		rendererPackageName: "react-dom",
		currentDispatcherRef: N,
		reconcilerVersion: "19.1.0"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Lo = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Lo.isDisabled && Lo.supportsFiber) try {
			_t = Lo.inject(I1), gl = Lo
		} catch {}
	}
	return qn.createRoot = function(e, l) {
		if (!d(e)) throw Error(r(299));
		var t = !1,
			a = "",
			n = ad,
			u = id,
			c = nd,
			f = null;
		return l != null && (l.unstable_strictMode === !0 && (t = !0), l.identifierPrefix !== void 0 && (a = l.identifierPrefix), l.onUncaughtError !== void 0 && (n = l.onUncaughtError), l.onCaughtError !== void 0 && (u = l.onCaughtError), l.onRecoverableError !== void 0 && (c = l.onRecoverableError), l.unstable_transitionCallbacks !== void 0 && (f = l.unstable_transitionCallbacks)), l = O0(e, 1, !1, null, null, t, a, n, u, c, f, null), e[et] = l.current, Br(e), new Qr(l)
	}, qn.hydrateRoot = function(e, l, t) {
		if (!d(e)) throw Error(r(299));
		var a = !1,
			n = "",
			u = ad,
			c = id,
			f = nd,
			m = null,
			L = null;
		return t != null && (t.unstable_strictMode === !0 && (a = !0), t.identifierPrefix !== void 0 && (n = t.identifierPrefix), t.onUncaughtError !== void 0 && (u = t.onUncaughtError), t.onCaughtError !== void 0 && (c = t.onCaughtError), t.onRecoverableError !== void 0 && (f = t.onRecoverableError), t.unstable_transitionCallbacks !== void 0 && (m = t.unstable_transitionCallbacks), t.formState !== void 0 && (L = t.formState)), l = O0(e, 1, !0, l, t ?? null, a, n, u, c, f, m, L), l.context = k0(null), t = l.current, a = jl(), a = ya(a), n = It(a), n.callback = null, Jt(t, n, a), t = a, l.current.lanes = t, jt(l, t), rt(l), e[et] = l.current, Br(e), new Mo(l)
	}, qn.version = "19.1.0", qn
}
var J0;

function um() {
	if (J0) return Zr.exports;
	J0 = 1;

	function i() {
		if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(i)
		} catch (o) {
			console.error(o)
		}
	}
	return i(), Zr.exports = nm(), Zr.exports
}
var om = um();
const cm = ms(om);
var rm = Sp();
const sm = ms(rm),
	fm = .1,
	$0 = 10;

function dm({
	gamepadState: i,
	gamepadIndex: o
}) {
	if (!i) return p.jsxs("div", {
		children: ["Loading Gamepad ", o, "..."]
	});
	const s = i.buttons || {},
		r = i.axes || {},
		d = v => (s[v] || 0) > fm ? v >= 12 && v <= 15 ? "gp-vis-dpad-pressed" : v === 4 || v === 5 ? "gp-vis-bumper-pressed" : "gp-vis-button-pressed" : "",
		g = v => v !== 6 && v !== 7 ? {} : {
			opacity: .5 + (s[v] || 0) * .5
		},
		h = (v, C) => {
			const y = r[v] || 0,
				j = r[C] || 0,
				R = y * $0,
				J = j * $0;
			return `translate(${R}px, ${J}px)`
		},
		T = h(0, 1),
		A = h(2, 3);
	return p.jsxs("div", {
		className: "gamepad-visualizer-instance",
		children: [p.jsxs("h4", {
			children: ["Gamepad ", o]
		}), p.jsxs("svg", {
			viewBox: "0 0 260 100",
			width: "100%",
			height: "100",
			className: "gamepad-svg-vis",
			children: [p.jsx("rect", {
				className: "gp-vis-base",
				x: "30",
				y: "10",
				width: "200",
				height: "80",
				rx: "10",
				ry: "10"
			}), p.jsx("rect", {
				id: `gp-${o}-btn-4`,
				className: `gp-vis-bumper ${d(4)}`,
				x: "40",
				y: "0",
				width: "40",
				height: "8",
				rx: "2"
			}), p.jsx("rect", {
				id: `gp-${o}-btn-5`,
				className: `gp-vis-bumper ${d(5)}`,
				x: "180",
				y: "0",
				width: "40",
				height: "8",
				rx: "2"
			}), p.jsx("rect", {
				id: `gp-${o}-btn-6`,
				className: "gp-vis-trigger",
				style: g(6),
				x: "40",
				y: "10",
				width: "40",
				height: "10",
				rx: "2"
			}), p.jsx("rect", {
				id: `gp-${o}-btn-7`,
				className: "gp-vis-trigger",
				style: g(7),
				x: "180",
				y: "10",
				width: "40",
				height: "10",
				rx: "2"
			}), p.jsx("circle", {
				id: `gp-${o}-btn-0`,
				className: `gp-vis-button ${d(0)}`,
				cx: "185",
				cy: "55",
				r: "6"
			}), " ", p.jsx("circle", {
				id: `gp-${o}-btn-1`,
				className: `gp-vis-button ${d(1)}`,
				cx: "205",
				cy: "40",
				r: "6"
			}), " ", p.jsx("circle", {
				id: `gp-${o}-btn-2`,
				className: `gp-vis-button ${d(2)}`,
				cx: "165",
				cy: "40",
				r: "6"
			}), " ", p.jsx("circle", {
				id: `gp-${o}-btn-3`,
				className: `gp-vis-button ${d(3)}`,
				cx: "185",
				cy: "25",
				r: "6"
			}), " ", p.jsx("rect", {
				id: `gp-${o}-btn-8`,
				className: `gp-vis-button ${d(8)}`,
				x: "105",
				y: "25",
				width: "10",
				height: "5"
			}), " ", p.jsx("rect", {
				id: `gp-${o}-btn-9`,
				className: `gp-vis-button ${d(9)}`,
				x: "145",
				y: "25",
				width: "10",
				height: "5"
			}), " ", p.jsx("rect", {
				id: `gp-${o}-btn-12`,
				className: `gp-vis-dpad ${d(12)}`,
				x: "70",
				y: "50",
				width: "10",
				height: "10"
			}), " ", p.jsx("rect", {
				id: `gp-${o}-btn-13`,
				className: `gp-vis-dpad ${d(13)}`,
				x: "70",
				y: "70",
				width: "10",
				height: "10"
			}), " ", p.jsx("rect", {
				id: `gp-${o}-btn-14`,
				className: `gp-vis-dpad ${d(14)}`,
				x: "60",
				y: "60",
				width: "10",
				height: "10"
			}), " ", p.jsx("rect", {
				id: `gp-${o}-btn-15`,
				className: `gp-vis-dpad ${d(15)}`,
				x: "80",
				y: "60",
				width: "10",
				height: "10"
			}), " ", p.jsxs("g", {
				children: [" ", p.jsx("circle", {
					className: "gp-vis-stick-base",
					cx: "75",
					cy: "30",
					r: "12"
				}), p.jsx("circle", {
					id: `gp-${o}-stick-left`,
					className: "gp-vis-stick-top",
					cx: "75",
					cy: "30",
					r: "8",
					style: {
						transform: T
					}
				}), p.jsx("circle", {
					id: `gp-${o}-btn-10`,
					className: `gp-vis-button ${d(10)}`,
					cx: "75",
					cy: "30",
					r: "3"
				}), " "]
			}), p.jsxs("g", {
				children: [" ", p.jsx("circle", {
					className: "gp-vis-stick-base",
					cx: "155",
					cy: "65",
					r: "12"
				}), p.jsx("circle", {
					id: `gp-${o}-stick-right`,
					className: "gp-vis-stick-top",
					cx: "155",
					cy: "65",
					r: "8",
					style: {
						transform: A
					}
				}), p.jsx("circle", {
					id: `gp-${o}-btn-11`,
					className: `gp-vis-button ${d(11)}`,
					cx: "155",
					cy: "65",
					r: "3"
				}), " "]
			})]
		})]
	})
}
const pm = (i, o) => o ? i.replace(/\{(\w+)\}/g, (s, r) => o.hasOwnProperty(r) ? o[r] : s) : i,
	hm = {
		selkiesLogoAlt: "Selkies Logo",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "Toggle Theme",
		fullscreenTitle: "Enter Fullscreen",
		gamingModeTitle: "Gaming Mode",
		buttons: {
			videoStreamEnableTitle: "Enable Video Stream",
			videoStreamDisableTitle: "Disable Video Stream",
			audioStreamEnableTitle: "Enable Audio Stream",
			audioStreamDisableTitle: "Disable Audio Stream",
			microphoneEnableTitle: "Enable Microphone",
			microphoneDisableTitle: "Disable Microphone",
			gamepadEnableTitle: "Enable Gamepad Input",
			gamepadDisableTitle: "Disable Gamepad Input",
			virtualKeyboardButtonTitle: "Pop Keyboard",
			h264FullColorEnableTitle: "Enable H.264 Full Color",
			h264FullColorDisableTitle: "Disable H.264 Full Color"
		},
		sections: {
			video: {
				title: "Video Settings",
				encoderLabel: "Encoder:",
				framerateLabel: "Frames per second ({framerate} FPS):",
				bitrateLabel: "Video Bitrate ({bitrate} Mbps):",
				bufferLabelImmediate: "Video Buffer Size (0 (Immediate)):",
				bufferLabelFrames: "Video Buffer Size ({videoBufferSize} frames):",
				crfLabel: "Video CRF ({crf}):",
				fullColorLabel: "FullColor 4:4:4:"
			},
			audio: {
				title: "Audio Settings",
				bitrateLabel: "Audio Bitrate ({bitrate} kbps):",
				inputLabel: "Input (Microphone):",
				outputLabel: "Output (Speaker):",
				outputNotSupported: "Output device selection not supported by this browser.",
				deviceErrorDefault: "Error listing audio devices: {errorName}",
				deviceErrorPermission: "Permission denied. Please allow microphone access in browser settings to select devices.",
				deviceErrorNotFound: "No audio devices found.",
				defaultInputLabelFallback: "Input Device {index}",
				defaultOutputLabelFallback: "Output Device {index}"
			},
			screen: {
				title: "Screen Settings",
				presetLabel: "Preset:",
				resolutionPresetSelect: "-- Select Preset --",
				widthLabel: "Width:",
				heightLabel: "Height:",
				widthPlaceholder: "e.g., 1920",
				heightPlaceholder: "e.g., 1080",
				setManualButton: "Set Manual Resolution",
				resetButton: "Reset to Window",
				scaleLocallyLabel: "Scale Locally:",
				scaleLocallyOn: "ON",
				scaleLocallyOff: "OFF",
				scaleLocallyTitleEnable: "Enable Local Scaling (Maintain Aspect Ratio)",
				scaleLocallyTitleDisable: "Disable Local Scaling (Use Exact Resolution)",
				uiScalingLabel: "UI Scaling",
				hidpiLabel: "HiDPI (Pixel Perfect)",
				hidpiEnableTitle: "Enable HiDPI (Pixel Perfect)",
				hidpiDisableTitle: "Disable HiDPI (Use CSS Scaling)"
			},
			stats: {
				title: "Stats",
				cpuLabel: "CPU",
				gpuLabel: "GPU Usage",
				sysMemLabel: "Sys Mem",
				gpuMemLabel: "GPU Mem",
				fpsLabel: "FPS",
				audioLabel: "Audio",
				tooltipCpu: "CPU Usage: {value}%",
				tooltipGpu: "GPU Usage: {value}%",
				tooltipSysMem: "System Memory: {used} / {total}",
				tooltipGpuMem: "GPU Memory: {used} / {total}",
				tooltipFps: "Client FPS: {value}",
				tooltipAudio: "Audio Buffers: {value}",
				tooltipMemoryNA: "N/A"
			},
			clipboard: {
				title: "Clipboard",
				label: "Server Clipboard:",
				placeholder: "Clipboard content from server..."
			},
			files: {
				title: "Files",
				uploadButton: "Upload Files",
				uploadButtonTitle: "Upload files to the remote session",
				downloadButtonTitle: "Download Files"
			},
			gamepads: {
				title: "Gamepads",
				noActivity: "No physical gamepad activity detected yet...",
				touchEnableTitle: "Enable Touch Gamepad",
				touchDisableTitle: "Disable Touch Gamepad",
				touchActiveLabel: "Touch Gamepad: ON",
				touchInactiveLabel: "Touch Gamepad: OFF",
				physicalHiddenForTouch: "Physical gamepad display is hidden while touch gamepad is active.",
				noActivityMobileOrEnableTouch: "No physical gamepads. Enable touch gamepad or connect a controller."
			},
			apps: {
				title: "Apps",
				openButtonTitle: "Manage Apps",
				openButton: "Manage Apps"
			},
			sharing: {
				title: "Sharing"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (Laptop)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "Close apps modal",
			loading: "Loading apps...",
			errorLoading: "Failed to load app data. Please try again.",
			searchPlaceholder: "Search apps...",
			noAppsFound: "No apps found matching your search.",
			backButton: "Back to list",
			installButton: "Install",
			updateButton: "Update",
			removeButton: "Remove",
			installingMessage: "Simulating install for: {{appName}}",
			removingMessage: "Simulating removal for: {{appName}}",
			updatingMessage: "Simulating update for: {{appName}}",
			installedBadge: "Installed"
		},
		notifications: {
			closeButtonAlt: "Close notification for {fileName}",
			uploading: "Uploading... {progress}%",
			uploadComplete: "Upload Complete",
			uploadFailed: "Upload Failed",
			errorPrefix: "Error:",
			unknownError: "An unknown error occurred.",
			copiedTitle: "Copied: {label}",
			copiedMessage: "Link copied to clipboard: {textToCopy}",
			copyFailedTitle: "Copy Failed: {label}",
			copyFailedError: "Could not copy link to clipboard.",
			scalingTitle: "Scaling Updated: Action Required",
			scalingMessage: "New scaling applied. To see changes, restart: the container, your desktop session by logging out, or the running application."
		},
		alerts: {
			invalidResolution: "Please enter valid positive integers for Width and Height."
		},
		byteUnits: ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 Bytes",
		filesModal: {
			closeAlt: "Close files modal",
			iframeTitle: "Downloadable Files"
		}
	},
	mm = {
		selkiesLogoAlt: "Logo de Selkies",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "Cambiar Tema",
		fullscreenTitle: "Entrar en Pantalla Completa",
		gamingModeTitle: "Modo Juego",
		buttons: {
			videoStreamEnableTitle: "Activar Stream de Vídeo",
			videoStreamDisableTitle: "Desactivar Stream de Vídeo",
			audioStreamEnableTitle: "Activar Stream de Audio",
			audioStreamDisableTitle: "Desactivar Stream de Audio",
			microphoneEnableTitle: "Activar Micrófono",
			microphoneDisableTitle: "Desactivar Micrófono",
			gamepadEnableTitle: "Activar Entrada de Mando",
			gamepadDisableTitle: "Desactivar Entrada de Mando",
			virtualKeyboardButtonTitle: "Mostrar Teclado",
			h264FullColorEnableTitle: "Activar H.264 Color Completo",
			h264FullColorDisableTitle: "Desactivar H.264 Color Completo"
		},
		sections: {
			video: {
				title: "Configuración de Vídeo",
				encoderLabel: "Codificador:",
				framerateLabel: "Fotogramas por segundo ({framerate} FPS):",
				bitrateLabel: "Tasa de bits de vídeo ({bitrate} Mbps):",
				bufferLabelImmediate: "Tamaño del Búfer de Vídeo (0 (Inmediato)):",
				bufferLabelFrames: "Tamaño del Búfer de Vídeo ({videoBufferSize} fotogramas):",
				crfLabel: "CRF de Vídeo ({crf}):",
				fullColorLabel: "Color Completo 4:4:4:"
			},
			audio: {
				title: "Configuración de Audio",
				bitrateLabel: "Tasa de bits de audio ({bitrate} kbps):",
				inputLabel: "Entrada (Micrófono):",
				outputLabel: "Salida (Altavoz):",
				outputNotSupported: "La selección de dispositivo de salida no es compatible con este navegador.",
				deviceErrorDefault: "Error al listar dispositivos de audio: {errorName}",
				deviceErrorPermission: "Permiso denegado. Permita el acceso al micrófono en la configuración del navegador para seleccionar dispositivos.",
				deviceErrorNotFound: "No se encontraron dispositivos de audio.",
				defaultInputLabelFallback: "Dispositivo de Entrada {index}",
				defaultOutputLabelFallback: "Dispositivo de Salida {index}"
			},
			screen: {
				title: "Configuración de Pantalla",
				presetLabel: "Preajuste:",
				resolutionPresetSelect: "-- Seleccionar Preajuste --",
				widthLabel: "Ancho:",
				heightLabel: "Alto:",
				widthPlaceholder: "ej., 1920",
				heightPlaceholder: "ej., 1080",
				setManualButton: "Establecer Resolución Manual",
				resetButton: "Restablecer a Ventana",
				scaleLocallyLabel: "Escalar Localmente:",
				scaleLocallyOn: "SÍ",
				scaleLocallyOff: "NO",
				scaleLocallyTitleEnable: "Activar Escalado Local (Mantener Relación de Aspecto)",
				scaleLocallyTitleDisable: "Desactivar Escalado Local (Usar Resolución Exacta)",
				uiScalingLabel: "Escalado de Interfaz:",
				hidpiLabel: "HiDPI (Píxel Perfecto)",
				hidpiEnableTitle: "Activar HiDPI (Píxel Perfecto)",
				hidpiDisableTitle: "Desactivar HiDPI (Usar escalado CSS)"
			},
			stats: {
				title: "Estadísticas",
				cpuLabel: "CPU",
				gpuLabel: "Uso de GPU",
				sysMemLabel: "Mem Sistema",
				gpuMemLabel: "Mem GPU",
				fpsLabel: "FPS",
				audioLabel: "Audio",
				tooltipCpu: "Uso de CPU: {value}%",
				tooltipGpu: "Uso de GPU: {value}%",
				tooltipSysMem: "Memoria del Sistema: {used} / {total}",
				tooltipGpuMem: "Memoria GPU: {used} / {total}",
				tooltipFps: "FPS del Cliente: {value}",
				tooltipAudio: "Búferes de Audio: {value}",
				tooltipMemoryNA: "N/D"
			},
			clipboard: {
				title: "Portapapeles",
				label: "Portapapeles del Servidor:",
				placeholder: "Contenido del portapapeles del servidor..."
			},
			files: {
				title: "Archivos",
				uploadButton: "Subir Archivos",
				uploadButtonTitle: "Subir archivos a la sesión remota",
				downloadButtonTitle: "Descargar Archivos"
			},
			gamepads: {
				title: "Mandos",
				noActivity: "Aún no se ha detectado actividad del mando...",
				touchEnableTitle: "Activar Mando Táctil",
				touchDisableTitle: "Desactivar Mando Táctil",
				touchActiveLabel: "Mando Táctil: ENCENDIDO",
				touchInactiveLabel: "Mando Táctil: APAGADO",
				physicalHiddenForTouch: "La visualización de mandos físicos está oculta mientras el mando táctil está activo.",
				noActivityMobileOrEnableTouch: "No hay mandos físicos. Active el mando táctil o conecte un controlador."
			},
			apps: {
				title: "Aplicaciones",
				openButtonTitle: "Gestionar Aplicaciones",
				openButton: "Gestionar Aplicaciones"
			},
			sharing: {
				title: "Compartir"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (Portátil)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "Cerrar modal de aplicaciones",
			loading: "Cargando aplicaciones...",
			errorLoading: "Error al cargar los datos de las aplicaciones. Por favor, inténtalo de nuevo.",
			searchPlaceholder: "Buscar aplicaciones...",
			noAppsFound: "No se encontraron aplicaciones que coincidan con tu búsqueda.",
			backButton: "Volver a la lista",
			installButton: "Instalar",
			updateButton: "Actualizar",
			removeButton: "Eliminar",
			installingMessage: "Simulando instalación para: {{appName}}",
			removingMessage: "Simulando eliminación para: {{appName}}",
			updatingMessage: "Simulando actualización para: {{appName}}",
			installedBadge: "Instalado"
		},
		notifications: {
			closeButtonAlt: "Cerrar notificación para {fileName}",
			uploading: "Subiendo... {progress}%",
			uploadComplete: "Subida Completa",
			uploadFailed: "Subida Fallida",
			errorPrefix: "Error:",
			unknownError: "Ocurrió un error desconocido.",
			copiedTitle: "Copiado: {label}",
			copiedMessage: "Enlace copiado al portapapeles: {textToCopy}",
			copyFailedTitle: "Error al Copiar: {label}",
			copyFailedError: "No se pudo copiar el enlace al portapapeles.",
			scalingTitle: "Escalado Actualizado: Acción Requerida",
			scalingMessage: "Nuevo escalado aplicado. Para ver los cambios, reinicie: el contenedor, su sesión de escritorio cerrando sesión, o la aplicación en ejecución."
		},
		alerts: {
			invalidResolution: "Por favor, introduzca números enteros positivos válidos para Ancho y Alto."
		},
		byteUnits: ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 Bytes",
		filesModal: {
			closeAlt: "Cerrar modal de archivos",
			iframeTitle: "Archivos Descargables"
		}
	},
	gm = {
		selkiesLogoAlt: "Selkies 徽标",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "切换主题",
		fullscreenTitle: "进入全屏",
		gamingModeTitle: "游戏模式",
		buttons: {
			videoStreamEnableTitle: "启用视频流",
			videoStreamDisableTitle: "禁用视频流",
			audioStreamEnableTitle: "启用音频流",
			audioStreamDisableTitle: "禁用音频流",
			microphoneEnableTitle: "启用麦克风",
			microphoneDisableTitle: "禁用麦克风",
			gamepadEnableTitle: "启用游戏手柄输入",
			gamepadDisableTitle: "禁用游戏手柄输入",
			virtualKeyboardButtonTitle: "弹出键盘",
			h264FullColorEnableTitle: "启用 H.264 全彩",
			h264FullColorDisableTitle: "禁用 H.264 全彩"
		},
		sections: {
			video: {
				title: "视频设置",
				encoderLabel: "编码器:",
				framerateLabel: "帧率 ({framerate} FPS):",
				bitrateLabel: "视频比特率 ({bitrate} Mbps):",
				bufferLabelImmediate: "视频缓冲大小 (0 (立即)):",
				bufferLabelFrames: "视频缓冲大小 ({videoBufferSize} 帧):",
				crfLabel: "视频 CRF ({crf}):",
				fullColorLabel: "全彩 4:4:4:"
			},
			audio: {
				title: "音频设置",
				bitrateLabel: "音频比特率 ({bitrate} kbps):",
				inputLabel: "输入 (麦克风):",
				outputLabel: "输出 (扬声器):",
				outputNotSupported: "此浏览器不支持输出设备选择。",
				deviceErrorDefault: "列出音频设备时出错: {errorName}",
				deviceErrorPermission: "权限被拒绝。请在浏览器设置中允许麦克风访问以选择设备。",
				deviceErrorNotFound: "未找到音频设备。",
				defaultInputLabelFallback: "输入设备 {index}",
				defaultOutputLabelFallback: "输出设备 {index}"
			},
			screen: {
				title: "屏幕设置",
				presetLabel: "预设:",
				resolutionPresetSelect: "-- 选择预设 --",
				widthLabel: "宽度:",
				heightLabel: "高度:",
				widthPlaceholder: "例如 1920",
				heightPlaceholder: "例如 1080",
				setManualButton: "设置手动分辨率",
				resetButton: "重置为窗口大小",
				scaleLocallyLabel: "本地缩放:",
				scaleLocallyOn: "开",
				scaleLocallyOff: "关",
				scaleLocallyTitleEnable: "启用本地缩放 (保持宽高比)",
				scaleLocallyTitleDisable: "禁用本地缩放 (使用精确分辨率)",
				uiScalingLabel: "界面缩放:",
				hidpiLabel: "HiDPI (像素完美)",
				hidpiEnableTitle: "启用 HiDPI (像素完美)",
				hidpiDisableTitle: "禁用 HiDPI (使用 CSS 缩放)"
			},
			stats: {
				title: "统计信息",
				cpuLabel: "CPU",
				gpuLabel: "GPU 使用率",
				sysMemLabel: "系统内存",
				gpuMemLabel: "GPU 内存",
				fpsLabel: "FPS",
				audioLabel: "音频",
				tooltipCpu: "CPU 使用率: {value}%",
				tooltipGpu: "GPU 使用率: {value}%",
				tooltipSysMem: "系统内存: {used} / {total}",
				tooltipGpuMem: "GPU 内存: {used} / {total}",
				tooltipFps: "客户端 FPS: {value}",
				tooltipAudio: "音频缓冲区: {value}",
				tooltipMemoryNA: "不可用"
			},
			clipboard: {
				title: "剪贴板",
				label: "服务器剪贴板:",
				placeholder: "来自服务器的剪贴板内容..."
			},
			files: {
				title: "文件",
				uploadButton: "上传文件",
				uploadButtonTitle: "上传文件到远程会话",
				downloadButtonTitle: "下载文件"
			},
			gamepads: {
				title: "游戏手柄",
				noActivity: "尚未检测到游戏手柄活动...",
				touchEnableTitle: "启用触摸手柄",
				touchDisableTitle: "禁用触摸手柄",
				touchActiveLabel: "触摸手柄: 开",
				touchInactiveLabel: "触摸手柄: 关",
				physicalHiddenForTouch: "触摸手柄激活时，物理手柄显示将被隐藏。",
				noActivityMobileOrEnableTouch: "没有物理手柄。请启用触摸手柄或连接控制器。"
			},
			apps: {
				title: "应用程序",
				openButtonTitle: "管理应用程序",
				openButton: "管理应用程序"
			},
			sharing: {
				title: "共享"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (笔记本)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "关闭应用程序模态框",
			loading: "正在加载应用程序...",
			errorLoading: "加载应用程序数据失败。请重试。",
			searchPlaceholder: "搜索应用程序...",
			noAppsFound: "未找到与您的搜索匹配的应用程序。",
			backButton: "返回列表",
			installButton: "安装",
			updateButton: "更新",
			removeButton: "移除",
			installingMessage: "模拟安装: {{appName}}",
			removingMessage: "模拟移除: {{appName}}",
			updatingMessage: "模拟更新: {{appName}}",
			installedBadge: "已安装"
		},
		notifications: {
			closeButtonAlt: "关闭 {fileName} 的通知",
			uploading: "正在上传... {progress}%",
			uploadComplete: "上传完成",
			uploadFailed: "上传失败",
			errorPrefix: "错误:",
			unknownError: "发生未知错误。",
			copiedTitle: "已复制: {label}",
			copiedMessage: "链接已复制到剪贴板: {textToCopy}",
			copyFailedTitle: "复制失败: {label}",
			copyFailedError: "无法将链接复制到剪贴板。",
			scalingTitle: "缩放已更新：需要操作",
			scalingMessage: "新的缩放已应用。要查看更改，请重启：容器、通过注销重启您的桌面会话，或重启正在运行的应用程序。"
		},
		alerts: {
			invalidResolution: "请输入有效的正整数作为宽度和高度。"
		},
		byteUnits: ["字节", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 字节",
		filesModal: {
			closeAlt: "关闭文件模态框",
			iframeTitle: "可下载文件"
		}
	},
	bm = {
		selkiesLogoAlt: "सेल्कीस लोगो",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "थीम बदलें",
		fullscreenTitle: "फुलस्क्रीन दर्ज करें",
		gamingModeTitle: "गेमिंग मोड",
		buttons: {
			videoStreamEnableTitle: "वीडियो स्ट्रीम सक्षम करें",
			videoStreamDisableTitle: "वीडियो स्ट्रीम अक्षम करें",
			audioStreamEnableTitle: "ऑडियो स्ट्रीम सक्षम करें",
			audioStreamDisableTitle: "ऑडियो स्ट्रीम अक्षम करें",
			microphoneEnableTitle: "माइक्रोफ़ोन सक्षम करें",
			microphoneDisableTitle: "माइक्रोफ़ोन अक्षम करें",
			gamepadEnableTitle: "गेमपैड इनपुट सक्षम करें",
			gamepadDisableTitle: "गेमपैड इनपुट अक्षम करें",
			virtualKeyboardButtonTitle: "कीबोर्ड दिखाएँ",
			h264FullColorEnableTitle: "H.264 फुल कलर सक्षम करें",
			h264FullColorDisableTitle: "H.264 फुल कलर अक्षम करें"
		},
		sections: {
			video: {
				title: "वीडियो सेटिंग्स",
				encoderLabel: "एन्कोडर:",
				framerateLabel: "फ्रेम प्रति सेकंड ({framerate} FPS):",
				bitrateLabel: "वीडियो बिटरेट ({bitrate} Mbps):",
				bufferLabelImmediate: "वीडियो बफर आकार (0 (तत्काल)):",
				bufferLabelFrames: "वीडियो बफर आकार ({videoBufferSize} फ्रेम):",
				crfLabel: "वीडियो CRF ({crf}):",
				fullColorLabel: "फुल कलर 4:4:4:"
			},
			audio: {
				title: "ऑडियो सेटिंग्स",
				bitrateLabel: "ऑडियो बिटरेट ({bitrate} kbps):",
				inputLabel: "इनपुट (माइक्रोफ़ोन):",
				outputLabel: "आउटपुट (स्पीकर):",
				outputNotSupported: "इस ब्राउज़र द्वारा आउटपुट डिवाइस चयन समर्थित नहीं है।",
				deviceErrorDefault: "ऑडियो डिवाइस सूचीबद्ध करने में त्रुटि: {errorName}",
				deviceErrorPermission: "अनुमति अस्वीकृत। डिवाइस चुनने के लिए कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन एक्सेस की अनुमति दें।",
				deviceErrorNotFound: "कोई ऑडियो डिवाइस नहीं मिला।",
				defaultInputLabelFallback: "इनपुट डिवाइस {index}",
				defaultOutputLabelFallback: "आउटपुट डिवाइस {index}"
			},
			screen: {
				title: "स्क्रीन सेटिंग्स",
				presetLabel: "प्रीसेट:",
				resolutionPresetSelect: "-- प्रीसेट चुनें --",
				widthLabel: "चौड़ाई:",
				heightLabel: "ऊंचाई:",
				widthPlaceholder: "उदा. 1920",
				heightPlaceholder: "उदा. 1080",
				setManualButton: "मैनुअल रिज़ॉल्यूशन सेट करें",
				resetButton: "विंडो पर रीसेट करें",
				scaleLocallyLabel: "स्थानीय रूप से स्केल करें:",
				scaleLocallyOn: "चालू",
				scaleLocallyOff: "बंद",
				scaleLocallyTitleEnable: "स्थानीय स्केलिंग सक्षम करें (पहलू अनुपात बनाए रखें)",
				scaleLocallyTitleDisable: "स्थानीय स्केलिंग अक्षम करें (सटीक रिज़ॉल्यूशन का उपयोग करें)",
				uiScalingLabel: "यूआई स्केलिंग:",
				hidpiLabel: "HiDPI (पिक्सेल परफेक्ट)",
				hidpiEnableTitle: "HiDPI सक्षम करें (पिक्सेल परफेक्ट)",
				hidpiDisableTitle: "HiDPI अक्षम करें (CSS स्केलिंग का उपयोग करें)"
			},
			stats: {
				title: "आँकड़े",
				cpuLabel: "CPU",
				gpuLabel: "GPU उपयोग",
				sysMemLabel: "सिस्टम मेम",
				gpuMemLabel: "GPU मेम",
				fpsLabel: "FPS",
				audioLabel: "ऑडियो",
				tooltipCpu: "CPU उपयोग: {value}%",
				tooltipGpu: "GPU उपयोग: {value}%",
				tooltipSysMem: "सिस्टम मेमोरी: {used} / {total}",
				tooltipGpuMem: "GPU मेमोरी: {used} / {total}",
				tooltipFps: "क्लाइंट FPS: {value}",
				tooltipAudio: "ऑडियो बफ़र्स: {value}",
				tooltipMemoryNA: "लागू नहीं"
			},
			clipboard: {
				title: "क्लिपबोर्ड",
				label: "सर्वर क्लिपबोर्ड:",
				placeholder: "सर्वर से क्लिपबोर्ड सामग्री..."
			},
			files: {
				title: "फ़ाइलें",
				uploadButton: "फ़ाइलें अपलोड करें",
				uploadButtonTitle: "रिमोट सेशन में फ़ाइलें अपलोड करें",
				downloadButtonTitle: "फ़ाइलें डाउनलोड करें"
			},
			gamepads: {
				title: "गेमपैड",
				noActivity: "अभी तक कोई गेमपैड गतिविधि का पता नहीं चला है...",
				touchEnableTitle: "टच गेमपैड सक्षम करें",
				touchDisableTitle: "टच गेमपैड अक्षम करें",
				touchActiveLabel: "टच गेमपैड: चालू",
				touchInactiveLabel: "टच गेमपैड: बंद",
				physicalHiddenForTouch: "टच गेमपैड सक्रिय होने पर भौतिक गेमपैड ���िस्प्ले छिपा रहता है।",
				noActivityMobileOrEnableTouch: "कोई भौतिक गेमपैड नहीं। टच गेमपैड सक्षम करें या नियंत्रक कनेक्ट करें।"
			},
			apps: {
				title: "ऐप्स",
				openButtonTitle: "ऐप्स प्रबंधित करें",
				openButton: "ऐप्स प्रबंधित करें"
			},
			sharing: {
				title: "साझा करना"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (लैपटॉप)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "ऐप्स मोडल बंद करें",
			loading: "ऐप्स लोड हो रहे हैं...",
			errorLoading: "ऐप डेटा लोड करने में विफल। कृपया पुनः प्रयास करें।",
			searchPlaceholder: "ऐप्स खोजें...",
			noAppsFound: "आपकी खोज से मेल खाने वाले कोई ऐप्स नहीं मिले।",
			backButton: "सूची पर वापस जाएं",
			installButton: "इंस्टॉल करें",
			updateButton: "अपडेट करें",
			removeButton: "हटाएं",
			installingMessage: "इसके लिए इंस्टॉलेशन का अनुकरण किया जा रहा है: {{appName}}",
			removingMessage: "इसके लिए हटाने का अनुकरण किया जा रहा है: {{appName}}",
			updatingMessage: "इसके लिए अपडेट का अनुकरण किया जा रहा है: {{appName}}",
			installedBadge: "इंस्टॉल किया गया"
		},
		notifications: {
			closeButtonAlt: "{fileName} के लिए अधिसूचना बंद करें",
			uploading: "अपलोड हो रहा है... {progress}%",
			uploadComplete: "अपलोड पूर्ण",
			uploadFailed: "अपलोड विफल",
			errorPrefix: "त्रुटि:",
			unknownError: "एक अज्ञात त्रुटि हुई।",
			copiedTitle: "कॉपी किया गया: {label}",
			copiedMessage: "लिंक क्लिपबोर्ड पर कॉपी किया गया: {textToCopy}",
			copyFailedTitle: "कॉपी करने में विफल: {label}",
			copyFailedError: "लिंक क्लिपबोर्ड पर कॉपी नहीं किया जा सका।",
			scalingTitle: "स्केलिंग अपडेट किया गया: कार्रवाई आवश्यक है",
			scalingMessage: "नई स्केलिंग लागू की गई है। परिवर्तन देखने के लिए, पुनरारंभ करें: कंटेनर, लॉग आउट करके अपना डेस्कटॉप सत्र, या चल रहा एप्लिकेशन।"
		},
		alerts: {
			invalidResolution: "कृपया चौड़ाई और ऊंचाई के लिए मान्य धनात्मक पूर्णांक दर्ज करें।"
		},
		byteUnits: ["बाइट्स", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 बाइट्स",
		filesModal: {
			closeAlt: "फ़ाइलें मोडल बंद करें",
			iframeTitle: "डाउनलोड करने योग्य फ़ाइलें"
		}
	},
	vm = {
		selkiesLogoAlt: "Logo Selkies",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "Alternar Tema",
		fullscreenTitle: "Entrar em Tela Cheia",
		gamingModeTitle: "Modo de Jogo",
		buttons: {
			videoStreamEnableTitle: "Ativar Stream de Vídeo",
			videoStreamDisableTitle: "Desativar Stream de Vídeo",
			audioStreamEnableTitle: "Ativar Stream de Áudio",
			audioStreamDisableTitle: "Desativar Stream de Áudio",
			microphoneEnableTitle: "Ativar Microfone",
			microphoneDisableTitle: "Desativar Microfone",
			gamepadEnableTitle: "Ativar Entrada de Gamepad",
			gamepadDisableTitle: "Desativar Entrada de Gamepad",
			virtualKeyboardButtonTitle: "Exibir Teclado",
			h264FullColorEnableTitle: "Ativar H.264 Cor Completa",
			h264FullColorDisableTitle: "Desativar H.264 Cor Completa"
		},
		sections: {
			video: {
				title: "Configurações de Vídeo",
				encoderLabel: "Codificador:",
				framerateLabel: "Quadros por segundo ({framerate} FPS):",
				bitrateLabel: "Bitrate de Vídeo ({bitrate} Mbps):",
				bufferLabelImmediate: "Tamanho do Buffer de Vídeo (0 (Imediato)):",
				bufferLabelFrames: "Tamanho do Buffer de Vídeo ({videoBufferSize} quadros):",
				crfLabel: "CRF de Vídeo ({crf}):",
				fullColorLabel: "Cor Completa 4:4:4:"
			},
			audio: {
				title: "Configurações de Áudio",
				bitrateLabel: "Bitrate de Áudio ({bitrate} kbps):",
				inputLabel: "Entrada (Microfone):",
				outputLabel: "Saída (Alto-falante):",
				outputNotSupported: "A seleção de dispositivo de saída não é suportada por este navegador.",
				deviceErrorDefault: "Erro ao listar dispositivos de áudio: {errorName}",
				deviceErrorPermission: "Permissão negada. Permita o acesso ao microfone nas configurações do navegador para selecionar dispositivos.",
				deviceErrorNotFound: "Nenhum dispositivo de áudio encontrado.",
				defaultInputLabelFallback: "Dispositivo de Entrada {index}",
				defaultOutputLabelFallback: "Dispositivo de Saída {index}"
			},
			screen: {
				title: "Configurações de Tela",
				presetLabel: "Predefinição:",
				resolutionPresetSelect: "-- Selecionar Predefinição --",
				widthLabel: "Largura:",
				heightLabel: "Altura:",
				widthPlaceholder: "ex: 1920",
				heightPlaceholder: "ex: 1080",
				setManualButton: "Definir Resolução Manual",
				resetButton: "Redefinir para Janela",
				scaleLocallyLabel: "Escalar Localmente:",
				scaleLocallyOn: "LIGADO",
				scaleLocallyOff: "DESLIGADO",
				scaleLocallyTitleEnable: "Ativar Escala Local (Manter Proporção)",
				scaleLocallyTitleDisable: "Desativar Escala Local (Usar Resolução Exata)",
				uiScalingLabel: "Escala da Interface:",
				hidpiLabel: "HiDPI (Pixel Perfeito)",
				hidpiEnableTitle: "Ativar HiDPI (Pixel Perfeito)",
				hidpiDisableTitle: "Desativar HiDPI (Usar dimensionamento CSS)"
			},
			stats: {
				title: "Estatísticas",
				cpuLabel: "CPU",
				gpuLabel: "Uso de GPU",
				sysMemLabel: "Mem Sistema",
				gpuMemLabel: "Mem GPU",
				fpsLabel: "FPS",
				audioLabel: "Áudio",
				tooltipCpu: "Uso de CPU: {value}%",
				tooltipGpu: "Uso de GPU: {value}%",
				tooltipSysMem: "Memória do Sistema: {used} / {total}",
				tooltipGpuMem: "Memória da GPU: {used} / {total}",
				tooltipFps: "FPS do Cliente: {value}",
				tooltipAudio: "Buffers de Áudio: {value}",
				tooltipMemoryNA: "N/D"
			},
			clipboard: {
				title: "Área de Transferência",
				label: "Área de Transferência do Servidor:",
				placeholder: "Conteúdo da área de transferência do servidor..."
			},
			files: {
				title: "Arquivos",
				uploadButton: "Carregar Arquivos",
				uploadButtonTitle: "Carregar arquivos para a sessão remota",
				downloadButtonTitle: "Baixar Arquivos"
			},
			gamepads: {
				title: "Gamepads",
				noActivity: "Nenhuma atividade de gamepad detectada ainda...",
				touchEnableTitle: "Ativar Gamepad Tátil",
				touchDisableTitle: "Desativar Gamepad Tátil",
				touchActiveLabel: "Gamepad Tátil: LIGADO",
				touchInactiveLabel: "Gamepad Tátil: DESLIGADO",
				physicalHiddenForTouch: "A exibição de gamepads físicos fica oculta enquanto o gamepad tátil está ativo.",
				noActivityMobileOrEnableTouch: "Sem gamepads físicos. Ative o gamepad tátil ou conecte um controle."
			},
			apps: {
				title: "Aplicativos",
				openButtonTitle: "Gerenciar Aplicativos",
				openButton: "Gerenciar Aplicativos"
			},
			sharing: {
				title: "Compartilhamento"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (Laptop)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "Fechar modal de aplicativos",
			loading: "Carregando aplicativos...",
			errorLoading: "Falha ao carregar dados dos aplicativos. Por favor, tente novamente.",
			searchPlaceholder: "Buscar aplicativos...",
			noAppsFound: "Nenhum aplicativo encontrado correspondente à sua busca.",
			backButton: "Voltar para a lista",
			installButton: "Instalar",
			updateButton: "Atualizar",
			removeButton: "Remover",
			installingMessage: "Simulando instalação para: {{appName}}",
			removingMessage: "Simulando remoção para: {{appName}}",
			updatingMessage: "Simulando atualização para: {{appName}}",
			installedBadge: "Instalado"
		},
		notifications: {
			closeButtonAlt: "Fechar notificação para {fileName}",
			uploading: "Carregando... {progress}%",
			uploadComplete: "Carregamento Completo",
			uploadFailed: "Falha no Carregamento",
			errorPrefix: "Erro:",
			unknownError: "Ocorreu um erro desconhecido.",
			copiedTitle: "Copiado: {label}",
			copiedMessage: "Link copiado para a área de transferência: {textToCopy}",
			copyFailedTitle: "Falha ao Copiar: {label}",
			copyFailedError: "Não foi possível copiar o link para a área de transferência.",
			scalingTitle: "Escala Atualizada: Ação Necessária",
			scalingMessage: "Nova escala aplicada. Para ver as alterações, reinicie: o contêiner, sua sessão de desktop fazendo logout, ou o aplicativo em execução."
		},
		alerts: {
			invalidResolution: "Por favor, insira inteiros positivos válidos para Largura e Altura."
		},
		byteUnits: ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 Bytes",
		filesModal: {
			closeAlt: "Fechar modal de arquivos",
			iframeTitle: "Arquivos para Download"
		}
	},
	ym = {
		selkiesLogoAlt: "Logo Selkies",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "Changer de thème",
		fullscreenTitle: "Passer en plein écran",
		gamingModeTitle: "Mode Jeu",
		buttons: {
			videoStreamEnableTitle: "Activer le flux vidéo",
			videoStreamDisableTitle: "Désactiver le flux vidéo",
			audioStreamEnableTitle: "Activer le flux audio",
			audioStreamDisableTitle: "Désactiver le flux audio",
			microphoneEnableTitle: "Activer le microphone",
			microphoneDisableTitle: "Désactiver le microphone",
			gamepadEnableTitle: "Activer l'entrée manette",
			gamepadDisableTitle: "Désactiver l'entrée manette",
			virtualKeyboardButtonTitle: "Afficher le Clavier",
			h264FullColorEnableTitle: "Activer H.264 Couleur Complète",
			h264FullColorDisableTitle: "Désactiver H.264 Couleur Complète"
		},
		sections: {
			video: {
				title: "Paramètres vidéo",
				encoderLabel: "Encodeur :",
				framerateLabel: "Images par seconde ({framerate} FPS) :",
				bitrateLabel: "Débit vidéo ({bitrate} Mbps) :",
				bufferLabelImmediate: "Taille du tampon vidéo (0 (Immédiat)) :",
				bufferLabelFrames: "Taille du tampon vidéo ({videoBufferSize} images) :",
				crfLabel: "CRF Vidéo ({crf}) :",
				fullColorLabel: "Couleur Complète 4:4:4:"
			},
			audio: {
				title: "Paramètres audio",
				bitrateLabel: "Débit audio ({bitrate} kbps) :",
				inputLabel: "Entrée (Microphone) :",
				outputLabel: "Sortie (Haut-parleur) :",
				outputNotSupported: "La sélection du périphérique de sortie n'est pas prise en charge par ce navigateur.",
				deviceErrorDefault: "Erreur lors de l'énumération des périphériques audio : {errorName}",
				deviceErrorPermission: "Autorisation refusée. Veuillez autoriser l'accès au microphone dans les paramètres du navigateur pour sélectionner des périphériques.",
				deviceErrorNotFound: "Aucun périphérique audio trouvé.",
				defaultInputLabelFallback: "Périphérique d'entrée {index}",
				defaultOutputLabelFallback: "Périphérique de sortie {index}"
			},
			screen: {
				title: "Paramètres d'écran",
				presetLabel: "Préréglage :",
				resolutionPresetSelect: "-- Sélectionner un préréglage --",
				widthLabel: "Largeur :",
				heightLabel: "Hauteur :",
				widthPlaceholder: "ex: 1920",
				heightPlaceholder: "ex: 1080",
				setManualButton: "Définir la résolution manuelle",
				resetButton: "Réinitialiser à la fenêtre",
				scaleLocallyLabel: "Mise à l'échelle locale :",
				scaleLocallyOn: "OUI",
				scaleLocallyOff: "NON",
				scaleLocallyTitleEnable: "Activer la mise à l'échelle locale (Conserver les proportions)",
				scaleLocallyTitleDisable: "Désactiver la mise à l'échelle locale (Utiliser la résolution exacte)",
				uiScalingLabel: "Mise à l'échelle de l'interface :",
				hidpiLabel: "HiDPI (Pixel Perfect)",
				hidpiEnableTitle: "Activer HiDPI (Pixel Perfect)",
				hidpiDisableTitle: "Désactiver HiDPI (Utiliser la mise à l'échelle CSS)"
			},
			stats: {
				title: "Statistiques",
				cpuLabel: "CPU",
				gpuLabel: "Utilisation GPU",
				sysMemLabel: "Mém. Système",
				gpuMemLabel: "Mém. GPU",
				fpsLabel: "FPS",
				audioLabel: "Audio",
				tooltipCpu: "Utilisation CPU : {value}%",
				tooltipGpu: "Utilisation GPU : {value}%",
				tooltipSysMem: "Mémoire système : {used} / {total}",
				tooltipGpuMem: "Mémoire GPU : {used} / {total}",
				tooltipFps: "FPS Client : {value}",
				tooltipAudio: "Tampons audio : {value}",
				tooltipMemoryNA: "N/D"
			},
			clipboard: {
				title: "Presse-papiers",
				label: "Presse-papiers du serveur :",
				placeholder: "Contenu du presse-papiers depuis le serveur..."
			},
			files: {
				title: "Fichiers",
				uploadButton: "Téléverser des fichiers",
				uploadButtonTitle: "Téléverser des fichiers vers la session distante",
				downloadButtonTitle: "Télécharger les Fichiers"
			},
			gamepads: {
				title: "Manettes",
				noActivity: "Aucune activité de manette détectée pour le moment...",
				touchEnableTitle: "Activer la manette tactile",
				touchDisableTitle: "Désactiver la manette tactile",
				touchActiveLabel: "Manette tactile : ACTIVÉE",
				touchInactiveLabel: "Manette tactile : DÉSACTIVÉE",
				physicalHiddenForTouch: "L'affichage des manettes physiques est masqué lorsque la manette tactile est active.",
				noActivityMobileOrEnableTouch: "Aucune manette physique. Activez la manette tactile ou connectez un contrôleur."
			},
			apps: {
				title: "Applications",
				openButtonTitle: "Gérer les applications",
				openButton: "Gérer les applications"
			},
			sharing: {
				title: "Partage"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (Portable)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "Fermer la modale des applications",
			loading: "Chargement des applications...",
			errorLoading: "Échec du chargement des données des applications. Veuillez réessayer.",
			searchPlaceholder: "Rechercher des applications...",
			noAppsFound: "Aucune application trouvée correspondant à votre recherche.",
			backButton: "Retour à la liste",
			installButton: "Installer",
			updateButton: "Mettre à jour",
			removeButton: "Supprimer",
			installingMessage: "Simulation de l'installation pour : {{appName}}",
			removingMessage: "Simulation de la suppression pour : {{appName}}",
			updatingMessage: "Simulation de la mise à jour pour : {{appName}}",
			installedBadge: "Installé"
		},
		notifications: {
			closeButtonAlt: "Fermer la notification pour {fileName}",
			uploading: "Téléversement... {progress}%",
			uploadComplete: "Téléversement terminé",
			uploadFailed: "Échec du téléversement",
			errorPrefix: "Erreur :",
			unknownError: "Une erreur inconnue s'est produite.",
			copiedTitle: "Copié : {label}",
			copiedMessage: "Lien copié dans le presse-papiers : {textToCopy}",
			copyFailedTitle: "Échec de la copie : {label}",
			copyFailedError: "Impossible de copier le lien dans le presse-papiers.",
			scalingTitle: "Mise à l'échelle mise à jour : Action requise",
			scalingMessage: "Nouvelle mise à l'échelle appliquée. Pour voir les changements, redémarrez : le conteneur, votre session de bureau en vous déconnectant, ou l'application en cours d'exécution."
		},
		alerts: {
			invalidResolution: "Veuillez entrer des entiers positifs valides pour la Largeur et la Hauteur."
		},
		byteUnits: ["Octets", "Ko", "Mo", "Go", "To", "Po", "Eo", "Zo", "Yo"],
		zeroBytes: "0 Octets",
		filesModal: {
			closeAlt: "Fermer la modale des fichiers",
			iframeTitle: "Fichiers téléchargeables"
		}
	},
	Sm = {
		selkiesLogoAlt: "Логотип Selkies",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "Переключить тему",
		fullscreenTitle: "Войти в полноэкранный режим",
		gamingModeTitle: "Игровой режим",
		buttons: {
			videoStreamEnableTitle: "Включить видеопоток",
			videoStreamDisableTitle: "Отключить видеопоток",
			audioStreamEnableTitle: "Включить аудиопоток",
			audioStreamDisableTitle: "Отключить аудиопоток",
			microphoneEnableTitle: "Включить микрофон",
			microphoneDisableTitle: "Отключить микрофон",
			gamepadEnableTitle: "Включить ввод с геймпада",
			gamepadDisableTitle: "Отключить ввод с геймпада",
			virtualKeyboardButtonTitle: "Показать Клавиатуру",
			h264FullColorEnableTitle: "Включить H.264 Полный цвет",
			h264FullColorDisableTitle: "Отключить H.264 Полный цвет"
		},
		sections: {
			video: {
				title: "Настройки видео",
				encoderLabel: "Кодировщик:",
				framerateLabel: "Кадров в секунду ({framerate} FPS):",
				bitrateLabel: "Битрейт видео ({bitrate} Мбит/с):",
				bufferLabelImmediate: "Размер буфера видео (0 (Немедленно)):",
				bufferLabelFrames: "Размер буфера видео ({videoBufferSize} кадров):",
				crfLabel: "CRF видео ({crf}):",
				fullColorLabel: "Полный цвет 4:4:4:"
			},
			audio: {
				title: "Настройки аудио",
				bitrateLabel: "Битрейт аудио ({bitrate} кбит/с):",
				inputLabel: "Вход (Микрофон):",
				outputLabel: "Выход (Динамик):",
				outputNotSupported: "Выбор устройства вывода не поддерживается этим браузером.",
				deviceErrorDefault: "Ошибка при перечислении аудиоустройств: {errorName}",
				deviceErrorPermission: "Доступ запрещен. Пожалуйста, разрешите доступ к микрофону в настройках браузера для выбора устройств.",
				deviceErrorNotFound: "Аудиоустройства не найдены.",
				defaultInputLabelFallback: "Устройство ввода {index}",
				defaultOutputLabelFallback: "Устройство вывода {index}"
			},
			screen: {
				title: "Настройки экрана",
				presetLabel: "Предустановка:",
				resolutionPresetSelect: "-- Выбрать предустановку --",
				widthLabel: "Ширина:",
				heightLabel: "Высота:",
				widthPlaceholder: "напр., 1920",
				heightPlaceholder: "напр., 1080",
				setManualButton: "Установить ручное разрешение",
				resetButton: "Сбросить до окна",
				scaleLocallyLabel: "Масштабировать локально:",
				scaleLocallyOn: "ВКЛ",
				scaleLocallyOff: "ВЫКЛ",
				scaleLocallyTitleEnable: "Включить локальное масштабирование (Сохранять пропорции)",
				scaleLocallyTitleDisable: "Отключить локальное масштабирование (Использовать точное разрешение)",
				uiScalingLabel: "Масштаб интерфейса:",
				hidpiLabel: "HiDPI (Пиксельная точность)",
				hidpiEnableTitle: "Включить HiDPI (Пиксельная точность)",
				hidpiDisableTitle: "Отключить HiDPI (Использовать масштабирование CSS)"
			},
			stats: {
				title: "Статистика",
				cpuLabel: "ЦП",
				gpuLabel: "Загрузка ГП",
				sysMemLabel: "Память сист.",
				gpuMemLabel: "Память ГП",
				fpsLabel: "FPS",
				audioLabel: "Аудио",
				tooltipCpu: "Загрузка ЦП: {value}%",
				tooltipGpu: "Загрузка ГП: {value}%",
				tooltipSysMem: "Системная память: {used} / {total}",
				tooltipGpuMem: "Память ГП: {used} / {total}",
				tooltipFps: "FPS клиента: {value}",
				tooltipAudio: "Аудиобуферы: {value}",
				tooltipMemoryNA: "Н/Д"
			},
			clipboard: {
				title: "Буфер обмена",
				label: "Буфер обмена сервера:",
				placeholder: "Содержимое буфера обмена с сервера..."
			},
			files: {
				title: "Файлы",
				uploadButton: "Загрузить файлы",
				uploadButtonTitle: "Загрузить файлы в удаленную сессию",
				downloadButtonTitle: "Скачать Файлы"
			},
			gamepads: {
				title: "Геймпады",
				noActivity: "Активность геймпада пока не обнаружена...",
				touchEnableTitle: "Включить сенсорный геймпад",
				touchDisableTitle: "Отключить сенсорный геймпад",
				touchActiveLabel: "Сенсорный геймпад: ВКЛ",
				touchInactiveLabel: "Сенсорный геймпад: ВЫКЛ",
				physicalHiddenForTouch: "Отображение физических геймпадов скрыто, пока активен сенсорный геймпад.",
				noActivityMobileOrEnableTouch: "Физические геймпады отсутствуют. Включите сенсорный геймпад или подключите контроллер."
			},
			apps: {
				title: "Приложения",
				openButtonTitle: "Управление приложениями",
				openButton: "Управление приложениями"
			},
			sharing: {
				title: "Общий доступ"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (Ноутбук)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "Закрыть модальное окно приложений",
			loading: "Загрузка приложений...",
			errorLoading: "Не удалось загрузить данные приложений. Пожалуйста, попробуйте еще раз.",
			searchPlaceholder: "Поиск приложений...",
			noAppsFound: "Приложения, соответствующие вашему поиску, не найдены.",
			backButton: "Назад к списку",
			installButton: "Установить",
			updateButton: "Обновить",
			removeButton: "Удалить",
			installingMessage: "Симуляция установки для: {{appName}}",
			removingMessage: "Симуляция удаления для: {{appName}}",
			updatingMessage: "Симуляция обновления для: {{appName}}",
			installedBadge: "Установлено"
		},
		notifications: {
			closeButtonAlt: "Закрыть уведомление для {fileName}",
			uploading: "Загрузка... {progress}%",
			uploadComplete: "Загрузка завершена",
			uploadFailed: "Ошибка загрузки",
			errorPrefix: "Ошибка:",
			unknownError: "Произошла неизвестная ошибка.",
			copiedTitle: "Скопировано: {label}",
			copiedMessage: "Ссылка скопирована в буфер обмена: {textToCopy}",
			copyFailedTitle: "Ошибка копирования: {label}",
			copyFailedError: "Не удалось скопировать ссылку в буфер обмена.",
			scalingTitle: "Масштабирование обновлено: Требуется действие",
			scalingMessage: "Новое масштабирование применено. Чтобы увидеть изменения, перезапустите: контейнер, ваш сеанс рабочего стола путем выхода из системы, или запущенное приложение."
		},
		alerts: {
			invalidResolution: "Пожалуйста, введите действительные положительные целые числа для Ширины и Высоты."
		},
		byteUnits: ["Байты", "КБ", "МБ", "ГБ", "ТБ", "ПБ", "ЭБ", "ЗБ", "ЙБ"],
		zeroBytes: "0 Байт",
		filesModal: {
			closeAlt: "Закрыть модальное окно файлов",
			iframeTitle: "Файлы для скачивания"
		}
	},
	xm = {
		selkiesLogoAlt: "Selkies Logo",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "Theme wechseln",
		fullscreenTitle: "Vollbildmodus aktivieren",
		gamingModeTitle: "Gaming-Modus",
		buttons: {
			videoStreamEnableTitle: "Videostream aktivieren",
			videoStreamDisableTitle: "Videostream deaktivieren",
			audioStreamEnableTitle: "Audiostream aktivieren",
			audioStreamDisableTitle: "Audiostream deaktivieren",
			microphoneEnableTitle: "Mikrofon aktivieren",
			microphoneDisableTitle: "Mikrofon deaktivieren",
			gamepadEnableTitle: "Gamepad-Eingabe aktivieren",
			gamepadDisableTitle: "Gamepad-Eingabe deaktivieren",
			virtualKeyboardButtonTitle: "Tastatur einblenden",
			h264FullColorEnableTitle: "H.264 Vollfarbe aktivieren",
			h264FullColorDisableTitle: "H.264 Vollfarbe deaktivieren"
		},
		sections: {
			video: {
				title: "Videoeinstellungen",
				encoderLabel: "Encoder:",
				framerateLabel: "Bilder pro Sekunde ({framerate} FPS):",
				bitrateLabel: "Video-Bitrate ({bitrate} Mbps):",
				bufferLabelImmediate: "Video-Puffergröße (0 (Sofort)):",
				bufferLabelFrames: "Video-Puffergröße ({videoBufferSize} Frames):",
				crfLabel: "Video CRF ({crf}):",
				fullColorLabel: "Vollfarbe 4:4:4:"
			},
			audio: {
				title: "Audioeinstellungen",
				bitrateLabel: "Audio-Bitrate ({bitrate} kbps):",
				inputLabel: "Eingang (Mikrofon):",
				outputLabel: "Ausgang (Lautsprecher):",
				outputNotSupported: "Die Auswahl des Ausgabegeräts wird von diesem Browser nicht unterstützt.",
				deviceErrorDefault: "Fehler beim Auflisten der Audiogeräte: {errorName}",
				deviceErrorPermission: "Berechtigung verweigert. Bitte erlauben Sie den Mikrofonzugriff in den Browsereinstellungen, um Geräte auszuwählen.",
				deviceErrorNotFound: "Keine Audiogeräte gefunden.",
				defaultInputLabelFallback: "Eingabegerät {index}",
				defaultOutputLabelFallback: "Ausgabegerät {index}"
			},
			screen: {
				title: "Bildschirmeinstellungen",
				presetLabel: "Voreinstellung:",
				resolutionPresetSelect: "-- Voreinstellung wählen --",
				widthLabel: "Breite:",
				heightLabel: "Höhe:",
				widthPlaceholder: "z.B. 1920",
				heightPlaceholder: "z.B. 1080",
				setManualButton: "Manuelle Auflösung festlegen",
				resetButton: "Auf Fenster zurücksetzen",
				scaleLocallyLabel: "Lokal skalieren:",
				scaleLocallyOn: "AN",
				scaleLocallyOff: "AUS",
				scaleLocallyTitleEnable: "Lokale Skalierung aktivieren (Seitenverhältnis beibehalten)",
				scaleLocallyTitleDisable: "Lokale Skalierung deaktivieren (Genaue Auflösung verwenden)",
				uiScalingLabel: "UI-Skalierung:",
				hidpiLabel: "HiDPI (Pixelgenau)",
				hidpiEnableTitle: "HiDPI aktivieren (Pixelgenau)",
				hidpiDisableTitle: "HiDPI deaktivieren (CSS-Skalierung verwenden)"
			},
			stats: {
				title: "Statistiken",
				cpuLabel: "CPU",
				gpuLabel: "GPU-Auslastung",
				sysMemLabel: "Sys-Speicher",
				gpuMemLabel: "GPU-Speicher",
				fpsLabel: "FPS",
				audioLabel: "Audio",
				tooltipCpu: "CPU-Auslastung: {value}%",
				tooltipGpu: "GPU-Auslastung: {value}%",
				tooltipSysMem: "Systemspeicher: {used} / {total}",
				tooltipGpuMem: "GPU-Speicher: {used} / {total}",
				tooltipFps: "Client FPS: {value}",
				tooltipAudio: "Audio-Puffer: {value}",
				tooltipMemoryNA: "N/V"
			},
			clipboard: {
				title: "Zwischenablage",
				label: "Server-Zwischenablage:",
				placeholder: "Inhalt der Zwischenablage vom Server..."
			},
			files: {
				title: "Dateien",
				uploadButton: "Dateien hochladen",
				uploadButtonTitle: "Dateien zur Remote-Sitzung hochladen",
				downloadButtonTitle: "Dateien herunterladen"
			},
			gamepads: {
				title: "Gamepads",
				noActivity: "Bisher keine Gamepad-Aktivität erkannt...",
				touchEnableTitle: "Touch-Gamepad aktivieren",
				touchDisableTitle: "Touch-Gamepad deaktivieren",
				touchActiveLabel: "Touch-Gamepad: AN",
				touchInactiveLabel: "Touch-Gamepad: AUS",
				physicalHiddenForTouch: "Die Anzeige physischer Gamepads ist ausgeblendet, während das Touch-Gamepad aktiv ist.",
				noActivityMobileOrEnableTouch: "Keine physischen Gamepads. Aktivieren Sie das Touch-Gamepad oder schließen Sie einen Controller an."
			},
			apps: {
				title: "Anwendungen",
				openButtonTitle: "Anwendungen verwalten",
				openButton: "Anwendungen verwalten"
			},
			sharing: {
				title: "Teilen"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (Laptop)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "Anwendungsmodal schließen",
			loading: "Anwendungen werden geladen...",
			errorLoading: "Fehler beim Laden der Anwendungsdaten. Bitte versuchen Sie es erneut.",
			searchPlaceholder: "Anwendungen suchen...",
			noAppsFound: "Keine Anwendungen gefunden, die Ihrer Suche entsprechen.",
			backButton: "Zurück zur Liste",
			installButton: "Installieren",
			updateButton: "Aktualisieren",
			removeButton: "Entfernen",
			installingMessage: "Simulation der Installation für: {{appName}}",
			removingMessage: "Simulation der Entfernung für: {{appName}}",
			updatingMessage: "Simulation der Aktualisierung für: {{appName}}",
			installedBadge: "Installiert"
		},
		notifications: {
			closeButtonAlt: "Benachrichtigung für {fileName} schließen",
			uploading: "Hochladen... {progress}%",
			uploadComplete: "Hochladen abgeschlossen",
			uploadFailed: "Hochladen fehlgeschlagen",
			errorPrefix: "Fehler:",
			unknownError: "Ein unbekannter Fehler ist aufgetreten.",
			copiedTitle: "Kopiert: {label}",
			copiedMessage: "Link in die Zwischenablage kopiert: {textToCopy}",
			copyFailedTitle: "Kopieren fehlgeschlagen: {label}",
			copyFailedError: "Link konnte nicht in die Zwischenablage kopiert werden.",
			scalingTitle: "Skalierung aktualisiert: Aktion erforderlich",
			scalingMessage: "Neue Skalierung angewendet. Um Änderungen zu sehen, starten Sie neu: den Container, Ihre Desktop-Sitzung durch Abmelden oder die laufende Anwendung."
		},
		alerts: {
			invalidResolution: "Bitte geben Sie gültige positive ganze Zahlen für Breite und Höhe ein."
		},
		byteUnits: ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 Bytes",
		filesModal: {
			closeAlt: "Dateimodal schließen",
			iframeTitle: "Herunterladbare Dateien"
		}
	},
	Tm = {
		selkiesLogoAlt: "Selkies Logosu",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "Temayı Değiştir",
		fullscreenTitle: "Tam Ekrana Gir",
		gamingModeTitle: "Oyun Modu",
		buttons: {
			videoStreamEnableTitle: "Video Akışını Etkinleştir",
			videoStreamDisableTitle: "Video Akışını Devre Dışı Bırak",
			audioStreamEnableTitle: "Ses Akışını Etkinleştir",
			audioStreamDisableTitle: "Ses Akışını Devre Dışı Bırak",
			microphoneEnableTitle: "Mikrofonu Etkinleştir",
			microphoneDisableTitle: "Mikrofonu Devre Dışı Bırak",
			gamepadEnableTitle: "Oyun Kumandası Girişini Etkinleştir",
			gamepadDisableTitle: "Oyun Kumandası Girişini Devre Dışı Bırak",
			virtualKeyboardButtonTitle: "Klavyeyi Göster",
			h264FullColorEnableTitle: "H.264 Tam Renk Etkinleştir",
			h264FullColorDisableTitle: "H.264 Tam Renk Devre Dışı Bırak"
		},
		sections: {
			video: {
				title: "Video Ayarları",
				encoderLabel: "Kodlayıcı:",
				framerateLabel: "Saniyedeki Kare Sayısı ({framerate} FPS):",
				bitrateLabel: "Video Bit Hızı ({bitrate} Mbps):",
				bufferLabelImmediate: "Video Tampon Boyutu (0 (Anında)):",
				bufferLabelFrames: "Video Tampon Boyutu ({videoBufferSize} kare):",
				crfLabel: "Video CRF ({crf}):",
				fullColorLabel: "Tam Renk 4:4:4:"
			},
			audio: {
				title: "Ses Ayarları",
				bitrateLabel: "Ses Bit Hızı ({bitrate} kbps):",
				inputLabel: "Giriş (Mikrofon):",
				outputLabel: "Çıkış (Hoparlör):",
				outputNotSupported: "Çıkış aygıtı seçimi bu tarayıcı tarafından desteklenmiyor.",
				deviceErrorDefault: "Ses aygıtları listelenirken hata oluştu: {errorName}",
				deviceErrorPermission: "İzin reddedildi. Aygıtları seçmek için lütfen tarayıcı ayarlarında mikrofon erişimine izin verin.",
				deviceErrorNotFound: "Ses aygıtı bulunamadı.",
				defaultInputLabelFallback: "Giriş Aygıtı {index}",
				defaultOutputLabelFallback: "Çıkış Aygıtı {index}"
			},
			screen: {
				title: "Ekran Ayarları",
				presetLabel: "Ön Ayar:",
				resolutionPresetSelect: "-- Ön Ayar Seç --",
				widthLabel: "Genişlik:",
				heightLabel: "Yükseklik:",
				widthPlaceholder: "örneğin, 1920",
				heightPlaceholder: "örneğin, 1080",
				setManualButton: "Manuel Çözünürlüğü Ayarla",
				resetButton: "Pencereye Sıfırla",
				scaleLocallyLabel: "Yerel Olarak Ölçekle:",
				scaleLocallyOn: "AÇIK",
				scaleLocallyOff: "KAPALI",
				scaleLocallyTitleEnable: "Yerel Ölçeklendirmeyi Etkinleştir (En Boy Oranını Koru)",
				scaleLocallyTitleDisable: "Yerel Ölçeklendirmeyi Devre Dışı Bırak (Tam Çözünürlüğü Kullan)",
				uiScalingLabel: "Arayüz Ölçekleme:",
				hidpiLabel: "HiDPI (Piksel Mükemmelliği)",
				hidpiEnableTitle: "HiDPI'yi Etkinleştir (Piksel Mükemmelliği)",
				hidpiDisableTitle: "HiDPI'yi Devre Dışı Bırak (CSS Ölçeklendirme Kullan)"
			},
			stats: {
				title: "İstatistikler",
				cpuLabel: "CPU",
				gpuLabel: "GPU Kullanımı",
				sysMemLabel: "Sis Belleği",
				gpuMemLabel: "GPU Belleği",
				fpsLabel: "FPS",
				audioLabel: "Ses",
				tooltipCpu: "CPU Kullanımı: {value}%",
				tooltipGpu: "GPU Kullanımı: {value}%",
				tooltipSysMem: "Sistem Belleği: {used} / {total}",
				tooltipGpuMem: "GPU Belleği: {used} / {total}",
				tooltipFps: "İstemci FPS: {value}",
				tooltipAudio: "Ses Tamponları: {value}",
				tooltipMemoryNA: "N/A"
			},
			clipboard: {
				title: "Pano",
				label: "Sunucu Panosu:",
				placeholder: "Sunucudan pano içeriği..."
			},
			files: {
				title: "Dosyalar",
				uploadButton: "Dosya Yükle",
				uploadButtonTitle: "Uzak oturuma dosya yükle",
				downloadButtonTitle: "Dosyaları İndir"
			},
			gamepads: {
				title: "Oyun Kumandaları",
				noActivity: "Henüz oyun kumandası etkinliği algılanmadı...",
				touchEnableTitle: "Dokunmatik Oyun Kumandasını Etkinleştir",
				touchDisableTitle: "Dokunmatik Oyun Kumandasını Devre Dışı Bırak",
				touchActiveLabel: "Dokunmatik Kumanda: AÇIK",
				touchInactiveLabel: "Dokunmatik Kumanda: KAPALI",
				physicalHiddenForTouch: "Dokunmatik oyun kumandası etkinken fiziksel oyun kumandası ekranı gizlenir.",
				noActivityMobileOrEnableTouch: "Fiziksel oyun kumandası yok. Dokunmatik oyun kumandasını etkinleştirin veya bir denetleyici bağlayın."
			},
			apps: {
				title: "Uygulamalar",
				openButtonTitle: "Uygulamaları Yönet",
				openButton: "Uygulamaları Yönet"
			},
			sharing: {
				title: "Paylaşım"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (Dizüstü)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "Uygulama modalını kapat",
			loading: "Uygulamalar yükleniyor...",
			errorLoading: "Uygulama verileri yüklenemedi. Lütfen tekrar deneyin.",
			searchPlaceholder: "Uygulama ara...",
			noAppsFound: "Aramanızla eşleşen uygulama bulunamadı.",
			backButton: "Listeye geri dön",
			installButton: "Yükle",
			updateButton: "Güncelle",
			removeButton: "Kaldır",
			installingMessage: "Şunun için yükleme simüle ediliyor: {{appName}}",
			removingMessage: "Şunun için kaldırma simüle ediliyor: {{appName}}",
			updatingMessage: "Şunun için güncelleme simüle ediliyor: {{appName}}",
			installedBadge: "Yüklendi"
		},
		notifications: {
			closeButtonAlt: "{fileName} için bildirimi kapat",
			uploading: "Yükleniyor... {progress}%",
			uploadComplete: "Yükleme Tamamlandı",
			uploadFailed: "Yükleme Başarısız Oldu",
			errorPrefix: "Hata:",
			unknownError: "Bilinmeyen bir hata oluştu.",
			copiedTitle: "Kopyalandı: {label}",
			copiedMessage: "Bağlantı panoya kopyalandı: {textToCopy}",
			copyFailedTitle: "Kopyalama Başarısız: {label}",
			copyFailedError: "Bağlantı panoya kopyalanamadı.",
			scalingTitle: "Ölçekleme Güncellendi: Eylem Gerekli",
			scalingMessage: "Yeni ölçekleme uygulandı. Değişiklikleri görmek için yeniden başlatın: kapsayıcıyı, oturumu kapatarak masaüstü oturumunuzu veya çalışan uygulamayı."
		},
		alerts: {
			invalidResolution: "Lütfen Genişlik ve Yükseklik için geçerli pozitif tam sayılar girin."
		},
		byteUnits: ["Bayt", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 Bayt",
		filesModal: {
			closeAlt: "Dosya modalını kapat",
			iframeTitle: "İndirilebilir Dosyalar"
		}
	},
	Am = {
		selkiesLogoAlt: "Logo Selkies",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "Cambia Tema",
		fullscreenTitle: "Entra in Schermo Intero",
		gamingModeTitle: "Modalità Gioco",
		buttons: {
			videoStreamEnableTitle: "Abilita Stream Video",
			videoStreamDisableTitle: "Disabilita Stream Video",
			audioStreamEnableTitle: "Abilita Stream Audio",
			audioStreamDisableTitle: "Disabilita Stream Audio",
			microphoneEnableTitle: "Abilita Microfono",
			microphoneDisableTitle: "Disabilita Microfono",
			gamepadEnableTitle: "Abilita Input Gamepad",
			gamepadDisableTitle: "Disabilita Input Gamepad",
			virtualKeyboardButtonTitle: "Mostra Tastiera",
			h264FullColorEnableTitle: "Abilita H.264 Colore Completo",
			h264FullColorDisableTitle: "Disabilita H.264 Colore Completo"
		},
		sections: {
			video: {
				title: "Impostazioni Video",
				encoderLabel: "Encoder:",
				framerateLabel: "Frame al secondo ({framerate} FPS):",
				bitrateLabel: "Bitrate Video ({bitrate} Mbps):",
				bufferLabelImmediate: "Dimensione Buffer Video (0 (Immediato)):",
				bufferLabelFrames: "Dimensione Buffer Video ({videoBufferSize} frame):",
				crfLabel: "CRF Video ({crf}):",
				fullColorLabel: "Colore Completo 4:4:4:"
			},
			audio: {
				title: "Impostazioni Audio",
				bitrateLabel: "Bitrate Audio ({bitrate} kbps):",
				inputLabel: "Input (Microfono):",
				outputLabel: "Output (Altoparlante):",
				outputNotSupported: "La selezione del dispositivo di output non è supportata da questo browser.",
				deviceErrorDefault: "Errore nell'elencare i dispositivi audio: {errorName}",
				deviceErrorPermission: "Permesso negato. Consenti l'accesso al microfono nelle impostazioni del browser per selezionare i dispositivi.",
				deviceErrorNotFound: "Nessun dispositivo audio trovato.",
				defaultInputLabelFallback: "Dispositivo di Input {index}",
				defaultOutputLabelFallback: "Dispositivo di Output {index}"
			},
			screen: {
				title: "Impostazioni Schermo",
				presetLabel: "Preimpostazione:",
				resolutionPresetSelect: "-- Seleziona Preimpostazione --",
				widthLabel: "Larghezza:",
				heightLabel: "Altezza:",
				widthPlaceholder: "es. 1920",
				heightPlaceholder: "es. 1080",
				setManualButton: "Imposta Risoluzione Manuale",
				resetButton: "Ripristina a Finestra",
				scaleLocallyLabel: "Scala Localmente:",
				scaleLocallyOn: "ON",
				scaleLocallyOff: "OFF",
				scaleLocallyTitleEnable: "Abilita Scala Locale (Mantieni Proporzioni)",
				scaleLocallyTitleDisable: "Disabilita Scala Locale (Usa Risoluzione Esatta)",
				uiScalingLabel: "Scala Interfaccia:",
				hidpiLabel: "HiDPI (Pixel Perfect)",
				hidpiEnableTitle: "Abilita HiDPI (Pixel Perfect)",
				hidpiDisableTitle: "Disabilita HiDPI (Usa ridimensionamento CSS)"
			},
			stats: {
				title: "Statistiche",
				cpuLabel: "CPU",
				gpuLabel: "Utilizzo GPU",
				sysMemLabel: "Mem Sistema",
				gpuMemLabel: "Mem GPU",
				fpsLabel: "FPS",
				audioLabel: "Audio",
				tooltipCpu: "Utilizzo CPU: {value}%",
				tooltipGpu: "Utilizzo GPU: {value}%",
				tooltipSysMem: "Memoria di Sistema: {used} / {total}",
				tooltipGpuMem: "Memoria GPU: {used} / {total}",
				tooltipFps: "FPS Client: {value}",
				tooltipAudio: "Buffer Audio: {value}",
				tooltipMemoryNA: "N/D"
			},
			clipboard: {
				title: "Appunti",
				label: "Appunti del Server:",
				placeholder: "Contenuto degli appunti dal server..."
			},
			files: {
				title: "File",
				uploadButton: "Carica File",
				uploadButtonTitle: "Carica file nella sessione remota",
				downloadButtonTitle: "Scarica File"
			},
			gamepads: {
				title: "Gamepad",
				noActivity: "Nessuna attività del gamepad ancora rilevata...",
				touchEnableTitle: "Abilita Gamepad Touch",
				touchDisableTitle: "Disabilita Gamepad Touch",
				touchActiveLabel: "Gamepad Touch: ON",
				touchInactiveLabel: "Gamepad Touch: OFF",
				physicalHiddenForTouch: "La visualizzazione dei gamepad fisici è nascosta mentre il gamepad touch è attivo.",
				noActivityMobileOrEnableTouch: "Nessun gamepad fisico. Abilita il gamepad touch o collega un controller."
			},
			apps: {
				title: "Applicazioni",
				openButtonTitle: "Gestisci Applicazioni",
				openButton: "Gestisci Applicazioni"
			},
			sharing: {
				title: "Condivisione"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (Laptop)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "Chiudi modale applicazioni",
			loading: "Caricamento applicazioni...",
			errorLoading: "Errore nel caricamento dei dati delle applicazioni. Riprova.",
			searchPlaceholder: "Cerca applicazioni...",
			noAppsFound: "Nessuna applicazione trovata corrispondente alla tua ricerca.",
			backButton: "Torna alla lista",
			installButton: "Installa",
			updateButton: "Aggiorna",
			removeButton: "Rimuovi",
			installingMessage: "Simulazione installazione per: {{appName}}",
			removingMessage: "Simulazione rimozione per: {{appName}}",
			updatingMessage: "Simulazione aggiornamento per: {{appName}}",
			installedBadge: "Installato"
		},
		notifications: {
			closeButtonAlt: "Chiudi notifica per {fileName}",
			uploading: "Caricamento... {progress}%",
			uploadComplete: "Caricamento Completato",
			uploadFailed: "Caricamento Fallito",
			errorPrefix: "Errore:",
			unknownError: "Si è verificato un errore sconosciuto.",
			copiedTitle: "Copiato: {label}",
			copiedMessage: "Link copiato negli appunti: {textToCopy}",
			copyFailedTitle: "Copia Fallita: {label}",
			copyFailedError: "Impossibile copiare il link negli appunti.",
			scalingTitle: "Scalabilità Aggiornata: Azione Richiesta",
			scalingMessage: "Nuova scalabilità applicata. Per visualizzare le modifiche, riavviare: il contenitore, la sessione del desktop disconnettendosi, o l'applicazione in esecuzione."
		},
		alerts: {
			invalidResolution: "Inserisci numeri interi positivi validi per Larghezza e Altezza."
		},
		byteUnits: ["Byte", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 Byte",
		filesModal: {
			closeAlt: "Chiudi modale file",
			iframeTitle: "File Scaricabili"
		}
	},
	Em = {
		selkiesLogoAlt: "Selkies Logo",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "Thema wisselen",
		fullscreenTitle: "Volledig scherm openen",
		gamingModeTitle: "Gaming Modus",
		buttons: {
			videoStreamEnableTitle: "Videostream inschakelen",
			videoStreamDisableTitle: "Videostream uitschakelen",
			audioStreamEnableTitle: "Audiostream inschakelen",
			audioStreamDisableTitle: "Audiostream uitschakelen",
			microphoneEnableTitle: "Microfoon inschakelen",
			microphoneDisableTitle: "Microfoon uitschakelen",
			gamepadEnableTitle: "Gamepad-invoer inschakelen",
			gamepadDisableTitle: "Gamepad-invoer uitschakelen",
			virtualKeyboardButtonTitle: "Toetsenbord Weergeven",
			h264FullColorEnableTitle: "H.264 Volledige Kleur inschakelen",
			h264FullColorDisableTitle: "H.264 Volledige Kleur uitschakelen"
		},
		sections: {
			video: {
				title: "Video-instellingen",
				encoderLabel: "Encoder:",
				framerateLabel: "Frames per seconde ({framerate} FPS):",
				bitrateLabel: "Video Bitrate ({bitrate} Mbps):",
				bufferLabelImmediate: "Video Buffergrootte (0 (Onmiddellijk)):",
				bufferLabelFrames: "Video Buffergrootte ({videoBufferSize} frames):",
				crfLabel: "Video CRF ({crf}):",
				fullColorLabel: "Volledige Kleur 4:4:4:"
			},
			audio: {
				title: "Audio-instellingen",
				bitrateLabel: "Audio Bitrate ({bitrate} kbps):",
				inputLabel: "Invoer (Microfoon):",
				outputLabel: "Uitvoer (Luidspreker):",
				outputNotSupported: "Selectie van uitvoerapparaat wordt niet ondersteund door deze browser.",
				deviceErrorDefault: "Fout bij het ophalen van audioapparaten: {errorName}",
				deviceErrorPermission: "Toestemming geweigerd. Sta microfoontoegang toe in browserinstellingen om apparaten te selecteren.",
				deviceErrorNotFound: "Geen audioapparaten gevonden.",
				defaultInputLabelFallback: "Invoerapparaat {index}",
				defaultOutputLabelFallback: "Uitvoerapparaat {index}"
			},
			screen: {
				title: "Scherminstellingen",
				presetLabel: "Voorinstelling:",
				resolutionPresetSelect: "-- Selecteer Voorinstelling --",
				widthLabel: "Breedte:",
				heightLabel: "Hoogte:",
				widthPlaceholder: "bijv. 1920",
				heightPlaceholder: "bijv. 1080",
				setManualButton: "Handmatige Resolutie Instellen",
				resetButton: "Terugzetten naar Venster",
				scaleLocallyLabel: "Lokaal Schalen:",
				scaleLocallyOn: "AAN",
				scaleLocallyOff: "UIT",
				scaleLocallyTitleEnable: "Lokaal Schalen Inschakelen (Beeldverhouding Behouden)",
				scaleLocallyTitleDisable: "Lokaal Schalen Uitschakelen (Exacte Resolutie Gebruiken)",
				uiScalingLabel: "UI Schalen:",
				hidpiLabel: "HiDPI (Pixel Perfect)",
				hidpiEnableTitle: "HiDPI inschakelen (Pixel Perfect)",
				hidpiDisableTitle: "HiDPI uitschakelen (CSS-schaling gebruiken)"
			},
			stats: {
				title: "Statistieken",
				cpuLabel: "CPU",
				gpuLabel: "GPU Gebruik",
				sysMemLabel: "Sys Geheugen",
				gpuMemLabel: "GPU Geheugen",
				fpsLabel: "FPS",
				audioLabel: "Audio",
				tooltipCpu: "CPU Gebruik: {value}%",
				tooltipGpu: "GPU Gebruik: {value}%",
				tooltipSysMem: "Systeemgeheugen: {used} / {total}",
				tooltipGpuMem: "GPU Geheugen: {used} / {total}",
				tooltipFps: "Client FPS: {value}",
				tooltipAudio: "Audio Buffers: {value}",
				tooltipMemoryNA: "N.v.t."
			},
			clipboard: {
				title: "Klembord",
				label: "Server Klembord:",
				placeholder: "Klembord inhoud van server..."
			},
			files: {
				title: "Bestanden",
				uploadButton: "Bestanden Uploaden",
				uploadButtonTitle: "Upload bestanden naar de externe sessie",
				downloadButtonTitle: "Bestanden Downloaden"
			},
			gamepads: {
				title: "Gamepads",
				noActivity: "Nog geen gamepad activiteit gedetecteerd...",
				touchEnableTitle: "Touch Gamepad inschakelen",
				touchDisableTitle: "Touch Gamepad uitschakelen",
				touchActiveLabel: "Touch Gamepad: AAN",
				touchInactiveLabel: "Touch Gamepad: UIT",
				physicalHiddenForTouch: "Weergave van fysieke gamepads is verborgen terwijl de touch gamepad actief is.",
				noActivityMobileOrEnableTouch: "Geen fysieke gamepads. Schakel de touch gamepad in of sluit een controller aan."
			},
			apps: {
				title: "Applicaties",
				openButtonTitle: "Applicaties beheren",
				openButton: "Applicaties beheren"
			},
			sharing: {
				title: "Delen"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (Laptop)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "Applicatiemodal sluiten",
			loading: "Applicaties laden...",
			errorLoading: "Fout bij het laden van applicatiegegevens. Probeer het opnieuw.",
			searchPlaceholder: "Zoek applicaties...",
			noAppsFound: "Geen applicaties gevonden die overeenkomen met uw zoekopdracht.",
			backButton: "Terug naar lijst",
			installButton: "Installeren",
			updateButton: "Bijwerken",
			removeButton: "Verwijderen",
			installingMessage: "Simulatie van installatie voor: {{appName}}",
			removingMessage: "Simulatie van verwijdering voor: {{appName}}",
			updatingMessage: "Simulatie van update voor: {{appName}}",
			installedBadge: "Geïnstalleerd"
		},
		notifications: {
			closeButtonAlt: "Melding sluiten voor {fileName}",
			uploading: "Uploaden... {progress}%",
			uploadComplete: "Upload Voltooid",
			uploadFailed: "Upload Mislukt",
			errorPrefix: "Fout:",
			unknownError: "Er is een onbekende fout opgetreden.",
			copiedTitle: "Gekopieerd: {label}",
			copiedMessage: "Link gekopieerd naar klembord: {textToCopy}",
			copyFailedTitle: "Kopiëren Mislukt: {label}",
			copyFailedError: "Kon link niet naar klembord kopiëren.",
			scalingTitle: "Schalen bijgewerkt: Actie vereist",
			scalingMessage: "Nieuwe schaling toegepast. Om wijzigingen te zien, herstart: de container, uw bureaubladsessie door uit te loggen, of de actieve applicatie."
		},
		alerts: {
			invalidResolution: "Voer geldige positieve gehele getallen in voor Breedte en Hoogte."
		},
		byteUnits: ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 Bytes",
		filesModal: {
			closeAlt: "Bestandsmodal sluiten",
			iframeTitle: "Downloadbare bestanden"
		}
	},
	Mm = {
		selkiesLogoAlt: "شعار Selkies",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "تبديل السمة",
		fullscreenTitle: "الدخول في وضع ملء الشاشة",
		gamingModeTitle: "وضع الألعاب",
		buttons: {
			videoStreamEnableTitle: "تمكين بث الفيديو",
			videoStreamDisableTitle: "تعطيل بث الفيديو",
			audioStreamEnableTitle: "تمكين بث الصوت",
			audioStreamDisableTitle: "تعطيل بث الصوت",
			microphoneEnableTitle: "تمكين الميكروفون",
			microphoneDisableTitle: "تعطيل الميكروفون",
			gamepadEnableTitle: "تمكين إدخال لوحة الألعاب",
			gamepadDisableTitle: "تعطيل إدخال لوحة الألعاب",
			virtualKeyboardButtonTitle: "إظهار لوحة المفاتيح",
			h264FullColorEnableTitle: "تمكين H.264 ألوان كاملة",
			h264FullColorDisableTitle: "تعطيل H.264 ألوان كاملة"
		},
		sections: {
			video: {
				title: "إعدادات الفيديو",
				encoderLabel: "المُرمّز:",
				framerateLabel: "إطارات في الثانية ({framerate} FPS):",
				bitrateLabel: "معدل بت الفيديو ({bitrate} Mbps):",
				bufferLabelImmediate: "حجم مخزن الفيديو المؤقت (0 (فوري)):",
				bufferLabelFrames: "حجم مخزن الفيديو المؤقت ({videoBufferSize} إطارات):",
				crfLabel: "CRF الفيديو ({crf}):",
				fullColorLabel: "ألوان كاملة 4:4:4:"
			},
			audio: {
				title: "إعدادات الصوت",
				bitrateLabel: "معدل بت الصوت ({bitrate} kbps):",
				inputLabel: "الإدخال (الميكروفون):",
				outputLabel: "الإخراج (مكبر الصوت):",
				outputNotSupported: "اختيار جهاز الإخراج غير مدعوم بواسطة هذا المتصفح.",
				deviceErrorDefault: "خطأ في سرد أجهزة الصوت: {errorName}",
				deviceErrorPermission: "تم رفض الإذن. يرجى السماح بالوصول إلى الميكروفون في إعدادات المتصفح لتحديد الأجهزة.",
				deviceErrorNotFound: "لم يتم العثور على أجهزة صوت.",
				defaultInputLabelFallback: "جهاز الإدخال {index}",
				defaultOutputLabelFallback: "جهاز الإخراج {index}"
			},
			screen: {
				title: "إعدادات الشاشة",
				presetLabel: "إعداد مسبق:",
				resolutionPresetSelect: "-- تحديد إعداد مسبق --",
				widthLabel: "العرض:",
				heightLabel: "الارتفاع:",
				widthPlaceholder: "مثال، 1920",
				heightPlaceholder: "مثال، 1080",
				setManualButton: "تعيين دقة يدوية",
				resetButton: "إعادة التعيين إلى النافذة",
				scaleLocallyLabel: "تغيير الحجم محليًا:",
				scaleLocallyOn: "تشغيل",
				scaleLocallyOff: "إيقاف",
				scaleLocallyTitleEnable: "تمكين تغيير الحجم المحلي (الحفاظ على نسبة العرض إلى الارتفاع)",
				scaleLocallyTitleDisable: "تعطيل تغيير الحجم المحلي (استخدام الدقة الدقيقة)",
				uiScalingLabel: "مقياس واجهة المستخدم:",
				hidpiLabel: "HiDPI (دقة بكسل م��الية)",
				hidpiEnableTitle: "تمكين HiDPI (دقة بكس�� مثالية)",
				hidpiDisableTitle: "تعطيل HiDPI (استخدام تحجيم CSS)"
			},
			stats: {
				title: "الإحصائيات",
				cpuLabel: "CPU",
				gpuLabel: "استخدام GPU",
				sysMemLabel: "ذاكرة النظام",
				gpuMemLabel: "ذاكرة GPU",
				fpsLabel: "FPS",
				audioLabel: "الصوت",
				tooltipCpu: "استخدام CPU: {value}%",
				tooltipGpu: "استخدام GPU: {value}%",
				tooltipSysMem: "ذاكرة النظام: {used} / {total}",
				tooltipGpuMem: "ذاكرة GPU: {used} / {total}",
				tooltipFps: "FPS العميل: {value}",
				tooltipAudio: "مخازن الصوت المؤقتة: {value}",
				tooltipMemoryNA: "غير متاح"
			},
			clipboard: {
				title: "الحافظة",
				label: "حافظة الخادم:",
				placeholder: "محتوى الحافظة من الخادم..."
			},
			files: {
				title: "الملفات",
				uploadButton: "تحميل الملفات",
				uploadButtonTitle: "تحميل الملفات إلى الجلسة البعيدة",
				downloadButtonTitle: "تحميل الملفات"
			},
			gamepads: {
				title: "لوحات الألعاب",
				noActivity: "لم يتم اكتشاف أي نشاط للوحة الألعاب بعد...",
				touchEnableTitle: "تمكين لوحة ألعاب اللمس",
				touchDisableTitle: "تعطيل لوحة ألعاب اللمس",
				touchActiveLabel: "لوحة ألعاب اللمس: تشغيل",
				touchInactiveLabel: "لوحة ألعاب اللمس: إيقاف",
				physicalHiddenForTouch: "يتم إخفاء عرض لوحة الألعاب الفعلية أثناء تنشيط لوحة ألعاب اللمس.",
				noActivityMobileOrEnableTouch: "لا توجد لوحات ألعاب فعلية. قم بتمكين لوحة ألعاب اللمس أو قم بتوصيل وحدة تحكم."
			},
			apps: {
				title: "التطبيقات",
				openButtonTitle: "إدارة التطبيقات",
				openButton: "إدارة التطبيقات"
			},
			sharing: {
				title: "المشاركة"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 × 1080 (FHD)",
			"1280x720": "1280 × 720 (HD)",
			"1366x768": "1366 × 768 (لابتوب)",
			"1920x1200": "1920 × 1200 (16:10)",
			"2560x1440": "2560 × 1440 (QHD)",
			"3840x2160": "3840 × 2160 (4K UHD)",
			"1024x768": "1024 × 768 (XGA 4:3)",
			"800x600": "800 × 600 (SVGA 4:3)",
			"640x480": "640 × 480 (VGA 4:3)",
			"320x240": "320 × 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "إغلاق نافذة التطبيقات",
			loading: "جارٍ تحميل التطبيقات...",
			errorLoading: "فشل تحميل بيانات التطبيقات. يرجى المحاولة مرة أخرى.",
			searchPlaceholder: "البحث في التطبيقات...",
			noAppsFound: "لم يتم العثور على تطبيقات تطابق بحثك.",
			backButton: "العودة إلى القائمة",
			installButton: "تثبيت",
			updateButton: "تحديث",
			removeButton: "إزالة",
			installingMessage: "محاكاة التثبيت لـ: {{appName}}",
			removingMessage: "محاكاة الإزالة لـ: {{appName}}",
			updatingMessage: "محاكاة التحديث لـ: {{appName}}",
			installedBadge: "مثبت"
		},
		notifications: {
			closeButtonAlt: "إغلاق الإشعار لـ {fileName}",
			uploading: "جارٍ التحميل... {progress}%",
			uploadComplete: "اكتمل التحميل",
			uploadFailed: "فشل التحميل",
			errorPrefix: "خطأ:",
			unknownError: "حدث خطأ غير معروف.",
			copiedTitle: "تم النسخ: {label}",
			copiedMessage: "تم نسخ الرابط إلى الحافظة: {textToCopy}",
			copyFailedTitle: "فشل النسخ: {label}",
			copyFailedError: "تعذر نسخ الرابط إلى الحافظة.",
			scalingTitle: "تم تحديث القياس: الإجراء مطلوب",
			scalingMessage: "تم تطبيق القياس الجديد. لرؤية التغييرات، أعد تشغيل: الحاوية، أو جلسة سطح المكتب الخاصة بك عن طريق تسجيل الخروج، أو التطبيق قيد التشغيل."
		},
		alerts: {
			invalidResolution: "الرجاء إدخال أعداد صحيحة موجبة صالحة للعرض والارتفاع."
		},
		byteUnits: ["بايت", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 بايت",
		filesModal: {
			closeAlt: "إغلاق نافذة الملفات",
			iframeTitle: "ملفات قابلة للتحميل"
		}
	},
	Lm = {
		selkiesLogoAlt: "Selkies 로고",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "테마 전환",
		fullscreenTitle: "전체 화면 시작",
		gamingModeTitle: "게임 모드",
		buttons: {
			videoStreamEnableTitle: "비디오 스트림 활성화",
			videoStreamDisableTitle: "비디오 스트림 비활성화",
			audioStreamEnableTitle: "오디오 스트림 활성화",
			audioStreamDisableTitle: "오디오 스트림 비활성화",
			microphoneEnableTitle: "마이크 활성화",
			microphoneDisableTitle: "마이크 비활성화",
			gamepadEnableTitle: "게임패드 입력 활성화",
			gamepadDisableTitle: "게임패드 입력 비활성화",
			virtualKeyboardButtonTitle: "키보드 표시",
			h264FullColorEnableTitle: "H.264 전체 색상 활성화",
			h264FullColorDisableTitle: "H.264 전체 색상 비활성화"
		},
		sections: {
			video: {
				title: "비디오 설정",
				encoderLabel: "인코더:",
				framerateLabel: "초당 프레임 ({framerate} FPS):",
				bitrateLabel: "비디오 비트 전송률 ({bitrate} Mbps):",
				bufferLabelImmediate: "비디오 버퍼 크기 (0 (즉시)):",
				bufferLabelFrames: "비디오 버퍼 크기 ({videoBufferSize} 프레임):",
				crfLabel: "비디오 CRF ({crf}):",
				fullColorLabel: "전체 색상 4:4:4:"
			},
			audio: {
				title: "오디오 설정",
				bitrateLabel: "오디오 비트 전송률 ({bitrate} kbps):",
				inputLabel: "입력 (마이크):",
				outputLabel: "출력 (스피커):",
				outputNotSupported: "이 브라우저에서는 출력 장치 선택을 지원하지 않습니다.",
				deviceErrorDefault: "오디오 장치 목록 오류: {errorName}",
				deviceErrorPermission: "권한이 거부되었습니다. 장치를 선택하려면 브라우저 설정에서 마이크 액세스를 허용하십시오.",
				deviceErrorNotFound: "오디오 장치를 찾을 수 없습니다.",
				defaultInputLabelFallback: "입력 장치 {index}",
				defaultOutputLabelFallback: "출력 장치 {index}"
			},
			screen: {
				title: "화면 설정",
				presetLabel: "프리셋:",
				resolutionPresetSelect: "-- 프리셋 선택 --",
				widthLabel: "너비:",
				heightLabel: "높이:",
				widthPlaceholder: "예: 1920",
				heightPlaceholder: "예: 1080",
				setManualButton: "수동 해상도 설정",
				resetButton: "창으로 재설정",
				scaleLocallyLabel: "로컬 스케일링:",
				scaleLocallyOn: "켜짐",
				scaleLocallyOff: "꺼짐",
				scaleLocallyTitleEnable: "로컬 스케일링 활성화 (종횡비 유지)",
				scaleLocallyTitleDisable: "로컬 스케일링 비활성화 (정확한 해상도 사용)",
				uiScalingLabel: "UI 스케일링:",
				hidpiLabel: "HiDPI (픽셀 퍼펙트)",
				hidpiEnableTitle: "HiDPI 활성화 (픽셀 퍼펙트)",
				hidpiDisableTitle: "HiDPI 비활성화 (CSS 스케일링 사용)"
			},
			stats: {
				title: "통계",
				cpuLabel: "CPU",
				gpuLabel: "GPU 사용량",
				sysMemLabel: "시스템 메모리",
				gpuMemLabel: "GPU 메모리",
				fpsLabel: "FPS",
				audioLabel: "오디오",
				tooltipCpu: "CPU 사용량: {value}%",
				tooltipGpu: "GPU 사용량: {value}%",
				tooltipSysMem: "시스템 메모리: {used} / {total}",
				tooltipGpuMem: "GPU 메모리: {used} / {total}",
				tooltipFps: "클라이언트 FPS: {value}",
				tooltipAudio: "오디오 버퍼: {value}",
				tooltipMemoryNA: "해당 없음"
			},
			clipboard: {
				title: "클립보드",
				label: "서버 클립보드:",
				placeholder: "서버의 클립보드 내용..."
			},
			files: {
				title: "파일",
				uploadButton: "파일 업로드",
				uploadButtonTitle: "원격 세션에 파일 업로드",
				downloadButtonTitle: "파일 다운로드"
			},
			gamepads: {
				title: "게임패드",
				noActivity: "아직 게임패드 활동이 감지되지 않았습니다...",
				touchEnableTitle: "터치 게임패드 활성화",
				touchDisableTitle: "터치 게임패드 비활성화",
				touchActiveLabel: "터치 게임패드: 켜짐",
				touchInactiveLabel: "터치 게임패드: 꺼짐",
				physicalHiddenForTouch: "터치 게임패드가 활성화되어 있는 동안에는 물리적 게임패드 표시가 숨겨집니다.",
				noActivityMobileOrEnableTouch: "물리적 게임패드가 없습니다. 터치 게임패드를 활성화하거나 컨트롤러를 연결하십시오."
			},
			apps: {
				title: "앱",
				openButtonTitle: "앱 관리",
				openButton: "앱 관리"
			},
			sharing: {
				title: "공유"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (노트북)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "앱 모달 닫기",
			loading: "앱 로드 중...",
			errorLoading: "앱 데이터 로드 실패. 다시 시도하십시오.",
			searchPlaceholder: "앱 검색...",
			noAppsFound: "검색과 일치하는 앱을 찾을 수 없습니다.",
			backButton: "목록으로 돌아가기",
			installButton: "설치",
			updateButton: "업데이트",
			removeButton: "제거",
			installingMessage: "{{appName}} 설치 시뮬레이션 중",
			removingMessage: "{{appName}} 제거 시뮬레이션 중",
			updatingMessage: "{{appName}} 업데이트 시뮬레이션 중",
			installedBadge: "설치됨"
		},
		notifications: {
			closeButtonAlt: "{fileName} 알림 닫기",
			uploading: "업로드 중... {progress}%",
			uploadComplete: "업로드 완료",
			uploadFailed: "업로드 실패",
			errorPrefix: "오류:",
			unknownError: "알 수 없는 오류가 발생했습니다.",
			copiedTitle: "복사됨: {label}",
			copiedMessage: "링크가 클립보드에 복사되었습니다: {textToCopy}",
			copyFailedTitle: "복사 실패: {label}",
			copyFailedError: "링크를 클립보드에 복사할 수 없습니다.",
			scalingTitle: "확장/축소 업데이트됨: 작업 필요",
			scalingMessage: "새로운 확장이 적용되었습니다. 변경 사항을 보려면 다음을 다시 시작하십시오: 컨테이너, 로그아웃하여 데스크톱 세션, 또는 실행 중인 애플리케이션."
		},
		alerts: {
			invalidResolution: "너비와 높이에 유효한 양의 정수를 입력하십시오."
		},
		byteUnits: ["바이트", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 바이트",
		filesModal: {
			closeAlt: "파일 모달 닫기",
			iframeTitle: "다운로드 가능한 파일"
		}
	},
	Dm = {
		selkiesLogoAlt: "Selkies ロゴ",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "テーマを切り替え",
		fullscreenTitle: "フルスクリーンに入る",
		gamingModeTitle: "ゲームモード",
		buttons: {
			videoStreamEnableTitle: "ビデオストリームを有効にする",
			videoStreamDisableTitle: "ビデオストリームを無効にする",
			audioStreamEnableTitle: "オーディオストリームを有効にする",
			audioStreamDisableTitle: "オーディオストリームを無効にする",
			microphoneEnableTitle: "マイクを有効にする",
			microphoneDisableTitle: "マイクを無効にする",
			gamepadEnableTitle: "ゲームパッド入力を有効にする",
			gamepadDisableTitle: "ゲームパッド入力を無効にする",
			virtualKeyboardButtonTitle: "キーボードを表示",
			h264FullColorEnableTitle: "H.264 フルカラーを有効にする",
			h264FullColorDisableTitle: "H.264 フルカラーを無効にする"
		},
		sections: {
			video: {
				title: "ビデオ設定",
				encoderLabel: "エンコーダー:",
				framerateLabel: "フレーム/秒 ({framerate} FPS):",
				bitrateLabel: "ビデオビットレート ({bitrate} Mbps):",
				bufferLabelImmediate: "ビデオバッファサイズ (0 (即時)):",
				bufferLabelFrames: "ビデオバッファサイズ ({videoBufferSize} フレーム):",
				crfLabel: "ビデオ CRF ({crf}):",
				fullColorLabel: "フルカラー 4:4:4:"
			},
			audio: {
				title: "オーディオ設定",
				bitrateLabel: "オーディオビットレート ({bitrate} kbps):",
				inputLabel: "入力 (マイク):",
				outputLabel: "出力 (スピーカー):",
				outputNotSupported: "このブラウザでは出力デバイスの選択はサポートされていません。",
				deviceErrorDefault: "オーディオデバイスのリスト表示エラー: {errorName}",
				deviceErrorPermission: "権限が拒否されました。デバイスを選択するには、ブラウザ設定でマイクへのアクセスを許可してください。",
				deviceErrorNotFound: "オーディオデバイスが見つかりません。",
				defaultInputLabelFallback: "入力デバイス {index}",
				defaultOutputLabelFallback: "出力デバイス {index}"
			},
			screen: {
				title: "画面設定",
				presetLabel: "プリセット:",
				resolutionPresetSelect: "-- プリセットを選択 --",
				widthLabel: "幅:",
				heightLabel: "高さ:",
				widthPlaceholder: "例: 1920",
				heightPlaceholder: "例: 1080",
				setManualButton: "手動解像度を設定",
				resetButton: "ウィンドウにリセット",
				scaleLocallyLabel: "ローカルでスケーリング:",
				scaleLocallyOn: "オン",
				scaleLocallyOff: "オフ",
				scaleLocallyTitleEnable: "ローカルスケーリングを有効にする (アスペクト比を維持)",
				scaleLocallyTitleDisable: "ローカルスケーリングを無効にする (正確な解像度を使用)",
				uiScalingLabel: "UI スケーリング:",
				hidpiLabel: "HiDPI (ピクセルパーフェクト)",
				hidpiEnableTitle: "HiDPI を有効にする (ピクセルパーフェクト)",
				hidpiDisableTitle: "HiDPI を無効にする (CSS スケーリングを使用)"
			},
			stats: {
				title: "統計",
				cpuLabel: "CPU",
				gpuLabel: "GPU 使用率",
				sysMemLabel: "システムメモリ",
				gpuMemLabel: "GPU メモリ",
				fpsLabel: "FPS",
				audioLabel: "オーディオ",
				tooltipCpu: "CPU 使用率: {value}%",
				tooltipGpu: "GPU 使用率: {value}%",
				tooltipSysMem: "システムメモリ: {used} / {total}",
				tooltipGpuMem: "GPU メモリ: {used} / {total}",
				tooltipFps: "クライアント FPS: {value}",
				tooltipAudio: "オーディオバッファ: {value}",
				tooltipMemoryNA: "N/A"
			},
			clipboard: {
				title: "クリップボード",
				label: "サーバークリップボード:",
				placeholder: "サーバーからのクリップボードの内容..."
			},
			files: {
				title: "ファイル",
				uploadButton: "ファイルをアップロード",
				uploadButtonTitle: "リモートセッションにファイルをアップロード",
				downloadButtonTitle: "ファイルをダウンロード"
			},
			gamepads: {
				title: "ゲームパッド",
				noActivity: "まだゲームパッドのアクティビティが検出されていません...",
				touchEnableTitle: "タッチゲームパッドを有効にする",
				touchDisableTitle: "タッチゲームパッドを無効にする",
				touchActiveLabel: "タッチゲームパッド: オン",
				touchInactiveLabel: "タッチゲームパッド: オフ",
				physicalHiddenForTouch: "タッチゲームパッドがアクティブな間、物理ゲームパッドの表示は非表示になります。",
				noActivityMobileOrEnableTouch: "物理ゲームパッドがありません。タッチゲームパッドを有効にするか、コントローラーを接続してください。"
			},
			apps: {
				title: "アプリ",
				openButtonTitle: "アプリを管理",
				openButton: "アプリを管理"
			},
			sharing: {
				title: "共有"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (ラップトップ)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "アプリモーダルを閉じる",
			loading: "アプリを読み込み中...",
			errorLoading: "アプリデータの読み込みに失敗しました。もう一度お試しください。",
			searchPlaceholder: "アプリを検索...",
			noAppsFound: "検索に一致するアプリが見つかりません。",
			backButton: "リストに戻る",
			installButton: "インストール",
			updateButton: "更新",
			removeButton: "削除",
			installingMessage: "{{appName}} のインストールをシミュレートしています",
			removingMessage: "{{appName}} の削除をシミュレートしています",
			updatingMessage: "{{appName}} の更新をシミュレートしています",
			installedBadge: "インストール済み"
		},
		notifications: {
			closeButtonAlt: "{fileName} の通知を閉じる",
			uploading: "アップロード中... {progress}%",
			uploadComplete: "アップロード完了",
			uploadFailed: "アップロード失敗",
			errorPrefix: "エラー:",
			unknownError: "不明なエラーが発生しました。",
			copiedTitle: "コピーしました: {label}",
			copiedMessage: "リンクをクリップボードにコピーしました: {textToCopy}",
			copyFailedTitle: "コピーに失敗しました: {label}",
			copyFailedError: "リンクをクリップボードにコピーできませんでした。",
			scalingTitle: "スケーリング更新：アクションが必要です",
			scalingMessage: "新しいスケーリングが適用されました。変更を確認するには、コンテナ、ログア���トによるデスクトップセッション、または実行中のアプリケーションを再起動してください。"
		},
		alerts: {
			invalidResolution: "幅と高さに有効な正の整数を入力してください。"
		},
		byteUnits: ["バイト", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 バイト",
		filesModal: {
			closeAlt: "ファイルモーダルを閉じる",
			iframeTitle: "ダウンロード可能なファイル"
		}
	},
	Bm = {
		selkiesLogoAlt: "Logo Selkies",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "Chuyển đổi Chủ đề",
		fullscreenTitle: "Vào Toàn màn hình",
		gamingModeTitle: "Chế độ Chơi game",
		buttons: {
			videoStreamEnableTitle: "Bật Luồng Video",
			videoStreamDisableTitle: "Tắt Luồng Video",
			audioStreamEnableTitle: "Bật Luồng Âm thanh",
			audioStreamDisableTitle: "Tắt Luồng Âm thanh",
			microphoneEnableTitle: "Bật Micro",
			microphoneDisableTitle: "Tắt Micro",
			gamepadEnableTitle: "Bật Đầu vào Tay cầm chơi game",
			gamepadDisableTitle: "Tắt Đầu vào Tay cầm chơi game",
			virtualKeyboardButtonTitle: "Hiển thị Bàn phím",
			h264FullColorEnableTitle: "Bật H.264 Đầy đủ Màu sắc",
			h264FullColorDisableTitle: "Tắt H.264 Đầy đủ Màu sắc"
		},
		sections: {
			video: {
				title: "Cài đặt Video",
				encoderLabel: "Bộ mã hóa:",
				framerateLabel: "Khung hình mỗi giây ({framerate} FPS):",
				bitrateLabel: "Tốc độ bit Video ({bitrate} Mbps):",
				bufferLabelImmediate: "Kích thước Bộ đệm Video (0 (Ngay lập tức)):",
				bufferLabelFrames: "Kích thước Bộ đệm Video ({videoBufferSize} khung hình):",
				crfLabel: "CRF Video ({crf}):",
				fullColorLabel: "Đầy đủ Màu sắc 4:4:4:"
			},
			audio: {
				title: "Cài đặt Âm thanh",
				bitrateLabel: "Tốc độ bit Âm thanh ({bitrate} kbps):",
				inputLabel: "Đầu vào (Micro):",
				outputLabel: "Đầu ra (Loa):",
				outputNotSupported: "Trình duyệt này không hỗ trợ chọn thiết bị đầu ra.",
				deviceErrorDefault: "Lỗi liệt kê thiết bị âm thanh: {errorName}",
				deviceErrorPermission: "Quyền bị từ chối. Vui lòng cho phép truy cập micro trong cài đặt trình duyệt để chọn thiết bị.",
				deviceErrorNotFound: "Không tìm thấy thiết bị âm thanh nào.",
				defaultInputLabelFallback: "Thiết bị Đầu vào {index}",
				defaultOutputLabelFallback: "Thiết bị Đầu ra {index}"
			},
			screen: {
				title: "Cài đặt Màn hình",
				presetLabel: "Cài đặt sẵn:",
				resolutionPresetSelect: "-- Chọn Cài đặt sẵn --",
				widthLabel: "Chiều rộng:",
				heightLabel: "Chiều cao:",
				widthPlaceholder: "ví dụ: 1920",
				heightPlaceholder: "ví dụ: 1080",
				setManualButton: "Đặt Độ phân giải Thủ công",
				resetButton: "Đặt lại về Cửa sổ",
				scaleLocallyLabel: "Co giãn Cục bộ:",
				scaleLocallyOn: "BẬT",
				scaleLocallyOff: "TẮT",
				scaleLocallyTitleEnable: "Bật Co giãn Cục bộ (Giữ Tỷ lệ khung hình)",
				scaleLocallyTitleDisable: "Tắt Co giãn Cục bộ (Sử dụng Độ phân giải Chính xác)",
				uiScalingLabel: "Tỷ lệ Giao diện:",
				hidpiLabel: "HiDPI (Hoàn hảo đến từng Pixel)",
				hidpiEnableTitle: "Bật HiDPI (Hoàn hảo đến từng Pixel)",
				hidpiDisableTitle: "Tắt HiDPI (Sử dụng CSS Scaling)"
			},
			stats: {
				title: "Thống kê",
				cpuLabel: "CPU",
				gpuLabel: "Sử dụng GPU",
				sysMemLabel: "Bộ nhớ Hệ thống",
				gpuMemLabel: "Bộ nhớ GPU",
				fpsLabel: "FPS",
				audioLabel: "Âm thanh",
				tooltipCpu: "Sử dụng CPU: {value}%",
				tooltipGpu: "Sử dụng GPU: {value}%",
				tooltipSysMem: "Bộ nhớ Hệ thống: {used} / {total}",
				tooltipGpuMem: "Bộ nhớ GPU: {used} / {total}",
				tooltipFps: "FPS Máy khách: {value}",
				tooltipAudio: "Bộ đệm Âm thanh: {value}",
				tooltipMemoryNA: "Không có"
			},
			clipboard: {
				title: "Bộ nhớ tạm",
				label: "Bộ nhớ tạm Máy chủ:",
				placeholder: "Nội dung bộ nhớ tạm từ máy chủ..."
			},
			files: {
				title: "Tệp",
				uploadButton: "Tải lên Tệp",
				uploadButtonTitle: "Tải tệp lên phiên làm việc từ xa",
				downloadButtonTitle: "Tải xuống Tệp"
			},
			gamepads: {
				title: "Tay cầm chơi game",
				noActivity: "Chưa phát hiện hoạt động nào của tay cầm chơi game...",
				touchEnableTitle: "Bật Tay cầm cảm ứng",
				touchDisableTitle: "Tắt Tay cầm cảm ứng",
				touchActiveLabel: "Tay cầm cảm ứng: BẬT",
				touchInactiveLabel: "Tay cầm cảm ứng: TẮT",
				physicalHiddenForTouch: "Màn hình tay cầm vật lý bị ẩn khi tay cầm cảm ứng đang hoạt động.",
				noActivityMobileOrEnableTouch: "Không có tay cầm vật lý. Bật tay cầm cảm ứng hoặc kết nối bộ điều khiển."
			},
			apps: {
				title: "Ứng dụng",
				openButtonTitle: "Quản lý Ứng dụng",
				openButton: "Quản lý Ứng dụng"
			},
			sharing: {
				title: "Chia sẻ"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (Máy tính xách tay)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "Đóng modal ứng dụng",
			loading: "Đang tải ứng dụng...",
			errorLoading: "Tải dữ liệu ứng dụng thất bại. Vui lòng thử lại.",
			searchPlaceholder: "Tìm kiếm ứng dụng...",
			noAppsFound: "Không tìm thấy ứng dụng nào khớp với tìm kiếm của bạn.",
			backButton: "Quay lại danh sách",
			installButton: "Cài đặt",
			updateButton: "Cập nhật",
			removeButton: "Gỡ bỏ",
			installingMessage: "Mô phỏng cài đặt cho: {{appName}}",
			removingMessage: "Mô phỏng gỡ bỏ cho: {{appName}}",
			updatingMessage: "Mô phỏng cập nhật cho: {{appName}}",
			installedBadge: "Đã cài đặt"
		},
		notifications: {
			closeButtonAlt: "Đóng thông báo cho {fileName}",
			uploading: "Đang tải lên... {progress}%",
			uploadComplete: "Tải lên Hoàn tất",
			uploadFailed: "Tải lên Thất bại",
			errorPrefix: "Lỗi:",
			unknownError: "Đã xảy ra lỗi không xác định.",
			copiedTitle: "Đã sao chép: {label}",
			copiedMessage: "Đã sao chép liên kết vào bộ nhớ tạm: {textToCopy}",
			copyFailedTitle: "Sao chép Thất bại: {label}",
			copyFailedError: "Không thể sao chép liên kết vào bộ nhớ tạm.",
			scalingTitle: "Đã cập nhật tỷ lệ: Cần hành động",
			scalingMessage: "Đã áp dụng tỷ lệ mới. Để xem các thay đổi, vui lòng khởi động lại: container, phiên làm việc máy tính của bạn bằng cách đăng xuất, hoặc ứng dụng đang chạy."
		},
		alerts: {
			invalidResolution: "Vui lòng nhập số nguyên dương hợp lệ cho Chiều rộng và Chiều cao."
		},
		byteUnits: ["Byte", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 Byte",
		filesModal: {
			closeAlt: "Đóng modal tệp",
			iframeTitle: "Tệp có thể tải xuống"
		}
	},
	Cm = {
		selkiesLogoAlt: "โลโก้ Selkies",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "สลับธีม",
		fullscreenTitle: "เข้าสู่โหมดเต็มหน้าจอ",
		gamingModeTitle: "โหมดเกมมิ่ง",
		buttons: {
			videoStreamEnableTitle: "เปิดใช้งานสตรีมวิดีโอ",
			videoStreamDisableTitle: "ปิดใช้งานสตรีมวิดีโอ",
			audioStreamEnableTitle: "เปิดใช้งานสตรีมเสียง",
			audioStreamDisableTitle: "ปิดใช้งานสตรีมเสียง",
			microphoneEnableTitle: "เปิดใช้งานไมโครโฟน",
			microphoneDisableTitle: "ปิดใช้งานไมโครโฟน",
			gamepadEnableTitle: "เปิดใช้งานอินพุตเกมแพด",
			gamepadDisableTitle: "ปิดใช้งานอินพุตเกมแพด",
			virtualKeyboardButtonTitle: "แสดงแป้นพิมพ์",
			h264FullColorEnableTitle: "เปิดใช้งาน H.264 สีสมบูรณ์",
			h264FullColorDisableTitle: "ปิดใช้งาน H.264 สีสมบูรณ์"
		},
		sections: {
			video: {
				title: "การตั้งค่าวิดีโอ",
				encoderLabel: "ตัวเข้ารหัส:",
				framerateLabel: "เฟรมต่อวินาที ({framerate} FPS):",
				bitrateLabel: "บิตเรตวิดีโอ ({bitrate} Mbps):",
				bufferLabelImmediate: "ขนาดบัฟเฟอร์วิดีโอ (0 (ทันที)):",
				bufferLabelFrames: "ขนาดบัฟเฟอร์วิดีโอ ({videoBufferSize} เฟรม):",
				crfLabel: "วิดีโอ CRF ({crf}):",
				fullColorLabel: "สีสมบูรณ์ 4:4:4:"
			},
			audio: {
				title: "การตั้งค่าเสียง",
				bitrateLabel: "บิตเรตเสียง ({bitrate} kbps):",
				inputLabel: "อินพุต (ไมโครโฟน):",
				outputLabel: "เอาต์พุต (ลำโพง):",
				outputNotSupported: "เบราว์เซอร์นี้ไม่รองรับการเลือกอุปกรณ์เอาต์พุต",
				deviceErrorDefault: "ข้อผิดพลาดในการแสดงรายการอุปกรณ์เสียง: {errorName}",
				deviceErrorPermission: "การอนุญาตถูกปฏิเสธ โปรดอนุญาตการเข้าถึงไมโครโฟนในการตั้งค่าเบราว์เซอร์เพื่อเลือกอุปกรณ์",
				deviceErrorNotFound: "ไม่พบอุปกรณ์เสียง",
				defaultInputLabelFallback: "อุปกรณ์อินพุต {index}",
				defaultOutputLabelFallback: "อุปกรณ์เอาต์พุต {index}"
			},
			screen: {
				title: "การตั้งค่าหน้าจอ",
				presetLabel: "ค่าที่ตั้งไว้ล่วงหน้า:",
				resolutionPresetSelect: "-- เลือกค่าที่ตั้งไว้ --",
				widthLabel: "ความกว้าง:",
				heightLabel: "ความสูง:",
				widthPlaceholder: "เช่น 1920",
				heightPlaceholder: "เช่น 1080",
				setManualButton: "ตั้งค่าความละเอียดด้วยตนเอง",
				resetButton: "รีเซ็ตเป็นหน้าต่าง",
				scaleLocallyLabel: "ปรับขนาดในเครื่อง:",
				scaleLocallyOn: "เปิด",
				scaleLocallyOff: "ปิด",
				scaleLocallyTitleEnable: "เปิดใช้งานการปรับขนาดในเครื่อง (รักษาสัดส่วนภาพ)",
				scaleLocallyTitleDisable: "ปิดใช้งานการปรับขนาดในเครื่อง (ใช้ความละเอียดที่แน่นอน)",
				uiScalingLabel: "การปรับขนาด UI:",
				hidpiLabel: "HiDPI (ความคมชัดระดับพิกเซล)",
				hidpiEnableTitle: "เปิดใช้งาน HiDPI (ความคมชัดระดับพิกเซล)",
				hidpiDisableTitle: "ปิดใช้งาน HiDPI (ใช้การปรับขนาด CSS)"
			},
			stats: {
				title: "สถิติ",
				cpuLabel: "CPU",
				gpuLabel: "การใช้งาน GPU",
				sysMemLabel: "หน่วยความจำระบบ",
				gpuMemLabel: "หน่วยความจำ GPU",
				fpsLabel: "FPS",
				audioLabel: "เสียง",
				tooltipCpu: "การใช้งาน CPU: {value}%",
				tooltipGpu: "การใช้งาน GPU: {value}%",
				tooltipSysMem: "หน่วยความจำระบบ: {used} / {total}",
				tooltipGpuMem: "หน่วยความจำ GPU: {used} / {total}",
				tooltipFps: "FPS ไคลเอ็นต์: {value}",
				tooltipAudio: "บัฟเฟอร์เสียง: {value}",
				tooltipMemoryNA: "ไม่มีข้อมูล"
			},
			clipboard: {
				title: "คลิปบอร์ด",
				label: "คลิปบอร์ดเซิร์ฟเวอร์:",
				placeholder: "เนื้อหาคลิปบอร์ดจากเซิร์ฟเวอร์..."
			},
			files: {
				title: "ไฟล์",
				uploadButton: "อัปโหลดไฟล์",
				uploadButtonTitle: "อัปโหลดไฟล์ไปยังเซสชันระยะไกล",
				downloadButtonTitle: "ดาวน์โหลดไฟล์"
			},
			gamepads: {
				title: "เกมแพด",
				noActivity: "ยังไม่พบกิจกรรมของเกมแพด...",
				touchEnableTitle: "เปิดใช้งานทัชเกมแพด",
				touchDisableTitle: "ปิดใช้งานทัชเกมแพด",
				touchActiveLabel: "ทัชเกมแพด: เปิด",
				touchInactiveLabel: "ทัชเกมแพด: ปิด",
				physicalHiddenForTouch: "การแสดงผลเกมแพดจริงจะถูกซ่อนขณะที่ทัชเกมแพดทำงานอยู่",
				noActivityMobileOrEnableTouch: "ไม่มีเกมแพดจริง เปิดใช้งานทัชเกมแพดหรือเชื่อมต่อคอนโทรลเลอร์"
			},
			apps: {
				title: "แอป",
				openButtonTitle: "จัดการแอป",
				openButton: "จัดการแอป"
			},
			sharing: {
				title: "การแชร์"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (แล็ปท็อป)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "ปิดหน้าต่างแอป",
			loading: "กำลังโหลดแอป...",
			errorLoading: "โหลดข้อมูลแอปไม่สำเร็จ โปรดลองอีกครั้ง",
			searchPlaceholder: "ค้นหาแอป...",
			noAppsFound: "ไม่พบแอปที่ตรงกับการค้นหาของคุณ",
			backButton: "กลับไปที่รายการ",
			installButton: "ติดตั้ง",
			updateButton: "อัปเดต",
			removeButton: "ลบ",
			installingMessage: "กำลังจำลองการติดตั้งสำหรับ: {{appName}}",
			removingMessage: "กำลังจำลองการลบสำหรับ: {{appName}}",
			updatingMessage: "กำลังจำลองการอัปเดตสำหรับ: {{appName}}",
			installedBadge: "ติดตั้งแล้ว"
		},
		notifications: {
			closeButtonAlt: "ปิดการแจ้งเตือนสำหรับ {fileName}",
			uploading: "กำลังอัปโหลด... {progress}%",
			uploadComplete: "อัปโหลดเสร็จสมบูรณ์",
			uploadFailed: "การอัปโหลดล้มเหลว",
			errorPrefix: "ข้อผิดพลาด:",
			unknownError: "เกิดข้อผิดพลาดที่ไม่รู้จัก",
			copiedTitle: "คัดลอกแล้ว: {label}",
			copiedMessage: "คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว: {textToCopy}",
			copyFailedTitle: "การคัดลอกล้มเหลว: {label}",
			copyFailedError: "ไม่สามารถคัดลอกลิงก์ไปยังคลิปบอร์ดได้",
			scalingTitle: "ปรับขนาดแล้ว: ต้องการการดำเนินการ",
			scalingMessage: "ใช้การปรับขนาดใหม่แล้ว หากต้องการดูการเปลี่ยนแปลง โปรดรีสตาร์ท: คอนเทนเนอร์, เซสชันเดสก์ท็อปของคุณโดยการออกจากระบบ, หรือแอปพลิเคชันที่กำลังทำงานอยู่"
		},
		alerts: {
			invalidResolution: "โปรดป้อนจำนวนเต็มบวกที่ถูกต้องสำหรับความกว้างและความสูง"
		},
		byteUnits: ["ไบต์", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 ไบต์",
		filesModal: {
			closeAlt: "ปิดหน้าต่างไฟล์",
			iframeTitle: "ไฟล์ที่สามารถดาวน์โหลดได้"
		}
	},
	Nm = {
		selkiesLogoAlt: "Logo ng Selkies",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "I-toggle ang Tema",
		fullscreenTitle: "Pumasok sa Fullscreen",
		gamingModeTitle: "Gaming Mode",
		buttons: {
			videoStreamEnableTitle: "Paganahin ang Video Stream",
			videoStreamDisableTitle: "Huwag paganahin ang Video Stream",
			audioStreamEnableTitle: "Paganahin ang Audio Stream",
			audioStreamDisableTitle: "Huwag paganahin ang Audio Stream",
			microphoneEnableTitle: "Paganahin ang Mikropono",
			microphoneDisableTitle: "Huwag paganahin ang Mikropono",
			gamepadEnableTitle: "Paganahin ang Gamepad Input",
			gamepadDisableTitle: "Huwag paganahin ang Gamepad Input",
			virtualKeyboardButtonTitle: "Ipakita ang Keyboard",
			h264FullColorEnableTitle: "Paganahin ang H.264 Buong Kulay",
			h264FullColorDisableTitle: "Huwag paganahin ang H.264 Buong Kulay"
		},
		sections: {
			video: {
				title: "Mga Setting ng Video",
				encoderLabel: "Encoder:",
				framerateLabel: "Mga frame bawat segundo ({framerate} FPS):",
				bitrateLabel: "Video Bitrate ({bitrate} Mbps):",
				bufferLabelImmediate: "Laki ng Video Buffer (0 (Agad)):",
				bufferLabelFrames: "Laki ng Video Buffer ({videoBufferSize} frames):",
				crfLabel: "Video CRF ({crf}):",
				fullColorLabel: "Buong Kulay 4:4:4:"
			},
			audio: {
				title: "Mga Setting ng Audio",
				bitrateLabel: "Audio Bitrate ({bitrate} kbps):",
				inputLabel: "Input (Mikropono):",
				outputLabel: "Output (Speaker):",
				outputNotSupported: "Hindi suportado ng browser na ito ang pagpili ng output device.",
				deviceErrorDefault: "Error sa paglista ng mga audio device: {errorName}",
				deviceErrorPermission: "Tinanggihan ang pahintulot. Mangyaring payagan ang access sa mikropono sa mga setting ng browser upang pumili ng mga device.",
				deviceErrorNotFound: "Walang nahanap na mga audio device.",
				defaultInputLabelFallback: "Input Device {index}",
				defaultOutputLabelFallback: "Output Device {index}"
			},
			screen: {
				title: "Mga Setting ng Screen",
				presetLabel: "Preset:",
				resolutionPresetSelect: "-- Pumili ng Preset --",
				widthLabel: "Lapad:",
				heightLabel: "Taas:",
				widthPlaceholder: "hal., 1920",
				heightPlaceholder: "hal., 1080",
				setManualButton: "Itakda ang Manual na Resolusyon",
				resetButton: "I-reset sa Window",
				scaleLocallyLabel: "I-scale Lokal:",
				scaleLocallyOn: "ON",
				scaleLocallyOff: "OFF",
				scaleLocallyTitleEnable: "Paganahin ang Lokal na Pag-scale (Panatilihin ang Aspect Ratio)",
				scaleLocallyTitleDisable: "Huwag paganahin ang Lokal na Pag-scale (Gamitin ang Eksaktong Resolusyon)",
				uiScalingLabel: "Pag-scale ng UI:",
				hidpiLabel: "HiDPI (Pixel Perfect)",
				hidpiEnableTitle: "Paganahin ang HiDPI (Pixel Perfect)",
				hidpiDisableTitle: "Huwag paganahin ang HiDPI (Gamitin ang CSS Scaling)"
			},
			stats: {
				title: "Stats",
				cpuLabel: "CPU",
				gpuLabel: "Paggamit ng GPU",
				sysMemLabel: "Sys Mem",
				gpuMemLabel: "GPU Mem",
				fpsLabel: "FPS",
				audioLabel: "Audio",
				tooltipCpu: "Paggamit ng CPU: {value}%",
				tooltipGpu: "Paggamit ng GPU: {value}%",
				tooltipSysMem: "Memorya ng System: {used} / {total}",
				tooltipGpuMem: "Memorya ng GPU: {used} / {total}",
				tooltipFps: "Client FPS: {value}",
				tooltipAudio: "Mga Audio Buffer: {value}",
				tooltipMemoryNA: "N/A"
			},
			clipboard: {
				title: "Clipboard",
				label: "Server Clipboard:",
				placeholder: "Nilalaman ng clipboard mula sa server..."
			},
			files: {
				title: "Mga File",
				uploadButton: "Mag-upload ng mga File",
				uploadButtonTitle: "Mag-upload ng mga file sa remote session",
				downloadButtonTitle: "I-download ang mga File"
			},
			gamepads: {
				title: "Mga Gamepad",
				noActivity: "Wala pang aktibidad ng gamepad na natukoy...",
				touchEnableTitle: "Paganahin ang Touch Gamepad",
				touchDisableTitle: "Huwag paganahin ang Touch Gamepad",
				touchActiveLabel: "Touch Gamepad: ON",
				touchInactiveLabel: "Touch Gamepad: OFF",
				physicalHiddenForTouch: "Nakatago ang display ng pisikal na gamepad habang aktibo ang touch gamepad.",
				noActivityMobileOrEnableTouch: "Walang pisikal na gamepad. Paganahin ang touch gamepad o kumonekta ng controller."
			},
			apps: {
				title: "Mga App",
				openButtonTitle: "Pamahalaan ang mga App",
				openButton: "Pamahalaan ang mga App"
			},
			sharing: {
				title: "Pagbabahagi"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (Laptop)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "Isara ang modal ng mga app",
			loading: "Nilo-load ang mga app...",
			errorLoading: "Nabigo ang pag-load ng data ng app. Pakisubukang muli.",
			searchPlaceholder: "Maghanap ng mga app...",
			noAppsFound: "Walang nahanap na app na tumutugma sa iyong paghahanap.",
			backButton: "Bumalik sa listahan",
			installButton: "I-install",
			updateButton: "I-update",
			removeButton: "Alisin",
			installingMessage: "Sinusubukan ang pag-install para sa: {{appName}}",
			removingMessage: "Sinusubukan ang pag-alis para sa: {{appName}}",
			updatingMessage: "Sinusubukan ang pag-update para sa: {{appName}}",
			installedBadge: "Naka-install"
		},
		notifications: {
			closeButtonAlt: "Isara ang notification para sa {fileName}",
			uploading: "Nag-a-upload... {progress}%",
			uploadComplete: "Kumpleto ang Pag-upload",
			uploadFailed: "Nabigo ang Pag-upload",
			errorPrefix: "Error:",
			unknownError: "May naganap na hindi kilalang error.",
			copiedTitle: "Kinopya: {label}",
			copiedMessage: "Nakopya ang link sa clipboard: {textToCopy}",
			copyFailedTitle: "Nabigo ang Pagkopya: {label}",
			copyFailedError: "Hindi makopya ang link sa clipboard.",
			scalingTitle: "Na-update ang Pag-scale: Kinakailangan ang Aksyon",
			scalingMessage: "Inilapat ang bagong pag-scale. Upang makita ang mga pagbabago, i-restart ang: container, iyong desktop session sa pamamagitan ng pag-log out, o ang tumatakbong application."
		},
		alerts: {
			invalidResolution: "Mangyaring maglagay ng mga wastong positibong integer para sa Lapad at Taas."
		},
		byteUnits: ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 Bytes",
		filesModal: {
			closeAlt: "Isara ang modal ng mga file",
			iframeTitle: "Mga Nada-download na File"
		}
	},
	Om = {
		selkiesLogoAlt: "Selkies Logo",
		selkiesTitle: "Iris OS",
		toggleThemeTitle: "Skift tema",
		fullscreenTitle: "Start Fuldskærm",
		gamingModeTitle: "Spiltilstand",
		buttons: {
			videoStreamEnableTitle: "Aktiver videostream",
			videoStreamDisableTitle: "Deaktiver videostream",
			audioStreamEnableTitle: "Aktiver lydstream",
			audioStreamDisableTitle: "Deaktiver lydstream",
			microphoneEnableTitle: "Aktiver mikrofon",
			microphoneDisableTitle: "Deaktiver mikrofon",
			gamepadEnableTitle: "Aktiver Gamepad-input",
			gamepadDisableTitle: "Deaktiver Gamepad-input",
			virtualKeyboardButtonTitle: "Vis tastatur",
			h264FullColorEnableTitle: "Paganahin ang H.264 Buong Kulay",
			h264FullColorDisableTitle: "Huwag paganahin ang H.264 Buong Kulay"
		},
		sections: {
			video: {
				title: "Videoindstillinger",
				encoderLabel: "Encoder:",
				framerateLabel: "Billeder pr. sekund ({framerate} FPS):",
				bitrateLabel: "Video Bitrate ({bitrate} Mbps):",
				bufferLabelImmediate: "Videobufferstørrelse (0 (Øjeblikkelig)):",
				bufferLabelFrames: "Videobufferstørrelse ({videoBufferSize} billeder):",
				crfLabel: "Video CRF ({crf}):",
				fullColorLabel: "Fuld Farve 4:4:4:"
			},
			audio: {
				title: "Lydindstillinger",
				bitrateLabel: "Lyd bitrate ({bitrate} kbps):",
				inputLabel: "Input (Mikrofon):",
				outputLabel: "Output (Højttaler):",
				outputNotSupported: "Valg af outputenhed understøttes ikke af denne browser.",
				deviceErrorDefault: "Fejl ved visning af lydenheder: {errorName}",
				deviceErrorPermission: "Adgang nægtet. Tillad venligst mikrofonadgang i browserindstillinger for at vælge enheder.",
				deviceErrorNotFound: "Ingen lydenheder fundet.",
				defaultInputLabelFallback: "Inputenhed {index}",
				defaultOutputLabelFallback: "Outputenhed {index}"
			},
			screen: {
				title: "Skærmindstillinger",
				presetLabel: "Forudindstilling:",
				resolutionPresetSelect: "-- Vælg forudindstilling --",
				widthLabel: "Bredde:",
				heightLabel: "Højde:",
				widthPlaceholder: "f.eks. 1920",
				heightPlaceholder: "f.eks. 1080",
				setManualButton: "Indstil opløsning manuelt",
				resetButton: "Nulstil til Vindue",
				scaleLocallyLabel: "Skaler lokalt:",
				scaleLocallyOn: "TIL",
				scaleLocallyOff: "FRA",
				scaleLocallyTitleEnable: "Aktiver lokal skalering (Bevar aspektforhold)",
				scaleLocallyTitleDisable: "Deaktiver lokal skalering (Brug præcis opløsning)",
				uiScalingLabel: "UI-skalering:",
				hidpiLabel: "HiDPI (Pixel Perfekt)",
				hidpiEnableTitle: "Aktivér HiDPI (Pixel Perfekt)",
				hidpiDisableTitle: "Deaktivér HiDPI (Brug CSS-skalering)"
			},
			stats: {
				title: "Statistik",
				cpuLabel: "CPU",
				gpuLabel: "GPU",
				sysMemLabel: "Systemhuk.",
				gpuMemLabel: "GPU-huk.",
				fpsLabel: "FPS",
				audioLabel: "Lyd",
				tooltipCpu: "CPU-brug: {value}%",
				tooltipGpu: "GPU-brug: {value}%",
				tooltipSysMem: "Systemhukommelse: {used} / {total}",
				tooltipGpuMem: "GPU-hukommelse: {used} / {total}",
				tooltipFps: "Klient FPS: {value}",
				tooltipAudio: "Lydbuffere: {value}",
				tooltipMemoryNA: "Utilgængelig"
			},
			clipboard: {
				title: "Udklipsholder",
				label: "Server Udklipsholder:",
				placeholder: "Indhold fra serverens udklipsholder..."
			},
			files: {
				title: "Filer",
				uploadButton: "Upload Filer",
				uploadButtonTitle: "Upload filer til den eksterne session",
				downloadButtonTitle: "Download Filer"
			},
			gamepads: {
				title: "Gamepads",
				noActivity: "Ingen fysisk gamepad-aktivitet registreret endnu...",
				touchEnableTitle: "Aktiver Touch Gamepad",
				touchDisableTitle: "Deaktiver Touch Gamepad",
				touchActiveLabel: "Touch Gamepad: TIL",
				touchInactiveLabel: "Touch Gamepad: FRA",
				physicalHiddenForTouch: "Visning af fysisk gamepad er skjult, mens touch gamepad er aktiv.",
				noActivityMobileOrEnableTouch: "Ingen fysiske gamepads. Aktiver touch gamepad eller tilslut en controller."
			},
			apps: {
				title: "Apps",
				openButtonTitle: "Administrer Apps",
				openButton: "Administrer Apps"
			},
			sharing: {
				title: "Deling"
			}
		},
		resolutionPresets: {
			"1920x1080": "1920 x 1080 (FHD)",
			"1280x720": "1280 x 720 (HD)",
			"1366x768": "1366 x 768 (Bærbar)",
			"1920x1200": "1920 x 1200 (16:10)",
			"2560x1440": "2560 x 1440 (QHD)",
			"3840x2160": "3840 x 2160 (4K UHD)",
			"1024x768": "1024 x 768 (XGA 4:3)",
			"800x600": "800 x 600 (SVGA 4:3)",
			"640x480": "640 x 480 (VGA 4:3)",
			"320x240": "320 x 240 (QVGA 4:3)"
		},
		appsModal: {
			closeAlt: "Luk app-modal",
			loading: "Indlæser apps...",
			errorLoading: "Kunne ikke indlæse app-data. Prøv venligst igen.",
			searchPlaceholder: "Søg efter apps...",
			noAppsFound: "Ingen apps fundet, der matcher din søgning.",
			backButton: "Tilbage til listen",
			installButton: "Installer",
			updateButton: "Opdater",
			removeButton: "Fjern",
			installingMessage: "Simulerer installation for: {{appName}}",
			removingMessage: "Simulerer fjernelse for: {{appName}}",
			updatingMessage: "Simulerer opdatering for: {{appName}}",
			installedBadge: "Installeret"
		},
		notifications: {
			closeButtonAlt: "Luk notifikation for {fileName}",
			uploading: "Uploader... {progress}%",
			uploadComplete: "Upload Fuldført",
			uploadFailed: "Upload Mislykkedes",
			errorPrefix: "Fejl:",
			unknownError: "Der opstod en ukendt fejl.",
			copiedTitle: "Kopieret: {label}",
			copiedMessage: "Link kopieret til udklipsholder: {textToCopy}",
			copyFailedTitle: "Kopiering Mislykkedes: {label}",
			copyFailedError: "Kunne ikke kopiere link til udklipsholder.",
			scalingTitle: "Skalering Opdateret: Handling Påkrævet",
			scalingMessage: "Ny skalering anvendt. For at se ændringer, genstart: containeren, din skrivebordssession ved at logge ud, eller den kørende applikation."
		},
		alerts: {
			invalidResolution: "Indtast venligst gyldige positive heltal for Bredde og Højde."
		},
		byteUnits: ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		zeroBytes: "0 Bytes",
		filesModal: {
			closeAlt: "Luk fil-modal",
			iframeTitle: "Downloadbare Filer"
		}
	},
	Wr = {
		en: hm,
		es: mm,
		zh: gm,
		hi: bm,
		pt: vm,
		fr: ym,
		ru: Sm,
		de: xm,
		tr: Tm,
		it: Am,
		nl: Em,
		ar: Mm,
		ko: Lm,
		ja: Dm,
		vi: Bm,
		th: Cm,
		fil: Nm,
		da: Om
	},
	W0 = (i = "en") => {
		const o = i.split("-")[0].toLowerCase(),
			s = Wr[o] || Wr.en,
			r = Wr.en;
		return {
			t: (h, T) => {
				const A = h.split(".");
				let v = s,
					C = r,
					y = !0;
				for (const j of A)
					if (v && typeof v == "object" && v.hasOwnProperty(j)) v = v[j];
					else {
						v = null, y = !1;
						break
					} if (!y || v === null) {
					let j = !0;
					for (const R of A)
						if (C && typeof C == "object" && C.hasOwnProperty(R)) C = C[R];
						else {
							C = null, j = !1;
							break
						} j && C !== null ? v = C : v = null
				}
				return typeof v == "string" ? pm(v, T) : (console.warn(`Translation key not found or invalid: ${h}`), h)
			},
			raw: s
		}
	}; /*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT */
function xp(i) {
	return typeof i > "u" || i === null
}

function km(i) {
	return typeof i == "object" && i !== null
}

function zm(i) {
	return Array.isArray(i) ? i : xp(i) ? [] : [i]
}

function _m(i, o) {
	var s, r, d, g;
	if (o)
		for (g = Object.keys(o), s = 0, r = g.length; s < r; s += 1) d = g[s], i[d] = o[d];
	return i
}

function Um(i, o) {
	var s = "",
		r;
	for (r = 0; r < o; r += 1) s += i;
	return s
}

function Hm(i) {
	return i === 0 && Number.NEGATIVE_INFINITY === 1 / i
}
var jm = xp,
	Gm = km,
	Rm = zm,
	wm = Um,
	Fm = Hm,
	Vm = _m,
	tl = {
		isNothing: jm,
		isObject: Gm,
		toArray: Rm,
		repeat: wm,
		isNegativeZero: Fm,
		extend: Vm
	};

function Tp(i, o) {
	var s = "",
		r = i.reason || "(unknown reason)";
	return i.mark ? (i.mark.name && (s += 'in "' + i.mark.name + '" '), s += "(" + (i.mark.line + 1) + ":" + (i.mark.column + 1) + ")", !o && i.mark.snippet && (s += `

` + i.mark.snippet), r + " " + s) : r
}

function $n(i, o) {
	Error.call(this), this.name = "YAMLException", this.reason = i, this.mark = o, this.message = Tp(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || ""
}
$n.prototype = Object.create(Error.prototype);
$n.prototype.constructor = $n;
$n.prototype.toString = function(o) {
	return this.name + ": " + Tp(this, o)
};
var Tl = $n;

function es(i, o, s, r, d) {
	var g = "",
		h = "",
		T = Math.floor(d / 2) - 1;
	return r - o > T && (g = " ... ", o = r - T + g.length), s - r > T && (h = " ...", s = r + T - h.length), {
		str: g + i.slice(o, s).replace(/\t/g, "→") + h,
		pos: r - o + g.length
	}
}

function ls(i, o) {
	return tl.repeat(" ", o - i.length) + i
}

function Ym(i, o) {
	if (o = Object.create(o || null), !i.buffer) return null;
	o.maxLength || (o.maxLength = 79), typeof o.indent != "number" && (o.indent = 1), typeof o.linesBefore != "number" && (o.linesBefore = 3), typeof o.linesAfter != "number" && (o.linesAfter = 2);
	for (var s = /\r?\n|\r|\0/g, r = [0], d = [], g, h = -1; g = s.exec(i.buffer);) d.push(g.index), r.push(g.index + g[0].length), i.position <= g.index && h < 0 && (h = r.length - 2);
	h < 0 && (h = r.length - 1);
	var T = "",
		A, v, C = Math.min(i.line + o.linesAfter, d.length).toString().length,
		y = o.maxLength - (o.indent + C + 3);
	for (A = 1; A <= o.linesBefore && !(h - A < 0); A++) v = es(i.buffer, r[h - A], d[h - A], i.position - (r[h] - r[h - A]), y), T = tl.repeat(" ", o.indent) + ls((i.line - A + 1).toString(), C) + " | " + v.str + `
` + T;
	for (v = es(i.buffer, r[h], d[h], i.position, y), T += tl.repeat(" ", o.indent) + ls((i.line + 1).toString(), C) + " | " + v.str + `
`, T += tl.repeat("-", o.indent + C + 3 + v.pos) + `^
`, A = 1; A <= o.linesAfter && !(h + A >= d.length); A++) v = es(i.buffer, r[h + A], d[h + A], i.position - (r[h] - r[h + A]), y), T += tl.repeat(" ", o.indent) + ls((i.line + A + 1).toString(), C) + " | " + v.str + `
`;
	return T.replace(/\n$/, "")
}
var qm = Ym,
	Km = ["kind", "multi", "resolve", "construct", "instanceOf", "predicate", "represent", "representName", "defaultStyle", "styleAliases"],
	Qm = ["scalar", "sequence", "mapping"];

function Pm(i) {
	var o = {};
	return i !== null && Object.keys(i).forEach(function(s) {
		i[s].forEach(function(r) {
			o[String(r)] = s
		})
	}), o
}

function Xm(i, o) {
	if (o = o || {}, Object.keys(o).forEach(function(s) {
			if (Km.indexOf(s) === -1) throw new Tl('Unknown option "' + s + '" is met in definition of "' + i + '" YAML type.')
		}), this.options = o, this.tag = i, this.kind = o.kind || null, this.resolve = o.resolve || function() {
			return !0
		}, this.construct = o.construct || function(s) {
			return s
		}, this.instanceOf = o.instanceOf || null, this.predicate = o.predicate || null, this.represent = o.represent || null, this.representName = o.representName || null, this.defaultStyle = o.defaultStyle || null, this.multi = o.multi || !1, this.styleAliases = Pm(o.styleAliases || null), Qm.indexOf(this.kind) === -1) throw new Tl('Unknown kind "' + this.kind + '" is specified for "' + i + '" YAML type.')
}
var ml = Xm;

function ep(i, o) {
	var s = [];
	return i[o].forEach(function(r) {
		var d = s.length;
		s.forEach(function(g, h) {
			g.tag === r.tag && g.kind === r.kind && g.multi === r.multi && (d = h)
		}), s[d] = r
	}), s
}

function Zm() {
	var i = {
			scalar: {},
			sequence: {},
			mapping: {},
			fallback: {},
			multi: {
				scalar: [],
				sequence: [],
				mapping: [],
				fallback: []
			}
		},
		o, s;

	function r(d) {
		d.multi ? (i.multi[d.kind].push(d), i.multi.fallback.push(d)) : i[d.kind][d.tag] = i.fallback[d.tag] = d
	}
	for (o = 0, s = arguments.length; o < s; o += 1) arguments[o].forEach(r);
	return i
}

function ss(i) {
	return this.extend(i)
}
ss.prototype.extend = function(o) {
	var s = [],
		r = [];
	if (o instanceof ml) r.push(o);
	else if (Array.isArray(o)) r = r.concat(o);
	else if (o && (Array.isArray(o.implicit) || Array.isArray(o.explicit))) o.implicit && (s = s.concat(o.implicit)), o.explicit && (r = r.concat(o.explicit));
	else throw new Tl("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
	s.forEach(function(g) {
		if (!(g instanceof ml)) throw new Tl("Specified list of YAML types (or a single Type object) contains a non-Type object.");
		if (g.loadKind && g.loadKind !== "scalar") throw new Tl("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
		if (g.multi) throw new Tl("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.")
	}), r.forEach(function(g) {
		if (!(g instanceof ml)) throw new Tl("Specified list of YAML types (or a single Type object) contains a non-Type object.")
	});
	var d = Object.create(ss.prototype);
	return d.implicit = (this.implicit || []).concat(s), d.explicit = (this.explicit || []).concat(r), d.compiledImplicit = ep(d, "implicit"), d.compiledExplicit = ep(d, "explicit"), d.compiledTypeMap = Zm(d.compiledImplicit, d.compiledExplicit), d
};
var Ap = ss,
	Ep = new ml("tag:yaml.org,2002:str", {
		kind: "scalar",
		construct: function(i) {
			return i !== null ? i : ""
		}
	}),
	Mp = new ml("tag:yaml.org,2002:seq", {
		kind: "sequence",
		construct: function(i) {
			return i !== null ? i : []
		}
	}),
	Lp = new ml("tag:yaml.org,2002:map", {
		kind: "mapping",
		construct: function(i) {
			return i !== null ? i : {}
		}
	}),
	Dp = new Ap({
		explicit: [Ep, Mp, Lp]
	});

function Im(i) {
	if (i === null) return !0;
	var o = i.length;
	return o === 1 && i === "~" || o === 4 && (i === "null" || i === "Null" || i === "NULL")
}

function Jm() {
	return null
}

function $m(i) {
	return i === null
}
var Bp = new ml("tag:yaml.org,2002:null", {
	kind: "scalar",
	resolve: Im,
	construct: Jm,
	predicate: $m,
	represent: {
		canonical: function() {
			return "~"
		},
		lowercase: function() {
			return "null"
		},
		uppercase: function() {
			return "NULL"
		},
		camelcase: function() {
			return "Null"
		},
		empty: function() {
			return ""
		}
	},
	defaultStyle: "lowercase"
});

function Wm(i) {
	if (i === null) return !1;
	var o = i.length;
	return o === 4 && (i === "true" || i === "True" || i === "TRUE") || o === 5 && (i === "false" || i === "False" || i === "FALSE")
}

function eg(i) {
	return i === "true" || i === "True" || i === "TRUE"
}

function lg(i) {
	return Object.prototype.toString.call(i) === "[object Boolean]"
}
var Cp = new ml("tag:yaml.org,2002:bool", {
	kind: "scalar",
	resolve: Wm,
	construct: eg,
	predicate: lg,
	represent: {
		lowercase: function(i) {
			return i ? "true" : "false"
		},
		uppercase: function(i) {
			return i ? "TRUE" : "FALSE"
		},
		camelcase: function(i) {
			return i ? "True" : "False"
		}
	},
	defaultStyle: "lowercase"
});

function tg(i) {
	return 48 <= i && i <= 57 || 65 <= i && i <= 70 || 97 <= i && i <= 102
}

function ag(i) {
	return 48 <= i && i <= 55
}

function ig(i) {
	return 48 <= i && i <= 57
}

function ng(i) {
	if (i === null) return !1;
	var o = i.length,
		s = 0,
		r = !1,
		d;
	if (!o) return !1;
	if (d = i[s], (d === "-" || d === "+") && (d = i[++s]), d === "0") {
		if (s + 1 === o) return !0;
		if (d = i[++s], d === "b") {
			for (s++; s < o; s++)
				if (d = i[s], d !== "_") {
					if (d !== "0" && d !== "1") return !1;
					r = !0
				} return r && d !== "_"
		}
		if (d === "x") {
			for (s++; s < o; s++)
				if (d = i[s], d !== "_") {
					if (!tg(i.charCodeAt(s))) return !1;
					r = !0
				} return r && d !== "_"
		}
		if (d === "o") {
			for (s++; s < o; s++)
				if (d = i[s], d !== "_") {
					if (!ag(i.charCodeAt(s))) return !1;
					r = !0
				} return r && d !== "_"
		}
	}
	if (d === "_") return !1;
	for (; s < o; s++)
		if (d = i[s], d !== "_") {
			if (!ig(i.charCodeAt(s))) return !1;
			r = !0
		} return !(!r || d === "_")
}

function ug(i) {
	var o = i,
		s = 1,
		r;
	if (o.indexOf("_") !== -1 && (o = o.replace(/_/g, "")), r = o[0], (r === "-" || r === "+") && (r === "-" && (s = -1), o = o.slice(1), r = o[0]), o === "0") return 0;
	if (r === "0") {
		if (o[1] === "b") return s * parseInt(o.slice(2), 2);
		if (o[1] === "x") return s * parseInt(o.slice(2), 16);
		if (o[1] === "o") return s * parseInt(o.slice(2), 8)
	}
	return s * parseInt(o, 10)
}

function og(i) {
	return Object.prototype.toString.call(i) === "[object Number]" && i % 1 === 0 && !tl.isNegativeZero(i)
}
var Np = new ml("tag:yaml.org,2002:int", {
		kind: "scalar",
		resolve: ng,
		construct: ug,
		predicate: og,
		represent: {
			binary: function(i) {
				return i >= 0 ? "0b" + i.toString(2) : "-0b" + i.toString(2).slice(1)
			},
			octal: function(i) {
				return i >= 0 ? "0o" + i.toString(8) : "-0o" + i.toString(8).slice(1)
			},
			decimal: function(i) {
				return i.toString(10)
			},
			hexadecimal: function(i) {
				return i >= 0 ? "0x" + i.toString(16).toUpperCase() : "-0x" + i.toString(16).toUpperCase().slice(1)
			}
		},
		defaultStyle: "decimal",
		styleAliases: {
			binary: [2, "bin"],
			octal: [8, "oct"],
			decimal: [10, "dec"],
			hexadecimal: [16, "hex"]
		}
	}),
	cg = new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");

function rg(i) {
	return !(i === null || !cg.test(i) || i[i.length - 1] === "_")
}

function sg(i) {
	var o, s;
	return o = i.replace(/_/g, "").toLowerCase(), s = o[0] === "-" ? -1 : 1, "+-".indexOf(o[0]) >= 0 && (o = o.slice(1)), o === ".inf" ? s === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : o === ".nan" ? NaN : s * parseFloat(o, 10)
}
var fg = /^[-+]?[0-9]+e/;

function dg(i, o) {
	var s;
	if (isNaN(i)) switch (o) {
		case "lowercase":
			return ".nan";
		case "uppercase":
			return ".NAN";
		case "camelcase":
			return ".NaN"
	} else if (Number.POSITIVE_INFINITY === i) switch (o) {
		case "lowercase":
			return ".inf";
		case "uppercase":
			return ".INF";
		case "camelcase":
			return ".Inf"
	} else if (Number.NEGATIVE_INFINITY === i) switch (o) {
		case "lowercase":
			return "-.inf";
		case "uppercase":
			return "-.INF";
		case "camelcase":
			return "-.Inf"
	} else if (tl.isNegativeZero(i)) return "-0.0";
	return s = i.toString(10), fg.test(s) ? s.replace("e", ".e") : s
}

function pg(i) {
	return Object.prototype.toString.call(i) === "[object Number]" && (i % 1 !== 0 || tl.isNegativeZero(i))
}
var Op = new ml("tag:yaml.org,2002:float", {
		kind: "scalar",
		resolve: rg,
		construct: sg,
		predicate: pg,
		represent: dg,
		defaultStyle: "lowercase"
	}),
	kp = Dp.extend({
		implicit: [Bp, Cp, Np, Op]
	}),
	zp = kp,
	_p = new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),
	Up = new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");

function hg(i) {
	return i === null ? !1 : _p.exec(i) !== null || Up.exec(i) !== null
}

function mg(i) {
	var o, s, r, d, g, h, T, A = 0,
		v = null,
		C, y, j;
	if (o = _p.exec(i), o === null && (o = Up.exec(i)), o === null) throw new Error("Date resolve error");
	if (s = +o[1], r = +o[2] - 1, d = +o[3], !o[4]) return new Date(Date.UTC(s, r, d));
	if (g = +o[4], h = +o[5], T = +o[6], o[7]) {
		for (A = o[7].slice(0, 3); A.length < 3;) A += "0";
		A = +A
	}
	return o[9] && (C = +o[10], y = +(o[11] || 0), v = (C * 60 + y) * 6e4, o[9] === "-" && (v = -v)), j = new Date(Date.UTC(s, r, d, g, h, T, A)), v && j.setTime(j.getTime() - v), j
}

function gg(i) {
	return i.toISOString()
}
var Hp = new ml("tag:yaml.org,2002:timestamp", {
	kind: "scalar",
	resolve: hg,
	construct: mg,
	instanceOf: Date,
	represent: gg
});

function bg(i) {
	return i === "<<" || i === null
}
var jp = new ml("tag:yaml.org,2002:merge", {
		kind: "scalar",
		resolve: bg
	}),
	bs = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;

function vg(i) {
	if (i === null) return !1;
	var o, s, r = 0,
		d = i.length,
		g = bs;
	for (s = 0; s < d; s++)
		if (o = g.indexOf(i.charAt(s)), !(o > 64)) {
			if (o < 0) return !1;
			r += 6
		} return r % 8 === 0
}

function yg(i) {
	var o, s, r = i.replace(/[\r\n=]/g, ""),
		d = r.length,
		g = bs,
		h = 0,
		T = [];
	for (o = 0; o < d; o++) o % 4 === 0 && o && (T.push(h >> 16 & 255), T.push(h >> 8 & 255), T.push(h & 255)), h = h << 6 | g.indexOf(r.charAt(o));
	return s = d % 4 * 6, s === 0 ? (T.push(h >> 16 & 255), T.push(h >> 8 & 255), T.push(h & 255)) : s === 18 ? (T.push(h >> 10 & 255), T.push(h >> 2 & 255)) : s === 12 && T.push(h >> 4 & 255), new Uint8Array(T)
}

function Sg(i) {
	var o = "",
		s = 0,
		r, d, g = i.length,
		h = bs;
	for (r = 0; r < g; r++) r % 3 === 0 && r && (o += h[s >> 18 & 63], o += h[s >> 12 & 63], o += h[s >> 6 & 63], o += h[s & 63]), s = (s << 8) + i[r];
	return d = g % 3, d === 0 ? (o += h[s >> 18 & 63], o += h[s >> 12 & 63], o += h[s >> 6 & 63], o += h[s & 63]) : d === 2 ? (o += h[s >> 10 & 63], o += h[s >> 4 & 63], o += h[s << 2 & 63], o += h[64]) : d === 1 && (o += h[s >> 2 & 63], o += h[s << 4 & 63], o += h[64], o += h[64]), o
}

function xg(i) {
	return Object.prototype.toString.call(i) === "[object Uint8Array]"
}
var Gp = new ml("tag:yaml.org,2002:binary", {
		kind: "scalar",
		resolve: vg,
		construct: yg,
		predicate: xg,
		represent: Sg
	}),
	Tg = Object.prototype.hasOwnProperty,
	Ag = Object.prototype.toString;

function Eg(i) {
	if (i === null) return !0;
	var o = [],
		s, r, d, g, h, T = i;
	for (s = 0, r = T.length; s < r; s += 1) {
		if (d = T[s], h = !1, Ag.call(d) !== "[object Object]") return !1;
		for (g in d)
			if (Tg.call(d, g))
				if (!h) h = !0;
				else return !1;
		if (!h) return !1;
		if (o.indexOf(g) === -1) o.push(g);
		else return !1
	}
	return !0
}

function Mg(i) {
	return i !== null ? i : []
}
var Rp = new ml("tag:yaml.org,2002:omap", {
		kind: "sequence",
		resolve: Eg,
		construct: Mg
	}),
	Lg = Object.prototype.toString;

function Dg(i) {
	if (i === null) return !0;
	var o, s, r, d, g, h = i;
	for (g = new Array(h.length), o = 0, s = h.length; o < s; o += 1) {
		if (r = h[o], Lg.call(r) !== "[object Object]" || (d = Object.keys(r), d.length !== 1)) return !1;
		g[o] = [d[0], r[d[0]]]
	}
	return !0
}

function Bg(i) {
	if (i === null) return [];
	var o, s, r, d, g, h = i;
	for (g = new Array(h.length), o = 0, s = h.length; o < s; o += 1) r = h[o], d = Object.keys(r), g[o] = [d[0], r[d[0]]];
	return g
}
var wp = new ml("tag:yaml.org,2002:pairs", {
		kind: "sequence",
		resolve: Dg,
		construct: Bg
	}),
	Cg = Object.prototype.hasOwnProperty;

function Ng(i) {
	if (i === null) return !0;
	var o, s = i;
	for (o in s)
		if (Cg.call(s, o) && s[o] !== null) return !1;
	return !0
}

function Og(i) {
	return i !== null ? i : {}
}
var Fp = new ml("tag:yaml.org,2002:set", {
		kind: "mapping",
		resolve: Ng,
		construct: Og
	}),
	vs = zp.extend({
		implicit: [Hp, jp],
		explicit: [Gp, Rp, wp, Fp]
	}),
	ga = Object.prototype.hasOwnProperty,
	zo = 1,
	Vp = 2,
	Yp = 3,
	_o = 4,
	ts = 1,
	kg = 2,
	lp = 3,
	zg = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,
	_g = /[\x85\u2028\u2029]/,
	Ug = /[,\[\]\{\}]/,
	qp = /^(?:!|!!|![a-z\-]+!)$/i,
	Kp = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;

function tp(i) {
	return Object.prototype.toString.call(i)
}

function st(i) {
	return i === 10 || i === 13
}

function Va(i) {
	return i === 9 || i === 32
}

function Cl(i) {
	return i === 9 || i === 32 || i === 10 || i === 13
}

function Ui(i) {
	return i === 44 || i === 91 || i === 93 || i === 123 || i === 125
}

function Hg(i) {
	var o;
	return 48 <= i && i <= 57 ? i - 48 : (o = i | 32, 97 <= o && o <= 102 ? o - 97 + 10 : -1)
}

function jg(i) {
	return i === 120 ? 2 : i === 117 ? 4 : i === 85 ? 8 : 0
}

function Gg(i) {
	return 48 <= i && i <= 57 ? i - 48 : -1
}

function ap(i) {
	return i === 48 ? "\0" : i === 97 ? "\x07" : i === 98 ? "\b" : i === 116 || i === 9 ? "	" : i === 110 ? `
` : i === 118 ? "\v" : i === 102 ? "\f" : i === 114 ? "\r" : i === 101 ? "\x1B" : i === 32 ? " " : i === 34 ? '"' : i === 47 ? "/" : i === 92 ? "\\" : i === 78 ? "" : i === 95 ? " " : i === 76 ? "\u2028" : i === 80 ? "\u2029" : ""
}

function Rg(i) {
	return i <= 65535 ? String.fromCharCode(i) : String.fromCharCode((i - 65536 >> 10) + 55296, (i - 65536 & 1023) + 56320)
}
var Qp = new Array(256),
	Pp = new Array(256);
for (var ki = 0; ki < 256; ki++) Qp[ki] = ap(ki) ? 1 : 0, Pp[ki] = ap(ki);

function wg(i, o) {
	this.input = i, this.filename = o.filename || null, this.schema = o.schema || vs, this.onWarning = o.onWarning || null, this.legacy = o.legacy || !1, this.json = o.json || !1, this.listener = o.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = i.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = []
}

function Xp(i, o) {
	var s = {
		name: i.filename,
		buffer: i.input.slice(0, -1),
		position: i.position,
		line: i.line,
		column: i.position - i.lineStart
	};
	return s.snippet = qm(s), new Tl(o, s)
}

function I(i, o) {
	throw Xp(i, o)
}

function Uo(i, o) {
	i.onWarning && i.onWarning.call(null, Xp(i, o))
}
var ip = {
	YAML: function(o, s, r) {
		var d, g, h;
		o.version !== null && I(o, "duplication of %YAML directive"), r.length !== 1 && I(o, "YAML directive accepts exactly one argument"), d = /^([0-9]+)\.([0-9]+)$/.exec(r[0]), d === null && I(o, "ill-formed argument of the YAML directive"), g = parseInt(d[1], 10), h = parseInt(d[2], 10), g !== 1 && I(o, "unacceptable YAML version of the document"), o.version = r[0], o.checkLineBreaks = h < 2, h !== 1 && h !== 2 && Uo(o, "unsupported YAML version of the document")
	},
	TAG: function(o, s, r) {
		var d, g;
		r.length !== 2 && I(o, "TAG directive accepts exactly two arguments"), d = r[0], g = r[1], qp.test(d) || I(o, "ill-formed tag handle (first argument) of the TAG directive"), ga.call(o.tagMap, d) && I(o, 'there is a previously declared suffix for "' + d + '" tag handle'), Kp.test(g) || I(o, "ill-formed tag prefix (second argument) of the TAG directive");
		try {
			g = decodeURIComponent(g)
		} catch {
			I(o, "tag prefix is malformed: " + g)
		}
		o.tagMap[d] = g
	}
};

function ma(i, o, s, r) {
	var d, g, h, T;
	if (o < s) {
		if (T = i.input.slice(o, s), r)
			for (d = 0, g = T.length; d < g; d += 1) h = T.charCodeAt(d), h === 9 || 32 <= h && h <= 1114111 || I(i, "expected valid JSON character");
		else zg.test(T) && I(i, "the stream contains non-printable characters");
		i.result += T
	}
}

function np(i, o, s, r) {
	var d, g, h, T;
	for (tl.isObject(s) || I(i, "cannot merge mappings; the provided source object is unacceptable"), d = Object.keys(s), h = 0, T = d.length; h < T; h += 1) g = d[h], ga.call(o, g) || (o[g] = s[g], r[g] = !0)
}

function Hi(i, o, s, r, d, g, h, T, A) {
	var v, C;
	if (Array.isArray(d))
		for (d = Array.prototype.slice.call(d), v = 0, C = d.length; v < C; v += 1) Array.isArray(d[v]) && I(i, "nested arrays are not supported inside keys"), typeof d == "object" && tp(d[v]) === "[object Object]" && (d[v] = "[object Object]");
	if (typeof d == "object" && tp(d) === "[object Object]" && (d = "[object Object]"), d = String(d), o === null && (o = {}), r === "tag:yaml.org,2002:merge")
		if (Array.isArray(g))
			for (v = 0, C = g.length; v < C; v += 1) np(i, o, g[v], s);
		else np(i, o, g, s);
	else !i.json && !ga.call(s, d) && ga.call(o, d) && (i.line = h || i.line, i.lineStart = T || i.lineStart, i.position = A || i.position, I(i, "duplicated mapping key")), d === "__proto__" ? Object.defineProperty(o, d, {
		configurable: !0,
		enumerable: !0,
		writable: !0,
		value: g
	}) : o[d] = g, delete s[d];
	return o
}

function ys(i) {
	var o;
	o = i.input.charCodeAt(i.position), o === 10 ? i.position++ : o === 13 ? (i.position++, i.input.charCodeAt(i.position) === 10 && i.position++) : I(i, "a line break is expected"), i.line += 1, i.lineStart = i.position, i.firstTabInLine = -1
}

function $e(i, o, s) {
	for (var r = 0, d = i.input.charCodeAt(i.position); d !== 0;) {
		for (; Va(d);) d === 9 && i.firstTabInLine === -1 && (i.firstTabInLine = i.position), d = i.input.charCodeAt(++i.position);
		if (o && d === 35)
			do d = i.input.charCodeAt(++i.position); while (d !== 10 && d !== 13 && d !== 0);
		if (st(d))
			for (ys(i), d = i.input.charCodeAt(i.position), r++, i.lineIndent = 0; d === 32;) i.lineIndent++, d = i.input.charCodeAt(++i.position);
		else break
	}
	return s !== -1 && r !== 0 && i.lineIndent < s && Uo(i, "deficient indentation"), r
}

function Go(i) {
	var o = i.position,
		s;
	return s = i.input.charCodeAt(o), !!((s === 45 || s === 46) && s === i.input.charCodeAt(o + 1) && s === i.input.charCodeAt(o + 2) && (o += 3, s = i.input.charCodeAt(o), s === 0 || Cl(s)))
}

function Ss(i, o) {
	o === 1 ? i.result += " " : o > 1 && (i.result += tl.repeat(`
`, o - 1))
}

function Fg(i, o, s) {
	var r, d, g, h, T, A, v, C, y = i.kind,
		j = i.result,
		R;
	if (R = i.input.charCodeAt(i.position), Cl(R) || Ui(R) || R === 35 || R === 38 || R === 42 || R === 33 || R === 124 || R === 62 || R === 39 || R === 34 || R === 37 || R === 64 || R === 96 || (R === 63 || R === 45) && (d = i.input.charCodeAt(i.position + 1), Cl(d) || s && Ui(d))) return !1;
	for (i.kind = "scalar", i.result = "", g = h = i.position, T = !1; R !== 0;) {
		if (R === 58) {
			if (d = i.input.charCodeAt(i.position + 1), Cl(d) || s && Ui(d)) break
		} else if (R === 35) {
			if (r = i.input.charCodeAt(i.position - 1), Cl(r)) break
		} else {
			if (i.position === i.lineStart && Go(i) || s && Ui(R)) break;
			if (st(R))
				if (A = i.line, v = i.lineStart, C = i.lineIndent, $e(i, !1, -1), i.lineIndent >= o) {
					T = !0, R = i.input.charCodeAt(i.position);
					continue
				} else {
					i.position = h, i.line = A, i.lineStart = v, i.lineIndent = C;
					break
				}
		}
		T && (ma(i, g, h, !1), Ss(i, i.line - A), g = h = i.position, T = !1), Va(R) || (h = i.position + 1), R = i.input.charCodeAt(++i.position)
	}
	return ma(i, g, h, !1), i.result ? !0 : (i.kind = y, i.result = j, !1)
}

function Vg(i, o) {
	var s, r, d;
	if (s = i.input.charCodeAt(i.position), s !== 39) return !1;
	for (i.kind = "scalar", i.result = "", i.position++, r = d = i.position;
		(s = i.input.charCodeAt(i.position)) !== 0;)
		if (s === 39)
			if (ma(i, r, i.position, !0), s = i.input.charCodeAt(++i.position), s === 39) r = i.position, i.position++, d = i.position;
			else return !0;
	else st(s) ? (ma(i, r, d, !0), Ss(i, $e(i, !1, o)), r = d = i.position) : i.position === i.lineStart && Go(i) ? I(i, "unexpected end of the document within a single quoted scalar") : (i.position++, d = i.position);
	I(i, "unexpected end of the stream within a single quoted scalar")
}

function Yg(i, o) {
	var s, r, d, g, h, T;
	if (T = i.input.charCodeAt(i.position), T !== 34) return !1;
	for (i.kind = "scalar", i.result = "", i.position++, s = r = i.position;
		(T = i.input.charCodeAt(i.position)) !== 0;) {
		if (T === 34) return ma(i, s, i.position, !0), i.position++, !0;
		if (T === 92) {
			if (ma(i, s, i.position, !0), T = i.input.charCodeAt(++i.position), st(T)) $e(i, !1, o);
			else if (T < 256 && Qp[T]) i.result += Pp[T], i.position++;
			else if ((h = jg(T)) > 0) {
				for (d = h, g = 0; d > 0; d--) T = i.input.charCodeAt(++i.position), (h = Hg(T)) >= 0 ? g = (g << 4) + h : I(i, "expected hexadecimal character");
				i.result += Rg(g), i.position++
			} else I(i, "unknown escape sequence");
			s = r = i.position
		} else st(T) ? (ma(i, s, r, !0), Ss(i, $e(i, !1, o)), s = r = i.position) : i.position === i.lineStart && Go(i) ? I(i, "unexpected end of the document within a double quoted scalar") : (i.position++, r = i.position)
	}
	I(i, "unexpected end of the stream within a double quoted scalar")
}

function qg(i, o) {
	var s = !0,
		r, d, g, h = i.tag,
		T, A = i.anchor,
		v, C, y, j, R, J = Object.create(null),
		ie, oe, Ne, ue;
	if (ue = i.input.charCodeAt(i.position), ue === 91) C = 93, R = !1, T = [];
	else if (ue === 123) C = 125, R = !0, T = {};
	else return !1;
	for (i.anchor !== null && (i.anchorMap[i.anchor] = T), ue = i.input.charCodeAt(++i.position); ue !== 0;) {
		if ($e(i, !0, o), ue = i.input.charCodeAt(i.position), ue === C) return i.position++, i.tag = h, i.anchor = A, i.kind = R ? "mapping" : "sequence", i.result = T, !0;
		s ? ue === 44 && I(i, "expected the node content, but found ','") : I(i, "missed comma between flow collection entries"), oe = ie = Ne = null, y = j = !1, ue === 63 && (v = i.input.charCodeAt(i.position + 1), Cl(v) && (y = j = !0, i.position++, $e(i, !0, o))), r = i.line, d = i.lineStart, g = i.position, ji(i, o, zo, !1, !0), oe = i.tag, ie = i.result, $e(i, !0, o), ue = i.input.charCodeAt(i.position), (j || i.line === r) && ue === 58 && (y = !0, ue = i.input.charCodeAt(++i.position), $e(i, !0, o), ji(i, o, zo, !1, !0), Ne = i.result), R ? Hi(i, T, J, oe, ie, Ne, r, d, g) : y ? T.push(Hi(i, null, J, oe, ie, Ne, r, d, g)) : T.push(ie), $e(i, !0, o), ue = i.input.charCodeAt(i.position), ue === 44 ? (s = !0, ue = i.input.charCodeAt(++i.position)) : s = !1
	}
	I(i, "unexpected end of the stream within a flow collection")
}

function Kg(i, o) {
	var s, r, d = ts,
		g = !1,
		h = !1,
		T = o,
		A = 0,
		v = !1,
		C, y;
	if (y = i.input.charCodeAt(i.position), y === 124) r = !1;
	else if (y === 62) r = !0;
	else return !1;
	for (i.kind = "scalar", i.result = ""; y !== 0;)
		if (y = i.input.charCodeAt(++i.position), y === 43 || y === 45) ts === d ? d = y === 43 ? lp : kg : I(i, "repeat of a chomping mode identifier");
		else if ((C = Gg(y)) >= 0) C === 0 ? I(i, "bad explicit indentation width of a block scalar; it cannot be less than one") : h ? I(i, "repeat of an indentation width identifier") : (T = o + C - 1, h = !0);
	else break;
	if (Va(y)) {
		do y = i.input.charCodeAt(++i.position); while (Va(y));
		if (y === 35)
			do y = i.input.charCodeAt(++i.position); while (!st(y) && y !== 0)
	}
	for (; y !== 0;) {
		for (ys(i), i.lineIndent = 0, y = i.input.charCodeAt(i.position);
			(!h || i.lineIndent < T) && y === 32;) i.lineIndent++, y = i.input.charCodeAt(++i.position);
		if (!h && i.lineIndent > T && (T = i.lineIndent), st(y)) {
			A++;
			continue
		}
		if (i.lineIndent < T) {
			d === lp ? i.result += tl.repeat(`
`, g ? 1 + A : A) : d === ts && g && (i.result += `
`);
			break
		}
		for (r ? Va(y) ? (v = !0, i.result += tl.repeat(`
`, g ? 1 + A : A)) : v ? (v = !1, i.result += tl.repeat(`
`, A + 1)) : A === 0 ? g && (i.result += " ") : i.result += tl.repeat(`
`, A) : i.result += tl.repeat(`
`, g ? 1 + A : A), g = !0, h = !0, A = 0, s = i.position; !st(y) && y !== 0;) y = i.input.charCodeAt(++i.position);
		ma(i, s, i.position, !1)
	}
	return !0
}

function up(i, o) {
	var s, r = i.tag,
		d = i.anchor,
		g = [],
		h, T = !1,
		A;
	if (i.firstTabInLine !== -1) return !1;
	for (i.anchor !== null && (i.anchorMap[i.anchor] = g), A = i.input.charCodeAt(i.position); A !== 0 && (i.firstTabInLine !== -1 && (i.position = i.firstTabInLine, I(i, "tab characters must not be used in indentation")), !(A !== 45 || (h = i.input.charCodeAt(i.position + 1), !Cl(h))));) {
		if (T = !0, i.position++, $e(i, !0, -1) && i.lineIndent <= o) {
			g.push(null), A = i.input.charCodeAt(i.position);
			continue
		}
		if (s = i.line, ji(i, o, Yp, !1, !0), g.push(i.result), $e(i, !0, -1), A = i.input.charCodeAt(i.position), (i.line === s || i.lineIndent > o) && A !== 0) I(i, "bad indentation of a sequence entry");
		else if (i.lineIndent < o) break
	}
	return T ? (i.tag = r, i.anchor = d, i.kind = "sequence", i.result = g, !0) : !1
}

function Qg(i, o, s) {
	var r, d, g, h, T, A, v = i.tag,
		C = i.anchor,
		y = {},
		j = Object.create(null),
		R = null,
		J = null,
		ie = null,
		oe = !1,
		Ne = !1,
		ue;
	if (i.firstTabInLine !== -1) return !1;
	for (i.anchor !== null && (i.anchorMap[i.anchor] = y), ue = i.input.charCodeAt(i.position); ue !== 0;) {
		if (!oe && i.firstTabInLine !== -1 && (i.position = i.firstTabInLine, I(i, "tab characters must not be used in indentation")), r = i.input.charCodeAt(i.position + 1), g = i.line, (ue === 63 || ue === 58) && Cl(r)) ue === 63 ? (oe && (Hi(i, y, j, R, J, null, h, T, A), R = J = ie = null), Ne = !0, oe = !0, d = !0) : oe ? (oe = !1, d = !0) : I(i, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), i.position += 1, ue = r;
		else {
			if (h = i.line, T = i.lineStart, A = i.position, !ji(i, s, Vp, !1, !0)) break;
			if (i.line === g) {
				for (ue = i.input.charCodeAt(i.position); Va(ue);) ue = i.input.charCodeAt(++i.position);
				if (ue === 58) ue = i.input.charCodeAt(++i.position), Cl(ue) || I(i, "a whitespace character is expected after the key-value separator within a block mapping"), oe && (Hi(i, y, j, R, J, null, h, T, A), R = J = ie = null), Ne = !0, oe = !1, d = !1, R = i.tag, J = i.result;
				else if (Ne) I(i, "can not read an implicit mapping pair; a colon is missed");
				else return i.tag = v, i.anchor = C, !0
			} else if (Ne) I(i, "can not read a block mapping entry; a multiline key may not be an implicit key");
			else return i.tag = v, i.anchor = C, !0
		}
		if ((i.line === g || i.lineIndent > o) && (oe && (h = i.line, T = i.lineStart, A = i.position), ji(i, o, _o, !0, d) && (oe ? J = i.result : ie = i.result), oe || (Hi(i, y, j, R, J, ie, h, T, A), R = J = ie = null), $e(i, !0, -1), ue = i.input.charCodeAt(i.position)), (i.line === g || i.lineIndent > o) && ue !== 0) I(i, "bad indentation of a mapping entry");
		else if (i.lineIndent < o) break
	}
	return oe && Hi(i, y, j, R, J, null, h, T, A), Ne && (i.tag = v, i.anchor = C, i.kind = "mapping", i.result = y), Ne
}

function Pg(i) {
	var o, s = !1,
		r = !1,
		d, g, h;
	if (h = i.input.charCodeAt(i.position), h !== 33) return !1;
	if (i.tag !== null && I(i, "duplication of a tag property"), h = i.input.charCodeAt(++i.position), h === 60 ? (s = !0, h = i.input.charCodeAt(++i.position)) : h === 33 ? (r = !0, d = "!!", h = i.input.charCodeAt(++i.position)) : d = "!", o = i.position, s) {
		do h = i.input.charCodeAt(++i.position); while (h !== 0 && h !== 62);
		i.position < i.length ? (g = i.input.slice(o, i.position), h = i.input.charCodeAt(++i.position)) : I(i, "unexpected end of the stream within a verbatim tag")
	} else {
		for (; h !== 0 && !Cl(h);) h === 33 && (r ? I(i, "tag suffix cannot contain exclamation marks") : (d = i.input.slice(o - 1, i.position + 1), qp.test(d) || I(i, "named tag handle cannot contain such characters"), r = !0, o = i.position + 1)), h = i.input.charCodeAt(++i.position);
		g = i.input.slice(o, i.position), Ug.test(g) && I(i, "tag suffix cannot contain flow indicator characters")
	}
	g && !Kp.test(g) && I(i, "tag name cannot contain such characters: " + g);
	try {
		g = decodeURIComponent(g)
	} catch {
		I(i, "tag name is malformed: " + g)
	}
	return s ? i.tag = g : ga.call(i.tagMap, d) ? i.tag = i.tagMap[d] + g : d === "!" ? i.tag = "!" + g : d === "!!" ? i.tag = "tag:yaml.org,2002:" + g : I(i, 'undeclared tag handle "' + d + '"'), !0
}

function Xg(i) {
	var o, s;
	if (s = i.input.charCodeAt(i.position), s !== 38) return !1;
	for (i.anchor !== null && I(i, "duplication of an anchor property"), s = i.input.charCodeAt(++i.position), o = i.position; s !== 0 && !Cl(s) && !Ui(s);) s = i.input.charCodeAt(++i.position);
	return i.position === o && I(i, "name of an anchor node must contain at least one character"), i.anchor = i.input.slice(o, i.position), !0
}

function Zg(i) {
	var o, s, r;
	if (r = i.input.charCodeAt(i.position), r !== 42) return !1;
	for (r = i.input.charCodeAt(++i.position), o = i.position; r !== 0 && !Cl(r) && !Ui(r);) r = i.input.charCodeAt(++i.position);
	return i.position === o && I(i, "name of an alias node must contain at least one character"), s = i.input.slice(o, i.position), ga.call(i.anchorMap, s) || I(i, 'unidentified alias "' + s + '"'), i.result = i.anchorMap[s], $e(i, !0, -1), !0
}

function ji(i, o, s, r, d) {
	var g, h, T, A = 1,
		v = !1,
		C = !1,
		y, j, R, J, ie, oe;
	if (i.listener !== null && i.listener("open", i), i.tag = null, i.anchor = null, i.kind = null, i.result = null, g = h = T = _o === s || Yp === s, r && $e(i, !0, -1) && (v = !0, i.lineIndent > o ? A = 1 : i.lineIndent === o ? A = 0 : i.lineIndent < o && (A = -1)), A === 1)
		for (; Pg(i) || Xg(i);) $e(i, !0, -1) ? (v = !0, T = g, i.lineIndent > o ? A = 1 : i.lineIndent === o ? A = 0 : i.lineIndent < o && (A = -1)) : T = !1;
	if (T && (T = v || d), (A === 1 || _o === s) && (zo === s || Vp === s ? ie = o : ie = o + 1, oe = i.position - i.lineStart, A === 1 ? T && (up(i, oe) || Qg(i, oe, ie)) || qg(i, ie) ? C = !0 : (h && Kg(i, ie) || Vg(i, ie) || Yg(i, ie) ? C = !0 : Zg(i) ? (C = !0, (i.tag !== null || i.anchor !== null) && I(i, "alias node should not have any properties")) : Fg(i, ie, zo === s) && (C = !0, i.tag === null && (i.tag = "?")), i.anchor !== null && (i.anchorMap[i.anchor] = i.result)) : A === 0 && (C = T && up(i, oe))), i.tag === null) i.anchor !== null && (i.anchorMap[i.anchor] = i.result);
	else if (i.tag === "?") {
		for (i.result !== null && i.kind !== "scalar" && I(i, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + i.kind + '"'), y = 0, j = i.implicitTypes.length; y < j; y += 1)
			if (J = i.implicitTypes[y], J.resolve(i.result)) {
				i.result = J.construct(i.result), i.tag = J.tag, i.anchor !== null && (i.anchorMap[i.anchor] = i.result);
				break
			}
	} else if (i.tag !== "!") {
		if (ga.call(i.typeMap[i.kind || "fallback"], i.tag)) J = i.typeMap[i.kind || "fallback"][i.tag];
		else
			for (J = null, R = i.typeMap.multi[i.kind || "fallback"], y = 0, j = R.length; y < j; y += 1)
				if (i.tag.slice(0, R[y].tag.length) === R[y].tag) {
					J = R[y];
					break
				} J || I(i, "unknown tag !<" + i.tag + ">"), i.result !== null && J.kind !== i.kind && I(i, "unacceptable node kind for !<" + i.tag + '> tag; it should be "' + J.kind + '", not "' + i.kind + '"'), J.resolve(i.result, i.tag) ? (i.result = J.construct(i.result, i.tag), i.anchor !== null && (i.anchorMap[i.anchor] = i.result)) : I(i, "cannot resolve a node with !<" + i.tag + "> explicit tag")
	}
	return i.listener !== null && i.listener("close", i), i.tag !== null || i.anchor !== null || C
}

function Ig(i) {
	var o = i.position,
		s, r, d, g = !1,
		h;
	for (i.version = null, i.checkLineBreaks = i.legacy, i.tagMap = Object.create(null), i.anchorMap = Object.create(null);
		(h = i.input.charCodeAt(i.position)) !== 0 && ($e(i, !0, -1), h = i.input.charCodeAt(i.position), !(i.lineIndent > 0 || h !== 37));) {
		for (g = !0, h = i.input.charCodeAt(++i.position), s = i.position; h !== 0 && !Cl(h);) h = i.input.charCodeAt(++i.position);
		for (r = i.input.slice(s, i.position), d = [], r.length < 1 && I(i, "directive name must not be less than one character in length"); h !== 0;) {
			for (; Va(h);) h = i.input.charCodeAt(++i.position);
			if (h === 35) {
				do h = i.input.charCodeAt(++i.position); while (h !== 0 && !st(h));
				break
			}
			if (st(h)) break;
			for (s = i.position; h !== 0 && !Cl(h);) h = i.input.charCodeAt(++i.position);
			d.push(i.input.slice(s, i.position))
		}
		h !== 0 && ys(i), ga.call(ip, r) ? ip[r](i, r, d) : Uo(i, 'unknown document directive "' + r + '"')
	}
	if ($e(i, !0, -1), i.lineIndent === 0 && i.input.charCodeAt(i.position) === 45 && i.input.charCodeAt(i.position + 1) === 45 && i.input.charCodeAt(i.position + 2) === 45 ? (i.position += 3, $e(i, !0, -1)) : g && I(i, "directives end mark is expected"), ji(i, i.lineIndent - 1, _o, !1, !0), $e(i, !0, -1), i.checkLineBreaks && _g.test(i.input.slice(o, i.position)) && Uo(i, "non-ASCII line breaks are interpreted as content"), i.documents.push(i.result), i.position === i.lineStart && Go(i)) {
		i.input.charCodeAt(i.position) === 46 && (i.position += 3, $e(i, !0, -1));
		return
	}
	if (i.position < i.length - 1) I(i, "end of the stream or a document separator is expected");
	else return
}

function Zp(i, o) {
	i = String(i), o = o || {}, i.length !== 0 && (i.charCodeAt(i.length - 1) !== 10 && i.charCodeAt(i.length - 1) !== 13 && (i += `
`), i.charCodeAt(0) === 65279 && (i = i.slice(1)));
	var s = new wg(i, o),
		r = i.indexOf("\0");
	for (r !== -1 && (s.position = r, I(s, "null byte is not allowed in input")), s.input += "\0"; s.input.charCodeAt(s.position) === 32;) s.lineIndent += 1, s.position += 1;
	for (; s.position < s.length - 1;) Ig(s);
	return s.documents
}

function Jg(i, o, s) {
	o !== null && typeof o == "object" && typeof s > "u" && (s = o, o = null);
	var r = Zp(i, s);
	if (typeof o != "function") return r;
	for (var d = 0, g = r.length; d < g; d += 1) o(r[d])
}

function $g(i, o) {
	var s = Zp(i, o);
	if (s.length !== 0) {
		if (s.length === 1) return s[0];
		throw new Tl("expected a single document in the stream, but found more")
	}
}
var Wg = Jg,
	eb = $g,
	Ip = {
		loadAll: Wg,
		load: eb
	},
	Jp = Object.prototype.toString,
	$p = Object.prototype.hasOwnProperty,
	xs = 65279,
	lb = 9,
	Wn = 10,
	tb = 13,
	ab = 32,
	ib = 33,
	nb = 34,
	fs = 35,
	ub = 37,
	ob = 38,
	cb = 39,
	rb = 42,
	Wp = 44,
	sb = 45,
	Ho = 58,
	fb = 61,
	db = 62,
	pb = 63,
	hb = 64,
	eh = 91,
	lh = 93,
	mb = 96,
	th = 123,
	gb = 124,
	ah = 125,
	Sl = {};
Sl[0] = "\\0";
Sl[7] = "\\a";
Sl[8] = "\\b";
Sl[9] = "\\t";
Sl[10] = "\\n";
Sl[11] = "\\v";
Sl[12] = "\\f";
Sl[13] = "\\r";
Sl[27] = "\\e";
Sl[34] = '\\"';
Sl[92] = "\\\\";
Sl[133] = "\\N";
Sl[160] = "\\_";
Sl[8232] = "\\L";
Sl[8233] = "\\P";
var bb = ["y", "Y", "yes", "Yes", "YES", "on", "On", "ON", "n", "N", "no", "No", "NO", "off", "Off", "OFF"],
	vb = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;

function yb(i, o) {
	var s, r, d, g, h, T, A;
	if (o === null) return {};
	for (s = {}, r = Object.keys(o), d = 0, g = r.length; d < g; d += 1) h = r[d], T = String(o[h]), h.slice(0, 2) === "!!" && (h = "tag:yaml.org,2002:" + h.slice(2)), A = i.compiledTypeMap.fallback[h], A && $p.call(A.styleAliases, T) && (T = A.styleAliases[T]), s[h] = T;
	return s
}

function Sb(i) {
	var o, s, r;
	if (o = i.toString(16).toUpperCase(), i <= 255) s = "x", r = 2;
	else if (i <= 65535) s = "u", r = 4;
	else if (i <= 4294967295) s = "U", r = 8;
	else throw new Tl("code point within a string may not be greater than 0xFFFFFFFF");
	return "\\" + s + tl.repeat("0", r - o.length) + o
}
var xb = 1,
	eu = 2;

function Tb(i) {
	this.schema = i.schema || vs, this.indent = Math.max(1, i.indent || 2), this.noArrayIndent = i.noArrayIndent || !1, this.skipInvalid = i.skipInvalid || !1, this.flowLevel = tl.isNothing(i.flowLevel) ? -1 : i.flowLevel, this.styleMap = yb(this.schema, i.styles || null), this.sortKeys = i.sortKeys || !1, this.lineWidth = i.lineWidth || 80, this.noRefs = i.noRefs || !1, this.noCompatMode = i.noCompatMode || !1, this.condenseFlow = i.condenseFlow || !1, this.quotingType = i.quotingType === '"' ? eu : xb, this.forceQuotes = i.forceQuotes || !1, this.replacer = typeof i.replacer == "function" ? i.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null
}

function op(i, o) {
	for (var s = tl.repeat(" ", o), r = 0, d = -1, g = "", h, T = i.length; r < T;) d = i.indexOf(`
`, r), d === -1 ? (h = i.slice(r), r = T) : (h = i.slice(r, d + 1), r = d + 1), h.length && h !== `
` && (g += s), g += h;
	return g
}

function ds(i, o) {
	return `
` + tl.repeat(" ", i.indent * o)
}

function Ab(i, o) {
	var s, r, d;
	for (s = 0, r = i.implicitTypes.length; s < r; s += 1)
		if (d = i.implicitTypes[s], d.resolve(o)) return !0;
	return !1
}

function jo(i) {
	return i === ab || i === lb
}

function lu(i) {
	return 32 <= i && i <= 126 || 161 <= i && i <= 55295 && i !== 8232 && i !== 8233 || 57344 <= i && i <= 65533 && i !== xs || 65536 <= i && i <= 1114111
}

function cp(i) {
	return lu(i) && i !== xs && i !== tb && i !== Wn
}

function rp(i, o, s) {
	var r = cp(i),
		d = r && !jo(i);
	return (s ? r : r && i !== Wp && i !== eh && i !== lh && i !== th && i !== ah) && i !== fs && !(o === Ho && !d) || cp(o) && !jo(o) && i === fs || o === Ho && d
}

function Eb(i) {
	return lu(i) && i !== xs && !jo(i) && i !== sb && i !== pb && i !== Ho && i !== Wp && i !== eh && i !== lh && i !== th && i !== ah && i !== fs && i !== ob && i !== rb && i !== ib && i !== gb && i !== fb && i !== db && i !== cb && i !== nb && i !== ub && i !== hb && i !== mb
}

function Mb(i) {
	return !jo(i) && i !== Ho
}

function In(i, o) {
	var s = i.charCodeAt(o),
		r;
	return s >= 55296 && s <= 56319 && o + 1 < i.length && (r = i.charCodeAt(o + 1), r >= 56320 && r <= 57343) ? (s - 55296) * 1024 + r - 56320 + 65536 : s
}

function ih(i) {
	var o = /^\n* /;
	return o.test(i)
}
var nh = 1,
	ps = 2,
	uh = 3,
	oh = 4,
	_i = 5;

function Lb(i, o, s, r, d, g, h, T) {
	var A, v = 0,
		C = null,
		y = !1,
		j = !1,
		R = r !== -1,
		J = -1,
		ie = Eb(In(i, 0)) && Mb(In(i, i.length - 1));
	if (o || h)
		for (A = 0; A < i.length; v >= 65536 ? A += 2 : A++) {
			if (v = In(i, A), !lu(v)) return _i;
			ie = ie && rp(v, C, T), C = v
		} else {
			for (A = 0; A < i.length; v >= 65536 ? A += 2 : A++) {
				if (v = In(i, A), v === Wn) y = !0, R && (j = j || A - J - 1 > r && i[J + 1] !== " ", J = A);
				else if (!lu(v)) return _i;
				ie = ie && rp(v, C, T), C = v
			}
			j = j || R && A - J - 1 > r && i[J + 1] !== " "
		}
	return !y && !j ? ie && !h && !d(i) ? nh : g === eu ? _i : ps : s > 9 && ih(i) ? _i : h ? g === eu ? _i : ps : j ? oh : uh
}

function Db(i, o, s, r, d) {
	i.dump = function() {
		if (o.length === 0) return i.quotingType === eu ? '""' : "''";
		if (!i.noCompatMode && (bb.indexOf(o) !== -1 || vb.test(o))) return i.quotingType === eu ? '"' + o + '"' : "'" + o + "'";
		var g = i.indent * Math.max(1, s),
			h = i.lineWidth === -1 ? -1 : Math.max(Math.min(i.lineWidth, 40), i.lineWidth - g),
			T = r || i.flowLevel > -1 && s >= i.flowLevel;

		function A(v) {
			return Ab(i, v)
		}
		switch (Lb(o, T, i.indent, h, A, i.quotingType, i.forceQuotes && !r, d)) {
			case nh:
				return o;
			case ps:
				return "'" + o.replace(/'/g, "''") + "'";
			case uh:
				return "|" + sp(o, i.indent) + fp(op(o, g));
			case oh:
				return ">" + sp(o, i.indent) + fp(op(Bb(o, h), g));
			case _i:
				return '"' + Cb(o) + '"';
			default:
				throw new Tl("impossible error: invalid scalar style")
		}
	}()
}

function sp(i, o) {
	var s = ih(i) ? String(o) : "",
		r = i[i.length - 1] === `
`,
		d = r && (i[i.length - 2] === `
` || i === `
`),
		g = d ? "+" : r ? "" : "-";
	return s + g + `
`
}

function fp(i) {
	return i[i.length - 1] === `
` ? i.slice(0, -1) : i
}

function Bb(i, o) {
	for (var s = /(\n+)([^\n]*)/g, r = function() {
			var v = i.indexOf(`
`);
			return v = v !== -1 ? v : i.length, s.lastIndex = v, dp(i.slice(0, v), o)
		}(), d = i[0] === `
` || i[0] === " ", g, h; h = s.exec(i);) {
		var T = h[1],
			A = h[2];
		g = A[0] === " ", r += T + (!d && !g && A !== "" ? `
` : "") + dp(A, o), d = g
	}
	return r
}

function dp(i, o) {
	if (i === "" || i[0] === " ") return i;
	for (var s = / [^ ]/g, r, d = 0, g, h = 0, T = 0, A = ""; r = s.exec(i);) T = r.index, T - d > o && (g = h > d ? h : T, A += `
` + i.slice(d, g), d = g + 1), h = T;
	return A += `
`, i.length - d > o && h > d ? A += i.slice(d, h) + `
` + i.slice(h + 1) : A += i.slice(d), A.slice(1)
}

function Cb(i) {
	for (var o = "", s = 0, r, d = 0; d < i.length; s >= 65536 ? d += 2 : d++) s = In(i, d), r = Sl[s], !r && lu(s) ? (o += i[d], s >= 65536 && (o += i[d + 1])) : o += r || Sb(s);
	return o
}

function Nb(i, o, s) {
	var r = "",
		d = i.tag,
		g, h, T;
	for (g = 0, h = s.length; g < h; g += 1) T = s[g], i.replacer && (T = i.replacer.call(s, String(g), T)), (kt(i, o, T, !1, !1) || typeof T > "u" && kt(i, o, null, !1, !1)) && (r !== "" && (r += "," + (i.condenseFlow ? "" : " ")), r += i.dump);
	i.tag = d, i.dump = "[" + r + "]"
}

function pp(i, o, s, r) {
	var d = "",
		g = i.tag,
		h, T, A;
	for (h = 0, T = s.length; h < T; h += 1) A = s[h], i.replacer && (A = i.replacer.call(s, String(h), A)), (kt(i, o + 1, A, !0, !0, !1, !0) || typeof A > "u" && kt(i, o + 1, null, !0, !0, !1, !0)) && ((!r || d !== "") && (d += ds(i, o)), i.dump && Wn === i.dump.charCodeAt(0) ? d += "-" : d += "- ", d += i.dump);
	i.tag = g, i.dump = d || "[]"
}

function Ob(i, o, s) {
	var r = "",
		d = i.tag,
		g = Object.keys(s),
		h, T, A, v, C;
	for (h = 0, T = g.length; h < T; h += 1) C = "", r !== "" && (C += ", "), i.condenseFlow && (C += '"'), A = g[h], v = s[A], i.replacer && (v = i.replacer.call(s, A, v)), kt(i, o, A, !1, !1) && (i.dump.length > 1024 && (C += "? "), C += i.dump + (i.condenseFlow ? '"' : "") + ":" + (i.condenseFlow ? "" : " "), kt(i, o, v, !1, !1) && (C += i.dump, r += C));
	i.tag = d, i.dump = "{" + r + "}"
}

function kb(i, o, s, r) {
	var d = "",
		g = i.tag,
		h = Object.keys(s),
		T, A, v, C, y, j;
	if (i.sortKeys === !0) h.sort();
	else if (typeof i.sortKeys == "function") h.sort(i.sortKeys);
	else if (i.sortKeys) throw new Tl("sortKeys must be a boolean or a function");
	for (T = 0, A = h.length; T < A; T += 1) j = "", (!r || d !== "") && (j += ds(i, o)), v = h[T], C = s[v], i.replacer && (C = i.replacer.call(s, v, C)), kt(i, o + 1, v, !0, !0, !0) && (y = i.tag !== null && i.tag !== "?" || i.dump && i.dump.length > 1024, y && (i.dump && Wn === i.dump.charCodeAt(0) ? j += "?" : j += "? "), j += i.dump, y && (j += ds(i, o)), kt(i, o + 1, C, !0, y) && (i.dump && Wn === i.dump.charCodeAt(0) ? j += ":" : j += ": ", j += i.dump, d += j));
	i.tag = g, i.dump = d || "{}"
}

function hp(i, o, s) {
	var r, d, g, h, T, A;
	for (d = s ? i.explicitTypes : i.implicitTypes, g = 0, h = d.length; g < h; g += 1)
		if (T = d[g], (T.instanceOf || T.predicate) && (!T.instanceOf || typeof o == "object" && o instanceof T.instanceOf) && (!T.predicate || T.predicate(o))) {
			if (s ? T.multi && T.representName ? i.tag = T.representName(o) : i.tag = T.tag : i.tag = "?", T.represent) {
				if (A = i.styleMap[T.tag] || T.defaultStyle, Jp.call(T.represent) === "[object Function]") r = T.represent(o, A);
				else if ($p.call(T.represent, A)) r = T.represent[A](o, A);
				else throw new Tl("!<" + T.tag + '> tag resolver accepts not "' + A + '" style');
				i.dump = r
			}
			return !0
		} return !1
}

function kt(i, o, s, r, d, g, h) {
	i.tag = null, i.dump = s, hp(i, s, !1) || hp(i, s, !0);
	var T = Jp.call(i.dump),
		A = r,
		v;
	r && (r = i.flowLevel < 0 || i.flowLevel > o);
	var C = T === "[object Object]" || T === "[object Array]",
		y, j;
	if (C && (y = i.duplicates.indexOf(s), j = y !== -1), (i.tag !== null && i.tag !== "?" || j || i.indent !== 2 && o > 0) && (d = !1), j && i.usedDuplicates[y]) i.dump = "*ref_" + y;
	else {
		if (C && j && !i.usedDuplicates[y] && (i.usedDuplicates[y] = !0), T === "[object Object]") r && Object.keys(i.dump).length !== 0 ? (kb(i, o, i.dump, d), j && (i.dump = "&ref_" + y + i.dump)) : (Ob(i, o, i.dump), j && (i.dump = "&ref_" + y + " " + i.dump));
		else if (T === "[object Array]") r && i.dump.length !== 0 ? (i.noArrayIndent && !h && o > 0 ? pp(i, o - 1, i.dump, d) : pp(i, o, i.dump, d), j && (i.dump = "&ref_" + y + i.dump)) : (Nb(i, o, i.dump), j && (i.dump = "&ref_" + y + " " + i.dump));
		else if (T === "[object String]") i.tag !== "?" && Db(i, i.dump, o, g, A);
		else {
			if (T === "[object Undefined]") return !1;
			if (i.skipInvalid) return !1;
			throw new Tl("unacceptable kind of an object to dump " + T)
		}
		i.tag !== null && i.tag !== "?" && (v = encodeURI(i.tag[0] === "!" ? i.tag.slice(1) : i.tag).replace(/!/g, "%21"), i.tag[0] === "!" ? v = "!" + v : v.slice(0, 18) === "tag:yaml.org,2002:" ? v = "!!" + v.slice(18) : v = "!<" + v + ">", i.dump = v + " " + i.dump)
	}
	return !0
}

function zb(i, o) {
	var s = [],
		r = [],
		d, g;
	for (hs(i, s, r), d = 0, g = r.length; d < g; d += 1) o.duplicates.push(s[r[d]]);
	o.usedDuplicates = new Array(g)
}

function hs(i, o, s) {
	var r, d, g;
	if (i !== null && typeof i == "object")
		if (d = o.indexOf(i), d !== -1) s.indexOf(d) === -1 && s.push(d);
		else if (o.push(i), Array.isArray(i))
		for (d = 0, g = i.length; d < g; d += 1) hs(i[d], o, s);
	else
		for (r = Object.keys(i), d = 0, g = r.length; d < g; d += 1) hs(i[r[d]], o, s)
}

function _b(i, o) {
	o = o || {};
	var s = new Tb(o);
	s.noRefs || zb(i, s);
	var r = i;
	return s.replacer && (r = s.replacer.call({
		"": r
	}, "", r)), kt(s, 0, r, !0, !0) ? s.dump + `
` : ""
}
var Ub = _b,
	Hb = {
		dump: Ub
	};

function Ts(i, o) {
	return function() {
		throw new Error("Function yaml." + i + " is removed in js-yaml 4. Use yaml." + o + " instead, which is now safe by default.")
	}
}
var jb = ml,
	Gb = Ap,
	Rb = Dp,
	wb = kp,
	Fb = zp,
	Vb = vs,
	Yb = Ip.load,
	qb = Ip.loadAll,
	Kb = Hb.dump,
	Qb = Tl,
	Pb = {
		binary: Gp,
		float: Op,
		map: Lp,
		null: Bp,
		pairs: wp,
		set: Fp,
		timestamp: Hp,
		bool: Cp,
		int: Np,
		merge: jp,
		omap: Rp,
		seq: Mp,
		str: Ep
	},
	Xb = Ts("safeLoad", "load"),
	Zb = Ts("safeLoadAll", "loadAll"),
	Ib = Ts("safeDump", "dump"),
	mp = {
		Type: jb,
		Schema: Gb,
		FAILSAFE_SCHEMA: Rb,
		JSON_SCHEMA: wb,
		CORE_SCHEMA: Fb,
		DEFAULT_SCHEMA: Vb,
		load: Yb,
		loadAll: qb,
		dump: Kb,
		YAMLException: Qb,
		types: Pb,
		safeLoad: Xb,
		safeLoadAll: Zb,
		safeDump: Ib
	};
const Jn = ["x264enc", "nvh264enc", "x264enc-striped", "jpeg"],
	Kn = [8, 12, 15, 24, 25, 30, 48, 50, 60, 90, 100, 120, 144, 165],
	Qn = [1e3, 2e3, 4e3, 8e3, 1e4, 12e3, 14e3, 16e3, 18e3, 2e4, 25e3, 3e4, 35e3, 4e4, 45e3, 5e4, 6e4, 7e4, 8e4, 9e4, 1e5],
	Pn = Array.from({
		length: 16
	}, (i, o) => o),
	Xn = [50, 45, 40, 35, 30, 25, 20, 10, 1],
	Jb = ["", "1920x1080", "1280x720", "1366x768", "1920x1200", "2560x1440", "3840x2160", "1024x768", "800x600", "640x480", "320x240"],
	as = [{
		label: "100%",
		value: 96
	}, {
		label: "125%",
		value: 120
	}, {
		label: "150%",
		value: 144
	}, {
		label: "175%",
		value: 168
	}, {
		label: "200%",
		value: 192
	}, {
		label: "225%",
		value: 216
	}, {
		label: "250%",
		value: 240
	}, {
		label: "275%",
		value: 264
	}, {
		label: "300%",
		value: 288
	}],
	is = 96,
	$b = 100,
	Wb = 10,
	Do = 60,
	ns = 8e3,
	us = 0,
	os = Jn[0],
	cs = 25,
	ev = !0,
	ch = "https://raw.githubusercontent.com/linuxserver/proot-apps/master/metadata/",
	lv = `${ch}metadata.yml`,
	gp = `${ch}img/`,
	Bo = 3,
	bp = 5e3,
	rs = 8e3,
	tv = 500,
	Co = "touch-gamepad-host";

function No(i, o = 2, s) {
	const r = (s == null ? void 0 : s.zeroBytes) || "0 Bytes";
	if (i == null || i === 0) return r;
	const d = 1024,
		g = o < 0 ? 0 : o,
		h = (s == null ? void 0 : s.byteUnits) || ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		T = Math.floor(Math.log(i) / Math.log(d)),
		A = Math.min(T, h.length - 1);
	return parseFloat((i / Math.pow(d, T)).toFixed(g)) + " " + h[A]
}
const zi = (i, o, s) => {
		const r = Math.max(0, Math.min(100, i || 0));
		return s * (1 - r / 100)
	},
	Oo = i => {
		const o = parseInt(i, 10);
		return isNaN(o) ? 0 : Math.floor(o / 2) * 2
	};

function Zn(i, o) {
	let s;
	return function(...r) {
		const d = this;
		clearTimeout(s), s = setTimeout(() => {
			i.apply(d, r)
		}, o)
	}
}
const av = () => p.jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		width: "16",
		height: "16",
		style: {
			display: "block"
		},
		children: p.jsx("path", {
			d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
		})
	}),
	iv = () => p.jsxs("svg", {
		viewBox: "0 0 24 24",
		stroke: "currentColor",
		strokeWidth: "2",
		fill: "none",
		width: "18",
		height: "18",
		children: [p.jsx("circle", {
			cx: "12",
			cy: "12",
			r: "1.5",
			fill: "currentColor"
		}), p.jsx("path", {
			d: "M12 5V9M12 15V19M5 12H9M15 12H19",
			strokeLinecap: "round"
		})]
	}),
	nv = () => p.jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		width: "20",
		height: "20",
		children: p.jsx("path", {
			d: "M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"
		})
	}),
	uv = () => p.jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 490 490",
		fill: "currentColor",
		width: "24",
		height: "24",
		children: p.jsx("path", {
			d: "M251.2 193.5v-53.7a10.5 10.5 0 0 1 10.5-10.5h119.4c21 0 38.1-17.1 38.1-38.1s-17.1-38.1-38.1-38.1H129.5c-5.4 0-10.1 4.3-10.1 10.1s4.3 10.1 10.1 10.1h251.6c10.1 0 17.9 8.2 17.9 17.9 0 10.1-8.2 17.9-17.9 17.9H261.7c-16.7 0-30.3 13.6-30.3 30.3v53.3H0v244.2h490V193.5H251.2zm-19 28h15.6c5.4 0 10.1 4.3 10.1 10.1s-4.3 10.1-10.1 10.1h-15.6c-5.4 0-10.1-4.3-10.1-10.1s4.6-10.1 10.1-10.1zm-28.8 104.2h-15.6c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1 0 5.4-4.7 10.1-10.1 10.1zm10.1 27.2c0 5.4-4.3 10.1-10.1 10.1h-15.6c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.7 10.1 10.1zM203.4 288h-15.6c-5.4 0-10.1-4.3-10.1-10.1s4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1s-4.7 10.1-10.1 10.1zm-17.1-66.5h15.6c5.4 0 10.1 4.3 10.1 10.1s-4.3 10.1-10.1 10.1h-15.6c-5.4 0-10.1-4.3-10.1-10.1s4.6-10.1 10.1-10.1zm-45.9 0H156c5.4 0 10.1 4.3 10.1 10.1s-4.3 10.1-10.1 10.1h-15.6c-5.4 0-10.1-4.3-10.1-10.1s4.6-10.1 10.1-10.1zm-1.6 46.6h15.6c5.4 0 10.1 4.3 10.1 10.1s-4.3 10.1-10.1 10.1h-15.6c-5.4 0-10.1-4.3-10.1-10.1s4.7-10.1 10.1-10.1zm0 37.4h15.6c5.4 0 10.1 4.3 10.1 10.1 0 5.4-4.3 10.1-10.1 10.1h-15.6c-5.4 0-10.1-4.3-10.1-10.1 0-5.5 4.7-10.1 10.1-10.1zm0 37.3h15.6c5.4 0 10.1 4.3 10.1 10.1 0 5.4-4.3 10.1-10.1 10.1h-15.6c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.7-10.1 10.1-10.1zM94.5 221.5h15.6c5.4 0 10.1 4.3 10.1 10.1s-4.3 10.1-10.1 10.1H94.5c-5.4 0-10.1-4.3-10.1-10.1s4.7-10.1 10.1-10.1zm-5.1 46.6H105c5.4 0 10.1 4.3 10.1 10.1s-4.3 10.1-10.1 10.1H89.4c-5.4 0-10.1-4.3-10.1-10.1s4.7-10.1 10.1-10.1zm0 37.4H105c5.4 0 10.1 4.3 10.1 10.1 0 5.4-4.3 10.1-10.1 10.1H89.4c-5.4 0-10.1-4.3-10.1-10.1.4-5.5 4.7-10.1 10.1-10.1zm0 37.3H105c5.4 0 10.1 4.3 10.1 10.1 0 5.4-4.3 10.1-10.1 10.1H89.4c-5.4 0-10.1-4.3-10.1-10.1.4-5.4 4.7-10.1 10.1-10.1zM56 400.4H40.4c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1H56c5.4 0 10.1 4.3 10.1 10.1-.4 5.4-4.7 10.1-10.1 10.1zm0-37.4H40.4c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1H56c5.4 0 10.1 4.3 10.1 10.1-.4 5.5-4.7 10.1-10.1 10.1zm0-37.3H40.4c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1H56c5.4 0 10.1 4.3 10.1 10.1-.4 5.4-4.7 10.1-10.1 10.1zm0-37.7H40.4c-5.4 0-10.1-4.3-10.1-10.1s4.3-10.1 10.1-10.1H56c5.4 0 10.1 4.3 10.1 10.1S61.4 288 56 288zm0-46.7H40.4c-5.4 0-10.1-4.3-10.1-10.1s4.3-10.1 10.1-10.1H56c5.4 0 10.1 4.3 10.1 10.1s-4.7 10.1-10.1 10.1zm196.8 159.1H89.4c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h163.3c5.4 0 10.1 4.3 10.1 10.1.1 5.4-4.6 10.1-10 10.1zm0-37.4h-15.6c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1 0 5.5-4.7 10.1-10.1 10.1zm0-37.3h-15.6c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1 0 5.4-4.7 10.1-10.1 10.1zm0-37.7h-15.6c-5.4 0-10.1-4.3-10.1-10.1s4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1s-4.7 10.1-10.1 10.1zm49.4 112.4h-15.6c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1-.4 5.4-4.7 10.1-10.1 10.1zm0-37.4h-15.6c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1-.4 5.5-4.7 10.1-10.1 10.1zm0-37.3h-15.6c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1-.4 5.4-4.7 10.1-10.1 10.1zm0-37.7h-15.6c-5.4 0-10.1-4.3-10.1-10.1s4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1s-4.7 10.1-10.1 10.1zm10.1-46.7h-15.6c-5.4 0-10.1-4.3-10.1-10.1s4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1s-4.7 10.1-10.1 10.1zm38.9 159.1h-15.6c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1 0 5.4-4.7 10.1-10.1 10.1zm0-37.4h-15.6c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1 0 5.5-4.7 10.1-10.1 10.1zm0-37.3h-15.6c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1 0 5.4-4.7 10.1-10.1 10.1zm0-37.7h-15.6c-5.4 0-10.1-4.3-10.1-10.1s4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1s-4.7 10.1-10.1 10.1zm6.6-46.7h-15.6c-5.4 0-10.1-4.3-10.1-10.1s4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1s-4.3 10.1-10.1 10.1zm42.8 159.1H385c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1-.4 5.4-4.7 10.1-10.1 10.1zm0-37.4H385c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1-.4 5.5-4.7 10.1-10.1 10.1zm0-37.3H385c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1-.4 5.4-4.7 10.1-10.1 10.1zm0-37.7H385c-5.4 0-10.1-4.3-10.1-10.1s4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1S406 288 400.6 288zm3.1-46.7h-15.6c-5.4 0-10.1-4.3-10.1-10.1s4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1s-4.3 10.1-10.1 10.1zm45.9 159.1H434c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1 0 5.4-4.7 10.1-10.1 10.1zm0-37.4H434c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1 0 5.5-4.7 10.1-10.1 10.1zm0-37.3H434c-5.4 0-10.1-4.3-10.1-10.1 0-5.4 4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1 0 5.4-4.7 10.1-10.1 10.1zm0-37.7H434c-5.4 0-10.1-4.3-10.1-10.1s4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1S455 288 449.6 288zm0-46.7H434c-5.4 0-10.1-4.3-10.1-10.1s4.3-10.1 10.1-10.1h15.6c5.4 0 10.1 4.3 10.1 10.1s-4.7 10.1-10.1 10.1z"
		})
	}),
	ov = () => p.jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		width: "20",
		height: "20",
		children: p.jsx("path", {
			d: "M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"
		})
	}),
	cv = () => p.jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		width: "20",
		height: "20",
		children: p.jsx("path", {
			d: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
		})
	}),
	rv = () => p.jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		width: "20",
		height: "20",
		children: p.jsx("path", {
			d: "M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"
		})
	}),
	vp = () => p.jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		width: "20",
		height: "20",
		children: p.jsx("path", {
			d: "M15 7.5V2H9v5.5l3 3 3-3zM7.5 9H2v6h5.5l3-3-3-3zM9 16.5V22h6v-5.5l-3-3-3 3zM16.5 9l-3 3 3 3H22V9h-5.5z"
		})
	}),
	sv = () => p.jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		width: "18",
		height: "18",
		children: p.jsx("path", {
			d: "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
		})
	}),
	Nt = () => p.jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		width: "18",
		height: "18",
		style: {
			display: "block"
		},
		children: p.jsx("path", {
			d: "M7 10l5 5 5-5H7z"
		})
	}),
	Ot = () => p.jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		width: "18",
		height: "18",
		style: {
			display: "block"
		},
		children: p.jsx("path", {
			d: "M7 14l5-5 5 5H7z"
		})
	}),
	rh = () => p.jsx("svg", {
		width: "18",
		height: "18",
		viewBox: "0 0 38 38",
		xmlns: "http://www.w3.org/2000/svg",
		stroke: "currentColor",
		children: p.jsx("g", {
			fill: "none",
			fillRule: "evenodd",
			children: p.jsxs("g", {
				transform: "translate(1 1)",
				strokeWidth: "3",
				children: [p.jsx("circle", {
					strokeOpacity: ".3",
					cx: "18",
					cy: "18",
					r: "18"
				}), p.jsx("path", {
					d: "M36 18c0-9.94-8.06-18-18-18",
					children: p.jsx("animateTransform", {
						attributeName: "transform",
						type: "rotate",
						from: "0 18 18",
						to: "360 18 18",
						dur: "0.8s",
						repeatCount: "indefinite"
					})
				})]
			})
		})
	}),
	fv = ({
		width: i = 30,
		height: o = 30,
		className: s,
		t: r,
		...d
	}) => p.jsxs("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 200 200",
		width: i,
		height: o,
		className: s,
		role: "img",
		"aria-label": r("selkiesLogoAlt"),
		...d,
		children: [p.jsx("path", {
			fill: "#61dafb",
			d: "M156.825 120.999H5.273l-.271-1.13 87.336-43.332-7.278 17.696c4 1.628 6.179.541 7.907-2.974l26.873-53.575c1.198-2.319 3.879-4.593 6.358-5.401 9.959-3.249 20.065-6.091 30.229-8.634 1.9-.475 4.981.461 6.368 1.873 4.067 4.142 7.32 9.082 11.379 13.233 1.719 1.758 4.572 2.964 7.058 3.29 4.094.536 8.311.046 12.471.183 5.2.171 6.765 2.967 4.229 7.607-2.154 3.942-4.258 7.97-6.94 11.542-1.264 1.684-3.789 3.274-5.82 3.377-7.701.391-15.434.158-23.409 1.265 2.214 1.33 4.301 2.981 6.67 3.919 4.287 1.698 5.76 4.897 6.346 9.162 1.063 7.741 2.609 15.417 3.623 23.164.22 1.677-.464 3.971-1.579 5.233-3.521 3.987-7.156 7.989-11.332 11.232-2.069 1.607-5.418 1.565-8.664 2.27m-3.804-69.578c5.601.881 6.567-5.024 11.089-6.722l-9.884-7.716-11.299 9.983 10.094 4.455z"
		}), p.jsx("path", {
			fill: "#61dafb",
			d: "M86 131.92c7.491 0 14.495.261 21.467-.1 4.011-.208 6.165 1.249 7.532 4.832 1.103 2.889 2.605 5.626 4.397 9.419h-93.41l5.163 24.027-1.01.859c-3.291-2.273-6.357-5.009-9.914-6.733-11.515-5.581-17.057-14.489-16.403-27.286.073-1.423-.287-2.869-.525-5.019H86z"
		}), p.jsx("path", {
			fill: "#61dafb",
			d: "M129.004 164.999l1.179-1.424c9.132-10.114 9.127-10.11 2.877-22.425l-4.552-9.232c4.752 0 8.69.546 12.42-.101 11.96-2.075 20.504 1.972 25.74 13.014.826 1.743 2.245 3.205 3.797 5.361-9.923 7.274-19.044 15.174-29.357 20.945-4.365 2.443-11.236.407-17.714.407l5.611-6.545z"
		}), p.jsx("path", {
			fill: "#FFFFFF",
			d: "M152.672 51.269l-9.745-4.303 11.299-9.983 9.884 7.716c-4.522 1.698-5.488 7.602-11.439 6.57z"
		})]
	}),
	ko = "prootInstalledApps";

function dv({
	isOpen: i,
	onClose: o,
	t: s
}) {
	var Pe;
	const [r, d] = w.useState(null), [g, h] = w.useState(!1), [T, A] = w.useState(null), [v, C] = w.useState(""), [y, j] = w.useState(null), [R, J] = w.useState(() => {
		const $ = localStorage.getItem(ko);
		if ($) try {
			const ge = JSON.parse($);
			if (Array.isArray(ge) && ge.every(Xe => typeof Xe == "string")) return ge;
			console.warn("Invalid data found in localStorage for installed apps. Resetting."), localStorage.removeItem(ko)
		} catch (ge) {
			console.error("Failed to parse installed apps from localStorage:", ge), localStorage.removeItem(ko)
		}
		return []
	});
	w.useEffect(() => {
		localStorage.setItem(ko, JSON.stringify(R))
	}, [R]), w.useEffect(() => {
		i && !r && !g && (async () => {
			h(!0), A(null);
			try {
				const ge = await fetch(lv);
				if (!ge.ok) throw new Error(`HTTP error! status: ${ge.status}`);
				const Xe = await ge.text(),
					Ze = mp.load(Xe);
				d(Ze)
			} catch (ge) {
				console.error("Failed to fetch or parse app data:", ge), A(s("appsModal.errorLoading", "Failed to load app data. Please try again."))
			} finally {
				h(!1)
			}
		})()
	}, [i, r, g, s, mp]);
	const ie = $ => C($.target.value.toLowerCase()),
		oe = $ => j($),
		Ne = () => j(null),
		ue = $ => {
			console.log(`Install app: ${$}`), window.postMessage({
				type: "command",
				value: `st ~/.local/bin/proot-apps install ${$}`
			}, window.location.origin), J(ge => ge.includes($) ? ge : [...ge, $])
		},
		_e = $ => {
			console.log(`Remove app: ${$}`), window.postMessage({
				type: "command",
				value: `st ~/.local/bin/proot-apps remove ${$}`
			}, window.location.origin), J(ge => ge.filter(Xe => Xe !== $))
		},
		al = $ => {
			console.log(`Update app: ${$}`), window.postMessage({
				type: "command",
				value: `st ~/.local/bin/proot-apps update ${$}`
			}, window.location.origin)
		},
		fe = ((Pe = r == null ? void 0 : r.include) == null ? void 0 : Pe.filter($ => {
			var ge, Xe, Ze;
			return !$.disabled && (((ge = $.full_name) == null ? void 0 : ge.toLowerCase().includes(v)) || ((Xe = $.name) == null ? void 0 : Xe.toLowerCase().includes(v)) || ((Ze = $.description) == null ? void 0 : Ze.toLowerCase().includes(v)))
		})) || [],
		Re = $ => R.includes($);
	return i ? p.jsxs("div", {
		className: "apps-modal",
		children: [p.jsx("button", {
			className: "apps-modal-close",
			onClick: o,
			"aria-label": s("appsModal.closeAlt", "Close apps modal"),
			children: "×"
		}), p.jsxs("div", {
			className: "apps-modal-content",
			children: [g && p.jsxs("div", {
				className: "apps-modal-loading",
				children: [p.jsx(rh, {}), p.jsx("p", {
					children: s("appsModal.loading", "Loading apps...")
				})]
			}), T && p.jsx("p", {
				className: "apps-modal-error",
				children: T
			}), !g && !T && r && p.jsx(p.Fragment, {
				children: y ? p.jsxs("div", {
					className: "app-detail-view",
					children: [p.jsxs("button", {
						onClick: Ne,
						className: "app-detail-back-button",
						children: ["← ", s("appsModal.backButton", "Back to list")]
					}), p.jsx("img", {
						src: `${gp}${y.icon}`,
						alt: y.full_name,
						className: "app-detail-icon",
						onError: $ => {
							$.target.style.display = "none"
						}
					}), p.jsx("h2", {
						children: y.full_name
					}), p.jsx("p", {
						className: "app-detail-description",
						children: y.description
					}), p.jsx("div", {
						className: "app-action-buttons",
						children: Re(y.name) ? p.jsxs(p.Fragment, {
							children: [p.jsxs("button", {
								onClick: () => al(y.name),
								className: "app-action-button update",
								children: [s("appsModal.updateButton", "Update"), " ", y.name]
							}), p.jsxs("button", {
								onClick: () => _e(y.name),
								className: "app-action-button remove",
								children: [s("appsModal.removeButton", "Remove"), " ", y.name]
							})]
						}) : p.jsxs("button", {
							onClick: () => ue(y.name),
							className: "app-action-button install",
							children: [s("appsModal.installButton", "Install"), " ", y.name]
						})
					})]
				}) : p.jsxs(p.Fragment, {
					children: [p.jsx("input", {
						type: "text",
						className: "apps-search-bar allow-native-input",
						placeholder: s("appsModal.searchPlaceholder", "Search apps..."),
						value: v,
						onChange: ie
					}), p.jsx("div", {
						className: "apps-grid",
						children: fe.length > 0 ? fe.map($ => p.jsxs("div", {
							className: "app-card",
							onClick: () => oe($),
							children: [p.jsx("img", {
								src: `${gp}${$.icon}`,
								alt: $.full_name,
								className: "app-card-icon",
								loading: "lazy",
								onError: ge => {
									ge.target.style.visibility = "hidden"
								}
							}), p.jsx("p", {
								className: "app-card-name",
								children: $.full_name
							}), Re($.name) && p.jsx("div", {
								className: "app-card-installed-badge",
								children: s("appsModal.installedBadge", "Installed")
							})]
						}, $.name)) : p.jsx("p", {
							children: s("appsModal.noAppsFound", "No apps found matching your search.")
						})
					})]
				})
			})]
		})]
	}) : null
}

function pv({
	isOpen: i
}) {
	const [o, s] = w.useState("en"), [r, d] = w.useState(() => W0("en")), [g, h] = w.useState(!1), [T, A] = w.useState(!1), [v, C] = w.useState(!1);
	w.useEffect(() => {
		const b = navigator.language || navigator.userLanguage || "en",
			H = b.split("-")[0].toLowerCase();
		console.log(`Dashboard: Detected browser language: ${b}, using primary: ${H}`), s(H), d(W0(H))
	}, []), w.useEffect(() => {
		const b = typeof window < "u" && (navigator.userAgentData && navigator.userAgentData.mobile || /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
		h(!!b), b && Gt(H => ({
			...H,
			gamepads: !0
		})), navigator.userAgentData && navigator.userAgentData.mobile !== void 0 ? console.log("Dashboard: Mobile detected via userAgentData.mobile:", navigator.userAgentData.mobile) : typeof navigator.userAgent == "string" ? console.log("Dashboard: Mobile detected via userAgent string match:", /Mobi|Android/i.test(navigator.userAgent)) : console.warn("Dashboard: Mobile detection methods not fully available. Mobile status set to:", !!b)
	}, []);
	const {
		t: y,
		raw: j
	} = r, [R, J] = w.useState(localStorage.getItem("theme") || "dark"), [ie, oe] = w.useState(localStorage.getItem("encoder") || os), [Ne, ue] = w.useState(Jn), [_e, al] = w.useState(parseInt(localStorage.getItem("videoFramerate"), 10) || Do), [fe, Re] = w.useState(parseInt(localStorage.getItem("videoBitRate"), 10) || ns), [Pe, $] = w.useState(parseInt(localStorage.getItem("videoBufferSize"), 10) || us), [ge, Xe] = w.useState(parseInt(localStorage.getItem("videoCRF"), 10) || cs), [Ze, we] = w.useState(localStorage.getItem("h264_fullcolor") === "true"), [ft, Rl] = w.useState(parseInt(localStorage.getItem("scalingDPI"), 10) || is), [We, N] = w.useState(""), [F, X] = w.useState(""), [ve, S] = w.useState(() => {
		const b = localStorage.getItem("scaleLocallyManual");
		return b !== null ? b === "true" : ev
	}), [U, Y] = w.useState(() => {
		const b = localStorage.getItem("hidpiEnabled");
		return b !== null ? b === "true" : !!0
	}), [V, Q] = w.useState(""), [pe, ne] = w.useState(0), [il, Be] = w.useState(0), [Nl, Gi] = w.useState(0), [dt, Ri] = w.useState(0), [Ya, wi] = w.useState(0), [tu, Ro] = w.useState(0), [Al, wo] = w.useState(null), [qa, au] = w.useState(null), [zt, Fo] = w.useState(null), [Ka, Vo] = w.useState(null), [iu, _t] = w.useState(null), [gl, Wl] = w.useState({
		x: 0,
		y: 0
	}), [cl, nu] = w.useState(!0), [Fi, uu] = w.useState(!0), [Ut, ba] = w.useState(!1), [Pl, Ht] = w.useState(!0), [va, ou] = w.useState(""), [cu, Vi] = w.useState([]), [Yi, jt] = w.useState([]), [Yo, Qa] = w.useState("default"), [ru, ya] = w.useState("default"), [Pa, su] = w.useState(!1), [Sa, Xl] = w.useState(null), [Fe, rl] = w.useState(!1), [et, qi] = w.useState({}), [fu, qo] = w.useState(!1), [ye, Gt] = w.useState({
		settings: !1,
		audioSettings: !1,
		screenSettings: !1,
		stats: !1,
		clipboard: !1,
		gamepads: !1,
		files: !1,
		apps: !1,
		sharing: !1
	}), [Ki, Ol] = w.useState([]), Ve = w.useRef({}), [Rt, wt] = w.useState(!1), [Ue, du] = w.useState(!1), Ft = 500, pt = w.useCallback(Zn(b => {
		localStorage.setItem("videoFramerate", b.toString()), window.postMessage({
			type: "settings",
			settings: {
				videoFramerate: b
			}
		}, window.location.origin)
	}, Ft), []), Vt = w.useCallback(Zn(b => {
		localStorage.setItem("videoBitRate", b.toString()), window.postMessage({
			type: "settings",
			settings: {
				videoBitRate: b
			}
		}, window.location.origin)
	}, Ft), []), Ko = w.useCallback(Zn(b => {
		localStorage.setItem("videoBufferSize", b.toString()), window.postMessage({
			type: "settings",
			settings: {
				videoBufferSize: b
			}
		}, window.location.origin)
	}, Ft), []), pu = w.useCallback(Zn(b => {
		localStorage.setItem("videoCRF", b.toString()), window.postMessage({
			type: "settings",
			settings: {
				videoCRF: b
			}
		}, window.location.origin)
	}, Ft), []), hu = w.useCallback(Zn(b => {
		localStorage.setItem("h264_fullcolor", b.toString()), window.postMessage({
			type: "settings",
			settings: {
				h264_fullcolor: b
			}
		}, window.location.origin)
	}, Ft), []), Qo = b => {
		const H = parseInt(b.target.value, 10);
		Rl(H), localStorage.setItem("scalingDPI", H.toString()), window.postMessage({
			type: "settings",
			settings: {
				SCALING_DPI: H
			}
		}, window.location.origin);
		const z = `scaling-action-required-${Date.now()}`,
			K = y("notifications.scalingTitle", "Scaling Updated: Action Required"),
			ee = y("notifications.scalingMessage", "New scaling applied. To see changes, restart: the container, your desktop session by logging out, or the running application.");
		Ol(G => [...G, {
			id: z,
			fileName: K,
			status: "end",
			message: ee,
			timestamp: Date.now(),
			fadingOut: !1
		}].slice(-Bo)), at(z, rs)
	}, xa = () => du(!Ue), Ta = () => wt(!Rt), Zl = () => {
		window.postMessage({
			type: "showVirtualKeyboard"
		}, window.location.origin), console.log("Dashboard: Sending postMessage: { type: 'showVirtualKeyboard' }")
	}, Xa = w.useCallback(async () => {
		console.log("Dashboard: Attempting to populate audio devices..."), rl(!0), Xl(null), Vi([]), jt([]);
		const b = "setSinkId" in HTMLMediaElement.prototype;
		su(b), console.log("Dashboard: Output device selection supported:", b);
		try {
			console.log("Dashboard: Requesting temporary microphone permission for device listing..."), (await navigator.mediaDevices.getUserMedia({
				audio: !0
			})).getTracks().forEach(G => G.stop()), console.log("Dashboard: Temporary permission granted/available."), console.log("Dashboard: Enumerating media devices...");
			const z = await navigator.mediaDevices.enumerateDevices();
			console.log("Dashboard: Devices found:", z);
			const K = [],
				ee = [];
			z.forEach((G, Z) => {
				if (!G.deviceId) {
					console.warn("Dashboard: Skipping device with missing deviceId:", G);
					return
				}
				const He = G.label || (G.kind === "audioinput" ? y("sections.audio.defaultInputLabelFallback", {
					index: Z + 1
				}) : y("sections.audio.defaultOutputLabelFallback", {
					index: Z + 1
				}));
				G.kind === "audioinput" ? K.push({
					deviceId: G.deviceId,
					label: He
				}) : G.kind === "audiooutput" && b && ee.push({
					deviceId: G.deviceId,
					label: He
				})
			}), Vi(K), jt(ee), Qa("default"), ya("default"), console.log(`Dashboard: Populated ${K.length} inputs, ${ee.length} outputs.`)
		} catch (H) {
			console.error("Dashboard: Error getting media devices or permissions:", H);
			let z = "sections.audio.deviceErrorDefault",
				K = {
					errorName: H.name || "Unknown error"
				};
			H.name === "NotAllowedError" ? z = "sections.audio.deviceErrorPermission" : H.name === "NotFoundError" && (z = "sections.audio.deviceErrorNotFound"), Xl(y(z, K))
		} finally {
			rl(!1)
		}
	}, [y]), Ye = w.useCallback(b => {
		const H = !ye[b];
		Gt(z => ({
			...z,
			[b]: !z[b]
		})), b === "audioSettings" && H && Xa()
	}, [ye, Xa]), Yt = typeof window < "u" ? window.location.href.split("#")[0] : "", Qi = [{
		id: "shared",
		label: "Read only viewer",
		tooltip: "Read only client for viewing, as many clients as needed can connect to this endpoint and see the live session",
		hash: "#shared"
	}, {
		id: "player2",
		label: "Controller 2",
		tooltip: "Player 2 gamepad input, this endpoint has full control over the player 2 gamepad",
		hash: "#player2"
	}, {
		id: "player3",
		label: "Controller 3",
		tooltip: "Player 3 gamepad input, this endpoint has full control over the player 3 gamepad",
		hash: "#player3"
	}, {
		id: "player4",
		label: "Controller 4",
		tooltip: "Player 4 gamepad input, this endpoint has full control over the player 4 gamepad",
		hash: "#player4"
	}], Pi = async (b, H) => {
		if (!navigator.clipboard) {
			console.warn("Clipboard API not available.");
			return
		}
		try {
			await navigator.clipboard.writeText(b);
			const z = `copy-success-${H.toLowerCase().replace(/\s+/g,"-")}`;
			Ol(K => [...K.filter(Z => Z.id !== z), {
				id: z,
				fileName: y("notifications.copiedTitle", {
					label: H
				}),
				status: "end",
				message: y("notifications.copiedMessage", {
					textToCopy: b
				}),
				timestamp: Date.now(),
				fadingOut: !1
			}].slice(-Bo)), at(z, bp)
		} catch (z) {
			console.error("Failed to copy link: ", z);
			const K = `copy-error-${H.toLowerCase().replace(/\s+/g,"-")}`;
			Ol(ee => [...ee.filter(He => He.id !== K), {
				id: K,
				fileName: y("notifications.copyFailedTitle", {
					label: H
				}),
				status: "error",
				message: y("notifications.copyFailedError"),
				timestamp: Date.now(),
				fadingOut: !1
			}].slice(-Bo)), at(K, rs)
		}
	}, Po = b => {
		const H = b.target.value;
		oe(H), localStorage.setItem("encoder", H), window.postMessage({
			type: "settings",
			settings: {
				encoder: H
			}
		}, window.location.origin)
	}, mu = b => {
		const H = parseInt(b.target.value, 10),
			z = Kn[H];
		z !== void 0 && (al(z), pt(z))
	}, El = b => {
		const H = parseInt(b.target.value, 10),
			z = Qn[H];
		z !== void 0 && (Re(z), Vt(z))
	}, gu = b => {
		const H = parseInt(b.target.value, 10),
			z = Pn[H];
		z !== void 0 && ($(z), Ko(z))
	}, Xo = b => {
		const H = parseInt(b.target.value, 10),
			z = Xn[H];
		z !== void 0 && (Xe(z), pu(z))
	}, Za = () => {
		const b = !Ze;
		we(b), hu(b)
	}, bu = b => {
		const H = b.target.value;
		Qa(H), window.postMessage({
			type: "audioDeviceSelected",
			context: "input",
			deviceId: H
		}, window.location.origin)
	}, Ia = b => {
		const H = b.target.value;
		ya(H), window.postMessage({
			type: "audioDeviceSelected",
			context: "output",
			deviceId: H
		}, window.location.origin)
	}, Zo = b => {
		const H = b.target.value;
		if (Q(H), !H) return;
		const z = H.split("x");
		if (z.length === 2) {
			const K = parseInt(z[0], 10),
				ee = parseInt(z[1], 10);
			if (!isNaN(K) && K > 0 && !isNaN(ee) && ee > 0) {
				const G = Oo(K),
					Z = Oo(ee);
				N(G.toString()), X(Z.toString()), window.postMessage({
					type: "setManualResolution",
					width: G,
					height: Z
				}, window.location.origin)
			} else console.error("Dashboard: Error parsing selected resolution preset:", H)
		}
	}, Ml = b => {
		N(b.target.value), Q("")
	}, Xi = b => {
		X(b.target.value), Q("")
	}, vu = () => {
		const b = !ve;
		S(b), localStorage.setItem("scaleLocallyManual", b.toString()), window.postMessage({
			type: "setScaleLocally",
			value: b
		}, window.location.origin)
	}, Zi = () => {
		const b = !U;
		Y(b), localStorage.setItem("hidpiEnabled", b.toString()), window.postMessage({
			type: "setUseCssScaling",
			value: !b
		}, window.location.origin)
	}, qt = () => {
		const b = parseInt(We.trim(), 10),
			H = parseInt(F.trim(), 10);
		if (isNaN(b) || b <= 0 || isNaN(H) || H <= 0) {
			alert(y("alerts.invalidResolution"));
			return
		}
		const z = Oo(b),
			K = Oo(H);
		N(z.toString()), X(K.toString()), Q(""), window.postMessage({
			type: "setManualResolution",
			width: z,
			height: K
		}, window.location.origin)
	}, yu = () => {
		N(""), X(""), Q(""), window.postMessage({
			type: "resetResolutionToWindow"
		}, window.location.origin)
	}, Su = () => window.postMessage({
		type: "pipelineControl",
		pipeline: "video",
		enabled: !cl
	}, window.location.origin), Kt = () => window.postMessage({
		type: "pipelineControl",
		pipeline: "audio",
		enabled: !Fi
	}, window.location.origin), Io = () => window.postMessage({
		type: "pipelineControl",
		pipeline: "microphone",
		enabled: !Ut
	}, window.location.origin), xu = () => window.postMessage({
		type: "gamepadControl",
		enabled: !Pl
	}, window.location.origin), Tu = () => {
		document.fullscreenElement ? document.exitFullscreen && document.exitFullscreen().catch(b => console.error("Error exiting fullscreen:", b)) : window.postMessage({
			type: "requestFullscreen"
		}, window.location.origin)
	}, Ii = () => {
		if (document.fullscreenElement) document.exitFullscreen ? document.exitFullscreen().catch(b => console.error("Error exiting fullscreen:", b)) : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen ? document.webkitExitFullscreen() : document.msExitFullscreen && document.msExitFullscreen();
		else {
			const b = document.documentElement;
			b.requestFullscreen ? b.requestFullscreen().catch(H => {
				console.error(`Error attempting to enable full-screen mode: ${H.message} (${H.name})`)
			}) : b.mozRequestFullScreen ? b.mozRequestFullScreen() : b.webkitRequestFullscreen ? b.webkitRequestFullscreen() : b.msRequestFullscreen && b.msRequestFullscreen()
		}
	}, Jo = b => ou(b.target.value), $o = b => window.postMessage({
		type: "clipboardUpdateFromUI",
		text: b.target.value
	}, window.location.origin), Ja = () => {
		const b = R === "dark" ? "light" : "dark";
		J(b), localStorage.setItem("theme", b)
	}, lt = (b, H) => {
		_t(H), Wl({
			x: b.clientX + 10,
			y: b.clientY + 10
		})
	}, tt = () => _t(null), Qt = w.useCallback(() => {
		const b = !T;
		A(b), b && !v ? (window.postMessage({
			type: "TOUCH_GAMEPAD_SETUP",
			payload: {
				targetDivId: Co,
				visible: !0
			}
		}, window.location.origin), C(!0), console.log("Dashboard: Touch Gamepad SETUP sent, targetDivId:", Co, "visible: true")) : v && (window.postMessage({
			type: "TOUCH_GAMEPAD_VISIBILITY",
			payload: {
				visible: b,
				targetDivId: Co
			}
		}, window.location.origin), console.log("Dashboard: Touch Gamepad VISIBILITY sent, targetDivId:", Co, `visible: ${b}`))
	}, [T, v]), Pt = w.useCallback(b => {
		const H = y("sections.stats.tooltipMemoryNA");
		switch (b) {
			case "cpu":
				return y("sections.stats.tooltipCpu", {
					value: Nl.toFixed(1)
				});
			case "gpu":
				return y("sections.stats.tooltipGpu", {
					value: dt.toFixed(1)
				});
			case "sysmem":
				const z = Al !== null ? No(Al, 2, j) : H,
					K = qa !== null ? No(qa, 2, j) : H;
				return z !== H && K !== H ? y("sections.stats.tooltipSysMem", {
					used: z,
					total: K
				}) : `${y("sections.stats.sysMemLabel")}: ${H}`;
			case "gpumem":
				const ee = zt !== null ? No(zt, 2, j) : H,
					G = Ka !== null ? No(Ka, 2, j) : H;
				return ee !== H && G !== H ? y("sections.stats.tooltipGpuMem", {
					used: ee,
					total: G
				}) : `${y("sections.stats.gpuMemLabel")}: ${H}`;
			case "fps":
				return y("sections.stats.tooltipFps", {
					value: pe
				});
			case "audio":
				return y("sections.stats.tooltipAudio", {
					value: il
				});
			default:
				return ""
		}
	}, [y, j, Nl, dt, Al, qa, zt, Ka, pe, il]), Aa = w.useCallback(b => {
		Ol(H => H.filter(z => z.id !== b)), Ve.current[b] && (clearTimeout(Ve.current[b].fadeTimer), clearTimeout(Ve.current[b].removeTimer), delete Ve.current[b])
	}, []), at = w.useCallback((b, H) => {
		Ve.current[b] && (clearTimeout(Ve.current[b].fadeTimer), clearTimeout(Ve.current[b].removeTimer));
		const z = setTimeout(() => Ol(ee => ee.map(G => G.id === b ? {
				...G,
				fadingOut: !0
			} : G)), H - tv),
			K = setTimeout(() => Aa(b), H);
		Ve.current[b] = {
			fadeTimer: z,
			removeTimer: K
		}
	}, [Aa]), Au = () => window.dispatchEvent(new CustomEvent("requestFileUpload"));
	w.useEffect(() => {
		const b = localStorage.getItem("encoder");
		b && Jn.includes(b) ? oe(b) : (oe(os), localStorage.setItem("encoder", os));
		const H = parseInt(localStorage.getItem("videoFramerate"), 10);
		!isNaN(H) && Kn.includes(H) ? al(H) : (al(Do), localStorage.setItem("videoFramerate", Do.toString()));
		const z = parseInt(localStorage.getItem("videoBitRate"), 10);
		!isNaN(z) && Qn.includes(z) ? Re(z) : (Re(ns), localStorage.setItem("videoBitRate", ns.toString()));
		const K = parseInt(localStorage.getItem("videoBufferSize"), 10);
		!isNaN(K) && Pn.includes(K) ? $(K) : ($(us), localStorage.setItem("videoBufferSize", us.toString()));
		const ee = parseInt(localStorage.getItem("videoCRF"), 10);
		!isNaN(ee) && Xn.includes(ee) ? Xe(ee) : (Xe(cs), localStorage.setItem("videoCRF", cs.toString()));
		const G = localStorage.getItem("h264_fullcolor");
		G !== null ? we(G === "true") : (we(!1), localStorage.setItem("h264_fullcolor", "false"));
		const Z = parseInt(localStorage.getItem("scalingDPI"), 10);
		!isNaN(Z) && as.some(it => it.value === Z) ? Rl(Z) : (Rl(is), localStorage.setItem("scalingDPI", is.toString()));
		const He = localStorage.getItem("hidpiEnabled"),
			fl = He !== null ? He === "true" : !!0;
		window.postMessage({
			type: "setUseCssScaling",
			value: !fl
		}, window.location.origin)
	}, []), w.useEffect(() => {
		const H = setInterval(() => {
			const z = window.system_stats,
				K = (z == null ? void 0 : z.mem_used) ?? null,
				ee = (z == null ? void 0 : z.mem_total) ?? null;
			Gi((z == null ? void 0 : z.cpu_percent) ?? 0), wo(K), au(ee), wi(K !== null && ee !== null && ee > 0 ? K / ee * 100 : 0);
			const G = window.gpu_stats,
				Z = (G == null ? void 0 : G.gpu_percent) ?? (G == null ? void 0 : G.utilization_gpu) ?? 0;
			Ri(Z);
			const He = (G == null ? void 0 : G.mem_used) ?? (G == null ? void 0 : G.memory_used) ?? (G == null ? void 0 : G.used_gpu_memory_bytes) ?? null,
				fl = (G == null ? void 0 : G.mem_total) ?? (G == null ? void 0 : G.memory_total) ?? (G == null ? void 0 : G.total_gpu_memory_bytes) ?? null;
			Fo(He), Vo(fl), Ro(He !== null && fl !== null && fl > 0 ? He / fl * 100 : 0), ne(window.fps ?? 0), Be(window.currentAudioBufferSize ?? 0)
		}, $b);
		return () => clearInterval(H)
	}, []), w.useEffect(() => {
		const b = H => {
			if (H.origin !== window.location.origin) return;
			const z = H.data;
			if (typeof z == "object" && z !== null) {
				if (z.type === "pipelineStatusUpdate") z.video !== void 0 && nu(z.video), z.audio !== void 0 && uu(z.audio), z.microphone !== void 0 && ba(z.microphone);
				else if (z.type === "gamepadControl") z.enabled !== void 0 && Ht(z.enabled);
				else if (z.type === "sidebarButtonStatusUpdate") z.video !== void 0 && nu(z.video), z.audio !== void 0 && uu(z.audio), z.microphone !== void 0 && ba(z.microphone), z.gamepad !== void 0 && Ht(z.gamepad);
				else if (z.type === "clipboardContentUpdate") typeof z.text == "string" && ou(z.text);
				else if (z.type === "audioDeviceStatusUpdate") z.inputDeviceId !== void 0 && Qa(z.inputDeviceId || "default"), z.outputDeviceId !== void 0 && ya(z.outputDeviceId || "default");
				else if (z.type === "gamepadButtonUpdate" || z.type === "gamepadAxisUpdate") {
					fu || qo(!0);
					const K = z.gamepadIndex;
					if (K == null) return;
					qi(ee => {
						const G = {
							...ee
						};
						return G[K] ? G[K] = {
							buttons: {
								...G[K].buttons || {}
							},
							axes: {
								...G[K].axes || {}
							}
						} : G[K] = {
							buttons: {},
							axes: {}
						}, z.type === "gamepadButtonUpdate" ? G[K].buttons[z.buttonIndex] = z.value || 0 : G[K].axes[z.axisIndex] = Math.max(-1, Math.min(1, z.value || 0)), G
					})
				} else if (z.type === "fileUpload") {
					const {
						status: K,
						fileName: ee,
						progress: G,
						fileSize: Z,
						message: He
					} = z.payload, fl = ee;
					Ol(it => {
						const mt = it.findIndex(gt => gt.id === fl);
						if (K === "start") return it.length < Bo && mt === -1 ? [...it, {
							id: fl,
							fileName: ee,
							status: "progress",
							progress: 0,
							fileSize: Z,
							message: null,
							timestamp: Date.now(),
							fadingOut: !1
						}] : it;
						if (mt !== -1) {
							const gt = [...it],
								Wi = gt[mt];
							if (Ve.current[fl] && (clearTimeout(Ve.current[fl].fadeTimer), clearTimeout(Ve.current[fl].removeTimer), delete Ve.current[fl]), K === "progress") gt[mt] = {
								...Wi,
								status: "progress",
								progress: G,
								timestamp: Date.now(),
								fadingOut: !1
							};
							else if (K === "end") gt[mt] = {
								...Wi,
								status: "end",
								progress: 100,
								message: null,
								timestamp: Date.now(),
								fadingOut: !1
							}, at(fl, bp);
							else if (K === "error") {
								const ec = He ? `${y("notifications.errorPrefix")} ${He}` : y("notifications.unknownError");
								gt[mt] = {
									...Wi,
									status: "error",
									progress: 100,
									message: ec,
									timestamp: Date.now(),
									fadingOut: !1
								}, at(fl, rs)
							}
							return gt
						} else return it
					})
				} else if (z.type === "serverSettings") {
					if (z.encoders && Array.isArray(z.encoders)) {
						const K = Array.isArray(z.encoders) && z.encoders.length > 0 ? z.encoders : Jn;
						ue(K)
					}
				} else if (z.type === "initialClientSettings") {
					console.log("Dashboard: Received initialClientSettings", z.settings);
					const K = z.settings;
					if (K && typeof K == "object" && Object.keys(K).length > 0) {
						for (const ee in K)
							if (Object.hasOwnProperty.call(K, ee)) {
								const G = K[ee];
								if (ee.endsWith("videoBitRate")) {
									const Z = parseInt(G, 10);
									!isNaN(Z) && Qn.includes(Z) && (Re(Z), localStorage.setItem("videoBitRate", Z.toString()))
								} else if (ee.endsWith("videoFramerate")) {
									const Z = parseInt(G, 10);
									!isNaN(Z) && Kn.includes(Z) && (al(Z), localStorage.setItem("videoFramerate", Z.toString()))
								} else if (ee.endsWith("videoCRF")) {
									const Z = parseInt(G, 10);
									!isNaN(Z) && Xn.includes(Z) && (Xe(Z), localStorage.setItem("videoCRF", Z.toString()))
								} else if (ee.endsWith("encoder"))(Ne.includes(G) || Jn.includes(G)) && (oe(G), localStorage.setItem("encoder", G));
								else if (ee.endsWith("videoBufferSize")) {
									const Z = parseInt(G, 10);
									!isNaN(Z) && Pn.includes(Z) && ($(Z), localStorage.setItem("videoBufferSize", Z.toString()))
								} else if (ee.endsWith("scaleLocallyManual")) {
									const Z = G === "true";
									S(Z), localStorage.setItem("scaleLocallyManual", Z.toString())
								} else if (ee.endsWith("manualWidth")) N(G && G !== "null" ? G : ""), localStorage.setItem("manualWidth", G && G !== "null" ? G : "");
								else if (ee.endsWith("manualHeight")) X(G && G !== "null" ? G : ""), localStorage.setItem("manualHeight", G && G !== "null" ? G : "");
								else if (ee.endsWith("isManualResolutionMode")) {
									const Z = G === "true";
									localStorage.setItem("isManualResolutionMode", Z.toString())
								} else if (ee.endsWith("isGamepadEnabled")) {
									const Z = G === "true";
									Ht(Z), localStorage.setItem("isGamepadEnabled", Z.toString())
								} else if (ee.endsWith("h264_fullcolor")) {
									const Z = G === !0 || G === "true";
									we(Z), localStorage.setItem("h264_fullcolor", Z.toString())
								} else if (ee.endsWith("SCALING_DPI")) {
									const Z = parseInt(G, 10);
									!isNaN(Z) && as.some(He => He.value === Z) && (Rl(Z), localStorage.setItem("scalingDPI", Z.toString()))
								} else if (ee.endsWith("useCssScaling")) {
									const He = !(G === !0 || G === "true");
									U !== He && (Y(He), localStorage.setItem("hidpiEnabled", He.toString()))
								}
							}
					}
				}
			}
		};
		return window.addEventListener("message", b), () => {
			window.removeEventListener("message", b), Object.values(Ve.current).forEach(H => {
				clearTimeout(H.fadeTimer), clearTimeout(H.removeTimer)
			}), Ve.current = {}
		}
	}, [fu, at, Aa, y, Ne]);
	const Ea = `sidebar ${i?"is-open":""} theme-${R}`,
		ce = 80,
		sl = 8,
		Oe = ce / 2 - sl / 2,
		qe = 2 * Math.PI * Oe,
		W = ce / 2,
		$a = zi(Nl, Oe, qe),
		Eu = zi(dt, Oe, qe),
		Wa = zi(Ya, Oe, qe),
		ei = zi(tu, Oe, qe),
		Mu = Math.min(100, pe / (_e || Do) * 100),
		bl = zi(Mu, Oe, qe),
		ht = Math.min(100, il / Wb * 100),
		li = zi(ht, Oe, qe),
		Ma = Jb.map((b, H) => {
			var z;
			return {
				value: b,
				text: H === 0 ? y("sections.screen.resolutionPresetSelect") : ((z = j == null ? void 0 : j.resolutionPresets) == null ? void 0 : z[b]) || b
			}
		}),
		Wo = ["jpeg", "x264enc-striped", "x264enc", "nvh264enc"].includes(ie),
		Ji = ["nvh264enc"].includes(ie),
		$i = ["nvh264enc"].includes(ie),
		La = ["x264enc-striped", "x264enc"].includes(ie),
		ti = ["x264enc-striped", "x264enc"].includes(ie);
	return p.jsxs(p.Fragment, {
		children: [p.jsxs("div", {
			className: Ea,
			children: [p.jsxs("div", {
				className: "sidebar-header",
				children: [p.jsx("a", {
					href: "https://github.com/iris-networks/iris.release",
					target: "_blank",
					rel: "noopener noreferrer",
					children: p.jsx(fv, {
						width: 30,
						height: 30,
						t: y
					})
				}), p.jsx("a", {
					href: "https://github.com/iris-networks/iris.release",
					target: "_blank",
					rel: "noopener noreferrer",
					children: p.jsx("h2", {
						children: y("selkiesTitle")
					})
				}), p.jsxs("div", {
					className: "header-controls",
					children: [p.jsxs("div", {
						className: `theme-toggle ${R}`,
						onClick: Ja,
						title: y("toggleThemeTitle"),
						children: [p.jsx("svg", {
							className: "icon moon-icon",
							viewBox: "0 0 24 24",
							children: p.jsx("path", {
								d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
							})
						}), p.jsxs("svg", {
							className: "icon sun-icon",
							viewBox: "0 0 24 24",
							children: [p.jsx("circle", {
								cx: "12",
								cy: "12",
								r: "5"
							}), p.jsx("line", {
								x1: "12",
								y1: "1",
								x2: "12",
								y2: "3"
							}), p.jsx("line", {
								x1: "12",
								y1: "21",
								x2: "12",
								y2: "23"
							}), p.jsx("line", {
								x1: "4.22",
								y1: "4.22",
								x2: "5.64",
								y2: "5.64"
							}), p.jsx("line", {
								x1: "18.36",
								y1: "18.36",
								x2: "19.78",
								y2: "19.78"
							}), p.jsx("line", {
								x1: "1",
								y1: "12",
								x2: "3",
								y2: "12"
							}), p.jsx("line", {
								x1: "21",
								y1: "12",
								x2: "23",
								y2: "12"
							}), p.jsx("line", {
								x1: "4.22",
								y1: "19.78",
								x2: "5.64",
								y2: "18.36"
							}), p.jsx("line", {
								x1: "18.36",
								y1: "5.64",
								x2: "19.78",
								y2: "4.22"
							})]
						})]
					}), p.jsx("button", {
						className: "header-action-button fullscreen-button",
						onClick: Ii,
						title: y("fullscreenTitle"),
						children: p.jsx(sv, {})
					}), p.jsx("button", {
						className: "header-action-button gaming-mode-button",
						onClick: Tu,
						title: y("gamingModeTitle", "Gaming Mode"),
						children: p.jsx(iv, {})
					})]
				})]
			}), p.jsxs("div", {
				className: "sidebar-action-buttons",
				children: [p.jsxs("button", {
					className: `action-button ${cl?"active":""}`,
					onClick: Su,
					title: y(cl ? "buttons.videoStreamDisableTitle" : "buttons.videoStreamEnableTitle"),
					children: [" ", p.jsx(ov, {}), " "]
				}), p.jsxs("button", {
					className: `action-button ${Fi?"active":""}`,
					onClick: Kt,
					title: y(Fi ? "buttons.audioStreamDisableTitle" : "buttons.audioStreamEnableTitle"),
					children: [" ", p.jsx(cv, {}), " "]
				}), p.jsxs("button", {
					className: `action-button ${Ut?"active":""}`,
					onClick: Io,
					title: y(Ut ? "buttons.microphoneDisableTitle" : "buttons.microphoneEnableTitle"),
					children: [" ", p.jsx(rv, {}), " "]
				}), p.jsxs("button", {
					className: `action-button ${Pl?"active":""}`,
					onClick: xu,
					title: y(Pl ? "buttons.gamepadDisableTitle" : "buttons.gamepadEnableTitle"),
					children: [" ", p.jsx(vp, {}), " "]
				})]
			}), p.jsxs("div", {
				className: "sidebar-section",
				children: [p.jsxs("div", {
					className: "sidebar-section-header",
					onClick: () => Ye("settings"),
					role: "button",
					"aria-expanded": ye.settings,
					"aria-controls": "settings-content",
					tabIndex: "0",
					onKeyDown: b => (b.key === "Enter" || b.key === " ") && Ye("settings"),
					children: [p.jsx("h3", {
						children: y("sections.video.title")
					}), " ", p.jsx("span", {
						className: "section-toggle-icon",
						children: ye.settings ? p.jsx(Ot, {}) : p.jsx(Nt, {})
					})]
				}), ye.settings && p.jsxs("div", {
					className: "sidebar-section-content",
					id: "settings-content",
					children: [p.jsxs("div", {
						className: "dev-setting-item",
						children: [" ", p.jsx("label", {
							htmlFor: "encoderSelect",
							children: y("sections.video.encoderLabel")
						}), " ", p.jsxs("select", {
							id: "encoderSelect",
							value: ie,
							onChange: Po,
							children: [" ", Ne.map(b => p.jsx("option", {
								value: b,
								children: b
							}, b)), " "]
						}), " "]
					}), Wo && p.jsxs("div", {
						className: "dev-setting-item",
						children: [" ", p.jsx("label", {
							htmlFor: "framerateSlider",
							children: y("sections.video.framerateLabel", {
								framerate: _e
							})
						}), " ", p.jsx("input", {
							type: "range",
							id: "framerateSlider",
							min: "0",
							max: Kn.length - 1,
							step: "1",
							value: Kn.indexOf(_e),
							onChange: mu
						}), " "]
					}), Ji && p.jsxs("div", {
						className: "dev-setting-item",
						children: [" ", p.jsx("label", {
							htmlFor: "videoBitrateSlider",
							children: y("sections.video.bitrateLabel", {
								bitrate: fe / 1e3
							})
						}), " ", p.jsx("input", {
							type: "range",
							id: "videoBitrateSlider",
							min: "0",
							max: Qn.length - 1,
							step: "1",
							value: Qn.indexOf(fe),
							onChange: El
						}), " "]
					}), $i && p.jsxs("div", {
						className: "dev-setting-item",
						children: [" ", p.jsx("label", {
							htmlFor: "videoBufferSizeSlider",
							children: Pe === 0 ? y("sections.video.bufferLabelImmediate") : y("sections.video.bufferLabelFrames", {
								videoBufferSize: Pe
							})
						}), " ", p.jsx("input", {
							type: "range",
							id: "videoBufferSizeSlider",
							min: "0",
							max: Pn.length - 1,
							step: "1",
							value: Pn.indexOf(Pe),
							onChange: gu
						}), " "]
					}), La && p.jsxs("div", {
						className: "dev-setting-item",
						children: [" ", p.jsx("label", {
							htmlFor: "videoCRFSlider",
							children: y("sections.video.crfLabel", {
								crf: ge
							})
						}), " ", p.jsx("input", {
							type: "range",
							id: "videoCRFSlider",
							min: "0",
							max: Xn.length - 1,
							step: "1",
							value: Xn.indexOf(ge),
							onChange: Xo
						}), " "]
					}), ti && p.jsxs("div", {
						className: "dev-setting-item toggle-item",
						children: [p.jsx("label", {
							htmlFor: "h264FullColorToggle",
							children: y("sections.video.fullColorLabel")
						}), p.jsx("button", {
							id: "h264FullColorToggle",
							className: `toggle-button-sidebar ${Ze?"active":""}`,
							onClick: Za,
							"aria-pressed": Ze,
							title: y(Ze ? "buttons.h264FullColorDisableTitle" : "buttons.h264FullColorEnableTitle", Ze ? "Disable H.264 Full Color" : "Enable H.264 Full Color"),
							children: p.jsx("span", {
								className: "toggle-button-sidebar-knob"
							})
						})]
					})]
				})]
			}), p.jsxs("div", {
				className: "sidebar-section",
				children: [p.jsxs("div", {
					className: "sidebar-section-header",
					onClick: () => Ye("audioSettings"),
					role: "button",
					"aria-expanded": ye.audioSettings,
					"aria-controls": "audio-settings-content",
					tabIndex: "0",
					onKeyDown: b => (b.key === "Enter" || b.key === " ") && Ye("audioSettings"),
					children: [p.jsx("h3", {
						children: y("sections.audio.title")
					}), " ", p.jsx("span", {
						className: "section-toggle-icon",
						children: Fe ? p.jsx(rh, {}) : ye.audioSettings ? p.jsx(Ot, {}) : p.jsx(Nt, {})
					})]
				}), ye.audioSettings && p.jsxs("div", {
					className: "sidebar-section-content",
					id: "audio-settings-content",
					children: [Sa && p.jsx("div", {
						className: "error-message",
						children: Sa
					}), p.jsxs("div", {
						className: "dev-setting-item",
						children: [" ", p.jsx("label", {
							htmlFor: "audioInputSelect",
							children: y("sections.audio.inputLabel")
						}), " ", p.jsxs("select", {
							id: "audioInputSelect",
							value: Yo,
							onChange: bu,
							disabled: Fe || !!Sa,
							className: "audio-device-select",
							children: [" ", cu.map(b => p.jsx("option", {
								value: b.deviceId,
								children: b.label
							}, b.deviceId)), " "]
						}), " "]
					}), Pa && p.jsxs("div", {
						className: "dev-setting-item",
						children: [" ", p.jsx("label", {
							htmlFor: "audioOutputSelect",
							children: y("sections.audio.outputLabel")
						}), " ", p.jsxs("select", {
							id: "audioOutputSelect",
							value: ru,
							onChange: Ia,
							disabled: Fe || !!Sa,
							className: "audio-device-select",
							children: [" ", Yi.map(b => p.jsx("option", {
								value: b.deviceId,
								children: b.label
							}, b.deviceId)), " "]
						}), " "]
					}), !Pa && !Fe && !Sa && p.jsx("p", {
						className: "device-support-notice",
						children: y("sections.audio.outputNotSupported")
					})]
				})]
			}), p.jsxs("div", {
				className: "sidebar-section",
				children: [p.jsxs("div", {
					className: "sidebar-section-header",
					onClick: () => Ye("screenSettings"),
					role: "button",
					"aria-expanded": ye.screenSettings,
					"aria-controls": "screen-settings-content",
					tabIndex: "0",
					onKeyDown: b => (b.key === "Enter" || b.key === " ") && Ye("screenSettings"),
					children: [p.jsx("h3", {
						children: y("sections.screen.title")
					}), " ", p.jsx("span", {
						className: "section-toggle-icon",
						children: ye.screenSettings ? p.jsx(Ot, {}) : p.jsx(Nt, {})
					})]
				}), ye.screenSettings && p.jsxs("div", {
					className: "sidebar-section-content",
					id: "screen-settings-content",
					children: [p.jsxs("div", {
						className: "dev-setting-item toggle-item",
						children: [p.jsx("label", {
							htmlFor: "hidpiToggle",
							children: y("sections.screen.hidpiLabel", "HiDPI (Pixel Perfect)")
						}), p.jsx("button", {
							id: "hidpiToggle",
							className: `toggle-button-sidebar ${U?"active":""}`,
							onClick: Zi,
							"aria-pressed": U,
							title: y(U ? "sections.screen.hidpiDisableTitle" : "sections.screen.hidpiEnableTitle", U ? "Disable HiDPI (Use CSS Scaling)" : "Enable HiDPI (Pixel Perfect)"),
							children: p.jsx("span", {
								className: "toggle-button-sidebar-knob"
							})
						})]
					}), p.jsxs("div", {
						className: "dev-setting-item",
						children: [p.jsx("label", {
							htmlFor: "uiScalingSelect",
							children: y("sections.screen.uiScalingLabel", "UI Scaling")
						}), p.jsx("select", {
							id: "uiScalingSelect",
							value: ft,
							onChange: Qo,
							children: as.map(b => p.jsx("option", {
								value: b.value,
								children: b.label
							}, b.value))
						})]
					}), p.jsxs("div", {
						className: "dev-setting-item",
						children: [" ", p.jsx("label", {
							htmlFor: "resolutionPresetSelect",
							children: y("sections.screen.presetLabel")
						}), " ", p.jsxs("select", {
							id: "resolutionPresetSelect",
							value: V,
							onChange: Zo,
							children: [" ", Ma.map((b, H) => p.jsx("option", {
								value: b.value,
								disabled: H === 0,
								children: b.text
							}, H)), " "]
						}), " "]
					}), p.jsxs("div", {
						className: "resolution-manual-inputs",
						children: [p.jsxs("div", {
							className: "dev-setting-item manual-input-item",
							children: [" ", p.jsx("label", {
								htmlFor: "manualWidthInput",
								children: y("sections.screen.widthLabel")
							}), " ", p.jsx("input", {
								className: "allow-native-input",
								type: "number",
								id: "manualWidthInput",
								min: "1",
								step: "2",
								placeholder: y("sections.screen.widthPlaceholder"),
								value: We,
								onChange: Ml
							}), " "]
						}), p.jsxs("div", {
							className: "dev-setting-item manual-input-item",
							children: [" ", p.jsx("label", {
								htmlFor: "manualHeightInput",
								children: y("sections.screen.heightLabel")
							}), " ", p.jsx("input", {
								className: "allow-native-input",
								type: "number",
								id: "manualHeightInput",
								min: "1",
								step: "2",
								placeholder: y("sections.screen.heightPlaceholder"),
								value: F,
								onChange: Xi
							}), " "]
						})]
					}), p.jsxs("div", {
						className: "resolution-action-buttons",
						children: [" ", p.jsx("button", {
							className: "resolution-button",
							onClick: qt,
							children: y("sections.screen.setManualButton")
						}), " ", p.jsx("button", {
							className: "resolution-button reset-button",
							onClick: yu,
							children: y("sections.screen.resetButton")
						}), " "]
					}), p.jsxs("button", {
						className: `resolution-button toggle-button ${ve?"active":""}`,
						onClick: vu,
						style: {
							marginTop: "10px"
						},
						title: y(ve ? "sections.screen.scaleLocallyTitleDisable" : "sections.screen.scaleLocallyTitleEnable"),
						children: [" ", y("sections.screen.scaleLocallyLabel"), " ", y(ve ? "sections.screen.scaleLocallyOn" : "sections.screen.scaleLocallyOff"), " "]
					})]
				})]
			}), p.jsxs("div", {
				className: "sidebar-section",
				children: [p.jsxs("div", {
					className: "sidebar-section-header",
					onClick: () => Ye("stats"),
					role: "button",
					"aria-expanded": ye.stats,
					"aria-controls": "stats-content",
					tabIndex: "0",
					onKeyDown: b => (b.key === "Enter" || b.key === " ") && Ye("stats"),
					children: [p.jsx("h3", {
						children: y("sections.stats.title")
					}), " ", p.jsx("span", {
						className: "section-toggle-icon",
						children: ye.stats ? p.jsx(Ot, {}) : p.jsx(Nt, {})
					})]
				}), ye.stats && p.jsx("div", {
					className: "sidebar-section-content",
					id: "stats-content",
					children: p.jsxs("div", {
						className: "stats-gauges",
						children: [p.jsxs("div", {
							className: "gauge-container",
							onMouseEnter: b => lt(b, "cpu"),
							onMouseLeave: tt,
							children: [" ", p.jsxs("svg", {
								width: ce,
								height: ce,
								viewBox: `0 0 ${ce} ${ce}`,
								children: [" ", p.jsx("circle", {
									stroke: "var(--item-border)",
									fill: "transparent",
									strokeWidth: sl,
									r: Oe,
									cx: W,
									cy: W
								}), " ", p.jsx("circle", {
									stroke: "var(--sidebar-header-color)",
									fill: "transparent",
									strokeWidth: sl,
									r: Oe,
									cx: W,
									cy: W,
									transform: `rotate(-90 ${W} ${W})`,
									style: {
										strokeDasharray: qe,
										strokeDashoffset: $a,
										transition: "stroke-dashoffset 0.3s ease-in-out",
										strokeLinecap: "round"
									}
								}), " ", p.jsxs("text", {
									x: W,
									y: W,
									textAnchor: "middle",
									dominantBaseline: "central",
									fontSize: `${ce/5}px`,
									fill: "var(--sidebar-text)",
									fontWeight: "bold",
									children: [" ", Math.round(Math.max(0, Math.min(100, Nl || 0))), "%", " "]
								}), " "]
							}), " ", p.jsx("div", {
								className: "gauge-label",
								children: y("sections.stats.cpuLabel")
							}), " "]
						}), p.jsxs("div", {
							className: "gauge-container",
							onMouseEnter: b => lt(b, "gpu"),
							onMouseLeave: tt,
							children: [" ", p.jsxs("svg", {
								width: ce,
								height: ce,
								viewBox: `0 0 ${ce} ${ce}`,
								children: [" ", p.jsx("circle", {
									stroke: "var(--item-border)",
									fill: "transparent",
									strokeWidth: sl,
									r: Oe,
									cx: W,
									cy: W
								}), " ", p.jsx("circle", {
									stroke: "var(--sidebar-header-color)",
									fill: "transparent",
									strokeWidth: sl,
									r: Oe,
									cx: W,
									cy: W,
									transform: `rotate(-90 ${W} ${W})`,
									style: {
										strokeDasharray: qe,
										strokeDashoffset: Eu,
										transition: "stroke-dashoffset 0.3s ease-in-out",
										strokeLinecap: "round"
									}
								}), " ", p.jsxs("text", {
									x: W,
									y: W,
									textAnchor: "middle",
									dominantBaseline: "central",
									fontSize: `${ce/5}px`,
									fill: "var(--sidebar-text)",
									fontWeight: "bold",
									children: [" ", Math.round(Math.max(0, Math.min(100, dt || 0))), "%", " "]
								}), " "]
							}), " ", p.jsx("div", {
								className: "gauge-label",
								children: y("sections.stats.gpuLabel")
							}), " "]
						}), p.jsxs("div", {
							className: "gauge-container",
							onMouseEnter: b => lt(b, "sysmem"),
							onMouseLeave: tt,
							children: [" ", p.jsxs("svg", {
								width: ce,
								height: ce,
								viewBox: `0 0 ${ce} ${ce}`,
								children: [" ", p.jsx("circle", {
									stroke: "var(--item-border)",
									fill: "transparent",
									strokeWidth: sl,
									r: Oe,
									cx: W,
									cy: W
								}), " ", p.jsx("circle", {
									stroke: "var(--sidebar-header-color)",
									fill: "transparent",
									strokeWidth: sl,
									r: Oe,
									cx: W,
									cy: W,
									transform: `rotate(-90 ${W} ${W})`,
									style: {
										strokeDasharray: qe,
										strokeDashoffset: Wa,
										transition: "stroke-dashoffset 0.3s ease-in-out",
										strokeLinecap: "round"
									}
								}), " ", p.jsxs("text", {
									x: W,
									y: W,
									textAnchor: "middle",
									dominantBaseline: "central",
									fontSize: `${ce/5}px`,
									fill: "var(--sidebar-text)",
									fontWeight: "bold",
									children: [" ", Math.round(Math.max(0, Math.min(100, Ya || 0))), "%", " "]
								}), " "]
							}), " ", p.jsx("div", {
								className: "gauge-label",
								children: y("sections.stats.sysMemLabel")
							}), " "]
						}), p.jsxs("div", {
							className: "gauge-container",
							onMouseEnter: b => lt(b, "gpumem"),
							onMouseLeave: tt,
							children: [" ", p.jsxs("svg", {
								width: ce,
								height: ce,
								viewBox: `0 0 ${ce} ${ce}`,
								children: [" ", p.jsx("circle", {
									stroke: "var(--item-border)",
									fill: "transparent",
									strokeWidth: sl,
									r: Oe,
									cx: W,
									cy: W
								}), " ", p.jsx("circle", {
									stroke: "var(--sidebar-header-color)",
									fill: "transparent",
									strokeWidth: sl,
									r: Oe,
									cx: W,
									cy: W,
									transform: `rotate(-90 ${W} ${W})`,
									style: {
										strokeDasharray: qe,
										strokeDashoffset: ei,
										transition: "stroke-dashoffset 0.3s ease-in-out",
										strokeLinecap: "round"
									}
								}), " ", p.jsxs("text", {
									x: W,
									y: W,
									textAnchor: "middle",
									dominantBaseline: "central",
									fontSize: `${ce/5}px`,
									fill: "var(--sidebar-text)",
									fontWeight: "bold",
									children: [" ", Math.round(Math.max(0, Math.min(100, tu || 0))), "%", " "]
								}), " "]
							}), " ", p.jsx("div", {
								className: "gauge-label",
								children: y("sections.stats.gpuMemLabel")
							}), " "]
						}), p.jsxs("div", {
							className: "gauge-container",
							onMouseEnter: b => lt(b, "fps"),
							onMouseLeave: tt,
							children: [" ", p.jsxs("svg", {
								width: ce,
								height: ce,
								viewBox: `0 0 ${ce} ${ce}`,
								children: [" ", p.jsx("circle", {
									stroke: "var(--item-border)",
									fill: "transparent",
									strokeWidth: sl,
									r: Oe,
									cx: W,
									cy: W
								}), " ", p.jsx("circle", {
									stroke: "var(--sidebar-header-color)",
									fill: "transparent",
									strokeWidth: sl,
									r: Oe,
									cx: W,
									cy: W,
									transform: `rotate(-90 ${W} ${W})`,
									style: {
										strokeDasharray: qe,
										strokeDashoffset: bl,
										transition: "stroke-dashoffset 0.3s ease-in-out",
										strokeLinecap: "round"
									}
								}), " ", p.jsxs("text", {
									x: W,
									y: W,
									textAnchor: "middle",
									dominantBaseline: "central",
									fontSize: `${ce/5}px`,
									fill: "var(--sidebar-text)",
									fontWeight: "bold",
									children: [" ", pe, " "]
								}), " "]
							}), " ", p.jsx("div", {
								className: "gauge-label",
								children: y("sections.stats.fpsLabel")
							}), " "]
						}), p.jsxs("div", {
							className: "gauge-container",
							onMouseEnter: b => lt(b, "audio"),
							onMouseLeave: tt,
							children: [" ", p.jsxs("svg", {
								width: ce,
								height: ce,
								viewBox: `0 0 ${ce} ${ce}`,
								children: [" ", p.jsx("circle", {
									stroke: "var(--item-border)",
									fill: "transparent",
									strokeWidth: sl,
									r: Oe,
									cx: W,
									cy: W
								}), " ", p.jsx("circle", {
									stroke: "var(--sidebar-header-color)",
									fill: "transparent",
									strokeWidth: sl,
									r: Oe,
									cx: W,
									cy: W,
									transform: `rotate(-90 ${W} ${W})`,
									style: {
										strokeDasharray: qe,
										strokeDashoffset: li,
										transition: "stroke-dashoffset 0.3s ease-in-out",
										strokeLinecap: "round"
									}
								}), " ", p.jsxs("text", {
									x: W,
									y: W,
									textAnchor: "middle",
									dominantBaseline: "central",
									fontSize: `${ce/5}px`,
									fill: "var(--sidebar-text)",
									fontWeight: "bold",
									children: [" ", il, " "]
								}), " "]
							}), " ", p.jsx("div", {
								className: "gauge-label",
								children: y("sections.stats.audioLabel")
							}), " "]
						})]
					})
				})]
			}), p.jsxs("div", {
				className: "sidebar-section",
				children: [p.jsxs("div", {
					className: "sidebar-section-header",
					onClick: () => Ye("clipboard"),
					role: "button",
					"aria-expanded": ye.clipboard,
					"aria-controls": "clipboard-content",
					tabIndex: "0",
					onKeyDown: b => (b.key === "Enter" || b.key === " ") && Ye("clipboard"),
					children: [p.jsx("h3", {
						children: y("sections.clipboard.title")
					}), " ", p.jsx("span", {
						className: "section-toggle-icon",
						children: ye.clipboard ? p.jsx(Ot, {}) : p.jsx(Nt, {})
					})]
				}), ye.clipboard && p.jsxs("div", {
					className: "sidebar-section-content",
					id: "clipboard-content",
					children: [" ", p.jsxs("div", {
						className: "dashboard-clipboard-item",
						children: [" ", p.jsx("label", {
							htmlFor: "dashboardClipboardTextarea",
							children: y("sections.clipboard.label")
						}), " ", p.jsx("textarea", {
							className: "allow-native-input",
							id: "dashboardClipboardTextarea",
							value: va,
							onChange: Jo,
							onBlur: $o,
							rows: "5",
							placeholder: y("sections.clipboard.placeholder")
						}), " "]
					}), " "]
				})]
			}), p.jsxs("div", {
				className: "sidebar-section",
				children: [p.jsxs("div", {
					className: "sidebar-section-header",
					onClick: () => Ye("files"),
					role: "button",
					"aria-expanded": ye.files,
					"aria-controls": "files-content",
					tabIndex: "0",
					onKeyDown: b => (b.key === "Enter" || b.key === " ") && Ye("files"),
					children: [p.jsx("h3", {
						children: y("sections.files.title")
					}), " ", p.jsx("span", {
						className: "section-toggle-icon",
						children: ye.files ? p.jsx(Ot, {}) : p.jsx(Nt, {})
					})]
				}), ye.files && p.jsxs("div", {
					className: "sidebar-section-content",
					id: "files-content",
					children: [" ", p.jsxs("button", {
						className: "resolution-button",
						onClick: Au,
						style: {
							marginTop: "5px",
							marginBottom: "5px"
						},
						title: y("sections.files.uploadButtonTitle"),
						children: [" ", y("sections.files.uploadButton"), " "]
					}), " ", p.jsxs("button", {
						className: "resolution-button",
						onClick: Ta,
						style: {
							marginTop: "5px",
							marginBottom: "5px"
						},
						title: y("sections.files.downloadButtonTitle", "Download Files"),
						children: [" ", y("sections.files.downloadButtonTitle", "Download Files"), " "]
					}), " "]
				})]
			}), p.jsxs("div", {
				className: "sidebar-section",
				children: [p.jsxs("div", {
					className: "sidebar-section-header",
					onClick: () => Ye("apps"),
					role: "button",
					"aria-expanded": ye.apps,
					"aria-controls": "apps-content",
					tabIndex: "0",
					onKeyDown: b => (b.key === "Enter" || b.key === " ") && Ye("apps"),
					children: [p.jsx("h3", {
						children: y("sections.apps.title", "Apps")
					}), " ", p.jsx("span", {
						className: "section-toggle-icon",
						children: ye.apps ? p.jsx(Ot, {}) : p.jsx(Nt, {})
					})]
				}), ye.apps && p.jsxs("div", {
					className: "sidebar-section-content",
					id: "apps-content",
					children: [" ", p.jsxs("button", {
						className: "resolution-button",
						onClick: xa,
						style: {
							marginTop: "5px",
							marginBottom: "5px"
						},
						title: y("sections.apps.openButtonTitle", "Manage Apps"),
						children: [" ", p.jsx(nv, {}), " ", p.jsx("span", {
							style: {
								marginLeft: "8px"
							},
							children: y("sections.apps.openButton", "Manage Apps")
						}), " "]
					}), " "]
				})]
			}), p.jsxs("div", {
				className: "sidebar-section",
				children: [p.jsxs("div", {
					className: "sidebar-section-header",
					onClick: () => Ye("sharing"),
					role: "button",
					"aria-expanded": ye.sharing,
					"aria-controls": "sharing-content",
					tabIndex: "0",
					onKeyDown: b => (b.key === "Enter" || b.key === " ") && Ye("sharing"),
					children: [p.jsx("h3", {
						children: y("sections.sharing.title", "Sharing")
					}), p.jsx("span", {
						className: "section-toggle-icon",
						children: ye.sharing ? p.jsx(Ot, {}) : p.jsx(Nt, {})
					})]
				}), ye.sharing && p.jsx("div", {
					className: "sidebar-section-content",
					id: "sharing-content",
					children: Qi.map(b => {
						const H = `${Yt}${b.hash}`;
						return p.jsxs("div", {
							className: "sharing-link-item",
							title: b.tooltip,
							children: [p.jsx("span", {
								className: "sharing-link-label",
								children: b.label
							}), p.jsxs("div", {
								className: "sharing-link-actions",
								children: [p.jsx("a", {
									href: H,
									target: "_blank",
									rel: "noopener noreferrer",
									className: "sharing-link",
									title: `Open ${b.label} link in new tab`,
									children: H
								}), p.jsx("button", {
									type: "button",
									onClick: () => Pi(H, b.label),
									className: "copy-button",
									title: `Copy ${b.label} link`,
									children: p.jsx(av, {})
								})]
							})]
						}, b.id)
					})
				})]
			}), p.jsxs("div", {
				className: "sidebar-section",
				children: [p.jsxs("div", {
					className: "sidebar-section-header",
					onClick: () => Ye("gamepads"),
					role: "button",
					"aria-expanded": ye.gamepads,
					"aria-controls": "gamepads-content",
					tabIndex: "0",
					onKeyDown: b => (b.key === "Enter" || b.key === " ") && Ye("gamepads"),
					children: [p.jsx("h3", {
						children: y("sections.gamepads.title", "Gamepads")
					}), p.jsx("span", {
						className: "section-toggle-icon",
						"aria-hidden": "true",
						children: ye.gamepads ? p.jsx(Ot, {}) : p.jsx(Nt, {})
					})]
				}), ye.gamepads && p.jsxs("div", {
					className: "sidebar-section-content",
					id: "gamepads-content",
					children: [p.jsx("div", {
						className: "dev-setting-item",
						style: {
							marginBottom: "10px"
						},
						children: p.jsxs("button", {
							className: `resolution-button toggle-button ${T?"active":""}`,
							onClick: Qt,
							title: y(T ? "sections.gamepads.touchDisableTitle" : "sections.gamepads.touchEnableTitle", T ? "Disable Touch Gamepad" : "Enable Touch Gamepad"),
							children: [p.jsx(vp, {}), p.jsx("span", {
								style: {
									marginLeft: "8px"
								},
								children: y(T ? "sections.gamepads.touchActiveLabel" : "sections.gamepads.touchInactiveLabel", T ? "Touch Gamepad: ON" : "Touch Gamepad: OFF")
							})]
						})
					}), g && T ? p.jsx("p", {
						children: y("sections.gamepads.physicalHiddenForTouch", "Physical gamepad display is hidden while touch gamepad is active.")
					}) : p.jsx(p.Fragment, {
						children: Object.keys(et).length > 0 ? Object.keys(et).sort((b, H) => parseInt(b, 10) - parseInt(H, 10)).map(b => {
							const H = parseInt(b, 10);
							return p.jsx(dm, {
								gamepadIndex: H,
								gamepadState: et[H]
							}, H)
						}) : p.jsx("p", {
							className: "no-gamepads-message",
							children: g ? y("sections.gamepads.noActivityMobileOrEnableTouch", "No physical gamepads. Enable touch gamepad or connect a controller.") : y("sections.gamepads.noActivity", "No physical gamepad activity detected.")
						})
					})]
				})]
			})]
		}), iu && p.jsxs("div", {
			className: "gauge-tooltip",
			style: {
				left: `${gl.x}px`,
				top: `${gl.y}px`
			},
			children: [" ", Pt(iu), " "]
		}), p.jsx("div", {
			className: `notification-container theme-${R}`,
			children: Ki.map(b => p.jsxs("div", {
				className: `notification-item ${b.status} ${b.fadingOut?"fade-out":""}`,
				role: "alert",
				"aria-live": "polite",
				children: [p.jsxs("div", {
					className: "notification-header",
					children: [" ", p.jsx("span", {
						className: "notification-filename",
						title: b.fileName,
						children: b.fileName
					}), " ", p.jsx("button", {
						className: "notification-close-button",
						onClick: () => Aa(b.id),
						"aria-label": y("notifications.closeButtonAlt", {
							fileName: b.fileName
						}),
						children: "×"
					}), " "]
				}), p.jsxs("div", {
					className: "notification-body",
					children: [b.status === "progress" && p.jsxs(p.Fragment, {
						children: [" ", p.jsx("span", {
							className: "notification-status-text",
							children: y("notifications.uploading", {
								progress: b.progress
							})
						}), " ", p.jsx("div", {
							className: "notification-progress-bar-outer",
							children: p.jsx("div", {
								className: "notification-progress-bar-inner",
								style: {
									width: `${b.progress}%`
								}
							})
						}), " "]
					}), b.status === "end" && p.jsxs(p.Fragment, {
						children: [" ", p.jsx("span", {
							className: "notification-status-text",
							children: b.message ? b.message : y("notifications.uploadComplete")
						}), " ", p.jsx("div", {
							className: "notification-progress-bar-outer",
							children: p.jsx("div", {
								className: "notification-progress-bar-inner",
								style: {
									width: "100%"
								}
							})
						}), " "]
					}), b.status === "error" && p.jsxs(p.Fragment, {
						children: [" ", p.jsx("span", {
							className: "notification-status-text error-text",
							children: y("notifications.uploadFailed")
						}), " ", p.jsx("div", {
							className: "notification-progress-bar-outer",
							children: p.jsx("div", {
								className: "notification-progress-bar-inner",
								style: {
									width: "100%"
								}
							})
						}), " ", b.message && p.jsx("p", {
							className: "notification-error-message",
							children: b.message
						}), " "]
					})]
				})]
			}, b.id))
		}), Rt && p.jsxs("div", {
			className: "files-modal",
			children: [" ", p.jsx("button", {
				className: "files-modal-close",
				onClick: Ta,
				"aria-label": "Close files modal",
				children: "×"
			}), " ", p.jsx("iframe", {
				src: "/files",
				title: "Downloadable Files"
			}), " "]
		}), Ue && p.jsx(dv, {
			isOpen: Ue,
			onClose: xa,
			t: y
		}), g && p.jsx("button", {
			className: `virtual-keyboard-button theme-${R} allow-native-input`,
			onClick: Zl,
			title: y("buttons.virtualKeyboardButtonTitle", "Pop Keyboard"),
			"aria-label": y("buttons.virtualKeyboardButtonTitle", "Pop Keyboard"),
			children: p.jsx(uv, {})
		})]
	})
}

function hv({
	isOpen: i,
	onToggle: o
}) {
	return p.jsx("div", {
		className: "toggle-handle",
		onClick: o,
		title: `${i?"Close":"Open"} Dashboard`,
		children: p.jsx("div", {
			className: "toggle-indicator"
		})
	})
}

function mv({
	container: i
}) {
	const [o, s] = w.useState(!1), r = () => {
		s(!o)
	};
	return i ? sm.createPortal(p.jsxs("div", {
		className: "dashboard-overlay-container",
		children: [p.jsx(pv, {
			isOpen: o
		}), p.jsx(hv, {
			isOpen: o,
			onToggle: r
		})]
	}), i) : null
}

function gv({
	dashboardRoot: i
}) {
	return p.jsx(p.Fragment, {
		children: p.jsx(mv, {
			container: i
		})
	})
}
const yp = window.location.hash,
	bv = ["#shared", "#player2", "#player3", "#player4"];
if (bv.includes(yp)) console.log(`Dashboard UI rendering skipped for mode: ${yp}`);
else {
	const i = document.createElement("div");
	i.id = "dashboard-root", document.body.appendChild(i);
	const o = document.getElementById("root");
	o ? cm.createRoot(o).render(p.jsx(lm.StrictMode, {
		children: p.jsx(gv, {
			dashboardRoot: i
		})
	})) : console.error("CRITICAL: Dashboard mount point #root not found. Primary dashboard will not render.")
}