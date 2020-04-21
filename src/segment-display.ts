/*
Based on:

Copyright (c) 2020 by thomas (https://codepen.io/thmsdnnr/pen/JMWPOM)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { ASCII_SEGMENTS, DISPLAY_STYLE } from "./const";

export class SegmentDisplay extends HTMLElement {
    private container: HTMLElement;
    private size = 4;
    private separator_pos = -1;
    private shadow_root: ShadowRoot;

    constructor() {
        super();

        this.shadow_root = this.attachShadow({ mode: "closed" });

        this.container = document.createElement("div");
        this.container.className = "container";

        const style = document.createElement("style");

        style.textContent = DISPLAY_STYLE;

        this.shadow_root.appendChild(style);
        this.shadow_root.appendChild(this.container);

        const size_attr = this.attributes.getNamedItem("size");
        if (size_attr) {
            const size = parseInt(size_attr.value);
            if (!isNaN(size) && size < 99) {
                this.size = size;
            }
        }

        const separator_attr = this.attributes.getNamedItem("separator");
        if (separator_attr) {
            const separator = parseInt(separator_attr.value);
            if (!isNaN(separator) && separator >= 0 && separator < this.size) {
                this.separator_pos = separator;
            }
        }

        this.createDisplay();

        const demo_attr = this.attributes.getNamedItem("demo");
        if (demo_attr) {
            this.demo();
        }

        const value_attr = this.attributes.getNamedItem("value");
        if (value_attr) {
            this.setContent(value_attr.value);
        }
    }

    static get observedAttributes(): string[] {
        return ["value", "size", "separator"];
    }

    public attributeChangedCallback(name: string, _old_value: string, new_value: string): void {
        if (name == "value") {
            this.setContent(new_value);
        } else if (name == "size") {
            const size = parseInt(new_value);
            if (!isNaN(size) && size < 99) {
                this.size = size;
            }
            this.createDisplay();
        } else if (name == "separator") {
            const separator = parseInt(new_value);
            if (!isNaN(separator) && separator >= 0 && separator < this.size) {
                this.separator_pos = separator;
            }
            this.createDisplay();
        }
    }

    private createDisplay(): void {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        for (let i = 0; i < this.size; i++) {
            if (this.separator_pos == i) {
                this.container.appendChild(this.createSeparator());
            }
            this.container.appendChild(this.createDigit(i));
        }
    }

    private createSeparator(): HTMLElement {
        const sep_d = "M8 49l5-5-5-5-5 5zM8 25l5-5-5-5-5 5z";
        const container = document.createElement("div");
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        container.setAttribute("id", "separator");
        path.setAttribute("d", sep_d);
        path.setAttribute("class", "enabled");
        g.appendChild(path);

        svg.setAttribute("viewBox", "0 0 16 64");
        svg.setAttributeNS(
            "http://www.w3.org/2000/xmlns/",
            "xmlns:xlink",
            "http://www.w3.org/1999/xlink"
        );
        svg.appendChild(g);

        container.appendChild(svg);

        return container;
    }

    private createDigit(id: number): HTMLElement {
        const path_d = [
            "M16 33.9H3.9l-1.9-1L.2 32l.2-.1 1.8-1 1.7-.8H28l1.9 1 1.8 1-1.9.9-1.9 1z", // mid
            "M0 16V1.2L2 3l1.9 2V29l-2 1-1.8.9z", // top-left
            "M0 48L.2 33l2 1 1.8 1v24l-2 1.8-1.8 2z", // bottom-left
            "M1.5 62.6l1.9-2 .6-.5h24l1.4 1.4 1.9 1.9.5.5H.2z", // bottom
            "M30 60.9l-2-2V35l2-.9 2-1V62.9z", // bottom-right
            "M30 30l-2-1V5l2-1.9 2-2V31l-2-1z", // top-right
            "M2.1 2L.2 0h31.6l-1.9 2L28 4H4z" // top
        ];
        const digit = document.createElement("div");
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

        for (let i = 0; i <= 6; i++) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("id", "d_" + id + "_" + i);
            path.setAttribute("d", path_d[i]);
            path.setAttribute("class", "segment");
            g.appendChild(path);
        }

        svg.setAttribute("viewBox", "0 0 32 64");
        svg.setAttributeNS(
            "http://www.w3.org/2000/xmlns/",
            "xmlns:xlink",
            "http://www.w3.org/1999/xlink"
        );
        svg.appendChild(g);

        digit.classList.add("digit");
        digit.appendChild(svg);

        return digit;
    }

    private setDigit(idx: number, symbol: string): void {
        if (!Object.keys(ASCII_SEGMENTS).includes(symbol)) {
            this.displayError();
            debugger;
            return;
        }
        if (ASCII_SEGMENTS[symbol] != null) {
            for (let segment_num = 0; segment_num <= 6; segment_num++) {
                const key = "d_" + idx + "_" + segment_num;
                const segment = this.container.querySelector(`path#${key}`);
                ASCII_SEGMENTS[symbol].includes(segment_num)
                    ? segment?.classList.toggle("enabled", true)
                    : segment?.classList.toggle("enabled", false);
            }
        }
    }

    private resetDigit(idx: number): void {
        for (let segment_num = 0; segment_num <= 6; segment_num++) {
            const key = "d_" + idx + "_" + segment_num;
            const segment = this.container.querySelector(`path#${key}`);
            segment?.classList.toggle("enabled", false);
        }
    }

    private resetDisplay(): void {
        for (let i = 0; i < this.size; i++) {
            this.resetDigit(i);
        }
    }

    private displayError(): void {
        this.resetDisplay();
        if (this.size >= 3) {
            this.setContent("Err");
        } else {
            this.setDigit(Math.max(this.size - 1, 0), "E");
        }
    }

    private setContent(value: string): void {
        const chars = String(value).split("");
        const counter_size = this.size;
        if (chars.length > counter_size) {
            this.displayError();
            return;
        }
        const difference = counter_size - chars.length;
        for (let i = 0; i < difference; i++) {
            this.resetDigit(i);
        }
        for (let i = difference; i < counter_size; i++) {
            this.setDigit(i, chars[i - difference]);
        }
    }

    private demo(): void {
        let cur_idx = 0;
        const keys = Object.keys(ASCII_SEGMENTS);
        const interval_id = setInterval(() => {
            this.setDigit(0, keys[cur_idx]);
            cur_idx++;
            if (cur_idx >= keys.length) {
                clearInterval(interval_id);
                this.resetDigit(0);
                cur_idx = 0;
            }
        }, 1000);
    }
}

try {
    customElements.define("dl-segment-display", SegmentDisplay);
} catch (e) {
    console.log("dl-segment-display already defined");
}
