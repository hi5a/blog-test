class CusdisCommentsPlugin {
	constructor (API, name, config) {
		this.API = API;
		this.name = name;
		this.config = config;
	}

	addInsertions () {
		this.API.addInsertion('customCommentsCode', this.addPostScripts, 1, this);
	}

	addPostScripts (rendererInstance, context) {
		let url = '';
		let pageTitle = '';
		let uniquePageID = '';
		let cookieBannerGroup = 'text/javascript';
		let consentScriptToLoad = '';
		let consentNotice = '';
		let dataHost = 'https://cusdis.com';
		let cssHeaderClass = ` class="${this.config.cssHeaderClass}"`;
		let cssWrapperClass = ` class="${this.config.cssWrapperClass}"`;
		let cssInnerWrapperClass = ` class="${this.config.cssInnerWrapperClass}"`;

		if (this.config.dataHost) {
			dataHost = this.config.dataHost;
		}

		if (!this.config.cssHeaderClass) {
			cssHeaderClass = '';
		}

		if (!this.config.cssWrapperClass) {
			cssWrapperClass = '';
		}

		if (!this.config.cssInnerWrapperClass) {
			cssInnerWrapperClass = '';
		}

		if (rendererInstance.globalContext && rendererInstance.globalContext.website) {
			url = rendererInstance.globalContext.website.pageUrl;
		}

		if (context && context.post && context.post.id && context.post.title) {
			uniquePageID = context.post.id;
			pageTitle = context.post.title.replace(/"/gmi, '\'');
		} else {
			uniquePageID = url;
		}

		let heading = `
			<h${this.config.headingLevel}${cssHeaderClass}>
		        ${this.config.textHeader}
		    </h${this.config.headingLevel}>
	    `;

	    if (!this.config.textHeader) {
	    	heading = '';
	    }

		let scriptToLoad = `
			(function () {
				var d = document, s = d.createElement('script');
				s.src = '${dataHost}/js/cusdis.es.js';
				s.defer = true;
				(d.head || d.body).appendChild(s);
			})();
		`;

		if (this.config.lazyload) {
			scriptToLoad = `
				var cusdis_element_to_check = document.getElementById('cusdis_thread');

				if ('IntersectionObserver' in window) {
					var iObserver = new IntersectionObserver(
						(entries, observer) => {
							entries.forEach(entry => {
								if (entry.intersectionRatio >= 0.1) {
									(function () {
										var d = document, s = d.createElement('script');
										s.defer = true;
										s.src = '${dataHost}/js/cusdis.es.js';									
										(d.head || d.body).appendChild(s);
									})();
									observer.unobserve(entry.target);
								}
							});
						},
						{
							threshold: [0, 0.2, 0.5, 1]
						}
					);

					iObserver.observe(cusdis_element_to_check);
				} else {
					(function () {
						var d = document, s = d.createElement('script');
						s.defer = true;
						s.src = '${dataHost}/js/cusdis.es.js';
						(d.head || d.body).appendChild(s);
					})();
				}
			`;
		}

		if (this.config.cookieBannerIntegration) {
			cookieBannerGroup = 'gdpr-blocker/' + this.config.cookieBannerGroup.trim();
			consentScriptToLoad = `document.body.addEventListener('publii-cookie-banner-unblock-${this.config.cookieBannerGroup.trim()}', function () {
				document.getElementById('cusdis-no-consent-info').style.display = 'none';
			}, false);`;
			consentNotice = `<div
				data-gdpr-group="${cookieBannerGroup}"
				id="cusdis-no-consent-info" 
				style="background: #f0f0f0; border: 1px solid #ccc; border-radius: 5px; color: #666; display: block; padding: 10px; text-align: center; width: 100%;">
				${this.config.cookieBannerNoConsentText}
			</div>`;
		}

		return `
			<div${cssWrapperClass}>
	            <div${cssInnerWrapperClass}>
	               	${heading}				
					<div 
						id="cusdis_thread"
						data-host="${dataHost}"
						data-app-id="${this.config.dataAppId}"
						data-page-id="${uniquePageID}"
						data-page-url="${url}"
						data-page-title="${pageTitle}"
						data-theme="${this.config.colorScheme}"></div>
					<noscript>
						${this.config.textFallback}
					</noscript>
					${consentNotice}
					<script type="${cookieBannerGroup}">
						${scriptToLoad}
					</script>
					<script type="text/javascript">
						${consentScriptToLoad}
					</script>
				</div>
			</div>
    	`;
	}
}

module.exports = CusdisCommentsPlugin;