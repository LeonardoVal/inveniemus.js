/** # Utilities

Miscelaneous utility functions and definitions.
*/

var clamp = utilities.clamp = function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
};

/** A good string representation for element values for logging and debugging can be very useful.
The Han encoding uses characters for eastern asian scripts in the Unicode standard. The CJK
(Chinese-Japanese-Korean) unification provides a continuous block of 21035 printable characters,
starting at 0x4DC0 (Y-Ching hexagrams). The Hangul syllables provide another continuous block of
11172 printable characters.

The encoding is meant to be human-readable. These characters are also supported by most fonts used
in shells and browsers. Picking up the actual values is difficult, but it is easy to tell if
elements (or particular values) are equal or not. Also it is possible to quickly copy a paste the
text representation.

This encoding is not meant to be efficient. Using UTF-8 all characters beyond 0x7FF require 3 bytes.
If storage or bandwidth are of concern, base64 would probably work better.
*/
utilities.emblemHan = function emblemHan(element) {
	var evaluation = !element.evaluation ? '?' : element.evaluation.map(function (e) {
			return isNaN(e) ? '?' : Math.round(+e * 1e6) / 1e6;
		}).join(',');
	return '[Element '+ evaluation +' '+ encodeHan(element.values()) +']';
};

(function () {
	var	BEGIN_CJK = 0x4DC0,
		END_CJK = 0x9FD0,
	 	COUNT_CJK = END_CJK - BEGIN_CJK + 1,
		BEGIN_HANGUL = 0xAC00,
		END_HANGUL = 0xD7A3,
		COUNT_HANGUL = END_HANGUL - BEGIN_HANGUL + 1;
	utilities.encodeHan = function encodeHan(values) {
		return values.map(function (v) {
			v = v |0;
			raiseIf(v > COUNT_CJK,
				"Values like ", v, " > ", COUNT_CJK, " cannot be encoded!");
			raiseIf(v < -COUNT_HANGUL,
				"Values like ", v, " < ", -COUNT_HANGUL, " cannot be encoded!");
			return String.fromCharCode(v + (v >= 0 ? BEGIN_CJK : END_HANGUL + 1));
		}).join('');
	};
	utilities.decodeHan = function decodeHan(string) {
		return string.split('').map(function (chr) {
			var v = chr.charCodeAt(0);
			if (v >= BEGIN_CJK && v <= END_CJK) {
				return v - BEGIN_CJK;
			} else if (v >= BEGIN_HANGUL && v <= END_HANGUL) {
				return v - END_HANGUL - 1;
			} else {
				raise("Cannot decode character '"+ chr +"'!");
			}
		});
	};
})();

var encodeHan = utilities.encodeHan;
