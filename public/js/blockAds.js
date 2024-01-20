/**
 * Updates the block ads rules based on the configuration stored in chrome storage.
 * Fetches the rules from '../rules/blockAds.json' and updates the rules accordingly.
 */
function updateBlockAdsRules() {
    fetch('../rules/blockAds.json')
      .then(response => response.json())
      .then(rules => {
        const ruleIds = rules.map(rule => rule.id);
  
        chrome.storage.sync.get('blockAds', function(result) {
          if (result.blockAds) {
            chrome.declarativeNetRequest.updateDynamicRules({
              addRules: rules
            });
          } else {
            chrome.declarativeNetRequest.updateDynamicRules({
              removeRuleIds: ruleIds
            });
          }
        });
      });
}

export function initUpdateBlockAdsRulesListener() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (changes.blockAds) {
            updateBlockAdsRules();
        }
    });
}