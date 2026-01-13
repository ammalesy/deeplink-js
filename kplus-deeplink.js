/**
 * K PLUS Deep Link Handler
 * Functions to open K PLUS app with authentication token and handle fallbacks
 * Compatible with Safari iOS 15+ and Android 10+ browsers
 */

class KPlusNavigationValidationError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} code - Error code
   * @param {string} domain - Exception domain
   */
  constructor(message, code) {
    super(message);
    this.name = 'KPlusNavigationValidationError';
    this.code = code;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, KPlusNavigationValidationError);
    }
  }
}
class KPlusNavigationError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} code - Error code
   * @param {string} domain - Exception domain
   */
  constructor(message, code) {
    super(message);
    this.name = 'KPlusNavigationError';
    this.code = code;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, KPlusNavigationError);
    }
  }
}

function KPlusDeepLinkHandler() {
  this.huaweiUrl = "https://kplusuat.dra.agconnect.link/?deeplink=https%3A%2F%2Fwww.kasikornbank.com%2Fth%2Fkplus%2Fdeeplinkkplus&android_deeplink=kbank.kplus%3A%2F%2FDOMAIN_REPLACEMENT%3FnextAction%3DNEXT_ACTION_REPLACEMENT%26tokenId%3DTOKEN_ID_REPLACEMENT&android_fallback_url=https%3A%2F%2Fwww.kasikornbank.com%2Fth%2Fkplus%2Fdeeplinkkplus&android_open_type=3&android_package_name=com.kasikorn.retail.mbanking.wap2&campaign_channel=First+Test+HMS&harmonyos_deeplink=kbank.kplus%3A%2F%2FDOMAIN_REPLACEMENT&preview_type=2&landing_page_type=2&region_id=3";
  this.generalUrl = "https://kbank-uat.kasikornbank.com/th/kplus/deeplinkkplus/";
  this.fallbackDuration = 3000; // Duration to wait before fallback (in milliseconds)
  this.fallbackUrl = "https://kbank-uat.kasikornbank.com/th/kplus/deeplinkkplus/";
  this.scheme = "kbank.kplus://";

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
  // var userAgent = navigator.userAgent.toLowerCase();
  // return /huawei/i.test(userAgent) || /honor/i.test(userAgent) || /hms/i.test(userAgent);
  return true;
};

/**
 * Detect if browser is MI Browser (Xiaomi/MIUI Browser)
 * @returns {boolean} true if MI Browser, false otherwise
 */
KPlusDeepLinkHandler.prototype.isMIBrowser = function() {
  var userAgent = navigator.userAgent.toLowerCase();
  return /miuibrowser/i.test(userAgent) || /xiaomi.*miuibrowser/i.test(userAgent);
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
 * @param {Function} [onError] - Optional callback function for error handling (receives KPlusNavigationError)
 */
KPlusDeepLinkHandler.prototype.openKPlusApp = function(queryParams, onError) {
  if (!queryParams) {
    throw new KPlusNavigationValidationError('QueryParams is required', 1001);
  }

  // Parse query parameters
  var params = this.parseQueryParams(queryParams);
  var token = params.tokenId;
  var nextAction = params.nextAction;

  if (!token) {
    throw new KPlusNavigationValidationError('tokenId parameter is required in queryParams', 1002);
  }

  if (!nextAction) {
    throw new KPlusNavigationValidationError('nextAction parameter is required in queryParams', 1003);
  }

  // Use web URLs or URL scheme based on environment
  var baseUrl;
  var fullUrl;
  var hasNavigated = false;

  // Track if the app successfully opens (page becomes hidden)
  function onVisibilityChange() {
    if (document.hidden) {
        hasNavigated = true;
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
  }
  
  if ((this.isInappBrowser() && (this.isAndroidDevice() || this.isHuaweiDevice())) || this.isMIBrowser()) {
    // For in-app browsers on Android/Huawei devices, use URL scheme with fallback
    var queryString = this.buildQueryString(params);
    var host = nextAction !== 'authenwithkplus' ? 'actionwithkplus' : 'authenwithkplus';
    var urlScheme = this.scheme + host + '?' + queryString;
    var self = this;
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', onVisibilityChange);
    
    try {
      // Try URL scheme first
      window.location.href = urlScheme;
    } catch (error) {
      var navError = new KPlusNavigationError(
        "K PLUS app is not installed or cannot be opened.",
        1000
      );
      if (onError) {
        onError(navError);
      }
      return;
    }
    
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
    // Determine domain based on nextAction value
    var domain = nextAction !== 'authenwithkplus' ? 'actionwithkplus' : 'authenwithkplus';
    
    fullUrl = this.huaweiUrl
      .replace(/DOMAIN_REPLACEMENT/g, domain)
      .replace(/NEXT_ACTION_REPLACEMENT/g, encodeURIComponent(nextAction))
      .replace(/TOKEN_ID_REPLACEMENT/g, encodeURIComponent(token));
  } else {
    baseUrl = this.generalUrl;
    // Check if URL already has query parameters
    var separator = baseUrl.indexOf('?') !== -1 ? '&' : '?';

    // Build full URL with all parameters
    var queryString = this.buildQueryString(params);
    fullUrl = baseUrl + separator + queryString;
  }

  // Listen for page visibility changes
  document.addEventListener('visibilitychange', onVisibilityChange);
  
  // Navigate directly to the URL (works better with app links in in-app browsers)
  try {
    window.location.href = fullUrl;
  } catch (error) {
    var navError = new KPlusNavigationError(
      "K PLUS app is not installed or cannot be opened.",
      1000
    );
    if (onError) {
      onError(navError);
    }
    return;
  }

  // Fallback check if app is not installed (after a delay)
  setTimeout(function() {
    // Clean up event listener
    document.removeEventListener('visibilitychange', onVisibilityChange);

    // Only trigger error callback if the app didn't open successfully
    if (!hasNavigated && onError) {
      var navError = new KPlusNavigationError(
        "K PLUS app is not installed or cannot be opened.",
        1000
      );
      onError(navError);
    }
    
  }, this.fallbackDuration);
};

// Create a global instance
var kplusHandler = new KPlusDeepLinkHandler();

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KPlusDeepLinkHandler: KPlusDeepLinkHandler, kplusHandler: kplusHandler };
}

// Function to create and show modal
function createKPlusModal(queryParams, onError) {
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
    border-radius: 12px;
    padding: 24px;
    max-width: 320px;
    width: 90%;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Create modal title
  var modalTitle = document.createElement('h3');
  modalTitle.textContent = 'Open this page in "K PLUS"?';
  modalTitle.style.cssText = `
    margin: 0 0 24px 0;
    color: #000;
    font-size: 17px;
    font-weight: 600;
    text-align: left;
  `;

  // Create button container
  var buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 24px;
  `;

  // Create Cancel link
  var cancelLink = document.createElement('a');
  cancelLink.textContent = 'Cancel';
  cancelLink.href = '#';
  cancelLink.style.cssText = `
    color: #007AFF;
    text-decoration: none;
    font-size: 17px;
    font-weight: 400;
    cursor: pointer;
  `;
  
  // Add hover effect for Cancel link
  cancelLink.onmouseover = function() {
    this.style.opacity = '0.6';
  };
  cancelLink.onmouseout = function() {
    this.style.opacity = '1';
  };

  // Create Open link
  var openLink = document.createElement('a');
  openLink.textContent = 'Open';
  openLink.href = '#';
  openLink.style.cssText = `
    color: #007AFF;
    text-decoration: none;
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
  `;
  
  // Add hover effect for Open link
  openLink.onmouseover = function() {
    this.style.opacity = '0.6';
  };
  openLink.onmouseout = function() {
    this.style.opacity = '1';
  };

  // Function to close modal
  function closeModal() {
    if (modalOverlay.parentNode) {
      modalOverlay.parentNode.removeChild(modalOverlay);
    }
  }

  // Add event listeners
  openLink.onclick = function(e) {
    e.preventDefault();
    closeModal();
    kplusHandler.openKPlusApp(queryParams, onError);
  };

  cancelLink.onclick = function(e) {
    e.preventDefault();
    closeModal();
  };

  // Close modal when clicking outside
  modalOverlay.onclick = function(e) {
    if (e.target === modalOverlay) {
      closeModal();
    }
  };

  // Assemble modal
  buttonContainer.appendChild(cancelLink);
  buttonContainer.appendChild(openLink);
  modalContent.appendChild(modalTitle);
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
// onError: optional callback function that receives KPlusNavigationError
window.openKPlus = function(queryParams, displayMode, onError) {
  // Support both (queryParams, displayMode, onError) and (queryParams, onError) signatures
  if (typeof displayMode === 'function') {
    onError = displayMode;
    displayMode = window.KPlusDisplayMode.DIRECT;
  }
  
  // Default to DIRECT if displayMode is not provided
  displayMode = displayMode || window.KPlusDisplayMode.DIRECT;
  
  if (displayMode === window.KPlusDisplayMode.POPUP) {
    createKPlusModal(queryParams, onError);
  } else {
    kplusHandler.openKPlusApp(queryParams, onError);
  }
};
