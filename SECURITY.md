# From artwork to CAPTCHA

The visual result is not the test. The test is whether a live session can respond to a fresh, short lived challenge with a plausible stream of perception, movement, correction, and memory. The final specimen adds a concealed recall test after nine live Human versus AI prompts.

## Production protocol

1. A server issues a signed, single use challenge containing a random seed, challenge family, expiry, and difficulty.
2. The seed changes the guide, timing, perturbation, or recall task. A recorded solution should not transfer to another session.
3. The browser samples event timing, trajectory, pauses, corrections, pressure when available, focus changes, and response to live perturbations.
4. Raw motion stays on device. The client derives coarse features, discards the raw stream quickly, and sends a challenge bound feature commitment.
5. The server verifies signature, expiry, replay status, rate limits, feature consistency, and risk signals from the wider session.
6. Challenge families and thresholds rotate. A suspicious session gets another independent task instead of a permanent denial.
7. Accessible alternatives must test liveness without drawing. Examples include keyboard rhythm, switch input timing, or a short semantic memory task.

## Signals that may age better than image recognition

* Reaction to an unpredictable change during the gesture.
* Correction dynamics after the guide moves or partially disappears.
* Short term recall across a delay or interruption.
* Consistency across pointer, focus, navigation, and server timing.
* Cost imposed by single use challenges, rate limits, and layered risk analysis.

## Limits

AI can imitate human looking paths. No fixed drawing, style score, or client side classifier is durable proof. Behavioral data can also become biometric data. Minimize it, make collection explicit, avoid identity matching, keep retention short, and provide an accessible privacy preserving fallback.
