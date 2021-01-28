# How to strengthen a website's overall security

<tt>Author: [favmd](https://github.com/favmd)</tt> <tt>Reviewer: [favph](https://github.com/favph)</tt>

The following document describes some mostly simple steps to strengthen a website's overall security.

**Note, however, that these steps are by no means complete!**

Instead, they are a building block that can be used in conjunction with other security countermeasures.

You are **strongly** encouraged to
- **not** take these steps as a replacement for secure coding, testing and the like,
- **avoid** just copy & pasting the code. Understand what it does. Tweak as needed.

## Table of Contents

- [Add `rel="noopener"` to external `target="_blank"` links](#add-relnoopener-to-external-target_blank-links)
- [Use Google Chrome's *Lighthouse* to follow general best practices](#use-google-chromes-lighthouse-to-follow-general-best-practices)
- [Harden your HTTP response headers with securityheaders.com](#harden-your-http-response-headers-with-securityheaderscom)
  - [Adding / Removing HTTP response headers via PHP](#adding--removing-http-response-headers-via-php)
  - [Adding / Removing HTTP response headers via HAProxy](#adding--removing-http-response-headers-via-haproxy)
- [Enable HTTP Strict Transport Security (HSTS) with a long duration](#enable-http-strict-transport-security-hsts-with-a-long-duration)
- [Add a `Content-Security-Policy` and `X-Content-Security-Policy`](#add-a-content-security-policy-and-x-content-security-policy)
- [SSL Server Test / SSL Configuration Generator](#ssl-server-test--ssl-configuration-generator)
- [Secure your cookies](#secure-your-cookies)

At the end of this document you will find a [TL;DR](#tldr) and tremendously useful [external links](#external-links).

### Add `rel="noopener"` to external `target="_blank"` links

- Gather all `<a>` tags that contain the `target="_blank"` attribute.
- If it is an external link, i.e., not a same-host link, then add `rel="noopener"` so that

```html
<a href="https://www.example.com" target="_blank">
  Example
</a>
```

becomes

```html
<a href="https://www.example.com" target="_blank" rel="noopener">
  Example
</a>
```

See [https://web.dev/external-anchors-use-rel-noopener/](https://web.dev/external-anchors-use-rel-noopener/)
to understand the reasoning behind this.

Visit [https://mathiasbynens.github.io/rel-noopener/](https://mathiasbynens.github.io/rel-noopener/)
to see this attack vector in action. Note, however, that the link might not work in modern browsers
that try to prevent these kinds of attacks. You should add the attribute anyway to protect visitors with older browsers!

### Use Google Chrome's *Lighthouse* to follow general best practices

Use Google Chrome's developer tools (DevTools) regularly!
Have an extra look at *Lighthouse* ([https://developers.google.com/web/tools/lighthouse](https://developers.google.com/web/tools/lighthouse)),
"an open-source, automated tool for improving the quality of web pages" that helps you identify and fix common problems.

### Harden your HTTP response headers with securityheaders.com

Scan your website's HTTP response headers with [https://securityheaders.com](https://securityheaders.com).

securityheaders.com has been created by Scott Helme ([https://scotthelme.co.uk](https://scotthelme.co.uk))
and is the go-to place to check what your server sends, what is missing and what this means security-wise.
Some headers are simple one-liners and really easy to deploy.
Read ["Hardening your HTTP response headers"](https://scotthelme.co.uk/hardening-your-http-response-headers)
to get an overview about different security headers.

Start by adding the following security headers to your HTTP responses:

```http
referrer-policy: same-origin
x-content-type-options: nosniff
x-frame-options: DENY
x-xss-protection: 1; mode=block
```

Next, consider removing the following HTTP response header:

- `x-powered-by`

Finally, consider changing the `server` header (optional, might be a bit tricky).

This should not break anything (you might need to weaken `x-frame-options` to `SAMEORIGIN`)<br>
but be sure to understand what they are doing in case something does not work as intended:
- [referrer-policy](https://scotthelme.co.uk/a-new-security-header-referrer-policy) "will allow a site to control the value of the referer header in links away from their pages"
- [x-content-type-options](https://scotthelme.co.uk/hardening-your-http-response-headers/#x-content-type-options) prevent "mime-sniff[ing] the content-type", to reduce "exposure to drive-by downloads"
- [x-frame-options](https://scotthelme.co.uk/hardening-your-http-response-headers/#x-frame-options) protect "your visitors against clickjacking attacks"
- [x-xss-protection](https://scotthelme.co.uk/hardening-your-http-response-headers/#x-xss-protection) "is used to configure the built in reflective XSS protection found in [some browsers]"
- [x-powered-by](https://scotthelme.co.uk/hardening-your-http-response-headers/#x-powered-by) "gives information on the technology that's supporting the Web Server"
- [server](https://scotthelme.co.uk/hardening-your-http-response-headers/#server) "give[s] information about the particular Web Server application being run on the server"

#### Adding / Removing HTTP response headers via PHP

```php
header("Referrer-Policy: same-origin");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
```

```php
header_remove("X-Powered-By");
```

#### Adding / Removing HTTP response headers via HAProxy

```cfg
http-response set-header Referrer-Policy same-origin
http-response set-header X-Content-Type-Options nosniff
http-response set-header X-Frame-Options DENY
http-response set-header X-XSS-Protection "1; mode=block"
```

```cfg
http-response del-header X-Powered-By
```

### Enable HTTP Strict Transport Security (HSTS) with a long duration

HTTP Strict Transport Security (HSTS) "is a web security policy mechanism that helps
to protect websites against man-in-the-middle attacks such as protocol downgrade attacks
and cookie hijacking." ([Wikipedia](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security))

It does so by enforcing "the use of TLS in a compliant User Agent (UA), such as a web browser." ([Scott Helme](https://scotthelme.co.uk/hsts-the-missing-link-in-tls/))

Simply put, HSTS ensures that you and your visitors use HTTPS when visiting your website.

In its most simple form, all you need to provide is the `max-age`, i.e., the "time, in seconds,
that the browser should remember that a site is only to be accessed using HTTPS."
([MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security))
The longer the better, but it is advised to start low and test that everything is working properly.
From there on you are encouraged to use a `max-age` of at least six months (`15768000`),
but one year (`31536000`) would be a lot better.

Add HSTS via HAProxy (`31536000` = 365 days \* 24 hours \* 60 minutes \* 60 seconds = 1 year in seconds):

```cfg
http-response set-header Strict-Transport-Security "max-age=31536000"
```

or via `.htaccess` file:

```apacheconf
<IfModule mod_headers.c>
  Header set Strict-Transport-Security "max-age=31536000"
</IfModule>
```

Note that there are optional / more advanced directives that you can use to strengthen the HSTS policy even further.

They are not shown here due to the fact that they can cause real damage if you copy & paste them without understanding them.
Please consult [Mozilla's web security guidelines](https://infosec.mozilla.org/guidelines/web_security#http-strict-transport-security)
for further information.

### Add a `Content-Security-Policy` and `X-Content-Security-Policy`

The `Content-Security-Policy` header, a.k.a. the `X-Content-Security-Policy` header in some older browsers
(optional, yet recommended: just send both of them to be on the safe side), is the result of an ongoing effort
to find an effective countermeasure against common web vulnerabilities, particularly against the so-called
[cross-site scripting](https://www.google.com/about/appsecurity/learning/xss/) (XSS) attacks. Simply put,
an XSS bug allows an attacker to inject code into your website that will end up running in your visitor's browser
when they visit your website. Once executed, the code will typically try to steal sensitive data and/or
perform actions on behalf of the user.

Remember the `x-xss-protection` header ([see above](#harden-your-http-response-headers-with-securityheaderscom))?
The `Content-Security-Policy` header is like the successor of this very simplistic approach,
allowing you to specify *exactly* what content your website is allowed to run and under which circumstances
your website is allowed to run. That said, it's clear that the `Content-Security-Policy` is more complex
than just enabling a `x-xss-protection`, but, on the other hand, it will significantly increase
your website's security if done properly.

Due to the fact that the `Content-Security-Policy` is more or less unique to each and every website,
it is pretty tough to present an example that works for everyone and can be copy/pasted. However,
it is very possible to show what worked for us and give you the sources we read to get started:

- Start by reading [https://csp.withgoogle.com](https://csp.withgoogle.com)

You will find a short, yet technical introduction, full of real-world examples, showing you what to do
and what not to do, how to adopt the Content Security Policy (CSP) step-by-step, Frequently Asked Questions,
resources to dig deeper and much more.

- Next: Try it out!

Add a CSP to your website, start the Developer Tools of your favorite modern browser (e.g., the Firefox DevTools)
and inspect the console. There's a good chance that your website looks kind of broken at first glance, but that's okay,
it means that parts of your website violated your newly created CSP and your browser has refused to load those parts,
which is exactly what CSP is all about. It is now up to you to decide whether you
- want to change the CSP to match the blocked parts of your website
- or change the blocked parts of your website to match the CSP.

Whenever you feel lost or uncertain, go to [https://csp-evaluator.withgoogle.com](https://csp-evaluator.withgoogle.com)
and evaluate your CSP. The CSP Evaluator is the go-to place to check your CSP. What you basically want to achieve
is a secure "CSP Version 3" policy that has fallbacks to work in older browsers too ("CSP Version 2" and "CSP Version 1").

To give you an idea of what a secure "CSP Version 3" policy might look like:

```txt
default-src 'none';
base-uri 'none';
object-src 'none';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
form-action 'self';
script-src 'strict-dynamic' https://apps.frontmark.de 'nonce-hIN1tprzGpICXwKE23-rSg';
style-src 'unsafe-inline' 'self';
frame-ancestors 'none'
```

is the policy used at [https://apps.frontmark.de/login](https://apps.frontmark.de/login).
It uses a nonce-based approach to specify what scripts are allowed to run
(see [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src)
for further information). It has no errors and no warnings in "CSP Version 3" and is secure in "CSP Version 2"
and "CSP Version 1" as long as the "URL doesn't serve JSONP replies or Angular libraries."
([CSP Evaluator](https://csp-evaluator.withgoogle.com))

To easily include the Content Security Policy in your website / app, have a closer look at:

- [flask-talisman](https://github.com/GoogleCloudPlatform/flask-talisman) ( Python / Flask )
- [helmetjs](https://helmetjs.github.io) ( JavaScript / Express (React) )

or send a CSP header directly via PHP:

```php
$csp_nonce = base64_encode(random_bytes(16));
$csp = "...; script-src 'nonce-" . $csp_nonce . "' 'unsafe-inline' 'strict-dynamic' https: http:; ...";
header("Content-Security-Policy: " . $csp);
header("X-Content-Security-Policy: " . $csp);
```

```html
<script nonce="<?=$csp_nonce?>" src="..." type="text/javascript"></script>
```

### SSL Server Test / SSL Configuration Generator

To be honest: You could have followed this guide up until this point but you / your visitors might still be vulnerabl
to some critical attacks. This is because of the fact that your website's overall security does not only depend on its own code,
including the headers it sends, but also on the web server serving all of this.

It's obvious that it would go beyond the scope of this document to describe web server security, too,
but you are **strongly** encouraged to at least have a look at the [SSL Server Test](https://www.ssllabs.com/ssltest/)
(Powered by Qualys SSL Labs). It's a great tool that uncovers some common flaws in your SSL (i.e., HTTPS) configuration
and you should definitely aim for getting an A or A+ rating by following some general best practices, such as

- disabling TLS 1.0 and TLS 1.1 :x:
- enabling TLS 1.2 and TLS 1.3 :heavy_check_mark:

If SSL configuration intimidates you, just head over to [https://ssl-config.mozilla.org](https://ssl-config.mozilla.org).
The *Mozilla SSL Configuration Generator* prints out copy-pasteable configs for a variety of Server Software, e.g., HAProxy,
and lets you decide whether you want to be compatible with modern, intermediate or old clients. If unsure, go for intermediate!

Just one more thing: Some of the configs generated by the *Mozilla SSL Configuration Generator* contain a so-called `dhparam` file
and offer you to download one from mozilla.org. This is convenient, but it might be more secure to generate one yourself:

```sh
openssl dhparam -out dhparam 2048
```

### Secure your cookies

Cookies are probably one of the oldest concepts of the World Wide Web, dating back to the 90s of the twentieth century
(see [RFC 2109](https://tools.ietf.org/html/rfc2109) from 1997) - yet they are still more than relevant for modern websites.
Due to the fact that they are oftentimes used for session management, to identify a user and grant them access to a specific service,
it is essential that they are set and used as securely as possible.

For example, the following session cookie will be set by [https://apps.frontmark.de](https://apps.frontmark.de) upon successful login:

(Note that `<uuid4>` is a randomly generated universally unique identifier.)

```http
set-cookie: __Host-auth_token=<uuid4>; Secure; HttpOnly; Path=/; SameSite=Strict
```

It is probably the most secure configuration we have for now<br>
(see [Cookie Security - Myths and Misconceptions](https://owasp.org/www-chapter-london/assets/slides/OWASPLondon20171130_Cookie_Security_Myths_Misconceptions_David_Johansson.pdf) (PDF) by David Johansson (2017)):

- `__Host-` prefixed cookies "must be set with the `secure` flag, must be from a secure page (HTTPS), must not have a domain specified (and therefore aren't sent to subdomains) and the path must be `/`"
- `Secure` cookies are "only sent to the server when a request is made with the `https:` scheme"
- `HttpOnly` forbids "JavaScript from accessing the cookie, for example, through the `Document.cookie` property", to mitigate against [cross-site scripting](https://en.wikipedia.org/wiki/Cross-site_scripting) attacks
- A path of `/` means any path at the host (including all subdirectories)
- `SameSite=Strict` "sends the cookie only for same-site requests (that is, requests originating from the same site that set the cookie)", "providing some protection against [cross-site request forgery](https://en.wikipedia.org/wiki/Cross-site_request_forgery) attacks"

See [the `Set-Cookie` page on MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) for further information (and the quotes from above).

## TL;DR

Here's your executive summary to get you started:

- Add `rel="noopener"` to all external `target="_blank"` links

- Add the following security headers to your HTTP responses:

  ```http
  referrer-policy: same-origin
  x-content-type-options: nosniff
  x-frame-options: DENY
  x-xss-protection: 1; mode=block
  ```

- Remove the `x-powered-by` HTTP response header

- Enable HTTP Strict Transport Security (HSTS) with a long duration: (`31536000` = 1 year)<br>
  **Note, however, that this assumes that you serve your content exclusively via HTTPS!**

  ```http
  strict-transport-security: max-age=31536000
  ```

- Scan your website's HTTP response headers with [https://securityheaders.com](https://securityheaders.com)

- Use the [SSL Server Test](https://www.ssllabs.com/ssltest/) to uncover some common flaws in your SSL (i.e., HTTPS) configuration. At least
  - disable TLS 1.0 and TLS 1.1 :x:
  - enable TLS 1.2 and TLS 1.3 :heavy_check_mark:

- Set cookies as securely as possible, like this:

  ```http
  set-cookie: __Host-<cookie-name>=<cookie-value>; Secure; HttpOnly; Path=/; SameSite=Strict
  ```

If you're done with all that, go to [https://csp.withgoogle.com](https://csp.withgoogle.com) and learn about the Content Security Policy.

## External links

The following resources have been tremendously useful in writing this document:

- [https://securityheaders.com](https://securityheaders.com)
- [https://scotthelme.co.uk](https://scotthelme.co.uk)
- [https://observatory.mozilla.org](https://observatory.mozilla.org)
- [https://csp.withgoogle.com](https://csp.withgoogle.com)
- [https://csp-evaluator.withgoogle.com](https://csp-evaluator.withgoogle.com)
- [https://www.ssllabs.com](https://www.ssllabs.com)
- [https://ssl-config.mozilla.org](https://ssl-config.mozilla.org)
