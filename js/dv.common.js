/*
 * Copyright 2018 Jeonghun Bu
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const VERSION = "1.2.0";
export const NS_SVG = "http://www.w3.org/2000/svg";
export const NS_XLNK = "http://www.w3.org/1999/xlink";
export const E_NAME_ANI = ["animate", "animateColor", "animateMotion", "animateTransform", "mpath", "set"];
export const E_NAME_SHP = ["circle", "ellipse", "line", "path", "polygon", "polyline", "rect"];
export const E_NAME_TXT = ["altGlyph", "altGlyphDef", "altGlyphItem", "glyph", "glyphRef", "textPath", "text", "tref", "tspan"];
export const E_NAME_PTH = ["line", "path", "polyline", "polygon"];
export const E_NAME_CTN = ["a", "defs", "glyph", "g", "marker", "mask", "missing-glyph", "pattern", "svg", "switch", "symbol"];
export const E_NAME_GRP = ["circle",  "ellipse", "image", "line", "path", "polygon", "polyline", "rect", "text", "use"];
export const FIXED_EASINGS = { 
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
    };

/* Polyfill */
if (!Array.isArray) {
	Array.isArray = function (arg) {
		return Object.prototype.toString.call(arg) === "[object Array]";
	};
}

/* Utility functions */

export function isXLink(source) { return (source && source.length > 6 && source.substring(0, 6) == "xlink:"); }

export function isDef(...p) {
	if (p.length == 0) return false;
	for (let i = 0; i < p.length; i++) {
		if (typeof p[i] == "undefined") return false;
	}
	return true;
}

export function refineId(id, use) {
	let sharp = (id && id.indexOf("#") == 0);
	if (sharp && use) return id;
	else if (sharp && !use) return id.substring(1);
	else if (!sharp && use) return `#${id}`;
	else return id;
}

/**
 * src 객체의 속성을 dst 객체에 복사합니다. 
 */
export function cpp(dst, src, name) {
	if (dst && src && name) {
		dst[name] = src[name];
	}
}

export function trim(str) {
	return str ? str.replace(/(^\s*)|(\s*$)/gi, "") : "";
}


/**
 * Converts the points parameter to a string as <list-of-points> type.
 * @param {<list-of-points>|Array} value The points
 * @return The converted string as <list-of-points> type.
 */
export function convertListOfPointString(value) {
	if (isDef(value)) {
		if (typeof(value) === "string") 
			return value;
		else if (Array.isArray(value)) 
			return value.map(function (v, i, a) { return (Array.isArray(v) && v.length == 2) ? v.join(",") : ""; }).join(" ");
	}
	return undefined;
}

export function convertListOfValueString(value, delimeter) {
	if (isDef(value)) {
		if (typeof(value) === "string") return value;
		return Array.isArray(value) ? value.join(delimeter || " ") : value;
	}
	return undefined;
}

/**
 * Gets a computed size object of the specified target element.
 * @param {object} target the SVG element.
 * @return The computed size object.
 */
export function getElementSize(target) {
	if (target instanceof DVE) target = target.element;
	let s = getComputedStyle(target), size = { w: 0, h: 0 };
	if (s) {
		if (s.width == "auto" || s.height == "auto") {
			let box = target.getBBox();
			size.w = box.width;
			size.h = box.height;
		} else {
			size.w = parseFloat(s.width) - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
			size.h = parseFloat(s.height) - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom);
		}
	} else {
		console.log("[DV] It won't get a computed style from " + target);
	}
	return size;
}

/**
 * 가변 레이아웃을 정의하는 문자열을 파싱하여 키=값 객체로 반환합니다.
 * @param {string} layoutString 레이아웃 문자열
 * @return 키=값 객체
 */
export function parseLayout(layoutString) {
	let layout = {};
	if (!layoutString) return layout;
	let tokens = layoutString.split(/\s*;\s*/);
	for (let i = 0, len = tokens.length; i < len; i++) {
		let kv = tokens[i].split(/\s*:\s*/);
		if (kv.length == 2) layout[trim(kv[0])] = DVC.trim(kv[1]);
	}
	return layout;
}

/**
 * 주어진 수식을 계산한 값을 반환합니다.
 * @param {string} expr 수식 ex) 100%-25px
 * @param {number} p 100%의 기준이 되는 값
 * @param {object} g 키=값 형식의 콜렉션 객체로써 수식 내부에 있는 변수의 값을 가지고 있다.
 * @return 수식을 계산한 값을 반환한다. 수식을 인식 못하는 경우 수식을 그대로 반환한다.
 */
export function computeExpr(expr, p, g) {
	let tokens = expr.toString().split(/([\+\-]+)/g);
	if (tokens.length == 0) return expr;
	let op = "+", num = 0, n = 0;
	for (let i = 0, len = tokens.length, c = ""; i < len; i++) {
		c = tokens[i];
		if (c == "+") {
			op = "+";
			continue;
		} else if (c == "-") {
			op = "-";
			continue;
		} else if (c.charAt(c.length - 1) == "%") {
			n = (p * parseFloat(c) / 100);
		} else if (c.charAt(0) == "{" && c.chartAt(c.length - 1) == "}") {
			n = g[c.substring(1, c.length - 1)];
		} else {
			n = parseFloat(c);
		}

		switch (op) {
			case "+": num += n; break;
			case "-": num -= n; break;
		}
	}

	return num;
}

/**
 * 주어진 수식을 계산한 값을 반환합니다.
 * DVC.computeExpr과 달리 한 번 계산했던 속성식은 함수로캐싱되어 사용됩니다.
 * @param {object} dve 캐싱함수를 가져야 할 대상
 * @param {string} name 캐싱 함수 이름
 * @param {string} expr 수식 ex) 100%-25px
 * @param {number} p 100%의 기준이 되는 값
 * @param {object} g 키=값 형식의 콜렉션 객체로써 수식 내부에 있는 변수의 값을 가지고 있다.
 * @return 수식을 계산한 값을 반환한다. 수식을 인식 못하는 경우 수식을 그대로 반환한다.
 */
export function computeExprWithCacheFunc(dve, name, expr, p, g) {
	if (dve.calculateExpression && dve.calculateExpression[name]) {
		let uce = dve.disableCacheExpression;
		if (!uce || uce != "disabled") {
			//console.log(dve.calculateExpression[name].toString() + " => " + dve.calculateExpression[name](p, g));
			return dve.calculateExpression[name](p, g);
		}
	}

	let tokens = expr.toString().split(/([\+\-]+)/g);
	
	if (tokens.length == 0) return expr;
	
	let strExpression = "", op = "+", num = 0, n = 0;
	for (let i = 0, len = tokens.length, c = ""; i < len; i++) {
		c = tokens[i];
		if (c == "+") {
			op = "+";
			strExpression += "+";
			continue;
		} else if (c == "-") {
			op = "-";
			strExpression += "-";
			continue;
		} else if (c.charAt(c.length - 1) == "%") {
			n = (p * parseFloat(c) / 100);
			strExpression += "(p*" + parseFloat(c) + "/100)";
		} else if (c.charAt(0) == "{" && c.charAt(c.length - 1) == "}") {
			n = g[c.substring(1, c.length - 1)];
			strExpression += "g['" + c.substring(1, c.length - 1) + "']";
		} else {
			n = parseFloat(c);
			strExpression += parseFloat(c).toString();
		}

		switch (op) {
			case "+": num += n; break;
			case "-": num -= n; break;
		}

		if (!dve.calculateExpression) dve.calculateExpression = {};
		dve.calculateExpression[name] = new Function("p", "g", "return " + strExpression +";");
	}

	return num;
}

export function relayout(dve, w, h, dic) {
	if (dve.name != "g") {
		let str = dve.autoLayout, v = 0;
		if (str) {
			let layouts = DVC.parseLayout(str);
			for (let n in layouts) {
				v = DVC.computeExprWithCacheFunc(dve, n, layouts[n], (["x", "x1", "x2", "cx", "dx", "width"].indexOf(n) >= 0 ? w : h), dic);
				if ((n == "width" || n == "height") && v < 0) v = 0;
				if (n == "width") w = v;
				else if (n == "height") h = v;
				dve.attr(n, v);
			}
		}

		w = (dve.element.width && DVC.isDef(dve.element.width.baseVal)) ? dve.element.width.baseVal.value : w;
		h = (dve.element.height && DVC.isDef(dve.element.height.baseVal)) ? dve.element.height.baseVal.value : h;
	}

	for (let i = 0, len = dve.children.length, child = null; i < len; i++) {
		child = dve.children[i];
		if (child.element.nodeType === 1) {
			DVC.relayout(child, w, h, dic);
		}
	}
}


