import Foundation
import WebKit

/// `AppSchemeHandler` is a `WKURLSchemeHandler` that serves the locally
/// bundled `WebApp` folder for the custom `meetflow://` URL scheme.
///
/// URL mapping:
///   meetflow://localhost/           → WebApp/index.html   (or index/index.html)
///   meetflow://localhost/login/     → WebApp/login/index.html
///   meetflow://localhost/_next/…    → WebApp/_next/…
///   meetflow://localhost/icon.png   → WebApp/icon.png
///   … etc.
final class AppSchemeHandler: NSObject, WKURLSchemeHandler {

    // MARK: - WKURLSchemeHandler

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        let url = urlSchemeTask.request.url!
        var path = url.path  // e.g. "/login/" or "/_next/static/…"

        // Normalise: strip leading slash for bundle lookup.
        if path.hasPrefix("/") {
            path = String(path.dropFirst())
        }
        if path.isEmpty {
            path = "index.html"
        }

        // Try to resolve the path inside the bundled WebApp folder.
        if let data = loadBundledFile(path: path) {
            respond(task: urlSchemeTask, url: url, data: data, mimeType: mimeType(for: path))
            return
        }

        // Next.js static export with trailingSlash creates `login/index.html`
        // for the `/login` route.  Try appending `index.html`.
        if !path.hasSuffix(".html") {
            let candidate = path.hasSuffix("/") ? "\(path)index.html" : "\(path)/index.html"
            if let data = loadBundledFile(path: candidate) {
                respond(task: urlSchemeTask, url: url, data: data, mimeType: "text/html")
                return
            }
        }

        // Fall back to the root index.html so the SPA router can handle the path.
        if let data = loadBundledFile(path: "index.html") {
            respond(task: urlSchemeTask, url: url, data: data, mimeType: "text/html")
            return
        }

        // Nothing found — return 404.
        let response = HTTPURLResponse(url: url, statusCode: 404, httpVersion: "HTTP/1.1", headerFields: nil)!
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(Data())
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        // Nothing to cancel for synchronous file reads.
    }

    // MARK: - Helpers

    private func loadBundledFile(path: String) -> Data? {
        // Files are expected to live inside a "WebApp" folder that was added to
        // the Xcode project bundle (copy the contents of `./out/` there).
        guard let webAppURL = Bundle.main.url(forResource: "WebApp", withExtension: nil) else {
            return nil
        }
        let fileURL = webAppURL.appendingPathComponent(path)
        return try? Data(contentsOf: fileURL)
    }

    private func respond(
        task: WKURLSchemeTask,
        url: URL,
        data: Data,
        mimeType: String
    ) {
        let headers = [
            "Content-Type": "\(mimeType); charset=utf-8",
            "Content-Length": "\(data.count)",
            "Cache-Control": "no-cache",
        ]
        let response = HTTPURLResponse(
            url: url,
            statusCode: 200,
            httpVersion: "HTTP/1.1",
            headerFields: headers
        )!
        task.didReceive(response)
        task.didReceive(data)
        task.didFinish()
    }

    private func mimeType(for path: String) -> String {
        let ext = (path as NSString).pathExtension.lowercased()
        switch ext {
        case "html":            return "text/html"
        case "css":             return "text/css"
        case "js", "mjs":       return "application/javascript"
        case "json":            return "application/json"
        case "png":             return "image/png"
        case "jpg", "jpeg":     return "image/jpeg"
        case "gif":             return "image/gif"
        case "svg":             return "image/svg+xml"
        case "ico":             return "image/x-icon"
        case "webp":            return "image/webp"
        case "woff":            return "font/woff"
        case "woff2":           return "font/woff2"
        case "ttf":             return "font/ttf"
        case "otf":             return "font/otf"
        case "mp4":             return "video/mp4"
        case "webm":            return "video/webm"
        case "txt":             return "text/plain"
        case "xml":             return "application/xml"
        default:                return "application/octet-stream"
        }
    }
}
