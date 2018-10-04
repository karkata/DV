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
import * as common from "./dv.common.js";
import { DVE } from "./dv.dve.js";

export function echo(v) {
	console.log(v);
}

export class DV {
	static mk(name, props) {
		let em = new DVE(document.createElementNS(common.NS_SVG, name));
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
        return DV.mk("svg", props);
    }

    static g(props) {
        return DV.mk("g", props);
    }

    static switchblock(props) {
        return DV.mk("switch", props);
    }

    static styleblock(css) {
        return DV.mk("style", { "type": "text/css" }).txt(css || "");
    }

    static defs(props) {
        return DV.mk("defs", props);
    }

    static symbol(props) {
        return DV.mk("symbol", props);
    }

    static use(props) {
        // x, y, width, height, xlink:href
        return DV.mk("use", props);
    }

    static link(props) {
        // xlink:href, target
        return DV.mk("a", props);
    }

    static rect(props) {
        // x, y, width, height, rx, ry
        return DV.mk("rect", props);
    }

    static circle(props) {
        // cx, cy, r
        return DV.mk("circle", props);
    }

    static ellipse(props) {
        // cx, cy, rx, ry
        return DV.mk("ellipse", props);
    }

    static line(props) {
        // x1, y1, x2, y2
        return DV.mk("line", props);
    }

    static polygon(props) {
        // points
        return DV.mk("polygon", props);
    }

    static polyline(props) {
        // points
        return DV.mk("polyline", props);
    }

    static image(props) {
        // x, y, width, height, xlink:href, preserveAspectRatio
        return DV.mk("image", props);
    }

    static text(props) {
        // x, y, dx, dy, rotate, textLength, lengthAdjust
        return DV.mk("text", props);
    }

    static tspan(props) {
        // x, y, dx, dy, rotate, textLength, lengthAdjust
        return DV.mk("tspan", props);
    }

    static textPath(props) {
        // xlink:href, startOffset, method, spacing
        return DV.mk("textPath", props);
    }

    static gradl(props) {
        // x1, y1, x2, y2, gradientUnits, spreadMethod
        return DV.mk("linearGradient", props);
    }

    static gradr(props) {
        // cx, cy, r, fx, fy, gradientUnits, spreadMethod
        return DV.mk("radialGradient", props);
    }

    static stop(props) {
        // offset, stop-color, stop-opacity
        return DV.mk("stop", props);
    }

    static title(props) {
        return DV.mk("title", props);
    }

    static desc(props) {
        return DV.mk("desc", props);
    }

    static clipper(props) {
        // clipPathUnits
        return DV.mk("clipPath", props);
    }

    static path(props) {
        // d, pathLength
        return DV.mk("path", props);
    }

    static marker(props) {
        // refX, refY, markerWidth, markerHeight, orient, markerUnits
        return DV.mk("marker", props);
    }

    static pattern(props) {
        // x, y, width, height, patternUnits, patternContentUnits, patternTransform
        return DV.mk("pattern", props);
    }

	static animate(props) {
        return DV.mk("animate", props);
    }

    static set(props) {
        return DV.mk("set", props);
    }

    static animateMotion(props) {
        return DV.mk("animateMotion", props);
    }

    static animateTransform(props) {
        return DV.mk("animateTransform", props);
    }

    static mpath(props) {
        // xlink:href
        return DV.mk("mpath", props);
    }

} // :~ class DV 

