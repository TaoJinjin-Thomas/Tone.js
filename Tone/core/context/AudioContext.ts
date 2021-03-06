import {
	AudioContext as stdAudioContext,
	AudioWorkletNode as stdAudioWorkletNode,
	OfflineAudioContext as stdOfflineAudioContext,
	TContext,
} from "standardized-audio-context";
import { assert } from "../util/Debug";
import { isDefined } from "../util/TypeCheck";
/**
 * Create a new AudioContext
 */
export function createAudioContext(options?: AudioContextOptions): AudioContext {
	return new stdAudioContext(options) as unknown as AudioContext;
}

/**
 * Create a new OfflineAudioContext
 */
let stdOfflineCtxSupport = true;
if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
	stdOfflineCtxSupport = false;
}

export function createOfflineAudioContext(channels: number, length: number, sampleRate: number): OfflineAudioContext {
	let offlineContext:OfflineAudioContext;
	if (stdOfflineCtxSupport) {
		try {
			offlineContext = new stdOfflineAudioContext(channels, length, sampleRate) as unknown as OfflineAudioContext;
			// console.log('create stdOfflineAudioContext');
		} catch(e) {
			stdOfflineCtxSupport = false;
			console.warn('create stdOfflineAudioContext failed', e);
			console.warn('will use native OfflineAudioContext');
			offlineContext = new OfflineAudioContext(channels, length, sampleRate);
		}
	} else {
		// console.log('create original OfflineAudioContext');
		offlineContext = new OfflineAudioContext(channels, length, sampleRate);
	}
	return (offlineContext as OfflineAudioContext);
}

/**
 * Either the online or offline audio context
 */
export type AnyAudioContext = AudioContext | OfflineAudioContext;

/**
 * Interface for things that Tone.js adds to the window
 */
interface ToneWindow extends Window {
	TONE_SILENCE_LOGGING?: boolean;
	TONE_DEBUG_CLASS?: string;
}

/**
 * A reference to the window object
 * @hidden
 */
export const theWindow: ToneWindow | null = typeof self === "object" ? self : null;

/**
 * If the browser has a window object which has an AudioContext
 * @hidden
 */
export const hasAudioContext = theWindow &&
	(theWindow.hasOwnProperty("AudioContext") || theWindow.hasOwnProperty("webkitAudioContext"));

let stdAudioWorkletSupport = true;
export function createAudioWorkletNode(context: AnyAudioContext, name: string, options?: Partial<AudioWorkletNodeOptions>): AudioWorkletNode {
	assert(isDefined(stdAudioWorkletNode), "This node only works in a secure context (https or localhost)");
	// @ts-ignore
	let workletNode:AudioWorkletNode;
	if (stdAudioWorkletSupport && stdAudioWorkletNode) {
		try {
			workletNode = (new stdAudioWorkletNode((context as any) as TContext, name, options) as any);
		} catch (e) {
			stdAudioWorkletSupport = false;
			console.warn('create stdAudioWorkletNode failed', e);
			console.warn('will use native AudioWorkletNode');
			workletNode = new AudioWorkletNode(context, name, options);
		}
	} else {
		workletNode = new AudioWorkletNode(context, name, options);
	}
	// return new stdAudioWorkletNode(context, name, options);
	return workletNode;
}

/**
 * This promise resolves to a boolean which indicates if the 
 * functionality is supported within the currently used browse. 
 * Taken from [standardized-audio-context](https://github.com/chrisguttandin/standardized-audio-context#issupported)
 */
export { isSupported as supported } from "standardized-audio-context";
