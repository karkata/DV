import * as common from "dv.common.js";

export class DVE {
	constructor(element, parent) {
		this.name = element.tagName;
		this.element = element;
		this.autolayout = "";
		this.transformation = [];
		this.children = [];
		this.parent = parent ? parent : null;
	}

	setAutoLayout(definition) {
		this.autoLayout = definition;
		return this;
	}

	updateLayout (dic) {
		dic = dic || {};
		let size = common.getElementSize(this.element);
		for (let i = 0, len = this.children.length, child = null; i < len; i++) {
			child = this.children[i];
			if (child.element.nodeType === 1) {
				common.relayout(child, size.w, size.h, dic);
			}
		}
	}

	attr(name, value, appending) {
		if (!common.isDef(name)) return this;
		if (!common.isDef(value)) {
			if (common.isXLink(name))
				return this.element.getAttributeNS(common.NS_XLNK, name.substring(6));
			else
				return this.element.getAttributeNS(null, name);
		} else {
			if (appending) {
				let oldv = this.attr(name);
				if (oldv && oldv.length > 0) {
					value = oldv + " " + value;
				}
			}
			this.element.setAttributeNS(common.isXLink(name) ? common.NS_XLNK : null, name, value);
			return this;
		}
	}

	rmattr(name, value) {
		if (!common.isDef(name)) return this;
		if (!common.isDef(value)) {
			if (common.isXLink(name))
				this.element.removeAttributeNS(common.NS_XLNK, name.substring(6));
			else
				this.element.removeAttributeNS(null, name);
		} else {
			let oldv = this.attr(name);
			if (oldv && oldv.length > 0) {
				let tokens = oldv.split(" ");
				for (let i = 0; i < tokens.length;) {
					if (tokens[i] == value) {
						tokens.splice(i, 1);
					} else {
						i++;
					}
				}
				oldv = tokens.join(" ");
				this.attr(name, oldv);
			}
		}
		return this;
	}

	id(v) {
		if (common.isDef(v))
			return this.attr("id", v);
		else if (common.isDef(this.element.id))
			return this.element.id;
		else
			return undefined;
	}

	ref() {
		let idstr = this.id();
		return common.isDef(idstr) ? "#" + idstr : undefined;
	}

	has(element) {
		return (element instanceof DVE) ? (this.children.indexOf(element) >= 0) : false;
	}

	detach() {
		if (this.parent) {
			let idx = this.parent.children.indexOf(this);
			if (idx >= 0) this.parent.children.splice(idx, 1);
			this.parent = null;
		}
		if (this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}
		return this;
	}

	append(...p) {
		if (p.length > 1) {
			for (let i = 0, len = p.length; i < len; i++) {
				this.append(p[i]);
			}
		} else {
			let child = p[0];
			if (child instanceof DVE) {
				child.detach();
				this.element.appendChild(child.element);
				this.children.push(child);
				child.parent = this;
			} else {
				console.log("[DV] The child parameter must be an instance of the DVE.");
			}
		}
		return this;
	}

	into(container) {
		if (typeof container === "string") {
			container = document.querySelector(common.refineId(container, true));
		}
		if (container instanceof DVE) {
			container.append(this);
		} else if (container.appendChild) {
			this.detach();
			container.appendChild(this.element);
		} else {
			console.log("[DV] The parent parameter is not an instance of the DVE or HTMLElement.");
		}
		return this;
	}

	getClass() {
		return this.attr("class");
	}
	
	setClass(className, append) {
		return this.attr("class", className, append === true);
	}

	css(sname, svalue) {
		let oldvs = this.attr("style");
		if (common.isDef(sname) && common.isDef(svalue)) {
			if (oldvs) {
				let items = [];
				let regex = /([a-z-]+)\s*\:\s*([^;$]+)/gi;
				let rs = regex.exec(oldvs);
				while (rs != null) {
					if (rs[1].toLowerCase() == sname.toLowerCase())
						items.push(sname + ":" + svalue);
					else
						items.push(rs[1] + ":" + rs[2]);
					// more
					rs = regex.exec(oldvs);
				}
				this.attr("style", items.join(";"));
			} else {
				this.attr("style", sname + ":" + svalue);
			}
			return this;
		} if (common.isDef(sname) && !common.isDef(svalue)) {
			if (oldvs) {
				let regex = /([a-z-]+)\s*\:\s*([^;$]+)/gi;
				let rs = regex.exec(oldvs);
				while (rs != null) {
					if (rs[1].toLowerCase() == sname.toLowerCase())
						return rs[2];
					// more
					rs = regex.exec(oldvs);
				}
			}
			return undefined;
		} else {
			return this;
		}
	}

	point(x, y) {
        if (["filter", "foreignObject", "image", "pattern", "rect", "svg", "use", "mask"].indexOf(this.name) == -1) return this;
        if (common.isDef(x)) this.attr("x", x);
        if (common.isDef(y)) this.attr("y", y);
        return this;
    }

    point1(x1, y1) {
        if (["line", "linearGradient"].indexOf(this.name) == -1) return this;
        if (common.isDef(x1)) this.attr("x1", x1);
        if (common.isDef(y1)) this.attr("y1", y1);
        return this;
    }

    point2(x2, y2) {
        if (["line", "linearGradient"].indexOf(this.name) == -1) return this;
        if (common.isDef(x2)) this.attr("x2", x2);
        if (common.isDef(y2)) this.attr("y2", y2);
        return this;
    }

    points(listOfPoints) {
        if (["polygon", "polyline"].indexOf(this.name) == -1) return this;
        if (common.isDef(listOfPoints)) this.attr("points", common.convertListOfPointString(listOfPoints));
        return this;
    }

    bound(x1, y1, x2, y2) {
        return this.point1(x1, y1).point2(x2, y2);
    }

    size(w, h) { 
        if (["filter", "foreignObject", "image", "pattern", "rect", "svg", "use", "mask"].indexOf(this.name) == -1) return this;
        if (common.isDef(w)) this.attr("width", w);
        if (common.isDef(h)) this.attr("height", h);
        return this;
    }

    center(cx, cy) {
        if (["circle", "ellipse", "radialGradient"].indexOf(this.name) == -1) return this;
        if (common.isDef(cx)) this.attr("cx", cx);
        if (common.isDef(cy)) this.attr("cy", cy);
        return this;
    }

    radius(r) {
        if (["circle", "radialGradient"].indexOf(this.name) == -1) return this;
        if (common.isDef(r)) this.attr("r", r);
        return this;
    }

    focalPoint(fx, fy) {
        if ("radialGradient" != this.name) return this;
        if (common.isDef(fx)) this.attr("fx", fx);
        if (common.isDef(fy)) this.attr("fy", fy);
        return this;
    }

    round(rx, ry) {
        if (["rect", "ellipse"].indexOf(this.name) == -1) return this;
        if (common.isDef(rx)) this.attr("rx", rx);
        if (common.isDef(ry)) this.attr("ry", ry);
        return this;
    }

    dim(x, y, w, h) {
        return this.point(x, y).size(w, h);
    }

    fitToParent() {
        return this.dim(0, 0, "100%", "100%");
    }

    viewbox(minx, miny, w, h) {
        if (["image", "marker", "pattern", "svg", "symbol", "view"].indexOf(this.name) == -1) return this;
        if (common.isDef(minx, miny, w, h)) return this.attr("viewBox", [minx, miny, w, h].join(" "));
        return this;
    }

    aspectRatio(align, mos) {
        if (["feImage", "image", "marker", "pattern", "svg", "symbol", "view"].indexOf(this.name) == -1) return this;
        if (common.isDef(align)) this.attr("preserveAspectRatio", align);
        if (common.isDef(mos)) this.attr("preserveAspectRatio", mos, true);
        return this;
    }

    zoomAndPan(value) {
        if (this.name != "svg") return this;
        return this.attr("zoomAndPan", value);
    }

    fill(paint, opacity, rule) {
        if (common.E_NAME_ANI.indexOf(this.name) < 0 && common.E_NAME_SHP.indexOf(this.name) < 0 && common.E_NAME_TXT.indexOf(this.name) < 0 && "g" != this.name) return this;
        if (this.name == "line") return this;
        if (common.E_NAME_ANI.indexOf(this.name) >= 0 && ["freeze", "remove"].indexOf(paint) < 0) return this;
        if (common.isDef(paint)) {
            if (paint instanceof DVE) this.attr("fill", common.getFuncIRI(paint));
            else this.attr("fill", paint);
        }
        if (common.isDef(opacity)) this.attr("fill-opacity", opacity);
        if (common.isDef(rule)) this.attr("fill-rule", rule);
        return this;
    }

    nofill() {
        return this.fill("none");
    }

    stroke(paint, width, linecap, linejoin, dasharray, dashoffset, opacity) {
        if (common.E_NAME_SHP.indexOf(this.name) < 0 && "g" != this.name) return this;
        if (common.isDef(paint)) {
            if (paint instanceof DVE) this.attr("stroke", common.getFuncIRI(paint));
            else this.attr("stroke", paint);
        }
        if (common.isDef(width)) this.attr("stroke-width", width);
        if (common.isDef(linecap)) this.attr("stroke-linecap", linecap);
        if (common.isDef(linejoin)) this.attr("stroke-linejoin", linejoin);
        if (common.isDef(dasharray)) this.attr("stroke-dasharray", dasharray);
        if (common.isDef(dashoffset)) this.attr("stroke-dashoffset", dashoffset);
        if (common.isDef(opacity)) this.attr("stroke-opacity", opacity);
        return this;
    }

    strokeWidth(width) {
        if (common.E_NAME_SHP.indexOf(this.name) < 0 && "g" != this.name) return this;
        if (common.isDef(width)) this.attr("stroke-width", width);
        return this;
    }

    strokeLinecap(linecap) {
        if (common.E_NAME_SHP.indexOf(this.name) < 0 && "g" != this.name) return this;
        if (common.isDef(linecap)) this.attr("stroke-linecap", linecap);
        return this;
    }

    strokeLinejoin(linejoin, miterlimit) {
        if (common.E_NAME_SHP.indexOf(this.name) < 0 && "g" != this.name) return this;
        if (common.isDef(linejoin)) this.attr("stroke-linejoin", linejoin);
        if (common.isDef(miterlimit) && miterlimit >= 1.0 && linejoin === "miter") this.attr("stroke-miterlimit", miterlimit);
        return this;
    }

    strokeDash(array, offset) {
        if (common.E_NAME_SHP.indexOf(this.name) < 0 && "g" != this.name) return this;
        if (common.isDef(array)) this.attr("stroke-dasharray", array);
        if (common.isDef(offset)) this.attr("stroke-dashoffset", offset);
        return this;
    }

    strokeOpacity(opacity) {
        if (common.E_NAME_SHP.indexOf(this.name) < 0 && "g" != this.name) return this;
        if (common.isDef(opacity)) this.attr("stroke-opacity", opacity);
        return this;
    }

    xhref(value) {
        if (["a", "image", "marker", "mask", "pattern", "foreignObject", "filter", "script", "style", "switch", "text", "view", "textPath", "use", "animate", "set", "animateMotion", "animateTransform", "mpath"].indexOf(this.name) == -1) return this;
        if (common.isDef(value)) {
            if (value instanceof DVE) this.attr("xlink:href", value.ref());
            else this.attr("xlink:href", value);
        }
        return this;
    }

    target(value) {
        if (["a"].indexOf(this.name) == -1) return this;
        // _repalce, _self, _parent, _top, _blank & XML name
        if (common.isDef(value)) this.attr("target", value);
        return this;
    }

    txt(text, append) {
        if (common.isDef(text)) {
            if (this.name == "tspan") {
                this.element.textContent = append ? this.element.textContent + text : text;
            } else if(["text", "title", "desc", "style", "textPath"].indexOf(this.name) >= 0) {
                let txtNode = document.createTextNode(text);
                if (!append) {
                    while (this.element.lastChild) {
                        if (this.element.lastChild instanceof Node) {
                            this.element.removeChild(this.element.lastChild);
                        }
                    }
                }
                this.element.appendChild(txtNode);
            }
        }
        return this;
    }

    xys(xs, ys) {
        if (["text", "tspan"].indexOf(this.name) == -1) return this;
        if (common.isDef(xs)) this.attr("x", common.convertListOfValueString(xs, ","));
        if (common.isDef(ys)) this.attr("y", common.convertListOfValueString(ys, ","));
        return this;
    }

    tlength(length, adjust) {
        if (["text", "tspan", "textPath"].indexOf(this.name) == -1) return this;
        if (common.isDef(length)) this.attr("textLength", length);
        if (common.isDef(adjust)) this.attr("lengthAdjust", adjust);
        return this;
    }

    dxys(dx, dy) {
        if (["text", "tspan"].indexOf(this.name) == -1) return this;
        if (common.isDef(dx)) this.attr("dx", common.convertListOfValueString(dx, ","));
        if (common.isDef(dy)) this.attr("dy", common.convertListOfValueString(dy, ","));
        return this;
    }

    trotate(angles) {
        if (["text", "tspan"].indexOf(this.name) == -1) return this;
        if (common.isDef(angles)) this.attr("rotate", common.convertListOfValueString(angles, ","));
        return this;
    }

    fsize(size) {
        if (["text", "tspan"].indexOf(this.name) == -1) return this;
        if (common.isDef(size)) this.attr("font-size", size);
        return this;
    }

    tanchor(anchor) {
        if (["text", "tspan"].indexOf(this.name) == -1) return this;
        if (["start", "middle", "end"].indexOf(anchor) >= 0) this.attr("text-anchor", anchor);
        return this;
    }

    startOffset(offset) {
        if (this.name != "textPath") return this;
        if (common.isDef(offset)) this.attr("startOffset", offset);
        return this;
    }

    pathMethod(method) {
        if (this.name != "textPath") return this;
        if (["align", "stretch"].indexOf(method) >= 0) this.attr("method", method);
        return this;
    }

    pathSpacing(spacing) {
        if (this.name != "textPath") return this;
        if (["auto", "exact"].indexOf(spacing) >= 0) this.attr("spacing", spacing);
        return this;
    }

    gradientUnits(unit) {
        if (["linearGradient", "radialGradient"].indexOf(this.name) == -1) return this;
        if (common.isDef(unit) && ["userSpaceOnUse", "objectBoundingBox"].indexOf(unit) >= 0) this.attr("gradientUnits", unit);
        return this;
    }

    spreadMethod(method) {
        if (["linearGradient", "radialGradient"].indexOf(this.name) == -1) return this;
        if (common.isDef(method) && ["pad", "reflect", "repeat"].indexOf(method) >= 0) this.attr("spreadMethod", method);
        return this;
    }

    stopOffset(offset) {
        if ("stop" != this.name) return this;
        if (common.isDef(offset)) this.attr("offset", offset);
        return this;
    }

    stopColor(color) {
        if ("stop" != this.name) return this;
        if (common.isDef(color)) this.attr("stop-color", color);
        return this;
    }

    stopOpacity(opacity) {
        if ("stop" != this.name) return this;
        if (common.isDef(opacity)) this.attr("stop-opacity", opacity);
        return this;
    }

    oco(offset, color, opacity) {
        return this.stopOffset(offset).stopColor(color).stopOpacity(opacity);
    }

    resettrans() {
        this.transformation = [];
        if (["linearGradient", "radialGradient"].indexOf(this.name) >= 0) {
            this.attr("gradientTransform", "");
        } else if (this.name == "pattern") {
            this.attr("patternTransform", "");
        } else {
            this.attr("transform", "");
        }
        return this;
    }

    translate(tx, ty) {
        if (!common.isDef(tx)) return this;
        let tran = common.isDef(ty) ? "translate(" + tx + "," + ty + ")" : "translate(" + tx + ")";
        this.transformation.push(tran);
        if (["linearGradient", "radialGradient"].indexOf(this.name) >= 0) {
            this.attr("gradientTransform", tran, true);
        } else if (this.name == "pattern") {
            this.attr("patternTransform", tran, true);
        } else {
            this.attr("transform", tran, true);
        }
        return this;
    }

    scale(sx, sy) {
        if (common.isDef(sx)) {
            let trans = common.isDef(sy) ? "scale(" + sx + "," + sy + ")" : "scale(" + sx + ")";
            this.transformation.push(trans);
            if (["linearGradient", "radialGradient"].indexOf(this.name) >= 0)
                this.attr("gradientTransform", trans, true);
            else if (this.name == "pattern")
                this.attr("patternTransform", trans, true);
            else
                this.attr("transform", trans, true);
        }
        return this;    
    }

    rotate(angle, cx, cy) {
        if (angle) {
            let trans = common.isDef(cx, cy) ? "rotate(" + angle + "," + cx + "," + cy + ")" : "rotate(" + angle + ")";
            this.transformation.push(trans);
            if (["linearGradient", "radialGradient"].indexOf(this.name) >= 0)
                this.attr("gradientTransform", trans, true);
            else if (this.name == "pattern")
                this.attr("patternTransform", trans, true);
            else
                this.attr("transform", trans, true);
        }
        return this;
    }

    skewx(angle) {
        if (angle) {
            let trans = "skewX(" + angle + ")";
            this.transformation.push(trans);
            if (["linearGradient", "radialGradient"].indexOf(this.name) >= 0)
                this.attr("gradientTransform", trans, true);
            else if (this.name == "pattern")
                this.attr("patternTransform", trans, true);
            else
                this.attr("transform", trans, true);
        }
        return this;
    }

    skewy(angle) {
        if (angle) {
            let trans = "skewY(" + angle + ")";
            this.transformation.push(trans);
            if (["linearGradient", "radialGradient"].indexOf(this.name) >= 0)
                this.attr("gradientTransform", trans, true);
            else if (this.name == "pattern")
                this.attr("patternTransform", trans, true);
            else
                this.attr("transform", trans, true);
        }
        return this;
    }

    matrix(a, b, c, d, e, f) {
        let trans = "matrix(" + a + "," + b + "," + c + "," + d + "," + e + "," + f +")";
        this.transformation.push(trans);
        if (["linearGradient", "radialGradient"].indexOf(this.name) >= 0)
            this.attr("gradientTransform", trans, true);
        else if (this.name == "pattern")
            this.attr("patternTransform", trans, true);
        else
            this.attr("transform", trans, true);
        return this;
    }

    clipPathUnits(value) {
        if (this.name != "clipPath") return this;
        if (common.isDef(value)) this.attr("clipPathUnits", value);
        return this;
    }

    clipPath(pathiri) {
        if (common.E_NAME_CTN.indexOf(this.name) == -1 && common.E_NAME_GRP.indexOf(this.name) == -1 && this.name != "clipPath") return this;
        if (common.isDef(pathiri)) this.attr("clip-path", common.getFuncIRI(pathiri));
        return this;
    }

    clipRule(rule) {
        if (common.E_NAME_GRP.indexOf(this.name) == -1) return this;
        if (common.isDef(rule)) this.attr("clip-rule", rule);
        return this;
    }

    d(value, append) {
        if (this.name != "path") return this;
        if (common.isDef(value)) this.attr("d", value, append === true);
        return this;
    }

    pathLength(length) {
        if (this.name != "path") return this;
        if (common.isDef(length)) this.attr("pathLength", length);
        return this;
    }

    mto(x, y, rel) {
        if (this.name != "path") return this;
        return this.d((rel === true ? "m" : "M") + x + "," + y, true);
    }

    lto(x, y, rel) {
        if (this.name != "path") return this;
        return this.d((rel === true ? "l" : "L") + x + "," + y, true);
    }

    hto(x, rel) {
        if (this.name != "path") return this;
        return this.d((rel === true ? "h" : "H") + x, true);
    }

    vto(y, rel) {
        if (this.name != "path") return this;
        return this.d((rel === true ? "v" : "V") + y, true);
    }

    cto(points, rel) {
        if (this.name != "path") return this;
        if (points instanceof Array) {
            if (points.length == 3) {
                this.d((rel === true ? "c" : "C") + common.convertListOfPointString(points), true);
            } else if (points.length == 2) {
                this.d((rel === true ? "s" : "S") + common.convertListOfPointString(points), true);
            }
        }
        return this;
    }

    csto(curvepoints, rel) {
        if (this.name != "path") return this;
        if (curvepoints instanceof Array) {
            let poly = "", cmd = null;
            for (let i = 0; i < curvepoints.length; i++) {
                if (curvepoints[i].length == 3) {
                    if (cmd == "c" || cmd == "C") {
                        poly += (poly.length > 0) ? " " + common.convertListOfPointString(curvepoints[i]) : common.convertListOfPointString(curvepoints[i]);
                    } else {
                        cmd = (rel === true ? "c" : "C");
                        poly += (poly.length > 0) ? " " + cmd + common.convertListOfPointString(curvepoints[i]) : cmd + common.convertListOfPointString(curvepoints[i]);
                    }
                } else if (curvepoints[i].length == 2) {
                    if (cmd == "s" || cmd == "S") {
                        poly += (poly.length > 0) ? " " + common.convertListOfPointString(curvepoints[i]) : common.convertListOfPointString(curvepoints[i]);
                    } else {
                        cmd = (rel === true ? "s" : "S");
                        poly += (poly.length > 0) ? " " + cmd + common.convertListOfPointString(curvepoints[i]) : cmd + common.convertListOfPointString(curvepoints[i]);
                    }
                }
            }

            this.d(poly, true);
        }
        return this;
    }

    qto(points, rel) {
        if (this.name != "path") return this;
        if (points instanceof Array) {
            if (points.length == 2) {
                this.d((rel === true ? "q" : "Q") + common.convertListOfPointString(points), true);
            } else if (points.length == 1) {
                this.d((rel === true ? "t" : "T") + common.convertListOfPointString(points), true);
            }
        }
        return this;
    }

    qsto(curvepoints, rel) {
        if (this.name != "path") return this;
        if (curvepoints instanceof Array) {
            let poly = "", cmd = null;
            for (let i = 0; i < curvepoints.length; i++) {
                if (curvepoints[i].length == 2) {
                    if (cmd == "q" || cmd == "Q") {
                        poly += (poly.length > 0) ? " " + common.convertListOfPointString(curvepoints[i]) : common.convertListOfPointString(curvepoints[i]);
                    } else {
                        cmd = (rel === true ? "q" : "Q");
                        poly += (poly.length > 0) ? " " + cmd + common.convertListOfPointString(curvepoints[i]) : cmd + common.convertListOfPointString(curvepoints[i]);
                    }
                } else if (curvepoints[i].length == 1) {
                    if (cmd == "t" || cmd == "T") {
                        poly += (poly.length > 0) ? " " + common.convertListOfPointString(curvepoints[i]) : common.convertListOfPointString(curvepoints[i]);
                    } else {
                        cmd = (rel === true ? "t" : "T");
                        poly += (poly.length > 0) ? " " + cmd + common.convertListOfPointString(curvepoints[i]) : cmd + common.convertListOfPointString(curvepoints[i]);
                    }                }
            }

            this.d(poly, true);
        }
        return this;
    }

    arc(rx, ry, xar, laf, swf, x, y, rel) {
        if (this.name != "path") return this;
        return this.d((rel === true ? "a" : "A") + rx + "," + ry + " " + xar + " " + laf + "," + swf + " " + x + "," + y, true);
    }

    arcf(rx, ry, xar) {
        if (this.name != "path") return this;
        if (!common.isDef(ry)) ry = rx;
        this.d("a" + rx + "," + ry + " " + (common.isDef(xar) ? xar : "0") + " 0,1 0," + (ry * 2), true);
        this.d("a" + rx + "," + ry + " " + (common.isDef(xar) ? xar : "0") + " 0,1 0," + -(ry * 2), true);
        return this;
    }

    pz() {
        if (this.name != "path") return this;
        // The 'z' and 'Z' are same commands.
        return this.d("z", true);
    }

    markerPoint(x, y) {
        if (this.name != "marker") return this;
        if (common.isDef(x)) this.attr("refX", x);
        if (common.isDef(y)) this.attr("refY", y);
        return this;
    }

    markerSize(w, h) {
        if (this.name != "marker") return this;
        if (common.isDef(w)) this.attr("markerWidth", w);
        if (common.isDef(h)) this.attr("markerHeight", h);
        return this;
    }

    markerDim(x, y, w, h, orient) {
        return this.markerPoint(x, y).markerSize(w, h).markerOrient(orient);
    }

    markerUnits(unit) {
        if (this.name != "marker") return this;
        if (common.isDef(unit)) this.attr("markerUnits", unit);
        return this;
    }

    markerOrient(orient) {
        if (this.name != "marker") return this;
        if (common.isDef(orient)) this.attr("orient", orient);
        return this;
    }

    mark(marker, pos) {
        if (common.E_NAME_PTH.indexOf(this.name) == -1) return this;
        if (common.isDef(marker)) {
            if (pos == "s") this.attr("marker-start", common.getFuncIRI(marker));
            else if (pos == "m") this.attr("marker-mid", common.getFuncIRI(marker));
            else if (pos == "e") this.attr("marker-end", common.getFuncIRI(marker));
            else if (pos == "a") this.attr("marker", common.getFuncIRI(marker));
        }
        return this;
    }

    patternUnits(unit) {
        if (this.name != "pattern") return this;
        if (common.isDef(unit)) this.attr("patternUnits", unit);
        return this;
    }

    patternContentUnits(unit) {
        if (this.name != "pattern") return this;
        if (common.isDef(unit)) this.attr("patternContentUnits", unit);
        return this;
    }

    visible(torf) {
        if (common.isDef(torf)) this.attr("visibility", torf === true ? "visible" : "hidden");
        return this;
    }

    requiredFeatures(value) {
        if (common.isDef(value)) this.attr("requiredFeatures", common.convertListOfValueString(value));
        return this;
    }

    requiredExtensions(value) {
        if (common.isDef(value)) this.attr("requiredExtensions", common.convertListOfValueString(value));
        return this;
    }

    systemLanguage(value) {
        if (common.isDef(value)) this.attr("systemLanguage", common.convertListOfValueString(value, ", "));
        return this;
    }

    bind(type, listener, useCapture) {
        useCapture = useCapture || false;
        switch (type) {
            case "load": this.element.addEventListener("SVGLoad", listener, useCapture); break;
            case "unload": this.element.addEventListener("SVGUnload", listener, useCapture); break;
            case "abort": this.element.addEventListener("SVGAbort", listener, useCapture); break;
            case "error": this.element.addEventListener("SVGError", listener, useCapture); break;
            case "resize": this.element.addEventListener("SVGResize", listener, useCapture); break;
            case "scroll": this.element.addEventListener("SVGScroll", listener, useCapture); break;
            case "zoom": this.element.addEventListener("SVGZoom", listener, useCapture); break;
            case "focusin": this.element.addEventListener("DOMFocusIn", listener, useCapture); break;
            case "focusout": this.element.addEventListener("DOMFocusOut", listener, useCapture); break;
            case "activate": this.element.addEventListener("DOMActivate", listener, useCapture); break;
            case "click": this.element.addEventListener("click", listener, useCapture); break;
            case "mousedown": this.element.addEventListener("mousedown", listener, useCapture); break;
            case "mouseup": this.element.addEventListener("mouseup", listener, useCapture); break;
            case "mouseover": this.element.addEventListener("mouseover", listener, useCapture); break;
            case "mousemove": this.element.addEventListener("mousemove", listener, useCapture); break;
            case "mouseout": this.element.addEventListener("mouseout", listener, useCapture); break;
        }
        return this;
    }
 
    unbind(type, listener) {
        switch (type) {
            case "load": this.element.removeEventListener("SVGLoad", listener); break;
            case "unload": this.element.removeEventListener("SVGUnload", listener); break;
            case "abort": this.element.removeEventListener("SVGAbort", listener); break;
            case "error": this.element.removeEventListener("SVGError", listener); break;
            case "resize": this.element.removeEventListener("SVGResize", listener); break;
            case "scroll": this.element.removeEventListener("SVGScroll", listener); break;
            case "zoom": this.element.removeEventListener("SVGZoom", listener); break;
            case "focusin": this.element.removeEventListener("DOMFocusIn", listener); break;
            case "focusout": this.element.removeEventListener("DOMFocusOut", listener); break;
            case "activate": this.element.removeEventListener("DOMActivate", listener); break;
            case "click": this.element.removeEventListener("click", listener); break;
            case "mousedown": this.element.removeEventListener("mousedown", listener); break;
            case "mouseup": this.element.removeEventListener("mouseup", listener); break;
            case "mouseover": this.element.removeEventListener("mouseover", listener); break;
            case "mousemove": this.element.removeEventListener("mousemove", listener); break;
            case "mouseout": this.element.removeEventListener("mouseout", listener); break;
        }
        return this;
    }

    toString() {
        return "[object DVE] (" + this.name + ")";
    }

	toWhat(target) {
        var type = "auto";
        if (["animate", "set"].indexOf(this.name) >= 0) {
            if (["x", "y", "width", "height"].indexOf(target) >= 0) type = "XML";
            else if (["fill", "opacity"].indexOf(target) >= 0) type = "CSS";
            this.attr("attributeName", target).attr("attributeType", type);
        } else if (this.name == "animateTransform") {
            if (["translate", "scale", "rotate", "skewX", "skewY"].indexOf(target) == -1) return this;
            this.attr("attributeName", "transform").attr("attributeType", "XML").attr("type", target);
        } else if (this.name == "animateMotion") {
            this.attr("path", target);
        }
        return this;
    }

    keyFrom(value) {
        if (["animate", "animateMotion", "animateTransform"].indexOf(this.name) == -1) return this;
        if (DVC.isDef(value)) this.attr("from", value);
        return this;
    }

    keyTo(value) {
        if (["animate", "set", "animateMotion", "animateTransform"].indexOf(this.name) == -1) return this;
        if (DVC.isDef(value)) this.attr("to", value);
        return this;
    }

    keyBy(value) {
        if (["animate", "animateMotion"].indexOf(this.name) == -1) return this;
        if (DVC.isDef(value)) this.attr("by", value);
        return this;
    }

    fromToBy(from, to, by) {
        return this.keyFrom(from).keyTo(to).keyBy(by);
    }

    calcMode(value) {
        if (["animate", "animateMotion"].indexOf(this.name) == -1) return this;
        if (["discrete", "linear", "paced", "spline"].indexOf(value) == -1) return this;
        this.attr("calcMode", value);
        return this;
    }

    keyValues(values) {
        if (["animate", "animateMotion"].indexOf(this.name) == -1) return this;
        if (!DVC.isDef(values)) return this;
        this.attr("values", Array.isArray(values) ? values.join(";") : values);
        return this;
    }

    keyTimes(times) {
        if (["animate", "animateMotion"].indexOf(this.name) == -1) return this;
        if (!DVC.isDef(times)) return this;
        return this.attr("keyTimes", Array.isArray(times) ? times.join(";") : times);
    }

    keySplines(splines) {
        if (["animate", "animateMotion"].indexOf(this.name) == -1) return this;
        if (!DVC.isDef(splines)) return this;
        return this.attr("keySplines", Array.isArray(splines) ? splines.join(" ") : splines);
    }

    keyPoints(points) {
        if (["animateMotion"].indexOf(this.name) == -1) return this;
        if (DVC.isDef(points)) this.attr("keyPoints", Array.isArray(points) ? points.join(";") : points);
        return this;
    }

    var easings = { 
        "inSine":       [0.47, 0, 0.745, 0.715],
        "outSine":      [0.39, 0.575, 0.565, 1],
        "inOutSine":    [0.445, 0.05, 0.55, 0.95],
        "inQuad":       [0.55, 0.085, 0.68, 0.53],
        "outQuad":      [0.25, 0.46, 0.45, 0.94],
        "inOutQuad":    [0.455, 0.03, 0.515, 0.955],
        "inCubic":      [0.55, 0.055, 0.675, 0.19],
        "outCubic":     [0.215, 0.61, 0.355, 1],
        "inOutCubic":   [0.645, 0.045, 0.355, 1],
        "inQuart":      [0.895, 0.03, 0.685, 0.22],
        "outQuart":     [0.165, 0.84, 0.44, 1],
        "inOutQuart":   [0.77, 0, 0.175, 1],
        "inQuint":      [0.755, 0.05, 0.855, 0.06],
        "outQuint":     [0.23, 1, 0.32, 1],
        "inOutQuint":   [0.86, 0, 0.07, 1],
        "inExpo":       [0.95, 0.05, 0.796, 0.035],
        "outExpo":      [0.19, 1, 0.22, 1],
        "inOutExpo":    [1, 0, 0, 1],
        "inCirc":       [0.6, 0.04, 0.98, 0.335],
        "outCirc":      [0.075, 0.82, 0.165, 1],
        "inOutCirc":    [0.785, 0.135, 0.15, 0.86],
        "inBack":       [0.6, -0.28, 0.735, 0.045],
        "outBack":      [0.175, 0.885, 0.32, 1.275],
        "inOutBack":    [0.68, -0.55, 0.265, 1.55]
    }

    ease(funcName) {
        if (["animate", "animateMotion"].indexOf(this.name) == -1) return this;
        if (typeof easings[funcName] == "undefined") return this;
        return this.calcMode("spline").keyTimes("0;1").keySplines(easings[funcName]);
    }

    timeBegin(value) {
        if (["animate", "set", "animateMotion", "animateTransform"].indexOf(this.name) == -1) return this;
        if (DVC.isDef(value)) this.attr("begin", value);
        return this;
    }

    timeDur(value) {
        if (["animate", "set", "animateMotion", "animateTransform"].indexOf(this.name) == -1) return this;
        if (DVC.isDef(value)) this.attr("dur", value);
        return this;
    }

    timeEnd(value) {
        if (["animate", "set", "animateMotion", "animateTransform"].indexOf(this.name) == -1) return this;
        if (DVC.isDef(value)) this.attr("end", value);
        return this;
    }

    time(begin, dur, end) {
        return this.timeBegin(begin).timeDur(dur).timeEnd(end);
    }

    timeMin(value) {

    restart(value) {
        if (["animate", "set", "animateMotion", "animateTransform"].indexOf(this.name) == -1) return this;
        if (["always", "whenNotActive", "never"].indexOf(value) == -1) return this;
        this.attr("restart", value);
        return this;
    }

    repeatCount(value) {
        if (["animate", "set", "animateMotion"].indexOf(this.name) == -1) return this;
        if (DVC.isDef(value)) this.attr("repeatCount", value);
        return this;
    }

    repeatDur(value) {
        if (["animate", "set", "animateMotion"].indexOf(this.name) == -1) return this;
        if (DVC.isDef(value)) this.attr("repeatDur", value);
        return this;
    }

    freeze() {
        if (["animate", "set", "animateMotion", "animateTransform"].indexOf(this.name) == -1) return this;
        return this.attr("fill", "freeze");
    }


    add(value) {
        if (["animate", "set", "animateMotion", "animateTransform"].indexOf(this.name) == -1) return this;
        if (["replace", "sum"].indexOf(value) == -1) return this;
        return this.attr("additive", value);
    }

    acc(value) {
        if (["animate", "set", "animateMotion", "animateTransform"].indexOf(this.name) == -1) return this;
        if (["none", "sum"].indexOf(value) == -1) return this;
        return this.attr("accumulate", value);
    }

    motionRotate(value) {
        if (["animateMotion"].indexOf(this.name) == -1) return this;
        if (DVC.isDef(value)) this.attr("rotate", value);
        return this;
    }

    motionPath(value) {
        if (["animateMotion"].indexOf(this.name) == -1) return this;
        if (DVC.isDef(value)) this.attr("path", value);
        return this;
    }

} //:~ class DVE
