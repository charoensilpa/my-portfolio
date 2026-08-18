export function GET() {
	let status;

	if (typeof process === 'undefined') {
		status = 'process is UNDEFINED — Node compatibility not enabled in this Worker';
	} else if (!process.env) {
		status = 'process exists, but process.env is UNDEFINED';
	} else if (!process.env.SANITY_TOKEN) {
		status = 'process.env exists, but SANITY_TOKEN is empty or undefined';
	} else {
		status = `SANITY_TOKEN FOUND — length ${process.env.SANITY_TOKEN.length}`;
	}

	return new Response(JSON.stringify({ status }, null, 2), {
		headers: { 'content-type': 'application/json' }
	});
}