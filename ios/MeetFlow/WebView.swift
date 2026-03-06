import SwiftUI
import WebKit

/// `WebView` hosts the locally bundled Next.js static export inside a
/// `WKWebView` using a custom URL scheme (`meetflow://`).
///
/// All requests to `meetflow://localhost/` are served from the `WebApp`
/// folder that is bundled inside the app (the output of `scripts/build-ios.sh`).
///
/// JavaScript running in the webview can reach the Next.js backend via the
/// absolute URL stored in `Info.plist` under the key `MEETFLOW_API_BASE`.
/// That value is injected as `window.MEETFLOW_API_BASE` before the page loads,
/// and the `api-client.ts` picks it up automatically.
struct WebView: UIViewRepresentable {

    // MARK: - UIViewRepresentable

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()

        // Register the custom scheme handler so local files are served.
        config.setURLSchemeHandler(AppSchemeHandler(), forURLScheme: "meetflow")

        // Allow the webview to store cookies / local-storage across reloads.
        config.websiteDataStore = WKWebsiteDataStore.default()

        // Inject the backend API base URL so that all /api/* calls are routed
        // to the correct Next.js server regardless of the custom scheme origin.
        let apiBase = Bundle.main.object(forInfoDictionaryKey: "MEETFLOW_API_BASE") as? String ?? ""
        let injectedScript = """
        window.MEETFLOW_API_BASE = '\(apiBase)';
        """
        let userScript = WKUserScript(
            source: injectedScript,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )
        config.userContentController.addUserScript(userScript)

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        // Load the bundled app.
        let startURL = URL(string: "meetflow://localhost/login/index.html")!
        webView.load(URLRequest(url: startURL))

        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    // MARK: - Coordinator

    class Coordinator: NSObject, WKNavigationDelegate {

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            // Allow all navigations within the custom scheme and standard https.
            guard let url = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }
            let scheme = url.scheme ?? ""
            if scheme == "meetflow" || scheme == "https" || scheme == "http" {
                decisionHandler(.allow)
            } else {
                // Open external links (mailto:, tel:, …) in the system handler.
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
            }
        }

        /// When a page-not-found error occurs for a client-side route (the SPA
        /// router handles routing in JS so the HTML file may not exist on disk),
        /// load `/login/index.html` — which contains the full JS bundle and will
        /// bootstrap the SPA router at the correct path.
        func webView(
            _ webView: WKWebView,
            didFail navigation: WKNavigation!,
            withError error: Error
        ) {
            handleNavigationError(webView: webView, error: error)
        }

        func webView(
            _ webView: WKWebView,
            didFailProvisionalNavigation navigation: WKNavigation!,
            withError error: Error
        ) {
            handleNavigationError(webView: webView, error: error)
        }

        private func handleNavigationError(webView: WKWebView, error: Error) {
            // Re-route to the SPA entry point on file-not-found errors so that
            // deep links within the app still resolve correctly.
            let nsError = error as NSError
            guard nsError.domain == "WebKitErrorDomain" || nsError.code == NSURLErrorFileDoesNotExist else { return }
            let fallback = URL(string: "meetflow://localhost/login/index.html")!
            webView.load(URLRequest(url: fallback))
        }
    }
}
