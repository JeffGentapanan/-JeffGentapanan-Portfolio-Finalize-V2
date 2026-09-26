export async function api(url, options = {}) {
    const response = await fetch(url, { credentials: 'same-origin', ...options });
    let body;
    try {
        body = await response.json();
    }
    catch {
        throw new Error('Start the portfolio with START PORTFOLIO.cmd to use owner editing.');
    }
    if (!response.ok)
        throw new Error(body.error || 'Request failed.');
    return body;
}
export function jsonRequest(method, body, csrf = '') {
    return { method, headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: JSON.stringify(body) };
}
