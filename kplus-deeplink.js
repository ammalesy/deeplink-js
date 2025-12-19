/**
 * K PLUS Deep Link Handler
 * Functions to open K PLUS app with authentication token and handle fallbacks
 * Compatible with Safari iOS 15+ and Android 10+ browsers
 */

// Inject noscript warning to the page
(function() {
  // Create noscript element
  var noscript = document.createElement('noscript');
  var warningDiv = 
    '<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #fff; z-index: 9999; display: flex; justify-content: center; align-items: center; flex-direction: column; padding: 20px; box-sizing: border-box;">' +
    '<h2 style="color: #d32f2f; margin-bottom: 20px;">⚠️ กรุณาเปิดใช้งาน JavaScript</h2>' +
    '<p style="font-size: 16px; text-align: center; margin-bottom: 15px;">เว็บไซต์นี้ต้องการ JavaScript เพื่อการทำงานที่ถูกต้อง</p>' +
    '<p style="font-size: 14px; text-align: center; color: #666;">โปรดเปิดใช้งาน JavaScript ในการตั้งค่าเบราว์เซอร์ของคุณ</p>' +
    '<div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5; border-radius: 8px; max-width: 600px;">' +
    '<h3 style="margin-top: 0;">วิธีเปิดใช้งาน JavaScript:</h3>' +
    '<ul style="text-align: left; line-height: 1.8;">' +
    '<li><strong>Chrome/Edge:</strong> Settings → Privacy and security → Site settings → JavaScript → Allowed</li>' +
    '<li><strong>Firefox:</strong> about:config → javascript.enabled → true</li>' +
    '<li><strong>Safari:</strong> Preferences → Security → Enable JavaScript</li>' +
    '</ul>' +
    '</div>' +
    '</div>';
  
  noscript.innerHTML = warningDiv;
  
  // Insert noscript at the beginning of body when DOM is ready
  if (document.body) {
    document.body.insertBefore(noscript, document.body.firstChild);
  } else {
    // If body is not ready yet, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
      document.body.insertBefore(noscript, document.body.firstChild);
    });
  }
})();

function KPlusDeepLinkHandler() {
  this.huaweiUrl = "https://kplusuat.dra.agconnect.link/?deeplink=https%3A%2F%2Fwww.kasikornbank.com%2Fth%2Fkplus%2Fdeeplinkkplus&android_deeplink=kbank.kplus%3A%2F%2Fauthenwithkplus%3FnextAction%3DNEXT_ACTION_REPLACEMENT%26tokenId%3DTOKEN_ID_REPLACEMENT&android_fallback_url=https%3A%2F%2Fwww.kasikornbank.com%2Fth%2Fkplus%2Fdeeplinkkplus&android_open_type=3&android_package_name=com.kasikorn.retail.mbanking.wap2&campaign_channel=First+Test+HMS&harmonyos_deeplink=kbank.kplus%3A%2F%2Fauthenwithkplus&preview_type=2&landing_page_type=2&region_id=3";
  this.generalUrl = "https://kbank-uat.kasikornbank.com/th/kplus/deeplinkkplus/";
  this.fallbackDuration = 3000; // Duration to wait before fallback (in milliseconds)
  this.fallbackUrl = 'https://kbank-uat.kasikornbank.com/th/kplus/deeplinkkplus/';
  this.scheme = 'kbank.kplus://';

  // Detect WebView/in-app browser using reliable indicators
  this.webViewIndicators = [
    'wv',              // Android WebView identifier (most reliable)
    '; wv)',           // Android WebView in parentheses
    'webview',         // Direct WebView mention
    'fbav',            // Facebook app iOS
    'fban',            // Facebook app Android
    'instagram',       // Instagram app
    'line',           // Line app
    'micromessenger',  // WeChat
    'twitter'          // Twitter app
  ];
}

/**
 * Detect if device is Android
 * @returns {boolean} true if Android device, false otherwise
 */
KPlusDeepLinkHandler.prototype.isAndroidDevice = function() {
  var userAgent = navigator.userAgent.toLowerCase();
  return /android/i.test(userAgent);
};

/**
 * Detect if device is Huawei
 * @returns {boolean} true if Huawei device, false otherwise
 */
KPlusDeepLinkHandler.prototype.isHuaweiDevice = function() {
  var userAgent = navigator.userAgent.toLowerCase();
  return /huawei/i.test(userAgent) || /honor/i.test(userAgent) || /hms/i.test(userAgent);
};

/**
 * Detect if running inside in-app browser (WebView) or user agent contains "DEEPLINKKP"
 * @returns {boolean} true if in-app browser (WebView) or contains DEEPLINKKP, false otherwise
 */
KPlusDeepLinkHandler.prototype.isInappBrowser = function() {
  var userAgent = navigator.userAgent.toLowerCase();
  
  // Check if user agent contains "DEEPLINKKP"
  if (userAgent.indexOf('deeplinkkp') !== -1) {
    return true;
  }
  
  // Check for WebView indicators
  for (var i = 0; i < this.webViewIndicators.length; i++) {
    if (userAgent.indexOf(this.webViewIndicators[i]) !== -1) {
      return true;
    }
  }
  
  // Additional check for Android WebView pattern
  // Android WebView typically has: "Chrome/XX.X.XXXX.XX Mobile Safari/XXX.XX wv"
  if (userAgent.indexOf('android') !== -1 && 
      userAgent.indexOf('chrome') !== -1 && 
      userAgent.indexOf('wv') !== -1) {
    return true;
  }
  
  // Check for iOS in-app browser patterns
  // iOS apps often modify Safari user agent
  if (userAgent.indexOf('iphone') !== -1 || userAgent.indexOf('ipad') !== -1) {
    // If it contains Safari but doesn't contain Version/ it's likely in-app
    if (userAgent.indexOf('safari') !== -1 && userAgent.indexOf('version/') === -1) {
      return true;
    }
  }
  
  return false;
};

/**
 * Parse query parameters from a query string
 * @param {string} queryString - Query string (e.g., "?nextAction=authenwithkplus&tokenId=xxxx")
 * @returns {Object} Object containing parsed parameters
 */
KPlusDeepLinkHandler.prototype.parseQueryParams = function(queryString) {
  var params = {};
  var queryStr = queryString;
  
  // Remove leading '?' if present
  if (queryStr.charAt(0) === '?') {
    queryStr = queryStr.substring(1);
  }
  
  if (queryStr) {
    var pairs = queryStr.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      if (pair.length === 2) {
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
    }
  }
  
  return params;
};

/**
 * Build query string from parameters object
 * @param {Object} params - Parameters object
 * @returns {string} Query string (without leading '?')
 */
KPlusDeepLinkHandler.prototype.buildQueryString = function(params) {
  var pairs = [];
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
  }
  return pairs.join('&');
};

/**
 * Open K PLUS app with query parameters
 * @param {string} queryParams - Query parameters string (e.g., "?nextAction=authenwithkplus&tokenId=xxxx")
 */
KPlusDeepLinkHandler.prototype.openKPlusApp = function(queryParams) {
  if (!queryParams) {
    throw new Error('QueryParams is required');
  }

  // Parse query parameters
  var params = this.parseQueryParams(queryParams);
  var token = params.tokenId;
  var nextAction = params.nextAction;

  if (!token) {
    throw new Error('tokenId parameter is required in queryParams');
  }

  if (!nextAction) {
    throw new Error('nextAction parameter is required in queryParams');
  }

  // Use web URLs or URL scheme based on environment
  var baseUrl;
  var fullUrl;
  
  if (this.isInappBrowser() && (this.isAndroidDevice() || this.isHuaweiDevice())) {
    // For in-app browsers on Android/Huawei devices, use URL scheme with fallback
    var queryString = this.buildQueryString(params);
    var urlScheme = this.scheme + encodeURIComponent(nextAction) + '?' + queryString;
    var self = this;
    var hasNavigated = false;
    
    // Track if the app successfully opens (page becomes hidden)
    function onVisibilityChange() {
      if (document.hidden) {
        hasNavigated = true;
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
    }
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', onVisibilityChange);
    
    // Try URL scheme first
    window.location.href = urlScheme;
    
    // Fallback to web URL if app is not installed (after a delay)
    setTimeout(function() {
      // Only fallback if the app didn't open successfully
      if (!hasNavigated) {
        window.location.href = self.fallbackUrl;
      }
      // Clean up event listener
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }, this.fallbackDuration);
    
    return;
  } else if (this.isHuaweiDevice()) {
    // For Huawei devices, replace placeholders in the URL
    fullUrl = this.huaweiUrl
      .replace('NEXT_ACTION_REPLACEMENT', encodeURIComponent(nextAction))
      .replace('TOKEN_ID_REPLACEMENT', encodeURIComponent(token));
  } else {
    baseUrl = this.generalUrl;
    // Check if URL already has query parameters
    var separator = baseUrl.indexOf('?') !== -1 ? '&' : '?';

    // Build full URL with all parameters
    var queryString = this.buildQueryString(params);
    fullUrl = baseUrl + separator + queryString;
  }
  
  // Navigate directly to the URL (works better with app links in in-app browsers)
  window.location.href = fullUrl;
};

// Create a global instance
var kplusHandler = new KPlusDeepLinkHandler();

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KPlusDeepLinkHandler: KPlusDeepLinkHandler, kplusHandler: kplusHandler };
}

// Function to create and show modal
function createKPlusModal(queryParams) {
  // Create modal overlay
  var modalOverlay = document.createElement('div');
  modalOverlay.id = 'kplus-modal-overlay';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  // Create modal content
  var modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Create modal title
  var modalTitle = document.createElement('h3');
  modalTitle.textContent = 'Open K PLUS App';
  modalTitle.style.cssText = `
    margin: 0 0 16px 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
  `;

  // Create modal message
  var modalMessage = document.createElement('p');
  modalMessage.textContent = 'คุณต้องการเปิดแอป K PLUS หรือไม่?';
  modalMessage.style.cssText = `
    margin: 0 0 24px 0;
    color: #666;
    font-size: 14px;
    line-height: 1.4;
  `;

  // Create button container
  var buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
    justify-content: center;
  `;

  // Create Open K PLUS button
  var openButton = document.createElement('button');
  openButton.textContent = 'Open K PLUS';
  openButton.style.cssText = `
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  `;
  
  // Add hover effect for Open button
  openButton.onmouseover = function() {
    this.style.backgroundColor = '#1565c0';
  };
  openButton.onmouseout = function() {
    this.style.backgroundColor = '#1976d2';
  };

  // Create Close button
  var closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.cssText = `
    background: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  `;
  
  // Add hover effect for Close button
  closeButton.onmouseover = function() {
    this.style.backgroundColor = '#e8e8e8';
  };
  closeButton.onmouseout = function() {
    this.style.backgroundColor = '#f5f5f5';
  };

  // Function to close modal
  function closeModal() {
    if (modalOverlay.parentNode) {
      modalOverlay.parentNode.removeChild(modalOverlay);
    }
  }

  // Add event listeners
  openButton.onclick = function() {
    closeModal();
    kplusHandler.openKPlusApp(queryParams);
  };

  closeButton.onclick = closeModal;

  // Close modal when clicking outside
  modalOverlay.onclick = function(e) {
    if (e.target === modalOverlay) {
      closeModal();
    }
  };

  // Assemble modal
  buttonContainer.appendChild(openButton);
  buttonContainer.appendChild(closeButton);
  modalContent.appendChild(modalTitle);
  modalContent.appendChild(modalMessage);
  modalContent.appendChild(buttonContainer);
  modalOverlay.appendChild(modalContent);

  // Add to document
  document.body.appendChild(modalOverlay);
}

// Display mode constants
window.KPlusDisplayMode = {
  POPUP: 'POPUP',
  DIRECT: 'DIRECT'
};

// Global function for easy access - compatible with older browsers
// displayMode: 'POPUP' for modal popup, 'DIRECT' for direct navigation (default)
window.openKPlus = function(queryParams, displayMode) {
  // Default to DIRECT if displayMode is not provided
  displayMode = displayMode || window.KPlusDisplayMode.DIRECT;
  
  if (displayMode === window.KPlusDisplayMode.POPUP) {
    createKPlusModal(queryParams);
  } else {
    kplusHandler.openKPlusApp(queryParams);
  }
};
