function createRkState(key, pos, has_gauss, has_binomial, psave, nsave, r, q, fm, m, p1, xm, xl, xr, laml, lamr, p2, p3, p4) { return { key: key || new Array(RK_STATE_LEN), pos: pos || null, gauss: null, has_gauss: has_gauss || null, has_binomial: has_binomial || null, psave: psave || null, nsave: nsave || null, r: r || null, q: q || null, fm: fm || null, m: m || null, p1: p1 || null, xm: xm || null, xl: xl || null, xr: xr || null, laml: laml || null, lamr: lamr || null, p2: p2 || null, p3: p3 || null, p4: p4 || null } }

function rk_hash(key) { return rk_hash_uint[0] = 0 | key, rk_hash_uint[0] += ~(rk_hash_uint[0] << 15), rk_hash_uint[0] ^= rk_hash_uint[0] >>> 10, rk_hash_uint[0] += rk_hash_uint[0] << 3, rk_hash_uint[0] ^= rk_hash_uint[0] >>> 6, rk_hash_uint[0] += ~(rk_hash_uint[0] << 11), rk_hash_uint[0] ^= rk_hash_uint[0] >>> 16, rk_hash_uint[0] >>> 0 }

function rk_seed(seed, state) { var pos, s; for (state.key[0] = seed >>> 0, pos = 1; RK_STATE_LEN > pos; pos++) s = state.key[pos - 1] ^ state.key[pos - 1] >>> 30, state.key[pos] = (1812433253 * ((4294901760 & s) >>> 16) << 16) + 1812433253 * (65535 & s) + pos, state.key[pos] >>>= 0;
    state.pos = RK_STATE_LEN, state.gauss = 0, state.has_gauss = 0, state.has_binomial = 0 }

function rk_randomseed(state) { var i, tv; if (rk_devfill(state.key, 4, 0) === rk_error.RK_NOERR) { for (state.key[0] |= 2147483648, state.pos = RK_STATE_LEN, state.gauss = 0, state.has_gauss = 0, state.has_binomial = 0, i = 0; 624 > i; i++) state.key[i] &= 4294967295; return rk_error.RK_NOERR } return tv = new Date, rk_seed(rk_hash(tv.getTime()) ^ rk_hash(tv.getMilliseconds()), state), rk_error.RK_ENODEV }

function rk_random(state) { var y; if (state.pos === RK_STATE_LEN) { var i; for (i = 0; N - M > i; i++) y = state.key[i] & UPPER_MASK | state.key[i + 1] & LOWER_MASK, state.key[i] = state.key[i + M] ^ y >>> 1 ^ -(1 & y) & MATRIX_A; for (; N - 1 > i; i++) y = state.key[i] & UPPER_MASK | state.key[i + 1] & LOWER_MASK, state.key[i] = state.key[i + (M - N)] ^ y >>> 1 ^ -(1 & y) & MATRIX_A;
        y = state.key[N - 1] & UPPER_MASK | state.key[0] & LOWER_MASK, state.key[N - 1] = state.key[M - 1] ^ y >>> 1 ^ -(1 & y) & MATRIX_A, state.pos = 0 } return y = state.key[state.pos++], y ^= y >>> 11, y ^= y << 7 & 2636928640, y ^= y << 15 & 4022730752, y ^= y >>> 18, y >>> 0 }

function rk_ulong(state) { return rk_random(state) }

function rk_long(state) { return rk_ulong(state) >>> 1 }

function rk_interval(max, state) { var value, mask = max; if (0 === max) return 0; if (mask |= mask >>> 1, mask |= mask >>> 2, mask |= mask >>> 4, mask |= mask >>> 8, mask |= mask >>> 16, 4294967295 >= max)
        for (;
            (value = rk_random(state) & mask) > max;);
    else
        for (;
            (value = rk_ulong(state) & mask) > max;); return value }

function rk_double(state) { var a = rk_random(state) >>> 5,
        b = rk_random(state) >>> 6; return (67108864 * a + b) * (1 / 9007199254740992) }

function rk_fill(buffer, size, state) { for (var r, buf = new Int32Array(buffer), i = 0; size >= 4; size -= 4) r = rk_random(state), buf[i++] = 255 & r, buf[i++] = r >>> 8 & 255, buf[i++] = r >>> 16 & 255, buf[i++] = r >>> 24 & 255; if (size)
        for (r = rk_random(state); size; r >>>= 8, size--) buf[i++] = 255 & r }

function rk_devfill(buffer, size, strong) { return rk_error.RK_ENODEV }

function rk_altfill(buffer, size, strong, state) { var err; return err = rk_devfill(buffer, size, strong), err && rk_fill(buffer, size, state), err }

function rk_gauss(state) { if (state.has_gauss) { var tmp = state.gauss; return state.gauss = 0, state.has_gauss = 0, tmp } var f, x1, x2, r2;
    do x1 = 2 * rk_double(state) - 1, x2 = 2 * rk_double(state) - 1, r2 = x1 * x1 + x2 * x2; while (r2 >= 1 || 0 === r2); return f = Math.sqrt(-2 * Math.log(r2) / r2), state.gauss = f * x1, state.has_gauss = 1, f * x2 }

function init_genrand(self, s) { var mti, mt = self.key; for (mt[0] = 4294967295 & s, mti = 1; RK_STATE_LEN > mti; mti++) mt[mti] = 1812433253 * (mt[mti - 1] ^ mt[mti - 1] >>> 30) + mti, mt[mti] &= 4294967295;
    self.pos = mti }

function init_by_array(self, init_key, key_length) { var k, i = 1,
        j = 0,
        mt = self.key; for (init_genrand(self, 19650218), k = RK_STATE_LEN > key_length ? RK_STATE_LEN : key_length; k; k--) mt[i] = (mt[i] ^ 1664525 * (mt[i - 1] ^ mt[i - 1] >>> 30)) + init_key[j] + j, mt[i] &= 4294967295, i++, j++, i >= RK_STATE_LEN && (mt[0] = mt[RK_STATE_LEN - 1], i = 1), j >= key_length && (j = 0); for (k = RK_STATE_LEN - 1; k; k--) mt[i] = (mt[i] ^ 1566083941 * (mt[i - 1] ^ mt[i - 1] >>> 30)) - i, mt[i] &= 4294967295, i++, i >= RK_STATE_LEN && (mt[0] = mt[RK_STATE_LEN - 1], i = 1);
    mt[0] = 2147483648, self.gauss = 0, self.has_gauss = 0, self.has_binomial = 0 }

function rk_binomial_btpe(state, n, p) { var r, q, fm, p1, xm, xl, xr, c, laml, lamr, p2, p3, p4, a, u, v, s, F, rho, t, A, nrq, x1, x2, f1, f2, z, z2, w, w2, x, m, y, k, i;
    1 !== state.has_binomial || state.nsave != n || state.psave != p ? (state.nsave = n, state.psave = p, state.has_binomial = 1, state.r = r = Math.min(p, 1 - p), state.q = q = 1 - r, state.fm = fm = n * r + r, state.m = m = Math.floor(state.fm), state.p1 = p1 = Math.floor(2.195 * Math.sqrt(n * r * q) - 4.6 * q) + .5, state.xm = xm = m + .5, state.xl = xl = xm - p1, state.xr = xr = xm + p1, state.c = c = .134 + 20.5 / (15.3 + m), a = (fm - xl) / (fm - xl * r), state.laml = laml = a * (1 + a / 2), a = (xr - fm) / (xr * q), state.lamr = lamr = a * (1 + a / 2), state.p2 = p2 = p1 * (1 + 2 * c), state.p3 = p3 = p2 + c / laml, state.p4 = p4 = p3 + c / lamr) : (r = state.r, q = state.q, fm = state.fm, m = state.m, p1 = state.p1, xm = state.xm, xl = state.xl, xr = state.xr, c = state.c, laml = state.laml, lamr = state.lamr, p2 = state.p2, p3 = state.p3, p4 = state.p4); var goto_label = "Step10";
    goto_loop: for (; goto_label;) switch (goto_label) {
        case "Step10":
            if (nrq = n * r * q, u = rk_double(state) * p4, v = rk_double(state), u > p1) { goto_label = "Step20"; continue goto_loop }
            y = Math.floor(xm - p1 * v + u), goto_label = "Step60"; continue goto_loop;
        case "Step20":
            if (u > p2) { goto_label = "Step30"; continue goto_loop } if (x = xl + (u - p1) / c, v = v * c + 1 - Math.abs(m - x + .5) / p1, v > 1) { goto_label = "Step10"; continue goto_loop }
            y = Math.floor(x), goto_label = "Step50"; continue goto_loop;
        case "Step30":
            if (u > p3) { goto_label = "Step40"; continue goto_loop } if (y = Math.floor(xl + Math.log(v) / laml), 0 > y) { goto_label = "Step10"; continue goto_loop }
            v = v * (u - p2) * laml, goto_label = "Step50"; continue goto_loop;
        case "Step40":
            if (y = Math.floor(xr - Math.log(v) / lamr), y > n) { goto_label = "Step10"; continue goto_loop }
            v = v * (u - p3) * lamr;
        case "Step50":
            if (k = Math.abs(y - m), k > 20 && nrq / 2 - 1 > k) { goto_label = "Step52"; continue goto_loop } if (s = r / q, a = s * (n + 1), F = 1, y > m)
                for (i = m + 1; y >= i; i++) F *= a / i - s;
            else if (m > y)
                for (i = y + 1; m >= i; i++) F /= a / i - s; if (v > F) { goto_label = "Step10"; continue goto_loop }
            goto_label = "Step60"; continue goto_loop;
        case "Step52":
            if (rho = k / nrq * ((k * (k / 3 + .625) + .16666666666666666) / nrq + .5), t = -k * k / (2 * nrq), A = Math.log(v), t - rho > A) { goto_label = "Step60"; continue goto_loop } if (A > t + rho) { goto_label = "Step10"; continue goto_loop } if (x1 = y + 1, f1 = m + 1, z = n + 1 - m, w = n - y + 1, x2 = x1 * x1, f2 = f1 * f1, z2 = z * z, w2 = w * w, A > xm * Math.log(f1 / x1) + (n - m + .5) * Math.log(z / w) + (y - m) * Math.log(w * r / (x1 * q)) + (13680 - (462 - (132 - (99 - 140 / f2) / f2) / f2) / f2) / f1 / 166320 + (13680 - (462 - (132 - (99 - 140 / z2) / z2) / z2) / z2) / z / 166320 + (13680 - (462 - (132 - (99 - 140 / x2) / x2) / x2) / x2) / x1 / 166320 + (13680 - (462 - (132 - (99 - 140 / w2) / w2) / w2) / w2) / w / 166320) { goto_label = "Step10"; continue goto_loop }
        case "Step60":
            p > .5 && (y = n - y), goto_label = !1; break;
        default:
            console.log("unhandeled case: " + goto_label) }
    return y }

function rk_binomial_inversion(state, n, p) { var q, qn, np, px, U, X, bound; for (1 !== state.has_binomial || state.nsave != n || state.psave != p ? (state.save = n, state.psave = p, state.has_binomial = 1, state.q = q = 1 - p, state.r = qn = Math.exp(n * Math.log(q)), state.c = np = n * p, state.m = bound = Math.min(n, np + 10 * Math.sqrt(np * q + 1))) : (q = state.q, qn = state.r, np = state.c, bound = state.m), X = 0, px = qn, U = rk_double(state); U > px;) X++, X > bound ? (X = 0, px = qn, U = rk_double(state)) : (U -= px, px = (n - X + 1) * p * px / (X * q)); return X }

function rk_binomial(state, n, p) { var q; return .5 >= p ? 30 >= p * n ? rk_binomial_inversion(state, n, p) : rk_binomial_btpe(state, n, p) : (q = 1 - p, 30 >= q * n ? n - rk_binomial_inversion(state, n, q) : n - rk_binomial_btpe(state, n, q)) }

function cont0_array(state, func, size, lock) { var array_data, array, length, i; if (Sk.builtin.checkNone(size)) return new Sk.builtin.float_(func.call(null, state)); for (array = Sk.misceval.callsim(np.$d.empty, size, Sk.builtin.float_), length = array.v.buffer.length, array_data = array.v.buffer, i = 0; length > i; i++) array_data[i] = new Sk.builtin.float_(func.call(null, state)); return array }

function cont1_array_sc(state, func, size, a, lock) {}

function discnp_array_sc(state, func, size, n, p, lock) { var array, length, i, array_data = [],
        jsn = Sk.ffi.remapToJs(n),
        jsp = Sk.ffi.remapToJs(p); if (Sk.builtin.checkNone(size)) return new Sk.builtin.int_(func(state, jsn, jsp)); for (array = Sk.misceval.callsim(np.$d.empty, size, Sk.builtin.int_), length = Sk.builtin.len(array).v, array_data = array.v.buffer, i = 0; length > i; i++) array_data[i] = new Sk.builtin.int_(func(state, jsn, jsp)); return array }

function discnp_array(state, func, size, on, op, lock) { var array, i, op_data, on_data, multi, on1, op1, array_data = []; if (Sk.builtin.checkNone(size)) { multi = null; var py_shape = new Sk.builtin.tuple(on.v.shape.map(function(x) { return new Sk.builtin.int_(x) })); if (array = Sk.misceval.callsim(np.$d.empty, py_shape, Sk.builtin.int_), array_data = array.v.buffer, on1 = on.v.buffer, op1 = op.v.buffer, op1.length !== on1.length)
            if (1 === op1.length)
                for (i = 1; i < on1.length; i++) op1.push(op1[0]);
            else { if (1 !== on1.length) throw new Sk.builtin.ValueError("cannot broadcast n and p to a common shape"); for (i = 1; i < op1.length; i++) on1.push(on1[0]) }
        for (i = 0; i < array_data.length; i++) on_data = Sk.ffi.remapToJs(on1[i]), op_data = Sk.ffi.remapToJs(op1[i]), array_data[i] = new Sk.builtin.int_(func(state, on_data, op_data)) } else { if (array = Sk.misceval.callsim(np.$d.empty, size, Sk.builtin.int_), array_data = array.v.buffer, on1 = on.v.buffer, op1 = op.v.buffer, array_data.length !== on1.length && array_data.length !== op1.length) throw new Sk.builtin.ValueError("size is not compatible with inputs"); for (i = 0; i < array_data.length; i++) on_data = Sk.ffi.remapToJs(on1[i]), op_data = Sk.ffi.remapToJs(op1[i]), array_data[i] = new Sk.builtin.int_(func(state, on_data, op_data)) } return array }

function PyArray_FROM_OTF(m, type, flags) { return Sk.misceval.callsim(np.$d.array, m, type) }
Sk.misceval.tryCatch = Sk.misceval.tryCatch || function(tryFn, catchFn) { var r; try { r = tryFn() } catch (e) { return catchFn(e) } if (r instanceof Sk.misceval.Suspension) { var susp = new Sk.misceval.Suspension(void 0, r); return susp.resume = function() { return Sk.misceval.tryCatch(r.resume, catchFn) }, susp } return r };
var RK_STATE_LEN = 624,
    rk_error = { RK_NOERR: "RK_NOERR", RK_ENODEV: "RK_ENODEV", RK_ERR_MAX: "RK_ERR_MAX" },
    rk_strerror = ["no error", "random device unavailable"],
    RK_MAX = 4294967296,
    rk_hash_uint;
rk_hash_uint = void 0 === typeof Uint32Array ? [0] : new Uint32Array(1);
var N = 624,
    M = 397,
    MATRIX_A = 2567483615,
    UPPER_MASK = 2147483648,
    LOWER_MASK = 2147483647,
    rk_state = { key: [], pos: null, has_gauss: null, gauss: null },
    np = Sk.importModule("numpy"),
    CLASS_RANDOMSTATE = "RandomState",
    $builtinmodule = function(name) { var mod = {},
            randomState_c = function($gbl, $loc) { var js__init__ = function(self, seed) { null == seed && (seed = Sk.builtin.none.none$), self.internal_state = createRkState(), self.poisson_lam_max = new Sk.builtin.int_(Math.pow(2, 53) - 1), self.lock = null, Sk.misceval.callsim(self.seed, self, seed) };
                js__init__.co_varnames = ["self", "seed"], js__init__.$defaults = [Sk.builtin.none.none$], $loc.__init__ = new Sk.builtin.func(js__init__), $loc.seed = new Sk.builtin.func(function(self, seed) { null == seed && (seed = Sk.builtin.none.none$); var errcode, obj; try { if (Sk.builtin.checkNone(seed)) errcode = rk_randomseed(self.internal_state);
                        else { var idx = new Sk.builtin.int_(Sk.misceval.asIndex(seed)),
                                js_idx = Sk.ffi.remapToJs(idx); if (js_idx > Math.pow(2, 32) - 1 || 0 > js_idx) throw new Sk.builtin.ValueError("Seed must be between 0 and 4294967295");
                            rk_seed(js_idx, self.internal_state) } } catch (e) { if (!(e instanceof Sk.builtin.TypeError)) throw e;
                        obj = Sk.misceval.callsim(np.$d.asarray, seed, Sk.builtin.int_), obj.v.buffer.map(function(elem) { if (elem > Math.pow(2, 32) - 1 || 0 > elem) throw new Sk.builtin.ValueError("Seed must be between 0 and 4294967295") }), init_by_array(self.internal_state, obj.v.buffer, obj.v.shape[0]) } }), $loc.set_state = new Sk.builtin.func(function(self) {}), $loc.get_state = new Sk.builtin.func(function(self) { var js_key = self.internal_state.key.map(function(elem) { return new Sk.builtin.int_(elem) }),
                        state = obj = Sk.misceval.callsim(np.$d.asarray, new Sk.builtin.tuple(js_key), Sk.builtin.int_),
                        has_gauss = new Sk.builtin.int_(self.internal_state.has_gauss),
                        gauss = new Sk.builtin.float_(self.internal_state.gauss),
                        pos = new Sk.builtin.int_(self.internal_state.pos); return new Sk.builtin.tuple([new Sk.builtin.str("MT19937"), state, pos, has_gauss, gauss]) }); var js_random_sample = function(self, size) { null == size && (size = Sk.builtin.none.none$); var py_res = cont0_array(self.internal_state, rk_double, size, self.lock); return py_res };
                js_random_sample.co_varnames = ["self", "size"], js_random_sample.$defaults = [Sk.builtin.none.none$], $loc.random_sample = new Sk.builtin.func(js_random_sample); var js_tomaxint = function(self, size) { throw new NotImplementedError("RandomState.tomaxint") };
                js_tomaxint.co_varnames = ["self", "size"], js_tomaxint.$defaults = [Sk.builtin.none.none$], $loc.tomaxint = new Sk.builtin.func(js_tomaxint); var js_randint = function(self, low, high, size) { Sk.builtin.pyCheckArgs("randint", arguments, 1, 3, !0), null == size && (size = Sk.builtin.none.none$); var lo, hi, rv, diff, array, length, i, array_data = []; if (null == high || Sk.builtin.checkNone(high) ? (lo = new Sk.builtin.int_(0), hi = new Sk.builtin.int_(low)) : (lo = new Sk.builtin.int_(low), hi = new Sk.builtin.int_(high)), lo = Sk.ffi.remapToJs(lo), hi = Sk.ffi.remapToJs(hi), lo >= hi) throw new Sk.builtin.ValueError("low >= high"); if (diff = Math.abs(hi - lo - 1), Sk.builtin.checkNone(size)) return rv = new Sk.builtin.int_(lo + rk_interval(diff, self.internal_state)); for (array = Sk.misceval.callsim(np.$d.empty, size, Sk.builtin.int_), length = Sk.builtin.len(array).v, array_data = array.v.buffer, i = 0; length > i; i++) rv = lo + rk_interval(diff, self.internal_state), array_data[i] = new Sk.builtin.int_(rv); return array };
                js_randint.co_varnames = ["self", "low", "high", "size"], js_randint.$defaults = [Sk.builtin.none.none$, Sk.builtin.none.none$, Sk.builtin.none.none$], $loc.randint = new Sk.builtin.func(js_randint); var js_random_integers = function(self, low, high, size) { return (null == high || Sk.builtin.checkNone(high)) && (high = low, low = new Sk.builtin.int_(1)), Sk.misceval.callsim(self.randint, self, low, sum = Sk.abstr.numberBinOp(high, new Sk.builtin.int_(1), "Add"), size) };
                js_random_integers.co_varnames = ["self", "low", "high", "size"], js_random_integers.$defaults = [Sk.builtin.none.none$, Sk.builtin.none.none$, Sk.builtin.none.none$], $loc.random_integers = new Sk.builtin.func(js_random_integers), $loc.rand = new Sk.builtin.func(function(self) { return args = new Sk.builtins.tuple(Array.prototype.slice.call(arguments, 1)), 0 === args.v.length ? Sk.misceval.callsim(self.random_sample, self) : Sk.misceval.callsim(self.random_sample, self, args) }); var js_binomial = function(self, n, p, size) { Sk.builtin.pyCheckArgs("binomial", arguments, 2, 3, !0); var on, op, ln, fp;
                    null == size && (size = Sk.builtin.none.none$); var ex = null; try { fp = Sk.ffi.remapToJs(new Sk.builtin.float_(p)), ln = Sk.ffi.remapToJs(new Sk.builtin.int_(n)) } catch (e) { ex = e } if (null === ex) { if (0 > ln) throw new Sk.builtin.ValueError("n < 0"); if (0 > fp) throw new Sk.builtin.ValueError("p < 0"); if (fp > 1) throw new Sk.builtin.ValueError("p > 1"); if (isNaN(fp)) throw new Sk.builtin.ValueError("p is nan"); return discnp_array_sc(self.internal_state, rk_binomial, size, ln, fp, self.lock) }
                    on = PyArray_FROM_OTF(n, Sk.builtin.int_), op = PyArray_FROM_OTF(p, Sk.builtin.float_); var py_zero = new Sk.builtin.int_(0); if (Sk.misceval.callsim(np.$d.any, Sk.misceval.callsim(np.$d.less, n, py_zero)) == Sk.builtin.bool.true$) throw new Sk.builtin.ValueError("n < 0"); if (Sk.misceval.callsim(np.$d.any, Sk.misceval.callsim(np.$d.less, p, py_zero)) == Sk.builtin.bool.true$) throw new Sk.builtin.ValueError("p < 0"); if (Sk.misceval.callsim(np.$d.any, Sk.misceval.callsim(np.$d.greater, p, new Sk.builtin.int_(1))) == Sk.builtin.bool.true$) throw new Sk.builtin.ValueError("p > 1"); return discnp_array(self.internal_state, rk_binomial, size, on, op, self.lock) };
                $loc.binomial = new Sk.builtin.func(js_binomial); var js_bytes = function(self, length) { throw new NotImplementedError("RandomState.bytes") };
                $loc.bytes = new Sk.builtin.func(js_bytes); var js_choice = function(self, length) { throw new NotImplementedError("RandomState.choice") };
                $loc.choice = new Sk.builtin.func(js_choice); var js_uniform = function(self, length) { throw new NotImplementedError("RandomState.uniform") };
                $loc.uniform = new Sk.builtin.func(js_uniform), $loc.randn = new Sk.builtin.func(function(self) { return args = new Sk.builtins.tuple(Array.prototype.slice.call(arguments, 1)), 0 === args.v.length ? Sk.misceval.callsim(self.standard_normal, self) : Sk.misceval.callsim(self.standard_normal, self, args) }), $loc.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr, $loc.tp$setattr = Sk.builtin.object.prototype.GenericSetAttr }; return mod[CLASS_RANDOMSTATE] = Sk.misceval.buildClass(mod, randomState_c, CLASS_RANDOMSTATE, []), mod._rand = Sk.misceval.callsim(mod[CLASS_RANDOMSTATE]), mod.rand = Sk.abstr.gattr(mod._rand, "rand", !0), mod.seed = Sk.abstr.gattr(mod._rand, "seed", !0), mod.random_sample = Sk.abstr.gattr(mod._rand, "random_sample", !0), mod.random = mod.random_sample, mod.sample = mod.random_sample, mod.binomial = Sk.abstr.gattr(mod._rand, "binomial", !0), mod.randint = Sk.abstr.gattr(mod._rand, "randint", !0), mod.random_integers = Sk.abstr.gattr(mod._rand, "random_integers", !0), mod };