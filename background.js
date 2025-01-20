chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: '',
  })
})

chrome.action.onClicked.addListener(async (tab) => {
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id })

  const nextState = prevState === 'ON' ? '' : 'ON'

  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  })

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['showImageSizes.js'],
  })

  if (nextState === 'ON') {
    chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["showImageSizes.css"],
    })
  } else {
    chrome.scripting.removeCSS({
      target: { tabId: tab.id },
      files: ["showImageSizes.css"],
    })
  }
})
