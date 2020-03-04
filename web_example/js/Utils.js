export default class Utils {
	constructor() {}
	static PI = Math.PI;
	static TWO_PI = Math.PI * 2;
	static HALF_PI = Math.PI / 2;
	static map(x, in_min, in_max, out_min, out_max) {
		return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
	}
}
