// When the extension is installed or updated,
// initialize the badge text to empty.
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: '',
  })
})

// Listen for messages from the content script requesting the active state
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_ACTIVE_STATE') {
    // Check current badge text; respond with true if it's 'ON'
    chrome.action
      .getBadgeText({ tabId: sender.tab.id })
      .then((badgeText) => sendResponse(badgeText === 'ON'))

    // Must return true to indicate we will use sendResponse asynchronously
    return true
  }
})

// Listen for clicks on the extension's action button (the icon)
chrome.action.onClicked.addListener(async (tab) => {
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id })
  const nextState = prevState === 'ON' ? '' : 'ON'

  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  })

  // First try to inject the script
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['showImageSizes.js'],
    })

    // Only send message after successful script injection
    try {
      chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_STATE',
        enabled: nextState === 'ON',
      })
    } catch (e) {
      // tab no longer exists
    }
  } catch (e) {
    // script injection failed
  }
})
