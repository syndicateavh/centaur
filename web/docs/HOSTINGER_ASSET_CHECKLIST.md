# Hostinger static asset checklist

The repository contains no Referer-based access rule. Public JavaScript, CSS, fonts and images must remain accessible when a request has no Referer header.

Before production switch:

1. Upload the contents of `build/client`, including `.htaccess` and the `images` directory.
2. Disable Hostinger hotlink protection for `centaurcareers.in`, or configure it to allow the canonical host, `www`, empty Referer requests and verified crawlers.
3. Review Hostinger CDN/WAF logs for blocked `/assets/`, `/images/` and font requests.
4. Do not apply login, country, bot-challenge or Referer rules to public static extensions.
5. Test representative assets with `GET` and `HEAD`, no Referer, and a Googlebot user agent.
6. Confirm missing assets return 404 rather than the branded HTML document.

Required result: first-party assets return 200 independently of Referer; alternative hosts redirect only page requests to the canonical host; missing assets return 404.
