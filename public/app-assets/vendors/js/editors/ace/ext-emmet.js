define("ace/snippets", ["require", "exports", "module", "ace/lib/oop", "ace/lib/event_emitter", "ace/lib/lang", "ace/range", "ace/range_list", "ace/keyboard/hash_handler", "ace/tokenizer", "ace/clipboard", "ace/lib/dom", "ace/editor"], function (e, t, n) {
    "use strict";

    function h(e) {
        var t = (new Date).toLocaleString("en-us", e);
        return t.length == 1 ? "0" + t : t
    }

    var r = e("./lib/oop"), i = e("./lib/event_emitter").EventEmitter, s = e("./lib/lang"), o = e("./range").Range,
        u = e("./range_list").RangeList, a = e("./keyboard/hash_handler").HashHandler, f = e("./tokenizer").Tokenizer,
        l = e("./clipboard"), c = {
            CURRENT_WORD: function (e) {
                return e.session.getTextRange(e.session.getWordRange())
            },
            SELECTION: function (e, t, n) {
                var r = e.session.getTextRange();
                return n ? r.replace(/\n\r?([ \t]*\S)/g, "\n" + n + "$1") : r
            },
            CURRENT_LINE: function (e) {
                return e.session.getLine(e.getCursorPosition().row)
            },
            PREV_LINE: function (e) {
                return e.session.getLine(e.getCursorPosition().row - 1)
            },
            LINE_INDEX: function (e) {
                return e.getCursorPosition().row
            },
            LINE_NUMBER: function (e) {
                return e.getCursorPosition().row + 1
            },
            SOFT_TABS: function (e) {
                return e.session.getUseSoftTabs() ? "YES" : "NO"
            },
            TAB_SIZE: function (e) {
                return e.session.getTabSize()
            },
            CLIPBOARD: function (e) {
                return l.getText && l.getText()
            },
            FILENAME: function (e) {
                return /[^/\\]*$/.exec(this.FILEPATH(e))[0]
            },
            FILENAME_BASE: function (e) {
                return /[^/\\]*$/.exec(this.FILEPATH(e))[0].replace(/\.[^.]*$/, "")
            },
            DIRECTORY: function (e) {
                return this.FILEPATH(e).replace(/[^/\\]*$/, "")
            },
            FILEPATH: function (e) {
                return "/not implemented.txt"
            },
            WORKSPACE_NAME: function () {
                return "Unknown"
            },
            FULLNAME: function () {
                return "Unknown"
            },
            BLOCK_COMMENT_START: function (e) {
                var t = e.session.$mode || {};
                return t.blockComment && t.blockComment.start || ""
            },
            BLOCK_COMMENT_END: function (e) {
                var t = e.session.$mode || {};
                return t.blockComment && t.blockComment.end || ""
            },
            LINE_COMMENT: function (e) {
                var t = e.session.$mode || {};
                return t.lineCommentStart || ""
            },
            CURRENT_YEAR: h.bind(null, {year: "numeric"}),
            CURRENT_YEAR_SHORT: h.bind(null, {year: "2-digit"}),
            CURRENT_MONTH: h.bind(null, {month: "numeric"}),
            CURRENT_MONTH_NAME: h.bind(null, {month: "long"}),
            CURRENT_MONTH_NAME_SHORT: h.bind(null, {month: "short"}),
            CURRENT_DATE: h.bind(null, {day: "2-digit"}),
            CURRENT_DAY_NAME: h.bind(null, {weekday: "long"}),
            CURRENT_DAY_NAME_SHORT: h.bind(null, {weekday: "short"}),
            CURRENT_HOUR: h.bind(null, {hour: "2-digit", hour12: !1}),
            CURRENT_MINUTE: h.bind(null, {minute: "2-digit"}),
            CURRENT_SECOND: h.bind(null, {second: "2-digit"})
        };
    c.SELECTED_TEXT = c.SELECTION;
    var p = function () {
        this.snippetMap = {}, this.snippetNameMap = {}
    };
    (function () {
        r.implement(this, i), this.getTokenizer = function () {
            return p.$tokenizer || this.createTokenizer()
        }, this.createTokenizer = function () {
            function e(e) {
                return e = e.substr(1), /^\d+$/.test(e) ? [{tabstopId: parseInt(e, 10)}] : [{text: e}]
            }

            function t(e) {
                return "(?:[^\\\\" + e + "]|\\\\.)"
            }

            var n = {
                regex: "/(" + t("/") + "+)/", onMatch: function (e, t, n) {
                    var r = n[0];
                    return r.fmtString = !0, r.guard = e.slice(1, -1), r.flag = "", ""
                }, next: "formatString"
            };
            return p.$tokenizer = new f({
                start: [{
                    regex: /\\./, onMatch: function (e, t, n) {
                        var r = e[1];
                        return r == "}" && n.length ? e = r : "`$\\".indexOf(r) != -1 && (e = r), [e]
                    }
                }, {
                    regex: /}/, onMatch: function (e, t, n) {
                        return [n.length ? n.shift() : e]
                    }
                }, {regex: /\$(?:\d+|\w+)/, onMatch: e}, {
                    regex: /\$\{[\dA-Z_a-z]+/, onMatch: function (t, n, r) {
                        var i = e(t.substr(1));
                        return r.unshift(i[0]), i
                    }, next: "snippetVar"
                }, {regex: /\n/, token: "newline", merge: !1}],
                snippetVar: [{
                    regex: "\\|" + t("\\|") + "*\\|", onMatch: function (e, t, n) {
                        var r = e.slice(1, -1).replace(/\\[,|\\]|,/g, function (e) {
                            return e.length == 2 ? e[1] : "\0"
                        }).split("\0");
                        return n[0].choices = r, [r[0]]
                    }, next: "start"
                }, n, {regex: "([^:}\\\\]|\\\\.)*:?", token: "", next: "start"}],
                formatString: [{
                    regex: /:/, onMatch: function (e, t, n) {
                        return n.length && n[0].expectElse ? (n[0].expectElse = !1, n[0].ifEnd = {elseEnd: n[0]}, [n[0].ifEnd]) : ":"
                    }
                }, {
                    regex: /\\./, onMatch: function (e, t, n) {
                        var r = e[1];
                        return r == "}" && n.length ? e = r : "`$\\".indexOf(r) != -1 ? e = r : r == "n" ? e = "\n" : r == "t" ? e = "	" : "ulULE".indexOf(r) != -1 && (e = {
                            changeCase: r,
                            local: r > "a"
                        }), [e]
                    }
                }, {
                    regex: "/\\w*}", onMatch: function (e, t, n) {
                        var r = n.shift();
                        return r && (r.flag = e.slice(1, -1)), this.next = r && r.tabstopId ? "start" : "", [r || e]
                    }, next: "start"
                }, {
                    regex: /\$(?:\d+|\w+)/, onMatch: function (e, t, n) {
                        return [{text: e.slice(1)}]
                    }
                }, {
                    regex: /\${\w+/, onMatch: function (e, t, n) {
                        var r = {text: e.slice(2)};
                        return n.unshift(r), [r]
                    }, next: "formatStringVar"
                }, {regex: /\n/, token: "newline", merge: !1}, {
                    regex: /}/, onMatch: function (e, t, n) {
                        var r = n.shift();
                        return this.next = r && r.tabstopId ? "start" : "", [r || e]
                    }, next: "start"
                }],
                formatStringVar: [{
                    regex: /:\/\w+}/, onMatch: function (e, t, n) {
                        var r = n[0];
                        return r.formatFunction = e.slice(2, -1), [n.shift()]
                    }, next: "formatString"
                }, n, {
                    regex: /:[\?\-+]?/, onMatch: function (e, t, n) {
                        e[1] == "+" && (n[0].ifEnd = n[0]), e[1] == "?" && (n[0].expectElse = !0)
                    }, next: "formatString"
                }, {regex: "([^:}\\\\]|\\\\.)*:?", token: "", next: "formatString"}]
            }), p.$tokenizer
        }, this.tokenizeTmSnippet = function (e, t) {
            return this.getTokenizer().getLineTokens(e, t).tokens.map(function (e) {
                return e.value || e
            })
        }, this.getVariableValue = function (e, t, n) {
            if (/^\d+$/.test(t)) return (this.variables.__ || {})[t] || "";
            if (/^[A-Z]\d+$/.test(t)) return (this.variables[t[0] + "__"] || {})[t.substr(1)] || "";
            t = t.replace(/^TM_/, "");
            if (!this.variables.hasOwnProperty(t)) return "";
            var r = this.variables[t];
            return typeof r == "function" && (r = this.variables[t](e, t, n)), r == null ? "" : r
        }, this.variables = c, this.tmStrFormat = function (e, t, n) {
            if (!t.fmt) return e;
            var r = t.flag || "", i = t.guard;
            i = new RegExp(i, r.replace(/[^gim]/g, ""));
            var s = typeof t.fmt == "string" ? this.tokenizeTmSnippet(t.fmt, "formatString") : t.fmt, o = this,
                u = e.replace(i, function () {
                    var e = o.variables.__;
                    o.variables.__ = [].slice.call(arguments);
                    var t = o.resolveVariables(s, n), r = "E";
                    for (var i = 0; i < t.length; i++) {
                        var u = t[i];
                        if (typeof u == "object") {
                            t[i] = "";
                            if (u.changeCase && u.local) {
                                var a = t[i + 1];
                                a && typeof a == "string" && (u.changeCase == "u" ? t[i] = a[0].toUpperCase() : t[i] = a[0].toLowerCase(), t[i + 1] = a.substr(1))
                            } else u.changeCase && (r = u.changeCase)
                        } else r == "U" ? t[i] = u.toUpperCase() : r == "L" && (t[i] = u.toLowerCase())
                    }
                    return o.variables.__ = e, t.join("")
                });
            return u
        }, this.tmFormatFunction = function (e, t, n) {
            return t.formatFunction == "upcase" ? e.toUpperCase() : t.formatFunction == "downcase" ? e.toLowerCase() : e
        }, this.resolveVariables = function (e, t) {
            function f(t) {
                var n = e.indexOf(t, s + 1);
                n != -1 && (s = n)
            }

            var n = [], r = "", i = !0;
            for (var s = 0; s < e.length; s++) {
                var o = e[s];
                if (typeof o == "string") {
                    n.push(o), o == "\n" ? (i = !0, r = "") : i && (r = /^\t*/.exec(o)[0], i = /\S/.test(o));
                    continue
                }
                if (!o) continue;
                i = !1;
                if (o.fmtString) {
                    var u = e.indexOf(o, s + 1);
                    u == -1 && (u = e.length), o.fmt = e.slice(s + 1, u), s = u
                }
                if (o.text) {
                    var a = this.getVariableValue(t, o.text, r) + "";
                    o.fmtString && (a = this.tmStrFormat(a, o, t)), o.formatFunction && (a = this.tmFormatFunction(a, o, t)), a && !o.ifEnd ? (n.push(a), f(o)) : !a && o.ifEnd && f(o.ifEnd)
                } else o.elseEnd ? f(o.elseEnd) : o.tabstopId != null ? n.push(o) : o.changeCase != null && n.push(o)
            }
            return n
        }, this.insertSnippetForSelection = function (e, t) {
            function f(e) {
                var t = [];
                for (var n = 0; n < e.length; n++) {
                    var r = e[n];
                    if (typeof r == "object") {
                        if (a[r.tabstopId]) continue;
                        var i = e.lastIndexOf(r, n - 1);
                        r = t[i] || {tabstopId: r.tabstopId}
                    }
                    t[n] = r
                }
                return t
            }

            var n = e.getCursorPosition(), r = e.session.getLine(n.row), i = e.session.getTabString(),
                s = r.match(/^\s*/)[0];
            n.column < s.length && (s = s.slice(0, n.column)), t = t.replace(/\r/g, "");
            var o = this.tokenizeTmSnippet(t);
            o = this.resolveVariables(o, e), o = o.map(function (e) {
                return e == "\n" ? e + s : typeof e == "string" ? e.replace(/\t/g, i) : e
            });
            var u = [];
            o.forEach(function (e, t) {
                if (typeof e != "object") return;
                var n = e.tabstopId, r = u[n];
                r || (r = u[n] = [], r.index = n, r.value = "", r.parents = {});
                if (r.indexOf(e) !== -1) return;
                e.choices && !r.choices && (r.choices = e.choices), r.push(e);
                var i = o.indexOf(e, t + 1);
                if (i === -1) return;
                var s = o.slice(t + 1, i), a = s.some(function (e) {
                    return typeof e == "object"
                });
                a && !r.value ? r.value = s : s.length && (!r.value || typeof r.value != "string") && (r.value = s.join(""))
            }), u.forEach(function (e) {
                e.length = 0
            });
            var a = {};
            for (var l = 0; l < o.length; l++) {
                var c = o[l];
                if (typeof c != "object") continue;
                var h = c.tabstopId, p = u[h], v = o.indexOf(c, l + 1);
                if (a[h]) {
                    a[h] === c && (delete a[h], Object.keys(a).forEach(function (e) {
                        p.parents[e] = !0
                    }));
                    continue
                }
                a[h] = c;
                var m = p.value;
                typeof m != "string" ? m = f(m) : c.fmt && (m = this.tmStrFormat(m, c, e)), o.splice.apply(o, [l + 1, Math.max(0, v - l)].concat(m, c)), p.indexOf(c) === -1 && p.push(c)
            }
            var g = 0, y = 0, b = "";
            o.forEach(function (e) {
                if (typeof e == "string") {
                    var t = e.split("\n");
                    t.length > 1 ? (y = t[t.length - 1].length, g += t.length - 1) : y += e.length, b += e
                } else e && (e.start ? e.end = {row: g, column: y} : e.start = {row: g, column: y})
            });
            var w = e.getSelectionRange(), E = e.session.replace(w, b), S = new d(e),
                x = e.inVirtualSelectionMode && e.selection.index;
            S.addTabstops(u, w.start, E, x)
        }, this.insertSnippet = function (e, t) {
            var n = this;
            if (e.inVirtualSelectionMode) return n.insertSnippetForSelection(e, t);
            e.forEachSelection(function () {
                n.insertSnippetForSelection(e, t)
            }, null, {keepOrder: !0}), e.tabstopManager && e.tabstopManager.tabNext()
        }, this.$getScope = function (e) {
            var t = e.session.$mode.$id || "";
            t = t.split("/").pop();
            if (t === "html" || t === "php") {
                t === "php" && !e.session.$mode.inlinePhp && (t = "html");
                var n = e.getCursorPosition(), r = e.session.getState(n.row);
                typeof r == "object" && (r = r[0]), r.substring && (r.substring(0, 3) == "js-" ? t = "javascript" : r.substring(0, 4) == "css-" ? t = "css" : r.substring(0, 4) == "php-" && (t = "php"))
            }
            return t
        }, this.getActiveScopes = function (e) {
            var t = this.$getScope(e), n = [t], r = this.snippetMap;
            return r[t] && r[t].includeScopes && n.push.apply(n, r[t].includeScopes), n.push("_"), n
        }, this.expandWithTab = function (e, t) {
            var n = this, r = e.forEachSelection(function () {
                return n.expandSnippetForSelection(e, t)
            }, null, {keepOrder: !0});
            return r && e.tabstopManager && e.tabstopManager.tabNext(), r
        }, this.expandSnippetForSelection = function (e, t) {
            var n = e.getCursorPosition(), r = e.session.getLine(n.row), i = r.substring(0, n.column),
                s = r.substr(n.column), o = this.snippetMap, u;
            return this.getActiveScopes(e).some(function (e) {
                var t = o[e];
                return t && (u = this.findMatchingSnippet(t, i, s)), !!u
            }, this), u ? t && t.dryRun ? !0 : (e.session.doc.removeInLine(n.row, n.column - u.replaceBefore.length, n.column + u.replaceAfter.length), this.variables.M__ = u.matchBefore, this.variables.T__ = u.matchAfter, this.insertSnippetForSelection(e, u.content), this.variables.M__ = this.variables.T__ = null, !0) : !1
        }, this.findMatchingSnippet = function (e, t, n) {
            for (var r = e.length; r--;) {
                var i = e[r];
                if (i.startRe && !i.startRe.test(t)) continue;
                if (i.endRe && !i.endRe.test(n)) continue;
                if (!i.startRe && !i.endRe) continue;
                return i.matchBefore = i.startRe ? i.startRe.exec(t) : [""], i.matchAfter = i.endRe ? i.endRe.exec(n) : [""], i.replaceBefore = i.triggerRe ? i.triggerRe.exec(t)[0] : "", i.replaceAfter = i.endTriggerRe ? i.endTriggerRe.exec(n)[0] : "", i
            }
        }, this.snippetMap = {}, this.snippetNameMap = {}, this.register = function (e, t) {
            function o(e) {
                return e && !/^\^?\(.*\)\$?$|^\\b$/.test(e) && (e = "(?:" + e + ")"), e || ""
            }

            function u(e, t, n) {
                return e = o(e), t = o(t), n ? (e = t + e, e && e[e.length - 1] != "$" && (e += "$")) : (e += t, e && e[0] != "^" && (e = "^" + e)), new RegExp(e)
            }

            function a(e) {
                e.scope || (e.scope = t || "_"), t = e.scope, n[t] || (n[t] = [], r[t] = {});
                var o = r[t];
                if (e.name) {
                    var a = o[e.name];
                    a && i.unregister(a), o[e.name] = e
                }
                n[t].push(e), e.tabTrigger && !e.trigger && (!e.guard && /^\w/.test(e.tabTrigger) && (e.guard = "\\b"), e.trigger = s.escapeRegExp(e.tabTrigger));
                if (!e.trigger && !e.guard && !e.endTrigger && !e.endGuard) return;
                e.startRe = u(e.trigger, e.guard, !0), e.triggerRe = new RegExp(e.trigger), e.endRe = u(e.endTrigger, e.endGuard, !0), e.endTriggerRe = new RegExp(e.endTrigger)
            }

            var n = this.snippetMap, r = this.snippetNameMap, i = this;
            e || (e = []), e && e.content ? a(e) : Array.isArray(e) && e.forEach(a), this._signal("registerSnippets", {scope: t})
        }, this.unregister = function (e, t) {
            function i(e) {
                var i = r[e.scope || t];
                if (i && i[e.name]) {
                    delete i[e.name];
                    var s = n[e.scope || t], o = s && s.indexOf(e);
                    o >= 0 && s.splice(o, 1)
                }
            }

            var n = this.snippetMap, r = this.snippetNameMap;
            e.content ? i(e) : Array.isArray(e) && e.forEach(i)
        }, this.parseSnippetFile = function (e) {
            e = e.replace(/\r/g, "");
            var t = [], n = {}, r = /^#.*|^({[\s\S]*})\s*$|^(\S+) (.*)$|^((?:\n*\t.*)+)/gm, i;
            while (i = r.exec(e)) {
                if (i[1]) try {
                    n = JSON.parse(i[1]), t.push(n)
                } catch (s) {
                }
                if (i[4]) n.content = i[4].replace(/^\t/gm, ""), t.push(n), n = {}; else {
                    var o = i[2], u = i[3];
                    if (o == "regex") {
                        var a = /\/((?:[^\/\\]|\\.)*)|$/g;
                        n.guard = a.exec(u)[1], n.trigger = a.exec(u)[1], n.endTrigger = a.exec(u)[1], n.endGuard = a.exec(u)[1]
                    } else o == "snippet" ? (n.tabTrigger = u.match(/^\S*/)[0], n.name || (n.name = u)) : n[o] = u
                }
            }
            return t
        }, this.getSnippetByName = function (e, t) {
            var n = this.snippetNameMap, r;
            return this.getActiveScopes(t).some(function (t) {
                var i = n[t];
                return i && (r = i[e]), !!r
            }, this), r
        }
    }).call(p.prototype);
    var d = function (e) {
        if (e.tabstopManager) return e.tabstopManager;
        e.tabstopManager = this, this.$onChange = this.onChange.bind(this), this.$onChangeSelection = s.delayedCall(this.onChangeSelection.bind(this)).schedule, this.$onChangeSession = this.onChangeSession.bind(this), this.$onAfterExec = this.onAfterExec.bind(this), this.attach(e)
    };
    (function () {
        this.attach = function (e) {
            this.index = 0, this.ranges = [], this.tabstops = [], this.$openTabstops = null, this.selectedTabstop = null, this.editor = e, this.editor.on("change", this.$onChange), this.editor.on("changeSelection", this.$onChangeSelection), this.editor.on("changeSession", this.$onChangeSession), this.editor.commands.on("afterExec", this.$onAfterExec), this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler)
        }, this.detach = function () {
            this.tabstops.forEach(this.removeTabstopMarkers, this), this.ranges = null, this.tabstops = null, this.selectedTabstop = null, this.editor.removeListener("change", this.$onChange), this.editor.removeListener("changeSelection", this.$onChangeSelection), this.editor.removeListener("changeSession", this.$onChangeSession), this.editor.commands.removeListener("afterExec", this.$onAfterExec), this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler), this.editor.tabstopManager = null, this.editor = null
        }, this.onChange = function (e) {
            var t = e.action[0] == "r", n = this.selectedTabstop && this.selectedTabstop.parents || {},
                r = (this.tabstops || []).slice();
            for (var i = 0; i < r.length; i++) {
                var s = r[i], o = s == this.selectedTabstop || n[s.index];
                s.rangeList.$bias = o ? 0 : 1;
                if (e.action == "remove" && s !== this.selectedTabstop) {
                    var u = s.parents && s.parents[this.selectedTabstop.index], a = s.rangeList.pointIndex(e.start, u);
                    a = a < 0 ? -a - 1 : a + 1;
                    var f = s.rangeList.pointIndex(e.end, u);
                    f = f < 0 ? -f - 1 : f - 1;
                    var l = s.rangeList.ranges.slice(a, f);
                    for (var c = 0; c < l.length; c++) this.removeRange(l[c])
                }
                s.rangeList.$onChange(e)
            }
            var h = this.editor.session;
            !this.$inChange && t && h.getLength() == 1 && !h.getValue() && this.detach()
        }, this.updateLinkedFields = function () {
            var e = this.selectedTabstop;
            if (!e || !e.hasLinkedRanges || !e.firstNonLinked) return;
            this.$inChange = !0;
            var n = this.editor.session, r = n.getTextRange(e.firstNonLinked);
            for (var i = 0; i < e.length; i++) {
                var s = e[i];
                if (!s.linked) continue;
                var o = s.original, u = t.snippetManager.tmStrFormat(r, o, this.editor);
                n.replace(s, u)
            }
            this.$inChange = !1
        }, this.onAfterExec = function (e) {
            e.command && !e.command.readOnly && this.updateLinkedFields()
        }, this.onChangeSelection = function () {
            if (!this.editor) return;
            var e = this.editor.selection.lead, t = this.editor.selection.anchor, n = this.editor.selection.isEmpty();
            for (var r = 0; r < this.ranges.length; r++) {
                if (this.ranges[r].linked) continue;
                var i = this.ranges[r].contains(e.row, e.column), s = n || this.ranges[r].contains(t.row, t.column);
                if (i && s) return
            }
            this.detach()
        }, this.onChangeSession = function () {
            this.detach()
        }, this.tabNext = function (e) {
            var t = this.tabstops.length, n = this.index + (e || 1);
            n = Math.min(Math.max(n, 1), t), n == t && (n = 0), this.selectTabstop(n), n === 0 && this.detach()
        }, this.selectTabstop = function (e) {
            this.$openTabstops = null;
            var t = this.tabstops[this.index];
            t && this.addTabstopMarkers(t), this.index = e, t = this.tabstops[this.index];
            if (!t || !t.length) return;
            this.selectedTabstop = t;
            var n = t.firstNonLinked || t;
            if (!this.editor.inVirtualSelectionMode) {
                var r = this.editor.multiSelect;
                r.toSingleRange(n.clone());
                for (var i = 0; i < t.length; i++) {
                    if (t.hasLinkedRanges && t[i].linked) continue;
                    r.addRange(t[i].clone(), !0)
                }
                r.ranges[0] && r.addRange(r.ranges[0].clone())
            } else this.editor.selection.setRange(n);
            this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler), this.selectedTabstop && this.selectedTabstop.choices && this.editor.execCommand("startAutocomplete", {matches: this.selectedTabstop.choices})
        }, this.addTabstops = function (e, t, n) {
            var r = this.useLink || !this.editor.getOption("enableMultiselect");
            this.$openTabstops || (this.$openTabstops = []);
            if (!e[0]) {
                var i = o.fromPoints(n, n);
                m(i.start, t), m(i.end, t), e[0] = [i], e[0].index = 0
            }
            var s = this.index, a = [s + 1, 0], f = this.ranges;
            e.forEach(function (e, n) {
                var i = this.$openTabstops[n] || e;
                e.rangeList = new u, e.rangeList.$bias = 0;
                for (var s = 0; s < e.length; s++) {
                    var l = e[s], c = o.fromPoints(l.start, l.end || l.start);
                    v(c.start, t), v(c.end, t), c.original = l, c.tabstop = i, f.push(c), e.rangeList.ranges.push(c), i != e ? i.unshift(c) : i[s] = c, l.fmtString || i.firstNonLinked && r ? (c.linked = !0, i.hasLinkedRanges = !0) : i.firstNonLinked || (i.firstNonLinked = c)
                }
                i.firstNonLinked || (i.hasLinkedRanges = !1), i === e && (a.push(i), this.$openTabstops[n] = i), this.addTabstopMarkers(i)
            }, this), a.length > 2 && (this.tabstops.length && a.push(a.splice(2, 1)[0]), this.tabstops.splice.apply(this.tabstops, a))
        }, this.addTabstopMarkers = function (e) {
            var t = this.editor.session;
            e.forEach(function (e) {
                e.markerId || (e.markerId = t.addMarker(e, "ace_snippet-marker", "text"))
            })
        }, this.removeTabstopMarkers = function (e) {
            var t = this.editor.session;
            e.forEach(function (e) {
                t.removeMarker(e.markerId), e.markerId = null
            })
        }, this.removeRange = function (e) {
            var t = e.tabstop.indexOf(e);
            t != -1 && e.tabstop.splice(t, 1), t = this.ranges.indexOf(e), t != -1 && this.ranges.splice(t, 1), t = e.tabstop.rangeList.ranges.indexOf(e), t != -1 && e.tabstop.splice(t, 1), this.editor.session.removeMarker(e.markerId), e.tabstop.length || (t = this.tabstops.indexOf(e.tabstop), t != -1 && this.tabstops.splice(t, 1), this.tabstops.length || this.detach())
        }, this.keyboardHandler = new a, this.keyboardHandler.bindKeys({
            Tab: function (e) {
                if (t.snippetManager && t.snippetManager.expandWithTab(e)) return;
                e.tabstopManager.tabNext(1)
            }, "Shift-Tab": function (e) {
                e.tabstopManager.tabNext(-1)
            }, Esc: function (e) {
                e.tabstopManager.detach()
            }, Return: function (e) {
                return !1
            }
        })
    }).call(d.prototype);
    var v = function (e, t) {
        e.row == 0 && (e.column += t.column), e.row += t.row
    }, m = function (e, t) {
        e.row == t.row && (e.column -= t.column), e.row -= t.row
    };
    e("./lib/dom").importCssString(".ace_snippet-marker {    -moz-box-sizing: border-box;    box-sizing: border-box;    background: rgba(194, 193, 208, 0.09);    border: 1px dotted rgba(211, 208, 235, 0.62);    position: absolute;}"), t.snippetManager = new p;
    var g = e("./editor").Editor;
    (function () {
        this.insertSnippet = function (e, n) {
            return t.snippetManager.insertSnippet(this, e, n)
        }, this.expandSnippet = function (e) {
            return t.snippetManager.expandWithTab(this, e)
        }
    }).call(g.prototype)
}), define("ace/ext/emmet", ["require", "exports", "module", "ace/keyboard/hash_handler", "ace/editor", "ace/snippets", "ace/range", "ace/config", "resources", "resources", "tabStops", "resources", "utils", "actions"], function (e, t, n) {
    "use strict";

    function l() {
    }

    var r = e("../keyboard/hash_handler").HashHandler, i = e("../editor").Editor, s = e("../snippets").snippetManager,
        o = e("../range").Range, u = e("../config"), a, f;
    l.prototype = {
        setupContext: function (e) {
            this.ace = e, this.indentation = e.session.getTabString(), a || (a = window.emmet);
            var t = a.resources || a.require("resources");
            t.setVariable("indentation", this.indentation), this.$syntax = null, this.$syntax = this.getSyntax()
        }, getSelectionRange: function () {
            var e = this.ace.getSelectionRange(), t = this.ace.session.doc;
            return {start: t.positionToIndex(e.start), end: t.positionToIndex(e.end)}
        }, createSelection: function (e, t) {
            var n = this.ace.session.doc;
            this.ace.selection.setRange({start: n.indexToPosition(e), end: n.indexToPosition(t)})
        }, getCurrentLineRange: function () {
            var e = this.ace, t = e.getCursorPosition().row, n = e.session.getLine(t).length,
                r = e.session.doc.positionToIndex({row: t, column: 0});
            return {start: r, end: r + n}
        }, getCaretPos: function () {
            var e = this.ace.getCursorPosition();
            return this.ace.session.doc.positionToIndex(e)
        }, setCaretPos: function (e) {
            var t = this.ace.session.doc.indexToPosition(e);
            this.ace.selection.moveToPosition(t)
        }, getCurrentLine: function () {
            var e = this.ace.getCursorPosition().row;
            return this.ace.session.getLine(e)
        }, replaceContent: function (e, t, n, r) {
            n == null && (n = t == null ? this.getContent().length : t), t == null && (t = 0);
            var i = this.ace, u = i.session.doc, a = o.fromPoints(u.indexToPosition(t), u.indexToPosition(n));
            i.session.remove(a), a.end = a.start, e = this.$updateTabstops(e), s.insertSnippet(i, e)
        }, getContent: function () {
            return this.ace.getValue()
        }, getSyntax: function () {
            if (this.$syntax) return this.$syntax;
            var e = this.ace.session.$modeId.split("/").pop();
            if (e == "html" || e == "php") {
                var t = this.ace.getCursorPosition(), n = this.ace.session.getState(t.row);
                typeof n != "string" && (n = n[0]), n && (n = n.split("-"), n.length > 1 ? e = n[0] : e == "php" && (e = "html"))
            }
            return e
        }, getProfileName: function () {
            var e = a.resources || a.require("resources");
            switch (this.getSyntax()) {
                case"css":
                    return "css";
                case"xml":
                case"xsl":
                    return "xml";
                case"html":
                    var t = e.getVariable("profile");
                    return t || (t = this.ace.session.getLines(0, 2).join("").search(/<!DOCTYPE[^>]+XHTML/i) != -1 ? "xhtml" : "html"), t;
                default:
                    var n = this.ace.session.$mode;
                    return n.emmetConfig && n.emmetConfig.profile || "xhtml"
            }
        }, prompt: function (e) {
            return prompt(e)
        }, getSelection: function () {
            return this.ace.session.getTextRange()
        }, getFilePath: function () {
            return ""
        }, $updateTabstops: function (e) {
            var t = 1e3, n = 0, r = null, i = a.tabStops || a.require("tabStops"),
                s = a.resources || a.require("resources"), o = s.getVocabulary("user"), u = {
                    tabstop: function (e) {
                        var s = parseInt(e.group, 10), o = s === 0;
                        o ? s = ++n : s += t;
                        var a = e.placeholder;
                        a && (a = i.processText(a, u));
                        var f = "${" + s + (a ? ":" + a : "") + "}";
                        return o && (r = [e.start, f]), f
                    }, escape: function (e) {
                        return e == "$" ? "\\$" : e == "\\" ? "\\\\" : e
                    }
                };
            e = i.processText(e, u);
            if (o.variables.insert_final_tabstop && !/\$\{0\}$/.test(e)) e += "${0}"; else if (r) {
                var f = a.utils ? a.utils.common : a.require("utils");
                e = f.replaceSubstring(e, "${0}", r[0], r[1])
            }
            return e
        }
    };
    var c = {
        expand_abbreviation: {mac: "ctrl+alt+e", win: "alt+e"},
        match_pair_outward: {mac: "ctrl+d", win: "ctrl+,"},
        match_pair_inward: {mac: "ctrl+j", win: "ctrl+shift+0"},
        matching_pair: {mac: "ctrl+alt+j", win: "alt+j"},
        next_edit_point: "alt+right",
        prev_edit_point: "alt+left",
        toggle_comment: {mac: "command+/", win: "ctrl+/"},
        split_join_tag: {mac: "shift+command+'", win: "shift+ctrl+`"},
        remove_tag: {mac: "command+'", win: "shift+ctrl+;"},
        evaluate_math_expression: {mac: "shift+command+y", win: "shift+ctrl+y"},
        increment_number_by_1: "ctrl+up",
        decrement_number_by_1: "ctrl+down",
        increment_number_by_01: "alt+up",
        decrement_number_by_01: "alt+down",
        increment_number_by_10: {mac: "alt+command+up", win: "shift+alt+up"},
        decrement_number_by_10: {mac: "alt+command+down", win: "shift+alt+down"},
        select_next_item: {mac: "shift+command+.", win: "shift+ctrl+."},
        select_previous_item: {mac: "shift+command+,", win: "shift+ctrl+,"},
        reflect_css_value: {mac: "shift+command+r", win: "shift+ctrl+r"},
        encode_decode_data_url: {mac: "shift+ctrl+d", win: "ctrl+'"},
        expand_abbreviation_with_tab: "Tab",
        wrap_with_abbreviation: {mac: "shift+ctrl+a", win: "shift+ctrl+a"}
    }, h = new l;
    t.commands = new r, t.runEmmetCommand = function v(e) {
        if (this.action == "expand_abbreviation_with_tab") {
            if (!e.selection.isEmpty()) return !1;
            var n = e.selection.lead, r = e.session.getTokenAt(n.row, n.column);
            if (r && /\btag\b/.test(r.type)) return !1
        }
        try {
            h.setupContext(e);
            var i = a.actions || a.require("actions");
            if (this.action == "wrap_with_abbreviation") return setTimeout(function () {
                i.run("wrap_with_abbreviation", h)
            }, 0);
            var s = i.run(this.action, h)
        } catch (o) {
            if (!a) {
                var f = t.load(v.bind(this, e));
                return this.action == "expand_abbreviation_with_tab" ? !1 : f
            }
            e._signal("changeStatus", typeof o == "string" ? o : o.message), u.warn(o), s = !1
        }
        return s
    };
    for (var p in c) t.commands.addCommand({
        name: "emmet:" + p,
        action: p,
        bindKey: c[p],
        exec: t.runEmmetCommand,
        multiSelectAction: "forEach"
    });
    t.updateCommands = function (e, n) {
        n ? e.keyBinding.addKeyboardHandler(t.commands) : e.keyBinding.removeKeyboardHandler(t.commands)
    }, t.isSupportedMode = function (e) {
        if (!e) return !1;
        if (e.emmetConfig) return !0;
        var t = e.$id || e;
        return /css|less|scss|sass|stylus|html|php|twig|ejs|handlebars/.test(t)
    }, t.isAvailable = function (e, n) {
        if (/(evaluate_math_expression|expand_abbreviation)$/.test(n)) return !0;
        var r = e.session.$mode, i = t.isSupportedMode(r);
        if (i && r.$modes) try {
            h.setupContext(e), /js|php/.test(h.getSyntax()) && (i = !1)
        } catch (s) {
        }
        return i
    };
    var d = function (e, n) {
        var r = n;
        if (!r) return;
        var i = t.isSupportedMode(r.session.$mode);
        e.enableEmmet === !1 && (i = !1), i && t.load(), t.updateCommands(r, i)
    };
    t.load = function (e) {
        return typeof f != "string" ? (u.warn("script for emmet-core is not loaded"), !1) : (u.loadModule(f, function () {
            f = null, e && e()
        }), !0)
    }, t.AceEmmetEditor = l, u.defineOptions(i.prototype, "editor", {
        enableEmmet: {
            set: function (e) {
                this[e ? "on" : "removeListener"]("changeMode", d), d({enableEmmet: !!e}, this)
            }, value: !0
        }
    }), t.setCore = function (e) {
        typeof e == "string" ? f = e : a = e
    }
});
(function () {
    window.require(["ace/ext/emmet"], function (m) {
        if (typeof module == "object" && typeof exports == "object" && module) {
            module.exports = m;
        }
    });
})();
