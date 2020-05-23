/*!
 * Based on https://github.com/jshttp/accepts/blob/master/index.js
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * Copyright(c) 2020 Henry Zhuang
 * MIT Licensed
 */

import { Negotiator, lookup } from "./deps.ts";

/**
 * Create a new Accepts object for the given headers.
 *
 * @param {Headers} headers
 * @public
 */
export class Accepts {
  private headers: Headers;
  private negotiator: Negotiator;

  constructor(headers: Headers) {
    this.headers = headers;
    this.negotiator = new Negotiator(headers);
  }

  /**
   * Check if the given `type(s)` is acceptable, returning
   * the best match when true, otherwise `undefined`, in which
   * case you should respond with 406 "Not Acceptable".
   *
   * The `type` value may be a single mime type string
   * such as "application/json", the extension name
   * such as "json" or an array `["json", "html", "text/plain"]`. When a list
   * or array is given the _best_ match, if any is returned.
   *
   * Examples:
   *
   *     // Accept: text/html
   *     this.types(['html']);
   *     // => ["html"]
   *
   *     // Accept: text/*, application/json
   *     this.types(['html']);
   *     // => ["html"]
   *     this.types(['text/html']);
   *     // => ["text/html"]
   *     this.types(['json', 'text']);
   *     // => ["json"]
   *     this.types(['application/json']);
   *     // => ["application/json"]
   *
   *     // Accept: text/*, application/json
   *     this.types(['image/png']);
   *     this.types(['png']);
   *     // => []
   *
   *     // Accept: text/*;q=.5, application/json
   *     this.types(['html', 'json']);
   *     // => ["json"]
   *
   * @param {string[]} types...
   * @return {string[]}
   * @public
   */
  types(types?: string[]): string[] {
    // no types, return all requested types
    if (!types || types.length === 0) {
      return this.negotiator.mediaTypes();
    }

    // no accept header, return first given type
    if (!this.headers.get("accept")) {
      return [types[0]];
    }

    const mimes = types
      .map(extToMime);
    const accepts = this.negotiator.mediaTypes(
      (mimes.filter((t) => t && validMime(t))) as string[],
    );
    const first = accepts[0];
    return first ? [types[mimes.indexOf(first)]] : [];
  }

  /**
   * Return accepted encodings or best fit based on `encodings`.
   *
   * Given `Accept-Encoding: gzip, deflate`
   * an array sorted by quality is returned:
   *
   *     ['gzip', 'deflate']
   *
   * @param {string[]} encodings...
   * @return {string[]}
   * @public
   */
  encodings(encodings?: string[]): string[] {
    // no encodings, return all requested encodings
    if (!encodings || encodings.length === 0) {
      return this.negotiator.encodings();
    }
    const c = this.negotiator.encodings(encodings)[0];
    return c ? [c] : [];
  }

  /**
   * Return accepted charsets or best fit based on `charsets`.
   *
   * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
   * an array sorted by quality is returned:
   *
   *     ['utf-8', 'utf-7', 'iso-8859-1']
   *
   * @param {string[]} charsets...
   * @return {string[]}
   * @public
   */
  charsets(charsets?: string[]): string[] {
    // no charsets, return all requested charsets
    if (!charsets || charsets.length === 0) {
      return this.negotiator.charsets();
    }
    const c = this.negotiator.charsets(charsets)[0];
    return c ? [c] : [];
  }

  /**
   * Return accepted languages or best fit based on `langs`.
   *
   * Given `Accept-Language: en;q=0.8, es, pt`
   * an array sorted by quality is returned:
   *
   *     ['es', 'pt', 'en']
   *
   * @param {string[]} langs...
   * @return {string[]}
   * @public
   */
  languages(languages?: string[]): string[] {
    // no languages, return all requested languages
    if (!languages || languages.length === 0) {
      return this.negotiator.languages();
    }

    const c = this.negotiator.languages(languages)[0];
    return c ? [c] : [];
  }
}

/**
 * Convert extnames to mime.
 *
 * @param {String} type
 * @return {String|undefined}
 * @private
 */

function extToMime(type: string): string | undefined {
  return type.indexOf("/") === -1 ? lookup(type) : type;
}

/**
 * Check if mime is valid.
 *
 * @param {String} type
 * @return {String}
 * @private
 */

function validMime(type?: string): boolean {
  return typeof type === "string";
}
