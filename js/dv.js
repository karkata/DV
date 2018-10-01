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

/* Drawing Vector Object */
import * as common from "dv.common.js";
import * as DVE from "dv.dve.js";

class DV {
	static mk(name, props) {
		let em = new DVE(document.createElementNS(DVC.NS_SVG, name));
		if (props) {
			for (let pname in props) {
				em.attr(pname, props[pname]);
			}
		}
		return em;
	}

	static getFuncIRI(value) {
		if (!isDef(value)) throw new Error("[DV] value paramter is undefined.");
		if (value instanceof DVE) value = value.id();
		if (value.indexOf("url(#") == 0) return value;
		else return "url(${refineId(value, true)})";
	}

    static svg(props) {
        // version, width, height, x, y, viewBox, preserveAspectRatio, zoomAndPan
        return mk("svg", props);
    }

    static g(props) {
        return mk("g", props);
    }

    static switchblock(props) {
        return mk("switch", props);
    }

    static styleblock(css) {
        return mk("style", { "type": "text/css" }).txt(css || "");
    }

    static defs(props) {
        return mk("defs", props);
    }

    static symbol(props) {
        return mk("symbol", props);
    }

    static use(props) {
        // x, y, width, height, xlink:href
        return mk("use", props);
    }

    static link(props) {
        // xlink:href, target
        return mk("a", props);
    }

    static rect(props) {
        // x, y, width, height, rx, ry
        return mk("rect", props);
    }

    static circle(props) {
        // cx, cy, r
        return mk("circle", props);
    }

    static ellipse(props) {
        // cx, cy, rx, ry
        return mk("ellipse", props);
    }

    static line(props) {
        // x1, y1, x2, y2
        return mk("line", props);
    }

    static polygon(props) {
        // points
        return mk("polygon", props);
    }

    static polyline(props) {
        // points
        return mk("polyline", props);
    }

    static image(props) {
        // x, y, width, height, xlink:href, preserveAspectRatio
        return mk("image", props);
    }

    static text(props) {
        // x, y, dx, dy, rotate, textLength, lengthAdjust
        return mk("text", props);
    }

    static tspan(props) {
        // x, y, dx, dy, rotate, textLength, lengthAdjust
        return mk("tspan", props);
    }

    static textPath(props) {
        // xlink:href, startOffset, method, spacing
        return mk("textPath", props);
    }

    static gradl(props) {
        // x1, y1, x2, y2, gradientUnits, spreadMethod
        return mk("linearGradient", props);
    }

    static gradr(props) {
        // cx, cy, r, fx, fy, gradientUnits, spreadMethod
        return mk("radialGradient", props);
    }

    static stop(props) {
        // offset, stop-color, stop-opacity
        return mk("stop", props);
    }

    static title(props) {
        return mk("title", props);
    }

    static desc(props) {
        return mk("desc", props);
    }

    static clipper(props) {
        // clipPathUnits
        return mk("clipPath", props);
    }

    static path(props) {
        // d, pathLength
        return mk("path", props);
    }

    static marker(props) {
        // refX, refY, markerWidth, markerHeight, orient, markerUnits
        return mk("marker", props);
    }

    static pattern(props) {
        // x, y, width, height, patternUnits, patternContentUnits, patternTransform
        return mk("pattern", props);
    }

	static animate(props) {
        return DVC.mk("animate", props);
    }

    static set(props) {
        return DVC.mk("set", props);
    }

    static animateMotion(props) {
        return DVC.mk("animateMotion", props);
    }

    static animateTransform(props) {
        return DVC.mk("animateTransform", props);
    }

    static mpath(props) {
        // xlink:href
        return DVC.mk("mpath", props);
    }

} // :~ class DV 
